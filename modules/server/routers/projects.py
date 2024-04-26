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
from modules.server.definitions import UserData, UserLogin, SessionData, ProjectData, ReportData

from modules.server.common import logger, DATA_PATH, APP_DATA_PATH, mkdir_p

from sqlalchemy import select, func
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from modules.server.database import engine
from db_definitions.projects import Project, Report

projectsRouter = APIRouter()

def getReportHash(report : dict):
    import hashlib
    return hashlib.sha256(json.dumps(report, indent=0).encode('utf-8')).hexdigest()

def getReportStats(report : dict):
    issue_items_cls = [ CheckerOutput(dict_data=item) for item in report['data'] ]
    
    files_Set = set()
    style_count = 0
    info_count = 0
    minor_count = 0
    major_count = 0
    critical_count = 0

    cwe_count = 0
    misra_count = 0

    for item in issue_items_cls:
        files_Set.add(item.file_name)
        if item._module.module_type == CheckerTypes.STYLE:
            style_count += 1
        elif item._module.module_type == CheckerTypes.CODE:
            if item._module.compliance_standard == ComplianceStandards.CWE:
                cwe_count +=1
            elif item._module.compliance_standard == ComplianceStandards.MISRA:
                misra_count +=1

            if item.error_info.severity == CheckerSeverity.CRITICAL:
                critical_count += 1
            elif item.error_info.severity == CheckerSeverity.MAJOR:
                major_count += 1
            elif item.error_info.severity == CheckerSeverity.MINOR:
                minor_count += 1
            elif item.error_info.severity == CheckerSeverity.INFO:
                info_count += 1

    return {
        'file_count' : len(files_Set),
        'cwe_count' : cwe_count,
        'misra_count' : misra_count,
        'style_count' : style_count,
        'info_count' : info_count,
        'minor_count' : minor_count,
        'major_count' : major_count,
        'critical_count' : critical_count,
    }

def saveReportFile(report : dict, destination_file : str):
    with open(destination_file, "w") as dest:
        json.dump(obj=report, fp=dest)

def getProjectReportsPath(slug : str):
    path = os.path.join(APP_DATA_PATH, slug, 'reports')
    mkdir_p(path)
    return path

# Testing
db_session = Session(engine)
result = db_session.scalars(select(Project).where(Project.slug.is_('logger')))
if len(result.fetchall()) == 0:
    project_id = db_session.query(func.coalesce(func.max(Project.id), 0)).scalar() + 1
    db_session.add(Project(id=project_id, name="Logger", slug="logger"))

    with open(os.path.join(DATA_PATH, "report.json")) as fp:
        report_data = json.load(fp)
        relative_path = datetime.now().strftime("%Y%m%d-%H%M%S") + ".json"
        filepath = os.path.join(getProjectReportsPath("logger"), relative_path)
        saveReportFile(report_data, filepath)
        stats = getReportStats(report_data)

        report_id = db_session.query(func.coalesce(func.max(Report.id), 0)).scalar() + 1
        
        db_session.add(Report(
            id=report_id,
            project_id=project_id,
            timestamp = datetime.strptime(report_data['timestamp'], "%Y-%m-%d %H:%M:%S.%f%z"),
            report_path=relative_path,
            report_hash=getReportHash(report_data),
            style_issues = stats['style_count'],
            cwe_issues = stats['cwe_count'],
            misra_issues = stats['misra_count'],
            info_issues = stats['info_count'],
            minor_issues = stats['minor_count'],
            major_issues = stats['major_count'],
            critical_issues = stats['critical_count'],
            issue_files = stats['file_count'],
        ))

    db_session.commit()
db_session.close()

@projectsRouter.post("/projects/create-project", dependencies=[Depends(cookie)])
def create_project(project : ProjectData, request : Request, response : Response, user_data: UserData = Depends(verifier)):
    db_session = Session(engine)

    max_project_id = db_session.query(func.max(Project.id)).scalar()
    project.id = max_project_id + 1

    db_session.add(Project(id=project.id, name=project.name, slug=project.slug))
    db_session.commit()
    db_session.close()

    response.status_code = status.HTTP_201_CREATED
    return {}

