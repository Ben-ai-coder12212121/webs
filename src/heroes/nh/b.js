/* ================= vehicles ================= */
const CT={sedan:{n:'Cruiser',sh:'sedan',L:4.5,Wd:1.9,max:34,acc:10,grip:7,hp:100,mass:1.3,cols:[0x8a1a1a,0x1a3a6a,0xd8d8d0,0x2a2a2e,0x6a6a70,0x3a5a3a,0xa89a7a]},
  taxi:{n:'Taxi',sh:'sedan',L:4.5,Wd:1.9,max:34,acc:10,grip:7,hp:100,mass:1.3,cols:[0xf0c020]},
  police:{n:'Police Cruiser',sh:'sedan',L:4.6,Wd:1.95,max:46,acc:14,grip:8,hp:150,mass:1.6,cols:[0x14161c]},
  sport:{n:'Viper',sh:'sport',L:4.4,Wd:1.95,max:50,acc:16,grip:8.5,hp:90,mass:1.2,cols:[0xd8202a,0xf0a020,0x2a6ad8,0xe8e8e8,0x20c060]},
  muscle:{n:'Stallion',sh:'muscle',L:4.8,Wd:2,max:44,acc:14,grip:6.2,hp:120,mass:1.5,cols:[0x1a1a1a,0x8a2a1a,0x2a4a8a,0xe0c040]},
  super:{n:'Zentor',sh:'super',L:4.6,Wd:2.05,max:60,acc:20,grip:10,hp:90,mass:1.2,cols:[0x9aff2a,0xff6a1a,0xffffff,0x6a2aff]},
  van:{n:'Burrito',sh:'van',L:5.1,Wd:2.1,max:30,acc:8,grip:6,hp:160,mass:2.2,cols:[0xe8e8e0,0x3a5a8a,0x8a6a3a]},
  truck:{n:'Mule',sh:'truck',L:7.2,Wd:2.4,max:26,acc:6,grip:5.5,hp:230,mass:3.5,cols:[0xe8e8e0,0xd84a2a,0x2a6a3a]},
  swat:{n:'Enforcer',sh:'van',L:5.2,Wd:2.2,max:38,acc:12,grip:7,hp:280,mass:2.6,cols:[0x1a1c22]}};
const TRAFFIC_MIX=['sedan','sedan','sedan','sedan','taxi','taxi','sport','muscle','van','van','truck','sedan','super'];
const PROF={sedan:{b:[[-2.25,.32],[2.25,.32],[2.3,.56],[2.22,.78],[1.1,.9],[-1.75,.96],[-2.24,.9],[-2.3,.56]],g:[[1.1,.86],[.35,1.36],[-.95,1.38],[-1.72,.93]],roof:[-.92,.34,1.35],wb:[-1.42,1.42],r:.34},
  sport:{b:[[-2.2,.28],[2.2,.28],[2.26,.48],[2.08,.64],[.9,.76],[-1.85,.84],[-2.2,.78],[-2.26,.48]],g:[[.9,.73],[.05,1.1],[-.85,1.12],[-1.82,.82]],roof:[-.82,.03,1.1],wb:[-1.4,1.38],r:.33},
  super:{b:[[-2.3,.25],[2.3,.25],[2.36,.42],[2.0,.55],[.6,.7],[-2.05,.8],[-2.32,.72],[-2.36,.45]],g:[[.62,.68],[-.25,1.04],[-1.0,1.04],[-1.98,.78]],roof:[-.98,-.25,1.03],wb:[-1.45,1.45],r:.34},
  muscle:{b:[[-2.4,.34],[2.4,.34],[2.45,.62],[2.34,.88],[.7,.96],[-1.5,1],[-2.38,.94],[-2.45,.62]],g:[[.72,.93],[.15,1.32],[-1.0,1.34],[-1.48,.98]],roof:[-.98,.15,1.33],wb:[-1.55,1.5],r:.36},
  van:{b:[[-2.55,.36],[2.55,.36],[2.6,.72],[2.48,1.02],[1.65,1.25],[1.42,2.12],[-2.55,2.18],[-2.6,.72]],g:[[1.66,1.2],[1.44,2.04],[1.05,2.06],[1.05,1.2]],wb:[-1.7,1.75],r:.38},
  truck:{b:[[1.3,.42],[3.6,.42],[3.65,1.02],[3.52,2.5],[1.3,2.6]],g:[[3.54,1.5],[3.46,2.4],[2.6,2.44],[2.6,1.5]],box:[-3.6,1.2,.62,3.3],wb:[-2.5,2.7],r:.44}};
