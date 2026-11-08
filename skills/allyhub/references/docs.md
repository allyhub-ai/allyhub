# references/docs.md

A doc is an MDX file, named as you like and listed in `allyhub.yaml` (`kind: doc`, `file`, an optional `title`), which the person edits in an editor like Notion's. It renders to PDF, Word and Markdown.

`allyhub help docs` lists the commands in order and prints where the SDK's `docs.md` is. Read it before writing a doc.

A doc holds more than prose, each drawn in the editor, the PDF and Word:

- A chart drawn from numbers: `<Chart type="column-clustered" title="…">` around a table, or `<Chart type="line" data="../../sales#Revenue" categories="month" series="revenue" />` reading a sheet's table or a CSV, so it follows the data. Word keeps it as Word's own chart.
- An equation in a ` ```math ` block (TeX), a diagram in a ` ```mermaid ` block (flowchart, sequence, timeline…).
- A picture drawn by code (a product's screen rebuilt, a figure no chart draws) is a component placed with `<Component of="../../components/ui.ts#Dialog" />`, its props as attributes: the doc shows it drawn, the PDF and Word a still of it.
- Sources as footnotes: `[^1]` in the text and `[^1]: …` as the note (Word's own footnotes; numbered notes at the end of the PDF), and `<PageBreak />` where a page should end.
- Blocks side by side: `<Columns>` around two or more `<Column width="…">`, each around its blocks.
- Front matter sets the whole page: its paper (Letter by default), margins, faces and sizes, header and footer, a `preset` (`apa`, `mla`), `accent` (a colour) and `cover` (a picture across the top, from the doc's folder; `allyhub doc cover list` names AllyHub's own, `allyhub doc cover set <doc> <name>` puts one there).
- Contents, numbered figures and tables with references to them (`[see](#sales)`), and citations from a Zotero or CSL-JSON file (`[@smith2019]`, `<Bibliography />`).

A doc is what a person edits, comments on, prints or sends as Word. A page meant to be read on screen, with interaction or a layout of its own, is a website.

## See and measure

`allyhub check` finds errors. `allyhub frames <doc>` draws its pages as they print, tiled on one picture, and says how many there are and on what paper; `--page 2-3` draws those pages large. `allyhub inspect pages <doc>` measures them: the space left at each page's foot, what breaks over a page, headings near a foot, what runs past the column. Look with it, not with `allyhub render`, which is for the files the person asks for.
