import os
import datetime
from uuid import UUID, uuid4
from fastapi import APIRouter, Response, Depends, status

from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from modules.server.db_definitions.users import User, getPasswordHash, generateSalt

from modules.server.database import engine 
from modules.server.SessionAuthenticator import verifier, cookie, backend
from modules.server.definitions import UserLogin, UserData, NewUserData, User_Role

USER_DATA = {
    "admin" : {
        "password" : "admin@123",
        "role" : User_Role.SYSTEM_ADMIN
    }
}

# Testing
db_session = Session(engine)
def_user = db_session.query(User).where(User.user_name.is_('admin')).scalar()
if def_user is None:
    user_id = db_session.query(func.coalesce(func.max(User.id), 0)).scalar() + 1
    salt = generateSalt()
    pwd_hash = getPasswordHash("admin@123", salt)
    db_session.add(User(
        id=user_id,
        user_name="admin",
        email="sairaveendrakandregula@gmail.com",
        password_salt=salt,
        password_hash=pwd_hash,
        created_on=datetime.datetime.now(),
        created_by="admin",
        updated_on=datetime.datetime.now(),
        updated_by="admin",
    ))
    db_session.commit()
db_session.close()

def authenticate_user(userdata : UserLogin) -> status:
    db_session = Session(engine)

    user_info_db : User = db_session.query(User).where(User.user_name.is_(userdata.username)).scalar()
    if user_info_db is None:
        db_session.close()
        return status.HTTP_404_NOT_FOUND

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
async def whoami(user_data: UserData = Depends(verifier)):
    return user_data

@usersRouter.get("/user/all-users", dependencies=[Depends(cookie)])
async def all_users(user_data: UserData = Depends(verifier)):
    return User.objects.all()


@usersRouter.post("/user/invite-user", dependencies=[Depends(cookie)])
async def invite_user(new_user : NewUserData, response: Response, user_data: UserData = Depends(verifier)):
    db_session = Session(engine)

    # Check if user_data has permission to invite users



    db_session.close()
    pass

@usersRouter.post("/user/create-account")
async def create_user_acc(new_user : NewUserData, response: Response):
    db_session = Session(engine)

    # Check if users can sign-up

    db_session.close()
    pass

