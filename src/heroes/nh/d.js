/* ================= player update ================= */
const KEYS_FOOT=[['W A S D','Move'],['Shift','Sprint'],['Space','Jump'],['LMB','Shoot / punch'],['RMB','Aim'],['R','Reload'],['1-8','Weapons'],['G','Grenade'],['F','Enter car'],['E','Use'],['C','Crouch'],['M','Map'],['P','Pause']];
const KEYS_CAR=[['W S','Gas / brake'],['A D','Steer'],['Space','Handbrake'],['F','Exit car'],['LMB','Drive-by'],['N','Radio'],['Q','Horn'],['T','Side job'],['M','Map'],['P','Pause']];
function keysFor(){K.keys(ME.car?KEYS_CAR:KEYS_FOOT)}
const scope=el('div',{class:'nh-scope'});K.hud.append(scope);const clockEl=el('div',{class:'bk-wep',style:'opacity:.75'});K.H.tr.prepend(clockEl);const areaEl=el('div',{class:'nh-area'});K.hud.append(areaEl);
if(!document.getElementById('nh-css')){const s2=document.createElement('style');s2.id='nh-css';s2.textContent=`.nh-scope{position:absolute;inset:0;pointer-events:none;display:none;background:radial-gradient(circle at center,transparent 0 30vmin,#000 30.3vmin)}.nh-scope::before,.nh-scope::after{content:'';position:absolute;background:#000}.nh-scope::before{left:50%;top:20%;bottom:20%;width:1px}.nh-scope::after{top:50%;left:25%;right:25%;height:1px}
.nh-area{position:absolute;right:16px;top:110px;font:900 28px/1 'Arial Black',system-ui,sans-serif;color:#fff;text-shadow:0 3px 10px #000;opacity:0;transition:opacity .6s;pointer-events:none;text-align:right}.nh-area.on{opacity:1}.nh-area small{display:block;font:700 12px system-ui;letter-spacing:.2em;opacity:.8}
.nh-map{position:relative;display:inline-block}.nh-map canvas{width:min(64vh,80vw,560px);height:min(64vh,80vw,560px);border-radius:10px;cursor:crosshair;display:block}.nh-leg{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;font:700 12px system-ui}.nh-leg i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;vertical-align:-1px}
@media (max-width:700px){.nh-area{font-size:18px;top:90px}}`;document.head.append(s2)}
let jumpLatch=false,altLatch=false,lastMouse=0;
function stepMeFoot(dt){const I=input,k=I.keys;if(ME.dead){K.pose(ME.ch,'idle',dt,0,{act:'hit',k:.5});ME.ch.g.position.copy(ME.pos);ME.ch.g.rotation.set(-PI/2*.95,ME.yaw,0);return}
  ME.ch.g.rotation.x=0;let mx=(k.d||k.arrowright?1:0)-(k.a||k.arrowleft?1:0)+I.joy.x,mz=(k.w||k.arrowup?1:0)-(k.s||k.arrowdown?1:0)-I.joy.y;const ml=Math.hypot(mx,mz);if(ml>1){mx/=ml;mz/=ml}
  const cy=K.CAM.yaw,fw=new V3(-Math.sin(cy),0,-Math.cos(cy)),rt=new V3(Math.cos(cy),0,-Math.sin(cy));const dir=fw.clone().multiplyScalar(mz).addScaledVector(rt,mx);
  const W=WPN[ME.wpn];ME.aim=(I.right||ME.touchAim)&&!W.melee;const sprint=k.shift&&ME.stam>.05&&!ME.aim&&!ME.crouch;ME.stam=clamp(ME.stam+(sprint&&ml>.1?-.22:.3)*dt,0,1);
  const spT=ml<.08?0:ME.crouch?1.9:ME.aim?2.4:sprint?7.6:4.8;ME.spd=lerp(ME.spd,spT*Math.min(1,ml),Math.min(1,dt*10));
  if(ME.bail>0){ME.bail-=dt;ME.pos.addScaledVector(ME.bailV,dt);ME.bailV.multiplyScalar(1-dt*2)}else if(ME.spd>.05&&ml>.01){const d2=dir.clone().normalize();ME.pos.addScaledVector(d2,ME.spd*dt)}
  if(ME.knock){ME.pos.addScaledVector(ME.knock,dt);ME.knock.multiplyScalar(1-dt*4);if(ME.knock.length()<.3)ME.knock=null}
  K.collide(ME.pos,.34,ME.pos.y,ME.crouch?1.2:1.7);
  const g=K.groundAt(ME.pos.x,ME.pos.z,ME.pos.y,.25);const jp=k[' ']||I.jumpBtn;if(jp&&!jumpLatch&&ME.onG&&!ME.crouch){ME.vy=5.4;ME.onG=false}jumpLatch=jp;
  ME.vy-=20*dt;ME.pos.y+=ME.vy*dt;if(ME.pos.y<=g){if(!ME.onG&&ME.vy<-13)hurtMe((-ME.vy-13)*6,null,true);ME.pos.y=g;ME.vy=0;ME.onG=true}else if(ME.pos.y-g>.3)ME.onG=false;
  const faceCam=ME.aim||performance.now()/1000-ME.lastShot<.8||(W.melee&&ME.act);if(faceCam)ME.yaw+=angDiff(ME.yaw,Math.atan2(fw.x,fw.z))*Math.min(1,dt*16);else if(ME.spd>.3&&ml>.01)ME.yaw+=angDiff(ME.yaw,Math.atan2(dir.x,dir.z))*Math.min(1,dt*10);
  // weapons
  ME.cool-=dt;if(ME.reload>0){ME.reload-=dt;if(ME.reload<=0)finishReload()}if(ME.act){ME.actK+=dt*(W.melee?2.4:6);if(ME.actK>=1)ME.act=null}
  const trig=(I.down&&I.locked||I.down&&!I.touch&&!document.pointerLockElement&&false)||I.fire;
  if(W.melee){if(trig&&ME.cool<=0){ME.cool=W.rate;ME.act=W===WPN.bat?pick(['slashR','overhead']):pick(['punchR','punchL','hook','kick','upper']);ME.actK=0;K.SFX.swing(ME.pos);setTimeout(meleeHit,W===WPN.bat?220:140)}}
  else if(W.thrown){if(trig&&ME.cool<=0&&(ME.ammo.grenade||0)>0)throwGrenade()}
  else{if(trig&&ME.cool<=0&&ME.reload<=0&&(W.auto||!ME.trigLatch)){if((ME.mag[ME.wpn]||0)>0)shootMe(W);else if((ME.ammo[ME.wpn]||0)>0)startReload();else{K.SFX.bad();ME.cool=.35;cycleWpn(-1)}}if((ME.mag[ME.wpn]||0)===0&&(ME.ammo[ME.wpn]||0)>0&&ME.reload<=0)startReload()}
  ME.trigLatch=trig;
  // animation
  const st=ME.bail>0?'fall':!ME.onG?'jump':ME.crouch?(ME.spd>.3?'crouchwalk':'crouch'):ME.spd>6?'sprint':ME.spd>3?'run':ME.spd>.3?'walk':'idle';
  const armed=!W.melee&&!W.thrown;const up=armed&&(ME.aim||faceCam)?(ME.wpn==='pistol'?'aim1':'aim2'):armed&&ME.wpn!=='pistol'?'carry':W===WPN.bat?'sword':null;ME.ch.aimPitch=clamp(-(K.CAM.pitch-.18),-.8,.8);
  K.pose(ME.ch,st,dt,ME.spd,{up,act:ME.act,k:ME.actK,fast:!!ME.act});ME.ch.g.position.copy(ME.pos);ME.ch.g.rotation.y=ME.yaw;
  if(ME.hp<40&&performance.now()/1000-ME.lastHurtT>6)ME.hp=Math.min(40,ME.hp+dt*2)}
