// A mechanical keyboard, ANSI, tenkeyless (87 keys), 75% (84 keys), 65% (67 keys and a knob) or full size
// (104 keys), at the standard key pitch of 19.05 mm; or a low-profile board with a laptop's keys (`compact`).
// By default a Keychron K8 Pro in black. In popular demo videos, keyboards: median 0.36 × 0.14 m, on the desk
// 0.3 m in front of the screen. KEYBOARD_PRESETS holds the K8 Pro in white, Apple's Magic Keyboard, a Keychron
// K10, a Logitech MX Keys S and a Keychron Q2 Pro in Keychron's Retro keycaps, each one model named in its comment.
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
  solid,
  type Finish,
} from "./parts.ts";
import {
  boardKeyTops,
  boardUnits,
  fullKeyTops,
  FULL_WIDTHS,
  boardLabels,
  keyExtent,
  LAPTOP_LAYOUTS,
  laptopKeyTops,
  MAGIC_KEYS,
  seventyFiveKeyTops,
  SEVENTY_FIVE_F_ROW,
  SEVENTY_FIVE_WIDTHS,
  SIXTY_FIVE_DROP,
  SIXTY_FIVE_KNOB,
  SIXTY_FIVE_WIDTHS,
  sixtyFiveKeyTops,
  TKL_F_ROW,
  TKL_WIDTHS,
  type BoardPrint,
  type KeyTop,
  type LaptopKeyShape,
  type LaptopLayout,
  type LegendStyle,
} from "./key-tops.ts";
import {
  backlightLegends,
  backlightSpill,
  type Backlight,
} from "./backlight.ts";
import { legendDecals } from "./legends.ts";
import atlas from "../../assets/media/textures/keycap-legends/atlas.json" with { type: "json" };

/** A row's keys as widths in units (u); a negative width is a gap of that many units. */
type Row = number[];

// The layouts' rows (key-tops.ts, where their legends are too).
const F_ROW: Row = TKL_F_ROW;
const TKL: Row[] = TKL_WIDTHS;
const F_ROW_75: Row = SEVENTY_FIVE_F_ROW;
const SEVENTY_FIVE: Row[] = SEVENTY_FIVE_WIDTHS;
const FULL: Row[] = FULL_WIDTHS;
const SIXTY_FIVE: Row[] = SIXTY_FIVE_WIDTHS;

/** A rotary knob over a board's right column (a 65% board's), standing in a square pocket of the case's top. */
export interface Knob {
  /** Its diameter and how far it stands over the case's top (m). */
  diameter: number;
  height: number;
  /** The side of the square pocket it stands in (m), drawn in the plate's finish; 0 for none. */
  pocket: number;
  finish: Finish;
}

/** A Keychron K10's grey set: besides every word and sign, the arrows, the pad's operators and F5–F8. */
const K10_MOD_LEGENDS = [
  "⌘",
  "◀",
  "▲",
  "▼",
  "▶",
  "/",
  "*",
  "-",
  "+",
  "f:5",
  "f:6",
  "f:7",
  "f:8",
];

