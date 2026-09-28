/* ================= traffic AI ================= */
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
function placeOnRoad(car,i,j,d,t){const[dx,dz]=DIRS[d];const A=NODE(i,j),rx=-dz,rz=dx;const s=8+t*(P-16);car.pos.set(A.x+dx*s+rx*3,0,A.z+dz*s+rz*3);car.yaw=Math.atan2(dx,dz);car.ai={node:[i+dx,j+dz],dir:d,wp:[new V3(A.x+dx*(P-8)+rx*3,0,A.z+dz*(P-8)+rz*3)],cruise:rnd(9,13),panic:0,stuckT:0,revT:0,honk:0}}
function aiPlan(car){const a=car.ai;const[i,j]=a.node;const opts=[];for(let d=0;d<4;d++){if(d===(a.dir^1))continue;const n=[i+DIRS[d][0],j+DIRS[d][1]];if(inCity(...n))opts.push(d)}const d=opts.length?pick(opts):(a.dir^1);const N=NODE(i,j);const[dx,dz]=DIRS[d];const rx=-dz,rz=dx;
  a.wp=[new V3(N.x+dx*7+rx*3,0,N.z+dz*7+rz*3)];const N2=NODE(i+dx,j+dz);a.wp.push(new V3(N2.x-dx*8+rx*3,0,N2.z-dz*8+rz*3));a.dir=d;a.node=[i+dx,j+dz]}
function obstacleAhead(car,skip){const fw=cfwd(car),rt=cright(car);let best=99;const look=7+Math.abs(car.vf)*1.3;
  const chk=(p,w)=>{const dx=p.x-car.pos.x,dz=p.z-car.pos.z;const a=dx*fw.x+dz*fw.z;if(a<=0||a>look+car.S.L/2)return;const s=dx*rt.x+dz*rt.z;if(Math.abs(s)<(w||1.9))best=Math.min(best,a-car.S.L/2)};
  for(const o of CARS)if(o!==car&&o!==skip&&Math.abs(o.pos.x-car.pos.x)<32&&Math.abs(o.pos.z-car.pos.z)<32)chk(o.pos,2.1);
  for(const p of PEDS)if(!p.dead&&!p.inCar&&Math.abs(p.pos.x-car.pos.x)<20&&Math.abs(p.pos.z-car.pos.z)<20)chk(p.pos,1.5);
  if(!ME.car&&!ME.dead)chk(ME.pos,1.5);return best}
function seek(car,tp,spd,dt,o){o=o||{};const dx=tp.x-car.pos.x,dz=tp.z-car.pos.z;let want=Math.atan2(dx,dz);let err=angDiff(car.yaw,want);let rev=false;
  if(car.ai.revT>0){car.ai.revT-=dt;carPhys(car,0,1,-Math.sign(err)||1,false,dt);return}
  let tgt=spd*(Math.abs(err)>.6?.45:Math.abs(err)>.3?.75:1);if(!o.ram){const ob=obstacleAhead(car,o.skip);if(ob<99){tgt=Math.min(tgt,Math.max(0,(ob-3)*.9));if(ob<6&&car.police)tgt=Math.max(tgt,4)}}
  const thr=car.vf<tgt?1:0,brk=car.vf>tgt+1.5?1:0;carPhys(car,thr,brk,clamp(err*2.4,-1,1),o.hb&&Math.abs(err)>.8&&car.vf>12,dt);
  if(thr&&Math.abs(car.vf)<.8&&tgt>3){car.ai.stuckT+=dt;if(car.ai.stuckT>1.6){car.ai.stuckT=0;car.ai.revT=1.2}}else car.ai.stuckT=Math.max(0,car.ai.stuckT-dt)}
