const {chromium}=require(process.env.PW);const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:900,height:560}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'#hs_ice');await p.waitForTimeout(2000);
for(let k=0;k<2;k++){const bt=await p.$('.ov3 .btn.primary');if(bt){await bt.click();await p.waitForTimeout(300)}}
const f=await p.evaluate(()=>({x:__ice.fires[0].x,z:__ice.fires[0].z,n:__ice.fires.length}));console.log('fire',f);
for(let i=0;i<=70;i++){const a=i/64*Math.PI*2;await p.evaluate(([x,z,a])=>{const P=__ice.P;P.x=x+Math.cos(a)*5;P.z=z+Math.sin(a)*5;P.vx=-Math.sin(a)*14;P.vz=Math.cos(a)*14;P.inv=5},[f.x,f.z,a]);await p.waitForTimeout(70)}
await p.waitForTimeout(500);console.log(await p.evaluate(()=>({n:__ice.fires.length,trail:__ice.trail.length,cap:document.querySelector('.cx-cap').textContent})));
await p.screenshot({path:process.argv[3]});console.log(errs.join('\n')||'no errors');await b.close()})();
