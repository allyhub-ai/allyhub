// Where each key of the kit's keyboards is and what it says, with no modelling in it: keyboard.ts and
// laptop.ts lay their caps and legends from it, and scripts/keycap-legends.ts draws the legends' atlas from it.
// A legend is written "main" (a letter or a word), "main:shifted" (a digit and the symbol over it), "w:word"
// (a modifier's word, small, at the side its key reads from: "w:return>" at the right), "w:word|symbol" (a
// Mac modifier's word centred at its foot with its symbol in a top corner, the right one, or the left one for
// "w:word>|symbol"), "f:3" (a Mac's function key: its sign over F3), "g:…" (a drawn sign: "g:window", a PC's
// Windows key without its maker's logo; "g:touchid", a Mac's round sensor; "g:fn", a Mac's fn and globe;
// "g:capslock", a Mac's caps lock and its light; "g:grille", a patch of a speaker's holes), or "" (a blank key).

/**
 * The printing styles: a Mac's (letters centred, words small at a bottom corner), an ANSI board's (top left),
 * a PC laptop's (an ANSI board's print on a laptop's keys) and a Keychron's or an MX Keys' (everything centred,
 * words in lower case).
 */
export type LegendStyle = "mac" | "ansi" | "pc" | "kc";

const digits = (pairs: string): string[] => pairs.split(" ");

const MM = 0.001;

/** A key in a laptop layout's row: its legend and width in units, how tall, and where in its row. */
export interface LaptopKey {
  legend: string;
  /** Its width in units of the pitch across. */
  w: number;
  /** Its top's height as a share of a full key's, or "half": half a key less half `arrowGap` (default 1). */
  h?: number | "half";
  /** Where a shorter key sits in its row's height (default "middle"). */
  at?: "top" | "middle" | "bottom";
  /** The next key starts at this key's own place, not after it: a key stacked over another. */
  stay?: boolean;
  /** How many rows it spans down (a number pad's + and Enter: 2). */
  rows?: number;
}
/** A row of a laptop layout: its keys (a number is a gap of that many units), and its own shape. */
export interface LaptopRow {
  keys: (LaptopKey | number)[];
  /** The row's keys' height as a share of a full key's (a ThinkPad's short function row: some 0.6). */
  cap?: number;
  /** The distance from this row's middle to the next one's, as a share of the pitch down (default 1). */
  next?: number;
  /** The row's own pitch across, as a share of the layout's (a function row of narrower keys). */
  pitch?: number;
}

/** A laptop keyboard's measures: pitch across and down, a 1 u key's top, the gap between ↑ and ↓ (m). */
export interface LaptopKeyShape {
  pitch: [number, number];
  cap: [number, number];
  arrowGap: number;
}

/** The laptop layouts: a Mac's (MacBook Pro and Air since 2021, Magic Keyboard), a ThinkPad's, a Legion's. */
export type LaptopLayout = "mac" | "thinkpad" | "legion" | "mxkeys";

const k = (
  legend: string,
  w = 1,
  o: Omit<LaptopKey, "legend" | "w"> = {},
): LaptopKey => ({ legend, w, ...o });
const ones = (legends: string[]): LaptopKey[] => legends.map((l) => k(l));
const letters = (s: string): LaptopKey[] => ones(s.split(""));
const DIGITS = digits("`:~ 1:! 2:@ 3:# 4:$ 5:% 6:^ 7:& 8:* 9:( 0:) -:_ =:+");

/**
 * A MacBook Pro's or Air's keyboard since 2021, US English, as Apple's top views show it (14-inch, M4 Pro,
 * 2024): a full-height function row (esc 1.5 u, F1–F12, Touch ID at its right), 14.5 u every row, and the
 * arrows as an inverted T of half-height keys at the bottom row's foot, ↑ over ↓ with a hairline between.
 */
