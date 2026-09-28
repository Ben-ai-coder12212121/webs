/* ================= BIG KIT: shared engine for the large 3D story games =================
   characters with procedural animation, third-person camera, box world + collision + raycast,
   merged static geometry, nav grid A*, particles, decals, HUD (bars, prompts, objectives, dialog,
   banners, minimap), sound effects and saves. */
const BK_CSS=`.bk .hud{font:600 13px system-ui,-apple-system,Segoe UI,sans-serif;color:#fff}
.bk button{transform:none!important}
.bk-bars{position:absolute;left:14px;bottom:14px;display:flex;flex-direction:column;gap:4px;width:210px;pointer-events:none}
.bk-bar{height:9px;border-radius:5px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.25);overflow:hidden}.bk-bar i{display:block;height:100%;transition:width .12s}
.bk-bar.hp i{background:linear-gradient(90deg,#3ac85a,#7ae07a)}.bk-bar.ar i{background:linear-gradient(90deg,#3a8ae8,#7ab8ff)}.bk-bar.st i{background:linear-gradient(90deg,#e8c23a,#ffe07a)}.bk-bar.ot i{background:linear-gradient(90deg,#c83ae8,#e07aff)}
.bk-tr{position:absolute;right:14px;top:12px;text-align:right;pointer-events:none;text-shadow:0 2px 6px #000}
.bk-money{font:900 26px 'Arial Black',system-ui,sans-serif;color:#8aff8a}.bk-wep{font:800 14px system-ui,sans-serif;margin-top:2px}.bk-stars{font-size:22px;letter-spacing:2px;color:#fff}.bk-stars b{color:#ffd23f;text-shadow:0 0 8px #ffb000}
.bk-obj{position:absolute;left:50%;top:14px;transform:translateX(-50%);max-width:60%;text-align:center;font:800 15px system-ui,sans-serif;text-shadow:0 2px 8px #000;pointer-events:none;background:rgba(0,0,0,.35);padding:5px 14px;border-radius:8px;display:none}
.bk-prompt{position:absolute;left:50%;bottom:22%;transform:translateX(-50%);background:rgba(0,0,0,.65);border:1px solid rgba(255,255,255,.3);border-radius:8px;padding:6px 14px;font:800 14px system-ui,sans-serif;pointer-events:none;display:none;white-space:nowrap}
.bk-prompt b{display:inline-block;background:#fff;color:#111;border-radius:4px;padding:0 6px;margin-right:6px}
.bk-note{position:absolute;left:14px;top:230px;display:flex;flex-direction:column;gap:6px;pointer-events:none;max-width:320px}
.bk-note div{background:rgba(0,0,0,.6);border-left:4px solid #ffd23f;padding:6px 10px;border-radius:0 6px 6px 0;font:700 13px system-ui,sans-serif;animation:bkin .3s ease-out}
@keyframes bkin{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:none}}
.bk-ban{position:absolute;left:0;right:0;top:34%;text-align:center;pointer-events:none;opacity:0;transition:opacity .4s}.bk-ban.on{opacity:1}
.bk-ban b{display:block;font:900 48px/1.05 'Arial Black',Impact,system-ui,sans-serif;letter-spacing:.02em;text-shadow:0 4px 20px #000,0 0 2px #000}.bk-ban small{display:block;margin-top:8px;font:800 16px system-ui,sans-serif;text-shadow:0 2px 8px #000}
.bk-dlg{position:absolute;left:50%;bottom:9%;transform:translateX(-50%);width:min(760px,90%);background:rgba(8,8,12,.78);border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:12px 16px;display:none;pointer-events:none}
.bk-dlg b{display:block;font:900 13px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px}.bk-dlg p{margin:0;font:600 16px/1.4 Georgia,serif}.bk-dlg small{position:absolute;right:12px;bottom:8px;opacity:.5;font-size:11px}
.bk-lb{position:absolute;left:0;right:0;height:0;background:#000;transition:height .5s;pointer-events:none;z-index:4}.bk-lb.t{top:0}.bk-lb.b{bottom:0}.bk.cine .bk-lb{height:11%}
.bk.cine .bk-bars,.bk.cine .bk-tr,.bk.cine .bk-map,.bk.cine .bk-x,.bk.cine .bk-obj,.bk.cine .bk-keys,.bk.cine .bk-note,.bk.cine .nh-area{opacity:0}
.bk-fade{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .6s;z-index:5}
.bk-x{position:absolute;left:50%;top:50%;width:18px;height:18px;margin:-9px;pointer-events:none}.bk-x i{position:absolute;background:#fff;box-shadow:0 0 2px #000}
.bk-x i:nth-child(1){left:8px;top:0;width:2px;height:6px}.bk-x i:nth-child(2){left:8px;bottom:0;width:2px;height:6px}.bk-x i:nth-child(3){top:8px;left:0;width:6px;height:2px}.bk-x i:nth-child(4){top:8px;right:0;width:6px;height:2px}
.bk-x.dot i{display:none}.bk-x.dot::after{content:'';position:absolute;left:7px;top:7px;width:4px;height:4px;border-radius:50%;background:#fff;box-shadow:0 0 3px #000}
.bk-hm{position:absolute;left:50%;top:50%;width:30px;height:30px;margin:-15px;pointer-events:none;opacity:0;background:linear-gradient(45deg,transparent 45%,#fff 45%,#fff 55%,transparent 55%),linear-gradient(-45deg,transparent 45%,#fff 45%,#fff 55%,transparent 55%)}.bk-hm.k{filter:drop-shadow(0 0 3px red) sepia(1) saturate(9) hue-rotate(-40deg)}
.bk-hurt{position:absolute;inset:0;pointer-events:none;opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 50%,rgba(170,0,0,.6));transition:opacity .3s}
.bk .hud canvas.bk-map{position:absolute;inset:auto;left:14px;bottom:62px;right:auto;top:auto;width:200px;height:200px;border-radius:50%;border:3px solid rgba(0,0,0,.6);box-shadow:0 2px 10px rgba(0,0,0,.5);pointer-events:none}
.bk-menu{position:absolute;inset:0;background:rgba(6,6,10,.82);display:none;align-items:center;justify-content:center;z-index:6;pointer-events:auto}.bk-menu.on{display:flex}
.bk-card{background:#14141c;border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:18px 20px;max-width:min(720px,92%);max-height:88%;overflow:auto;color:#eee}
.bk-card h2{margin:0 0 8px;font:900 26px 'Arial Black',system-ui,sans-serif}.bk-card h3{margin:14px 0 6px;font:900 12px system-ui;letter-spacing:.12em;opacity:.7}
.bk-card p{margin:6px 0;line-height:1.5}.bk-btn{all:unset;cursor:pointer;display:inline-block;margin:4px 6px 4px 0;padding:8px 14px;border-radius:8px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);font:800 13px system-ui,sans-serif}.bk-btn:hover{background:rgba(255,255,255,.2)}.bk-btn.pri{background:#ffd23f;color:#111;border-color:#ffd23f}.bk-btn.no{opacity:.4}
.bk-keys{position:absolute;right:14px;bottom:14px;background:rgba(0,0,0,.45);border-radius:8px;padding:6px 9px;font:700 10.5px/1.55 system-ui,sans-serif;pointer-events:none;display:grid;grid-template-columns:auto auto;column-gap:10px}
.bk-keys b{display:inline-block;min-width:13px;padding:0 4px;margin-right:4px;border-radius:3px;background:rgba(255,255,255,.18);font:800 9.5px/1.45 system-ui,sans-serif;text-align:center}.bk-keys.min div{display:none}.bk-keys .k2{grid-column:1/-1;opacity:.6;display:block!important}
.bk.touch .bk-keys{display:none}.bk.bkdlg .bk-keys{opacity:0}.bk-tb{position:absolute;right:18px;bottom:210px;display:flex;flex-direction:column;gap:8px;pointer-events:auto}.bk-tb button{all:unset;width:58px;height:44px;border-radius:10px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.35);font:800 11px system-ui;text-align:center;display:none}.bk.touch .bk-tb button{display:block}
@media (max-width:700px){.bk .hud canvas.bk-map{width:120px;height:120px;bottom:50px}.bk-bars{width:130px}.bk-ban b{font-size:30px}.bk-keys{display:none}.bk-note{top:150px}}`;
/* ---------- REAL ART: CC0 photo-scanned PBR textures + HDRI light (Poly Haven), glTF props, Mixamo-rigged characters.
   Served from /assets; games list what they need and withArt() preloads it behind the loading card. Anything missing falls back to the procedural look. */
const ARTX=(()=>{const base=window.__ART_BASE||'/assets/';const P={},got={};let libP=null;
  const lib=()=>libP||(libP=window.THREE.GLTFLoader&&window.THREE.RGBELoader&&window.THREE.SkeletonUtils?Promise.resolve():new Promise((res,rej)=>{const s=document.createElement('script');s.src=base+'lib/loaders.js';s.onload=()=>res();s.onerror=()=>{libP=null;rej(new Error('art loaders'))};document.head.append(s)}));
  const img=u=>new Promise((res,rej)=>new THREE.TextureLoader().load(base+u,res,undefined,rej));
  const one=it=>{if(P[it])return P[it];const i=it.indexOf(':'),k=it.slice(0,i),v=it.slice(i+1);let p;
    if(k==='tex')p=Promise.all(['col','nor','rgh'].map(s=>img('tex/'+v+'_'+s+'.jpg').catch(()=>null))).then(([c,n,r])=>{if(!c)throw new Error('tex '+v);return{c,n,r}});
    else if(k==='img')p=img('tex/'+v);
    else if(k==='hdr')p=new Promise((res,rej)=>new THREE.RGBELoader().setDataType(THREE.UnsignedByteType).load(base+'hdr/'+v+'.hdr',res,undefined,rej));
    else p=new Promise((res,rej)=>new THREE.GLTFLoader().load(base+(k==='chr'?'chars/':'models/')+v+'.glb',res,undefined,rej));
    return P[it]=p.then(r=>got[it]=r,e=>{delete P[it];throw e})};
  return{got,base,load(list,onp){let n=0;return lib().then(()=>Promise.all(list.map(it=>one(it).catch(e=>console.warn('art:',it,e&&e.message)).then(()=>onp&&onp(++n,list.length)))))}}})();
function withArt(root,c,list,start){let dead=false,inner=null;const msg=el('small',null,'Loading textures, lighting and characters. First time only.');const ld=el('div',{class:'g3load'},el('b',null,'Loading 3D…'),msg);root.append(ld);
  load3D().then(()=>ARTX.load(list,(n,t)=>{msg.textContent='Loading art… '+Math.round(n/t*100)+'%'})).catch(e=>console.warn('art',e)).then(()=>{if(dead)return;ld.remove();inner=with3D(root,c,start)});
  return()=>{dead=true;inner&&inner()}}
