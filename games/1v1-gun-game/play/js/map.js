import * as THREE from 'three';
import { addCollider, resetWorld, world, rayBox } from './physics.js';
import { makeTextures, signTexture, bunkerTexture, busTextTexture } from './textures.js';

// Material palette. uv = metres per texture repeat (UVs are generated in world space).
const MAT_DEFS = {
  grass:        { c: 0xffffff, t: 'grass', uv: 5 },
  asphalt:      { c: 0xffffff, t: 'asphalt', uv: 6 },
  sidewalk:     { c: 0xffffff, t: 'tiles', uv: 1.6, mm: '#c9c5bd' },
  concrete:     { c: 0xc7c3bb, t: 'noise', uv: 3, mm: '#9c988f' },
  sidingBlue:   { c: 0x86c0de, t: 'siding', uv: 2.4, mm: '#26313f' },
  sidingYellow: { c: 0xf0cf6c, t: 'siding', uv: 2.4, mm: '#26313f' },
  trim:         { c: 0xf6f3ea, t: 'noise', uv: 2, mm: '#26313f' },
  accentOrange: { c: 0xe57b3a, t: 'noise', uv: 2, mm: '#26313f' },
  accentTeal:   { c: 0x2f9f98, t: 'noise', uv: 2, mm: '#26313f' },
  interior:     { c: 0xf2e8d4, t: 'noise', uv: 2, mm: '#26313f' },
  roof:         { c: 0x5f636b, t: 'roof', uv: 2 },
  woodFloor:    { c: 0xbe8a56, t: 'planks', uv: 2 },
  brick:        { c: 0xb35d40, t: 'brick', uv: 1.4, mm: '#6b3a2a' },
  picket:       { c: 0xffffff, t: 'picket', uv: 1, alpha: true, mm: '#eeeeee' },
  hedge:        { c: 0x3f8a33, t: 'leaves', uv: 1.2, mm: '#2f6b28' },
  wood:         { c: 0x9d6c40, t: 'planks', uv: 1.5, mm: '#6b4a2b' },
  shedRed:      { c: 0xb5473a, t: 'siding', uv: 2, mm: '#7a2f26' },
  busYellow:    { c: 0xf2b822, mm: '#d9a21a' },
  black:        { c: 0x232427, mm: '#222222' },
  glass:        { c: 0x2b3e52 },
  metal:        { c: 0x8d9298, t: 'noise', uv: 2, mm: '#707478' },
  carRed:       { c: 0xc8232c, mm: '#a01c22' },
  truckBlue:    { c: 0x2e6fb6, mm: '#255a94' },
  white:        { c: 0xf2f2f2, mm: '#dddddd' },
  chrome:       { c: 0xd5d9de },
  couch:        { c: 0xd8743a, t: 'noise', uv: 1, mm: '#8a4a24' },
  counter:      { c: 0xf0eee9, mm: '#bbbbbb' },
  mint:         { c: 0xbfe6de, mm: '#99cccc' },
  trunk:        { c: 0x6b4a2b, mm: '#4b3420' },
  foliage:      { c: 0x4f9a3a, t: 'leaves', uv: 2 },
  foliageDark:  { c: 0x3b7d33, t: 'leaves', uv: 2 },
  hill:         { c: 0x6aa84a, t: 'grass', uv: 12 },
  rock:         { c: 0x8a8f86, t: 'noise', uv: 4 },
  towerWhite:   { c: 0xeef0f2, t: 'noise', uv: 3 },
  towerRed:     { c: 0xd8343a, t: 'noise', uv: 3 },
  dark:         { c: 0x0c0d10 },
  yellowLine:   { c: 0xf3c623 },
  whiteLine:    { c: 0xf2f2f2 },
};

export const BOUNDS = { x0: -30, x1: 30, z0: -28, z1: 28 };

