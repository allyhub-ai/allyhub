// The bedroom desk's props: a small pink desk in the corner of a 3.2 × 2.92 m bedroom, by its window.
// Blender's axes (Z up): a world point (x, y, z) is (x, -z, y) here. The person sits at the origin
// facing the desk at +y; the desk's wall is at y = 0.92, the window's wall at x = 0.75 (on the right:
// the scenery turns the room's shell round), the wall behind the person at y = -2.0.
//
// Laid out as popular pastel tablet desks show them (archetype C of docs/design/desk-settings.md):
// - the work zone: a 1.2 × 0.6 m pale pink desk against the wall, its front edge 0.3 m from the person and
//   its right end 5 cm from the window's wall; an 11-inch tablet upright in portrait on a small stand on a
//   round rattan placemat at the middle, its pencil beside it, a warm globe lamp at the back left; on the
//   wall a framed print of Monet's Water Lilies;
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
import {
  tablet,
  TABLET_DEFAULTS,
  TABLET_PRESETS,
  TABLET_STYLUS,
  stylus,
} from "../../kit/tablet.ts";
import {
  box,
  cylinder,
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
export const WINDOW_WALL = 0.75;
/** The desk: a 1.2 × 0.6 m top, its front edge 0.3 m from the person, its right end 5 cm off the window's wall. */
export const DESK = { x: 0.1, y: 0.6, width: 1.2, depth: 0.6 };
/** The placemat's centre: 0.24 m in from the desk's front edge, where the tablet lies. */
export const PAD_Y = 0.54;
/** The bed: a double (1.4 × 2.0 m mattress), its head against the wall behind the person, on their right. */
export const BED = { x: -1.55, width: 1.4, length: 2.0, mattress: 0.52 };
/** The nightstand, between the bed and the desk's corner. */
export const NIGHTSTAND = { x: -0.58, y: BACK_WALL + 0.22, top: 0.55 };

/** The desk's top, pale pink as the pastel desks of tablet videos are. */
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
  // Archetype C of docs/design/desk-settings.md, made for a demo: the tablet upright in portrait on a small
  // aluminium stand on a round rattan placemat at the middle, its pencil beside it; the lamp at the back left;
  // a framed Water Lilies on the wall.
  placemat(bpy, [0, PAD_Y, top]);
  standingTablet(bpy, [0, PAD_Y - 0.03, top + mm(6)]);
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

/** How far the stand leans the tablet back from upright (degrees). */
const LEAN = 15;

/**
 * An 11-inch tablet upright in portrait on a folding aluminium desk stand (sized like Lamicall's: a 100 ×
 * 120 mm base, a ledge with a lip the tablet's edge rests in, a back plate it leans on at `LEAN`), standing at
 * `at` (the ledge's front, on the surface), with its pencil lying beside the stand. The display is
 * `TabletScreen`, its picture's top the tablet's top.
 */
function standingTablet(bpy: Bpy, at: Vec3): ModelObject {
  const root = group(bpy, "TabletStand", at);
  const metal = finish(bpy, "StandAluminium", {
    color: "#c9c4c2",
    roughness: 0.35,
    metallic: 0.8,
  });
  const pad = finish(bpy, "StandPad", { color: "#2b2b2d", roughness: 0.9 });
  const up = deg(90 - LEAN);
  // Where the tablet's back edge meets the ledge, and the way up its back.
  const ledge = mm(12);
  const dir: Vec3 = [0, Math.cos(up), Math.sin(up)];
  const back: Vec3 = [0, Math.sin(up), -Math.cos(up)];
  box(bpy, "TabletStandBase", [mm(100), mm(120), mm(5)], metal, {
    parent: root,
    at: [0, mm(50), mm(2.5)],
    radius: mm(2),
  });
  box(bpy, "TabletStandLedge", [mm(90), mm(16), ledge - mm(5)], metal, {
    parent: root,
    at: [0, -mm(2), mm(5) + (ledge - mm(5)) / 2],
    radius: mm(1),
  });
  box(bpy, "TabletStandLip", [mm(90), mm(3), mm(9)], metal, {
    parent: root,
    at: [0, -mm(10), ledge + mm(3)],
    radius: mm(1),
  });
  box(bpy, "TabletStandPad", [mm(80), mm(1), mm(60)], pad, {
    parent: root,
    at: [
      0,
      dir[1] * mm(140) + back[1] * mm(1),
      ledge + dir[2] * mm(140) + back[2] * mm(1),
    ],
    rotation: [deg(-LEAN), 0, 0],
  });
  box(bpy, "TabletStandPlate", [mm(80), mm(4), mm(170)], metal, {
    parent: root,
    at: [
      0,
      dir[1] * mm(85) + back[1] * mm(3.5),
      ledge + dir[2] * mm(85) + back[2] * mm(3.5),
    ],
    rotation: [deg(-LEAN), 0, 0],
    radius: mm(1.5),
  });
  // The tablet: its back on the plate's pad, its bottom edge on the ledge, in portrait.
  const [w] = TABLET_DEFAULTS.body;
  const lean = group(
    bpy,
    "TabletLean",
    [0, dir[1] * (w / 2), ledge + dir[2] * (w / 2)],
    root,
  );
  lean.rotation_euler = [up, 0, 0];
  const pad3 = group(bpy, "TabletPortrait", [0, 0, 0], lean);
  pad3.rotation_euler = [0, 0, deg(90)];
  tablet(bpy, [0, 0, 0], { ...TABLET_PRESETS.silver }, pad3);
  // The pencil on the mat, beside the stand, turned a little.
  const lying = group(bpy, "PencilLying", [mm(120), -mm(20), 0], root);
  lying.rotation_euler = [0, 0, deg(25)];
  stylus(bpy, TABLET_STYLUS, [0, 0, 0], lying);
  return root;
}

/**
 * A round coiled rattan placemat, 35 cm across and 6 mm thick, its edge rounded; its weave is a picture the
 * scenery lays on its top (`PlacematTop`).
 */
function placemat(bpy: Bpy, at: Vec3): ModelObject {
  const root = group(bpy, "Placemat", at);
  const cane = finish(bpy, "Rattan", { color: "#d6b783", roughness: 0.85 });
  cylinder(bpy, "PlacematTop", mm(175), mm(6), cane, {
    parent: root,
    at: [0, 0, mm(3.5)],
    segments: 96,
    radius: mm(2.5),
  });
  return root;
}

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
