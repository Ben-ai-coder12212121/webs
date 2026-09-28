const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1200,height:860}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await p.route(/fonts\.|google|cdn/,r=>r.abort());
await p.addInitScript(()=>{window.__JPGOD=1});await p.route('https://detour.test/**',r=>r.fulfill({body:fs.readFileSync(__dirname+'/../srv/test.html'),contentType:'text/html'}));await p.goto('https://detour.test/#jetpack');await p.waitForTimeout(900);
await p.click('text=▶ Play');await p.waitForTimeout(500);await p.evaluate(()=>{const J=window.__JP();J.R.vehT=5;J.R.laserCd=40;J.R.dist=900});const seen=new Set();let shots=0;
for(let i=0;i<260;i++){const s=await p.evaluate(()=>{const J=window.__JP();return{d:Math.round(J.R.dist),c:J.R.coins,veh:J.pl.veh,las:J.lasers.length,mis:J.obs.filter(o=>o.k==='mis').length,warn:J.warn.length,zap:J.obs.filter(o=>o.k==='zap').length,sci:J.R.sci,y:Math.round(J.pl.y),th:J.R.theme}});
  const hold=s.y>300;if(hold)await p.keyboard.down(' ');else await p.keyboard.up(' ');if(s.veh&&i%4===0){await p.keyboard.up(' ');await p.keyboard.down(' ')}
  ['veh:'+s.veh,s.las?'laser':'',s.mis?'missile':'',s.warn?'warn':''].forEach(k=>{if(k&&!seen.has(k)){seen.add(k);if(shots<8){p.screenshot({path:__dirname+'/s/jpx'+(shots++)+'.png'})}}});
  if(i%40===0)console.log(JSON.stringify(s));await p.waitForTimeout(150)}
console.log('seen',[...seen].join(','));console.log(errs.join('\n')||'no errors');await b.close()})();