@projectsRouter.get("/projects/all-projects", dependencies=[Depends(cookie)])
def get_all_projects(request : Request, response : Response, user_data: UserData = Depends(verifier)):
    db_session = Session(engine)
    projects_all_query = select(Project)
    projects_all_query_out = db_session.scalars(projects_all_query)
    out = []
    if projects_all_query_out is not None:
        out = [ project.as_dict() for project in projects_all_query_out ]
    db_session.close()
    return out

@projectsRouter.get("/projects/get-project", dependencies=[Depends(cookie)])
def get_project(slug:str, request : Request, response : Response, user_data: UserData = Depends(verifier)):
    db_session = Session(engine)
    projects_slug_query = select(Project).where(Project.slug.is_(slug))
    projects_slug_query_out = db_session.scalars(projects_slug_query)
    out= {}
    response.status_code = status.HTTP_404_NOT_FOUND
    if projects_slug_query_out is not None:
        response.status_code = status.HTTP_200_OK
        out = projects_slug_query_out.one().as_dict()
    db_session.close()
    return out

@projectsRouter.get("/reports/all-reports", dependencies=[Depends(cookie)])
def get_project_all_reports(project:str, request : Request, response : Response, user_data: UserData = Depends(verifier)):
    # assuming project is actually the project slug
    db_session = Session(engine)
    project_id = db_session.query( func.coalesce(Project.id, -1)).where(Project.slug.is_(project)).scalar()
    if project_id == -1:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {
            "message" : 'Project Not Found'
        }
    
    reports_all_query = select(Report).where(Report.project_id.is_(project_id))
    reports_all_query_out = db_session.scalars(reports_all_query)
    out = []
    if reports_all_query_out is not None:
        out = [ report.as_dict() for report in reports_all_query_out ]
    db_session.close()
    return out

@projectsRouter.get("/reports/get-report", dependencies=[Depends(cookie)])
def get_project_report(project:str, report:str, request : Request, response : Response, format:str = "json", user_data: UserData = Depends(verifier)):
    db_session = Session(engine)
    project_id = db_session.query( func.coalesce(Project.id, -1)).where(Project.slug.is_(project)).scalar()
    if project_id == -1:
        response.status_code = status.HTTP_404_NOT_FOUND
        db_session.close()
        return {
            "message" : 'Project Not Found'
        }
    
    report_id = report

    if report.lower() == "last-report":
        report_id = db_session.query(func.coalesce(func.max(Report.id), -1)).scalar() 
        if report_id == -1:
            response.status_code = status.HTTP_404_NOT_FOUND
            db_session.close()
            return {
                "message" : "Report not found"
            }
    else:
        report_id = int(report)

    report_data : Report = db_session.query(Report).where(Report.project_id.is_(project_id)).where(Report.id.is_(report_id)).scalar()
    if report_data == None:
        response.status_code = status.HTTP_404_NOT_FOUND
        db_session.close()
        return {
            "message" : "Report not found"
        }
    try:
        with open(os.path.join(getProjectReportsPath(project), report_data.report_path)) as fp:
            response.status_code = status.HTTP_200_OK
            report_data_obj = json.load(fp)
            db_session.close()
            return {
                "project_id" : project,
                "report_id" : report_id,
                "tags" : [],
                "report" : report_data_obj
            }
    except:
        response.status_code = status.HTTP_404_NOT_FOUND
        db_session.close()
        return {}

@projectsRouter.get("/reports/get-stats", dependencies=[Depends(cookie)])
def get_project_report(project:str, report:str, request : Request, response : Response, format:str = "json", user_data: UserData = Depends(verifier)):
    db_session = Session(engine)
    try:
        project_id = db_session.query(Project.id).where(Project.slug.is_(project)).scalar()
    except NoResultFound:
        response.status_code = status.HTTP_404_NOT_FOUND
        db_session.close()
        return {
            "message" : 'Project Not Found'
        }
    
    report_id = report

    if report.lower() == "last-report":
        try:
            report_id = db_session.query(func.max(Report.id)).scalar() 
        except NoResultFound:
            response.status_code = status.HTTP_404_NOT_FOUND
            db_session.close()
            return {
                "message" : "Report not found"
            }
    else:
        report_id = int(report)

    report_data : Report = db_session.query(Report).where(Report.project_id.is_(project_id)).where(Report.id.is_(report_id)).scalar()
    if report_data == None:
        response.status_code = status.HTTP_404_NOT_FOUND
        db_session.close()
        return {
            "message" : "Report not found"
        }
    
    db_session.close()
    return report_data.as_dict()

