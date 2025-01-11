from fastapi import APIRouter, FastAPI

from modules.server.common import APP_NAME, AUTHOR, CONTACT_EMAIL
from modules.server.routers.v1.users import usersRouter
from modules.server.routers.v1.projects import projectsRouter
from modules.server.routers.v1.gitlab import gitlabRouter

v1_router = FastAPI()

@v1_router.get("/")
def api_ping_check():
    return { "name" : APP_NAME, "author" : AUTHOR, "contact" : CONTACT_EMAIL }

v1_router.include_router(usersRouter)
v1_router.include_router(projectsRouter)
v1_router.include_router(gitlabRouter)