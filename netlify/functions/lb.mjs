// Live leaderboards for Detourr: GET /api/lb?game=KEY[&id=CLIENT] returns the top scores,
// POST /api/lb {game,name,score,lower,id} records a player's best. Stored in Netlify Blobs.
import { getStore } from "@netlify/blobs";

const MAX_ENTRIES = 500, SHOW = 50;
const BAD = ["fuck","shit","bitch","cunt","dick","cock","pussy","nigg","fag","slut","whore","rape","nazi","hitler","porn","sex","penis","vagina","retard","kys"];

export function cleanName(raw) {
  let n = String(raw || "").replace(/[^A-Za-z0-9 _.\-]/g, "").replace(/\s+/g, " ").trim().slice(0, 14);
  const flat = n.toLowerCase().replace(/0/g, "o").replace(/[1!|]/g, "i").replace(/3/g, "e").replace(/[4@]/g, "a").replace(/[5$]/g, "s").replace(/7/g, "t").replace(/[^a-z]/g, "");
  if (n.length < 2 || BAD.some(w => flat.includes(w))) n = "Player" + Math.floor(1000 + Math.random() * 9000);
  return n;
}
export const validGame = g => typeof g === "string" && /^best_[a-z0-9_]{1,48}$/.test(g);
export const validId = i => typeof i === "string" && /^[a-z0-9]{8,40}$/.test(i);
const sorter = lower => (a, b) => (lower ? a.s - b.s : b.s - a.s) || a.t - b.t;

// pure merge step (exported for tests): returns {data, rank, improved}
export function record(data, { name, score, id, lower }, now = Date.now()) {
  data = data && Array.isArray(data.e) ? data : { e: [], lower: !!lower };
  const lo = !!data.lower;
  let ent = data.e.find(x => x.id === id), improved = false;
  if (ent && now - ent.u < 1500) return { data, rank: 0, improved: false, limited: true };
  if (!ent) { ent = { id, n: name, s: score, t: now, u: now }; data.e.push(ent); improved = true; }
  else {
    ent.n = name; ent.u = now;
    if (lo ? score < ent.s : score > ent.s) { ent.s = score; ent.t = now; improved = true; }
  }
  data.e.sort(sorter(lo));
  if (data.e.length > MAX_ENTRIES) data.e.length = MAX_ENTRIES;
  const rank = data.e.indexOf(ent) + 1;
  return { data, rank, improved };
}
export function view(data, id) {
  const e = data && Array.isArray(data.e) ? data.e : [];
  const top = e.slice(0, SHOW).map(x => ({ n: x.n, s: x.s, t: x.t, me: !!id && x.id === id }));
  const i = id ? e.findIndex(x => x.id === id) : -1;
  return { top, total: e.length, lower: !!(data && data.lower), you: i >= 0 ? { rank: i + 1, s: e[i].s, n: e[i].n } : null };
}

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req) => {
  const store = getStore({ name: "leaderboards", consistency: "strong" });
  const url = new URL(req.url);
  if (req.method === "GET") {
    if (url.searchParams.get("probe")) return json({ ok: true });
    const game = url.searchParams.get("game"), id = url.searchParams.get("id");
    if (!validGame(game)) return json({ error: "bad game" }, 400);
    const data = await store.get(game, { type: "json" });
    return json(view(data, validId(id) ? id : null));
  }
  if (req.method === "POST") {
    let b; try { b = await req.json(); } catch { return json({ error: "bad json" }, 400); }
    const score = Number(b && b.score);
    if (!validGame(b.game) || !validId(b.id) || !Number.isFinite(score) || Math.abs(score) > 1e10) return json({ error: "invalid" }, 400);
    const name = cleanName(b.name);
    const cur = await store.get(b.game, { type: "json" });
    const r = record(cur, { name, score, id: b.id, lower: !!b.lower });
    if (r.limited) return json({ error: "slow down" }, 429);
    await store.setJSON(b.game, r.data);
    return json({ rank: r.rank, total: r.data.e.length, improved: r.improved, name });
  }
  return json({ error: "method" }, 405);
};

export const config = { path: "/api/lb" };
