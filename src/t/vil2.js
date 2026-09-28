const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const vis=(process.argv[3]||'0,1,2,3,4').split(',').map(Number);
for(const v of vis){const p=await b.newPage({viewport:{width:1000,height:640}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=hs_villain#hs_villain');await p.waitForTimeout(2500);

const all=await p.$$('.ov3 .btn');await all[all.length-1].click();await p.waitForTimeout(300); // Free roam
await (await p.$('.ov3 [data-v="'+v+'"]')).click();await p.waitForTimeout(400);const pr=await p.$('.ov3 .btn.primary');if(pr){await pr.click();await p.waitForTimeout(400)}
const aim=async()=>p.evaluate(()=>{const V=window.__VV;const P=V.P.p;let best=null,bd=1e9;V.city.boxes.forEach(b=>{if(b.tree||b.dead)return;const d=Math.hypot(b.cx-P.x,b.cz-P.z);if(d<bd&&d>20){bd=d;best=b}});if(best)V.aimAt(best.cx,best.h*.5,best.cz);return best&&Math.round(bd)});
const K=async(k,ms)=>{await p.keyboard.down(k);await p.waitForTimeout(ms);await p.keyboard.up(k)};
for(let r=0;r<3;r++){await aim();await p.keyboard.down('f');for(let i=0;i<8;i++){await aim();await p.waitForTimeout(250)}await p.keyboard.up('f');await aim();await K('r',80);await p.waitForTimeout(800);if(v===1){await aim();await K('r',80);await p.waitForTimeout(900)}}
await p.screenshot({path:__dirname+'/s/w_'+v+'a.png'});
await p.evaluate(()=>{const V=window.__VV;V.makeAir('plane');V.makeAir('heli');V.makeAir('blimp');const a=V.air;a.forEach(x=>{x.p.set(V.P.p.x+30,V.P.p.y+15,V.P.p.z-60)})});
for(let i=0;i<30;i++){await p.evaluate(()=>{const V=window.__VV;const a=V.air.find(x=>!x.fall);if(a)V.aimAt(a.p.x,a.p.y,a.p.z)});await p.keyboard.down('f');await p.waitForTimeout(150);if(i%6===5){await K('r',60)}}
await p.keyboard.up('f');await p.screenshot({path:__dirname+'/s/w_'+v+'b.png'});await p.waitForTimeout(4000);await p.screenshot({path:__dirname+'/s/w_'+v+'c.png'});
const st=await p.evaluate(()=>{const V=window.__VV;return {vl:V.VL.id,state:V.F.state,mi:V.mi,score:Math.round(V.score),st:V.st,air:V.air.map(a=>a.type+(a.fall?'F':'')).join(','),burn:V.burning.length,torn:V.tornados.length,P:[V.P.p.x,V.P.p.y,V.P.p.z].map(x=>Math.round(x)),hp:Math.round(V.P.hp)}});
console.log(v,JSON.stringify(st),errs.slice(0,3).join(' || ')||'ok');await p.close()}await b.close()})();
