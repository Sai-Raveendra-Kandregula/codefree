from typing import Dict, List, Callable, Any, TypeAlias

formats : List = []

class ArgActionOptions:
    Empty : str =  "store_true"

class FormatOption:
    option : str
    argDest : str
    argAction : str
    argHelp : str
    argConst : Any = None
    default : Any = None

FormatFunction : TypeAlias = Callable[[ Any, dict ], str]

class FormattingModule():
    formatStr : str
    formatter : FormatFunction
    formatOptions : List[FormatOption] = []
    formatHelp: str
    handlesOutputInternally : bool = False

    @classmethod
    def modules(cls):
        return formats
    
    def register(self):
        formats.append(self)

