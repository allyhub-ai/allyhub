// The minimal white desk as a scenery: a white room, its few props, a scanned plant, and its light in
// physical units, by day, on an overcast day, at evening or at night. A scenery item calls `minimalWhite(look)`.
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import {
  exposureOf,
  type SceneryDefinition,
  type SceneryHost,
} from "@allyhub-next/scenery-host/layer";
import { modelObject } from "@allyhub-next/model/three";
import { shell } from "../../room/shell.ts";
import {
  abstractArt,
  browserPage,
  idleScreen,
  screenOver,
} from "../../room/screens.ts";
import { screenShots } from "../../cameras/screen-shots.ts";
import props, { DESK_PLANT, DESK_WALL, DRAWERS, TOP } from "./props.ts";

export type Look = "day" | "overcast" | "evening" | "night";
/** The whole room (a talking head, a desk tour) or the desk and its wall alone (a demo filmed close). */
export type Version = "room" | "demo";

/**
 * Each look's light, in physical units (lumens, candela, nits) and its camera's exposure (EV at ISO 100).
 * Soft and even, the blind up by day, a wide ceiling panel; the screens a step brighter than the warm
 * greige wall, so a white page stands out from it.
 */
const LOOKS = {
  day: {
    ev: 7.6,
    /** The sky through the window: the HDRI averages 0.82 in its own units, a daytime sky some 3000 to 8000 nits. */
    sky: 6000,
    blind: 0,
    ceiling: { lumens: 1400, color: "#fff6ec" },
    monitor: 220,
  },
  overcast: {
    ev: 6.9,
    /** A grey sky: soft, cool, even light, the ceiling panel on. */
    sky: 2200,
    blind: 0,
    ceiling: { lumens: 1400, color: "#fff6ec" },
    monitor: 200,
  },
  evening: {
    ev: 6.2,
    /** The sun low and gone: the blind a third down, the ceiling panel warm. */
    sky: 450,
    blind: 0.3,
    ceiling: { lumens: 1100, color: "#ffe2bf" },
    monitor: 160,
  },
  night: {
    ev: 5.9,
    /** The blind down; the ceiling panel warm and the screens. */
    sky: 4,
    blind: 1,
    ceiling: { lumens: 900, color: "#ffd9ad" },
    monitor: 140,
  },
} as const;

/** What glows is drawn, but its light is the light standing for it: baking both would count it twice. */
const GLOWS = ["ceiling-light", "monitor-screen", "phone-screen"];

/** The warm strip under the walnut drawer unit's lip (nits), by look: on at every hour, as in the reference. */
const STRIP = { day: 500, overcast: 600, evening: 1400, night: 1800 } as const;

/** A Poly Haven model, placed: where it stands (world), its turn about y (degrees) and scale. */
async function place(
  w: SceneryHost,
  name: string,
  file: string,
  at: [number, number, number],
  turn = 0,
  scale = 1,
): Promise<THREE.Group> {
  const model = await w.load(file);
  model.name = name;
  model.position.set(...at);
  model.rotation.y = THREE.MathUtils.degToRad(turn);
  model.scale.setScalar(scale);
  w.scene.add(model);
  return model;
}

