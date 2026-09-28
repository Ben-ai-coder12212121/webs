/* ================= TACTICAL FPS ENGINE: Breach 5v5 (bomb defusal) + Last Drop (battle royale), bots + online P2P ================= */
const TX_CSS=`.tx .hud{font:700 13px system-ui,-apple-system,Segoe UI,sans-serif;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.8)}
.tx button{transform:none!important}
.tx-x{position:absolute;left:50%;top:50%;width:0;height:0;pointer-events:none}.tx-x i{position:absolute;background:#6aff7a;box-shadow:0 0 2px #000}
.tx-hp{position:absolute;left:14px;bottom:12px;display:flex;gap:16px;align-items:flex-end;font:900 26px system-ui,sans-serif}
.tx-hp small{display:block;font:800 10px system-ui,sans-serif;opacity:.7;letter-spacing:.1em}
.tx-am{position:absolute;right:16px;bottom:12px;text-align:right;font:900 28px system-ui,sans-serif}.tx-am small{display:block;font:800 12px system-ui,sans-serif;opacity:.8}
.tx-money{position:absolute;left:14px;bottom:62px;font:900 17px system-ui,sans-serif;color:#7aff8a}
.tx-top{position:absolute;left:50%;top:8px;transform:translateX(-50%);display:flex;align-items:center;gap:8px;font:900 15px system-ui,sans-serif}
.tx-top .txs{padding:3px 10px;border-radius:6px;min-width:30px;text-align:center;height:auto;line-height:1.3}.tx-top .txT{background:rgba(214,150,60,.85)}.tx-top .txC{background:rgba(70,130,220,.85)}
.tx-top .txm{background:rgba(0,0,0,.55);padding:3px 12px;border-radius:6px;font-size:18px;min-width:56px;text-align:center}
.tx-alive{display:flex;gap:3px}.tx-alive i{width:9px;height:16px;border-radius:2px;background:currentColor;opacity:.9}.tx-alive i.d{opacity:.2}
.tx-feed{position:absolute;right:10px;top:10px;display:flex;flex-direction:column;gap:3px;align-items:flex-end;font:800 12px system-ui,sans-serif}
.tx-feed div{background:rgba(0,0,0,.5);padding:3px 8px;border-radius:5px}.tx-feed .me{outline:1.5px solid #ff4a3a}
.tx-feed .fT{color:#ffbe6a}.tx-feed .fC{color:#8ac0ff}
.tx .hud canvas.tx-radar{position:absolute;inset:auto;left:10px;top:10px;right:auto;bottom:auto;width:170px;height:170px;border-radius:12px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.2);pointer-events:none}@media (max-width:640px){.tx .hud canvas.tx-radar{width:110px;height:110px}}
.tx-center{position:absolute;left:0;right:0;top:30%;text-align:center;font:900 clamp(20px,4vw,34px) system-ui,sans-serif;pointer-events:none}
.tx-center small{display:block;font:700 14px system-ui,sans-serif;opacity:.9;margin-top:6px}
.tx-bar{position:absolute;left:50%;top:60%;width:240px;height:10px;margin-left:-120px;border-radius:5px;background:rgba(0,0,0,.5);overflow:hidden;display:none}.tx-bar i{display:block;height:100%;background:#ffd23f;width:0}
.tx-hint{position:absolute;left:0;right:0;top:66%;text-align:center;font:800 13px system-ui,sans-serif;pointer-events:none}
.tx-flash{position:absolute;inset:0;background:#fff;pointer-events:none;opacity:0}
.tx-hurt{position:absolute;inset:0;pointer-events:none;opacity:0;background:radial-gradient(ellipse at center,transparent 45%,rgba(200,0,0,.55))}
.tx-scope{position:absolute;inset:0;pointer-events:none;display:none;background:radial-gradient(circle at center,transparent 0,transparent 37vh,#000 37.2vh)}.tx-scope:before,.tx-scope:after{content:'';position:absolute;background:#000}.tx-scope:before{left:0;right:0;top:50%;height:1.5px}.tx-scope:after{top:0;bottom:0;left:50%;width:1.5px}
.tx-ov{position:absolute;inset:0;display:none;align-items:center;justify-content:center;padding:12px;background:rgba(8,10,14,.82);pointer-events:auto;overflow:auto}
.tx-ov.on{display:flex}
.tx-card{background:rgba(20,24,32,.96);border:1px solid rgba(255,255,255,.15);border-radius:14px;padding:16px 18px;max-width:760px;width:100%;max-height:100%;overflow:auto;color:#fff;font:600 13px system-ui,sans-serif}
.tx-card h2{margin:0 0 4px;font:900 clamp(24px,5vw,38px) system-ui,sans-serif;letter-spacing:.02em}.tx-card h2 span{color:var(--ac)}
.tx-card h3{margin:14px 0 6px;font:900 11px system-ui,sans-serif;letter-spacing:.14em;opacity:.6}
.tx-card p{margin:4px 0 8px;opacity:.85;line-height:1.45}
.tx-btn{all:unset;cursor:pointer;display:inline-block;padding:10px 16px;border-radius:10px;background:rgba(255,255,255,.1);font:800 14px system-ui,sans-serif;margin:4px 4px 0 0;text-align:center}
.tx-btn.pri{background:var(--ac);color:#111}.tx-btn.on{outline:2px solid var(--ac)}.tx-btn.dis{opacity:.35;cursor:default}
.tx-in{all:unset;background:rgba(255,255,255,.1);border-radius:9px;padding:9px 12px;font:700 14px system-ui,sans-serif;width:180px}
.tx-buy{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}
.tx-buy button{all:unset;cursor:pointer;background:rgba(255,255,255,.07);border-radius:9px;padding:8px 10px;font:800 13px system-ui,sans-serif}.tx-buy button small{display:block;font:700 11px system-ui,sans-serif;color:#7aff8a}.tx-buy button.no{opacity:.35}
.tx-sb{width:100%;border-collapse:collapse;font:700 13px system-ui,sans-serif}.tx-sb td,.tx-sb th{padding:4px 8px;text-align:left}.tx-sb tr.me{background:rgba(255,255,255,.1)}.tx-sb .dead{opacity:.45}
.tx-rooms div{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);border-radius:9px;padding:8px 10px;margin-bottom:5px}.tx-rooms div b{flex:1}
.tx-inv{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);display:flex;gap:5px}.tx-inv div{background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.2);border-radius:7px;padding:4px 8px;font:800 11px system-ui,sans-serif;min-width:54px;text-align:center}.tx-inv div.on{border-color:var(--ac);background:rgba(255,190,80,.2)}
.tx .tbtn{background:rgba(10,14,20,.5)!important}`;
function tacticalGame(root,c,cfg){return with3D(root,c,()=>{
const ROY=cfg.mode==='royale',GAME=cfg.id;
const st3=Stage3D(root,c,{lock:true,fov:80,far:ROY?1400:400,fireLabel:'FIRE',altLabel:ROY?'USE':'SCOPE',jumpLabel:'JUMP'});
const{T,scene,camera,renderer,wrap,hud,input}=st3;const V3=T.Vector3;
wrap.classList.add('tx');wrap.style.setProperty('--ac',ROY?'#ffb02e':'#ffd23f');wrap.append(el('style',null,TX_CSS));
renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;camera.near=.04;camera.updateProjectionMatrix();
const PI=Math.PI,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0],lin=h=>new T.Color(h).convertSRGBToLinear();
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/* ---------------- textures ---------------- */
const ctex=(w,h,fn,rep)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;fn(cv.getContext('2d'),w,h);const t=new T.CanvasTexture(cv);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t};
const noiseFill=(g,w,h,a)=>{const id=g.getImageData(0,0,w,h);for(let i=0;i<id.data.length;i+=4){const n=(Math.random()-.5)*a;id.data[i]+=n;id.data[i+1]+=n;id.data[i+2]+=n}g.putImageData(id,0,0)};
const TEX={
 sand:ctex(256,256,(g,w,h)=>{g.fillStyle='#c9a878';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32)for(let x=((y/32)%2)*-40;x<w;x+=80){g.fillStyle=`hsl(${rnd(30,38)},${rnd(35,45)}%,${rnd(58,68)}%)`;g.fillRect(x+2,y+2,76,28)}noiseFill(g,w,h,22)}),
 floor:ctex(256,256,(g,w,h)=>{g.fillStyle='#b89a70';g.fillRect(0,0,w,h);for(let i=0;i<60;i++){g.fillStyle=`rgba(${Math.random()<.5?90:230},${Math.random()<.5?70:200},50,.08)`;g.beginPath();g.arc(rnd(0,w),rnd(0,h),rnd(10,50),0,7);g.fill()}noiseFill(g,w,h,26)}),
 tile:ctex(256,256,(g,w,h)=>{g.fillStyle='#8a7a66';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=64)for(let x=0;x<w;x+=64){g.fillStyle=`hsl(30,${rnd(12,20)}%,${rnd(42,52)}%)`;g.fillRect(x+2,y+2,60,60)}noiseFill(g,w,h,18)}),
 crate:ctex(128,128,(g,w,h)=>{g.fillStyle='#8a6a3a';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16){g.fillStyle=`hsl(32,${rnd(40,50)}%,${rnd(32,40)}%)`;g.fillRect(0,y+1,w,14)}g.strokeStyle='#4a3418';g.lineWidth=10;g.strokeRect(5,5,w-10,h-10);g.beginPath();g.moveTo(8,8);g.lineTo(w-8,h-8);g.moveTo(w-8,8);g.lineTo(8,h-8);g.stroke();noiseFill(g,w,h,16)}),
 grass:ctex(256,256,(g,w,h)=>{g.fillStyle='#5a7a3a';g.fillRect(0,0,w,h);for(let i=0;i<2500;i++){g.fillStyle=`hsl(${rnd(80,100)},${rnd(30,45)}%,${rnd(25,42)}%)`;g.fillRect(rnd(0,w),rnd(0,h),1.5,rnd(2,5))}}),
 plaster:ctex(256,256,(g,w,h)=>{g.fillStyle='#d8d0c0';g.fillRect(0,0,w,h);noiseFill(g,w,h,14);g.fillStyle='rgba(0,0,0,.08)';g.fillRect(0,h-20,w,20)}),
 brick:ctex(256,256,(g,w,h)=>{g.fillStyle='#6a4a3a';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let x=((y/16)%2)*-16;x<w;x+=32){g.fillStyle=`hsl(${rnd(8,16)},${rnd(35,45)}%,${rnd(32,40)}%)`;g.fillRect(x+1,y+1,30,14)}noiseFill(g,w,h,14)}),
 roof:ctex(128,128,(g,w,h)=>{g.fillStyle='#5a5a60';g.fillRect(0,0,w,h);noiseFill(g,w,h,20)}),
 road:ctex(256,256,(g,w,h)=>{g.fillStyle='#3a3a3e';g.fillRect(0,0,w,h);noiseFill(g,w,h,20)}),
 metal:ctex(128,128,(g,w,h)=>{g.fillStyle='#6a7078';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=16){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x,0,3,h)}noiseFill(g,w,h,10)})};
const MATS={};const mat=(k,col,rough)=>MATS[k]||(MATS[k]=new T.MeshStandardMaterial({map:TEX[k],color:lin(col||0xffffff),roughness:rough||.9}));
/* ---------------- world: boxes + spatial hash ---------------- */
let boxes=[],HASH=new Map(),stamp=0;const HS=8;const world=new T.Group();scene.add(world);
function addBox(x0,y0,z0,x1,y1,z1,m,o){const b=Object.assign({x0:Math.min(x0,x1),y0,z0:Math.min(z0,z1),x1:Math.max(x0,x1),y1,z1:Math.max(z0,z1),m,st:0},o||{});boxes.push(b);return b}
function hashBoxes(){HASH.clear();for(const b of boxes){for(let gx=Math.floor(b.x0/HS);gx<=Math.floor(b.x1/HS);gx++)for(let gz=Math.floor(b.z0/HS);gz<=Math.floor(b.z1/HS);gz++){const k=gx*4096+gz;let L=HASH.get(k);if(!L)HASH.set(k,L=[]);L.push(b)}}}
function nearBoxes(x0,z0,x1,z1,cb){stamp++;for(let gx=Math.floor(x0/HS);gx<=Math.floor(x1/HS);gx++)for(let gz=Math.floor(z0/HS);gz<=Math.floor(z1/HS);gz++){const L=HASH.get(gx*4096+gz);if(!L)continue;for(const b of L){if(b.st===stamp)continue;b.st=stamp;cb(b)}}}
function slab(b,ox,oy,oz,dx,dy,dz){let t0=0,t1=1e9;const ax=[[ox,dx,b.x0,b.x1],[oy,dy,b.y0,b.y1],[oz,dz,b.z0,b.z1]];for(const[o,d,lo,hi]of ax){if(Math.abs(d)<1e-9){if(o<lo||o>hi)return -1}else{let u=(lo-o)/d,v=(hi-o)/d;if(u>v){const s=u;u=v;v=s}if(u>t0)t0=u;if(v<t1)t1=v;if(t0>t1)return -1}}return t0}
function ray(ox,oy,oz,dx,dy,dz,maxT,skip){let best=maxT,hit=null;stamp++;let gx=Math.floor(ox/HS),gz=Math.floor(oz/HS);const sx=dx>0?1:-1,sz=dz>0?1:-1,adx=Math.abs(dx)||1e-9,adz=Math.abs(dz)||1e-9;
  let tmx=(dx>0?(gx+1)*HS-ox:ox-gx*HS)/adx,tmz=(dz>0?(gz+1)*HS-oz:oz-gz*HS)/adz;const tdx=HS/adx,tdz=HS/adz;
  for(let it=0;it<600;it++){const L=HASH.get(gx*4096+gz);if(L)for(const b of L){if(b.st===stamp)continue;b.st=stamp;if(skip&&skip(b))continue;const t=slab(b,ox,oy,oz,dx,dy,dz);if(t>=0&&t<best){best=t;hit=b}}const tn=Math.min(tmx,tmz);if(best<=tn||tn>maxT)break;if(tmx<tmz){gx+=sx;tmx+=tdx}else{gz+=sz;tmz+=tdz}}
  return hit?{t:best,b:hit}:null}
function groundAt(x,z,r,maxY){let g=0;nearBoxes(x-r,z-r,x+r,z+r,b=>{if(b.y1<=maxY&&b.y1>g&&x+r>b.x0&&x-r<b.x1&&z+r>b.z0&&z-r<b.z1&&!b.noCol)g=b.y1});return g}
function losClear(a,b,smokeToo){const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,d=Math.hypot(dx,dy,dz);if(d<.01)return true;const h=ray(a.x,a.y,a.z,dx/d,dy/d,dz/d,d,bb=>bb.glass);if(h)return false;if(smokeToo)for(const s of smokes){if(s.t<1.2)continue;const t=clamp(((s.x-a.x)*dx+(s.y-a.y)*dy+(s.z-a.z)*dz)/(d*d),0,1);if(Math.hypot(a.x+dx*t-s.x,a.y+dy*t-s.y,a.z+dz*t-s.z)<s.r)return false}return true}
/* merged box meshes with world-space UVs */
function buildMeshes(){const groups={};for(const b of boxes){if(b.invis)continue;(groups[b.m]||(groups[b.m]=[])).push(b)}
  for(const k in groups){const P=[],N=[],U=[],I=[];const ts=MATS[k].userData.ts||2.5;
    for(const b of groups[k]){const{x0,y0,z0,x1,y1,z1}=b;const F=[[[x1,y0,z1],[0,0,z0-z1],[0,y1-y0,0],[1,0,0],'z'],[[x0,y0,z0],[0,0,z1-z0],[0,y1-y0,0],[-1,0,0],'z'],[[x0,y0,z1],[x1-x0,0,0],[0,y1-y0,0],[0,0,1],'x'],[[x1,y0,z0],[x0-x1,0,0],[0,y1-y0,0],[0,0,-1],'x'],[[x0,y1,z1],[x1-x0,0,0],[0,0,z0-z1],[0,1,0],'t'],[[x0,y0,z0],[x1-x0,0,0],[0,0,z1-z0],[0,-1,0],'t']];
      for(const[o,u,v,n,ax]of F){if(b.noTop&&n[1]===1)continue;const base=P.length/3;const vs=[o,[o[0]+u[0],o[1]+u[1],o[2]+u[2]],[o[0]+u[0]+v[0],o[1]+u[1]+v[1],o[2]+u[2]+v[2]],[o[0]+v[0],o[1]+v[1],o[2]+v[2]]];
        for(const p of vs){P.push(p[0],p[1],p[2]);N.push(n[0],n[1],n[2]);if(ax==='t')U.push(p[0]/ts,p[2]/ts);else U.push((ax==='z'?p[2]:p[0])/ts,p[1]/ts)}I.push(base,base+1,base+2,base,base+2,base+3)}}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(N,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.setIndex(I);g.computeBoundingSphere();
    const m=new T.Mesh(g,MATS[k]);m.castShadow=m.receiveShadow=true;world.add(m)}}
/* ---------------- maps ---------------- */
let MAPW=96,MAPD=80,SPAWN={},SITES={},NAV=null,NW=0,ND=0,NCS=1,LOOT=[],BLD=[],radarImg=null,seed=1;
function breachMap(){MAPW=96;MAPD=80;mat('sand').userData.ts=3;mat('floor').userData.ts=4;mat('tile').userData.ts=2;mat('crate').userData.ts=1.2;mat('metal').userData.ts=2;
  const GW=48,GD=40,g=[];for(let z=0;z<GD;z++){g.push(new Array(GW).fill(1))}
  const carve=(x0,z0,x1,z1)=>{for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++)g[z][x]=0};
  [[16,33,31,38],[22,20,25,32],[22,6,25,19],[18,1,29,5],[32,31,37,35],[38,12,41,35],[31,3,44,12],[26,13,31,15],[29,2,31,5],[9,33,15,35],[5,15,8,35],[5,15,12,19],[3,3,15,14],[15,2,18,5],[15,9,21,11],[26,24,29,27],[18,24,21,27]].forEach(r=>carve(...r));
  // walls: merge solid cells
  const used=g.map(r=>r.map(()=>0));for(let z=0;z<GD;z++)for(let x=0;x<GW;x++){if(!g[z][x]||used[z][x])continue;let x1=x;while(x1+1<GW&&g[z][x1+1]&&!used[z][x1+1])x1++;let z1=z;outer:while(z1+1<GD){for(let k=x;k<=x1;k++)if(!g[z1+1][k]||used[z1+1][k])break outer;z1++}for(let zz=z;zz<=z1;zz++)for(let k=x;k<=x1;k++)used[zz][k]=1;
    const exposed=(()=>{for(let zz=z-1;zz<=z1+1;zz++)for(let k=x-1;k<=x1+1;k++){if(zz<0||k<0||zz>=GD||k>=GW)continue;if(!g[zz][k])return true}return false})();addBox(x*2,0,z*2,(x1+1)*2,exposed?6:6,(z1+1)*2,'sand',exposed?null:{invis:true})}
  // floors
  addBox(0,-1,0,MAPW,0,MAPD,'floor',{noCol:true});
  SITES={A:{x0:62,z0:6,x1:90,z1:26,cx:76,cz:15},B:{x0:6,z0:6,x1:32,z1:30,cx:18,cz:16}};
  addBox(62,-.99,6,90,.01,26,'tile',{noCol:true});addBox(6,-.99,6,32,.01,30,'tile',{noCol:true});
  const crate=(x,z,s,h)=>addBox(x-s/2,0,z-s/2,x+s/2,h||s,z+s/2,'crate');
  [[70,12,2,1],[72,12,2,2],[82,9,2,2],[82,11,2,1],[76,20,1.8,1],[66,22,2,2],[86,20,2,1],[74,6,2,1]].forEach(a=>crate(...a));
  [[12,12,2,1],[14,12,2,2],[22,10,2,2],[26,20,2,1],[10,24,2,2],[20,26,1.6,1],[28,8,2,1]].forEach(a=>crate(...a));
  [[47,30,1.8,1],[49,44,2,2],[50,16,1.6,1],[80,48,2,1],[80,40,2,2],[40,72,2,1],[56,70,2,2],[12,68,2,1],[14,40,1.6,1],[46,6,2,1],[42,52,2,2],[54,52,2,1]].forEach(a=>crate(...a));
  addBox(58,0,26,60,1.1,30,'metal');addBox(44,0,38,48.5,6,39,'sand');addBox(47.5,0,26,52,6,27,'sand');addBox(44,0,52,46,2.4,54,'crate');addBox(30,0,18,32,1.1,22,'metal');
  SPAWN={T:[],CT:[]};for(let i=0;i<5;i++){SPAWN.T.push([38+i*4,74]);SPAWN.CT.push([40+i*3,6])}
  // site letters
  [['A',76,15],['B',19,17]].forEach(([L,x,z])=>{const t=ctex(256,256,(gg,w,h)=>{gg.clearRect(0,0,w,h);gg.fillStyle='rgba(200,40,30,.8)';gg.font='900 220px Arial Black,sans-serif';gg.textAlign='center';gg.textBaseline='middle';gg.fillText(L,w/2,h/2+10)});const m=new T.Mesh(new T.PlaneGeometry(6,6).rotateX(-PI/2),new T.MeshStandardMaterial({map:t,transparent:true,roughness:.9,depthWrite:false}));m.position.set(x,.03,z);world.add(m)});
  // wall signs
  [['A →',62,58,4.2,1],['← B',30,60,4.2,0],['MID',47,40,4.2,0]].forEach(([s,x,z,y,rot])=>{const t=ctex(256,96,(gg,w,h)=>{gg.fillStyle='rgba(0,0,0,0)';gg.clearRect(0,0,w,h);gg.fillStyle='#f4f0e0';gg.font='900 64px Arial Black,sans-serif';gg.textAlign='center';gg.textBaseline='middle';gg.fillText(s,w/2,h/2)});const m=new T.Mesh(new T.PlaneGeometry(3,1.1),new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));m.position.set(x,y,z);world.add(m)});
  hashBoxes();buildMeshes();buildNav(1)}
