from cf_checker import *
from cf_output import *
from output_modules import *
from checker_modules import *

import os
import argparse

def load_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(prog="codefree", description="CodeFree - Code Style Checker + Static Analysis and Reporting Tool")

    class LoadCodePath (argparse.Action):
        def __call__ (self, parser, namespace, values, option_string = None):
            if os.path.exists(values):
                if os.path.isdir(values):
                    os.chdir(values)
                else:
                    os.chdir(os.path.dirname(values))
                setattr(namespace, self.dest, values)

    class LoadFromFile (argparse.Action):
        def __call__ (self, parser, namespace, values, option_string = None):
            if values == ".codefreerc":
                values = os.path.join(os.getcwd(), ".codefreerc")
            if os.path.exists(values):
                with open(values, "r") as f:
                    # parse arguments in the file and store them in the target namespace
                    parser.parse_args(f.read().split(), namespace)
                setattr(namespace, self.dest, values)


    parser.add_argument(
        "-p",
        "--path",
        dest="path",
        nargs="?",
        action=LoadCodePath,
        help="Source Code Path. If not specified, the tool is run on the Current Working Directory.",
        default=os.getcwd(),
    )

    checkerGroup = parser.add_argument_group('Checker Options')

    checkerGroup.description = "Set CodeFree Checker Options. CodeFree runs all checkers by default. Set --enable to none if you want to enable individual checkers."

    checker_options = ["all"]
    checker_options.extend([checker_type.name.lower() for checker_type in CheckerTypes ])

    checkerGroup.add_argument(
        f"--enable-checker",
        dest=f"enableCheckers",
        action="append",
        choices=checker_options,
        default=[],
        help="Enable/disable various types of code checks. All types of checks are enabled by default."
    )

    compliance_options = ["all"]
    compliance_options.extend([ComplianceStandards.CWE.name.lower(), ComplianceStandards.MISRA.name.lower()])
    compliance_options.sort()

    checkerGroup.add_argument(
        f"--code-standard",
        dest=f"enableComplianceCheckers",
        action="append",
        choices=compliance_options,
        default=[],
        help=f"Enable/disable code standard compliance checks. All compliance checks are enabled by default (--{CheckerTypes.CODE.name.lower()} checker has to be enabled)."
    )
    
    default_formatter = FormattingModule.get_default()
    parser.set_defaults(formatClass=default_formatter.formatStr)
    outputGroup = parser.add_argument_group('Output Options')
    outputGroup.description = f"Set Output Format and other options. If multiple formats are mentioned, last specified format is used."
    
    outputGroup.add_argument(
        f"--output-file",
        dest="outputFile",
        action="store",
        type=argparse.FileType(mode='w+', errors=""),
        # type=argparse.FileType(mode='x', errors=""),
        help="Output to File. If not specified, raw output is printed to stdout.",
        default=None,
        metavar="<path_to_output>"
    )
    
    format_modules = FormattingModule.modules()

    outputGroup.add_argument(
            f"--quiet",
            dest="printProgress",
            action="store_false",
            help=f"Do not print progress messages."
        )
    
    outputGroup.add_argument(
            f"--no-stats",
            dest="calculateStats",
            action="store_false",
            help=f"Do not calculate Issue Statistics."
        )

    outputGroup.add_argument(
            f"--format",
            dest="formatClass",
            action="store",
            choices=[module.formatStr for module in format_modules],
            help=f"Output Format. If not specified, raw object is dumped to stdout."
        )

    out_module : FormattingModule
    for out_module in format_modules:
        outModuleOpts = parser.add_argument_group(f'{out_module.formatStr} Output Options')
        if (len(out_module.formatOptions) > 0):
            outModuleOpts.description = f"These options should be used along with --{out_module.formatStr}, else they are ignored."

            option : FormatOption
            for option in out_module.formatOptions:
                if option.argAction == ArgActionOptions.Empty:
                    outModuleOpts.add_argument(
                        f"--{option.option}",
                        dest=f"{option.argDest}",
                        action=option.argAction,
                        help=option.argHelp
                    )
                else:
                    outModuleOpts.add_argument(
                        f"--{option.option}",
                        dest=f"{option.argDest}",
                        action="store",
                        const=option.argConst,
                        default=option.default,
                        help=option.argHelp
                    )

    optionsFileAction = parser.add_argument(
        '--options-file', 
        type=str, 
        dest='optionsFile',
        action=LoadFromFile, 
        default=None,
        metavar="<path_to_options_file>",
        help="Options File. If not provided, CodeFree will attempt to use the .codefreerc file in the provided path, if it exists.",
        )
    
    args = parser.parse_args()
    if args.optionsFile == None:
        optionsFileAction.__call__(parser=parser, namespace=args, values=".codefreerc")

    return args