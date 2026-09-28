const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:900,height:600}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/fonts\.|google/,r=>r.abort());await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await require('./route')(p);
await p.goto('https://detour.test/#contract');await p.waitForFunction(()=>window.__SC,null,{timeout:60000});await p.waitForTimeout(1000);
const r=await p.evaluate((LVI)=>{const N=__SC,K=N.K,log=[];K.menuOff();N.startLevel(LVI);N.P.god=1;N.P.pos.set(0,0,-60);N.OPS.forEach(o=>{if(o.k==='poison')o.armed=true});
 const tg=N.NPCS.filter(n=>n.role==='target'||n.kind==='waiter'||n.role==='guard');for(let t=0;t<16;t++){N.sim(300);log.push(t+': '+tg.map(n=>(n.name||n.kind)[0]+(n.dead?'X':'')+(n.poisoned?'P':'')+n.ri+'/'+n.state[0]+'@'+(n.pos.x|0)+','+(n.pos.z|0)).join(' '))}return log},+(process.env.LVI||0));
console.log(r.join('\n'));console.log(errs.join('\n')||'no errors');await b.close()})();
