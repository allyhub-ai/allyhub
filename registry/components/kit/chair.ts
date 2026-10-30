// A mesh office chair on a five-star base, after the Herman Miller Aeron size B: a
// seat of stretched mesh in a frame, wider at its front and falling over its front
// edge; a back of mesh in a frame loop, narrow where it meets the seat and widest
// just below its top (its outline traced from the official front photo), with its
// lumbar curve and the Y-shaped lumbar support behind it; the mesh see-through, a
// picture of strands with the gaps open; fixed arms whose cast supports curve up from
// behind the seat to the pads; the tilt mechanism with a lever out to each side; and a
// cast base with twin-wheel casters. Its published sizes: seat height 0.38 to 0.58 m,
// seat depth 432 mm, arms 216 mm over the seat, 719 mm wide without arms (the base);
// the rest is measured from its official photos at that scale. In popular demo videos,
// chairs: median 0.6 × 0.6 × 0.9 m, 0.3 m behind the person's feet.
import {
  ShaderNodeBsdfPrincipled,
  type Bpy,
  type ModelMaterial,
  type ModelObject,
  type Vec3,
} from "@allyhub-next/model";
import {
  box,
  cylinder,
  deg,
  finish,
  group,
  lathe,
  mm,
  slab,
  strut,
  type Finish,
} from "./parts.ts";

export interface ChairOptions {
  /** The seat's top above the floor (m): 0.38 to 0.58 on the reference chair. */
  seatHeight: number;
  /** The seat: its width at the front, its depth (m), and its width at the back as a share of the front's. */
  seat: [number, number];
  seatTaper: number;
  /** How far the seat's front edge falls over (m), and how far its back edge rises (m). */
  waterfall: number;
  seatRise: number;
  /** The back: its widest width and its height (m), its recline (degrees). */
  back: [number, number];
  recline: number;
  /**
   * The back's outline: its width as a share of the widest at places up it, 0 where it
   * meets the seat and 1 at its top, in order; between them it is interpolated.
   */
  backOutline: [number, number][];
  /** How far the back's lumbar curve comes forward (m), and how far its sides wrap forward (m). */
  lumbar: number;
  backWrap: number;
  /** The frame round the seat and the back: its width and its thickness (m). */
  rim: [number, number];
  /**
   * The mesh: the share of light it lets through, its strands in one tile of the picture,
   * and the tile's size (m).
   */
  meshOpen: number;
  meshStrands: number;
  meshTile: number;
  /** The armrests' pads above the seat (m); 0 for none. Their pads: width, length, thickness (m). */
  arms: number;
  armPad: [number, number, number];
  /**
   * The cast arm under each pad: its section (width, depth, m), how far forward of its
   * root behind the seat it rises to the pad (m), and how far the pad runs on forward
   * of that (m).
   */
  armBar: [number, number];
  armReach: number;
  padAhead: number;
  /** The base's diameter to its casters' centres (m) and a caster's wheel diameter (m). */
  base: number;
  caster: number;
  /** Which way the chair is turned on its column (degrees). */
  swivel: number;
  mesh: Finish;
  frame: Finish;
}

export const CHAIR_DEFAULTS: ChairOptions = {
  seatHeight: 0.47,
  seat: [mm(500), mm(432)],
  seatTaper: 0.8,
  waterfall: mm(30),
  seatRise: mm(18),
  back: [mm(520), mm(510)],
  recline: 12,
  // Traced from the front photo at the base's scale: straight-sided below the lumbar,
  // flaring to its widest at 80% of its height, then over flat shoulders to a short flat top.
  backOutline: [
    [0, 0.75],
    [0.3, 0.75],
    [0.4, 0.76],
    [0.5, 0.815],
    [0.6, 0.887],
    [0.7, 0.955],
    [0.8, 1],
    [0.85, 0.99],
    [0.9, 0.944],
    [0.95, 0.83],
    [0.98, 0.64],
    [1, 0.48],
  ],
  lumbar: mm(25),
  backWrap: mm(35),
  rim: [mm(30), mm(22)],
  meshOpen: 0.5,
  meshStrands: 12,
  meshTile: mm(40),
  arms: mm(216),
  armPad: [mm(95), mm(280), mm(34)],
  armBar: [mm(28), mm(40)],
  armReach: mm(120),
  padAhead: mm(170),
  base: mm(640),
  caster: mm(65),
  swivel: 0,
  mesh: { color: "#2e2f32", roughness: 0.9 },
  frame: { color: "#1c1c1e", roughness: 0.5 },
};

