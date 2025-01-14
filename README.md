# CodeFree

Code Style Checking, Static Analysis and Reporting Tool.

## Usage

```
usage: codefree [-h] [--transform-json <raw_json_file>] [-p [PATH]] [-i [IGNOREPATHS]] [-I [INCLUDEPATHS]] [--enable-checker {all,style,code}]
                [--code-standard {all,cwe,misra}] [--output {adoc,pdf,csv,json,server,xlsx}] [--output-file <path_to_output>] [--quiet] [--no-stats]
                [--project-name PROJECTNAME] [--json-pretty] [--server-url SERVERURL] [--cf-project CFPROJECT] [--cf-username CFUSERNAME] [--cf-password CFPASSWORD]
                [--options-file <path_to_options_file>]

CodeFree - Code Style Checker + Static Analysis and Reporting Tool

options:
  -h, --help            show this help message and exit
  --transform-json <raw_json_file>
                        Provide a JSON File emitted by Codefree to transform into a Report. If this is provided, other input options will be ignored
  -p [PATH], --path [PATH]
                        Source Code Path. If not specified, the tool is run on the Current Working Directory.
  -i [IGNOREPATHS], --ignore [IGNOREPATHS]
                        Ignore Specific Files. Use Multiple times to ignore multiple files. Supports Regex.
  -I [INCLUDEPATHS], --include [INCLUDEPATHS]
                        Specify Include Path. If not specified, the include directory in the code path will be attempted to use.
  --options-file <path_to_options_file>
                        Specify an Options File. CLI Options hold more priority. If not provided, CodeFree will attempt to use the .codefreerc file in the provided path, if it
                        exists.

Checker Options:
  Set CodeFree Checker Options. CodeFree runs all checkers by default. Set --enable to none if you want to enable individual checkers.

  --enable-checker {all,style,code}
                        Enable/disable various types of code checks. All types of checks are enabled by default.
  --code-standard {all,cwe,misra}
                        Enable/disable code standard compliance checks. All compliance checks are enabled by default (--code checker has to be enabled).

Output Options:
  Set Output Format and other options. If multiple formats are mentioned, last specified format is used.

  --output {adoc,pdf,csv,json,server,xlsx}
                        Choose Output Module. If not specified, raw object is dumped to stdout.
  --output-file <path_to_output>
                        Output to File. If not specified, raw output is printed to stdout.
  --quiet               Do not print progress messages.
  --no-stats            Do not calculate Issue Statistics.
  --project-name PROJECTNAME
                        Project Name to be used in Reports.

json Output Options:
  Formats Output to JSON. The following options can be used along with `--format json`, else they are ignored.

  --json-pretty         Prints JSON with Indentation

server Output Options:
  Uploads Report to CodeFree Server. The following options can be used along with `--format server`, else they are ignored.

  --server-url SERVERURL
                        CodeFree Server Address
  --cf-project CFPROJECT
                        CodeFree Server Project Slug
  --cf-username CFUSERNAME
                        CodeFree Server User Name
  --cf-password CFPASSWORD
                        CodeFree Server password
```

## Style Checkers

CodeFree currently has the following style checkers:

## Code Compliance Standard Analyzers
- `CWE` - Checked using `cppcheck` and `flawfinder`
- `MISRA` - Checked using `cppcheck`'s misra addon

## Output Formats

CodeFree can currently output to the following formats:

- `json`
- `xlsx`
- `csv`
- `adoc`
- `pdf`

## Language Support

- `C`
- `C++` (Untested, might not work.)

<!-- Currently Designed for C Source Code. Future Support may be added for C++ and Python. -->
