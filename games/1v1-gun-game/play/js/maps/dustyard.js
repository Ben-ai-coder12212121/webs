import * as THREE from 'three';
import { mulberry } from '../map.js';

// Desert outpost: adobe barracks with roof access on each side, a market street, and a
// central watchtower you reach by stairs or by the jump pads.
const BOUNDS = { x0: -27, x1: 27, z0: -24, z1: 24 };

export default {
  id: 'dustyard', name: 'Dust Yard', short: 'Desert', light: 'desert',
  blurb: 'Sun-baked outpost. Rooftops, a market street and a central watchtower.',
  thumb: 'desert',
  build(K) {
    const { builder, B0, pushBoxGeo } = K;
    pushBoxGeo(-400, -0.5, -400, 400, 0, 400, 'sand');

    // perimeter compound wall
    const H = 3.2, X = BOUNDS.x1, Z = BOUNDS.z1;
    B0.box(-X - 0.4, 0, Z, X + 0.4, H, Z + 0.4, 'adobeDark');
    B0.box(-X - 0.4, 0, -Z - 0.4, X + 0.4, H, -Z, 'adobeDark');
    B0.box(X, 0, -Z, X + 0.4, H, Z, 'adobeDark');
    B0.box(-X - 0.4, 0, -Z, -X, H, Z, 'adobeDark');
    for (let x = -X; x <= X; x += 3) for (const z of [Z + 0.2, -Z - 0.2]) B0.box(x - 0.5, H, z - 0.25, x + 0.5, H + 0.45, z + 0.25, 'adobeDark', { collide: false });

    // ---------------- central watchtower (point-symmetric, built once) ----------------
    const P = 2.4, TOP = 4.5;
    for (const [x, z] of [[-1.9, -1.9], [1.9, -1.9], [-1.9, 1.9], [1.9, 1.9]]) B0.box(x - 0.22, 0, z - 0.22, x + 0.22, TOP, z + 0.22, 'palmTrunk');
    B0.box(-P, TOP - 0.25, -P, P, TOP, P, 'wood');
    for (const s of [1, -1]) {
      const B = builder(s);
      // parapet with a gap where the stairs arrive (x 0.9..2.3)
      B.box(-P, TOP, P - 0.15, 0.85, TOP + 1.0, P, 'wood');
      B.box(P - 0.15, TOP, -P, P, TOP + 1.0, -0.6, 'wood');
      B.box(P - 0.15, TOP, 0.6, P, TOP + 1.0, P, 'wood');
      // stairs up the south face
      B.stairs(0.95, 2.45, 2.25, 8.2, 0, TOP, 'z-', 'wood');
      // canopy posts
      B.box(P - 0.3, TOP, P - 0.3, P - 0.1, 7.7, P - 0.1, 'palmTrunk', { collide: false });
      B.box(-P + 0.1, TOP, P - 0.3, -P + 0.3, 7.7, P - 0.1, 'palmTrunk', { collide: false });
      // jump pad that throws you onto the tower
      B.box(3.0, 0, 3.0, 4.4, 0.08, 4.4, 'hazard', { collide: false });
      B.jumpPad(3.7, 3.7, -3.3, 15.2, -3.3);
    }
    B0.box(-P - 0.3, 7.7, -P - 0.3, P + 0.3, 7.85, P + 0.3, 'canvasRed');
    B0.crate(0, 0, 1.2);
    B0.crate(-0.9, -0.2, 0.8);
    B0.crate(0.9, 0.2, 0.8);

    // ---------------- one half (mirrored) ----------------
    for (const s of [1, -1]) {
      const B = builder(s);
      const awning = s > 0 ? 'canvasBlue' : 'canvasRed';

      // barracks
      const X0 = -20, X1 = -9, Z0 = 9, Z1 = 17, T = 0.3, RH = 3.4;
      B.box(X0, 0, Z0, X1, 0.04, Z1, 'wood', { collide: false });
      B.wallX(Z0, X0, X1, 0, RH, T, 'adobe', [
        { a: -15.6, b: -14.2, lo: 0, hi: 2.4 }, { a: -19, b: -17.4, lo: 1.0, hi: 2.2 }, { a: -12.5, b: -10.5, lo: 1.0, hi: 2.2 },
      ], 'adobeDark');
      B.wallX(Z1, X0, X1, 0, RH, T, 'adobe', [{ a: -12.5, b: -11.1, lo: 0, hi: 2.4 }, { a: -18, b: -16, lo: 1.0, hi: 2.2 }], 'adobeDark');
      B.wallZ(X0, Z0 + T / 2, Z1 - T / 2, 0, RH, T, 'adobe', [{ a: 13, b: 14.6, lo: 1.0, hi: 2.2 }], 'adobeDark');
      B.wallZ(X1, Z0 + T / 2, Z1 - T / 2, 0, RH, T, 'adobe', [{ a: 12.3, b: 13.7, lo: 0, hi: 2.4 }], 'adobeDark');
      B.wallZ(-14.6, 12.4, Z1 - T / 2, 0, RH, 0.2, 'adobeDark', [{ a: 14.2, b: 15.4, lo: 0, hi: 2.4 }], null);
      B.box(X0 - 0.15, RH, Z0 - 0.15, X1 + 0.15, RH + 0.2, Z1 + 0.15, 'adobeDark'); // roof slab
      // roof parapet with a gap above the outside stairs
      B.box(X0 - 0.15, RH + 0.2, Z0 - 0.15, X1 + 0.15, RH + 0.85, Z0 + 0.1, 'adobe');
      B.box(X0 - 0.15, RH + 0.2, Z1 - 0.1, X1 + 0.15, RH + 0.85, Z1 + 0.15, 'adobe');
      B.box(X1 - 0.1, RH + 0.2, Z0, X1 + 0.15, RH + 0.85, Z1, 'adobe');
      B.box(X0 - 0.15, RH + 0.2, 12.2, X0 + 0.1, RH + 0.85, Z1, 'adobe');
      B.stairs(-21.5, 10.0, -20.15, 16.6, 0, RH + 0.2, 'z-', 'adobeDark');
      // furniture
      B.box(-19.5, 0, 15.6, -16, 0.7, 16.6, 'wood');
      B.box(-13.4, 0, 9.6, -11.2, 0.9, 10.4, 'crate');
      B.crate(-10, 16, 1.0);
      B.box(-19.6, 0, 9.5, -18.6, 1.8, 11.5, 'wood');
      B.lamp(-14.9, 7.6, 3.6);

      // market street: stalls with awnings
      for (const x of [-21, -4, 13]) {
        B.box(x, 0, 5.2, x + 2.6, 0.95, 6.0, 'crate');
        B.box(x - 0.1, 2.5, 4.6, x + 2.7, 2.62, 6.8, awning, { collide: false });
        for (const px of [x - 0.05, x + 2.55]) B.box(px, 0, 6.5, px + 0.12, 2.5, 6.62, 'palmTrunk', { collide: false });
      }
      B.sandbags(-6.6, 2.4, -3.4, 3.2);
      B.sandbags(9.0, 7.0, 12.2, 7.8);
      B.sandbags(22.5, 1.0, 23.3, 4.2);

      // walled courtyard with a well
      B.box(7.5, 0, 11.6, 13.0, 1.25, 12.2, 'adobe');
      B.box(15.2, 0, 11.6, 21.0, 1.25, 12.2, 'adobe');
      B.box(20.4, 0, 12.2, 21.0, 1.25, 19.5, 'adobe');
      B.geo('stone', K.cyl, 14.5, 0.45, 16.5, 0, 0, 0, 1.0, 0.9, 1.0);
      B.box(13.7, 0, 15.7, 15.3, 0.9, 17.3, 'stone', { render: false });
      B.box(13.6, 0.9, 16.4, 15.4, 2.3, 16.6, 'palmTrunk', { collide: false });
      B.palm(9.5, 15, 1.0, 0.18);
      B.palm(18.5, 21.5, 1.1, -0.12);
      B.palm(-24.5, 21, 0.95, 0.15);

      // jeep
      {
        const cx = 2.5, cz = 16.5, c = 'jeep';
        B.box(cx - 2.0, 0.35, cz - 0.95, cx + 2.0, 1.25, cz + 0.95, c);
        B.box(cx - 0.4, 1.25, cz - 0.9, cx - 0.3, 1.85, cz + 0.9, 'glass', { collide: false });
        B.box(cx - 2.0, 1.25, cz - 0.95, cx - 1.9, 1.7, cz + 0.95, c, { collide: false });
        for (const [dx, dz] of [[-1.3, -0.95], [1.3, -0.95], [-1.3, 0.95], [1.3, 0.95]]) B.wheel(cx + dx, 0.4, cz + dz, 0.4, true);
      }
      // crate stacks
      B.crate(-1.5, 20.5, 1.3); B.crate(-0.2, 21.8, 1.3); B.crate(-0.85, 21.15, 1.0, 1.3);
      B.crate(24, 13, 1.2); B.crate(24.9, 14.3, 1.0);
      B.crate(-25, 2.5, 1.2);
      B.crate(6.5, 9.0, 1.1);
      B.barrel(-7.5, 13.5, 0, 'contRed'); B.barrel(-6.8, 14.3, 0, 'contBlue');
      B.lamp(5.5, 3.8, 4.0);
      B.lamp(22, 9.6, 3.6);
    }

    // far scenery: dunes and mesas
    const rng = mulberry(11);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + rng() * 0.2, r = 110 + rng() * 60;
      B0.geo('dune', new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), Math.cos(a) * r, -1, Math.sin(a) * r, 0, 0, 0, 40 + rng() * 40, 10 + rng() * 18, 30 + rng() * 25);
    }
    for (let i = 0; i < 6; i++) {
      const a = rng() * Math.PI * 2, r = 70 + rng() * 40;
      B0.geo('adobeDark', new THREE.CylinderGeometry(1, 1.25, 1, 7), Math.cos(a) * r, 8, Math.sin(a) * r, 0, rng() * 3, 0, 8 + rng() * 8, 16 + rng() * 10, 8 + rng() * 8);
    }
    for (let i = 0; i < 14; i++) {
      const a = rng() * Math.PI * 2, r = 34 + rng() * 25;
      B0.palm(Math.cos(a) * r, Math.sin(a) * r, 0.9 + rng() * 0.4, (rng() - 0.5) * 0.4, false);
    }

    return {
      bounds: BOUNDS,
      spawnsSouth: [[-23, 20], [-16, 21], [-6, 21], [5, 21.5], [14, 21], [23, 19], [-24, 6], [24, 9], [-3, 12]],
      openSpawn: [-16, 21],
      navSouth: [
        [1.6, TOP, 1.6], [-1.6, TOP, 1.6], [0, TOP, 0],
        [-18.5, 3.6, 11], [-14, 3.6, 11], [-10.5, 3.6, 11], [-18.5, 3.6, 15.5], [-14, 3.6, 15.5], [-10.5, 3.6, 15.5],
      ],
      navLinks: [
        [[1.6, 0, 8.9], [1.6, TOP, 1.9]],
        [[-20.8, 0, 17.3], [-20.8, 3.6, 10.6]],
        [[-20.8, 3.6, 10.6], [-18.5, 3.6, 11]],
      ],
      pickupsSouth: [
        { type: 'speed', x: 21, z: 3 },
        { type: 'health', x: -17, z: 13.5 },
        { type: 'armor', x: -24, z: 22 },
      ],
      pickupsCentre: [{ type: 'damage', x: 0, y: TOP, z: 0 }],
      weather: 'dust',
      menuCam: { r: 44, h: 18 },
      mmBase(g, tx, tz, S, W, Hh) {
        g.fillStyle = '#c9a46a'; g.fillRect(0, 0, W, Hh);
        g.fillStyle = '#b48f5a'; g.fillRect(0, tz(-7), W, 14 * S);
        g.fillStyle = '#7a5a3a';
        g.fillRect(tx(-2.4), tz(-2.4), 4.8 * S, 4.8 * S);
        g.fillRect(tx(-20), tz(9), 11 * S, 8 * S); g.fillRect(tx(9), tz(-17), 11 * S, 8 * S);
      },
    };
  },
};
