// The desk kit's variants side by side (kit-variants/variants.ts) under a plain sky and sun, to look them over.
// Scenery axes (Y up): the model's rows run along x, their fronts towards +z.
import * as THREE from "three";
import { defineScenery } from "@allyhub-next/scenery-host/layer";
import { modelObject } from "@allyhub-next/model/three";
import variants from "./variants.ts";
import { browserPage, screenOn } from "../../components/room/screens.ts";

export default defineScenery({
  renderer: { antialias: true },
  async build(w) {
    w.scene.background = new THREE.Color("#d9dadc");
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 4),
      new THREE.MeshStandardMaterial({ color: "#bfc0c2", roughness: 0.9 }),
    );
    floor.name = "floor";
    floor.rotation.x = -Math.PI / 2;
    w.scene.add(floor);
    const kit = new THREE.Group();
    kit.add(await modelObject(w, variants));
    w.scene.add(kit);
    kit.updateMatrixWorld(true);
    // The curved ultrawide's screen: a copy of its own curved surface, named for screen() to draw on
    // (its panel is the model's third MonitorScreen, so its name has a suffix).
    let panel: THREE.Object3D | undefined;
    kit.getObjectByName("MonitorUltrawide34")?.traverse((o) => {
      if (!panel && o.name.startsWith("MonitorScreen")) panel = o;
    });
    if (panel)
      kit.add(
        screenOn(
          kit,
          panel.name,
          "ultrawide-screen",
          new THREE.MeshBasicMaterial({
            map: browserPage(3440, 1440, true, 3440),
          }),
        ),
      );
    w.scene.add(new THREE.HemisphereLight("#ffffff", "#8a8580", 1.6));
    const sun = new THREE.DirectionalLight("#fff6ea", 2.4);
    sun.name = "sun";
    sun.position.set(1.5, 3, 2.5);
    w.scene.add(sun);
    return {};
  },
  cameras: {
    // Every row from in front and above.
    overview: { position: [0, 1.6, 2.6], target: [0, 0.15, 0], lens: 24 },
    // The monitors, over the laptops in front of them.
    monitors: { position: [0, 1.25, 0.65], target: [0, 0.35, -0.9], lens: 22 },
    // The laptops, keyboards and mice from above the front.
    desk: { position: [0, 0.9, 1.1], target: [0, 0, -0.05], lens: 28 },
    // Every row, the trackpads and tablets in front.
    tablets: { position: [0, 1.15, 2.45], target: [0, 0, 0.95], lens: 28 },
    // The 65% board (KeyboardRetro) as Keychron's photos show it: from straight above, from its front right
    // and above, from its front left and low, from its right side, and its right column and arrows close.
    retroTop: {
      position: [1.75, 2.6, 0.3],
      target: [1.75, 0.02, 0.3],
      up: [0, 0, -1],
      lens: 240,
    },
    retroThreeQuarter: {
      position: [2.05, 0.62, 0.62],
      target: [1.75, 0.02, 0.3],
      lens: 60,
    },
    retroLow: {
      position: [1.45, 0.3, 0.82],
      target: [1.76, 0.02, 0.3],
      lens: 60,
    },
    retroSide: {
      position: [2.75, 0.03, 0.3],
      target: [1.75, 0.02, 0.3],
      lens: 140,
    },
    retroCorner: {
      position: [1.875, 0.9, 0.3],
      target: [1.875, 0.02, 0.3],
      up: [0, 0, -1],
      lens: 100,
    },
  },
});