export interface KeyboardOptions {
  /**
   * "tkl" (87 keys), "75" (84), "65" (67, a Keychron Q2's: no function row, its knob in `knob`), "full" (104,
   * with its number pad), or "compact": a laptop's 78 keys at its 19 mm pitch and 15.6 mm caps (key-tops.ts),
   * whatever `pitch` and `capGap` say, for a low-profile board.
   */
  layout: "tkl" | "75" | "65" | "full" | "compact";
  /**
   * A "compact" board's keys: a laptop layout of key-tops.ts (a Mac's, or an MX Keys') at these measures over
   * its own (the Magic Keyboard's by default).
   */
  compactLayout: LaptopLayout;
  compactKeys: Partial<LaptopKeyShape>;
  /** What a "tkl", "75", "65" or "full" board's keys print: a Keychron's Mac keycaps (centred) or an ANSI board's (top left). */
  print: BoardPrint;
  /** The gap between a "tkl" or "full" board's function row and the rest, in units. */
  fGap: number;
  /** The key pitch (m): 19.05 mm on every standard board. */
  pitch: number;
  /** The case's border round the keys (m), and its front and back heights (the typing angle). */
  border: number;
  /** The border behind the keys (m), when wider than `border` (a Keychron Q2's); null for `border`. */
  backBorder: number | null;
  front: number;
  back: number;
  /** The rounding of the case's edges (m). */
  round: number;
  /** How far the keys' plate sits below the case's top (m): a keycap shows `capHeight` − `well` above it. */
  well: number;
  /** Keycap height (m), its base inset from the pitch and its top inset from its base, each side. */
  capHeight: number;
  capGap: number;
  capTaper: [number, number];
  /**
   * How deep each key's top is dished (m), 0 for flat: a round dish centred on the top, as deep as this at its
   * middle and level with the top's edge at the nearest side (a long key's dish is a stadium along it), a
   * spherical dish's parabola. The legends stay just over the top's edge, at most this far over the dish.
   */
  dish: number;
  case: Finish;
  /** The plate under the keys (hidden by a solid case; seen where a case is open). */
  plate: Finish;
  /**
   * Whether the case's top is open round the keys, as an aluminium case's is: the plate shows in a cell of the
   * pitch round each key (the gap between two clusters stays the case's), not the case's top.
   */
  openings: boolean;
  /** A knob over the right column, at the layout's place for it (a "65" board's); null for none. */
  knob: Knob | null;
  keys: Finish;
  /** Which keys are accent keys (`accent`'s finish, light legends): esc and enter, esc alone, or none. */
  accents: "esc+enter" | "esc" | "none";
  accent: Finish;
  /**
   * The modifiers' finish, for a two-tone set: every key whose legend is a word or a sign, and those whose
   * legend is in `modLegends`; null for the keys' own.
   */
  mods: Finish | null;
  /**
   * The other legends `mods` colours (key-tops.ts's): by default a Keychron K10's grey set's, the arrows, the
   * pad's operators and F5–F8.
   */
  modLegends: readonly string[];
  /**
   * The legends' colours: "dark" on light caps, "light" on dark ones (the accent keys' always light); null for
   * none. A "compact" board prints a laptop's legends, in either.
   */
  legends: "dark" | "light" | null;
  /** The keys lit from below (backlight.ts: the legends and the light round each key); null for none. */
  backlight: Backlight | null;
}

/**
 * A Keychron K8 Pro (tenkeyless, 87 keys, plastic frame, black): 355 × 123 mm (Keychron's spec), a thin black
 * frame round dark grey OSA caps, red esc and enter, Keychron's Mac keycaps printed centred in white, the
 * function row 0.15 u over the rest (Keychron's top view at 3.59 px a millimetre).
 */
export const KEYBOARD_DEFAULTS: KeyboardOptions = {
  layout: "tkl",
  compactLayout: "mac",
  compactKeys: MAGIC_KEYS,
  print: "keychron",
  fGap: 0.15,
  pitch: mm(19.05),
  border: mm(2.9),
  backBorder: null,
  front: mm(23),
  back: mm(30),
  round: mm(2),
  well: mm(2),
  capHeight: mm(8.5),
  capGap: mm(1.0),
  capTaper: [mm(2.8), mm(2.4)],
  dish: 0,
  case: { color: "#1f1f21", roughness: 0.6 },
  plate: { color: "#141416", roughness: 0.6 },
  openings: false,
  knob: null,
  keys: { color: "#3a3a3d", roughness: 0.5 },
  accents: "esc+enter",
  accent: { color: "#c64a4b", roughness: 0.5 },
  mods: null,
  modLegends: K10_MOD_LEGENDS,
  legends: "light",
  backlight: null,
};

/**
 * Other boards, as options over the defaults (`keyboard(bpy, at, KEYBOARD_PRESETS.white)`; spread several
 * and your own over each other).
 */
