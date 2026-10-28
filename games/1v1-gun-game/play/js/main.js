import * as THREE from 'three';
import { buildMap, BOUNDS } from './map.js';
import { moveBody, raycastWorld, rayBox, lineOfSight, bodyBlocked, world } from './physics.js';
import { WEAPONS, buildWeaponModel, weaponIconSVG } from './weapons.js';
import { buildCharacter, setCharacterWeapon, animateCharacter, drawPortrait, SKINS, BLUE_SKINS, RED_SKINS } from './character.js';
import { BotBrain, DIFFICULTY } from './bot.js';
import { Effects } from './effects.js';
import { Audio } from './audio.js';
import { makeTextures } from './textures.js';
import { clamp, lerp, rand, pick, angleDiff, dirFromYawPitch, yawTo, loadSettings, saveSettings } from './util.js';
import { Hud } from './hud.js';
import { TouchControls } from './touch.js';
import { Online } from './online.js';

const DEFAULTS = {
  name: 'BenAsm', skin: 'blue', difficulty: 'normal', kpw: 1, time: 10, sens: 1.0, fov: 78, volume: 0.7, lighting: 'day',
};
const BOT_NAMES = ['Viper', 'Havoc', 'Reaper', 'Spectre', 'Nomad', 'Blitz', 'Ghost', 'Rook'];
const BASE_SPEED = 5.4;
const VM_SCALE = 0.78; // first-person weapon size
const NET_RATE = 1 / 20; // position updates per second sent to the opponent
const NET_DELAY = 100;   // ms the opponent is drawn in the past, so motion stays smooth
const WEAPON_IDS = new Set([...WEAPONS.map((w) => w.id), 'melee']);
const r2 = (v) => Math.round(v * 100) / 100;
const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3();

class Fighter {
  constructor(name, team, isBot) {
    this.name = name; this.team = team; this.isBot = isBot;
    this.pos = new THREE.Vector3(); this.vel = new THREE.Vector3();
    this.hw = 0.35; this.h = 1.75; this.onGround = false; this.hitWall = false;
    this.yaw = 0; this.pitch = 0; this.crouch = 0;
    this.intent = { mx: 0, mz: 0, jump: false, crouch: false, fire: false, ads: false, reload: false, melee: false, sprint: false };
    this.resetMatch();
  }
  resetMatch() {
    this.progress = 0; this.kills = 0; this.deaths = 0; this.streak = 0; this.bestStreak = 0;
    this.shots = 0; this.hits = 0; this.headshots = 0; this.uavT = 0;
    this.powers = { speed: 0, regen: 0, damage: 0 };
    this.alive = false; this.health = 100; this.respawnT = 0; this.lastHurt = -99; this.lastShot = -99;
    this.wi = 0; this.mag = 0; this.reserve = 0; this.reloadT = 0; this.nextFire = 0; this.switchT = 0;
    this.meleeT = 0; this.meleeAnim = 0; this.ads = 0; this.bloom = 0; this.triggerReady = true; this.sprinting = false;
    this.stepAcc = 0; this.spawnProtect = 0; this.revealT = 0;
  }
}

