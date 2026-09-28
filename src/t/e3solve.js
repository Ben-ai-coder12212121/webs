const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const plans={study:[['act','Persian rug'],['w',900],['act','Brass key'],['act','Desk drawer'],['w',900],['act','UV torch'],['act','Painting'],['act','Wall safe'],['type','7294'],['w',1200],['act','Fuse'],['act','Fuse box'],['act','Door keypad'],['type','1040'],['w',2500]],
 sub:[['act','Toolbox'],['w',700],['act','Wrench'],['act','Locker'],['w',900],['act','Fuse'],['act','Breaker panel'],['switch'],['w',1200],['act','Hatch lock panel'],['colors'],['w',900],['act','Escape hatch'],['w',3500]],
 cabin:[['act','Wool coat'],['w',1200],['close'],['act','Iron stove'],['w',5500],['act','Lever 1'],['w',300],['act','Lever 4'],['w',1600],['act','Chest'],['dial','324'],['w',1200],['act','Iron key'],['act','Front door'],['w',2500]]};
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
for(const R of Object.keys(plans)){const p=await b.newPage({viewport:{width:800,height:500}});p.on('pageerror',e=>console.log('ERR',R,e.message));
await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await p.route('https://detour.test/**',r=>r.fulfill({body:fs.readFileSync(__dirname+'/../srv/test.html'),contentType:'text/html'}));
await p.addInitScript(()=>{window.__GS_TEST=1});await p.goto('https://detour.test/#e3_'+R);await p.waitForFunction(()=>window.__E3,null,{timeout:60000});await p.evaluate(()=>__E3.closePanel());
for(const s of plans[R]){if(s[0]==='w')await p.waitForTimeout(s[1]);else if(s[0]==='act'){let ok='UNCLICKABLE '+s[1];const n=await p.evaluate(n=>{const o=__E3.objs.find(o=>o.name===n);if(!o)return -1;const T=THREE,bx=new T.Box3();o.meshes.forEach(m=>bx.expandByObject(m));const c=bx.getCenter(new T.Vector3());window.__tgt={o,c};return 1},s[1]);if(n<0)ok='MISSING '+s[1];
      else for(let k=0;k<16&&ok!=='ok';k++){const hit=await p.evaluate(k=>{const{o,c}=window.__tgt,P=__E3.P;const a=k/16*Math.PI*2,d=k<8?1.3:.8;P.x=c.x+Math.cos(a)*d;P.z=c.z+Math.sin(a)*d;const dx=c.x-P.x,dz=c.z-P.z;P.yaw=Math.atan2(-dx,-dz);P.pitch=Math.atan2(c.y-1.62,Math.hypot(dx,dz));return 1},k);await p.waitForTimeout(90);if(await p.evaluate(()=>__E3.hov===window.__tgt.o)){await p.evaluate(()=>__E3.interact());ok='ok'}}
      if(ok!=='ok')console.log(R,ok);await p.waitForTimeout(250)}
  else if(s[0]==='type'){for(const ch of s[1]){await p.keyboard.press(ch);await p.waitForTimeout(60)}await p.keyboard.press('Enter')}
  else if(s[0]==='close')await p.evaluate(()=>__E3.closePanel());
  else if(s[0]==='switch'){// brute force lights-out by clicking
    for(let t=0;t<40;t++){const st=await p.evaluate(()=>[...document.querySelectorAll('.e3-sw button')].map(b=>b.classList.contains('on')));if(!st.length||st.every(x=>x))break;// greedy: click switch i+1 for each off i
      const i=st.findIndex(x=>!x);const idx=Math.min(st.length-1,i+1);await p.evaluate(i=>document.querySelectorAll('.e3-sw button')[i].click(),i===st.length-1?i:idx);await p.waitForTimeout(80)}}
  else if(s[0]==='colors'){const seq=await p.evaluate(()=>__E3.R.seq);for(const k of seq){await p.evaluate(k=>document.querySelectorAll('.e3-colors button')[k].click(),k);await p.waitForTimeout(80)}}
  else if(s[0]==='dial'){for(let i=0;i<s[1].length;i++){for(let k=0;k<+s[1][i];k++){await p.evaluate(i=>document.querySelectorAll('.e3-dials div')[i].querySelector('button').click(),i);await p.waitForTimeout(30)}}}}
const res=await p.evaluate(()=>document.querySelector('.e3-ov.on h2')&&document.querySelector('.e3-ov.on h2').textContent);console.log(R,'->',res,'stage',await p.evaluate(()=>__E3.R.stage),'inv',await p.evaluate(()=>__E3.inv.map(i=>i.id).join()));await p.screenshot({path:'s/e3end_'+R+'.png'});await p.close()}
await b.close()})();
