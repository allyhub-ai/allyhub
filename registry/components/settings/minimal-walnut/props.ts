// The minimal walnut desk's props, placed in a 3.6 × 2.82 m room with a light wall. Blender's axes (Z up): a
// world point (x, y, z) is (x, -z, y) here. The person sits at the origin facing the desk at +y; the
// desk's wall is at y = 1.02 (the desk's back edge 2 cm off it), the wall behind them at -1.8.
//
// Laid out as minimal walnut desks show them (archetype E of docs/design/desk-settings.md), made for a demo on
// the monitor:
// - the work zone: a dark walnut 1.6 × 0.75 m desk on a black frame against a light wall, its front edge 0.3 m
//   from the person; a 27-inch monitor centred on it, a white Magic
//   Keyboard centred and a white trackpad, a steel spring on the wood at the right and a plant at the left;
// - behind the person (the room version only): one large framed print on the back wall, a tall plant in
//   the corner, the chair on a pale rug.
// `look` is "day", "overcast", "evening" or "night".
import {
  defineModel,
  type Bpy,
  type ModelObject,
  type Vec3,
} from "@allyhub-next/model";
import { chair } from "../../kit/chair.ts";
import { desk, DESK_DEFAULTS } from "../../kit/desk.ts";
import { trackpad } from "../../kit/desk-items.ts";
import { keyboard, KEYBOARD_PRESETS } from "../../kit/keyboard.ts";
import { monitor } from "../../kit/monitor.ts";
import { finish, group, mm, solid } from "../../kit/parts.ts";
import { pictureFrame, rug } from "../../kit/wall.ts";

export const TOP = 0.74;
export const DESK_WALL = 1.02;
export const BACK_WALL = -1.8;
/** The desk's centre: a 1.6 × 0.75 m top against the wall, its front edge 0.3 m from the person. */
export const DESK_Y = 0.675;
/** The keyboard's centre: 0.15 m in from the desk's front edge. */
const KEYS_Y = 0.45;
/** The monitor's foot, centred, its face some 0.5 m from the desk's front edge. */
const MONITOR_Y = 0.86;
/** The plant's place on the desk (the scenery stands a scanned one there), back left. */
export const DESK_PLANT = { x: -0.5, y: 0.9 };

export default defineModel((bpy, params) => {
  // The demo version is the desk and its wall alone: what a camera close to the screen sees.
  const demo = params["version"] === "demo";
  const top = TOP;

  // The top's wood is the scenery's walnut veneer; this colour is under it.
  desk(bpy, [0, DESK_Y, 0], {
    top: [1.6, 0.75, DESK_DEFAULTS.top[2]],
    surface: { color: "#5b3b26", roughness: 0.5 },
    frame: { color: "#1f1f21", roughness: 0.45, metallic: 0.3 },
    handset: false,
  });
  // The kit's 27-inch monitor, centred, low on its stand, its face some 50 cm from the desk's front edge.
  monitor(bpy, [0, MONITOR_Y, top], { raise: 0, tilt: 3 });
  // Apple Magic Keyboard centred 15 cm from the front edge, the Magic Trackpad to its right.
  keyboard(bpy, [0, KEYS_Y, top], KEYBOARD_PRESETS.lowProfile);
  trackpad(bpy, [0.25, KEYS_Y + 0.01, top]);
  spring(bpy, [0.42, KEYS_Y + 0.31, top]);

  if (demo) return;

  // Behind the person: one large print on the back wall, the chair on a pale rug.
  const art = pictureFrame(
    bpy,
    [0.55, BACK_WALL, 1.45],
    {
      size: [mm(700), mm(1000), mm(25)],
      moulding: mm(12),
      mount: mm(80),
      frame: { color: "#f2f1ee", roughness: 0.5 },
    },
    undefined,
    "BackArt",
  );
  art.rotation_euler = [0, 0, Math.PI];
  const seat = chair(bpy, [0, -0.07, mm(8)], {
    mesh: { color: "#d9d8d4", roughness: 0.9 },
    frame: { color: "#e9e9e7", roughness: 0.45 },
  });
  seat.rotation_euler = [0, 0, Math.PI];
  rug(bpy, [0, -0.38, 0], {
    size: [2.0, 1.4],
    weave: { color: "#e8e4dc", roughness: 1 },
  });
});

/**
 * A steel spring standing on its end, as the reference keeps one on the desk: 2.4 mm round wire in 8 open turns
 * 76 mm across and 100 mm tall (sizes read from the frame, beside its monitor), each end closed flat.
 */
function spring(bpy: Bpy, at: Vec3): ModelObject {
  const root = group(bpy, "SpringToy", at);
  const steel = finish(bpy, "SpringSteel", {
    color: "#d4d6d9",
    roughness: 0.22,
    metallic: 1,
  });
  const [radius, wire, height, turns] = [mm(38), mm(1.2), mm(100), 8];
  const [steps, sides] = [turns * 48, 8];
  const closed = 1; // Turns at each end that climb only by the wire's own thickness.
  const pitch =
    (height - wire * 2 - closed * 2 * wire * 2) / (turns - closed * 2);
  const rise = (a: number): number =>
    wire +
    Math.min(a, closed) * wire * 2 +
    Math.max(Math.min(a, turns - closed) - closed, 0) * pitch +
    Math.max(a - turns + closed, 0) * wire * 2;
  const vertices: Vec3[] = [];
  const faces: number[][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * turns;
    const [c, s] = [Math.cos(a * Math.PI * 2), Math.sin(a * Math.PI * 2)];
    for (let j = 0; j < sides; j++) {
      const t = (j / sides) * Math.PI * 2;
      const r = radius - wire + Math.cos(t) * wire;
      vertices.push([c * r, s * r, rise(a) + Math.sin(t) * wire]);
    }
    if (i < steps)
      for (let j = 0; j < sides; j++) {
        const k = i * sides;
        const next = (j + 1) % sides;
        faces.push([k + j, k + next, k + sides + next, k + sides + j]);
      }
  }
  solid(bpy, "SpringCoils", vertices, faces, steel, {
    parent: root,
    smooth: true,
  });
  return root;
}
