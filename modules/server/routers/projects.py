import os
import json
import datetime
import tempfile

from fastapi import APIRouter, HTTPException, Request, Response, status, Depends
from fastapi.responses import StreamingResponse
from starlette.background import BackgroundTasks
import randomcolor

from modules.output import *
from modules.checker import *
from modules.cf_checker import CheckerStats, CheckerOutput, CheckerTypes, CheckerSeverity, ComplianceStandards, CheckingModule
from modules.cf_output import FormattingModule

from modules.server.SessionAuthenticator import get_user_data, get_user_session, auth_required
from modules.server.definitions import UserData, ProjectData, ReportData

from modules.server.common import logger, DATA_PATH, APP_DATA_PATH, SERVER_URL, mkdir_p

from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from modules.server.database import engine
from modules.server.db_definitions.projects import Project, Report

rand_color = randomcolor.RandomColor()

projectsRouter = APIRouter()

def getProject(request : Request):
    slug = None
    if slug in request.path_params:
        slug = request.path_params['slug']
    elif 'project_id' in request.query_params:
        slug = request.query_params['project_id']
    
    if slug is not None:
        db_session = Session(engine)
        out = Project.get_project_by_slug(db_session, slug)
        db_session.close()
        if out is not None:
            return out
    
    raise HTTPException(status_code=404, detail="Project Not Found")

def getReportHash(report : dict):
    import hashlib
    return hashlib.sha256(json.dumps(report, indent=0).encode('utf-8')).hexdigest()

def getReportStats(report : dict):
    issue_items_cls = [ CheckerOutput(dict_data=item) for item in report['data'] ]
    CheckingModule.set_output(issue_items_cls)
    CheckerStats.calculateStats()
    
    files_Set = set()
    cf_code_quality_score = CheckerStats.get_aggregate_score() / CheckerStats.get_score_normalization()
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
        'cf_code_quality_score' : cf_code_quality_score,
        'cwe_count' : cwe_count,
        'misra_count' : misra_count,
        'style_count' : style_count,
        'info_count' : info_count,
        'minor_count' : minor_count,
        'major_count' : major_count,
        'critical_count' : critical_count,
    }

def getProjectReportsPath(slug : str):
    path = os.path.join(APP_DATA_PATH, slug, 'reports')
    mkdir_p(path)
    return path

def saveReportFile(report : dict, destination_file : str):
    dest = open(destination_file, "w")
    json.dump(obj=report, fp=dest)
    dest.close()

# Testing
db_session = Session(engine)
result = db_session.query(Project).where(Project.slug.is_('logger')).scalar()
if result == None:
    project_id = db_session.query(func.coalesce(func.max(Project.id), 0)).scalar() + 1
    db_session.add(Project(id=project_id, 
                           name="Logger", 
                           slug="logger", 
                           avatar_color=rand_color.generate(luminosity="dark")[0],
                           git_remote_url="https://github.com/Sai-Raveendra-Kandregula/logger",
                           git_remote_commit_url="https://github.com/Sai-Raveendra-Kandregula/logger/commit",
                        ))
    db_session.commit()
db_session.close()

@projectsRouter.post("/projects/create-project")
def create_project(project : ProjectData, request : Request, response : Response, 
                   user_data: UserData = Depends(get_user_data),
                   required : bool = Depends(auth_required)):
    if(not user_data.is_user_admin and user_data.read_only):
        response.status_code = status.HTTP_403_FORBIDDEN
        return {}

    db_session = Session(engine)
    existing = db_session.query(Project).where(Project.slug.is_(project.slug)).scalar()
    if existing is not None:
        db_session.close()
        response.status_code = status.HTTP_409_CONFLICT
        return {}

    max_project_id = db_session.query(func.max(Project.id)).scalar()
    project.id = max_project_id + 1

    db_session.add(Project(
        id=project.id, 
        name=project.name, 
        slug=project.slug, 
        avatar_color=rand_color.generate(luminosity="dark")[0],
        git_remote_url=project.git_remote_url,
        git_remote_commit_url=project.git_remote_commit_url,
    ))
    db_session.commit()
    db_session.close()

    response.status_code = status.HTTP_201_CREATED
    return {}

