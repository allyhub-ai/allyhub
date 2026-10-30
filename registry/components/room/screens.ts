// Screens and pictures a scenery draws on the kit's props: a named plane over a
// prop's screen (what `screen()` in a video puts its content on), an idle picture
// for it while no video plays, and abstract art for a frame.
import * as THREE from "three";

/**
 * A plane over the face of a kit mesh that stands for a screen (a thin box, its
 * face towards the model's -y), named `name`: its +z side faces out and its
 * geometry's top left is the content's top left, as `screen()` takes it.
 */
export function screenOver(
  root: THREE.Object3D,
  meshName: string,
  name: string,
  material: THREE.Material,
  /**
   * Which way, in the mesh's own (Blender) axes, the picture's top is and its face looks: a monitor's
   * panel stands with z up and faces -y (the default); a laptop's display lies in its lid, its top away
   * from the hinge (-y) and its face -z.
   */
  axes: { up?: [number, number, number]; out?: [number, number, number] } = {},
): THREE.Mesh {
  const mesh = meshOf(root, meshName, name);
  mesh.updateWorldMatrix(true, false);
  mesh.geometry.computeBoundingBox();
  const box = mesh.geometry.boundingBox;
  if (!box) throw new Error(`${meshName} has no bounds.`);
  const size = box.getSize(new THREE.Vector3());
  const centre = box.getCenter(new THREE.Vector3());
  const up = new THREE.Vector3(...(axes.up ?? [0, 0, 1]));
  const out = new THREE.Vector3(...(axes.out ?? [0, -1, 0]));
  const right = new THREE.Vector3().crossVectors(up, out);
  const across = (v: THREE.Vector3): number => Math.abs(size.dot(v));
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(across(right), across(up)),
    material,
  );
  plane.name = name;
  // The plane's x, y and z (its face) along the picture's right, top and out, just in front of the mesh.
  const local = new THREE.Matrix4().makeBasis(right, up, out);
  local.setPosition(
    centre.clone().addScaledVector(out, across(out) / 2 + 0.0003),
  );
  plane.matrixAutoUpdate = false;
  plane.matrix.copy(mesh.matrixWorld).multiply(local);
  plane.matrix.decompose(plane.position, plane.quaternion, plane.scale);
  plane.matrixAutoUpdate = true;
  return plane;
}

/** The mesh named `meshName` under `root` (or the first mesh of the object so named). */
function meshOf(
  root: THREE.Object3D,
  meshName: string,
  name: string,
): THREE.Mesh {
  const source = root.getObjectByName(meshName);
  const mesh =
    source instanceof THREE.Mesh
      ? source
      : source?.children.find((c): c is THREE.Mesh => c instanceof THREE.Mesh);
  if (!mesh)
    throw new Error(
      `No mesh named ${meshName} to put the screen ${name} over.`,
    );
  return mesh;
}

/**
 * A copy of a kit mesh's own surface as a screen, named `name`, for a screen that is not flat (a curved
 * monitor's `MonitorScreen`): the same surface, nudged `lift` (m, default 0.3 mm) out along its normals,
 * its geometry turned so that its +z is the picture's out, +y its up and +x its right (`axes` as in
 * `screenOver`), with UVs from 0 to 1 across its bounds (u right, v up).
 *
 * What `screen()` does with it (scenery-host's `Screens.face` and `mapToFace`, page/screens.ts): the face is
 * the +z side of the geometry's bounding box, and the content's UVs are that face's projection, so a
 * vertex's place in the picture is its x and y in the box, wherever its z is. On a panel curved round a
 * vertical axis the picture therefore lies on the curve itself, spread evenly along the chord (not the arc:
 * at 3800R and 0.8 m across, its edges are 0.2 % narrower than its middle); the UVs given here are that same
 * projection, so an idle picture lands where a video will. The face's four corners are the surface's own
 * corners (its edges, nearest the viewer, are the box's +z); the face's centre, which a screen's light and
 * an overlaid screen (`inScenery: false`) use, is the chord's, the curve's sagitta (w² / 8r) in front of the
 * surface's middle.
 */
