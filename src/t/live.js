const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const cx=await b.newContext({viewport:{width:1100,height:900},ignoreHTTPSErrors:true});const p=await cx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('https://detourr.netlify.app/');await p.waitForTimeout(2000);console.log('count',await p.$eval('#count',e=>e.textContent),'|',await p.$eval('#dcount',e=>e.textContent));
await p.click('[data-f=ideas]');await p.waitForTimeout(2500);console.log('ideas:',await p.$eval('.idealist',e=>e.textContent.slice(0,80)));
await p.click('[data-f=escape]');await p.waitForTimeout(300);console.log('escape tiles:',await p.$$eval('#grid .tile b',a=>a.map(x=>x.textContent).join(', ')));
await p.click('[data-f=all]');await p.click('#bigBtn');await p.waitForTimeout(3500);console.log('share:',await p.$eval('#dshare',e=>e.textContent));
console.log(errs.join('\n')||'no errors');await b.close()})();
