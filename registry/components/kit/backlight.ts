// A keyboard's backlight, shared by keyboard.ts and laptop.ts: the legends lit from behind (their atlas's
// alpha masks the glow, so only the printed shapes shine) and the light that spills round each key's skirt
// onto the deck or the case top under it. Both are emissive finishes in nits; nothing here runs unless a
// backlight is asked for, so a board without one is built exactly as before.
import {
  ModelMesh,
  ShaderNodeBsdfPrincipled,
  type Bpy,
  type ModelMaterial,
  type ModelObject,
  type Vec3,
} from "@allyhub-next/model";
import { finish, linear, mm } from "./parts.ts";

export interface Backlight {
  /**
   * sRGB hex, or several spread left to right across the keys in equal bands (a gaming board's
   * RGB wave: each key takes the band its centre falls in).
   */
  color: string | readonly string[];
  /** The glow's strength in nits: some 20 to 60 for an office board's white, 60 to 150 for a gaming board's RGB. */
  strength: number;
  /** Whether the legends shine through (default true). */
  legends?: boolean;
  /** How far the light spills round each key's foot (m, default 1 mm); 0 for none. */
  spill?: number;
}

export const BACKLIGHT_DEFAULTS = { legends: true, spill: mm(1) };

/** A key's footprint as the light sees it: its centre and its size at the deck. */
export interface KeyFoot {
  cx: number;
  cy: number;
  w: number;
  h: number;
}

const colours = (light: Backlight): readonly string[] =>
  typeof light.color === "string" ? [light.color] : light.color;

/** Which band of `n` a key centred at `x` takes, the keys spanning `lo` to `hi`. */
function band(x: number, lo: number, hi: number, n: number): number {
  if (n <= 1 || hi <= lo) return 0;
  return Math.min(n - 1, Math.max(0, Math.floor(((x - lo) / (hi - lo)) * n)));
}

/** Each band's glow: a dark surface that emits the band's colour. */
function glows(bpy: Bpy, name: string, light: Backlight): ModelMaterial[] {
  return colours(light).map((c, i) =>
    finish(bpy, `${name}.${String(i)}`, {
      color: "#0b0b0c",
      roughness: 0.6,
      emission: { color: c, strength: light.strength },
    }),
  );
}

/**
 * The spill: a thin quad under each key, `spill` wider than its foot each side, at `z` in the keys' own
 * space (the deck's or the case top's height), so the light shows only in the gaps between the keys.
 * Returns null when the backlight spills nothing.
 */
export function backlightSpill(
  bpy: Bpy,
  name: string,
  keys: readonly KeyFoot[],
  z: number,
  light: Backlight,
  parent: ModelObject,
): ModelObject | null {
  const spill = light.spill ?? BACKLIGHT_DEFAULTS.spill;
  if (spill <= 0 || keys.length === 0) return null;
  const lo = Math.min(...keys.map((k) => k.cx));
  const hi = Math.max(...keys.map((k) => k.cx));
  const materials = glows(bpy, name, light);
  const v: Vec3[] = [];
  const f: number[][] = [];
  const bands: number[] = [];
  for (const k of keys) {
    const b = v.length;
    const x = k.w / 2 + spill;
    const y = k.h / 2 + spill;
    v.push(
      [k.cx - x, k.cy - y, z],
      [k.cx + x, k.cy - y, z],
      [k.cx + x, k.cy + y, z],
      [k.cx - x, k.cy + y, z],
    );
    f.push([b, b + 1, b + 2, b + 3]);
    bands.push(band(k.cx, lo, hi, materials.length));
  }
  const mesh = bpy.data.meshes.new(name);
  mesh.from_pydata(v, [], f);
  for (const m of materials) mesh.materials.append(m);
  mesh.polygons.forEach((p, i) => {
    p.material_index = bands[i] ?? 0;
  });
  const object = bpy.data.objects.new(name, mesh);
  bpy.context.collection.objects.link(object);
  object.parent = parent;
  return object;
}

/**
 * Lights the legend decals `legends` made by legends.ts (their atlas `image`): the first band's glow is
 * set on the decals' own material, each other band gets a copy of it, and every legend takes its band.
 */
export function backlightLegends(
  bpy: Bpy,
  legends: ModelObject | null,
  image: string,
  light: Backlight,
): void {
  if (!legends || !(light.legends ?? BACKLIGHT_DEFAULTS.legends)) return;
  const mesh = legends.data;
  if (!(mesh instanceof ModelMesh)) return;
  const own = mesh.materials.at(0);
  if (!own) return;
  const list = colours(light);
  const lit = (m: ModelMaterial, c: string): void => {
    const node = m.node_tree?.nodes.get("Principled BSDF");
    if (!(node instanceof ShaderNodeBsdfPrincipled))
      throw new Error(`${m.name} has no Principled BSDF.`);
    node.inputs["Emission Color"].default_value = [...linear(c), 1];
    node.inputs["Emission Strength"].default_value = light.strength;
  };
  lit(own, list[0] ?? "#ffffff");
  for (let i = 1; i < list.length; i++) {
    const copy = bpy.data.materials.new(`${own.name}.${String(i)}`);
    copy.use_nodes = true;
    const tree = copy.node_tree;
    const node = tree?.nodes.get("Principled BSDF");
    if (!tree || !(node instanceof ShaderNodeBsdfPrincipled))
      throw new Error(`${copy.name} has no Principled BSDF.`);
    node.inputs.Roughness.default_value = 0.5;
    node.inputs.Metallic.default_value = 0;
    const texture = tree.nodes.new("ShaderNodeTexImage");
    texture.image = bpy.data.images.load(image, true);
    tree.links.new(texture.outputs.Color, node.inputs["Base Color"]);
    tree.links.new(texture.outputs.Alpha, node.inputs.Alpha);
    lit(copy, list[i] ?? "#ffffff");
    mesh.materials.append(copy);
  }
  if (list.length < 2) return;
  // Each decal's centre across, from its four corners.
  const xs = mesh.polygons.map(
    (p) =>
      p.vertices.reduce((s, i) => s + (mesh.vertices[i]?.co[0] ?? 0), 0) /
      p.vertices.length,
  );
  const lo = Math.min(...xs);
  const hi = Math.max(...xs);
  mesh.polygons.forEach((p, i) => {
    p.material_index = band(xs[i] ?? 0, lo, hi, list.length);
  });
}
