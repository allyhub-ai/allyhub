# references/setup.md

AllyHub needs Node.js 22.19 or newer.

- **First use.** `npx -y allyhub help` fetches AllyHub, in a minute or so.
- **First draw.** The first command that draws, mixes or hears downloads Chrome or ffmpeg, once, each of which can take ten minutes on a slow connection. It prints its progress on stderr. Let it finish: AllyHub uses its own copies.
- **Sandboxes.** AllyHub starts headless Chrome and a local server and reaches its cloud. Where your shell runs in a sandbox that blocks those, as Codex's does, ask the person to allow them for `allyhub`, and for `npm create allyhub@latest` and `npm install` when you start a project.
- **What this computer has.** `allyhub doctor` lists what AllyHub uses on this computer, with where each is. AllyHub keeps its own ffmpeg and Chrome, off `PATH`, and `allyhub doctor` shows where they are.
