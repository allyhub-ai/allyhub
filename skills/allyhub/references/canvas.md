# references/canvas.md

A canvas lays a project's work out to be seen together, compared and talked over: a launch's outputs side by side, two cuts of a video, a mood board, candidates with your reasons beside them. It draws nothing of its own and exports nothing. It is a `.canvas` file anywhere in the project, in JSON Canvas 1.0 (jsoncanvas.org, as Obsidian writes it), listed in `allyhub.yaml` with no kind (`- file: boards/launch.canvas`) for the person to see it. Write it by hand.

<!-- prettier-ignore -->
```json
{
	"nodes":[
		{"id":"7d1f0c3a9b2e4f60","type":"group","label":"Share pictures","x":-40,"y":-80,"width":1360,"height":520},
		{"id":"2b9e81c04d7f3a15","type":"file","file":"launch/og/og.ts","x":0,"y":0,"width":600,"height":340},
		{"id":"c04d7f3a152b9e81","type":"text","text":"**Why this plate**: the river reads at 400 px.","x":640,"y":0,"width":320,"height":160,"color":"4"},
		{"id":"9a6e2f10b3c84d57","type":"link","url":"https://x.com/allyhub","x":640,"y":200,"width":320,"height":120}
	],
	"edges":[
		{"id":"5e3a9c1d7b0f2846","fromNode":"c04d7f3a152b9e81","fromSide":"left","toNode":"2b9e81c04d7f3a15","toSide":"right","label":"chosen"}
	]
}
```

- **Paths are from the project's folder**, wherever the canvas is.
- **A file node points at an item by its file**, as `allyhub.yaml` lists it (`launch/og/og.ts`, `launch/film/film.ts`); it shows the item's own preview, live: an image's boards, a deck's slide, a video's still, a doc's first words. Any other file (`assets/media/plate.webp`, a clip, a sound) shows itself.
- **Nodes**: `text` (Markdown), `file`, `link` (`url`) and `group` (`label`), each with whole-pixel `x`, `y`, `width` and `height`; y grows down. The first node is drawn at the back, so a group comes before what it holds. A group holds the nodes whose boxes are inside its box.
- **Edges** join two nodes by id, from a side (`top`, `right`, `bottom`, `left`) to a side, with a `label`; `toEnd` is an arrow unless `"none"`.
- **Colours** are `"1"` red, `"2"` orange, `"3"` yellow, `"4"` green, `"5"` cyan, `"6"` purple, or a hex colour.
- **Ids** are unique across nodes and edges: 16 hex digits, as Obsidian makes them.
- **The person's changes** (moves, notes, edges) are written to the same file: read it before you change it, and keep the ids and the fields you do not know.
- `allyhub check` reports a duplicate id, a file node at a missing file and an edge at a missing node (AK-C001 to AK-C004). `allyhub inspect canvas <file>` lists the nodes with their boxes and what they point at, what each group holds and each edge's ends. `allyhub dev <file>` opens it for the person.