function throwGrenade(){if(!(ME.ammo.grenade>0))return;ME.ammo.grenade--;ME.cool=1;ME.act='throw';ME.actK=0;const ar=K.aimRay();const v=ar.d.clone().multiplyScalar(17);v.y+=5;setTimeout(()=>{const o=ME.pos.clone().add(new V3(0,1.7,0)).addScaledVector(new V3(Math.sin(ME.yaw),0,Math.cos(ME.yaw)),.4);throwNade(o,v,'player');K.SFX.whoosh(o)},200);if(!(ME.ammo.grenade>0)&&ME.wpn==='grenade')setTimeout(()=>cycleWpn(-1),600)}
let engL=null,skidL=null;
function stepMeCar(dt){const car=ME.car,k=input.keys,I=input;let thr=(k.w||k.arrowup?1:0)+Math.max(0,-I.joy.y*1.3),brk=(k.s||k.arrowdown?1:0)+Math.max(0,I.joy.y*1.3),st=(k.a||k.arrowleft?1:0)-(k.d||k.arrowright?1:0)-I.joy.x;const hb=!!(k[' ']||I.jumpBtn);
  if(ME.dead)thr=brk=st=0;carPhys(car,clamp(thr,0,1),clamp(brk,0,1),clamp(st,-1,1),hb,dt);ME.pos.copy(car.pos);ME.yaw=car.yaw;K.pose(ME.ch,'drive',dt,0,{up:null});
  // drive-by
  const dbW=ME.owned.smg&&((ME.mag.smg||0)+(ME.ammo.smg||0))>0?'smg':ME.owned.pistol&&((ME.mag.pistol||0)+(ME.ammo.pistol||0))>0?'pistol':null;ME.cool-=dt;const trig=I.down&&I.locked||I.fire;
  if(dbW&&trig&&ME.cool<=0&&(WPN[dbW].auto||!ME.trigLatch)){if(!(ME.mag[dbW]>0)){const n=Math.min(WPN[dbW].mag,ME.ammo[dbW]||0);ME.mag[dbW]=n;ME.ammo[dbW]-=n;ME.cool=1}else{const keep=ME.wpn;ME.wpn=dbW;shootMe(WPN[dbW],car);ME.wpn=keep}}ME.trigLatch=trig;
  const sp=Math.abs(car.vf);if(!engL)engL=K.loop({wave:'sawtooth',freq:60,f:600});if(engL)engL.set(car.dead?0:.05,45+sp*4.2+(thr?15:0),400+sp*25);
  const slide=Math.abs(car.vl);if(!skidL)skidL=K.loop({noise:1,ft:'bandpass',f:1200,q:1.5});if(skidL)skidL.set(slide>3.2||car.hb&&sp>6?Math.min(.18,(slide-2)*.04+.05):0);
  if((slide>4||car.hb&&sp>8)&&Math.random()<.6){const rt=cright(car),fw=cfwd(car);for(const s of[-1,1]){const q=car.pos.clone().addScaledVector(fw,-car.S.L*.35).addScaledVector(rt,s*car.S.Wd*.4);K.emit(K.SM,q.x,q.y+.2,q.z,rnd(-.5,.5),rnd(.5,1.2),rnd(-.5,.5),rnd(1,1.8),.5,2.2,0xd8d8d8,0xa0a0a0,.35,-.3,1)}}
  car.siren=car.police&&(k.h===undefined?false:false)}
