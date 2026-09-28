// drive Neon Harbor missions via hooks + fast sim
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:900,height:600}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
await p.route(/fonts\.|google/,r=>r.abort());await p.route(/cdnjs.*three/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
await require('./route')(p);
await p.goto('https://detour.test/#neonharbor');await p.waitForFunction(()=>window.__NH,null,{timeout:60000});await p.waitForTimeout(1500);
await p.evaluate(()=>{document.querySelector('.bk-menu .bk-btn.pri').click()});await p.waitForTimeout(300);
const r=await p.evaluate(async()=>{const N=__NH,K=N.K,log=[];const skip=()=>{let g=0;while(K.DQ.cur&&g++<50){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}))}};
  const run=(n)=>{for(let i=0;i<n;i++){skip();N.sim(1)}};const M=()=>N.MISSION.active;const st=()=>M()?M().def.name+'#'+M().step+' '+(M().obj||''):'none m='+N.MISSION.i;
  const goCar=(car,x,z,yaw)=>{car.pos.set(x,0,z);car.vf=0;car.vl=0;if(yaw!=null)car.yaw=yaw};
  const tele=(v)=>{if(N.ME.car){goCar(N.ME.car,v.x,v.z)}else N.tele(v.x,v.z)};
  try{N.ME.god=1;N.INTRO.end();run(5);log.push(st());
  // M1
  tele(N.PL.garage.pos);run(10);log.push(st());const c1=M().car;N.enterCar(c1);run(5);log.push(st());tele({x:N.PL.diner.pos.x,z:N.PL.diner.pos.z-3});run(10);log.push(st());run(10);log.push(st());
  // M2
  N.exitCar(true);N.tele(N.PL.diner.pos.x,N.PL.diner.pos.z);run(10);log.push(st());const c2=M().car;N.tele(c2.pos.x+2,c2.pos.z);N.enterCar(c2);run(5);log.push(st()+' lvl'+N.WANT.lvl);N.WANT.lvl=0;N.WANT.heat=0;tele(N.PL.garage.car);run(10);log.push(st());run(10);log.push(st());
  // M3
  N.tele(N.PL.garage.pos.x,N.PL.garage.pos.z);run(10);log.push(st());for(let k=0;k<3;k++){const b2=M().cur.blip(M());N.tele(b2.x,b2.z);run(8);log.push(st())}
  run(60);log.push(st());const v=M().v;M().car.hp=1;run(3);log.push('inCar '+!!v.inCar+' st '+v.state+' d2car '+v.pos.distanceTo(M().car.pos).toFixed(1)+' hp '+v.hp+' pos '+v.pos.toArray().map(q=>q.toFixed(1)));if(v){v.hp=1;const o=v.pos.clone().add(new N.K.V3(0.01,2.6,0.01));const rr=N.fireRay(o,v.pos.clone().add(new N.K.V3(0,1.2,0)).sub(o).normalize(),N.WPN.rifle,'player',o);log.push('hit '+(rr&&rr.kind)+' '+v.hp)}run(5);log.push(st()+' vdead '+(v&&v.dead));if(M()&&M().bag){const bp=M().bag.m.position;N.tele(bp.x,bp.z)}run(10);log.push(st());N.tele(N.PL.garage.pos.x,N.PL.garage.pos.z);run(10);log.push(st());run(5);log.push(st());
  // M4
  N.tele(N.PL.diner.pos.x,N.PL.diner.pos.z);run(10);log.push(st());N.tele(N.PL.kings.pos.x,N.PL.kings.pos.z);run(10);log.push(st());(M().kill||[]).forEach(p=>{p.hp=1;N.K&&0;p.dead||(p.hp=0)});M().kill.forEach(p=>{if(!p.dead){p.hp=-1;p.dead=true}});run(5);log.push(st());N.WANT.lvl=0;N.WANT.heat=0;run(5);log.push(st());N.tele(N.PL.diner.pos.x,N.PL.diner.pos.z);run(10);log.push(st());run(5);log.push(st());
  // M5
  N.tele(N.PL.garage.pos.x,N.PL.garage.pos.z);run(10);log.push(st());N.enterCar(M().car);run(3);log.push(st());const bk=M().cur.blip(M());goCar(N.ME.car,bk.x,bk.z);run(10);log.push(st());run(500);log.push(st()+' lvl'+N.WANT.lvl);N.WANT.lvl=0;N.WANT.heat=0;run(5);log.push(st());goCar(N.ME.car,N.PL.garage.car.x,N.PL.garage.car.z);run(10);log.push(st());run(5);log.push(st());
  // M6
  N.exitCar(true);N.tele(N.PL.police.pos.x+3,N.PL.police.pos.z+60);run(3);log.push('giver '+N.MS[N.MISSION.i].giver);const hb=N.MISSION.i;
  const gp=N.K.V3?null:null;N.startMission(N.MISSION.i);run(10);log.push(st());N.tele(N.PL.ship.gang.x,N.PL.ship.gang.z);run(10);log.push(st());N.ME.pos.copy(N.PL.ship.bomb);N.ME.pos.x+=1;N.K.input.keys.e=true;run(90);N.K.input.keys.e=false;log.push(st());N.tele(-20,150);run(20);log.push(st());run(800);log.push(st());run(10);log.push(st());
  // M7 race
  N.startMission(N.MISSION.i);run(10);log.push(st());N.enterCar(M().car);run(3);const sl=M().cur.blip(M());goCar(N.ME.car,sl.x,sl.z,Math.PI/2);run(10);log.push(st());run(120);log.push(st());
  for(let k=0;k<12;k++){const cp=M()&&M().cps&&M().cps[M().cpi];if(!cp)break;goCar(N.ME.car,cp.x,cp.z);run(2)}log.push(st()+' place '+(M()?M().place:'-'));run(10);log.push(st());
  // M8
  N.exitCar(true);N.startMission(N.MISSION.i);run(10);log.push(st());const d8=M().cur.blip(M());N.tele(d8.x,d8.z);run(10);log.push(st());M().kill.forEach(p=>{p.hp=-1;p.dead=true});run(5);log.push(st());run(200);log.push(st()+' marcoInCar '+!!(M()&&N.PEDS.find(p=>p.name===undefined&&p.hp>=600)));
  const mc=M()&&M().car;if(mc){mc.hp=1;run(5)}const mp=N.PEDS.find(p=>p.maxHp===700);if(mp){mp.hp=-1;mp.dead=true}run(5);log.push(st());const tn=M()&&M().tony;if(tn){N.tele(tn.pos.x+1,tn.pos.z)}run(10);log.push(st());run(10);log.push(st()+' money '+N.ME.money);
  }catch(e){log.push('ERR '+e.message+' @ '+st())}return log});
console.log(r.join('\n'));console.log(errs.join('\n')||'no errors');await b.close()})();
