const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=wanted#wanted');await p.waitForTimeout(2500);await p.click('.ov3 button:has-text("Drive!")');
for(let i=0;i<14;i++){const k=i%3===0?'a':i%3===1?'d':null;if(k)await p.keyboard.down(k);await p.waitForTimeout(1300);if(k)await p.keyboard.up(k);if(i===6)await p.screenshot({path:'s/ww_1.png'})}
await p.screenshot({path:'s/ww_2.png'});console.log(await p.evaluate(()=>document.querySelector('.stat').textContent),errs.join('\n')||'no errors');await b.close()})();
