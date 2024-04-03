import os
from typing import List
from subprocess import Popen, PIPE
from io import StringIO
import csv

from cf_checker import CheckingModule

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

def run_flawfinder(rootpath:str, output:dict):
    flawfinder_path = get_flawfinder_path()
    if len(flawfinder_path) == 0:
        print("Bundled FlawFinder Binary not found. Skipping...")
        return output
    print("\nRunning FlawFinder...")
    process = Popen([f'{flawfinder_path}', '--columns', '--csv', f'{rootpath}'], stdout=PIPE, stderr=PIPE)
    stdout, stderr = process.communicate()

    csv_out = stdout.decode()

    f = StringIO(csv_out)
    
    reader = csv.DictReader(f, skipinitialspace=True, strict=True, delimiter=",")

    out_arr = []
    for row in reader:
        out_arr.append(row)

    # print(out_arr)

    for err_elem in out_arr:
        # print(err_elem)
        error = {}
        err_file = err_elem["File"].removeprefix(rootpath).removeprefix("/")
        error['line'] = err_elem["Line"]
        error['column'] = err_elem["Column"]
        error["context"] = err_elem["Context"]
        error["warning"] = err_elem["Warning"]
        error["suggestion"] = err_elem["Suggestion"]
        error["type"] = err_elem["Category"]
        error["symbol"] = err_elem["Name"]
        error["cwe"] = err_elem["CWEs"]
        error["more_info"] = err_elem["HelpUri"]

        if err_file not in output:
            output[err_file] = {}

        if 'flawfinder' not in output[err_file]:
            output[err_file]['flawfinder'] = []

        output[err_file]['flawfinder'].append(error)

    file_list = get_c_files(rootpath)

    for fileitem in file_list:
        rel_name = fileitem.removeprefix(rootpath).removeprefix("/")
        if rel_name not in output:
            output[rel_name] = {}
        if 'flawfinder' not in output[rel_name]:
            output[rel_name]['flawfinder'] = []

    print("FlawFinder is done.\n")

    return output

flawfinder_module = CheckingModule()
flawfinder_module.moduleName = "flawfinder"
flawfinder_module.checker = run_flawfinder
flawfinder_module.checkerHelp = "Enable FlawFinder Code Analysis"
flawfinder_module.register()