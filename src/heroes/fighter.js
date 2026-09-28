/* ================= STREET RUMBLE: themed 2D fighting game ================= */
const FR_CSS=`.fr{position:relative;width:min(100%,calc((100vh - 170px)*1.7778));margin:0 auto;aspect-ratio:16/9;border:4px solid #1D1A2F;border-radius:14px;overflow:hidden;box-shadow:6px 6px 0 #1D1A2F;touch-action:none;user-select:none;-webkit-user-select:none;background:#111}
.fr canvas{width:100%;height:100%;display:block}
.fr button{transform:none!important}
.fr-ov{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;padding:10px;background:radial-gradient(ellipse at center,rgba(20,14,30,.82),rgba(6,4,10,.96));color:#fff;overflow:auto;font-family:system-ui,-apple-system,Segoe UI,sans-serif}
.fr-ov.on{display:flex}
.fr-ov h2{margin:0 0 2px;font:900 clamp(26px,6vw,54px)/1 'Arial Black',system-ui,sans-serif;letter-spacing:.02em;text-shadow:3px 3px 0 #e8321e}
.fr-ov h3{margin:6px 0 10px;font:800 clamp(12px,2.2vw,15px) system-ui,sans-serif;opacity:.75;letter-spacing:.08em;text-align:center}
.fr-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;width:100%;max-width:880px}
.fr-th{all:unset;cursor:pointer;flex:1 1 200px;max-width:270px;border-radius:14px;overflow:hidden;border:3px solid rgba(255,255,255,.2);background:#222;text-align:left}
.fr-th canvas{display:block;width:100%;height:auto;aspect-ratio:16/10}
.fr-th div{padding:8px 10px}.fr-th b{display:block;font:900 16px system-ui,sans-serif}.fr-th small{opacity:.75;font-weight:600;font-size:12px}
.fr-th:hover,.fr-ch:hover{border-color:#ffd23f}
.fr-ch{all:unset;cursor:pointer;width:clamp(96px,20%,150px);border-radius:12px;border:3px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);text-align:center;padding-bottom:6px}
.fr-ch.on{border-color:#ffd23f;background:rgba(255,210,63,.15)}.fr-ch.p2{border-color:#4ab0ff}
.fr-ch canvas{display:block;width:100%;height:auto;aspect-ratio:1}
.fr-ch b{display:block;font:900 13px system-ui,sans-serif}.fr-ch small{display:block;font:600 10px system-ui,sans-serif;opacity:.7;padding:0 4px;line-height:1.25}
.fr-b{all:unset;cursor:pointer;background:#e8321e;color:#fff;font:900 15px system-ui,sans-serif;padding:11px 20px;border-radius:12px;margin:8px 4px 0;letter-spacing:.04em}
.fr-b.alt{background:rgba(255,255,255,.14)}.fr-b.sel{background:#ffd23f;color:#111}
.fr-keys{font:600 11px/1.6 system-ui,sans-serif;opacity:.7;margin-top:10px;text-align:center;max-width:720px}
.fr-keys b{display:inline-block;min-width:16px;padding:0 4px;border-radius:4px;background:rgba(255,255,255,.18)}
.fr-tc{position:absolute;inset:0;pointer-events:none;display:none}.fr.touch .fr-tc{display:block}
.fr-pad{position:absolute;left:14px;bottom:14px;width:132px;height:132px;border-radius:50%;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.35);pointer-events:auto;touch-action:none}
.fr-pad i{position:absolute;left:50%;top:50%;width:50px;height:50px;margin:-25px;border-radius:50%;background:rgba(255,255,255,.4)}
.fr-bt{position:absolute;right:10px;bottom:10px;display:grid;grid-template-columns:repeat(3,58px);gap:8px;pointer-events:auto}
.fr-bt button{all:unset;width:58px;height:58px;border-radius:50%;background:rgba(0,0,0,.45);border:2px solid rgba(255,255,255,.6);color:#fff;font:900 11px system-ui,sans-serif;text-align:center;touch-action:none}
.fr-bt button.s{background:rgba(232,50,30,.6)}.fr-bt button.su{background:rgba(255,210,63,.7);color:#111}
.fr-pause{all:unset;cursor:pointer;position:absolute;top:8px;left:50%;transform:translateX(-50%)!important;margin-top:62px;font:800 11px system-ui,sans-serif;color:#fff;opacity:.6;background:rgba(0,0,0,.35);padding:3px 9px;border-radius:8px}`;
function streetRumble(root,c){
const W=960,H=540,GY=470,SW=1500;const PI=Math.PI,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0];
const wrap=el('div',{class:'fr'});const cv=el('canvas');wrap.append(el('style',null,FR_CSS),cv);root.append(wrap);let x=cv.getContext('2d');
const ov=el('div',{class:'fr-ov'});wrap.append(ov);const pauseB=el('button',{type:'button',class:'fr-pause'},'❚❚ menu');wrap.append(pauseB);pauseB.onclick=e=>{e.stopPropagation();if(state==='fight'){state='paused';pauseMenu()}};
let DPR=1;function resize(){const r=wrap.getBoundingClientRect();DPR=Math.min(2,(window.devicePixelRatio||1))*r.width/W;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR)}resize();const ro=new ResizeObserver(resize);ro.observe(wrap);c.on(window,'resize',resize);
/* ---------------- themes + roster ---------------- */
const THEMES=[{id:'toon',n:'Toon Town 1930',d:'Rubber-hose cartoon brawlers. Pies, anvils and springs.'},{id:'hero',n:'Hero League',d:'Caped heroes with lightning, fire, shadow and steel.'},{id:'street',n:'Street Kings',d:'Crews from the block settle it in the alley.'}];
// style: body limbs, torso, legs(pants), shoes, hands, skin, head type, extras
const ROSTER=[
 {th:'toon',id:'buttons',n:'Buttons',d:'Cheeky cat. Pie toss, spring jump, spinning tail rush.',hp:1000,spd:1.05,pow:1,head:'cat',limb:'#141414',torso:'#141414',pants:'#141414',shoe:'#141414',hand:'#fafafa',skin:'#f4ecd8',bow:'#8a8a8a',s1:{t:'proj',k:'pie',v:7,d:80},s2:{t:'rise',k:'spring',d:110},s3:{t:'dash',k:'spin',d:90},su:{t:'mega',k:'pie'}},
 {th:'toon',id:'toots',n:'Toots',d:'Jazz pup. Blasts musical notes, trumpet uppercut.',hp:950,spd:1.12,pow:.95,head:'pup',limb:'#141414',torso:'#fafafa',pants:'#5a5a5a',shoe:'#3a3a3a',hand:'#fafafa',skin:'#fafafa',s1:{t:'proj',k:'note',v:9,d:60,multi:3},s2:{t:'rise',k:'spring',d:100},s3:{t:'dash',k:'slide',d:80},su:{t:'barrage'}},
 {th:'toon',id:'puddle',n:'Mr. Puddle',d:'Frog gent in a bowler. Hat throw, big belly flop.',hp:1100,spd:.9,pow:1.1,head:'frog',limb:'#7a7a7a',torso:'#3a3a3a',pants:'#3a3a3a',shoe:'#141414',hand:'#fafafa',skin:'#9a9a9a',s1:{t:'proj',k:'hat',v:8,d:75},s2:{t:'rise',k:'hop',d:100},s3:{t:'dash',k:'flop',d:110},su:{t:'mega',k:'anvil'}},
 {th:'toon',id:'bruno',n:'Bruno',d:'Sailor bear. Anvil drop, haymaker charge.',hp:1200,spd:.85,pow:1.2,head:'bear',limb:'#5a5a5a',torso:'#fafafa',pants:'#141414',shoe:'#141414',hand:'#fafafa',skin:'#5a5a5a',big:1.1,s1:{t:'proj',k:'anvil',v:6,d:110,arc:1},s2:{t:'rise',k:'upper',d:120},s3:{t:'dash',k:'charge',d:120},su:{t:'barrage'}},
 {th:'hero',id:'volt',n:'Captain Volt',d:'Lightning bolts, thunder uppercut, flash dash.',hp:1000,spd:1.08,pow:1,head:'mask',skin:'#f0c8a0',limb:'#2a5ad8',torso:'#2a5ad8',pants:'#1a3a9a',shoe:'#f2c21a',hand:'#f2c21a',hair:'#3a2a1a',cape:'#e8321e',emb:'bolt',embc:'#f2c21a',mask:'#1a2a6a',s1:{t:'proj',k:'bolt',v:12,d:80},s2:{t:'rise',k:'volt',d:110},s3:{t:'dash',k:'flash',d:90},su:{t:'mega',k:'bolt'}},
 {th:'hero',id:'titanium',n:'Titanium',d:'Armoured bruiser. Shield throw, ground slam.',hp:1250,spd:.82,pow:1.2,head:'helmet',skin:'#c8a080',limb:'#9aa4b0',torso:'#b8c0ca',pants:'#6a7480',shoe:'#4a5460',hand:'#6a7480',cape:null,emb:'star',embc:'#e8321e',big:1.15,s1:{t:'proj',k:'shield',v:9,d:95},s2:{t:'rise',k:'upper',d:120},s3:{t:'dash',k:'charge',d:120},su:{t:'barrage'}},
 {th:'hero',id:'nightshade',n:'Nightshade',d:'Shadow ninja. Throwing stars, teleport strike.',hp:900,spd:1.2,pow:.95,head:'cowl',skin:'#e8c0a0',limb:'#3a2a4a',torso:'#2a1a3a',pants:'#2a1a3a',shoe:'#1a1022',hand:'#6a3a9a',cape:'#4a2a6a',emb:'moon',embc:'#b87aff',s1:{t:'proj',k:'star',v:13,d:60,multi:2},s2:{t:'rise',k:'flip',d:100},s3:{t:'tele',d:90},su:{t:'barrage'}},
 {th:'hero',id:'blaze',n:'Blaze',d:'Fire hero. Fireballs, flame uppercut, burning rush.',hp:1000,spd:1.05,pow:1.05,head:'flame',skin:'#f0b890',limb:'#d8321a',torso:'#d8321a',pants:'#8a1a0a',shoe:'#f28a1a',hand:'#f28a1a',cape:'#f2a21a',emb:'flame',embc:'#ffd23f',s1:{t:'proj',k:'fire',v:9,d:90},s2:{t:'rise',k:'flame',d:115},s3:{t:'dash',k:'flash',d:95},su:{t:'mega',k:'fire'}},
 {th:'street',id:'razor',n:'Razor',d:'Fast talker, faster hands. Knife flick, spinning kick.',hp:950,spd:1.18,pow:.95,head:'cap',skin:'#c89070',limb:'#c89070',torso:'#1a1a1a',sleeve:'#1a1a1a',pants:'#2a3a5a',shoe:'#f4f4f4',hand:'#c89070',capc:'#e8321e',hair:'#1a1a1a',chain:1,s1:{t:'proj',k:'knife',v:14,d:60},s2:{t:'rise',k:'upper',d:100},s3:{t:'dash',k:'spin',d:85},su:{t:'barrage'}},
 {th:'street',id:'tank',n:'Tank',d:'Enforcer. Headbutt charge, crushing slam grab.',hp:1300,spd:.8,pow:1.25,head:'bald',skin:'#8a5a3a',limb:'#8a5a3a',torso:'#3a4a2a',sleeve:null,pants:'#3a3a3a',shoe:'#2a2a2a',hand:'#8a5a3a',beard:'#1a1008',big:1.18,s1:{t:'dash',k:'charge',d:110},s2:{t:'rise',k:'upper',d:120},s3:{t:'grab',d:170},su:{t:'barrage'}},
 {th:'street',id:'vee',n:'Vee',d:'Kickboxer in a bandana. Bottle toss, flying knee.',hp:950,spd:1.12,pow:1,head:'bandana',skin:'#e0b090',limb:'#e0b090',torso:'#8a1a4a',sleeve:null,pants:'#1a1a2a',shoe:'#f4f4f4',hand:'#e0b090',band:'#2a6ae8',hair:'#3a1a0a',ponytail:1,s1:{t:'proj',k:'bottle',v:8,d:80,arc:1},s2:{t:'rise',k:'knee',d:110},s3:{t:'dash',k:'slide',d:85},su:{t:'barrage'}},
 {th:'street',id:'ghost',n:'Ghost',d:'Hooded. Long chain whip, sliding sweep.',hp:1000,spd:1,pow:1.05,head:'hood',skin:'#d0a080',limb:'#4a4a52',torso:'#4a4a52',sleeve:'#4a4a52',pants:'#2a2a30',shoe:'#1a1a1a',hand:'#d0a080',s1:{t:'whip',d:85},s2:{t:'rise',k:'upper',d:105},s3:{t:'dash',k:'slide',d:90},su:{t:'mega',k:'chain'}}];
