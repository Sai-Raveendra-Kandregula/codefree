from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy import func

from modules.server.SessionAuthenticator import auth_required, get_user_data
from modules.server.database import get_db_session, Session
from modules.server.db_definitions.projects import Project, Report
from modules.server.definitions import ProjectData, UserData

projectsBaseRouter = APIRouter(
    dependencies=[Depends(auth_required)],
    prefix="/-"
)

@projectsBaseRouter.post("/create")
def create_project(
    project: ProjectData,
    request: Request,
    response: Response,
    user_data: UserData = Depends(get_user_data),
    db_session : Session = Depends(get_db_session)
):
    if not user_data.is_user_admin and user_data.read_only:
        response.status_code = status.HTTP_403_FORBIDDEN
        return {}

    existing = Project.get_project_by_slug(db_session, project.slug)
    if existing is not None:
        response.status_code = status.HTTP_409_CONFLICT
        return {}

    max_project_id = db_session.query(func.max(Project.id)).scalar()
    project.id = max_project_id + 1

    db_session.add(
        Project(
            id=project.id,
            name=project.name,
            slug=project.slug,
            avatar_color=Project.generateAvatarColor(),
            git_remote_url=project.git_remote_url,
            git_remote_commit_url=project.git_remote_commit_url,
        )
    )
    db_session.commit()

    response.status_code = status.HTTP_201_CREATED
    return {}


@projectsBaseRouter.get("/all")
def get_all_projects(
    request: Request,
    response: Response,
    user_data: UserData = Depends(get_user_data),
    db_session : Session = Depends(get_db_session)
):
    projects_all_query_out = db_session.query(Project).all()
    out = []
    if projects_all_query_out is not None:
        # out = [ project.as_dict() for project in projects_all_query_out ]
        for project in projects_all_query_out:
            project_out = project.as_dict()
            report : Report = Report.get(db_session, project.id, "last-report")
            if report is not None:
                stats = report.as_dict()
                stats["report_id"] = stats.pop("id")
                project_out.update(stats)
            out.append(project_out)
    return out

