const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:500,height:400}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=apexgt#apexgt');await p.waitForTimeout(3000);
await p.click('.ov3 button:has-text("Time attack")');await p.waitForTimeout(8000);await p.keyboard.down('w');
for(let i=0;i<8;i++){await p.waitForTimeout(2500);console.log(await p.evaluate(()=>{const m=window.__ag.me;const f=v=>+(+v).toFixed(3);return JSON.stringify({i:m.i,d:f(m.d),psi:f(m.psi),u:f(m.u),w:f(m.w),r:f(m.r),dl:f(m.delta),gear:m.gear})}))}
await b.close()})();
