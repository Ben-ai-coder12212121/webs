const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+__dirname+'/../ads/covers.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
for(let i=1;i<=6;i++){const e=await p.$('#c'+i);await e.screenshot({path:process.argv[2]+'/ad'+i+'.png'})}await b.close()})();
