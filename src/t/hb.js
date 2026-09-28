const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
for(const g of ['parkpro','hwweave']){const p=await b.newPage({viewport:{width:1000,height:700}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/fonts\.|google/,r=>r.abort());await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await require('./route')(p);await p.goto('https://detour.test/#'+g);await p.waitForTimeout(3000);
const bt=await p.$('.ov3 .btn.primary');if(bt)await bt.click();await p.waitForTimeout(500);
await p.keyboard.down('w');await p.waitForTimeout(1500);await p.screenshot({path:__dirname+'/s/hb_'+g+'1.png'});await p.keyboard.down('d');await p.keyboard.down(' ');await p.waitForTimeout(900);await p.screenshot({path:__dirname+'/s/hb_'+g+'2.png'});await p.keyboard.up(' ');await p.keyboard.up('w');await p.keyboard.up('d');
console.log(g,errs.join(' | ')||'no errors');await p.close()}await b.close()})();
