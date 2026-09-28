/* ================= combat ================= */
function comboHit(){P.combo++;P.comboT=2.2;if(P.combo>=3){HUD.combo.textContent=P.combo+' HITS';HUD.combo.style.opacity=1}}
function pStart(kind){if(P.atk||P.stun>0||P.down>0||P.dead)return;let mv;const broken=EN.find(e=>!e.dead&&e.broken>0&&e.pos.distanceTo(P.pos)<2.4);
  if(kind==='light'&&broken){mv=MOVES.take;P.atk={mv,t:0,hit:false,tgt:broken};broken.held=1;return}
  if(kind==='light'){if(P.wep){mv=MOVES.wep[P.chain%3]}else mv=MOVES.light[P.chain%5];P.chain++;P.chainT=.7}
  else if(kind==='heavy'){if(input.keys.c&&has('sweep'))mv=MOVES.sweep;else{mv=MOVES.heavy[P.heavyChain%2];P.heavyChain++}P.chainT=.7}
  else if(kind==='focus'){if(P.focus<100||!has('focus'))return;P.focus=0;mv=MOVES.focus;slow=.9;K.snd({tone:200,tone2:600,tdur:.5,wave:'sine',tvol:.5,vol:.3})}
  // face best target in input direction
  const t=pickTarget();if(t)P.yaw=Math.atan2(t.pos.x-P.pos.x,t.pos.z-P.pos.z);P.atk={mv,t:0,hit:false,lunge:t&&t.pos.distanceTo(P.pos)>mv.r-.2&&t.pos.distanceTo(P.pos)<mv.r+2?t:null};K.SFX.swing(P.pos)}
function pickTarget(){const cy=K.CAM.yaw,fw=new V3(-Math.sin(cy),0,-Math.cos(cy)),rt=new V3(Math.cos(cy),0,-Math.sin(cy));const k=input.keys;let mx=(k.d?1:0)-(k.a?1:0)+input.joy.x,mz=(k.w?1:0)-(k.s?1:0)-input.joy.y;const dir=Math.hypot(mx,mz)>.1?fw.multiplyScalar(mz).addScaledVector(rt,mx).normalize():new V3(Math.sin(P.yaw),0,Math.cos(P.yaw));
  let best=null,bs=-1;for(const e of EN){if(e.dead||e.room!==P.room)continue;const to=e.pos.clone().sub(P.pos).setY(0);const d=to.length();if(d>5)continue;const s=to.normalize().dot(dir)*1.2-d*.18;if(s>bs){bs=s;best=e}}return best}
function pHit(){const a=P.atk,mv=a.mv;const f=new V3(Math.sin(P.yaw),0,Math.cos(P.yaw));const dm=mv.d*ageDmg()*(P.wep&&has('weapons')?1.25:1);let any=false;
  if(mv===MOVES.take){const e=a.tgt;if(e&&!e.dead){if(e.boss&&e.hp>e.maxHp*.25){e.hp-=e.maxHp*.28;e.broken=0;e.post=0;e.down=1.2;K.banner('TAKEDOWN','','#ffd23f',1000)}else killE(e,true);K.SFX.punch(e.pos);K.CAM.shake=.6;P.hp=Math.min(P.maxHp,P.hp+12);K.burst(e.pos.x,1.2,e.pos.z,20,4,.5,.07,.03,0x9a0a0a,0x3a0000,1,9,1);e.held=0}return}
  for(const e of EN){if(e.dead||e.room!==P.room)continue;const to=e.pos.clone().sub(P.pos).setY(0);const d=to.length();if(d>mv.r+e.r)continue;if(!mv.aoe&&to.normalize().dot(f)<.3)continue;any=true;
    const blocked=!mv.aoe&&mv!==MOVES.focus&&e.stun<=0&&e.down<=0&&!e.atk&&e.broken<=0&&Math.random()<e.guard;
    if(blocked){e.post+=mv.p*.8;e.act='guard';K.SFX.clang(e.pos);K.burst(e.pos.x,1.3,e.pos.z,6,3,.2,.05,.02,0xffffff,0xaaaaaa,1,9,1);if(e.kind==='fighter'&&Math.random()<.35){e.cool=0;e.counter=1}}
    else{e.hp-=dm;e.post+=mv.p;comboHit();P.focus=Math.min(100,P.focus+5);K.SFX.punch(e.pos);K.burst(e.pos.x,1.4*e.sc,e.pos.z,6,3,.25,.05,.02,0xffe0c0,0xaa6040,1,9,1);K.hitmark(e.hp<=0);
      if(!e.armor||mv.push>=4||mv.down){e.act='hit';e.actK=0;if(!e.atk||e.atk.t<e.atk.windup*.7)e.atk=null;e.stun=Math.max(e.stun,.3)}if(mv.push){e.kv.copy(f).multiplyScalar(mv.push*(e.armor?.4:1))}if(mv.down&&!e.boss){e.down=1.4;e.atk=null}
      if(P.wep){P.wep.dur--;if(P.wep.dur<=0){K.note('Your '+P.wep.k+' broke!');P.wep=null;K.holdItem(P.ch,null)}}if(e.hp<=0)killE(e)}
    if(e.post>=e.maxPost&&!e.broken&&!e.dead){e.broken=2.8;e.stun=2.8;e.atk=null;K.snd({tone:200,tone2:100,tdur:.4,wave:'square',tvol:.3,vol:.3});K.note('Structure broken! Strike for a takedown.','#ffd23f')}}
  if(!any)K.snd({noise:1,ft:'bandpass',f:900,q:1,dur:.12,vol:.1})}
