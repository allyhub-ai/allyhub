// The gaming setup as a scenery: a pale room with its own light off, coloured by two light bars behind the
// monitor, in physical units. A scenery item calls `gamingSetup(look)`.
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import {
  exposureOf,
  type SceneryDefinition,
} from "@allyhub-next/scenery-host/layer";
import { modelObject } from "@allyhub-next/model/three";
import { shell } from "../../room/shell.ts";
import { screenOver } from "../../room/screens.ts";
import { screenShots } from "../../cameras/screen-shots.ts";
import props, { BAR_GLOW, BARS, DESK_WALL, LEDS, TOP } from "./props.ts";

export type Look = "day" | "overcast" | "evening" | "night";
/** The whole room (a talking head, a desk tour) or the desk and its wall alone (a demo filmed close). */
export type Version = "room" | "demo";

/**
 * Each look's light, in physical units (nits) and its camera's exposure (EV at ISO 100). `bars` is a light
 * bar's diffuser, some 6000 nits for a Hue Play's 530 lumens through a saturated colour; the room's own light
 * stays off. `sky` is what the blind lets in. `monitor` is its white, `wallpaper` its idle picture, `tint` and
 * `throw` (nits) the colour and strength of the light it casts on the desk.
 */
const LOOKS = {
  day: {
    ev: 6.1,
    sky: 700,
    blind: 0.8,
    bars: 13000,
    monitor: 200,
    throw: 200,
    wallpaper: ["#0b1c4a", "#1a6fd6", "#27d6e8", "#ffe28a"],
    tint: "#7fb4ff",
  },
  overcast: {
    ev: 5.7,
    sky: 320,
    blind: 0.85,
    bars: 13000,
    monitor: 170,
    throw: 200,
    wallpaper: ["#1a0b4a", "#6a2fd6", "#e24bd0", "#ffd08a"],
    tint: "#b08aff",
  },
  evening: {
    ev: 5.1,
    sky: 30,
    blind: 0.9,
    bars: 13000,
    monitor: 130,
    throw: 200,
    wallpaper: ["#160a3c", "#2f4bd6", "#ff3fa4", "#ffd08a"],
    tint: "#c07aff",
  },
  night: {
    ev: 4.6,
    sky: 2,
    blind: 1,
    bars: 13000,
    monitor: 100,
    throw: 200,
    wallpaper: ["#12073a", "#5a22d0", "#ff2d95", "#ffb347"],
    tint: "#b070ff",
  },
} as const;

/** What glows is drawn, but its light is the light standing for it: baking both would count it twice. */
const GLOWS = ["monitor-screen"];
/** The wallpaper's white against the monitor's: tone mapping washes a saturated picture out at full brightness. */
const WALLPAPER = 0.45;

/**
 * The monitor's wallpaper, drawn in code: a saturated dusk over mountains and a lit city, the colours its own
 * look's (`sky`, top to horizon, then the low sun). `width` × `height` px; the same each time.
 */
