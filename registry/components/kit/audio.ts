// What a creator records and listens with: a broadcast microphone on a boom arm
// clamped to the desk (Shure SM7B: 190 mm long, a 63.5 mm body, 96 mm across its
// yoke's nuts; on a Rode PSA1+: two flat sections on round joints, a short swivel
// post over the clamp), and a pair of desktop speakers (Audioengine A2+: 102 × 152
// × 133 mm, a 2.75-inch woofer under a 0.75-inch dome tweeter, a port slot at the
// front's foot; the drivers' sizes and places measured on a review's front photo). In popular demo videos, the microphones: median 0.1 × 0.18 × 0.2 m,
// 0.3 m in front of the person, at 1.0 m.
import type {
  Bpy,
  ModelMaterial,
  ModelObject,
  Vec3,
} from "@allyhub-next/model";
import {
  box,
  cylinder,
  deg,
  finish,
  group,
  lathe,
  mm,
  solid,
  strut,
  type Finish,
} from "./parts.ts";

export interface MicArmOptions {
  /** Where the microphone's mount hangs, from the clamp on the desk's top (m, Blender axes). */
  target: Vec3;
  /** Which way the microphone points: its turn about z and its tilt down (degrees). 0 points it to -y. */
  aim: [number, number];
  /** The arm's two sections (m) and the swivel post above the clamp (m). */
  sections: [number, number];
  riser: number;
  /** A section's depth in the arm's plane and its width across (m), at its root; it narrows a little to its end. */
  section: [number, number];
  /** The joints: their radius (m). */
  joint: number;
  /** The rod from the arm's end down to the microphone's mount (m). */
  hang: number;
  /** The microphone's mount above its body's axis (m): its yoke and the thread the arm screws into. */
  mount: number;
  arm: Finish;
  mic: Finish;
  foam: Finish;
}

export const MIC_ARM_DEFAULTS: MicArmOptions = {
  target: [-0.25, -0.45, 0.32],
  aim: [0, 10],
  sections: [mm(440), mm(440)],
  riser: mm(75),
  section: [mm(54), mm(32)],
  joint: mm(27),
  hang: mm(60),
  mount: mm(80),
  arm: { color: "#1a1a1b", roughness: 0.8 },
  mic: { color: "#2b2c2e", roughness: 0.5, metallic: 0.3 },
  foam: { color: "#1b1b1c", roughness: 0.98 },
};

/**
 * A broadcast dynamic microphone, its axis along -y from its yoke's pivot (Shure
 * SM7B's sizes), hanging from its mount: the mount's top is `mount` above its axis.
 */
export function microphone(
  bpy: Bpy,
  at: Vec3,
  o: Partial<MicArmOptions> = {},
  parent?: ModelObject,
): ModelObject {
  const f = { ...MIC_ARM_DEFAULTS, ...o };
  const root = group(bpy, "Microphone", at, parent);
  const metal = finish(bpy, "MicBody", f.mic);
  // Along +z from its back cap (millimetres), turned to point along -y; the yoke's pivot is 55 mm in front of the cap.
  const along = group(bpy, "MicAxis", [0, mm(55), 0], root);
  along.rotation_euler = [Math.PI / 2, 0, 0];
  const body: [number, number][] = [
    [0, 0],
    [18, 0],
    [26, 2],
    [30.5, 6],
    [31.75, 12],
    [31.75, 110],
    [30.5, 113],
  ].map(([r, z]) => [mm(r), mm(z)]);
  lathe(bpy, "MicBody", body, metal, { parent: along, steps: 48 });
  // The windscreen over the grille: a little wider than the body, its front rounded.
  const foam: [number, number][] = [
    [30.5, 111],
    [33, 115],
    [34, 125],
    [34, 162],
    [32, 176],
    [26, 186],
    [14, 190],
    [0, 191],
  ].map(([r, z]) => [mm(r), mm(z)]);
  lathe(bpy, "MicFoam", foam, finish(bpy, "MicFoam", f.foam), {
    parent: along,
    steps: 48,
  });
  // The yoke: a side plate at each side of the body with the nut that holds its pivot, the
  // bar over the body, and the threaded mount on the bar.
  const top = f.mount;
  const bar = top - mm(26);
  for (const side of [-1, 1] as const) {
    const s = side > 0 ? "R" : "L";
    box(bpy, `MicYoke.${s}`, [mm(5), mm(28), bar + mm(14)], metal, {
      parent: root,
      at: [side * mm(37), 0, (bar - mm(14)) / 2],
      radius: mm(2),
    });
    cylinder(bpy, `MicYokeNut.${s}`, mm(14), mm(8), metal, {
      parent: root,
      at: [side * mm(43.5), 0, 0],
      rotation: [0, Math.PI / 2, 0],
      radius: mm(2),
      segments: 32,
    });
  }
  box(bpy, "MicYokeBar", [mm(79), mm(28), mm(8)], metal, {
    parent: root,
    at: [0, 0, bar],
    radius: mm(2),
  });
  cylinder(bpy, "MicMount", mm(12), top - bar, metal, {
    parent: root,
    at: [0, 0, (top + bar) / 2],
    radius: mm(2),
    segments: 32,
  });
  return root;
}

