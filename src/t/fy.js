const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1100,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\.|google|cdn/,r=>r.abort());
await p.goto('http://localhost:8765/test.html');await p.waitForTimeout(700);await p.click('[data-f=foryou]');await p.waitForTimeout(300);
console.log('empty:',(await p.$$eval('#grid .tile .why',a=>a.slice(0,3).map(x=>x.textContent))).join(' | '),'|',(await p.$$eval('#grid .tile b',a=>a.slice(0,6).map(x=>x.textContent))).join(', '));
await p.evaluate(()=>{const now=Date.now();localStorage.setItem('unb_hist',JSON.stringify({cook_pizza:{n:4,s:900,t:now},sim_farm:{n:2,s:600,t:now},snake:{n:1,s:40,t:now-5*864e5}}))});
await p.goto('http://localhost:8765/test.html');await p.waitForTimeout(700);await p.click('[data-f=foryou]');await p.waitForTimeout(300);
console.log('with history:',(await p.$$eval('#grid .tile',a=>a.slice(0,10).map(x=>x.querySelector('b').textContent+' ['+x.querySelector('.why').textContent+']'))).join('\n  '));
await p.screenshot({path:__dirname+'/s/fy.png'});console.log(errs.join('|')||'ok');await b.close()})();
