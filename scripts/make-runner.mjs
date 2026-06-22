// Generates a run-cycle of a briefcase-carrying buddy as macOS menu bar
// template frames (white silhouette in the alpha channel; the system tints it).
// The figure is built from circles and capsules and rasterized with 4x
// supersampling for antialiased edges. Reference: a person running left while
// holding a briefcase, with motion lines trailing in front.
import { mkdirSync, writeFileSync } from "node:fs";
import { encodePng } from "./png.mjs";

const SIZE = 36; // logical icon size (px)
const SS = 4; // supersampling factor
const DIM = SIZE * SS;
const FRAMES = 6;

// --- geometry helpers (operate in logical SIZE space) ---

function dist(px, py, ax, ay) {
  return Math.hypot(px - ax, py - ay);
}

/** Distance from point P to segment AB. */
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1e-6;
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return dist(px, py, ax + t * dx, ay + t * dy);
}

function circle(cx, cy, r) {
  return { kind: "circle", cx, cy, r };
}
function capsule(ax, ay, bx, by, r) {
  return { kind: "capsule", ax, ay, bx, by, r };
}

function inside(prim, px, py) {
  if (prim.kind === "circle") return dist(px, py, prim.cx, prim.cy) <= prim.r;
  return segDist(px, py, prim.ax, prim.ay, prim.bx, prim.by) <= prim.r;
}

// --- the figure, parameterized by run phase t in [0,1) ---

const HIP = { x: 15, y: 22 };
const SHOULDER = { x: 19, y: 16 };
const LIMB = 1.7; // limb capsule radius

function leg(phaseRad) {
  const swing = Math.sin(phaseRad); // -1..1, +ve = forward (left)
  const footX = HIP.x - 4.5 * swing;
  const footY = 30 - 1.6 * Math.abs(swing); // lift while swinging
  const kneeX = (HIP.x + footX) / 2 - 1.2 * Math.max(0, swing);
  const kneeY = (HIP.y + footY) / 2 + 1.2;
  return [
    capsule(HIP.x, HIP.y, kneeX, kneeY, LIMB),
    capsule(kneeX, kneeY, footX, footY, LIMB),
    capsule(footX - 1.2, footY + 0.6, footX + 1.2, footY + 0.6, LIMB * 0.9), // foot
  ];
}

function framePrims(t) {
  const phase = t * Math.PI * 2;
  const bob = -0.7 * Math.abs(Math.sin(phase)); // subtle vertical bob
  const lift = (p) => shift(p, 0, bob);

  const prims = [];

  // head + body
  prims.push(circle(22, 12, 4.2));
  prims.push(capsule(SHOULDER.x, SHOULDER.y, HIP.x, HIP.y, 2.3)); // torso
  prims.push(capsule(20.5, 14.5, SHOULDER.x, SHOULDER.y, 1.6)); // neck

  // back arm (trailing right), swings opposite the front leg
  const armSwing = Math.sin(phase + Math.PI);
  prims.push(
    capsule(SHOULDER.x, SHOULDER.y, 24 + armSwing, 19 - armSwing * 0.6, LIMB),
  );

  // front arm + briefcase (held forward-left, fairly steady)
  const handX = 10;
  const handY = 19.5;
  prims.push(capsule(SHOULDER.x, SHOULDER.y + 0.5, handX + 1, handY - 0.5, LIMB));
  // briefcase body + handle
  prims.push(capsule(handX - 2.4, handY, handX + 2.4, handY, 2.4)); // case
  prims.push(capsule(handX - 1.6, handY - 2.4, handX + 1.6, handY - 2.4, 0.8)); // handle top
  prims.push(capsule(handX - 1.6, handY - 2.4, handX - 1.6, handY - 0.6, 0.7));
  prims.push(capsule(handX + 1.6, handY - 2.4, handX + 1.6, handY - 0.6, 0.7));

  // legs
  prims.push(...leg(phase)); // front
  prims.push(...leg(phase + Math.PI)); // back

  // motion lines in front (left), flicker with phase
  const m = (Math.sin(phase) + 1) / 2; // 0..1
  prims.push(capsule(2 + m, 14, 6 + m, 14, 0.9));
  prims.push(capsule(1 + m * 2, 19, 6 + m * 2, 19, 1.0));
  prims.push(capsule(3 + m, 24, 7 + m, 24, 0.9));

  return prims.map(lift);
}

function shift(prim, dx, dy) {
  if (prim.kind === "circle") return circle(prim.cx + dx, prim.cy + dy, prim.r);
  return capsule(prim.ax + dx, prim.ay + dy, prim.bx + dx, prim.by + dy, prim.r);
}

// --- rasterize one frame (supersampled, downscaled, antialiased) ---

function renderFrame(t) {
  const prims = framePrims(t);
  const cover = new Float32Array(SIZE * SIZE);

  for (let sy = 0; sy < DIM; sy++) {
    const py = (sy + 0.5) / SS;
    for (let sx = 0; sx < DIM; sx++) {
      const px = (sx + 0.5) / SS;
      let on = false;
      for (let i = 0; i < prims.length; i++) {
        if (inside(prims[i], px, py)) {
          on = true;
          break;
        }
      }
      if (on) {
        const ox = Math.floor(sx / SS);
        const oy = Math.floor(sy / SS);
        cover[oy * SIZE + ox] += 1;
      }
    }
  }

  const rgba = Buffer.alloc(SIZE * SIZE * 4);
  const maxPer = SS * SS;
  for (let i = 0; i < SIZE * SIZE; i++) {
    const a = Math.round((cover[i] / maxPer) * 255);
    rgba[i * 4] = 255;
    rgba[i * 4 + 1] = 255;
    rgba[i * 4 + 2] = 255;
    rgba[i * 4 + 3] = a;
  }
  return encodePng(SIZE, SIZE, rgba);
}

const outDir = new URL("../src-tauri/icons/runner/", import.meta.url);
mkdirSync(outDir, { recursive: true });
for (let f = 0; f < FRAMES; f++) {
  const png = renderFrame(f / FRAMES);
  writeFileSync(new URL(`frame${f}.png`, outDir), png);
}
console.log(`Wrote ${FRAMES} runner frames to ${outDir.pathname}`);
