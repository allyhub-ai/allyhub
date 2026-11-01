// The bedroom desk's props: a small pink desk in the corner of a 3.5 × 2.92 m bedroom, by its window.
// Blender's axes (Z up): a world point (x, y, z) is (x, -z, y) here. The person sits at the origin
// facing the desk at +y; the desk's wall is at y = 0.92, the window's wall at x = 1.05 (on the right:
// the scenery turns the room's shell round), the wall behind the person at y = -2.0.
//
// A warm pink desk for a demo on a laptop:
// - the work zone: a 1.2 × 0.6 m pale pink desk against the wall, its front edge 0.3 m from the person and
//   its right end 35 cm from the window's wall, clear of the sill; a silver 14-inch laptop centred on it, a warm globe lamp at the
//   back left; on the wall a framed print of Monet's Water Lilies;
// - the room behind the person (the room version only): a double bed with white bedding, its head against
//   the back wall, to the person's left, a nightstand beside it, and the desk chair on a rug.
// `look` is "day", "overcast", "evening" or "night": the lamp glows at every hour, brighter as it darkens.
import {
  defineModel,
  type Bpy,
  type ModelObject,
  type Vec3,
} from "@allyhub-next/model";
import { chair } from "../../kit/chair.ts";
import { desk, DESK_DEFAULTS } from "../../kit/desk.ts";
import { globeLamp } from "../../kit/desk-items.ts";
import { laptop, LAPTOP_PRESETS } from "../../kit/laptop.ts";
import {
  box,
  deg,
  finish,
  group,
  mm,
  slab,
  type Finish,
} from "../../kit/parts.ts";
import { pictureFrame, rug } from "../../kit/wall.ts";

export const TOP = 0.74;
/** The desk's wall (its back edge 2 cm off it), the wall behind the person, and the window's wall. */
export const DESK_WALL = 0.92;
export const BACK_WALL = -2.0;
export const WINDOW_WALL = 1.05;
/** The desk: a 1.2 × 0.6 m top, its front edge 0.3 m from the person, its right end 35 cm off the window's wall. */
export const DESK = { x: 0.1, y: 0.6, width: 1.2, depth: 0.6 };
/** The laptop's centre: 0.26 m in from the desk's front edge. */
const LAPTOP_Y = 0.56;
/** The bed: a double (1.4 × 2.0 m mattress), its head against the wall behind the person, on their right. */
export const BED = { x: -1.55, width: 1.4, length: 2.0, mattress: 0.52 };
/** The nightstand, between the bed and the desk's corner. */
export const NIGHTSTAND = { x: -0.58, y: BACK_WALL + 0.22, top: 0.55 };

/** The desk's top, a warm pale pink. */
const WHITE_TOP: Finish = { color: "#f3c7b8", roughness: 0.45 };
const WHITE_FRAME: Finish = { color: "#ecebe8", roughness: 0.5, metallic: 0.2 };

export default defineModel((bpy, params) => {
  const look = params["look"];
  const night = look === "night";
  // The demo version is the desk and its wall alone: what a camera close to the screen sees.
  const demo = params["version"] === "demo";
  const top = TOP;

  desk(bpy, [DESK.x, DESK.y, 0], {
    top: [DESK.width, DESK.depth, DESK_DEFAULTS.top[2]],
    inset: 0.12,
    surface: WHITE_TOP,
    frame: WHITE_FRAME,
    handset: false,
  });
  // A demo on a laptop: a silver 14-inch MacBook Pro centred on the desk, nothing but the lamp beside it, and a
  // framed Water Lilies on the wall.
  laptop(bpy, [0, LAPTOP_Y, top], LAPTOP_PRESETS.silver);
  globeLamp(bpy, [-0.3, 0.76, top], {
    diameter: mm(200),
    height: mm(210),
    glow: night ? 900 : look === "evening" ? 600 : 300,
    color: "#ffcf94",
  });

  // Over the desk, a framed print of Monet's Water Lilies (1906; the scenery hangs the picture).
  pictureFrame(
    bpy,
    [0.05, DESK_WALL, 1.42],
    {
      size: [mm(760), mm(736), mm(30)],
      moulding: mm(20),
      mount: mm(60),
      frame: { color: "#c9a77c", roughness: 0.55 },
    },
    undefined,
    "Painting",
  );
  if (demo) return;

  // The chair, turned to face the desk, and the bed behind the person.
  const seat = chair(bpy, [0, -0.07, mm(8)]);
  seat.rotation_euler = [0, 0, Math.PI];
  bed(bpy, [BED.x, BACK_WALL, 0], night);
  nightstand(bpy, [NIGHTSTAND.x, NIGHTSTAND.y, 0]);
  rug(bpy, [0, -0.3, 0], {
    size: [1.4, 1.0],
    weave: { color: "#e3dccf", roughness: 1 },
  });
});

/**
 * A double bed, its head against the wall at y = `at[1]`, centred on x = `at[0]`, its foot towards +y: an
 * upholstered headboard, a low oak frame on legs, a 1.4 × 2.0 m mattress under a white duvet folded back at
 * the head, two white pillows and a linen throw across the foot. `night`: the duvet turned down further.
 */
