// The bedroom desk as a scenery: a small bedroom, its props, a scanned plant and vase, and its light in
// physical units, by day, on an overcast day, at evening or at night. A scenery item calls `bedroomDesk(look)`.
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
  BACK_WALL,
  DESK_WALL,
  NIGHTSTAND,
  WINDOW_WALL,
} from "./props.ts";

export type Look = "day" | "overcast" | "evening" | "night";
/** The whole room (a talking head, a desk tour) or the desk and its wall alone (a demo filmed close). */
export type Version = "room" | "demo";

/** The room: 3.2 m wide, its left wall (the window's) at x = -0.55, the desk's wall at z = -0.92 (world). */
/**
 * The room: 3.2 m wide, its window in its right wall (x = WINDOW_WALL, world), the desk's wall at z = -0.92. The
 * shell puts its window in its left wall, so it is built facing the other way (its back wall is the desk's) and
 * turned round.
 */
const ROOM = { width: 3.2, front: BACK_WALL, back: DESK_WALL };
const ROOM_SHIFT = WINDOW_WALL - ROOM.width / 2;

/**
 * Each look's light, in physical units (lumens, candela, nits) and its camera's exposure (EV at ISO 100).
 * The window is beside the desk, so by day it is the key light; the lamp glows at every hour, the warm light by
 * evening and night.
 */
const LOOKS = {
  day: {
    ev: 6.9,
    /** The sky through the window: the HDRI averages 0.82 in its own units, a daytime sky some 3000 to 8000 nits. */
    sky: 3800,
    blind: 0.5,
    ceiling: 900,
    lamp: 35,
    monitor: 160,
  },
  overcast: {
    ev: 6.6,
    /** A grey sky: about a third of a clear one, the room's light soft and cool; the lamp on low. */
    sky: 1700,
    blind: 0.3,
    ceiling: 800,
    lamp: 12,
    monitor: 160,
  },
  evening: {
    ev: 5.9,
    /** The sun low and gone: the window dim, the blind half down, the lamp the warm light on the desk. */
    sky: 380,
    blind: 0.5,
    ceiling: 0,
    lamp: 40,
    monitor: 150,
  },
  night: {
    ev: 5.6,
    /** The blind down; the lamp and the screens. */
    sky: 4,
    blind: 1,
    ceiling: 0,
    lamp: 55,
    monitor: 130,
  },
} as const;

/** What glows is drawn, but its light is the light standing for it: baking both would count it twice. */
const GLOWS = ["ceiling-light", "GlobeLampGlobe", "tablet-screen"];

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
 * A coiled rattan placemat's top, `size` px square: rings of cane 5 mm apart on a 35 cm mat, shaded across each
 * coil, and the binds that stitch each coil to the next, offset ring to ring as a coiled weave's are.
 */