/**
 * A boom arm clamped to the desk's back edge with a microphone at its end: its two
 * sections solved so the microphone's mount is at `target` from the clamp.
 */
export function micArm(
  bpy: Bpy,
  at: Vec3,
  over: Partial<MicArmOptions> = {},
  parent?: ModelObject,
): ModelObject {
  const o = { ...MIC_ARM_DEFAULTS, ...over };
  const root = group(bpy, "MicArm", at, parent);
  const black = finish(bpy, "MicArm", o.arm);
  // The clamp over the desk's edge, and the swivel post in it, narrowing to its top.
  box(bpy, "MicArmClamp", [mm(60), mm(70), mm(20)], black, {
    parent: root,
    at: [0, 0, mm(10)],
    radius: mm(4),
  });
  box(bpy, "MicArmClampJaw", [mm(60), mm(20), mm(90)], black, {
    parent: root,
    at: [0, mm(35) + mm(10), -mm(35)],
    radius: mm(4),
  });
  box(bpy, "MicArmClampFoot", [mm(60), mm(60), mm(12)], black, {
    parent: root,
    at: [0, mm(20), -mm(74)],
    radius: mm(4),
  });
  lathe(
    bpy,
    "MicArmRiser",
    [
      [0, mm(20)],
      [mm(27), mm(20)],
      [mm(24), mm(30)],
      [mm(17), mm(20) + o.riser],
      [0, mm(20) + o.riser],
    ],
    black,
    { parent: root, steps: 40 },
  );

  // Two sections in the vertical plane through the riser and the target: the elbow above.
  const base: Vec3 = [0, 0, mm(20) + o.riser + o.joint * 0.6];
  const end: Vec3 = [o.target[0], o.target[1], o.target[2] + o.hang];
  const dx = end[0] - base[0];
  const dy = end[1] - base[1];
  const dz = end[2] - base[2];
  const flat = Math.hypot(dx, dy);
  const reach = Math.hypot(flat, dz);
  const [a, b] = o.sections;
  const d = Math.min(reach, a + b - 1e-4);
  const toEnd = Math.atan2(dz, flat);
  const atBase = Math.acos(
    Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))),
  );
  const lift = toEnd + atBase;
  const ux = flat === 0 ? 0 : dx / flat;
  const uy = flat === 0 ? -1 : dy / flat;
  const elbow: Vec3 = [
    base[0] + ux * a * Math.cos(lift),
    base[1] + uy * a * Math.cos(lift),
    base[2] + a * Math.sin(lift),
  ];
  // A section is deep in the arm's plane and narrow across it.
  const [depth, width] = o.section;
  strut(
    bpy,
    "MicArmLower",
    base,
    elbow,
    [width / 2, depth / 2],
    [width / 2, depth / 2 - mm(3)],
    black,
    { parent: root, radius: mm(6) },
  );
  strut(
    bpy,
    "MicArmUpper",
    elbow,
    end,
    [width / 2, depth / 2 - mm(3)],
    [width / 2 - mm(2), depth / 2 - mm(8)],
    black,
    { parent: root, radius: mm(6) },
  );
  // The joints: discs whose axes are square to the arm's plane.
  const across = Math.atan2(uy, ux) + Math.PI / 2;
  const disc = (name: string, p: Vec3, r: number): void => {
    cylinder(bpy, name, r, width + mm(8), black, {
      parent: root,
      at: p,
      rotation: [0, Math.PI / 2, across],
      radius: mm(4),
    });
  };
  disc("MicArmBase", base, o.joint);
  disc("MicArmElbow", elbow, o.joint);
  disc("MicArmEnd", end, o.joint * 0.75);
  // The rod from the arm's end down to the microphone's mount, and the microphone.
  cylinder(bpy, "MicArmHanger", mm(7), o.hang, black, {
    parent: root,
    at: [end[0], end[1], end[2] - o.hang / 2],
  });
  const mic = microphone(
    bpy,
    [o.target[0], o.target[1], o.target[2] - o.mount],
    o,
    root,
  );
  mic.rotation_euler = [-deg(o.aim[1]), 0, deg(o.aim[0])];
  return root;
}

export interface SpeakerOptions {
  /** The cabinet: width, depth, height (m), and its edges' radius (m). */
  size: [number, number, number];
  corner: number;
  /** The woofer's and the tweeter's centres above the cabinet's foot (m). */
  wooferAt: number;
  tweeterAt: number;
  /**
   * The woofer's diameters as shares of the cabinet's width: its bezel, its rubber roll's
   * outer edge, its cone and its dust cap (measured on the front photo: 297, 255, 225 and
   * 102 px of a 443 px front).
   */
  woofer: [number, number, number, number];
  /** The tweeter's diameters as shares of the cabinet's width: its plate and its dome (163 and 97 px). */
  tweeter: [number, number];
  /** The port slot at the front's foot: width, height (m), its centre above the foot (m). */
  port: [number, number, number];
  cabinet: Finish;
  /** The bezels and the tweeter's plate. */
  driver: Finish;
  /** The woofer's cone of woven aramid: a little lighter and glossier than its bezel. */
  cone: Finish;
  /** Which way it is turned (degrees). */
  turn: number;
}

