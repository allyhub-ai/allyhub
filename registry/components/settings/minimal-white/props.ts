// The minimal white desk's props, placed in a 3.6 × 2.82 m room painted white. Blender's axes (Z up): a
// world point (x, y, z) is (x, -z, y) here. The person sits at the origin facing the desk at +y; the
// desk's wall is at y = 1.02 (the desk's back edge 2 cm off it), the wall behind them at -1.8.
//
// Laid out as popular minimal white setups show them (archetype E of docs/design/desk-settings.md):
// - the work zone: a white 1.6 × 0.7 m desk against a light wall, its front edge 0.3 m from the person; a
//   grey felt mat centred on it, a 27-inch aluminium monitor centred behind it with a phone docked on a stand
//   at its foot, a white Magic Keyboard centred and a white trackpad, a closed laptop upright in a stand at the
//   far left, a low walnut drawer unit at the back right with a warm strip under it, a book on it, a metal
//   spring toy and a plant; the wood, the felt and the warm light are the contrast to the white;
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
import { deskMat, mug, phoneStand, trackpad } from "../../kit/desk-items.ts";
import { keyboard, KEYBOARD_PRESETS } from "../../kit/keyboard.ts";
import { laptop, LAPTOP_DEFAULTS } from "../../kit/laptop.ts";
import { monitor, MONITOR_PRESETS } from "../../kit/monitor.ts";
import {
  box,
  cylinder,
  deg,
  finish,
  group,
  lathe,
  mm,
} from "../../kit/parts.ts";
import { pictureFrame, rug } from "../../kit/wall.ts";

export const TOP = 0.74;
export const DESK_WALL = 1.02;
export const BACK_WALL = -1.8;
/** The desk's centre: a 1.6 × 0.7 m top against the wall, its front edge 0.3 m from the person. */
export const DESK_Y = 0.65;
/** The keyboard's centre: 0.15 m in from the desk's front edge. */
const KEYS_Y = 0.45;
/** The monitor's foot, centred, its face some 0.5 m from the desk's front edge. */
const MONITOR_Y = 0.86;
/** The plant's place on the desk (the scenery stands a scanned one there), back left, behind the laptop's stand. */
export const DESK_PLANT = { x: -0.5, y: 0.9 };
/** The walnut drawer unit at the back right: its centre and size (m). */
export const DRAWERS = { x: 0.52, y: 0.88, size: [0.44, 0.22, 0.13] as Vec3 };

