/* ================= THE HOLLOW: survival horror story (The Forest style) ================= */
function theHollow(root,c){return with3D(root,c,()=>{
const st3=Stage3D(root,c,{lock:true,dragLook:true,fov:72,far:900,fireLabel:'USE',altLabel:'ACT',jumpLabel:'JUMP'});
const K=bigKit(st3,c,{id:'hl',exposure:1,fxN:2500,smN:1800,voice:true});
const{T,V3,PI,rnd,clamp,lerp,pick,lin,angDiff,scene,camera,input,wrap,mat,T_,ctex,Merger,addBox,H,SFX,snd}=K;
const TWO=PI*2;scene.add(camera);wrap.classList.add('hl');
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
/* ---------- noise ---------- */
const hs=(x,y)=>{const s=Math.sin(x*127.1+y*311.7)*43758.5453;return s-Math.floor(s)};
const vn=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);const a=hs(xi,yi),b=hs(xi+1,yi),c2=hs(xi,yi+1),d=hs(xi+1,yi+1);return(a+(b-a)*u+(c2-a)*v+(a-b-c2+d)*u*v)*2-1};
const fbm=(x,y)=>vn(x,y)*.55+vn(x*2.03+3.1,y*2.03)*.27+vn(x*4.1,y*4.1+7.7)*.13+vn(x*8.3+1,y*8.3)*.05;
const seeded=(s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296})(1816);
const sr=(a,b)=>a+seeded()*(b-a);
/* ---------- island layout ---------- */
const POI={crash:new V3(-150,0,215),boat:new V3(40,0,318),mount:new V3(190,0,-210),lake:new V3(-110,0,60),sink:new V3(45,0,-35),
  v1:new V3(-40,0,120),v2:new V3(-230,0,-90),v3:new V3(140,0,40),cave1:new V3(-275,0,110),cave2:new V3(-150,0,15),climb:new V3(150,0,-172)};
const LAKEY=7.5,SUMMIT=128;
function hRaw(x,z){const r=Math.hypot(x,z*1.08)/355+fbm(x*.004+9,z*.004)*.08;let h=24*(1-sstep(.72,1.02,r))-14*sstep(.98,1.25,r)+2;
  h+=(fbm(x*.0055,z*.0055)*16+fbm(x*.021+7,z*.021)*3.2)*(1-sstep(.85,1,r));
  const dm=Math.hypot(x-POI.mount.x,z-POI.mount.z);h+=78*Math.exp(-(dm*dm)/(2*62*62));if(dm<48){const pl=sstep(48,40,dm);h=lerp(h,Math.max(h,SUMMIT-8+fbm(x*.05,z*.05)*3),pl)}
  const dl=Math.hypot(x-POI.lake.x,z-POI.lake.z);h=lerp(h,LAKEY-6,sstep(58,26,dl));
  const ds=Math.hypot(x-POI.sink.x,z-POI.sink.z);if(ds<44){h=lerp(h,-58+fbm(x*.08,z*.08)*2,sstep(36,29,ds));h+=sstep(44,36,ds)*sstep(29,36,ds)*2}
  // flatten POIs
  for(const k of['crash','v1','v2','v3']){const p=POI[k],d=Math.hypot(x-p.x,z-p.z);if(d<34){const f=sstep(34,18,d);h=lerp(h,p.y0||(p.y0=hBase(p.x,p.z)),f)}}
  return h}
function hBase(x,z){const r=Math.hypot(x,z*1.08)/355+fbm(x*.004+9,z*.004)*.08;return 24*(1-sstep(.72,1.02,r))-14*sstep(.98,1.25,r)+2+(fbm(x*.0055,z*.0055)*16+fbm(x*.021+7,z*.021)*3.2)*(1-sstep(.85,1,r))}
/* height lookup on a precomputed grid (bilinear) */
const GN=361,GS=900/(GN-1),HG=new Float32Array(GN*GN);for(let j=0;j<GN;j++)for(let i=0;i<GN;i++)HG[j*GN+i]=hRaw(-450+i*GS,-450+j*GS);
function H_(x,z){const fx=(x+450)/GS,fz=(z+450)/GS;const i=clamp(Math.floor(fx),0,GN-2),j=clamp(Math.floor(fz),0,GN-2),u=clamp(fx-i,0,1),v=clamp(fz-j,0,1);const a=HG[j*GN+i],b=HG[j*GN+i+1],c2=HG[(j+1)*GN+i],d=HG[(j+1)*GN+i+1];return a+(b-a)*u+(c2-a)*v+(a-b-c2+d)*u*v}
const slopeAt=(x,z)=>{const e=1.5;return Math.hypot(H_(x+e,z)-H_(x-e,z),H_(x,z+e)-H_(x,z-e))/(2*e)};
Object.values(POI).forEach(p=>p.y=H_(p.x,p.z));
let INSIDE=null;K.W.groundFn=(x,z)=>INSIDE?-1e4:H_(x,z);K.W.cs=6;
/* ---------- terrain mesh ---------- */
const WORLD=new T.Group();scene.add(WORLD);
(()=>{const N=300,g=new T.PlaneGeometry(900,900,N,N);g.rotateX(-PI/2);const pos=g.attributes.position,cols=new Float32Array(pos.count*3),col=new T.Color();
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=H_(x,z);pos.setY(i,y);const s=slopeAt(x,z),n=fbm(x*.05,z*.05),m=vn(x*.012+4,z*.012);
    if(y<2.6)col.setRGB(.76+n*.04,.68+n*.04,.5);else if(y<4)col.setRGB(.55,.52,.36);else{col.setRGB(.2+n*.04+m*.03,.3+n*.05+m*.04,.13+m*.02);if(m>.35)col.lerp(new T.Color(.36,.3,.18),.5)}
    if(s>.9)col.lerp(new T.Color(.42,.4,.37),clamp((s-.9)*1.8,0,1));if(y>100)col.lerp(new T.Color(.86,.88,.92),sstep(100,112,y));if(y<-5)col.setRGB(.28,.26,.24);
    const dl=Math.hypot(x-POI.lake.x,z-POI.lake.z);if(dl<40&&y<LAKEY+.6)col.setRGB(.3,.28,.2);
    col.convertSRGBToLinear();cols[i*3]=col.r;cols[i*3+1]=col.g;cols[i*3+2]=col.b}
  g.setAttribute('color',new T.BufferAttribute(cols,3));g.computeVertexNormals();
  const detail=ctex(256,256,(g2,w,h)=>{g2.fillStyle='#808080';g2.fillRect(0,0,w,h);for(let i=0;i<9000;i++){const v=Math.floor(rnd(90,170));g2.fillStyle=`rgb(${v},${v},${v})`;g2.fillRect(Math.random()*w,Math.random()*h,rnd(1,3),rnd(1,4))}},160,160,true);
  const m=new T.MeshStandardMaterial({vertexColors:true,roughness:.95,map:detail});const t=new T.Mesh(g,m);t.receiveShadow=true;WORLD.add(t)})();
