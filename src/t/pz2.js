const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1100,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await p.route(/fonts\./,r=>r.abort());
const S=n=>p.screenshot({path:__dirname+'/s/'+n+'.png'});let cv;
const at=async(X,Y)=>{const bb=await cv.boundingBox();await p.mouse.click(bb.x+X/960*bb.width,bb.y+Y/620*bb.height);await p.waitForTimeout(120)};
const path=async(pts)=>{const bb=await cv.boundingBox();const f=(X,Y)=>[bb.x+X/960*bb.width,bb.y+Y/620*bb.height];await p.mouse.move(...f(...pts[0]));await p.mouse.down();for(const q of pts.slice(1))await p.mouse.move(...f(...q),{steps:8});await p.mouse.up();await p.waitForTimeout(120)};
const sweep=async()=>{const pts=[];for(let y=232,k=0;y<=515;y+=28,k++){const hw=Math.sqrt(Math.max(0,160*160*.8-(y-372)**2));pts.push([385+(k%2?hw:-hw),y],[385+(k%2?-hw:hw),y])}await path(pts)};
await p.goto('file://'+process.argv[2]+'?g=cook_pizza#cook_pizza');await p.waitForTimeout(1000);cv=await p.$('canvas.board');await S('pz_0');
await at(480,378);await p.waitForTimeout(2600);await S('pz_1');await at(165,548);await p.waitForTimeout(200);
await sweep();await S('pz_2');await at(655,515);await sweep();await S('pz_3');await at(655,515);
for(let i=0;i<8;i++)await at(300+(i%4)*55,290+Math.floor(i/4)*120);await path([[300,480],[470,480]]);await S('pz_4');
await at(655,576);await p.waitForTimeout(14000);await S('pz_5');await at(195,469);await p.waitForTimeout(300);
const d=async(a,b2,c2,d2)=>path([[a,b2],[c2,d2]]);await d(200,372,570,372);await d(385,190,385,555);await d(255,242,515,502);await d(515,242,255,502);await S('pz_6');await at(655,576);await p.waitForTimeout(500);await S('pz_7');
for(const g of ['cook_burger','cook_cupcake']){await p.goto('file://'+process.argv[2]+'?g='+g+'#'+g);await p.waitForTimeout(900);cv=await p.$('canvas.board');await S(g+'_0');await at(380,388);await p.waitForTimeout(2000);await S(g+'_1');await at(190,500);await p.waitForTimeout(300);await S(g+'_2');}
// burger: add patties on grill
await p.goto('file://'+process.argv[2]+'?g=cook_burger#cook_burger');await p.waitForTimeout(900);cv=await p.$('canvas.board');await at(380,388);await p.waitForTimeout(1800);await at(190,508);await at(460,32);await at(110,260);await at(275,260);await p.waitForTimeout(6000);await at(275,260);await p.waitForTimeout(3000);await S('bg_grill');await at(110,380);await at(620,32);await at(560+42,90+70+30);await at(560+42,90+30);await at(560+90+42,90+30);await S('bg_build');
// cupcake bake + decorate
await p.goto('file://'+process.argv[2]+'?g=cook_cupcake#cook_cupcake');await p.waitForTimeout(900);cv=await p.$('canvas.board');await at(380,388);await p.waitForTimeout(1800);await at(200,498);await at(55,132);await at(80,217);await at(140,307);await p.waitForTimeout(4000);await S('cc_bake');await p.waitForTimeout(3500);await at(140,307);await at(530,132);const bb=await cv.boundingBox();await p.mouse.move(bb.x+575/960*bb.width,bb.y+258/620*bb.height);await p.mouse.down();await p.waitForTimeout(1800);await p.mouse.up();await at(540,374);await at(620,374);await S('cc_dec');
console.log(errs.join('|')||'ok');await b.close()})();