const GC={};function extr(pts,depth,bev){const k=JSON.stringify(pts)+depth;if(GC[k])return GC[k];const s=new T.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);s.closePath();const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:2,curveSegments:4});g.translate(0,0,-depth/2);g.rotateY(-PI/2);g.computeVertexNormals();return GC[k]=g}
const mGlass=new T.MeshStandardMaterial({color:lin(0x0e141c),roughness:.08,metalness:.6}),mTire=mat('tire','#141416',{roughness:.9}),mRim=mat('rim','#b8bcc4',{metalness:.9,roughness:.25}),mChrome=mat('chr','#e0e0e0',{metalness:1,roughness:.12}),mBurnt=mat('burnt','#1a1614',{roughness:1});
const mHL=new T.MeshStandardMaterial({color:0xffffff,emissive:lin(0xfff2d8),emissiveIntensity:.3,roughness:.2});NIGHT.push({m:mHL,k:3,base:.3});const mTL=new T.MeshStandardMaterial({color:lin(0x550000),emissive:lin(0xff1010),emissiveIntensity:.4,roughness:.3});NIGHT.push({m:mTL,k:1.6,base:.4});
const mRedL=new T.MeshStandardMaterial({color:lin(0xff2020),emissive:lin(0xff0000),emissiveIntensity:0}),mBlueL=new T.MeshStandardMaterial({color:lin(0x2040ff),emissive:lin(0x0030ff),emissiveIntensity:0});
const tireG=(r)=>GC['t'+r]||(GC['t'+r]=(()=>{const g=new T.CylinderGeometry(r,r,.26,14);g.rotateZ(PI/2);return g})()),rimG=r=>GC['r'+r]||(GC['r'+r]=(()=>{const g=new T.CylinderGeometry(r*.62,r*.62,.27,10);g.rotateZ(PI/2);return g})());
const paintCache={};const paint=col=>paintCache[col]||(paintCache[col]=new T.MeshStandardMaterial({color:lin(col),metalness:.45,roughness:.3}));
const BX=(g,w,h,d,x,y,z,m)=>{const b=new T.Mesh(GC['b'+w+h+d]||(GC['b'+w+h+d]=new T.BoxGeometry(w,h,d)),m);b.position.set(x,y,z);g.add(b);return b};
function carMesh(type,col){const S=CT[type],pr=PROF[S.sh],g=new T.Group(),pm=paint(col);const Wd=S.Wd;
  const body=new T.Mesh(extr(pr.b,Wd-.14,.07),pm);body.castShadow=true;g.add(body);const gl=new T.Mesh(extr(pr.g,Wd-.3,.06),mGlass);g.add(gl);
  if(pr.roof){const rf=BX(g,Wd-.32,.07,pr.roof[1]-pr.roof[0],0,pr.roof[2],(pr.roof[0]+pr.roof[1])/2,pm);rf.castShadow=true}
  if(pr.box){const b=BX(g,Wd+.05,pr.box[3]-pr.box[2],pr.box[1]-pr.box[0],0,(pr.box[2]+pr.box[3])/2,(pr.box[0]+pr.box[1])/2,mat('tbox','#e8e8e0',{map:'metal'}));b.castShadow=true;BX(g,Wd-.2,.3,7,0,.5,-.4,mDark)}
  const fz=pr.b.reduce((a,p)=>Math.max(a,p[0]),-9),rz=pr.b.reduce((a,p)=>Math.min(a,p[0]),9)-(pr.box?0:0),rz2=pr.box?pr.box[0]:rz;
  [-1,1].forEach(s=>{BX(g,.36,.1,.06,s*(Wd/2-.3),S.sh==='van'||S.sh==='truck'?.9:.62,fz+.04,mHL);BX(g,.34,.1,.06,s*(Wd/2-.3),S.sh==='truck'?1:S.sh==='van'?1.2:.7,rz2-.03,mTL);BX(g,.14,.08,.12,s*(Wd/2+.04),(pr.g[0][1]+.05),pr.g[0][0]-.25,pm)});
  BX(g,Wd-.1,.14,.08,0,.38,fz+.05,mChrome);BX(g,Wd-.1,.14,.08,0,.4,rz2-.04,mDark);
  if(type==='taxi'){const sg=BX(g,.8,.22,.3,0,pr.roof[2]+.15,(pr.roof[0]+pr.roof[1])/2,mat('taxis','#fff2a0',{emissive:0xffd840,emissiveIntensity:.5}))}
  let bar=null;if(type==='police'||type==='swat'){bar=[BX(g,.55,.12,.24,-.3,(pr.roof?pr.roof[2]:2.18)+.1,pr.roof?(pr.roof[0]+pr.roof[1])/2:.8,mRedL),BX(g,.55,.12,.24,.3,(pr.roof?pr.roof[2]:2.18)+.1,pr.roof?(pr.roof[0]+pr.roof[1])/2:.8,mBlueL)];if(type==='police')[-1,1].forEach(s=>BX(g,.02,.34,1.6,s*(Wd/2+.005),.62,.1,mWhite))}
  const wheels=[];for(const z of pr.wb)for(const s of[-1,1]){const st=new T.Group();st.position.set(s*(Wd/2-.14),pr.r,z);const sp2=new T.Group();st.add(sp2);const t=new T.Mesh(tireG(pr.r),mTire);t.castShadow=true;sp2.add(t);sp2.add(new T.Mesh(rimG(pr.r),mRim));g.add(st);wheels.push({st,sp:sp2,front:z>0})}
  g.userData={wheels,bar,pm};return g}
