const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:900,height:620}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\.|google/,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=hs_kaiju#hs_kaiju');await p.waitForTimeout(2000);await p.evaluate(()=>localStorage.setItem('unb_hs_kaiju_lv','3'));await p.reload();await p.waitForTimeout(2500);
await (await p.$('.ov3 .btn.primary')).click();await p.waitForTimeout(500);await (await p.$('.ov3 .btn.primary')).click();await p.waitForFunction(()=>window.__HX.enemies.some(e=>e.kind==='mecha'),null,{timeout:120000});
await p.evaluate(()=>{const X=window.__HX;X.P.p.set(-10,0,210);const m=X.enemies.find(e=>e.kind==='mecha');m.fy=0;m.st='walk';m.p.x=-10;m.p.z=240;m.stun=1000;X.heat=0;X.enemies.forEach(e=>{if(e.kind!=='mecha')e.hp=0});X.cam.yaw=Math.PI/2;X.cam.pitch=.05});
await p.waitForTimeout(5000);await p.screenshot({path:__dirname+'/s/kd1.png'});
await p.evaluate(()=>{const X=window.__HX;X.cam.yaw=Math.PI*1.1;X.cam.pitch=-.2});await p.waitForTimeout(3000);await p.screenshot({path:__dirname+'/s/kd2.png'});
console.log(errs.join('\n')||'ok');await b.close()})();
