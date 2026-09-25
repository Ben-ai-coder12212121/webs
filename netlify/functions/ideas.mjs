// Player suggestions for Detourr: GET /api/ideas?id=CLIENT lists ideas (top and newest),
// POST /api/ideas {op:"add",kind,game,text,id} adds one, {op:"vote",idea,id} toggles an upvote.
// DELETE /api/ideas?idea=ID&key=ADMIN removes one (key = IDEAS_ADMIN_KEY env var). Stored in Netlify Blobs.
import { getStore } from "@netlify/blobs";

const MAX_IDEAS = 400, PER_HOUR = 4;
const BAD = ["fuck","shit","bitch","cunt","dick","cock","pussy","nigg","fag","slut","whore","rape","nazi","hitler","porn","sex","penis","vagina","retard","kys","kill yourself"];
export const validId = i => typeof i === "string" && /^[a-z0-9]{8,40}$/.test(i);

export function cleanText(raw) {
  const t = String(raw || "").replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 240);
  if (t.length < 8) return { error: "Tell us a bit more (at least 8 characters)." };
  const flat = t.toLowerCase().replace(/0/g, "o").replace(/[1!|]/g, "i").replace(/3/g, "e").replace(/[4@]/g, "a").replace(/[5$]/g, "s").replace(/7/g, "t");
  if (BAD.some(w => flat.includes(w))) return { error: "Please keep it friendly: that suggestion has a word we don’t allow." };
  if (/https?:\/\/|www\.|\.com\b/i.test(t)) return { error: "Links aren’t allowed in suggestions." };
  return { text: t };
}

// pure steps (exported for tests)
export function add(data, { kind, game, text, id }, now = Date.now()) {
  data = data && Array.isArray(data.e) ? data : { e: [] };
  const mine = data.e.filter(x => x.by === id && now - x.t < 3600e3).length;
  if (mine >= PER_HOUR) return { data, error: "You’ve sent a lot of ideas this hour. Thanks! Try again a bit later." };
  const c = cleanText(text); if (c.error) return { data, error: c.error };
  if (data.e.some(x => x.x.toLowerCase() === c.text.toLowerCase())) return { data, error: "Someone already suggested exactly that. Give it a 👍 instead!" };
  const idea = { i: now.toString(36) + Math.random().toString(36).slice(2, 6), k: kind === "update" ? "update" : "new", g: String(game || "").replace(/[^A-Za-z0-9 :'&.\-]/g, "").slice(0, 40), x: c.text, t: now, by: id, up: [id] };
  data.e.unshift(idea);
  if (data.e.length > MAX_IDEAS) { data.e.sort((a, b) => b.up.length - a.up.length || b.t - a.t); data.e.length = MAX_IDEAS; }
  return { data, idea };
}
export function vote(data, { idea, id }) {
  data = data && Array.isArray(data.e) ? data : { e: [] };
  const it = data.e.find(x => x.i === idea); if (!it) return { data, error: "That idea is gone." };
  const k = it.up.indexOf(id); if (k >= 0) it.up.splice(k, 1); else it.up.push(id);
  return { data, votes: it.up.length, mine: k < 0 };
}
export function view(data, id) {
  const e = data && Array.isArray(data.e) ? data.e : [];
  const pub = x => ({ i: x.i, k: x.k, g: x.g, x: x.x, t: x.t, v: x.up.length, me: !!id && x.up.includes(id), own: !!id && x.by === id });
  return { top: [...e].sort((a, b) => b.up.length - a.up.length || b.t - a.t).slice(0, 40).map(pub), recent: e.slice(0, 40).map(pub), total: e.length };
}

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req) => {
  const store = getStore({ name: "ideas", consistency: "strong" });
  const url = new URL(req.url);
  if (req.method === "GET") {
    const id = url.searchParams.get("id");
    return json(view(await store.get("all", { type: "json" }), validId(id) ? id : null));
  }
  if (req.method === "DELETE") {
    const key = process.env.IDEAS_ADMIN_KEY;
    if (!key || url.searchParams.get("key") !== key) return json({ error: "forbidden" }, 403);
    const data = (await store.get("all", { type: "json" })) || { e: [] };
    data.e = data.e.filter(x => x.i !== url.searchParams.get("idea"));
    await store.setJSON("all", data);
    return json({ ok: true, total: data.e.length });
  }
  if (req.method === "POST") {
    let b; try { b = await req.json() } catch (e) { return json({ error: "bad json" }, 400) }
    if (!b || !validId(b.id)) return json({ error: "bad id" }, 400);
    const data = await store.get("all", { type: "json" });
    const r = b.op === "vote" ? vote(data, b) : add(data, b);
    if (r.error) return json({ error: r.error }, 400);
    await store.setJSON("all", r.data);
    return json({ ok: true, votes: r.votes, mine: r.mine, ...view(r.data, b.id) });
  }
  return json({ error: "method" }, 405);
};

export const config = { path: "/api/ideas" };
