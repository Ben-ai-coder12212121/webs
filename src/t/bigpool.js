const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage();
await p.route(/fonts\.|google|cdnjs/,r=>r.abort());await p.route('https://detour.test/**',r=>r.fulfill({body:fs.readFileSync(__dirname+'/../srv/test.html'),contentType:'text/html'}));await p.addInitScript(()=>{window.__GS_TEST=1});
await p.goto('https://detour.test/');await p.waitForTimeout(1000);
console.log(await p.evaluate(()=>{const G=window.__G;const isBig=g=>g.big!=null?g.big:(g.kind==='hero'||g.kind==='shooter'||/with3D|runShooter/.test(String(g.run)));return G.filter(g=>isBig(g)&&!['toy','chill','info'].includes(g.kind)).map(g=>g.id+'('+g.kind+')').join(' ')}));await b.close()})();
