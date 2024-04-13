import subprocess

from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI

from cf_gui_frontend import serve_react_app
from cf_gui_backend import serve_codefree_backend

app = FastAPI()

origins = ["*"]

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

path_to_react_app_build_dir = "./frontend/build"
app = serve_codefree_backend(app)
# app = serve_react_app(app, path_to_react_app_build_dir)