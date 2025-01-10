
from fastapi import APIRouter, Depends, Request, Response

from modules.server.SessionAuthenticator import auth_required
from modules.server.database import get_db_session, Session
from modules.server.db_definitions.projects import Project, Report

from modules.server.routers.projects.common import getProject
from modules.server.routers.projects.reports.router import reportsRouter

projectsSpecificRouter = APIRouter(
    dependencies=[Depends(auth_required)],
    prefix="/{slug}"
)

@projectsSpecificRouter.get("/")
def get_project(
    request: Request, response: Response, project: Project = Depends(getProject)
):
    return project.as_dict()

projectsSpecificRouter.include_router(reportsRouter)