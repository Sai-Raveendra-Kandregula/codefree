import datetime
import os
import tempfile
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from modules.cf_checker import *
from modules.cf_output import *
from modules.output import *
from modules.server.SessionAuthenticator import get_user_data
from modules.server.common import APP_DATA_PATH, logger
from modules.server.database import get_db_session, Session
from modules.server.db_definitions.projects import Project, Report
from modules.server.definitions import UserData
from ..common import getProject
from .common import getReport


reportSpecificRouter = APIRouter(
    prefix="/{report_id}"
)

@reportSpecificRouter.get("/")
def get_report(
    project : Project = Depends(getProject), 
    report : Report = Depends(getReport), 
    session : Session = Depends(get_db_session)
):
    report_data_obj = report.as_dict()
    report_data = report.getReportData(session, project, APP_DATA_PATH)
    if report_data is not None:
        report_data_obj["report"] = report_data
    else:
        raise HTTPException(status_code=404, detail="Report Not Found")
    return report_data_obj

@reportSpecificRouter.delete("/")
def delete_report(
    project : Project = Depends(getProject),
    report : Report = Depends(getReport),
    user_data: UserData = Depends(get_user_data),
    db_session : Session = Depends(get_db_session)
):
    if not user_data.is_user_admin and user_data.read_only:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    report_file = report.getReportPath(project=project, data_path=APP_DATA_PATH)
    if report_file is not None:
        os.remove(report_file)
    db_session.delete(report)
    db_session.commit()
    return {}

@reportSpecificRouter.get("/stats")
def get_stats(report : Report = Depends(getReport)):
    return report.as_dict()

@reportSpecificRouter.get("/export")
def export_project_report(
    background_tasks: BackgroundTasks,
    format: str = "json",
    project : Project = Depends(getProject),
    report : Report = Depends(getReport),
    db_session : Session = Depends(get_db_session)
):
    format_module: FormattingModule = FormattingModule.get_module(format)

    if format_module is None or format_module.hasNoOutputFile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot export in {format} format")

    try:
        _report_data = report.getReportData(db_session, project=project, data_path=APP_DATA_PATH)
        if _report_data is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
        # Output Modules that generate files by themselves
        report_ts: datetime.datetime = datetime.datetime.fromtimestamp(
            _report_data["timestamp"] / 1000
        )
        issue_items_cls = [
            CheckerOutput(dict_data=item) for item in _report_data["data"]
        ]
        CheckingModule.set_output(issue_items_cls)
        base_filename = (
            f'report_{project.slug}_{report.id}_{report_ts.strftime("%Y%m%d_%H%M%S")}'
        )
        extension = f".{format_module.extension.lower().removeprefix('.') if format_module.extension is not None else format.lower()}"

        class outputArgs:
            outputFile: tempfile._TemporaryFileWrapper
            calculateStats = True
            projectName = project.name
            commit = (
                _report_data["commit_info"]
                if "commit_info" in _report_data
                else None
            )
            jsonUsePretty = True

        try:
            out_args = outputArgs()
            out_args.outputFile = tempfile.NamedTemporaryFile(
                mode="w+t", suffix=extension
            )

            def process_output():
                CheckerStats.calculateStats(args=out_args)
                format_module.formatter(out_args, issue_items_cls)

            process_output()

            def file_stream():
                with open(out_args.outputFile.name, "rb") as file:
                    while True:
                        data = file.read(2048)
                        if not data:
                            break
                        yield data

            def cleanup_output():
                out_args.outputFile.close()

            background_tasks.add_task(cleanup_output)
            return StreamingResponse(
                content=file_stream(),
                status_code=status.HTTP_200_OK,
                headers={
                    "Content-Disposition": f'attachment; filename="{base_filename}{extension}"',
                    "Content-Type": "application/octet-stream",
                },
            )
        except Exception as e:
            logger.error("Report formatting Failed : ")
            logger.error(e, type(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error Converting report into {format} format")

    except Exception as e:
        logger.error("Export Report Failed : ")
        logger.error(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Report Export Failed : {str(e)}")