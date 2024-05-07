import datetime
from modules.cf_checker import *
from modules.cf_output import FormattingModule, FormatOption, ArgActionOptions

from typing import List

import json

def output_json(args, output: List[CheckerOutput] = []):
    out_obj = {}
    out_obj['timestamp'] = datetime.datetime.now(datetime.timezone.utc).timestamp()*1000
    if(args.commit):
        out_obj['commit_info'] = args.commit
    out_obj['data'] = [item.dict() for item in output]
    json_string = json.dumps(out_obj, indent=(2 if args.jsonUsePretty else None))
    args.outputFile.write(json_string)

json_format_obj = FormattingModule()

json_format_obj.formatStr = "json"
json_format_obj.formatHelp = "Formats Output to JSON"
json_format_obj.formatter = output_json

pretty_opt = FormatOption()
pretty_opt.option = "json-pretty"
pretty_opt.argDest = "jsonUsePretty"
pretty_opt.argAction = ArgActionOptions.Empty
pretty_opt.argHelp = "Prints JSON with Indentation"


json_format_obj.formatOptions.append(pretty_opt)

FormattingModule.register(json_format_obj)
FormattingModule.set_default(json_format_obj)