const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1100,height:700}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join('|')));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\.|google/,r=>r.abort());
const mi=+(process.argv[3]||0);
await p.goto('file://'+process.argv[2]+'?g=hs_kaiju#hs_kaiju');await p.waitForTimeout(3000);await p.screenshot({path:__dirname+'/s/kj_menu.png'});
if(mi>0)await p.evaluate(m=>localStorage.setItem('unb_hs_kaiju_lv',JSON.stringify(m)),mi);
await (await p.$('.ov3 .btn.primary')).click();await p.waitForTimeout(600);
if(mi>0){const bs=await p.$$('.ov3 .btn');for(const x of bs){const t=await x.textContent();if(/issue #/i.test(t)){}}}
await (await p.$('.ov3 .btn.primary')).click();await p.waitForTimeout(1500);
const st=()=>p.evaluate(()=>{const X=window.__HX;return {p:[X.P.p.x|0,X.P.p.y|0,X.P.p.z|0],hp:X.P.hp|0,en:X.KZ.en|0,blocks:X.stats.blocks,towers:X.stats.towers,enemies:X.enemies.filter(e=>!e.dead).map(e=>e.kind).join(','),vmi:X.vmi,dA:X.dA}});
console.log('start',JSON.stringify(await st()));await p.screenshot({path:__dirname+'/s/kj0.png'});
await p.keyboard.down('w');await p.waitForTimeout(4000);await p.keyboard.up('w');console.log('walk',JSON.stringify(await st()));await p.screenshot({path:__dirname+'/s/kj1.png'});
// teleport next to the tallest building and walk into it
await p.evaluate(()=>{const X=window.__HX;let best=null;X.blds.forEach(B=>{if(!best||B.fh>best.fh)best=B});const cx=(best.gx0+best.fx/2)*4,cz=(best.gz0+best.fz/2)*4;X.P.p.set(cx,0,cz+best.fz*2+14);X.cam.yaw=0;X.KZ.yaw=Math.PI;window.__tb=best});
await p.keyboard.down('w');await p.waitForTimeout(5000);await p.keyboard.up('w');await p.waitForTimeout(1500);console.log('wade',JSON.stringify(await st()));await p.screenshot({path:__dirname+'/s/kj2.png'});
for(let i=0;i<4;i++){await p.mouse.down();await p.waitForTimeout(120);await p.mouse.up();await p.waitForTimeout(400)}console.log('claws',JSON.stringify(await st()));await p.screenshot({path:__dirname+'/s/kj3.png'});
await p.keyboard.press('q');await p.waitForTimeout(400);await p.screenshot({path:__dirname+'/s/kj4.png'});await p.waitForTimeout(800);console.log('tail',JSON.stringify(await st()));
await p.keyboard.press(' ');await p.waitForTimeout(700);await p.screenshot({path:__dirname+'/s/kj5.png'});console.log('stomp',JSON.stringify(await st()));
await p.evaluate(()=>{window.__HX.KZ.en=100});await p.keyboard.down('r');await p.waitForTimeout(2200);await p.screenshot({path:__dirname+'/s/kj6.png'});await p.keyboard.up('r');console.log('breath',JSON.stringify(await st()));
await p.keyboard.press('e');await p.waitForTimeout(500);await p.screenshot({path:__dirname+'/s/kj7.png'});console.log('held',await p.evaluate(()=>window.__HX.KZ.held&&window.__HX.KZ.held.k));await p.keyboard.press('e');await p.waitForTimeout(1500);
await p.keyboard.press('f');await p.waitForTimeout(1000);await p.screenshot({path:__dirname+'/s/kj8.png'});
await p.evaluate(()=>{window.__HX.KZ.en=100});await p.keyboard.press('x');await p.waitForTimeout(1600);await p.screenshot({path:__dirname+'/s/kj9.png'});console.log('pulse',JSON.stringify(await st()));
await p.evaluate(()=>{window.__HX.heat=4.5});await p.waitForTimeout(14000);await p.screenshot({path:__dirname+'/s/kj10.png'});console.log('army',JSON.stringify(await st()));
const fps=await p.evaluate(()=>new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<2000)requestAnimationFrame(f);else r(n/2)};requestAnimationFrame(f)}));console.log('fps',fps);
console.log('errors',errs.slice(0,5).join('\n')||'none');await b.close()})();
