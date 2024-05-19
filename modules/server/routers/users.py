import os
import datetime
from uuid import UUID, uuid4
import randomcolor
from fastapi import APIRouter, Request, Response, Depends, status

from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from modules.server.common import DEFAULT_USER, DEFAULT_USER_EMAIL, DEFAULT_PASS, APP_DATA_PATH, mkdir_p, is_valid_base64_image
from modules.server.db_definitions.users import User, PendingUser, getPasswordHash, generateSalt, getUserAvatarPath

from modules.server.database import engine 
from modules.server.SessionAuthenticator import verifier, cookie, backend
from modules.server.definitions import UserLogin, UserData, NewUserData

rand_color = randomcolor.RandomColor()

def generateUserAvatarColor():
    return rand_color.generate(luminosity='dark')[0]

# Testing
db_session = Session(engine)
def_user = db_session.query(User).count()
if def_user == 0:
    salt = generateSalt()
    pwd_hash = getPasswordHash(DEFAULT_PASS, salt)
    db_session.add(User(
        user_name=DEFAULT_USER,
        display_name="System Admin",
        email=DEFAULT_USER_EMAIL,
        avatar_color=rand_color.generate(luminosity='dark')[0],
        is_user_admin = True,
        read_only = False,
        password_salt=salt,
        password_hash=pwd_hash,
        created_on=datetime.datetime.now(datetime.timezone.utc),
        created_by=DEFAULT_USER,
        updated_on=datetime.datetime.now(datetime.timezone.utc),
        updated_by=DEFAULT_USER,
    ))
    db_session.add(User(
        user_name="test",
        display_name="Test User",
        email="test@example.com",
        avatar_color=rand_color.generate(luminosity='dark')[0],
        is_user_admin = False,
        read_only = True,
        password_salt=salt,
        password_hash=pwd_hash,
        created_on=datetime.datetime.now(datetime.timezone.utc),
        created_by=DEFAULT_USER,
        updated_on=datetime.datetime.now(datetime.timezone.utc),
        updated_by=DEFAULT_USER,
    ))
    db_session.commit()
db_session.close()

def authenticate_user(userdata : UserLogin) -> status:
    db_session = Session(engine)

    user_info_db : User = db_session.query(User).where(User.user_name.is_(userdata.username)).scalar()
    if user_info_db is None:
        db_session.close()
        return status.HTTP_401_UNAUTHORIZED # Should be 404, but changed to 401 to prevent information leaks

    if getPasswordHash(userdata.password, user_info_db.password_salt) == user_info_db.password_hash:
        db_session.close()
        return status.HTTP_200_OK
    db_session.close()
    return status.HTTP_401_UNAUTHORIZED

usersRouter = APIRouter()

@usersRouter.post("/user/sign-in")
async def create_session(userdata : UserLogin, response: Response):
    auth_output = authenticate_user(userdata=userdata)
    if auth_output != status.HTTP_200_OK:
        response.status_code = auth_output
        return {
            "message" : str(auth_output)
        }
    
    db_session = Session(engine)

    user_info_db : User = db_session.query(User).where(User.user_name.is_(userdata.username)).scalar()

    session = uuid4()
    sessiondata = UserData.parse_obj(user_info_db.as_dict())

    await backend.create(session, sessiondata)
    if not userdata.keepSignedIn:
        cookie.cookie_params.max_age = (24 * 3600) # One day if user does not want to stay signed in
    else:
        cookie.cookie_params.max_age = (399 * 24 * 3600) # If user wants to stay signed in, set maximum max-age (400 days)
    cookie.attach_to_response(response, session)

    db_session.close()

    return {
        "message" : f"{userdata.username} signed in successfully!"
    }

@usersRouter.post("/user/sign-out")
async def del_session(response: Response, session_id: UUID = Depends(cookie)):
    if (await backend.read(session_id=session_id) is not None):
        await backend.delete(session_id)
    cookie.delete_from_response(response)
    return {
        "message" : f"User Signed Out"
    }

@usersRouter.get("/user/validate", dependencies=[Depends(cookie)])
async def whoami(response : Response, user_data: UserData = Depends(verifier)):
    db_session = Session(engine)

    user_info_db : User = db_session.query(User).where(User.user_name.is_(user_data.user_name)).scalar()

    if(user_info_db is not None):
        db_session.close()
        return user_info_db.as_dict()
    else:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return {}

@usersRouter.get("/user/userdata/{userid}", dependencies=[Depends(cookie)])
async def getUserByID(request : Request, response: Response, user_data: UserData = Depends(verifier)):
    db_session = Session(engine)

    user_info_db : User = db_session.query(User).where(User.user_name.is_(request.path_params.get('userid'))).scalar()

    out = {}

    db_session.close()

    if(user_info_db is not None):
        out = user_info_db.as_dict()
    else:
        response.status_code = status.HTTP_404_NOT_FOUND

    return out
    
