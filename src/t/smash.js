const {chromium}=require(process.env.PW);const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1000,height:700}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'#hs_flight');await p.waitForTimeout(2500);for(let k=0;k<2;k++){const bt=await p.$('.ov3 .btn.primary');if(bt){await bt.click();await p.waitForTimeout(300)}}
console.log('ERRS',errs);const info=await p.evaluate(()=>{const c=__city();const b=c.boxes.filter(b=>!b.tree&&b.h>30&&!b.noSmash).sort((a,b2)=>Math.hypot(a.cx,a.cz-150)-Math.hypot(b2.cx,b2.cz-150))[0];__P().p.set(b.cx+25,b.h*.55,b.z1+110);__P().v.set(0,0,0);window.__B=b;return{n:c.boxes.length,h:b.h}});console.log(info);
await p.waitForTimeout(800);
for(let i=0;i<3;i++){await p.evaluate(()=>{const b=__B;__K.smash(b,new __K.T.Vector3(b.cx,b.h*.5,b.z1),60)});await p.waitForTimeout(250)}await p.screenshot({path:process.argv[3]+'_a.png'});
await p.evaluate(()=>{const b=__B;__K.smash(b,new __K.T.Vector3(b.cx,b.h*.4,b.z1),9999)});await p.waitForTimeout(1600);await p.screenshot({path:process.argv[3]+'_b.png'});await p.waitForTimeout(3000);
console.log(await p.evaluate(()=>({n:__city().boxes.length,dead:__B.dead})));console.log(errs.join('\n')||'no errors');await b.close()})();
