const {chromium}=require(process.env.PW);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const errs=[];
for(const id of ['io_blob','io_noodle','io_absorb','io_paper']){const p=await b.newPage({viewport:{width:1100,height:800}});p.on('pageerror',e=>errs.push(id+': '+e.message));await p.route(/fonts\./,r=>r.abort());await p.goto('http://localhost:8765/test.html#'+id);await p.waitForTimeout(800);
 const r=await p.$eval('canvas.board',c=>{const b=c.getBoundingClientRect();return{l:b.left,t:b.top,w:b.width,h:b.height}});
 for(let i=0;i<24;i++){await p.mouse.move(r.l+r.w/2+Math.cos(i/3)*250,r.t+r.h/2+Math.sin(i/3)*180);if(id==='io_paper'&&i%4==0)await p.keyboard.press(['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'][(i/4)%4]);await p.waitForTimeout(250)}
 await p.screenshot({path:process.argv[2]+'_'+id+'.png',clip:{x:0,y:60,width:1100,height:640}});console.log(id,await p.$eval('.stat',e=>e.textContent));await p.close()}
console.log(errs.join('\n')||'no errors');await b.close()})();
