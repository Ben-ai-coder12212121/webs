import * as THREE from 'three';

// Model parts: [cx, cy, cz, sx, sy, sz, colour, rx?]. -Z is the muzzle direction,
// origin sits at the trigger/grip. The same data draws the 3D models and HUD icons.
const BLK = 0x232428, DRK = 0x34363b, GRY = 0x5b5e64, OLV = 0x5d6b3a, WOOD = 0x7b4a25, STEEL = 0xb9bec6, OLV2 = 0x46522c;

export const WEAPONS = [
  {
    id: 'pistol', name: 'Pistol', dmg: 34, head: 1.6, rpm: 400, auto: false, mag: 12, reserve: 60, reload: 1.3,
    spread: 0.025, adsSpread: 0.004, bloom: 0.012, range: 18, minMul: 0.65, recoil: 0.018, adsZoom: 1.2, adsTime: 0.14, moveMul: 1.0,
    sound: { f: 2400, d: 0.16, g: 0.55, low: 140 }, pref: 14,
    sightY: 0.072, muzzle: -0.17, rHand: [0, -0.05, 0.01], lHand: [0, -0.07, 0.0], hip: [0.17, -0.19, -0.42],
    model: [
      [0, 0.045, -0.06, 0.03, 0.032, 0.2, DRK], [0, 0.018, -0.07, 0.028, 0.024, 0.17, BLK],
      [0, -0.045, 0.008, 0.028, 0.1, 0.045, BLK, -0.25], [0, -0.004, -0.035, 0.01, 0.022, 0.045, BLK],
      [0, 0.066, -0.15, 0.006, 0.01, 0.01, BLK], [0, 0.066, 0.03, 0.02, 0.01, 0.01, BLK],
    ],
  },
  {
    id: 'smg', name: 'SMG', dmg: 22, head: 1.4, rpm: 860, auto: true, mag: 32, reserve: 160, reload: 1.8,
    spread: 0.045, adsSpread: 0.012, bloom: 0.006, range: 12, minMul: 0.6, recoil: 0.011, adsZoom: 1.25, adsTime: 0.16, moveMul: 1.05,
    sound: { f: 2800, d: 0.11, g: 0.45, low: 160 }, pref: 10,
    sightY: 0.082, muzzle: -0.33, rHand: [0, -0.05, 0.04], lHand: [0, -0.02, -0.2], hip: [0.17, -0.19, -0.4],
    model: [
      [0, 0.03, -0.08, 0.045, 0.06, 0.3, DRK], [0, 0.035, -0.27, 0.02, 0.02, 0.1, BLK],
      [0, -0.075, -0.1, 0.026, 0.16, 0.036, BLK, 0.1], [0, -0.04, 0.035, 0.03, 0.09, 0.04, BLK, -0.2],
      [0, 0.02, 0.15, 0.02, 0.03, 0.18, BLK], [0, 0.005, 0.24, 0.03, 0.08, 0.02, BLK],
      [0, 0.07, -0.06, 0.02, 0.016, 0.14, BLK], [0, 0.03, -0.18, 0.05, 0.05, 0.08, GRY],
    ],
  },
  {
    id: 'ar', name: 'Assault Rifle', dmg: 28, head: 1.4, rpm: 640, auto: true, mag: 30, reserve: 150, reload: 2.0,
    spread: 0.04, adsSpread: 0.006, bloom: 0.005, range: 30, minMul: 0.75, recoil: 0.013, adsZoom: 1.4, adsTime: 0.2, moveMul: 0.95,
    sound: { f: 2000, d: 0.16, g: 0.55, low: 120 }, pref: 22,
    sightY: 0.108, muzzle: -0.6, rHand: [0, -0.05, 0.05], lHand: [0, -0.015, -0.33], hip: [0.16, -0.2, -0.42],
    model: [
      [0, 0.03, -0.1, 0.045, 0.065, 0.36, DRK], [0, 0.03, -0.36, 0.05, 0.055, 0.2, BLK],
      [0, 0.035, -0.52, 0.02, 0.02, 0.14, BLK], [0, -0.085, -0.12, 0.028, 0.15, 0.05, BLK, 0.22],
      [0, -0.045, 0.05, 0.032, 0.09, 0.04, BLK, -0.25], [0, 0.01, 0.23, 0.04, 0.07, 0.2, BLK],
      [0, 0.085, -0.1, 0.03, 0.04, 0.12, BLK], [0, 0.075, -0.43, 0.008, 0.04, 0.01, BLK],
      [0, 0.085, -0.17, 0.04, 0.012, 0.02, 0xff3b3b],
    ],
  },
  {
    id: 'shotgun', name: 'Shotgun', dmg: 17, pellets: 9, head: 1.2, rpm: 75, auto: false, mag: 6, reserve: 30, reload: 2.4,
    spread: 0.075, adsSpread: 0.058, bloom: 0, range: 7, minMul: 0.25, falloffEnd: 22, recoil: 0.05, adsZoom: 1.1, adsTime: 0.18, moveMul: 1.0,
    sound: { f: 1300, d: 0.32, g: 0.85, low: 80 }, pref: 5,
    sightY: 0.075, muzzle: -0.72, rHand: [0, -0.05, 0.05], lHand: [0, -0.015, -0.32], hip: [0.17, -0.2, -0.4],
    model: [
      [0, 0.03, -0.05, 0.045, 0.06, 0.22, DRK], [0, 0.052, -0.42, 0.03, 0.03, 0.6, BLK],
      [0, 0.014, -0.36, 0.028, 0.028, 0.46, BLK], [0, 0.012, -0.32, 0.048, 0.048, 0.16, WOOD],
      [0, -0.005, 0.18, 0.04, 0.08, 0.28, WOOD, 0.12], [0, -0.04, 0.05, 0.032, 0.08, 0.04, WOOD, -0.2],
      [0, 0.072, -0.7, 0.006, 0.012, 0.01, STEEL],
    ],
  },
  {
    id: 'sniper', name: 'Sniper', dmg: 120, head: 2.0, rpm: 48, auto: false, mag: 5, reserve: 25, reload: 2.8,
    spread: 0.11, adsSpread: 0.0, bloom: 0, range: 80, minMul: 0.95, recoil: 0.07, adsZoom: 4.0, adsTime: 0.3, moveMul: 0.9, scope: true,
    sound: { f: 1500, d: 0.5, g: 0.9, low: 70 }, pref: 35,
    sightY: 0.1, muzzle: -0.82, rHand: [0, -0.05, 0.06], lHand: [0, -0.015, -0.26], hip: [0.16, -0.2, -0.42],
    model: [
      [0, 0.03, -0.05, 0.045, 0.06, 0.3, OLV], [0, 0.035, -0.5, 0.022, 0.022, 0.62, BLK],
      [0, 0.1, -0.05, 0.04, 0.04, 0.32, BLK], [0, 0.1, -0.23, 0.056, 0.056, 0.06, BLK], [0, 0.1, 0.12, 0.05, 0.05, 0.05, BLK],
      [0, 0.07, -0.12, 0.02, 0.03, 0.02, BLK], [0, 0.07, 0.03, 0.02, 0.03, 0.02, BLK],
      [0, 0.0, 0.23, 0.045, 0.09, 0.28, OLV], [0, -0.04, 0.06, 0.032, 0.08, 0.04, OLV, -0.2],
      [0, -0.035, -0.07, 0.03, 0.06, 0.07, BLK], [0, 0.0, -0.38, 0.03, 0.02, 0.18, OLV2],
    ],
  },
  {
    id: 'lmg', name: 'LMG', dmg: 30, head: 1.3, rpm: 680, auto: true, mag: 80, reserve: 160, reload: 3.2,
    spread: 0.055, adsSpread: 0.01, bloom: 0.004, range: 28, minMul: 0.75, recoil: 0.014, adsZoom: 1.35, adsTime: 0.3, moveMul: 0.85,
    sound: { f: 1700, d: 0.18, g: 0.6, low: 100 }, pref: 22,
    sightY: 0.13, muzzle: -0.72, rHand: [0, -0.05, 0.06], lHand: [0, -0.02, -0.4], hip: [0.16, -0.21, -0.42],
    model: [
      [0, 0.035, -0.08, 0.06, 0.09, 0.36, DRK], [0, 0.04, -0.4, 0.05, 0.05, 0.3, BLK],
      [0, 0.04, -0.62, 0.022, 0.022, 0.16, BLK], [0.0, -0.065, -0.08, 0.07, 0.1, 0.12, OLV],
      [0, 0.09, -0.06, 0.05, 0.02, 0.22, BLK], [0, 0.01, 0.22, 0.045, 0.08, 0.22, BLK],
      [0, -0.045, 0.07, 0.032, 0.09, 0.04, BLK, -0.25], [0, 0.11, -0.25, 0.012, 0.03, 0.1, BLK],
      [0, 0.12, -0.02, 0.012, 0.02, 0.02, BLK], [0, 0.07, -0.52, 0.008, 0.06, 0.01, BLK],
    ],
  },
  {
    id: 'marksman', name: 'Marksman Rifle', dmg: 55, head: 1.6, rpm: 260, auto: false, mag: 10, reserve: 50, reload: 2.2,
    spread: 0.05, adsSpread: 0.0015, bloom: 0.01, range: 50, minMul: 0.85, recoil: 0.03, adsZoom: 2.2, adsTime: 0.24, moveMul: 0.95,
    sound: { f: 1800, d: 0.28, g: 0.75, low: 90 }, pref: 28,
    sightY: 0.1, muzzle: -0.78, rHand: [0, -0.05, 0.05], lHand: [0, -0.01, -0.3], hip: [0.16, -0.2, -0.42],
    model: [
      [0, -0.002, 0.2, 0.04, 0.08, 0.3, WOOD, 0.08], [0, 0.02, -0.22, 0.045, 0.05, 0.5, WOOD],
      [0, 0.05, -0.03, 0.04, 0.045, 0.22, BLK], [0, 0.047, -0.6, 0.02, 0.02, 0.32, BLK],
      [0, 0.1, -0.05, 0.034, 0.034, 0.22, BLK], [0, 0.1, -0.17, 0.046, 0.046, 0.04, BLK],
      [0, -0.035, -0.04, 0.028, 0.06, 0.06, BLK], [0, -0.035, 0.07, 0.03, 0.07, 0.04, WOOD, -0.25],
    ],
  },
  {
    id: 'rpg', name: 'Rocket Launcher', dmg: 200, splash: 150, radius: 4.5, rpm: 50, auto: false, mag: 1, reserve: 4, reload: 2.4,
    spread: 0.02, adsSpread: 0.002, bloom: 0, range: 100, minMul: 1, recoil: 0.06, adsZoom: 1.3, adsTime: 0.3, moveMul: 0.85, projectile: 34,
    sound: { f: 600, d: 0.6, g: 0.8, low: 60 }, pref: 18,
    sightY: 0.15, muzzle: -0.62, rHand: [0, -0.06, 0.0], lHand: [0, -0.07, -0.25], hip: [0.2, -0.13, -0.32],
    model: [
      [0, 0.05, -0.12, 0.11, 0.11, 0.85, OLV], [0, 0.05, -0.6, 0.085, 0.085, 0.08, OLV2],
      [0, 0.05, -0.68, 0.06, 0.06, 0.1, 0x3d4a2a], [0, 0.05, 0.33, 0.13, 0.13, 0.06, BLK],
      [0, -0.05, 0.0, 0.03, 0.1, 0.04, BLK, -0.15], [0, -0.05, -0.25, 0.03, 0.1, 0.04, BLK],
      [-0.075, 0.12, -0.1, 0.03, 0.06, 0.07, BLK],
    ],
  },
  {
    id: 'knife', name: 'Knife', dmg: 150, melee: true, reach: 2.4, rpm: 100, auto: true, mag: 0, reserve: 0, reload: 0,
    spread: 0, adsSpread: 0, bloom: 0, range: 0, minMul: 1, recoil: 0, adsZoom: 1, adsTime: 0.1, moveMul: 1.12,
    sound: { f: 4000, d: 0.08, g: 0.2, low: 0 }, pref: 0,
    sightY: 0, muzzle: -0.2, rHand: [0, -0.005, 0.03], lHand: null, hip: [0.2, -0.24, -0.38],
    model: [
      [0, 0, 0.03, 0.03, 0.036, 0.11, BLK], [0, 0.004, -0.035, 0.036, 0.052, 0.014, GRY],
      [0, 0.012, -0.14, 0.008, 0.04, 0.19, STEEL], [0, 0.022, -0.25, 0.007, 0.02, 0.04, STEEL],
    ],
  },
];

