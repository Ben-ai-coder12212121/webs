const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:+process.env.W||1200,height:+process.env.H||800}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.route(/fonts\.|google/,r=>r.abort());await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route('https://detour.test/**',r=>r.fulfill({body:fs.readFileSync(__dirname+'/../srv/test.html'),contentType:'text/html'}));
await p.goto('https://detour.test/#octagon');await p.waitForTimeout(3500);await p.screenshot({path:__dirname+'/s/oct0.png'});
await p.click('.oct-grid button');await p.waitForTimeout(2500);await p.screenshot({path:__dirname+'/s/oct1.png'});
for(let i=0;i<10;i++){await p.keyboard.press(i%3?'ArrowRight':'Space');await p.waitForTimeout(400)}await p.screenshot({path:__dirname+'/s/oct2.png'});
console.log(await p.evaluate(()=>document.querySelector('.oct-pct').textContent+' | '+document.querySelector('.oct-top').textContent));console.log(errs.join('\n')||'no errors');await b.close()})();
