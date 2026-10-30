// Keycap legends: what is printed on each key (key-tops.ts), as a thin decal just over its top, drawn from an
// atlas of the legends (assets/media/textures/keycap-legends/, made by scripts/keycap-legends.ts from the same tables).
import type {
  Bpy,
  ModelMaterial,
  ModelObject,
  Vec3,
} from "@allyhub-next/model";
import { ShaderNodeBsdfPrincipled } from "@allyhub-next/model";
import { cellName, type KeyTop, type LegendStyle } from "./key-tops.ts";

/** The atlas: its size in px and each cell, by `cellName`. */
export interface LegendAtlas {
  size: readonly number[];
  cells: Readonly<Record<string, readonly number[]>>;
}

/**
 * The legends of `keys` as one mesh of quads just over their tops, each showing its cell of the atlas,
 * under `parent` in the keys' own space. Keys whose legend is blank get none.
 */
export function legendDecals(
  bpy: Bpy,
  name: string,
  style: LegendStyle,
  keys: readonly KeyTop[],
  /** The height of the decals over the keys' own space. */
  z: number,
  atlas: LegendAtlas,
  image: string,
  parent: ModelObject,
): ModelObject | null {
  const v: Vec3[] = [];
  const f: number[][] = [];
  const uvs: [number, number][] = [];
  const [W = 1, H = 1] = atlas.size;
  for (const k of keys) {
    if (!k.legend) continue;
    const cell = atlas.cells[cellName(style, k.legend, k.w / k.h, k.accent)];
    if (!cell)
      throw new Error(
        `The keycap atlas has no ${cellName(style, k.legend, k.w / k.h, k.accent)}: run scripts/keycap-legends.ts.`,
      );
    const [x = 0, y = 0, cw = 0, ch = 0] = cell;
    const b = v.length;
    const hx = k.w / 2;
    const hy = k.h / 2;
    v.push(
      [k.cx - hx, k.cy - hy, z],
      [k.cx + hx, k.cy - hy, z],
      [k.cx + hx, k.cy + hy, z],
      [k.cx - hx, k.cy + hy, z],
    );
    f.push([b, b + 1, b + 2, b + 3]);
    // Image rows run down from the top; UVs up from the bottom.
    uvs.push(
      [x / W, 1 - (y + ch) / H],
      [(x + cw) / W, 1 - (y + ch) / H],
      [(x + cw) / W, 1 - y / H],
      [x / W, 1 - y / H],
    );
  }
  if (f.length === 0) return null;
  const mesh = bpy.data.meshes.new(name);
  mesh.from_pydata(v, [], f);
  const layer = mesh.uv_layers.new("Legends", false);
  // One corner a vertex here: each quad's corners in the order its vertices were given.
  for (let i = 0; i < uvs.length; i++) {
    const corner = layer.data[i];
    const uv = uvs[i];
    if (corner && uv) corner.uv = uv;
  }
  mesh.materials.append(legendMaterial(bpy, name, image));
  const object = bpy.data.objects.new(name, mesh);
  bpy.context.collection.objects.link(object);
  object.parent = parent;
  return object;
}

/** The legends' material: the atlas's colour and alpha, a little gloss, as printed or etched legends are. */
function legendMaterial(bpy: Bpy, name: string, image: string): ModelMaterial {
  const made = bpy.data.materials.new(name);
  made.use_nodes = true;
  const tree = made.node_tree;
  const node = tree?.nodes.get("Principled BSDF");
  if (!tree || !(node instanceof ShaderNodeBsdfPrincipled))
    throw new Error(`${name} has no Principled BSDF.`);
  node.inputs.Roughness.default_value = 0.5;
  node.inputs.Metallic.default_value = 0;
  const texture = tree.nodes.new("ShaderNodeTexImage");
  texture.image = bpy.data.images.load(image, true);
  tree.links.new(texture.outputs.Color, node.inputs["Base Color"]);
  tree.links.new(texture.outputs.Alpha, node.inputs.Alpha);
  return made;
}