function royaleMap(sd){const R=mulberry(sd);const r=(a,b)=>a+R()*(b-a);MAPW=MAPD=320;mat('plaster').userData.ts=3;mat('brick').userData.ts=3;mat('roof').userData.ts=3;mat('crate').userData.ts=1.2;mat('metal').userData.ts=2;mat('grass').userData.ts=6;mat('road').userData.ts=6;
  addBox(0,-1,0,MAPW,0,MAPD,'grass',{noCol:true});BLD=[];LOOT=[];
  // roads
  for(const zz of[100,220]){const m=new T.Mesh(new T.PlaneGeometry(MAPW,9).rotateX(-PI/2),mat('road',0xffffff));m.position.set(MAPW/2,.02,zz);m.receiveShadow=true;world.add(m)}for(const xx of[110,210]){const m=new T.Mesh(new T.PlaneGeometry(9,MAPD).rotateX(-PI/2),mat('road',0xffffff));m.position.set(xx,.025,MAPD/2);m.receiveShadow=true;world.add(m)}
  const wallSeg=(x0,z0,x1,z1,h,m,gaps)=>{// axis aligned wall with gaps [{p,w,kind:'door'|'win'}]
    const horiz=Math.abs(z1-z0)<.01,len=horiz?x1-x0:z1-z0,t=.3;let cur=0;const seg=(a,b,y0,y1)=>{if(b-a<.05)return;if(horiz)addBox(x0+a,y0,z0-t/2,x0+b,y1,z0+t/2,m);else addBox(x0-t/2,y0,z0+a,x0+t/2,y1,z0+b,m)};
    gaps.sort((a,b)=>a.p-b.p).forEach(gp=>{seg(cur,gp.p-gp.w/2,0,h);if(gp.kind==='win'){seg(gp.p-gp.w/2,gp.p+gp.w/2,0,1);seg(gp.p-gp.w/2,gp.p+gp.w/2,2.1,h)}else seg(gp.p-gp.w/2,gp.p+gp.w/2,2.3,h);cur=gp.p+gp.w/2});seg(cur,len,0,h)};
  const house=(x,z,w,d,storey)=>{const h=3.2,m=R()<.5?'plaster':'brick';const gaps=L=>{const a=[];const n=Math.max(1,Math.floor(L/5));for(let i=0;i<n;i++)a.push({p:(i+.5)*L/n,w:1.4,kind:'win'});return a};
    const sides=[[x,z,x+w,z,'n'],[x,z+d,x+w,z+d,'s'],[x,z,x,z+d,'w'],[x+w,z,x+w,z+d,'e']];const doorSide=Math.floor(R()*4),door2=(doorSide+2)%4;
    sides.forEach(([a,b,c2,d2],i)=>{const L=i<2?w:d;let gp=gaps(L);if(i===doorSide||i===door2&&R()<.6){gp=gp.filter(g2=>Math.abs(g2.p-L/2)>2);gp.push({p:L/2,w:1.9,kind:'door'})}wallSeg(a,b,c2,d2,h,m,gp)});
    addBox(x-.3,h,z-.3,x+w+.3,h+.25,z+d+.3,'roof');if(w>9){wallSeg(x+w/2,z,x+w/2,z+d,h,'plaster',[{p:d/2,w:1.9,kind:'door'}])}
    BLD.push({x,z,w,d});const n=Math.round(w*d/30)+1;for(let i=0;i<n;i++)LOOT.push({x:r(x+1,x+w-1),y:0,z:r(z+1,z+d-1)});if(R()<.4)LOOT.push({x:x+w/2,y:h+.25,z:z+d/2})};
  // towns
  const towns=[[60,60],[260,60],[160,160],[60,260],[260,260],[160,40],[40,160],[280,160],[160,285]];towns.forEach(([tx,tz],ti)=>{const n=ti===2?7:4;for(let i=0;i<n;i++){const w=Math.round(r(7,14)),d=Math.round(r(7,12));const x=tx+r(-28,28),z=tz+r(-28,28);if(BLD.some(b=>x<b.x+b.w+4&&x+w+4>b.x&&z<b.z+b.d+4&&z+d+4>b.z))continue;if([100,220].some(rz=>z<rz+6&&z+d>rz-6)||[110,210].some(rx=>x<rx+6&&x+w>rx-6))continue;house(x,z,w,d)}});
  // warehouses
  [[140,120],[190,250]].forEach(([x,z])=>{wallSeg(x,z,x+26,z,6,'metal',[{p:13,w:3,kind:'door'}]);wallSeg(x,z+18,x+26,z+18,6,'metal',[{p:6,w:3,kind:'door'}]);wallSeg(x,z,x,z+18,6,'metal',[{p:9,w:2,kind:'door'}]);wallSeg(x+26,z,x+26,z+18,6,'metal',[]);addBox(x-.3,6,z-.3,x+26.3,6.3,z+18.3,'roof');for(let i=0;i<6;i++){const cx=x+r(3,23),cz=z+r(3,15);addBox(cx-1,0,cz-1,cx+1,r(1,2.2),cz+1,'crate');LOOT.push({x:cx+2,y:0,z:cz})}BLD.push({x,z,w:26,d:18})});
  // trees, rocks, crates
  const trunkM=new T.MeshStandardMaterial({color:lin(0x5a4028),roughness:1}),leafM=new T.MeshStandardMaterial({color:lin(0x3a6a2a),roughness:.9,flatShading:true});const tg=new T.CylinderGeometry(.25,.35,5,6),lg=new T.IcosahedronGeometry(2.6,0);
  const trees=[];for(let i=0;i<260;i++){const x=r(5,MAPW-5),z=r(5,MAPD-5);if(BLD.some(b=>x>b.x-3&&x<b.x+b.w+3&&z>b.z-3&&z<b.z+b.d+3))continue;if([100,220].some(rz=>Math.abs(z-rz)<6)||[110,210].some(rx=>Math.abs(x-rx)<6))continue;trees.push([x,z]);addBox(x-.3,0,z-.3,x+.3,5,z+.3,'crate',{invis:true})}
  const ti=new T.InstancedMesh(tg,trunkM,trees.length),li=new T.InstancedMesh(lg,leafM,trees.length*2),mt=new T.Matrix4();trees.forEach(([x,z],i)=>{mt.makeTranslation(x,2.5,z);ti.setMatrixAt(i,mt);const s=r(.8,1.3);mt.makeScale(s,s*1.2,s);mt.setPosition(x,5.5,z);li.setMatrixAt(i*2,mt);mt.makeScale(s*.8,s,s*.8);mt.setPosition(x+r(-.5,.5),7.3,z+r(-.5,.5));li.setMatrixAt(i*2+1,mt)});ti.castShadow=li.castShadow=true;world.add(ti,li);
  for(let i=0;i<120;i++){const x=r(5,MAPW-5),z=r(5,MAPD-5);if(BLD.some(b=>x>b.x-2&&x<b.x+b.w+2&&z>b.z-2&&z<b.z+b.d+2))continue;const s=r(.8,2.2);addBox(x-s,0,z-s*.8,x+s,r(.7,1.8),z+s*.8,R()<.5?'metal':'crate');if(R()<.3)LOOT.push({x:x+s+1,y:0,z})}
  hashBoxes();buildMeshes();buildNav(2)}
/* ---------------- navigation grid + A* ---------------- */
function buildNav(cs){NCS=cs;NW=Math.ceil(MAPW/cs);ND=Math.ceil(MAPD/cs);NAV=new Uint8Array(NW*ND);const pr=.45;for(const b of boxes){if(b.noCol||b.y1<.5||b.y0>1.7)continue;const gx0=Math.max(0,Math.floor((b.x0-pr)/cs)),gx1=Math.min(NW-1,Math.floor((b.x1+pr)/cs)),gz0=Math.max(0,Math.floor((b.z0-pr)/cs)),gz1=Math.min(ND-1,Math.floor((b.z1+pr)/cs));for(let z=gz0;z<=gz1;z++)for(let x=gx0;x<=gx1;x++){const cx=(x+.5)*cs,cz=(z+.5)*cs;if(cx>b.x0-pr&&cx<b.x1+pr&&cz>b.z0-pr&&cz<b.z1+pr)NAV[z*NW+x]=1}}
  for(let x=0;x<NW;x++){NAV[x]=1;NAV[(ND-1)*NW+x]=1}for(let z=0;z<ND;z++){NAV[z*NW]=1;NAV[z*NW+NW-1]=1}}
function navFree(x,z){const gx=Math.floor(x/NCS),gz=Math.floor(z/NCS);if(gx<0||gz<0||gx>=NW||gz>=ND)return false;return!NAV[gz*NW+gx]}
function nearestFree(gx,gz){if(!NAV[gz*NW+gx])return[gx,gz];for(let r=1;r<8;r++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){const x=gx+dx,z=gz+dz;if(x>0&&z>0&&x<NW&&z<ND&&!NAV[z*NW+x])return[x,z]}return[gx,gz]}
function astar(sx,sz,tx,tz,maxN){let[ax,az]=nearestFree(clamp(Math.floor(sx/NCS),1,NW-2),clamp(Math.floor(sz/NCS),1,ND-2));let[bx,bz]=nearestFree(clamp(Math.floor(tx/NCS),1,NW-2),clamp(Math.floor(tz/NCS),1,ND-2));const S=az*NW+ax,G=bz*NW+bx;if(S===G)return[[tx,tz]];
  const gS=new Float32Array(NW*ND).fill(1e9),from=new Int32Array(NW*ND).fill(-1),closed=new Uint8Array(NW*ND);const heap=[];const push=(n,f)=>{heap.push([f,n]);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p}};const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=i*2+1,r2=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r2<heap.length&&heap[r2][0]<heap[m][0])m=r2;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m}}return top};
  const h=n=>{const x=n%NW,z=(n/NW)|0;const dx=Math.abs(x-bx),dz=Math.abs(z-bz);return Math.max(dx,dz)+.414*Math.min(dx,dz)};gS[S]=0;push(S,h(S));let N=0,best=S,bestH=h(S);
  while(heap.length&&N<(maxN||20000)){const[,n]=pop();if(closed[n])continue;closed[n]=1;N++;if(n===G){best=n;break}const hn=h(n);if(hn<bestH){bestH=hn;best=n}const x=n%NW,z=(n/NW)|0;
    for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dz)continue;const nx=x+dx,nz=z+dz;if(nx<0||nz<0||nx>=NW||nz>=ND)continue;const m=nz*NW+nx;if(NAV[m]||closed[m])continue;if(dx&&dz&&(NAV[z*NW+nx]||NAV[nz*NW+x]))continue;const g2=gS[n]+(dx&&dz?1.414:1);if(g2<gS[m]){gS[m]=g2;from[m]=n;push(m,g2+h(m))}}}
  const path=[];let n=best;while(n!==-1&&n!==S){path.push([(n%NW+.5)*NCS,(((n/NW)|0)+.5)*NCS]);n=from[n]}path.reverse();if(best===G)path.push([tx,tz]);
  // string pull
  const out=[];let cx=sx,cz=sz;for(let i=0;i<path.length;i++){const nxt=path[i+1];if(nxt&&walkLine(cx,cz,nxt[0],nxt[1]))continue;out.push(path[i]);cx=path[i][0];cz=path[i][1]}return out}
function walkLine(ax,az,bx,bz){const d=Math.hypot(bx-ax,bz-az),n=Math.ceil(d/(NCS*.5));for(let i=1;i<=n;i++){const t=i/n;if(!navFree(ax+(bx-ax)*t,az+(bz-az)*t))return false}return true}
/* ---------------- weapons ---------------- */
const WPN={
 knife:{n:'Knife',slot:3,melee:1,dmg:40,cd:.45,spd:5.6,kill:1500},
 glock:{n:'G-17 Viper',slot:2,dmg:28,pen:.47,rof:.15,mag:20,res:120,rel:2.2,spr:.012,mv:.035,rc:.35,spd:5.4,side:'T',kill:300,snd:[2600,.1]},
 usp:{n:'P9 Sentinel',slot:2,dmg:35,pen:.5,rof:.17,mag:12,res:24,rel:2.2,spr:.008,mv:.03,rc:.45,spd:5.4,side:'CT',kill:300,snd:[1900,.1]},
 deagle:{n:'Hand Cannon',slot:2,price:700,dmg:63,pen:.93,rof:.26,mag:7,res:35,rel:2.2,spr:.007,mv:.07,rc:1.6,spd:5.2,kill:300,snd:[900,.2]},
 mp5:{n:'Wasp SMG',slot:1,price:1250,dmg:27,pen:.6,rof:.075,mag:30,res:120,rel:2.6,auto:1,spr:.016,mv:.02,rc:.32,spd:5.6,kill:600,snd:[2200,.08]},
 nova:{n:'Nova Pump',slot:1,price:1050,dmg:26,pel:9,pen:.5,rof:.88,mag:8,res:32,rel:3.6,spr:.065,mv:.02,rc:2.2,spd:5.2,range:22,kill:900,snd:[700,.28]},
 ak:{n:'Raptor AK',slot:1,price:2700,dmg:36,pen:.78,rof:.1,mag:30,res:90,rel:2.5,auto:1,spr:.0045,mv:.075,rc:.62,spd:5,side:'T',kill:300,snd:[1100,.15]},
 m4:{n:'Warden M4',slot:1,price:2900,dmg:33,pen:.7,rof:.09,mag:30,res:90,rel:3.1,auto:1,spr:.004,mv:.065,rc:.5,spd:5.05,side:'CT',kill:300,snd:[1500,.12]},
 scout:{n:'Kestrel Scout',slot:1,price:1700,dmg:88,pen:.85,rof:1.25,mag:10,res:90,rel:3.7,spr:.03,sspr:.0012,scope:2.8,mv:.08,rc:1.8,spd:5.2,kill:300,snd:[1300,.2]},
 awp:{n:'Longbow',slot:1,price:4750,dmg:115,pen:.97,rof:1.46,mag:5,res:30,rel:3.7,spr:.06,sspr:.0006,scope:4.5,mv:.2,rc:2.8,spd:4.3,kill:100,snd:[600,.35]},
 he:{n:'HE Grenade',slot:4,price:300,gren:'he'},flash:{n:'Flashbang',slot:4,price:200,gren:'flash'},smoke:{n:'Smoke',slot:4,price:300,gren:'smoke'},
 bomb:{n:'Bomb',slot:5,bomb:1,spd:5.4}};
const BUY=[['PISTOLS',['deagle']],['SMG / SHOTGUN',['mp5','nova']],['RIFLES',['ak','m4','scout','awp']],['GEAR',['vest','vesthelm','kit']],['GRENADES',['he','flash','smoke']]];const GEAR={vest:{n:'Kevlar',price:650},vesthelm:{n:'Kevlar + Helmet',price:1000},kit:{n:'Defuse kit',price:400,side:'CT'}};
/* gun models */
function gunModel(id,vm){const g=new T.Group(),D=new T.MeshStandardMaterial({color:lin(0x26282c),roughness:.4,metalness:.6}),Wd=new T.MeshStandardMaterial({color:lin(id==='ak'?0x8a4a22:0x3a3c40),roughness:.6}),Tn=new T.MeshStandardMaterial({color:lin(0x6a6048),roughness:.7});
  const B=(w,h,d,x,y,z,m)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),m||D);b.position.set(x,y,z);g.add(b);return b},C=(r,l,x,y,z,m)=>{const b=new T.Mesh(new T.CylinderGeometry(r,r,l,10),m||D);b.rotation.x=PI/2;b.position.set(x,y,z);g.add(b);return b};
  if(id==='knife'){B(.025,.03,.12,0,0,.04,Wd);const bl=new T.Mesh(new T.BoxGeometry(.006,.035,.2),new T.MeshStandardMaterial({color:0xd8dce0,metalness:1,roughness:.15}));bl.position.set(0,.005,-.12);g.add(bl)}
  else if(id==='glock'||id==='usp'||id==='deagle'){const L=id==='deagle'?.26:.19;B(.032,.04,L,0,.02,-L/2+.03);B(.03,.1,.045,0,-.045,.02,Wd).rotation.x=.2;if(id==='usp')C(.012,.08,0,.025,-L+.0);}
  else if(id==='mp5'){B(.045,.07,.3,0,0,-.08);C(.013,.12,0,.015,-.28);B(.035,.14,.04,0,-.09,-.12).rotation.x=.25;B(.03,.08,.035,0,-.06,.02).rotation.x=.3;B(.02,.04,.18,0,.02,.12)}
  else if(id==='nova'){B(.045,.06,.5,0,.01,-.15,Wd);C(.018,.45,0,.03,-.4);C(.02,.25,0,-.01,-.3,Tn);B(.04,.08,.2,0,-.02,.18,Wd).rotation.x=-.2}
  else if(id==='ak'){B(.048,.08,.34,0,.01,-.05);C(.013,.36,0,.03,-.38);B(.04,.05,.18,0,-.005,-.25,Wd);const mg=B(.035,.16,.06,0,-.1,-.08);mg.rotation.x=.35;B(.03,.1,.04,0,-.06,.07).rotation.x=.3;B(.04,.08,.24,0,-.01,.22,Wd)}
  else if(id==='m4'){B(.046,.08,.34,0,.01,-.05);C(.012,.34,0,.03,-.37);B(.05,.06,.2,0,.01,-.24);B(.034,.15,.05,0,-.1,-.06).rotation.x=.15;B(.03,.1,.04,0,-.06,.07).rotation.x=.3;B(.04,.07,.22,0,0,.22);B(.02,.035,.16,0,.07,-.03)}
  else if(id==='scout'||id==='awp'){const big=id==='awp';B(.05,.08,.42,0,0,-.02,big?new T.MeshStandardMaterial({color:lin(0x3a5a3a),roughness:.6}):D);C(.013,big?.6:.5,0,.02,big?-.52:-.47);C(.026,.26,0,.1,-.05);C(.03,.04,0,.1,-.19);B(.03,.1,.04,0,-.06,.08).rotation.x=.3;B(.045,.1,.26,0,-.02,.28,big?new T.MeshStandardMaterial({color:lin(0x3a5a3a),roughness:.6}):Wd);B(.034,.08,.05,0,-.07,-.05)}
  else if(id==='he'||id==='flash'||id==='smoke'){const s=new T.Mesh(id==='he'?new T.SphereGeometry(.04,10,8):new T.CylinderGeometry(.032,.032,.1,10),new T.MeshStandardMaterial({color:lin(id==='he'?0x4a5a3a:id==='flash'?0x9aa0a8:0x6a7a8a),roughness:.5,metalness:.3}));g.add(s);B(.012,.03,.012,0,.06,0)}
  else if(id==='bomb'){B(.22,.1,.16,0,0,0,new T.MeshStandardMaterial({color:lin(0x5a4a30),roughness:.7}));B(.08,.02,.06,.04,.06,0,new T.MeshStandardMaterial({color:lin(0x1a3a1a),emissive:lin(0x1a4a1a)}));for(let i=0;i<3;i++)C(.02,.2,-.06,.05,-.05+i*.05,new T.MeshStandardMaterial({color:lin(0xc8322a)})).rotation.set(0,0,PI/2)}
  g.traverse(o=>{if(o.isMesh)o.castShadow=!vm});return g}
