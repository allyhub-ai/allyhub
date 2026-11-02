# references/sheets.md

A sheet is a workbook as Excel has it, written as text: a folder with a `sheet.yaml`, its tables' rows in `data/*.csv`, and optionally a `sheet.ts` that makes sheets from data with openpyxl's API (`@allyhub/sdk/sheets`). Formulas stay live. The person edits it in an editor like Excel's. It renders to an Excel workbook with live formulas, PDF, PNG, CSV, Markdown and JSON.

- `allyhub help sheets` lists the commands in order and prints where the SDK's `sheets.md` is. Read it before writing a sheet.
- `allyhub sheet capabilities` says what the API holds of openpyxl's, how it differs and which worksheet functions it computes.
- `allyhub sheet import <file>` makes a sheet of an Excel, CSV or TSV file, and says what it could not carry over.

## See and measure

Nothing needs opening: AllyHub computes the workbook itself.

| To see                                                                        | Run                                     |
| ----------------------------------------------------------------------------- | --------------------------------------- |
| What it computes, for a sheet, range, table or name                           | `allyhub sheet calc`                    |
| What a cell depends on, and what depends on it                                | `allyhub sheet trace`                   |
| Two versions compared, by value and by formula                                | `allyhub sheet diff`                    |
| Error values, numbers written into formulas and other facts                   | `allyhub inspect sheet`                 |
| Each table's counts, empty cells, distinct values, ranges and frequent values | `allyhub sheet`                         |
| The sheet as a person sees it                                                 | `allyhub frames <item>`, with `--range` |
