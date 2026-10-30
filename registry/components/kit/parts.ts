// Building blocks the kit's props share. Blender's axes (Z up, metres, radians),
// as @allyhub/model writes them: a prop stands on z = 0, its front towards -y
// (the world's +z once the model's root turns Z up to Y up).
import {
  bmesh,
  uv,
  ShaderNodeBsdfPrincipled,
  type Bpy,
  type ModelMaterial,
  type ModelObject,
  type Vec3,
} from "@allyhub-next/model";

export const deg = (d: number): number => (d * Math.PI) / 180;
export const mm = (v: number): number => v / 1000;

/** An sRGB hex colour as Blender's linear RGB. */
export function linear(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  const c = (v: number): number => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return [c((n >> 16) & 255), c((n >> 8) & 255), c(n & 255)];
}

export interface Finish {
  /** sRGB hex. */
  color: string;
  roughness: number;
  metallic?: number;
  /** A glow: sRGB hex and strength in nits (a screen, an LED). */
  emission?: { color: string; strength: number };
  /** An image (a path from the model's module) for the base colour, on the object's UVs. */
  image?: string;
}

const finishes = new WeakMap<Bpy, Map<string, ModelMaterial>>();

/** A Principled material; two props asking for the same name and finish share it. */
export function finish(bpy: Bpy, name: string, f: Finish): ModelMaterial {
  let known = finishes.get(bpy);
  if (!known) {
    known = new Map();
    finishes.set(bpy, known);
  }
  const key = `${name}|${JSON.stringify(f)}`;
  const found = known.get(key);
  if (found) return found;
  const made = bpy.data.materials.new(name);
  known.set(key, made);
  made.use_nodes = true;
  const tree = made.node_tree;
  const node = tree?.nodes.get("Principled BSDF");
  if (!tree || !(node instanceof ShaderNodeBsdfPrincipled))
    throw new Error(`${name} has no Principled BSDF.`);
  node.inputs["Base Color"].default_value = [...linear(f.color), 1];
  node.inputs.Roughness.default_value = f.roughness;
  node.inputs.Metallic.default_value = f.metallic ?? 0;
  if (f.emission) {
    node.inputs["Emission Color"].default_value = [
      ...linear(f.emission.color),
      1,
    ];
    node.inputs["Emission Strength"].default_value = f.emission.strength;
  }
  if (f.image) {
    const texture = tree.nodes.new("ShaderNodeTexImage");
    texture.image = bpy.data.images.load(f.image);
    tree.links.new(texture.outputs.Color, node.inputs["Base Color"]);
    if (f.emission)
      tree.links.new(texture.outputs.Color, node.inputs["Emission Color"]);
  }
  return made;
}

/** An empty that groups a prop's parts, at `at` under `parent`. */
export function group(
  bpy: Bpy,
  name: string,
  at: Vec3 = [0, 0, 0],
  parent?: ModelObject,
): ModelObject {
  const empty = bpy.data.objects.new(name, null);
  empty.location = at;
  if (parent) empty.parent = parent;
  bpy.context.collection.objects.link(empty);
  return empty;
}

function place(
  bpy: Bpy,
  name: string,
  mesh: ReturnType<Bpy["data"]["meshes"]["new"]>,
  at: Vec3,
  parent?: ModelObject,
): ModelObject {
  const object = bpy.data.objects.new(name, mesh);
  object.location = at;
  if (parent) object.parent = parent;
  bpy.context.collection.objects.link(object);
  return object;
}

export interface BoxOptions {
  /** Its centre, in its parent's space. */
  at?: Vec3;
  parent?: ModelObject;
  /** Every edge rounded by this radius (m); 0 for sharp. */
  radius?: number;
  /** Segments of the rounding: more is smoother. */
  segments?: number;
  rotation?: Vec3;
  /** UVs in metres (a cube projection of size 1): a scenery lays a texture at its real tile size. */
  uv?: boolean;
}

/** Cube-projects a mesh's faces into UVs in metres. */
export function metreUvs(mesh: ReturnType<Bpy["data"]["meshes"]["new"]>): void {
  const bm = bmesh.new();
  try {
    bm.from_mesh(mesh);
    uv.cube_project(bm, { cube_size: 1 });
    bm.to_mesh(mesh);
  } finally {
    bm.free();
  }
}

