# AllyHub's plugins

What an agent app installs to have AllyHub: the MCP server (`allyhub mcp`, every command as a tool and the editors as an MCP App, docs/integrations.md), for Claude Code and for ChatGPT/Codex from one folder. Published as the root of the public plugins repository at the cutover.

- `allyhub/.claude-plugin/plugin.json` and `allyhub/.mcp.json`: Claude Code's plugin (Grok Build reads it too).
- `allyhub/plugin.json` and `allyhub/mcp.json`: the Agent Plugins standard, with ChatGPT's `extensions["com.openai"]` (Cursor reads it too).
- `allyhub/skills/allyhub/`: AllyHub's own skill, which both read. A copy of `public/skills/allyhub`, its one source, made by `node scripts/plugin-skill.mjs`: never edit it here.
- `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`: the two marketplaces that list it.

Install from a checkout of this folder: in Claude Code, `/plugin marketplace add <folder>` then `/plugin install allyhub@allyhub`; for ChatGPT and Codex, `codex plugin marketplace add <folder>` then install it from ChatGPT's desktop app.
