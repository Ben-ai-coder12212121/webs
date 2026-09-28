const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1000,height:640}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=hs_flight#hs_flight');await p.waitForTimeout(2500);const all=await p.$$('.ov3 .btn');await all[all.length-1].click();await p.waitForTimeout(400);
await p.evaluate(()=>{const P=window.__RP();P.p.set(60,160,60)});await p.waitForTimeout(300);
await p.evaluate(()=>{const P=window.__RP();P.p.set(60,160,60)});await p.mouse.move(500,320);
for(let i=0;i<10;i++){await p.evaluate(()=>{const P=window.__RP();P.p.set(60,160,60);P.v.set(0,0,0)});await p.waitForTimeout(100)}
await p.screenshot({path:__dirname+'/s/aerial.png'});console.log(errs.join('|')||'ok');await b.close()})();