export const MAC_LAYOUT: LaptopRow[] = [
  {
    keys: [
      k("w:esc", 1.5),
      ...Array.from({ length: 12 }, (_, i) => k(`f:${String(i + 1)}`)),
      k("g:touchid"),
    ],
  },
  { keys: [...ones(DIGITS), k("w:delete>", 1.5)] },
  {
    keys: [
      k("w:tab", 1.5),
      ...letters("QWERTYUIOP"),
      ...ones(["[:{", "]:}", "\\:|"]),
    ],
  },
  {
    keys: [
      k("g:capslock", 1.75),
      ...letters("ASDFGHJKL"),
      ...ones([";::", "':\""]),
      k("w:return>", 1.75),
    ],
  },
  {
    keys: [
      k("w:shift", 2.25),
      ...letters("ZXCVBNM"),
      ...ones([",:<", ".:>", "/:?"]),
      k("w:shift>", 2.25),
    ],
  },
  {
    keys: [
      k("g:fn"),
      k("w:control|⌃"),
      k("w:option|⌥"),
      k("w:command|⌘", 1.25),
      k("", 5),
      k("w:command>|⌘", 1.25),
      k("w:option>|⌥"),
      k("◀", 1, { h: "half", at: "bottom" }),
      k("▲", 1, { h: "half", at: "top", stay: true }),
      k("▼", 1, { h: "half", at: "bottom" }),
      k("▶", 1, { h: "half", at: "bottom" }),
    ],
  },
];

/**
 * A ThinkPad T14's keyboard (Gen 5, 2024, US English), as Lenovo's top view shows it: a short function row of
 * narrower keys (Esc, F1–F12 in fours, Home, End, Insert, Delete), the rows at 14.6 u, the Copilot key, and the
 * arrows below the bottom row's right, PgUp ↑ PgDn over ← ↓ →, each short and a little narrower.
 */
export const THINKPAD_LAYOUT: LaptopRow[] = [
  {
    cap: 0.58,
    next: 0.8,
    keys: [
      k("w:Esc", 1.25),
      0.1,
      ...["F1", "F2", "F3", "F4"].map((l) => k(l, 0.8)),
      0.15,
      ...["F5", "F6", "F7", "F8"].map((l) => k(l, 0.8)),
      0.15,
      ...["F9", "F10", "F11", "F12"].map((l) => k(l, 0.8)),
      0.15,
      ...["w:Home", "w:End", "w:Insert", "w:Delete"].map((l) => k(l, 0.8)),
    ],
  },
  { keys: [...ones(DIGITS), k("w:Backspace", 1.6)] },
  {
    keys: [
      k("w:Tab", 1.5),
      ...letters("QWERTYUIOP"),
      ...ones(["[:{", "]:}"]),
      k("\\:|", 1.1),
    ],
  },
  {
    keys: [
      k("w:CapsLock", 1.75),
      ...letters("ASDFGHJKL"),
      ...ones([";::", "':\""]),
      k("w:Enter", 1.85),
    ],
  },
  {
    keys: [
      k("w:Shift", 2.25),
      ...letters("ZXCVBNM"),
      ...ones([",:<", ".:>", "/:?"]),
      k("w:Shift", 2.35),
    ],
  },
  {
    keys: [
      k("w:Ctrl", 1.1),
      k("w:Fn", 1.1),
      k("g:window", 1.05),
      k("w:Alt", 1.03),
      k("", 4.95),
      k("w:Alt", 0.93),
      k("g:copilot", 0.93),
      k("w:Ctrl", 0.93),
      k("w:PgUp", 0.86, { h: 0.62, at: "top" }),
      k("▲", 0.86, { h: 0.62, at: "top" }),
      k("w:PgDn", 0.86, { h: 0.62, at: "top" }),
    ],
    next: 0.66,
  },
  {
    cap: 0.62,
    keys: [12.02, k("◀", 0.86), k("▼", 0.86), k("▶", 0.86)],
  },
];

/**
 * A Legion Pro 7 16's keyboard (Gen 9, 2024, US English), as Lenovo's top view shows it: a short function row
 * of 20 keys over the whole width (Esc, F1–F12, Insert, PrtSc, Del, Home, End, PgUp, PgDn), the main rows
 * and a number pad, and ↑ in the bottom row with ← ↓ → dropped below it.
 */
