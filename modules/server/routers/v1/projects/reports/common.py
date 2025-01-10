
from fastapi import HTTPException, Request

from modules.server.common import logger
from modules.server.database import get_db_session, Session
from modules.server.db_definitions.projects import Report
from ..common import getProject

def getReport(request: Request):
    project = getProject(request)
    
    report_id = None
    if "report_id" in request.path_params:
        report_id = request.path_params["report_id"]
    elif "report_id" in request.query_params:
        report_id = request.query_params["report_id"]

    if report_id is not None:
        db_session = get_db_session(request)
        out = Report.get(db_session, project.id, report_id)
        if out is not None:
            return out

    raise HTTPException(status_code=404, detail="Report Not Found")