function stepTraffic(car,dt){const a=car.ai;if(car.dead||!car.driver){carPhys(car,0,car.dead?1:.5,0,false,dt);return}
  if(!a.wp.length)aiPlan(car);const w=a.wp[0];if(Math.hypot(w.x-car.pos.x,w.z-car.pos.z)<4){a.wp.shift();if(!a.wp.length)aiPlan(car)}
  let spd=a.cruise;if(a.panic>0){a.panic-=dt;spd=a.cruise*2.3}
  seek(car,a.wp[0],spd,dt,{});
  if(car.vf<.5&&a.panic<=0){a.honk+=dt;if(a.honk>2.5&&ME.car&&ME.car.pos.distanceTo(car.pos)<10){a.honk=-3;horn(car.pos)}}else a.honk=0}
function horn(pos){K.snd({pos,tone:392,tdur:.45,wave:'square',tvol:.25,vol:.35,range:60});K.snd({pos,tone:494,tdur:.45,wave:'square',tvol:.2,vol:.3,range:60})}
/* driver seat */
function seatOf(car){const sh=car.S.sh;return sh==='truck'?new V3(.45,.95,2.9):sh==='van'?new V3(.42,.62,1.05):sh==='super'||sh==='sport'?new V3(.4,.02,-.35):new V3(.4,.18,-.25)}
function seatPed(p,car){p.inCar=car;car.driver={ped:p};car.mesh.add(p.ch.g);p.ch.g.position.copy(seatOf(car));p.ch.g.rotation.set(0,0,0);K.pose(p.ch,'drive',1,0,{})}
function unseatPed(p,side){const car=p.inCar;if(!car)return;car.mesh.remove(p.ch.g);scene.add(p.ch.g);p.inCar=null;if(car.driver&&car.driver.ped===p)car.driver=null;const rt=cright(car);const s=side||-1;p.pos.set(car.pos.x-rt.x*(car.S.Wd/2+.7)*s,0,car.pos.z-rt.z*(car.S.Wd/2+.7)*s);p.pos.y=K.groundAt(p.pos.x,p.pos.z,car.pos.y+1,.3);p.yaw=car.yaw}
function spawnTraffic(i,j,d,t,type){const car=spawnCar(type||pick(TRAFFIC_MIX),0,0,0);placeOnRoad(car,i,j,d,t);car.pos.y=0;const p=spawnPed(type==='police'?'cop':'civ',car.pos.x,car.pos.z,{state:'drive'});seatPed(p,car);syncCar(car,0);return car}
/* ================= NPC behaviour ================= */
const eyeOf=p=>new V3(p.pos.x,p.pos.y+1.55,p.pos.z);
function mePos(){return ME.car?ME.car.pos:ME.pos}
function meEye(){const p=mePos();return new V3(p.x,p.y+(ME.car?1.1:1.5),p.z)}
function moveChar(p,dir,spd,dt){if(spd<=0)return;const want=Math.atan2(dir.x,dir.z);p.yaw+=angDiff(p.yaw,want)*Math.min(1,dt*9);const ox=p.pos.x,oz=p.pos.z;p.pos.x+=dir.x*spd*dt;p.pos.z+=dir.z*spd*dt;K.collide(p.pos,.34,p.pos.y,1.7);const g=K.groundAt(p.pos.x,p.pos.z,p.pos.y,.2);p.pos.y=g>p.pos.y+.5?p.pos.y:g;p.moved=Math.hypot(p.pos.x-ox,p.pos.z-oz)/(spd*dt+1e-6)}
function followTo(p,target,spd,dt){const dx=target.x-p.pos.x,dz=target.z-p.pos.z,d=Math.hypot(dx,dz);if(d<.05)return d;
  if(p.path&&p.path.length){const w=p.path[0];const wx=w.x-p.pos.x,wz=w.z-p.pos.z,wd=Math.hypot(wx,wz);if(wd<.8)p.path.shift();else{moveChar(p,new V3(wx/wd,0,wz/wd),spd,dt);return d}if(p.pathT>0){p.pathT-=dt;return d}}
  moveChar(p,new V3(dx/d,0,dz/d),spd,dt);if(p.moved<.35){p.blockT=(p.blockT||0)+dt;if(p.blockT>.5){p.blockT=0;p.path=K.astar(p.pos.x,p.pos.z,target.x,target.z,3000);p.pathT=3}}else p.blockT=0;return d}