const CARS=[];let carId=0;
function spawnCar(type,x,z,yaw,o){o=o||{};const S=CT[type];const col=o.col!=null?o.col:pick(S.cols);const mesh=carMesh(type,col);scene.add(mesh);
  const car={id:++carId,type,S,mesh,pos:new V3(x,K.groundAt(x,z,5,1),z),yaw:yaw||0,vf:0,vl:0,steer:0,hp:S.hp,driver:null,ai:null,dead:false,burn:0,smokeT:0,col,persist:!!o.persist,police:type==='police'||type==='swat',siren:false,roll:0,pitch:0,hb:false,wspin:0,stuck:0,parked:!!o.parked,tag:o.tag||null,lastHit:0};
  CARS.push(car);syncCar(car,0);return car}
function removeCar(car){scene.remove(car.mesh);const i=CARS.indexOf(car);if(i>=0)CARS.splice(i,1);if(car.driver&&car.driver.ped)removePed(car.driver.ped)}
const cfwd=car=>new V3(Math.sin(car.yaw),0,Math.cos(car.yaw)),cright=car=>new V3(-Math.cos(car.yaw),0,Math.sin(car.yaw));
function carPhys(car,thr,brk,st,hb,dt){const S=car.S;if(car.dead){thr=0;brk=1;st=0}let f=car.vf,l=car.vl;const dmgK=car.hp<S.hp*.25?.7:1;
  if(thr>0){if(f<-.5)f+=S.acc*2.4*thr*dt;else f+=S.acc*thr*dt*Math.max(0,1-Math.max(0,f)/(S.max*dmgK))*1.25}
  if(brk>0){if(f>.5)f-=S.acc*2.6*brk*dt;else f-=S.acc*.7*brk*dt*Math.max(0,1+f/(S.max*.3))}
  if(hb)f-=Math.sign(f)*Math.min(Math.abs(f),5*dt);
  f-=f*.08*dt;if(!thr&&!brk)f-=Math.sign(f)*Math.min(Math.abs(f),2.2*dt);
  const sp=Math.abs(f),maxSt=lerp(.6,.16,clamp(sp/S.max,0,1));car.steer=lerp(car.steer,st*maxSt,Math.min(1,dt*(st?5:8)));
  const wb=S.L*.6;let yr=f*Math.tan(car.steer)/wb;if(hb&&sp>4)yr*=1.45;
  // velocity in world before yaw change
  const fw=cfwd(car),rt=cright(car);const vx=fw.x*f+rt.x*l,vz=fw.z*f+rt.z*l;
  car.yaw+=yr*dt;const fw2=cfwd(car),rt2=cright(car);f=vx*fw2.x+vz*fw2.z;l=vx*rt2.x+vz*rt2.z;
  const grip=(hb?.9:S.grip)*(car.pos.y>.1&&car.pos.y<.2?.85:1);l*=Math.exp(-grip*dt);if(hb&&sp>6)l+=(-yr*sp*.02)*dt*0;
  car.vf=f;car.vl=l;car.hb=hb&&sp>4;
  car.pos.x+=(fw2.x*f+rt2.x*l)*dt;car.pos.z+=(fw2.z*f+rt2.z*l)*dt;
  // world collision (3 circles)
  const r=S.Wd/2,offs=[-S.L/2+r,0,S.L/2-r];let best=null,bm=0;for(const oz of offs){const q=new V3(car.pos.x+fw2.x*oz,car.pos.y,car.pos.z+fw2.z*oz),q0=q.clone();K.collide(q,r,car.pos.y+.3,1.4);const dd=q.sub(q0),m=dd.length();if(m>bm){bm=m;best=dd}}
  if(best&&bm>1e-4){car.pos.add(best);const n=best.normalize();const vw=new V3(fw2.x*f+rt2.x*l,0,fw2.z*f+rt2.z*l);const imp=-vw.dot(n);if(imp>0){vw.addScaledVector(n,imp*1.25);car.vf=vw.dot(fw2);car.vl=vw.dot(rt2);if(imp>5){carDamage(car,(imp-4)*2.2,null);CAM_SHAKE(car,imp);crash(car.pos,imp)}}}
  const gy=K.groundAt(car.pos.x,car.pos.z,car.pos.y+.1,r*.6);car.pos.y+=(gy-car.pos.y)*Math.min(1,dt*(gy>car.pos.y?14:9));
  // water
  if(car.pos.z>coastZ(car.pos.x)+1&&!(car.pos.x>-70&&car.pos.x<-60&&car.pos.z<262)){car.pos.y-=dt*2;if(!car.dead&&car.pos.y<-1){car.hp=0;wreck(car,true)}}}