/* ---------------- characters ---------------- */
function mkChar(team){const g=new T.Group(),M=(c2,r)=>new T.MeshStandardMaterial({color:lin(c2),roughness:r||.8});
  const pal=team==='T'?{u:0x8a7a58,v:0x5a4a38,h:0x2a2622,s:0xc89878,b:0x3a3024}:team==='CT'?{u:0x3a4a5a,v:0x2a3440,h:0x2a3440,s:0xd8a888,b:0x1a1e22}:pick([{u:0x5a6a3a,v:0x3a4428,h:0x4a5a3a,s:0xc89878,b:0x2a2418},{u:0x6a5a4a,v:0x4a3a2a,h:0x3a2a1a,s:0xe0b090,b:0x2a2018},{u:0x3a3a4a,v:0x2a2a38,h:0x1a1a22,s:0x9a6a4a,b:0x1a1a1a}]);
  const uM=M(pal.u),vM=M(pal.v),sM=M(pal.s,.6),bM=M(pal.b),hM=M(pal.h,.5);
  const box=(w,h,d,m,par,x,y,z)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(x||0,y||0,z||0);b.castShadow=true;par.add(b);return b};
  const hips=new T.Group();hips.position.y=.95;g.add(hips);const legs=[-1,1].map(s=>{const hp=new T.Group();hp.position.set(s*.11,0,0);hips.add(hp);box(.17,.46,.2,uM,hp,0,-.23,0);const kn=new T.Group();kn.position.y=-.46;hp.add(kn);box(.15,.44,.17,uM,kn,0,-.22,0);box(.16,.1,.28,bM,kn,0,-.45,-.05);return{hp,kn}});
  const torso=new T.Group();hips.add(torso);box(.44,.56,.26,uM,torso,0,.3,0);box(.46,.4,.3,vM,torso,0,.36,0);const head=new T.Group();head.position.y=.72;torso.add(head);box(.2,.24,.22,sM,head,0,.02,0);
  if(team==='CT'){box(.25,.13,.27,hM,head,0,.15,0);box(.2,.05,.03,M(0x111111,.2),head,0,.04,-.12)}else if(team==='T'){box(.22,.26,.24,hM,head,0,.03,.005);box(.16,.05,.02,sM,head,0,.05,-.121)}else{box(.23,.08,.25,hM,head,0,.14,0)}
  const arms=[-1,1].map(s=>{const sh=new T.Group();sh.position.set(s*.28,.52,0);torso.add(sh);box(.12,.32,.13,uM,sh,0,-.15,0);const el2=new T.Group();el2.position.y=-.3;sh.add(el2);box(.1,.3,.11,uM,el2,0,-.14,0);box(.09,.09,.1,sM,el2,0,-.31,0);return{sh,el:el2}});
  arms[1].sh.rotation.set(-1.25,0,.1);arms[1].el.rotation.x=-.25;arms[0].sh.rotation.set(-1.35,0,-.55);arms[0].el.rotation.x=-.35;
  const gunHold=new T.Group();gunHold.position.set(.06,.42,-.32);torso.add(gunHold);g.userData={hips,torso,head,legs,arms,gunHold,gunId:null,ph:0};g.traverse(o=>{if(o.isMesh)o.receiveShadow=true});return g}
function setCharGun(p){const u=p.mdl.userData,id=p.cur||'knife';if(u.gunId===id)return;u.gunHold.clear();const gm=gunModel(id);gm.scale.setScalar(1.15);u.gunHold.add(gm);u.gunId=id}
function poseChar(p,dt){const u=p.mdl.userData;const sp=Math.hypot(p.vx,p.vz);u.ph+=dt*sp*2.2;const w=Math.min(1,sp/4)*(p.onGround?1:.3);const s=Math.sin(u.ph);
  u.legs[0].hp.rotation.x=s*.7*w;u.legs[1].hp.rotation.x=-s*.7*w;u.legs[0].kn.rotation.x=Math.max(0,-Math.cos(u.ph))*1*w;u.legs[1].kn.rotation.x=Math.max(0,Math.cos(u.ph))*1*w;
  const cr=p.crouchT||0;u.hips.position.y=.95-cr*.42;u.legs.forEach((l,i)=>{l.hp.rotation.x-=cr*1.1;l.kn.rotation.x+=cr*1.9});u.torso.rotation.x=-clamp(p.pitch,-.8,.8)*.35+cr*.15;u.head.rotation.x=-clamp(p.pitch,-.8,.8)*.5;
  if(!p.onGround){u.legs[0].kn.rotation.x=.9;u.legs[1].kn.rotation.x=.5}
  if(!p.alive){p.deadT=(p.deadT||0)+dt;const k=Math.min(1,p.deadT*2.2);p.mdl.rotation.x=lerp(0,-PI/2*.98,k*k);p.mdl.position.y=p.y+.15*k}else{p.mdl.rotation.x=0}}
/* ---------------- state ---------------- */
let players=[],me=null,state='menu',NETROLE='solo',diff=S.get(GAME+'_diff',1),nameMe=S.get('tx_name','')||('Player'+Math.floor(Math.random()*900+100)),teamPref=S.get(GAME+'_team','auto');
let round={n:0,phase:'buy',t:0,score:{T:0,CT:0},lossStreak:{T:0,CT:0},winner:null,msg:''},bomb=null,grens=[],smokes=[],fxList=[],feed=[],zone=null,plane=null,items=[],nextId=1,matchOver=false,WINS=8;
const fx=new T.Group();scene.add(fx);
/* ---------------- sky + light ---------------- */
{const sky=new T.Mesh(new T.SphereGeometry(ROY?1250:350,24,12),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{},vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:ROY?'varying vec3 vD;void main(){float y=vD.y;vec3 c=mix(vec3(.78,.86,.94),vec3(.28,.52,.86),pow(max(y,0.),.5));vec3 s=normalize(vec3(.4,.6,-.5));c+=vec3(1.,.9,.7)*pow(max(dot(vD,s),0.),200.)*2.;gl_FragColor=vec4(c,1.);}':'varying vec3 vD;void main(){float y=vD.y;vec3 c=mix(vec3(.96,.86,.7),vec3(.42,.62,.86),pow(max(y,0.),.55));vec3 s=normalize(vec3(.5,.55,-.4));c+=vec3(1.,.85,.6)*pow(max(dot(vD,s),0.),120.)*2.5;gl_FragColor=vec4(c,1.);}'}));sky.renderOrder=-1;scene.add(sky);st3.onFrame(()=>sky.position.copy(camera.position))}
const hemi=new T.HemisphereLight(ROY?0xcfe0ff:0xfff0dc,ROY?0x5a6a3a:0x8a6a4a,.75);scene.add(hemi);const sun=new T.DirectionalLight(ROY?0xfff4e0:0xffe8c8,ROY?1.7:2);scene.add(sun,sun.target);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;
Object.assign(sun.shadow.camera,{left:-50,right:50,top:50,bottom:-50,near:1,far:260});scene.fog=new T.Fog(ROY?0xc8d8e8:0xe8d8c0,ROY?120:60,ROY?700:260);
/* ---------------- players ---------------- */
function mkPlayer(o){const p=Object.assign({id:nextId++,name:'Bot',team:'T',bot:true,peer:null,x:0,y:0,z:0,vx:0,vy:0,vz:0,yaw:0,pitch:0,hp:100,armor:0,helmet:false,kit:false,alive:true,money:800,inv:{},cur:'knife',prev:'knife',ammo:{},fireCd:0,rel:0,shotI:0,lastShot:0,rcP:0,rcY:0,crouchT:0,onGround:true,kills:0,deaths:0,inp:{},ai:null,flashT:0,useT:0,swapT:0,scoped:0,heals:{b:0,m:0},healT:0,chute:0,inPlane:false,dmgT:0,spd:0},o);p.mdl=mkChar(ROY?'R':p.team);scene.add(p.mdl);players.push(p);return p}
function giveW(p,id,full){if(WPN[id].slot===4){p.inv.g=p.inv.g||[];if(p.inv.g.length<3&&!p.inv.g.includes(id))p.inv.g.push(id);return}const s=WPN[id].slot;if(s!==5)p.inv[s]=id;else p.inv[5]='bomb';if(WPN[id].mag)p.ammo[id]={mag:WPN[id].mag,res:full===false?0:WPN[id].res}}
function slotW(p,s){return s===4?(p.inv.g&&p.inv.g[0]):p.inv[s]}
function equip(p,id){if(!id||p.cur===id)return;p.prev=p.cur;p.cur=id;p.swapT=.45;p.rel=0;p.scoped=0;p.shotI=0;if(p===me)vmSet()}
function bestSlot(p){return p.inv[1]||p.inv[2]||'knife'}
function resetForRound(p,spawn){p.alive=true;p.hp=100;p.deadT=0;p.vx=p.vy=p.vz=0;p.x=spawn[0]+rnd(-.6,.6);p.z=spawn[1]+rnd(-.6,.6);p.y=groundAt(p.x,p.z,.3,10);p.yaw=p.team==='T'?0:PI;p.pitch=0;p.mdl.visible=true;p.mdl.rotation.x=0;p.flashT=0;p.fireCd=0;p.rel=0;p.rcP=p.rcY=0;p.plantT=0;p.defT=0;p.scoped=0;
  if(!p.inv[2])giveW(p,p.team==='T'?'glock':'usp');if(!p.inv[3])p.inv[3]='knife';for(const k in p.ammo){if(WPN[k].mag){p.ammo[k].mag=WPN[k].mag;p.ammo[k].res=WPN[k].res}}equip(p,bestSlot(p));p.cur=bestSlot(p)}
/* ---------------- movement ---------------- */
function moveP(p,dt,inp){const W=WPN[p.cur]||WPN.knife;let spd=(W.spd||5.4)*(inp.walk?.52:1)*(p.crouchT>.5?.36:1)*(p.scoped?.6:1)*(p.plantT>0||p.defT>0||p.healT>0?0:1);if(!ROY&&round.phase==='buy'&&round.n>0)spd=0;
  const fw=(inp.f?1:0)-(inp.b?1:0),st=(inp.r?1:0)-(inp.l?1:0);let wx=-Math.sin(p.yaw)*fw+Math.cos(p.yaw)*st,wz=-Math.cos(p.yaw)*fw-Math.sin(p.yaw)*st;const wl=Math.hypot(wx,wz);if(wl>0){wx/=wl;wz/=wl}
  const tvx=wx*spd,tvz=wz*spd,a=p.onGround?Math.min(1,dt*11):Math.min(1,dt*1.6);p.vx+=(tvx-p.vx)*a;p.vz+=(tvz-p.vz)*a;
  p.crouchT=clamp(p.crouchT+(inp.c?1:-1)*dt*7,0,1);const H=1.8-p.crouchT*.55;
  if(inp.j&&p.onGround&&!p.jHeld){p.vy=6.2;p.onGround=false}p.jHeld=inp.j;p.vy-=17*dt;
  // horizontal collision
  const r=.38;let nx=p.x+p.vx*dt,nz=p.z+p.vz*dt;for(let pass=0;pass<2;pass++)nearBoxes(nx-r-1,nz-r-1,nx+r+1,nz+r+1,b=>{if(b.noCol||b.y1<=p.y+.36||b.y0>=p.y+H)return;const cx=clamp(nx,b.x0,b.x1),cz=clamp(nz,b.z0,b.z1),dx=nx-cx,dz=nz-cz,d=Math.hypot(dx,dz);if(d<r){if(d>1e-5){nx=cx+dx/d*r;nz=cz+dz/d*r}else{const e=[nx-b.x0,b.x1-nx,nz-b.z0,b.z1-nz],m=Math.min(...e);if(m===e[0])nx=b.x0-r;else if(m===e[1])nx=b.x1+r;else if(m===e[2])nz=b.z0-r;else nz=b.z1+r}}});
  p.x=clamp(nx,.5,MAPW-.5);p.z=clamp(nz,.5,MAPD-.5);let ny=p.y+p.vy*dt;const g=groundAt(p.x,p.z,r*.8,p.y+.4);if(ny<=g){if(g-p.y<.4&&g>p.y&&p.onGround)ny=g;ny=Math.max(ny,g);if(p.vy<0){if(p.vy<-11&&p.alive)hurtP(p,Math.round((-p.vy-11)*9),null,'fall');p.vy=0;p.onGround=true}}else p.onGround=ny-g<.05;
  let ceil=false;nearBoxes(p.x-r,p.z-r,p.x+r,p.z+r,b=>{if(b.noCol)return;if(b.y0>p.y+.5&&b.y0<ny+H&&p.x+r>b.x0&&p.x-r<b.x1&&p.z+r>b.z0&&p.z-r<b.z1)ceil=true});if(ceil&&p.vy>0){p.vy=0;ny=p.y}p.y=ny;p.spd=Math.hypot(p.vx,p.vz)}
/* ---------------- shooting ---------------- */
function eyeY(p){return p.y+1.64-p.crouchT*.5}
function hitTest(p,ox,oy,oz,dx,dy,dz,maxT){let best=null;for(const q of players){if(q===p||!q.alive||q.inPlane)continue;const ey=eyeY(q);const parts=[[q.x,ey-.02,q.z,.16,'head'],[q.x,q.y+1.2-q.crouchT*.4,q.z,.3,'chest'],[q.x,q.y+.85-q.crouchT*.35,q.z,.28,'stomach'],[q.x,q.y+.45-q.crouchT*.2,q.z,.24,'legs']];
  for(const[cx,cy,cz,r,part]of parts){const lx=cx-ox,ly=cy-oy,lz=cz-oz,t=lx*dx+ly*dy+lz*dz;if(t<0||t>maxT)continue;const d2=lx*lx+ly*ly+lz*lz-t*t;if(d2<r*r){const th=t-Math.sqrt(r*r-d2);if(!best||th<best.t)best={t:th,q,part}}}}return best}
function fire(p,now){const id=p.cur,W=WPN[id];if(!W||p.swapT>0||!p.alive)return;
  if(W.melee){if(p.fireCd>0)return;p.fireCd=W.cd;evt({k:'swing',p:p.id});const dx=-Math.sin(p.yaw)*Math.cos(p.pitch),dy=Math.sin(p.pitch),dz=-Math.cos(p.yaw)*Math.cos(p.pitch);const h=hitTest(p,p.x,eyeY(p),p.z,dx,dy,dz,W.rng||1.8);if(h){const back=Math.cos(h.q.yaw-p.yaw)>.5;hurtP(h.q,back?120:W.dmg,p,id)}return}
  if(W.gren){if(p.fireCd>0)return;throwGren(p,id);return}if(W.bomb)return;
  const am=p.ammo[id];if(!am||p.fireCd>0||p.rel>0)return;if(am.mag<=0){if(am.res>0)reload(p);else{p.fireCd=.25;evt({k:'dry',p:p.id})}return}
  am.mag--;p.fireCd=W.rof;if(now-p.lastShot>(W.auto?.35:.5)*1.4)p.shotI=0;p.lastShot=now;
  const mv=Math.min(1,p.spd/4),air=p.onGround?0:.12;let spr=(p.scoped&&W.sspr!=null?W.sspr:W.spr)+mv*W.mv+air+(W.auto?Math.min(p.shotI,12)*.0022:0);spr*=p.crouchT>.5?.72:1;
  // recoil pattern
  const i=p.shotI;const up=W.auto?Math.min(i,9)*.012*W.rc*1.6+(i>9?Math.sin(i*.9)*.004:0):W.rc*.02,side=W.auto&&i>6?Math.sin(i*.55)*.02*W.rc:(Math.random()-.5)*.01*W.rc;p.rcP+=up*.55;p.rcY+=side*.5;p.shotI++;
  const pel=W.pel||1,ox=p.x,oy=eyeY(p),oz=p.z;for(let k=0;k<pel;k++){const a=Math.random()*2*PI,rr=Math.sqrt(Math.random())*spr;const yaw=p.yaw+p.rcY+Math.cos(a)*rr,pit=p.pitch+p.rcP*1.2+Math.sin(a)*rr;const dx=-Math.sin(yaw)*Math.cos(pit),dy=Math.sin(pit),dz=-Math.cos(yaw)*Math.cos(pit);
    const wh=ray(ox,oy,oz,dx,dy,dz,W.range||200);const maxT=wh?wh.t:(W.range||200);const h=hitTest(p,ox,oy,oz,dx,dy,dz,maxT);let end=h?h.t:maxT;
    if(h){const dmgMul={head:4,chest:1,stomach:1.25,legs:.75}[h.part];let dmg=W.dmg*dmgMul*Math.pow(.98,h.t/10)*(W.pel&&h.t>8?Math.max(.3,1-(h.t-8)/20):1);const armored=h.part==='head'?h.q.helmet:h.part!=='legs'&&h.q.armor>0;if(armored){const ab=dmg*(1-W.pen)*.5;h.q.armor=Math.max(0,h.q.armor-ab);dmg*=W.pen}hurtP(h.q,Math.round(dmg),p,id,h.part==='head');if(k===0)evt({k:'hit',p:p.id,x:ox+dx*end,y:oy+dy*end,z:oz+dz*end,b:1})}
    else if(wh&&k<3)evt({k:'imp',x:ox+dx*end,y:oy+dy*end,z:oz+dz*end,n:wh.b.m});
    if(k<2)evt({k:'tr',p:p.id,x:ox+dx*end,y:oy+dy*end,z:oz+dz*end})}
  evt({k:'shot',p:p.id,w:id});if(p.scoped&&(id==='awp'||id==='scout'))p.scoped=0,p.rescope=.5}
