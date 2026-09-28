const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:1200,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/fonts\.|google/,r=>r.abort());await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route('https://detour.test/**',r=>r.fulfill({body:fs.readFileSync(__dirname+'/../srv/test.html'),contentType:'text/html'}));await p.addInitScript(()=>{window.__GS_TEST=1});
await p.goto('https://detour.test/#gunsim');await p.waitForFunction(()=>window.__GS&&window.__GS.W,null,{timeout:60000});await p.evaluate(()=>__GS.setMode('range'));await p.waitForTimeout(1500);
const aim=()=>p.evaluate(()=>document.querySelector('.gs-acts button.on')?.textContent||'none');
await p.keyboard.down('q');await p.waitForTimeout(1200);console.log('holding q:',await aim(),'gun',await p.evaluate(()=>__GS.W.d.id));await p.keyboard.press(' ');await p.waitForTimeout(300);
await p.keyboard.up('q');await p.waitForTimeout(600);console.log('released:',await aim());console.log(errs.join('\n')||'no errors');await b.close()})();
