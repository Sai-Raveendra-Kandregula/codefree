from enum import Enum
from typing import Dict, List, Callable, Any, TypeAlias
from argparse import Namespace

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


CheckingFunction : TypeAlias = Callable[[ Namespace, str ], List[Any]]

class CheckingModule():
    __checking_modules = []

    module_name : str # Use underscore for multiple words
    module_name_friendly : str = None
    module_type : CheckerTypes = None
    checker : CheckingFunction
    checker_help : str
    compliance_standard : ComplianceStandards = ComplianceStandards.NONE
    
    @classmethod
    def modules(cls):
        return cls.__checking_modules
    
    @classmethod
    def register(cls, module):
        cls.__checking_modules.append(module)

    @classmethod
    def run_checks(cls, args : Namespace):
        pass


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
        self.line : int = None
        self.column : int = None
        self.context : str = None
        self.symbol : str = None
        self.type : str = None
        self.severity : CheckerSeverity = CheckerSeverity.INFO
        self.description : str = None
        self.suggestion : str = None
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
        self.passed = True
        pass

    def dict(self) -> dict:
        return{
            "Check Passed" : "Passed" if self.passed else "Failed"
        }

class CWEInfo():
    primary_cwe : int = None
    cwe_list : list[int] = []
    additional_info : str = None

    def __init__(self) -> None:
        self.primary_cwe = None
        self.cwe_list = []
        self.additional_info = None
        pass

    def dict(self) -> dict:
        return {
            "Primary CWE" : self.primary_cwe,
            "CWE List" : ", ".join([str(cwe) for cwe in self.cwe_list]),
            "Additional Info" : self.additional_info,
        }

class MISRAInfo():
    rule_number : str = None
    additional_info : str = None

    def __init__(self) -> None:
        self.rule_number = None
        self.additional_info = None
        pass

    def dict(self) -> dict:
        return {
            "MISRA Rule Number" : self.rule_number,
            "Additional Info" : self.additional_info,
        }

class CheckerOutput():
    file_name : str = None
    file_name_abs : str = None
    style_info : StyleInfo = None
    error_info : ErrorInfo = None
    cwe_info : CWEInfo = None
    misra_info : MISRAInfo = None

    # module is supposed to be of type CheckingModule
    def __init__(self, module : CheckingModule) -> None:
        self._module = module

        if self._module.module_type == CheckerTypes.STYLE:
            self.style_info = StyleInfo()
        elif self._module.module_type == CheckerTypes.CODE:
            self.error_info = ErrorInfo()
            if self._module.compliance_standard == ComplianceStandards.CWE:
                self.cwe_info = CWEInfo()
            elif self._module.compliance_standard == ComplianceStandards.MISRA:
                self.misra_info = MISRAInfo()

    def dict(self) -> dict:
        out = {}
        out['File Name'] = self.file_name
        out['Module Name'] = self._module.module_name
        if self._module.module_type == CheckerTypes.STYLE:
            for key, value in self.style_info.dict().items():
                out[key] = value
        elif self._module.module_type == CheckerTypes.CODE:
            for key, value in self.error_info.dict().items():
                out[key] = value
            if self._module.compliance_standard == ComplianceStandards.CWE:
                for key, value in self.cwe_info.dict().items():
                    out[key] = value 
            elif self._module.compliance_standard == ComplianceStandards.MISRA:
                for key, value in self.misra_info.dict().items():
                    out[key] = value 

        return out

class CheckerStats():
    __instances : Dict[str, Dict[str, int]] = {}

    @classmethod
    def get_instances(cls):
        return cls.__instances
    
    @classmethod
    def get_stats(cls):
        out = []

        instances = cls.get_instances()

        count_info : Dict[str, int]

        for file_name, count_info in instances.items():
            stat_obj={}
            stat_obj["File Name"] = file_name
            for module_name, count in count_info.items():
                stat_obj[f"{module_name}"] = count
            out.append(stat_obj)

        return out
    
    @classmethod
    def count_item(cls, output_item:CheckerOutput):
        file_name = output_item.file_name

        module : CheckingModule = output_item._module
        module_name = module.module_type.name
        if module.module_type == CheckerTypes.CODE and module.compliance_standard != ComplianceStandards.NONE:
            module_name = module.compliance_standard.name

        if file_name not in cls.__instances:
            cls.__instances[file_name] = {}
        
        if module_name in cls.get_instances()[file_name]:
            cls.__instances[file_name][module_name] += 1
        elif module.module_type != CheckerTypes.STYLE or not output_item.style_info.passed:
            cls.__instances[file_name][module_name] = 1