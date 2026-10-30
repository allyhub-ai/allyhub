// A laptop, open: by default a MacBook Pro 14-inch (M4 Pro, 2024) in space black, at Apple's published size,
// 312.6 × 221.2 × 15.5 mm, and its parts measured on Apple's own top, front and side views (a base 11.5 mm and
// a lid 4 mm thick; the keyboard in a black well with a speaker grille either side; the trackpad, the feet, the
// ports and the display's notch where those views put them). In popular demo videos, laptops: median
// 0.33 × 0.23 m. LAPTOP_PRESETS holds the 16-inch, the thin 13- and 15-inch, their colours, a business laptop
// and a gaming one, each one model named in its comment.
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
  linear,
  mm,
  slab,
  solid,
  type Finish,
} from "./parts.ts";
import {
  keyExtent,
  LAPTOP_LAYOUTS,
  laptopKeyTops,
  type KeyTop,
  type LaptopKeyShape,
  type LaptopLayout,
} from "./key-tops.ts";
import { legendDecals } from "./legends.ts";
import {
  backlightLegends,
  backlightSpill,
  type Backlight,
} from "./backlight.ts";
import atlas from "../../assets/media/textures/keycap-legends/atlas.json" with { type: "json" };

/** What a port is, by its opening's shape: `PORT_SIZES` has each one's length, height and corner. */
export type PortKind =
  | "magsafe"
  | "usbc"
  | "jack"
  | "hdmi"
  | "sd"
  | "usba"
  | "rj45"
  | "lock"
  | "vent";

/** Each port's opening: its length along the side, its height and its corner radius (m). */
export const PORT_SIZES: Record<PortKind, [number, number, number]> = {
  magsafe: [mm(17.2), mm(3.2), mm(1.6)],
  usbc: [mm(8.4), mm(2.4), mm(1.2)],
  jack: [mm(3.6), mm(3.6), mm(1.8)],
  hdmi: [mm(14.6), mm(4.6), mm(0.9)],
  sd: [mm(26.6), mm(1.8), mm(0.9)],
  usba: [mm(12.6), mm(5), mm(0.5)],
  rj45: [mm(13.4), mm(8.5), mm(0.6)],
  lock: [mm(6.5), mm(3), mm(0.4)],
  vent: [mm(26), mm(8.5), mm(4.2)],
};

/** A port in a side: its kind and its centre's distance from the base's back (m); in the back, from its middle. */
export interface LaptopPort {
  kind: PortKind;
  at: number;
}

export interface LaptopOptions {
  /** The opening of the lid from closed (degrees). */
  open: number;
  /** The base: width, depth and thickness at its back (m). */
  base: [number, number, number];
  /** How much thinner the base is at its front than at its back (m): 0 for a flat slab, more for a wedge. */
  wedge: number;
  /** The plan's corner radii (m): the base's and the lid's, and the display glass's. */
  corners: [number, number];
  /** The rims' radii (m): the base's top rim and its underside's, which a MacBook rounds far more. */
  rims: [number, number];
  /** The lid: its thickness, its depth, and the hinge's axis from the base's back (m). */
  lid: number;
  lidDepth: number;
  hinge: number;
  /**
   * The hinge between the lid and the base, seen at the back: a cover across it, its length and radius (m) and
   * finish, between two barrels of the body's finish, each `barrel` long; null for none.
   */
  hingeCover: {
    length: number;
    radius: number;
    barrel: number;
    finish: Finish;
  } | null;
  /** A camera's housing over the lid's top edge at its back (a ThinkPad's): width, height, depth (m); null for none. */
  cameraBar: [number, number, number] | null;
  /** The display's active area (m) and its border below it, from the hinge (m). */
  display: [number, number];
  chin: number;
  /** The rim of the lid's own finish round the display's cover (m): the cover is this much inside the lid. */
  rim: number;
  /** The notch at the display's top, its width and its height from the glass's top edge (m); null for none. */
  notch: [number, number] | null;
  /** The keyboard: its layout (key-tops.ts), its measures over the layout's own, and how far its keys stand over the deck (m). */
  layout: LaptopLayout;
  keyShape: Partial<LaptopKeyShape>;
  keyRise: number;
  /**
   * The keyboard's well, cut into the deck: its size (the keys centred in it) and its back edge's distance from
   * the base's back, or, with `size` null, fitted round the keys `margin` wide (and round a row dropped below
   * the bottom row, a ThinkPad's or a Legion's arrows); its depth, corner radius and finish (a MacBook Pro's
   * black; null for the body's own, a MacBook Air's). null for keys straight on the deck.
   */
  well: {
    size: [number, number] | null;
    back: number;
    margin?: number;
    depth: number;
    corner: number;
    finish: Finish | null;
  } | null;
  /** Without a well's size: the keys' extent's back edge from the base's back (m). */
  keysBack: number;
  /** The keys' offset across (m), + to the right. */
  keysX: number;
  /**
   * A speaker grille either side of the keyboard: a strip `width` wide, `gap` from the well's side (or the
   * keys'), its ends inset from the keys' back and front by `ends`; its holes printed (legends.ts) light or
   * dark (by default dark on a light body, light on a dark one). null for none.
   */
  grilles: {
    width: number;
    gap: number;
    ends: [number, number];
    holes?: "light" | "dark";
  } | null;
  /** The trackpad: width and depth (m), its front edge's distance from the base's front, its offset across, and its finish. */
  trackpad: [number, number];
  trackpadFront: number;
  trackpadX: number;
  pad: Finish;
  /**
   * Buttons across the trackpad's top (a ThinkPad's three): their depth (m), the middle one's width at its top
   * and its foot (m), and the red stripe's finish under them; null for none.
   */
  padButtons: {
    depth: number;
    middle: [number, number];
    stripe: Finish;
  } | null;
  body: Finish;
  keys: Finish;
  glass: Finish;
  /** The display's border: its finish, or null for the glass's (a matte plastic bezel is the body's). */
  bezel: Finish | null;
  /** A pointing stick between G, H and B (a business laptop's), its cap's finish; null for none. */
  nub: Finish | null;
  /**
   * A round power or fingerprint button in the deck: its centre across from the keys' middle and its edge's
   * distance behind the keys' back edge (m), and its diameter; null for none.
   */
  power: { at: [number, number]; diameter: number } | null;
  /** The front's lip, a chamfer cut into the deck's front edge's middle: its width and depth (m); null for none. */
  scoop: [number, number] | null;
  /** The feet: their size (round when equal), height, their centres from the sides and from the front and back (m), and finish. */
  feet: {
    size: [number, number];
    height: number;
    inset: [number, number, number];
    finish: Finish;
  };
  /**
   * The ports, cut into the sides and the back: each side's from the back, the back's from the middle; their
   * centres' height over the base's underside (m), and the openings' finish.
   */
  ports: {
    left: LaptopPort[];
    right: LaptopPort[];
    back: LaptopPort[];
    height: number;
    finish: Finish;
  };
  /** A light along the base's front, at its foot (a gaming laptop's lens): its colours spread left to right and strength in nits; null for none. */
  frontLight: Backlight | null;
  /** The keys lit from below (backlight.ts: the legends and the light round each key); null for none. */
  backlight: Backlight | null;
}