function syncCar(car,dt){const m=car.mesh;m.position.copy(car.pos);const lat=clamp(-car.vl*.012-car.steer*car.vf*.006,-.12,.12);car.roll=lerp(car.roll,lat,Math.min(1,dt*6));m.rotation.set(0,car.yaw,0);m.rotateZ(car.roll);car.wspin+=car.vf*dt/PROF[car.S.sh].r;for(const w of m.userData.wheels){w.sp.rotation.x=car.wspin;if(w.front)w.st.rotation.y=car.steer}
  if(m.userData.bar&&car.siren){const ph=Math.floor(performance.now()/180)%2;mRedL.emissiveIntensity=ph?3:0;mBlueL.emissiveIntensity=ph?0:3}}
function carDamage(car,d,by){if(car.dead)return;car.hp-=d;if(by==='player')car.hitByPlayer=1;if(car.hp<=0){car.hp=0;car.burn=car.burn||4.5}}
function wreck(car,sink){if(car.dead)return;car.dead=true;car.burn=0;car.mesh.traverse(o=>{if(o.isMesh&&o.material!==mTire)o.material=mBurnt});if(!sink){explode(car.pos.clone().add(new V3(0,.8,0)),7,160,car.hitByPlayer?'player':null);car.vf*=.3;car.flame=12}if(car.driver&&car.driver.ped){const p=car.driver.ped;p.inCar=null;p.pos.copy(car.pos);killPed(p,new V3(0,1,0),car.hitByPlayer?'player':null)}car.driver=car.driver===ME?car.driver:null;if(ME.car===car)playerDie('car')}
/* ================= pedestrians / NPCs ================= */
const PEDS=[];
const OUTFIT={civ:()=>({shirt:pick([0x3a5a8a,0x8a3a3a,0x3a7a4a,0xd8c8a0,0x6a4a8a,0xe0e0e0,0x2a2a2a,0xc88a3a,0x4a8a9a]),pants:pick([0x2a2a34,0x3a4a6a,0x5a4a3a,0x1a1a1a,0x8a8a80]),skin:pick([0xf0c8a8,0xd8a888,0xa87858,0x7a5238,0x5a3a28]),hair:pick([0x1a1008,0x3a2410,0x6a4a2a,0xa88a50,0x2a2a2a,0xd8d0c0]),hairStyle:pick(['s','s','long','bald']),jacket:Math.random()<.3?pick([0x2a2a30,0x5a3a22,0x3a4a3a]):null,cap:Math.random()<.15?pick([0xc83a3a,0x2a4a8a]):null}),
  cop:()=>({shirt:0x1a2a5a,pants:0x141a2a,skin:pick([0xf0c8a8,0xd8a888,0xa87858,0x6a4a30]),hair:0x1a1008,cap:0x141a3a,vest:0x1a1a22}),
  swat:()=>({shirt:0x1a1a1e,pants:0x1a1a1e,skin:0xa87858,hair:0x1a1008,cap:0x0a0a0a,vest:0x2a2a2e,mask:0x111111,gloves:0x111111,bulk:1.1}),
  gang:()=>({shirt:pick([0xc81a1a,0xa81010,0xe02a2a]),pants:pick([0x1a1a1a,0x2a2a34]),skin:pick([0xd8a888,0xa87858,0x7a5238,0x5a3a28]),hair:0x1a1008,cap:Math.random()<.5?0xc81a1a:null,jacket:Math.random()<.4?0x1a1a1a:null}),
  guard:()=>({shirt:0x3a3a3a,pants:0x2a2a2a,skin:pick([0xd8a888,0xa87858]),hair:0x1a1008,vest:0x4a4a3a,cap:0x2a2a2a})};
