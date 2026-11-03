import * as THREE from 'three';
import { mulberry } from '../map.js';

// Jungle ruins: a stepped temple with a shrine on top in the middle, crumbling walls,
// a shallow stream that slows you down, and thick jungle around the edge.
const BOUNDS = { x0: -26, x1: 26, z0: -26, z1: 26 };

export default {
  id: 'ruins', name: 'Temple Ruins', short: 'Jungle', light: 'jungle',
  blurb: 'Overgrown temple. Hold the shrine, or wade the stream to flank.',
  thumb: 'jungle',
  build(K) {
    const { builder, B0, pushBoxGeo } = K;
    pushBoxGeo(-400, -0.5, -400, 400, 0, 400, 'jungleGrass');

    // edge: rock walls with jungle behind
    const X = BOUNDS.x1, Z = BOUNDS.z1;
    B0.box(-X - 1, 0, Z, X + 1, 3.5, Z + 1, 'stoneMoss');
    B0.box(-X - 1, 0, -Z - 1, X + 1, 3.5, -Z, 'stoneMoss');
    B0.box(X, 0, -Z, X + 1, 3.5, Z, 'stoneMoss');
    B0.box(-X - 1, 0, -Z, -X, 3.5, Z, 'stoneMoss');

    // ---------------- stepped temple (centre) ----------------
    const T1 = 1.6, T2 = 3.2;
    B0.box(-7.5, 0, -5.5, 7.5, T1, 5.5, 'stone');
    B0.box(-5, T1, -3.5, 5, T2, 3.5, 'stoneMoss');
    // shrine on top: doors on the north and south faces
    B0.wallX(2, -3, 3, T2, T2 + 2.6, 0.35, 'stoneDark', [{ a: -0.65, b: 0.65, lo: T2, hi: T2 + 2.2 }], null);
    B0.wallX(-2, -3, 3, T2, T2 + 2.6, 0.35, 'stoneDark', [{ a: -0.65, b: 0.65, lo: T2, hi: T2 + 2.2 }], null);
    B0.wallZ(3, -1.82, 1.82, T2, T2 + 2.6, 0.35, 'stoneDark', [{ a: -0.5, b: 0.5, lo: T2 + 1.1, hi: T2 + 1.8 }], null);
    B0.wallZ(-3, -1.82, 1.82, T2, T2 + 2.6, 0.35, 'stoneDark', [{ a: -0.5, b: 0.5, lo: T2 + 1.1, hi: T2 + 1.8 }], null);
    B0.box(-3.4, T2 + 2.6, -2.4, 3.4, T2 + 3.0, 2.4, 'stone');
    B0.box(-2.6, T2 + 3.0, -1.6, 2.6, T2 + 3.4, 1.6, 'stoneMoss');
    B0.box(-0.4, T2, -0.4, 0.4, T2 + 0.9, 0.4, 'stoneDark');
    B0.geo('gold', new THREE.OctahedronGeometry(0.3, 0), 0, T2 + 1.25, 0);

    for (const s of [1, -1]) {
      const B = builder(s);
      // temple stairs: a wide flight to the first tier, a narrow one on to the shrine
      B.stairs(1.5, 5.5, 5.5, 8.6, 0, T1, 'z-', 'stoneDark');
      B.stairs(1.5, 3.5, 3.5, 5.5, T1, T2, 'z-', 'stoneDark');
      // corner pillars on the first tier
      for (const [x, z] of [[-7, 5]]) B.box(x - 0.4, T1, z - 0.4, x + 0.4, T1 + 2.6, z + 0.4, 'stoneDark');
      B.box(6.6, T1, 4.6, 7.4, T1 + 2.6, 5.4, 'stoneDark');
      // braziers
      B.box(-1.2, T1, 4.2, -0.6, T1 + 0.8, 4.8, 'stoneDark');
      B.lamp(-6.8, 7.2, 2.8, 0xffa040);

      // stream (slows you down) with stepping stones
      B.box(-26, 0, 11.2, 26, 0.05, 13.6, 'water', { collide: false });
      B.box(-26, 0, 11.0, 26, 0.03, 13.8, 'mud', { collide: false });
      for (const [x, z] of [[-9, 11.7], [-8.2, 12.9], [10.5, 12.0], [11.2, 13.2], [20, 12.4]]) {
        B.box(x - 0.45, 0, z - 0.4, x + 0.45, 0.3, z + 0.4, 'stoneDark');
      }

      // crumbling walls
      B.box(-20, 0, 16.6, -16.5, 3.0, 17.2, 'stoneMoss');
      B.box(-16.5, 0, 16.6, -14.6, 1.8, 17.2, 'stone');
      B.box(-14.6, 0, 16.6, -12.0, 2.6, 17.2, 'stoneMoss');
      B.box(-10.6, 0, 16.6, -8.5, 1.2, 17.2, 'stone');
      B.box(7.0, 0, 7.0, 7.6, 1.3, 10.5, 'stone');
      B.box(13.5, 0, 6.0, 18.5, 2.4, 6.6, 'stoneMoss');
      B.box(13.5, 0, 6.6, 14.1, 2.4, 9.5, 'stoneMoss');
      B.box(-24.5, 0, 6.5, -19.5, 1.2, 7.1, 'stone');

      // small temple house with a half-collapsed roof
      const X0 = -22, X1 = -15, Z0 = 19, Z1 = 24.5;
      B.wallX(Z0, X0, X1, 0, 3.4, 0.4, 'stone', [{ a: -19.2, b: -17.8, lo: 0, hi: 2.4 }], null);
      B.wallZ(X1, Z0 + 0.2, Z1, 0, 3.4, 0.4, 'stone', [{ a: 21, b: 22.4, lo: 0, hi: 2.4 }], null);
      B.wallZ(X0, Z0 + 0.2, Z1, 0, 3.4, 0.4, 'stone', [{ a: 20.5, b: 22, lo: 1.1, hi: 2.0 }], null);
      B.box(X0 - 0.3, 3.4, Z0 - 0.3, -18.4, 3.75, Z1, 'stoneDark');
      B.box(-17.5, 0, 22.5, -16.2, 0.7, 23.4, 'stoneDark', { mm: '#55524a' });
      B.geo('gold', new THREE.IcosahedronGeometry(0.25, 0), -16.85, 0.95, 22.95);

      // giant stone head
      B.box(15.5, 0, 18.5, 19.5, 3.6, 21.8, 'stoneMoss');
      B.box(16.2, 1.6, 18.3, 16.9, 2.1, 18.5, 'dark', { collide: false });
      B.box(18.1, 1.6, 18.3, 18.8, 2.1, 18.5, 'dark', { collide: false });
      B.box(16.6, 0.5, 18.3, 18.4, 0.9, 18.5, 'stoneDark', { collide: false });
      B.box(15.3, 3.6, 18.3, 19.7, 4.2, 22, 'stoneDark');

      // fallen columns and standing pillars
      B.geo('stone', K.cyl, 5, 0.5, 16.5, 0, 0, Math.PI / 2, 0.5, 4.5, 0.5);
      B.box(2.75, 0, 16.05, 7.25, 1.0, 16.95, 'stone', { render: false });
      B.geo('stone', K.cyl, -6, 0.5, 21, Math.PI / 2, 0.4, 0, 0.5, 4, 0.5);
      B.box(-6.9, 0, 19.2, -5.1, 1.0, 22.8, 'stone', { render: false });
      for (const [x, z, h] of [[9, 9, 4.2], [22, 9.5, 3.4], [-12, 9, 4.6], [0, 23, 3.0]]) {
        B.geo('stoneMoss', K.cyl, x, h / 2, z, 0, 0, 0, 0.45, h, 0.45);
        B.box(x - 0.4, 0, z - 0.4, x + 0.4, h, z + 0.4, 'stoneMoss', { render: false });
      }
      B.rock(-3.5, 15, 1.1, 'stoneDark');
      B.rock(23.5, 22.5, 1.3, 'stoneDark');
      B.rock(-24, 13, 1.0, 'stoneDark');

      // jungle
      B.tree(-24, 24, 1.3); B.tree(10, 23.5, 1.2); B.tree(24, 3, 1.1); B.tree(-14, 10.5, 0.9); B.tree(-23.5, -1.5, 1.0);
      B.palm(19, 15.6, 1.0, 0.16); B.palm(-1, 18.6, 0.9, -0.14);
      for (const [x, z, sc] of [[-11, 21, 1.3], [7, 20.5, 1.1], [21, 1, 1.0], [-19, 10, 1.2], [3, 12.5, 0.9], [-25, 18, 1.4], [12, 3.5, 1.0], [-10, 4, 0.9]]) B.bush(x, z, sc);
    }

    // far jungle
    const rng = mulberry(23);
    for (let i = 0; i < 80; i++) {
      const a = rng() * Math.PI * 2, r = 32 + rng() * 50;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (rng() < 0.3) B0.palm(x, z, 1 + rng() * 0.6, (rng() - 0.5) * 0.4, false);
      else B0.tree(x, z, 1.3 + rng() * 1.2, false);
    }
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + rng() * 0.2, r = 130 + rng() * 50;
      B0.geo('hill', new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), Math.cos(a) * r, -2, Math.sin(a) * r, 0, 0, 0, 40 + rng() * 40, 35 + rng() * 30, 40 + rng() * 30);
    }

    return {
      bounds: BOUNDS,
      spawnsSouth: [[-24, 21.5], [-11, 24], [-2, 21.5], [8, 24], [13, 21], [24, 14.5], [22.5, 4.5], [-23, 3.5], [-8, 15]],
      openSpawn: [-11, 24],
      navSouth: [
        [6.2, T1, 0], [6.2, T1, 4.6], [0, T1, 4.6], [-4.5, T1, 4.6], [-6.2, T1, 2.5], [4.5, T1, 4.6],
        [0, T2, 2.75], [4.1, T2, 2.75], [-4.1, T2, 2.75], [4.1, T2, 0], [0, T2, 1.25], [-1.6, T2, 0.9],
      ],
      navLinks: [
        [[4.5, 0, 9.3], [4.5, T1, 4.9]],
        [[2.5, 0, 9.3], [2.5, T2, 3.0]],
        [[2.5, T2, 3.0], [0, T2, 2.75]],
        [[4.5, T1, 4.9], [4.5, T1, 4.6]],
      ],
      pickupsSouth: [
        { type: 'speed', x: 20, z: 2 },
        { type: 'health', x: -18.5, z: 22.5 },
        { type: 'armor', x: 6.2, y: T1, z: 2.5 },
      ],
      pickupsCentre: [{ type: 'damage', x: 0, y: T2, z: 1.0 }],
      zones: [
        { type: 'water', x0: -26, z0: 11.2, x1: 26, z1: 13.6 },
        { type: 'water', x0: -26, z0: -13.6, x1: 26, z1: -11.2 },
      ],
      weather: 'leaves',
      menuCam: { r: 42, h: 18 },
      mmBase(g, tx, tz, S, W, Hh) {
        g.fillStyle = '#4f7a3a'; g.fillRect(0, 0, W, Hh);
        g.fillStyle = '#3f8fa0'; g.fillRect(0, tz(11.2), W, 2.4 * S); g.fillRect(0, tz(-13.6), W, 2.4 * S);
        g.fillStyle = '#8a8574'; g.fillRect(tx(-7.5), tz(-5.5), 15 * S, 11 * S);
        g.fillStyle = '#6f7a5a'; g.fillRect(tx(-5), tz(-3.5), 10 * S, 7 * S);
      },
    };
  },
};
