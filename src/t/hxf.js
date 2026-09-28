const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:900,height:600}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=hs_havoc#hs_havoc');await p.waitForTimeout(2500);await (await p.$('.ov3 .btn.primary')).click();await p.waitForTimeout(1500);
await p.keyboard.down(' ');await p.waitForTimeout(2500);await p.keyboard.up(' ');const y1=await p.evaluate(()=>window.__HX.P.p.y);await p.waitForTimeout(3000);const y2=await p.evaluate(()=>window.__HX.P.p.y);console.log('alt after up',y1.toFixed(1),'after hover 3s',y2.toFixed(1));
await p.keyboard.down('w');await p.waitForTimeout(2000);await p.keyboard.up('w');await p.screenshot({path:__dirname+'/s/hxf1.png'});
await p.evaluate(()=>{window.__HX.heat=4.2});await p.waitForTimeout(16000);await p.screenshot({path:__dirname+'/s/hxf2.png'});
const st=await p.evaluate(()=>({en:window.__HX.enemies.map(e=>e.kind).join(','),styles:[...new Set(window.__HX.blds.map(B=>B.style))].join(',')}));console.log(JSON.stringify(st),errs.slice(0,4).join('||')||'ok');await b.close()})();
