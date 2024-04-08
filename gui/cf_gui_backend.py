import os
import json
from datetime import datetime, timezone
from fastapi import FastAPI, Request, Response, status

DATA_PATH = os.path.join(os.path.dirname(__file__), 'sample_raw_report')

APP_NAME = "CodeFree GUI"
AUTHOR = "Sai Raveendra Kandregula"
CONTACT_EMAIL = "sairaveendrakandregula@gmail.com"

def serve_codefree_backend(app:FastAPI):
    @app.get("/api/greetings")
    def codefree_greeting():
        return { "name" : APP_NAME, "author" : AUTHOR, "contact" : CONTACT_EMAIL }
    
    @app.get("/api/projects/get-project")
    def get_project_report(project:str, request : Request, response : Response):
        return {
            "project_id" : project,
            "project_name" : "Test Project",
            "gitlab_integration" : {},
            "checker_options" : []
        }
    
    @app.get("/api/projects/get-report")
    def get_project_report(project:str, report:str, request : Request, response : Response):
        try:
            with open(os.path.join(DATA_PATH, "report.json")) as fp:
                response.status_code = status.HTTP_200_OK
                report_data = json.load(fp)
                return {
                    "project_id" : project,
                    "report_id" : report,
                    "tags" : [],
                    "report" : report_data
                }
        except:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {}
    
    return app