/** A box `size` (x, y, z) with every edge rounded, shaded smooth with its flats kept flat. */
export function box(
  bpy: Bpy,
  name: string,
  size: Vec3,
  material: ModelMaterial,
  o: BoxOptions = {},
): ModelObject {
  const [x, y, z] = size.map((v) => v / 2) as [number, number, number];
  const mesh = bpy.data.meshes.new(name);
  mesh.from_pydata(
    [
      [-x, -y, -z],
      [x, -y, -z],
      [x, y, -z],
      [-x, y, -z],
      [-x, -y, z],
      [x, -y, z],
      [x, y, z],
      [-x, y, z],
    ],
    [],
    [
      [0, 3, 2, 1],
      [4, 5, 6, 7],
      [0, 1, 5, 4],
      [1, 2, 6, 5],
      [2, 3, 7, 6],
      [3, 0, 4, 7],
    ],
  );
  mesh.materials.append(material);
  if (o.uv) metreUvs(mesh);
  const object = place(bpy, name, mesh, o.at ?? [0, 0, 0], o.parent);
  if (o.rotation) object.rotation_euler = o.rotation;
  const radius = Math.min(o.radius ?? 0, x * 0.999, y * 0.999, z * 0.999);
  if (radius > 0) {
    const bevel = object.modifiers.new("Round", "BEVEL");
    bevel.width = radius;
    bevel.segments = o.segments ?? 4;
    bevel.limit_method = "NONE";
    mesh.shade_smooth();
    object.modifiers.new("Normals", "WEIGHTED_NORMAL").keep_sharp = true;
  }
  return object;
}

export interface CylinderOptions {
  at?: Vec3;
  parent?: ModelObject;
  rotation?: Vec3;
  segments?: number;
  /** The rims rounded by this radius (m). */
  radius?: number;
  bevelSegments?: number;
}

/** A cylinder along z: `r` its radius, `h` its height, centred at `at`. */
export function cylinder(
  bpy: Bpy,
  name: string,
  r: number,
  h: number,
  material: ModelMaterial,
  o: CylinderOptions = {},
): ModelObject {
  const mesh = bpy.data.meshes.new(name);
  const bm = bmesh.new();
  try {
    bmesh.ops.create_cone(bm, {
      cap_ends: true,
      segments: o.segments ?? 48,
      radius1: r,
      radius2: r,
      depth: h,
    });
    bm.to_mesh(mesh);
  } finally {
    bm.free();
  }
  mesh.materials.append(material);
  mesh.shade_smooth();
  mesh.set_sharp_from_angle(deg(40));
  const object = place(bpy, name, mesh, o.at ?? [0, 0, 0], o.parent);
  if (o.rotation) object.rotation_euler = o.rotation;
  const rim = Math.min(o.radius ?? 0, r * 0.999, (h / 2) * 0.999);
  if (rim > 0) {
    const bevel = object.modifiers.new("Round", "BEVEL");
    bevel.width = rim;
    bevel.segments = o.bevelSegments ?? 3;
    bevel.limit_method = "ANGLE";
    bevel.angle_limit = deg(60);
    object.modifiers.new("Normals", "WEIGHTED_NORMAL").keep_sharp = true;
  }
  return object;
}

/** A solid of revolution about z from a profile of [radius, z] points, open at neither end. */
export function lathe(
  bpy: Bpy,
  name: string,
  profile: [number, number][],
  material: ModelMaterial,
  o: { at?: Vec3; parent?: ModelObject; steps?: number } = {},
): ModelObject {
  const mesh = bpy.data.meshes.new(name);
  mesh.from_pydata(
    profile.map(([r, z]) => [r, 0, z]),
    profile.slice(1).map((_, i) => [i, i + 1]),
    [],
  );
  mesh.materials.append(material);
  const object = place(bpy, name, mesh, o.at ?? [0, 0, 0], o.parent);
  const screw = object.modifiers.new("Lathe", "SCREW");
  screw.axis = "Z";
  screw.steps = o.steps ?? 64;
  screw.render_steps = o.steps ?? 64;
  screw.use_merge_vertices = true;
  screw.merge_threshold = 1e-6;
  screw.use_smooth_shade = true;
  return object;
}

