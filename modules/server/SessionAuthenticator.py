from fastapi import HTTPException, Request, status
from sqlalchemy.orm import Session

from modules.server.definitions import UserData
from modules.server.db_definitions.users import User, UserSession
from modules.server.database import get_db_session

def get_user_session(request : Request):
    db_session : Session = get_db_session(request)
    session_id = request.cookies.get("cf_session_id")
    if session_id is not None:
        user_session : UserSession = db_session.query(UserSession).filter(UserSession.session_id == session_id).scalar()
        if user_session is not None and user_session.session_expired():
            db_session.delete(user_session)
            db_session.commit()
            user_session = None
        return user_session
    return None

def get_user_data(request : Request):
    db_session : Session = get_db_session(request)
    user_session : UserSession = get_user_session(request)
    if user_session is not None:
        user_data : User = db_session.get(User, user_session.user_name)
        return UserData(**user_data.as_dict())
    return None

def auth_required(request : Request):
    user_session : UserSession = get_user_session(request)
    if user_session is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return True
