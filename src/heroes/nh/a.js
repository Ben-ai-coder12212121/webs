/* ================= NEON HARBOR: open-world crime story ================= */
function neonHarbor(root,c){return with3D(root,c,()=>{
const st3=Stage3D(root,c,{lock:true,dragLook:true,fov:70,far:1100,fireLabel:'FIRE',altLabel:'CAR',jumpLabel:'JUMP'});
const K=bigKit(st3,c,{id:'nh',exposure:1.05});
const{T,V3,PI,rnd,clamp,lerp,pick,lin,angDiff,scene,camera,input,wrap,mat,T_,ctex,Merger,addBox,H,SFX,snd}=K;
const TWO=PI*2;
/* ---------- deterministic random for the city layout ---------- */
const seeded=(s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296})(90210);
const sr=(a,b)=>a+seeded()*(b-a),sp=a=>a[Math.floor(seeded()*a.length)];
/* ---------- layout: 8x8 blocks, road centrelines every 48m ---------- */
const NB=8,P=48,X0=-NB*P/2,RX=i=>X0+i*P,BC=b=>X0+b*P+P/2,EDGE=246;
const coastZ=x=>x<0?214:240;
function district(bx,bz){if(bz>=6&&bx<=3)return'docks';if(bx>=6&&bz<=3)return'suburb';if(bx>=3&&bx<=5&&bz>=2&&bz<=4)return'downtown';if((bx===1&&bz===1)||(bx===6&&bz===6)||(bx===2&&bz===5))return'park';return'mid'}
const blockOf=(x,z)=>[Math.floor((x-X0)/P),Math.floor((z-X0)/P)];
/* ---------- facade textures (8m x 8m tile, lit-window emissive map) ---------- */
const NIGHT=[];
function facade(kind,v){const wins=[];const cols=kind==='glass'?4:kind==='office'?4:2;for(let f=0;f<2;f++)for(let q=0;q<cols;q++){let r;if(kind==='glass')r=[q*64+3,f*128+4,58,120];else if(kind==='office')r=[q*64+9,f*128+30,46,72];else if(kind==='brick')r=[q*128+32,f*128+26,64,82];else r=[q*128+40,f*128+34,48,62];wins.push({r,lit:seeded()<.38,col:sp(['#ffd890','#ffe8b8','#cfe4ff','#ffc070','#fff0d0'])})}
  const base={glass:['#3c5a68','#2e4658','#46606a'],office:['#8e8a84','#a49e92','#74706c'],brick:['#7a3e2e','#8a5a3a','#5e3a30'],plaster:['#d8c8a8','#c8b898','#e2dccc'],dark:['#3a3a42','#44444c','#303038']}[kind][v%3];
  const map=ctex(256,256,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);if(kind==='brick'){for(let r=0;r<32;r++)for(let k=0;k<9;k++){g.fillStyle=`rgba(${seeded()<.5?0:255},${seeded()<.5?0:40},0,${sr(.03,.1)})`;g.fillRect(k*32+(r%2?16:0)-16,r*8,30,6)}}K.speck(g,w,h,2500,60,200,.12);
    if(kind!=='glass'){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,124,w,6);g.fillRect(0,252,w,4)}
    for(const W2 of wins){const[x,y,ww,hh]=W2.r;const gr=g.createLinearGradient(x,y,x+ww,y+hh);gr.addColorStop(0,kind==='glass'?'#7fa8bc':'#5a6a78');gr.addColorStop(.45,kind==='glass'?'#2a4658':'#1e2830');gr.addColorStop(1,kind==='glass'?'#4a7088':'#2e3a44');g.fillStyle=gr;g.fillRect(x,y,ww,hh);g.strokeStyle=kind==='glass'?'#1a2a34':'rgba(230,225,215,.7)';g.lineWidth=kind==='glass'?3:4;g.strokeRect(x,y,ww,hh);if(kind!=='glass'){g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x-3,y+hh,ww+6,4)}}});
  const emi=ctex(256,256,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);for(const W2 of wins){if(!W2.lit)continue;const[x,y,ww,hh]=W2.r;g.fillStyle=W2.col;g.fillRect(x+2,y+2,ww-4,hh-4);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x+2,y+hh*.55,ww-4,hh*.45-2)}});
  const m=new T.MeshStandardMaterial({map,emissiveMap:emi,emissive:new T.Color(1,1,1),emissiveIntensity:0,roughness:kind==='glass'?.25:.8,metalness:kind==='glass'?.5:0});NIGHT.push({m,k:kind==='glass'?1.1:1.3});return m}
const FAC={};['glass','office','brick','plaster','dark'].forEach(k=>{FAC[k]=[0,1,2].map(v=>facade(k,v))});
const shopTex=v=>{const acol=['#c83a3a','#2a7ac8','#2ab86a','#e8a030','#8a3ac8','#2a2a2a'][v];let map;const emi=ctex(256,256,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);g.fillStyle='#ffe0a0';g.fillRect(12,160,150,86);g.fillStyle='#fff0c8';g.fillRect(186,168,54,78)});
  map=ctex(256,256,(g,w,h)=>{g.fillStyle='#2a2826';g.fillRect(0,0,w,h);g.fillStyle=acol;g.fillRect(0,128,w,22);for(let i=0;i<w;i+=16){g.fillStyle='rgba(255,255,255,.25)';g.fillRect(i,128,8,22)}const gr=g.createLinearGradient(0,160,0,246);gr.addColorStop(0,'#6a8898');gr.addColorStop(1,'#1e2a34');g.fillStyle=gr;g.fillRect(12,160,150,86);g.fillStyle='#3a2a1c';g.fillRect(186,168,54,78);g.fillStyle='#888';g.fillRect(230,204,4,8);g.strokeStyle='#bbb';g.lineWidth=3;g.strokeRect(12,160,150,86);g.beginPath();g.moveTo(87,160);g.lineTo(87,246);g.stroke()});
  const m=new T.MeshStandardMaterial({map,emissiveMap:emi,emissive:new T.Color(1,1,1),emissiveIntensity:0,roughness:.6});NIGHT.push({m,k:.9});return m};
