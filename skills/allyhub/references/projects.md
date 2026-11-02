# references/projects.md

A project is a folder that keeps every piece and what they share, so each piece builds on the last. Content needs one, and so do `allyhub voice` and `allyhub add`. Research, AI media, `allyhub upload`, `allyhub skills` and `allyhub add search` do not.

A **piece** is one thing the project makes for people to see. It is a folder, known by its entry file. Commands and tools call it an **item**.

## Start one

Run `npm create allyhub@latest .`, then `npm install`. A folder that has a `package.json` already is refused.

## Enter one

Read its `AGENTS.md` first: the project's conventions are its own. The SDK's `project.md` gives the layout, entry files, imports and `allyhub.config.ts`.

## Its CLI and SDK

In a project, `allyhub` runs the project's own CLI, at the version its SDK builds with, however it is started. `allyhub help` prints where that SDK's docs are.

`allyhub add skill/<name>` puts a skill in `.agents/skills/`, linked from `.claude/skills/`, so every later session has it.

## Where things go

- `components/`: code pieces share, such as a product's screens.
- `assets/`: media, data, text and fonts.
- `sceneries/`: sceneries `allyhub add` adds.
- `.allyhub/`: this computer's only. `out/` holds renders, `work/` your working files, and `cache/` what the tools rebuild.

Notes you would otherwise have to find again go where your agent keeps its memory. AllyHub's own agent keeps them in `.allyhub/memory/`.
