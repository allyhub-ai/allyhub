// The home desk as a scenery: the room, its props, scanned plants and books, and its
// light in physical units, by day or at night. A scenery item calls `homeDesk(look)`.
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import {
  exposureOf,
  type SceneryDefinition,
  type SceneryHost,
} from "@allyhub-next/scenery-host/layer";
import { modelObject } from "@allyhub-next/model/three";
import { shell } from "../../room/shell.ts";
import { surface, TEXTURES } from "../../room/surfaces.ts";
import { abstractArt, browserPage, screenOver } from "../../room/screens.ts";
import { screenShots } from "../../cameras/screen-shots.ts";
import props, {
  BACK_SHELVES,
  BACK_WALL,
  CUBE,
  DESK_SHELF,
  DESK_WALL,
  DESK_Y,
} from "./props.ts";

export type Look = "day" | "overcast" | "evening" | "night";
/** The whole room (a talking head, a desk tour) or the desk and its wall alone (a demo filmed close). */
export type Version = "room" | "demo";

/** Each look's light, in physical units (lumens, candela, nits) and its camera's exposure (EV at ISO 100). */
const LOOKS = {
  day: {
    ev: 7.1,
    /** The sky through the window: the HDRI averages 0.82 in its own units, a daytime sky some 3000 to 8000 nits. */
    sky: 5000,
    ceiling: 1100,
    globe: 12,
    monitor: 160,
    wash: { color: "#ffb36b", nits: 600 },
    bar: 0,
    strip: null,
  },
  overcast: {
    ev: 6.6,
    /** A grey sky: about a third of a clear one, the room's light soft and cool. */
    sky: 1700,
    ceiling: 900,
    globe: 12,
    monitor: 160,
    wash: { color: "#ffc58f", nits: 450 },
    bar: 0,
    strip: null,
  },
  evening: {
    ev: 6.1,
    /** The sun low and gone behind the houses: the window dim, the lamps and the light bar on. */
    sky: 420,
    ceiling: 0,
    globe: 30,
    monitor: 150,
    wash: { color: "#ff9a52", nits: 2200 },
    bar: 6000,
    strip: null,
  },
  night: {
    ev: 5.9,
    /** Dusk outside, the street's glow: barely there. */
    sky: 4,
    ceiling: 0,
    globe: 40,
    monitor: 130,
    wash: { color: "#7b4dff", nits: 5200 },
    bar: 14000,
    strip: { color: "#ff4fd8", nits: 5200 },
  },
} as const;

/**
 * What glows is drawn, but its light is the light standing for it: baking both would count it twice.
 */
