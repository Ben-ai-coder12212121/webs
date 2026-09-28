const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:900,height:600}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=hs_havoc#hs_havoc');await p.waitForTimeout(2500);await (await p.$('.ov3 .btn.primary')).click();await p.waitForTimeout(1500);
// find tallest building, stand 40m away from it on a street, aim at base
const info=await p.evaluate(()=>{const X=window.__HX;let best=null;X.blds.forEach(B=>{if(!best||B.fh>best.fh)best=B});const cx=(best.gx0+best.fx/2)*4,cz=(best.gz0+best.fz/2)*4;const kx=Math.round((cx+168)/48);const lx=-168+kx*48;X.P.p.set(lx,0,cz+2);X.best=best;return{fh:best.fh,cx,cz,lx}});console.log(JSON.stringify(info));
await p.keyboard.press('2');await p.waitForTimeout(300);
for(let i=0;i<30;i++){await p.evaluate(()=>{const X=window.__HX,B=X.best;X.aimAt((B.gx0+B.fx/2)*4,3,(B.gz0+B.fz/2)*4)});await p.keyboard.down('f');await p.waitForTimeout(90);await p.keyboard.up('f');await p.waitForTimeout(650);const st=await p.evaluate(()=>window.__HX.stats.towers);if(st>0){console.log('collapsed after',i+1,'rockets');break}}
await p.evaluate(()=>{const X=window.__HX,B=X.best;X.aimAt((B.gx0+B.fx/2)*4,B.fh*2,(B.gz0+B.fz/2)*4)});
for(const t of [300,900,1800]){await p.waitForTimeout(t===300?300:600);await p.screenshot({path:__dirname+'/s/hxc_'+t+'.png'})}
await p.evaluate(()=>{window.__HX.P.p.y=60});await p.waitForTimeout(400);await p.evaluate(()=>{const X=window.__HX,B=X.best;X.aimAt((B.gx0+B.fx/2)*4,0,(B.gz0+B.fz/2)*4)});await p.waitForTimeout(3000);await p.screenshot({path:__dirname+'/s/hxc_after.png'});
console.log(JSON.stringify(await p.evaluate(()=>({P:[window.__HX.P.p.x|0,window.__HX.P.p.y|0,window.__HX.P.p.z|0],booms:(window.__booms||[]).slice(0,8)}))));console.log(JSON.stringify(await p.evaluate(()=>({s:window.__HX.stats,heat:window.__HX.heat}))),errs.join('|')||'ok');await b.close()})();
