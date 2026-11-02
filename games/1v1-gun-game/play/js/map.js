import * as THREE from 'three';
import { addCollider, resetWorld, world, rayBox, bodyBlocked } from './physics.js';
import { makeTextures } from './textures.js';
import nuketown from './maps/nuketown.js';
import dustyard from './maps/dustyard.js';
import frostbite from './maps/frostbite.js';
import ruins from './maps/ruins.js';
import steelyard from './maps/steelyard.js';
import killhouse from './maps/killhouse.js';

// Map registry. Each map module exports { id, name, blurb, light, build(K) }.
export const MAPS = [nuketown, dustyard, frostbite, ruins, steelyard, killhouse];
export const MAP_BY_ID = Object.fromEntries(MAPS.map((m) => [m.id, m]));

// Material palette. uv = metres per texture repeat (UVs are generated in world space). mm = minimap colour.
export const MAT_DEFS = {
  grass:        { c: 0xffffff, t: 'grass', uv: 5 },
  asphalt:      { c: 0xffffff, t: 'asphalt', uv: 6 },
  sidewalk:     { c: 0xffffff, t: 'tiles', uv: 1.6, mm: '#c9c5bd' },
  concrete:     { c: 0xc7c3bb, t: 'noise', uv: 3, mm: '#9c988f' },
  concreteDark: { c: 0x8e8b86, t: 'noise', uv: 3, mm: '#6f6c68' },
  slab:         { c: 0xb9b5ad, t: 'tiles', uv: 4, mm: '#8f8b84' },
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
  rock:         { c: 0x8a8f86, t: 'noise', uv: 4, mm: '#6c706a' },
  towerWhite:   { c: 0xeef0f2, t: 'noise', uv: 3 },
  towerRed:     { c: 0xd8343a, t: 'noise', uv: 3 },
  dark:         { c: 0x0c0d10 },
  yellowLine:   { c: 0xf3c623 },
  whiteLine:    { c: 0xf2f2f2 },
  // desert
  sand:         { c: 0xffffff, t: 'sand', uv: 6 },
  dune:         { c: 0xe2b77a, t: 'sand', uv: 14 },
  adobe:        { c: 0xe0b98a, t: 'stucco', uv: 3, mm: '#8a6a48' },
  adobeDark:    { c: 0xc2946a, t: 'stucco', uv: 3, mm: '#7a5a3a' },
  sandbag:      { c: 0xc9b089, t: 'bags', uv: 1.2, mm: '#8d7a5a' },
  canvasRed:    { c: 0xb8402e, t: 'noise', uv: 2 },
  canvasBlue:   { c: 0x2f6a9a, t: 'noise', uv: 2 },
  palm:         { c: 0x4c8a32, t: 'leaves', uv: 1.5 },
  palmTrunk:    { c: 0x8a6a44, t: 'planks', uv: 1 },
  crate:        { c: 0xffffff, t: 'crate', uv: 1.2, mm: '#7a5a34' },
  jeep:         { c: 0x6b7346, t: 'noise', uv: 2, mm: '#4a5030' },
  // snow
  snow:         { c: 0xffffff, t: 'snow', uv: 6 },
  snowHill:     { c: 0xf4f8fc, t: 'snow', uv: 16 },
  ice:          { c: 0xbfe2f2, t: 'ice', uv: 5 },
  hutRed:       { c: 0xc23a2e, t: 'siding', uv: 2, mm: '#7a2a22' },
  hutGrey:      { c: 0x8f99a3, t: 'siding', uv: 2, mm: '#5f6870' },
  pine:         { c: 0x2f5e3a, t: 'leaves', uv: 2 },
  snowCap:      { c: 0xf6fbff, t: 'snow', uv: 2 },
  tank:         { c: 0xe8e8e0, t: 'noise', uv: 2, mm: '#a0a098' },
  // containers / industrial
  contRed:      { c: 0xb23b2a, t: 'ribbed', uv: 2.5, mm: '#7f2b20' },
  contBlue:     { c: 0x2f62a8, t: 'ribbed', uv: 2.5, mm: '#22477a' },
  contGreen:    { c: 0x3f7f4a, t: 'ribbed', uv: 2.5, mm: '#2c5a34' },
  contOrange:   { c: 0xd8782a, t: 'ribbed', uv: 2.5, mm: '#9a5520' },
  steel:        { c: 0x6f7a86, t: 'noise', uv: 2, mm: '#4a525a' },
  girder:       { c: 0xd2632a, t: 'noise', uv: 2, mm: '#8a4520' },
  hazard:       { c: 0xffffff, t: 'hazard', uv: 1.2, mm: '#c9a020' },
  plywood:      { c: 0xd9b27c, t: 'plywood', uv: 2.4, mm: '#8a6a40' },
  plywoodDark:  { c: 0xa98454, t: 'plywood', uv: 2.4, mm: '#6a4a28' },
  grate:        { c: 0x7a838c, t: 'grate', uv: 1 },
  pipe:         { c: 0x9aa0a6, t: 'noise', uv: 2, mm: '#6a7076' },
  dirt:         { c: 0xa88a64, t: 'sand', uv: 5 },
  // jungle
  stone:        { c: 0xffffff, t: 'stone', uv: 2.2, mm: '#6f6a5c' },
  stoneMoss:    { c: 0xb6c49a, t: 'stone', uv: 2.2, mm: '#5d6a48' },
  stoneDark:    { c: 0x9a9585, t: 'stone', uv: 2.2, mm: '#55524a' },
  mud:          { c: 0x9a7a52, t: 'sand', uv: 5 },
  jungleGrass:  { c: 0x9fc68a, t: 'grass', uv: 5 },
  water:        { c: 0x3f8fa0, t: 'ice', uv: 4, opacity: 0.8 },
  vine:         { c: 0x3c7a2a, t: 'leaves', uv: 1 },
  gold:         { c: 0xf2c440, mm: '#c9a020' },
  // killhouse
  matBlue:      { c: 0x2a4f8a, t: 'noise', uv: 2, mm: '#22406e' },
  matRed:       { c: 0x9a2a2a, t: 'noise', uv: 2, mm: '#7a2020' },
  target:       { c: 0xffffff, t: 'target', uv: 1 },
  neonCyan:     { c: 0x3fe0ff, unlit: true },
  neonPink:     { c: 0xff4fa8, unlit: true },
  neonYellow:   { c: 0xffd23f, unlit: true },
  lampGlow:     { c: 0xfff1c0, unlit: true },
};

