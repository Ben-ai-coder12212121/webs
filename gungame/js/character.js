import * as THREE from 'three';
import { buildWeaponModel } from './weapons.js';

export const SKINS = {
  blue:   { name: 'Blue Team', top: 0x2a59c9, pants: 0x3b3f46, shoes: 0x2a59c9, hair: 0x5a3418, cap: null, pattern: null },
  red:    { name: 'Red Team', top: 0xc9282e, pants: 0x3b3f46, shoes: 0xc9282e, hair: 0x1d1612, cap: null, pattern: null, ponytail: true },
  urban:  { name: 'Urban', top: 0x26282c, pants: 0x1c1d20, shoes: 0x3a3c40, hair: 0x1d1612, cap: null, pattern: null },
  desert: { name: 'Desert', top: 0xc9a874, pants: 0xb59766, shoes: 0x7a5a3a, hair: 0x5a3418, cap: 0xb09060, pattern: null },
  camo:   { name: 'Camo', top: 0x5a6c3c, pants: 0x55603b, shoes: 0x3a3f2a, hair: 0x3a2a1a, cap: 0x4f5f33, pattern: 'camo' },
  pink:   { name: 'Camo (Pink)', top: 0xc9282e, pants: 0xe27aa9, shoes: 0xc9282e, hair: 0x1d1612, cap: null, pattern: 'camoPants', ponytail: true },
};
export const BLUE_SKINS = ['blue', 'urban', 'desert', 'camo'];
export const RED_SKINS = ['red', 'urban', 'desert', 'pink'];

const SKIN_TONE = 0xf1c29a, GLOVE = 0x1b1b1d, PACK = 0x26272b;
const box = new THREE.BoxGeometry(1, 1, 1);

function part(parent, mat, x, y, z, sx, sy, sz) {
  const m = new THREE.Mesh(box, mat);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  m.castShadow = true;
  parent.add(m);
  return m;
}

export function buildCharacter(skinId, camoTex) {
  const sk = SKINS[skinId] || SKINS.blue;
  const L = (c, pat) => new THREE.MeshLambertMaterial({ color: c, map: pat && camoTex ? camoTex : null });
  const mTop = L(sk.top, sk.pattern === 'camo'), mPants = L(sk.pants, !!sk.pattern), mShoe = L(sk.shoes);
  const mSole = L(0xf2f2f2), mSkin = L(SKIN_TONE), mGlove = L(GLOVE), mHair = L(sk.hair), mPack = L(PACK), mEye = L(0x1a1a1a);

  const root = new THREE.Group();
  const body = new THREE.Group(); // tilts when dying
  root.add(body);

  const legs = [];
  for (const sx of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(sx * 0.11, 0.9, 0);
    part(hip, mPants, 0, -0.38, 0, 0.17, 0.76, 0.19);
    part(hip, mPants, sx * 0.095, -0.45, 0, 0.04, 0.16, 0.12); // cargo pocket
    part(hip, mShoe, 0, -0.84, -0.04, 0.17, 0.1, 0.28);
    part(hip, mSole, 0, -0.885, -0.04, 0.175, 0.03, 0.285);
    body.add(hip);
    legs.push(hip);
  }

  const upper = new THREE.Group();
  upper.position.y = 0.9;
  body.add(upper);
  part(upper, mTop, 0, 0.3, 0, 0.5, 0.6, 0.28);
  part(upper, mTop, 0, 0.0, 0, 0.46, 0.1, 0.26);
  part(upper, mTop, 0, 0.56, 0.12, 0.34, 0.12, 0.12); // hood
  part(upper, mPack, 0, 0.32, 0.2, 0.36, 0.42, 0.14);
  part(upper, L(0x111111), 0, 0.15, -0.145, 0.22, 0.12, 0.02); // pocket
  for (const sx of [-1, 1]) part(upper, L(0xeeeeee), sx * 0.06, 0.45, -0.145, 0.015, 0.16, 0.01); // drawstrings

  const head = new THREE.Group();
  head.position.y = 0.6;
  upper.add(head);
  part(head, mSkin, 0, 0.17, 0, 0.3, 0.32, 0.3);
  part(head, mHair, 0, 0.35, 0.02, 0.32, 0.08, 0.32);
  part(head, mHair, 0, 0.22, 0.15, 0.32, 0.26, 0.04);
  part(head, mHair, 0, 0.31, -0.15, 0.32, 0.06, 0.04);
  for (const sx of [-1, 1]) {
    part(head, mEye, sx * 0.07, 0.19, -0.152, 0.05, 0.06, 0.01);
    part(head, mHair, sx * 0.07, 0.245, -0.152, 0.07, 0.015, 0.01);
  }
  part(head, L(0xc98a6a), 0, 0.09, -0.152, 0.08, 0.015, 0.01);
  if (sk.ponytail) part(head, mHair, 0, 0.2, 0.2, 0.1, 0.24, 0.08);
  if (sk.cap) {
    const mc = L(sk.cap, sk.pattern === 'camo');
    part(head, mc, 0, 0.37, 0.0, 0.33, 0.09, 0.33);
    part(head, mc, 0, 0.34, -0.22, 0.3, 0.025, 0.14);
  }

  const arms = [];
  for (const sx of [-1, 1]) {
    const sh = new THREE.Group();
    sh.position.set(sx * 0.31, 0.52, 0);
    part(sh, mTop, 0, -0.16, 0, 0.13, 0.34, 0.14);
    part(sh, mTop, 0, -0.4, 0, 0.12, 0.18, 0.13);
    part(sh, mGlove, 0, -0.54, 0, 0.12, 0.1, 0.12);
    upper.add(sh);
    arms.push(sh);
  }

  const gunMount = new THREE.Group();
  gunMount.position.set(0.12, 0.38, -0.42);
  upper.add(gunMount);

  root.userData = { body, upper, legs, arms, head, gunMount, gun: null, walk: 0, deathT: -1 };
  return root;
}