function npcShoot(p,dt,d){const W=WPN[p.wpn];if(!W||W.melee||p.cool>0)return;const e=eyeOf(p);const tgt=meEye();tgt.y-=.3;if(!K.los(e,tgt))return;const burst=W.auto?(p.burst=(p.burst||0)+1):0;p.cool=W.auto?(burst%6===0?rnd(.9,1.6):W.rate*1.6):Math.max(.45,W.rate*2.2)*rnd(.9,1.5);
  const mvPen=(ME.car?Math.abs(ME.car.vf)*.004:ME.spd*.006);const spread=(.035+d*.0012+mvPen)/p.acc;const n=W.pel||1;const hand=new V3(p.pos.x+Math.sin(p.yaw)*.5,p.pos.y+1.38,p.pos.z+Math.cos(p.yaw)*.5);
  for(let k=0;k<n;k++){const dir=tgt.clone().sub(hand).normalize();dir.x+=rnd(-spread,spread);dir.y+=rnd(-spread,spread)*.7;dir.z+=rnd(-spread,spread);dir.normalize();fireRay(hand,dir,W,p,hand)}K.SFX.gun(W.snd,hand);K.flash(hand,0xffc060,6,8,.06);K.burst(hand.x,hand.y,hand.z,4,2,.08,.12,.02,0xffe0a0,0xff8000,1,0,5);scare(p.pos,22)}
