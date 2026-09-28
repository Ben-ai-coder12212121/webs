const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:760,height:560}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join('|')));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\.|google/,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=hs_kaiju#hs_kaiju');await p.waitForTimeout(2500);
await p.evaluate(()=>localStorage.setItem('unb_hs_kaiju_lv','3'));await p.reload();await p.waitForTimeout(2500);
await (await p.$('.ov3 .btn.primary')).click();await p.waitForTimeout(600);console.log(await p.$eval('.ov3 h2',e=>e.textContent));await (await p.$('.ov3 .btn.primary')).click();await p.waitForTimeout(1000);await p.keyboard.press('g');
const st=()=>p.evaluate(()=>{const X=window.__HX;const m=X.enemies.find(e=>e.kind==='mecha');return {p:[X.P.p.x|0,X.P.p.z|0],hp:X.P.hp|0,m:m?[m.st,Math.round(m.hp),Math.round(Math.hypot(m.p.x-X.P.p.x,m.p.z-X.P.p.z)),Math.round(m.fy),m.dead?'DEAD':'',m.stag>0?'stag':''].join(':'):'none',held:X.KZ.held&&X.KZ.held.k,t:X.KZ.t.toFixed(1),vmi:X.vmi}});
// grab test: put a car right in front
console.log('grab?',await p.evaluate(()=>{const X=window.__HX;let best=null;X.blds.forEach(B=>{if(B.fh>8&&(!best||Math.hypot(B.gx0*4,B.gz0*4)<Math.hypot(best.gx0*4,best.gz0*4)))best=B});X.P.p.set((best.gx0+best.fx/2)*4,0,(best.gz0+best.fz)*4+12);X.KZ.yaw=Math.PI;X.cam.yaw=0;return best.fh}));await p.waitForTimeout(800);await p.keyboard.press('e');await p.waitForTimeout(800);console.log('held',JSON.stringify(await st()));
await p.waitForTimeout(8000);console.log('drop',JSON.stringify(await st()));await p.screenshot({path:__dirname+'/s/kc1.png'});
await p.evaluate(()=>{const X=window.__HX;const m=X.enemies.find(e=>e.kind==='mecha');if(m){m.p.x=X.P.p.x;m.p.z=X.P.p.z-24;}});await p.waitForTimeout(1500);await p.evaluate(()=>{window.__HX.cam.yaw=1.3});await p.waitForTimeout(1500);await p.screenshot({path:__dirname+'/s/kc2.png'});await p.evaluate(()=>{window.__HX.cam.yaw=0});
for(let i=0;i<8;i++){await p.evaluate(()=>{const X=window.__HX;const m=X.enemies.find(e=>e.kind==='mecha');X.aimAt(m.p.x,m.p.y,m.p.z)});await p.mouse.down();await p.waitForTimeout(150);await p.mouse.up();await p.waitForTimeout(900)}
console.log('claws',JSON.stringify(await st()));await p.screenshot({path:__dirname+'/s/kc3.png'});
await p.keyboard.press('q');await p.waitForTimeout(3000);console.log('tail',JSON.stringify(await st()));await p.screenshot({path:__dirname+'/s/kc4.png'});
await p.keyboard.down('r');await p.waitForTimeout(6000);await p.screenshot({path:__dirname+'/s/kc5.png'});await p.keyboard.up('r');console.log('breath',JSON.stringify(await st()));
await p.evaluate(()=>{const m=window.__HX.enemies.find(e=>e.kind==='mecha');m.hp=30});await p.keyboard.press(' ');await p.waitForTimeout(3000);await p.screenshot({path:__dirname+'/s/kc6.png'});await p.waitForTimeout(9000);await p.screenshot({path:__dirname+'/s/kc7.png'});console.log('end',JSON.stringify(await st()));
await p.waitForTimeout(6000);console.log('overlay',await p.evaluate(()=>{const o=document.querySelector('.ov3 h2');return o&&o.textContent}));
console.log('errors',errs.slice(0,5).join('\n')||'none');await b.close()})();
