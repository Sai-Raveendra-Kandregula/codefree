import subprocess

from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
from contextvars import ContextVar

from .routers.v1 import v1_router
from modules.server.common import logger, APP_CONF_FILE, APP_DATA_PATH, ROOT_PATH_MID_URL
from modules.server.db_engine import get_engine, Session

app = FastAPI()
db_session: ContextVar[Session] = ContextVar('db_session')

origins = ["localhost:3000", "*"]

middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
]

logger.info("Base URL : " + (ROOT_PATH_MID_URL if len(ROOT_PATH_MID_URL) > 0 else "/"))
logger.info("Data Path : " + APP_DATA_PATH)
logger.info("Config File : " + APP_CONF_FILE)

app = FastAPI(
    middleware=middleware,
    root_path=f"{ROOT_PATH_MID_URL}",
    root_path_in_servers=f"{ROOT_PATH_MID_URL}",
    openapi_prefix="/-",
    docs_url="/docs"
)

@app.middleware("http")
async def add_db_session(request : Request, call_next):
    engine = get_engine()
    db_session = Session(engine)
    request.state.db_session = db_session
    response = await call_next(request)
    db_session.close()
    return response

app.mount("/v1", v1_router, name="API v1")

app.mount("/current", v1_router, name="Current API")