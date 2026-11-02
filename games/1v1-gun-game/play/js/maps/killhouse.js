// Small training arena under neon lights: plywood rooms on each side, low cover in the open,
// and a raised overwatch platform in the centre reached by stairs or jump pads.
const BOUNDS = { x0: -20, x1: 20, z0: -20, z1: 20 };

export default {
  id: 'killhouse', name: 'Neon Killhouse', short: 'Arena', light: 'night',
  blurb: 'Tight training arena. Constant action, nowhere to hide for long.',
  thumb: 'killhouse',
  build(K) {
    const { builder, B0, pushBoxGeo } = K;
    pushBoxGeo(-400, -0.5, -400, 400, 0, 400, 'concreteDark');
    B0.box(-20, 0, -20, 20, 0.04, 20, 'slab', { collide: false });

    // outer walls with a neon strip along the top
    const X = BOUNDS.x1, Z = BOUNDS.z1, H = 4.5;
    B0.box(-X - 0.5, 0, Z, X + 0.5, H, Z + 0.5, 'concrete');
    B0.box(-X - 0.5, 0, -Z - 0.5, X + 0.5, H, -Z, 'concrete');
    B0.box(X, 0, -Z, X + 0.5, H, Z, 'concrete');
    B0.box(-X - 0.5, 0, -Z, -X, H, Z, 'concrete');

    // ---------------- overwatch platform (centre) ----------------
    const P = 3, PH = 2.5;
    B0.box(-P, PH - 0.2, -P, P, PH, P, 'grate');
    for (const [x, z] of [[-2.7, -2.7], [2.7, -2.7], [-2.7, 2.7], [2.7, 2.7]]) B0.box(x - 0.15, 0, z - 0.15, x + 0.15, PH - 0.2, z + 0.15, 'steel');
    B0.box(-0.8, 0, -0.8, 0.8, 1.1, 0.8, 'concreteDark'); // cover under the platform

    for (const s of [1, -1]) {
      const B = builder(s);
      const neon = s > 0 ? 'neonCyan' : 'neonPink';
      const mat = s > 0 ? 'matBlue' : 'matRed';

      // neon trim on this half's walls
      B.box(-X, H - 0.25, Z - 0.06, X, H - 0.1, Z, neon, { collide: false });
      B.box(X - 0.06, H - 0.25, 0, X, H - 0.1, Z, neon, { collide: false });
      B.box(-X, H - 0.25, 0, -X + 0.06, H - 0.1, Z, neon, { collide: false });
      B.box(-X, 0.04, 0, X, 0.06, Z, mat, { collide: false });

      // platform stairs + rails (rails only on the stair side; the sides are open for the jump pads)
      B.stairs(0.8, P, 2.2, 7.0, 0, PH, 'z-', 'steel');
      B.box(-P, PH, P - 0.06, 0.75, PH + 1.0, P, 'steel', { noRay: true });
      B.box(2.25, PH, P - 0.06, P, PH + 1.0, P, 'steel', { noRay: true });
      B.box(-P, PH + 0.95, P - 0.08, P, PH + 1.05, P, neon, { collide: false });
      B.box(5.6, 0, -0.7, 7.0, 0.06, 0.7, 'hazard', { collide: false });
      B.jumpPad(6.3, 0, -5.4, 11.2, 0);

      // room A
      B.wallX(8, -18, -8, 0, 3.0, 0.2, 'plywood', [{ a: -14.6, b: -13.2, lo: 0, hi: 2.3 }, { a: -11, b: -9.4, lo: 1.0, hi: 2.0 }], null);
      B.wallZ(-8, 8.1, 16, 0, 3.0, 0.2, 'plywood', [{ a: 11.5, b: 12.9, lo: 0, hi: 2.3 }], null);
      B.wallX(16, -12, -8, 0, 3.0, 0.2, 'plywood', [], null);
      B.wallZ(-13, 12, 20, 0, 3.0, 0.2, 'plywoodDark', [{ a: 15.4, b: 16.8, lo: 0, hi: 2.3 }], null);
      B.box(-17.5, 0, 9, -15.5, 1.1, 10.2, 'plywoodDark');
      B.box(-10.5, 0, 17.6, -9.0, 1.8, 19.5, 'crate');
      B.box(-7.9, 2.2, 13.8, -7.84, 2.9, 14.6, 'target', { collide: false });

      // room B (L-shaped)
      B.wallX(10, 3, 12, 0, 3.0, 0.2, 'plywood', [{ a: 6.6, b: 8.0, lo: 0, hi: 2.3 }], null);
      B.wallZ(12, 10.1, 17, 0, 3.0, 0.2, 'plywood', [{ a: 13.4, b: 14.8, lo: 1.0, hi: 2.0 }], null);
      B.wallZ(3, 10.1, 14, 0, 3.0, 0.2, 'plywood', [], null);
      B.box(9.5, 0, 15.3, 11.6, 0.9, 16.4, 'plywoodDark');
      B.box(3.12, 2.0, 11.6, 3.16, 2.8, 12.4, 'target', { collide: false });

      // open-area cover
      B.box(-5.5, 0, 4.5, -3.0, 1.15, 5.1, 'concreteDark');
      B.box(8.5, 0, 3.6, 9.1, 3.0, 6.6, 'plywood');
      B.box(13.5, 0, 6.5, 16.5, 1.15, 7.1, 'concreteDark');
      B.box(15.8, 0, 1.0, 16.4, 2.4, 3.5, 'plywoodDark');
      B.box(-16, 0, 2.5, -13.5, 1.15, 3.1, 'concreteDark');
      B.box(-10, 0, 0.5, -9.4, 3.0, 4.0, 'plywood');
      B.crate(17.5, 18, 1.2); B.crate(18.2, 16.8, 1.0);
      B.crate(-2.5, 16, 1.2);
      B.barrel(5.5, 18.5, 0, mat === 'matBlue' ? 'contBlue' : 'contRed');
      // neon light bars on the floor edge of each cover wall
      B.box(-5.5, 1.15, 4.75, -3.0, 1.2, 4.85, neon, { collide: false });
      B.box(13.5, 1.15, 6.75, 16.5, 1.2, 6.85, neon, { collide: false });
      B.lamp(-18.5, 0.5, 3.6, s > 0 ? 0x5fd8ff : 0xff6fb8);
      B.lamp(18.5, 12, 3.6, s > 0 ? 0x5fd8ff : 0xff6fb8);
    }

    return {
      bounds: BOUNDS,
      navStep: 2,
      spawnsSouth: [[-16, 17.5], [-10.5, 11], [-5.5, 18], [6.5, 16], [16, 18.5], [17.8, 9], [-17.5, 5.5], [11, 6], [-1, 9.5]],
      openSpawn: [-16, 17.5],
      navSouth: [[0, PH, 0], [1.6, PH, 2.2], [-2, PH, 2], [2.2, PH, -1.5], [-2.2, PH, 0]],
      navLinks: [[[1.5, 0, 7.6], [1.5, PH, 2.4]]],
      pickupsSouth: [
        { type: 'speed', x: -18, z: 0.5 },
        { type: 'health', x: -16.5, z: 14 },
        { type: 'armor', x: 7.5, z: 13.5 },
      ],
      pickupsCentre: [{ type: 'damage', x: 0, y: PH, z: 0 }],
      weather: null,
      menuCam: { r: 30, h: 16 },
      mmBase(g, tx, tz, S, W, Hh) {
        g.fillStyle = '#45484e'; g.fillRect(0, 0, W, Hh);
        g.fillStyle = 'rgba(42,79,138,0.6)'; g.fillRect(tx(-20), tz(0), 40 * S, 20 * S);
        g.fillStyle = 'rgba(154,42,42,0.6)'; g.fillRect(tx(-20), tz(-20), 40 * S, 20 * S);
        g.fillStyle = '#7a838c'; g.fillRect(tx(-3), tz(-3), 6 * S, 6 * S);
      },
    };
  },
};
