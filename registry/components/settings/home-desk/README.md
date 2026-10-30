# Home desk: cameras and screen shots

A warm oak desk (1.6 × 0.8 m) as the most watched mechanical-keyboard demos set it (archetype A of `docs/design/desk-settings.md`): a 27-inch monitor with a light bar, centred, a Keychron Q2 Pro with Keychron's Retro keycaps centred under it, a small clock and a figure between and beside them, a plant at the back right; no laptop and no mouse. The room version adds the shelves behind the person and the microphone. The home desk's cameras and moves, what each is for, and what it frames, measured with `allyhub scenery see` in a vertical 9:16 frame. Popular computer-screen demos are filmed close, on a phone's main camera: the screen at a median 0.5 m, the hands at 0.6 m, 61% looking down, 36% level. Every camera here is still; hold it by hand with `handheld()` and `phoneCamera()`.

## Your interface on a screen

`monitor-screen` shows an idle page until a video puts its own on it with `screen()`. Give it the white the idle page has in that look, or it is drawn far darker than the room: `screen(app, { inScenery: { brightness: 160 } })` by day.

| Look     | Monitor's white, nits |
| -------- | --------------------- |
| day      | 160                   |
| overcast | 160                   |
| evening  | 150                   |
| night    | 130                   |

## Screen shots (moves)

Named `monitor-<region>-<angle>`, for the 27-inch monitor. Built by `screenShots()` (`components/cameras/screen-shots.ts`) on `focusScreen()`, so they frame the same part of the screen wherever it stands. For one element, a button pressed or a field typed in, call `focusScreen()` with that element's own rectangle.

Three sizes, each as a popular demo filmed it with a phone held to a 16:9 monitor:

| Region                                         | For                                                                                                                                                           | Monitor: screen's share of the frame, distance |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `strip-left`, `strip-center`, `strip-right`    | the page while it is used, from its tabs to the taskbar (44% of the screen's width, all its height; the bezel and the stand below): the most common demo shot | 69%, 0.36 m                                    |
| `detail-left`, `detail-center`, `detail-right` | a form, a list or a result read up close (30% of the width)                                                                                                   | 97%, 0.25 m                                    |
| `close-top-left`                               | the tabs and the address bar: a URL typed in, a site's name (20% of the width)                                                                                | 97%, 0.17 m                                    |
| `close-top-right`                              | sign in, share, export, the account                                                                                                                           | 97%, 0.17 m                                    |
| `close-center`                                 | one button, field or result in the middle                                                                                                                     | 100%, 0.17 m                                   |
| `close-bottom-left`, `close-bottom-right`      | a status; a chat being sent, a notification                                                                                                                   | 92%, 0.17 m                                    |
| `full`                                         | the whole screen: a 16:9 frame, or the screen small in a vertical one                                                                                         | 30%, 0.81 m                                    |

Shares and distances are for the `front` angle. From a side the screen's share drops a little (`monitor-strip-center-left` 65%, `monitor-close-top-left-left` 91%, `monitor-close-top-left-right` 83%); from below, `monitor-strip-center-low` 61%.

| Angle   | Where the phone is                              | For                                              |
| ------- | ----------------------------------------------- | ------------------------------------------------ |
| `front` | square on, 5° above                             | reading: text, a form, a result                  |
| `left`  | 20° to the left, the page receding to the right | the start of a line: a URL, a menu, a title      |
| `right` | 20° to the right, the page receding to the left | the end of a line: a button, a send, a total     |
| `low`   | 18° below, looking up                           | over the keys: typing, then the screen answering |

## Cameras

| Camera           | Where                                                | For                                                                                |
| ---------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `shoulder`       | over the left shoulder, 0.46 m from the keyboard     | the hook, as the reference films it: the hands on the keys below, the screen above |
| `hands-keyboard` | high on the left, 0.6 m from the keyboard            | the keyboard across the frame, the clock, the monitor's foot                       |
| `keys-low`       | low over the keyboard's front edge, looking along it | the keys large below, the screen above: typing, then the screen answering          |
| `overhead`       | straight above the keyboard                          | the keys and the clock from above                                                  |
| `demo`           | over the right shoulder, 0.8 m back                  | the keyboard and the whole monitor, looking down                                   |
| `talking`        | a phone at 1.2 m, 0.6 m from the face                | the person talking, the shelves behind (room version)                              |
| `setup`          | beside the person                                    | the whole desk, as a tour shows it                                                 |

Measured in a vertical 9:16 frame (the monitor's screen, then the keyboard, as shares of the frame):

| Camera           | Screen                    | Keyboard    |
| ---------------- | ------------------------- | ----------- |
| `shoulder`       | 40%, 0.61 m (27% cut off) | 14%, 0.46 m |
| `hands-keyboard` | 31%, 0.57 m               | 9%, 0.59 m  |
| `keys-low`       | 56%, 0.45 m (43% cut off) | 26%, 0.21 m |
| `overhead`       | its foot only             | 19%, 0.45 m |
| `demo`           | 19%, 0.88 m               | 5%, 0.82 m  |

`wall`, `desktop`, `left`, `right` and `overview` are for looking the room over, not for a video.
