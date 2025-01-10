from fastapi import APIRouter, Depends

from modules.server.SessionAuthenticator import auth_required
from .base import projectsBaseRouter
from .project_specific import projectsSpecificRouter

projectsRouter = APIRouter(
    dependencies=[Depends(auth_required)],
    prefix="/project"
)

projectsRouter.include_router(projectsBaseRouter)
projectsRouter.include_router(projectsSpecificRouter)