export const LEGION_LAYOUT: LaptopRow[] = [
  {
    cap: 0.62,
    next: 0.84,
    pitch: 18.6 / 20,
    keys: ones([
      "w:Esc",
      ..."F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12".split(" "),
      "w:Insert",
      "w:PrtSc",
      "w:Del",
      "w:Home",
      "w:End",
      "w:PgUp",
      "w:PgDn",
    ]),
  },
  {
    keys: [
      ...ones(DIGITS),
      k("w:Backspace", 1.5),
      0.1,
      ...ones(["w:Num", "/", "*", "-"]),
    ],
  },
  {
    keys: [
      k("w:Tab", 1.5),
      ...letters("QWERTYUIOP"),
      ...ones(["[:{", "]:}"]),
      k("\\:|"),
      0.1,
      ...ones(["7", "8", "9"]),
      k("+", 1, { rows: 2 }),
    ],
  },
  {
    keys: [
      k("w:CapsLk", 1.75),
      ...letters("ASDFGHJKL"),
      ...ones([";::", "':\""]),
      k("w:Enter", 1.75),
      0.1,
      ...ones(["4", "5", "6"]),
    ],
  },
  {
    keys: [
      k("w:Shift", 2.25),
      ...letters("ZXCVBNM"),
      ...ones([",:<", ".:>", "/:?"]),
      k("w:Shift", 2.25),
      0.1,
      ...ones(["1", "2", "3"]),
      k("w:Enter", 1, { rows: 2 }),
    ],
  },
  {
    next: 0.9,
    keys: [
      k("w:Ctrl", 1.1),
      ...ones(["w:Fn", "g:window", "w:Alt"]),
      k("", 5),
      ...ones(["w:Alt", "g:copilot"]),
      1.2,
      k("▲", 1.1),
      1.2,
      k("0", 2),
      k("."),
    ],
  },
  { cap: 0.92, keys: [11.2, k("◀", 1.1), k("▼", 1.1), k("▶", 1.1)] },
];

/**
 * A Logitech MX Keys S's keys (US), as Logitech's top view shows them: a short function row over the whole width
 * (esc, F1–F12, three device keys, four over the pad), the main rows at 14.7 u, a 3-key navigation block (insert,
 * home, page up over delete, end, page down), ↑ over ← ↓ → under it, and the number pad, its + and enter 2 rows tall.
 */
export const MX_KEYS_LAYOUT: LaptopRow[] = [
  {
    cap: 0.66,
    next: 0.93,
    keys: [
      k("w:esc", 1.35),
      0.2,
      ...Array.from({ length: 12 }, (_, i) => k(`F${String(i + 1)}`, 1.095)),
      0.25,
      ...ones(["w:1", "w:2", "w:3"]),
      0.3,
      ...ones(["g:shot", "g:mic", "g:lock", "g:lock"]),
    ],
  },
  {
    keys: [
      ...ones(DIGITS),
      k("w:backspace", 1.7),
      0.25,
      ...ones(["w:insert", "w:home", "w:page up"]),
      0.3,
      ...ones(["w:clear", "/", "*", "-"]),
    ],
  },
  {
    keys: [
      k("w:tab", 1.5),
      ...letters("QWERTYUIOP"),
      ...ones(["[:{", "]:}"]),
      k("\\:|", 1.2),
      0.25,
      ...ones(["w:delete", "w:end", "w:page down"]),
      0.3,
      ...ones(["7", "8", "9"]),
      k("+", 1, { rows: 2 }),
    ],
  },
  {
    keys: [
      k("w:caps lock", 1.95),
      ...letters("ASDFGHJKL"),
      ...ones([";::", "':\""]),
      k("w:enter", 1.75),
      3.55,
      ...ones(["4", "5", "6"]),
    ],
  },
  {
    keys: [
      k("w:shift", 2.4),
      ...letters("ZXCVBNM"),
      ...ones([",:<", ".:>", "/:?"]),
      k("w:shift", 2.3),
      1.25,
      k("▲"),
      1.3,
      ...ones(["1", "2", "3"]),
      k("w:enter", 1, { rows: 2 }),
    ],
  },
  {
    keys: [
      k("w:ctrl", 1.4),
      k("w:opt", 1.25),
      k("w:cmd", 1.4),
      k("", 6.15),
      k("w:cmd", 1.4),
      k("w:fn", 1.3),
      k("w:ctrl", 1.8),
      0.25,
      ...ones(["◀", "▼", "▶"]),
      0.3,
      k("0", 2),
      k("."),
    ],
  },
];

/** The Magic Keyboard's keys (with Touch ID, 2021): a Mac's layout at 19 × 18.5 mm, its tops 15.8 × 15 mm (Apple's top view at 5.37 px a millimetre). */
export const MAGIC_KEYS: LaptopKeyShape = {
  pitch: [19 * MM, 18.5 * MM],
  cap: [15.8 * MM, 15 * MM],
  arrowGap: 0.8 * MM,
};

