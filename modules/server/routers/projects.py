import os
import json
from datetime import datetime, timezone

from fastapi import APIRouter, Request, Response, status, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse, JSONResponse

from modules.output import out_xlsx
from modules.output import out_csv
from modules.cf_checker import CheckerStats, CheckerOutput
from modules import cf_output

from modules.server.SessionAuthenticator import authenticate_user, verifier, cookie, backend
from modules.server.definitions import UserData, SessionData, ProjectData

from modules.server.common import logger, DATA_PATH, APP_DATA_PATH, mkdir_p

projectsRouter = APIRouter()

projects = [ProjectData(id=1, name="Logger")]

@projectsRouter.post("/projects/create-project")
def create_project(project : ProjectData, request : Request, response : Response):
    project_id = max(project_data.id for project_data in projects ) + 1

    project.id = project_id
    projects.append(project)

    response.status_code = status.HTTP_201_CREATED
    return {}

@projectsRouter.get("/projects/all-projects")
def get_all_projects(request : Request, response : Response):
    return projects

@projectsRouter.get("/projects/get-project")
def get_project(project_id:int, request : Request, response : Response):
    project = [ pro for pro in projects if pro.id == project_id ][0]
    return project

@projectsRouter.get("/reports/all-reports")
def get_project_all_reports(project:str, request : Request, response : Response):
    return [{
        "project_id" : project,
        "report_id" : 1,
    }]

@projectsRouter.get("/reports/get-report")
def get_project_report(project:str, report:str, request : Request, response : Response, format:str = "json"):
    try:
        with open(os.path.join(DATA_PATH, "report.json")) as fp:
            response.status_code = status.HTTP_200_OK
            report_data = json.load(fp)
            return {
                "project_id" : project,
                "report_id" : report if report != "lastReport" else "02",
                "tags" : [],
                "report" : report_data
            }
    except:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {}


@projectsRouter.get("/reports/export-report")
def export_project_report(project:str, report:str, request : Request, response : Response, format:str = "json"):
    formats = [ "json", "csv", "xlsx" ]
    if format.lower() not in formats:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {}
    try:
        with open(os.path.join(DATA_PATH, "report.json")) as fp:
            report_data = json.load(fp)
            if format.lower() == "json":
                response.status_code = status.HTTP_200_OK
                return JSONResponse(
                    content=jsonable_encoder(report_data),
                )
                # return report_data
            else:
                # Output Modules that generate files by themselves
                report_ts : datetime = datetime.strptime(report_data['timestamp'], "%Y-%m-%d %H:%M:%S.%f%z")
                issue_items = report_data['data']
                issue_items_cls = [ CheckerOutput(dict_data=item) for item in issue_items ]
                now = datetime.now()
                directory = f'/tmp/codefree_exports/{now.strftime("%Y%m%d_%H%M%S")}'
                mkdir_p(directory)
                base_filename = f'report_{project}_{report}_{report_ts.strftime("%Y%m%d_%H%M%S")}'
                extension = f".{format.lower()}"
                filename = f'{directory}/{base_filename}{extension}'
                class outputArgs():
                    outputFile = open(filename, 'w+')
                    calculateStats = True
                try:
                    file_formats = [ "json", "csv", "xlsx" ]
                    if format.lower() not in file_formats:
                        response.status_code = status.HTTP_400_BAD_REQUEST
                        return {}
                    
                    if format.lower() == 'csv':
                        out_csv.csv_format_obj.formatter(outputArgs(), issue_items_cls)
                    elif format.lower() == 'xlsx':
                        # Calculate Stats
                        for item in issue_items_cls:
                            CheckerStats.count_item(item)
                        
                        out_xlsx.xlsx_format_obj.formatter(outputArgs(), issue_items_cls)

                    return FileResponse(
                        path=filename,
                        status_code=status.HTTP_200_OK,
                        filename=f"{base_filename}{extension}"
                    )

                    
                except Exception as e:
                    logger.error( "Report formatting Failed : " )
                    logger.error(e)
                    response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
                    return {
                        "message" : f"Error Converting report into {format} format"
                    }

    except Exception as e:
        logger.error( "Export Report Failed : " )
        logger.error(e)
        response.status_code = status.HTTP_404_NOT_FOUND
        return {}