import * as THREE from 'three';
import { buildMap, MAP_BY_ID } from './map.js';
import { moveBody, raycastWorld, rayBox, lineOfSight, bodyBlocked, world } from './physics.js';
import { WEAPON_BY_ID, LADDERS, ladderIds, validLadder, buildWeaponModel } from './weapons.js';
import { buildCharacter, setCharacterWeapon, animateCharacter, SKINS, RED_SKINS } from './character.js';
import { BotBrain } from './bot.js';
import { Effects } from './effects.js';
import { Audio } from './audio.js';
import { makeTextures } from './textures.js';
import { clamp, lerp, rand, pick, angleDiff, dirFromYawPitch, yawTo, loadSettings, saveSettings } from './util.js';
import { Hud } from './hud.js';
import { TouchControls } from './touch.js';
import { Online } from './online.js';

const DEFAULTS = {
  name: 'BenAsm', skin: 'blue', difficulty: 'normal', kpw: 1, time: 10, sens: 1.0, fov: 78, volume: 0.7,
  lighting: 'auto', map: 'nuketown', ladder: 'standard', dmgNumbers: true,
};
const BOT_NAMES = ['Viper', 'Havoc', 'Reaper', 'Spectre', 'Nomad', 'Blitz', 'Ghost', 'Rook', 'Onyx', 'Jackal', 'Mako', 'Talon'];
const BASE_SPEED = 5.4;
const VM_SCALE = 0.78; // first-person weapon size
const NET_RATE = 1 / 20; // position updates per second sent to the opponent
const NET_DELAY = 100;   // ms the opponent is drawn in the past, so motion stays smooth
const GRENADES_PER_LIFE = 2;
// Not on the ladder: thrown grenades and the 7-kill airstrike.
const GRENADE = { id: 'grenade', name: 'Frag Grenade', splash: 135, radius: 6.0, gravity: 17, bounce: true, fuse: 2.1 };
const AIRSTRIKE = { id: 'airstrike', name: 'Airstrike', splash: 160, radius: 6.5 };
const WEAPON_IDS = new Set([...Object.keys(WEAPON_BY_ID), 'melee', 'grenade', 'airstrike']);
const STREAKS = { 3: 'uav', 5: 'armor', 7: 'airstrike' };
const r2 = (v) => Math.round(v * 100) / 100;
const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3();

// Lighting presets. sky: top / horizon / bottom / sun colour; fog: colour, near, far.
const LIGHTS = {
  day:    { sky: [0x3a8ae0, 0xc4e4ff, 0x9ab38a, 0xfff4d6], hemi: [0xd6ecff, 0x5d7a45, 1.35], sun: [0xfff0d8, 2.9, [45, 80, 30]], fog: [0xc4e4ff, 90, 380], clouds: 0x777777 },
  sunset: { sky: [0x2b3a7a, 0xff9a5c, 0x40303a, 0xffb070], hemi: [0xffc8a0, 0x4a3a48, 1.1], sun: [0xffa25a, 2.6, [-90, 32, -45]], fog: [0xf2a273, 70, 330], clouds: 0x7a4a40 },
  night:  { sky: [0x05081a, 0x1c2a4a, 0x0a0c14, 0x9fb8ff], hemi: [0x5a6a9a, 0x1a1a24, 0.75], sun: [0xa8c0ff, 0.9, [-40, 70, 50]], fog: [0x101a30, 40, 220], clouds: 0x10141f, stars: 1, lamps: 1 },
  desert: { sky: [0x4a8fd0, 0xf2dcb0, 0xc9a46a, 0xfff0c8], hemi: [0xfff0d8, 0x9a7a50, 1.35], sun: [0xffe6b8, 3.1, [60, 70, -30]], fog: [0xe8d2a8, 70, 320], clouds: 0x8a7a68 },
  snow:   { sky: [0x7d9cb8, 0xdbe6ee, 0xdfe7ee, 0xffffff], hemi: [0xe6f0ff, 0x9aa6b4, 1.55], sun: [0xf2f6ff, 1.9, [-50, 60, 40]], fog: [0xd4dee8, 30, 200], clouds: 0x9aa4b0 },
  jungle: { sky: [0x4f9ad0, 0xcfe8d8, 0x5a7a4a, 0xfff2c8], hemi: [0xd8f0d0, 0x3a5a2a, 1.3], sun: [0xfff0c8, 2.6, [30, 75, 50]], fog: [0xa9c9a8, 45, 260], clouds: 0x7a8a7a },
  dusk:   { sky: [0x2a2f5a, 0xe88a6a, 0x3a3038, 0xffb890], hemi: [0xe0b8b0, 0x3a3440, 1.1], sun: [0xffa070, 2.3, [80, 26, 40]], fog: [0xb88a80, 60, 300], clouds: 0x6a4a50, lamps: 0.6 },
};

class Fighter {
  constructor(name, team, isBot) {
    this.name = name; this.team = team; this.isBot = isBot;
    this.pos = new THREE.Vector3(); this.vel = new THREE.Vector3();
    this.hw = 0.35; this.h = 1.75; this.onGround = false; this.hitWall = false;
    this.yaw = 0; this.pitch = 0; this.crouch = 0;
    this.intent = { mx: 0, mz: 0, jump: false, crouch: false, fire: false, ads: false, reload: false, melee: false, sprint: false, grenade: false };
    this.resetMatch();
  }
  resetMatch() {
    this.progress = 0; this.kills = 0; this.deaths = 0; this.streak = 0; this.bestStreak = 0;
    this.shots = 0; this.hits = 0; this.headshots = 0; this.uavT = 0; this.medals = 0;
    this.powers = { speed: 0, regen: 0, damage: 0 };
    this.alive = false; this.health = 100; this.armor = 0; this.respawnT = 0; this.lastHurt = -99; this.lastShot = -99;
    this.wi = 0; this.mag = 0; this.reserve = 0; this.reloadT = 0; this.nextFire = 0; this.switchT = 0;
    this.meleeT = 0; this.meleeAnim = 0; this.ads = 0; this.bloom = 0; this.triggerReady = true; this.sprinting = false;
    this.stepAcc = 0; this.spawnProtect = 0; this.revealT = 0;
    this.grenades = GRENADES_PER_LIFE; this.nadeT = 0; this.burstLeft = 0; this.spin = 0;
    this.slideT = 0; this.slideCd = 0; this.prevCrouchIn = false; this.launchT = 0; this.zone = null;
    this.lastKiller = null; this.equipT = 0; this.spawnT = 0;
  }
}

