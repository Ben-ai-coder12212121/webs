const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage();await p.route(/fonts\.|cdn/,r=>r.abort());
await p.goto('file:///home/user/webs/index.html');await p.waitForTimeout(800);
console.log(await p.evaluate(()=>({count:document.querySelector('#count').textContent,count2:document.querySelector('#count2').textContent,cards:document.querySelectorAll('#grid [data-id], #grid .card, #grid a, #grid button').length})));await b.close()})();