export function screenOn(
  root: THREE.Object3D,
  meshName: string,
  name: string,
  material: THREE.Material,
  axes: { up?: [number, number, number]; out?: [number, number, number] } = {},
  lift = 0.0003,
): THREE.Mesh {
  const mesh = meshOf(root, meshName, name);
  mesh.updateWorldMatrix(true, false);
  const up = new THREE.Vector3(...(axes.up ?? [0, 0, 1]));
  const out = new THREE.Vector3(...(axes.out ?? [0, -1, 0]));
  const right = new THREE.Vector3().crossVectors(up, out);
  const basis = new THREE.Matrix4().makeBasis(right, up, out);
  // Its surface alone (positions and normals), in the picture's axes.
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(mesh.geometry.getIndex()?.clone() ?? null);
  geometry.setAttribute(
    "position",
    mesh.geometry.getAttribute("position").clone(),
  );
  if (mesh.geometry.hasAttribute("normal"))
    geometry.setAttribute(
      "normal",
      mesh.geometry.getAttribute("normal").clone(),
    );
  else geometry.computeVertexNormals();
  geometry.applyMatrix4(basis.clone().invert());
  // Lifted out along its normals (each turned to face out).
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const n = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    n.fromBufferAttribute(normal, i);
    if (n.z < 0) n.negate();
    position.setXYZ(
      i,
      position.getX(i) + n.x * lift,
      position.getY(i) + n.y * lift,
      position.getZ(i) + n.z * lift,
    );
  }
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) throw new Error(`${meshName} has no bounds.`);
  const size = box.getSize(new THREE.Vector3());
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i++) {
    uv[i * 2] = (position.getX(i) - box.min.x) / size.x;
    uv[i * 2 + 1] = (position.getY(i) - box.min.y) / size.y;
  }
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  const screen = new THREE.Mesh(geometry, material);
  screen.name = name;
  screen.matrixAutoUpdate = false;
  screen.matrix.copy(mesh.matrixWorld).multiply(basis);
  screen.matrix.decompose(screen.position, screen.quaternion, screen.scale);
  screen.matrixAutoUpdate = true;
  return screen;
}

/** A seeded random number generator (mulberry32). */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * An idle desktop picture: a dark code editor and a browser beside it, drawn in
 * blocks (no words), so a still of the room has a lit screen. `width` × `height` px.
 */
