import os
import json
from datetime import datetime, timezone

from fastapi import APIRouter, Request, Response, status, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse, JSONResponse

from modules.output import out_xlsx
from modules.output import out_csv
from modules.cf_checker import CheckerStats, CheckerOutput, CheckerTypes, CheckerSeverity, ComplianceStandards
from modules import cf_output

from modules.server.SessionAuthenticator import verifier, cookie, backend
from modules.server.definitions import UserData, UserLogin, ProjectData, ReportData

from modules.server.common import logger, DATA_PATH, APP_DATA_PATH, mkdir_p

from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from modules.server.database import engine
from modules.server.db_definitions.projects import Project, Report

gitlabRouter = APIRouter()