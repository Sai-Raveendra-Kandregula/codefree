# CodeFree

Style and Static Code Analysis + Reporting Tool.

## Usage

```
codefree [-h] [-p [PATH]] [--enable {all,none}] [--astyle] [--cwe_cppcheck] [--cwe_flawfinder] [--misra_cppcheck] [--output-file OUTPUTFILE]
                [--json] [--json-pretty] [--xlsx] [--csv]

CodeFree - Code Style Checker + Static Analysis and Reporting Tool

options:
  -h, --help            show this help message and exit
  -p [PATH], --path [PATH]
                        Source Code Path. If not specified, the tool is run on the Current Working Directory.
  --output-file OUTPUTFILE
                        Output to File. If not specified, output is printed to stdout.

Checker Options:
  Set CodeFree Checker Options. CodeFree runs all checkers by default. Set --enable to none if you want to enable individual checkers.

  --enable {all,none}   Enable/Disable all Checkers
  --astyle              Enable Astyle format checking
  --cwe_cppcheck        Enable CWE Compliance Checks with CPPCheck
  --cwe_flawfinder      Enable CWE Compliance Checks with FlawFinder
  --misra_cppcheck      Enable MISRA Compliance Checks with CPPCheck

Output Format Options:
  Choose a Format for the Output. Default is json. If multiple options are mentioned, last specified format is used.

  --json                Formats Output to JSON
  --xlsx                Formats Output to Excel Spreadsheet
  --csv                 Formats Output to CSV

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
