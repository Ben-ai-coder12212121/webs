const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1100,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());const fs=require('fs');await p.route('**/matter.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/matter-js/build/matter.min.js'),contentType:'application/javascript'}));
await p.goto('file://'+process.argv[2]+'?g='+process.argv[3]+'#'+process.argv[3]);await p.waitForTimeout(1500);
const btn=await p.$('button:has-text("Stubborn")');if(!btn){const tabs=await p.$$('button');for(const t of tabs){const tx=await t.textContent();if(/rig|mode|setup|options|⚙/i.test(tx)){await t.click();await p.waitForTimeout(200);if(await p.$('button:has-text("Stubborn")'))break}}}
const b2=await p.$('button:has-text("Stubborn")');console.log('found',!!b2);if(b2)await b2.click();
for(const t of [1,4,8]){await p.waitForTimeout(t===1?1000:3500);await p.screenshot({path:__dirname+'/s/stub_'+t+'.png'})}
console.log(errs.join('|')||'ok');await b.close()})();
