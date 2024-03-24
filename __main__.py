import xml.etree.ElementTree as ET
from subprocess import Popen, PIPE
import os
import sys
from typing import List

from astyle_py import Astyle

from cf_output import *
import output_modules.json
from checker_modules.astyle import run_astyle

# Test Script : python3 __main__.py -p <src_file>
# Test Configuration : 
# {
# }
#

def get_cppcheck_path() -> str:
    # type cppcheck &> /dev/null && echo "true" || echo "false"
    process = Popen(['which', 'cppcheck'], stdout=PIPE, stderr=PIPE)
    stdout, stderr = process.communicate()
    err = stderr.decode()
    if err.isspace() or (len(err) == 0):
        return stdout.decode().removesuffix("\n")
    else:
        return ""

def run_cpp_check(cppcheck_path:str, rootpath:str, output:dict):
    if len(cppcheck_path) == 0:
        return output
    process = Popen([f'{cppcheck_path}','--enable=all', '--suppress=missingIncludeSystem', '-q', '--xml', f'{rootpath}', '--output-file=/dev/stdout', f'-I{rootpath}/include'], stdout=PIPE, stderr=PIPE)
    stdout, stderr = process.communicate()

    # print(stderr.decode())

    xml_out = stdout.decode()

    root = ET.fromstring(xml_out)

    for err_elem in root.find("errors").findall("error"):
        error = {}
        file_info = err_elem.find("location")

        err_file = 'generic'

        if file_info is not None:
            err_file = file_info.attrib["file"].removeprefix(rootpath).removeprefix("/")
            error['location'] = {}
            error['location']['line'] = file_info.attrib["line"]
            error['location']['column'] = file_info.attrib["column"]

        error['type'] = err_elem.attrib["id"]
        error['message'] = err_elem.attrib["msg"]

        symbol_info = err_elem.find("symbol")
        if symbol_info is not None:
            error["symbol"] = symbol_info.text

        if err_file == 'generic' and error['type'] == 'missingInclude':
            continue

        if err_file not in output:
            output[err_file] = {}

        if 'cpp_check' not in output[err_file]:
            output[err_file]['cpp_check'] = []

        output[err_file]['cpp_check'].append(error)

    return output

def format_output(output: dict, format : str, args):
    return args.format(args, output)

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser("CodeFree")
    parser.add_argument(
        "-p",
        "--path",
        dest="path",
        nargs="?",
        action="store",
        help="Source Code Path",
        required=True,
        default=os.getcwd()
    )

    parser.add_argument(
        f"--output-file",
        dest="outputFile",
        action="store",
        type=argparse.FileType(mode='w+', errors=""),
        # type=argparse.FileType(mode='x', errors=""),
        help="Output to File",
        default=None
    )

    out_module : FormattingModule
    for out_module in FormattingModule.modules():
        parser.add_argument(
            f"--{out_module.formatStr}",
            dest="format",
            action="store_const",
            const=out_module.formatter,
            help=out_module.formatHelp
        )

        option : FormatOption
        for option in out_module.formatOptions:
            if option.argAction == ArgActionOptions.Empty:
                parser.add_argument(
                    f"--{option.option}",
                    dest=f"{option.argDest}",
                    action=option.argAction,
                    help=option.argHelp,
                    required=(f"--{out_module.formatStr}" in sys.argv)
                )
            else:
                parser.add_argument(
                    f"--{option.option}",
                    dest=f"{option.argDest}",
                    action="store",
                    const=option.argConst,
                    default=option.default,
                    help=option.argHelp
                )
    default_fmt = "json"
    parser.set_defaults(format=[module.formatter for module in FormattingModule.modules() if module.formatStr == default_fmt][0])
    parser.set_defaults(reset=False)

    args = parser.parse_args()

    # print("Output Format : " + args.format)

    print("Running CodeFree Analysis on path - " + args.path)

    print("\nFinding Checkers...")


    cppcheck_path = get_cppcheck_path()
    use_cppcheck = len(cppcheck_path) > 0
    if use_cppcheck:
        print("Found CPP Check at : " + cppcheck_path)
    else:
        print("CPPCheck not found, will be skipped.")

    print("Running Checks...")
    out = {}

    print("Running Astyle...")
    run_astyle(rootpath=args.path, output=out)

    if(use_cppcheck):
        print("Running CPP Check...")
        run_cpp_check(cppcheck_path=cppcheck_path, rootpath=args.path, output=out)

    if args.outputFile is None:
        print(args.format(args, out))
    else:
        args.outputFile.write(args.format(args, out))