function stopCarSounds(){if(engL)engL.set(0);if(skidL)skidL.set(0)}
/* car-car and car-ped contact */
function circles(car){const fw=cfwd(car),r=car.S.Wd/2;return[-car.S.L/2+r,0,car.S.L/2-r].map(o=>({x:car.pos.x+fw.x*o,z:car.pos.z+fw.z*o,r}))}
function velOf(car){const fw=cfwd(car),rt=cright(car);return{x:fw.x*car.vf+rt.x*car.vl,z:fw.z*car.vf+rt.z*car.vl}}
function setVel(car,v){const fw=cfwd(car),rt=cright(car);car.vf=v.x*fw.x+v.z*fw.z;car.vl=v.x*rt.x+v.z*rt.z}
function contacts(){for(let i=0;i<CARS.length;i++){const a=CARS[i];for(let j=i+1;j<CARS.length;j++){const b=CARS[j];const dx=b.pos.x-a.pos.x,dz=b.pos.z-a.pos.z;const R=(a.S.L+b.S.L)/2;if(dx*dx+dz*dz>R*R)continue;let best=null;for(const ca of circles(a))for(const cb of circles(b)){const cx=cb.x-ca.x,cz=cb.z-ca.z,d=Math.hypot(cx,cz),rr=ca.r+cb.r;if(d<rr&&d>1e-4){const pen=rr-d;if(!best||pen>best.pen)best={pen,nx:cx/d,nz:cz/d}}}if(!best)continue;
      const ma=a.S.mass,mb=b.S.mass,tot=ma+mb;a.pos.x-=best.nx*best.pen*mb/tot;a.pos.z-=best.nz*best.pen*mb/tot;b.pos.x+=best.nx*best.pen*ma/tot;b.pos.z+=best.nz*best.pen*ma/tot;const va=velOf(a),vb=velOf(b);const rel=(vb.x-va.x)*best.nx+(vb.z-va.z)*best.nz;
      if(rel<0){const jj=-1.3*rel/(1/ma+1/mb);va.x-=jj*best.nx/ma;va.z-=jj*best.nz/ma;vb.x+=jj*best.nx/mb;vb.z+=jj*best.nz/mb;setVel(a,va);setVel(b,vb);const imp=-rel;if(imp>4){const by=a.driver===ME||b.driver===ME?'player':null;carDamage(a,imp*2.4*mb/tot,by);carDamage(b,imp*2.4*ma/tot,by);crash(a.pos.clone().lerp(b.pos,.5),imp);CAM_SHAKE(a,imp);CAM_SHAKE(b,imp);if(by&&(a.police&&b===ME.car||b.police&&a===ME.car)&&WANT.lvl<2)addHeat(imp>8?40:15,a.pos);[a,b].forEach(q=>{if(q.ai&&q!==ME.car&&!q.police&&q.driver&&by)q.ai.panic=5})}}}}
  for(const car of CARS){const sp=Math.hypot(car.vf,car.vl);if(sp<3.2)continue;const fw=cfwd(car),rt=cright(car),hw=car.S.Wd/2+.3,hl=car.S.L/2+.3;const test=p=>{const dx=p.x-car.pos.x,dz=p.z-car.pos.z;if(Math.abs(dx)>7||Math.abs(dz)>7)return false;const lz=dx*fw.x+dz*fw.z,lx=dx*rt.x+dz*rt.z;return Math.abs(lx)<hw&&Math.abs(lz)<hl&&Math.abs(p.y-car.pos.y)<1.5};const vv=velOf(car),v=new V3(vv.x,0,vv.z);
    for(const p of PEDS){if(p.dead||p.inCar||p.god)continue;if(test(p.pos)){hurtPed(p,sp*7,v.clone().normalize(),car.driver===ME?'player':null);if(p.dead){p.fly=v.clone().multiplyScalar(.75);p.fly.y=sp*.3+2}else p.pos.addScaledVector(v.clone().normalize(),1.2);K.SFX.punch(p.pos);car.vf*=.94;if(car.driver===ME&&p.team==='cop')addHeat(60,p.pos)}}
    if(!ME.car&&!ME.dead&&car!==ME.car&&test(ME.pos)){hurtMe(sp*2.4,null,true);ME.knock=v.clone().multiplyScalar(.8);ME.vy=3;ME.onG=false;ME.pos.addScaledVector(v.clone().normalize(),.6)}}}
function carFx(car,dt){if(car.burn>0){car.burn-=dt;const q=car.pos.clone().addScaledVector(cfwd(car),car.S.L*.3);K.emit(K.FX,q.x+rnd(-.3,.3),q.y+.9,q.z+rnd(-.3,.3),rnd(-.4,.4),rnd(1.5,3),rnd(-.4,.4),.5,.4,.9,0xffd070,0xff3000,1,-1,1);if(Math.random()<.4)K.emit(K.SM,q.x,q.y+1.2,q.z,rnd(-.3,.3),rnd(1.5,2.5),rnd(-.3,.3),2.5,.6,2.5,0x3a3632,0x1a1816,.6,-.4,.8);if(car.burn<=0)wreck(car)}
  else if(!car.dead&&car.hp<car.S.hp*.45&&Math.random()<.25){const q=car.pos.clone().addScaledVector(cfwd(car),car.S.L*.35);K.emit(K.SM,q.x,q.y+.9,q.z,rnd(-.2,.2),rnd(1,2),rnd(-.2,.2),2,.4,1.8,car.hp<car.S.hp*.2?0x2a2826:0xb8b8b8,0x5a5a5a,.45,-.3,.8)}
  if(car.dead&&car.flame>0){car.flame-=dt;if(Math.random()<.5){const q=car.pos;K.emit(K.FX,q.x+rnd(-.8,.8),q.y+1,q.z+rnd(-1.2,1.2),0,rnd(1,2.5),0,.6,.5,1,0xffc050,0xff2000,1,-1,1)}if(Math.random()<.2)K.emit(K.SM,car.pos.x,car.pos.y+1.5,car.pos.z,rnd(-.3,.3),2,rnd(-.3,.3),3,.8,3,0x2a2826,0x111111,.5,-.3,.6)}}
