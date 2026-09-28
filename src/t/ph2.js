const {chromium}=require(process.env.PW);const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const errs=[];
const open=async id=>{const p=await b.newPage({viewport:{width:1100,height:800}});p.on('pageerror',e=>errs.push(id+': '+e.message));await p.route('**/matter.min.js',r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/matter-js/build/matter.min.js'),contentType:'application/javascript'}));await p.route(/fonts\.|three/,r=>r.abort());await p.goto('file://'+process.argv[2]+'#'+id);await p.waitForTimeout(1500);return p};
const cvXY=async(p,x,y)=>{const r=await p.$eval('canvas.board',c=>{const b=c.getBoundingClientRect();return{l:b.left,t:b.top,w:b.width,h:b.height}});return[r.l+x/960*r.w,r.t+y/600*r.h]};
let p=await open('ph_castle');
for(let shot=0;shot<3;shot++){let [sx,sy]=await cvXY(p,140,450);await p.mouse.move(sx,sy);await p.mouse.down();let [ex,ey]=await cvXY(p,40,500);await p.mouse.move(ex,ey,{steps:5});await p.mouse.up();await p.waitForTimeout(shot==1?600:3500);if(shot==1){await p.mouse.click(sx+300,sy-200);await p.waitForTimeout(3000)}}
await p.screenshot({path:process.argv[3]+'_castle.png'});console.log(await p.$eval('.stat',e=>e.textContent));
p=await open('ph_tnt');
for(const [x,y] of [[480,540],[430,470],[530,400]]){const [a,bb]=await cvXY(p,x,y);await p.mouse.click(a,bb);await p.waitForTimeout(100)}
await p.screenshot({path:process.argv[3]+'_tnt0.png'});await p.click('text=Detonate');await p.waitForTimeout(8000);await p.screenshot({path:process.argv[3]+'_tnt1.png'});
p=await open('ph_dummy');{const [a,bb]=await cvXY(p,480,300);await p.mouse.move(a,bb);await p.mouse.down();const [c2,d2]=await cvXY(p,850,120);await p.mouse.move(c2,d2,{steps:4});await p.waitForTimeout(150);await p.mouse.up();await p.waitForTimeout(3000);await p.screenshot({path:process.argv[3]+'_dummy.png'});console.log(await p.$eval('.stat',e=>e.textContent))}
console.log(errs.join('\n')||'no errors');await b.close()})();
