# references/projects.md

A project is a folder that keeps every piece and what they share, so each piece builds on the last. Content needs one, and so do `allyhub voice` and `allyhub add`. Research, AI media, `allyhub upload`, `allyhub skills` and `allyhub add search` do not.

A project has one look (`allyhub.config.ts`'s colours and fonts) and one set of shared components and assets, so it serves one brand: work for several clients or brands goes in a project each, a folder per client.

A **piece** is one thing the project makes for people to see: a file of a kind, listed in `allyhub.yaml` at the project's root. Commands and tools call it an **item**. Name and place your files as you like: the list is what the person sees, in its order, under its headings.

- List each piece you make for the person when you make it. A file not listed (a helper, a draft, a scenery a video imports) is yours alone.
- A piece names the other files it uses, such as its script, so pieces share a folder freely.
- The SDK's `project.md` says how the list and a piece's files are written. `allyhub check` reports what is wrong with the list.

## Start one

Run `npm create allyhub@latest .`, then `npm install`. A folder that has a `package.json` already is refused.

## Enter one

Read its `AGENTS.md` first: the project's conventions are its own. Its `allyhub.yaml` lists what the person sees. The SDK's `project.md` gives the layout, the list, imports and `allyhub.config.ts`.

## Its CLI and SDK

In a project, `allyhub` runs the project's own CLI, at the version its SDK builds with, however it is started. `allyhub help` prints where that SDK's docs are.

`allyhub add skill/<name>` puts a skill in `.agents/skills/`, linked from `.claude/skills/`, so every later session has it.

## Where things go

- `components/`: code pieces share, such as a product's screens.
- `assets/`: media, data, text and fonts.
- `sceneries/`: sceneries `allyhub add` adds.
- `.allyhub/`: this computer's only. `out/<item>/` holds renders, `work/` your working files, and `cache/` what the tools rebuild.

Notes you would otherwise have to find again go where your agent keeps its memory. AllyHub's own agent keeps them in `.allyhub/memory/`.
