// The gaming setup as a scenery: a dark room, its props, its LED strips and lit fans, and its light in
// physical units, by day, on an overcast day, at evening or at night. A scenery item calls `gamingSetup(look)`.
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import {
  exposureOf,
  type SceneryDefinition,
  type SceneryHost,
} from "@allyhub-next/scenery-host/layer";
import { modelObject } from "@allyhub-next/model/three";
import { shell } from "../../room/shell.ts";
import { browserPage, screenOver } from "../../room/screens.ts";
import { screenShots } from "../../cameras/screen-shots.ts";
import props, {
  DESK_WALL,
  DESK_Y,
  LEDS,
  TOP,
  TOWER,
  WALL_SHELVES,
} from "./props.ts";

export type Look = "day" | "overcast" | "evening" | "night";
/** The whole room (a talking head, a desk tour) or the desk and its wall alone (a demo filmed close). */
export type Version = "room" | "demo";

/**
 * Each look's light, in physical units (lumens, candela, nits) and its camera's exposure (EV at ISO 100).
 * Darker than the other settings at every hour: the blind kept down, the walls dark, the LEDs the colour.
 */
const LOOKS = {
  day: {
    // A dark room, exposed to be seen: its light is a sixth of the home desk's, its exposure 1.8 stops over.
    ev: 4.8,
    /** The sky through the window, the blind more than half down. */
    sky: 3500,
    blind: 0.55,
    ceiling: 0,
    monitor: 170,
    /** The LED strips' light (nits): under the desk's back edge, under the shelves; and the tower's open side. */
    desk: 150,
    shelf: 120,
    tower: 10,
  },
  overcast: {
    ev: 4.4,
    /** A grey sky through the same blind; the ceiling light on low. */
    sky: 1300,
    blind: 0.55,
    ceiling: 500,
    monitor: 170,
    desk: 200,
    shelf: 160,
    tower: 13,
  },
  evening: {
    ev: 5.6,
    /** The sun gone, the blind nearly down: the strips violet and pink. */
    sky: 250,
    blind: 0.85,
    ceiling: 0,
    monitor: 160,
    desk: 2500,
    shelf: 2000,
    tower: 110,
  },
  night: {
    ev: 5.2,
    /** The blind down: pink under the desk, cyan under the shelves, the screens. */
    sky: 2,
    blind: 1,
    ceiling: 0,
    monitor: 150,
    desk: 6500,
    shelf: 5000,
    tower: 320,
  },
} as const;

/** What glows is drawn, but its light is the light standing for it: baking both would count it twice. */
const GLOWS = [
  "ceiling-light",
  "DeskStripLed",
  "ShelfStripLed1",
  "ShelfStripLed2",
  "PcTowerFans",
  "monitor-screen",
  "laptop-screen",
];

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

/**
 * A row of the first `count` books of Poly Haven's encyclopedia set, at their own size (each about 23 cm tall,
 * 17.5 cm deep and 2.7 cm thick), standing with the row's middle at `at` and their spines facing `turn`.
 */