/** Each layout's rows and its measures. */
export const LAPTOP_LAYOUTS: Record<
  LaptopLayout,
  { rows: LaptopRow[]; shape: LaptopKeyShape; style: LegendStyle }
> = {
  // 19 × 18.5 mm pitch and 15.7 × 15.6 mm tops (Apple's 14-inch top view at 2.94 px a millimetre).
  mac: {
    rows: MAC_LAYOUT,
    shape: {
      pitch: [19 * MM, 18.5 * MM],
      cap: [15.7 * MM, 15.6 * MM],
      arrowGap: 0.7 * MM,
    },
    style: "mac",
  },
  thinkpad: {
    rows: THINKPAD_LAYOUT,
    shape: {
      pitch: [18.9 * MM, 18.6 * MM],
      cap: [15.6 * MM, 15.2 * MM],
      arrowGap: 1 * MM,
    },
    style: "pc",
  },
  // 18.68 mm pitch over 430.2 mm (Logitech's top view at 2.17 px a millimetre), round-dished tops.
  mxkeys: {
    rows: MX_KEYS_LAYOUT,
    shape: {
      pitch: [18.68 * MM, 18.68 * MM],
      cap: [15.6 * MM, 15.4 * MM],
      arrowGap: 0.8 * MM,
    },
    style: "kc",
  },
  legion: {
    rows: LEGION_LAYOUT,
    shape: {
      pitch: [19.3 * MM, 19 * MM],
      cap: [16.4 * MM, 15.6 * MM],
      arrowGap: 1 * MM,
    },
    style: "pc",
  },
};

/**
 * A laptop layout's key tops in metres, centred on their extent (x across, y towards the back), with `shape`
 * over the layout's own measures.
 */
export function laptopKeyTops(
  layout: LaptopLayout = "mac",
  shape: Partial<LaptopKeyShape> = {},
): KeyTop[] {
  const spec = LAPTOP_LAYOUTS[layout];
  const s = { ...spec.shape, ...shape };
  const [px, py] = s.pitch;
  const [cw, ch] = s.cap;
  const out: KeyTop[] = [];
  // The middle of each row, down from the first's.
  let y = 0;
  for (const row of spec.rows) {
    const rowCap = ch * (row.cap ?? 1);
    const rp = px * (row.pitch ?? 1);
    let u = 0;
    for (const item of row.keys) {
      if (typeof item === "number") {
        u += item * rp;
        continue;
      }
      const w = item.w * rp - (px - cw);
      const tall = item.rows ?? 1;
      const h =
        item.h === "half"
          ? (ch - s.arrowGap) / 2
          : tall > 1
            ? rowCap + (tall - 1) * py
            : rowCap * (item.h ?? 1);
      const top = y + rowCap / 2;
      const cy =
        tall > 1
          ? top - h / 2
          : item.at === "top"
            ? top - h / 2
            : item.at === "bottom"
              ? y - rowCap / 2 + h / 2
              : y;
      out.push({
        cx: u + (item.w * rp) / 2,
        cy,
        w,
        h,
        legend: item.legend,
        accent: false,
      });
      if (!item.stay) u += item.w * rp;
    }
    y -= py * (row.next ?? 1);
  }
  const x0 = Math.min(...out.map((t) => t.cx - t.w / 2));
  const x1 = Math.max(...out.map((t) => t.cx + t.w / 2));
  const y0 = Math.min(...out.map((t) => t.cy - t.h / 2));
  const y1 = Math.max(...out.map((t) => t.cy + t.h / 2));
  return out.map((t) => ({
    ...t,
    cx: t.cx - (x0 + x1) / 2,
    cy: t.cy - (y0 + y1) / 2,
  }));
}

/** The extent of key tops: its width and depth (m). */
export function keyExtent(tops: readonly KeyTop[]): [number, number] {
  const x0 = Math.min(...tops.map((t) => t.cx - t.w / 2));
  const x1 = Math.max(...tops.map((t) => t.cx + t.w / 2));
  const y0 = Math.min(...tops.map((t) => t.cy - t.h / 2));
  const y1 = Math.max(...tops.map((t) => t.cy + t.h / 2));
  return [x1 - x0, y1 - y0];
}

