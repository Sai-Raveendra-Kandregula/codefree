import datetime
from modules.cf_checker import *
from modules.cf_output import FormattingModule, FormatOption, ArgActionOptions

from typing import List

import json

def issue_item_str():
    return ""

NEWLINE = '\n'

def generate_asciidoc(args, output: List[CheckerOutput] = []):
    # timestamp = datetime.datetime.now(datetime.timezone.utc).timestamp()*1000
    commit_info = None
    if getattr(args, 'commit', None) is not None:
        commit_info : dict = args.commit
    
    report_data = ""
    
    title = "Codefree Report"
    if args.projectName is not None:
        title += " for " + args.projectName
    
    report_data += f"= {title}\n:toc:\n\n"
    
    report_data += f"== Analysis Run Information\n\n"
    report_data += f"=== Timestamp\n{datetime.datetime.now().astimezone().strftime('%Y-%m-%d %H:%M:%S %Z')}\n\n"
    
    if commit_info is not None:
        report_data += f"=== Commit Information\n\n{(' +'+NEWLINE).join([ key + ' : ' + value for key, value in commit_info.items()])}\n\n"
        # report_data += f"=== Commit Information\n\n{json.dumps(commit_info, indent=4)}\n\n"
    
    report_data += f"== Report\n\n"
    if len(output) == 0:
        report_data += "No Issues Found.\n"
    else:
        item : CheckerOutput
        
        group_data : dict[str, list[CheckerOutput]] = {}
        for item in output:
            if item.file_name not in group_data:
                group_data[item.file_name] = []
            group_data[item.file_name].append(item)
        
        for file_name in group_data.keys():
            group_data[file_name].sort(key=lambda x: x._module.module_type.value)
            report_data += f"\n=== {item.file_name}\n"
            item : CheckerOutput
            for item in group_data[file_name]:
                if item._module.module_type == CheckerTypes.CODE:
                    report_data += f"\n==== Code Check\n"
                    report_data += f"\n===== Description\n{item.error_info.description}\n"
                    report_data += f"\n===== Module\n{item._module.module_name_friendly}\n"
                    report_data += f"\n===== Severity\n{item.error_info.severity.name}\n"
                    if item.error_info.suggestion:
                        report_data += f"\n===== Recommendation\n{item.error_info.suggestion}\n"
                    
                    line_num_prefix = f" {item.error_info.line} | "
                    report_data += f"\n===== Context\n[source]\n----\n{line_num_prefix}{item.error_info.context}\n{' '*(len(line_num_prefix) + item.error_info.column - 1) + '^'}\n----\n"
                    if item.cwe_info:
                        report_data += f"\n===== CWE\n{', '.join([str(i) for i in item.cwe_info.cwe_list])}\n"
                        if item.cwe_info.additional_info:
                            report_data += f"\n===== References\n{item.cwe_info.additional_info}\n"
                    report_data += "\n"
                elif item._module.module_type == CheckerTypes.STYLE:
                    report_data += f"\n==== Style Check\n"
                    report_data += f"\n===== Module\n{item._module.module_name_friendly}\n"
                    report_data += f"\n===== Style Check Result\n{'Passed.' if item.style_info.passed else 'Failed.'}\n"
                    report_data += "\n"
    return report_data

def output_asciidoc(args, output: List[CheckerOutput] = []):
    args.outputFile.write(generate_asciidoc(args, output))

adoc_format_obj = FormattingModule()
adoc_format_obj.formatStr = "adoc"
adoc_format_obj.formatHelp = "Generates Report in AsciiDoc format"
adoc_format_obj.formatter = output_asciidoc

FormattingModule.register(adoc_format_obj)

def output_pdf(args, output: List[CheckerOutput] = []):
    raw_ascii_doc = generate_asciidoc(args, output)
    import subprocess
    subprocess.run(["asciidoctor-pdf", "-o", "-", "-"], input=raw_ascii_doc.encode('utf-8'), stdout=args.outputFile)

pdf_format_obj = FormattingModule()
pdf_format_obj.formatStr = "pdf"
pdf_format_obj.formatHelp = "Generates Report in PDF format"
pdf_format_obj.formatter = output_pdf

FormattingModule.register(pdf_format_obj)