function stepPed(p,dt){const C=p.ch;
  if(p.inCar){return}
  if(p.dead){p.deadT+=dt;if(p.fly){p.fly.y-=20*dt;p.pos.addScaledVector(p.fly,dt);const g=K.groundAt(p.pos.x,p.pos.z,p.pos.y+.5,.2);if(p.pos.y<g){p.pos.y=g;p.fly.multiplyScalar(.4);p.fly.y=Math.abs(p.fly.y)*.3;if(p.fly.length()<1)p.fly=null}}C.g.position.copy(p.pos);K.ragdoll(C,null,dt);return}
  p.cool-=dt;if(p.act){p.actK+=dt*(p.act==='hit'?4:2.6);if(p.actK>=1)p.act=null}
  const mp=mePos(),dme=p.pos.distanceTo(mp);let spd=0,up=null,st='idle';
  const hostile=p.team==='gang'&&(p.alert||(GANG.hostile&&p.home&&dme<16)||(p.aggro&&dme<p.aggro))||p.team==='cop'&&WANT.lvl>=2&&p.state!=='leave'||p.state==='attack';
  if(hostile&&!ME.dead&&p.state!=='flee'&&p.state!=='goto'){p.state='attack'}
  if(p.team==='cop'&&WANT.lvl===1&&p.state!=='leave'&&p.state!=='dead')p.state='arrest';
  switch(p.state){
    case'walk':{if(!p.goal)attachWalk(p);const d=Math.hypot(p.goal.x-p.pos.x,p.goal.z-p.pos.z);if(d<.6)nextCorner(p);else{spd=p.walkSpd;moveChar(p,new V3((p.goal.x-p.pos.x)/d,0,(p.goal.z-p.pos.z)/d),spd,dt);if(p.moved<.2){p.stuckW=(p.stuckW||0)+dt;if(p.stuckW>3){p.stuckW=0;nextCorner(p)}}}break}
    case'flee':{p.t-=dt;const away=p.pos.clone().sub(p.threat||mp).setY(0);if(away.lengthSq()<.01)away.set(1,0,0);away.normalize();spd=5.6;moveChar(p,away,spd,dt);if(p.moved<.3){p.fleeTurn=(p.fleeTurn||1);const a2=new V3(-away.z*p.fleeTurn,0,away.x*p.fleeTurn);moveChar(p,a2,spd,dt);if(Math.random()<.02)p.fleeTurn*=-1}if(p.t<=0)attachWalk(p);break}
    case'cower':{p.t-=dt;st='cower';if(p.t<=0){p.state='flee';p.t=6}break}
    case'fight':{p.t=(p.t||10)-dt;if(ME.car||p.t<=0){attachWalk(p);break}if(dme>1.3){spd=4.6;followTo(p,mp,spd,dt)}else{p.yaw+=angDiff(p.yaw,Math.atan2(mp.x-p.pos.x,mp.z-p.pos.z))*Math.min(1,dt*8);if(p.cool<=0){p.cool=rnd(.8,1.3);p.act=pick(['punchR','punchL','hook']);p.actK=0;setTimeout(()=>{if(!p.dead&&!ME.car&&p.pos.distanceTo(ME.pos)<1.6){hurtMe(6,p);K.SFX.punch(ME.pos)}},180)}}up='guard';break}
    case'attack':{const W=WPN[p.wpn]||WPN.fist;if(ME.dead){p.state=p.home?'idle':'walk';break}
      if(W.melee){if(dme>W.range*.8){spd=5.2;followTo(p,mp,spd,dt)}else{p.yaw+=angDiff(p.yaw,Math.atan2(mp.x-p.pos.x,mp.z-p.pos.z))*Math.min(1,dt*8);if(p.cool<=0){p.cool=rnd(.9,1.4);p.act=W===WPN.bat?'slashR':'punchR';p.actK=0;setTimeout(()=>{if(!p.dead&&mePos().distanceTo(p.pos)<W.range+.4){if(ME.car)carDamage(ME.car,W.dmg*.3);else hurtMe(W.dmg*.45*p.dmgMul,p);K.SFX.punch(mePos())}},220)}}up=W===WPN.bat?'sword':'guard'}
      else{const pref=p.wpn==='shotgun'?8:p.wpn==='sniper'?60:16;const hasLos=(p.losT=(p.losT||0)-dt)<=0?(p.losT=.3,p.los=K.los(eyeOf(p),meEye())):p.los;
        if(dme>pref||!hasLos){spd=dme>30?5.4:3.6;followTo(p,mp,spd,dt)}else if(dme<pref*.4&&!ME.car){const aw=p.pos.clone().sub(mp).setY(0).normalize();moveChar(p,aw,2,dt);spd=2}
        p.yaw+=angDiff(p.yaw,Math.atan2(mp.x-p.pos.x,mp.z-p.pos.z))*Math.min(1,dt*10);if(hasLos&&dme<W.range*.9)npcShoot(p,dt,dme);up=p.wpn==='pistol'?'aim1':'aim2';C.aimPitch=clamp(Math.atan2((mp.y+1)-(p.pos.y+1.4),dme),-.6,.6)}break}
    case'arrest':{if(ME.dead||WANT.lvl===0){p.state='leave';break}if(ME.car){if(dme>3){spd=5.4;followTo(p,mp,spd,dt)}else if(Math.abs(ME.car.vf)<1.2){ME.bustT+=dt;if(ME.bustT>1.3)busted()}}
      else{if(dme>1.2){spd=dme>6?5.6:3;followTo(p,mp,spd,dt)}else{p.yaw+=angDiff(p.yaw,Math.atan2(mp.x-p.pos.x,mp.z-p.pos.z))*Math.min(1,dt*8);if(ME.spd<2.5){ME.bustT+=dt;if(ME.bustT>1.4)busted()}}}up=dme<8?'aim1':null;break}
    case'leave':{p.t-=dt;const aw=p.pos.clone().sub(mp).setY(0).normalize();spd=1.6;moveChar(p,aw,spd,dt);break}
    case'goto':{if(!p.goal){p.state='idle';break}spd=p.goSpd||1.5;const d=followTo(p,p.goal,spd,dt);if(d<.7){p.goal=null;p.state=p.after||'idle';p.onArrive&&p.onArrive()}break}
    case'patrol':{const r=p.route;if(!r){p.state='idle';break}const w=r[p.ri%r.length];spd=1.3;const d=followTo(p,w,spd,dt);if(d<.6)p.ri=(p.ri||0)+1;up=p.wpn&&!WPN[p.wpn].melee?'carry':null;if(dme<22&&K.los(eyeOf(p),meEye())&&(!p.stealthy||dme<9)){p.alert=1;p.state='attack'}break}
    case'idle':default:{if(p.home&&p.pos.distanceTo(p.home)>3){spd=1.4;followTo(p,p.home,spd,dt)}if(p.face!=null&&spd===0)p.yaw+=angDiff(p.yaw,p.face)*Math.min(1,dt*4);if(p.talk)up='phone';break}}
  p.spd=spd;if(st==='idle'){st=spd>6?'sprint':spd>3.2?'run':spd>.3?'walk':'idle'}
  const ex={up,act:p.act,k:p.actK};K.pose(C,st,dt,spd,ex);C.g.position.copy(p.pos);C.g.rotation.y=p.yaw}
