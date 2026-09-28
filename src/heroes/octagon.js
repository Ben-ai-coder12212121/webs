/* ================= OCTAGON: neon tunnel runner, 30 levels + endless ================= */
const OCT_CSS=`.oct .tctl{display:none!important}
.oct .hud{font:800 13px system-ui,-apple-system,Segoe UI,sans-serif;color:#fff}
.oct button{transform:none!important}
.oct-top{position:absolute;left:12px;right:12px;top:8px;padding:3px 10px;border-radius:10px;background:rgba(4,3,10,.6);display:flex;justify-content:space-between;align-items:center;gap:10px;text-shadow:0 0 8px rgba(0,0,0,.8)}
.oct-top b{font:900 18px 'Arial Black',system-ui,sans-serif;letter-spacing:.04em}
.oct-bar{position:absolute;left:12px;right:12px;top:40px;height:6px;border-radius:3px;background:rgba(4,3,10,.6);overflow:hidden}.oct-bar i{display:block;height:100%;width:0;border-radius:3px}
.oct-pct{position:absolute;left:50%;top:50px;transform:translateX(-50%);font:900 20px ui-monospace,Menlo,monospace;background:rgba(4,3,10,.75);padding:2px 12px;border-radius:999px}
.oct-ov{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(3,2,10,.78);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);pointer-events:auto;overflow:auto;padding:14px}
.oct-card{max-width:620px;width:100%;text-align:center}
.oct-card h2{margin:0 0 4px;font:900 clamp(30px,7vw,52px)/1 'Arial Black',system-ui,sans-serif;letter-spacing:.08em}
.oct-card p{margin:6px 0 12px;opacity:.8;font-weight:600}
.oct-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:7px;margin:10px 0}
.oct-grid button,.oct-btn{all:unset;cursor:pointer;padding:10px 6px;border-radius:10px;border:2px solid rgba(255,255,255,.25);font:900 15px system-ui,sans-serif;text-align:center;background:rgba(255,255,255,.06)}
.oct-grid button.done{border-color:currentColor;background:rgba(255,255,255,.14)}
.oct-grid button.lock{opacity:.3;cursor:default}
.oct-grid button small{display:block;font:700 10px system-ui,sans-serif;opacity:.7}
.oct-btn{display:inline-block;padding:11px 20px;margin:4px;border-color:currentColor}
.oct-btn.pri{background:currentColor}.oct-btn.pri span{color:#08060f}
.oct-tip{position:absolute;left:0;right:0;bottom:12px;text-align:center;font:700 12px system-ui,sans-serif;opacity:.65}
.oct-jump{all:unset;position:absolute;left:50%;bottom:18px;transform:translateX(-50%)!important;width:74px;height:74px;border-radius:50%;border:3px solid rgba(255,255,255,.7);background:rgba(255,255,255,.12);text-align:center;font:900 12px system-ui,sans-serif;pointer-events:auto;display:none}
.oct.touch .oct-jump{display:block}.oct.touch .oct-tip{display:none}
.oct-flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;transition:opacity .35s}`;
function octagonGame(root,c){return with3D(root,c,()=>{
const st3=Stage3D(root,c,{lock:false,dragLook:false,fov:70,far:200,jump:false});const{T,scene,camera,renderer,wrap,hud,input}=st3;
wrap.classList.add('oct');wrap.append(el('style',null,OCT_CSS));
const PI=Math.PI,R=2.2,SEG=2,FACE=2*R*Math.tan(PI/8),VIS=64,NL=30;
let rng=Math.random;const srand=seed=>{let s=seed>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296}};
const PAL=[[190,.9],[300,.9],[140,.85],[25,.95],[260,.85],[50,.95],[340,.9],[170,.9],[210,.9],[90,.85]];
const hsl=(h,s,l)=>new T.Color().setHSL(((h%360)+360)%360/360,s,l);
scene.background=new T.Color(0x04030a);scene.fog=new T.Fog(0x04030a,30,110);
/* ---------- geometry ---------- */
const tileTex=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');const g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,'#f2f2f2');g.addColorStop(1,'#b8b8b8');x.fillStyle=g;x.fillRect(0,0,128,128);x.strokeStyle='#ffffff';x.lineWidth=10;x.strokeRect(5,5,118,118);x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=3;x.strokeRect(13,13,102,102);const t=new T.CanvasTexture(cv);t.anisotropy=4;return t})();
const tileM=new T.MeshBasicMaterial({map:tileTex,vertexColors:false});
const tileG=new T.BoxGeometry(FACE*.95,.14,SEG*.93);
const MAXT=VIS*8;const tiles=new T.InstancedMesh(tileG,tileM,MAXT);tiles.instanceMatrix.setUsage(T.DynamicDrawUsage);tiles.frustumCulled=false;
for(let i=0;i<MAXT;i++)tiles.setColorAt(i,new T.Color(1,1,1));
const pillM=new T.MeshBasicMaterial({color:0xff2d55});const pillG=new T.BoxGeometry(FACE*.6,1.5,SEG*.55);const MAXP=160;const pills=new T.InstancedMesh(pillG,pillM,MAXP);pills.instanceMatrix.setUsage(T.DynamicDrawUsage);pills.frustumCulled=false;
const pillEdge=new T.InstancedMesh(new T.BoxGeometry(FACE*.66,1.56,SEG*.61),new T.MeshBasicMaterial({color:0xffffff,wireframe:true}),MAXP);pillEdge.frustumCulled=false;
const tun=new T.Group();tun.add(tiles,pills,pillEdge);scene.add(tun);
const rings=[];for(let i=0;i<14;i++){const pts=[];for(let k=0;k<=8;k++){const a=k*PI/4+PI/8;pts.push(new T.Vector3(Math.sin(a)*R/Math.cos(PI/8)*1.35,-Math.cos(a)*R/Math.cos(PI/8)*1.35,0))}const l=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.25}));tun.add(l);rings.push(l)}
const player=new T.Mesh(new T.BoxGeometry(.5,.5,.5),new T.MeshBasicMaterial({color:0xffffff}));const pEdge=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(.56,.56,.56)),new T.LineBasicMaterial({color:0x04030a}));player.add(pEdge);scene.add(player);
const trail=[];for(let i=0;i<7;i++){const m=new T.Mesh(new T.BoxGeometry(.4,.4,.4),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.35-i*.045,depthWrite:false}));scene.add(m);trail.push(m)}
const starG=new T.BufferGeometry(),SN=500,sp=new Float32Array(SN*3);for(let i=0;i<SN;i++){const a=Math.random()*PI*2,r=R*1.6+Math.random()*14;sp[i*3]=Math.cos(a)*r;sp[i*3+1]=Math.sin(a)*r;sp[i*3+2]=-Math.random()*120}starG.setAttribute('position',new T.BufferAttribute(sp,3));
const stars=new T.Points(starG,new T.PointsMaterial({color:0xffffff,size:.06,transparent:true,opacity:.25}));scene.add(stars);
/* ---------- level generation ---------- */
const lvSpeed=l=>9+l*.42,lvLen=l=>55+l*7;
function gen(lv,endless){const r=srand(lv*977+13),speed=lvSpeed(lv),N=endless?100000:lvLen(lv),data=[];let p=0,last=0;
  const tSeg=SEG/speed,shiftGap=Math.max(1,Math.ceil(.26/tSeg)),span=Math.floor(.52*speed/SEG);
  const allowed=['rand','strip','checker','spiral','zig','full'];if(lv>=3)allowed.push('jump');if(lv>=6)allowed.push('narrow','jump');if(lv>=11)allowed.push('spiral','zig');
  let blockLeft=0,pat='full',dens=1,phase=0;
  return{speed,N,get(i){while(data.length<=i)step(data.length);return data[i]},shiftGap,span};
  function step(i){const L=endless?Math.min(40,3+i/60):lv;
    if(i<8||(!endless&&i>=N-6)){data.push({m:255,p,pil:0,bl:0});return}
    if(blockLeft<=0){pat=allowed[r()*allowed.length|0];blockLeft=6+(r()*12|0);dens=Math.max(.18,.8-L*.022)+r()*.15;phase=r()*8|0}
    blockLeft--;
    if(pat==='jump'&&blockLeft>2&&i-last>=shiftGap){const n=Math.max(1,Math.min(span,1+(r()*span|0)));for(let k=0;k<n;k++)data.push({m:0,p,pil:0,bl:0});data.push({m:255,p,pil:0,bl:0});blockLeft-=n+1;last=data.length;if(blockLeft<=0)pat='rand';return}
    if(i-last>=shiftGap&&r()<(pat==='spiral'?.9:pat==='zig'?.7:.35)){const dir=pat==='spiral'?1:(r()<.5?-1:1);p=(p+dir+8)%8;last=i}
    let m=0;for(let f=0;f<8;f++){const d=Math.min((f-p+8)%8,(p-f+8)%8);let on;
      if(pat==='full')on=r()<.93;else if(pat==='rand')on=r()<dens;else if(pat==='strip')on=d<=1;else if(pat==='narrow')on=d===0||(d===1&&r()<.25);else if(pat==='checker')on=(f+i+phase)%2===0;else if(pat==='spiral'||pat==='zig')on=d<=1||r()<dens*.4;else on=r()<dens;
      if(on)m|=1<<f}
    m|=1<<p;if(i-last<2){m|=1<<((p+7)%8);m|=1<<((p+1)%8)}
    let pil=0,bl=0;if(L>=7)for(let f=0;f<8;f++){const d=Math.min((f-p+8)%8,(p-f+8)%8);if(d>=2&&(m>>f&1)&&r()<.06+L*.006)pil|=1<<f}
    if(L>=14)for(let f=0;f<8;f++){if(f!==p&&(m>>f&1)&&!(pil>>f&1)&&r()<.15)bl|=1<<f}
    data.push({m,p,pil,bl})}}