function stepPickups(dt){const mp=mePos();for(let i=PICK.length-1;i>=0;i--){const pk=PICK[i];pk.t-=dt;if(pk.t<=0){scene.remove(pk.m);PICK.splice(i,1);continue}if(!pk.flat){pk.m.rotation.y+=dt*2;pk.m.position.y=pk.base+Math.sin(performance.now()/400+i)*.12}
  const d=Math.hypot(pk.m.position.x-mp.x,pk.m.position.z-mp.z),dy=Math.abs(pk.m.position.y-(mp.y+.8));if(d<(ME.car?2.6:1.3)&&dy<2.4&&!ME.dead){if(pk.kind==='cash')giveMoney(pk.amt,'');else if(pk.kind==='health'){if(ME.hp>=100)continue;ME.hp=100;K.SFX.pick()}else if(pk.kind==='armor'){if(ME.armor>=100)continue;ME.armor=100;K.SFX.pick()}else if(pk.kind==='wpn'){if(ME.car)continue;giveWeapon(pk.wpn,Math.ceil((WPN[pk.wpn].ammoN||0)/2));K.SFX.pick()}else if(pk.kind==='bag'){pk.got=true;K.SFX.cash()}else if(pk.kind==='pkg'){PKGS.push(pk.pkg);STATS.pk=PKGS.length;K.banner('HIDDEN PACKAGE',PKGS.length+' / '+PKG_POS.length,'#ffc040',2500);giveMoney(100,'');if(PKGS.length===PKG_POS.length){giveMoney(10000,'all packages found!');giveWeapon('sniper',30)}saveGame()}
    scene.remove(pk.m);PICK.splice(i,1)}}}
/* ================= minimap & big map ================= */
const DNAME={mid:'OLD TOWN',downtown:'DOWNTOWN',suburb:'PALM HEIGHTS',park:'CITY PARK',docks:'THE DOCKS'};let lastArea='',areaT=0;
function areaName(x,z){if(z>196&&x>0)return'HARBOR BEACH';if(Math.abs(x)>204||z<-204)return'THE COAST';if(x<-60&&z>214)return'PIER 9';const[bx,bz]=blockOf(x,z);if(bx>=6&&bz>=4&&bz<=6)return'KINGS ROW';return DNAME[district(clamp(bx,0,7),clamp(bz,0,7))]}
function blipList(){const L=[];const M=MISSION.active;if(M){const s=M.cur;const bp=M.altBlip||(s&&s.blip&&s.blip(M));if(bp)L.push({p:bp,col:M.altBlip?'#6aa0ff':s.blipCol||'#ffd23f',big:1,route:1});if(s&&s.targets)(s.targets(M)||[]).forEach(p=>{if(p&&!p.dead)L.push({p:p.inCar?p.inCar.pos:p.pos,col:'#ff3030'})})}
  else{const g=MS[MISSION.i]&&MS[MISSION.i].giver;const gp=g&&giverPos(g);if(gp)L.push({p:gp,col:'#ffd23f',big:1,t:g==='hale'?'H':g==='diner'?'R':'T',route:!ME.wp})}
  if(JOB.kind==='taxi'){if(JOB.fare)L.push({p:JOB.fare.pos,col:'#6aa0ff',big:1,route:1});if(JOB.dest)L.push({p:JOB.dest,col:'#ffd23f',big:1,route:1})}if(JOB.kind==='vig'&&JOB.target)L.push({p:JOB.target.pos,col:'#ff3030',big:1,route:1});
  if(ME.wp)L.push({p:ME.wp,col:'#c86aff',big:1,route:!L.some(b=>b.route)});
  [['guns','$','#ff5a3a'],['spray','S','#2af0ff'],['safe','H','#6aff6a'],['hospital','+','#ff6a6a'],['police','P','#4a8aff']].forEach(([k2,t,col])=>L.push({p:PL[k2].pos,col,t,icon:1}));
  for(const p of PEDS){if(p.dead||p.inCar)continue;if(p.team==='cop'&&WANT.lvl>0)L.push({p:p.pos,col:'#4a8aff',sm:1});else if(p.team==='gang'&&(p.state==='attack'||p.alert))L.push({p:p.pos,col:'#ff3030',sm:1})}
  for(const car of CARS)if(car.police&&!car.dead&&WANT.lvl>0)L.push({p:car.pos,col:Math.floor(performance.now()/250)%2?'#ff3030':'#4a8aff',sm:1});return L}
