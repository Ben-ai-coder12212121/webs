const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:900,height:1300}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/googletagmanager/,r=>r.abort());
await p.goto('file:///home/user/webs/games/tower-stack/index.html');await p.waitForTimeout(1500);await p.screenshot({path:__dirname+'/s/seo_page.png'});
console.log(await p.title());
await p.goto('file:///home/user/webs/index.html');await p.waitForTimeout(1000);await p.click('.allgames summary');await p.waitForTimeout(300);const e=await p.$('.allgames');await e.screenshot({path:__dirname+'/s/seo_az.png'});console.log(await p.title());
console.log(errs.join('|')||'ok');await b.close()})();
