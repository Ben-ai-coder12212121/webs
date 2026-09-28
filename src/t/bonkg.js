const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1100,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await p.route(/fonts\./,r=>r.abort());
await p.route('**/matter.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/matter-js/build/matter.min.js'),contentType:'application/javascript'}));
await p.goto('file://'+process.argv[2]+'?g=ph_buddy#ph_buddy');await p.waitForTimeout(1500);
const tabs=await p.$$('#arena button');for(const t of tabs){if((await t.textContent()).includes('Guns')){await t.click();break}}await p.waitForTimeout(200);
const tools=await p.$$('#arena .tool');console.log('gun tools',tools.length);const cv=await p.$('canvas.board');
const names=[];for(let i=0;i<tools.length;i++){const tt=(await p.$$('#arena .toolbar .tool'))[i];if(!tt)break;names.push(await tt.getAttribute('title'));await tt.click();await p.waitForTimeout(100);const bb=await cv.boundingBox();await p.mouse.move(bb.x+bb.width*.5,bb.y+bb.height*.55);await p.mouse.down();await p.waitForTimeout(i===3||i===4||i===8?600:80);await p.mouse.up();await p.waitForTimeout(350)}
console.log(names.join(','));console.log(await p.$eval('#stat',e=>e.textContent));await p.waitForTimeout(800);await p.screenshot({path:__dirname+'/s/bonkg.png'});console.log(errs.join('|')||'ok');await b.close()})();
