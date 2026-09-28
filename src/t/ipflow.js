const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:900,height:600}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
await p.route(/fonts\.|google/,r=>r.abort());await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await require('./route')(p);
await p.goto('https://detour.test/#ironpalm');await p.waitForFunction(()=>window.__IP,null,{timeout:60000});await p.waitForTimeout(1000);
const r=await p.evaluate(()=>{const N=__IP,K=N.K,log=[];try{for(let li=0;li<5;li++){K.menuOff();N.startLevel(li,20+li);let g=0;while(K.DQ.cur&&g++<20)document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));N.P.god=1;
  let k=0;for(;k<900&&N.RUN.state==='play';k++){const r=N.ROOMS.find(r=>!r.cleared);if(!r)break;if(N.P.pos.z>r.z1-3){N.P.pos.set(0,0,Math.min(N.P.pos.z-1.5,r.z1-3))}const e=N.EN.filter(e=>!e.dead&&e.room===N.P.room).sort((a,b)=>a.pos.distanceTo(N.P.pos)-b.pos.distanceTo(N.P.pos))[0];if(e){N.P.hp=N.P.maxHp;N.P.pos.set(e.pos.x,0,e.pos.z+1.5);N.P.yaw=Math.PI;N.pStart(k%4?'light':'heavy')}else{N.P.pos.z-=1.2}N.sim(12)}
  log.push(li+': '+N.LVL[li].n+' -> '+N.RUN.state+' iters '+k+' '+JSON.stringify(N.tick()))}
  // aging test
  K.menuOff();N.startLevel(0,20);N.P.pos.set(0,0,-6);N.P.hp=1;N.sim(200);log.push('dead '+N.P.dead)}catch(e){log.push('ERR '+e.message+' '+e.stack.split('\n')[1])}return log});
await p.waitForTimeout(2500);const m=await p.evaluate(()=>document.querySelector('.bk-menu').textContent.slice(0,120));console.log(m);
console.log(r.join('\n'));console.log(errs.join('\n')||'no errors');await b.close()})();