let TEX = null; // textures are shared between maps
const getTextures = () => TEX || (TEX = makeTextures());

// ------------------------------------------------------------------ the map kit
// Geometry is collected per material and merged into one mesh each, so a map is a handful of draw calls.
function createKit(scene) {
  resetWorld();
  const T = getTextures();
  const buckets = {};
  const decor = new THREE.Group();
  scene.add(decor);
  const lamps = [], pads = [];
  addCollider(-600, -5, -600, 600, 0, 600, { mm: null }); // the ground

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

  const ico = new THREE.IcosahedronGeometry(1, 1);
  const cone = new THREE.ConeGeometry(1, 1, 9);
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 14);

  // Builder in "south frame"; s = -1 mirrors through the map centre (180deg rotation), which keeps maps fair.
  function builder(s) {
    const B = {
      s,
      box: (x0, y0, z0, x1, y1, z1, mat, o) => addBox(s * x0, y0, s * z0, s * x1, y1, s * z1, mat, o),
      wallX(z, xa, xb, y0, y1, t, mat, openings = [], trim = 'trim') {
        for (const [a, b, lo, hi] of wallSegments(xa, xb, y0, y1, openings)) B.box(a, lo, z - t / 2, b, hi, z + t / 2, mat);
        if (trim) for (const o of openings) if (o.lo > 0.3) B.box(o.a - 0.06, o.lo - 0.08, z - t / 2 - 0.08, o.b + 0.06, o.lo, z + t / 2 + 0.08, trim, { collide: false });
      },
      wallZ(x, za, zb, y0, y1, t, mat, openings = [], trim = 'trim') {
        for (const [a, b, lo, hi] of wallSegments(za, zb, y0, y1, openings)) B.box(x - t / 2, lo, a, x + t / 2, hi, b, mat);
        if (trim) for (const o of openings) if (o.lo > 0.3) B.box(x - t / 2 - 0.08, o.lo - 0.08, o.a - 0.06, x + t / 2 + 0.08, o.lo, o.b + 0.06, trim, { collide: false });
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
      fence(x0, z0, x1, z1, mat = 'picket') { // fence along x or z, 1m high; bullets pass through
        if (Math.abs(x1 - x0) > Math.abs(z1 - z0)) B.box(x0, 0, z0 - 0.05, x1, 1.0, z0 + 0.05, mat, { noRay: true });
        else B.box(x0 - 0.05, 0, z0, x0 + 0.05, 1.0, z1, mat, { noRay: true });
      },
      tree(x, z, sc = 1, collide = true) {
        B.box(x - 0.2 * sc, 0, z - 0.2 * sc, x + 0.2 * sc, 2.4 * sc, z + 0.2 * sc, 'trunk', { collide });
        B.geo('foliage', ico, x, 3.3 * sc, z, 0, Math.random(), 0, 1.7 * sc, 1.5 * sc, 1.7 * sc);
        B.geo('foliageDark', ico, x + 0.6 * sc, 2.7 * sc, z + 0.4 * sc, 0, Math.random(), 0, 1.1 * sc, 1.0 * sc, 1.1 * sc);
        B.geo('foliage', ico, x - 0.5 * sc, 4.2 * sc, z - 0.3 * sc, 0, Math.random(), 0, 1.0 * sc, 0.9 * sc, 1.0 * sc);
      },
      pine(x, z, sc = 1, collide = true, snowy = false) {
        B.box(x - 0.18 * sc, 0, z - 0.18 * sc, x + 0.18 * sc, 1.6 * sc, z + 0.18 * sc, 'trunk', { collide });
        for (let i = 0; i < 3; i++) {
          const r = (1.7 - i * 0.45) * sc, y = (1.6 + i * 1.25) * sc;
          B.geo('pine', cone, x, y + 1.0 * sc, z, 0, i, 0, r, 2.2 * sc, r);
          if (snowy) B.geo('snowCap', cone, x, y + 1.55 * sc, z, 0, i, 0, r * 0.62, 1.05 * sc, r * 0.62);
        }
      },
      palm(x, z, sc = 1, lean = 0.15, collide = true) {
        const h = 5.2 * sc;
        if (collide) B.box(x - 0.2, 0, z - 0.2, x + 0.2, h, z + 0.2, 'palmTrunk', { render: false });
        for (let i = 0; i < 6; i++) {
          const y = (i + 0.5) * h / 6;
          B.geo('palmTrunk', cyl, x + lean * y, y, z, 0, 0, -lean, 0.22 * sc * (1 - i * 0.06), h / 6 + 0.02, 0.22 * sc * (1 - i * 0.06));
        }
        const tx = x + lean * h, ty = h;
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * Math.PI * 2;
          B.geo('palm', new THREE.BoxGeometry(1, 0.06, 0.55), tx + Math.cos(a) * 1.3 * sc, ty - 0.35, z + Math.sin(a) * 1.3 * sc, 0, -a, 0.38, 2.8 * sc, 1, sc);
        }
        B.geo('palmTrunk', ico, tx, ty, z, 0, 0, 0, 0.35 * sc, 0.3 * sc, 0.35 * sc);
      },
      bush(x, z, sc = 1, mat = 'foliageDark') { // visual cover only
        B.geo(mat, ico, x, 0.45 * sc, z, 0, Math.random() * 3, 0, 0.95 * sc, 0.7 * sc, 0.95 * sc);
        B.geo('foliage', ico, x + 0.4 * sc, 0.35 * sc, z - 0.3 * sc, 0, Math.random() * 3, 0, 0.6 * sc, 0.5 * sc, 0.6 * sc);
      },
      rock(x, z, sc = 1, mat = 'rock') {
        B.geo(mat, new THREE.DodecahedronGeometry(1, 0), x, 0.35 * sc, z, Math.random(), Math.random() * 3, 0, 1.1 * sc, 0.75 * sc, 0.9 * sc);
        B.box(x - 0.85 * sc, 0, z - 0.7 * sc, x + 0.85 * sc, 0.9 * sc, z + 0.7 * sc, mat, { render: false });
      },
      wheel(x, y, z, r, alongX) {
        const c = new THREE.CylinderGeometry(r, r, 0.3, 14);
        if (alongX) B.geo('black', c, x, y, z, Math.PI / 2, 0, 0);
        else B.geo('black', c, x, y, z, 0, 0, Math.PI / 2);
        const hub = new THREE.CylinderGeometry(r * 0.45, r * 0.45, 0.32, 10);
        if (alongX) B.geo('chrome', hub, x, y, z, Math.PI / 2, 0, 0);
        else B.geo('chrome', hub, x, y, z, 0, 0, Math.PI / 2);
      },
      // Climbable steps from (y0) to (y1); dir is the direction you walk to go up: 'x+', 'x-', 'z+', 'z-'.
      stairs(xa, za, xb, zb, y0, y1, dir, mat = 'concrete') {
        const n = Math.max(2, Math.ceil((y1 - y0) / 0.4));
        const x0 = Math.min(xa, xb), x1 = Math.max(xa, xb), z0 = Math.min(za, zb), z1 = Math.max(za, zb);
        for (let i = 0; i < n; i++) {
          const top = y0 + ((i + 1) * (y1 - y0)) / n;
          const f0 = i / n, f1 = (i + 1) / n;
          if (dir === 'x+') B.box(x0 + (x1 - x0) * f0, y0, z0, x0 + (x1 - x0) * f1, top, z1, mat);
          else if (dir === 'x-') B.box(x1 - (x1 - x0) * f1, y0, z0, x1 - (x1 - x0) * f0, top, z1, mat);
          else if (dir === 'z+') B.box(x0, y0, z0 + (z1 - z0) * f0, x1, top, z0 + (z1 - z0) * f1, mat);
          else B.box(x0, y0, z1 - (z1 - z0) * f1, x1, top, z1 - (z1 - z0) * f0, mat);
        }
      },
      crate(x, z, sz = 1.2, y = 0, mat = 'crate') {
        const h = sz / 2;
        return B.box(x - h, y, z - h, x + h, y + sz, z + h, mat);
      },
      barrel(x, z, y = 0, mat = 'contRed') {
        B.geo(mat, cyl, x, y + 0.5, z, 0, 0, 0, 0.33, 1.0, 0.33);
        B.geo('black', cyl, x, y + 1.0, z, 0, 0, 0, 0.3, 0.02, 0.3);
        B.box(x - 0.32, y, z - 0.32, x + 0.32, y + 1.0, z + 0.32, mat, { render: false });
      },
      sandbags(xa, za, xb, zb, h = 1.0) {
        const x0 = Math.min(xa, xb), x1 = Math.max(xa, xb), z0 = Math.min(za, zb), z1 = Math.max(za, zb);
        B.box(x0, 0, z0, x1, h, z1, 'sandbag');
      },
      // Shipping container (6.1 x 2.6 x 2.44). open: hollow with open ends you can walk through.
      container(cx, cz, alongX, mat, y = 0, open = false) {
        const L = 3.05, W = 1.22, H = 2.6, t = 0.1;
        const bx = (a0, b0, c0, a1, b1, c1, m, o) => alongX ? B.box(cx + a0, y + b0, cz + c0, cx + a1, y + b1, cz + c1, m, o) : B.box(cx + c0, y + b0, cz + a0, cx + c1, y + b1, cz + a1, m, o);
        if (!open) { bx(-L, 0, -W, L, H, W, mat); return; }
        bx(-L, 0, -W, L, 0.12, W, 'steel');
        bx(-L, 0, -W, L, H, -W + t, mat);
        bx(-L, 0, W - t, L, H, W, mat);
        bx(-L, H - t, -W, L, H, W, mat);
        bx(-L, 0, -W, -L + 0.12, H, -W + 0.3, 'steel', { collide: false });
        bx(L - 0.12, 0, W - 0.3, L, H, W, 'steel', { collide: false });
      },
      lamp(x, z, h = 4.2, color = 0xffd9a0) {
        B.box(x - 0.08, 0, z - 0.08, x + 0.08, h, z + 0.08, 'metal');
        B.box(x - 0.3, h, z - 0.3, x + 0.3, h + 0.18, z + 0.3, 'metal', { collide: false });
        B.box(x - 0.24, h - 0.06, z - 0.24, x + 0.24, h, z + 0.24, 'lampGlow', { collide: false });
        lamps.push({ x: s * x, y: h - 0.3, z: s * z, color });
      },
      // Launches anyone who steps on it with velocity (vx, vy, vz) in this builder's frame.
      jumpPad(x, z, vx, vy, vz) {
        pads.push({ x: s * x, z: s * z, vx: s * vx, vy, vz: s * vz });
      },
    };
    return B;
  }

  function finish() {
    const texMats = {};
    for (const [name, b] of Object.entries(buckets)) {
      const def = MAT_DEFS[name];
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(b.p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(b.n, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(b.u, 2));
      g.computeBoundingSphere();
      const m = def.unlit
        ? new THREE.MeshBasicMaterial({ color: def.c, fog: false })
        : new THREE.MeshLambertMaterial({ color: def.c, map: def.t ? T[def.t] : null });
      if (def.alpha) { m.alphaTest = 0.5; m.side = THREE.DoubleSide; }
      if (def.opacity) { m.transparent = true; m.opacity = def.opacity; m.depthWrite = false; }
      texMats[name] = m;
      const mesh = new THREE.Mesh(g, m);
      mesh.receiveShadow = !def.unlit;
      mesh.castShadow = !def.unlit && !def.opacity && !['grass', 'asphalt', 'sidewalk', 'yellowLine', 'whiteLine', 'picket', 'hill', 'sand', 'dune', 'snow', 'snowHill', 'ice', 'mud', 'jungleGrass', 'slab', 'dirt'].includes(name);
      decor.add(mesh);
    }
    return texMats;
  }

  return { T, decor, scene, builder, B0: builder(1), addBox, pushBoxGeo, pushGeo, addCollider, finish, lamps, pads, ico, cone, cyl };
}