function reload(p){const W=WPN[p.cur],am=p.ammo[p.cur];if(!W||!am||p.rel>0||am.mag>=W.mag||am.res<=0)return;p.rel=W.rel;p.scoped=0;evt({k:'rel',p:p.id})}
function finishReload(p){const W=WPN[p.cur],am=p.ammo[p.cur];if(!am)return;const n=Math.min(W.mag-am.mag,am.res);am.mag+=n;am.res-=n}
function hurtP(q,dmg,by,w,hs){if(!q.alive||dmg<=0)return;q.hp-=dmg;q.dmgT=.4;if(by&&by!==q)q.lastHitBy=by.id;evt({k:'hurt',p:q.id,d:dmg,from:by?by.id:0});if(q.bot&&by)q.ai.alert={x:by.x,z:by.z,t:3};if(q.hp<=0)kill(q,by,w,hs)}
function kill(q,by,w,hs){q.alive=false;q.hp=0;q.deaths++;q.deadT=0;q.plantT=q.defT=0;if(by&&by!==q&&by.team!==q.team){by.kills++;if(!ROY)by.money=Math.min(16000,by.money+(WPN[w]&&WPN[w].kill||300))}else if(by&&ROY&&by!==q)by.kills++;
  evt({k:'kill',a:by?by.id:0,v:q.id,w:w||'',hs:!!hs},true);if(ROY)dropAll(q);else{if(q.inv[5]){q.inv[5]=null;dropBomb(q)}if(q.inv[1]&&Math.random()<1)dropGun(q,q.inv[1]);q.inv={2:null,3:'knife'};q.inv[2]=null;q.ammo={};q.armor=0;q.helmet=false;q.kit=false;q.cur='knife'}}
/* ---------------- grenades ---------------- */
function throwGren(p,id){p.fireCd=.9;p.inv.g=p.inv.g.filter(g2=>g2!==id);const dx=-Math.sin(p.yaw)*Math.cos(p.pitch),dy=Math.sin(p.pitch)+.15,dz=-Math.cos(p.yaw)*Math.cos(p.pitch);const g=new T.Group();g.add(gunModel(id));fx.add(g);grens.push({id,x:p.x+dx*.5,y:eyeY(p)-.1,z:p.z+dz*.5,vx:dx*15+p.vx,vy:dy*15,vz:dz*15+p.vz,t:0,fuse:id==='he'?1.6:id==='flash'?1.4:1.8,m:g,by:p.id});evt({k:'throw',p:p.id});equip(p,bestSlot(p))}
function stepGrens(dt){for(let i=grens.length-1;i>=0;i--){const g=grens[i];g.t+=dt;g.vy-=14*dt;const nx=g.x+g.vx*dt,ny=g.y+g.vy*dt,nz=g.z+g.vz*dt;const d=Math.hypot(g.vx*dt,g.vy*dt,g.vz*dt)||1e-6;const h=ray(g.x,g.y,g.z,g.vx*dt/d,g.vy*dt/d,g.vz*dt/d,d+.06);
    if(h||ny<.05){const px=g.x+g.vx*dt/d*(h?h.t:0),pz=g.z+g.vz*dt/d*(h?h.t:0);if(ny<.05||(h&&Math.abs(g.y-(h.b.y1))<.1)){g.vy=-g.vy*.35;g.vx*=.6;g.vz*=.6;g.y=Math.max(g.y,ny<.05?.05:h.b.y1+.05)}else{const ins=[Math.abs(px-h.b.x0),Math.abs(px-h.b.x1)],inz=[Math.abs(pz-h.b.z0),Math.abs(pz-h.b.z1)];if(Math.min(...ins)<Math.min(...inz))g.vx=-g.vx*.45;else g.vz=-g.vz*.45}if(Math.hypot(g.vx,g.vy,g.vz)>2)evt({k:'bounce',x:g.x,y:g.y,z:g.z})}else{g.x=nx;g.y=ny;g.z=nz}
    g.m.position.set(g.x,g.y,g.z);g.m.rotation.x+=dt*8;if(g.t>=g.fuse){fx.remove(g.m);grens.splice(i,1);detonate(g)}}}
function detonate(g){const by=players.find(p=>p.id===g.by);evt({k:'gren',id:g.id,x:g.x,y:g.y,z:g.z},true);
  if(g.id==='he'){for(const q of players){if(!q.alive)continue;const d=Math.hypot(q.x-g.x,q.y+1-g.y,q.z-g.z);if(d<8&&losClear({x:g.x,y:g.y+.2,z:g.z},{x:q.x,y:q.y+1,z:q.z})){let dmg=98*(1-d/8)*(q.armor>0?.6:1);hurtP(q,Math.round(dmg),by,'he')}}}
  if(g.id==='flash'){for(const q of players){if(!q.alive)continue;const e={x:q.x,y:eyeY(q),z:q.z};const d=Math.hypot(e.x-g.x,e.y-g.y,e.z-g.z);if(d>30||!losClear({x:g.x,y:g.y+.1,z:g.z},e))continue;const fdx=-Math.sin(q.yaw),fdz=-Math.cos(q.yaw),dot=((g.x-e.x)*fdx+(g.z-e.z)*fdz)/(d||1);q.flashT=Math.max(q.flashT,(dot>.3?4.2:dot>-.2?2:.7)*(1-d/34))}}
  if(g.id==='smoke')smokes.push({x:g.x,y:g.y+1.4,z:g.z,r:4.2,t:0,life:17})}
/* ---------------- bomb ---------------- */
function dropBomb(p){bomb={st:'dropped',x:p.x,y:groundAt(p.x,p.z,.2,p.y+.5)+.05,z:p.z,t:0,car:null};evt({k:'bombdrop'},true)}
function inSite(x,z){for(const k in SITES){const s=SITES[k];if(x>s.x0&&x<s.x1&&z>s.z0&&z<s.z1)return k}return null}
/* ---------------- drops (breach guns, royale loot) ---------------- */
function mkItem(o){const it=Object.assign({id:nextId++,t:'gun',w:null,x:0,y:0,z:0},o);const g=new T.Group();if(it.t==='gun')g.add(gunModel(it.w));else{const colr={ammo:0x8a7a3a,vest:0x3a4a5a,helm:0x4a5a3a,band:0xf0f0f0,med:0xe83a3a}[it.t]||0x888888;const b=new T.Mesh(it.t==='helm'?new T.SphereGeometry(.16,10,8,0,2*PI,0,PI/2):new T.BoxGeometry(it.t==='ammo'?.3:.35,it.t==='vest'?.4:.18,.25),new T.MeshStandardMaterial({color:lin(colr),roughness:.6}));g.add(b);if(it.t==='med'||it.t==='band'){const cr=new T.Mesh(new T.BoxGeometry(.2,.02,.06),new T.MeshBasicMaterial({color:it.t==='med'?0xffffff:0xe83a3a}));cr.position.y=.1;g.add(cr);const cr2=cr.clone();cr2.rotation.y=PI/2;g.add(cr2)}}
  const ring=new T.Mesh(new T.RingGeometry(.35,.42,20).rotateX(-PI/2),new T.MeshBasicMaterial({color:it.t==='gun'?0xffd23f:0x7aff8a,transparent:true,opacity:.6}));ring.position.y=-.1;g.add(ring);g.position.set(it.x,it.y+.15,it.z);fx.add(g);it.m=g;items.push(it);return it}
function takeItem(it){fx.remove(it.m);items.splice(items.indexOf(it),1)}
function dropGun(p,w){const am=p.ammo[w];mkItem({t:'gun',w,x:p.x+rnd(-.5,.5),y:groundAt(p.x,p.z,.2,p.y+.5),z:p.z+rnd(-.5,.5),mag:am?am.mag:0,res:am?am.res:0});evtItems()}
function dropAll(p){for(const s of[1,2]){if(p.inv[s])dropGun(p,p.inv[s])}if(p.heals.m)mkItem({t:'med',x:p.x+.6,y:p.y,z:p.z});if(p.armor>20)mkItem({t:'vest',lv:p.armorLv||1,x:p.x-.6,y:p.y,z:p.z});p.inv={3:'knife'};p.ammo={};p.cur='knife';evtItems()}
function pickUp(p,it){if(it.t==='gun'){const s=WPN[it.w].slot;if(ROY&&s===1&&p.inv[1]&&!p.inv[2]){p.inv[2]=it.w}else{if(p.inv[s])dropGun(p,p.inv[s]);p.inv[s]=it.w}p.ammo[it.w]={mag:it.mag!=null?it.mag:WPN[it.w].mag,res:it.res!=null?it.res:Math.round(WPN[it.w].mag*(ROY?1.5:WPN[it.w].res/WPN[it.w].mag))};if(WPN[p.cur]&&WPN[p.cur].melee||!p.inv[1]||s===1)equip(p,it.w)}
  else if(it.t==='ammo'){for(const k in p.ammo){p.ammo[k].res+=WPN[k].mag*2}}else if(it.t==='vest'){if((it.lv||1)*25+25>p.armor){p.armor=(it.lv||1)*25+25;p.armorLv=it.lv||1}}else if(it.t==='helm'){p.helmet=true}else if(it.t==='band')p.heals.b++;else if(it.t==='med')p.heals.m++;
  evt({k:'pick',p:p.id,t:it.t,w:it.w},false);takeItem(it);evtItems()}
let itemsDirty=true;function evtItems(){itemsDirty=true}
/* ---------------- events (host -> clients) ---------------- */
let evQ=[],evRel=[];function evt(e,rel){evQ.push(e);if(rel)evRel.push(e);applyEvt(e,true)}
const tracers=[];const trGeo=new T.BufferGeometry();trGeo.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(200*6),3));const trLines=new T.LineSegments(trGeo,new T.LineBasicMaterial({color:0xfff0a0,transparent:true,opacity:.8}));trLines.frustumCulled=false;scene.add(trLines);
const puffTex=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new T.CanvasTexture(cv)})();
let puffs=[];function puff(x,y,z,col,s,life,v,op){const m=new T.Sprite(new T.SpriteMaterial({map:puffTex,color:col,transparent:true,depthWrite:false,opacity:op||.7}));m.position.set(x,y,z);m.scale.setScalar(s);fx.add(m);puffs.push({m,life,max:life,v:v||new V3(),op:op||.7,g:1})}
function pById(id){return players.find(p=>p.id===id)}
function snd3(x,z,f,dur,vol,type){if(muted)return;const d=me?Math.hypot(x-me.x,z-me.z):0;const v=vol*clamp(1-d/(ROY?140:70),0,1);if(v<.004)return;if(type==='n')noise(dur,'lowpass',f,v);else sweep(f,f*.4,dur,'sine',v)}
function applyEvt(e,local){const p=e.p?pById(e.p):null;
  if(e.k==='shot'&&p){const W=WPN[e.w]||{};snd3(p.x,p.z,W.snd?W.snd[0]:1500,W.snd?W.snd[1]:.1,p===me?.4:.3,'n');if(p===me){vmKick(e.w)}else{flashAt(p);if(p.bot===false||true)for(const q of players)if(q.bot&&q.alive&&q.team!==p.team&&Math.hypot(q.x-p.x,q.z-p.z)<30&&q.ai)q.ai.alert={x:p.x,z:p.z,t:2}}}
  if(e.k==='tr'&&p){const from=p===me?muzzleWorld():new V3(p.x,eyeY(p)-.15,p.z);tracers.push({a:from,b:new V3(e.x,e.y,e.z),l:.06})}
  if(e.k==='imp'){puff(e.x,e.y,e.z,e.n==='sand'||e.n==='floor'?0xc8a878:0x888888,.35,.5,new V3(0,.4,0),.8);if(Math.random()<.4&&Math.hypot(e.x-camera.position.x,e.z-camera.position.z)<20)beep(rnd(2500,4000),.02,'square',.01)}
  if(e.k==='hit'){puff(e.x,e.y,e.z,0xa01010,.3,.35,new V3(0,.2,0),.9);if(p===me){hitmark=.2;beep(1500,.03,'square',.03)}}
  if(e.k==='hurt'&&e.p===(me&&me.id)){hurtFx=Math.min(1,hurtFx+e.d/60);if(e.from){const a=pById(e.from);if(a)dmgDir={a:Math.atan2(a.x-me.x,a.z-me.z),t:1.2}}}
  if(e.k==='kill'){const a=pById(e.a),v=pById(e.v);feed.unshift({a:a?a.name:'',at:a?a.team:'',v:v?v.name:'',vt:v?v.team:'',w:WPN[e.w]?WPN[e.w].n:e.w==='fall'?'fell':e.w==='zone'?'zone':e.w,hs:e.hs,me:(a&&a===me)||(v&&v===me),t:6});if(feed.length>6)feed.pop();if(v&&v.mdl){v.alive=false}if(a===me&&v!==me)beep(900,.08,'triangle',.06)}
  if(e.k==='rel'&&p===me){vmReload=WPN[me.cur]?WPN[me.cur].rel:2;beep(600,.05,'square',.03);setTimeout(()=>beep(900,.05,'square',.03),600)}
  if(e.k==='gren'){if(e.id==='he'){for(let i=0;i<14;i++)puff(e.x+rnd(-1,1),e.y+rnd(0,1.5),e.z+rnd(-1,1),i<5?0xffc060:0x3a3a3a,rnd(1.5,3.5),rnd(.5,1.4),new V3(rnd(-2,2),rnd(1,3),rnd(-2,2)),.9);snd3(e.x,e.z,300,.8,.6,'n')}
    if(e.id==='flash'){puff(e.x,e.y,e.z,0xffffff,6,.25,null,1);snd3(e.x,e.z,3000,.3,.5,'n');if(me&&!local){}}
    if(e.id==='smoke'){if(NETROLE==='client')smokes.push({x:e.x,y:e.y+1.4,z:e.z,r:4.2,t:0,life:17});snd3(e.x,e.z,800,1.5,.3,'n')}}
  if(e.k==='plant'){msgC('Bomb planted',ROY?'':'Defenders have 40 seconds to defuse',3);say('Bomb has been planted')}
  if(e.k==='defused'){msgC('Bomb defused','',3);say('Bomb defused')}
  if(e.k==='boom'){for(let i=0;i<40;i++)puff(e.x+rnd(-4,4),e.y+rnd(0,6),e.z+rnd(-4,4),i<15?0xffb040:0x2a2a2a,rnd(4,9),rnd(1,3),new V3(rnd(-4,4),rnd(2,8),rnd(-4,4)),.95);noise(2,'lowpass',200,.7);shake=.8}
  if(e.k==='round'){msgC(e.w==='T'?(ROY?'':'ATTACKERS WIN'):'DEFENDERS WIN',e.why||'',4);say(e.w==='T'?'Attackers win':'Defenders win')}
  if(e.k==='swing'&&p===me)vmSwing=.35;
  if(e.k==='bounce')snd3(e.x,e.z,1800,.05,.08,'n');if(e.k==='throw'&&p===me)vmSwing=.3;if(e.k==='dry'&&p===me)beep(300,.04,'square',.03);
  if(e.k==='pick'&&p===me)beep(700,.06,'triangle',.05)}
