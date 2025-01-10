import os
import datetime
from uuid import UUID, uuid4
import randomcolor
from fastapi import APIRouter, Request, Response, Depends, status

from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from modules.server.common import (
    is_valid_base64_image,
)
from modules.server.db_definitions.users import *

from modules.server.database import get_db_session
from modules.server.SessionAuthenticator import (
    auth_required,
    get_user_session,
    get_user_data,
)
from modules.server.definitions import UserLogin, UserData, NewUserData

SESSION_EXPIRY = 24 * 3600  # 24 hours

def authenticate_user(
    userdata: UserLogin, request: Request, response: Response,
) -> status:
    db_session : Session = get_db_session(request)
    user_info_db: User = User.get_user_by_username(db_session=db_session, username=userdata.username)
    if user_info_db is None:
        return (
            status.HTTP_401_UNAUTHORIZED
        )  # Should be 404, but changed to 401 to prevent information leaks

    session_id = request.cookies.get("cf_session_id", None)
    if session_id is not None:
        user_session: UserSession = (
            db_session.query(UserSession)
            .where(UserSession.user_name.is_(userdata.username))
            .where(UserSession.session_id.is_(session_id))
            .first()
        )
        if (
            user_session is not None
            and user_session.session_end > datetime.datetime.now(datetime.timezone.utc)
        ):
            return session_id
        elif user_session is not None:
            db_session.delete(user_session)
            db_session.commit()

    if (
        getPasswordHash(userdata.password, user_info_db.password_salt)
        == user_info_db.password_hash
    ):
        session_id = str(uuid4())
        now = datetime.datetime.now(datetime.timezone.utc)
        expiry = now + datetime.timedelta(seconds=SESSION_EXPIRY)
        db_session.add(
            UserSession(
                user_name=user_info_db.user_name,
                session_id=session_id,
                session_start=now,
                session_end=expiry,
                last_activity=now,
                session_ip=request.client.host,
                session_user_agent=request.headers.get("User-Agent", ""),
            )
        )
        db_session.commit()
        response.set_cookie(
            key="cf_session_id", value=session_id, max_age=SESSION_EXPIRY, httponly=True
        )
        return session_id
    return None


usersRouter = APIRouter()

@usersRouter.post("/user/sign-in")
async def create_session(
    userdata: UserLogin, request: Request, response: Response,
):
    session_id = authenticate_user(
        userdata=userdata, request=request, response=response
    )
    if session_id is None:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return {}

    return {"message": f"{userdata.username} signed in successfully!"}


@usersRouter.post("/user/sign-out")
async def del_session(
    response: Response, session: UserSession = Depends(get_user_session),
    db_session : Session = Depends(get_db_session)
):
    if session is not None:
        db_session.delete(session)
        db_session.commit()
        response.delete_cookie(key="cf_session_id")
    return {"message": f"User Signed Out"}


@usersRouter.get("/user/validate")
async def whoami(
    response: Response,
    user_data: UserData = Depends(get_user_data),
    required: bool = Depends(auth_required),
    db_session : Session = Depends(get_db_session)
):
    user_info_db: User = (
        db_session.query(User).where(User.user_name.is_(user_data.user_name)).scalar()
    )

    if user_info_db is not None:
        return user_info_db.as_dict()
    else:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return {}


@usersRouter.get("/user/userdata/{userid}")
async def getUserByID(
    request: Request,
    response: Response,
    user_data: UserData = Depends(get_user_data),
    required: bool = Depends(auth_required),
    db_session : Session = Depends(get_db_session)
):
    user_info_db: User = (
        db_session.query(User)
        .where(User.user_name.is_(request.path_params.get("userid")))
        .scalar()
    )

    out = {}

    if user_info_db is not None:
        out = user_info_db.as_dict()
    else:
        response.status_code = status.HTTP_404_NOT_FOUND

    return out


