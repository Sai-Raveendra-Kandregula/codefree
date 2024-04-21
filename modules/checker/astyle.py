import os
from typing import List
from subprocess import Popen, PIPE

from astyle_py import Astyle

from modules.cf_checker import *
from modules import cf_output

astyle_module = CheckingModule()
astyle_module.module_name = "AStyle"
astyle_module.module_name_friendly = "Astyle"
astyle_module.module_type = CheckerTypes.STYLE

def get_c_files(path:str) -> List[str]:
    if not os.path.exists(path=path):
        return []
    # find ~/ha_mon/ -name *.c
    process = Popen(['find', path, '-name', "*.c"], stdout=PIPE, stderr=PIPE)
    stdout, stderr = process.communicate()
    return stdout.decode().splitlines()

def run_astyle(args, rootpath:str) -> List[CheckerOutput]:
    progress_printer = cf_output.get_progress_printer(args=args)
    error_printer = cf_output.get_error_printer(args=args)

    formatter = Astyle()
    out = []
    progress_printer(f'Using Astyle v{formatter.version()}')
    # formatter.set_options(f"--mode=c")

    file_list = get_c_files(rootpath)
    
    for fileitem in file_list:
        with open(fileitem, "r") as file:
            style_obj = CheckerOutput(astyle_module)
            style_obj.file_name_abs = fileitem
            style_obj.file_name = fileitem.removeprefix(rootpath).removeprefix("/")
            content = file.read()
            formatCheckPassed = formatter.format(content) == content
            # print(f'{rel_name} {"needs Formatting." if not formatCheckPassed else "is okay."}')

            style_obj.style_info.passed = formatCheckPassed
            out.append(style_obj)

    progress_printer("Astyle check is done.")
    return out

astyle_module.checker = run_astyle
astyle_module.checker_help = "Enable Astyle format checking"

CheckingModule.register(astyle_module)