class Game {
  constructor() {
    this.settings = loadSettings(DEFAULTS);
    // settings saved before maps had their own lighting said 'day'; switch those to the map's look
    try { const raw = JSON.parse(localStorage.getItem('gungame.settings') || '{}'); if (raw && !raw.ladder && this.settings.lighting === 'day') this.settings.lighting = 'auto'; } catch (e) { /* storage unavailable */ }
    if (!MAP_BY_ID[this.settings.map]) this.settings.map = 'nuketown';
    if (!LADDERS[this.settings.ladder]) this.settings.ladder = 'standard';
    if (!LIGHTS[this.settings.lighting] && this.settings.lighting !== 'auto') this.settings.lighting = 'auto';
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
    this.vmHemi = new THREE.HemisphereLight(0xdfefff, 0x504840, 2.2);
    this.viewScene.add(this.vmHemi);
    const vl = new THREE.DirectionalLight(0xffffff, 2.2);
    vl.position.set(0.5, 1, 0.4);
    this.viewScene.add(vl);

    this.setupSky();
    this.effects = new Effects(this.scene);
    this.audio = new Audio();
    this.audio.setVolume(this.settings.volume);
    // The site's Sound button stores unb_muted; a change in the parent page fires 'storage' here.
    const siteMuted = () => { try { return JSON.parse(localStorage.getItem('unb_muted')) === true; } catch (e) { return false; } };
    this.audio.setMuted(siteMuted());
    window.addEventListener('storage', (e) => { if (e.key === 'unb_muted') this.audio.setMuted(siteMuted()); });
    this.camoTex = makeTextures().camo;

    this.ladder = ladderIds(this.settings.ladder).map((id) => WEAPON_BY_ID[id]);
    this.player = new Fighter(this.settings.name, 'blue', false);
    this.bot = new Fighter(pick(BOT_NAMES), 'red', true);
    this.brain = new BotBrain(this, this.bot, this.player, this.settings.difficulty);
    this.botSkin = 'red';
    this.botModel = buildCharacter(this.botSkin, this.camoTex);
    this.scene.add(this.botModel);
    this.botModel.visible = false;

    this.projectiles = [];
    this.strikes = [];
    this.pickups = [];
    this.lampLights = [];
    this.setupViewmodel();
    this.loadMap(this.settings.map);

    this.hud = new Hud(this);
    this.input = { keys: {}, fire: false, ads: false, jumpQueued: false, reloadQueued: false, meleeQueued: false, grenadeQueued: false, crouchToggle: false, lookDX: 0, lookDY: 0 };
    this.setupInput();
    if (this.isTouch) this.touch = new TouchControls(this);
    this.net = null;              // the Online session while an online match runs
    this.online = new Online(this);

    this.menuAngle = 0;
    this.shake = 0;
    this.vmKick = 0; this.vmSway = { x: 0, y: 0 }; this.bobPhase = 0;
    this.deathCam = 0;
    this.slideRoll = 0;

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
      sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunColor: { value: new THREE.Color() }, stars: { value: 0 },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.skyUniforms, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; uniform vec3 sunDir; uniform vec3 sunColor; uniform float stars; varying vec3 vDir;
        float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
        void main(){ vec3 d = normalize(vDir); float h = d.y; vec3 c = h > 0.0 ? mix(horizon, top, pow(min(1.0, h * 1.7), 0.75)) : mix(horizon, bottom, min(1.0, -h * 5.0));
        float s = max(0.0, dot(d, normalize(sunDir)));
        c += sunColor * (pow(s, 900.0) * 2.0 + pow(s, 14.0) * 0.3);
        if (stars > 0.0 && h > 0.0) { float st = step(0.9965, hash(floor(d * 260.0))); c += vec3(st) * stars * smoothstep(0.0, 0.25, h) * 0.9; }
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
    sc.left = -44; sc.right = 44; sc.top = 44; sc.bottom = -44; sc.near = 1; sc.far = 260;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.03;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);

    // fluffy clouds
    this.clouds = new THREE.Group();
    const cmat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x777777, fog: false });
    this.cloudMat = cmat;
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

  lightingKey() {
    const s = this.settings.lighting;
    return s === 'auto' || !LIGHTS[s] ? (this.map ? this.map.light : 'day') : s;
  }

  applyLighting() {
    const key = this.lightingKey(), L = LIGHTS[key] || LIGHTS.day;
    const U = this.skyUniforms;
    U.top.value.set(L.sky[0]); U.horizon.value.set(L.sky[1]); U.bottom.value.set(L.sky[2]); U.sunColor.value.set(L.sky[3]);
    U.stars.value = L.stars || 0;
    this.hemi.color.set(L.hemi[0]); this.hemi.groundColor.set(L.hemi[1]); this.hemi.intensity = L.hemi[2];
    this.sun.color.set(L.sun[0]); this.sun.intensity = L.sun[1];
    this.sun.position.set(...L.sun[2]);
    this.scene.fog = new THREE.Fog(L.fog[0], L.fog[1], L.fog[2]);
    U.sunDir.value.copy(this.sun.position).normalize();
    this.cloudMat.emissive.set(L.clouds);
    this.clouds.visible = key !== 'night';
    this.vmHemi.intensity = key === 'night' ? 1.3 : 2.2;
    // street lamps light up at night and dusk
    for (const l of this.lampLights) this.scene.remove(l);
    this.lampLights = [];
    if (L.lamps && this.map) {
      const max = this.lowGfx || this.isTouch ? 4 : 8;
      const lamps = this.map.lamps.slice().sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z)).slice(0, max);
      for (const lp of lamps) {
        const pl = new THREE.PointLight(lp.color, 10 * L.lamps, 16, 1.6);
        pl.position.set(lp.x, lp.y, lp.z);
        this.scene.add(pl);
        this.lampLights.push(pl);
      }
    }
  }

  // Swap the level. Called from the menu (live preview) and at match start.
  loadMap(id) {
    if (this.map && this.map.id === id) return;
    if (this.map) this.map.dispose();
    for (const p of this.pickups) this.scene.remove(p.mesh);
    for (const pr of this.projectiles) this.scene.remove(pr.mesh);
    this.projectiles = [];
    this.strikes = [];
    this.effects.clear();
    this.map = buildMap(this.scene, id);
    this.setupPickups();
    this.setupWeather();
    this.applyLighting();
    if (this.hud) this.hud.mapChanged();
  }

  setupWeather() {
    if (this.weather) { this.scene.remove(this.weather.pts); this.weather.pts.geometry.dispose(); this.weather = null; }
    const kind = this.map.weather;
    if (!kind) return;
    const N = this.lowGfx ? 500 : kind === 'snow' ? 1800 : 700;
    const pos = new Float32Array(N * 3), vel = new Float32Array(N * 3);
    const R = 34, HH = 22;
    for (let i = 0; i < N; i++) {
      pos[i * 3] = rand(-R, R); pos[i * 3 + 1] = rand(0, HH); pos[i * 3 + 2] = rand(-R, R);
      if (kind === 'snow') { vel[i * 3] = rand(-0.4, 0.4); vel[i * 3 + 1] = -rand(1.0, 2.2); vel[i * 3 + 2] = rand(-0.2, 0.6); }
      else if (kind === 'dust') { vel[i * 3] = rand(3, 6); vel[i * 3 + 1] = rand(-0.3, 0.3); vel[i * 3 + 2] = rand(0.5, 1.5); }
      else { vel[i * 3] = rand(-0.5, 0.5); vel[i * 3 + 1] = -rand(0.4, 1.0); vel[i * 3 + 2] = rand(-0.5, 0.5); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const color = { snow: 0xffffff, dust: 0xd9b884, leaves: 0x9acb5a }[kind];
    const size = { snow: 0.11, dust: 0.07, leaves: 0.14 }[kind];
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ color, size, transparent: true, opacity: kind === 'dust' ? 0.45 : 0.85, depthWrite: false, map: this.effects.dotTex }));
    pts.frustumCulled = false;
    this.scene.add(pts);
    this.weather = { pts, pos, vel, N, R, HH, kind, origin: new THREE.Vector3() };
  }

  updateWeather(dt) {
    const W = this.weather;
    if (!W) return;
    const c = this.camera.position, p = W.pos, v = W.vel, R = W.R, t = this.time;
    for (let i = 0; i < W.N; i++) {
      const k = i * 3;
      p[k] += (v[k] + (W.kind === 'leaves' ? Math.sin(t + i) * 0.6 : 0)) * dt; p[k + 1] += v[k + 1] * dt; p[k + 2] += v[k + 2] * dt;
      // wrap around the camera
      let dx = p[k] - c.x, dz = p[k + 2] - c.z, dy = p[k + 1] - c.y;
      if (dx > R) p[k] -= 2 * R; else if (dx < -R) p[k] += 2 * R;
      if (dz > R) p[k + 2] -= 2 * R; else if (dz < -R) p[k + 2] += 2 * R;
      if (dy < -4) p[k + 1] += W.HH; else if (dy > W.HH - 4) p[k + 1] -= W.HH;
    }
    W.pts.geometry.attributes.position.needsUpdate = true;
  }

  setupPickups() {
    const defs = {
      speed: { color: 0x3fb6ff, label: 'SPEED BOOST' },
      health: { color: 0x3ad14a, label: 'HEALTH REGEN' },
      damage: { color: 0xff3d2e, label: 'DOUBLE DAMAGE' },
      armor: { color: 0x8a7dff, label: 'ARMOR +50' },
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
        icon.add(new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.13, 0.25), em));
        icon.add(new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.4, 0.25), em));
      } else if (p.type === 'armor') {
        const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.12, 6), em);
        sh.rotation.x = Math.PI / 2; icon.add(sh);
        const inner = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.36, 0.16), new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x888888 }));
        icon.add(inner);
      } else {
        icon.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), em));
        icon.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), new THREE.MeshBasicMaterial({ color: 0xffa040, wireframe: true })));
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
    this.vmWeaponId = null;
    this.vmSpin = null;
  }

  buildViewWeapon(w) {
    this.vm.clear();
    const gun = buildWeaponModel(w);
    this.vm.add(gun);
    this.vmSpin = gun.userData.spin;
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
    this.vmFlash.scale.setScalar(w.flash || 0.24);
    this.vm.add(this.vmFlash);
    this.vmWeaponId = w.id;
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
      if (e.code === 'KeyG') I.grenadeQueued = true;
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
        if (e.button === 1) { I.grenadeQueued = true; e.preventDefault(); }
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
  // opts.online: {role, kpw, time, map, ladder, foe:{name, skin}} from the Online session
  startMatch(opts = {}) {
    const S = this.settings, on = !!opts.online;
    this.net = on ? this.online : null;
    this.netRole = on ? opts.role : null;
    this.netPause = false;
    this.audio.unlock();
    this.audio.setVolume(S.volume);
    this.loadMap(on && MAP_BY_ID[opts.map] ? opts.map : S.map);
    const ids = on && validLadder(opts.ladder) ? opts.ladder : ladderIds(S.ladder);
    this.ladder = ids.map((id) => WEAPON_BY_ID[id]);
    this.kpw = on ? opts.kpw : S.kpw;
    this.maxProgress = this.ladder.length * this.kpw;
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
    for (const pr of this.projectiles) this.scene.remove(pr.mesh);
    this.projectiles = [];
    this.strikes = [];
    for (const p of this.pickups) { p.active = true; p.respawnT = 0; p.mesh.visible = true; }
    this.effects.clear();
    const b = this.map.bunker;
    if (b) {
      b.opened = false; b.door.position.y = 1.2; b.light.intensity = 0;
      if (!world.boxes.includes(b.collider)) world.boxes.push(b.collider);
    }
    this.bunkerT = 0;
    this.firstBlood = false;
    this.timeScale = 1;

    // fixed opening spawns at opposite ends (an online guest starts north)
    const guest = on && opts.role === 'guest';
    const { south, north } = this.map.openSpawns;
    this.spawnAt(this.player, guest ? north : south);
    this.spawnAt(this.bot, guest ? south : north);
    this.brain.reset();
    // seq: last position update applied (they can arrive out of order); deadN: opponent's death count from 'died'
    this.remote = { buf: [], last: performance.now(), stepAcc: 0, prev: null, seq: -1, deadN: 0 };
    this.netSendT = 0;
    this.netSeq = 0;
    this.buildViewWeapon(this.W(this.player));
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
    if (this.state === 'ended' || this.state === 'finale') return;
    this.netPause = false;
    this.hud.showPause(false);
    this.input.fire = false; this.input.ads = false;
    const fin = !!(winner && winner.progress >= this.maxProgress);
    // fin: won by finishing the ladder (not on time), so the loser's screen says so
    if (this.net && tell) this.net.send({ t: 'end', r: winner === this.player ? 'sender' : winner ? 'receiver' : 'draw', fin: fin ? 1 : 0 });
    this.endArgs = { winner, note };
    if (fin && !note) {
      // the final kill plays out in slow motion before the results
      this.state = 'finale';
      this.finaleT = 2.4;
      this.hud.finale(winner === this.player);
      this.audio.finale(winner === this.player);
      return;
    }
    this.finishEnd();
  }

  finishEnd() {
    const { winner, note } = this.endArgs;
    this.state = 'ended';
    this.timeScale = 1;
    if (document.pointerLockElement) document.exitPointerLock();
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
    f.health = 100; f.armor = 0; f.alive = true;
    f.spawnProtect = this.time + 1.0;
    f.spawnT = this.time;
    f.powers = { speed: 0, regen: 0, damage: 0 };
    f.grenades = GRENADES_PER_LIFE; f.nadeT = 0; f.slideT = 0; f.launchT = 0; f.spin = 0; f.burstLeft = 0;
    this.equip(f, Math.min(this.ladder.length - 1, Math.floor(f.progress / this.kpw)));
    if (f === this.bot) { this.botModel.visible = true; this.brain.reset(); }
  }

  pickSpawn(f) {
    const foe = f === this.player ? this.bot : this.player;
    let best = null, bestScore = -1e9;
    const foeEye = this.eyePos(foe);
    for (const s of this.map.spawns) {
      const d = foe.alive ? Math.hypot(s.x - foe.pos.x, s.z - foe.pos.z) : 25;
      let score = Math.min(d, 38) + rand(0, 8);
      if (foe.alive && lineOfSight(foeEye, { x: s.x, y: s.y + 1.5, z: s.z })) score -= 30;
      if (d < 10) score -= 40;
      if (score > bestScore) { bestScore = score; best = s; }
    }
    return best;
  }

  equip(f, idx) {
    const w = this.ladder[idx];
    f.wi = idx; f.mag = w.mag; f.reserve = w.reserve; f.reloadT = 0; f.switchT = 0.45; f.bloom = 0; f.nextFire = 0; f.ads = 0;
    f.burstLeft = 0; f.spin = 0; f.equipT = this.time;
    if (f === this.bot) setCharacterWeapon(this.botModel, w);
    else if (this.vmWeaponId !== w.id) this.buildViewWeapon(w);
  }

  // ---------------------------------------------------------------- helpers
  W(f) { return this.ladder[f.wi]; }

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
    s += (Math.min(sp, 8) / 6) * w.spread * 0.6 * (1 - f.ads * 0.7);
    if (!f.onGround) s += w.spread * 0.8;
    if (f.slideT > 0) s += w.spread * 0.4;
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
    const w = this.W(f);
    return new THREE.Vector3(eye.x, f.pos.y + f.h - 0.55, eye.z).addScaledVector(fwd, 0.45 - w.muzzle).addScaledVector(right, 0.12);
  }

  inZone(f, type) {
    if (f.pos.y > 0.35) return false;
    for (const z of this.map.zones) if (z.type === type && f.pos.x > z.x0 && f.pos.x < z.x1 && f.pos.z > z.z0 && f.pos.z < z.z1) return true;
    return false;
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
      this.spawnProjectile(f, w, muzzle, d);
      if (this.net) this.net.send({ t: 'rk', w: w.id, o: muzzle.toArray().map(r2), d: d.toArray().map((v) => Math.round(v * 1000) / 1000) });
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
      if (w.flash) {
        this.vmFlash.visible = true;
        this.vmFlash.material.rotation = Math.random() * Math.PI * 2;
        this.vmFlashT = 0.045;
        this.effects.flashLight(muzzle, 0.05, 2);
      }
      this.brain.hear(f.pos, 1);
      if (w.recoil > 0.04) this.shake = Math.max(this.shake, w.recoil * 2.5);
    } else {
      if (w.flash) this.effects.muzzleFlash(muzzle, w.flash * 2.4);
      f.revealT = this.time + 2.0;
    }
  }

  traceShot(f, w, eye, dir, muzzle) {
    const hitW = raycastWorld(eye, dir, 250);
    const wallDist = hitW ? hitW.t : 250;
    let dist = w.pierce ? 250 : wallDist;
    const foe = this.other(f);
    let part = null;
    if (foe.alive) {
      for (const hb of this.hitboxes(foe)) {
        const r = rayBox(eye, dir, hb, dist);
        if (r && r.t < dist) { dist = r.t; part = hb.part; }
      }
    }
    if (!part) dist = wallDist;
    const end = eye.clone().addScaledVector(dir, dist);
    if (w.beam) this.effects.beam(muzzle, end, w.beam);
    else this.effects.tracer(muzzle, end, f === this.player ? 0xffe9a0 : 0xffb080);
    if (part) {
      let mul = 1;
      if (dist > w.range) {
        const endR = w.falloffEnd || w.range * 2;
        mul = lerp(1, w.minMul, clamp((dist - w.range) / (endR - w.range), 0, 1));
      }
      if (w.pierce && dist > wallDist) mul *= 0.75; // shot through a wall
      const dmg = w.dmg * mul * (part === 'head' ? w.head : part === 'legs' ? 0.9 : 1);
      f.shotHit = true;
      this.effects.blood(end, dir);
      this.damage(foe, dmg, f, w.id, part === 'head', false, end);
      if (w.pierce && hitW && hitW.t < dist) this.effects.impact(hitW.point, hitW.normal);
    } else if (hitW) {
      this.effects.impact(hitW.point, hitW.normal);
    }
    return end;
  }

  melee(f, bash) {
    const w = this.W(f);
    f.meleeT = bash ? 0.75 : 60 / w.rpm;
    f.nextFire = this.time + (bash ? 0.55 : 60 / w.rpm);
    f.meleeAnim = 0.32;
    f.reloadT = 0;
    const foe = this.other(f);
    this.audio.shot(WEAPON_BY_ID.knife, f === this.player ? null : this.eyePos(f));
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
      const at = new THREE.Vector3(chest.x, chest.y, chest.z);
      this.effects.blood(at, new THREE.Vector3(dx, 0, dz).normalize());
      this.damage(foe, 150, f, bash ? 'melee' : 'knife', false, bash, at);
    }
  }

  throwGrenade(f) {
    f.grenades--;
    f.nadeT = 0.9;
    f.meleeAnim = 0.32;
    const dir = dirFromYawPitch(f.yaw, f.pitch + 0.16, new THREE.Vector3());
    const eye = this.eyePos(f);
    const from = new THREE.Vector3(eye.x, eye.y - 0.1, eye.z).addScaledVector(dir, 0.45);
    const vel = dir.multiplyScalar(17).add(tmpV.set(f.vel.x * 0.6, Math.max(0, f.vel.y * 0.4), f.vel.z * 0.6));
    this.spawnProjectile(f, GRENADE, from, vel.clone().normalize(), vel.length());
    if (this.net && f === this.player) this.net.send({ t: 'gr', o: from.toArray().map(r2), v: vel.toArray().map(r2) });
    this.audio.throwNade(f === this.player ? null : from);
    if (f !== this.player) f.revealT = this.time + 1.0;
  }

  spawnProjectile(f, w, from, dir, speed = w.projectile) {
    const g = new THREE.Group();
    if (w.id === 'rpg') {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8), new THREE.MeshLambertMaterial({ color: 0x4a5a30 }));
      body.rotation.x = Math.PI / 2; g.add(body);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 8), new THREE.MeshLambertMaterial({ color: 0x333333 }));
      tip.rotation.x = -Math.PI / 2; tip.position.z = -0.32; g.add(tip);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.effects.fireTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
      glow.scale.setScalar(0.7); glow.position.z = 0.3; g.add(glow);
      this.audio.whoosh(from);
    } else if (w.bolt) {
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.6), new THREE.MeshLambertMaterial({ color: 0xb9bec6 }));
      g.add(shaft);
      const fl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.005, 0.1), new THREE.MeshBasicMaterial({ color: 0xd8343a }));
      fl.position.z = 0.25; g.add(fl);
    } else {
      // grenade-launcher round or hand grenade
      const m = new THREE.Mesh(new THREE.SphereGeometry(w.id === 'grenade' ? 0.09 : 0.075, 10, 8), new THREE.MeshLambertMaterial({ color: w.id === 'grenade' ? 0x3d4a2a : 0x6a6a30 }));
      g.add(m);
      const blink = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.effects.dotTex, color: 0xff3020, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
      blink.scale.setScalar(0.22); g.add(blink);
      g.userData.blink = blink;
    }
    g.position.copy(from);
    g.lookAt(from.clone().add(dir));
    this.scene.add(g);
    this.projectiles.push({
      pos: from.clone(), vel: dir.clone().multiplyScalar(speed), owner: f, mesh: g, w, smokeT: 0,
      life: w.fuse || 5, grav: w.gravity || 0, stuck: 0, bounces: 0,
    });
  }

  updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const r = this.projectiles[i], w = r.w;
      const mine = !this.net || r.owner === this.player; // online, damage is judged on the owner's screen
      r.life -= dt;
      if (r.stuck > 0) { // a crossbow bolt left in a wall
        r.stuck -= dt;
        if (r.stuck <= 0) { this.scene.remove(r.mesh); this.projectiles.splice(i, 1); }
        continue;
      }
      if (r.mesh.userData.blink) r.mesh.userData.blink.visible = Math.sin(this.time * (r.life < 0.6 ? 40 : 14)) > 0;
      r.vel.y -= r.grav * dt;
      const speed = r.vel.length();
      const step = speed * dt;
      const dir = r.vel.clone().divideScalar(speed || 1);
      const hitW = step > 0 ? raycastWorld(r.pos, dir, step + 0.05) : null;
      let t = hitW ? Math.max(0, hitW.t - 0.05) : step, direct = null, part = null;
      const foe = this.other(r.owner);
      if (foe.alive && w.id !== 'grenade') for (const hb of this.hitboxes(foe)) {
        const h = rayBox(r.pos, dir, hb, t + 0.05);
        if (h && h.t <= t + 0.05) { t = h.t; direct = foe; part = hb.part; }
      }
      r.pos.addScaledVector(dir, t);
      r.mesh.position.copy(r.pos);
      if (w.id === 'rpg' || w.bolt) r.mesh.lookAt(tmpV.copy(r.pos).add(dir));
      r.smokeT -= dt;
      if (r.smokeT <= 0 && (w.id === 'rpg' || w.id === 'gl')) { r.smokeT = w.id === 'rpg' ? 0.025 : 0.05; this.effects.smokePuff(r.pos.clone().addScaledVector(dir, -0.3), w.id === 'gl' ? 0.6 : 1); }

      if (w.bolt) {
        if (direct) {
          if (mine) this.damage(direct, w.dmg * (part === 'head' ? w.head : part === 'legs' ? 0.8 : 1), r.owner, w.id, part === 'head', false, r.pos.clone());
          if (mine && r.owner) r.owner.hits++; // projectiles land after the shot was counted
          this.effects.blood(r.pos, dir);
          this.scene.remove(r.mesh); this.projectiles.splice(i, 1);
        } else if (hitW) {
          this.effects.impact(hitW.point, hitW.normal);
          this.audio.thud(r.pos);
          r.stuck = 6;
        } else if (r.life <= 0) { this.scene.remove(r.mesh); this.projectiles.splice(i, 1); }
        continue;
      }
      if (w.bounce) {
        if (hitW && !direct) {
          // bounce: flip the velocity along the face normal and lose energy
          const n = hitW.normal;
          const ax = n.x ? 'x' : n.y ? 'y' : 'z';
          r.vel[ax] = -r.vel[ax] * 0.42;
          for (const k of ['x', 'y', 'z']) if (k !== ax) r.vel[k] *= 0.72;
          if (speed > 3) this.audio.clink(r.pos);
          r.bounces++;
          if (n.y > 0 && Math.abs(r.vel.y) < 1.2) { r.vel.y = 0; r.grav = 0; r.vel.multiplyScalar(0.85); }
          else r.grav = w.gravity;
          r.pos.addScaledVector(new THREE.Vector3(n.x, n.y, n.z), 0.02);
        }
        if (r.grav === 0) { r.vel.x *= Math.max(0, 1 - 4 * dt); r.vel.z *= Math.max(0, 1 - 4 * dt); if (!raycastWorld(r.pos, { x: 0, y: -1, z: 0 }, 0.12)) r.grav = w.gravity; }
        if (direct || r.life <= 0) {
          this.explode(r.pos.clone(), r.owner, w, null, mine);
          this.scene.remove(r.mesh); this.projectiles.splice(i, 1);
        }
        continue;
      }
      // rockets
      if (direct || hitW || r.life <= 0) {
        if (direct && mine) { this.damage(direct, w.dmg, r.owner, w.id, false, false, r.pos.clone()); r.owner.hits++; }
        const n = hitW && !direct ? hitW.normal : { x: -dir.x, y: -dir.y, z: -dir.z };
        this.explode(r.pos.clone().add(new THREE.Vector3(n.x, n.y, n.z).multiplyScalar(0.15)), r.owner, w, direct, mine);
        this.scene.remove(r.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  explode(pos, owner, w, skip, mine = true) {
    this.effects.explosion(pos, w.id === 'grenade' || w.id === 'gl' ? 0.8 : 1);
    this.audio.explosion(pos);
    const pd = this.player.alive ? pos.distanceTo(this.player.pos) : 99;
    this.shake = Math.max(this.shake, clamp(1 - pd / 18, 0, 1) * 0.6);
    // knockback (rocket jumps!): your own body on your screen, the bot's offline
    for (const f of this.net ? [this.player] : [this.player, this.bot]) {
      if (!f.alive) continue;
      const c = this.aimPoints(f).chest;
      const d = Math.hypot(c.x - pos.x, c.y - pos.y, c.z - pos.z);
      if (d > w.radius || (!lineOfSight(pos, c) && !lineOfSight(pos, this.aimPoints(f).feet))) continue;
      const k = (1 - d / w.radius) * (f === owner ? 11 : 7);
      tmpV.set(c.x - pos.x, Math.max(0.6, c.y - pos.y), c.z - pos.z).normalize();
      f.vel.x += tmpV.x * k; f.vel.z += tmpV.z * k; f.vel.y = Math.max(f.vel.y, tmpV.y * k);
      f.onGround = false;
      if (f.vel.y > 3) f.launchT = Math.max(f.launchT, 0.35);
    }
    if (!mine) return;
    let hitFoe = false;
    for (const f of [this.player, this.bot]) {
      if (!f.alive || f === skip) continue;
      const c = this.aimPoints(f).chest;
      const d = Math.hypot(c.x - pos.x, c.y - pos.y, c.z - pos.z);
      if (d > w.radius) continue;
      if (!lineOfSight(pos, c) && !lineOfSight(pos, this.aimPoints(f).feet)) continue;
      let dmg = w.splash * (1 - d / w.radius) + 10;
      if (f === owner) dmg *= 0.5;
      this.damage(f, dmg, owner, w.id, false, false, new THREE.Vector3(c.x, c.y, c.z));
      if (f !== owner && owner) hitFoe = true;
    }
    // launcher splash counts toward accuracy (thrown grenades and airstrikes aren't shots)
    if (hitFoe && !skip && owner && WEAPON_BY_ID[w.id]) owner.hits++;
  }

  // ---- airstrike (7-kill streak)
  callAirstrike(owner) {
    const foe = this.other(owner);
    const c = foe.alive ? foe.pos : (this.map.spawns.find((s) => Math.sign(s.z || 1) === Math.sign(foe.pos.z || 1)) || foe.pos);
    const pts = [];
    for (let i = 0; i < 7; i++) {
      const a = Math.random() * Math.PI * 2, r = i === 0 ? 0 : rand(1.5, 6);
      pts.push([r2(c.x + Math.cos(a) * r), r2(c.z + Math.sin(a) * r), r2(1.8 + i * 0.22)]);
    }
    this.scheduleStrike(owner, pts, true);
    if (this.net && owner === this.player) this.net.send({ t: 'as', p: pts });
  }

  scheduleStrike(owner, pts, mine) {
    const b = this.map.bounds;
    for (const [x, z, t] of pts) this.strikes.push({ x: clamp(x, b.x0, b.x1), z: clamp(z, b.z0, b.z1), t, owner, mine: mine && (!this.net || owner === this.player) });
    // a jet streaks across
    const jet = new THREE.Group();
    const m = new THREE.MeshLambertMaterial({ color: 0x3a3f48 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 7), m); jet.add(body);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(8, 0.15, 2.2), m); wing.position.z = 0.8; jet.add(wing);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.6, 1.4), m); tail.position.set(0, 0.8, 3); jet.add(tail);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.effects.fireTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    fl.scale.setScalar(2.5); fl.position.z = 3.8; jet.add(fl);
    const [cx, cz] = pts[0], a = Math.random() * Math.PI * 2;
    const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    jet.position.set(cx - dir.x * 160, 42, cz - dir.z * 160);
    jet.lookAt(jet.position.clone().sub(dir));
    this.scene.add(jet);
    this.jets = this.jets || [];
    this.jets.push({ mesh: jet, dir, t: 0 });
    this.audio.jet();
    if (owner === this.player) this.hud.banner('AIRSTRIKE INBOUND', 'Bombs away on the enemy', 'good');
    else { this.hud.banner('INCOMING AIRSTRIKE!', 'Take cover!', 'bad'); this.audio.siren(); }
  }

  updateStrikes(dt) {
    for (let i = this.strikes.length - 1; i >= 0; i--) {
      const s = this.strikes[i];
      s.t -= dt;
      if (s.t > 0) continue;
      this.strikes.splice(i, 1);
      const top = { x: s.x, y: 40, z: s.z };
      const hit = raycastWorld(top, { x: 0, y: -1, z: 0 }, 60);
      const y = hit ? hit.point.y + 0.3 : 0.3;
      this.explode(new THREE.Vector3(s.x, y, s.z), s.owner, AIRSTRIKE, null, s.mine);
    }
    if (this.jets) for (let i = this.jets.length - 1; i >= 0; i--) {
      const j = this.jets[i];
      j.t += dt;
      j.mesh.position.addScaledVector(j.dir, 120 * dt);
      if (j.t > 3.2) { this.scene.remove(j.mesh); this.jets.splice(i, 1); }
    }
  }

  damage(victim, amount, attacker, weaponId, head, bash, at = null) {
    if (!victim.alive || this.state !== 'playing') return;
    if (this.net && victim === this.bot) {
      // online, the opponent's own game applies damage to them and reports the death
      if (attacker === this.player) {
        if (this.player.powers.damage > 0) amount *= 2;
        this.net.send({ t: 'hit', d: Math.round(amount * 10) / 10, w: weaponId, h: head ? 1 : 0, b: bash ? 1 : 0 });
        this.hud.hitmarker(head, false);
        this.audio.hitmarker(head);
        if (at) this.hud.damageNumber(at, amount, head);
      }
      return;
    }
    if (victim.spawnProtect > this.time) amount *= 0.25;
    if (!this.net && attacker && attacker !== victim && attacker.powers.damage > 0) amount *= 2;
    const shown = amount;
    if (victim.armor > 0) {
      const a = Math.min(victim.armor, amount * 0.6);
      victim.armor -= a; amount -= a;
      if (victim === this.player && victim.armor <= 0) this.hud.toast('Armor broken!');
    }
    victim.health -= amount;
    victim.lastHurt = this.time;
    if (victim === this.player) {
      this.audio.hurt();
      if (attacker && attacker !== victim) this.hud.damageFrom(attacker.pos);
      this.shake = Math.max(this.shake, 0.15);
    } else {
      this.brain.onDamaged(attacker ? attacker.pos : null);
      victim.flinch = 0.15;
    }
    const killed = victim.health <= 0;
    if (attacker === this.player && victim !== this.player) {
      this.hud.hitmarker(head, killed);
      this.audio.hitmarker(head, killed);
      if (at) this.hud.damageNumber(at, shown, head);
    }
    if (killed) this.kill(victim, attacker, weaponId, head, bash);
  }

  kill(victim, killer, weaponId, head, bash) {
    const suicide = !killer || killer === victim;
    // snapshot for medals before the victim's state changes
    const ctx = this.killContext(killer, victim, weaponId);
    this.victimDied(victim, suicide ? null : killer, weaponId, head, bash);
    // online, the killer's game awards its own kill when it hears about the death
    if (this.net) this.net.send({ t: 'died', w: weaponId, h: head ? 1 : 0, b: bash ? 1 : 0, s: suicide ? 1 : 0, n: victim.deaths, air: ctx.victimAir ? 1 : 0 });
    else if (!suicide) this.awardKill(killer, victim, weaponId, head, bash, ctx);
    this.hud.updateScores();
  }

  killContext(killer, victim, weaponId) {
    if (!killer || killer === victim) return {};
    const dist = Math.hypot(killer.pos.x - victim.pos.x, killer.pos.z - victim.pos.z);
    const toKiller = yawTo(killer.pos.x - victim.pos.x, killer.pos.z - victim.pos.z);
    return {
      dist, victimAir: !victim.onGround && victim.pos.y > 0.4, killerAir: !killer.onGround,
      backstab: Math.abs(angleDiff(victim.yaw, toKiller)) > 2.1,
      sliding: killer.slideT > 0, lowHp: killer.health < 25, quick: this.time - killer.equipT < 1.2 && weaponId !== 'grenade',
      fresh: this.time - killer.spawnT < 3,
    };
  }

  victimDied(victim, killer, weaponId, head, bash) {
    victim.alive = false;
    victim.health = 0;
    victim.deaths++;
    victim.streak = 0;
    victim.respawnT = 3;
    victim.reloadT = 0;
    victim.slideT = 0;
    victim.lastKiller = killer;
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

  awardKill(killer, victim, weaponId, head, bash, ctx = {}) {
    const behind = killer.progress + 2 < victim.progress;
    killer.kills++;
    killer.streak++;
    killer.bestStreak = Math.max(killer.bestStreak, killer.streak);
    if (head) killer.headshots++;
    if (killer === this.player) this.awardMedals(weaponId, head, bash, victim, ctx, behind);
    if (!this.firstBlood) this.firstBlood = true;
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
          const w = this.ladder[after];
          this.hud.banner('WEAPON UPGRADED', w.name + (after === this.ladder.length - 1 ? '. Final weapon!' : ''), 'good', w);
          this.audio.levelUp();
        }
      } else if (killer === this.player) this.hud.banner('+1 KILL', `${this.kpw - (killer.progress % this.kpw)} more for the next weapon`, 'good');
      if (killer === this.player) this.audio.kill();
    }
    this.streakReward(killer);
  }

  streakReward(f) {
    const r = STREAKS[f.streak];
    if (!r) return;
    const me = f === this.player;
    if (r === 'uav') {
      f.uavT = 20;
      if (me) { this.hud.toast('UAV online: enemy shown on the minimap'); this.audio.reward(); }
      else this.hud.toast('Enemy UAV spotted!');
    } else if (r === 'armor') {
      f.armor = 100;
      if (me) { this.hud.toast('5 KILL STREAK: Armor equipped!'); this.audio.reward(); }
      else this.hud.toast(`${f.name} put on armor!`);
    } else if (r === 'airstrike') {
      if (me || !this.net) this.callAirstrike(f);
    }
  }

  awardMedals(weaponId, head, bash, victim, c, behind) {
    const M = [];
    if (!this.firstBlood) M.push(['FIRST BLOOD', 'First kill of the match']);
    if (head) M.push(['HEADSHOT', '']);
    if (bash) M.push(['HUMILIATION', 'Melee kill']);
    if ((weaponId === 'knife' || bash) && c.backstab) M.push(['BACKSTAB', 'From behind']);
    if (weaponId === 'grenade') M.push(['FRAG OUT', 'Grenade kill']);
    if (weaponId === 'airstrike') M.push(['AIR MAIL', 'Airstrike kill']);
    if ((weaponId === 'rpg' || weaponId === 'gl') && c.victimAir) M.push(['SKEET SHOT', 'Blew them out of the air']);
    else if (c.victimAir) M.push(['AIRBORNE', 'Shot them mid-air']);
    if (c.killerAir && !bash) M.push(['TOP GUN', 'Kill while airborne']);
    if (c.sliding) M.push(['SLIDER', 'Kill while sliding']);
    if (c.dist > 32 && !bash && weaponId !== 'airstrike') M.push(['LONGSHOT', `${Math.round(c.dist)} m`]);
    else if (c.dist < 2.5 && !bash && weaponId !== 'knife' && weaponId !== 'grenade') M.push(['POINT BLANK', '']);
    if (victim === this.player.lastKiller) M.push(['REVENGE', `Payback on ${victim.name}`]);
    if (behind) M.push(['COMEBACK', 'Fighting back from behind']);
    if (c.lowHp) M.push(['LAST STAND', 'Kill with under 25 health']);
    if (c.quick && weaponId !== 'airstrike') M.push(['QUICKDRAW', 'Kill right after switching weapons']);
    const st = this.player.streak;
    const names = { 3: 'TRIPLE THREAT', 5: 'RAMPAGE', 7: 'UNSTOPPABLE', 10: 'GODLIKE', 15: 'LEGENDARY' };
    if (names[st]) M.push([names[st], `${st} kills in a row`]);
    if (victim.streak >= 3) M.push(['BUZZKILL', `Ended a ${victim.streak}-kill streak`]);
    this.player.medals += M.length;
    for (const m of M) this.hud.medal(...m);
    if (M.length) this.audio.medal(M.length);
    if (this.player.lastKiller === victim) this.player.lastKiller = null;
  }

  demote(f) {
    const before = Math.floor(f.progress / this.kpw);
    f.progress = Math.max(0, (before - 1) * this.kpw);
  }

  tryInteract() {
    const b = this.map.bunker, p = this.player;
    if (!b || !p.alive || b.opened) return;
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
      it.mx = it.mz = 0; it.jump = it.fire = it.ads = it.reload = it.melee = it.sprint = it.grenade = false;
      I.lookDX = I.lookDY = 0; I.jumpQueued = I.reloadQueued = I.meleeQueued = I.grenadeQueued = false;
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
    // hold C (or Ctrl) to crouch; the touch CROUCH button toggles. Crouch while sprinting to slide.
    it.crouch = !!(k.KeyC || k.ControlLeft) || I.crouchToggle;
    it.fire = I.fire;
    it.ads = I.ads || !!k.KeyQ;
    it.reload = I.reloadQueued; I.reloadQueued = false;
    it.melee = I.meleeQueued; I.meleeQueued = false;
    it.grenade = I.grenadeQueued; I.grenadeQueued = false;

    // look
    const zoom = lerp(1, this.W(p).adsZoom, p.ads);
    const sens = 0.0022 * S.sens / zoom;
    p.yaw -= I.lookDX * sens;
    p.pitch = clamp(p.pitch - I.lookDY * sens, -1.5, 1.5);
    I.lookDX = 0; I.lookDY = 0;
  }

  updateFighter(f, dt) {
    const I = f.intent, w = this.W(f);
    const hs0 = Math.hypot(f.vel.x, f.vel.z);
    // slide: crouch while sprinting
    const crouchEdge = I.crouch && !f.prevCrouchIn;
    f.prevCrouchIn = I.crouch;
    f.slideCd = Math.max(0, f.slideCd - dt);
    if (crouchEdge && f.onGround && hs0 > 5.6 && f.slideT <= 0 && f.slideCd <= 0 && f.sprinting) {
      f.slideT = 0.8; f.slideCd = 1.1;
      const k = Math.max(hs0 * 1.3, 10) / hs0;
      f.vel.x *= k; f.vel.z *= k;
      if (f === this.player) this.audio.slide();
      else this.audio.slide(f.pos);
    }
    const sliding = f.slideT > 0;
    // crouch
    if (I.crouch || sliding) f.crouch = Math.min(1, f.crouch + dt * (sliding ? 10 : 7));
    else if (f.crouch > 0) {
      if (!bodyBlocked(f.pos.x, f.pos.y + 0.05, f.pos.z, f.hw - 0.02, 1.7)) f.crouch = Math.max(0, f.crouch - dt * 7);
    }
    f.h = 1.75 - 0.55 * f.crouch;

    const moving = Math.hypot(I.mx, I.mz) > 0.1;
    f.sprinting = I.sprint && moving && f.crouch < 0.5 && !I.ads && !I.fire && f.meleeAnim <= 0 && !sliding;
    const adsTarget = I.ads && !f.sprinting && f.switchT <= 0 && !w.melee ? 1 : 0;
    f.ads = adsTarget ? Math.min(1, f.ads + dt / w.adsTime) : Math.max(0, f.ads - dt / (w.adsTime * 0.8));

    const onIce = f.onGround && this.inZone(f, 'ice');
    const inWater = f.onGround && this.inZone(f, 'water');
    f.zone = onIce ? 'ice' : inWater ? 'water' : null;
    let sp = BASE_SPEED * w.moveMul;
    if (f.sprinting) sp *= 1.45;
    sp *= lerp(1, 0.55, f.ads) * lerp(1, 0.5, f.crouch);
    if (f.powers.speed > 0) sp *= 1.35;
    if (w.spinup && f.spin > 0.3) sp *= 0.8;
    if (inWater) sp *= 0.62;
    const dvx = I.mx * sp, dvz = I.mz * sp;
    if (sliding) {
      f.slideT -= dt;
      const fr = Math.max(0, 1 - (onIce ? 0.4 : 1.7) * dt);
      f.vel.x *= fr; f.vel.z *= fr;
      if (hs0 < 3.2 || !f.onGround && f.vel.y < -2) f.slideT = 0;
    } else if (f.onGround) {
      const acc = (onIce ? 9 : 55) * dt;
      f.vel.x += clamp(dvx - f.vel.x, -acc, acc);
      f.vel.z += clamp(dvz - f.vel.z, -acc, acc);
    } else if (f.launchT > 0) {
      f.launchT -= dt;
    } else if (moving) {
      // air control: steer toward the input, but keep momentum when there is none
      const acc = 12 * dt;
      f.vel.x += clamp(dvx - f.vel.x, -acc, acc);
      f.vel.z += clamp(dvz - f.vel.z, -acc, acc);
    }
    if (I.jump && f.onGround && (f.crouch < 0.3 || sliding)) {
      f.vel.y = 7.3; f.onGround = false;
      if (sliding) { f.slideT = 0; f.crouch = 0; f.h = 1.75; }
    }
    const wasAir = !f.onGround, fallV = f.vel.y;
    moveBody(f, dt);
    if (f.onGround) {
      f.launchT = 0;
      if (wasAir && fallV < -9 && f === this.player) { this.audio.land(); this.shake = Math.max(this.shake, 0.08); }
    }
    if (f.pos.y < -5) { f.pos.y = 0; f.vel.y = 0; }

    // jump pads
    if (f.onGround) for (const pd of this.map.pads) {
      if (Math.abs(f.pos.x - pd.x) < 0.75 && Math.abs(f.pos.z - pd.z) < 0.75 && f.pos.y < 0.4) {
        f.vel.set(pd.vx, pd.vy, pd.vz);
        f.onGround = false; f.launchT = 1.6; f.slideT = 0;
        this.audio.pad(f === this.player ? null : f.pos);
        this.effects.padBurst(new THREE.Vector3(pd.x, 0.1, pd.z));
      }
    }

    // footsteps
    const hs = Math.hypot(f.vel.x, f.vel.z);
    if (f.onGround && hs > 1.5 && !sliding) {
      f.stepAcc += hs * dt;
      if (f.stepAcc > (f.sprinting ? 2.6 : 2.0)) {
        f.stepAcc = 0;
        const quiet = f.crouch > 0.5;
        if (f === this.bot) this.audio.footstep(f.pos, quiet ? 0.08 : 0.22, f.zone);
        else {
          this.audio.footstep(null, 0.04, f.zone);
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
    const I = f.intent, w = this.W(f);
    f.switchT = Math.max(0, f.switchT - dt);
    f.meleeT -= dt;
    f.nadeT -= dt;
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
      f.burstLeft = 0;
      if (f === this.player) this.audio.reload(w.reload / 2);
    };
    if (I.reload) startReload();
    if (I.grenade && f.grenades > 0 && f.nadeT <= 0 && f.switchT <= 0 && f.meleeAnim <= 0) { this.throwGrenade(f); return; }
    if (I.melee && f.meleeT <= 0 && f.switchT <= 0) { this.melee(f, !w.melee); return; }
    // minigun barrels spin up before it fires
    if (w.spinup) {
      const spinning = I.fire && !f.sprinting && f.switchT <= 0 && f.reloadT <= 0;
      const before = f.spin;
      f.spin = spinning ? Math.min(1, f.spin + dt / w.spinup) : Math.max(0, f.spin - dt / 0.9);
      if (spinning && before === 0 && f === this.player) this.audio.spinUp();
    }
    // the rest of a burst
    if (f.burstLeft > 0) {
      if (f.mag <= 0 || f.reloadT > 0) f.burstLeft = 0;
      else if (this.time >= f.nextFire) {
        this.fire(f, w);
        f.burstLeft--;
        f.nextFire = this.time + (f.burstLeft > 0 ? 60 / w.burstRpm : 60 / w.rpm);
      }
      return;
    }
    if (!I.fire) f.triggerReady = true;
    if (I.fire && !f.sprinting && f.switchT <= 0 && this.time >= f.nextFire && f.slideT <= 0.6) {
      if (w.melee) { if (f.meleeT <= 0) this.melee(f, false); }
      else if (f.reloadT > 0) { /* busy */ }
      else if (f.mag <= 0) {
        if (f.triggerReady && f === this.player) this.audio.empty();
        f.triggerReady = false;
        startReload();
      } else if (w.spinup && f.spin < 1) { /* still spinning up */ }
      else if (w.burst) {
        if (f.triggerReady) {
          f.triggerReady = false;
          f.burstLeft = w.burst - 1;
          this.fire(f, w);
          f.nextFire = this.time + 60 / w.burstRpm;
        }
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
          if (p.type === 'armor' && f.armor >= 100) continue;
          p.active = false; p.respawnT = 25; p.mesh.visible = false;
          if (this.net) this.net.send({ t: 'pk', i: this.pickups.indexOf(p) });
          if (p.type === 'health') { f.health = 100; f.powers.regen = 15; }
          else if (p.type === 'armor') f.armor = Math.min(100, f.armor + 50);
          else f.powers[p.type] = 15;
          if (f === this.player) { this.audio.pickup(); this.hud.toast(this.pickupDefs[p.type].label + '!'); }
          break;
        }
      }
    }
  }

  updateBunker(dt) {
    const b = this.map.bunker;
    if (!b) { this.hud.interactHint(null); return; }
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
    b.flinch = Math.max(0, (b.flinch || 0) - dt);
    animateCharacter(m, dt, {
      speed: b.alive ? Math.hypot(b.vel.x, b.vel.z) : 0,
      crouch: b.crouch, pitch: b.pitch, dead: !b.alive, firing: this.time - b.lastShot < 0.08, flinch: b.flinch / 0.15,
    });
    const spin = m.userData.gun && m.userData.gun.userData.spin;
    if (spin) spin.rotation.z += (this.time - b.lastShot < 0.15 ? 30 : 0) * dt;
  }

  updateCamera(dt) {
    const p = this.player, cam = this.camera, w = this.W(p);
    const zoom = lerp(1, w.adsZoom, p.ads);
    const fov0 = this.settings.fov + (p.sprinting ? 4 : 0) + (p.slideT > 0 ? 7 : 0);
    this.fovNow = lerp(this.fovNow || fov0, fov0, 1 - Math.exp(-dt * 8));
    const fov = (2 * Math.atan(Math.tan((this.fovNow * Math.PI) / 360) / zoom) * 180) / Math.PI;
    if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; cam.updateProjectionMatrix(); }

    const eye = this.eyePos(p);
    const hs = Math.hypot(p.vel.x, p.vel.z);
    if (p.onGround && hs > 0.5 && p.slideT <= 0) this.bobPhase += dt * hs * 1.9;
    const bobAmt = Math.min(1, hs / 6) * (1 - p.ads * 0.85) * (p.onGround && p.slideT <= 0 ? 1 : 0);
    let y = eye.y + Math.abs(Math.sin(this.bobPhase)) * 0.045 * bobAmt;
    let pitch = p.pitch;
    this.slideRoll = lerp(this.slideRoll, p.slideT > 0 ? 0.06 : 0, 1 - Math.exp(-dt * 10));
    let roll = this.slideRoll;
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
    const p = this.player, w = this.W(p), vm = this.vm;
    vm.visible = p.alive && this.state !== 'ended' && this.state !== 'finale';
    const scoped = w.scope && p.ads > 0.85;
    if (scoped) vm.visible = false;
    this.hud.setScope(scoped, w);
    if (!vm.visible) return;
    if (w.id !== this.vmWeaponId) this.buildViewWeapon(w);
    const ads = p.ads;
    const hip = w.hip;
    const adsPos = [0, -w.sightY * VM_SCALE, hip[2] - 0.02];
    let x = lerp(hip[0], adsPos[0], ads), y = lerp(hip[1], adsPos[1], ads), z = lerp(hip[2], adsPos[2], ads);
    let rx = 0, ry = 0, rz = 0;
    const hs = Math.hypot(p.vel.x, p.vel.z), bob = Math.min(1, hs / 6) * (1 - ads * 0.85) * (p.slideT > 0 ? 0 : 1);
    x += Math.sin(this.bobPhase * 0.5) * 0.014 * bob;
    y += -Math.abs(Math.cos(this.bobPhase * 0.5)) * 0.012 * bob;
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
    if (p.slideT > 0) { rz += 0.35; x -= 0.04; y -= 0.03; }
    if (p.crouch > 0.5 && !ads) { rz += 0.04; }
    if (p.switchT > 0) { const kk = p.switchT / 0.45; y -= kk * 0.35; rx -= kk * 0.8; }
    if (p.reloadT > 0) {
      const kk = 1 - p.reloadT / w.reload, d = Math.sin(kk * Math.PI);
      y -= d * 0.1; rz += d * 0.6; rx += d * 0.35;
    }
    if (p.meleeAnim > 0) {
      const kk = 1 - p.meleeAnim / 0.32, d = Math.sin(kk * Math.PI);
      if (p.nadeT > 0.5) { y -= d * 0.25; rx -= d * 0.6; }
      else if (w.melee) { x -= d * 0.22; z -= d * 0.15; rz -= d * 0.9; ry += d * 0.6; }
      else { x -= d * 0.12; z -= d * 0.12; ry += d * 0.7; rz -= d * 0.3; }
    }
    if (this.vmSpin) this.vmSpin.rotation.z += p.spin * dt * 38;
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
      for (const f of [p, b]) { const I = f.intent; I.mx = I.mz = 0; I.fire = I.jump = I.melee = I.grenade = false; }
      p.intent.ads = this.input.ads;
      for (const f of [p, b]) f.switchT = Math.max(0, f.switchT - dt);
      this.updateFighter(p, dt);
      if (this.net) { this.updateRemote(dt); this.netTick(dt); }
      else {
        this.updateFighter(b, dt);
        this.brain.update(0);
        b.intent.mx = b.intent.mz = 0; b.intent.fire = false; b.intent.grenade = false;
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
    this.updateProjectiles(dt);
    this.updateStrikes(dt);
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
      sh: p.shots, hi: p.hits, hs: p.headshots, u: p.uavT > 0 ? 1 : 0, ar: Math.round(p.armor),
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
        const w = this.W(b), muzzle = this.muzzleWorld(b);
        for (const e of m.e.slice(0, 14)) {
          if (!Array.isArray(e) || e.length !== 3) continue;
          const end = new THREE.Vector3(+e[0] || 0, +e[1] || 0, +e[2] || 0);
          if (w.beam) this.effects.beam(muzzle, end, w.beam);
          else this.effects.tracer(muzzle, end, 0xffb080);
          const n = muzzle.clone().sub(end).normalize();
          this.effects.impact(end, n);
        }
        this.audio.shot(w, muzzle);
        if (w.flash) this.effects.muzzleFlash(muzzle, w.flash * 2.4);
        b.lastShot = this.time; b.revealT = this.time + 2.0;
        break;
      }
      case 'rk': {
        if (!live || !Array.isArray(m.o) || !Array.isArray(m.d)) break;
        const w = WEAPON_BY_ID[m.w] && WEAPON_BY_ID[m.w].projectile ? WEAPON_BY_ID[m.w] : WEAPON_BY_ID.rpg;
        const o = new THREE.Vector3(...m.o.map((v) => +v || 0)), d = new THREE.Vector3(...m.d.map((v) => +v || 0));
        if (d.lengthSq() < 0.5) break;
        this.spawnProjectile(b, w, o, d.normalize());
        if (w.flash) this.effects.muzzleFlash(o, w.flash * 2.4);
        this.audio.shot(w, o);
        b.lastShot = this.time; b.revealT = this.time + 2.0;
        break;
      }
      case 'gr': {
        if (!live || !Array.isArray(m.o) || !Array.isArray(m.v)) break;
        const o = new THREE.Vector3(...m.o.map((v) => +v || 0)), v = new THREE.Vector3(...m.v.map((x) => clamp(+x || 0, -40, 40)));
        if (v.lengthSq() < 1) break;
        this.spawnProjectile(b, GRENADE, o, v.clone().normalize(), v.length());
        this.audio.throwNade(o);
        break;
      }
      case 'as': {
        if (!live || !Array.isArray(m.p)) break;
        const pts = m.p.slice(0, 10).filter((q) => Array.isArray(q) && q.length === 3).map((q) => [+q[0] || 0, +q[1] || 0, clamp(+q[2] || 0, 0, 5)]);
        if (pts.length) this.scheduleStrike(b, pts, false);
        break;
      }
      case 'ml': if (live) this.audio.shot(WEAPON_BY_ID.knife, this.eyePos(b)); break;
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
    b.bestStreak = m.bs | 0; b.shots = m.sh | 0; b.hits = m.hi | 0; b.headshots = m.hs | 0; b.armor = clamp(m.ar | 0, 0, 100);
    const wi = clamp(m.w | 0, 0, this.ladder.length - 1);
    if (wi !== b.wi) { b.wi = wi; setCharacterWeapon(this.botModel, this.ladder[wi]); }
    if (m.u && !R.uav) this.hud.toast('Enemy UAV spotted!');
    R.uav = !!m.u;
    if (typeof m.tl === 'number' && this.netRole === 'guest') this.timeLeft = Math.max(0, m.tl - NET_DELAY / 1000);
    // Deaths only come from the reliable 'died' message; an update sent after that death means they respawned.
    if (m.a && !b.alive && (m.d | 0) >= R.deadN) {
      // jump straight to the new spot instead of sliding there
      b.alive = true; b.health = 100; R.buf = []; R.prev = null; b.spawnT = this.time;
    }
    R.buf.push(snap);
    if (R.buf.length > 30) R.buf.shift();
    this.hud.updateScores();
  }

  onRemoteDied(m) {
    const b = this.bot, R = this.remote, n = m.n | 0;
    if (n && n <= R.deadN) return; // already handled
    R.deadN = n || R.deadN + 1;
    const wid = WEAPON_IDS.has(m.w) ? m.w : this.W(b).id;
    const ctx = this.killContext(this.player, b, wid);
    ctx.victimAir = !!m.air;
    b.alive = false; b.health = 0; b.respawnT = 3; b.lastKiller = m.s ? null : this.player;
    if (m.s) this.hud.feedAdd(null, wid, b, false);
    else {
      this.hud.feedAdd(this.player, wid, b, !!m.h);
      if (m.b) this.hud.banner('HUMILIATION!', `${b.name} was set back a weapon`, 'good');
      this.hud.hitmarker(!!m.h, true);
      this.awardKill(this.player, b, wid, !!m.h, !!m.b, ctx);
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
    if (this.state === 'ended' || this.state === 'finale') { this.hud.rematchNote(msg, true); this.net = null; return; }
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
      const mc = this.map.menuCam;
      this.camera.position.set(Math.cos(this.menuAngle) * mc.r, mc.h, Math.sin(this.menuAngle) * mc.r);
      this.camera.fov = 60; this.camera.updateProjectionMatrix();
      this.camera.lookAt(0, 2, 0);
      this.vm.visible = false;
      this.hud.setScope(false);
      this.time += dt;
      this.updateWeather(dt);
    } else if (this.state === 'playing' || this.state === 'countdown') {
      this.time += dt;
      this.update(dt);
    } else if (this.state === 'finale') {
      // slow-motion final kill
      this.finaleT -= dt;
      const sdt = dt * 0.25;
      this.time += sdt;
      this.updateProjectiles(sdt);
      if (this.net) this.updateRemote(sdt);
      if (this.finaleT <= 0) this.finishEnd();
      dt = sdt;
    }
    if (this.state !== 'menu') {
      this.updateCamera(dt);
      this.updateViewmodel(dt);
      this.updateBotModel(this.state === 'paused' ? 0 : dt);
      if (this.state !== 'paused') { this.effects.update(dt); this.updateWeather(dt); }
      if (this.state === 'finale' || this.state === 'ended') this.updateStrikes(dt);
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
