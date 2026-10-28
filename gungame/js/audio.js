// Procedural sound effects. Positional sounds use a PannerNode against the camera listener.
export class Audio {
  constructor() {
    this.ctx = null;
    this.volume = 0.7;
    this.noiseBuf = null;
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      const comp = this.ctx.createDynamicsCompressor();
      this.master.connect(comp);
      comp.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 1.0;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.value = v;
  }

  setListener(pos, fwd) {
    if (!this.ctx) return;
    const l = this.ctx.listener;
    if (l.positionX) {
      const t = this.ctx.currentTime;
      l.positionX.setValueAtTime(pos.x, t); l.positionY.setValueAtTime(pos.y, t); l.positionZ.setValueAtTime(pos.z, t);
      l.forwardX.setValueAtTime(fwd.x, t); l.forwardY.setValueAtTime(fwd.y, t); l.forwardZ.setValueAtTime(fwd.z, t);
      l.upX.setValueAtTime(0, t); l.upY.setValueAtTime(1, t); l.upZ.setValueAtTime(0, t);
    } else if (l.setPosition) {
      l.setPosition(pos.x, pos.y, pos.z);
      l.setOrientation(fwd.x, fwd.y, fwd.z, 0, 1, 0);
    }
  }

  out(pos) {
    if (!pos) return this.master;
    const p = this.ctx.createPanner();
    p.panningModel = 'HRTF';
    p.distanceModel = 'inverse';
    p.refDistance = 4;
    p.rolloffFactor = 1.1;
    if (p.positionX) { p.positionX.value = pos.x; p.positionY.value = pos.y; p.positionZ.value = pos.z; }
    else p.setPosition(pos.x, pos.y, pos.z);
    p.connect(this.master);
    return p;
  }

  noise(dest, { f = 2000, q = 0.8, type = 'lowpass', d = 0.2, g = 0.5, attack = 0.002, delay = 0, fEnd = null }) {
    const c = this.ctx, t = c.currentTime + delay;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const flt = c.createBiquadFilter();
    flt.type = type; flt.frequency.setValueAtTime(f, t); flt.Q.value = q;
    if (fEnd) flt.frequency.exponentialRampToValueAtTime(fEnd, t + d);
    const gn = c.createGain();
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(g, t + attack);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
    src.connect(flt); flt.connect(gn); gn.connect(dest);
    src.start(t, Math.random() * 0.5); src.stop(t + d + 0.05);
  }

  tone(dest, { f = 440, fEnd = null, type = 'sine', d = 0.15, g = 0.3, delay = 0, attack = 0.005 }) {
    const c = this.ctx, t = c.currentTime + delay;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (fEnd) o.frequency.exponentialRampToValueAtTime(fEnd, t + d);
    const gn = c.createGain();
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(g, t + attack);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(gn); gn.connect(dest);
    o.start(t); o.stop(t + d + 0.05);
  }

  shot(weapon, pos) {
    if (!this.ctx) return;
    const s = weapon.sound, dest = this.out(pos);
    if (weapon.melee) { this.noise(dest, { f: 3000, type: 'bandpass', q: 1.5, d: 0.12, g: 0.25, fEnd: 900 }); return; }
    this.noise(dest, { f: s.f, d: s.d, g: s.g, fEnd: s.f * 0.25 });
    this.noise(dest, { f: 6000, type: 'highpass', d: 0.04, g: s.g * 0.5 });
    if (s.low) this.tone(dest, { f: s.low * 1.6, fEnd: s.low * 0.5, type: 'triangle', d: s.d * 0.9, g: s.g * 0.9 });
    if (weapon.id === 'shotgun' || weapon.id === 'sniper') this.noise(dest, { f: 900, type: 'bandpass', q: 3, d: 0.06, g: 0.15, delay: 0.38 });
  }

  explosion(pos) {
    if (!this.ctx) return;
    const dest = this.out(pos);
    this.noise(dest, { f: 1400, d: 1.4, g: 1.0, fEnd: 60, attack: 0.005 });
    this.tone(dest, { f: 90, fEnd: 30, type: 'sine', d: 1.0, g: 0.9 });
  }

  footstep(pos, g = 0.12) {
    if (!this.ctx) return;
    this.noise(this.out(pos), { f: 500 + Math.random() * 300, d: 0.08, g, type: 'lowpass' });
  }

  hitmarker(head) {
    if (!this.ctx) return;
    this.tone(this.master, { f: head ? 2400 : 1800, type: 'square', d: 0.05, g: 0.08 });
    if (head) this.noise(this.master, { f: 5000, type: 'highpass', d: 0.05, g: 0.12 });
  }

  hurt() {
    if (!this.ctx) return;
    this.noise(this.master, { f: 400, d: 0.18, g: 0.35, type: 'lowpass' });
  }

  kill() {
    if (!this.ctx) return;
    this.tone(this.master, { f: 880, type: 'triangle', d: 0.12, g: 0.18 });
    this.tone(this.master, { f: 1320, type: 'triangle', d: 0.22, g: 0.18, delay: 0.08 });
  }

  levelUp() {
    if (!this.ctx) return;
    [523, 659, 784, 1047].forEach((f, i) => this.tone(this.master, { f, type: 'square', d: 0.14, g: 0.07, delay: i * 0.07 }));
  }

  demote() {
    if (!this.ctx) return;
    [500, 380, 260].forEach((f, i) => this.tone(this.master, { f, type: 'sawtooth', d: 0.2, g: 0.08, delay: i * 0.12 }));
  }

  reload(t = 1) {
    if (!this.ctx) return;
    this.noise(this.master, { f: 2500, type: 'bandpass', q: 4, d: 0.05, g: 0.2, delay: 0.1 * t });
    this.noise(this.master, { f: 1800, type: 'bandpass', q: 4, d: 0.06, g: 0.25, delay: 0.55 * t });
    this.noise(this.master, { f: 3200, type: 'bandpass', q: 4, d: 0.05, g: 0.25, delay: 0.85 * t });
  }

  empty() {
    if (!this.ctx) return;
    this.noise(this.master, { f: 3000, type: 'bandpass', q: 6, d: 0.03, g: 0.2 });
  }

  pickup() {
    if (!this.ctx) return;
    [660, 880, 1175].forEach((f, i) => this.tone(this.master, { f, type: 'sine', d: 0.15, g: 0.15, delay: i * 0.06 }));
  }

  countdown(final) {
    if (!this.ctx) return;
    this.tone(this.master, { f: final ? 1046 : 660, type: 'square', d: final ? 0.4 : 0.12, g: 0.08 });
  }

  alarm() {
    if (!this.ctx) return;
    for (let i = 0; i < 4; i++) this.tone(this.master, { f: 500, fEnd: 900, type: 'sawtooth', d: 0.5, g: 0.07, delay: i * 0.55 });
  }

  whoosh(pos) {
    if (!this.ctx) return;
    this.noise(this.out(pos), { f: 800, type: 'bandpass', q: 1, d: 0.5, g: 0.4, fEnd: 2500 });
  }
}