async function bookRow(
  w: SceneryHost,
  name: string,
  file: string,
  at: [number, number, number],
  turn: number,
  count: number,
): Promise<THREE.Group> {
  const set = await w.load(file);
  const gone = set.children.filter(
    (c) => Number(/book(\d+)$/u.exec(c.name)?.[1] ?? 0) > count,
  );
  for (const c of gone) c.removeFromParent();
  const box = new THREE.Box3().setFromObject(set);
  const middle = box.getCenter(new THREE.Vector3());
  set.position.set(-middle.x, -box.min.y, -middle.z);
  const row = new THREE.Group();
  row.name = name;
  row.add(set);
  row.position.set(...at);
  row.rotation.y = THREE.MathUtils.degToRad(turn);
  w.scene.add(row);
  return row;
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

export function gamingSetup(
  look: Look,
  version: Version = "room",
  quality: BakeQuality = "preview",
): SceneryDefinition {
  const L = LOOKS[look];
  const led = LEDS[look];
  const books =
    "assets/media/models/book_encyclopedia_set_01/book_encyclopedia_set_01_1k.gltf";
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

      // The home desk's room, its desk's wall 5 cm further back, painted a dark grey, its blind further down.
      w.scene.add(
        await shell(w, {
          front: -DESK_WALL,
          paint: "#3a3c42",
          ceiling: "#2e3034",
          window: {
            z: -0.45,
            width: 1.2,
            sill: 0.85,
            height: 1.3,
            blind: L.blind,
          },
          skirting: { height: 0.08, depth: 0.012, color: "#2e3034" },
        }),
      );

      // The props from the kit. The wrapper is unnamed, so each prop is what a click selects.
      const kit = new THREE.Group();
      kit.add(await modelObject(w, props, { look, version }));
      w.scene.add(kit);
      kit.updateMatrixWorld(true);

      // The screens: named planes a video's screen() draws on, showing an idle page (dark) until then.
      const idle = new THREE.MeshBasicMaterial({
        map: browserPage(2560, 1440, false, 1920),
      });
      idle.color.setScalar(L.monitor);
      kit.add(screenOver(kit, "MonitorScreen", "monitor-screen", idle));
      const lapIdle = new THREE.MeshBasicMaterial({
        map: browserPage(3024, 1964, false, 1512),
      });
      lapIdle.color.setScalar(L.monitor * 0.9);
      kit.add(
        screenOver(kit, "LaptopScreen", "laptop-screen", lapIdle, {
          up: [0, -1, 0],
          out: [0, 0, -1],
        }),
      );

      // Books and a plant on the shelves (world: the desk's wall at z = -1.15).
      const shelfZ = -(DESK_WALL - WALL_SHELVES.depth / 2);
      const [left = -0.58, right = 0.58] = WALL_SHELVES.x;
      await bookRow(
        w,
        "books-shelf",
        books,
        [right - 0.08, WALL_SHELVES.top, shelfZ],
        0,
        6,
      );
      await place(
        w,
        "plant-shelf",
        "assets/media/models/potted_plant_04/potted_plant_04_1k.gltf",
        [left + 0.2, WALL_SHELVES.top, shelfZ],
        20,
        0.8,
      );

      // The ceiling fitting, and the area light that stands for it.
      const size = 0.32;
      const ceilingNits = L.ceiling / (Math.PI * size * size);
      const fitting = new THREE.Mesh(
        new THREE.CylinderGeometry(size / 2 + 0.02, size / 2 + 0.02, 0.06, 48),
        new THREE.MeshStandardMaterial({
          color: "#ffffff",
          emissive: "#fff3e2",
          emissiveIntensity: Math.max(ceilingNits, 0.2),
          roughness: 0.6,
        }),
      );
      fitting.name = "ceiling-light";
      fitting.position.set(0, 2.57, 0.35);
      w.scene.add(fitting);
      if (L.ceiling > 0)
        w.scene.add(
          pane(
            "ceiling-light-area",
            "#fff1dc",
            ceilingNits,
            [size, size],
            new THREE.Vector3(0, 2.53, 0.35),
            new THREE.Vector3(0, 0, 0.35),
          ),
        );

      // The strip under the desk's back edge, washing the wall behind the monitor (5 cm behind it) up and down.
      const strip = new THREE.Vector3(0, TOP - 0.031, -(DESK_Y + 0.4 - 0.002));
      w.scene.add(
        pane(
          "desk-strip",
          led.desk,
          L.desk,
          [1.5, 0.01],
          strip,
          new THREE.Vector3(0, strip.y + 0.25, strip.z - 1),
        ),
      );
      // The strips under the shelves, down the wall onto the desk.
      WALL_SHELVES.x.forEach((x, i) => {
        const at = new THREE.Vector3(
          x,
          WALL_SHELVES.top - 0.032,
          -(DESK_WALL - WALL_SHELVES.depth + 0.02),
        );
        w.scene.add(
          pane(
            `shelf-strip-${String(i + 1)}`,
            led.shelf,
            L.shelf,
            [WALL_SHELVES.width - 0.04, 0.01],
            at,
            at.clone().setY(at.y - 1),
          ),
        );
      });
      // The tower's lit inside, through its open side towards the monitor.
      const side = new THREE.Vector3(
        TOWER.x + TOWER.size[0] / 2 + 0.003,
        TOP + TOWER.size[2] / 2,
        -TOWER.y,
      );
      w.scene.add(
        pane(
          "tower-glow",
          led.fans,
          L.tower,
          [TOWER.size[1] - 0.04, TOWER.size[2] - 0.06],
          side,
          side.clone().setX(side.x + 1),
        ),
      );

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
      // The demo: over the shoulder, looking down at the keyboard and screen.
      demo: {
        position: [0.3, 1.34, 0.12],
        target: [0, 0.9, -0.74],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // The desk from straight above the hands.
      overhead: {
        position: [0.04, 1.36, -0.32],
        target: [0.04, 0.74, -0.6],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // The keyboard from high on its left, looking down across it at the monitor (the home desk's camera,
      // solved from a popular demo's frame; the keyboard stands at the same place).
      "hands-keyboard": {
        position: [-0.328, 1.271, -0.188],
        yaw: -31.3,
        pitch: -31.1,
        roll: 0.1,
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // The laptop from behind where the hands go: solved from a popular demo's frame by its screen's corners.
      "laptop-over-hands": {
        position: [0.487, 1.143, -0.397],
        yaw: -9.2,
        pitch: -26.9,
        roll: 0.1,
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // Low over the laptop's keys, 10 cm above the desk: solved from a popular demo's frame by the screen's edges, its pitch
      // fixed at the frame's look along the keys.
      "keys-low": {
        position: [0.529, 0.838, -0.575],
        yaw: -8.4,
        pitch: -12,
        roll: 0.3,
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
        target: [0, 0.74, -0.72],
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
    // The screens' parts from in front and from each side: monitor-<region>-<angle>, laptop-<region>-<angle>
    // (components/cameras/screen-shots.ts).
    moves: {
      ...screenShots("monitor-screen", { prefix: "monitor", ev: L.ev }),
      ...screenShots("laptop-screen", { prefix: "laptop", ev: L.ev }),
    },
    bake: {
      ...(quality === "release"
        ? { density: 75, samples: 512, bounces: 8, maxSize: 8192 }
        : { density: 50, samples: 32, bounces: 4 }),
      // Light in physical units: a sample from the sky or an LED is thousands of nits, so the firefly clamp is too.
      clamp: 60000,
      weight: {
        Desk: 2,
        Keyboard: 3,
        Monitor: 1.5,
        Laptop: 2,
        Mouse: 2,
        PcTower: 1.5,
      },
      ignore: [...GLOWS, "Mannequin"],
      probe: { at: [0, 1.2, -0.2], hide: GLOWS },
    },
  };
}
