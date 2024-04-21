import os
import errno
import json
import dotenv
import logging
from datetime import datetime, timezone
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse, JSONResponse
from fastapi import FastAPI, Request, Response, status, Depends
from modules.output import out_xlsx
from modules.output import out_csv
from modules.cf_checker import CheckerStats, CheckerOutput
from modules import cf_output

from uuid import UUID, uuid4

from modules.server.SessionAuthenticator import authenticate_user, verifier, cookie, backend
from modules.server.definitions import UserData, SessionData

def mkdir_p(path): # mkdir -p implementation
    try:
        os.makedirs(path)
    except OSError as exc: # Python >2.5
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else: raise

DATA_PATH = os.path.join(os.path.dirname(__file__), 'sample_raw_report')

APP_NAME = "CodeFree GUI"
AUTHOR = "Sai Raveendra Kandregula"
CONTACT_EMAIL = "sairaveendrakandregula@gmail.com"

logger = logging.getLogger('uvicorn.error')

APP_DATA_PATH = "/tmp"
if os.path.exists(os.path.join(os.path.dirname(__file__), '.env')):
    dotenv.load_dotenv(dotenv_path=".env")

if os.environ.get('DATA_PATH') is not None:
    APP_DATA_PATH = os.environ['DATA_PATH']

logger.info("Data Path : " + APP_DATA_PATH)

def serve_codefree_backend(app:FastAPI):
    @app.get("/api/greetings")
    def codefree_greeting():
        return { "name" : APP_NAME, "author" : AUTHOR, "contact" : CONTACT_EMAIL }
    
    @app.post("/api/user/sign-in")
    async def create_session(userdata : UserData, response: Response):
        if authenticate_user(userdata) == False:
            response.status_code = 401
            return {
                "message" : "Invalid Username/Password"
            }
        session = uuid4()
        sessiondata = SessionData(username=userdata.username)

        await backend.create(session, sessiondata)
        if not userdata.keepSignedIn:
            cookie.cookie_params.max_age = (24 * 3600) # One day if user does not want to stay signed in
        else:
            cookie.cookie_params.max_age = (399 * 24 * 3600) # If user wants to stay signed in, set maximum max-age (400 days)
        cookie.attach_to_response(response, session)

        return {
            "message" : f"{userdata.username} signed in successfully!"
        }
    
    @app.get("/api/user/validate", dependencies=[Depends(cookie)])
    async def whoami(session_data: SessionData = Depends(verifier)):
        return session_data
    
    @app.post("/api/user/sign-out")
    async def del_session(response: Response, session_id: UUID = Depends(cookie)):
        if (await backend.read(session_id=session_id) is not None):
            await backend.delete(session_id)
        cookie.delete_from_response(response)
        return {
            "message" : f"User Signed Out"
        }
    
    @app.get("/api/projects/all-projects")
    def get_all_projects(request : Request, response : Response):
        return [{
            "project_id" : '1',
            "project_name" : "Test Project"
        }]
    
    @app.get("/api/projects/get-project")
    def get_project(project:str, request : Request, response : Response):
        return {
            "project_id" : project,
            "project_name" : "Test Project"
        }
    
    @app.get("/api/reports/all-reports")
    def get_project_all_reports(project:str, request : Request, response : Response):
        return [{
            "project_id" : project,
            "report_id" : 1,
        }]
    
    @app.get("/api/reports/get-report")
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
    

    @app.get("/api/reports/export-report")
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
    
    return app