/** A mesh from vertices and faces, as `from_pydata` takes them. */
export function solid(
  bpy: Bpy,
  name: string,
  vertices: Vec3[],
  faces: number[][],
  material: ModelMaterial,
  o: { at?: Vec3; parent?: ModelObject; smooth?: boolean } = {},
): ModelObject {
  const mesh = bpy.data.meshes.new(name);
  mesh.from_pydata(vertices, [], faces);
  mesh.materials.append(material);
  if (o.smooth) mesh.shade_smooth();
  return place(bpy, name, mesh, o.at ?? [0, 0, 0], o.parent);
}

export interface SlabOptions {
  at?: Vec3;
  parent?: ModelObject;
  rotation?: Vec3;
  /** The rims (top and bottom edges) rounded by this radius (m). */
  edge?: number;
  edgeSegments?: number;
  /** Segments of each plan corner. */
  cornerSegments?: number;
  uv?: boolean;
}

/**
 * A slab `size` (x, y, z), its plan a rectangle with corners rounded by `corner`
 * (m), its rims softened by `edge`: a phone, a laptop, a desk mat, a foot.
 * Its base is at z = 0 of its own space.
 */
export function slab(
  bpy: Bpy,
  name: string,
  size: Vec3,
  corner: number,
  material: ModelMaterial,
  o: SlabOptions = {},
): ModelObject {
  const [w, d, h] = size;
  const r = Math.min(corner, w / 2 - 1e-5, d / 2 - 1e-5);
  const n = o.cornerSegments ?? 10;
  const ring: [number, number][] = [];
  const corners: [number, number, number][] = [
    [w / 2 - r, -d / 2 + r, -90],
    [w / 2 - r, d / 2 - r, 0],
    [-w / 2 + r, d / 2 - r, 90],
    [-w / 2 + r, -d / 2 + r, 180],
  ];
  for (const [cx, cy, start] of corners)
    for (let i = 0; i <= n; i++) {
      const a = deg(start + (90 * i) / n);
      ring.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  const k = ring.length;
  const vertices: Vec3[] = [
    ...ring.map(([x, y]) => [x, y, 0] as Vec3),
    ...ring.map(([x, y]) => [x, y, h] as Vec3),
  ];
  const faces: number[][] = [
    [...Array(k).keys()].reverse(),
    [...Array(k).keys()].map((i) => i + k),
    ...[...Array(k).keys()].map((i) => [
      i,
      (i + 1) % k,
      ((i + 1) % k) + k,
      i + k,
    ]),
  ];
  const mesh = bpy.data.meshes.new(name);
  mesh.from_pydata(vertices, [], faces);
  mesh.materials.append(material);
  if (o.uv) metreUvs(mesh);
  mesh.shade_smooth();
  mesh.set_sharp_from_angle(deg(50));
  const object = place(bpy, name, mesh, o.at ?? [0, 0, 0], o.parent);
  if (o.rotation) object.rotation_euler = o.rotation;
  const edge = Math.min(o.edge ?? 0, h / 2 - 1e-5);
  if (edge > 0) {
    const bevel = object.modifiers.new("Round", "BEVEL");
    bevel.width = edge;
    bevel.segments = o.edgeSegments ?? 3;
    bevel.limit_method = "ANGLE";
    bevel.angle_limit = deg(60);
    object.modifiers.new("Normals", "WEIGHTED_NORMAL").keep_sharp = true;
  }
  return object;
}

export interface PlateOptions {
  at?: Vec3;
  parent?: ModelObject;
  rotation?: Vec3;
  /** Grid segments across and up. */
  segments?: [number, number];
  /** How square its corners are: 2 is an ellipse, higher is squarer. */
  squareness?: number;
  /** The radius it wraps round, about its vertical axis (m): it bows towards -y. Infinity for flat. */
  wrap?: number;
  /** A second bow, about its horizontal axis (m): a backrest's lumbar curve. */
  bow?: number;
  /** Its thickness (m), made by the Solidify modifier. */
  thickness?: number;
  uv?: boolean;
}

/**
 * A plate in the x-z plane, `width` across and `height` up, its outline a
 * superellipse (a rounded rectangle), wrapped round a vertical axis and given a
 * thickness: a chair's back, a seat shell, a curved panel.
 */
export function plate(
  bpy: Bpy,
  name: string,
  width: number,
  height: number,
  material: ModelMaterial,
  o: PlateOptions = {},
): ModelObject {
  const [nx, nz] = o.segments ?? [24, 24];
  const n = o.squareness ?? 5;
  const wrap = o.wrap ?? Infinity;
  const bow = o.bow ?? Infinity;
  const vertices: Vec3[] = [];
  for (let j = 0; j <= nz; j++)
    for (let i = 0; i <= nx; i++) {
      const u = (2 * i) / nx - 1;
      const v = (2 * j) / nz - 1;
      // The square's point pushed onto the superellipse along its ray: the outline rounds, the inside follows.
      const m = Math.max(Math.abs(u), Math.abs(v));
      const s =
        m === 0 ? 0 : m / (Math.abs(u) ** n + Math.abs(v) ** n) ** (1 / n);
      const x = (u * s * width) / 2;
      const z = (v * s * height) / 2;
      const y =
        (Number.isFinite(wrap) ? -(x * x) / (2 * wrap) : 0) +
        (Number.isFinite(bow) ? -(z * z) / (2 * bow) : 0);
      vertices.push([x, -y, z]);
    }
  const faces: number[][] = [];
  for (let j = 0; j < nz; j++)
    for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i;
      faces.push([a, a + nx + 1, a + nx + 2, a + 1]);
    }
  const mesh = bpy.data.meshes.new(name);
  mesh.from_pydata(vertices, [], faces);
  mesh.materials.append(material);
  if (o.uv) metreUvs(mesh);
  mesh.shade_smooth();
  const object = place(bpy, name, mesh, o.at ?? [0, 0, 0], o.parent);
  if (o.rotation) object.rotation_euler = o.rotation;
  if ((o.thickness ?? 0) > 0) {
    const solidify = object.modifiers.new("Thickness", "SOLIDIFY");
    solidify.thickness = o.thickness ?? 0;
    solidify.offset = 0;
    solidify.use_even_offset = true;
  }
  return object;
}

