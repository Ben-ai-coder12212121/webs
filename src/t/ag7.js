const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1100,height:760}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.addInitScript(t=>localStorage.setItem('unb_ag_track',t),process.argv[3]||'0');
await p.goto('file://'+process.argv[2]+'?g=apexgt#apexgt');await p.waitForTimeout(3500);await p.screenshot({path:'s/ag_menu.png'});await p.click('.ov3 button:has-text("Race")');await p.waitForTimeout(1500);await p.screenshot({path:'s/ag_start.png'});
await p.evaluate(()=>{const a=window.__ag;a.bot=.95;a.sim(24)});await p.waitForTimeout(1500);
for(let c=0;c<6;c++){await p.screenshot({path:'s/agv'+c+'.png'});await p.keyboard.press('c');await p.waitForTimeout(1500)}
console.log(errs.join('\n')||'no errors');await b.close()})();
