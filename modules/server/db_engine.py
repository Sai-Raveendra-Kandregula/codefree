from sqlalchemy import create_engine
from sqlalchemy.orm import Session

engine = None

def get_engine():
    global engine
    if engine is None:
        engine = create_engine(f"sqlite:////opt/codefree/codefree.sqlite", echo=False)
    return engine