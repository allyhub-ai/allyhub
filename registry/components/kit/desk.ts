// A sit-stand desk: a top on a two-leg electric frame, after the FlexiSpot E7 (its
// height range 0.605 to 1.255 m with a 25 mm top, three-stage columns widest at the
// foot, feet that thin towards their ends, a side bracket under each end of the top
// that is deep over its column and thin at its ends, one beam between the columns'
// tops, and the keypad under the front edge). In popular demo videos, desks: median
// 1.4 × 0.7 m, the top at 0.74 m.
import type {
  Bpy,
  ModelMaterial,
  ModelObject,
  Vec3,
} from "@allyhub-next/model";
import { box, finish, group, mm, slab, solid, type Finish } from "./parts.ts";

export interface DeskOptions {
  /** The top: width, depth, thickness (m). */
  top: [number, number, number];
  /** The top's upper face above the floor (m): 0.60 to 1.25 on the reference frame. */
  height: number;
  /** The frame's lowest top height (m): where its upper stages are all inside the lowest. */
  lowest: number;
  /** Each leg's centre in from the top's side (m). */
  inset: number;
  /** The columns' stages, widest at the bottom: each its size along the top's depth, then across (m). */
  stages: [number, number][];
  /** How much of each upper stage shows with the desk at its lowest (m). */
  collar: number;
  /** A foot: length, width, its height at the column and at its ends (m). */
  foot: [number, number, number, number];
  /** The side brackets under the top: their width, their depth over the column and at their ends (m). */
  rail: [number, number, number];
  /** How far a side bracket stops short of the top's front and back edges (m). */
  railShort: number;
  /** The beam between the columns' tops: its width and height (m). */
  beam: [number, number];
  /** The top's surface: a scenery lays a texture on the material `DeskTop` (its UVs are in metres). */
  surface: Finish;
  frame: Finish;
  /** The keypad with the height buttons, under the front right corner. */
  handset: boolean;
  /** The keypad: width, depth, height (m), and its distance in from the top's right side (m). */
  keypad: [number, number, number, number];
}

export const DESK_DEFAULTS: DeskOptions = {
  top: [1.4, 0.7, mm(25)],
  height: 0.74,
  lowest: 0.605,
  inset: 0.16,
  stages: [
    [mm(90), mm(65)],
    [mm(80), mm(55)],
    [mm(70), mm(45)],
  ],
  collar: mm(35),
  foot: [mm(680), mm(75), mm(42), mm(18)],
  rail: [mm(50), mm(38), mm(8)],
  railShort: mm(50),
  beam: [mm(60), mm(40)],
  surface: { color: "#c49a6c", roughness: 0.55 },
  frame: { color: "#1b1b1c", roughness: 0.45 },
  handset: true,
  keypad: [mm(140), mm(55), mm(24), 0.22],
};

