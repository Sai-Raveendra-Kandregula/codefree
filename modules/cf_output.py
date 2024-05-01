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
    error_printer = lambda *fmt: print(*fmt, file=sys.stderr)

    return error_printer

def get_progress_printer(args):
    progress_printer = lambda *fmt: print(*fmt)

    if not args.printProgress:
        progress_printer = lambda *fmt: None
    return progress_printer

class FormattingModule():
    formatStr : str
    formatter : FormatFunction
    formatOptions : List[FormatOption]
    formatHelp: str
    handlesOutputInternally : bool
    preCheck : types.FunctionType

    __default = None
    __modules = {}

    def __init__(self) -> None:
        self.formatOptions = []
        self.handlesOutputInternally = False
        self.preCheck = None

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
        if args.outputFile is None:
            print(json.dumps([item.dict() for item in output], indent=2))
        else:
            format_module : FormattingModule = FormattingModule.get_module(args.formatClass)
            format_module.formatter(args, output)

