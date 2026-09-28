const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1100,height:700}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=hs_havoc#hs_havoc');await p.waitForTimeout(2500);await (await p.$('.ov3 .btn.primary')).click();await p.waitForTimeout(1500);
await p.evaluate(()=>{const X=window.__HX;let best=null;X.blds.forEach(B=>{if(!best||B.fh>best.fh)best=B});X.best=best;const cx=(best.gx0+best.fx/2)*4,cz=(best.gz0+best.fz/2)*4;X.P.p.set(cx+45,14,cz+30);X.P.v.set(0,0,0);X.P.ground=false});
await p.keyboard.press('Space');
for(let i=0;i<14;i++){await p.evaluate(i=>{const X=window.__HX,B=X.best;X.P.p.y=Math.max(X.P.p.y,14);X.P.v.set(0,0,0);X.aimAt((B.gx0+B.fx/2)*4,4+i,(B.gz0+B.fz/2)*4)},i);if(i==0)await p.keyboard.down('f');await p.waitForTimeout(250)}
console.log(await p.evaluate(()=>{const X=window.__HX;return JSON.stringify({v:X.beams.map(b=>b.o.visible),s:X.beams[0].o.scale.toArray().map(v=>+v.toFixed(2)),pos:X.beams[0].o.position.toArray().map(v=>+v.toFixed(1)),hit:X.lzHit.position.toArray().map(v=>+v.toFixed(1)),P:X.P.p.toArray().map(v=>+v.toFixed(1)),wi:X.P.wi})}));
await p.screenshot({path:__dirname+'/s/lz_3.png'});await p.keyboard.up('f');console.log(errs.join('|')||'ok');await b.close()})();