export function setCharacterWeapon(ch, weapon) {
  const u = ch.userData;
  if (u.gun) u.gunMount.remove(u.gun);
  u.gun = buildWeaponModel(weapon, { shadows: true });
  u.gunMount.add(u.gun);
  u.weapon = weapon;
}

// Pose the character. speed in m/s, crouch 0..1, pitch in radians.
export function animateCharacter(ch, dt, { speed, crouch, pitch, dead, firing }) {
  const u = ch.userData;
  if (dead) {
    if (u.deathT < 0) u.deathT = 0;
    u.deathT += dt;
    const t = Math.min(1, u.deathT / 0.45);
    u.body.rotation.x = (Math.PI / 2) * t * t;
    u.body.position.y = 0.12 * t;
    return;
  }
  u.deathT = -1;
  u.body.rotation.x = 0;
  u.body.position.y = 0;
  u.walk += dt * speed * 1.7;
  const swing = Math.min(1, speed / 5) * 0.75;
  const crouchDrop = crouch * 0.55; // matches the hitbox height change
  u.legs[0].rotation.x = Math.sin(u.walk) * swing - crouch * 0.9;
  u.legs[1].rotation.x = -Math.sin(u.walk) * swing - crouch * 0.9;
  for (const l of u.legs) l.position.y = 0.9 - crouchDrop * 0.6;
  u.upper.position.y = 0.9 - crouchDrop;
  u.upper.rotation.x = pitch * 0.45;
  u.head.rotation.x = pitch * 0.4;
  // arms hold the weapon forward
  const recoil = firing ? 0.06 : 0;
  const knife = u.weapon && u.weapon.melee;
  u.arms[1].rotation.set(knife ? 1.0 : 1.35 + recoil, 0, knife ? 0 : -0.3);
  u.arms[0].rotation.set(knife ? 0.2 + Math.sin(u.walk) * swing * 0.5 : 1.3 + recoil, 0, knife ? 0 : 0.62);
  u.gunMount.position.set(knife ? 0.31 : 0.12, knife ? 0.15 : 0.38, knife ? -0.35 : -0.42);
  u.gunMount.rotation.x = knife ? -0.3 : 0;
}

// Small 2D front-view portrait used in menus & the scoreboard.
export function drawPortrait(canvas, skinId) {
  const sk = SKINS[skinId] || SKINS.blue;
  const g = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const hex = (c) => '#' + c.toString(16).padStart(6, '0');
  g.clearRect(0, 0, W, H);
  const u = W / 20;
  const R = (x, y, w, h, c) => { g.fillStyle = typeof c === 'number' ? hex(c) : c; g.fillRect(x * u, y * u, w * u, h * u); };
  const tall = H / u;
  const oy = (tall - 30) / 2;
  R(7, oy + 1, 6, 1.6, sk.cap || sk.hair);
  R(7, oy + 2.4, 6, 5.6, SKIN_TONE);
  R(7, oy + 2.4, 6, 1.2, sk.cap || sk.hair);
  R(8.2, oy + 4.6, 1, 1.2, 0x1a1a1a); R(10.8, oy + 4.6, 1, 1.2, 0x1a1a1a);
  R(9.2, oy + 6.6, 1.6, 0.3, 0xc98a6a);
  if (sk.ponytail) R(12.6, oy + 3, 1.2, 4, sk.hair);
  R(5, oy + 8.4, 10, 9, sk.top);
  R(9.6, oy + 8.6, 0.25, 3, '#eee'); R(10.2, oy + 8.6, 0.25, 3, '#eee');
  R(3, oy + 8.6, 2, 7.5, sk.top); R(15, oy + 8.6, 2, 7.5, sk.top);
  R(3, oy + 16, 2, 1.6, GLOVE); R(15, oy + 16, 2, 1.6, GLOVE);
  R(5.5, oy + 17.4, 4.2, 9.5, sk.pants); R(10.3, oy + 17.4, 4.2, 9.5, sk.pants);
  R(5.3, oy + 26.6, 4.6, 1.8, sk.shoes); R(10.1, oy + 26.6, 4.6, 1.8, sk.shoes);
  R(5.3, oy + 28.2, 4.6, 0.5, '#f2f2f2'); R(10.1, oy + 28.2, 4.6, 0.5, '#f2f2f2');
  if (sk.pattern) {
    g.globalAlpha = 0.35;
    const spots = [[6, 19], [12, 21], [7, 24], [11.5, 18.5], [6.5, 11], [12, 13]];
    for (const [x, y] of spots) R(x, oy + y, 1.6, 1.2, '#222');
    g.globalAlpha = 1;
  }
}
