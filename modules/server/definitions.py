from enum import Enum
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class SessionData(BaseModel):
    username: str

class UserLogin(BaseModel):
    username: str
    password: str
    keepSignedIn : bool = False

class UserData(BaseModel):
    id: int
    user_name: str
    initials : Optional[str] = Field(None)
    display_name: Optional[str] = Field(None)
    email: str
    created_on: datetime
    created_by: str
    updated_on: datetime
    updated_by: str

class ProjectData(BaseModel):
    id : Optional[int] = Field(None, description="Project ID")
    slug : str
    name : str

class ReportData(BaseModel):
    id : Optional[int] = Field(None, description="Report ID")
    project_id : str
    tags : Optional[List[str]] = Field([], description="Report Tags")
    report : dict

class User_Permission():
    display : str

class User_Role(Enum):
    VIEWER = 0,
    PROJECT_ADMIN = 7,
    SYSTEM_ADMIN = 15,