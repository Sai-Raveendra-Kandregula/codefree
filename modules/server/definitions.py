from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field

class SessionData(BaseModel):
    username: str

class UserData(BaseModel):
    username: str
    password: str
    keepSignedIn : bool = False

class ProjectData(BaseModel):
    id : Optional[int] = Field(None, description="Project ID")
    name : str

class User_Permission():
    display : str

class User_Role(Enum):
    VIEWER = 0,
    PROJECT_ADMIN = 7,
    SYSTEM_ADMIN = 15,