/* ================= gangs ================= */
const GANG={hostile:false,spawned:false,members:[],t:0};
function gangAlert(home){for(const p of PEDS)if(p.team==='gang'&&!p.dead&&p.home&&p.home.distanceTo(home)<40){p.alert=1;p.state='attack'}}
function stepGang(dt){GANG.t-=dt;if(GANG.t>0)return;GANG.t=1;const k=PL.kings,d=mePos().distanceTo(k.c);if(MISSION.active&&MISSION.active.ownsKings)return;
  if(d<110&&!GANG.spawned){GANG.spawned=true;GANG.members=[];for(let i=0;i<6;i++){const x=rnd(k.x0+14,k.x1-3),z=rnd(k.z0+3,k.z1-4);const p=spawnPed('gang',x,z,{state:'idle',persist:true,home:new V3(x,.2,z)});p.face=rnd(0,TWO);if(i<2)p.talk=1;GANG.members.push(p)}}
  if(d>160&&GANG.spawned){GANG.members.forEach(p=>removePed(p));GANG.members=[];GANG.spawned=false}}
/* ================= police ================= */
const POL={t:0,losT:0,seen:false,heli:null,sirenL:null};
function stepCopCar(car,dt){const a=car.ai;const mp=mePos();const d=car.pos.distanceTo(mp);car.siren=WANT.lvl>0;
  if(WANT.lvl===0){a.chase=false;if(!a.wp||!a.wp.length){a.node=nearestNode(car.pos.x,car.pos.z);a.dir=0;aiPlan(car)}stepTraffic(car,dt);return}
  if(a.deployed){carPhys(car,0,1,0,false,dt);return}
  a.replan=(a.replan||0)-dt;if(a.replan<=0){a.replan=1.3;a.direct=d<38&&K.los(new V3(car.pos.x,car.pos.y+1,car.pos.z),meEye());if(!a.direct){const r=routeNodes(nearestNode(car.pos.x,car.pos.z),nearestNode(mp.x,mp.z));a.wp=r.slice(1).map(n=>NODE(...n))}}
  if(!a.direct&&a.wp&&a.wp.length&&car.pos.distanceTo(a.wp[0])<7)a.wp.shift();
  const tgt=a.direct||!a.wp||!a.wp.length?mp:a.wp[0];
  if(!ME.car&&d<16&&a.direct){carPhys(car,0,1,0,false,dt);if(Math.abs(car.vf)<3)deployCops(car);return}
  seek(car,tgt,car.S.max*(WANT.lvl>=3?1:.85),dt,{ram:a.direct&&!!ME.car,hb:true,skip:ME.car})}
