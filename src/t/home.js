const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1100,height:1400}});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(800);const g=await p.$('#grid');await g.scrollIntoViewIfNeeded();await p.screenshot({path:__dirname+'/s/home_top.png',clip:await (async()=>{const bb=await g.boundingBox();return{x:0,y:bb.y-20,width:1100,height:700}})()});
console.log(await p.$$eval('#grid .tile b',a=>a.slice(0,4).map(e=>e.textContent)).then(x=>x.join(' | ')),errs.join('|')||'ok');await b.close()})();