/* ---------- audio: procedural beat per level ---------- */
let seqT=0,step16=0,bpm=120,scale=[0,3,5,7,10],rootN=45;
function note(f,t,d,type,v,dest){try{const a=ac(),o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(dest||a.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
function kick(t){try{const a=ac(),o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(.55,t);g.gain.exponentialRampToValueAtTime(.0001,t+.25);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+.3)}catch(e){}}
function hat(t,v){try{const a=ac(),n=a.createBufferSource(),b=a.createBuffer(1,a.sampleRate*.05,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;n.buffer=b;const f=a.createBiquadFilter();f.type='highpass';f.frequency.value=7000;const g=a.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.05);n.connect(f);f.connect(g);g.connect(a.destination);n.start(t)}catch(e){}}
const mf=n=>440*Math.pow(2,(n-69)/12);let pulse=0,beatCount=0;
function music(){if(muted||state!=='play')return;const a=ac();const spb=60/bpm/4;if(seqT<a.currentTime)seqT=a.currentTime+.05;while(seqT<a.currentTime+.12){const s=step16%16,t=seqT;
  if(s%4===0){kick(t);const ms=(t-a.currentTime)*1000;setTimeout(()=>{pulse=1;beatCount++},Math.max(0,ms))}if(s%4===2)hat(t,.12);else if(s%2===1)hat(t,.04);
  const bassN=rootN+scale[[0,0,3,2][(step16>>4)%4]];if(s%2===0)note(mf(bassN-12)*(s%8===6?2:1),t,spb*1.6,'sawtooth',.07);
  if(s%3===0){const n=rootN+12+scale[(step16*7+(s>>1))%scale.length]+(s>8?12:0);note(mf(n),t,spb*1.2,'square',.035)}
  seqT+=spb;step16++}}
/* ---------- state ---------- */
let state='menu',lv=Math.min(NL,Math.max(1,S.get('oct_lv',1)|0)),endless=false,L=null,z=0,face=0,rot=0,rotT=0,air=0,vy=0,dead=0,att=1,best=S.get('oct_end',0),hue=190,won=false,fallV=0,camRoll=0,flashT=0,jh=0;
const ctrl={l:false,r:false,j:false};
const bar=el('i'),pct=el('div',{class:'oct-pct'}),lvl=el('b'),info=el('span');hud.append(el('div',{class:'oct-top'},lvl,info),el('div',{class:'oct-bar'},bar),pct);
const ov=el('div',{class:'oct-ov'}),tip=el('div',{class:'oct-tip'},'← → or A / D to switch sides · Space or ↑ to jump · Esc for the menu'),jb=el('button',{type:'button',class:'oct-jump'},'JUMP'),fl=el('div',{class:'oct-flash'});
hud.append(tip,jb,fl,ov);
function setHue(h){hue=h;const pc=hsl(h+180,1,.5);player.material.color.copy(pc);trail.forEach(m=>m.material.color.copy(pc));const col=hsl(h,.9,.6);bar.style.background=col.getStyle();pct.style.color=col.getStyle();ov.style.color=col.getStyle()}
function colorTiles(){for(let i=0;i<MAXT;i++){const f=i%8,sg=(i/8|0);tiles.setColorAt(i,hsl(hue+(f%2?0:22)+(sg%2?6:0),1,f%2?.58:.7))}tiles.instanceColor.needsUpdate=true;pillM.color=new T.Color(0x14121c)}
function menu(){state='menu';ov.style.display='flex';ov.innerHTML='';const card=el('div',{class:'oct-card'});card.append(el('h2',null,'OCTAGON'),el('p',null,'Flip between the eight sides of the tunnel. Don’t fall through the gaps.'));
  const g=el('div',{class:'oct-grid'});const done=S.get('oct_done',0)|0;for(let i=1;i<=NL;i++){const lock=i>done+1;const b=el('button',{type:'button',class:(i<=done?'done ':'')+(lock?'lock':'')},String(i),el('small',null,i<=done?'✓':lock?'🔒':(lvSpeed(i)|0)+' m/s'));b.style.color=hsl(PAL[(i-1)%PAL.length][0],.9,.6).getStyle();if(!lock)b.onclick=e=>{e.stopPropagation();start(i,false)};g.append(b)}
  const eb=el('button',{type:'button',class:'oct-btn'},'∞ Endless · best '+best+' m');eb.onclick=e=>{e.stopPropagation();start(1,true)};card.append(g,eb);ov.append(card)}
function start(l,en){lv=l;endless=en;L=gen(l,en);z=0;face=0;rot=0;rotT=0;air=0;vy=0;dead=0;won=false;fallV=0;jh=0;player.position.set(0,0,0);player.rotation.set(0,0,0);setHue(PAL[(l-1)%PAL.length][0]+(en?0:0));colorTiles();ov.style.display='none';state='play';
  bpm=(en?118:112+l*1.6);rootN=[45,43,47,40,42][l%5];scale=l%2?[0,3,5,7,10]:[0,2,3,7,8];seqT=0;step16=0;lvl.textContent=en?'ENDLESS':'LEVEL '+l;info.textContent=en?'best '+best+' m':'attempt '+att;unlockAudio()}
function die(){if(dead)return;dead=1;fallV=0;flashT=1;fl.style.transition='none';fl.style.opacity=.55;void fl.offsetWidth;fl.style.transition='opacity .5s';fl.style.opacity=0;sweep(420,60,.45,'sawtooth',.14);noise(.3,'lowpass',900,.3);
  if(endless){const m=Math.floor(z/SEG*SEG);if(m>best){best=m;S.set('oct_end',best)}}setTimeout(()=>{if(state!=='play')return;att++;if(endless){ov.style.display='flex';ov.innerHTML='';const card=el('div',{class:'oct-card'});card.append(el('h2',null,Math.floor(z)+' m'),el('p',null,'Best: '+best+' m'));const a=el('button',{type:'button',class:'oct-btn pri'},el('span',null,'Again'));a.onclick=e=>{e.stopPropagation();start(1,true)};const mb=el('button',{type:'button',class:'oct-btn'},'Menu');mb.onclick=e=>{e.stopPropagation();menu()};card.append(a,mb);ov.append(card);state='over'}else start(lv,false)},850)}
function win(){won=true;state='won';const done=S.get('oct_done',0)|0;if(lv>done)S.set('oct_done',lv);S.set('oct_lv',Math.min(NL,lv+1));c.best(lv);beep(880,.15,'triangle',.08);setTimeout(()=>beep(1320,.25,'triangle',.08),120);
  ov.style.display='flex';ov.innerHTML='';const card=el('div',{class:'oct-card'});card.append(el('h2',null,'LEVEL '+lv+' ✓'),el('p',null,att===1?'Flawless! First try.':'Cleared in '+att+' attempts.'));att=1;
  if(lv<NL){const n=el('button',{type:'button',class:'oct-btn pri'},el('span',null,'Next level →'));n.onclick=e=>{e.stopPropagation();start(lv+1,false)};card.append(n)}else card.append(el('p',null,'You beat all 30 levels. Try Endless!'));
  const mb=el('button',{type:'button',class:'oct-btn'},'Levels');mb.onclick=e=>{e.stopPropagation();menu()};card.append(mb);ov.append(card)}
function move(d){if(state!=='play'||dead)return;face=(face+d+8)%8;rotT=.13;beep(d>0?520:460,.05,'triangle',.05)}
function jump(){if(state!=='play'||dead||air>0)return;vy=7.2;air=.0001;beep(700,.08,'sine',.06)}
c.on(document,'keydown',e=>{const k=e.key.toLowerCase();if(['arrowleft','a'].includes(k)){move(-1);e.preventDefault()}else if(['arrowright','d'].includes(k)){move(1);e.preventDefault()}else if([' ','arrowup','w'].includes(k)){jump();e.preventDefault()}else if(k==='escape'&&state==='play'){menu()}else if(k==='enter'&&state==='menu')start(Math.min(NL,(S.get('oct_done',0)|0)+1),false)});
const cvs=renderer.domElement;c.on(cvs,'pointerdown',e=>{if(e.pointerType==='touch')wrap.classList.add('touch');if(state!=='play')return;const r=cvs.getBoundingClientRect(),x=(e.clientX-r.left)/r.width;const y=(e.clientY-r.top)/r.height;if(y<.45&&e.pointerType==='touch'){jump();return}move(x<.5?-1:1)});
c.on(jb,'pointerdown',e=>{e.preventDefault();e.stopPropagation();jump()});
/* ---------- loop ---------- */
const mtx=new T.Matrix4(),q=new T.Quaternion(),pos=new T.Vector3(),scl=new T.Vector3(),zAx=new T.Vector3(0,0,1),one=new T.Vector3(1,1,1),zero=new T.Vector3(0,0,0);
st3.onFrame((dt)=>{music();pulse=Math.max(0,pulse-dt*4);
  if(state==='play'&&!dead&&!won){const spd=endless?Math.min(26,9+z/180):L.speed;z+=spd*dt;
    if(air>0){air+=dt;vy-=22*dt;jh+=vy*dt;if(jh<=0){jh=0;air=0;vy=0}}
    const si=Math.floor(z/SEG),seg=L.get(si),segN=L.get(Math.floor((z+.3)/SEG));
    const blinkOn=(beatCount%2)===0;const tileAt=(s,f)=>(s.m>>f&1)&&!((s.bl>>f&1)&&!blinkOn);
    if(air===0&&!tileAt(seg,face))die();
    if(((seg.pil>>face)&1)||((segN.pil>>face)&1))die();
    if(!endless){const pr=Math.min(1,z/(L.N*SEG));bar.style.width=(pr*100)+'%';pct.textContent=Math.floor(pr*100)+'%';if(si>=L.N-3)win()}else{pct.textContent=Math.floor(z)+' m';bar.style.width=Math.min(100,z/Math.max(best,100)*100)+'%'}}
  if(dead&&state==='play'){fallV+=18*dt;jh-=fallV*dt;player.rotation.x+=dt*6}
  // rotation of tunnel toward face
  const target=-face*PI/4;let dr=target-rot;dr=Math.atan2(Math.sin(dr),Math.cos(dr));rot+=dr*Math.min(1,dt*18);tun.rotation.z=rot;camRoll+=((dr)*.25-camRoll)*Math.min(1,dt*10);
  const pz=-z;player.position.x=0;player.position.z=pz;const baseY=-R+.07+.25;player.scale.setScalar(1+pulse*.12);if(!dead)player.rotation.x-=dt*(air>0?9:4.5);
  const py=baseY+jh;player.position.y=py;
  // trail
  trail.forEach((m,i)=>{m.position.set(0,py- (air>0?i*.03:0),pz+.45+i*.38);m.rotation.x=player.rotation.x;m.visible=state==='play'&&!dead});
  // tiles window
  const base=Math.max(0,Math.floor(z/SEG)-3);let ti=0,pi=0;const blinkOn=(beatCount%2)===0;
  if(L){for(let s=0;s<VIS;s++){const si=base+s;const sd=(!endless&&si>=L.N+6)?null:L.get(si);for(let f=0;f<8;f++){const a=f*PI/4;const idx=(si%VIS)*8+f;const on=sd&&(sd.m>>f&1)&&!((sd.bl>>f&1)&&!blinkOn&&true);
      pos.set(Math.sin(a)*R,-Math.cos(a)*R,-(si*SEG+SEG/2));q.setFromAxisAngle(zAx,a);scl.setScalar(on?1:0);if(on&&(sd.bl>>f&1))scl.set(1,.5,1);mtx.compose(pos,q,scl);tiles.setMatrixAt(idx,mtx);
      if(sd&&(sd.pil>>f&1)&&pi<MAXP){pos.set(Math.sin(a)*(R-.8),-Math.cos(a)*(R-.8),-(si*SEG+SEG/2));mtx.compose(pos,q,one);pills.setMatrixAt(pi,mtx);pillEdge.setMatrixAt(pi,mtx);pi++}}}
    tiles.instanceMatrix.needsUpdate=true}
  for(let i=pi;i<MAXP;i++){mtx.compose(pos.set(0,0,0),q.identity(),zero);pills.setMatrixAt(i,mtx);pillEdge.setMatrixAt(i,mtx)}pills.instanceMatrix.needsUpdate=true;pillEdge.instanceMatrix.needsUpdate=true;
  tileM.color.setScalar(1+pulse*.2);
  rings.forEach((l,i)=>{l.position.z=-(Math.floor(z/8)*8+i*8);l.material.opacity=.05+pulse*.12;l.rotation.z=i*.2+z*.01});
  const pa=starG.attributes.position;for(let i=0;i<SN;i++){if(pa.array[i*3+2]>pz+6)pa.array[i*3+2]-=120}pa.needsUpdate=true;
  // camera
  camera.position.set(0,baseY+1.25,pz+4.3);camera.up.set(Math.sin(camRoll),Math.cos(camRoll),0);camera.lookAt(0,baseY+.3,pz-7);
  const fovT=72+(state==='play'&&!dead?Math.min(14,(endless?z/60:lv*.4)):0);if(Math.abs(camera.fov-fovT)>.05){camera.fov+=(fovT-camera.fov)*Math.min(1,dt*3);camera.updateProjectionMatrix()}
  if(flashT>0)flashT-=dt});
setHue(190);L=gen(1,false);colorTiles();menu();
return()=>{state='gone';st3.dispose()}})}
G.push({id:'octagon',name:'Octagon',kind:'arcade',wide:true,tint:'#08060f',blurb:'A neon tunnel runner. Flip between the eight sides of a spinning octagon to dodge gaps, jump across empty rings, weave past pillars and blinking tiles. 30 levels that speed up to a synth beat, plus an endless mode.',fmt:b=>'level '+b,
art:'<rect width="120" height="72" fill="#08060f"/><g fill="none" stroke-width="2"><path d="M48 6h24l17 17v26L72 66H48L31 49V23z" stroke="#2de2e6"/><path d="M52 18h16l10 10v16L68 54H52L42 44V28z" stroke="#b84bff"/><path d="M56 28h8l5 5v6l-5 5h-8l-5-5v-6z" stroke="#ff2d95"/></g><path d="M40 60l10-12h20l10 12z" fill="#2de2e6" opacity=".55"/><rect x="55" y="49" width="10" height="8" fill="#fff"/>',
run(root,c){return octagonGame(root,c)}});