function spawnPed(kind,x,z,o){o=o||{};const look=o.look||(OUTFIT[kind]||OUTFIT.civ)();const ch=K.human(look);scene.add(ch.g);
  const p={ch,kind,team:o.team||(kind==='cop'||kind==='swat'?'cop':kind==='gang'?'gang':kind==='guard'?'gang':'civ'),pos:new V3(x,K.groundAt(x,z,2,.3),z),yaw:o.yaw||rnd(0,TWO),hp:o.hp||({civ:60,cop:100,swat:160,gang:90,guard:110}[kind]||60),state:o.state||'walk',t:0,spd:0,wpn:o.wpn||(kind==='cop'?'pistol':kind==='swat'?'smg':kind==='gang'||kind==='guard'?pick(['pistol','pistol','smg','bat']):null),cool:rnd(.5,1.5),act:null,actK:0,dead:false,deadT:0,alert:0,persist:!!o.persist,tag:o.tag||null,name:o.name||null,goal:null,path:null,pathT:0,home:o.home?o.home.clone():null,acc:o.acc||1,dmgMul:o.dmgMul||1,maxHp:0,blk:null,dir:1,ci:0};
  p.maxHp=p.hp;if(o.hp)p.maxHp=o.hp;if(p.wpn&&WPN[p.wpn].mesh){K.holdItem(ch,K.gunMesh(WPN[p.wpn].mesh))}
  if(p.state==='walk')attachWalk(p);PEDS.push(p);return p}
function removePed(p){scene.remove(p.ch.g);const i=PEDS.indexOf(p);if(i>=0)PEDS.splice(i,1)}
/* sidewalk loops */
const cornerPt=(bx,bz,ci)=>new V3((ci&1)?RX(bx+1)-7.4:RX(bx)+7.4,.15,(ci&2)?RX(bz+1)-7.4:RX(bz)+7.4);const LOOP=[0,1,3,2];
function attachWalk(p){const[bx,bz]=blockOf(p.pos.x,p.pos.z);p.blk=[clamp(bx,0,NB-1),clamp(bz,0,NB-1)];let bi=0,bd=1e9;for(let k=0;k<4;k++){const d=cornerPt(...p.blk,LOOP[k]).distanceTo(p.pos);if(d<bd){bd=d;bi=k}}p.ci=bi;p.dir=Math.random()<.5?1:-1;p.goal=cornerPt(...p.blk,LOOP[p.ci]);p.state='walk';p.walkSpd=rnd(1.2,1.6)}
function nextCorner(p){const ci=LOOP[p.ci];if(Math.random()<.22){const cross=Math.random()<.5?1:2;const nb=[p.blk[0]+(cross===1?((ci&1)?1:-1):0),p.blk[1]+(cross===2?((ci&2)?1:-1):0)];if(nb[0]>=0&&nb[1]>=0&&nb[0]<NB&&nb[1]<NB){p.blk=nb;const nci=ci^cross;p.ci=LOOP.indexOf(nci);p.goal=cornerPt(...nb,nci);p.crossing=1;return}}p.ci=(p.ci+p.dir+4)%4;p.goal=cornerPt(...p.blk,LOOP[p.ci]);p.crossing=0}
/* ================= weapons ================= */
const WPN={fist:{n:'Fists',melee:1,dmg:14,rate:.42,range:1.6},bat:{n:'Bat',melee:1,dmg:34,rate:.62,range:2,mesh:'bat',price:60},
  pistol:{n:'Pistol',dmg:26,rate:.24,mag:12,spread:.016,range:90,mesh:'pistol',price:200,ammoP:60,ammoN:36,snd:'pistol'},
  smg:{n:'SMG',dmg:15,rate:.075,mag:30,spread:.045,range:70,mesh:'smg',price:700,ammoP:120,ammoN:90,auto:1,snd:'smg'},
  shotgun:{n:'Shotgun',dmg:13,pel:8,rate:.85,mag:6,spread:.08,range:40,mesh:'shotgun',price:1000,ammoP:150,ammoN:18,snd:'shotgun'},
  rifle:{n:'Carbine',dmg:31,rate:.105,mag:30,spread:.02,range:140,mesh:'rifle',price:2500,ammoP:200,ammoN:90,auto:1,snd:'rifle'},
  sniper:{n:'Sniper Rifle',dmg:140,rate:1.1,mag:5,spread:.001,range:320,mesh:'sniper',price:4000,ammoP:250,ammoN:15,scope:1,snd:'sniper'},
  grenade:{n:'Grenades',thrown:1,dmg:200,rate:.9,price:400,ammoP:400,ammoN:3}};
