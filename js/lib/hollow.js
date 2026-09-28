/* lib/hollow.js: code shared by several games (from src/heroes/hollow.js) */
const HL_ART=['tex:grass','tex:forest','tex:rock','tex:sand','tex:bark','tex:planks','tex:concrete','tex:metal','tex:tiles','tex:mud','tex:stonewall','img:fol_broad.png','img:fol_pine.png','img:fol_maple.png','img:fol_bamboo.png','hdr:forest','glb:boulder','glb:boulder2','glb:deadtrunk','glb:crate','glb:barrel','glb:firepit','glb:hatchet','chr:readyplayer.me','chr:Michelle','chr:Xbot'];
function theHollow(root,c){return withArt(root,c,HL_ART,()=>{
const st3=Stage3D(root,c,{qAim:true,lock:true,dragLook:true,fov:72,far:900,fireLabel:'USE',altLabel:'ACT',jumpLabel:'JUMP'});
const K=bigKit(st3,c,{id:'hl',exposure:1,fxN:2500,smN:1800,voice:true});
const{T,V3,PI,rnd,clamp,lerp,pick,lin,angDiff,scene,camera,input,wrap,mat,T_,ctex,Merger,addBox,H,SFX,snd}=K;
const TWO=PI*2;scene.add(camera);wrap.classList.add('hlg');
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
  const SM=K.splatMat(['grass','forest','rock','sand'],[260,200,150,220]),spl=SM?new Float32Array(pos.count*4):null;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=H_(x,z);pos.setY(i,y);const s=slopeAt(x,z),n=fbm(x*.05,z*.05),m=vn(x*.012+4,z*.012);
    if(y<2.6)col.setRGB(.76+n*.04,.68+n*.04,.5);else if(y<4)col.setRGB(.55,.52,.36);else{col.setRGB(.2+n*.04+m*.03,.3+n*.05+m*.04,.13+m*.02);if(m>.35)col.lerp(new T.Color(.36,.3,.18),.5)}
    if(s>.9)col.lerp(new T.Color(.42,.4,.37),clamp((s-.9)*1.8,0,1));if(y>100)col.lerp(new T.Color(.86,.88,.92),sstep(100,112,y));if(y<-5)col.setRGB(.28,.26,.24);
    const dl=Math.hypot(x-POI.lake.x,z-POI.lake.z);if(dl<40&&y<LAKEY+.6)col.setRGB(.3,.28,.2);
    if(SM){const sand=y<-5?0:1-sstep(2.4,4.2,y),rock=Math.max(y<-5?1:0,clamp((s-.62)*2.2,0,1),sstep(92,104,y)),dens=fbm(x*.01+30,z*.01),forest=clamp((dens+.3)*1.6,0,1)*(.65+m*.5);const rest=Math.max(0,1-sand-rock);
      spl[i*4]=rest*(1-forest);spl[i*4+1]=rest*forest;spl[i*4+2]=rock;spl[i*4+3]=sand;const snow=sstep(100,112,y),v=.82+n*.12+m*.08;col.setRGB(v,v*1.02,v*.95).lerp(new T.Color(1.6,1.65,1.75),snow);if(dl<40&&y<LAKEY+.6)col.multiplyScalar(.55);if(y<-5)col.multiplyScalar(.6)}
    col.convertSRGBToLinear();cols[i*3]=col.r;cols[i*3+1]=col.g;cols[i*3+2]=col.b}
  g.setAttribute('color',new T.BufferAttribute(cols,3));if(SM)g.setAttribute('splat',new T.BufferAttribute(spl,4));g.computeVertexNormals();
  const detail=ctex(256,256,(g2,w,h)=>{g2.fillStyle='#808080';g2.fillRect(0,0,w,h);for(let i=0;i<9000;i++){const v=Math.floor(rnd(90,170));g2.fillStyle=`rgb(${v},${v},${v})`;g2.fillRect(Math.random()*w,Math.random()*h,rnd(1,3),rnd(1,4))}},160,160,true);
  const m=SM||new T.MeshStandardMaterial({vertexColors:true,roughness:.95,map:detail});const t=new T.Mesh(g,m);t.receiveShadow=true;WORLD.add(t)})();
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
/* real foliage + scanned boulders when the art pack is loaded */
const LF={pine:K.leafMat('pine'),broad:K.leafMat('broad'),maple:K.leafMat('maple'),fern:K.leafMat('bamboo')};const REALF=!!(LF.pine&&LF.broad);
if(REALF){G.pineC=K.pineCrownGeo(9.5,3,26,2.2,3);G.oakC=K.crownGeo(3.1,4.6,24,4.2,9);G.bush=K.crownGeo(1,1.3,7,-.5,4);const tg=new T.CylinderGeometry(.14,.34,10.5,7);tg.translate(0,5.25,0);G.pineT=tg}
const BOULD=(K.propParts('boulder',{w:2,center:true})||[])[0];if(BOULD)G.rock=BOULD.geo;
function mergeG(list){let n=0;list.forEach(g=>{n+=g.index?g.index.count:g.attributes.position.count});const p=[],nn=[],uv=[];list.forEach(g=>{const gi=g.index?g.toNonIndexed():g;const a=gi.attributes;for(let i=0;i<a.position.count;i++){p.push(a.position.getX(i),a.position.getY(i),a.position.getZ(i));nn.push(a.normal.getX(i),a.normal.getY(i),a.normal.getZ(i));uv.push(a.uv?a.uv.getX(i):0,a.uv?a.uv.getY(i):0)}});const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(nn,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return g}
const TREES=[];const CLEAR=[[POI.crash,40],[POI.v1,26],[POI.v2,26],[POI.v3,26],[POI.cave1,14],[POI.cave2,12],[POI.climb,12],[POI.boat,30]];
for(let k=0;k<9000&&TREES.length<2600;k++){const x=sr(-360,360),z=sr(-360,360);const y=H_(x,z);if(y<4.5||y>96)continue;if(slopeAt(x,z)>.75)continue;if(inLake(x,z)||Math.hypot(x-POI.lake.x,z-POI.lake.z)<48)continue;if(Math.hypot(x-POI.sink.x,z-POI.sink.z)<46)continue;if(CLEAR.some(([p,r])=>Math.hypot(x-p.x,z-p.z)<r))continue;const dens=fbm(x*.01+30,z*.01);if(dens<-.25&&seeded()<.8)continue;
  const pine=y>40||fbm(x*.008+11,z*.008)>-.05;TREES.push({x,z,y,pine,s:sr(.75,1.3),ry:sr(0,TWO),hp:pine?5:6,alive:true,idx:0})}
const TI={pT:new T.InstancedMesh(G.pineT,mBark,TREES.length),pC:new T.InstancedMesh(G.pineC,REALF?LF.pine:mNeedle,TREES.length),oT:new T.InstancedMesh(G.oakT,mBark,TREES.length),oC:new T.InstancedMesh(G.oakC,REALF?LF.broad:mLeafy,TREES.length),st:new T.InstancedMesh(G.stump,mBark,TREES.length)};
let nP=0,nO=0;const tc=new T.Color();TREES.forEach((t,i)=>{const M=mtx(t.x,t.y-.3,t.z,t.ry,t.s);if(t.pine){t.idx=nP;TI.pT.setMatrixAt(nP,M);TI.pC.setMatrixAt(nP,M);TI.pC.setColorAt(nP,REALF?tc.setHSL(sr(.2,.3),sr(.15,.3),sr(.55,.75)).convertSRGBToLinear():tc.setHSL(sr(.28,.36),sr(.3,.45),sr(.13,.2)).convertSRGBToLinear());nP++}else{t.idx=nO;TI.oT.setMatrixAt(nO,M);TI.oC.setMatrixAt(nO,M);TI.oC.setColorAt(nO,REALF?tc.setHSL(sr(.14,.3),sr(.2,.45),sr(.6,.85)).convertSRGBToLinear():tc.setHSL(sr(.2,.3),sr(.35,.5),sr(.18,.28)).convertSRGBToLinear());nO++}
  t.box=addBox(t.x-.35*t.s,t.y-2,t.z-.35*t.s,t.x+.35*t.s,t.y+8,t.z+.35*t.s,'tree');t.box.tree=t});
TI.pT.count=TI.pC.count=nP;TI.oT.count=TI.oC.count=nO;TI.st.count=0;[TI.pC,TI.oC].forEach(m=>m.instanceColor.needsUpdate=true);Object.values(TI).forEach(m=>{m.castShadow=m!==TI.st;m.receiveShadow=true;if(m.material.userData.depth)m.customDepthMaterial=m.material.userData.depth;WORLD.add(m)});
const ZERO=new T.Matrix4().makeScale(0,0,0);
function hideTree(t){const a=t.pine?[TI.pT,TI.pC]:[TI.oT,TI.oC];a.forEach(m=>{m.setMatrixAt(t.idx,ZERO);m.instanceMatrix.needsUpdate=true});TI.st.setMatrixAt(TI.st.count,mtx(t.x,t.y-.2,t.z,t.ry,t.s,1));TI.st.count++;TI.st.instanceMatrix.needsUpdate=true;K.removeBox(t.box);t.alive=false}
/* bushes, ferns, rocks */
const BUSH=[],ROCKS=[];(()=>{const bm=new T.InstancedMesh(G.bush,REALF?LF.maple||LF.broad:mLeafy,900),fm=new T.InstancedMesh(G.fern,REALF&&LF.fern?K.leafMat('bamboo',0xb8d8a0):new T.MeshStandardMaterial({color:lin(0x3a6a2a),side:T.DoubleSide,roughness:.9}),1400),rm=new T.InstancedMesh(G.rock,BOULD?BOULD.m:mat('rockm','#ffffff',{map:'rock',flatShading:true}),420);let nb=0,nf=0,nr=0;
  for(let k=0;k<6000;k++){const x=sr(-350,350),z=sr(-350,350),y=H_(x,z);if(y<4||y>100||inLake(x,z))continue;const s=slopeAt(x,z);const r=seeded();
    if(r<.2&&nb<900&&s<.6){const berry=seeded()<.18;bm.setMatrixAt(nb,mtx(x,y+.2,z,sr(0,6),sr(.7,1.2),sr(.6,.9)));bm.setColorAt(nb,REALF?tc.setHSL(sr(.18,.3),.3,sr(.55,.8)).convertSRGBToLinear():tc.setHSL(sr(.22,.3),.4,sr(.16,.24)).convertSRGBToLinear());BUSH.push({x,y,z,i:nb,berry:berry?(seeded()<.7?'blueberry':'twinberry'):null,cd:0});nb++}
    else if(r<.5&&nf<1400&&s<.7){fm.setMatrixAt(nf++,mtx(x,y,z,sr(0,6),sr(.8,1.4)))}
    else if(r<.56&&nr<420){const sc=sr(.5,2.4);rm.setMatrixAt(nr++,mtx(x,y-.3*sc,z,sr(0,6),sc,sc*sr(.5,.9)));if(sc>1)addBox(x-sc*.8,y-2,z-sc*.8,x+sc*.8,y+sc*.6,z+sc*.8,'rock');ROCKS.push({x,z,s:sc})}}
  bm.count=nb;fm.count=nf;rm.count=nr;bm.instanceColor.needsUpdate=true;[bm,fm,rm].forEach(m=>{m.castShadow=m!==fm;m.receiveShadow=true;if(m.material.userData.depth)m.customDepthMaterial=m.material.userData.depth;WORLD.add(m)});
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
/* ================= interiors: caves & the lab ================= */
const MAPS={
 cave1:{name:'The Hollow',at:new V3(3000,-300,0),mat:'cave',key:{I:['rebreather','maxe']},note:{N:'n3'},rows:[
 '####################',
 '#E..#######....L####',
 '#.#.#####...##..c###',
 '#.#......c.###...###',
 '#.####.#####.#.#..##',
 '#..L##.#...#.#.##.##',
 '##.###...#.....##.##',
 '##..##.#####.###..##',
 '###.....##C#.....###',
 '####.##.##.#.#######',
 '#N.#.##....#...M..##',
 '#..#..####.###.##.##',
 '#.L...#..........I##',
 '####################']},
 cave2:{name:'Drowned Caves',at:new V3(3300,-300,0),mat:'cave',key:{I:['climbaxe']},note:{N:'n5'},rows:[
 '##################',
 '#E...L####.......#',
 '#.##..####.#####.#',
 '#.##c.WWWW.#####.#',
 '#.#####WWWWWWWW#.#',
 '#..L###WWWWWWWW#.#',
 '####WWWWWWWWWWWW.#',
 '####W#############',
 '####WWWWW...L..###',
 '########W.#c#..###',
 '#########.#.#.I###',
 '#####N....#M..C###',
 '##################']},
 lab:{name:'Research Station 4',at:new V3(3700,-300,0),mat:'lab',key:{},note:{N:'n6'},rows:[
 '######################',
 '#E..D.....#..........#',
 '#####.###.#.########.#',
 '#...#.#N#.#.#......#.#',
 '#.C.....#...#.#MM#.#.#',
 '#...#####.###.#..#.#.#',
 '###.#.....#...#..#...#',
 '###.#.###.#.###..#####',
 '#...#.#L#.....#......#',
 '#.#####.#######.####.#',
 '#.......L.........#..#',
 '#########.#########..#',
 '#.........B.........##',
 '#..........L.........#',
 '#..........P.........#',
 '######################']}};
const TS=4,WH=5;const IN={};
const mCaveW=new T.MeshStandardMaterial({map:T_('rock'),color:lin(0x6a625a),roughness:1,flatShading:true}),mCaveF=new T.MeshStandardMaterial({map:T_('dirt'),color:lin(0x5a4a3a),roughness:1}),mLabW=new T.MeshStandardMaterial({map:T_('tile'),color:lin(0xb8bcc0),roughness:.5}),mLabF=new T.MeshStandardMaterial({map:T_('metal'),color:lin(0x5a5e64),roughness:.4,metalness:.4}),mLabC=mat('labc','#3a3c40');
const mWaterIn=new T.MeshStandardMaterial({color:lin(0x1a3a3a),transparent:true,opacity:.75,roughness:.1,metalness:.3,side:T.DoubleSide});
function buildInterior(key){const D=MAPS[key],R=D.rows,g=new T.Group();g.visible=false;scene.add(g);const M2=Merger();const lab=D.mat==='lab';const wm=lab?mLabW:mCaveW,fm=lab?mLabF:mCaveF,cm=lab?mLabC:mCaveW;
  const I={key,D,g,spawn:null,lights:[],tiles:R,water:[],items:[],doors:[],monsters:[],bossAt:null,podAt:null,exit:null};const at=D.at;const W2=R[0].length,H2=R.length;
  const open=(i,j)=>j>=0&&i>=0&&j<H2&&i<W2&&R[j][i]!=='#';
  for(let j=0;j<H2;j++)for(let i=0;i<W2;i++){const ch=R[j][i];const x0=at.x+i*TS,z0=at.z+j*TS,x1=x0+TS,z1=z0+TS;
    if(ch==='#'){if([[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>open(i+a,j+b))){const jag=lab?0:rnd(-.3,.3);M2.box(x0-(lab?0:.2),at.y-3,z0-(lab?0:.2),x1+(lab?0:.2),at.y+WH+jag,z1+(lab?0:.2),wm,lab?2:3);addBox(x0,at.y-4,z0,x1,at.y+WH+2,z1,'bld')}continue}
    const water=ch==='W';const fy=water?at.y-2.6:at.y;M2.box(x0,fy-.4,z0,x1,fy,z1,fm,lab?2:3);addBox(x0,fy-1.4,z0,x1,fy,z1,'floor');const cy=water?at.y+.9:at.y+WH+(lab?0:rnd(-.6,.4));M2.box(x0,cy,z0,x1,cy+.4,z1,cm,3);
    if(water){I.water.push([i,j]);const wp=new T.Mesh(new T.PlaneGeometry(TS,TS),mWaterIn);wp.rotation.x=-PI/2;wp.position.set(x0+TS/2,at.y+.75,z0+TS/2);g.add(wp)}
    const cx=x0+TS/2,cz=z0+TS/2;
    if(ch==='E'){I.spawn=new V3(cx,at.y,cz);I.exit=new V3(cx,at.y,cz)}
    if(ch==='L'){const L=new T.PointLight(lab?0xdde8ff:0x7affd8,lab?1.6:1.1,lab?18:14,1.5);L.position.set(cx,at.y+(lab?4.6:1),cz);g.add(L);I.lights.push(L);if(!lab){for(let k=0;k<5;k++){const s=new T.Mesh(new T.SphereGeometry(rnd(.08,.18),6,5),new T.MeshBasicMaterial({color:0x7affd8}));s.position.set(cx+rnd(-1.6,1.6),at.y+.1,cz+rnd(-1.6,1.6));g.add(s)}}else{const p=new T.Mesh(new T.BoxGeometry(1.4,.05,.4),new T.MeshBasicMaterial({color:0xeef4ff}));p.position.set(cx,at.y+WH-.05,cz);g.add(p)}}
    if(ch==='I')I.itemAt=new V3(cx,at.y,cz);if(ch==='N')I.noteAt=new V3(cx,at.y,cz);if(ch==='C')I.crateAt=new V3(cx,at.y,cz);if(ch==='M')I.monsters.push({t:'mutant',p:new V3(cx,at.y,cz)});if(ch==='c')I.monsters.push({t:'pale',p:new V3(cx,at.y,cz)});if(ch==='B')I.bossAt=new V3(cx,at.y,cz);if(ch==='P')I.podAt=new V3(cx,at.y,cz);
    if(ch==='D'){const d=new T.Mesh(new T.BoxGeometry(TS,WH,.3),mat('ldoor','#4a5058',{metalness:.6,roughness:.4}));d.position.set(cx,at.y+WH/2,cz);d.rotation.y=PI/2;g.add(d);I.doors.push({m:d,box:addBox(cx-.2,at.y,z0,cx+.2,at.y+WH,z1,'bld'),open:false,p:new V3(cx,at.y,cz)})}}
  M2.build(g,false);g.traverse(o=>{if(o.isMesh)o.receiveShadow=true});
  // pickups & crates
  if(I.itemAt&&D.key.I)D.key.I.forEach((t,k)=>{const it=dropItem(t,I.itemAt.x+k*.8-.4,I.itemAt.z,1,{y:I.itemAt.y});I.items.push(it)});
  if(I.noteAt)I.items.push(dropItem('note',I.noteAt.x,I.noteAt.z,1,{y:I.noteAt.y,note:D.note.N}));
  if(I.crateAt)container('crate',I.crateAt.x,I.crateAt.z,lab?{medicine:2,arrow:10,cloth:2}:{rope:1,booze:2,cloth:2,arrow:5},{y:I.crateAt.y,id:key+'crate'});
  if(lab&&I.podAt){const pod=new T.Mesh(new T.CylinderGeometry(1,1,2.6,20,1,true),new T.MeshStandardMaterial({color:lin(0x8ad8ff),transparent:true,opacity:.35,emissive:lin(0x2a6a9a),emissiveIntensity:.8,side:T.DoubleSide}));pod.position.set(I.podAt.x,I.podAt.y+1.3,I.podAt.z);g.add(pod);I.pod=pod;const base=new T.Mesh(new T.CylinderGeometry(1.2,1.3,.4,20),mLabF);base.position.set(I.podAt.x,I.podAt.y+.2,I.podAt.z);g.add(base)}
  IN[key]=I;return I}
Object.keys(MAPS).forEach(buildInterior);
function tileAt(I,x,z){const i=Math.floor((x-I.D.at.x)/TS),j=Math.floor((z-I.D.at.z)/TS);const r=I.tiles[j];return r?r[i]||'#':'#'}
/* ================= player ================= */
const P={pos:new V3(),vy:0,yaw:0,pitch:0,onG:true,hp:100,stam:100,energy:100,food:75,water:70,armor:0,held:'none',inv:{},swingT:0,swing:null,block:false,air:1,swim:false,uw:false,dead:false,crouch:false,fallY:0,notes:[],drawings:[],flags:{},captured:false,bow:0,sleepT:0,hurtT:0,lastHurt:0};
let hour=7.5,day=1;
function has(t,n){return(P.inv[t]||0)>=(n||1)}
function give(t,n,silent){n=n||1;const d=IT[t];if(!d){return 0}const max=d.max||99;const cur=P.inv[t]||0;const add=Math.min(n,max-cur);if(add<=0){if(!silent)K.note('You can\'t carry more '+d.n.toLowerCase()+'.','#ff8a6a');return 0}P.inv[t]=cur+add;if(!silent)K.note('+'+add+' '+d.ic+' '+d.n,d.key?'#ffd23f':'#9ad89a');if((d.tool||d.key)&&!P.flags['got_'+t]){P.flags['got_'+t]=1;onKeyItem(t)}return add}
function take(t,n){n=n||1;if(!has(t,n))return false;P.inv[t]-=n;if(!P.inv[t])delete P.inv[t];if(P.held===t&&!has(t))equip('none');return true}
function eat(t){const e=IT[t]&&IT[t].eat;if(!e||!take(t))return;if(e.food)P.food=clamp(P.food+e.food,0,100);if(e.water)P.water=clamp(P.water+e.water,0,100);if(e.hp){if(e.hp>0)P.hp=clamp(P.hp+e.hp,0,100);else hurtP(-e.hp,'sick')}if(e.energy)P.energy=clamp(P.energy+e.energy,0,100);K.snd({noise:1,f:900,dur:.15,vol:.2});K.note('Ate '+IT[t].n.toLowerCase(),'#9ad89a')}
/* ---------- first-person viewmodel ---------- */
const VM=new T.Group();camera.add(VM);VM.position.set(0,0,0);const armM=mat('parm','#c89878',{roughness:.7}),sleeveM=mat('sleeve','#3a4a5a');
const vmArm=(side)=>{const g=new T.Group();const up=new T.Mesh(new T.CylinderGeometry(.055,.06,.42,8),sleeveM);up.rotation.x=PI/2;up.position.z=.2;g.add(up);const hand=new T.Mesh(new T.SphereGeometry(.06,8,6),armM);hand.scale.set(1,1.2,1.4);g.add(hand);g.position.set(side*.24,-.26,-.42);return g};
const vmR=vmArm(1),vmL=vmArm(-1);VM.add(vmR,vmL);let heldMesh=null;const flameS=new T.Sprite(new T.SpriteMaterial({map:T_('glow'),color:0xffa040,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));flameS.scale.setScalar(.22);
function toolMesh(t){const g=new T.Group();const wd=mat('handle','#6a4a2a',{map:'wood'}),st=mat('steel2','#b8bcc4',{metalness:.8,roughness:.3});const B=(w,h,d,x,y,z,m,rx)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(x,y,z);if(rx)b.rotation.x=rx;g.add(b);return b};
  if(t==='axe'||t==='maxe'||t==='climbaxe'){B(.035,.035,.62,0,0,-.2,wd);const hd=B(.02,t==='climbaxe'?.08:.16,.14,0,.06,-.46,t==='maxe'?mat('red2','#c82a2a',{metalness:.5}):st);if(t==='climbaxe'){B(.015,.02,.2,0,-.05,-.5,st)}}
  else if(t==='club'){B(.04,.04,.55,0,0,-.18,wd);const r=new T.Mesh(new T.DodecahedronGeometry(.08,0),mat('rockm','#ffffff',{map:'rock',flatShading:true}));r.position.set(0,0,-.46);g.add(r)}
  else if(t==='spear'){B(.025,.025,1.5,0,0,-.5,wd);const tip=new T.Mesh(new T.ConeGeometry(.03,.14,5),st);tip.rotation.x=-PI/2;tip.position.z=-1.3;g.add(tip)}
  else if(t==='bow'){const arc=new T.Mesh(new T.TorusGeometry(.42,.014,5,20,2.2),wd);arc.rotation.set(0,PI/2,PI/2-1.1);arc.position.set(0,0,-.1);g.add(arc);const str=B(.004,.004,.001,0,0,0,mat('str2','#e8e0d0'));str.scale.set(1,190,1);str.position.set(0,0,.1);g.userData.str=str}
  else if(t==='torch'){B(.035,.035,.5,0,0,-.12,wd);const cl=B(.06,.06,.1,0,0,-.38,itemMeshMat.cloth);const fl=flameS.clone();fl.position.set(0,.04,-.46);fl.scale.setScalar(.34);g.add(fl);g.userData.fl=fl}
  else if(t==='lighter'){B(.04,.07,.02,0,0,0,mat('lig','#c82a2a',{metalness:.5}));const fl=flameS.clone();fl.position.set(0,.07,0);fl.scale.setScalar(.1);g.add(fl);g.userData.fl=fl}
  return g}
function equip(t){P.held=t;if(heldMesh){heldMesh.parent&&heldMesh.parent.remove(heldMesh);heldMesh=null}if(t!=='none'){heldMesh=toolMesh(t);if(t==='bow'){heldMesh.position.set(-.18,-.2,-.5);VM.add(heldMesh)}else if(t==='lighter'){heldMesh.position.set(-.2,-.22,-.42);VM.add(heldMesh)}else{heldMesh.position.set(0,0,0);heldMesh.rotation.set(-.3,0,0);vmR.add(heldMesh);heldMesh.position.set(0,.05,-.02)}}K.SFX.ui();updHUD(1)}
const pLight=new T.PointLight(0xffa050,0,16,1.6);camera.add(pLight);pLight.position.set(.2,0,-.4);
/* ---------- survival HUD ---------- */
if(!document.getElementById('hl-css')){const s2=document.createElement('style');s2.id='hl-css';s2.textContent=`.hl-watch{position:absolute;left:14px;bottom:14px;display:flex;gap:7px;align-items:flex-end;pointer-events:none}.hl-watch .b{width:13px;height:84px;border-radius:7px;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.25);position:relative;overflow:hidden}.hl-watch .b i{position:absolute;left:0;right:0;bottom:0;border-radius:6px}.hl-watch .b span{position:absolute;left:50%;top:-20px;transform:translateX(-50%);font-size:12px}
.hl-watch .lab{display:flex;flex-direction:column;align-items:center;gap:3px;font:700 11px system-ui;color:#fff;text-shadow:0 1px 3px #000}.hl-held{position:absolute;right:16px;bottom:16px;font:800 14px system-ui;color:#fff;text-shadow:0 2px 6px #000;text-align:right;pointer-events:none}.hl-held small{display:block;opacity:.7;font-weight:600}
.hl-day{position:absolute;right:16px;top:12px;font:800 13px system-ui;color:#fff;text-shadow:0 2px 6px #000;text-align:right;pointer-events:none;opacity:.85}.hl-dot{position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px;border-radius:50%;background:#fff;box-shadow:0 0 3px #000;pointer-events:none}
.hl-air{position:absolute;left:50%;top:62%;transform:translateX(-50%);width:180px;height:8px;border-radius:4px;background:rgba(0,0,0,.5);overflow:hidden;display:none;pointer-events:none}.hl-air i{display:block;height:100%;background:#6ad8ff}.hl-uw{position:absolute;inset:0;background:rgba(10,60,70,.45);pointer-events:none;display:none}
.hl-inv{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:6px;margin:6px 0}.hl-inv button{all:unset;cursor:pointer;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:6px;text-align:center;font:700 11px system-ui}.hl-inv button:hover{background:rgba(255,255,255,.16)}.hl-inv button b{display:block;font-size:22px}.hl-inv button.on{border-color:#ffd23f}
.hl-rec{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:5px 8px;border-radius:8px;background:rgba(255,255,255,.05);margin:4px 0;font:600 12px system-ui}.hl-rec.no{opacity:.45}.hl-rec small{opacity:.7;display:block}
.hl-page{background:#e8dcc0;color:#2a2418;border-radius:6px;padding:14px 18px;font:500 15px/1.5 Georgia,serif;max-width:520px}.hl-page h2{font-family:Georgia,serif}.hlg .bk-dlg{bottom:24%}.hlg .bk-note{top:120px}.hl-mapc{width:min(62vh,80vw,540px);height:min(62vh,80vw,540px);border-radius:8px;display:block}`;document.head.append(s2)}
const HUD={};(()=>{const w=el('div',{class:'hl-watch'});const mk=(ic,col)=>{const lab=el('div',{class:'lab'});const b=el('div',{class:'b'});const i=el('i');i.style.background=col;b.append(i);lab.append(b,el('span',null,ic));w.append(lab);return i};HUD.hp=mk('❤','linear-gradient(#ff6a6a,#c82a2a)');HUD.st=mk('⚡','linear-gradient(#ffe07a,#e8a02a)');HUD.fo=mk('🍖','linear-gradient(#ffb07a,#c8602a)');HUD.wa=mk('💧','linear-gradient(#7ad8ff,#2a7ac8)');HUD.en=mk('😴','linear-gradient(#b0a0ff,#6a4ac8)');
  HUD.held=el('div',{class:'hl-held'});HUD.day=el('div',{class:'hl-day'});HUD.dot=el('div',{class:'hl-dot'});HUD.air=el('div',{class:'hl-air'},el('i'));HUD.uw=el('div',{class:'hl-uw'});K.hud.prepend(HUD.uw);K.hud.append(w,HUD.held,HUD.day,HUD.dot,HUD.air);K.H.bars.style.display='none';K.H.map.style.display='none';K.H.tr.style.display='none';K.H.x.style.display='none'})();
function updHUD(){HUD.hp.style.height=P.hp+'%';HUD.st.style.height=P.stam+'%';HUD.fo.style.height=P.food+'%';HUD.wa.style.height=P.water+'%';HUD.en.style.height=P.energy+'%';const d=IT[P.held];HUD.held.innerHTML=(d?d.ic+' '+d.n:'Empty hands')+'<small>'+(P.held==='bow'?'Arrows: '+(P.inv.arrow||0):(P.inv.log?'Logs carried: '+P.inv.log+'/4':''))+(P.armor>0?'  ·  Armor '+Math.round(P.armor):'')+'</small>';const hh=Math.floor(hour),mm=Math.floor((hour-hh)*60);HUD.day.textContent='Day '+day+' · '+(hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm}
function hurtP(d,why){if(P.dead||P.god)return;if(P.block&&why==='melee'){d*=.3;P.stam=Math.max(0,P.stam-10);K.SFX.clang(P.pos)}if(P.armor>0&&why!=='sick'&&why!=='starve'){const a=Math.min(P.armor,d*.7);P.armor-=a;d-=a}P.hp-=d;P.lastHurt=performance.now()/1000;P.hurtT=Math.min(1,P.hurtT+d/30);if(why!=='starve')K.SFX.hurt();if(P.hp<=0){P.hp=0;die(why)}}
/* ---------- build system ---------- */
const STRUCTS={fire:{n:'Campfire',ic:'🔥',need:{stick:5,rock:5},r:1.2,d:'Cook food, stay warm, see at night.'},leanto:{n:'Lean-to',ic:'⛺',need:{stick:10,leaf:10},r:2,d:'Sleep and save.'},cabin:{n:'Log cabin',ic:'🛖',need:{log:12,stick:6},r:3.2,d:'Sleep, save, and stay safer at night.'},
  rain:{n:'Rain collector',ic:'🪣',need:{stick:6,leaf:6},r:1,d:'Fills with clean water when it rains.'},trap:{n:'Rabbit trap',ic:'🪤',need:{stick:6,rope:1},r:.8,d:'Catches a rabbit now and then.'},wall:{n:'Defensive wall',ic:'🧱',need:{log:3},r:2.5,d:'Blocks enemies.'},spikes:{n:'Spike trap',ic:'⚔',need:{stick:8,log:1},r:1.5,d:'Hurts enemies that run into it.'},effigy:{n:'Effigy',ic:'💀',need:{stick:4,bone:3,skull:1},r:1,d:'Light it to scare cannibals away for a while.'}};
const BUILT=[];let ghost=null,ghostRot=0;
function structMesh(k,ghostMode){const g=new T.Group();const wm=ghostMode?new T.MeshBasicMaterial({color:0xaee8ff,transparent:true,opacity:.35,depthWrite:false}):mBark,lm=ghostMode?wm:new T.MeshStandardMaterial({color:lin(0x3a6a2a),roughness:1,side:T.DoubleSide}),rm=ghostMode?wm:mat('rockm','#ffffff',{map:'rock',flatShading:true});const cyl=(r,h,x,y,z,rx,rz,m)=>{const c2=new T.Mesh(new T.CylinderGeometry(r,r,h,6),m||wm);c2.position.set(x,y,z);c2.rotation.set(rx||0,0,rz||0);c2.castShadow=!ghostMode;g.add(c2);return c2};
  if(k==='fire'){for(let i=0;i<7;i++){const a=i/7*TWO;const r=new T.Mesh(itemGeo.rock,rm);r.position.set(Math.cos(a)*.6,.06,Math.sin(a)*.6);r.scale.setScalar(1.4);g.add(r)}for(let i=0;i<4;i++)cyl(.05,.9,0,.2,0,PI/2,0).rotation.y=i*.8}
  else if(k==='leanto'){for(let i=0;i<5;i++)cyl(.05,2.8,-1.2+i*.6,1,0,-.7,0);cyl(.06,3,0,1.9,-.7,0,PI/2);const roof=new T.Mesh(new T.PlaneGeometry(3,2.6),lm);roof.position.set(0,1.05,.15);roof.rotation.x=-.85;g.add(roof)}
  else if(k==='cabin'){for(let y=0;y<6;y++){cyl(.2,5,0,.2+y*.4,-2.3,0,PI/2);cyl(.2,5,0,.2+y*.4,2.3,0,PI/2);cyl(.2,4.6,-2.3,.4+y*.4,0,PI/2,0);if(y<2||y>3||true)cyl(.2,4.6,2.3,.4+y*.4,0,PI/2,0).visible=y<1||y>3}const roof=new T.Mesh(new T.ConeGeometry(3.8,1.8,4),ghostMode?wm:mat('roofl','#6a5a3a',{map:'wood'}));roof.rotation.y=PI/4;roof.position.y=3.3;g.add(roof)}
  else if(k==='rain'){for(let i=0;i<4;i++)cyl(.04,1.2,Math.cos(i*PI/2)*.5,.6,Math.sin(i*PI/2)*.5);const b=new T.Mesh(new T.CylinderGeometry(.7,.4,.35,10,1,true),lm);b.position.y=1.2;g.add(b);const wtr=new T.Mesh(new T.CircleGeometry(.6,10),new T.MeshStandardMaterial({color:lin(0x3a7a9a),roughness:.1}));wtr.rotation.x=-PI/2;wtr.position.y=1.1;g.add(wtr);g.userData.wtr=wtr}
  else if(k==='trap'){for(let i=0;i<4;i++)cyl(.03,.8,Math.cos(i*PI/2)*.3,.3,Math.sin(i*PI/2)*.3,Math.sin(i*PI/2)*.3,-Math.cos(i*PI/2)*.3)}
  else if(k==='wall'){for(let i=0;i<5;i++)cyl(.2,2.4,-1+i*.5,1.2,0)}
  else if(k==='spikes'){for(let i=0;i<6;i++){const s=cyl(.05,1.4,-1.2+i*.48,.5,0,-.6,0)}cyl(.12,3,0,.3,-.2,0,PI/2)}
  else if(k==='effigy'){for(let i=0;i<3;i++)cyl(.05,2.6,Math.cos(i*2.1)*.2,1.2,Math.sin(i*2.1)*.2,Math.cos(i*2.1)*.2,Math.sin(i*2.1)*.2);const sk=new T.Mesh(new T.SphereGeometry(.15,8,6),ghostMode?wm:itemMeshMat.skull);sk.position.y=2.5;g.add(sk)}
  return g}
function placeBlueprint(k,pos,rot){const def=STRUCTS[k];const g=structMesh(k,true);g.position.copy(pos);g.rotation.y=rot;scene.add(g);const b={k,def,pos:pos.clone(),rot,need:Object.assign({},def.need),g,built:false};BUILT.push(b);K.note('Blueprint placed. Add materials with E.','#aee8ff');return b}
function completeStruct(b){scene.remove(b.g);b.g=structMesh(b.k,false);b.g.position.copy(b.pos);b.g.rotation.y=b.rot;scene.add(b.g);b.built=true;K.SFX.mission();K.note(b.def.n+' built!','#ffd23f');
  const x=b.pos.x,z=b.pos.z,y=b.pos.y;if(b.k==='cabin'){const c2=Math.cos(b.rot),s2=Math.sin(b.rot);const add=(lx,lz,w,d)=>{const cx=x+lx*c2+lz*s2,cz=z-lx*s2+lz*c2;const hw=Math.abs(w*c2)+Math.abs(d*s2),hd=Math.abs(w*s2)+Math.abs(d*c2);b.boxes=(b.boxes||[]).concat(addBox(cx-hw/2,y-1,cz-hd/2,cx+hw/2,y+3,cz+hd/2,'bld'))};add(0,-2.3,5,.4);add(0,2.3,5,.4);add(-2.3,0,.4,4.6);add(2.3,-1.6,.4,1.4);add(2.3,1.6,.4,1.4)}
  else if(b.k==='wall'){const c2=Math.cos(b.rot),s2=Math.sin(b.rot);const hw=Math.abs(2.6*c2)+Math.abs(.5*s2),hd=Math.abs(2.6*s2)+Math.abs(.5*c2);b.boxes=[addBox(x-hw/2,y-1,z-hd/2,x+hw/2,y+2.4,z+hd/2,'bld')]}
  if(b.k==='fire'){const L=new T.PointLight(0xff8a30,0,18,2);L.position.set(x,y+1,z);scene.add(L);b.fire={pos:b.pos,lit:true,L,t:0,fuel:240};FIRES.push(b.fire)}if(b.k==='rain')b.water=0;if(b.k==='trap')b.t=rnd(60,120);if(b.k==='effigy')b.lit=0;
  if(!P.flags.firstShelter&&(b.k==='leanto'||b.k==='cabin')){P.flags.firstShelter=1;story()}if(!P.flags.firstFire&&b.k==='fire'){P.flags.firstFire=1;story()}}
function addMaterial(b){for(const t in b.need){if(b.need[t]>0&&has(t)){take(t);b.need[t]--;K.snd({noise:1,f:600,dur:.08,vol:.25});if(Object.values(b.need).every(v=>v<=0))completeStruct(b);return true}}K.note('You need: '+Object.entries(b.need).filter(([,v])=>v>0).map(([t,v])=>v+' '+IT[t].n.toLowerCase()).join(', '),'#ff8a6a');return false}
function buildMenu(){const card=K.menu('<h2>SURVIVAL BOOK · BUILD</h2><p>Pick something, place the blueprint (click), then add materials to it with E. R rotates, right-click cancels.</p>',[]);for(const k in STRUCTS){const d=STRUCTS[k];const row=el('div',{class:'hl-rec'});row.append(el('div',null,el('b',null,d.ic+' '+d.n),el('small',null,d.d+' — '+Object.entries(d.need).map(([t,v])=>v+' '+IT[t].ic).join('  '))));const b=el('button',{type:'button',class:'bk-btn'},'Place');b.onclick=e=>{e.stopPropagation();K.menuOff();startGhost(k)};row.append(b);card.append(row)}const cl=el('button',{type:'button',class:'bk-btn pri'},'Close');cl.onclick=e=>{e.stopPropagation();K.menuOff()};card.append(cl)}
function startGhost(k){endGhost();ghost={k,g:structMesh(k,true)};scene.add(ghost.g);K.note('Click to place · R rotates · right-click cancels','#aee8ff')}
function endGhost(){if(ghost){scene.remove(ghost.g);ghost=null}}
/* ---------- inventory & crafting ---------- */
function invMenu(tab){const card=K.menu('<h2>BACKPACK</h2>',[]);const tabs=el('div');[['items','Items'],['craft','Crafting'],['journal','Journal'],['map','Map']].forEach(([k,n])=>{const b=el('button',{type:'button',class:'bk-btn'+(tab===k?' pri':'')},n);b.onclick=e=>{e.stopPropagation();invMenu(k)};tabs.append(b)});const bb=el('button',{type:'button',class:'bk-btn'},'Build');bb.onclick=e=>{e.stopPropagation();buildMenu()};tabs.append(bb);card.append(tabs);
  tab=tab||'items';if(tab==='items'){const grid=el('div',{class:'hl-inv'});const keys=Object.keys(P.inv).sort((a,b)=>(IT[b].tool?1:0)-(IT[a].tool?1:0));if(!keys.length)card.append(el('p',null,'Your backpack is empty.'));keys.forEach(t=>{const d=IT[t];const b=el('button',{type:'button',class:P.held===t?'on':''});b.append(el('b',null,d.ic),d.n+(P.inv[t]>1?' ×'+P.inv[t]:''),el('br'),el('small',null,d.tool?(P.held===t?'Equipped':'Equip'):d.eat?'Eat':t==='armor'?'Wear':t==='molotov'?'Equip (G throws)':t==='waterskin'?'Drink ('+(P.skin||0)+'/3)':''));
    b.onclick=e=>{e.stopPropagation();if(d.tool)equip(P.held===t?'none':t);else if(d.eat)eat(t);else if(t==='armor'){if(take('armor')){P.armor=60;K.note('You strap on bone armor.','#9ad89a')}}else if(t==='waterskin'&&P.skin>0){P.skin--;P.water=clamp(P.water+22,0,100);K.note('You drink from the waterskin.')}invMenu('items')};grid.append(b)});card.append(grid);card.append(el('p',{style:'opacity:.7'},'Drawings found: '+P.drawings.length+'/10 · Notes: '+P.notes.length))}
  else if(tab==='craft'){RECIPES.forEach(r=>{const ok=Object.entries(r.need).every(([t,v])=>has(t,v));const row=el('div',{class:'hl-rec'+(ok?'':' no')});row.append(el('div',null,el('b',null,IT[r.out].ic+' '+IT[r.out].n+(r.n>1?' ×'+r.n:'')),el('small',null,r.d+' — '+Object.entries(r.need).map(([t,v])=>v+' '+IT[t].ic+' '+IT[t].n.toLowerCase()).join(', '))));const b=el('button',{type:'button',class:'bk-btn'},'Craft');b.onclick=e=>{e.stopPropagation();if(!ok){K.SFX.bad();return}if(!give(r.out,r.n,true))return;Object.entries(r.need).forEach(([t,v])=>take(t,v));if(r.out==='waterskin')P.skin=0;K.SFX.pick();K.note('Crafted '+IT[r.out].n,'#ffd23f');invMenu('craft')};row.append(b);card.append(row)})}
  else if(tab==='journal'){card.append(el('h3',null,'CURRENT GOAL'),el('p',null,goalText()));card.append(el('h3',null,'NOTES'));if(!P.notes.length)card.append(el('p',{style:'opacity:.6'},'Nothing yet.'));P.notes.forEach(n=>{const b=el('button',{type:'button',class:'bk-btn'},NOTES[n].t);b.onclick=e=>{e.stopPropagation();readNote(n)};card.append(b)})}
  else if(tab==='map'){const cv=el('canvas',{class:'hl-mapc',width:512,height:512});drawMap(cv);card.append(cv)}
  const cl=el('button',{type:'button',class:'bk-btn pri'},'Close');cl.onclick=e=>{e.stopPropagation();K.menuOff()};card.append(el('br'),cl)}
function readNote(n){const d=NOTES[n];const card=K.menu('',[]);const pg=el('div',{class:'hl-page'});pg.innerHTML='<h2>'+d.t+'</h2><p>'+d.b+'</p>';card.append(pg);const b=el('button',{type:'button',class:'bk-btn pri'},'Close');b.onclick=e=>{e.stopPropagation();K.menuOff()};card.append(b)}
const MAPC=document.createElement('canvas');MAPC.width=MAPC.height=512;(()=>{const g=MAPC.getContext('2d');const img=g.createImageData(512,512);for(let j=0;j<512;j++)for(let i=0;i<512;i++){const x=-450+i/512*900,z=-450+j/512*900,y=H_(x,z);let r,gg,b;if(inLake(x,z)||y<0){r=120;gg=150;b=150}else if(y<3){r=220;gg=200;b=160}else if(y>100){r=240;gg=240;b=235}else{const s=slopeAt(x,z);r=180-y*.6+s*30;gg=170-y*.3;b=120-y*.3+s*20}const k=(j*512+i)*4;img.data[k]=r;img.data[k+1]=gg;img.data[k+2]=b;img.data[k+3]=255}g.putImageData(img,0,0);
  g.globalAlpha=.08;g.fillStyle='#3a2a10';for(let i=0;i<3000;i++)g.fillRect(Math.random()*512,Math.random()*512,2,2);g.globalAlpha=1})();
const mapXY=(x,z)=>[(x+450)/900*512,(z+450)/900*512];
function drawMap(cv){const g=cv.getContext('2d');g.fillStyle='#e8dcc0';g.fillRect(0,0,512,512);g.globalAlpha=.85;g.drawImage(MAPC,0,0);g.globalAlpha=1;g.font='bold 12px Georgia';g.textAlign='center';
  const mark=(p,t,col,known)=>{if(!known)return;const[x,y]=mapXY(p.x,p.z);g.fillStyle=col;g.beginPath();g.arc(x,y,5,0,TWO);g.fill();g.strokeStyle='#2a2418';g.stroke();g.fillStyle='#2a2418';g.fillText(t,x,y-9)};
  mark(POI.crash,'Crash site','#c8302a',1);mark(POI.v1,'Painted camp','#8a3a2a',P.flags.seen_v1);mark(POI.v2,'West camp','#8a3a2a',P.flags.seen_v2);mark(POI.v3,'River camp','#8a3a2a',P.flags.seen_v3);mark(POI.cave1,'Cave','#2a2418',P.flags.teddy||P.flags.seen_cave1);mark(POI.cave2,'Flooded cave','#2a6a9a',P.flags.got_maxe||P.flags.seen_cave2);mark(POI.climb,'Cliff rope','#5a4a2a',P.flags.got_climbaxe||P.flags.seen_climb);mark(POI.mount,'Relay hut','#5a5a5a',P.flags.got_climbaxe);mark(POI.rope,'Sinkhole','#2a2418',P.flags.got_keycard||P.flags.seen_rope);mark(POI.boat,'Boat','#2a8a3a',P.flags.bossDead);
  BUILT.filter(b=>b.built&&(b.k==='leanto'||b.k==='cabin')).forEach(b=>mark(b.pos,'Shelter','#3a8a3a',1));const[px,py]=mapXY(INSIDE?POI.crash.x:P.pos.x,INSIDE?POI.crash.z:P.pos.z);if(!INSIDE){g.save();g.translate(px,py);g.rotate(-P.yaw);g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.moveTo(0,-9);g.lineTo(6,6);g.lineTo(-6,6);g.closePath();g.fill();g.stroke();g.restore()}}
/* ================= enemies ================= */
const EN=[],BANDS=[];
const LOOKS={can:()=>({shirt:pick([0xc8a890,0xb89880,0xd0b098]),pants:0x5a3a22,skin:pick([0xc8a890,0xb89880,0xd0b098]),hair:0x1a1008,hairStyle:pick(['long','s','bald']),shoes:0x6a4a30}),painted:()=>({shirt:0x9a3a2a,pants:0x3a2a1a,skin:0xa8886a,hair:0x1a1008,hairStyle:'long',mask:0x8a1a1a,shoes:0x3a2a1a}),
  pale:()=>({shirt:0xe8e0d8,pants:0xd8d0c8,skin:0xe8e0d8,hair:0xe8e0d8,hairStyle:'bald',shoes:0xd8d0c8}),mutant:()=>({shirt:0xc8a898,pants:0xb89888,skin:0xc8a898,hairStyle:'bald',hair:0,shoes:0xb89888,bulk:1.7}),boss:()=>({shirt:0xd8b8a8,pants:0xc8a898,skin:0xd8b8a8,hairStyle:'long',hair:0x2a1a10,shoes:0xc8a898,bulk:1.5})};
const ESTAT={can:{hp:60,spd:5.4,dmg:11,reach:1.9,sc:1},painted:{hp:115,spd:5.8,dmg:18,reach:2,sc:1.05},pale:{hp:75,spd:6.2,dmg:15,reach:1.8,sc:.98},mutant:{hp:380,spd:3.6,dmg:30,reach:2.8,sc:1.55},boss:{hp:1600,spd:3.2,dmg:38,reach:3.6,sc:2.3}};
function spawnEnemy(kind,x,z,o){o=o||{};const S2=ESTAT[kind];const lk=LOOKS[kind]();lk.model=kind==='pale'||kind==='mutant'||kind==='boss'?'xbot':lk.hairStyle==='long'?'michelle':'rpm';const ch=K.human(Object.assign({scale:S2.sc},lk));scene.add(ch.g);
  if(kind==='mutant'||kind==='boss'){const n=kind==='boss'?4:2;for(let i=0;i<n;i++){const arm=ch.P.arms[i%2].sh.clone(true);arm.position.y-=.12+(i>>1)*.14;arm.rotation.z=(i%2?1:-1)*(.6+i*.15);ch.P.torso.add(arm);(ch.extra=ch.extra||[]).push(arm)}}
  if(kind==='can'||kind==='painted'){if(Math.random()<.7)K.holdItem(ch,K.gunMesh(Math.random()<.6?'bat':'axe'))}
  const y=o.y!=null?o.y:K.groundAt(x,z,1e4,.3);const e={kind,ch,S:S2,pos:new V3(x,y,z),yaw:rnd(0,TWO),hp:o.hp||S2.hp,max:o.hp||S2.hp,state:o.state||'wander',t:rnd(1,3),cool:rnd(.5,1.5),act:null,actK:0,dead:false,deadT:0,band:o.band||null,burn:0,los:false,losT:0,home:new V3(x,y,z),goal:null,path:null,pathT:0,looted:false,inside:o.inside||null,stun:0,vy:0,wind:0,lastSeen:0,alert:o.alert||0};EN.push(e);return e}
function removeEnemy(e){scene.remove(e.ch.g);const i=EN.indexOf(e);if(i>=0)EN.splice(i,1)}
function scream(p,k){const f=k==='mutant'||k==='boss'?90:rnd(300,420);K.snd({pos:p,tone:f,tone2:f*(k==='mutant'||k==='boss'?.6:1.7),tdur:.6,wave:'sawtooth',tvol:.35,vol:.4,range:90});K.snd({pos:p,noise:1,ft:'bandpass',f:f*2,q:3,dur:.5,vol:.2,range:90})}
function hurtEnemy(e,d,dir,src){if(e.dead)return;e.hp-=d;e.act='hit';e.actK=0;e.stun=Math.max(e.stun,d>25?.5:.25);e.alert=1;if(e.band)e.band.anger=1;if(src==='fire')e.burn=Math.max(e.burn,5);K.burst(e.pos.x,e.pos.y+1.3*e.S.sc,e.pos.z,8,3,.4,.06,.03,0x8a0a0a,0x3a0000,1,9,1);
  if(dir)e.pos.addScaledVector(new V3(dir.x,0,dir.z).normalize(),e.kind==='boss'?.05:.35);if(e.hp<=0){e.dead=true;e.deadT=0;e.ch.fallBack=Math.random()<.5;e.ch.g.rotation.y=e.yaw;K.decal(new V3(e.pos.x,e.pos.y+.03,e.pos.z),new V3(0,1,0),rnd(1.2,2),'blood',.85,120);scream(e.pos,e.kind);if(e.band){e.band.lost++;e.band.morale-=.35}if(e.onDeath)e.onDeath();P.flags.kills=(P.flags.kills||0)+1}else if(Math.random()<.35)scream(e.pos,e.kind)}
function ePlayerDist(e){return Math.hypot(e.pos.x-P.pos.x,e.pos.z-P.pos.z)}
function stepEnemy(e,dt){const C=e.ch;if(e.dead){e.deadT+=dt;K.ragdoll(C,null,dt);C.g.position.copy(e.pos);return}
  if(e.inside!==INSIDE){C.g.visible=false;return}C.g.visible=true;
  e.cool-=dt;e.stun-=dt;if(e.act){e.actK+=dt*(e.act==='hit'?4:e.wind>0?1.1:2.4);if(e.actK>=1)e.act=null}
  if(e.burn>0){e.burn-=dt;hurtEnemy(e,12*dt,null);if(Math.random()<.6)K.emit(K.FX,e.pos.x+rnd(-.3,.3),e.pos.y+rnd(.5,1.8)*e.S.sc,e.pos.z+rnd(-.3,.3),0,rnd(1,2),0,.5,.4,.8,0xffc050,0xff2000,1,-1,1);e.state='flee';e.t=Math.max(e.t,1)}
  const d=ePlayerDist(e);e.losT-=dt;if(e.losT<=0){e.losT=.35;const eye=new V3(e.pos.x,e.pos.y+1.6*e.S.sc,e.pos.z);e.los=!P.dead&&K.los(eye,new V3(P.pos.x,P.pos.y+(P.crouch?1:1.5),P.pos.z))}
  const night=NIGHTF>.5,detect=(night?26:44)*(P.crouch?.5:1)*(P.held==='torch'&&night?1.5:1)*(INSIDE?.7:1);
  if(e.los&&d<detect){e.lastSeen=performance.now()/1000;if(!e.alert&&d<detect*.6){e.alert=1;if(Math.random()<.5)scream(e.pos,e.kind)}}
  const band=e.band;let spd=0,mv=null,st='idle',up=null;const aggro=band?band.aggro+(band.anger||0)+(night?.3:0):1;
  if(e.kind==='mutant'||e.kind==='boss'||e.kind==='pale'){if(e.alert||d<18)e.state=e.state==='flee'?'flee':'attack'}
  else if(e.state!=='flee'&&e.alert){if(band&&band.morale<0){e.state='flee';e.t=rnd(8,14)}else if(aggro>=.55||d<6||band&&band.anger)e.state='attack';else e.state='watch'}
  if(e.stun>0){st='idle'}
  else switch(e.state){
    case'wander':{if(!e.goal||e.pos.distanceTo(e.goal)<2){const c0=band?band.center:e.home;e.goal=new V3(c0.x+rnd(-25,25),0,c0.z+rnd(-25,25));e.goal.y=K.groundAt(e.goal.x,e.goal.z,1e4,.3)}mv=e.goal;spd=1.5;break}
    case'watch':{const want=clamp(d,16,28);if(d<14){mv=e.pos.clone().add(e.pos.clone().sub(P.pos).setY(0).normalize().multiplyScalar(4));spd=3}else if(d>32){mv=P.pos;spd=3.5}else{const side=new V3(-(P.pos.z-e.pos.z),0,P.pos.x-e.pos.x).normalize().multiplyScalar(e.circle||(e.circle=Math.random()<.5?1:-1));mv=e.pos.clone().addScaledVector(side,3);spd=1.4}e.yaw+=angDiff(e.yaw,Math.atan2(P.pos.x-e.pos.x,P.pos.z-e.pos.z))*Math.min(1,dt*3);
      if(Math.random()<dt*.06)scream(e.pos,e.kind);if(performance.now()/1000-e.lastSeen>15){e.alert=0;e.state='wander'}if(band&&Math.random()<dt*.02*aggro)band.anger=Math.min(1,(band.anger||0)+.25);break}
    case'attack':{if(P.dead){e.state='wander';break}const S2=e.S;if(e.wind>0){e.wind-=dt;st='idle';if(e.wind<=0){const inFront=new V3(Math.sin(e.yaw),0,Math.cos(e.yaw)).dot(P.pos.clone().sub(e.pos).setY(0).normalize())>.3;if(d<S2.reach+.6&&inFront&&(e.inside||null)===INSIDE){hurtP(S2.dmg,'melee');K.SFX.punch(P.pos);K.CAM.shake=Math.max(K.CAM.shake,.4)}if(e.kind==='boss'){K.CAM.shake=1;K.burst(e.pos.x,e.pos.y+.2,e.pos.z,30,6,.8,.4,1.4,0x8a7a6a,0x3a3028,.7,-3,1.5,K.SM);if(d<5)hurtP(12,'blast')}e.cool=e.kind==='boss'?rnd(1.2,2):rnd(.9,1.8);if(e.kind==='can'||e.kind==='painted'){e.dodge=.5}}break}
      if(e.dodge>0){e.dodge-=dt;mv=e.pos.clone().add(e.pos.clone().sub(P.pos).setY(0).normalize().multiplyScalar(3));spd=4;break}
      const crowd=EN.filter(o=>o!==e&&!o.dead&&o.state==='attack'&&(o.inside||null)===INSIDE&&ePlayerDist(o)<3.2).length;if(crowd>=2&&d>3.2&&e.kind!=='boss'){if(d>5.5){mv=P.pos;spd=S2.spd*.6}e.yaw+=angDiff(e.yaw,Math.atan2(P.pos.x-e.pos.x,P.pos.z-e.pos.z))*Math.min(1,dt*6);break}
      if(d>S2.reach*.85){mv=P.pos;spd=S2.spd*(e.kind==='boss'&&e.hp<e.max/2?1.4:1)}else{e.yaw+=angDiff(e.yaw,Math.atan2(P.pos.x-e.pos.x,P.pos.z-e.pos.z))*Math.min(1,dt*8);if(e.cool<=0){e.wind=e.kind==='mutant'||e.kind==='boss'?.75:.45;e.act=e.kind==='boss'?'overhead':pick(['overhead','slashR','chop']);e.actK=0;K.SFX.swing(e.pos);if(Math.random()<.4)scream(e.pos,e.kind)}}
      if(band&&band.morale<0&&e.kind!=='mutant'){e.state='flee';e.t=rnd(8,12)}break}
    case'flee':{e.t-=dt;mv=e.pos.clone().add(e.pos.clone().sub(P.pos).setY(0).normalize().multiplyScalar(6));spd=e.S.spd;if(e.t<=0){e.state='wander';e.alert=0;if(band)band.morale=.5}break}}
  if(mv){const dx=mv.x-e.pos.x,dz=mv.z-e.pos.z,L=Math.hypot(dx,dz);if(L>.2){let dir=new V3(dx/L,0,dz/L);if(e.path&&e.path.length){const w=e.path[0];const wx=w.x-e.pos.x,wz=w.z-e.pos.z,wl=Math.hypot(wx,wz);if(wl<.8)e.path.shift();else dir=new V3(wx/wl,0,wz/wl)}
      const ox=e.pos.x,oz=e.pos.z;e.pos.x+=dir.x*spd*dt;e.pos.z+=dir.z*spd*dt;K.collide(e.pos,.4*e.S.sc,e.pos.y,1.7*e.S.sc);const g=K.groundAt(e.pos.x,e.pos.z,e.pos.y+.5,.3);if(!INSIDE&&(g<waterY(e.pos.x,e.pos.z)-1||g-e.pos.y>1.2)){e.pos.x=ox;e.pos.z=oz}else e.pos.y=g;
      const moved=Math.hypot(e.pos.x-ox,e.pos.z-oz)/(spd*dt+1e-6);if(moved<.3&&INSIDE){e.blk=(e.blk||0)+dt;if(e.blk>.6){e.blk=0;e.path=K.astar(e.pos.x,e.pos.z,mv.x,mv.z,2500)}}
      if(e.state!=='watch')e.yaw+=angDiff(e.yaw,Math.atan2(dir.x,dir.z))*Math.min(1,dt*8)}}
  if(st==='idle'&&spd>0)st=spd>4?'sprint':spd>2.4?'run':'walk';if(e.wind>0)st='idle';
  K.pose(C,st,dt,spd,{act:e.act,k:e.actK,up:e.state==='watch'?null:e.state==='attack'?'guard':null});C.g.position.copy(e.pos);C.g.rotation.y=e.yaw;if(C.extra)C.extra.forEach((a,i)=>{a.rotation.x=Math.sin(performance.now()/300+i)*.6-.8})}
function spawnBand(center,n,kind){const b={center:center.clone(),members:[],aggro:clamp(.15+(day-1)*.13,0,1),anger:0,morale:1,lost:0};for(let i=0;i<n;i++){const a=rnd(0,TWO),r=rnd(2,7);const e=spawnEnemy(i===0&&day>=4&&Math.random()<.5?'painted':kind||'can',center.x+Math.cos(a)*r,center.z+Math.sin(a)*r,{band:b});b.members.push(e)}BANDS.push(b);return b}
const ESP={t:5};
function manageEnemies(dt){ESP.t-=dt;if(ESP.t>0||INSIDE||!P.flags.started)return;ESP.t=8;
  for(let i=BANDS.length-1;i>=0;i--){const b=BANDS[i];const alive=b.members.filter(e=>!e.dead);const far=alive.every(e=>ePlayerDist(e)>190);if(!alive.length||far){b.members.forEach(e=>{if(!e.dead||e.deadT>60||far)removeEnemy(e)});BANDS.splice(i,1)}}
  const nightB=NIGHTF>.5?1:0;const want=Math.min(3,(day<=1?1:2)+nightB)+(P.flags.bossDead?-1:0);if(BANDS.length<want&&!P.sleeping){let c2=null;for(let t=0;t<20;t++){const a=rnd(0,TWO),r=rnd(70,120);const x=P.pos.x+Math.cos(a)*r,z=P.pos.z+Math.sin(a)*r;const y=H_(x,z);if(y<4||y>95||inLake(x,z)||Math.hypot(x-POI.sink.x,z-POI.sink.z)<45)continue;c2=new V3(x,y,z);break}
    for(const v of['v1','v2','v3'])if(Math.random()<.35&&POI[v].distanceTo(P.pos)<200&&POI[v].distanceTo(P.pos)>50){c2=POI[v].clone();break}if(c2)spawnBand(c2,Math.min(5,2+Math.floor(day/2)+nightB))}
  if(NIGHTF>.5&&day>=5&&!EN.some(e=>e.kind==='mutant'&&!e.inside&&!e.dead)&&Math.random()<.25){const a=rnd(0,TWO);const x=P.pos.x+Math.cos(a)*90,z=P.pos.z+Math.sin(a)*90;if(H_(x,z)>4&&!inLake(x,z))spawnEnemy('mutant',x,z,{state:'wander'})}}
/* ================= animals ================= */
const ANI=[];const mDeer=mat('deer','#8a6a4a',{roughness:.9}),mDeerL=mat('deerl','#d8c8b0'),mRab=mat('rab','#8a7a6a');
function deerMesh(){const g=new T.Group();const body=new T.Mesh(new T.SphereGeometry(.5,10,8),mDeer);body.scale.set(.75,.75,1.6);body.position.y=1.05;g.add(body);const neck=new T.Mesh(new T.CylinderGeometry(.12,.18,.7,7),mDeer);neck.position.set(0,1.45,.65);neck.rotation.x=.6;g.add(neck);const head=new T.Mesh(new T.SphereGeometry(.17,8,6),mDeer);head.scale.set(1,1,1.6);head.position.set(0,1.78,.88);g.add(head);g.userData.head=head;const tail=new T.Mesh(new T.SphereGeometry(.08,5,4),mDeerL);tail.position.set(0,1.2,-.78);g.add(tail);
  const legs=[];for(const[x,z]of[[.2,.5],[-.2,.5],[.2,-.5],[-.2,-.5]]){const L=new T.Group();L.position.set(x,.9,z);const m=new T.Mesh(new T.CylinderGeometry(.05,.04,.9,5),mDeer);m.position.y=-.45;L.add(m);g.add(L);legs.push(L)}g.userData.legs=legs;if(Math.random()<.5)for(const s of[-1,1]){const a=new T.Mesh(new T.CylinderGeometry(.02,.03,.5,4),mDeerL);a.position.set(s*.1,2.05,.8);a.rotation.z=s*.5;g.add(a)}g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
function rabbitMesh(){const g=new T.Group();const b=new T.Mesh(new T.SphereGeometry(.16,8,6),mRab);b.scale.set(1,.9,1.4);b.position.y=.16;g.add(b);const h=new T.Mesh(new T.SphereGeometry(.09,7,5),mRab);h.position.set(0,.3,.18);g.add(h);for(const s of[-1,1]){const e=new T.Mesh(new T.BoxGeometry(.03,.16,.05),mRab);e.position.set(s*.04,.42,.16);g.add(e)}return g}
function spawnAnimal(kind,x,z){const g=kind==='deer'?deerMesh():rabbitMesh();const y=H_(x,z);g.position.set(x,y,z);scene.add(g);const a={kind,g,pos:new V3(x,y,z),yaw:rnd(0,TWO),hp:kind==='deer'?45:8,state:'graze',t:rnd(2,6),dead:false,deadT:0,ph:0,looted:false};ANI.push(a);return a}
function hurtAnimal(a,d){if(a.dead)return;a.hp-=d;a.state='flee';a.t=8;K.burst(a.pos.x,a.pos.y+.8,a.pos.z,6,2,.3,.05,.02,0x8a0a0a,0x3a0000,1,9,1);if(a.hp<=0){a.dead=true;a.g.rotation.z=PI/2;a.g.position.y=a.pos.y+(a.kind==='deer'?.5:.1)}}
const ASP={t:3};function manageAnimals(dt){ASP.t-=dt;if(ASP.t>0||INSIDE)return;ASP.t=6;for(let i=ANI.length-1;i>=0;i--){const a=ANI[i];if(a.pos.distanceTo(P.pos)>170||(a.dead&&a.deadT>120)){scene.remove(a.g);ANI.splice(i,1)}}
  const nd=ANI.filter(a=>a.kind==='deer'&&!a.dead).length,nr=ANI.filter(a=>a.kind==='rabbit'&&!a.dead).length;const spot=()=>{for(let t=0;t<15;t++){const a=rnd(0,TWO),r=rnd(50,110);const x=P.pos.x+Math.cos(a)*r,z=P.pos.z+Math.sin(a)*r;const y=H_(x,z);if(y>4&&y<90&&!inLake(x,z)&&slopeAt(x,z)<.6&&Math.hypot(x-POI.sink.x,z-POI.sink.z)>45)return[x,z]}return null};
  if(nd<5){const s=spot();if(s)for(let k=0;k<rnd(1,3);k++)spawnAnimal('deer',s[0]+rnd(-4,4),s[1]+rnd(-4,4))}if(nr<6){const s=spot();if(s)spawnAnimal('rabbit',s[0],s[1])}}
function stepAnimal(a,dt){if(INSIDE){a.g.visible=false;return}a.g.visible=true;if(a.dead){a.deadT+=dt;return}const d=a.pos.distanceTo(P.pos);a.t-=dt;if(d<(P.crouch?8:16)&&a.state!=='flee'){a.state='flee';a.t=rnd(5,9)}let spd=0;
  if(a.state==='flee'){const away=a.pos.clone().sub(P.pos).setY(0).normalize();a.yaw+=angDiff(a.yaw,Math.atan2(away.x,away.z))*Math.min(1,dt*5);spd=a.kind==='deer'?9:6;if(a.t<=0)a.state='graze'}else if(a.state==='walk'){spd=a.kind==='deer'?1.4:1.2;if(a.t<=0){a.state='graze';a.t=rnd(3,8)}}else{if(a.t<=0){a.state='walk';a.t=rnd(2,5);a.yaw+=rnd(-1.5,1.5)}}
  if(spd){const ox=a.pos.x,oz=a.pos.z;a.pos.x+=Math.sin(a.yaw)*spd*dt;a.pos.z+=Math.cos(a.yaw)*spd*dt;K.collide(a.pos,.4,a.pos.y,1.4);const g=H_(a.pos.x,a.pos.z);if(g<4.2||inLake(a.pos.x,a.pos.z)||g-a.pos.y>1){a.pos.x=ox;a.pos.z=oz;a.yaw+=PI*.6}else a.pos.y=g}
  a.ph+=dt*spd*1.8;a.g.position.set(a.pos.x,a.pos.y+(a.kind==='rabbit'&&spd?Math.abs(Math.sin(a.ph))*.15:0),a.pos.z);a.g.rotation.y=a.yaw;if(a.kind==='deer'){a.g.userData.legs.forEach((L,i)=>L.rotation.x=spd?Math.sin(a.ph+(i%2?PI:0)+(i>1?PI/2:0))*.6:0);a.g.userData.head.position.y=a.state==='graze'?1.1:1.78}}
/* fish in the lake */
const FISH=[];(()=>{const fm=mat('fishm2','#8a9aa8',{metalness:.4,roughness:.4});for(let i=0;i<14;i++){const m=new T.Mesh(new T.SphereGeometry(.12,7,5),fm);m.scale.set(.6,.6,2);const a=rnd(0,TWO),r=rnd(30,52);const x=POI.lake.x+Math.cos(a)*r,z=POI.lake.z+Math.sin(a)*r;m.position.set(x,LAKEY-.3,z);scene.add(m);FISH.push({m,a,r,sp:rnd(.2,.5)*(Math.random()<.5?1:-1),alive:true,t:0})}})();
function stepFish(dt){for(const f of FISH){if(!f.alive){f.t-=dt;if(f.t<=0){f.alive=true;f.m.visible=true}continue}f.a+=f.sp*dt/f.r*6;const x=POI.lake.x+Math.cos(f.a)*f.r,z=POI.lake.z+Math.sin(f.a)*f.r;f.m.position.set(x,LAKEY-.35,z);f.m.rotation.y=f.a+(f.sp>0?0:PI)}}
/* ================= projectiles ================= */
const PROJ=[],FIREZ=[];const arrowG=(()=>{const g=new T.CylinderGeometry(.012,.012,.8,4);g.rotateX(PI/2);return g})(),mArrow=mat('arrow2','#8a6a4a');const bottleG=new T.CylinderGeometry(.05,.06,.25,7);
function shootArrow(power){if(!take('arrow'))return;const d=new V3();camera.getWorldDirection(d);const o=camera.getWorldPosition(new V3()).addScaledVector(d,.5);const m=new T.Mesh(arrowG,mArrow);m.position.copy(o);scene.add(m);PROJ.push({k:'arrow',m,v:d.multiplyScalar(22+power*40),t:0,dmg:28+power*42});K.SFX.whoosh(o)}
function throwMolotov(){if(!take('molotov'))return;const d=new V3();camera.getWorldDirection(d);const o=camera.getWorldPosition(new V3()).addScaledVector(d,.5);const m=new T.Mesh(bottleG,itemMeshMat.booze);m.position.copy(o);scene.add(m);const v=d.multiplyScalar(16);v.y+=4;PROJ.push({k:'molotov',m,v,t:0});K.SFX.whoosh(o)}
function stepProj(dt){for(let i=PROJ.length-1;i>=0;i--){const p=PROJ[i];p.t+=dt;if(p.stuck){if(p.t>30){scene.remove(p.m);PROJ.splice(i,1)}continue}const o=p.m.position.clone();p.v.y-=(p.k==='arrow'?7:12)*dt;const step=p.v.clone().multiplyScalar(dt),L=step.length(),dir=step.clone().divideScalar(L);let hit=null,best=L;
    for(const e of EN){if(e.dead||e.inside!==INSIDE)continue;const q=e.pos;const r=.45*e.S.sc;const oc=new V3(o.x-q.x,0,o.z-q.z);const dd=new V3(dir.x,0,dir.z);const a=dd.lengthSq();if(a<1e-6)continue;const b=2*oc.dot(dd),cc=oc.lengthSq()-r*r,disc=b*b-4*a*cc;if(disc<0)continue;const t=(-b-Math.sqrt(disc))/(2*a);if(t<0||t>best)continue;const y=o.y+dir.y*t-q.y;if(y<0||y>1.8*e.S.sc)continue;best=t;hit={e,head:y>1.5*e.S.sc}}
    for(const a of ANI){if(a.dead)continue;const c2=a.pos.clone().add(new V3(0,a.kind==='deer'?1:.2,0));const oc=o.clone().sub(c2);const b=oc.dot(dir),cc=oc.lengthSq()-(a.kind==='deer'?.7:.25)**2,disc=b*b-cc;if(disc<0)continue;const t=-b-Math.sqrt(disc);if(t>0&&t<best){best=t;hit={a}}}
    const wh=K.rayBoxes(o,dir,best,bx=>bx.tag==='soft');if(wh&&wh.t<best){best=wh.t;hit={w:wh}}
    const np=o.clone().addScaledVector(dir,best);
    if(p.k==='arrow'){p.m.position.copy(np);p.m.lookAt(np.clone().add(dir));if(hit){if(hit.e){hurtEnemy(hit.e,p.dmg*(hit.head?2:1),dir);K.hitmark(hit.e.dead);scene.remove(p.m);PROJ.splice(i,1)}else if(hit.a){hurtAnimal(hit.a,p.dmg);K.hitmark(hit.a.dead);scene.remove(p.m);PROJ.splice(i,1)}else{p.stuck=1;p.t=0;K.snd({pos:np,noise:1,f:800,dur:.06,vol:.3});if(Math.random()<.6){scene.remove(p.m);PROJ.splice(i,1);dropItem('arrow',np.x,np.z,1,{y:np.y-.05})}}}else if(p.t>6){scene.remove(p.m);PROJ.splice(i,1)}}
    else{p.m.position.copy(np);p.m.rotation.x+=dt*10;if(hit||p.t>5){scene.remove(p.m);PROJ.splice(i,1);const fp=np.clone();FIREZ.push({pos:fp,t:9});K.snd({pos:fp,noise:1,ft:'highpass',f:2500,dur:.2,vol:.5});K.SFX.boom(fp,.4);K.flash(fp,0xff8030,25,16,.5)}}}
  for(let i=FIREZ.length-1;i>=0;i--){const f=FIREZ[i];f.t-=dt;if(f.t<=0){FIREZ.splice(i,1);continue}for(let k=0;k<3;k++)K.emit(K.FX,f.pos.x+rnd(-2,2),f.pos.y+.1,f.pos.z+rnd(-2,2),0,rnd(1,3),0,.6,.5,1.2,0xffc050,0xff2000,1,-1,1);for(const e of EN){if(!e.dead&&e.pos.distanceTo(f.pos)<3)hurtEnemy(e,25*dt,null,'fire')}if(P.pos.distanceTo(f.pos)<2.5)hurtP(12*dt,'fire')}}
/* ================= sky, time, weather ================= */
const sky=K.skyDome({top:0x4a6a98,hor:0xc8d4d0,bot:0x5a6a5a});const LT=K.sunLight({size:40,int:1.8,hemi:.65,map:2048,follow:P.pos});scene.fog=new T.FogExp2(lin(0xb8c8c0),.009);
const ENVT=K.env('forest',{int:.7});let envLast=-1;
const SKY=[[0,0x04060c,0x0a1018,.12,.1],[5,0x10141e,0x2a2a38,.2,.16],[6.5,0x4a5a88,0xe0a080,.8,.45],[9,0x4a6a98,0xc8d4d0,1.8,.65],[16,0x4a6a98,0xc8d4d0,1.8,.65],[18.5,0x3a4070,0xe08a5a,.8,.45],[20,0x0e1220,0x2a2030,.2,.14],[22,0x04060c,0x0a1018,.12,.1],[24,0x04060c,0x0a1018,.12,.1]];
let NIGHTF=0;const cA=new T.Color(),cB=new T.Color();const W={rain:0,rainT:0,next:rnd(.3,1)};
function setSky(h){let i=0;while(i<SKY.length-2&&SKY[i+1][0]<=h)i++;const a=SKY[i],b=SKY[i+1],t=clamp((h-a[0])/(b[0]-a[0]),0,1);const U=sky.userData.U;const rainK=W.rain*.6;U.top.value.copy(cA.set(a[1]).lerp(cB.set(b[1]),t)).convertSRGBToLinear().lerp(new T.Color(.25,.27,.3),rainK*(1-NIGHTF));U.hor.value.copy(cA.set(a[2]).lerp(cB.set(b[2]),t)).convertSRGBToLinear().lerp(new T.Color(.35,.37,.38),rainK*(1-NIGHTF));U.bot.value.copy(U.hor.value).multiplyScalar(.6);
  const sa=(h-6)/12*PI,sunUp=Math.sin(sa);LT.dir.set(Math.cos(sa)*.7,Math.max(.3,Math.abs(sunUp)),.4).normalize();U.sunD.value.set(Math.cos(sa),sunUp,.4).normalize();U.stars.value=clamp(-sunUp*3,0,1)*(1-W.rain);U.moon.value=sunUp<0?1:0;
  NIGHTF=clamp((.12-sunUp)*3,0,1);LT.sun.intensity=lerp(a[3],b[3],t)*(1-rainK*.7);LT.sun.color.set(sunUp>0?(sunUp<.3?0xffc890:0xfff0dc):0x7a90c0).convertSRGBToLinear();LT.hemi.intensity=lerp(a[4],b[4],t)*(1-rainK*.4)*(ENVT?.5:1);if(ENVT){const ei=lerp(.7,.05,NIGHTF)*(1-rainK*.4);if(Math.abs(ei-envLast)>.04){envLast=ei;K.envInt(ei)}}
  scene.fog.color.copy(U.hor.value);scene.fog.density=.007+NIGHTF*.012+W.rain*.012;K.renderer.toneMappingExposure=lerp(1,1.3,NIGHTF)}
let rainL=null,windL=null;
function stepWeather(dt){const gh=dt*24/1200;W.next-=gh;if(W.next<=0){if(W.rain<.1){W.rainT=rnd(1,3);W.next=W.rainT}else{W.rainT=0;W.next=rnd(4,14)}}const tgt=W.rainT>0&&W.next>0&&W.rainT?1:0;if(W.rainT>0){W.rainT-=gh}W.rain=lerp(W.rain,W.rainT>0?1:0,Math.min(1,dt*.3));
  if(W.rain>.05&&!INSIDE){const cp=camera.position;for(let i=0;i<Math.floor(W.rain*14);i++)K.emit(K.SM,cp.x+rnd(-14,14),cp.y+rnd(6,12),cp.z+rnd(-14,14),0,-22,0,.6,.06,.06,0xaabbcc,0xaabbcc,.5,0,0)}
  if(!rainL)rainL=K.loop({noise:1,f:2600,ft:'lowpass'});if(rainL)rainL.set(INSIDE?0:W.rain*.12);if(!windL)windL=K.loop({noise:1,f:400,ft:'lowpass'});if(windL)windL.set(INSIDE?.03:.035+W.rain*.03)}
/* ================= story ================= */
const SAM=(t)=>({who:'SAM',col:'#8ad0ff',text:t});
function goalText(){const f=P.flags;if(!f.got_axe)return'Search the plane wreckage for something useful.';if(!f.firstShelter)return'Build a shelter before nightfall (Backpack → Build, or press B).';if(!f.firstFire)return'Build a campfire. You\'ll need sticks and rocks.';if(!f.got_teddy)return'Find where they took Lily. The painted man went north, toward the smoke.';
  if(!f.got_rebreather)return'Lily\'s bear was at the camp. Search the cave on the west coast.';if(!f.got_climbaxe)return'Use the rebreather to swim through the flooded cave by the lake.';if(!f.got_keycard)return'Climb the rope on the mountain\'s cliff face and search the relay hut at the summit.';if(!f.labOpen)return'Climb down the rope into the sinkhole and open the lab door.';
  if(!f.bossDead)return'Find Lily inside Research Station 4.';if(!f.lilyFree)return'Free Lily from the pod.';return'Take Lily to the research boat on the south beach.'}
let lastGoal='';function story(){const g=goalText();if(g!==lastGoal){lastGoal=g;K.objective(g);clearTimeout(story.t);story.t=setTimeout(()=>K.objective(null),9000);K.snd({tone:660,tdur:.25,wave:'triangle',tvol:.3,vol:.15})}}
function onKeyItem(t){const L={axe:['An axe. I can chop trees, build a shelter. And fight, if I have to.'],teddy:['Mr. Buttons. She never goes anywhere without him. She was here.','There are drag marks leading west, toward a cave on the coast.'],rebreather:['A diving rebreather. The memo said the divers used the flooded caves.'],maxe:['A proper axe. This will cut through anything.'],climbaxe:['A climbing axe. I could get up that cliff on the mountain now.'],keycard:['Ardent Biolabs. Level four. The lab is under the sinkhole.']}[t];if(L)K.say(L.map(SAM));if(t==='teddy')P.flags.seen_cave1=1;if(t==='rebreather')P.flags.seen_cave2=1;if(t==='climbaxe')P.flags.seen_climb=1;if(t==='keycard'){P.flags.seen_rope=1;dropNoteOnce('n4')}if(TOOLS.includes(t)&&P.held==='none')equip(t);setTimeout(story,400);saveGame(true)}
function dropNoteOnce(n){if(!P.notes.includes(n)){P.notes.push(n);K.note('New note: '+NOTES[n].t+' (Backpack → Journal)','#e8dcc0')}}
/* summit hut: keycard */
dropItem('keycard',POI.mount.x+6,POI.mount.z+3.2,1);
/* ================= interiors: enter/leave ================= */
let lily=null;
function setInside(key){INSIDE=key;const out=!key;WORLD.visible=out;ocean.visible=out;lake.visible=out;sky.visible=out;LT.sun.intensity=out?LT.sun.intensity:0;scene.fog.color.set(out?0xb8c8c0:0x000000);Object.values(IN).forEach(I=>I.g.visible=I.key===key);[K.planeG,K.boatG].forEach(g=>g&&(g.visible=out));
  scene.children.forEach(o=>{if(o.userData&&o.userData.outdoor)o.visible=out});FIRES.forEach(f=>f.L.visible=out)}
function enterInterior(key){const I=IN[key];K.fade(true,()=>{setInside(key);P.pos.copy(I.spawn).add(new V3(0,0,1.2));P.vy=0;P.yaw=PI;if(!I.spawned){I.spawned=1;I.monsters.forEach(m=>spawnEnemy(m.t,m.p.x,m.p.z,{y:m.p.y,inside:key}));if(key==='lab'&&I.bossAt&&!P.flags.bossDead){const b=spawnEnemy('boss',I.bossAt.x,I.bossAt.z,{y:I.bossAt.y,inside:key});b.onDeath=()=>{P.flags.bossDead=1;K.banner('THE MOTHER IS DEAD','','#ffd23f',4000);K.say([SAM('It\'s over. Lily... Lily!')]);story();saveGame(true)};I.boss=b}}
    K.buildNav(I.D.at.x-4,I.D.at.z-4,I.D.at.x+I.D.rows[0].length*TS+4,I.D.at.z+I.D.rows.length*TS+4,1,.35);if(lily){lily.pos.copy(P.pos).add(new V3(1,0,0))}K.banner(I.D.name.toUpperCase(),'','#c8d8d0',2400);K.fade(false)},700)}
function leaveInterior(){const key=INSIDE;const back=key==='lab'?POI.labDoor:key==='cave1'?POI.cave1:POI.cave2;K.fade(true,()=>{setInside(null);const f=back.face!=null?back.face:0;P.pos.set(back.x+Math.sin(f)*5,0,back.z+Math.cos(f)*5);P.pos.y=H_(P.pos.x,P.pos.z);if(key==='lab')P.pos.set(POI.labDoor.x,H_(POI.labDoor.x,POI.labDoor.z+2),POI.labDoor.z+2);if(lily)lily.pos.copy(P.pos).add(new V3(1,0,1));K.fade(false)},700)}
/* ================= interaction ================= */
const camDir=()=>{const d=new V3();camera.getWorldDirection(d);return d};
function facing(p,maxD,dot){const cp=camera.position,d=p.clone().sub(cp);const L=d.length();if(L>maxD)return -1;return d.divideScalar(L).dot(camDir())>(dot||.6)?L:-1}
function findTarget(){const cands=[];const add=(d,text,fn,key)=>{if(d>=0)cands.push({d,text,fn,key:key||'E'})};const pp=P.pos;
  for(const b of BUILT){if(pp.distanceTo(b.pos)>b.def.r+2.2)continue;const d=facing(b.pos.clone().add(new V3(0,.6,0)),b.def.r+2.6,.35);if(!b.built)add(d,'Add materials to '+b.def.n+' ('+Object.entries(b.need).filter(([,v])=>v>0).map(([t,v])=>v+' '+IT[t].ic).join(' ')+')',()=>addMaterial(b));
    else if(b.k==='fire')add(d,has('meat')||has('fish')?'Cook food':b.fire.lit?'Add a stick to the fire':'Light the fire',()=>useFire(b));else if(b.k==='leanto'||b.k==='cabin')add(d,'Sleep & save',()=>sleep(b));else if(b.k==='rain')add(d,b.water>0?'Drink clean water':'Empty. Wait for rain.',()=>{if(b.water>0){b.water--;P.water=clamp(P.water+35,0,100);K.snd({noise:1,f:700,dur:.3,vol:.25});if(P.skin!=null&&P.skin<3&&has('waterskin'))P.skin=3}});else if(b.k==='trap')add(d,b.caught?'Take the rabbit':'Trap is set',()=>{if(b.caught){b.caught=0;give('meat',1);b.t=rnd(90,160)}});else if(b.k==='effigy')add(d,b.lit>0?'The effigy burns':'Light the effigy',()=>{if(has('lighter')||has('torch')){b.lit=90;K.note('The effigy burns. They won\'t come near it.','#ffb07a')}else K.note('You need a lighter.')})}
  for(const it of WITEMS){if(!it.alive||Math.abs(it.pos.x-pp.x)>3||Math.abs(it.pos.z-pp.z)>3)continue;const d=facing(it.pos.clone().add(new V3(0,.1,0)),2.6,.75);const nm=it.t==='note'?NOTES[it.note].t:it.t==='drawing'?'Child\'s drawing':IT[it.t].n+(it.n>1?' ×'+it.n:'');add(d,'Pick up '+nm,()=>pickItem(it))}
  for(const L of LOOT){if(L.opened||Math.abs(L.pos.x-pp.x)>3||Math.abs(L.pos.z-pp.z)>3||Math.abs(L.pos.y-pp.y)>3)continue;add(facing(L.m.position,2.6,.6),L.kind==='case'?'Open suitcase':L.kind==='bag'?'Search bag':'Open crate',()=>openLoot(L))}
  if(!INSIDE)for(const b of BUSH){if(Math.abs(b.x-pp.x)>2.6||Math.abs(b.z-pp.z)>2.6)continue;const d=facing(new V3(b.x,b.y+.5,b.z),2.8,.55);if(b.berry&&!b.picked)add(d,'Pick '+IT[b.berry].n.toLowerCase(),()=>{b.picked=1;b.regrow=600;berriesVisible(b,false);give(b.berry,3)});else if(b.cd<=0)add(d+.3,'Take leaves',()=>{b.cd=90;give('leaf',3)})}
  for(const e of EN){if(!e.dead||e.looted||e.inside!==INSIDE||e.pos.distanceTo(pp)>2.8)continue;add(facing(e.pos.clone().add(new V3(0,.3,0)),2.8,.4),'Search body',()=>{e.looted=1;give('bone',Math.floor(rnd(2,4)));if(Math.random()<.8)give('skull',1);if(Math.random()<.3)give('cloth',1);if(Math.random()<.2)give('booze',1);if(Math.random()<.2)give('rope',1)})}
  for(const a of ANI){if(!a.dead||a.looted||a.pos.distanceTo(pp)>2.8)continue;add(facing(a.pos.clone().add(new V3(0,.4,0)),3,.4),'Butcher the '+a.kind,()=>{a.looted=1;give('meat',a.kind==='deer'?2:1);if(a.kind==='deer')give('hide',1);scene.remove(a.g)})}
  if(!INSIDE){const wy=waterY(pp.x,pp.z);const d=camDir();if((P.swim||d.y<-.35)&&(P.swim||(()=>{const t=(wy-camera.position.y)/d.y;if(t<0||t>3.2)return false;const q=camera.position.clone().addScaledVector(d,t);return H_(q.x,q.z)<wy})())){const salty=!inLake(pp.x,pp.z)&&!inLake(pp.x+d.x*2,pp.z+d.z*2);add(1.5,salty?'Drink sea water (salty!)':'Drink water'+(has('waterskin')?' & fill waterskin':''),()=>{if(salty){P.water=clamp(P.water+8,0,100);hurtP(4,'sick');K.note('Ugh. Salt water.','#ff8a6a')}else{P.water=clamp(P.water+30,0,100);if(has('waterskin'))P.skin=3}K.snd({noise:1,f:700,dur:.3,vol:.25})})}}
  // places
  const near=(p,r)=>p&&Math.hypot(p.x-pp.x,p.z-pp.z)<r&&Math.abs((p.y||0)-pp.y)<8;
  if(!INSIDE){if(near(POI.cave1,5))add(1,'Enter the cave',()=>enterInterior('cave1'));if(near(POI.cave2,5))add(1,'Enter the flooded cave',()=>enterInterior('cave2'));
    if(near(POI.climb,4))add(1,has('climbaxe')?'Climb the cliff':'Climb the cliff (needs a climbing axe)',()=>{if(!has('climbaxe')){K.note('The rock is sheer. You need something to climb with.','#ff8a6a');return}climbTo(POI.summitIn,'up')});
    if(near(POI.summitIn,4))add(1,'Climb down the cliff',()=>climbTo(POI.climb.clone().add(new V3(-3,0,3)),'down'));
    if(near(POI.rope,3.5))add(1,has('climbaxe')?'Climb down into the sinkhole':'Climb down (needs a climbing axe)',()=>{if(!has('climbaxe')){K.note('Too steep to climb down by hand.','#ff8a6a');return}climbTo(POI.ropeIn,'down')});
    if(near(POI.ropeIn,4))add(1,'Climb the rope up',()=>climbTo(POI.rope,'up'));
    if(near(POI.labDoor,3.5))add(1,has('keycard')?'Swipe the keycard':'The door is locked',()=>{if(!has('keycard')){K.note('A card reader blinks red.','#ff8a6a');return}P.flags.labOpen=1;K.labPad.material.emissive=lin(0x20ff40);K.snd({tone:880,tdur:.15,wave:'square',tvol:.2,vol:.2});story();enterInterior('lab')});
    if(near(POI.boat,9)&&P.flags.lilyFree)add(1,'Leave the island with Lily',()=>ending())}
  else{const I=IN[INSIDE];if(I.exit&&near(I.exit,2.5))add(1,'Leave',()=>leaveInterior());if(INSIDE==='lab'&&I.podAt&&near(I.podAt,3)&&!P.flags.lilyFree)add(1,P.flags.bossDead?'Open the pod':'The pod is locked tight',()=>{if(!P.flags.bossDead)return;freeLily()});for(const dr of I.doors)if(!dr.open&&near(dr.p,3))add(1,'Open door',()=>{dr.open=1;dr.m.visible=false;K.removeBox(dr.box);K.snd({noise:1,f:300,dur:.5,vol:.3})})}
  cands.sort((a,b)=>a.d-b.d);return cands[0]||null}
function pickItem(it){if(it.t==='note'){P.notes.includes(it.note)||P.notes.push(it.note);removeItem(it);readNote(it.note);if(it.note==='n1')P.flags.seen_cave1=1;return}if(it.t==='drawing'){P.drawings.includes(it.drawing)||P.drawings.push(it.drawing);removeItem(it);K.banner('LILY\'S DRAWING',P.drawings.length+' / 10','#ffe0b0',2200);if(P.drawings.length===10)dropNoteOnce('n5');return}
  const got=give(it.t,it.n);if(got>=it.n)removeItem(it);else it.n-=got;K.SFX.pick()}
function openLoot(L){L.opened=true;L.m.material=L.m.material.clone();L.m.material.color.multiplyScalar(.6);for(const t in L.loot)give(t,L.loot[t]);K.snd({noise:1,f:500,dur:.2,vol:.3})}
function useFire(b){const f=b.fire;if(has('meat')){take('meat');give('cooked',1);K.snd({noise:1,f:3000,ft:'highpass',dur:.8,vol:.15});return}if(has('fish')){take('fish');give('cfish',1);return}if(take('stick')){f.fuel=Math.min(400,f.fuel+60);f.lit=true;K.note('The fire flares up.')}else K.note('You need a stick to feed the fire.')}
function climbTo(p,dir){K.fade(true,()=>{P.pos.set(p.x,H_(p.x,p.z),p.z);P.vy=0;P.stam=Math.max(0,P.stam-40);K.fade(false);K.note(dir==='up'?'You haul yourself up.':'You climb down.')},900);K.snd({noise:1,f:900,dur:.6,vol:.25})}
function sleep(b){if(EN.some(e=>!e.dead&&e.alert&&e.pos.distanceTo(P.pos)<45&&e.inside===INSIDE)){K.note('You can\'t sleep with enemies nearby.','#ff8a6a');return}if(P.energy>80&&NIGHTF<.5){K.note('You\'re not tired. (Saved.)','#aee8ff');saveGame();return}P.sleeping=1;K.fade(true,()=>{const wake=NIGHTF>.4||hour>18?7:hour+4;const adv=((wake-hour)+24)%24||4;hour=(hour+adv)%24;if(wake===7&&adv>0){day++}P.energy=100;P.food=clamp(P.food-adv*1.6,0,100);P.water=clamp(P.water-adv*2,0,100);P.hp=clamp(P.hp+20,0,100);BANDS.forEach(bd=>bd.members.forEach(e=>{if(!e.dead)removeEnemy(e)}));BANDS.length=0;saveGame();P.sleeping=0;K.fade(false);K.banner('DAY '+day,'Game saved','#e8dcc0',2400)},900)}
function freeLily(){P.flags.lilyFree=1;const I=IN.lab;I.pod.visible=false;lily=spawnEnemy('can',I.podAt.x,I.podAt.z+1,{y:I.podAt.y,inside:null});scene.remove(lily.ch.g);const ch=K.human({model:'michelle',scale:.62,shirt:0xe8a0c0,pants:0x3a4a8a,skin:0xe8c0a0,hair:0x8a5a2a,hairStyle:'long'});lily.ch=ch;scene.add(ch.g);lily.isLily=1;EN.splice(EN.indexOf(lily),1);
  K.cine(true);K.say([{who:'LILY',col:'#ffb0d0',text:'Daddy? Daddy!',pitch:1.6},SAM('I\'ve got you. I\'ve got you, sweetheart. We\'re going home.'),{who:'LILY',col:'#ffb0d0',text:'Did you bring Mr. Buttons?',pitch:1.6},SAM('He\'s right here. Come on. There\'s a boat on the south beach.')],()=>{K.cine(false);story();saveGame(true)})}
function stepLily(dt){if(!lily)return;const d=lily.pos.distanceTo(P.pos);if(d>30||(lily.in!==INSIDE)){lily.pos.copy(P.pos).add(new V3(1,0,1));lily.in=INSIDE}let spd=0;if(d>2.5){const dir=P.pos.clone().sub(lily.pos).setY(0).normalize();spd=d>6?5.5:3;lily.pos.addScaledVector(dir,spd*dt);K.collide(lily.pos,.25,lily.pos.y,1.1);lily.pos.y=K.groundAt(lily.pos.x,lily.pos.z,lily.pos.y+.5,.2);lily.yaw=Math.atan2(dir.x,dir.z)}K.pose(lily.ch,spd>4?'run':spd>0?'walk':'idle',dt,spd,{});lily.ch.g.position.copy(lily.pos);lily.ch.g.rotation.y=lily.yaw}
function ending(){P.flags.done=1;saveGame(true);c.best(10);K.cine(true);K.fade(true,()=>{K.fade(false);ENDING.on=true;ENDING.t=0},900)}
const ENDING={on:false,t:0};
function die(why){if(P.dead)return;P.dead=true;K.banner('YOU DIED','','#c8201a',3000);K.SFX.fail();setTimeout(()=>{if(!P.captured&&!P.flags.bossDead){P.captured=true;K.fade(true,()=>{P.dead=false;P.hp=40;P.food=Math.max(P.food,30);P.water=Math.max(P.water,30);setInside(null);enterInterior('cave1');K.say([SAM('Where... where am I? They dragged me down here.'),SAM('I have to get out. Lily needs me.')])},600)}else{const card=K.menu('<h2>YOU DIED</h2><p>'+(K.SAVE.get('save',null)?'Load your last save at a shelter, or start over.':'Start over?')+'</p>',[['Load last save',()=>{K.menuOff();loadGame()},'pri'],['New game',()=>{K.menuOff();K.SAVE.set('save',null);newGame()}]])}},3200)}
/* ================= save / load ================= */
function saveGame(quiet){if(P.dead)return;K.SAVE.set('save',{p:{hp:P.hp,food:P.food,water:P.water,energy:P.energy,armor:P.armor,inv:P.inv,flags:P.flags,notes:P.notes,drawings:P.drawings,held:P.held,skin:P.skin,captured:P.captured,x:P.pos.x,y:P.pos.y,z:P.pos.z,inside:INSIDE},hour,day,built:BUILT.map(b=>({k:b.k,x:b.pos.x,y:b.pos.y,z:b.pos.z,r:b.rot,need:b.need,built:b.built})),trees:TREES.map((t,i)=>t.alive?-1:i).filter(i=>i>=0),loot:LOOT.filter(L=>L.opened).map(L=>L.id)});
  const ch=P.flags.done?10:['got_axe','firstShelter','firstFire','got_teddy','got_rebreather','got_climbaxe','got_keycard','labOpen','bossDead','lilyFree'].filter(k=>P.flags[k]).length;c.best(ch);if(!quiet)K.note('Saved.','#aee8ff')}
function loadGame(){const S2=K.SAVE.get('save',null);if(!S2)return false;const p=S2.p;Object.assign(P,{hp:Math.max(30,p.hp),food:p.food,water:p.water,energy:p.energy,armor:p.armor||0,inv:p.inv||{},flags:p.flags||{},notes:p.notes||[],drawings:p.drawings||[],skin:p.skin,captured:p.captured,dead:false});hour=S2.hour;day=S2.day;
  S2.trees.forEach(i=>{const t=TREES[i];if(t&&t.alive)hideTree(t)});S2.loot.forEach(id=>{const L=LOOT.find(q=>q.id===id);if(L&&!L.opened){L.opened=true;L.m.material=L.m.material.clone();L.m.material.color.multiplyScalar(.6)}});
  BUILT.slice().forEach(b=>{scene.remove(b.g)});BUILT.length=0;S2.built.forEach(q=>{const b=placeBlueprint(q.k,new V3(q.x,q.y,q.z),q.r);b.need=q.need;if(q.built)completeStruct(b)});K.DQ.q.length=0;
  for(const it of WITEMS.slice()){if((it.t==='note'&&P.notes.includes(it.note))||(it.t==='drawing'&&P.drawings.includes(it.drawing))||(IT[it.t]&&(IT[it.t].key||IT[it.t].tool)&&P.flags['got_'+it.t]))removeItem(it)}
  if(P.flags.lilyFree&&!lily){freeLily();K.DQ.q.length=0;K.cine(false)}if(P.flags.bossDead)IN.lab.spawned=1;
  setInside(null);if(p.inside){enterInterior(p.inside)}else{P.pos.set(p.x,p.y,p.z)}equip(p.held&&has(p.held)?p.held:'none');P.flags.started=1;lastGoal='';story();return true}
/* ================= player update ================= */
let swingLatch=false,useLatch=false,ghostLatch=false,bobT=0,fallFrom=null;
function stepPlayer(dt){const I=input,k=I.keys;if(P.dead||ENDING.on)return;
  const sens=.0022;P.yaw-=I.mdx*sens;P.pitch=clamp(P.pitch-I.mdy*sens,-1.45,1.45);
  let mx=(k.d||k.arrowright?1:0)-(k.a||k.arrowleft?1:0)+I.joy.x,mz=(k.w||k.arrowup?1:0)-(k.s||k.arrowdown?1:0)-I.joy.y;const ml=Math.hypot(mx,mz);if(ml>1){mx/=ml;mz/=ml}
  const fw=new V3(-Math.sin(P.yaw),0,-Math.cos(P.yaw)),rt=new V3(Math.cos(P.yaw),0,-Math.sin(P.yaw));const dir=fw.multiplyScalar(mz).addScaledVector(rt,mx);
  const tile=INSIDE?tileAt(IN[INSIDE],P.pos.x,P.pos.z):null;const inW=tile==='W';
  const outSwim=!INSIDE&&H_(P.pos.x,P.pos.z)<waterY(P.pos.x,P.pos.z)-1.3;P.swim=inW||outSwim;
  const sprint=k.shift&&P.stam>4&&ml>.1&&!P.crouch&&!P.swim;const spd=P.swim?2.4:P.crouch?1.9:sprint?6.8:3.9;if(sprint)P.stam-=14*dt;
  const ox=P.pos.x,oz=P.pos.z,oy=P.pos.y;if(ml>.05){P.pos.x+=dir.x*spd*dt;P.pos.z+=dir.z*spd*dt}
  K.collide(P.pos,.32,P.pos.y,P.crouch?1.2:1.7);
  if(!INSIDE&&Math.hypot(P.pos.x,P.pos.z)>420){P.pos.x=ox;P.pos.z=oz;K.note('You can\'t swim any further.')}
  if(inW||(INSIDE&&tileAt(IN[INSIDE],P.pos.x,P.pos.z)==='W')){const at=IN[INSIDE].D.at.y;P.pos.y=at-1.25;P.vy=0;P.onG=true;P.uw=true}
  else if(outSwim){P.pos.y=waterY(P.pos.x,P.pos.z)-1.35;P.vy=0;P.onG=true;P.uw=false}
  else{P.uw=false;const g=K.groundAt(P.pos.x,P.pos.z,P.pos.y+(INSIDE&&tile==='W'?3:.5),.25);const hstep=Math.hypot(P.pos.x-ox,P.pos.z-oz);
    if(INSIDE&&tile==='W'&&g>P.pos.y){P.pos.y=g;P.vy=0}
    else if(g-P.pos.y>Math.max(.55,hstep*1.3)&&P.onG){P.pos.x=ox;P.pos.z=oz}
    const g2=K.groundAt(P.pos.x,P.pos.z,P.pos.y+.5,.25);const jp=k[' ']||I.jumpBtn;if(jp&&P.onG&&P.stam>5&&!P.jl){P.vy=5.2;P.onG=false;P.stam-=6}P.jl=jp;
    P.vy-=20*dt;P.pos.y+=P.vy*dt;if(P.pos.y<=g2){if(!P.onG&&P.vy<-12)hurtP((-P.vy-12)*7,'fall');P.pos.y=g2;P.vy=0;P.onG=true}else if(P.pos.y-g2>.35)P.onG=false}
  // air
  if(P.uw){P.air-=dt/(has('rebreather')?90:12);if(P.air<=0){P.air=0;hurtP(12*dt,'drown')}}else P.air=Math.min(1,P.air+dt*.5);HUD.air.style.display=P.air<.999?'block':'none';HUD.air.firstChild.style.width=P.air*100+'%';HUD.uw.style.display=P.uw?'block':'none';
  // camera
  const moving=ml>.1&&P.onG;bobT+=dt*(moving?spd*2.1:0);const bob=moving&&!P.swim?Math.sin(bobT)*.045:0;const eye=P.swim&&!P.uw?1.62:P.crouch?1.05:1.62;camera.position.set(P.pos.x,P.pos.y+eye+bob,P.pos.z);camera.rotation.set(P.pitch,P.yaw,0,'YXZ');
  if(K.CAM.shake>0){K.CAM.shake=Math.max(0,K.CAM.shake-dt*2);const s=K.CAM.shake*K.CAM.shake*.05;camera.position.x+=rnd(-s,s);camera.position.y+=rnd(-s,s)}
  const zoom=P.held==='bow'&&(I.right||P.bow>0)?55:72;if(Math.abs(camera.fov-zoom)>.2){camera.fov=lerp(camera.fov,zoom,Math.min(1,dt*8));camera.updateProjectionMatrix()}
  // stats
  const gh=dt*24/1200;P.food-=gh*1.6;P.water-=gh*2.2*(sprint?1.5:1);P.energy-=gh*1.1+(sprint?dt*.15:0);P.food=clamp(P.food,0,100);P.water=clamp(P.water,0,100);P.energy=clamp(P.energy,0,100);const cap=20+P.energy*.8;if(!sprint&&!P.swing)P.stam=Math.min(cap,P.stam+dt*14);P.stam=clamp(P.stam,0,100);
  if(P.food<=0||P.water<=0)hurtP(dt*1.2,'starve');else if(P.food>45&&P.water>45&&performance.now()/1000-P.lastHurt>8)P.hp=Math.min(100,P.hp+dt*.35);
  // actions
  const H2=IT[P.held]||{};P.block=I.right&&!H2.bow&&P.held!=='none'&&P.stam>3&&!ghost;const trig=(I.down&&I.locked)||I.fire;
  if(ghost){const d=camDir();const gp=camera.position.clone().addScaledVector(new V3(d.x,0,d.z).normalize(),4+STRUCTS[ghost.k].r);gp.y=K.groundAt(gp.x,gp.z,1e4,.2);if(INSIDE)gp.y=IN[INSIDE].D.at.y;ghost.g.position.copy(gp);ghost.g.rotation.y=ghostRot+P.yaw;if(trig&&!ghostLatch){placeBlueprint(ghost.k,gp,ghost.g.rotation.y);endGhost()}if(I.right)endGhost();ghostLatch=trig}
  else if(H2.bow){if(trig&&has('arrow')){P.bow=Math.min(1,P.bow+dt*1.2)}else if(P.bow>0){shootArrow(P.bow);P.bow=0}}
  else if(trig&&!P.swing&&P.held!=='none'&&P.held!=='lighter'&&P.stam>6&&!swingLatch){P.swing={t:0,dur:H2.rate||.7,hit:false};P.stam-=7;K.SFX.swing(P.pos)}
  swingLatch=trig&&!(IT[P.held]||{}).rate;
  if(P.swing){P.swing.t+=dt;const ph=P.swing.t/P.swing.dur;if(ph>.42&&!P.swing.hit){P.swing.hit=true;doHit()}if(ph>=1)P.swing=null}
  // viewmodel
  const sw=P.swing?Math.sin(clamp(P.swing.t/P.swing.dur,0,1)*PI):0;vmR.rotation.set(-sw*1.5+(P.block?.4:0),sw*.6-(P.block?.5:0),sw*.3);vmR.position.set(.24-(P.block?.14:0),-.26+Math.sin(bobT*.5)*.012+(P.block?.08:0),-.42+sw*.1);vmL.visible=P.held==='bow'||P.held==='none'||P.held==='lighter';vmR.visible=P.held!=='lighter';if(P.held==='bow'&&heldMesh){heldMesh.position.set(-.1,-.15,-.55+P.bow*.05);if(heldMesh.userData.str)heldMesh.userData.str.position.z=.1+P.bow*.18;vmR.position.set(.02,-.18,-.4+P.bow*.18)}
  const L=H2.light||0;pLight.intensity=L?(L*1.7+Math.sin(performance.now()/60)*.15*L)*(NIGHTF*.8+(INSIDE?1:.2)):0;pLight.distance=L>=1?18:9;if(heldMesh&&heldMesh.userData.fl)heldMesh.userData.fl.material.opacity=.8+Math.sin(performance.now()/50)*.2;
  if(P.held==='torch'&&Math.random()<.5){const q=new V3();(heldMesh.userData.fl||heldMesh).getWorldPosition(q);K.emit(K.FX,q.x,q.y,q.z,rnd(-.1,.1),rnd(.5,1),rnd(-.1,.1),.35,.08,.02,0xffc050,0xff4000,1,-.5,1)}
  // interact
  const tg=findTarget();K.prompt(tg?tg.key:null,tg?tg.text:'');const use=k.e||I.alt||I.useHold;if(use&&!useLatch&&tg)tg.fn();useLatch=use}
function doHit(){const H2=IT[P.held];const reach=H2.reach||2.3;const cp=camera.position,cd=camDir();let hitSomething=false;
  let best=null,bd=reach+.6;for(const e of EN){if(e.dead||e.inside!==INSIDE)continue;const q=e.pos.clone().add(new V3(0,1.1*e.S.sc,0));const d=q.distanceTo(cp);if(d>bd)continue;if(q.clone().sub(cp).normalize().dot(cd)<.6)continue;best={e};bd=d}
  for(const a of ANI){if(a.dead)continue;const q=a.pos.clone().add(new V3(0,a.kind==='deer'?1:.2,0));const d=q.distanceTo(cp);if(d>bd)continue;if(q.clone().sub(cp).normalize().dot(cd)<.55)continue;best={a};bd=d}
  if(best&&best.e){hurtEnemy(best.e,H2.dmg*(P.held==='torch'?1:1),cd,P.held==='torch'?'fire':null);K.SFX.punch(best.e.pos);K.hitmark(best.e.dead);hitSomething=true}
  else if(best&&best.a){hurtAnimal(best.a,H2.dmg);K.SFX.punch(best.a.pos);K.hitmark(best.a.dead);hitSomething=true}
  else if(H2.fish&&!INSIDE){for(const f of FISH){if(f.alive&&f.m.position.distanceTo(cp)<4&&f.m.position.clone().sub(cp).normalize().dot(cd)>.8){f.alive=false;f.m.visible=false;f.t=90;give('fish',1);hitSomething=true;break}}}
  if(!hitSomething){const wh=K.rayBoxes(cp,cd,reach+.4);if(wh&&wh.box&&wh.box.tree){const t=wh.box.tree;if(H2.chop){t.hp-=H2.chop;K.SFX.chop(wh.p);K.burst(wh.p.x,wh.p.y,wh.p.z,10,3,.5,.06,.03,0xc8a070,0x6a4a2a,1,9,1);if(t.hp<=0)fellTree(t)}else{K.SFX.chop(wh.p)}}else if(wh){K.snd({pos:wh.p,noise:1,f:1200,dur:.06,vol:.3});K.burst(wh.p.x,wh.p.y,wh.p.z,5,2,.3,.04,.02,0xaaaaaa,0x666666,1,9,1)}}}
const FALLING=[];function fellTree(t){hideTree(t);const g=new T.Group();const tr=new T.Mesh(t.pine?G.pineT:G.oakT,mBark),cr=new T.Mesh(t.pine?G.pineC:G.oakC,t.pine?mNeedle:mLeafy);g.add(tr,cr);g.position.set(t.x,t.y-.3,t.z);g.scale.setScalar(t.s);const pivot=new T.Group();pivot.position.set(t.x,t.y,t.z);scene.add(pivot);g.position.set(0,-.3,0);pivot.add(g);const away=Math.atan2(t.x-P.pos.x,t.z-P.pos.z);pivot.rotation.y=away;FALLING.push({pivot,t:0,tree:t,away});K.snd({pos:new V3(t.x,t.y+2,t.z),noise:1,f:300,dur:1.2,vol:.4,range:80})}
function stepFalling(dt){for(let i=FALLING.length-1;i>=0;i--){const f=FALLING[i];f.t+=dt;const k=Math.min(1,f.t*f.t*.55);f.pivot.children[0].rotation.x=k*PI/2*.97;if(f.t>=1.35){scene.remove(f.pivot);FALLING.splice(i,1);const t=f.tree;K.snd({pos:new V3(t.x,t.y,t.z),noise:1,f:200,dur:.5,vol:.6,range:80});K.burst(t.x+Math.sin(f.away)*5,t.y+.5,t.z+Math.cos(f.away)*5,30,4,1.5,.5,2,0x8a7a5a,0x5a4a3a,.6,-1,1.5,K.SM);
    const n=t.pine?2:3;for(let j=0;j<n;j++){const d=2+j*2.6;const lx=t.x+Math.sin(f.away)*d,lz=t.z+Math.cos(f.away)*d;dropItem('log',lx,lz,1)}for(let j=0;j<2;j++)dropItem('stick',t.x+Math.sin(f.away)*rnd(3,8)+rnd(-1,1),t.z+Math.cos(f.away)*rnd(3,8)+rnd(-1,1),1)}}}
/* ================= world upkeep ================= */
function stepWorld(dt){for(const f of FIRES){if(f.fuel!=null){f.fuel-=dt;if(f.fuel<=0)f.lit=false}const near=f.pos.distanceTo(P.pos)<70;f.L.intensity=f.lit?(2.2+Math.sin(performance.now()/90+f.pos.x)*.4)*(.4+NIGHTF):0;if(f.lit&&near&&!INSIDE&&Math.random()<.7){K.emit(K.FX,f.pos.x+rnd(-.3,.3),f.pos.y+.2,f.pos.z+rnd(-.3,.3),rnd(-.2,.2),rnd(1,2),rnd(-.2,.2),.6,.35,.05,0xffd070,0xff3000,1,-1,1);if(Math.random()<.2)K.emit(K.SM,f.pos.x,f.pos.y+1.2,f.pos.z,rnd(-.2,.2),1.5,rnd(-.2,.2),3,.4,2,0x5a5550,0x3a3a3a,.3,-.2,.5)}
    if(f.lit&&f.pos.distanceTo(P.pos)<1.2)hurtP(8*dt,'fire')}
  for(const b of BUILT){if(!b.built)continue;if(b.k==='rain'&&W.rain>.5){b.water=Math.min(3,(b.water||0)+dt*.02)}if(b.k==='rain'&&b.g.userData.wtr)b.g.userData.wtr.visible=b.water>=1;if(b.k==='trap'&&!b.caught){b.t-=dt;if(b.t<=0){b.caught=1;K.note('Something is caught in your trap.','#9ad89a')}}if(b.k==='effigy'&&b.lit>0){b.lit-=dt;if(Math.random()<.6)K.emit(K.FX,b.pos.x+rnd(-.2,.2),b.pos.y+rnd(1,2.6),b.pos.z+rnd(-.2,.2),0,1.5,0,.5,.3,.05,0xffc050,0xff2000,1,-1,1);for(const e of EN)if(!e.dead&&(e.kind==='can'||e.kind==='painted')&&e.pos.distanceTo(b.pos)<24){e.state='flee';e.t=Math.max(e.t,3)}}
    if(b.k==='spikes')for(const e of EN)if(!e.dead&&e.pos.distanceTo(b.pos)<1.6){hurtEnemy(e,40*dt,null)}}
  for(const b of BUSH){if(b.cd>0)b.cd-=dt;if(b.picked){b.regrow-=dt;if(b.regrow<=0){b.picked=0;berriesVisible(b,true)}}}
  if(!INSIDE)for(const k of['v1','v2','v3'])if(!P.flags['seen_'+k]&&POI[k].distanceTo(P.pos)<45){P.flags['seen_'+k]=1;K.note('Discovered a cannibal camp.','#e8dcc0')}
  if(!INSIDE&&!P.flags.seen_cave1&&POI.cave1.distanceTo(P.pos)<30)P.flags.seen_cave1=1;if(!INSIDE&&!P.flags.seen_cave2&&POI.cave2.distanceTo(P.pos)<30)P.flags.seen_cave2=1;
  for(const it of WITEMS)if(it.m&&it.m.userData.spin)it.m.rotation.y+=dt*1.5}
/* ================= input ================= */
const KEYS_L=[['W A S D','Move'],['Shift','Sprint'],['Space','Jump'],['C','Crouch (sneak)'],['LMB','Swing / chop / shoot'],['RMB / Q','Block / aim'],['E','Pick up / use'],['Tab','Backpack & crafting'],['B','Build'],['M','Map'],['J','Journal'],['F','Lighter'],['1-8','Tools'],['G','Throw molotov'],['P','Pause']];K.keys(KEYS_L);
let started=false;
c.on(document,'keydown',e=>{if(!started)return;const k2=e.key.toLowerCase();if(e.repeat)return;const menuOn=K.H.menu.classList.contains('on');
  if(ENDING.on)return;if(k2==='tab'||k2==='i'){e.preventDefault();if(menuOn)K.menuOff();else invMenu('items');return}if(k2==='p'||k2==='escape'&&menuOn){if(menuOn)K.menuOff();else pauseMenu();return}if(menuOn)return;if(P.dead)return;
  if(k2==='b')buildMenu();else if(k2==='m')invMenu('map');else if(k2==='j')invMenu('journal');else if(k2==='c')P.crouch=!P.crouch;else if(k2==='f'){if(has('lighter'))equip(P.held==='lighter'?'none':'lighter')}else if(k2==='g'){if(has('molotov'))throwMolotov()}else if(k2==='r'&&ghost){ghostRot+=PI/4}
  else if(/^[1-8]$/.test(k2)){const own=TOOLS.filter(t=>has(t));const t=own[+k2-1];if(t)equip(P.held===t?'none':t)}});
c.on(st3.renderer.domElement,'wheel',e=>{if(ghost)ghostRot+=Math.sign(e.deltaY)*PI/8});
K.touchBtn('BAG',()=>invMenu('items'));K.touchBtn('BUILD',()=>buildMenu());K.touchBtn('CROUCH',()=>{P.crouch=!P.crouch});K.touchBtn('BLOCK',v=>{input.right=v},true);K.touchBtn('MENU',()=>pauseMenu());
function pauseMenu(){K.menu('<h2>THE HOLLOW</h2><p>Day '+day+'. '+goalText()+'</p><p style="opacity:.7">Drawings '+P.drawings.length+'/10 · Notes '+P.notes.length+'/'+Object.keys(NOTES).length+'</p>',[['Resume',()=>K.menuOff(),'pri'],['Backpack',()=>invMenu('items')],['Map',()=>invMenu('map')],['New game',()=>K.menu('<h2>Start over?</h2><p>Your save will be erased.</p>',[['Yes',()=>{K.SAVE.set('save',null);K.menuOff();newGame()},'pri'],['Cancel',()=>pauseMenu()]])]])}
/* ================= start ================= */
function newGame(){Object.assign(P,{hp:100,stam:100,energy:100,food:75,water:70,armor:0,inv:{},flags:{},notes:[],drawings:[],captured:false,dead:false});hour=7.2;day=1;setInside(null);P.pos.set(POI.crash.x+14,0,POI.crash.z-6);P.pos.y=H_(P.pos.x,P.pos.z);P.yaw=Math.atan2(-(POI.crash.x-P.pos.x),-(POI.crash.z-P.pos.z));equip('none');started=true;P.flags.started=1;
  K.fade(true,null);K.cine(true);K.say([{who:'',col:'#aaa',text:'Flight 816 to Anchorage. Somewhere over the North Pacific, the engines stopped.',voice:false,dur:4},{who:'',col:'#aaa',text:'When you woke, a painted man was carrying your daughter into the trees.',voice:false,dur:4},SAM('Lily... LILY!'),SAM('I have to find her. First I need to survive the night.')],()=>{K.fade(false);K.cine(false);lastGoal='';story()})}
function startMenu(){const has2=!!K.SAVE.get('save',null);K.menu('<h2 style="font-size:40px;letter-spacing:.04em">THE HOLLOW</h2><p>Your plane went down on an island that isn\'t on any map. Your daughter Lily was taken. Survive the forest, build a camp, and follow her trail into the caves below.</p><h3>WHAT\'S IN IT</h3><p>Chop trees and build shelters, cabins, fires, walls and traps · craft spears, bows, armor and molotovs · hunt deer, fish and forage · cannibal camps that watch, stalk and raid · mutants at night · three cave systems and a hidden lab · a full story with key items, notes and 10 of Lily\'s drawings</p><p style="opacity:.7">Click the game to look around. Tab opens your backpack. Sleep in a shelter to save.</p>',
  has2?[['Continue',()=>{K.menuOff();started=true;loadGame()},'pri'],['New game',()=>{K.menuOff();K.SAVE.set('save',null);newGame()}]]:[['Begin',()=>{K.menuOff();newGame()},'pri']])}
setSky(hour);startMenu();
let hudT=0;
function update(dtRaw){const dt=Math.min(dtRaw,.05);if(!started){camera.position.set(POI.crash.x+60,60,POI.crash.z+60);camera.lookAt(POI.crash.x,10,POI.crash.z);setSky(18);return}
  if(ENDING.on){ENDING.t+=dt;const a=ENDING.t*.15;camera.position.set(POI.boat.x+Math.cos(a)*30,12+ENDING.t*1.5,POI.boat.z+60+Math.sin(a)*30);camera.lookAt(POI.boat.x,2,POI.boat.z+6);if(K.boatG){K.boatG.position.z+=dt*4}if(ENDING.t>2&&!ENDING.shown){ENDING.shown=1;K.banner('THE HOLLOW','You escaped with Lily after '+day+' days. Drawings found: '+P.drawings.length+'/10','#e8dcc0',12000);setTimeout(()=>{K.menu('<h2>THE END</h2><p>Sam and Lily were picked up by a fishing trawler two days later. Nobody believed them about the island.</p><p>Days survived: '+day+' · Enemies killed: '+(P.flags.kills||0)+' · Drawings: '+P.drawings.length+'/10</p>',[['Keep exploring',()=>{K.menuOff();ENDING.on=false;K.cine(false);P.pos.set(POI.boat.x,H_(POI.boat.x,POI.boat.z-8),POI.boat.z-8)},'pri'],['New game',()=>{K.SAVE.set('save',null);K.menuOff();ENDING.on=false;K.cine(false);newGame()}]])},9000)}setSky(hour);return}
  if(K.H.menu.classList.contains('on'))return;
  hour+=dt*24/1200;if(hour>=24){hour-=24}if(hour>=6&&hour-dt*24/1200<6)day++;if(!INSIDE)setSky(hour);else{LT.sun.intensity=0;LT.hemi.intensity=.05;scene.fog.density=.03;K.renderer.toneMappingExposure=1.2}stepWeather(dt);
  stepPlayer(dt);for(let i=EN.length-1;i>=0;i--)if(EN[i])stepEnemy(EN[i],dt);for(const a of ANI)stepAnimal(a,dt);stepFish(dt);stepProj(dt);stepFalling(dt);stepWorld(dt);stepLily(dt);manageEnemies(dt);manageAnimals(dt);
  P.hurtT=Math.max(0,P.hurtT-dt*.8);K.hurtFx(P.hurtT+(P.hp<25?.35:0));hudT-=dt;if(hudT<=0){hudT=.15;updHUD();story()}
  mOcean.normalMap.offset.set(performance.now()/70000,performance.now()/110000)}
st3.onFrame(update);
window.__HL=window.__BK={P,EN,ANI,BANDS,TREES,WITEMS,LOOT,BUILT,IN,POI,K,give,take,has,equip,enterInterior,leaveInterior,newGame,loadGame,saveGame,fellTree,placeBlueprint,completeStruct,spawnEnemy,spawnBand,findTarget,hurtEnemy,freeLily,setHour:h=>{hour=h},sim(n,dt){for(let i=0;i<n;i++)update(dt||1/30);return this.tick()},tick(){return{hp:P.hp|0,food:P.food|0,water:P.water|0,day,hour:+hour.toFixed(2),inside:INSIDE,en:EN.length,ani:ANI.length,goal:goalText(),pos:P.pos.toArray().map(v=>+v.toFixed(1))}},started:()=>started,tp(x,z){P.pos.set(x,H_(x,z),z)}};
return()=>{K.dispose();st3.dispose()}})}
