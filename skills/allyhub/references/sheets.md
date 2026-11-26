# references/sheets.md

A sheet is a workbook as Excel has it, written as text: a YAML file listed in `allyhub.yaml`, its tables' rows in CSV files it names, and optionally code it names that makes sheets from data with openpyxl's API. Formulas stay live. The person edits it in an editor like Excel's and downloads it as an Excel workbook with live formulas, PDF, CSV or pictures.

- `allyhub help sheets` lists the commands in order and prints where the SDK's `sheets.md` is. Read it up to Commands before writing a sheet; the rest is reference.
- `allyhub sheet capabilities` says what the API holds of openpyxl's, how it differs and which worksheet functions it computes.
- `allyhub sheet import` makes a sheet of an Excel, CSV or TSV file, and lists each difference from the file.
