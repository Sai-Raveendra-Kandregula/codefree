from __future__ import annotations
from enum import Enum
import os
import subprocess
from typing import Dict, List, Callable, Any, TypeAlias
from argparse import Namespace

import fnmatch
import re
import json

from modules.cf_output import get_progress_printer, get_error_printer
import pandas as pd

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

    __checker_output : List[Any] = []

    module_name : str # Will be used for Reporting
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
    def get_git_commit(cls, args : Namespace) -> dict | None:
        if(os.system(f"cd {args.path} ; git rev-parse --is-inside-work-tree | grep true > /dev/null") == 0):
            # Is a git directory
            path : str = args.path
            path = path.removesuffix("/")
            fmt = "--pretty=format:{\"hash\":\"%H\",\"author\":\"%an\",\"date\":\"%ad\",\"email\":\"%aE\",\"subject\":\"%s\",\"body\": \"%b\",\"notes\":\"%N\",\"commitDate\":\"%ai\",\"age\":\"%cr\"}"
            process = subprocess.Popen(['git', '--git-dir', f"{path}/.git", 'log', '-n 1', fmt], stdout=subprocess.PIPE, stderr=subprocess.PIPE, encoding='utf-8')
            stdout, stderr = process.communicate()
            return json.loads(stdout, strict=False)
        return None

    @classmethod
    def run_checks(cls, args : Namespace) -> List[Any]:
        progress_printer = get_progress_printer(args=args)
        error_printer = get_error_printer(args=args)

        checker_module : CheckingModule
        for checker_module in CheckingModule.modules():
            enabled_checkers = args.__getattribute__(f"enableCheckers")
            if ("all" in enabled_checkers or len(enabled_checkers) == 0 
                or checker_module.module_type.name.lower() in enabled_checkers):
                enabled_compliance_checkers = args.__getattribute__(f"enableComplianceCheckers")
                if (checker_module.module_type == CheckerTypes.STYLE or 
                    (checker_module.module_type == CheckerTypes.CODE and 
                    ("all" in enabled_compliance_checkers or len(enabled_compliance_checkers) == 0 
                    or checker_module.compliance_standard.name.lower() in enabled_compliance_checkers))):
                    progress_printer(f"Running {checker_module.module_name_friendly}...")
                    checker_output = checker_module.checker(args, args.path)
                    out_item : CheckerOutput
                    for out_item in checker_output:
                        filepath = out_item.file_name
                        ignore = False
                        if len(args.ignorePaths) > 0:
                            for ignorepath in args.ignorePaths:
                                matchpattern = fnmatch.translate(ignorepath)
                                reg_obj = re.compile(matchpattern)
                                if reg_obj.match(filepath):
                                    ignore = True
                                    break
                        if not ignore:
                            cls.__checker_output.append(out_item)


        return cls.__checker_output
    
    @classmethod
    def get_output(cls):
        return cls.__checker_output


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
    def __init__(self, module : CheckingModule = None, dict_data : dict = None) -> None:
        if module is not None:
            self._module = module

            if self._module.module_type == CheckerTypes.STYLE:
                self.style_info = StyleInfo()
            elif self._module.module_type == CheckerTypes.CODE:
                self.error_info = ErrorInfo()
                if self._module.compliance_standard == ComplianceStandards.CWE:
                    self.cwe_info = CWEInfo()
                elif self._module.compliance_standard == ComplianceStandards.MISRA:
                    self.misra_info = MISRAInfo()
        elif dict_data is not None:
            self.file_name = dict_data['File Name']

            module = CheckingModule()
            module.module_name = dict_data['Module Name']
            module.module_type = getattr(CheckerTypes, dict_data['Module Type'].upper())
            module.compliance_standard = getattr(ComplianceStandards, dict_data['Compliance Standard'].upper()) if 'Compliance Standard' in dict_data else ComplianceStandards.NONE
            self._module = module

            if self._module.module_type == CheckerTypes.STYLE:
                self.style_info = StyleInfo()
                self.style_info.passed = (dict_data["Check Passed"] == "Passed")
            elif self._module.module_type == CheckerTypes.CODE:
                self.error_info = ErrorInfo()
                """
                "Severity" : self.severity.name.title(),
                "Line" : self.line,
                "Column" : self.column,
                "Context" : self.context,
                "Description" : self.description,
                "Symbol" : self.symbol,
                "Type" : self.type,
                "Suggestion" : self.suggestion,
                """
                self.error_info.severity = getattr(CheckerSeverity, dict_data['Severity'].upper())
                self.error_info.line = dict_data['Line']
                self.error_info.column = dict_data['Column']
                self.error_info.context = dict_data['Context']
                self.error_info.description = dict_data['Description']
                self.error_info.symbol = dict_data['Symbol']
                self.error_info.type = dict_data['Type']
                self.error_info.suggestion = dict_data['Suggestion']

                if self._module.compliance_standard == ComplianceStandards.CWE:
                    """
                    "Primary CWE" : self.primary_cwe,
                    "CWE List" : ", ".join([str(cwe) for cwe in self.cwe_list]),
                    "Additional Info" : self.additional_info,
                    """
                    self.cwe_info = CWEInfo()
                    self.cwe_info.primary_cwe = dict_data['Primary CWE']
                    self.cwe_info.cwe_list = dict_data['CWE List'].split(", ")
                    self.cwe_info.additional_info = dict_data['Additional Info']
                elif self._module.compliance_standard == ComplianceStandards.MISRA:
                    """
                    "MISRA Rule Number" : self.rule_number,
                    "Additional Info" : self.additional_info,
                    """
                    self.misra_info = MISRAInfo()
                    self.misra_info.rule_number = dict_data['MISRA Rule Number']
                    self.misra_info.additional_info = dict_data['Additional Info']



    def dict(self) -> dict:
        out = {}
        out['Module Type'] = self._module.module_type.name.lower()
        out['File Name'] = self.file_name
        out['Module Name'] = self._module.module_name
        if self._module.module_type == CheckerTypes.STYLE:
            for key, value in self.style_info.dict().items():
                out[key] = value
        elif self._module.module_type == CheckerTypes.CODE:
            out['Compliance Standard'] = self._module.compliance_standard.name
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
    def reset(cls):
        cls.__instances = {}
    
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
        elif module.module_type == CheckerTypes.STYLE and output_item.style_info.passed:
            cls.__instances[file_name][module_name] = 0

    @classmethod
    def calculateStats(cls, args):
        output = CheckingModule.get_output()
        if args.calculateStats:
            for output_item in output:
                CheckerStats.count_item(output_item)
    
    @classmethod
    def printStats(cls, args):
        if args.calculateStats:
            stats = CheckerStats.get_stats()
            df = pd.DataFrame.from_dict(stats)
            # append sums to the data frame
            stats_table_str = df.to_string(index=None, float_format=lambda x: str(int(x)), index_names=None, na_rep=0, line_width=80)
            print("")
            print("-"*stats_table_str.index("\n"))
            print("Issues found by CodeFree : ")
            print("-"*stats_table_str.index("\n"))
            print(stats_table_str)
            print("-"*stats_table_str.index("\n"))
            checkers = list(stats[0].keys())[1:]
            sum_series = df[list(stats[0].keys())[1:]].sum()
            for checker in checkers:
                print(f"Total # of Issues in {checker} : {int(sum_series.loc[checker])}")
            print("-"*stats_table_str.index("\n"), end="\n\n")