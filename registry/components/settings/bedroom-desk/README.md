# Bedroom desk: cameras and screen shots

A warm pale pink desk (1.2 × 0.6 m) in the corner of a bedroom, its window on the right: a silver 14-inch MacBook Pro centred on it, a warm globe lamp at the back left, and a framed print of Monet's _Water Lilies_ (1906) over the desk. It is the setting for a demo on a laptop. The room version adds the bed with white bedding behind the person on their left. Its cameras and moves, what each is for, and what it frames, measured with `allyhub scenery see` in a vertical 9:16 frame. Every camera here is still; hold it by hand with `handheld()` and `phoneCamera()`.

## Your interface on a screen

`laptop-screen` shows an idle page until a video puts its own on it with `screen()`. Give it the white the idle page has in that look, or it is drawn far darker than the room: `screen(app, { inScenery: { brightness: 160 } })` by day.

| Look     | Laptop's white, nits |
| -------- | -------------------- |
| day      | 160                  |
| overcast | 160                  |
| evening  | 150                  |
| night    | 130                  |

## Screen shots (moves)

Named `laptop-<region>-<angle>`, built by `screenShots()` (`components/cameras/screen-shots.ts`) on `focusScreen()`, so they frame the same part of the screen wherever it stands: `strip-center` 78% of the frame at 0.19 m, `detail-center` 97% at 0.15 m, `close-top-left` 91%, `close-center` 100%, `full` 35% at 0.41 m. For one element, a button pressed or a field typed in, call `focusScreen()` with that element's own rectangle.

## Cameras

| Camera              | Where                                   | For                                               |
| ------------------- | --------------------------------------- | ------------------------------------------------- |
| `laptop-over-hands` | behind the hands, 0.5 m from the screen | the screen above, the keys and the hands below    |
| `keys-low`          | just over the keys, looking along them  | the keys below, the screen above                  |
| `demo`              | over the right shoulder                 | the laptop and the lamp, looking down             |
| `desk-wall`         | in front, 0.9 m back                    | the painting over the laptop: the setting         |
| `talking`           | a phone at 1.2 m, 0.6 m from the face   | the person talking, the bed behind (room version) |
| `setup`             | beside the person, on the bed's side    | the whole desk and the window, as a tour shows it |

Measured in a vertical 9:16 frame, the laptop's screen as a share of the frame: `laptop-over-hands` 23%, `keys-low` 59% (43% cut off by the frame), `demo` 11%, `desk-wall` 9% (the painting 14%).

`wall`, `desktop`, `left`, `right` and `overview` are for looking the room over, not for a video.
