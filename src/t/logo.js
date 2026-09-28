const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:600,height:600}});await p.goto('file://'+__dirname+'/../logo/preview.html');await p.screenshot({path:__dirname+'/s/logo.png'});await b.close()})();
