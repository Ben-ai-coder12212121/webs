// Creates a new game page and its catalog entry.
// Usage: node tools/new-game.cjs <game-code.js> [--wip] [--libs=online,io]
// The code file must contain one G.push({id:'...',name:'...',kind:'...',tint:'...',blurb:'...',art:'...',fmt:...,run(root,c){...}}).
// The page is written to games/<slug>/index.html (from the name) and the listing is added to js/catalog.js.
// With --wip the game also goes into WIP_IDS in js/app.js (the "In progress" section) and is kept out of search engines.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--'));
const wip = args.includes('--wip');
const libs = ((args.find(a => a.startsWith('--libs=')) || '').slice(7)).split(',').filter(Boolean);
const code = fs.readFileSync(file, 'utf8').trim();

// read the listing fields by running the G.push call against a stub
const got = [];
new Function('G', 'el', 'S', code)({ push: g => got.push(g) }, () => ({}), { get: (k, d) => d, set() {} });
if (got.length !== 1) throw new Error('expected exactly one G.push in ' + file);
const g = got[0];
for (const k of ['id', 'name', 'kind', 'tint', 'blurb', 'art']) if (!g[k]) throw new Error('missing ' + k);
const slug = g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const url = '/games/' + slug + '/';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// page: head and shared markup from an existing page, then this game's code
const tpl = fs.readFileSync(path.join(ROOT, 'games/2048/index.html'), 'utf8');
const gtag = tpl.match(/<!-- Google tag[\s\S]*?<\/script>\s*<script>[\s\S]*?<\/script>/) || tpl.match(/<script async src="https:\/\/www.googletagmanager[\s\S]*?<\/script>\s*<script>[\s\S]*?<\/script>/);
const fonts = '<link rel="stylesheet" href="/css/fonts.css">';
const body = tpl.slice(tpl.indexOf('<div id="stage">'), tpl.indexOf('<div class="seo">'));
const head = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(g.name)}${wip ? ' | Detourr' : ': Play Free Online, No Download | Detourr'}</title>
${wip ? '<meta name="robots" content="noindex">' : `<meta name="description" content="${esc(g.blurb)}">\n<link rel="canonical" href="https://detourr.net${url}">`}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#FFD23F">
${gtag ? gtag[0] : ''}
${fonts}
<link rel="stylesheet" href="/css/site.css">
</head><body class="gamepage">
<script>window.PAGE_GAME=${JSON.stringify(g.id)}</script>
`;
const seo = `<div class="seo">
<div class="wrap"><div class="top"><a class="pill" href="/">← All games</a></div><main class="card"><div class="body"><h1>${esc(g.name)}</h1><p>${esc(g.blurb)}</p></div></main></div>
</div>
`;
const scripts = `<!-- shared code (see /js/). Only the libraries this game needs are loaded. -->
<script src="/js/core.js"></script>
<script src="/js/catalog-lite.js"></script>
${libs.map(l => `<script src="/js/lib/${l}.js"></script>`).join('\n')}${libs.length ? '\n' : ''}<script>
/* ===================== ${g.name}: game code ===================== */
${code}
</script>
<script src="/js/app.js"></script>
</body></html>
`;
fs.mkdirSync(path.join(ROOT, 'games', slug), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'games', slug, 'index.html'), head + body + seo + scripts);

// catalog entry (replaces an existing one with the same id)
const catP = path.join(ROOT, 'js/catalog.js');
let cat = fs.readFileSync(catP, 'utf8');
const o = { id: g.id, name: g.name, kind: g.kind, tint: g.tint, blurb: g.blurb, art: g.art, url };
for (const k of ['levels', 'wide', 'big', 'major', 'lower', 'tags', 'noLb']) if (g[k] != null) o[k] = g[k];
let line = JSON.stringify(o);
if (g.fmt) line = line.slice(0, -1) + ',"fmt":' + String(g.fmt) + '}';
const re = new RegExp('^\\{"id":"' + g.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '".*$', 'm');
if (re.test(cat)) cat = cat.replace(re, line + (cat.match(re)[0].endsWith(',') ? ',' : ''));
else cat = cat.replace(/\n\);\s*$/, ',\n' + line + '\n);\n');
fs.writeFileSync(catP, cat);

// in-progress list
if (wip) {
  const appP = path.join(ROOT, 'js/app.js');
  let app = fs.readFileSync(appP, 'utf8');
  const m = app.match(/const WIP_IDS=\[([^\]]*)\]/);
  if (m && !m[1].includes("'" + g.id + "'")) app = app.replace(m[0], `const WIP_IDS=[${m[1]}, '${g.id}']`);
  fs.writeFileSync(appP, app);
}
require('./catalog-lite.cjs');
console.log('wrote', 'games/' + slug + '/index.html', '| catalog', g.id, wip ? '| in progress' : '');
