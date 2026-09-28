const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const id of (process.argv[3]||'hs_speed,hs_flight,hs_strength,hs_ice,hs_villain').split(',')){const p=await b.newPage({viewport:{width:1000,height:640}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g='+id+'#'+id);await p.waitForTimeout(2500);const all=await p.$$('.ov3 .btn');await all[all.length-1].click();await p.waitForTimeout(400);
for(let k=0;k<2;k++){const v=await p.$('.ov3 [data-v="0"]');if(v){await v.click();await p.waitForTimeout(300)}const pr=await p.$('.ov3 .btn.primary');if(pr){await pr.click();await p.waitForTimeout(300)}}
await p.keyboard.down('w');await p.waitForTimeout(3000);await p.keyboard.up('w');await p.waitForTimeout(9000);await p.screenshot({path:__dirname+'/s/r_'+id+'.png'});
const txt=await p.evaluate(()=>{const d=[...document.querySelectorAll('div')].find(x=>x.innerHTML.includes('hero points'));return d?d.innerText:'no panel'});
console.log(id,JSON.stringify(txt),errs.slice(0,3).join(' || ')||'ok');await p.close()}await b.close()})();
