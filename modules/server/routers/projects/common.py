
from fastapi import HTTPException, Request

from modules.server.database import get_db_session
from modules.server.db_definitions.projects import Project


def getProject(request: Request):
    slug = None
    if "slug" in request.path_params:
        slug = request.path_params["slug"]
    elif "project_id" in request.query_params:
        slug = request.query_params["project_id"]

    if slug is not None:
        db_session = get_db_session(request)
        out = Project.get_project_by_slug(db_session, slug)
        if out is not None:
            return out

    raise HTTPException(status_code=404, detail="Project Not Found")
