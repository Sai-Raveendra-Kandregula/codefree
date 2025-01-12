import datetime
from fastapi import APIRouter, Request, Response, Depends, status, HTTPException

from sqlalchemy.orm import Session

from modules.server.common import (
    is_valid_base64_image,
    logger
)
from modules.server.db_definitions.users import *

from modules.server.database import get_db_session
from modules.server.SessionAuthenticator import (
    auth_required,
    get_user_session,
    get_user_data,
)
from modules.server.definitions import UserData, NewUserData

def getUser(request : Request):
    user_id = request.path_params.get("userid")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID Missing")
        
    db_session = get_db_session(request=request)
    
    user_info_db: User = (
        db_session.query(User)
        .where(User.user_name.is_(user_id))
        .scalar()
    )
    if user_info_db is not None:
        return user_info_db
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User Not Found")

userSpecificRouter = APIRouter(
    prefix="/{userid}",
    dependencies=[Depends(auth_required), Depends(getUser)]
)

@userSpecificRouter.get("")
async def user_get(
    user : User = Depends(getUser),
):
    return user.as_dict()

@userSpecificRouter.delete("")
async def user_delete(
    response: Response,
    user: User = Depends(getUser),
    user_data: UserData = Depends(get_user_data),
    db_session : Session = Depends(get_db_session)
):
    if not user_data.is_user_admin and user_data.read_only:
        response.status_code = status.HTTP_403_FORBIDDEN
        return {}

    # Check if cuurent user can delete this user
    if (user.user_name == user_data.user_name) or (not user_data.is_user_admin):
        response.status_code = status.HTTP_403_FORBIDDEN
        return user

    db_session.delete(user)
    db_session.commit()
    return {}


@userSpecificRouter.post("/modify")
async def user_modify(
    newData: UserData,
    request: Request,
    response: Response,
    user : User = Depends(getUser),
    user_data: UserData = Depends(get_user_data),
    db_session : Session = Depends(get_db_session)
):
    if not user_data.is_user_admin and user_data.read_only:
        response.status_code = status.HTTP_403_FORBIDDEN
        return {}

    if user is not None:
        if user.user_name == user_data.user_name or user_data.is_user_admin:
            user.display_name = newData.display_name
            user.email = newData.email
            user.updated_by = user_data.user_name
            user.updated_on = datetime.datetime.now(datetime.timezone.utc)
            if newData.avatar_data is not None and len(newData.avatar_data.strip()) > 0:
                try:
                    base64_portion = newData.avatar_data.split(
                        "base64,",
                    )[1]
                    is_valid_base64_image(base64_portion)
                    with open(
                        getUserAvatarPath(user_name=user.user_name), "w"
                    ) as avatar_file:
                        avatar_file.write(newData.avatar_data)
                except Exception as e:
                    logger.error(e)
                    response.status_code = status.HTTP_400_BAD_REQUEST
                    return {}
            if not db_session.is_modified(user):
                response.status_code = status.HTTP_304_NOT_MODIFIED
            db_session.commit()
            out = user.as_dict()
            return out
        else:
            response.status_code = status.HTTP_403_FORBIDDEN
            return newData
    else:
        response.status_code = status.HTTP_404_NOT_FOUND
        return newData
