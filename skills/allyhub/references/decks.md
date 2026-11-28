# references/decks.md

A deck is PowerPoint's model, written with python-pptx's API: a module for its masters, layouts and components, listed in `allyhub.yaml`, which names its slides file (the slides in order) and its script (each slide's words and speaker notes, a file per language). The person edits it in an editor laid out like PowerPoint's and downloads it as a PowerPoint file, a PDF or pictures.

- `allyhub help decks` lists the commands and prints where the SDK's `slides.md` and `layers.md` are. Read them before writing a deck.
- `allyhub slides capabilities` says which of python-pptx's classes and enums the API holds, and how it differs.
- `allyhub slides import` makes a deck of a PowerPoint file, and lists each difference from the file.

Don't use the built-in layouts as they are: design the deck's own masters and layouts for its content, creatively. A deck should use charts and blocks wherever appropriate to create rich visualization. The SDK's `slides.md` and `blocks.md` list the blocks a slide draws; a figure none of them draws is a component you write (a slide's `component` shape).

## See and measure

- `allyhub check` finds errors, and text over text or past its box.
- `allyhub frames <item>` draws the slides.
