import * as THREE from 'three';
import { mulberry } from '../map.js';

// Arctic research base: a slippery frozen lake with an ice-fishing hut in the middle,
// raised research stations, and container stacks you can walk on top of.
const BOUNDS = { x0: -28, x1: 28, z0: -24, z1: 24 };

export default {
  id: 'frostbite', name: 'Frostbite', short: 'Snow', light: 'snow',
  blurb: 'Arctic base. Slide across the frozen lake, fight from the container stacks.',
  thumb: 'snowy',
  build(K) {
    const { builder, B0, pushBoxGeo } = K;
    pushBoxGeo(-400, -0.5, -400, 400, 0, 400, 'snow');
    const half = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);

    // perimeter: chain-link style fence (bullets pass) on posts
    const X = BOUNDS.x1, Z = BOUNDS.z1;
    for (const [x0, z0, x1, z1] of [[-X, Z, X, Z], [-X, -Z, X, -Z], [X, -Z, X, Z], [-X, -Z, -X, Z]]) {
      if (z0 === z1) B0.box(x0, 0, z0 - 0.05, x1, 2.4, z0 + 0.05, 'grate', { noRay: true });
      else B0.box(x0 - 0.05, 0, z0, x0 + 0.05, 2.4, z1, 'grate', { noRay: true });
    }
    for (let x = -X; x <= X; x += 4) for (const z of [Z, -Z]) B0.box(x - 0.08, 0, z - 0.08, x + 0.08, 2.6, z + 0.08, 'steel', { collide: false });

    // ---------------- frozen lake + fishing hut (centre) ----------------
    B0.box(-10, 0, -4.8, 10, 0.02, 4.8, 'ice', { collide: false });
    B0.box(-10.6, 0, -5.2, 10.6, 0.015, 5.2, 'snowHill', { collide: false });
    B0.wallZ(1.6, -1.6, 1.6, 0, 2.6, 0.15, 'hutRed', [{ a: -0.6, b: 0.6, lo: 0, hi: 2.1 }], 'white');
    B0.wallZ(-1.6, -1.6, 1.6, 0, 2.6, 0.15, 'hutRed', [{ a: -0.6, b: 0.6, lo: 0, hi: 2.1 }], 'white');
    B0.wallX(1.6, -1.6, 1.6, 0, 2.6, 0.15, 'hutRed', [{ a: -0.7, b: 0.7, lo: 1.1, hi: 1.8 }], 'white');
    B0.wallX(-1.6, -1.6, 1.6, 0, 2.6, 0.15, 'hutRed', [{ a: -0.7, b: 0.7, lo: 1.1, hi: 1.8 }], 'white');
    B0.box(-1.9, 2.6, -1.9, 1.9, 2.8, 1.9, 'snowCap');
    B0.geo('dark', new THREE.CylinderGeometry(0.35, 0.35, 0.03, 12), 0, 0.02, 0);

    for (const s of [1, -1]) {
      const B = builder(s);
      const station = s > 0 ? 'hutRed' : 'hutGrey';

      // ---- research station (raised on a foundation) ----
      const X0 = -22, X1 = -10, Z0 = 10, Z1 = 17.5, F = 1.2, TOP = 4.4, T = 0.25;
      B.box(X0, 0, Z0, X1, F, Z1, 'concreteDark');
      B.box(X0 + 0.1, F, Z0 + 0.1, X1 - 0.1, F + 0.03, Z1 - 0.1, 'woodFloor', { collide: false });
      B.wallX(Z0, X0, X1, F, TOP, T, station, [
        { a: -13.1, b: -11.7, lo: F, hi: F + 2.3 }, { a: -19.5, b: -16.5, lo: F + 1.0, hi: F + 2.2 },
      ]);
      B.wallX(Z1, X0, X1, F, TOP, T, station, [{ a: -18, b: -15, lo: F + 1.0, hi: F + 2.2 }]);
      B.wallZ(X0, Z0 + T / 2, Z1 - T / 2, F, TOP, T, station, [{ a: 13.9, b: 15.3, lo: F, hi: F + 2.3 }]);
      B.wallZ(X1, Z0 + T / 2, Z1 - T / 2, F, TOP, T, station, [{ a: 12.5, b: 15, lo: F + 1.0, hi: F + 2.2 }]);
      B.wallZ(-16, 10.1, 15.2, F, TOP, 0.15, 'interior', [{ a: 11.2, b: 12.4, lo: F, hi: F + 2.3 }], null);
      B.box(X0 - 0.4, TOP, Z0 - 0.4, X1 + 0.4, TOP + 0.25, Z1 + 0.4, 'snowCap');
      B.stairs(-13.1, 7.4, -11.7, 9.9, 0, F, 'z+', 'steel');
      B.stairs(-24.4, 13.9, -22.1, 15.3, 0, F, 'x+', 'steel');
      // desks and lab benches
      B.box(-21.5, F, 16.3, -17.5, F + 0.95, 17.2, 'counter');
      B.box(-14.5, F, 16.4, -10.6, F + 0.95, 17.2, 'counter');
      B.box(-20.5, F, 11.0, -18.8, F + 0.8, 12.2, 'metal');
      B.box(-15, F, 13.2, -13.4, F + 1.8, 13.8, 'steel');
      // satellite dish on the roof
      B.geo('white', new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2.5), -19, TOP + 1.4, 14, -0.8, 0.6, 0, 1.4, 0.6, 1.4);
      B.box(-19.1, TOP, 13.9, -18.9, TOP + 1.3, 14.1, 'metal', { collide: false });

      // ---- container yard: a walkable open container stacked on a closed one ----
      B.container(9, 11.5, true, 'contRed');
      B.container(9, 11.5, true, s > 0 ? 'contBlue' : 'contOrange', 2.6, true);
      B.stairs(12.1, 10.45, 16.2, 11.65, 0, 2.6, 'x-', 'steel');
      B.container(17.2, 19.2, false, 'contGreen');
      B.container(22.5, 5.5, true, 'contOrange', 0, true);
      B.box(5.95, 5.2, 10.28, 12.05, 5.3, 12.72, 'snowCap', { collide: false });

      // ---- fuel tanks ----
      for (const [x, z] of [[-4.5, 20], [-0.6, 21.6]]) {
        B.geo('tank', K.cyl, x, 2.0, z, 0, 0, 0, 1.6, 4.0, 1.6);
        B.geo('snowCap', half, x, 4.0, z, 0, 0, 0, 1.62, 0.4, 1.62);
        B.box(x - 1.3, 0, z - 1.3, x + 1.3, 4.0, z + 1.3, 'tank', { render: false });
      }
      B.box(-3.8, 0, 19.3, 0.2, 0.4, 19.6, 'pipe');

      // ---- snow banks around the lake (cover) ----
      for (const [x, z, w] of [[-6.5, 6.8, 2.2], [3.5, 7.2, 1.8], [14.5, 5.8, 2.0], [-17, 5.0, 2.4], [25, 15, 1.6]]) {
        B.geo('snowHill', half, x, 0, z, 0, 0, 0, w, 1.15, 0.9);
        B.box(x - w * 0.8, 0, z - 0.6, x + w * 0.8, 1.05, z + 0.6, 'snowHill', { render: false, mm: '#d8e2ea' });
      }
      B.crate(-6, 15, 1.2); B.crate(-7.2, 15.6, 1.0);
      B.crate(24.5, 21.5, 1.2);
      B.barrel(19.5, 13.5, 0, 'contBlue'); B.barrel(20.3, 14.2, 0, 'contBlue');
      B.pine(-25, 22, 1.1, true, true);
      B.pine(11.5, 23, 0.9, true, true);
      B.pine(26, 1.5, 1.0, true, true);
      B.lamp(-8.6, 8.4, 3.8);
      B.lamp(16.5, 9, 3.8);
      // snowmobile
      B.box(1.5, 0.2, 13.0, 3.6, 0.85, 13.9, 'carRed');
      B.box(2.6, 0.85, 13.1, 3.4, 1.15, 13.8, 'black', { collide: false });
      B.box(1.2, 0, 12.9, 3.9, 0.08, 14.0, 'steel', { collide: false });
    }

    // far scenery: snowy hills, pines, a radio mast
    const rng = mulberry(5);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + rng() * 0.2, r = 120 + rng() * 60;
      B0.geo('snowHill', half, Math.cos(a) * r, -2, Math.sin(a) * r, 0, 0, 0, 50 + rng() * 40, 25 + rng() * 30, 40 + rng() * 30);
    }
    for (let i = 0; i < 60; i++) {
      const a = rng() * Math.PI * 2, r = 36 + rng() * 45;
      B0.pine(Math.cos(a) * r * 1.1, Math.sin(a) * r, 1 + rng() * 0.9, false, true);
    }
    for (let i = 0; i < 10; i++) {
      const w = 1.4 - i * 0.12;
      B0.box(-42 - w, i * 3, 30 - w, -42 + w, i * 3 + 3, 30 + w, i % 2 ? 'towerRed' : 'towerWhite', { collide: false });
    }

    return {
      bounds: BOUNDS,
      spawnsSouth: [[-24, 21], [-15, 21], [-7, 21.5], [4, 21], [14, 22], [24.5, 18], [25, 3], [-25, 6], [-8, 9]],
      openSpawn: [-15, 21],
      navSouth: [
        [-20.5, 1.2, 12], [-17.5, 1.2, 12], [-14, 1.2, 12], [-11.5, 1.2, 12],
        [-20.5, 1.2, 15.6], [-17.5, 1.2, 15.6], [-14, 1.2, 15.6], [-11.5, 1.2, 15.6],
        [7, 2.72, 11.5], [10.5, 2.72, 11.5],
      ],
      navLinks: [
        [[-12.4, 0, 6.7], [-12.4, 1.2, 11.0]],
        [[-25.1, 0, 14.6], [-21.0, 1.2, 14.6]],
        [[16.9, 0, 11.05], [11.5, 2.72, 11.05]],
        [[-12.4, 1.2, 11.0], [-11.5, 1.2, 12]],
        [[-21.0, 1.2, 14.6], [-20.5, 1.2, 15.6]],
        [[11.5, 2.72, 11.05], [10.5, 2.72, 11.5]],
      ],
      pickupsSouth: [
        { type: 'speed', x: 6, z: -1.5 },
        { type: 'health', x: -19, z: 13.8, y: 1.2 },
        { type: 'armor', x: 8, z: 11.5, y: 2.72 },
      ],
      pickupsCentre: [{ type: 'damage', x: 0, z: 0 }],
      zones: [{ type: 'ice', x0: -10, z0: -4.8, x1: 10, z1: 4.8 }],
      weather: 'snow',
      menuCam: { r: 44, h: 17 },
      mmBase(g, tx, tz, S, W, Hh) {
        g.fillStyle = '#dfe7ee'; g.fillRect(0, 0, W, Hh);
        g.fillStyle = '#a9d2e4'; g.fillRect(tx(-10), tz(-4.8), 20 * S, 9.6 * S);
        g.fillStyle = '#6a7680';
        g.fillRect(tx(-22), tz(10), 12 * S, 7.5 * S); g.fillRect(tx(10), tz(-17.5), 12 * S, 7.5 * S);
      },
    };
  },
};
