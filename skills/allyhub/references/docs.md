# references/docs.md

A doc is an MDX file listed in `allyhub.yaml`, which the person edits in an editor like Notion's. It renders to PDF, Word and Markdown.

A doc holds more than prose, each drawn in the editor, the PDF and Word: charts drawn from numbers or from a sheet, so they follow the data; equations and diagrams; a picture drawn by code, a project's component placed in the page; footnotes and citations; blocks side by side; contents, numbered figures and tables; and a page set by its front matter (paper, margins, faces, header and footer, a preset, a cover).

- `allyhub help docs` lists the commands in order and prints where the SDK's `docs.md` is. Read it before writing a doc.
- A doc is what a person edits, comments on, prints or sends as Word. A page meant to be read on screen, with interaction or a layout of its own, is a website.

## See and measure

`allyhub check` finds errors. `allyhub frames <doc>` draws its pages as they print and says how many there are; `allyhub inspect pages <doc>` measures them: the space left at each page's foot, what breaks over a page, headings near a foot, what runs past the column. Look with these, not with `allyhub render`, which is for the files the person asks for.