export const SPEAKER_DEFAULTS: SpeakerOptions = {
  size: [mm(102), mm(133), mm(152)],
  corner: mm(4),
  wooferAt: mm(57),
  tweeterAt: mm(123),
  woofer: [0.67, 0.58, 0.51, 0.23],
  tweeter: [0.37, 0.22],
  port: [mm(67), mm(4), mm(6)],
  cabinet: { color: "#e9e8e4", roughness: 0.25 },
  driver: { color: "#141415", roughness: 0.6 },
  cone: { color: "#2d2d30", roughness: 0.5 },
  turn: 0,
};

/** A desktop speaker (Audioengine A2+), its drivers to -y. */
export function speaker(
  bpy: Bpy,
  at: Vec3,
  over: Partial<SpeakerOptions> = {},
  parent?: ModelObject,
): ModelObject {
  // An option given as undefined keeps its default.
  const given = Object.fromEntries(
    Object.entries(over).filter(([, v]) => v !== undefined),
  ) as Partial<SpeakerOptions>;
  const o = { ...SPEAKER_DEFAULTS, ...given };
  const root = group(bpy, "Speaker", at, parent);
  root.rotation_euler = [0, 0, deg(o.turn)];
  const [w, d, h] = o.size;
  box(
    bpy,
    "SpeakerCabinet",
    [w, d, h],
    finish(bpy, "SpeakerCabinet", o.cabinet),
    {
      parent: root,
      at: [0, 0, h / 2],
      radius: o.corner,
    },
  );
  const dark = finish(bpy, "SpeakerCone", o.driver);
  const soft = finish(bpy, "SpeakerSurround", {
    color: "#0f0f10",
    roughness: 0.85,
  });
  const dome = finish(bpy, "SpeakerDome", {
    color: "#1c1c1d",
    roughness: 0.45,
  });
  // The drivers sit on the front face (its plane is z = 0 of `front`, +z out of it), each a
  // flat bezel, a rubber roll, and a cone that falls to its dust cap. A lathe's surface faces
  // the way its profile's left hand points, so each profile is turned to run from rim to centre.
  const front = group(bpy, "SpeakerFront", [0, -d / 2, 0], root);
  front.rotation_euler = [Math.PI / 2, 0, 0];
  // Radii in metres from shares of the width; each profile runs from its rim in to its centre.
  const radius = (share: number): number => (share * w) / 2;
  const [bezel, roll, coneEdge, cap] = o.woofer.map(radius) as [
    number,
    number,
    number,
    number,
  ];
  const ring = (
    name: string,
    points: [number, number][],
    material: ModelMaterial,
    at: ModelObject,
  ): void => {
    lathe(
      bpy,
      name,
      points.map(([r, z]) => [r, mm(z)] as [number, number]),
      material,
      {
        parent: at,
        steps: 48,
      },
    );
  };
  const cone = finish(bpy, "SpeakerWeave", o.cone);
  const wooferAt = group(bpy, "SpeakerWooferAt", [0, o.wooferAt, 0], front);
  ring(
    "SpeakerWooferBezel",
    [
      [bezel + mm(0.5), 0],
      [bezel, 1.2],
      [bezel - mm(1), 2.4],
      [roll + mm(1), 3.0],
      [roll, 3.4],
    ],
    dark,
    wooferAt,
  );
  ring(
    "SpeakerWooferRoll",
    [
      [roll, 3.4],
      [roll - (roll - coneEdge) * 0.25, 4.7],
      [roll - (roll - coneEdge) * 0.75, 4.7],
      [coneEdge, 3.4],
    ],
    soft,
    wooferAt,
  );
  ring(
    "SpeakerWoofer",
    [
      [coneEdge, 3.4],
      [coneEdge * 0.85, 2.7],
      [cap, 1.4],
    ],
    cone,
    wooferAt,
  );
  ring(
    "SpeakerWooferCap",
    [
      [cap, 1.4],
      [cap * 0.92, 2.3],
      [cap * 0.6, 3.1],
      [0, 3.4],
    ],
    dark,
    wooferAt,
  );
  // The tweeter: a shallow plate round its dome.
  const [plate, domeEdge] = o.tweeter.map(radius) as [number, number];
  const tweeterAt = group(bpy, "SpeakerTweeterAt", [0, o.tweeterAt, 0], front);
  ring(
    "SpeakerTweeterPlate",
    [
      [plate + mm(0.5), 0],
      [plate, 0.6],
      [plate - mm(1.5), 1.2],
      [domeEdge + mm(1.5), 1.5],
      [domeEdge, 1.8],
    ],
    dark,
    tweeterAt,
  );
  ring(
    "SpeakerTweeter",
    [
      [domeEdge, 1.8],
      [domeEdge * 0.75, 3.9],
      [domeEdge * 0.42, 5.4],
      [0, 6],
    ],
    dome,
    tweeterAt,
  );
  // The port slot, a dark opening at the front's foot.
  const [pw, ph, pz] = o.port;
  box(bpy, "SpeakerPort", [pw, mm(1), ph], soft, {
    parent: root,
    at: [0, -d / 2 - mm(0.3), pz],
    radius: ph / 2 - mm(0.1),
  });
  return root;
}