/** A tenkeyless ANSI board's keys, row by row as keyboard.ts lays them (gaps not counted), then its function row. */
export const ANSI_ROWS: string[][] = [
  [
    ...digits("`:~ 1:! 2:@ 3:# 4:$ 5:% 6:^ 7:& 8:* 9:( 0:) -:_ =:+"),
    "w:Backspace",
    "w:Ins",
    "w:Home",
    "w:PgUp",
  ],
  [
    "w:Tab",
    ..."QWERTYUIOP".split(""),
    "[:{",
    "]:}",
    "\\:|",
    "w:Del",
    "w:End",
    "w:PgDn",
  ],
  ["w:Caps Lock", ..."ASDFGHJKL".split(""), ";::", "':\"", "w:Enter"],
  ["w:Shift", ..."ZXCVBNM".split(""), ",:<", ".:>", "/:?", "w:Shift", "↑"],
  [
    "w:Ctrl",
    "w:Win",
    "w:Alt",
    "",
    "w:Alt",
    "w:Fn",
    "w:Menu",
    "w:Ctrl",
    "←",
    "↓",
    "→",
  ],
];
export const ANSI_F_ROW: string[] = [
  "w:Esc",
  ...Array.from({ length: 12 }, (_, i) => `F${String(i + 1)}`),
  "w:PrtSc",
  "w:ScrLk",
  "w:Pause",
];

/** A 75% board's keys, row by row as keyboard.ts lays them, then its function row: the navigation keys down its right. */
export const ANSI_75_ROWS: string[][] = [
  [
    ...digits("`:~ 1:! 2:@ 3:# 4:$ 5:% 6:^ 7:& 8:* 9:( 0:) -:_ =:+"),
    "w:Backspace",
    "w:Home",
  ],
  ["w:Tab", ..."QWERTYUIOP".split(""), "[:{", "]:}", "\\:|", "w:PgUp"],
  ["w:Caps Lock", ..."ASDFGHJKL".split(""), ";::", "':\"", "w:Enter", "w:PgDn"],
  [
    "w:Shift",
    ..."ZXCVBNM".split(""),
    ",:<",
    ".:>",
    "/:?",
    "w:Shift",
    "↑",
    "w:End",
  ],
  ["w:Ctrl", "w:Win", "w:Alt", "", "w:Alt", "w:Fn", "w:Ctrl", "←", "↓", "→"],
];
export const ANSI_75_F_ROW: string[] = [
  "w:Esc",
  ...Array.from({ length: 12 }, (_, i) => `F${String(i + 1)}`),
  "w:PrtSc",
  "w:Ins",
  "w:Del",
];

/** A Keychron's Mac keycaps on a tenkeyless board (the K8 Pro's), row by row as ANSI_ROWS, then its function row. */
export const KC_ROWS: string[][] = [
  [...DIGITS, "w:backspace", "w:ins", "w:home", "w:pgup"],
  [
    "w:tab",
    ..."QWERTYUIOP".split(""),
    "[:{",
    "]:}",
    "\\:|",
    "w:del",
    "w:end",
    "w:pgdn",
  ],
  ["w:capslock", ..."ASDFGHJKL".split(""), ";::", "':\"", "w:enter"],
  ["w:shift", ..."ZXCVBNM".split(""), ",:<", ".:>", "/:?", "w:shift", "▲"],
  [
    "w:control",
    "w:option",
    "⌘",
    "",
    "⌘",
    "w:option",
    "w:fn",
    "w:control",
    "◀",
    "▼",
    "▶",
  ],
];
export const KC_F_ROW: string[] = [
  "w:esc",
  ...Array.from({ length: 12 }, (_, i) => `f:${String(i + 1)}`),
  "g:shot",
  "g:mic",
  "g:light",
];
/** A Keychron's Mac keycaps on a 75% board, as ANSI_75_ROWS. */
export const KC_75_ROWS: string[][] = [
  [...DIGITS, "w:backspace", "w:home"],
  ["w:tab", ..."QWERTYUIOP".split(""), "[:{", "]:}", "\\:|", "w:pgup"],
  ["w:capslock", ..."ASDFGHJKL".split(""), ";::", "':\"", "w:enter", "w:pgdn"],
  [
    "w:shift",
    ..."ZXCVBNM".split(""),
    ",:<",
    ".:>",
    "/:?",
    "w:shift",
    "▲",
    "w:end",
  ],
  ["w:control", "w:option", "⌘", "", "⌘", "w:fn", "w:control", "◀", "▼", "▶"],
];
export const KC_75_F_ROW: string[] = [
  ...KC_F_ROW.slice(0, 13),
  "g:shot",
  "g:light",
  "w:del",
];

