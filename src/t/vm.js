const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const vis=(process.argv[3]||'0,1,2,3,4').split(',').map(Number);const mode=process.argv[4]||'roam';
for(const v of vis){const p=await b.newPage({viewport:{width:1000,height:640}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=hs_villain#hs_villain');await p.waitForTimeout(2500);
if(mode==='roam'){const all=await p.$$('.ov3 .btn');await all[all.length-1].click();await p.waitForTimeout(300)}else{await (await p.$('.ov3 .btn.primary')).click();await p.waitForTimeout(300)}
await (await p.$('.ov3 [data-v="'+v+'"]')).click();await p.waitForTimeout(400);let pr=await p.$('.ov3 .btn.primary');if(pr){await pr.click();await p.waitForTimeout(400)}pr=await p.$('.ov3 .btn.primary');if(pr){await pr.click();await p.waitForTimeout(400)}
await p.waitForTimeout(1500);
const aimB=async()=>p.evaluate(()=>{const X=window.__HX;let best=null,bd=1e9;X.blds.forEach(B=>{const cx=(B.gx0+B.fx/2)*4,cz=(B.gz0+B.fz/2)*4;const d=Math.hypot(cx-X.P.p.x,cz-X.P.p.z);if(d<bd&&d>25&&B.fh>6){bd=d;best=B}});if(best)X.aimAt((best.gx0+best.fx/2)*4,6,(best.gz0+best.fz/2)*4);return Math.round(bd)});
const b0=await p.evaluate(()=>window.__HX.stats.blocks);
await aimB();await p.keyboard.down('f');for(let i=0;i<10;i++){await aimB();await p.waitForTimeout(250)}await p.screenshot({path:__dirname+'/s/vm_'+v+'_a.png'});await p.keyboard.up('f');
await aimB();await p.keyboard.press('r');await p.waitForTimeout(2500);await p.screenshot({path:__dirname+'/s/vm_'+v+'_b.png'});
// backwards movement test
const z0=await p.evaluate(()=>{const X=window.__HX;return [X.P.p.x,X.P.p.z,X.cam.yaw]});await p.keyboard.down('s');await p.waitForTimeout(1200);await p.keyboard.up('s');const z1=await p.evaluate(()=>[window.__HX.P.p.x,window.__HX.P.p.z]);
const moved=Math.hypot(z1[0]-z0[0],z1[1]-z0[1]);const fwd=[-Math.sin(z0[2]),-Math.cos(z0[2])];const dot=((z1[0]-z0[0])*fwd[0]+(z1[1]-z0[1])*fwd[1]);
const b1=await p.evaluate(()=>window.__HX.stats.blocks);console.log('villain',v,'blocks destroyed',b1-b0,'back-move',moved.toFixed(1),'along-fwd',dot.toFixed(1),errs.join('|')||'ok');await p.close()}
await b.close()})();