@projectsRouter.get("/projects/all-projects")
def get_all_projects(request : Request, response : Response, 
                    user_data: UserData = Depends(get_user_data),
                    required : bool = Depends(auth_required)):
    db_session = Session(engine)
    projects_all_query_out = db_session.query(Project).all()
    out = []
    if projects_all_query_out is not None:
        # out = [ project.as_dict() for project in projects_all_query_out ]
        for project in projects_all_query_out:
            project_out = project.as_dict()
            req = Request(scope=request.scope)
            resp = Response()
            stats = get_report_stats(project=project.slug, report='last-report', request=req, response=resp, user_data=user_data)
            if 'id' in stats:
                stats['report_id'] = stats.pop('id')
            project_out.update(stats)
            out.append(project_out)

    db_session.close()
    return out

@projectsRouter.get("/projects/get-project")
def get_project(slug:str, request : Request, response : Response, 
                user_data: UserData = Depends(get_user_data),
                required : bool = Depends(auth_required)):
    db_session = Session(engine)
    projects_slug_query = db_session.query(Project).where(Project.slug.is_(slug)).scalar()
    out= {}
    response.status_code = status.HTTP_404_NOT_FOUND
    if projects_slug_query is not None:
        response.status_code = status.HTTP_200_OK
        out = projects_slug_query.as_dict()
    db_session.close()
    return out

@projectsRouter.get("/reports/all-reports")
def get_project_all_reports(project:str, request : Request, response : Response, 
                            user_data: UserData = Depends(get_user_data),
                            required : bool = Depends(auth_required)):
    # assuming project is actually the project slug
    db_session = Session(engine)
    project_id = db_session.query( func.coalesce(Project.id, -1)).where(Project.slug.is_(project)).scalar()
    if project_id == -1:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {
            "message" : 'Project Not Found'
        }
    
    reports_all_query = db_session.query(Report).where(Report.project_id.is_(project_id))
    reports_all_query_out = reports_all_query.all()
    out = []
    if reports_all_query_out is not None:
        out = [ report.as_dict() for report in reports_all_query_out ]
    db_session.close()
    return out

@projectsRouter.get("/reports/report-count")
def get_project_report_count(project:str, request : Request, response : Response, 
                            user_data: UserData = Depends(get_user_data),
                            required : bool = Depends(auth_required)):
    # assuming project is actually the project slug
    db_session = Session(engine)
    project_id = db_session.query( func.coalesce(Project.id, -1)).where(Project.slug.is_(project)).scalar()
    if project_id == -1:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {
            "message" : 'Project Not Found'
        }
    
    reports_all_query = db_session.query(Report).where(Report.project_id.is_(project_id))
    reports_all_query_out = reports_all_query.all()
    out = {
        "count" : 0
    }
    if reports_all_query_out is not None:
        out['count'] = len(reports_all_query_out)
    db_session.close()
    return out

@projectsRouter.get("/reports/get-report")
def get_project_report(project:str, report:str, request : Request, response : Response, 
                        user_data: UserData = Depends(get_user_data),
                        required : bool = Depends(auth_required)):
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
        report_data_obj = report_data.as_dict()
        with open(os.path.join(getProjectReportsPath(project), report_data.report_path)) as fp:
            response.status_code = status.HTTP_200_OK
            report_data_obj['report'] = json.load(fp)
            db_session.close()
            return report_data_obj
    except Exception as e:
        response.status_code = status.HTTP_404_NOT_FOUND
        db_session.close()
        return {
            "error" : str(e)
        }

@projectsRouter.get("/reports/get-stats")
def get_report_stats(project:str, report:str, request : Request, response : Response, 
                    user_data: UserData = Depends(get_user_data),
                    required : bool = Depends(auth_required)):
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

