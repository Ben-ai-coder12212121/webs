// One-time splitter: turns the built single-page Detourr (index.html) into
// shared files + one page per game. Usage: node split.cjs <repoRoot> <outDir>
const fs = require('fs'), path = require('path');
const NM = '/opt/node22/lib/node_modules/eslint/node_modules/';
const espree = require(NM + 'espree'), escope = require(NM + 'eslint-scope');
const ROOT = process.argv[2], OUT = process.argv[3];
const SP = __dirname;
const html = fs.readFileSync(ROOT + '/index.html', 'utf8');
const H = ROOT + '/src/heroes/';

// ---------- locate main script ----------
const si = html.indexOf('<script>', html.indexOf('application/ld+json'));
const se = html.indexOf('</script>', si);
const src = html.slice(si + 8, se);
const ast = espree.parse(src, { ecmaVersion: 2022, range: true, sourceType: 'script' });
const iifeFn = ast.body[0].expression.callee;
const body = iifeFn.body.body;
const T = n => src.slice(n.range[0], n.range[1]);
const postIdx = body.findIndex(n => T(n).startsWith('const WIP_IDS'));
const gIdx = body.findIndex(n => T(n) === 'const G=[];');
if (postIdx < 0 || gIdx < 0) throw new Error('markers');

// ---------- injected source files (for naming shared libs) ----------
const bp = fs.readFileSync(H + 'build.py', 'utf8');
const files = bp.match(/for f in \[(.*?)\]/)[1].replace(/'/g, '').split(',');
const injStart = src.indexOf(fs.readFileSync(H + files[0], 'utf8').slice(0, 200));
const injEnd = src.indexOf('/* ================= END SUPERHEROES');
const fileStarts = [];
for (const f of files) {
  if (!fs.existsSync(H + f)) continue;
  let t = fs.readFileSync(H + f, 'utf8');
  if (f === 'geo.js' || f === 'geoguess.js') t = t.slice(0, 120);
  const probe = t.replace(/^\s+/, '').slice(0, 160);
  const at = src.indexOf(probe, injStart);
  if (at < 0) { console.warn('cannot locate', f); continue; }
  fileStarts.push([at, f.replace(/\.js$/, '')]);
}
fileStarts.sort((a, b) => a[0] - b[0]);
const srcFileOf = pos => {
  if (pos < injStart || pos >= injEnd) return null;
  let r = null; for (const [a, f] of fileStarts) if (a <= pos) r = f; return r;
};

// ---------- units ----------
const isPush = n => n.type === 'ExpressionStatement' && n.expression.type === 'CallExpression' &&
  n.expression.callee.type === 'MemberExpression' && n.expression.callee.object.name === 'G' &&
  n.expression.callee.property.name === 'push';
const units = body.map((n, i) => ({ i, n, text: T(n), region: i < postIdx ? 'games' : 'post', file: srcFileOf(n.range[0]), deps: new Set(), decl: [] }));
const starts = units.map(u => u.n.range[0]);
const unitAt = pos => { let lo = 0, hi = units.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (starts[m] <= pos) lo = m; else hi = m - 1; } return lo; };

const cat = require(SP + '/catalog.json');
const ids = new Set(cat.map(e => e.o.id));
const gameOf = new Map(); // unit idx -> [ids]
units.forEach(u => {
  if (u.region !== 'games') return;
  if (isPush(u.n)) {
    const got = u.n.expression.arguments.map(a => { const p = a.properties && a.properties.find(p => p.key && p.key.name === 'id'); return p && p.value.value; });
    gameOf.set(u.i, got);
  } else if (/G\.push\(/.test(u.text)) {
    const got = [...u.text.matchAll(/\['([a-z0-9_]+)','[^']*','/g)].map(m => 'e3_' + m[1]).filter(x => ids.has(x));
    gameOf.set(u.i, got); u.group = true;
  }
});

// ---------- scope analysis ----------
const sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: 'script' });
const fscope = sm.acquire(iifeFn);
for (const v of fscope.variables) {
  if (v.name === 'arguments') continue;
  const defUnits = [...new Set(v.defs.map(d => unitAt(d.name.range[0])))];
  defUnits.forEach(d => units[d].decl.push(v.name));
  for (const r of v.references) {
    const ru = unitAt(r.identifier.range[0]);
    defUnits.forEach(d => { if (d !== ru) units[ru].deps.add(d); });
  }
}

