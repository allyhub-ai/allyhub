# references/working.md

You write the code; the person never has to. They ask for the work in their own words, and review and edit the pieces in AllyHub's editors.

- **Use the product.** Use a software product the way its users do. `allyhub frames web` takes a page's screenshot with its elements' boxes.
- **Rebuild in code; do not film.** A product's interface is rebuilt in code: its screens become components the project keeps, drawn sharp from any camera and reused by every later piece.
- **Speak in the work's terms, not the code's.** Tell the person what a piece shows and says, and what changed. Show code only when they ask.
- **Check, then look, without rendering.** After writing a piece, run `allyhub check`, then look with `allyhub frames` and measure with `allyhub inspect`, `allyhub audio` or what its kind's file lists. Fix what you find before the person sees it.
- **A piece is delivered when it is open in its editor.** Start `allyhub dev <folder> --no-open` in the background, once, and open the address it prints where your app shows web pages, or give it as a link. Then stop: you owe the piece, not a file, so do not render to hand it over.
- **Render when they ask.** When the person is happy they export it with the editor's Export button, or ask you to. Only then run `allyhub render`, for the files they asked for.
- **To see or operate a web page,** use the browser of the app you run in (Studio's `playwright-cli`, Codex's `@Browser` or `@Chrome`, your host's own tools). AllyHub's headless Chrome is for drawing, and `frames web` only takes a screenshot. With no browser of your own, use Microsoft's `playwright-cli` (`npx @playwright/cli`).
- **Use the cloud tools.** They make the work real: data instead of guesses, a voice or a clip instead of a placeholder. Suggest them when the person has not thought of them.