function bigKit(st3,c,opts){opts=opts||{};
const{T,scene,camera,renderer,wrap,hud,input}=st3;
if(!document.getElementById('bk-css')){const s=document.createElement('style');s.id='bk-css';s.textContent=BK_CSS;document.head.append(s)}
wrap.classList.add('bk');
const V3=T.Vector3,PI=Math.PI,rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,pick=a=>a[Math.floor(Math.random()*a.length)];
const lin=h=>new T.Color(h).convertSRGBToLinear();
const angDiff=(a,b)=>{let d=b-a;while(d>PI)d-=2*PI;while(d<-PI)d+=2*PI;return d};
renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=opts.exposure||1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
/* ---------- textures ---------- */
function ctex(w,h,fn,rx,ry,lin2){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');fn(g,w,h);const t=new T.CanvasTexture(cv);if(!lin2)t.encoding=T.sRGBEncoding;t.anisotropy=4;if(rx){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx,ry||rx)}return t}
const speck=(g,w,h,n,a,b,al)=>{for(let i=0;i<n;i++){const v=Math.floor(rnd(a,b));g.fillStyle=`rgba(${v},${v},${v},${al})`;g.fillRect(Math.random()*w,Math.random()*h,rnd(1,3),rnd(1,3))}};
const blot=(g,w,h,n,cols,r0,r1,al)=>{for(let i=0;i<n;i++){const r=rnd(r0,r1),x=Math.random()*w,y=Math.random()*h,gr=g.createRadialGradient(x,y,0,x,y,r);const c2=cols[i%cols.length];gr.addColorStop(0,`rgba(${c2},${al})`);gr.addColorStop(1,`rgba(${c2},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)}};
const TX={};const tx=(k,f)=>TX[k]||(TX[k]=f());
const TEX={
  asphalt:()=>ctex(256,256,(g,w,h)=>{g.fillStyle='#38393c';g.fillRect(0,0,w,h);speck(g,w,h,6000,20,90,.35);blot(g,w,h,20,['20,20,22','70,70,72'],10,40,.25)},1,1),
  concrete:()=>ctex(256,256,(g,w,h)=>{g.fillStyle='#a8a49c';g.fillRect(0,0,w,h);speck(g,w,h,4000,110,190,.3);blot(g,w,h,16,['130,126,118','180,176,168'],10,40,.25);g.strokeStyle='rgba(0,0,0,.2)';g.lineWidth=2;g.strokeRect(0,0,w,h)},1,1),
  grass:()=>ctex(256,256,(g,w,h)=>{g.fillStyle='#4a7a34';g.fillRect(0,0,w,h);for(let i=0;i<6000;i++){g.fillStyle=`hsl(${rnd(80,110)},${rnd(35,55)}%,${rnd(22,40)}%)`;g.fillRect(Math.random()*w,Math.random()*h,1,rnd(2,5))}},1,1),
  dirt:()=>ctex(256,256,(g,w,h)=>{g.fillStyle='#6a5438';g.fillRect(0,0,w,h);speck(g,w,h,6000,50,130,.3);blot(g,w,h,20,['80,62,40','110,90,60','50,40,28'],8,40,.35)},1,1),
  sand:()=>ctex(256,256,(g,w,h)=>{g.fillStyle='#d8c090';g.fillRect(0,0,w,h);speck(g,w,h,8000,150,230,.25)},1,1),
  brick:()=>ctex(256,256,(g,w,h)=>{g.fillStyle='#8a8074';g.fillRect(0,0,w,h);for(let r=0;r<16;r++)for(let k=0;k<5;k++){g.fillStyle=`hsl(${rnd(6,18)},${rnd(35,55)}%,${rnd(28,40)}%)`;g.fillRect(k*56+(r%2?28:0)-28+2,r*16+2,52,12)}speck(g,w,h,2000,40,120,.2)},1,1),
  wood:()=>ctex(256,256,(g,w,h)=>{g.fillStyle='#8a6440';g.fillRect(0,0,w,h);for(let i=0;i<120;i++){g.strokeStyle=`rgba(50,30,15,${rnd(.1,.35)})`;g.lineWidth=rnd(.5,2);g.beginPath();const y=Math.random()*h;g.moveTo(0,y);g.bezierCurveTo(w*.3,y+rnd(-6,6),w*.7,y+rnd(-6,6),w,y+rnd(-4,4));g.stroke()}for(let y=0;y<h;y+=32){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,y,w,2)}},1,1),
  bark:()=>ctex(128,256,(g,w,h)=>{g.fillStyle='#4a3a2a';g.fillRect(0,0,w,h);for(let i=0;i<60;i++){g.strokeStyle=`rgba(${rnd(20,40)|0},${rnd(15,30)|0},10,.6)`;g.lineWidth=rnd(1,4);g.beginPath();const x=Math.random()*w;g.moveTo(x,0);for(let y=0;y<h;y+=16)g.lineTo(x+rnd(-4,4),y);g.stroke()}speck(g,w,h,1000,30,90,.3)},1,1),
  rock:()=>ctex(256,256,(g,w,h)=>{g.fillStyle='#7a7670';g.fillRect(0,0,w,h);blot(g,w,h,40,['90,86,80','130,126,118','60,58,54'],10,50,.4);speck(g,w,h,3000,60,160,.3)},1,1),
  metal:()=>ctex(256,256,(g,w,h)=>{g.fillStyle='#7a7e84';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=2){g.fillStyle=`rgba(255,255,255,${rnd(0,.05)})`;g.fillRect(0,y,w,1)}speck(g,w,h,1500,60,140,.2)},1,1),
  roof:()=>ctex(256,256,(g,w,h)=>{g.fillStyle='#5a4a44';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let x=0;x<w;x+=24){g.fillStyle=`hsl(10,${rnd(15,30)}%,${rnd(22,34)}%)`;g.fillRect(x+(y/16%2)*12,y,22,14)}},1,1),
  plaster:()=>ctex(256,256,(g,w,h)=>{g.fillStyle='#d8d0c0';g.fillRect(0,0,w,h);speck(g,w,h,4000,170,240,.2);blot(g,w,h,20,['190,180,160','220,214,200'],10,50,.3)},1,1),
  tile:()=>ctex(256,256,(g,w,h)=>{g.fillStyle='#d8d4cc';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32)for(let x=0;x<w;x+=32){g.fillStyle=`hsl(40,10%,${rnd(78,86)}%)`;g.fillRect(x+1,y+1,30,30)}},1,1),
  leaves:()=>ctex(128,128,(g,w,h)=>{g.fillStyle='#2e5a22';g.fillRect(0,0,w,h);for(let i=0;i<500;i++){g.fillStyle=`hsl(${rnd(80,120)},${rnd(35,55)}%,${rnd(18,38)}%)`;g.beginPath();g.ellipse(Math.random()*w,Math.random()*h,rnd(2,5),rnd(1,3),Math.random()*3,0,7);g.fill()}},1,1),
  hairstr:()=>ctex(128,128,(g,w,h)=>{g.fillStyle='#c8c8c8';g.fillRect(0,0,w,h);for(let i=0;i<900;i++){const v=rnd(120,255)|0;g.strokeStyle=`rgba(${v},${v},${v},.5)`;g.lineWidth=rnd(.5,1.5);const x=Math.random()*w,y=Math.random()*h;g.beginPath();g.moveTo(x,y);g.lineTo(x+rnd(-3,3),y+rnd(6,16));g.stroke()}},1,1),
  glow:()=>ctex(64,64,g=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64)}),
  scorch:()=>ctex(128,128,g=>{const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(8,6,4,.95)');gr.addColorStop(.6,'rgba(20,16,12,.6)');gr.addColorStop(1,'rgba(20,16,12,0)');g.fillStyle=gr;g.fillRect(0,0,128,128)},0,0,true),
  blood:()=>ctex(128,128,g=>{for(let i=0;i<14;i++){g.fillStyle=`rgba(${rnd(80,120)|0},4,6,.85)`;g.beginPath();g.arc(64+rnd(-34,34),64+rnd(-34,34),rnd(6,22),0,7);g.fill()}},0,0,true),
  hole:()=>ctex(64,64,g=>{const gr=g.createRadialGradient(32,32,0,32,32,30);gr.addColorStop(0,'rgba(10,8,6,1)');gr.addColorStop(.4,'rgba(30,24,18,.8)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64)},0,0,true)};
/* photo textures replace the procedural ones when preloaded ('tex:<set>'); game keys map onto the CC0 sets */
const RK={dirt:'mud',wood:'planks',tile:'tiles'},RT={};
function realTex(k,slot){const a=ARTX.got['tex:'+(RK[k]||k)];if(!a||!a[slot])return null;const key=k+slot;if(RT[key])return RT[key];const t=a[slot];t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;t.encoding=slot==='c'?T.sRGBEncoding:T.LinearEncoding;t.needsUpdate=true;return RT[key]=t}
const T_=k=>realTex(k,'c')||(TEX[k]?tx(k,TEX[k]):tx('concrete',TEX.concrete));
const ENV={i:1};
const MC={};const mat=(k,col,o)=>{const key=k+'|'+col+'|'+JSON.stringify(o||{});if(MC[key])return MC[key];const p=Object.assign({color:lin(col),roughness:.85,metalness:0},o||{});
  if(p.map&&typeof p.map==='string'){const mk=p.map;p.map=T_(mk);const n=realTex(mk,'n'),r=realTex(mk,'r');if(n){p.normalMap=n;p.normalScale=new T.Vector2(o.bump||1,o.bump||1)}if(r){p.roughnessMap=r;p.roughness=o.roughness!=null?Math.min(1,o.roughness*1.15):1}}delete p.bump;
  if(p.emissive!=null&&typeof p.emissive==='number')p.emissive=lin(p.emissive);const m=new T.MeshStandardMaterial(p);m.envMapIntensity=ENV.i;return MC[key]=m};
/* HDRI image-based lighting: env('day') lights every PBR material from the real sky; bg:true also shows it as the backdrop */
const ENVC={};function env(name,o){o=o||{};const h=ARTX.got['hdr:'+name];if(!h)return null;let rt=ENVC[name];if(!rt){const pm=new T.PMREMGenerator(renderer);rt=ENVC[name]=pm.fromEquirectangular(h);pm.dispose()}scene.environment=rt.texture;if(o.bg)scene.background=rt.texture;envInt(o.int==null?1:o.int);return rt.texture}
function envInt(v){ENV.i=v;scene.traverse(m=>{const ms=m.material;if(!ms)return;(Array.isArray(ms)?ms:[ms]).forEach(x=>{if(x.isMeshStandardMaterial)x.envMapIntensity=v*(x.userData.envK==null?1:x.userData.envK)})})}
/* glTF props: prop('barrel',{h:.9}) → Group sitting on y=0, centred; null when not loaded so callers keep their procedural fallback */
const PROPC={};
function prop(key,o){o=o||{};const g0=ARTX.got['glb:'+key];if(!g0)return null;let b=PROPC[key];
  if(!b){const s=g0.scene;s.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(s);s.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;const ms=Array.isArray(m.material)?m.material:[m.material];ms.forEach(x=>{if(x&&x.map)x.map.anisotropy=4})}});b=PROPC[key]={s,bb,size:bb.getSize(new V3())}}
  const cl=b.s.clone(true),sz=b.size;let k=o.s||1;if(o.h)k=o.h/sz.y;else if(o.w)k=o.w/Math.max(sz.x,sz.z);else if(o.l)k=o.l/Math.max(sz.x,sz.y,sz.z);
  const g=new T.Group();cl.scale.setScalar(k);cl.position.set(-(b.bb.min.x+b.bb.max.x)/2*k,o.center?-(b.bb.min.y+b.bb.max.y)/2*k:-b.bb.min.y*k,-(b.bb.min.z+b.bb.max.z)/2*k);g.add(cl);
  if(o.tint!=null||o.shadow===false||o.emissive!=null)cl.traverse(m=>{if(!m.isMesh)return;if(o.shadow===false)m.castShadow=false;if(o.tint!=null||o.emissive!=null){m.material=m.material.clone();if(o.tint!=null)m.material.color.multiply(lin(o.tint));if(o.emissive!=null){m.material.emissive=lin(o.emissive);m.material.emissiveIntensity=o.ei||1}}});
  g.userData.size=sz.clone().multiplyScalar(k);return g}
const hasArt=k=>!!ARTX.got[k];
/* hand-held prop: longest axis turned onto +Z, grip point (fraction along the length) at the origin; flip reverses the direction */
function propAlong(key,len,grip,flip){const p=prop(key,{l:len,center:true});if(!p)return null;const s=p.userData.size,inner=p.children[0];const g=new T.Group(),piv=new T.Group();g.add(piv);piv.add(p);
  if(s.x>=s.y&&s.x>=s.z)piv.rotation.y=flip?PI/2:-PI/2;else if(s.y>=s.x&&s.y>=s.z)piv.rotation.x=flip?-PI/2:PI/2;else if(flip)piv.rotation.y=PI;
  piv.position.z=(.5-(grip||0))*len;p.traverse(m=>{if(m.isMesh)m.castShadow=true});return g}
/* paint a loaded photo texture into a 2D canvas as a repeating layer (px = canvas pixels per repeat); false when not loaded */
function photoFill(g,key,w,h,px,alpha,op){const a=ARTX.got['tex:'+key];if(!a||!a.c||!a.c.image)return false;const im=a.c.image,s=px/im.width;g.save();g.globalAlpha=alpha==null?1:alpha;if(op)g.globalCompositeOperation=op;g.scale(s,s);g.fillStyle=g.createPattern(im,'repeat');g.fillRect(0,0,w/s,h/s);g.restore();return true}
/* PBR photo material with its own tiling (cloned textures), for meshes whose UVs run 0..1 over the whole surface */
function pbrRep(key,col,rx,ry,o){o=o||{};const k='pbrr|'+key+'|'+col+'|'+rx+'|'+ry+'|'+JSON.stringify(o);if(MC[k])return MC[k];const cl=s=>{const t0=realTex(key,s);if(!t0)return null;const t=t0.clone();t.needsUpdate=true;t.repeat.set(rx,ry);return t};const c=cl('c');if(!c)return null;
  const m=new T.MeshStandardMaterial(Object.assign({map:c,normalMap:cl('n'),roughnessMap:cl('r'),color:lin(col==null?0xffffff:col),roughness:1},o));m.envMapIntensity=ENV.i;return MC[k]=m}
/* full PBR material from a photo set (colour + normal + roughness), or null */
function pbr(key,col,o){o=o||{};const c=realTex(key,'c');if(!c)return null;const k='pbr|'+key+'|'+col+'|'+JSON.stringify(o);if(MC[k])return MC[k];const n=realTex(key,'n'),r=realTex(key,'r');
  const m=new T.MeshStandardMaterial(Object.assign({map:c,normalMap:n||null,roughnessMap:r||null,color:lin(col==null?0xffffff:col),roughness:r?1:.8},Object.fromEntries(Object.entries(o).filter(([q])=>q!=='bump'))));if(o.bump&&n)m.normalScale.set(o.bump,o.bump);m.envMapIntensity=ENV.i;return MC[k]=m}
/* a prop as baked {geo,m} parts, for InstancedMesh street furniture */
function propParts(key,o){const g=prop(key,o);if(!g)return null;g.updateMatrixWorld(true);const out=[];g.traverse(m=>{if(m.isMesh){const geo=m.geometry.clone();geo.applyMatrix4(m.matrixWorld);out.push({geo,m:m.material})}});return out}
/* foliage: alpha-cut leaf-cluster cards (CC0 ambientCG scans) scattered through a canopy volume */
const FOL={};
function leafMat(k,tint){const key=k+'|'+(tint==null?'':tint);if(FOL[key])return FOL[key];const t=ARTX.got['img:fol_'+k+'.png'];if(!t)return null;t.encoding=T.sRGBEncoding;t.anisotropy=4;
  const m=new T.MeshStandardMaterial({map:t,alphaTest:.42,side:T.DoubleSide,roughness:.75,color:tint!=null?lin(tint):new T.Color(1,1,1)});m.userData.depth=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:t,alphaTest:.42,side:T.DoubleSide});return FOL[key]=m}
function crownGeo(r,h,n,y0,seed){const pos=[],nor=[],uv=[],idx=[];let s=(Math.abs(seed|0)%99991+7)*9301+49297;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};const e=new T.Euler(),q=new T.Quaternion(),ax=new V3(),ay=new V3(),c=new V3(),nn=new V3();
  for(let i=0;i<n;i++){const u=R()*2*PI,v=Math.acos(2*R()-1),rr=Math.cbrt(R())*.7+.3;c.set(Math.sin(v)*Math.cos(u)*r*rr,y0+h/2+Math.cos(v)*h/2*rr,Math.sin(v)*Math.sin(u)*r*rr);const sz=r*(.5+R()*.35);
    e.set((R()-.5)*1.6,R()*PI*2,(R()-.5)*1.6);q.setFromEuler(e);ax.set(sz,0,0).applyQuaternion(q);ay.set(0,sz,0).applyQuaternion(q);nn.set(c.x,(c.y-y0-h/2)*.6+h*.25,c.z).normalize();const b=pos.length/3;
    for(const[sx,sy,u2,v2]of[[-1,-1,0,0],[1,-1,1,0],[1,1,1,1],[-1,1,0,1]]){pos.push(c.x+ax.x*sx+ay.x*sy,c.y+ax.y*sx+ay.y*sy,c.z+ax.z*sx+ay.z*sy);nor.push(nn.x,nn.y,nn.z);uv.push(u2,v2)}idx.push(b,b+1,b+2,b,b+2,b+3)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();return g}
/* conifer: drooping needle-cluster cards in tiers that narrow toward the tip */
function pineCrownGeo(h,r,n,y0,seed){const pos=[],nor=[],uv=[],idx=[];let s=(Math.abs(seed|0)%99991+3)*9301+49297;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};const q=new T.Quaternion(),e=new T.Euler(),ax=new V3(),ay=new V3(),c=new V3(),nn=new V3();
  for(let i=0;i<n;i++){const t=Math.pow(R(),.8),a=R()*PI*2,rad=r*Math.pow(1-t,.95)*(.35+R()*.65);c.set(Math.cos(a)*rad,y0+t*h,Math.sin(a)*rad);const sz=(r*(1-t)*.75+.5)*(.8+R()*.3);
    e.set(.5+R()*.5,-a+PI/2,0,'YXZ');q.setFromEuler(e);ax.set(sz,0,0).applyQuaternion(q);ay.set(0,sz,0).applyQuaternion(q);nn.set(Math.cos(a),.6,Math.sin(a)).normalize();const b=pos.length/3;
    for(const[sx,sy,u2,v2]of[[-1,-1,0,0],[1,-1,1,0],[1,1,1,1],[-1,1,0,1]]){pos.push(c.x+ax.x*sx+ay.x*sy,c.y+ax.y*sx+ay.y*sy,c.z+ax.z*sx+ay.z*sy);nor.push(nn.x,nn.y,nn.z);uv.push(u2,v2)}idx.push(b,b+1,b+2,b,b+2,b+3)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();return g}
/* terrain splatting: blends up to four photo textures by a per-vertex 'splat' weight attribute (world-tiled), tinted by vertex colour */
function splatMat(keys,reps,o){o=o||{};const tx4=keys.map(k=>realTex(k,'c'));if(tx4.some(t=>!t))return null;const m=new T.MeshStandardMaterial({vertexColors:true,roughness:o.roughness||.95,map:tx4[0]});
  m.onBeforeCompile=sh=>{tx4.forEach((t,i)=>sh.uniforms['tS'+i]={value:t});sh.uniforms.tR={value:new T.Vector4(...reps)};
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 splat;varying vec4 vSplat;').replace('#include <begin_vertex>','#include <begin_vertex>\nvSplat=splat;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D tS0,tS1,tS2,tS3;uniform vec4 tR;varying vec4 vSplat;')
      .replace('#include <map_fragment>','vec4 w4=vSplat/max(.001,vSplat.x+vSplat.y+vSplat.z+vSplat.w);vec4 texelColor=texture2D(tS0,vUv*tR.x)*w4.x+texture2D(tS1,vUv*tR.y)*w4.y+texture2D(tS2,vUv*tR.z)*w4.z+texture2D(tS3,vUv*tR.w)*w4.w;texelColor=mapTexelToLinear(texelColor);diffuseColor*=texelColor;')};
  m.customProgramCacheKey=()=>'splat'+keys.join();return m}
/* a whole tree as one Group: bark trunk + branches + leaf-card crown (falls back to null without art) */
function realTree(o){o=o||{};const lm=leafMat(o.leaf||'broad',o.tint);if(!lm)return null;const g=new T.Group();const h=o.h||6,r=o.r||h*.38,bm=mat('rbark','#ffffff',{map:'bark'});
  const tg=new T.CylinderGeometry(h*.022,h*.04,h*.62,7);tg.translate(0,h*.31,0);const tm=new T.Mesh(tg,bm);tm.castShadow=true;g.add(tm);
  for(let i=0;i<4;i++){const bg=new T.CylinderGeometry(h*.008,h*.018,h*.3,5);bg.translate(0,h*.15,0);const b=new T.Mesh(bg,bm);b.position.y=h*(.42+i*.06);b.rotation.set(.8,i*1.7,0,'YXZ');b.castShadow=true;g.add(b)}
  const cg=crownGeo(r,h*.6,o.n||36,h*.38,o.seed);const cm=new T.Mesh(cg,lm);cm.castShadow=true;cm.receiveShadow=true;cm.customDepthMaterial=lm.userData.depth;g.add(cm);return g}
/* ---------- merged static geometry: many boxes -> one mesh per material ---------- */
function Merger(){const G=new Map();return{box(x0,y0,z0,x1,y1,z1,m,uvs,rotY){let a=G.get(m);if(!a)G.set(m,a={p:[],n:[],u:[]});const s=uvs||1;const cx=(x0+x1)/2,cz=(z0+z1)/2,hx=(x1-x0)/2,hz=(z1-z0)/2,cr=Math.cos(rotY||0),sr=Math.sin(rotY||0);
      const R=(x,z)=>[cx+(x-cx)*cr-(z-cz)*sr,cz+(x-cx)*sr+(z-cz)*cr];
      const F=[[[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0],z1-z0,y1-y0],[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0],z1-z0,y1-y0],[[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],[0,1,0],x1-x0,z1-z0],[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,-1,0],x1-x0,z1-z0],[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1],x1-x0,y1-y0],[[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1],x1-x0,y1-y0]];
      for(const[a1,b1,c1,d1,nn,uw,vh]of F){const q=[a1,b1,c1,d1].map(v=>{const[rx,rz]=R(v[0],v[2]);return[rx,v[1],rz]});const nr=[nn[0]*cr-nn[2]*sr,nn[1],nn[0]*sr+nn[2]*cr];const uu=uw/s,vv=vh/s;const U=[[0,0],[uu,0],[uu,vv],[0,vv]];for(const i of[0,1,2,0,2,3]){a.p.push(...q[i]);a.n.push(...nr);a.u.push(...U[i])}}},
    tri(verts,m,nrm){let a=G.get(m);if(!a)G.set(m,a={p:[],n:[],u:[]});for(const v of verts){a.p.push(v[0],v[1],v[2]);a.n.push(...nrm);a.u.push(v[3]||0,v[4]||0)}},
    build(parent,shadow){const out=[];G.forEach((a,m)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(a.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(a.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(a.u,2));g.computeBoundingSphere();const mesh=new T.Mesh(g,m);mesh.castShadow=shadow!==false;mesh.receiveShadow=true;parent.add(mesh);out.push(mesh)});G.clear();return out}}}
/* ---------- collision world (axis-aligned boxes + height ground) ---------- */
const W={boxes:[],hash:new Map(),cs:8,groundFn:null};
function wkey(ix,iz){return ix*73856093^iz*19349663}
function addBox(x0,y0,z0,x1,y1,z1,tag){const b={x0:Math.min(x0,x1),x1:Math.max(x0,x1),y0:Math.min(y0,y1),y1:Math.max(y0,y1),z0:Math.min(z0,z1),z1:Math.max(z0,z1),tag:tag||null};W.boxes.push(b);const cs=W.cs;for(let ix=Math.floor(b.x0/cs);ix<=Math.floor(b.x1/cs);ix++)for(let iz=Math.floor(b.z0/cs);iz<=Math.floor(b.z1/cs);iz++){const k=wkey(ix,iz);let a=W.hash.get(k);if(!a)W.hash.set(k,a=[]);a.push(b)}return b}
function removeBox(b){const i=W.boxes.indexOf(b);if(i>=0)W.boxes.splice(i,1);W.hash.forEach(a=>{const j=a.indexOf(b);if(j>=0)a.splice(j,1)})}
function clearWorld(){W.boxes.length=0;W.hash.clear()}
let qs=0;function near(x,z,r){qs++;const cs=W.cs,out=[];for(let ix=Math.floor((x-r)/cs);ix<=Math.floor((x+r)/cs);ix++)for(let iz=Math.floor((z-r)/cs);iz<=Math.floor((z+r)/cs);iz++){const a=W.hash.get(wkey(ix,iz));if(a)for(const b of a){if(b._q===qs)continue;b._q=qs;out.push(b)}}return out}
function groundAt(x,z,yTop,r){let g=W.groundFn?W.groundFn(x,z):0;for(const b of near(x,z,(r||.3)+.1)){if(x>b.x0-(r||0)&&x<b.x1+(r||0)&&z>b.z0-(r||0)&&z<b.z1+(r||0)&&b.y1<=yTop+.45&&b.y1>g)g=b.y1}return g}
function collide(p,r,y0,h){for(const b of near(p.x,p.z,r+.1)){if(b.y1<=y0+.45||b.y0>=y0+h)continue;const cx=clamp(p.x,b.x0,b.x1),cz=clamp(p.z,b.z0,b.z1),dx=p.x-cx,dz=p.z-cz,d2=dx*dx+dz*dz;if(d2<r*r){if(d2>1e-8){const d=Math.sqrt(d2);p.x=cx+dx/d*r;p.z=cz+dz/d*r}else{const ex=Math.min(p.x-b.x0,b.x1-p.x),ez=Math.min(p.z-b.z0,b.z1-p.z);if(ex<ez)p.x=p.x-b.x0<b.x1-p.x?b.x0-r:b.x1+r;else p.z=p.z-b.z0<b.z1-p.z?b.z0-r:b.z1+r}}}}
function rayBoxes(o,d,maxD,skip){let best=maxD,hit=null,nrm=null;const L=maxD,steps=Math.ceil(L/W.cs)+1;const seen=new Set();for(let s=0;s<=steps;s++){const t=s*W.cs;const px=o.x+d.x*t,pz=o.z+d.z*t;for(const b of near(px,pz,W.cs)){if(seen.has(b)||(skip&&skip(b)))continue;seen.add(b);let t0=0,t1=best,ax=-1,sg=1;for(let a=0;a<3;a++){const k=a===0?'x':a===1?'y':'z',lo=b[k+'0'],hi=b[k+'1'],oo=o[k],dd=d[k];if(Math.abs(dd)<1e-9){if(oo<lo||oo>hi){t0=2e9;break}continue}let ta=(lo-oo)/dd,tb=(hi-oo)/dd,s2=-1;if(ta>tb){const tt=ta;ta=tb;tb=tt;s2=1}if(ta>t0){t0=ta;ax=a;sg=s2}if(tb<t1)t1=tb;if(t0>t1){t0=2e9;break}}if(t0<best&&t0>=0){best=t0;hit=b;nrm=ax===0?new V3(sg,0,0):ax===1?new V3(0,sg,0):new V3(0,0,sg)}}if(hit&&best<t)break}
  if(W.groundFn&&d.y<0){for(let t=0;t<Math.min(best,maxD);t+=1.5){const y=o.y+d.y*t,g=W.groundFn(o.x+d.x*t,o.z+d.z*t);if(y<g){best=t;hit={ground:1};nrm=new V3(0,1,0);break}}}
  else if(d.y<0){const t=-o.y/d.y;if(t>0&&t<best){best=t;hit={ground:1};nrm=new V3(0,1,0)}}
  return hit?{t:best,box:hit,n:nrm,p:o.clone().addScaledVector(d,best)}:null}
function los(a,b){const d=b.clone().sub(a);const L=d.length();d.divideScalar(L);const h=rayBoxes(a,d,L,bx=>bx.tag==='soft');return !h||h.t>=L-.05}
/* ---------- nav grid + A* ---------- */
const NAV={w:0,h:0,x0:0,z0:0,cs:1,g:null};
function buildNav(x0,z0,x1,z1,cs,pad,soft){NAV.cs=cs;NAV.x0=x0;NAV.z0=z0;NAV.w=Math.ceil((x1-x0)/cs);NAV.h=Math.ceil((z1-z0)/cs);NAV.g=new Uint8Array(NAV.w*NAV.h);const pr=pad||.4;for(const b of W.boxes){if(b.y0>1.7||b.y1<.5||(b.tag==='soft'&&!soft))continue;const ix0=Math.max(0,Math.floor((b.x0-pr-x0)/cs)),ix1=Math.min(NAV.w-1,Math.ceil((b.x1+pr-x0)/cs)-1),iz0=Math.max(0,Math.floor((b.z0-pr-z0)/cs)),iz1=Math.min(NAV.h-1,Math.ceil((b.z1+pr-z0)/cs)-1);for(let z=iz0;z<=iz1;z++)for(let x=ix0;x<=ix1;x++)NAV.g[z*NAV.w+x]=1}}
function navFree(x,z){const ix=Math.floor((x-NAV.x0)/NAV.cs),iz=Math.floor((z-NAV.z0)/NAV.cs);if(ix<0||iz<0||ix>=NAV.w||iz>=NAV.h)return false;return !NAV.g[iz*NAV.w+ix]}
function astar(ax,az,bx,bz,maxN){if(!NAV.g)return null;const W2=NAV.w,H2=NAV.h,cs=NAV.cs,N=W2*H2;const toI=(x,z)=>{const ix=clamp(Math.floor((x-NAV.x0)/cs),0,W2-1),iz=clamp(Math.floor((z-NAV.z0)/cs),0,H2-1);return iz*W2+ix};
  const nearFree=c0=>{if(!NAV.g[c0])return c0;const cx=c0%W2,cz=Math.floor(c0/W2);for(let r=1;r<8;r++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;const ix=cx+dx,iz=cz+dz;if(ix<0||iz<0||ix>=W2||iz>=H2)continue;const i=iz*W2+ix;if(!NAV.g[i])return i}return -1};
  const s=nearFree(toI(ax,az)),e=nearFree(toI(bx,bz));if(s<0||e<0)return null;if(!NAV.gs||NAV.gs.length!==N){NAV.gs=new Float32Array(N);NAV.came=new Int32Array(N);NAV.stamp=new Uint32Array(N);NAV.closed=new Uint32Array(N);NAV.st=0}const gS=NAV.gs,came=NAV.came,stamp=NAV.stamp,closed=NAV.closed;const st=++NAV.st;
  const ex=e%W2,ez=Math.floor(e/W2);const hp=[],hf=[];const push=(i,f)=>{hp.push(i);hf.push(f);let k=hp.length-1;while(k>0){const p=(k-1)>>1;if(hf[p]<=hf[k])break;[hp[p],hp[k]]=[hp[k],hp[p]];[hf[p],hf[k]]=[hf[k],hf[p]];k=p}};
  const pop=()=>{const top=hp[0];const li=hp.pop(),lf=hf.pop();if(hp.length){hp[0]=li;hf[0]=lf;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<hp.length&&hf[l]<hf[m])m=l;if(r<hp.length&&hf[r]<hf[m])m=r;if(m===k)break;[hp[m],hp[k]]=[hp[k],hp[m]];[hf[m],hf[k]]=[hf[k],hf[m]];k=m}}return top};
  stamp[s]=st;gS[s]=0;came[s]=-1;push(s,0);let n=0,found=s===e;const lim=Math.max(maxN||0,N+10);
  while(hp.length&&n++<lim&&!found){const cur=pop();if(closed[cur]===st)continue;closed[cur]=st;if(cur===e){found=true;break}const cx=cur%W2,cz=Math.floor(cur/W2),g0=gS[cur];for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dz)continue;const nx=cx+dx,nz=cz+dz;if(nx<0||nz<0||nx>=W2||nz>=H2)continue;const ni=nz*W2+nx;if(NAV.g[ni])continue;if(dx&&dz&&(NAV.g[cz*W2+nx]||NAV.g[nz*W2+cx]))continue;const ng=g0+(dx&&dz?1.414:1);if(stamp[ni]!==st||ng<gS[ni]){stamp[ni]=st;gS[ni]=ng;came[ni]=cur;push(ni,ng+Math.hypot(nx-ex,nz-ez))}}}
  if(!found&&!(stamp[e]===st))return null;const path=[];let cur=e;let guard=0;while(cur!==s&&cur>=0&&guard++<N){path.push(new V3(NAV.x0+(cur%W2+.5)*cs,0,NAV.z0+(Math.floor(cur/W2)+.5)*cs));cur=came[cur]}path.reverse();
  // string-pull: drop points that are in straight free line
  const out=[];let a=0;const free=(p,q)=>{const d=Math.hypot(q.x-p.x,q.z-p.z),n2=Math.ceil(d/(cs*.5));for(let k=1;k<n2;k++){const x=p.x+(q.x-p.x)*k/n2,z=p.z+(q.z-p.z)*k/n2;if(NAV.g[toI(x,z)])return false}return true};let last=new V3(ax,0,az);for(let k=0;k<path.length;k++){if(k===path.length-1||!free(last,path[k+1])){out.push(path[k]);last=path[k]}}return out}
/* ---------- characters with procedural animation ---------- */
const GEO={};const geo=(k,f)=>GEO[k]||(GEO[k]=f());
function limb(len,r0,r1){return geo('l'+len+'_'+r0+'_'+r1,()=>{const g=new T.CylinderGeometry(r0,r1,len,10);g.translate(0,-len/2,0);return g})}
function humanP(o){o=o||{};const g=new T.Group();const skin=mat('skin',o.skin||0xd8a888,{roughness:.7}),shirt=mat('sh',o.shirt||0x3a5a8a,{roughness:.85}),pants=mat('pa',o.pants||0x2a2a34,{roughness:.9}),shoe=mat('so',o.shoes||0x1a1a1a,{roughness:.6}),hair=mat('ha',o.hair||0x2a1a10,{roughness:.9});const S=o.scale||1,B=o.bulk||1;
  const P={};const M=(geo2,m,x,y,z,par)=>{const mm=new T.Mesh(geo2,m);mm.position.set(x,y,z);mm.castShadow=true;par.add(mm);return mm};
  const hips=new T.Group();hips.position.y=.98;g.add(hips);P.hips=hips;M(geo('pel'+B,()=>new T.BoxGeometry(.36*B,.2,.22)),pants,0,0,0,hips);
  const torso=new T.Group();torso.position.y=.08;hips.add(torso);P.torso=torso;
  const chest=M(geo('ch'+B,()=>{const g2=new T.CylinderGeometry(.21*B,.17*B,.52,12);g2.scale(1,1,.62);return g2}),shirt,0,.3,0,torso);
  if(o.jacket){M(geo('jk'+B,()=>{const g2=new T.CylinderGeometry(.225*B,.19*B,.5,12,1,true);g2.scale(1,1,.66);return g2}),mat('jk',o.jacket,{roughness:.7,side:T.DoubleSide}),0,.3,0,torso)}
  if(o.vest){M(geo('vs'+B,()=>{const g2=new T.CylinderGeometry(.23*B,.2*B,.36,12);g2.scale(1,1,.68);return g2}),mat('vs',o.vest,{roughness:.6}),0,.33,0,torso)}
  const neck=new T.Group();neck.position.y=.58;torso.add(neck);P.neck=neck;M(geo('nk',()=>new T.CylinderGeometry(.055,.06,.1,8)),skin,0,.04,0,neck);
  const head=new T.Group();head.position.y=.1;neck.add(head);P.head=head;const hd=M(geo('hd',()=>{const g2=new T.SphereGeometry(.115,16,12);g2.scale(1,1.14,1.06);return g2}),skin,0,.1,0,head);
  if(o.hairStyle!=='bald'){const hr=M(geo('hr'+(o.hairStyle||'s'),()=>{const g2=new T.SphereGeometry(.12,14,10,0,PI*2,0,o.hairStyle==='long'?1.9:1.25);g2.scale(1.02,1.12,1.1);return g2}),hair,0,.115,-.008,head)}
  if(o.hat){const hm=mat('hat',o.hat,{roughness:.7});M(geo('ht',()=>new T.CylinderGeometry(.13,.13,.08,14)),hm,0,.22,0,head);M(geo('hb',()=>new T.CylinderGeometry(.19,.19,.015,16)),hm,0,.185,0,head)}
  if(o.cap){const cm=mat('cap',o.cap,{roughness:.7});M(geo('cp',()=>new T.SphereGeometry(.125,14,8,0,PI*2,0,1.35)),cm,0,.13,0,head);const vz=M(geo('cv',()=>new T.BoxGeometry(.16,.015,.12)),cm,0,.16,.12,head)}
  if(o.mask){M(geo('mk',()=>{const g2=new T.SphereGeometry(.118,14,10,0,PI*2,.9,1.5);g2.scale(1.02,1.14,1.08);return g2}),mat('mk',o.mask,{roughness:.8}),0,.1,0,head)}
  const eyeM=mat('eye',0x111111,{roughness:.3});M(geo('ey',()=>new T.SphereGeometry(.014,6,5)),eyeM,-.042,.13,.108,head);M(geo('ey',()=>new T.SphereGeometry(.014,6,5)),eyeM,.042,.13,.108,head);M(geo('ns',()=>new T.BoxGeometry(.025,.045,.03)),skin,0,.09,.12,head);
  const arms=[];for(const s of[-1,1]){const sh=new T.Group();sh.position.set(s*.26*B,.5,0);torso.add(sh);const up=M(limb(.29,.055*B,.047*B),o.long||o.jacket?(o.jacket?mat('jk',o.jacket,{roughness:.7,side:T.DoubleSide}):shirt):shirt,0,0,0,sh);const el=new T.Group();el.position.y=-.29;sh.add(el);M(limb(.26,.045*B,.038*B),o.long||o.jacket?(o.jacket?mat('jk',o.jacket,{roughness:.7,side:T.DoubleSide}):shirt):skin,0,0,0,el);const hand=new T.Group();hand.position.y=-.27;el.add(hand);M(geo('hn',()=>{const g2=new T.SphereGeometry(.045,10,8);g2.scale(.9,1.2,.7);return g2}),o.gloves?mat('gl',o.gloves):skin,0,-.03,0,hand);arms.push({sh,el,hand})}
  const legs=[];for(const s of[-1,1]){const hp=new T.Group();hp.position.set(s*.1*B,-.06,0);hips.add(hp);M(limb(.44,.075*B,.058*B),pants,0,0,0,hp);const kn=new T.Group();kn.position.y=-.44;hp.add(kn);M(limb(.42,.056*B,.045*B),pants,0,0,0,kn);const ft=M(geo('ft',()=>new T.BoxGeometry(.1,.07,.24)),shoe,0,-.44,.05,kn);legs.push({hp,kn,ft})}
  P.arms=arms;P.legs=legs;g.scale.setScalar(S);
  const ch={g,P,ph:Math.random()*6,state:'idle',cur:{},tgt:{},held:null,aimPitch:0,blend:0,look:0,speed:0,dead:false,deadT:0};return ch}
/* ---------- rigged characters: the procedural rig above stays as an invisible driver; a skinned glTF body (Mixamo skeleton)
   follows it bone-for-bone, so every pose/act/ragdoll the games already use animates a real character. ---------- */
const CHR={soldier:'Soldier',xbot:'Xbot',rpm:'readyplayer.me',michelle:'Michelle'};
const BMAP=[['hips','Hips'],['torso','Spine'],['neck','Neck'],['head','Head'],['sh1','LeftArm'],['el1','LeftForeArm'],['hd1','LeftHand'],['sh0','RightArm'],['el0','RightForeArm'],['hd0','RightHand'],['hp1','LeftUpLeg'],['kn1','LeftLeg'],['hp0','RightUpLeg'],['kn0','RightLeg']];
const SKM={};const skinMat=(m,key,f)=>{const k=m.uuid+'|'+key;if(SKM[k])return SKM[k];const x=m.clone();f(x);return SKM[k]=x};
const BASE_SKIN=new T.Color(0xd8a888).convertSRGBToLinear();
/* the stock avatar is bald: paint a close-cropped haircut onto the scalp in the head shader (hairline lower at the nape than the brow) */
function paintHair(x,m,hc){return skinMat(x,'hair'+hc,y=>{const gm=m.geometry;if(!gm.boundingBox)gm.computeBoundingBox();const gb=gm.boundingBox,H=lin(hc);
  y.onBeforeCompile=sh=>{sh.uniforms.uHT={value:new T.Vector3(gb.max.y,(gb.min.z+gb.max.z)/2,(gb.max.z-gb.min.z)/2)};sh.uniforms.uHC={value:H};
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vHp;').replace('#include <begin_vertex>','#include <begin_vertex>\nvHp=position;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vHp;uniform vec3 uHT;uniform vec3 uHC;').replace('#include <color_fragment>','#include <color_fragment>\nfloat zf=clamp((vHp.z-uHT.y)/uHT.z,-1.,1.);float hl=uHT.x-mix(.165,.058,smoothstep(-.6,.9,zf));float hm=smoothstep(hl-.006,hl+.008,vHp.y);float hn=fract(sin(dot(floor(vHp.xz*1400.+vHp.y*300.),vec2(12.9898,78.233)))*43758.5);diffuseColor.rgb=mix(diffuseColor.rgb,uHC*(.65+.6*hn),hm);')};
  y.customProgramCacheKey=()=>'rpmhair'})}
function pickModel(o){const want=o.model||(o.robot?'xbot':o.female?'michelle':o.armor?'soldier':'rpm');const order=[want,'rpm','michelle','soldier','xbot'];for(const k of order)if(ARTX.got['chr:'+CHR[k]])return k;return null}
function human(o){o=o||{};const ch=humanP(o);if(o.real===false||opts.real===false)return ch;const key=pickModel(o);if(!key)return ch;
  try{rigReal(ch,o,key)}catch(e){console.warn('rig',e);ch.g.traverse(m=>{if(m.isMesh)m.visible=true})}return ch}
function rigReal(ch,o,key){const gl=ARTX.got['chr:'+CHR[key]],P=ch.P,g=ch.g;const root=T.SkeletonUtils.clone(gl.scene);const bones={};root.traverse(b=>{if(b.isBone)bones[b.name.replace(/^mixamorig:?/,'')]=b});if(!bones.Hips||!bones.LeftArm||!bones.RightForeArm)throw new Error('no skeleton');
  const drv={hips:P.hips,torso:P.torso,neck:P.neck,head:P.head,sh0:P.arms[0].sh,el0:P.arms[0].el,hd0:P.arms[0].hand,sh1:P.arms[1].sh,el1:P.arms[1].el,hd1:P.arms[1].hand,hp0:P.legs[0].hp,kn0:P.legs[0].kn,hp1:P.legs[1].hp,kn1:P.legs[1].kn};
  g.traverse(m=>{if(m.isMesh)m.visible=false});
  const sc=g.scale.clone(),rq=g.quaternion.clone(),rp=g.position.clone();g.scale.set(1,1,1);g.quaternion.identity();g.position.set(0,0,0);g.add(root);g.updateMatrixWorld(true);
  const v=new V3(),v2=new V3(),q=new T.Quaternion(),q2=new T.Quaternion(),pq=new T.Quaternion();
  bones.Hips.getWorldPosition(v);root.scale.multiplyScalar(.98/v.y*(o.tall||1));g.updateMatrixWorld(true);
  // T-pose → arms hanging at the sides, matching the driver's rest pose
  for(const[a,f,s]of[['LeftArm','LeftForeArm',1],['RightArm','RightForeArm',-1]]){const A=bones[a];A.getWorldPosition(v);bones[f].getWorldPosition(v2);q.setFromUnitVectors(v2.sub(v).normalize(),new V3(s*.12,-1,0).normalize());A.getWorldQuaternion(q2).premultiply(q);A.parent.getWorldQuaternion(pq);A.quaternion.copy(pq.invert().multiply(q2));A.updateMatrixWorld(true)}
  const map=[];for(const[dk,bn]of BMAP){const B=bones[bn],D=drv[dk];if(!B||!D)continue;D.getWorldQuaternion(q);B.getWorldQuaternion(q2);map.push({B,D,off:q.clone().invert().multiply(q2)})}
  bones.Hips.getWorldPosition(v);const offP=v.clone().sub(P.hips.position);
  // sockets: held items / hats attach to the real hand + head bones with the driver's orientation
  const sock=(B,D)=>{const s=new T.Group();B.add(s);B.getWorldQuaternion(q);D.getWorldQuaternion(q2);s.quaternion.copy(q.invert().multiply(q2));B.getWorldScale(v);s.scale.set(1/v.x,1/v.y,1/v.z);return s};
  P.arms[0].hand=sock(bones.RightHand,drv.hd0);P.arms[1].hand=sock(bones.LeftHand,drv.hd1);const hs=sock(bones.Head,drv.head);hs.position.y=0;P.head=hs;
  // outfit colours
  const L=h=>lin(h),skin=o.skin!=null?L(o.skin):null;const skinK=skin?new T.Color(Math.min(1.3,skin.r/BASE_SKIN.r),Math.min(1.3,skin.g/BASE_SKIN.g),Math.min(1.3,skin.b/BASE_SKIN.b)):null;
  const top=o.jacket||o.shirt,bot=o.pants,shoe=o.shoes;let sm=null;
  root.traverse(m=>{if(!m.isMesh)return;m.castShadow=true;m.receiveShadow=true;const n=m.name;let x=m.material;
    if(key==='rpm'){if(/Outfit_Top/.test(n)&&top!=null)x=skinMat(x,'c'+top,y=>{y.color=L(top);y.map=null});else if(/Outfit_Bottom/.test(n)&&bot!=null)x=skinMat(x,'c'+bot,y=>{y.color=L(bot);y.map=null});else if(/Footwear/.test(n)&&shoe!=null)x=skinMat(x,'c'+shoe,y=>{y.color=L(shoe);y.map=null});
      else if(/Beard/.test(n))m.visible=!!o.beard;else if(/Headwear/.test(n)){m.visible=!!(o.hat||o.cowboy);if(o.hat)x=skinMat(x,'h'+o.hat,y=>{y.color=L(o.hat);y.map=null})}else if(/Body|Head/.test(n)){if(skinK)x=skinMat(x,'s'+skinK.getHex(),y=>y.color.copy(skinK));if(/Wolf3D_Head$/.test(n)&&o.hairStyle!=='bald'&&!o.hat&&!o.cowboy)x=paintHair(x,m,o.hair==null?0x1a1008:o.hair)}}
    else if(key==='xbot'){if(/Joints/i.test(x.name))x=skinMat(x,'j'+(bot||0x303038),y=>{y.color=L(bot||0x303038)});else x=skinMat(x,'s'+(top||0x8a8a90),y=>{y.color=L(top||0x8a8a90);y.roughness=.45;y.metalness=.2})}
    else if(top!=null&&!/visor/i.test(n))x=skinMat(x,'t'+top,y=>{y.color.lerp(L(top).multiplyScalar(2.2),o.tintK==null?.5:o.tintK)});
    if(x!==m.material){m.material=x}
    if(m.isSkinnedMesh&&(!sm||m.geometry.attributes.position.count>sm.geometry.attributes.position.count))sm=m});
  g.scale.copy(sc);g.quaternion.copy(rq);g.position.copy(rp);
  const tq=new T.Quaternion(),tp=new V3(),ts=new V3();let lastF=-1;
  const upd=()=>{const f=renderer.info.render.frame;if(f===lastF)return;lastF=f;
    v.copy(drv.hips.position).add(offP);g.localToWorld(v);bones.Hips.parent.worldToLocal(v);bones.Hips.position.copy(v);
    for(const e of map){e.D.matrixWorld.decompose(tp,tq,ts);tq.multiply(e.off);e.B.parent.matrixWorld.decompose(tp,pq,ts);e.B.quaternion.copy(pq.invert().multiply(tq));e.B.updateMatrixWorld(true)}};
  if(sm)sm.onBeforeRender=upd;ch.real=key;ch.skin=root;ch.bones=bones;ch.rigUpdate=()=>{lastF=-1;g.updateMatrixWorld(true);upd()};return ch}
/* pose set: angles for each joint; animation blends toward the target pose */
const JOINTS=['hx','hy','hz','tx','ty','tz','nx','ny','s0x','s0z','e0x','s1x','s1z','e1x','h0x','k0x','h1x','k1x','hipY','s0y','s1y','h0z','h1z'];
function pose(ch,st,dt,sp,extra){const t=ch.tgt,ph=ch.ph;JOINTS.forEach(k=>t[k]=0);t.hipY=0;extra=extra||{};
  const f=st==='run'?9.5:st==='sprint'?11.5:st==='walk'?6.2:st==='crouchwalk'?5:st==='swim'?3:0;ch.ph+=dt*f;
  const s=Math.sin(ch.ph),c2=Math.cos(ch.ph);
  if(st==='walk'||st==='run'||st==='sprint'||st==='crouchwalk'){const a=st==='walk'?.45:st==='crouchwalk'?.4:st==='run'?.8:1.05;t.h0x=-s*a;t.h1x=s*a;t.k0x=Math.max(0,-c2)*a*1.3+.08;t.k1x=Math.max(0,c2)*a*1.3+.08;t.s0x=s*a*.8;t.s1x=-s*a*.8;t.e0x=-.25-(st==='sprint'?.9:st==='run'?.6:.1);t.e1x=t.e0x;t.hipY=-Math.abs(c2)*.04*a;t.tx=st==='sprint'?.25:st==='run'?.12:.03;t.ty=s*.08*a;t.hy=-s*.06*a}
  else if(st==='idle'){const b=Math.sin(performance.now()/900+ch.ph);t.hipY=b*.004;t.tx=.02+b*.01;t.s0x=.05;t.s1x=.05;t.e0x=-.12;t.e1x=-.12;t.s0z=-.06;t.s1z=.06}
  if(st==='crouch'||st==='crouchwalk'){t.hipY-=.28;t.h0x-=.9;t.h1x-=.9;t.k0x+=1.5;t.k1x+=1.5;t.tx+=.35}
  if(st==='jump'){t.h0x=-.6;t.k0x=1.1;t.h1x=.2;t.k1x=.4;t.s0x=-.8;t.s1x=-.8;t.e0x=-.6;t.e1x=-.6}
  if(st==='fall'){t.s0x=-2.2;t.s1x=-2.2;t.s0z=-.4;t.s1z=.4;t.h0x=-.4;t.k0x=.6;t.h1x=.2;t.k1x=.8}
  if(st==='sit'||st==='drive'){t.hipY=-.45;t.h0x=-1.5;t.h1x=-1.5;t.k0x=1.45;t.k1x=1.45;t.s0x=-.9;t.s1x=-.9;t.e0x=-.4;t.e1x=-.4;t.s0z=.15;t.s1z=-.15}
  if(st==='swim'){t.tx=1.3;t.s0x=-3+s*1.2;t.s1x=-3-s*1.2;t.h0x=s*.3;t.h1x=-s*.3;t.hipY=-.4}
  if(st==='dead'){/* handled by body tilt */}
  if(st==='hands'){t.s0x=-2.8;t.s1x=-2.8;t.e0x=-.2;t.e1x=-.2}
  if(st==='cower'){t.hipY=-.35;t.h0x=-1.1;t.h1x=-1.1;t.k0x=1.9;t.k1x=1.9;t.tx=.6;t.s0x=-2.4;t.s1x=-2.4;t.e0x=-2;t.e1x=-2;t.nx=.4}
  // upper body overlays
  const up=extra.up;if(up==='aim1'){t.s1x=-1.45-ch.aimPitch;t.e1x=-.05;t.s1z=.1;t.s0x=-1.2-ch.aimPitch;t.e0x=-.7;t.s0z=-.45;t.ty=(t.ty||0)+.2}
  else if(up==='aim2'){t.s1x=-1.35-ch.aimPitch;t.e1x=-.35;t.s1z=.25;t.s0x=-1.45-ch.aimPitch;t.e0x=-.45;t.s0z=-.55;t.ty=(t.ty||0)+.45;t.ny=-.3}
  else if(up==='guard'){t.s0x=-1.1;t.e0x=-1.9;t.s1x=-.9;t.e1x=-2.1;t.s0z=-.2;t.s1z=.2;t.tx+=.08}
  else if(up==='block'){t.s0x=-1.6;t.e0x=-2.2;t.s1x=-1.6;t.e1x=-2.2;t.s0z=-.45;t.s1z=.45;t.tx+=.12;t.nx=.2}
  else if(up==='carry'){t.s1x=-.9;t.e1x=-.9;t.s0x=-.9;t.e0x=-.9}
  else if(up==='phone'){t.s1x=-.6;t.e1x=-2.3;t.s1z=.35}
  else if(up==='sword'){t.s1x=-.9;t.e1x=-1.1;t.s1z=.2;t.s0x=-.4;t.e0x=-.6}
  else if(up==='cast'){t.s1x=-1.6;t.e1x=-.3;t.s0x=-1.2;t.e0x=-.9;t.s0z=-.3}
  // one-shot actions: {act:'punchR',k:0..1}
  const act=extra.act,k=extra.k||0;if(act){const w=Math.sin(Math.min(1,k)*PI);
    if(act==='punchR'){t.s1x=-1.55*w-(1-w)*1.0;t.e1x=-2.2*(1-w)-.1;t.ty=-.5*w;t.s1z=.15}
    else if(act==='punchL'){t.s0x=-1.55*w-(1-w)*1.0;t.e0x=-2.2*(1-w)-.1;t.ty=.5*w;t.s0z=-.15}
    else if(act==='hook'){t.s1x=-1.5;t.s1z=.9*w+.2;t.e1x=-1.5;t.ty=-.9*w}
    else if(act==='upper'){t.s1x=-2.4*w-.6;t.e1x=-1.6;t.tx=-.2*w;t.hipY=(t.hipY||0)-.1*(1-w)}
    else if(act==='kick'){t.h1x=-1.7*w;t.k1x=.2+(1-w)*1.4;t.tx=-.35*w;t.s0x=.4*w;t.s1x=-.6*w}
    else if(act==='sweep'){t.hipY=-.45;t.h0x=-1.2;t.k0x=1.9;t.h1x=-.2;t.h1z=1.2*w;t.k1x=.1;t.ty=1.5*w;t.tx=.5}
    else if(act==='palm'){t.s0x=-1.5*w-.9*(1-w);t.s1x=-1.5*w-.9*(1-w);t.e0x=-.2;t.e1x=-.2;t.tx=.3*w}
    else if(act==='slashR'){t.s1x=-2.6+2.8*w;t.s1z=.4;t.e1x=-.4;t.ty=-.7*w+.35}
    else if(act==='slashL'){t.s1x=-1.3;t.s1z=1.4-2.2*w;t.e1x=-.5;t.ty=.8*w-.3}
    else if(act==='thrust'){t.s1x=-1.5;t.e1x=-1.8*(1-w);t.tx=.3*w;t.ty=-.3}
    else if(act==='overhead'){t.s1x=-3+2.4*w;t.s0x=-3+2.4*w;t.e1x=-.3;t.e0x=-.3;t.tx=.4*w}
    else if(act==='hit'){t.tx=-.35*w;t.nx=-.4*w;t.s0x=-.4*w;t.s1x=-.4*w;t.hipY=(t.hipY||0)-.05*w}
    else if(act==='throw'){t.s1x=-2.6+1.6*w;t.e1x=-1+w*.8;t.ty=-.6*w}
    else if(act==='takedown'){t.s0x=-1.6;t.s1x=-1.6;t.e0x=-1.4;t.e1x=-1.4;t.tx=.3;t.ty=.6*Math.sin(k*9)}
    else if(act==='castBig'){t.s1x=-3.1*w-.3;t.s0x=-3.1*w-.3;t.e1x=-.2;t.e0x=-.2;t.nx=-.3*w}
    else if(act==='chop'){t.s1x=-2.9+2.3*w;t.e1x=-.3;t.tx=.3*w;t.s0x=-.6}
    else if(act==='pickup'){t.tx=1.1*w;t.s1x=-1.2*w;t.s0x=-1.2*w;t.hipY=(t.hipY||0)-.25*w;t.h0x=-.6*w;t.h1x=-.6*w;t.k0x=.9*w;t.k1x=.9*w}}
  if(extra.lean)t.tz=extra.lean;
  const r=Math.min(1,dt*(extra.fast?22:12)),C=ch.cur;JOINTS.forEach(kk=>{C[kk]=C[kk]==null?t[kk]:C[kk]+(t[kk]-C[kk])*r});
  const P=ch.P;P.hips.position.y=.98+C.hipY;P.hips.rotation.set(C.hx,C.hy,C.hz);P.torso.rotation.set(C.tx,C.ty,C.tz);P.neck.rotation.set(C.nx,C.ny,0);
  P.arms[0].sh.rotation.set(C.s0x,C.s0y,C.s0z);P.arms[0].el.rotation.x=C.e0x;P.arms[1].sh.rotation.set(C.s1x,C.s1y,C.s1z);P.arms[1].el.rotation.x=C.e1x;
  P.legs[0].hp.rotation.set(C.h0x,0,C.h0z);P.legs[0].kn.rotation.x=C.k0x;P.legs[1].hp.rotation.set(C.h1x,0,C.h1z);P.legs[1].kn.rotation.x=C.k1x}
function holdItem(ch,mesh,side){const h=ch.P.arms[side==null?1:side].hand;if(ch.held&&ch.held.parent)ch.held.parent.remove(ch.held);ch.held=mesh;if(mesh){h.add(mesh)}}
function ragdoll(ch,dir,dt){/* simple death: fall along dir, limbs relax */ch.deadT=(ch.deadT||0)+dt;const k=Math.min(1,ch.deadT*2.4);ch.g.rotation.x=lerp(0,-PI/2*.97,k*k)*(ch.fallBack?-1:1);ch.g.position.y=Math.max(ch.baseY||0,ch.g.position.y);const P=ch.P;P.arms[0].sh.rotation.x+=( -1.4-P.arms[0].sh.rotation.x)*dt*3;P.arms[1].sh.rotation.x+=(-1.8-P.arms[1].sh.rotation.x)*dt*3;P.legs[0].kn.rotation.x+=(.3-P.legs[0].kn.rotation.x)*dt*3}
/* ---------- guns & props ---------- */
const REALW={katana:['katana',1,.24],bat:['bat',.85,.2],machete:['machete',.62,.25],crowbar:['crowbar',.75,.15],hatchet:['hatchet',.5,.2],wrench:['wrench',.4,.2]};
function gunMesh(kind){const rw=REALW[kind];if(rw&&!opts.procWeapons){const r=propAlong(rw[0],rw[1],rw[2],!!(opts.flipW||{})[kind]);if(r){const w=new T.Group();w.add(r);w.rotation.x=-PI/2;w.position.y=-.05;return w}}const g=new T.Group();const bk=mat('gun',0x1c1d20,{roughness:.45,metalness:.6}),wd=mat('gunw',0x5a3a22,{roughness:.7});const B=(w,h,d,x,y,z,m)=>{const mm=new T.Mesh(new T.BoxGeometry(w,h,d),m||bk);mm.position.set(x,y,z);mm.castShadow=true;g.add(mm);return mm};
  if(kind==='pistol'){B(.03,.035,.19,0,.02,.09);B(.028,.09,.035,0,-.03,.02).rotation.x=.25}
  else if(kind==='smg'){B(.04,.06,.32,0,.02,.12);B(.03,.12,.04,0,-.06,.1);B(.03,.07,.035,0,-.04,.02).rotation.x=.3;B(.012,.012,.12,0,.03,.32)}
  else if(kind==='shotgun'){B(.04,.05,.62,0,.02,.26);B(.045,.05,.18,0,-.01,.34,wd);B(.04,.08,.24,0,-.03,-.06,wd).rotation.x=.25}
  else if(kind==='rifle'){B(.04,.06,.7,0,.02,.28);B(.035,.14,.05,0,-.08,.16);B(.04,.08,.26,0,-.02,-.08);B(.03,.04,.14,0,.07,.2)}
  else if(kind==='sniper'){B(.035,.05,.95,0,.02,.36);B(.05,.05,.24,0,.08,.2);B(.04,.1,.3,0,-.02,-.08,wd)}
  else if(kind==='knife'){B(.01,.03,.2,0,0,.12,mat('steel',0xc8c8cc,{metalness:.9,roughness:.25}));B(.022,.03,.09,0,0,-.02,wd)}
  else if(kind==='bat'){const m=new T.Mesh(new T.CylinderGeometry(.035,.02,.8,10),wd);m.rotation.x=PI/2;m.position.z=.36;g.add(m)}
  else if(kind==='axe'){const m=new T.Mesh(new T.CylinderGeometry(.018,.018,.6,8),wd);m.rotation.x=PI/2;m.position.z=.26;g.add(m);B(.02,.14,.12,0,0,.52,mat('steel',0xa8a8ac,{metalness:.8,roughness:.35}))}
  else if(kind==='katana'){const bl=B(.008,.035,.85,0,0,.5,mat('blade',0xdadde2,{metalness:.95,roughness:.15}));B(.06,.06,.012,0,0,.07,mat('gold',0xb8903a,{metalness:.8,roughness:.3}));B(.025,.03,.2,0,0,-.04,mat('wrap',0x1a1a24))}
  else if(kind==='staff'){const m=new T.Mesh(new T.CylinderGeometry(.018,.022,1.4,8),wd);m.rotation.x=PI/2;m.position.z=.3;g.add(m);const gem=new T.Mesh(new T.OctahedronGeometry(.06),mat('gem',0x6ac8ff,{emissive:0x2a88ff,emissiveIntensity:1.4,roughness:.2}));gem.position.z=1.02;g.add(gem);g.userData.gem=gem}
  else if(kind==='wire'){B(.005,.005,.4,0,0,.1,mat('wire',0x999999,{metalness:.8}))}
  g.rotation.x=kind==='bat'||kind==='axe'||kind==='katana'||kind==='staff'?-PI/2:-PI/2;g.position.y=-.05;return g}
/* ---------- particles ---------- */
function mkPS(N,add){const g=new T.BufferGeometry();const A=n=>new Float32Array(N*n);const pos=A(3),col=A(3),sz=A(1),al=A(1);g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('pc',new T.BufferAttribute(col,3));g.setAttribute('sz',new T.BufferAttribute(sz,1));g.setAttribute('al',new T.BufferAttribute(al,1));
  const m=new T.ShaderMaterial({uniforms:{sc:{value:500}},vertexShader:'attribute float sz;attribute float al;attribute vec3 pc;varying vec3 vC;varying float vA;uniform float sc;void main(){vC=pc;vA=al;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=min(400.,sz*sc/max(.05,-mv.z));gl_Position=projectionMatrix*mv;}',fragmentShader:'varying vec3 vC;varying float vA;void main(){vec2 d=gl_PointCoord-.5;float r=dot(d,d)*4.;if(r>1.)discard;float f=1.-r;gl_FragColor=vec4(vC,vA*f*f);}',transparent:true,depthWrite:false,blending:add?T.AdditiveBlending:T.NormalBlending});
  const pts=new T.Points(g,m);pts.frustumCulled=false;pts.renderOrder=add?3:2;scene.add(pts);return{N,g,m,pos,col,sz,al,i:0,v:A(3),life:A(1),max:A(1),s0:A(1),s1:A(1),c0:A(3),c1:A(3),a0:A(1),gr:A(1),dr:A(1)}}
const FX=mkPS(opts.fxN||3000,true),SM=mkPS(opts.smN||1600,false);const tc0=new T.Color(),tc1=new T.Color();
function emit(S2,x,y,z,vx,vy,vz,life,s0,s1,c0,c1,a0,gr,dr){const i=S2.i;S2.i=(S2.i+1)%S2.N;S2.pos[i*3]=x;S2.pos[i*3+1]=y;S2.pos[i*3+2]=z;S2.v[i*3]=vx;S2.v[i*3+1]=vy;S2.v[i*3+2]=vz;S2.life[i]=S2.max[i]=life;S2.s0[i]=s0;S2.s1[i]=s1;tc0.set(c0);tc1.set(c1==null?c0:c1);S2.c0[i*3]=tc0.r;S2.c0[i*3+1]=tc0.g;S2.c0[i*3+2]=tc0.b;S2.c1[i*3]=tc1.r;S2.c1[i*3+1]=tc1.g;S2.c1[i*3+2]=tc1.b;S2.a0[i]=a0==null?1:a0;S2.gr[i]=gr||0;S2.dr[i]=dr||0}
function stepPS(S2,dt){for(let i=0;i<S2.N;i++){if(S2.life[i]<=0){if(S2.al[i])S2.al[i]=0;continue}S2.life[i]-=dt;if(S2.life[i]<=0){S2.al[i]=0;continue}const t=1-S2.life[i]/S2.max[i],d=Math.max(0,1-S2.dr[i]*dt),j=i*3;S2.v[j]*=d;S2.v[j+1]=S2.v[j+1]*d-S2.gr[i]*dt;S2.v[j+2]*=d;S2.pos[j]+=S2.v[j]*dt;S2.pos[j+1]+=S2.v[j+1]*dt;S2.pos[j+2]+=S2.v[j+2]*dt;S2.sz[i]=S2.s0[i]+(S2.s1[i]-S2.s0[i])*t;for(let q=0;q<3;q++)S2.col[j+q]=S2.c0[j+q]+(S2.c1[j+q]-S2.c0[j+q])*t;S2.al[i]=S2.a0[i]*(1-t)}const a=S2.g.attributes;a.position.needsUpdate=a.pc.needsUpdate=a.sz.needsUpdate=a.al.needsUpdate=true}
function burst(x,y,z,n,spd,life,s0,s1,c0,c1,a0,gr,dr,S2,up){S2=S2||FX;for(let i=0;i<n;i++){const u=Math.random()*2-1,a=Math.random()*PI*2,r=Math.sqrt(1-u*u),v=spd*rnd(.3,1);emit(S2,x,y,z,Math.cos(a)*r*v,u*v+(up||0),Math.sin(a)*r*v,life*rnd(.6,1.2),s0,s1,c0,c1,a0,gr,dr)}}
const decals=[];const dGeo=new T.PlaneGeometry(1,1);
function decal(p,n,s,texName,op,life){const m=new T.Mesh(dGeo,new T.MeshBasicMaterial({map:T_(texName),transparent:true,depthWrite:false,opacity:op||.9,polygonOffset:true,polygonOffsetFactor:-4}));m.position.copy(p).addScaledVector(n,.02);m.lookAt(p.clone().add(n));m.rotateZ(Math.random()*6);m.scale.setScalar(s);scene.add(m);decals.push({m,life:life||60,op:op||.9});if(decals.length>120){const d=decals.shift();scene.remove(d.m);d.m.material.dispose()}}
const LP=[];for(let i=0;i<3;i++){const l=new T.PointLight(0xffffff,0,18,2);scene.add(l);LP.push({l,t:0,max:1,i0:0})}let lpi=0;
function flash(p,col,inten,range,dur){const L=LP[lpi];lpi=(lpi+1)%LP.length;L.l.color.set(col);L.l.position.copy(p);L.l.distance=range;L.i0=inten;L.t=L.max=dur;L.l.intensity=inten}
const tracers=[];const trGeo=new T.BufferGeometry();trGeo.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(120*6),3));const trL=new T.LineSegments(trGeo,new T.LineBasicMaterial({color:0xffe8a0,transparent:true,opacity:.8}));trL.frustumCulled=false;scene.add(trL);
function tracer(a,b){tracers.push({a:a.clone(),b:b.clone(),t:0})}
function stepFX(dt){stepPS(FX,dt);stepPS(SM,dt);const scv=renderer.domElement.height/(2*Math.tan(camera.fov*PI/360));FX.m.uniforms.sc.value=scv;SM.m.uniforms.sc.value=scv;
  for(const L of LP){if(L.t>0){L.t-=dt;L.l.intensity=L.i0*Math.max(0,L.t/L.max)}else L.l.intensity=0}
  for(let i=decals.length-1;i>=0;i--){const d=decals[i];d.life-=dt;if(d.life<5)d.m.material.opacity=d.op*Math.max(0,d.life/5);if(d.life<=0){scene.remove(d.m);d.m.material.dispose();decals.splice(i,1)}}
  const pos=trGeo.attributes.position;let n=0;for(let i=tracers.length-1;i>=0;i--){const t2=tracers[i];t2.t+=dt;const L=t2.a.distanceTo(t2.b),head=t2.t*300;if(head>L+3){tracers.splice(i,1);continue}if(n>=120)continue;const d=t2.b.clone().sub(t2.a).normalize();const s=t2.a.clone().addScaledVector(d,Math.max(0,Math.min(L,head-3))),e=t2.a.clone().addScaledVector(d,Math.min(L,head));pos.setXYZ(n*2,s.x,s.y,s.z);pos.setXYZ(n*2+1,e.x,e.y,e.z);n++}for(let i=n;i<120;i++){pos.setXYZ(i*2,0,-999,0);pos.setXYZ(i*2+1,0,-999,0)}pos.needsUpdate=true}
/* ---------- sound ---------- */
let nb=null;function nbuf(a){if(!nb){const n=a.sampleRate*1.5;nb=a.createBuffer(1,n,a.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1}return nb}
function snd(o){if(muted)return;try{const a=ac(),t=a.currentTime+(o.delay||0);let vol=o.vol||.3;if(o.pos){const d=o.pos.distanceTo(camera.position);vol*=Math.max(0,1-d/(o.range||60))**1.5;if(vol<.004)return}const G2=a.createGain();G2.gain.value=vol;let out=G2;if(o.pos&&a.createStereoPanner){const P2=a.createStereoPanner();const r=new V3(1,0,0).applyQuaternion(camera.quaternion);const dd=o.pos.clone().sub(camera.position).normalize();P2.pan.value=clamp(dd.dot(r),-1,1)*.8;G2.connect(P2);P2.connect(a.destination)}else G2.connect(a.destination);
  if(o.noise){const s=a.createBufferSource();s.buffer=nbuf(a);s.playbackRate.value=o.rate||1;const f=a.createBiquadFilter();f.type=o.ft||'lowpass';f.frequency.value=o.f||1500;if(o.q)f.Q.value=o.q;const e=a.createGain();e.gain.setValueAtTime(1,t);e.gain.exponentialRampToValueAtTime(.001,t+o.dur);s.connect(f);f.connect(e);e.connect(G2);s.start(t,Math.random(),o.dur+.05)}
  if(o.tone){const os=a.createOscillator();os.type=o.wave||'sine';os.frequency.setValueAtTime(o.tone,t);if(o.tone2)os.frequency.exponentialRampToValueAtTime(o.tone2,t+o.tdur);const e=a.createGain();e.gain.setValueAtTime(o.tvol||.5,t);e.gain.exponentialRampToValueAtTime(.001,t+o.tdur);os.connect(e);e.connect(G2);os.start(t);os.stop(t+o.tdur+.02)}}catch(e){}}
const SFX={gun:(k,p)=>{const S2={pistol:[2600,.16,160,.4],smg:[2800,.1,170,.32],shotgun:[1400,.36,80,.6],rifle:[2200,.2,110,.5],sniper:[1500,.5,70,.7]}[k]||[2400,.16,150,.4];snd({pos:p,noise:1,f:S2[0],dur:S2[1],tone:S2[2],tone2:S2[2]*.5,tdur:S2[1]*.6,wave:'square',tvol:.3,vol:S2[3],range:120})},
  punch:p=>{snd({pos:p,noise:1,f:600,dur:.09,vol:.5,range:30});snd({pos:p,tone:110,tone2:60,tdur:.08,wave:'sine',tvol:.6,vol:.4,range:30})},
  swing:p=>snd({pos:p,noise:1,ft:'bandpass',f:1600,q:1,dur:.16,vol:.2,range:20}),
  clang:p=>{snd({pos:p,noise:1,ft:'highpass',f:3000,dur:.12,vol:.35,range:40});snd({pos:p,tone:1800,tone2:1500,tdur:.4,wave:'triangle',tvol:.25,vol:.3,range:40})},
  slash:p=>{snd({pos:p,noise:1,ft:'highpass',f:2400,dur:.14,vol:.35,range:30});snd({pos:p,noise:1,f:500,dur:.08,vol:.3,range:30,delay:.02})},
  step:(p,v)=>snd({pos:p,noise:1,f:700,dur:.05,vol:(v||.12),range:18}),
  boom:(p,k)=>{snd({pos:p,noise:1,f:350,dur:1.2*(k||1),vol:.8,range:200});snd({pos:p,tone:80,tone2:30,tdur:.8,wave:'sine',tvol:.8,vol:.7,range:200})},
  hurt:()=>snd({tone:220,tone2:140,tdur:.18,wave:'sawtooth',tvol:.3,vol:.2}),
  pick:()=>snd({tone:700,tone2:1100,tdur:.1,wave:'triangle',tvol:.4,vol:.18}),
  ui:()=>snd({tone:880,tdur:.06,wave:'triangle',tvol:.3,vol:.12}),
  bad:()=>snd({tone:180,tdur:.18,wave:'square',tvol:.3,vol:.12}),
  magic:(p,f)=>{snd({pos:p,tone:f||600,tone2:(f||600)*2.2,tdur:.5,wave:'sine',tvol:.5,vol:.35,range:60});snd({pos:p,noise:1,ft:'highpass',f:3500,dur:.4,vol:.15,range:60})},
  whoosh:p=>snd({pos:p,noise:1,ft:'bandpass',f:900,q:.8,dur:.3,vol:.25,range:30}),
  chop:p=>{snd({pos:p,noise:1,f:900,dur:.08,vol:.45,range:40});snd({pos:p,tone:180,tone2:120,tdur:.1,wave:'triangle',tvol:.4,vol:.35,range:40})},
  cash:()=>{snd({tone:1320,tdur:.08,wave:'triangle',tvol:.4,vol:.18});snd({tone:1760,tdur:.12,wave:'triangle',tvol:.4,vol:.18,delay:.07})},
  mission:()=>{[523,659,784,1047].forEach((f,i)=>snd({tone:f,tdur:.3,wave:'triangle',tvol:.35,vol:.2,delay:i*.12}))},
  fail:()=>{[330,262,196].forEach((f,i)=>snd({tone:f,tdur:.35,wave:'sawtooth',tvol:.3,vol:.15,delay:i*.18}))}};
const loops=new Set();
function loop(o){if(muted)return null;try{const a=ac();let src;if(o.noise){src=a.createBufferSource();src.buffer=nbuf(a);src.loop=true}else{src=a.createOscillator();src.type=o.wave||'sawtooth';src.frequency.value=o.freq||100}const f=a.createBiquadFilter();f.type=o.ft||'lowpass';f.frequency.value=o.f||800;if(o.q)f.Q.value=o.q;const g=a.createGain();g.gain.value=0;src.connect(f);f.connect(g);g.connect(a.destination);src.start();const L={src,f,g,a,set(v,fr,ff){try{g.gain.setTargetAtTime(v,a.currentTime,.05);if(fr!=null&&src.frequency)src.frequency.setTargetAtTime(fr,a.currentTime,.05);if(ff!=null)f.frequency.setTargetAtTime(ff,a.currentTime,.05)}catch(e){}},stop(){try{g.gain.setTargetAtTime(0,a.currentTime,.05);src.stop(a.currentTime+.3)}catch(e){}loops.delete(L)}};loops.add(L);return L}catch(e){return null}}
/* ---------- HUD ---------- */
const H={};(()=>{const E=(cls,tag)=>el(tag||'div',{class:cls});H.bars=E('bk-bars');H.hp=E('bk-bar hp');H.hp.append(el('i'));H.ar=E('bk-bar ar');H.ar.append(el('i'));H.st=E('bk-bar st');H.st.append(el('i'));H.ot=E('bk-bar ot');H.ot.append(el('i'));H.bars.append(H.hp,H.ar,H.st,H.ot);
  H.tr=E('bk-tr');H.money=E('bk-money');H.wep=E('bk-wep');H.stars=E('bk-stars');H.tr.append(H.money,H.wep,H.stars);H.obj=E('bk-obj');H.prompt=E('bk-prompt');H.note=E('bk-note');H.ban=E('bk-ban');H.dlg=E('bk-dlg');H.lbT=E('bk-lb t');H.lbB=E('bk-lb b');H.fade=E('bk-fade');H.x=E('bk-x');for(let i=0;i<4;i++)H.x.append(el('i'));H.hm=E('bk-hm');H.hurt=E('bk-hurt');H.map=el('canvas',{class:'bk-map',width:256,height:256});H.menu=E('bk-menu');H.keys=E('bk-keys');H.tb=E('bk-tb');
  hud.append(H.hurt,H.map,H.bars,H.tr,H.obj,H.x,H.hm,H.prompt,H.note,H.ban,H.dlg,H.keys,H.tb,H.lbT,H.lbB,H.fade,H.menu);[H.menu,H.tb].forEach(e=>{e.addEventListener('mousedown',ev=>ev.stopPropagation());e.addEventListener('pointerdown',ev=>ev.stopPropagation())});
  H.mg=H.map.getContext('2d')})();
function bar(el2,v){if(v==null){el2.style.display='none';return}el2.style.display='block';el2.firstChild.style.width=clamp(v,0,1)*100+'%'}
let promptOn='';function prompt(key,text){const s=key?key+'|'+text:'';if(s===promptOn)return;promptOn=s;if(!key){H.prompt.style.display='none';return}H.prompt.innerHTML='';H.prompt.append(el('b',null,wrap.classList.contains('touch')?'USE':key),text);H.prompt.style.display='block'}
function objective(t){if(!t){H.obj.style.display='none';return}H.obj.textContent=t;H.obj.style.display='block'}
function note(t,col){const d=el('div',null,t);if(col)d.style.borderLeftColor=col;H.note.append(d);setTimeout(()=>{d.style.transition='opacity .5s';d.style.opacity=0;setTimeout(()=>d.remove(),600)},4200);while(H.note.children.length>4)H.note.firstChild.remove()}
let banT=null;function banner(a,b,col,dur){H.ban.innerHTML='';const bb=el('b',null,a);if(col)bb.style.color=col;H.ban.append(bb);if(b)H.ban.append(el('small',null,b));H.ban.classList.add('on');clearTimeout(banT);banT=setTimeout(()=>H.ban.classList.remove('on'),dur||2800)}
/* dialog queue: [{who,text,col,dur,fn}] */
const DQ={q:[],t:0,cur:null,cb:null};function say(lines,cb){DQ.q.push(...lines);if(cb)DQ.q.push({fn:cb});if(!DQ.cur)nextLine()}
function nextLine(){const L=DQ.q.shift();DQ.cur=L||null;wrap.classList.toggle('bkdlg',!!L&&!L.fn);if(!L){H.dlg.style.display='none';return}if(L.fn){L.fn();nextLine();return}H.dlg.innerHTML='';const b=el('b',null,L.who||'');if(L.col)b.style.color=L.col;H.dlg.append(b,el('p',null,L.text),el('small',null,'Enter / tap to skip'));H.dlg.style.display='block';DQ.t=L.dur||Math.max(2.4,L.text.length*.055);try{if(L.voice!==false&&!muted&&opts.voice!==false){const u=new SpeechSynthesisUtterance(L.text);u.rate=1.04;u.pitch=L.pitch||1;u.volume=.8;speechSynthesis.cancel();speechSynthesis.speak(u)}}catch(e){}}
function stepDlg(dt){if(!DQ.cur)return;DQ.t-=dt;if(DQ.t<=0)nextLine()}
c.on(document,'keydown',e=>{if(e.key==='Enter'&&DQ.cur){try{speechSynthesis.cancel()}catch(er){}nextLine()}});c.on(H.dlg,'pointerdown',()=>{if(DQ.cur)nextLine()});
function cine(on){wrap.classList.toggle('cine',!!on)}
function fade(on,cb,ms){H.fade.style.opacity=on?1:0;if(cb)setTimeout(cb,ms||650)}
let hmT=null;function hitmark(kill){H.hm.className='bk-hm'+(kill?' k':'');H.hm.style.opacity=1;clearTimeout(hmT);hmT=setTimeout(()=>H.hm.style.opacity=0,kill?260:120)}
function hurtFx(v){H.hurt.style.opacity=clamp(v,0,1)}
function menu(html,btns){H.menu.innerHTML='';const card=el('div',{class:'bk-card'});if(typeof html==='string')card.innerHTML=html;else card.append(html);(btns||[]).forEach(([t,fn,cls])=>{const b=el('button',{type:'button',class:'bk-btn '+(cls||'')},t);b.onclick=e=>{e.stopPropagation();fn()};card.append(b)});H.menu.append(card);H.menu.classList.add('on');if(document.pointerLockElement)document.exitPointerLock();return card}
function menuOff(){H.menu.classList.remove('on')}
function keys(list){H.keys.innerHTML='';list.forEach(([k,d])=>{const r=el('div');k.split(' ').forEach(x=>r.append(el('b',null,x)));r.append(document.createTextNode(' '+d));H.keys.append(r)});const h=el('span',{class:'k2'},'H hides controls');H.keys.append(h)}
let keysMin=!!S.get((opts.id||'bk')+'_keysmin',0);H.keys.classList.toggle('min',keysMin);c.on(document,'keydown',e=>{if(e.key.toLowerCase()==='h'&&!e.repeat&&!(e.target&&/INPUT/.test(e.target.tagName))){keysMin=!keysMin;H.keys.classList.toggle('min',keysMin);S.set((opts.id||'bk')+'_keysmin',keysMin?1:0)}});
function touchBtn(label,fn,hold){const b=el('button',{type:'button'},label);H.tb.append(b);if(hold){b.addEventListener('pointerdown',e=>{e.preventDefault();fn(true)});['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>fn(false)))}else b.addEventListener('pointerdown',e=>{e.preventDefault();fn()});return b}
/* ---------- third-person camera ---------- */
const CAM={yaw:0,pitch:.25,dist:4.5,tdist:4.5,h:1.6,side:.55,shake:0,fov:70};
function camUpdate(target,dt,o){o=o||{};const sens=.0024*(o.aim?.6:1);if(!o.lock){CAM.yaw-=input.mdx*sens;CAM.pitch=clamp(CAM.pitch+input.mdy*sens,-.9,1.3)}
  const d=o.dist!=null?o.dist:CAM.tdist;CAM.dist=lerp(CAM.dist,d,Math.min(1,dt*6));const sd=o.side!=null?o.side:CAM.side;const h=o.h||CAM.h;
  const piv=new V3(target.x,target.y+h,target.z);const back=new V3(Math.sin(CAM.yaw)*Math.cos(CAM.pitch),Math.sin(CAM.pitch),Math.cos(CAM.yaw)*Math.cos(CAM.pitch));const right=new V3(Math.cos(CAM.yaw),0,-Math.sin(CAM.yaw));
  piv.addScaledVector(right,sd);let dist=CAM.dist;const hit=rayBoxes(piv,back,dist+.3,b=>b.tag==='soft'||b.tag==='noCam');if(hit)dist=Math.max(.6,hit.t-.3);
  const p=piv.clone().addScaledVector(back,dist);if(W.groundFn){const gy=W.groundFn(p.x,p.z)+.4;if(p.y<gy)p.y=gy}else if(p.y<.3)p.y=.3;
  CAM.shake=Math.max(0,CAM.shake-dt*2);const sk=CAM.shake*CAM.shake*.3;camera.position.set(p.x+rnd(-sk,sk),p.y+rnd(-sk,sk),p.z+rnd(-sk,sk));camera.lookAt(piv.x-back.x,piv.y-back.y*.6,piv.z-back.z);
  const tf=o.fov||CAM.fov;if(Math.abs(camera.fov-tf)>.05){camera.fov=lerp(camera.fov,tf,Math.min(1,dt*8));camera.updateProjectionMatrix()}}
function camFwd(){return new V3(-Math.sin(CAM.yaw),0,-Math.cos(CAM.yaw))}
function aimRay(){const d=new V3();camera.getWorldDirection(d);return{o:camera.position.clone(),d}}
/* ---------- sky & light ---------- */
function skyDome(o){const U={top:{value:lin(o.top||0x3a6ab8)},hor:{value:lin(o.hor||0xcfe0f0)},bot:{value:lin(o.bot||0x8a8a80)},sunD:{value:new V3(...(o.sun||[.5,.5,-.6])).normalize()},sunC:{value:lin(o.sunC||0xfff0d0)},stars:{value:o.stars||0},moon:{value:o.moon||0}};
  const m=new T.Mesh(new T.SphereGeometry(o.r||900,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:U,vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 top,hor,bot,sunD,sunC;uniform float stars,moon;varying vec3 vD;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}void main(){float y=vD.y;vec3 c=y>0.?mix(hor,top,pow(y,.6)):mix(hor,bot,min(1.,-y*4.));float s=max(dot(vD,sunD),0.);c+=sunC*(pow(s,500.)*3.*(1.-moon*.5)+pow(s,12.)*.25);if(y>0.){vec2 p=vD.xz/(y+.1)*1.6;float cl=n2(p)*.55+n2(p*2.3)*.3+n2(p*5.)*.15;cl=smoothstep(.55,.85,cl)*smoothstep(0.,.3,y);c=mix(c,mix(hor,vec3(1.),.6)*(1.-stars*.8),cl*.7);float st=step(.9975,h(floor(vD.xz/(y+.02)*300.)));c+=st*stars*smoothstep(.1,.4,y);}gl_FragColor=vec4(c,1.);}'}));m.renderOrder=-1;scene.add(m);st3.onFrame(()=>m.position.copy(camera.position));m.userData.U=U;return m}
function sunLight(o){const hemi=new T.HemisphereLight(lin(o.sky||0xcfe0ff),lin(o.gnd||0x6a5a48),o.hemi||.6);scene.add(hemi);const sun=new T.DirectionalLight(lin(o.col||0xfff0dc),o.int||1.8);sun.castShadow=true;sun.shadow.mapSize.set(o.map||2048,o.map||2048);const S2=o.size||40;Object.assign(sun.shadow.camera,{left:-S2,right:S2,top:S2,bottom:-S2,near:1,far:200});sun.shadow.bias=-.0006;sun.shadow.normalBias=.03;scene.add(sun,sun.target);const dir=new V3(...(o.dir||[.5,.8,.3])).normalize();
  st3.onFrame(()=>{const t=o.follow||camera.position;sun.target.position.set(t.x,0,t.z);sun.position.set(t.x+dir.x*80,dir.y*80,t.z+dir.z*80)});return{hemi,sun,dir}}
/* ---------- save ---------- */
const SAVE={get(k,d){return S.get((opts.id||'bk')+'_'+k,d)},set(k,v){S.set((opts.id||'bk')+'_'+k,v)}};
st3.onFrame(dt=>{stepFX(Math.min(dt,.05));stepDlg(Math.min(dt,.05))});
return{T,V3,PI,rnd,clamp,lerp,pick,lin,angDiff,scene,camera,renderer,wrap,hud,input,st3,ctex,speck,blot,T_,mat,Merger,W,addBox,removeBox,clearWorld,near,groundAt,collide,rayBoxes,los,buildNav,navFree,astar,NAV,human,pose,holdItem,ragdoll,gunMesh,FX,SM,emit,burst,decal,flash,tracer,snd,SFX,loop,loops,H,bar,prompt,objective,note,banner,say,DQ,cine,fade,hitmark,hurtFx,menu,menuOff,keys,touchBtn,CAM,camUpdate,camFwd,aimRay,skyDome,sunLight,SAVE,env,envInt,prop,propParts,propAlong,photoFill,pbr,pbrRep,leafMat,crownGeo,pineCrownGeo,splatMat,realTree,hasArt,realTex,ENV,ART:ARTX,
  dispose(){loops.forEach(L=>L.stop());try{speechSynthesis.cancel()}catch(e){}}}}
