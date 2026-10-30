// The home desk's props, placed in a 3.6 × 2.9 m room. Blender's axes (Z up): a
// world point (x, y, z) is (x, -z, y) here. The person sits at the origin facing
// the desk at +y; the desk's wall is at y = 1.1, the wall behind them at -1.8.
//
// Laid out as popular demo videos show it and the most watched home-desk
// demo videos' frames:
// - the work zone: the desk against the wall, its front edge 0.35 m from the person,
//   the monitor with a light bar, a 65% mechanical keyboard centred under it, a clock
//   and a small figure (archetype A of docs/design/desk-settings.md);
//   the wall behind the monitor (a demo's background) with a print, a small shelf,
//   and the light bar's glow;
// - the backdrop behind the person (a talking head's background): a cube shelf with
//   a lamp on it, and stacked floating shelves of collectibles, plants and books.
// `look` is "day" or "night": the same room, its accents and what glows.
import { defineModel, type Bpy, type Vec3 } from "@allyhub-next/model";
import { micArm } from "../../kit/audio.ts";
import { chair } from "../../kit/chair.ts";
import { desk, DESK_DEFAULTS } from "../../kit/desk.ts";
import {
  deskClock,
  figurine,
  globeLamp,
  lightBar,
  plush,
} from "../../kit/desk-items.ts";
import { keyboard, KEYBOARD_PRESETS } from "../../kit/keyboard.ts";
import { monitor } from "../../kit/monitor.ts";
import { deg, mm } from "../../kit/parts.ts";
import {
  cubeShelf,
  cubeShelfCells,
  door,
  floatingShelf,
  pictureFrame,
  rug,
  storageBin,
} from "../../kit/wall.ts";

export const TOP = 0.74;
export const DESK_WALL = 1.1;
export const BACK_WALL = -1.8;
/** The desk's centre: a 1.6 × 0.8 m top against the wall, its front edge 0.3 m from the person. */
export const DESK_Y = 0.7;
/** The keyboard's centre: 0.2 m in from the desk's front edge, a clock's depth in front of the monitor's foot. */
export const KEYS_Y = DESK_Y - 0.2;
/** The speaker's mouth, seated: where the microphone points. */
export const MOUTH: Vec3 = [0, 0.08, 1.15];

/** The floating shelves behind the person: their x, width and the heights of their tops (m). */
export const BACK_SHELVES = {
  x: 0.82,
  width: 0.9,
  depth: 0.24,
  tops: [1.24, 1.58, 1.92],
};
/** The cube shelf behind the person, on its left (world -x). */
export const CUBE = { x: -0.95, gap: 0.015, columns: 2, rows: 4 };
/** The small shelf on the desk's wall, beside the monitor. */
export const DESK_SHELF = { x: 0.62, width: 0.6, depth: 0.2, top: 1.5 };