export default defineModel((bpy, params) => {
  const look = params["look"];
  const late = look === "evening" || look === "night";
  // The demo version is the desk and its wall alone: what a camera close to the screen sees.
  const demo = params["version"] === "demo";
  const top = TOP;

  desk(bpy, [0, DESK_Y, 0], {
    top: [1.6, 0.7, DESK_DEFAULTS.top[2]],
    surface: { color: "#f5f4f1", roughness: 0.4 },
    frame: { color: "#f0f0ee", roughness: 0.45, metallic: 0.2 },
    handset: false,
  });
  // A grey wool felt mat, 900 × 400 × 4 mm, centred 5 cm in from the desk's front edge.
  deskMat(bpy, [0, KEYS_Y + 0.05, top], {
    size: [mm(900), mm(400), mm(4)],
    corner: mm(8),
    surface: { color: "#8d8b88", roughness: 1 },
  });
  // Apple Studio Display on its tilt- and height-adjustable stand, raised 100 mm of its 105, centred, its face
  // some 50 cm back; an iPhone docked on a stand at its foot, under the screen.
  monitor(bpy, [0, MONITOR_Y, top], {
    ...MONITOR_PRESETS.fiveK27,
    raise: 0.1,
    tilt: 3,
  });
  phoneStand(bpy, [0, MONITOR_Y - 0.16, top + mm(4)], {
    height: 0.07,
    tilt: 14,
    metal: { color: "#d6d7d9", roughness: 0.35, metallic: 0.85 },
  });
  // Apple Magic Keyboard centred 15 cm from the front edge, the Magic Trackpad to its right.
  keyboard(bpy, [0, KEYS_Y, top + mm(4)], KEYBOARD_PRESETS.lowProfile);
  trackpad(bpy, [0.25, KEYS_Y + 0.01, top + mm(4)]);
  // A closed laptop upright in a vertical stand at the far left, its hinge down, its side to the person.
  verticalLaptop(bpy, [-0.7, 0.74, top]);
  // The walnut drawer unit at the back right, a book on it; a warm strip under its lip (the scenery's light).
  drawerUnit(bpy, [DRAWERS.x, DRAWERS.y, top]);
  box(
    bpy,
    "DrawerBook",
    [mm(150), mm(215), mm(22)],
    finish(bpy, "BookCover", { color: "#e9e1d3", roughness: 0.8 }),
    {
      at: [DRAWERS.x + 0.08, DRAWERS.y - 0.01, top + DRAWERS.size[2] + mm(11)],
      rotation: [0, 0, deg(8)],
    },
  );
  slinky(bpy, [-0.36, KEYS_Y + 0.12, top + mm(4)]);
  if (late)
    mug(bpy, [-0.38, 0.42, top], {
      glaze: { color: "#f4f2ee", roughness: 0.25 },
    });

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
 * A closed laptop (the kit's MacBook Pro 14, silver) upright in a vertical stand (an aluminium block with a
 * slot, sized like Twelve South's BookArc), its hinge down, its long side along the desk's depth; `at` is the
 * stand's centre on the desk.
 */
function verticalLaptop(bpy: Bpy, at: Vec3): ModelObject {
  const root = group(bpy, "VerticalLaptop", at);
  const metal = finish(bpy, "LaptopStandMetal", {
    color: "#cfd0d2",
    roughness: 0.35,
    metallic: 0.85,
  });
  box(bpy, "LaptopStandBase", [mm(60), mm(150), mm(14)], metal, {
    parent: root,
    at: [0, 0, mm(7)],
    radius: mm(5),
  });
  const [, depth] = LAPTOP_DEFAULTS.base;
  const upright = group(bpy, "LaptopUpright", [0, 0, mm(8) + depth / 2], root);
  // Its width along the desk's depth, its depth up, its thickness across: x → y, y → z, z → x.
  upright.rotation_euler = [deg(90), 0, deg(90)];
  laptop(
    bpy,
    [0, 0, 0],
    { open: 0, body: { color: "#cfd0d2", roughness: 0.36, metallic: 0.85 } },
    upright,
  );
  return root;
}

/**
 * A low walnut drawer unit standing on the desk on four short legs, two drawers with small brass knobs; a
 * warm LED strip under its front lip lights the desk below it (the scenery's `drawer-strip`).
 */
function drawerUnit(bpy: Bpy, at: Vec3): ModelObject {
  const root = group(bpy, "DrawerUnit", at);
  const [w, d, h] = DRAWERS.size;
  const walnut = finish(bpy, "DrawerWalnut", {
    color: "#5b3b26",
    roughness: 0.55,
  });
  const brass = finish(bpy, "DrawerBrass", {
    color: "#c49a52",
    roughness: 0.3,
    metallic: 0.9,
  });
  const leg = mm(18);
  box(bpy, "DrawerUnitBody", [w, d, h - leg], walnut, {
    parent: root,
    at: [0, 0, leg + (h - leg) / 2],
    radius: mm(3),
  });
  for (const x of [-1, 1])
    for (const y of [-1, 1])
      box(
        bpy,
        `DrawerUnitLeg${String(x)}${String(y)}`,
        [mm(20), mm(20), leg],
        walnut,
        {
          parent: root,
          at: [x * (w / 2 - mm(25)), y * (d / 2 - mm(25)), leg / 2],
        },
      );
  for (const i of [0, 1]) {
    const x = (i - 0.5) * (w / 2);
    box(
      bpy,
      `DrawerFront${String(i)}`,
      [w / 2 - mm(8), mm(3), h - leg - mm(14)],
      walnut,
      {
        parent: root,
        at: [x, -d / 2 - mm(1), leg + (h - leg) / 2],
        radius: mm(1),
      },
    );
    cylinder(bpy, `DrawerKnob${String(i)}`, mm(7), mm(14), brass, {
      parent: root,
      at: [x, -d / 2 - mm(9), leg + (h - leg) / 2],
      rotation: [deg(90), 0, 0],
      segments: 24,
    });
  }
  return root;
}

/**
 * A metal spring toy at rest on its end: 60 coils of flat steel ribbon 3 mm wide, 68 mm across and 54 mm tall,
 * a hollow ribbed tube (the coils' edges as grooves round it, inside and out).
 */
function slinky(bpy: Bpy, at: Vec3): ModelObject {
  const root = group(bpy, "SpringToy", at);
  const steel = finish(bpy, "SpringSteel", {
    color: "#c8cacd",
    roughness: 0.25,
    metallic: 1,
  });
  const coils = 60;
  const pitch = mm(0.9);
  const [outer, inner, groove] = [mm(34), mm(31), mm(0.35)];
  const profile: [number, number][] = [];
  for (let i = 0; i <= coils * 2; i++)
    profile.push([i % 2 === 0 ? outer - groove : outer, (i * pitch) / 2]);
  for (let i = coils * 2; i >= 0; i--)
    profile.push([i % 2 === 0 ? inner + groove : inner, (i * pitch) / 2]);
  profile.push([outer - groove, 0]);
  lathe(bpy, "SpringCoils", profile, steel, { parent: root, steps: 72 });
  return root;
}
