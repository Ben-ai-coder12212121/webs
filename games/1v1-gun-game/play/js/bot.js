import * as THREE from 'three';
import { lineOfSight, world, rayBox } from './physics.js';
import { angleDiff, yawTo, rand, clamp } from './util.js';
import { WEAPONS } from './weapons.js';

export const DIFFICULTY = {
  easy:    { label: 'Easy',    react: 0.8,  turn: 3.2, err: 0.085, burst: [0.2, 0.45], pause: [0.5, 0.9],  head: 0.05, hint: 14, fov: 1.7, strafe: 0.4, melee: 0.0, semiDelay: 0.35, dmgTaken: 1.0 },
  normal:  { label: 'Normal',  react: 0.45, turn: 5.5, err: 0.048, burst: [0.3, 0.65], pause: [0.3, 0.55], head: 0.15, hint: 9,  fov: 2.0, strafe: 0.75, melee: 0.3, semiDelay: 0.18, dmgTaken: 1.0 },
  hard:    { label: 'Hard',    react: 0.3,  turn: 8.5, err: 0.028, burst: [0.45, 0.9], pause: [0.18, 0.35], head: 0.3, hint: 6,  fov: 2.3, strafe: 1.0, melee: 0.6, semiDelay: 0.1, dmgTaken: 1.0 },
  veteran: { label: 'Veteran', react: 0.2,  turn: 12,  err: 0.016, burst: [0.6, 1.2],  pause: [0.1, 0.22], head: 0.45, hint: 4,  fov: 2.5, strafe: 1.0, melee: 0.9, semiDelay: 0.05, dmgTaken: 1.0 },
};

const tmp = new THREE.Vector3();

// Ray corridor check that also respects movement-only colliders (fences).
function walkClear(a, b) {
  const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
  if (len < 0.05) return true;
  const d = { x: dx / len, y: 0, z: dz / len };
  for (const yOff of [0.6, 1.4]) {
    const o = { x: a.x, y: a.y + yOff, z: a.z };
    for (const bx of world.boxes) {
      if (bx.max.y < 0.3 || bx.max.x - bx.min.x > 300) continue;
      if (rayBox(o, d, bx, len)) return false;
    }
  }
  return true;
}

export class BotBrain {
  constructor(game, me, foe, diffKey) {
    this.game = game; this.me = me; this.foe = foe;
    this.setDifficulty(diffKey);
    this.reset();
  }

  setDifficulty(k) { this.D = DIFFICULTY[k] || DIFFICULTY.normal; }

  reset() {
    this.canSee = false; this.seenSince = 0; this.lastSeen = -99; this.knowsAt = -99;
    this.lastKnown = new THREE.Vector3();
    this.visT = 0; this.path = null; this.pi = 0; this.goal = null; this.repathT = 0;
    this.errYaw = 0; this.errPitch = 0; this.errT = 0;
    this.strafeDir = Math.random() < 0.5 ? -1 : 1; this.strafeT = 0;
    this.burstT = 0; this.pauseT = 0; this.nextSemi = 0;
    this.stuckT = 0; this.lastPos = this.me.pos.clone(); this.wanderGoal = null;
    this.nextHint = this.game.time + this.D.hint * 0.5;
    this.crouchT = 0; this.pickupGoal = null;
  }

  hear(pos, loud = 1) {
    const d = this.me.pos.distanceTo(pos);
    if (d < 45 * loud && !this.canSee) {
      this.lastKnown.copy(pos);
      this.knowsAt = this.game.time;
    }
  }

  onDamaged(fromPos) {
    if (!this.canSee && fromPos) {
      this.lastKnown.copy(fromPos);
      this.knowsAt = this.game.time;
      // snap attention toward the attacker
      this.lookYaw = yawTo(fromPos.x - this.me.pos.x, fromPos.z - this.me.pos.z);
    }
  }