const WORDER=['fist','bat','pistol','smg','shotgun','rifle','sniper','grenade'];
/* ray vs character (vertical cylinder + head) */
function rayChar(o,d,maxD,p){const r=.38,px=p.pos.x,pz=p.pos.z,ox=o.x-px,oz=o.z-pz;const a=d.x*d.x+d.z*d.z;if(a<1e-9)return null;const b=2*(ox*d.x+oz*d.z),cc=ox*ox+oz*oz-r*r;const disc=b*b-4*a*cc;if(disc<0)return null;const t=(-b-Math.sqrt(disc))/(2*a);if(t<0||t>maxD)return null;const y=o.y+d.y*t-p.pos.y;const top=p.dead?.5:p.crouch?1.2:1.8;if(y<0||y>top)return null;return{t,head:!p.dead&&y>top-.3}}
function rayCar(o,d,maxD,car){const S=car.S;const lo=o.clone().sub(car.pos);const cy=Math.cos(-car.yaw),sy=Math.sin(-car.yaw);const lx=lo.x*cy+lo.z*sy,lz=-lo.x*sy+lo.z*cy,ly=lo.y;const dx=d.x*cy+d.z*sy,dz=-d.x*sy+d.z*cy,dy=d.y;const hx=S.Wd/2,hz=S.L/2,y0=.2,y1=S.sh==='van'?2.2:S.sh==='truck'?3.2:1.35;let t0=0,t1=maxD;for(const[oo,dd,lo2,hi]of[[lx,dx,-hx,hx],[ly,dy,y0,y1],[lz,dz,-hz,hz]]){if(Math.abs(dd)<1e-9){if(oo<lo2||oo>hi)return null;continue}let ta=(lo2-oo)/dd,tb=(hi-oo)/dd;if(ta>tb){const q=ta;ta=tb;tb=q}t0=Math.max(t0,ta);t1=Math.min(t1,tb);if(t0>t1)return null}return{t:t0}}
/* hitscan shot. shooter: 'player' or ped */
function fireRay(o,d,W,shooter,muzzle){const range=W.range||80;const wh=K.rayBoxes(o,d,range,b=>b.tag==='soft'||b.tag==='tree'&&false);let best=wh?wh.t:range,hit=wh?{kind:'world',h:wh}:null;
  for(const p of PEDS){if(p===shooter||p.inCar||(shooter&&shooter.team&&shooter.team===p.team))continue;if(p.pos.distanceToSquared(o)>range*range)continue;const r=rayChar(o,d,best,p);if(r&&r.t<best){best=r.t;hit={kind:'ped',p,head:r.head}}}
  if(shooter!=='player'&&!ME.car&&!ME.dead){const r=rayChar(o,d,best,ME);if(r&&r.t<best){best=r.t;hit={kind:'me',head:r.head}}}
  for(const car of CARS){if(car===ME.car&&shooter==='player')continue;if(car.pos.distanceToSquared(o)>(range+5)**2)continue;const r=rayCar(o,d,best,car);if(r&&r.t<best){best=r.t;hit={kind:'car',car}}}
  if(shooter==='player')for(const tg of XT){const r=tg.ray(o,d,best);if(r&&r.t<best){best=r.t;hit={kind:'xt',tg}}}
  const hp=o.clone().addScaledVector(d,best);K.tracer(muzzle||o,hp);
  if(!hit)return null;
  if(hit.kind==='world'){K.burst(hp.x,hp.y,hp.z,6,4,.35,.05,.02,0xffd890,0x806040,1,9,1);K.burst(hp.x,hp.y,hp.z,3,1.2,.8,.2,.5,0x9a948a,null,.4,0,2,K.SM);if(hit.h.box&&!hit.h.box.ground)K.decal(hp,hit.h.n,.18,'hole',.9,30)}
  else if(hit.kind==='ped'){const dm=W.dmg*(hit.head?2.6:1)*(shooter==='player'?1:.7);hurtPed(hit.p,dm,d,shooter);K.burst(hp.x,hp.y,hp.z,10,3,.4,.06,.03,0x8a0a0a,0x3a0000,1,9,1);if(shooter==='player')K.hitmark(hit.p.dead)}
  else if(hit.kind==='xt'){hit.tg.hurt(W.dmg);K.burst(hp.x,hp.y,hp.z,8,5,.25,.04,.02,0xffe0a0,0xff8020,1,9,1);K.hitmark(false)}
  else if(hit.kind==='me'){hurtMe(W.dmg*(shooter&&shooter.dmgMul||1)*.34,shooter)}
  else if(hit.kind==='car'){carDamage(hit.car,W.dmg*.35,shooter==='player'?'player':null);K.burst(hp.x,hp.y,hp.z,8,5,.25,.04,.02,0xffe0a0,0xff8020,1,9,1);if(shooter==='player'){K.hitmark(false);if(hit.car.driver&&hit.car.driver.ped&&!hit.car.police)panicCar(hit.car)}}
  return hit}
