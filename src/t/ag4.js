const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:400,height:300}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.addInitScript(t=>localStorage.setItem('unb_ag_track',t),process.argv[3]||'0');
await p.goto('file://'+process.argv[2]+'?g=apexgt#apexgt');await p.waitForTimeout(3000);
await p.click('.ov3 button:has-text("Race")');await p.waitForTimeout(1500);
for(let i=0;i<6;i++){const r=await p.evaluate(()=>window.__ag.sim(40));console.log(JSON.stringify(r.slice(1).map(k=>[k.lap,k.i,k.best&&+k.best.toFixed(1),k.d,k.u])))}
await b.close()})();