function rattanWeave(size: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("No 2D canvas for the placemat's weave.");
  const c = size / 2;
  g.fillStyle = "#d6b783";
  g.fillRect(0, 0, size, size);
  const coils = 34;
  const step = c / coils;
  for (let i = coils; i > 0; i--) {
    const r = i * step;
    const shade = g.createRadialGradient(c, c, r - step, c, c, r);
    shade.addColorStop(0, "#b8945e");
    shade.addColorStop(0.45, i % 3 === 0 ? "#dcbf8c" : "#e2c693");
    shade.addColorStop(1, "#c7a46c");
    g.fillStyle = shade;
    g.beginPath();
    g.arc(c, c, r, 0, Math.PI * 2);
    g.fill();
  }
  g.strokeStyle = "#8f6d40";
  g.lineCap = "round";
  for (let i = 2; i <= coils; i++) {
    const r = i * step;
    const binds = Math.max(6, Math.round((2 * Math.PI * r) / (step * 2.2)));
    for (let k = 0; k < binds; k++) {
      const a = ((k + (i % 2) * 0.5) / binds) * Math.PI * 2;
      g.lineWidth = step * 0.28;
      g.beginPath();
      g.moveTo(
        c + Math.cos(a) * (r - step * 0.95),
        c + Math.sin(a) * (r - step * 0.95),
      );
      g.lineTo(
        c + Math.cos(a) * (r - step * 0.05),
        c + Math.sin(a) * (r - step * 0.05),
      );
      g.stroke();
    }
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

export function bedroomDesk(
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

      // The room, turned round and moved so its window's wall stands 5 cm from the desk's right end: the light
      // comes from the right, as the home desk's comes from the left. The window is beside the desk and the
      // person (its centre level with the chair's front), clear of the desk's wall.
      const room = await shell(w, {
        width: ROOM.width,
        front: ROOM.front,
        back: ROOM.back,
        paint: "#f6e2d8",
        window: {
          z: 0.2,
          width: 1.0,
          sill: 0.85,
          height: 1.3,
          blind: L.blind,
        },
      });
      room.rotation.y = Math.PI;
      room.position.x = ROOM_SHIFT;
      w.scene.add(room);

      // The props from the kit. The wrapper is unnamed, so each prop is what a click selects.
      const kit = new THREE.Group();
      kit.add(await modelObject(w, props, { look, version }));
      w.scene.add(kit);
      kit.updateMatrixWorld(true);

      // The screens: named planes a video's screen() draws on, showing an idle page until then.
      const light = look !== "night";
      // The tablet's screen, an idle page until a video puts its own on it; the postcards' pictures.
      const idle = new THREE.MeshBasicMaterial({
        map: browserPage(1668, 2420, light, 834),
      });
      idle.color.setScalar(L.monitor);
      kit.add(
        screenOver(kit, "TabletScreen", "tablet-screen", idle, {
          up: [1, 0, 0],
          out: [0, 0, 1],
        }),
      );
      // The placemat's weave: coils of cane round the centre, each stitched to the next by short dark binds.
      const mat = kit.getObjectByName("PlacematTop");
      if (mat) {
        const box = new THREE.Box3().setFromObject(mat);
        const centre = box.getCenter(new THREE.Vector3());
        const weave = new THREE.Mesh(
          new THREE.CircleGeometry(0.173, 96),
          new THREE.MeshStandardMaterial({
            map: rattanWeave(1024),
            roughness: 0.85,
          }),
        );
        weave.name = "placemat-weave";
        weave.rotation.x = -Math.PI / 2;
        weave.position.set(centre.x, box.max.y + 0.0003, centre.z);
        kit.add(weave);
      }
      // The print over the desk: Claude Monet, Water Lilies, 1906 (Art Institute of Chicago, CC0).
      const monet = await w.texture(
        "assets/media/art/monet-water-lilies-1906.jpg",
      );
      kit.add(
        screenOver(
          kit,
          "PaintingArt",
          "painting",
          new THREE.MeshStandardMaterial({ map: monet, roughness: 0.85 }),
        ),
      );
      if (version === "room") {
        // A vase on the nightstand, a tall plant in the corner past the bed's foot.
        await place(
          w,
          "vase-nightstand",
          "assets/media/models/ceramic_vase_03/ceramic_vase_03_1k.gltf",
          [NIGHTSTAND.x - 0.1, NIGHTSTAND.top, -NIGHTSTAND.y],
          0,
          0.6,
        );
        await place(
          w,
          "plant-floor",
          "assets/media/models/potted_plant_01/potted_plant_01_1k.gltf",
          [-2.05, 0, -0.55],
          -30,
          0.9,
        );
      }

      // The ceiling fitting in the room's middle, and the area light that stands for it.
      const size = 0.32;
      const ceilingNits = L.ceiling / (Math.PI * size * size);
      const fittingAt = new THREE.Vector3(
        ROOM_SHIFT,
        2.57,
        -(ROOM.front + ROOM.back) / 2,
      );
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
      fitting.position.copy(fittingAt);
      w.scene.add(fitting);
      if (L.ceiling > 0)
        w.scene.add(
          pane(
            "ceiling-light-area",
            "#fff1dc",
            ceilingNits,
            [size, size],
            fittingAt.clone().setY(2.53),
            fittingAt.clone().setY(0),
          ),
        );

      // The desk lamp's bulb: warm, 2700 K.
      const globe = kit.getObjectByName("GlobeLampGlobe");
      if (globe && L.lamp > 0) {
        const bulb = new THREE.PointLight("#ffcf94", L.lamp, 0, 2);
        bulb.name = "lamp-bulb";
        bulb.position.copy(
          new THREE.Box3().setFromObject(globe).getCenter(new THREE.Vector3()),
        );
        w.scene.add(bulb);
      }

      // The tablet's steady light: a pane on its face, which a video's screen then adds its picture's difference to.
      const screen = kit.getObjectByName("tablet-screen");
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
            "tablet-light",
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
      // The talking head: a phone at 1.2 m, 0.6 m from the face (medians of popular demo videos); the bed behind.
      talking: {
        position: [0, 1.2, -0.7],
        target: [0, 1.15, -0.1],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // The demo: over the right shoulder, looking down at the tablet.
      demo: {
        position: [0.2, 1.18, -0.04],
        target: [0, 0.86, -0.53],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // Archetype C of docs/design/desk-settings.md: the tablet upright on its stand from high in front, as
      // a phone held over the desk sees it; close, its screen filling the frame; from the right, three-quarter;
      // the desk and the painting over it together.
      "tablet-high": {
        position: [0, 1.08, -0.25],
        target: [0, 0.86, -0.53],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      "tablet-close": {
        position: [0, 0.95, -0.27],
        target: [0, 0.88, -0.53],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      "tablet-side": {
        position: [0.19, 1.0, -0.29],
        target: [0, 0.87, -0.53],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      "desk-wall": {
        position: [0.05, 1.22, 0.1],
        target: [0.05, 1.08, -0.9],
        lens: 26,
        lensFrame: "phone",
        ev: L.ev,
      },
      // The setup seen from beside the person, on the bed's side (the left), as a desk tour shows it.
      setup: {
        position: [-0.8, 1.4, 0.45],
        target: [0.2, 0.95, -0.65],
        lens: 20,
        ev: L.ev,
      },
      // For review: the bed behind the person, the desk from above, the room from each side and its corner.
      wall: {
        position: [-0.1, 1.3, -0.75],
        target: [-0.8, 1.0, 2.0],
        lens: 15,
        ev: L.ev,
      },
      desktop: {
        position: [0.1, 1.8, -0.1],
        target: [0.1, 0.74, -0.62],
        lens: 16,
        ev: L.ev,
      },
      left: {
        position: [-2.3, 1.5, -0.6],
        target: [0.0, 0.95, 0.3],
        lens: 15,
        ev: L.ev,
      },
      right: {
        position: [0.6, 1.5, 1.6],
        target: [-0.1, 0.95, -0.6],
        lens: 15,
        ev: L.ev,
      },
      overview: {
        position: [-2.3, 2.35, 1.85],
        target: [-0.1, 0.8, -0.4],
        lens: 13,
        ev: L.ev,
      },
    },
    // The screen's parts from in front and from each side: tablet-<region>-<angle>
    // (components/cameras/screen-shots.ts).
    moves: {
      ...screenShots("tablet-screen", { prefix: "tablet", ev: L.ev }),
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
        Tablet: 2,
        TabletStand: 2,
        Placemat: 2,
        Mouse: 2,
        GlobeLamp: 1.5,
      },
      ignore: [...GLOWS, "Mannequin"],
      probe: { at: [0, 1.2, -0.2], hide: GLOWS },
    },
  };
}
