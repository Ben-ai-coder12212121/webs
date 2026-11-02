import * as THREE from 'three';
import { WEAPON_BY_ID, LADDERS, WEAPON_CLASS, weaponIconSVG } from './weapons.js';
import { MAPS } from './map.js';
import { drawPortrait, SKINS, BLUE_SKINS } from './character.js';
import { DIFFICULTY } from './bot.js';
import { clamp, yawTo } from './util.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NADE_SVG = '<svg viewBox="0 0 20 24"><rect x="7" y="0" width="6" height="4" fill="#cfd4da"/><path d="M13 2h4v3h-2v-1h-2z" fill="#cfd4da"/><ellipse cx="10" cy="14" rx="7.5" ry="9" fill="#6a7a44"/><path d="M3 12h14M3 16h14M10 5v18" stroke="#3d4a2a" stroke-width="1.2"/></svg>';
const STRIKE_SVG = '<svg viewBox="0 0 40 18"><path d="M2 9h26l8-5v10l-8-5" fill="#f2f5fa"/><path d="M12 9l-6-7h4l9 7l-9 7h-4z" fill="#f2f5fa"/></svg>';
const tmpV = new THREE.Vector3();

export class Hud {
  constructor(game) {
    this.g = game;
    this.iconCache = new Map();
    this.el = {
      hud: $('hud'), menu: $('menu'), pause: $('pause'), end: $('endscreen'),
      scoreYou: $('scoreYou'), scoreEnemy: $('scoreEnemy'), goal: $('goalText'), timer: $('timer'),
      ladder: $('ladder'), feed: $('killfeed'), mm: $('minimap'), pu: $('powerups'),
      wicon: $('wicon'), wname: $('wname'), mag: $('ammoMag'), res: $('ammoRes'), next: $('nextWeapon'), ammo: document.querySelector('.ammo'),
      health: $('healthfill'), armor: $('armorfill'), nades: $('nades'), cross: $('crosshair'), reddot: $('reddot'), hit: $('hitmarker'), scope: $('scope'),
      vig: $('vignette'), flash: $('dmgflash'), dmg: $('dmgIndicators'), count: $('countdown'), banner: $('banner'),
      toast: $('toast'), hint: $('hint'), lowammo: $('lowammo'), respawn: $('respawn'), respawnNum: $('respawnNum'),
      respawnArc: $('respawnArc'), killedBy: $('killedBy'), sb: $('scoreboard'), sbBody: $('sbdBody'), sbTimer: $('sbdTimer'),
      medals: $('medals'), dmgnums: $('dmgnums'), nadewarn: $('nadewarn'), finale: $('finale'), spin: $('spinbar'),
    };
    this.mmCtx = this.el.mm.getContext('2d');
    this.hitT = 0; this.bannerT = 0; this.toastT = 0; this.flashT = 0;
    this.lastWi = -1; this.lastWid = null; this.mmT = 0;
    this.medalQ = []; this.medalT = 0;
    this.nums = [];
    this.warns = [];
    this.buildMenu();
    if (game.isTouch) document.body.classList.add('touch');
    this.buildLadder();
  }

  icon(w, white = true) {
    const k = w.id + (white ? 'w' : 'c');
    if (!this.iconCache.has(k)) this.iconCache.set(k, weaponIconSVG(w, white ? { color: '#f2f5fa' } : {}));
    return this.iconCache.get(k);
  }

  iconFor(id) {
    if (id === 'grenade') return NADE_SVG;
    if (id === 'airstrike') return STRIKE_SVG;
    if (id === 'melee') return '<b style="color:#ffc21a">MELEE</b>';
    return WEAPON_BY_ID[id] ? this.icon(WEAPON_BY_ID[id]) : '';
  }

  buildLadder() {
    const L = this.g.ladder;
    this.el.ladder.innerHTML = L.map((w, i) => `<div class="lv" data-i="${i}" title="${esc(w.name)}"><span class="num">${i + 1}</span>${this.icon(w)}<i class="pip"></i></div>`).join('');
    this.el.ladder.classList.toggle('compact', L.length > 12);
    this.ladderEls = [...this.el.ladder.children];
  }