export function buildMap(scene, opts = {}) {
  resetWorld();
  const T = makeTextures();
  const buckets = {};
  const decor = new THREE.Group();
  scene.add(decor);

  const bucket = (m) => buckets[m] || (buckets[m] = { p: [], n: [], u: [] });

  function pushBoxGeo(x0, y0, z0, x1, y1, z1, mat) {
    const b = bucket(mat), s = MAT_DEFS[mat].uv || 2;
    const F = [
      [[1, 0, 0], [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], (p) => [-p[2], p[1]]],
      [[-1, 0, 0], [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], (p) => [p[2], p[1]]],
      [[0, 1, 0], [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], (p) => [p[0], -p[2]]],
      [[0, -1, 0], [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], (p) => [p[0], p[2]]],
      [[0, 0, 1], [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], (p) => [p[0], p[1]]],
      [[0, 0, -1], [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], (p) => [-p[0], p[1]]],
    ];
    for (const [n, c, uvf] of F) {
      for (const idx of [0, 1, 2, 0, 2, 3]) {
        const p = c[idx];
        b.p.push(p[0], p[1], p[2]);
        b.n.push(n[0], n[1], n[2]);
        const uv = uvf(p);
        b.u.push(uv[0] / s, uv[1] / s);
      }
    }
  }

  function pushGeo(mat, geo, matrix) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.applyMatrix4(matrix);
    const b = bucket(mat), s = MAT_DEFS[mat].uv || 2;
    const p = g.attributes.position.array, n = g.attributes.normal.array;
    for (let i = 0; i < p.length; i += 3) {
      b.p.push(p[i], p[i + 1], p[i + 2]);
      b.n.push(n[i], n[i + 1], n[i + 2]);
      b.u.push((p[i] + p[i + 2]) / s, p[i + 1] / s);
    }
    g.dispose();
  }

  function addBox(x0, y0, z0, x1, y1, z1, mat, o = {}) {
    const a = [Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1)];
    const b = [Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)];
    if (o.render !== false) pushBoxGeo(a[0], a[1], a[2], b[0], b[1], b[2], mat);
    if (o.collide !== false) {
      return addCollider(a[0], a[1], a[2], b[0], b[1], b[2], {
        noRay: o.noRay, mm: o.mm !== undefined ? o.mm : (MAT_DEFS[mat] && MAT_DEFS[mat].mm), tag: o.tag,
      });
    }
    return null;
  }

  // Solid pieces of a wall with rectangular openings (handles overlapping openings).
  function wallSegments(a0, a1, y0, y1, openings) {
    const xs = new Set([a0, a1]);
    for (const o of openings) { xs.add(Math.max(a0, Math.min(a1, o.a))); xs.add(Math.max(a0, Math.min(a1, o.b))); }
    const arr = [...xs].sort((p, q) => p - q);
    const out = [];
    for (let i = 0; i < arr.length - 1; i++) {
      const a = arr[i], b = arr[i + 1];
      if (b - a < 1e-4) continue;
      const mid = (a + b) / 2;
      const gaps = openings.filter((o) => o.a < mid && o.b > mid).map((o) => [o.lo, o.hi]).sort((p, q) => p[0] - q[0]);
      let y = y0;
      for (const [lo, hi] of gaps) { if (lo > y) out.push([a, b, y, lo]); y = Math.max(y, hi); }
      if (y < y1) out.push([a, b, y, y1]);
    }
    return out;
  }

  // Builder in "south frame"; s = -1 mirrors through the map centre (180deg rotation).
  function builder(s) {
    const B = {
      s,
      box: (x0, y0, z0, x1, y1, z1, mat, o) => addBox(s * x0, y0, s * z0, s * x1, y1, s * z1, mat, o),
      wallX(z, xa, xb, y0, y1, t, mat, openings = []) {
        for (const [a, b, lo, hi] of wallSegments(xa, xb, y0, y1, openings)) B.box(a, lo, z - t / 2, b, hi, z + t / 2, mat);
        for (const o of openings) if (o.lo > 0.3) B.box(o.a - 0.06, o.lo - 0.08, z - t / 2 - 0.08, o.b + 0.06, o.lo, z + t / 2 + 0.08, 'trim', { collide: false });
      },
      wallZ(x, za, zb, y0, y1, t, mat, openings = []) {
        for (const [a, b, lo, hi] of wallSegments(za, zb, y0, y1, openings)) B.box(x - t / 2, lo, a, x + t / 2, hi, b, mat);
        for (const o of openings) if (o.lo > 0.3) B.box(x - t / 2 - 0.08, o.lo - 0.08, o.a - 0.06, x + t / 2 + 0.08, o.lo, o.b + 0.06, 'trim', { collide: false });
      },
      matrix(x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
        const m = new THREE.Matrix4();
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry + (s < 0 ? Math.PI : 0), rz, 'YXZ'));
        m.compose(new THREE.Vector3(s * x, y, s * z), q, new THREE.Vector3(sx, sy, sz));
        return m;
      },
      geo(mat, geometry, x, y, z, rx, ry, rz, sx, sy, sz) { pushGeo(mat, geometry, B.matrix(x, y, z, rx, ry, rz, sx, sy, sz)); },
      mesh(m, x, y, z, ry = 0) {
        m.position.set(s * x, y, s * z);
        m.rotation.y = ry + (s < 0 ? Math.PI : 0);
        decor.add(m);
        return m;
      },
      fence(x0, z0, x1, z1) { // picket fence along x or z, 1m high
        if (Math.abs(x1 - x0) > Math.abs(z1 - z0)) B.box(x0, 0, z0 - 0.05, x1, 1.0, z0 + 0.05, 'picket', { noRay: true });
        else B.box(x0 - 0.05, 0, z0, x0 + 0.05, 1.0, z1, 'picket', { noRay: true });
      },
      tree(x, z, sc = 1, collide = true) {
        B.box(x - 0.2 * sc, 0, z - 0.2 * sc, x + 0.2 * sc, 2.4 * sc, z + 0.2 * sc, 'trunk', { collide });
        const ico = new THREE.IcosahedronGeometry(1, 1);
        B.geo('foliage', ico, x, 3.3 * sc, z, 0, Math.random(), 0, 1.7 * sc, 1.5 * sc, 1.7 * sc);
        B.geo('foliageDark', ico, x + 0.6 * sc, 2.7 * sc, z + 0.4 * sc, 0, Math.random(), 0, 1.1 * sc, 1.0 * sc, 1.1 * sc);
        B.geo('foliage', ico, x - 0.5 * sc, 4.2 * sc, z - 0.3 * sc, 0, Math.random(), 0, 1.0 * sc, 0.9 * sc, 1.0 * sc);
      },
      wheel(x, y, z, r, alongX) {
        const cyl = new THREE.CylinderGeometry(r, r, 0.3, 14);
        if (alongX) B.geo('black', cyl, x, y, z, Math.PI / 2, 0, 0);
        else B.geo('black', cyl, x, y, z, 0, 0, Math.PI / 2);
        const hub = new THREE.CylinderGeometry(r * 0.45, r * 0.45, 0.32, 10);
        if (alongX) B.geo('chrome', hub, x, y, z, Math.PI / 2, 0, 0);
        else B.geo('chrome', hub, x, y, z, 0, 0, Math.PI / 2);
      },
    };
    return B;
  }

  const B0 = builder(1);

  // ---------------- ground & boundary ----------------
  addCollider(-600, -5, -600, 600, 0, 600, { mm: null });
  pushBoxGeo(-400, -0.5, -400, 400, 0, 400, 'grass');
  // road through the middle and out past the barriers
  B0.box(-140, 0, -6, 140, 0.02, 6, 'asphalt', { collide: false });
  for (let x = -138; x < 138; x += 4) B0.box(x, 0.021, -0.09, x + 2.2, 0.03, 0.09, 'yellowLine', { collide: false });
  for (const z of [-5.6, 5.6]) B0.box(-140, 0.021, z - 0.07, 140, 0.03, z + 0.07, 'whiteLine', { collide: false });
  for (const s of [1, -1]) {
    const B = builder(s);
    B.box(-140, 0, 6, 140, 0.15, 7.8, 'sidewalk', { collide: false });
    B.box(BOUNDS.x0 - 0.5, 0, 6, BOUNDS.x1 + 0.5, 0.15, 7.8, 'sidewalk', { render: false });
    B.box(-140, 0, 6, 140, 0.16, 6.15, 'concrete', { collide: false }); // curb
  }
  // invisible play-area walls
  const W = 25;
  addCollider(BOUNDS.x0 - 1, 0, BOUNDS.z0 - 1, BOUNDS.x0, W, BOUNDS.z1 + 1, { noRay: true, mm: null });
  addCollider(BOUNDS.x1, 0, BOUNDS.z0 - 1, BOUNDS.x1 + 1, W, BOUNDS.z1 + 1, { noRay: true, mm: null });
  addCollider(BOUNDS.x0 - 1, 0, BOUNDS.z0 - 1, BOUNDS.x1 + 1, W, BOUNDS.z0, { noRay: true, mm: null });
  addCollider(BOUNDS.x0 - 1, 0, BOUNDS.z1, BOUNDS.x1 + 1, W, BOUNDS.z1 + 1, { noRay: true, mm: null });
  // jersey barriers closing the road at both ends
  for (const s of [1, -1]) {
    const B = builder(s);
    for (let z = -7.6; z < 7.6; z += 2.2) {
      B.box(29.2, 0, z, 29.8, 0.35, z + 2.0, 'concrete');
      B.box(29.35, 0.35, z, 29.65, 1.05, z + 2.0, 'concrete');
      B.box(29.34, 0.7, z + 0.2, 29.66, 0.85, z + 1.8, 'accentOrange', { collide: false });
    }
  }

  // ---------------- one half of the neighbourhood (mirrored for the other) ----------------
  const signTex = signTexture();
  function buildSide(s, wallMat, accentMat, team) {
    const B = builder(s);
    const X0 = -22, X1 = -8, Z0 = 10, Z1 = 20, Tk = 0.25, TOP = 6.2, h = Tk / 2;
    const ix0 = X0 + h, ix1 = X1 - h, iz0 = Z0 + h, iz1 = Z1 - h;

    // --- two-storey house ---
    B.box(X0, 0, Z0, X1, 0.04, Z1, 'woodFloor', { collide: false });
    B.wallX(Z0, X0 - h, X1 + h, 0, TOP, Tk, wallMat, [
      { a: -16.2, b: -14.8, lo: 0, hi: 2.3 },
      { a: -20.5, b: -18.3, lo: 0.9, hi: 2.3 },
      { a: -13.2, b: -9.5, lo: 0.9, hi: 2.4 },
      { a: -21, b: -18, lo: 4.1, hi: 5.7 },
      { a: -13.5, b: -9.2, lo: 4.1, hi: 5.7 },
    ]);
    B.wallX(Z1, X0 - h, X1 + h, 0, TOP, Tk, wallMat, [
      { a: -12.4, b: -11.2, lo: 0, hi: 2.3 },
      { a: -19.5, b: -17.5, lo: 0.9, hi: 2.3 },
      { a: -19.8, b: -17, lo: 4.1, hi: 5.7 },
      { a: -14, b: -10.5, lo: 4.1, hi: 5.7 },
    ]);
    B.wallZ(X0, iz0, iz1, 0, TOP, Tk, wallMat, [
      { a: 11.5, b: 14.5, lo: 0.9, hi: 2.3 },
      { a: 11.5, b: 15, lo: 4.1, hi: 5.7 },
    ]);
    B.wallZ(X1, iz0, iz1, 0, TOP, Tk, wallMat, [
      { a: 16.5, b: 17.7, lo: 0, hi: 2.3 },
      { a: 12, b: 15, lo: 4.1, hi: 5.7 },
    ]);
    // storey trim band
    B.box(X0 - h - 0.05, 3.0, Z0 - h - 0.05, X1 + h + 0.05, 3.25, Z0 - h + 0.01, accentMat, { collide: false });
    B.box(X0 - h - 0.05, 3.0, Z1 + h - 0.01, X1 + h + 0.05, 3.25, Z1 + h + 0.05, accentMat, { collide: false });
    B.box(X0 - h - 0.05, 3.0, Z0 - h, X0 - h + 0.01, 3.25, Z1 + h, accentMat, { collide: false });
    // upper floor with stairwell hole
    B.box(-20.35, 3.0, iz0, ix1, 3.2, iz1, 'woodFloor');
    B.box(ix0, 3.0, iz0, -20.35, 3.2, 15.9, 'woodFloor');
    const run = (iz1 - 15.9) / 12;
    for (let i = 1; i <= 12; i++) B.box(ix0, 0, 15.9 + (i - 1) * run, -20.35, (i * 3.2) / 12, 15.9 + i * run, 'wood');
    B.box(-20.42, 3.2, 15.9, -20.3, 4.2, 18.6, 'trim');
    // ground floor furniture
    B.box(-19.5, 0, 11.0, -16.5, 0.85, 11.9, 'couch');
    B.box(-19.5, 0.85, 11.0, -16.5, 1.25, 11.25, 'couch');
    B.box(-18.8, 0, 12.6, -17.2, 0.45, 13.4, 'wood');
    B.box(-17, 0, 19.2, -12.8, 1.0, iz1, 'counter');
    B.box(-15.5, 0, 15.2, -12.5, 1.0, 16.2, 'counter');
    B.box(-15.6, 1.0, 15.1, -12.4, 1.06, 16.3, accentMat, { collide: false });
    B.box(-9.1, 0, 18.6, ix1, 2.0, iz1, 'mint');
    // upper floor
    B.wallZ(-16, 13.5, iz1, 3.2, TOP, 0.15, 'interior', [{ a: 15.4, b: 16.6, lo: 3.2, hi: 5.5 }]);
    B.box(-21.6, 3.2, 10.5, -19.4, 3.75, 13.0, 'white');
    B.box(-21.6, 3.75, 10.5, -19.4, 3.85, 13.0, team === 'blue' ? 'truckBlue' : 'carRed', { collide: false });
    B.box(-14, 3.2, 19.3, -12.4, 4.3, iz1, 'wood');
    B.box(-11.5, 3.2, 12.2, -10.0, 3.95, 13.2, 'wood'); // desk under the big window
    // roof + chimney
    B.box(X0 - 0.6, TOP, Z0 - 0.6, X1 + 0.6, TOP + 0.28, Z1 + 0.6, 'roof');
    fascia(B, X0 - 0.62, Z0 - 0.62, X1 + 0.62, Z1 + 0.62, TOP - 0.06, TOP + 0.12, accentMat);
    B.box(-12, TOP, 17, -10.8, 7.6, 18.2, 'brick');
    // porch & awning
    B.box(-17, 0, Z0 - 1.4, -14, 0.12, Z0 - h, 'concrete');
    B.box(-16.9, 2.55, Z0 - 1.4, -14.1, 2.7, Z0 - h, accentMat);
    B.box(-12.4, 2.55, Z1 + h, -11.2 + 0.1, 2.7, Z1 + 1.1, accentMat);

    // --- garage ---
    B.box(-8, 0, 10.5, -1, 0.03, 19, 'concrete', { collide: false });
    B.box(-8, 0, 7.8, -1, 0.03, 10.5, 'concrete', { collide: false });
    B.wallX(19, -8, -0.875, 0, 3.2, Tk, wallMat, [{ a: -3.4, b: -2.2, lo: 0, hi: 2.3 }]);
    B.wallZ(-1, 10.5, 19, 0, 3.2, Tk, wallMat, [{ a: 13, b: 15, lo: 1.2, hi: 2.2 }]);
    B.box(-8, 2.7, 10.5 - h, -0.875, 3.2, 10.5 + h, wallMat);
    B.box(-8.3, 3.2, 10.2, -0.6, 3.45, 19.3, 'roof');
    fascia(B, -8.32, 10.18, -0.58, 19.32, 3.15, 3.3, accentMat);
    B.box(-7.8, 2.55, 10.7, -1.2, 2.68, 12.6, 'white', { collide: false });
    B.box(-7.875, 0, 12.5, -7.2, 0.95, 15.8, 'wood');
    B.box(-7.875, 0.95, 12.6, -7.82, 2.2, 15.7, 'metal', { collide: false });
    B.box(-1.6, 0, 16, -1.125, 2.0, 18.8, 'metal');
    for (const y of [0.6, 1.2, 1.8]) B.box(-1.65, y, 16, -1.12, y + 0.05, 18.8, 'wood', { collide: false });
    convertible(B, -4.25, 14.1, team === 'blue' ? 'carRed' : 'accentTeal');

    // --- front yard ---
    B.box(-21.5, 0, 8.2, -17.5, 0.9, 8.8, 'hedge');
    B.box(-13, 0, 8.2, -9, 0.9, 8.8, 'hedge');
    B.box(-14.1, 0, 8.2, -13.95, 1.0, 8.35, 'wood');
    B.box(-14.25, 1.0, 8.05, -13.8, 1.3, 8.5, team === 'blue' ? 'truckBlue' : 'carRed');
    B.box(1.5, 0, 8.6, 3.5, 0.7, 9.6, 'brick');
    B.box(1.6, 0.7, 8.7, 3.4, 0.75, 9.5, 'hedge', { collide: false });
    B.box(3.0, 0, 8.2, 3.6, 1.0, 8.8, 'metal'); // trash can
    B.box(2.95, 1.0, 8.15, 3.65, 1.08, 8.85, 'metal', { collide: false });
    // fire hydrant
    B.box(-23.6, 0, 7.0, -23.25, 0.75, 7.35, 'carRed');

    // --- back yard ---
    B.box(-21, 0, Z1 + h, -14, 0.06, 23, 'concrete', { collide: false });
    B.box(-19, 0.72, 21.5, -17, 0.8, 22.5, 'wood');
    B.box(-18.9, 0, 21.6, -18.8, 0.72, 22.4, 'wood', { collide: false });
    B.box(-17.2, 0, 21.6, -17.1, 0.72, 22.4, 'wood', { collide: false });
    B.box(-19, 0, 21.5, -17, 0.72, 22.5, 'wood', { render: false });
    B.box(-19, 0, 20.9, -17, 0.45, 21.2, 'wood');
    B.box(-19, 0, 22.8, -17, 0.45, 23.1, 'wood');
    B.box(-13.5, 0, 21, -12.8, 1.0, 21.6, 'black');
    B.box(-12, 0, 24, -6, 1.3, 25, 'hedge');
    B.box(-4, 0, 22, -2.5, 1.2, 23.5, 'wood');
    B.box(-3.6, 1.2, 22.4, -2.8, 2.0, 23.1, 'wood');
    // shed
    B.box(-29, 0, 23.5, -25.5, 2.5, 27.6, 'shedRed');
    B.box(-29.3, 2.5, 23.2, -25.2, 2.75, 27.9, 'roof');
    B.box(-25.5, 0, 24.8, -25.42, 2.0, 26.2, 'white', { collide: false });
    B.tree(-8, 26.5, 1.1);
    B.tree(-23, 21.5, 0.9);
    // fences
    if (team === 'blue') { // gap for the bunker door
      B.fence(BOUNDS.x0, 28, 13.8, 28);
      B.fence(17.2, 28, BOUNDS.x1, 28);
    } else B.fence(BOUNDS.x0, 28, BOUNDS.x1, 28);
    B.fence(BOUNDS.x0 + 0.05, 7.8, BOUNDS.x0 + 0.05, 28);
    B.fence(BOUNDS.x1 - 0.05, 7.8, BOUNDS.x1 - 0.05, 28);
    B.fence(-0.5, 19, -0.5, 22.5);
    B.fence(-0.5, 24.5, -0.5, 28);
    B.fence(2, 19.5, 6.5, 19.5);
    B.fence(8, 19.5, 12, 19.5);

    // --- side yard ---
    B.box(4, 0, 12, 10, 1.2, 13, 'hedge');
    B.box(13, 0, 14, 14, 1.2, 19, 'hedge');
    B.box(22, 0, 19, 27, 2.6, 24, 'wood');
    B.box(21.7, 2.6, 18.7, 27.3, 2.8, 24.3, 'roof');
    B.box(23.8, 0, 18.95, 25.2, 1.8, 19.0, 'shedRed', { collide: false });
    B.tree(8, 23, 1.2);
    B.tree(18, 13, 1.0);
    B.tree(27, 10.5, 1.15);
    // swing set
    for (const [x, z] of [[16, 22.5], [16, 25], [20, 22.5], [20, 25]]) B.box(x - 0.08, 0, z - 0.08, x + 0.08, 2.4, z + 0.08, 'metal');
    B.box(15.9, 2.4, 22.4, 20.1, 2.52, 22.6, 'metal', { collide: false });
    B.box(15.9, 2.4, 24.9, 20.1, 2.52, 25.1, 'metal', { collide: false });
    B.box(17.3, 0.45, 23.4, 18.7, 0.52, 24.1, 'accentOrange', { collide: false });
    // welcome sign
    B.box(18.1, 0, 8.6, 18.3, 1.3, 8.8, 'wood');
    B.box(21.7, 0, 8.6, 21.9, 1.3, 8.8, 'wood');
    B.box(17.8, 1.3, 8.62, 22.2, 3.5, 8.78, 'carRed');
    const signMat = new THREE.MeshLambertMaterial({ map: signTex });
    const front = new THREE.Mesh(new THREE.PlaneGeometry(4.3, 2.1), signMat);
    B.mesh(front, 20, 2.4, 8.6 - 0.012, Math.PI);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(4.3, 2.1), signMat);
    B.mesh(back, 20, 2.4, 8.78 + 0.012, 0);
    // starburst topper
    B.box(19.9, 3.5, 8.65, 20.1, 4.1, 8.75, 'metal', { collide: false });
    B.geo('busYellow', new THREE.OctahedronGeometry(0.35, 0), 20, 4.25, 8.7, 0, 0.4, 0);

    // street car
    truck(B, -12.7, 3.2, team === 'blue' ? 'truckBlue' : 'white');
  }

  // Trim strips around a roof edge (a full slab would show through as the ceiling).
  function fascia(B, x0, z0, x1, z1, y0, y1, mat) {
    const t = 0.08, o = { collide: false };
    B.box(x0, y0, z0, x1, y1, z0 + t, mat, o);
    B.box(x0, y0, z1 - t, x1, y1, z1, mat, o);
    B.box(x0, y0, z0, x0 + t, y1, z1, mat, o);
    B.box(x1 - t, y0, z0, x1, y1, z1, mat, o);
  }

  function convertible(B, cx, cz, color) { // runs along z, nose toward -z
    B.box(cx - 0.95, 0.15, cz - 2.1, cx + 0.95, 1.0, cz + 2.1, color, { render: false });
    B.box(cx - 0.95, 0.35, cz - 2.1, cx + 0.95, 0.85, cz + 2.1, color, { collide: false });
    B.box(cx - 0.9, 0.85, cz - 2.1, cx + 0.9, 0.95, cz - 0.6, color, { collide: false });
    B.box(cx - 0.9, 0.85, cz + 0.9, cx + 0.9, 0.98, cz + 2.1, color, { collide: false });
    B.box(cx - 0.75, 0.85, cz - 0.3, cx + 0.75, 1.25, cz + 0.6, 'white', { collide: false }); // seats
    B.box(cx - 0.85, 0.95, cz - 0.62, cx + 0.85, 1.4, cz - 0.55, 'glass', { collide: false });
    B.box(cx - 1.0, 0.3, cz - 2.18, cx + 1.0, 0.45, cz - 2.08, 'chrome', { collide: false });
    B.box(cx - 1.0, 0.3, cz + 2.08, cx + 1.0, 0.45, cz + 2.18, 'chrome', { collide: false });
    for (const [dx, dz] of [[-0.95, -1.4], [0.95, -1.4], [-0.95, 1.4], [0.95, 1.4]]) B.wheel(cx + dx, 0.38, cz + dz, 0.38, false);
  }

  function truck(B, cx, cz, color) { // runs along x, nose toward +x
    B.box(cx - 2.3, 0.2, cz - 1.0, cx + 0.1, 1.15, cz + 1.0, color, { render: false });
    B.box(cx + 0.1, 0.2, cz - 1.0, cx + 1.5, 1.95, cz + 1.0, color, { render: false });
    B.box(cx + 1.5, 0.2, cz - 1.0, cx + 2.3, 1.3, cz + 1.0, color, { render: false });
    B.box(cx - 2.3, 0.45, cz - 1.0, cx + 0.1, 0.65, cz + 1.0, color, { collide: false });
    B.box(cx - 2.3, 0.65, cz - 1.0, cx + 0.1, 1.15, cz - 0.88, color, { collide: false });
    B.box(cx - 2.3, 0.65, cz + 0.88, cx + 0.1, 1.15, cz + 1.0, color, { collide: false });
    B.box(cx - 2.3, 0.65, cz - 1.0, cx - 2.18, 1.15, cz + 1.0, color, { collide: false });
    B.box(cx + 0.1, 0.45, cz - 1.0, cx + 1.5, 1.35, cz + 1.0, color, { collide: false });
    B.box(cx + 0.15, 1.35, cz - 0.95, cx + 1.45, 1.9, cz + 0.95, 'glass', { collide: false });
    B.box(cx + 0.1, 1.9, cz - 1.0, cx + 1.5, 1.98, cz + 1.0, color, { collide: false });
    B.box(cx + 1.5, 0.45, cz - 1.0, cx + 2.3, 1.25, cz + 1.0, color, { collide: false });
    B.box(cx + 2.28, 0.35, cz - 1.05, cx + 2.4, 0.55, cz + 1.05, 'chrome', { collide: false });
    B.box(cx + 2.29, 0.85, cz - 0.85, cx + 2.33, 1.05, cz - 0.55, 'white', { collide: false });
    B.box(cx + 2.29, 0.85, cz + 0.55, cx + 2.33, 1.05, cz + 0.85, 'white', { collide: false });
    for (const [dx, dz] of [[-1.5, -1.0], [-1.5, 1.0], [1.4, -1.0], [1.4, 1.0]]) B.wheel(cx + dx, 0.42, cz + dz, 0.42, true);
  }

  buildSide(1, 'sidingBlue', 'accentOrange', 'blue');
  buildSide(-1, 'sidingYellow', 'accentTeal', 'red');

  // ---------------- the bus (centre) ----------------
  {
    const B = B0;
    B.box(-5.5, 0.4, -1.25, 5.5, 3.0, 1.25, 'busYellow', { render: false });
    B.box(5.5, 0.4, -1.15, 6.6, 1.8, 1.15, 'busYellow', { render: false });
    B.box(-5.5, 0.6, -1.25, 5.5, 2.95, 1.25, 'busYellow', { collide: false });
    B.box(-5.45, 2.95, -1.15, 5.45, 3.08, 1.15, 'busYellow', { collide: false });
    B.box(5.5, 0.6, -1.15, 6.6, 1.75, 1.15, 'busYellow', { collide: false });
    B.box(-5.52, 1.42, -1.27, 5.52, 1.55, 1.27, 'black', { collide: false });
    B.box(-5.55, 0.5, -1.2, 5.55, 0.7, 1.2, 'black', { collide: false });
    for (let x = -4.8; x < 4.6; x += 1.15) {
      B.box(x, 1.8, -1.27, x + 0.9, 2.6, -1.24, 'glass', { collide: false });
      B.box(x, 1.8, 1.24, x + 0.9, 2.6, 1.27, 'glass', { collide: false });
    }
    B.box(5.46, 1.85, -1.05, 5.52, 2.7, 1.05, 'glass', { collide: false });
    B.box(-5.52, 1.85, -1.0, -5.46, 2.7, 1.0, 'glass', { collide: false });
    B.box(6.6, 0.4, -1.2, 6.75, 0.65, 1.2, 'chrome', { collide: false });
    B.box(4.6, 0.75, 1.24, 5.4, 2.75, 1.28, 'black', { collide: false }); // door
    for (const [x, z] of [[-3.8, -1.15], [-3.8, 1.15], [4.2, -1.15], [4.2, 1.15]]) B.wheel(x, 0.5, z, 0.5, true);
    const busTex = busTextTexture();
    const bm = new THREE.MeshLambertMaterial({ map: busTex });
    const p1 = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.75), bm);
    p1.position.set(-0.6, 1.05, 1.285); decor.add(p1);
    const p2 = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.75), bm);
    p2.position.set(-0.6, 1.05, -1.285); p2.rotation.y = Math.PI; decor.add(p2);
  }

  // ---------------- nuclear bunker (easter egg) ----------------
  const bunker = { x: 15.5, z: 27.2, opened: false, door: null, light: null };
  {
    const B = B0;
    B.box(13.8, 0, 27.6, 14.2, 2.8, 28.6, 'concrete');
    B.box(16.8, 0, 27.6, 17.2, 2.8, 28.6, 'concrete');
    B.box(13.8, 2.4, 27.6, 17.2, 2.8, 28.6, 'concrete');
    B.box(14.2, 0, 28.6, 16.8, 2.4, 31, 'dark', { collide: false });
    const sph = new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    B.geo('hill', sph, 15.5, 0, 33, 0, 0, 0, 6.5, 4, 4.5);
    const doorMat = new THREE.MeshLambertMaterial({ map: bunkerTexture() });
    const side = new THREE.MeshLambertMaterial({ color: 0x55595d });
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 0.15), [side, side, side, side, side, doorMat]);
    door.position.set(15.5, 1.2, 28.1);
    door.rotation.y = Math.PI; // textured face toward the yard
    door.castShadow = true;
    decor.add(door);
    bunker.door = door;
    bunker.collider = addCollider(14.2, 0, 28.0, 16.8, 2.4, 28.2, { mm: '#555555' });
    const glow = new THREE.PointLight(0x66ff66, 0, 6);
    glow.position.set(15.5, 1.5, 29.5);
    decor.add(glow);
    bunker.light = glow;
  }

  // ---------------- scenery outside the play area ----------------
  {
    const B = B0;
    // water tower (the iconic Nuketown landmark)
    const wx = -38, wz = -36;
    for (const [dx, dz] of [[-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]]) B.box(wx + dx - 0.25, 0, wz + dz - 0.25, wx + dx + 0.25, 17, wz + dz + 0.25, 'towerWhite', { collide: false });
    B.box(wx - 2.4, 8, wz - 2.4, wx + 2.4, 8.3, wz + 2.4, 'towerWhite', { collide: false });
    B.geo('towerWhite', new THREE.CylinderGeometry(1, 1, 1, 18), wx, 13, wz, 0, 0, 0, 1.1, 10, 1.1);
    B.geo('towerWhite', new THREE.SphereGeometry(1, 24, 16), wx, 19.5, wz, 0, 0, 0, 5.2, 4.4, 5.2);
    B.geo('towerRed', new THREE.CylinderGeometry(1, 1, 1, 24), wx, 19.5, wz, 0, 0, 0, 5.3, 1.1, 5.3);
    B.geo('towerRed', new THREE.ConeGeometry(1, 1, 18), wx, 24.8, wz, 0, 0, 0, 2.2, 2.2, 2.2);
    B.geo('metal', new THREE.CylinderGeometry(0.08, 0.08, 4, 6), wx, 27.5, wz);

    // radio tower lattice
    const rx = 40, rz = 38;
    for (let i = 0; i < 12; i++) {
      const y0 = i * 3, w = 2.4 - i * 0.16;
      const mat = i % 2 ? 'towerRed' : 'towerWhite';
      for (const [dx, dz] of [[-w, -w], [w, -w], [-w, w], [w, w]]) B.box(rx + dx - 0.12, y0, rz + dz - 0.12, rx + dx + 0.12, y0 + 3, rz + dz + 0.12, mat, { collide: false });
      B.box(rx - w, y0 + 2.9, rz - w, rx + w, y0 + 3.05, rz - w + 0.1, mat, { collide: false });
      B.box(rx - w, y0 + 2.9, rz + w - 0.1, rx + w, y0 + 3.05, rz + w, mat, { collide: false });
    }
    B.geo('towerRed', new THREE.SphereGeometry(0.4, 10, 8), rx, 36.4, rz);

    // perimeter trees and rolling hills
    const rng = mulberry(7);
    for (let i = 0; i < 70; i++) {
      const a = rng() * Math.PI * 2, r = 42 + rng() * 45;
      const x = Math.cos(a) * r * 1.1, z = Math.sin(a) * r;
      if (Math.abs(z) < 9 && Math.abs(x) < 140) continue; // keep the road clear
      B.tree(x, z, 1 + rng() * 0.8, false);
    }
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + rng() * 0.2, r = 150 + rng() * 60;
      B.geo('hill', new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), Math.cos(a) * r, -2, Math.sin(a) * r, 0, 0, 0, 50 + rng() * 40, 18 + rng() * 22, 40 + rng() * 30);
    }
    // houses down the road
    for (const s of [1, -1]) {
      for (let k = 0; k < 4; k++) {
        const x = s * (42 + k * 18), z = (k % 2 ? 1 : -1) * 17;
        const mat = ['sidingBlue', 'sidingYellow', 'shedRed', 'trim'][(k + (s > 0 ? 0 : 2)) % 4];
        B.box(x - 6, 0, z - 4, x + 6, 3.4, z + 4, mat, { collide: false });
        B.box(x - 6.5, 3.4, z - 4.5, x + 6.5, 3.7, z + 4.5, 'roof', { collide: false });
        B.box(x - 1, 0, z - 4.05 * Math.sign(z), x + 1, 2.2, z - 4.0 * Math.sign(z), 'glass', { collide: false });
      }
    }
  }

  // ---------------- build merged meshes ----------------
  const texMats = {};
  for (const [name, b] of Object.entries(buckets)) {
    const def = MAT_DEFS[name];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(b.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(b.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(b.u, 2));
    g.computeBoundingSphere();
    const m = new THREE.MeshLambertMaterial({ color: def.c, map: def.t ? T[def.t] : null });
    if (def.alpha) { m.alphaTest = 0.5; m.side = THREE.DoubleSide; }
    texMats[name] = m;
    const mesh = new THREE.Mesh(g, m);
    mesh.receiveShadow = true;
    mesh.castShadow = !['grass', 'asphalt', 'sidewalk', 'yellowLine', 'whiteLine', 'picket', 'hill'].includes(name);
    decor.add(mesh);
  }

  // ---------------- gameplay data ----------------
  const spawnsSouth = [
    [-23, 25.5], [-15, 25.5], [-9, 22], [-3, 26], [5, 25], [12, 23], [27, 15], [-26, 21], [10, 10.5],
  ];
  const spawns = [];
  for (const s of [1, -1]) for (const [x, z] of spawnsSouth) spawns.push({ x: s * x, y: 0, z: s * z, side: s });

  const wpSouth = [
    // road
    [-26, 0, 3], [-18, 0, 4], [-12.7, 0, 5.2], [-12.7, 0, 1.0], [-8, 0, 4.5], [0, 0, 3.5], [8, 0, 3.5], [18, 0, 3.5], [26, 0, 3],
    [-26, 0, 0], [-8, 0, 0], [-18, 0, -1],
    // sidewalk / front yards
    [-24, 0, 9], [-15.5, 0, 8.8], [-4.5, 0, 8.8], [6, 0, 9], [15, 0, 9.5], [25, 0, 9.5],
    // house ground floor
    [-15.5, 0, 11.2], [-19.8, 0, 14.5], [-14, 0, 13.5], [-10, 0, 13.5], [-11.8, 0, 18.5], [-9.6, 0, 17.1], [-19, 0, 18],
    [-21.1, 0, 14.4],
    // house upper floor
    [-21.1, 3.2, 19.45], [-19.2, 3.2, 19.1], [-18, 3.2, 15], [-18.5, 3.2, 11.5], [-14, 3.2, 11.5], [-10, 3.2, 11.5],
    [-12, 3.2, 16], [-16, 3.2, 16.0], [-9.5, 3.2, 18.5],
    // garage
    [-4.5, 0, 10.0], [-6.4, 0, 11.4], [-6.4, 0, 17.2], [-2.4, 0, 12], [-2.4, 0, 15.5], [-2.8, 0, 17.8], [-2.8, 0, 20.5], [-7.0, 0, 17.1],
    // back yard
    [-11.8, 0, 21.0], [-18, 0, 24.5], [-24, 0, 22.5], [-27, 0, 21.8], [-24, 0, 26.5], [-9, 0, 22.5], [-4.5, 0, 26], [-14, 0, 26.5],
    [-2, 0, 23.5], [-29, 0, 20], [-15.5, 0, 20.8],
    // side yard
    [1.5, 0, 23.5], [2, 0, 11], [5, 0, 15], [11, 0, 16], [7.25, 0, 17.5], [7.25, 0, 21.5], [5, 0, 25], [12, 0, 24],
    [19, 0, 26.2], [20, 0, 17], [28.5, 0, 17], [28.5, 0, 26.5], [24, 0, 26.5], [24, 0, 15], [16, 0, 11], [13.5, 0, 21],
    [10, 0, 10.5], [1, 0, 17],
  ];
  const waypoints = [];
  for (const s of [1, -1]) for (const [x, y, z] of wpSouth) waypoints.push({ x: s * x, y, z: s * z, links: [] });
  const link = (i, j) => { if (!waypoints[i].links.includes(j)) { waypoints[i].links.push(j); waypoints[j].links.push(i); } };
  // stair links (not discoverable by straight-line sweeps)
  const half = wpSouth.length;
  const iBottom = wpSouth.findIndex((w) => w[0] === -21.1 && w[1] === 0);
  const iTop = wpSouth.findIndex((w) => w[0] === -21.1 && w[1] === 3.2);
  link(iBottom, iTop); link(iBottom + half, iTop + half);
  autoLink(waypoints, link);

  const pickupsSouth = [
    { type: 'speed', x: 24, z: 15 },
    { type: 'health', x: -2.2, z: 12.6 },
    { type: 'damage', x: -24, z: 1.5 },
  ];
  const pickups = [];
  for (const s of [1, -1]) for (const p of pickupsSouth) pickups.push({ type: p.type, x: s * p.x, y: 0, z: s * p.z });

  const minimap = renderMinimap();

  return { decor, spawns, waypoints, pickups, bunker, minimap, materials: texMats };
}

