import os
import errno
import json
import dotenv
import logging
from fastapi import FastAPI

from modules.server.routers.users import usersRouter
from modules.server.routers.projects import projectsRouter
from modules.server.routers.gitlab import gitlabRouter

from modules.server.common import logger, APP_NAME, AUTHOR, CONTACT_EMAIL, APP_DATA_PATH, APP_CONF_FILE


def serve_codefree_backend(app:FastAPI):
    app.include_router(usersRouter, prefix='/api')
    app.include_router(projectsRouter, prefix='/api')
    app.include_router(gitlabRouter, prefix='/api')
    
    logger.info("Data Path : " + APP_DATA_PATH)
    logger.info("Config File : " + APP_CONF_FILE)

    @app.get("/api/greetings")
    def codefree_greeting():
        return { "name" : APP_NAME, "author" : AUTHOR, "contact" : CONTACT_EMAIL }
    
    return app