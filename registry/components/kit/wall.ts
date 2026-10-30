// What hangs on or stands against the wall behind a creator: a floating shelf
// (IKEA LACK, 1100 × 260 × 50 mm), a cube shelving unit (IKEA KALLAX: 390 deep,
// 39 mm outer panels, 335 mm cubes) and picture frames (IKEA RÖDALM, 30 deep);
// . In popular demo videos, shelves: median 0.7 × 0.3
// × 0.4 m, 0.9 m behind the person, at 1.2 m; their art 0.35 × 0.4 m at 1.3 m.
import type { Bpy, ModelObject, Vec3 } from "@allyhub-next/model";
import { box, finish, group, mm, type Finish } from "./parts.ts";

/** A floating shelf, its back against the wall at y = 0, its top at z = 0 of its empty plus its thickness. */
export function floatingShelf(
  bpy: Bpy,
  at: Vec3,
  o: { size?: [number, number, number]; surface?: Finish } = {},
  parent?: ModelObject,
): ModelObject {
  const [w, d, t] = o.size ?? [mm(1100), mm(260), mm(50)];
  return box(
    bpy,
    "FloatingShelf",
    [w, d, t],
    finish(
      bpy,
      "ShelfBoard",
      o.surface ?? { color: "#f2f1ed", roughness: 0.55 },
    ),
    {
      parent,
      at: [at[0], at[1] - d / 2, at[2] + t / 2],
      radius: mm(1.5),
      segments: 2,
      uv: true,
    },
  );
}

export interface CubeShelfOptions {
  columns: number;
  rows: number;
  /** One cube's inside (m), the outer panels' and the dividers' thickness (m), the depth (m). */
  cube: number;
  outer: number;
  divider: number;
  depth: number;
  surface: Finish;
}

export const CUBE_SHELF_DEFAULTS: CubeShelfOptions = {
  columns: 2,
  rows: 4,
  cube: mm(335),
  outer: mm(39),
  divider: mm(16.5),
  depth: mm(390),
  surface: { color: "#f1f0ec", roughness: 0.5 },
};

/** A cube shelving unit standing on the floor, its back at y = 0 against the wall, its front towards -y. */
export function cubeShelf(
  bpy: Bpy,
  at: Vec3,
  over: Partial<CubeShelfOptions> = {},
  parent?: ModelObject,
): ModelObject {
  const o = { ...CUBE_SHELF_DEFAULTS, ...over };
  const root = group(bpy, "CubeShelf", at, parent);
  const board = finish(bpy, "CubeShelfBoard", o.surface);
  const width = 2 * o.outer + o.columns * o.cube + (o.columns - 1) * o.divider;
  const height = 2 * o.outer + o.rows * o.cube + (o.rows - 1) * o.divider;
  const y = -o.depth / 2;
  const r = mm(1.5);
  box(bpy, "CubeShelfTop", [width, o.depth, o.outer], board, {
    parent: root,
    at: [0, y, height - o.outer / 2],
    radius: r,
    uv: true,
  });
  box(bpy, "CubeShelfBottom", [width, o.depth, o.outer], board, {
    parent: root,
    at: [0, y, o.outer / 2],
    radius: r,
    uv: true,
  });
  for (const side of [-1, 1] as const)
    box(
      bpy,
      `CubeShelfSide.${side > 0 ? "R" : "L"}`,
      [o.outer, o.depth, height - 2 * o.outer],
      board,
      {
        parent: root,
        at: [side * (width / 2 - o.outer / 2), y, height / 2],
        radius: r,
        uv: true,
      },
    );
  for (let c = 1; c < o.columns; c++) {
    const x =
      -width / 2 + o.outer + c * o.cube + (c - 1) * o.divider + o.divider / 2;
    box(
      bpy,
      `CubeShelfUpright.${String(c)}`,
      [o.divider, o.depth - mm(2), height - 2 * o.outer],
      board,
      { parent: root, at: [x, y, height / 2], uv: true },
    );
  }
  for (let rr = 1; rr < o.rows; rr++) {
    const z = o.outer + rr * o.cube + (rr - 1) * o.divider + o.divider / 2;
    box(
      bpy,
      `CubeShelfShelf.${String(rr)}`,
      [width - 2 * o.outer, o.depth - mm(2), o.divider],
      board,
      { parent: root, at: [0, y, z], uv: true },
    );
  }
  return root;
}

