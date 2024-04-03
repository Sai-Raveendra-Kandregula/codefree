from cf_output import FormattingModule, FormatOption, ArgActionOptions

import pandas as pd
import os

def output_xlsx(args, output: dict = {}):
    sheets = {}

    for file_name, file_output in output.items():
        # Fill in One Dimensional Values
        for checker_field, checker_output in file_output.items():
            if type(checker_output) not in [list, dict]:
                if 'common' not in sheets:
                    sheets['common'] = []
                obj = {}
                obj['File'] = file_name
                obj[checker_field] = checker_output
                sheets['common'].append(obj)

        # Expand Lists and Dicts
        for checker_field, checker_output in file_output.items():
            file_checker_obj = {}
            file_checker_obj['File'] = file_name
            if type(checker_output) == dict:
                if checker_field not in sheets:
                    sheets[checker_field] = []
                expanded = file_checker_obj.copy()
                for key in checker_output.keys():
                    expanded[key] = checker_output[key]
                sheets[checker_field].append(expanded)
            elif type(checker_output) == list:
                if len(checker_output) > 0:
                    if checker_field not in sheets:
                        sheets[checker_field] = []
                    for item in checker_output:
                        expanded = file_checker_obj.copy()
                        if type(item) == dict:
                            for key, val in item.items():
                                expanded[f'{key}'] = val
                        else:
                            expanded[checker_field] = item
                        sheets[checker_field].append(expanded)


    if args.outputFile is not None:
        filepath = os.path.realpath(args.outputFile.name)
        args.outputFile.close()
        writer = pd.ExcelWriter(filepath)
        file_stats_int = {}
        file_stats = []
        pd.DataFrame.from_dict(file_stats,orient='columns').to_excel(writer, sheet_name="File Stats", index=None, index_label=None)
        for key in sheets.keys():
            for item in sheets[key]:
                file_name = item['File']
                if file_name not in file_stats_int:
                    file_stats_int[file_name] = {}
                if key not in file_stats_int[file_name]:
                    file_stats_int[file_name][key] = 0
                file_stats_int[file_name][key] += 1

            pd.DataFrame.from_dict(sheets[key],orient='columns').to_excel(writer, sheet_name=key, index=None, index_label=None)
        
        for file in file_stats_int.keys():
            out_obj = {}
            out_obj['File'] = file
            for key in file_stats_int[file].keys():
                out_obj[key] = file_stats_int[file][key]
            file_stats.append(out_obj)

        pd.DataFrame.from_dict(file_stats,orient='columns').to_excel(writer, sheet_name="File Stats", index=None, index_label=None)
        writer.close()

    return None

xlsx_format_obj = FormattingModule()

xlsx_format_obj.formatStr = "xlsx"
xlsx_format_obj.formatHelp = "Formats Output to xlsx"
xlsx_format_obj.formatter = output_xlsx
xlsx_format_obj.handlesOutputInternally = True

# pretty_opt = FormatOption()
# pretty_opt.option = "json-pretty"
# pretty_opt.argDest = "jsonUsePretty"
# pretty_opt.argAction = ArgActionOptions.Empty
# pretty_opt.argHelp = "Prints JSON with Indentation"


xlsx_format_obj.formatOptions = []
# xlsx_format_obj.formatOptions.append(pretty_opt)

xlsx_format_obj.register()