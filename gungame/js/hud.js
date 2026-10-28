import { WEAPONS, weaponIconSVG } from './weapons.js';
import { drawPortrait, SKINS, BLUE_SKINS } from './character.js';
import { DIFFICULTY } from './bot.js';
import { BOUNDS } from './map.js';
import { clamp, yawTo } from './util.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export class Hud {
  constructor(game) {
    this.g = game;
    this.icons = WEAPONS.map((w) => weaponIconSVG(w));
    this.iconsWhite = WEAPONS.map((w) => weaponIconSVG(w, { color: '#f2f5fa' }));
    this.iconsMelee = this.iconsWhite[8];
    this.el = {
      hud: $('hud'), menu: $('menu'), pause: $('pause'), end: $('endscreen'),
      scoreYou: $('scoreYou'), scoreEnemy: $('scoreEnemy'), goal: $('goalText'), timer: $('timer'),
      ladder: $('ladder'), feed: $('killfeed'), mm: $('minimap'), pu: $('powerups'),
      wicon: $('wicon'), wname: $('wname'), mag: $('ammoMag'), res: $('ammoRes'), next: $('nextWeapon'), ammo: document.querySelector('.ammo'),
      health: $('healthfill'), cross: $('crosshair'), reddot: $('reddot'), hit: $('hitmarker'), scope: $('scope'),
      vig: $('vignette'), flash: $('dmgflash'), dmg: $('dmgIndicators'), count: $('countdown'), banner: $('banner'),
      toast: $('toast'), hint: $('hint'), lowammo: $('lowammo'), respawn: $('respawn'), respawnNum: $('respawnNum'),
      respawnArc: $('respawnArc'), killedBy: $('killedBy'), sb: $('scoreboard'), sbBody: $('sbdBody'), sbTimer: $('sbdTimer'),
    };
    this.mmCtx = this.el.mm.getContext('2d');
    this.hitT = 0; this.bannerT = 0; this.toastT = 0; this.flashT = 0;
    this.lastWi = -1; this.mmT = 0;
    this.buildMenu();
    if (game.isTouch) document.body.classList.add('touch');
    // ladder
    this.el.ladder.innerHTML = WEAPONS.map((w, i) => `<div class="lv" data-i="${i}"><span class="num">${i + 1}</span>${this.iconsWhite[i]}<i class="pip"></i></div>`).join('');
    this.ladderEls = [...this.el.ladder.children];
  }

  // ------------------------------------------------------------ menu
  buildMenu() {
    const g = this.g, S = g.settings;
    const seg = (id, options, key, cast = (v) => v) => {
      const el = $(id);
      el.innerHTML = options.map(([v, label]) => `<button data-v="${v}">${label}</button>`).join('');
      const sync = () => [...el.children].forEach((b) => b.classList.toggle('on', String(S[key]) === b.dataset.v));
      el.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        S[key] = cast(b.dataset.v);
        sync();
        g.saveSettings();
        if (key === 'lighting') g.applyLighting();
      });
      sync();
    };
    seg('optDiff', Object.entries(DIFFICULTY).map(([k, d]) => [k, d.label]), 'difficulty');
    seg('optKpw', [['1', '1 (first to 9)'], ['2', '2 (first to 18)']], 'kpw', Number);
    seg('optTime', [['5', '5 min'], ['10', '10 min'], ['15', '15 min']], 'time', Number);
    seg('optLight', [['day', 'Day'], ['sunset', 'Sunset']], 'lighting');

    const name = $('optName');
    name.value = S.name;
    name.addEventListener('input', () => { S.name = name.value.trim().slice(0, 14) || 'Player'; g.saveSettings(); });
    name.addEventListener('keydown', (e) => e.stopPropagation());

    const slider = (id, valId, key, fmt, after) => {
      const el = $(id), v = $(valId);
      const sync = () => { el.value = S[key]; v.textContent = fmt(S[key]); };
      el.addEventListener('input', () => { S[key] = Number(el.value); v.textContent = fmt(S[key]); g.saveSettings(); after && after(); this.syncSliders(); });
      sync();
      return sync;
    };
    this.sliderSyncs = [
      slider('optSens', 'sensVal', 'sens', (v) => v.toFixed(2)),
      slider('optFov', 'fovVal', 'fov', (v) => v + '°'),
      slider('optVol', 'volVal', 'volume', (v) => Math.round(v * 100) + '%', () => g.audio.setVolume(S.volume)),
      slider('pSens', 'pSensVal', 'sens', (v) => v.toFixed(2)),
      slider('pVol', 'pVolVal', 'volume', (v) => Math.round(v * 100) + '%', () => g.audio.setVolume(S.volume)),
    ];

    const sp = $('skinPicker');
    sp.innerHTML = BLUE_SKINS.map((k) => `<button class="skin" data-k="${k}"><canvas width="40" height="60"></canvas><span>${SKINS[k].name}${k === 'blue' ? ' (Default)' : ''}</span></button>`).join('');
    [...sp.children].forEach((b) => drawPortrait(b.querySelector('canvas'), b.dataset.k));
    const syncSkin = () => [...sp.children].forEach((b) => b.classList.toggle('on', b.dataset.k === S.skin));
    sp.addEventListener('click', (e) => {
      const b = e.target.closest('.skin');
      if (!b) return;
      S.skin = b.dataset.k; syncSkin(); g.saveSettings();
    });
    syncSkin();

    $('ladderPreview').innerHTML = WEAPONS.map((w, i) => `<div class="lp">${this.icons[i]}<span>${i + 1}. ${w.name}</span></div>`).join('');
    $('playBtn').addEventListener('click', () => g.startMatch());
    $('resumeBtn').addEventListener('click', () => g.resume());
    $('quitBtn').addEventListener('click', () => g.quitToMenu());
    $('againBtn').addEventListener('click', () => { this.el.end.classList.add('hidden'); g.startMatch(); });
    $('menuBtn').addEventListener('click', () => { this.el.end.classList.add('hidden'); g.quitToMenu(); });
    if (g.isTouch) $('controlsCard').querySelector('.keys').innerHTML = '<span>Left stick: move (push far to sprint)</span><span>Drag right side: look</span><span>FIRE also aims while dragging</span><span>AIM toggles sights</span>';
  }

  syncSliders() { this.sliderSyncs.forEach((s) => s()); }

  showMenu() {
    this.el.menu.classList.remove('hidden');
    this.el.hud.classList.add('hidden');
    this.el.pause.classList.add('hidden');
    this.el.end.classList.add('hidden');
    $('touch').classList.add('hidden');
    $('optName').value = this.g.settings.name;
    this.syncSliders();
  }

  startMatch() {
    const g = this.g;
    this.el.menu.classList.add('hidden');
    this.el.end.classList.add('hidden');
    this.el.pause.classList.add('hidden');
    this.el.hud.classList.remove('hidden');
    if (g.isTouch) $('touch').classList.remove('hidden');
    this.el.feed.innerHTML = '';
    this.el.goal.textContent = `First to ${g.maxProgress}`;
    drawPortrait($('avatar'), g.settings.skin);
    this.showRespawn(false);
    this.lastWi = -1;
    this.updateScores();
  }

  showPause(on) {
    this.el.pause.classList.toggle('hidden', !on);
    if (on) this.syncSliders();
  }

  showEnd(winner) {
    const g = this.g, p = g.player, b = g.bot;
    const t = $('endTitle');
    t.className = 'end-title';
    if (!winner) { t.textContent = 'DRAW'; t.classList.add('draw'); $('endSub').textContent = 'Time ran out with the scores level.'; }
    else if (winner === p) {
      t.textContent = 'VICTORY';
      $('endSub').textContent = p.progress >= g.maxProgress ? `You finished the ladder with the Knife!` : `Time's up — you were further up the ladder.`;
    } else {
      t.textContent = 'DEFEAT'; t.classList.add('lose');
      $('endSub').textContent = b.progress >= g.maxProgress ? `${b.name} got the final knife kill.` : `Time's up — ${b.name} was further up the ladder.`;
    }
    const row = (f, cls) => `<tr class="${cls}"><td>${esc(f.name)}</td><td>${f.kills}</td><td>${f.deaths}</td><td>${f.bestStreak}</td><td>${f.shots ? Math.round((f.hits / f.shots) * 100) : 0}%</td><td>${f.headshots}</td><td>${this.iconsWhite[Math.min(8, Math.floor(f.progress / g.kpw))]}</td></tr>`;
    $('endBody').innerHTML = row(p, 'me') + row(b, 'foe');
    this.el.end.classList.remove('hidden');
    this.el.sb.classList.add('hidden');
    $('touch').classList.add('hidden');
  }

  showScoreboard(on) {
    this.el.sb.classList.toggle('hidden', !on);
    if (on) this.renderScoreboard();
  }

  renderScoreboard() {
    const g = this.g;
    const rows = [g.player, g.bot].sort((a, b) => b.progress - a.progress || b.kills - a.kills);
    this.el.sbBody.innerHTML = rows.map((f, i) => {
      const wi = Math.min(8, Math.floor(f.progress / g.kpw));
      return `<tr class="${f === g.player ? 'me' : 'foe'}"><td>${i + 1}</td><td>${esc(f.name)}${f.isBot ? ' <span class="muted">(BOT)</span>' : ''}</td><td>${this.iconsWhite[wi]}</td><td>${wi + 1}/9</td><td>${f.kills}</td><td>${f.deaths}</td><td>${f.streak}</td><td>${f.shots ? Math.round((f.hits / f.shots) * 100) : 0}%</td><td>${f.headshots}</td></tr>`;
    }).join('');
    this.el.sbTimer.textContent = this.fmtTime(g.timeLeft);
  }

  // ------------------------------------------------------------ events
  updateScores() {
    const g = this.g;
    this.el.scoreYou.textContent = g.player.progress;
    this.el.scoreEnemy.textContent = g.bot.progress;
    const pi = Math.min(8, Math.floor(g.player.progress / g.kpw)), bi = Math.min(8, Math.floor(g.bot.progress / g.kpw));
    this.ladderEls.forEach((el, i) => {
      el.classList.toggle('cur', i === pi);
      el.classList.toggle('done', i < pi);
      el.classList.toggle('enemy', i === bi);
    });
    if (!this.el.sb.classList.contains('hidden')) this.renderScoreboard();
  }

  feedAdd(killer, weaponId, victim, head) {
    const team = (f) => (f.team === 'blue' ? 'blue' : 'red');
    const icon = weaponId === 'melee' ? '<b style="color:#ffc21a">MELEE</b>' : this.iconsWhite[WEAPONS.findIndex((w) => w.id === weaponId)] || '';
    const div = document.createElement('div');
    div.className = 'kf';
    div.innerHTML = killer
      ? `<span class="${team(killer)}">${esc(killer.name)}</span>${icon}${head ? '<span class="hs">HEADSHOT</span>' : ''}<span class="${team(victim)}">${esc(victim.name)}</span>`
      : `<span class="${team(victim)}">${esc(victim.name)}</span>${icon}<span class="muted">suicide</span>`;
    this.el.feed.prepend(div);
    while (this.el.feed.children.length > 5) this.el.feed.lastChild.remove();
    setTimeout(() => { div.style.opacity = '0'; }, 5500);
    setTimeout(() => div.remove(), 6200);
  }

  banner(title, sub, kind = 'good', weapon = null) {
    const b = this.el.banner;
    b.className = 'show ' + kind;
    b.querySelector('.b-title').textContent = title;
    b.querySelector('.b-sub').textContent = sub || '';
    b.querySelector('.b-icon').innerHTML = weapon ? weaponIconSVG(weapon, { color: '#ffffff' }) : '';
    this.bannerT = 2.6;
  }

  toast(text) {
    this.el.toast.textContent = text;
    this.el.toast.classList.add('show');
    this.toastT = 2.4;
  }

  hitmarker(head, kill) {
    this.el.hit.className = kill ? 'kill' : head ? 'head' : '';
    this.el.hit.style.opacity = '1';
    this.hitT = kill ? 0.45 : 0.2;
  }

  damageFrom(pos) {
    const p = this.g.player;
    const a = yawTo(pos.x - p.pos.x, pos.z - p.pos.z);
    const d = document.createElement('div');
    d.className = 'dmgi';
    d.dataset.yaw = a;
    this.el.dmg.appendChild(d);
    this.orientDmg(d);
    requestAnimationFrame(() => setTimeout(() => { d.style.opacity = '0'; }, 400));
    setTimeout(() => d.remove(), 1400);
    this.el.flash.style.opacity = '1';
    this.flashT = 0.12;
  }

  orientDmg(d) {
    const rel = this.g.player.yaw - Number(d.dataset.yaw);
    d.style.transform = `rotate(${(rel * 180) / Math.PI}deg)`;
  }

  countdown(n) {
    const c = this.el.count;
    if (n < 0) { c.style.display = 'none'; return; }
    c.style.display = 'block';
    c.innerHTML = n === 0 ? 'GO!' : `${n}<small>MATCH BEGINS</small>`;
    if (n === 0) setTimeout(() => { if (this.g.state === 'playing') c.style.display = 'none'; }, 700);
  }

  showRespawn(on, killer, weaponId) {
    this.el.respawn.classList.toggle('hidden', !on);
    if (on) {
      const w = WEAPONS.find((x) => x.id === weaponId);
      this.el.killedBy.textContent = killer ? `Killed by ${killer.name}${weaponId === 'melee' ? ' (melee)' : w ? ' — ' + w.name : ''}` : 'You killed yourself';
      this.respawnTick(3);
    }
  }

  respawnTick(t) {
    this.el.respawnNum.textContent = Math.max(1, Math.ceil(t));
    this.el.respawnArc.style.strokeDashoffset = String(264 * (1 - clamp(t / 3, 0, 1)));
  }

  interactHint(text) {
    this.el.hint.style.display = text ? 'block' : 'none';
    if (text) this.el.hint.textContent = text;
    const use = $('tUse');
    if (use) use.classList.toggle('hidden', !text);
  }

  setScope(on) {
    this.el.scope.classList.toggle('on', !!on);
  }

  fmtTime(s) {
    s = Math.max(0, Math.ceil(s));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  resize() {}

  // ------------------------------------------------------------ per frame
  update(dt) {
    const g = this.g, p = g.player, w = WEAPONS[p.wi], E = this.el;
    E.timer.textContent = this.fmtTime(g.timeLeft);
    E.timer.classList.toggle('low', g.timeLeft < 60);

    if (this.lastWi !== p.wi) {
      this.lastWi = p.wi;
      E.wicon.innerHTML = this.iconsWhite[p.wi];
      E.wname.textContent = w.name;
      const nx = WEAPONS[p.wi + 1];
      E.next.textContent = nx ? `NEXT: ${nx.name}` : 'FINAL WEAPON — GET THE KILL!';
      E.cross.classList.toggle('knife', !!w.melee);
    }
    if (w.melee) { E.mag.textContent = '∞'; E.res.parentElement.style.display = 'none'; }
    else { E.mag.textContent = p.mag; E.res.textContent = p.reserve; E.res.parentElement.style.display = ''; }
    const low = !w.melee && (w.mag > 2 ? p.mag <= Math.ceil(w.mag * 0.25) : p.mag === 0);
    E.ammo.classList.toggle('low', low);
    E.health.style.width = `${clamp(p.health, 0, 100)}%`;

    let la = '';
    if (p.alive && !w.melee) {
      if (p.reloadT > 0) la = 'RELOADING…';
      else if (p.mag === 0 && p.reserve === 0) la = 'NO AMMO';
      else if (low) la = this.g.isTouch ? 'RELOAD' : 'RELOAD [R]';
    }
    if (E.lowammo.textContent !== la) E.lowammo.textContent = la;

    // crosshair
    const scoped = w.scope && p.ads > 0.85;
    const showCross = p.alive && p.ads < 0.5 && !p.sprinting;
    E.cross.style.opacity = showCross ? '1' : '0';
    if (showCross) {
      const px = (g.spreadFor(p, w) / Math.tan((g.camera.fov * Math.PI) / 360)) * (window.innerHeight / 2);
      const gap = clamp(px, 4, 120);
      const [t, b, l, r] = E.cross.children;
      t.style.top = `${-gap - 9}px`; b.style.top = `${gap}px`; l.style.left = `${-gap - 9}px`; r.style.left = `${gap}px`;
    }
    E.reddot.style.opacity = p.alive && p.ads > 0.8 && !scoped && !w.melee ? '1' : '0';

    // vignette & flashes
    E.vig.style.opacity = p.alive ? String(clamp((1 - p.health / 100) * 1.1, 0, 0.9)) : '0.6';
    if (this.flashT > 0) { this.flashT -= dt; if (this.flashT <= 0) E.flash.style.opacity = '0'; }
    if (this.hitT > 0) { this.hitT -= dt; if (this.hitT <= 0) E.hit.style.opacity = '0'; }
    if (this.bannerT > 0) { this.bannerT -= dt; if (this.bannerT <= 0) E.banner.classList.remove('show'); }
    if (this.toastT > 0) { this.toastT -= dt; if (this.toastT <= 0) E.toast.classList.remove('show'); }
    for (const d of E.dmg.children) this.orientDmg(d);

    // power-ups
    const chips = [];
    const P = [['speed', '#3fb6ff', '»', 'Speed Boost'], ['regen', '#3ad14a', '+', 'Health Regen'], ['damage', '#ff3d2e', '2x', 'Double Damage']];
    for (const [k, c, ic, label] of P) {
      const v = p.powers[k];
      if (v > 0) chips.push(`<div class="pu-chip" style="color:${c}"><span class="ic" style="background:${c};color:#fff">${ic}</span><span style="color:#fff">${label}</span><span class="bar"><i style="width:${(v / 15) * 100}%"></i></span></div>`);
    }
    if (p.uavT > 0) chips.push(`<div class="pu-chip" style="color:#9ad0ff"><span class="ic" style="background:#4a5fd0;color:#fff">✈</span><span style="color:#fff">UAV</span><span class="bar"><i style="width:${Math.min(100, (p.uavT / 20) * 100)}%"></i></span></div>`);
    const html = chips.join('');
    if (html !== this.puHtml) { E.pu.innerHTML = html; this.puHtml = html; }

    this.mmT -= dt;
    if (this.mmT <= 0) { this.mmT = 1 / 30; this.drawMinimap(); }
  }

  drawMinimap() {
    const g = this.g, c = this.mmCtx, mm = g.map.minimap, cv = this.el.mm;
    const W = cv.width, H = cv.height;
    c.clearRect(0, 0, W, H);
    c.drawImage(mm.canvas, 0, 0, W, H);
    const sx = W / mm.canvas.width, sz = H / mm.canvas.height;
    const X = (x) => mm.tx(x) * sx, Z = (z) => mm.tz(z) * sz;
    // pickups
    for (const p of g.pickups) {
      if (!p.active) continue;
      c.fillStyle = { speed: '#3fb6ff', health: '#3ad14a', damage: '#ff8a1c' }[p.type];
      c.beginPath(); c.arc(X(p.x), Z(p.z), 3, 0, Math.PI * 2); c.fill();
    }
    const b = g.bot, p = g.player;
    const botVisible = b.alive && (p.uavT > 0 || b.revealT > g.time);
    if (botVisible) {
      c.fillStyle = '#ff3b3b'; c.strokeStyle = '#fff'; c.lineWidth = 1.5;
      c.beginPath(); c.arc(X(b.pos.x), Z(b.pos.z), 4.5, 0, Math.PI * 2); c.fill(); c.stroke();
    }
    if (p.alive) {
      const x = X(p.pos.x), z = Z(p.pos.z);
      c.save();
      c.translate(x, z);
      c.rotate(-p.yaw);
      c.fillStyle = 'rgba(255,230,80,.18)';
      c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 34, -Math.PI / 2 - 0.6, -Math.PI / 2 + 0.6); c.closePath(); c.fill();
      c.fillStyle = '#ffd21a'; c.strokeStyle = '#2a1a00'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(0, -8); c.lineTo(6, 6); c.lineTo(0, 3); c.lineTo(-6, 6); c.closePath(); c.fill(); c.stroke();
      c.restore();
    }
  }
}
