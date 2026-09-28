const {chromium}=require(process.env.PW);const fs=require('fs');const nm=__dirname+'/node_modules/';
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const errs=[];
const open=async id=>{const p=await b.newPage({viewport:{width:1100,height:1000}});p.setDefaultTimeout(5000);p.on('pageerror',e=>errs.push(id+': '+e.message));
 await p.route(/cdn\.jsdelivr\.net\/npm\/(d3-array|d3-geo|topojson-client)@[^/]+\/dist\/(.*)/,r=>{const m=r.request().url().match(/npm\/([a-z0-9-]+)@[^/]+\/dist\/(.*)/);r.fulfill({body:fs.readFileSync(nm+m[1]+'/dist/'+m[2]),contentType:'application/javascript'})});
 await p.route(/fonts\.|wikimedia/,r=>r.abort());await p.addInitScript(()=>localStorage.setItem('unb_bday','"2010-07-20"'));await p.goto('http://localhost:8765/test.html#'+id);await p.waitForTimeout(2500);return p};
for(const id of ['info_size']){const p=await open(id);if(id==='info_size')await p.click('#stage button:has-text("Random")');if(id==='info_planets')await p.fill('input[type=number]','100');await p.waitForTimeout(800);await p.screenshot({path:process.argv[2]+'_'+id+'.png',fullPage:true});console.log(id,'::',(await p.$eval('#stage .arena',e=>e.innerText)).replace(/\s+/g,' ').slice(0,260))}
console.log(errs.join('\n')||'no errors');await b.close()})();
