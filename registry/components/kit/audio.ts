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
