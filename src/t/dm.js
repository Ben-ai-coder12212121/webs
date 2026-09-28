const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const run=async(id,init,fn)=>{const p=await b.newPage({viewport:{width:1100,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/matter.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/matter-js/build/matter.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.addInitScript(init);await p.goto('file://'+process.argv[2]+'?g='+id+'#'+id);await p.waitForTimeout(1500);const cv=await p.$('canvas.board');const bb=await cv.boundingBox();const k=bb.width/960;
await fn(p,v=>bb.x+v*k,v=>bb.y+v*k);await p.screenshot({path:'s/dm_'+id+'.png'});console.log(id,await p.evaluate(()=>document.querySelector('.stat').textContent),errs.join('|')||'no errors');await p.close()};
await run('ph_wreck',()=>localStorage.setItem('unb_wreck_lv','4'),async(p,X,Y)=>{for(let i=0;i<40;i++){await p.mouse.move(X(100+ (i%2)*760),Y(300));await p.waitForTimeout(400)}});
await run('ph_tnt',()=>localStorage.setItem('unb_tnt_lv','4'),async(p,X,Y)=>{await p.waitForTimeout(500);await p.screenshot({path:'s/dm_tnt_plan.png'});await p.mouse.click(X(480),Y(540));await p.mouse.click(X(430),Y(540));await p.keyboard.press('Enter');await p.waitForTimeout(7000)});
await b.close()})();
