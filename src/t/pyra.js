const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1000,height:640}});
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=hs_villain#hs_villain');await p.waitForTimeout(2500);const all=await p.$$('.ov3 .btn');await all[all.length-1].click();await p.waitForTimeout(300);
await (await p.$('.ov3 [data-v="4"]')).click();await p.waitForTimeout(400);const pr=await p.$('.ov3 .btn.primary');if(pr){await pr.click();await p.waitForTimeout(400)}
await p.evaluate(()=>{const V=window.__VV;V.aimAt(V.P.p.x,10,V.P.p.z-80)});await p.keyboard.down('f');await p.waitForTimeout(1500);await p.screenshot({path:__dirname+'/s/pyra.png'});await b.close()})();
