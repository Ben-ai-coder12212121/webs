const {chromium,devices}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const ctx=await b.newContext(devices['iPhone 13']);const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/fonts\.|google/,r=>r.abort());await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route('https://detour.test/**',r=>r.fulfill({body:fs.readFileSync(__dirname+'/../srv/test.html'),contentType:'text/html'}));
await p.goto('https://detour.test/#openroad');await p.waitForTimeout(3000);await p.screenshot({path:__dirname+'/s/fs0.png'});
console.log('rotq on:',await p.evaluate(()=>document.querySelector('.rotq').classList.contains('on')));
await p.click('.rotq .btn');await p.waitForTimeout(800);console.log('fs:',await p.evaluate(()=>[!!document.fullscreenElement,document.querySelector('#stage').className]));
await p.setViewportSize({width:844,height:390});await p.waitForTimeout(1200);await p.screenshot({path:__dirname+'/s/fs1.png'});console.log(await p.evaluate(()=>{const q=s=>{const e=document.querySelector(s);if(!e)return s+':none';const r=e.getBoundingClientRect();return s+':'+Math.round(r.top)+'/'+Math.round(r.height)+' '+getComputedStyle(e).display};return [q('#stage'),q('#arena'),q('.g3'),window.innerHeight,[...document.querySelector('#arena').children].map(c=>c.className+':'+c.offsetHeight).join(',')]}));
console.log('errors',errs);await b.close()})();