function neonWallpaper(
  width: number,
  height: number,
  colours: readonly [string, string, string, string],
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("No 2D context.");
  const [high, mid, low, sun] = colours;
  const horizon = height * 0.62;
  const sky = g.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, high);
  sky.addColorStop(0.6, mid);
  sky.addColorStop(1, low);
  g.fillStyle = sky;
  g.fillRect(0, 0, width, horizon);
  g.fillStyle = sun;
  g.beginPath();
  g.arc(width * 0.62, height * 0.34, height * 0.12, 0, Math.PI * 2);
  g.fill();
  let seed = 7;
  const rand = (): number => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  // Two ridges, far and near.
  for (const [base, tall, shade] of [
    [0.6, 0.16, mid],
    [0.66, 0.1, high],
  ] as const) {
    g.fillStyle = shade;
    g.beginPath();
    g.moveTo(0, horizon * 1.2);
    let x = 0;
    while (x < width) {
      g.lineTo(x, height * (base - tall * rand()));
      x += width * (0.03 + 0.05 * rand());
    }
    g.lineTo(width, horizon * 1.2);
    g.fill();
  }
  // The city: towers with lit windows, down to the bottom of the screen.
  g.fillStyle = high;
  g.fillRect(0, height * 0.7, width, height * 0.3);
  let x = 0;
  while (x < width) {
    const w = width * (0.025 + 0.04 * rand());
    const h = height * (0.14 + 0.26 * rand());
    const y = height - h;
    g.fillStyle = "#0a0824";
    g.fillRect(x, y, w, h);
    const lit = rand() < 0.5 ? low : sun;
    g.fillStyle = lit;
    const cell = width * 0.009;
    for (let wy = y + cell; wy < height; wy += cell * 2)
      for (let wx = x + cell * 0.6; wx < x + w - cell; wx += cell * 1.7)
        if (rand() < 0.55) g.fillRect(wx, wy, cell * 0.9, cell);
    x += w + width * 0.004;
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** A rectangle light named `name`, at `at`, shining towards `to`. */
function pane(
  name: string,
  color: THREE.ColorRepresentation,
  nits: number,
  size: readonly [number, number],
  at: THREE.Vector3,
  to: THREE.Vector3,
): THREE.RectAreaLight {
  const light = new THREE.RectAreaLight(color, nits, size[0], size[1]);
  light.name = name;
  light.position.copy(at);
  light.lookAt(to);
  return light;
}

/**
 * How the light is baked: `preview` quickly, to look at a change; `release` as it is published (512 samples,
 * 8 bounces, the demo zone's objects at more density).
 */
export type BakeQuality = "preview" | "release";

export function gamingSetup(
  look: Look,
  version: Version = "room",
  quality: BakeQuality = "preview",
): SceneryDefinition {
  const L = LOOKS[look];
  const led = LEDS[look];
  return {
    renderer: { antialias: true },
    async build(w) {
      RectAreaLightUniformsLib.init();
      w.renderer.toneMapping = THREE.AgXToneMapping;
      // The look's exposure for any camera that names none.
      w.renderer.toneMappingExposure = exposureOf(L.ev);
      await w.environment("assets/media/environments/balcony/balcony_2k.hdr", {
        background: true,
      });
      // The sky at its own brightness: the bake gathers the window's light from it.
      w.scene.environmentIntensity = L.sky;
      w.scene.backgroundIntensity = L.sky;

      // The home desk's room, its desk's wall brought up to the desk, painted pale so it takes the colours.
      w.scene.add(
        await shell(w, {
          front: -DESK_WALL,
          paint: "#dcdad6",
          ceiling: "#d8d7d4",
          window: {
            z: -0.35,
            width: 1.2,
            sill: 0.85,
            height: 1.3,
            blind: L.blind,
          },
          skirting: { height: 0.06, depth: 0.012, color: "#d8d7d4" },
        }),
      );

      // The props from the kit. The wrapper is unnamed, so each prop is what a click selects.
      const kit = new THREE.Group();
      kit.add(await modelObject(w, props, { look, version }));
      w.scene.add(kit);
      kit.updateMatrixWorld(true);

      // The screens: named surfaces a video's screen() draws on, showing an idle picture until then.
      const wallpaper = new THREE.MeshBasicMaterial({
        map: neonWallpaper(2560, 1440, L.wallpaper),
      });
      wallpaper.color.setScalar(L.monitor * WALLPAPER);
      kit.add(screenOver(kit, "MonitorScreen", "monitor-screen", wallpaper));

      // A pane on each light bar's diffuser, turned to the wall: all the colour in the room.
      for (const side of [-1, 1] as const) {
        const turn = THREE.MathUtils.degToRad(side * BARS.turn);
        const facing = new THREE.Vector3(Math.sin(turn), 0, -Math.cos(turn));
        const at = new THREE.Vector3(
          side * BARS.x,
          TOP + BARS.z + BAR_GLOW.height,
          -BARS.y,
        ).addScaledVector(facing, 0.02);
        w.scene.add(
          pane(
            side < 0 ? "bar-left" : "bar-right",
            side < 0 ? led.left : led.right,
            L.bars,
            [BAR_GLOW.size[0], BAR_GLOW.size[1]],
            at,
            at.clone().add(facing),
          ),
        );
      }

      // The monitor's steady light: a pane on its face, which a video's screen then adds its picture's difference to.
      const screen = kit.getObjectByName("monitor-screen");
      if (screen instanceof THREE.Mesh) {
        const g = screen.geometry as THREE.PlaneGeometry;
        const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(
          screen.getWorldQuaternion(new THREE.Quaternion()),
        );
        const at = screen
          .getWorldPosition(new THREE.Vector3())
          .addScaledVector(normal, 0.005);
        w.scene.add(
          pane(
            "monitor-light",
            L.tint,
            L.throw,
            [g.parameters.width, g.parameters.height],
            at,
            at.clone().add(normal),
          ),
        );
      }
      return {};
    },
    cameras: {
      // Archetype D of docs/design/desk-settings.md. Square on and low: the monitor, the keys, the microphone and
      // the two colours on the wall.
      front: {
        position: [-0.05, 1.03, 0.36],
        target: [-0.05, 0.98, -0.8],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // Behind the shoulder, over the keyboard: the monitor and the keys.
      demo: {
        position: [0.18, 1.24, 0.14],
        target: [-0.02, 0.9, -0.8],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // Low across the keys, lit by their backlight, the screen above.
      "keys-low": {
        position: [0.08, 0.86, -0.08],
        target: [0, 0.93, -0.85],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // The setup seen from beside the person, as a desk tour shows it.
      setup: {
        position: [-0.7, 1.35, 0.45],
        target: [0.05, 0.95, -0.7],
        lens: 20,
        ev: L.ev,
      },
      // For review: the desk from above, the room from a corner.
      desktop: {
        position: [0, 1.8, -0.1],
        target: [0, 0.74, -0.62],
        lens: 16,
        ev: L.ev,
      },
      overview: {
        position: [1.65, 2.35, 1.65],
        target: [-0.3, 0.8, -0.5],
        lens: 13,
        ev: L.ev,
      },
    },
    // The monitor's parts from in front and from each side: monitor-<region>-<angle>
    // (components/cameras/screen-shots.ts).
    moves: {
      ...screenShots("monitor-screen", { prefix: "monitor", ev: L.ev }),
    },
    bake: {
      ...(quality === "release"
        ? { density: 75, samples: 512, bounces: 8, maxSize: 8192 }
        : { density: 50, samples: 32, bounces: 4 }),
      // Light in physical units: a sample from the sky or a lamp is thousands of nits, so the firefly clamp is too.
      clamp: 60000,
      weight: {
        Desk: 2,
        LitMat: 4,
        Keyboard: 3,
        Monitor: 1.5,
        UsbMic: 3,
        Mouse: 5,
      },
      ignore: [...GLOWS, "Mannequin", "UsbMicGrille"],
      probe: { at: [0, 1.2, -0.2], hide: GLOWS },
    },
  };
}