const PORT_FINISH: Finish = { color: "#060607", roughness: 0.6 };

/** The MacBook Pro 14's ports, as Apple's side views place them. */
const MBP14_PORTS: LaptopOptions["ports"] = {
  left: [
    { kind: "magsafe", at: mm(28) },
    { kind: "usbc", at: mm(46.7) },
    { kind: "usbc", at: mm(61.8) },
    { kind: "jack", at: mm(74.8) },
  ],
  right: [
    { kind: "hdmi", at: mm(28.1) },
    { kind: "usbc", at: mm(46.8) },
    { kind: "sd", at: mm(71.6) },
  ],
  back: [],
  height: mm(7.6),
  finish: PORT_FINISH,
};

export const LAPTOP_DEFAULTS: LaptopOptions = {
  open: 112,
  base: [mm(312.6), mm(221.2), mm(11.5)],
  wedge: 0,
  corners: [mm(9.5), mm(7.5)],
  rims: [mm(0.7), mm(3.5)],
  lid: mm(4),
  lidDepth: mm(217.2),
  hinge: mm(4),
  hingeCover: {
    length: mm(206),
    radius: mm(3.4),
    barrel: mm(15),
    finish: { color: "#0d0d0e", roughness: 0.5 },
  },
  cameraBar: null,
  display: [mm(302.4), mm(196.4)],
  chin: mm(15.9),
  rim: mm(2.4),
  notch: [mm(34), mm(6.5)],
  layout: "mac",
  keyShape: {},
  keyRise: mm(0.3),
  well: {
    size: [mm(278.6), mm(111.8)],
    back: mm(17),
    depth: mm(1),
    corner: mm(2.5),
    finish: { color: "#141415", roughness: 0.55, metallic: 0.3 },
  },
  keysBack: mm(17),
  keysX: 0,
  grilles: {
    width: mm(13.6),
    gap: mm(1.3),
    ends: [mm(3.7), mm(5)],
  },
  trackpad: [mm(129.5), mm(80.9)],
  trackpadFront: mm(5.4),
  trackpadX: 0,
  // Space black, sampled on Apple's top view and raised to keep the keys darker than the deck under a scene's
  // lights, as that view shows them; the trackpad's glass the same, smoother.
  pad: { color: "#4a484c", roughness: 0.22, metallic: 0.45 },
  body: { color: "#4a484c", roughness: 0.34, metallic: 0.55 },
  keys: { color: "#18181a", roughness: 0.42 },
  glass: { color: "#050506", roughness: 0.08 },
  bezel: null,
  nub: null,
  padButtons: null,
  power: null,
  scoop: [mm(56), mm(2.4)],
  feet: {
    size: [mm(20.5), mm(20.5)],
    height: mm(1.7),
    inset: [mm(32.6), mm(27.8), mm(27.8)],
    finish: { color: "#1a1a1b", roughness: 0.8 },
  },
  ports: MBP14_PORTS,
  frontLight: null,
  backlight: null,
};

/**
 * Other laptops, as options over the defaults: `laptop(bpy, at, LAPTOP_PRESETS.business)`, or a size and a
 * colour spread together, `{ ...LAPTOP_PRESETS.sixteen, ...LAPTOP_PRESETS.silver }`.
 */
