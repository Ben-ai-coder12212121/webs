const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:800,height:500}});
await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route('https://detour.test/**',r=>r.fulfill({body:fs.readFileSync(__dirname+'/../srv/test.html'),contentType:'text/html'}));await p.addInitScript(()=>{window.__GS_TEST=1});
await p.goto('https://detour.test/#stillshot');await p.waitForFunction(()=>window.__SS,null,{timeout:60000});
const n=await p.evaluate(()=>__SS.LV.length);
for(let li=0;li<n;li++){const r=await p.evaluate(li=>{__SS.start(li);const T=THREE;const itemMs=new Set(__SS.items.map(i=>i.m));const boxes=[];__SS.lvG.children.forEach(m=>{if(itemMs.has(m)||!m.isMesh)return;const bb=new T.Box3().setFromObject(m);const s=bb.getSize(new T.Vector3());if(s.x>20||s.z>20)return;boxes.push(bb)});
  const bad=[];for(const it of __SS.items){const bb=new T.Box3().setFromObject(it.m);const c=bb.getCenter(new T.Vector3());for(const q of boxes){const e=q.clone().expandByScalar(-.02);if(e.containsPoint(c)){bad.push(it.t+'@'+c.x.toFixed(1)+','+c.y.toFixed(2)+','+c.z.toFixed(1)+' in box top '+q.max.y.toFixed(2));break}}}return __SS.LV[li].n+': '+(bad.length?bad.join(' | '):'ok')},li);console.log(li+1,r)}
await b.close()})();
