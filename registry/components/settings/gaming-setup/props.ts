// The gaming setup's props, placed in a 3.6 × 2.82 m room with a pale wall. Blender's axes (Z up): a world
// point (x, y, z) is (x, -z, y) here. The person sits at the origin facing the desk at +y; the desk's wall is
// at y = 1.02 (the desk's back edge 2 cm off it), the wall behind them at -1.8.
//
// Laid out as desk demos in a coloured room show it (archetype D of docs/design/desk-settings.md):
// - a black 1.4 × 0.7 m desk, its front edge 0.3 m from the person, a black mat with a lit edge on it;
// - a 27-inch gaming monitor centred, a mechanical keyboard centred under it, a mouse to its right;
// - at the left, a USB microphone on its own stand;
// - behind the monitor, hidden by it, two light bars turned to the wall: what colours the room.
// `look` is "day", "overcast", "evening" or "night": each has its own pair of colours.
import {
  defineModel,
  type Bpy,
  type ModelObject,
  type Vec3,
} from "@allyhub-next/model";
import { usbMic, USB_MIC_PRESETS } from "../../kit/audio.ts";
import { chair } from "../../kit/chair.ts";
import { desk, DESK_DEFAULTS } from "../../kit/desk.ts";
import { lightBar, mouse } from "../../kit/desk-items.ts";
import { keyboard } from "../../kit/keyboard.ts";
import { MONITOR_PRESETS, monitor } from "../../kit/monitor.ts";
import {
  deg,
  finish,
  group,
  mm,
  slab,
  solid,
  type Finish,
} from "../../kit/parts.ts";
import { rug } from "../../kit/wall.ts";

export const TOP = 0.74;
export const DESK_WALL = 1.02;
export const BACK_WALL = -1.8;
/** The desk's centre: a 1.4 × 0.7 m top against the wall, its front edge 0.3 m from the person. */
export const DESK_Y = 0.65;
/** The keyboard's centre, 0.25 m in from the desk's front edge. */
const KEYS_Y = 0.55;
/** The monitor's foot, centred behind the keyboard. */
const MONITOR_Y = 0.78;
/** The mat's centre. */
const MAT_Y = 0.5;
/**
 * The light bars, each in its monitor mount on the panel's back (Philips Hue Play's own bracket): their x, y and
 * height over the desk, and how far each turns outward (degrees), so each colours its own side of the wall.
 */
export const BARS = { x: 0.2, y: 0.88, z: 0.16, turn: 28 };
/** A bar's diffuser (Philips Hue Play, 254 × 44 mm with its ends): its size and the height of its centre over the desk. */
export const BAR_GLOW = { size: [0.036, 0.244], height: 0.127 };

/**
 * Each look's two colours (sRGB), left and right, and how bright the keyboard's backlight and the mat's edge
 * glow (nits). By day the room shows and the colours are cool; by night they are all there is.
 */
export const LEDS = {
  day: { left: "#27d6e8", right: "#3f7dff", keys: 30, mat: 22 },
  overcast: { left: "#3f7dff", right: "#e24bd0", keys: 30, mat: 22 },
  evening: { left: "#ff3fa4", right: "#2f8bff", keys: 30, mat: 22 },
  night: { left: "#7a35ff", right: "#ff8a2b", keys: 30, mat: 22 },
} as const;
export type GamingLook = keyof typeof LEDS;

const BLACK_TOP: Finish = { color: "#242428", roughness: 0.5 };

export default defineModel((bpy, params) => {
  const look = String(params["look"]);
  const led = look in LEDS ? LEDS[look as GamingLook] : LEDS.night;
  // The demo version is the desk and its wall alone: what a camera close to the screen sees.
  const demo = params["version"] === "demo";
  const top = TOP;

  desk(bpy, [0, DESK_Y, 0], {
    top: [1.4, 0.7, DESK_DEFAULTS.top[2]],
    surface: BLACK_TOP,
    frame: { color: "#0f0f10", roughness: 0.5, metallic: 0.3 },
    handset: false,
  });
  litMat(bpy, [0, MAT_Y, top], led.left, led.right, led.mat);
  monitor(bpy, [0, MONITOR_Y, top], MONITOR_PRESETS.gaming27);
  // Keychron K8 Pro: black case, lilac caps as the reference's board, its backlight the look's two colours.
  keyboard(bpy, [0, KEYS_Y, top + mm(4)], {
    case: { color: "#141518", roughness: 0.45, metallic: 0.5 },
    keys: { color: "#5a5478", roughness: 0.5 },
    accent: { color: "#8d7fd0", roughness: 0.5 },
    legends: "light",
    backlight: { color: [led.left, led.right], strength: led.keys },
  });
  mouse(bpy, [0.3, KEYS_Y, top + mm(4)], { kind: "gaming" });
  deskMic(bpy, [-0.4, 0.74, top]);

  // The light that colours the wall comes from the scenery's panes; the diffusers, hidden behind the monitor,
  // glow only enough to read as on from a side.
  for (const side of [-1, 1] as const)
    lightBar(bpy, [side * BARS.x, BARS.y, top + BARS.z], {
      color: side < 0 ? led.left : led.right,
      glow: 1,
      rotation: [0, 0, deg(-side * BARS.turn)],
    });

  if (demo) return;

  // The room version: the chair on a dark rug.
  const seat = chair(bpy, [0, -0.07, mm(8)], {
    mesh: { color: "#1a1a1c", roughness: 0.9 },
  });
  seat.rotation_euler = [0, 0, Math.PI];
  rug(bpy, [0, -0.38, 0], {
    size: [2.0, 1.4],
    weave: { color: "#24252a", roughness: 1 },
  });
});