  checkSight() {
    const me = this.me, foe = this.foe, g = this.game;
    if (!foe.alive) return false;
    const dx = foe.pos.x - me.pos.x, dz = foe.pos.z - me.pos.z;
    const dist = Math.hypot(dx, dz);
    const inFov = Math.abs(angleDiff(me.yaw, yawTo(dx, dz))) < this.D.fov / 2;
    const recentlyFired = g.time - foe.lastShot < 0.6;
    if (!inFov && dist > 4 && !recentlyFired) return false;
    const eye = g.eyePos(me);
    const pts = g.aimPoints(foe);
    return lineOfSight(eye, pts.head) || lineOfSight(eye, pts.chest);
  }

  update(dt) {
    const me = this.me, foe = this.foe, g = this.game, I = me.intent, D = this.D;
    I.mx = 0; I.mz = 0; I.jump = false; I.fire = false; I.ads = false; I.reload = false; I.melee = false; I.sprint = false; I.crouch = false;
    if (!me.alive) return;
    const t = g.time;
    const w = WEAPONS[me.wi];

    this.visT -= dt;
    if (this.visT <= 0) {
      this.visT = 0.1;
      const was = this.canSee;
      this.canSee = this.checkSight();
      if (this.canSee && !was) {
        this.seenSince = t;
        this.errYaw = rand(-1, 1) * D.err * 3.5;
        this.errPitch = rand(-1, 1) * D.err * 2;
      }
    }
    if (this.canSee) { this.lastSeen = t; this.lastKnown.copy(foe.pos); this.knowsAt = t; }

    if ((t > this.nextHint || me.uavT > 0) && foe.alive && !this.canSee) {
      this.nextHint = t + D.hint;
      const fuzz = me.uavT > 0 ? 1 : 6;
      this.lastKnown.set(foe.pos.x + rand(-fuzz, fuzz), foe.pos.y, foe.pos.z + rand(-fuzz, fuzz));
      this.knowsAt = t;
    }

    const dist = me.pos.distanceTo(foe.pos);
    if (this.canSee && foe.alive) this.engage(dt, w, dist);
    else this.hunt(dt, w);

    // reloading
    if (w.mag > 0 && me.mag === 0) I.reload = true;
    if (w.mag > 0 && !this.canSee && t - this.lastSeen > 1.2 && me.mag < w.mag * 0.5) I.reload = true;

    // stuck detection
    const moved = Math.hypot(me.pos.x - this.lastPos.x, me.pos.z - this.lastPos.z);
    this.lastPos.copy(me.pos);
    if (Math.hypot(I.mx, I.mz) > 0.3 && moved / dt < 0.6) this.stuckT += dt; else this.stuckT = Math.max(0, this.stuckT - dt * 2);
    if (this.stuckT > 0.5) I.jump = true;
    if (this.stuckT > 1.6) { this.stuckT = 0; this.path = null; this.wanderGoal = this.randomWaypoint(); this.goal = null; }
  }

