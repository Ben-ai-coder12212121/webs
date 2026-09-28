const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1200,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/fonts\.|google|cdn/,r=>r.abort());await require('./route')(p);
await p.goto('https://detour.test/');await p.waitForTimeout(800);
const r=await p.evaluate(()=>{const names=()=>[...document.querySelectorAll('#grid .tile b')].map(x=>x.textContent);const wipN=['Neon Harbor','The Hollow','Silent Contract','Moonblade','Iron Palm','Spellbound Academy'];const allN=names();const leak=allN.filter(n=>wipN.includes(n));document.querySelector('[data-f=wip]').click();const w=names();document.querySelector('[data-f=big]')&&document.querySelector('[data-f=big]').click();const big=names().filter(n=>wipN.includes(n));return{allCount:allN.length,leak,wip:w,bigLeak:big}});
console.log(JSON.stringify(r));
// random: press surprise many times
let hits=0;for(let i=0;i<60;i++){const id=await p.evaluate(()=>{surprise();return location.hash});if(['#neonharbor','#hollow','#contract','#moonblade','#ironpalm','#spellbound'].includes(id))hits++}console.log('random wip hits',hits);
await p.screenshot({path:__dirname+'/s/wip.png'});console.log(errs.join('\n')||'no errors');await b.close()})();
