// A desktop monitor on its stand, by default a 27-inch 4K office monitor at the Dell U2723QE's published
// sizes (its user's guide: 611.44 × 353.01 × 54.33 mm, a 596.74 × 335.66 mm active area in 7.35 mm borders
// and a 10 mm chin; the stand's base 268 × 185 mm, its column 381.5 mm tall, 150 mm of height and −5° to 21°
// of tilt). The popular demo videos' monitors: median 0.6 × 0.37 m, their centre about 1.1 m above the floor.
// MONITOR_PRESETS holds a 24-inch office monitor, a curved 34-inch ultrawide, a 27-inch gaming one and a
// 27-inch 5K aluminium one, each at one product's published sizes; the light bar clipped on top is a BenQ
// ScreenBar Pro's (LIGHT_BAR_DEFAULTS).
import {
  ModelMesh,
  type Bpy,
  type ModelObject,
  type Vec3,
} from "@allyhub-next/model";
import {
  box,
  cylinder,
  deg,
  finish,
  group,
  mm,
  plate,
  solid,
  strut,
  type Finish,
} from "./parts.ts";

/**
 * The rear shell's shape behind the front frame, as shares of its full depth (`panel`'s depth less
 * `frame`): `profile` is [height share from the bottom edge, depth share] stations down the middle, a
 * quarter ellipse between each two (level at the deeper); `sides` how fast it thins towards the left and right edges (depth × (1 − u²)^sides, u the
 * share of half the width: 0 keeps it as deep to the edges); `rim` its depth (m) at its outline.
 */
export interface MonitorBack {
  profile: [number, number][];
  sides: number;
  rim: number;
}

/** A light bar clipped on the panel's top edge: a bar on a clamp whose rear leg rests on the panel's back. */
export interface LightBarOptions {
  /** Its glow in nits; 0 for off. */
  glow: number;
  /** The bar's length and diameter (m). */
  length: number;
  diameter: number;
  /** How far the bar's front stands in front of the panel's front face, and its top above the panel's top (m). */
  ahead: number;
  above: number;
  /** The clamp: its width, the arm's reach from the panel's front to the rear hinge, the rear leg's length (m). */
  clamp: number;
  reach: number;
  leg: number;
  /** The tilt of its lit face from straight down, towards the viewer (degrees). */
  aim: number;
  body: Finish;
  /** The lit strip's colour. */
  light: string;
}

/**
 * BenQ ScreenBar Pro (benq.eu spec and dimension drawing): a 50 cm bar of about 23 mm, its lit face turned
 * 24°, on a clamp whose arm reaches 48 mm in front of the panel and 85 mm back to a hinge, a 83 mm leg below
 * it; 50 × 13.5 × 9.2 cm in all, matte black anodised aluminium.
 */
export const LIGHT_BAR_DEFAULTS: LightBarOptions = {
  glow: 0,
  length: mm(500),
  diameter: mm(23),
  ahead: mm(48),
  above: mm(33),
  clamp: mm(48),
  reach: mm(85),
  leg: mm(83),
  aim: 24,
  body: { color: "#2b2c2e", roughness: 0.45, metallic: 0.5 },
  light: "#fff4e4",
};