export const LAPTOP_PRESETS = {
  /**
   * MacBook Pro 16-inch (M4 Pro, 2024): 355.7 × 248.1 × 16.8 mm, a 16.2-inch 3456 × 2234 panel (345.6 × 223.4
   * mm), the same keyboard in a well as wide, longer grilles and a larger trackpad (Apple's 16-inch top view).
   */
  sixteen: {
    base: [mm(355.7), mm(248.1), mm(12.5)],
    lid: mm(4.3),
    lidDepth: mm(244.1),
    display: [mm(345.6), mm(223.4)],
    chin: mm(15.6),
    notch: [mm(34), mm(6.5)],
    hingeCover: {
      length: mm(240),
      radius: mm(3.6),
      barrel: mm(17),
      finish: { color: "#0d0d0e", roughness: 0.5 },
    },
    well: {
      size: [mm(279.2), mm(115)],
      back: mm(24.5),
      depth: mm(1),
      corner: mm(2.5),
      finish: { color: "#141415", roughness: 0.55, metallic: 0.3 },
    },
    grilles: {
      width: mm(33.6),
      gap: mm(2.4),
      ends: [mm(3.7), mm(4)],
    },
    trackpad: [mm(160.2), mm(100)],
    trackpadFront: mm(5.1),
    feet: {
      size: [mm(22), mm(22)],
      height: mm(1.8),
      inset: [mm(36), mm(30), mm(30)],
      finish: { color: "#1a1a1b", roughness: 0.8 },
    },
    ports: {
      ...MBP14_PORTS,
      left: [
        { kind: "magsafe", at: mm(29) },
        { kind: "usbc", at: mm(48) },
        { kind: "usbc", at: mm(63) },
        { kind: "jack", at: mm(76) },
      ],
      right: [
        { kind: "hdmi", at: mm(29) },
        { kind: "usbc", at: mm(48) },
        { kind: "sd", at: mm(73) },
      ],
      height: mm(8.3),
    },
  },
  /**
   * MacBook Air 13-inch (M4, 2025; M3 2024 the same): 304.1 × 215 × 11.3 mm with its lid, flat, a 13.6-inch
   * 2560 × 1664 panel (289.6 × 188.2 mm) with a notch, the keyboard in a shallow well of the body's own colour
   * near the sides with no grilles beside it, two USB-C and MagSafe on the left, the jack on the right. Spread a colour over it:
   * `{ ...LAPTOP_PRESETS.thin13, ...LAPTOP_PRESETS.starlight }`.
   */
  thin13: {
    base: [mm(304.1), mm(215), mm(7.4)],
    rims: [mm(0.6), mm(2.2)],
    lid: mm(3.9),
    lidDepth: mm(211.5),
    hinge: mm(3.5),
    display: [mm(289.6), mm(188.2)],
    chin: mm(14.6),
    rim: mm(2.2),
    notch: [mm(30), mm(5.8)],
    hingeCover: {
      length: mm(207),
      radius: mm(2.5),
      barrel: mm(12),
      finish: { color: "#141416", roughness: 0.5 },
    },
    well: {
      size: [mm(279.4), mm(115)],
      back: mm(12.1),
      depth: mm(0.8),
      corner: mm(2.5),
      finish: null,
    },
    grilles: null,
    trackpad: [mm(128.7), mm(80.3)],
    trackpadFront: mm(4.8),
    scoop: [mm(52), mm(1.8)],
    feet: {
      size: [mm(12), mm(12)],
      height: mm(0.9),
      inset: [mm(20), mm(22), mm(22)],
      finish: { color: "#1a1a1b", roughness: 0.8 },
    },
    ports: {
      left: [
        { kind: "magsafe", at: mm(23) },
        { kind: "usbc", at: mm(40.5) },
        { kind: "usbc", at: mm(53) },
      ],
      right: [{ kind: "jack", at: mm(24) }],
      back: [],
      height: mm(4),
      finish: PORT_FINISH,
    },
  },
  /**
   * MacBook Air 15-inch (M4, 2025; M3 2024 the same): 340.4 × 237.6 × 11.5 mm with its lid, a 15.3-inch
   * 2880 × 1864 panel (326.2 × 211.1 mm) with a notch, the 13-inch's keyboard further back with no grilles
   * beside it, a larger trackpad, the 13-inch's ports.
   */
  thin15: {
    base: [mm(340.4), mm(237.6), mm(7.5)],
    rims: [mm(0.6), mm(2.2)],
    lid: mm(4),
    lidDepth: mm(234.1),
    hinge: mm(3.5),
    display: [mm(326.2), mm(211.1)],
    chin: mm(14.6),
    rim: mm(2.2),
    notch: [mm(30), mm(5.8)],
    hingeCover: {
      length: mm(240),
      radius: mm(2.5),
      barrel: mm(13),
      finish: { color: "#141416", roughness: 0.5 },
    },
    well: {
      size: [mm(278.1), mm(114.4)],
      back: mm(21.5),
      depth: mm(0.8),
      corner: mm(2.5),
      finish: null,
    },
    grilles: null,
    trackpad: [mm(149.3), mm(93.4)],
    trackpadFront: mm(4.3),
    scoop: [mm(52), mm(1.8)],
    feet: {
      size: [mm(12), mm(12)],
      height: mm(0.9),
      inset: [mm(22), mm(24), mm(24)],
      finish: { color: "#1a1a1b", roughness: 0.8 },
    },
    ports: {
      left: [
        { kind: "magsafe", at: mm(23) },
        { kind: "usbc", at: mm(40.5) },
        { kind: "usbc", at: mm(53) },
      ],
      right: [{ kind: "jack", at: mm(24) }],
      back: [],
      height: mm(4),
      finish: PORT_FINISH,
    },
  },
  /**
   * The colours, sampled on Apple's top views in their white studio (space black's raised to keep its keys darker
   * than its deck under a scene's lights, as Apple's view shows them): anodised aluminium, a dielectric over metal,
   * so half metallic with a satin sheen. MacBook Pro's and Air's silver.
   */
  silver: {
    body: { color: "#dddee0", roughness: 0.34, metallic: 0.55 },
    pad: { color: "#dadbdd", roughness: 0.22, metallic: 0.45 },
  },
  /** MacBook Air's space grey (M3, 2024; the 14-inch MacBook Pro's of 2023 the same). */
  spaceGrey: {
    body: { color: "#b0b1b5", roughness: 0.34, metallic: 0.55 },
    pad: { color: "#a8a9ad", roughness: 0.22, metallic: 0.45 },
  },
  /** MacBook Air's midnight, a deep blue-black. */
  midnight: {
    body: { color: "#5f6878", roughness: 0.34, metallic: 0.55 },
    pad: { color: "#606979", roughness: 0.22, metallic: 0.45 },
  },
  /** MacBook Air's starlight, a warm champagne. */
  starlight: {
    body: { color: "#ece5db", roughness: 0.34, metallic: 0.55 },
    pad: { color: "#ece5db", roughness: 0.22, metallic: 0.45 },
  },
  /** The default's own space black, named so a scene can ask for it beside the others. */
  black: {
    body: { color: "#4a484c", roughness: 0.34, metallic: 0.55 },
    pad: { color: "#4a484c", roughness: 0.22, metallic: 0.45 },
  },
  /**
   * Lenovo ThinkPad T14 Gen 5 (Intel, 2024) in black: 315.9 × 223.7 × 17.7 mm (PSREF), a matte carbon-fibre
   * plastic slightly thinner at the front, a 14-inch 16:10 panel (301.6 × 188.5 mm) in a matte bezel under a
   * camera bar, its keyboard (key-tops.ts) with a red pointing stick, a grille either side, a 115 × 60 mm
   * trackpad under three buttons, the power button at the keys' back right. Spread `{ nub: null }` over it for
   * none.
   */
  business: {
    base: [mm(315.9), mm(223.7), mm(12.3)],
    wedge: mm(1.6),
    corners: [mm(4.5), mm(3)],
    rims: [mm(0.8), mm(2.4)],
    lid: mm(5.4),
    lidDepth: mm(216),
    hinge: mm(9),
    hingeCover: {
      length: mm(240),
      radius: mm(4),
      barrel: mm(20),
      finish: { color: "#141416", roughness: 0.7 },
    },
    cameraBar: [mm(62), mm(3.2), mm(7.4)],
    display: [mm(301.6), mm(188.5)],
    chin: mm(15.5),
    rim: mm(0),
    notch: null,
    layout: "thinkpad",
    keyRise: mm(0.8),
    well: {
      size: null,
      back: 0,
      margin: mm(1.4),
      depth: mm(1),
      corner: mm(1.5),
      finish: { color: "#0c0c0d", roughness: 0.6 },
    },
    keysBack: mm(24),
    grilles: {
      width: mm(7),
      gap: mm(4.5),
      ends: [mm(14), mm(2)],
    },
    trackpad: [mm(115), mm(60)],
    trackpadFront: mm(9),
    pad: { color: "#1c1c1e", roughness: 0.45 },
    padButtons: {
      depth: mm(9.5),
      middle: [mm(23), mm(15)],
      stripe: { color: "#c41a2a", roughness: 0.6 },
    },
    body: { color: "#1f1f21", roughness: 0.62, metallic: 0 },
    keys: { color: "#141416", roughness: 0.55 },
    glass: { color: "#050506", roughness: 0.4 },
    bezel: { color: "#111112", roughness: 0.7 },
    nub: { color: "#d4132b", roughness: 0.95 },
    power: { at: [mm(145.5), mm(-10)], diameter: mm(9) },
    scoop: null,
    feet: {
      size: [mm(30), mm(5)],
      height: mm(2),
      inset: [mm(40), mm(12), mm(14)],
      finish: { color: "#141414", roughness: 0.9 },
    },
    ports: {
      left: [
        { kind: "usbc", at: mm(26.6) },
        { kind: "usbc", at: mm(42) },
        { kind: "hdmi", at: mm(65.6) },
        { kind: "usba", at: mm(85) },
        { kind: "jack", at: mm(101) },
      ],
      right: [
        { kind: "lock", at: mm(13.7) },
        { kind: "rj45", at: mm(55.7) },
        { kind: "usba", at: mm(80) },
        { kind: "sd", at: mm(101) },
      ],
      back: [],
      height: mm(6.5),
      finish: PORT_FINISH,
    },
  },
  /**
   * Lenovo Legion Pro 7 16 Gen 9 (16IRX9H, 2024) in eclipse black: 363.5 × 262.1 mm, 21.95 to 25.9 mm with its
   * lid (PSREF), anodised aluminium, a rear block behind the hinge, three vents in each side's back half, a
   * 16-inch 16:10 panel (344.6 × 215.4 mm), a full keyboard with a number pad (key-tops.ts) lit per key in RGB,
   * a 120 × 75 mm trackpad left of centre, and a light along the front.
   */
  gaming: {
    base: [mm(363.5), mm(262.1), mm(19)],
    wedge: mm(2),
    corners: [mm(5), mm(3.5)],
    rims: [mm(1), mm(3)],
    lid: mm(6.6),
    lidDepth: mm(232),
    hinge: mm(29),
    hingeCover: {
      length: mm(300),
      radius: mm(5),
      barrel: mm(18),
      finish: { color: "#141517", roughness: 0.6 },
    },
    display: [mm(344.6), mm(215.4)],
    chin: mm(10.5),
    rim: mm(0),
    notch: null,
    layout: "legion",
    keyRise: mm(1.6),
    well: {
      size: null,
      back: 0,
      margin: mm(1.6),
      depth: mm(1.2),
      corner: mm(2),
      finish: { color: "#0a0a0b", roughness: 0.6 },
    },
    keysBack: mm(58),
    keysX: mm(-0.5),
    grilles: null,
    power: { at: [0, mm(4)], diameter: mm(8) },
    trackpad: [mm(120), mm(75)],
    trackpadFront: mm(10),
    trackpadX: mm(-43),
    pad: { color: "#1f2023", roughness: 0.45, metallic: 0.3 },
    body: { color: "#232427", roughness: 0.5, metallic: 0.6 },
    keys: { color: "#101012", roughness: 0.6 },
    glass: { color: "#050506", roughness: 0.4 },
    bezel: { color: "#0f0f10", roughness: 0.6 },
    scoop: null,
    feet: {
      size: [mm(60), mm(7)],
      height: mm(3),
      inset: [mm(60), mm(16), mm(16)],
      finish: { color: "#121212", roughness: 0.9 },
    },
    ports: {
      left: [
        { kind: "vent", at: mm(24) },
        { kind: "vent", at: mm(53) },
        { kind: "vent", at: mm(82) },
        { kind: "usba", at: mm(105) },
        { kind: "usbc", at: mm(122) },
      ],
      right: [
        { kind: "vent", at: mm(24) },
        { kind: "vent", at: mm(53) },
        { kind: "vent", at: mm(82) },
        { kind: "usba", at: mm(106) },
        { kind: "lock", at: mm(124) },
        { kind: "jack", at: mm(160) },
      ],
      back: [
        { kind: "usba", at: mm(-80) },
        { kind: "hdmi", at: mm(-55) },
        { kind: "rj45", at: mm(-30) },
        { kind: "usbc", at: mm(30) },
        { kind: "usba", at: mm(50) },
        { kind: "usbc", at: mm(70) },
      ],
      height: mm(10),
      finish: PORT_FINISH,
    },
    frontLight: {
      color: ["#ff2a55", "#ff8a00", "#ffe600", "#2bff6a", "#00c8ff", "#7a3cff"],
      strength: 4,
    },
    backlight: {
      color: [
        "#9a4dff",
        "#e040c0",
        "#ff3a5a",
        "#ff8a2a",
        "#e8e040",
        "#40e8a0",
        "#30d8e0",
      ],
      strength: 10,
    },
  },
} satisfies Record<string, Partial<LaptopOptions>>;

