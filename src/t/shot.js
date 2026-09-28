const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const ids=fs.readFileSync(__dirname+'/ids.txt','utf8').trim().split('\n');
for(const id of ids){const p=await b.newPage({viewport:{width:1100,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await p.route(/fonts\./,r=>r.abort());
await p.addInitScript(()=>{try{localStorage.setItem('unb_bday',JSON.stringify('2012-05-14'))}catch(e){}});
await p.goto('file://'+process.argv[2]+'?g='+id+'#'+id);await p.waitForTimeout(1500);
await p.waitForTimeout(2500);
await p.screenshot({path:__dirname+'/s/i_'+id+'.png',fullPage:false});console.log(id.padEnd(15),errs.slice(0,2).join(' || ')||'ok');await p.close()}await b.close()})();