@projectsRouter.post("/reports/upload-report", dependencies=[Depends(cookie)])
def upload_project_report(report : ReportData, request : Request, response : Response, user_data: UserData = Depends(verifier)):
    db_session = Session(engine)

    project_id = db_session.query( func.coalesce(Project.id, -1)).where(Project.slug.is_(report.project_id)).scalar()
    if project_id == -1:
        response.status_code = status.HTTP_404_NOT_FOUND
        db_session.close()
        return {
            "message" : 'Project Not Found'
        }

    report_data = report.report

    if (report_data == {}) or ('data' not in report_data):
        response.status_code = status.HTTP_406_NOT_ACCEPTABLE
        db_session.close()
        return {
            "message" : 'Invalid Report'
        }
    
    hash = getReportHash(report_data)
    report_existing =  db_session.query(func.coalesce(func.max(Report.id), 0)).where(Report.report_hash.is_(hash)).scalar()

    if report_existing != 0:
        response.status_code = status.HTTP_409_CONFLICT
        db_session.close()
        return {
            "message" : f'Report already exists (Report ID : {report_existing})'
        }
    
    relative_path = datetime.now().strftime("%Y%m%d-%H%M%S") + ".json"
    filepath = os.path.join(getProjectReportsPath("logger"), relative_path)
    saveReportFile(report_data, filepath)
    stats = getReportStats(report_data)

    report_id = db_session.query(func.coalesce(func.max(Report.id), 0)).scalar() + 1
    
    db_session.add(Report(
        id=report_id,
        project_id=project_id,
        timestamp = datetime.strptime(report_data['timestamp'], "%Y-%m-%d %H:%M:%S.%f%z"),
        report_path=relative_path,
        report_hash=hash,
        style_issues = stats['style_count'],
        cwe_issues = stats['cwe_count'],
        misra_issues = stats['misra_count'],
        info_issues = stats['info_count'],
        minor_issues = stats['minor_count'],
        major_issues = stats['major_count'],
        critical_issues = stats['critical_count'],
        issue_files = stats['file_count'],
    ))

    db_session.commit()
    db_session.close()
    response.status_code = status.HTTP_201_CREATED
    return {}

@projectsRouter.get("/reports/export-report", dependencies=[Depends(cookie)])
def export_project_report(project:str, report:str, request : Request, response : Response, format:str = "json", user_data: UserData = Depends(verifier)):
    formats = [ "json", "csv", "xlsx" ]
    if format.lower() not in formats:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {}
    db_session = Session(engine)
    project_id = db_session.query( func.coalesce(Project.id, -1)).where(Project.slug.is_(project)).scalar()
    if project_id == -1:
        response.status_code = status.HTTP_404_NOT_FOUND
        db_session.close()
        return {
            "message" : 'Project Not Found'
        }
    
    report_id = report

    if report.lower() == "last-report":
        report_id = db_session.query(func.coalesce(func.max(Report.id), -1)).scalar() 
        if report_id == -1:
            response.status_code = status.HTTP_404_NOT_FOUND
            db_session.close()
            return {
                "message" : "Report not found"
            }
    else:
        report_id = int(report)

    report_data : Report = db_session.query(Report).where(Report.project_id.is_(project_id)).where(Report.id.is_(report_id)).scalar()
    if report_data == None:
        response.status_code = status.HTTP_404_NOT_FOUND
        db_session.close()
        return {
            "message" : "Report not found"
        }
    try:
        with open(os.path.join(getProjectReportsPath(project), report_data.report_path)) as fp:
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