@usersRouter.post("/user/modify", dependencies=[Depends(cookie)])
async def getUserByID(newData : UserData , request : Request, response: Response, user_data: UserData = Depends(verifier)):
    if(not user_data.is_user_admin and user_data.read_only):
        response.status_code = status.HTTP_403_FORBIDDEN
        return {}
    
    db_session = Session(engine)

    user_info_db : User = db_session.query(User).where(User.user_name.is_(newData.user_name)).scalar()

    if(user_info_db is not None):
        if(user_info_db.user_name == user_data.user_name or user_data.is_user_admin):
            user_info_db.display_name = newData.display_name
            user_info_db.email = newData.email
            user_info_db.updated_by = user_data.user_name
            user_info_db.updated_on = datetime.datetime.now(datetime.timezone.utc)
            if (newData.avatar_data is not None):
                try:
                    base64_portion = newData.avatar_data.split('base64,',)[1]
                    is_valid_base64_image(base64_portion)
                    with open(getUserAvatarPath(user_name=user_info_db.user_name), "w") as avatar_file:
                        avatar_file.write(newData.avatar_data)
                    db_session.commit()
                    if(db_session.is_modified(user_info_db)):
                        response.status_code = status.HTTP_304_NOT_MODIFIED
                except Exception as e:
                    db_session.close()
                    response.status_code = status.HTTP_400_BAD_REQUEST
                    return newData
            out = user_info_db.as_dict()
            db_session.close()
            return out
        else:
            response.status_code = status.HTTP_403_FORBIDDEN
            db_session.close()
            return newData
    else:
        response.status_code = status.HTTP_404_NOT_FOUND
        db_session.close()
        return newData

@usersRouter.get("/user/all", dependencies=[Depends(cookie)])
async def all_users(user_data: UserData = Depends(verifier)):
    db_session = Session(engine)

    users = db_session.query(User).all()

    db_session.close()

    return [user.as_dict() for user in users]

@usersRouter.get("/user/all-pending", dependencies=[Depends(cookie)])
async def all_pending_users(user_data: UserData = Depends(verifier)):
    db_session = Session(engine)

    users = db_session.query(PendingUser).all()

    db_session.close()

    return [user.as_dict() for user in users]

@usersRouter.post("/user/invite", dependencies=[Depends(cookie)])
async def invite_user(new_user : NewUserData, response: Response, user_data: UserData = Depends(verifier)):
    if(not user_data.is_user_admin and user_data.read_only):
        response.status_code = status.HTTP_403_FORBIDDEN
        return {}

    db_session = Session(engine)
    # Check if user_data has permission to invite users
    

    db_session.close()
    pass

@usersRouter.post("/user/delete", dependencies=[Depends(cookie)])
async def create_user_acc(user : NewUserData, response: Response, user_data: UserData = Depends(verifier)):

    if(not user_data.is_user_admin and user_data.read_only):
        response.status_code = status.HTTP_403_FORBIDDEN
        return {}

    # Check if cuurent user can delete this user
    if ((user.user_name == user_data.user_name) or (not user_data.is_user_admin)):
        response.status_code = status.HTTP_403_FORBIDDEN
        return user

    db_session = Session(engine)

    user_db = db_session.query(User).where(User.user_name.is_(user.user_name)).scalar()

    if(user_db is None):
        db_session.close()
        response.status_code = status.HTTP_404_NOT_FOUND
        return user

    db_session.delete(user_db)
    db_session.commit()
    db_session.close()
    return user

@usersRouter.post("/user/create-account")
async def create_user_acc(new_user : NewUserData, response: Response):
    db_session = Session(engine)

    # Check if users can sign-up
    user_info_db = db_session.query(User).where(User.user_name.is_(new_user.user_name)).scalar()
    if(user_info_db is not None):        
        response.status_code = status.HTTP_409_CONFLICT
        db_session.close()
        return {
            'message' : 'User with given Username already exists'
        }
    
    user_info_db = db_session.query(User).where(User.email.is_(new_user.email)).scalar()
    if(user_info_db is not None):        
        response.status_code = status.HTTP_409_CONFLICT
        db_session.close()
        return {
            'message' : 'User with given Email Address already exists'
        }

    db_session.add(PendingUser(
        user_name=new_user.user_name,
        display_name= new_user.display_name,
        email=new_user.email,
        avatar_color=generateUserAvatarColor(),
        is_user_admin=new_user.is_user_admin,
        read_only=new_user.read_only,
        password_salt="",
        password_hash="",
        invite_token=new_user.invite_token,
        created_on=datetime.datetime.now(datetime.timezone.utc),
        created_by=new_user.user_name
    ))
    db_session.commit()
    db_session.close()
    return {}
