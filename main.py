#! /usr/bin/env python

import dotenv

from modules.server.db_definitions.projects import Project
from modules.server.db_definitions.users import User
dotenv.load_dotenv(dotenv_path=dotenv.find_dotenv())

import uvicorn
import logging
import os
import uvicorn.logging
from uvicorn.supervisors import ChangeReload, Multiprocess

from modules.server.common import DEFAULT_USER, DEFAULT_USER_EMAIL, DEFAULT_PASS

from modules.server.database import init_db, get_engine, Session

PORT=9000

VERSION = open("VERSION", "r").read()

docker_env=os.getenv('IN_DOCKER', False)
dev_env=(os.getenv('ENVIRONMENT', 'PROD') != 'PROD')

def check_pid(pid):
    """ Check For the existence of a unix pid. """
    try:
        os.kill(pid, 0)
    except OSError:
        return False
    else:
        return True

if __name__ == "__main__":    
    uvicorn_conf = uvicorn.Config(app="modules.server:app", host="0.0.0.0", port=PORT, reload=dev_env)
    server = uvicorn.Server(config=uvicorn_conf)
    logger = logging.getLogger('uvicorn.error')

    logger.info(f"CodeFree v{VERSION}")
    
    def run_fastapi():
        if uvicorn_conf.should_reload:
            sock = uvicorn_conf.bind_socket()
            ChangeReload(uvicorn_conf, target=server.run, sockets=[sock]).run()
        elif uvicorn_conf.workers > 1:
            sock = uvicorn_conf.bind_socket()
            Multiprocess(uvicorn_conf, target=server.run, sockets=[sock]).run()
        else:
            return server.run()
    init_db()
    db_session = Session(get_engine())
    User.create_default_user(
        db_session=db_session,
        default_user=DEFAULT_USER, 
        default_user_email=DEFAULT_USER_EMAIL, 
        default_pass=DEFAULT_PASS
    )
    if dev_env:
        Project.createTestProject(db_session=db_session)
    db_session.close()
    run_fastapi()