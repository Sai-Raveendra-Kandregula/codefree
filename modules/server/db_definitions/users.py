from typing import List
import datetime
import os
from typing import Optional
from sqlalchemy import String, DateTime, Boolean
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from modules.server.db_definitions.common import CodeFreeBase
from modules.server.common import APP_DATA_PATH, mkdir_p

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
    email: Mapped[str] = mapped_column(String(30))
    avatar_color : Mapped[str] = mapped_column(String(7))
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
   
class PendingUser(CodeFreeBase):
    __tablename__ = "pendinguser"

    user_name: Mapped[str] = mapped_column(String(30), primary_key=True)
    display_name: Mapped[str] = mapped_column(String(30))
    email: Mapped[str] = mapped_column(String(30))
    avatar_color : Mapped[str] = mapped_column(String(7))
    is_user_admin: Mapped[Boolean] = mapped_column(Boolean())
    password_salt: Mapped[Optional[str]] = mapped_column(String(36)) # UUID
    password_hash: Mapped[Optional[str]] = mapped_column(String(64)) # SHA512 Hash of Password + Salt
    invite_token: Mapped[Optional[str]] = mapped_column(String(36)) # Invite Token (UUID)
    invite_expires_in: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime())
    created_on: Mapped[datetime.datetime] = mapped_column(DateTime())
    created_by: Mapped[str] = mapped_column(String(30))

    def __repr__(self) -> str:
        return f"User(user_name={self.user_name!r})"
    
    def as_dict(self):
        return {
            "user_name" : self.user_name,
            "display_name" : self.display_name,
            "email" : self.email,
            "avatar_color" : self.avatar_color,
            "created_on" : self.created_on.timestamp() * 1000, # sec to milli sec for JS Usage
            "created_by" : self.created_by,
        }
   