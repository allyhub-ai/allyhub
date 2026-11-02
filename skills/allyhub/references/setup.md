# references/setup.md

AllyHub needs Node.js 22.19 or newer.

- **First use.** `npx -y allyhub help` fetches AllyHub, in a minute or so.
- **First draw.** The first command that draws or mixes downloads Chrome and ffmpeg, once, which can take several minutes on a slow connection. It prints its progress on stderr. Wait for it rather than stopping it or pointing AllyHub at other copies.
- **Sandboxes.** AllyHub starts headless Chrome and a local server and reaches its cloud. Where your shell runs in a sandbox that blocks those, as Codex's does, run `allyhub` outside the sandbox, asking the person once.
- **What this computer has.** `allyhub doctor` lists Node.js, ffmpeg, headless Chrome and the local models.
