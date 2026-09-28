const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage();await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=lights#lights');await p.waitForTimeout(1000);
const snap=()=>p.$$eval('#arena button',bs=>bs.map(b=>b.className+'|'+b.getAttribute('aria-pressed')+'|'+b.style.cssText).join(';'));
const bt=(await p.$$('#arena button[aria-label^="light"]'))[12];const box=await bt.boundingBox();const s0=await snap();await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.waitForTimeout(60);const s1=await snap();await p.mouse.up();await p.waitForTimeout(150);const s2=await snap();
console.log('changed on press:',s0!==s1,' extra change on release:',s1!==s2);await b.close()})();