function hurtPed(p,dmg,dir,by){if(p.dead||p.god)return;p.hp-=dmg;p.act='hit';p.actK=0;p.lastHitBy=by;
  if(by==='player'){if(p.team==='cop')addHeat(40,p.pos);else if(p.team==='civ')addHeat(12,p.pos,true);if(p.team==='gang'&&p.home)gangAlert(p.home)}
  if(p.hp<=0){killPed(p,dir,by);return}
  if(p.team==='civ'&&p.kind==='civ'){if(Math.random()<.2&&by==='player'&&!ME.car&&ME.wpn==='fist')p.state='fight';else{p.state='flee';p.threat=by==='player'?ME.pos.clone():p.pos.clone().sub(dir);p.t=rnd(8,14)}}
  else if(p.team!=='civ'&&by==='player'){p.state='attack';p.alert=1}}
function killPed(p,dir,by){if(p.dead)return;p.dead=true;p.hp=0;p.deadT=0;p.state='dead';p.ch.fallBack=Math.random()<.5;p.ch.g.rotation.y=Math.atan2(dir.x,dir.z)+(p.ch.fallBack?PI:0);p.yaw=p.ch.g.rotation.y;if(p.ch.held){p.ch.held.parent&&p.ch.held.parent.remove(p.ch.held);p.ch.held=null}
  K.decal(new V3(p.pos.x,p.pos.y+.02,p.pos.z),new V3(0,1,0),rnd(1,1.8),'blood',.85,40);
  if(by==='player'){STATS.kills++;if(p.team==='cop'){addHeat(90,p.pos);STATS.copKills++}else if(p.team==='civ')addHeat(30,p.pos,true);if(p.team!=='cop')dropCash(p.pos,p.team==='gang'?rnd(40,120):rnd(5,45));if(p.wpn&&WPN[p.wpn].ammoN&&p.team!=='civ')dropPickup('wpn',p.pos.clone().add(new V3(rnd(-.6,.6),0,rnd(-.6,.6))),p.wpn)}
  if(p.onDeath)p.onDeath(by);scare(p.pos,18)}
function panicCar(car){if(car.ai&&car.driver&&car.driver.ped&&car.driver.ped.team==='civ'){car.ai.panic=10}}
/* explosions & grenades */
function explode(pos,rad,dmg,by){K.SFX.boom(pos,rad/6);K.flash(pos,0xffa040,40,rad*5,.5);K.burst(pos.x,pos.y,pos.z,60,rad*2.2,.7,.5,1.6,0xfff0a0,0xff3000,1,-2,2);K.burst(pos.x,pos.y+.5,pos.z,40,rad*.9,2.8,1,3.5,0x4a4038,0x1a1816,.75,-1,1.5,K.SM);K.burst(pos.x,pos.y,pos.z,20,rad*2.5,1.2,.08,.04,0xffc060,0x3a2010,1,12,.5);
  K.decal(new V3(pos.x,K.groundAt(pos.x,pos.z,pos.y,.1)+.02,pos.z),new V3(0,1,0),rad*.9,'scorch',.95,60);K.CAM.shake=Math.max(K.CAM.shake,clamp(1.6-camera.position.distanceTo(pos)/40,0,1.4));
  for(const p of PEDS){if(p.dead||p.inCar)continue;const d=p.pos.distanceTo(pos);if(d<rad){hurtPed(p,dmg*(1-d/rad),p.pos.clone().sub(pos).normalize(),by)}}
  for(const car of CARS){if(car.dead)continue;const d=car.pos.distanceTo(pos);if(d<rad&&d>.5){carDamage(car,dmg*.8*(1-d/rad),by);const n=car.pos.clone().sub(pos).setY(0).normalize();car.vf+=n.dot(cfwd(car))*8*(1-d/rad);car.vl+=n.dot(cright(car))*8*(1-d/rad)}}
  if(!ME.dead){const d=(ME.car?ME.car.pos:ME.pos).distanceTo(pos);if(d<rad)hurtMe(dmg*.55*(1-d/rad),null,true)}
  if(by==='player')addHeat(25,pos);scare(pos,40)}
