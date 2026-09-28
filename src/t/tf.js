const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1100,height:700}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
await p.route('**/three.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));await p.route(/fonts\./,r=>r.abort());
const S=n=>p.screenshot({path:__dirname+'/s/'+n+'.png'});
await p.goto('file://'+process.argv[2]+'?g=sim_tractor#sim_tractor');await p.waitForTimeout(2500);await S('tf_0');await (await p.$('.ov3 .btn.primary')).click();await p.waitForTimeout(800);
// place at field 1 edge heading +x, plow rows
const row=async(z,dir)=>{await p.evaluate(([z,dir])=>{const P=window.__TF.P;P.x=dir>0?-78:-26;P.z=z;P.yaw=dir>0?Math.PI/2:-Math.PI/2;P.v=8},[z,dir]);await p.keyboard.down('w');await p.waitForTimeout(6500);await p.keyboard.up('w')};
await row(-70,1);await S('tf_1');
await p.keyboard.press('2');await row(-70,-1);await S('tf_2');
await p.evaluate(()=>window.__TF.setT(60));await p.waitForTimeout(4000);await p.evaluate(()=>window.__TF.setT(1));await S('tf_3');
await p.keyboard.press('3');await row(-70,1);console.log('tank',await p.evaluate(()=>window.__TF.tank),'money',await p.evaluate(()=>Math.round(window.__TF.money)));await S('tf_4');
await p.evaluate(()=>{const P=window.__TF.P;P.x=19.5;P.z=11;P.v=0});await p.waitForTimeout(3000);console.log('after sell tank',await p.evaluate(()=>window.__TF.tank),'money',await p.evaluate(()=>Math.round(window.__TF.money)));
await p.evaluate(()=>{const P=window.__TF.P;P.x=-18;P.z=13;P.v=0});await p.waitForTimeout(800);await S('tf_5');
console.log(errs.join('|')||'ok');await b.close()})();
