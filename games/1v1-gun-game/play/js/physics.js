// Axis-aligned box world. Every solid thing in the map is an AABB, which keeps
// movement, bullets and line-of-sight cheap and exact.

export const GRAVITY = 22;
const EPS = 0.001;
const STEP = 0.5;

export const world = { boxes: [] };

export function resetWorld() { world.boxes.length = 0; }

export function addCollider(x0, y0, z0, x1, y1, z1, opts = {}) {
  const b = {
    min: { x: Math.min(x0, x1), y: Math.min(y0, y1), z: Math.min(z0, z1) },
    max: { x: Math.max(x0, x1), y: Math.max(y0, y1), z: Math.max(z0, z1) },
    noRay: !!opts.noRay, // movement-only: bullets and sight pass through
    mm: opts.mm || null,
    tag: opts.tag || null,
  };
  world.boxes.push(b);
  return b;
}

function overlap(x, y, z, hw, h, b) {
  return x + hw > b.min.x && x - hw < b.max.x &&
         z + hw > b.min.z && z - hw < b.max.z &&
         y + h > b.min.y && y < b.max.y;
}

export function bodyBlocked(x, y, z, hw, h) {
  const bs = world.boxes;
  for (let i = 0; i < bs.length; i++) if (overlap(x, y, z, hw, h, bs[i])) return bs[i];
  return null;
}

function stepAxis(body, ax, d) {
  if (d === 0) return;
  const p = body.pos;
  p[ax] += d;
  const bs = world.boxes;
  for (let i = 0; i < bs.length; i++) {
    const b = bs[i];
    if (!overlap(p.x, p.y, p.z, body.hw, body.h, b)) continue;
    const rise = b.max.y - p.y;
    if (rise > 0 && rise <= STEP && body.onGround &&
        !bodyBlocked(p.x, b.max.y + EPS, p.z, body.hw, body.h)) {
      p.y = b.max.y + EPS;
      continue;
    }
    p[ax] = d > 0 ? b.min[ax] - body.hw - EPS : b.max[ax] + body.hw + EPS;
    body.vel[ax] = 0;
    body.hitWall = true;
  }
}

// body: { pos, vel, hw, h, onGround, hitWall }  (pos is the feet position)
export function moveBody(body, dt) {
  const v = body.vel;
  const dx = v.x * dt, dz = v.z * dt;
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dz)) / 0.08));
  body.hitWall = false;
  for (let i = 0; i < n; i++) {
    stepAxis(body, 'x', dx / n);
    stepAxis(body, 'z', dz / n);
  }

  v.y -= GRAVITY * dt;
  const dy = v.y * dt;
  const ny = Math.max(1, Math.ceil(Math.abs(dy) / 0.2));
  const p = body.pos;
  body.onGround = false;
  const bs = world.boxes;
  for (let s = 0; s < ny; s++) {
    p.y += dy / ny;
    let stopped = false;
    for (let i = 0; i < bs.length; i++) {
      const b = bs[i];
      if (!overlap(p.x, p.y, p.z, body.hw, body.h, b)) continue;
      if (dy <= 0) { p.y = b.max.y; body.onGround = true; }
      else p.y = b.min.y - body.h - EPS;
      v.y = 0;
      stopped = true;
    }
    if (stopped) break;
  }
}

// Ray vs AABB slab test. Returns entry distance and the hit face normal.
const AX = ['x', 'y', 'z'];
export function rayBox(o, d, b, maxT) {
  let tmin = 0, tmax = maxT, nAxis = -1, nSign = 0;
  for (let k = 0; k < 3; k++) {
    const a = AX[k];
    if (Math.abs(d[a]) < 1e-9) {
      if (o[a] < b.min[a] || o[a] > b.max[a]) return null;
      continue;
    }
    const inv = 1 / d[a];
    let t1 = (b.min[a] - o[a]) * inv, t2 = (b.max[a] - o[a]) * inv, s = -1;
    if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; s = 1; }
    if (t1 > tmin) { tmin = t1; nAxis = k; nSign = s; }
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return null;
  }
  if (nAxis < 0) return null; // origin inside the box
  return { t: tmin, axis: nAxis, sign: nSign };
}

export function raycastWorld(o, d, maxDist) {
  let best = null;
  const bs = world.boxes;
  for (let i = 0; i < bs.length; i++) {
    const b = bs[i];
    if (b.noRay) continue;
    const h = rayBox(o, d, b, best ? best.t : maxDist);
    if (h && (!best || h.t < best.t)) { best = h; best.box = b; }
  }
  if (!best) return null;
  const n = { x: 0, y: 0, z: 0 };
  n[AX[best.axis]] = best.sign;
  return {
    t: best.t,
    point: { x: o.x + d.x * best.t, y: o.y + d.y * best.t, z: o.z + d.z * best.t },
    normal: n,
    box: best.box,
  };
}

// True when nothing visible blocks the segment a->b.
export function lineOfSight(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
  const len = Math.hypot(dx, dy, dz);
  if (len < 1e-4) return true;
  const d = { x: dx / len, y: dy / len, z: dz / len };
  const bs = world.boxes;
  for (let i = 0; i < bs.length; i++) {
    if (bs[i].noRay) continue;
    if (rayBox(a, d, bs[i], len)) return false;
  }
  return true;
}
