// drive Neon Harbor missions via hooks + fast sim
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:900,height:600}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
await p.route(/fonts\.|google/,r=>r.abort());await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await require('./route')(p);
await p.goto('https://detour.test/#hollow');await p.waitForFunction(()=>window.__HL,null,{timeout:60000});await p.waitForTimeout(1500);
await p.evaluate(()=>{document.querySelector('.bk-menu .bk-btn.pri').click()});await p.waitForTimeout(300);
const r=await p.evaluate(async()=>{const N=__HL,K=N.K,log=[];const V=K.V3;const skip=()=>{let g=0;while(K.DQ.cur&&g++<50)document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}))};const run=n=>{for(let i=0;i<n;i++){skip();N.sim(1)}};const st=()=>N.tick().goal+' | inside '+N.tick().inside;
 const useAt=(pos,lbl)=>{N.P.pos.set(pos.x,pos.y!=null?pos.y:N.P.pos.y,pos.z);run(3);const cp=K.camera.position;N.P.yaw=Math.atan2(-(pos.x-N.P.pos.x),-(pos.z-N.P.pos.z));run(2);const t=N.findTarget();log.push((lbl||'')+' target: '+(t?t.text:'none'));if(t)t.fn();run(3)};
 try{N.P.god=1;run(10);log.push(st());
 // axe
 const ax=N.WITEMS.find(i=>i.t==='axe');N.P.pos.set(ax.pos.x+1.2,ax.pos.y,ax.pos.z);N.P.yaw=Math.atan2(1,0)*1;N.P.pitch=-.6;run(2);let t=N.findTarget();log.push('axe target '+(t&&t.text));N.give('axe');N.equip('axe');run(3);log.push(st());
 // shelter + fire
 N.give('stick',30);N.give('leaf',30);N.give('rock',10);const b1=N.placeBlueprint('leanto',N.P.pos.clone().add(new V(4,0,0)),0);while(N.BUILT[0]&&!N.BUILT[0].built&&Object.values(b1.need).some(v=>v>0)){const before=JSON.stringify(b1.need);N.take;if(!(function(){for(const k in b1.need){if(b1.need[k]>0&&N.has(k)){N.take(k);b1.need[k]--;return 1}}})())break}N.completeStruct(b1);run(5);log.push(st());
 const b2=N.placeBlueprint('fire',N.P.pos.clone().add(new V(-4,0,0)),0);N.completeStruct(b2);run(5);log.push(st());
 // chop a tree
 const tr=N.TREES.find(q=>q.alive&&Math.hypot(q.x-N.P.pos.x,q.z-N.P.pos.z)<120);N.P.pos.set(tr.x+1.6,tr.y,tr.z);N.P.yaw=Math.atan2(1.6,0);N.P.pitch=0;run(2);const hp0=tr.hp;for(let i=0;i<12&&tr.alive;i++){N.P.swing=null;K.input.fire=true;run(2);K.input.fire=false;run(25)}run(60);log.push('tree alive '+tr.alive+' hp '+hp0+'->'+tr.hp+' logs '+N.WITEMS.filter(i=>i.t==='log').length);
 // teddy
 const td=N.WITEMS.find(i=>i.t==='teddy');N.P.pos.set(td.pos.x+1,td.pos.y,td.pos.z);N.P.yaw=Math.atan2(1,0);N.P.pitch=-.7;run(3);t=N.findTarget();log.push('teddy target '+(t&&t.text));if(t)t.fn();run(5);log.push(st());
 // cave1
 N.P.pos.copy(N.POI.cave1);run(3);t=N.findTarget();log.push('cave target '+(t&&t.text));N.enterInterior('cave1');await new Promise(r=>setTimeout(r,1200));run(5);log.push(st()+' en '+N.EN.filter(e=>e.inside==='cave1').length);
 const I1=N.IN.cave1;for(const it of N.WITEMS.filter(i=>i.t==='rebreather'||i.t==='maxe')){N.P.pos.set(it.pos.x,it.pos.y,it.pos.z+1);N.P.yaw=0;N.P.pitch=-.8;run(3);t=N.findTarget();log.push('item target '+(t&&t.text));if(t)t.fn();run(2)}log.push(st());
 N.P.pos.copy(I1.exit);run(2);t=N.findTarget();log.push('exit '+(t&&t.text));N.leaveInterior();await new Promise(r=>setTimeout(r,1200));run(3);log.push(st());
 // cave2 via water
 N.enterInterior('cave2');await new Promise(r=>setTimeout(r,1200));run(3);const I2=N.IN.cave2;const w=I2.water[3];N.P.pos.set(I2.D.at.x+w[0]*4+2,I2.D.at.y,I2.D.at.z+w[1]*4+2);run(30);log.push('uw '+N.P.uw+' air '+N.P.air.toFixed(2)+' y '+N.P.pos.y.toFixed(1));
 const ca=N.WITEMS.find(i=>i.t==='climbaxe');N.P.pos.set(ca.pos.x,ca.pos.y,ca.pos.z+1);N.P.yaw=0;N.P.pitch=-.8;run(3);t=N.findTarget();log.push('climbaxe '+(t&&t.text));if(t)t.fn();N.leaveInterior();await new Promise(r=>setTimeout(r,1200));run(3);log.push(st());
 // climb
 N.P.pos.copy(N.POI.climb);run(2);t=N.findTarget();log.push('climb '+(t&&t.text));if(t)t.fn();await new Promise(r=>setTimeout(r,1500));run(3);log.push('pos '+N.tick().pos);const kc=N.WITEMS.find(i=>i.t==='keycard');N.P.pos.set(kc.pos.x,kc.pos.y,kc.pos.z+1);N.P.yaw=0;N.P.pitch=-.8;run(3);t=N.findTarget();log.push('keycard '+(t&&t.text));if(t)t.fn();run(3);log.push(st());
 // sinkhole
 N.P.pos.copy(N.POI.rope);run(2);t=N.findTarget();log.push('rope '+(t&&t.text));if(t)t.fn();await new Promise(r=>setTimeout(r,1500));run(3);log.push('pos '+N.tick().pos);N.P.pos.set(N.POI.labDoor.x,N.POI.labDoor.y,N.POI.labDoor.z);N.P.yaw=0;run(3);t=N.findTarget();log.push('door '+(t&&t.text));if(t)t.fn();await new Promise(r=>setTimeout(r,1500));run(5);log.push(st()+' boss '+!!N.IN.lab.boss);
 const boss=N.IN.lab.boss;N.hurtEnemy(boss,5000,null);run(5);log.push(st());const pd=N.IN.lab.podAt;N.P.pos.set(pd.x,pd.y,pd.z+2);N.P.yaw=0;run(3);t=N.findTarget();log.push('pod '+(t&&t.text));if(t)t.fn();run(5);log.push(st());
 N.leaveInterior();await new Promise(r=>setTimeout(r,1200));run(3);N.P.pos.set(N.POI.boat.x,0,N.POI.boat.z);N.P.pos.y=0.5;run(3);t=N.findTarget();log.push('boat '+(t&&t.text));
 }catch(e){log.push('ERR '+e.message+' '+e.stack.split('\n')[1])}return log});
console.log(r.join('\n'));console.log(errs.join('\n')||'no errors');await b.close()})();
