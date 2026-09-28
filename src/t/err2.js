const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message,(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')console.log('CON',m.text())});await p.route(/fonts\.|google|cdn/,r=>r.abort());
await p.goto('http://localhost:8799/');await p.waitForTimeout(1000);await b.close()})();