// ------------------------------------------------------------------ build a map
export function buildMap(scene, id) {
  const def = MAP_BY_ID[id] || MAPS[0];
  const K = createKit(scene);
  const r = def.build(K);
  const BOUNDS = r.bounds;

  // invisible play-area walls
  const W = 30;
  addCollider(BOUNDS.x0 - 1, 0, BOUNDS.z0 - 1, BOUNDS.x0, W, BOUNDS.z1 + 1, { noRay: true, mm: null });
  addCollider(BOUNDS.x1, 0, BOUNDS.z0 - 1, BOUNDS.x1 + 1, W, BOUNDS.z1 + 1, { noRay: true, mm: null });
  addCollider(BOUNDS.x0 - 1, 0, BOUNDS.z0 - 1, BOUNDS.x1 + 1, W, BOUNDS.z0, { noRay: true, mm: null });
  addCollider(BOUNDS.x0 - 1, 0, BOUNDS.z1, BOUNDS.x1 + 1, W, BOUNDS.z1 + 1, { noRay: true, mm: null });

  const materials = K.finish();

  // spawns: given in the south frame, mirrored for the north
  const spawns = [];
  for (const s of [1, -1]) for (const [x, z, y = 0] of r.spawnsSouth) spawns.push({ x: s * x, y, z: s * z, side: s });
  const open = r.openSpawn || r.spawnsSouth[0];
  const openSpawns = { south: { x: open[0], y: open[2] || 0, z: open[1] }, north: { x: -open[0], y: open[2] || 0, z: -open[1] } };

  // nav waypoints: either hand-placed (r.waypointsSouth) or a ground grid plus hand-placed raised points
  let waypoints;
  if (r.waypoints) waypoints = r.waypoints;
  else {
    waypoints = [];
    const seen = new Set();
    const add = (x, y, z) => {
      const k = `${Math.round(x * 4)},${Math.round(y * 4)},${Math.round(z * 4)}`;
      if (seen.has(k)) return -1;
      seen.add(k);
      waypoints.push({ x, y, z, links: [] });
      return waypoints.length - 1;
    };
    const step = r.navStep || 2.5;
    for (let x = BOUNDS.x0 + 1.2; x <= BOUNDS.x1 - 1.2; x += step) {
      for (let z = BOUNDS.z0 + 1.2; z <= BOUNDS.z1 - 1.2; z += step) {
        if (!bodyBlocked(x, 0.05, z, 0.42, 1.7)) add(x, 0, z);
      }
    }
    const extraIdx = [];
    for (const s of [1, -1]) for (const [x, y, z] of r.navSouth || []) extraIdx.push(add(s * x, y, s * z));
    const link = (i, j) => { if (i < 0 || j < 0 || i === j) return; if (!waypoints[i].links.includes(j)) { waypoints[i].links.push(j); waypoints[j].links.push(i); } };
    autoLink(waypoints, link, step * 1.5 + 0.1);
    // hand-placed points also link further along their own level (open floors and roofs)
    for (const i of extraIdx) for (const j of extraIdx) if (i >= 0 && j >= 0 && i < j && near(waypoints[i], waypoints[j], 9)) tryLink(waypoints, i, j, link);
    // stair / ladder connections (pairs of [x,y,z] in the south frame)
    const find = (x, y, z) => waypoints.findIndex((w) => Math.abs(w.x - x) < 0.3 && Math.abs(w.y - y) < 0.3 && Math.abs(w.z - z) < 0.3);
    for (const s of [1, -1]) for (const [a, b] of r.navLinks || []) {
      let i = find(s * a[0], a[1], s * a[2]); if (i < 0) i = add(s * a[0], a[1], s * a[2]);
      let j = find(s * b[0], b[1], s * b[2]); if (j < 0) j = add(s * b[0], b[1], s * b[2]);
      link(i, j);
      // tie the stair ends into the network around them
      for (const k of [i, j]) for (let m = 0; m < waypoints.length; m++) if (m !== k && near(waypoints[k], waypoints[m], 4)) tryLink(waypoints, k, m, link);
    }
  }

  const pickups = [];
  for (const s of [1, -1]) for (const p of r.pickupsSouth || []) pickups.push({ type: p.type, x: s * p.x, y: p.y || 0, z: s * p.z });
  for (const p of r.pickupsCentre || []) pickups.push({ type: p.type, x: p.x, y: p.y || 0, z: p.z });

  const minimap = renderMinimap(BOUNDS, r.mmBase);

  return {
    id: def.id, name: def.name, def, decor: K.decor, bounds: BOUNDS, spawns, openSpawns, waypoints, pickups, minimap, materials,
    bunker: r.bunker || null, lamps: K.lamps, pads: K.pads, zones: r.zones || [], weather: r.weather || null,
    menuCam: r.menuCam || { r: 46, h: 19 }, light: def.light || 'day',
    dispose() {
      scene.remove(K.decor);
      K.decor.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material && !Array.isArray(o.material) && o.material.map && !Object.values(K.T).includes(o.material.map)) o.material.map.dispose();
      });
    },
  };
}

