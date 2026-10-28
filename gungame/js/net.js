// Two-player WebRTC links, set up through Detourr's /api/mp signaling function
// (the same protocol as the site's /js/lib/online.js). The players' browsers talk
// directly; the function only lists open rooms and relays the offer/answer.
// Each link has a reliable channel and a fast unordered one for position updates.

const API = '/api/mp';
export const GAME = 'gungame1v1';
export const PROTO = 1; // bump when the match messages change, so old and new versions never meet
const ICE = { iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }, { urls: 'stun:stun.cloudflare.com:3478' }] };

const rid = () => (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).replace(/[^a-z0-9]/g, '').slice(0, 16);
export const cleanName = (n) => String(n || '').replace(/[^A-Za-z0-9 _.\-']/g, '').slice(0, 16) || 'Player';

async function api(method, body, q = '') {
  const r = await fetch(API + q, method === 'GET' ? { cache: 'no-store' } : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error === 'no room' ? 'No room with that code. Check it and try again.' : 'Server error ' + r.status);
  return j;
}

function waitIce(pc, ms = 2500) {
  return new Promise((res) => {
    if (pc.iceGatheringState === 'complete') return res();
    const t = setTimeout(res, ms);
    pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); res(); } });
  });
}

function emitter(o) {
  const h = {};
  o.on = (e, f) => { (h[e] = h[e] || []).push(f); return o; };
  o.emit = (e, ...a) => (h[e] || []).slice().forEach((f) => { try { f(...a); } catch (er) { console.error(er); } });
  // Messages can arrive before the game starts listening (the other side's channel may open
  // first), so they wait in an inbox until onMessage() is set.
  const inbox = [];
  let sink = null;
  o.deliver = (m) => { if (sink) { try { sink(m); } catch (er) { console.error(er); } } else inbox.push(m); };
  o.onMessage = (fn) => { sink = fn; while (inbox.length) o.deliver(inbox.shift()); return o; };
  return o;
}

function wire(ch, fn) { ch.onmessage = (e) => { let m; try { m = JSON.parse(e.data); } catch (er) { return; } fn(m); }; }
function sendOn(ch, m) { if (ch && ch.readyState === 'open') { try { ch.send(JSON.stringify(m)); return true; } catch (e) { /* closing */ } } return false; }

export async function available() {
  if (location.protocol === 'file:') return false;
  try { const r = await fetch(API + '?probe=1', { cache: 'no-store' }); return r.ok && (await r.json()).ok === true; } catch (e) { return false; }
}

export async function listRooms(mode) {
  const r = await api('GET', null, '?list=' + GAME);
  return (r.rooms || []).filter((x) => x.mode === mode && x.n < x.max);
}

// Open a room and wait for one opponent. Emits 'ready'(code), 'open'(peerName), 'close', 'error'(text); messages go to onMessage().
export function host(mode, name) {
  const L = emitter({ role: 'host', me: rid(), code: null, peerName: '', closed: false, connected: false });
  let pollT = null, beatT = null, peer = null, busyTill = 0;
  const pending = new Map();
  const beat = () => api('POST', { op: 'beat', game: GAME, room: L.code, peer: L.me, n: L.connected ? 2 : 1, open: !L.connected }).catch(() => {});
  // poll quickly while someone is connecting, slowly while the room just waits
  const gap = () => (pending.size || Date.now() < busyTill ? 1300 : document.hidden ? 8000 : 4000);
  const tick = async () => { await poll(); if (pollT && !L.connected && !L.closed) pollT = setTimeout(tick, gap()); };
  async function poll() {
    try {
      const r = await api('GET', null, '?room=' + L.code + '&peer=' + L.me);
      for (const { from, msg } of r.msgs) {
        if (!msg) continue;
        if (msg.type === 'join') { busyTill = Date.now() + 20000; await accept(from, msg.name); }
        else if (msg.type === 'answer') { const p = pending.get(from); if (p && p.pc.signalingState !== 'stable') await p.pc.setRemoteDescription(msg.sdp); }
      }
    } catch (e) { /* try again next poll */ }
  }
  async function accept(from, nm) {
    if (L.connected || pending.has(from) || pending.size) {
      api('POST', { op: 'send', room: L.code, from: L.me, to: from, msg: { type: 'full' } }).catch(() => {});
      return;
    }
    const pc = new RTCPeerConnection(ICE);
    const rl = pc.createDataChannel('r'), u = pc.createDataChannel('u', { ordered: false, maxRetransmits: 0 });
    const p = { id: from, name: cleanName(nm), pc, rl, u };
    pending.set(from, p);
    wire(rl, L.deliver); wire(u, L.deliver);
    rl.onopen = () => {
      pending.delete(from);
      peer = p; L.connected = true; L.peerName = p.name;
      clearTimeout(pollT); pollT = null;
      beat();
      L.emit('open', p.name);
    };
    const gone = () => { pending.delete(from); if (peer === p && !L.closed) { L.closed = true; clearInterval(beatT); api('POST', { op: 'close', game: GAME, room: L.code, peer: L.me }).catch(() => {}); L.emit('close'); } };
    rl.onclose = gone;
    pc.onconnectionstatechange = () => { if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) gone(); };
    setTimeout(() => { if (pending.get(from) === p) { pending.delete(from); try { pc.close(); } catch (e) { /* ignore */ } } }, 30000);
    const off = await pc.createOffer();
    await pc.setLocalDescription(off);
    await waitIce(pc);
    await api('POST', { op: 'send', room: L.code, from: L.me, to: from, msg: { type: 'offer', sdp: pc.localDescription } });
  }
  L.send = (m, fast) => peer ? sendOn(fast ? peer.u : peer.rl, m) : false;
  L.close = () => {
    if (L.closed) return;
    L.closed = true;
    clearTimeout(pollT); clearInterval(beatT); pollT = null;
    if (L.code) api('POST', { op: 'close', game: GAME, room: L.code, peer: L.me }).catch(() => {});
    for (const p of [peer, ...pending.values()]) if (p) try { p.pc.close(); } catch (e) { /* ignore */ }
    pending.clear();
  };
  api('POST', { op: 'host', game: GAME, peer: L.me, name, max: 2, mode })
    .then((r) => {
      if (L.closed) return;
      L.code = r.id;
      busyTill = Date.now() + 20000;
      pollT = setTimeout(tick, 1300);
      beatT = setInterval(beat, 8000);
      L.emit('ready', L.code);
    })
    .catch((e) => L.emit('error', 'Could not create a room: ' + e.message));
  return L;
}

