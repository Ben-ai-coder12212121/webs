const {chromium}=require(process.env.PW);const fs=require('fs');const nm=__dirname+'/node_modules/';
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage();
p.on('console',m=>console.log('C',m.type(),m.text()));p.on('pageerror',e=>console.log('E',e.message));p.on('requestfailed',r=>console.log('F',r.url().slice(0,100),r.failure().errorText));
await p.route(/cdn\.jsdelivr\.net/,r=>{const m=r.request().url().match(/npm\/([a-z0-9-]+)@[^/]+\/dist\/(.*)/);console.log('route',r.request().url());r.fulfill({body:fs.readFileSync(nm+m[1]+'/dist/'+m[2]),contentType:'application/javascript'})});
await p.route(/fonts\./,r=>r.abort());await p.goto('http://localhost:8765/test.html#info_bday');await p.waitForTimeout(3000);console.log(await p.$eval('#stage',e=>e.innerText.slice(0,300)));await b.close()})();
