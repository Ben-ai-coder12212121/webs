const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const A=await b.newContext({viewport:{width:1200,height:850}});const p=await A.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\.|google/,r=>r.abort());
await p.goto('http://localhost:8799/');await p.evaluate(()=>{localStorage.setItem('unb_best_stack','42');localStorage.setItem('unb_best_snake','17')});
await p.goto('http://localhost:8799/?g=stack#stack');await p.waitForTimeout(1500);
console.log('trophy visible in Tower Stack:',await p.isVisible('#lbBtn'));
await p.click('#lbBtn');await p.waitForTimeout(800);console.log('panel:',(await p.textContent('#lbPanel')).slice(0,160));
await p.fill('#lbPanel input','Tester');await p.click('.lbsave');await p.waitForTimeout(2500);
console.log('after name:',(await p.textContent('#lbPanel .lbyou')),'|',(await p.textContent('#lbPanel ol')).slice(0,80));
// second player posts a higher score
const B=await b.newContext();const q=await B.newPage();await q.route(/fonts\.|google/,r=>r.abort());await q.goto('http://localhost:8799/');
console.log(await q.evaluate(async()=>{const r=await fetch('/api/lb',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({game:'best_stack',name:'Rival',score:77,id:'rivalrival1'})});return r.status+' '+await r.text()}));
await p.waitForTimeout(9000);console.log('live update:',(await p.textContent('#lbPanel .lbyou')),'|',(await p.textContent('#lbPanel ol')).slice(0,120));
await p.screenshot({path:__dirname+'/s/lb_panel.png'});
// play-through best: simulate new best via ctx by setting via game? check snake board got synced
console.log(await p.evaluate(async()=>{const r=await fetch('/api/lb?game=best_snake');return await r.text()}));
// toy has no trophy
await p.goto('http://localhost:8799/?g=ph_buddy#ph_buddy');await p.waitForTimeout(1200);console.log('trophy in Bonk Buddy:',await p.isVisible('#lbBtn'));
console.log(errs.join('|')||'no errors');await b.close()})();
