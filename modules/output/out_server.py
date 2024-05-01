from datetime import datetime, timezone
from modules.cf_checker import CheckerOutput, get_error_printer
from modules.cf_output import FormattingModule, FormatOption, ArgActionOptions

from typing import List

import json
import requests
import urllib.parse

def output_server(args, output: List[CheckerOutput] = []):
    out_obj = {}
    out_obj['timestamp'] = str(datetime.now(timezone.utc))
    out_obj['data'] = [item.dict() for item in output]
    json_string = json.dumps(out_obj)
    print(json_string)

def checkRequisites(args):
    error_printer = get_error_printer(args=args)
    if(not args.serverUrl):
        error_printer("CodeFree Server URL Not Provided")
        return False
    if(not args.cfUserName):
        error_printer("CodeFree Server UserName Not Provided")
        return False
    if(not args.cfPassword):
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
    try:
        resp = requests.post(url=signInUrl, json={
            "username": args.cfUserName,
            "password": args.cfPassword,
            "keepSignedIn" : False
        })
    except:
        error_printer(f"Authentication failed with CodeFree Server ({args.serverUrl})")
        return False
    if(resp.status_code != 200):
        error_printer(f"Authentication failed with CodeFree Server ({args.serverUrl})")
        return False

    return True

server_format_obj = FormattingModule()

server_format_obj.formatStr = "server"
server_format_obj.formatHelp = "Uploads Report to CodeFree Server"
server_format_obj.formatter = output_server
server_format_obj.preCheck = checkRequisites

server_ip_opt = FormatOption()
server_ip_opt.option = "server-url"
server_ip_opt.argDest = "serverUrl"
server_ip_opt.argAction = "store"
server_ip_opt.argHelp = "CodeFree Server Address"

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
server_format_obj.formatOptions.append(server_user_opt)
server_format_obj.formatOptions.append(server_pswd_opt)

FormattingModule.register(server_format_obj)