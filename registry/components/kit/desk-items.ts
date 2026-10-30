// The small things on a creator's desk, each at a reference product's published size and shaped after its
// maker's photographs: a desk mat (SteelSeries QcK XXL), four mice (Logitech MX Master 3S and Pebble Mouse 2
// M350s, Razer DeathAdder V3, Apple Magic Mouse), a trackpad (Apple Magic Trackpad), a phone (iPhone 16 Pro)
// and its stand, a globe lamp, an RGB light bar, a mug, a clock, figures and a plush. Blender's axes, metres;
// each stands on z = 0 of its empty, its front towards -y.
import {
  box as sdfBox,
  capsule,
  cylinder as sdfCylinder,
  ellipsoid,
  meshField,
  smoothIntersect,
  smoothSubtract,
  smoothUnion,
  sphere,
  torus,
  type Bpy,
  type ModelObject,
  type Vec3,
} from "@allyhub-next/model";
import {
  box,
  cylinder,
  finish,
  group,
  lathe,
  mm,
  slab,
  solid,
  type Finish,
} from "./parts.ts";

/**
 * A desk mat, by default 900 × 400 × 2 mm (SteelSeries QcK XXL, as SteelSeries lists it): black micro-woven
 * cloth on a rubber base, its corners rounded 19 mm (measured on SteelSeries' top view), its edge cut, not
 * stitched.
 */
export function deskMat(
  bpy: Bpy,
  at: Vec3,
  o: {
    size?: [number, number, number];
    corner?: number;
    surface?: Finish;
  } = {},
  parent?: ModelObject,
): ModelObject {
  const [w, d, h] = o.size ?? [mm(900), mm(400), mm(2)];
  return slab(
    bpy,
    "DeskMat",
    [w, d, h],
    o.corner ?? mm(19),
    finish(bpy, "DeskMat", o.surface ?? { color: "#1c1c1e", roughness: 0.95 }),
    {
      parent,
      at,
      edge: Math.min(mm(1.2), h * 0.4),
      uv: true,
    },
  );
}

/** A point in millimetres, and a distance field over such points: negative inside. */
type Mm = [number, number, number];
type Field = (p: Mm) => number;
/** Points in plan (mm), or [position, value] pairs along a line. */
type Plan = readonly (readonly [number, number])[];

/** A field in millimetres made a mesh in metres, smooth, stretched per axis by `scale`. */
function fieldMesh(
  bpy: Bpy,
  name: string,
  field: (p: [number, number, number]) => number,
  min: Vec3,
  max: Vec3,
  cell: number,
  material: ReturnType<typeof finish>,
  at: Vec3,
  parent?: ModelObject,
  scale: Vec3 = [1, 1, 1],
  project?: number,
): ModelObject {
  const m = meshField(field, { min, max, cell, project });
  const vertices = m.vertices.map(
    ([x, y, z]) =>
      [
        (x * scale[0]) / 1000,
        (y * scale[1]) / 1000,
        (z * scale[2]) / 1000,
      ] as Vec3,
  );
  // A sliver the surface's projection folded flat has no area, and a face it folded over faces into the shape:
  // leave both out (the field's gradient says which way is out).
  const faces = m.faces.filter(([a, b, c]) => {
    const [p, q, r] = [m.vertices[a], m.vertices[b], m.vertices[c]] as [
      Vec3,
      Vec3,
      Vec3,
    ];
    const n = cross(
      [q[0] - p[0], q[1] - p[1], q[2] - p[2]],
      [r[0] - p[0], r[1] - p[1], r[2] - p[2]],
    );
    const area = Math.hypot(n[0], n[1], n[2]);
    if (area * scale[0] * scale[1] * 1e-6 <= 2e-12) return false;
    const g = normal(field, [
      (p[0] + q[0] + r[0]) / 3,
      (p[1] + q[1] + r[1]) / 3,
      (p[2] + q[2] + r[2]) / 3,
    ]);
    return n[0] * g[0] + n[1] * g[1] + n[2] * g[2] > 0;
  });
  return solid(bpy, name, vertices, faces, material, {
    at,
    parent,
    smooth: true,
  });
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** The signed distance (mm) from (x, y) to a closed polygon in plan, negative inside (after Inigo Quilez). */
function polygon(x: number, y: number, pts: Plan): number {
  let d = Infinity;
  let s = 1;
  let prev = pts[pts.length - 1] as readonly [number, number];
  for (const cur of pts) {
    const [xi, yi] = cur;
    const ex = prev[0] - xi;
    const ey = prev[1] - yi;
    const wx = x - xi;
    const wy = y - yi;
    const h = clamp((wx * ex + wy * ey) / (ex * ex + ey * ey), 0, 1);
    d = Math.min(d, Math.hypot(wx - ex * h, wy - ey * h));
    const c1 = y >= yi;
    const c2 = y < prev[1];
    const c3 = ex * wy > ey * wx;
    if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) s = -s;
    prev = cur;
  }
  return s * d;
}

/** A closed outline through `pts` as a smooth curve (Catmull-Rom), `n` points to a span. */
function smoothPlan(pts: Plan, n = 4): [number, number][] {
  const k = pts.length;
  const at = (i: number) => pts[((i % k) + k) % k] as readonly [number, number];
  const out: [number, number][] = [];
  for (let i = 0; i < k; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let j = 0; j < n; j++) {
      const t = j / n;
      const t2 = t * t;
      const t3 = t2 * t;
      const c = (a: number, b: number, cc: number, d: number) =>
        0.5 *
        (2 * b +
          (cc - a) * t +
          (2 * a - 5 * b + 4 * cc - d) * t2 +
          (3 * b - a - 3 * cc + d) * t3);
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  return out;
}

/**
 * A function of a point in plan sampled once on a grid `step` mm apart over [min, max] and read back
 * bilinearly: a plan's distances and heights cost a lookup per sample of the 3D field, not a walk of the outline.
 */
function planGrid(
  f: (x: number, y: number) => number,
  min: [number, number],
  max: [number, number],
  step: number,
): (x: number, y: number) => number {
  const nx = Math.ceil((max[0] - min[0]) / step) + 1;
  const ny = Math.ceil((max[1] - min[1]) / step) + 1;
  const v = new Float64Array(nx * ny);
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++)
      v[j * nx + i] = f(min[0] + i * step, min[1] + j * step);
  return (x, y) => {
    const gx = clamp((x - min[0]) / step, 0, nx - 1.000001);
    const gy = clamp((y - min[1]) / step, 0, ny - 1.000001);
    const i = Math.floor(gx);
    const j = Math.floor(gy);
    const u = gx - i;
    const w = gy - j;
    const a = v[j * nx + i] ?? 0;
    const b = v[j * nx + i + 1] ?? 0;
    const c = v[(j + 1) * nx + i] ?? 0;
    const d = v[(j + 1) * nx + i + 1] ?? 0;
    return (a * (1 - u) + b * u) * (1 - w) + (c * (1 - u) + d * u) * w;
  };
}

/** A rectangle in plan about (cx, cy), half-sizes hx, hy, corners rounded by r: its signed distance. */
function rect(
  x: number,
  y: number,
  cx: number,
  cy: number,
  hx: number,
  hy: number,
  r: number,
): number {
  const qx = Math.abs(x - cx) - hx + r;
  const qy = Math.abs(y - cy) - hy + r;
  return (
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
    Math.min(Math.max(qx, qy), 0) -
    r
  );
}

/** A smooth line through [t, value] points (Catmull-Rom), held level past its ends. */
function along(points: Plan, t: number): number {
  const n = points.length;
  const at = (i: number) =>
    points[Math.max(0, Math.min(n - 1, i))] as readonly [number, number];
  if (t <= at(0)[0]) return at(0)[1];
  if (t >= at(n - 1)[0]) return at(n - 1)[1];
  let i = 0;
  while (t > at(i + 1)[0]) i++;
  const [t1, p1] = at(i);
  const [t2, p2] = at(i + 1);
  const [t0, p0] = i > 0 ? at(i - 1) : [t1 - (t2 - t1), p1];
  const [t3, p3] = i + 2 < n ? at(i + 2) : [t2 + (t2 - t1), p2];
  const u = (t - t1) / (t2 - t1);
  const m1 = ((p2 - p0) / (t2 - t0)) * (t2 - t1);
  const m2 = ((p3 - p1) / (t3 - t1)) * (t2 - t1);
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    (2 * u3 - 3 * u2 + 1) * p1 +
    (u3 - 2 * u2 + u) * m1 +
    (-2 * u3 + 3 * u2) * p2 +
    (u3 - u2) * m2
  );
}

const unit = (v: Mm): Mm => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const cross = (a: Mm, b: Mm): Mm => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** The field's outward normal at p. */
function normal(field: Field, p: Mm): Mm {
  const e = 0.05;
  return unit([
    field([p[0] + e, p[1], p[2]]) - field([p[0] - e, p[1], p[2]]),
    field([p[0], p[1] + e, p[2]]) - field([p[0], p[1] - e, p[2]]),
    field([p[0], p[1], p[2] + e]) - field([p[0], p[1], p[2] - e]),
  ]);
}

/** Where a ray from `from` along `dir` first meets the field's surface, within `reach` mm; null if it does not. */
function hit(field: Field, from: Mm, dir: Mm, reach = 120): Mm | null {
  const d = unit(dir);
  const pt = (t: number): Mm => [
    from[0] + d[0] * t,
    from[1] + d[1] * t,
    from[2] + d[2] * t,
  ];
  let a = 0;
  for (let t = 0.25; t <= reach; t += 0.25) {
    if (field(pt(t)) < 0) {
      let lo = a;
      let hi = t;
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        if (field(pt(mid)) < 0) hi = mid;
        else lo = mid;
      }
      return pt(hi);
    }
    a = t;
  }
  return null;
}

