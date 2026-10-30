// Surfaces from Poly Haven textures, sized to the surface they cover.
import * as THREE from "three";
import type { SceneryHost } from "@allyhub-next/scenery-host/layer";

/**
 * A Poly Haven texture fetched with `allyhub add @polyhaven/<id> --res <res>`: its id, the
 * surface one tile of it covers in metres (the search lists it) and its
 * resolution: 2k where a camera comes close (the desk's wood), 1k behind.
 */
export interface Texture {
  id: string;
  covers: [number, number];
  res?: string;
}

export const TEXTURES = {
  plaster: { id: "beige_wall_001", covers: [3, 3], res: "1k" },
  laminate: { id: "laminate_floor_02", covers: [1.7, 1.7], res: "1k" },
  oak: { id: "oak_veneer_01", covers: [1.83, 1.83] },
  walnut: { id: "american_walnut_veneer", covers: [1, 1] },
} satisfies Record<string, Texture>;

export interface SurfaceOptions {
  /**
   * The surface's width and height in metres: the tile repeats to keep its real
   * size over UVs that run 0 to 1. "metres" for UVs that are in metres already
   * (the kit's models: a cube projection of size 1).
   */
  size: [number, number] | "metres";
  /** Multiplies the texture's colour (a paint over plaster, a stain over wood). */
  tint?: THREE.ColorRepresentation;
  /** Turns the texture a quarter turn (grain along the other side). */
  turn?: boolean;
  roughness?: number;
  normalScale?: number;
  /** Paint over it: the texture's colour is dropped and this flat colour taken, its relief and roughness kept. */
  paint?: THREE.ColorRepresentation;
}

const cache = new Map<string, Promise<THREE.Texture>>();

function map(
  w: SceneryHost,
  path: string,
  data: boolean,
): Promise<THREE.Texture> {
  const key = `${path}|${String(data)}`;
  let made = cache.get(key);
  if (!made) {
    made = w.texture(path, data ? { colorSpace: "linear" } : {});
    cache.set(key, made);
  }
  return made;
}

/** A MeshStandardMaterial of a texture's diffuse, normal and roughness maps at its real scale. */
export async function surface(
  w: SceneryHost,
  texture: Texture,
  options: SurfaceOptions,
): Promise<THREE.MeshStandardMaterial> {
  const res = texture.res ?? "2k";
  const base = `assets/media/textures/${texture.id}/${texture.id}`;
  // A painted surface takes no colour from the texture, so its colour map is never read (nor fetched).
  const [diffuse, normal, rough] = await Promise.all([
    options.paint === undefined
      ? map(w, `${base}_diffuse_${res}.jpg`, false)
      : undefined,
    map(w, `${base}_normal_${res}.jpg`, true),
    map(w, `${base}_rough_${res}.jpg`, true),
  ]);
  const [width, height] = options.size === "metres" ? [1, 1] : options.size;
  const repeat = new THREE.Vector2(
    width / texture.covers[0],
    height / texture.covers[1],
  );
  const placed = [diffuse, normal, rough].map((t) => {
    if (!t) return null;
    const c = t.clone();
    c.wrapS = c.wrapT = THREE.RepeatWrapping;
    c.repeat.copy(
      options.turn ? new THREE.Vector2(repeat.y, repeat.x) : repeat,
    );
    if (options.turn) c.rotation = Math.PI / 2;
    c.anisotropy = 8;
    c.needsUpdate = true;
    return c;
  });
  const material = new THREE.MeshStandardMaterial({
    map: options.paint === undefined ? placed[0] : null,
    normalMap: placed[1],
    roughnessMap: placed[2],
    roughness: options.roughness ?? 1,
    color: options.paint ?? options.tint ?? "#ffffff",
  });
  material.normalScale.setScalar(options.normalScale ?? 1);
  material.name = texture.id;
  return material;
}

/** A plain painted or plastic surface. */
export function plain(
  color: THREE.ColorRepresentation,
  roughness: number,
  metalness = 0,
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}
