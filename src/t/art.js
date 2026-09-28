// art review: open a game, run setup JS steps, screenshot the 3D view
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:+process.env.W||1300,height:+process.env.H||900}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push('console: '+m.text())});p.on('requestfailed',r=>errs.push('FAIL '+r.url()));
await p.route(/fonts\.|google/,r=>r.abort());await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await require('./route')(p);
await p.goto('https://detour.test/#'+process.env.GAME);await p.waitForFunction(()=>window.__BK,null,{timeout:120000});await p.waitForTimeout(1000);
const steps=JSON.parse(process.env.STEPS||'[]');let n=0;
for(const s of steps){if(s.wait)await p.waitForTimeout(s.wait);if(s.js){const r=await p.evaluate(s.js).catch(e=>'ERR '+e.message);console.log(String(s.js).slice(0,50),'=>',String(JSON.stringify(r)).slice(0,400))}if(s.shot){const bb=await p.evaluate(()=>{const r=document.querySelector('.g3').getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}});await p.screenshot({path:__dirname+'/s/art_'+s.shot+'.png',clip:bb,timeout:120000})}}
console.log(errs.slice(0,15).join('\n')||'no errors');await b.close()})();