function deployCops(car){const a=car.ai;a.deployed=true;car.siren=true;const n=car.type==='swat'?4:2;if(car.driver&&car.driver.ped){const p=car.driver.ped;unseatPed(p,-1);p.state=WANT.lvl>=2?'attack':'arrest'}for(let i=1;i<n;i++){const rt=cright(car),fw=cfwd(car);const p=spawnPed(car.type==='swat'?'swat':'cop',car.pos.x+rt.x*(car.S.Wd/2+.8)+fw.x*(i-1),car.pos.z+rt.z*(car.S.Wd/2+.8)+fw.z*(i-1),{state:WANT.lvl>=2?'attack':'arrest'});p.yaw=car.yaw}car.driver=null}
function spawnCopCar(){const mp=mePos();for(let tries=0;tries<30;tries++){const i=Math.floor(rnd(0,NB+1)),j=Math.floor(rnd(0,NB+1)),d=Math.floor(rnd(0,4));const[dx,dz]=DIRS[d];if(!inCity(i+dx,j+dz))continue;const t=rnd(0,1);const s=8+t*(P-16);const x=RX(i)+dx*s,z=RX(j)+dz*s;const dd=Math.hypot(x-mp.x,z-mp.z);if(dd<75||dd>150)continue;
    const type=WANT.lvl>=4&&Math.random()<.4?'swat':'police';const car=spawnTraffic(i,j,d,t,type);car.driver.ped.kind=type==='swat'?'swat':'cop';car.driver.ped.team='cop';car.ai.chase=true;car.ai.replan=0;car.siren=true;return car}return null}
function mkHeli(){const g=new T.Group();const bm=mat('heli','#1a2a4a',{metalness:.4,roughness:.4});const b=new T.Mesh(new T.SphereGeometry(1.6,14,10),bm);b.scale.set(1,.9,1.6);g.add(b);const tail=new T.Mesh(new T.CylinderGeometry(.25,.4,5,8),bm);tail.rotation.x=PI/2;tail.position.set(0,.3,-3.6);g.add(tail);const gw=new T.Mesh(new T.SphereGeometry(1.2,12,8,0,TWO,0,1.2),mGlass);gw.position.set(0,.2,1.2);gw.rotation.x=1.2;g.add(gw);
  const rotor=new T.Group();for(let i=0;i<2;i++){const bl=new T.Mesh(new T.BoxGeometry(9,.05,.3),mDark);bl.rotation.y=i*PI/2;rotor.add(bl)}rotor.position.y=1.6;g.add(rotor);const tr=new T.Mesh(new T.BoxGeometry(.05,1.6,.2),mDark);tr.position.set(.3,.6,-6);g.add(tr);[-1,1].forEach(s=>{const sk=new T.Mesh(new T.BoxGeometry(.1,.1,3),mDark);sk.position.set(s*.9,-1.5,0);g.add(sk)});
  const spot=new T.SpotLight(0xffffff,0,90,.28,.5,1);spot.position.set(0,-1,1);g.add(spot);g.add(spot.target);scene.add(g);const H2={g,rotor,tr,spot,pos:new V3(mePos().x+80,40,mePos().z+80),hp:500,alive:true,t:0,cool:3,yaw:0,fall:null};
  H2.xt={ray:(o,d,maxD)=>{const oc=o.clone().sub(H2.g.position);const b=oc.dot(d),cc=oc.lengthSq()-2.4*2.4;const disc=b*b-cc;if(disc<0)return null;const t=-b-Math.sqrt(disc);return t>0&&t<maxD?{t}:null},hurt:dm=>{H2.hp-=dm;if(H2.hp<=0&&!H2.fall){H2.fall=1;addHeat(60,H2.pos)}}};XT.push(H2.xt);return H2}
