const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const lv of [2,3,4]){const p=await b.newPage({viewport:{width:1000,height:640}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]);await p.evaluate(lv=>{localStorage.setItem('unb_hs_villain_lv',String(lv));localStorage.setItem('unb_hs_villain_pick','0')},lv);
await p.goto('file://'+process.argv[2]+'?g=hs_villain#hs_villain');await p.waitForTimeout(2500);
await (await p.$('.ov3 .btn.primary')).click();await p.waitForTimeout(300);await (await p.$('.ov3 [data-v="0"]')).click();await p.waitForTimeout(400);for(let k=0;k<2;k++){const pr=await p.$('.ov3 .btn.primary');if(pr){await pr.click();await p.waitForTimeout(400)}}
await p.waitForTimeout(6000);
const info=await p.evaluate(()=>{const cap=document.querySelector('.cx-cap');return cap?cap.textContent:''});
await p.screenshot({path:__dirname+'/s/vm_m'+lv+'.png'});console.log('mission',lv+1,info.slice(0,120),errs.join('|')||'ok');await p.close()}
await b.close()})();
