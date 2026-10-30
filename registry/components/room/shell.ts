// A room's shell: floor, walls with a window, ceiling, skirting and a window frame.
import * as THREE from "three";
import type { SceneryHost } from "@allyhub-next/scenery-host/layer";
import { plain, surface, TEXTURES, type Texture } from "./surfaces.ts";

/**
 * Y up, metres. The room spans x from -width/2 to width/2 and z from `front` to
 * `back` (front < back), the floor at 0. Walls are solid boxes outside that
 * box, so the room is closed and the bake's rays leave only through the window.
 */
export interface ShellOptions {
  width: number;
  front: number;
  back: number;
  height: number;
  /** Paint over the plaster texture; every wall takes it. */
  paint: THREE.ColorRepresentation;
  /** The ceiling's flat paint. */
  ceiling: THREE.ColorRepresentation;
  floor: Texture;
  /**
   * A window in the left wall (x = -width/2): its centre along z, its width,
   * its sill's height, its height and how far its roller blind is down (a share
   * of its height). Null for none.
   */
  window: {
    z: number;
    width: number;
    sill: number;
    height: number;
    blind: number;
  } | null;
  wallThickness: number;
  skirting: { height: number; depth: number; color: THREE.ColorRepresentation };
  frame: { width: number; depth: number; color: THREE.ColorRepresentation };
}

/**
 * A spare bedroom made a studio: 3.6 × 2.9 m with a 2.6 m ceiling (between the US's
 * 8 and 9 ft; ), the window in the wall to the
 * person's left so its light falls on their face from the side.
 */
export const SHELL_DEFAULTS: ShellOptions = {
  width: 3.6,
  front: -1.1,
  back: 1.8,
  height: 2.6,
  paint: "#f2efe9",
  ceiling: "#f3f2ee",
  floor: TEXTURES.laminate,
  window: { z: -0.45, width: 1.2, sill: 0.85, height: 1.3, blind: 0.3 },
  wallThickness: 0.12,
  skirting: { height: 0.08, depth: 0.012, color: "#f4f3ef" },
  frame: { width: 0.06, depth: 0.07, color: "#f4f4f2" },
};

function slab(
  name: string,
  size: [number, number, number],
  at: [number, number, number],
  material: THREE.Material,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...at);
  return mesh;
}

