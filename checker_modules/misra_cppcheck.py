import os
from typing import List
from subprocess import Popen, PIPE
import xml.etree.ElementTree as ET

from cf_checker import CheckingModule, ComplianceStandards
from checker_modules.libraries import misra_mappings, error_context

misra_module = CheckingModule()
misra_module.moduleName = "misra_cppcheck"
misra_module.moduleNameFriendly = "MISRA Checks with CPPCheck"
misra_module.complianceStandard = ComplianceStandards.MISRA

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

    misra_path = os.path.join(dir_path, 'binaries', 'cppcheck')

    if os.path.exists(misra_path):
        return misra_path
    else:
        return ""

def run_cpp_check_misra(rootpath:str, output:dict):
    misra_path = get_cppcheck_path()
    if len(misra_path) == 0:
        print("Bundled CPPCheck Binary not found. Skipping...")
        return output
    print("\nRunning MISRA Checks using CPPCheck...")
    process = Popen([f'{misra_path}', '--addon=misra', '-q', '--xml', f'{rootpath}', '--output-file=/dev/stdout'], stdout=PIPE, stderr=PIPE)
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
            error['context'] = error_context.get_error_context(file_info.attrib["file"], int(file_info.attrib["line"]))

        misra_rule = mappings[f"Rule_{err_elem.attrib['id'].replace('misra-c', '').split('-')[1]}"]
        error['type'] = misra_rule['rule_no']
        error['message'] = misra_rule['description']

        if err_file == 'generic':
            continue

        if err_file not in output:
            output[err_file] = {}

        if misra_module.moduleNameFriendly not in output[err_file]:
            output[err_file][misra_module.moduleNameFriendly] = []

        output[err_file][misra_module.moduleNameFriendly].append(error)

    file_list = get_c_files(rootpath)

    for fileitem in file_list:
        rel_name = fileitem.removeprefix(rootpath).removeprefix("/")
        if rel_name not in output:
            output[rel_name] = {}
        if misra_module.moduleNameFriendly not in output[rel_name]:
            output[rel_name][misra_module.moduleNameFriendly] = []

    print("MISRA is done.\n")

    return output

misra_module.checker = run_cpp_check_misra
misra_module.checkerHelp = "Enable MISRA Compliance Checks with CPPCheck"
misra_module.register()