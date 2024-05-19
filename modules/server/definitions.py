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
    avatar_color: Optional[str] = Field(None)
    avatar_data: Optional[str] = Field(None)
    is_user_admin: Optional[bool] = Field(False)
    read_only: Optional[bool] = Field(False)
    email: str
    created_on: Optional[datetime] = Field(None)
    created_by: Optional[str] = Field(None)
    updated_on: Optional[datetime] = Field(None)
    updated_by: Optional[str] = Field(None)

class NewUserData(BaseModel):
    user_name: str
    email: Optional[str] = Field(None)
    password : Optional[str] = Field(None)
    invite_token : Optional[str] = Field(None)
    is_user_admin : Optional[bool] = Field(False)
    read_only: Optional[bool] = Field(False)
    created_on: Optional[datetime] = Field(None)
    created_by: Optional[str] = Field(None)

class ProjectData(BaseModel):
    id : Optional[int] = Field(None, description="Project ID")
    slug : str
    name : str
    git_remote_url : Optional[str] = Field(None)
    git_remote_commit_url : Optional[str] = Field(None)

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