function say(t){if(muted)return;try{const u=new SpeechSynthesisUtterance(t);u.rate=1.1;u.pitch=.8;u.volume=.7;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
/* ---------------- view model ---------------- */
const VM=new T.Group();camera.add(VM);scene.add(camera);let vmGun=null,vmId=null,vmKickT=0,vmReload=0,vmSwing=0,hitmark=0,hurtFx=0,dmgDir=null,shake=0,flashA=0;
const armM=new T.MeshStandardMaterial({color:lin(ROY?0x4a5a3a:0x3a4450),roughness:.8}),gloveM=new T.MeshStandardMaterial({color:lin(0x1e1e22),roughness:.7});
const vmArmR=new T.Group(),vmArmL=new T.Group();{const a=new T.Mesh(new T.BoxGeometry(.08,.08,.36),armM);a.position.z=.2;vmArmR.add(a);const h=new T.Mesh(new T.BoxGeometry(.075,.085,.1),gloveM);vmArmR.add(h);const a2=a.clone();vmArmL.add(a2);const h2=h.clone();vmArmL.add(h2)}VM.add(vmArmR,vmArmL);
const muzzleF=new T.Mesh(new T.IcosahedronGeometry(.05,0),new T.MeshBasicMaterial({color:0xffe0a0,transparent:true,opacity:0}));VM.add(muzzleF);const mLight=new T.PointLight(0xffc070,0,6);VM.add(mLight);
function vmSet(){if(!me)return;const id=me.cur||'knife';if(vmId===id&&vmGun)return;if(vmGun)VM.remove(vmGun);vmGun=gunModel(id,true);VM.add(vmGun);vmId=id;vmGun.userData.mz=id==='awp'||id==='scout'?-.75:id==='ak'||id==='m4'?-.58:id==='nova'?-.65:id==='mp5'?-.38:-.2}
function vmKick(w){vmKickT=1;muzzleF.material.opacity=1;mLight.intensity=3;setTimeout(()=>{muzzleF.material.opacity=0;mLight.intensity=0},45)}
function muzzleWorld(){camera.updateMatrixWorld(true);return new V3(.14,-.12,(vmGun?vmGun.userData.mz:-.3)-.3).applyMatrix4(camera.matrixWorld)}
function flashAt(p){puff(p.x-Math.sin(p.yaw)*.7,eyeY(p)-.2,p.z-Math.cos(p.yaw)*.7,0xffd080,.35,.05,null,1)}
function stepVM(dt){if(!me)return;vmSet();const t=performance.now()/1000;const sp=me.spd||0;vmKickT=Math.max(0,vmKickT-dt*9);vmReload=Math.max(0,vmReload-dt);vmSwing=Math.max(0,vmSwing-dt);const W=WPN[me.cur]||{};const bob=Math.sin(t*9)*.012*Math.min(1,sp/4),bobY=Math.abs(Math.cos(t*9))*.01*Math.min(1,sp/4);
  const sw=me.swapT>0?me.swapT/.45:0,rl=vmReload>0?Math.sin(Math.min(1,(W.rel-vmReload)/W.rel)*PI):0;VM.visible=me.alive&&!me.scoped&&!me.inPlane&&!me.air;
  if(vmGun){vmGun.position.set(.16+bob,-.15-bobY-sw*.25-rl*.12+vmKickT*.015,-.34+vmKickT*.06);vmGun.rotation.set(vmKickT*.12+rl*.5+(vmSwing>0?Math.sin(vmSwing/.35*PI)*-.8:0),vmSwing>0?Math.sin(vmSwing/.35*PI)*.9:0,rl*-.3);if(me.cur==='knife'){vmGun.rotation.x+=-.3;vmGun.position.y+=.04}}
  vmArmR.position.set(.17+bob,-.2-bobY-sw*.25-rl*.12,-.22+vmKickT*.05);vmArmR.rotation.set(-.2,0,0);const two=W.slot===1;vmArmL.visible=two||rl>0;vmArmL.position.set(two?.08:.05,-.2-sw*.25-rl*.2,two?-.5:-.38);vmArmL.rotation.set(-.3,-.35,0);muzzleF.position.set(.16,-.12,vmGun?vmGun.userData.mz:-.3)}
/* ---------------- HUD ---------------- */
const H=(()=>{const x=el('div',{class:'tx-x'});for(let i=0;i<4;i++)x.append(el('i'));const hp=el('div',{class:'tx-hp'}),am=el('div',{class:'tx-am'}),money=el('div',{class:'tx-money'}),top=el('div',{class:'tx-top'}),feedE=el('div',{class:'tx-feed'}),rad=el('canvas',{class:'tx-radar',width:340,height:340}),cen=el('div',{class:'tx-center'}),bar=el('div',{class:'tx-bar'},el('i')),hint=el('div',{class:'tx-hint'}),fl=el('div',{class:'tx-flash'}),hu=el('div',{class:'tx-hurt'}),sc=el('div',{class:'tx-scope'}),ov=el('div',{class:'tx-ov'}),inv=el('div',{class:'tx-inv'});
  hud.append(fl,hu,sc,x,hp,am,money,top,feedE,rad,cen,bar,hint,inv,ov);[ov].forEach(e=>{e.addEventListener('mousedown',ev=>ev.stopPropagation());e.addEventListener('pointerdown',ev=>ev.stopPropagation())});return{x,hp,am,money,top,feedE,rad,cen,bar,hint,fl,hu,sc,ov,inv,rg:rad.getContext('2d')}})();
let cenT=0;function msgC(t,sub,d){H.cen.innerHTML='';H.cen.append(document.createTextNode(t));if(sub)H.cen.append(el('small',null,sub));cenT=d||3}
function mkRadarImg(){const cv=document.createElement('canvas'),S2=ROY?640:400;cv.width=cv.height=S2;const g=cv.getContext('2d'),k=S2/Math.max(MAPW,MAPD);g.fillStyle=ROY?'rgba(60,90,40,.9)':'rgba(40,34,26,.9)';g.fillRect(0,0,MAPW*k,MAPD*k);
  if(!ROY){for(const s of Object.values(SITES)){g.fillStyle='rgba(200,60,40,.25)';g.fillRect(s.x0*k,s.z0*k,(s.x1-s.x0)*k,(s.z1-s.z0)*k)}}for(const b of boxes){if(b.noCol||b.y1<.5)continue;g.fillStyle=b.y1>3?(ROY?'rgba(220,220,210,.85)':'rgba(170,150,120,.95)'):'rgba(140,120,90,.8)';g.fillRect(b.x0*k,b.z0*k,Math.max(1,(b.x1-b.x0)*k),Math.max(1,(b.z1-b.z0)*k))}
  if(!ROY){g.fillStyle='#fff';g.font='bold 28px sans-serif';g.fillText('A',SITES.A.cx*k-8,SITES.A.cz*k+10);g.fillText('B',SITES.B.cx*k-8,SITES.B.cz*k+10)}radarImg={cv,k}}
function drawRadar(){const g=H.rg,W2=340;g.clearRect(0,0,W2,W2);if(!radarImg||!me)return;g.save();g.beginPath();g.arc(W2/2,W2/2,W2/2-2,0,7);g.clip();g.translate(W2/2,W2/2);g.rotate(me.yaw);const zoom=ROY?1.1:1.4,k=radarImg.k*zoom;g.scale(zoom,zoom);g.translate(-me.x*radarImg.k,-me.z*radarImg.k);g.drawImage(radarImg.cv,0,0);g.restore();
  const tp=(x,z)=>{const dx=(x-me.x)*k,dz=(z-me.z)*k,c=Math.cos(me.yaw),s=Math.sin(me.yaw);return[W2/2+dx*c+dz*s,W2/2-dx*s+dz*c]};
  if(ROY&&zone){g.save();g.strokeStyle='rgba(80,160,255,.9)';g.lineWidth=3;const[cx,cy]=tp(zone.cx,zone.cz);g.beginPath();g.arc(cx,cy,zone.r*k,0,7);g.stroke();if(zone.nr!=null){g.strokeStyle='rgba(255,255,255,.8)';g.setLineDash([6,5]);const[nx,ny]=tp(zone.nx,zone.nz);g.beginPath();g.arc(nx,ny,zone.nr*k,0,7);g.stroke()}g.restore()}
  for(const p of players){if(p===me||!p.alive||p.inPlane)continue;const vis=ROY?p.seenT>0:(p.team===me.team||p.seenT>0);if(!vis)continue;const[x,y]=tp(p.x,p.z);if(x<0||y<0||x>W2||y>W2)continue;g.fillStyle=ROY?'#ff4a3a':p.team===me.team?(p.team==='T'?'#ffbe6a':'#8ac0ff'):'#ff4a3a';g.beginPath();g.arc(x,y,7,0,7);g.fill()}
  if(bomb&&!ROY&&(me.team==='T'||bomb.st==='planted')){const[x,y]=tp(bomb.x,bomb.z);g.fillStyle=bomb.st==='planted'?'#ff3a2a':'#ffd23f';g.fillRect(x-6,y-6,12,12)}
  g.fillStyle='#fff';g.beginPath();g.moveTo(W2/2,W2/2-10);g.lineTo(W2/2+7,W2/2+8);g.lineTo(W2/2-7,W2/2+8);g.fill()}
function updHUD(dt){if(!me)return;const W=WPN[me.cur]||{};const am=me.ammo[me.cur];H.hp.innerHTML='';H.hp.append(el('div',null,el('small',null,'HEALTH'),String(Math.max(0,Math.round(me.hp)))),el('div',null,el('small',null,'ARMOR'),String(Math.round(me.armor))+(me.helmet?' ⛑':'')));
  H.am.innerHTML='';H.am.append(el('small',null,W.n||''),am?String(am.mag)+' / '+am.res:W.gren?String((me.inv.g||[]).length):'');H.money.textContent=ROY?'':'$'+me.money;
  // crosshair gap
  const mv=Math.min(1,(me.spd||0)/4);const gap=4+(W.spr?(W.spr+mv*(W.mv||0))*400+Math.min(me.shotI,10)*1.4:0)+(me.onGround?0:14);const ch=H.x.children;[[0,-gap-9,2,9],[0,gap,2,9],[-gap-9,0,9,2],[gap,0,9,2]].forEach(([x2,y2,w,h],i)=>{Object.assign(ch[i].style,{left:(x2-(w===2?1:0))+'px',top:(y2-(h===2?1:0))+'px',width:w+'px',height:h+'px'})});H.x.style.display=me.scoped||!me.alive?'none':'';
  H.sc.style.display=me.scoped?'block':'none';
  // top bar
  H.top.innerHTML='';if(ROY){const alive=players.filter(p=>p.alive).length;H.top.append(el('span',{class:'txs txT'},alive+' ALIVE'),el('span',{class:'txm'},zone?(zone.phase==='wait'?'Zone in '+Math.ceil(zone.t)+'s':zone.phase==='shrink'?'Zone closing':'Final zone'):''),el('span',{class:'txs txC'},'KILLS '+me.kills))}
  else{const al=t2=>{const d=el('span',{class:'tx-alive',style:'color:'+(t2==='T'?'#ffbe6a':'#8ac0ff')});players.filter(p=>p.team===t2).forEach(p=>d.append(el('i',{class:p.alive?'':'d'})));return d};const tl=round.phase==='post'?'':bomb&&bomb.st==='planted'?'💣 '+Math.ceil(40-bomb.t):Math.floor(Math.max(0,round.t)/60)+':'+String(Math.ceil(Math.max(0,round.t))%60).padStart(2,'0');H.top.append(al('T'),el('span',{class:'txs txT'},String(round.score.T)),el('span',{class:'txm',style:bomb&&bomb.st==='planted'?'color:#ff5a3a':''},round.phase==='buy'?'BUY '+Math.ceil(round.t):tl),el('span',{class:'txs txC'},String(round.score.CT)),al('CT'))}
  H.feedE.innerHTML='';feed.forEach(f=>{f.t-=dt;H.feedE.append(el('div',{class:f.me?'me':''},el('span',{class:ROY?'':f.at==='T'?'fT':'fC'},f.a),' ',el('span',{style:'opacity:.8'},'['+f.w+(f.hs?' ◎':'')+']'),' ',el('span',{class:ROY?'':f.vt==='T'?'fT':'fC'},f.v)))});feed=feed.filter(f=>f.t>0);
  if(cenT>0){cenT-=dt;if(cenT<=0)H.cen.textContent=''}
  flashA=Math.max(0,Math.min(1,me.flashT*.6));H.fl.style.opacity=flashA;hurtFx=Math.max(0,hurtFx-dt*1.2);H.hu.style.opacity=hurtFx;
  if(ROY){H.inv.innerHTML='';[[1,me.inv[1]],[2,me.inv[2]],[3,'knife']].forEach(([s,w])=>{const a2=w&&me.ammo[w];H.inv.append(el('div',{class:me.cur===w?'on':''},s+' '+(w?WPN[w].n:'—')+(a2?' '+a2.mag+'/'+a2.res:'')))});H.inv.append(el('div',null,'🩹'+me.heals.b+' ✚'+me.heals.m+' (Q)'))}
  drawRadar()}
/* ---------------- round logic (breach) ---------------- */
function teamAlive(t){return players.filter(p=>p.team===t&&p.alive).length}
function startRound(){round.n++;round.phase='buy';round.t=round.n===1?8:10;round.winner=null;bomb=null;smokes=[];grens.forEach(g=>fx.remove(g.m));grens=[];items.forEach(it=>fx.remove(it.m));items=[];evtItems();
  const tSp=SPAWN.T.slice(),ctSp=SPAWN.CT.slice();players.forEach(p=>{const sp=p.team==='T'?tSp.shift()||SPAWN.T[0]:ctSp.shift()||SPAWN.CT[0];if(!p.alive){p.inv={3:'knife'};p.ammo={}}resetForRound(p,sp);p.inv[5]=null});
  const ts=players.filter(p=>p.team==='T');if(ts.length){const c2=pick(ts.filter(p=>p.bot).length&&Math.random()<.7?ts.filter(p=>p.bot):ts);c2.inv[5]='bomb'}
  players.filter(p=>p.bot).forEach(botBuy);const plan=Math.random()<.5?'A':'B';players.forEach(p=>{if(p.bot)p.ai={plan,path:null,goal:null,t:0,react:0,target:null,alert:null,hold:null,stuck:0,strafe:1,strT:0,burst:0,watch:null,role:Math.random()}});
  msgC('Round '+round.n,round.n===1?'Buy weapons with B. '+(me&&me.team==='T'?'Plant the bomb at A or B.':'Defend sites A and B.'):'',2.5);evt({k:'rstart',n:round.n},true)}
function endRound(w,why){if(round.phase==='post')return;round.phase='post';round.t=5;round.winner=w;round.score[w]++;const l=w==='T'?'CT':'T';round.lossStreak[w]=0;round.lossStreak[l]=Math.min(4,round.lossStreak[l]+1);
  players.forEach(p=>{p.money=Math.min(16000,p.money+(p.team===w?3250:1400+500*(round.lossStreak[l]-1)))});evt({k:'round',w,why},true);if(round.score[w]>=WINS){matchOver=true;setTimeout(()=>{if(state==='play'&&NETROLE!=='client')evt({k:'match',w},true)},2500)}}
function stepRound(dt){round.t-=dt;if(round.phase==='buy'&&round.t<=0){round.phase='live';round.t=115;msgC('GO!','',1.2)}
  if(round.phase==='live'){if(!bomb||bomb.st!=='planted'){if(teamAlive('T')===0&&players.some(p=>p.team==='T'))endRound('CT','All attackers eliminated');else if(teamAlive('CT')===0&&players.some(p=>p.team==='CT'))endRound('T','All defenders eliminated');else if(round.t<=0)endRound('CT','Time ran out')}
    else if(teamAlive('CT')===0)endRound('T','All defenders eliminated')}
  if(bomb&&bomb.st==='planted'&&round.phase!=='post'||bomb&&bomb.st==='planted'&&round.winner==='T'&&false){bomb.t+=dt;const left=40-bomb.t;bomb.beep=(bomb.beep||0)-dt;if(bomb.beep<=0){bomb.beep=left>10?1:left>5?.5:.2;snd3(bomb.x,bomb.z,2600,.06,.25,'s')}
    if(bomb.t>=40){bomb.st='boom';evt({k:'boom',x:bomb.x,y:bomb.y,z:bomb.z},true);for(const p of players){if(!p.alive)continue;const d=Math.hypot(p.x-bomb.x,p.z-bomb.z);if(d<22)hurtP(p,Math.round(d<8?500:200*(1-d/22)),null,'bomb')}endRound('T','The bomb exploded')}}
  if(round.phase==='post'&&round.t<=0&&!matchOver)startRound()}
function stepBombActions(p,dt,inp){if(!p.alive){return}
  if(p.team==='T'&&p.cur==='bomb'&&inp.fire&&p.onGround&&inSite(p.x,p.z)&&round.phase==='live'){p.plantT+=dt;if(p.plantT>=3.2){p.plantT=0;p.inv[5]=null;bomb={st:'planted',x:p.x,y:groundAt(p.x,p.z,.2,p.y+.5)+.05,z:p.z,t:0,site:inSite(p.x,p.z)};p.money+=300;equip(p,bestSlot(p));evt({k:'plant',p:p.id},true)}}else p.plantT=0;
  if(p.team==='CT'&&bomb&&bomb.st==='planted'&&inp.use&&Math.hypot(p.x-bomb.x,p.z-bomb.z)<1.6){p.defT+=dt;if(p.defT>=(p.kit?5:10)){bomb.st='defused';p.defT=0;p.money+=300;evt({k:'defused',p:p.id},true);endRound('CT','Bomb defused')}}else p.defT=0;
  if(p.team==='T'&&bomb&&bomb.st==='dropped'&&Math.hypot(p.x-bomb.x,p.z-bomb.z)<1.3){p.inv[5]='bomb';bomb=null;evt({k:'bombpick',p:p.id},true)}
  if(inp.use&&!p.useHeld){let best=null,bd=2;for(const it of items){const d=Math.hypot(it.x-p.x,it.z-p.z);if(d<bd&&Math.abs(it.y-p.y)<2){bd=d;best=it}}if(best)pickUp(p,best)}p.useHeld=inp.use}
/* ---------------- buying ---------------- */
function canBuy(p){return !ROY&&(round.phase==='buy'||round.phase==='live'&&round.t>95)&&p.alive}
function buy(p,id){if(!canBuy(p))return false;const W=WPN[id],G=GEAR[id];const item=W||G;if(!item||!item.price||p.money<item.price)return false;if(item.side&&item.side!==p.team)return false;
  if(G){if(id==='vest'){if(p.armor>=100)return false;p.armor=100}else if(id==='vesthelm'){if(p.armor>=100&&p.helmet)return false;p.armor=100;p.helmet=true}else if(id==='kit'){if(p.kit)return false;p.kit=true}}
  else if(W.slot===4){p.inv.g=p.inv.g||[];if(p.inv.g.includes(id)||p.inv.g.length>=3)return false;p.inv.g.push(id)}else{if(p.inv[W.slot]===id)return false;if(p.inv[W.slot]&&p.inv[W.slot]!==(p.team==='T'?'glock':'usp'))dropGun(p,p.inv[W.slot]);giveW(p,id);equip(p,id)}
  p.money-=item.price;return true}
function botBuy(p){const m=p.money;if(m>=3700){buy(p,p.team==='T'?'ak':(Math.random()<.2&&m>5800?'awp':'m4'));buy(p,'vesthelm')}else if(m>=2200){buy(p,Math.random()<.5?'mp5':'nova');buy(p,'vest')}else if(m>=1350&&round.n>1){buy(p,'vest');if(Math.random()<.5)buy(p,'deagle')}
  if(p.money>=300&&Math.random()<.5)buy(p,pick(['he','flash','smoke']));if(p.team==='CT'&&p.money>=400&&Math.random()<.5)buy(p,'kit')}
/* ---------------- royale logic ---------------- */
const ZPH=[[45,30,110],[35,25,70],[30,20,40],[25,18,20],[20,15,8],[15,12,3]];
function royaleStart(){zone={cx:MAPW/2,cz:MAPD/2,r:230,phase:'wait',i:0,t:ZPH[0][0],nx:null,nz:null,nr:null,dmg:1};const R2=mulberry(seed+7);
  // loot
  items.forEach(it=>fx.remove(it.m));items=[];const guns=['glock','usp','deagle','mp5','nova','ak','m4','scout','awp'];const gw=[3,3,2,4,3,3,3,2,1];const pickG=()=>{let t=R2()*gw.reduce((a,b)=>a+b,0);for(let i=0;i<guns.length;i++){t-=gw[i];if(t<=0)return guns[i]}return'mp5'};
  LOOT.forEach(l=>{const r2=R2();if(r2<.42)mkItem({t:'gun',w:pickG(),x:l.x,y:l.y,z:l.z});else if(r2<.62)mkItem({t:'ammo',x:l.x,y:l.y,z:l.z});else if(r2<.72)mkItem({t:'vest',lv:1+Math.floor(R2()*3),x:l.x,y:l.y,z:l.z});else if(r2<.8)mkItem({t:'helm',x:l.x,y:l.y,z:l.z});else if(r2<.93)mkItem({t:'band',x:l.x,y:l.y,z:l.z});else mkItem({t:'med',x:l.x,y:l.y,z:l.z})});
  // plane path
  const a=R2()*PI*2;plane={x0:MAPW/2+Math.cos(a)*230,z0:MAPD/2+Math.sin(a)*230,dx:-Math.cos(a),dz:-Math.sin(a),t:0,len:460,sp:55,y:180};const pm=new T.Group();const bM=new T.MeshStandardMaterial({color:lin(0x8a9098),roughness:.5,metalness:.4});const bd=new T.Mesh(new T.CylinderGeometry(2.2,2.2,26,12),bM);bd.rotation.x=PI/2;pm.add(bd);const wg=new T.Mesh(new T.BoxGeometry(34,.4,5),bM);pm.add(wg);const tl=new T.Mesh(new T.BoxGeometry(.4,5,4),bM);tl.position.set(0,3,11);pm.add(tl);plane.m=pm;scene.add(pm);
  players.forEach(p=>{p.alive=true;p.hp=100;p.armor=0;p.helmet=false;p.inv={3:'knife'};p.ammo={};p.cur='knife';p.heals={b:0,m:0};p.inPlane=true;p.chute=0;p.kills=0;p.mdl.visible=false;p.mdl.rotation.x=0;p.deadT=0;if(p.bot)p.ai={jumpAt:rnd(.12,.85),land:null,path:null,goal:null,t:0,react:0,target:null,alert:null,strafe:1,strT:0,burst:0,loot:null,stuck:0}});
  msgC('Last Drop','Press SPACE or E to jump from the plane',4)}
function planePos(){const d=Math.min(plane.len,plane.t*plane.sp);return{x:plane.x0+plane.dx*d,z:plane.z0+plane.dz*d}}
function stepRoyale(dt){if(!plane)return;plane.t+=dt;const pp=planePos();plane.m.position.set(pp.x,plane.y,pp.z);plane.m.rotation.y=Math.atan2(-plane.dx,-plane.dz)+PI;plane.m.visible=plane.t*plane.sp<plane.len+200;if(plane.t*plane.sp>=plane.len)players.forEach(p=>{if(p.inPlane)jumpOut(p)});
  // zone
  const Z=zone;Z.t-=dt;if(Z.phase==='wait'){if(Z.nr==null){const ph=ZPH[Z.i];const maxOff=Math.max(0,Z.r-ph[2]);const a=rnd(0,2*PI),o=Math.random()*maxOff*.7;Z.nx=clamp(Z.cx+Math.cos(a)*o,20,MAPW-20);Z.nz=clamp(Z.cz+Math.sin(a)*o,20,MAPD-20);Z.nr=ph[2];Z.or=Z.r;Z.ocx=Z.cx;Z.ocz=Z.cz}if(Z.t<=0){Z.phase='shrink';Z.t=ZPH[Z.i][1];Z.T=Z.t;msgC('The zone is closing','',2.5)}}
  else if(Z.phase==='shrink'){const k=1-Math.max(0,Z.t)/Z.T;Z.r=lerp(Z.or,Z.nr,k);Z.cx=lerp(Z.ocx,Z.nx,k);Z.cz=lerp(Z.ocz,Z.nz,k);if(Z.t<=0){Z.i++;Z.dmg=[1,2,3,5,8,10,12][Z.i]||12;if(Z.i<ZPH.length){Z.phase='wait';Z.t=ZPH[Z.i][0];Z.nr=null}else Z.phase='final'}}
  Z.tick=(Z.tick||0)-dt;if(Z.tick<=0){Z.tick=1;for(const p of players){if(!p.alive||p.inPlane)continue;if(Math.hypot(p.x-Z.cx,p.z-Z.cz)>Z.r)hurtP(p,Z.dmg,null,'zone')}}
  const alive=players.filter(p=>p.alive);if(alive.length<=1&&players.length>1&&!matchOver){matchOver=true;const w=alive[0];evt({k:'rwin',p:w?w.id:0},true)}}
let zoneM=null;function zoneWall(){if(!zone)return;if(!zoneM){zoneM=new T.Mesh(new T.CylinderGeometry(1,1,160,96,1,true),new T.MeshBasicMaterial({color:0x4a9aff,transparent:true,opacity:.22,side:T.DoubleSide,depthWrite:false,fog:false}));scene.add(zoneM)}zoneM.position.set(zone.cx,60,zone.cz);zoneM.scale.set(zone.r,1,zone.r);zoneM.visible=true}
function jumpOut(p){if(!p.inPlane)return;const pp=planePos();p.inPlane=false;p.x=pp.x+rnd(-3,3);p.z=pp.z+rnd(-3,3);p.y=plane.y-4;p.vy=0;p.vx=plane.dx*20;p.vz=plane.dz*20;p.chute=0;p.mdl.visible=true;p.onGround=false;if(p===me)msgC('Skydiving','Steer with WASD. Chute opens automatically (or press SPACE)',3)}
function stepAir(p,dt,inp){const fw=(inp.f?1:0)-(inp.b?1:0),st=(inp.r?1:0)-(inp.l?1:0);const hs=p.chute?8:22;const wx=-Math.sin(p.yaw)*fw+Math.cos(p.yaw)*st,wz=-Math.cos(p.yaw)*fw-Math.sin(p.yaw)*st;p.vx+=(wx*hs-p.vx)*Math.min(1,dt*1.2);p.vz+=(wz*hs-p.vz)*Math.min(1,dt*1.2);
  const g=groundAt(p.x,p.z,.3,p.y);if(!p.chute&&(p.y-g<70||inp.j&&p.y-g<150)){p.chute=1;if(p===me)beep(300,.2,'triangle',.06)}const tvy=p.chute?-5:(inp.f&&p.pitch<-.5?-60:-45);p.vy+=(tvy-p.vy)*Math.min(1,dt*(p.chute?2:.8));
  p.x=clamp(p.x+p.vx*dt,1,MAPW-1);p.z=clamp(p.z+p.vz*dt,1,MAPD-1);p.y+=p.vy*dt;if(p.y<=g){p.y=g;p.vy=0;p.chute=0;p.onGround=true;p.air=false}else p.air=true}
function useHeal(p){if(p.healT>0||p.hp>=100)return;if(p.heals.m>0&&p.hp<75){p.heals.m--;p.healT=5;p.healAmt=100-p.hp;p.healKind='m'}else if(p.heals.b>0&&p.hp<75){p.heals.b--;p.healT=2.5;p.healAmt=Math.min(15,75-p.hp);p.healKind='b'}}
/* ---------------- bots ---------------- */
function canSee(p,q){const e={x:p.x,y:eyeY(p),z:p.z};const d=Math.hypot(q.x-p.x,q.z-p.z);if(d>(ROY?110:80))return false;const a=Math.atan2(-(q.x-p.x),-(q.z-p.z));let da=a-p.yaw;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>1.15&&d>3)return false;return losClear(e,{x:q.x,y:eyeY(q)-.1,z:q.z},true)||losClear(e,{x:q.x,y:q.y+1,z:q.z},true)}
function botThink(p,dt,now){const A=p.ai;if(!A)return{};const inp={};A.t-=dt;if(p.flashT>1){inp.b=Math.random()<.5;return inp}
  if(ROY&&p.inPlane){const pp=planePos();if(plane.t*plane.sp/plane.len>A.jumpAt)jumpOut(p);return{}}
  if(ROY&&p.air){if(!A.land){const b=pick(BLD);A.land={x:b.x+b.w/2,z:b.z+b.d+3}}const dx=A.land.x-p.x,dz=A.land.z-p.z;p.yaw=Math.atan2(-dx,-dz);inp.f=Math.hypot(dx,dz)>4;return inp}
  // target selection
  if(A.t<=0){A.t=rnd(.12,.22);let best=null,bd=1e9;for(const q of players){if(!q.alive||q.inPlane||(!ROY&&q.team===p.team)||q===p)continue;const d=Math.hypot(q.x-p.x,q.z-p.z);if(d<bd&&canSee(p,q)){bd=d;best=q}}if(best){best.seenT=1.5;if(A.target!==best){A.target=best;A.react=[.65,.4,.22][diff]+rnd(0,.25)}A.lastSeen={x:best.x,z:best.z,t:4}}else A.target=null}
  const W=WPN[p.cur]||{};
  const unarmed=!p.inv[1]&&!p.inv[2];if(A.target&&A.target.alive&&!(ROY&&unarmed&&Math.hypot(A.target.x-p.x,A.target.z-p.z)>6)){const q=A.target,d=Math.hypot(q.x-p.x,q.z-p.z);A.react-=dt;const aimY=diff===2&&Math.random()<.5?eyeY(q)-.03:q.y+1.15-q.crouchT*.4;const ty=Math.atan2(-(q.x-p.x),-(q.z-p.z)),tp=Math.atan2(aimY-eyeY(p),d);const err=[.07,.04,.018][diff]*(A.react>0?3:1)*(1+Math.min(2,q.spd/3));
    let dy=ty-p.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));const turn=[4,6,9][diff]*dt;p.yaw+=clamp(dy,-turn,turn)+(Math.random()-.5)*err*.3;p.pitch+=clamp(tp-p.pitch-p.rcP*1.2,-turn,turn);
    if(W.melee||!p.inv[1]&&!p.inv[2]){if(p.inv[1]||p.inv[2])equip(p,bestSlot(p));inp.f=d>1.2;if(d<1.7)inp.fire=1}
    else{const am=p.ammo[p.cur];if(am&&am.mag===0&&am.res>0){reload(p)}
      if(A.react<=0&&Math.abs(dy)<.12+err){const burstN=W.auto?(d<10?12:d<22?5:2):1;if(A.burst<burstN){inp.fire=1;A.burst++}else{A.burst=d<10?-2:-Math.round(rnd(4,9))}if(A.burst<0)A.burst++}
      A.strT-=dt;if(A.strT<=0){A.strT=rnd(.4,1.1);A.strafe=-A.strafe;A.crouch=d>18&&Math.random()<.3}if(!inp.fire||d<8||W.pel){if(A.strafe>0)inp.r=1;else inp.l=1}if(A.crouch&&inp.fire)inp.c=1;if(d>35&&!inp.fire)inp.f=1}
    if(ROY&&p.hp<40&&p.heals.m+p.heals.b>0&&d>40)useHeal(p);
    if(ROY&&zone&&Math.hypot(p.x-zone.cx,p.z-zone.cz)>zone.r*.9){const gx=(zone.nr!=null?zone.nx:zone.cx)-p.x,gz=(zone.nr!=null?zone.nz:zone.cz)-p.z;const fx=-Math.sin(p.yaw),fz=-Math.cos(p.yaw),rx=Math.cos(p.yaw),rz=-Math.sin(p.yaw);const df=gx*fx+gz*fz,dr=gx*rx+gz*rz;inp.f=df>2;inp.b=df<-2;inp.r=dr>2;inp.l=dr<-2;inp.c=0}
    return inp}
  if(A.alert&&A.alert.t>0){A.alert.t-=dt;const dx=A.alert.x-p.x,dz=A.alert.z-p.z;const ty=Math.atan2(-dx,-dz);let dy=ty-p.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));p.yaw+=clamp(dy,-5*dt,5*dt);if(Math.random()<.3)return inp}
  p.pitch*=.9;if(p.cur!==bestSlot(p)&&!(p.cur==='bomb'))equip(p,bestSlot(p));const am=p.ammo[p.cur];if(am&&am.mag<WPN[p.cur].mag*.4&&am.res>0)reload(p);
  // goals
  let goal=null;if(!ROY){if(round.phase==='buy')return inp;const site=SITES[A.plan];
    if(p.team==='T'){if(bomb&&bomb.st==='dropped')goal={x:bomb.x,z:bomb.z};else if(bomb&&bomb.st==='planted'){goal=A.hold||(A.hold={x:bomb.x+rnd(-6,6),z:bomb.z+rnd(-6,6)})}else if(p.inv[5]){goal={x:site.cx,z:site.cz};if(inSite(p.x,p.z)===A.plan&&Math.hypot(p.x-site.cx,p.z-site.cz)<7){equip(p,'bomb');inp.fire=1;return inp}}else goal=A.hold||(A.hold={x:site.cx+rnd(-7,7),z:site.cz+rnd(-5,5)});if(!bomb&&A.role<.25&&round.t>80)goal={x:47,z:30}}
    else{if(bomb&&bomb.st==='planted'){goal={x:bomb.x,z:bomb.z};if(Math.hypot(p.x-bomb.x,p.z-bomb.z)<1.3){inp.use=1;inp.c=1;return inp}}else{if(!A.hold){const s=A.role<.4?SITES.A:A.role<.8?SITES.B:{cx:47,cz:22,x0:44,x1:50,z0:14,z1:30};A.hold={x:rnd(s.x0+2,s.x1-2),z:rnd(s.z0+2,s.z1-2)};A.watch=A.role<.4?{x:79,z:60}:A.role<.8?{x:14,z:40}:{x:47,z:60}}goal=A.hold}}}
  else{const Z=zone;const dz=Math.hypot(p.x-Z.cx,p.z-Z.cz);const need=Z.nr!=null?Math.hypot(p.x-Z.nx,p.z-Z.nz)>Z.nr*.85:dz>Z.r*.85;
    if(p.hp<60&&p.heals.m+p.heals.b>0){useHeal(p)}
    if(dz>Z.r*.95||need&&(Z.phase==='shrink'||Z.t<15))goal={x:Z.nr!=null?Z.nx:Z.cx,z:Z.nr!=null?Z.nz:Z.cz};else{if(!A.loot||!items.includes(A.loot)){let best=null,bd=60;A.bad=A.bad||new Set();const want=it=>(it.y>1.2||A.bad.has(it.id))?false:(!p.inv[1]&&!p.inv[2]&&it.t!=='gun')?false:it.t==='gun'?(!p.inv[1]||!p.inv[2]&&WPN[it.w].slot===1)||(WPN[it.w].slot===2&&!p.inv[2]&&!p.inv[1]):it.t==='ammo'?Object.keys(p.ammo).length>0:it.t==='vest'?p.armor<(it.lv||1)*25+25:it.t==='helm'?!p.helmet:true;for(const it of items){if(!want(it))continue;const d=Math.hypot(it.x-p.x,it.z-p.z)+Math.abs(it.y-p.y)*10;if(d<bd){bd=d;best=it}}A.loot=best;A.lootT=0}
      if(A.loot){A.lootT=(A.lootT||0)+dt;if(A.lootT>12){A.bad.add(A.loot.id);A.loot=null}}if(A.loot){goal={x:A.loot.x,z:A.loot.z};if(Math.hypot(p.x-A.loot.x,p.z-A.loot.z)<1.3&&Math.abs(A.loot.y-p.y)<1.5){pickUp(p,A.loot);A.loot=null}}else goal=A.wander||(A.wander={x:clamp(Z.cx+rnd(-Z.r,Z.r)*.5,10,MAPW-10),z:clamp(Z.cz+rnd(-Z.r,Z.r)*.5,10,MAPD-10)})}}
  if(goal&&ROY){const gd=Math.hypot(goal.x-p.x,goal.z-p.z);if(gd>45)goal={x:p.x+(goal.x-p.x)/gd*40,z:p.z+(goal.z-p.z)/gd*40}}
  if(goal){const gk=Math.round(goal.x/(ROY?4:1))+','+Math.round(goal.z/(ROY?4:1));if(!A.path||A.gk!==gk||A.repath<=0){A.path=astar(p.x,p.z,goal.x,goal.z,ROY?12000:20000);A.gk=gk;A.repath=rnd(3,6)}A.repath-=dt;
    let wp=A.path&&A.path[0];if(!wp&&Math.hypot(goal.x-p.x,goal.z-p.z)>1.2)wp=[goal.x,goal.z];if(wp){const dx=wp[0]-p.x,dz=wp[1]-p.z,d=Math.hypot(dx,dz);if(d<.7){A.path.shift()}else{const ty=Math.atan2(-dx,-dz);let dy=ty-p.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));p.yaw+=clamp(dy,-6*dt,6*dt);inp.f=Math.abs(dy)<1.2;if(A.lastX!=null&&Math.hypot(p.x-A.lastX,p.z-A.lastZ)<dt*.4&&inp.f){A.stuck+=dt;if(A.stuck>.6){inp.j=1;A.repath=0;A.stuck=0}}else A.stuck=0;A.lastX=p.x;A.lastZ=p.z}}
    else if(A.watch&&!ROY){const ty=Math.atan2(-(A.watch.x-p.x),-(A.watch.z-p.z));let dy=ty-p.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));p.yaw+=clamp(dy,-3*dt,3*dt)}
    if(A.lastSeen&&A.lastSeen.t>0&&!(A.path&&A.path.length)){A.lastSeen.t-=dt}}
  return inp}
