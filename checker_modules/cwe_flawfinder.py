import os
from typing import List
from subprocess import Popen, PIPE
from io import StringIO
import csv
import re

from cf_checker import *
import cf_output

flawfinder_module = CheckingModule()
flawfinder_module.module_name = "flawfinder"
flawfinder_module.module_name_friendly = "CWE Checks with FlawFinder"
flawfinder_module.module_type = CheckerTypes.CODE
flawfinder_module.compliance_standard = ComplianceStandards.CWE

def get_c_files(path:str) -> List[str]:
    if not os.path.exists(path=path):
        return []
    # find ~/ha_mon/ -name *.c
    process = Popen(['find', path, '-name', "*.c"], stdout=PIPE, stderr=PIPE)
    stdout, stderr = process.communicate()
    return stdout.decode().splitlines()

def get_flawfinder_path() -> str:
    dir_path = os.path.dirname(os.path.realpath(__file__))

    flawfinder_path = os.path.join(dir_path, 'binaries', 'flawfinder')

    if os.path.exists(flawfinder_path):
        return flawfinder_path
    else:
        return ""

def run_flawfinder(args, rootpath:str) -> List[CheckerOutput]:
    progress_printer = cf_output.get_progress_printer(args=args)
    error_printer = cf_output.get_error_printer(args=args)

    flawfinder_path = get_flawfinder_path()

    out = []

    if len(flawfinder_path) == 0:
        error_printer("Bundled FlawFinder Binary not found. Skipping...")
        return out
    process = Popen([f'{flawfinder_path}', '--columns', '--csv', f'{rootpath}'], stdout=PIPE, stderr=PIPE)
    stdout, stderr = process.communicate()
    
    run_err = stderr.decode()
    if len(run_err.strip()) > 0:
        error_printer(run_err)

    csv_out = stdout.decode()

    f = StringIO(csv_out)
    
    reader = csv.DictReader(f, skipinitialspace=True, strict=True, delimiter=",")

    out_arr = []
    for row in reader:
        out_arr.append(row)

    # print(out_arr)

    for err_elem in out_arr:
        error_obj = CheckerOutput(flawfinder_module)
        # print(err_elem)
        error = {}
        error_obj.file_name_abs = err_elem["File"]
        error_obj.file_name = err_elem["File"].removeprefix(rootpath).removeprefix("/")
        
        error_obj.error_info.line = int(err_elem["Line"])
        error_obj.error_info.column = int(err_elem["Column"])
        error_obj.error_info.context = err_elem["Context"]
        error_obj.error_info.description = err_elem["Warning"]
        error_obj.error_info.suggestion = err_elem["Suggestion"]
        error_obj.error_info.type = err_elem["Category"]
        error_obj.error_info.symbol = err_elem["Name"]
        error_obj.cwe_info.primary_cwe = int(int(err_elem["HelpUri"].replace("https://cwe.mitre.org/data/definitions/", "").replace(".html", "")))
        error_obj.cwe_info.cwe_list = [int(val) for val in re.findall(r'[0-9]+', err_elem["CWEs"])]
        error_obj.cwe_info.additional_info = err_elem["HelpUri"]

        out.append(error_obj)

    progress_printer("FlawFinder is done.")

    return out

flawfinder_module.checker = run_flawfinder
flawfinder_module.checker_help = "Enable CWE Compliance Checks with FlawFinder"
CheckingModule.register(flawfinder_module)