export const WEAPON_INDEX = Object.fromEntries(WEAPONS.map((w, i) => [w.id, i]));

const matCache = new Map();
function mat(color, lit = true) {
  const key = color + (lit ? 'l' : 'b');
  if (!matCache.has(key)) matCache.set(key, lit ? new THREE.MeshLambertMaterial({ color }) : new THREE.MeshBasicMaterial({ color }));
  return matCache.get(key);
}
const unitBox = new THREE.BoxGeometry(1, 1, 1);

export function buildWeaponModel(w, { shadows = false } = {}) {
  const g = new THREE.Group();
  for (const [x, y, z, sx, sy, sz, c, rx] of w.model) {
    const m = new THREE.Mesh(unitBox, mat(c));
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    if (rx) m.rotation.x = rx;
    m.castShadow = shadows;
    g.add(m);
  }
  return g;
}

function shade(c, k) {
  const r = Math.min(255, ((c >> 16) & 255) * k + 70), gg = Math.min(255, ((c >> 8) & 255) * k + 70), b = Math.min(255, (c & 255) * k + 70);
  return `rgb(${r | 0},${gg | 0},${b | 0})`;
}

// Side-view SVG silhouette (muzzle pointing right).
export function weaponIconSVG(w, { color = null } = {}) {
  let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
  const rects = [];
  for (const [, y, z, , sy, sz, c, rx = 0] of w.model) {
    const u = -z, v = -y;
    const r = Math.hypot(sz, sy) / 2;
    minU = Math.min(minU, u - r); maxU = Math.max(maxU, u + r);
    minV = Math.min(minV, v - r); maxV = Math.max(maxV, v + r);
    rects.push({ u, v, w: sz, h: sy, c, rot: (-rx * 180) / Math.PI });
  }
  const pad = 0.01;
  const vb = `${(minU - pad).toFixed(3)} ${(minV - pad).toFixed(3)} ${(maxU - minU + pad * 2).toFixed(3)} ${(maxV - minV + pad * 2).toFixed(3)}`;
  const body = rects.map((r) => `<rect x="${(r.u - r.w / 2).toFixed(4)}" y="${(r.v - r.h / 2).toFixed(4)}" width="${r.w.toFixed(4)}" height="${r.h.toFixed(4)}" fill="${color || shade(r.c, 1.1)}"${r.rot ? ` transform="rotate(${r.rot.toFixed(2)} ${r.u.toFixed(4)} ${r.v.toFixed(4)})"` : ''}/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid meet">${body}</svg>`;
}
