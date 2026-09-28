const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1100,height:700}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.addInitScript(()=>localStorage.setItem('unb_penalty_lv','0'));
await p.goto('file://'+process.argv[2]+'?g=penalty#penalty');await p.waitForTimeout(2000);await p.click('.ov3 .btn');await p.waitForTimeout(800);
for(let r=0;r<3;r++){await p.mouse.click(620,330);await p.waitForTimeout(2600);await p.screenshot({path:'s/pen_save'+r+'.png'});await p.waitForTimeout(1200);await p.mouse.click(500,300);await p.waitForTimeout(2600)}
console.log(await p.evaluate(()=>document.querySelector('.stat').textContent),errs.join('\n')||'no errors');await b.close()})();
