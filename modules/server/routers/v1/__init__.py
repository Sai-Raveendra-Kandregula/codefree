from fastapi import APIRouter

from modules.server.routers.v1.users import usersRouter
from modules.server.routers.v1.projects import projectsRouter
from modules.server.routers.v1.gitlab import gitlabRouter

v1_router = APIRouter(
    prefix="/v1"
)

@v1_router.get("/")
def api_ping_check():
    return {}

v1_router.include_router(usersRouter)
v1_router.include_router(projectsRouter)
v1_router.include_router(gitlabRouter)