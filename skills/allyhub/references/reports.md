# references/reports.md

A report is a page read on a screen and sent as a link, which you write freely in HTML, CSS and JavaScript: research findings, a review of customers' words, a market scan, a KPI review, a playbook. Choose it over a doc when the page is for a screen and its look matters more than paper or Word; over a deck when it is read, not presented; over a website when it is one page with no build.

- `allyhub help reports` lists the commands and prints where the SDK's `reports.md` is. Read it before writing a report: what the page may load, how it is drawn, what the check reports.
- **Every part is yours**: AllyHub gives a report no components. When the person names no style, start from a report style (`allyhub report style list`, `show`, `use`); when they do, follow theirs.
- **Numbers from data**: draw figures, tables and charts from the project's data files (what research tools wrote, a sheet) rather than typing them, and cite every source.
- **Look at it** with `allyhub frames` (`--width 375` for a phone) and fix what you see; it also names each canvas with nothing drawn on it. `allyhub check` names what is missing, refused or thrown.
- **Sending it**: when the person wants to send the report to people, that is asking for its file: `allyhub render` makes one self-contained HTML file that opens on any phone or computer, offline, its charts still working (and a PDF, a long PNG or Markdown on request). In AllyHub Studio the person can also share it as a link.
