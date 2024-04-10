import os
from typing import List
from subprocess import Popen, PIPE
import xml.etree.ElementTree as ET

import cf_output
from cf_checker import *
from checker_modules.libraries import misra_mappings, error_context

misra_module = CheckingModule()
misra_module.module_name = "CPPCheck"
misra_module.module_name_friendly = "MISRA Checks with CPPCheck"
misra_module.module_type = CheckerTypes.CODE
misra_module.compliance_standard = ComplianceStandards.MISRA

mappings = misra_mappings.get_misra_mapping()

def get_c_files(path:str) -> List[str]:
    if not os.path.exists(path=path):
        return []
    # find ~/ha_mon/ -name *.c
    process = Popen(['find', path, '-name', "*.c"], stdout=PIPE, stderr=PIPE)
    stdout, stderr = process.communicate()
    return stdout.decode().splitlines()

def get_cppcheck_path() -> str:
    dir_path = os.path.dirname(os.path.realpath(__file__))

    cppcheck_path = os.path.join(dir_path, 'binaries', 'cppcheck', 'cppcheck')

    if os.path.exists(cppcheck_path):
        return cppcheck_path
    else:
        return ""

def run_cppcheck_misra(args, rootpath:str) -> List[CheckerOutput]:
    progress_printer = cf_output.get_progress_printer(args=args)
    error_printer = cf_output.get_error_printer(args=args)

    cppcheck_path = get_cppcheck_path()
    out = []

    if len(cppcheck_path) == 0:
        error_printer("Bundled CPPCheck Binary not found. Skipping...")
        return out
    
    popen_cmd = [f'{cppcheck_path}', '--enable=all', '--addon=misra', '--force', '--verbose', '--suppress=missingIncludeSystem', '--max-ctu-depth=4', '-q', '--xml', f'{rootpath}', '--output-file=/dev/stdout']
    for includePath in args.includePaths:
        popen_cmd.append(f'-I{includePath}')

    process = Popen(popen_cmd, stdout=PIPE, stderr=PIPE)
    stdout, stderr = process.communicate()
    
    run_err = stderr.decode()
    if len(run_err.strip()) > 0:
        error_printer(run_err)

    xml_out = stdout.decode()

    # print(xml_out)

    root = ET.fromstring(xml_out)

    for err_elem in root.find("errors").findall("error"):
        if err_elem.attrib["msg"].lower().startswith("misra violation"):
            error_obj = CheckerOutput(misra_module)

            file_info = err_elem.find("location")

            if file_info is not None:
                error_obj.file_name_abs = file_info.attrib["file"]
                error_obj.file_name = file_info.attrib["file"].removeprefix(rootpath).removeprefix("/")
                
                error_obj.error_info.type = "MISRA Violation"
                error_obj.error_info.line = int(file_info.attrib["line"])
                error_obj.error_info.column = int(file_info.attrib["column"])
                error_obj.error_info.context = error_context.get_error_context(error_obj.file_name_abs, error_obj.error_info.line)
                error_obj.error_info.symbol = error_context.get_error_symbol(error_obj.file_name_abs, error_obj.error_info.line, error_obj.error_info.column)

            misra_rule = mappings[f"Rule_{err_elem.attrib['id'].replace('misra-c', '').split('-')[1]}"]

            error_obj.misra_info.rule_number = misra_rule['rule_no']
            error_obj.error_info.description = misra_rule['description']

            error_severity_str = misra_rule["severity"].lower()

            if error_severity_str == "mandatory":
                error_obj.error_info.severity = CheckerSeverity.CRITICAL
            elif error_severity_str == "required":
                error_obj.error_info.severity = CheckerSeverity.MAJOR
            elif error_severity_str == "advisory":
                error_obj.error_info.severity = CheckerSeverity.MINOR
            else:
                error_obj.error_info.severity = CheckerSeverity.INFO

            if error_obj.file_name_abs == None:
                continue

            out.append(error_obj)

    progress_printer("MISRA Compliance Checks with CPPCheck are done.")

    return out

misra_module.checker = run_cppcheck_misra
misra_module.checker_help = "Enable MISRA Compliance Checks with CPPCheck"
CheckingModule.register(misra_module)
