// The reverse of release-game.cjs: takes live games out of the main list.
//   --wip   puts them in "In progress" (WIP_IDS in js/app.js)
//   --hide  removes them from the site (HIDDEN in js/app.js); the page stays reachable by its URL
// Either way the page gets noindex instead of a description + canonical, and it leaves sitemap.xml.
// Run tools/allgames.cjs afterwards to rebuild the homepage's A to Z list.
// Usage: node tools/pull-game.cjs --wip|--hide <gameId> [gameId ...]
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2), mode = args.includes('--wip') ? 'wip' : args.includes('--hide') ? 'hide' : null;
if (!mode) throw new Error('pass --wip or --hide');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cat = fs.readFileSync(path.join(ROOT, 'js/catalog.js'), 'utf8');
const appP = path.join(ROOT, 'js/app.js'), smP = path.join(ROOT, 'sitemap.xml');
let app = fs.readFileSync(appP, 'utf8'), sm = fs.readFileSync(smP, 'utf8');
for (const id of args.filter(a => !a.startsWith('--'))) {
  const line = cat.split('\n').find(l => l.startsWith('{"id":' + JSON.stringify(id) + ','));
  if (!line) { console.error('not in catalog:', id); continue }
  // read the fields straight from the line: in some entries fmt comes before url
  const field = k => JSON.parse('"' + (line.match(new RegExp('"' + k + '":"((?:[^"\\\\]|\\\\.)*)"')) || [])[1] + '"');
  const g = { name: field('name'), url: field('url') };
  // 1. onto the in-progress or hidden list
  if (mode === 'wip') app = app.replace(/const WIP_IDS=\[([^\]]*)\]/, (m, list) => list.includes("'" + id + "'") ? m : 'const WIP_IDS=[' + list.trim() + ", '" + id + "']");
  else app = app.replace(/const HIDDEN=new Set\(\[([^\]]*)\]/, (m, list) => list.includes("'" + id + "'") ? m : 'const HIDDEN=new Set([' + list.replace(/\s+$/, '') + ",'" + id + "'" + ']');
  // 2. page kept out of search engines
  const pageP = path.join(ROOT, g.url, 'index.html');
  let h = fs.readFileSync(pageP, 'utf8');
  h = h.replace('<title>' + esc(g.name) + ': Play Free Online, No Download | Detourr</title>', '<title>' + esc(g.name) + ' | Detourr</title>')
       .replace(/<meta name="description" content="[^"]*">\n?<link rel="canonical" href="[^"]*">/, '<meta name="robots" content="noindex">');
  if (!h.includes('<meta name="robots" content="noindex">')) console.error('could not add noindex to', pageP);
  fs.writeFileSync(pageP, h);
  // 3. out of the sitemap
  sm = sm.replace(new RegExp('[ \\t]*<url><loc>https://detourr\\.net' + g.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '</loc>.*?</url>\\n?'), '');
  console.log(mode === 'wip' ? 'moved to In progress' : 'hidden', id, g.url);
}
fs.writeFileSync(appP, app); fs.writeFileSync(smP, sm);
