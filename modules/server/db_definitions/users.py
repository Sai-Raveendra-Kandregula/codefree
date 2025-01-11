import errno
from typing import List
import datetime
import os
from typing import Optional
from sqlalchemy import String, DateTime, Boolean
from sqlalchemy.orm import Mapped, Session
from sqlalchemy.orm import mapped_column
import randomcolor

from .common import CodeFreeBase

APP_DATA_PATH='/opt/codefree'

def mkdir_p(path): # mkdir -p implementation
    try:
        os.makedirs(path)
    except OSError as exc: # Python >2.5
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else: raise

def generateInviteToken() -> str:
    import uuid
    return str(uuid.uuid4())

def generateSalt() -> str:
    import uuid
    return str(uuid.uuid4())

def getPasswordHash(password : str, salt : str) -> str:
    import hashlib
    return hashlib.sha512((password + salt).encode('utf-8')).hexdigest()

def getUserAvatarPath(user_name : str):
    path = os.path.join(APP_DATA_PATH, 'users', 'avatars')
    mkdir_p(path)
    return os.path.join(path, user_name)

class User(CodeFreeBase):
    __tablename__ = "user"

    user_name: Mapped[str] = mapped_column(String(30), primary_key=True)
    display_name: Mapped[str] = mapped_column(String(30))
    email: Mapped[str] = mapped_column(String(30), unique=True)
    avatar_color : Mapped[str] = mapped_column(String(7))
    read_only : Mapped[Boolean] = mapped_column(Boolean())
    is_user_admin: Mapped[Boolean] = mapped_column(Boolean())
    password_salt: Mapped[str] = mapped_column(String(36)) # UUID
    password_hash: Mapped[str] = mapped_column(String(64)) # SHA512 Hash of Password + Salt
    created_on: Mapped[datetime.datetime] = mapped_column(DateTime())
    created_by: Mapped[str] = mapped_column(String(30))
    updated_on: Mapped[datetime.datetime] = mapped_column(DateTime())
    updated_by: Mapped[str] = mapped_column(String(30))

    def __repr__(self) -> str:
        return f"User(user_name={self.user_name!r})"
    
    def as_dict(self):
        out = {
            "user_name" : self.user_name,
            "display_name" : self.display_name,
            "email" : self.email,
            "avatar_color" : self.avatar_color,
            "is_user_admin" : self.is_user_admin,
            "read_only" : self.read_only,
            "created_on" : self.created_on.timestamp() * 1000, # sec to milli sec for JS Usage
            "created_by" : self.created_by,
            "updated_on" : self.updated_on.timestamp() * 1000, # sec to milli sec for JS Usage
            "updated_by" : self.updated_by,
        }

        avatar_path = getUserAvatarPath(user_name=self.user_name)
        if(os.path.exists(avatar_path)):
            with open(avatar_path, "r") as avatar:
                out['avatar_data'] = avatar.read()
        else:
            out['avatar_data'] = None

        return out
    
    @staticmethod
    def generateUserAvatarColor():
        rand_color = randomcolor.RandomColor()
        return rand_color.generate(luminosity="dark")[0]
    
    @classmethod
    def create_default_user(cls, 
                        db_session : Session,
                        default_user : str,
                        default_user_email : str,
                        default_pass : str,
    ):
        # Testing
        def_user = db_session.query(cls).count()
        if def_user == 0:
            salt = generateSalt()
            pwd_hash = getPasswordHash(default_pass, salt)
            db_session.add(
                User(
                    user_name=default_user,
                    display_name="System Admin",
                    email=default_user_email,
                    avatar_color=cls.generateUserAvatarColor(),
                    is_user_admin=True,
                    read_only=False,
                    password_salt=salt,
                    password_hash=pwd_hash,
                    created_on=datetime.datetime.now(datetime.timezone.utc),
                    created_by=default_user,
                    updated_on=datetime.datetime.now(datetime.timezone.utc),
                    updated_by=default_user,
                )
            )
            db_session.commit()
    
    @classmethod
    def get_user_by_username(cls, db_session :  Session, username : str):
        return db_session.query(User).where(User.user_name.is_(username)).scalar()

class PendingUser(CodeFreeBase):
    __tablename__ = "pendinguser"

    user_name: Mapped[Optional[str]] = mapped_column(String(30), default=None, unique=True)
    display_name: Mapped[Optional[str]] = mapped_column(String(30), default=None)
    email: Mapped[str] = mapped_column(String(30), primary_key=True, unique=True)
    avatar_color : Mapped[str] = mapped_column(String(7))
    is_user_admin: Mapped[Boolean] = mapped_column(Boolean())
    read_only : Mapped[Boolean] = mapped_column(Boolean())
    password_salt: Mapped[Optional[str]] = mapped_column(String(36), default=None) # UUID
    password_hash: Mapped[Optional[str]] = mapped_column(String(64), default=None) # SHA512 Hash of Password + Salt
    invite_token: Mapped[Optional[str]] = mapped_column(String(36), default=None, unique=True) # Invite Token (UUID)
    created_on: Mapped[datetime.datetime] = mapped_column(DateTime())
    created_by: Mapped[str] = mapped_column(String(30))

    def __repr__(self) -> str:
        return f"User(email={self.email!r})"
    
    def as_dict(self):
        out = {
            "email" : self.email,
            "avatar_color" : self.avatar_color,
            "created_on" : self.created_on.timestamp() * 1000, # sec to milli sec for JS Usage
            "created_by" : self.created_by,
        }

        if(self.user_name is not None):
            out["user_name"] = self.user_name
        if(self.display_name is not None):
            out["display_name"] = self.display_name

        return out

class UserSession(CodeFreeBase):
    __tablename__ = "usersession"

    session_id: Mapped[str] = mapped_column(String(36), primary_key=True, unique=True)
    user_name: Mapped[str] = mapped_column(String(30))
    session_start: Mapped[datetime.datetime] = mapped_column(DateTime())
    session_end: Mapped[datetime.datetime] = mapped_column(DateTime())
    session_ip: Mapped[str] = mapped_column(String(15))
    session_user_agent: Mapped[str] = mapped_column(String(255))
    last_activity: Mapped[datetime.datetime] = mapped_column(DateTime())

    def __repr__(self) -> str:
        return f"UserSession(user_name={self.user_name!r}, session_id={self.session_id!r})"
    
    @classmethod
    def get_session(cls, db_session : Session, session_id : str):
        return db_session.query(cls).where(cls.session_id.is_(session_id)).scalar()
    
    def session_expired(self) -> bool:
        return self.session_end < datetime.datetime.now()
    
    def as_dict(self):
        return {
            "user_name" : self.user_name,
            "session_id" : self.session_id,
            "session_start" : self.session_start.timestamp() * 1000, # sec to milli sec for JS Usage
            "session_end" : self.session_end.timestamp() * 1000, # sec to milli sec for JS Usage
            "session_ip" : self.session_ip,
            "session_user_agent" : self.session_user_agent,
            "last_activity" : self.last_activity.timestamp() * 1000, # sec to milli sec for JS Usage
        }