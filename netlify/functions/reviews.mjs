// Ratings and reviews for Detourr. Stored in Netlify Blobs.
//   GET  /api/reviews?game=ID&id=CLIENT   -> {avg,n,mine}            one game's star rating
//   GET  /api/reviews?sum=1               -> {games:{id:[avg,n]}}    every rated game, for the homepage tiles
//   GET  /api/reviews?site=1&id=CLIENT    -> {avg,n,dist,recent,mine} the site's reviews
//   POST /api/reviews {op:"rate",game,stars,id}               rate a game 1 to 5 (changing it replaces your old rating)
//   POST /api/reviews {op:"review",stars,text,name,id}        review the site (text optional, filtered like suggestions)
//   DELETE /api/reviews?review=ID&key=ADMIN                   remove a site review (key = REVIEWS_ADMIN_KEY, or IDEAS_ADMIN_KEY)
import { getStore } from "@netlify/blobs";
import { validId, cleanText } from "./ideas.mjs";

const MAX_REVIEWS = 500, MAX_RATERS = 20000, REVIEWS_PER_DAY = 2;
const vGame = g => typeof g === "string" && /^[a-z0-9_]{2,24}$/.test(g);
const vStars = s => Number.isInteger(s) && s >= 1 && s <= 5;
const cleanName = n => String(n || "").replace(/[^A-Za-z0-9 _.\-']/g, "").replace(/\s+/g, " ").trim().slice(0, 16);

// pure steps (exported for tests)
export function rate(data, { stars, id }, now = Date.now()) {
  data = data && data.by ? data : { by: {} };
  if (!vStars(stars)) return { data, error: "Pick 1 to 5 stars." };
  data.by[id] = [stars, now];
  const ids = Object.keys(data.by);
  if (ids.length > MAX_RATERS) { ids.sort((a, b) => data.by[a][1] - data.by[b][1]); for (const k of ids.slice(0, ids.length - MAX_RATERS)) delete data.by[k]; }
  return { data };
}
export function summary(data, id) {
  const v = data && data.by ? Object.values(data.by) : [];
  const n = v.length, avg = n ? Math.round(v.reduce((a, x) => a + x[0], 0) / n * 10) / 10 : 0;
  return { avg, n, mine: id && data && data.by && data.by[id] ? data.by[id][0] : 0 };
}
export function review(data, { stars, text, name, id }, now = Date.now()) {
  data = data && Array.isArray(data.e) ? data : { e: [] };
  if (!vStars(stars)) return { data, error: "Pick 1 to 5 stars." };
  // reviews sent per player in the last day (kept apart from the reviews, since a new review replaces the old one)
  const lim = data.l || {}, sent = (lim[id] || []).filter(t => now - t < 864e5);
  if (sent.length >= REVIEWS_PER_DAY) return { data, error: "Thanks! You can leave another review tomorrow." };
  let x = "";
  if (String(text || "").trim()) { const c = cleanText(text); if (c.error) return { data, error: c.error.replace("suggestion", "review").replace("Tell us a bit more", "Write a little more") }; x = c.text; }
  const nm = cleanName(name), flat = nm.toLowerCase();
  if (nm && cleanText(nm + " name ok").error) return { data, error: "Please pick a friendlier name." };
  // one live review per player: a new one replaces their older one
  data.e = data.e.filter(r => r.by !== id);
  const r = { i: now.toString(36) + Math.random().toString(36).slice(2, 6), s: stars, x, n: flat ? nm : "", t: now, by: id };
  data.e.unshift(r); if (data.e.length > MAX_REVIEWS) data.e.length = MAX_REVIEWS;
  sent.push(now); lim[id] = sent;
  for (const k of Object.keys(lim)) if (!lim[k].some(t => now - t < 864e5)) delete lim[k];
  data.l = lim;
  return { data, review: r };
}
export function siteView(data, id) {
  const e = data && Array.isArray(data.e) ? data.e : [];
  const dist = [0, 0, 0, 0, 0]; for (const r of e) dist[r.s - 1]++;
  const n = e.length, avg = n ? Math.round(e.reduce((a, r) => a + r.s, 0) / n * 10) / 10 : 0;
  const pub = r => ({ i: r.i, s: r.s, x: r.x, n: r.n, t: r.t, own: !!id && r.by === id });
  const mine = id ? e.find(r => r.by === id) : null;
  return { avg, n, dist, recent: e.filter(r => r.x).slice(0, 30).map(pub), mine: mine ? pub(mine) : null };
}

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req) => {
  const store = getStore({ name: "reviews", consistency: "strong" });
  const url = new URL(req.url), q = k => url.searchParams.get(k);
  if (req.method === "GET") {
    const id = validId(q("id")) ? q("id") : null;
    if (q("sum")) return json({ games: (await store.get("sum", { type: "json" })) || {} });
    if (q("site")) return json(siteView(await store.get("site", { type: "json" }), id));
    if (vGame(q("game"))) return json(summary(await store.get("g:" + q("game"), { type: "json" }), id));
    return json({ error: "what" }, 400);
  }
  if (req.method === "DELETE") {
    const key = process.env.REVIEWS_ADMIN_KEY || process.env.IDEAS_ADMIN_KEY;
    if (!key || q("key") !== key) return json({ error: "forbidden" }, 403);
    const data = (await store.get("site", { type: "json" })) || { e: [] };
    data.e = data.e.filter(r => r.i !== q("review"));
    await store.setJSON("site", data);
    return json({ ok: true, n: data.e.length });
  }
  if (req.method === "POST") {
    let b; try { b = await req.json() } catch (e) { return json({ error: "bad json" }, 400) }
    if (!b || !validId(b.id)) return json({ error: "bad id" }, 400);
    if (b.op === "rate") {
      if (!vGame(b.game)) return json({ error: "bad game" }, 400);
      const k = "g:" + b.game, r = rate(await store.get(k, { type: "json" }), b);
      if (r.error) return json({ error: r.error }, 400);
      await store.setJSON(k, r.data);
      const s = summary(r.data, b.id), sum = (await store.get("sum", { type: "json" })) || {};
      sum[b.game] = [s.avg, s.n]; await store.setJSON("sum", sum);
      return json({ ok: true, ...s });
    }
    if (b.op === "review") {
      const r = review(await store.get("site", { type: "json" }), b);
      if (r.error) return json({ error: r.error }, 400);
      await store.setJSON("site", r.data);
      return json({ ok: true, ...siteView(r.data, b.id) });
    }
    return json({ error: "op" }, 400);
  }
  return json({ error: "method" }, 405);
};

export const config = { path: "/api/reviews" };
