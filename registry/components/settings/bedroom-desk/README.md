# Bedroom desk: cameras and screen shots

A pale pink desk (1.2 × 0.6 m) in the corner of a bedroom, its window on the right, as pastel tablet videos set it (archetype C of `docs/design/desk-settings.md`): an iPad Pro 11 upright in portrait on a small aluminium stand on a coiled rattan placemat, its Apple Pencil beside it, a warm globe lamp at the back left, and a framed print of Monet's _Water Lilies_ (1906) over the desk. The room version adds the bed with white bedding behind the person on their left. Its cameras and moves, what each is for, and what it frames, measured with `allyhub scenery see` in a vertical 9:16 frame. Every camera here is still; hold it by hand with `handheld()` and `phoneCamera()`.

## Your interface on a screen

`tablet-screen` (portrait, 1668 × 2420) shows an idle page until a video puts its own on it with `screen()`. Give it the white the idle page has in that look, or it is drawn far darker than the room: `screen(app, { inScenery: { brightness: 160 } })` by day.

| Look     | Tablet's white, nits |
| -------- | -------------------- |
| day      | 160                  |
| overcast | 160                  |
| evening  | 150                  |
| night    | 130                  |

## Screen shots (moves)

Named `tablet-<region>-<angle>`, built by `screenShots()` (`components/cameras/screen-shots.ts`) on `focusScreen()`. Its regions are a monitor's, taken from popular demos filmed on a 16:9 screen; on the portrait tablet they frame more of it: `strip-center` 95% of the frame at 0.18 m, `detail-center` 98% at 0.17 m, the `close-…` corners 65–69% at 0.12 m (the frame's edges cut most of the screen), `full` 74% at 0.22 m. For one element, a button pressed or a field typed in, call `focusScreen()` with that element's own rectangle.

## Cameras

| Camera         | Where                                  | For                                                          |
| -------------- | -------------------------------------- | ------------------------------------------------------------ |
| `tablet-high`  | high in front, 0.33 m from the screen  | the tablet on its stand and the mat, as a phone held over it |
| `tablet-close` | in front, 0.28 m from the screen       | the screen filling the frame, the stand below                |
| `tablet-side`  | from the right, 0.29 m from the screen | the screen turned a little, the lamp behind                  |
| `desk-wall`    | in front, 1 m back                     | the painting over the tablet: the setting                    |
| `demo`         | over the right shoulder                | the tablet small on the desk, looking down                   |
| `talking`      | a phone at 1.2 m, 0.6 m from the face  | the person talking, the bed behind (room version)            |
| `setup`        | beside the person, on the bed's side   | the whole desk and the window, as a tour shows it            |

Measured in a vertical 9:16 frame, the tablet's screen as a share of the frame: `tablet-high` 30%, `tablet-close` 49%, `tablet-side` 29%, `desk-wall` 9% (the painting 14%), `demo` 9%.

`wall`, `desktop`, `left`, `right` and `overview` are for looking the room over, not for a video.
