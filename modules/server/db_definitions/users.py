from typing import List
from typing import Optional
from sqlalchemy import String, DateTime, Boolean
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from modules.server.db_definitions.common import CodeFreeBase

def generateInviteToken() -> str:
    import uuid
    return str(uuid.uuid4())

def generateSalt() -> str:
    import uuid
    return str(uuid.uuid4())

def getPasswordHash(password : str, salt : str) -> str:
    import hashlib
    return hashlib.sha512((password + salt).encode('utf-8')).hexdigest()


class User(CodeFreeBase):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_name: Mapped[str] = mapped_column(String(30), primary_key=True)
    initials : Mapped[Optional[str]] = mapped_column(String(3))
    display_name: Mapped[Optional[str]] = mapped_column(String(30))
    email: Mapped[str] = mapped_column(String(30))
    is_user_admin: Mapped[Boolean] = mapped_column(Boolean())
    password_salt: Mapped[str] = mapped_column(String(36)) # UUID
    password_hash: Mapped[str] = mapped_column(String(64)) # SHA512 Hash of Password + Salt
    created_on: Mapped[DateTime] = mapped_column(DateTime())
    created_by: Mapped[str] = mapped_column(String(30))
    updated_on: Mapped[DateTime] = mapped_column(DateTime())
    updated_by: Mapped[str] = mapped_column(String(30))

    def __repr__(self) -> str:
        return f"User(user_name={self.user_name!r})"
    
    def as_dict(self):
        return {
            "id" : self.id,
            "user_name" : self.user_name,
            "initials" : self.initials,
            "display_name" : self.display_name,
            "email" : self.email,
            "is_user_admin" : self.is_user_admin,
            "created_on" : self.created_on,
            "created_by" : self.created_by,
            "updated_on" : self.updated_on,
            "updated_by" : self.updated_by,
        }
   
class PendingUser(CodeFreeBase):
    __tablename__ = "pendinguser"

    user_name: Mapped[str] = mapped_column(String(30), primary_key=True)
    email: Mapped[str] = mapped_column(String(30))
    is_user_admin: Mapped[Boolean] = mapped_column(Boolean())
    password_salt: Mapped[Optional[str]] = mapped_column(String(36)) # UUID
    password_hash: Mapped[Optional[str]] = mapped_column(String(64)) # SHA512 Hash of Password + Salt
    invite_token: Mapped[Optional[str]] = mapped_column(String(36)) # Invite Token (UUID)
    invite_expires_in: Mapped[Optional[DateTime]] = mapped_column(DateTime())
    created_on: Mapped[DateTime] = mapped_column(DateTime())
    created_by: Mapped[str] = mapped_column(String(30))

    def __repr__(self) -> str:
        return f"User(user_name={self.user_name!r})"
    
    def as_dict(self):
        return {
            "user_name" : self.user_name,
            "email" : self.email,
            "created_on" : self.created_on,
            "created_by" : self.created_by,
        }
   