// Opens every game page on a local server and reports script errors.
// Usage (from the repo root, with `npx http-server . -p 8766 -s` running):
//   PW=/path/to/playwright node tools/test-games.cjs [http://localhost:8766] [gameId ...]
// Prints ALL CLEAN when every game opened without errors.
const { chromium } = require(process.env.PW || 'playwright');
const fs = require('fs'), path = require('path');
const BASE = (process.argv[2] || 'http://localhost:8766').replace(/\/$/, '');
const only = new Set(process.argv.slice(3));
const ROOT = process.env.SITE || path.join(__dirname, '..');
// every game page's id and url, read from the catalog
const src = fs.readFileSync(path.join(ROOT, 'js/catalog.js'), 'utf8');
const games = [...src.matchAll(/^\{"id":"([^"]+)","[\s\S]*?"url":"([^"]+)"/gm)].map(m => ({ id: m[1], url: m[2] })).filter(g => !only.size || only.has(g.id));
const NM = process.env.NM || path.join(ROOT, 'src/t/node_modules/');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
  const bad = []; let cur = '';
  p.on('pageerror', e => bad.push(cur + ': ' + e.message));
  // serve the big libraries locally when they're installed (faster, works offline)
  const local = (pat, file) => fs.existsSync(NM + file) && p.route(pat, r => r.fulfill({ body: fs.readFileSync(NM + file), contentType: 'application/javascript' }));
  await local('**/three.min.js', 'three/build/three.min.js');
  await local('**/matter.min.js', 'matter-js/build/matter.min.js');
  await p.route(/fonts\.g|wikimedia|googletagmanager/, r => r.abort());
  for (const g of games) {
    cur = g.id;
    await p.goto(BASE + g.url);
    await p.waitForTimeout(1600);
    const t = await p.$eval('#stTitle', e => e.textContent).catch(() => '?');
    if (t === 'Game' || t === '?') bad.push(g.id + ': did not open');
    const et = await p.$eval('#arena', e => e.innerText).catch(() => '');
    if (/hit an error/.test(et)) bad.push(g.id + ': ' + et.slice(0, 120));
    if (!(await p.$eval('#arena', e => e.children.length).catch(() => 0))) bad.push(g.id + ': empty game area');
    const bt = await p.$('.ov3 .btn.primary');
    if (bt) { await bt.click().catch(() => {}); await p.waitForTimeout(300); const b2 = await p.$('.ov3 .btn.primary'); if (b2) await b2.click().catch(() => {}); await p.waitForTimeout(700); }
  }
  console.log('tested', games.length);
  console.log(bad.join('\n') || 'ALL CLEAN');
  await b.close();
})();
