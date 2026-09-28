const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1100,height:700}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
const g=process.argv[3]||'hs_havoc';
await p.goto('file://'+process.argv[2]+'?g='+g+'#'+g);await p.waitForTimeout(2500);
const fps=async()=>p.evaluate(()=>new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<3000)requestAnimationFrame(f);else r((n/3).toFixed(1))};requestAnimationFrame(f)}));
console.log('menu fps',await fps());
if(g==='hs_havoc'){await (await p.$('.ov3 .btn.primary')).click();}else{const all=await p.$$('.ov3 .btn');await all[all.length-1].click();await p.waitForTimeout(300);await (await p.$('.ov3 [data-v="2"]')).click();await p.waitForTimeout(400);const pr=await p.$('.ov3 .btn.primary');if(pr){await pr.click();await p.waitForTimeout(400)}}
await p.waitForTimeout(2500);console.log('play fps',await fps());await p.screenshot({path:__dirname+'/s/crowd_'+g+'_1.png'});
await p.keyboard.down('f');await p.waitForTimeout(2500);await p.keyboard.up('f');await p.keyboard.press('r');await p.waitForTimeout(1500);await p.waitForTimeout(500);await p.screenshot({path:__dirname+'/s/crowd_'+g+'_2.png'});
console.log(errs.join('|')||'ok');await b.close()})();