/** The chair under an empty at `at` (the floor under its column), its front towards -y. */
export function chair(
  bpy: Bpy,
  at: Vec3,
  over: Partial<ChairOptions> = {},
  parent?: ModelObject,
): ModelObject {
  const o = { ...CHAIR_DEFAULTS, ...over };
  const root = group(bpy, "Chair", at, parent);
  const frame = finish(bpy, "ChairFrame", o.frame);
  const mesh = weave(bpy, "ChairMesh", o.mesh, o.meshOpen, o.meshStrands);

  // The base: a hub, five legs falling to the casters, and the casters.
  const hubZ = mm(110);
  const wheel = o.caster;
  const tipZ = wheel + mm(16);
  cylinder(bpy, "ChairHub", mm(36), mm(60), frame, {
    parent: root,
    at: [0, 0, hubZ],
    radius: mm(5),
  });
  for (let i = 0; i < 5; i++) {
    const a = deg(90 + i * 72);
    const tip: Vec3 = [
      Math.cos(a) * (o.base / 2),
      Math.sin(a) * (o.base / 2),
      tipZ,
    ];
    const from: Vec3 = [
      Math.cos(a) * mm(25),
      Math.sin(a) * mm(25),
      hubZ - mm(4),
    ];
    // A cast leg: wide and flat-topped at the hub, narrowing to its caster.
    strut(
      bpy,
      `ChairLeg.${String(i)}`,
      from,
      tip,
      [mm(24), mm(17)],
      [mm(15), mm(11)],
      frame,
      { parent: root, radius: mm(6) },
    );
    // A twin-wheel caster: its housing, and two wheels on its axle.
    const caster = group(
      bpy,
      `ChairCaster.${String(i)}`,
      [tip[0], tip[1], 0],
      root,
    );
    caster.rotation_euler = [0, 0, a];
    box(
      bpy,
      `ChairCasterHousing.${String(i)}`,
      [mm(36), mm(44), mm(32)],
      frame,
      { parent: caster, at: [mm(4), 0, wheel / 2 + mm(10)], radius: mm(10) },
    );
    for (const side of [-1, 1] as const)
      cylinder(
        bpy,
        `ChairWheel.${String(i)}${side > 0 ? "R" : "L"}`,
        wheel / 2,
        mm(15),
        frame,
        {
          parent: caster,
          at: [mm(8), side * mm(14), wheel / 2],
          rotation: [Math.PI / 2, 0, 0],
          radius: mm(4),
          segments: 32,
        },
      );
  }

  // The column turns: everything above the hub is under `turn`.
  const turn = group(bpy, "ChairSwivel", [0, 0, 0], root);
  turn.rotation_euler = [0, 0, deg(o.swivel)];
  const [rimW, rimT] = o.rim;
  const seatTop = o.seatHeight;
  const seatUnder = seatTop - rimT;
  const mechTop = seatUnder - mm(8);
  const mechH = mm(60);
  // A cone over the hub, and the column up into the mechanism.
  lathe(
    bpy,
    "ChairShroud",
    [
      [0, mm(85)],
      [mm(34), mm(85)],
      [mm(30), mm(95)],
      [mm(20), mm(140)],
      [0, mm(140)],
    ],
    frame,
    { parent: root, steps: 40 },
  );
  const columnFrom = mm(135);
  const columnTo = mechTop - mechH + mm(5);
  cylinder(bpy, "ChairColumn", mm(14), columnTo - columnFrom, frame, {
    parent: turn,
    at: [0, 0, (columnFrom + columnTo) / 2],
  });
  // The tilt mechanism under the seat's back half, and a lever out to each side.
  box(bpy, "ChairMechanism", [mm(250), mm(280), mechH], frame, {
    parent: turn,
    at: [0, mm(30), mechTop - mechH / 2],
    radius: mm(12),
  });
  for (const side of [-1, 1] as const) {
    const s = side > 0 ? "R" : "L";
    cylinder(bpy, `ChairLever.${s}`, mm(8), mm(110), frame, {
      parent: turn,
      at: [side * mm(170), mm(-60), mechTop - mechH / 2],
      rotation: [0, Math.PI / 2, 0],
    });
    cylinder(bpy, `ChairLeverKnob.${s}`, mm(15), mm(45), frame, {
      parent: turn,
      at: [side * mm(235), mm(-60), mechTop - mechH / 2],
      rotation: [0, Math.PI / 2, 0],
      radius: mm(5),
    });
  }

  // The seat: a frame loop round a stretched mesh, wider at the front, its front edge falling.
  const [sw, sd] = o.seat;
  const seatAt = mm(10);
  const seatLift = (xn: number, t: number): number =>
    o.seatRise * Math.max(0, (0.3 - t) / 0.3) ** 2 -
    o.waterfall * Math.max(0, (t - 0.72) / 0.28) ** 2 +
    mm(10) * xn ** 4;
  // t runs from the seat's back (0) to its front (1): along -y.
  const seatShape: Contour = {
    length: sd,
    width: (t) => sw * (o.seatTaper + (1 - o.seatTaper) * Math.sqrt(t)),
    squareness: 4,
    lift: seatLift,
    place: (x, along, h) => [x, seatAt - along, seatTop - rimT / 2 + h],
  };
  contour(bpy, "ChairSeatFrame", seatShape, frame, {
    parent: turn,
    rim: rimW,
    thickness: rimT,
  });
  contour(bpy, "ChairSeat", seatShape, mesh, {
    parent: turn,
    thickness: 0,
    inset: rimW / 2,
    tile: o.meshTile,
  });

  // The back: a frame loop and its mesh, narrow at the seat and widest near its top,
  // reclined about its bottom edge, just behind the seat's.
  const [bw, bh] = o.back;
  const hingeY = seatAt + sd / 2 + mm(20);
  const hingeZ = seatTop + mm(30);
  const hinge = group(bpy, "ChairBackHinge", [0, hingeY, hingeZ], turn);
  hinge.rotation_euler = [-deg(o.recline), 0, 0];
  const backWidth = (t: number): number => {
    const outline = o.backOutline;
    let share = outline[0]?.[1] ?? 1;
    for (let i = 1; i < outline.length; i++) {
      const [t0, w0] = outline[i - 1] ?? [0, 1];
      const [t1, w1] = outline[i] ?? [1, 1];
      if (t <= t1) {
        // Smooth between the traced places, so the outline has no kinks.
        const k = t1 > t0 ? Math.max(0, (t - t0) / (t1 - t0)) : 1;
        share = w0 + (w1 - w0) * (k * k * (3 - 2 * k));
        break;
      }
      share = w1;
    }
    return bw * share;
  };
  const backLift = (xn: number, t: number): number =>
    -o.backWrap * xn * xn -
    o.lumbar * Math.exp(-(((t - 0.3) / 0.2) ** 2)) +
    mm(30) * Math.max(0, (t - 0.7) / 0.3) ** 2;
  const backShape: Contour = {
    length: bh,
    width: backWidth,
    squareness: Infinity,
    lift: backLift,
    place: (x, along, h) => [x, h, along + bh / 2],
  };
  contour(bpy, "ChairBackFrame", backShape, frame, {
    parent: hinge,
    rim: rimW,
    thickness: rimT,
  });
  contour(bpy, "ChairBack", backShape, mesh, {
    parent: hinge,
    thickness: 0,
    inset: rimW / 2,
    tile: o.meshTile,
  });
  // The lumbar support behind the mesh: a stem from the back's bottom, a pad, and two arms
  // up and out to the frame.
  const behind = (x: number, t: number): Vec3 => [
    x,
    backLift((2 * x) / backWidth(t), t) + mm(16),
    t * bh,
  ];
  const stemFrom = behind(0, 0.04);
  const stemTo = behind(0, 0.3);
  strut(
    bpy,
    "ChairLumbarStem",
    stemFrom,
    stemTo,
    [mm(16), mm(7)],
    [mm(12), mm(7)],
    frame,
    { parent: hinge, radius: mm(3) },
  );
  slab(bpy, "ChairLumbarPad", [mm(110), mm(70), mm(12)], mm(25), frame, {
    parent: hinge,
    at: [0, stemTo[1] + mm(4), stemTo[2]],
    rotation: [Math.PI / 2, 0, 0],
    edge: mm(4),
  });
  for (const side of [-1, 1] as const) {
    const t = 0.62;
    strut(
      bpy,
      `ChairLumbarArm.${side > 0 ? "R" : "L"}`,
      behind(side * mm(30), 0.36),
      behind((side * backWidth(t)) / 2 - side * rimW, t),
      [mm(13), mm(6)],
      [mm(9), mm(6)],
      frame,
      { parent: hinge, radius: mm(3) },
    );
  }
  // The back's two side arms down to the pivots at the seat's sides, and the spine
  // from the mechanism up to the back's bottom.
  const cosR = Math.cos(deg(o.recline));
  const sinR = Math.sin(deg(o.recline));
  const fromHinge = ([x, y, z]: Vec3): Vec3 => [
    x,
    hingeY + y * cosR + z * sinR,
    hingeZ - y * sinR + z * cosR,
  ];
  for (const side of [-1, 1] as const) {
    const s = side > 0 ? "R" : "L";
    const t = 0.08;
    const top = fromHinge([
      side * (backWidth(t) / 2 - rimW / 2),
      backLift(side, t) + mm(6),
      t * bh,
    ]);
    const pivot: Vec3 = [
      side * ((sw * o.seatTaper) / 2 + mm(4)),
      seatAt + mm(40),
      seatUnder - mm(18),
    ];
    // Down behind the seat's back edge, then forward under the seat to the pivot.
    const knee: Vec3 = [
      side * ((sw * o.seatTaper) / 2 - mm(6)),
      seatAt + sd / 2 + mm(12),
      seatUnder - mm(30),
    ];
    strut(
      bpy,
      `ChairBackArm.${s}`,
      top,
      knee,
      [mm(11), mm(20)],
      [mm(11), mm(18)],
      frame,
      { parent: turn, radius: mm(5) },
    );
    strut(
      bpy,
      `ChairBackArmLow.${s}`,
      knee,
      pivot,
      [mm(11), mm(18)],
      [mm(11), mm(16)],
      frame,
      { parent: turn, radius: mm(5) },
    );
    cylinder(bpy, `ChairPivot.${s}`, mm(26), mm(16), frame, {
      parent: turn,
      at: [pivot[0] + side * mm(4), pivot[1], pivot[2]],
      rotation: [0, Math.PI / 2, 0],
      radius: mm(4),
    });
  }
  strut(
    bpy,
    "ChairSpine",
    [0, mm(150), mechTop - mm(20)],
    fromHinge([0, backLift(0, 0) + mm(10), mm(10)]),
    [mm(28), mm(12)],
    [mm(24), mm(12)],
    frame,
    { parent: turn, radius: mm(5) },
  );

  // The arms: a cast support from behind the seat's side, forward and curving up to the
  // pad's rear third (a quadratic curve through its corner), and the pad running on forward.
  if (o.arms > 0) {
    const [pw, pl, pt] = o.armPad;
    const [bw2, bd2] = o.armBar;
    for (const side of [-1, 1] as const) {
      const s = side > 0 ? "R" : "L";
      const padX = side * (sw / 2 + mm(30));
      const padZ = seatTop + o.arms - pt;
      const root: Vec3 = [
        side * ((sw * o.seatTaper) / 2 + mm(8)),
        seatAt + sd / 2 - mm(10),
        seatUnder - mm(25),
      ];
      const rise: Vec3 = [padX, root[1] - o.armReach, padZ];
      const bend: Vec3 = [padX, rise[1], root[2]];
      const steps = 6;
      let last = root;
      for (let i = 1; i <= steps; i++) {
        const k = i / steps;
        const p: Vec3 = [0, 1, 2].map(
          (j) =>
            (1 - k) ** 2 * (root[j] ?? 0) +
            2 * (1 - k) * k * (bend[j] ?? 0) +
            k ** 2 * (rise[j] ?? 0),
        ) as Vec3;
        strut(
          bpy,
          `ChairArm.${s}${String(i)}`,
          last,
          p,
          [bw2 / 2, bd2 / 2],
          [bw2 / 2, bd2 / 2],
          frame,
          { parent: turn, radius: mm(6) },
        );
        last = p;
      }
      // The pad: its rear end over the support's root, running forward.
      const padY = rise[1] - o.padAhead + pl / 2;
      slab(bpy, `ChairArmPad.${s}`, [pw, pl, pt], mm(45), frame, {
        parent: turn,
        at: [padX, padY, padZ],
        edge: mm(12),
      });
    }
  }
  return root;
}