export interface UsbMicOptions {
  /** The body, the collar under the grille, the wire of the grille, the knobs and the felt under the base. */
  body: Finish;
  collar: Finish;
  wire: Finish;
  knob: Finish;
  felt: Finish;
  /** The light in the mute button. */
  led: Finish;
  /** The grille's wire: its pitch and radius (m). */
  pitch: number;
  wireRadius: number;
  /** Where the USB cable runs from the socket under the body, in the microphone's space (m); none for no cable. */
  cable: Vec3[];
}

/** The Yeti Blackout: matte black. */
export const USB_MIC_DEFAULTS: UsbMicOptions = {
  body: { color: "#141416", roughness: 0.42, metallic: 0.5 },
  collar: { color: "#101012", roughness: 0.36, metallic: 0.5 },
  wire: { color: "#1b1b1e", roughness: 0.4, metallic: 0.8 },
  knob: { color: "#121214", roughness: 0.5, metallic: 0.2 },
  felt: { color: "#0d0d0e", roughness: 1 },
  led: {
    color: "#ff2a1e",
    roughness: 0.3,
    emission: { color: "#ff2a1e", strength: 6 },
  },
  pitch: mm(2.6),
  wireRadius: mm(0.34),
  cable: [],
};

export const USB_MIC_PRESETS = {
  blackout: {},
  // The Yeti in silver: a chrome collar and a bright woven grille.
  silver: {
    body: { color: "#8e9093", roughness: 0.55, metallic: 1 },
    collar: { color: "#e8e8e8", roughness: 0.08, metallic: 1 },
    wire: { color: "#c9c9c7", roughness: 0.3, metallic: 1 },
    knob: { color: "#9a9c9f", roughness: 0.4, metallic: 1 },
  },
} satisfies Record<string, Partial<UsbMicOptions>>;