  engage(dt, w, dist) {
    const me = this.me, foe = this.foe, g = this.game, I = me.intent, D = this.D, t = g.time;
    const pts = g.aimPoints(foe);
    let aim;
    if (w.projectile) aim = foe.onGround ? pts.feet : pts.chest;
    else aim = (this.headPref ?? (this.headPref = Math.random() < D.head)) ? pts.head : pts.chest;
    const eye = g.eyePos(me);
    const dx = aim.x - eye.x, dy = aim.y - eye.y, dz = aim.z - eye.z;
    const wantYaw = yawTo(dx, dz), wantPitch = Math.atan2(dy, Math.hypot(dx, dz));

    // aim error drifts and tightens while tracking
    this.errT -= dt;
    if (this.errT <= 0) {
      this.errT = 0.35;
      const k = Math.min(1, (t - this.seenSince) / 1.2);
      const mag = D.err * (2.2 - 1.2 * k) * (foe.crouch > 0.5 ? 0.9 : 1) * (Math.hypot(foe.vel.x, foe.vel.z) > 3 ? 1.3 : 1);
      this.errYaw = rand(-1, 1) * mag;
      this.errPitch = rand(-1, 1) * mag * 0.6;
      this.headPref = Math.random() < D.head;
    }
    const tYaw = wantYaw + this.errYaw, tPitch = wantPitch + this.errPitch;
    const turn = D.turn * dt;
    me.yaw += clamp(angleDiff(me.yaw, tYaw), -turn, turn);
    me.pitch += clamp(tPitch - me.pitch, -turn, turn);
    me.pitch = clamp(me.pitch, -1.4, 1.4);

    const off = Math.abs(angleDiff(me.yaw, wantYaw)) + Math.abs(me.pitch - wantPitch);
    const tol = Math.max(0.035, Math.atan(0.45 / Math.max(1, dist))) + D.err;
    const reacted = t - this.seenSince > D.react;

    // ADS for precision weapons at range
    I.ads = !w.melee && w.id !== 'shotgun' && (w.scope || dist > 12) && reacted;

    if (w.melee) {
      if (dist < w.reach + 0.3 && reacted) I.fire = true;
    } else if (reacted && off < tol * (w.pellets ? 2 : 1)) {
      if (dist < 1.9 && Math.random() < D.melee * dt * 4) I.melee = true;
      else if (w.auto) {
        if (this.pauseT > 0) this.pauseT -= dt;
        else {
          I.fire = true;
          this.burstT += dt;
          if (this.burstT > rand(D.burst[0], D.burst[1])) { this.burstT = 0; this.pauseT = rand(D.pause[0], D.pause[1]) * (dist > 20 ? 1.4 : 1); }
        }
      } else if (t >= this.nextSemi && t >= me.nextFire) {
        I.fire = true;
        this.nextSemi = t + 60 / w.rpm + D.semiDelay * rand(0.6, 1.4) + (w.scope ? 0.2 : 0);
      }
    }

    // movement: hold preferred range, strafe
    this.strafeT -= dt;
    if (this.strafeT <= 0 || me.hitWall) { this.strafeT = rand(0.5, 1.4); this.strafeDir *= -1; }
    const fx = (foe.pos.x - me.pos.x) / Math.max(0.01, dist), fz = (foe.pos.z - me.pos.z) / Math.max(0.01, dist);
    let mx = 0, mz = 0;
    if (w.melee || dist > w.pref + 6) {
      this.navTo(foe.pos, dt);
      mx = I.mx; mz = I.mz;
      if (w.melee && dist < 6 && lineOfSight(this.game.eyePos(me), pts.chest)) { mx = fx; mz = fz; }
      I.sprint = w.melee && dist > 4;
    } else if (dist < w.pref * 0.45 && !w.pellets) { mx = -fx * 0.7; mz = -fz * 0.7; }
    if (!w.melee) {
      mx += -fz * this.strafeDir * D.strafe;
      mz += fx * this.strafeDir * D.strafe;
    }
    const len = Math.hypot(mx, mz);
    if (len > 1) { mx /= len; mz /= len; }
    I.mx = mx; I.mz = mz;

    // occasional crouch-spray at range
    this.crouchT -= dt;
    if (this.crouchT <= 0) this.crouchT = rand(1, 3), this.crouching = !w.melee && dist > 10 && Math.random() < D.strafe * 0.3;
    I.crouch = !!this.crouching;
  }

  hunt(dt, w) {
    const me = this.me, g = this.game, I = me.intent, D = this.D, t = g.time;
    let goal = null;
    if (t - this.knowsAt < 9) {
      goal = this.lastKnown;
      if (me.pos.distanceTo(goal) < 1.6) this.knowsAt = -99;
    }
    if (!goal) {
      // grab a nearby power-up sometimes
      if (!this.pickupGoal || !this.pickupGoal.active) {
        this.pickupGoal = null;
        for (const p of g.pickups) if (p.active && Math.hypot(p.x - me.pos.x, p.z - me.pos.z) < 14) { this.pickupGoal = p; break; }
      }
      if (this.pickupGoal) goal = tmp.set(this.pickupGoal.x, 0, this.pickupGoal.z);
    }
    if (!goal) {
      if (!this.wanderGoal || me.pos.distanceTo(this.wanderGoal) < 1.5) this.wanderGoal = this.randomWaypoint();
      goal = this.wanderGoal;
    }
    this.navTo(goal, dt);
    I.sprint = me.pos.distanceTo(goal) > 8 && t - this.lastSeen > 1.5;

    // look where we're going (or where we last heard the enemy)
    let lookYaw = Math.hypot(I.mx, I.mz) > 0.1 ? yawTo(I.mx, I.mz) : me.yaw;
    if (t - this.knowsAt < 3 && me.pos.distanceTo(this.lastKnown) < 25) lookYaw = yawTo(this.lastKnown.x - me.pos.x, this.lastKnown.z - me.pos.z);
    if (this.lookYaw !== undefined) { lookYaw = this.lookYaw; this.lookYaw = undefined; }
    const turn = D.turn * 0.8 * dt;
    me.yaw += clamp(angleDiff(me.yaw, lookYaw), -turn, turn);
    me.pitch += clamp(-me.pitch, -turn, turn);
  }

