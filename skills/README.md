# AllyHub's skills

Each folder here is an [Agent Skill](https://agentskills.io/specification): a `SKILL.md` with its front matter, and the files it reads. They are published from the public repository, `allyhub-ai/allyhub` ([distribution.md](../../docs/distribution.md)).

- `allyhub` is AllyHub itself, kept short and general: what AllyHub is good at, that `allyhub help` is the reference for the commands and the SDK's docs, and that `allyhub skills` lists the work skills (`allyhub skills show <name>` prints one, `allyhub add <name>` adds it), never naming them one by one. It is the one skill installed for every folder (`npx skills add allyhub-ai/allyhub --skill allyhub -g`, AllyHub Studio, or AllyHub's plugin), and its description covers every kind of work, so an agent reads it whatever is asked. The plugin's copy (`plugins/allyhub/skills/allyhub`) is made from this folder by `node scripts/plugin-skill.mjs`: change it here, then run that.
- The others are **work skills**: each says how to make one kind of work in an AllyHub project (a demo film, a UGC short, the docs of a feature). A work skill is the project's: it is installed into the project as the skills CLI installs one with project scope, in `.agents/skills/<name>` with a link in `.claude/skills/<name>` (from AllyHub's registry, or Studio's gallery), never for every folder. The agent loads it the standard way; nothing of it is copied anywhere else in the project.

Adding a work skill is adding a folder. Nothing in Studio or the CLI changes. One is added only once it has been tried end to end with real agents on a real product.

## A work skill

```
<name>/                 lowercase words joined by -, the name in its front matter
  SKILL.md              the standard's front matter, then the instructions
  references/           what the body links to, read on demand
  scripts/              what the body runs
  assets/               what it starts files from (assets/content/: the columns of its sheets, a doc's headings), copied by the agent where the project lacks them
  agents/               what hosts show of the skill:
    openai.yaml           Codex's card (interface: display_name, short_description, default_prompt), which Studio shows too
    allyhub.yaml          Studio's card: what Codex's has not
    allyhub/cover.svg     its picture
    allyhub/<locale>.yaml the card's words in another language
```

Nothing else may be at its top level. `node scripts/registry-build.mjs` builds every skill here into an item of the registry, with its card.

## SKILL.md

The front matter is the standard's, and nothing else (another host's own fields break where they are not known):

```yaml
---
name: product-demos
description: What it makes, and when to use it (at most 1024 characters).
license: MIT
compatibility: Needs the AllyHub CLI (npx -y allyhub, Node.js 22.19 or newer).
metadata:
  version: "27"
---
```

`metadata.version` is a whole number, raised when the skill changes.

The body is for the agent, in English: at most ten sentences, headings aside, ideally fewer. It does not ask for the `allyhub` skill: AllyHub's plugin carries it, Studio gives it to every agent, and `allyhub skills` is how an agent found this one.

- `## Goal`: what it makes, and what good looks like for the person.
- `## Process`: the agent's own steps in outline, as it does the work (research, use the product, keep what it learns in the project, make, check), and what it leaves in the project.

How to do each step is the agent's to work out. A skill names no command, option, API, function, tool, model or camera, and no craft: no techniques, timings, storyboard formats, review checklists, styles or kit of components, which a strong model then follows instead of judging. The CLI's help and the SDK's docs are the reference. A skill grows only where agents are seen to fail at it, by the fewest words that fix that.

## Studio's card

A skill with `agents/allyhub.yaml` is offered in Studio's gallery and its first run; one without is a skill Studio does not offer (`allyhub` itself). The card's words are Codex's, in `agents/openai.yaml`:

```yaml
interface:
  display_name: Product demos
  short_description: Your product, shown by using it
  default_prompt: "Use the product-demos skill: make a demo of [your product’s URL] for [who it’s for]."
```

- `display_name`: its name on the card, at most 24 characters, sentence case.
- `short_description`: one line on the card, at most 56 characters, no full stop.
- `default_prompt`: what the composer starts with, at most 600 characters: one or two sentences in the person's voice that name the skill ("Use the <name> skill: …", which every agent finds it by), with what they must say in square brackets, `[your product’s URL]`. Home draws each as a field and Tab moves between them. Optional.

`agents/allyhub.yaml` says only what Codex's card has no field for:

```yaml
category: video
order: 1
```

- `category`: `video`, `writing` or `research`.
- `order`: where it stands in its category, from 1.

No other field is read: a card with one is not right, and Studio leaves the skill out and says why.

### cover.svg

A flat picture of what the skill makes, in AllyHub's look (`packages/editors/ui/IDENTITY.md`). It is Home's card for the skill, so it shows the work itself, not a symbol for it: the product's screen with a cursor and a caption for a demo, a slide with its diagram for an explainer, a vertical short for a launch. Lines stand for words.

- `viewBox="0 0 320 180"`, no `width` or `height`.
- Flat shapes only: no text, no gradients, no filters, no images, no scripts, no external references. At most 4 KB.
- Colours, fixed, the identity's tokens (`packages/editors/ui/src/styles/tokens.css`): paper `#FAFAFA`, sheet `#FFFFFF`, stone `#F6F6F5`, stone 2 `#EEEEEC`, rule `#E7E7E5`, lead `#5E5E5C`, ink `#111111`, and the category's own colour, the kind of thing it makes: video `#5381BC` (`kind-video`, the blue), writing `#529C6A` (`kind-doc`), research `#C98A4B` (`kind-slides`) (lighter with `opacity`). No violet. A cover sits on its category's tint, so the ground is the category colour at low opacity over paper.
- The covers of a category are one family: the same ground, the same weight of line, a different subject.

### Other languages

The card's words are written in English. What a person reads of them can be written again for each language Studio is in (`@allyhub/i18n`'s `LOCALES`: `zh-cn`, `ja`, `fr`…), in `allyhub/<locale>.yaml`: any of `display_name`, `short_description` and `default_prompt`, with the same limits; no other field. A field it leaves out is the English one. A prompt in another language names the skill in that language's words ("使用 product-demos 技能：…").

Studio shows the gallery and Home in the language it is shown in. `SKILL.md` is for the agent and stays English: the agent is told which language the person reads, and writes to them in it. A file for a language Studio is not in is left out and said so; the skill is still offered.
