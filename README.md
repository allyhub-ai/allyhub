# AllyHub

AllyHub lets your AI agent research your market and make videos, decks, docs and sheets about your product, on your computer. See [allyhub.com](https://allyhub.com).

This repository holds:

- **The plugin** (`plugins/allyhub/`) for Claude Code, ChatGPT and Codex, with its marketplaces (`.claude-plugin/`, `.agents/plugins/`).
- **Skills** (`skills/<name>/`): how to make one kind of work, added to a project.
- **The registry** (`registry/<name>/`): components, templates, sceneries and models a project adds with `npx allyhub add <name>`.
- **Issues**: report a bug or ask for a feature here.

## Install

In Claude Code:

```
/plugin marketplace add allyhub-ai/allyhub
/plugin install allyhub@allyhub
```

In Codex: `codex plugin marketplace add allyhub-ai/allyhub`, then install AllyHub from the plugin list.

## Contributing

We do not take pull requests yet. Issues are welcome.

## Licence

The plugin, the skills and the registry's code items are MIT (`LICENSE`); each asset item in the registry carries its own licence. AllyHub's CLI, SDK and Studio are not in this repository and are licensed separately.
