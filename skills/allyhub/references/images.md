# references/images.md

An image is any picture, or a set of pictures that ship together: a photo to change, a poster, a share card, a set of product pictures, a carousel. Each picture is a **board** with its own size and Photoshop's layers. Make an image for anything a person looks at as a still; a video for what moves, a deck for pages to flip through.

- `allyhub help images` lists the commands in the order the work uses them and prints where the SDK's `image.md` and `pictures.md` are. Read them before writing an image.
- **A photo is never changed.** New pixels (made, edited, extended, cut out) come from the cloud's image tools ([ai-media.md](ai-media.md)), each a new file beside the photo that a layer then shows. Words, a logo or a price go in a layer over a picture, never in its pixels.
- **The person asks for changes with Mark up**: their viewer shows the boards and changes nothing by hand, so make each change in the image's code, or its script for words.
- **A Photoshop file** becomes an image with `allyhub image import`, which says what it could not carry over.

## See and measure

`allyhub frames <image>` draws its boards as the render draws them, and `allyhub inspect <image>` gives their facts: each board, a layer compared across boards, words a box does not hold, contrast and text layout.