function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Connect waypoints on the same level when a body-sized corridor between them is clear.
function autoLink(wps, link) {
  const blocking = world.boxes.filter((b) => b.max.y > 0.3 && b.min.y < 8 && b.max.x - b.min.x < 300);
  const clear = (a, b, yOff, side) => {
    const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
    const nx = -dz / len, nz = dx / len;
    const o = { x: a.x + nx * side, y: a.y + yOff, z: a.z + nz * side };
    const d = { x: dx / len, y: (b.y - a.y) / len, z: dz / len };
    for (const box of blocking) if (rayBox(o, d, box, len)) return false;
    return true;
  };
  for (let i = 0; i < wps.length; i++) {
    for (let j = i + 1; j < wps.length; j++) {
      const a = wps[i], b = wps[j];
      if (Math.abs(a.y - b.y) > 0.3) continue;
      const dist = Math.hypot(a.x - b.x, a.z - b.z);
      if (dist > 16 || dist < 0.1) continue;
      let ok = true;
      for (const yOff of [0.55, 1.5]) {
        for (const side of [-0.32, 0.32]) if (!clear(a, b, yOff, side)) { ok = false; break; }
        if (!ok) break;
      }
      if (ok) link(i, j);
    }
  }
}

function renderMinimap() {
  const S = 4; // px per metre
  const W = (BOUNDS.x1 - BOUNDS.x0 + 2) * S, H = (BOUNDS.z1 - BOUNDS.z0 + 2) * S;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const tx = (x) => (x - BOUNDS.x0 + 1) * S, tz = (z) => (z - BOUNDS.z0 + 1) * S;
  g.fillStyle = '#3c6a35'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#4b4e55'; g.fillRect(0, tz(-6), W, 12 * S);
  g.fillStyle = '#8f8b84'; g.fillRect(0, tz(6), W, 1.8 * S); g.fillRect(0, tz(-7.8), W, 1.8 * S);
  // house footprints (floors)
  g.fillStyle = '#7b6650';
  g.fillRect(tx(-22), tz(10), 14 * S, 10 * S); g.fillRect(tx(8), tz(-20), 14 * S, 10 * S);
  g.fillStyle = '#6f6c66';
  g.fillRect(tx(-8), tz(10.5), 7 * S, 8.5 * S); g.fillRect(tx(1), tz(-19), 7 * S, 8.5 * S);
  const boxes = world.boxes.filter((b) => b.mm && b.max.y > 0.5 && b.min.y < 3.0).sort((a, b) => a.max.y - b.max.y);
  for (const b of boxes) {
    g.fillStyle = b.mm;
    const w = Math.max(1.5, (b.max.x - b.min.x) * S), h = Math.max(1.5, (b.max.z - b.min.z) * S);
    g.fillRect(tx(b.min.x), tz(b.min.z), w, h);
  }
  g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2;
  g.strokeRect(tx(BOUNDS.x0), tz(BOUNDS.z0), (BOUNDS.x1 - BOUNDS.x0) * S, (BOUNDS.z1 - BOUNDS.z0) * S);
  return { canvas: c, scale: S, tx, tz };
}
