// aims at nearest jet/boss via debug hook, holds laser
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1100,height:700}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.addInitScript(m=>localStorage.setItem('unb_hs_villain_lv',m),process.argv[3]);
await p.goto('file://'+process.argv[2]+'?g=hs_villain#hs_villain');await p.waitForTimeout(2000);
const cl=async()=>{const bt=await p.$('.ov3 .btn.primary');if(bt){await bt.click();await p.waitForTimeout(300)}};await cl();await cl();
await p.keyboard.down('f');const t0=Date.now();while(Date.now()-t0<+process.argv[4]*1000){await p.evaluate(()=>window.__VAIM&&window.__VAIM());await p.waitForTimeout(100)}
await p.screenshot({path:'s/vl_aim.png'});console.log(await p.evaluate(()=>document.querySelector('.cx-cap').textContent+' | '+(document.querySelector('.ov3 h2')||{}).textContent),errs.join('\n')||'no errors');await b.close()})();
