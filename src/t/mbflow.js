const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:900,height:600}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
await p.route(/fonts\.|google/,r=>r.abort());await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await require('./route')(p);
await p.goto('https://detour.test/#moonblade');await p.waitForFunction(()=>window.__MB,null,{timeout:60000});await p.waitForTimeout(1000);
const r=await p.evaluate(()=>{const N=__MB,K=N.K,log=[];try{for(let ci=0;ci<8;ci++){K.menuOff();N.startChapter(ci);let g=0;while(N.K.DQ.cur&&g++<20)document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));N.P.god=1;N.sim(40);
  let k=0;for(;k<400&&N.RUN.state==='fight';k++){const e=N.EN.filter(e=>!e.dead).sort((a,b)=>a.pos.distanceTo(N.P.pos)-b.pos.distanceTo(N.P.pos))[0];if(e){N.P.pos.set(e.pos.x,0,e.pos.z+2.2);N.P.yaw=0;N.startAtk(k%3?'light':'heavy')}N.sim(18)}log.push(ci+': '+N.CH[ci].n+' -> '+N.RUN.state+' after '+k+' kills '+N.RUN.kills+' '+JSON.stringify(N.tick()))}}catch(e){log.push('ERR '+e.message)}return log});
console.log(r.join('\n'));console.log(errs.join('\n')||'no errors');await b.close()})();
