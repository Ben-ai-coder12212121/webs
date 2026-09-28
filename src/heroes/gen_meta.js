// Extracts game metadata from a test build (needs window.__G / __KIND hooks) into JSON.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage();await p.route(/fonts\.|google|cdn/,r=>r.abort());
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(700);
const d=await p.evaluate(()=>({kinds:window.__KIND,games:window.__G.map(g=>({id:g.id,name:g.name,kind:g.kind,blurb:g.blurb||'',art:g.art||'',tint:g.tint||'#FFD23F',levels:!!g.levels,scored:!!g.fmt}))}));
fs.writeFileSync(process.argv[3],JSON.stringify(d));console.log('games',d.games.length);await b.close()})();
