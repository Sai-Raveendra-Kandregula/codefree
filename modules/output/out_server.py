from datetime import datetime, timezone
from modules.cf_checker import CheckerOutput, get_error_printer, get_progress_printer
from modules.cf_output import FormattingModule, FormatOption, ArgActionOptions

from typing import List

import json
import requests
import urllib.parse

ServerSession : requests.Session = requests.session()

def output_server(args, output: List[CheckerOutput] = []):
    progress_printer = get_progress_printer(args=args)
    error_printer = get_error_printer(args=args)

    out_obj = {}
    out_obj['timestamp'] = str(datetime.now(timezone.utc))
    out_obj['data'] = [item.dict() for item in output]

    uploadUrl = urllib.parse.urljoin(args.serverUrl, '/api/reports/upload-report')
    resp : requests.Response
    
    resp = ServerSession.post(uploadUrl, json={
        "project_id": args.cfProject,
        "report": out_obj
    })
    if(resp.status_code == 201):
        progress_printer("Report Uploaded Successfully.")
    else:
        error_printer(f"Report Upload Failed. (HTTP Status Code : {resp.status_code})")

def checkRequisites(args):
    error_printer = get_error_printer(args=args)
    if(not getattr(args, "serverUrl", False)):
        error_printer("CodeFree Server URL Not Provided")
        return False
    if(not getattr(args, "cfProject", False)):
        error_printer("CodeFree Server Project Slug Not Provided")
        return False
    if(not getattr(args, "cfUserName", False)):
        error_printer("CodeFree Server UserName Not Provided")
        return False
    if(not getattr(args, "cfPassword", False)):
        error_printer("CodeFree Server Password Not Provided")
        return False

    statusUrl = urllib.parse.urljoin(args.serverUrl, '/api/greetings')
    try:
        resp = requests.get(url=statusUrl)
    except:
        error_printer(f"CodeFree Server not reachable at {args.serverUrl}")
        return False
    if(resp.status_code != 200):
        error_printer(f"CodeFree Server not healthy at {args.serverUrl}")
        return False

    signInUrl = urllib.parse.urljoin(args.serverUrl, '/api/user/sign-in')
    resp = ServerSession.post(url=signInUrl, json={
        "username": args.cfUserName,
        "password": args.cfPassword,
        "keepSignedIn" : False
    })
    if(resp.status_code != 200):
        error_printer(f"Authentication failed with CodeFree Server ({args.serverUrl})")
        return False

    getProjectUrl = urllib.parse.urljoin(args.serverUrl, f'/api/projects/get-project?slug={args.cfProject}')
    resp = ServerSession.get(url=getProjectUrl)
    if(resp.status_code == 404):
        error_printer(f"Fetching Project Details Failed : Project {args.cfProject} does not exist.")
        return False
    elif(resp.status_code != 200):
        error_printer(f"Fetching Project Details Failed : HTTP Status Code {resp.status_code}")
        return False

    return True

server_format_obj = FormattingModule()

server_format_obj.formatStr = "server"
server_format_obj.formatHelp = "Uploads Report to CodeFree Server"
server_format_obj.hasNoOutputFile = True
server_format_obj.formatter = output_server
server_format_obj.preCheck = checkRequisites

server_ip_opt = FormatOption()
server_ip_opt.option = "server-url"
server_ip_opt.argDest = "serverUrl"
server_ip_opt.argAction = "store"
server_ip_opt.argHelp = "CodeFree Server Address"

server_project_opt = FormatOption()
server_project_opt.option = "cf-project"
server_project_opt.argDest = "cfProject"
server_project_opt.argAction = "store"
server_project_opt.argHelp = "CodeFree Server Project Slug"

server_user_opt = FormatOption()
server_user_opt.option = "cf-username"
server_user_opt.argDest = "cfUserName"
server_user_opt.argAction = "store"
server_user_opt.argHelp = "CodeFree Server User Name"

server_pswd_opt = FormatOption()
server_pswd_opt.option = "cf-password"
server_pswd_opt.argDest = "cfPassword"
server_pswd_opt.argAction = "store"
server_pswd_opt.argHelp = "CodeFree Server password"

server_format_obj.formatOptions.append(server_ip_opt)
server_format_obj.formatOptions.append(server_project_opt)
server_format_obj.formatOptions.append(server_user_opt)
server_format_obj.formatOptions.append(server_pswd_opt)

FormattingModule.register(server_format_obj)