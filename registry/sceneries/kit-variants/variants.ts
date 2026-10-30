// Every variant of the desk kit's laptop, monitor, keyboard, mouse, trackpad and tablet in rows on the floor,
// each under an empty named for it, to look the variants over side by side. Blender's axes (Z up): the rows
// run along x, their fronts towards -y; the monitors at the back, the tablets and trackpads at the front.
import { defineModel, type Bpy, type ModelObject } from "@allyhub-next/model";
import {
  mouse,
  TRACKPAD_PRESETS,
  trackpad,
  type MouseOptions,
} from "../../components/kit/desk-items.ts";
import {
  keyboard,
  KEYBOARD_PRESETS,
  type KeyboardOptions,
} from "../../components/kit/keyboard.ts";
import {
  laptop,
  LAPTOP_PRESETS,
  type LaptopOptions,
} from "../../components/kit/laptop.ts";
import {
  monitor,
  MONITOR_PRESETS,
  type MonitorOptions,
} from "../../components/kit/monitor.ts";
import { group } from "../../components/kit/parts.ts";
import {
  tablet,
  TABLET_PRESETS,
  TABLET_STYLUS,
} from "../../components/kit/tablet.ts";

/** A row of variants along x, `gap` apart and centred, at depth `y`: each under its named empty. */
function row<T>(
  bpy: Bpy,
  y: number,
  gap: number,
  variants: [string, T][],
  make: (bpy: Bpy, parent: ModelObject, o: T) => void,
): void {
  variants.forEach(([name, o], i) => {
    const x = (i - (variants.length - 1) / 2) * gap;
    make(bpy, group(bpy, name, [x, y, 0]), o);
  });
}

export default defineModel((bpy) => {
  row<Partial<MonitorOptions>>(
    bpy,
    0.9,
    0.95,
    [
      ["Monitor27", {}],
      ["MonitorOffice24", MONITOR_PRESETS.office24],
      ["MonitorUltrawide34", MONITOR_PRESETS.ultrawide34],
      ["MonitorGaming27", MONITOR_PRESETS.gaming27],
      ["MonitorFiveK27", MONITOR_PRESETS.fiveK27],
    ],
    (b, parent, o) => monitor(b, [0, 0, 0], o, parent),
  );
  row<Partial<LaptopOptions>>(
    bpy,
    0.2,
    0.45,
    [
      ["Laptop14", {}],
      ["Laptop14Silver", LAPTOP_PRESETS.silver],
      ["Laptop14SpaceGrey", LAPTOP_PRESETS.spaceGrey],
      [
        "Laptop16Silver",
        { ...LAPTOP_PRESETS.sixteen, ...LAPTOP_PRESETS.silver },
      ],
      ["LaptopBusiness", LAPTOP_PRESETS.business],
      ["LaptopGaming", LAPTOP_PRESETS.gaming],
      ["Laptop14Backlit", { backlight: { color: "#ffffff", strength: 30 } }],
    ],
    (b, parent, o) => laptop(b, [0, 0, 0], o, parent),
  );
  row<Partial<LaptopOptions>>(
    bpy,
    0.55,
    0.45,
    [
      [
        "Laptop13ThinSilver",
        { ...LAPTOP_PRESETS.thin13, ...LAPTOP_PRESETS.silver },
      ],
      [
        "Laptop13ThinMidnight",
        { ...LAPTOP_PRESETS.thin13, ...LAPTOP_PRESETS.midnight },
      ],
      [
        "Laptop13ThinStarlight",
        { ...LAPTOP_PRESETS.thin13, ...LAPTOP_PRESETS.starlight },
      ],
      [
        "Laptop15ThinSpaceGrey",
        { ...LAPTOP_PRESETS.thin15, ...LAPTOP_PRESETS.spaceGrey },
      ],
      [
        "Laptop15ThinStarlight",
        { ...LAPTOP_PRESETS.thin15, ...LAPTOP_PRESETS.starlight },
      ],
    ],
    (b, parent, o) => laptop(b, [0, 0, 0], o, parent),
  );
  row<Partial<KeyboardOptions>>(
    bpy,
    -0.3,
    0.5,
    [
      ["KeyboardTkl", {}],
      ["KeyboardWhite", KEYBOARD_PRESETS.white],
      ["KeyboardLowProfile", KEYBOARD_PRESETS.lowProfile],
      ["KeyboardFullSize", KEYBOARD_PRESETS.fullSize],
      ["KeyboardDishedFull", KEYBOARD_PRESETS.dishedFull],
      [
        "KeyboardBacklitRgb",
        {
          case: { color: "#1e1f22", roughness: 0.5, metallic: 0.6 },
          keys: { color: "#2b2d31", roughness: 0.55 },
          legends: "light",
          backlight: {
            color: ["#ff2a55", "#ffe600", "#2bff6a", "#00c8ff", "#7a3cff"],
            strength: 80,
          },
        },
      ],
    ],
    (b, parent, o) => keyboard(b, [0, 0, 0], o, parent),
  );
  // The 65% board at the keyboards' row's right end, the others left where they were.
  keyboard(
    bpy,
    [0, 0, 0],
    KEYBOARD_PRESETS.retro,
    group(bpy, "KeyboardRetro", [1.75, -0.3, 0]),
  );
  row<MouseOptions>(
    bpy,
    -0.6,
    0.2,
    [
      ["MouseSculpted", {}],
      ["MouseSmall", { kind: "small" }],
      ["MouseGaming", { kind: "gaming" }],
      [
        "MouseGamingRgb",
        { kind: "gaming", rgb: { color: "#00c8ff", strength: 60 } },
      ],
      ["MouseTouch", { kind: "touch" }],
    ],
    (b, parent, o) => mouse(b, [0, 0, 0], o, parent),
  );
  row<(b: Bpy, parent: ModelObject) => void>(
    bpy,
    -0.95,
    0.4,
    [
      ["Trackpad", (b, parent) => trackpad(b, [0, 0, 0], {}, parent)],
      [
        "TrackpadBlack",
        (b, parent) => trackpad(b, [0, 0, 0], TRACKPAD_PRESETS.black, parent),
      ],
      [
        "Tablet11Stylus",
        (b, parent) => tablet(b, [0, 0, 0], { stylus: TABLET_STYLUS }, parent),
      ],
      [
        "Tablet13Silver",
        (b, parent) =>
          tablet(
            b,
            [0, 0, 0],
            { ...TABLET_PRESETS.thirteen, ...TABLET_PRESETS.silver },
            parent,
          ),
      ],
      [
        "Tablet11Standing",
        (b, parent) => tablet(b, [0, 0, 0], { tilt: 70 }, parent),
      ],
    ],
    (b, parent, make) => {
      make(b, parent);
    },
  );
});