/** A curved panel: its outline, the width at each place along it, and how it bends off its plane. */
interface Contour {
  length: number;
  /** Its width at `t`, from 0 at one end to 1 at the other (m). */
  width: (t: number) => number;
  /**
   * How square its corners are: 2 is an ellipse, higher is squarer; Infinity takes the
   * outline from `width` alone, its two ends straight across.
   */
  squareness: number;
  /** Its offset off its plane at a place: `xn` across (-1 to 1) and `t` along (m). */
  lift: (xn: number, t: number) => number;
  /** A point across, along (from its middle) and off its plane, in its parent's space. */
  place: (x: number, along: number, off: number) => Vec3;
}

/**
 * A contour as a mesh: whole, or with `rim` only the loop of that width round its edge
 * (a frame), or with `inset` drawn that much inside its outline; given `thickness`, or a
 * single surface when it is 0. Its UVs are in units of `tile` (m) across and along it.
 */
function contour(
  bpy: Bpy,
  name: string,
  c: Contour,
  material: ModelMaterial,
  o: {
    parent: ModelObject;
    rim?: number;
    inset?: number;
    thickness: number;
    tile?: number;
  },
): ModelObject {
  const n = c.squareness;
  const half = (t: number): number => c.width(Math.min(1, Math.max(0, t))) / 2;
  // How far in from the outline a place `cut` across its edge is: the edge's own slope counts.
  const halfIn = (t: number, cut: number): number => {
    if (cut === 0) return half(t);
    const dt = 0.01;
    const slope = (half(t + dt) - half(t - dt)) / (2 * dt * c.length);
    return Math.max(half(t) - cut * Math.hypot(1, slope), 1e-4);
  };
  // A place of the square [-1, 1]², pushed onto the outline along its ray; `cut` brings it in.
  const at = (u: number, v: number, cut: number): [Vec3, number, number] => {
    const m = Math.max(Math.abs(u), Math.abs(v));
    const s = !Number.isFinite(n)
      ? 1
      : m === 0
        ? 0
        : m / (Math.abs(u) ** n + Math.abs(v) ** n) ** (1 / n);
    const along = v * s * (c.length / 2 - cut);
    const t = along / c.length + 0.5;
    const outer = half(t);
    const x = u * s * halfIn(t, cut);
    return [c.place(x, along, c.lift(outer > 0 ? x / outer : 0, t)), x, along];
  };
  const vertices: Vec3[] = [];
  const flat: [number, number][] = [];
  const faces: number[][] = [];
  const add = (p: [Vec3, number, number]): void => {
    vertices.push(p[0]);
    flat.push([p[1], p[2]]);
  };
  const k = 24;
  if (o.rim) {
    // March round the square's edge; each point once on the outline and once `rim` inside it.
    const edge: [number, number][] = [];
    for (let i = 0; i < k; i++) edge.push([-1 + (2 * i) / k, -1]);
    for (let i = 0; i < k; i++) edge.push([1, -1 + (2 * i) / k]);
    for (let i = 0; i < k; i++) edge.push([1 - (2 * i) / k, 1]);
    for (let i = 0; i < k; i++) edge.push([-1, 1 - (2 * i) / k]);
    const count = edge.length;
    for (const [u, v] of edge) add(at(u, v, 0));
    for (const [u, v] of edge) add(at(u, v, o.rim));
    for (let i = 0; i < count; i++) {
      const j = (i + 1) % count;
      faces.push([i, j, j + count, i + count]);
    }
  } else {
    for (let j = 0; j <= k; j++)
      for (let i = 0; i <= k; i++)
        add(at((2 * i) / k - 1, (2 * j) / k - 1, o.inset ?? 0));
    for (let j = 0; j < k; j++)
      for (let i = 0; i < k; i++) {
        const a = j * (k + 1) + i;
        faces.push([a, a + 1, a + k + 2, a + k + 1]);
      }
  }
  const mesh = bpy.data.meshes.new(name);
  mesh.from_pydata(vertices, [], faces);
  mesh.materials.append(material);
  // One UV a face corner, in the order the faces list their vertices.
  const tile = o.tile ?? 1;
  const layer = mesh.uv_layers.new("UVMap", false);
  let corner = 0;
  for (const face of faces)
    for (const index of face) {
      const place = flat[index];
      const data = layer.data[corner++];
      if (place && data) data.uv = [place[0] / tile, place[1] / tile];
    }
  mesh.shade_smooth();
  const object = bpy.data.objects.new(name, mesh);
  object.parent = o.parent;
  bpy.context.collection.objects.link(object);
  if (o.thickness > 0) {
    const solidify = object.modifiers.new("Thickness", "SOLIDIFY");
    solidify.thickness = o.thickness;
    solidify.offset = 0;
    solidify.use_even_offset = true;
  }
  return object;
}

