# Minimal walnut desk: cameras and screen shots

A dark walnut desk (1.6 × 0.75 m) on a black frame against a light wall, with few things on it: a 27-inch monitor, a white Magic Keyboard and Magic Trackpad on the bare wood, a steel spring at the right and a plant at the left. Archetype E of `docs/design/desk-settings.md`. Every camera here is still; hold it by hand with `handheld()` and `phoneCamera()`.

## Your interface on a screen

`monitor-screen` shows an idle page until a video puts its own on it with `screen()`. Give it the white the idle page has in that look, or it is drawn far darker than the room: `screen(app, { inScenery: { brightness: 270 } })` by day.

| Look     | Monitor's white, nits |
| -------- | --------------------- |
| day      | 270                   |
| overcast | 230                   |
| evening  | 160                   |
| night    | 140                   |

## Screen shots (moves)

Named `monitor-<region>-<angle>`. Built by `screenShots()` (`components/cameras/screen-shots.ts`) on `focusScreen()`, so they frame the same part of the screen wherever it stands. For one element, a button pressed or a field typed in, call `focusScreen()` with that element's own rectangle.

| Region                                         | For                                                 | Screen's share of the frame, distance |
| ---------------------------------------------- | --------------------------------------------------- | ------------------------------------- |
| `strip-left`, `strip-center`, `strip-right`    | the page while it is used, from its tabs to its end | 69%, 0.36 m                           |
| `detail-left`, `detail-center`, `detail-right` | a form, a list or a result read up close            | 97%, 0.25 m                           |
| `close-top-left`, `close-top-right`            | the address bar; sign in, share, export             | 97%, 0.17 m                           |
| `close-center`                                 | one button, field or result                         | 100%, 0.17 m                          |
| `close-bottom-left`, `close-bottom-right`      | a status; a chat being sent, a notification         | 92%, 0.17 m                           |
| `full`                                         | the whole screen                                    | 30%, 0.81 m                           |

Shares and distances are for the `front` angle, measured with `allyhub scenery see` in a vertical 9:16 frame. From a side the share drops a little (`monitor-strip-center-left` 65%, `monitor-close-top-left-left` 91%, `monitor-close-top-left-right` 83%); from below, `monitor-strip-center-low` 61%.

| Angle   | Where the phone is                              | For                                              |
| ------- | ----------------------------------------------- | ------------------------------------------------ |
| `front` | square on, 5° above                             | reading: text, a form, a result                  |
| `left`  | 20° to the left, the page receding to the right | the start of a line: a URL, a menu, a title      |
| `right` | 20° to the right, the page receding to the left | the end of a line: a button, a send, a total     |
| `low`   | 18° below, looking up                           | over the keys: typing, then the screen answering |

## Cameras

Measured in a vertical 9:16 frame.

| Camera     | Where                       | Frames                                                        |
| ---------- | --------------------------- | ------------------------------------------------------------- |
| `demo`     | square on, a little high    | the monitor's screen at 31%, 0.80 m away; the keyboard at 10% |
| `shoulder` | over the right shoulder     | the screen at 28%, the keyboard at 7%, the trackpad at 4%     |
| `keys-low` | low across the keys         | the screen at 40%, cut by 20%; the keys below it              |
| `corner`   | at the monitor's right edge | half the screen at 21%, the spring whole, the trackpad        |
| `overhead` | above the hands             | the keyboard at 7% and the trackpad at 4%, both whole         |
| `setup`    | beside the person           | the whole desk, as a tour shows it                            |

`talking`, `wall`, `desktop`, `left`, `right` and `overview` are for the room version and for looking the room over, not for a demo.
