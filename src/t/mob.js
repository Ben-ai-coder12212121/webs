const {chromium,devices}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
for(const mode of ['phone','desktop']){
const ctx=await b.newContext(mode==='phone'?devices['iPhone 13']:{viewport:{width:1300,height:900}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/fonts\.|google/,r=>r.abort());
await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route('https://detour.test/**',r=>r.fulfill({body:fs.readFileSync(__dirname+'/../srv/test.html'),contentType:'text/html'}));
await p.goto('https://detour.test/');await p.waitForTimeout(1500);
const PC=['Havoc','Breach','Last Drop','Overlord','Kaiju','Skyfront','Stillshot'];
const info=await p.evaluate(()=>({on:document.querySelector('#mobTop').classList.contains('on'),tiles:document.querySelectorAll('#grid .tile').length,note:(document.querySelector('.mobnote')||{}).textContent||'',names:[...document.querySelectorAll('#grid .tile b')].map(x=>x.textContent)}));
console.log(mode,'mobileMode',info.on,'tiles',info.tiles,'| note:',info.note.slice(0,90),'| pc tiles shown:',info.names.filter(n=>/Havoc|Breach|Last Drop|Stillshot|Skyfront/.test(n)).join(','));
await p.screenshot({path:__dirname+'/s/mob_'+mode+'.png'});
// random picks
const got=[];for(let i=0;i<6;i++){await p.evaluate(()=>document.querySelector('#bigBtn').click());await p.waitForFunction(()=>!document.querySelector('#stage').hidden,null,{timeout:15000}).catch(()=>{});await p.waitForTimeout(200);got.push(await p.textContent('#stTitle'));await p.evaluate(()=>{document.querySelector('#back').click()});await p.waitForTimeout(150)}
console.log(mode,'random picks:',got.join(' | '));
if(mode==='phone'){await p.click('#mobTop');await p.waitForTimeout(300);console.log('after toggle off tiles',await p.evaluate(()=>document.querySelectorAll('#grid .tile').length),'badges',await p.evaluate(()=>document.querySelectorAll('.pcbadge').length));await p.screenshot({path:__dirname+'/s/mob_off.png'})}
console.log(mode,'errors',errs.slice(0,3));await ctx.close()}
await b.close()})();
