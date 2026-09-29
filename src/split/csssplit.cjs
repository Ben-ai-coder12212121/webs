// Moves CSS rules that only one game uses out of css/site.css into that game's page.
// Usage: node csssplit.cjs <outDir>
const fs = require('fs'), path = require('path');
const OUT = process.argv[2];
const css = fs.readFileSync(OUT + '/css/site.css', 'utf8');
// split into top-level blocks (plain rules and @-blocks), keeping comments with the next block
const blocks = []; let i = 0, start = 0, depth = 0;
while (i < css.length) {
  const c = css[i];
  if (c === '/' && css[i + 1] === '*') { i = css.indexOf('*/', i + 2) + 2; continue; }
  if (c === '"' || c === "'") { const q = c; i++; while (i < css.length && css[i] !== q) { if (css[i] === '\\') i++; i++; } i++; continue; }
  if (c === '{') depth++;
  else if (c === '}') { depth--; if (depth === 0) { blocks.push(css.slice(start, i + 1)); start = i + 1; } }
  i++;
}
const tailCss = css.slice(start);
// shared code that must keep its styles
const shared = [fs.readFileSync(OUT + '/index.html', 'utf8'), fs.readFileSync(OUT + '/js/core.js', 'utf8'), fs.readFileSync(OUT + '/js/app.js', 'utf8'), fs.readFileSync(OUT + '/js/catalog.js', 'utf8')];
for (const f of fs.readdirSync(OUT + '/js/lib')) shared.push(fs.readFileSync(OUT + '/js/lib/' + f, 'utf8'));
const sharedText = shared.join('\n');
// each page's own game code
const pages = [];
const walk = d => { for (const f of fs.readdirSync(d)) { const p = d + '/' + f; if (fs.statSync(p).isDirectory()) walk(p); else if (f === 'index.html') pages.push(p); } };
walk(OUT + '/games');
const own = pages.map(p => { const h = fs.readFileSync(p, 'utf8'); const a = h.indexOf(': game code ====================='); const code = a < 0 ? '' : h.slice(a, h.indexOf('</script>', a)); return { p, h, code }; });
const has = (t, n) => new RegExp('(^|[^\\w-])' + n.replace(/[-]/g, '\\-') + '([^\\w-]|$)').test(t);
const moved = new Map(); const keep = [];
for (const b of blocks) {
  const sel = b.slice(0, b.indexOf('{')).replace(/\/\*[\s\S]*?\*\//g, '').trim();
  if (sel.startsWith('@') || /:root|\bbody\b|\bhtml\b|#stage|#arena|\.seo\b/.test(sel)) { keep.push(b); continue; }
  const names = [...new Set([...sel.matchAll(/[.#]([a-zA-Z_][\w-]*)/g)].map(m => m[1]))];
  if (!names.length) { keep.push(b); continue; }
  if (names.some(n => has(sharedText, n))) { keep.push(b); continue; }
  const users = own.filter(o => names.some(n => has(o.code, n)));
  if (users.length !== 1) { keep.push(b); continue; }
  const u = users[0].p; if (!moved.has(u)) moved.set(u, []); moved.get(u).push(b.trim());
}
fs.writeFileSync(OUT + '/css/site.css', keep.join('') + tailCss);
let n = 0, bytes = 0;
for (const [p, rules] of moved) {
  let h = fs.readFileSync(p, 'utf8');
  const style = '<style>\n/* styles used only by this game */\n' + rules.join('\n') + '\n</style>\n';
  h = h.replace('<link rel="stylesheet" href="/css/site.css">\n', '<link rel="stylesheet" href="/css/site.css">\n' + style);
  fs.writeFileSync(p, h); n += rules.length; bytes += style.length;
}
console.log('moved', n, 'rules,', bytes, 'bytes, into', moved.size, 'game pages; site.css now', (keep.join('') + tailCss).length);