/** A tapered bar from `a` to `b`: a rounded box whose section shrinks from `ra` to `rb` (half sizes across, up). */
export function strut(
  bpy: Bpy,
  name: string,
  a: Vec3,
  b: Vec3,
  ra: [number, number],
  rb: [number, number],
  material: ModelMaterial,
  o: { parent?: ModelObject; radius?: number } = {},
): ModelObject {
  const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const len = Math.hypot(...d);
  const f: Vec3 = [d[0] / len, d[1] / len, d[2] / len];
  // A side vector level with the floor, and the up vector square to both.
  let s: Vec3 = [-f[1], f[0], 0];
  const sl = Math.hypot(...s);
  s = sl < 1e-6 ? [1, 0, 0] : [s[0] / sl, s[1] / sl, 0];
  const u: Vec3 = [
    f[1] * s[2] - f[2] * s[1],
    f[2] * s[0] - f[0] * s[2],
    f[0] * s[1] - f[1] * s[0],
  ];
  const at = (p: Vec3, w: number, h: number, sx: number, sy: number): Vec3 => [
    p[0] + s[0] * w * sx + u[0] * h * sy,
    p[1] + s[1] * w * sx + u[1] * h * sy,
    p[2] + s[2] * w * sx + u[2] * h * sy,
  ];
  const vertices: Vec3[] = [];
  for (const [p, [w, h]] of [
    [a, ra],
    [b, rb],
  ] as const)
    for (const [sx, sy] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ] as const)
      vertices.push(at(p, w, h, sx, sy));
  const object = solid(
    bpy,
    name,
    vertices,
    [
      [0, 1, 2, 3],
      [4, 7, 6, 5],
      [0, 4, 5, 1],
      [1, 5, 6, 2],
      [2, 6, 7, 3],
      [3, 7, 4, 0],
    ],
    material,
    { parent: o.parent, smooth: true },
  );
  const r = Math.min(o.radius ?? 0, ...ra, ...rb) * 0.999;
  if (r > 0) {
    const bevel = object.modifiers.new("Round", "BEVEL");
    bevel.width = r;
    bevel.segments = 3;
    bevel.limit_method = "NONE";
    object.modifiers.new("Normals", "WEIGHTED_NORMAL").keep_sharp = true;
  }
  return object;
}