export interface MonitorOptions {
  /** The panel without its stand: width, height, depth at its thickest (m). */
  panel: [number, number, number];
  /** The active area (m), centred across, `chin` (m) of its bottom bezel below it. */
  active: [number, number];
  chin: number;
  /** The front frame's depth (m); the rest of `panel`'s depth is the rear shell. */
  frame: number;
  /** The rear shell's shape, or "flat" for a slab as deep as the panel all over. */
  back: MonitorBack | "flat";
  /** A recess in the back's bottom middle that the ports face down from: its width and height, how deep (m). */
  pocket: { size: [number, number]; depth: number } | false;
  /** A mount on the back round the hinge: its width and height, how far it stands proud (m); round or square. */
  boss: { size: [number, number]; depth: number; round: boolean } | false;
  /** Two buttons on the back: where, as shares of half the width (+ to the viewer's right) and of the height. */
  keys: [number, number] | false;
  /** The panel's bottom edge above the desk at the stand's lowest (m), and how far it is raised from there. */
  low: number;
  raise: number;
  /** The panel's tilt back (degrees, −5 to 21 on the reference stand). */
  tilt: number;
  /** The tilt hinge's height above the panel's bottom edge (m). */
  hinge: number;
  /**
   * What holds the panel: "column", a riser standing on the foot with a neck forward into the panel's back;
   * or "sheet", one bent sheet, the riser rising from the foot's back to a hinge barrel behind the panel.
   */
  support: "column" | "sheet";
  /** The stand's foot: width, depth, thickness (m). */
  foot: [number, number, number];
  /**
   * The foot's shape: "plate" (a slab, its plan a trapezoid with rounded corners) or "tripod" (two legs
   * splayed to the front corners and one back, a gaming monitor's).
   */
  footShape: "plate" | "tripod";
  /** A plate's front and back edges as shares of its width, its back edge's bow outwards and corners (m). */
  footEdges: [number, number];
  footBow: number;
  footCorner: number;
  /** A dark rubber sole under the foot (m tall; 0 for none). */
  footSole: number;
  /** The riser's width and depth (m): a column's, or a sheet's width and thickness. */
  riser: [number, number];
  /** The riser's width and depth at its foot as shares of those at its top: a column that widens downwards. */
  riserTaper: number;
  /** How far the riser's foot stands in from the foot's back edge (m). */
  riserInset: number;
  /** The riser's lean from upright, its top towards the viewer (degrees; negative leans back). */
  riserLean: number;
  /** A column's top above the desk at the stand's lowest (m), and the share of `raise` it rises by. */
  riserTop: number;
  riserRaise: number;
  /** A hole through the riser for cables: width, height, its bottom above the foot (m), round or a slot. */
  riserHole: { size: [number, number]; at: number; round: boolean } | false;
  /** A cable clip on the riser's back: its height above the desk, and its width, how far it stands out, its height (m). */
  riserClip: { at: number; size: [number, number, number] } | false;
  /**
   * The neck from the riser's front to the panel's back: length, width, height (m). For a "sheet", its
   * length is the hinge's axis behind the panel's back and its height the barrel's diameter.
   */
  neck: [number, number, number];
  /**
   * The panel's curve: the radius it bends round (m; a "1900R" panel is 1.9), its edges towards the viewer;
   * null for flat. A curved panel's `MonitorScreen` is a curved surface over its active area (UVs 0 to 1, u
   * right, v up). A scenery shows a video on it with `screenOn(kit, "MonitorScreen", name, material)`
   * (components/room/screens.ts): a copy of that surface, named, that `screen()` draws on, the picture on
   * the curve, spread evenly along the chord (screen() maps content by the mesh's x and y, not its UVs).
   * `screenOver` would lay a flat plane at the chord, in front of the curve's middle by its sagitta
   * (w² / 8r: 42 mm at 0.8 m and 1900R).
   */
  curve: number | null;
  bezel: Finish;
  shell: Finish;
  stand: Finish;
  /** The screen's surface while it shows nothing: a matte anti-glare coating. */
  glass: Finish;
  /** A cable hole's walls, the sole and the ports. */
  dark: Finish;
  /** A light bar clipped on the panel's top (LIGHT_BAR_DEFAULTS); false for none. */
  bar: (Partial<LightBarOptions> & { glow: number }) | false;
}

/** The U2723QE's rear shell: 19 mm deep at its top edge, its full 54 mm from the middle down, thin at the sides. */
const SLIM_BACK: MonitorBack = {
  profile: [
    [0, 0.9],
    [0.1, 1],
    [0.55, 1],
    [1, 0.14],
  ],
  sides: 1.6,
  rim: mm(1),
};

export const MONITOR_DEFAULTS: MonitorOptions = {
  panel: [mm(611.44), mm(353.01), mm(54.33)],
  active: [mm(596.74), mm(335.66)],
  chin: mm(10),
  frame: mm(12),
  back: SLIM_BACK,
  pocket: { size: [mm(300), mm(105)], depth: mm(22) },
  boss: false,
  keys: [0.8, 0.1],
  low: mm(32.17),
  raise: mm(70),
  tilt: 4,
  hinge: mm(161),
  support: "column",
  foot: [mm(268), mm(185), mm(9)],
  footShape: "plate",
  footEdges: [0.85, 1],
  footBow: mm(6),
  footCorner: mm(14),
  footSole: mm(4),
  riser: [mm(36), mm(46)],
  riserTaper: 1.15,
  riserInset: mm(18),
  riserLean: -3,
  riserTop: mm(381.5),
  riserRaise: 46.8 / 150,
  riserHole: { size: [mm(22), mm(65)], at: mm(28), round: false },
  riserClip: false,
  neck: [mm(30), mm(30), mm(26)],
  curve: null,
  bezel: { color: "#0d0d0f", roughness: 0.45 },
  shell: { color: "#d2d2d4", roughness: 0.55 },
  stand: { color: "#dcdde0", roughness: 0.28, metallic: 0.6 },
  glass: { color: "#0a0b0c", roughness: 0.32 },
  dark: { color: "#141416", roughness: 0.7 },
  bar: false,
};