export function idleScreen(
  width: number,
  height: number,
  seed = 1,
  light = false,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("No 2D context.");
  const r = seeded(seed);
  const bg = light ? "#f4f5f7" : "#16181d";
  const panel = light ? "#ffffff" : "#1e2128";
  const ink = light
    ? ["#3b4252", "#5e81ac", "#a3be8c", "#b48ead"]
    : ["#c8ccd4", "#61afef", "#98c379", "#c678dd", "#e5c07b"];
  g.fillStyle = bg;
  g.fillRect(0, 0, width, height);
  // A top bar, a side bar, and two panes.
  const u = height / 54;
  g.fillStyle = light ? "#e6e8ec" : "#0f1115";
  g.fillRect(0, 0, width, 2 * u);
  g.fillRect(0, 2 * u, 3 * u, height);
  const split = width * 0.56;
  g.fillStyle = panel;
  g.fillRect(3.4 * u, 2.6 * u, split - 4 * u, height - 3.2 * u);
  g.fillRect(split, 2.6 * u, width - split - 0.6 * u, height - 3.2 * u);
  // Lines of code: indented runs of coloured blocks.
  let y = 4 * u;
  let indent = 0;
  while (y < height - 2 * u) {
    if (r() < 0.12)
      indent = Math.max(0, Math.min(4, indent + (r() < 0.5 ? -1 : 1)));
    let x = 5 * u + indent * 1.6 * u;
    const words = 1 + Math.floor(r() * 6);
    for (let i = 0; i < words && x < split - 4 * u; i++) {
      const w = (1 + r() * 5) * 0.7 * u;
      g.fillStyle = ink[Math.floor(r() * ink.length)] ?? "#ccc";
      g.globalAlpha = 0.85;
      g.fillRect(x, y, w, 0.55 * u);
      x += w + 0.5 * u;
    }
    g.globalAlpha = 1;
    y += 1.15 * u;
  }
  // The right pane: a page with a hero block, cards and lines.
  const px = split + 1.4 * u;
  const pw = width - split - 3.4 * u;
  g.fillStyle = light ? "#5b6cff" : "#3d5afe";
  g.fillRect(px, 4 * u, pw, 12 * u);
  for (let i = 0; i < 3; i++) {
    g.fillStyle = light ? "#eef0f4" : "#262a33";
    g.fillRect(px + (i * pw) / 3, 18 * u, pw / 3 - u, 10 * u);
  }
  for (let i = 0; i < 12; i++) {
    g.fillStyle = light ? "#c9ced8" : "#3a3f4b";
    g.fillRect(px, 31 * u + i * 1.5 * u, pw * (0.5 + r() * 0.5), 0.6 * u);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** An abstract print: soft colour fields and a few shapes, from a seed and a palette (sRGB hex). */
export function abstractArt(
  width: number,
  height: number,
  seed: number,
  palette: string[],
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("No 2D context.");
  const r = seeded(seed);
  const pick = () => palette[Math.floor(r() * palette.length)] ?? "#888";
  g.fillStyle = palette[0] ?? "#eee";
  g.fillRect(0, 0, width, height);
  // Two broad fields, an arc and a small sun: the kind of print sold for a desk wall.
  g.fillStyle = pick();
  g.fillRect(0, height * (0.45 + r() * 0.2), width, height);
  g.fillStyle = pick();
  g.beginPath();
  g.arc(
    width * (0.3 + r() * 0.4),
    height * (0.55 + r() * 0.1),
    width * (0.25 + r() * 0.15),
    Math.PI,
    0,
  );
  g.fill();
  g.fillStyle = pick();
  g.beginPath();
  g.arc(
    width * (0.2 + r() * 0.6),
    height * (0.18 + r() * 0.15),
    width * (0.07 + r() * 0.05),
    0,
    2 * Math.PI,
  );
  g.fill();
  // A fine grain, as a print on paper has.
  const image = g.getImageData(0, 0, width, height);
  for (let i = 0; i < image.data.length; i += 4) {
    const n = (r() - 0.5) * 10;
    image.data[i] = Math.max(0, Math.min(255, (image.data[i] ?? 0) + n));
    image.data[i + 1] = Math.max(
      0,
      Math.min(255, (image.data[i + 1] ?? 0) + n),
    );
    image.data[i + 2] = Math.max(
      0,
      Math.min(255, (image.data[i + 2] ?? 0) + n),
    );
  }
  g.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * An idle browser page with words, so a still shows a screen as a demo would: a browser's tabs and address
 * bar, a site's header, a heading, a search field and a list of linked rows, at a desktop's own sizes
 * (the page's body text 15 px). `width` × `height` device px, showing `css` px across (2560 for a 27-inch
 * QHD monitor at 1×, 1512 for a 14-inch laptop at 2×); `light` for a light page.
 */
export function browserPage(
  width: number,
  height: number,
  light = false,
  css = 2560,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("No 2D context.");
  const k = width / css;
  const across = css * k;
  const c = light
    ? {
        page: "#ffffff",
        chrome: "#dfe3e8",
        bar: "#f1f3f4",
        ink: "#1f2328",
        soft: "#59636e",
        link: "#0969da",
        line: "#d1d9e0",
        accent: "#1f6feb",
      }
    : {
        page: "#0d1117",
        chrome: "#1b1f24",
        bar: "#2a2f36",
        ink: "#e6edf3",
        soft: "#8b949e",
        link: "#58a6ff",
        line: "#30363d",
        accent: "#2f81f7",
      };
  const font = (px: number, weight = 400): string =>
    `${String(weight)} ${String(Math.round(px * k))}px Inter, "Segoe UI", Helvetica, Arial, sans-serif`;
  g.fillStyle = c.page;
  g.fillRect(0, 0, width, height);
  // The browser: a row of tabs, then the address bar.
  g.fillStyle = c.chrome;
  g.fillRect(0, 0, across, 88 * k);
  const tabs = [
    "Acme Notes: your second brain",
    "Pricing · Acme Notes",
    "New Tab",
  ];
  tabs.forEach((t, i) => {
    g.fillStyle = i === 0 ? c.bar : c.chrome;
    g.fillRect((12 + i * 330) * k, 8 * k, 318 * k, 36 * k);
    g.fillStyle = i === 0 ? c.ink : c.soft;
    g.font = font(15);
    g.fillText(t, (28 + i * 330) * k, 31 * k);
  });
  g.fillStyle = c.bar;
  g.fillRect(0, 44 * k, across, 44 * k);
  g.fillStyle = c.page;
  g.beginPath();
  g.roundRect(120 * k, 51 * k, across - 260 * k, 30 * k, 15 * k);
  g.fill();
  g.fillStyle = c.ink;
  g.font = font(15);
  g.fillText("acmenotes.app/workspace/research", 150 * k, 72 * k);
  g.fillStyle = c.soft;
  g.font = font(18);
  g.fillText("←   →   ⟳", 22 * k, 73 * k);
  // The site: a header, a heading, a search field, then rows.
  const margin = Math.max(48, (css - 1280) / 2);
  const left = margin * k;
  const right = (css - margin) * k;
  g.fillStyle = c.ink;
  g.font = font(22, 700);
  g.fillText("Acme Notes", left, 150 * k);
  g.font = font(15);
  g.fillStyle = c.soft;
  ["Docs", "Templates", "Pricing", "Sign in"].forEach((t, i) =>
    g.fillText(t, right - (420 - i * 105) * k, 150 * k),
  );
  g.fillStyle = c.line;
  g.fillRect(0, 180 * k, across, 1 * k);
  g.fillStyle = c.ink;
  g.font = font(34, 700);
  g.fillText("Research", left, 260 * k);
  g.fillStyle = c.soft;
  g.font = font(16);
  g.fillText(
    "Everything you saved this week, sorted by when you'll need it.",
    left,
    296 * k,
  );
  g.strokeStyle = c.line;
  g.lineWidth = 2 * k;
  g.beginPath();
  g.roundRect(left, 330 * k, right - left, 52 * k, 10 * k);
  g.stroke();
  g.fillStyle = c.soft;
  g.font = font(16);
  g.fillText("Search notes, links and files…", left + 22 * k, 363 * k);
  g.fillStyle = c.accent;
  g.beginPath();
  g.roundRect(right - 150 * k, 338 * k, 140 * k, 36 * k, 8 * k);
  g.fill();
  g.fillStyle = "#ffffff";
  g.font = font(15, 600);
  g.fillText("+ New note", right - 128 * k, 362 * k);
  const rows: [string, string][] = [
    [
      "How the best onboarding flows ask for less",
      "blog.example.com/onboarding-that-asks-for-less",
    ],
    ["Pricing pages: 40 examples, annotated", "example.org/pricing-pages"],
    [
      "Interview notes: five design partners",
      "acmenotes.app/n/interviews-week-42",
    ],
    ["Launch checklist for a small team", "acmenotes.app/n/launch-checklist"],
    ["Why short demos beat long tours", "example.com/short-demos"],
    ["Competitor teardown: three note apps", "acmenotes.app/n/teardown"],
    ["Keyboard shortcuts everyone should know", "example.net/shortcuts"],
    [
      "Weekly metrics: signups, activation, retention",
      "acmenotes.app/n/metrics",
    ],
    ["Ideas for the next release", "acmenotes.app/n/ideas"],
    ["Reading list: product and growth", "acmenotes.app/n/reading"],
    ["Customer quotes worth keeping", "acmenotes.app/n/quotes"],
    ["Draft: the story of our first year", "acmenotes.app/n/first-year"],
  ];
  let y = 440 * k;
  for (const [title, url] of rows) {
    if (y > height - 60 * k) break;
    g.strokeStyle = c.soft;
    g.lineWidth = 2 * k;
    g.beginPath();
    g.arc(left + 10 * k, y - 6 * k, 8 * k, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = c.ink;
    g.font = font(17, 600);
    g.fillText(title, left + 34 * k, y);
    g.fillStyle = c.link;
    g.font = font(14);
    g.fillText(url, left + 34 * k, y + 24 * k);
    g.fillStyle = c.line;
    g.fillRect(left, y + 44 * k, right - left, 1 * k);
    y += 76 * k;
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
