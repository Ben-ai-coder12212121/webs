const {chromium,devices}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const ctx=await b.newContext(devices['iPhone 13']);const p=await ctx.newPage();
await p.route(/fonts\.|google|cdnjs/,r=>r.abort());await p.route('https://detour.test/**',r=>r.fulfill({body:fs.readFileSync(__dirname+'/../srv/test.html'),contentType:'text/html'}));
await p.goto('https://detour.test/');await p.waitForTimeout(1200);
await (await p.$('.press')).screenshot({path:__dirname+'/s/mob_press.png'});
await p.evaluate(()=>document.querySelector('.filters').scrollIntoView());await p.waitForTimeout(200);await p.screenshot({path:__dirname+'/s/mob_filters.png'});await b.close()})();