/* ---------------- poses + rig ---------------- */
// pose: t torso lean, h head, bs/be back arm, fs/fe front arm, y hip drop, x hip shift, bl/fl legs {ik:[dx,dy]} or {fk:[hip,knee]}, r whole-body rotation
const P0={t:.1,h:0,bs:1.3,be:1.9,fs:1.1,fe:1.9,y:6,x:0,bl:{ik:[-26,0]},fl:{ik:[30,0]},r:0};
const POSE={idle:P0,
 crouch:{t:.38,h:-.1,bs:1.3,be:2.1,fs:1.2,fe:2.1,y:44,x:0,bl:{ik:[-30,0]},fl:{ik:[36,0]}},
 jump:{t:.15,h:0,bs:1.5,be:1.6,fs:1.2,fe:1.9,y:0,x:0,bl:{fk:[-.3,1.5]},fl:{fk:[.9,1.8]}},
 block:{t:-.05,h:.1,bs:2,be:2.5,fs:2.1,fe:2.5,y:8,x:-4,bl:{ik:[-30,0]},fl:{ik:[26,0]}},
 cblock:{t:.2,h:.1,bs:2,be:2.5,fs:2.1,fe:2.5,y:44,x:-4,bl:{ik:[-30,0]},fl:{ik:[34,0]}},
 hit:{t:-.35,h:-.45,bs:.5,be:.8,fs:.7,fe:.6,y:10,x:-8,bl:{ik:[-30,0]},fl:{ik:[26,0]}},
 hitc:{t:.1,h:-.4,bs:.6,be:.9,fs:.7,fe:.7,y:44,x:-6,bl:{ik:[-30,0]},fl:{ik:[34,0]}},
 air:{t:-.5,h:-.4,bs:.3,be:.6,fs:1,fe:.5,y:0,x:0,bl:{fk:[-.6,.5]},fl:{fk:[.3,.8]},r:-.7},
 down:{t:0,h:.2,bs:.2,be:.3,fs:.5,fe:.4,y:0,x:0,bl:{fk:[0,.2]},fl:{fk:[.2,.4]},r:-1.57},
 win:{t:0,h:-.15,bs:.4,be:1.4,fs:2.95,fe:.25,y:0,x:0,bl:{ik:[-24,0]},fl:{ik:[22,0]}},
 lose:{t:.55,h:.6,bs:.2,be:.3,fs:.3,fe:.3,y:30,x:0,bl:{ik:[-24,0]},fl:{ik:[26,0]}}};
const mixP=(a,b,t)=>{const o={};for(const k of['t','h','bs','be','fs','fe','y','x']){o[k]=lerp(a[k]||0,b[k]||0,t)}o.r=lerp(a.r||0,b.r||0,t);for(const k of['bl','fl']){const A=a[k],B=b[k];if(A.ik&&B.ik)o[k]={ik:[lerp(A.ik[0],B.ik[0],t),lerp(A.ik[1],B.ik[1],t)]};else o[k]=t<.5?A:B}return o};
const P=(base,over)=>Object.assign({},POSE[base]||P0,over);
/* moves: s startup, a active, r recovery, d dmg, hs hitstun, bs blockstun, lim limb (fh front hand, bh back hand, ff front foot, bf back foot), rng extra radius, lv 'h'|'m'|'l'|'o', kd knockdown, ln launch, kf keyframes [pose at startup peak, pose at active] */
const MV={
 lp:{s:4,a:3,r:7,d:30,hs:13,bs:9,lim:'fh',r2:18,lv:'m',push:4,k:[P('idle',{fs:1.2,fe:1.7,t:.12}),P('idle',{fs:1.57,fe:.05,t:.22,x:6})]},
 hp:{s:8,a:4,r:16,d:70,hs:20,bs:14,lim:'bh',r2:22,lv:'m',push:9,k:[P('idle',{t:-.05,bs:.8,be:2.3,fs:1.4,fe:2}),P('idle',{t:.4,x:14,bs:1.6,be:.05,fs:.7,fe:1.6})]},
 lk:{s:5,a:3,r:9,d:35,hs:14,bs:9,lim:'ff',r2:20,lv:'m',push:5,k:[P('idle',{fl:{fk:[.9,1.6]},t:-.05}),P('idle',{fl:{fk:[1.35,.15]},t:-.18,x:-4})]},
 hk:{s:10,a:4,r:18,d:80,hs:21,bs:15,lim:'ff',r2:24,lv:'m',push:10,k:[P('idle',{fl:{fk:[1.3,2.2]},t:-.25,bs:.9}),P('idle',{fl:{fk:[1.85,.05]},t:-.45,x:-6,bs:.6,be:.6,fs:.4,fe:.8})]},
 clp:{s:4,a:3,r:7,d:25,hs:12,bs:8,lim:'fh',r2:18,lv:'m',push:4,k:[P('crouch',{fs:1.3,fe:1.6}),P('crouch',{fs:1.5,fe:.05,t:.45})]},
 chp:{s:7,a:5,r:18,d:70,hs:22,bs:14,lim:'bh',r2:24,lv:'m',push:6,ln:1,aa:1,k:[P('crouch',{bs:.6,be:2.4,y:40}),P('crouch',{bs:2.9,be:.2,y:18,t:.05})]},
 clk:{s:5,a:3,r:9,d:30,hs:13,bs:8,lim:'ff',r2:18,lv:'l',push:4,k:[P('crouch',{fl:{fk:[1.1,1.4]}}),P('crouch',{fl:{fk:[1.45,.1]},t:.25})]},
 chk:{s:9,a:4,r:22,d:60,hs:20,bs:14,lim:'ff',r2:22,lv:'l',kd:1,push:6,k:[P('crouch',{fl:{fk:[1.2,1.6]},y:50}),P('crouch',{fl:{fk:[1.55,0]},t:.6,y:54,x:-8})]},
 jp:{s:5,a:9,r:4,d:55,hs:18,bs:12,lim:'fh',r2:22,lv:'o',push:3,air:1,k:[P('jump',{fs:1.6,fe:1.5}),P('jump',{fs:1.1,fe:.1,t:.3})]},
 jk:{s:6,a:10,r:4,d:65,hs:19,bs:12,lim:'ff',r2:24,lv:'o',push:3,air:1,k:[P('jump',{fl:{fk:[.9,1.8]}}),P('jump',{fl:{fk:[1.2,.1]},bl:{fk:[-.2,1.6]},t:-.2})]},
 thr:{s:4,a:2,r:20,d:120,hs:30,bs:0,lim:'fh',r2:26,lv:'t',kd:1,k:[P('idle',{fs:1.6,fe:.4,bs:1.5,be:.5,t:.3,x:10}),P('idle',{fs:1.8,fe:.3,bs:1.7,be:.4,t:.35,x:14})]}};
/* ---------------- fighter ---------------- */
function mkF(ch,side,ctrl){const s=(ch.big||1)*1.28;return{ch,side,ctrl,x:side?SW/2+200:SW/2-200,y:0,vx:0,vy:0,f:side?-1:1,st:'idle',t:0,mv:null,mt:0,hp:ch.hp,maxHp:ch.hp,meter:0,wins:0,stun:0,hitDone:false,combo:0,juggle:0,pose:Object.assign({},P0),walkPh:0,crouch:false,inv:0,buf:[],sc:s,
  L:{th:46*s,sh:46*s,to:64*s,ua:36*s,fa:34*s,hr:22*s*(ch.head==='frog'||ch.th==='toon'?1.35:1),w:ch.th==='toon'?9*s:(ch.big?17:14)*s},cape:null,proj:0,ai:{t:0,act:null,react:0},blocking:false,dmgFlash:0,name:ch.n}}
function ik2(hx,hy,tx,ty,a,b,f){let dx=tx-hx,dy=ty-hy,d=Math.hypot(dx,dy);d=clamp(d,Math.abs(a-b)+1,a+b-.5);const ang=Math.atan2(dy,dx),ca=clamp((a*a+d*d-b*b)/(2*a*d),-1,1),al=Math.acos(ca);const k=ang-al*f;return{kx:hx+Math.cos(k)*a,ky:hy+Math.sin(k)*a,fx:hx+Math.cos(ang)*d,fy:hy+Math.sin(ang)*d}}
function joints(F){const p=F.pose,L=F.L,f=F.f;const hipH=(L.th+L.sh)*.96;let hx=F.x+p.x*f,hy=GY-F.y-hipH+p.y;const J={hip:[hx,hy]};const rot=p.r||0;
  const rp=(ox,oy)=>{if(!rot)return[ox,oy];const dx=ox-hx,dy=oy-hy,cs=Math.cos(rot*f),sn=Math.sin(rot*f);return[hx+dx*cs-dy*sn,hy+dx*sn+dy*cs]};
  const ta=p.t;const nx=hx+Math.sin(ta)*L.to*f,ny=hy-Math.cos(ta)*L.to;J.neck=rp(nx,ny);const ha=ta+p.h;J.head=rp(nx+Math.sin(ha)*L.hr*1.05*f,ny-Math.cos(ha)*L.hr*1.05);
  const sx=nx-Math.sin(ta)*6*f,sy=ny+Math.cos(ta)*6;J.sh=rp(sx,sy);
  // arm angles: 0 = hanging down, + rotates forward/up
  const A=(s,e)=>{const a1=s,ex=sx+Math.sin(a1)*L.ua*f,ey=sy+Math.cos(a1)*L.ua;const a2=a1+e;const hx3=ex+Math.sin(a2)*L.fa*f,hy3=ey+Math.cos(a2)*L.fa;return[rp(ex,ey),rp(hx3,hy3)]};
  // correct for "up": cos(angle) positive = down; angle pi/2 -> forward horizontal; angle pi -> straight up
  const bA=A(p.bs,p.be),fA=A(p.fs,p.fe);J.be=bA[0];J.bh=bA[1];J.fe=fA[0];J.fh=fA[1];
  const leg=(spec,back)=>{const lx=hx+(back?-5:5)*f;if(spec.ik){const tx=F.x+spec.ik[0]*f*(F.sc),ty=GY-F.y-spec.ik[1];const r=ik2(lx,hy,tx,ty,L.th,L.sh,f);return[rp(r.kx,r.ky),rp(r.fx,r.fy)]}const[a,k]=spec.fk;const kx=lx+Math.sin(a)*L.th*f,ky=hy+Math.cos(a)*L.th,a2=a-k,fx=kx+Math.sin(a2)*L.sh*f,fy=ky+Math.cos(a2)*L.sh;return[rp(kx,ky),rp(fx,fy)]};
  const bl=leg(p.bl,1),fl=leg(p.fl,0);J.bk=bl[0];J.bf=bl[1];J.fk=fl[0];J.ff=fl[1];J.hipB=rp(hx-5*f,hy);J.hipF=rp(hx+5*f,hy);return J}
/* ---------------- drawing ---------------- */
function cap(a,b,w1,w2,col,ol){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d;const path=(e)=>{x.beginPath();x.moveTo(a[0]+nx*(w1/2+e),a[1]+ny*(w1/2+e));x.lineTo(b[0]+nx*(w2/2+e),b[1]+ny*(w2/2+e));x.arc(b[0],b[1],w2/2+e,Math.atan2(ny,nx),Math.atan2(ny,nx)+PI*(1),true);x.lineTo(a[0]-nx*(w1/2+e),a[1]-ny*(w1/2+e));x.arc(a[0],a[1],w1/2+e,Math.atan2(-ny,-nx),Math.atan2(-ny,-nx)+PI,true);x.closePath()};
  if(ol){x.fillStyle=ol;path(2.5);x.fill()}x.fillStyle=col;path(0);x.fill()}