/* ---------------- networking (WebRTC P2P, signaling via /api/mp) ---------------- */
const API='/api/mp';const peerId=(Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)).replace(/[^a-z0-9]/g,'').slice(0,16);let roomId=null,conns=new Map(),hostConn=null,pollT=null,beatT=null,netStatus='';
const ICE={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'}]};
async function api(method,body,q){const r=await fetch(API+(q||''),method==='GET'?{cache:'no-store'}:{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error('server '+r.status);return r.json()}
function waitIce(pc,ms){return new Promise(res=>{if(pc.iceGatheringState==='complete')return res();const t=setTimeout(res,ms||2500);pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(t);res()}})})}
async function hostRoom(){const r=await api('POST',{op:'host',game:GAME,peer:peerId,name:nameMe+"'s "+(ROY?'drop':'match'),max:ROY?16:10,mode:ROY?'royale':'breach'});roomId=r.id;NETROLE='host';pollT=setInterval(pollHost,1200);beatT=setInterval(()=>api('POST',{op:'beat',game:GAME,room:roomId,peer:peerId,n:1+conns.size,open:true}).catch(()=>{}),8000);return roomId}
async function pollHost(){try{const r=await api('GET',null,'?room='+roomId+'&peer='+peerId);for(const{from,msg}of r.msgs){if(!msg)continue;if(msg.type==='join')await acceptPeer(from,msg.name);else if(msg.type==='answer'){const c2=conns.get(from);if(c2&&c2.pc.signalingState!=='stable')await c2.pc.setRemoteDescription(msg.sdp)}}}catch(e){}}
async function acceptPeer(from,name){if(conns.has(from))return;if(conns.size>=(ROY?15:9))return;const pc=new RTCPeerConnection(ICE);const u=pc.createDataChannel('u',{ordered:false,maxRetransmits:0}),rl=pc.createDataChannel('r');const c2={pc,u,rl,name:String(name||'Player').slice(0,16),peer:from,ready:false,player:null,last:performance.now()};conns.set(from,c2);
  rl.onopen=()=>{c2.ready=true;onPeerReady(c2)};rl.onmessage=e=>onHostMsg(c2,JSON.parse(e.data));u.onmessage=e=>onHostMsg(c2,JSON.parse(e.data));pc.onconnectionstatechange=()=>{if(['failed','closed','disconnected'].includes(pc.connectionState))dropPeer(c2)};
  const off=await pc.createOffer();await pc.setLocalDescription(off);await waitIce(pc);await api('POST',{op:'send',room:roomId,from:peerId,to:from,msg:{type:'offer',sdp:pc.localDescription}})}
function dropPeer(c2){if(!conns.has(c2.peer))return;conns.delete(c2.peer);if(c2.player){c2.player.peer=null;c2.player.bot=true;c2.player.name=c2.player.name+' (bot)';c2.player.ai=c2.player.ai||{t:0};if(!ROY)c2.player.ai=Object.assign({plan:'A',path:null,hold:null,role:Math.random(),t:0,react:0,strafe:1,strT:0,burst:0},{})}feedMsg(c2.name+' left')}
function feedMsg(t){feed.unshift({a:'',v:t,w:'',t:5});if(feed.length>6)feed.pop()}
function onPeerReady(c2){// replace a bot
  let slot=null;if(!ROY){const tc={T:players.filter(p=>p.team==='T'&&!p.bot).length,CT:players.filter(p=>p.team==='CT'&&!p.bot).length};const team=tc.T<=tc.CT?'T':'CT';slot=players.find(p=>p.bot&&p.team===team)||players.find(p=>p.bot)}else slot=players.find(p=>p.bot&&(p.inPlane||!p.alive))||players.find(p=>p.bot);
  if(!slot){slot=mkPlayer({team:'CT',bot:false});}slot.bot=false;slot.peer=c2.peer;slot.name=c2.name;slot.ai=null;c2.player=slot;feedMsg(c2.name+' joined');
  c2.rl.send(JSON.stringify({t:'welcome',id:slot.id,mode:cfg.mode,seed,full:fullState()}))}
function onHostMsg(c2,m){c2.last=performance.now();if(m.t==='i'&&c2.player){c2.player.inp=m.i;const p=c2.player;if(m.i.yaw!=null){p.yaw=m.i.yaw;p.pitch=m.i.pitch}}if(m.t==='buy'&&c2.player)buy(c2.player,m.id);if(m.t==='slot'&&c2.player){const w=m.s===4?slotW(c2.player,4):m.s===5?(c2.player.inv[5]?'bomb':null):c2.player.inv[m.s];if(w)equip(c2.player,w)}if(m.t==='rel'&&c2.player)reload(c2.player);if(m.t==='heal'&&c2.player)useHeal(c2.player);if(m.t==='scope'&&c2.player)toggleScope(c2.player);if(m.t==='jump'&&c2.player)jumpOut(c2.player)}
function fullState(){return{players:players.map(p=>({id:p.id,name:p.name,team:p.team})),items:items.map(it=>({id:it.id,t:it.t,w:it.w,lv:it.lv,x:it.x,y:it.y,z:it.z})),plane:plane?{x0:plane.x0,z0:plane.z0,dx:plane.dx,dz:plane.dz,t:plane.t}:null}}
function snapshot(forP){const ps=players.map(p=>[p.id,+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2),+p.yaw.toFixed(3),+p.pitch.toFixed(3),Math.round(p.hp),p.alive?1:0,p.cur,+p.crouchT.toFixed(2),p.inPlane?1:0,p.team,p.chute||0,+(p.vx.toFixed(1)),+(p.vz.toFixed(1)),p.onGround?1:0]);
  const s={t:'s',ps,r:ROY?null:{n:round.n,ph:round.phase,t:+round.t.toFixed(1),sc:round.score},b:bomb?{st:bomb.st,x:bomb.x,y:bomb.y,z:bomb.z,t:bomb.t}:null,z:zone?{cx:zone.cx,cz:zone.cz,r:zone.r,nx:zone.nx,nz:zone.nz,nr:zone.nr,ph:zone.phase,t:zone.t}:null,pl:plane?plane.t:null,ev:evQ};
  if(forP){s.me={hp:forP.hp,armor:forP.armor,helmet:forP.helmet,money:forP.money,inv:forP.inv,ammo:forP.ammo,cur:forP.cur,kit:forP.kit,heals:forP.heals,flashT:forP.flashT,plantT:forP.plantT,defT:forP.defT,scoped:forP.scoped,kills:forP.kills,shotI:forP.shotI}}return s}
