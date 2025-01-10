import datetime
from math import ceil
from modules.cf_checker import *
from modules.cf_output import FormattingModule, FormatOption, ArgActionOptions

from typing import List

import json

def issue_item_str():
    return ""

NEWLINE = '\n'

def filename_to_id(filename: str):
    return filename.replace('.', '_').replace('/', '_').replace('\\', '_')

def checker_severity_to_color(severity: CheckerSeverity):
    if severity == CheckerSeverity.CRITICAL:
        return "red"
    elif severity == CheckerSeverity.MAJOR:
        return "orange"
    elif severity == CheckerSeverity.MINOR:
        return "yellow"
    elif severity == CheckerSeverity.INFO:
        return "blue"
    else:
        return "black"

def generate_asciidoc(args, output: List[CheckerOutput] = []):
    # timestamp = datetime.datetime.now(datetime.timezone.utc).timestamp()*1000
    commit_info = None
    if getattr(args, 'commit', None) is not None:
        commit_info : dict = args.commit
    
    report_data = ""
    
    title = "Codefree Report"
    if args.projectName is not None:
        title += " for " + args.projectName
    
    ts = datetime.datetime.now().astimezone().strftime('%Y-%m-%d %H:%M:%S %Z')
    report_data += f"= {title}\n\n"
    
    report_data += f"== Analysis Run Information\n\n"
    report_data += f"=== Report Timestamp\n{ts}\n\n"
    
    if commit_info is not None:
        report_data += f"=== Commit Information\n\n{(' +'+NEWLINE).join([ key + ' : ' + value for key, value in commit_info.items() if len(value.strip()) > 0])}\n\n"
        
    stats = CheckerStats.get_stats()
    overall_score = CheckerStats.get_aggregate_score()
    normal_score = CheckerStats.get_score_normalization()
    default_fields = CheckerStats.get_default_fields()
    field_count = len(stats[0].keys())
    report_data += f"== Statistics\n\n"
    report_data += f"*Codefree Code Quality Score* : {round(overall_score, 4)} / {normal_score} (Higher is better)\n\n"
    report_data += f"=== File Level Stats\n\n"
    report_data += f"""[cols="{int(ceil(field_count/2))}, {", 1".join(["" for _ in range(field_count - 1)])}*", options="header"]\n|========================================\n"""
    report_data += f"""| File Name {" ".join([f"| # of {key.upper()} Issues" for key in stats[0].keys() if key not in default_fields])} | Score (out of {normal_score}) | Total # of Issues\n"""
    for stat in stats:
        report_data += f"""| <<{filename_to_id(stat['File_Name'])}>> {" ".join([f"| {value}" for key, value in stat.items() if key not in default_fields])} | {stat['Score']} | {stat['Total']}\n"""
    report_data += """|========================================\n\n"""
    
    if len(output) > 0:
        report_data += f"== Report\n\n"
        item : CheckerOutput
        
        group_data : dict[str, list[CheckerOutput]] = {}
        for item in output:
            if filename_to_id(item.file_name) not in group_data:
                group_data[filename_to_id(item.file_name)] = []
            group_data[filename_to_id(item.file_name)].append(item)
        
        for file_name_id in group_data.keys():
            group_data[file_name_id].sort(key=lambda x: (x.error_info.severity.value if x.error_info is not None else CheckerSeverity.INFO.value), reverse=True)
            group_data[file_name_id].sort(key=lambda x: x._module.module_type.value)
            report_data += f"\n=== {item.file_name} [[{file_name_id}]]\n"
            item : CheckerOutput
            for item in group_data[file_name_id]:
                if item._module.module_type == CheckerTypes.CODE:
                    report_data += f"\n==== Code Check by {item._module.module_name_friendly}\n"
                    report_data += f"\n*Severity* : [{checker_severity_to_color(item.error_info.severity)}]#{item.error_info.severity.name}#\n"
                    desc = item.error_info.description
                    if item.cwe_info:
                        desc = re.sub(r"CWE-(\d+)", r" https://cwe.mitre.org/data/definitions/\g<1>.html[CWE-\g<1>] ", desc)
                    if item.misra_info:
                        desc = desc + f" (MISRA Rule {item.misra_info.rule_number})"
                    report_data += f"\n===== Description\n{desc}\n"
                    
                    line_num_prefix = f" {item.error_info.line} | "
                    report_data += f"\n===== Context\n[source]\n----\n{line_num_prefix}{item.error_info.context}\n{' '*(len(line_num_prefix) + item.error_info.column - 1) + '^'}\n----\n"
                    
                    if item.error_info.symbol:
                        report_data += f"\n*Symbol* : {item.error_info.symbol}\n"
                    if item.error_info.suggestion:
                        report_data += f"\n===== Recommendation\n{item.error_info.suggestion}\n"
                    
                    # if item.cwe_info:
                    #     if len(item.cwe_info.cwe_list) > 1:
                    #         report_data += f"\n===== CWE\n{', '.join([f'https://cwe.mitre.org/data/definitions/{i}.html[CWE-{i}]' for i in item.cwe_info.cwe_list])}\n"
                    if item.misra_info:
                        if item.misra_info.additional_info:
                            report_data += f"\n===== References\n{item.misra_info.additional_info}\n"
                    report_data += "\n"
                elif item._module.module_type == CheckerTypes.STYLE:
                    report_data += f"\n==== Style Check by {item._module.module_name_friendly}\n"
                    report_data += f"\n*Check Result* : {'[green]#Passed#' if item.style_info.passed else '[red]#Failed#'}\n"
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
    subprocess.run(["asciidoctor-pdf", "--theme", "codefree", "-a", f"pdf-themesdir={os.path.join(os.path.dirname(__file__), 'pdf_resources/themes')}", "-o", "-", "-"], input=raw_ascii_doc.encode('utf-8'), stdout=args.outputFile)

pdf_format_obj = FormattingModule()
pdf_format_obj.formatStr = "pdf"
pdf_format_obj.formatHelp = "Generates Report in PDF format"
pdf_format_obj.formatter = output_pdf

FormattingModule.register(pdf_format_obj)