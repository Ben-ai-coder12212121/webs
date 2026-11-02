import * as THREE from 'three';
import { mulberry } from '../map.js';

// Construction site: a half-built steel-frame building in the middle with an open second
// floor, scaffolding, container stacks, crawl-through concrete pipes and jump pads.
const BOUNDS = { x0: -28, x1: 28, z0: -24, z1: 24 };

export default {
  id: 'steelyard', name: 'Steelyard', short: 'Construction', light: 'dusk',
  blurb: 'Half-built tower and scaffolding. Lots of verticality.',
  thumb: 'construction',
  build(K) {
    const { builder, B0, pushBoxGeo } = K;
    pushBoxGeo(-400, -0.5, -400, 400, 0, 400, 'dirt');
    B0.box(-12, 0, -9, 12, 0.06, 9, 'slab', { collide: false });

    // hoarding around the site
    const X = BOUNDS.x1, Z = BOUNDS.z1;
    B0.box(-X - 0.3, 0, Z, X + 0.3, 2.8, Z + 0.3, 'plywoodDark');
    B0.box(-X - 0.3, 0, -Z - 0.3, X + 0.3, 2.8, -Z, 'plywoodDark');
    B0.box(X, 0, -Z, X + 0.3, 2.8, Z, 'plywoodDark');
    B0.box(-X - 0.3, 0, -Z, -X, 2.8, Z, 'plywoodDark');

    // ---------------- steel-frame building (centre) ----------------
    const F2 = 3.6, BX = 8, BZ = 6;
    for (const x of [-8, -4, 0, 4, 8]) for (const z of [-6, 0, 6]) B0.box(x - 0.18, 0, z - 0.18, x + 0.18, 7.2, z + 0.18, 'girder');
    // second-floor slab with two stairwell holes (x 4.4..5.8, z -1..2.5 and its mirror)
    const slab = (x0, z0, x1, z1) => B0.box(x0, F2 - 0.25, z0, x1, F2, z1, 'concrete');
    slab(-BX, 2.5, BX, BZ); slab(-BX, -BZ, BX, -2.5);
    slab(-BX, -2.5, -5.8, 2.5); slab(-5.8, 1, -4.4, 2.5); slab(-4.4, -2.5, 4.4, 2.5); slab(4.4, -2.5, 5.8, -1); slab(5.8, -2.5, BX, 2.5);
    // roof beams
    for (const z of [-6, 0, 6]) B0.box(-BX - 0.2, 7.0, z - 0.15, BX + 0.2, 7.3, z + 0.15, 'girder', { collide: false });
    for (const x of [-8, 0, 8]) B0.box(x - 0.15, 7.0, -BZ - 0.2, x + 0.15, 7.3, BZ + 0.2, 'girder', { collide: false });
    B0.box(-BX - 0.2, F2 - 0.45, -BZ - 0.2, BX + 0.2, F2 - 0.25, BZ + 0.2, 'girder', { collide: false });

    for (const s of [1, -1]) {
      const B = builder(s);
      B.stairs(4.4, -1, 5.8, 4.5, 0, F2, 'z-', 'steel');
      // guard rails on the second floor (bullets pass)
      B.box(-BX, F2, BZ - 0.08, 2.5, F2 + 1.0, BZ, 'hazard', { noRay: true });
      B.box(-BX, F2, -2.5, -BX + 0.08, F2 + 1.0, 2.5, 'hazard', { noRay: true });
      // cover on the second floor
      B.box(-6.5, F2, 3.4, -4.5, F2 + 1.1, 4.6, 'plywood');
      B.box(1.0, F2, -4.6, 2.6, F2 + 0.8, -3.4, 'sandbag');
      B.crate(-1.5, 4.8, 1.0, F2);
      B.box(6.4, F2, 1.0, 7.8, F2 + 1.3, 1.6, 'concreteDark');
      // ground-floor cover inside the frame
      B.box(-6.6, 0, 1.0, -4.8, 1.1, 1.6, 'concreteDark');
      B.crate(2.0, 3.5, 1.2);
      B.box(-2.5, 0, -4.8, -0.5, 0.9, -3.6, 'plywood');
      // jump pad onto the second floor
      B.box(11.0, 0, 2.3, 12.4, 0.08, 3.7, 'hazard', { collide: false });
      B.jumpPad(11.7, 3.0, -6.4, 13.6, 0);

      // ---- container stacks ----
      B.container(-16, 12, true, 'contBlue');
      B.container(-16, 12, true, s > 0 ? 'contRed' : 'contGreen', 2.6);
      B.container(-22.5, 17.5, false, 'contOrange', 0, true);
      B.container(-9.5, 19.8, true, 'contGreen', 0, true);

      // ---- concrete pipes you crouch through ----
      for (const pz of [12.8, 15.4]) {
        B.geo('pipe', new THREE.CylinderGeometry(1.0, 1.0, 4.6, 16, 1, true), 8, 1.0, pz, 0, 0, Math.PI / 2);
        B.box(5.7, 0, pz - 1.0, 10.3, 1.6, pz - 0.6, 'pipe', { render: false });
        B.box(5.7, 0, pz + 0.6, 10.3, 1.6, pz + 1.0, 'pipe', { render: false });
        B.box(5.7, 1.3, pz - 0.6, 10.3, 1.9, pz + 0.6, 'pipe', { render: false });
        B.box(5.7, 0, pz - 0.6, 10.3, 0.04, pz + 0.6, 'concreteDark', { collide: false });
      }

      // ---- half-built wall with scaffolding ----
      B.wallX(18.2, 0, 12, 0, 3.0, 0.35, 'concrete', [{ a: 3, b: 4.4, lo: 0, hi: 2.3 }, { a: 7.5, b: 9.5, lo: 1.1, hi: 2.2 }], null);
      B.box(0, 2.2, 18.45, 12.3, 2.3, 19.7, 'grate');
      for (const x of [0.2, 4, 8, 12.1]) B.box(x - 0.06, 0, 19.55, x + 0.06, 3.4, 19.67, 'steel', { collide: false });
      B.box(0, 3.2, 19.55, 12.3, 3.28, 19.67, 'steel', { noRay: true });
      B.stairs(12.3, 18.45, 16.0, 19.7, 0, 2.3, 'x-', 'grate');

      // ---- crane (scenery) on one side ----
      if (s > 0) {
        for (let i = 0; i < 9; i++) B.box(22.4, i * 2.6, -20.6, 24.0, i * 2.6 + 2.6, -19.0, i % 2 ? 'girder' : 'hazard', { collide: i === 0 });
        B.box(-6, 23.4, -20.4, 25, 24.4, -19.2, 'girder', { collide: false });
        B.box(23.0, 24.4, -20.2, 23.5, 26.5, -19.4, 'girder', { collide: false });
        B.box(-6, 14, -19.9, -5.9, 23.4, -19.7, 'black', { collide: false });
        B.box(-6.8, 13.0, -20.5, -5.0, 14.0, -19.1, 'concreteDark', { collide: false });
        B.box(22.0, 18.5, -21.0, 24.4, 21, -18.6, 'glass', { collide: false });
      }

      // ---- clutter ----
      B.box(17.5, 0, 6, 20.5, 0.6, 8.5, 'wood'); // pallet of bricks
      B.box(17.7, 0.6, 6.2, 20.3, 1.4, 8.3, 'brick');
      B.box(-21, 0, 3, -18, 1.0, 4.2, 'plywood');
      B.box(-25.5, 0, 9.0, -23.5, 1.4, 11.0, 'concreteDark');
      B.barrel(14.5, 12.3, 0, 'contOrange'); B.barrel(15.2, 13.1, 0, 'contOrange');
      B.barrel(-3, 13, 0, 'contBlue');
      for (let i = 0; i < 4; i++) B.box(-14 + i * 1.6, 0, 5.4, -13.5 + i * 1.6, 1.0, 6.0, 'hazard', { noRay: true }); // barriers
      // cement mixer
      B.geo('contOrange', K.cyl, 22, 1.4, 14, Math.PI / 2.6, 0.5, 0, 0.9, 1.8, 0.9);
      B.box(21, 0, 13, 23, 1.3, 15, 'steel');
      B.lamp(-8.5, 8.4, 4.2);
      B.lamp(14.6, 9.0, 4.2);
      B.lamp(-2, 22.5, 3.8);
    }

    // skyline of half-finished towers far away
    const rng = mulberry(3);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + rng() * 0.3, r = 90 + rng() * 70, h = 20 + rng() * 45;
      const x = Math.cos(a) * r, z = Math.sin(a) * r, w = 6 + rng() * 6;
      B0.box(x - w, 0, z - w, x + w, h, z + w, rng() < 0.5 ? 'concreteDark' : 'concrete', { collide: false });
      if (rng() < 0.6) B0.box(x - 0.6, h, z - 0.6, x + 0.6, h + 10, z + 0.6, 'girder', { collide: false });
    }

    return {
      bounds: BOUNDS,
      spawnsSouth: [[-25, 21], [-14, 22], [-3, 22], [6, 22], [19, 22], [25, 15], [25, 3.5], [-25, 6], [17, 10.5]],
      openSpawn: [-14, 22],
      navSouth: [
        [7, F2, 4.4], [3, F2, 4.4], [-1, F2, 3.4], [-5, F2, 2.7], [-7, F2, 1.5], [-2, F2, 1.5], [2, F2, 0], [7, F2, 0.5], [3.2, F2, -1.2],
        [10, 2.3, 19.1], [5, 2.3, 19.1], [1, 2.3, 19.1],
      ],
      navLinks: [
        [[5.1, 0, 5.1], [5.1, F2, -1.6]],
        [[16.6, 0, 19.1], [11.8, 2.3, 19.1]],
      ],
      pickupsSouth: [
        { type: 'speed', x: -21, z: 0.5 },
        { type: 'health', x: -9.5, z: 19.8 },
        { type: 'armor', x: 6, y: 2.3, z: 19.1 },
      ],
      pickupsCentre: [{ type: 'damage', x: 0, y: F2, z: 0 }],
      menuCam: { r: 44, h: 20 },
      mmBase(g, tx, tz, S, W, Hh) {
        g.fillStyle = '#8a7258'; g.fillRect(0, 0, W, Hh);
        g.fillStyle = '#9c988f'; g.fillRect(tx(-12), tz(-9), 24 * S, 18 * S);
        g.fillStyle = 'rgba(60,60,60,0.45)'; g.fillRect(tx(-8), tz(-6), 16 * S, 12 * S);
      },
    };
  },
};