const NADES=[];const nadeG=new T.SphereGeometry(.09,8,6),nadeM=mat('nade','#2a3a2a',{roughness:.5});
function throwNade(o,v,by){const m=new T.Mesh(nadeG,nadeM);m.position.copy(o);scene.add(m);NADES.push({m,v:v.clone(),t:2.3,by})}
function stepNades(dt){for(let i=NADES.length-1;i>=0;i--){const n=NADES[i];n.t-=dt;n.v.y-=18*dt;const np=n.m.position.clone().addScaledVector(n.v,dt);const g=K.groundAt(np.x,np.z,n.m.position.y,.05);if(np.y<g+.09){np.y=g+.09;n.v.y*=-.4;n.v.x*=.6;n.v.z*=.6}const hb=K.near(np.x,np.z,.2).find(b=>np.x>b.x0&&np.x<b.x1&&np.z>b.z0&&np.z<b.z1&&np.y>b.y0&&np.y<b.y1&&b.tag!=='soft');if(hb){n.v.x*=-.4;n.v.z*=-.4;np.x=n.m.position.x;np.z=n.m.position.z}n.m.position.copy(np);if(n.t<=0){explode(np,7,190,n.by);scene.remove(n.m);NADES.splice(i,1)}}}
/* scare: nearby civilians flee */
function scare(pos,r){for(const p of PEDS){if(p.dead||p.team!=='civ'||p.inCar||p.kind!=='civ')continue;if(p.pos.distanceTo(pos)<r){p.state=Math.random()<.2?'cower':'flee';p.threat=pos.clone();p.t=rnd(7,13)}}for(const car of CARS){if(car.ai&&!car.police&&car.pos.distanceTo(pos)<r)car.ai.panic=8}}
/* ================= pickups ================= */
const PICK=[];const cashTex=ctex(64,32,(g,w,h)=>{g.fillStyle='#5aa050';g.fillRect(0,0,w,h);g.strokeStyle='#2a6a20';g.lineWidth=3;g.strokeRect(2,2,w-4,h-4);g.fillStyle='#2a6a20';g.font='bold 20px Arial';g.textAlign='center';g.fillText('$',w/2,h/2+7)});
const mCash=new T.MeshStandardMaterial({map:cashTex,emissive:lin(0x3a8a30),emissiveIntensity:.4,side:T.DoubleSide});const cashG=new T.PlaneGeometry(.5,.25);
function dropCash(pos,amt){const m=new T.Group();for(let i=0;i<3;i++){const b=new T.Mesh(cashG,mCash);b.rotation.set(-PI/2+rnd(-.3,.3),0,rnd(0,6));b.position.set(rnd(-.15,.15),i*.03,rnd(-.15,.15));m.add(b)}m.position.set(pos.x,pos.y+.05,pos.z);scene.add(m);PICK.push({m,kind:'cash',amt:Math.round(amt),t:60,flat:1})}
const pickMats={health:new T.MeshStandardMaterial({color:lin(0xff3a3a),emissive:lin(0xff2020),emissiveIntensity:.8}),armor:new T.MeshStandardMaterial({color:lin(0x3a8aff),emissive:lin(0x2060ff),emissiveIntensity:.8}),bag:new T.MeshStandardMaterial({color:lin(0x2a6a2a),emissive:lin(0x40ff40),emissiveIntensity:.5}),pkg:new T.MeshStandardMaterial({color:lin(0xd8a860),emissive:lin(0xffc040),emissiveIntensity:.6,map:T_('wood')})};
function dropPickup(kind,pos,wpn,o){let m;if(kind==='wpn'){m=new T.Group();const gm=K.gunMesh(WPN[wpn].mesh||'pistol');gm.rotation.set(0,0,0);gm.scale.setScalar(1.6);m.add(gm)}else if(kind==='pkg'){m=new T.Mesh(new T.BoxGeometry(.5,.4,.5),pickMats.pkg)}else{m=new T.Mesh(kind==='health'?new T.OctahedronGeometry(.28):new T.BoxGeometry(.4,.5,.2),pickMats[kind])}
  m.position.set(pos.x,pos.y+.7,pos.z);scene.add(m);const pk={m,kind,wpn,t:o&&o.perm?1e9:45,id:o&&o.id,base:pos.y+.7};PICK.push(pk);return pk}
/* ================= wanted level ================= */
const WANT={heat:0,lvl:0,unseen:0,last:new V3(),flash:0};const HEAT=[0,1,70,170,330,560];
function addHeat(h,pos,needWitness){if(MISSION.noCops)return;if(needWitness){let seen=false;for(const p of PEDS){if(p.dead)continue;if(p.team==='cop'&&p.pos.distanceTo(pos)<60){seen=true;break}}if(!seen&&WANT.lvl===0&&Math.random()<.45)return}WANT.heat=Math.min(HEAT[5]+100,WANT.heat+h);if(WANT.heat>=1&&WANT.lvl===0)WANT.heat=Math.max(WANT.heat,1);let l=0;for(let i=1;i<6;i++)if(WANT.heat>=HEAT[i])l=i;if(l>WANT.lvl){WANT.lvl=l;K.SFX.bad()}WANT.unseen=0;WANT.last.copy(pos)}
function setWanted(l){WANT.lvl=l;WANT.heat=HEAT[l];WANT.unseen=0}
function clearWanted(){WANT.lvl=0;WANT.heat=0;WANT.unseen=0;for(const car of CARS)if(car.police&&car.ai)car.ai.chase=false;for(const p of PEDS)if(p.team==='cop'&&!p.dead&&!p.persist){p.state='leave';p.t=20}}