function eAttack(e){const heavy=e.kind==='brute'||Math.random()<(e.boss?.3:.12);const unblock=e.boss?Math.random()<.2:e.kind==='brute'&&Math.random()<.3;const acts=e.w==='bat'||e.w==='pipe'||e.w==='katana'||e.w==='staff'?['slashR','slashL','overhead']:e.w==='knife'?['thrust','slashR']:['punchR','punchL','hook','kick'];
  e.atk={type:heavy?(e.w?'overhead':'kick'):pick(acts),t:0,windup:e.wind*(heavy?1.4:1)*(e.phase>1?.8:1),hit:false,dmg:e.dmg*(heavy?1.6:1)*(e.boss?1.1:1),unblock};e.atk.dur=e.atk.windup+.3;if(unblock){K.snd({tone:1200,tone2:800,tdur:.25,wave:'triangle',tvol:.3,vol:.3});e.glow=.6}}
function eStrike(e){const a=e.atk;const to=P.pos.clone().sub(e.pos).setY(0);const d=to.length();if(d>1.9*e.sc+.4||new V3(Math.sin(e.yaw),0,Math.cos(e.yaw)).dot(to.normalize())<.35){K.SFX.swing(e.pos);return}if(P.iframe>0)return;
  if(P.block&&!a.unblock){const win=has('deflect')?.28:.18;if(P.blockT<win){e.post+=has('deflect')?34:24;e.stun=.6;e.atk=null;K.SFX.clang(e.pos);K.flash(e.pos.clone().add(new V3(0,1.4,0)),0xffffff,4,5,.08);K.burst((e.pos.x+P.pos.x)/2,1.4,(e.pos.z+P.pos.z)/2,16,6,.25,.05,.02,0xffffff,0xffd080,1,12,1);P.focus=Math.min(100,P.focus+14);RUN.parries++;if(e.post>=e.maxPost&&!e.broken){e.broken=2.8;e.stun=2.8;K.note('Structure broken! Strike for a takedown.','#ffd23f')}return}
    P.st+=a.dmg*1.4*(has('iron')?.7:1);K.SFX.clang(P.pos);if(P.st>=P.maxSt){P.st=P.maxSt*.4;P.stun=1.2;K.note('Guard broken!','#ff6a4a');hurtP(a.dmg*.5)}return}
  hurtP(a.dmg);if(a.type==='kick'||a.type==='overhead'){P.kv=to.clone().normalize().multiplyScalar(3)}}
