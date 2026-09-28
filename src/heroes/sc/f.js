/* ---------- player update ---------- */
let started=false,useLatch=false,tdLatch=false,fireLatch=false,shotCool=0;
function stepPlayer(dt){const I=input,k=I.keys;if(P.dead||P.won){K.pose(P.ch,'idle',dt,0,{});return}
  P.violentT=Math.max(0,P.violentT-dt);P.sneakyT=Math.max(0,P.sneakyT-dt);P.busy=Math.max(0,P.busy-dt);shotCool-=dt;if(P.act){P.actK+=dt*1.5;if(P.actK>=1)P.act=null}
  let mx=(k.d||k.arrowright?1:0)-(k.a||k.arrowleft?1:0)+I.joy.x,mz=(k.w||k.arrowup?1:0)-(k.s||k.arrowdown?1:0)-I.joy.y;const ml=Math.hypot(mx,mz);if(ml>1){mx/=ml;mz/=ml}
  const cy=K.CAM.yaw,fw=new V3(-Math.sin(cy),0,-Math.cos(cy)),rt=new V3(Math.cos(cy),0,-Math.sin(cy));const dir=fw.clone().multiplyScalar(mz).addScaledVector(rt,mx);
  P.aim=I.right&&['pistol','coin','wrench','crowbar'].includes(P.item);const run=k.shift&&!P.drag&&!P.crouch;const spT=P.busy>0||ml<.05?0:P.drag?1.3:P.crouch?1.6:P.aim?1.6:run?5.2:2.5;P.spd=lerp(P.spd,spT*Math.min(1,ml||1),Math.min(1,dt*10));
  if(P.spd>.05&&ml>.02){P.pos.addScaledVector(dir.clone().normalize(),P.spd*dt)}K.collide(P.pos,.3,0,1.7);P.pos.y=0;
  if(P.aim||performance.now()/1000-(P.lastShot||-9)<.6)P.yaw+=angDiff(P.yaw,Math.atan2(fw.x,fw.z))*Math.min(1,dt*14);else if(P.spd>.3&&ml>.02)P.yaw+=angDiff(P.yaw,Math.atan2(dir.x,dir.z))*Math.min(1,dt*10);
  if(P.drag){const b=P.drag;const back=P.pos.clone().add(new V3(-Math.sin(P.yaw)*1.1,0,-Math.cos(P.yaw)*1.1));b.pos.lerp(back,Math.min(1,dt*8));b.ch.g.position.copy(b.pos);b.ch.g.rotation.y=P.yaw+PI}
  const trig=(I.down&&I.locked)||I.fire;if(trig&&!fireLatch&&P.busy<=0){if(P.item==='pistol'&&shotCool<=0){shootPistol();shotCool=.35}else if(P.item==='coin')throwCoin();else if(P.item==='wrench'||P.item==='crowbar'){if(P.inv[P.item]>0)throwWrench()}}fireLatch=trig&&P.item!=='pistol';
  const td=k.f||I.jumpBtn;if(td&&!tdLatch&&P.busy<=0&&!P.drag)takedown();tdLatch=td;
  const act=findAction();K.prompt(act?'E':null,act?act.text:'');const use=k.e||I.alt;if(use&&!useLatch&&act&&P.busy<=0)act.fn();useLatch=use;
  if(performance.now()/1000-P.lastHurt>6)P.hp=Math.min(100,P.hp+dt*4);
  const st=P.crouch?(P.spd>.3?'crouchwalk':'crouch'):P.spd>4?'run':P.spd>.3?'walk':'idle';const up=P.aim&&P.item==='pistol'?'aim1':P.drag?'carry':null;P.ch.aimPitch=clamp(-(K.CAM.pitch-.2),-.8,.8);K.pose(P.ch,st,dt,P.spd,{up,act:P.act,k:P.actK,fast:!!P.act});P.ch.g.position.copy(P.pos);P.ch.g.rotation.y=P.yaw}
/* ---------- HUD ---------- */
let hudT=0;function updHUD(){const tg=NPCS.filter(n=>n.role==='target');UI.tg.innerHTML='<div style="opacity:.7;font-size:11px;letter-spacing:.12em">TARGETS</div>'+tg.map(t=>'<div class="'+(t.dead?'done':'')+'"><i></i>'+t.name+'</div>').join('');
  const cl=cellAt(P.pos.x,P.pos.z);const hostile=NPCS.some(n=>n.state==='combat'&&!n.dead&&!n.ko);const sus=NPCS.some(n=>n.sus>.3&&!n.dead&&!n.ko);const tres=!allowed();
  UI.st.innerHTML='<b>'+OUT[P.outfit].n+'</b>'+(hostile?'<b class="bad">COMBAT</b>':alarmT>0?'<b class="bad">SEARCHING</b>':tres?'<b class="warn">TRESPASSING</b>':sus?'<b class="warn">SUSPICIOUS</b>':'<b class="ok">BLENDING IN</b>')+(P.blown[P.outfit]?'<b class="bad">DISGUISE BLOWN</b>':'')+(P.spotted?'':'')+'<br><small style="opacity:.8">'+((cl&&(cl.room||cl.area))||'Grounds')+'</small>';
  UI.it.innerHTML=INAME[P.item]+(P.item==='pistol'?' · '+P.inv.ammo:P.inv[P.item]>1&&P.item!=='wire'?' ×'+P.inv[P.item]:'')+'<small>'+IORDER.filter(t=>t==='none'||P.inv[t]>0).map((t,i2)=>(IORDER.indexOf(t)+1)+':'+INAME[t].split(' ').pop()).join('  ')+'</small>'+(P.drag?'<small>Dragging a body (G drops)</small>':'');K.bar(K.H.hp,P.hp/100);K.bar(K.H.ar,null);K.bar(K.H.st,null);K.bar(K.H.ot,null)}
