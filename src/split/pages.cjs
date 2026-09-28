// Builds games/<slug>/index.html for every game from split-meta.json + the old SEO pages.
// Usage: node pages.cjs <oldRepoRoot> <outDir>
const fs = require('fs'), path = require('path');
const OLD = process.argv[2], OUT = process.argv[3], SP = __dirname;
const M = require(SP + '/split-meta.json');
const cat = require(SP + '/catalog.json');
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bagel+Fat+One&family=Figtree:wght@400;600;800&family=JetBrains+Mono:wght@500;700&family=Overpass:wght@800;900&display=swap">';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SITE = 'https://detourr.net';
const byId = new Map(M.pages.map(p => [p.id, p]));
const w = (p, s) => { fs.mkdirSync(path.dirname(OUT + '/' + p), { recursive: true }); fs.writeFileSync(OUT + '/' + p, s); };
const report = [];
for (const e of cat) {
  const g = e.o, pg = byId.get(g.id);
  const hidden = g.kind === 'shooter' || ['rps', 'monsterrush', 'skyrace', 'pebble', 'torchmaze', 'jelloreversi', 'ancient', 'jailbreak'].includes(g.id);
  const slug = g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const rel = 'games/' + (hidden ? '_hidden/' : '') + slug + '/index.html';
  const url = '/games/' + (hidden ? '_hidden/' : '') + slug + '/';
  const oldPath = OLD + '/games/' + slug + '/index.html';
  let head, seo;
  if (!hidden && fs.existsSync(oldPath)) {
    const o = fs.readFileSync(oldPath, 'utf8');
    head = o.slice(o.indexOf('<meta charset'), o.indexOf('<style>'))
      .replace(/<link rel="preconnect"[^>]*>/g, '').replace(/<link rel="stylesheet" href="https:\/\/fonts[^>]*>/, '').replace(/\n+/g, '\n').trim();
    seo = o.slice(o.indexOf('<body>') + 6, o.lastIndexOf('</body>')).trim();
    seo = seo.split('href="/#' + g.id + '"').join('href="' + url + '"');
  } else {
    // in-progress and hidden games had no public page: keep them out of search results
    head = `<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${esc(g.name)} | Detourr</title>\n<meta name="robots" content="noindex">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<meta name="theme-color" content="#FFD23F">\n` + M.headScript;
    seo = `<div class="wrap"><div class="top"><a class="pill" href="/">← All games</a></div><main class="card"><div class="body"><h1>${esc(g.name)}</h1><p>${esc(g.blurb || '')}</p></div></main></div>`;
  }
  head = head.split('https://detourr.netlify.app').join(SITE);
  const code = pg ? pg.code : '';
  const libs = pg ? pg.libs : [];
  const page = `<!doctype html><html lang="en"><head>${head}
${FONTS}
<link rel="stylesheet" href="/css/site.css">
</head><body class="gamepage">
<script>window.PAGE_GAME=${JSON.stringify(g.id)}</script>
${M.stageHtml}
${M.STUB}
<div class="seo">
${seo}
</div>
<!-- shared code (see /js/). Only the libraries this game needs are loaded. -->
<script src="/js/core.js"></script>
<script src="/js/catalog.js"></script>
${libs.map(l => `<script src="/js/lib/${l}.js"></script>`).join('\n')}${libs.length ? '\n' : ''}<script>
/* ===================== ${g.name}: game code ===================== */
${code}
</script>
<script src="/js/app.js"></script>
</body></html>
`;
  w(rel, page);
  report.push([g.id, url, libs.join(' '), code.length]);
}
fs.writeFileSync(SP + '/pages-report.json', JSON.stringify(report));
console.log('pages', report.length);