/**
 * A lit desk mat (SteelSeries QcK Prism Cloth XL: 900 × 300 × 4 mm, two lighting zones): black cloth, a band of
 * light round its edge, one colour on each half. `glow` is in nits.
 */
function litMat(
  bpy: Bpy,
  at: Vec3,
  left: string,
  right: string,
  glow: number,
): ModelObject {
  const root = group(bpy, "LitMat", at);
  const [w, d, h] = [mm(900), mm(300), mm(4)];
  const band = mm(2);
  const corner = mm(19);
  // A zone: the band along the mat's edge from the middle of its front round to the middle of its back, on the
  // side `sign`, wound counter-clockwise from above. It is only the band: nothing of it lies under the cloth.
  const zone = (name: string, color: string, sign: 1 | -1): void => {
    const rim = (inset: number): [number, number][] => {
      const [x, y, r] = [w / 2 - inset, d / 2 - inset, corner - inset];
      const arc = (cx: number, cy: number, from: number): [number, number][] =>
        Array.from({ length: 11 }, (_, i) => {
          const a = from + (i / 10) * (Math.PI / 2);
          return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
        });
      const half: [number, number][] = [
        [0, -y],
        ...arc(x - r, -y + r, -Math.PI / 2),
        ...arc(x - r, y - r, 0),
        [0, y],
      ];
      return sign > 0
        ? half
        : half.map(([px, py]): [number, number] => [-px, py]).reverse();
    };
    const [outer, inner] = [rim(0), rim(band)];
    const top = h - mm(0.5);
    const vertices: Vec3[] = [];
    const faces: number[][] = [];
    outer.forEach(([ox, oy], i) => {
      const [ix, iy] = inner[i] ?? [ox, oy];
      vertices.push([ox, oy, 0], [ox, oy, top], [ix, iy, top], [ix, iy, 0]);
      if (i < outer.length - 1) {
        const [a, b] = [i * 4, (i + 1) * 4];
        faces.push(
          [a, b, b + 1, a + 1],
          [a + 1, b + 1, b + 2, a + 2],
          [a + 2, b + 2, b + 3, a + 3],
        );
      }
    });
    solid(
      bpy,
      name,
      vertices,
      faces,
      finish(bpy, name, {
        color: "#0b0b0c",
        roughness: 0.5,
        emission: { color, strength: glow },
      }),
      { parent: root },
    );
  };
  zone("LitMatRight", right, 1);
  zone("LitMatLeft", left, -1);
  slab(
    bpy,
    "LitMatCloth",
    [w - 2 * band, d - 2 * band, h],
    corner - band,
    finish(bpy, "DeskMat", { color: "#1d1e23", roughness: 0.95 }),
    { parent: root, edge: mm(1), uv: true },
  );
  return root;
}

const MIC_LOOK = USB_MIC_PRESETS.silver;
const MIC_CABLE: Vec3[] = [
  [-0.02, 0, 0.112],
  [-0.02, 0, 0.095],
  [-0.012, 0.008, 0.07],
  [-0.006, 0.04, 0.045],
  [0.005, 0.085, 0.024],
  [0.03, 0.13, 0.003],
  [0.09, 0.19, 0.002],
  [0.2, 0.2, 0.002],
  [0.42, 0.14, 0.002],
];

/** The USB microphone (a Blue Yeti) turned in towards the person, its cable through its stand and away behind the monitor. */
function deskMic(bpy: Bpy, at: Vec3): ModelObject {
  const mic = usbMic(bpy, at, { cable: MIC_CABLE, ...MIC_LOOK });
  mic.rotation_euler = [0, 0, deg(14)];
  return mic;
}
