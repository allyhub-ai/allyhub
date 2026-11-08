# references/images.md

An image is any picture, or a set of pictures that ship together: a photo to change, a poster, a set of product pictures, a carousel. It is a module (`.ts`, named as you like) listed in `allyhub.yaml` (`kind: image`, `file`, an optional `title`) that names its script from its folder: `script` its words, a file per language with `{locale}` once in its name. Two images in one folder share a script only when both name it. Each picture is a **board** with its own size and its own layers.

```ts
import { board, fromPicture, image, picture } from "@allyhub/sdk/image";

export default image({
  script: "./trip.{locale}.yaml",
  matrix: { dims: { lang: ["en", "ja"] } },
  boards: (ctx) => [
    board({
      key: "photo",
      size: fromPicture(photo),
      layers: [
        picture({ key: "photo", src: photo }),
        Caption({ key: "caption", text: ctx.s("trip.photo.caption") }),
      ],
    }),
    board({
      key: "poster",
      size: "1240x1754",
      layers: [
        picture({ key: "plate", src: plate }),
        Caption({ key: "title", text: ctx.s("trip.poster.title") }),
      ],
    }),
  ],
});
```

- **Layers** are Photoshop's: `picture()`, `textLayer()` (its `textItem`), `shape()`, `fill()`, `adjustment()` (Curves, Levels, Hue/Saturation…, on what lies under it), `group()`, components and `custom()`; each takes `blendMode`, `opacity`, `fillOpacity`, `clipping`, `mask`, `effects` (Photoshop's layer styles) and `transform`, by Photoshop's names. They are drawn as a still: settled after their entrance; there is no time, speech, music or transition, and `footage()` of a video file is not drawn.
- **What Chrome cannot draw exactly is refused** (AK-I007, with why): some blend modes (`linearBurn`, `vividLight`, `dissolve`…), an effect under the layer in another blend mode, a clipping base that is HTML (a type layer, a component). The SDK's `image.md` lists what is drawn and how.
- **Every layer has a `key`**, unique on its board. Facts name layers by it, and a layer of one key on several boards is compared across them.
- **A board's size** is `size: "WxH"`, `width` and `height`, or `fromPicture(src)` (a photo's own size, the photo its bottom layer). `ctx.dims` in a layer is its board's own size.
- **A photo is never changed.** A pixel edit is a new file beside it (its `.gen.json` says how it was made), which a layer then shows.
- **A picture's pixels** are changed by the cloud's image tools (`allyhub ai-media`): made, edited where a mask or marks say, extended, cut out or split into layers, each a new file beside its record. A Mark up note's region is SVG path data in the picture's own pixels, to draw a mask from.
- **No brand in the image**: it has no look. The stage's variables are neutral defaults; import a brand's colours and fonts into your components.
- **`height: "auto"`** lays the layers out at the board's width and its `minHeight` (64), then makes the board as tall as their content reaches, up to `maxHeight` (16384). Lay such a board out in flow, not by the frame's height: a `picture()` box is a share of the final height.
- **Words** come from the script: a board's are under `boards` with the board's key as `id` and its layers' words by name under `text`, shared ones under the script's own `text`, read with `ctx.s("<piece>.<key>…")` as a video's are.
- **What the person asks for** comes by Mark up: the person's viewer shows the boards and changes nothing. A mark reaches you with each layer under it (its key, the line that names it, its words, its picture) and the mark as a region of its pixels; make the change in the code, or the script for words.
- **Files**: `allyhub render <image>` makes PNGs; `--type jpeg`, `webp`, `avif`, `pdf` (a page a board, its text as text) and `zip` (the set). A board's file is `<item>.<combo>/<key>.<ext>`. `transparent: true` keeps the alpha channel in PNG, WebP and AVIF. `--param quality=…` sets JPEG, WebP and AVIF quality; `--param scale=2` (or `width=…`, `height=…`) draws each board larger, its layout kept; `--param max-kb=…` keeps each JPEG, WebP or AVIF under a size at the best quality that fits.
- **PSD**: `--type psd` writes a layered Photoshop file a board, each layer of its kind (its pixels drawn by Chrome, Photoshop redrawing its text and effects), and `allyhub image import <file.psd> --to <module>.ts` makes an image of one, named after its module (`<name>.ts`, `<name>.<lang>.yaml`, its pictures beside them), saying what it could not carry over as it is.
- **See it**: `allyhub frames <image>` draws every board on one sheet, `--part <key>` one board. `allyhub inspect <image>` gives `board`, `board-consistency` (a named layer's box, cap height and colour across boards), `picture-scale`, `overset` (words a paragraph box does not hold, and how many), `text-contrast` and the text layout facts.
