from cf_output import FormattingModule, FormatOption, ArgActionOptions

import pandas as pd
import json
import csv

def output_csv(args, output: dict = {}):
    flattened_data = []

    for file_name, file_output in output.items():
        file_objs = []
        file_obj = {}
        file_obj['file_name'] = file_name

        # Fill in One Dimensional Values
        for checker_field, checker_output in file_output.items():
            if type(checker_output) not in [list, dict]:
                file_obj[checker_field] = checker_output

        # Expand Lists and Dicts
        for checker_field, checker_output in file_output.items():
            if type(checker_output) == list:
                if len(checker_output) > 0:
                    for item in checker_output:
                        expanded = file_obj.copy()
                        if type(item) == dict:
                            for key, val in item.items():
                                expanded[f'{checker_field}_{key}'] = val
                        else:
                            expanded[checker_field] = item
                        file_objs.append(expanded)
        
        # Nothing is Expanded
        if len(file_objs) == 0:
            file_objs.append(file_obj)

        flattened_data.extend(file_objs)

    csv_string = pd.DataFrame.from_dict(flattened_data,orient='columns').to_csv(index=None, index_label=None)

    return csv_string

csv_format_obj = FormattingModule()

csv_format_obj.formatStr = "csv"
csv_format_obj.formatHelp = "Formats Output to CSV"
csv_format_obj.formatter = output_csv

# pretty_opt = FormatOption()
# pretty_opt.option = "json-pretty"
# pretty_opt.argDest = "jsonUsePretty"
# pretty_opt.argAction = ArgActionOptions.Empty
# pretty_opt.argHelp = "Prints JSON with Indentation"


csv_format_obj.formatOptions = []
# csv_format_obj.formatOptions.append(pretty_opt)

csv_format_obj.register()