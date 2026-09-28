const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1100,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'?g=cook_pizza#cook_pizza');await p.waitForTimeout(1000);const cv=await p.$('canvas.board');
const at=async(X,Y)=>{const bb=await cv.boundingBox();await p.mouse.click(bb.x+X/960*bb.width,bb.y+Y/620*bb.height);await p.waitForTimeout(120)};
const drag=async(x1,y1,x2,y2)=>{const bb=await cv.boundingBox();const f=(X,Y)=>[bb.x+X/960*bb.width,bb.y+Y/620*bb.height];await p.mouse.move(...f(x1,y1));await p.mouse.down();await p.mouse.move(...f(x2,y2),{steps:6});await p.mouse.up();await p.waitForTimeout(120)};
await at(380,388);await p.waitForTimeout(2500);await p.screenshot({path:__dirname+'/s/pz1.png'});await at(190,508);await p.waitForTimeout(300);
// toppings: place 6 pieces with first tool on both halves
for(let i=0;i<6;i++)await at(300+(i%3)*50,300+Math.floor(i/3)*60);await at(14+42,80+35);for(let i=0;i<5;i++)await at(420+(i%3)*40,300+Math.floor(i/3)*60);
await p.screenshot({path:__dirname+'/s/pz2.png'});await at(645,565);await p.waitForTimeout(13000);await p.screenshot({path:__dirname+'/s/pz3.png'});await at(40+80+80,110+310+23);await p.waitForTimeout(300);
await drag(160,350,560,350);await drag(360,150,360,550);await drag(220,210,500,490);await drag(500,210,220,490);await p.screenshot({path:__dirname+'/s/pz4.png'});await at(645,565);await p.waitForTimeout(600);await p.screenshot({path:__dirname+'/s/pz5.png'});
console.log(errs.join('|')||'ok');await b.close()})();