/**
 * A 65% board's keys (a Keychron Q2's, ANSI), row by row as keyboard.ts lays them: no function row, esc
 * where ` would be, del and home down the right, ↑ and ← ↓ → a quarter unit lower than their rows.
 */
export const ANSI_65_ROWS: string[][] = [
  ["w:Esc", ...DIGITS.slice(1), "w:Backspace"],
  ["w:Tab", ..."QWERTYUIOP".split(""), "[:{", "]:}", "\\:|", "w:Del"],
  ["w:Caps Lock", ..."ASDFGHJKL".split(""), ";::", "':\"", "w:Enter", "w:Home"],
  ["w:Shift", ..."ZXCVBNM".split(""), ",:<", ".:>", "/:?", "w:Shift", "↑"],
  ["w:Ctrl", "w:Win", "w:Alt", "", "w:Alt", "w:Fn1", "w:Fn2", "←", "↓", "→"],
];
/** A Keychron's Mac keycaps on a 65% board (the Q2's), as ANSI_65_ROWS. */
export const KC_65_ROWS: string[][] = [
  ["w:esc", ...DIGITS.slice(1), "w:backspace"],
  ["w:tab", ..."QWERTYUIOP".split(""), "[:{", "]:}", "\\:|", "w:del"],
  ["w:capslock", ..."ASDFGHJKL".split(""), ";::", "':\"", "w:enter", "w:home"],
  ["w:shift", ..."ZXCVBNM".split(""), ",:<", ".:>", "/:?", "w:shift", "▲"],
  ["w:control", "w:option", "⌘", "", "⌘", "w:fn1", "w:fn2", "◀", "▼", "▶"],
];

/** A full-size board's number pad, row by row after the tenkeyless keys: + and Enter are its 2 u tall keys. */
export const PAD_ROWS: string[][] = [
  ["w:Num", "/", "*", "-"],
  ["7", "8", "9", "+"],
  ["4", "5", "6"],
  ["1", "2", "3", "w:Enter"],
  ["0", "."],
];

/** An atlas cell's name: the style, the legend, whether accented, and the key top's shape to a tenth. */
export function cellName(
  style: LegendStyle,
  legend: string,
  aspect: number,
  accent = false,
): string {
  return `${style}|${legend}|${accent ? "a" : "n"}|${aspect.toFixed(1)}`;
}

/** A key's top as its cap and legend need it: where (its own space), how big, what it says, whether it is an accent key. */
export interface KeyTop {
  cx: number;
  cy: number;
  w: number;
  h: number;
  legend: string;
  accent: boolean;
}

/** A row's keys as widths in units (u); a negative width is a gap of that many units. */
export const TKL_F_ROW = [
  1, -1, 1, 1, 1, 1, -0.5, 1, 1, 1, 1, -0.5, 1, 1, 1, 1, -0.25, 1, 1, 1,
];
export const TKL_WIDTHS = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, -0.25, 1, 1, 1],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, -0.25, 1, 1, 1],
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75, -1.25, 1],
  [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25, -0.25, 1, 1, 1],
];
/** Which keys take the accent colour, by row (-1 the function row) and index among the row's keys. */
export const TKL_ACCENT: [number, number][] = [
  [-1, 0],
  [2, 12],
];

export const SEVENTY_FIVE_F_ROW = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];
export const SEVENTY_FIVE_WIDTHS = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 1],
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, 1],
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75, 1, 1],
  [1.25, 1.25, 1.25, 6.25, 1, 1, 1, 1, 1, 1],
];
export const SEVENTY_FIVE_ACCENT: [number, number][] = [
  [-1, 0],
  [2, 12],
];

/**
 * A 65% board (a Keychron Q2's, ANSI): five rows and no function row, the right column (del, home) and the
 * arrows a quarter unit right of the rest (Keychron's top view at 3.9 px a millimetre).
 */
