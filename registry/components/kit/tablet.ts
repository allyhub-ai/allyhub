// A tablet, by default an 11-inch one at the iPad Pro 11 (M4)'s published size, 249.7 × 177.5 × 5.3 mm, its
// 2420 × 1668 panel at 264 ppi (232.8 × 160.5 mm) behind glass with even borders, a thin rim of the aluminium
// frame round the glass, and on its back the camera plateau Apple's photographs show (a rounded square in the
// corner by the top edge: the wide camera and the LiDAR scanner side by side, the microphone, flash and sensor
// under them). It lies face up in landscape, or stands leaning back on a stand behind it (`tilt`), with a stylus
// beside it if asked (Apple Pencil Pro). TABLET_PRESETS holds the 13-inch size and a silver finish.
import {
  capsule,
  cylinder as sdfCylinder,
  meshField,
  smoothIntersect,
  smoothUnion,
  type Bpy,
  type ModelObject,
  type Vec3,
} from "@allyhub-next/model";
import {
  box,
  deg,
  finish,
  group,
  mm,
  slab,
  solid,
  strut,
  type Finish,
} from "./parts.ts";

export interface TabletOptions {
  /** The body in landscape: width, depth and thickness (m). */
  body: [number, number, number];
  /** The display's active area (m), centred on the face. */
  active: [number, number];
  /** The plan's corner radius (m); the glass's follows it, `rim` in. */
  corners: [number, number];
  /** How much of the frame shows round the glass on the face (m). */
  rim: number;
  /**
   * The camera plateau on the back, in the corner by the top edge and the left side as the face looks: its side,
   * corner radius, height and inset from the edges (m); null for none.
   */
  camera: {
    size: number;
    corner: number;
    height: number;
    inset: number;
  } | null;
  /** The lenses' glass and rings. */
  lens: Finish;
  /**
   * How far it leans up from lying flat (degrees): 0 lies face up; above 0 it stands in landscape on its
   * bottom edge, its face towards -y, held by a plate behind it from 62 % of its depth down to the desk (a
   * folio's or a stand's).
   */
  tilt: number;
  frame: Finish;
  /** The display's glass round the active area, and the active area while it shows nothing. */
  glass: Finish;
  stand: Finish;
  /**
   * A stylus lying on the desk beside its right edge, along its depth, on its one flat side: its length and
   * diameter (m), its finish and its nib's (Apple Pencil Pro: 166 × 8.9 mm, matte white, a grey nib); null for
   * none.
   */
  stylus: {
    length: number;
    diameter: number;
    finish: Finish;
    nib?: Finish;
  } | null;
}

export const TABLET_DEFAULTS: TabletOptions = {
  body: [mm(249.7), mm(177.5), mm(5.3)],
  active: [mm(232.8), mm(160.5)],
  corners: [mm(12.3), mm(11.4)],
  rim: mm(0.9),
  camera: { size: mm(28), corner: mm(6), height: mm(1.3), inset: mm(5) },
  lens: { color: "#0b0b0c", roughness: 0.08 },
  tilt: 0,
  // Space black: anodised aluminium as the laptop's is, half metallic with a satin sheen.
  frame: { color: "#353437", roughness: 0.34, metallic: 0.55 },
  glass: { color: "#050506", roughness: 0.08 },
  stand: { color: "#2a2a2c", roughness: 0.7 },
  stylus: null,
};

/** The stylus a scene asks for: `tablet(bpy, at, { stylus: TABLET_STYLUS })`. */
export const TABLET_STYLUS: NonNullable<TabletOptions["stylus"]> = {
  length: mm(166),
  diameter: mm(8.9),
  finish: { color: "#f3f3f1", roughness: 0.45 },
  nib: { color: "#d8d8d6", roughness: 0.35 },
};

/**
 * Other tablets, as options over the defaults: `tablet(bpy, at, TABLET_PRESETS.thirteen)`, or a size and a
 * colour spread together.
 */
export const TABLET_PRESETS = {
  /**
   * The 13-inch tablet: 281.6 × 215.5 × 5.1 mm, its 2752 × 2064 panel at 264 ppi (264.8 × 198.6 mm)
   * (iPad Pro 13, M4 class).
   */
  thirteen: {
    body: [mm(281.6), mm(215.5), mm(5.1)],
    active: [mm(264.8), mm(198.6)],
  },
  /** Silver aluminium, for either size. */
  silver: {
    frame: { color: "#dddee0", roughness: 0.34, metallic: 0.55 },
  },
} satisfies Record<string, Partial<TabletOptions>>;

