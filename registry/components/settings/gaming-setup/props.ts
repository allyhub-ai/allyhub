// The gaming setup's props, placed in a 3.6 × 2.9 m room painted dark. Blender's axes (Z up): a world
// point (x, y, z) is (x, -z, y) here. The person sits at the origin facing the desk at +y; the desk's
// wall is at y = 1.15 (the desk stands 5 cm off it, so the strip on its back edge washes the wall), the
// wall behind them at -1.8.
//
// Laid out as popular gaming-setup demo videos show it:
// - the work zone: a black 1.6 × 0.8 m desk against the wall, its front edge 0.3 m from the person; a
//   27-inch monitor low behind a dark mechanical keyboard on a large black mat, a laptop to the right, a
//   PC tower with a glass side and lit fans on the desk's back left corner, its glass towards the monitor;
//   an RGB LED strip along the desk's back edge washing the wall, and two floating shelves on the wall,
//   one each side of the monitor, with an LED strip under each and collectibles on them;
// - behind the person (the room version only): a wood slat panel, the chair on a dark rug.
// The keyboard and the monitor stand where the home desk has them (the keyboard's centre at x -0.05,
// y 0.61; the monitor's foot 0.2 m behind it), so the demo cameras are the same.
// `look` is "day", "overcast", "evening" or "night": the strips' and fans' colours and how bright they glow.
import {
  defineModel,
  type Bpy,
  type ModelObject,
  type Vec3,
} from "@allyhub-next/model";
import { chair } from "../../kit/chair.ts";
import { desk, DESK_DEFAULTS } from "../../kit/desk.ts";
import { deskMat, figurine, mouse, mug } from "../../kit/desk-items.ts";
import { keyboard } from "../../kit/keyboard.ts";
import { LAPTOP_PRESETS, laptop } from "../../kit/laptop.ts";
import { monitor } from "../../kit/monitor.ts";
import {
  box,
  cylinder,
  deg,
  finish,
  group,
  mm,
  type Finish,
} from "../../kit/parts.ts";
import { floatingShelf, rug, slatPanel } from "../../kit/wall.ts";

export const TOP = 0.74;
export const DESK_WALL = 1.15;
export const BACK_WALL = -1.8;
/** The desk's centre: a 1.6 × 0.8 m top against the wall, its front edge 0.3 m from the person. */
export const DESK_Y = 0.7;
/** The keyboard's centre: as on the home desk, 0.31 m in from the desk's front edge. */
const KEYS_Y = 0.61;
/** The shelves on the desk's wall, one each side of the monitor: their x, width, depth and the height of their tops. */
export const WALL_SHELVES = {
  x: [-0.58, 0.58],
  width: 0.5,
  depth: 0.18,
  top: 1.45,
};
/** The PC tower on the desk's back left corner (NZXT H5 Flow: 227 × 446 × 464 mm). */
export const TOWER = { x: -0.66, y: 0.85, size: [0.227, 0.446, 0.464] as Vec3 };

/**
 * Each look's LED colours (sRGB) and glows (nits): off-white and low by day, coloured and bright at night; `keys`, the
 * keyboard's RGB backlight (nits), brighter as the room darkens.
 */
export const LEDS = {
  day: {
    desk: "#8a7dff",
    shelf: "#8a7dff",
    fans: "#a9c8ff",
    glow: 120,
    keys: 60,
  },
  overcast: {
    desk: "#8a7dff",
    shelf: "#8a7dff",
    fans: "#a9c8ff",
    glow: 160,
    keys: 70,
  },
  evening: {
    desk: "#7b4dff",
    shelf: "#ff4fd8",
    fans: "#7b4dff",
    glow: 1400,
    keys: 100,
  },
  night: {
    desk: "#ff2d95",
    shelf: "#2de2ff",
    fans: "#ff2d95",
    glow: 4000,
    keys: 120,
  },
} as const;
/** The keyboard's RGB wave, left to right. */
const KEY_RGB = [
  "#ff2a55",
  "#ff8a00",
  "#ffe600",
  "#2bff6a",
  "#00c8ff",
  "#7a3cff",
];
export type GamingLook = keyof typeof LEDS;

const BLACK_TOP: Finish = { color: "#141416", roughness: 0.55 };
const DARK: Finish = { color: "#1b1c1f", roughness: 0.45 };