export const SIXTY_FIVE_WIDTHS = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, -0.25, 1],
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, -0.25, 1],
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75, -0.25, 1],
  [1.25, 1.25, 1.25, 6.25, 1, 1, 1, -0.25, 1, 1, 1],
];
/** A 65% board's esc and enter, by row and index among the row's keys (it has no function row). */
export const SIXTY_FIVE_ACCENT: [number, number][] = [
  [0, 0],
  [2, 12],
];
/** The keys a Q2 sets lower than their row, by row and index (↑, then ← ↓ →), and by how much, in units. */
export const SIXTY_FIVE_DROP = {
  keys: [
    [3, 13],
    [4, 7],
    [4, 8],
    [4, 9],
  ] as [number, number][],
  by: 0.25,
};
/**
 * A 65% board's knob: its middle in units from the keys' top left corner (across, then down), over the right
 * column, a little above the first row (Keychron's top view: 15.79 u across, 0.23 u down).
 */
export const SIXTY_FIVE_KNOB: [number, number] = [15.75, 0.23];

/**
 * A full-size board: the tenkeyless rows with a number pad 0.25 u to their right. The pad's + and Enter
 * are 2 u tall: laid here as the top half, the row under them leaving a gap, then stretched down.
 */
export const FULL_WIDTHS = [
  [...(TKL_WIDTHS[0] ?? []), -0.25, 1, 1, 1, 1],
  [...(TKL_WIDTHS[1] ?? []), -0.25, 1, 1, 1, 1],
  [...(TKL_WIDTHS[2] ?? []), -3.5, 1, 1, 1],
  [...(TKL_WIDTHS[3] ?? []), -1.25, 1, 1, 1, 1],
  [...(TKL_WIDTHS[4] ?? []), -0.25, 2, 1],
];
/** The 2 u tall pad keys, by row and index among the row's keys: + and Enter. */
export const FULL_TALL: [number, number][] = [
  [1, 20],
  [3, 16],
];

/** The print a board's keys take: an ANSI board's, or a Keychron's Mac keycaps. */
export type BoardPrint = "ansi" | "keychron";

/** Each layout's legends in a print: its rows (ANSI_ROWS's shape) and its function row. */
export function boardLabels(
  layout: "tkl" | "75" | "65" | "full",
  print: BoardPrint,
): { rows: string[][]; fRow: string[] } {
  const kc = print === "keychron";
  if (layout === "65")
    return { rows: kc ? KC_65_ROWS : ANSI_65_ROWS, fRow: [] };
  if (layout === "75")
    return kc
      ? { rows: KC_75_ROWS, fRow: KC_75_F_ROW }
      : { rows: ANSI_75_ROWS, fRow: ANSI_75_F_ROW };
  const rows = kc ? KC_ROWS : ANSI_ROWS;
  const fRow = kc ? KC_F_ROW : ANSI_F_ROW;
  return layout === "full"
    ? { rows: rows.map((row, r) => [...row, ...(PAD_ROWS[r] ?? [])]), fRow }
    : { rows, fRow };
}

/**
 * A board's keys at pitch `p`: each cap's top (its base inset by `gap`/2 and the top by `taper` each side),
 * centred as keyboard.ts lays them in its plate, the function row `fGap` units over the rest (by default half
 * a unit on a tenkeyless board, none on another). With `rows`, another layout's widths.
 */
