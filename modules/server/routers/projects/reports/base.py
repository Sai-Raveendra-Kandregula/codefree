import datetime
import json
import os
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import func

from modules.server.SessionAuthenticator import get_user_data
from modules.server.common import APP_DATA_PATH, SERVER_URL
from modules.server.database import get_db_session, Session
from modules.server.db_definitions.projects import Project, Report
from modules.server.definitions import ReportData, UserData
from modules.server.routers.projects.common import getProject


reportsBaseRouter = APIRouter(
    prefix="/-"
)

def saveReportFile(report: dict, destination_file: str):
    dest = open(destination_file, "w")
    json.dump(obj=report, fp=dest)
    dest.close()

@reportsBaseRouter.get("/all")
def get_project_all_reports(
    request: Request, response: Response, 
    project: Project = Depends(getProject),
    db_session : Session = Depends(get_db_session)
):
    reports_all_query = db_session.query(Report).where(
        Report.project_id.is_(project.id)
    )
    reports_all_query_out = reports_all_query.all()
    out = []
    if reports_all_query_out is not None:
        out = [report.as_dict() for report in reports_all_query_out]
    return out

@reportsBaseRouter.get("/count")
def get_project_report_count(
    request: Request, response: Response, 
    project: Project = Depends(getProject),
    db_session : Session = Depends(get_db_session)
):
    return {"count": Report.get_report_count(db_session, project.id)}

@reportsBaseRouter.post("/upload", status_code=status.HTTP_201_CREATED)
def upload_project_report(
    report: ReportData,
    request: Request,
    response: Response,
    uploadedVia: str = "CodeFree CLI",
    project: Project = Depends(getProject),
    user_data: UserData = Depends(get_user_data),
    db_session : Session = Depends(get_db_session)
):
    if not user_data.is_user_admin and user_data.read_only:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    report_data = report.report

    if (report_data == {}) or ("data" not in report_data):
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail="Invalid Report")

    hash = Report.getHash(report_data)
    report_existing = (
        db_session.query(func.coalesce(func.max(Report.id), 0))
        .where(Report.report_hash.is_(hash))
        .scalar()
    )

    if report_existing != 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={
            "message": f"Report already exists (Report ID : {report_existing})",
            "report_id": report_existing,
            "report_url": f"{SERVER_URL}/projects/{report.project_id}/reports/{report_existing}",
        })

    relative_path = datetime.datetime.now().strftime("%Y%m%d-%H%M%S") + ".json"
    filepath = os.path.join(project.getReportsPath(APP_DATA_PATH), relative_path)
    saveReportFile(report_data, filepath)
    stats = Report.getReportStats(report_data)

    report_id = db_session.query(func.coalesce(func.max(Report.id), 0)).scalar() + 1

    db_session.add(
        Report(
            id=report_id,
            project_id=project.id,
            timestamp=datetime.datetime.now(datetime.timezone.utc),
            report_path=relative_path,
            report_hash=hash,
            report_src=uploadedVia,
            report_src_usr=user_data.user_name,
            cf_code_quality_score=stats["cf_code_quality_score"],
            style_issues=stats["style_count"],
            cwe_issues=stats["cwe_count"],
            misra_issues=stats["misra_count"],
            info_issues=stats["info_count"],
            minor_issues=stats["minor_count"],
            major_issues=stats["major_count"],
            critical_issues=stats["critical_count"],
            issue_files=stats["file_count"],
            commit_info=(
                json.dumps(report_data["commit_info"])
                if "commit_info" in report_data
                else None
            ),
        )
    )

    db_session.commit()
    return {
        "report_id": report_id,
        "report_url": f"{SERVER_URL}/project/{report.project_id}/report/{report_id}",
    }
