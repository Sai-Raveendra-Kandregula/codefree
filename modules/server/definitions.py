from enum import Enum
from pydantic import BaseModel

class SessionData(BaseModel):
    username: str

class UserData(BaseModel):
    username: str
    password: str
    keepSignedIn : bool = False

class User_Permission():
    display : str

class User_Role(Enum):
    VIEWER = 0,
    PROJECT_ADMIN = 7,
    SYSTEM_ADMIN = 15,