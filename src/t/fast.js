const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=ttt#ttt');await p.waitForTimeout(1000);const btns=await p.$$('#arena button');let target=null;for(const bt of btns){const t=(await bt.textContent()).trim();const box=await bt.boundingBox();if(t===''&&box&&box.width>40){target=bt;break}}
const box=await target.boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.waitForTimeout(50);const during=await target.textContent();await p.mouse.up();await p.waitForTimeout(100);const after=await target.textContent();
console.log('during press:',JSON.stringify(during),'after release:',JSON.stringify(after),errs.join('|')||'ok');await b.close()})();
