# references/video.md

A video is a folder with a `video.ts` (or `.tsx`), rendered to MP4. A **part** is a stretch of the video, what video tools often call a scene.

## Where to look

| To                             | Commands                  | SDK docs                                                       |
| ------------------------------ | ------------------------- | -------------------------------------------------------------- |
| Make a video or a batch of ads | `allyhub help video`      | `video.md`, `layers.md`, `speech.md`, `sound.md`, `batches.md` |
| Cut recorded footage           | `allyhub help footage`    | `footage.md`, `speech.md`                                      |
| Study reference videos         | `allyhub help references` |                                                                |

Those help pages print where the SDK's docs are. Read the ones the video needs before writing it. `layers.md` holds `custom()` and `defineComponent()`, the layer's `ctx`, the DOM, animation, text, path and noise helpers, and a person's input: `pointer`, `tap`, `drag`, scrolling and typing, which move a cursor, a finger or anything held the way a hand does.

## Ready-made

`allyhub add search --type component` lists the starter components: captions timed to words, callouts, charts, code panels and screen demos. `allyhub add component/<name>` copies one into `components/`, and the copy is the project's.

A video can be shown in a 3D room, as if filmed on a phone held to a monitor or laptop with the product's interface on it. This works best for demos close to the screen. Start from a ready-made scenery: [3d.md](3d.md).

## Music and sound effects

- **Music**: write it yourself, or generate a professional track with an AI model for a small number of credits: [ai-media.md](ai-media.md).
- **Sound effects**: make them yourself. Use the built-in `whoosh`, `tick` and `pop`, or your own audio file, as the SDK's `sound.md` says.

## Styles

A style of video, such as a product demo or a UGC short, has its own skill. `allyhub skills` lists them and `allyhub skills show <name>` prints one.

## See and measure

| To see                                                            | Run                                                                 |
| ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| Every part's still, or any moment                                 | `allyhub frames <item>`, with `--at 2.5`                            |
| A stretch as a clip, or the text boxes over the picture           | `allyhub frames` with `--from`, `--to` and `--clip`, or `--overlay` |
| Each cut, with its frames, sound and words                        | `allyhub frames cuts`                                               |
| The check's facts, by kind, part and time                         | `allyhub inspect`, with `--kind`                                    |
| Layout and every text block                                       | `allyhub inspect layout`                                            |
| Text against the pixels behind it, which `check` does not measure | `allyhub inspect contrast`                                          |
| Parts, layers, speech and sound, drawn nowhere                    | `allyhub inspect timeline`                                          |
| Motion, held pictures, joins, flashes and the loop                | `allyhub inspect motion`, `still`, `seams`, `flash`, `loop`         |
| Loudness, the mix, silences and pace                              | `allyhub audio`                                                     |
| A recording's words and what a cut keeps                          | `allyhub words`, `allyhub words edits`                              |
| A piece against a reference video                                 | `allyhub reference compare`, `allyhub frames compare`               |

## Costs

Rendering runs on this computer and costs no credits. AI media does: `allyhub help ai-media <tool>` says how a model counts them, such as credits per second of video, so work out a clip's cost from its length before generating it.

`allyhub inspect combos` gives a batch's combos and how many part renders they take.
