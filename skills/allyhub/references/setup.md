# references/setup.md

AllyHub needs Node.js 22.19 or newer.

- **First use.** `npx -y allyhub help` fetches AllyHub, in a minute or so.
- **First draw.** The first command that draws, mixes or hears downloads Chrome or ffmpeg, once, each of which can take ten minutes on a slow connection. It prints its progress on stderr. Wait for it rather than stopping it or pointing AllyHub at other copies.
- **Sandboxes.** AllyHub starts headless Chrome and a local server and reaches its cloud. Where your shell runs in a sandbox that blocks those, as Codex's does, ask the person to allow them for `allyhub`.
- **What this computer has.** `allyhub doctor` lists what AllyHub uses on this computer, with where each is. AllyHub keeps its own ffmpeg and Chrome, off `PATH`: one missing from `PATH` is no sign the computer lacks it.