const XT=[];
function stepHeli(dt){let H2=POL.heli;if(WANT.lvl>=4&&(!H2||!H2.alive)){if(!H2||H2.gone)POL.heli=H2=mkHeli()}if(!H2)return;const mp=mePos();H2.t+=dt;H2.rotor.rotation.y+=dt*28;
  if(H2.fall){H2.pos.y-=dt*12;H2.g.rotation.y+=dt*4;K.burst(H2.pos.x,H2.pos.y,H2.pos.z,2,1,1.5,.8,2,0x3a3632,0x111111,.7,-2,1,K.SM);if(H2.pos.y<=K.groundAt(H2.pos.x,H2.pos.z,50,1)+1){explode(H2.pos.clone(),10,250,'player');scene.remove(H2.g);H2.alive=false;H2.gone=true;XT.splice(XT.indexOf(H2.xt),1);POL.heli=null;STATS.heli=(STATS.heli||0)+1}H2.g.position.copy(H2.pos);return}
  const leaving=WANT.lvl<4;const tp=leaving?new V3(mp.x+300,60,mp.z+300):new V3(mp.x+Math.cos(H2.t*.25)*26,mp.y+30,mp.z+Math.sin(H2.t*.25)*26);const dv=tp.sub(H2.pos);const L=dv.length();if(L>.1)H2.pos.addScaledVector(dv.normalize(),Math.min(L,22*dt));H2.g.position.copy(H2.pos);const want=Math.atan2(mp.x-H2.pos.x,mp.z-H2.pos.z);H2.yaw+=angDiff(H2.yaw,want)*dt*2;H2.g.rotation.set(.12,H2.yaw,0);
  H2.spot.intensity=night>.3?30:0;H2.spot.target.position.set(0,-30,6);if(leaving&&H2.pos.distanceTo(mp)>250){scene.remove(H2.g);XT.splice(XT.indexOf(H2.xt),1);POL.heli=null;return}
  if(!leaving){H2.cool-=dt;if(H2.cool<=0){H2.burst=(H2.burst||0)+1;H2.cool=H2.burst%5===0?2.6:.13;const o=H2.pos.clone().add(new V3(0,-1.6,0));const tg=meEye();const dir=tg.sub(o).normalize();const sp2=.05;dir.x+=rnd(-sp2,sp2);dir.z+=rnd(-sp2,sp2);dir.normalize();fireRay(o,dir,WPN.rifle,{dmgMul:.7},o);K.SFX.gun('rifle',o)}}
  const hs=K.loops;POL.heliL=POL.heliL||K.loop({noise:1,f:220,ft:'lowpass'});if(POL.heliL)POL.heliL.set(clamp(1-H2.pos.distanceTo(camera.position)/140,0,1)*.35)}
function stepPolice(dt){POL.losT-=dt;const mp=mePos();if(POL.losT<=0){POL.losT=.3;let seen=false;const me=meEye();for(const p of PEDS){if(p.team!=='cop'||p.dead||p.inCar||p.state==='leave')continue;if(p.pos.distanceTo(mp)<55&&K.los(eyeOf(p),me)){seen=true;break}}
    if(!seen)for(const car of CARS){if(!car.police||car.dead||!car.driver)continue;if(car.pos.distanceTo(mp)<48&&K.los(new V3(car.pos.x,car.pos.y+1.2,car.pos.z),me)){seen=true;break}}
    if(!seen&&POL.heli&&POL.heli.alive&&!POL.heli.fall&&Math.hypot(POL.heli.pos.x-mp.x,POL.heli.pos.z-mp.z)<45)seen=true;POL.seen=seen}
  if(WANT.lvl>0){if(POL.seen){WANT.unseen=0;WANT.last.copy(mp)}else{WANT.unseen+=dt;if(WANT.unseen>7+WANT.lvl*4){clearWanted();K.note('You lost the cops.','#6aff6a');STATS.escapes++}}
    POL.t-=dt;if(POL.t<=0){POL.t=2.5;const n=CARS.filter(c=>c.police&&!c.dead&&c.ai&&c.ai.chase&&c.pos.distanceTo(mp)<220).length;const want=[0,1,2,3,4,5][WANT.lvl];if(n<want)spawnCopCar()}}
  stepHeli(dt);
  // siren sound
  let near=1e9;for(const car of CARS)if(car.police&&car.siren&&!car.dead)near=Math.min(near,car.pos.distanceTo(camera.position));if(near<120){if(!POL.sirenL)POL.sirenL=K.loop({wave:'sawtooth',freq:700,f:1600});if(POL.sirenL){const ph=(performance.now()/1000)%1.6;POL.sirenL.set(clamp(1-near/120,0,1)*.1,ph<.8?600+ph*500:1000-(ph-.8)*500)}}else if(POL.sirenL){POL.sirenL.stop();POL.sirenL=null}}