/** Other monitors, as options over the defaults: `monitor(bpy, at, MONITOR_PRESETS.ultrawide34)`. */
export const MONITOR_PRESETS = {
  /**
   * A 24-inch office monitor (Dell E2425H's user's guide): 552.64 × 331.61 × 49.68 mm, a 23.8-inch panel
   * (527.04 × 296.46 mm) in 12.8 mm borders over a deeper chin, all matte black plastic, its back thin at
   * the top and deepest a quarter up; on a fixed stand 174 mm tall that only tilts (−5° to 21°), a column
   * on a trapezoid foot 222 × 171 mm, wider at the front.
   */
  office24: {
    panel: [mm(552.64), mm(331.61), mm(49.68)],
    active: [mm(527.04), mm(296.46)],
    chin: mm(22.35),
    frame: mm(10),
    back: {
      profile: [
        [0, 0.85],
        [0.25, 1],
        [1, 0.08],
      ],
      sides: 1.2,
      rim: mm(1),
    },
    pocket: { size: [mm(250), mm(55)], depth: mm(18) },
    keys: false,
    low: mm(88.74),
    raise: 0,
    tilt: 3,
    hinge: mm(75),
    foot: [mm(222.03), mm(171), mm(7)],
    footEdges: [1, 0.78],
    footBow: 0,
    footCorner: mm(12),
    footSole: mm(2),
    riser: [mm(42), mm(48)],
    riserTaper: 1,
    riserInset: mm(20),
    riserLean: 0,
    riserTop: mm(174.02),
    riserRaise: 0,
    riserHole: false,
    riserClip: { at: mm(80), size: [mm(30), mm(20), mm(18)] },
    neck: [0, mm(40), mm(30)],
    bezel: { color: "#0e0e10", roughness: 0.6 },
    shell: { color: "#131416", roughness: 0.72 },
    stand: { color: "#131416", roughness: 0.62 },
  },
  /**
   * A curved 34-inch 21:9 ultrawide (Dell U3423WE's user's guide): 813.26 × 359.05 mm, a 3440 × 1440 panel
   * (800.05 × 335.05 mm) bent to 1900R in 10.35 / 9.66 / 13.9 mm borders, 101.88 mm deep with its curve; the
   * U2723QE's silver shell and stand, its base 357.5 × 235 mm, its column 386.5 mm tall, 150 mm of height.
   */
  ultrawide34: {
    panel: [mm(813.26), mm(359.05), mm(58.4)],
    active: [mm(800.05), mm(335.05)],
    chin: mm(13.9),
    frame: mm(12),
    pocket: { size: [mm(290), mm(105)], depth: mm(22) },
    keys: [0.85, 0.1],
    low: mm(33.72),
    raise: mm(60),
    hinge: mm(165),
    foot: [mm(357.5), mm(235), mm(10)],
    riser: [mm(44), mm(54)],
    riserInset: mm(22),
    riserTop: mm(386.5),
    neck: [mm(34), mm(34), mm(28)],
    curve: 1.9,
  },
  /**
   * A 27-inch 16:9 gaming monitor (ASUS ROG Strix XG27AQ's spec): 611 × 367 × 82 mm, a 596.74 × 335.66 mm
   * panel in thin borders over a 22 mm chin, matte black, its back deepest low down, a round mount where the
   * stand meets it; on a column 100 mm of height over a tripod foot, two long legs to the front corners and
   * one back, 255 mm deep in all.
   */
  gaming27: {
    panel: [mm(611), mm(367), mm(82)],
    active: [mm(596.74), mm(335.66)],
    chin: mm(22.3),
    frame: mm(10),
    back: {
      profile: [
        [0, 0.7],
        [0.3, 1],
        [1, 0.2],
      ],
      sides: 1.3,
      rim: mm(1),
    },
    pocket: { size: [mm(330), mm(60)], depth: mm(25) },
    boss: { size: [mm(196), mm(196)], depth: mm(5), round: true },
    keys: [0.9, 0.3],
    low: mm(41),
    raise: mm(60),
    tilt: 5,
    hinge: mm(214),
    foot: [mm(540), mm(255), mm(16)],
    footShape: "tripod",
    footSole: 0,
    riser: [mm(72), mm(48)],
    riserTaper: 1.25,
    riserInset: mm(85),
    riserLean: -3,
    riserTop: mm(395),
    riserRaise: 0,
    riserHole: { size: [mm(26), mm(40)], at: mm(45), round: false },
    neck: [mm(2), mm(60), mm(60)],
    bezel: { color: "#0a0a0b", roughness: 0.5 },
    shell: { color: "#101012", roughness: 0.55 },
    stand: { color: "#19191b", roughness: 0.4, metallic: 0.3 },
  },
  /**
   * A 27-inch 5K aluminium monitor (Apple Studio Display's tech specs and drawing, tilt-adjustable stand):
   * 623 × 362 mm, a 5120 × 2880 panel (596.5 × 335.5 mm) behind black glass with even 13 mm borders, a flat
   * aluminium slab 20 mm deep; 478 mm tall on its stand, −5° to 25° of tilt, the stand one aluminium sheet:
   * a foot 168 mm deep and the arm rising from its back, leaning 15° forward to a hinge 90 mm above the
   * panel's bottom edge, an oval hole for the cable through it, its top rolled round the hinge as a plate over
   * the back's lower middle; bead-blasted anodised aluminium, black glass in front (the stand's width, 152 mm,
   * and the hole, 42 × 62 mm, are measured from Apple's back view).
   */
  fiveK27: {
    panel: [mm(623), mm(362), mm(20)],
    active: [mm(596.5), mm(335.5)],
    chin: mm(13.25),
    frame: mm(2),
    back: "flat",
    pocket: false,
    keys: false,
    low: mm(116),
    raise: 0,
    tilt: 4,
    hinge: mm(90),
    support: "sheet",
    foot: [mm(152), mm(168), mm(7)],
    footEdges: [1, 1],
    footBow: 0,
    footCorner: mm(8),
    footSole: mm(1.5),
    riser: [mm(152), mm(9)],
    riserTaper: 1,
    riserInset: mm(22),
    riserLean: 15.5,
    riserHole: { size: [mm(42), mm(62)], at: mm(98), round: true },
    neck: [mm(10), mm(152), mm(20)],
    bezel: { color: "#0b0b0c", roughness: 0.06 },
    shell: { color: "#e2e3e5", roughness: 0.42, metallic: 0.55 },
    stand: { color: "#e2e3e5", roughness: 0.42, metallic: 0.55 },
    glass: { color: "#08090a", roughness: 0.06 },
  },
} satisfies Record<string, Partial<MonitorOptions>>;

