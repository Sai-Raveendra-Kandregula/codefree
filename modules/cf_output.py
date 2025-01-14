import os
from typing import Dict, List, Callable, Any, TypeAlias
import types
import sys

class ArgActionOptions:
    Save : str = "store"
    Empty : str =  "store_true"

class FormatOption:
    option : str
    argDest : str
    argAction : str
    argHelp : str
    argConst : Any
    default : Any

    def __init__(self) -> None:
        self.argAction = ArgActionOptions.Save
        self.argConst = None
        self.default = None

    def __str__(self):
        return str({
            "option" : self.option
        })

FormatFunction : TypeAlias = Callable[[ Any, List[Any] ], str]

def get_error_printer(args):
    def error_printer(*fmt):
        print(*fmt, file=sys.stderr)
        sys.stderr.flush()
    return error_printer

def get_progress_printer(args):
    def progress_printer(*fmt):
        if args.printProgress:
            print(*fmt)
            sys.stdout.flush()
    return progress_printer

class FormattingModule():
    formatStr : str
    formatter : FormatFunction
    formatOptions : List[FormatOption]
    formatHelp: str
    handlesOutputInternally : bool
    hasNoOutputFile : bool
    extension : str | None
    preCheck : types.FunctionType

    __default = None
    __modules = {}

    def __init__(self) -> None:
        self.formatOptions = []
        self.handlesOutputInternally = False
        self.hasNoOutputFile = False
        self.preCheck = None
        self.extension = None

    def __str__(self):
        return str({
            "options" : [str(opt) for opt in self.formatOptions]
        })

    @classmethod
    def set_default(cls, module):
        cls.__default = module

    @classmethod
    def get_default(cls):
        return cls.__default if cls.__default is not None else cls.__modules.values()[0]

    @classmethod
    def modules(cls):
        return cls.__modules.values()
    
    @classmethod
    def get_module(cls, formatStr):
        if formatStr in cls.__modules:
            return cls.__modules[formatStr]
        return None
    
    @classmethod
    def register(cls, module):
        cls.__modules[module.formatStr] = module

    @classmethod
    def generate_output(cls, args):
        from modules import cf_checker
        import json
        output = cf_checker.CheckingModule.get_output()
        format_module : FormattingModule = FormattingModule.get_module(args.formatClass)

        if args.outputFile is None and not format_module.hasNoOutputFile:
            print(json.dumps([item.dict() for item in output], indent=2))
        else:
            filename = args.outputFile.name
            format_module.formatter(args, output)
            os.chmod(filename, 0o755)