/**
 * The tablet under an empty at `at` (its footprint's centre on the desk), its bottom edge towards -y. The
 * display's active area is the object `TabletScreen`, its face up (towards -y as it leans): a scenery puts
 * its own screen over it.
 */
export function tablet(
  bpy: Bpy,
  at: Vec3,
  over: Partial<TabletOptions> = {},
  parent?: ModelObject,
): ModelObject {
  const o = { ...TABLET_DEFAULTS, ...over };
  const [w, d, t] = o.body;
  const a = deg(o.tilt);
  const root = group(bpy, "Tablet", at, parent);
  // The tablet in its own space: lying flat, its bottom edge along x at y = 0, its back on z = 0; turned up
  // about that edge by `tilt`.
  const hinge = group(bpy, "TabletHinge", [0, -(d * Math.cos(a)) / 2, 0], root);
  hinge.rotation_euler = [a, 0, 0];
  const glassDepth = mm(0.3);
  slab(
    bpy,
    "TabletBody",
    [w, d, t - glassDepth],
    o.corners[0],
    finish(bpy, "TabletFrame", o.frame),
    { parent: hinge, at: [0, d / 2, 0], edge: mm(0.8) },
  );
  const glass = finish(bpy, "TabletGlass", o.glass);
  slab(
    bpy,
    "TabletGlass",
    [w - 2 * o.rim, d - 2 * o.rim, glassDepth],
    o.corners[1],
    glass,
    { parent: hinge, at: [0, d / 2, t - glassDepth] },
  );
  if (o.camera) cameraPlateau(bpy, o, hinge);
  const [aw, ad] = o.active;
  // The active area, 0.05 mm proud of the glass.
  box(bpy, "TabletScreen", [aw, ad, mm(0.2)], glass, {
    parent: hinge,
    at: [0, d / 2, t - mm(0.05)],
  });
  if (o.tilt > 0) {
    // The stand: a plate from just behind the back at 62 % of the depth to the desk behind it.
    const s = 0.62 * d;
    const top: Vec3 = [
      0,
      -(d * Math.cos(a)) / 2 + s * Math.cos(a) + mm(1.5) * Math.sin(a),
      s * Math.sin(a) - mm(1.5) * Math.cos(a),
    ];
    const foot: Vec3 = [0, top[1] + top[2] * 0.7, mm(1.5)];
    strut(
      bpy,
      "TabletStand",
      top,
      foot,
      [w * 0.35, mm(1.5)],
      [w * 0.35, mm(1.5)],
      finish(bpy, "TabletStand", o.stand),
      { parent: root, radius: mm(1) },
    );
  }
  if (o.stylus) stylus(bpy, o.stylus, [w / 2 + mm(20), 0, 0], root);
  return root;
}

/**
 * The camera plateau under the back (z < 0 in the hinge's space), in the corner by the top edge (+y) and the
 * left side: a rounded square of the frame's finish with the two large lenses along the top edge and the
 * microphone, flash and sensor under them, each lens in a ring of the frame's finish.
 */