/**
 * The monitor under an empty at `at` (the foot's centre on the desk), facing -y.
 * The screen is the object `MonitorScreen`, its face towards -y: a scenery puts its
 * own screen over it.
 */
export function monitor(
  bpy: Bpy,
  at: Vec3,
  over: Partial<MonitorOptions> = {},
  parent?: ModelObject,
): ModelObject {
  const o = { ...MONITOR_DEFAULTS, ...over };
  const [pw, ph, pd] = o.panel;
  const [, fd, ft] = o.foot;
  const [rw, rd] = o.riser;
  const root = group(bpy, "Monitor", at, parent);
  const stand = finish(bpy, "MonitorStand", o.stand);
  const dark = finish(bpy, "MonitorDark", o.dark);

  const base = o.footSole + ft;
  foot(bpy, o, root, stand, dark);

  // The riser leans from where it stands: its middle's y at a height z above the desk.
  const lean = Math.tan(deg(o.riserLean));
  const riserY = fd / 2 - o.riserInset - rd / 2;
  const across = (z: number): number => riserY - (z - base) * lean;
  const hingeZ = o.low + o.raise + o.hinge;
  const proud = o.boss ? o.boss.depth : 0;
  // The hinge's place: the panel's back (its deepest point) is at the hinge's y = 0.
  let hingeY: number;
  if (o.support === "column") {
    const top = o.riserTop + o.riserRaise * o.raise;
    riser(bpy, o, root, stand, dark, riserY, base, top - base);
    if (o.riserClip) {
      const [cw, cd, ch] = o.riserClip.size;
      const z = o.riserClip.at;
      box(bpy, "MonitorRiserClip", [cw, cd + mm(6), ch], stand, {
        parent: root,
        at: [0, across(z) + rd / 2 + (cd - mm(6)) / 2, z],
        radius: mm(3),
      });
    }
    const front = across(hingeZ) - rd / 2;
    hingeY = front - o.neck[0] - proud;
    // The neck from inside the riser to inside the panel's back.
    const [, nw, nh] = o.neck;
    const from = hingeY - mm(12);
    const to = front + Math.min(rd / 2, mm(8));
    box(bpy, "MonitorNeck", [nw, to - from, nh], stand, {
      parent: root,
      at: [0, (from + to) / 2, hingeZ],
      radius: Math.min(nw, nh) * 0.3,
      segments: 3,
    });
  } else {
    const length = (hingeZ - base) / Math.cos(deg(o.riserLean));
    riser(bpy, o, root, stand, dark, riserY, base, length);
    // The barrel the sheet rolls into at its top, the hinge's axis.
    const axisY = across(hingeZ);
    cylinder(bpy, "MonitorBarrel", o.neck[2] / 2, rw, stand, {
      parent: root,
      at: [0, axisY, hingeZ],
      rotation: [0, Math.PI / 2, 0],
      radius: mm(1.5),
      segments: 32,
    });
    hingeY = axisY - o.neck[0] - proud;
  }

  // The panel turns about the hinge; its bottom edge `hinge` below it.
  const hinge = group(bpy, "MonitorHinge", [0, hingeY, hingeZ], root);
  hinge.rotation_euler = [-deg(o.tilt), 0, 0];
  const zc = ph / 2 - o.hinge;
  const shell = finish(bpy, "MonitorShell", o.shell);
  const r = o.curve ?? Infinity;
  const sag = (x: number): number =>
    Number.isFinite(r) ? (x * x) / (2 * r) : 0;
  const depthAt = backDepth(o);
  if (o.back === "flat")
    box(bpy, "MonitorBack", [pw - mm(1), pd - o.frame, ph - mm(1)], shell, {
      parent: hinge,
      at: [0, -(pd - o.frame) / 2, zc],
      radius: mm(4),
      segments: 4,
    });
  else backShell(bpy, o, hinge, shell, zc, sag, depthAt);
  if (o.boss) {
    const [bw, bh] = o.boss.size;
    const deep = mm(14);
    if (o.boss.round)
      cylinder(bpy, "MonitorBoss", bw / 2, deep + o.boss.depth, shell, {
        parent: hinge,
        at: [0, (o.boss.depth - deep) / 2, 0],
        rotation: [Math.PI / 2, 0, 0],
        radius: mm(2),
        segments: 64,
      });
    else
      box(bpy, "MonitorBoss", [bw, deep + o.boss.depth, bh], shell, {
        parent: hinge,
        at: [0, (o.boss.depth - deep) / 2, 0],
        radius: mm(4),
      });
  }
  if (o.keys) {
    // A power button and a joystick, standing a little out of the back where it is.
    const [ku, kv] = o.keys;
    for (const [i, radius] of [mm(4), mm(6)].entries()) {
      const x = ku * (pw / 2) - i * mm(14);
      const z = -o.hinge + kv * ph;
      const y = -pd + o.frame + depthAt(x, z + o.hinge) - sag(x);
      cylinder(bpy, `MonitorKey.${String(i)}`, radius, mm(6), shell, {
        parent: hinge,
        at: [x, y, z],
        rotation: [Math.PI / 2, 0, 0],
        radius: mm(1),
        segments: 24,
      });
    }
  }

  if (o.curve !== null) curvedFront(bpy, o, hinge, zc);
  else {
    // The front frame, its front face at `pd` in front of the hinge.
    box(
      bpy,
      "MonitorFrame",
      [pw, o.frame, ph],
      finish(bpy, "MonitorBezel", o.bezel),
      {
        parent: hinge,
        at: [0, -pd + o.frame / 2, zc],
        radius: Math.min(mm(2.5), o.frame / 2),
        segments: 3,
      },
    );
    // The active area: a thin plate standing 0.4 mm proud of the frame's face.
    const [aw, ah] = o.active;
    const screenZ = zc - ph / 2 + o.chin + ah / 2;
    box(
      bpy,
      "MonitorScreen",
      [aw, mm(0.8), ah],
      finish(bpy, "MonitorGlass", o.glass),
      {
        parent: hinge,
        at: [0, -pd, screenZ],
      },
    );
  }
  if (o.bar) lightBar(bpy, o, hinge, depthAt);
  return root;
}

