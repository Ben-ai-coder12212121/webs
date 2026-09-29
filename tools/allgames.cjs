// Rebuilds the "All N games A–Z" list in the homepage footer (index.html) from js/catalog.js, leaving out the
// games that js/app.js hides (HIDDEN, 3D shooters) and the in-progress ones (WIP_IDS). Run after changing either list.
// Usage: node tools/allgames.cjs
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
const list = re => eval('[' + app.match(re)[1] + ']');
const hidden = new Set([...list(/const HIDDEN=new Set\(\[([^\]]*)\]/), ...list(/const WIP_IDS=\[([^\]]*)\]/)]);
const games = fs.readFileSync(path.join(ROOT, 'js/catalog.js'), 'utf8').split('\n').filter(l => l.startsWith('{"id"'))
  .map(l => JSON.parse(l.replace(/,"fmt":[\s\S]*$/, '}').replace(/,\s*$/, ''))).filter(g => !hidden.has(g.id) && g.kind !== 'shooter');
const HEAD = [['hero', 'Superhero'], ['escape', 'Escape Room'], ['sim', 'Simulator'], ['cooking', 'Cooking'], ['arcade', 'Arcade'], ['game', 'Arcade & Quick'], ['casual', 'Casual'], ['io', '.io'], ['puzzle', 'Puzzle'], ['board', 'Board & Classic'], ['sports', 'Sports'], ['smash', 'Smash & Physics'], ['geo', 'Geography'], ['music', 'Music'], ['weird', 'Weird'], ['info', 'Cool Info'], ['toy', 'Toys'], ['chill', 'Chill']];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cols = HEAD.map(([k, h]) => { const gs = games.filter(g => g.kind === k).sort((a, b) => a.name.localeCompare(b.name)); return gs.length ? '<div><h4>' + esc(h) + '</h4><ul>' + gs.map(g => '<li><a href="' + g.url + '">' + esc(g.name) + '</a></li>').join('') + '</ul></div>' : '' }).join('');
const block = '<details class="allgames"><summary>All ' + games.length + ' games A–Z</summary><div class="allcols">' + cols + '</div></details>';
const p = path.join(ROOT, 'index.html'); let s = fs.readFileSync(p, 'utf8');
const i = s.indexOf('<!--ALLGAMES-->') + '<!--ALLGAMES-->'.length, j = s.indexOf('</details>', i) + '</details>'.length;
s = s.slice(0, i) + block + s.slice(j); fs.writeFileSync(p, s);
console.log('footer lists', games.length, 'games');
