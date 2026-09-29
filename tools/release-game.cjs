// Moves finished games out of "In progress": takes them off WIP_IDS in js/app.js, lets search engines index
// their pages (description + canonical instead of noindex) and adds them to sitemap.xml.
// Usage: node tools/release-game.cjs <gameId> [gameId ...]
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cat = fs.readFileSync(path.join(ROOT, 'js/catalog.js'), 'utf8');
const appP = path.join(ROOT, 'js/app.js'), smP = path.join(ROOT, 'sitemap.xml');
let app = fs.readFileSync(appP, 'utf8'), sm = fs.readFileSync(smP, 'utf8');
for (const id of process.argv.slice(2)) {
  const line = cat.split('\n').find(l => l.startsWith('{"id":' + JSON.stringify(id) + ','));
  if (!line) { console.error('not in catalog:', id); continue }
  const g = JSON.parse(line.replace(/,"fmt":[\s\S]*$/, '}').replace(/,\s*$/, ''));
  // 1. off the in-progress list
  app = app.replace(/const WIP_IDS=\[([^\]]*)\]/, (m, list) => 'const WIP_IDS=[' + list.split(',').map(s => s.trim()).filter(s => s && s !== "'" + id + "'").join(', ') + ']');
  // 2. indexable page
  const pageP = path.join(ROOT, g.url, 'index.html');
  let h = fs.readFileSync(pageP, 'utf8');
  h = h.replace('<title>' + esc(g.name) + ' | Detourr</title>', '<title>' + esc(g.name) + ': Play Free Online, No Download | Detourr</title>')
       .replace('<meta name="robots" content="noindex">', '<meta name="description" content="' + esc(g.blurb) + '">\n<link rel="canonical" href="https://detourr.net' + g.url + '">');
  fs.writeFileSync(pageP, h);
  // 3. sitemap
  const loc = '<loc>https://detourr.net' + g.url + '</loc>';
  if (!sm.includes(loc)) sm = sm.replace('</urlset>', '  <url>' + loc + '<lastmod>' + new Date().toISOString().slice(0, 10) + '</lastmod><priority>0.7</priority></url>\n</urlset>');
  console.log('released', id, g.url);
}
fs.writeFileSync(appP, app); fs.writeFileSync(smP, sm);
