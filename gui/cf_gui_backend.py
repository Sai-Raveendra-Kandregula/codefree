import os
import json
import dotenv
import logging
from datetime import datetime, timezone
from fastapi import FastAPI, Request, Response, status, Depends

from uuid import UUID, uuid4

from SessionAuthenticator import authenticate_user, verifier, cookie, backend
from definitions import UserData, SessionData

DATA_PATH = os.path.join(os.path.dirname(__file__), 'sample_raw_report')

APP_NAME = "CodeFree GUI"
AUTHOR = "Sai Raveendra Kandregula"
CONTACT_EMAIL = "sairaveendrakandregula@gmail.com"

logging.basicConfig(format="%(levelname)-9s : %(message)s", level=logging.NOTSET)

APP_DATA_PATH = "/tmp"
if os.path.exists(os.path.join(os.path.dirname(__file__), '.env')):
    dotenv.load_dotenv(dotenv_path=".env")

if os.environ.get('DATA_PATH') is not None:
    APP_DATA_PATH = os.environ['DATA_PATH']

logging.info("Data Path : " + APP_DATA_PATH)

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
    def get_project_report(project:str, report:str, request : Request, response : Response):
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
    
    return app