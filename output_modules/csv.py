from cf_output import FormattingModule, FormatOption, ArgActionOptions
from cf_checker import *
import pandas as pd

def output_csv(args, output: List[CheckerOutput] = []):
    csv_string = pd.DataFrame.from_dict([item.dict() for item in output], orient='columns').to_csv(index=None, index_label=None)

    args.outputFile.write(csv_string)

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

FormattingModule.register(csv_format_obj)