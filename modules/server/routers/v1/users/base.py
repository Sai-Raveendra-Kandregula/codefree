import datetime
from fastapi import APIRouter, Request, Response, Depends, status

from sqlalchemy.orm import Session

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
from modules.server.definitions import UserData, NewUserData

userBaseRouter = APIRouter(
    prefix="/-",
    dependencies=[Depends(auth_required)]
)

@userBaseRouter.get("/validate")
async def user_validate(
    response: Response,
    user_data: UserData = Depends(get_user_data),
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

@userBaseRouter.post("/sign-out")
async def user_signout(
    response: Response, 
    session: UserSession = Depends(get_user_session),
    db_session : Session = Depends(get_db_session)
):
    if session is not None:
        db_session.delete(session)
        db_session.commit()
        response.delete_cookie(key="cf_session_id")
    return {"message": f"User Signed Out"}

@userBaseRouter.get("/all")
async def user_all(
    user_data: UserData = Depends(get_user_data),
    db_session : Session = Depends(get_db_session)
):
    users = db_session.query(User).all()
    return [user.as_dict() for user in users]

@userBaseRouter.get("/all-pending")
async def pending_users_all(
    user_data: UserData = Depends(get_user_data),
    db_session : Session = Depends(get_db_session)
):
    users = db_session.query(PendingUser).all()

    return [user.as_dict() for user in users]


@userBaseRouter.post("/invite")
async def user_invite(
    new_user: NewUserData,
    response: Response,
    user_data: UserData = Depends(get_user_data),
    db_session : Session = Depends(get_db_session)
):
    if not user_data.is_user_admin and user_data.read_only:
        response.status_code = status.HTTP_403_FORBIDDEN
        return {}

    # Check if user_data has permission to invite users

    pass