export default defineModel((bpy, params) => {
  const look = String(params["look"]);
  const led = look in LEDS ? LEDS[look as GamingLook] : LEDS.day;
  // The demo version is the desk and its wall alone: what a camera close to the screen sees.
  const demo = params["version"] === "demo";
  const top = TOP;

  desk(bpy, [0, DESK_Y, 0], {
    top: [1.6, 0.8, DESK_DEFAULTS.top[2]],
    surface: BLACK_TOP,
    frame: { color: "#0f0f10", roughness: 0.5, metallic: 0.3 },
  });
  deskMat(bpy, [-0.07, KEYS_Y + 0.01, top], {
    size: [mm(800), mm(380), mm(4)],
    surface: { color: "#0f1012", roughness: 0.95 },
  });
  // The monitor close behind the keyboard and low, as popular demos set it: large over the keys.
  monitor(bpy, [0, KEYS_Y + 0.2, top], {
    raise: 0,
    tilt: 3,
    shell: { color: "#202124", roughness: 0.5 },
    stand: { color: "#2a2b2e", roughness: 0.4, metallic: 0.6 },
  });
  keyboard(bpy, [-0.05, KEYS_Y, top + mm(4)], {
    case: { color: "#141518", roughness: 0.45, metallic: 0.5 },
    keys: { color: "#222428", roughness: 0.55 },
    accent: { color: "#e2364f", roughness: 0.55 },
    legends: "light",
    backlight: { color: KEY_RGB, strength: led.keys },
  });
  mouse(bpy, [0.24, KEYS_Y, top + mm(4)], {
    shell: { color: "#18191b", roughness: 0.5 },
  });
  const lap = laptop(bpy, [0.525, DESK_Y - 0.04, top], LAPTOP_PRESETS.gaming);
  lap.rotation_euler = [0, 0, deg(-9)];
  mug(bpy, look === "night" ? [0.72, 0.44, top] : [-0.6, DESK_Y - 0.24, top], {
    glaze: { color: "#26272b", roughness: 0.3 },
  });
  pcTower(bpy, [TOWER.x, TOWER.y, top], led.fans, led.glow);

  // The RGB strip under the desk's back edge, facing the wall: what washes it.
  box(
    bpy,
    "DeskStripLed",
    [1.5, mm(2), mm(10)],
    finish(bpy, "LedStrip", {
      color: "#ffffff",
      roughness: 0.4,
      emission: { color: led.desk, strength: led.glow },
    }),
    { at: [0, DESK_Y + 0.4 - mm(4), top - DESK_DEFAULTS.top[2] - mm(6)] },
  );

  // The shelves each side of the monitor, an LED strip under each one's front edge.
  WALL_SHELVES.x.forEach((x, i) => {
    floatingShelf(bpy, [x, DESK_WALL, WALL_SHELVES.top - mm(30)], {
      size: [WALL_SHELVES.width, WALL_SHELVES.depth, mm(30)],
      surface: DARK,
    });
    box(
      bpy,
      `ShelfStripLed${String(i + 1)}`,
      [WALL_SHELVES.width - 0.04, mm(10), mm(2)],
      finish(bpy, "LedStripShelf", {
        color: "#ffffff",
        roughness: 0.4,
        emission: { color: led.shelf, strength: led.glow },
      }),
      {
        at: [
          x,
          DESK_WALL - WALL_SHELVES.depth + mm(20),
          WALL_SHELVES.top - mm(31),
        ],
      },
    );
  });
  const onShelf = (i: number, dx: number): Vec3 => [
    (WALL_SHELVES.x[i] ?? 0) + dx,
    DESK_WALL - WALL_SHELVES.depth / 2,
    WALL_SHELVES.top,
  ];
  figurine(
    bpy,
    onShelf(0, -0.12),
    { height: 0.14, body: "#e2364f", head: "#f2ece4", turn: 10 },
    undefined,
    "ShelfFigure1",
  );
  figurine(
    bpy,
    onShelf(0, 0.06),
    { height: 0.11, body: "#2de2ff", head: "#1c1c1e", turn: -15 },
    undefined,
    "ShelfFigure2",
  );
  figurine(
    bpy,
    onShelf(1, 0.14),
    { height: 0.13, body: "#7b4dff", head: "#f2ece4", turn: -20 },
    undefined,
    "ShelfFigure3",
  );

  if (demo) return;

  // Behind the person: a wood slat panel on the wall, the chair on a dark rug.
  const panel = slatPanel(bpy, [0.75, BACK_WALL, 0], {
    size: [1.2, 2.4],
    wood: { color: "#5a4433", roughness: 0.6 },
  });
  panel.rotation_euler = [0, 0, Math.PI];
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
 * A mid-tower PC case standing on its foot (NZXT H5 Flow: 227 × 446 × 464 mm), its front towards -y and its
 * tempered glass side towards +x, three lit fans seen through the glass: `color` and `glow` (nits) light them.
 */
export function pcTower(
  bpy: Bpy,
  at: Vec3,
  color: string,
  glow: number,
): ModelObject {
  const [w, d, h] = TOWER.size;
  const root = group(bpy, "PcTower", at);
  const steel = finish(bpy, "PcTowerSteel", {
    color: "#121214",
    roughness: 0.5,
    metallic: 0.6,
  });
  // The case: steel with its glass side open, so what is inside shows.
  box(bpy, "PcTowerSide", [mm(4), d, h - mm(20)], steel, {
    parent: root,
    at: [-w / 2 + mm(2), 0, mm(20) + (h - mm(20)) / 2],
    radius: mm(2),
  });
  for (const [name, z] of [
    ["PcTowerTop", h - mm(6)],
    ["PcTowerBottom", mm(26)],
  ] as const)
    box(bpy, name, [w, d, mm(12)], steel, {
      parent: root,
      at: [0, 0, z],
      radius: mm(3),
      segments: 2,
    });
  box(bpy, "PcTowerFront", [w, mm(18), h - mm(20)], steel, {
    parent: root,
    at: [0, -d / 2 + mm(9), mm(20) + (h - mm(20)) / 2],
    radius: mm(4),
    segments: 2,
  });
  box(bpy, "PcTowerBack", [w, mm(6), h - mm(20)], steel, {
    parent: root,
    at: [0, d / 2 - mm(3), mm(20) + (h - mm(20)) / 2],
  });
  // Feet.
  for (const [sx, sy] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ] as const)
    box(
      bpy,
      `PcTowerFoot.${sx > 0 ? "R" : "L"}${sy > 0 ? "B" : "F"}`,
      [mm(30), mm(60), mm(20)],
      steel,
      {
        parent: root,
        at: [sx * (w / 2 - mm(25)), sy * (d / 2 - mm(50)), mm(10)],
      },
    );
  // Inside: the motherboard against the far side, a graphics card across it, a cooler.
  const board = finish(bpy, "PcTowerBoard", {
    color: "#1e2024",
    roughness: 0.6,
  });
  box(bpy, "PcTowerBoard", [mm(3), mm(244), mm(305)], board, {
    parent: root,
    at: [-w / 2 + mm(30), mm(40), h - mm(40) - mm(152)],
  });
  box(
    bpy,
    "PcTowerGpu",
    [mm(130), mm(300), mm(55)],
    finish(bpy, "PcTowerGpu", {
      color: "#2b2d31",
      roughness: 0.4,
      metallic: 0.5,
    }),
    {
      parent: root,
      at: [-w / 2 + mm(100), 0, mm(200)],
      radius: mm(4),
    },
  );
  cylinder(
    bpy,
    "PcTowerCooler",
    mm(36),
    mm(80),
    finish(bpy, "PcTowerCooler", {
      color: "#3a3c40",
      roughness: 0.35,
      metallic: 0.8,
    }),
    {
      parent: root,
      at: [-w / 2 + mm(72), mm(60), h - mm(130)],
      rotation: [0, Math.PI / 2, 0],
    },
  );
  // The glass side is left open (a pane would hide what is inside): only its black frame, round the opening.
  const rim = finish(bpy, "PcTowerRim", { color: "#0b0c0e", roughness: 0.3 });
  for (const [name, size, z] of [
    ["PcTowerRimTop", [mm(4), d, mm(14)], h - mm(19)],
    ["PcTowerRimBottom", [mm(4), d, mm(14)], mm(39)],
  ] as const)
    box(bpy, name, [...size], rim, { parent: root, at: [w / 2 - mm(2), 0, z] });
  // Three 120 mm fans behind the front panel, their rings lit, seen edge on through the open side; and an
  // LED strip along the opening's top and bottom.
  const fans = group(bpy, "PcTowerFans", [0, 0, 0], root);
  const lit = finish(bpy, "PcTowerFanGlow", {
    color: "#ffffff",
    roughness: 0.4,
    ...(glow > 0 ? { emission: { color, strength: glow } } : {}),
  });
  for (let i = 0; i < 3; i++)
    cylinder(bpy, `PcTowerFan${String(i + 1)}`, mm(58), mm(25), lit, {
      parent: fans,
      at: [0, -d / 2 + mm(30), mm(80) + i * mm(130)],
      rotation: [Math.PI / 2, 0, 0],
      segments: 32,
    });
  box(bpy, "PcTowerStrip", [mm(3), d - mm(60), mm(8)], lit, {
    parent: fans,
    at: [w / 2 - mm(8), mm(4), h - mm(30)],
  });
  box(bpy, "PcTowerStripLow", [mm(3), d - mm(60), mm(8)], lit, {
    parent: fans,
    at: [w / 2 - mm(8), mm(4), mm(40)],
  });
  return root;
}
