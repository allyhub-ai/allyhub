# AllyHub

Know your market, show your product, at scale. AllyHub gives you what it takes: research with real data from the platforms where people talk, buy and advertise, and content made as code (videos, decks, docs, sheets, 3D scenes and websites) that AllyHub checks, previews and renders the same every time.

A team runs out of hands long before it runs out of ideas: each video, deck or doc takes someone days, and every new language, format, audience or hook to test means doing it again. Because a piece is code, you make it once and turn it into as many versions as the work needs, remake it when the product changes, and measure every part of it.

Agent write the code; the person never has to. They ask for the work in their own words, and review and edit the same pieces in AllyHub's editors, as they would in a doc, slides or a video editor. See [allyhub.com](https://allyhub.com).

This repository holds:

- **The `allyhub` skill** (`skills/allyhub/`): AllyHub itself, for your agent.
- **Issues**: report a bug or ask for a feature here.

## Install

Have your agent run these two commands exactly, not its own skill installer, or run them in a terminal. They need Node.js 22.19 or newer, and work for Claude Code, Codex and the other agents the [skills CLI](https://github.com/vercel-labs/skills) knows.

```bash
npx skills add allyhub-ai/allyhub --skill allyhub -g -y
```

```bash
npx -y allyhub@latest help
```

The first gives your agent the skill that says what AllyHub does and how to use it. The second fetches AllyHub, which takes a minute or so, and lists what it can do.

Then ask your agent for the work in your own words.

## Update

```bash
npx skills update -g
```

```bash
npx -y allyhub@latest help
```

`npx skills update -g` sees only a skill installed with the command above.

## Contributing

We do not take pull requests yet. Issues are welcome.

## Licence

The skill is MIT (`LICENSE`), as are the work skills and code items a project adds with `npx allyhub add <type>/<name>`; each asset item carries its own licence. AllyHub's CLI, SDK and Studio are not in this repository and are licensed separately.