/** The rear shell's depth behind the frame (m) at x across and z up from the panel's bottom edge. */
function backDepth(o: MonitorOptions): (x: number, z: number) => number {
  const [pw, ph, pd] = o.panel;
  const full = pd - o.frame;
  if (o.back === "flat") return () => full;
  const { profile, sides, rim } = o.back;
  const stations = [...profile].sort((a, b) => a[0] - b[0]);
  const down = (h: number): number => {
    const first = stations[0];
    const last = stations[stations.length - 1];
    if (!first || !last) return 1;
    if (h <= first[0]) return first[1];
    if (h >= last[0]) return last[1];
    for (let i = 0; i + 1 < stations.length; i++) {
      const a = stations[i];
      const b = stations[i + 1];
      if (!a || !b || h > b[0]) continue;
      // A quarter ellipse between stations, level at the deeper one: a shell's back rounds over its top.
      const t = (h - a[0]) / (b[0] - a[0]);
      const e =
        b[1] < a[1] ? 1 - Math.sqrt(1 - t * t) : Math.sqrt(1 - (1 - t) ** 2);
      return a[1] + (b[1] - a[1]) * e;
    }
    return last[1];
  };
  const pocket = o.pocket;
  return (x, z) => {
    const u = Math.min(1, Math.abs(x) / (pw / 2));
    let d = rim + (full - rim) * down(z / ph) * (1 - u * u) ** sides;
    if (pocket && Math.abs(x) < pocket.size[0] / 2 && z < pocket.size[1])
      d = Math.max(rim, d - pocket.depth);
    return d;
  };
}

/**
 * The rear shell: a sheet over the panel's outline (a superellipse, its corners rounded), `depthAt` behind
 * the frame and bent with the panel, thickened by Solidify. Its grid has lines at the pocket's edges, so the
 * pocket's walls stand square.
 */
function backShell(
  bpy: Bpy,
  o: MonitorOptions,
  hinge: ModelObject,
  shell: ReturnType<typeof finish>,
  zc: number,
  sag: (x: number) => number,
  depthAt: (x: number, z: number) => number,
): void {
  const [pw, ph, pd] = o.panel;
  const w = pw;
  const h = ph;
  const lines = (n: number, cuts: number[]): number[] => {
    const set = new Set<number>();
    for (let i = 0; i <= n; i++) set.add(-1 + (2 * i) / n);
    for (const c of cuts) if (c > -1 && c < 1) set.add(c);
    return [...set].sort((a, b) => a - b);
  };
  const gap = mm(0.5);
  const xCuts: number[] = [];
  const zCuts: number[] = [];
  if (o.pocket) {
    const [qw, qh] = o.pocket.size;
    for (const s of [-1, 1])
      for (const e of [-gap, gap]) xCuts.push((s * qw) / w + (2 * e) / w);
    const top = -1 + (2 * (qh - mm(1))) / h;
    zCuts.push(top - (2 * gap) / h, top + (2 * gap) / h);
  }
  const us = lines(64, xCuts);
  const vs = lines(40, zCuts);
  const n = 60;
  const v: Vec3[] = [];
  for (const b of vs)
    for (const a of us) {
      const m = Math.max(Math.abs(a), Math.abs(b));
      const s =
        m === 0 ? 0 : m / (Math.abs(a) ** n + Math.abs(b) ** n) ** (1 / n);
      const x = (a * s * w) / 2;
      const z = (b * s * h) / 2;
      v.push([x, -pd + o.frame + depthAt(x, z + ph / 2) - sag(x), z + zc]);
    }
  const f: number[][] = [];
  const nx = us.length;
  for (let j = 0; j + 1 < vs.length; j++)
    for (let i = 0; i + 1 < nx; i++) {
      const a = j * nx + i;
      f.push([a, a + 1, a + nx + 1, a + nx]);
    }
  const back = solid(bpy, "MonitorBack", v, f, shell, {
    parent: hinge,
    smooth: true,
  });
  const thick = back.modifiers.new("Thickness", "SOLIDIFY");
  thick.thickness = mm(2);
  thick.offset = 0;
  thick.use_even_offset = false;
  if (o.pocket) {
    // The ports along the pocket's top wall, facing down.
    const [qw, qh] = o.pocket.size;
    const deep = depthAt(0, qh + mm(2));
    box(
      bpy,
      "MonitorPorts",
      [qw - mm(40), o.pocket.depth * 0.8, mm(1)],
      finish(bpy, "MonitorDark", o.dark),
      {
        parent: hinge,
        at: [
          0,
          -pd + o.frame + deep - o.pocket.depth / 2,
          zc - ph / 2 + qh - mm(1.2),
        ],
      },
    );
  }
}