let snapT=0;function netHostTick(dt){snapT-=dt;if(snapT>0){return}snapT=1/20;const rel=evRel;evRel=[];for(const c2 of conns.values()){if(!c2.ready)continue;try{if(itemsDirty||c2.needItems){c2.rl.send(JSON.stringify({t:'items',items:items.map(it=>({id:it.id,t:it.t,w:it.w,lv:it.lv,x:it.x,y:it.y,z:it.z}))}));c2.needItems=false}if(rel.length)c2.rl.send(JSON.stringify({t:'ev',ev:rel}));const s=snapshot(c2.player);s.ev=evQ.filter(e=>!e.__r);const str=JSON.stringify(s);(str.length<15000?c2.u:c2.rl).send(str);if(performance.now()-c2.last>15000)dropPeer(c2)}catch(e){}}itemsDirty=false;evQ=[];
  // clean reliable-flag duplicates
}
/* client side */
let snaps=[],clientT=0;
async function joinRoom(code){const f=await api('POST',{op:'find',game:GAME,room:code});roomId=code;NETROLE='client';const hostPeer=f.host;await api('POST',{op:'send',room:roomId,from:peerId,to:hostPeer,msg:{type:'join',name:nameMe}});
  return new Promise((res,rej)=>{let done=false;const to=setTimeout(()=>{if(!done){done=true;clearInterval(pollT);rej(new Error('Could not connect to the host. Your network may block peer-to-peer connections.'))}},20000);
    pollT=setInterval(async()=>{try{const r=await api('GET',null,'?room='+roomId+'&peer='+peerId);for(const{from,msg}of r.msgs){if(msg&&msg.type==='offer'&&!hostConn){const pc=new RTCPeerConnection(ICE);hostConn={pc,u:null,rl:null};pc.ondatachannel=e=>{const ch=e.channel;if(ch.label==='u')hostConn.u=ch;else hostConn.rl=ch;ch.onmessage=ev=>onClientMsg(JSON.parse(ev.data));if(ch.label==='r')ch.onopen=()=>{if(!done){done=true;clearTimeout(to);clearInterval(pollT);res()}}};pc.onconnectionstatechange=()=>{if(['failed','closed'].includes(pc.connectionState)&&state==='play'){msgC('Disconnected from host','',5);setTimeout(()=>menu(),3000)}};
        await pc.setRemoteDescription(msg.sdp);const ans=await pc.createAnswer();await pc.setLocalDescription(ans);await waitIce(pc);await api('POST',{op:'send',room:roomId,from:peerId,to:hostPeer,msg:{type:'answer',sdp:pc.localDescription}})}}}catch(e){}},1000)})}
function onClientMsg(m){if(m.t==='welcome'){startClient(m)}else if(m.t==='s'){snaps.push({at:performance.now(),s:m});if(snaps.length>30)snaps.shift();applySnap(m)}else if(m.t==='ev'){m.ev.forEach(e=>{e.__r=1;applyEvt(e)})}else if(m.t==='items'){syncItems(m.items)}}
function syncItems(list){const ids=new Set(list.map(i=>i.id));items.slice().forEach(it=>{if(!ids.has(it.id))takeItem(it)});list.forEach(i=>{if(!items.some(it=>it.id===i.id)){const it=mkItem(Object.assign({},i));it.id=i.id}})}
function ensureP(id,team,name){let p=pById(id);if(!p){p=mkPlayer({id,team,name:name||'Player',bot:false});}return p}
function applySnap(s){for(const a of s.ps){const[id,x,y,z,yaw,pitch,hp,alive,cur,cr,inPlane,team,chute,vx,vz,og]=a;const p=ensureP(id,team);if(p.team!==team&&!ROY){p.team=team;scene.remove(p.mdl);p.mdl=mkChar(team);scene.add(p.mdl)}p.hp=hp;const wasAlive=p.alive;p.alive=!!alive;if(!wasAlive&&p.alive){p.deadT=0;p.mdl.rotation.x=0}p.inPlane=!!inPlane;p.chute=chute;p.cur=cur;p.onGround=!!og;
    if(p===me){const d=Math.hypot(p.x-x,p.z-z)+Math.abs(p.y-y);if(d>1.2||!p.alive||p.inPlane){p.x=x;p.y=y;p.z=z}else{p.x+=(x-p.x)*.12;p.z+=(z-p.z)*.12;p.y+=(y-p.y)*.2}}else{p.tx=x;p.ty=y;p.tz=z;p.tyaw=yaw;p.tpitch=pitch;p.crouchT=cr;p.vx=vx;p.vz=vz}}
  if(s.r){round.n=s.r.n;round.phase=s.r.ph;round.t=s.r.t;round.score=s.r.sc}bomb=s.b;if(s.z)zone=Object.assign(zone||{},{cx:s.z.cx,cz:s.z.cz,r:s.z.r,nx:s.z.nx,nz:s.z.nz,nr:s.z.nr,phase:s.z.ph,t:s.z.t});if(plane&&s.pl!=null)plane.t=s.pl;
  if(s.me&&me){const o=s.me;me.hp=o.hp;me.armor=o.armor;me.helmet=o.helmet;me.money=o.money;me.inv=o.inv;me.ammo=o.ammo;if(me.cur!==o.cur){me.cur=o.cur;vmSet()}me.kit=o.kit;me.heals=o.heals;me.flashT=Math.max(me.flashT,o.flashT);me.plantT=o.plantT;me.defT=o.defT;me.scoped=o.scoped;me.kills=o.kills;me.shotI=o.shotI}
  (s.ev||[]).forEach(e=>{if(e.k==='kill'||e.k==='round'||e.k==='plant'||e.k==='defused'||e.k==='boom'||e.k==='gren'||e.k==='rstart'||e.k==='match'||e.k==='rwin')return;applyEvt(e)})}
function startClient(m){seed=m.seed;cleanupWorld();if(ROY)royaleMap(seed);else breachMap();mkRadarImg();players=[];m.full.players.forEach(pp=>{const p=mkPlayer({id:pp.id,team:pp.team,name:pp.name,bot:false});p.alive=true});me=pById(m.id);me.local=true;syncItems(m.full.items);if(ROY&&m.full.plane){plane=Object.assign({len:460,sp:55,y:180},m.full.plane);const pm=new T.Group();const bM=new T.MeshStandardMaterial({color:lin(0x8a9098)});const bd=new T.Mesh(new T.CylinderGeometry(2.2,2.2,26,12),bM);bd.rotation.x=PI/2;pm.add(bd);pm.add(new T.Mesh(new T.BoxGeometry(34,.4,5),bM));plane.m=pm;scene.add(pm);zone={cx:MAPW/2,cz:MAPD/2,r:230,phase:'wait',t:45}}
  state='play';H.ov.classList.remove('on');vmSet();try{renderer.domElement.requestPointerLock()}catch(e){}msgC('Connected',ROY?'Jump with SPACE':'You are on team '+(me.team==='T'?'Attackers':'Defenders'),3)}
function cleanupWorld(){world.clear();boxes=[];HASH.clear();players.forEach(p=>scene.remove(p.mdl));players=[];items.forEach(it=>fx.remove(it.m));items=[];grens.forEach(g=>fx.remove(g.m));grens=[];smokes=[];puffs.forEach(q=>fx.remove(q.m));puffs=[];if(zoneM)zoneM.visible=false;if(plane&&plane.m)scene.remove(plane.m);plane=null;zone=null;bomb=null;feed=[];matchOver=false;round={n:0,phase:'buy',t:0,score:{T:0,CT:0},lossStreak:{T:0,CT:0}}}
function sendInput(inp){if(!hostConn||!hostConn.u||hostConn.u.readyState!=='open')return;hostConn.u.send(JSON.stringify({t:'i',i:Object.assign({},inp,{yaw:+me.yaw.toFixed(4),pitch:+me.pitch.toFixed(4)})}))}
function sendRel(m){if(hostConn&&hostConn.rl&&hostConn.rl.readyState==='open')hostConn.rl.send(JSON.stringify(m))}
function leaveNet(){clearInterval(pollT);clearInterval(beatT);if(NETROLE==='host'&&roomId)api('POST',{op:'close',game:GAME,room:roomId,peer:peerId}).catch(()=>{});conns.forEach(c2=>{try{c2.pc.close()}catch(e){}});conns.clear();if(hostConn)try{hostConn.pc.close()}catch(e){}hostConn=null;roomId=null;NETROLE='solo'}
/* ---------------- local input ---------------- */
function toggleScope(p){const W=WPN[p.cur];if(!W||!W.scope||p.rel>0)return;p.scoped=(p.scoped+1)%(W.scope>3?3:2);if(p===me)beep(1200,.02,'square',.02)}
const K=input.keys;let prevK={};
function localInput(){const k=K;const inp={f:!!(k.w||k.arrowup)||input.joy.y<-.3,b:!!(k.s||k.arrowdown)||input.joy.y>.3,l:!!(k.a||k.arrowleft)||input.joy.x<-.3,r:!!(k.d||k.arrowright)||input.joy.x>.3,j:!!k[' ']||!!input.jumpBtn,c:!!(k.control||k.c),walk:!!k.shift,fire:(input.down||input.fire)&&!buyOpen,use:!!k.e||(ROY&&!!input.alt)};return inp}
c.on(document,'keydown',e=>{if(state!=='play'||!me)return;const k=e.key.toLowerCase();if(k==='tab'){e.preventDefault();showBoard(true);return}if(k==='b'&&!ROY){toggleBuy();return}if(buyOpen&&/^[1-9]$/.test(k)){return}
  if(/^[1-5]$/.test(k)){const s=+k;const w=s===4?slotW(me,4):s===5?(me.inv[5]?'bomb':null):me.inv[s];if(w){if(NETROLE==='client'){sendRel({t:'slot',s});me.cur=w;vmSet()}else equip(me,w)}}
  if(k==='q'){if(ROY){NETROLE==='client'?sendRel({t:'heal'}):useHeal(me)}else{const w=me.prev&&(me.prev==='knife'||Object.values(me.inv).includes(me.prev))?me.prev:bestSlot(me);if(NETROLE==='client'){sendRel({t:'slot',s:WPN[w].slot})}else equip(me,w)}}
  if(k==='r'){NETROLE==='client'?sendRel({t:'rel'}):reload(me)}if(k==='g'){/* drop */}
  if((k===' '||k==='e')&&ROY&&me.inPlane){NETROLE==='client'?sendRel({t:'jump'}):jumpOut(me)}});
c.on(document,'keyup',e=>{if(e.key==='Tab')showBoard(false)});
c.on(renderer.domElement,'mousedown',e=>{if(e.button===2&&state==='play'&&me){NETROLE==='client'?sendRel({t:'scope'}):toggleScope(me)}});
/* buy menu / scoreboard */
let buyOpen=false,boardOpen=false;
function toggleBuy(){if(!me)return;buyOpen=!buyOpen;if(buyOpen){if(document.pointerLockElement)document.exitPointerLock();renderBuy()}else{H.ov.classList.remove('on');try{renderer.domElement.requestPointerLock()}catch(e){}}}
function renderBuy(){H.ov.classList.add('on');H.ov.innerHTML='';const card=el('div',{class:'tx-card'});H.ov.append(card);card.append(el('h2',null,'BUY ',el('span',null,'$'+me.money)),el('p',null,canBuy(me)?'Click to buy. Press B to close.':'Buy time is over.'));
  BUY.forEach(([cat,list])=>{card.append(el('h3',null,cat));const g=el('div',{class:'tx-buy'});list.forEach(id=>{const it=WPN[id]||GEAR[id];if(it.side&&it.side!==me.team)return;const ok=me.money>=it.price&&canBuy(me);const b=el('button',{type:'button',class:ok?'':'no'},it.n,el('small',null,'$'+it.price));b.onclick=e=>{e.stopPropagation();if(NETROLE==='client'){sendRel({t:'buy',id});setTimeout(renderBuy,250)}else{if(buy(me,id))beep(900,.05,'triangle',.05);renderBuy()}};g.append(b)});card.append(g)});
  const cl=el('button',{type:'button',class:'tx-btn pri'},'Close (B)');cl.onclick=e=>{e.stopPropagation();toggleBuy()};card.append(el('div',null,cl))}
function showBoard(on){boardOpen=on;if(!on){if(!buyOpen)H.ov.classList.remove('on');return}H.ov.classList.add('on');H.ov.innerHTML='';const card=el('div',{class:'tx-card'});H.ov.append(card);const tb=el('table',{class:'tx-sb'});tb.append(el('tr',null,el('th',null,'Player'),el('th',null,ROY?'':'Team'),el('th',null,'K'),el('th',null,'D'),el('th',null,ROY?'':'$')));
  players.slice().sort((a,b)=>b.kills-a.kills).forEach(p=>tb.append(el('tr',{class:(p===me?'me ':'')+(p.alive?'':'dead')},el('td',null,p.name+(p.bot?' 🤖':p.peer||p===me?' 🌐':'')),el('td',{style:'color:'+(p.team==='T'?'#ffbe6a':'#8ac0ff')},ROY?'':p.team==='T'?'ATK':'DEF'),el('td',null,String(p.kills)),el('td',null,String(p.deaths)),el('td',null,ROY?'':(p.team===me.team?'$'+p.money:'')))));card.append(el('h2',null,ROY?'LAST ':'BREACH ',el('span',null,ROY?'DROP':round.score.T+' : '+round.score.CT)),tb,el('p',null,roomId?'Room code: '+roomId.toUpperCase()+' · '+(NETROLE==='host'?'you are hosting':'online'):'Offline match vs bots'))}
/* ---------------- menus ---------------- */
function menu(){state='menu';leaveNet();if(document.pointerLockElement)document.exitPointerLock();H.ov.classList.add('on');H.ov.innerHTML='';const card=el('div',{class:'tx-card'});H.ov.append(card);
  card.append(el('h2',null,ROY?'LAST ':'BREACH ',el('span',null,ROY?'DROP':'5v5')),el('p',null,ROY?'Battle royale. Jump from the plane, loot houses for guns, armour and meds, stay inside the shrinking zone and be the last one standing. 24 players: online friends plus bots.':'Tactical 5v5 bomb defusal. Attackers plant the bomb at site A or B; defenders stop them or defuse it. Buy weapons each round, first team to 8 rounds wins. Play online with friends; bots fill the empty slots.'));
  const nm=el('input',{class:'tx-in',value:nameMe,maxlength:'16'});nm.addEventListener('input',()=>{nameMe=nm.value.replace(/[^A-Za-z0-9 _.\-]/g,'').slice(0,16)||'Player';S.set('tx_name',nameMe)});nm.addEventListener('keydown',e=>e.stopPropagation());card.append(el('h3',null,'YOUR NAME'),nm);
  card.append(el('h3',null,'BOT SKILL'));['Easy','Normal','Hard'].forEach((n,i)=>{const b=el('button',{type:'button',class:'tx-btn'+(diff===i?' on':'')},n);b.onclick=e=>{e.stopPropagation();diff=i;S.set(GAME+'_diff',i);menu()};card.append(b)});
  if(!ROY){card.append(el('h3',null,'TEAM'));[['auto','Auto'],['T','Attackers'],['CT','Defenders']].forEach(([v,n])=>{const b=el('button',{type:'button',class:'tx-btn'+(teamPref===v?' on':'')},n);b.onclick=e=>{e.stopPropagation();teamPref=v;S.set(GAME+'_team',v);menu()};card.append(b)})}
  card.append(el('h3',null,'PLAY'));const b1=el('button',{type:'button',class:'tx-btn pri'},'Play vs bots');b1.onclick=e=>{e.stopPropagation();startLocal('solo')};const b2=el('button',{type:'button',class:'tx-btn'},'🌐 Host online match');b2.onclick=e=>{e.stopPropagation();hostMenu()};const b3=el('button',{type:'button',class:'tx-btn'},'🌐 Join online match');b3.onclick=e=>{e.stopPropagation();joinMenu()};card.append(b1,b2,b3);
  card.append(el('p',{style:'font-size:12px;opacity:.7;margin-top:12px'},ROY?'WASD move · mouse aim · click shoot · right-click scope · E pick up / jump · Q heal · R reload · 1-3 weapons · Shift walk · Ctrl/C crouch · Tab players':'WASD move · mouse aim · click shoot · right-click scope · B buy · 1-5 weapons (4 grenades, 5 bomb) · R reload · E defuse / pick up · hold fire on site with the bomb to plant · Q last weapon · Shift walk · Ctrl/C crouch · Tab scoreboard'))}
function hostMenu(){H.ov.innerHTML='';const card=el('div',{class:'tx-card'});H.ov.append(card);card.append(el('h2',null,'HOST ',el('span',null,'ONLINE')),el('p',null,'Creating a room…'));
  hostRoom().then(id=>{card.innerHTML='';card.append(el('h2',null,'ROOM ',el('span',null,id.toUpperCase())),el('p',null,'Friends can join from “Join online match” (it’s listed there), or by typing this code. Start whenever you like: bots fill empty slots, and friends can join mid-match to replace a bot.'));const lst=el('div',{class:'tx-rooms'});card.append(lst);const upd=()=>{lst.innerHTML='';lst.append(el('div',null,el('b',null,nameMe+' (you, host)')));conns.forEach(c2=>lst.append(el('div',null,el('b',null,c2.name),c2.ready?'connected':'connecting…')))};upd();const iv=setInterval(()=>{if(state!=='menu'){clearInterval(iv);return}upd()},800);
    const go=el('button',{type:'button',class:'tx-btn pri'},'Start match');go.onclick=e=>{e.stopPropagation();clearInterval(iv);startLocal('host')};const bk=el('button',{type:'button',class:'tx-btn'},'Cancel');bk.onclick=e=>{e.stopPropagation();clearInterval(iv);menu()};card.append(go,bk)}).catch(err=>{card.innerHTML='';card.append(el('h2',null,'OFFLINE'),el('p',null,'Online play needs the Detourr server, which isn’t reachable right now ('+err.message+'). You can still play against bots.'));const b=el('button',{type:'button',class:'tx-btn pri'},'Back');b.onclick=e=>{e.stopPropagation();menu()};card.append(b)})}
function joinMenu(){H.ov.innerHTML='';const card=el('div',{class:'tx-card'});H.ov.append(card);card.append(el('h2',null,'JOIN ',el('span',null,'ONLINE')));const lst=el('div',{class:'tx-rooms'},el('p',null,'Looking for rooms…'));const code=el('input',{class:'tx-in',placeholder:'Room code',maxlength:'5'});code.addEventListener('keydown',e=>e.stopPropagation());const jb=el('button',{type:'button',class:'tx-btn pri'},'Join code');const st=el('p');
  const doJoin=id=>{st.textContent='Connecting to '+id.toUpperCase()+'… (peer-to-peer)';joinRoom(id.toLowerCase()).catch(err=>{st.textContent=err.message;leaveNet()})};jb.onclick=e=>{e.stopPropagation();if(code.value.trim())doJoin(code.value.trim())};
  const refresh=()=>api('GET',null,'?list='+GAME).then(r=>{lst.innerHTML='';if(!r.rooms.length)lst.append(el('p',null,'No open rooms right now. Host one and share the code!'));r.rooms.forEach(rm=>{const b=el('button',{type:'button',class:'tx-btn pri'},'Join');b.onclick=e=>{e.stopPropagation();doJoin(rm.id)};lst.append(el('div',null,el('b',null,rm.name),rm.n+'/'+rm.max+' humans',b))})}).catch(err=>{lst.innerHTML='';lst.append(el('p',null,'Can’t reach the Detourr server: '+err.message))});
  const rb=el('button',{type:'button',class:'tx-btn'},'Refresh');rb.onclick=e=>{e.stopPropagation();refresh()};const bk=el('button',{type:'button',class:'tx-btn'},'Back');bk.onclick=e=>{e.stopPropagation();menu()};card.append(lst,el('div',null,code,' ',jb,' ',rb,' ',bk),st);refresh()}