export function boardKeyTops(
  p: number,
  gap: number,
  taper: [number, number],
  o: {
    fRow?: number[];
    rows?: number[][];
    accent?: [number, number][];
    legends?: boolean;
    /** The legends, as ANSI_ROWS and ANSI_F_ROW (theirs by default). */
    labels?: { rows: string[][]; fRow: string[] };
    fGap?: number;
    /** Keys set lower than their row (a 65% board's arrows), by row and index, and by how many units. */
    drop?: { keys: [number, number][]; by: number };
  } = {},
): KeyTop[] {
  const fRow = o.fRow ?? TKL_F_ROW;
  const rows = o.rows ?? TKL_WIDTHS;
  const accent = o.accent ?? TKL_ACCENT;
  const legends = o.legends ?? true;
  const fGap = o.fGap ?? (rows === TKL_WIDTHS ? 0.5 : 0);
  const [widthU, depthU] = boardUnits(fRow, rows, fGap, o.drop?.by ?? 0);
  // The rows start under the function row and its gap; a board without one starts at its top.
  const firstU = fRow.length > 0 ? 1 + fGap : 0;
  const left = -(widthU * p) / 2;
  const top = (depthU * p) / 2;
  const out: KeyTop[] = [];
  const lay = (
    row: number[],
    rowIndex: number,
    yU: number,
    labels: string[] | undefined,
  ) => {
    let u = 0;
    let i = 0;
    for (const w of row) {
      if (w < 0) {
        u += -w;
        continue;
      }
      const lower = o.drop?.keys.some(([r, k]) => r === rowIndex && k === i)
        ? o.drop.by
        : 0;
      out.push({
        cx: left + (u + w / 2) * p,
        cy: top - (yU + lower + 0.5) * p,
        w: w * p - gap - 2 * taper[0],
        h: p - gap - 2 * taper[1],
        legend: legends ? (labels?.[i] ?? "") : "",
        accent: accent.some(([r, k]) => r === rowIndex && k === i),
      });
      u += w;
      i += 1;
    }
  };
  const labels = o.labels ?? { rows: ANSI_ROWS, fRow: ANSI_F_ROW };
  lay(fRow, -1, 0, labels.fRow);
  rows.forEach((row, r) => lay(row, r, firstU + r, labels.rows[r]));
  return out;
}

/**
 * A board's keys' extent in units, across and down: its widest row, and its rows under the function row and
 * its gap (none on a board without one), with `drop` units more for keys set lower than the last row.
 */
export function boardUnits(
  fRow: number[],
  rows: number[][],
  fGap: number,
  drop = 0,
): [number, number] {
  const widthU = Math.max(
    ...[fRow, ...rows].map((r) => r.reduce((s, w) => s + Math.abs(w), 0)),
  );
  return [widthU, rows.length + (fRow.length > 0 ? 1 + fGap : 0) + drop];
}

/** A 65% board's keys at pitch `p`, as `boardKeyTops` gives a tenkeyless board's: no function row, the arrows lower. */
export function sixtyFiveKeyTops(
  p: number,
  gap: number,
  taper: [number, number],
  print: BoardPrint = "ansi",
): KeyTop[] {
  return boardKeyTops(p, gap, taper, {
    fRow: [],
    rows: SIXTY_FIVE_WIDTHS,
    accent: SIXTY_FIVE_ACCENT,
    labels: boardLabels("65", print),
    drop: SIXTY_FIVE_DROP,
  });
}

/** A 75% board's keys at pitch `p`, as `boardKeyTops` gives a tenkeyless board's. */
export function seventyFiveKeyTops(
  p: number,
  gap: number,
  taper: [number, number],
  print: BoardPrint = "ansi",
): KeyTop[] {
  return boardKeyTops(p, gap, taper, {
    fRow: SEVENTY_FIVE_F_ROW,
    rows: SEVENTY_FIVE_WIDTHS,
    accent: SEVENTY_FIVE_ACCENT,
    labels: boardLabels("75", print),
  });
}

/**
 * A full-size board's keys at pitch `p`: the tenkeyless board's tops with the pad's, + and Enter stretched to
 * 2 u, the function row `fGap` units over the rest.
 */
export function fullKeyTops(
  p: number,
  gap: number,
  taper: [number, number],
  print: BoardPrint = "ansi",
  fGap = 0.5,
): KeyTop[] {
  const tops = boardKeyTops(p, gap, taper, {
    fRow: TKL_F_ROW,
    rows: FULL_WIDTHS,
    accent: TKL_ACCENT,
    labels: boardLabels("full", print),
    fGap,
  });
  const fKeys = TKL_F_ROW.filter((w) => w > 0).length;
  // Each key's row and index among the row's keys, in the order boardKeyTops lays them.
  const places = FULL_WIDTHS.flatMap((row, r) =>
    row.filter((w) => w > 0).map((_, i): [number, number] => [r, i]),
  );
  return tops.map((k, i) => {
    if (i < fKeys) return k;
    const [r, n] = places[i - fKeys] ?? [-1, -1];
    const tall = FULL_TALL.some(([tr, tn]) => tr === r && tn === n);
    return tall ? { ...k, cy: k.cy - p / 2, h: k.h + p } : k;
  });
}
