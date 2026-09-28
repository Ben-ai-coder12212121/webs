const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:640,height:400}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route('https://detour.test/**',r=>r.fulfill({body:fs.readFileSync(__dirname+'/../srv/test.html'),contentType:'text/html'}));
await p.addInitScript(()=>{window.__GS_TEST=1});await p.goto('https://detour.test/#stillshot');await p.waitForFunction(()=>window.__SS,null,{timeout:60000});
const NL=await p.evaluate(()=>__SS.LV.length);for(let L=+(process.env.FROM||0);L<(+process.env.TO||NL);L++){await p.evaluate(L=>{__SS.start(L,false);window.__L=L},L);let st='';for(let i=0;i<50;i++){await p.waitForTimeout(700);st=await p.evaluate(()=>{__SS.burst=999;__SS.PL.x=0;const R=__SS.LV[__L].room;const out=R&&!__SS.LV[__L].out;__SS.E.forEach(e=>{if(e.dead||e.caged)return;const x=e.g.position.x,z=e.g.position.z;if(!out||Math.abs(x)<R[0]/2-.3&&Math.abs(z)<R[1]/2-.3){e.dead=false;e.stun=0;__SS.E.length&&0;e.g.position.y=0;e.__k=1}});const k=__SS.E.filter(e=>e.__k&&!e.dead);if(k.length){const save=__SS.PL.y;k.forEach(e=>{e.dead=false});__SS.killAll2?0:0}return __SS.state});
      await p.evaluate(()=>{__SS.E.filter(e=>e.__k&&!e.dead).forEach(e=>__SS.shatterE(e))});if(st==='won'||st==='replay')break;if(st==='dead')await p.evaluate(()=>{__SS.start(__L,false)})}
  const left=await p.evaluate(()=>__SS.E.filter(e=>!e.dead).map(e=>[e.g.position.x.toFixed(1),e.g.position.z.toFixed(1),e.state,e.caged?'c':''].join(',')).join(' '));console.log('L'+L,st,left)}
await b.close()})();