const mOcean=new T.MeshStandardMaterial({color:lin(0x1d4a5e),roughness:.15,metalness:.2,transparent:true,opacity:.9,normalMap:ctex(256,256,(g,w,h)=>{g.fillStyle='rgb(128,128,255)';g.fillRect(0,0,w,h);for(let i=0;i<500;i++){const x=Math.random()*w,y=Math.random()*h,r=rnd(4,16);const gr=g.createRadialGradient(x,y,0,x,y,r);const a=Math.random()*TWO;gr.addColorStop(0,`rgba(${128+Math.cos(a)*60|0},${128+Math.sin(a)*60|0},255,.5)`);gr.addColorStop(1,'rgba(128,128,255,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)}},24,24,true)});
const ocean=new T.Mesh(new T.PlaneGeometry(5000,5000),mOcean);ocean.rotation.x=-PI/2;ocean.position.y=0;scene.add(ocean);
const mLake=mOcean.clone();mLake.color=lin(0x2a4a3a);const lake=new T.Mesh(new T.CircleGeometry(60,40),mLake);lake.rotation.x=-PI/2;lake.position.set(POI.lake.x,LAKEY,POI.lake.z);scene.add(lake);
const inLake=(x,z)=>Math.hypot(x-POI.lake.x,z-POI.lake.z)<60&&H_(x,z)<LAKEY;
const waterY=(x,z)=>inLake(x,z)?LAKEY:Math.hypot(x-POI.sink.x,z-POI.sink.z)<46?-999:0;
/* ---------- instanced flora ---------- */
const o3=new T.Object3D();const mtx=(x,y,z,ry,s,sy)=>{o3.position.set(x,y,z);o3.rotation.set(0,ry,0);o3.scale.set(s,sy||s,s);o3.updateMatrix();return o3.matrix.clone()};
const mBark=mat('bark','#ffffff',{map:'bark'}),mNeedle=new T.MeshStandardMaterial({color:0xffffff,roughness:.9,flatShading:true}),mLeafy=new T.MeshStandardMaterial({color:0xffffff,roughness:.9,flatShading:true});
const G={pineT:(()=>{const g=new T.CylinderGeometry(.18,.34,9,7);g.translate(0,4.5,0);return g})(),pineC:(()=>{const a=new T.ConeGeometry(2.6,5,8);a.translate(0,5.2,0);const b=new T.ConeGeometry(2.1,4.2,8);b.translate(0,7.6,0);const c2=new T.ConeGeometry(1.5,3.4,8);c2.translate(0,9.8,0);return mergeG([a,b,c2])})(),
  oakT:(()=>{const g=new T.CylinderGeometry(.22,.36,6,7);g.translate(0,3,0);return g})(),oakC:(()=>{const a=new T.IcosahedronGeometry(2.6,1);a.translate(0,6.6,0);const b=new T.IcosahedronGeometry(1.9,1);b.translate(1.4,5.8,.6);const c2=new T.IcosahedronGeometry(1.8,1);c2.translate(-1.2,6,-.7);return mergeG([a,b,c2])})(),
  stump:(()=>{const g=new T.CylinderGeometry(.3,.38,.6,8);g.translate(0,.3,0);return g})(),bush:new T.IcosahedronGeometry(.9,1),rock:new T.DodecahedronGeometry(1,0),fern:(()=>{const gs=[];for(let i=0;i<6;i++){const g=new T.PlaneGeometry(.3,1.2);g.translate(0,.6,0);g.rotateX(-.6);g.rotateY(i*1.05);gs.push(g)}return mergeG(gs)})()};
function mergeG(list){let n=0;list.forEach(g=>{n+=g.index?g.index.count:g.attributes.position.count});const p=[],nn=[],uv=[];list.forEach(g=>{const gi=g.index?g.toNonIndexed():g;const a=gi.attributes;for(let i=0;i<a.position.count;i++){p.push(a.position.getX(i),a.position.getY(i),a.position.getZ(i));nn.push(a.normal.getX(i),a.normal.getY(i),a.normal.getZ(i));uv.push(a.uv?a.uv.getX(i):0,a.uv?a.uv.getY(i):0)}});const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(nn,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return g}
const TREES=[];const CLEAR=[[POI.crash,40],[POI.v1,26],[POI.v2,26],[POI.v3,26],[POI.cave1,14],[POI.cave2,12],[POI.climb,12],[POI.boat,30]];
for(let k=0;k<9000&&TREES.length<2600;k++){const x=sr(-360,360),z=sr(-360,360);const y=H_(x,z);if(y<4.5||y>96)continue;if(slopeAt(x,z)>.75)continue;if(inLake(x,z)||Math.hypot(x-POI.lake.x,z-POI.lake.z)<48)continue;if(Math.hypot(x-POI.sink.x,z-POI.sink.z)<46)continue;if(CLEAR.some(([p,r])=>Math.hypot(x-p.x,z-p.z)<r))continue;const dens=fbm(x*.01+30,z*.01);if(dens<-.25&&seeded()<.8)continue;
  const pine=y>40||fbm(x*.008+11,z*.008)>-.05;TREES.push({x,z,y,pine,s:sr(.75,1.3),ry:sr(0,TWO),hp:pine?5:6,alive:true,idx:0})}
const TI={pT:new T.InstancedMesh(G.pineT,mBark,TREES.length),pC:new T.InstancedMesh(G.pineC,mNeedle,TREES.length),oT:new T.InstancedMesh(G.oakT,mBark,TREES.length),oC:new T.InstancedMesh(G.oakC,mLeafy,TREES.length),st:new T.InstancedMesh(G.stump,mBark,TREES.length)};
let nP=0,nO=0;const tc=new T.Color();TREES.forEach((t,i)=>{const M=mtx(t.x,t.y-.3,t.z,t.ry,t.s);if(t.pine){t.idx=nP;TI.pT.setMatrixAt(nP,M);TI.pC.setMatrixAt(nP,M);TI.pC.setColorAt(nP,tc.setHSL(sr(.28,.36),sr(.3,.45),sr(.13,.2)).convertSRGBToLinear());nP++}else{t.idx=nO;TI.oT.setMatrixAt(nO,M);TI.oC.setMatrixAt(nO,M);TI.oC.setColorAt(nO,tc.setHSL(sr(.2,.3),sr(.35,.5),sr(.18,.28)).convertSRGBToLinear());nO++}
  t.box=addBox(t.x-.35*t.s,t.y-2,t.z-.35*t.s,t.x+.35*t.s,t.y+8,t.z+.35*t.s,'tree');t.box.tree=t});
TI.pT.count=TI.pC.count=nP;TI.oT.count=TI.oC.count=nO;TI.st.count=0;[TI.pC,TI.oC].forEach(m=>m.instanceColor.needsUpdate=true);Object.values(TI).forEach(m=>{m.castShadow=m!==TI.st;m.receiveShadow=true;WORLD.add(m)});
const ZERO=new T.Matrix4().makeScale(0,0,0);
function hideTree(t){const a=t.pine?[TI.pT,TI.pC]:[TI.oT,TI.oC];a.forEach(m=>{m.setMatrixAt(t.idx,ZERO);m.instanceMatrix.needsUpdate=true});TI.st.setMatrixAt(TI.st.count,mtx(t.x,t.y-.2,t.z,t.ry,t.s,1));TI.st.count++;TI.st.instanceMatrix.needsUpdate=true;K.removeBox(t.box);t.alive=false}
/* bushes, ferns, rocks */
const BUSH=[],ROCKS=[];(()=>{const bm=new T.InstancedMesh(G.bush,mLeafy,900),fm=new T.InstancedMesh(G.fern,new T.MeshStandardMaterial({color:lin(0x3a6a2a),side:T.DoubleSide,roughness:.9}),1400),rm=new T.InstancedMesh(G.rock,mat('rockm','#ffffff',{map:'rock',flatShading:true}),420);let nb=0,nf=0,nr=0;
  for(let k=0;k<6000;k++){const x=sr(-350,350),z=sr(-350,350),y=H_(x,z);if(y<4||y>100||inLake(x,z))continue;const s=slopeAt(x,z);const r=seeded();
    if(r<.2&&nb<900&&s<.6){const berry=seeded()<.18;bm.setMatrixAt(nb,mtx(x,y+.2,z,sr(0,6),sr(.7,1.2),sr(.6,.9)));bm.setColorAt(nb,tc.setHSL(sr(.22,.3),.4,sr(.16,.24)).convertSRGBToLinear());BUSH.push({x,y,z,i:nb,berry:berry?(seeded()<.7?'blueberry':'twinberry'):null,cd:0});nb++}
    else if(r<.5&&nf<1400&&s<.7){fm.setMatrixAt(nf++,mtx(x,y,z,sr(0,6),sr(.8,1.4)))}
    else if(r<.56&&nr<420){const sc=sr(.5,2.4);rm.setMatrixAt(nr++,mtx(x,y-.3*sc,z,sr(0,6),sc,sc*sr(.5,.9)));if(sc>1)addBox(x-sc*.8,y-2,z-sc*.8,x+sc*.8,y+sc*.6,z+sc*.8,'rock');ROCKS.push({x,z,s:sc})}}
  bm.count=nb;fm.count=nf;rm.count=nr;bm.instanceColor.needsUpdate=true;[bm,fm,rm].forEach(m=>{m.castShadow=m!==fm;m.receiveShadow=true;WORLD.add(m)});
  // berries on berry bushes
  const bg=new T.SphereGeometry(.07,5,4);const blue=new T.InstancedMesh(bg,new T.MeshStandardMaterial({color:lin(0x2a3a9a),roughness:.4}),BUSH.length*6),red=new T.InstancedMesh(bg,new T.MeshStandardMaterial({color:lin(0xc81a2a),roughness:.4}),BUSH.length*6);let nb2=0,nr2=0;
  BUSH.forEach(b=>{if(!b.berry)return;b.bi=[];for(let i=0;i<6;i++){const a=i*1.05,M=mtx(b.x+Math.cos(a)*.6,b.y+.5+Math.sin(i*2)*.2,b.z+Math.sin(a)*.6,0,1);if(b.berry==='blueberry'){b.bi.push(nb2);blue.setMatrixAt(nb2++,M)}else{b.bi.push(nr2);red.setMatrixAt(nr2++,M)}}});blue.count=nb2;red.count=nr2;WORLD.add(blue,red);K.berryI={blueberry:blue,twinberry:red};K.bushI=bm})();
function berriesVisible(b,on){const im=K.berryI[b.berry];b.bi.forEach((ix,k)=>{const a=k*1.05;im.setMatrixAt(ix,on?mtx(b.x+Math.cos(a)*.6,b.y+.5+Math.sin(k*2)*.2,b.z+Math.sin(a)*.6,0,1):ZERO)});im.instanceMatrix.needsUpdate=true}
/* ---------- items ---------- */
const IT={log:{n:'Log',ic:'🪵',max:4},stick:{n:'Stick',ic:'🥢',max:30},rock:{n:'Rock',ic:'🪨',max:20},leaf:{n:'Leaves',ic:'🍃',max:40},cloth:{n:'Cloth',ic:'🧻',max:20},rope:{n:'Rope',ic:'🪢',max:10},booze:{n:'Booze',ic:'🍾',max:10},
  snack:{n:'Snack bar',ic:'🍫',max:10,eat:{food:18}},soda:{n:'Soda',ic:'🥤',max:10,eat:{water:28,energy:6}},meat:{n:'Raw meat',ic:'🥩',max:10,eat:{food:12,hp:-6},cook:'cooked'},cooked:{n:'Cooked meat',ic:'🍖',max:10,eat:{food:34,hp:4}},
  fish:{n:'Raw fish',ic:'🐟',max:10,eat:{food:8,hp:-4},cook:'cfish'},cfish:{n:'Cooked fish',ic:'🍣',max:10,eat:{food:24,hp:3}},blueberry:{n:'Blueberries',ic:'🫐',max:20,eat:{food:7,water:3}},twinberry:{n:'Twinberries',ic:'🍒',max:20,eat:{food:4,hp:-12}},
  herb:{n:'Aloe',ic:'🌿',max:10,eat:{hp:6}},medicine:{n:'Medicine',ic:'💊',max:10,eat:{hp:45}},feather:{n:'Feather',ic:'🪶',max:40},bone:{n:'Bone',ic:'🦴',max:30},skull:{n:'Skull',ic:'💀',max:10},hide:{n:'Deer hide',ic:'🟫',max:10},
  arrow:{n:'Arrow',ic:'➶',max:40},molotov:{n:'Molotov',ic:'🔥',max:6},waterskin:{n:'Waterskin',ic:'👝',max:1},
  axe:{n:'Plane axe',ic:'🪓',tool:1,dmg:22,chop:1,rate:.7},maxe:{n:'Modern axe',ic:'🪓',tool:1,dmg:34,chop:2,rate:.62},club:{n:'Stone club',ic:'🔨',tool:1,dmg:27,rate:.75},spear:{n:'Spear',ic:'🔱',tool:1,dmg:20,reach:3,rate:.6,fish:1},bow:{n:'Bow',ic:'🏹',tool:1,bow:1,rate:.2},torch:{n:'Torch',ic:'🔦',tool:1,dmg:12,rate:.6,light:1},lighter:{n:'Lighter',ic:'🔥',tool:1,light:.55,rate:.5},
  armor:{n:'Bone armor',ic:'🛡',max:1},rebreather:{n:'Rebreather',ic:'🤿',key:1},climbaxe:{n:'Climbing axe',ic:'⛏',key:1,tool:1,dmg:26,rate:.6},keycard:{n:'Keycard',ic:'💳',key:1},teddy:{n:'Lily\'s bear',ic:'🧸',key:1}};
const TOOLS=['axe','maxe','climbaxe','club','spear','bow','torch','lighter'];
const RECIPES=[{out:'torch',n:1,need:{stick:1,cloth:1},d:'A burning stick. Light in the dark, scares small animals.'},{out:'spear',n:1,need:{stick:3,rope:1},d:'Long reach. Can spear fish in shallow water.'},{out:'club',n:1,need:{stick:2,rock:2,rope:1},d:'Heavy and brutal.'},
  {out:'bow',n:1,need:{stick:2,rope:1,cloth:1},d:'Hunt deer and fight from range.'},{out:'arrow',n:5,need:{stick:5,feather:5},d:'Five arrows.'},{out:'molotov',n:1,need:{booze:1,cloth:1},d:'Throw to set enemies on fire.'},
  {out:'armor',n:1,need:{bone:6,rope:1},d:'Absorbs damage until it breaks.'},{out:'medicine',n:1,need:{herb:2},d:'Heals 45 health.'},{out:'waterskin',n:1,need:{hide:1,rope:1},d:'Carry three sips of water.'}];
/* world item entities: sticks & rocks use instanced pools, the rest are small meshes */
const WITEMS=[];const itemGeo={stick:(()=>{const g=new T.CylinderGeometry(.03,.04,1.1,5);g.rotateZ(PI/2);return g})(),rock:new T.DodecahedronGeometry(.16,0),log:(()=>{const g=new T.CylinderGeometry(.22,.24,2.4,9);g.rotateZ(PI/2);return g})()};
const POOL={};function pool(t,n,m){const im=new T.InstancedMesh(itemGeo[t],m,n);im.count=n;for(let i=0;i<n;i++)im.setMatrixAt(i,ZERO);im.castShadow=true;WORLD.add(im);POOL[t]={im,free:[...Array(n).keys()].reverse()}}
pool('stick',520,mBark);pool('rock',320,mat('rockm','#ffffff',{map:'rock',flatShading:true}));pool('log',80,mBark);
const itemMeshMat={cloth:mat('cloth','#d8d0c0'),rope:mat('rope','#a88a5a'),booze:mat('bottle','#3a6a3a',{roughness:.2,metalness:.2}),snack:mat('snack','#c83a2a'),soda:mat('soda','#d82a2a',{metalness:.6,roughness:.3}),meat:mat('meat','#a83a3a'),fish:mat('fishm','#8a9aa8',{metalness:.4}),herb:mat('herb','#4a9a4a'),feather:mat('feath','#e8e8e0'),bone:mat('bone','#e8e0cc'),skull:mat('bone','#e8e0cc'),hide:mat('hide','#8a6a4a'),arrow:mat('arrowm','#8a6a4a'),key:new T.MeshStandardMaterial({color:lin(0xffd23f),emissive:lin(0xffa020),emissiveIntensity:.6})};
function dropItem(t,x,z,n,o){o=o||{};const y=o.y!=null?o.y:H_(x,z);const it={t,n:n||1,pos:new V3(x,y,z),alive:true,key:!!(IT[t]&&IT[t].key),note:o.note||null,drawing:o.drawing||null};
  if(POOL[t]&&POOL[t].free.length){it.pi=POOL[t].free.pop();POOL[t].im.setMatrixAt(it.pi,mtx(x,y+(t==='log'?.24:t==='rock'?.08:.04),z,rnd(0,6),1));POOL[t].im.instanceMatrix.needsUpdate=true}
  else{let m;if(t==='note'||t==='drawing'){m=new T.Mesh(new T.PlaneGeometry(.3,.4),new T.MeshStandardMaterial({color:t==='note'?0xf0e8d0:0xfff4e0,emissive:lin(0x302818),side:T.DoubleSide}));m.rotation.x=-PI/2+.2}
    else if(IT[t]&&(IT[t].key||IT[t].tool)){m=new T.Group();const core=new T.Mesh(new T.BoxGeometry(.3,.12,.3),itemMeshMat.key);m.add(core);m.userData.spin=1}
    else m=new T.Mesh(t==='bone'?new T.CylinderGeometry(.04,.04,.4,5):t==='skull'?new T.SphereGeometry(.12,8,6):new T.BoxGeometry(.22,.12,.3),itemMeshMat[t]||itemMeshMat.cloth);
    m.position.set(x,y+.12,z);m.castShadow=true;scene.add(m);it.m=m}
  WITEMS.push(it);return it}
function removeItem(it){it.alive=false;if(it.pi!=null){POOL[it.t].im.setMatrixAt(it.pi,ZERO);POOL[it.t].im.instanceMatrix.needsUpdate=true;POOL[it.t].free.push(it.pi)}if(it.m){(it.m.parent||scene).remove(it.m)}const i=WITEMS.indexOf(it);if(i>=0)WITEMS.splice(i,1)}
for(let k=0;k<1600;k++){const x=sr(-340,340),z=sr(-340,340),y=H_(x,z);if(y<3.5||y>98||inLake(x,z)||slopeAt(x,z)>.7)continue;const r=seeded();if(r<.55&&POOL.stick.free.length>120)dropItem('stick',x,z);else if(r<.8&&POOL.rock.free.length>80)dropItem('rock',x,z);else if(r<.84)dropItem('herb',x,z)}
/* loot containers */
const LOOT=[];const mCase=mat('case','#3a3a4a',{roughness:.5}),mBag=mat('bag','#8a7a5a',{roughness:.9}),mCrate=mat('crate','#ffffff',{map:'wood'});
function container(kind,x,z,loot,o){o=o||{};const y=o.y!=null?o.y:H_(x,z);const m=kind==='case'?new T.Mesh(new T.BoxGeometry(.7,.25,.5),mCase):kind==='bag'?new T.Mesh(new T.SphereGeometry(.35,8,6),mBag):new T.Mesh(new T.BoxGeometry(.9,.7,.9),mCrate);m.position.set(x,y+(kind==='crate'?.35:.15),z);m.rotation.y=rnd(0,6);m.castShadow=true;(o.parent||scene).add(m);const L={kind,pos:new V3(x,y,z),m,loot,opened:false,id:o.id||('c'+LOOT.length)};LOOT.push(L);return L}
/* ---------- points of interest ---------- */
const mMetalW=mat('planem','#d8dce0',{metalness:.5,roughness:.35}),mMetalD=mat('planed','#6a7078',{metalness:.5,roughness:.5}),mStickW=mat('sticks','#ffffff',{map:'bark'});
const MG=Merger();
function planeCrash(){const p=POI.crash,y=p.y;const g=new T.Group();g.position.set(p.x,y,p.z);g.rotation.y=.5;scene.add(g);
  const fus=(len,x,z,ry,rz)=>{const m=new T.Mesh(new T.CylinderGeometry(2.1,2.1,len,20,1,true),new T.MeshStandardMaterial({color:lin(0xd8dce0),metalness:.5,roughness:.4,side:T.DoubleSide}));m.rotation.set(0,ry,PI/2+(rz||0));m.position.set(x,1.9,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m};
  fus(14,-6,0,0);const f2=fus(9,6,1.5,.35,.12);const nose=new T.Mesh(new T.SphereGeometry(2.1,16,10,0,TWO,0,PI/2),mMetalW);nose.rotation.z=-PI/2;nose.position.set(-13,1.9,0);g.add(nose);
  const wing=new T.Mesh(new T.BoxGeometry(5,.3,16),mMetalW);wing.position.set(-4,1.2,-9);wing.rotation.set(.1,.2,.05);wing.castShadow=true;g.add(wing);const tail=new T.Mesh(new T.BoxGeometry(3.5,4.5,.3),mMetalW);tail.position.set(12,4,2.6);tail.rotation.set(.2,.35,0);g.add(tail);
  for(let i=0;i<5;i++){const w=new T.Mesh(new T.BoxGeometry(.5,.35,.02),new T.MeshStandardMaterial({color:0x1a2a3a,roughness:.2}));w.position.set(-11+i*2.2,2.6,2.08);g.add(w)}
  const seatM=mat('seat','#2a3a6a');for(let i=0;i<6;i++){const s=new T.Mesh(new T.BoxGeometry(.6,1,.6),seatM);s.position.set(rnd(-4,8),.5,rnd(-6,6));s.rotation.set(rnd(-.5,.5),rnd(0,6),rnd(-.8,.8));s.castShadow=true;g.add(s)}
  g.updateMatrixWorld(true);const toW=(x,z)=>new V3(x,0,z).applyMatrix4(g.matrixWorld);
  // colliders (approx)
  [[-13,-2.2,1,2.2],[-12,-2.2,0,-2],[-12,2,0,2.2]].forEach(()=>{});const a=toW(-13,0),b=toW(1,0);const n=12;for(let i=0;i<=n;i++){const q=a.clone().lerp(b,i/n);addBox(q.x-1.4,y-1,q.z-1.4,q.x+1.4,y+4,q.z+1.4,'bld')}
  // suitcases + axe
  const L=[{snack:2,soda:1,cloth:2},{cloth:2,booze:1,snack:1},{soda:2,rope:1},{snack:1,cloth:3,booze:1},{rope:1,cloth:1,soda:1},{medicine:1,snack:2},{booze:2,cloth:1},{lighter:1,cloth:1,snack:1}];
  L.forEach((l,i)=>{const q=toW(rnd(-10,10),(i%2?1:-1)*rnd(4,9));container('case',q.x,q.z,l,{id:'crash'+i})});const ax=toW(-3,3.5);dropItem('axe',ax.x,ax.z,1);
  for(let i=0;i<14;i++){const q=toW(rnd(-18,16),rnd(-12,12));K.decal(new V3(q.x,H_(q.x,q.z)+.05,q.z),new V3(0,1,0),rnd(1.5,4),'scorch',.7,1e9)}
  K.planeG=g}
function hut(cx,cz,ry){const y=H_(cx,cz);const g=new T.Group();g.position.set(cx,y,cz);g.rotation.y=ry;const pm=new T.PlaneGeometry(4.2,4);for(const s of[-1,1]){const w=new T.Mesh(pm,new T.MeshStandardMaterial({map:(()=>{const t=T_('bark').clone();t.needsUpdate=true;t.repeat.set(3,1);return t})(),side:T.DoubleSide,roughness:1}));w.position.set(s*1,1.6,0);w.rotation.set(0,PI/2,s*-.55);w.rotation.order='YXZ';w.rotation.set(0,PI/2,0);w.rotateX(s*.55);w.castShadow=true;g.add(w)}
  scene.add(g);g.updateMatrixWorld(true);addBox(cx-1.6,y-1,cz-1.6,cx+1.6,y+2.6,cz+1.6,'bld')}
function effigy(x,z){const y=H_(x,z);const g=new T.Group();g.position.set(x,y,z);for(let i=0;i<3;i++){const s=new T.Mesh(new T.CylinderGeometry(.06,.08,3.2,5),mBark);s.position.y=1.4;s.rotation.set(Math.cos(i*2.1)*.3,0,Math.sin(i*2.1)*.3);g.add(s)}const sk=new T.Mesh(new T.SphereGeometry(.16,8,6),itemMeshMat.skull);sk.position.y=2.9;g.add(sk);for(let i=0;i<4;i++){const b=new T.Mesh(new T.CylinderGeometry(.03,.03,.5,5),itemMeshMat.bone);b.position.set(Math.cos(i*1.6)*.3,2.2,Math.sin(i*1.6)*.3);b.rotation.z=i;g.add(b)}scene.add(g)}
const FIRES=[];function firePit(x,z,lit){const y=H_(x,z);for(let i=0;i<8;i++){const a=i/8*TWO;const r=new T.Mesh(itemGeo.rock,mat('rockm','#ffffff',{map:'rock',flatShading:true}));r.position.set(x+Math.cos(a)*.7,y+.05,z+Math.sin(a)*.7);r.scale.setScalar(1.3);scene.add(r)}for(let i=0;i<3;i++){const l=new T.Mesh(new T.CylinderGeometry(.07,.08,1,5),mBark);l.rotation.set(PI/2,0,i*1.05);l.position.set(x,y+.12,z);scene.add(l)}const L=new T.PointLight(0xff8a30,0,16,2);L.position.set(x,y+1,z);scene.add(L);const f={pos:new V3(x,y,z),lit:!!lit,L,t:0};FIRES.push(f);return f}
function village(p,n){const y=p.y;firePit(p.x,p.z,true);for(let i=0;i<n;i++){const a=i/n*TWO+rnd(-.2,.2),r=rnd(9,14);hut(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r,-a+PI/2)}for(let i=0;i<4;i++){const a=rnd(0,TWO),r=rnd(15,20);effigy(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r)}
  for(let i=0;i<4;i++){const a=rnd(0,TWO),r=rnd(3,7);container('bag',p.x+Math.cos(a)*r,p.z+Math.sin(a)*r,pick([{cloth:2,bone:2},{booze:1,rope:1},{bone:3,skull:1},{cloth:1,booze:1,feather:4},{feather:6,meat:1},{rope:1,bone:2,cloth:1}]),{id:'v'+p.x.toFixed(0)+i})}}
function caveMouth(p,label){const y=p.y;const g=new T.Group();g.position.set(p.x,y,p.z);const rm=mat('rockm','#ffffff',{map:'rock',flatShading:true});for(let i=0;i<9;i++){const a=i/8*PI;const r=new T.Mesh(G.rock,rm);r.scale.set(rnd(1.6,2.4),rnd(1.6,2.4),rnd(1.6,2.4));r.position.set(Math.cos(a)*3.6,Math.sin(a)*3.8,0);g.add(r)}const hole=new T.Mesh(new T.CircleGeometry(3,16,0,PI),new T.MeshBasicMaterial({color:0x000000}));hole.position.set(0,0,.3);g.add(hole);const hole2=new T.Mesh(new T.PlaneGeometry(6,.01),new T.MeshBasicMaterial({color:0}));g.add(hole2);
  const dir=Math.atan2(-p.x,-p.z);g.rotation.y=dir;scene.add(g);g.traverse(o=>{if(o.isMesh)o.castShadow=true});p.face=dir}
function hutSummit(){const p=POI.mount,y=H_(p.x,p.z);const g=new T.Group();g.position.set(p.x+6,y,p.z);const wall=mat('shack','#8a8a80',{map:'metal'});const b=new T.Mesh(new T.BoxGeometry(5,3,4),wall);b.position.y=1.5;b.castShadow=true;g.add(b);const roof=new T.Mesh(new T.BoxGeometry(5.6,.2,4.6),mMetalD);roof.position.y=3.1;g.add(roof);const door=new T.Mesh(new T.BoxGeometry(1,2,.1),mat('doorm','#3a3a3a'));door.position.set(0,1,2.03);g.add(door);
  const ant=new T.Mesh(new T.CylinderGeometry(.05,.05,8,6),mMetalD);ant.position.set(1.8,7,-1.4);g.add(ant);const dish=new T.Mesh(new T.SphereGeometry(.8,12,8,0,TWO,0,1.2),mMetalW);dish.position.set(-1.6,3.8,0);dish.rotation.x=-1;g.add(dish);scene.add(g);addBox(p.x+3.5,y-1,p.z-2,p.x+8.5,y+3.2,p.z+2,'bld')}
function sinkRope(){const a=Math.atan2(POI.climb.z-POI.sink.z,POI.climb.x-POI.sink.x);const x=POI.sink.x+Math.cos(a)*38,z=POI.sink.z+Math.sin(a)*38;const y=H_(x,z);const g=new T.Group();const post=new T.Mesh(new T.CylinderGeometry(.1,.12,1.4,6),mBark);post.position.set(x,y+.7,z);g.add(post);const rope=new T.Mesh(new T.CylinderGeometry(.03,.03,14,5),itemMeshMat.rope);const dx=POI.sink.x-x,dz=POI.sink.z-z,L=Math.hypot(dx,dz);rope.position.set(x+dx/L*3,y-5,z+dz/L*3);rope.rotation.set(dz/L*.5,0,-dx/L*.5);g.add(rope);scene.add(g);POI.rope=new V3(x,y,z);POI.ropeIn=new V3(x+dx/L*9,0,z+dz/L*9);POI.ropeIn.y=H_(POI.ropeIn.x,POI.ropeIn.z)
  // barrier logs round the rim so you can't just wander in
  for(let i=0;i<44;i++){const b=i/44*TWO;const rx=POI.sink.x+Math.cos(b)*40,rz=POI.sink.z+Math.sin(b)*40;if(Math.hypot(rx-x,rz-z)<5)continue;addBox(rx-2,H_(rx,rz)-1,rz-2,rx+2,H_(rx,rz)+2,rz+2,'bld')}}
function labDoor(){const x=POI.sink.x,z=POI.sink.z,y=H_(x,z);const g=new T.Group();g.position.set(x,y,z);const bunker=new T.Mesh(new T.BoxGeometry(8,5,5),mat('conc','#8a8a88',{map:'concrete'}));bunker.position.y=2.5;g.add(bunker);const door=new T.Mesh(new T.BoxGeometry(2.6,3.2,.2),mMetalD);door.position.set(0,1.6,2.55);g.add(door);const pad=new T.Mesh(new T.BoxGeometry(.3,.4,.1),new T.MeshStandardMaterial({color:0x222222,emissive:lin(0xff2020),emissiveIntensity:1}));pad.position.set(1.8,1.6,2.56);g.add(pad);K.labPad=pad;
  scene.add(g);addBox(x-4,y-1,z-2.5,x+4,y+5,z+2.5,'bld');POI.labDoor=new V3(x,y,z+3.6)}
function boat(){const p=POI.boat,y=0;const g=new T.Group();g.position.set(p.x,y,p.z+6);const hull=new T.Mesh(new T.BoxGeometry(4,1.6,10),mat('hull2','#e8e8e0',{metalness:.2}));hull.position.y=.3;g.add(hull);const cab=new T.Mesh(new T.BoxGeometry(3,2,3),mat('cab2','#d8d8d0'));cab.position.set(0,2,-1);g.add(cab);const stripe=new T.Mesh(new T.BoxGeometry(4.05,.25,10.05),mat('str','#c83a2a'));stripe.position.y=.9;g.add(stripe);scene.add(g);K.boatG=g}
planeCrash();village(POI.v1,5);village(POI.v2,6);village(POI.v3,5);caveMouth(POI.cave1);caveMouth(POI.cave2);hutSummit();sinkRope();labDoor();boat();
// the climbing wall: rope and axe marks on the mountain cliff
(()=>{const p=POI.climb;const g=new T.Group();const rope=new T.Mesh(new T.CylinderGeometry(.04,.04,30,5),itemMeshMat.rope);rope.position.set(p.x,p.y+15,p.z);g.add(rope);for(let i=0;i<10;i++){const m=new T.Mesh(new T.BoxGeometry(.3,.05,.2),mMetalD);m.position.set(p.x+rnd(-.6,.6),p.y+2+i*2.6,p.z+rnd(-.3,.3));g.add(m)}scene.add(g);POI.summitIn=new V3(POI.mount.x-20,0,POI.mount.z+20);POI.summitIn.y=H_(POI.summitIn.x,POI.summitIn.z)})();
/* story pickups in the world */
const NOTES={n1:{t:'Torn flyer',b:'"ARDENT BIOLABS — Research Station 4. Authorised personnel only." Someone has scrawled across it: THEY TAKE THE CHILDREN TO THE HOLLOW.'},n2:{t:'Hiker\'s diary',b:'Day 9. The painted ones watch us from the trees. They don\'t attack in daylight unless you get close to their camps. Mark the caves. Mark everything.'},
  n3:{t:'Lab memo',b:'Subject M continues to grow. Recovery of test subjects via the Hollow cave network has resumed. Divers must use rebreathers through the flooded section.'},n4:{t:'Radio log',b:'"...station 4, this is summit relay. The lab under the sinkhole has gone dark. If anyone hears this: the keycard for the lower door is in the relay hut."'},
  n5:{t:'Child\'s drawing',b:'A crayon drawing of a girl holding hands with a tall woman made of many arms. The girl is smiling. The woman is not.'},n6:{t:'Security badge',b:'Dr. Ada Venn — Project Mother. The badge photo has been scratched out.'}};
dropItem('note',POI.v1.x+3,POI.v1.z+2,1,{note:'n1'});dropItem('teddy',POI.v1.x-2,POI.v1.z+4,1);dropItem('note',POI.v2.x+2,POI.v2.z-3,1,{note:'n2'});
const DRAW_POS=[[-60,160],[20,90],[-200,-150],[210,110],[-280,40],[100,-140],[-30,-250],[260,-40],[-120,-230],[70,250]];DRAW_POS.forEach(([x,z],i)=>dropItem('drawing',x,z,1,{drawing:i}));
