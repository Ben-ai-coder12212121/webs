const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/*',r=>{const u=r.request().url();if(u.startsWith('http://x.test/'))return r.fulfill({body:fs.readFileSync('cat/index.html'),contentType:'text/html'});r.fulfill({body:'',status:200})});
await p.goto('http://x.test/');await p.waitForTimeout(500);
const out=await p.evaluate(()=>window.__ALLG.map(g=>{const o={};const fns={};for(const k in g){if(k==='run')continue;const v=g[k];if(typeof v==='function')fns[k]=String(v);else o[k]=v}o.big=g.big!=null?g.big:(g.kind==='hero'||g.kind==='shooter'||/with3D|runShooter/.test(String(g.run)));return {o,fns}}));
fs.writeFileSync('catalog.json',JSON.stringify(out));console.log(out.length,errs);
const fk={},ok={};out.forEach(e=>{Object.keys(e.fns).forEach(k=>fk[k]=(fk[k]||0)+1);Object.keys(e.o).forEach(k=>ok[k]=(ok[k]||0)+1)});console.log(fk,ok);await b.close()})();