class Game {
  constructor() {
    this.settings = loadSettings(DEFAULTS);
    this.time = 0;
    this.state = 'menu';
    this.canvas = document.getElementById('game');
    this.isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    // When embedded on detourr.net, follow the site's Graphics (Low) setting.
    this.lowGfx = (() => { try { return sessionStorage.getItem('unb_gfx') === 'low'; } catch (e) { return false; } })();

    const r = this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: !this.isTouch, powerPreference: 'high-performance' });
    r.setPixelRatio(this.lowGfx ? 1 : Math.min(window.devicePixelRatio, this.isTouch ? 1.25 : 1.5));
    r.shadowMap.enabled = !this.lowGfx;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.autoClear = false;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(this.settings.fov, 1, 0.05, 900);
    this.camera.rotation.order = 'YXZ';
    this.scene.add(this.camera);

    this.viewScene = new THREE.Scene();
    this.viewCam = new THREE.PerspectiveCamera(58, 1, 0.01, 10);
    this.viewScene.add(new THREE.HemisphereLight(0xdfefff, 0x504840, 2.2));
    const vl = new THREE.DirectionalLight(0xffffff, 2.2);
    vl.position.set(0.5, 1, 0.4);
    this.viewScene.add(vl);

    this.setupSky();
    this.map = buildMap(this.scene);
    this.effects = new Effects(this.scene);
    this.audio = new Audio();
    this.audio.setVolume(this.settings.volume);
    // The site's Sound button stores unb_muted; a change in the parent page fires 'storage' here.
    const siteMuted = () => { try { return JSON.parse(localStorage.getItem('unb_muted')) === true; } catch (e) { return false; } };
    this.audio.setMuted(siteMuted());
    window.addEventListener('storage', (e) => { if (e.key === 'unb_muted') this.audio.setMuted(siteMuted()); });
    this.camoTex = makeTextures().camo;

    this.player = new Fighter(this.settings.name, 'blue', false);
    this.bot = new Fighter(pick(BOT_NAMES), 'red', true);
    this.brain = new BotBrain(this, this.bot, this.player, this.settings.difficulty);
    this.botSkin = 'red';
    this.botModel = buildCharacter(this.botSkin, this.camoTex);
    this.scene.add(this.botModel);
    this.botModel.visible = false;
    this.botFlash = new THREE.Object3D();

    this.rockets = [];
    this.setupPickups();
    this.setupViewmodel();
    this.applyLighting();

    this.hud = new Hud(this);
    this.input = { keys: {}, fire: false, ads: false, jumpQueued: false, reloadQueued: false, meleeQueued: false, crouchToggle: false, lookDX: 0, lookDY: 0 };
    this.setupInput();
    if (this.isTouch) this.touch = new TouchControls(this);
    this.net = null;              // the Online session while an online match runs
    this.online = new Online(this);

    this.menuAngle = 0;
    this.shake = 0;
    this.vmKick = 0; this.vmSway = { x: 0, y: 0 }; this.bobPhase = 0;
    this.deathCam = 0;

    window.addEventListener('resize', () => this.resize());
    this.resize();
    this.hud.showMenu();

    this.last = performance.now();
    this.renderer.setAnimationLoop(() => this.frame());
    window.__game = this;
  }

  // ---------------------------------------------------------------- setup
  setupSky() {
    const geo = new THREE.SphereGeometry(600, 32, 16);
    this.skyUniforms = {
      top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, bottom: { value: new THREE.Color() },
      sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunColor: { value: new THREE.Color() },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.skyUniforms, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; uniform vec3 sunDir; uniform vec3 sunColor; varying vec3 vDir;
        void main(){ float h = vDir.y; vec3 c = h > 0.0 ? mix(horizon, top, pow(min(1.0, h * 1.7), 0.75)) : mix(horizon, bottom, min(1.0, -h * 5.0));
        float s = max(0.0, dot(normalize(vDir), normalize(sunDir)));
        c += sunColor * (pow(s, 900.0) * 2.0 + pow(s, 14.0) * 0.3);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
        }`,
    });
    this.sky = new THREE.Mesh(geo, mat);
    this.sky.renderOrder = -1;
    this.scene.add(this.sky);

    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xffffff, 2.5);
    this.sun.castShadow = true;
    const sz = this.isTouch ? 1024 : 2048;
    this.sun.shadow.mapSize.set(sz, sz);
    const sc = this.sun.shadow.camera;
    sc.left = -44; sc.right = 44; sc.top = 44; sc.bottom = -44; sc.near = 1; sc.far = 220;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.03;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);

    // fluffy clouds
    this.clouds = new THREE.Group();
    const cmat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x777777, fog: false });
    for (let i = 0; i < 14; i++) {
      const cg = new THREE.Group();
      const n = 4 + Math.floor(Math.random() * 4);
      for (let k = 0; k < n; k++) {
        const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), cmat);
        m.position.set((k - n / 2) * 5 + rand(-2, 2), rand(-1, 2), rand(-3, 3));
        m.scale.set(rand(5, 9), rand(3.5, 5.5), rand(4, 7));
        cg.add(m);
      }
      const a = Math.random() * Math.PI * 2, rr = rand(120, 320);
      cg.position.set(Math.cos(a) * rr, rand(70, 110), Math.sin(a) * rr);
      cg.rotation.y = Math.random() * Math.PI;
      this.clouds.add(cg);
    }
    this.scene.add(this.clouds);
  }

  applyLighting() {
    const sunset = this.settings.lighting === 'sunset';
    const U = this.skyUniforms;
    if (sunset) {
      U.top.value.set(0x2b3a7a); U.horizon.value.set(0xff9a5c); U.bottom.value.set(0x40303a); U.sunColor.value.set(0xffb070);
      this.hemi.color.set(0xffc8a0); this.hemi.groundColor.set(0x4a3a48); this.hemi.intensity = 1.1;
      this.sun.color.set(0xffa25a); this.sun.intensity = 2.6;
      this.sun.position.set(-90, 32, -45);
      this.scene.fog = new THREE.Fog(0xf2a273, 70, 330);
    } else {
      U.top.value.set(0x3a8ae0); U.horizon.value.set(0xc4e4ff); U.bottom.value.set(0x9ab38a); U.sunColor.value.set(0xfff4d6);
      this.hemi.color.set(0xd6ecff); this.hemi.groundColor.set(0x5d7a45); this.hemi.intensity = 1.35;
      this.sun.color.set(0xfff0d8); this.sun.intensity = 2.9;
      this.sun.position.set(45, 80, 30);
      this.scene.fog = new THREE.Fog(0xc4e4ff, 90, 380);
    }
    U.sunDir.value.copy(this.sun.position).normalize();
    for (const c of this.clouds.children) c.children.forEach((m) => m.material.emissive.set(sunset ? 0x7a4a40 : 0x777777));
  }

  setupPickups() {
    const defs = {
      speed: { color: 0x3fb6ff, label: 'SPEED BOOST' },
      health: { color: 0x3ad14a, label: 'HEALTH REGEN' },
      damage: { color: 0xff3d2e, label: 'DOUBLE DAMAGE' },
    };
    this.pickupDefs = defs;
    this.pickups = this.map.pickups.map((p) => {
      const g = new THREE.Group();
      const d = defs[p.type];
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.06, 8, 28), new THREE.MeshBasicMaterial({ color: d.color }));
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.06;
      g.add(ring);
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.08, 24), new THREE.MeshLambertMaterial({ color: 0x2a2d33 }));
      pad.position.y = 0.04;
      g.add(pad);
      const icon = new THREE.Group();
      icon.position.y = 1.0;
      const em = new THREE.MeshLambertMaterial({ color: d.color, emissive: d.color, emissiveIntensity: 0.55 });
      if (p.type === 'speed') {
        const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), em); m.scale.y = 1.4; icon.add(m);
      } else if (p.type === 'health') {
        const white = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x777777 });
        icon.add(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.22), white));
        const a = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.13, 0.25), em); icon.add(a);
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.4, 0.25), em); icon.add(b);
      } else {
        const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), em); icon.add(m);
        const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), new THREE.MeshBasicMaterial({ color: 0xffa040, wireframe: true })); icon.add(s);
      }
      g.add(icon);
      g.position.set(p.x, p.y, p.z);
      this.scene.add(g);
      return { ...p, active: true, respawnT: 0, mesh: g, icon, phase: Math.random() * 6 };
    });
  }

  setupViewmodel() {
    this.vm = new THREE.Group();
    this.viewScene.add(this.vm);
    this.vmFlash = new THREE.Sprite(new THREE.SpriteMaterial({ map: null, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.vmFlash.visible = false;
    this.vmWeapon = -1;
  }

  buildViewWeapon(idx) {
    const w = WEAPONS[idx];
    this.vm.clear();
    const gun = buildWeaponModel(w);
    this.vm.add(gun);
    const sk = SKINS[this.settings.skin] || SKINS.blue;
    const sleeve = new THREE.MeshLambertMaterial({ color: sk.top, map: sk.pattern === 'camo' ? this.camoTex : null });
    const glove = new THREE.MeshLambertMaterial({ color: 0x1b1b1d });
    const unit = new THREE.BoxGeometry(1, 1, 1);
    const limb = (hand, elbow, shoulder) => {
      const H = new THREE.Vector3(...hand), E = new THREE.Vector3(...elbow), S = new THREE.Vector3(...shoulder);
      for (const [a, b, th] of [[H, E, 0.075], [E, S, 0.09]]) {
        const len = a.distanceTo(b);
        const m = new THREE.Mesh(unit, sleeve);
        m.position.copy(a).add(b).multiplyScalar(0.5);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tmpV.copy(b).sub(a).normalize());
        m.scale.set(th, th, len);
        this.vm.add(m);
      }
      const g = new THREE.Mesh(unit, glove);
      g.position.copy(H);
      g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tmpV.copy(E).sub(H).normalize());
      g.scale.set(0.07, 0.085, 0.11);
      this.vm.add(g);
    };
    const rh = w.rHand;
    // Arms run down and out of the frame rather than back toward the camera, so they never
    // cross the near plane when the gun is pulled in to aim.
    limb(rh, [rh[0] + 0.1, rh[1] - 0.24, rh[2] + 0.18], [rh[0] + 0.22, rh[1] - 0.62, rh[2] + 0.3]);
    if (w.lHand) {
      const lh = w.lHand;
      limb(lh, [lh[0] - 0.18, lh[1] - 0.24, lh[2] + 0.16], [lh[0] - 0.32, lh[1] - 0.62, lh[2] + 0.28]);
    }
    this.vmFlash.material.map = this.effects.flashTex;
    this.vmFlash.position.set(0, w.model[0][1] + 0.005, w.muzzle - 0.04);
    this.vmFlash.scale.setScalar(w.id === 'rpg' ? 0.5 : w.id === 'pistol' ? 0.18 : 0.26);
    this.vm.add(this.vmFlash);
    this.vmWeapon = idx;
  }

  // ---------------------------------------------------------------- input
  setupInput() {
    const I = this.input;
    const down = (e) => {
      if (e.code === 'Tab') { e.preventDefault(); if (this.state === 'playing' || this.state === 'countdown') this.hud.showScoreboard(true); }
      if (this.state !== 'playing' && this.state !== 'countdown') return;
      I.keys[e.code] = true;
      if (e.code === 'Space') { I.jumpQueued = true; e.preventDefault(); }
      if (e.code === 'KeyR') I.reloadQueued = true;
      if (e.code === 'KeyV' || e.code === 'KeyF') I.meleeQueued = true;
      if (e.code === 'KeyE') this.tryInteract();
      if (e.code === 'KeyP') this.pause();
    };
    const up = (e) => {
      I.keys[e.code] = false;
      if (e.code === 'Tab') this.hud.showScoreboard(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', () => { I.keys = {}; I.fire = false; I.ads = false; });

    this.canvas.addEventListener('mousedown', (e) => {
      if (this.isTouch) return;
      if (this.state === 'playing' || this.state === 'countdown') {
        if (document.pointerLockElement !== this.canvas) { this.lockPointer(); return; }
        if (e.button === 0) I.fire = true;
        if (e.button === 2) I.ads = true;
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) I.fire = false;
      if (e.button === 2) I.ads = false;
    });
    window.addEventListener('contextmenu', (e) => { if (this.state === 'playing' || this.state === 'countdown') e.preventDefault(); });
    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === this.canvas) { I.lookDX += e.movementX; I.lookDY += e.movementY; }
    });
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement !== this.canvas && (this.state === 'playing' || this.state === 'countdown') && !this.isTouch) this.pause();
    });
  }

  lockPointer() {
    if (this.isTouch) return;
    try {
      const p = this.canvas.requestPointerLock({ unadjustedMovement: true });
      if (p && p.catch) p.catch(() => this.canvas.requestPointerLock());
    } catch (e) { this.canvas.requestPointerLock(); }
  }

  // ---------------------------------------------------------------- match flow
  // opts.online: {role, kpw, time, foe:{name, skin}} from the Online session
  startMatch(opts = {}) {
    const S = this.settings, on = !!opts.online;
    this.net = on ? this.online : null;
    this.netRole = on ? opts.role : null;
    this.netPause = false;
    this.audio.unlock();
    this.audio.setVolume(S.volume);
    this.kpw = on ? opts.kpw : S.kpw;
    this.maxProgress = WEAPONS.length * this.kpw;
    this.timeLeft = (on ? opts.time : S.time) * 60;
    this.player.name = S.name || 'Player';
    this.player.resetMatch();
    this.bot.resetMatch();
    this.bot.name = on ? opts.foe.name : pick(BOT_NAMES);
    this.bot.isBot = !on;
    this.brain.setDifficulty(S.difficulty);
    // the opponent shows in red-team colours; their own skin choice is kept otherwise
    const skin = on ? ({ blue: 'red', urban: 'urban', desert: 'desert', camo: 'camo' }[opts.foe.skin] || 'red') : pick(RED_SKINS);
    if (skin !== this.botSkin) {
      this.scene.remove(this.botModel);
      this.botSkin = skin;
      this.botModel = buildCharacter(skin, this.camoTex);
      this.scene.add(this.botModel);
    }
    for (const r of this.rockets) this.scene.remove(r.mesh);
    this.rockets = [];
    for (const p of this.pickups) { p.active = true; p.respawnT = 0; p.mesh.visible = true; }
    this.effects.clear();
    const b = this.map.bunker;
    b.opened = false; b.door.position.y = 1.2; b.light.intensity = 0;
    if (!world.boxes.includes(b.collider)) world.boxes.push(b.collider);
    this.bunkerT = 0;

    // fixed opening spawns: south back yard and north back yard (an online guest starts north)
    const south = this.map.spawns.find((s) => s.side === 1 && s.x === -15), north = this.map.spawns.find((s) => s.side === -1 && s.x === 15);
    const guest = on && opts.role === 'guest';
    this.spawnAt(this.player, guest ? north : south);
    this.spawnAt(this.bot, guest ? south : north);
    this.brain.reset();
    // seq: last position update applied (they can arrive out of order); deadN: opponent's death count from 'died'
    this.remote = { buf: [], last: performance.now(), stepAcc: 0, prev: null, seq: -1, deadN: 0 };
    this.netSendT = 0;
    this.netSeq = 0;
    this.buildViewWeapon(this.player.wi);
    this.input.crouchToggle = false;
    this.feed = [];
    this.hud.startMatch();
    this.state = 'countdown';
    this.countdown = 3.0;
    this.lastCount = 4;
    this.deathCam = 0;
    // an online match starts from a network message, not a click, so the browser won't lock the mouse yet
    if (!on) this.lockPointer();
    else if (!this.isTouch) this.hud.toast('Click the game to take control');
  }

  pause() {
    if (this.state !== 'playing' && this.state !== 'countdown') return;
    if (this.net) {
      // an online match can't stop for one player: show the menu, keep the match running
      this.netPause = true;
      this.input.fire = false; this.input.ads = false; this.input.keys = {};
      this.hud.showPause(true, true);
      if (document.pointerLockElement) document.exitPointerLock();
      return;
    }
    this.prevState = this.state;
    this.state = 'paused';
    this.input.fire = false; this.input.ads = false; this.input.keys = {};
    this.hud.showPause(true);
    if (document.pointerLockElement) document.exitPointerLock();
  }

  resume() {
    if (this.net && this.netPause) {
      this.netPause = false;
      this.hud.showPause(false);
      this.lockPointer();
      return;
    }
    if (this.state !== 'paused') return;
    this.state = this.prevState || 'playing';
    this.hud.showPause(false);
    this.lockPointer();
    this.last = performance.now();
  }

  quitToMenu() {
    if (this.net || this.online.active) this.online.leave();
    this.net = null;
    this.netPause = false;
    this.state = 'menu';
    if (document.pointerLockElement) document.exitPointerLock();
    this.botModel.visible = false;
    this.hud.showMenu();
  }

  // tell: let the opponent's game know (false when the result came from them)
  endMatch(winner, note = null, tell = true) {
    if (this.state === 'ended') return;
    this.state = 'ended';
    this.netPause = false;
    this.hud.showPause(false);
    this.input.fire = false; this.input.ads = false;
    if (document.pointerLockElement) document.exitPointerLock();
    // fin: won by finishing the ladder (not on time), so the loser's screen says so
    if (this.net && tell) this.net.send({ t: 'end', r: winner === this.player ? 'sender' : winner ? 'receiver' : 'draw', fin: winner && winner.progress >= this.maxProgress ? 1 : 0 });
    this.hud.showEnd(winner, { note, online: !!this.net });
    // tell the Detourr game page (it records wins for the leaderboard)
    if (window.parent !== window) {
      try { window.parent.postMessage({ gungame: 'end', win: winner === this.player, kills: this.player.kills }, location.origin); } catch (e) { /* not embedded on the same site */ }
    }
  }

  spawnAt(f, s) {
    f.pos.set(s.x, s.y, s.z);
    f.vel.set(0, 0, 0);
    f.yaw = yawTo(-s.x, -s.z);
    f.pitch = 0;
    f.crouch = 0; f.h = 1.75;
    f.health = 100; f.alive = true;
    f.spawnProtect = this.time + 1.0;
    f.powers = { speed: 0, regen: 0, damage: 0 };
    this.equip(f, Math.min(WEAPONS.length - 1, Math.floor(f.progress / this.kpw)));
    if (f === this.bot) { this.botModel.visible = true; this.brain.reset(); }
  }

  pickSpawn(f) {
    const foe = f === this.player ? this.bot : this.player;
    let best = null, bestScore = -1e9;
    const foeEye = this.eyePos(foe);
    for (const s of this.map.spawns) {
      const d = foe.alive ? Math.hypot(s.x - foe.pos.x, s.z - foe.pos.z) : 25;
      let score = Math.min(d, 38) + rand(0, 8);
      if (foe.alive && lineOfSight(foeEye, { x: s.x, y: 1.5, z: s.z })) score -= 30;
      if (d < 10) score -= 40;
      if (score > bestScore) { bestScore = score; best = s; }
    }
    return best;
  }

  equip(f, idx) {
    const w = WEAPONS[idx];
    f.wi = idx; f.mag = w.mag; f.reserve = w.reserve; f.reloadT = 0; f.switchT = 0.45; f.bloom = 0; f.nextFire = 0; f.ads = 0;
    if (f === this.bot) setCharacterWeapon(this.botModel, w);
    else if (this.vmWeapon !== idx) this.buildViewWeapon(idx);
  }

  // ---------------------------------------------------------------- helpers
  other(f) { return f === this.player ? this.bot : this.player; }

  eyePos(f) { return { x: f.pos.x, y: f.pos.y + f.h - 0.13, z: f.pos.z }; }

  aimPoints(f) {
    const p = f.pos, h = f.h;
    return {
      head: { x: p.x, y: p.y + h - 0.1, z: p.z },
      chest: { x: p.x, y: p.y + h * 0.66, z: p.z },
      feet: { x: p.x, y: p.y + 0.25, z: p.z },
    };
  }

  hitboxes(f) {
    const p = f.pos, h = f.h;
    return [
      { part: 'head', min: { x: p.x - 0.18, y: p.y + h - 0.3, z: p.z - 0.18 }, max: { x: p.x + 0.18, y: p.y + h + 0.12, z: p.z + 0.18 } },
      { part: 'body', min: { x: p.x - 0.3, y: p.y + h * 0.48, z: p.z - 0.3 }, max: { x: p.x + 0.3, y: p.y + h - 0.3, z: p.z + 0.3 } },
      { part: 'legs', min: { x: p.x - 0.22, y: p.y, z: p.z - 0.22 }, max: { x: p.x + 0.22, y: p.y + h * 0.48, z: p.z + 0.22 } },
    ];
  }

  spreadFor(f, w) {
    let s = lerp(w.spread, w.adsSpread, f.ads);
    const sp = Math.hypot(f.vel.x, f.vel.z);
    s += (sp / 6) * w.spread * 0.6 * (1 - f.ads * 0.7);
    if (!f.onGround) s += w.spread * 0.8;
    s *= lerp(1, 0.75, f.crouch);
    return s + f.bloom;
  }

  applySpread(dir, s) {
    if (s <= 0) return dir.clone();
    const up = Math.abs(dir.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(dir, up).normalize();
    const u = new THREE.Vector3().crossVectors(right, dir).normalize();
    const r = s * Math.sqrt(Math.random()), a = Math.random() * Math.PI * 2;
    return dir.clone().addScaledVector(right, Math.cos(a) * r).addScaledVector(u, Math.sin(a) * r).normalize();
  }

  muzzleWorld(f) {
    const eye = this.eyePos(f), fwd = dirFromYawPitch(f.yaw, f.pitch, new THREE.Vector3());
    const right = new THREE.Vector3(Math.cos(f.yaw), 0, -Math.sin(f.yaw));
    if (f === this.player) {
      const ads = f.ads;
      return new THREE.Vector3(eye.x, eye.y, eye.z).addScaledVector(fwd, 0.7).addScaledVector(right, 0.14 * (1 - ads)).add(new THREE.Vector3(0, -0.12 * (1 - ads) - 0.04, 0));
    }
    const w = WEAPONS[f.wi];
    return new THREE.Vector3(eye.x, f.pos.y + f.h - 0.55, eye.z).addScaledVector(fwd, 0.45 - w.muzzle).addScaledVector(right, 0.12);
  }

  // ---------------------------------------------------------------- combat
  fire(f, w) {
    f.mag--;
    f.nextFire = this.time + 60 / w.rpm;
    f.shots++;
    f.lastShot = this.time;
    f.shotHit = false;
    const eye = this.eyePos(f);
    const eyeV = new THREE.Vector3(eye.x, eye.y, eye.z);
    const dir = dirFromYawPitch(f.yaw, f.pitch, new THREE.Vector3());
    const spread = this.spreadFor(f, w);
    const muzzle = this.muzzleWorld(f);
    const ends = [];
    if (w.projectile) {
      const d = this.applySpread(dir, spread);
      this.spawnRocket(f, w, muzzle, d);
      if (this.net) this.net.send({ t: 'rk', o: muzzle.toArray().map(r2), d: d.toArray().map((v) => Math.round(v * 1000) / 1000) });
    } else {
      for (let i = 0; i < (w.pellets || 1); i++) ends.push(this.traceShot(f, w, eyeV, this.applySpread(dir, spread), muzzle));
      if (this.net) this.net.send({ t: 'sh', e: ends.map((e) => e.toArray().map(r2)) });
    }
    if (f.shotHit) f.hits++;
    f.bloom = Math.min(w.spread * 1.5, f.bloom + w.bloom);

    this.audio.shot(w, f === this.player ? null : muzzle);
    if (f === this.player) {
      const k = w.recoil * (f.ads > 0.5 ? 0.6 : 1) * (f.crouch > 0.5 ? 0.8 : 1);
      f.pitch = clamp(f.pitch + k * 0.75, -1.5, 1.5);
      f.yaw += rand(-1, 1) * k * 0.35;
      this.vmKick = Math.min(0.12, this.vmKick + k * 1.6 + 0.012);
      this.vmFlash.visible = true;
      this.vmFlash.material.rotation = Math.random() * Math.PI * 2;
      this.vmFlashT = 0.045;
      this.effects.flashLight(muzzle, 0.05, 2);
      this.brain.hear(f.pos, 1);
    } else {
      this.effects.muzzleFlash(muzzle, w.id === 'rpg' ? 1.0 : 0.6);
      f.revealT = this.time + 2.0;
    }
  }

  traceShot(f, w, eye, dir, muzzle) {
    const hitW = raycastWorld(eye, dir, 250);
    let dist = hitW ? hitW.t : 250;
    const foe = this.other(f);
    let part = null;
    if (foe.alive) {
      for (const hb of this.hitboxes(foe)) {
        const r = rayBox(eye, dir, hb, dist);
        if (r && r.t < dist) { dist = r.t; part = hb.part; }
      }
    }
    const end = eye.clone().addScaledVector(dir, dist);
    this.effects.tracer(muzzle, end, f === this.player ? 0xffe9a0 : 0xffb080);
    if (part) {
      let mul = 1;
      if (dist > w.range) {
        const endR = w.falloffEnd || w.range * 2;
        mul = lerp(1, w.minMul, clamp((dist - w.range) / (endR - w.range), 0, 1));
      }
      const dmg = w.dmg * mul * (part === 'head' ? w.head : part === 'legs' ? 0.9 : 1);
      f.shotHit = true;
      this.effects.blood(end, dir);
      this.damage(foe, dmg, f, w.id, part === 'head', false);
    } else if (hitW) {
      this.effects.impact(hitW.point, hitW.normal);
    }
    return end;
  }

  melee(f, bash) {
    const w = WEAPONS[f.wi];
    f.meleeT = bash ? 0.75 : 60 / w.rpm;
    f.nextFire = this.time + (bash ? 0.55 : 60 / w.rpm);
    f.meleeAnim = 0.32;
    f.reloadT = 0;
    const foe = this.other(f);
    this.audio.shot(WEAPONS[8], f === this.player ? null : this.eyePos(f));
    if (this.net && f === this.player) this.net.send({ t: 'ml' });
    if (!foe.alive) return;
    const reach = bash ? 1.9 : w.reach;
    const eye = this.eyePos(f), chest = this.aimPoints(foe).chest;
    const dx = chest.x - eye.x, dz = chest.z - eye.z, d = Math.hypot(dx, dz, chest.y - eye.y);
    const ang = Math.abs(angleDiff(f.yaw, yawTo(dx, dz)));
    // knife lunge
    if (!bash && d < 4.5 && d > reach && ang < 0.4) {
      f.vel.x += (dx / Math.hypot(dx, dz)) * 9; f.vel.z += (dz / Math.hypot(dx, dz)) * 9;
    }
    if (d <= reach + (bash ? 0 : 0.6) && ang < 0.75 && lineOfSight(eye, chest)) {
      this.effects.blood(new THREE.Vector3(chest.x, chest.y, chest.z), new THREE.Vector3(dx, 0, dz).normalize());
      this.damage(foe, 150, f, bash ? 'melee' : 'knife', false, bash);
    }
  }

  spawnRocket(f, w, from, dir) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8), new THREE.MeshLambertMaterial({ color: 0x4a5a30 }));
    body.rotation.x = Math.PI / 2;
    g.add(body);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 8), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    tip.rotation.x = -Math.PI / 2; tip.position.z = -0.32;
    g.add(tip);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.effects.fireTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    glow.scale.setScalar(0.7); glow.position.z = 0.3;
    g.add(glow);
    g.position.copy(from);
    g.lookAt(from.clone().sub(dir));
    this.scene.add(g);
    this.rockets.push({ pos: from.clone(), vel: dir.clone().multiplyScalar(w.projectile), owner: f, mesh: g, life: 5, w, smokeT: 0 });
    this.audio.whoosh(from);
  }

  updateRockets(dt) {
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.life -= dt;
      const step = r.vel.length() * dt;
      const dir = r.vel.clone().normalize();
      const hitW = raycastWorld(r.pos, dir, step);
      let t = hitW ? hitW.t : step, direct = null;
      const foe = this.other(r.owner);
      if (foe.alive) for (const hb of this.hitboxes(foe)) {
        const h = rayBox(r.pos, dir, hb, t);
        if (h && h.t < t) { t = h.t; direct = foe; }
      }
      r.pos.addScaledVector(dir, t);
      r.mesh.position.copy(r.pos);
      r.smokeT -= dt;
      if (r.smokeT <= 0) { r.smokeT = 0.025; this.effects.smokePuff(r.pos.clone().addScaledVector(dir, -0.4)); }
      if (direct || hitW || r.life <= 0) {
        const mine = !this.net || r.owner === this.player; // online, a rocket only hurts on its owner's screen
        if (direct && mine) this.damage(direct, r.w.dmg, r.owner, 'rpg', false, false);
        const n = hitW && !direct ? hitW.normal : { x: -dir.x, y: -dir.y, z: -dir.z };
        this.explode(r.pos.clone().add(new THREE.Vector3(n.x, n.y, n.z).multiplyScalar(0.15)), r.owner, r.w, direct, mine);
        this.scene.remove(r.mesh);
        this.rockets.splice(i, 1);
      }
    }
  }

  explode(pos, owner, w, skip, mine = true) {
    this.effects.explosion(pos);
    this.audio.explosion(pos);
    const pd = this.player.alive ? pos.distanceTo(this.player.pos) : 99;
    this.shake = Math.max(this.shake, clamp(1 - pd / 18, 0, 1) * 0.6);
    if (!mine) return;
    for (const f of [this.player, this.bot]) {
      if (!f.alive || f === skip) continue;
      const c = this.aimPoints(f).chest;
      const d = Math.hypot(c.x - pos.x, c.y - pos.y, c.z - pos.z);
      if (d > w.radius) continue;
      if (!lineOfSight(pos, c) && !lineOfSight(pos, this.aimPoints(f).feet)) continue;
      let dmg = w.splash * (1 - d / w.radius) + 10;
      if (f === owner) dmg *= 0.5;
      this.damage(f, dmg, owner, 'rpg', false, false);
      if (f !== owner && owner) owner.shotHit = true;
    }
  }

  damage(victim, amount, attacker, weaponId, head, bash) {
    if (!victim.alive || this.state !== 'playing') return;
    if (this.net && victim === this.bot) {
      // online, the opponent's own game applies damage to them and reports the death
      if (attacker === this.player) {
        if (this.player.powers.damage > 0) amount *= 2;
        this.net.send({ t: 'hit', d: Math.round(amount * 10) / 10, w: weaponId, h: head ? 1 : 0, b: bash ? 1 : 0 });
        this.hud.hitmarker(head, false);
        this.audio.hitmarker(head);
      }
      return;
    }
    if (victim.spawnProtect > this.time) amount *= 0.25;
    if (!this.net && attacker && attacker !== victim && attacker.powers.damage > 0) amount *= 2;
    victim.health -= amount;
    victim.lastHurt = this.time;
    if (victim === this.player) {
      this.audio.hurt();
      if (attacker && attacker !== victim) this.hud.damageFrom(attacker.pos);
      this.shake = Math.max(this.shake, 0.15);
    } else {
      this.brain.onDamaged(attacker ? attacker.pos : null);
    }
    const killed = victim.health <= 0;
    if (attacker === this.player && victim !== this.player) {
      this.hud.hitmarker(head, killed);
      this.audio.hitmarker(head);
    }
    if (killed) this.kill(victim, attacker, weaponId, head, bash);
  }

  kill(victim, killer, weaponId, head, bash) {
    const suicide = !killer || killer === victim;
    this.victimDied(victim, suicide ? null : killer, weaponId, head, bash);
    // online, the killer's game awards its own kill when it hears about the death
    if (this.net) this.net.send({ t: 'died', w: weaponId, h: head ? 1 : 0, b: bash ? 1 : 0, s: suicide ? 1 : 0, n: victim.deaths });
    else if (!suicide) this.awardKill(killer, victim, weaponId, head, bash);
    this.hud.updateScores();
  }

  victimDied(victim, killer, weaponId, head, bash) {
    victim.alive = false;
    victim.health = 0;
    victim.deaths++;
    victim.streak = 0;
    victim.respawnT = 3;
    victim.reloadT = 0;
    if (!killer) {
      this.demote(victim);
      this.hud.feedAdd(null, weaponId, victim, false);
      if (victim === this.player) this.hud.banner('SUICIDE', 'Demoted a weapon tier', 'bad');
    } else {
      this.hud.feedAdd(killer, weaponId, victim, head);
      if (bash) {
        this.demote(victim);
        if (killer === this.player) this.hud.banner('HUMILIATION!', `${victim.name} was set back a weapon`, 'good');
        else { this.hud.banner('HUMILIATED', 'You were set back a weapon', 'bad'); this.audio.demote(); }
      }
    }
    if (victim === this.player) {
      this.deathCam = 0;
      this.hud.showRespawn(true, killer, weaponId);
      this.vm.visible = false;
    }
  }

  awardKill(killer, victim, weaponId, head, bash) {
    killer.kills++;
    killer.streak++;
    killer.bestStreak = Math.max(killer.bestStreak, killer.streak);
    if (head) killer.headshots++;
    if (bash) {
      if (killer === this.player) this.audio.kill();
    } else {
      const before = Math.floor(killer.progress / this.kpw);
      killer.progress++;
      if (killer.progress >= this.maxProgress) {
        this.hud.updateScores();
        this.endMatch(killer);
        return;
      }
      const after = Math.floor(killer.progress / this.kpw);
      if (after !== before) {
        this.equip(killer, after);
        if (killer === this.player) {
          this.hud.banner('WEAPON UPGRADED', WEAPONS[after].name + (after === WEAPONS.length - 1 ? '. Final weapon!' : ''), 'good', WEAPONS[after]);
          this.audio.levelUp();
        }
      } else if (killer === this.player) this.hud.banner('+1 KILL', `${this.kpw - (killer.progress % this.kpw)} more for the next weapon`, 'good');
      if (killer === this.player) this.audio.kill();
    }
    if (killer.streak === 3) {
      killer.uavT = 20;
      if (killer === this.player) this.hud.toast('UAV online: enemy shown on the minimap');
      else this.hud.toast('Enemy UAV spotted!');
    }
  }

  demote(f) {
    const before = Math.floor(f.progress / this.kpw);
    f.progress = Math.max(0, (before - 1) * this.kpw);
  }

  tryInteract() {
    const b = this.map.bunker, p = this.player;
    if (!p.alive || b.opened) return;
    if (Math.hypot(p.pos.x - b.x, p.pos.z - b.z) < 2.8) {
      b.opened = true;
      this.bunkerT = 0;
      const i = world.boxes.indexOf(b.collider);
      if (i >= 0) world.boxes.splice(i, 1);
      this.audio.alarm();
      p.uavT = Math.max(p.uavT, 30);
      this.hud.banner('NUCLEAR BUNKER FOUND', 'Easter egg unlocked: free UAV!', 'good');
    }
  }

  // ---------------------------------------------------------------- per-frame updates
  playerIntent(dt) {
    const p = this.player, I = this.input, it = p.intent, S = this.settings;
    if (this.netPause) {
      it.mx = it.mz = 0; it.jump = it.fire = it.ads = it.reload = it.melee = it.sprint = false;
      I.lookDX = I.lookDY = 0; I.jumpQueued = I.reloadQueued = I.meleeQueued = false;
      return;
    }
    const k = I.keys;
    let fx = 0, fz = 0;
    if (k.KeyW || k.ArrowUp) fz += 1;
    if (k.KeyS || k.ArrowDown) fz -= 1;
    if (k.KeyA || k.ArrowLeft) fx -= 1;
    if (k.KeyD || k.ArrowRight) fx += 1;
    let sprint = !!(k.ShiftLeft || k.ShiftRight);
    if (this.touch) { const t = this.touch.move; fx += t.x; fz += t.y; sprint = sprint || this.touch.sprint; }
    const len = Math.hypot(fx, fz);
    if (len > 1) { fx /= len; fz /= len; }
    const sy = Math.sin(p.yaw), cy = Math.cos(p.yaw);
    it.mx = fx * cy - fz * sy;
    it.mz = -fx * sy - fz * cy;
    it.sprint = sprint && fz > 0.3;
    it.jump = I.jumpQueued; I.jumpQueued = false;
    // hold C (or Ctrl) to crouch; the touch CROUCH button toggles
    it.crouch = !!(k.KeyC || k.ControlLeft) || I.crouchToggle;
    it.fire = I.fire;
    it.ads = I.ads || !!k.KeyQ;
    it.reload = I.reloadQueued; I.reloadQueued = false;
    it.melee = I.meleeQueued; I.meleeQueued = false;

    // look
    const zoom = lerp(1, WEAPONS[p.wi].adsZoom, p.ads);
    const sens = 0.0022 * S.sens / zoom;
    p.yaw -= I.lookDX * sens;
    p.pitch = clamp(p.pitch - I.lookDY * sens, -1.5, 1.5);
    I.lookDX = 0; I.lookDY = 0;
  }

  updateFighter(f, dt) {
    const I = f.intent, w = WEAPONS[f.wi];
    // crouch
    if (I.crouch) f.crouch = Math.min(1, f.crouch + dt * 7);
    else if (f.crouch > 0) {
      if (!bodyBlocked(f.pos.x, f.pos.y + 0.05, f.pos.z, f.hw - 0.02, 1.7)) f.crouch = Math.max(0, f.crouch - dt * 7);
    }
    f.h = 1.75 - 0.55 * f.crouch;

    const moving = Math.hypot(I.mx, I.mz) > 0.1;
    f.sprinting = I.sprint && moving && f.crouch < 0.5 && !I.ads && !I.fire && f.meleeAnim <= 0;
    const adsTarget = I.ads && !f.sprinting && f.switchT <= 0 && !w.melee ? 1 : 0;
    f.ads = adsTarget ? Math.min(1, f.ads + dt / w.adsTime) : Math.max(0, f.ads - dt / (w.adsTime * 0.8));

    let sp = BASE_SPEED * w.moveMul;
    if (f.sprinting) sp *= 1.45;
    sp *= lerp(1, 0.55, f.ads) * lerp(1, 0.5, f.crouch);
    if (f.powers.speed > 0) sp *= 1.35;
    const dvx = I.mx * sp, dvz = I.mz * sp;
    const acc = (f.onGround ? 55 : 12) * dt;
    f.vel.x += clamp(dvx - f.vel.x, -acc, acc);
    f.vel.z += clamp(dvz - f.vel.z, -acc, acc);
    if (I.jump && f.onGround && f.crouch < 0.3) { f.vel.y = 7.3; f.onGround = false; }
    moveBody(f, dt);
    if (f.pos.y < -5) { f.pos.y = 0; f.vel.y = 0; }

    // footsteps
    const hs = Math.hypot(f.vel.x, f.vel.z);
    if (f.onGround && hs > 1.5) {
      f.stepAcc += hs * dt;
      if (f.stepAcc > (f.sprinting ? 2.6 : 2.0)) {
        f.stepAcc = 0;
        const quiet = f.crouch > 0.5;
        if (f === this.bot) this.audio.footstep(f.pos, quiet ? 0.08 : 0.22);
        else {
          this.audio.footstep(null, 0.04);
          if (!quiet && hs > 4) this.brain.hear(f.pos, 0.35);
        }
      }
    }

    // powers & health
    for (const k of ['speed', 'regen', 'damage']) f.powers[k] = Math.max(0, f.powers[k] - dt);
    f.uavT = Math.max(0, f.uavT - dt);
    const regenDelay = f.powers.regen > 0 ? 0.8 : 4;
    if (this.time - f.lastHurt > regenDelay && f.health < 100) f.health = Math.min(100, f.health + (f.powers.regen > 0 ? 80 : 35) * dt);
  }

  updateWeapon(f, dt) {
    const I = f.intent, w = WEAPONS[f.wi];
    f.switchT = Math.max(0, f.switchT - dt);
    f.meleeT -= dt;
    f.meleeAnim = Math.max(0, f.meleeAnim - dt);
    f.bloom = Math.max(0, f.bloom - dt * (w.spread * 2.5));
    if (f.reloadT > 0) {
      f.reloadT -= dt;
      if (f.reloadT <= 0) {
        const take = Math.min(w.mag - f.mag, f.reserve);
        f.mag += take; f.reserve -= take;
      }
    }
    const startReload = () => {
      if (f.reloadT > 0 || w.mag === 0 || f.mag >= w.mag || f.reserve <= 0 || f.switchT > 0) return;
      f.reloadT = w.reload;
      if (f === this.player) this.audio.reload(w.reload / 2);
    };
    if (I.reload) startReload();
    if (I.melee && f.meleeT <= 0 && f.switchT <= 0) { this.melee(f, !w.melee); return; }
    if (!I.fire) f.triggerReady = true;
    if (I.fire && !f.sprinting && f.switchT <= 0 && this.time >= f.nextFire) {
      if (w.melee) { if (f.meleeT <= 0) this.melee(f, false); }
      else if (f.reloadT > 0) { /* busy */ }
      else if (f.mag <= 0) {
        if (f.triggerReady && f === this.player) this.audio.empty();
        f.triggerReady = false;
        startReload();
      } else if (w.auto || f.triggerReady) {
        this.fire(f, w);
        f.triggerReady = false;
      }
    }
    // auto-reload an empty magazine once the last shot has cycled
    if (f.mag === 0 && f.reloadT <= 0 && this.time >= f.nextFire + 0.15) startReload();
  }

  updatePickups(dt) {
    for (const p of this.pickups) {
      p.phase += dt;
      if (!p.active) {
        p.respawnT -= dt;
        if (p.respawnT <= 0) { p.active = true; p.mesh.visible = true; }
        continue;
      }
      p.icon.rotation.y += dt * 2;
      p.icon.position.y = 1.0 + Math.sin(p.phase * 2.5) * 0.12;
      for (const f of this.net ? [this.player] : [this.player, this.bot]) {
        if (!f.alive) continue;
        if (Math.hypot(f.pos.x - p.x, f.pos.z - p.z) < 1.0 && Math.abs(f.pos.y - p.y) < 1.5) {
          p.active = false; p.respawnT = 25; p.mesh.visible = false;
          if (this.net) this.net.send({ t: 'pk', i: this.pickups.indexOf(p) });
          if (p.type === 'health') { f.health = 100; f.powers.regen = 15; }
          else f.powers[p.type] = 15;
          if (f === this.player) { this.audio.pickup(); this.hud.toast(this.pickupDefs[p.type].label + '!'); }
          break;
        }
      }
    }
  }

  updateBunker(dt) {
    const b = this.map.bunker;
    if (b.opened) {
      this.bunkerT += dt;
      b.door.position.y = 1.2 + Math.min(1, this.bunkerT / 2) * 2.3;
      b.light.intensity = 3 + Math.sin(this.time * 8) * 1.5;
      this.hud.interactHint(null);
    } else {
      const p = this.player;
      const near = p.alive && Math.hypot(p.pos.x - b.x, p.pos.z - b.z) < 2.8;
      this.hud.interactHint(near ? (this.isTouch ? 'Tap USE to open the bunker' : 'Press [E] to open the bunker') : null);
    }
  }

  updateBotModel(dt) {
    const b = this.bot, m = this.botModel;
    if (!b.alive && b.respawnT < 0.5) { m.visible = false; return; }
    if (b.alive || b.respawnT > 0) m.visible = true;
    m.position.copy(b.pos);
    m.rotation.y = b.yaw;
    animateCharacter(m, dt, {
      speed: b.alive ? Math.hypot(b.vel.x, b.vel.z) : 0,
      crouch: b.crouch, pitch: b.pitch, dead: !b.alive, firing: this.time - b.lastShot < 0.08,
    });
  }

  updateCamera(dt) {
    const p = this.player, cam = this.camera, w = WEAPONS[p.wi];
    const zoom = lerp(1, w.adsZoom, p.ads);
    const fov = (2 * Math.atan(Math.tan((this.settings.fov * Math.PI) / 360) / zoom) * 180) / Math.PI;
    if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; cam.updateProjectionMatrix(); }

    const eye = this.eyePos(p);
    const hs = Math.hypot(p.vel.x, p.vel.z);
    if (p.onGround && hs > 0.5) this.bobPhase += dt * hs * 1.9;
    const bobAmt = Math.min(1, hs / 6) * (1 - p.ads * 0.85) * (p.onGround ? 1 : 0);
    let y = eye.y + Math.abs(Math.sin(this.bobPhase)) * 0.045 * bobAmt;
    let pitch = p.pitch, roll = 0;
    if (!p.alive) {
      this.deathCam = Math.min(1, this.deathCam + dt * 2.2);
      y = lerp(eye.y, p.pos.y + 0.35, this.deathCam);
      roll = this.deathCam * 0.6;
      pitch = lerp(p.pitch, -0.2, this.deathCam);
    }
    cam.position.set(eye.x, y, eye.z);
    this.shake = Math.max(0, this.shake - dt * 1.5);
    const sh = this.shake * this.shake;
    cam.rotation.set(pitch + rand(-1, 1) * sh * 0.05, p.yaw + rand(-1, 1) * sh * 0.05, roll + Math.sin(this.bobPhase * 0.5) * 0.004 * bobAmt);
  }

  updateViewmodel(dt) {
    const p = this.player, w = WEAPONS[p.wi], vm = this.vm;
    vm.visible = p.alive && this.state !== 'ended';
    const scoped = w.scope && p.ads > 0.85;
    if (scoped) vm.visible = false;
    this.hud.setScope(scoped, w);
    if (!vm.visible) return;
    const ads = p.ads;
    const hip = w.hip;
    const adsPos = [0, -w.sightY * VM_SCALE, hip[2] - 0.02];
    let x = lerp(hip[0], adsPos[0], ads), y = lerp(hip[1], adsPos[1], ads), z = lerp(hip[2], adsPos[2], ads);
    let rx = 0, ry = 0, rz = 0;
    const hs = Math.hypot(p.vel.x, p.vel.z), bob = Math.min(1, hs / 6) * (1 - ads * 0.85);
    x += Math.sin(this.bobPhase * 0.5) * 0.014 * bob;
    y += -Math.abs(Math.cos(this.bobPhase * 0.5)) * 0.012 * bob;
    // sway from looking around
    // sway follows mouse speed (not the raw per-frame delta) and fades out while aiming
    const k = 1 - Math.exp(-dt * 7), calm = 1 - ads;
    const vx = dt > 0 ? (this.lastLookDX || 0) / dt : 0, vy = dt > 0 ? (this.lastLookDY || 0) / dt : 0;
    this.vmSway.x = lerp(this.vmSway.x, clamp(-vx * 0.000025, -0.03, 0.03) * calm, k);
    this.vmSway.y = lerp(this.vmSway.y, clamp(vy * 0.000025, -0.03, 0.03) * calm, k);
    x += this.vmSway.x; y += this.vmSway.y;
    ry += this.vmSway.x * 1.5; rx += this.vmSway.y * 1.5;
    if (!p.onGround) y += 0.02;
    // recoil
    this.vmKick = Math.max(0, this.vmKick - dt * 0.6);
    z += this.vmKick; rx += this.vmKick * lerp(2.5, 0.8, ads);
    if (p.sprinting) { ry += 0.55; rx -= 0.2; x -= 0.05; y -= 0.04; }
    if (p.crouch > 0.5 && !ads) { rz += 0.04; }
    if (p.switchT > 0) { const k = p.switchT / 0.45; y -= k * 0.35; rx -= k * 0.8; }
    if (p.reloadT > 0) {
      const k = 1 - p.reloadT / w.reload, d = Math.sin(k * Math.PI);
      y -= d * 0.1; rz += d * 0.6; rx += d * 0.35;
    }
    if (p.meleeAnim > 0) {
      const k = 1 - p.meleeAnim / 0.32, d = Math.sin(k * Math.PI);
      if (w.melee) { x -= d * 0.22; z -= d * 0.15; rz -= d * 0.9; ry += d * 0.6; }
      else { x -= d * 0.12; z -= d * 0.12; ry += d * 0.7; rz -= d * 0.3; }
    }
    vm.position.set(x, y, z);
    vm.rotation.set(rx, ry + 0.04 * (1 - ads), rz);
    vm.scale.setScalar(VM_SCALE);
    if (this.vmFlashT > 0) { this.vmFlashT -= dt; if (this.vmFlashT <= 0) this.vmFlash.visible = false; }
  }

  update(dt) {
    const p = this.player, b = this.bot;
    if (this.state === 'countdown') {
      this.countdown -= dt;
      const c = Math.ceil(this.countdown);
      if (c !== this.lastCount && c >= 0) { this.lastCount = c; this.hud.countdown(c); this.audio.countdown(c === 0); }
      if (this.countdown <= 0) { this.state = 'playing'; this.hud.countdown(-1); }
      this.lastLookDX = this.input.lookDX; this.lastLookDY = this.input.lookDY;
      this.playerIntent(dt);
      for (const f of [p, b]) { const I = f.intent; I.mx = I.mz = 0; I.fire = I.jump = I.melee = false; }
      p.intent.ads = this.input.ads;
      for (const f of [p, b]) f.switchT = Math.max(0, f.switchT - dt);
      this.updateFighter(p, dt);
      if (this.net) { this.updateRemote(dt); this.netTick(dt); }
      else {
        this.updateFighter(b, dt);
        this.brain.update(0);
        b.intent.mx = b.intent.mz = 0; b.intent.fire = false;
      }
      return;
    }
    this.timeLeft -= dt;
    if (this.timeLeft <= 0 && this.netRole === 'guest') this.timeLeft = 0; // the host's clock decides
    else if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      const winner = p.progress > b.progress ? p : b.progress > p.progress ? b : (p.kills >= b.kills ? p : b);
      this.endMatch(p.progress === b.progress && p.kills === b.kills ? null : winner);
      return;
    }

    this.lastLookDX = this.input.lookDX; this.lastLookDY = this.input.lookDY;
    if (p.alive) {
      this.playerIntent(dt);
      this.updateFighter(p, dt);
      this.updateWeapon(p, dt);
    } else {
      this.input.lookDX = this.input.lookDY = 0;
      p.respawnT -= dt;
      this.hud.respawnTick(p.respawnT);
      if (p.respawnT <= 0) {
        this.spawnAt(p, this.pickSpawn(p));
        this.hud.showRespawn(false);
        this.vm.visible = true;
        this.deathCam = 0;
      }
    }
    if (this.net) {
      this.updateRemote(dt);
      if (this.state !== 'ended') this.netTick(dt);
    } else if (b.alive) {
      this.brain.update(dt);
      this.updateFighter(b, dt);
      this.updateWeapon(b, dt);
    } else {
      b.respawnT -= dt;
      if (b.respawnT <= 0) this.spawnAt(b, this.pickSpawn(b));
    }
    this.updateRockets(dt);
    this.updatePickups(dt);
    this.updateBunker(dt);
  }

  // ---------------------------------------------------------------- online
  netTick(dt) {
    this.netSendT -= dt;
    if (this.netSendT > 0) return;
    this.netSendT = NET_RATE;
    const p = this.player;
    const m = {
      t: 's', q: this.netSeq++, p: p.pos.toArray().map(r2), v: p.vel.toArray().map((v) => Math.round(v * 10) / 10),
      y: Math.round(p.yaw * 1000) / 1000, pi: Math.round(p.pitch * 1000) / 1000, c: r2(p.crouch), g: p.onGround ? 1 : 0,
      a: p.alive ? 1 : 0, w: p.wi, pr: p.progress, k: p.kills, d: p.deaths, st: p.streak, bs: p.bestStreak,
      sh: p.shots, hi: p.hits, hs: p.headshots, u: p.uavT > 0 ? 1 : 0,
    };
    if (this.netRole === 'host') m.tl = Math.round(this.timeLeft * 10) / 10;
    this.net.send(m, true);
  }

  onNet(m) {
    if (!this.net || this.state === 'menu') return;
    const b = this.bot, live = this.state === 'playing' || this.state === 'countdown';
    this.remote.last = performance.now();
    switch (m.t) {
      case 's': this.onRemoteState(m); break;
      case 'hit':
        if (this.state === 'playing' && WEAPON_IDS.has(m.w)) this.damage(this.player, clamp(+m.d || 0, 0, 400), b, m.w, !!m.h, !!m.b);
        break;
      case 'died': if (live) this.onRemoteDied(m); break;
      case 'sh': {
        if (!live || !Array.isArray(m.e)) break;
        const w = WEAPONS[b.wi], muzzle = this.muzzleWorld(b);
        for (const e of m.e.slice(0, 12)) {
          if (!Array.isArray(e) || e.length !== 3) continue;
          const end = new THREE.Vector3(+e[0] || 0, +e[1] || 0, +e[2] || 0);
          this.effects.tracer(muzzle, end, 0xffb080);
          const n = muzzle.clone().sub(end).normalize();
          this.effects.impact(end, n);
        }
        this.audio.shot(w, muzzle);
        this.effects.muzzleFlash(muzzle, 0.6);
        b.lastShot = this.time; b.revealT = this.time + 2.0;
        break;
      }
      case 'rk': {
        if (!live || !Array.isArray(m.o) || !Array.isArray(m.d)) break;
        const o = new THREE.Vector3(...m.o.map((v) => +v || 0)), d = new THREE.Vector3(...m.d.map((v) => +v || 0));
        if (d.lengthSq() < 0.5) break;
        this.spawnRocket(b, WEAPONS[7], o, d.normalize());
        this.effects.muzzleFlash(o, 1.0);
        b.lastShot = this.time; b.revealT = this.time + 2.0;
        break;
      }
      case 'ml': if (live) this.audio.shot(WEAPONS[8], this.eyePos(b)); break;
      case 'pk': {
        const p = this.pickups[m.i | 0];
        if (p && p.active) { p.active = false; p.respawnT = 25; p.mesh.visible = false; }
        break;
      }
      case 'end':
        if (!live) break;
        if (m.fin && m.r === 'sender') b.progress = this.maxProgress;
        this.endMatch(m.r === 'sender' ? b : m.r === 'receiver' ? this.player : null, null, false);
        break;
    }
  }

  onRemoteState(m) {
    const b = this.bot, R = this.remote;
    if (!Array.isArray(m.p) || m.p.length !== 3) return;
    if (typeof m.q === 'number') { if (m.q <= R.seq) return; R.seq = m.q; } // stale update
    const snap = {
      t: performance.now(), p: new THREE.Vector3(+m.p[0] || 0, +m.p[1] || 0, +m.p[2] || 0),
      v: new THREE.Vector3(...(Array.isArray(m.v) ? m.v : [0, 0, 0]).map((v) => +v || 0)),
      y: +m.y || 0, pi: clamp(+m.pi || 0, -1.6, 1.6), c: clamp(+m.c || 0, 0, 1), g: !!m.g,
    };
    // stats are owned by the opponent's game
    b.progress = clamp(m.pr | 0, 0, this.maxProgress); b.kills = m.k | 0; b.deaths = m.d | 0; b.streak = m.st | 0;
    b.bestStreak = m.bs | 0; b.shots = m.sh | 0; b.hits = m.hi | 0; b.headshots = m.hs | 0;
    const wi = clamp(m.w | 0, 0, WEAPONS.length - 1);
    if (wi !== b.wi) { b.wi = wi; setCharacterWeapon(this.botModel, WEAPONS[wi]); }
    if (m.u && !R.uav) this.hud.toast('Enemy UAV spotted!');
    R.uav = !!m.u;
    if (typeof m.tl === 'number' && this.netRole === 'guest') this.timeLeft = Math.max(0, m.tl - NET_DELAY / 1000);
    // Deaths only come from the reliable 'died' message; an update sent after that death means they respawned.
    if (m.a && !b.alive && (m.d | 0) >= R.deadN) {
      // jump straight to the new spot instead of sliding there
      b.alive = true; b.health = 100; R.buf = []; R.prev = null;
    }
    R.buf.push(snap);
    if (R.buf.length > 30) R.buf.shift();
    this.hud.updateScores();
  }

  onRemoteDied(m) {
    const b = this.bot, R = this.remote, n = m.n | 0;
    if (n && n <= R.deadN) return; // already handled
    R.deadN = n || R.deadN + 1;
    const wid = WEAPON_IDS.has(m.w) ? m.w : WEAPONS[b.wi].id;
    b.alive = false; b.health = 0; b.respawnT = 3;
    if (m.s) this.hud.feedAdd(null, wid, b, false);
    else {
      this.hud.feedAdd(this.player, wid, b, !!m.h);
      if (m.b) this.hud.banner('HUMILIATION!', `${b.name} was set back a weapon`, 'good');
      this.hud.hitmarker(!!m.h, true);
      this.awardKill(this.player, b, wid, !!m.h, !!m.b);
    }
    this.hud.updateScores();
  }

  // Draw the opponent slightly in the past, between the two updates around that moment.
  updateRemote(dt) {
    const b = this.bot, R = this.remote;
    b.respawnT -= dt;
    if (performance.now() - R.last > 8000 && this.state === 'playing') { this.netLost('The connection to your opponent was lost.'); return; }
    const buf = R.buf;
    if (!buf.length) return;
    const rt = performance.now() - NET_DELAY;
    let a = buf[0], c = null;
    for (let i = 0; i < buf.length; i++) { if (buf[i].t <= rt) a = buf[i]; else { c = buf[i]; break; } }
    if (c && a !== c && a.t <= rt) {
      const k = (rt - a.t) / (c.t - a.t);
      b.pos.lerpVectors(a.p, c.p, k);
      b.yaw = a.y + angleDiff(a.y, c.y) * k;
      b.pitch = lerp(a.pi, c.pi, k);
      b.crouch = lerp(a.c, c.c, k);
    } else {
      const last = buf[buf.length - 1], ahead = clamp((rt - last.t) / 1000, 0, 0.25);
      b.pos.copy(last.p).addScaledVector(last.v, ahead);
      b.yaw = last.y; b.pitch = last.pi; b.crouch = last.c;
    }
    const top = buf[buf.length - 1];
    b.vel.copy(top.v);
    b.onGround = top.g;
    b.h = 1.75 - 0.55 * b.crouch;
    // footsteps
    if (R.prev && b.alive && b.onGround) {
      R.stepAcc += Math.hypot(b.pos.x - R.prev.x, b.pos.z - R.prev.z);
      if (R.stepAcc > 2.2) { R.stepAcc = 0; this.audio.footstep(b.pos, b.crouch > 0.5 ? 0.08 : 0.22); }
    }
    R.prev = b.pos.clone();
  }

  netLost(msg) {
    if (!this.net) return;
    if (this.state === 'ended') { this.hud.rematchNote(msg, true); this.net = null; return; }
    if (this.state === 'menu') { this.net = null; return; }
    this.endMatch(null, msg, false);
    this.hud.rematchNote(msg, true);
    this.net = null;
  }

  frame() {
    const now = performance.now();
    let dt = (now - this.last) / 1000;
    this.last = now;
    dt = Math.min(dt, 1 / 30);
    const p = this.player;

    if (this.state === 'menu') {
      this.menuAngle += dt * 0.06;
      const r = 46;
      this.camera.position.set(Math.cos(this.menuAngle) * r, 19, Math.sin(this.menuAngle) * r);
      this.camera.fov = 60; this.camera.updateProjectionMatrix();
      this.camera.lookAt(0, 2, 0);
      this.vm.visible = false;
      this.hud.setScope(false);
    } else if (this.state === 'playing' || this.state === 'countdown') {
      this.time += dt;
      this.update(dt);
    }
    if (this.state !== 'menu') {
      this.updateCamera(dt);
      this.updateViewmodel(dt);
      this.updateBotModel(this.state === 'paused' ? 0 : dt);
      if (this.state !== 'paused') this.effects.update(dt);
      this.hud.update(dt);
    }
    for (const c of this.clouds.children) { c.position.x += dt * 1.2; if (c.position.x > 340) c.position.x = -340; }
    this.sky.position.copy(this.camera.position);
    this.sun.target.position.set(0, 0, 0);

    const fwd = dirFromYawPitch(p.yaw, p.pitch, tmpV2);
    this.audio.setListener(this.camera.position, fwd);

    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    if (this.vm.visible && this.state !== 'menu') {
      this.renderer.clearDepth();
      this.renderer.render(this.viewScene, this.viewCam);
    }
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.viewCam.aspect = w / h; this.viewCam.updateProjectionMatrix();
    this.hud && this.hud.resize();
  }

  saveSettings() { saveSettings(this.settings); }
}

window.addEventListener('DOMContentLoaded', () => {
  try {
    new Game();
  } catch (e) {
    console.error(e);
    const el = document.getElementById('fatal');
    if (el) { el.style.display = 'flex'; el.querySelector('p').textContent = 'Could not start the game: ' + e.message; }
  }
});