const near = (a, b, d) => Math.abs(a.y - b.y) < 0.3 && Math.hypot(a.x - b.x, a.z - b.z) < d;

let blockingCache = null;
function blockingBoxes() {
  return world.boxes.filter((b) => b.max.y > 0.3 && b.max.x - b.min.x < 300);
}

function tryLink(wps, i, j, link) {
  const a = wps[i], b = wps[j];
  const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
  if (len < 0.05) return;
  const nx = -dz / len, nz = dx / len;
  const d = { x: dx / len, y: (b.y - a.y) / len, z: dz / len };
  for (const yOff of [0.55, 1.5]) for (const side of [-0.32, 0.32]) {
    const o = { x: a.x + nx * side, y: a.y + yOff, z: a.z + nz * side };
    for (const box of blockingCache) if (box.max.y > a.y + 0.3 && box.min.y < a.y + 8 && rayBox(o, d, box, len)) return;
  }
  link(i, j);
}

// Connect waypoints on the same level when a body-sized corridor between them is clear.
export function autoLink(wps, link, maxDist = 16) {
  blockingCache = blockingBoxes();
  for (let i = 0; i < wps.length; i++) {
    for (let j = i + 1; j < wps.length; j++) {
      const a = wps[i], b = wps[j];
      if (Math.abs(a.y - b.y) > 0.3) continue;
      const dist = Math.hypot(a.x - b.x, a.z - b.z);
      if (dist > maxDist || dist < 0.1) continue;
      tryLink(wps, i, j, link);
    }
  }
}

export function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function renderMinimap(BOUNDS, base) {
  const S = 4; // px per metre
  const W = (BOUNDS.x1 - BOUNDS.x0 + 2) * S, H = (BOUNDS.z1 - BOUNDS.z0 + 2) * S;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const tx = (x) => (x - BOUNDS.x0 + 1) * S, tz = (z) => (z - BOUNDS.z0 + 1) * S;
  g.fillStyle = '#3c6a35'; g.fillRect(0, 0, W, H);
  if (base) base(g, tx, tz, S, W, H);
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
