const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const W=+process.env.W||1200,H=+process.env.H||800,shot=process.argv[2]||'a';
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
await p.route(/fonts\.|google/,r=>r.abort());
await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await require('./route')(p);
await p.addInitScript(()=>{window.__GS_TEST=1});
await p.goto('https://detour.test/#'+(process.env.GAME||'gunsim'));await p.waitForFunction(()=>(window.__GS&&window.__GS.W)||window.__SS||window.__FS||window.__FL||window.__FR||window.__TX||window.__E3||window.__PW||window.__BK,null,{timeout:60000});await p.waitForTimeout(2500);
const S=async n=>{await p.screenshot({path:__dirname+'/s/gs_'+shot+n+'.png'})};
const ev=f=>p.evaluate(f);
const steps=JSON.parse(process.env.STEPS||'[]');
for(const s of steps){if(s.wait)await p.waitForTimeout(s.wait);if(s.js)console.log(s.js.slice(0,40),'=>',JSON.stringify(await ev(s.js)));if(s.shot)await S(s.shot);if(s.key)await p.keyboard.press(s.key)}
console.log(errs.join('\n')||'no errors');await b.close()})();
