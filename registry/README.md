# Registry

Resources a project adds with `npx allyhub add <name>`: components, templates, sceneries and models, one folder per item (`registry/<name>/`), described by its item file in the shadcn registry format with AllyHub's types (`allyhub:component`, `allyhub:template`, `allyhub:scenery`, `allyhub:model`, `allyhub:skill`).

- Large files (models, textures, HDRIs, sample media) are not in git: an item lists each by its sha256, size and licence, and they are served from `downloads.allyhub.com`.
- Components are written in AllyHub's product repository and copied here by its release.
- Code items are MIT; an asset item carries its own licence (CC0 preferred, CC-BY with its author and source).
