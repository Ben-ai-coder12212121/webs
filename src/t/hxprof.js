const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:560,height:420}});
await p.addInitScript(()=>{try{localStorage.setItem('unb_hx_hq','false')}catch(e){}});
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=hs_havoc#hs_havoc');await p.waitForTimeout(2500);await (await p.$('.ov3 .btn.primary')).click();await p.waitForTimeout(2000);
const cdp=await p.context().newCDPSession(p);await cdp.send('Profiler.enable');await cdp.send('Profiler.start');await p.waitForTimeout(4000);const {profile}=await cdp.send('Profiler.stop');
const self={};const byId={};profile.nodes.forEach(n=>byId[n.id]=n);const dt=profile.timeDeltas;const cnt={};profile.samples.forEach((s,i)=>{cnt[s]=(cnt[s]||0)+(dt[i]||0)});for(const id in cnt){const n=byId[id];const k=n.callFrame.functionName+' @'+n.callFrame.lineNumber+':'+n.callFrame.columnNumber;self[k]=(self[k]||0)+cnt[id]}
Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,15).forEach(([k,v])=>console.log((v/1000).toFixed(0)+'ms',k));await b.close()})();