function cameraPlateau(bpy: Bpy, o: TabletOptions, parent: ModelObject): void {
  const c = o.camera;
  if (!c) return;
  const [w, d] = o.body;
  const frame = finish(bpy, "TabletFrame", o.frame);
  const lens = finish(bpy, "TabletLens", o.lens);
  const cx = -w / 2 + c.inset + c.size / 2;
  const cy = d - c.inset - c.size / 2;
  slab(bpy, "TabletCamera", [c.size, c.size, c.height], c.corner, frame, {
    parent,
    at: [cx, cy, -c.height],
    edge: c.height * 0.4,
  });
  // Measured on Apple's photograph of the back (slide 3A), for a 28 mm plateau.
  const u = c.size / mm(28);
  const flash = finish(bpy, "TabletFlash", {
    color: "#e8e3d0",
    roughness: 0.3,
  });
  for (const [name, dx, dy, r, ring] of [
    ["TabletLens.Wide", -5.3, 5.6, 4.3, 0.5],
    ["TabletLens.Lidar", 6.4, 6.2, 4.1, 0.4],
    ["TabletFlash", 1.7, -6.9, 2.9, 0.4],
    ["TabletMic", -7.5, -6.9, 1.5, 0],
    ["TabletSensor", 9.2, -6.9, 0.7, 0],
  ] as const) {
    // Discs as fields (mm, about the plateau's face): a lens in its ring, or a hole alone.
    const x = cx * 1000 + dx * u;
    const y = cy * 1000 + dy * u;
    const z = -c.height * 1000;
    const disc = (
      name: string,
      rad: number,
      z0: number,
      z1: number,
      f: ReturnType<typeof finish>,
    ) => {
      const m = meshField(
        (p) => sdfCylinder(p, [x, y, z0], [x, y, z1], rad, 0.15),
        {
          min: [x - rad - 0.5, y - rad - 0.5, Math.min(z0, z1) - 0.5],
          max: [x + rad + 0.5, y + rad + 0.5, Math.max(z0, z1) + 0.5],
          cell: 0.25,
        },
      );
      solid(
        bpy,
        name,
        m.vertices.map(([a, b, cc]) => [a / 1000, b / 1000, cc / 1000] as Vec3),
        m.faces,
        f,
        {
          parent,
          smooth: true,
        },
      );
    };
    if (ring > 0) disc(`${name}Ring`, (r + ring) * u, z + 0.2, z - 0.8, frame);
    disc(
      name,
      r * u,
      z + 0.1,
      z - (ring > 0 ? 0.85 : 0.15),
      name === "TabletFlash" ? flash : lens,
    );
  }
}

/**
 * The stylus lying along y on its flat side at `at`, as Apple's photographs show the Pencil Pro: a round barrel
 * with its end a half-sphere, a cone 19 mm long sharpening it to 3.8 mm across, a nib 4.5 mm long of its own
 * finish at -y, and one flat side along it a fifth of its diameter deep.
 */
export function stylus(
  bpy: Bpy,
  o: NonNullable<TabletOptions["stylus"]>,
  at: Vec3,
  parent: ModelObject,
): void {
  // Millimetres: y along (the tip at -y), z up from its axis.
  const half = (o.length * 1000) / 2;
  const r = (o.diameter * 1000) / 2;
  const nib = 4.5;
  const cone = 19;
  const joint = 1.9;
  const flat = r * 0.8;
  const y0 = -half + nib;
  const barrel = (p: [number, number, number]) =>
    smoothUnion(
      smoothUnion(
        sdfCylinder(p, [0, y0 + cone, 0], [0, half - r, 0], r, 0),
        capsule(p, [0, half - r, 0], [0, half - r, 0], r),
        0.5,
      ),
      capsule(p, [0, y0, 0], [0, y0 + cone, 0], joint, r),
      1,
    );
  const field = (p: [number, number, number]) =>
    smoothIntersect(
      smoothIntersect(barrel(p), y0 + 0.15 - p[1], 0.3),
      -flat - p[2],
      0.4,
    );
  const toM = (verts: [number, number, number][]) =>
    verts.map(([x, y, z]) => [x / 1000, y / 1000, (z + flat) / 1000] as Vec3);
  const m = meshField(field, {
    min: [-r - 1, y0 - 1, -flat - 1],
    max: [r + 1, half + 1, r + 1],
    cell: 0.6,
  });
  solid(
    bpy,
    "Stylus",
    toM(m.vertices),
    m.faces,
    finish(bpy, "Stylus", o.finish),
    {
      at,
      parent,
      smooth: true,
    },
  );
  const tip = meshField(
    (p) => capsule(p, [0, -half + 0.8, 0], [0, y0 + 0.4, 0], 0.8, joint * 0.96),
    {
      min: [-joint - 0.5, -half - 0.5, -joint - 0.5],
      max: [joint + 0.5, y0 + 1, joint + 0.5],
      cell: 0.25,
    },
  );
  solid(
    bpy,
    "StylusNib",
    toM(tip.vertices),
    tip.faces,
    finish(bpy, "StylusNib", o.nib ?? o.finish),
    {
      at,
      parent,
      smooth: true,
    },
  );
}