@projectsRouter.post("/reports/upload-report")
def upload_project_report(report : ReportData, request : Request, response : Response, 
                          user_data: UserData = Depends(get_user_data),
                          required : bool = Depends(auth_required), 
                          uploadedVia : str = "CodeFree CLI" ):
    if(not user_data.is_user_admin and user_data.read_only):
        response.status_code = status.HTTP_403_FORBIDDEN
        return {}


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
            "message" : f'Report already exists (Report ID : {report_existing})',
            "report_id": report_existing,
            "report_url" : f"{SERVER_URL}/projects/{report.project_id}/reports/{report_existing}"
        }
    
    relative_path = datetime.datetime.now().strftime("%Y%m%d-%H%M%S") + ".json"
    filepath = os.path.join(getProjectReportsPath(report.project_id), relative_path)
    saveReportFile(report_data, filepath)
    stats = getReportStats(report_data)

    report_id = db_session.query(func.coalesce(func.max(Report.id), 0)).scalar() + 1
    
    db_session.add(Report(
        id=report_id,
        project_id=project_id,
        timestamp = datetime.datetime.now(datetime.timezone.utc),
        report_path=relative_path,
        report_hash=hash,
        report_src = uploadedVia,
        report_src_usr = user_data.user_name,
        cf_code_quality_score=stats['cf_code_quality_score'],
        style_issues = stats['style_count'],
        cwe_issues = stats['cwe_count'],
        misra_issues = stats['misra_count'],
        info_issues = stats['info_count'],
        minor_issues = stats['minor_count'],
        major_issues = stats['major_count'],
        critical_issues = stats['critical_count'],
        issue_files = stats['file_count'],
        commit_info = json.dumps(report_data['commit_info']) if 'commit_info' in report_data else None,
    ))

    db_session.commit()
    db_session.close()
    response.status_code = status.HTTP_201_CREATED
    return {
        "report_id" : report_id,
        "report_url" : f"{SERVER_URL}/projects/{report.project_id}/reports/{report_id}"
    }

@projectsRouter.get("/reports/delete-report")
def upload_project_report(report_id : int, project_id : str, request : Request, response : Response, 
                            user_data: UserData = Depends(get_user_data),
                            project : Project = Depends(getProject),
                            required : bool = Depends(auth_required)
                            ):
    if(not user_data.is_user_admin and user_data.read_only):
        response.status_code = status.HTTP_403_FORBIDDEN
        return {}

    db_session = Session(engine)
    
    logger.info([item.as_dict() for item in db_session.query(Report).all()])
    
    report : Report =  db_session.query(Report).where(Report.id.is_(report_id)).where(Report.project_id.is_(project.id)).scalar()

    if report is not None:
        db_session.delete(report)
        db_session.commit()
    else:
        response.status_code = status.HTTP_404_NOT_FOUND
        db_session.close()
        return {
            "message" : "Report not found"
        }

    db_session.close()
    return {}

@projectsRouter.get("/reports/export-report")
def export_project_report(project:str, report:str, request : Request, response : Response, 
                          background_tasks: BackgroundTasks, format:str = "json", 
                          user_data: UserData = Depends(get_user_data),
                          required : bool = Depends(auth_required)):
    
    format_module : FormattingModule = FormattingModule.get_module(format)
    
    if format_module is None or format_module.hasNoOutputFile:
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
            _report_data = json.load(fp)
            # Output Modules that generate files by themselves
            report_ts : datetime.datetime = datetime.datetime.fromtimestamp(_report_data['timestamp'] / 1000)
            issue_items_cls = [ CheckerOutput(dict_data=item) for item in _report_data['data'] ]
            CheckingModule.set_output(issue_items_cls)
            base_filename = f'report_{project}_{report}_{report_ts.strftime("%Y%m%d_%H%M%S")}'
            extension = f".{format_module.extension.lower().removeprefix('.') if format_module.extension is not None else format.lower()}"
            class outputArgs():
                outputFile : tempfile._TemporaryFileWrapper
                calculateStats = True
                projectName = project
                commit = _report_data['commit_info'] if 'commit_info' in _report_data else None
                jsonUsePretty = True
            try:
                out_args = outputArgs()
                out_args.outputFile = tempfile.NamedTemporaryFile(mode='w+t', suffix=extension)
                def process_output():
                    CheckerStats.calculateStats(args=out_args)                        
                    format_module.formatter(out_args, issue_items_cls)
                process_output()
                
                def file_stream():
                    with open(out_args.outputFile.name, 'rb') as file:
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
                        'Content-Disposition': f'attachment; filename="{base_filename}{extension}"',
                        'Content-Type': 'application/octet-stream',
                    }
                )
            except Exception as e:
                logger.error( "Report formatting Failed : " )
                logger.error(e, type(e))
                response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
                return {
                    "message" : f"Error Converting report into {format} format"
                }

    except Exception as e:
        logger.error( "Export Report Failed : " )
        logger.error(e)
        response.status_code = status.HTTP_404_NOT_FOUND
        return {}