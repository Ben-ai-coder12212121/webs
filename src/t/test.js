const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs');
(async()=>{
const [,,file,id,secs,keysArg,shotPrefix,mission]=process.argv;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1100,height:700}});
const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message+' '+(e.stack||'').split('\n').slice(0,3).join(' | ')));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});
await p.route('**/matter.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/matter-js/build/matter.min.js'),contentType:'application/javascript'}));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
if(mission)await p.addInitScript(([id,m])=>{localStorage.setItem('unb_'+id+'_lv',m)},[id,mission]);
await p.goto('file://'+file+'#'+id);
await p.waitForTimeout(2500);
const clickPrimary=async()=>{const bt=await p.$('.ov3 .btn.primary');if(bt){await bt.click();await p.waitForTimeout(300);return true}return false};
await clickPrimary();await clickPrimary();
await p.screenshot({path:shotPrefix+'_0.png'});
const keys=(keysArg||'w').split(',');
const t0=Date.now();let i=0;
for(const k of keys){await p.keyboard.down(k)}
while(Date.now()-t0<(+secs||6)*1000){await p.mouse.move(550+Math.sin(i/5)*200,350);await p.waitForTimeout(250);i++;if(i%(+process.env.CL||8)===0){await p.keyboard.down(process.env.FK||'f');await p.waitForTimeout(300);await p.keyboard.up(process.env.FK||'f')}if(i%12===0){await p.keyboard.press('Space')}}
await p.screenshot({path:shotPrefix+'_1.png'});
const info=await p.evaluate(()=>({cap:(document.querySelector('.cx-cap')||{}).textContent,score:(document.querySelector('.cx-score')||{}).textContent,ov:(document.querySelector('.ov3 .ovc')||{}).textContent,stat:(document.querySelector('.stat')||{}).textContent}));
console.log(JSON.stringify(info));
console.log(errs.slice(0,8).join('\n')||'no errors');
await b.close()})();