@usersRouter.post("/user/modify")
async def getUserByID(
    newData: UserData,
    request: Request,
    response: Response,
    user_data: UserData = Depends(get_user_data),
    required: bool = Depends(auth_required),
    db_session : Session = Depends(get_db_session)
):
    if not user_data.is_user_admin and user_data.read_only:
        response.status_code = status.HTTP_403_FORBIDDEN
        return {}

    user_info_db: User = (
        db_session.query(User).where(User.user_name.is_(newData.user_name)).scalar()
    )

    if user_info_db is not None:
        if user_info_db.user_name == user_data.user_name or user_data.is_user_admin:
            user_info_db.display_name = newData.display_name
            user_info_db.email = newData.email
            user_info_db.updated_by = user_data.user_name
            user_info_db.updated_on = datetime.datetime.now(datetime.timezone.utc)
            if newData.avatar_data is not None:
                try:
                    base64_portion = newData.avatar_data.split(
                        "base64,",
                    )[1]
                    is_valid_base64_image(base64_portion)
                    with open(
                        getUserAvatarPath(user_name=user_info_db.user_name), "w"
                    ) as avatar_file:
                        avatar_file.write(newData.avatar_data)
                    db_session.commit()
                    if db_session.is_modified(user_info_db):
                        response.status_code = status.HTTP_304_NOT_MODIFIED
                except Exception as e:
                    response.status_code = status.HTTP_400_BAD_REQUEST
                    return newData
            out = user_info_db.as_dict()
            return out
        else:
            response.status_code = status.HTTP_403_FORBIDDEN
            return newData
    else:
        response.status_code = status.HTTP_404_NOT_FOUND
        return newData


@usersRouter.get("/user/all")
async def all_users(
    user_data: UserData = Depends(get_user_data),
    required: bool = Depends(auth_required),
    db_session : Session = Depends(get_db_session)
):
    users = db_session.query(User).all()
    return [user.as_dict() for user in users]


@usersRouter.get("/user/all-pending")
async def all_pending_users(
    user_data: UserData = Depends(get_user_data),
    required: bool = Depends(auth_required),
    db_session : Session = Depends(get_db_session)
):
    users = db_session.query(PendingUser).all()

    return [user.as_dict() for user in users]


@usersRouter.post("/user/invite")
async def invite_user(
    new_user: NewUserData,
    response: Response,
    user_data: UserData = Depends(get_user_data),
    required: bool = Depends(auth_required),
    db_session : Session = Depends(get_db_session)
):
    if not user_data.is_user_admin and user_data.read_only:
        response.status_code = status.HTTP_403_FORBIDDEN
        return {}

    # Check if user_data has permission to invite users

    pass


@usersRouter.post("/user/delete")
async def delete_user_acc(
    user: NewUserData,
    response: Response,
    user_data: UserData = Depends(get_user_data),
    required: bool = Depends(auth_required),
    db_session : Session = Depends(get_db_session)
):

    if not user_data.is_user_admin and user_data.read_only:
        response.status_code = status.HTTP_403_FORBIDDEN
        return {}

    # Check if cuurent user can delete this user
    if (user.user_name == user_data.user_name) or (not user_data.is_user_admin):
        response.status_code = status.HTTP_403_FORBIDDEN
        return user

    user_db = db_session.query(User).where(User.user_name.is_(user.user_name)).scalar()

    if user_db is None:
        response.status_code = status.HTTP_404_NOT_FOUND
        return user

    db_session.delete(user_db)
    db_session.commit()
    return user


@usersRouter.post("/user/create-account")
async def create_user_acc(
    new_user: NewUserData, response: Response,
    db_session : Session = Depends(get_db_session)
):
    # Check if users can sign-up
    user_info_db = User.get_user_by_username(db_session, new_user.user_name)
    if user_info_db is not None:
        response.status_code = status.HTTP_409_CONFLICT
        return {"message": "User with given Username already exists"}

    user_info_db = db_session.query(User).where(User.email.is_(new_user.email)).scalar()
    if user_info_db is not None:
        response.status_code = status.HTTP_409_CONFLICT
        return {"message": "User with given Email Address already exists"}

    db_session.add(
        PendingUser(
            user_name=new_user.user_name,
            display_name=new_user.display_name,
            email=new_user.email,
            avatar_color=User.generateUserAvatarColor(),
            is_user_admin=new_user.is_user_admin,
            read_only=new_user.read_only,
            password_salt="",
            password_hash="",
            invite_token=new_user.invite_token,
            created_on=datetime.datetime.now(datetime.timezone.utc),
            created_by=new_user.user_name,
        )
    )
    db_session.commit()
    return {}