  // ------------------------------------------------------------ menu
  buildMenu() {
    const g = this.g, S = g.settings;
    const seg = (id, options, key, cast = (v) => v, after = null) => {
      const el = $(id);
      el.innerHTML = options.map(([v, label, title]) => `<button data-v="${v}"${title ? ` title="${esc(title)}"` : ''}>${label}</button>`).join('');
      const sync = () => [...el.children].forEach((b) => b.classList.toggle('on', String(S[key]) === b.dataset.v));
      el.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        S[key] = cast(b.dataset.v);
        sync();
        g.saveSettings();
        after && after();
      });
      sync();
      return sync;
    };
    seg('optDiff', Object.entries(DIFFICULTY).map(([k, d]) => [k, d.label]), 'difficulty');
    seg('optKpw', [['1', '1 per weapon'], ['2', '2 per weapon']], 'kpw', Number, () => this.syncLadderPreview());
    seg('optTime', [['5', '5 min'], ['10', '10 min'], ['15', '15 min']], 'time', Number);
    seg('optLight', [['auto', 'Map'], ['day', 'Day'], ['sunset', 'Sunset'], ['night', 'Night']], 'lighting', String, () => g.applyLighting());
    seg('optLadder', Object.entries(LADDERS).map(([k, l]) => [k, l.name, l.desc]), 'ladder', String, () => this.syncLadderPreview());

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
      g.vmWeaponId = null; // rebuild the arms in the new sleeves
    });
    syncSkin();

    // map picker: clicking a map loads it behind the menu as a preview
    const mp = $('mapPicker');
    mp.innerHTML = MAPS.map((m) => `<button class="map" data-id="${m.id}" type="button"><div class="thumb ${m.thumb}">${m.id === 'nuketown' ? '<span>Welcome to<b>NUKETOWN</b></span>' : `<span class="tname">${esc(m.short)}</span>`}</div><div class="mname">${esc(m.name)}</div><div class="mblurb">${esc(m.blurb)}</div></button>`).join('');
    const syncMap = () => [...mp.children].forEach((b) => b.classList.toggle('active', b.dataset.id === S.map));
    mp.addEventListener('click', (e) => {
      const b = e.target.closest('.map');
      if (!b || b.dataset.id === S.map) return;
      S.map = b.dataset.id; g.saveSettings(); syncMap();
      mp.classList.add('loading');
      // let the highlight paint before the (brief) rebuild
      setTimeout(() => { g.loadMap(S.map); mp.classList.remove('loading'); }, 30);
    });
    syncMap();
    this.syncMap = syncMap;
    this.syncLadderPreview();

    $('playBtn').addEventListener('click', () => g.startMatch());
    $('resumeBtn').addEventListener('click', () => g.resume());
    $('quitBtn').addEventListener('click', () => g.quitToMenu());
    $('quickBtn').addEventListener('click', () => g.online.quick());
    $('friendBtn').addEventListener('click', () => g.online.friend());
    $('againBtn').addEventListener('click', () => {
      if (g.net) { g.online.rematch(); return; }
      this.el.end.classList.add('hidden');
      g.startMatch();
    });
    $('menuBtn').addEventListener('click', () => { this.el.end.classList.add('hidden'); g.quitToMenu(); });
    if (g.isTouch) $('controlsCard').querySelector('.keys').innerHTML = '<span>Left stick: move (push far to sprint)</span><span>Drag right side: look</span><span>FIRE also aims while dragging</span><span>AIM toggles sights</span><span>NADE throws a grenade</span><span>CROUCH while sprinting to slide</span>';
  }

  syncLadderPreview() {
    const S = this.g.settings, L = LADDERS[S.ladder] || LADDERS.standard;
    const box = $('ladderPreview');
    if (!L.ids) {
      box.innerHTML = '<div class="lp random">10 random guns, easiest first, then the <b>Knife</b>. Rolled fresh every match.</div>';
    } else {
      box.innerHTML = L.ids.map((id, i) => {
        const w = WEAPON_BY_ID[id];
        return `<div class="lp">${this.icon(w, false)}<span>${i + 1}. ${esc(w.name)}<small>${WEAPON_CLASS[id] || ''}</small></span></div>`;
      }).join('');
    }
    const n = L.ids ? L.ids.length : 11;
    $('ladderCount').textContent = `${n} weapons · first to ${n * (S.kpw || 1)}`;
  }

  mapChanged() {
    const m = this.g.map;
    $('ribbon').textContent = m.name.toUpperCase();
    $('sbdMap').textContent = 'GUN GAME: ' + m.name.toUpperCase();
    if (this.syncMap) this.syncMap();
  }

  syncSliders() { this.sliderSyncs.forEach((s) => s()); }

  showMenu() {
    this.el.menu.classList.remove('hidden');
    this.el.hud.classList.add('hidden');
    this.el.pause.classList.add('hidden');
    this.el.end.classList.add('hidden');
    $('touch').classList.add('hidden');
    $('optName').value = this.g.settings.name;
    // an online match may have switched maps; show the one picked in the menu again
    if (this.g.map.id !== this.g.settings.map) this.g.loadMap(this.g.settings.map);
    this.mapChanged();
    this.syncSliders();
  }

  startMatch() {
    const g = this.g;
    this.el.menu.classList.add('hidden');
    this.el.end.classList.add('hidden');
    this.el.pause.classList.add('hidden');
    this.el.hud.classList.remove('hidden');
    this.el.finale.classList.remove('show');
    if (g.isTouch) $('touch').classList.remove('hidden');
    this.el.feed.innerHTML = '';
    this.el.medals.innerHTML = ''; this.medalQ = [];
    this.el.dmgnums.innerHTML = ''; this.nums = [];
    this.el.goal.textContent = `First to ${g.maxProgress}`;
    drawPortrait($('avatar'), g.settings.skin);
    this.showRespawn(false);
    this.lastWi = -1; this.lastWid = null;
    this.buildLadder();
    this.mapChanged();
    this.updateScores();
  }

  showPause(on, online = false) {
    this.el.pause.classList.toggle('hidden', !on);
    $('pauseNote').classList.toggle('hidden', !online);
    $('quitBtn').textContent = online ? 'LEAVE MATCH' : 'QUIT TO MENU';
    if (on) this.syncSliders();
  }

  finale(win) {
    const f = this.el.finale;
    f.querySelector('.f-title').textContent = win ? 'FINAL KILL' : 'GAME OVER';
    f.className = 'show ' + (win ? 'win' : 'lose');
    this.el.banner.classList.remove('show');
  }

  // opts.note: why the match stopped early (e.g. the opponent left); opts.online: offer a rematch
  showEnd(winner, opts = {}) {
    const g = this.g, p = g.player, b = g.bot;
    const t = $('endTitle');
    t.className = 'end-title';
    this.el.finale.classList.remove('show');
    this.showRespawn(false);
    this.rematchNote(null);
    $('againBtn').textContent = opts.online ? 'REMATCH' : 'PLAY AGAIN';
    $('againBtn').disabled = false;
    if (opts.note) { t.textContent = 'MATCH ENDED'; t.classList.add('draw'); $('endSub').textContent = opts.note; }
    else if (!winner) { t.textContent = 'DRAW'; t.classList.add('draw'); $('endSub').textContent = 'Time ran out with the scores level.'; }
    else if (winner === p) {
      t.textContent = 'VICTORY';
      $('endSub').textContent = p.progress >= g.maxProgress ? `You finished the ladder with the Knife on ${g.map.name}!` : `Time's up. You were further up the ladder.`;
    } else {
      t.textContent = 'DEFEAT'; t.classList.add('lose');
      $('endSub').textContent = b.progress >= g.maxProgress ? `${b.name} got the final knife kill.` : `Time's up. ${b.name} was further up the ladder.`;
    }
    const L = g.ladder;
    const row = (f, cls) => `<tr class="${cls}"><td>${esc(f.name)}</td><td>${f.kills}</td><td>${f.deaths}</td><td>${f.bestStreak}</td><td>${f.shots ? Math.round((f.hits / f.shots) * 100) : 0}%</td><td>${f.headshots}</td><td>${f === p ? f.medals : '–'}</td><td>${this.icon(L[Math.min(L.length - 1, Math.floor(f.progress / g.kpw))])}</td></tr>`;
    $('endBody').innerHTML = row(p, 'me') + row(b, 'foe');
    this.el.end.classList.remove('hidden');
    this.el.sb.classList.add('hidden');
    $('touch').classList.add('hidden');
  }

  // A line under the end-of-match stats; disable: no rematch possible (the opponent is gone).
  rematchNote(text, disable = false) {
    const n = $('endNote');
    n.textContent = text || '';
    n.classList.toggle('hidden', !text);
    if (disable) { $('againBtn').disabled = true; $('againBtn').textContent = 'REMATCH'; }
  }

  showScoreboard(on) {
    this.el.sb.classList.toggle('hidden', !on);
    if (on) this.renderScoreboard();
  }

  renderScoreboard() {
    const g = this.g, L = g.ladder;
    const rows = [g.player, g.bot].sort((a, b) => b.progress - a.progress || b.kills - a.kills);
    this.el.sbBody.innerHTML = rows.map((f, i) => {
      const wi = Math.min(L.length - 1, Math.floor(f.progress / g.kpw));
      return `<tr class="${f === g.player ? 'me' : 'foe'}"><td>${i + 1}</td><td>${esc(f.name)}${f.isBot ? ' <span class="muted">(BOT)</span>' : ''}</td><td>${this.icon(L[wi])}</td><td>${wi + 1}/${L.length}</td><td>${f.kills}</td><td>${f.deaths}</td><td>${f.streak}</td><td>${f.shots ? Math.round((f.hits / f.shots) * 100) : 0}%</td><td>${f.headshots}</td></tr>`;
    }).join('');
    this.el.sbTimer.textContent = this.fmtTime(g.timeLeft);
  }

  // ------------------------------------------------------------ events
  updateScores() {
    const g = this.g, L = g.ladder;
    this.el.scoreYou.textContent = g.player.progress;
    this.el.scoreEnemy.textContent = g.bot.progress;
    const pi = Math.min(L.length - 1, Math.floor(g.player.progress / g.kpw)), bi = Math.min(L.length - 1, Math.floor(g.bot.progress / g.kpw));
    (this.ladderEls || []).forEach((el, i) => {
      el.classList.toggle('cur', i === pi);
      el.classList.toggle('done', i < pi);
      el.classList.toggle('enemy', i === bi);
    });
    if (!this.el.sb.classList.contains('hidden')) this.renderScoreboard();
  }

  feedAdd(killer, weaponId, victim, head) {
    const team = (f) => (f.team === 'blue' ? 'blue' : 'red');
    const icon = this.iconFor(weaponId);
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

  medal(title, sub) {
    this.medalQ.push([title, sub]);
  }

  showNextMedal() {
    const [title, sub] = this.medalQ.shift();
    const d = document.createElement('div');
    d.className = 'medal';
    const hue = [...title].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    d.innerHTML = `<div class="m-badge" style="--h:${hue}"><span>${esc(title.split(' ').map((w) => w[0]).join('').slice(0, 2))}</span></div><div class="m-text"><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div>`;
    this.el.medals.appendChild(d);
    while (this.el.medals.children.length > 3) this.el.medals.firstChild.remove();
    setTimeout(() => d.classList.add('out'), 2200);
    setTimeout(() => d.remove(), 2700);
    this.medalT = 0.35;
  }

  damageNumber(pos, amount, head) {
    if (!this.g.settings.dmgNumbers) return;
    const d = document.createElement('div');
    d.className = 'dnum' + (head ? ' head' : '');
    d.textContent = Math.round(amount);
    this.el.dmgnums.appendChild(d);
    this.nums.push({ el: d, pos: new THREE.Vector3(pos.x + (Math.random() - 0.5) * 0.3, pos.y + 0.2, pos.z + (Math.random() - 0.5) * 0.3), t: 0 });
    if (this.nums.length > 10) { const o = this.nums.shift(); o.el.remove(); }
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
    c.innerHTML = n === 0 ? 'GO!' : `${n}<small>${esc(this.g.map.name.toUpperCase())}</small>`;
    if (n === 0) setTimeout(() => { if (this.g.state === 'playing') c.style.display = 'none'; }, 700);
  }

  showRespawn(on, killer, weaponId) {
    this.el.respawn.classList.toggle('hidden', !on);
    if (on) {
      const w = WEAPON_BY_ID[weaponId];
      const how = weaponId === 'melee' ? ' (melee)' : weaponId === 'grenade' ? ' with a grenade' : weaponId === 'airstrike' ? ' with an airstrike' : w ? ' with the ' + w.name : '';
      this.el.killedBy.textContent = killer ? `Killed by ${killer.name}${how}` : 'You killed yourself';
      this.respawnTick(3);
    }
  }

  respawnTick(t) {
    this.el.respawnNum.textContent = Math.max(1, Math.ceil(t));
    this.el.respawnArc.style.strokeDashoffset = String(264 * (1 - clamp(t / 3, 0, 1)));
  }

  interactHint(text) {
    const cur = this.el.hint.dataset.t || '';
    if ((text || '') === cur) return;
    this.el.hint.dataset.t = text || '';
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

  // screen position of a world point, or null when behind the camera
  project(v) {
    tmpV.copy(v).project(this.g.camera);
    if (tmpV.z > 1) return null;
    return { x: (tmpV.x * 0.5 + 0.5) * window.innerWidth, y: (-tmpV.y * 0.5 + 0.5) * window.innerHeight };
  }

  // ------------------------------------------------------------ per frame
  update(dt) {
    const g = this.g, p = g.player, w = g.W(p), E = this.el, L = g.ladder;
    E.timer.textContent = this.fmtTime(g.timeLeft);
    E.timer.classList.toggle('low', g.timeLeft < 60);

    if (this.lastWid !== w.id || this.lastWi !== p.wi) {
      this.lastWi = p.wi; this.lastWid = w.id;
      E.wicon.innerHTML = this.icon(w);
      E.wname.textContent = w.name;
      const nx = L[p.wi + 1];
      E.next.textContent = nx ? `NEXT: ${nx.name}` : 'FINAL WEAPON: GET THE KILL!';
      E.cross.classList.toggle('knife', !!w.melee);
    }
    if (w.melee) { E.mag.textContent = '∞'; E.res.parentElement.style.display = 'none'; }
    else { E.mag.textContent = p.mag; E.res.textContent = p.reserve; E.res.parentElement.style.display = ''; }
    const low = !w.melee && (w.mag > 2 ? p.mag <= Math.ceil(w.mag * 0.25) : p.mag === 0);
    E.ammo.classList.toggle('low', low);
    E.health.style.width = `${clamp(p.health, 0, 100)}%`;
    E.armor.style.width = `${clamp(p.armor, 0, 100)}%`;
    const nh = `${NADE_SVG.repeat(Math.max(0, p.grenades))}<span>${g.isTouch ? '' : '[G]'}</span>`;
    if (this.nadeHtml !== nh) { E.nades.innerHTML = nh; this.nadeHtml = nh; }
    E.spin.style.display = w.spinup ? 'block' : 'none';
    if (w.spinup) E.spin.firstChild.style.width = `${p.spin * 100}%`;

    let la = '';
    if (p.alive && !w.melee) {
      if (p.reloadT > 0) la = 'RELOADING…';
      else if (p.mag === 0 && p.reserve === 0) la = 'NO AMMO';
      else if (low) la = this.g.isTouch ? 'RELOAD' : 'RELOAD [R]';
    }
    if (E.lowammo.textContent !== la) E.lowammo.textContent = la;

    // crosshair
    const scoped = w.scope && p.ads > 0.85;
    const showCross = p.alive && p.ads < 0.5 && !p.sprinting && g.state !== 'finale';
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

    // medals pop in one after another
    this.medalT -= dt;
    if (this.medalQ.length && this.medalT <= 0) this.showNextMedal();

    // floating damage numbers
    for (let i = this.nums.length - 1; i >= 0; i--) {
      const n = this.nums[i];
      n.t += dt;
      n.pos.y += dt * 0.9;
      const s = n.t < 0.9 ? this.project(n.pos) : null;
      if (!s) { n.el.remove(); this.nums.splice(i, 1); continue; }
      n.el.style.transform = `translate(${s.x}px, ${s.y}px) scale(${1 + Math.max(0, 0.25 - n.t) * 2})`;
      n.el.style.opacity = String(clamp(1.4 - n.t * 1.6, 0, 1));
    }

    // grenade danger icons
    let wi = 0;
    if (p.alive) for (const pr of g.projectiles) {
      if (!pr.w.bounce || pr.owner === p || pr.stuck > 0) continue;
      const d = pr.pos.distanceTo(p.pos);
      if (d > pr.w.radius + 2) continue;
      let el = this.warns[wi];
      if (!el) { el = document.createElement('div'); el.className = 'nwarn'; el.innerHTML = NADE_SVG; E.nadewarn.appendChild(el); this.warns.push(el); }
      wi++;
      const s = this.project(pr.pos);
      let x, y;
      if (s && s.x > 30 && s.x < innerWidth - 30 && s.y > 30 && s.y < innerHeight - 30) { x = s.x; y = s.y - 40; }
      else {
        // off screen: pin it to a ring around the crosshair, pointing toward it
        const a = yawTo(pr.pos.x - p.pos.x, pr.pos.z - p.pos.z) - p.yaw;
        x = innerWidth / 2 - Math.sin(a) * 140; y = innerHeight / 2 - Math.cos(a) * 140;
      }
      el.style.display = 'block';
      el.style.transform = `translate(${x}px, ${y}px)`;
      el.classList.toggle('close', d < pr.w.radius * 0.6);
    }
    for (let i = wi; i < this.warns.length; i++) this.warns[i].style.display = 'none';

    // power-ups
    const chips = [];
    const P = [['speed', '#3fb6ff', 'S', 'Speed Boost'], ['regen', '#3ad14a', '+', 'Health Regen'], ['damage', '#ff3d2e', '2x', 'Double Damage']];
    for (const [k, c, ic, label] of P) {
      const v = p.powers[k];
      if (v > 0) chips.push(`<div class="pu-chip" style="color:${c}"><span class="ic" style="background:${c};color:#fff">${ic}</span><span style="color:#fff">${label}</span><span class="bar"><i style="width:${(v / 15) * 100}%"></i></span></div>`);
    }
    if (p.uavT > 0) chips.push(`<div class="pu-chip" style="color:#9ad0ff"><span class="ic" style="background:#4a5fd0;color:#fff">U</span><span style="color:#fff">UAV</span><span class="bar"><i style="width:${Math.min(100, (p.uavT / 20) * 100)}%"></i></span></div>`);
    if (p.armor > 0) chips.push(`<div class="pu-chip" style="color:#a99dff"><span class="ic" style="background:#6a5de0;color:#fff">A</span><span style="color:#fff">Armor</span><span class="bar"><i style="width:${p.armor}%"></i></span></div>`);
    const nextStreak = [3, 5, 7].find((n) => n > p.streak);
    if (p.streak > 0 && nextStreak) chips.push(`<div class="pu-chip streak"><span class="ic">${p.streak}</span><span>Streak · ${nextStreak - p.streak} to ${{ 3: 'UAV', 5: 'Armor', 7: 'Airstrike' }[nextStreak]}</span></div>`);
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
      c.fillStyle = { speed: '#3fb6ff', health: '#3ad14a', damage: '#ff8a1c', armor: '#a99dff' }[p.type];
      c.beginPath(); c.arc(X(p.x), Z(p.z), 3, 0, Math.PI * 2); c.fill();
    }
    // jump pads
    c.fillStyle = '#ffd23a';
    for (const pd of g.map.pads) { c.fillRect(X(pd.x) - 2.5, Z(pd.z) - 2.5, 5, 5); }
    // incoming airstrike
    for (const s of g.strikes) {
      c.strokeStyle = 'rgba(255,60,40,.9)'; c.lineWidth = 1.5;
      c.beginPath(); c.arc(X(s.x), Z(s.z), 7, 0, Math.PI * 2); c.stroke();
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
