# references/decks.md

A deck is PowerPoint's model, written with python-pptx's API. It is three kinds of file, named as you like:

- its module (`.ts` or `.tsx`, named as you like): masters, layouts and components. `allyhub.yaml` lists it (`kind: slides`, `file`, an optional `title`).
- its slides file, which the module names (`presentation({ slides: "./q3.yaml", … })`): the slides in order.
- its script, which the module names (`script: "./q3.{locale}.yaml"`): each slide's words and speaker notes, a file per language.

Paths are from the module's folder, and nothing is found by a fixed name, so decks share a folder freely.

It renders to PDF, PPTX and PNGs.

## Where to look

- `allyhub help decks` lists the commands in order and prints where the SDK's `slides.md` and `layers.md` are. Read them before writing a deck.
- `allyhub slides capabilities` says which of python-pptx's classes and enums the API holds, and how it differs.
- `allyhub slides import <file> --to reviews/q3.ts` makes a deck of a PowerPoint file: `reviews/q3.ts`, `reviews/q3.yaml`, `reviews/q3.<lang>.yaml` and its pictures and videos beside them. It says what it could not hold.
- A picture keeps PowerPoint's crop. To frame a plate at a focal point as a video does, use `picture()` in a component (`pictures.md`).

## See and measure

- `allyhub frames <item>` draws the slides as the render draws them.
- `allyhub inspect layout` measures layout and lists every text block with its fonts.
- `allyhub inspect contrast` measures text against the pixels behind it, which `check` does not.
