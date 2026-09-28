const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});let p=await b.newPage({viewport:{width:1200,height:630}});await p.goto('file://'+__dirname+'/../logo/og.html');await p.screenshot({path:'/home/user/webs/og.png'});
p=await b.newPage({viewport:{width:180,height:180}});await p.goto('file://'+__dirname+'/../logo/touch.html');await p.screenshot({path:'/home/user/webs/apple-touch-icon.png'});await b.close()})();
