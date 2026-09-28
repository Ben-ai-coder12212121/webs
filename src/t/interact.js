const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const ids=fs.readFileSync('ids.txt','utf8').trim().split('\n');
for(const id of ids){const p=await b.newPage({viewport:{width:1100,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.route('**/matter.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/matter-js/build/matter.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g='+id+'#'+id);await p.waitForTimeout(1200);const cv=await p.$('canvas.board');if(!cv){console.log(id,'no canvas');await p.close();continue}const bb=await cv.boundingBox();const X=f=>bb.x+bb.width*f,Y=f=>bb.y+bb.height*f;
for(let i=0;i<3;i++){await p.mouse.click(X(.5),Y(.5));await p.waitForTimeout(200)}
for(const k of [' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','d','a','w','s']){await p.keyboard.down(k);await p.waitForTimeout(150);await p.keyboard.up(k)}
await p.mouse.move(X(.2),Y(.85));await p.mouse.down();await p.mouse.move(X(.45),Y(.45),{steps:8});await p.mouse.up();await p.waitForTimeout(300);
await p.mouse.move(X(.5),Y(.88));await p.mouse.down();await p.mouse.move(X(.3),Y(.3),{steps:8});await p.mouse.up();
for(let i=0;i<8;i++){await p.mouse.click(X(.1+i*.1),Y(.3+(i%4)*.15));await p.waitForTimeout(150)}await p.waitForTimeout(800);await p.screenshot({path:'s/ia_'+id+'.png'});
console.log(id.padEnd(13),errs.slice(0,2).join(' || ')||'ok');await p.close()}await b.close()})();
