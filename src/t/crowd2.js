const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1100,height:700}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=hs_havoc#hs_havoc');await p.waitForTimeout(2500);await (await p.$('.ov3 .btn.primary')).click();await p.waitForTimeout(2000);
console.log(await p.evaluate(()=>{const c=window.__HX.crowd;const a=c.ppl.slice(0,5).map(q=>[q.st,q.x|0,q.z|0,q.ax]);const b=c.cars.slice(0,5).map(q=>[q.dead,q.x|0,q.z|0,q.ty&&q.ty[0]]);const P=window.__HX.P.p;return JSON.stringify({a,b,P:[P.x|0,P.z|0]})}));
await p.keyboard.press('Space');await p.evaluate(()=>{const X=window.__HX;X.P.p.y=40;X.P.v.set(0,0,0)});for(let i=0;i<8;i++){await p.evaluate(()=>{const X=window.__HX;X.P.p.y=40;X.P.v.set(0,0,0);X.aimAt(X.P.p.x+30,0,X.P.p.z-30)});await p.waitForTimeout(150)}
await p.screenshot({path:__dirname+'/s/crowd_air.png'});console.log(errs.join('|')||'ok');await b.close()})();
