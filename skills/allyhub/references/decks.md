# references/decks.md

A deck or carousel is PowerPoint's model, written with python-pptx's API. It is a folder with three kinds of file:

- `slides.ts` (or `.tsx`): masters, layouts and components.
- `slides.yaml`: the slides in order.
- `script.<locale>.yaml`: each slide's words and speaker notes.

It renders to PDF, PPTX and PNGs.

## Where to look

- `allyhub help decks` lists the commands in order and prints where the SDK's `slides.md` and `layers.md` are. Read them before writing a deck.
- `allyhub slides capabilities` says which of python-pptx's classes and enums the API holds, and how it differs.
- `allyhub slides import <file>` makes a deck of a PowerPoint file. It says what it could not hold.

## See and measure

- `allyhub frames <item>` draws the slides as the render draws them.
- `allyhub inspect layout` measures layout and lists every text block with its fonts.
- `allyhub inspect contrast` measures text against the pixels behind it, which `check` does not.