// Join a room by code. Emits 'open'(hostName), 'close', 'error'(text); messages go to onMessage().
export function join(code, name, timeoutMs = 30000) {
  code = String(code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const L = emitter({ role: 'guest', me: rid(), code, peerName: '', closed: false, connected: false });
  let pollT = null, pc = null, rl = null, u = null, done = false, to = null;
  const fail = (msg) => { if (done) return; done = true; clearInterval(pollT); clearTimeout(to); try { pc && pc.close(); } catch (e) { /* ignore */ } L.closed = true; L.emit('error', msg); };
  L.send = (m, fast) => sendOn(fast ? u : rl, m);
  L.close = () => { if (L.closed) return; L.closed = true; done = true; clearInterval(pollT); clearTimeout(to); try { pc && pc.close(); } catch (e) { /* ignore */ } };
  (async () => {
    let f;
    try { f = await api('POST', { op: 'find', game: GAME, room: code }); } catch (e) { return fail(e.message); }
    if (L.closed) return;
    L.peerName = cleanName(f.name);
    await api('POST', { op: 'send', room: code, from: L.me, to: f.host, msg: { type: 'join', name } }).catch(() => {});
    to = setTimeout(() => fail('Could not connect. One of your networks may block direct connections (common on school and work Wi-Fi). Try a different network.'), timeoutMs);
    pollT = setInterval(async () => {
      try {
        const r = await api('GET', null, '?room=' + code + '&peer=' + L.me);
        for (const { msg } of r.msgs) {
          if (!msg) continue;
          if (msg.type === 'full') return fail('That match is full or already started.');
          if (msg.type === 'offer' && !pc) {
            pc = new RTCPeerConnection(ICE);
            pc.ondatachannel = (e) => {
              const ch = e.channel;
              if (ch.label === 'u') u = ch;
              else {
                rl = ch;
                ch.onopen = () => { clearTimeout(to); clearInterval(pollT); done = true; L.connected = true; L.emit('open', L.peerName); };
                ch.onclose = () => { if (!L.closed) { L.closed = true; L.emit('close'); } };
              }
              wire(ch, L.deliver);
            };
            pc.onconnectionstatechange = () => { if (['failed', 'closed', 'disconnected'].includes(pc.connectionState) && done && !L.closed) { L.closed = true; L.emit('close'); } };
            await pc.setRemoteDescription(msg.sdp);
            const ans = await pc.createAnswer();
            await pc.setLocalDescription(ans);
            await waitIce(pc);
            await api('POST', { op: 'send', room: code, from: L.me, to: f.host, msg: { type: 'answer', sdp: pc.localDescription } });
          }
        }
      } catch (e) { /* keep polling until the timeout */ }
    }, 1000);
  })();
  return L;
}