/** The desk under an empty at `at` (the floor under the top's centre), its front towards -y. */
export function desk(
  bpy: Bpy,
  at: Vec3,
  over: Partial<DeskOptions> = {},
  parent?: ModelObject,
): ModelObject {
  const o = { ...DESK_DEFAULTS, ...over };
  const [tw, td, tt] = o.top;
  const root = group(bpy, "Desk", at, parent);
  const metal = finish(bpy, "DeskFrame", o.frame);
  slab(bpy, "DeskTop", [tw, td, tt], mm(6), finish(bpy, "DeskTop", o.surface), {
    parent: root,
    at: [0, 0, o.height - tt],
    edge: mm(2),
    uv: true,
  });

  const underTop = o.height - tt;
  const [rw, rDeep, rThin] = o.rail;
  const [fl, fw, fh, fEnd] = o.foot;
  const legX = tw / 2 - o.inset;
  const half = td / 2 - o.railShort;
  const hub = mm(80);
  for (const side of [-1, 1] as const) {
    const s = side < 0 ? "L" : "R";
    const x = side * legX;
    // The side bracket: deep over the column, thinning to a flat plate at both ends.
    profileBar(
      bpy,
      `DeskRail.${s}`,
      [
        [-half, underTop],
        [half, underTop],
        [half, underTop - rThin],
        [hub, underTop - rDeep],
        [-hub, underTop - rDeep],
        [-half, underTop - rThin],
      ],
      rw,
      metal,
      { parent: root, at: [x, 0, 0], radius: mm(2) },
    );
    // The foot: deepest under the column, its top falling to its ends.
    profileBar(
      bpy,
      `DeskFoot.${s}`,
      [
        [-fl / 2, 0],
        [fl / 2, 0],
        [fl / 2, fEnd],
        [mm(60), fh],
        [-mm(60), fh],
        [-fl / 2, fEnd],
      ],
      fw,
      metal,
      { parent: root, at: [x, 0, 0], radius: mm(4) },
    );
    // The column: the lowest stage the longest, each one above shows its collar and its share of the rise.
    const bottom = fh;
    const top = underTop - rDeep;
    const rise = Math.max(0, o.height - o.lowest);
    const upper = o.stages.length - 1;
    const shown = upper > 0 ? o.collar + rise / upper : 0;
    let z = top;
    for (let i = o.stages.length - 1; i >= 0; i--) {
      const stage = o.stages[i];
      if (!stage) continue;
      const [sd, sw] = stage;
      const from = i === 0 ? bottom : Math.max(bottom, z - shown);
      // Each stage runs a little into the one below it, so no gap shows at a joint.
      const into = i === 0 ? 0 : mm(10);
      const len = z - from + into;
      box(bpy, `DeskColumn.${s}${String(i + 1)}`, [sw, sd, len], metal, {
        parent: root,
        at: [x, 0, from - into + len / 2],
        radius: mm(3),
        segments: 2,
      });
      z = from;
    }
  }
  // The beam between the columns' tops, and the control box under its middle.
  const [bw, bh] = o.beam;
  box(bpy, "DeskBeam", [2 * legX, bw, bh], metal, {
    parent: root,
    at: [0, 0, underTop - bh / 2],
    radius: mm(2),
    segments: 2,
  });
  box(bpy, "DeskControlBox", [mm(200), mm(80), mm(30)], metal, {
    parent: root,
    at: [-legX / 2, 0, underTop - bh - mm(15)],
    radius: mm(4),
    segments: 2,
  });
  if (o.handset) {
    const [kw, kd, kh, kin] = o.keypad;
    box(
      bpy,
      "DeskHandset",
      [kw, kd, kh],
      finish(bpy, "DeskHandset", { color: "#141415", roughness: 0.4 }),
      {
        parent: root,
        at: [tw / 2 - kin, -td / 2 + kd / 2 - mm(4), underTop - kh / 2],
        radius: mm(5),
        segments: 3,
      },
    );
    // Its display and buttons, a dark glass strip on the face towards the person.
    box(
      bpy,
      "DeskHandsetFace",
      [kw - mm(20), mm(1), kh - mm(10)],
      finish(bpy, "DeskHandsetFace", { color: "#0a0a0b", roughness: 0.12 }),
      {
        parent: root,
        at: [tw / 2 - kin, -td / 2 - mm(4.5), underTop - kh / 2],
      },
    );
  }
  return root;
}

/**
 * A bar of `width` across x whose side is the polygon `profile` ([y, z] points,
 * clockwise seen from +x, the way y runs to the right), its edges rounded by `radius`: a bracket or a
 * foot that changes its depth along its length.
 */
function profileBar(
  bpy: Bpy,
  name: string,
  profile: [number, number][],
  width: number,
  material: ModelMaterial,
  o: { parent?: ModelObject; at?: Vec3; radius?: number },
): ModelObject {
  const n = profile.length;
  // Wound so every face points out: counter-clockwise seen from outside.
  const ring = [...profile].reverse();
  const vertices: Vec3[] = [
    ...ring.map(([y, z]) => [-width / 2, y, z] as Vec3),
    ...ring.map(([y, z]) => [width / 2, y, z] as Vec3),
  ];
  const faces: number[][] = [
    [...Array(n).keys()].reverse(),
    [...Array(n).keys()].map((i) => i + n),
    ...[...Array(n).keys()].map((i) => [
      i,
      (i + 1) % n,
      ((i + 1) % n) + n,
      i + n,
    ]),
  ];
  const object = solid(bpy, name, vertices, faces, material, {
    parent: o.parent,
    at: o.at,
    smooth: true,
  });
  const radius = o.radius ?? 0;
  if (radius > 0) {
    const bevel = object.modifiers.new("Round", "BEVEL");
    bevel.width = radius;
    bevel.segments = 2;
    bevel.limit_method = "NONE";
    object.modifiers.new("Normals", "WEIGHTED_NORMAL").keep_sharp = true;
  }
  return object;
}