/** Where a cube shelf's cubes are: each cube's floor centre from the unit's empty (m), for the scenery to fill them. */
export function cubeShelfCells(over: Partial<CubeShelfOptions> = {}): Vec3[] {
  const o = { ...CUBE_SHELF_DEFAULTS, ...over };
  const width = 2 * o.outer + o.columns * o.cube + (o.columns - 1) * o.divider;
  const cells: Vec3[] = [];
  for (let rr = 0; rr < o.rows; rr++)
    for (let c = 0; c < o.columns; c++)
      cells.push([
        -width / 2 + o.outer + c * (o.cube + o.divider) + o.cube / 2,
        -o.depth / 2,
        o.outer + rr * (o.cube + o.divider),
      ]);
  return cells;
}

export interface FrameOptions {
  /** The frame's outside: width, height, depth (m). */
  size: [number, number, number];
  /** The moulding's visible width (m), and the mount's border inside it (m); 0 for no mount. */
  moulding: number;
  mount: number;
  frame: Finish;
  /** The picture: a scenery draws its own on the material `FrameArt` (its UVs fill it). */
  art: Finish;
}

export const FRAME_DEFAULTS: FrameOptions = {
  size: [mm(320), mm(420), mm(30)],
  moulding: mm(15),
  mount: mm(50),
  frame: { color: "#151516", roughness: 0.55 },
  art: { color: "#8c8c8c", roughness: 0.8 },
};

/** A picture frame hanging with its back on the wall at y = 0, its centre at `at`. */
export function pictureFrame(
  bpy: Bpy,
  at: Vec3,
  over: Partial<FrameOptions> = {},
  parent?: ModelObject,
  name = "PictureFrame",
): ModelObject {
  const o = { ...FRAME_DEFAULTS, ...over };
  const root = group(bpy, name, at, parent);
  const [w, h, d] = o.size;
  const m = o.moulding;
  const frame = finish(bpy, "FrameMoulding", o.frame);
  const y = -d / 2;
  box(bpy, `${name}Top`, [w, d, m], frame, {
    parent: root,
    at: [0, y, h / 2 - m / 2],
    radius: mm(1),
  });
  box(bpy, `${name}Bottom`, [w, d, m], frame, {
    parent: root,
    at: [0, y, -h / 2 + m / 2],
    radius: mm(1),
  });
  for (const side of [-1, 1] as const)
    box(bpy, `${name}Side${side > 0 ? "R" : "L"}`, [m, d, h - 2 * m], frame, {
      parent: root,
      at: [side * (w / 2 - m / 2), y, 0],
      radius: mm(1),
    });
  // The mount, and the picture in its opening, 8 mm behind the frame's face.
  const inner: [number, number] = [w - 2 * m, h - 2 * m];
  const face = -d + mm(8);
  if (o.mount > 0)
    box(
      bpy,
      `${name}Mount`,
      [inner[0], mm(2), inner[1]],
      finish(bpy, "FrameMount", { color: "#f4f2ec", roughness: 0.9 }),
      { parent: root, at: [0, face + mm(1), 0] },
    );
  const art: [number, number] = [
    inner[0] - 2 * o.mount,
    inner[1] - 2 * o.mount,
  ];
  const picture = box(
    bpy,
    `${name}Art`,
    [art[0], mm(1), art[1]],
    finish(bpy, "FrameArt", o.art),
    { parent: root, at: [0, face - mm(0.6), 0] },
  );
  void picture;
  return root;
}

/** A fabric storage bin that slides into a 335 mm cube (IKEA DRÖNA, 330 × 380 × 330 mm), its front towards -y. */
export function storageBin(
  bpy: Bpy,
  at: Vec3,
  o: { size?: [number, number, number]; fabric?: Finish } = {},
  parent?: ModelObject,
  name = "StorageBin",
): ModelObject {
  const [w, d, h] = o.size ?? [mm(325), mm(370), mm(325)];
  const root = group(bpy, name, at, parent);
  box(
    bpy,
    `${name}Body`,
    [w, d, h],
    finish(bpy, "BinFabric", o.fabric ?? { color: "#b9b2a6", roughness: 0.95 }),
    { parent: root, at: [0, 0, h / 2], radius: mm(6), segments: 3 },
  );
  // The cut-out handle on its front.
  box(
    bpy,
    `${name}Handle`,
    [mm(90), mm(4), mm(28)],
    finish(bpy, "BinHandle", { color: "#3a3734", roughness: 0.9 }),
    { parent: root, at: [0, -d / 2 - mm(1), h - mm(55)], radius: mm(1.5) },
  );
  return root;
}

export interface SlatPanelOptions {
  /** The panel: width and height (m). */
  size: [number, number];
  /** A slat's width and depth, and the gap between slats (m): 27, 21 and 13 mm on the common acoustic panel. */
  slat: [number, number];
  gap: number;
  /** The felt behind the slats (m). */
  felt: number;
  /** The slats' surface: a scenery lays a wood texture on `SlatWood` (UVs in metres). */
  wood: Finish;
  backing: Finish;
}