  randomWaypoint() {
    const wps = this.game.map.waypoints;
    // bias toward the enemy's half of the map
    for (let k = 0; k < 6; k++) {
      const w = wps[Math.floor(Math.random() * wps.length)];
      if (Math.sign(w.z) === Math.sign(this.foe.pos.z) || k === 5) return new THREE.Vector3(w.x, w.y, w.z);
    }
    return null;
  }

  nearestWp(pos) {
    const wps = this.game.map.waypoints;
    const order = wps.map((w, i) => [i, Math.hypot(w.x - pos.x, w.z - pos.z) + Math.abs(w.y - pos.y) * 4]).sort((a, b) => a[1] - b[1]);
    for (let k = 0; k < Math.min(8, order.length); k++) {
      const w = wps[order[k][0]];
      if (Math.abs(w.y - pos.y) < 1.6 && walkClear(pos, w)) return order[k][0];
    }
    return order[0][0];
  }

  findPath(from, to) {
    const wps = this.game.map.waypoints;
    const s = this.nearestWp(from), e = this.nearestWp(to);
    if (s === e) return [s];
    const open = new Set([s]), came = new Map(), gS = new Map([[s, 0]]);
    const h = (i) => Math.hypot(wps[i].x - wps[e].x, wps[i].y - wps[e].y, wps[i].z - wps[e].z);
    const f = new Map([[s, h(s)]]);
    let guard = 0;
    while (open.size && guard++ < 2000) {
      let cur = null, best = Infinity;
      for (const i of open) { const v = f.get(i); if (v < best) { best = v; cur = i; } }
      if (cur === e) {
        const path = [cur];
        while (came.has(cur)) { cur = came.get(cur); path.unshift(cur); }
        return path;
      }
      open.delete(cur);
      for (const n of wps[cur].links) {
        const a = wps[cur], b = wps[n];
        const tg = gS.get(cur) + Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
        if (tg < (gS.get(n) ?? Infinity)) { came.set(n, cur); gS.set(n, tg); f.set(n, tg + h(n)); open.add(n); }
      }
    }
    return [s];
  }

  navTo(goal, dt) {
    const me = this.me, I = me.intent, wps = this.game.map.waypoints;
    this.repathT -= dt;
    if (!this.path || this.repathT <= 0 || !this.goal || this.goal.distanceTo(goal) > 2.5) {
      this.goal = goal.clone();
      this.path = this.findPath(me.pos, goal);
      this.pi = 0;
      this.repathT = 1.2;
      // skip the first node if we can already walk to the second
      if (this.path.length > 1 && Math.abs(wps[this.path[1]].y - me.pos.y) < 0.5 && walkClear(me.pos, wps[this.path[1]])) this.pi = 1;
    }
    let target = null;
    while (this.pi < this.path.length) {
      const w = wps[this.path[this.pi]];
      if (Math.hypot(w.x - me.pos.x, w.z - me.pos.z) < 0.7 && Math.abs(w.y - me.pos.y) < 1.3) { this.pi++; continue; }
      target = w;
      break;
    }
    if (!target) target = goal;
    // cut straight to the goal when it's on our level and reachable
    if (this.pi >= this.path.length - 1 && Math.abs(goal.y - me.pos.y) < 0.6 && walkClear(me.pos, goal)) target = goal;
    const dx = target.x - me.pos.x, dz = target.z - me.pos.z, len = Math.hypot(dx, dz);
    if (len > 0.2) { I.mx = dx / len; I.mz = dz / len; }
  }
}