function circ(p,r,col,ol,lw){x.beginPath();x.arc(p[0],p[1],r,0,7);if(col){x.fillStyle=col;x.fill()}if(ol){x.strokeStyle=ol;x.lineWidth=lw||2.5;x.stroke()}}
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;r=clamp(Math.round(r*k),0,255);g=clamp(Math.round(g*k),0,255);b=clamp(Math.round(b*k),0,255);return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)}
function drawF(F,J,alpha){const ch=F.ch,th=ch.th,L=F.L,f=F.f,OL=th==='toon'?'#0a0a0a':'#141018';const toon=th==='toon';const back=k=>shade(k,.72);x.save();if(alpha!=null)x.globalAlpha=alpha;
  if(F.dmgFlash>0){x.filter='brightness(2.2)'}
  // cape (behind)
  if(ch.cape&&F.cape){const pts=F.cape;x.fillStyle=ch.cape;x.strokeStyle=OL;x.lineWidth=2.5;x.beginPath();x.moveTo(J.sh[0]+4*f,J.sh[1]-2);pts.forEach(p=>x.lineTo(p.x,p.y));for(let i=pts.length-1;i>=0;i--){const p=pts[i];x.lineTo(p.x-(8+i*4)*f,p.y+i*1.5)}x.closePath();x.fill();x.stroke()}
  if(ch.ponytail){const hp=J.head;cap(hp,[hp[0]-L.hr*1.3*f,hp[1]+L.hr*.9+Math.sin(F.t*.2)*3],9,6,ch.hair,OL)}
  const W1=L.w,up=toon?W1:W1*1.25,lo=toon?W1:W1*.95,th2=toon?W1:W1*1.45,sh2=toon?W1:W1*1.05;
  const limbCol=(k,bk)=>bk?back(k):k;
  // back leg + back arm
  const legD=(hp,k,ft,bk)=>{cap(hp,k,th2,sh2,limbCol(ch.pants,bk),OL);cap(k,ft,sh2,lo,limbCol(toon?ch.limb:ch.pants,bk),OL);shoe(k,ft,bk)};
  const shoe=(k,ft,bk)=>{const dx=ft[0]-k[0],dy=ft[1]-k[1],a=Math.atan2(dy,dx);x.save();x.translate(ft[0],ft[1]);x.rotate(a-PI/2);x.fillStyle=limbCol(ch.shoe,bk);x.strokeStyle=OL;x.lineWidth=2.5;x.beginPath();if(toon)x.ellipse(0,4,W1*1.1,W1*1.9,0,0,7);else x.ellipse(0,5*F.sc,W1*.75,W1*1.35,0,0,7);x.fill();x.stroke();x.restore()};
  const armD=(e,h,bk)=>{const sleeve=ch.sleeve!==undefined?ch.sleeve:null;cap(J.sh,e,up,lo,limbCol(sleeve||ch.limb,bk),OL);cap(e,h,lo,lo*.9,limbCol(ch.th==='street'&&!sleeve?ch.limb:ch.th==='street'?ch.skin:ch.limb,bk),OL);hand(e,h,bk)};
  const hand=(e,h,bk)=>{circ(h,toon?W1*1.35:W1*.72,limbCol(ch.hand,bk),OL,2.5);if(toon){x.strokeStyle=OL;x.lineWidth=1.5;x.beginPath();x.moveTo(h[0]-4,h[1]-2);x.lineTo(h[0]+4,h[1]-2);x.stroke()}};
  legD(J.hipB,J.bk,J.bf,1);armD(J.be,J.bh,1);
  // torso
  const hp=J.hip,nk=J.neck,tw=toon?(ch.head==='bear'||ch.head==='frog'?40:30)*F.sc:(ch.big?44:36)*F.sc/F.sc*(F.sc);
  const mid=[(hp[0]+nk[0])/2,(hp[1]+nk[1])/2];cap(hp,nk,tw*(toon?1.15:.92),tw*(toon?.8:1.05),ch.torso,OL);
  if(toon){cap(hp,[lerp(hp[0],nk[0],.35),lerp(hp[1],nk[1],.35)],tw*1.18,tw*1.05,ch.pants,OL);if(ch.bow){x.fillStyle=ch.bow;x.beginPath();x.ellipse(nk[0]-5,nk[1]+4,6,4,0,0,7);x.ellipse(nk[0]+5,nk[1]+4,6,4,0,0,7);x.fill()}}
  else{cap(hp,[lerp(hp[0],nk[0],.18),lerp(hp[1],nk[1],.18)],tw*.95,tw*.9,ch.pants,OL);x.fillStyle=OL;x.fillRect(hp[0]-tw*.45,hp[1]-4,tw*.9,5);
    if(ch.emb){x.save();x.translate(mid[0]+4*f,mid[1]-6);x.fillStyle=ch.embc;x.strokeStyle=OL;x.lineWidth=2;x.beginPath();if(ch.emb==='bolt'){x.moveTo(2,-12);x.lineTo(-6,2);x.lineTo(0,2);x.lineTo(-3,13);x.lineTo(7,-3);x.lineTo(1,-3);x.lineTo(4,-12)}else if(ch.emb==='star'){for(let i=0;i<10;i++){const r=i%2?5:12,a=i/10*2*PI-PI/2;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}}else if(ch.emb==='moon'){x.arc(0,0,10,0,7);x.fill();x.fillStyle=ch.torso;x.beginPath();x.arc(4,-3,9,0,7)}else{x.moveTo(0,-13);x.quadraticCurveTo(10,0,4,10);x.quadraticCurveTo(0,4,-4,10);x.quadraticCurveTo(-10,0,0,-13)}x.closePath();x.fill();if(ch.emb!=='moon')x.stroke();x.restore()}
    if(ch.chain){x.strokeStyle='#e8c84a';x.lineWidth=2.5;x.beginPath();x.arc(nk[0]+3*f,nk[1]+8,11,.2,PI-.2);x.stroke()}
    if(ch.sleeve&&ch.head==='hood'){x.fillStyle=shade(ch.torso,.8);x.fillRect(mid[0]-8,mid[1]+2,16,8)}}
  // head
  headD(F,J.head,J.neck,OL);
  // front leg + front arm
  legD(J.hipF,J.fk,J.ff,0);armD(J.fe,J.fh,0);
  x.restore()}
function headD(F,hp,nk,OL){const ch=F.ch,r=F.L.hr,f=F.f,h=ch.head;const face=(ex,ey)=>[hp[0]+ex*f,hp[1]+ey];x.save();
  if(h==='cat'||h==='pup'||h==='bear'||h==='frog'){// rubber hose heads
    if(h==='cat'){x.fillStyle='#141414';[[-.55,-.95],[.45,-1]].forEach(([a,b],i)=>{x.beginPath();x.moveTo(...face(a*r-8,b*r+10));x.lineTo(...face(a*r,b*r-8));x.lineTo(...face(a*r+9,b*r+12));x.fill()})}
    if(h==='bear'){[[-.6,-.8],[.55,-.85]].forEach(([a,b])=>circ(face(a*r,b*r),r*.38,'#5a5a5a',OL))}
    if(h==='pup'){x.fillStyle='#141414';x.beginPath();x.ellipse(...face(-r*.7,r*.1),r*.35,r*.95,-.3*f,0,7);x.fill()}
    circ(hp,r,h==='cat'?'#141414':h==='frog'?'#9a9a9a':h==='bear'?'#5a5a5a':'#fafafa',OL,3);
    if(h==='frog'){circ(face(-r*.3,-r*.8),r*.42,'#fafafa',OL);circ(face(r*.45,-r*.8),r*.42,'#fafafa',OL);circ(face(-r*.2,-r*.78),r*.16,'#141414');circ(face(r*.55,-r*.78),r*.16,'#141414');x.strokeStyle=OL;x.lineWidth=3;x.beginPath();x.arc(...face(r*.25,r*.05),r*.7,.2,PI-.4);x.stroke();
      x.fillStyle='#141414';x.fillRect(hp[0]-r*.85,hp[1]-r*1.55,r*1.7,r*.18);x.fillRect(hp[0]-r*.55,hp[1]-r*2.1,r*1.1,r*.6);x.restore();return}
    const fc=h==='cat'?'#f4ecd8':h==='bear'?'#e8dcc0':'#fafafa';x.fillStyle=fc;x.beginPath();x.ellipse(...face(r*.28,r*.25),r*.72,r*.62,0,0,7);x.fill();
    [[.1,-.25],[.48,-.25]].forEach(([a,b])=>{x.fillStyle='#fafafa';x.strokeStyle=OL;x.lineWidth=2;x.beginPath();x.ellipse(...face(a*r,b*r),r*.2,r*.34,0,0,7);x.fill();x.stroke();x.fillStyle='#141414';x.beginPath();x.ellipse(...face(a*r+r*.06,b*r+r*.06),r*.12,r*.22,0,0,7);x.fill();x.fillStyle='#fafafa';x.beginPath();x.moveTo(...face(a*r+r*.06,b*r+r*.06));x.arc(...face(a*r+r*.06,b*r+r*.06),r*.13,-.9,-.3);x.fill()});
    circ(face(r*.75,r*.12),r*.17,'#141414');if(h==='cat'){x.strokeStyle='#141414';x.lineWidth=1.5;[[-.05],[.12]].forEach(([d])=>{x.beginPath();x.moveTo(...face(r*.6,r*(.25+d)));x.lineTo(...face(r*1.25,r*(.18+d*2)));x.stroke()})}
    x.strokeStyle=OL;x.lineWidth=2.5;x.beginPath();x.arc(...face(r*.42,r*.35),r*.3,.3,PI-.3);x.stroke();
    if(h==='bear'){x.fillStyle='#fafafa';x.strokeStyle=OL;x.beginPath();x.moveTo(hp[0]-r*.9,hp[1]-r*.75);x.lineTo(hp[0]+r*.9,hp[1]-r*.75);x.lineTo(hp[0]+r*.6,hp[1]-r*1.3);x.lineTo(hp[0]-r*.6,hp[1]-r*1.3);x.closePath();x.fill();x.stroke()}
    x.restore();return}
  // human heads
  const skin=ch.skin;if(h==='hood'){x.fillStyle=shade(ch.torso,.85);x.strokeStyle=OL;x.lineWidth=2.5;x.beginPath();x.ellipse(hp[0]-3*f,hp[1]-1,r*1.28,r*1.3,0,0,7);x.fill();x.stroke()}
  if(ch.cape){}
  circ(hp,r,skin,OL,2.5);
  if(h==='mask'||h==='cowl'){x.fillStyle=h==='cowl'?ch.torso:ch.hair;x.beginPath();x.arc(hp[0],hp[1],r,PI*.95,PI*2.05);x.fill();if(h==='cowl'){x.beginPath();x.moveTo(...face(-r*.2,-r*.8));x.lineTo(...face(-r*.5,-r*1.5));x.lineTo(...face(-r*.7,-r*.7));x.fill();x.beginPath();x.moveTo(...face(r*.3,-r*.85));x.lineTo(...face(r*.25,-r*1.5));x.lineTo(...face(-r*.05,-r*.9));x.fill();x.fillRect(hp[0]-r,hp[1]-r*.3,r*2,r*.5)}
    x.fillStyle=ch.mask||ch.torso;x.fillRect(Math.min(hp[0],face(r,0)[0])-(f>0?0:0),hp[1]-r*.35,r*1.02,r*.34);if(f<0)x.fillRect(hp[0]-r*1.02,hp[1]-r*.35,r*1.02,r*.34)}
  if(h==='helmet'){x.fillStyle='#b8c0ca';x.strokeStyle=OL;x.lineWidth=2.5;x.beginPath();x.arc(hp[0],hp[1],r*1.08,PI*.9,PI*2.1);x.lineTo(...face(r*.9,r*.1));x.lineTo(...face(-r*1,r*.4));x.closePath();x.fill();x.stroke();x.fillStyle='#e8321e';x.fillRect(hp[0]-2,hp[1]-r*1.25,4,r*.5);x.fillStyle='#1a1a1a';x.fillRect(...face(r*.15,-r*.2),r*.75*f,r*.18)}
  if(h==='flame'){for(let i=0;i<5;i++){const a=PI+i/4*PI,fl=Math.sin(F.t*.4+i)*4;x.fillStyle=i%2?'#ffd23f':'#f2621a';x.beginPath();x.moveTo(hp[0]+Math.cos(a)*r*.8,hp[1]+Math.sin(a)*r*.8);x.lineTo(hp[0]+Math.cos(a)*r*1.7-8*f,hp[1]+Math.sin(a)*r*1.9-6+fl);x.lineTo(hp[0]+Math.cos(a+.4)*r*.9,hp[1]+Math.sin(a+.4)*r*.9);x.fill()}}
  if(h==='cap'){x.fillStyle=ch.hair;x.beginPath();x.arc(hp[0],hp[1],r,PI*1.05,PI*1.95);x.fill();x.fillStyle=ch.capc;x.strokeStyle=OL;x.lineWidth=2.5;x.beginPath();x.arc(hp[0],hp[1]-2,r*1.02,PI,2*PI);x.closePath();x.fill();x.stroke();x.beginPath();x.moveTo(...face(-r*.9,-r*.2));x.lineTo(...face(-r*1.7,-r*.1));x.lineTo(...face(-r*1.7,-r*.35));x.lineTo(...face(-r*.9,-r*.45));x.fill();x.stroke()}
  if(h==='bandana'){x.fillStyle=ch.hair;x.beginPath();x.arc(hp[0],hp[1],r*1.02,PI*.85,PI*2.05);x.fill();x.fillStyle=ch.band;x.fillRect(hp[0]-r,hp[1]-r*.62,r*2,r*.32);x.beginPath();x.moveTo(...face(-r,-r*.5));x.lineTo(...face(-r*1.6,-r*.1));x.lineTo(...face(-r*1.4,-r*.6));x.fill()}
  if(h==='bald'){x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=3;x.beginPath();x.arc(hp[0]-3*f,hp[1]-r*.3,r*.5,PI*1.2,PI*1.6);x.stroke();if(ch.beard){x.fillStyle=ch.beard;x.beginPath();x.arc(...face(r*.2,r*.35),r*.62,-.1,PI+.1);x.fill()}}
  if(h!=='helmet'){// eye + brow + mouth
    const ex=face(r*.52,-r*.12);if(h!=='mask'&&h!=='cowl'){circ(ex,2.6,'#141018')}else{x.fillStyle='#fff';x.fillRect(ex[0]-3,ex[1]-2,6,3)}x.strokeStyle='#141018';x.lineWidth=2.5;x.beginPath();x.moveTo(...face(r*.28,-r*.38));x.lineTo(...face(r*.78,-r*.3));x.stroke();x.lineWidth=2;x.beginPath();x.moveTo(...face(r*.5,r*.45));x.lineTo(...face(r*.85,r*.42));x.stroke()}
  x.restore()}