/** A polyline through `points`, each span cut in `n` by Catmull-Rom: its ends stay where they are. */
function smoothed(points: number[][], n: number): number[][] {
  const out: number[][] = [];
  const last = points.length - 1;
  for (let i = 0; i < last; i++) {
    const [a, b, c, d] = [i - 1, i, i + 1, i + 2].map(
      (k) => points[Math.min(last, Math.max(0, k))] as number[],
    ) as [number[], number[], number[], number[]];
    for (let j = 0; j < n; j++) {
      const t = j / n;
      out.push(
        b.map((_, k) => {
          const [p0, p1, p2, p3] = [
            a[k] as number,
            b[k] as number,
            c[k] as number,
            d[k] as number,
          ];
          return (
            0.5 *
            (2 * p1 +
              (p2 - p0) * t +
              (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
              (3 * p1 - p0 - 3 * p2 + p3) * t * t * t)
          );
        }),
      );
    }
  }
  out.push(points[last] as number[]);
  return out;
}

/** A closed skin through rings of as many points each, shut at both ends. */
function loft(
  bpy: Bpy,
  name: string,
  rings: Vec3[][],
  material: ModelMaterial,
  o: { parent?: ModelObject; smooth?: boolean } = {},
): ModelObject {
  const n = rings[0]?.length ?? 0;
  const faces: number[][] = [];
  for (let j = 0; j + 1 < rings.length; j++)
    for (let i = 0; i < n; i++) {
      const [a, b] = [j * n + i, j * n + ((i + 1) % n)];
      faces.push([a, b, b + n, a + n]);
    }
  faces.push(
    [...Array(n).keys()].reverse(),
    [...Array(n).keys()].map((i) => (rings.length - 1) * n + i),
  );
  return solid(bpy, name, rings.flat(), faces, material, {
    parent: o.parent,
    smooth: o.smooth ?? true,
  });
}

/** A rounded rectangle's outline, half sizes `a` and `b`, corners `c`, as [along a, along b] from its centre. */
function roundedOutline(a: number, b: number, c: number): [number, number][] {
  const r = Math.min(c, a * 0.9, b * 0.9);
  const out: [number, number][] = [];
  for (const [sx, sy, from] of [
    [1, 1, 0],
    [-1, 1, 90],
    [-1, -1, 180],
    [1, -1, 270],
  ] as const)
    for (let i = 0; i <= 3; i++) {
      const t = deg(from + i * 30);
      out.push([
        sx * (a - r) + r * Math.cos(t),
        sy * (b - r) + r * Math.sin(t),
      ]);
    }
  return out;
}

/**
 * A desk USB microphone on its cast stand (Blue Yeti). 295 mm tall in its stand and 120 mm across its base (the
 * maker's 11.61 × 4.72 in); the rest measured on photographs, scaled by that height: a 68 mm body, a 63 mm grille,
 * 100 mm across the side knobs (the maker's 4.92 in width is more than any photograph shows). The stand is a
 * two-legged arch that sweeps back to a strap round the back of the body, which rises at each side to a pivot. It
 * stands on z = 0, its front (mute, volume) towards -y; gain and pattern are on its back.
 */
export function usbMic(
  bpy: Bpy,
  at: Vec3,
  options: Partial<UsbMicOptions> = {},
  parent?: ModelObject,
): ModelObject {
  const f = { ...USB_MIC_DEFAULTS, ...options };
  const root = group(bpy, "UsbMic", at, parent);
  const body = finish(bpy, "UsbMicBody", f.body);
  const knob = finish(bpy, "UsbMicKnob", f.knob);
  const profile = (points: number[][]): [number, number][] =>
    points.map(([r, z]) => [mm(r as number), mm(z as number)]);

  // The base: felt under a flared disc with a flat top.
  lathe(
    bpy,
    "UsbMicFelt",
    profile([
      [0, 0],
      [56, 0],
      [56, 2],
      [0, 2],
    ]),
    finish(bpy, "UsbMicFelt", f.felt),
    { parent: root },
  );
  const rimBase = smoothed(
    [
      [59, 2],
      [60, 3.5],
      [60, 7],
      [58.5, 9],
      [53, 12],
      [47, 15.5],
      [45, 17.2],
    ],
    4,
  );
  lathe(
    bpy,
    "UsbMicBase",
    profile([
      [0, 2],
      ...rimBase,
      [44.6, 17.6],
      [44.3, 18.6],
      [43.4, 19],
      [0, 19],
    ]),
    body,
    { parent: root, steps: 96 },
  );

  // The stand, its outline in x and z (the front photograph's): a pair of outer and inner edges from each foot to
  // the crown, a section across each pair, the whole swept back as it rises to the strap.
  const half = [
    [-33, 17, -19, 17],
    [-33, 35, -19.5, 35],
    [-31.5, 52, -19, 50],
    [-28, 68, -17, 60],
    [-23.5, 82, -13, 68],
    [-18.5, 93, -8, 73],
    [-15.5, 103, -4, 75],
    [-17, 112, -1.5, 75.5],
  ];
  const pairs = smoothed(
    [
      ...half,
      [0, 113, 0, 75.6],
      ...half
        .map(([a, b, c, d]) => [
          -(a as number),
          b as number,
          -(c as number),
          d as number,
        ])
        .reverse(),
    ],
    3,
  );
  const sweep = (z: number): [number, number] => {
    const t = Math.min(1, Math.max(0, (z - 19) / 91));
    const s = t * t * (3 - 2 * t);
    // Its depth's centre and half depth: from under the body back to the strap, thinner as it goes.
    // Its top narrows into the strap, so nothing of it stands proud under the body.
    const top = Math.min(1, Math.max(0, (z - 92) / 21));
    return [-6 + 53 * s, 13 - 2.5 * s - 7 * top * top];
  };
  const standRing = (p: number[]): Vec3[] => {
    const [ox, oz, ix, iz] = p as [number, number, number, number];
    const [cx, cz] = [(ox + ix) / 2, (oz + iz) / 2];
    const across = Math.hypot(ox - ix, oz - iz) / 2;
    const [ux, uz] = [(ox - ix) / (2 * across), (oz - iz) / (2 * across)];
    // A unit deep here: each point takes the depth of its own height.
    return roundedOutline(across, 1, 0.45).map(([a, b]) => {
      const [x, z] = [cx + ux * a, cz + uz * a];
      const [centre, depth] = sweep(z);
      return [mm(x), mm(centre + b * depth), mm(z)];
    });
  };
  loft(bpy, "UsbMicStand", pairs.map(standRing), body, { parent: root });

  // The strap: from the front of one pivot round the back of the body to the other. Along its length: how far from
  // its tip, then its top and bottom edges there (mm).
  const heights = smoothed(
    [
      [0, 165, 165],
      [1.2, 169, 158],
      [4, 173.5, 142],
      [9, 176.6, 129],
      [16, 178, 119],
      [24, 175.5, 112],
      [34, 162, 106],
      [44, 148, 103],
      [55, 138, 101],
      [66, 143, 100],
      [74, 150, 100],
      [78.5, 148, 100],
      [81, 130, 100],
      [83.5, 124, 100],
      [86, 123, 100],
    ],
    4,
  );
  const STRAP_RADIUS = 41;
  const STRAP_BACK = 6;
  const STRAIGHT = 22;
  const onStrap = (a: number, side: 1 | -1, r: number): [number, number] => {
    if (a <= STRAIGHT) return [side * r, -16 + a];
    const t = (a - STRAIGHT) / STRAP_RADIUS;
    return [side * r * Math.cos(t), STRAP_BACK + r * Math.sin(t)];
  };
  const strapRing = (h: number[], side: 1 | -1): Vec3[] => {
    const [a, top, bottom] = h as [number, number, number];
    const [mid, up] = [(top + bottom) / 2, Math.max(0.1, (top - bottom) / 2)];
    return roundedOutline(1.8, up, 1.2).map(([t, u]) => {
      const [x, y] = onStrap(a, side, STRAP_RADIUS + t);
      return [mm(x), mm(y), mm(mid + u)];
    });
  };
  loft(
    bpy,
    "UsbMicStrap",
    [
      ...heights.map((h) => strapRing(h, -1)),
      ...heights
        .slice(0, -1)
        .reverse()
        .map((h) => strapRing(h, 1)),
    ],
    body,
    { parent: root },
  );

  // The body and the socket under it.
  const shoulder = smoothed(
    [
      [14, 115],
      [27, 115.2],
      [31, 116.6],
      [33.4, 120],
      [34, 126],
    ],
    4,
  );
  lathe(
    bpy,
    "UsbMicBody",
    profile([
      [0, 110],
      [11, 110],
      [12, 111],
      [12, 115],
      ...shoulder,
      [34, 232],
      [33.6, 232.6],
      [0, 232.6],
    ]),
    body,
    { parent: root, steps: 96 },
  );
  lathe(
    bpy,
    "UsbMicCollar",
    profile([
      [0, 232.5],
      [33.6, 232.5],
      [35.2, 233.4],
      [35.6, 235],
      [35.6, 239.4],
      [35, 241],
      [32.8, 241.4],
      [32.8, 240],
      [0, 240],
    ]),
    finish(bpy, "UsbMicCollar", f.collar),
    { parent: root, steps: 96 },
  );

  // The grille: dark foam, then the wire, a flat square weave turned 45° pressed over the dome from its top. Along
  // the dome's outline from the top: its radius and height.
  const dome = smoothed(
    [
      [0, 295],
      [10.6, 292.4],
      [20.8, 286.3],
      [28, 276.6],
      [31, 267],
      [31.6, 258],
      [31.6, 248],
      [31.6, 239],
    ],
    6,
  ) as [number, number][];
  lathe(
    bpy,
    "UsbMicFoam",
    profile([
      ...dome.map(([r, z]) => [Math.max(0, r - 1.2), z - 1.2]),
      [0, 239],
    ]),
    finish(bpy, "UsbMicFoam", { color: "#050506", roughness: 1 }),
    { parent: root, steps: 64 },
  );
  const lengths = dome.reduce<number[]>((out, [r, z], i) => {
    const [pr, pz] = (dome[i - 1] ?? [r, z]) as [number, number];
    out.push((out[i - 1] ?? 0) + Math.hypot(r - pr, z - pz));
    return out;
  }, []);
  const reach = lengths[lengths.length - 1] as number;
  // The dome's radius, height and outward normal at a length along it.
  const onDome = (s: number): [number, number, number, number] => {
    const k = Math.max(
      0,
      lengths.findIndex((l) => l >= s),
    );
    const i = Math.max(1, k);
    const [a, b] = [dome[i - 1], dome[i]] as [
      [number, number],
      [number, number],
    ];
    const [la, lb] = [lengths[i - 1] as number, lengths[i] as number];
    const t = lb > la ? (s - la) / (lb - la) : 0;
    const [dr, dz] = [(b[0] - a[0]) / (lb - la), (b[1] - a[1]) / (lb - la)];
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, -dz, dr];
  };
  const pitch = f.pitch * 1000;
  const wireVerts: Vec3[] = [];
  const wireFaces: number[][] = [];
  const SIDES = 4;
  const count = Math.ceil(reach / pitch);
  for (const family of [1, -1] as const)
    for (let k = -count; k <= count; k++) {
      const d = k * pitch;
      const far = Math.sqrt(Math.max(0, reach * reach - d * d));
      if (far < pitch) continue;
      const steps = Math.round((2 * far) / (pitch / 2));
      const points: Vec3[] = [];
      for (let i = 0; i <= steps; i++) {
        const t = -far + (2 * far * i) / steps;
        // The weave's plane, turned 45°: one family of lines each way.
        const [u, v] = family > 0 ? [t, d] : [d, t];
        const [x, y] = [(u - v) * Math.SQRT1_2, (u + v) * Math.SQRT1_2];
        const [s, th] = [Math.hypot(x, y), Math.atan2(y, x)];
        const [r, z, nr, nz] = onDome(Math.min(s, reach));
        // Over one wire and under the next.
        const lift =
          f.wireRadius *
          1000 *
          family *
          Math.cos((Math.PI * t) / pitch) *
          (k % 2 ? -1 : 1);
        const out = r + nr * lift;
        points.push([out * Math.cos(th), out * Math.sin(th), z + nz * lift]);
      }
      const base = wireVerts.length;
      const ring = f.wireRadius * 1000;
      points.forEach((p, i) => {
        const q = points[Math.min(steps, i + 1)] as Vec3;
        const o = points[Math.max(0, i - 1)] as Vec3;
        const t: Vec3 = [q[0] - o[0], q[1] - o[1], q[2] - o[2]];
        const tl = Math.hypot(...t);
        const n: Vec3 = [p[0], p[1], Math.max(0, p[2] - 250)];
        const nl = Math.hypot(...n) || 1;
        const b: Vec3 = [
          (t[1] * n[2] - t[2] * n[1]) / (tl * nl),
          (t[2] * n[0] - t[0] * n[2]) / (tl * nl),
          (t[0] * n[1] - t[1] * n[0]) / (tl * nl),
        ];
        for (let j = 0; j < SIDES; j++) {
          const a = (j * 2 * Math.PI) / SIDES;
          const [c, e] = [Math.cos(a) * ring, Math.sin(a) * ring];
          wireVerts.push([
            mm(p[0] + (n[0] / nl) * c + b[0] * e),
            mm(p[1] + (n[1] / nl) * c + b[1] * e),
            mm(p[2] + (n[2] / nl) * c + b[2] * e),
          ]);
        }
      });
      for (let i = 0; i < steps; i++)
        for (let j = 0; j < SIDES; j++) {
          const [a, c] = [
            base + i * SIDES + j,
            base + i * SIDES + ((j + 1) % SIDES),
          ];
          wireFaces.push([a, c, c + SIDES, a + SIDES]);
        }
    }
  solid(
    bpy,
    "UsbMicGrille",
    wireVerts,
    wireFaces,
    finish(bpy, "UsbMicWire", f.wire),
    { parent: root, smooth: true },
  );

  // A ridged knob along an axis: `at` is where it leaves the surface, `to` a unit vector outward; ridges to its
  // `edge`, then a smooth cap.
  const toAxis = (
    name: string,
    place: Vec3,
    to: Vec3,
    edge: [number, number],
    cap: [number, number],
  ): void => {
    const [r, h] = edge;
    const [cr, ch] = cap;
    const side: Vec3 = Math.abs(to[2]) > 0.9 ? [1, 0, 0] : [to[1], -to[0], 0];
    const up: Vec3 = [
      to[1] * side[2] - to[2] * side[1],
      to[2] * side[0] - to[0] * side[2],
      to[0] * side[1] - to[1] * side[0],
    ];
    const point = (a: number, rr: number, along: number): Vec3 => [
      place[0] +
        mm(
          rr * Math.cos(a) * side[0] + rr * Math.sin(a) * up[0] + along * to[0],
        ),
      place[1] +
        mm(
          rr * Math.cos(a) * side[1] + rr * Math.sin(a) * up[1] + along * to[1],
        ),
      place[2] +
        mm(
          rr * Math.cos(a) * side[2] + rr * Math.sin(a) * up[2] + along * to[2],
        ),
    ];
    const TEETH = 44;
    const ridged = (along: number, depth: number): Vec3[] =>
      Array.from({ length: TEETH * 2 }, (_, i) =>
        point((i * Math.PI) / TEETH, i % 2 ? r - depth : r, along),
      );
    loft(
      bpy,
      `${name}Ridges`,
      [ridged(0, 0.4), ridged(h - 0.5, 0.4), ridged(h, 1)],
      knob,
      { parent: root, smooth: false },
    );
    const CAP = 48;
    const round = (rr: number, along: number): Vec3[] =>
      Array.from({ length: CAP }, (_, i) =>
        point((i * 2 * Math.PI) / CAP, rr, along),
      );
    loft(
      bpy,
      `${name}Cap`,
      [
        round(cr, 0),
        round(cr, h + ch - 0.8),
        round(cr - 0.3, h + ch - 0.25),
        round(cr - 0.8, h + ch),
      ],
      knob,
      { parent: root },
    );
  };

  // The side knobs that hold the pivot, and a washer under each.
  for (const side of [-1, 1] as const) {
    cylinder(bpy, `UsbMicPivot.${side}`, mm(11), mm(1.4), body, {
      parent: root,
      at: [side * mm(43.4), 0, mm(163)],
      rotation: [0, Math.PI / 2, 0],
      radius: mm(0.5),
    });
    toAxis(
      `UsbMicPivotKnob.${side}`,
      [side * mm(44), 0, mm(163)],
      [side, 0, 0],
      [8.8, 6],
      [7.4, 1.4],
    );
    cylinder(bpy, `UsbMicAxle.${side}`, mm(6), mm(8), body, {
      parent: root,
      at: [side * mm(38), 0, mm(163)],
      rotation: [0, Math.PI / 2, 0],
    });
  }
  // Volume on the front; gain and pattern on the back, low and round.
  toAxis(
    "UsbMicVolume",
    [0, -mm(33.8), mm(160)],
    [0, -1, 0],
    [9.2, 6],
    [7.2, 2],
  );
  toAxis(
    "UsbMicGain",
    [0, mm(33.8), mm(214)],
    [0, 1, 0],
    [10, 3.4],
    [9.2, 0.6],
  );
  toAxis(
    "UsbMicPattern",
    [0, mm(33.8), mm(186)],
    [0, 1, 0],
    [10, 3.4],
    [9.2, 0.6],
  );

  // A pointer on each of the three: a thin light line from the rim to the centre of the cap, at 12 o'clock.
  const line = finish(bpy, "UsbMicPointer", {
    color: "#c8c8c8",
    roughness: 0.6,
  });
  for (const [name, y, z, length, sign] of [
    ["Volume", -mm(41.85), mm(160), mm(4), -1],
    ["Gain", mm(37.85), mm(214), mm(5), 1],
    ["Pattern", mm(37.85), mm(186), mm(5), 1],
  ] as const)
    box(bpy, `UsbMic${name}Pointer`, [mm(0.7), mm(0.2), length], line, {
      parent: root,
      at: [0, y, z + mm(sign < 0 ? 4.4 : 5.6)],
    });

  // The mute button: a raised ring, its light in the middle.
  cylinder(bpy, "UsbMicMuteRing", mm(5.2), mm(1.4), knob, {
    parent: root,
    at: [0, -mm(34), mm(186.5)],
    rotation: [Math.PI / 2, 0, 0],
    radius: mm(0.5),
  });
  cylinder(
    bpy,
    "UsbMicMuteLight",
    mm(1.5),
    mm(0.4),
    finish(bpy, "UsbMicLight", f.led),
    {
      parent: root,
      at: [0, -mm(34.8), mm(186.5)],
      rotation: [Math.PI / 2, 0, 0],
    },
  );

  // The oval badge on the front, its name left out: a raised rim wrapped round the body.
  const oval = (t: number, grow: number, lift: number): Vec3 => {
    const a = ((11.6 + grow) * Math.cos(t)) / 34;
    return [
      mm((34 + lift) * Math.sin(a)),
      -mm((34 + lift) * Math.cos(a)),
      mm(207.6 + (7 + grow) * Math.sin(t)),
    ];
  };
  const OVAL = 64;
  const ringAt = (grow: number, lift: number): Vec3[] =>
    Array.from({ length: OVAL }, (_, i) =>
      oval((i * 2 * Math.PI) / OVAL, grow, lift),
    );
  const badge: Vec3[] = [
    ...ringAt(0, -0.2),
    ...ringAt(0, 0.7),
    ...ringAt(-1, 0.8),
    ...ringAt(-1.6, 0.25),
  ];
  const badgeFaces: number[][] = [];
  for (let j = 0; j < 3; j++)
    for (let i = 0; i < OVAL; i++) {
      const [a, b] = [j * OVAL + i, j * OVAL + ((i + 1) % OVAL)];
      badgeFaces.push([a, b, b + OVAL, a + OVAL]);
    }
  solid(
    bpy,
    "UsbMicBadge",
    badge,
    badgeFaces,
    finish(bpy, "UsbMicCollar", f.collar),
    {
      parent: root,
      smooth: true,
    },
  );

  // The cable.
  if (f.cable.length > 1) {
    const path = smoothed(f.cable as number[][], 6) as Vec3[];
    const SECTION = 10;
    const rings = path.map((p, i) => {
      const q = path[Math.min(path.length - 1, i + 1)] as Vec3;
      const o = path[Math.max(0, i - 1)] as Vec3;
      const t: Vec3 = [q[0] - o[0], q[1] - o[1], q[2] - o[2]];
      const tl = Math.hypot(...t);
      const aside: Vec3 =
        Math.abs(t[2]) > tl * 0.9
          ? [1, 0, 0]
          : [-t[1] / Math.hypot(t[0], t[1]), t[0] / Math.hypot(t[0], t[1]), 0];
      const over: Vec3 = [
        (t[1] * aside[2] - t[2] * aside[1]) / tl,
        (t[2] * aside[0] - t[0] * aside[2]) / tl,
        (t[0] * aside[1] - t[1] * aside[0]) / tl,
      ];
      return Array.from({ length: SECTION }, (_, j): Vec3 => {
        const a = (j * 2 * Math.PI) / SECTION;
        const [c, s] = [mm(2) * Math.cos(a), mm(2) * Math.sin(a)];
        return [
          p[0] + aside[0] * c + over[0] * s,
          p[1] + aside[1] * c + over[1] * s,
          p[2] + aside[2] * c + over[2] * s,
        ];
      });
    });
    loft(bpy, "UsbMicCable", rings, knob, { parent: root });
  }
  return root;
}
