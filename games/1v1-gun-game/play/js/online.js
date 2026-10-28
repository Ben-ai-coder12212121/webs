import * as Net from './net.js';
import { BLUE_SKINS } from './character.js';

// Matchmaking (Quick Match and friend rooms) plus the start / rematch / leave handshake.
// Everything that happens during a match is forwarded to game.onNet().
const QUICK = 'quick' + Net.PROTO, FRIEND = 'friend' + Net.PROTO;
const $ = (id) => document.getElementById(id);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export class Online {
  constructor(game) {
    this.g = game;
    this.link = null;      // connected link during a match
    this.pending = null;   // link still being set up
    this.token = null;     // changes on cancel, so stale async steps stop
    this.avail = null;
    this.foe = null;
    this.el = {
      box: $('online'), title: $('onTitle'), status: $('onStatus'), code: $('onCode'), copy: $('onCopy'),
      friend: $('onFriend'), input: $('onJoinCode'), err: $('onErr'),
    };
    $('onCancel').addEventListener('click', () => this.cancel());
    $('onCreate').addEventListener('click', () => this.createRoom());
    $('onJoin').addEventListener('click', () => this.joinFromInput());
    this.el.input.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') this.joinFromInput(); });
    this.el.copy.addEventListener('click', () => this.copyInvite());
    setTimeout(() => this.checkInvite(), 300);
  }

  get name() { return Net.cleanName(this.g.settings.name); }
  get active() { return !!this.link; }

  // ------------------------------------------------------------ panel
  open(title) {
    const E = this.el;
    E.box.classList.remove('hidden');
    E.title.textContent = title;
    E.code.classList.add('hidden'); E.copy.classList.add('hidden'); E.friend.classList.add('hidden'); E.err.classList.add('hidden');
    E.status.textContent = '';
  }
  status(t) { this.el.status.textContent = t; }
  error(t) { this.el.err.textContent = t; this.el.err.classList.remove('hidden'); }
  closePanel() { this.el.box.classList.add('hidden'); clearInterval(this.clock); }

  async ensureAvailable() {
    if (this.avail === null) this.avail = await Net.available();
    if (!this.avail) {
      this.status('');
      this.error('Online play works on detourr.net. Open the game at detourr.net/games/1v1-gun-game/ to play other people.');
    }
    return this.avail;
  }

  stopSearch() {
    clearInterval(this.scanT); clearInterval(this.clock);
    if (this.pending) { try { this.pending.close(); } catch (e) { /* ignore */ } this.pending = null; }
  }

  cancel() {
    this.token = null;
    this.stopSearch();
    this.closePanel();
  }

  // ------------------------------------------------------------ quick match
  async quick() {
    this.g.audio.unlock();
    this.stopSearch();
    const token = this.token = {};
    this.open('QUICK MATCH');
    this.status('Finding an opponent…');
    if (!await this.ensureAvailable() || token !== this.token) return;
    const t0 = performance.now();
    this.clock = setInterval(() => {
      if (this.pending && this.pending.role === 'host') {
        const s = Math.floor((performance.now() - t0) / 1000);
        this.status(`Waiting for an opponent… ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
      }
    }, 1000);
    if (await this.joinOpenRoom(token)) return;
    if (token === this.token) this.hostQuick(token);
  }

  async joinOpenRoom(token, except) {
    let rooms = [];
    try { rooms = await Net.listRooms(QUICK); } catch (e) { /* none */ }
    if (token !== this.token) return true;
    for (const r of shuffle(rooms.filter((x) => x.id !== except)).slice(0, 3)) {
      this.status('Found a player. Connecting…');
      if (await this.attemptJoin(r.id, 12000, token)) return true;
      if (token !== this.token) return true;
    }
    return false;
  }

  attemptJoin(code, ms, token) {
    return new Promise((res) => {
      const L = Net.join(code, this.name, ms);
      this.pending = L;
      L.on('open', () => { if (token !== this.token) { L.close(); return res(true); } this.pending = null; res(true); this.begin(L); });
      L.on('error', () => { if (this.pending === L) this.pending = null; res(false); });
    });
  }

  hostQuick(token) {
    const L = Net.host(QUICK, this.name);
    this.pending = L;
    L.on('error', (e) => { if (token === this.token) { this.status(''); this.error(e); } });
    L.on('open', () => { if (token !== this.token) { L.close(); return; } clearInterval(this.scanT); this.pending = null; this.begin(L); });
    L.on('ready', (code) => {
      // Two players can open rooms at the same moment and wait on each other forever.
      // The one with the later code gives up its room and joins the earlier one.
      clearInterval(this.scanT);
      this.scanT = setInterval(async () => {
        if (L.connected || L.closed || token !== this.token) return;
        let rooms = [];
        try { rooms = await Net.listRooms(QUICK); } catch (e) { return; }
        const other = rooms.find((r) => r.id !== code && r.id < code);
        if (!other || L.connected || token !== this.token) return;
        clearInterval(this.scanT);
        L.close();
        this.pending = null;
        if (!await this.attemptJoin(other.id, 12000, token) && token === this.token) this.hostQuick(token);
      }, 6000);
    });
  }

  // ------------------------------------------------------------ friends
  friend(code) {
    this.g.audio.unlock();
    this.stopSearch();
    this.token = {};
    this.open('PLAY A FRIEND');
    this.el.friend.classList.remove('hidden');
    this.status('Make a room and send your friend the code, or type their code.');
    if (code) { this.el.input.value = code.toUpperCase(); this.joinCode(code); }
  }

  async createRoom() {
    this.stopSearch();
    const token = this.token = {};
    this.open('YOUR ROOM');
    this.status('Making a room…');
    if (!await this.ensureAvailable() || token !== this.token) return;
    const L = Net.host(FRIEND, this.name);
    this.pending = L;
    L.on('ready', (code) => {
      if (token !== this.token) return;
      this.inviteCode = code;
      this.el.code.textContent = code.toUpperCase();
      this.el.code.classList.remove('hidden');
      this.el.copy.classList.remove('hidden');
      this.el.copy.textContent = 'COPY INVITE LINK';
      this.status('Send your friend this code or the invite link. Waiting for them to join…');
    });
    L.on('open', () => { if (token !== this.token) { L.close(); return; } this.pending = null; this.begin(L); });
    L.on('error', (e) => { if (token === this.token) { this.status(''); this.error(e); } });
  }

  joinFromInput() {
    const c = this.el.input.value.trim().replace(/[^a-z0-9]/gi, '');
    if (c.length < 4) { this.el.input.focus(); return; }
    this.joinCode(c);
  }

  async joinCode(code) {
    this.stopSearch();
    const token = this.token = {};
    this.open('JOINING ' + code.toUpperCase());
    this.status('Connecting to your friend…');
    if (!await this.ensureAvailable() || token !== this.token) return;
    const L = Net.join(code, this.name, 30000);
    this.pending = L;
    L.on('open', () => { if (token !== this.token) { L.close(); return; } this.pending = null; this.begin(L); });
    L.on('error', (e) => {
      if (token !== this.token) return;
      this.pending = null;
      this.friend();
      this.error(e);
    });
  }

  inviteUrl(code) {
    let loc = location;
    try { if (window.parent !== window && window.parent.location.origin === location.origin) loc = window.parent.location; } catch (e) { /* cross-origin parent */ }
    return loc.origin + loc.pathname + '?room=' + code;
  }

  async copyInvite() {
    const url = this.inviteUrl(this.inviteCode);
    try { await navigator.clipboard.writeText(url); this.el.copy.textContent = 'COPIED!'; }
    catch (e) { this.el.copy.textContent = url; }
    setTimeout(() => { this.el.copy.textContent = 'COPY INVITE LINK'; }, 2500);
  }

  // An invite link (?room=CODE) on this page or on the Detourr page around it opens the room.
  checkInvite() {
    const take = (w) => {
      try {
        const u = new URL(w.location.href), c = u.searchParams.get('room');
        if (!c) return null;
        u.searchParams.delete('room');
        w.history.replaceState(null, '', u.pathname + u.search + u.hash);
        return c.toLowerCase().replace(/[^a-z0-9]/g, '');
      } catch (e) { return null; }
    };
    let code = take(window);
    if (!code && window.parent !== window) code = take(window.parent);
    if (code && this.g.state === 'menu') this.friend(code);
  }

  // ------------------------------------------------------------ match session
  begin(L) {
    this.stopSearch();
    this.link = L;
    this.foe = null;
    this.meAgain = false; this.foeAgain = false;
    this.status('Connected! Starting…');
    L.onMessage((m) => this.onMsg(m));
    L.on('close', () => this.onClose('The connection to your opponent was lost.'));
    L.send({ t: 'hello', proto: Net.PROTO, name: this.name, skin: this.g.settings.skin });
  }

  send(m, fast) { return this.link ? this.link.send(m, fast) : false; }

  startAsHost() {
    const S = this.g.settings;
    const m = { t: 'start', kpw: S.kpw === 2 ? 2 : 1, time: [5, 10, 15].includes(S.time) ? S.time : 10 };
    this.send(m);
    this.launch(m);
  }

  launch(m) {
    this.closePanel();
    this.meAgain = false; this.foeAgain = false;
    this.g.startMatch({ online: true, role: this.link.role, kpw: m.kpw === 2 ? 2 : 1, time: [5, 10, 15].includes(m.time) ? m.time : 10, foe: this.foe });
  }

  onMsg(m) {
    if (!m || typeof m.t !== 'string') return;
    switch (m.t) {
      case 'hello':
        if (m.proto !== Net.PROTO) { this.leave(); this.open('ONLINE'); this.error('Your opponent has a different version of the game. Refresh the page and try again.'); return; }
        this.foe = { name: Net.cleanName(m.name), skin: BLUE_SKINS.includes(m.skin) ? m.skin : 'blue' };
        if (this.link.role === 'host') this.startAsHost();
        break;
      case 'start':
        if (this.link.role === 'guest' && this.foe) this.launch(m);
        break;
      case 'again':
        this.foeAgain = true;
        this.g.hud.rematchNote(this.meAgain ? 'Starting the rematch…' : `${this.foe ? this.foe.name : 'Your opponent'} wants a rematch.`);
        if (this.meAgain && this.link.role === 'host') this.startAsHost();
        break;
      case 'bye':
        this.onClose('Your opponent left the match.');
        break;
      default:
        this.g.onNet(m);
    }
  }

  rematch() {
    if (!this.link) return;
    this.meAgain = true;
    this.send({ t: 'again' });
    this.g.hud.rematchNote(this.foeAgain ? 'Starting the rematch…' : 'Waiting for your opponent…');
    if (this.foeAgain && this.link.role === 'host') this.startAsHost();
  }

  onClose(msg) {
    if (!this.link) return;
    const L = this.link;
    this.link = null;
    try { L.close(); } catch (e) { /* ignore */ }
    this.g.netLost(msg);
  }

  leave() {
    if (this.link) {
      this.send({ t: 'bye' });
      const L = this.link;
      this.link = null;
      setTimeout(() => { try { L.close(); } catch (e) { /* ignore */ } }, 200);
    }
    this.cancel();
  }
}
