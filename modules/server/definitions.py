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
    user_name: str
    display_name: str = Field(None)
    avatar_color: str
    is_user_admin: Optional[bool] = Field(False)
    email: str
    created_on: Optional[datetime] = Field(None)
    created_by: Optional[str] = Field(None)
    updated_on: Optional[datetime] = Field(None)
    updated_by: Optional[str] = Field(None)

class NewUserData(BaseModel):
    user_name: str
    email: str
    password : str
    invite_token : Optional[str] = Field(None)
    is_user_admin : Optional[bool] = Field(False)
    created_on: datetime
    created_by: str

class ProjectData(BaseModel):
    id : Optional[int] = Field(None, description="Project ID")
    slug : str
    name : str

class ProjectConfig(BaseModel):
    slug : str
    git_repo : Optional[dict] = Field(None)

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