export const KEYBOARD_PRESETS = {
  /** Keychron K8 Pro in white: white frame and caps, the same keys, esc and enter white too, dark legends. */
  white: {
    case: { color: "#e6e6e8", roughness: 0.55 },
    plate: { color: "#d8d8da", roughness: 0.6 },
    keys: { color: "#efefef", roughness: 0.5 },
    accents: "none",
    legends: "dark",
  },
  /**
   * Apple Magic Keyboard with Touch ID (2021, US English, white keys): 278.9 × 114.9 mm, 4.1 mm high at the
   * front and 10.9 mm at the back (Apple's spec), a MacBook's layout (key-tops.ts) at its own measures, white
   * scissor keys 0.8 mm proud of a silver aluminium top, dark Mac legends.
   */
  lowProfile: {
    layout: "compact",
    border: mm(3.6),
    front: mm(4.1),
    back: mm(10.9),
    round: mm(1.2),
    well: mm(0.6),
    capHeight: mm(1.4),
    capTaper: [mm(0.3), mm(0.3)],
    case: { color: "#dcdddf", roughness: 0.34, metallic: 0.55 },
    plate: { color: "#cfd0d2", roughness: 0.4, metallic: 0.5 },
    keys: { color: "#f3f4f7", roughness: 0.45 },
    accent: { color: "#f3f4f7", roughness: 0.45 },
    legends: "dark",
  },
  /**
   * Keychron K10 (full size, 104 keys, plastic frame): 435 × 120 mm (Keychron's spec), its function row tight
   * over the rest, a two-tone grey set (light letters, dark modifiers) and an orange esc on a black frame.
   */
  fullSize: {
    layout: "full",
    fGap: 0,
    border: mm(3.2),
    front: mm(20),
    back: mm(27),
    keys: { color: "#8e9094", roughness: 0.5 },
    mods: { color: "#4c4e52", roughness: 0.5 },
    accents: "esc",
    accent: { color: "#c8763a", roughness: 0.5 },
    legends: "light",
  },
  /**
   * Logitech MX Keys S in graphite (US): 430.2 × 131.6 mm, 20.5 mm high (Logitech's spec), its own layout
   * (key-tops.ts: a short function row, a 3-key navigation block, the arrows under it, the pad) of low round-
   * dished keys at 18.68 mm, printed centred in lower case.
   */
  dishedFull: {
    layout: "compact",
    compactLayout: "mxkeys",
    compactKeys: {},
    border: mm(4.4),
    front: mm(9),
    back: mm(18.5),
    round: mm(2.5),
    well: mm(1),
    capHeight: mm(3.5),
    capTaper: [mm(0.5), mm(0.5)],
    dish: mm(0.6),
    case: { color: "#55585d", roughness: 0.45, metallic: 0.5 },
    plate: { color: "#3c3f43", roughness: 0.5, metallic: 0.4 },
    keys: { color: "#1f2226", roughness: 0.55 },
    accent: { color: "#1f2226", roughness: 0.55 },
    legends: "light",
  },
  /**
   * Keychron Q2 Pro (65%, ANSI, knob, fully assembled) in carbon black, its keycaps swapped for Keychron's
   * "Retro" Double-Shot PBT OSA full set (141 keys, sold apart): beige alphas, grey modifiers (every word,
   * ⌘ and \), red esc and enter, dark legends, the arrows beige. No stock Q2 Pro comes so (its own KSA set is
   * blue-grey): this is the desk of viral "powerful websites" videos built from two products Keychron sells.
   * Measures from Keychron's Q2 Pro page: 327.5 × 121 mm, 21 mm high at the front and 34.8 mm at the back
   * without keycaps (6.5°, its 2.7 mm feet taken as in them); from its top view at 3.9 px a millimetre: 8.9 mm
   * of case either side and in front, 12.1 mm behind, del and home and the arrows 0.25 u right of the rest, the
   * arrows 0.25 u low, a 15.9 mm knob in a 20 mm pocket. The OSA caps stand 9.2–11.5 mm (Keychron's profile
   * chart), some 11.5 mm over the case's top. Colours sampled from Keychron's photos: the case's anodised
   * top, the plate between the keys and the black knob; the Retro set's alphas and modifiers warmed to the cream
   * and putty they show on desks in daylight (Keychron's studio photos light them cool and read near grey).
   */
  retro: {
    layout: "65",
    print: "keychron",
    border: mm(8.9),
    backBorder: mm(12.1),
    front: mm(21),
    back: mm(34.8),
    round: mm(1.5),
    well: mm(4.5),
    capHeight: mm(16),
    dish: mm(0.8),
    case: { color: "#393c3f", roughness: 0.5, metallic: 0.3 },
    plate: { color: "#131a1e", roughness: 0.7 },
    openings: true,
    knob: {
      diameter: mm(15.9),
      height: mm(11.5),
      pocket: mm(20),
      finish: { color: "#48484a", roughness: 0.35, metallic: 0.8 },
    },
    keys: { color: "#e6dcc6", roughness: 0.55 },
    mods: { color: "#b8b5a8", roughness: 0.55 },
    modLegends: ["⌘", "\\:|"],
    accents: "esc+enter",
    accent: { color: "#bd5b6a", roughness: 0.55 },
    legends: "dark",
  },
} satisfies Record<string, Partial<KeyboardOptions>>;