/** The foot: a plate with its sole, or a tripod's hub and legs. */
function foot(
  bpy: Bpy,
  o: MonitorOptions,
  root: ModelObject,
  stand: ReturnType<typeof finish>,
  dark: ReturnType<typeof finish>,
): void {
  const [fw, fd, ft] = o.foot;
  const sole = o.footSole;
  if (o.footShape === "plate") {
    const [front, back] = o.footEdges;
    const plan: [number, number][] = [
      [(-fw * front) / 2, -fd / 2],
      [(fw * front) / 2, -fd / 2],
    ];
    // The back edge, bowed out by footBow at its middle.
    const steps = o.footBow > 0 ? 8 : 1;
    for (let i = 0; i <= steps; i++) {
      const t = 1 - (2 * i) / steps;
      plan.push([(t * fw * back) / 2, fd / 2 + o.footBow * (1 - t * t)]);
    }
    const ring = rounded(plan, o.footCorner, 8);
    slabOf(bpy, "MonitorFoot", ring, sole, sole + ft, stand, root, ft * 0.35);
    if (sole > 0)
      slabOf(
        bpy,
        "MonitorSole",
        rounded(inset(plan, mm(4)), o.footCorner, 8),
        0,
        sole + mm(0.5),
        dark,
        root,
        0,
      );
    return;
  }
  // A tripod: a hub under the riser, two blades to the front corners and one back, each thinning to its tip.
  const riserY = fd / 2 - o.riserInset - o.riser[1] / 2;
  const hub = Math.max(...o.riser) * 0.75;
  cylinder(bpy, "MonitorFoot", hub, ft, stand, {
    parent: root,
    at: [0, riserY, ft / 2],
    radius: mm(4),
    segments: 48,
  });
  const tips: [string, number, number][] = [
    ["L", -fw / 2 + mm(10), -fd / 2 + mm(10)],
    ["R", fw / 2 - mm(10), -fd / 2 + mm(10)],
    ["B", 0, fd / 2 - mm(8)],
  ];
  for (const [side, x, y] of tips)
    strut(
      bpy,
      `MonitorLeg.${side}`,
      [0, riserY, ft / 2],
      [x, y, ft / 4],
      [mm(16), ft / 2],
      [mm(8), ft / 4],
      stand,
      { parent: root, radius: mm(2) },
    );
}

/** The riser from its foot `length` along its lean, with its cable hole cut through it. */
function riser(
  bpy: Bpy,
  o: MonitorOptions,
  root: ModelObject,
  stand: ReturnType<typeof finish>,
  dark: ReturnType<typeof finish>,
  y: number,
  base: number,
  length: number,
): void {
  const [rw, rd] = o.riser;
  const foot = group(bpy, "MonitorRiserFoot", [0, y, base], root);
  foot.rotation_euler = [deg(o.riserLean), 0, 0];
  // Sunk a little into the foot, so the lean leaves no gap at its back edge.
  const sunk = mm(6);
  // A box, wider at its foot by riserTaper, its foot sunk into the foot.
  const k = o.riserTaper;
  const corners: Vec3[] = [];
  for (const [z, s] of [
    [-sunk, k],
    [length, 1],
  ] as const)
    for (const [x, y] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ] as const)
      corners.push([(x * rw * s) / 2, (y * rd * s) / 2, z]);
  const column = solid(
    bpy,
    "MonitorRiser",
    corners,
    [
      [0, 3, 2, 1],
      [4, 5, 6, 7],
      [0, 1, 5, 4],
      [1, 2, 6, 5],
      [2, 3, 7, 6],
      [3, 0, 4, 7],
    ],
    stand,
    { parent: foot },
  );
  // Its edges rounded, then the hole cut: a column's corners round, a sheet's edges eased.
  const bevel = column.modifiers.new("Round", "BEVEL");
  bevel.width = o.support === "sheet" ? rd * 0.45 : Math.min(rw, rd) * 0.42;
  bevel.segments = 4;
  bevel.limit_method = "NONE";
  if (column.data instanceof ModelMesh) column.data.shade_smooth();
  if (o.riserHole) {
    const [hw, hh] = o.riserHole.size;
    const at: Vec3 = [0, 0, o.riserHole.at + hh / 2];
    const cutter = o.riserHole.round
      ? cylinder(bpy, "MonitorRiserHoleCut", hw / 2, rd * 4, dark, {
          parent: foot,
          at,
          rotation: [Math.PI / 2, 0, 0],
          segments: 48,
        })
      : box(bpy, "MonitorRiserHoleCut", [hw, rd * 4, hh], dark, {
          parent: foot,
          at,
        });
    // A round hole taller than wide is an oval: the cylinder stretched up (its local y is up once turned).
    if (o.riserHole.round) cutter.scale = [1, hh / hw, 1];
    cutter.hide_render = true;
    cutter.hide_viewport = true;
    const cut = column.modifiers.new("Hole", "BOOLEAN");
    cut.operation = "DIFFERENCE";
    cut.solver = "MANIFOLD";
    cut.material_mode = "TRANSFER";
    cut.object = cutter;
  }
  column.modifiers.new("Normals", "WEIGHTED_NORMAL").keep_sharp = true;
}