const SHOP=[0,1,2,3,4,5].map(shopTex);
const mRoof=mat('roof','#6a6864',{map:'concrete'}),mSide=mat('side','#b8b4ac',{map:'concrete'}),mGrass=mat('grass','#ffffff',{map:'grass'}),mSand=mat('sand','#ffffff',{map:'sand'}),mDirt=mat('dirt','#ffffff',{map:'dirt'}),mWood=mat('wood','#ffffff',{map:'wood'}),mMetal=mat('metal','#9aa0a8',{map:'metal',metalness:.3,roughness:.55}),mDark=mat('dk','#26262a'),mWhite=mat('wt','#e8e6e0'),mRed=mat('rd','#a8302a');
const T2=(k,rx,ry)=>{const t=T_(k).clone();t.needsUpdate=true;t.repeat.set(rx,ry);return t};
/* road textures: vertical (along z) and horizontal (along x), 12m wide tile */
const roadTex=vert=>ctex(256,256,(g,w,h)=>{g.fillStyle='#343538';g.fillRect(0,0,w,h);K.speck(g,w,h,7000,20,90,.35);K.blot(g,w,h,10,['20,20,22','70,70,74'],10,50,.25);const L=(a,b,cw,dash,col)=>{g.fillStyle=col;for(let t=0;t<256;t+=dash?32:256){if(vert)g.fillRect(a,t,cw,dash?18:256);else g.fillRect(t,a,dash?18:256,cw)}};L(125,0,3,0,'#e8c030');L(130,0,3,0,'#e8c030');L(10,0,4,0,'#d8d8d0');L(242,0,4,0,'#d8d8d0');L(66,0,3,1,'rgba(230,230,220,.8)');L(188,0,3,1,'rgba(230,230,220,.8)')});
const mRoadV=new T.MeshStandardMaterial({map:roadTex(1),roughness:.92}),mRoadH=new T.MeshStandardMaterial({map:roadTex(0),roughness:.92});
const mInter=new T.MeshStandardMaterial({roughness:.92,map:ctex(256,256,(g,w,h)=>{g.fillStyle='#343538';g.fillRect(0,0,w,h);K.speck(g,w,h,7000,20,90,.35);g.fillStyle='rgba(235,235,228,.85)';for(let i=24;i<232;i+=22){g.fillRect(i,4,12,26);g.fillRect(i,226,12,26);g.fillRect(4,i,26,12);g.fillRect(226,i,26,12)}})});
const mWater=new T.MeshStandardMaterial({color:lin(0x1a4a66),roughness:.12,metalness:.2,transparent:true,opacity:.92,normalMap:ctex(256,256,(g,w,h)=>{g.fillStyle='rgb(128,128,255)';g.fillRect(0,0,w,h);for(let i=0;i<500;i++){const x=Math.random()*w,y=Math.random()*h,r=rnd(4,16);const gr=g.createRadialGradient(x,y,0,x,y,r);const a=Math.random()*TWO;gr.addColorStop(0,`rgba(${128+Math.cos(a)*60|0},${128+Math.sin(a)*60|0},255,.5)`);gr.addColorStop(1,'rgba(128,128,255,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)}},20,20,true)});
/* ---------- world build ---------- */
const WORLD=new T.Group();scene.add(WORLD);const M=Merger(),MR=Merger();
const inst={};function addI(key,geo,m,mtx,colr){(inst[key]||(inst[key]={geo,m,list:[]})).list.push([mtx.clone(),colr||null])}
const o3=new T.Object3D();const mtxAt=(x,y,z,ry,sx,sy,sz)=>{o3.position.set(x,y,z);o3.rotation.set(0,ry||0,0);o3.scale.set(sx||1,sy||sx||1,sz||sx||1);o3.updateMatrix();return o3.matrix};
const G_={trunk:(()=>{const g=new T.CylinderGeometry(.14,.22,3,6);g.translate(0,1.5,0);return g})(),crown:(()=>{const g=new T.IcosahedronGeometry(1.7,1);g.translate(0,4,0);return g})(),palmT:(()=>{const g=new T.CylinderGeometry(.13,.2,7,6);g.translate(0,3.5,0);return g})(),palmL:(()=>{const g=new T.BoxGeometry(.5,.05,2.6);g.translate(0,0,1.3);g.rotateX(.35);g.translate(0,7,0);return g})(),
  pole:(()=>{const g=new T.CylinderGeometry(.08,.11,6.5,6);g.translate(0,3.25,0);return g})(),arm:(()=>{const g=new T.BoxGeometry(.1,.1,1.6);g.translate(0,6.4,.75);return g})(),lamp:(()=>{const g=new T.BoxGeometry(.4,.14,.6);g.translate(0,6.32,1.45);return g})(),
  hyd:(()=>{const g=new T.CylinderGeometry(.14,.16,.7,8);g.translate(0,.35,0);return g})(),bin:(()=>{const g=new T.CylinderGeometry(.3,.26,.9,10);g.translate(0,.45,0);return g})(),bench:(()=>{const g=new T.BoxGeometry(1.8,.1,.5);g.translate(0,.45,0);return g})(),
  cont:new T.BoxGeometry(2.44,2.6,6.06),bollard:(()=>{const g=new T.CylinderGeometry(.18,.22,.6,8);g.translate(0,.3,0);return g})(),hedge:new T.BoxGeometry(1,1,1)};
const mLeaf=new T.MeshStandardMaterial({color:0xffffff,roughness:.9,flatShading:true}),mBark=mat('bark','#ffffff',{map:'bark'}),mPole=mat('pole','#3a3c40',{metalness:.5,roughness:.5}),mLamp=new T.MeshStandardMaterial({color:0xfff0c0,emissive:lin(0xffd890),emissiveIntensity:0});NIGHT.push({m:mLamp,k:2});
const mCont=new T.MeshStandardMaterial({color:0xffffff,roughness:.6,metalness:.3,map:ctex(128,128,(g,w,h)=>{g.fillStyle='#ccc';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=8){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x,0,3,h)}g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=4;g.strokeRect(0,0,w,h)})});
function tree(x,z,s){addI('trunk',G_.trunk,mBark,mtxAt(x,0,z,rnd(0,6),s||1));addI('crown',G_.crown,mLeaf,mtxAt(x,0,z,rnd(0,6),(s||1)*sr(.85,1.2)),new T.Color().setHSL(sr(.22,.33),sr(.35,.55),sr(.18,.3)).convertSRGBToLinear());addBox(x-.3,0,z-.3,x+.3,4,z+.3,'tree')}
function palm(x,z){const ry=sr(0,6);addI('palmT',G_.palmT,mBark,mtxAt(x,0,z,ry));for(let i=0;i<7;i++)addI('palmL',G_.palmL,mLeaf,mtxAt(x,0,z,ry+i*.9),new T.Color().setHSL(sr(.24,.3),.5,sr(.2,.28)).convertSRGBToLinear());addBox(x-.25,0,z-.25,x+.25,5,z+.25,'tree')}
const LAMPS=[];function lamp(x,z,ry){addI('pole',G_.pole,mPole,mtxAt(x,0,z,ry));addI('arm',G_.arm,mPole,mtxAt(x,0,z,ry));addI('lamp',G_.lamp,mLamp,mtxAt(x,0,z,ry));LAMPS.push([x+Math.sin(ry)*1.45,z+Math.cos(ry)*1.45])}
function signTex(txt,fg,bg,font){return ctex(512,128,(g,w,h)=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.strokeStyle=fg;g.lineWidth=7;g.strokeRect(8,8,w-16,h-16);g.fillStyle=fg;g.font=font||'900 60px "Arial Black",Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';let fs=60;while(g.measureText(txt).width>w-50&&fs>20){fs-=4;g.font=`900 ${fs}px "Arial Black",Impact,sans-serif`}g.fillText(txt,w/2,h/2+3)})}
function sign(txt,fg,bg,x,y,z,ry,wd,glow){const t=signTex(txt,fg,bg);const fm=new T.MeshStandardMaterial({map:t,emissiveMap:t,emissive:new T.Color(1,1,1),emissiveIntensity:glow?.5:.1,roughness:.5});NIGHT.push({m:fm,k:glow?1.4:.9,base:glow?.5:.1});const m=new T.Mesh(new T.BoxGeometry(wd||8,(wd||8)/4,.25),[mDark,mDark,mDark,mDark,fm,mDark]);m.position.set(x,y,z);m.rotation.y=ry||0;WORLD.add(m);return m}
const NEONC=[0xff2a8a,0x2af0ff,0xffe02a,0x8a2aff,0x2aff8a,0xff6a2a];const neonMats=NEONC.map(cc=>{const m=new T.MeshStandardMaterial({color:lin(cc),emissive:lin(cc),emissiveIntensity:.6,roughness:.4});NIGHT.push({m,k:2.4,base:.6});return m});
/* face: which road a lot edge faces. returns rotation so +z of a sign faces the road */
const faceRot={s:0,n:PI,e:PI/2,w:-PI/2};
function building(x0,z0,x1,z1,h,fm,o){o=o||{};const y0=.15;
  if(o.shop){M.box(x0-.25,y0,z0-.25,x1+.25,4.2,z1+.25,o.shop,8);M.box(x0-.5,4.2,z0-.5,x1+.5,4.5,z1+.5,mRoof,4)}
  M.box(x0,o.shop?4.5:y0,z0,x1,h,z1,fm,8);M.box(x0-.25,h,z0-.25,x1+.25,h+.7,z1+.25,mRoof,4);M.box(x0+.3,h+.7,z0+.3,x1-.3,h+.75,z1-.3,mDark,4);
  addBox(x0-(o.shop?.3:0),0,z0-(o.shop?.3:0),x1+(o.shop?.3:0),h+.7,z1+(o.shop?.3:0),'bld');
  // rooftop clutter
  const n=Math.floor((x1-x0)*(z1-z0)/80);for(let i=0;i<Math.min(4,n);i++){const w=sr(1.5,3.5),d=sr(1.5,3.5),x=sr(x0+1,x1-1-w),z=sr(z0+1,z1-1-d);M.box(x,h+.7,z,x+w,h+.7+sr(1,2.4),z+d,sp([mMetal,mRoof,mWhite]),2)}
  if(o.neon&&o.face){const f=o.face,y=sr(5.5,Math.min(h-2,14));let x,z;if(f==='s'||f==='n'){z=f==='s'?z1+.35:z0-.35;x=sr(x0+2,x1-2);M.box(x-.12,y,z-.12,x+.12,y+sr(3,6),z+.12,sp(neonMats),1)}else{x=f==='e'?x1+.35:x0-.35;z=sr(z0+2,z1-2);M.box(x-.12,y,z-.12,x+.12,y+sr(3,6),z+.12,sp(neonMats),1)}
    // horizontal neon band
    if(seeded()<.6){const yb=4.6;if(f==='s'||f==='n'){const zz=f==='s'?z1+.3:z0-.3;M.box(x0+1,yb,zz-.05,x1-1,yb+.14,zz+.05,sp(neonMats),1)}else{const xx=f==='e'?x1+.3:x0-.3;M.box(xx-.05,yb,z0+1,xx+.05,yb+.14,z1-1,sp(neonMats),1)}}}}
function tower(x0,z0,x1,z1,h,fm){building(x0,z0,x1,z1,h,fm,{shop:SHOP[5]});let cx0=x0,cz0=z0,cx1=x1,cz1=z1,y=h+.7;const tiers=Math.floor(sr(1,3));for(let t=0;t<tiers;t++){const ins=sr(2,4);cx0+=ins;cz0+=ins;cx1-=ins;cz1-=ins;if(cx1-cx0<6||cz1-cz0<6)break;const hh=sr(8,26);M.box(cx0,y,cz0,cx1,y+hh,cz1,fm,8);M.box(cx0-.2,y+hh,cz0-.2,cx1+.2,y+hh+.6,cz1+.2,mRoof,4);y+=hh+.6}
  if(seeded()<.6){const cx=(cx0+cx1)/2,cz=(cz0+cz1)/2;M.box(cx-.15,y,cz-.15,cx+.15,y+sr(8,16),cz+.15,mMetal,1)}}
function house(x0,z0,x1,z1,face){const h=sr(5,7.5),fm=sp(FAC.plaster);M.box(x0,.15,z0,x1,h,z1,fm,8);addBox(x0,0,z0,x1,h,z1,'bld');const w=x1-x0,d=z1-z0;const rg=new T.ConeGeometry(Math.hypot(w,d)/2+.6,sr(2.4,3.4),4);rg.rotateY(PI/4);const r=new T.Mesh(rg,mat('hroof',sp(['#6a3a2a','#3a3a44','#5a4a3a','#7a4a3a']),{map:'roof'}));r.scale.set(w/Math.hypot(w,d)*1.414,1,d/Math.hypot(w,d)*1.414);r.position.set((x0+x1)/2,h+r.geometry.parameters.height/2,(z0+z1)/2);r.castShadow=true;WORLD.add(r);
  // door + garage facing the road
  const dm=mat('door','#5a3a22');if(face==='s'||face==='n'){const z=face==='s'?z1+.05:z0-.05;M.box(x0+1.5,.15,z-.05,x0+2.6,2.4,z+.05,dm,1);M.box(x1-4,.15,z-.05,x1-1,2.6,z+.05,mWhite,1)}else{const x=face==='e'?x1+.05:x0-.05;M.box(x-.05,.15,z0+1.5,x+.05,2.4,z0+2.6,dm,1);M.box(x-.05,.15,z1-4,x+.05,2.6,z1-1,mWhite,1)}}
function grassPatch(x0,z0,x1,z1){M.box(x0,.15,z0,x1,.18,z1,mGrass,6)}
function hedge(x0,z0,x1,z1){M.box(x0,.15,z0,x1,1.2,z1,mLeaf2,2);addBox(x0,0,z0,x1,1.2,z1,'soft')}
const mLeaf2=mat('hedge','#3a6a2a',{map:'leaves'});
/* special places, filled in by builders */
const PL={};
function edgePt(bx,bz,side,off){off=off||0;if(side==='s')return new V3(BC(bx)+off,.15,RX(bz+1)-7.4);if(side==='n')return new V3(BC(bx)+off,.15,RX(bz)+7.4);if(side==='e')return new V3(RX(bx+1)-7.4,.15,BC(bz)+off);return new V3(RX(bx)+7.4,.15,BC(bz)+off)}
function roadPt(bx,bz,side,off,lane){const p=edgePt(bx,bz,side,off);const L=lane==null?3:lane;if(side==='s')p.z=RX(bz+1)-L;else if(side==='n')p.z=RX(bz)+L;else if(side==='e')p.x=RX(bx+1)-L;else p.x=RX(bx)+L;p.y=0;return p}
function specialBld(bx,bz,side,label,fg,bg,h,fm,o){o=o||{};const x0=RX(bx)+9,x1=RX(bx+1)-9,z0=RX(bz)+9,z1=RX(bz+1)-9;
  let bx0=x0,bx1=x1,bz0=z0,bz1=z1;if(o.inset){bx0+=o.inset;bx1-=o.inset;bz0+=o.inset;bz1-=o.inset}
  if(o.front){if(side==='s')bz0=bz1-o.front;else if(side==='n')bz1=bz0+o.front;else if(side==='e')bx0=bx1-o.front;else bx1=bx0+o.front}
  building(bx0,bz0,bx1,bz1,h,fm,{shop:o.shop,neon:o.neon,face:side});
  const cx=(bx0+bx1)/2,cz=(bz0+bz1)/2,sy=o.shop?5.6:Math.min(h-1.5,5);let s;
  if(side==='s')s=sign(label,fg,bg,cx,sy,bz1+.5,0,o.sw||10,true);else if(side==='n')s=sign(label,fg,bg,cx,sy,bz0-.5,PI,o.sw||10,true);else if(side==='e')s=sign(label,fg,bg,bx1+.5,sy,cz,PI/2,o.sw||10,true);else s=sign(label,fg,bg,bx0-.5,sy,cz,-PI/2,o.sw||10,true);
  return{x0:bx0,z0:bz0,x1:bx1,z1:bz1,sign:s}}
const SPEC={
  '1,3':()=>{const b=specialBld(1,3,'s',"TONY'S GARAGE",'#ffd23f','#1a1a1a',7,FAC.dark[0],{front:14,sw:12});PL.garage={pos:edgePt(1,3,'s',-4),name:"Tony's Garage",col:'#ffd23f',icon:'T',car:roadPt(1,3,'s',6,4.6)};const x0=RX(1)+9;grassPatch(x0,RX(3)+9,x0+30,b.z0-.5);tree(x0+5,RX(3)+14);tree(x0+22,RX(3)+16)},
  '4,5':()=>{specialBld(4,5,'n','EL DINER','#ff4a8a','#101820',6,FAC.plaster[1],{front:16,shop:SHOP[0],neon:1,sw:10});PL.diner={pos:edgePt(4,5,'n',0),name:'El Diner',col:'#ff4a8a'};const x0=RX(4)+9,z0=RX(5)+25;building(x0,z0,x0+30,z0+14,18,FAC.brick[2],{shop:SHOP[3],neon:1,face:'s'})},
  '2,4':()=>{specialBld(2,4,'e','AMMO DEPOT','#ff3a2a','#1a1a1a',8,FAC.brick[0],{front:14,sw:9});PL.guns={pos:edgePt(2,4,'e',0),name:'Ammo Depot',col:'#ff5a3a',icon:'$'};building(RX(2)+9,RX(4)+9,RX(2)+22,RX(5)-9,12,FAC.office[1],{shop:SHOP[2],neon:1,face:'w'})},
  '5,1':()=>{specialBld(5,1,'w','SPRAY SHACK','#2af0ff','#0a1a2a',7,FAC.dark[1],{front:14,sw:9});PL.spray={pos:edgePt(5,1,'w',0),name:'Spray Shack',col:'#2af0ff',icon:'S'};building(RX(5)+25,RX(1)+9,RX(6)-9,RX(2)-9,16,FAC.office[2],{shop:SHOP[4],neon:1,face:'e'})},
  '3,1':()=>{const b=specialBld(3,1,'s','HARBOR GENERAL','#e8302a','#ffffff',22,FAC.office[0],{front:22,sw:14});PL.hospital={pos:edgePt(3,1,'s',0),name:'Hospital',col:'#ff6a6a',icon:'+'};M.box(RX(3)+14,22.7,b.z0+4,RX(3)+18,22.8,b.z0+8,mRed,1)},
  '4,2':()=>{specialBld(4,2,'w','POLICE','#ffffff','#1a3a8a',16,FAC.office[1],{front:20,sw:9});PL.police={pos:edgePt(4,2,'w',0),name:'Police HQ',col:'#4a8aff',icon:'P'};building(RX(4)+31,RX(2)+9,RX(5)-9,RX(3)-9,40,FAC.glass[2],{shop:SHOP[5]})},
  '4,3':()=>{specialBld(4,3,'s','HARBOR BANK','#e8c86a','#1a1a18',34,FAC.glass[0],{inset:0,sw:14});PL.bank={pos:edgePt(4,3,'s',0),name:'Harbor Bank',col:'#e8c86a'}},
  '7,2':()=>{const x0=RX(7)+9,z0=RX(2)+9;grassPatch(x0,z0,x0+30,z0+30);house(x0+4,z0+16,x0+18,z0+27,'s');PL.safe={pos:edgePt(7,2,'s',-8),name:'Safehouse',col:'#6aff6a',icon:'H'};house(x0+19,z0+3,x0+28,z0+12,'e');tree(x0+24,z0+22);tree(x0+3,z0+4)},
  '6,5':()=>{const x0=RX(6)+9,z0=RX(5)+9,x1=x0+30,z1=z0+30;M.box(x0,.15,z0,x1,.2,z1,mat('court','#4a4a58',{map:'asphalt'}),4);
    const wall=(a,b,cc,d)=>{M.box(a,.15,b,cc,2.2,d,sp(FAC.brick),4);addBox(a,0,b,cc,2.2,d,'bld')};wall(x0,z0,x1,z0+.5);wall(x0,z0,x0+.5,z1);wall(x1-.5,z0,x1,z1);wall(x0,z1-.5,x0+11,z1);wall(x1-11,z1-.5,x1,z1);
    building(x0+1,z0+1,x0+12,z0+10,6,FAC.brick[1],{});sign('RED KINGS','#ff2a2a','#140808',x0+6.5,4,z0+10.5,0,7,true);
    for(let i=0;i<5;i++){const x=sr(x0+14,x1-3),z=sr(z0+3,z1-6);M.box(x-.6,.2,z-.6,x+.6,1.4,z+.6,mWood,1.2);addBox(x-.6,0,z-.6,x+.6,1.4,z+.6,'cover')}
    M.box(x0+20,.2,z0+14,x0+20.2,3.5,z0+14.2,mPole,1);M.box(x0+18.8,3.2,z0+13.4,x0+20.2,4.2,z0+13.6,mWhite,1);PL.kings={pos:new V3((x0+x1)/2,.2,z1-2),c:new V3((x0+x1)/2,.2,(z0+z1)/2),x0,z0,x1,z1}},
  '2,6':()=>{const x0=RX(2)+9,z0=RX(6)+9,x1=x0+30,z1=z0+30,h=9;M.box(RX(2)+6,0,RX(6)+6,RX(3)-6,.16,RX(7)-6,mat('quay','#9a968e',{map:'concrete'}),4);
    const W2=(a,b,cc,d)=>{M.box(a,.15,b,cc,h,d,mMetal,6);addBox(a,0,b,cc,h,d,'bld')};W2(x0,z0,x1,z0+.5);W2(x0,z0,x0+.5,z0+18);W2(x1-.5,z0,x1,z0+18);W2(x0,z0+17.5,x0+11,z0+18);W2(x1-11,z0+17.5,x1,z0+18);
    M.box(x0-.3,h,z0-.3,x1+.3,h+.5,z0+18.3,mRoof,4);addBox(x0,h,z0,x1,h+.5,z0+18,'bld');sign('KINGS FREIGHT','#ff3a2a','#1a1a1a',(x0+x1)/2,h-1.2,z0+18.3,0,10,true);
    const crate=(x,z,w,d,hh)=>{M.box(x-w/2,.15,z-d/2,x+w/2,hh,z+d/2,mWood,1.2);addBox(x-w/2,0,z-d/2,x+w/2,hh,z+d/2,'cover')};crate(x0+6,z0+5,2.4,2.4,1.6);crate(x0+13,z0+9,1.4,5,1.4);crate(x0+22,z0+5,3,2,2.2);crate(x0+25,z0+12,2,2,1.4);crate(x0+8,z0+13,2,2,1.4);crate(x0+18,z0+14,1.2,1.2,1.2);
    for(const[x,z]of[[x0+3,z1-8],[x1-6,z1-10],[x0+14,z1-4]]){addI('cont',G_.cont,mCont,mtxAt(x+1.22,1.45,z+3,0),new T.Color(sp([0xc83a2a,0x2a6ac8,0x2a9a5a])).convertSRGBToLinear());addBox(x,0,z,x+2.44,2.75,z+6.06,'bld')}
    PL.wh={c:new V3((x0+x1)/2,.16,z0+9),door:new V3((x0+x1)/2,.16,z0+21),yard:new V3((x0+x1)/2,.16,z1-5),x0,z0,x1,z1}},
  '0,4':()=>{const x0=RX(0)+9,z0=RX(4)+9;building(x0,z0,x0+30,z0+12,14,FAC.brick[2],{shop:SHOP[1],neon:1,face:'n'});M.box(x0,.15,z0+14,x0+30,.2,z0+30,mat('lot','#3a3a40',{map:'asphalt'}),4);for(let i=0;i<5;i++)M.box(x0+2+i*6,.2,z0+20,x0+2.15+i*6,.21,z0+28,mWhite,1);PL.bus={pos:edgePt(0,4,'e',6),name:'Bus Depot'}}};
/* ---------- ground, roads, blocks ---------- */
(function build(){
  // island + water
  const water=new T.Mesh(new T.PlaneGeometry(4000,4000),mWater);water.rotation.x=-PI/2;water.position.y=-.8;water.receiveShadow=true;scene.add(water);K.water=water;
  M.box(-EDGE,-1,-EDGE,EDGE,0,214,mSand,6);M.box(0,-1,214,EDGE,0,240,mSand,6);M.box(-204,0,-204,204,.01,204,mGrass,6);M.box(-EDGE,-1,196,0,.02,214,mat('quay','#9a968e',{map:'concrete'}),4);
  // sea walls (low visible wall, tall invisible collider)
  const sea=(x0,z0,x1,z1)=>{M.box(x0,0,z0,x1,.9,z1,mat('seaw','#8a8680',{map:'concrete'}),3);addBox(x0,-2,z0,x1,6,z1,'bld')};
  sea(-EDGE-1,-EDGE-1,EDGE+1,-EDGE);sea(-EDGE-1,-EDGE,-EDGE,214);sea(EDGE,-EDGE,EDGE+1,240);sea(-EDGE,214,-70,214.6);sea(-60,214,0,214.6);sea(0,214,.6,240);sea(0,240,EDGE+1,240.6);
  // pier + ship
  M.box(-70,-1,214,-60,.4,262,mWood,3);addBox(-70,-1,214,-60,.4,262,'pier');
  const rail=(x0,z0,x1,z1)=>{M.box(x0,.4,z0,x1,1.4,z1,mWood,2);addBox(x0,-1,z0,x1,6,z1,'bld')};rail(-70.3,214.6,-70,236);rail(-70.3,244,-70,262);rail(-60,214.6,-59.7,262);rail(-70.3,262,-59.7,262.3);
  const hullM=mat('hull','#2a3a4a',{map:'metal',metalness:.4,roughness:.5});M.box(-100,-3,222,-76,4,290,hullM,4);M.box(-100,4,222,-76,4.05,290,mat('deck','#6a5a4a',{map:'wood'}),3);addBox(-100,-3,222,-76,4,290,'ship');
  M.box(-100,4,222,-99.6,5,290,mRed,2);M.box(-76.4,4,222,-76,5,236,mRed,2);M.box(-76.4,4,244,-76,5,290,mRed,2);M.box(-100,4,289.6,-76,5,290,mRed,2);M.box(-100,4,222,-76,5,222.4,mRed,2);[[-100,222,-99.6,290],[-76.4,222,-76,236],[-76.4,244,-76,290],[-100,289.6,-76,290],[-100,222,-76,222.4]].forEach(r=>addBox(r[0],4,r[1],r[2],7,r[3],'bld'));
  M.box(-97,4,278,-79,14,288,mWhite,4);addBox(-97,4,278,-79,14,288,'bld');M.box(-96,14,279,-80,17,287,mWhite,4);M.box(-90,17,282,-86,24,284,mRed,2);
  for(let i=0;i<9;i++){const x0=-70-i*.667;M.box(x0-.667,.4,238,x0,.4+(i+1)*.4,242,mMetal,1);addBox(x0-.667,-1,238,x0,.4+(i+1)*.4,242,'step')}
  for(let r=0;r<3;r++)for(let k=0;k<3;k++){const x=-97+k*6,z=232+r*14;const hh=1+Math.floor(seeded()*2);for(let s=0;s<hh;s++)addI('cont',G_.cont,mCont,mtxAt(x+1.22,4+s*2.6+1.3,z+3,0),new T.Color(sp([0xc83a2a,0x2a6ac8,0x2a9a5a,0xe8a02a,0x8a8a8a])).convertSRGBToLinear());addBox(x,4,z,x+2.44,4+hh*2.6,z+6.06,'bld')}
  PL.ship={deck:new V3(-88,4,250),bomb:new V3(-82,4.05,268),gang:new V3(-65,.4,240)};
  // roads
  for(let i=0;i<=NB;i++)for(let j=0;j<NB;j++){const x=RX(i);M.box(x-6,0,RX(j)+6,x+6,.03,RX(j+1)-6,mRoadV,12);const z=RX(i);MR.box(RX(j)+6,0,z-6,RX(j+1)-6,.03,z+6,mRoadH,12)}
  for(let i=0;i<=NB;i++)for(let j=0;j<=NB;j++)M.box(RX(i)-6,0,RX(j)-6,RX(i)+6,.031,RX(j)+6,mInter,12);
  // blocks
  for(let bx=0;bx<NB;bx++)for(let bz=0;bz<NB;bz++){const x0=RX(bx)+6,x1=RX(bx+1)-6,z0=RX(bz)+6,z1=RX(bz+1)-6;M.box(x0,0,z0,x1,.15,z1,mSide,3);
    const d=district(bx,bz);const lx0=x0+3,lx1=x1-3,lz0=z0+3,lz1=z1-3;
    // lamps & street furniture around the block
    for(const[t,ax]of[[0,'s'],[1,'n'],[2,'e'],[3,'w']]){for(let k=0;k<2;k++){const off=(k?1:-1)*11;if(ax==='s')lamp(BC(bx)+off,z1-.6,0);else if(ax==='n')lamp(BC(bx)+off,z0+.6,PI);else if(ax==='e')lamp(x1-.6,BC(bz)+off,PI/2);else lamp(x0+.6,BC(bz)+off,-PI/2)}if(t===0&&d!=='suburb'&&seeded()<.5)addI('hyd',G_.hyd,mRed,mtxAt(x0+4,.15,z1-.8));if(t===1&&seeded()<.5)addI('bin',G_.bin,mat('bin','#2a5a3a'),mtxAt(x1-4,.15,z0+.8))}
    const spc=SPEC[bx+','+bz];if(spc){spc();continue}
    if(d==='mid'||d==='downtown'){if(d==='mid'){for(let k=-1;k<=1;k+=2){tree(BC(bx)+k*4,z1-1.3,.8);tree(BC(bx)+k*4,z0+1.3,.8)}}
      if(d==='downtown'){const two=seeded()<.5;if(two){tower(lx0,lz0,lx1,(lz0+lz1)/2-.5,sr(40,95),sp(FAC.glass));tower(lx0,(lz0+lz1)/2+.5,lx1,lz1,sr(30,70),sp([...FAC.glass,...FAC.office]))}else tower(lx0,lz0,lx1,lz1,sr(50,120),sp([...FAC.glass,FAC.office[0]]))}
      else{const nx=seeded()<.5?2:3,nz=2;const fz=(lz1-lz0)/nz,fx=(lx1-lx0)/nx;for(let a=0;a<nx;a++)for(let b=0;b<nz;b++){const x=lx0+a*fx,z=lz0+b*fz;if(seeded()<.12){M.box(x,.15,z,x+fx,.2,z+fz,mat('lot','#3a3a40',{map:'asphalt'}),4);continue}const fc=b===nz-1?'s':'n';building(x,z,x+fx,z+fz,sr(8,30),sp([...FAC.brick,...FAC.office,FAC.dark[0],FAC.dark[2]]),{shop:sp(SHOP),neon:seeded()<.55,face:fc})}}}
    else if(d==='suburb'){grassPatch(lx0,lz0,lx1,lz1);for(let a=0;a<2;a++)for(let b=0;b<2;b++){const x=lx0+a*15,z=lz0+b*15,fc=b?'s':'n';house(x+3,z+(b?4:2),x+12,z+(b?12:10),fc);if(seeded()<.7)tree(x+sr(2,13),z+(b?1.5:13.5),sr(.8,1.2))}}
    else if(d==='park'){grassPatch(lx0,lz0,lx1,lz1);M.box(lx0,.15,(lz0+lz1)/2-1.5,lx1,.19,(lz0+lz1)/2+1.5,mSide,3);M.box((lx0+lx1)/2-1.5,.15,lz0,(lx0+lx1)/2+1.5,.19,lz1,mSide,3);const cx=(lx0+lx1)/2,cz=(lz0+lz1)/2;const f=new T.Mesh(new T.CylinderGeometry(4,4.3,.7,24),mSide);f.position.set(cx,.5,cz);WORLD.add(f);const fw=new T.Mesh(new T.CylinderGeometry(3.6,3.6,.1,24),mWater);fw.position.set(cx,.82,cz);WORLD.add(fw);addBox(cx-3.5,0,cz-3.5,cx+3.5,.85,cz+3.5,'soft');
      for(let i=0;i<14;i++){let x=sr(lx0+2,lx1-2),z=sr(lz0+2,lz1-2);if(Math.abs(x-cx)<3||Math.abs(z-cz)<3)continue;tree(x,z,sr(.8,1.4))}for(let i=0;i<4;i++)addI('bench',G_.bench,mWood,mtxAt(cx+(i<2?-8:8),.15,cz+(i%2?3:-3),PI/2))}
    else if(d==='docks'){M.box(x0,0,z0,x1,.16,z1,mat('quay','#9a968e',{map:'concrete'}),4);if(seeded()<.55){const h=sr(8,11);M.box(lx0,.15,lz0,lx1,h,lz0+16,mMetal,6);M.box(lx0-.3,h,lz0-.3,lx1+.3,h+.4,lz0+16.3,mRoof,4);addBox(lx0,0,lz0,lx1,h+.4,lz0+16,'bld');M.box(BC(bx)-4,.15,lz0+15.95,BC(bx)+4,5,lz0+16.05,mat('shut','#6a6a60'),1)}
      for(let r=0;r<2;r++)for(let k=0;k<4;k++){if(seeded()<.3)continue;const x=lx0+1+k*7,z=lz1-7-r*7;const hh=1+Math.floor(seeded()*3);for(let s=0;s<hh;s++)addI('cont',G_.cont,mCont,mtxAt(x+1.22,.15+s*2.6+1.3,z+3,0),new T.Color(sp([0xc83a2a,0x2a6ac8,0x2a9a5a,0xe8a02a,0x8a8a8a,0xd8d8d0])).convertSRGBToLinear());addBox(x,0,z,x+2.44,.15+hh*2.6,z+6.06,'bld')}}}
  // docks quay: cranes + bollards
  for(let i=0;i<3;i++){const x=-180+i*55;const cm=mat('crane','#e8a020',{metalness:.3,roughness:.6});[[-4,-4],[4,-4],[-4,4],[4,4]].forEach(([dx,dz])=>{M.box(x+dx-.4,0,206+dz-.4,x+dx+.4,26,206+dz+.4,cm,2);addBox(x+dx-.4,0,206+dz-.4,x+dx+.4,26,206+dz+.4,'bld')});M.box(x-5,26,196,x+5,29,232,cm,2);M.box(x-2,29,200,x+2,32,206,mWhite,2)}
  for(let x=-240;x<-2;x+=10)addI('bollard',G_.bollard,mDark,mtxAt(x,.02,213));
  // beach: palms
  for(let i=0;i<60;i++){let x,z;const s=Math.floor(seeded()*4);if(s===0){x=sr(4,240);z=sr(206,236)}else if(s===1){x=sr(-240,240);z=sr(-240,-208)}else if(s===2){x=sr(208,240);z=sr(-240,236)}else{x=sr(-240,-208);z=sr(-240,196)}palm(x,z)}
  // beach huts + lifeguard tower
  M.box(120,0,222,124,4,226,mWhite,2);M.box(119.5,4,221.5,124.5,4.3,226.5,mRed,2);addBox(120,0,222,124,4,226,'bld');
  M.build(WORLD);MR.build(WORLD);
  for(const k in inst){const I=inst[k];const im=new T.InstancedMesh(I.geo,I.m,I.list.length);I.list.forEach(([m,cl],i)=>{im.setMatrixAt(i,m);if(cl)im.setColorAt(i,cl)});if(im.instanceColor)im.instanceColor.needsUpdate=true;im.castShadow=k!=='lamp'&&k!=='bollard';im.receiveShadow=true;WORLD.add(im)}
})();
/* ---------- road graph: intersections (i,j) 0..8 ---------- */
const NODE=(i,j)=>new V3(RX(i),0,RX(j));
const inCity=(i,j)=>i>=0&&j>=0&&i<=NB&&j<=NB;
function nearestNode(x,z){return[clamp(Math.round((x-X0)/P),0,NB),clamp(Math.round((z-X0)/P),0,NB)]}
function routeNodes(a,b){const key=(i,j)=>i*20+j;const prev=new Map(),q=[a];prev.set(key(...a),null);while(q.length){const cur=q.shift();if(cur[0]===b[0]&&cur[1]===b[1])break;for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const n=[cur[0]+dx,cur[1]+dz];if(!inCity(...n)||prev.has(key(...n)))continue;prev.set(key(...n),cur);q.push(n)}}const out=[];let c2=b;while(c2){out.unshift(c2);c2=prev.get(key(...c2))}return out}
/* ---------- minimap base ---------- */
const MAPW=1024,MSC=MAPW/520;const mapX=x=>(x+260)*MSC,mapZ=z=>(z+260)*MSC;
const MAPC=document.createElement('canvas');MAPC.width=MAPC.height=MAPW;(()=>{const g=MAPC.getContext('2d');g.fillStyle='#1a4a66';g.fillRect(0,0,MAPW,MAPW);g.fillStyle='#d8c090';g.fillRect(mapX(-EDGE),mapZ(-EDGE),2*EDGE*MSC,(214+EDGE)*MSC);g.fillRect(mapX(0),mapZ(214),EDGE*MSC,26*MSC);g.fillStyle='#9a968e';g.fillRect(mapX(-EDGE),mapZ(196),EDGE*MSC,18*MSC);g.fillStyle='#8a6a4a';g.fillRect(mapX(-70),mapZ(214),10*MSC,48*MSC);g.fillStyle='#4a5a6a';g.fillRect(mapX(-100),mapZ(222),24*MSC,68*MSC);
  g.fillStyle='#5a7a44';g.fillRect(mapX(-204),mapZ(-204),408*MSC,408*MSC);
  for(let bx=0;bx<NB;bx++)for(let bz=0;bz<NB;bz++){const d=district(bx,bz);g.fillStyle={mid:'#8a8680',downtown:'#6a6e7a',suburb:'#7a9a5a',park:'#4a8a3a',docks:'#8a8a82'}[d];g.fillRect(mapX(RX(bx)+6),mapZ(RX(bz)+6),36*MSC,36*MSC)}
  g.fillStyle='#2a2a2e';for(let i=0;i<=NB;i++){g.fillRect(mapX(RX(i)-6),mapZ(RX(0)-6),12*MSC,(NB*P+12)*MSC);g.fillRect(mapX(RX(0)-6),mapZ(RX(i)-6),(NB*P+12)*MSC,12*MSC)}
  g.fillStyle='rgba(0,0,0,.22)';K.W.boxes.forEach(b=>{if(b.tag==='bld'&&b.y1>3)g.fillRect(mapX(b.x0),mapZ(b.z0),(b.x1-b.x0)*MSC,(b.z1-b.z0)*MSC)});
  g.font='bold 22px system-ui';g.fillStyle='rgba(255,255,255,.55)';g.textAlign='center';[['DOWNTOWN',BC(4),BC(3)],['THE DOCKS',BC(1.5),BC(6.5)],['PALM HEIGHTS',BC(6.5),BC(1.5)],['OLD TOWN',BC(1),BC(2)],['KINGS ROW',BC(6.5),BC(5.2)],['HARBOR BEACH',120,228]].forEach(([t,x,z])=>g.fillText(t,mapX(x),mapZ(z)))})();
/* ---------- sky, sun, time of day ---------- */
const sky=K.skyDome({top:0x3a6ab8,hor:0xcfe0f0,bot:0x8a8a80});const LT=K.sunLight({size:45,int:2,hemi:.7,map:2048});
scene.fog=new T.Fog(lin(0xcfe0f0),120,700);
const SKY=[[0,0x060a1c,0x1e2a48,.3,.24],[5,0x1a2040,0x7a5a6a,.4,.36],[6.5,0x4a6ab0,0xf0a070,.9,.6],[9,0x3a6ab8,0xcfe0f0,2,.75],[16,0x3a6ab8,0xd8e4f0,2,.75],[18.5,0x3a4a90,0xff9a50,1,.6],[20,0x151a40,0x6a3a5a,.45,.38],[22,0x060a1c,0x1e2a48,.3,.24],[24,0x060a1c,0x1e2a48,.3,.24]];
const cA=new T.Color(),cB=new T.Color();let night=0;
function setTime(h){let i=0;while(i<SKY.length-2&&SKY[i+1][0]<=h)i++;const a=SKY[i],b=SKY[i+1],t=clamp((h-a[0])/(b[0]-a[0]),0,1);const U=sky.userData.U;U.top.value.copy(cA.set(a[1]).lerp(cB.set(b[1]),t)).convertSRGBToLinear();U.hor.value.copy(cA.set(a[2]).lerp(cB.set(b[2]),t)).convertSRGBToLinear();U.bot.value.copy(U.hor.value).multiplyScalar(.5);scene.fog.color.copy(U.hor.value);
  const sa=(h-6)/12*PI;const sunUp=Math.sin(sa);LT.dir.set(Math.cos(sa)*.8,Math.max(.25,Math.abs(sunUp)),.35).normalize();U.sunD.value.set(Math.cos(sa),sunUp,.35).normalize();U.stars.value=clamp(-sunUp*3,0,1);U.moon.value=sunUp<0?1:0;
  LT.sun.intensity=lerp(a[3],b[3],t);LT.sun.color.set(sunUp>0?(sunUp<.3?0xffc890:0xfff2dc):0x8aa0d0).convertSRGBToLinear();LT.hemi.intensity=lerp(a[4],b[4],t);
  night=clamp((.15-sunUp)*3,0,1);NIGHT.forEach(n=>{n.m.emissiveIntensity=(n.base||0)+night*n.k});K.renderer.toneMappingExposure=lerp(1.05,1.25,night)}
const LAMPL=[];for(let i=0;i<7;i++){const l=new T.PointLight(0xffc880,0,22,1.6);scene.add(l);LAMPL.push(l)}
const HEADL=new T.SpotLight(0xfff0d8,0,60,.5,.5,1.2);scene.add(HEADL,HEADL.target);
function lampLights(){const cp=camera.position;const L=LAMPS.map(q=>[q,(q[0]-cp.x)**2+(q[1]-cp.z)**2]).sort((a,b)=>a[1]-b[1]);LAMPL.forEach((l,i)=>{const q=L[i][0];l.position.set(q[0],6,q[1]);l.intensity=night*1.3})}
