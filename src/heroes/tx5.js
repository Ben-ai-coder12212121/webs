/* ---------------- bots ---------------- */
const TEAMINFO={T:{seen:null,t:0},CT:{seen:null,t:0}};
function newAI(p,plan){const A={plan,path:null,goal:null,t:rnd(0,.2),react:0,target:null,alert:null,hold:null,watch:null,stuck:0,strafe:Math.random()<.5?1:-1,strT:0,burst:0,route:null,ri:0,lastSeen:null,role:Math.random(),waitT:0,thrown:false,repath:0,bad:new Set(),jumpAt:rnd(.1,.85)};
  if(!ROY){const tm=p.team;if(tm==='T'){const site=plan==='split'?(A.role<.5?'A':'B'):plan==='mid'?(A.role<.4?'A':'B'):plan;A.site=site;A.route=site==='A'?(A.role<.55?WAY.long:WAY.short):(A.role<.7||plan==='B'?WAY.btun:WAY.midb);A.waitT=plan==='split'||plan==='mid'?rnd(15,35):rnd(0,6)}
    else{const r=A.role;const set=r<.42?WAY.holdA:r<.84?WAY.holdB:WAY.holdM;const h=set[Math.floor(Math.random()*set.length)];A.hold={x:h[0][0],z:h[0][1]};A.watch={x:h[1][0],z:h[1][1]};A.site=r<.42?'A':r<.84?'B':'M'}}return A}
