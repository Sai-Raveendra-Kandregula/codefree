# CodeFree

Styling and Static Code Analysis + Report Generation Tool.

## Usage

```
codefree [-h] [-p [PATH]] [--enable {all,none}] [--astyle] [--cppcheck] [--flawfinder] [--output-file OUTPUTFILE] [--json] [--json-pretty] [--xlsx]
                [--csv]

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
  --cppcheck            Enable CPPCheck Code Analysis
  --flawfinder          Enable FlawFinder Code Analysis

Output Format Options:
  Choose a Format for the Output. Default is json. If multiple options are mentioned, last specified format is used.

  --json                Formats Output to JSON
  --xlsx                Formats Output to xlsx
  --csv                 Formats Output to CSV

json Output Options:
  These options should be used along with --json, else they are ignored.

  --json-pretty         Prints JSON with Indentation
```

## Checkers

CodeFree currently has the following checkers:

### Style Checkers
- `astyle`

### Static Code Analyzers
- `cppcheck`
- `flawfinder`

## Output

CodeFree can currently output to the following formats:

- `json`
- `xlsx`
- `csv`

## Support

Currently Designed for C Source Code. Future Support may be added for C++ and Python.