/* ---------- input ---------- */
c.on(document,'keydown',e=>{if(!started)return;const k2=e.key.toLowerCase();if(e.repeat)return;const on=K.H.menu.classList.contains('on');if(k2==='p'){if(on)K.menuOff();else if(LV)pauseMenu();return}if(k2==='m'&&LV){if(on)K.menuOff();else mapMenu();return}if(on||P.dead||P.won)return;
  if(k2==='c')P.crouch=!P.crouch;else if(k2==='g')toggleDrag();else if(/^[1-7]$/.test(k2)){const t=IORDER[+k2-1];if(t==='none'||P.inv[t]>0)equipItem(t)}});
c.on(document,'keydown',e=>{if(e.key.toLowerCase()==='q')P.inst=true});c.on(document,'keyup',e=>{if(e.key.toLowerCase()==='q')P.inst=false});
function equipItem(t){P.item=t;K.holdItem(P.ch,t==='pistol'?K.gunMesh('pistol'):t==='wrench'||t==='crowbar'?K.gunMesh('bat'):t==='wire'?K.gunMesh('wire'):null);K.SFX.ui()}
function toggleDrag(){if(P.drag){P.drag.drag=false;P.drag=null;return}let best=null,bd=1.8;for(const n of NPCS){if(!(n.dead||n.ko)||n.hidden||n.fall)continue;const d=n.pos.distanceTo(P.pos);if(d<bd){bd=d;best=n}}if(best){P.drag=best;best.drag=true}}
K.touchBtn('ITEM',()=>{const own=IORDER.filter(t=>t==='none'||P.inv[t]>0);equipItem(own[(own.indexOf(P.item)+1)%own.length])});K.touchBtn('AIM',v=>{input.right=v},true);K.touchBtn('DRAG',()=>toggleDrag());K.touchBtn('CROUCH',()=>{P.crouch=!P.crouch});K.touchBtn('INSTINCT',v=>{P.inst=v},true);K.touchBtn('MAP',()=>LV&&mapMenu());K.touchBtn('MENU',()=>LV&&pauseMenu());
/* ---------- main loop ---------- */
function update(dtRaw){const dt=Math.min(dtRaw,.05);if(!LV){camera.position.set(0,40,60);camera.lookAt(0,0,0);return}if(K.H.menu.classList.contains('on'))return;
  perceive(dt);stepLater(dt);for(const n of NPCS)stepNPC(n,dt);stepPlayer(dt);stepCoins(dt);alarmT=Math.max(0,alarmT-dt);
  for(const op of OPS)if(op.obj&&op.done&&op.obj.position.y>.7){op.obj.position.y=Math.max(.7,op.obj.position.y-dt*18)}
  UI.inst.classList.toggle('on',P.inst);K.camUpdate(P.pos,dt,{dist:P.aim?2:3.8,side:P.aim?.6:.45,h:P.crouch?1.2:1.6,fov:P.aim?48:62,aim:P.aim});
  hudT-=dt;if(hudT<=0){hudT=.15;updHUD()}if(!P.won&&!P.dead&&NPCS.length){}}
st3.onFrame(update);
levelMenu();
window.__SC=window.__BK={P,NPCS,OPS,HIDES,ITEMS,K,startLevel,findAction,takedown,killNPC,koNPC,toggleDrag,finish,allowed,cellAt,tw,SC_LEVELS,sim(n,dt){for(let i=0;i<n;i++)update(dt||1/30);return this.tick()},tick(){return{hp:P.hp|0,outfit:P.outfit,t:P.kills.t,nt:P.kills.nt,spotted:P.spotted,found:P.found,alarm:alarmT|0,combat:NPCS.filter(n=>n.state==='combat').length,sus:NPCS.filter(n=>n.sus>.3).length,pos:[P.pos.x|0,P.pos.z|0]}},equipItem,get LV(){return LV}};
return()=>{K.dispose();st3.dispose()}})}
G.push({id:'contract',name:'Silent Contract',kind:'game',wide:true,big:true,major:true,tags:['stealth','assassin','disguise'],tint:'#1a1a22',
  blurb:'A stealth assassination sandbox in the spirit of Hitman. Three contracts (a lakeside villa party, a coastal village and a rooftop penthouse) with disguises, trespassing and suspicion, body hiding, coin distractions, accident kills, and Silent Assassin ratings.',fmt:b=>b.toLocaleString()+' pts',
  art:'<rect width="120" height="72" fill="#16161c"/><rect y="52" width="120" height="20" fill="#2a2a34"/><circle cx="60" cy="22" r="11" fill="#d8b090"/><path d="M42 72l4-26 14-8 14 8 4 26z" fill="#0a0a0c"/><path d="M56 38l4 14 4-14z" fill="#f0f0f0"/><path d="M59 40l1 12 1-12z" fill="#c8201a"/><rect x="34" y="16" width="52" height="2" fill="#c8201a" opacity=".0"/><path d="M92 10l3 6-6 0z" fill="#c8201a"/><circle cx="92" cy="30" r="2" fill="#c8201a"/>',
  run(root,c){return silentContract(root,c)}});