function bed(bpy: Bpy, at: Vec3, night: boolean): ModelObject {
  const root = group(bpy, "Bed", at);
  const w = BED.width;
  const l = BED.length;
  const frameW = w + mm(60);
  const frameL = l + mm(50);
  const oak = finish(bpy, "BedFrame", { color: "#d2b48f", roughness: 0.55 });
  const linen = finish(bpy, "BedLinen", { color: "#f6f4ef", roughness: 0.95 });
  // The headboard, upholstered in a warm grey linen, 1.05 m tall.
  slab(
    bpy,
    "BedHeadboard",
    [frameW + mm(40), mm(80), 1.05],
    mm(30),
    finish(bpy, "BedHeadboard", { color: "#cfc7bb", roughness: 0.95 }),
    { parent: root, at: [0, mm(40), 0] },
  );
  // The frame's rails, 0.2 m deep, on four legs.
  const railTop = 0.32;
  box(bpy, "BedRails", [frameW, frameL, 0.2], oak, {
    parent: root,
    at: [0, mm(80) + frameL / 2, railTop - 0.1],
    radius: mm(6),
    segments: 3,
  });
  for (const [sx, sy] of [
    [-1, 0],
    [1, 0],
    [-1, 1],
    [1, 1],
  ] as const)
    box(
      bpy,
      `BedLeg.${sx > 0 ? "R" : "L"}${sy > 0 ? "F" : "B"}`,
      [mm(50), mm(50), railTop - 0.2],
      oak,
      {
        parent: root,
        at: [
          sx * (frameW / 2 - mm(40)),
          mm(80) + mm(40) + sy * (frameL - mm(80)),
          (railTop - 0.2) / 2,
        ],
      },
    );
  // The mattress, 0.22 m thick, sitting in the frame.
  const mattressTop = BED.mattress;
  box(
    bpy,
    "BedMattress",
    [w, l, 0.22],
    finish(bpy, "BedMattress", { color: "#f1efe9", roughness: 0.9 }),
    {
      parent: root,
      at: [0, mm(105) + l / 2, mattressTop - 0.11],
      radius: mm(40),
      segments: 4,
    },
  );
  // The duvet over the mattress, its sides hanging, folded back below the pillows.
  const fold = night ? 0.75 : 0.5;
  box(bpy, "BedDuvet", [w + mm(120), l - fold, mm(70)], linen, {
    parent: root,
    at: [0, mm(105) + fold + (l - fold) / 2, mattressTop + mm(30)],
    radius: mm(30),
    segments: 4,
  });
  box(bpy, "BedDuvetFold", [w + mm(120), mm(260), mm(40)], linen, {
    parent: root,
    at: [0, mm(105) + fold + mm(130), mattressTop + mm(80)],
    radius: mm(18),
    segments: 3,
  });
  for (const side of [-1, 1] as const)
    box(
      bpy,
      `BedPillow.${side > 0 ? "R" : "L"}`,
      [mm(640), mm(420), mm(140)],
      linen,
      {
        parent: root,
        at: [side * mm(345), mm(105) + mm(240), mattressTop + mm(60)],
        radius: mm(60),
        segments: 4,
      },
    );
  // A linen throw across the foot.
  box(
    bpy,
    "BedThrow",
    [w + mm(160), mm(500), mm(20)],
    finish(bpy, "BedThrow", { color: "#c8b79e", roughness: 0.98 }),
    {
      parent: root,
      at: [0, mm(105) + l - mm(300), mattressTop + mm(75)],
      radius: mm(8),
      segments: 2,
    },
  );
  return root;
}

/** A nightstand, 0.45 × 0.38 m and 0.55 m tall, a drawer in its front (towards +y), its back on the wall. */
function nightstand(bpy: Bpy, at: Vec3): ModelObject {
  const root = group(bpy, "Nightstand", at);
  const oak = finish(bpy, "BedFrame", { color: "#d2b48f", roughness: 0.55 });
  const [w, d, h] = [0.45, 0.38, NIGHTSTAND.top];
  box(bpy, "NightstandBody", [w, d, h - 0.1], oak, {
    parent: root,
    at: [0, 0, 0.1 + (h - 0.1) / 2],
    radius: mm(4),
    segments: 2,
  });
  for (const [sx, sy] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ] as const)
    box(
      bpy,
      `NightstandLeg.${sx > 0 ? "R" : "L"}${sy > 0 ? "F" : "B"}`,
      [mm(30), mm(30), 0.1],
      oak,
      {
        parent: root,
        at: [sx * (w / 2 - mm(30)), sy * (d / 2 - mm(30)), 0.05],
      },
    );
  box(
    bpy,
    "NightstandDrawer",
    [w - mm(40), mm(4), mm(160)],
    finish(bpy, "NightstandDrawer", { color: "#f2efe8", roughness: 0.5 }),
    { parent: root, at: [0, d / 2 + mm(2), h - mm(110)], radius: mm(2) },
  );
  return root;
}
