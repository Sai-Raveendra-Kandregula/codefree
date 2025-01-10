
from fastapi import APIRouter, Depends, Request, Response

from modules.server.SessionAuthenticator import auth_required

from .common import getProject, Project
from .reports import reportsRouter

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