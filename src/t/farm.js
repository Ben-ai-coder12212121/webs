const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1100,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=sim_farm#sim_farm');await p.waitForTimeout(800);const cv=await p.$('canvas.board');
const at=async(X,Y,w)=>{const bb=await cv.boundingBox();await p.mouse.click(bb.x+X/960*bb.width,bb.y+Y/620*bb.height);await p.waitForTimeout(w||150)};const T=(i,j,w)=>at(i*40+20,j*40+20,w);
await T(8,6,2500);for(const [i,j] of [[9,6],[8,7],[9,7]])await T(i,j,300);
await p.keyboard.press('3');for(const [i,j] of [[8,6],[9,6],[8,7],[9,7]])await T(i,j,200);
await p.keyboard.press('2');for(const [i,j] of [[8,6],[9,6],[8,7],[9,7]])await T(i,j,200);
await p.screenshot({path:__dirname+'/s/farm_1.png'});
for(let d=0;d<3;d++){await p.keyboard.press('2');for(const [i,j] of [[8,6],[9,6],[8,7],[9,7]])await T(i,j,150);await at(912,590,1900)}
await p.keyboard.press('4');for(const [i,j] of [[8,6],[9,6],[8,7],[9,7]])await T(i,j,200);await p.screenshot({path:__dirname+'/s/farm_2.png'});
await T(6,3,3000);await at(912,590,1900);await p.waitForTimeout(500);await p.screenshot({path:__dirname+'/s/farm_3.png'});
await at(834,590,400);await p.screenshot({path:__dirname+'/s/farm_4.png'});
console.log(errs.join('|')||'ok');await b.close()})();
