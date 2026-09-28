const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const id of (process.argv[3]||'hs_flight,hs_speed').split(',')){const p=await b.newPage({viewport:{width:1000,height:640}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g='+id+'#'+id);await p.waitForTimeout(2500);const all=await p.$$('.ov3 .btn');await all[all.length-1].click();await p.waitForTimeout(400);
const tp=async(x,y,z)=>p.evaluate(([x,y,z])=>{const P=window.__RP();if(P.p){P.p.set(x,y,z);P.v&&P.v.set(0,0,0)}else{P.x=x;P.y=y;P.z=z}},[x,y,z]);
let log=[];for(let r=0;r<14;r++){await p.waitForTimeout(1500);const j=await p.evaluate(()=>{const R=window.__RM;const j=R.jobs[0];if(!j)return null;const a=j.kind==='rescue'&&j.stage===1?j.amb.position.clone():j.kind==='fire'?{x:j.b.x0-3,y:2,z:j.b.cz}:j.at();return{k:j.kind,st:j.stage,x:a.x,y:a.y,z:a.z}});
 if(!j)continue;log.push(j.k+(j.st||''));const y=j.k==='fire'?2:j.k==='rescue'&&j.st!==1?j.y-3:j.k==='plane'?j.y:Math.max(0,j.y-3);for(let t=0;t<14;t++){await tp(j.x,Math.max(y,0.3),j.z);await p.waitForTimeout(250)}}
const st=await p.evaluate(()=>({pts:window.__RM.pts,jobs:window.__RM.jobs.map(j=>j.kind)}));await p.screenshot({path:__dirname+'/s/j_'+id+'.png'});
console.log(id,log.join(','),JSON.stringify(st),errs.slice(0,3).join(' || ')||'ok');await p.close()}await b.close()})();
