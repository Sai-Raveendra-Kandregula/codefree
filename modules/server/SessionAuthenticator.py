from fastapi import HTTPException, Request, status
from sqlalchemy.orm import Session

from modules.server.definitions import UserData
from modules.server.db_definitions.users import User, UserSession
from modules.server.database import engine

def get_user_session(request : Request):
    session_id = request.cookies.get("cf_session_id")
    if session_id is not None:
        db_session = Session(engine)
        user_session : UserSession = db_session.query(UserSession).filter(UserSession.session_id == session_id).scalar()
        if user_session is not None and user_session.session_expired():
            db_session.delete(user_session)
            db_session.commit()
            user_session = None
        db_session.close()
        return user_session
    return None

def get_user_data(request : Request):
    user_session : UserSession = get_user_session(request)
    if user_session is not None:
        db_session = Session(engine)
        user_data : User = db_session.get(User, user_session.user_name)
        db_session.close()
        return UserData(**user_data.as_dict())
    return None

def auth_required(request : Request):
    user_session : UserSession = get_user_session(request)
    if user_session is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return True