/* ---------------- stages ---------------- */
const stageC={};function mkStage(id){const cv2=document.createElement('canvas');cv2.width=SW;cv2.height=H;const g=cv2.getContext('2d');const far=document.createElement('canvas');far.width=SW;far.height=H;const g2=far.getContext('2d');
  if(id==='toon'){let gr=g2.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#d8d0bc');gr.addColorStop(1,'#a8a090');g2.fillStyle=gr;g2.fillRect(0,0,SW,H);g2.fillStyle='#f4eedc';g2.beginPath();g2.arc(SW*.7,110,56,0,7);g2.fill();g2.fillStyle='#8a8272';for(let i=0;i<8;i++){g2.beginPath();g2.ellipse(i*220+60,390,190,110,0,PI,2*PI);g2.fill()}
    g.fillStyle='#6a6456';for(let i=0;i<7;i++){g.beginPath();g.ellipse(i*260+120,440,230,90,0,PI,2*PI);g.fill()}g.fillStyle='#3a3630';g.fillRect(0,GY-4,SW,H-GY+4);g.fillStyle='#4a453c';for(let i=0;i<SW;i+=40)g.fillRect(i,GY+14,26,4);
    for(let i=0;i<SW;i+=22){g.fillStyle='#e8e2d0';g.fillRect(i,GY-44,6,40);g.fillStyle='#141414';g.fillRect(i,GY-44,6,2)}g.fillStyle='#e8e2d0';g.fillRect(0,GY-36,SW,5);g.fillRect(0,GY-18,SW,5)}
  if(id==='hero'){let gr=g2.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#0e0a28');gr.addColorStop(.7,'#3a1a5a');gr.addColorStop(1,'#6a2a6a');g2.fillStyle=gr;g2.fillRect(0,0,SW,H);g2.fillStyle='#fff';for(let i=0;i<120;i++){g2.globalAlpha=Math.random();g2.fillRect(Math.random()*SW,Math.random()*260,1.5,1.5)}g2.globalAlpha=1;g2.fillStyle='#f4f0e0';g2.beginPath();g2.arc(SW*.25,90,40,0,7);g2.fill();
    for(let i=0;i<40;i++){const w=rnd(40,90),h2=rnd(120,320),bx=i*40+rnd(-10,10);g2.fillStyle='#1a1230';g2.fillRect(bx,H-h2-40,w,h2+40);g2.fillStyle='rgba(255,220,120,.5)';for(let yy=H-h2-30;yy<H-50;yy+=12)for(let xx=bx+5;xx<bx+w-5;xx+=10)if(Math.random()<.3)g2.fillRect(xx,yy,4,6)}
    for(let i=0;i<22;i++){const w=rnd(70,140),h2=rnd(80,220),bx=i*75+rnd(-10,10);g.fillStyle='#0c0818';g.fillRect(bx,GY-h2,w,h2);g.fillStyle='rgba(255,230,160,.8)';for(let yy=GY-h2+10;yy<GY-10;yy+=16)for(let xx=bx+8;xx<bx+w-8;xx+=14)if(Math.random()<.25)g.fillRect(xx,yy,6,8)}
    g.fillStyle='#2a2438';g.fillRect(0,GY,SW,H-GY);g.fillStyle='#3a3450';g.fillRect(0,GY,SW,6);for(let i=0;i<SW;i+=60){g.fillStyle='#231e30';g.fillRect(i,GY+6,2,H)}[[180],[1180]].forEach(([vx])=>{g.fillStyle='#4a4460';g.fillRect(vx,GY-60,70,60);g.fillStyle='#2a2438';for(let k=0;k<4;k++)g.fillRect(vx+8,GY-52+k*13,54,6)});
    g.fillStyle='#3a3048';g.fillRect(620,GY-150,14,150);g.fillRect(700,GY-150,14,150);g.fillStyle='#4a3a58';g.beginPath();g.ellipse(667,GY-190,70,60,0,0,7);g.fill();g.fillRect(597,GY-190,140,40)}
  if(id==='street'){let gr=g2.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#1a1e2a');gr.addColorStop(1,'#3a3230');g2.fillStyle=gr;g2.fillRect(0,0,SW,H);for(let i=0;i<30;i++){const w=rnd(60,130),h2=rnd(200,420),bx=i*55;g2.fillStyle='#14161e';g2.fillRect(bx,H-h2,w,h2);g2.fillStyle='rgba(255,200,120,.35)';for(let yy=H-h2+10;yy<H;yy+=18)for(let xx=bx+6;xx<bx+w-6;xx+=12)if(Math.random()<.2)g2.fillRect(xx,yy,6,9)}
    // brick walls
    const brick=(bx,bw,bh,col)=>{g.fillStyle=col;g.fillRect(bx,GY-bh,bw,bh);for(let yy=GY-bh;yy<GY;yy+=14)for(let xx=bx+((yy/14|0)%2?0:-15);xx<bx+bw;xx+=30){g.fillStyle=shade(col,rnd(.8,1.15));g.fillRect(Math.max(bx,xx+1),yy+1,Math.min(28,bx+bw-xx-1),12)}};
    brick(0,560,330,'#6a3a2a');brick(940,560,330,'#5a3428');const tags=['KINGS','RUMBLE','5TH ST','CREW','ZERO','NOVA','BLOCK'];for(let i=0;i<9;i++){g.save();const tx=i<5?rnd(20,500):rnd(960,1440);g.translate(tx,rnd(GY-280,GY-60));g.rotate(rnd(-.15,.15));g.font='900 '+rnd(34,62)+'px Arial Black,Impact,sans-serif';g.lineWidth=6;g.strokeStyle='#111';const t2=pick(tags);g.strokeText(t2,0,0);g.fillStyle=pick(['#e8321e','#2ab0ff','#ffd23f','#6ae84a','#ff4ad8','#f4f4f4']);g.fillText(t2,0,0);g.restore()}
    g.strokeStyle='rgba(180,180,190,.5)';g.lineWidth=1.2;for(let xx=560;xx<940;xx+=10){g.beginPath();g.moveTo(xx,GY-190);g.lineTo(xx+95,GY);g.stroke();g.beginPath();g.moveTo(xx+95,GY-190);g.lineTo(xx,GY);g.stroke()}g.fillStyle='#555';g.fillRect(560,GY-194,380,5);
    g.fillStyle='#2a4a3a';g.fillRect(120,GY-80,160,80);g.fillStyle='#1e3a2c';g.fillRect(114,GY-88,172,12);[[1060],[1100]].forEach(([tx])=>{g.fillStyle='#6a6a70';g.fillRect(tx,GY-50,32,50);g.fillStyle='#7a7a80';g.fillRect(tx-3,GY-54,38,6)});
    g.fillStyle='#222';g.fillRect(820,GY-300,8,300);g.fillRect(790,GY-300,50,8);g.fillStyle='#262420';g.fillRect(0,GY,SW,H-GY);for(let i=0;i<60;i++){g.fillStyle='rgba(120,140,170,.14)';g.beginPath();g.ellipse(rnd(0,SW),rnd(GY+10,H),rnd(20,70),rnd(3,8),0,0,7);g.fill()}
    g.fillStyle='#1a1a1a';for(let i=0;i<4;i++)g.fillRect(360+i*40,120,4,GY-120);g.fillRect(340,120,190,5);g.fillRect(340,200,190,5);g.fillRect(340,280,190,5)}
  stageC[id]={near:cv2,far}}