let routeCache={t:0,pts:null};
function gpsRoute(tp){const mp=mePos();routeCache.t-=1;if(routeCache.t>0&&routeCache.tp&&routeCache.tp.distanceTo(tp)<1)return routeCache.pts;routeCache.t=20;routeCache.tp=tp.clone();const a=nearestNode(mp.x,mp.z),b=nearestNode(tp.x,tp.z);const r=routeNodes(a,b).map(n=>NODE(...n));routeCache.pts=[mp.clone(),...r,tp.clone()];return routeCache.pts}
function drawMini(){const g=K.H.mg,W2=256,cx=128;const mp=mePos();const zoom=ME.car?clamp(1.6-Math.abs(ME.car.vf)*.02,.8,1.6):1.9;const s=zoom/MSC*1.0;const ry=K.CAM.yaw;g.save();g.clearRect(0,0,W2,W2);g.beginPath();g.arc(cx,cx,cx,0,TWO);g.clip();g.fillStyle='#1a4a66';g.fillRect(0,0,W2,W2);g.translate(cx,cx);g.rotate(ry);g.scale(zoom,zoom);g.drawImage(MAPC,-mapX(mp.x),-mapZ(mp.z));g.restore();
  const tf=(x,z)=>{const dx=(x-mp.x)*zoom*MSC,dz=(z-mp.z)*zoom*MSC;return[cx+dx*Math.cos(ry)-dz*Math.sin(ry),cx+dx*Math.sin(ry)+dz*Math.cos(ry)]};
  const L=blipList();const rb=L.find(b=>b.route);if(rb){const pts=gpsRoute(rb.p);g.save();g.beginPath();g.arc(cx,cx,cx,0,TWO);g.clip();g.strokeStyle=rb.col==='#c86aff'?'rgba(200,106,255,.85)':'rgba(255,210,63,.85)';g.lineWidth=5;g.lineJoin='round';g.beginPath();pts.forEach((q,i)=>{const[x,y]=tf(q.x,q.z);i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke();g.restore()}
  for(const b of L){let[x,y]=tf(b.p.x,b.p.z);const dx=x-cx,dy=y-cx,d=Math.hypot(dx,dy);if(d>cx-10){if(b.sm)continue;x=cx+dx/d*(cx-10);y=cx+dy/d*(cx-10)}g.fillStyle=b.col;g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.arc(x,y,b.sm?3.5:b.big?8:7,0,TWO);g.fill();g.stroke();if(b.t){g.fillStyle='#000';g.font='bold 10px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(b.t,x,y+.5)}}
  g.save();g.translate(cx,cx);g.rotate(ry-ME.yaw+PI);g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.moveTo(0,-9);g.lineTo(6,7);g.lineTo(0,3);g.lineTo(-6,7);g.closePath();g.fill();g.stroke();g.restore();
  g.fillStyle='rgba(255,255,255,.8)';g.font='bold 12px system-ui';g.textAlign='center';const[nx,ny]=[cx-Math.sin(-ry)*(cx-12)*0+cx*0,0];g.save();g.translate(cx,cx);g.rotate(ry);g.fillText('N',0,-cx+14);g.restore()}
function bigMap(){const cv=el('canvas',{width:MAPW,height:MAPW});const wrap2=el('div',{class:'nh-map'},cv);const g=cv.getContext('2d');const draw=()=>{g.drawImage(MAPC,0,0);const mp=mePos();for(const b of blipList()){if(b.sm)continue;g.fillStyle=b.col;g.strokeStyle='#000';g.lineWidth=3;g.beginPath();g.arc(mapX(b.p.x),mapZ(b.p.z),b.big?12:10,0,TWO);g.fill();g.stroke();if(b.t){g.fillStyle='#000';g.font='bold 14px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(b.t,mapX(b.p.x),mapZ(b.p.z)+1)}}
    for(const i of PKG_POS.keys()){if(PKGS.includes(i)||STATS.pk<10)continue;const q=PKG_POS[i];g.fillStyle='#ffc040';g.fillRect(mapX(q[0])-4,mapZ(q[1])-4,8,8)}
    g.save();g.translate(mapX(mp.x),mapZ(mp.z));g.rotate(-ME.yaw+PI);g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=3;g.beginPath();g.moveTo(0,-16);g.lineTo(11,12);g.lineTo(0,6);g.lineTo(-11,12);g.closePath();g.fill();g.stroke();g.restore()};draw();
  cv.addEventListener('click',e=>{e.stopPropagation();const r=cv.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*MAPW/MSC-260,z=(e.clientY-r.top)/r.height*MAPW/MSC-260;ME.wp=ME.wp&&Math.hypot(ME.wp.x-x,ME.wp.z-z)<12?null:new V3(x,0,z);routeCache.t=0;draw()});
  const leg=el('div',{class:'nh-leg'});[['#ffd23f','Story'],['#ff5a3a','Ammo Depot'],['#2af0ff','Spray Shack'],['#6aff6a','Safehouse'],['#ff6a6a','Hospital'],['#4a8aff','Police'],['#c86aff','Waypoint (click map)']].forEach(([col,t])=>{const s2=el('span');const i2=el('i');i2.style.background=col;s2.append(i2,t);leg.append(s2)});
  const card=K.menu(el('div',null,wrap2,leg),[['Close',()=>K.menuOff(),'pri']]);return card}
/* ================= pause / start menus ================= */
function pauseMenu(){const done=MISSION.i;const card=K.menu('<h2>NEON HARBOR</h2><p>Money <b style="color:#8aff8a">$'+ME.money.toLocaleString()+'</b> · Story '+Math.min(done,MS.length)+'/'+MS.length+' · Packages '+PKGS.length+'/'+PKG_POS.length+'</p>',[['Resume',()=>K.menuOff(),'pri'],['Map',()=>bigMap()],['Stats',()=>statsMenu()],['Missions',()=>missionMenu()],['New game',()=>{K.menu('<h2>Start over?</h2><p>This wipes your saved progress.</p>',[['Yes, new game',()=>{K.SAVE.set('save',null);K.menuOff();newGame(true)},'pri'],['Cancel',()=>pauseMenu()]])}]])}
function statsMenu(){const r=(a,b)=>'<p>'+a+': <b>'+b+'</b></p>';K.menu('<h2>STATS</h2>'+r('Money earned','$'+STATS.earned.toLocaleString())+r('People taken out',STATS.kills)+r('Cops taken out',STATS.copKills)+r('Cars stolen',STATS.cars)+r('Police escapes',STATS.escapes)+r('Helicopters downed',STATS.heli)+r('Taxi fares',STATS.taxi)+r('Vigilante bounties',STATS.vig)+r('Wasted',STATS.deaths)+r('Busted',STATS.busted)+r('Hidden packages',PKGS.length+' / '+PKG_POS.length),[['Back',()=>pauseMenu(),'pri']])}
function missionMenu(){const card=K.menu('<h2>STORY</h2><p>Replay a finished mission for a smaller reward.</p>',[]);MS.forEach((m,i)=>{const ok=i<MISSION.i;const b=el('button',{type:'button',class:'bk-btn'+(ok?'':' no')},(ok?'✔ ':i===MISSION.i?'▶ ':'🔒 ')+(i+1)+'. '+m.name);b.onclick=e=>{e.stopPropagation();if(!ok||MISSION.active)return;K.menuOff();if(ME.car)exitCar(true);startMission(i)};card.append(b,el('br'))});const bk=el('button',{type:'button',class:'bk-btn pri'},'Back');bk.onclick=e=>{e.stopPropagation();pauseMenu()};card.append(bk)}
let started=false;
function newGame(fresh){if(fresh){ME.money=0;ME.owned={fist:1};ME.ammo={};ME.mag={};ME.armor=0;PKGS=[];MISSION.i=0;for(const k2 in STATS)STATS[k2]=0;hour=17.2;selectWpn('fist');PICK.filter(p=>p.kind==='pkg').forEach(p=>scene.remove(p.m));for(let i=PICK.length-1;i>=0;i--)if(PICK[i].kind==='pkg')PICK.splice(i,1);buildPkgs();SHIPFIRE.on=0;GANG.hostile=false}
  ME.hp=100;ME.dead=false;ME.pos.copy(fresh||MISSION.i===0?PL.bus.pos:PL.safe.pos);ME.yaw=PI;K.CAM.yaw=0;started=true;storyNPCs();keysFor();
  if(fresh||MISSION.i===0){intro()}else{K.banner('NEON HARBOR','Welcome back to Harbor City','#ff4a8a',3000)}}
function intro(){const path=[[40,90,-300],[-60,70,-120],[-150,40,60],[-60,25,200],[-150,8,172]];let t=0;K.cine(true);INTRO.on=true;K.banner('NEON HARBOR','A Detourr original','#ff4a8a',5200);INTRO.fn=dt=>{t+=dt/2.2;const i=Math.min(path.length-2,Math.floor(t)),f=t-i;const a=path[i],b=path[i+1];camera.position.set(lerp(a[0],b[0],f),lerp(a[1],b[1],f),lerp(a[2],b[2],f));camera.lookAt(ME.pos.x,2,ME.pos.z);if(t>=path.length-1)INTRO.end()};
  INTRO.end=()=>{if(!INTRO.on)return;INTRO.on=false;K.cine(false);K.CAM.yaw=PI/2;startMission(0)}}
const INTRO={on:false,fn:null,end:()=>{}};
function startMenu(){const has=!!SAVED&&SAVED.m!=null;K.menu('<h2 style="font-size:40px;color:#ff4a8a;letter-spacing:.02em">NEON HARBOR</h2><p>Fresh out of prison, Leo Vance arrives in Harbor City to work for his cousin Tony. The Red Kings run the streets. Not for long.</p><h3>WHAT\'S IN IT</h3><p>8 story missions · steal any car · 5-star police chases with helicopters · guns & grenades · Ammo Depot, Spray Shack and a safehouse · taxi and vigilante side jobs · 3 radio stations · day and night · 20 hidden packages</p><p style="opacity:.7">Click the game to capture the mouse. P pauses, M opens the map. Progress saves at the safehouse and after every mission.</p>',has?[['Continue',()=>{K.menuOff();newGame(false)},'pri'],['New game',()=>{K.menuOff();newGame(true)}]]:[['Start',()=>{K.menuOff();newGame(true)},'pri']])}
/* ================= input ================= */
c.on(document,'keydown',e=>{if(!started||K.H.menu.classList.contains('on')&&!['p','m','escape'].includes(e.key.toLowerCase()))return;const k2=e.key.toLowerCase();if(e.repeat)return;
  if(INTRO.on&&(k2==='enter'||k2===' ')){INTRO.end();return}
  if(k2==='p'){if(K.H.menu.classList.contains('on'))K.menuOff();else pauseMenu();return}if(k2==='m'){if(K.H.menu.classList.contains('on'))K.menuOff();else bigMap();return}
  if(ME.dead)return;if(k2==='f')toggleCar();else if(k2==='r')startReload();else if(k2==='g'){if(!ME.car&&(ME.ammo.grenade||0)>0&&ME.cool<=0)throwGrenade()}else if(k2==='c'){if(!ME.car)ME.crouch=!ME.crouch}else if(k2==='n'){if(ME.car){RADIO.st=(RADIO.st+1)%RADIO.names.length;K.note('📻 '+RADIO.names[RADIO.st]);if(!RADIO.st)stopRadio()}}else if(k2==='q'){if(ME.car)horn(ME.car.pos)}else if(k2==='t'){JOB.start()}
  else if(/^[1-8]$/.test(k2)){const w=WORDER[+k2-1];if(ME.owned[w])selectWpn(w)}});
function toggleCar(){if(ME.car){if(Math.abs(ME.car.vf)<14)exitCar();return}const car=carAtDoor();if(car)enterCar(car)}
K.touchBtn('AIM',v=>{ME.touchAim=v},true);K.touchBtn('GUN',()=>cycleWpn(1));K.touchBtn('RELOAD',()=>startReload());K.touchBtn('USE',v=>{input.useHold=v},true);K.touchBtn('MAP',()=>bigMap());K.touchBtn('MENU',()=>pauseMenu());
/* ================= main loop ================= */
K.buildNav(-250,-250,250,250,2,.35);
buildPkgs();[[PL.police.pos.clone().add(new V3(0,0,4)),'armor'],[PL.hospital.pos.clone().add(new V3(4,0,0)),'health'],[new V3(BC(1),.2,BC(1)),'health'],[new V3(BC(6),.2,BC(6)-6),'armor'],[PL.kings.c.clone(),'health']].forEach(([p,k2])=>dropPickup(k2,p,null,{perm:1}));
selectWpn('fist');setTime(hour);startMenu();
let tAcc=0,tAcc2=0;const spW=K.W;
function update(dtRaw){const dt=Math.min(dtRaw,.05);if(!started){camera.position.set(-120+Math.sin(performance.now()/9000)*60,60,120);camera.lookAt(0,10,0);return}
  if(INTRO.on){INTRO.fn(dt);setTime(hour);return}
  if(K.H.menu.classList.contains('on')){stopCarSounds();return}
  hour=(hour+dt/50)%24;setTime(hour);
  // player
  if(!ME.car)stepMeFoot(dt);
  if(!ME.car&&!ME.dead){const car=carAtDoor();if(car)K.prompt('F','Get in '+(car.driver&&car.driver.ped?'(steal) ':'')+car.S.n);else K.prompt()}else if(!(MISSION.active&&MISSION.active.cur&&MISSION.active.cur.tick&&ME.pos.distanceTo(PL.ship.bomb)<2.2))K.prompt();
  const alt=input.alt;if(alt&&!altLatch&&!ME.dead)toggleCar();altLatch=alt;
  if(!ME.car){stopCarSounds();if(input.wheel)cycleWpn(input.wheel>0?1:-1)}
  // vehicles
  for(let i=CARS.length-1;i>=0;i--){const car=CARS[i];if(!car)continue;if(car===ME.car)stepMeCar(dt);else if(car.race){}else if(car.police&&car.ai&&car.driver)stepCopCar(car,dt);else if(car.ai&&car.driver)stepTraffic(car,dt);else carPhys(car,0,car.dead?1:.7,0,false,dt);carFx(car,dt);syncCar(car,dt)}
  contacts();
  for(let i=PEDS.length-1;i>=0;i--){const p=PEDS[i];if(p)stepPed(p,dt)}
  for(const p of PEDS)if(p.inCar)K.pose(p.ch,'drive',dt,0,{});
  if(ME.car&&!ME.bustT)ME.bustT=0;if(ME.bustT>0&&!PEDS.some(p=>p.team==='cop'&&!p.dead&&p.state==='arrest'&&p.pos.distanceTo(mePos())<3.2))ME.bustT=Math.max(0,ME.bustT-dt*2);
  stepPolice(dt);stepNades(dt);stepPickups(dt);stepShops(dt);stepMission(dt);JOB.tick(dt);managePop(dt);radioTick();
  if(SHIPFIRE.on&&mePos().distanceTo(PL.ship.deck)<350&&Math.random()<.7){const q=new V3(rnd(-98,-78),4.2,rnd(226,286));K.emit(K.FX,q.x,q.y,q.z,rnd(-.3,.3),rnd(2,4),rnd(-.3,.3),.8,1,2,0xffc050,0xff2000,1,-1,1);K.emit(K.SM,q.x,q.y+2,q.z,rnd(-.5,.5),rnd(2,4),rnd(-.5,.5),5,2,7,0x2a2826,0x111111,.55,-.2,.4)}
  // markers
  OBJM.rotation.y+=dt;GIVERM.rotation.y+=dt;[OBJM,GIVERM].forEach(m=>{m.userData.ar.position.y=3.4+Math.sin(performance.now()/300)*.2});
  const M=MISSION.active,tl=M&&M.cur&&M.cur.targets?(M.cur.targets(M)||[]).filter(p=>p&&!p.dead):[];tgtCones.forEach((cn,i)=>{const p=tl[i];cn.visible=!!p;if(p){const q=p.inCar?p.inCar.pos:p.pos;cn.position.set(q.x,q.y+(p.inCar?2.6:2.3)+Math.sin(performance.now()/250)*.12,q.z);cn.rotation.y+=dt*3}});
  // camera
  const W=WPN[ME.wpn];if(ME.car){const car=ME.car;if(Math.abs(input.mdx)+Math.abs(input.mdy)>0)lastMouse=performance.now();if(performance.now()-lastMouse>1300&&Math.abs(car.vf)>2){const want=car.vf>=0?car.yaw+PI:car.yaw;K.CAM.yaw+=angDiff(K.CAM.yaw,want)*Math.min(1,dt*2.5);K.CAM.pitch+=(.2-K.CAM.pitch)*Math.min(1,dt*2)}K.camUpdate(car.pos,dt,{dist:car.S.L+3.4,side:0,h:car.S.sh==='truck'?3:car.S.sh==='van'?2.4:1.8,fov:68+Math.min(18,Math.abs(car.vf)*.35)})}
  else{const sc=ME.aim&&W.scope;K.camUpdate(ME.pos,dt,{dist:sc?.3:ME.aim?1.7:3.8,side:sc?0:ME.aim?.62:.5,h:ME.crouch?1.15:1.58,fov:sc?16:ME.aim?52:70,aim:ME.aim})}
  scope.style.display=!ME.car&&ME.aim&&W.scope?'block':'none';ME.ch.g.visible=!(!ME.car&&ME.aim&&W.scope);
  // HUD
  const H2=K.H;K.bar(H2.hp,ME.hp/100);K.bar(H2.ar,ME.armor>0?ME.armor/100:null);K.bar(H2.st,!ME.car&&ME.stam<.99?ME.stam:null);K.bar(H2.ot,ME.car?ME.car.hp/ME.car.S.hp:null);
  H2.money.textContent='$'+ME.money.toLocaleString();const hh=Math.floor(hour),mm=Math.floor((hour-hh)*60);clockEl.textContent=(hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm;
  if(ME.car)H2.wep.textContent=ME.car.S.n+' · '+Math.round(Math.abs(ME.car.vf)*3.6)+' km/h'+(RADIO.st?' · 📻 '+RADIO.names[RADIO.st].split(' ·')[0]:'');else H2.wep.textContent=W.n+(W.mag?'  '+(ME.mag[ME.wpn]||0)+' / '+(ME.ammo[ME.wpn]||0):W.thrown?'  ×'+(ME.ammo.grenade||0):'')+(ME.reload>0?'  (reloading)':'');
  const fl=WANT.lvl>0&&WANT.unseen>0&&Math.floor(performance.now()/300)%2;let sh='';for(let i=1;i<=5;i++)sh+=i<=WANT.lvl?(fl?'<b style="opacity:.35">★</b>':'<b>★</b>'):'☆';if(H2.stars._v!==sh){H2.stars.innerHTML=sh;H2.stars._v=sh}
  H2.x.className='bk-x'+(ME.car||W.melee?' dot':'');H2.x.style.display=ME.car?'none':'block';ME.hurt=Math.max(0,ME.hurt-dt*.8);K.hurtFx(ME.hurt*.8+(ME.hp<30?.35:0));
  tAcc+=dt;if(tAcc>.2){tAcc=0;const an=areaName(mePos().x,mePos().z);if(an!==lastArea){lastArea=an;areaEl.innerHTML=an+'<small>HARBOR CITY</small>';areaEl.classList.add('on');areaT=3}}areaT-=dt;if(areaT<=0)areaEl.classList.remove('on');
  drawMini();
  if((tAcc2+=dt)>.4){tAcc2=0;lampLights()}if(ME.car&&night>.2){const car=ME.car,fw=cfwd(car);HEADL.position.copy(car.pos).addScaledVector(fw,car.S.L/2).add(new V3(0,.8,0));HEADL.target.position.copy(car.pos).addScaledVector(fw,25);HEADL.intensity=night*6}else HEADL.intensity=0;
  // the water ripples
  if(K.water)K.water.material.normalMap.offset.set(performance.now()/60000,performance.now()/90000)}
st3.onFrame(update);
window.__NH=window.__BK={ME,CARS,PEDS,MISSION,MS,fireRay,spawnPed,WPN,startMission,nextStep,WANT,setWanted,PL,K,newGame,spawnCar,enterCar,exitCar,giveWeapon,selectWpn,STATS,JOB,sim(n,dt){for(let i=0;i<n;i++)update(dt||1/30);return this.tick()},tele(x,z){if(ME.car)exitCar(true);ME.pos.set(x,K.groundAt(x,z,50,.3),z)},setHour(h){hour=h},started:()=>started,INTRO,PKGS,PKG_POS,explode,POL,GANG,
  tick(){return{cars:CARS.length,peds:PEDS.length,lvl:WANT.lvl,m:MISSION.i,act:MISSION.active&&MISSION.active.def.name,step:MISSION.active&&MISSION.active.step,obj:MISSION.active&&MISSION.active.obj}}};
return()=>{K.dispose();try{if(RADIO.g)RADIO.g.disconnect()}catch(e){}st3.dispose()}})}
G.push({id:'neonharbor',name:'Neon Harbor',kind:'game',wide:true,big:true,major:true,tags:['open world','crime','driving','shooter'],tint:'#ff4a8a',
  blurb:'An open-world crime story in the spirit of GTA. Steal any car, fight a five-star police chase with helicopters, and work through 8 story missions to take Harbor City from the Red Kings. Includes weapon shops, a respray shop, taxi and vigilante jobs, radio stations, a day and night cycle and hidden packages.',fmt:b=>Math.floor(b/1000)+' missions',
  art:'<defs><linearGradient id="nhS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1040"/><stop offset=".7" stop-color="#ff4a8a"/><stop offset="1" stop-color="#ffb04a"/></linearGradient></defs><rect width="120" height="72" fill="url(#nhS)"/><path d="M0 50V30h8V18h10v14h6V8h12v26h8V22h10v30h6V14h14v36h8V26h10v24h10v22H0z" fill="#12102a"/><g fill="#ffd890" opacity=".8"><rect x="27" y="12" width="2" height="2"/><rect x="31" y="18" width="2" height="2"/><rect x="66" y="18" width="2" height="2"/><rect x="70" y="26" width="2" height="2"/><rect x="95" y="32" width="2" height="2"/></g><rect y="56" width="120" height="16" fill="#26243a"/><path d="M0 63h120" stroke="#ffd23f" stroke-width="1" stroke-dasharray="6 5"/><path d="M34 60l6-5h18l7 5h6v5H30v-5z" fill="#ff2a8a"/><circle cx="40" cy="66" r="3" fill="#111"/><circle cx="62" cy="66" r="3" fill="#111"/><path d="M84 52l3 2 3-2-1 4 3 3h-4l-1 3-1-3h-4l3-3z" fill="#ffd23f"/>',
  run(root,c){return neonHarbor(root,c)}});
