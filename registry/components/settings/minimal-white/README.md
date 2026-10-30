# Minimal white desk: cameras and screen shots

A white desk (1.4 × 0.7 m) against a bare light wall, with few things on it: a silver 27-inch monitor, a white keyboard and mouse, a silver laptop, one plant (and a mug from evening on), in bright, soft daylight. Its cameras and moves, what each is for, and what it frames; what each frames, measured with `allyhub scenery see` in a vertical 9:16 frame. Popular computer-screen demos are filmed close, on a phone's main camera: the screen at a median 0.5 m, the hands at 0.6 m, 61% looking down, 36% level. Every camera here is still; hold it by hand with `handheld()` and `phoneCamera()`.

The keyboard (centre x -0.05, 0.61 m from the person), the monitor's foot (0.2 m behind it, at its lowest) and the laptop (x 0.525, 0.66 m, turned 9°) stand where the home desk has them, so the demo cameras are the home desk's, solved from popular demos' frames.

## Your interface on a screen

`monitor-screen` and `laptop-screen` show an idle page until a video puts its own on them with `screen()`. Give it the white the idle page has in that look, or it is drawn far darker than the room: `screen(app, { inScenery: { brightness: 170 } })` on the monitor by day.

| Look     | Monitor's white, nits | Laptop's |
| -------- | --------------------- | -------- |
| day      | 170                   | 153      |
| overcast | 170                   | 153      |
| evening  | 160                   | 144      |
| night    | 140                   | 126      |

## Screen shots (moves)

Named `<screen>-<region>-<angle>`: `monitor-…` for the 27-inch monitor, `laptop-…` for the 14-inch laptop. Built by `screenShots()` (`components/cameras/screen-shots.ts`) on `focusScreen()`, so they frame the same part of the screen wherever it stands. For one element, a button pressed or a field typed in, call `focusScreen()` with that element's own rectangle.

Three sizes, each as a popular demo filmed it with a phone held to a 16:9 monitor:

| Region                                         | For                                                                                                                                                           | Monitor: screen's share of the frame, distance | Laptop       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------ |
| `strip-left`, `strip-center`, `strip-right`    | the page while it is used, from its tabs to the taskbar (44% of the screen's width, all its height; the bezel and the stand below): the most common demo shot | 69%, 0.36 m                                    | 78%, 0.19 m  |
| `detail-left`, `detail-center`, `detail-right` | a form, a list or a result read up close (30% of the width)                                                                                                   | 97%, 0.25 m                                    | 98%, 0.15 m  |
| `close-top-left`                               | the tabs and the address bar: a URL typed in, a site's name (20% of the width)                                                                                | 97%, 0.17 m                                    | 91%, 0.10 m  |
| `close-top-right`                              | sign in, share, export, the account                                                                                                                           | 97%, 0.17 m                                    | 91%, 0.10 m  |
| `close-center`                                 | one button, field or result in the middle                                                                                                                     | 100%, 0.17 m                                   | 100%, 0.10 m |
| `close-bottom-left`, `close-bottom-right`      | a status; a chat being sent, a notification                                                                                                                   | 92%, 0.17 m                                    | 87%, 0.10 m  |
| `full`                                         | the whole screen: a 16:9 frame, or the screen small in a vertical one                                                                                         | 30%, 0.81 m                                    | 35%, 0.41 m  |

Shares and distances are for the `front` angle. From a side the screen's share drops a little (`monitor-strip-center-left` 65%, `monitor-close-top-left-left` 91%, `monitor-close-top-left-right` 83%); from below, `monitor-strip-center-low` 61%.

| Angle   | Where the phone is                              | For                                              |
| ------- | ----------------------------------------------- | ------------------------------------------------ |
| `front` | square on, 5° above                             | reading: text, a form, a result                  |
| `left`  | 20° to the left, the page receding to the right | the start of a line: a URL, a menu, a title      |
| `right` | 20° to the right, the page receding to the left | the end of a line: a button, a send, a total     |
| `low`   | 18° below, looking up                           | over the keys: typing, then the screen answering |

## Cameras

| Camera              | Where                                           | For                                                                     |
| ------------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| `hands-keyboard`    | high on the left, 0.6 m from the keyboard       | the hook: hands typing, what is beside the keyboard, the monitor's foot |
| `laptop-over-hands` | behind the hands, 0.5 m from the laptop         | the laptop's screen above, its keys and the hands below                 |
| `keys-low`          | just over the laptop's keys, looking along them | the keys below, the screen above; at night, lit by the screen           |
| `demo`              | over the right shoulder                         | the keyboard and the monitor, looking down                              |
| `overhead`          | above the hands                                 | the desk from above                                                     |
| `talking`           | a phone at 1.2 m, 0.6 m from the face           | the person talking, the print behind (room version)                     |
| `setup`             | beside the person                               | the whole desk, as a tour shows it                                      |

Measured in a vertical 9:16 frame: `hands-keyboard` has the monitor's screen at 29% of the frame and the keyboard at 7%; `laptop-over-hands` the laptop's screen at 24%, 0.49 m away; `keys-low` at 60%, 0.21 m away.

`wall`, `desktop`, `left`, `right` and `overview` are for looking the room over, not for a video.
