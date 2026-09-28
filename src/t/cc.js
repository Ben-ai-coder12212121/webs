const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1100,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/matter.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/matter-js/build/matter.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
const lv=process.argv[3]||'1';await p.addInitScript(l=>{localStorage.setItem('unb_castle_stars',JSON.stringify(Array(20).fill(1)));localStorage.setItem('unb_castle_lv',l)},lv);
await p.goto('file://'+process.argv[2]+'?g=ph_castle#ph_castle');await p.waitForTimeout(1500);
const cv=await p.$('canvas.board');const bb=await cv.boundingBox();const k=bb.width/960;const X=v=>bb.x+v*k,Y=v=>bb.y+v*k;
await p.screenshot({path:'s/cc_'+lv+'_0.png'});
for(let s=0;s<6;s++){await p.mouse.move(X(140),Y(450));await p.mouse.down();await p.mouse.move(X(40+s*3),Y(500-s*8),{steps:5});await p.mouse.up();await p.waitForTimeout(700);await p.mouse.click(X(500),Y(300));await p.waitForTimeout(3500)}
await p.screenshot({path:'s/cc_'+lv+'_1.png'});console.log(lv,await p.evaluate(()=>document.querySelector('.stat').textContent),errs.join('\n')||'no errors');await b.close()})();