/** A closed slab between z0 and z1 over a plan ring (counter-clockwise from above), its rims rounded by `edge`. */
function slabOf(
  bpy: Bpy,
  name: string,
  ring: [number, number][],
  z0: number,
  z1: number,
  material: ReturnType<typeof finish>,
  parent: ModelObject,
  edge: number,
): ModelObject {
  const k = ring.length;
  const v: Vec3[] = [
    ...ring.map(([x, y]) => [x, y, z0] as Vec3),
    ...ring.map(([x, y]) => [x, y, z1] as Vec3),
  ];
  const f: number[][] = [
    [...Array(k).keys()].reverse(),
    [...Array(k).keys()].map((i) => i + k),
    ...[...Array(k).keys()].map((i) => [
      i,
      (i + 1) % k,
      ((i + 1) % k) + k,
      i + k,
    ]),
  ];
  const object = solid(bpy, name, v, f, material, { parent, smooth: true });
  const mesh = object.data;
  if (mesh instanceof ModelMesh) mesh.set_sharp_from_angle(deg(50));
  if (edge > 0) {
    const bevel = object.modifiers.new("Round", "BEVEL");
    bevel.width = Math.min(edge, (z1 - z0) / 2 - 1e-5);
    bevel.segments = 3;
    bevel.limit_method = "ANGLE";
    bevel.angle_limit = deg(60);
    object.modifiers.new("Normals", "WEIGHTED_NORMAL").keep_sharp = true;
  }
  return object;
}

/** A convex plan (counter-clockwise) with each corner filleted by `r` in `n` steps. */
function rounded(
  plan: [number, number][],
  r: number,
  n: number,
): [number, number][] {
  const out: [number, number][] = [];
  const k = plan.length;
  for (let i = 0; i < k; i++) {
    const p = plan[i] ?? [0, 0];
    const a = plan[(i + k - 1) % k] ?? p;
    const b = plan[(i + 1) % k] ?? p;
    const la = Math.hypot(a[0] - p[0], a[1] - p[1]);
    const lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const ua: [number, number] = [(a[0] - p[0]) / la, (a[1] - p[1]) / la];
    const ub: [number, number] = [(b[0] - p[0]) / lb, (b[1] - p[1]) / lb];
    const angle = Math.acos(
      Math.max(-1, Math.min(1, ua[0] * ub[0] + ua[1] * ub[1])),
    );
    if (angle > deg(170) || r <= 0) {
      out.push(p);
      continue;
    }
    const t = Math.min(r / Math.tan(angle / 2), la * 0.45, lb * 0.45);
    const rr = t * Math.tan(angle / 2);
    const bis: [number, number] = [ua[0] + ub[0], ua[1] + ub[1]];
    const bl = Math.hypot(...bis);
    const c: [number, number] = [
      p[0] + ((bis[0] / bl) * rr) / Math.sin(angle / 2),
      p[1] + ((bis[1] / bl) * rr) / Math.sin(angle / 2),
    ];
    const t1: [number, number] = [p[0] + ua[0] * t, p[1] + ua[1] * t];
    const t2: [number, number] = [p[0] + ub[0] * t, p[1] + ub[1] * t];
    const a1 = Math.atan2(t1[1] - c[1], t1[0] - c[0]);
    let a2 = Math.atan2(t2[1] - c[1], t2[0] - c[0]);
    while (a2 - a1 > Math.PI) a2 -= 2 * Math.PI;
    while (a2 - a1 < -Math.PI) a2 += 2 * Math.PI;
    for (let s = 0; s <= n; s++) {
      const q = a1 + ((a2 - a1) * s) / n;
      out.push([c[0] + rr * Math.cos(q), c[1] + rr * Math.sin(q)]);
    }
  }
  return out;
}

/** A convex plan moved in by `d` towards its centroid's side of each point (a small inset). */
function inset(plan: [number, number][], d: number): [number, number][] {
  const cx = plan.reduce((s, p) => s + p[0], 0) / plan.length;
  const cy = plan.reduce((s, p) => s + p[1], 0) / plan.length;
  return plan.map(([x, y]) => {
    const l = Math.hypot(x - cx, y - cy);
    return [x - ((x - cx) / l) * d, y - ((y - cy) / l) * d];
  });
}

/**
 * The light bar on the panel's top edge, in the hinge's space: the bar in front, the clamp's arm over the
 * top, its hinge behind and the leg down from it, turned until its foot meets the panel's back.
 */
