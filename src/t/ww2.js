const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=wanted#wanted');await p.waitForTimeout(2500);await p.click('.ov3 button:has-text("Drive!")');
for(let i=0;i<40;i++){const k=['a','d',null][i%3];if(k)await p.keyboard.down(k);if(i%4===0)await p.keyboard.down('Shift');if(i%5===0)await p.keyboard.down('w');await p.waitForTimeout(900);if(k)await p.keyboard.up(k);await p.keyboard.up('Shift');await p.keyboard.up('w');if(i===20)await p.screenshot({path:'s/ww_a.png'});if(await p.$('.ov3'))break}
await p.screenshot({path:'s/ww_b.png'});console.log(await p.evaluate(()=>document.querySelector('.stat').textContent),errs.slice(0,3).join('\n')||'no errors');await b.close()})();
