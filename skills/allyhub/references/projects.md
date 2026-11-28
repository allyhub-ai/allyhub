# references/projects.md

A project is a folder that keeps every piece and what they share. Content needs one, and so do `allyhub voice` and `allyhub add`. Research, AI media, `allyhub upload`, `allyhub skills` and `allyhub add search` run anywhere.

A project has one look (`allyhub.config.ts`'s colours and fonts) and one set of shared components and assets, so it serves one brand: work for several clients or brands goes in a project each, a folder per client.

A **piece** is one thing the project makes for people to see: a file of a kind, listed in `allyhub.yaml` at the project's root. Commands and tools call it an **item**. Name and place your files as you like: the list is what the person sees, in its order, under its headings.

- A file `allyhub.yaml` does not list (a helper, a draft, a scenery a video imports) is not shown to the person.
- A piece names the other files it uses, such as its script, so pieces share a folder freely.
- The SDK's `project.md` says how the list and a piece's files are written. `allyhub check` reports what is wrong with the list.

## Start one

A folder with an `allyhub.yaml` is a project. Its code's `@allyhub/sdk` (and three.js) is the one `allyhub` brings: nothing is installed for it. A package of another that its code imports is installed with `npm install <package>`.<!-- outside: studio -->

`npm create allyhub@latest .` makes the folder a project: its `allyhub.yaml`, `AGENTS.md`, `CLAUDE.md` and `.gitignore`, nothing installed. `npm create allyhub@latest . -- --install`, then `npm install`, holds it to one AllyHub version, installed in it.<!-- /outside -->

## Enter one

Read its `AGENTS.md` first: the project's conventions are its own. Its `allyhub.yaml` lists what the person sees. The SDK's `project.md` gives the layout, the list, imports and `allyhub.config.ts`.

## Its CLI and SDK

`allyhub help` prints where the SDK's docs are.<!-- outside: studio --> In a project that installed AllyHub, `allyhub` runs the project's own CLI, at the version its SDK builds with, however it is started.<!-- /outside -->

`allyhub add skill/<name>` puts a skill in `.agents/skills/`, linked from `.claude/skills/`, so every later session has it.

## Where things go

- `components/`: code pieces share, such as a product's screens.
- `assets/`: media, data, text and fonts.
- `sceneries/`: sceneries `allyhub add` adds.
- `.allyhub/`: this computer's only, where the person does not look. `work/` holds your working files and `cache/` what the tools rebuild.

Notes you would otherwise have to find again go where your agent keeps its memory. AllyHub's own agent keeps them in `.agents/memory/`.