/** A rectangle light named `name`, at `at`, shining towards `to`. */
function pane(
  name: string,
  color: THREE.ColorRepresentation,
  nits: number,
  size: [number, number],
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

export function minimalWhite(
  look: Look,
  version: Version = "room",
  quality: BakeQuality = "preview",
): SceneryDefinition {
  const L = LOOKS[look];
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

      // The home desk's room, its desk's wall brought up to the desk, painted white. The window moves 10 cm
      // back with the wall, so it stays clear of it.
      w.scene.add(
        await shell(w, {
          front: -DESK_WALL,
          paint: "#e0d9cf",
          ceiling: "#f7f7f5",
          window: {
            z: -0.35,
            width: 1.2,
            sill: 0.85,
            height: 1.3,
            blind: L.blind,
          },
          skirting: { height: 0.06, depth: 0.012, color: "#f6f5f2" },
        }),
      );

      // The props from the kit. The wrapper is unnamed, so each prop is what a click selects.
      const kit = new THREE.Group();
      kit.add(await modelObject(w, props, { look, version }));
      w.scene.add(kit);
      kit.updateMatrixWorld(true);

      // The screens: named planes a video's screen() draws on, showing an idle page until then.
      const light = look !== "night";
      const idle = new THREE.MeshBasicMaterial({
        map: browserPage(2560, 1440, light, 1920),
      });
      idle.color.setScalar(L.monitor);
      kit.add(screenOver(kit, "MonitorScreen", "monitor-screen", idle));
      const phoneIdle = new THREE.MeshBasicMaterial({
        map: idleScreen(1206, 2622, 5, light),
      });
      phoneIdle.color.setScalar(L.monitor * 1.2);
      kit.add(
        screenOver(kit, "PhoneScreen", "phone-screen", phoneIdle, {
          up: [0, 1, 0],
          out: [0, 0, 1],
        }),
      );

      // The one plant on the desk.
      await place(
        w,
        "plant-desk",
        "assets/media/models/potted_plant_04/potted_plant_04_1k.gltf",
        [DESK_PLANT.x, TOP, -DESK_PLANT.y],
        25,
      );
      if (version === "room") {
        // The print behind the person: pale, quiet colours.
        const print = new THREE.MeshStandardMaterial({
          map: abstractArt(820, 1260, 7, [
            "#f4f1ea",
            "#d9d4ca",
            "#c3cbc6",
            "#e8d9c4",
            "#a9b4b0",
          ]),
          roughness: 0.85,
        });
        kit.add(screenOver(kit, "BackArtArt", "art-print", print));
        await place(
          w,
          "plant-floor",
          "assets/media/models/potted_plant_01/potted_plant_01_1k.gltf",
          [-1.4, 0, 1.4],
          30,
        );
      }

      // The ceiling panel, a 0.45 m disc, and the area light that stands for it.
      const size = 0.45;
      const ceilingNits = L.ceiling.lumens / (Math.PI * size * size);
      const fitting = new THREE.Mesh(
        new THREE.CylinderGeometry(size / 2 + 0.02, size / 2 + 0.02, 0.05, 64),
        new THREE.MeshStandardMaterial({
          color: "#ffffff",
          emissive: L.ceiling.color,
          emissiveIntensity: Math.max(ceilingNits, 0.2),
          roughness: 0.6,
        }),
      );
      fitting.name = "ceiling-light";
      fitting.position.set(0, 2.575, 0.3);
      w.scene.add(fitting);
      w.scene.add(
        pane(
          "ceiling-light-area",
          L.ceiling.color,
          ceilingNits,
          [size, size],
          new THREE.Vector3(0, 2.54, 0.3),
          new THREE.Vector3(0, 0, 0.3),
        ),
      );

      // The warm strip under the drawer unit's lip, down onto the desk and back onto the wall.
      {
        const [w2, d2] = DRAWERS.size;
        const at = new THREE.Vector3(
          DRAWERS.x,
          TOP + 0.016,
          -(DRAWERS.y - d2 / 2 + 0.01),
        );
        w.scene.add(
          pane(
            "drawer-strip",
            "#ffb26b",
            STRIP[look],
            [w2 - 0.04, 0.01],
            at,
            at.clone().add(new THREE.Vector3(0, -1, -0.4)),
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
            "#e8eefc",
            L.monitor,
            [g.parameters.width, g.parameters.height],
            at,
            at.clone().add(normal),
          ),
        );
      }
      return {};
    },
    cameras: {
      // The talking head: a phone at 1.2 m, 0.6 m from the face (medians of popular demo videos).
      talking: {
        position: [0, 1.2, -0.7],
        target: [0, 1.15, -0.1],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // Archetype E of docs/design/desk-settings.md. The demo: square on, a little high, the monitor with the
      // phone docked at its foot and the keyboard below.
      demo: {
        position: [0, 1.15, -0.1],
        target: [0, 0.95, -0.8],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // Over the right shoulder, looking down at the keys and the screen.
      shoulder: {
        position: [0.18, 1.17, -0.06],
        target: [-0.02, 0.88, -0.75],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // Low across the keys, as the reference films its typing: the keys below, the screen and the docked
      // phone above.
      "keys-low": {
        position: [0.05, 0.93, -0.18],
        target: [0, 0.92, -0.85],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // The keyboard, the trackpad and the felt from straight above.
      overhead: {
        position: [0.08, 1.24, -0.38],
        target: [0.08, 0.74, -0.48],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // The drawer unit, its warm strip, the book and the plant beyond: the desk's corner of wood.
      corner: {
        position: [0.2, 1.05, -0.3],
        target: [0.5, 0.82, -0.85],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // The setup seen from beside the person, as a desk tour shows it.
      setup: {
        position: [-1.2, 1.4, 0.55],
        target: [0.05, 0.95, -0.7],
        lens: 20,
        ev: L.ev,
      },
      // For review: the wall behind the person, the desk from above, the room from each side and its corner.
      wall: {
        position: [0, 1.3, -0.75],
        target: [0, 1.3, 1.8],
        lens: 15,
        ev: L.ev,
      },
      desktop: {
        position: [0, 1.8, -0.1],
        target: [0, 0.74, -0.67],
        lens: 16,
        ev: L.ev,
      },
      left: {
        position: [-1.6, 1.5, 0.2],
        target: [0.2, 0.95, -0.45],
        lens: 15,
        ev: L.ev,
      },
      right: {
        position: [1.6, 1.5, 0.5],
        target: [-0.2, 0.95, -0.35],
        lens: 15,
        ev: L.ev,
      },
      overview: {
        position: [1.65, 2.35, 1.65],
        target: [-0.3, 0.8, -0.5],
        lens: 13,
        ev: L.ev,
      },
    },
    // The screens' parts from in front and from each side: monitor-<region>-<angle>, phone-<region>-<angle>
    // (components/cameras/screen-shots.ts).
    moves: {
      ...screenShots("monitor-screen", { prefix: "monitor", ev: L.ev }),
      ...screenShots("phone-screen", { prefix: "phone", ev: L.ev }),
    },
    bake: {
      ...(quality === "release"
        ? { density: 75, samples: 512, bounces: 8, maxSize: 8192 }
        : { density: 50, samples: 32, bounces: 4 }),
      // Light in physical units: a sample from the sky or a lamp is thousands of nits, so the firefly clamp is too.
      clamp: 60000,
      weight: {
        Desk: 2,
        Keyboard: 3,
        Monitor: 1.5,
        PhoneStand: 2,
        Trackpad: 2,
        DrawerUnit: 2,
        SpringToy: 2,
      },
      ignore: [...GLOWS, "Mannequin"],
      probe: { at: [0, 1.2, -0.2], hide: GLOWS },
    },
  };
}