function hurtP(d){if(P.dead)return;P.hp-=d;P.atk=null;P.stun=Math.max(P.stun,.3);P.combo=0;HUD.combo.style.opacity=0;K.SFX.hurt();K.hurtFx(.6);K.CAM.shake=Math.max(K.CAM.shake,.35);P.ch.act='hit';if(P.hp<=0){P.hp=0;die()}}
function stepE(e,dt){const C=e.ch;if(e.dead){e.deadT+=dt;K.ragdoll(C,null,dt);C.g.position.copy(e.pos);return}if(e.room!==P.room){C.g.position.copy(e.pos);K.pose(C,'idle',dt,0,{up:'guard'});return}
  e.cool-=dt;e.stun=Math.max(0,e.stun-dt);e.down=Math.max(0,e.down-dt);e.glow=Math.max(0,(e.glow||0)-dt);if(e.broken>0){e.broken-=dt;if(e.broken<=0)e.post=e.maxPost*.4}else if(!e.atk)e.post=Math.max(0,e.post-dt*(e.hp/e.maxHp>.5?6:3));if(e.act){e.actK+=dt*4;if(e.actK>=1)e.act=null}
  if(e.kv.lengthSq()>.01){e.pos.addScaledVector(e.kv,dt);e.kv.multiplyScalar(1-dt*6);const before=e.pos.clone();K.collide(e.pos,e.r,0,1.8);if(before.distanceTo(e.pos)>.02&&e.kv.length()>2){e.hp-=6;e.stun=Math.max(e.stun,.8);e.post+=15;K.SFX.punch(e.pos);K.CAM.shake=.3;e.kv.set(0,0,0)}}
  if(e.boss&&e.phase===1&&e.hp<e.maxHp*.5){e.phase=2;e.spd*=1.2;e.guard=Math.min(.75,e.guard+.15);K.banner(e.name.toUpperCase(),'is furious','#ff5a3a',1800)}
  const to=P.pos.clone().sub(e.pos).setY(0),d=to.length(),want=Math.atan2(to.x,to.z);let spd=0,st='idle',up='guard';
  if(e.down>0){st='idle';C.g.rotation.x=-PI/2*.9;C.g.position.set(e.pos.x,.2,e.pos.z);K.pose(C,'idle',dt,0,{});return}C.g.rotation.x=0;
  if(e.held){st='idle'}else if(e.stun>0){st=e.broken>0?'cower':'idle';up=null}
  else if(e.atk){const a=e.atk;a.t+=dt;e.yaw+=angDiff(e.yaw,want)*Math.min(1,dt*(a.t<a.windup*.6?7:1.5));e.act=a.type;e.actK=a.t<a.windup?.2*(a.t/a.windup):.2+.8*Math.min(1,(a.t-a.windup)/.3);if(a.t<a.windup&&d>1.4)e.pos.addScaledVector(to.clone().normalize(),dt*2);if(!a.hit&&a.t>=a.windup){a.hit=true;eStrike(e)}if(e.atk&&a.t>=a.dur){e.atk=null;e.cool=rnd(.7,1.8)*(e.boss?.7:1)}}
  else{e.yaw+=angDiff(e.yaw,want)*Math.min(1,dt*7);const attackers=EN.filter(o=>!o.dead&&o.atk&&o.room===P.room).length;const opt=1.5*e.sc;const lim=e.boss?9:2;
    if(d>opt+.3&&(attackers<lim||d>4)){spd=d>5?e.spd*1.3:e.spd;e.pos.addScaledVector(to.clone().normalize(),spd*dt)}else if(d<3.5&&attackers>=lim&&!e.boss){const side=new V3(-to.z,0,to.x).normalize().multiplyScalar(e.strafe);e.pos.addScaledVector(side,1.2*dt);if(d<2.6)e.pos.addScaledVector(to.clone().normalize(),-1.4*dt);spd=1.2}
    if(d<opt+.6&&(e.cool<=0||e.counter)&&attackers<lim&&P.hp>0){e.counter=0;eAttack(e)}}
  for(const o of EN){if(o===e||o.dead)continue;const ox=e.pos.x-o.pos.x,oz=e.pos.z-o.pos.z,od=Math.hypot(ox,oz),rr=e.r+o.r+.25;if(od<rr&&od>1e-3){e.pos.x+=ox/od*(rr-od)*.5;e.pos.z+=oz/od*(rr-od)*.5}}const pd=Math.hypot(e.pos.x-P.pos.x,e.pos.z-P.pos.z);if(pd<e.r+.4&&pd>1e-3){e.pos.x+=(e.pos.x-P.pos.x)/pd*(e.r+.4-pd);e.pos.z+=(e.pos.z-P.pos.z)/pd*(e.r+.4-pd)}K.collide(e.pos,e.r,0,1.8);
  if(spd)st=spd>4?'run':'walk';K.pose(C,st,dt,spd,{up:e.atk?null:up,act:e.act,k:e.actK,fast:!!e.atk});C.g.position.copy(e.pos);C.g.rotation.y=e.yaw;if(e.glow>0){C.g.traverse(o=>{})}}
