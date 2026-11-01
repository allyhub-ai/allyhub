# AllyHub

AllyHub lets your AI agent research your market and make videos, decks, docs and sheets about your product, on your computer. See [allyhub.com](https://allyhub.com).

This repository holds:

- **Skills** (`skills/<name>/`): `allyhub` is AllyHub itself, for your agent; the others each say how to make one kind of work, added to a project.
- **The registry** (`registry/<name>/`): components, templates, sceneries and models a project adds with `npx allyhub add <type>/<name>`.
- **Issues**: report a bug or ask for a feature here.

## Install

Have your agent run this, or run it in a terminal. It works for Claude Code, Codex and the other agents the [skills CLI](https://github.com/vercel-labs/skills) knows:

```
npx skills add allyhub-ai/allyhub --skill allyhub -g -y
```

AllyHub itself comes the first time your agent uses it (Node.js 22.19 or newer). `npx skills update -g` brings the skill up to date.

## Contributing

We do not take pull requests yet. Issues are welcome.

## Licence

The skills and the registry's code items are MIT (`LICENSE`); each asset item in the registry carries its own licence. AllyHub's CLI, SDK and Studio are not in this repository and are licensed separately.
