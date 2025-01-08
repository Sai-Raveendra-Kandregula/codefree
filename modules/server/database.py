from modules.server.db_definitions.users import *
from modules.server.db_definitions.projects import *
from modules.server.db_definitions.common import CodeFreeBase

from modules.server.common import mkdir_p, logger

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

engine = create_engine(f"sqlite:////opt/codefree/codefree.sqlite", echo=False)

def init_db():
    logger.info("Initialising DB...")

    mkdir_p('/opt/codefree')

    logger.info(f"Using /opt/codefree/codefree.sqlite as database")

    CodeFreeBase.metadata.create_all(engine)

    logger.info("DB Initialisation done.")