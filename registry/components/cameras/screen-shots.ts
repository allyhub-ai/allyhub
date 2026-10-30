// Shots of a screen's content, as popular computer-screen demos film them: a phone's main camera close to the
// screen, a part of it filling a vertical frame, square on or from a side. Each is focusScreen() over a region
// of the content, so it frames the same part of the screen wherever the screen stands.
//
// For one element (the button a finger presses, the field typed in), call focusScreen() with its own rectangle:
// focusScreen("monitor-screen", [x, y, w, h], { fill: 0.35, lens: 26, lensFrame: "phone" }) frames it with
// enough of the page around it to see where it is.
import { focusScreen, type Move } from "@allyhub-next/scenery-host/layer";

type Rect = readonly [number, number, number, number];

/**
 * The parts of a screen a demo films, as [x, y, width, height] shares of its content from the top left, each
 * taken from a popular demo's frame (a phone held to a 16:9 monitor, in a 9:16 frame), and what it is for.
 * Three sizes: a strip (44% of the screen's width, all of its height: the screen fills 72% of the frame, the
 * bezel and stand below), a detail (30% of its width: the screen fills nearly all of the frame) and a close
 * shot of a corner or the middle (20% of its width). `full` is the whole screen, for a 16:9 frame or a still.
 */
export const SCREEN_REGIONS = {
  full: {
    rect: [0, 0, 1, 1],
    use: "the whole screen: a 16:9 frame, or the screen small in a vertical one",
  },
  "strip-left": {
    rect: [0.02, 0, 0.44, 1],
    use: "the page's left half while it is used: a sidebar, a list",
  },
  "strip-center": {
    rect: [0.28, 0, 0.44, 1],
    use: "the page while it is used, from its tabs to the taskbar: the most common demo shot",
  },
  "strip-right": {
    rect: [0.54, 0, 0.44, 1],
    use: "the page's right half: a preview, a result, a panel",
  },
  "detail-left": {
    rect: [0.05, 0.02, 0.3, 0.95],
    use: "a form or a list read up close, on the left",
  },
  "detail-center": {
    rect: [0.35, 0.02, 0.3, 0.95],
    use: "a form, a list or a result read up close",
  },
  "detail-right": {
    rect: [0.65, 0.02, 0.3, 0.95],
    use: "a panel or a result read up close, on the right",
  },
  "close-top-left": {
    rect: [0, 0, 0.2, 0.63],
    use: "the tabs and the address bar: a URL typed in, a site's name",
  },
  "close-top-right": {
    rect: [0.8, 0, 0.2, 0.63],
    use: "sign in, share, export, the account",
  },
  "close-center": {
    rect: [0.4, 0.185, 0.2, 0.63],
    use: "one button, field or result in the middle",
  },
  "close-bottom-left": {
    rect: [0, 0.37, 0.2, 0.63],
    use: "a status, a sidebar's foot",
  },
  "close-bottom-right": {
    rect: [0.8, 0.37, 0.2, 0.63],
    use: "a chat being sent, a notification",
  },
} as const satisfies Record<string, { rect: Rect; use: string }>;

/**
 * Where the camera looks from, in degrees off square on (focusScreen's yaw and pitch): "front" a little above;
 * "left" and "right" a phone held 20° to a side, the page receding away from it (as the address bar is filmed);
 * "low" a phone below the screen looking up, as over a laptop's keys.
 */
export const SCREEN_ANGLES = {
  front: { yaw: 0, pitch: -5 },
  left: { yaw: -20, pitch: -5 },
  right: { yaw: 20, pitch: -5 },
  low: { yaw: 0, pitch: 18 },
} as const satisfies Record<string, { yaw: number; pitch: number }>;

export type ScreenRegion = keyof typeof SCREEN_REGIONS;
export type ScreenAngle = keyof typeof SCREEN_ANGLES;

export interface ScreenShotOptions {
  /** The first part of each move's name; default the screen's name. */
  prefix?: string;
  /** A phone's main camera by default: 26 mm measured as a phone measures it. */
  lens?: number;
  /** The exposure, EV at ISO 100. */
  ev?: number;
  regions?: readonly ScreenRegion[];
  angles?: readonly ScreenAngle[];
}

/** A move per region and angle of a screen, named `<prefix>-<region>-<angle>` ("monitor-strip-center-front"). */
export function screenShots(
  screen: string,
  o: ScreenShotOptions = {},
): Record<string, Move> {
  const prefix = o.prefix ?? screen;
  const regions = o.regions ?? (Object.keys(SCREEN_REGIONS) as ScreenRegion[]);
  const angles = o.angles ?? (Object.keys(SCREEN_ANGLES) as ScreenAngle[]);
  const moves: Record<string, Move> = {};
  for (const region of regions) {
    const { rect } = SCREEN_REGIONS[region];
    for (const angle of angles) {
      const { yaw, pitch } = SCREEN_ANGLES[angle];
      moves[`${prefix}-${region}-${angle}`] = focusScreen(screen, rect, {
        fill: 1,
        yaw,
        pitch,
        lens: o.lens ?? 26,
        lensFrame: "phone",
        ...(o.ev === undefined ? {} : { ev: o.ev }),
      });
    }
  }
  return moves;
}
