const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const id=process.argv[3];const p=await b.newPage({viewport:{width:1000,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await p.route(/fonts\./,r=>r.abort());
await p.route('**/matter.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/matter-js/build/matter.min.js'),contentType:'application/javascript'}));
await p.goto('file://'+process.argv[2]+'?g='+id+'#'+id);await p.waitForTimeout(1200);const cv=await p.$('canvas.board');const bb=await cv.boundingBox();
for(const [x,y,w] of JSON.parse(process.argv[4]||'[[0.5,0.5,1500]]')){await p.mouse.click(bb.x+bb.width*x,bb.y+bb.height*y);await p.waitForTimeout(w)}
await p.screenshot({path:__dirname+'/s/one_'+id+'.png'});console.log(errs.join('|')||'ok');await b.close()})();