const GLOWS = [
  "ceiling-light",
  "GlobeLampGlobe",
  "LightBarDiffuser",
  "MonitorBarLight",
  "monitor-screen",
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
 * 8 bounces, the demo zone's objects at three times the density).
 */
export type BakeQuality = "preview" | "release";

export function homeDesk(
  look: Look,
  version: Version = "room",
  quality: BakeQuality = "preview",
): SceneryDefinition {
  const L = LOOKS[look];
  const books =
    "assets/media/models/book_encyclopedia_set_01/book_encyclopedia_set_01_1k.gltf";
  return {
    renderer: { antialias: true },
    async build(w) {
      RectAreaLightUniformsLib.init();
      w.renderer.toneMapping = THREE.AgXToneMapping;
      // The look's exposure for any camera that names none (three.js's own 1 is some seven stops over a room in nits).
      w.renderer.toneMappingExposure = exposureOf(L.ev);
      await w.environment("assets/media/environments/balcony/balcony_2k.hdr", {
        background: true,
      });
      // The sky at its own brightness: the bake gathers the window's light from it. Without the bake laid on
      // (a scene changed since `allyhub scenery bake`), every surface would take it unshaded, as if outdoors.
      w.scene.environmentIntensity = L.sky;
      w.scene.backgroundIntensity = L.sky;

      w.scene.add(
        await shell(w, { paint: look === "night" ? "#dcd9d4" : "#ecebe6" }),
      );

      // The props from the kit. The wrapper is unnamed, so each prop is what a click selects.
      const kit = new THREE.Group();
      kit.add(await modelObject(w, props, { look, version }));
      w.scene.add(kit);
      kit.updateMatrixWorld(true);

      // Wood where the kit asks for it, at its real grain size (the kit's UVs are in metres).
      const oak = await surface(
        w,
        look === "night" ? TEXTURES.walnut : TEXTURES.oak,
        { size: "metres", roughness: 1 },
      );
      kit.traverse((o) => {
        if (
          o instanceof THREE.Mesh &&
          (o.material as THREE.Material).name === "DeskTop"
        )
          o.material = oak;
      });

      // The screens: named planes a video's screen() draws on, showing an idle desktop until then.
      const idle = new THREE.MeshBasicMaterial({
        map: browserPage(2560, 1440, look !== "night", 1920),
      });
      idle.color.setScalar(L.monitor);
      kit.add(screenOver(kit, "MonitorScreen", "monitor-screen", idle));
      // The print on the desk's wall.
      const print = new THREE.MeshStandardMaterial({
        map: abstractArt(780, 1180, 11, [
          "#efe6d8",
          "#d98c5f",
          "#2f4b5a",
          "#e7b75f",
          "#9cae9b",
        ]),
        roughness: 0.85,
      });
      kit.add(screenOver(kit, "DeskArtArt", "art-print", print));

      // Scanned plants, books and vases. World axes: the back wall at z = 1.8, the desk's wall at z = -1.1.
      const backZ = -BACK_WALL - BACK_SHELVES.depth / 2;
      const [t0, t1, t2] = BACK_SHELVES.tops;
      if (version === "room") {
        await place(
          w,
          "plant-floor",
          "assets/media/models/potted_plant_01/potted_plant_01_1k.gltf",
          [1.5, 0, 1.38],
          30,
        );
        await place(
          w,
          "plant-window",
          "assets/media/models/potted_plant_02/potted_plant_02_1k.gltf",
          [-1.42, 0, 0.62],
          -20,
          0.9,
        );
        await bookRow(
          w,
          "books-shelf",
          books,
          [BACK_SHELVES.x + 0.08, t0 ?? 0, backZ],
          180,
          12,
        );
        await place(
          w,
          "plant-shelf",
          "assets/media/models/potted_plant_04/potted_plant_04_1k.gltf",
          [BACK_SHELVES.x - 0.22, t1 ?? 0, backZ],
          0,
        );
        await place(
          w,
          "vase-shelf",
          "assets/media/models/ceramic_vase_04/ceramic_vase_04_1k.gltf",
          [BACK_SHELVES.x + 0.23, t2 ?? 0, backZ],
          0,
          0.7,
        );
        const cubeZ = -(BACK_WALL + CUBE.gap) - 0.195;
        await bookRow(
          w,
          "books-cube",
          books,
          [CUBE.x + 0.176, 0.742, cubeZ],
          180,
          10,
        );
        await place(
          w,
          "vase-cube",
          "assets/media/models/ceramic_vase_03/ceramic_vase_03_1k.gltf",
          [CUBE.x - 0.176, 0.3905, cubeZ],
          0,
          0.7,
        );
      }
      const deskShelfZ = -(DESK_WALL - DESK_SHELF.depth / 2);
      await place(
        w,
        "plant-desk-shelf",
        "assets/media/models/potted_plant_04/potted_plant_04_1k.gltf",
        [DESK_SHELF.x + 0.14, DESK_SHELF.top, deskShelfZ],
        40,
        0.9,
      );
      // A plant on the desk's back right corner, beside the monitor.
      await place(
        w,
        "plant-desk",
        "assets/media/models/potted_plant_04/potted_plant_04_1k.gltf",
        [0.6, 0.74, -(DESK_Y + 0.28)],
        -30,
        1.3,
      );
      await bookRow(
        w,
        "books-desk-shelf",
        books,
        [DESK_SHELF.x - 0.17, DESK_SHELF.top, deskShelfZ],
        0,
        6,
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

      // The globe lamp's bulb.
      const globe = kit.getObjectByName("GlobeLampGlobe");
      if (globe && L.globe > 0) {
        const bulb = new THREE.PointLight("#ffd9a8", L.globe, 0, 2);
        bulb.name = "globe-bulb";
        bulb.position.copy(
          new THREE.Box3().setFromObject(globe).getCenter(new THREE.Vector3()),
        );
        w.scene.add(bulb);
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

      // The light bar behind the monitor, washing the desk's wall.
      const bar = kit.getObjectByName("LightBarDiffuser");
      if (bar) {
        const at = new THREE.Box3()
          .setFromObject(bar)
          .getCenter(new THREE.Vector3());
        w.scene.add(
          pane(
            "light-bar-wash",
            L.wash.color,
            L.wash.nits,
            [0.04, 0.24],
            at,
            new THREE.Vector3(at.x, at.y, at.z - 1),
          ),
        );
      }

      // The monitor's own light bar, down onto the keyboard.
      const monitorBar = kit.getObjectByName("MonitorBarLight");
      if (monitorBar && L.bar > 0) {
        const at = new THREE.Box3()
          .setFromObject(monitorBar)
          .getCenter(new THREE.Vector3());
        w.scene.add(
          pane(
            "monitor-bar-light",
            "#fff4e4",
            L.bar,
            [0.47, 0.012],
            at.clone().add(new THREE.Vector3(0, -0.006, 0)),
            new THREE.Vector3(at.x, 0.74, at.z + 0.35),
          ),
        );
      }

      // At night, an LED strip under the top back shelf, washing the wall behind the person.
      if (L.strip) {
        const y = (t2 ?? 1.9) - 0.045;
        w.scene.add(
          pane(
            "shelf-strip",
            L.strip.color,
            L.strip.nits,
            [BACK_SHELVES.width - 0.05, 0.015],
            new THREE.Vector3(BACK_SHELVES.x, y, -BACK_WALL - 0.03),
            new THREE.Vector3(BACK_SHELVES.x, y - 1, -BACK_WALL - 0.03),
          ),
        );
      }
      return {};
    },
    // Typing: each finger dips and lifts by its own rhythm, a function of t alone.
    cameras: {
      // The talking head: a phone at 1.2 m, 0.6 m from the face (medians of popular demo videos).
      talking: {
        position: [0, 1.2, -0.7],
        target: [0, 1.15, -0.1],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // The demo: over the shoulder, looking down at the keyboard and screen (65% of popular demo videos look down).
      demo: {
        position: [0.3, 1.34, 0.12],
        target: [0, 0.9, -0.74],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // The keyboard and the clock from straight above, as a top-down typing shot frames them.
      overhead: {
        position: [0, 1.22, -0.42],
        target: [0, 0.74, -0.52],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // Around the screens, as popular computer-screen demos are filmed (69 videos: a phone's main camera, 94%
      // wide; the screen at a median 0.5 m, the hands at 0.6 m; 61% looking down, 36% level; 58% held still).
      // The keyboard from high on its left, looking down across it at the monitor: solved from a popular
      // demo's frame by the keyboard's four corners (where the typing hands go).
      "hands-keyboard": {
        position: [-0.328, 1.271, -0.188],
        yaw: -31.3,
        pitch: -31.1,
        roll: 0.1,
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // Over the left shoulder, as the most watched mechanical-keyboard demos film it (archetype A of
      // docs/design/desk-settings.md): the hands on the keys in the lower third, the screen above.
      shoulder: {
        position: [-0.14, 1.09, -0.12],
        target: [0.04, 0.8, -0.72],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // Low over the keyboard's front edge, looking along the keys at the screen: the keys large below, the
      // screen above them, as close typing shots film it.
      "keys-low": {
        position: [0.04, 0.88, -0.27],
        target: [0, 0.86, -0.86],
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
    // The screen's parts from in front and from each side: monitor-<region>-<angle>
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
        Keyboard: 3,
        Monitor: 1.5,
        DeskClock: 2,
      },
      // The stand-in takes the probe's even light: a lightmap's charts blotch a smooth body, and it is only a guide for the AI.
      ignore: [...GLOWS, "Mannequin"],
      probe: { at: [0, 1.2, -0.2], hide: GLOWS },
    },
  };
}
