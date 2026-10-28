import { clamp } from './util.js';

// Virtual stick on the left, drag-to-look on the right, plus action buttons.
export class TouchControls {
  constructor(game) {
    this.g = game;
    this.move = { x: 0, y: 0 };
    this.sprint = false;
    this.joyId = null; this.lookIds = new Map();
    const $ = (id) => document.getElementById(id);
    this.base = $('joyBase'); this.knob = $('joyKnob');
    const I = game.input;

    const zone = $('joyZone');
    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      if (this.joyId !== null) return;
      this.joyId = t.identifier;
      const r = zone.getBoundingClientRect();
      this.origin = { x: t.clientX, y: t.clientY };
      this.base.style.left = `${t.clientX - r.left - 60}px`;
      this.base.style.top = `${t.clientY - r.top - 60}px`;
      this.base.style.bottom = 'auto';
      this.setKnob(0, 0);
    }, { passive: false });

    const onMove = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === this.joyId) {
          const dx = t.clientX - this.origin.x, dy = t.clientY - this.origin.y;
          const len = Math.hypot(dx, dy), max = 55;
          const k = len > max ? max / len : 1;
          this.setKnob(dx * k, dy * k);
          this.move.x = clamp(dx / max, -1, 1);
          this.move.y = clamp(-dy / max, -1, 1);
          this.sprint = len > max * 1.35 && -dy > Math.abs(dx);
        } else if (this.lookIds.has(t.identifier)) {
          const last = this.lookIds.get(t.identifier);
          I.lookDX += (t.clientX - last.x) * 2.2;
          I.lookDY += (t.clientY - last.y) * 2.2;
          this.lookIds.set(t.identifier, { x: t.clientX, y: t.clientY });
        }
      }
    };
    const onEnd = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === this.joyId) {
          this.joyId = null; this.move.x = this.move.y = 0; this.sprint = false; this.setKnob(0, 0);
        }
        this.lookIds.delete(t.identifier);
      }
    };
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);

    const look = $('lookZone');
    look.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) this.lookIds.set(t.identifier, { x: t.clientX, y: t.clientY });
    }, { passive: false });

    const btn = (id, down, up, alsoLook = false) => {
      const el = $(id);
      el.addEventListener('touchstart', (e) => {
        e.preventDefault(); e.stopPropagation();
        game.audio.unlock();
        if (alsoLook) for (const t of e.changedTouches) this.lookIds.set(t.identifier, { x: t.clientX, y: t.clientY });
        down && down(el);
      }, { passive: false });
      el.addEventListener('touchend', (e) => { e.preventDefault(); up && up(el); }, { passive: false });
      el.addEventListener('touchcancel', () => up && up(el));
    };
    btn('tFire', () => { I.fire = true; }, () => { I.fire = false; }, true);
    btn('tAds', (el) => { I.ads = !I.ads; el.classList.toggle('on', I.ads); });
    btn('tJump', () => { I.jumpQueued = true; });
    btn('tCrouch', (el) => { I.crouchToggle = !I.crouchToggle; el.classList.toggle('on', I.crouchToggle); });
    btn('tReload', () => { I.reloadQueued = true; });
    btn('tMelee', () => { I.meleeQueued = true; });
    btn('tUse', () => game.tryInteract());
    btn('tPause', () => game.pause());
    btn('tScore', () => game.hud.showScoreboard(true), () => game.hud.showScoreboard(false));

    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      document.getElementById('rotate').classList.toggle('hidden', !(portrait && game.state !== 'menu'));
    };
    window.addEventListener('resize', checkOrientation);
    setInterval(checkOrientation, 1000);
  }

  setKnob(x, y) { this.knob.style.transform = `translate(${x}px, ${y}px)`; }
}
