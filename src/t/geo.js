const {chromium}=require(process.env.PW);const fs=require('fs');const nm=__dirname+'/node_modules/';
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const errs=[];
const open=async(id,lv)=>{const p=await b.newPage({viewport:{width:1100,height:850}});p.on('pageerror',e=>errs.push(id+': '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts/.test(m.text()))errs.push(id+' console: '+m.text())});
 await p.route(/cdn\.jsdelivr\.net\/npm\/(d3-array|d3-geo|topojson-client)@[^/]+\/dist\/(.*)/,r=>{const m=r.request().url().match(/npm\/([a-z0-9-]+)@[^/]+\/dist\/(.*)/);r.fulfill({body:fs.readFileSync(nm+m[1]+'/dist/'+m[2]),contentType:'application/javascript'})});
 await p.route(/fonts\./,r=>r.abort());await p.goto('http://localhost:8765/test.html#'+id);await p.waitForTimeout(2500);return p};
const cv=async(p,x,y)=>{const r=await p.$eval('canvas.board',c=>{const b=c.getBoundingClientRect();return{l:b.left,t:b.top,w:b.width,h:b.height,cw:c.width,ch:c.height}});return[r.l+x/r.cw*r.w,r.t+y/r.ch*r.h]};
let p=await open('geo_country');for(let i=0;i<3;i++){const [a,bb]=await cv(p,300+i*150,200);await p.mouse.click(a,bb);await p.waitForTimeout(2500)}
await p.mouse.move(...await cv(p,480,250));await p.mouse.wheel(0,-300);await p.waitForTimeout(600);await p.screenshot({path:process.argv[2]+'_country.png'});console.log('country:',await p.$eval('.geobar',e=>e.textContent));
p=await open('geo_states');{const [a,bb]=await cv(p,480,300);await p.mouse.click(a,bb);await p.waitForTimeout(1500);await p.screenshot({path:process.argv[2]+'_states.png'});console.log('states:',await p.$eval('.geobar',e=>e.textContent))}
p=await open('geo_pin');{const [a,bb]=await cv(p,500,200);await p.mouse.click(a,bb);await p.waitForTimeout(800);await p.screenshot({path:process.argv[2]+'_pin.png'});console.log('pin:',await p.$eval('.geobar',e=>e.textContent))}
p=await open('geo_flags');await p.click('.choices .btn');await p.waitForTimeout(1200);await p.screenshot({path:process.argv[2]+'_flags.png'});console.log('flags:',await p.$eval('.geoleft',e=>e.textContent.slice(0,200)));
p=await open('geo_capitals');await p.click('.choices .btn');await p.waitForTimeout(1200);console.log('caps:',await p.$eval('.geoleft',e=>e.textContent.slice(0,200)));
console.log(errs.join('\n')||'no errors');await b.close()})();
