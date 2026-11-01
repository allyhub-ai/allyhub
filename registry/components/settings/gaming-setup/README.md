# Gaming setup: cameras and screen shots

A black desk (1.4 × 0.7 m) in a pale room with its own light off: two light bars behind the monitor wash the wall in colour, one each side. On the desk, a 27-inch gaming monitor, a backlit Keychron K8 Pro on a lit SteelSeries mat, a gaming mouse and a Blue Yeti in silver at the left. Archetype D of `docs/design/desk-settings.md`. Every camera here is still; hold it by hand with `handheld()` and `phoneCamera()`.

## Your interface on a screen

`monitor-screen` shows a wallpaper until a video puts its own on it with `screen()`. Give it the white the monitor has in that look, or it is drawn far darker or brighter than the room: `screen(app, { inScenery: { brightness: 100 } })` at night.

| Look     | Monitor's white, nits | Left bar | Right bar |
| -------- | --------------------- | -------- | --------- |
| day      | 200                   | cyan     | blue      |
| overcast | 170                   | blue     | magenta   |
| evening  | 130                   | pink     | blue      |
| night    | 100                   | purple   | orange    |

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

Shares and distances are for the `front` angle, measured with `allyhub scenery see` in a vertical 9:16 frame. From a side the share drops a little (`monitor-strip-center-left` 65%, `monitor-close-top-left-left` 90%, `monitor-close-top-left-right` 83%); from below, `monitor-strip-center-low` 61%.

| Angle   | Where the phone is                              | For                                              |
| ------- | ----------------------------------------------- | ------------------------------------------------ |
| `front` | square on, 5° above                             | reading: text, a form, a result                  |
| `left`  | 20° to the left, the page receding to the right | the start of a line: a URL, a menu, a title      |
| `right` | 20° to the right, the page receding to the left | the end of a line: a button, a send, a total     |
| `low`   | 18° below, looking up                           | over the keys: typing, then the screen answering |

## Cameras

Measured in a vertical 9:16 frame.

| Camera     | Where               | Frames                                                                |
| ---------- | ------------------- | --------------------------------------------------------------------- |
| `front`    | square on, low      | the screen at 18%, the keyboard at 3%, the microphone at 2%, the wall |
| `demo`     | behind the shoulder | the screen at 26%, 0.85 m away; the keyboard at 5%                    |
| `keys-low` | low across the keys | the screen at 38%, cut by 20%; the keyboard at 9%                     |
| `setup`    | beside the person   | the whole desk, as a tour shows it                                    |

`desktop` and `overview` are for looking the room over, not for a demo.
