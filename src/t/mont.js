const {chromium}=require(process.env.PW);const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1500,height:900}});
const ids=process.argv[3].split(',');const imgs=ids.map(i=>'data:image/png;base64,'+fs.readFileSync(process.argv[2]+'_'+i+'.png').toString('base64'));
await p.setContent('<body style="margin:0;display:grid;grid-template-columns:repeat(3,500px)">'+imgs.map(s=>'<img src="'+s+'" style="width:500px;height:300px;object-fit:cover">').join('')+'</body>');await p.waitForTimeout(300);await p.screenshot({path:process.argv[4]});await b.close()})();