/**
 * A split line drawn on a field's surface: a ribbon `width` wide, `lift` proud, through the points where rays
 * from `path` along `dir` meet it. A ray that misses breaks the line there.
 */
function seamLine(
  bpy: Bpy,
  name: string,
  field: Field,
  path: readonly Mm[],
  dir: Mm | ((p: Mm, i: number) => Mm),
  width: number,
  material: ReturnType<typeof finish>,
  parent: ModelObject,
  scale: Vec3,
  lift = 0.05,
): void {
  // The hits, leaving out one too near the last (a ribbon needs length between its rungs).
  const on: (Mm | null)[] = [];
  let prev: Mm | null = null;
  path.forEach((p, i) => {
    const q = hit(field, p, typeof dir === "function" ? dir(p, i) : dir);
    if (
      q &&
      prev &&
      Math.hypot(q[0] - prev[0], q[1] - prev[1], q[2] - prev[2]) < 0.2
    )
      return;
    on.push(q);
    prev = q;
  });
  const vertices: Vec3[] = [];
  const faces: number[][] = [];
  let last = -1;
  on.forEach((q, i) => {
    if (!q) {
      last = -1;
      return;
    }
    // A hit far from the last (the ray found another surface) breaks the line.
    const before = on[i - 1];
    if (
      before &&
      Math.hypot(q[0] - before[0], q[1] - before[1], q[2] - before[2]) > 3
    )
      last = -1;
    const n = normal(field, q);
    const a = on[i - 1] ?? q;
    const b = on[i + 1] ?? q;
    const t = unit([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
    const s = unit(cross(n, t));
    const base = vertices.length;
    for (const side of [-1, 1])
      vertices.push([
        ((q[0] + n[0] * lift + (s[0] * side * width) / 2) * scale[0]) / 1000,
        ((q[1] + n[1] * lift + (s[1] * side * width) / 2) * scale[1]) / 1000,
        ((q[2] + n[2] * lift + (s[2] * side * width) / 2) * scale[2]) / 1000,
      ]);
    if (last >= 0) {
      const [a0, a1, b1] = [
        vertices[last],
        vertices[last + 1],
        vertices[base + 1],
      ] as [Vec3, Vec3, Vec3];
      const c = cross(
        [a1[0] - a0[0], a1[1] - a0[1], a1[2] - a0[2]],
        [b1[0] - a0[0], b1[1] - a0[1], b1[2] - a0[2]],
      );
      if (Math.hypot(c[0], c[1], c[2]) > 2e-12)
        faces.push([last, last + 1, base + 1, base]);
    }
    last = base;
  });
  if (faces.length > 0)
    solid(bpy, name, vertices, faces, material, { parent, smooth: true });
}

/**
 * A wheel as a field (mm): a cylinder from a to b of radius r, its rims rounded, with `ridges` grooves
 * `depth` deep across its tread (0: smooth).
 */
function wheelField(
  a: Mm,
  b: Mm,
  r: number,
  ridges: number,
  depth: number,
): Field {
  const u = unit([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
  const v = unit(cross(u, Math.abs(u[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  const w = cross(u, v);
  return (p) => {
    const q: Mm = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
    const ang = Math.atan2(
      q[0] * w[0] + q[1] * w[1] + q[2] * w[2],
      q[0] * v[0] + q[1] * v[1] + q[2] * v[2],
    );
    const groove =
      ridges > 0 ? depth * Math.max(0, Math.cos(ridges * ang)) ** 2 : 0;
    return sdfCylinder(p, a, b, r, Math.min(1, r / 4)) + groove;
  };
}

/** The mouse's options: its kind, its size, and the finishes of its parts. */
export interface MouseOptions {
  /**
   * "sculpted" (the default: a right-handed sculpted mouse, 124.9 × 84.3 × 51 mm, Logitech MX Master 3S: a
   * thumb rest with a wing under the thumb, a steel wheel in a channel between the buttons, a mode button
   * behind it, a thumb wheel and two thumb buttons on its left side, a lighter base), "small" (a low
   * symmetric pebble, 106.7 × 58.7 × 26.6 mm, Logitech Pebble Mouse 2 M350s: a stadium in plan, highest
   * behind the middle, a rubber wheel in a round dish, its top shell split from its sides), "gaming" (a
   * right-handed gaming mouse, 128 × 68 × 44 mm, Razer DeathAdder V3: a hump behind the middle, a thumb
   * groove and two thumb buttons on its left, its right side flared at the base, separate main buttons, a
   * ridged rubber wheel) or "touch" (a long low dome with no buttons or wheel to see, a glossy touch shell over
   * a curved aluminium base on two runners, 113.5 × 57.1 × 21.6 mm, Apple Magic Mouse).
   */
  kind?: "sculpted" | "small" | "gaming" | "touch";
  /** Its size, width × length × height (m); the kind's shape is stretched to it. Default: the product's. */
  size?: Vec3;
  /** The shell's finish; each kind has its own default (MOUSE_SHELLS). */
  shell?: Finish;
  /** The base or lower part's finish, where the kind has one (MOUSE_BASES). */
  base?: Finish;
  /** The side buttons' finish (MOUSE_BUTTONS). */
  buttons?: Finish;
  /** The wheels' finish (MOUSE_WHEELS). */
  wheel?: Finish;
  /** The split lines between its parts: their finish and width (m). */
  seams?: { finish?: Finish; width?: number };
  /** The mesh's detail: the field's grid step (mm); each kind has its own default (MOUSE_CELLS). */
  cell?: number;
  /**
   * A light strip round the shell 2 to 4 mm above the desk, 0.6 mm proud (a gaming mouse's RGB): sRGB hex and
   * nits; null for none (the default). Any kind takes it.
   */
  rgb?: { color: string; strength: number } | null;
}

type MouseKind = NonNullable<MouseOptions["kind"]>;

/** Each kind's size (m), width × length × height, its makers' published dimensions. */
export const MOUSE_SIZES: Record<MouseKind, Vec3> = {
  sculpted: [mm(84.3), mm(124.9), mm(51)],
  small: [mm(58.7), mm(106.7), mm(26.6)],
  gaming: [mm(68), mm(128), mm(44)],
  touch: [mm(57.1), mm(113.5), mm(21.6)],
};

/** Each kind's shell when `shell` is not given, sampled from the makers' photographs. */
export const MOUSE_SHELLS: Record<MouseKind, Finish> = {
  sculpted: { color: "#393c40", roughness: 0.62 },
  small: { color: "#e6e5e4", roughness: 0.5 },
  gaming: { color: "#151517", roughness: 0.5 },
  touch: { color: "#f6f6f5", roughness: 0.18 },
};

/**
 * Each kind's base when `base` is not given (the gaming mouse has none of another colour); aluminium as the
 * laptop's is, half metallic with a satin sheen.
 */
export const MOUSE_BASES: Record<MouseKind, Finish> = {
  sculpted: { color: "#4b4e52", roughness: 0.55 },
  small: { color: "#dcdad8", roughness: 0.6 },
  gaming: { color: "#151517", roughness: 0.5 },
  touch: { color: "#dddee0", roughness: 0.34, metallic: 0.55 },
};

/** Each kind's side buttons when `buttons` is not given. */
export const MOUSE_BUTTONS: Record<MouseKind, Finish> = {
  sculpted: { color: "#2b2d31", roughness: 0.45 },
  small: { color: "#e7e5e3", roughness: 0.5 },
  gaming: { color: "#1f1f22", roughness: 0.38 },
  touch: { color: "#f4f4f2", roughness: 0.18 },
};

/** Each kind's wheels when `wheel` is not given. */
export const MOUSE_WHEELS: Record<MouseKind, Finish> = {
  sculpted: { color: "#a7abb0", roughness: 0.32, metallic: 1 },
  small: { color: "#e2e0de", roughness: 0.7 },
  gaming: { color: "#1c1c1e", roughness: 0.85 },
  touch: { color: "#f4f4f2", roughness: 0.18 },
};

/** Each kind's grid step (mm). */
export const MOUSE_CELLS: Record<MouseKind, number> = {
  sculpted: 1.1,
  small: 1.2,
  gaming: 1.4,
  touch: 1,
};

/** The split lines' defaults: a dark line 0.45 mm wide. */
export const MOUSE_SEAMS = {
  finish: { color: "#0d0d0e", roughness: 0.8 } as Finish,
  width: mm(0.45),
};

/** What one kind is made of, in millimetres at the product's size. */
interface MouseBuild {
  body: Field;
  min: Mm;
  max: Mm;
  /**
   * Where the base is split from the shell, if it is: the split's height over each point in plan (mm), its
   * greatest height, and how far the base is set in under the shell (mm).
   */
  baseCut?: {
    at: (x: number, y: number) => number;
    top: number;
    inset: number;
  };
  /** Split lines: points outside the body and the direction to its surface. */
  seams: {
    path: Mm[];
    dir: Mm | ((p: Mm, i: number) => Mm);
    /** A band of the base's finish this wide (mm), in place of a split line. */
    band?: number;
  }[];
  /** Raised parts on the surface: a region (mm field) lifted `lift` mm, in the shell's or the seams' finish. */
  patches: {
    name: string;
    region: Field;
    lift: number;
    min: Mm;
    max: Mm;
    accent?: boolean;
  }[];
  /** Wheels: fields with their boxes. */
  wheels: { name: string; field: Field; min: Mm; max: Mm }[];
  /** Other parts, built by the kind itself. */
  extra?: (bpy: Bpy, root: ModelObject, scale: Vec3) => void;
}

/**
 * A mouse, by default a right-handed sculpted one, 124.9 × 84.3 × 51 mm (Logitech MX Master 3S): its buttons
 * towards +y (away from the person, as it lies under a right hand), its thumb side at -x.
 */
export function mouse(
  bpy: Bpy,
  at: Vec3,
  o: MouseOptions = {},
  parent?: ModelObject,
): ModelObject {
  const kind = o.kind ?? "sculpted";
  const root = group(bpy, "Mouse", at, parent);
  const size = o.size ?? MOUSE_SIZES[kind];
  const own = MOUSE_SIZES[kind];
  const scale: Vec3 = [size[0] / own[0], size[1] / own[1], size[2] / own[2]];
  const cell = o.cell ?? MOUSE_CELLS[kind];
  const build =
    kind === "sculpted"
      ? sculptedMouse()
      : kind === "small"
        ? smallMouse()
        : kind === "gaming"
          ? gamingMouse()
          : touchMouse();
  const shell = finish(bpy, "MouseShell", o.shell ?? MOUSE_SHELLS[kind]);
  const { body, min, max } = build;
  const baseFinish = finish(bpy, "MouseBase", o.base ?? MOUSE_BASES[kind]);
  if (build.baseCut === undefined)
    fieldMesh(
      bpy,
      "MouseShell",
      body,
      min,
      max,
      cell,
      shell,
      [0, 0, 0],
      root,
      scale,
    );
  else {
    const { at: cut, top, inset } = build.baseCut;
    fieldMesh(
      bpy,
      "MouseShell",
      (p) => smoothIntersect(body(p), cut(p[0], p[1]) - p[2], 1),
      min,
      max,
      cell,
      shell,
      [0, 0, 0],
      root,
      scale,
    );
    fieldMesh(
      bpy,
      "MouseBase",
      (p) => smoothIntersect(body(p) + inset, p[2] - cut(p[0], p[1]), 1),
      min,
      [max[0], max[1], top + 2 * cell],
      cell,
      baseFinish,
      [0, 0, 0],
      root,
      scale,
    );
  }
  const seamFinish = finish(
    bpy,
    "MouseSeam",
    o.seams?.finish ?? MOUSE_SEAMS.finish,
  );
  const seamWidth = (o.seams?.width ?? MOUSE_SEAMS.width) * 1000;
  build.seams.forEach((s, i) =>
    seamLine(
      bpy,
      s.band ? `MouseBaseBand.${String(i)}` : `MouseSeam.${String(i)}`,
      body,
      s.path,
      s.dir,
      s.band ?? seamWidth,
      s.band ? baseFinish : seamFinish,
      root,
      scale,
      s.band ? 0.08 : 0.05,
    ),
  );
  const accent = finish(bpy, "MouseButtons", o.buttons ?? MOUSE_BUTTONS[kind]);
  for (const pt of build.patches)
    fieldMesh(
      bpy,
      pt.name,
      (p) => {
        const f = body(p);
        return smoothIntersect(
          Math.max(f - pt.lift, -f - 1.2),
          pt.region(p),
          0.3,
        );
      },
      pt.min,
      pt.max,
      Math.min(cell, 0.4),
      pt.accent ? accent : shell,
      [0, 0, 0],
      root,
      scale,
    );
  const wheel = finish(bpy, "MouseWheel", o.wheel ?? MOUSE_WHEELS[kind]);
  for (const w of build.wheels)
    // Not moved onto the surface: the tread's grooves are finer than a step's reach and would fold.
    fieldMesh(
      bpy,
      w.name,
      w.field,
      w.min,
      w.max,
      0.5,
      wheel,
      [0, 0, 0],
      root,
      scale,
      0,
    );
  build.extra?.(bpy, root, scale);
  if (o.rgb)
    mouseStrip(
      bpy,
      body,
      o.rgb,
      [min[0], min[1]],
      [max[0], max[1]],
      root,
      scale,
    );
  return root;
}

/** A top's fall across its crest: `left` per mm² on its left, `right` on its right, blended over 12 mm so the crest has no crease. */
const fall = (dx: number, left: number, right: number) =>
  left + (right - left) / (1 + Math.exp(-dx / 3));

/** Rays straight down onto the top along a polyline in plan, a point every `step` mm. */
function fromAbove(line: Plan, step = 1, z = 80): Mm[] {
  const out: Mm[] = [];
  for (let i = 0; i + 1 < line.length; i++) {
    const [ax, ay] = line[i] as readonly [number, number];
    const [bx, by] = line[i + 1] as readonly [number, number];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step));
    for (let k = 0; k <= n; k++) {
      if (k === n && i + 2 < line.length) break;
      out.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n, z]);
    }
  }
  return out;
}
const DOWN: Mm = [0, 0, -1];

/** Rays level and inwards onto the sides at height z, from `n` points on a circle of radius `r` round (cx, cy). */
function round(
  n: number,
  z: number | ((x: number, y: number) => number),
  cx = 0,
  cy = 0,
  r = 90,
) {
  const path: Mm[] = [];
  const dirs: Mm[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * 2 * Math.PI;
    const x = Math.cos(a);
    const y = Math.sin(a);
    path.push([cx + x * r, cy + y * r, typeof z === "number" ? z : z(x, y)]);
    dirs.push([-x, -y, 0]);
  }
  return { path, dir: (_p: Mm, i: number): Mm => dirs[i] ?? [0, 0, -1] };
}

/** A raised pill on the surface: a capsule from a to b (mm), radius r, measured into the body. */
const pill =
  (a: Mm, b: Mm, r: number): Field =>
  (p) =>
    capsule(p, a, b, r);

/**
 * The MX Master 3S (mm; x across, the thumb at -x; y along, the buttons at +y; z up), built from sections
 * measured on Logitech's photographs (top view: 6.64 px/mm from its 124.9 × 84.3 mm bounds; heights scaled to
 * the published 51 mm on the left-profile and left-front views):
 *
 *   y    plan left  plan right  panel edge x  crest z  edge step  wing rim z   base lift/inset  source
 *   55   -16.1      32.9        -             26       -          -            9 / 10           top; profile
 *   40   -16.9      35.9        -             31.5     1.5        -            9 / 7            top; profile
 *   25   -16.9      37.9        -             38.5     2.5        -            7 / 4.5          top; profile, left-front
 *   10   -36.2      38.9        -17.2         46.5     3.5        10.5         5.5 / 2.5        top; left-front
 *   -5   -39.5      40.1        -18.4         50.3     3.5        12.5         5 / 1.5          top; left-front, profile
 *   -20  -41.8      40.7        -19.2         50.6     3          13           4.5 / 1.2        top; profile
 *   -35  -41.0      40.4        -18.8         45.5     1.8        12           6 / 1.8          top; rear
 *   -50  -31.2      36.6        -23.0         37       0.4        18           8.5 / 5          top; rear, profile
 *
 * Plan left and right are the top view's silhouette (its mask, row by row). Base lift / inset is how far the
 * sides curve in under the body (the inset at the desk, fading out `lift` mm up), from the profile view's
 * underside. The panel edge is where the ribbed thumb panel meets the smooth top in the top view: a line from
 * the wing's front, under the thumb wheel, down to the base behind the wing. The body is one height field over
 * the plan: the top (the crest along y, falling to each side) on the shell's side of that line, and on the
 * panel's side a sweep from the line, `edge step` under the top, down to the wing's rim at the plan's edge,
 * concave under the thumb and convex towards the back. Sections between the stations are Catmull-Rom curves
 * through them; the only edges are the panel's (a short step), the
 * wing's rim and the base band.
 */
function sculptedMouse(): MouseBuild {
  // The base outline, the wing included: the top view's mask, finer than the table's stations.
  const basePlan: Plan = smoothPlan([
    [-15.5, 57],
    [-11, 61.5],
    [-6, 62.4],
    [3, 61.6],
    [14, 59.6],
    [24, 56.6],
    [30, 53.2],
    [34.6, 48.4],
    [36.6, 42.5],
    [38, 30],
    [38.9, 18],
    [39.6, 5],
    [40.6, -1],
    [41.2, -7],
    [41.8, -14],
    [42, -21],
    [41.8, -28],
    [41, -34],
    [39.5, -40],
    [36.8, -46],
    [32.5, -52],
    [26, -57.5],
    [17, -61.2],
    [6, -62.4],
    [-2, -61],
    [-7.6, -57.9],
    [-13, -55],
    [-18.9, -51.6],
    [-24, -48.4],
    [-28.7, -45.2],
    [-33, -42.5],
    [-36.8, -39],
    [-39.5, -35.5],
    [-41.2, -32.6],
    [-42.15, -26.2],
    [-41.9, -20],
    [-41.2, -13.6],
    [-40.4, -7.2],
    [-39.5, -1],
    [-38, 5.4],
    [-35, 9.5],
    [-30, 13],
    [-25, 16],
    [-21.5, 18.2],
    [-19.5, 20.8],
    [-18.4, 24.5],
    [-17.9, 29],
    [-17.6, 34],
    [-17.4, 44],
    [-17, 50],
    [-16.5, 54],
  ]);
  // The panel's edge in plan (the table's column), from the wing's front to the base behind the wing (in front
  // of the wing the left button's side is the plan's own edge; round the back the top runs down to the base as
  // one convex surface, the ribs the photo shows there being texture, not form).
  const edgeLine: [number, number][] = [
    [-21, 22],
    [-17.4, 17],
    [-17.2, 10],
    [-18.4, -5],
    [-19.2, -20],
    [-18.6, -32],
    [-20.5, -44],
    [-25, -54],
    [-32, -64],
  ];
  // The panel's side of that line, closed round the left and the back.
  const panelPlan: Plan = [...edgeLine, [-40, -90], [-90, -90], [-90, 22]];
  // The step under the top at the edge, and the wing's rim, along y (the table's columns).
  const step: Plan = [
    [-62, 0],
    [-50, 0.4],
    [-35, 1.8],
    [-20, 3],
    [-5, 3.5],
    [10, 3.5],
    [25, 2.5],
    [40, 1.5],
    [62, 1],
  ];
  // How the panel falls from its edge to the rim: concave under the thumb (above 1), convex round the back
  // (under 1), where the photos show one rounded surface.
  const sweep: Plan = [
    [-62, 0.5],
    [-48, 0.6],
    [-36, 1.2],
    [-25, 1.7],
  ];
  const rim: Plan = [
    [-64, 26],
    [-58, 24],
    [-50, 18],
    [-42, 13.5],
    [-35, 12],
    [-20, 13],
    [-5, 12.5],
    [10, 10.5],
    [20, 7],
    [28, 4],
  ];
  // The crest along y (the table's column), and where across it runs (it moves right towards the buttons).
  const ridge: Plan = [
    [-63, 26],
    [-59, 31],
    [-50, 37],
    [-42, 42],
    [-35, 45.5],
    [-20, 50.6],
    [-10, 51],
    [-5, 50.3],
    [10, 46.5],
    [25, 38.5],
    [40, 31.5],
    [55, 26],
    [61.5, 22],
    [63, 21],
  ];
  const crestX: Plan = [
    [-10, -4],
    [60, 8],
  ];
  const top = (x: number, y: number) => {
    const c = along(crestX, y);
    return along(ridge, y) - fall(x - c, 0.006, 0.0125) * (x - c) ** 2;
  };
  const wheelAt: Mm = [8.5, 40, top(8.5, 40)];
  // The nearest point of the edge line to (x, y): its distance and that point.
  const nearEdge = (x: number, y: number): [number, number, number] => {
    let best: [number, number, number] = [Infinity, x, y];
    for (let i = 0; i + 1 < edgeLine.length; i++) {
      const [ax, ay] = edgeLine[i] as [number, number];
      const [bx, by] = edgeLine[i + 1] as [number, number];
      const ex = bx - ax;
      const ey = by - ay;
      const h = clamp(
        ((x - ax) * ex + (y - ay) * ey) / (ex * ex + ey * ey),
        0,
        1,
      );
      const px = ax + ex * h;
      const py = ay + ey * h;
      const dd = Math.hypot(x - px, y - py);
      if (dd < best[0]) best = [dd, px, py];
    }
    return best;
  };
  // The panel: from the edge, `step` under the top there, sweeping down to the rim at the plan's edge, concave.
  // The distances are averaged over a 2.5 mm ring, so their kinks (where the nearest edge changes) leave no
  // crease in the surface.
  const ring = [0, 1, 2, 3, 4, 5].map((i): [number, number] => [
    2.5 * Math.cos((i * Math.PI) / 3),
    2.5 * Math.sin((i * Math.PI) / 3),
  ]);
  const smooth = (f: (x: number, y: number) => number, x: number, y: number) =>
    (2 * f(x, y) + ring.reduce((t, [dx, dy]) => t + f(x + dx, y + dy), 0)) / 8;
  const panelAt = (x: number, y: number) => {
    const [, ex, ey] = nearEdge(x, y);
    const s = smooth((a, b) => nearEdge(a, b)[0], x, y);
    const e = Math.max(
      0,
      smooth((a, b) => -polygon(a, b, basePlan), x, y),
    );
    const from = top(ex, ey) - along(step, ey);
    const to = along(rim, y);
    const u = s / (s + e + 1e-6);
    return to + (from - to) * (1 - u) ** along(sweep, y);
  };
  // How far into the panel's side a point is, 0 to 1 over 4 mm: the edge's step.
  const onPanel = (x: number, y: number) => {
    const t = clamp(-polygon(x, y, panelPlan) / 4 + 0.5, 0, 1);
    return t * t * (3 - 2 * t);
  };
  const lo: [number, number] = [-48, -68];
  const hi: [number, number] = [48, 68];
  const height = planGrid(
    (x, y) => {
      const w = onPanel(x, y);
      return w <= 0
        ? top(x, y)
        : w >= 1
          ? panelAt(x, y)
          : top(x, y) * (1 - w) + panelAt(x, y) * w;
    },
    lo,
    hi,
    0.4,
  );
  const panelWeight = planGrid(onPanel, lo, hi, 0.4);
  const planDistance = planGrid((x, y) => polygon(x, y, basePlan), lo, hi, 0.4);
  // The sides lean in going up, more under the buttons (so the top is narrower at the front than its base) and
  // round the back.
  const lean = (y: number) =>
    0.12 +
    0.1 / (1 + Math.exp(-(y - 20) / 8)) +
    0.16 / (1 + Math.exp((y + 36) / 6));
  // The base band stands 1.2 mm in under the shell, so the shell's edge shows over it all round (the plan is the
  // shell's outline, as the top view shows it).
  const ledge = (z: number) => {
    const t = clamp((z - 3) / 1.5, 0, 1);
    return 1.2 * (1 - t * t * (3 - 2 * t));
  };
  // The base is smaller than the body: towards the nose and the back the sides curve in under it, `inset` mm in
  // at the desk over `lift` mm up (the profile photo: the nose's underside 11 mm up at y = 58, 3.5 mm under the
  // buttons, the back's 12 mm up at its end).
  const inset: Plan = [
    [-63, 14],
    [-56, 9],
    [-45, 3.5],
    [-30, 1],
    [0, 1.5],
    [20, 4],
    [40, 7],
    [52, 11],
    [63, 16],
  ];
  const lift: Plan = [
    [-63, 17],
    [-45, 9],
    [-30, 4],
    [0, 5],
    [20, 6],
    [40, 9],
    [63, 15],
  ];
  const under = (y: number, z: number) => {
    const t = clamp(1 - z / along(lift, y), 0, 1);
    return along(inset, y) * t * t;
  };
  const whole: Field = (p) => {
    const w = panelWeight(p[0], p[1]);
    // The top's edge rounds 4 mm on the shell's side; the wing's rim is crisp, softening at its front.
    const k = 4 - (2.5 * w) / (1 + Math.exp((p[1] - 8) / 3));
    return smoothIntersect(
      smoothIntersect(
        planDistance(p[0], p[1]) +
          (1 - w) * lean(p[1]) * Math.max(0, p[2] - 12) +
          ledge(p[2]) +
          under(p[1], p[2]),
        (p[2] - height(p[0], p[1])) * 0.45,
        k,
      ),
      -p[2],
      1,
    );
  };
  // The thumb wheel, recessed in the panel just under its edge, its axis near upright so its rim faces out.
  const wy = 2;
  const wz = top(-17.5, wy) - along(step, wy) - 7;
  const wall = hit(whole, [-70, wy, wz], [1, 0, 0]) ?? [-26, wy, wz];
  const axis = unit([0.3, 0, 0.95]);
  const tr = 8.6;
  const tc: Mm = [wall[0] + tr - 2.4, wy, wz];
  const tw = 3.2;
  const ta: Mm = [tc[0] - axis[0] * tw, tc[1], tc[2] - axis[2] * tw];
  const tb: Mm = [tc[0] + axis[0] * tw, tc[1], tc[2] + axis[2] * tw];
  const body: Field = (p) => {
    // The channel the wheel turns in, and the pocket of the thumb wheel.
    const channel = sdfBox(p, [8.5, 39.5, wheelAt[2] + 27], [4.8, 17, 30], 1.5);
    const pocket = sdfCylinder(
      p,
      [ta[0] - axis[0], ta[1], ta[2] - axis[2]],
      [tb[0] + axis[0], tb[1], tb[2] + axis[2]],
      tr + 0.8,
      0.5,
    );
    return smoothSubtract(smoothSubtract(whole(p), channel, 1.2), pocket, 0.6);
  };
  // The two thumb buttons under the thumb wheel, one before the other.
  const side = (y: number, z: number): Mm =>
    hit(whole, [-70, y, z], [1, 0, 0]) ?? [-26, y, z];
  const bz = wz - 8;
  const pills = [
    ["MouseThumb.F", side(10, bz), side(4.5, bz)],
    ["MouseThumb.B", side(3, bz), side(-2.5, bz)],
  ] as const;
  const r = 11.5;
  return {
    body,
    min: [-46, -66, -1],
    max: [46, 66, 54],
    seams: [
      // The lighter base round the bottom.
      { ...round(240, 1.7), band: 2.6 },
      // The left button's edge and back, the right button's, and the gap between them before the wheel.
      {
        path: fromAbove([
          [-14.6, 61],
          [-14.6, 19.5],
          [-13, 17.6],
          [3.6, 16.4],
        ]),
        dir: DOWN,
      },
      {
        path: fromAbove([
          [31.8, 50],
          [33.6, 40],
          [34.2, 14],
          [32.5, 11.8],
          [13.4, 14.4],
        ]),
        dir: DOWN,
      },
      {
        path: fromAbove(
          [
            [8.5, 63],
            [8.5, 56.6],
          ],
          0.5,
        ),
        dir: DOWN,
      },
    ],
    patches: [
      {
        name: "MouseModeButton",
        region: (p) => rect(p[0], p[1], 8.5, 13.4, 3, 3.8, 1.4),
        lift: 0.5,
        min: [4, 8.5, 30],
        max: [13, 18.5, 52],
      },
      ...pills.map(([name, a, b]) => ({
        name,
        region: pill(a, b, 2.4),
        lift: 0.8,
        min: [
          Math.min(a[0], b[0]) - 6,
          Math.min(a[1], b[1]) - 4,
          Math.min(a[2], b[2]) - 4,
        ] as Mm,
        max: [
          Math.max(a[0], b[0]) + 6,
          Math.max(a[1], b[1]) + 4,
          Math.max(a[2], b[2]) + 4,
        ] as Mm,
        accent: true,
      })),
    ],
    wheels: [
      {
        name: "MouseWheel",
        // The steel wheel: 23 mm across, 7.5 wide, its top 2.5 mm over the buttons, its rim knurled.
        field: wheelField(
          [5, 40, wheelAt[2] + 2.5 - r],
          [12, 40, wheelAt[2] + 2.5 - r],
          r,
          36,
          0.4,
        ),
        min: [4, 27, wheelAt[2] - 22],
        max: [13, 53, wheelAt[2] + 4],
      },
      {
        name: "MouseThumbWheel",
        field: wheelField(ta, tb, tr, 28, 0.45),
        min: [tc[0] - 11, tc[1] - 11, tc[2] - 11],
        max: [tc[0] + 11, tc[1] + 11, tc[2] + 11],
      },
    ],
  };
}

/**
 * The Pebble Mouse 2 M350s (mm), from Logitech's top and profile photographs: a stadium in plan (its ends
 * half-circles of the full width), its top highest a third from the back (26.6) and falling to 14 at the front,
 * a slight crown across, its base edge rounded so the ends lift off the desk; a rubber wheel 27.6 mm from the
 * centre in a shallow round dish; the top shell split from the sides 7.5 mm under the top, and the buttons
 * split along the middle.
 */
function smallMouse(): MouseBuild {
  const half = 53.35;
  const r = 29.35;
  const crown: Plan = [
    [-53.4, 19],
    [-47, 24.4],
    [-35, 26.5],
    [-22, 26.3],
    [-10, 25.2],
    [3, 23.9],
    [15, 22.6],
    [28, 21.1],
    [40, 18.9],
    [48, 16.6],
    [53.4, 14],
  ];
  const top = (x: number, y: number) => along(crown, y) - 0.0045 * x * x;
  const plan = (x: number, y: number) =>
    Math.hypot(x, Math.max(Math.abs(y) - (half - r), 0)) - r;
  const wy = 27.6;
  // The dish round the wheel: 22 mm across, 2.5 deep.
  const dish = 25.5;
  // The sides lean in 1.6 mm from the base to the top, so the lower body shows round the top shell from above;
  // the shell's edge is 7.5 mm under the top.
  const shellDrop = 7.5;
  const whole: Field = (p) =>
    smoothIntersect(
      smoothIntersect(
        plan(p[0], p[1]) + 0.075 * Math.max(0, p[2] - 4),
        (p[2] - top(p[0], p[1])) * 0.95,
        6,
      ),
      -p[2],
      7,
    );
  const body: Field = (p) =>
    smoothSubtract(
      whole(p),
      sphere(p, [0, wy, top(0, wy) + dish - 2.5], dish),
      1,
    );
  // The top shell's edge round the sides, 7.5 mm under the top.
  const ring: Mm[] = [];
  const ringDir: Mm[] = [];
  for (let i = 0; i < 160; i++) {
    const a = (i / 160) * 2 * Math.PI;
    const cy = Math.sin(a) > 0 ? half - r : -(half - r);
    const nx = Math.cos(a);
    const ny = Math.sin(a);
    const y = cy + ny * r;
    const z = top(nx * r, y) - shellDrop - 0.2;
    ring.push([nx * (r + 10), cy + ny * (r + 10), z]);
    ringDir.push([-nx, -ny, 0]);
  }
  ring.push(ring[0] as Mm);
  ringDir.push(ringDir[0] as Mm);
  const wr = 8;
  const wz = top(0, wy) + 2.2 - wr;
  return {
    body,
    min: [-31, -55, -1],
    max: [31, 55, 29],
    seams: [
      { path: ring, dir: (_p, i) => ringDir[i] ?? [0, 0, -1] },
      {
        path: fromAbove(
          [
            [0, 54],
            [0, 38.8],
          ],
          0.5,
        ),
        dir: DOWN,
      },
      {
        path: fromAbove(
          [
            [0, 16.4],
            [0, -7],
          ],
          0.5,
        ),
        dir: DOWN,
      },
    ],
    patches: [],
    wheels: [
      {
        name: "MouseWheel",
        field: wheelField([-4.8, wy, wz], [4.8, wy, wz], wr, 0, 0),
        min: [-6, wy - 9.5, wz - 9.5],
        max: [6, wy + 9.5, wz + 9.5],
      },
    ],
  };
}

/**
 * The DeathAdder V3 (mm), from Razer's top photograph and RTINGS's three-quarter view: nearly parallel sides,
 * the back rounded and widest at the back left (the thumb's flare) and back right; its crest 44 mm high 15 mm
 * behind the middle, leaning left, the right side falling and flared at the base, a groove for the thumb along
 * the left side; main buttons split from the body 4 mm behind the middle and down the middle, a ridged wheel in
 * a channel between them, two thumb buttons above the groove.
 */
function gamingMouse(): MouseBuild {
  const outline: Plan = [
    [-15, 64.2],
    [-22, 62.5],
    [-29, 58.4],
    [-32.6, 54],
    [-32.6, 50],
    [-32, 37],
    [-31.5, 28],
    [-31.5, 20],
    [-31.8, 8],
    [-31.8, -5],
    [-31.8, -17.6],
    [-32.6, -25],
    [-33.6, -32],
    [-34, -37],
    [-34, -41],
    [-33.3, -46],
    [-32.2, -51],
    [-30.4, -55],
    [-27, -59],
    [-22.8, -62.5],
    [-15, -64.4],
    [-4, -64.6],
    [10, -64.4],
    [17, -62.5],
    [21.8, -59],
    [25.4, -55],
    [27.9, -51],
    [30, -46],
    [31.5, -41],
    [32.6, -37],
    [33.7, -32],
    [34, -25],
    [34, -17.6],
    [33.5, -10],
    [32.6, -5],
    [31.8, 8],
    [31.5, 20],
    [31.8, 28],
    [32.2, 37],
    [32.2, 50],
    [29.7, 54],
    [23.9, 58.4],
    [17, 62.5],
    [10, 64.2],
  ];
  const ridge: Plan = [
    [-65, 8],
    [-61, 19],
    [-54, 29],
    [-44, 37.5],
    [-32, 42.5],
    [-20, 44],
    [-10, 43.6],
    [0, 41.8],
    [12, 38],
    [25, 33.5],
    [38, 29.2],
    [50, 25.2],
    [58, 22.4],
    [64.5, 19.5],
  ];
  const crestX: Plan = [
    [-20, -4],
    [50, 0],
  ];
  const top = (x: number, y: number) => {
    const c = along(crestX, y);
    return along(ridge, y) - fall(x - c, 0.011, 0.015) * (x - c) ** 2;
  };
  // The sides lean in: the left with the thumb's groove, the right flared at the base; blended across the middle.
  const inset = (x: number, z: number) => {
    const left =
      3.2 * Math.exp(-(((z - 17) / 7) ** 2)) + 0.14 * Math.max(0, z - 22);
    const right = 0.2 * Math.max(0, z - 5);
    return left + (right - left) / (1 + Math.exp(-x / 6));
  };
  const wy = 40;
  const wt = top(0, wy);
  // The back half is an egg: its top and sides held inside an ellipsoid, so it rounds off towards the back.
  const egg = (p: Mm) =>
    smoothUnion(ellipsoid(p, [-1, -8, 0], [38, 60, 52]), -(p[1] + 8), 30);
  const whole: Field = (p) =>
    smoothIntersect(
      smoothIntersect(
        smoothIntersect(
          polygon(p[0], p[1], outline) + inset(p[0], p[2]),
          (p[2] - top(p[0], p[1])) * 0.85,
          8,
        ),
        egg(p),
        8,
      ),
      -p[2],
      1.5,
    );
  const body: Field = (p) =>
    smoothSubtract(
      whole(p),
      sdfBox(p, [0, wy, wt + 27], [4.6, 11, 30], 1.2),
      1,
    );
  const side = (y: number, z: number): Mm =>
    hit(whole, [-70, y, z], [1, 0, 0]) ?? [-30, y, z];
  const pills = [
    ["MouseThumb.F", side(25, 25), side(15.5, 24.5)],
    ["MouseThumb.B", side(13, 24.5), side(2, 24)],
  ] as const;
  const r = 10;
  return {
    body,
    min: [-38, -68, -1],
    max: [38, 68, 47],
    seams: [
      // The main buttons: their back edge across the top, their outer edges, and the split down the middle.
      {
        path: fromAbove([
          [-27.5, 63],
          [-28.2, 30],
          [-28.2, 9],
          [-14, 5.8],
          [0, 4.8],
          [14, 3.6],
          [28.4, 1.6],
          [29, 30],
          [27.6, 60],
        ]),
        dir: DOWN,
      },
      {
        path: fromAbove(
          [
            [0, 65],
            [0, 51.2],
          ],
          0.5,
        ),
        dir: DOWN,
      },
      {
        path: fromAbove(
          [
            [0, 28.8],
            [0, 5],
          ],
          0.5,
        ),
        dir: DOWN,
      },
    ],
    patches: pills.map(([name, a, b]) => ({
      name,
      region: pill(a, b, 4),
      lift: 1.3,
      accent: true,
      min: [
        Math.min(a[0], b[0]) - 6,
        Math.min(a[1], b[1]) - 5,
        Math.min(a[2], b[2]) - 5,
      ] as Mm,
      max: [
        Math.max(a[0], b[0]) + 6,
        Math.max(a[1], b[1]) + 5,
        Math.max(a[2], b[2]) + 5,
      ] as Mm,
    })),
    wheels: [
      {
        name: "MouseWheel",
        field: wheelField(
          [-3.3, wy, wt + 2.2 - r],
          [3.3, wy, wt + 2.2 - r],
          r,
          24,
          0.7,
        ),
        min: [-4.5, wy - 12, wt - 20],
        max: [4.5, wy + 12, wt + 4],
      },
    ],
  };
}

/**
 * The Magic Mouse (mm), from Apple's top, side and bottom photographs: a superellipse in plan (power 3.85), its
 * top an elliptic arch along its length 21.6 mm high in the middle and a gentle crown across; underneath, a
 * curved aluminium hull that turns in under the sides to a flat bottom and two black runners. The glossy shell
 * is everything over 13 mm in the middle, its lip falling to the ends and standing 1 mm out over the hull.
 */
function touchMouse(): MouseBuild {
  const a = 28.55;
  const b = 56.75;
  const n = 3.85;
  // The superellipse as a polygon of 160 points, for a true distance in plan.
  const outline: [number, number][] = [];
  for (let i = 0; i < 160; i++) {
    const t = (i / 160) * 2 * Math.PI;
    const c = Math.cos(t);
    const s = Math.sin(t);
    outline.push([
      a * Math.sign(c) * Math.abs(c) ** (2 / n),
      b * Math.sign(s) * Math.abs(s) ** (2 / n),
    ]);
  }
  const plan = (x: number, y: number) => polygon(x, y, outline);
  const runner = 1;
  const top = (x: number, y: number) =>
    runner +
    20.6 * Math.sqrt(Math.max(0, 1 - (y / (b + 0.5)) ** 2)) -
    0.0095 * x * x;
  // The hull: the plan's edge turning in with a 12 mm radius about a ring 13 mm above the runners.
  const hullR = 12;
  const hullZ = runner + 13;
  const body: Field = (p) => {
    const d = plan(p[0], p[1]);
    const below = Math.max(hullZ - p[2], 0);
    const side =
      d >= -hullR ? Math.hypot(Math.max(d + hullR, 0), below) - hullR : d;
    return smoothIntersect(
      smoothIntersect(side, (p[2] - top(p[0], p[1])) * 0.9, 2.5),
      runner - p[2],
      1,
    );
  };
  return {
    body,
    min: [-32, -60, runner - 1],
    max: [32, 60, 24],
    // The lip falls from 13 mm over the middle to the runners at the ends.
    baseCut: {
      at: (_x, y) => runner + 12 * Math.max(0, 1 - (y / (b - 1)) ** 2) ** 0.6,
      top: 13,
      inset: 1,
    },
    seams: [],
    patches: [],
    wheels: [],
    extra: (bpy, root, scale) => {
      // The two black runners along the bottom.
      for (const side of [-1, 1] as const)
        box(
          bpy,
          `MouseRunner.${side > 0 ? "R" : "L"}`,
          [mm(3) * scale[0], mm(74) * scale[1], mm(runner + 0.6) * scale[2]],
          finish(bpy, "MouseRunner", { color: "#121213", roughness: 0.6 }),
          {
            parent: root,
            at: [
              mm(15.5) * side * scale[0],
              0,
              mm((runner + 0.6) / 2) * scale[2],
            ],
            radius: mm(0.6),
          },
        );
    },
  };
}

/** The light strip: the shell grown 0.6 mm, cut to a band 2 to 4 mm above the desk, glowing. */
function mouseStrip(
  bpy: Bpy,
  body: Field,
  rgb: { color: string; strength: number },
  min: [number, number],
  max: [number, number],
  parent: ModelObject,
  scale: Vec3,
): void {
  const band = (p: [number, number, number]) =>
    smoothIntersect(body(p) - 0.6, sdfBox(p, [0, 0, 3], [90, 90, 1]), 0.3);
  fieldMesh(
    bpy,
    "MouseStrip",
    band,
    [min[0] - 2, min[1] - 2, 1],
    [max[0] + 2, max[1] + 2, 5],
    1,
    finish(bpy, "MouseStrip", {
      color: "#101012",
      roughness: 0.4,
      emission: { color: rgb.color, strength: rgb.strength },
    }),
    [0, 0, 0],
    parent,
    scale,
  );
}

/** The trackpad's options and defaults (Apple Magic Trackpad, USB-C, 2024: Apple's tech specs and store photographs). */
export interface TrackpadOptions {
  /** Its plan: width and depth (m). */
  size: [number, number];
  /** Its heights at the front and at the back (m). */
  front: number;
  back: number;
  /** The plan's corner radius (m), measured on Apple's top view. */
  corner: number;
  /** The aluminium body: its sides, back and base. */
  body: Finish;
  /** The glass touch surface over the whole top: its finish, thickness and how far in from the body's edge (m). */
  surface: Finish;
  glass: number;
  rim: number;
  /** The USB-C port in the middle of the back, and the power switch at its left end: their finish. */
  port: Finish;
}

export const TRACKPAD_DEFAULTS: TrackpadOptions = {
  size: [mm(160), mm(114.9)],
  front: mm(4.9),
  back: mm(10.9),
  corner: mm(10),
  body: { color: "#dddee0", roughness: 0.34, metallic: 0.55 },
  surface: { color: "#f1f1f2", roughness: 0.32 },
  glass: mm(1.2),
  rim: mm(0.3),
  port: { color: "#151516", roughness: 0.6 },
};

/**
 * The black trackpad: black glass over aluminium a shade darker than the white one's (Apple's photographs of
 * both put its sides at #999a9d to #b2b4b6 against the white one's #cbccce to #d2d3d5).
 */
export const TRACKPAD_PRESETS = {
  black: {
    body: { color: "#bdbec1", roughness: 0.34, metallic: 0.55 },
    surface: { color: "#232325", roughness: 0.3 },
  },
} satisfies Record<string, Partial<TrackpadOptions>>;

/**
 * A trackpad lying on the desk, by default 160 × 114.9 mm, a slight wedge 4.9 mm high at the front and 10.9 mm
 * at the back (Apple Magic Trackpad): a white glass surface over the whole top, its edge rounded, on an
 * aluminium body whose sides show under it; a USB-C port in the middle of its back. Its front towards -y.
 */
export function trackpad(
  bpy: Bpy,
  at: Vec3,
  over: Partial<TrackpadOptions> = {},
  parent?: ModelObject,
): ModelObject {
  const o = { ...TRACKPAD_DEFAULTS, ...over };
  const root = group(bpy, "Trackpad", at, parent);
  const [w, d] = o.size;
  const { front, back, corner } = o;
  // The body: a rounded plan, its top sloping from `front` to `back` less the glass on it.
  const ring = roundedPlan(w, d, corner, 10);
  const k = ring.length;
  const topAt = (y: number) => front + ((back - front) * (y + d / 2)) / d;
  const body = solid(
    bpy,
    "TrackpadBody",
    [
      ...ring.map(([x, y]) => [x, y, 0] as Vec3),
      ...ring.map(([x, y]) => [x, y, topAt(y) - o.glass + mm(0.1)] as Vec3),
    ],
    [
      [...Array(k).keys()].reverse(),
      [...Array(k).keys()].map((i) => i + k),
      ...[...Array(k).keys()].map((i) => [
        i,
        (i + 1) % k,
        ((i + 1) % k) + k,
        i + k,
      ]),
    ],
    finish(bpy, "TrackpadBody", o.body),
    { parent: root, smooth: true },
  );
  const edge = body.modifiers.new("Round", "BEVEL");
  edge.width = mm(0.8);
  edge.segments = 3;
  edge.limit_method = "ANGLE";
  edge.angle_limit = (60 * Math.PI) / 180;
  body.modifiers.new("Normals", "WEIGHTED_NORMAL").keep_sharp = true;
  // The glass: a slab along the slope over the whole top, `rim` in from the edge, its edge rounded.
  const slope = Math.atan2(back - front, d);
  slab(
    bpy,
    "TrackpadSurface",
    [w - 2 * o.rim, d / Math.cos(slope) - 2 * o.rim, o.glass],
    corner - o.rim,
    finish(bpy, "TrackpadSurface", o.surface),
    {
      parent: root,
      at: [0, 0, (front + back) / 2 - o.glass],
      rotation: [slope, 0, 0],
      edge: o.glass * 0.45,
    },
  );
  // The port and the switch on the back face.
  const port = finish(bpy, "TrackpadPort", o.port);
  box(bpy, "TrackpadPort", [mm(8.4), mm(1), mm(2.6)], port, {
    parent: root,
    at: [0, d / 2 - mm(0.3), (back - o.glass) / 2],
    radius: mm(1.2),
  });
  box(bpy, "TrackpadSwitch", [mm(4), mm(1), mm(1.6)], port, {
    parent: root,
    at: [-w / 2 + mm(14), d / 2 - mm(0.3), (back - o.glass) / 2],
    radius: mm(0.7),
  });
  return root;
}

/** A rectangle `w` × `d` round its centre with corners of radius `r`, `n` segments a corner, anticlockwise. */
function roundedPlan(
  w: number,
  d: number,
  r: number,
  n: number,
): [number, number][] {
  const ring: [number, number][] = [];
  for (const [cx, cy, start] of [
    [w / 2 - r, -d / 2 + r, -90],
    [w / 2 - r, d / 2 - r, 0],
    [-w / 2 + r, d / 2 - r, 90],
    [-w / 2 + r, -d / 2 + r, 180],
  ] as const)
    for (let i = 0; i <= n; i++) {
      const a = ((start + (90 * i) / n) * Math.PI) / 180;
      ring.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  return ring;
}

/** The phone's defaults (iPhone 16 Pro, black titanium: Apple's tech specs and its front and back views). */
export const PHONE_DEFAULTS = {
  /** Width, length and thickness (m). */
  size: [mm(71.5), mm(149.6), mm(8.25)] as Vec3,
  /** The plan's corner radius (m), measured on Apple's front view. */
  corner: mm(12),
  /** How much of the frame shows round the display's glass (m). */
  rim: mm(1.5),
  /** The titanium frame and the back, anodised and half metallic as the laptop's aluminium. */
  frame: { color: "#4a4844", roughness: 0.34, metallic: 0.55 } as Finish,
  glass: { color: "#060607", roughness: 0.08 } as Finish,
  /**
   * The camera plateau in the back's top corner (at +x as the phone lies face up): its side, corner radius,
   * height and inset (m); its three lenses in rings, the flash and the LiDAR scanner.
   */
  camera: { size: mm(38), corner: mm(9.5), height: mm(1.4), inset: mm(3.5) },
  lens: { color: "#0b0b0c", roughness: 0.06 } as Finish,
};

/** A phone lying face up, 149.6 × 71.5 × 8.25 mm (iPhone 16 Pro); its display is the object `PhoneScreen`. */
export function phone(
  bpy: Bpy,
  at: Vec3,
  o: Partial<typeof PHONE_DEFAULTS> & { rotation?: Vec3 } = {},
  parent?: ModelObject,
): ModelObject {
  const p = { ...PHONE_DEFAULTS, ...o };
  const root = group(bpy, "Phone", at, parent);
  if (o.rotation) root.rotation_euler = o.rotation;
  const [w, l, h] = p.size;
  const frame = finish(bpy, "PhoneFrame", p.frame);
  slab(bpy, "PhoneBody", [w, l, h], p.corner, frame, {
    parent: root,
    edge: mm(1.6),
  });
  // The display's glass over the face, `rim` in from the edge.
  slab(
    bpy,
    "PhoneScreen",
    [w - 2 * p.rim, l - 2 * p.rim, mm(0.3)],
    p.corner - p.rim,
    finish(bpy, "PhoneGlass", p.glass),
    {
      parent: root,
      at: [0, 0, h - mm(0.05)],
    },
  );
  // The camera plateau under the back, its lenses: two on the outer side, one between them inside, the flash and
  // the scanner at the inner corners (Apple's back view, seen from the face).
  const c = p.camera;
  const cx = w / 2 - c.inset - c.size / 2;
  const cy = l / 2 - c.inset - c.size / 2;
  slab(bpy, "PhoneCameras", [c.size, c.size, c.height], c.corner, frame, {
    parent: root,
    at: [cx, cy, -c.height],
    edge: c.height * 0.4,
  });
  const u = (c.size * 1000) / 38;
  const lens = finish(bpy, "PhoneLens", p.lens);
  const z = -c.height * 1000;
  const disc = (
    name: string,
    x: number,
    y: number,
    r: number,
    z0: number,
    z1: number,
    f: ReturnType<typeof finish>,
  ) =>
    fieldMesh(
      bpy,
      name,
      (q) => sdfCylinder(q, [x, y, z0], [x, y, z1], r, 0.3),
      [x - r - 0.5, y - r - 0.5, Math.min(z0, z1) - 0.5],
      [x + r + 0.5, y + r + 0.5, Math.max(z0, z1) + 0.5],
      0.3,
      f,
      [0, 0, 0],
      root,
    );
  for (const [i, dx, dy] of [
    [0, 8.6, 8.6],
    [1, 8.6, -8.6],
    [2, -8.6, 0],
  ] as const) {
    const x = cx * 1000 + dx * u;
    const y = cy * 1000 + dy * u;
    disc(`PhoneLensRing.${String(i)}`, x, y, 7.6 * u, z + 0.3, z - 1.6, frame);
    disc(`PhoneLens.${String(i)}`, x, y, 5.6 * u, z - 1, z - 1.7, lens);
  }
  disc(
    "PhoneFlash",
    cx * 1000 - 9 * u,
    cy * 1000 + 11 * u,
    2.6 * u,
    z + 0.2,
    z - 0.3,
    finish(bpy, "PhoneFlash", { color: "#e8e3d0", roughness: 0.3 }),
  );
  disc(
    "PhoneScanner",
    cx * 1000 - 9 * u,
    cy * 1000 - 11 * u,
    2.6 * u,
    z + 0.2,
    z - 0.3,
    lens,
  );
  return root;
}

/**
 * A globe table lamp: an opal glass globe of 250 mm on a small base, 240 mm tall
 * (IKEA FADO). `glow` is the globe's luminance in nits when it is on (0: off);
 * a scenery adds the light it casts.
 */
export function globeLamp(
  bpy: Bpy,
  at: Vec3,
  o: { diameter?: number; height?: number; glow?: number; color?: string } = {},
  parent?: ModelObject,
): ModelObject {
  const root = group(bpy, "GlobeLamp", at, parent);
  const d = o.diameter ?? mm(250);
  const height = o.height ?? mm(240);
  const color = o.color ?? "#ffe2bd";
  const glow = o.glow ?? 650;
  cylinder(
    bpy,
    "GlobeLampBase",
    mm(60),
    mm(25),
    finish(bpy, "LampBase", { color: "#f1f0ec", roughness: 0.5 }),
    {
      parent: root,
      at: [0, 0, mm(12.5)],
      radius: mm(2),
    },
  );
  // The globe: a sphere whose bottom sinks into the base, so the lamp stands `height` tall.
  const r = d / 2;
  // From the top down round the sphere to where it meets the base, then in to the axis.
  const cz = height - r;
  const foot = mm(18);
  const bottom = Math.acos(Math.max(-1, Math.min(1, (foot - cz) / r)));
  const steps = 32;
  const profile: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (bottom * i) / steps;
    profile.push([r * Math.sin(a), cz + r * Math.cos(a)]);
  }
  profile.push([0, foot]);
  lathe(
    bpy,
    "GlobeLampGlobe",
    profile,
    finish(bpy, "LampGlobe", {
      color: "#f4efe6",
      roughness: 0.6,
      emission: glow > 0 ? { color, strength: glow } : undefined,
    }),
    { parent: root, steps: 64 },
  );
  return root;
}

/** An RGB light bar standing on its end or lying down, 254 × 44 × 36 mm (Philips Hue Play). */
export function lightBar(
  bpy: Bpy,
  at: Vec3,
  o: {
    color?: string;
    glow?: number;
    upright?: boolean;
    body?: Finish;
    rotation?: Vec3;
  } = {},
  parent?: ModelObject,
): ModelObject {
  const root = group(bpy, "LightBar", at, parent);
  if (o.rotation) root.rotation_euler = o.rotation;
  const [l, w, h] = [mm(254), mm(44), mm(36)];
  const upright = o.upright ?? true;
  const size: Vec3 = upright ? [w, h, l] : [l, h, w];
  box(
    bpy,
    "LightBarBody",
    size,
    finish(bpy, "LightBarBody", o.body ?? { color: "#1a1a1c", roughness: 0.5 }),
    {
      parent: root,
      at: [0, 0, size[2] / 2],
      radius: mm(4),
    },
  );
  // The diffuser on its back face (towards +y: it lights the wall behind).
  const diffuser: Vec3 = upright
    ? [w - mm(8), mm(1), l - mm(10)]
    : [l - mm(10), mm(1), w - mm(8)];
  box(
    bpy,
    "LightBarDiffuser",
    diffuser,
    finish(bpy, "LightBarGlow", {
      color: "#ffffff",
      roughness: 0.4,
      emission: { color: o.color ?? "#7b5cff", strength: o.glow ?? 900 },
    }),
    { parent: root, at: [0, h / 2 + mm(0.4), size[2] / 2] },
  );
  return root;
}

/** A ceramic mug, 82 mm across and 95 mm tall, with its handle to +x. */
export function mug(
  bpy: Bpy,
  at: Vec3,
  o: { glaze?: Finish } = {},
  parent?: ModelObject,
): ModelObject {
  const glaze = finish(
    bpy,
    "MugGlaze",
    o.glaze ?? { color: "#e8e3da", roughness: 0.25 },
  );
  const root = group(bpy, "Mug", at, parent);
  // Millimetres: a cup with a 4 mm wall and a 6 mm floor, its rim rounded, and a ring handle.
  const field = (p: [number, number, number]) => {
    const outer = sdfCylinder(p, [0, 0, 0], [0, 0, 95], 41, 3);
    const inner = sdfCylinder(p, [0, 0, 6], [0, 0, 110], 37, 2);
    const cup = smoothSubtract(outer, inner, 1.5);
    const handle = torus(p, [47, 0, 50], "y", 18, 5);
    const grip = smoothSubtract(
      handle,
      sdfCylinder(p, [0, 0, -5], [0, 0, 100], 40, 0),
      1,
    );
    return smoothUnion(cup, grip, 3);
  };
  fieldMesh(
    bpy,
    "MugBody",
    field,
    [-45, -45, -1],
    [72, 45, 97],
    2.6,
    glaze,
    [0, 0, 0],
    root,
  );
  return root;
}

/**
 * A phone stand with a magnetic disc, holding a phone upright facing -y
 * (popular videos' "phone on a magnetic stand"): a weighted round base, a stem
 * and the disc, at the height a phone's centre sits for a demo, 0.15 m.
 */
export function phoneStand(
  bpy: Bpy,
  at: Vec3,
  o: {
    height?: number;
    tilt?: number;
    metal?: Finish;
    phone?: Partial<typeof PHONE_DEFAULTS> | false;
  } = {},
  parent?: ModelObject,
): ModelObject {
  const root = group(bpy, "PhoneStand", at, parent);
  const metal = finish(
    bpy,
    "StandMetal",
    o.metal ?? { color: "#2a2a2c", roughness: 0.35, metallic: 0.9 },
  );
  const height = o.height ?? 0.15;
  cylinder(bpy, "PhoneStandBase", mm(45), mm(12), metal, {
    parent: root,
    at: [0, 0, mm(6)],
    radius: mm(3),
  });
  cylinder(bpy, "PhoneStandStem", mm(6), height - mm(12), metal, {
    parent: root,
    at: [0, mm(4), mm(12) + (height - mm(12)) / 2],
  });
  // The disc and the phone on it lean back by `tilt` degrees, the phone's back on the disc.
  const head = group(bpy, "PhoneStandHead", [0, mm(4), height], root);
  head.rotation_euler = [Math.PI / 2 - ((o.tilt ?? 12) * Math.PI) / 180, 0, 0];
  cylinder(bpy, "PhoneStandDisc", mm(28), mm(6), metal, {
    parent: head,
    at: [0, 0, mm(3)],
    radius: mm(2),
  });
  if (o.phone !== false) {
    const held = phone(bpy, [0, 0, mm(6)], o.phone ?? {}, head);
    held.rotation_euler = [0, 0, 0];
  }
  return root;
}

/** A small desk clock gadget, 95 × 38 × 42 mm, its digits glowing on its front (towards -y). */
export function deskClock(
  bpy: Bpy,
  at: Vec3,
  o: { body?: Finish; glow?: { color: string; strength: number } } = {},
  parent?: ModelObject,
): ModelObject {
  const root = group(bpy, "DeskClock", at, parent);
  box(
    bpy,
    "DeskClockBody",
    [mm(95), mm(38), mm(42)],
    finish(bpy, "ClockBody", o.body ?? { color: "#7a5a3c", roughness: 0.55 }),
    { parent: root, at: [0, 0, mm(21)], radius: mm(4) },
  );
  box(
    bpy,
    "DeskClockFace",
    [mm(78), mm(1), mm(26)],
    finish(bpy, "ClockFace", { color: "#0c0c0d", roughness: 0.2 }),
    { parent: root, at: [0, -mm(19.2), mm(21)] },
  );
  // Four digits as glowing bars: the time is not legible at a desk's distance, only its glow.
  const glow = finish(bpy, "ClockDigits", {
    color: "#ff9a3c",
    roughness: 0.5,
    emission: o.glow ?? { color: "#ff8a2a", strength: 220 },
  });
  [-27, -11, 11, 27].forEach((x, i) =>
    box(bpy, `DeskClockDigit.${String(i)}`, [mm(10), mm(0.6), mm(18)], glow, {
      parent: root,
      at: [mm(x), -mm(19.8), mm(21)],
    }),
  );
  return root;
}

/**
 * A vinyl collectible figure, `height` tall (0.12 m by default): a big head on a
 * small body, as the figures on creators' shelves are. Colours by `palette`.
 */
export function figurine(
  bpy: Bpy,
  at: Vec3,
  o: {
    height?: number;
    body?: string;
    head?: string;
    accent?: string;
    turn?: number;
  } = {},
  parent?: ModelObject,
  name = "Figurine",
): ModelObject {
  const root = group(bpy, name, at, parent);
  root.rotation_euler = [0, 0, ((o.turn ?? 0) * Math.PI) / 180];
  const s = (o.height ?? 0.12) / 120;
  // Millimetres at 120 tall, scaled.
  const bodyField = (p: [number, number, number]) =>
    smoothUnion(
      capsuleLike(p, [0, 0, 17], [0, 0, 42], 17),
      smoothUnion(
        capsuleLike(p, [-9, 0, 7], [-9, 0, 7], 7),
        capsuleLike(p, [9, 0, 7], [9, 0, 7], 7),
        2,
      ),
      4,
    );
  const headField = (p: [number, number, number]) =>
    smoothUnion(
      ellipsoid(p, [0, 0, 82], [34, 30, 32]),
      smoothUnion(
        ellipsoid(p, [-24, 0, 108], [9, 7, 10]),
        ellipsoid(p, [24, 0, 108], [9, 7, 10]),
        2,
      ),
      5,
    );
  const scaled = (verts: Vec3[]) =>
    verts.map(([x, y, z]) => [x * s, y * s, z * s] as Vec3);
  const body = meshField(bodyField, {
    min: [-30, -22, 0],
    max: [30, 22, 62],
    cell: 1.6,
  });
  solid(
    bpy,
    `${name}Body`,
    scaled(body.vertices),
    body.faces,
    finish(bpy, "FigureBody", { color: o.body ?? "#f07c4c", roughness: 0.4 }),
    { parent: root, smooth: true },
  );
  const head = meshField(headField, {
    min: [-38, -34, 46],
    max: [38, 34, 122],
    cell: 1.6,
  });
  solid(
    bpy,
    `${name}Head`,
    scaled(head.vertices),
    head.faces,
    finish(bpy, "FigureHead", { color: o.head ?? "#f4e9dc", roughness: 0.35 }),
    { parent: root, smooth: true },
  );
  // Two eyes on the head's front.
  for (const side of [-1, 1] as const)
    box(
      bpy,
      `${name}Eye.${side > 0 ? "R" : "L"}`,
      [mm(5) * s * 1000, mm(2) * s * 1000, mm(8) * s * 1000],
      finish(bpy, "FigureEye", {
        color: o.accent ?? "#121212",
        roughness: 0.2,
      }),
      {
        parent: root,
        at: [side * 11 * s, -29.5 * s, 84 * s],
        radius: 1.8 * s,
      },
    );
  return root;
}

/** A capsule of one radius between two points (millimetres): the figure's limbs and body. */
function capsuleLike(
  p: [number, number, number],
  a: [number, number, number],
  b: [number, number, number],
  r: number,
): number {
  const pa = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
  const ba = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const bb = ba[0] * ba[0] + ba[1] * ba[1] + ba[2] * ba[2];
  const h =
    bb === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, (pa[0] * ba[0] + pa[1] * ba[1] + pa[2] * ba[2]) / bb),
        );
  return (
    Math.hypot(pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h) - r
  );
}

/** A plush toy bear sitting, `height` tall (0.18 m by default), its fur `color`. */
export function plush(
  bpy: Bpy,
  at: Vec3,
  o: { height?: number; color?: string; turn?: number } = {},
  parent?: ModelObject,
  name = "Plush",
): ModelObject {
  const root = group(bpy, name, at, parent);
  root.rotation_euler = [0, 0, ((o.turn ?? 0) * Math.PI) / 180];
  const s = (o.height ?? 0.18) / 180;
  const field = (p: [number, number, number]) => {
    const body = ellipsoid(p, [0, 4, 45], [42, 36, 45]);
    const head = ellipsoid(p, [0, -2, 122], [40, 36, 36]);
    const ears = smoothUnion(
      ellipsoid(p, [-30, 2, 150], [12, 8, 12]),
      ellipsoid(p, [30, 2, 150], [12, 8, 12]),
      2,
    );
    const muzzle = ellipsoid(p, [0, -34, 114], [15, 10, 11]);
    const legs = smoothUnion(
      ellipsoid(p, [-22, -28, 14], [15, 24, 14]),
      ellipsoid(p, [22, -28, 14], [15, 24, 14]),
      2,
    );
    const arms = smoothUnion(
      ellipsoid(p, [-38, -10, 60], [12, 14, 26]),
      ellipsoid(p, [38, -10, 60], [12, 14, 26]),
      2,
    );
    return smoothUnion(
      smoothUnion(smoothUnion(body, head, 10), smoothUnion(ears, muzzle, 4), 5),
      smoothUnion(legs, arms, 4),
      6,
    );
  };
  const m = meshField(field, {
    min: [-56, -56, -1],
    max: [56, 46, 166],
    cell: 2.2,
  });
  solid(
    bpy,
    `${name}Body`,
    m.vertices.map(([x, y, z]) => [x * s, y * s, z * s] as Vec3),
    m.faces,
    finish(bpy, "PlushFur", { color: o.color ?? "#c9a27e", roughness: 1 }),
    { parent: root, smooth: true },
  );
  for (const side of [-1, 1] as const)
    box(
      bpy,
      `${name}Eye.${side > 0 ? "R" : "L"}`,
      [6 * s, 2 * s, 6 * s],
      finish(bpy, "PlushEye", { color: "#111111", roughness: 0.2 }),
      { parent: root, at: [side * 13 * s, -33 * s, 130 * s], radius: 2.9 * s },
    );
  return root;
}