/* ---------------- state ---------------- */
let state='menu',theme=THEMES[0],mode='cpu',F1=null,F2=null,round=1,timer=99,tAcc=0,ann=null,annT=0,hitStop=0,shake=0,camX=(SW-W)/2,sparks=[],projs=[],texts=[],slow=0,roundOver=0,winner=null,sel={p1:0,p2:1},arcade=null,diff=S.get('fr_diff',1),superF=0,superBy=null,frame=0,grain=null;
const keys={};c.on(document,'keydown',e=>{const k=e.key.toLowerCase();if(state==='fight'&&[' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();if(!keys[k])keys[k]=1;if(k==='escape'&&state==='fight'){state='paused';pauseMenu()}});c.on(document,'keyup',e=>{keys[e.key.toLowerCase()]=0});
const KM1={u:'w',d:'s',l:'a',r:'d',lp:'j',hp:'k',lk:'u',hk:'i',s1:'l',s2:'o',su:' '},KM2={u:'arrowup',d:'arrowdown',l:'arrowleft',r:'arrowright',lp:'1',hp:'2',lk:'4',hk:'5',s1:'3',s2:'6',su:'0'},KM2b={lp:',',hp:'.',lk:';',hk:"'",s1:'/',s2:']',su:'\\'};
const touch={u:0,d:0,l:0,r:0,lp:0,hp:0,lk:0,hk:0,s1:0,s2:0,su:0};
function readInput(F){if(F.ctrl==='cpu')return F.ai.inp||{};const m=F.side===0?KM1:KM2,m2=F.side===0?null:KM2b;const o={};for(const k in m)o[k]=!!(keys[m[k]]||(m2&&m2[k]&&keys[m2[k]])||(F.side===0&&mode!=='2p'?0:0));if(F.side===0){for(const k in touch)o[k]=o[k]||!!touch[k];if(mode!=='2p'){o.u=o.u||!!keys.arrowup;o.d=o.d||!!keys.arrowdown;o.l=o.l||!!keys.arrowleft;o.r=o.r||!!keys.arrowright}}return o}
/* ---------------- touch controls ---------------- */
const tc=el('div',{class:'fr-tc'}),pad=el('div',{class:'fr-pad'},el('i')),bts=el('div',{class:'fr-bt'});tc.append(pad,bts);wrap.append(tc);
[['lp','PUNCH'],['hp','HEAVY P'],['s1','SPECIAL','s'],['lk','KICK'],['hk','HEAVY K'],['s2','RISE','s'],['su','SUPER','su']].forEach(([k,t,cl])=>{const b=el('button',{type:'button',class:cl||''},t);if(k==='su')b.style.gridColumn='3';b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();touch[k]=1});['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>touch[k]=0));bts.append(b)});
let padId=null;const padU=e=>{const r=pad.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),d=Math.hypot(dx,dy),m=Math.min(d,46);pad.firstChild.style.transform=`translate(${d?dx/d*m:0}px,${d?dy/d*m:0}px)`;touch.l=dx<-18;touch.r=dx>18;touch.u=dy<-24;touch.d=dy>22};
pad.addEventListener('pointerdown',e=>{e.preventDefault();padId=e.pointerId;pad.setPointerCapture(e.pointerId);padU(e)});pad.addEventListener('pointermove',e=>{if(e.pointerId===padId)padU(e)});['pointerup','pointercancel'].forEach(ev=>pad.addEventListener(ev,e=>{if(e.pointerId!==padId)return;padId=null;touch.l=touch.r=touch.u=touch.d=0;pad.firstChild.style.transform=''}));
c.on(wrap,'touchstart',()=>wrap.classList.add('touch'),{passive:true});
/* ---------------- audio ---------------- */
function sHit(p){noise(.08+p*.1,'lowpass',900+p*600,.18+p*.1);sweep(200+p*80,60,.1,'square',.06)}
function sBlock(){noise(.06,'highpass',2500,.12);beep(1400,.03,'square',.04)}
function sWhoosh(){noise(.1,'bandpass',1800,.05)}
function say(t){if(muted)return;try{const u=new SpeechSynthesisUtterance(t);u.rate=1.05;u.pitch=.7;u.volume=.8;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
/* ---------------- fight logic ---------------- */
function dirNum(F,inp){const fw=F.f>0?inp.r:inp.l,bk=F.f>0?inp.l:inp.r;const h=fw?1:bk?-1:0,v=inp.u?1:inp.d?-1:0;return 5+h+v*3}
function motion(F,seq,win){const b=F.buf;let i=b.length-1,j=seq.length-1;const lim=Math.max(0,b.length-(win||14));while(i>=lim&&j>=0){if(b[i]===seq[j])j--;i--}return j<0}
function startMove(F,id,def){F.mv=Object.assign({id},def);F.mt=0;F.hitDone=false;F.st='attack';if(!def.air&&!def.keepV)F.vx=0;sWhoosh()}
function special(F,which){const sp=F.ch[which];const pw=F.ch.pow;const base={s:12,a:4,r:22,d:sp.d*pw||90,hs:22,bs:16,lim:'fh',r2:26,lv:'m',push:10,sp:which,spec:sp};
  if(which==='su'){if(F.meter<100)return false;F.meter=0;superF=50;superBy=F;say('Super!');const t=F.ch.su.t;if(t==='mega')startMove(F,'su',Object.assign(base,{s:20,a:2,r:30,proj:{k:F.ch.su.k,v:9,d:260,big:1},k:[P('idle',{fs:.8,fe:2.2,bs:.8,be:2.2,y:20,t:-.1}),P('idle',{fs:1.6,fe:.05,bs:1.55,be:.1,t:.3,x:10})]}));
    else startMove(F,'su',Object.assign(base,{s:14,a:60,r:20,d:34*pw,hs:18,multi:6,rush:7,lim:'fh',r2:34,k:[P('idle',{t:.3,y:16,fs:1.4,fe:1.8}),P('idle',{fs:1.6,fe:.05,t:.45,x:14})]}));return true}
  if(sp.t==='proj'){if(F.proj>0)return false;startMove(F,which,Object.assign(base,{s:13,a:2,r:24,proj:sp,k:[P('idle',{fs:.9,fe:2.2,bs:1.2,be:2,t:-.05}),P('idle',{fs:1.6,fe:.05,bs:1.5,be:.2,t:.3,x:8})]}));return true}
  if(sp.t==='whip'){startMove(F,which,Object.assign(base,{s:11,a:5,r:22,lim:'whip',r2:26,push:14,k:[P('idle',{fs:2.6,fe:.5,t:-.2}),P('idle',{fs:1.5,fe:.05,t:.35,x:8})]}));return true}
  if(sp.t==='rise'){startMove(F,which,Object.assign(base,{s:3,a:14,r:26,lim:sp.k==='knee'?'fk':'fh',r2:30,ln:1,kd:1,inv:8,rise:1,hs:30,k:[P('crouch',{fs:.8,fe:2.2,y:30}),sp.k==='knee'?P('jump',{fl:{fk:[1.6,2.4]},fs:2.6,fe:.4,t:.1}):P('jump',{fs:3.05,fe:.1,t:.05,bl:{fk:[-.1,1.4]},fl:{fk:[.6,1]}})]}));F.vy=0;return true}
  if(sp.t==='dash'){const kick=sp.k==='slide'||sp.k==='spin';startMove(F,which,Object.assign(base,{s:9,a:16,r:18,lim:kick?'ff':'fh',r2:30,kd:1,dash:sp.k==='slide'?9:sp.k==='flash'?14:8,lv:sp.k==='slide'?'l':'m',k:kick?[P('idle',{t:-.2,fl:{fk:[1,1.5]}}),sp.k==='slide'?P('crouch',{y:56,t:-.5,fl:{fk:[1.55,0]},bl:{fk:[.6,1.6]}}):P('idle',{fl:{fk:[1.7,.05]},t:-.4,y:6})]:[P('idle',{t:-.1,fs:.9,fe:2.2}),P('idle',{t:.6,x:10,fs:1.6,fe:.05,bs:.9,be:.6})]}));return true}
  if(sp.t==='tele'){startMove(F,which,Object.assign(base,{s:14,a:5,r:16,lim:'ff',r2:30,tele:1,kd:1,k:[P('crouch',{y:30}),P('idle',{fl:{fk:[1.8,.05]},t:-.4})]}));return true}
  if(sp.t==='grab'){startMove(F,which,Object.assign(base,{s:6,a:4,r:30,lim:'fh',r2:34,lv:'t',kd:1,hs:40,k:[P('idle',{fs:1.3,fe:.9,bs:1.3,be:.9,t:.2}),P('idle',{fs:1.7,fe:.2,bs:1.7,be:.3,t:.4,x:18})]}));return true}
  return false}
function tryAct(F,O,inp,pr){// pr = pressed this frame
  const air=F.y>0,cr=inp.d&&!air;const n=dirNum(F,inp);
  if(pr.su&&F.meter>=100)return special(F,'su');
  if(pr.lp||pr.hp){if(motion(F,[2,3,6,2,3,6],24)&&F.meter>=100)return special(F,'su');if(motion(F,[6,2,3]))return special(F,'s2');if(motion(F,[2,3,6]))return special(F,'s1')}
  if(pr.lk||pr.hk){if(motion(F,[2,1,4]))return special(F,'s3')}
  if(pr.s1){if(inp.d&&(F.f>0?inp.l:inp.r)||n===4&&F.ch.s3)return special(F,'s3');return special(F,'s1')}
  if(pr.s2)return special(F,'s2');
  if(air){if(pr.lp||pr.hp){startMove(F,'jp',MV.jp);return true}if(pr.lk||pr.hk){startMove(F,'jk',MV.jk);return true}return false}
  if(pr.hp&&(n===6||n===4)&&Math.abs(O.x-F.x)<90*F.sc&&O.y===0&&O.st!=='down'&&!O.inv){startMove(F,'thr',MV.thr);return true}
  const m=cr?(pr.lp?'clp':pr.hp?'chp':pr.lk?'clk':pr.hk?'chk':null):(pr.lp?'lp':pr.hp?'hp':pr.lk?'lk':pr.hk?'hk':null);if(m){startMove(F,m,Object.assign({},MV[m],{d:MV[m].d*F.ch.pow}));return true}return false}
function hurt(J,F){const out=[[J.head,F.L.hr*1.05],[[(J.hip[0]+J.neck[0])/2,(J.hip[1]+J.neck[1])/2],26*F.sc],[J.hip,22*F.sc],[J.bk,15],[J.fk,15],[J.bf,13],[J.ff,13]];return out}
function doHit(A,D,mv,px,py){const di=D.inp||{};const cr=D.st==='crouch'||D.crouch;const blockDir=D.f>0?di.l:di.r;const canBlock=D.y===0&&(D.st==='idle'||D.st==='walk'||D.st==='crouch'||D.st==='block')&&blockDir&&mv.lv!=='t';
  let blocked=false;if(canBlock){if(mv.lv==='l')blocked=!!di.d;else if(mv.lv==='o')blocked=!di.d;else blocked=true}
  const scale=Math.max(.3,1-.1*A.combo);const kx=(D.x>A.x?1:-1);
  if(blocked){const chip=mv.spec||mv.sp?Math.round(mv.d*.15):0;D.hp=Math.max(1,D.hp-chip);D.st='block';D.stun=mv.bs||10;D.vx=kx*(mv.push||5)*.6;sBlock();spark(px,py,'#9ad8ff',6,1);A.meter=Math.min(100,A.meter+3);D.meter=Math.min(100,D.meter+2);hitStop=5;return}
  const dmg=Math.round(mv.d*scale);D.hp=Math.max(0,D.hp-dmg);A.combo++;A.meter=Math.min(100,A.meter+dmg/12);D.meter=Math.min(100,D.meter+dmg/18);D.dmgFlash=3;
  const big=mv.d>=70||mv.kd||mv.ln;hitStop=big?9:6;shake=big?8:4;sHit(big?1:.3);spark(px,py,theme.id==='toon'?'#ffffff':'#ffe27a',big?14:8,big?1.6:1);if(big&&Math.random()<.6)word(px,py-30);
  const air=D.y>0||mv.ln||mv.kd;if(D.hp<=0){D.st='air';D.vy=10;D.vx=kx*6;D.stun=999;return}
  if(mv.lv==='t'){D.st='air';D.vy=12;D.vx=kx*7;D.stun=0;D.juggle=3;return}
  if(air){D.st='air';D.vy=mv.ln?15:mv.kd?9:7;D.vx=kx*(mv.kd?6:3.5);D.juggle++;if(D.juggle>3)D.vy=5}else{D.st='hit';D.stun=mv.hs||15;D.vx=kx*(mv.push||5);D.crouch=cr}}
function spark(px,py,col,n,s){for(let i=0;i<n;i++){const a=rnd(0,2*PI),v=rnd(3,9)*s;sparks.push({x:px,y:py,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:rnd(.2,.45),col,ln:rnd(8,18)*s})}sparks.push({x:px,y:py,ring:1,l:.25,max:.25,col,s})}
function word(px,py){const ws=theme.id==='toon'?['BONK!','ZOK!','WHAM!','BOING!']:theme.id==='hero'?['POW!','BAM!','KRAK!','WHAM!','ZAP!']:['SMACK!','CRACK!','BAM!'];texts.push({x:px,y:py,t:pick(ws),l:.6,max:.6,r:rnd(-.3,.3)})}
function stepF(F,O,dt){const inp=readInput(F);F.inp=inp;const pr={};if(!F.prev)F.prev={};for(const k in inp)pr[k]=inp[k]&&!F.prev[k];F.prev=Object.assign({},inp);
  const dn=dirNum(F,inp);if(F.buf[F.buf.length-1]!==dn)F.buf.push(dn);if(F.buf.length>30)F.buf.shift();F.bufT=(F.bufT||0)+1;if(F.bufT>20&&F.buf.length>1){F.buf.shift();F.bufT=0}
  F.t++;if(F.inv>0)F.inv--;if(F.dmgFlash>0)F.dmgFlash--;const ground=F.y<=0;
  if(roundOver||F.st==='ko'||F.st==='win'){if(ground&&F.st!=='air'&&F.st!=='down'){F.vx*=.8}}
  // face opponent when grounded & neutral
  if(ground&&(F.st==='idle'||F.st==='walk'||F.st==='crouch'))F.f=O.x>F.x?1:-1;
  const sp=3.2*F.ch.spd;
  switch(F.st){
    case'intro':break;
    case'idle':case'walk':case'crouch':{if(roundOver)break;if(tryAct(F,O,inp,pr))break;const fw=F.f>0?inp.r:inp.l,bk=F.f>0?inp.l:inp.r;
      if(inp.u&&ground){F.st='jump';F.vy=17.5;F.vx=(fw?1:bk?-1:0)*sp*1.25*F.f;F.jumpT=0;break}
      if(inp.d){F.st='crouch';F.vx=0;break}F.st=fw||bk?'walk':'idle';F.vx=(fw?sp:bk?-sp*.8:0)*F.f;if(F.st==='walk')F.walkPh+=(fw?1:-1)*.16*F.ch.spd;break}
    case'jump':{if(!roundOver)tryAct(F,O,inp,pr);break}
    case'attack':{const m=F.mv;F.mt++;const s=m.s,a=m.a;if(m.dash&&F.mt>s&&F.mt<=s+a)F.vx=m.dash*F.f*F.ch.spd;else if(m.dash&&F.mt>s+a)F.vx*=.7;
      if(m.rise&&F.mt===s){F.vy=m.spec&&m.spec.k==='knee'?13:16;F.vx=3*F.f}
      if(m.tele&&F.mt===s-2){F.x=clamp(O.x-O.f*70,camX+40,camX+W-40);F.f=O.x>F.x?1:-1;spark(F.x,GY-80,'#b87aff',16,1.4)}
      if(m.rush&&F.mt>s&&F.mt<s+a)F.vx=m.rush*F.f*(Math.abs(O.x-F.x)>70?1:.2);
      if(m.proj&&F.mt===s){const J=joints(F);const pj=m.proj;const n=pj.multi||1;for(let i=0;i<n;i++)projs.push({x:J.fh[0]+10*F.f,y:J.fh[1]-i*16+(n>1?16:0),vx:(pj.v||8)*F.f*(1+i*.12),vy:pj.arc?-9:0,arc:pj.arc,k:pj.k,d:(pj.d||80)*F.ch.pow/(n>1?1.3:1),o:F,r:pj.big?46:pj.k==='anvil'?26:22,l:3,rot:0,big:pj.big,hits:pj.big?1:1});F.proj=pj.big?0:1;sweep(300,900,.18,'sawtooth',.06)}
      if(F.mt>s&&F.mt<=s+a&&!m.proj){const J=joints(F);let p=m.lim==='whip'?[F.x+F.f*(120+(F.mt-s)*14),GY-F.y-110]:J[m.lim];
        if(!F.hitDone||m.multi){if(!(m.multi&&F.mt%9))for(const[hp,r]of hurt(joints(O),O)){if(O.inv>0||O.st==='down'||O.st==='ko'&&O.y<=0)break;if(m.lv==='t'&&(O.y>0||O.st==='hit'||O.st==='air'))break;if(Math.hypot(hp[0]-p[0],hp[1]-p[1])<r+(m.r2||20)){F.hitDone=true;doHit(F,O,m,(p[0]+hp[0])/2,(p[1]+hp[1])/2);break}}}}
      if(F.mt>=s+a+m.r&&(ground||m.air)){F.mv=null;F.st=ground?'idle':'jump'}break}
    case'block':case'hit':{F.stun--;F.vx*=.85;if(F.stun<=0){F.st='idle';if(F===F1?F2:F1)(F===F1?F2:F1).combo=0}break}
    case'air':break;
    case'down':{F.stun--;F.vx=0;if(F.stun<=0){if(F.hp<=0){F.st='ko';break}F.st='idle';F.inv=20;F.juggle=0;O.combo=0}break}}
  // physics
  if(F.y>0||F.vy>0||F.st==='jump'||F.st==='air'||(F.st==='attack'&&(F.mv.air||F.mv.rise))){F.vy-=.72;F.y+=F.vy;if(F.y<=0){F.y=0;F.vy=0;if(F.st==='air'){F.st='down';F.stun=F.hp<=0?999:38;shake=6;noise(.15,'lowpass',300,.2);spark(F.x,GY,'#8a7a6a',6,.8)}else if(F.st==='jump'||F.st==='attack'&&(F.mv&&(F.mv.air||F.mv.rise))){if(F.st==='attack'&&F.mv.rise&&F.mt<F.mv.s+F.mv.a+F.mv.r){}else{F.st='idle';F.mv=null}}}}
  F.x+=F.vx;if(F.st==='air'||F.st==='jump')F.vx*=.995;else if(F.st!=='attack'&&F.st!=='walk')F.vx*=.8;
  F.x=clamp(F.x,40,SW-40);F.x=clamp(F.x,camX+36,camX+W-36);
  if(F.proj>0&&!projs.some(p=>p.o===F))F.proj=0;
  // pose target
  let tgt;const cr=F.st==='crouch';switch(F.st){case'idle':tgt=P('idle',{y:6+Math.sin(F.t*.08)*2.5,bs:1.3+Math.sin(F.t*.08)*.05});break;
    case'walk':{const w=F.walkPh,sw=Math.sin(w)*20;tgt=P('idle',{bl:{ik:[-26+sw,Math.max(0,Math.cos(w))*12]},fl:{ik:[30-sw,Math.max(0,-Math.cos(w))*12]},y:6+Math.abs(Math.sin(w))*3});break}
    case'crouch':tgt=(F.f>0?inp.l:inp.r)?POSE.cblock:POSE.crouch;break;
    case'jump':tgt=F.vy>4?P('jump',{bl:{fk:[-.1,.6]},fl:{fk:[.3,.7]}}):POSE.jump;break;
    case'attack':{const m=F.mv,t=F.mt,s=m.s,a=m.a;tgt=t<=s?mixP(F.y>0?POSE.jump:m.k[0].y>30?POSE.crouch:P0,m.k[0],Math.min(1,t/Math.max(1,s)*1.4)):t<=s+a?(m.multi?(t%8<4?m.k[1]:mixP(m.k[1],P('idle',{fs:1.5,fe:.1,bs:1.6,be:.05,t:.45,x:14}),1)):m.k[1]):mixP(m.k[1],F.y>0?POSE.jump:m.k[0].y>30?POSE.crouch:P0,(t-s-a)/m.r);break}
    case'block':tgt=F.crouch||inp.d?POSE.cblock:POSE.block;break;case'hit':tgt=F.crouch?POSE.hitc:POSE.hit;break;case'air':tgt=POSE.air;break;case'down':tgt=POSE.down;break;case'ko':tgt=POSE.down;break;case'win':tgt=P('win',{fs:2.95+Math.sin(F.t*.15)*.1});break;case'lose':tgt=POSE.lose;break;default:tgt=P0}
  const rate=F.st==='attack'?.55:F.st==='hit'||F.st==='air'?.5:.25;F.pose=mixP(F.pose,tgt,rate);
  // cape verlet
  if(F.ch.cape){const J=joints(F);if(!F.cape)F.cape=Array.from({length:6},(_,i)=>({x:J.sh[0],y:J.sh[1]+i*14,px:J.sh[0],py:J.sh[1]+i*14}));const cp=F.cape;cp[0].x=J.sh[0]-6*F.f;cp[0].y=J.sh[1];for(let i=1;i<cp.length;i++){const p=cp[i],vx=(p.x-p.px)*.9,vy=(p.y-p.py)*.9;p.px=p.x;p.py=p.y;p.x+=vx-F.vx*.05-F.f*.4;p.y+=vy+.9;if(p.y>GY-2)p.y=GY-2}
    for(let k=0;k<3;k++)for(let i=1;i<cp.length;i++){const a=cp[i-1],b=cp[i],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,df=(d-15)/d;if(i>1){a.x+=dx*df*.5;a.y+=dy*df*.5}b.x-=dx*df*(i>1?.5:1);b.y-=dy*df*(i>1?.5:1)}}}
function pushApart(){if(F1.y>40||F2.y>40)return;const d=F2.x-F1.x,min=58*(F1.sc+F2.sc)/2;if(Math.abs(d)<min){const o=(min-Math.abs(d))/2*(d>=0?1:-1);F1.x-=o;F2.x+=o;[F1,F2].forEach(F=>F.x=clamp(F.x,40,SW-40))}}
function stepProj(){for(let i=projs.length-1;i>=0;i--){const p=projs[i];p.x+=p.vx;if(p.arc){p.vy+=.45;p.y+=p.vy;if(p.y>GY-10){p.l=0;spark(p.x,GY-10,'#fff',10,1);if(p.k==='bottle')sHit(.2)}}p.rot+=.3;p.l-=1/60;const O=p.o===F1?F2:F1;
    for(const q of projs){if(q!==p&&q.o!==p.o&&Math.hypot(q.x-p.x,q.y-p.y)<p.r+q.r){if(p.big&&!q.big)q.l=0;else if(q.big&&!p.big)p.l=0;else{p.l=0;q.l=0}spark((p.x+q.x)/2,(p.y+q.y)/2,'#fff',12,1.2);sBlock()}}
    if(p.l>0&&O.inv<=0&&O.st!=='down'&&O.st!=='ko')for(const[hp,r]of hurt(joints(O),O)){if(Math.hypot(hp[0]-p.x,hp[1]-p.y)<r+p.r){doHit(p.o,O,{d:p.d,hs:22,bs:16,lv:'m',push:8,kd:p.big||p.k==='anvil',spec:1},p.x,p.y);p.l=0;break}}
    if(p.l<=0||p.x<camX-100||p.x>camX+W+100)projs.splice(i,1)}}
/* ---------------- CPU AI ---------------- */
function ai(F,O){const A=F.ai,inp={};A.t--;const d=Math.abs(O.x-F.x),fw=F.f>0?'r':'l',bk=F.f>0?'l':'r';const lvl=[.35,.65,.9][diff];
  // reactive block / anti-air
  const oAtk=O.st==='attack'&&O.mv&&O.mt<=O.mv.s+O.mv.a;const incoming=projs.some(p=>p.o===O&&Math.abs(p.x-F.x)<260&&Math.sign(p.vx)===Math.sign(F.x-p.x));
  if((oAtk&&d<190||incoming)&&F.st!=='attack'&&Math.random()<lvl*.9){inp[bk]=1;if(O.mv&&O.mv.lv==='l'||O.st==='crouch')inp.d=1;if(incoming&&Math.random()<lvl*.3){inp.u=1;inp[fw]=1}F.ai.inp=inp;return}
  if(O.y>30&&O.vx*(F.x-O.x)>0&&d<200&&Math.random()<lvl*.25){inp.s2=1;F.ai.inp=inp;return}
  if((O.st==='hit'||O.st==='air'&&O.y<80)&&F.st==='idle'&&d<150){if(Math.random()<lvl){inp[pick(['hp','hk','s2'])]=1;F.ai.inp=inp;return}}
  if(A.t<=0||!A.act){A.t=Math.round(rnd(12,40)*(1.4-lvl));const r=Math.random();
    if(F.meter>=100&&d<220&&r<lvl*.5)A.act='su';else if(d>360)A.act=r<.35&&(F.ch.s1.t==='proj')?'s1':r<.55?'dash':'fwd';else if(d>160)A.act=r<.25?'fwd':r<.4&&F.ch.s1.t==='proj'?'s1':r<.52?'s3':r<.65?'jumpin':r<.8?'back':'wait';else A.act=r<.5?pick(['lp','lk','hp','hk','clk','chk','lp']):r<.62?'thr':r<.72?'back':r<.82?'s3':'crblock'}
  const a=A.act;if(a==='fwd'||a==='dash')inp[fw]=1;if(a==='back')inp[bk]=1;if(a==='crblock'){inp[bk]=1;inp.d=1}if(a==='jumpin'){inp.u=1;inp[fw]=1;A.act='jk'}else if(a==='jk'&&F.y>40&&d<130){inp.hk=1;A.act=null}
  if(['lp','lk','hp','hk'].includes(a)){if(d>110)inp[fw]=1;else{inp[a]=1;A.act=Math.random()<lvl*.6?pick(['hp','s2','hk',null]):null}}
  if(a==='clk'||a==='chk'){inp.d=1;if(d>100)inp[fw]=1;else{inp[a.slice(1)]=1;A.act=null}}
  if(a==='thr'){inp[fw]=1;if(d<85){inp.hp=1;A.act=null}}
  if(a==='s1'||a==='s2'||a==='s3'||a==='su'){inp[a]=1;A.act=null}
  if(a==='wait'&&Math.random()<.02)A.act=null;F.ai.inp=inp}
/* ---------------- draw ---------------- */
function drawProj(p){x.save();x.translate(p.x,p.y);const s=p.big?2:1;x.scale(s,s);x.rotate(p.k==='fire'||p.k==='bolt'?0:p.rot);const OL='#111';
  if(p.k==='pie'){x.fillStyle='#b8905a';x.beginPath();x.ellipse(0,4,20,8,0,0,7);x.fill();x.fillStyle='#fffaf0';x.strokeStyle=OL;x.lineWidth=2;x.beginPath();x.ellipse(0,0,19,9,0,PI,2*PI);x.fill();x.stroke()}
  else if(p.k==='note'){x.fillStyle='#141414';x.beginPath();x.ellipse(-4,6,8,6,-.4,0,7);x.fill();x.fillRect(2,-16,3,22);x.fillRect(2,-16,10,4)}
  else if(p.k==='hat'){x.fillStyle='#141414';x.fillRect(-18,2,36,5);x.fillRect(-11,-12,22,15)}
  else if(p.k==='anvil'){x.fillStyle='#3a3a3a';x.strokeStyle='#eee';x.lineWidth=1.5;x.beginPath();x.moveTo(-24,-10);x.lineTo(24,-10);x.lineTo(14,0);x.lineTo(8,0);x.lineTo(12,14);x.lineTo(-12,14);x.lineTo(-8,0);x.lineTo(-18,0);x.closePath();x.fill();x.stroke()}
  else if(p.k==='bolt'){x.strokeStyle='#fff6a0';x.lineWidth=5;x.shadowColor='#ffe03a';x.shadowBlur=20;x.beginPath();x.moveTo(-26*Math.sign(p.vx),0);for(let i=0;i<6;i++)x.lineTo((-26+i*10)*Math.sign(p.vx),rnd(-10,10));x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(0,0,10,0,7);x.fill()}
  else if(p.k==='fire'){x.shadowColor='#ff7a1a';x.shadowBlur=24;for(let i=0;i<4;i++){x.fillStyle=['#ff3a0a','#ff7a1a','#ffc23a','#fff4c0'][i];x.beginPath();x.ellipse(-i*2*Math.sign(p.vx),0,22-i*5,16-i*3.5,0,0,7);x.fill()}for(let i=0;i<3;i++){x.fillStyle='rgba(255,120,20,.5)';x.beginPath();x.arc(-(20+i*10)*Math.sign(p.vx),rnd(-6,6),8-i*2,0,7);x.fill()}}
  else if(p.k==='star'){x.fillStyle='#d0c8e0';x.strokeStyle='#2a1a3a';x.lineWidth=1.5;x.beginPath();for(let i=0;i<8;i++){const r=i%2?4:14,a=i/8*2*PI;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fill();x.stroke()}
  else if(p.k==='shield'){x.fillStyle='#e8321e';x.beginPath();x.arc(0,0,20,0,7);x.fill();x.fillStyle='#f4f4f4';x.beginPath();x.arc(0,0,14,0,7);x.fill();x.fillStyle='#2a5ad8';x.beginPath();x.arc(0,0,9,0,7);x.fill()}
  else if(p.k==='knife'){x.fillStyle='#d8dce0';x.beginPath();x.moveTo(-4,-3);x.lineTo(16,0);x.lineTo(-4,3);x.fill();x.fillStyle='#3a2a1a';x.fillRect(-14,-3,10,6)}
  else if(p.k==='bottle'){x.fillStyle='rgba(60,120,40,.9)';x.fillRect(-12,-5,18,10);x.fillRect(6,-2.5,8,5)}
  else if(p.k==='chain'){x.strokeStyle='#bbb';x.lineWidth=4;for(let i=-3;i<=3;i++){x.beginPath();x.ellipse(i*9,0,6,4,0,0,7);x.stroke()}}
  x.restore()}
function draw(){x.setTransform(DPR,0,0,DPR,0,0);const st=stageC[theme.id];const sk=shake>0?[rnd(-shake,shake),rnd(-shake,shake)]:[0,0];
  x.drawImage(st.far,-camX*.4-(SW-W)*0,0,SW,H);x.save();x.translate(-camX+sk[0],sk[1]);x.drawImage(st.near,0,0);
  if(theme.id==='hero'){x.save();x.globalAlpha=.08;x.fillStyle='#fff';const t2=frame*.01;[[300,.4],[1100,-.3]].forEach(([sx,a])=>{x.beginPath();x.moveTo(sx,GY);x.lineTo(sx+Math.sin(t2+a)*400-60,0);x.lineTo(sx+Math.sin(t2+a)*400+60,0);x.fill()});x.restore()}
  if(theme.id==='street'){const lg=x.createRadialGradient(824,GY-290,10,824,GY-200,320);lg.addColorStop(0,'rgba(255,220,150,.35)');lg.addColorStop(1,'rgba(255,220,150,0)');x.fillStyle=lg;x.fillRect(500,GY-520,650,560)}
  if(theme.id==='toon'){for(let i=0;i<5;i++){const tx=180+i*300,sq=Math.sin(frame*.12+i)*.08;x.save();x.translate(tx,GY-44);x.scale(1-sq,1+sq);x.fillStyle='#2a2620';x.fillRect(-7,-90,14,90);x.fillStyle='#4a453c';x.strokeStyle='#141414';x.lineWidth=3;x.beginPath();x.arc(0,-120,46,0,7);x.fill();x.stroke();x.fillStyle='#fafafa';x.beginPath();x.arc(-14,-130,7,0,7);x.arc(14,-130,7,0,7);x.fill();x.fillStyle='#141414';x.beginPath();x.arc(-13,-128,3,0,7);x.arc(15,-128,3,0,7);x.fill();x.restore()}}
  // shadows
  [F1,F2].forEach(F=>{x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.ellipse(F.x,GY+4,44*F.sc*Math.max(.4,1-F.y/300),9,0,0,7);x.fill()});
  const order=F1.st==='attack'?[F2,F1]:[F1,F2];order.forEach(F=>{const J=joints(F);drawF(F,J,F.inv>0&&F.st==='idle'&&frame%4<2?.5:null)});
  projs.forEach(drawProj);
  sparks.forEach(s=>{if(s.ring){const t=1-s.l/s.max;x.strokeStyle=s.col;x.globalAlpha=1-t;x.lineWidth=4;x.beginPath();x.arc(s.x,s.y,10+t*50*s.s,0,7);x.stroke();x.globalAlpha=1;return}x.strokeStyle=s.col;x.lineWidth=3;x.beginPath();x.moveTo(s.x,s.y);x.lineTo(s.x-s.vx*s.ln/8,s.y-s.vy*s.ln/8);x.stroke()});
  texts.forEach(t=>{const k=t.l/t.max;x.save();x.translate(t.x,t.y-(1-k)*20);x.rotate(t.r);x.scale(1+(1-k)*.4,1+(1-k)*.4);x.globalAlpha=Math.min(1,k*2);x.font="900 38px 'Arial Black',Impact,sans-serif";x.textAlign='center';x.lineWidth=7;x.strokeStyle='#111';x.strokeText(t.t,0,0);x.fillStyle=theme.id==='toon'?'#fafafa':'#ffd23f';x.fillText(t.t,0,0);x.restore()});
  x.restore();
  if(superF>0){x.fillStyle='rgba(0,0,0,'+Math.min(.55,superF/40)+')';x.fillRect(0,0,W,H);const F=superBy;x.save();x.translate(-camX,0);drawF(F,joints(F));x.restore();x.save();x.globalAlpha=Math.min(1,superF/20);x.fillStyle=theme.id==='toon'?'#fafafa':'#ffd23f';x.font="900 60px 'Arial Black',Impact,sans-serif";x.textAlign='center';x.fillText('SUPER!',W/2,H*.3);x.restore()}
  // theme post fx
  if(theme.id==='toon'){x.save();x.globalCompositeOperation='multiply';x.fillStyle='rgba(200,180,140,.35)';x.fillRect(0,0,W,H);x.restore();if(grain){x.globalAlpha=.12;x.drawImage(grain,rnd(-50,0),rnd(-50,0));x.globalAlpha=1}if(frame%40<2){x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=1;const sx=rnd(0,W);x.beginPath();x.moveTo(sx,0);x.lineTo(sx+rnd(-8,8),H);x.stroke()}const vg=x.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.85);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(20,10,0,.6)');x.fillStyle=vg;x.fillRect(0,0,W,H)}
  if(theme.id==='street'){const vg=x.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.9);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,10,.55)');x.fillStyle=vg;x.fillRect(0,0,W,H)}
  hudD()}
function bar(xx,yy,w,h,v,col,rev){x.fillStyle='rgba(0,0,0,.6)';x.fillRect(xx-3,yy-3,w+6,h+6);x.fillStyle='#5a0a0a';x.fillRect(xx,yy,w,h);const vw=w*clamp(v,0,1);x.fillStyle=col;x.fillRect(rev?xx+w-vw:xx,yy,vw,h);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(rev?xx+w-vw:xx,yy,vw,h*.35)}
function hudD(){const bw=360,hb=22;[F1,F2].forEach((F,i)=>{const rev=i===1,xx=i?W-20-bw:20;F.dispHp=F.dispHp==null?F.hp:F.dispHp+(F.hp-F.dispHp)*.06;bar(xx,20,bw,hb,F.dispHp/F.maxHp,'#ffffff',rev);x.fillStyle=F.hp/F.maxHp>.3?'#ffd23f':'#ff5a3a';const vw=bw*F.hp/F.maxHp;x.fillRect(rev?xx+bw-vw:xx,20,vw,hb);x.fillStyle='rgba(255,255,255,.3)';x.fillRect(rev?xx+bw-vw:xx,20,vw,7);
    x.font="900 17px 'Arial Black',system-ui,sans-serif";x.textAlign=rev?'right':'left';x.lineWidth=4;x.strokeStyle='#111';x.strokeText(F.name.toUpperCase(),rev?xx+bw:xx,64);x.fillStyle='#fff';x.fillText(F.name.toUpperCase(),rev?xx+bw:xx,64);
    for(let k=0;k<2;k++){x.fillStyle=F.wins>k?'#ffd23f':'rgba(0,0,0,.5)';x.strokeStyle='#111';x.lineWidth=2;x.beginPath();x.arc(rev?xx+bw-150-k*22:xx+150+k*22,58,7,0,7);x.fill();x.stroke()}
    bar(i?W-20-200:20,H-26,200,10,F.meter/100,F.meter>=100?(frame%10<5?'#ffffff':'#ffd23f'):'#3aa8ff',rev);x.font='900 12px system-ui,sans-serif';x.fillStyle=F.meter>=100?'#ffd23f':'#fff';x.textAlign=rev?'right':'left';x.fillText(F.meter>=100?'SUPER READY':'SUPER',i?W-20:20,H-32);
    if(F.combo>1&&(F===F1?F2:F1).st!=='idle'){x.font="900 30px 'Arial Black',Impact,sans-serif";x.textAlign=rev?'right':'left';x.lineWidth=6;x.strokeText(F.combo+' HITS',rev?W-30:30,150);x.fillStyle='#ffd23f';x.fillText(F.combo+' HITS',rev?W-30:30,150)}});
  x.fillStyle='rgba(0,0,0,.6)';x.fillRect(W/2-34,12,68,48);x.font="900 34px 'Arial Black',system-ui,sans-serif";x.textAlign='center';x.fillStyle=timer<=10?'#ff5a3a':'#fff';x.fillText(String(Math.max(0,Math.ceil(timer))).padStart(2,'0'),W/2,50);
  if(annT>0&&ann){const k=Math.min(1,annT*3);x.save();x.translate(W/2,H*.42);x.scale(1+(1-k)*.5,1+(1-k)*.5);x.font="900 "+(ann.length>9?56:80)+"px 'Arial Black',Impact,sans-serif";x.textAlign='center';x.lineWidth=10;x.strokeStyle='#111';x.strokeText(ann,0,0);x.fillStyle=ann==='K.O.!'||ann==='FIGHT!'?'#e8321e':'#ffd23f';x.fillText(ann,0,0);x.restore()}}
/* ---------------- flow ---------------- */
function announce(t,d){ann=t;annT=d||1.2}
function newRound(){const k1=F1.wins,k2=F2.wins;F1=Object.assign(mkF(F1.ch,0,F1.ctrl),{wins:k1});F2=Object.assign(mkF(F2.ch,1,F2.ctrl),{wins:k2});projs=[];sparks=[];texts=[];timer=99;roundOver=0;winner=null;camX=(SW-W)/2;state='fight';F1.st=F2.st='intro';announce('ROUND '+round,1.3);say('Round '+round);setTimeout(()=>{if(state!=='fight')return;announce('FIGHT!',.9);say('Fight!');F1.st=F2.st='idle'},1400)}
function startFight(c1,c2,m){mode=m;if(!stageC[theme.id])mkStage(theme.id);F1=mkF(c1,0,'p1');F2=mkF(c2,1,m==='2p'?'p2':'cpu');round=1;ov.classList.remove('on');newRound()}
function endRound(){if(roundOver)return;roundOver=1;let w=null;if(F1.hp<=0&&F2.hp<=0)w=null;else if(F1.hp<=0)w=F2;else if(F2.hp<=0)w=F1;else w=F1.hp/F1.maxHp>=F2.hp/F2.maxHp?F1:F2;
  const ko=F1.hp<=0||F2.hp<=0;announce(ko?'K.O.!':'TIME',1.6);if(ko){say('K.O.');slow=60;boomKO()}else say('Time!');if(w){w.wins++;winner=w}
  setTimeout(()=>{if(state!=='fight')return;if(winner){winner.st='win';const L=winner===F1?F2:F1;if(L.hp>0)L.st='lose'}announce(winner?winner.name.toUpperCase()+' WINS':'DRAW',1.8)},1300);
  setTimeout(()=>{if(state!=='fight')return;if(F1.wins>=2||F2.wins>=2)matchOver();else{round++;newRound()}},3500)}
function boomKO(){noise(1,'lowpass',260,.4);sweep(120,40,.9,'sine',.3)}
function matchOver(){state='over';const pw=F1.wins>=2;if(arcade&&pw){arcade.i++;if(arcade.i>=arcade.list.length){const b=S.get('fr_clear',0)+1;S.set('fr_clear',b);c.best(b);return overMenu('ARCADE CLEAR!','You beat every fighter in '+theme.n+'.',false)}return overMenu('YOU WIN','Next opponent: '+arcade.list[arcade.i].n,true)}
  if(pw&&mode==='cpu'){const b=S.get('fr_wins',0)+1;S.set('fr_wins',b)}overMenu(mode==='2p'?(pw?'PLAYER 1 WINS':'PLAYER 2 WINS'):pw?'YOU WIN':'YOU LOSE',F1.name+' '+F1.wins+' – '+F2.wins+' '+F2.name,false)}
function overMenu(t,sub,next){ov.classList.add('on');ov.innerHTML='';ov.append(el('h2',null,t),el('h3',null,sub));const row=el('div',{class:'fr-row'});const b=(tx,fn,cl)=>{const bb=el('button',{type:'button',class:'fr-b '+(cl||'')},tx);bb.onclick=e=>{e.stopPropagation();fn()};row.append(bb)};
  if(next)b('Next fight →',()=>{const o=arcade.list[arcade.i];startFight(F1.ch,o,'cpu')});else b('Rematch',()=>{if(arcade){arcade.i=0;startFight(F1.ch,arcade.list[0],'cpu')}else startFight(F1.ch,F2.ch,mode)});b('Character select',()=>charSelect(),'alt');b('Themes',()=>themeMenu(),'alt');ov.append(row)}
function pauseMenu(){ov.classList.add('on');ov.innerHTML='';ov.append(el('h2',null,'PAUSED'));const row=el('div',{class:'fr-row'});const b=(tx,fn,cl)=>{const bb=el('button',{type:'button',class:'fr-b '+(cl||'')},tx);bb.onclick=e=>{e.stopPropagation();fn()};row.append(bb)};b('Resume',()=>{ov.classList.remove('on');state='fight'});b('Character select',()=>charSelect(),'alt');b('Themes',()=>themeMenu(),'alt');ov.append(row,keysHelp())}
function keysHelp(){return el('div',{class:'fr-keys'},el('b',null,'A'),el('b',null,'D'),' move · ',el('b',null,'W'),' jump · ',el('b',null,'S'),' crouch · hold back to block · ',el('b',null,'J'),' punch ',el('b',null,'K'),' heavy punch ',el('b',null,'U'),' kick ',el('b',null,'I'),' heavy kick · ',el('b',null,'L'),' special ',el('b',null,'O'),' rising special · back+',el('b',null,'L'),' dash special · ',el('b',null,'Space'),' super. Motions work too: ↓↘→+punch, →↓↘+punch, ↓↙←+kick. Forward+heavy punch up close throws.',el('br'),'Player 2: arrows + numpad 1 2 4 5 3 6 0 (or , . ; \' / ] \\)')}
/* ---------------- menus ---------------- */
function portrait(ch,size,pose){const cv2=document.createElement('canvas');cv2.width=size;cv2.height=size;const g=cv2.getContext('2d');const F=mkF(ch,0,'x');F.x=0;F.pose=Object.assign({},pose||P0);const J=joints(F);const sx=x;x=g;g.save();const bg=g.createLinearGradient(0,0,0,size);bg.addColorStop(0,ch.th==='toon'?'#d8d0bc':ch.th==='hero'?'#3a1a5a':'#3a3230');bg.addColorStop(1,ch.th==='toon'?'#8a8272':ch.th==='hero'?'#0e0a28':'#14161e');g.fillStyle=bg;g.fillRect(0,0,size,size);
  const sc=size/290;g.translate(size/2,size*1.02-(GY)*sc);g.scale(sc,sc);g.translate(0,0);drawF(F,J);g.restore();if(ch.th==='toon'){g.globalCompositeOperation='multiply';g.fillStyle='rgba(200,180,140,.35)';g.fillRect(0,0,size,size)}x=sx;return cv2}
function themeMenu(){state='menu';arcade=null;ov.classList.add('on');ov.innerHTML='';ov.append(el('h2',null,'STREET RUMBLE'),el('h3',null,'PICK A THEME'));const row=el('div',{class:'fr-row'});
  THEMES.forEach(t=>{const b=el('button',{type:'button',class:'fr-th'});const cv2=document.createElement('canvas');cv2.width=320;cv2.height=200;const g=cv2.getContext('2d');if(!stageC[t.id])mkStage(t.id);g.drawImage(stageC[t.id].far,0,0,SW,H,0,0,320*SW/W*.6,200*1.0*1.0);g.drawImage(stageC[t.id].near,300,120,W,H-120,0,40,320,160);
    const chs=ROSTER.filter(r=>r.th===t.id);chs.forEach((ch,i)=>{const p=portrait(ch,110,i%2?POSE.win:P0);g.drawImage(p,10+i*75,70,110,110)});if(t.id==='toon'){g.globalCompositeOperation='multiply';g.fillStyle='rgba(200,180,140,.4)';g.fillRect(0,0,320,200)}
    b.append(cv2,el('div',null,el('b',null,t.n),el('small',null,t.d)));b.onclick=e=>{e.stopPropagation();theme=t;charSelect()};row.append(b)});ov.append(row);
  const dr=el('div',{class:'fr-row'});['Easy','Normal','Hard'].forEach((n,i)=>{const b=el('button',{type:'button',class:'fr-b '+(diff===i?'sel':'alt')},'CPU: '+n);b.onclick=e=>{e.stopPropagation();diff=i;S.set('fr_diff',i);themeMenu()};dr.append(b)});ov.append(dr,keysHelp())}
function charSelect(){state='menu';ov.classList.add('on');ov.innerHTML='';const list=ROSTER.filter(r=>r.th===theme.id),others=ROSTER.filter(r=>r.th!==theme.id);ov.append(el('h2',null,theme.n.toUpperCase()),el('h3',null,'CHOOSE YOUR FIGHTER'+(mode==='2p'?' · P1 yellow, P2 blue':'')));
  const row=el('div',{class:'fr-row'});const mk=(ch)=>{const b=el('button',{type:'button',class:'fr-ch'+(sel.p1===ROSTER.indexOf(ch)?' on':'')+(mode==='2p'&&sel.p2===ROSTER.indexOf(ch)?' p2':'')},portrait(ch,150),el('b',null,ch.n),el('small',null,ch.d));b.onclick=e=>{e.stopPropagation();const i=ROSTER.indexOf(ch);if(mode==='2p'&&sel.p1===i){sel.p2=i}else if(mode==='2p'&&e.shiftKey)sel.p2=i;else sel.p1=i;charSelect()};b.oncontextmenu=e=>{e.preventDefault();sel.p2=ROSTER.indexOf(ch);charSelect()};return b};
  list.forEach(ch=>row.append(mk(ch)));ov.append(row);if(ROSTER[sel.p1].th!==theme.id)sel.p1=ROSTER.indexOf(list[0]);if(mode==='2p'&&ROSTER[sel.p2].th!==theme.id)sel.p2=ROSTER.indexOf(list[1]);
  const mr=el('div',{class:'fr-row'});[['cpu','Vs CPU'],['arcade','Arcade'],['2p','2 Players']].forEach(([m,n])=>{const b=el('button',{type:'button',class:'fr-b '+(mode===m?'sel':'alt')},n);b.onclick=e=>{e.stopPropagation();mode=m;charSelect()};mr.append(b)});ov.append(mr);
  if(mode==='2p')ov.append(el('h3',{style:'margin:4px 0'},'Player 2: right-click (or shift-click) a fighter · now '+ROSTER[sel.p2].n));
  const go=el('button',{type:'button',class:'fr-b'},'FIGHT!');go.onclick=e=>{e.stopPropagation();const me=ROSTER[sel.p1];if(mode==='arcade'){const opp=list.filter(r=>r!==me).concat([pick(others)]);arcade={list:opp,i:0};startFight(me,opp[0],'cpu')}else if(mode==='2p'){arcade=null;startFight(me,ROSTER[sel.p2],'2p')}else{arcade=null;const opp=pick(list.filter(r=>r!==me));startFight(me,opp,'cpu')}};
  const bk=el('button',{type:'button',class:'fr-b alt'},'← Themes');bk.onclick=e=>{e.stopPropagation();themeMenu()};ov.append(el('div',{class:'fr-row'},bk,go))}
/* ---------------- loop ---------------- */
grain=document.createElement('canvas');grain.width=W+50;grain.height=H+50;{const g=grain.getContext('2d'),id=g.createImageData(W+50,H+50);for(let i=0;i<id.data.length;i+=4){const v=Math.random()*255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=255}g.putImageData(id,0,0)}
let acc=0;
c.loop(ms=>{frame++;pauseB.style.display=state==='fight'?'':'none';if(!F1){x.setTransform(DPR,0,0,DPR,0,0);x.fillStyle='#111';x.fillRect(0,0,W,H);return}
  if(state==='fight'){acc+=Math.min(50,ms);const stepMs=slow>0?1000/60*2.5:1000/60;while(acc>=stepMs){acc-=stepMs;tick()}}else if(state==='over'){acc+=ms;while(acc>=1000/60){acc-=1000/60;F1.t++;F2.t++;[F1,F2].forEach(F=>{if(F.st==='win')F.pose=mixP(F.pose,P('win',{fs:2.95+Math.sin(F.t*.15)*.1}),.2)})}}
  draw();c.stat(F1&&F2?F1.name+' '+F1.wins+' – '+F2.wins+' '+F2.name:'')});
function tick(){if(slow>0)slow--;if(annT>0)annT-=1/60;texts=texts.filter(t=>(t.l-=1/60)>0);sparks=sparks.filter(s=>{s.l-=1/60;if(!s.ring){s.x+=s.vx;s.y+=s.vy;s.vy+=.3}return s.l>0});if(shake>0)shake*=.85;if(shake<.3)shake=0;
  if(superF>0){superF--;return}if(hitStop>0){hitStop--;return}
  if(F2.ctrl==='cpu'&&!roundOver&&F2.st!=='intro')ai(F2,F1);else if(F2.ctrl==='cpu')F2.ai.inp={};
  stepF(F1,F2);stepF(F2,F1);pushApart();stepProj();
  const mid=(F1.x+F2.x)/2;camX+=(clamp(mid-W/2,0,SW-W)-camX)*.12;
  if(!roundOver&&F1.st!=='intro'){timer-=1/60;if(F1.hp<=0||F2.hp<=0||timer<=0)endRound()}}
themeMenu();
if(window.__GS_TEST)window.__FR={get F1(){return F1},get F2(){return F2},get state(){return state},startFight,ROSTER,keys,touch,get projs(){return projs},setTheme(i){theme=THEMES[i]},joints,special};
return()=>{ro.disconnect();try{speechSynthesis.cancel()}catch(e){}}}
G.push({id:'rumble',name:'Street Rumble',kind:'game',wide:true,big:true,tint:'#e8321e',blurb:'A Street Fighter-style 2D fighting game with three themes: 1930s rubber-hose cartoon brawlers, caped superheroes, and street crews. 12 animated fighters with specials, supers, combos, juggles and blocking. Vs CPU, arcade ladder or 2 players on one keyboard.',fmt:b=>b+' arcade clears',
art:'<rect width="120" height="72" fill="#3a1a5a"/><rect y="56" width="120" height="16" fill="#2a2438"/><g fill="#0c0818"><rect x="4" y="30" width="18" height="26"/><rect x="26" y="20" width="14" height="36"/><rect x="92" y="26" width="22" height="30"/></g><g stroke="#111" stroke-width="2" stroke-linecap="round"><path d="M38 56l6-14 6 14M44 42v-14M44 32l12-2M44 32l-8 6" stroke="#2a5ad8" stroke-width="5"/><path d="M82 56l-6-14-6 14M76 42v-14M76 32l-10 4M76 32l6 6" stroke="#d8321a" stroke-width="5"/></g><circle cx="44" cy="23" r="5" fill="#f0c8a0" stroke="#111" stroke-width="1.5"/><circle cx="76" cy="23" r="5" fill="#f0b890" stroke="#111" stroke-width="1.5"/><path d="M58 22l4-6 2 5 5-3-2 6 5 1-6 3" fill="#ffd23f" stroke="#111"/>',
run(root,c){return streetRumble(root,c)}});
