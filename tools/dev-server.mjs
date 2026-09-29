// Local preview server with working online multiplayer.
// Serves the site like `npx serve`, and answers /api/mp (the room-code server) using the same code as the
// Netlify function, with rooms kept in memory. Leaderboards stay off locally.
// Usage: node tools/dev-server.mjs [port]   (default 3000), then open http://localhost:3000
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = +process.argv[2] || 3000;

// load handle() from the Netlify function without its Netlify-only import
const fnSrc = fs.readFileSync(path.join(ROOT, 'netlify/functions/mp.mjs'), 'utf8')
  .replace(/^import .*@netlify\/blobs.*$/m, '')
  .replace(/^export default .*$/m, '').replace(/^export const config .*$/m, '');
const { handle } = await import('data:text/javascript;base64,' + Buffer.from(fnSrc).toString('base64'));

// in-memory stand-in for Netlify Blobs
const mem = new Map();
const store = {
  async get(k) { return mem.has(k) ? JSON.parse(mem.get(k)) : null; },
  async setJSON(k, v) { mem.set(k, JSON.stringify(v)); },
  async delete(k) { mem.delete(k); },
  async list({ prefix }) { return { blobs: [...mem.keys()].filter(k => k.startsWith(prefix)).map(key => ({ key })) }; },
};

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream', '.xml': 'application/xml', '.txt': 'text/plain', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/mp') {
    const body = req.method === 'POST' ? await new Promise(r => { let b = ''; req.on('data', c => b += c); req.on('end', () => r(b)); }) : undefined;
    const r = await handle(new Request('http://localhost' + req.url, { method: req.method, body, headers: { 'content-type': 'application/json' } }), store);
    res.writeHead(r.status, { 'content-type': 'application/json' });
    return res.end(await r.text());
  }
  if (url.pathname.startsWith('/api/')) { res.writeHead(404, { 'content-type': 'application/json' }); return res.end('{"error":"not available locally"}'); }
  let p = path.join(ROOT, decodeURIComponent(url.pathname));
  if (!p.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
    if (!url.pathname.endsWith('/')) { res.writeHead(301, { location: url.pathname + '/' + url.search }); return res.end(); }
    p = path.join(p, 'index.html');
  }
  if (!fs.existsSync(p)) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('Not found'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-cache' });
  fs.createReadStream(p).pipe(res);
}).listen(PORT, () => console.log(`Detourr running at http://localhost:${PORT} (online multiplayer works between tabs on this computer)`));
