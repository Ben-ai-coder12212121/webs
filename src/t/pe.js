const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message,(e.stack||'').split('\n')[1]));await p.route(/fonts\.|google|cdn/,r=>r.abort());
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(700);await b.close()})();
