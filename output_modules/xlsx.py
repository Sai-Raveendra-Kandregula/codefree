from cf_checker import *
from cf_output import FormattingModule, FormatOption, ArgActionOptions

from typing import List

import pandas as pd
import os

def output_xlsx(args, output: List[CheckerOutput] = []):
    sheets = {}

    if args.outputFile is not None:
        filepath = os.path.realpath(args.outputFile.name)
        args.outputFile.close()
        writer = pd.ExcelWriter(filepath)

        if args.calculateStats:
            pd.DataFrame.from_dict(CheckerStats.get_stats(),orient='columns').to_excel(writer, sheet_name="File Stats", index=None, index_label=None)
        
        item : CheckerOutput
        for item in output:
            module : CheckingModule = item._module

            if module.module_type != CheckerTypes.CODE or module.compliance_standard == ComplianceStandards.NONE:
                    if module.module_type.name not in sheets:
                        sheets[module.module_type.name] = []
                    sheets[module.module_type.name].append(item)
            else: 
                if module.compliance_standard.name not in sheets:
                    sheets[module.compliance_standard.name] = []
                sheets[module.compliance_standard.name].append(item)

        for sheet_name in sheets:
            pd.DataFrame.from_dict([row.dict() for row in sheets[sheet_name]],orient='columns').to_excel(writer, sheet_name=sheet_name, index=None, index_label=None)
        
        writer.close()

    return None

xlsx_format_obj = FormattingModule()

xlsx_format_obj.formatStr = "xlsx"
xlsx_format_obj.formatHelp = "Formats Output to Excel Spreadsheet"
xlsx_format_obj.formatter = output_xlsx
xlsx_format_obj.handlesOutputInternally = True

xlsx_format_obj.formatOptions = []

FormattingModule.register(xlsx_format_obj)