/** The laptop under an empty at `at` (the base's centre on the desk), its front towards -y. */
export function laptop(
  bpy: Bpy,
  at: Vec3,
  over: Partial<LaptopOptions> = {},
  parent?: ModelObject,
): ModelObject {
  const o = { ...LAPTOP_DEFAULTS, ...over };
  const [bw, bd, bh] = o.base;
  const root = group(bpy, "Laptop", at, parent);
  const body = finish(bpy, "LaptopBody", o.body);
  const black = finish(bpy, "LaptopKeys", o.keys);
  const glass = finish(bpy, "LaptopGlass", o.glass);
  const lift = o.feet.height;
  // The deck's height over the desk at a depth y: the back's, less the wedge towards the front.
  const top = (y: number): number => lift + bh - o.wedge * (0.5 - y / bd);
  const slope = Math.atan2(o.wedge, bd);
  const base = profiledSlab(
    bpy,
    "LaptopBase",
    [bw, bd],
    (y) => bh - o.wedge * (0.5 - y / bd),
    o.corners[0],
    o.rims,
    body,
    { parent: root, at: [0, 0, lift] },
  );
  // Everything on the deck lies in its plane: z 0 is its surface, at its middle.
  const deck = group(bpy, "LaptopDeck", [0, 0, top(0)], root);
  deck.rotation_euler = [slope, 0, 0];
  const cuts = new Cuts(bpy, "LaptopCuts", root);

  // The keys, centred in the well (or at `keysBack` from the back without one).
  const tops = laptopKeyTops(o.layout, o.keyShape);
  const [kw, kd] = keyExtent(tops);
  const well = o.well;
  const keysY = well?.size
    ? bd / 2 - well.back - well.size[1] / 2
    : bd / 2 - o.keysBack - kd / 2;
  const keyTops = tops.map((t) => ({
    ...t,
    cx: t.cx + o.keysX,
    cy: t.cy + keysY,
  }));
  const floor = well ? -well.depth : 0;
  // The well's rectangles: its size, or the keys' extent and a dropped row's, each `margin` wider.
  const rects: Rect[] = well?.size
    ? [{ x: o.keysX, y: keysY, w: well.size[0], d: well.size[1] }]
    : wellRects(keyTops, well?.margin ?? 0);
  if (well) {
    const wellFinish = well.finish
      ? finish(bpy, "LaptopWell", well.finish)
      : body;
    rects.forEach((r, i) => {
      cuts.add(
        // A later rectangle's floor a hair lower, so no two cuts share a plane.
        roundedPrism(
          r.w,
          r.d,
          well.corner,
          [floor - i * mm(0.05), mm(5)],
          [r.x, r.y],
          slope,
          top(0),
        ),
        wellFinish,
        `well.${String(i)}`,
      );
    });
  }
  const keyTop = o.keyRise;
  keyCaps(bpy, keyTops, floor, keyTop, black, deck);
  const style = LAPTOP_LAYOUTS[o.layout].style;
  const legendImage = "//assets/media/textures/keycap-legends/mac.png";
  const legends = legendDecals(
    bpy,
    "LaptopLegends",
    style,
    keyTops,
    keyTop + mm(0.04),
    atlas,
    legendImage,
    deck,
  );
  if (o.backlight) {
    backlightSpill(
      bpy,
      "LaptopBacklight",
      keyTops,
      floor + mm(0.05),
      o.backlight,
      deck,
    );
    backlightLegends(bpy, legends, legendImage, o.backlight);
  }
  if (o.nub) {
    // The stick stands where G, H and B meet.
    const find = (l: string): KeyTop | undefined =>
      keyTops.find((t) => t.legend === l);
    const g = find("G");
    const h = find("H");
    const b = find("B");
    if (g && h && b)
      cylinder(
        bpy,
        "LaptopNub",
        mm(3),
        keyTop + mm(0.6) - floor,
        finish(bpy, "LaptopNub", o.nub),
        {
          parent: deck,
          at: [
            (g.cx + g.w / 2 + h.cx - h.w / 2) / 2,
            (g.cy - g.h / 2 + b.cy + b.h / 2) / 2,
            (floor + keyTop + mm(0.6)) / 2,
          ],
          segments: 24,
          radius: mm(1),
        },
      );
  }
  // The keys' outer edges, for what sits beside them.
  const ext = {
    x0: o.keysX - kw / 2,
    x1: o.keysX + kw / 2,
    y0: keysY - kd / 2,
    y1: keysY + kd / 2,
  };
  if (o.grilles) {
    const g = o.grilles;
    const main = rects[0] ?? { x: o.keysX, y: keysY, w: kw, d: kd };
    const side = well ? main.w / 2 : kw / 2;
    const span = well ? main.d : kd;
    const length = span - g.ends[0] - g.ends[1];
    const cy = (well ? main.y : keysY) + (g.ends[1] - g.ends[0]) / 2;
    const [r, gr, b] = linear(o.body.color);
    const holes =
      g.holes ??
      (0.2126 * r + 0.7152 * gr + 0.0722 * b > 0.18 ? "dark" : "light");
    grilles(
      bpy,
      { ...g, holes },
      [
        o.keysX - side - g.gap - g.width / 2,
        o.keysX + side + g.gap + g.width / 2,
      ],
      cy,
      length,
      deck,
    );
  }
  if (o.power) {
    const [px, py] = o.power.at;
    cylinder(
      bpy,
      "LaptopPower",
      o.power.diameter / 2,
      mm(0.6),
      finish(bpy, "LaptopPower", { color: "#0c0c0d", roughness: 0.35 }),
      {
        parent: deck,
        at: [o.keysX + px, ext.y1 + py + o.power.diameter / 2, mm(0.1)],
        segments: 40,
        radius: mm(0.25),
      },
    );
  }

  // The trackpad: its glass a hair proud of the deck in a dark seam.
  const [tw, td] = o.trackpad;
  const buttons = o.padButtons;
  const padY = -bd / 2 + o.trackpadFront + td / 2;
  slab(
    bpy,
    "LaptopTrackpadSeam",
    [tw + mm(0.8), td + mm(0.8) + (buttons?.depth ?? 0), mm(0.1)],
    mm(4.4),
    finish(bpy, "LaptopSeam", { color: "#0a0a0b", roughness: 0.7 }),
    {
      parent: deck,
      at: [o.trackpadX, padY + (buttons?.depth ?? 0) / 2, -mm(0.02)],
    },
  );
  const pad = finish(bpy, "LaptopTrackpad", o.pad);
  slab(bpy, "LaptopTrackpad", [tw, td, mm(0.16)], mm(4), pad, {
    parent: deck,
    at: [o.trackpadX, padY, 0],
  });
  if (buttons) padKeys(bpy, buttons, [tw, td], [o.trackpadX, padY], pad, deck);

  // The front's lip, the ports and the vents, cut out of the base.
  if (o.scoop) {
    const [sw, sd] = o.scoop;
    const s = sd * Math.SQRT2;
    cuts.add(
      boxPrism([sw, s, s], [0, -bd / 2, top(-bd / 2)], [deg(45), 0, 0]),
      body,
    );
  }
  const portsFinish = finish(bpy, "LaptopPorts", o.ports.finish);
  const portZ = lift + o.ports.height;
  for (const [side, list] of [
    [-1, o.ports.left],
    [1, o.ports.right],
  ] as const)
    for (const p of list) {
      const [len, h, r] = PORT_SIZES[p.kind];
      cuts.add(
        roundedPrismX(len, h, r, mm(6), [
          side * (bw / 2),
          bd / 2 - p.at,
          portZ,
        ]),
        portsFinish,
      );
    }
  for (const p of o.ports.back) {
    const [len, h, r] = PORT_SIZES[p.kind];
    cuts.add(
      roundedPrismY(len, h, r, mm(6), [p.at, bd / 2, portZ]),
      portsFinish,
    );
  }
  cuts.apply(base);

  // The feet under the corners: round, or bars along x.
  const [fw, fd] = o.feet.size;
  const [fx, ffront, fback] = o.feet.inset;
  const footFinish = finish(bpy, "LaptopFeet", o.feet.finish);
  for (const [sx, sy] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ] as const) {
    const name = `LaptopFoot.${sx > 0 ? "R" : "L"}${sy > 0 ? "B" : "F"}`;
    const fy = sy > 0 ? bd / 2 - fback : -bd / 2 + ffront;
    slab(
      bpy,
      name,
      [fw, fd, lift + mm(0.5)],
      Math.min(fw, fd) / 2,
      footFinish,
      {
        parent: root,
        at: [sx * (bw / 2 - fx), fy, 0],
        edge: Math.min(lift * 0.6, mm(1)),
      },
    );
  }
  if (o.frontLight)
    frontLight(bpy, o.frontLight, bw, bd, lift, o.rims[1], root);

  // The lid turns about the hinge, its inside (the display) facing down when closed.
  const hingeY = bd / 2 - o.hinge;
  const hinge = group(bpy, "LaptopHinge", [0, hingeY, top(hingeY)], root);
  hinge.rotation_euler = [-deg(o.open) + slope, 0, 0];
  const ld = o.lidDepth;
  profiledSlab(
    bpy,
    "LaptopLid",
    [bw, ld],
    () => o.lid,
    o.corners[0],
    [Math.min(o.rims[0], o.lid / 3), Math.min(o.rims[0] * 1.5, o.lid / 3)],
    body,
    { parent: hinge, at: [0, -ld / 2, 0] },
  );
  if (o.cameraBar) {
    const [cw, ch, cd] = o.cameraBar;
    slab(bpy, "LaptopCameraBar", [cw, cd, o.lid + ch], mm(2.5), body, {
      parent: hinge,
      at: [0, -ld + cd / 2 - ch, 0],
      edge: mm(1.2),
    });
  }
  // The display's cover, edge to edge but for the lid's rim (or a matte bezel), and its active area: `LaptopScreen`.
  const cover = o.bezel ? finish(bpy, "LaptopBezel", o.bezel) : glass;
  slab(
    bpy,
    "LaptopBezel",
    [bw - 2 * o.rim - mm(0.4), ld - 2 * o.rim - mm(0.4), mm(0.3)],
    o.corners[1],
    cover,
    { parent: hinge, at: [0, -ld / 2, -mm(0.3)] },
  );
  const [dw, dh] = o.display;
  box(bpy, "LaptopScreen", [dw, dh, mm(0.2)], glass, {
    parent: hinge,
    at: [0, -o.chin - dh / 2, -mm(0.4)],
  });
  const lidTop = -ld + o.rim + mm(0.2);
  if (o.notch) {
    // The notch stands over the screen (and the picture a scene lays 0.3 mm over it), up into the border.
    const [nw, nh] = o.notch;
    const into = -o.chin - dh - lidTop;
    slab(bpy, "LaptopNotch", [nw, nh + into, mm(0.15)], mm(1.6), glass, {
      parent: hinge,
      at: [0, lidTop + (nh + into) / 2, -mm(1)],
    });
  }
  // The camera, a dark lens in the border's middle (or the notch's).
  cylinder(
    bpy,
    "LaptopCamera",
    mm(1.1),
    mm(0.1),
    finish(bpy, "LaptopCamera", { color: "#14161c", roughness: 0.15 }),
    {
      parent: hinge,
      at: [
        0,
        lidTop + (o.notch ? o.notch[1] * 0.45 : (-o.chin - dh - lidTop) / 2),
        -mm(1.18),
      ],
      segments: 24,
    },
  );
  if (o.hingeCover) {
    const hc = o.hingeCover;
    const along: Vec3 = [0, deg(90), 0];
    cylinder(
      bpy,
      "LaptopHingeCover",
      hc.radius,
      hc.length,
      finish(bpy, "LaptopHingeCover", hc.finish),
      {
        parent: hinge,
        at: [0, 0, o.lid / 2 - hc.radius * 0.2],
        rotation: along,
        segments: 32,
      },
    );
    for (const s of [-1, 1])
      cylinder(
        bpy,
        `LaptopHingeBarrel.${s > 0 ? "R" : "L"}`,
        hc.radius * 1.02,
        hc.barrel,
        body,
        {
          parent: hinge,
          at: [
            s * (hc.length / 2 + hc.barrel / 2),
            0,
            o.lid / 2 - hc.radius * 0.2,
          ],
          rotation: along,
          segments: 32,
          radius: mm(0.6),
        },
      );
  }
  return root;
}

