const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const go=async(id,fn)=>{const p=await b.newPage({viewport:{width:1100,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route('**/matter.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/matter-js/build/matter.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g='+id+'#'+id);await p.waitForTimeout(2000);await fn(p);await p.screenshot({path:'s/sd_'+id+'.png'});console.log(id,await p.evaluate(()=>document.querySelector('.stat').textContent),errs.join('|')||'no errors');await p.close()};
await go('hwweave',async p=>{await p.click('.ov3 .btn.primary');for(let i=0;i<10;i++){await p.keyboard.press(i%2?'a':'d');await p.waitForTimeout(700)}});
await go('parkpro',async p=>{await p.keyboard.down('w');await p.waitForTimeout(800);await p.keyboard.up('w');await p.keyboard.down('a');await p.keyboard.down('s');await p.waitForTimeout(700);await p.keyboard.up('a');await p.keyboard.up('s')});
await go('hillclimb',async p=>{await p.keyboard.press('d');await p.keyboard.down('d');await p.waitForTimeout(7000);await p.keyboard.up('d')});
await b.close()})();
