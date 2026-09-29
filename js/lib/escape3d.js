/* lib/escape3d.js: code shared by several games (from src/heroes/escape3d.js) */
const E3_CSS=`.e3 .hud{font:700 13px system-ui,-apple-system,Segoe UI,sans-serif;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.8)}
.e3 button{transform:none!important}
.e3-x{position:absolute;left:50%;top:50%;width:8px;height:8px;margin:-4px;border-radius:50%;border:2px solid rgba(255,255,255,.85);pointer-events:none;transition:all .1s}
.e3-x.on{width:14px;height:14px;margin:-7px;border-color:#ffd23f;background:rgba(255,210,63,.25)}
.e3-hov{position:absolute;left:50%;top:calc(50% + 18px);transform:translateX(-50%);font:800 14px system-ui,sans-serif;white-space:nowrap;pointer-events:none}
.e3-hov small{display:block;font:700 11px system-ui,sans-serif;opacity:.8;text-align:center}
.e3-sub{position:absolute;left:50%;bottom:78px;transform:translateX(-50%);max-width:80%;text-align:center;background:rgba(0,0,0,.55);padding:8px 14px;border-radius:10px;font:700 14px system-ui,sans-serif;opacity:0;transition:opacity .3s;pointer-events:none}
.e3-sub.on{opacity:1}
.e3-inv{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);display:flex;gap:6px;pointer-events:auto}
.e3-inv button{all:unset;cursor:pointer;width:54px;height:54px;border-radius:10px;background:rgba(0,0,0,.5);border:2px solid rgba(255,255,255,.25);font-size:26px;text-align:center;line-height:54px;position:relative}
.e3-inv button.on{border-color:#ffd23f;background:rgba(255,210,63,.2)}.e3-inv button small{position:absolute;left:3px;top:-2px;font:800 10px system-ui,sans-serif;line-height:14px}
.e3-top{position:absolute;left:12px;top:10px;font:800 14px system-ui,sans-serif}.e3-top small{display:block;font:700 11px system-ui,sans-serif;opacity:.8}
.e3-tr{position:absolute;right:10px;top:10px;display:flex;gap:6px;pointer-events:auto}.e3-tr button{all:unset;cursor:pointer;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.3);border-radius:9px;padding:6px 11px;font:800 12px system-ui,sans-serif}
.e3-ov{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.6);pointer-events:auto;padding:12px}
.e3-ov.on{display:flex}
.e3-card{background:#f4ecd8;color:#2a2018;border-radius:12px;padding:18px 20px;max-width:460px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.6);font:600 15px/1.5 Georgia,serif;text-shadow:none;max-height:100%;overflow:auto}
.e3-card.dark{background:#1a2026;color:#e8f0f4;font-family:system-ui,sans-serif}
.e3-card h2{margin:0 0 8px;font:900 22px Georgia,serif}.e3-card.dark h2{font-family:system-ui,sans-serif}
.e3-card p{margin:6px 0}
.e3-keys{display:grid;grid-template-columns:repeat(3,64px);gap:8px;justify-content:center;margin:12px 0}
.e3-keys button,.e3-b{all:unset;cursor:pointer;text-align:center;border-radius:10px;background:#2a2f36;color:#fff;font:900 20px system-ui,sans-serif;padding:14px 0}
.e3-b{display:inline-block;padding:10px 18px;font-size:14px;margin:6px 4px 0}.e3-b.pri{background:#e8a42a;color:#1a1206}
.e3-disp{font:900 30px 'Courier New',monospace;letter-spacing:.3em;text-align:center;background:#0a1a10;color:#5aff8a;border-radius:8px;padding:8px;min-height:40px}
.e3-disp.bad{color:#ff5a4a}.e3-disp.ok{color:#aaffcc}
.e3-dials{display:flex;gap:10px;justify-content:center;margin:12px 0}.e3-dials div{display:flex;flex-direction:column;align-items:center;gap:4px}
.e3-dials b{display:block;width:54px;height:60px;border-radius:8px;background:#3a2a1a;color:#f4e0b0;font:900 34px/60px Georgia,serif;text-align:center}
.e3-dials button{all:unset;cursor:pointer;width:54px;text-align:center;background:#5a4028;color:#fff;border-radius:6px;padding:4px 0;font-weight:900}
.e3-colors{display:flex;gap:10px;justify-content:center;margin:12px 0}.e3-colors button{all:unset;cursor:pointer;width:62px;height:62px;border-radius:50%;border:4px solid rgba(255,255,255,.3)}
.e3-sw{display:flex;gap:10px;justify-content:center;margin:14px 0}.e3-sw button{all:unset;cursor:pointer;width:46px;height:80px;border-radius:8px;background:#333;position:relative}.e3-sw button:after{content:'';position:absolute;left:8px;right:8px;height:30px;border-radius:5px;background:#666;top:44px;transition:top .15s}.e3-sw button.on:after{top:6px;background:#5aff8a;box-shadow:0 0 12px #5aff8a}
.e3 .tbtn{background:rgba(0,0,0,.45)!important}`;
function escape3D(root,c,ROOM){return with3D(root,c,()=>{
const st3=Stage3D(root,c,{lock:true,fov:70,far:60,fireLabel:'USE',altLabel:'ITEM',jump:false});const{T,scene,camera,renderer,wrap,hud,input}=st3;const V3=T.Vector3;
wrap.classList.add('e3');wrap.append(el('style',null,E3_CSS));renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;camera.near=.03;camera.updateProjectionMatrix();
const PI=Math.PI,rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lin=h=>new T.Color(h).convertSRGBToLinear();
/* ---------- helpers ---------- */
const ctex=(w,h,fn,rep)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;fn(cv.getContext('2d'),w,h);const t=new T.CanvasTexture(cv);t.encoding=T.sRGBEncoding;t.anisotropy=8;if(rep){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rep[0],rep[1])}return t};
const noiseC=(g,w,h,a)=>{const id=g.getImageData(0,0,w,h);for(let i=0;i<id.data.length;i+=4){const n=(Math.random()-.5)*a;id.data[i]+=n;id.data[i+1]+=n;id.data[i+2]+=n}g.putImageData(id,0,0)};
const M=(col,o)=>new T.MeshStandardMaterial(Object.assign({color:lin(col),roughness:.7},o||{}));
const room=new T.Group();scene.add(room);const cols=[];
function box(w,h,d,mat,x,y,z,par,col){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;(par||room).add(m);if(col)cols.push({x0:x-w/2-.05,x1:x+w/2+.05,z0:z-d/2-.05,z1:z+d/2+.05});return m}
function cyl(r1,r2,h,mat,x,y,z,par,seg){const m=new T.Mesh(new T.CylinderGeometry(r1,r2,h,seg||16),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;(par||room).add(m);return m}
function plane(w,h,mat,x,y,z,ry,par){const m=new T.Mesh(new T.PlaneGeometry(w,h),mat);m.position.set(x,y,z);m.rotation.y=ry||0;m.receiveShadow=true;(par||room).add(m);return m}
function textTex(w,h,bg,fn){return ctex(w,h,(g)=>{if(bg){g.fillStyle=bg;g.fillRect(0,0,w,h)}fn(g,w,h)})}
function shell(W,D,H,wallM,floorM,ceilM){box(W,.1,D,floorM,0,-.05,0);box(W,.1,D,ceilM,0,H+.05,0);box(W,H,.2,wallM,0,H/2,-D/2-.1);box(W,H,.2,wallM,0,H/2,D/2+.1);box(.2,H,D,wallM,-W/2-.1,H/2,0);box(.2,H,D,wallM,W/2+.1,H/2,0);BOUND={x0:-W/2+.35,x1:W/2-.35,z0:-D/2+.35,z1:D/2-.35}}
let BOUND=null;
/* ---------- interaction registry ---------- */
const objs=[];function obj(o){o.meshes=[];(o.m?[].concat(o.m):[]).forEach(m=>m.traverse(x=>{if(x.isMesh){x.userData.obj=o;o.meshes.push(x)}}));objs.push(o);return o}
const inv=[];let sel=-1;function give(id,name,icon){inv.push({id,name,icon});sel=inv.length-1;beep(880,.08,'triangle',.06);sub('Picked up: '+name);renderInv()}
function has(id){return inv.some(i=>i.id===id)}function take(id){const i=inv.findIndex(x=>x.id===id);if(i>=0){inv.splice(i,1);if(sel>=inv.length)sel=inv.length-1;renderInv()}}function selId(){return inv[sel]&&inv[sel].id}
const tweens=[];function tween(fn,dur,done){tweens.push({fn,t:0,dur,done})}
/* ---------- HUD ---------- */
const X=el('div',{class:'e3-x'}),HOV=el('div',{class:'e3-hov'}),SUB=el('div',{class:'e3-sub'}),INV=el('div',{class:'e3-inv'}),TOP=el('div',{class:'e3-top'}),TR=el('div',{class:'e3-tr'}),OV=el('div',{class:'e3-ov'});hud.append(X,HOV,SUB,TOP,TR,INV,OV);
[INV,TR,OV].forEach(e=>{e.addEventListener('mousedown',ev=>ev.stopPropagation());e.addEventListener('pointerdown',ev=>ev.stopPropagation())});
let subT=0;function sub(t,d){SUB.textContent=t;SUB.classList.add('on');subT=d||3.2}
function renderInv(){INV.innerHTML='';inv.forEach((it,i)=>{const b=el('button',{type:'button',class:i===sel?'on':'',title:it.name},el('small',null,String(i+1)),it.icon);b.onclick=e=>{e.stopPropagation();sel=i===sel?-1:i;renderInv();if(sel>=0)sub(it.name+' selected')};INV.append(b)})}
const hintB=el('button',{type:'button'},'💡 Hint'),resetB=el('button',{type:'button'},'↺ Restart');TR.append(hintB,resetB);hintB.onclick=e=>{e.stopPropagation();hint()};resetB.onclick=e=>{e.stopPropagation();if(confirm('Restart this room?'))openRoom()};
let panelOpen=false;function openPanel(card){panelOpen=true;OV.innerHTML='';OV.append(card);OV.classList.add('on');if(document.pointerLockElement)document.exitPointerLock()}
function closePanel(){panelOpen=false;OV.classList.remove('on');OV.innerHTML='';try{if(!input.touch)renderer.domElement.requestPointerLock()}catch(e){}}
const closeBtn=(t)=>{const b=el('button',{type:'button',class:'e3-b'},t||'Close');b.onclick=e=>{e.stopPropagation();closePanel()};return b};
function note(title,text,dark){const cd=el('div',{class:'e3-card'+(dark?' dark':'')});cd.append(el('h2',null,title));text.split('\n').forEach(l=>cd.append(el('p',null,l)));cd.append(closeBtn());openPanel(cd)}
function keypad(title,len,check,dark){const cd=el('div',{class:'e3-card dark'});let code='';const disp=el('div',{class:'e3-disp'},'');const upd=()=>{disp.textContent=code.padEnd(len,'·');disp.className='e3-disp'};upd();const keys=el('div',{class:'e3-keys'});
  const press=k=>{beep(1200,.04,'square',.03);if(k==='C'){code='';upd();return}if(k==='OK'){if(check(code)){disp.className='e3-disp ok';disp.textContent='OPEN';beep(660,.1,'triangle',.07);setTimeout(()=>beep(990,.15,'triangle',.07),120);setTimeout(closePanel,600)}else{disp.className='e3-disp bad';disp.textContent='ERROR';sweep(300,120,.25,'square',.06);code='';setTimeout(upd,700)}return}if(code.length<len){code+=k;upd()}};
  ['1','2','3','4','5','6','7','8','9','C','0','OK'].forEach(k=>{const b=el('button',{type:'button'},k);b.onclick=e=>{e.stopPropagation();press(k)};keys.append(b)});const kd=e=>{if(!panelOpen)return;if(/^[0-9]$/.test(e.key))press(e.key);else if(e.key==='Enter')press('OK');else if(e.key==='Backspace')press('C');else if(e.key==='Escape')closePanel()};c.on(document,'keydown',kd);
  cd.append(el('h2',null,title),disp,keys,closeBtn('Step back'));openPanel(cd)}
function dials(title,n,check,chars){chars=chars||'0123456789';const cd=el('div',{class:'e3-card'});const v=new Array(n).fill(0);const row=el('div',{class:'e3-dials'});const bs=[];for(let i=0;i<n;i++){const d=el('div');const up=el('button',{type:'button'},'▲'),b=el('b',null,chars[0]),dn=el('button',{type:'button'},'▼');up.onclick=e=>{e.stopPropagation();v[i]=(v[i]+1)%chars.length;b.textContent=chars[v[i]];beep(600,.03,'square',.03);test()};dn.onclick=e=>{e.stopPropagation();v[i]=(v[i]+chars.length-1)%chars.length;b.textContent=chars[v[i]];beep(600,.03,'square',.03);test()};d.append(up,b,dn);row.append(d);bs.push(b)}
  const test=()=>{if(check(v.map(i=>chars[i]).join(''))){beep(660,.1,'triangle',.07);setTimeout(()=>beep(990,.15,'triangle',.07),120);setTimeout(closePanel,500)}};cd.append(el('h2',null,title),row,closeBtn('Step back'));openPanel(cd)}
function colorPad(title,colors,len,check){const cd=el('div',{class:'e3-card dark'});let seq=[];const disp=el('div',{class:'e3-disp'},'');const upd=()=>{disp.innerHTML='';for(let i=0;i<len;i++){const s=el('span',{style:'display:inline-block;width:22px;height:22px;border-radius:50%;margin:0 4px;background:'+(seq[i]!=null?colors[seq[i]]:'#223')});disp.append(s)}};upd();const row=el('div',{class:'e3-colors'});
  colors.forEach((cl,i)=>{const b=el('button',{type:'button',style:'background:'+cl});b.onclick=e=>{e.stopPropagation();beep(300+i*150,.1,'sine',.06);seq.push(i);upd();if(seq.length>=len){if(check(seq)){beep(660,.1,'triangle',.07);setTimeout(()=>beep(990,.15,'triangle',.07),120);setTimeout(closePanel,500)}else{sweep(300,120,.25,'square',.06);disp.className='e3-disp bad';setTimeout(()=>{seq=[];disp.className='e3-disp';upd()},600)}}};row.append(b)});cd.append(el('h2',null,title),disp,row,closeBtn('Step back'));openPanel(cd)}
function switches(title,st,onSolve){const cd=el('div',{class:'e3-card dark'});const row=el('div',{class:'e3-sw'});const n=st.length;const bs=[];const upd=()=>bs.forEach((b,i)=>b.classList.toggle('on',!!st[i]));for(let i=0;i<n;i++){const b=el('button',{type:'button'});b.onclick=e=>{e.stopPropagation();[i-1,i,i+1].forEach(j=>{if(j>=0&&j<n)st[j]=!st[j]});beep(400,.05,'square',.04);upd();if(st.every(x=>x)){onSolve();setTimeout(closePanel,700)}};row.append(b);bs.push(b)}upd();
  cd.append(el('h2',null,title),el('p',null,'Each switch flips itself and its neighbours. Turn them all green.'),row,closeBtn('Step back'));openPanel(cd)}
/* ---------- player ---------- */
const P={x:0,z:0,yaw:0,pitch:0};const ray=new T.Raycaster();ray.far=2.8;let hov=null,t0=0,elapsed=0,done=false,prevF=false,prevAlt=false,hintI=0,steps=[];
function walk(dt){const k=input.keys;let f=(k.w||k.arrowup?1:0)-(k.s||k.arrowdown?1:0)-input.joy.y,s=(k.d||k.arrowright?1:0)-(k.a||k.arrowleft?1:0)+input.joy.x;const l=Math.hypot(f,s);if(l>1){f/=l;s/=l}const sp=2.6*dt*(k.shift?.5:1);
  let nx=P.x+(-Math.sin(P.yaw)*f+Math.cos(P.yaw)*s)*sp,nz=P.z+(-Math.cos(P.yaw)*f-Math.sin(P.yaw)*s)*sp;const r=.3;
  for(const b of cols){const cx=clamp(nx,b.x0,b.x1),cz=clamp(nz,b.z0,b.z1),dx=nx-cx,dz=nz-cz,d=Math.hypot(dx,dz);if(d<r){if(d>1e-5){nx=cx+dx/d*r;nz=cz+dz/d*r}else{nx=P.x;nz=P.z}}}
  P.x=clamp(nx,BOUND.x0,BOUND.x1);P.z=clamp(nz,BOUND.z0,BOUND.z1);P.bob=(P.bob||0)+Math.hypot(f,s)*dt*8}
/* ---------- room definitions ---------- */
let R={};// room state
const ROOMS={
study:{n:'The Study',intro:'A storm rattles the windows. The door of the late Professor’s study has locked behind you.',build(){
  const wall=M(0xffffff,{map:ctex(256,256,(g,w,h)=>{g.fillStyle='#2e4a38';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=32){g.fillStyle='rgba(200,170,90,.18)';g.fillRect(x+14,0,3,h)}for(let y=16;y<h;y+=48)for(let x=0;x<w;x+=32){g.fillStyle='rgba(220,190,110,.25)';g.beginPath();g.arc(x+15,y,5,0,7);g.fill()}noiseC(g,w,h,10)},[4,2]),roughness:.9});
  const floor=M(0xffffff,{map:ctex(256,256,(g,w,h)=>{for(let y=0;y<h;y+=32){g.fillStyle=`hsl(25,${rnd(40,50)}%,${rnd(22,30)}%)`;g.fillRect(0,y,w,31);g.fillStyle='rgba(0,0,0,.4)';g.fillRect(((y*7)%w),y,2,32)}noiseC(g,w,h,14)},[4,4]),roughness:.55});
  const wood=M(0x4a2a18,{roughness:.5}),woodL=M(0x6a4028,{roughness:.55}),brass=M(0xc8a04a,{metalness:1,roughness:.3});
  shell(8,7,3.2,wall,floor,M(0x3a2a20));box(8,.9,.06,woodL,0,.45,-3.47);box(8,.9,.06,woodL,0,.45,3.47);box(.06,.9,7,woodL,-3.97,.45,0);box(.06,.9,7,woodL,3.97,.45,0);
  // door
  const door=new T.Group();door.position.set(-.55,0,-3.45);room.add(door);box(1.1,2.2,.08,wood,.55,1.1,0,door);cyl(.04,.04,.1,brass,1,1.05,.06,door).rotation.x=PI/2;box(1.3,2.35,.12,woodL,0,1.17,-3.5);R.door=door;
  const fuse=box(.35,.45,.1,M(0x555555,{metalness:.6,roughness:.4}),-1.2,1.4,-3.42);const kp=box(.2,.3,.05,M(0x222222),.9,1.25,-3.42);const kpl=box(.12,.05,.02,M(0x220000,{emissive:lin(0x220000)}),.9,1.33,-3.39);R.kpl=kpl;
  obj({m:fuse,name:'Fuse box',hint:()=>R.power?'The fuse box is humming':'Fuse box',act(){if(R.power)return sub('Power is on.');if(has('fuse')){take('fuse');R.power=true;kpl.material.emissive.set(lin(0x00ff44));kpl.material.color.set(lin(0x00ff44));lamp.intensity=2.2;sparks();sub('Click! Power restored. The door keypad lights up.');step(6)}else sub('An empty fuse socket. The door keypad is dead without it.')}});
  obj({m:[kp,kpl],name:'Door keypad',act(){if(!R.power)return sub('The keypad is dead. No power.');keypad('Door lock',4,c2=>{if(c2==='1040'){openDoor();return true}return false})}});
  obj({m:door.children[0],name:'Door',act(){sub(R.power?'Locked. The keypad beside it wants a 4-digit code.':'Heavy oak, locked tight. The keypad beside it is dark.')}});
  // desk + drawer + note
  box(1.7,.06,.8,woodL,-2.4,.78,-2.95,null,true);[[-3.2,-3.3],[-1.6,-3.3],[-3.2,-2.6],[-1.6,-2.6]].forEach(([x,z])=>box(.07,.76,.07,wood,x,.38,z));box(.5,.55,.75,wood,-1.85,.48,-2.95);
  const drawer=box(.5,.18,.05,woodL,-2.9,.62,-2.53);const knob=cyl(.025,.025,.04,brass,-2.9,.62,-2.5);knob.rotation.x=PI/2;const drawerG=new T.Group();room.add(drawerG);
  obj({m:[drawer,knob],name:'Desk drawer',act(){if(R.drawer)return sub('The drawer is empty now.');if(has('brasskey')){take('brasskey');R.drawer=1;tween(k=>{drawer.position.z=-2.53+k*.35;knob.position.z=-2.5+k*.35},.5);setTimeout(()=>{const t=cyl(.03,.035,.22,M(0x3a2a5a,{roughness:.4}),-2.9,.72,-2.3);t.rotation.z=PI/2;obj({m:t,name:'UV torch',act(){room.remove(t);objs.splice(objs.indexOf(this),1);give('uv','UV torch','🔦');sub('A UV torch. Select it (key 1-5) and look around.');step(2)}})},500);sub('The little brass key fits! Something rolls inside.')}else sub('Locked. A tiny keyhole.')}});
  const nt=plane(.3,.22,M(0xffffff,{map:textTex(256,190,'#efe4c8',(g)=>{g.fillStyle='#3a2a1a';g.font='italic 20px Georgia';['My safe keeps its','secret in colour:','Red, then Blue,','then Green, then Gold.','      — E.'].forEach((l,i)=>g.fillText(l,16,34+i*32))}),roughness:.9}),-2.2,.815,-2.9);nt.rotation.x=-PI/2;
  obj({m:nt,name:'Note',act(){note('A note on the desk','My safe keeps its secret in colour:\nRed, then Blue, then Green, then Gold.\n— E.')}});
  const lampM=cyl(.02,.12,.35,brass,-1.8,.98,-3.1);const shade=cyl(.1,.18,.18,M(0x2a6a3a,{emissive:lin(0x0a2010)}),-1.8,1.2,-3.1);const lamp=new T.PointLight(0xffd8a0,.6,7,2);lamp.position.set(-1.8,1.25,-2.9);lamp.castShadow=true;room.add(lamp);
  // rug + key
  const rug=box(3,.02,2,M(0xffffff,{map:ctex(256,170,(g,w,h)=>{g.fillStyle='#6a1a1a';g.fillRect(0,0,w,h);g.strokeStyle='#c8a04a';g.lineWidth=6;g.strokeRect(10,10,w-20,h-20);g.lineWidth=2;for(let i=0;i<6;i++){g.beginPath();g.ellipse(w/2,h/2,20+i*16,12+i*10,0,0,7);g.stroke()}noiseC(g,w,h,16)})}),0,.01,.3);
  obj({m:rug,name:'Persian rug',act(){if(R.rug)return sub('Just floorboards under here.');R.rug=1;tween(k=>{rug.position.x=k*.9;rug.rotation.y=k*.25},.6);setTimeout(()=>{const key=new T.Group();key.position.set(-1.3,.02,-.4);room.add(key);cyl(.03,.03,.01,brass,0,0,0,key);box(.12,.01,.015,brass,.08,0,0,key);obj({m:key,name:'Brass key',act(){room.remove(key);objs.splice(objs.indexOf(this),1);give('brasskey','Small brass key','🗝️');step(1)}})},600);sub('There’s something under the rug!')}});
  // bookshelf with UV numbers
  const shelf=new T.Group();shelf.position.set(3.8,0,-.4);room.add(shelf);box(.4,2.5,2.6,wood,0,1.25,0,shelf);cols.push({x0:3.55,x1:4,z0:-1.75,z1:.95});const bookCols=[0x6a1a1a,0x1a2a6a,0x1a4a2a,0x6a5a1a,0x3a2a1a,0x4a1a3a,0x2a3a3a];R.uvn=[];
  for(let s2=0;s2<4;s2++){box(.36,.04,2.5,woodL,-.02,.35+s2*.58,0,shelf);let z=-1.2;while(z<1.15){const w=rnd(.04,.08),h=rnd(.28,.44);const special={1:[0x9a1a1a,'7'],2:[0x1a3aaa,'2'],0:[0x1a7a3a,'9'],3:[0xc8a02a,'4']}[s2];const isSp=special&&Math.abs(z-(-.4+s2*.3))<.05;const colr=isSp?special[0]:bookCols[Math.floor(Math.random()*bookCols.length)];const b=box(.26,h,w,M(colr,{roughness:.6}),-.1,.37+s2*.58+h/2,z,shelf);
      if(isSp){const t=textTex(64,128,null,(g)=>{g.fillStyle='#d0a0ff';g.shadowColor='#c080ff';g.shadowBlur=14;g.font='bold 90px Arial';g.textAlign='center';g.fillText(special[1],32,98)});const n=plane(.12,.22,new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}),-.24,.37+s2*.58+h/2,z,-PI/2,shelf);n.visible=false;R.uvn.push(n);n.scale.set(.9,1,1)}z+=w+.005;if(!isSp&&special&&z<-.4+s2*.3&&z+.1>-.4+s2*.3)z=-.4+s2*.3}}
  obj({m:shelf.children[0],name:'Bookshelf',act(){sub(selId()==='uv'?'Glowing numbers appear on four coloured spines…':'Old books. Some spines look oddly bright…')}});
  // painting + safe
  const pg=new T.Group();pg.position.set(-3.93,1.7,-.2);room.add(pg);const pic=box(.06,.9,1.2,M(0xffffff,{map:ctex(256,200,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2a3a5a');gr.addColorStop(1,'#6a5a3a');g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle='#1a2a1a';g.beginPath();g.moveTo(0,h);g.lineTo(80,90);g.lineTo(150,140);g.lineTo(256,70);g.lineTo(256,h);g.fill();g.fillStyle='#f0e0a0';g.beginPath();g.arc(190,50,18,0,7);g.fill();g.strokeStyle='#c8a04a';g.lineWidth=16;g.strokeRect(0,0,w,h)})}),0,0,.6,pg);pic.rotation.y=0;
  const safe=box(.1,.5,.5,M(0x3a3e44,{metalness:.7,roughness:.35}),-3.93,1.7,-.2);const safeDoor=box(.04,.44,.44,M(0x50545a,{metalness:.8,roughness:.3}),-3.86,1.7,-.2);safe.visible=safeDoor.visible=false;
  obj({m:pic,name:'Painting',act(){if(R.pic)return;R.pic=1;safe.visible=safeDoor.visible=true;tween(k=>{pg.rotation.y=k*1.3},.7);sub('The painting swings aside on a hinge, revealing a wall safe!');step(3)}});
  obj({m:[safe,safeDoor],name:'Wall safe',act(){if(R.safe)return sub('Empty.');keypad('Wall safe',4,c2=>{if(c2==='7294'){R.safe=1;tween(k=>{safeDoor.rotation.y=-k*1.6;safeDoor.position.z=-.2+k*.18;safeDoor.position.x=-3.86+k*.15},.6);setTimeout(()=>{const f=cyl(.03,.03,.12,M(0xdddddd,{metalness:.5}),-3.8,1.6,-.2);f.rotation.z=PI/2;const nt2=plane(.16,.12,M(0xefe4c8),-3.8,1.8,-.15,PI/2);obj({m:f,name:'Fuse',act(){room.remove(f);objs.splice(objs.indexOf(this),1);give('fuse','Fuse','🔌');step(5)}});obj({m:nt2,name:'Folded note',act(){note('Folded note','The door opens at the hour\nthe clock gave up.')}})},600);step(4);return true}return false})}});
  // clock (stopped at 10:40)
  const clk=textTex(256,256,'#f4ecd8',(g,w,h)=>{g.strokeStyle='#3a2a1a';g.lineWidth=10;g.beginPath();g.arc(128,128,118,0,7);g.stroke();g.fillStyle='#3a2a1a';g.font='bold 28px Georgia';g.textAlign='center';g.textBaseline='middle';['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'].forEach((n,i)=>{const a=i/12*2*PI-PI/2;g.fillText(n,128+Math.cos(a)*92,128+Math.sin(a)*92)});const hand=(a,l,wd)=>{g.lineWidth=wd;g.beginPath();g.moveTo(128,128);g.lineTo(128+Math.cos(a-PI/2)*l,128+Math.sin(a-PI/2)*l);g.stroke()};hand((10+40/60)/12*2*PI,55,9);hand(40/60*2*PI,85,5)});
  const cb=cyl(.32,.32,.08,wood,3.93,2.05,2.1);cb.rotation.z=PI/2;const cf=plane(.56,.56,M(0xffffff,{map:clk}),3.88,2.05,2.1,-PI/2);obj({m:[cb,cf],name:'Wall clock',act(){sub('The clock has stopped at 10:40.')}});
  // fireplace
  box(.5,1.2,1.6,M(0x6a6a6a,{roughness:.9}),-3.75,.6,2.2,null,true);box(.3,.7,1,M(0x111111),-3.55,.45,2.2);box(.6,.1,1.9,woodL,-3.7,1.25,2.2);const fire=new T.PointLight(0xff8a3a,1.2,6,2);fire.position.set(-3.3,.5,2.2);room.add(fire);R.fire=fire;const flame=new T.Mesh(new T.ConeGeometry(.18,.4,8),new T.MeshBasicMaterial({color:0xff9a3a,transparent:true,opacity:.85}));flame.position.set(-3.5,.35,2.2);room.add(flame);R.flame=flame;
  obj({m:room.children[room.children.length-6],name:'Fireplace',act(){sub('Warm. Nothing hidden in the ashes.')}});
  // globe + armchair + window
  const gb=new T.Group();gb.position.set(2.9,0,2.6);room.add(gb);cyl(.03,.03,.9,brass,0,.45,0,gb);const globe=new T.Mesh(new T.SphereGeometry(.28,24,16),M(0xffffff,{map:ctex(256,128,(g,w,h)=>{g.fillStyle='#3a6a8a';g.fillRect(0,0,w,h);g.fillStyle='#c8b070';for(let i=0;i<14;i++){g.beginPath();g.ellipse(rnd(0,w),rnd(20,108),rnd(10,30),rnd(8,20),rnd(0,3),0,7);g.fill()}})}));globe.position.y=1.1;gb.add(globe);cols.push({x0:2.6,x1:3.2,z0:2.3,z1:2.9});
  obj({m:globe,name:'Globe',act(){R.spin=(R.spin||0)+6;sub('The globe spins. Lovely, but no secrets here.')}});R.globe=globe;
  box(.9,.5,.9,M(0x5a1a1a,{roughness:.8}),-2.6,.3,1.4,null,true);box(.9,.8,.2,M(0x5a1a1a,{roughness:.8}),-2.6,.8,1.85);
  const win=plane(1.2,1.4,new T.MeshBasicMaterial({color:0x2a3a5a}),3.89,1.8,0,-PI/2);win.position.set(3.89,1.9,1);
  const amb=new T.HemisphereLight(0x8090a0,0x3a2a20,.35);scene.add(amb);const moon=new T.DirectionalLight(0x9ab0e0,.35);moon.position.set(5,6,2);scene.add(moon);
  P.x=0;P.z=2.6;P.yaw=0;
  steps=['Look around the room. Rugs can hide things.','A small key opens small locks. Try the desk drawer.','Hold the UV torch (select it) and look at the bookshelf.','Paintings sometimes hide safes.','The desk note gives the colour order: Red, Blue, Green, Gold. Read those books’ glowing numbers in that order: 7294.','The safe gave you a fuse. Find where it goes.','The clock stopped at 10:40. Try 1040 on the door keypad.'];
  R.tick=(dt,now)=>{fire.intensity=1+Math.sin(now*13)*.2+Math.sin(now*7.3)*.15;flame.scale.y=1+Math.sin(now*17)*.15;if(R.spin>0){globe.rotation.y+=R.spin*dt;R.spin*=.98}const uvOn=selId()==='uv';R.uvn.forEach(n=>n.visible=uvOn);uvL.intensity=uvOn?2.5:0;if(Math.random()<dt*.05){flash=.3;setTimeout(()=>noise(1.5,'lowpass',200,.3),600)}};
  function openDoor(){tween(k=>{R.door.rotation.y=k*1.5},1.2,()=>escaped())}
}},
sub:{n:'Sinking Sub',intro:'Klaxons. The submarine is taking on water and the escape hatch is sealed. Get out.',build(){
  const plate=M(0xffffff,{map:ctex(256,256,(g,w,h)=>{g.fillStyle='#5a6268';g.fillRect(0,0,w,h);g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=3;for(let i=0;i<=w;i+=128){g.strokeRect(i,0,128,128);g.strokeRect(i,128,128,128)}for(let x=8;x<w;x+=16){g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.arc(x,6,2.5,0,7);g.arc(x,134,2.5,0,7);g.fill()}noiseC(g,w,h,16)},[3,1.5]),metalness:.6,roughness:.45});
  const grate=M(0xffffff,{map:ctex(128,128,(g,w,h)=>{g.fillStyle='#2a2e32';g.fillRect(0,0,w,h);g.strokeStyle='#5a6268';g.lineWidth=4;for(let i=0;i<w;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke()}},[8,12]),metalness:.7,roughness:.4});
  const dark=M(0x2a2e32,{metalness:.6,roughness:.4}),yel=M(0xd8a82a,{roughness:.5}),red=M(0xb8201a,{roughness:.5});
  shell(5,9,2.6,plate,grate,dark);
  for(let z=-4;z<=4;z+=1.6){cyl(.05,.05,5,M(0x8a8f96,{metalness:.8,roughness:.3}),0,2.45,z).rotation.z=PI/2}cyl(.08,.08,9,M(0x7a3a2a,{metalness:.5}),2.3,2.2,0).rotation.x=PI/2;cyl(.06,.06,9,M(0x3a5a7a,{metalness:.5}),-2.35,2.3,0).rotation.x=PI/2;
  // hatch
  const hatch=new T.Group();hatch.position.set(0,1.25,-4.45);room.add(hatch);const hd=cyl(.6,.6,.12,M(0x6a7078,{metalness:.8,roughness:.3}),0,0,0,hatch,24);hd.rotation.x=PI/2;const wheel=new T.Group();wheel.position.z=.1;hatch.add(wheel);const wr=new T.Mesh(new T.TorusGeometry(.32,.035,8,24),red);wheel.add(wr);for(let i=0;i<3;i++){const sp=box(.64,.04,.04,red,0,0,0,wheel);sp.rotation.z=i*PI/3}R.wheel=wheel;R.hatch=hatch;
  const hp=box(.35,.45,.08,M(0x222222),.95,1.3,-4.44);const hpl=box(.25,.06,.02,M(0x300000,{emissive:lin(0x400000)}),.95,1.47,-4.39);
  obj({m:[hd,wr],name:'Escape hatch',act(){if(!R.unlocked)return sub('Sealed. The panel beside it controls the lock.');if(R.open)return;R.open=1;tween(k=>{wheel.rotation.z=k*PI*3},1.4,()=>{tween(k=>{hatch.rotation.y=k*1.4;hatch.position.x=k*-.3},1,()=>escaped())});sweep(200,80,1,'sawtooth',.06)}});
  obj({m:[hp,hpl],name:'Hatch lock panel',act(){if(!R.power)return sub('Dead. No power to the hatch lock.');if(R.unlocked)return sub('Unlocked. Turn the wheel!');colorPad('Hatch lock',['#e8321e','#2ad84a','#2a6ae8','#f2c21a'],R.seq.length,s=>{if(s.join()===R.seq.join()){R.unlocked=1;hpl.material.emissive.set(lin(0x00ff40));step(6);sub('CLUNK. The hatch lock releases. Turn the wheel!');return true}return false})}});
  // toolbox + wrench
  const tb=box(.6,.3,.3,red,-1.6,.15,3.6,null,true);const lid=box(.6,.05,.3,red,-1.6,.32,3.6);
  obj({m:[tb,lid],name:'Toolbox',act(){if(R.tb)return sub('Empty apart from rust.');R.tb=1;tween(k=>{lid.rotation.x=-k*1.6;lid.position.z=3.6-k*.14;lid.position.y=.32+k*.12},.4);const wr2=new T.Group();wr2.position.set(-1.6,.34,3.6);room.add(wr2);box(.3,.03,.04,M(0xaaaaaa,{metalness:1,roughness:.3}),0,0,0,wr2);obj({m:wr2,name:'Wrench',act(){room.remove(wr2);objs.splice(objs.indexOf(this),1);give('wrench','Heavy wrench','🔧');step(1)}});sub('The lid creaks open.')}});
  // locker
  const lk=new T.Group();lk.position.set(-2.3,0,1);room.add(lk);box(.4,2,.9,M(0x4a6a5a,{metalness:.5,roughness:.5}),0,1,0,lk);cols.push({x0:-2.5,x1:-2.05,z0:.5,z1:1.5});const ldoor=new T.Group();ldoor.position.set(.21,1,-.45);lk.add(ldoor);box(.03,1.9,.88,M(0x5a7a6a,{metalness:.5,roughness:.5}),0,0,.44,ldoor);const bolts=[];[[.7],[-.7]].forEach(([y])=>[.1,.78].forEach(z=>bolts.push(cyl(.04,.04,.06,M(0x9a9a9a,{metalness:1}),.03,y,z,ldoor))));bolts.forEach(b=>b.rotation.z=PI/2);
  obj({m:lk.children[0],name:'Locker',act(){if(R.locker)return sub('Empty now.');if(!has('wrench'))return sub('Bolted shut. Four heavy bolts. You’d need a wrench.');R.locker=1;bolts.forEach(b=>b.visible=false);sweep(600,200,.3,'square',.05);tween(k=>{ldoor.rotation.y=k*1.7},.6);setTimeout(()=>{const shelf=box(.22,.03,.5,M(0x3a4a42,{metalness:.5}),-1.98,1.12,1);const f=cyl(.045,.045,.16,M(0xeeeeee,{metalness:.4,emissive:lin(0x202010)}),-1.96,1.18,1);f.rotation.x=PI/2;obj({m:f,name:'Fuse',act(){room.remove(f);objs.splice(objs.indexOf(this),1);give('fuse','Big fuse','🔌');step(2)}});const n=plane(.25,.18,M(0xe8e0c8),-2.09,1.6,1.2,PI/2);obj({m:n,name:'Maintenance card',act(){note('Maintenance card','Breaker procedure:\nEach switch trips its neighbours too.\nAll five green = main power.',false)}})},600);sub('You wrench the bolts off. The locker swings open.');step(1.5)}});
  // breaker
  const br=box(.12,.7,.6,M(0x3a3e42,{metalness:.6}),2.43,1.4,-1.2);const brl=box(.02,.08,.3,M(0x300000,{emissive:lin(0x400000)}),2.36,1.8,-1.2);
  obj({m:[br,brl],name:'Breaker panel',act(){if(R.power)return sub('Main power is on.');if(!R.fused){if(!has('fuse'))return sub('The main fuse slot is empty.');take('fuse');R.fused=1;sub('You slot the fuse in. Now the breakers…');step(3)}switches('Main breakers',[false,true,false,false,true],()=>{R.power=1;brl.material.emissive.set(lin(0x00ff40));main.intensity=1.6;red1.intensity=.3;sub('Main power restored! The sonar screen flickers on.');step(4)})}});
  // sonar console
  box(1.6,.9,.6,dark,0,.45,-2.2,null,true);const scr=new T.Mesh(new T.CircleGeometry(.28,32),new T.MeshBasicMaterial({color:0x002a10}));scr.position.set(0,1.1,-1.89);scr.rotation.x=-.4;room.add(scr);box(1.6,.3,.1,dark,0,1.05,-2.45);R.scr=scr;
  const lights=[];['#e8321e','#2ad84a','#2a6ae8','#f2c21a'].forEach((cl,i)=>{const l=new T.Mesh(new T.SphereGeometry(.045,12,8),new T.MeshBasicMaterial({color:0x222222}));l.position.set(-.45+i*.3,.95,-1.93);room.add(l);lights.push({l,cl})});R.lights=lights;
  obj({m:[scr,...lights.map(l=>l.l)],name:'Sonar console',act(){sub(R.power?'The sonar pings a sequence of coloured lights, over and over…':'Dark. No power.')}});
  // periscope, bunks, gauges, valves
  cyl(.08,.08,1.5,M(0x5a6268,{metalness:.8}),.3,1.85,.6);const eye=box(.25,.18,.25,M(0x3a3e42,{metalness:.7}),.3,1.2,.6);obj({m:eye,name:'Periscope',act(){note('Periscope','Grey water above, maybe forty metres to the surface.\nThe hull groans. Hurry.',true)}});
  box(.8,.12,2,M(0x3a4a3a),2,.6,2.6,null,true);box(.8,.12,2,M(0x3a4a3a),2,1.5,2.6);box(.75,.12,1.9,M(0x8a8a78),2,.7,2.6);box(.75,.12,1.9,M(0x8a8a78),2,1.6,2.6);
  const gauges=[];for(let i=0;i<3;i++){const g2=cyl(.12,.12,.04,M(0xeeeeee),-2.44,1.5,-2.8+i*.35);g2.rotation.z=PI/2;const nd=box(.01,.1,.01,red,-2.41,1.5,-2.8+i*.35);gauges.push(nd)}R.gauges=gauges;
  const valve=new T.Mesh(new T.TorusGeometry(.14,.025,6,16),yel);valve.position.set(-2.4,1,-1);valve.rotation.y=PI/2;room.add(valve);obj({m:valve,name:'Valve',act(){R.vs=(R.vs||0)+8;sub('The valve spins freely. It does nothing.')}});R.valve=valve;
  // lights
  const red1=new T.PointLight(0xff2010,1.4,12,2);red1.position.set(0,2.3,0);room.add(red1);const main=new T.PointLight(0xdfefff,0,14,2);main.position.set(0,2.35,1);main.castShadow=true;room.add(main);scene.add(new T.HemisphereLight(0x5a6a78,0x2a2020,.6));R.red1=red1;
  R.seq=[0,1,2,3,0,2].sort(()=>Math.random()-.5).slice(0,5);
  P.x=0;P.z=3.4;P.yaw=0;
  steps=['That toolbox by the bunks might have something useful.','A wrench can take the bolts off the locker.','The fuse goes in the breaker panel on the right wall.','Each switch flips its neighbours. Try: 1st, then 3rd, then 5th… experiment until all are green.','Watch the four lights on the sonar console. They blink a repeating sequence.','Enter the sonar light sequence on the panel beside the hatch.','Turn the hatch wheel!'];
  R.tick=(dt,now)=>{if(!R.power){red1.intensity=.9+Math.sin(now*3)*.6;if(Math.floor(now*1.25)!==R.lk){R.lk=Math.floor(now*1.25);if(R.lk%2===0)beep(700,.25,'square',.02)}}R.gauges.forEach((g2,i)=>g2.rotation.x=Math.sin(now*(1.3+i*.7))*.8);if(R.vs>0){R.valve.rotation.x+=R.vs*dt;R.vs*=.97}
    const L=R.lights;L.forEach(o=>o.l.material.color.set(0x222222));if(R.power){const per=.7,cyc=R.seq.length+2,k=Math.floor(now/per)%cyc;if(k<R.seq.length&&(now/per%1)<.75){const o=L[R.seq[k]];o.l.material.color.set(o.cl);R.scr.material.color.set(o.cl).multiplyScalar(.35)}else R.scr.material.color.set(0x002a10);if(k!==R.lastK){R.lastK=k;if(k<R.seq.length)beep(400+R.seq[k]*150,.12,'sine',.03)}}
    if(Math.random()<dt*.15)noise(.4,'lowpass',180,.08)};
}},
cabin:{n:'Snowbound Cabin',intro:'A blizzard buried the road. The cabin door is locked from the inside and the key is nowhere to be seen.',build(){
  const logs=M(0xffffff,{map:ctex(256,256,(g,w,h)=>{for(let y=0;y<h;y+=32){const gr=g.createLinearGradient(0,y,0,y+32);gr.addColorStop(0,'#5a3a20');gr.addColorStop(.5,'#8a5a30');gr.addColorStop(1,'#4a2a18');g.fillStyle=gr;g.fillRect(0,y,w,32)}noiseC(g,w,h,20)},[3,2]),roughness:.85});
  const planks=M(0xffffff,{map:ctex(256,256,(g,w,h)=>{for(let x=0;x<w;x+=42){g.fillStyle=`hsl(28,${rnd(35,45)}%,${rnd(30,38)}%)`;g.fillRect(x,0,40,h)}noiseC(g,w,h,18)},[3,3]),roughness:.8});
  const wood=M(0x5a3a22,{roughness:.7}),iron=M(0x2a2a2c,{metalness:.7,roughness:.5});
  shell(7,7,3,logs,planks,M(0x4a3020));
  // windows (4) with snow outside
  const snowMat=new T.MeshBasicMaterial({color:0xd8e4f0});const frost=[];const wins=[[-3.48,1.6,-1.5,PI/2],[-3.48,1.6,1.5,PI/2],[3.48,1.6,0,-PI/2],[1.8,1.6,3.48,PI]];
  wins.forEach(([x,y,z,ry],i)=>{const g=new T.Group();g.position.set(x,y,z);g.rotation.y=ry;room.add(g);plane(.9,.9,snowMat,0,0,-.01,0,g);const f=plane(.9,.9,new T.MeshBasicMaterial({color:0xeef6ff,transparent:true,opacity:.85,map:ctex(128,128,(gg,w,h)=>{gg.fillStyle='#f4f8ff';gg.fillRect(0,0,w,h);gg.strokeStyle='rgba(180,200,230,.6)';for(let k=0;k<40;k++){gg.beginPath();gg.moveTo(rnd(0,w),rnd(0,h));gg.lineTo(rnd(0,w),rnd(0,h));gg.stroke()}})}),0,0,.01,0,g);frost.push(f);box(1,.08,.08,wood,0,.49,.03,g);box(1,.08,.08,wood,0,-.49,.03,g);box(.08,1,.08,wood,.49,0,.03,g);box(.08,1,.08,wood,-.49,0,.03,g);box(.04,1,.04,wood,0,0,.03,g);
    obj({m:f,name:'Frosted window',act(){sub(i===0&&R.melt?'Arrows drawn in the melted frost: ↑ ↓ ↓ ↑':'Thick frost. Snow piles against the glass.')}})});
  const msg=plane(.7,.7,new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,map:ctex(128,128,(g)=>{g.fillStyle='#2a4a6a';g.font='bold 40px Arial';g.textAlign='center';g.fillText('↑↓↓↑',64,74)})}),0,0,.02);room.children.find(ch=>ch.isGroup&&ch.position.x===-3.48&&ch.position.z===-1.5).add(msg);R.msg=msg;R.frost=frost;
  // coat
  const coat=new T.Group();coat.position.set(-2.2,1.5,3.4);room.add(coat);box(.5,.9,.1,M(0x8a2a1a,{roughness:.9}),0,-.2,0,coat);box(.3,.08,.12,iron,0,.3,-.02,coat);
  obj({m:coat,name:'Wool coat',act(){if(R.coat)return sub('Empty pockets.');R.coat=1;give('matches','Box of matches','🔥');setTimeout(()=>note('Scrap of paper (coat pocket)','Before you go, count them all:\ncandles, then chairs, then windows.'),900);step(1)}});
  // stove
  const stove=new T.Group();stove.position.set(2.7,0,-2.6);room.add(stove);box(.8,.8,.6,iron,0,.5,0,stove);cyl(.1,.1,2,iron,0,1.9,-.1,stove);cols.push({x0:2.25,x1:3.15,z0:-2.95,z1:-2.25});const glow=box(.4,.25,.02,new T.MeshBasicMaterial({color:0x111111}),0,.45,.31,stove);const fireL=new T.PointLight(0xff7a2a,0,7,2);fireL.position.set(2.7,.7,-2.1);room.add(fireL);R.fireL=fireL;R.glow=glow;
  obj({m:stove,name:'Iron stove',act(){if(R.lit)return sub('The stove roars. The room is warming up.');if(!has('matches'))return sub('Cold. Logs are laid, but you need something to light them.');R.lit=1;glow.material.color.set(0xff7a2a);sweep(200,600,.4,'sawtooth',.04);sub('The logs catch. Warmth spreads through the cabin…');step(2);setTimeout(()=>{R.melt=1;sub('The frost on one window is melting. Something is written there!')},4500)}});
  // table, chairs, candles
  box(1.4,.06,.9,wood,0,.76,-.3,null,true);[[-.6,-.7],[.6,-.7],[-.6,.1],[.6,.1]].forEach(([x,z])=>box(.07,.74,.07,wood,x,.37,z));
  [[-1,-.3],[1,-.3]].forEach(([x,z])=>{box(.45,.05,.45,wood,x,.46,z,null,true);[[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]].forEach(([a,b])=>box(.04,.46,.04,wood,x+a,.23,z+b));box(.45,.5,.05,wood,x,.72,z+(x<0?-.2:-.2))});
  const flames=[];[[-.3,.8,-.3],[.3,.8,-.4],[-2.9,1.25,2.6]].forEach(([x,y,z])=>{cyl(.035,.035,.18,M(0xf0e8d0),x,y+.09,z);const fl=new T.Mesh(new T.ConeGeometry(.02,.06,6),new T.MeshBasicMaterial({color:0xffc060}));fl.position.set(x,y+.22,z);fl.visible=false;room.add(fl);flames.push(fl);obj({m:fl.parent.children[fl.parent.children.length-2],name:'Candle',act(){if(!has('matches'))return sub('An unlit candle.');fl.visible=true;const l=new T.PointLight(0xffb060,.4,3,2);l.position.set(x,y+.3,z);room.add(l);sub('The candle flickers to life.')}})});box(.6,.04,.3,wood,-2.9,1.2,2.9);R.flames=flames;
  // levers
  const lv=[];const panel=box(.08,.7,1.2,wood,3.44,1.4,1.8);const levers=[];R.lev=[0,0,0,0];for(let i=0;i<4;i++){const g=new T.Group();g.position.set(3.38,1.4,1.4+i*.27);room.add(g);const h=box(.04,.35,.04,iron,0,.15,0,g);const k=new T.Mesh(new T.SphereGeometry(.04,10,8),M(0xa01a1a));k.position.y=.33;g.add(k);g.rotation.z=.6;levers.push(g);
    obj({m:g,name:'Lever '+(i+1),act(){R.lev[i]=R.lev[i]?0:1;tween(k2=>{g.rotation.z=R.lev[i]?lerp2(.6,-.6,k2):lerp2(-.6,.6,k2)},.2);beep(300,.05,'square',.04);if(R.lev.join('')==='1001'&&!R.trap){R.trap=1;openTrap()}}})}
  function lerp2(a,b,t){return a+(b-a)*t}
  obj({m:panel,name:'Lever panel',act(){sub('Four iron levers. Up or down…')}});
  // trapdoor + chest
  const hole=box(1.2,.02,.9,new T.MeshBasicMaterial({color:0x0a0806}),-1.4,.005,1.3);hole.visible=false;const trap=new T.Group();trap.position.set(-2,.02,1.3);room.add(trap);box(1.2,.05,.9,planks,.6,0,0,trap);const ring=new T.Mesh(new T.TorusGeometry(.06,.012,6,12),iron);ring.rotation.x=PI/2;ring.position.set(1,.03,0);trap.add(ring);
  const chest=new T.Group();chest.position.set(-1.4,-.15,1.3);room.add(chest);chest.visible=false;box(.7,.35,.45,wood,0,0,0,chest);const clid=new T.Group();clid.position.set(0,.18,-.22);chest.add(clid);box(.7,.1,.45,wood,0,.05,.22,clid);box(.12,.14,.04,M(0xc8a04a,{metalness:1}),0,.05,.23,chest);
  obj({m:trap,name:'Trapdoor',act(){sub(R.trap?'Open.':'A trapdoor, locked by some mechanism.')}});
  function openTrap(){sweep(150,60,.8,'sawtooth',.05);tween(k=>{trap.rotation.z=k*1.9},1);hole.visible=true;chest.visible=true;tween(k=>{chest.position.y=-.4+k*.35},1);sub('A grinding clunk. The trapdoor swings open!');step(4)}
  obj({m:chest,name:'Chest',act(){if(R.chest)return;dials('Chest lock',3,v=>{if(v==='324'){R.chest=1;tween(k=>{clid.rotation.x=-k*1.6},.6);setTimeout(()=>{const key=new T.Group();key.position.set(-1.4,.16,1.3);room.add(key);box(.22,.035,.05,iron,0,0,0,key);new T.Mesh();const r2=new T.Mesh(new T.TorusGeometry(.05,.015,6,12),iron);r2.position.x=-.12;r2.rotation.x=PI/2;key.add(r2);obj({m:key,name:'Iron key',act(){room.remove(key);objs.splice(objs.indexOf(this),1);give('ironkey','Iron key','🗝️');step(6)}})},600);step(5);return true}return false})}});
  // door
  const door=new T.Group();door.position.set(-.55,0,-3.45);room.add(door);box(1.1,2.2,.1,M(0x4a2a14),.55,1.1,0,door);box(.12,.12,.05,iron,.95,1.1,.06,door);
  obj({m:door,name:'Front door',act(){if(!has('ironkey'))return sub('Locked. An iron keyhole.');take('ironkey');sub('The iron key turns with a heavy clunk…');tween(k=>{door.rotation.y=k*1.5},1.2,()=>escaped())}});
  // bed, rug, antlers
  box(1.2,.45,2,M(0x6a3a3a),2.6,.25,2.2,null,true);box(1.1,.15,.5,M(0xe8e0d0),2.6,.55,3);const bear=box(1.6,.02,1.1,M(0x3a2618,{roughness:1}),0,.01,1.6);
  const heat=new T.HemisphereLight(0x8aa0c0,0x3a2a1a,.3);scene.add(heat);const cold=new T.PointLight(0xb8d0ff,.7,10,2);cold.position.set(0,2.6,0);cold.castShadow=true;room.add(cold);R.cold=cold;
  // snow particles outside visible through windows (decor)
  P.x=0;P.z=2.4;P.yaw=0;
  steps=['Check the coat by the door.','The matches can light the iron stove.','Wait by the window near the stove side… the heat melts the frost to reveal a message.','The arrows ↑ ↓ ↓ ↑ tell you how to set the four levers.','The trapdoor opened! The chest has a 3-digit lock.','Count: candles (3), then chairs (2), then windows (4). Try 324.','Use the iron key on the front door.'];
  R.tick=(dt,now)=>{if(R.lit){R.fireL.intensity=1.5+Math.sin(now*11)*.25;R.cold.intensity=Math.max(.35,R.cold.intensity-dt*.05);R.cold.color.lerp(new T.Color(0xffe0c0),dt*.1)}if(R.melt){R.frost[0].material.opacity=Math.max(.05,R.frost[0].material.opacity-dt*.3);R.msg.material.opacity=Math.min(1,R.msg.material.opacity+dt*.4)}R.flames.forEach(f=>{if(f.visible)f.scale.y=1+Math.sin(now*20+f.position.x*9)*.2});if(Math.random()<dt*.2)noise(1.2,'bandpass',400,.03)};
}}};
/* ---------- flow ---------- */
let flash=0,uvL=new T.SpotLight(0x9a4aff,0,6,.45,.5,1.5);camera.add(uvL);uvL.position.set(0,0,0);uvL.target.position.set(0,0,-1);camera.add(uvL.target);scene.add(camera);
const hand=new T.Group();camera.add(hand);hand.position.set(.28,-.26,-.45);
function step(n){R.stage=Math.max(R.stage||0,n);hintI=0}
function hint(){const i=Math.min(steps.length-1,Math.floor(R.stage||0));sub('💡 '+steps[i],6);R.hints=(R.hints||0)+1}
function sparks(){for(let i=0;i<4;i++)setTimeout(()=>beep(3000+Math.random()*2000,.03,'square',.03),i*60)}
function escaped(){if(done)return;done=true;const t=elapsed;const best=S.get('e3_'+ROOM,0);if(!best||t<best)S.set('e3_'+ROOM,Math.round(t));c.best(Math.round(t),true);[523,659,784,1046].forEach((f,i)=>setTimeout(()=>beep(f,.16,'triangle',.07),i*120));
  const cd=el('div',{class:'e3-card'});cd.append(el('h2',null,'You escaped!'),el('p',null,ROOMS[ROOM].n+' in '+fmt(t)+(R.hints?' with '+R.hints+' hint'+(R.hints>1?'s':''):' with no hints!')),el('p',null,'Best: '+fmt(Math.min(t,best||t))));const b=el('button',{type:'button',class:'e3-b pri'},'Play again');b.onclick=e=>{e.stopPropagation();closePanel();openRoom()};cd.append(b);openPanel(cd)}
const fmt=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
function openRoom(){room.clear();cols.length=0;objs.length=0;inv.length=0;sel=-1;tweens.length=0;scene.children.filter(o=>o.isLight&&o.parent===scene).forEach(o=>scene.remove(o));R={stage:0};done=false;elapsed=0;ROOMS[ROOM].build();renderInv();
  const cd=el('div',{class:'e3-card'});cd.append(el('h2',null,ROOMS[ROOM].n),el('p',null,ROOMS[ROOM].intro),el('p',{style:'font-size:13px;opacity:.8'},'WASD to walk · mouse to look · click or E to interact · 1-5 to select items · H for a hint'));const b=el('button',{type:'button',class:'e3-b pri'},'Begin');b.onclick=e=>{e.stopPropagation();closePanel()};cd.append(b);openPanel(cd)}
c.on(document,'keydown',e=>{if(panelOpen)return;const k=e.key.toLowerCase();if(k==='e')interact();if(k==='h')hint();if(/^[1-6]$/.test(k)){const i=+k-1;if(inv[i]){sel=sel===i?-1:i;renderInv()}}});
function interact(){if(panelOpen||done||!hov)return;hov.act&&hov.act.call(hov)}
st3.onFrame((dt,nowMs)=>{const now=nowMs/1000;for(let i=tweens.length-1;i>=0;i--){const tw=tweens[i];tw.t+=dt;const k=Math.min(1,tw.t/tw.dur);tw.fn(k*k*(3-2*k));if(k>=1){tweens.splice(i,1);tw.done&&tw.done()}}
  if(subT>0){subT-=dt;if(subT<=0)SUB.classList.remove('on')}
  if(!panelOpen&&!done){elapsed+=dt;P.yaw-=input.mdx*.0024;P.pitch=clamp(P.pitch-input.mdy*.0024,-1.3,1.3);walk(dt)}input.mdx=input.mdy=0;
  camera.position.set(P.x,1.62+Math.sin(P.bob||0)*.02,P.z);camera.rotation.set(P.pitch,P.yaw,0,'YXZ');
  // hover
  ray.setFromCamera({x:0,y:0},camera);const ms=[];objs.forEach(o=>o.meshes.forEach(m=>{if(m.visible&&(!m.parent||m.parent.visible!==false))ms.push(m)}));const blockers=room.children.filter(m=>m.isMesh);const hits=ray.intersectObjects(ms.concat(blockers),false);hov=null;if(hits.length&&hits[0].object.userData.obj)hov=hits[0].object.userData.obj;
  X.classList.toggle('on',!!hov);HOV.innerHTML='';if(hov&&!panelOpen){HOV.append(document.createTextNode(hov.hint?hov.hint():hov.name));HOV.append(el('small',null,input.touch?'tap USE':'click / E'))}
  const f=input.down||input.fire;if(f&&!prevF&&!panelOpen)interact();prevF=f;if(input.alt&&!prevAlt&&inv.length){sel=(sel+1)%inv.length;renderInv()}prevAlt=input.alt;
  TOP.innerHTML='';TOP.append(document.createTextNode(ROOMS[ROOM].n),el('small',null,'⏱ '+fmt(elapsed)+(S.get('e3_'+ROOM,0)?' · best '+fmt(S.get('e3_'+ROOM,0)):'')));
  // held item
  const id=selId();if(hand.userData.id!==id){hand.clear();hand.userData.id=id;if(id){const m=new T.Mesh(id==='uv'?new T.CylinderGeometry(.025,.03,.2,10):new T.BoxGeometry(.08,.03,.12),M(id==='uv'?0x3a2a5a:id==='fuse'?0xdddddd:id==='wrench'?0xaaaaaa:id==='matches'?0xd8a82a:0xc8a04a,{metalness:.5,roughness:.4}));if(id==='uv')m.rotation.x=PI/2;hand.add(m)}}
  if(flash>0){flash-=dt}if(R.tick)R.tick(dt,now)});
openRoom();
if(window.__GS_TEST)window.__E3={P,get R(){return R},get objs(){return objs},get inv(){return inv},interact,closePanel,get hov(){return hov},set sel(v){sel=v},camera};
return()=>st3.dispose()})}
[['study','Escape 3D: The Study','A first-person escape room. Search a Victorian study during a storm: lift the rug, read notes, use a UV torch on the books and crack the safe.','#2e4a38'],
 ['sub','Escape 3D: Sinking Sub','A first-person escape room. Red alert in a flooding submarine: find tools, restore power, read the sonar and open the hatch before it’s too late.','#b8201a'],
 ['cabin','Escape 3D: Snowbound Cabin','A first-person escape room in a snowed-in log cabin. Light the stove, melt the frost, solve the levers and open the chest.','#8a5a30']].forEach(([id,name,blurb,tint])=>G.push({id:'e3_'+id,name,kind:'escape',wide:true,big:true,tint,blurb,fmt:b=>Math.floor(b/60)+':'+String(b%60).padStart(2,'0'),lower:true,
 art:'<rect width="120" height="72" fill="'+tint+'"/><rect x="40" y="10" width="40" height="56" fill="rgba(0,0,0,.35)"/><rect x="44" y="14" width="32" height="52" fill="rgba(0,0,0,.35)"/><circle cx="72" cy="42" r="2.5" fill="#ffd23f"/><circle cx="60" cy="36" r="4" fill="none" stroke="#fff" stroke-width="1.5"/><text x="8" y="66" font-family="Arial Black" font-size="11" fill="#fff" opacity=".85">3D</text>',
 run(root,c){return escape3D(root,c,id)}}));
