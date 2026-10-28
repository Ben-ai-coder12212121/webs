import * as THREE from 'three';
import { glowTexture, smokeTexture, flashTexture } from './textures.js';

const MAX_P = 500;

export class Effects {
  constructor(scene) {
    this.scene = scene;
    this.time = 0;

    // particles (sparks, blood, debris)
    const g = new THREE.BufferGeometry();
    this.pPos = new Float32Array(MAX_P * 3).fill(-9999);
    this.pCol = new Float32Array(MAX_P * 3);
    g.setAttribute('position', new THREE.BufferAttribute(this.pPos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(this.pCol, 3));
    this.points = new THREE.Points(g, new THREE.PointsMaterial({
      size: 0.07, vertexColors: true, map: glowTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)'),
      transparent: true, depthWrite: false, sizeAttenuation: true,
    }));
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.parts = Array.from({ length: MAX_P }, () => ({ life: 0, vx: 0, vy: 0, vz: 0, grav: 0 }));
    this.pNext = 0;

    // tracers
    this.tracerGeo = new THREE.BoxGeometry(1, 1, 1);
    this.tracerGeo.translate(0, 0, -0.5);
    this.tracers = [];
    for (let i = 0; i < 24; i++) {
      const m = new THREE.Mesh(this.tracerGeo, new THREE.MeshBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0, depthWrite: false }));
      m.visible = false;
      scene.add(m);
      this.tracers.push({ m, life: 0 });
    }

    // bullet hole decals
    const dGeo = new THREE.CircleGeometry(0.06, 8);
    const dMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.8, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
    this.decals = [];
    for (let i = 0; i < 80; i++) {
      const m = new THREE.Mesh(dGeo, dMat);
      m.visible = false;
      scene.add(m);
      this.decals.push(m);
    }
    this.dNext = 0;

    // sprites for flashes / smoke / explosions
    this.flashTex = flashTexture();
    this.smokeTex = smokeTexture();
    this.fireTex = glowTexture('rgba(255,230,160,1)', 'rgba(255,90,10,0)');
    this.sprites = [];

    this.light = new THREE.PointLight(0xffb060, 0, 14, 1.5);
    scene.add(this.light);
    this.lightT = 0;
  }

  spawn(x, y, z, vx, vy, vz, r, g, b, life, grav = 9) {
    const i = this.pNext; this.pNext = (this.pNext + 1) % MAX_P;
    const p = this.parts[i];
    p.life = life; p.vx = vx; p.vy = vy; p.vz = vz; p.grav = grav;
    this.pPos[i * 3] = x; this.pPos[i * 3 + 1] = y; this.pPos[i * 3 + 2] = z;
    this.pCol[i * 3] = r; this.pCol[i * 3 + 1] = g; this.pCol[i * 3 + 2] = b;
  }

  impact(point, normal, surfaceColor = [0.75, 0.72, 0.65]) {
    for (let i = 0; i < 7; i++) {
      const s = 2 + Math.random() * 3;
      this.spawn(point.x, point.y, point.z,
        normal.x * s + (Math.random() - 0.5) * 3, normal.y * s + Math.random() * 2.5, normal.z * s + (Math.random() - 0.5) * 3,
        ...(i < 3 ? [1, 0.85, 0.4] : surfaceColor), 0.25 + Math.random() * 0.3);
    }
    const d = this.decals[this.dNext]; this.dNext = (this.dNext + 1) % this.decals.length;
    d.visible = true;
    d.position.set(point.x + normal.x * 0.01, point.y + normal.y * 0.01, point.z + normal.z * 0.01);
    d.lookAt(point.x + normal.x, point.y + normal.y, point.z + normal.z);
  }

  blood(point, dir) {
    for (let i = 0; i < 12; i++) {
      const s = 1 + Math.random() * 2.5;
      this.spawn(point.x, point.y, point.z,
        dir.x * s + (Math.random() - 0.5) * 2, Math.random() * 2, dir.z * s + (Math.random() - 0.5) * 2,
        0.75 + Math.random() * 0.2, 0.05, 0.05, 0.35 + Math.random() * 0.3);
    }
  }

  tracer(from, to, color = 0xffe9a0) {
    const t = this.tracers.find((x) => x.life <= 0) || this.tracers[0];
    const len = Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);
    if (len < 0.5) return;
    t.m.position.set(from.x, from.y, from.z);
    t.m.lookAt(to.x, to.y, to.z);
    t.m.scale.set(0.018, 0.018, len);
    t.m.material.color.setHex(color);
    t.m.material.opacity = 0.85;
    t.m.visible = true;
    t.life = 0.07;
  }

  sprite(tex, pos, size, life, { grow = 1, color = 0xffffff, additive = true, rise = 0, opacity = 1 } = {}) {
    let s = this.sprites.find((x) => x.life <= 0);
    if (!s) {
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
      s = { m: new THREE.Sprite(mat), life: 0 };
      this.scene.add(s.m);
      this.sprites.push(s);
    }
    s.m.material.map = tex;
    s.m.material.blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    s.m.material.color.setHex(color);
    s.m.material.opacity = opacity;
    s.m.material.rotation = Math.random() * Math.PI * 2;
    s.m.position.set(pos.x, pos.y, pos.z);
    s.m.scale.setScalar(size);
    s.m.visible = true;
    s.life = s.max = life; s.size = size; s.grow = grow; s.rise = rise; s.op = opacity;
  }

  muzzleFlash(pos, size = 0.5) {
    this.sprite(this.flashTex, pos, size, 0.05, { grow: 1.3 });
    this.flashLight(pos, 0.06, 3);
  }

  flashLight(pos, t, intensity) {
    this.light.position.set(pos.x, pos.y, pos.z);
    this.light.intensity = intensity;
    this.lightT = t;
  }

  explosion(pos) {
    this.sprite(this.fireTex, pos, 2.5, 0.35, { grow: 3.2 });
    this.sprite(this.fireTex, { x: pos.x, y: pos.y + 0.6, z: pos.z }, 2, 0.45, { grow: 2.5, color: 0xff9944 });
    for (let i = 0; i < 6; i++) {
      this.sprite(this.smokeTex, { x: pos.x + (Math.random() - 0.5) * 2, y: pos.y + Math.random() * 1.5, z: pos.z + (Math.random() - 0.5) * 2 },
        1.8 + Math.random(), 1.6 + Math.random(), { grow: 2.2, color: 0x555555, additive: false, rise: 1.2, opacity: 0.7 });
    }
    for (let i = 0; i < 50; i++) {
      const a = Math.random() * Math.PI * 2, e = Math.random() * 1.2, s = 4 + Math.random() * 9;
      this.spawn(pos.x, pos.y + 0.3, pos.z, Math.cos(a) * Math.cos(e) * s, Math.sin(e) * s + 2, Math.sin(a) * Math.cos(e) * s,
        1, 0.5 + Math.random() * 0.4, 0.1, 0.5 + Math.random() * 0.6);
    }
    this.flashLight(pos, 0.3, 40);
  }

  smokePuff(pos) {
    this.sprite(this.smokeTex, pos, 0.35, 0.6, { grow: 3, color: 0xdddddd, additive: false, rise: 0.4, opacity: 0.5 });
  }

  update(dt) {
    for (let i = 0; i < MAX_P; i++) {
      const p = this.parts[i];
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) { this.pPos[i * 3 + 1] = -9999; continue; }
      p.vy -= p.grav * dt;
      this.pPos[i * 3] += p.vx * dt; this.pPos[i * 3 + 1] += p.vy * dt; this.pPos[i * 3 + 2] += p.vz * dt;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;

    for (const t of this.tracers) {
      if (t.life <= 0) continue;
      t.life -= dt;
      t.m.material.opacity = Math.max(0, t.life / 0.07) * 0.85;
      if (t.life <= 0) t.m.visible = false;
    }
    for (const s of this.sprites) {
      if (s.life <= 0) continue;
      s.life -= dt;
      const k = 1 - s.life / s.max;
      s.m.scale.setScalar(s.size * (1 + (s.grow - 1) * k));
      s.m.material.opacity = s.op * Math.max(0, s.life / s.max);
      s.m.position.y += s.rise * dt;
      if (s.life <= 0) s.m.visible = false;
    }
    if (this.lightT > 0) {
      this.lightT -= dt;
      if (this.lightT <= 0) this.light.intensity = 0;
    }
  }

  clear() {
    for (const d of this.decals) d.visible = false;
    for (const p of this.parts) p.life = 0;
    this.pPos.fill(-9999);
  }
}