/** The keyboard under an empty at `at`, its front edge towards -y, standing on z = 0. */
export function keyboard(
  bpy: Bpy,
  at: Vec3,
  over: Partial<KeyboardOptions> = {},
  parent?: ModelObject,
): ModelObject {
  const o = { ...KEYBOARD_DEFAULTS, ...over };
  const p = o.pitch;
  const wide = o.layout === "tkl" || o.layout === "full";
  const sixtyFive = o.layout === "65";
  const fRow = wide ? F_ROW : sixtyFive ? [] : F_ROW_75;
  const rows =
    o.layout === "full"
      ? FULL
      : o.layout === "tkl"
        ? TKL
        : sixtyFive
          ? SIXTY_FIVE
          : SEVENTY_FIVE;
  const fGap = wide ? o.fGap : 0;
  const [widthU, depthU] = boardUnits(
    fRow,
    rows,
    fGap,
    sixtyFive ? SIXTY_FIVE_DROP.by : 0,
  );
  const backBorder = o.backBorder ?? o.border;
  // A compact board's keys are a laptop's, centred; its case is their extent and its border.
  const compact =
    o.layout === "compact" ? compactTops(o.compactLayout, o.compactKeys) : null;
  const width = compact
    ? compact.size[0] + 2 * o.capTaper[0] + 2 * o.border
    : widthU * p + 2 * o.border;
  const depth = compact
    ? compact.size[1] + 2 * o.capTaper[1] + o.border + backBorder
    : depthU * p + o.border + backBorder;

  const root = group(bpy, "Keyboard", at, parent);
  // The case: a wedge from `front` to `back` high, its edges rounded.
  const caseFinish = finish(bpy, "KeyboardCase", o.case);
  // The case stands on rubber feet 1.5 mm tall.
  const lift = mm(1.5);
  const x = width / 2;
  const y = depth / 2;
  const shell = solid(
    bpy,
    "KeyboardCase",
    [
      [-x, -y, lift],
      [x, -y, lift],
      [x, y, lift],
      [-x, y, lift],
      [-x, -y, o.front],
      [x, -y, o.front],
      [x, y, o.back],
      [-x, y, o.back],
    ],
    [
      [0, 3, 2, 1],
      [4, 5, 6, 7],
      [0, 1, 5, 4],
      [1, 2, 6, 5],
      [2, 3, 7, 6],
      [3, 0, 4, 7],
    ],
    caseFinish,
    { parent: root, smooth: true },
  );
  const round = shell.modifiers.new("Round", "BEVEL");
  round.width = o.round;
  round.segments = 4;
  round.limit_method = "NONE";
  shell.modifiers.new("Normals", "WEIGHTED_NORMAL").keep_sharp = true;

  // The plate the keys sit in, a dark well `well` below the case's top, along its slope, centred on the keys
  // (towards the front when the border behind them is wider).
  const slope = Math.atan2(o.back - o.front, depth);
  const keysY = (o.border - backBorder) / 2;
  const plate = group(
    bpy,
    "KeyboardDeck",
    [
      0,
      keysY,
      (o.front + o.back) / 2 + (keysY * (o.back - o.front)) / depth - o.well,
    ],
    root,
  );
  plate.rotation_euler = [slope, 0, 0];
  const plateFinish = finish(bpy, "KeyboardPlate", o.plate);
  box(
    bpy,
    "KeyboardPlate",
    [
      width - 2 * o.border + mm(1),
      depth - o.border - backBorder + mm(1),
      mm(1.5),
    ],
    plateFinish,
    { parent: plate, at: [0, 0, -mm(0.75)] },
  );
  // The case's top along the plate's slope, in the plate's own space.
  const caseTop = o.well * Math.cos(slope);

  // Every keycap as one mesh (and the accented ones as another): a tapered, rounded block per key, its top
  // and its legend from key-tops.ts.
  const caps: { v: Vec3[]; f: number[][] } = { v: [], f: [] };
  const accents: { v: Vec3[]; f: number[][] } = { v: [], f: [] };
  const modKeys: { v: Vec3[]; f: number[][] } = { v: [], f: [] };
  const laid = compact
    ? compact.tops
    : o.layout === "full"
      ? fullKeyTops(p, o.capGap, o.capTaper, o.print, o.fGap)
      : o.layout === "75"
        ? seventyFiveKeyTops(p, o.capGap, o.capTaper, o.print)
        : sixtyFive
          ? sixtyFiveKeyTops(p, o.capGap, o.capTaper, o.print)
          : boardKeyTops(p, o.capGap, o.capTaper, {
              fGap: o.fGap,
              labels: boardLabels("tkl", o.print),
            });
  const tops =
    o.accents === "esc+enter"
      ? laid
      : laid.map((k) => ({
          ...k,
          accent: k.accent && o.accents === "esc" && /esc/i.test(k.legend),
        }));
  for (const k of tops) {
    const to = k.accent
      ? accents
      : o.mods && isModifier(k.legend, o.modLegends)
        ? modKeys
        : caps;
    if (o.dish > 0) {
      dishedCap(to, k, o.capTaper, o.capHeight, o.dish);
      continue;
    }
    const tx = k.w / 2;
    const ty = k.h / 2;
    const bx = tx + o.capTaper[0];
    const by = ty + o.capTaper[1];
    const h = o.capHeight;
    const base = to.v.length;
    to.v.push(
      [k.cx - bx, k.cy - by, 0],
      [k.cx + bx, k.cy - by, 0],
      [k.cx + bx, k.cy + by, 0],
      [k.cx - bx, k.cy + by, 0],
      [k.cx - tx, k.cy - ty, h],
      [k.cx + tx, k.cy - ty, h],
      [k.cx + tx, k.cy + ty, h],
      [k.cx - tx, k.cy + ty, h],
    );
    to.f.push(
      [base + 4, base + 5, base + 6, base + 7],
      [base + 0, base + 1, base + 5, base + 4],
      [base + 1, base + 2, base + 6, base + 5],
      [base + 2, base + 3, base + 7, base + 6],
      [base + 3, base + 0, base + 4, base + 7],
    );
  }
  // The atlas's pictures are by colour: mac.png holds a Mac's light print, ansi-dark.png its dark one too, and
  // both ansi pictures a Keychron's.
  const style: LegendStyle = compact
    ? LAPTOP_LAYOUTS[o.compactLayout].style
    : o.print === "keychron"
      ? "kc"
      : "ansi";
  const legendImage =
    style === "mac" && o.legends !== "dark"
      ? "//assets/media/textures/keycap-legends/mac.png"
      : `//assets/media/textures/keycap-legends/ansi-${o.legends ?? "dark"}.png`;
  const legends = o.legends
    ? legendDecals(
        bpy,
        "KeyLegends",
        style,
        tops,
        o.capHeight + mm(0.05),
        atlas,
        legendImage,
        plate,
      )
    : null;

  const keysFinish = finish(bpy, "Keycaps", o.keys);
  const accentFinish = finish(bpy, "KeycapsAccent", o.accent);
  const modsFinish = finish(bpy, "KeycapsMods", o.mods ?? o.keys);
  for (const [name, set, f] of [
    ["Keycaps", caps, keysFinish],
    ["KeycapsAccent", accents, accentFinish],
    ["KeycapsMods", modKeys, modsFinish],
  ] as const) {
    if (set.v.length === 0) continue;
    const object = solid(bpy, name, set.v, set.f, f, {
      parent: plate,
      smooth: true,
    });
    if (o.dish > 0) {
      // A dished cap is not rounded (its top is a grid of triangles): its rims stay sharp, its dish smooth.
      if (object.data instanceof ModelMesh)
        object.data.set_sharp_from_angle(deg(40));
      continue;
    }
    const bevel = object.modifiers.new("Round", "BEVEL");
    bevel.width = mm(0.8);
    bevel.segments = 2;
    bevel.limit_method = "NONE";
    object.modifiers.new("Normals", "WEIGHTED_NORMAL").keep_sharp = true;
  }
  if (o.backlight) {
    // The light shows round each key where it meets the case's top, `well` over the plate.
    backlightSpill(
      bpy,
      "KeyboardBacklight",
      tops.map((k) => ({
        cx: k.cx,
        cy: k.cy,
        w: k.w + 2 * o.capTaper[0],
        h: k.h + 2 * o.capTaper[1],
      })),
      o.well + mm(0.05),
      o.backlight,
      plate,
    );
    backlightLegends(bpy, legends, legendImage, o.backlight);
  }
  if (o.openings) {
    // The case's top open round each key: a cell of the pitch in the plate's finish, just over the top.
    const cells: { v: Vec3[]; f: number[][] } = { v: [], f: [] };
    const z = caseTop + mm(0.1);
    for (const k of tops) {
      const hx = (k.w + 2 * o.capTaper[0] + o.capGap) / 2;
      const hy = (k.h + 2 * o.capTaper[1] + o.capGap) / 2;
      const b = cells.v.length;
      cells.v.push(
        [k.cx - hx, k.cy - hy, z],
        [k.cx + hx, k.cy - hy, z],
        [k.cx + hx, k.cy + hy, z],
        [k.cx - hx, k.cy + hy, z],
      );
      cells.f.push([b, b + 1, b + 2, b + 3]);
    }
    solid(bpy, "KeyboardOpenings", cells.v, cells.f, plateFinish, {
      parent: plate,
    });
  }
  if (o.knob && sixtyFive) {
    // The knob at its place in units from the keys' top left corner, in its pocket.
    const [ku, kv] = SIXTY_FIVE_KNOB;
    const kx = -(widthU * p) / 2 + ku * p;
    const ky = (depthU * p) / 2 - kv * p;
    if (o.knob.pocket > 0)
      box(
        bpy,
        "KeyboardKnobPocket",
        [o.knob.pocket, o.knob.pocket, mm(0.2)],
        plateFinish,
        { parent: plate, at: [kx, ky, caseTop + mm(0.1)] },
      );
    const tall = caseTop + o.knob.height;
    cylinder(
      bpy,
      "KeyboardKnob",
      o.knob.diameter / 2,
      tall,
      finish(bpy, "KeyboardKnob", o.knob.finish),
      { parent: plate, at: [kx, ky, tall / 2], segments: 64, radius: mm(0.6) },
    );
  }
  // Rubber feet under the corners.
  const rubber = finish(bpy, "KeyboardFeet", {
    color: "#111111",
    roughness: 0.9,
  });
  for (const [fx, fy] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ] as const)
    box(
      bpy,
      `KeyboardFoot.${fx > 0 ? "R" : "L"}${fy > 0 ? "B" : "F"}`,
      [mm(14), mm(8), mm(1.5)],
      rubber,
      { parent: root, at: [fx * (x - mm(18)), fy * (y - mm(12)), mm(0.75)] },
    );
  return root;
}

