
from fastapi import APIRouter, Depends

from modules.server.SessionAuthenticator import auth_required

from .common import getProject, Project
from .reports import reportsRouter

projectsSpecificRouter = APIRouter(
    dependencies=[Depends(auth_required)],
    prefix="/{slug}"
)

@projectsSpecificRouter.get("/")
def project_get(
    project: Project = Depends(getProject)
):
    return project.as_dict()

projectsSpecificRouter.include_router(reportsRouter)