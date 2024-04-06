# CodeFree

Code Style Checking, Static Analysis and Reporting Tool.

## Usage

```
codefree [-h] [-p [PATH]] [-i [IGNOREPATHS]] [-I [INCLUDEPATHS]] [--enable-checker {all,style,code}] [--code-standard {all,cwe,misra}]
                [--output-file <path_to_output>] [--quiet] [--no-stats] [--format {csv,json,xlsx}] [--json-pretty]
                [--options-file <path_to_options_file>]

CodeFree - Code Style Checker + Static Analysis and Reporting Tool

options:
  -h, --help            show this help message and exit
  -p [PATH], --path [PATH]
                        Source Code Path. If not specified, the tool is run on the Current Working Directory.
  -i [IGNOREPATHS], --ignore [IGNOREPATHS]
                        Ignore Specific Files. Use Multiple times to ignore multiple files. Supports Regex.
  -I [INCLUDEPATHS], --include [INCLUDEPATHS]
                        Specify Include Path. If not specified, the include directory in the code path will be attempted to use.
  --options-file <path_to_options_file>
                        Specify an Options File. CLI Options hold more priority. If not provided, CodeFree will attempt to use the .codefreerc file in
                        the provided path, if it exists.

Checker Options:
  Set CodeFree Checker Options. CodeFree runs all checkers by default. Set --enable to none if you want to enable individual checkers.

  --enable-checker {all,style,code}
                        Enable/disable various types of code checks. All types of checks are enabled by default.
  --code-standard {all,cwe,misra}
                        Enable/disable code standard compliance checks. All compliance checks are enabled by default (--code checker has to be
                        enabled).

Output Options:
  Set Output Format and other options. If multiple formats are mentioned, last specified format is used.

  --output-file <path_to_output>
                        Output to File. If not specified, raw output is printed to stdout.
  --quiet               Do not print progress messages.
  --no-stats            Do not calculate Issue Statistics.
  --format {csv,json,xlsx}
                        Output Format. If not specified, raw object is dumped to stdout.

json Output Options:
  These options should be used along with --json, else they are ignored.

  --json-pretty         Prints JSON with Indentation
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

## Language Support

- `C`
- `C++` (Untested, might not work.)

<!-- Currently Designed for C Source Code. Future Support may be added for C++ and Python. -->
