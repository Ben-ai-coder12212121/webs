// Multiplayer signaling for Detourr games. Browsers connect to each other directly
// (WebRTC data channels); this function only lists open rooms and relays the small
// offer/answer messages needed to set up that connection. Stored in Netlify Blobs.
//   GET  /api/mp?probe=1                      -> {ok:true}
//   GET  /api/mp?list=GAME                    -> {rooms:[{id,name,n,max,mode,map}]}
//   GET  /api/mp?room=ID&peer=PEER            -> {msgs:[{from,msg}]} (and clears them)
//   POST /api/mp {op:'host',game,peer,name,max,mode,map}   -> {id}
//   POST /api/mp {op:'beat',game,room,peer,n,open}          -> {ok}
//   POST /api/mp {op:'close',game,room,peer}                -> {ok}
//   POST /api/mp {op:'find',game,room}                      -> {host,name,n,max,mode,map}
//   POST /api/mp {op:'send',room,from,to,msg}               -> {ok}
import { getStore } from "@netlify/blobs";

const STALE = 25000, MAX_MSG = 24000, MAX_ROOMS = 40;
export const vGame = g => typeof g === "string" && /^[a-z0-9_]{2,24}$/.test(g);
export const vId = s => typeof s === "string" && /^[a-z0-9]{4,32}$/.test(s);
const cleanName = n => String(n || "").replace(/[^A-Za-z0-9 _.\-']/g, "").replace(/\s+/g, " ").trim().slice(0, 24) || "Room";
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const code = () => { const a = "abcdefghjkmnpqrstuvwxyz23456789"; let s = ""; for (let i = 0; i < 5; i++) s += a[Math.floor(Math.random() * a.length)]; return s; };

export async function handle(req, store, now = Date.now()) {
  const url = new URL(req.url);
  if (req.method === "GET") {
    if (url.searchParams.get("probe")) return json({ ok: true });
    const list = url.searchParams.get("list");
    if (list != null) {
      if (!vGame(list)) return json({ error: "bad game" }, 400);
      const { blobs } = await store.list({ prefix: `room/${list}/` });
      const rooms = [];
      for (const b of blobs.slice(0, MAX_ROOMS * 2)) {
        const r = await store.get(b.key, { type: "json" });
        if (!r) continue;
        if (now - r.u > STALE) { await store.delete(b.key); continue; }
        if (r.open === false) continue;
        rooms.push({ id: r.id, name: r.name, n: r.n, max: r.max, mode: r.mode, map: r.map });
      }
      return json({ rooms: rooms.slice(0, MAX_ROOMS) });
    }
    const room = url.searchParams.get("room"), peer = url.searchParams.get("peer");
    if (!vId(room) || !vId(peer)) return json({ error: "bad query" }, 400);
    const { blobs } = await store.list({ prefix: `mb/${room}/${peer}/` });
    const msgs = [];
    for (const b of blobs.sort((a, b) => (a.key < b.key ? -1 : 1)).slice(0, 30)) {
      const m = await store.get(b.key, { type: "json" });
      await store.delete(b.key);
      if (m && now - m.t < 60000) msgs.push({ from: m.from, msg: m.msg });
    }
    return json({ msgs });
  }
  if (req.method !== "POST") return json({ error: "method" }, 405);
  let b; try { b = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  if (!b || typeof b !== "object") return json({ error: "bad body" }, 400);
  const op = b.op;
  if (op === "host") {
    if (!vGame(b.game) || !vId(b.peer)) return json({ error: "invalid" }, 400);
    let id = code();
    for (let i = 0; i < 4 && (await store.get(`room/${b.game}/${id}`, { type: "json" })); i++) id = code();
    const r = { id, host: b.peer, name: cleanName(b.name), n: 1, max: Math.max(2, Math.min(32, Number(b.max) || 10)), mode: String(b.mode || "").slice(0, 16), map: String(b.map || "").slice(0, 16), u: now, open: true };
    await store.setJSON(`room/${b.game}/${id}`, r);
    return json({ id });
  }
  if (op === "beat" || op === "close" || op === "find") {
    if (!vGame(b.game) || !vId(b.room)) return json({ error: "invalid" }, 400);
    const key = `room/${b.game}/${b.room}`;
    const r = await store.get(key, { type: "json" });
    if (!r || now - r.u > STALE) return json({ error: "no room" }, 404);
    if (op === "find") return json({ host: r.host, name: r.name, n: r.n, max: r.max, mode: r.mode, map: r.map });
    if (r.host !== b.peer) return json({ error: "not host" }, 403);
    if (op === "close") { await store.delete(key); return json({ ok: true }); }
    r.u = now; r.n = Math.max(1, Math.min(r.max, Number(b.n) || 1)); r.open = b.open !== false;
    await store.setJSON(key, r);
    return json({ ok: true });
  }
  if (op === "send") {
    if (!vId(b.room) || !vId(b.from) || !vId(b.to)) return json({ error: "invalid" }, 400);
    const s = JSON.stringify(b.msg || null);
    if (s.length > MAX_MSG) return json({ error: "too big" }, 413);
    await store.setJSON(`mb/${b.room}/${b.to}/${now}-${Math.random().toString(36).slice(2, 8)}`, { from: b.from, msg: b.msg, t: now });
    return json({ ok: true });
  }
  return json({ error: "op" }, 400);
}

export default async (req) => handle(req, getStore({ name: "multiplayer", consistency: "strong" }));
export const config = { path: "/api/mp" };
