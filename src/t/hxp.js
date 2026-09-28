const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1100,height:700}});
await p.addInitScript(()=>{try{localStorage.setItem('unb_hx_hq','false')}catch(e){}});
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=hs_havoc#hs_havoc');await p.waitForTimeout(2500);await (await p.$('.ov3 .btn.primary')).click();await p.waitForTimeout(3000);
console.log(JSON.stringify(await p.evaluate(()=>window.__HX.rinfo())),'render ms',await p.evaluate(()=>window.__HX.prof()));
await p.goto('file://'+process.argv[2]+'?g=hs_villain#hs_villain');await p.waitForTimeout(2500);const all=await p.$$('.ov3 .btn');await all[all.length-1].click();await p.waitForTimeout(300);const v=await p.$('.ov3 [data-v="0"]');if(v)await v.click();await p.waitForTimeout(2000);
const fps=await p.evaluate(()=>new Promise(r=>{let n=0;const t=performance.now();function f(){n++;if(performance.now()-t<2000)requestAnimationFrame(f);else r(n/2)}requestAnimationFrame(f)}));console.log('overlord fps',fps);await b.close()})();