export default defineModel((bpy, params) => {
  const night = params["look"] === "night";
  const evening = params["look"] === "evening";
  // The demo version is the desk and its wall alone: what a camera close to the screen sees.
  const demo = params["version"] === "demo";
  const top = TOP;

  // The work zone.
  desk(bpy, [0, DESK_Y, 0], {
    top: [1.6, 0.8, DESK_DEFAULTS.top[2]],
    ...(night ? { surface: { color: "#4a3426", roughness: 0.5 } } : {}),
  });
  // Archetype A of docs/design/desk-settings.md: the keyboard straight on the oak, centred under the monitor,
  // no mouse and no laptop; a clock between them, a small figure to the left, a plant at the back right.
  // The monitor centred, its face some 45 cm from the desk's front edge, its light bar on top.
  monitor(bpy, [0, DESK_Y + 0.07, top], {
    raise: 0,
    tilt: 3,
    bar: { glow: night ? 2400 : evening ? 1200 : 0 },
  });
  keyboard(bpy, [0, KEYS_Y, top], {
    ...KEYBOARD_PRESETS.retro,
    ...(night
      ? {
          case: { color: "#1e1f22", roughness: 0.5, metallic: 0.6 },
          keys: { color: "#2b2d31", roughness: 0.55 },
          mods: null,
          accent: { color: "#8a6cff", roughness: 0.55 },
          legends: "light" as const,
        }
      : {}),
  });
  deskClock(bpy, [-0.15, KEYS_Y + 0.13, top]);
  figurine(
    bpy,
    [-0.27, KEYS_Y + 0.03, top],
    { height: 0.11, body: "#f07c4c", head: "#f5ebdf", turn: 20 },
    undefined,
    "DeskFigure",
  );
  // The light bar behind the monitor washes the wall: warm by day, violet at night.
  lightBar(bpy, [0.16, DESK_Y + 0.3, top], {
    color: night ? "#7b4dff" : "#ffb36b",
    glow: night ? 2600 : evening ? 1400 : 600,
  });

  // The microphone on its arm, clamped to the desk's back left (clear of the demo's view over the right
  // shoulder), 15 cm in front of the mouth, to its side and below it.
  if (demo) {
    deskArt(bpy);
    return;
  }
  const clamp: Vec3 = [-0.64, DESK_Y + 0.315, top];
  const mic: Vec3 = [-0.17, 0.25, 1.08];
  const toMouth: Vec3 = [
    MOUTH[0] - mic[0],
    MOUTH[1] - mic[1],
    MOUTH[2] - mic[2],
  ];
  const yaw = (Math.atan2(-toMouth[0], -toMouth[1]) * 180) / Math.PI;
  const pitch =
    -(Math.atan2(toMouth[2], Math.hypot(toMouth[0], toMouth[1])) * 180) /
    Math.PI;
  micArm(bpy, clamp, {
    target: [mic[0] - clamp[0], mic[1] - clamp[1], mic[2] - clamp[2]],
    aim: [-yaw, pitch],
  });

  // The chair, turned to face the desk, on a rug.
  const seat = chair(bpy, [0, -0.07, mm(8)]);
  seat.rotation_euler = [0, 0, Math.PI];
  rug(bpy, [0, -0.38, 0], {
    size: [2.0, 1.4],
    weave: night
      ? { color: "#3a3640", roughness: 1 }
      : { color: "#d9d3c7", roughness: 1 },
  });

  deskArt(bpy);

  // The backdrop: the cube shelf on the left, standing off the wall clear of the skirting.
  const wallY = BACK_WALL + CUBE.gap;
  const shelf = cubeShelf(bpy, [CUBE.x, wallY, 0], {
    columns: CUBE.columns,
    rows: CUBE.rows,
    surface: night
      ? { color: "#2b2420", roughness: 0.5 }
      : { color: "#f1f0ec", roughness: 0.5 },
  });
  shelf.rotation_euler = [0, 0, Math.PI];
  // Bins in its bottom row; the shelf is turned to face the room, so a cell's place turns with it.
  const cells = cubeShelfCells({ columns: CUBE.columns, rows: CUBE.rows });
  cells.slice(0, 2).forEach(([cx, cy, cz], i) => {
    const bin = storageBin(
      bpy,
      [CUBE.x - cx, wallY - cy, cz],
      {
        fabric:
          i === 0
            ? { color: "#b9b2a6", roughness: 0.95 }
            : { color: "#6f7b73", roughness: 0.95 },
      },
      undefined,
      `StorageBin${String(i + 1)}`,
    );
    bin.rotation_euler = [0, 0, Math.PI];
  });
  // A plush in its top right cube.
  const corner = cells[cells.length - 2];
  if (corner)
    plush(
      bpy,
      [CUBE.x - corner[0], wallY - corner[1] + 0.02, corner[2]],
      { height: 0.2, color: "#d8b28c", turn: 180 },
      undefined,
      "ShelfPlush",
    );
  globeLamp(bpy, [CUBE.x + 0.16, wallY + 0.2, 1.4675], {
    glow: night ? 900 : 300,
  });

  // Stacked floating shelves on the right: collectibles, a plant, books (the scenery adds the scanned ones).
  BACK_SHELVES.tops.forEach((t, i) => {
    const board = floatingShelf(bpy, [BACK_SHELVES.x, BACK_WALL, t - mm(38)], {
      size: [BACK_SHELVES.width, BACK_SHELVES.depth, mm(38)],
      surface: night
        ? { color: "#2b2420", roughness: 0.5 }
        : { color: "#d9c3a5", roughness: 0.55 },
    });
    board.rotation_euler = [0, 0, Math.PI];
    board.location = [
      BACK_SHELVES.x,
      BACK_WALL + BACK_SHELVES.depth / 2,
      t - mm(19),
    ];
    void i;
  });
  const onShelf = (x: number, row: number): Vec3 => [
    BACK_SHELVES.x + x,
    BACK_WALL + BACK_SHELVES.depth / 2,
    BACK_SHELVES.tops[row] ?? 0,
  ];
  figurine(
    bpy,
    onShelf(-0.3, 2),
    { height: 0.13, body: "#5a7cf0", head: "#f6efe6", turn: 170 },
    undefined,
    "ShelfFigure1",
  );
  figurine(
    bpy,
    onShelf(-0.16, 2),
    { height: 0.1, body: "#f0c24c", head: "#f4e9dc", turn: 195 },
    undefined,
    "ShelfFigure2",
  );
  plush(
    bpy,
    onShelf(0.28, 1),
    { height: 0.16, color: "#f1d4dc", turn: 200 },
    undefined,
    "ShelfPlush2",
  );
  figurine(
    bpy,
    onShelf(-0.32, 0),
    { height: 0.12, body: "#3fb58a", head: "#f6efe6", turn: 180 },
    undefined,
    "ShelfFigure3",
  );

  // The door, in the right wall near the back corner (out of the main shots).
  const entry = door(bpy, [1.8, -0.85, 0]);
  entry.rotation_euler = [0, 0, -Math.PI / 2];
});

/** The desk's wall: a print to the monitor's left, a small shelf to its right. */
function deskArt(bpy: Bpy): void {
  pictureFrame(
    bpy,
    [-0.66, DESK_WALL, 1.62],
    { size: [mm(520), mm(720), mm(30)], mount: mm(65) },
    undefined,
    "DeskArt",
  );
  floatingShelf(bpy, [DESK_SHELF.x, DESK_WALL, DESK_SHELF.top - mm(38)], {
    size: [DESK_SHELF.width, DESK_SHELF.depth, mm(38)],
    surface: { color: "#d9c3a5", roughness: 0.55 },
  });
}
