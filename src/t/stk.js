const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:900,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=stack#stack');await p.waitForTimeout(1500);
for(let i=0;i<9;i++){await p.keyboard.press('Space');await p.waitForTimeout(i?620:300)}await p.screenshot({path:'s/stk2d.png'});
await p.click('button:has-text("3D tower")');await p.waitForTimeout(1500);
for(let i=0;i<10;i++){await p.keyboard.press('Space');await p.waitForTimeout(i?850:300)}await p.screenshot({path:'s/stk3d.png'});
console.log(await p.evaluate(()=>document.querySelector('.stat').textContent),errs.join('\n')||'no errors');await b.close()})();