/** A dished top's grid: `DISH_GRID` faces each way. */
const DISH_GRID = 8;

/**
 * A keycap with a dished top into `to`: its base `taper` wider than its top each side, its top a grid lowered
 * by a parabola, `dish` deep at the middle and 0 at the top's nearest side (a long key's along a stadium), so
 * its edges stay level and each side is one flat face.
 */
function dishedCap(
  to: { v: Vec3[]; f: number[][] },
  k: KeyTop,
  taper: [number, number],
  h: number,
  dish: number,
): void {
  const n = DISH_GRID;
  const tx = k.w / 2;
  const ty = k.h / 2;
  const bx = tx + taper[0];
  const by = ty + taper[1];
  const r = Math.min(tx, ty);
  const base = to.v.length;
  to.v.push(
    [k.cx - bx, k.cy - by, 0],
    [k.cx + bx, k.cy - by, 0],
    [k.cx + bx, k.cy + by, 0],
    [k.cx - bx, k.cy + by, 0],
  );
  // The grid's vertex (i across, j along), after the base's four.
  const g = (i: number, j: number): number => base + 4 + j * (n + 1) + i;
  for (let j = 0; j <= n; j++)
    for (let i = 0; i <= n; i++) {
      const x = -tx + (2 * tx * i) / n;
      const y = -ty + (2 * ty * j) / n;
      // The distance from the dish's spine: a point for a square top, a segment along a long one.
      const d = Math.hypot(
        Math.max(0, Math.abs(x) - (tx - r)),
        Math.max(0, Math.abs(y) - (ty - r)),
      );
      // The grid's edge stays exactly level, so each side is one flat face.
      const edge = i === 0 || i === n || j === 0 || j === n;
      to.v.push([
        k.cx + x,
        k.cy + y,
        edge ? h : h - dish * Math.max(0, 1 - (d / r) ** 2),
      ]);
    }
  // Each grid square as two triangles: a curved top's quads are not flat.
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++)
      to.f.push(
        [g(i, j), g(i + 1, j), g(i + 1, j + 1)],
        [g(i, j), g(i + 1, j + 1), g(i, j + 1)],
      );
  const span = [...Array(n + 1).keys()];
  // The sides, each a face from its base edge up to its run of the grid's edge.
  to.f.push(
    [base, base + 1, ...span.map((i) => g(n - i, 0))],
    [base + 1, base + 2, ...span.map((j) => g(n, n - j))],
    [base + 2, base + 3, ...span.map((i) => g(i, n))],
    [base + 3, base, ...span.map((j) => g(0, j))],
  );
}

/** A laptop layout's keys (key-tops.ts) at `shape`, centred on the board, and the size of their tops' extent. */
function compactTops(
  layout: LaptopLayout,
  shape: Partial<LaptopKeyShape>,
): { tops: KeyTop[]; size: [number, number] } {
  const tops = laptopKeyTops(layout, shape);
  return { tops, size: keyExtent(tops) };
}

/** Whether a two-tone set gives a key the modifiers' colour (`mods`): a word or a sign, or one of `others`. */
function isModifier(legend: string, others: readonly string[]): boolean {
  return /^(w:|g:)/.test(legend) || others.includes(legend);
}