const weaves = new WeakMap<Bpy, Map<string, ModelMaterial>>();

/**
 * A stretched mesh: strands of `f.color` with the gaps between them open, as a picture
 * with alpha (one tile across `pitch` strands), seen from both sides. `open` is the share
 * of light that passes, as the picture averages from a distance.
 */
function weave(
  bpy: Bpy,
  name: string,
  f: Finish,
  open: number,
  strands: number,
): ModelMaterial {
  let known = weaves.get(bpy);
  if (!known) {
    known = new Map();
    weaves.set(bpy, known);
  }
  const key = `${name}|${JSON.stringify(f)}|${String(open)}|${String(strands)}`;
  const found = known.get(key);
  if (found) return found;
  // Strands nearly opaque, gaps nearly clear: the strand's share of each pitch sets the average.
  const [strand, clear] = [0.96, 0.04];
  const cover = Math.min(1, Math.max(0, (strand - open) / (strand - clear)));
  const size = 64;
  const pitch = size / strands;
  const hex = Number.parseInt(f.color.replace("#", ""), 16);
  const rgb = [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255].map(
    (v) => v / 255,
  );
  const pixels: number[] = [];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      // How much of this pixel the strand covers: its edge pixel in part, so the picture is not jagged.
      const covered = Math.min(1, Math.max(0, cover * pitch - (x % pitch)));
      const a = clear + (strand - clear) * covered;
      // A fainter cross strand every eighth of the tile, as the mesh's weft.
      const weft = y % (size / 8) === 0 ? 0.5 : 0;
      pixels.push(rgb[0] ?? 0, rgb[1] ?? 0, rgb[2] ?? 0, Math.max(a, weft));
    }
  const image = bpy.data.images.new(name, size, size, true);
  image.pixels = pixels;
  const made = bpy.data.materials.new(name);
  known.set(key, made);
  made.use_nodes = true;
  made.use_backface_culling = false;
  const tree = made.node_tree;
  const node = tree?.nodes.get("Principled BSDF");
  if (!tree || !(node instanceof ShaderNodeBsdfPrincipled))
    throw new Error(`${name} has no Principled BSDF.`);
  node.inputs.Roughness.default_value = f.roughness;
  node.inputs.Metallic.default_value = f.metallic ?? 0;
  const texture = tree.nodes.new("ShaderNodeTexImage");
  texture.image = image;
  tree.links.new(texture.outputs.Color, node.inputs["Base Color"]);
  tree.links.new(texture.outputs.Alpha, node.inputs.Alpha);
  return made;
}
