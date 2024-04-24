from db_definitions.projects import ProjectsBase

from modules.server.common import APP_DATA_PATH, mkdir_p, logger

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

engine = create_engine(f"sqlite:///{APP_DATA_PATH}/codefree.sqlite", echo=False)

def init_db():
    logger.info("Initialising DB...")

    mkdir_p(APP_DATA_PATH)

    logger.info(f"Using {APP_DATA_PATH}/codefree.sqlite as database")

    ProjectsBase.metadata.create_all(engine)

    logger.info("DB Initialisation done.")