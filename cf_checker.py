from enum import Enum
from typing import Dict, List, Callable, Any, TypeAlias

checking_modules = {}

class CheckerSeverity(Enum):
    INFO = 0
    MINOR = 1,
    MAJOR = 2,
    CRITICAL = 3

class CheckerTypes(Enum):
    STYLE = 0
    CODE = 1

class ComplianceStandards(Enum):
    NONE = 0
    CWE = 1
    MISRA = 2


CheckingFunction : TypeAlias = Callable[[ Any ], List[Any]]

class CheckingModule():
    module_name : str # Use underscore for multiple words
    module_name_friendly : str = None
    module_type : CheckerTypes = None
    checker : CheckingFunction
    checker_help : str
    compliance_standard : ComplianceStandards = ComplianceStandards.NONE

    @classmethod
    def get_module(cls, module_name):
        if module_name in checking_modules:
            return checking_modules[module_name]
        return None
    
    @classmethod
    def modules(cls):
        return [ value for key, value in checking_modules.items() ]
    
    def register(self):
        checking_modules[self.module_name] = self


class ErrorInfo():
    line : int = None
    column : int = None
    context : str = None
    symbol : str = None
    type : str = None
    severity : CheckerSeverity = CheckerSeverity.INFO
    description : str = None
    suggestion : str = None

    def __init__(self) -> None:
        pass

    def dict(self) -> dict:
        return {
            "Severity" : self.severity.name.title(),
            "Line" : self.line,
            "Column" : self.column,
            "Context" : self.context,
            "Description" : self.description,
            "Symbol" : self.symbol,
            "Type" : self.type,
            "Suggestion" : self.suggestion,
        }

class StyleInfo():
    passed : bool = True

    def __init__(self) -> None:
        pass

class CWEInfo():
    primary_cwe : int = None
    cwe_list : list[int] = []
    additional_info : str = None

    def __init__(self) -> None:
        pass

    def dict(self) -> dict:
        return {
            "Primary CWE" : self.primary_cwe,
            "CWE List" : self.cwe_list,
            "Additional Info" : self.additional_info,
        }

class MISRAInfo():
    rule_number : str = None
    additional_info : str = None

    def __init__(self) -> None:
        pass

    def dict(self) -> dict:
        return {
            "MISRA Rule Number" : self.rule_number,
            "Additional Info" : self.additional_info,
        }

class CheckerOutput():
    module_name : str = None
    module_type : CheckerTypes
    module_compliance : ComplianceStandards = ComplianceStandards.NONE
    file_name : str = None
    file_name_abs : str = None
    style_info : StyleInfo = None
    error_info : ErrorInfo = None
    cwe_info : CWEInfo = None
    misra_info : MISRAInfo = None

    # module is supposed to be of type CheckingModule
    def __init__(self, module : CheckingModule) -> None:
        self.module_name = module.module_name
        self.module_type = module.module_type
        self.module_compliance = module.compliance_standard

        if self.module_type == CheckerTypes.STYLE:
            self.style_info = StyleInfo()
        elif self.module_type == CheckerTypes.CODE:
            self.error_info = ErrorInfo()
            if self.module_compliance == ComplianceStandards.CWE:
                self.cwe_info = CWEInfo()
            elif self.module_compliance == ComplianceStandards.MISRA:
                self.misra_info = MISRAInfo()

    def dict(self) -> dict:
        out = {}
        out['File Name'] = self.file_name
        out['Module Name'] = self.module_name
        if self.module_type == CheckerTypes.STYLE:
            out['Check Passed'] = "Passed" if self.style_info.passed else "Failed"
        elif self.module_type == CheckerTypes.CODE:
            for key, value in self.error_info.dict().items():
                out[key] = value
            if self.module_compliance == ComplianceStandards.CWE:
                for key, value in self.cwe_info.dict().items():
                    out[key] = value 
            elif self.module_compliance == ComplianceStandards.MISRA:
                for key, value in self.misra_info.dict().items():
                    out[key] = value 

        return out