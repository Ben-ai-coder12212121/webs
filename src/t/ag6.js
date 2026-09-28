const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [car,bot] of [[0,.95],[1,.95],[2,.95],[1,1.0]]){const p=await b.newPage({viewport:{width:400,height:300}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.addInitScript(c=>{localStorage.setItem('unb_ag_car',c);localStorage.setItem('unb_ag_track','0')},String(car));
await p.goto('file://'+process.argv[2]+'?g=apexgt#apexgt');await p.waitForTimeout(3000);await p.click('.ov3 button:has-text("Time attack")');await p.waitForTimeout(800);
const r=await p.evaluate(b=>{const a=window.__ag;a.bot=b;const out=[];for(let i=0;i<8;i++){a.sim(20);const m=a.me;out.push([m.lap,m.i,+m.d.toFixed(1),+(m.u||0).toFixed(1),m.best&&+m.best.toFixed(2)])}return out},bot);console.log('car',car,'bot',bot,JSON.stringify(r));await p.close()}
await b.close()})();
