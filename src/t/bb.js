const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:900,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/fonts\.|google|cdnjs/,r=>r.abort());await p.route('https://detour.test/**',r=>r.fulfill({body:fs.readFileSync(__dirname+'/../srv/test.html'),contentType:'text/html'}));
await p.goto('https://detour.test/#ballbreak');await p.waitForTimeout(1200);
for(const lv of [0,2]){await p.click('#lvl button[data-l="'+lv+'"]');await p.waitForTimeout(600);const cv=await p.$('#arena canvas');const bb=await cv.boundingBox();
 let rounds=[];for(let i=0;i<14;i++){const ang=[-.6,.4,-.2,.7,-.8,.1][i%6];const sx=bb.x+bb.width/2,sy=bb.y+bb.height-15;await p.mouse.move(sx,sy-30);await p.mouse.down();await p.mouse.move(sx+Math.sin(ang)*200,sy-Math.cos(ang)*200,{steps:3});await p.mouse.up();await p.waitForTimeout(4200);const st=await p.evaluate(()=>document.querySelector('#stat')?.textContent||document.body.innerText.match(/Round \d+[^\n]*/)?.[0]);rounds.push(st)}
 console.log('level',lv,rounds.slice(-3).join(' | '));await cv.screenshot({path:__dirname+'/s/bb_'+lv+'.png'})}
console.log('errors',errs);await b.close()})();
