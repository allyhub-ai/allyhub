# references/sheets.md

A sheet is a workbook as Excel has it, written as text: a YAML file, named as you like and listed in `allyhub.yaml` (`kind: sheet`, `file`, an optional `title`), its tables' rows in the CSV files it names (wherever you put them), and optionally the code it names (`code: ./forecast.ts`), a module that makes sheets from data with openpyxl's API (`@allyhub/sdk/sheets`). Formulas stay live. The person edits it in an editor like Excel's. It renders to an Excel workbook with live formulas, PDF, PNG, CSV, Markdown and JSON.

- `allyhub help sheets` lists the commands in order and prints where the SDK's `sheets.md` is. Read it before writing a sheet.
- `allyhub sheet capabilities` says what the API holds of openpyxl's, how it differs and which worksheet functions it computes.
- `allyhub sheet import <file> --to finance/forecast.yaml` makes a sheet of an Excel, CSV or TSV file (that file and its tables' CSV files beside it, listed), and says what it could not carry over.

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