/* ================= world population ================= */
const POP={t:0};
function inView(p){const d=p.clone().sub(camera.position);const L=d.length();if(L>160)return false;const f=new V3();camera.getWorldDirection(f);return d.dot(f)/L>.45}
function managePop(dt){POP.t-=dt;if(POP.t>0)return;POP.t=.4;const mp=mePos();
  for(let i=CARS.length-1;i>=0;i--){const car=CARS[i];if(car===ME.car||car.persist||car.mission)continue;const d=Math.hypot(car.pos.x-mp.x,car.pos.z-mp.z);if(d>210||(car.dead&&d>90&&!inView(car.pos))||(car.police&&WANT.lvl===0&&d>110&&!inView(car.pos)))removeCar(car)}
  for(let i=PEDS.length-1;i>=0;i--){const p=PEDS[i];if(p.persist||p.inCar||p.mission)continue;const d=Math.hypot(p.pos.x-mp.x,p.pos.z-mp.z);if(d>120&&!inView(p.pos)||d>180||(p.dead&&p.deadT>40&&!inView(p.pos))||(p.state==='leave'&&d>50&&!inView(p.pos)))removePed(p)}
  const nT=CARS.filter(c=>c.ai&&!c.police&&c.driver&&!c.mission).length,nightF=night>.6?.7:1;
  if(nT<16*nightF){for(let t=0;t<6;t++){const i=Math.floor(rnd(0,NB+1)),j=Math.floor(rnd(0,NB+1)),d=Math.floor(rnd(0,4));const[dx,dz]=DIRS[d];if(!inCity(i+dx,j+dz))continue;const tt=rnd(0,1);const s=8+tt*(P-16);const x=RX(i)+dx*s,z=RX(j)+dz*s;const dd=Math.hypot(x-mp.x,z-mp.z);if(dd<45||dd>150||dd<110&&inView(new V3(x,1,z)))continue;if(CARS.some(c=>Math.hypot(c.pos.x-x,c.pos.z-z)<10))continue;spawnTraffic(i,j,d,tt,Math.random()<.06?'police':null);break}}
  const nParked=CARS.filter(c=>c.parked&&!c.driver&&!c.dead&&Math.hypot(c.pos.x-mp.x,c.pos.z-mp.z)<130).length;
  if(nParked<9){for(let t=0;t<6;t++){const i=Math.floor(rnd(0,NB+1)),j=Math.floor(rnd(0,NB)),vert=Math.random()<.5,side=Math.random()<.5?1:-1;const along=RX(j)+rnd(12,P-12);const x=vert?RX(i)+side*5:along,z=vert?along:RX(i)+side*5;const dd=Math.hypot(x-mp.x,z-mp.z);if(dd<35||dd>120||dd<80&&inView(new V3(x,1,z)))continue;if(CARS.some(c=>Math.hypot(c.pos.x-x,c.pos.z-z)<7))continue;const car=spawnCar(pick(TRAFFIC_MIX.filter(k=>k!=='truck')),x,z,vert?(side>0?PI:0):(side>0?PI/2:-PI/2),{parked:true});car.parked=true;break}}
  const nP=PEDS.filter(p=>p.kind==='civ'&&!p.inCar&&!p.dead&&!p.mission).length;
  if(nP<24*nightF){for(let t=0;t<6;t++){const[bx,bz]=blockOf(mp.x,mp.z);const b=[clamp(bx+Math.floor(rnd(-2,3)),0,NB-1),clamp(bz+Math.floor(rnd(-2,3)),0,NB-1)];const ci=Math.floor(rnd(0,4));const a=cornerPt(...b,LOOP[ci]),c2=cornerPt(...b,LOOP[(ci+1)%4]);const q=a.lerp(c2,Math.random());const dd=Math.hypot(q.x-mp.x,q.z-mp.z);if(dd<30||dd>95||dd<70&&inView(q))continue;spawnPed('civ',q.x,q.z,{});break}}
  stepGang(.4)}
