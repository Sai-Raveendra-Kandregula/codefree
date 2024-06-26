import os
from typing import List
from subprocess import Popen, PIPE
import xml.etree.ElementTree as ET

from checker_modules.libraries import error_context
from cf_checker import *
import cf_output

cppcheck_module = CheckingModule()
cppcheck_module.module_name = "cppcheck"
cppcheck_module.module_name_friendly = "CWE Checks with CPPCheck"
cppcheck_module.module_type = CheckerTypes.CODE
cppcheck_module.compliance_standard = ComplianceStandards.CWE

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

def run_cppcheck_cwe(args, rootpath:str):
    progress_printer = cf_output.get_progress_printer(args=args)
    error_printer = cf_output.get_error_printer(args=args)

    cppcheck_path = get_cppcheck_path()
    out = []
    if len(cppcheck_path) == 0:
        error_printer("Bundled CPPCheck Binary not found. Skipping...")
        return out
    
    popen_cmd = [f'{cppcheck_path}','--enable=all', '--force', '--verbose', '--suppress=missingIncludeSystem', '--max-ctu-depth=4', '-q', '--xml', f'{rootpath}', '--output-file=/dev/stdout']

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
        error_obj = CheckerOutput(cppcheck_module)
        
        file_info = err_elem.find("location")

        if file_info is not None:            
            error_obj.file_name_abs = file_info.attrib["file"]
            error_obj.file_name = file_info.attrib["file"].removeprefix(rootpath).removeprefix("/")
            
            error_obj.error_info.line = int(file_info.attrib["line"])
            error_obj.error_info.column = int(file_info.attrib["column"])
            error_obj.error_info.context = error_context.get_error_context(error_obj.file_name_abs, error_obj.error_info.line)
            error_obj.error_info.symbol = error_context.get_error_symbol(error_obj.file_name_abs, error_obj.error_info.line, error_obj.error_info.column)
        else:
            continue


        error_severity_str = err_elem.attrib["severity"].lower()

        if error_severity_str == "error":
            error_obj.error_info.severity = CheckerSeverity.CRITICAL
        if error_severity_str == "warning":
            error_obj.error_info.severity = CheckerSeverity.MAJOR
        if error_severity_str in ["style", "performance", "portability"]:
            error_obj.error_info.severity = CheckerSeverity.MINOR
        else:
            error_obj.error_info.severity = CheckerSeverity.INFO

        error_obj.error_info.type = err_elem.attrib["id"]
        error_obj.error_info.description = err_elem.attrib["msg"]
        
        if err_elem.attrib.keys().__contains__("cwe"):
            error_obj.cwe_info.primary_cwe = err_elem.attrib["cwe"]
            error_obj.cwe_info.cwe_list.append(err_elem.attrib["cwe"])
            error_obj.cwe_info.additional_info = f"https://cwe.mitre.org/data/definitions/{error_obj.cwe_info.primary_cwe}.html"
        
        symbol_info = err_elem.find("symbol")
        if symbol_info is not None:
            error_obj.error_info.symbol = symbol_info.text

        out.append(error_obj)

    progress_printer("CWE Compliance Checks with CPPCheck are done.")

    return out

cppcheck_module.checker = run_cppcheck_cwe
cppcheck_module.checker_help = "Enable CWE Compliance Checks with CPPCheck"
CheckingModule.register(cppcheck_module)