/**
 * A slab whose plan is a rectangle `w` × `d` with corners rounded by `corner`, `height(y)` tall at depth y (a
 * wedge when it varies), its top rim rounded by `rims[0]` and its underside's by `rims[1]`: one closed mesh, so a
 * Boolean can cut it.
 */
function profiledSlab(
  bpy: Bpy,
  name: string,
  [w, d]: [number, number],
  height: (y: number) => number,
  corner: number,
  [rt, rb]: [number, number],
  material: ModelMaterial,
  o: { parent?: ModelObject; at?: Vec3 } = {},
): ModelObject {
  const n = 10;
  const arc = 5;
  const ring = (inset: number): [number, number][] => {
    const r = Math.max(corner - inset, mm(0.2));
    const hw = w / 2 - inset;
    const hd = d / 2 - inset;
    const out: [number, number][] = [];
    for (const [cx, cy, start] of [
      [hw - r, -hd + r, -90],
      [hw - r, hd - r, 0],
      [-hw + r, hd - r, 90],
      [-hw + r, -hd + r, 180],
    ] as const)
      for (let i = 0; i <= n; i++) {
        const a = deg(start + (90 * i) / n);
        out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
    return out;
  };
  // The profile from the underside's middle round to the top's: [inset, z from the bottom, from the top].
  const steps: [number, number, "bottom" | "top"][] = [];
  for (let i = 0; i <= arc; i++) {
    const t = deg((90 * i) / arc);
    steps.push([rb * (1 - Math.sin(t)), rb * (1 - Math.cos(t)), "bottom"]);
  }
  for (let i = 0; i <= arc; i++) {
    const t = deg((90 * i) / arc);
    steps.push([rt * (1 - Math.cos(t)), rt * (1 - Math.sin(t)), "top"]);
  }
  const v: Vec3[] = [];
  const rings = steps.map(([inset, z, from]) => {
    const start = v.length;
    for (const [x, y] of ring(inset))
      v.push([x, y, from === "bottom" ? z : height(y) - z]);
    return start;
  });
  const k = ring(0).length;
  const f: number[][] = [
    [...Array(k).keys()].map((i) => (rings[0] ?? 0) + i).reverse(),
  ];
  for (let s = 0; s + 1 < rings.length; s++) {
    const a = rings[s] ?? 0;
    const b = rings[s + 1] ?? 0;
    for (let i = 0; i < k; i++)
      f.push([a + i, a + ((i + 1) % k), b + ((i + 1) % k), b + i]);
  }
  const last = rings[rings.length - 1] ?? 0;
  f.push([...Array(k).keys()].map((i) => last + i));
  const object = solid(bpy, name, v, f, material, {
    parent: o.parent,
    at: o.at,
    smooth: true,
  });
  return object;
}

/** A closed mesh's vertices and faces, in its owner's space. */
interface Shape {
  v: Vec3[];
  f: number[][];
}

/**
 * The cuts a base takes, by material: each is a hidden object of closed shapes that a Boolean difference
 * takes out of the base, its faces giving the cut's walls their finish.
 */
class Cuts {
  private readonly sets = new Map<
    string,
    { material: ModelMaterial; shape: Shape }
  >();
  // Plain fields, not parameter properties: Node runs this file with its types stripped (allyhub 3d-model).
  private readonly bpy: Bpy;
  private readonly name: string;
  private readonly parent: ModelObject;
  constructor(bpy: Bpy, name: string, parent: ModelObject) {
    this.bpy = bpy;
    this.name = name;
    this.parent = parent;
  }
  /** Shapes under one `key` (by default their material's name) are one cutter: they must not overlap. */
  add(shape: Shape, material: ModelMaterial, key = material.name): void {
    const entry = this.sets.get(key) ?? { material, shape: { v: [], f: [] } };
    const set = entry.shape;
    const b = set.v.length;
    // A Boolean needs each shape's faces wound outwards: a mirrored placement turns them in.
    const out = volume(shape) >= 0;
    set.v.push(...shape.v);
    set.f.push(
      ...shape.f.map((face) =>
        (out ? face : [...face].reverse()).map((i) => i + b),
      ),
    );
    this.sets.set(key, entry);
  }
  apply(target: ModelObject): void {
    let i = 0;
    for (const { material, shape: set } of this.sets.values()) {
      const cutter = solid(
        this.bpy,
        `${this.name}.${String(i)}`,
        set.v,
        set.f,
        material,
        {
          parent: this.parent,
        },
      );
      cutter.hide_render = true;
      cutter.hide_viewport = true;
      const cut = target.modifiers.new(`Cut.${String(i)}`, "BOOLEAN");
      cut.operation = "DIFFERENCE";
      cut.solver = "MANIFOLD";
      cut.material_mode = "TRANSFER";
      cut.object = cutter;
      i += 1;
    }
  }
}

/** A rectangle in the deck's plane: its centre and size (m). */
interface Rect {
  x: number;
  y: number;
  w: number;
  d: number;
}

/**
 * A well fitted round the keys, `m` wider: one rectangle round every key but a row dropped below the bottom
 * row (keys whose middle is under the space bar's front edge), and one round that row reaching up into the first.
 */
function wellRects(tops: readonly KeyTop[], m: number): Rect[] {
  const box = (ks: readonly KeyTop[]): Rect => {
    const x0 = Math.min(...ks.map((k) => k.cx - k.w / 2)) - m;
    const x1 = Math.max(...ks.map((k) => k.cx + k.w / 2)) + m;
    const y0 = Math.min(...ks.map((k) => k.cy - k.h / 2)) - m;
    const y1 = Math.max(...ks.map((k) => k.cy + k.h / 2)) + m;
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: x1 - x0, d: y1 - y0 };
  };
  const space = tops.reduce(
    (a, k) => (k.legend === "" && k.w > a.w ? k : a),
    tops[0] as KeyTop,
  );
  const edge = space.cy - space.h / 2;
  const dropped = tops.filter((k) => k.cy < edge);
  const rest = tops.filter((k) => k.cy >= edge);
  const main = box(rest);
  if (dropped.length === 0) return [main];
  const low = box(dropped);
  const top = main.y - main.d / 2 + 2 * m;
  const bottom = low.y - low.d / 2;
  return [main, { x: low.x, y: (top + bottom) / 2, w: low.w, d: top - bottom }];
}