/* ---------------- start local/host match ---------------- */
function startLocal(role){NETROLE=role;if(role==='solo')leaveNet(),NETROLE='solo';cleanupWorld();seed=Math.floor(Math.random()*1e9);if(ROY)royaleMap(seed);else breachMap();mkRadarImg();nextId=1;
  if(ROY){me=mkPlayer({name:nameMe,bot:false,team:'R'});me.local=true;for(let i=0;i<23;i++)mkPlayer({name:BOTN[i%BOTN.length]+(i>=BOTN.length?' '+(i+1):''),bot:true,team:'R'});royaleStart()}
  else{const myTeam=teamPref==='auto'?pick(['T','CT']):teamPref;me=mkPlayer({name:nameMe,bot:false,team:myTeam});me.local=true;let bi=0;for(const t of['T','CT'])for(let i=players.filter(p=>p.team===t).length;i<5;i++)mkPlayer({name:BOTN[bi++],bot:true,team:t});players.forEach(p=>{p.money=800;p.inv={3:'knife'};p.ammo={};p.alive=false});startRound()}
  // attach already-connected peers
  conns.forEach(c2=>{if(c2.ready)onPeerReady(c2)});state='play';H.ov.classList.remove('on');vmSet();try{renderer.domElement.requestPointerLock()}catch(e){}}
const BOTN=['Rook','Vex','Moss','Tango','Brick','Juno','Kilo','Nash','Pike','Quill','Rune','Sage','Tusk','Wren','Yara','Zeke','Ash','Blitz','Cobra','Dune','Echo','Flint','Gale','Hex'];
/* ---------------- main loop ---------------- */
let accT=0,lastInp={},sendT=0;
st3.onFrame((dt0,nowMs)=>{const dt=Math.min(dt0,.05),now=nowMs/1000;
  if(state!=='play'||!me){if(!me){camera.position.set(ROY?160:48,ROY?60:30,ROY?200:70);camera.lookAt(ROY?160:48,0,ROY?160:40)}input.mdx=input.mdy=0;return}
  // look
  const sens=.0022*(me.scoped?(me.scoped===2?.25:.45):1);if(!buyOpen){me.yaw-=input.mdx*sens;me.pitch=clamp(me.pitch-input.mdy*sens,-1.5,1.5)}input.mdx=input.mdy=0;
  const inp=me.alive&&!buyOpen?localInput():{};
  if(NETROLE!=='client'){// authoritative sim
    for(const p of players){if(!p.alive&&!ROY)continue;let pi=p===me?inp:p.bot?botThink(p,dt,now):(p.inp||{});if(!p.alive)continue;p.inp=pi;simPlayer(p,pi,dt,now)}
    if(ROY)stepRoyale(dt);else stepRound(dt);stepGrens(dt);if(NETROLE==='host')netHostTick(dt);else{evQ=[];evRel=[]}
    for(const p of players)p.seenT=Math.max(0,(p.seenT||0)-dt)}
  else{// client: predict own movement, interpolate others
    if(me.alive){if(ROY&&(me.inPlane)){const pp=planePos();me.x=pp.x;me.z=pp.z;me.y=plane.y}else if(ROY&&me.y-groundAt(me.x,me.z,.3,me.y)>.5&&!me.onGround){stepAir(me,dt,inp)}else moveP(me,dt,inp);me.fireCd=Math.max(0,me.fireCd-dt);if(inp.fire&&me.fireCd<=0){const W=WPN[me.cur];if(W&&!W.melee&&!W.gren&&me.ammo[me.cur]&&me.ammo[me.cur].mag>0){me.fireCd=W.rof;if(W.auto||!me.fireHeld)vmKick(me.cur)}}me.fireHeld=inp.fire}
    sendT-=dt;if(sendT<=0){sendT=1/30;sendInput(inp)}
    for(const p of players){if(p===me||p.tx==null)continue;const k=Math.min(1,dt*12);p.x+=(p.tx-p.x)*k;p.y+=(p.ty-p.y)*k;p.z+=(p.tz-p.z)*k;let dy=p.tyaw-p.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));p.yaw+=dy*k;p.pitch+=(p.tpitch-p.pitch)*k;p.spd=Math.hypot(p.vx,p.vz)}
    if(ROY&&plane){plane.t+=dt;const pp=planePos();plane.m.position.set(pp.x,plane.y,pp.z);plane.m.rotation.y=Math.atan2(-plane.dx,-plane.dz)+PI;plane.m.visible=plane.t*plane.sp<plane.len+200}
    me.flashT=Math.max(0,me.flashT-dt)}
  // visuals
  for(const p of players){if(p===me){p.mdl.visible=false;continue}p.mdl.visible=!p.inPlane&&(p.alive||p.deadT<30);p.mdl.position.set(p.x,p.y+(p.chute?0:0),p.z);p.mdl.rotation.y=p.yaw;setCharGun(p);poseChar(p,dt);if(p.chute&&!p.mdl.userData.chute){const ch=new T.Mesh(new T.SphereGeometry(2.6,12,6,0,2*PI,0,PI/2.6),new T.MeshStandardMaterial({color:lin(pick([0xe8321e,0x2a6ae8,0xf2c21a,0x3ab04a])),side:T.DoubleSide,roughness:.7}));ch.position.y=4.6;p.mdl.add(ch);p.mdl.userData.chute=ch}if(p.mdl.userData.chute)p.mdl.userData.chute.visible=!!p.chute}
  // smokes
  for(let i=smokes.length-1;i>=0;i--){const s=smokes[i];s.t+=dt;if(!s.puffs){s.puffs=[];for(let k=0;k<26;k++){const m=new T.Sprite(new T.SpriteMaterial({map:puffTex,color:0xc8c8c4,transparent:true,depthWrite:false,opacity:0}));m.position.set(s.x+rnd(-3,3),s.y+rnd(-1.4,1.6),s.z+rnd(-3,3));m.scale.setScalar(rnd(3.5,5.5));fx.add(m);s.puffs.push(m)}}const o=s.t<1.2?s.t/1.2:s.t>s.life-2?Math.max(0,(s.life-s.t)/2):1;s.puffs.forEach(m=>m.material.opacity=.92*o);if(s.t>s.life){s.puffs.forEach(m=>fx.remove(m));smokes.splice(i,1)}}
  for(let i=puffs.length-1;i>=0;i--){const q=puffs[i];q.life-=dt;if(q.life<=0){fx.remove(q.m);q.m.material.dispose();puffs.splice(i,1);continue}q.m.position.addScaledVector(q.v,dt);q.m.scale.multiplyScalar(1+dt*.8);q.m.material.opacity=q.op*Math.min(1,q.life/q.max*1.5)}
  // tracers
  {const pos=trGeo.attributes.position;let n=0;for(let i=tracers.length-1;i>=0;i--){const t=tracers[i];t.l-=dt;if(t.l<=0){tracers.splice(i,1);continue}if(n>=200)continue;const d=t.b.clone().sub(t.a),len=d.length();const k=1-t.l/.06;const s=t.a.clone().addScaledVector(d,Math.min(1,k*1.2)*.9),e2=s.clone().addScaledVector(d.normalize(),Math.min(4,len));pos.setXYZ(n*2,s.x,s.y,s.z);pos.setXYZ(n*2+1,e2.x,e2.y,e2.z);n++}for(let i=n;i<200;i++){pos.setXYZ(i*2,0,-99,0);pos.setXYZ(i*2+1,0,-99,0)}pos.needsUpdate=true}
  // bomb model
  if(bomb&&!ROY){if(!bombM){bombM=gunModel('bomb');scene.add(bombM)}bombM.visible=bomb.st!=='boom';bombM.position.set(bomb.x,bomb.y+.05,bomb.z);if(bomb.st==='planted'){bombM.children[1]&&bombM.children[1].material.emissive.setHex(Math.sin(now*12*(1+bomb.t/10))>0?0xff2010:0x220000)}}else if(bombM)bombM.visible=false;
  // camera
  shake=Math.max(0,shake-dt);const ey=me.alive?eyeY(me):me.y+.3;const spec=!me.alive?players.find(p=>p.alive&&(ROY||p.team===me.team)&&p!==me):null;
  if(spec&&me.deadT>2.5){camera.position.set(spec.x+Math.sin(spec.yaw)*2.6,eyeY(spec)+.6,spec.z+Math.cos(spec.yaw)*2.6);camera.rotation.set(-.15,spec.yaw,0,'YXZ');H.hint.textContent='Spectating '+spec.name}
  else{me.deadT=(me.deadT||0)+(me.alive?0:dt);const vr=me.rcP*.55;camera.position.set(me.x+(shake?rnd(-shake,shake)*.1:0),ey,me.z);camera.rotation.set(me.pitch+vr,me.yaw+me.rcY*.5,0,'YXZ');if(ROY&&me.inPlane){const pp=planePos();camera.position.set(pp.x-plane.dx*30,plane.y+12,pp.z-plane.dz*30);camera.lookAt(pp.x,plane.y,pp.z)}
    else if(ROY&&(me.air||me.chute)&&!me.onGround){camera.position.set(me.x+Math.sin(me.yaw)*5,me.y+2.5,me.z+Math.cos(me.yaw)*5);camera.rotation.set(me.pitch-.25,me.yaw,0,'YXZ');me.mdl.visible=true;me.mdl.position.set(me.x,me.y,me.z);me.mdl.rotation.y=me.yaw;poseChar(me,dt);setCharGun(me);if(me.mdl.userData.chute)me.mdl.userData.chute.visible=!!me.chute;else if(me.chute){const ch=new T.Mesh(new T.SphereGeometry(2.6,12,6,0,2*PI,0,PI/2.6),new T.MeshStandardMaterial({color:lin(0xe8321e),side:T.DoubleSide}));ch.position.y=4.6;me.mdl.add(ch);me.mdl.userData.chute=ch}}}
  const W=WPN[me.cur]||{};const fovT=me.scoped&&W.scope?80/(me.scoped===2?W.scope*2.2:W.scope):80;if(Math.abs(camera.fov-fovT)>.1){camera.fov+=(fovT-camera.fov)*Math.min(1,dt*18);camera.updateProjectionMatrix()}
  sun.position.set(camera.position.x+30,90,camera.position.z+20);sun.target.position.set(camera.position.x,0,camera.position.z);
  if(ROY)zoneWall();else if(zoneM)zoneM.visible=false;
  stepVM(dt);updHUD(dt);
  // hints/progress bars
  let bar=0,hint='';if(me.alive&&!ROY){if(me.plantT>0){bar=me.plantT/3.2;hint='Planting…'}else if(me.defT>0){bar=me.defT/(me.kit?5:10);hint='Defusing…'}else if(me.cur==='bomb'&&inSite(me.x,me.z))hint='Hold fire to plant';else if(me.team==='CT'&&bomb&&bomb.st==='planted'&&Math.hypot(me.x-bomb.x,me.z-bomb.z)<1.6)hint='Hold E to defuse'}
  if(me.alive&&ROY){if(me.inPlane)hint='Press SPACE or E to jump';else if(me.healT>0){bar=1-me.healT/(me.healKind==='m'?5:2.5);hint='Healing…'}else{let best=null,bd=2;for(const it of items){const d=Math.hypot(it.x-me.x,it.z-me.z);if(d<bd&&Math.abs(it.y-me.y)<2){bd=d;best=it}}if(best)hint='E: pick up '+(best.t==='gun'?WPN[best.w].n:{ammo:'ammo',vest:'armour vest L'+(best.lv||1),helm:'helmet',band:'bandage',med:'medkit'}[best.t]);if(zone&&Math.hypot(me.x-zone.cx,me.z-zone.cz)>zone.r)hint='⚠ Outside the zone! '+hint}}
  if(!me.alive&&!(spec&&me.deadT>2.5))hint=ROY?'You were eliminated':'You died. Wait for the next round';if(buyOpen)hint='';
  if(!(spec&&me.deadT>2.5))H.hint.textContent=hint;H.bar.style.display=bar>0?'block':'none';H.bar.firstChild.style.width=(bar*100)+'%';if(hitmark>0){hitmark-=dt;H.x.style.filter='drop-shadow(0 0 3px #fff)'}else H.x.style.filter='';
  if(matchOver&&!overShown){overShown=true;setTimeout(()=>{if(state==='play')endScreen()},3500)}});
let bombM=null,overShown=false;
function simPlayer(p,inp,dt,now){p.fireCd=Math.max(0,p.fireCd-dt);p.swapT=Math.max(0,p.swapT-dt);p.flashT=Math.max(0,p.flashT-dt);p.rcP*=Math.exp(-dt*(p.fireCd>0?1.5:7));p.rcY*=Math.exp(-dt*(p.fireCd>0?1.5:7));p.dmgT=Math.max(0,p.dmgT-dt);if(p.rescope>0){p.rescope-=dt;if(p.rescope<=0&&p.bot===false&&false)toggleScope(p)}
  if(p.rel>0){p.rel-=dt;if(p.rel<=0){p.rel=0;finishReload(p)}}if(p.healT>0){p.healT-=dt;if(p.healT<=0){p.hp=Math.min(100,p.hp+p.healAmt)}}
  if(ROY&&p.inPlane){const pp=planePos();p.x=pp.x;p.z=pp.z;p.y=plane.y;if(inp.j&&p!==me)jumpOut(p);return}
  if(ROY&&(p.air||p.y-groundAt(p.x,p.z,.3,p.y)>1.2&&!p.onGround&&p.vy<-8)){stepAir(p,dt,inp);return}
  moveP(p,dt,inp);if(inp.fire&&(ROY||round.phase!=='buy')){const W=WPN[p.cur];if(W&&(W.auto||W.melee||!p.fireHeld||W.gren||W.bomb))fire(p,now)}p.fireHeld=inp.fire;if(!ROY)stepBombActions(p,dt,inp);else{if(inp.use&&!p.useHeld){let best=null,bd=2;for(const it of items){const d=Math.hypot(it.x-p.x,it.z-p.z);if(d<bd&&Math.abs(it.y-p.y)<2){bd=d;best=it}}if(best)pickUp(p,best)}p.useHeld=inp.use}
  if(p.y<-5){p.y=groundAt(p.x,p.z,.3,100)}}
function endScreen(){state='over';if(document.pointerLockElement)document.exitPointerLock();H.ov.classList.add('on');H.ov.innerHTML='';const card=el('div',{class:'tx-card'});H.ov.append(card);
  if(ROY){const w=players.find(p=>p.alive);const win=w===me;card.append(el('h2',null,win?'WINNER ':'GAME ',el('span',null,win?'WINNER!':'OVER')),el('p',null,win?'Last one standing with '+me.kills+' kills.':(w?w.name+' won. ':'')+'You got '+me.kills+' kills.'));const b=S.get('best_'+GAME,0);if(win){c.best((S.get(GAME+'_wins',0)||0)+1);S.set(GAME+'_wins',(S.get(GAME+'_wins',0)||0)+1)}}
  else{const w=round.score.T>=WINS?'T':'CT';const win=w===me.team;card.append(el('h2',null,win?'VICTORY ':'DEFEAT ',el('span',null,round.score.T+' : '+round.score.CT)),el('p',null,(w==='T'?'Attackers':'Defenders')+' win the match. You: '+me.kills+' kills, '+me.deaths+' deaths.'));if(win){const n=(S.get(GAME+'_wins',0)||0)+1;S.set(GAME+'_wins',n);c.best(n)}}
  const a=el('button',{type:'button',class:'tx-btn pri'},'Play again');a.onclick=e=>{e.stopPropagation();overShown=false;startLocal(NETROLE==='host'?'host':'solo')};const m=el('button',{type:'button',class:'tx-btn'},'Menu');m.onclick=e=>{e.stopPropagation();overShown=false;menu()};card.append(a,m)}
const _ev=applyEvt;applyEvt=function(e,local){if(e.k==='match'&&NETROLE==='client'){matchOver=true}if(e.k==='rwin'){matchOver=true;const p=pById(e.p);msgC(p?(p===me?'WINNER WINNER!':p.name+' wins'):'Draw','',4)}return _ev(e,local)};
menu();
if(window.__GS_TEST)window.__TX={get me(){return me},get feed(){return feed},get players(){return players},get state(){return state},startLocal,get round(){return round},get items(){return items},get zone(){return zone},get bomb(){return bomb},buy,astar,get boxes(){return boxes},api,joinRoom,hostRoom,get conns(){return conns},get NETROLE(){return NETROLE},set diff(v){diff=v},jumpOut,peerId,fast(sec){const dt=.05;let now=performance.now()/1000;for(let t=0;t<sec;t+=dt){now+=dt;for(const p of players){if(!p.alive&&!ROY)continue;let pi=p===me?{}:p.bot?botThink(p,dt,now):(p.inp||{});if(!p.alive)continue;p.inp=pi;simPlayer(p,pi,dt,now)}if(ROY)stepRoyale(dt);else stepRound(dt);stepGrens(dt);evQ=[];evRel=[];for(const p of players)p.seenT=Math.max(0,(p.seenT||0)-dt)}return players.map(p=>[p.name,p.alive?1:0,p.hp|0,p.inv[1]||p.inv[2]||'-',p.kills]).map(a=>a.join(':')).join(' ')}};
return()=>{leaveNet();try{speechSynthesis.cancel()}catch(e){}st3.dispose()}})}
G.push({id:'breach',name:'Breach 5v5',kind:'game',wide:true,big:true,tint:'#ffd23f',blurb:'A Counter-Strike-style tactical shooter. Attackers plant the bomb, defenders defuse it. Buy rifles, snipers, armour and grenades, and learn the recoil. Play online with friends (peer-to-peer, room codes) or against bots. First to 8 rounds.',fmt:b=>b+' match wins',
art:'<rect width="120" height="72" fill="#e8d0a8"/><rect y="48" width="120" height="24" fill="#b89a70"/><rect x="0" y="10" width="34" height="40" fill="#c9a878"/><rect x="86" y="14" width="34" height="36" fill="#c9a878"/><rect x="40" y="36" width="12" height="12" fill="#8a6a3a" stroke="#4a3418"/><text x="70" y="44" font-family="Arial Black" font-size="16" fill="#c8322a" opacity=".8">A</text><path d="M70 72l14-30h8l-4 30z" fill="#26282c"/><path d="M84 42l18-6 2 4-18 6z" fill="#26282c"/><circle cx="60" cy="28" r="3" fill="none" stroke="#6aff7a" stroke-width="1.2"/>',
run(root,c){return tacticalGame(root,c,{mode:'breach',id:'breach'})}});
G.push({id:'royale',name:'Last Drop',kind:'game',wide:true,big:true,tint:'#ffb02e',blurb:'Battle royale: jump from the plane, skydive into town, loot guns, armour and medkits, and survive the shrinking zone. 24 players: online friends plus bots. Last one standing wins.',fmt:b=>b+' wins',
art:'<rect width="120" height="72" fill="#9ac8f0"/><rect y="46" width="120" height="26" fill="#5a7a3a"/><rect x="14" y="34" width="20" height="14" fill="#d8d0c0"/><rect x="12" y="32" width="24" height="3" fill="#5a5a60"/><rect x="80" y="30" width="24" height="18" fill="#6a4a3a"/><circle cx="60" cy="58" r="30" fill="none" stroke="#50a0ff" stroke-width="2" stroke-dasharray="4 3"/><path d="M50 10q10-8 20 0z" fill="#e8321e"/><path d="M50 10l10 12M70 10l-10 12" stroke="#333" stroke-width=".6"/><rect x="58" y="22" width="4" height="6" fill="#3a4428"/><path d="M20 14h36l6-3h-6l-6 3" fill="#8a9098"/>',
run(root,c){return tacticalGame(root,c,{mode:'royale',id:'royale'})}});
