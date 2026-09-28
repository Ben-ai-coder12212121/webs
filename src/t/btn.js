const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1100,height:900}});
await p.route(/fonts\.|google|cdn/,r=>r.abort());await p.route('https://detour.test/**',r=>r.fulfill({body:fs.readFileSync('/home/user/webs/index.html'),contentType:'text/html'}));
await p.goto('https://detour.test/');await p.waitForTimeout(1200);const el=await p.$('#bigBtn');await el.screenshot({path:__dirname+'/s/btn.png'});
console.log(await p.evaluate(()=>[document.title,document.querySelector('#again')&&document.querySelector('#again').textContent,[...document.body.innerText.matchAll(/detour(?!r)/gi)].length]));await b.close()})();
