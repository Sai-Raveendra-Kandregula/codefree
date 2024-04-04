import os
from typing import List
from subprocess import Popen, PIPE
import xml.etree.ElementTree as ET

from cf_checker import CheckingModule, ComplianceStandards

cppcheck_module = CheckingModule()
cppcheck_module.moduleName = "cwe_cppcheck"
cppcheck_module.moduleNameFriendly = "CWE Checks with CPPCheck"
cppcheck_module.complianceStandard = ComplianceStandards.CWE

def get_c_files(path:str) -> List[str]:
    if not os.path.exists(path=path):
        return []
    # find ~/ha_mon/ -name *.c
    process = Popen(['find', path, '-name', "*.c"], stdout=PIPE, stderr=PIPE)
    stdout, stderr = process.communicate()
    return stdout.decode().splitlines()

def get_cppcheck_path() -> str:
    dir_path = os.path.dirname(os.path.realpath(__file__))

    cppcheck_path = os.path.join(dir_path, 'binaries', 'cppcheck')

    if os.path.exists(cppcheck_path):
        return cppcheck_path
    else:
        return ""

def run_cpp_check(rootpath:str, output:dict):
    cppcheck_path = get_cppcheck_path()
    if len(cppcheck_path) == 0:
        print("Bundled CPPCheck Binary not found. Skipping...")
        return output
    print("\nRunning CPPCheck...")
    process = Popen([f'{cppcheck_path}','--enable=all', '--force', '--verbose', '--suppress=missingIncludeSystem', '--max-ctu-depth=4', '-q', '--xml', f'{rootpath}', '--output-file=/dev/stdout', f'-I{rootpath}/include'], stdout=PIPE, stderr=PIPE)
    stdout, stderr = process.communicate()

    xml_out = stdout.decode()

    # print(xml_out)

    root = ET.fromstring(xml_out)

    for err_elem in root.find("errors").findall("error"):
        error = {}
        file_info = err_elem.find("location")

        err_file = 'generic'

        if file_info is not None:
            err_file = file_info.attrib["file"].removeprefix(rootpath).removeprefix("/")
            error['line'] = file_info.attrib["line"]
            error['column'] = file_info.attrib["column"]

        error['type'] = err_elem.attrib["id"]
        error['message'] = err_elem.attrib["msg"]
        
        if err_elem.attrib.keys().__contains__("cwe"):
            error['cwe'] = err_elem.attrib["cwe"]
            error['more_info'] = f"https://cwe.mitre.org/data/definitions/{error['cwe']}.html"
        else:
            error['cwe'] = None
            error['more_info'] = None

        symbol_info = err_elem.find("symbol")
        if symbol_info is not None:
            error["symbol"] = symbol_info.text

        if err_file == 'generic' and error['type'] == 'missingInclude':
            continue

        if err_file not in output:
            output[err_file] = {}

        if cppcheck_module.moduleNameFriendly not in output[err_file]:
            output[err_file][cppcheck_module.moduleNameFriendly] = []

        output[err_file][cppcheck_module.moduleNameFriendly].append(error)

    file_list = get_c_files(rootpath)

    for fileitem in file_list:
        rel_name = fileitem.removeprefix(rootpath).removeprefix("/")
        if rel_name not in output:
            output[rel_name] = {}
        if cppcheck_module.moduleNameFriendly not in output[rel_name]:
            output[rel_name][cppcheck_module.moduleNameFriendly] = []

    print("CppCheck is done.\n")

    return output

cppcheck_module.checker = run_cpp_check
cppcheck_module.checkerHelp = "Enable CWE Compliance Checks with CPPCheck"
cppcheck_module.register()