export const SLAT_PANEL_DEFAULTS: SlatPanelOptions = {
  size: [0.8, 2.4],
  slat: [mm(27), mm(21)],
  gap: mm(13),
  felt: mm(9),
  wood: { color: "#8a6446", roughness: 0.6 },
  backing: { color: "#1b1b1c", roughness: 0.98 },
};

/** A wood slat acoustic panel standing on the floor, its back at y = 0 against the wall, its slats vertical. */
export function slatPanel(
  bpy: Bpy,
  at: Vec3,
  over: Partial<SlatPanelOptions> = {},
  parent?: ModelObject,
): ModelObject {
  const o = { ...SLAT_PANEL_DEFAULTS, ...over };
  const [w, h] = o.size;
  const root = group(bpy, "SlatPanel", at, parent);
  box(
    bpy,
    "SlatPanelFelt",
    [w, o.felt, h],
    finish(bpy, "SlatFelt", o.backing),
    { parent: root, at: [0, -o.felt / 2, h / 2] },
  );
  const pitch = o.slat[0] + o.gap;
  const count = Math.floor((w - o.slat[0]) / pitch) + 1;
  const first = -((count - 1) * pitch) / 2;
  const wood = finish(bpy, "SlatWood", o.wood);
  for (let i = 0; i < count; i++)
    box(
      bpy,
      `SlatPanelSlat.${String(i).padStart(2, "0")}`,
      [o.slat[0], o.slat[1], h],
      wood,
      {
        parent: root,
        at: [first + i * pitch, -o.felt - o.slat[1] / 2, h / 2],
        radius: mm(1),
        segments: 1,
        uv: true,
      },
    );
  return root;
}

/** An interior door in its frame, in a wall at y = 0, opening into -y; 813 × 2032 mm (a US 32-inch door). */
export function door(
  bpy: Bpy,
  at: Vec3,
  o: { size?: [number, number]; paint?: Finish; handle?: Finish } = {},
  parent?: ModelObject,
): ModelObject {
  const [w, h] = o.size ?? [mm(813), mm(2032)];
  const root = group(bpy, "Door", at, parent);
  const paint = finish(
    bpy,
    "DoorPaint",
    o.paint ?? { color: "#f3f2ee", roughness: 0.45 },
  );
  // The leaf with two raised panels, and the casing round it, 70 mm wide and 15 proud of the wall.
  box(bpy, "DoorLeaf", [w, mm(10), h], paint, {
    parent: root,
    at: [0, -mm(5), h / 2],
    radius: mm(2),
  });
  for (const [z, ph] of [
    [h * 0.72, h * 0.42],
    [h * 0.26, h * 0.36],
  ] as const)
    box(
      bpy,
      `DoorPanel.${z > h / 2 ? "Top" : "Bottom"}`,
      [w - mm(180), mm(8), ph],
      paint,
      { parent: root, at: [0, -mm(12), z], radius: mm(3) },
    );
  const casing = mm(70);
  box(bpy, "DoorCasingHead", [w + 2 * casing, mm(15), casing], paint, {
    parent: root,
    at: [0, -mm(7.5), h + casing / 2],
    radius: mm(2),
  });
  for (const side of [-1, 1] as const)
    box(bpy, `DoorCasing.${side > 0 ? "R" : "L"}`, [casing, mm(15), h], paint, {
      parent: root,
      at: [side * (w / 2 + casing / 2), -mm(7.5), h / 2],
      radius: mm(2),
    });
  const brass = finish(
    bpy,
    "DoorHandle",
    o.handle ?? { color: "#2b2b2c", roughness: 0.35, metallic: 1 },
  );
  box(bpy, "DoorHandle", [mm(120), mm(18), mm(18)], brass, {
    parent: root,
    at: [w / 2 - mm(110), -mm(45), mm(1000)],
    radius: mm(8),
  });
  box(bpy, "DoorRose", [mm(55), mm(10), mm(55)], brass, {
    parent: root,
    at: [w / 2 - mm(65), -mm(16), mm(1000)],
    radius: mm(20),
  });
  return root;
}

/** A flat-woven rug, `size` (m) and 8 mm thick; a scenery lays its weave on `RugWeave` (UVs in metres). */
export function rug(
  bpy: Bpy,
  at: Vec3,
  o: { size?: [number, number]; weave?: Finish } = {},
  parent?: ModelObject,
): ModelObject {
  const [w, d] = o.size ?? [1.6, 2.3];
  return box(
    bpy,
    "Rug",
    [w, d, mm(8)],
    finish(bpy, "RugWeave", o.weave ?? { color: "#d8d2c6", roughness: 1 }),
    {
      parent,
      at: [at[0], at[1], at[2] + mm(4)],
      radius: mm(3),
      segments: 2,
      uv: true,
    },
  );
}