/** Builds the shell into a group named `room` and returns it. */
export async function shell(
  w: SceneryHost,
  over: Partial<ShellOptions> = {},
): Promise<THREE.Group> {
  const o = { ...SHELL_DEFAULTS, ...over };
  const room = new THREE.Group();
  room.name = "room";
  const t = o.wallThickness;
  const depth = o.back - o.front;
  const midZ = (o.front + o.back) / 2;
  const half = o.width / 2;

  const floor = await surface(w, o.floor, {
    size: [o.width, depth],
    roughness: 1,
  });
  const ceiling = plain(o.ceiling, 0.9);
  const wall = (width: number, height: number) =>
    surface(w, TEXTURES.plaster, {
      size: [width, height],
      paint: o.paint,
      normalScale: 0.5,
    });

  room.add(
    slab(
      "floor",
      [o.width + 2 * t, t, depth + 2 * t],
      [0, -t / 2, midZ],
      floor,
    ),
  );
  room.add(
    slab(
      "ceiling",
      [o.width + 2 * t, t, depth + 2 * t],
      [0, o.height + t / 2, midZ],
      ceiling,
    ),
  );
  room.add(
    slab(
      "wall-front",
      [o.width, o.height, t],
      [0, o.height / 2, o.front - t / 2],
      await wall(o.width, o.height),
    ),
  );
  room.add(
    slab(
      "wall-back",
      [o.width, o.height, t],
      [0, o.height / 2, o.back + t / 2],
      await wall(o.width, o.height),
    ),
  );
  room.add(
    slab(
      "wall-right",
      [t, o.height, depth],
      [half + t / 2, o.height / 2, midZ],
      await wall(depth, o.height),
    ),
  );

  // The left wall, in pieces round the window's opening.
  const x = -half - t / 2;
  const left = await wall(depth, o.height);
  if (!o.window) {
    room.add(
      slab("wall-left", [t, o.height, depth], [x, o.height / 2, midZ], left),
    );
  } else {
    const win = o.window;
    const z0 = win.z - win.width / 2;
    const z1 = win.z + win.width / 2;
    const top = win.sill + win.height;
    room.add(
      slab(
        "wall-left-below",
        [t, win.sill, depth],
        [x, win.sill / 2, midZ],
        left,
      ),
    );
    room.add(
      slab(
        "wall-left-above",
        [t, o.height - top, depth],
        [x, (top + o.height) / 2, midZ],
        left,
      ),
    );
    room.add(
      slab(
        "wall-left-front",
        [t, win.height, z0 - o.front],
        [x, win.sill + win.height / 2, (o.front + z0) / 2],
        left,
      ),
    );
    room.add(
      slab(
        "wall-left-back",
        [t, win.height, o.back - z1],
        [x, win.sill + win.height / 2, (z1 + o.back) / 2],
        left,
      ),
    );

    // The frame: four members round the opening, flush with the room's face, and a sill board.
    const paint = plain(o.frame.color, 0.45);
    const f = o.frame.width;
    const fx = -half - o.frame.depth / 2 + 0.01;
    const frame = new THREE.Group();
    frame.name = "window";
    frame.add(
      slab(
        "window-head",
        [o.frame.depth, f, win.width + 2 * f],
        [fx, top + f / 2, win.z],
        paint,
      ),
    );
    frame.add(
      slab(
        "window-foot",
        [o.frame.depth, f, win.width + 2 * f],
        [fx, win.sill - f / 2, win.z],
        paint,
      ),
    );
    frame.add(
      slab(
        "window-jamb-front",
        [o.frame.depth, win.height, f],
        [fx, win.sill + win.height / 2, z0 - f / 2],
        paint,
      ),
    );
    frame.add(
      slab(
        "window-jamb-back",
        [o.frame.depth, win.height, f],
        [fx, win.sill + win.height / 2, z1 + f / 2],
        paint,
      ),
    );
    // A mullion and a transom: a two-light casement.
    frame.add(
      slab(
        "window-mullion",
        [0.05, win.height, 0.05],
        [-half - 0.06, win.sill + win.height / 2, win.z],
        paint,
      ),
    );
    frame.add(
      slab(
        "window-sill",
        [0.2, 0.025, win.width + 0.14],
        [-half + 0.04, win.sill - f - 0.0125, win.z],
        plain("#f6f5f2", 0.35),
      ),
    );
    // The roller blind: its case under the head, and the fabric down to `blind` of the opening.
    if (win.blind > 0) {
      const fabric = plain("#e9e4da", 0.95);
      const drop = win.height * win.blind;
      frame.add(
        slab(
          "window-blind-case",
          [0.07, 0.07, win.width + 0.04],
          [-half + 0.04, top - 0.035, win.z],
          plain("#f4f4f2", 0.4),
        ),
      );
      frame.add(
        slab(
          "window-blind",
          [0.004, drop, win.width - 0.02],
          [-half + 0.05, top - 0.07 - drop / 2, win.z],
          fabric,
        ),
      );
      frame.add(
        slab(
          "window-blind-bar",
          [0.02, 0.025, win.width - 0.02],
          [-half + 0.05, top - 0.07 - drop, win.z],
          plain("#d8d4cc", 0.5),
        ),
      );
    }
    room.add(frame);
  }

  // Skirting along the walls (none under the window, which is above the floor anyway).
  const skirt = plain(o.skirting.color, 0.5);
  const s = o.skirting;
  room.add(
    slab(
      "skirting-front",
      [o.width, s.height, s.depth],
      [0, s.height / 2, o.front + s.depth / 2],
      skirt,
    ),
  );
  room.add(
    slab(
      "skirting-back",
      [o.width, s.height, s.depth],
      [0, s.height / 2, o.back - s.depth / 2],
      skirt,
    ),
  );
  room.add(
    slab(
      "skirting-left",
      [s.depth, s.height, depth - 2 * s.depth],
      [-half + s.depth / 2, s.height / 2, midZ],
      skirt,
    ),
  );
  room.add(
    slab(
      "skirting-right",
      [s.depth, s.height, depth - 2 * s.depth],
      [half - s.depth / 2, s.height / 2, midZ],
      skirt,
    ),
  );
  return room;
}
