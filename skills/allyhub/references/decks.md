# references/decks.md

A deck is PowerPoint's model, written with python-pptx's API: a module for its masters, layouts and components, listed in `allyhub.yaml`, which names its slides file (the slides in order) and its script (each slide's words and speaker notes, a file per language). It renders to PDF, PPTX and PNGs.

- `allyhub help decks` lists the commands in order and prints where the SDK's `slides.md` and `layers.md` are. Read them before writing a deck.
- `allyhub slides capabilities` says which of python-pptx's classes and enums the API holds, and how it differs.
- `allyhub slides import` makes a deck of a PowerPoint file, and says what it could not hold.

## See and measure

- `allyhub frames <item>` draws the slides as the render draws them.
- `allyhub inspect layout` measures layout and lists every text block with its fonts.
- `allyhub inspect contrast` measures text against the pixels behind it, which `check` does not.
