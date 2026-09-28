const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const vis=(process.argv[3]||'0,1,2,3,4').split(',').map(Number);const mis=+(process.argv[4]||0);
for(const v of vis){const p=await b.newPage({viewport:{width:1000,height:640}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=hs_villain#hs_villain');await p.waitForTimeout(2500);
await p.evaluate(m=>{window.__VV.F.mi=m},mis);
const btns=await p.$$eval('.ov3 .btn',bs=>bs.map(b=>b.textContent));await (await p.$('.ov3 .btn.primary')).click();await p.waitForTimeout(300);
if(v===0)await p.screenshot({path:__dirname+'/s/v_pick.png'});
await (await p.$('.ov3 [data-v="'+v+'"]')).click();await p.waitForTimeout(300);await (await p.$('.ov3 .btn.primary')).click();await p.waitForTimeout(500);
const K=async(k,ms)=>{await p.keyboard.down(k);await p.waitForTimeout(ms);await p.keyboard.up(k)};
await K('w',1500);if(v===1){await p.keyboard.down(' ');await p.waitForTimeout(700);await p.keyboard.up(' ');await p.waitForTimeout(300)}
await p.keyboard.down('f');await p.waitForTimeout(2200);await p.screenshot({path:__dirname+'/s/v_fire'+v+'.png'});await p.keyboard.up('f');
await K('r',100);await p.waitForTimeout(400);if(v===1){await K('r',100);await p.waitForTimeout(200)}await p.waitForTimeout(1500);await p.screenshot({path:__dirname+'/s/v_pow'+v+'.png'});
if(v===1){await p.keyboard.down(' ');await p.waitForTimeout(900);await p.keyboard.up(' ');await p.waitForTimeout(500)}
await K('q',100);await p.waitForTimeout(2500);await p.screenshot({path:__dirname+'/s/v_q'+v+'.png'});
const st=await p.evaluate(()=>{const V=window.__VV;return {vl:V.VL.id,state:V.F.state,mi:V.mi,score:Math.round(V.score),st:V.st,ppl:V.people.length,air:V.air.length,burn:V.burning.length,torn:V.tornados.length,P:[V.P.p.x,V.P.p.y,V.P.p.z].map(x=>Math.round(x)),hp:Math.round(V.P.hp)}});
console.log(v,JSON.stringify(st),errs.slice(0,3).join(' || ')||'ok');await p.close()}await b.close()})();
