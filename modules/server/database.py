from fastapi import HTTPException, Request, status
from modules.server.db_definitions.users import *
from modules.server.db_definitions.projects import *
from modules.server.db_definitions.common import CodeFreeBase

from modules.server.common import mkdir_p, logger

from modules.server.db_engine import get_engine

from sqlalchemy.orm import Session

engine = get_engine()

def get_db_session(request : Request) -> Session:
    session = getattr(request.state, 'db_session')
    if session is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="DB Connection Failed")
    return session

def init_db():
    logger.info("Initialising DB...")
    
    # engine = get_engine()

    mkdir_p('/opt/codefree')

    logger.info(f"Using /opt/codefree/codefree.sqlite as database")

    CodeFreeBase.metadata.create_all(engine)

    logger.info("DB Initialisation done.")