// ---------- placement ----------
const closure = start => { const seen = new Set(), st = [...start]; while (st.length) { const x = st.pop(); if (seen.has(x)) continue; seen.add(x); units[x].deps.forEach(d => st.push(d)); } return seen; };
const users = new Map(); units.forEach(u => users.set(u.i, new Set()));
const gameUnits = new Map(); // id -> unit idx (single-game pushes)
for (const [ui, gids] of gameOf) {
  if (units[ui].group || gids.length > 1) { gids.forEach(g => users.get(ui).add(g)); }
  else gameUnits.set(gids[0], ui);
  for (const d of closure(units[ui].deps)) gids.forEach(g => users.get(d).add(g));
}
const appNeeds = closure(units.filter(u => u.region === 'post').map(u => u.i));
const FORCE_CORE = new Set(['fmtT', 'fmtLap', 'fmtBig', 'G']);
const place = new Map(); // idx -> 'core' | 'lib:<file>' | 'game:<id>' | 'drop' | 'app'
units.forEach(u => {
  if (u.region === 'post') { place.set(u.i, 'app'); return; }
  if (gameOf.has(u.i) && !u.group && gameOf.get(u.i).length === 1) { place.set(u.i, 'game:' + gameOf.get(u.i)[0]); return; }
  const us = users.get(u.i);
  if (u.i <= gIdx || appNeeds.has(u.i) || u.decl.some(n => FORCE_CORE.has(n))) place.set(u.i, 'core');
  else if (!u.decl.length) place.set(u.i, 'root');
  else if (us.size === 1 && !u.group) place.set(u.i, 'game:' + [...us][0]);
  else if (us.size === 0) place.set(u.i, u.file ? 'lib:' + u.file : 'core');
  else place.set(u.i, u.file ? 'lib:' + u.file : 'core');
});
// roots (side-effect statements): metadata patches are baked into the catalog, the rest follow their latest dependency
units.forEach(u => {
  if (place.get(u.i) !== 'root') return;
  const t = u.text;
  if (/Object\.assign\(G\[gi\]/.test(t) || /g\.tags=\['weird'\]/.test(t) || /jb\.kind='shooter'/.test(t)) { place.set(u.i, 'drop'); return; }
  const ds = [...u.deps].filter(d => d !== gIdx);
  if (!ds.length) { place.set(u.i, 'core'); return; }
  place.set(u.i, place.get(Math.max(...ds)));
});
// the const jb=G.find(...) helper for the dropped kind patch
units.forEach(u => { if (/^const jb=G\.find/.test(u.text)) place.set(u.i, 'drop'); });
// fix-point: anything core/lib depends on must be core or a lib
let changed = true;
while (changed) {
  changed = false;
  units.forEach(u => {
    const p = place.get(u.i);
    if (p === 'core' || p === 'app') u.deps.forEach(d => { const q = place.get(d); if (q !== 'core' && q !== 'app' && q !== 'drop') { place.set(d, 'core'); changed = true; } });
    if (p && p.startsWith('lib:')) u.deps.forEach(d => { const q = place.get(d); if (q.startsWith('game:')) { place.set(d, p); changed = true; } });
    if (p && p.startsWith('game:')) u.deps.forEach(d => { const q = place.get(d); if (q.startsWith('game:') && q !== p) { const f = units[d].file; place.set(d, f ? 'lib:' + f : 'core'); changed = true; } });
  });
}

// ---------- per-game page code ----------
const libs = new Map(); // file -> [unit idx]
const core = [], app = [];
units.forEach(u => {
  const p = place.get(u.i);
  if (p === 'core') core.push(u.i);
  else if (p === 'app') app.push(u.i);
  else if (p.startsWith('lib:')) { const f = p.slice(4); if (!libs.has(f)) libs.set(f, []); libs.get(f).push(u.i); }
});
const libOf = i => { const p = place.get(i); return p.startsWith('lib:') ? p.slice(4) : null; };
const libDeps = new Map();
for (const [f, us] of libs) { const s = new Set(); us.forEach(i => units[i].deps.forEach(d => { const l = libOf(d); if (l && l !== f) s.add(l); })); libDeps.set(f, s); }
const libOrder = [...libs.keys()].sort((a, b) => libs.get(a)[0] - libs.get(b)[0]);
const pageFor = new Map();
for (const e of cat) {
  const id = e.o.id;
  const own = units.filter(u => place.get(u.i) === 'game:' + id).map(u => u.i);
  const need = new Set();
  const add = f => { if (need.has(f)) return; need.add(f); libDeps.get(f).forEach(add); };
  own.forEach(i => units[i].deps.forEach(d => { const l = libOf(d); if (l) add(l); }));
  for (const [ui, gids] of gameOf) if (gids.includes(id) && libOf(ui)) add(libOf(ui));
  pageFor.set(id, { own, libs: libOrder.filter(f => need.has(f)) });
}

// ---------- targeted edits so the code works when split ----------
const R = (s, a, b) => { if (!s.includes(a)) throw new Error('edit anchor missing: ' + a.slice(0, 60)); return s.replace(a, b); };
let coreJs = core.map(i => units[i].text).join('\n');
coreJs = R(coreJs, 'const G=[];', "const G=[];\n/* games load after the catalog: a game's full definition replaces its catalog entry, keeping the catalog's listing details */\nG.push=function(...a){for(const g of a){const i=this.findIndex(x=>x.id===g.id);if(i>=0){const c=this[i];for(const k in c)if(k!=='fmt'||!g.fmt)g[k]=c[k];this[i]=g}else Array.prototype.push.call(this,g)}return this.length};");
coreJs = R(coreJs, "[$('#mute'),$('#muteHome')].forEach(", "[$('#mute'),$('#muteHome')].filter(Boolean).forEach(");
coreJs = R(coreJs, "$('#muteHome').textContent=t", "{const m=$('#muteHome');if(m)m.textContent=t}");
let appJs = app.map(i => units[i].text).join('\n');
appJs = R(appJs, 'const WIP_IDS=', 'const ALLG=G.slice();const PAGE=window.PAGE_GAME||null;const gameUrl=g=>(g.url||("/games/"+g.id+"/"));\nconst WIP_IDS=');
appJs = R(appJs, 'function openGame(g){', 'function openGame(g){if(g.id!==PAGE){location.href=gameUrl(g);return}');
appJs = R(appJs, 'function closeGame(){', "function closeGame(){if(PAGE){location.href='/';return}");
appJs = R(appJs, 'function renderGrid(){', 'function renderGrid(){if(PAGE)return;');
appJs = R(appJs, "const h=(location.hash||'').slice(1);\nconst start=G.find(g=>g.id===h)||WIP.find(g=>g.id===h);\nif(start)openGame(start);",
  "/* each game has its own page; old /#id links from before the split are sent there */\nif(PAGE){const g=ALLG.find(x=>x.id===PAGE);if(g)openGame(g)}else{const h=(location.hash||'').slice(1);const old=h&&ALLG.find(g=>g.id===h);if(old)location.replace(gameUrl(old))}");
appJs = R(appJs, "try{history.replaceState(null,'','#'+g.id)}catch(e){}", '');
appJs = R(appJs, "const TOP=['hs_kaiju','zsurv','stillshot','gunsim','hs_villain','hs_havoc','ph_buddy'];", "const TOP=['hs_villain','hs_havoc','ph_buddy','hs_kaiju','zsurv','stillshot','gunsim'];");
appJs = R(appJs, "if(old)location.replace(gameUrl(old))}", "if(old)location.replace(gameUrl(old));addEventListener('hashchange',()=>{const g=ALLG.find(x=>x.id===location.hash.slice(1));if(g)location.replace(gameUrl(g))})}");
// tiles are real links now
const tileN = (appJs.match(/t\.addEventListener\('click',\(\)=>openGame\(g\)\);/g) || []).length;
appJs = appJs.replace(/t\.addEventListener\('click',\(\)=>openGame\(g\)\);/g, '');
appJs = R(appJs, "el('button',{class:isTop(g)?'tile top':'tile',type:'button'}", "el('a',{class:isTop(g)?'tile top':'tile',href:gameUrl(g)}");
appJs = R(appJs, "el('button',{class:'tile qtile',type:'button'}", "el('a',{class:'tile qtile',href:gameUrl(g)}");
appJs = R(appJs, "el('button',{class:'tile',type:'button'}", "el('a',{class:'tile',href:gameUrl(g)}");

// ---------- write shared files ----------
const w = (p, s) => { fs.mkdirSync(path.dirname(OUT + '/' + p), { recursive: true }); fs.writeFileSync(OUT + '/' + p, s); };
const HEAD = '/* Detourr shared code. Loaded by the homepage and every game page, in this order:\n   core.js, catalog.js, lib/*.js (only the ones a game needs), the game\'s own code, app.js. */\n';
w('js/core.js', HEAD + '/* core.js: helpers every game can use (el, S, beep, sound, 3D engine, shared game helpers) */\n' + coreJs + '\n');
w('js/app.js', '/* app.js: the game player (top bar, levels, leaderboards, full screen, random button) and the homepage grid */\n' + appJs + '\n');
for (const [f, us] of libs) w('js/lib/' + f + '.js', `/* lib/${f}.js: code shared by several games (from src/heroes/${f}.js) */\n` + us.map(i => units[i].text).join('\n') + '\n');

// catalog
const slug = n => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const HIDDEN = new Set(['rps', 'monsterrush', 'skyrace', 'pebble', 'torchmaze', 'jelloreversi', 'ancient']);
const WIP_IDS = ['neonharbor', 'hollow', 'contract', 'moonblade', 'ironpalm', 'spellbound'];
const isHidden = e => e.o.kind === 'shooter' || HIDDEN.has(e.o.id) || e.o.id === 'jailbreak';
const urlOf = e => '/games/' + (isHidden(e) ? '_hidden/' : '') + slug(e.o.name) + '/';
const catLines = cat.map(e => {
  const o = { ...e.o, url: urlOf(e) };
  if (e.o.id === 'jailbreak') o.kind = 'shooter';
  let s = JSON.stringify(o);
  if (e.fns.fmt) s = s.slice(0, -1) + ',"fmt":' + e.fns.fmt + '}';
  return s;
});
w('js/catalog.js', '/* catalog.js: every game\'s listing details (name, blurb, card art, section, score format, page url).\n   The homepage is built from this list, and it also feeds the random button. Order = order within each homepage section. */\nG.push(\n' + catLines.join(',\n') + '\n);\n');

// css
const css1 = html.match(/<meta name=viewport[^>]*><style>([\s\S]*?)<\/style>/)[1];
const bodyStart = html.indexOf('<body>') + 6;
const css2m = html.slice(bodyStart).match(/<style>([\s\S]*?)<\/style>/);
const css2 = css2m[1];
w('css/site.css', css1 + '\n' + css2 + '\na.tile{text-decoration:none;color:inherit;text-align:left;font:inherit}\n' + '/* game pages: the description section under each game (search engines read it; the game covers it while playing) */\n' + ".seo{--ink:#1D1A2F;--sun:#FFD23F;--paper:#FFFDF6;--red:#F2352A;background:var(--sun);color:var(--ink);font:600 17px/1.5 Figtree,system-ui,sans-serif;min-height:100vh}\n.seo *{box-sizing:border-box}.seo a{color:inherit}.seo .wrap{max-width:880px;margin:0 auto;padding:18px 16px 40px}\n.seo .top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:18px}\n.seo .brand{display:flex;align-items:center;gap:8px;text-decoration:none;font:900 28px/1 'Arial Black','Helvetica Neue',Arial,sans-serif;letter-spacing:-.06em;color:#161616}.seo .brand svg{width:40px;height:40px}\n.seo .pill{background:var(--paper);border:3px solid var(--ink);border-radius:99px;padding:6px 14px;box-shadow:3px 3px 0 var(--ink);text-decoration:none;font-weight:800}\n.seo .card{background:var(--paper);border:3px solid var(--ink);border-radius:18px;box-shadow:6px 6px 0 var(--ink);overflow:hidden}\n.seo .hero{display:block;aspect-ratio:120/72;max-height:340px;width:100%;border-bottom:3px solid var(--ink)}.seo .hero svg{width:100%;height:100%;display:block}\n.seo .body{padding:18px 22px 24px}.seo h1{font:400 44px/1.05 'Bagel Fat One',system-ui;margin:4px 0 8px}\n.seo .chip{display:inline-block;background:var(--sun);border:2px solid var(--ink);border-radius:99px;padding:2px 10px;font-size:13px;font-weight:800}\n.seo .play{display:inline-block;margin:14px 0 6px;background:var(--red);color:#fff;border:3px solid var(--ink);border-radius:14px;padding:12px 26px;font:900 22px Figtree,system-ui;text-decoration:none;box-shadow:4px 4px 0 var(--ink)}\n.seo ul.f{padding-left:20px;margin:10px 0}.seo h2{font:400 26px 'Bagel Fat One',system-ui;margin:28px 0 10px}\n.seo .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}\n.seo .rg{display:block;background:var(--paper);border:3px solid var(--ink);border-radius:12px;overflow:hidden;text-decoration:none;box-shadow:3px 3px 0 var(--ink)}\n.seo .rg .ra{display:block;aspect-ratio:120/72;border-bottom:2px solid var(--ink)}.seo .rg svg{width:100%;height:100%;display:block}.seo .rg b{display:block;padding:6px 8px;font-size:14px}\n.seo footer{margin-top:30px;font-size:14px}\n");

// homepage
const bodyRest = html.slice(bodyStart, si).replace(css2m[0], '');
const headPart = html.slice(0, bodyStart).replace(/<style>[\s\S]*?<\/style><\/head><body>$/, '<link rel="stylesheet" href="/css/site.css"></head><body>');
const scripts = '<script src="/js/core.js"></script>\n<script src="/js/catalog.js"></script>\n<script src="/js/app.js"></script>\n';
const tail = html.slice(se + 9);
w('index.html', headPart + bodyRest + scripts + tail);

// stage markup shared by game pages
const stageHtml = html.match(/<div id="stage" hidden>[\s\S]*?<div class="arena" id="arena"><\/div>\s*<\/div>/)[0].replace('<div id="stage" hidden>', '<div id="stage">');
const STUB = '<div hidden aria-hidden="true"><div id="grid"></div><button id="bigBtn"></button><input id="search"><span id="count"></span><button id="muteHome"></button><div id="rndPlate"></div><div id="about"><button id="aboutClose"></button></div><button id="aboutBtn"></button><button id="imgCredits"></button><div id="imgList"></div></div>';
const headScript = html.match(/<!-- Google tag[\s\S]*?<\/script>\s*<script>[\s\S]*?<\/script>/)[0];
fs.writeFileSync(SP + '/split-meta.json', JSON.stringify({ stageHtml, STUB, headScript, pages: [...pageFor].map(([id, p]) => ({ id, libs: p.libs, code: p.own.map(i => units[i].text).join('\n') })) }));

// ---------- report ----------
const sz = a => a.reduce((s, i) => s + units[i].text.length, 0);
console.log('core', sz(core), 'app', sz(app), 'libs', [...libs].map(([f, u]) => f + ':' + sz(u)).join(' '));
console.log('dropped', units.filter(u => place.get(u.i) === 'drop').map(u => u.text.slice(0, 50)));
console.log('tile listeners removed', tileN);
const noCode = cat.filter(e => !pageFor.get(e.o.id).own.length && !pageFor.get(e.o.id).libs.length).map(e => e.o.id);
console.log('games without own code', noCode);