/** A closed shape's signed volume: positive when its faces are wound outwards. */
function volume({ v, f }: Shape): number {
  let sum = 0;
  for (const face of f) {
    const at = (i: number): Vec3 => v[face[i] ?? 0] ?? [0, 0, 0];
    const [ax, ay, az] = at(0);
    for (let i = 1; i + 1 < face.length; i++) {
      const [bx, by, bz] = at(i);
      const [cx, cy, cz] = at(i + 1);
      sum +=
        ax * (by * cz - bz * cy) -
        ay * (bx * cz - bz * cx) +
        az * (bx * cy - by * cx);
    }
  }
  return sum / 6;
}

/** A rounded rectangle's outline in a plane, `r` its corners' radius, `n` steps a corner. */
function roundedRect(
  w: number,
  h: number,
  r: number,
  n = 6,
): [number, number][] {
  const rr = Math.min(r, w / 2 - 1e-5, h / 2 - 1e-5);
  const out: [number, number][] = [];
  for (const [cx, cy, start] of [
    [w / 2 - rr, -h / 2 + rr, -90],
    [w / 2 - rr, h / 2 - rr, 0],
    [-w / 2 + rr, h / 2 - rr, 90],
    [-w / 2 + rr, -h / 2 + rr, 180],
  ] as const)
    for (let i = 0; i <= n; i++) {
      const a = deg(start + (90 * i) / n);
      out.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
  return out;
}

/** An outline extruded between two depths, each point placed by `at(u, v, depth)`. */
function prism(
  outline: [number, number][],
  [d0, d1]: [number, number],
  at: (u: number, v: number, d: number) => Vec3,
): Shape {
  const k = outline.length;
  const v: Vec3[] = [
    ...outline.map(([a, b]) => at(a, b, d0)),
    ...outline.map(([a, b]) => at(a, b, d1)),
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
  return { v, f };
}

/**
 * A rounded rectangle in the deck's plane, from `z0` to `z1` over it, centred at (x, y) of the deck: in the base's
 * space, the deck tilted by `slope` about x at `mid` over the base's middle.
 */
function roundedPrism(
  w: number,
  d: number,
  r: number,
  [z0, z1]: [number, number],
  [x, y]: [number, number],
  slope: number,
  mid: number,
): Shape {
  const c = Math.cos(slope);
  const s = Math.sin(slope);
  return prism(roundedRect(w, d, r, 8), [z0, z1], (u, v, z) => {
    const yy = y + v;
    return [x + u, yy * c - z * s, mid + yy * s + z * c];
  });
}

/** A rounded opening in a side (x = `at[0]`): `len` along y, `h` high, `depth` into the base. */
function roundedPrismX(
  len: number,
  h: number,
  r: number,
  depth: number,
  [x, y, z]: Vec3,
): Shape {
  return prism(roundedRect(len, h, r), [-depth, depth / 3], (u, v, d) => [
    x - Math.sign(x) * -d,
    y + u,
    z + v,
  ]);
}

/** A rounded opening in the back (y = `at[1]`): `len` along x, `h` high, `depth` into the base. */
function roundedPrismY(
  len: number,
  h: number,
  r: number,
  depth: number,
  [x, y, z]: Vec3,
): Shape {
  return prism(roundedRect(len, h, r), [-depth, depth / 3], (u, v, d) => [
    x + u,
    y + d,
    z + v,
  ]);
}

/** A box `size` centred at `at`, turned by `rotation` (x, then y, then z). */
function boxPrism(size: Vec3, at: Vec3, rotation: Vec3): Shape {
  const [sx, sy, sz] = size.map((s) => s / 2) as [number, number, number];
  const [rx] = rotation;
  const c = Math.cos(rx);
  const s = Math.sin(rx);
  return prism(
    [
      [-sx, -sy],
      [sx, -sy],
      [sx, sy],
      [-sx, sy],
    ],
    [-sz, sz],
    (u, v, w) => [at[0] + u, at[1] + v * c - w * s, at[2] + v * s + w * c],
  );
}

/** The keys as one mesh: a block per key from `z0` to `z1`, its top's edge rounded. */
function keyCaps(
  bpy: Bpy,
  tops: readonly KeyTop[],
  z0: number,
  z1: number,
  material: ModelMaterial,
  parent: ModelObject,
): void {
  const v: Vec3[] = [];
  const f: number[][] = [];
  for (const k of tops) {
    const b = v.length;
    const x = k.w / 2;
    const y = k.h / 2;
    v.push(
      [k.cx - x, k.cy - y, z0],
      [k.cx + x, k.cy - y, z0],
      [k.cx + x, k.cy + y, z0],
      [k.cx - x, k.cy + y, z0],
      [k.cx - x, k.cy - y, z1],
      [k.cx + x, k.cy - y, z1],
      [k.cx + x, k.cy + y, z1],
      [k.cx - x, k.cy + y, z1],
    );
    f.push(
      [b + 4, b + 5, b + 6, b + 7],
      [b, b + 1, b + 5, b + 4],
      [b + 1, b + 2, b + 6, b + 5],
      [b + 2, b + 3, b + 7, b + 6],
      [b + 3, b, b + 4, b + 7],
    );
  }
  const keys = solid(bpy, "LaptopKeycaps", v, f, material, {
    parent,
    smooth: true,
  });
  const round = keys.modifiers.new("Round", "BEVEL");
  round.width = mm(0.35);
  round.segments = 2;
  round.limit_method = "NONE";
  keys.modifiers.new("Normals", "WEIGHTED_NORMAL").keep_sharp = true;
}

/** A grille patch's size (m): its atlas cell holds 14 holes across. */
const GRILLE_PATCH = mm(13.6);

/** The speaker grilles: a strip at each x of `xs`, `length` long, its holes printed in patches. */
function grilles(
  bpy: Bpy,
  g: NonNullable<LaptopOptions["grilles"]>,
  xs: number[],
  cy: number,
  length: number,
  parent: ModelObject,
): void {
  // Square patches about `GRILLE_PATCH` wide (the holes some 1 mm apart), as many as the strip holds.
  const across = Math.max(1, Math.round(g.width / GRILLE_PATCH));
  const tile = g.width / across;
  const n = Math.max(1, Math.floor(length / tile));
  const patches: KeyTop[] = xs.flatMap((x) =>
    Array.from({ length: n * across }, (_, i) => ({
      cx: x - g.width / 2 + ((i % across) + 0.5) * tile,
      cy: cy - (n * tile) / 2 + (Math.floor(i / across) + 0.5) * tile,
      w: tile,
      h: tile,
      legend: "g:grille",
      accent: false,
    })),
  );
  legendDecals(
    bpy,
    "LaptopGrilles",
    "mac",
    patches,
    mm(0.03),
    atlas,
    `//assets/media/textures/keycap-legends/${g.holes === "light" ? "mac" : "ansi-dark"}.png`,
    parent,
  );
}

/** A ThinkPad's buttons over its trackpad: left and right, and a middle one narrowing towards the pad. */
function padKeys(
  bpy: Bpy,
  b: NonNullable<LaptopOptions["padButtons"]>,
  [tw, td]: [number, number],
  [x, y]: [number, number],
  material: ModelMaterial,
  parent: ModelObject,
): void {
  const y0 = y + td / 2 + mm(0.6);
  const y1 = y0 + b.depth;
  const [mt, mf] = b.middle;
  const gap = mm(0.6);
  const h = mm(0.3);
  const v: Vec3[] = [];
  const f: number[][] = [];
  const quad = (pts: [number, number][]) => {
    const s = v.length;
    for (const [px, py] of pts) v.push([px, py, 0]);
    for (const [px, py] of pts) v.push([px, py, h]);
    const k = pts.length;
    f.push([...Array(k).keys()].map((i) => s + k + i));
    for (let i = 0; i < k; i++)
      f.push([s + i, s + ((i + 1) % k), s + k + ((i + 1) % k), s + k + i]);
  };
  quad([
    [x - tw / 2, y0],
    [x - mf / 2 - gap, y0],
    [x - mt / 2 - gap, y1],
    [x - tw / 2, y1],
  ]);
  quad([
    [x - mf / 2, y0],
    [x + mf / 2, y0],
    [x + mt / 2, y1],
    [x - mt / 2, y1],
  ]);
  quad([
    [x + mf / 2 + gap, y0],
    [x + tw / 2, y0],
    [x + tw / 2, y1],
    [x + mt / 2 + gap, y1],
  ]);
  solid(bpy, "LaptopPadButtons", v, f, material, { parent });
  // The red stripes along the side buttons' front edges.
  for (const s of [-1, 1])
    box(
      bpy,
      `LaptopPadStripe.${s > 0 ? "R" : "L"}`,
      [(tw - mf) / 2 - gap - mm(1), mm(0.5), mm(0.02)],
      finish(bpy, "LaptopPadStripe", b.stripe),
      {
        parent,
        at: [x + s * ((tw + mf) / 4 + gap / 2), y0 + mm(0.5), h + mm(0.01)],
      },
    );
}

/** A light along the base's front, at its foot: bands of colour left to right, each glowing. */
function frontLight(
  bpy: Bpy,
  light: Backlight,
  bw: number,
  bd: number,
  lift: number,
  under: number,
  parent: ModelObject,
): void {
  const colours = typeof light.color === "string" ? [light.color] : light.color;
  const span = bw - 2 * mm(20);
  const band = span / colours.length;
  colours.forEach((c, i) => {
    box(
      bpy,
      `LaptopFrontLight.${String(i)}`,
      [band, mm(0.3), mm(1)],
      finish(bpy, `LaptopFrontLight.${String(i)}`, {
        color: "#0b0b0c",
        roughness: 0.6,
        emission: { color: c, strength: light.strength },
      }),
      {
        parent,
        at: [
          -span / 2 + (i + 0.5) * band,
          -bd / 2 + under * 0.24 - mm(0.1),
          lift + under * 0.35,
        ],
      },
    );
  });
}
