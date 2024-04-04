from enum import Enum
from typing import Dict, List, Callable, Any, TypeAlias

checking_modules = []

class CheckerTypes(Enum):
    STYLE = 0
    CODE = 1
    LINT = 2 # STYLE AND PROGRAMMING ERRORS

class ComplianceStandards(Enum):
    NONE = 0
    CWE = 1
    MISRA = 2

CheckingFunction : TypeAlias = Callable[[ Any, dict ], dict]

class CheckingModule():
    moduleName : str # Use underscore for multiple words
    moduleNameFriendly : str = None
    checker : CheckingFunction
    checkerHelp : str
    checkerType : CheckerTypes = CheckerTypes.CODE
    complianceStandard : ComplianceStandards = ComplianceStandards.NONE

    @classmethod
    def modules(cls):
        return checking_modules
    
    def register(self):
        checking_modules.append(self)

class CheckerOutputBase():
    moduleName : str = None
    moduleType : CheckerTypes = None
    line : int = -1
    column : int = -1
    context : str = None
    symbol : str = None
    error_type : str = None
    error_severity : str = None
    error : str = None
    suggested_fix : str = None
    primary_cwe : int = None
    cwe_list : int = None
    external_error_info : str = None

class StyleCheckerOutput(CheckerOutputBase):
    def __init__(self) -> None:
        super().__init__()

class CodeCheckerOutput(CheckerOutputBase):
    def __init__(self) -> None:
        super().__init__()

class CheckerOutput():
    style_output : StyleCheckerOutput = None
    code_output : CodeCheckerOutput = None