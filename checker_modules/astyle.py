import os
from typing import List
from subprocess import Popen, PIPE

from astyle_py import Astyle

from cf_checker import CheckingModule

def get_c_files(path:str) -> List[str]:
    if not os.path.exists(path=path):
        return []
    # find ~/ha_mon/ -name *.c
    process = Popen(['find', path, '-name', "*.c"], stdout=PIPE, stderr=PIPE)
    stdout, stderr = process.communicate()
    return stdout.decode().splitlines()

def run_astyle(rootpath:str, output:dict):
    formatter = Astyle()
    print(f'Formatted with Astyle v{formatter.version()}')
    formatter.set_options(f"--mode=c")

    file_list = get_c_files(rootpath)
    
    for fileitem in file_list:
        rel_name = fileitem.removeprefix(rootpath).removeprefix("/")
        with open(fileitem, "r") as file:
            content = file.read()
            formatCheckPassed = formatter.format(content) == content
            print(f'{rel_name} {"needs Formatting." if not formatCheckPassed else "is okay."}')

            if rel_name not in output:
                output[rel_name] = {}
            output[rel_name]['astyle_passed'] = formatCheckPassed

    return output

astyle_module = CheckingModule()
astyle_module.moduleName = "astyle"
astyle_module.checker = run_astyle