function canSee(p,q){const e={x:p.x,y:eyeY(p),z:p.z};const d=Math.hypot(q.x-p.x,q.z-p.z);if(d>(ROY?130:90))return false;if(p.flashT>.8)return false;const a=Math.atan2(-(q.x-p.x),-(q.z-p.z));let da=a-p.yaw;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>1.2&&d>2.5)return false;if(ROY&&q.crouchT>.5&&d>40&&Math.random()<.5)return false;return losClear(e,{x:q.x,y:eyeY(q)-.05,z:q.z},true)||losClear(e,{x:q.x,y:q.y+1.1,z:q.z},true)}
function turnTo(p,tx,tz,rate,dt,pitchT){const ty=Math.atan2(-(tx-p.x),-(tz-p.z));let dy=ty-p.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));p.yaw+=clamp(dy,-rate*dt,rate*dt);if(pitchT!=null)p.pitch+=clamp(pitchT-p.pitch,-rate*dt,rate*dt);return Math.abs(dy)}
function moveDir(p,gx,gz,inp){const fx=-Math.sin(p.yaw),fz=-Math.cos(p.yaw),rx=Math.cos(p.yaw),rz=-Math.sin(p.yaw);const dx=gx-p.x,dz=gz-p.z;const df=dx*fx+dz*fz,dr=dx*rx+dz*rz,l=Math.hypot(df,dr)||1;inp.f=df/l>.35;inp.b=df/l<-.35;inp.r=dr/l>.35;inp.l=dr/l<-.35}
function botThink(p,dt,now){const A=p.ai;if(!A)return{};const inp={};A.t-=dt;if(p.flashT>1.2){inp.b=Math.random()<.5;inp.l=Math.random()<.5;if(Math.random()<.05)inp.fire=1;return inp}
  if(ROY&&p.inPlane){if(plane.t*plane.sp/plane.len>A.jumpAt)jumpOut(p);return{}}
  if(ROY&&(p.air||p.chute)&&!p.onGround){if(!A.land){const b=pick(BLD);A.land={x:b.x+b.w/2,z:b.z+b.d+2}}p.yaw=Math.atan2(-(A.land.x-p.x),-(A.land.z-p.z));p.pitch=Math.hypot(A.land.x-p.x,A.land.z-p.z)<60?-.8:-.2;inp.f=Math.hypot(A.land.x-p.x,A.land.z-p.z)>4;return inp}
  const sk=[{rt:.62,aim:3.2,err:.03,comp:.35},{rt:.38,aim:5.5,err:.017,comp:.65},{rt:.22,aim:9,err:.008,comp:.9}][diff];
  if(A.t<=0){A.t=rnd(.1,.18);let best=null,bd=1e9;for(const q of players){if(!q.alive||q.inPlane||q===p||(!ROY&&q.team===p.team))continue;const d=Math.hypot(q.x-p.x,q.z-p.z);if(d<bd&&canSee(p,q)){bd=d;best=q}}
    if(best){best.seenT=2;if(A.target!==best){A.target=best;A.react=sk.rt+rnd(0,.2)+(best.crouchT>.5?.1:0)}A.lastSeen={x:best.x,z:best.z,t:5};if(!ROY){TEAMINFO[p.team].seen={x:best.x,z:best.z,site:inSite(best.x,best.z)};TEAMINFO[p.team].t=now}}else A.target=null}
  const W=WPN[p.cur]||{};const unarmed=!p.inv[1]&&!p.inv[2]&&!p.inv[4];
  if(A.target&&A.target.alive&&!(ROY&&unarmed&&Math.hypot(A.target.x-p.x,A.target.z-p.z)>6)){const q=A.target,d=Math.hypot(q.x-p.x,q.z-p.z);A.react-=dt;
    if(W.cls==='gren'||W.cls==='bomb'&&!(p.plantT>0))equip(p,bestSlot(p));
    const head=diff===2?.7:diff===1?.45:.2;const aimY=Math.random()<head?eyeY(q)-.03:q.y+1.15-q.crouchT*.4;const lead=.06;const ax=q.x+q.vx*lead,az=q.z+q.vz*lead;const tp=Math.atan2(aimY-eyeY(p),Math.hypot(ax-p.x,az-p.z));
    const comp=W.pat?(()=>{const pt=PAT[W.pat],i=Math.min(Math.floor(p.rcI),pt.length-1);return[pt[i][0]*PI/180*sk.comp,pt[i][1]*PI/180*sk.comp]})():[0,p.kickP*sk.comp];
    const err=sk.err*(A.react>0?3:1)*(1+Math.min(2,q.spd/3));const ty=Math.atan2(-(ax-p.x),-(az-p.z))+comp[0]+(Math.random()-.5)*err;let dy=ty-p.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));const rate=sk.aim*dt;p.yaw+=clamp(dy,-rate,rate);p.pitch+=clamp(tp-comp[1]-p.pitch+(Math.random()-.5)*err*.6,-rate,rate);
    if(W.cls==='melee'||unarmed){if(!unarmed)equip(p,bestSlot(p));moveDir(p,q.x,q.z,inp);if(d<1.8)inp.fire=1;if(!unarmed&&p.cur==='knife')equip(p,bestSlot(p))}
    else{const am=p.ammo[p.cur];if(am&&am.mag===0){if((ROY?(p.ammoR[AMMOT(p.cur)]||0):am.res)>0)reload(p);else equip(p,p.inv[2]&&p.cur!==p.inv[2]?p.inv[2]:'knife')}
      if(W.cls==='sniper'&&!p.scoped&&d>8)p.scoped=1;
      const stopped=p.spd<(W.spd||250)*U2M*.34+.2;const ok=A.react<=0&&Math.abs(dy)<.06+err+(d<8?.1:0);const burstN=W.auto?(d<9?30:d<22?5:3):1;
      if(ok&&(stopped||d<9||W.cls==='smg'||W.cls==='shotgun')){if(A.burst<burstN){inp.fire=1;A.burst++}else{A.burst=d<9?0:-Math.round(rnd(3,7))}}if(A.burst<0)A.burst++;
      A.strT-=dt;if(A.strT<=0){A.strT=rnd(.35,.9);A.strafe=-A.strafe;A.crouch=d>20&&Math.random()<.35&&W.auto}
      if(!inp.fire){if(A.strafe>0)inp.r=1;else inp.l=1}else if(d<9&&W.cls!=='sniper'){if(A.strafe>0)inp.r=1;else inp.l=1}if(A.crouch&&inp.fire)inp.c=1;if(d>45&&!inp.fire&&W.cls!=='sniper')inp.f=1;
      if(ROY&&zone&&Math.hypot(p.x-zone.cx,p.z-zone.cz)>zone.r*.92)moveDir(p,zone.nr!=null?zone.nx:zone.cx,zone.nr!=null?zone.nz:zone.cz,inp)}
    if(ROY&&p.hp<35&&p.heals.m+p.heals.b>0&&d>35)useHeal(p);return inp}
  if(A.alert&&A.alert.t>0){A.alert.t-=dt;turnTo(p,A.alert.x,A.alert.z,5,dt,0);if(!ROY&&Math.random()<.4)return inp}
  p.pitch*=.9;if(p.cur!==bestSlot(p)&&p.cur!=='bomb'&&!(WPN[p.cur]||{}).gren)equip(p,bestSlot(p));const am=p.ammo[p.cur];if(am&&am.mag<WPN[p.cur].mag*.35&&(ROY?(p.ammoR[AMMOT(p.cur)]||0):am.res)>0&&!A.target)reload(p);
  let goal=null,look=null;
  if(!ROY){if(round.phase==='freeze')return inp;const tm=p.team;
    if(tm==='T'){const site=SITES[A.site]||SITES.A;if(bomb&&bomb.st==='dropped')goal={x:bomb.x,z:bomb.z};
      else if(bomb&&bomb.st==='planted'){if(!A.post){const pp=WAY[bomb.site==='A'?'postA':'postB'];const q2=pick(pp);A.post={x:q2[0],z:q2[1]}}goal=A.post;look={x:bomb.x,z:bomb.z}}
      else{if(A.waitT>0&&round.t>70){A.waitT-=dt;if(A.route&&A.ri<2)goal={x:A.route[Math.min(1,A.route.length-1)][0],z:A.route[Math.min(1,A.route.length-1)][1]};else goal={x:p.x,z:p.z}}
        else if(A.route&&A.ri<A.route.length){const w=A.route[A.ri];goal={x:w[0],z:w[1]};if(Math.hypot(p.x-w[0],p.z-w[1])<2.2){A.ri++;if(A.ri===A.route.length-1&&p.inv.g&&p.inv.g.includes('flash')&&!A.thrown&&Math.random()<.6){A.thrown=true;equip(p,'flash');p.yaw=Math.atan2(-(site.cx-p.x),-(site.cz-p.z));p.pitch=.35;inp.fire=1;return inp}}}
        else if(p.inv[5]){const sp=A.plantSpot||(A.plantSpot={x:site.cx+rnd(-4,4),z:site.cz+rnd(-3,3)});goal=sp;if(inSite(p.x,p.z)===A.site&&Math.hypot(p.x-sp.x,p.z-sp.z)<2.5&&(!A.lastSeen||A.lastSeen.t<=0)){equip(p,'bomb');inp.fire=1;inp.c=1;return inp}}
        else goal=A.hold||(A.hold={x:site.cx+rnd(-7,7),z:site.cz+rnd(-5,5)})}}
    else{if(bomb&&bomb.st==='planted'){goal={x:bomb.x,z:bomb.z};const threat=A.lastSeen&&A.lastSeen.t>0;if(Math.hypot(p.x-bomb.x,p.z-bomb.z)<1.4&&(!threat||40-bomb.t<(p.kit?6:11))){inp.use=1;inp.c=1;return inp}}
      else{const info=TEAMINFO.T;const recent=TEAMINFO.CT.seen&&now-TEAMINFO.CT.t<6;if(recent&&TEAMINFO.CT.seen.site&&TEAMINFO.CT.seen.site!==A.site&&A.role>.3&&!A.rot){A.rot=1;const s=SITES[TEAMINFO.CT.seen.site];A.hold={x:s.cx+rnd(-5,5),z:s.cz+rnd(-4,4)};A.watch={x:TEAMINFO.CT.seen.x,z:TEAMINFO.CT.seen.z}}goal=A.hold;look=A.watch}}
    if(A.lastSeen&&A.lastSeen.t>0){A.lastSeen.t-=dt;look={x:A.lastSeen.x,z:A.lastSeen.z}}}
  else{const Z=zone;const dz=Math.hypot(p.x-Z.cx,p.z-Z.cz);const need=Z.nr!=null?Math.hypot(p.x-Z.nx,p.z-Z.nz)>Z.nr*.8:dz>Z.r*.8;
    if(p.hp<60&&p.heals.m+p.heals.b>0)useHeal(p);else if(p.heals.e>0&&p.boost<20)useHeal(p);
    if(dz>Z.r*.95||need&&(Z.phase==='shrink'||Z.t<20))goal={x:Z.nr!=null?Z.nx:Z.cx,z:Z.nr!=null?Z.nz:Z.cz};
    else{if(!A.loot||!items.includes(A.loot)){let best=null,bd=70;const want=it=>{if(it.y>groundAt(it.x,it.z,.1,it.y-1)+1.2||A.bad.has(it.id))return false;if(unarmed)return it.t==='gun'||it.t==='box';if(it.t==='gun'){const tier=ROYW[it.w],cur=Math.max(p.inv[1]?ROYW[p.inv[1]]:-1,p.inv[4]?ROYW[p.inv[4]]:-1);return !p.inv[1]||!p.inv[4]||tier>cur}if(it.t==='ammo')return Object.keys(p.ammo).some(w=>AMMOT(w)===it.a)&&(p.ammoR[it.a]||0)<150;if(it.t==='vest')return (it.lv||1)>p.armorLv;if(it.t==='helm')return (it.lv||1)>p.helmetLv;return p.heals.b+p.heals.m+p.heals.e<8};
        for(const it of items){if(!want(it))continue;const d=Math.hypot(it.x-p.x,it.z-p.z);if(d<bd){bd=d;best=it}}A.loot=best;A.lootT=0}
      if(A.loot){A.lootT+=dt;if(A.lootT>14){A.bad.add(A.loot.id);A.loot=null}}
      if(A.loot){goal={x:A.loot.x,z:A.loot.z};if(Math.hypot(p.x-A.loot.x,p.z-A.loot.z)<1.4){pickUp(p,A.loot);A.loot=null}}else{if(!A.wander||Math.hypot(p.x-A.wander.x,p.z-A.wander.z)<4)A.wander={x:clamp(Z.cx+rnd(-1,1)*Z.r*.5,15,385),z:clamp(Z.cz+rnd(-1,1)*Z.r*.5,15,385)};goal=A.wander}}
    if(A.lastSeen&&A.lastSeen.t>0){A.lastSeen.t-=dt;look={x:A.lastSeen.x,z:A.lastSeen.z}}}
  if(goal&&ROY){const gd=Math.hypot(goal.x-p.x,goal.z-p.z);if(gd>45)goal={x:p.x+(goal.x-p.x)/gd*40,z:p.z+(goal.z-p.z)/gd*40}}
  if(goal){const gk=Math.round(goal.x/(ROY?4:1.5))+','+Math.round(goal.z/(ROY?4:1.5));if(!A.path||A.gk!==gk||A.repath<=0){A.path=astar(p.x,p.z,goal.x,goal.z,ROY?9000:16000);A.gk=gk;A.repath=rnd(2.5,5)}A.repath-=dt;
    let wp=A.path&&A.path[0];if(!wp&&Math.hypot(goal.x-p.x,goal.z-p.z)>1.2)wp=[goal.x,goal.z];
    if(wp){const dx=wp[0]-p.x,dz=wp[1]-p.z,d=Math.hypot(dx,dz);if(d<.7&&A.path&&A.path.length){A.path.shift()}else{const lookFar=look&&!ROY&&Math.hypot(look.x-p.x,look.z-p.z)<40;if(lookFar){turnTo(p,look.x,look.z,4,dt,0);moveDir(p,wp[0],wp[1],inp)}else{const e=turnTo(p,wp[0],wp[1],6,dt,0);inp.f=e<1.1}
        if(!ROY&&(bomb&&bomb.st==='planted'?false:A.role<.35&&round.t<90))inp.walk=Math.hypot(p.x-goal.x,p.z-goal.z)<18;
        if(A.lastX!=null&&Math.hypot(p.x-A.lastX,p.z-A.lastZ)<dt*.5&&(inp.f||inp.l||inp.r)){A.stuck+=dt;if(A.stuck>.7){inp.j=1;A.repath=0;A.stuck=0;if(ROY&&A.loot){A.bad.add(A.loot.id);A.loot=null}}}else A.stuck=0;A.lastX=p.x;A.lastZ=p.z}}
    else if(look)turnTo(p,look.x,look.z,3,dt,0)}
  return inp}
