# references/registry.md

The registry holds ready-made things a project copies in and owns from then on. Look here before you build one yourself.

## Find

- `allyhub add` lists everything by type.
- `allyhub add search <words>` finds what holds every word in its name, title, description or categories, such as `allyhub add search "office desk"`.
- `--type` narrows a search to one type: `allyhub add search --type scenery`.
- `--all` shows every Poly Haven match, not only the first 20.

## Add

`allyhub add <type>/<name>` copies an item with what it needs: the items it depends on, its Poly Haven assets and its baked light. The type is always written. `--force` puts the registry's copy back over yours.

## What it holds

These are examples: `allyhub add` lists what is there now.

| Type              | What it is                                  | Examples                                                                                                                                                                                                |
| ----------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `component`       | Code a piece uses directly                  | `caption-word`, `caption-line`, `caption-subtitle`, `callout`, `chart`, `code-panel`, `screen-demo`, `screen-shots` (camera moves on a screen), `pointing-prop` (a pointing rod on a screen)            |
| `scenery`         | A baked 3D room, one per setting and look   | Settings `home-desk`, `bedroom-desk`, `gaming-setup` and `minimal-walnut`, each in day, overcast, evening and night, such as `home-desk-demo-day`; `kit-variants` shows the kit's variants side by side |
| `3d-model`        | An object at a real product's size          | `desk`, `chair`, `monitor`, `laptop`, `tablet`, `phone`, `keyboard`, `mouse`, `trackpad`, `microphone`, `usb-mic`, `speaker`, `pointing-rod`, `highlighter`                                             |
| `skill`           | How to make one kind of work                | `allyhub skills` lists them                                                                                                                                                                             |
| `lib`             | Code the others build on                    | Added with what uses it, so rarely by hand                                                                                                                                                              |
| `@polyhaven/<id>` | Poly Haven's CC0 models, HDRIs and textures | `@polyhaven/balcony`                                                                                                                                                                                    |