function lightBar(
  bpy: Bpy,
  o: MonitorOptions,
  hinge: ModelObject,
  depthAt: (x: number, z: number) => number,
): void {
  const b = { ...LIGHT_BAR_DEFAULTS, ...(o.bar || {}) };
  const [, ph, pd] = o.panel;
  const top = ph - o.hinge;
  const front = -pd;
  const body = finish(bpy, "MonitorBarBody", b.body);
  const radius = b.diameter / 2;
  const barY = front - b.ahead + radius;
  const barZ = top + b.above - radius;
  cylinder(bpy, "MonitorBar", radius, b.length, body, {
    parent: hinge,
    at: [0, barY, barZ],
    rotation: [0, Math.PI / 2, 0],
    radius: mm(2),
    segments: 32,
  });
  // The lit face: a strip along the bar's underside, turned `aim` towards the viewer.
  const aim = deg(b.aim);
  const lit = radius * 0.98;
  box(
    bpy,
    "MonitorBarLight",
    [b.length - mm(30), b.diameter * 0.55, mm(0.6)],
    finish(bpy, "MonitorBarGlow", {
      color: "#ffffff",
      roughness: 0.4,
      emission: b.glow > 0 ? { color: b.light, strength: b.glow } : undefined,
    }),
    {
      parent: hinge,
      at: [0, barY - lit * Math.sin(aim), barZ - lit * Math.cos(aim)],
      rotation: [aim, 0, 0],
    },
  );
  // The arm: a cradle under the bar sloping down to the panel's front edge, then flat over the top to the
  // rear hinge.
  const armT = mm(9);
  const armZ = top + armT / 2 + mm(1);
  const kneeY = front + b.reach;
  strut(
    bpy,
    "MonitorBarCradle",
    [0, barY, barZ - radius * 0.35],
    [0, front + mm(12), armZ],
    [b.clamp / 2, armT / 2],
    [b.clamp / 2, armT / 2],
    body,
    { parent: hinge, radius: mm(2.5) },
  );
  box(bpy, "MonitorBarClip", [b.clamp, kneeY - front, armT], body, {
    parent: hinge,
    at: [0, (front + kneeY) / 2, armZ],
    radius: mm(3),
  });
  const knee = mm(8);
  cylinder(bpy, "MonitorBarKnee", knee, b.clamp + mm(2), body, {
    parent: hinge,
    at: [0, kneeY, armZ],
    rotation: [0, Math.PI / 2, 0],
    radius: mm(1),
    segments: 24,
  });
  // The leg hangs from the knee, swung forward until its foot reaches the panel's back.
  const legT = mm(14);
  let swing = 0;
  for (let a = 0; a <= 80; a += 0.5) {
    const s = deg(a);
    const y = kneeY - b.leg * Math.sin(s);
    const z = armZ - b.leg * Math.cos(s);
    const backY = -pd + o.frame + depthAt(0, z + o.hinge);
    swing = s;
    if (y - legT / 2 <= backY) break;
  }
  const leg = group(bpy, "MonitorBarLeg", [0, kneeY, armZ], hinge);
  leg.rotation_euler = [-swing, 0, 0];
  box(bpy, "MonitorBarClipBack", [b.clamp, legT, b.leg], body, {
    parent: leg,
    at: [0, 0, -b.leg / 2],
    radius: mm(4),
  });
}

/**
 * A curved panel's front on `hinge`: the frame bent round `curve` (a parabola through the panel's middle,
 * its edges towards -y) and `MonitorScreen`, the active area as a curved surface 0.4 mm proud of the frame
 * with UVs 0 to 1 across it.
 */
function curvedFront(
  bpy: Bpy,
  o: MonitorOptions,
  hinge: ModelObject,
  zc: number,
): void {
  const [pw, ph, pd] = o.panel;
  const r = o.curve ?? Infinity;
  // plate() bows its edges towards +y: turned half round, they come towards the viewer.
  const turn: Vec3 = [0, 0, Math.PI];
  plate(bpy, "MonitorFrame", pw, ph, finish(bpy, "MonitorBezel", o.bezel), {
    parent: hinge,
    at: [0, -pd + o.frame / 2, zc],
    rotation: turn,
    wrap: r,
    thickness: o.frame,
    squareness: 40,
    segments: [96, 16],
  });
  // The active area: a strip of quads across, each column straight up, on the frame's face's curve.
  const [aw, ah] = o.active;
  const z0 = zc - ph / 2 + o.chin;
  const n = 96;
  const v: Vec3[] = [];
  const f: number[][] = [];
  const uvs: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = -aw / 2 + (aw * i) / n;
    const y = -pd - mm(0.4) - (x * x) / (2 * r);
    v.push([x, y, z0], [x, y, z0 + ah]);
  }
  for (let i = 0; i < n; i++) {
    const a = 2 * i;
    // Corners in the order given: bottom left, bottom right, top right, top left; its face towards -y.
    f.push([a, a + 2, a + 3, a + 1]);
    uvs.push([i / n, 0], [(i + 1) / n, 0], [(i + 1) / n, 1], [i / n, 1]);
  }
  const screen = solid(
    bpy,
    "MonitorScreen",
    v,
    f,
    finish(bpy, "MonitorGlass", o.glass),
    { parent: hinge, smooth: true },
  );
  const mesh = screen.data;
  if (mesh instanceof ModelMesh) {
    const layer = mesh.uv_layers.new("Screen", false);
    uvs.forEach((uv, i) => {
      const corner = layer.data[i];
      if (corner) corner.uv = uv;
    });
  }
}
