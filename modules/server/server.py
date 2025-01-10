import subprocess

from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
from contextvars import ContextVar

from modules.server.cf_gui_backend import serve_codefree_backend
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

app = FastAPI(middleware=middleware)

@app.middleware("http")
async def add_db_session(request : Request, call_next):
    engine = get_engine()
    db_session = Session(engine)
    request.state.db_session = db_session
    response = await call_next(request)
    db_session.close()
    return response

path_to_react_app_build_dir = "./frontend/build"
app = serve_codefree_backend(app)