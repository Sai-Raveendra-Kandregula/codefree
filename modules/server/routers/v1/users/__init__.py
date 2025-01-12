import os
import datetime
from uuid import uuid4
from fastapi import APIRouter, Request, Response, Depends, status

from sqlalchemy.orm import Session

from modules.server.db_definitions.users import *

from modules.server.database import get_db_session
from modules.server.definitions import UserLogin, NewUserData

from .base import userBaseRouter
from .user_specific import userSpecificRouter

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


usersRouter = APIRouter(
    prefix="/user"
)


@usersRouter.post("/sign-up")
async def user_signup(
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

@usersRouter.post("/sign-in")
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

usersRouter.include_router(userBaseRouter)
usersRouter.include_router(userSpecificRouter)