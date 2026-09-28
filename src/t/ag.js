const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join('|')));p.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED/.test(m.text()))errs.push(m.text().slice(0,300))});
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
const t0=Date.now();await p.goto('file://'+process.argv[2]+'?g=apexgt#apexgt');await p.waitForTimeout(4000);console.log('load',Date.now()-t0);await p.screenshot({path:'s/ag_menu.png'});
const trk=process.argv[3];if(trk)await p.click('.ov3 button:has-text("'+trk+'")');
await p.click('.ov3 button:has-text("'+(process.argv[4]||'Race')+'")');await p.waitForTimeout(3000);await p.screenshot({path:'s/ag_grid.png'});
await p.waitForTimeout(25000);await p.keyboard.down("w");await p.waitForTimeout(30000);await p.screenshot({path:'s/ag_1.png'});
for(const k of ['c','c','c','c']){await p.keyboard.press(k);await p.waitForTimeout(1500);await p.screenshot({path:'s/ag_cam'+k+Date.now()%1000+'.png'})}
await p.keyboard.press('c');await p.keyboard.press('c');await p.waitForTimeout(6000);await p.screenshot({path:'s/ag_2.png'});
console.log(await p.evaluate(()=>document.querySelector('.stat').textContent),errs.slice(0,6).join('\n')||'no errors');await b.close()})();
