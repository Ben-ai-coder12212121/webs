/* lib/gunsim.js: code shared by several games (from src/heroes/gunsim.js) */
const GS_CSS=`.gs .tctl{display:none!important}
.gs .hud{font:600 13px system-ui,-apple-system,Segoe UI,sans-serif;color:#f3eee6}
.gs button{transform:none!important}
.gs-top{position:absolute;left:12px;right:12px;top:10px;display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
.gs-id b{display:block;font:900 24px/1 'Arial Black',system-ui,sans-serif;letter-spacing:-.02em;text-shadow:0 2px 10px rgba(0,0,0,.8)}
.gs-id small{display:block;margin-top:3px;opacity:.82;font-size:12px;text-shadow:0 1px 6px #000}
.gs-seg{pointer-events:auto;display:flex;background:rgba(10,9,8,.55);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:3px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.gs-seg button{all:unset;cursor:pointer;padding:6px 12px;border-radius:999px;font:800 12px system-ui,sans-serif;color:#ddd;white-space:nowrap}
.gs-seg button.on{background:#ff7a1a;color:#140c04}
.gs-ammo{position:absolute;right:14px;bottom:112px;text-align:right;text-shadow:0 2px 10px rgba(0,0,0,.9)}
.gs-ammo b{font:900 40px/1 ui-monospace,SFMono-Regular,Menlo,monospace}
.gs-ammo span{font:800 20px ui-monospace,Menlo,monospace;margin-left:2px;color:#ffb36b}
.gs-ammo i{display:block;font:800 11px system-ui,sans-serif;font-style:normal;letter-spacing:.14em;opacity:.9;margin-top:3px}
.gs-ammo i.safe{color:#5fd07a}
.gs-rd{display:flex;gap:2px;justify-content:flex-end;margin-top:5px;flex-wrap:wrap;max-width:190px;margin-left:auto}
.gs-rd u{width:4px;height:13px;background:linear-gradient(#f2d27a,#b8872f);border-radius:2px 2px 1px 1px}
.gs-rd u.x{background:rgba(255,255,255,.16)}
.gs-bot{position:absolute;left:8px;right:8px;bottom:8px;display:flex;flex-direction:column;gap:6px;pointer-events:none}
.gs-guns{display:flex;gap:6px;overflow-x:auto;pointer-events:auto;scrollbar-width:none;padding:1px}
.gs-guns::-webkit-scrollbar{display:none}
.gs-guns button{all:unset;cursor:pointer;flex:0 0 auto;padding:6px 10px;border-radius:10px;background:rgba(14,12,10,.66);border:1px solid rgba(255,255,255,.14);color:#e9e4dc;font:800 12px system-ui,sans-serif;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.gs-guns button small{font-weight:600;opacity:.65;margin-left:5px}
.gs-guns button.on{border-color:#ff7a1a;background:rgba(255,122,26,.25);color:#fff}
.gs-acts{display:flex;gap:6px;flex-wrap:wrap;pointer-events:auto}
.gs-acts button{all:unset;cursor:pointer;padding:8px 11px;border-radius:10px;background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.2);color:#fff;font:800 12px system-ui,sans-serif;letter-spacing:.03em;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);white-space:nowrap}
.gs-acts button.on{background:#ff7a1a;color:#140c04;border-color:#ff7a1a}
.gs-acts button:active{filter:brightness(1.4)}
.gs-acts button[hidden]{display:none}
.gs-fire{all:unset;position:absolute;right:14px;bottom:190px;width:82px;height:82px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#ff9a4a,#d2461a);border:3px solid rgba(255,255,255,.85);color:#fff;font:900 14px system-ui,sans-serif;text-align:center;pointer-events:auto;box-shadow:0 6px 18px rgba(0,0,0,.5);display:none;touch-action:none}
.gs.touch .gs-fire{display:block}
.gs-fire:active{filter:brightness(1.25)}
.gs-msg{position:absolute;left:50%;bottom:134px;transform:translateX(-50%);background:rgba(10,9,8,.72);padding:8px 14px;border-radius:10px;font:800 14px system-ui,sans-serif;opacity:0;transition:opacity .25s;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis;border:1px solid rgba(255,255,255,.12)}
.gs-msg.on{opacity:1}
.gs-help{position:absolute;left:12px;bottom:92px;font:600 11px system-ui,sans-serif;opacity:.6;text-shadow:0 1px 4px #000;max-width:60%}
.gs.touch .gs-help{display:none}
.gs-x{position:absolute;left:50%;top:50%;width:0;height:0;display:none}
.gs-x i{position:absolute;background:rgba(255,255,255,.85);box-shadow:0 0 2px #000}
.gs-scope{position:absolute;inset:0;display:none;background:radial-gradient(circle closest-side at 50% 50%,transparent 0 91%,#000 92%)}
.gs-scope svg{position:absolute;left:50%;top:50%;width:100vmin;height:100vmin;transform:translate(-50%,-50%)}
.gs-dot{position:absolute;left:50%;top:50%;width:5px;height:5px;margin:-2.5px 0 0 -2.5px;border-radius:50%;background:#ff2a1a;box-shadow:0 0 6px 2px rgba(255,40,20,.8);display:none}
.gs-drill{position:absolute;left:50%;top:9%;transform:translateX(-50%);font:900 30px ui-monospace,Menlo,monospace;text-shadow:0 2px 10px #000;display:none;text-align:center}
.gs-drill small{display:block;font:700 12px system-ui,sans-serif;opacity:.85}
.gs-score{position:absolute;left:12px;top:64px;font:700 12px system-ui,sans-serif;text-shadow:0 1px 6px #000;opacity:.9;display:none}
.gs-gunbar{display:flex;gap:6px;pointer-events:auto;align-items:stretch}
.gs-gunbar button{all:unset;cursor:pointer;padding:8px 12px;border-radius:10px;background:rgba(14,12,10,.72);border:1px solid rgba(255,255,255,.16);color:#fff;font:800 13px system-ui,sans-serif;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.gs-gunbar .gs-cur{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-color:#ff7a1a;background:rgba(255,122,26,.22);text-align:center}
.gs-gunbar .gs-cur small{font-weight:600;opacity:.7;margin-left:6px}
.gs-pick{position:absolute;inset:0;background:rgba(8,7,6,.9);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:none;overflow:auto;padding:14px 14px 18px;pointer-events:auto;z-index:6}
.gs-pick.on{display:block}
.gs-pick .hd{display:flex;justify-content:space-between;align-items:center;font:900 18px 'Arial Black',system-ui,sans-serif;margin-bottom:4px}
.gs-pick .hd button{all:unset;cursor:pointer;padding:6px 12px;border-radius:9px;background:#ff7a1a;color:#140c04;font:900 13px system-ui,sans-serif}
.gs-pick h4{margin:12px 0 6px;font:900 11px system-ui,sans-serif;letter-spacing:.16em;color:#ffb36b;text-transform:uppercase}
.gs-pick .gr{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}
.gs-pick .gr button{all:unset;cursor:pointer;padding:9px 11px;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#fff;font:800 13px system-ui,sans-serif}
.gs-pick .gr button:hover{background:rgba(255,255,255,.16)}
.gs-pick .gr button small{display:block;font:600 11px system-ui,sans-serif;opacity:.65;margin-top:2px}
.gs-pick .gr button.on{border-color:#ff7a1a;background:rgba(255,122,26,.25)}
.gs-mouse{all:unset;position:absolute;left:50%;top:46px;transform:translateX(-50%)!important;cursor:pointer;pointer-events:auto;padding:6px 12px;border-radius:999px;background:rgba(10,9,8,.7);border:1px solid rgba(255,255,255,.2);font:800 12px system-ui,sans-serif;color:#fff;white-space:nowrap;display:none}
.gs-mouse.free{background:#ff7a1a;color:#140c04;border-color:#ff7a1a}
.gs.touch .gs-mouse{display:none!important}
.gs-zh{position:absolute;left:12px;bottom:132px;width:min(240px,46%);display:none}
.gs-zh .bar{height:12px;border-radius:6px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.25);overflow:hidden}.gs-zh .bar i{display:block;height:100%;background:linear-gradient(90deg,#b3120f,#ff4d3a);transition:width .15s}
.gs-zh small{display:block;font:800 11px system-ui,sans-serif;letter-spacing:.1em;margin-bottom:3px;text-shadow:0 1px 4px #000}
.gs-zw{position:absolute;left:50%;top:10px;transform:translateX(-50%);text-align:center;font:900 15px system-ui,sans-serif;letter-spacing:.08em;text-shadow:0 2px 8px #000;display:none;white-space:nowrap}
.gs-zw b{color:#ff5a3a}.gs-zw span{display:block;font:900 20px ui-monospace,Menlo,monospace;color:#7dff8a;letter-spacing:0}
.gs-ban{position:absolute;left:50%;top:30%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;opacity:0;transition:opacity .4s}
.gs-ban.on{opacity:1}.gs-ban b{display:block;font:900 clamp(30px,7vw,64px)/1 'Arial Black',system-ui,sans-serif;color:#ff3b2a;text-shadow:0 4px 20px #000,0 0 30px rgba(255,40,20,.4);letter-spacing:.04em}.gs-ban small{font:800 15px system-ui,sans-serif;text-shadow:0 2px 8px #000}
.gs-hurt{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 45%,rgba(160,0,0,.75));opacity:0;pointer-events:none}
.gs-hm{position:absolute;left:50%;top:50%;width:22px;height:22px;margin:-11px 0 0 -11px;opacity:0;transition:opacity .12s;background:linear-gradient(45deg,transparent 45%,#fff 45% 55%,transparent 55%),linear-gradient(-45deg,transparent 45%,#fff 45% 55%,transparent 55%)}
.gs-hm.h{background:linear-gradient(45deg,transparent 42%,#ff2a1a 42% 58%,transparent 58%),linear-gradient(-45deg,transparent 42%,#ff2a1a 42% 58%,transparent 58%)}
.gs-cp{position:absolute;left:50%;top:58%;transform:translateX(-50%);font:900 16px system-ui,sans-serif;color:#7dff8a;text-shadow:0 2px 6px #000;opacity:0;transition:opacity .3s,top .6s}
.gs-joy{position:absolute;width:110px;height:110px;margin:-55px 0 0 -55px;border-radius:50%;border:2px solid rgba(255,255,255,.4);background:rgba(255,255,255,.08);display:none;pointer-events:none}.gs-joy i{position:absolute;left:50%;top:50%;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:rgba(255,255,255,.55)}
.gs-shop{position:absolute;inset:0;background:rgba(8,6,6,.9);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:none;overflow:auto;padding:14px;pointer-events:auto;z-index:6}
.gs-shop.on{display:block}.gs-shop .hd{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font:900 18px 'Arial Black',system-ui,sans-serif}
.gs-shop .hd em{font:900 18px ui-monospace,Menlo,monospace;color:#7dff8a;font-style:normal}
.gs-shop .hd button,.gs-shop .go{all:unset;cursor:pointer;padding:8px 14px;border-radius:9px;background:#ff3b2a;color:#fff;font:900 13px system-ui,sans-serif}
.gs-shop h4{margin:12px 0 6px;font:900 11px system-ui,sans-serif;letter-spacing:.16em;color:#ff8a6a;text-transform:uppercase}
.gs-shop .gr{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px}
.gs-shop .gr button{all:unset;cursor:pointer;padding:9px 11px;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#fff;font:800 13px system-ui,sans-serif}
.gs-shop .gr button small{display:block;font:600 11px system-ui,sans-serif;opacity:.7;margin-top:2px}.gs-shop .gr button b{float:right;color:#7dff8a}
.gs-shop .gr button.no{opacity:.45}.gs-shop .gr button.own{border-color:#ff7a1a}
.gs.zm .gs-seg,.gs.zm .gs-score{display:none!important}.gs.zm .gs-zh,.gs.zm .gs-zw{display:block}
.gs-tb{all:unset;position:absolute;width:62px;height:62px;border-radius:50%;background:rgba(255,255,255,.14);border:2px solid rgba(255,255,255,.7);color:#fff;font:900 11px system-ui,sans-serif;text-align:center;pointer-events:auto;display:none;touch-action:none}
.gs.touch.zm .gs-tb{display:block}
.gs-vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,transparent 55%,rgba(0,0,0,.42))}
.gs-slow{position:absolute;left:50%;top:10px;transform:translateX(-50%);font:900 12px system-ui,sans-serif;letter-spacing:.2em;color:#ffb36b;display:none;text-shadow:0 1px 6px #000}
@media (max-width:700px){.gs-help{display:none}.gs-msg{bottom:196px}.gs-id b{font-size:19px}.gs-ammo{bottom:118px}.gs-ammo b{font-size:32px}.gs-acts button{padding:7px 9px;font-size:11px}.gs-fire{bottom:198px}}`;
function gunSim(root,c,cfg){cfg=cfg||{};return with3D(root,c,()=>{
const st3=Stage3D(root,c,{lock:false,dragLook:false,fov:30,far:140,jump:false});
const{T,scene,camera,renderer,wrap,hud,input}=st3;const V3=T.Vector3;
wrap.classList.add('gs');wrap.append(el('style',null,GS_CSS));
renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;camera.near=.01;camera.updateProjectionMatrix();
const rnd=(a,b)=>a+Math.random()*(b-a),PI=Math.PI,ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
let TS=1,SLOW=false,MODE='bench',dead=false;

/* ---------- textures ---------- */
const ctex=(w,h,fn,rx,ry,srgb)=>{const t=tex(T,w,h,fn,rx,ry);if(srgb)t.encoding=T.sRGBEncoding;return t};
const speck=(x,w,h,amt)=>{const id=x.getImageData(0,0,w,h),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*amt;d[i]+=n;d[i+1]+=n;d[i+2]+=n}x.putImageData(id,0,0)};
const blotch=(x,w,h,n,cols,rmin,rmax,a)=>{for(let i=0;i<n;i++){const r=rnd(rmin,rmax),px=Math.random()*w,py=Math.random()*h,g=x.createRadialGradient(px,py,0,px,py,r),col=cols[i%cols.length];g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);x.fillStyle=g;x.fillRect(px-r,py-r,r*2,r*2)}};
const RM=ctex(256,256,(x,w,h)=>{x.fillStyle='#d8d8d8';x.fillRect(0,0,w,h);blotch(x,w,h,70,['255,255,255','120,120,120'],8,50,.25);speck(x,w,h,30)},24,24);
const STIP=ctex(128,128,(x,w,h)=>{x.fillStyle='#808080';x.fillRect(0,0,w,h);for(let i=0;i<900;i++){const v=Math.random()<.5?30:230;x.fillStyle=`rgb(${v},${v},${v})`;x.beginPath();x.arc(Math.random()*w,Math.random()*h,1+Math.random()*2.2,0,7);x.fill()}},90,90);
const CHK=ctex(64,64,(x,w,h)=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);x.strokeStyle='#000';x.lineWidth=7;for(let k=-2;k<=2;k++){x.beginPath();x.moveTo(k*w/2,0);x.lineTo(k*w/2+w,h);x.stroke();x.beginPath();x.moveTo(k*w/2,h);x.lineTo(k*w/2+w,0);x.stroke()}},380,380);
const woodFn=(base,light,dark,planks)=>(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,`rgb(${light})`);g.addColorStop(.5,`rgb(${base})`);g.addColorStop(1,`rgb(${light})`);x.fillStyle=g;x.fillRect(0,0,w,h);
  blotch(x,w,h,30,[dark,light],w*.05,w*.2,.25);
  for(let i=0;i<340;i++){const y0=Math.random()*h,amp=rnd(1,h*.05),fr=rnd(.002,.012),ph=Math.random()*9;x.strokeStyle=`rgba(${dark},${rnd(.05,.3)})`;x.lineWidth=rnd(.4,2.2);x.beginPath();for(let X=0;X<=w;X+=8){const Y=y0+Math.sin(X*fr+ph)*amp+Math.sin(X*fr*3.3+ph*2)*amp*.3;X?x.lineTo(X,Y):x.moveTo(X,Y)}x.stroke()}
  for(let i=0;i<1400;i++){x.fillStyle=`rgba(${dark},.35)`;x.fillRect(Math.random()*w,Math.random()*h,rnd(2,7),1)}
  if(planks)for(let k=1;k<planks;k++){x.fillStyle='rgba(20,12,6,.55)';x.fillRect(0,k*h/planks-1,w,2)}speck(x,w,h,10)};
const WAL=ctex(1024,256,woodFn('96,58,32','132,86,50','44,24,12'),3,12,true);
const OAK=ctex(1024,512,woodFn('104,72,44','128,92,58','60,38,20',6),1,1,true);
const OAKR=ctex(256,256,(x,w,h)=>{x.fillStyle='#b8b8b8';x.fillRect(0,0,w,h);blotch(x,w,h,40,['90,90,90','230,230,230'],10,40,.3);for(let i=0;i<60;i++){x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1;x.beginPath();const a=Math.random()*w,b=Math.random()*h;x.moveTo(a,b);x.lineTo(a+rnd(-30,30),b+rnd(-8,8));x.stroke()}speck(x,w,h,20)},2,2);

/* ---------- lighting environment (image based) ---------- */
const pm=new T.PMREMGenerator(renderer);
function envFrom(build){const es=new T.Scene();build(es);const rt=pm.fromScene(es,.02);es.traverse(o=>{o.geometry&&o.geometry.dispose();o.material&&o.material.dispose()});return rt}
const envPanel=(es,w,h,v,x,y,z,col)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(col||0xffffff).multiplyScalar(v),side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m)};
const ENV_B=envFrom(es=>{es.add(new T.Mesh(new T.BoxGeometry(12,7,12),new T.MeshBasicMaterial({color:0x0a0908,side:T.BackSide})));
  envPanel(es,3.4,1.3,2.2,0,3.2,.6);envPanel(es,.5,4,1.6,-4.6,1.2,2.4);envPanel(es,.5,4,1.3,4.8,1.4,-1.8,0xdde8ff);envPanel(es,7,2,.12,0,-3,0,0x8a6a48);envPanel(es,1.6,1.4,.5,1,1,5.8);envPanel(es,1,1,.8,-2,2,-5.5,0xfff0dd);envPanel(es,4,1,1.5,.5,2.2,-5.6);envPanel(es,5,.35,.9,0,.6,-5.7,0xffe6cc)});
const ENV_R=envFrom(es=>{es.add(new T.Mesh(new T.BoxGeometry(8,4,30),new T.MeshBasicMaterial({color:0x26282a,side:T.BackSide})));
  for(let z=-12;z<=12;z+=4)envPanel(es,1.6,.3,4,0,1.9,z,0xfff3dc);envPanel(es,8,2,.35,0,-1.9,0,0x6a655c)});

const ENV_Z=envFrom(es=>{es.add(new T.Mesh(new T.BoxGeometry(40,20,40),new T.MeshBasicMaterial({color:0x0a0d16,side:T.BackSide})));envPanel(es,8,8,.5,0,9,0,0x7088c0);envPanel(es,2,2,1.4,8,4,8,0xffb870);envPanel(es,2,2,1.2,-8,4,-8,0xffb870);envPanel(es,30,3,.08,0,-9,0,0x303036)});
/* ---------- materials ---------- */
const lin=o=>{['color','emissive'].forEach(k=>{if(typeof o[k]==='number')o[k]=new T.Color(o[k]).convertSRGBToLinear()});return o};const std=o=>new T.MeshStandardMaterial(lin(o)),phy=o=>new T.MeshPhysicalMaterial(lin(o));
const MT={
  nitride:phy({color:0x303135,metalness:.85,roughness:.4,roughnessMap:RM,clearcoat:.2,clearcoatRoughness:.45}),
  blued:phy({color:0x1a2030,metalness:1,roughness:.24,roughnessMap:RM,clearcoat:.5,clearcoatRoughness:.12}),
  stainless:std({color:0xc9cdd1,metalness:1,roughness:.26,roughnessMap:RM}),
  parker:std({color:0x2c2d2e,metalness:.6,roughness:.72,roughnessMap:RM}),
  anod:std({color:0x2a2b2d,metalness:.45,roughness:.58,roughnessMap:RM}),
  scope:std({color:0x141516,metalness:.4,roughness:.5,roughnessMap:RM}),
  polymer:std({color:0x28282a,metalness:0,roughness:.62,bumpMap:STIP,bumpScale:.00016}),
  polySmooth:std({color:0x2a2a2c,metalness:0,roughness:.48}),
  grip:std({color:0x262628,metalness:0,roughness:.78,bumpMap:STIP,bumpScale:.00028}),
  walnut:phy({map:WAL,roughness:.45,clearcoat:.55,clearcoatRoughness:.22}),
  walnutChk:phy({map:WAL,roughness:.55,bumpMap:CHK,bumpScale:.00032,clearcoat:.3,clearcoatRoughness:.4}),
  brass:std({color:0xe0b45e,metalness:1,roughness:.2,roughnessMap:RM}),
  brassSpent:std({color:0xc39a4a,metalness:1,roughness:.32,roughnessMap:RM}),
  copper:std({color:0xc97c46,metalness:1,roughness:.24}),
  nickel:std({color:0xd3d3cc,metalness:1,roughness:.2}),
  dark:std({color:0x070707,metalness:.3,roughness:.8}),
  bore:std({color:0x010101,metalness:0,roughness:1}),
  carrier:std({color:0x8e9194,metalness:1,roughness:.3,roughnessMap:RM}),
  rubber:std({color:0x111111,metalness:0,roughness:.92}),
  white:std({color:0xf4f4f0,emissive:0x2a2a2a,roughness:.4}),
  red:std({color:0xd8180f,emissive:0x5a0400,roughness:.35}),
  hull:std({color:0x9a1c15,roughness:.5}),
  hullIn:std({color:0x2a0806,roughness:.9,side:T.DoubleSide}),
  lens:phy({color:0x16303c,metalness:.2,roughness:.03,clearcoat:1,clearcoatRoughness:.02,transparent:true,opacity:.82}),
  alum:std({color:0xa9abae,metalness:1,roughness:.32}),
  fde:std({color:0x8b7355,metalness:0,roughness:.62,bumpMap:STIP,bumpScale:.00016}),fdeGrip:std({color:0x86704f,metalness:0,roughness:.78,bumpMap:STIP,bumpScale:.00028}),
  bake:phy({color:0x6b2a14,roughness:.4,clearcoat:.4}),anodD:std({color:0x2a2b2d,metalness:.45,roughness:.58,side:T.DoubleSide}),
  lensC:phy({color:0x9fc8d8,metalness:0,roughness:0,transparent:true,opacity:.12,depthWrite:false,clearcoat:1})
};

/* ---------- geometry helpers ---------- */
const P2=a=>a.map(p=>new T.Vector2(p[0],p[1]));
function smoothN(g,ang){const p=g.attributes.position,cnt=p.count,fn=new Float32Array(cnt*3),a=new V3(),b=new V3(),cc=new V3();
  for(let i=0;i<cnt;i+=3){a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,i+1);cc.fromBufferAttribute(p,i+2);b.sub(a);cc.sub(a);b.cross(cc).normalize();for(let k=0;k<3;k++){fn[(i+k)*3]=b.x;fn[(i+k)*3+1]=b.y;fn[(i+k)*3+2]=b.z}}
  const map=new Map();for(let i=0;i<cnt;i++){const k=Math.round(p.getX(i)*2e5)+','+Math.round(p.getY(i)*2e5)+','+Math.round(p.getZ(i)*2e5);let l=map.get(k);if(!l)map.set(k,l=[]);l.push(i)}
  const cs=Math.cos(ang),out=new Float32Array(cnt*3);map.forEach(l=>{for(const i of l){let x=0,y=0,z=0;for(const j of l){if(fn[i*3]*fn[j*3]+fn[i*3+1]*fn[j*3+1]+fn[i*3+2]*fn[j*3+2]>=cs){x+=fn[j*3];y+=fn[j*3+1];z+=fn[j*3+2]}}const L=Math.hypot(x,y,z)||1;out[i*3]=x/L;out[i*3+1]=y/L;out[i*3+2]=z/L}});
  g.setAttribute('normal',new T.BufferAttribute(out,3));return g}
function ext(pts,d,mat,o){o=o||{};const sh=new T.Shape(P2(pts));(o.holes||[]).forEach(h=>sh.holes.push(new T.Path(P2(h))));const b=o.bev!=null?o.bev:Math.min(.0012,d*.18);
  const g=new T.ExtrudeGeometry(sh,{depth:Math.max(.0002,d-2*b),bevelEnabled:b>0,bevelThickness:b,bevelSize:b*.8,bevelSegments:o.seg||3,curveSegments:6,steps:1});g.translate(0,0,-(d-2*b)/2);smoothN(g,o.ang||.62);
  const m=new T.Mesh(g,mat);if(o.z)m.position.z=o.z;return m}
const rbox=(x0,y0,x1,y1,d,mat,z,bev)=>ext([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],d,mat,{z,bev:bev==null?Math.min(.0006,d*.2,(x1-x0)*.2,(y1-y0)*.2):bev});
const bxm=(w,h,d,mat,x,y,z)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);return m};
function cyl(rb,rf,x0,x1,y,z,mat,seg,open){const g=new T.CylinderGeometry(rf,rb,x1-x0,seg||28,1,!!open);g.rotateZ(-PI/2);const m=new T.Mesh(g,mat);m.position.set((x0+x1)/2,y||0,z||0);return m}
function cylZ(r,len,x,y,z,mat,seg){const g=new T.CylinderGeometry(r,r,len,seg||16);g.rotateX(PI/2);const m=new T.Mesh(g,mat);m.position.set(x,y,z);return m}
function cylY(r,len,x,y,z,mat,seg){const m=new T.Mesh(new T.CylinderGeometry(r,r,len,seg||20),mat);m.position.set(x,y,z);return m}
function discX(r,x,y,z,mat,dir){const g=new T.CircleGeometry(r,24);g.rotateY(dir>0?PI/2:-PI/2);const m=new T.Mesh(g,mat);m.position.set(x,y,z);return m}
const arc=(cx,cy,r,a0,a1,n)=>{const o=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;o.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}return o};
const circ=(cx,cy,r,n)=>arc(cx,cy,r,0,PI*2*(1-1/n),n-1);
const grp=(p,x,y,z)=>{const g=new T.Group();g.position.set(x||0,y||0,z||0);if(p)p.add(g);return g};

/* ---------- ammunition ---------- */
const CAL={
  '9':{n:'9×19mm',len:.0192,r:.00495,rim:.00495,bl:.0105,br:.00452,f:3900,nose:1},
  '45':{n:'.45 ACP',len:.0228,r:.00605,rim:.0060,bl:.0121,br:.0057,f:3200,nose:1.2},
  '357':{n:'.357 Magnum',len:.033,r:.0048,rim:.0056,rimmed:1,bl:.0115,br:.00455,f:3500,nose:.8},
  '12':{n:'12 gauge',len:.07,r:.0104,rim:.0112,shell:1,f:900},
  '556':{n:'5.56×45mm',len:.0447,r:.0048,rim:.0048,neck:.0032,sh:.79,bl:.019,br:.0029,f:3100,nose:.35},
  '308':{n:'.308 Win',len:.0512,r:.006,rim:.006,neck:.0043,sh:.77,bl:.029,br:.0039,f:2500,nose:.4},
  '50ae':{n:'.50 AE',len:.0327,r:.00685,rim:.0068,bl:.015,br:.0064,f:2600,nose:1},
  '44':{n:'.44 Magnum',len:.0328,r:.0057,rim:.0065,rimmed:1,bl:.013,br:.0054,f:3000,nose:.9},
  '38':{n:'.38 Special',len:.0292,r:.0048,rim:.0056,rimmed:1,bl:.0115,br:.0045,f:3500,nose:.9},
  '762':{n:'7.62×39mm',len:.0386,r:.0056,rim:.0057,neck:.0043,sh:.78,bl:.0268,br:.0039,f:2800,nose:.45},
  '3030':{n:'.30-30 Win',len:.0513,r:.0053,rim:.0064,rimmed:1,neck:.0039,sh:.8,bl:.02,br:.0039,f:2700,nose:1.1},
  '3006':{n:'.30-06',len:.0634,r:.006,rim:.006,neck:.0043,sh:.8,bl:.029,br:.0039,f:2400,nose:.4},
  '50bmg':{n:'.50 BMG',len:.099,r:.0101,rim:.0102,neck:.0071,sh:.76,bl:.058,br:.0065,f:1500,nose:.4}};
const GEO={};
function caseGeo(k,spent){const key=k+(spent?'s':'l');if(GEO[key])return GEO[key];const C=CAL[k],r=C.r,L=C.len,rim=C.rim,P=[[0,0],[rim*.96,0],[rim,.0004],[rim,.0011]];
  if(C.rimmed)P.push([r,.0014]);else P.push([r*.84,.0015],[r*.84,.0026],[r,.0031]);
  if(C.neck){const sh=L*C.sh;P.push([r*.985,sh],[C.neck*1.03,sh+(r-C.neck)*1.25],[C.neck,L])}else P.push([r*.985,L]);
  const mr=(C.neck||r*.985)-.00042;P.push([mr,L],[mr,L-.0005]);if(spent)P.push([mr*.96,L*.4],[0,L*.4]);else P.push([0,L-.0005]);
  const g=new T.LatheGeometry(P2(P),22);g.translate(0,-L/2,0);return GEO[key]=g}
function bulletGeo(k){const key=k+'b';if(GEO[key])return GEO[key];const C=CAL[k],b=C.br,L=C.bl,P=[[0,0],[b,0]],base=L*.42;P.push([b,base]);for(let i=1;i<=8;i++){const t=i/8;P.push([Math.max(b*.08,b*Math.pow(Math.cos(t*PI/2),C.nose)),base+(L-base)*Math.sin(t*PI/2)])}P.push([0,L]);const g=new T.LatheGeometry(P2(P),20);return GEO[key]=g}
function caseMesh(k,spent){const C=CAL[k],g=new T.Group();
  if(C.shell){const L=C.len,hd=new T.Mesh(new T.LatheGeometry(P2([[0,0],[.0112,0],[.0112,.0013],[.0106,.0016],[.0106,.013],[.0104,.0136],[.0098,.0136],[.0098,.004],[0,.004]]),24),MT.brass);hd.position.y=-L/2;g.add(hd);
    const hl=new T.Mesh(new T.CylinderGeometry(spent?.0108:.0104,.0104,L-.0135,24,1,true),MT.hull);hl.position.y=-L/2+.0135+(L-.0135)/2;g.add(hl);
    const inn=new T.Mesh(new T.CylinderGeometry(.0096,.0096,L-.014,16,1,true),MT.hullIn);inn.position.copy(hl.position);g.add(inn);
    if(!spent){const cap=new T.Mesh(new T.CircleGeometry(.0104,24),MT.hull);cap.rotation.x=-PI/2;cap.position.y=L/2-.001;g.add(cap);for(let i=0;i<6;i++){const s=bxm(.0003,.0002,.0095,MT.hullIn,0,L/2-.0008,0);s.rotation.y=i*PI/6;g.add(s)}}
  }else{g.add(new T.Mesh(caseGeo(k,spent),spent?MT.brassSpent:MT.brass));const pr=new T.Mesh(new T.CircleGeometry(C.r*.42,16),MT.nickel);pr.rotation.x=PI/2;pr.position.y=-C.len/2-.00005;g.add(pr);
    if(!spent){const b=new T.Mesh(bulletGeo(k),MT.copper);b.position.y=C.len/2-C.bl*.4;g.add(b)}}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
function roundX(k){const w=new T.Group(),r=caseMesh(k,false);r.rotation.z=-PI/2;w.add(r);w.userData.len=CAL[k].len;return w}

/* ---------- gun models (x forward, y up, metres) ---------- */
function finish(g){g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return g}
function sights3(S,x,y,mat,dots){const f=bxm(.0032,.0052,.0034,mat,x,y+.0026,0);S.add(f);if(dots){S.add(discX(.0009,x-.0018,y+.0032,0,dots,-1))}}
function build1911(){const g=new T.Group(),F=grp(g),S=grp(g),M=MT;
  S.add(ext([[-.034,.001],[.182,.001],[.182,.026],[.1795,.0285],[-.031,.0285],[-.034,.025]],.0232,M.blued,{bev:.0012}));
  for(let i=0;i<8;i++){const x=-.031+i*.0024;[1,-1].forEach(s=>S.add(rbox(x,.003,x+.001,.024,.0006,M.dark,s*.0118,.0001)))}
  S.add(rbox(.032,.012,.074,.0265,.0008,M.dark,.0118,.0002));
  S.add(ext([[.168,.028],[.176,.028],[.176,.0335],[.1732,.0335]],.0028,M.blued,{bev:.0003}));S.add(discX(.0007,.1729,.0322,0,M.white,-1));
  [1,-1].forEach(s=>{S.add(bxm(.0065,.0052,.0066,M.blued,-.02,.0308,s*.0058))});S.add(bxm(.0065,.0012,.0232,M.blued,-.02,.0288,0));
  S.add(cyl(.0085,.0085,.1795,.1838,.016,0,M.blued));S.add(cyl(.0046,.0046,.181,.1836,.0045,0,M.blued));
  F.add(cyl(.0072,.0072,.03,.1845,.016,0,M.stainless));F.add(discX(.0057,.18455,.016,0,M.bore,1));
  F.add(ext([[-.034,-.012],[.090,-.012],[.098,-.007],[.103,.0008],[-.034,.0008]],.0232,M.blued,{bev:.001}));
  F.add(ext([[.012,-.010],[.058,-.010],...arc(.046,-.030,.021,.95,-PI/2,8),[.013,-.051]],.011,M.blued,{holes:[[[.016,-.014],[.050,-.014],...arc(.044,-.030,.0155,.9,-PI/2,8),[.017,-.046]]],bev:.0012}));
  F.add(ext([[.014,-.010],[.013,-.030],[.010,-.050],[.004,-.075],[-.003,-.100],[-.008,-.1215],[-.046,-.1235],[-.043,-.100],[-.038,-.070],[-.033,-.040],[-.031,-.024],[-.040,-.020],[-.051,-.0165],[-.049,-.010],[-.034,-.006]],.0228,M.blued,{bev:.0012}));
  [1,-1].forEach(s=>{F.add(ext([[.0065,-.028],[.002,-.054],[-.003,-.080],[-.0065,-.112],[-.040,-.114],[-.036,-.082],[-.0325,-.052],[-.030,-.030]],.0036,M.walnutChk,{bev:.0011,z:s*.0132}));
    [[-.012,-.040],[-.021,-.101]].forEach(([x,y])=>F.add(cylZ(.0028,.0012,x,y,s*.0153,M.stainless)))});
  F.add(ext([[.030,-.0065],[.050,-.0065],[.053,-.002],[.050,.0008],[.030,.0008]],.0016,M.blued,{z:-.0125,bev:.0004}));F.add(cylZ(.0022,.001,.036,-.003,.0121,M.blued));
  const TR=grp(F,.021,-.013,0);TR.add(ext([[-.002,0],[.004,0],[.0045,-.019],[.001,-.022],[-.0025,-.019]],.0055,M.alum,{bev:.0006}));
  const HM=grp(F,-.037,-.004,0);HM.add(ext([[-.0035,-.004],[.0035,-.004],[.0038,.004],[.0025,.013],[-.001,.017],[-.006,.018],[-.0095,.0155],[-.0065,.0115],[-.004,.0045]],.0075,M.blued,{holes:[circ(-.0022,.0118,.0022,10)],bev:.0007}));
  const SF=grp(F,-.026,-.0085,-.0128);SF.add(ext([[-.003,-.003],[.003,-.003],[.018,.0005],[.020,.003],[.004,.003],[-.003,.002]],.0022,M.blued,{bev:.0005}));
  const MG=grp(g);MG.add(ext([[-.0455,-.1235],[-.0075,-.1215],[-.0065,-.1275],[-.0455,-.1295]],.0215,M.blued,{bev:.0008}));MG.add(ext([[-.0455,-.1295],[-.0065,-.1275],[-.0065,-.1325],[-.0455,-.1345]],.02,M.rubber,{bev:.0015}));
  MG.add(ext([[-.041,-.012],[-.0155,-.012],[-.0085,-.1215],[-.0445,-.1235]],.0200,M.blued,{bev:.0005}));const tr=roundX('45');tr.position.set(-.03,-.0075,0);MG.add(tr);MG.userData.top=tr;
  return finish(Object.assign(g,{P:{slide:S,trig:TR,hammer:HM,safety:SF,mag:MG}}))}
function buildAR(){const g=new T.Group(),F=grp(g),M=MT;
  F.add(ext([[-.098,-.0125],[.088,-.0125],[.088,.0195],[-.093,.0195],[-.098,.012]],.0265,M.anod,{bev:.0012}));
  const rail=(x0,x1)=>{F.add(rbox(x0,.0195,x1,.0235,.0158,M.anod,0,.0005));for(let x=x0+.004;x<x1-.004;x+=.01)F.add(bxm(.0052,.0034,.021,M.anod,x,.0251,0))};rail(-.093,.088);
  F.add(rbox(-.030,-.003,.032,.0115,.0006,M.dark,.0135,.0001));const CA=rbox(-.028,-.001,.030,.0095,.0005,M.carrier,.0138,.0001);F.add(CA);
  const DC=grp(F,0,-.0045,.0142);DC.add(rbox(-.032,.0005,.034,.0165,.0009,M.anod,0,.0003));
  F.add(cylZ(.0045,.012,-.068,.009,.016,M.anod));F.add(cylZ(.0036,.004,-.068,.009,.023,M.nitride));
  const CH=grp(F);CH.add(rbox(-.110,.0135,-.090,.0205,.012,M.anod,0,.0006));CH.add(bxm(.008,.004,.036,M.anod,-.104,.017,0));
  F.add(ext([[-.098,-.0125],[.078,-.0125],[.078,-.026],[.066,-.030],[.0645,-.0565],[.0265,-.0565],[.025,-.0345],[-.010,-.0345],[-.030,-.040],[-.062,-.040],[-.080,-.030],[-.098,-.025]],.0245,M.anod,{bev:.0012}));
  F.add(ext([[.0245,-.0345],[.029,-.0345],[.0255,-.052],[-.030,-.050],[-.032,-.045],[.020,-.047]],.0115,M.anod,{bev:.0008}));
  const TR=grp(F,-.002,-.034,0);TR.add(ext([[-.002,0],[.003,0],[.0045,-.007],[.003,-.0135],[-.0005,-.0165],[-.003,-.015],[-.0005,-.0095],[-.001,-.003]],.0055,M.nitride,{bev:.0006}));
  F.add(ext([[-.030,-.036],[-.011,-.036],[-.016,-.050],[-.023,-.068],[-.030,-.090],[-.034,-.107],[-.037,-.112],[-.066,-.113],[-.064,-.097],[-.056,-.075],[-.050,-.052],[-.049,-.040]],.030,M.grip,{bev:.004}));
  const SF=grp(F,-.030,-.024,-.0128);SF.add(ext([[-.0025,-.0025],[.0025,-.0025],[.012,-.0015],[.013,.0015],[.0025,.0025],[-.0025,.0025]],.002,M.nitride,{bev:.0004}));
  F.add(cylZ(.0042,.003,.02,-.024,.0135,M.nitride));F.add(rbox(.004,-.022,.014,-.012,.002,M.nitride,-.0132));
  F.add(cyl(.0148,.0148,-.255,-.098,.004,0,M.anod,24));F.add(cyl(.017,.017,-.107,-.098,.004,0,M.nitride,12));
  F.add(ext([[-.185,.021],[-.262,.0275],[-.272,.026],[-.285,-.012],[-.285,-.087],[-.271,-.090],[-.216,-.022],[-.190,-.017]],.040,M.polySmooth,{bev:.005}));F.add(ext([[-.2845,-.010],[-.2935,-.010],[-.2935,-.088],[-.2845,-.088]],.039,M.rubber,{bev:.003}));
  const hg=new T.Mesh(new T.CylinderGeometry(.021,.021,.20,8),M.anod);hg.geometry.rotateY(PI/8);hg.geometry.rotateZ(-PI/2);hg.position.set(.188,.002,0);F.add(hg);
  [.10,.135,.17,.205,.24].forEach(x=>{[1,-1].forEach(s=>F.add(rbox(x,-.0025,x+.02,.0045,.001,M.dark,s*.0196,.0002)))});
  F.add(rbox(.09,.0185,.285,.0225,.0158,M.anod,0,.0005));for(let x=.094;x<.281;x+=.01)F.add(bxm(.0052,.0034,.021,M.anod,x,.0241,0));
  F.add(cyl(.0098,.0098,.288,.372,0,0,M.parker,24));F.add(cyl(.011,.011,.372,.412,0,0,M.parker,24));F.add(bxm(.024,.0005,.0035,M.dark,.393,.0111,0));[1,-1].forEach(s=>F.add(bxm(.024,.0035,.0005,M.dark,.393,0,s*.0111)));F.add(discX(.0078,.4121,0,0,M.bore,1));
  F.add(rbox(-.012,.0235,.038,.037,.020,M.anod,0,.001));F.add(cyl(.0145,.0145,-.018,.032,.052,0,M.anodD,28,1));F.add(cyl(.0158,.0158,.030,.041,.052,0,M.anodD,28,1));
  F.add(discX(.0118,.0412,.052,0,M.lensC,1));F.add(discX(.0118,-.0182,.052,0,M.lensC,-1));F.add(cylY(.0065,.008,.010,.0695,0,M.anod));F.add(cylZ(.0065,.008,.010,.052,.0175,M.anod));
  const MG=grp(g);MG.add(ext([[.0275,-.013],[.0635,-.013],[.0645,-.058],[.0705,-.098],[.080,-.138],[.091,-.172],[.0525,-.183],[.0435,-.148],[.0345,-.108],[.029,-.068]],.0225,M.polymer,{bev:.0012}));
  MG.add(ext([[.0515,-.182],[.092,-.171],[.094,-.178],[.0525,-.1895]],.0245,M.polymer,{bev:.0012}));const tr=roundX('556');tr.position.set(.046,-.0105,0);MG.add(tr);MG.userData.top=tr;
  return finish(Object.assign(g,{P:{carrier:CA,dust:DC,chandle:CH,trig:TR,safety:SF,mag:MG}}))}
function buildBolt(){const g=new T.Group(),F=grp(g),M=MT;
  F.add(cyl(.017,.017,-.112,.098,0,0,M.blued,32));F.add(rbox(-.075,.015,-.050,.0215,.012,M.blued,0,.0008));F.add(rbox(.050,.015,.078,.0215,.012,M.blued,0,.0008));
  const pg=new T.CylinderGeometry(.01715,.01715,.068,18,1,true,-1.05,1.3);pg.rotateZ(-PI/2);const port=new T.Mesh(pg,M.dark);port.position.x=-.036;F.add(port);
  const B=grp(F);B.add(cyl(.0093,.0093,-.112,.03,0,0,M.carrier,20));B.add(cyl(.0125,.011,-.138,-.112,0,0,M.blued,24));B.add(cyl(.003,.003,-.145,-.138,0,0,M.red,10));
  const HS=grp(B,-.100,0,0);HS.rotation.x=.45;const st=new T.Mesh(new T.CylinderGeometry(.0034,.0046,.05,12),M.blued);st.geometry.rotateX(PI/2);st.position.z=.026;HS.add(st);const kn=new T.Mesh(new T.SphereGeometry(.0095,18,14),M.blued);kn.position.set(-.004,0,.052);HS.add(kn);
  F.add(cyl(.0148,.0098,.098,.66,0,0,M.blued,32));F.add(discX(.0039,.6601,0,0,M.bore,1));
  F.add(ext([[.40,-.0075],[.405,-.020],[.398,-.034],[.30,-.040],[.13,-.044],[.035,-.047],[-.045,-.048],[-.075,-.046],[-.094,-.062],[-.104,-.086],[-.112,-.102],[-.140,-.1045],[-.148,-.084],[-.172,-.072],[-.30,-.096],[-.45,-.126],[-.558,-.147],[-.566,-.142],[-.566,-.012],[-.54,-.0025],[-.36,.003],[-.22,-.001],[-.16,-.009],[-.125,-.011],[.10,-.009]],.042,M.walnut,{bev:.008}));
  F.add(ext([[-.566,-.011],[-.585,-.011],[-.585,-.144],[-.566,-.143]],.043,M.rubber,{bev:.005}));
  F.add(ext([[-.070,-.045],[.035,-.045],[.035,-.050],[.010,-.050],[.004,-.064],[-.010,-.071],[-.050,-.071],[-.062,-.062],[-.070,-.050]],.013,M.blued,{holes:[[[-.052,-.0505],[0,-.0505],[-.003,-.061],[-.013,-.066],[-.046,-.066],[-.054,-.058]]],bev:.001}));
  const TR=grp(F,-.022,-.046,0);TR.add(ext([[-.002,0],[.003,0],[.0045,-.008],[.0035,-.015],[.0005,-.0185],[-.0025,-.017],[-.0005,-.011],[-.001,-.004]],.0055,M.blued,{bev:.0006}));
  const SF=grp(F,-.125,.004,.012);SF.add(rbox(-.004,-.002,.006,.002,.002,M.blued,0,.0005));
  [[.33,-.041],[-.46,-.121]].forEach(([x,y])=>F.add(cylY(.0035,.012,x,y,0,M.blued)));
  addScope(F,.048,0,1,.0215);
  return finish(Object.assign(g,{P:{bolt:B,trig:TR,safety:SF}}))}

function buildP17(o){o=o||{};const g=new T.Group(),F=grp(g),S=grp(g),M=MT,cut=o.cut||0,gc=o.gcut||0,xm=o.xmag||0;
  const fx=x=>x>.09?x-cut:x,fy=y=>y<-.07?y+gc:y,mp=a=>a.map(([x,y])=>[fx(x),fy(y)]),mpm=a=>a.map(([x,y])=>[fx(x),y<-.1?fy(y)-xm:y]);const FM=o.frame||M.polymer,GM=o.grip||M.grip,SM=o.slide||M.nitride;
  S.add(ext(mp([[-.030,.001],[.156,.001],[.156,.021],[.149,.029],[-.027,.029],[-.030,.026]]),.0254,SM,{bev:.0011}));
  for(let i=0;i<7;i++){const x=-.0255+i*.0027;[1,-1].forEach(s=>S.add(rbox(x,.004,x+.0011,.025,.0006,M.dark,s*.0129,.0001)))}
  S.add(rbox(.030,.0135,.072,.0285,.0008,M.dark,.0128,.0002));S.add(bxm(.042,.0006,.0128,M.dark,.051,.0292,.0064));
  S.add(rbox(.022,.017,.031,.0215,.0012,SM,.0131,.0003));
  sights3(S,fx(.146),.029,SM,M.white);
  S.add(bxm(.008,.0015,.021,SM,-.018,.0297,0));[1,-1].forEach(s=>{S.add(bxm(.008,.0055,.0046,SM,-.018,.0318,s*.0056));S.add(discX(.0008,-.0221,.0328,s*.0056,M.white,-1))});
  S.add(discX(.0042,fx(.1562),.005,0,M.bore,1));
  const BE=fx(.1565);F.add(cyl(.0068,.0068,.04,BE,.0165,0,M.nitride));F.add(discX(.0046,BE+.00005,.0165,0,M.bore,1));F.add(cyl(.0032,.0032,.03,fx(.1555),.005,0,M.polySmooth,14));
  if(o.supp){F.add(cyl(.0056,.0056,BE,BE+.01,.0165,0,M.nitride,20));F.add(cyl(.0152,.0152,BE+.008,BE+.178,.0165,0,M.anod,36));F.add(cyl(.0156,.0156,BE+.008,BE+.022,.0165,0,M.anod,36));F.add(cyl(.0156,.0156,BE+.164,BE+.178,.0165,0,M.anod,36));F.add(discX(.005,BE+.1785,.0165,0,M.bore,1))}
  if(o.auto)S.add(rbox(-.029,.016,-.021,.022,.0014,M.polySmooth,-.0132,.0003));
  F.add(ext(mp([[-.028,-.013],[.146,-.013],[.150,-.009],[.150,.0008],[-.028,.0008]]),.0236,FM,{bev:.0012}));
  [.105,.118,.131].map(fx).forEach(x=>F.add(bxm(.0035,.0012,.018,M.dark,x,-.0137,0)));
  F.add(ext([[.008,-.010],[.063,-.010],[.064,-.030],[.059,-.041],[.050,-.044],[.012,-.045]],.0105,FM,{holes:[[[.013,-.0135],[.0575,-.0135],[.0585,-.030],[.054,-.0385],[.017,-.039]]],bev:.0015}));
  F.add(ext(mp([[.012,-.012],[.011,-.026],[.008,-.044],[.004,-.052],[.005,-.060],[0,-.068],[-.001,-.076],[-.004,-.080],[-.004,-.088],[-.008,-.093],[-.010,-.108],[-.014,-.119],[-.050,-.121],[-.049,-.108],[-.045,-.086],[-.039,-.060],[-.034,-.038],[-.032,-.026],[-.035,-.019],[-.043,-.015],[-.045,-.011],[-.028,-.009]]),.0295,GM,{bev:.0026}));
  F.add(rbox(.028,-.0035,.044,.0005,.0012,M.nitride,-.0124));F.add(bxm(.007,.004,.0262,M.nitride,.0605,-.005,0));F.add(bxm(.006,.008,.0026,M.polySmooth,.011,-.017,-.0155));
  const TR=grp(F,.037,-.0135,0);TR.add(ext([[-.0015,.001],[.003,.001],[.0055,-.006],[.0045,-.014],[.0012,-.0205],[-.0022,-.0215],[-.0006,-.015],[.0004,-.007],[-.0025,-.0005]],.0062,M.polySmooth,{bev:.0008}));TR.add(ext([[.0035,-.006],[.0063,-.007],[.0055,-.0155],[.0028,-.0155]],.0022,M.polySmooth,{bev:.0003}));
  const MG=grp(g);MG.add(ext(mpm([[-.051,-.1205],[-.0135,-.1185],[-.0125,-.1285],[-.0505,-.1305]]),.0262,FM,{bev:.0015}));MG.add(ext(mpm([[-.043,-.010],[-.017,-.010],[-.0142,-.119],[-.0485,-.121]]),.021,M.polySmooth,{bev:.0006}));const tr=roundX('9');tr.position.set(-.028,-.0065,0);MG.add(tr);MG.userData.top=tr;
  return finish(Object.assign(g,{P:{slide:S,trig:TR,mag:MG}}))}
function buildM9(){const g=new T.Group(),F=grp(g),S=grp(g),M=MT;
  S.add(ext([[-.034,.001],[.180,.001],[.180,.0245],[.1765,.0265],[.164,.0265],[.158,.0185],[.042,.0185],[.035,.0285],[-.031,.0285],[-.034,.025]],.0232,M.nitride,{bev:.0011}));
  for(let i=0;i<8;i++){const x=-.031+i*.0024;[1,-1].forEach(s=>S.add(rbox(x,.003,x+.001,.024,.0006,M.dark,s*.0118,.0001)))}
  S.add(ext([[.168,.0265],[.1755,.0265],[.1755,.0335],[.1725,.0335]],.0028,M.nitride,{bev:.0003}));S.add(discX(.0007,.1722,.0322,0,M.white,-1));
  [1,-1].forEach(s=>{S.add(bxm(.0065,.0052,.0066,M.nitride,-.02,.0308,s*.0058));S.add(discX(.0007,-.0233,.0318,s*.0058,M.white,-1))});S.add(bxm(.0065,.0012,.0232,M.nitride,-.02,.0288,0));
  const SF=grp(S,-.022,.021,-.0128);SF.add(ext([[-.004,-.003],[.004,-.003],[.006,.002],[.0,.004],[-.012,.003],[-.013,-.001]],.0024,M.nitride,{bev:.0005}));
  F.add(cyl(.0072,.0072,.03,.1802,.016,0,M.nitride));F.add(discX(.0046,.18025,.016,0,M.bore,1));
  F.add(ext([[-.034,-.012],[.172,-.012],[.178,-.006],[.178,.0008],[-.034,.0008]],.0226,M.anod,{bev:.001}));
  F.add(ext([[.012,-.010],[.062,-.010],...arc(.050,-.031,.021,.95,-PI/2,8),[.013,-.052]],.011,M.anod,{holes:[[[.016,-.014],[.054,-.014],...arc(.048,-.031,.0155,.9,-PI/2,8),[.017,-.047]]],bev:.0012}));
  F.add(ext([[.014,-.010],[.013,-.030],[.010,-.050],[.004,-.075],[-.003,-.100],[-.008,-.1235],[-.048,-.1255],[-.046,-.100],[-.041,-.070],[-.036,-.040],[-.034,-.024],[-.040,-.016],[-.041,-.008],[-.034,-.006]],.0232,M.anod,{bev:.0014}));
  [1,-1].forEach(s=>F.add(ext([[.0065,-.026],[.002,-.054],[-.003,-.080],[-.0065,-.114],[-.042,-.116],[-.039,-.082],[-.035,-.052],[-.032,-.028]],.0038,M.grip,{bev:.0012,z:s*.0136})));
  const TR=grp(F,.03,-.0135,0);TR.add(ext([[-.0015,.001],[.003,.001],[.0055,-.006],[.0045,-.014],[.0012,-.0205],[-.0022,-.0215],[-.0006,-.015],[.0004,-.007],[-.0025,-.0005]],.0062,M.nitride,{bev:.0008}));
  const HM=grp(F,-.037,-.004,0);HM.add(ext([[-.0035,-.004],[.0035,-.004],[.0038,.004],[.0025,.013],[-.001,.017],[-.006,.018],[-.0095,.0155],[-.0065,.0115],[-.004,.0045]],.0075,M.nitride,{holes:[circ(-.0022,.0118,.0022,10)],bev:.0007}));
  const MG=grp(g);MG.add(ext([[-.049,-.1255],[-.0075,-.1235],[-.0065,-.1305],[-.049,-.1325]],.022,M.polymer,{bev:.0012}));MG.add(ext([[-.042,-.012],[-.0155,-.012],[-.0085,-.1235],[-.046,-.1255]],.021,M.nitride,{bev:.0005}));const tr=roundX('9');tr.position.set(-.03,-.0075,0);MG.add(tr);MG.userData.top=tr;
  return finish(Object.assign(g,{P:{slide:S,trig:TR,hammer:HM,safety:SF,mag:MG}}))}
function buildDE(){const g=new T.Group(),F=grp(g),S=grp(g),M=MT,st=M.stainless;
  F.add(ext([[.028,.006],[.236,.006],[.236,.033],[.231,.0385],[.028,.0385]],.0245,st,{bev:.0012}));F.add(bxm(.19,.0006,.004,M.dark,.13,.0389,0));F.add(discX(.0064,.2362,.02,0,M.bore,1));
  [1,-1].forEach(s=>F.add(bxm(.16,.003,.0005,M.dark,.14,.012,s*.01235)));
  F.add(ext([[.218,.0385],[.228,.0385],[.228,.0455],[.2245,.0455]],.004,M.nitride,{bev:.0004}));
  S.add(ext([[-.05,.003],[.032,.003],[.032,.039],[-.046,.039],[-.05,.034]],.0305,st,{bev:.0014}));
  for(let i=0;i<8;i++){const x=-.046+i*.0026;[1,-1].forEach(s=>S.add(rbox(x,.007,x+.0011,.034,.0006,M.dark,s*.0155,.0001)))}
  S.add(rbox(-.018,.02,.026,.036,.0008,M.dark,.0153,.0002));
  [1,-1].forEach(s=>S.add(bxm(.008,.006,.0065,M.nitride,-.04,.042,s*.006)));S.add(bxm(.008,.0015,.024,M.nitride,-.04,.0398,0));
  const SF=grp(S,-.036,.03,-.0158);SF.add(ext([[-.004,-.003],[.004,-.003],[.006,.002],[0,.004],[-.012,.003],[-.013,-.001]],.0026,M.nitride,{bev:.0005}));
  F.add(ext([[-.048,-.016],[.16,-.016],[.172,-.004],[.172,.004],[-.048,.004]],.027,st,{bev:.0014}));
  F.add(ext([[.012,-.014],[.078,-.014],[.079,-.040],[.071,-.056],[.016,-.058]],.012,st,{holes:[[[.018,-.019],[.071,-.019],[.072,-.038],[.066,-.050],[.021,-.051]]],bev:.0015}));
  F.add(ext([[.016,-.014],[.012,-.04],[.003,-.08],[-.005,-.12],[-.011,-.143],[-.060,-.146],[-.058,-.12],[-.052,-.08],[-.046,-.048],[-.045,-.026],[-.056,-.02],[-.058,-.01],[-.048,-.006]],.034,M.grip,{bev:.004}));
  const TR=grp(F,.045,-.018,0);TR.add(ext([[-.0015,.001],[.003,.001],[.0055,-.006],[.0045,-.014],[.0012,-.0205],[-.0022,-.0215],[-.0006,-.015],[.0004,-.007],[-.0025,-.0005]],.0068,M.nitride,{bev:.0008}));
  const HM=grp(F,-.054,.0,0);HM.add(ext([[-.0042,-.005],[.0042,-.005],[.0045,.005],[.003,.016],[-.001,.02],[-.007,.0215],[-.0115,.0185],[-.0078,.014],[-.0048,.0055]],.0085,M.nitride,{holes:[circ(-.0026,.0142,.0026,10)],bev:.0007}));
  const MG=grp(g);MG.add(ext([[-.062,-.146],[-.011,-.143],[-.010,-.153],[-.062,-.155]],.028,st,{bev:.0015}));MG.add(ext([[-.054,-.012],[-.02,-.012],[-.012,-.143],[-.058,-.146]],.024,M.nitride,{bev:.0005}));const tr=roundX('50ae');tr.position.set(-.038,-.008,0);MG.add(tr);MG.userData.top=tr;
  return finish(Object.assign(g,{P:{slide:S,trig:TR,hammer:HM,safety:SF,mag:MG}}))}
function buildRev(o){o=o||{};const g=new T.Group(),F=grp(g),M=MT,BE=o.be||.1545,FN=o.fin||M.stainless,cal=o.cal||'357',CRr=o.cr||.0118,HR=o.hr||.00485,R0=o.R0||.0196;const gy=o.small?(y=>y<-.04?-.04+(y+.04)*.72:y):(y=>y);
  F.add(ext([[-.013,.009],[-.005,.0175],[.053,.0175],[.063,.0115],[.063,-.021],[.057,-.0335],[.006,-.0335],[.003,-.036],[-.004,-.046],[-.014,-.052],[-.026,-.050],[-.032,-.040],[-.030,-.024],[-.024,-.010],[-.018,0]],.0235,FN,{holes:[[[.0075,.0085],[.0505,.0085],[.0505,-.031],[.0075,-.031]]],bev:.0015}));
  F.add(cyl(.0088,.0088,.061,BE,0,0,FN,32));F.add(rbox(.061,.0055,BE,.0112,.0085,FN,0,.0008));
  if(o.lug==='half')F.add(ext([[.061,-.004],[BE,-.004],[BE,-.009],[BE-.004,-.012],[.064,-.012]],.0105,FN,{bev:.001}));else F.add(ext([[.061,-.004],[BE,-.004],[BE,-.0145],[BE-.0045,-.0185],[.064,-.0185]],.0125,FN,{bev:.0012}));
  F.add(ext([[BE-.0185,.0105],[BE-.0045,.0105],[BE-.0045,.0172],[BE-.008,.0172]],.0034,FN,{bev:.0003}));F.add(rbox(BE-.0075,.0138,BE-.0048,.0170,.0037,M.red,0,0));
  F.add(discX(o.bore||.0046,BE+.00005,0,0,M.bore,1));[1,-1].forEach(s=>F.add(bxm(.006,.0035,.0035,M.dark,-.001,.0192,s*.0035)));F.add(bxm(.006,.0015,.011,M.dark,-.001,.0178,0));
  F.add(ext([[.004,-.031],[.047,-.031],...arc(.034,-.046,.0165,.66,-PI/2,7),[.006,-.0625]],.0095,FN,{holes:[[[.0095,-.0345],[.040,-.0345],...arc(.032,-.046,.0118,.55,-PI/2,7),[.010,-.058]]],bev:.0012}));
  F.add(ext([[-.024,-.008],[-.004,-.034],[0,-.046],[-.004,-.055],[-.001,-.064],[-.005,-.074],[-.003,-.083],[-.008,-.100],[-.013,-.116],[-.022,-.124],[-.046,-.125],[-.053,-.112],[-.052,-.090],[-.046,-.064],[-.038,-.040],[-.033,-.022]].map(([x,y])=>[x,gy(y)]),.035,o.grip||M.walnut,{bev:.0055}));
  F.add(rbox(-.004,-.001,.006,.004,.003,FN,-.0128,.0006));
  const CR=grp(F,0,-.0295,-.011),CY=grp(CR,0,-CRr+.0295,.011);
  const out=[];for(let i=0;i<96;i++){const a=i/96*PI*2;let r=R0;for(let k=0;k<6;k++){let d=Math.abs(((a-k*PI/3)+PI*3)%(PI*2)-PI);if(d<.2)r=Math.min(r,R0-.0034*Math.cos(d/.2*PI/2))}out.push([Math.cos(a)*r,Math.sin(a)*r])}
  const holes=[];for(let k=0;k<6;k++){const a=PI/2+k*PI/3;holes.push(circ(Math.cos(a)*CRr,Math.sin(a)*CRr,HR,14))}
  const cm=ext(out,.041,FN,{holes,bev:.001,ang:.9});cm.geometry.rotateY(PI/2);cm.position.x=.0292;CY.add(cm);
  CY.add(cyl(.0028,.0028,.0495,.0748,0,0,FN,12));CY.add(cyl(.0034,.0034,.0745,.0765,0,0,FN,12));
  const rounds=[];for(let k=0;k<6;k++){const a=PI/2+k*PI/3,r=roundX(cal);r.position.set(.0082+CAL[cal].len/2,Math.sin(a)*CRr,-Math.cos(a)*CRr);CY.add(r);rounds.push(r)}
  const HM=grp(F,-.009,.004,0);HM.add(ext([[-.0032,-.007],[.0032,-.007],[.0036,.004],[.0015,.011],[-.004,.0155],[-.0125,.017],[-.014,.0145],[-.0065,.0095],[-.004,.002]],.0068,FN,{bev:.0006}));
  const TR=grp(F,.019,-.031,0);TR.add(ext([[-.0022,.001],[.0028,.001],[.0048,-.008],[.0042,-.016],[.0008,-.0225],[-.0028,-.0215],[0,-.014],[.0003,-.006]],.0072,FN,{bev:.0008}));
  return finish(Object.assign(g,{P:{crane:CR,cyl:CY,rounds,hammer:HM,trig:TR,cal,cr:CRr}}))}
function buildPump(o){o=o||{};const g=new T.Group(),F=grp(g),M=MT,BE=o.be||.548,sh=.548-BE,fx=x=>x>.3?x-sh:x,WD=o.syn?M.polymer:M.walnut;
  F.add(ext([[-.125,-.035],[.078,-.035],[.078,.0165],[.070,.0215],[-.108,.0215],[-.125,.011]],.0305,M.parker,{bev:.0016}));
  F.add(rbox(-.045,-.013,.030,.015,.0008,M.dark,.0157,.0002));const BO=rbox(-.040,-.010,.025,.012,.0006,M.carrier,.0163,.0001);F.add(BO);
  F.add(bxm(.09,.0008,.018,M.dark,-.01,-.0356,0));[[-.06,-.027],[.03,-.027]].forEach(([x,y])=>[1,-1].forEach(s=>F.add(cylZ(.0024,.001,x,y,s*.0156,M.nitride))));
  F.add(cyl(.0112,.0112,.078,BE,0,0,M.parker,32));F.add(rbox(.078,.0105,fx(.540),.0135,.0055,M.parker,0,.0006));
  const bead=new T.Mesh(new T.SphereGeometry(.0023,12,10),o.syn?M.red:M.brass);bead.position.set(fx(.542),.0158,0);F.add(bead);F.add(discX(.0093,BE+.0001,0,0,M.bore,1));
  F.add(cyl(.0112,.0112,.078,fx(.505),-.0245,0,M.parker,24));F.add(cyl(.0125,.0125,fx(.505),fx(.522),-.0245,0,M.parker,24));F.add(rbox(fx(.49),-.026,fx(.51),.004,.013,M.parker,0,.001));
  const FO=grp(F);FO.add(ext([[.13,-.011],[.33,-.011],[.336,-.020],[.331,-.039],[.13,-.039],[.124,-.028]],.043,WD,{bev:.008}));
  for(let i=0;i<9;i++){const x=.15+i*.02;[1,-1].forEach(s=>FO.add(rbox(x,-.033,x+.004,-.016,.001,M.dark,s*.0222,.0002)))}
  F.add(ext([[-.085,-.034],[-.012,-.034],[-.013,-.048],[-.024,-.062],[-.070,-.062],[-.086,-.046]],.014,M.parker,{holes:[[[-.078,-.038],[-.019,-.038],[-.020,-.047],[-.028,-.057],[-.066,-.057],[-.078,-.046]]],bev:.0012}));
  const TR=grp(F,-.046,-.036,0);TR.add(ext([[-.0022,.001],[.003,.001],[.0055,-.008],[.0045,-.015],[.0008,-.0195],[-.0028,-.0185],[0,-.012],[.0003,-.005]],.0065,M.nitride,{bev:.0008}));
  const SF=cylZ(.0029,.037,-.080,-.0305,0,M.nitride,14);F.add(SF);const SR=cylZ(.003,.002,-.080,-.0305,-.0185,M.red,14);F.add(SR);
  F.add(ext([[-.1235,.0125],[-.20,.0035],[-.32,-.006],[-.455,-.0155],[-.458,-.140],[-.40,-.121],[-.30,-.091],[-.20,-.072],[-.155,-.064],[-.118,-.063],[-.100,-.055],[-.090,-.036],[-.1235,-.034]],.038,WD,{bev:.0075}));
  F.add(ext([[-.457,-.0155],[-.478,-.0165],[-.480,-.141],[-.459,-.140]],.039,M.rubber,{bev:.004}));
  let BH=null;if(o.semi){BH=grp(F);BH.add(cylZ(.0035,.012,.012,.002,.022,M.carrier,12));BH.userData.x0=0}
  if(o.saddle){const sd=grp(F,-.06,-.002,-.0175);sd.add(rbox(-.036,-.02,.036,.02,.003,M.polymer,0,.001));for(let i=0;i<4;i++){const s=roundX('12');s.rotation.z=PI/2;s.position.set(-.027+i*.018,-.02,-.013);sd.add(s)}}
  if(o.ghost){const gr=new T.Mesh(new T.TorusGeometry(.0042,.0016,8,20),M.parker);gr.rotation.y=PI/2;gr.position.set(-.1,.03,0);F.add(gr);[1,-1].forEach(s=>F.add(bxm(.014,.014,.003,M.parker,-.1,.026,s*.008)))}
  return finish(Object.assign(g,{P:{fore:FO,bolt:BO,bh:BH,trig:TR,safety:SF,sred:SR}}))}
function buildDouble(){const g=new T.Group(),F=grp(g),M=MT,HX=.058,HY=-.018,BR=grp(F,HX,HY,0),H=x=>x-HX,Y=y=>y-HY;
  [1,-1].forEach(s=>{BR.add(cyl(.0118,.0112,H(.06),H(.52),Y(0),s*.0118,M.blued,32));BR.add(discX(.0093,H(.5202),Y(0),s*.0118,M.bore,1))});
  BR.add(rbox(H(.06),Y(.006),H(.515),Y(.0135),.008,M.blued,0,.001));BR.add(rbox(H(.06),Y(-.012),H(.515),Y(-.006),.008,M.blued,0,.001));
  const bead=new T.Mesh(new T.SphereGeometry(.0022,12,10),M.brass);bead.position.set(H(.51),Y(.0155),0);BR.add(bead);
  BR.add(ext([[.07,-.010],[.26,-.010],[.265,-.018],[.255,-.032],[.075,-.032]].map(([x,y])=>[H(x),Y(y)]),.05,M.walnut,{bev:.007}));
  const L=CAL['12'].len,sx=H(.0605)+L/2,shells=[1,-1].map(s=>{const r=roundX('12');r.position.set(sx,Y(0),s*.0118);BR.add(r);return r});
  F.add(ext([[-.06,-.03],[.062,-.03],[.062,-.001],[.058,.012],[-.045,.012],[-.06,.004]],.047,M.stainless,{bev:.002}));F.add(bxm(.03,.004,.01,M.blued,-.04,.014,0));
  const hammers=[1,-1].map(s=>{const h=grp(F,-.05,.004,s*.0125);h.add(ext([[-.0032,-.007],[.0032,-.007],[.0036,.004],[.0015,.011],[-.004,.0155],[-.0125,.017],[-.014,.0145],[-.0065,.0095],[-.004,.002]],.0062,M.blued,{bev:.0006}));return h});
  F.add(ext([[-.062,-.03],[.0,-.03],[-.002,-.045],[-.015,-.058],[-.05,-.058],[-.065,-.045]],.012,M.blued,{holes:[[[-.055,-.034],[-.006,-.034],[-.008,-.044],[-.018,-.053],[-.048,-.053],[-.057,-.044]]],bev:.001}));
  const TR=grp(F,-.024,-.03,0);[1,-1].forEach(s=>TR.add(ext([[-.0022,.001],[.0028,.001],[.0048,-.008],[.0042,-.015],[.0008,-.0195],[-.0028,-.0185],[0,-.012],[.0003,-.005]].map(([x,y])=>[x+(s>0?0:-.014),y]),.004,M.blued,{bev:.0006,z:s*.004})));
  const dx=.0635;F.add(ext([[-.1235,.0125],[-.20,.0035],[-.32,-.006],[-.455,-.0155],[-.458,-.140],[-.40,-.121],[-.30,-.091],[-.20,-.072],[-.155,-.064],[-.118,-.063],[-.100,-.055],[-.090,-.036],[-.1235,-.034]].map(([x,y])=>[x+dx,y]),.04,M.walnut,{bev:.0075}));
  F.add(ext([[-.457,-.0155],[-.478,-.0165],[-.480,-.141],[-.459,-.140]].map(([x,y])=>[x+dx,y]),.041,M.rubber,{bev:.004}));
  return finish(Object.assign(g,{P:{br:BR,shells,sx,hammers,trig:TR}}))}
function buildLever(){const g=new T.Group(),F=grp(g),M=MT;
  F.add(ext([[-.075,-.028],[.07,-.028],[.07,.012],[.062,.016],[-.06,.016],[-.075,.006]],.028,M.blued,{bev:.0015}));
  F.add(rbox(.02,-.02,.05,-.008,.0008,M.nitride,.0145,.0002));F.add(bxm(.07,.0006,.012,M.dark,-.005,.0163,0));
  const BO=rbox(-.06,.008,-.01,.0168,.012,M.carrier,0,.0008);F.add(BO);
  F.add(cyl(.0115,.0085,.07,.58,0,0,M.blued,32));F.add(discX(.0039,.5801,0,0,M.bore,1));F.add(cyl(.0085,.0085,.07,.555,-.0185,0,M.blued,20));F.add(cyl(.0115,.0115,.54,.556,-.012,0,M.blued,20));
  F.add(ext([[.558,.008],[.572,.008],[.572,.0165],[.566,.0165]],.003,M.blued,{bev:.0003}));const bd=new T.Mesh(new T.SphereGeometry(.0012,10,8),M.brass);bd.position.set(.5665,.0165,0);F.add(bd);
  [1,-1].forEach(s=>F.add(ext([[.172,.009],[.188,.009],[.188,.0168],[.184,.0172],[.172,.0145]],.0028,M.blued,{bev:.0003,z:s*.0032})));F.add(bxm(.016,.003,.01,M.blued,.18,.0105,0));
  F.add(ext([[.075,-.008],[.30,-.008],[.305,-.016],[.30,-.030],[.075,-.030]],.036,M.walnut,{bev:.006}));
  F.add(ext([[-.074,.006],[-.15,-.002],[-.30,-.012],[-.43,-.02],[-.435,-.13],[-.38,-.115],[-.25,-.085],[-.13,-.06],[-.09,-.045],[-.075,-.03]],.038,M.walnut,{bev:.007}));
  F.add(ext([[-.433,-.02],[-.442,-.02],[-.443,-.131],[-.434,-.13]],.039,M.blued,{bev:.002}));
  const HM=grp(F,-.066,.006,0);HM.add(ext([[-.0032,-.007],[.0032,-.007],[.0036,.004],[.0015,.011],[-.004,.0155],[-.0125,.017],[-.014,.0145],[-.0065,.0095],[-.004,.002]],.0065,M.blued,{bev:.0006}));
  const LV=grp(F,.035,-.028,0);LV.add(ext([[.004,.003],[.004,-.006],[-.04,-.012],[-.052,-.016],[-.064,-.03],[-.07,-.048],[-.085,-.058],[-.12,-.058],[-.13,-.048],[-.12,-.036],[-.085,-.024],[-.06,-.006],[-.02,.003]],.009,M.blued,{holes:[[[-.075,-.031],[-.08,-.045],[-.09,-.052],[-.117,-.052],[-.121,-.047],[-.113,-.04],[-.086,-.031]]],bev:.001}));
  const TR=grp(F,-.03,-.028,0);TR.add(ext([[-.002,0],[.003,0],[.0045,-.007],[.003,-.013],[-.0005,-.016],[-.003,-.014],[-.0005,-.009],[-.001,-.003]],.005,M.blued,{bev:.0005}));
  return finish(Object.assign(g,{P:{lever:LV,bolt:BO,hammer:HM,trig:TR}}))}
function clipMesh(n){const g=new T.Group();g.add(rbox(-.036,-.034,.034,-.004,.013,MT.nitride,0,.0005));for(let i=0;i<n;i++){const r=roundX('3006');r.position.set(-.034+CAL['3006'].len/2,-.0045-i*.0036,(i%2?1:-1)*.0033);g.add(r)}return finish(g)}
function buildGarand(){const g=new T.Group(),F=grp(g),M=MT;
  F.add(ext([[-.11,-.018],[.10,-.018],[.10,.014],[.09,.018],[-.07,.018],[-.085,.024],[-.11,.024]],.03,M.parker,{bev:.0015}));
  const pr=new T.Mesh(new T.TorusGeometry(.0042,.0016,8,22),M.parker);pr.rotation.y=PI/2;pr.position.set(-.1,.033,0);F.add(pr);[1,-1].forEach(s=>F.add(bxm(.014,.018,.004,M.parker,-.1,.031,s*.0085)));
  const OP=grp(F);OP.add(rbox(-.04,-.004,.30,.003,.005,M.parker,.0185,.0008));OP.add(bxm(.012,.011,.012,M.parker,-.035,.004,.024));
  const BO=rbox(-.06,.012,.03,.019,.014,M.carrier,0,.0008);F.add(BO);
  F.add(cyl(.0125,.0095,.10,.61,0,0,M.parker,32));F.add(discX(.0039,.6101,0,0,M.bore,1));F.add(cyl(.0145,.0145,.54,.60,-.004,0,M.parker,24));
  F.add(ext([[.585,.0105],[.597,.0105],[.597,.030],[.592,.033],[.590,.033]],.0035,M.parker,{bev:.0003}));[1,-1].forEach(s=>F.add(bxm(.012,.016,.003,M.parker,.591,.023,s*.0065)));
  F.add(ext([[.53,-.012],[.535,-.022],[.52,-.03],[.12,-.036],[.02,-.042],[-.06,-.044],[-.09,-.06],[-.11,-.085],[-.13,-.1],[-.16,-.095],[-.2,-.085],[-.34,-.10],[-.52,-.132],[-.53,-.128],[-.53,-.012],[-.40,0],[-.25,-.002],[-.15,-.01],[-.11,-.012]],.04,M.walnut,{bev:.008}));
  F.add(ext([[-.529,-.012],[-.537,-.012],[-.538,-.133],[-.53,-.129]],.041,M.parker,{bev:.002}));
  F.add(ext([[.13,.004],[.33,.004],[.33,.0165],[.13,.0165]],.028,M.walnut,{bev:.006}));F.add(ext([[.36,.004],[.52,.004],[.52,.015],[.36,.015]],.026,M.walnut,{bev:.006}));
  [.34,.525].forEach(x=>F.add(cyl(.019,.019,x-.008,x+.008,-.006,0,M.parker,20)));
  F.add(ext([[-.06,-.042],[.02,-.042],[.02,-.048],[.005,-.06],[-.045,-.062],[-.062,-.05]],.012,M.parker,{holes:[[[-.052,-.046],[.012,-.046],[0,-.056],[-.04,-.057],[-.054,-.05]]],bev:.001}));
  const SF=grp(F,.016,-.045,0);SF.add(rbox(-.002,-.006,.004,.002,.006,M.parker,0,.0005));
  const TR=grp(F,-.02,-.04,0);TR.add(ext([[-.002,0],[.003,0],[.0045,-.007],[.003,-.013],[-.0005,-.0155],[-.003,-.014],[-.0005,-.009],[-.001,-.003]],.005,M.parker,{bev:.0005}));
  return finish(Object.assign(g,{P:{op:OP,bolt:BO,trig:TR,safety:SF}}))}
function buildAK(){const g=new T.Group(),F=grp(g),M=MT;
  F.add(ext([[-.12,-.02],[.13,-.02],[.13,.012],[.12,.016],[-.12,.016]],.028,M.parker,{bev:.0014}));F.add(rbox(-.12,.011,.10,.026,.0262,M.parker,0,.005));
  F.add(rbox(.12,.012,.165,.028,.022,M.parker,0,.002));[1,-1].forEach(s=>F.add(bxm(.012,.006,.0045,M.parker,.15,.03,s*.0043)));
  F.add(cyl(.009,.009,.165,.39,.019,0,M.parker,20));F.add(ext([[.165,.012],[.34,.012],[.34,.03],[.17,.03]],.03,M.walnut,{bev:.007}));
  F.add(ext([[.132,-.004],[.34,-.004],[.345,-.012],[.335,-.034],[.14,-.034],[.132,-.022]],.042,M.walnut,{bev:.007}));
  F.add(cyl(.011,.009,.13,.415,0,0,M.parker,24));F.add(rbox(.39,-.008,.41,.026,.02,M.parker,0,.002));F.add(bxm(.003,.008,.003,M.parker,.405,.028,0));[1,-1].forEach(s=>F.add(bxm(.012,.014,.0025,M.parker,.403,.031,s*.007)));
  F.add(cyl(.012,.012,.415,.45,0,0,M.parker,20));F.add(discX(.0038,.4502,0,0,M.bore,1));F.add(cyl(.0025,.0025,.34,.44,-.015,0,M.parker,8));
  F.add(rbox(-.02,0,.06,.0115,.0008,M.dark,.0144,.0002));const CA=rbox(-.018,.002,.058,.0105,.0006,M.carrier,.0149,.0001);F.add(CA);
  const CH=grp(F);CH.add(cylZ(.004,.02,.05,.007,.024,M.parker,12));
  const SF=grp(F,-.105,.004,.0155);SF.add(ext([[0,.004],[.12,.0015],[.12,-.004],[0,-.006]],.0018,M.parker,{bev:.0004}));
  F.add(ext([[-.035,-.02],[-.012,-.02],[-.02,-.05],[-.03,-.09],[-.036,-.105],[-.062,-.106],[-.058,-.085],[-.05,-.05],[-.048,-.03]],.028,M.bake,{bev:.004}));
  F.add(ext([[.05,-.02],[.056,-.02],[.05,-.042],[-.018,-.044],[-.02,-.04],[.044,-.038]],.011,M.parker,{bev:.0008}));
  const TR=grp(F,.015,-.02,0);TR.add(ext([[-.002,0],[.003,0],[.0045,-.007],[.003,-.0135],[-.0005,-.0165],[-.003,-.015],[-.0005,-.0095],[-.001,-.003]],.0055,M.parker,{bev:.0006}));
  F.add(ext([[-.12,.012],[-.2,0],[-.46,-.03],[-.47,-.03],[-.47,-.14],[-.46,-.14],[-.3,-.1],[-.17,-.06],[-.13,-.035],[-.12,-.02]],.038,M.walnut,{bev:.006}));F.add(ext([[-.469,-.03],[-.477,-.03],[-.477,-.141],[-.469,-.14]],.039,M.parker,{bev:.002}));
  const MG=grp(g);MG.add(ext([[.058,-.018],[.098,-.018],[.102,-.06],[.115,-.10],[.132,-.14],[.152,-.175],[.112,-.19],[.094,-.155],[.078,-.11],[.066,-.065]],.024,M.parker,{bev:.0015}));const tr=roundX('762');tr.position.set(.075,-.013,0);MG.add(tr);MG.userData.top=tr;
  return finish(Object.assign(g,{P:{carrier:CA,cx:[-.018,.058],chandle:CH,trig:TR,safety:SF,mag:MG}}))}
function buildSMG(){const g=new T.Group(),F=grp(g),M=MT;
  F.add(ext([[-.16,-.02],[.1,-.02],[.1,.026],[-.16,.026]],.03,M.parker,{bev:.006}));F.add(cyl(.0085,.0085,.1,.2,.019,0,M.parker,16));
  const CH=grp(F);CH.add(cylZ(.0035,.02,.18,.019,-.018,M.parker,10));
  F.add(ext([[.1,-.018],[.2,-.018],[.205,-.01],[.2,.012],[.1,.012]],.04,M.polymer,{bev:.008}));
  F.add(cyl(.008,.008,.2,.245,0,0,M.parker,20));F.add(discX(.0032,.2451,0,0,M.bore,1));
  const hood=new T.Mesh(new T.TorusGeometry(.0085,.0022,8,24),M.parker);hood.rotation.y=PI/2;hood.position.set(.235,.034,0);F.add(hood);F.add(bxm(.0025,.009,.002,M.parker,.235,.0295,0));F.add(rbox(.228,.012,.242,.026,.008,M.parker,0,.001));
  const pp=new T.Mesh(new T.TorusGeometry(.0035,.0014,8,20),M.parker);pp.rotation.y=PI/2;pp.position.set(-.122,.034,0);F.add(pp);[1,-1].forEach(s=>F.add(bxm(.018,.02,.004,M.parker,-.125,.032,s*.009)));
  F.add(rbox(-.03,.004,.02,.018,.0008,M.dark,.0152,.0002));const CA=rbox(-.028,.006,.018,.016,.0006,M.carrier,.0156,.0001);F.add(CA);
  F.add(ext([[-.07,-.02],[.035,-.02],[.035,-.04],[-.06,-.04]],.026,M.polymer,{bev:.002}));
  F.add(ext([[-.03,-.04],[.03,-.04],[.03,-.058],[-.02,-.06]],.012,M.polymer,{holes:[[[-.022,-.043],[.024,-.043],[.024,-.054],[-.018,-.055]]],bev:.001}));
  F.add(ext([[-.05,-.038],[-.028,-.038],[-.034,-.06],[-.04,-.095],[-.066,-.097],[-.064,-.075],[-.058,-.045]],.03,M.grip,{bev:.004}));
  const TR=grp(F,0,-.038,0);TR.add(ext([[-.002,0],[.003,0],[.0045,-.007],[.003,-.012],[-.0005,-.0145],[-.003,-.013],[-.0005,-.008],[-.001,-.003]],.005,M.nitride,{bev:.0005}));
  const SF=grp(F,-.045,-.03,-.0135);SF.add(ext([[-.002,-.002],[.002,-.002],[.011,-.001],[.012,.0015],[.002,.002],[-.002,.002]],.002,M.nitride,{bev:.0004}));
  F.add(ext([[-.16,.02],[-.40,.016],[-.41,.014],[-.41,-.075],[-.398,-.078],[-.2,-.02],[-.16,-.018]],.036,M.polymer,{bev:.005}));
  const MG=grp(g);MG.add(ext([[.012,-.018],[.036,-.018],[.04,-.06],[.052,-.1],[.064,-.13],[.042,-.138],[.03,-.105],[.018,-.065]],.022,M.nitride,{bev:.001}));const tr=roundX('9');tr.position.set(.026,-.014,0);MG.add(tr);MG.userData.top=tr;
  return finish(Object.assign(g,{P:{carrier:CA,cx:[-.028,.018],chandle:CH,trig:TR,safety:SF,mag:MG}}))}
function addScope(F,Y,ox,s,baseY){const M=MT,X=x=>ox+x*s,R=r=>r*s;
  F.add(cyl(R(.0127),R(.0127),X(-.13),X(.12),Y,0,M.scope,32));F.add(cyl(R(.0127),R(.0235),X(.12),X(.155),Y,0,M.scope,32));F.add(cyl(R(.0235),R(.0235),X(.155),X(.195),Y,0,M.scope,32));
  F.add(cyl(R(.019),R(.0127),X(-.165),X(-.13),Y,0,M.scope,32));F.add(cyl(R(.019),R(.019),X(-.215),X(-.165),Y,0,M.scope,32));for(let i=0;i<7;i++)F.add(cyl(R(.0198),R(.0198),X(-.162+i*.003),X(-.1605+i*.003),Y,0,M.scope,32));
  F.add(cylY(R(.0105),R(.016),X(0),Y+R(.0205),0,M.scope,24));F.add(cylY(R(.0085),R(.004),X(0),Y+R(.030),0,M.scope,24));F.add(cylZ(R(.0105),R(.016),X(0),Y,R(.0205),M.scope,24));F.add(cylZ(R(.008),R(.008),X(.018),Y,-R(.016),M.scope,20));
  for(let i=0;i<8;i++){const m=bxm(.0006,.0012,.0006,M.white,0,Y+R(.0322),0);m.position.x=X(0)+Math.cos(i/8*PI*2)*R(.0078);m.position.z=Math.sin(i/8*PI*2)*R(.0078);F.add(m)}
  [-.062,.064].forEach(x=>{F.add(cyl(R(.0152),R(.0152),X(x)-R(.006),X(x)+R(.006),Y,0,M.blued,28));F.add(rbox(X(x)-R(.008),baseY,X(x)+R(.008),Y-R(.012),R(.014),M.blued,0,.0008))});
  F.add(discX(R(.0215),X(.1951),Y,0,M.lens,1));F.add(discX(R(.0172),X(-.2151),Y,0,M.lens,-1))}
function buildBMG(){const g=new T.Group(),F=grp(g),M=MT;
  F.add(ext([[-.22,-.03],[.26,-.03],[.26,.03],[-.2,.03],[-.22,.02]],.05,M.parker,{bev:.003}));F.add(rbox(-.2,.03,.25,.036,.022,M.parker,0,.0008));for(let x=-.195;x<.245;x+=.014)F.add(bxm(.006,.004,.026,M.parker,x,.038,0));
  F.add(ext([[-.22,-.03],[.12,-.03],[.12,-.05],[.02,-.05],[-.02,-.07],[-.14,-.07],[-.22,-.05]],.048,M.parker,{bev:.003}));
  F.add(cyl(.018,.016,.26,.95,0,0,M.parker,24));[0,1,2,3].forEach(k=>{const m=bxm(.5,.0012,.004,M.dark,.56,0,0);const a=k*PI/2+PI/4;m.position.y=Math.sin(a)*.017;m.position.z=Math.cos(a)*.017;m.rotation.x=-a;F.add(m)});
  F.add(rbox(.95,-.022,1.05,.022,.07,M.parker,0,.004));[.975,1.02].forEach(x=>[1,-1].forEach(s=>F.add(bxm(.022,.03,.001,M.dark,x,0,s*.0356))));F.add(discX(.0065,1.0502,0,0,M.bore,1));
  F.add(cyl(.026,.026,.58,.64,0,0,M.parker,20));[1,-1].forEach(s=>{const l=new T.Mesh(new T.CylinderGeometry(.006,.006,.3,10),M.parker);l.position.set(.62,-.16,s*.055);l.rotation.x=s*.35;F.add(l);const ft=new T.Mesh(new T.SphereGeometry(.012,10,8),M.rubber);ft.position.set(.62,-.3,s*.105);F.add(ft)});
  F.add(ext([[-.035,-.05],[-.012,-.05],[-.02,-.08],[-.03,-.115],[-.036,-.13],[-.066,-.131],[-.062,-.11],[-.052,-.08],[-.05,-.06]],.032,M.grip,{bev:.004}));
  F.add(ext([[.02,-.05],[.026,-.05],[.02,-.075],[-.02,-.077],[-.022,-.072],[.014,-.07]],.012,M.parker,{bev:.001}));
  const TR=grp(F,0,-.05,0);TR.add(ext([[-.002,0],[.003,0],[.0045,-.008],[.003,-.015],[-.0005,-.018],[-.003,-.016],[-.0005,-.01],[-.001,-.003]],.006,M.nitride,{bev:.0006}));
  const SF=grp(F,-.06,-.045,-.025);SF.add(ext([[-.003,-.003],[.003,-.003],[.016,-.002],[.017,.002],[.003,.003],[-.003,.003]],.0025,M.nitride,{bev:.0005}));
  F.add(ext([[-.22,.02],[-.5,.02],[-.55,.022],[-.56,-.12],[-.54,-.13],[-.46,-.08],[-.3,-.05],[-.22,-.05]],.05,M.parker,{bev:.006}));F.add(ext([[-.56,.02],[-.575,.02],[-.575,-.125],[-.56,-.12]],.052,M.rubber,{bev:.004}));
  const CH=grp(F);CH.add(cylZ(.006,.02,-.05,.0,.033,M.parker,12));
  F.add(rbox(-.06,-.01,.06,.02,.001,M.dark,.0256,.0002));const CA=rbox(-.058,-.008,.058,.018,.0008,M.carrier,.0262,.0001);F.add(CA);
  addScope(F,.083,0,1.3,.036);
  const MG=grp(g);MG.add(ext([[-.06,-.05],[0,-.05],[0,-.155],[-.06,-.155]],.034,M.parker,{bev:.002}));const tr=roundX('50bmg');tr.position.set(-.058+CAL['50bmg'].len/2*.6,-.045,0);tr.scale.setScalar(.6);MG.add(tr);MG.userData.top=tr;
  return finish(Object.assign(g,{P:{carrier:CA,cx:[-.058,.058],chandle:CH,trig:TR,safety:SF,mag:MG}}))}
const SHOT={pistol:{crack:.9,crackF:2600,body:.95,lp:4200,len:.22,th:120,thv:.8},p45:{crack:.75,crackF:2200,body:1,lp:3200,len:.28,th:95,thv:.95},mag:{crack:1,crackF:2800,body:1,lp:5000,len:.34,th:105,thv:.9},
  sg:{crack:.7,crackF:1800,body:1,lp:2400,len:.5,th:68,thv:1},rifle:{crack:1,crackF:3400,body:.9,lp:5200,len:.26,th:110,thv:.7},big:{crack:1,crackF:3000,body:1,lp:4200,len:.55,th:80,thv:1},
  supp:{crack:.22,crackF:1600,body:.3,lp:1300,len:.1,th:150,thv:.35},hand50:{crack:1,crackF:2200,body:1,lp:3000,len:.55,th:62,thv:1},ak:{crack:1,crackF:2700,body:1,lp:3800,len:.34,th:92,thv:.9},
  bmg:{crack:1,crackF:2200,body:1,lp:3200,len:.9,th:45,thv:1},lever:{crack:1,crackF:3000,body:1,lp:4400,len:.42,th:95,thv:.85}};
const GUNS=[
  {id:'p17',cat:'Pistols',name:'P-17',desc:'Striker-fired service pistol',cal:'9',build:()=>buildP17(),type:'slide',cap:17,travel:.030,muzzle:[.157,.0165,0],port:[.052,.025,.017],ev:[-.9,2.1,.9],sightY:.0345,rearX:-.022,eye:.42,rpm:1000,kick:.018,rise:.18,pivot:[-.025,-.035],magDir:[-.27,-1],safety:'none',shot:SHOT.pistol,flash:.07,acc:.0022,fov:54},
  {id:'m1911',cat:'Pistols',name:'M1911',desc:'Classic single-action .45',cal:'45',build:build1911,type:'slide',cap:8,travel:.034,muzzle:[.1848,.016,0],port:[.053,.022,.016],ev:[-.85,2,.85],sightY:.0335,rearX:-.023,eye:.42,rpm:800,kick:.022,rise:.24,pivot:[-.028,-.04],magDir:[-.25,-1],safety:'lever',hammer:.95,shot:SHOT.p45,flash:.08,acc:.002,fov:54},
  {id:'rev',cat:'Revolvers',name:'.357 Revolver',desc:'Double-action 6-shot magnum',cal:'357',build:()=>buildRev(),type:'rev',cap:6,muzzle:[.155,0,0],sightY:.0205,rearX:-.001,eye:.42,rpm:360,kick:.024,rise:.34,pivot:[-.028,-.05],safety:'none',shot:SHOT.mag,flash:.11,acc:.0018,fov:54},
  {id:'pump',cat:'Shotguns',adsY:.03,name:'Pump 12GA',desc:'Pump-action shotgun, 00 buck',cal:'12',build:()=>buildPump(),type:'pump',cap:6,muzzle:[.549,0,0],port:[-.008,.004,.021],ev:[-.4,1.7,.9],sightY:.0168,rearX:-.105,eye:.2,rpm:120,kick:.045,rise:.28,pivot:[-.47,-.06],safety:'cross',shot:SHOT.sg,flash:.17,acc:.0035,pellets:9,spread:.028,fov:56},
  {id:'ar',cat:'Rifles',name:'AR Carbine',desc:'5.56 rifle · semi / burst / auto',cal:'556',build:buildAR,type:'ar',cap:30,travel:.07,muzzle:[.4125,0,0],port:[.004,.004,.0185],ev:[.2,1.7,1.2],sightY:.052,rearX:-.018,eye:.17,rpm:780,kick:.012,rise:.07,pivot:[-.29,-.03],magDir:[0,-1],safety:'selector',modes:['SEMI','BURST','AUTO'],shot:SHOT.rifle,flash:.09,acc:.0009,fov:40},
  {id:'bolt',cat:'Snipers',name:'Hunter .308',desc:'Bolt-action rifle, 6× scope',cal:'308',build:buildBolt,type:'bolt',cap:5,muzzle:[.661,0,0],port:[-.045,.012,.019],ev:[-.3,1.5,1.1],sightY:.048,rearX:-.215,eye:.085,rpm:60,kick:.04,rise:.22,pivot:[-.58,-.07],safety:'bolt',shot:SHOT.big,flash:.15,acc:.00025,fov:6,scope:1},
  {id:'p19c',cat:'Pistols',name:'P-19 Compact',desc:'Compact 9mm, tan frame',cal:'9',build:()=>buildP17({cut:.02,gcut:.012,frame:MT.fde,grip:MT.fdeGrip}),type:'slide',cap:15,travel:.028,muzzle:[.137,.0165,0],port:[.05,.025,.017],ev:[-.9,2.1,.9],sightY:.0345,rearX:-.022,eye:.42,rpm:1000,kick:.02,rise:.21,pivot:[-.025,-.03],magDir:[-.27,-1],safety:'none',shot:SHOT.pistol,flash:.07,acc:.0026,fov:54},
  {id:'p17s',cat:'Pistols',name:'P-17 Suppressed',desc:'9mm with a sound suppressor',cal:'9',build:()=>buildP17({supp:1}),type:'slide',cap:17,travel:.030,muzzle:[.335,.0165,0],port:[.052,.025,.017],ev:[-.9,2.1,.9],sightY:.0345,rearX:-.022,eye:.42,rpm:1000,kick:.014,rise:.12,pivot:[-.025,-.035],magDir:[-.27,-1],safety:'none',shot:SHOT.supp,flash:.025,acc:.0018,fov:54},
  {id:'p18',cat:'Pistols',name:'P-18 Auto',desc:'Full-auto machine pistol, 33-rd mag',cal:'9',build:()=>buildP17({xmag:.058,auto:1}),type:'slide',cap:33,travel:.030,muzzle:[.157,.0165,0],port:[.052,.025,.017],ev:[-.9,2.1,.9],sightY:.0345,rearX:-.022,eye:.42,rpm:1150,kick:.016,rise:.16,pivot:[-.025,-.035],magDir:[-.27,-1],safety:'none',modes:['SEMI','AUTO'],shot:SHOT.pistol,flash:.07,acc:.003,fov:54},
  {id:'m9',cat:'Pistols',name:'M9 Service',desc:'Open-slide 9mm, 15 rounds',cal:'9',build:buildM9,type:'slide',cap:15,travel:.032,muzzle:[.1805,.016,0],port:[.08,.024,.01],ev:[-.8,2.2,.8],sightY:.0335,rearX:-.023,eye:.42,rpm:900,kick:.019,rise:.19,pivot:[-.028,-.04],magDir:[-.25,-1],safety:'lever',hammer:.95,shot:SHOT.pistol,flash:.07,acc:.002,fov:54},
  {id:'de50',cat:'Pistols',name:'.50 Hand Cannon',desc:'Gas-operated .50 AE magnum pistol',cal:'50ae',build:buildDE,type:'slide',cap:7,travel:.036,muzzle:[.237,.02,0],port:[.004,.034,.019],ev:[-.8,2.4,.9],sightY:.0455,rearX:-.044,eye:.42,rpm:300,kick:.045,rise:.6,pivot:[-.035,-.045],magDir:[-.25,-1],safety:'lever',hammer:.9,shot:SHOT.hand50,flash:.15,acc:.0024,fov:54,pow:3.2},
  {id:'snub',cat:'Revolvers',name:'Snub .38',desc:'2-inch blued snub-nose revolver',cal:'38',build:()=>buildRev({be:.112,fin:MT.blued,grip:MT.grip,cal:'38',lug:'half',small:1}),type:'rev',cap:6,muzzle:[.1125,0,0],sightY:.0205,rearX:-.001,eye:.42,rpm:360,kick:.022,rise:.3,pivot:[-.028,-.045],safety:'none',shot:SHOT.p45,flash:.1,acc:.0028,fov:54},
  {id:'m44',cat:'Revolvers',name:'.44 Magnum',desc:'6.5-inch blued hunting revolver',cal:'44',build:()=>buildRev({be:.226,fin:MT.blued,grip:MT.walnut,cal:'44',cr:.0124,hr:.0058,R0:.0206,bore:.0054}),type:'rev',cap:6,muzzle:[.2265,0,0],sightY:.0205,rearX:-.001,eye:.42,rpm:300,kick:.035,rise:.5,pivot:[-.028,-.05],safety:'none',shot:SHOT.hand50,flash:.14,acc:.0015,fov:54,pow:2.6},
  {id:'tac12',cat:'Shotguns',name:'Tactical 12GA',desc:'Synthetic pump, ghost ring, side saddle',cal:'12',build:()=>buildPump({syn:1,be:.47,saddle:1,ghost:1}),type:'pump',cap:6,muzzle:[.471,0,0],port:[-.008,.004,.021],ev:[-.4,1.7,.9],sightY:.03,rearX:-.1,eye:.2,rpm:130,kick:.047,rise:.3,pivot:[-.47,-.06],safety:'cross',shot:SHOT.sg,flash:.18,acc:.0035,pellets:9,spread:.034,fov:56},
  {id:'auto12',cat:'Shotguns',name:'Auto 12GA',desc:'Semi-automatic shotgun, 8 shells',cal:'12',build:()=>buildPump({syn:1,semi:1,be:.51}),type:'sauto',cap:8,muzzle:[.511,0,0],port:[-.008,.004,.021],ev:[-.4,1.8,1.1],sightY:.0168,adsY:.03,rearX:-.105,eye:.2,rpm:300,kick:.04,rise:.26,pivot:[-.47,-.06],safety:'cross',shot:SHOT.sg,flash:.17,acc:.0035,pellets:9,spread:.03,fov:56},
  {id:'coach',cat:'Shotguns',name:'Coach Gun',desc:'Side-by-side double barrel, break action',cal:'12',build:buildDouble,type:'break',cap:2,muzzle:[.52,0,.0118],sightY:.016,adsY:.03,rearX:-.045,eye:.22,rpm:600,kick:.055,rise:.36,pivot:[-.40,-.06],safety:'none',shot:SHOT.sg,flash:.19,acc:.004,pellets:9,spread:.034,fov:56},
  {id:'ak',cat:'Rifles',name:'KR-47',desc:'7.62×39 rifle · auto / semi',cal:'762',build:buildAK,type:'ar',cap:30,travel:.09,muzzle:[.4505,0,0],port:[.02,.008,.019],ev:[.3,1.6,2],sightY:.032,rearX:.14,eye:.4,rpm:600,kick:.02,rise:.12,pivot:[-.46,-.07],magDir:[.15,-1],safety:'selector',selA:[0,-.12,-.24],modes:['AUTO','SEMI'],recipCH:1,shot:SHOT.ak,flash:.12,acc:.0016,fov:45,pow:2},
  {id:'smg',cat:'Rifles',name:'SMG-5',desc:'Roller-delayed 9mm submachine gun',cal:'9',build:buildSMG,type:'ar',cap:30,travel:.05,muzzle:[.2455,0,0],port:[-.005,.011,.02],ev:[-.2,1.6,1.8],sightY:.034,rearX:-.13,eye:.12,rpm:800,kick:.01,rise:.06,pivot:[-.40,-.03],magDir:[.1,-1],safety:'selector',selA:[0,.9,1.8,2.7],modes:['SEMI','BURST','AUTO'],shot:SHOT.pistol,flash:.06,acc:.0014,fov:45},
  {id:'lever',cat:'Rifles',name:'Lever .30-30',desc:'Lever-action cowboy rifle, tube mag',cal:'3030',build:buildLever,type:'lever',cap:6,muzzle:[.5805,0,0],port:[-.01,.018,0],ev:[-.4,2.6,.45],sightY:.0167,rearX:.175,eye:.48,rpm:600,kick:.035,rise:.24,pivot:[-.44,-.07],safety:'none',hammer:.7,shot:SHOT.lever,flash:.13,acc:.0006,fov:42,pow:2.6,load:[[.07,-.012,.045],[.035,-.013,.014],[.03,-.015,0]]},
  {id:'garand',cat:'Rifles',name:'M1 Garand',desc:'.30-06 battle rifle · 8-round clip, PING!',cal:'3006',build:buildGarand,type:'garand',cap:8,travel:.065,muzzle:[.6105,0,0],port:[-.02,.02,.012],ev:[-.2,2.4,.8],sightY:.033,rearX:-.1,eye:.1,rpm:500,kick:.04,rise:.24,pivot:[-.53,-.07],safety:'garand',shot:SHOT.big,flash:.14,acc:.0005,fov:40,pow:3.2},
  {id:'bmg50',cat:'Snipers',name:'.50 Anti-Materiel',desc:'Semi-auto .50 BMG, bipod, 10× scope',cal:'50bmg',build:buildBMG,type:'ar',cap:10,travel:.12,muzzle:[1.051,0,0],port:[0,.01,.031],ev:[-.2,1.5,1.8],sightY:.083,rearX:-.28,eye:.09,rpm:150,kick:.09,rise:.5,pivot:[-.57,-.08],magDir:[0,-1],safety:'selector',selA:[0,1.2],modes:['SEMI'],shot:SHOT.bmg,flash:.3,acc:.0002,fov:4,scope:1,pow:6}];

/* ---------- audio ---------- */
let A=null,OUT=null,REV=null,REVG=null,NB=null,CP=null;const SHAPE=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/511.5-1;SHAPE[i]=Math.tanh(x*1.6)}
function au(){if(muted)return null;try{const a=ac();if(!OUT){OUT=a.createGain();OUT.gain.value=.75;CP=a.createDynamicsCompressor();CP.threshold.value=-14;CP.knee.value=8;CP.ratio.value=6;CP.attack.value=.001;CP.release.value=.2;OUT.connect(CP);CP.connect(a.destination);
  REV=a.createConvolver();REVG=a.createGain();REV.connect(REVG);REVG.connect(OUT);NB=a.createBuffer(1,a.sampleRate*2,a.sampleRate);const ch=NB.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=Math.random()*2-1;A=a;setRoom(MODE)}return A=a}catch(e){return null}}
function irBuf(a,dur,decay,damp){const n=Math.floor(a.sampleRate*dur),b=a.createBuffer(2,n,a.sampleRate);for(let c2=0;c2<2;c2++){const d=b.getChannelData(c2);let lp=0;for(let i=0;i<n;i++){const t=i/n;lp+=((Math.random()*2-1)-lp)*(damp*(1-t)+.03);d[i]=lp*Math.pow(1-t,decay)*(i<a.sampleRate*.004?i/(a.sampleRate*.004):1)}}return b}
function setRoom(m){if(!A||!REV)return;try{REV.buffer=m==='range'?irBuf(A,2.4,2.4,.55):m==='zombie'?irBuf(A,1.6,3.2,.4):irBuf(A,.8,3.2,.75);REVG.gain.value=m==='range'?.6:m==='zombie'?.35:.22}catch(e){}}
const SL=()=>SLOW?2.6:1,SF_=()=>SLOW?.5:1;
function nsrc(a,t,dur,rate){const s=a.createBufferSource();s.buffer=NB;s.playbackRate.value=rate||1;s.start(t,Math.random()*1.2,dur+.05);return s}
function envG(a,t,peak,att,dec){const g=a.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),t+att);g.gain.exponentialRampToValueAtTime(.0001,t+att+dec);return g}
function sndShot(p,vol){const a=au();if(!a)return;const t=a.currentTime+.003,sl=SL(),fp=SF_();const bus=a.createGain();bus.gain.value=vol||1;const sh=a.createWaveShaper();sh.curve=SHAPE;bus.connect(sh);sh.connect(OUT);sh.connect(REV);
  {const s=nsrc(a,t,.05*sl,fp),f=a.createBiquadFilter();f.type='highpass';f.frequency.value=p.crackF*fp;const g=envG(a,t,p.crack,.0005,.035*sl);s.connect(f);f.connect(g);g.connect(bus)}
  {const s=nsrc(a,t,p.len*sl+.1,fp),f=a.createBiquadFilter();f.type='lowpass';f.Q.value=.8;f.frequency.setValueAtTime(p.lp*fp,t);f.frequency.exponentialRampToValueAtTime(200*fp,t+p.len*sl);const g=envG(a,t,p.body,.0015,p.len*sl);s.connect(f);f.connect(g);g.connect(bus)}
  {const o=a.createOscillator();o.frequency.setValueAtTime(p.th*fp*1.9,t);o.frequency.exponentialRampToValueAtTime(p.th*fp*.42,t+.15*sl);const g=envG(a,t,p.thv,.002,.2*sl);o.connect(g);g.connect(bus);o.start(t);o.stop(t+.35*sl)}
  if(MODE!=='bench'){const s=nsrc(a,t+.02,1.2,fp*.5),f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=500*fp;const g=envG(a,t+.02,p.body*.35,.02,1.1*sl);s.connect(f);f.connect(g);g.connect(REV)}}
function clk(f,q,dur,v,dly,type){const a=au();if(!a)return;const t=a.currentTime+(dly||0)*SL(),s=nsrc(a,t,dur*SL()),bf=a.createBiquadFilter();bf.type=type||'bandpass';bf.frequency.value=f*SF_();bf.Q.value=q;const g=envG(a,t,v,.0008,dur*SL());s.connect(bf);bf.connect(g);g.connect(OUT);g.connect(REV)}
function ping(f,dur,v,dly,type){const a=au();if(!a)return;const t=a.currentTime+(dly||0)*SL(),o=a.createOscillator();o.type=type||'sine';o.frequency.value=f*SF_();const g=envG(a,t,v,.001,dur*SL());o.connect(g);g.connect(OUT);g.connect(REV);o.start(t);o.stop(t+dur*SL()+.05)}
const MECH={slideB:()=>{clk(2600,2,.03,.35);clk(1200,1.5,.05,.25,.012)},slideF:()=>{clk(3200,3,.025,.5);ping(2400,.05,.05);clk(900,1,.04,.3,.004)},lock:()=>{clk(3500,4,.02,.4);ping(3100,.08,.05)},
  magOut:()=>{clk(1800,3,.02,.35);clk(700,1,.08,.2,.03)},magIn:()=>{clk(1100,2,.03,.5);clk(2600,4,.02,.45,.015);ping(1900,.06,.04,.015)},pumpB:()=>{clk(1500,2,.06,.45);clk(2800,3,.02,.35,.05)},pumpF:()=>{clk(2200,2,.05,.5);clk(900,1,.06,.35,.02)},
  boltUp:()=>clk(2600,5,.025,.35),boltB:()=>clk(1800,1.5,.07,.3),boltF:()=>{clk(1500,1.5,.06,.35);clk(3000,4,.02,.3,.05)},boltD:()=>clk(2400,5,.02,.35),dry:()=>{clk(3800,6,.012,.45);ping(2900,.03,.04)},safe:()=>clk(4200,6,.012,.35),
  cyl:()=>{clk(2000,3,.04,.4);ping(1500,.1,.04)},shellIn:()=>{clk(1300,2,.04,.4);clk(2400,3,.015,.3,.03)},ch:()=>clk(1600,2,.05,.3)};
let lastClink=0;
function impactSnd(b,sp,surf){const a=au();if(!a)return;const now=a.currentTime;if(now-lastClink<.01)return;lastClink=now;const v=Math.min(1,sp/2.5)*(surf==='mat'?.45:1);
  if(b.kind==='brass'){const f0=b.f*rnd(.92,1.08),dm=surf==='concrete'?.7:surf==='mat'?.5:1;[[1,.09,.13],[2.71,.05,.06],[5.2,.03,.035]].forEach(([k,gv,d])=>{const o=a.createOscillator();o.frequency.value=f0*k*rnd(.99,1.01);const g=envG(a,now,v*gv,.0008,d*dm);o.connect(g);g.connect(OUT);g.connect(REV);o.start(now);o.stop(now+d+.05)});clk(surf==='wood'?1500:3200,1,.01,v*.22)}
  else if(b.kind==='shell'){clk(650,1,.04,v*.5);clk(2300,3,.015,v*.25)}else if(b.kind==='mag'){clk(480,1,.07,v*.8);clk(1500,2,.03,v*.4)}else if(b.kind==='glass'){ping(rnd(4000,8000),.05,v*.05)}}
function ding(dist,f){const a=au();if(!a)return;const t=a.currentTime+dist/343*SL(),f0=f*rnd(.96,1.04);[[1,.22,1.6],[2.32,.13,1.1],[4.25,.07,.7],[6.63,.04,.45],[9.1,.02,.25]].forEach(([k,v,d])=>{const o=a.createOscillator();o.frequency.value=f0*k*SF_();const g=envG(a,t,v,.001,d*SL());o.connect(g);g.connect(OUT);g.connect(REV);o.start(t);o.stop(t+d*SL()+.05)});clk(3000,1,.02,.3,dist/343)}
function shatterSnd(dist){const d=dist/343;clk(5000,.7,.25,.35,d,'highpass');for(let i=0;i<14;i++)ping(rnd(3500,9000),rnd(.04,.12),rnd(.02,.06),d+rnd(0,.35))}
function splatSnd(dist){const d=dist/343;clk(700,.7,.25,.6,d,'lowpass');ping(90,.2,.3,d);clk(1800,1,.08,.2,d+.02)}

/* ---------- world: studio workbench ---------- */
scene.background=new T.Color(0x0f0e0d);
const benchW=grp(scene),rangeW=grp(scene);rangeW.visible=false;
const hemi=new T.HemisphereLight(0xfff3e4,0x2a2018,.35);benchW.add(hemi);
const key=new T.DirectionalLight(0xfff0dc,2.6);key.position.set(.5,1.5,-1);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-.9,right:.9,top:.9,bottom:-.9,near:.1,far:5});key.shadow.bias=-.0003;key.shadow.normalBias=.002;benchW.add(key);benchW.add(key.target);
const rim=new T.SpotLight(0xd0e2ff,4,6,.7,.7,1.4);rim.position.set(-1.3,1,1.3);benchW.add(rim);benchW.add(rim.target);
const bench=grp(benchW);{const top=new T.Mesh(new T.BoxGeometry(2.2,.06,1.5),std({map:OAK,roughness:.9,roughnessMap:OAKR}));top.position.y=-.03;top.receiveShadow=true;bench.add(top);
  const matTex=ctex(1024,512,(x,w,h)=>{x.fillStyle='#1c1d1f';x.fillRect(0,0,w,h);x.strokeStyle='rgba(255,255,255,.07)';x.lineWidth=1;for(let i=0;i<w;i+=20){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke()}for(let i=0;i<h;i+=20){x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke()}
    x.strokeStyle='rgba(255,122,26,.55)';x.lineWidth=3;x.strokeRect(14,14,w-28,h-28);x.fillStyle='rgba(255,255,255,.22)';x.font='900 30px Arial Black,sans-serif';x.fillText('DETOURR',34,h-36);x.font='700 16px sans-serif';x.fillText('GUN SIM PRO · CLEANING MAT',210,h-40);
    for(let i=0;i<=20;i++){x.fillStyle='rgba(255,255,255,.25)';x.fillRect(40+i*40,40,1,i%5?8:16)}speck(x,w,h,8)},1,1,true);
  const mat=new T.Mesh(new T.PlaneGeometry(1.1,.55),std({map:matTex,roughness:.85}));mat.rotation.set(-PI/2,0,PI);mat.position.y=.0012;mat.receiveShadow=true;bench.add(mat);
  const bd=ctex(512,256,(x,w,h)=>{const g=x.createRadialGradient(w/2,h*.45,10,w/2,h*.45,w*.6);g.addColorStop(0,'#3a3029');g.addColorStop(.6,'#1a1512');g.addColorStop(1,'#0d0b0a');x.fillStyle=g;x.fillRect(0,0,w,h);speck(x,w,h,6)},1,1,true);
  const back=new T.Mesh(new T.PlaneGeometry(6,3),new T.MeshBasicMaterial({map:bd}));back.position.set(0,.6,1.4);back.rotation.y=PI;bench.add(back)}
const surfB=[{x0:-1.1,x1:1.1,z0:-.75,z1:.75,h:0,s:'wood'}];let floorB=-.85;

/* ---------- world: indoor range (built lazily) ---------- */
let RG=null;const RGS={};let RMAP=S.get('gs_map','indoor');const RMAPS={indoor:'Indoor range',desert:'Desert long range',yard:'Junkyard plinking'};
function buildRange(){const R=rangeW,O={ray:[],plates:[],bottles:[],melons:[],surf:[]};
  const conc=ctex(512,512,(x,w,h)=>{x.fillStyle='#77746e';x.fillRect(0,0,w,h);blotch(x,w,h,60,['60,58,54','140,136,128','90,80,70'],10,70,.25);speck(x,w,h,28);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,0,w,2);x.fillRect(0,0,2,h)},3,16,true);
  const floor=new T.Mesh(new T.PlaneGeometry(6,34),std({map:conc,roughness:.88}));floor.rotation.x=-PI/2;floor.position.set(0,0,-15);floor.receiveShadow=true;R.add(floor);floor.userData.k='floor';O.ray.push(floor);
  const panel=ctex(512,256,(x,w,h)=>{x.fillStyle='#3b3f44';x.fillRect(0,0,w,h);for(let i=0;i<4;i++){x.fillStyle=i%2?'#40454b':'#373b40';x.fillRect(i*w/4+3,3,w/4-6,h-6)}speck(x,w,h,14)},6,1,true);
  const wm=std({map:panel,roughness:.95});[-2.6,2.6].forEach(xw=>{const wl=new T.Mesh(new T.PlaneGeometry(34,3.2),wm);wl.position.set(xw,1.6,-15);wl.rotation.y=xw<0?PI/2:-PI/2;wl.receiveShadow=true;R.add(wl);wl.userData.k='wall';O.ray.push(wl)});
  const ceil=new T.Mesh(new T.PlaneGeometry(6,34),std({color:0x1c1d1f,roughness:.95}));ceil.rotation.x=PI/2;ceil.position.set(0,3.2,-15);R.add(ceil);ceil.userData.k='wall';O.ray.push(ceil);
  for(let z=-2;z>-26;z-=3){const b=new T.Mesh(new T.BoxGeometry(5.2,.9,.03),std({color:0x3a3c3f,metalness:.5,roughness:.6}));b.position.set(0,2.85,z);b.rotation.x=-.75;R.add(b);b.userData.k='steelEnv';O.ray.push(b)}
  const lm=new T.MeshBasicMaterial({color:new T.Color(0xfff2dc).multiplyScalar(1.6)});[-.5,-6,-12,-18].forEach(z=>{const l=new T.Mesh(new T.BoxGeometry(1.4,.03,.18),lm);l.position.set(0,3.17,z);R.add(l)});
  R.add(new T.HemisphereLight(0xfff4e2,0x3a3630,.42));
  const sp=(x,y,z,tx,ty,tz,i,ang,sh)=>{const s=new T.SpotLight(0xfff0d8,i,30,ang,.65,1.2);s.position.set(x,y,z);s.target.position.set(tx,ty,tz);R.add(s,s.target);if(sh){s.castShadow=true;s.shadow.mapSize.set(1024,1024);s.shadow.bias=-.0005;s.shadow.camera.near=.5;s.shadow.camera.far=8}return s};
  sp(0,3.05,.8,0,.9,-.6,2.2,.8,true);sp(0,3.05,-5,0,1,-8,2.6,.7);sp(0,3.05,-11,0,.8,-15,3,.8);sp(0,3.05,-19,0,1,-25,2.6,.7);
  const rub=ctex(256,256,(x,w,h)=>{x.fillStyle='#1c1a18';x.fillRect(0,0,w,h);for(let i=0;i<3000;i++){const v=20+Math.random()*30;x.fillStyle=`rgb(${v},${v-2},${v-4})`;x.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*3,2+Math.random()*3)}},8,4,true);
  const berm=new T.Mesh(new T.BoxGeometry(5.2,4,1),std({map:rub,roughness:.95}));berm.position.set(0,1,-27.6);berm.rotation.x=-.55;R.add(berm);berm.userData.k='berm';O.ray.push(berm);
  const endw=new T.Mesh(new T.PlaneGeometry(6,3.2),std({color:0x151515,roughness:1}));endw.position.set(0,1.6,-29.5);R.add(endw);endw.userData.k='berm';O.ray.push(endw);
  const yl=new T.Mesh(new T.PlaneGeometry(5.2,.06),std({color:0xe8c21a,roughness:.7}));yl.rotation.x=-PI/2;yl.position.set(0,.002,-.75);R.add(yl);
  [5,7,10,15,25].forEach(d=>{const t=ctex(128,64,(x,w,h)=>{x.fillStyle='#e8c21a';x.fillRect(0,0,w,h);x.fillStyle='#161616';x.font='900 40px Arial Black,sans-serif';x.textAlign='center';x.fillText(d+'m',w/2,h/2+14)},1,1,true);[-1,1].forEach(s=>{const m=new T.Mesh(new T.PlaneGeometry(.4,.2),std({map:t,roughness:.7}));m.position.set(s*2.58,2.1,-d);m.rotation.y=-s*PI/2;R.add(m)})});
  const woodM=std({map:OAK,roughness:.7});const cnt=new T.Mesh(new T.BoxGeometry(1.8,.05,.45),woodM);cnt.position.set(0,1.0,-.42);cnt.castShadow=cnt.receiveShadow=true;R.add(cnt);cnt.userData.k='wood';O.ray.push(cnt);O.surf.push({x0:-.9,x1:.9,z0:-.645,z1:-.195,h:1.025,s:'wood'});
  const dvm=std({color:0x4a4d52,roughness:.85});[-1,1].forEach(s=>{const d=new T.Mesh(new T.BoxGeometry(.05,2.1,1.2),dvm);d.position.set(s*.95,1.05,-.05);d.castShadow=d.receiveShadow=true;R.add(d);d.userData.k='wall';O.ray.push(d)});
  const rail=new T.Mesh(new T.BoxGeometry(.06,.05,20),std({color:0x55575a,metalness:.8,roughness:.4}));rail.position.set(0,2.72,-10.5);R.add(rail);
  // paper target on the carrier
  const pc=document.createElement('canvas');pc.width=512;pc.height=683;const px=pc.getContext('2d'),ptex=new T.CanvasTexture(pc);ptex.encoding=T.sRGBEncoding;ptex.anisotropy=4;
  const PW=.45,PH=.6,BCY=.05,hits=[];const RINGS=[.02,.05,.08,.11,.14,.17];
  function drawPaper(){const s=512/PW,cx=256,cy=683/2-BCY*s;px.fillStyle='#f3efe4';px.fillRect(0,0,512,683);px.globalAlpha=.06;for(let i=0;i<2500;i++){px.fillStyle='#000';px.fillRect(Math.random()*512,Math.random()*683,1,1)}px.globalAlpha=1;
    px.fillStyle='#161616';px.beginPath();px.arc(cx,cy,RINGS[3]*s,0,7);px.fill();px.lineWidth=2;for(let i=RINGS.length-1;i>=0;i--){px.strokeStyle=i<=3?'#f3efe4':'#161616';px.beginPath();px.arc(cx,cy,RINGS[i]*s,0,7);px.stroke()}
    px.font='700 18px Arial,sans-serif';px.textAlign='center';for(let i=1;i<RINGS.length;i++){const r=(RINGS[i-1]+RINGS[i])/2*s;px.fillStyle=i<=3?'#f3efe4':'#161616';px.fillText(10-i,cx,cy-r+6);px.fillText(10-i,cx,cy+r+6)}
    px.fillStyle='#161616';px.font='900 22px Arial Black,sans-serif';px.fillText('DETOURR RANGE',256,58);px.font='600 14px Arial,sans-serif';px.fillText('OFFICIAL 10-RING BULLSEYE · DO NOT REMOVE',256,80);
    hits.forEach((h,n)=>{const hx=h.u*512,hy=(1-h.v)*683,r=Math.max(4,h.cal*s*.5);const g=px.createRadialGradient(hx,hy,r*.6,hx,hy,r*3.4);g.addColorStop(0,'rgba(205,255,40,.95)');g.addColorStop(.55,'rgba(190,255,30,.55)');g.addColorStop(1,'rgba(190,255,30,0)');px.fillStyle=g;px.beginPath();px.arc(hx,hy,r*3.4,0,7);px.fill();
      px.fillStyle='#050505';px.beginPath();for(let k=0;k<10;k++){const a=k/10*PI*2,rr=r*(.85+((k*7+n)%5)*.07);px.lineTo(hx+Math.cos(a)*rr,hy+Math.sin(a)*rr)}px.fill();
      if(n===hits.length-1){px.strokeStyle='#ff5a14';px.lineWidth=3;px.beginPath();px.arc(hx,hy,r*4.2,0,7);px.stroke()}});ptex.needsUpdate=true}
  drawPaper();const paperG=grp(R,0,1.62,-7);const paper=new T.Mesh(new T.PlaneGeometry(PW,PH),std({map:ptex,roughness:.9,side:T.DoubleSide}));paper.castShadow=true;paperG.add(paper);paper.userData.k='paper';O.ray.push(paper);
  const clip=new T.Mesh(new T.BoxGeometry(.5,.03,.03),std({color:0x333,metalness:.8,roughness:.4}));clip.position.y=PH/2+.01;paperG.add(clip);
  [-1,1].forEach(s=>{const wire=new T.Mesh(new T.CylinderGeometry(.002,.002,.8,6),std({color:0x888,metalness:1,roughness:.3}));wire.position.set(s*.22,PH/2+.42,0);paperG.add(wire)});
  const trolley=new T.Mesh(new T.BoxGeometry(.12,.06,.16),std({color:0x444,metalness:.7,roughness:.4}));trolley.position.y=2.72-1.62;paperG.add(trolley);
  O.paper={g:paperG,mesh:paper,hits,draw:drawPaper,dist:7,target:7,shots:0,score:0,RINGS,BCY,PW,PH};
  // steel plates
  const stand=std({color:0x3b3d40,metalness:.7,roughness:.55});
  function plate(x,z,y,r,sil){const hb=y+(sil?.42:r)+.14;const g=grp(R,x,hb,-z);[-1,1].forEach(s=>{const lg=new T.Mesh(new T.CylinderGeometry(.018,.018,hb,10),stand);lg.position.set(s*(sil?.34:r+.1),-hb/2,0);g.add(lg)});
    const bar=new T.Mesh(new T.CylinderGeometry(.02,.02,(sil?.68:r*2+.2)+.04,10),stand);bar.rotation.z=PI/2;g.add(bar);
    const cv=document.createElement('canvas');cv.width=cv.height=128;const cx=cv.getContext('2d');const pt=new T.CanvasTexture(cv);pt.encoding=T.sRGBEncoding;
    const paint=col=>{cx.fillStyle=col;cx.fillRect(0,0,128,128);cx.globalAlpha=.08;for(let i=0;i<300;i++){cx.fillStyle='#000';cx.fillRect(Math.random()*128,Math.random()*128,2,2)}cx.globalAlpha=1;pt.needsUpdate=true};paint(sil?'#e46a1e':'#ecebe6');
    const pm2=std({map:pt,metalness:.25,roughness:.55});const piv=grp(g);const L=sil?.08:.1;let mesh;
    if(sil){mesh=ext([[-.225,-.75],[.225,-.75],[.225,-.35],[.16,-.22],[.07,-.22],[.07,-.08],[.0,-.04],[-.07,-.08],[-.07,-.22],[-.16,-.22],[-.225,-.35]].map(([a,b])=>[a,b+.02]),.014,pm2,{bev:.002});mesh.position.y=-L+.02;
      const uv=mesh.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)+.225)/.45,(uv.getY(i)+.75)/.77)}
    else{const gg=new T.CylinderGeometry(r,r,.014,40);gg.rotateX(PI/2);mesh=new T.Mesh(gg,pm2);mesh.position.y=-L-r}
    mesh.castShadow=true;piv.add(mesh);[-1,1].forEach(s=>{const ch=new T.Mesh(new T.CylinderGeometry(.003,.003,L,6),stand);ch.position.set(s*(sil?.05:r*.35),-L/2,0);piv.add(ch)});
    const P={g,piv,mesh,th:0,tv:0,L:L+(sil?.35:r),hit:false,paint,cx,pt,sil,dist:z,f:sil?300:rnd(470,600)};mesh.userData.k='steel';mesh.userData.P=P;O.ray.push(mesh);O.plates.push(P);return P}
  [-1.6,-.8,0,.8,1.6].forEach((x,i)=>plate(x,15,.62+(i%2)*.1,.125));O.sil=plate(1.2,25,.2,0,true);
  // bottle table + bottles
  const tbl=new T.Mesh(new T.BoxGeometry(1.1,.05,.5),woodM);tbl.position.set(-1.55,.85,-10);tbl.castShadow=tbl.receiveShadow=true;R.add(tbl);tbl.userData.k='wood';O.ray.push(tbl);O.surf.push({x0:-2.1,x1:-1,z0:-10.25,z1:-9.75,h:.875,s:'wood'});
  [[-2.02,-.92],[-1.08,-.92]].forEach(([x])=>{const lg=new T.Mesh(new T.BoxGeometry(.05,.85,.45),woodM);lg.position.set(x,.425,-10);R.add(lg)});
  const bottleG=new T.LatheGeometry(P2([[0,0],[.032,0],[.034,.004],[.034,.17],[.029,.2],[.0135,.235],[.012,.28],[.0138,.284],[.0132,.29],[.009,.29],[.009,.2],[.028,.17],[.028,.006],[0,.006]]),22);
  const glass=[0x2e6e3c,0x6a3a14,0xa9cfd6,0x2e6e3c,0x6a3a14].map(cl=>phy({color:cl,roughness:.05,metalness:0,clearcoat:1,clearcoatRoughness:.03,transparent:true,opacity:.58,envMapIntensity:1.6}));
  O.bottleMats=glass;O.bottleG=bottleG;O.bottleXs=[-1.95,-1.73,-1.52,-1.31,-1.1];
  // melons
  const mt=ctex(256,128,(x,w,h)=>{x.fillStyle='#2f6b27';x.fillRect(0,0,w,h);for(let i=0;i<14;i++){x.fillStyle='#1c4717';x.beginPath();const cx0=i*w/14;x.moveTo(cx0,0);for(let y=0;y<=h;y+=8)x.lineTo(cx0+Math.sin(y*.2+i)*5,y);x.lineTo(cx0+9,h);for(let y=h;y>=0;y-=8)x.lineTo(cx0+9+Math.sin(y*.2+i)*5,y);x.fill()}speck(x,w,h,18)},1,1,true);
  O.melonMat=std({map:mt,roughness:.45});O.fleshMat=std({color:0xd63240,roughness:.6});O.rindMat=std({color:0x2c5f24,roughness:.5});
  const post=new T.Mesh(new T.CylinderGeometry(.03,.05,.95,12),stand);post.position.set(1.55,.475,-9);R.add(post);post.userData.k='steelEnv';O.ray.push(post);const pl=new T.Mesh(new T.CylinderGeometry(.14,.14,.02,20),stand);pl.position.set(1.55,.96,-9);R.add(pl);O.surf.push({x0:1.41,x1:1.69,z0:-9.14,z1:-8.86,h:.97,s:'steel'});
  O.surf.push({x0:-2.6,x1:2.6,z0:-32,z1:2,h:0,s:'concrete'});O.W=rangeW;O.drillN=5;O.far=60;
  RG=O;RGS.indoor=O;resetTargets()}
function resetTargets(){const O=RG;if(!O)return;if(O.reset)return O.reset();O.bottles.forEach(b=>{rangeW.remove(b);O.ray.splice(O.ray.indexOf(b),1)});O.bottles=[];
  O.bottleXs.forEach((x,i)=>{const b=new T.Mesh(O.bottleG,O.bottleMats[i]);b.position.set(x,.875,-10);b.castShadow=true;b.userData.k='glass';b.userData.i=i;rangeW.add(b);O.bottles.push(b);O.ray.push(b)});
  O.melons.forEach(m=>{rangeW.remove(m);O.ray.splice(O.ray.indexOf(m),1)});O.melons=[];const m=new T.Mesh(new T.SphereGeometry(.12,32,22),O.melonMat);m.scale.set(1.18,.92,.95);m.position.set(1.55,.97+.11,-9);m.rotation.y=.4;m.castShadow=true;m.userData.k='melon';rangeW.add(m);O.melons.push(m);O.ray.push(m);
  O.plates.forEach(p=>{p.hit=false;p.paint(p.sil?'#e46a1e':'#ecebe6')})}


/* ---------- extra ranges: desert long range + junkyard plinking ---------- */
const deserW=grp(scene),yardW=grp(scene);deserW.visible=yardW.visible=false;
const ENV_D=envFrom(es=>{es.add(new T.Mesh(new T.BoxGeometry(60,30,60),new T.MeshBasicMaterial({color:0x9cc4e8,side:T.BackSide})));envPanel(es,30,30,.55,0,14,0,0xa8c8f0);envPanel(es,8,8,2.2,20,12,-20,0xfff2d8);envPanel(es,60,4,.25,0,-14,0,0xa88858)});
const ENV_Y=envFrom(es=>{es.add(new T.Mesh(new T.BoxGeometry(60,30,60),new T.MeshBasicMaterial({color:0xd89a6a,side:T.BackSide})));envPanel(es,30,30,.8,0,14,0,0xffd0a0);envPanel(es,10,6,4,-22,6,-20,0xffb070);envPanel(es,60,4,.4,0,-14,0,0x7a6048)});
function skyDome(R2,top,hor,sun){const cv=document.createElement('canvas');cv.width=4;cv.height=256;const g=cv.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,top);gr.addColorStop(.48,hor);gr.addColorStop(.52,hor);gr.addColorStop(1,hor);g.fillStyle=gr;g.fillRect(0,0,4,256);const t=new T.CanvasTexture(cv);t.encoding=T.sRGBEncoding;const m=new T.Mesh(new T.SphereGeometry(1400,24,16),new T.MeshBasicMaterial({map:t,side:T.BackSide,fog:false,depthWrite:false}));R2.add(m);if(sun){const s2=new T.Mesh(new T.SphereGeometry(30,16,12),new T.MeshBasicMaterial({color:sun,fog:false}));s2.position.set(500,420,-900);R2.add(s2)}return m}
const BOTTLE_G=new T.LatheGeometry(P2([[0,0],[.032,0],[.034,.004],[.034,.17],[.029,.2],[.0135,.235],[.012,.28],[.0138,.284],[.0132,.29],[.009,.29],[.009,.2],[.028,.17],[.028,.006],[0,.006]]),22);
const BOTTLE_M=[0x2e6e3c,0x6a3a14,0xa9cfd6,0x2e6e3c,0x6a3a14].map(cl=>phy({color:cl,roughness:.05,metalness:0,clearcoat:1,clearcoatRoughness:.03,transparent:true,opacity:.58,envMapIntensity:1.6}));
function mkPlate(R2,O,x,y,z,r,o){o=o||{};const stand=std({color:0x3b3d40,metalness:.7,roughness:.55});const sil=o.sil,hb=y+(sil?.42:r)+.14;const g=grp(R2,x,hb,-z);if(!o.noLegs)[-1,1].forEach(s2=>{const lg=new T.Mesh(new T.CylinderGeometry(.018*(o.k||1),.018*(o.k||1),hb,10),stand);lg.position.set(s2*(sil?.34:r+.1),-hb/2,0);g.add(lg)});
  const bar=new T.Mesh(new T.CylinderGeometry(.02*(o.k||1),.02*(o.k||1),(sil?.68:r*2+.2)+.04,10),stand);bar.rotation.z=PI/2;g.add(bar);
  const cv=document.createElement('canvas');cv.width=cv.height=128;const cx=cv.getContext('2d');const pt=new T.CanvasTexture(cv);pt.encoding=T.sRGBEncoding;const base=o.col||(sil?'#e46a1e':'#ecebe6');
  const paint=col=>{cx.fillStyle=col;cx.fillRect(0,0,128,128);cx.globalAlpha=.08;for(let i=0;i<300;i++){cx.fillStyle='#000';cx.fillRect(Math.random()*128,Math.random()*128,2,2)}cx.globalAlpha=1;pt.needsUpdate=true};paint(base);
  const pm2=std({map:pt,metalness:.25,roughness:.55});const piv=grp(g);const L=sil?.08:.1*(o.k||1);let mesh;
  if(sil){const S2=o.k||1;mesh=ext([[-.225,-.75],[.225,-.75],[.225,-.35],[.16,-.22],[.07,-.22],[.07,-.08],[.0,-.04],[-.07,-.08],[-.07,-.22],[-.16,-.22],[-.225,-.35]].map(([a,b])=>[a*S2,(b+.02)*S2]),.014,pm2,{bev:.002});mesh.position.y=-L+.02}
  else{const gg=new T.CylinderGeometry(r,r,.014+r*.02,40);gg.rotateX(PI/2);mesh=new T.Mesh(gg,pm2);mesh.position.y=-L-r}
  mesh.castShadow=true;piv.add(mesh);[-1,1].forEach(s2=>{const ch=new T.Mesh(new T.CylinderGeometry(.003*(o.k||1),.003*(o.k||1),L,6),stand);ch.position.set(s2*(sil?.05:r*.35),-L/2,0);piv.add(ch)});
  const P={g,piv,mesh,th:0,tv:0,L:L+(sil?.35:r),hit:false,paint,cx,pt,sil,dist:z,f:o.f||(sil?300:Math.max(90,600-r*500)),base};mesh.userData.k='steel';mesh.userData.P=P;O.ray.push(mesh);O.plates.push(P);return P}
function signPost(R2,x,z,txt,big){const t=ctex(128,64,(x2,w,h)=>{x2.fillStyle='#e8c21a';x2.fillRect(0,0,w,h);x2.fillStyle='#161616';x2.font='900 38px Arial Black,sans-serif';x2.textAlign='center';x2.fillText(txt,w/2,h/2+13)},1,1,true);const k=big||1;const m=new T.Mesh(new T.PlaneGeometry(.8*k,.4*k),std({map:t,roughness:.7}));m.position.set(x,.9*k,-z);R2.add(m);const p=new T.Mesh(new T.CylinderGeometry(.03*k,.03*k,.8*k,6),std({color:0x444}));p.position.set(x,.35*k,-z);R2.add(p)}
function mkCan(R2,O,x,y,z,col){const cv=document.createElement('canvas');cv.width=64;cv.height=32;const g=cv.getContext('2d');g.fillStyle=col;g.fillRect(0,0,64,32);g.fillStyle='#fff';g.fillRect(0,12,64,5);const t=new T.CanvasTexture(cv);t.encoding=T.sRGBEncoding;const m=new T.Mesh(new T.CylinderGeometry(.033,.033,.12,16),[std({map:t,metalness:.6,roughness:.35}),std({color:0xc8c8cc,metalness:.9,roughness:.3}),std({color:0xc8c8cc,metalness:.9,roughness:.3})]);m.position.set(x,y+.06,-z);m.castShadow=true;m.userData.k='can';R2.add(m);O.ray.push(m);O.cans.push({m,v:new V3(),w:new V3(),rest:true,home:[x,y+.06,-z]});return m}
function mkBoom(R2,O,x,y,z,kind){let m;if(kind==='propane'){m=new T.Mesh(new T.CylinderGeometry(.16,.16,.5,16),std({color:0xe8e8e0,metalness:.4,roughness:.4}));const top=new T.Mesh(new T.SphereGeometry(.16,14,8,0,PI*2,0,PI/2),m.material);top.position.y=.25;m.add(top);m.position.set(x,y+.25,-z)}else{m=new T.Mesh(new T.BoxGeometry(.25,.18,.18),std({color:0xf07020,roughness:.7}));const lab=new T.Mesh(new T.BoxGeometry(.26,.06,.19),std({color:0xffffff}));m.add(lab);m.position.set(x,y+.09,-z)}m.castShadow=true;m.userData.k='boom';R2.add(m);O.ray.push(m);O.booms.push(m);return m}
function mkBalloon(R2,O,x,y,z,col){const g=grp(R2,x,y,-z);const b=new T.Mesh(new T.SphereGeometry(.16,16,12),std({color:col,roughness:.25,metalness:.05}));b.scale.y=1.2;b.castShadow=true;g.add(b);const str=new T.Mesh(new T.CylinderGeometry(.002,.002,1,4),std({color:0xeeeeee}));str.position.y=-.65;g.add(str);b.userData.k='balloon';b.userData.g=g;O.ray.push(b);O.balloons.push({g,b,ph:Math.random()*6,y});return b}
function mkTire(R2,O,x,y,z){const g=grp(R2,x,y,-z);const rope=new T.Mesh(new T.CylinderGeometry(.01,.01,.7,6),std({color:0x9a8660}));rope.position.y=-.35;g.add(rope);const piv=grp(g);const t=new T.Mesh(new T.TorusGeometry(.26,.1,10,20),std({color:0x151515,roughness:.95}));t.position.y=-.95;piv.add(t);t.castShadow=true;t.userData.k='tire';const P={g,piv,mesh:t,th:0,tv:0,L:.95};t.userData.P=P;O.ray.push(t);O.tires.push(P);return P}
function explodeAt(p,big){const d=p.distanceTo(_o);for(let i=0;i<(big?40:26);i++)particle(SPARK,p,new V3(rnd(-4,4),rnd(1,6),rnd(-4,4)),rnd(.3,.8)*(big?1.4:1),2,rnd(.2,.5),0xffa040,1,true,.8);for(let i=0;i<(big?26:16);i++)particle(SMOKE,p,new V3(rnd(-1.5,1.5),rnd(1,3),rnd(-1.5,1.5)),rnd(.6,1.2)*(big?1.6:1),2.4,rnd(2,4),0x3a3632,.7,false,-.3);
  flashL.position.copy(p);flashL.intensity=40;setTimeout(()=>flashL.intensity=0,90);try{noise(1.1,'lowpass',400,.6);sweep(90,30,.9,'sine',.45)}catch(e){}const RR=RG;if(RR){RR.cans.forEach(cn=>{const dd=cn.m.position.distanceTo(p);if(dd<4){cn.rest=false;cn.v.set(cn.m.position.x-p.x,2,cn.m.position.z-p.z).normalize().multiplyScalar(9*(1-dd/4)+2);cn.w.set(rnd(-20,20),rnd(-20,20),rnd(-20,20))}});RR.plates.forEach(P=>{if(P.g.position.distanceTo(p)<5)P.tv+=4})}}
function rangeTargetHit(k,h,nrm){const O=RG,ob=h.object;
  if(k==='can'){const cn=O.cans.find(c2=>c2.m===ob);if(cn){cn.rest=false;cn.v.copy(_d).multiplyScalar(rnd(4,7)).add(new V3(rnd(-1,1),rnd(2.5,4.5),0));cn.w.set(rnd(-30,30),rnd(-30,30),rnd(-30,30));clk(3800,2,.06,.35,h.distance/343);ping(rnd(1800,2600),.12,.08,h.distance/343);for(let j=0;j<4;j++)particle(SPARK,h.point,nrm.clone().multiplyScalar(rnd(1,2)).add(new V3(rnd(-.5,.5),rnd(0,1),rnd(-.5,.5))),.008,-.4,.2,0xffe0a0,1,true,.5);ui.score(++O.canHits+' can hits');}return true}
  if(k==='boom'){O.W.remove(ob);O.ray.splice(O.ray.indexOf(ob),1);O.booms.splice(O.booms.indexOf(ob),1);explodeAt(h.point,O.far>100);return true}
  if(k==='balloon'){const bl=O.balloons.find(q=>q.b===ob);O.W.remove(ob.userData.g);O.ray.splice(O.ray.indexOf(ob),1);O.balloons.splice(O.balloons.indexOf(bl),1);clk(1500,.5,.08,.6,h.distance/343);for(let j=0;j<14;j++)particle(SMOKE,h.point,new V3(rnd(-2,2),rnd(-1,2),rnd(-2,2)),.03,-.2,.4,ob.material.color.getHex(),1,false,1);return true}
  if(k==='clay'){const cl=O.clays.find(q=>q.m===ob);if(cl){O.W.remove(ob);O.ray.splice(O.ray.indexOf(ob),1);O.clays.splice(O.clays.indexOf(cl),1);O.clayHits++;ui.score('Clays: '+O.clayHits+' / '+O.clayN+' 🥏');for(let j=0;j<10;j++){const g=new T.Mesh(new T.CircleGeometry(rnd(.02,.04),3),std({color:0xe8601a,side:T.DoubleSide}));g.position.copy(h.point);fxRoot.add(g);bits.push({o:g,v:cl.v.clone().multiplyScalar(.5).add(new V3(rnd(-3,3),rnd(0,3),rnd(-3,3))),ax:new V3(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize(),rs:rnd(10,30),life:rnd(4,7),r:.01})}for(let j=0;j<16;j++)particle(SMOKE,h.point,cl.v.clone().multiplyScalar(.3).add(new V3(rnd(-1,1),rnd(0,1),rnd(-1,1))),rnd(.08,.16),1.2,rnd(.6,1.2),0xe06020,.7,false,.3);clk(2400,.8,.1,.4,h.distance/343)}return true}
  if(k==='tire'){const P=ob.userData.P;P.tv+=_d.z<0?-2.2:2.2;clk(200,.8,.1,.4,h.distance/343);for(let j=0;j<5;j++)particle(SMOKE,h.point,nrm.clone().multiplyScalar(rnd(.3,1)),rnd(.03,.06),1,rnd(.3,.6),0x222222,.6);return true}
  if(k==='pane'){if(ob.parent)ob.parent.remove(ob);O.ray.splice(O.ray.indexOf(ob),1);shatterSnd(h.distance);for(let i=0;i<24;i++){const g=ext([[0,0],[rnd(.02,.06),rnd(-.01,.01)],[rnd(0,.04),rnd(.02,.06)]],.003,ob.material,{bev:0});g.position.copy(h.point).add(new V3(rnd(-.3,.3),rnd(-.2,.2),rnd(-.1,.1)));fxRoot.add(g);bits.push({o:g,v:_d.clone().multiplyScalar(rnd(1,3)).add(new V3(rnd(-1,1),rnd(0,2),rnd(-1,1))),ax:new V3(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize(),rs:rnd(10,30),life:rnd(8,14),r:.002,snd:'glass'})}return true}
  return false}
function launchClay(){const O=RG;if(!O||!O.clays)return;const side=Math.random()<.5?-1:1;const m=new T.Mesh(new T.CylinderGeometry(.055,.055,.025,20),std({color:0xe8601a,roughness:.6}));m.position.set(side*7,.8,-16);m.userData.k='clay';O.W.add(m);O.ray.push(m);const v=new V3(-side*rnd(7,11),rnd(9,12),-rnd(3,7));O.clays.push({m,v,t:0});O.clayN++;ui.score('Clays: '+O.clayHits+' / '+O.clayN+' 🥏');clk(300,.8,.15,.5,.05);ping(180,.1,.2,.05)}
function stepRangeExtras(dt){const O=RG;if(!O||!O.cans)return;const g=9.81;
  O.cans.forEach(cn=>{if(cn.rest)return;cn.v.y-=g*dt;cn.m.position.addScaledVector(cn.v,dt);cn.m.rotation.x+=cn.w.x*dt;cn.m.rotation.z+=cn.w.z*dt;if(cn.m.position.y<.035){cn.m.position.y=.035;if(cn.v.y<-1.5)clk(3000,1.5,.04,.12*Math.min(1,-cn.v.y/5),0);cn.v.y*=-.35;cn.v.x*=.7;cn.v.z*=.7;cn.w.multiplyScalar(.7);if(cn.v.length()<.3){cn.rest=true;cn.m.rotation.x=PI/2;cn.m.rotation.z=rnd(0,6)}}});
  (O.clays||[]).forEach(cl=>{cl.t+=dt;cl.v.y-=g*.6*dt;cl.m.position.addScaledVector(cl.v,dt);cl.m.rotation.y+=dt*20});for(let i=O.clays.length-1;i>=0;i--){const cl=O.clays[i];if(cl.m.position.y<0||cl.t>6){O.W.remove(cl.m);O.ray.splice(O.ray.indexOf(cl.m),1);O.clays.splice(i,1)}}
  O.balloons.forEach(b=>{b.ph+=dt;b.g.position.y=b.y+Math.sin(b.ph*1.3)*.08;b.g.rotation.z=Math.sin(b.ph)*.12});
  O.tires.forEach(P=>{const h2=Math.min(dt,.02);P.tv+=(-9.81/P.L*Math.sin(P.th)-.4*P.tv)*h2;P.th+=P.tv*h2;P.piv.rotation.x=P.th});
  if(O.mover){O.moveT+=dt;O.mover.g.position.x=Math.sin(O.moveT*.45)*9}}
/* desert easter egg: an old RV someone has turned into a chemistry lab */
let eggFound=false;
function eggHit(o){if(eggFound)return;eggFound=true;toast('🧪 Found the desert RV. Someone’s been doing chemistry out here…')}
function buildRV(R2,O,x,z,rot){const g=grp(R2,x,0,z);g.rotation.y=rot;
  const mark=m=>{m.castShadow=true;m.receiveShadow=true;m.userData.k='steelEnv';m.userData.egg=true;O.ray.push(m);return m};
  const cream=std({color:0xe8dcc0,roughness:.75}),stripe=std({color:0x8a5a2a,roughness:.7}),dark=std({color:0x222222,roughness:.9}),rust=std({color:0x7a4a2a,roughness:1});
  const glass=phy({color:0x4a5a60,roughness:.1,transparent:true,opacity:.55,metalness:.2});
  // body: boxy motorhome with a sloped nose
  const body=ext([[-3.6,.55],[3.2,.55],[3.6,.9],[3.6,2.3],[3.1,2.9],[-3.6,2.9]],2.3,cream,{bev:.08});body.position.z=-1.15;g.add(mark(body));
  const band=new T.Mesh(new T.BoxGeometry(7.2,.22,2.34),stripe);band.position.set(-.1,1.35,0);g.add(band);
  const band2=new T.Mesh(new T.BoxGeometry(7.2,.1,2.34),rust);band2.position.set(-.1,1.12,0);g.add(band2);
  [[2.9,1.9,1.18,.9,.7],[2.9,1.9,-1.18,.9,.7],[.6,2.05,1.18,1.3,.55],[-1.6,2.05,1.18,1.1,.55],[-1.6,2.05,-1.18,1.1,.55]].forEach(([wx,wy,wz,ww,wh])=>{const w=new T.Mesh(new T.BoxGeometry(ww,wh,.04),glass);w.position.set(wx,wy,wz);g.add(w)});
  const ws=new T.Mesh(new T.BoxGeometry(.04,.7,1.9),glass);ws.position.set(3.59,1.95,0);g.add(ws);
  // open side door with a dark interior
  const hole=new T.Mesh(new T.BoxGeometry(.7,1.7,.05),dark);hole.position.set(-.4,1.45,1.17);g.add(hole);
  const door=new T.Mesh(new T.BoxGeometry(.7,1.7,.05),cream);door.position.set(-.05,1.45,1.5);door.rotation.y=-1.2;g.add(mark(door));
  // wheels, bumper, roof vent
  const tm=std({color:0x151515,roughness:.95});[[2.4,1.1],[2.4,-1.1],[-2.4,1.1],[-2.4,-1.1]].forEach(([a,b])=>g.add(cylZ(.42,.3,a,.42,b,tm,18)));
  const bump=new T.Mesh(new T.BoxGeometry(.15,.25,2.3),std({color:0x9a9a9a,metalness:.8,roughness:.4}));bump.position.set(3.7,.7,0);g.add(bump);
  const vent=new T.Mesh(new T.BoxGeometry(.7,.25,.7),std({color:0xcfcfcf,roughness:.6}));vent.position.set(-1.2,3.02,0);g.add(vent);
  // a dark flat-brim hat left on the roof
  const hatM=std({color:0x151515,roughness:.8});const brim=new T.Mesh(new T.CylinderGeometry(.34,.34,.03,20),hatM);brim.position.set(1.6,2.93,.2);g.add(brim);const crown=new T.Mesh(new T.CylinderGeometry(.19,.22,.17,20),hatM);crown.position.set(1.6,3.03,.2);g.add(crown);
  // folding table with lab glassware
  const tbl=grp(g,-.6,0,2.6);const top=new T.Mesh(new T.BoxGeometry(1.6,.05,.7),std({color:0x9a9a9a,metalness:.6,roughness:.4}));top.position.y=.75;tbl.add(mark(top));[[-.75,-.3],[.75,-.3],[-.75,.3],[.75,.3]].forEach(([a,b])=>{const l=new T.Mesh(new T.CylinderGeometry(.015,.015,.75,6),dark);l.position.set(a,.375,b);tbl.add(l)});
  const labG=phy({color:0xcfe8f0,roughness:.05,transparent:true,opacity:.5});const liq=std({color:0x5ab8e8,roughness:.2,emissive:0x0a3040,emissiveIntensity:.4});
  [[-.55,0],[-.2,.12],[.2,-.1],[.55,.05]].forEach(([a,b],i)=>{const f=new T.Mesh(i%2?new T.CylinderGeometry(.05,.13,.26,14):new T.SphereGeometry(.12,14,10),labG);f.position.set(a,.9,b);tbl.add(mark(f));const lq=new T.Mesh(i%2?new T.CylinderGeometry(.07,.12,.1,14):new T.SphereGeometry(.08,12,8),liq);lq.position.set(a,i%2?.83:.87,b);tbl.add(lq);const nk=new T.Mesh(new T.CylinderGeometry(.025,.025,.14,8),labG);nk.position.set(a,i%2?1.07:1.05,b);tbl.add(nk)});
  const burner=new T.Mesh(new T.CylinderGeometry(.09,.1,.1,12),dark);burner.position.set(.2,.83,.25);tbl.add(burner);
  // two yellow hazmat suits with gas masks drying on a line, plus two camp chairs
  const suitM=std({color:0xe8c820,roughness:.7});[[1.5,3.2],[2.3,3.2]].forEach(([a,b])=>{const s2=grp(g,a,0,b);const t=new T.Mesh(new T.BoxGeometry(.5,.8,.18),suitM);t.position.y=1.6;s2.add(mark(t));[-.14,.14].forEach(o=>{const l=new T.Mesh(new T.BoxGeometry(.18,.7,.16),suitM);l.position.set(o,.9,0);s2.add(l)});const m=new T.Mesh(new T.SphereGeometry(.13,12,8),dark);m.position.set(0,2.15,.02);s2.add(m)});
  const line=new T.Mesh(new T.CylinderGeometry(.008,.008,2.2,4),dark);line.rotation.z=PI/2;line.position.set(1.9,2.3,3.2);g.add(line);[.8,3.0].forEach(a=>{const p=new T.Mesh(new T.CylinderGeometry(.03,.03,2.3,6),rust);p.position.set(a,1.15,3.2);g.add(p)});
  const chM=std({color:0x2a5a8a,roughness:.8});[[-2.2,2.9],[-1.6,3.5]].forEach(([a,b],i)=>{const c2=grp(g,a,0,b);c2.rotation.y=i?.6:-.3;const seat=new T.Mesh(new T.BoxGeometry(.5,.05,.45),chM);seat.position.y=.42;c2.add(seat);const back=new T.Mesh(new T.BoxGeometry(.5,.5,.05),chM);back.position.set(0,.68,-.22);back.rotation.x=-.2;c2.add(back)});
  // a pair of trousers blown into the scrub
  const pants=grp(g,-4.5,.05,5);pants.rotation.set(-PI/2,0,.7);const pm=std({color:0x8a7a5a,roughness:1});[-.1,.1].forEach(o=>{const l=new T.Mesh(new T.BoxGeometry(.17,.8,.05),pm);l.position.set(o,-.35,0);l.rotation.z=o*1.2;pants.add(l)});const w2=new T.Mesh(new T.BoxGeometry(.38,.2,.05),pm);w2.position.y=.1;pants.add(w2);
  // a few blue chemical drums
  const drum=std({color:0x2a4aa8,roughness:.6,metalness:.2});[[-3.2,1.8],[-3.5,2.5],[-2.8,2.4]].forEach(([a,b])=>{const d=new T.Mesh(new T.CylinderGeometry(.28,.28,.85,16),drum);d.position.set(a,.425,b);g.add(mark(d))});
}
function buildDesert(){const R2=deserW,O={ray:[],plates:[],bottles:[],melons:[],surf:[],cans:[],booms:[],balloons:[],tires:[],clays:[],canHits:0,clayHits:0,clayN:0,W:deserW,far:420,drillN:6,paper:null,moveT:0,bottleG:BOTTLE_G,bottleMats:BOTTLE_M};
  skyDome(R2,'#2f64b0','#c8d4dc',0xfff6e0);
  const sand=ctex(512,512,(x,w,h)=>{x.fillStyle='#b08c60';x.fillRect(0,0,w,h);blotch(x,w,h,80,['150,120,85','190,160,115','130,100,70'],10,70,.3);speck(x,w,h,26)},60,120,true);
  const gnd=new T.Mesh(new T.PlaneGeometry(400,800),std({map:sand,roughness:1}));gnd.rotation.x=-PI/2;gnd.position.z=-380;gnd.receiveShadow=true;R2.add(gnd);gnd.userData.k='sand';O.ray.push(gnd);
  const sun=new T.DirectionalLight(0xfff0dc,1.7);sun.position.set(18,30,8);sun.target.position.set(0,0,-12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-16,right:16,top:20,bottom:-40,near:1,far:90});sun.shadow.bias=-.0006;R2.add(sun,sun.target);R2.add(new T.HemisphereLight(0xb8d4f4,0x7a5a3a,.4));
  // shooting bench + roof
  const woodM=std({map:OAK,roughness:.7});const cnt=new T.Mesh(new T.BoxGeometry(1.8,.06,.6),woodM);cnt.position.set(0,1.0,-.45);cnt.castShadow=cnt.receiveShadow=true;R2.add(cnt);cnt.userData.k='wood';O.ray.push(cnt);O.surf.push({x0:-.9,x1:.9,z0:-.75,z1:-.15,h:1.03,s:'wood'});[-.8,.8].forEach(x=>{const l=new T.Mesh(new T.BoxGeometry(.08,1,.5),woodM);l.position.set(x,.5,-.45);R2.add(l)});
  const roof=new T.Mesh(new T.BoxGeometry(5,.1,4),std({color:0x6a5a48,roughness:.9}));roof.position.set(0,3,.3);roof.castShadow=true;R2.add(roof);[[-2.3,-1.5],[2.3,-1.5],[-2.3,2],[2.3,2]].forEach(([x,z])=>{const p=new T.Mesh(new T.BoxGeometry(.12,3,.12),woodM);p.position.set(x,1.5,z);R2.add(p)});
  // distance signs + gongs
  [25,50,100,200,300].forEach(d=>signPost(R2,-3-d*.02,d,d+'m',1+d/120));
  mkPlate(R2,O,-1.2,.5,50,.25,{k:1.2});mkPlate(R2,O,1.4,.5,50,.2,{col:'#e8321e'});mkPlate(R2,O,-1,.8,100,.4,{k:1.6});mkPlate(R2,O,2,.8,100,.3,{k:1.4,col:'#2a6ae8'});mkPlate(R2,O,0,1.2,200,.6,{k:2.4});mkPlate(R2,O,0,1.8,300,.9,{k:3.2,col:'#e46a1e'});
  const mv=mkPlate(R2,O,0,.2,60,0,{sil:true,noLegs:true});O.mover=mv;const rail=new T.Mesh(new T.BoxGeometry(22,.08,.08),std({color:0x55575a,metalness:.8}));rail.position.set(0,mv.g.position.y+.02,-60);R2.add(rail);[-11,11].forEach(x=>{const p=new T.Mesh(new T.BoxGeometry(.1,mv.g.position.y+.1,.1),std({color:0x444}));p.position.set(x,(mv.g.position.y)/2,-60);R2.add(p)});
  // fence with cans, log with bottles, melon posts
  const fw=std({color:0x8a6a44,roughness:.9});const rl=new T.Mesh(new T.BoxGeometry(5,.08,.12),fw);rl.position.set(0,1,-20);R2.add(rl);rl.userData.k='wood';O.ray.push(rl);[-2.4,0,2.4].forEach(x=>{const p=new T.Mesh(new T.BoxGeometry(.1,1,.1),fw);p.position.set(x,.5,-20);R2.add(p)});O.surf.push({x0:-2.5,x1:2.5,z0:-20.06,z1:-19.94,h:1.04,s:'wood'});
  O.canHome=[];[-2,-1.3,-.6,.6,1.3,2].forEach((x,i)=>{mkCan(R2,O,x,1.04,20,['#c81e1e','#1e6ac8','#e8b020','#2aa04a'][i%4])});
  const log=new T.Mesh(new T.CylinderGeometry(.2,.22,3,12),std({color:0x6a4a2a,roughness:1}));log.rotation.z=PI/2;log.position.set(-3.5,.2,-14);log.castShadow=true;R2.add(log);log.userData.k='wood';O.ray.push(log);O.surf.push({x0:-5,x1:-2,z0:-14.1,z1:-13.9,h:.4,s:'wood'});O.bottleXs=[-4.6,-4,-3.4,-2.8];O.bottleY=.4;O.bottleZ=-14;
  O.stand=std({color:0x3b3d40,metalness:.7,roughness:.55});const mt=ctex(256,128,(x,w,h)=>{x.fillStyle='#2f6b27';x.fillRect(0,0,w,h);for(let i=0;i<14;i++){x.fillStyle='#1c4717';x.fillRect(i*w/14,0,8,h)}},1,1,true);O.melonMat=std({map:mt,roughness:.45});O.fleshMat=std({color:0xd63240,roughness:.6});O.rindMat=std({color:0x2c5f24,roughness:.5});O.melonSpots=[[3.2,.9,30],[4.2,.9,32]];O.melonSpots.forEach(([x,y,z])=>{const p=new T.Mesh(new T.CylinderGeometry(.03,.05,y,10),O.stand);p.position.set(x,y/2,-z);R2.add(p)});
  O.boomSpots=[[-2,1.2,80,'tan'],[1.5,1.2,80,'tan'],[4,1.6,150,'tan']];O.boomSpots.forEach(([x,y,z])=>{const p=new T.Mesh(new T.BoxGeometry(.12,y,.12),std({color:0x7a5a3a,roughness:.9}));p.position.set(x,y/2,-z);R2.add(p);p.userData.k='wood';O.ray.push(p)});
  // clay trap houses
  [-7,7].forEach(x=>{const h=new T.Mesh(new T.BoxGeometry(1.2,.8,1.2),std({color:0x7a6a50,roughness:.9}));h.position.set(x,.4,-16);h.castShadow=true;R2.add(h)});
  // scenery: mesas, cacti, berm
  const mm=std({color:0xa8704a,roughness:1,flatShading:true});for(let i=0;i<22;i++){const x=rnd(-400,400),z=rnd(-700,-420),hh=rnd(30,90);const m=new T.Mesh(new T.CylinderGeometry(rnd(30,80),rnd(50,110),hh,7),mm);m.position.set(x,hh/2-2,z);R2.add(m)}
  const cm=std({color:0x3a6a3a,roughness:.8});for(let i=0;i<40;i++){const x=rnd(-60,60),z=rnd(-360,-8);if(Math.abs(x)<8)continue;const c2=grp(R2,x,0,z);const tr=new T.Mesh(new T.CylinderGeometry(.18,.22,rnd(1.4,3),8),cm);tr.position.y=.9;tr.castShadow=true;c2.add(tr);[-1,1].forEach(s2=>{if(Math.random()<.7){const a=new T.Mesh(new T.CylinderGeometry(.1,.12,.8,8),cm);a.position.set(s2*.3,1.2+rnd(0,.5),0);c2.add(a)}})}
  const berm=new T.Mesh(new T.BoxGeometry(60,8,6),std({map:sand,roughness:1}));berm.position.set(0,2,-330);R2.add(berm);berm.userData.k='sand';O.ray.push(berm);
  // easter egg: a beat-up RV parked off to the left, with a chemistry set-up out front
  buildRV(R2,O,-19,-44,.55);
  O.surf.push({x0:-200,x1:200,z0:-800,z1:10,h:0,s:'concrete'});
  O.reset=()=>resetExtras(O);RGS.desert=O;resetExtras(O)}
function buildYard(){const R2=yardW,O={ray:[],plates:[],bottles:[],melons:[],surf:[],cans:[],booms:[],balloons:[],tires:[],clays:[],canHits:0,clayHits:0,clayN:0,W:yardW,far:90,drillN:2,paper:null,bottleG:BOTTLE_G,bottleMats:BOTTLE_M};
  skyDome(R2,'#6a6aa8','#f0a868',0xffc890);
  const dirt=ctex(512,512,(x,w,h)=>{x.fillStyle='#7a6448';x.fillRect(0,0,w,h);blotch(x,w,h,90,['90,70,50','120,100,76','60,50,40'],8,60,.35);speck(x,w,h,30)},20,20,true);
  const gnd=new T.Mesh(new T.PlaneGeometry(200,200),std({map:dirt,roughness:1}));gnd.rotation.x=-PI/2;gnd.position.z=-60;gnd.receiveShadow=true;R2.add(gnd);gnd.userData.k='sand';O.ray.push(gnd);
  const sun=new T.DirectionalLight(0xffc890,2.2);sun.position.set(-20,14,-10);sun.target.position.set(0,0,-14);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-14,right:14,top:20,bottom:-20,near:1,far:70});sun.shadow.bias=-.0006;R2.add(sun,sun.target);R2.add(new T.HemisphereLight(0xffd8b0,0x5a4a3a,.75));
  const woodM=std({map:OAK,roughness:.7});const cnt=new T.Mesh(new T.BoxGeometry(1.8,.06,.6),woodM);cnt.position.set(0,1.0,-.45);cnt.castShadow=cnt.receiveShadow=true;R2.add(cnt);cnt.userData.k='wood';O.ray.push(cnt);O.surf.push({x0:-.9,x1:.9,z0:-.75,z1:-.15,h:1.03,s:'wood'});[-.8,.8].forEach(x=>{const l=new T.Mesh(new T.BoxGeometry(.08,1,.5),woodM);l.position.set(x,.5,-.45);R2.add(l)});
  // fence with cans
  const fw=std({color:0x7a5a3a,roughness:.9});const rl=new T.Mesh(new T.BoxGeometry(6,.08,.12),fw);rl.position.set(0,1.1,-9);R2.add(rl);rl.userData.k='wood';O.ray.push(rl);[-2.9,0,2.9].forEach(x=>{const p=new T.Mesh(new T.BoxGeometry(.1,1.1,.1),fw);p.position.set(x,.55,-9);R2.add(p)});
  [-2.6,-1.9,-1.2,-.5,.5,1.2,1.9,2.6].forEach((x,i)=>mkCan(R2,O,x,1.14,9,['#c81e1e','#1e6ac8','#e8b020','#2aa04a','#e8e8e8'][i%5]));
  // barrels with bottles
  const bm=std({color:0x4a5a7a,metalness:.6,roughness:.6,roughnessMap:RM});[-3.2,-2.4].forEach(x=>{const b=new T.Mesh(new T.CylinderGeometry(.3,.3,.9,16),bm);b.position.set(x,.45,-13);b.castShadow=true;R2.add(b);b.userData.k='steelEnv';O.ray.push(b)});O.surf.push({x0:-3.55,x1:-2.05,z0:-13.3,z1:-12.7,h:.9,s:'steel'});O.bottleXs=[-3.4,-3.05,-2.6,-2.25];O.bottleY=.9;O.bottleZ=-13;
  // wrecked car with windows
  const car=grp(R2,3.5,0,-16);car.rotation.y=-.5;const pm=std({color:0x6a3a2a,metalness:.4,roughness:.7,roughnessMap:RM});const body=ext([[-2.15,.32],[2.15,.32],[2.2,.72],[1.25,.84],[.6,1.34],[-1.2,1.38],[-1.8,.95],[-2.2,.85]],1.75,pm,{bev:.06});car.add(body);body.traverse(o=>{o.userData.k='steelEnv'});O.ray.push(body);body.castShadow=true;
  O.carG=car;O.paneMat=phy({color:0x9ab8c8,roughness:.05,transparent:true,opacity:.45,metalness:.1});
  const tm=std({color:0x151515,roughness:.95});[[1.35,.8],[1.35,-.8],[-1.35,.8],[-1.35,-.8]].forEach(([a,b])=>car.add(cylZ(.37,.26,a,.37,b,tm,18)));
  // tire frame
  const tf=std({color:0x5a4a3a,roughness:.9});const beam=new T.Mesh(new T.BoxGeometry(4,.14,.14),tf);beam.position.set(-1,2.6,-20);R2.add(beam);[-3,1].forEach(x=>{const p=new T.Mesh(new T.BoxGeometry(.14,2.6,.14),tf);p.position.set(x,1.3,-20);R2.add(p)});[-2.3,-1,.3].forEach(x=>mkTire(R2,O,x,2.55,20));
  // plates
  mkPlate(R2,O,-4.5,.5,24,.18);mkPlate(R2,O,-3.8,.6,24,.14,{col:'#e8321e'});mkPlate(R2,O,5.5,.3,26,0,{sil:true});
  // pumpkins on hay bales
  const hay=std({color:0xc8a84a,roughness:1});[[1.5,11],[2.6,11.4]].forEach(([x,z])=>{const h=new T.Mesh(new T.BoxGeometry(.9,.5,.5),hay);h.position.set(x,.25,-z);h.castShadow=true;R2.add(h);h.userData.k='wood';O.ray.push(h)});O.melonSpots=[[1.5,.5,11],[2.6,.5,11.4]];O.melonMat=std({color:0xe8761e,roughness:.5});O.fleshMat=std({color:0xf0a040,roughness:.6});O.rindMat=std({color:0xc85a14,roughness:.5});
  O.boomSpots=[[-5,0,18,'propane'],[6,0,21,'propane']];O.balloonSpots=[[-1,1.6,15,0xe8321e],[-.4,1.9,15.3,0x2a6ae8],[.3,1.7,15,0xf2c21a],[1,2,15.4,0x2aa04a]];
  // scrap piles, fence
  const sm=std({color:0x5a4a40,roughness:.95,flatShading:true});for(let i=0;i<14;i++){const m=new T.Mesh(new T.ConeGeometry(rnd(2,4),rnd(1.5,3.5),6),i%2?sm:std({color:0x7a4a2a,metalness:.4,roughness:.8,flatShading:true}));m.position.set(rnd(-14,14),1,-rnd(26,40));R2.add(m);m.userData.k='steelEnv';O.ray.push(m)}
  const fm=std({color:0x8a8a8e,metalness:.6,roughness:.6});const fence=new T.Mesh(new T.BoxGeometry(40,3,.1),fm);fence.position.set(0,1.5,-44);R2.add(fence);fence.userData.k='steelEnv';O.ray.push(fence);
  O.surf.push({x0:-100,x1:100,z0:-160,z1:10,h:0,s:'concrete'});
  O.reset=()=>resetExtras(O);RGS.yard=O;resetExtras(O)}
function resetExtras(O){const R2=O.W;
  O.cans.forEach(cn=>{cn.rest=true;cn.v.set(0,0,0);cn.m.position.set(...cn.home);cn.m.rotation.set(0,rnd(0,6),0)});O.canHits=0;
  O.bottles.forEach(b=>{R2.remove(b);O.ray.splice(O.ray.indexOf(b),1)});O.bottles=[];(O.bottleXs||[]).forEach((x,i)=>{const b=new T.Mesh(O.bottleG,O.bottleMats[i%5]);b.position.set(x,O.bottleY,O.bottleZ);b.castShadow=true;b.userData.k='glass';R2.add(b);O.bottles.push(b);O.ray.push(b)});
  O.melons.forEach(m=>{R2.remove(m);O.ray.splice(O.ray.indexOf(m),1)});O.melons=[];(O.melonSpots||[]).forEach(([x,y,z])=>{const m=new T.Mesh(new T.SphereGeometry(.12,28,20),O.melonMat);m.scale.set(1.18,.92,.95);m.position.set(x,y+.11,-z);m.castShadow=true;m.userData.k='melon';R2.add(m);O.melons.push(m);O.ray.push(m)});
  O.booms.forEach(m=>{R2.remove(m);O.ray.splice(O.ray.indexOf(m),1)});O.booms=[];(O.boomSpots||[]).forEach(([x,y,z,k])=>mkBoom(R2,O,x,y,z,k));
  O.balloons.forEach(b=>{R2.remove(b.g);O.ray.splice(O.ray.indexOf(b.b),1)});O.balloons=[];(O.balloonSpots||[]).forEach(([x,y,z,c2])=>mkBalloon(R2,O,x,y,z,c2));
  if(O.carG){(O.panes||[]).forEach(p=>{O.carG.remove(p);const i=O.ray.indexOf(p);if(i>=0)O.ray.splice(i,1)});O.panes=[];[[1.6,.44,.9,.02,.6,1.12,-.1],[1.6,.44,.9,.02,.6,1.12,.1]].length;const mk=(w,h,x,y,z,ry,rz)=>{const p=new T.Mesh(new T.PlaneGeometry(w,h),O.paneMat);p.material.side=T.DoubleSide;p.position.set(x,y,z);p.rotation.set(0,ry,rz);p.userData.k='pane';O.carG.add(p);O.panes.push(p);O.ray.push(p)};mk(.8,.3,-.6,1.14,.9,0,0);mk(.7,.28,.22,1.12,.9,0,0);mk(.8,.3,-.6,1.14,-.9,0,0);mk(.7,.28,.22,1.12,-.9,0,0)}
  O.clays.forEach(cl=>{R2.remove(cl.m);O.ray.splice(O.ray.indexOf(cl.m),1)});O.clays=[];O.clayHits=0;O.clayN=0;
  O.plates.forEach(p=>{p.hit=false;p.paint(p.base||'#ecebe6')});O.tires.forEach(P=>{P.th=0;P.tv=0})}
function nextRange(){const ks=Object.keys(RMAPS);selectRange(ks[(ks.indexOf(RMAP)+1)%ks.length]);ui.toast('🗺 '+RMAPS[RMAP])}
function hideRanges(){rangeW.visible=deserW.visible=yardW.visible=false}
function selectRange(m){if(!RMAPS[m])m='indoor';RMAP=m;S.set('gs_map',m);hideRanges();if(m==='indoor'){if(!RGS.indoor)buildRange();RG=RGS.indoor}else if(m==='desert'){if(!RGS.desert)buildDesert();RG=RGS.desert}else{if(!RGS.yard)buildYard();RG=RGS.yard}RG.W.visible=true;ray.far=RG.far;
  scene.environment=m==='indoor'?ENV_R.texture:m==='desert'?ENV_D.texture:ENV_Y.texture;scene.background=new T.Color(m==='indoor'?0x0b0b0c:m==='desert'?0x9cc4e8:0xd89a6a);scene.fog=m==='desert'?new T.Fog(0xb8c0c4,220,1100):m==='yard'?new T.Fog(0xd8a070,40,140):null;camera.far=m==='indoor'?140:1500;camera.updateProjectionMatrix();renderer.toneMappingExposure=m==='indoor'?1.15:m==='desert'?.78:.9;
  drill.on=false;drill.wait=0;ui.drill&&ui.drill(null);ui.score(m==='indoor'?'Paper at '+RG.paper.dist+' m · shoot the plates, bottles and melon':m==='desert'?'Steel out to 300 m · exploding targets at 80 and 150 m · moving target at 60 m · press K or 🥏 for clays':'Cans, bottles, car windows, swinging tires, propane, pumpkins and balloons');setRoom('range');ui.sync()}
/* ---------- physics: rigid casings, mags, debris ---------- */
const fxRoot=grp(scene);const bodies=[],bits=[],parts=[],decals=[];
const _q=new T.Quaternion(),_a=new V3(),_b=new V3(),_r=new V3(),_n=new V3(0,1,0),_t=new V3(),_vc=new V3(),_ax=new V3(),_u=new V3(),_w=new V3(),_c=new V3(),_e1=new V3(),_e2=new V3();
function surfaces(){return MODE==='bench'?surfB:(RG?RG.surf:[])}
function groundAt(x,z,y){let h=MODE==='bench'?floorB:0,s=MODE==='bench'?'wood':'concrete';for(const q of surfaces()){if(x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1&&q.h<=y+.03&&q.h>h){h=q.h;s=q.s}}return[h,s]}
function iinv(b,u,out){_q.copy(b.o.quaternion).invert();out.copy(u).applyQuaternion(_q);out.x*=b.Ii.x;out.y*=b.Ii.y;out.z*=b.Ii.z;return out.applyQuaternion(b.o.quaternion)}
function contact(b,px,py,pz,dt){const[gy,s]=groundAt(px,pz,py);const pen=gy-py;if(pen<=0)return 0;const x=b.o.position;_r.set(px-x.x,py-x.y,pz-x.z);_vc.copy(b.w).cross(_r).add(b.v);const vn=_vc.y;b.touch=true;
  if(vn<0){_a.copy(_r).cross(_n);iinv(b,_a,_b);_b.cross(_r);const k=1/b.m+_b.y;const e=vn<-.5?b.e:0;const jn=-(1+e)*vn/k;b.v.y+=jn/b.m;_a.copy(_r).cross(_n).multiplyScalar(jn);iinv(b,_a,_b);b.w.add(_b);
    _vc.copy(b.w).cross(_r).add(b.v);_t.set(_vc.x,0,_vc.z);const vt=_t.length();if(vt>1e-6){_t.multiplyScalar(1/vt);_a.copy(_r).cross(_t);iinv(b,_a,_b);_b.cross(_r);const kt=1/b.m+_b.dot(_t);const jt=Math.min(vt/kt,b.mu*jn);b.v.addScaledVector(_t,-jt/b.m);_a.copy(_r).cross(_t).multiplyScalar(-jt);iinv(b,_a,_b);b.w.add(_b)}
    if(-vn>.3&&(b.sndT<=0)){impactSnd(b,-vn,s);b.sndT=.03}}return pen}
function stepBody(b,dt){if(b.sleep)return;const o=b.o,x=o.position,q=o.quaternion;b.sndT-=dt;b.v.y-=9.81*dt;b.v.multiplyScalar(1-.05*dt);b.w.multiplyScalar(1-.25*dt);x.addScaledVector(b.v,dt);
  _q.set(b.w.x*dt*.5,b.w.y*dt*.5,b.w.z*dt*.5,0).multiply(q);q.set(q.x+_q.x,q.y+_q.y,q.z+_q.z,q.w+_q.w).normalize();
  let pen=0;b.touch=false;
  if(b.circ){_ax.set(0,1,0).applyQuaternion(q);const ay=_ax.y;_u.set(-ay*_ax.x,1-ay*ay,-ay*_ax.z);const L=_u.length();
    for(const cc of b.circ){_c.copy(x).addScaledVector(_ax,cc.o);if(L>.12){_u.multiplyScalar(1/L);pen=Math.max(pen,contact(b,_c.x-_u.x*cc.r,_c.y-_u.y*cc.r,_c.z-_u.z*cc.r,dt));_u.multiplyScalar(L)}
      else{_e1.set(1,0,0);if(Math.abs(_ax.x)>.9)_e1.set(0,0,1);_e1.cross(_ax).normalize();_e2.copy(_ax).cross(_e1);const cx=_c.x,cy=_c.y,cz=_c.z;for(let k=0;k<3;k++){const an=k*2.094,ca=Math.cos(an)*cc.r,sa=Math.sin(an)*cc.r;pen=Math.max(pen,contact(b,cx+_e1.x*ca+_e2.x*sa,cy+_e1.y*ca+_e2.y*sa,cz+_e1.z*ca+_e2.z*sa,dt))}}}}
  if(b.pts)for(const p of b.pts){_c.copy(p).applyQuaternion(q).add(x);pen=Math.max(pen,contact(b,_c.x,_c.y,_c.z,dt))}
  if(pen>0){x.y+=pen*.9;b.w.multiplyScalar(1-Math.min(.5,b.roll*dt))}
  if(b.touch&&b.v.lengthSq()<2e-4&&b.w.lengthSq()<.6){b.rest+=dt;if(b.rest>.5){b.sleep=true;b.v.set(0,0,0);b.w.set(0,0,0)}}else b.rest=0;
  if(x.y<-6)b.dead=true}
function addBody(o,opt){const b=Object.assign({o,v:new V3(),w:new V3(),m:1,e:.4,mu:.35,roll:3,sndT:0,rest:0,sleep:false,kind:'brass',f:3000},opt);fxRoot.add(o);bodies.push(b);
  const cap=MODE==='bench'?90:60;while(bodies.length>cap){const d=bodies.shift();fxRoot.remove(d.o)}return b}
const QYX=new T.Quaternion().setFromAxisAngle(new V3(0,0,1),-PI/2);
function spawnCase(k,spent,pos,quat,v,w){const C=CAL[k],m=caseMesh(k,spent);m.position.copy(pos);m.quaternion.copy(quat);const L=C.len,r=C.r;
  const circles=C.shell?[{o:-L/2,r:.0112},{o:L/2,r:.0104}]:C.neck?[{o:-L/2,r:C.rim},{o:-L/2+L*C.sh,r:r*.985},{o:L/2,r:C.neck}]:[{o:-L/2,r:C.rim},{o:L/2,r:r*.985}];
  if(!spent&&!C.shell)circles.push({o:L/2+C.bl*.55,r:.0006});
  const Iy=r*r,Ix=r*r/2+L*L/12;return addBody(m,{v,w,Ii:new V3(1/Ix,1/Iy,1/Ix),circ:circles,kind:C.shell?'shell':'brass',f:C.f,e:C.shell?.22:.42,mu:C.shell?.5:.32,roll:C.shell?5:2.2})}
function boxBody(g,kind){const pos=g.position.clone(),q=g.quaternion.clone();g.position.set(0,0,0);g.quaternion.identity();g.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(g);const cL=bb.getCenter(new V3()),sz=bb.getSize(new V3());
  g.children.forEach(ch=>ch.position.sub(cL));g.position.copy(pos).add(cL.clone().applyQuaternion(q));g.quaternion.copy(q);const hx=sz.x*.45,hy=sz.y*.47,hz=sz.z*.45,pts=[];for(const a of[-1,1])for(const b2 of[-1,1])for(const c2 of[-1,1])pts.push(new V3(a*hx,b2*hy,c2*hz));
  const Ix=(sz.y*sz.y+sz.z*sz.z)/12,Iy=(sz.x*sz.x+sz.z*sz.z)/12,Iz=(sz.x*sz.x+sz.y*sz.y)/12;return addBody(g,{Ii:new V3(1/Ix,1/Iy,1/Iz),pts,kind,e:.18,mu:.6,roll:6})}
function stepBits(dt){for(let i=bits.length-1;i>=0;i--){const b=bits[i],o=b.o;b.life-=dt;if(b.life<=0){fxRoot.remove(o);bits.splice(i,1);continue}if(b.rest)continue;b.v.y-=9.81*dt;o.position.addScaledVector(b.v,dt);o.rotateOnAxis(b.ax,b.rs*dt);
  const[gy,s]=groundAt(o.position.x,o.position.z,o.position.y);if(o.position.y<gy+b.r){o.position.y=gy+b.r;if(b.v.y<-.8&&b.snd)impactSnd({kind:b.snd},-b.v.y*.5,s);if(b.juice){addDecal(o.position.clone().setY(gy+.001),_n,rnd(.03,.08),DEC.juice);b.life=0}b.v.y*=-.25;b.v.x*=.6;b.v.z*=.6;b.rs*=.5;if(Math.abs(b.v.y)<.3&&b.v.x*b.v.x+b.v.z*b.v.z<.01)b.rest=true}}}

/* ---------- visual effects ---------- */
const FLASH=ctex(128,128,(x,w,h)=>{const cx=w/2;x.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const a=i/10*PI*2+Math.random()*.3,L=w*rnd(.22,.48);x.save();x.translate(cx,cx);x.rotate(a);const g=x.createLinearGradient(0,0,L,0);g.addColorStop(0,'rgba(255,240,200,.9)');g.addColorStop(.4,'rgba(255,170,60,.55)');g.addColorStop(1,'rgba(255,90,20,0)');x.fillStyle=g;x.beginPath();x.moveTo(0,-w*.035);x.lineTo(L,0);x.lineTo(0,w*.035);x.fill();x.restore()}
  const g=x.createRadialGradient(cx,cx,0,cx,cx,w*.24);g.addColorStop(0,'rgba(255,255,245,1)');g.addColorStop(.35,'rgba(255,210,120,.85)');g.addColorStop(1,'rgba(255,120,30,0)');x.fillStyle=g;x.fillRect(0,0,w,h)},1,1,true);
const FLAME=ctex(128,64,(x,w,h)=>{x.globalCompositeOperation='lighter';for(let k=0;k<3;k++){x.save();x.translate(0,h/2+rnd(-3,3));x.scale(1,.28+k*.06);const g=x.createRadialGradient(0,0,0,0,0,w*(1-k*.2));g.addColorStop(0,'rgba(255,250,225,1)');g.addColorStop(.18,'rgba(255,205,120,.85)');g.addColorStop(.55,'rgba(255,120,40,.3)');g.addColorStop(1,'rgba(255,70,10,0)');x.fillStyle=g;x.fillRect(0,-h*4,w,h*8);x.restore()}},1,1,true);
const SMOKE=ctex(64,64,(x,w,h)=>{const g=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(.5,'rgba(255,255,255,.22)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h);const id=x.getImageData(0,0,w,h);for(let i=3;i<id.data.length;i+=4)id.data[i]*=rnd(.6,1);x.putImageData(id,0,0)},1,1);
const SPARK=ctex(32,32,(x,w,h)=>{const g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,255,230,1)');g.addColorStop(.3,'rgba(255,190,90,.9)');g.addColorStop(1,'rgba(255,100,20,0)');x.fillStyle=g;x.fillRect(0,0,w,h)},1,1);
[FLASH,FLAME,SMOKE,SPARK].forEach(t=>{t.wrapS=t.wrapT=T.ClampToEdgeWrapping});
const addM=map=>new T.MeshBasicMaterial({map,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,toneMapped:false});
const FX=grp(null);{const f=new T.Mesh(new T.PlaneGeometry(1,1),addM(FLASH));f.geometry.rotateY(PI/2);FX.add(f);for(let i=0;i<2;i++){const g2=new T.PlaneGeometry(1.6,.55);g2.translate(.8,0,0);const s=new T.Mesh(g2,addM(FLAME));s.rotation.x=i*PI/2;FX.add(s)}FX.visible=false}
const trG=new T.CylinderGeometry(.009,.009,1,6,1,true);trG.rotateX(PI/2);const trM=new T.MeshBasicMaterial({color:0xffe8b0,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});const tracers=[];let lastMz=new V3();
function tracer(a,b){const d=b.clone().sub(a),L=d.length();if(L<.4)return;const m=new T.Mesh(trG,trM);d.normalize();m.quaternion.setFromUnitVectors(new V3(0,0,1),d);fxRoot.add(m);tracers.push({m,a:a.clone(),d,L,s:0,len:Math.min(1.4,L*.35)});m.visible=false}
function stepTracers(dt){for(let i=tracers.length-1;i>=0;i--){const t=tracers[i];t.s+=dt*260;const head=Math.min(t.s,t.L),tail=Math.max(0,t.s-t.len);if(tail>=t.L){fxRoot.remove(t.m);tracers.splice(i,1);continue}const l=Math.max(.01,head-tail);t.m.visible=true;t.m.scale.set(1,1,l);t.m.position.copy(t.a).addScaledVector(t.d,tail+l/2)}}
const flashL=new T.PointLight(0xffa550,0,3,2);scene.add(flashL);let flashT=0;
const holeT=ctex(64,64,(x,w,h)=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.3,'rgba(10,8,6,.95)');g.addColorStop(.45,'rgba(60,55,50,.6)');g.addColorStop(1,'rgba(60,55,50,0)');x.fillStyle=g;x.fillRect(0,0,w,h)},1,1);holeT.wrapS=holeT.wrapT=T.ClampToEdgeWrapping;
const juiceT=ctex(64,64,(x,w,h)=>{for(let i=0;i<7;i++){x.fillStyle='rgba(170,20,35,.7)';x.beginPath();x.arc(32+rnd(-14,14),32+rnd(-14,14),rnd(5,14),0,7);x.fill()}},1,1);juiceT.wrapS=juiceT.wrapT=T.ClampToEdgeWrapping;
const DEC={hole:std({map:holeT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,roughness:1}),juice:std({map:juiceT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,roughness:.3})};
const decG=new T.PlaneGeometry(1,1);
function addDecal(p,nrm,size,mat){const m=new T.Mesh(decG,mat);m.scale.setScalar(size);m.position.copy(p).addScaledVector(nrm,.002);m.lookAt(_c.copy(p).add(nrm));m.rotateZ(Math.random()*6.3);fxRoot.add(m);decals.push(m);if(decals.length>140)fxRoot.remove(decals.shift())}
function particle(map,pos,vel,size,grow,life,col,op,add,grav){const mt=new T.SpriteMaterial({map,color:col||0xffffff,transparent:true,opacity:op,depthWrite:false,blending:add?T.AdditiveBlending:T.NormalBlending,toneMapped:!add});const s=new T.Sprite(mt);s.position.copy(pos);s.scale.setScalar(size);fxRoot.add(s);parts.push({s,v:vel,grow,life,max:life,op,grav:grav||0,drag:add?1:1.6});if(parts.length>260){const d=parts.shift();fxRoot.remove(d.s);d.s.material.dispose()}}
function stepParts(dt){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life-=dt;if(p.life<=0){fxRoot.remove(p.s);p.s.material.dispose();parts.splice(i,1);continue}p.v.y+=(p.grav?-9.81*p.grav:.12)*dt;p.v.multiplyScalar(1-Math.min(.9,p.drag*dt));p.s.position.addScaledVector(p.v,dt);p.s.scale.multiplyScalar(1+p.grow*dt);p.s.material.opacity=p.op*Math.min(1,p.life/p.max*1.6);p.s.material.rotation+=dt*.3}}

/* ---------- gun state + mount ---------- */
const mount=grp(null),recoil=grp(mount);scene.add(mount);
let W=null;const cache={};
const rec={x:0,v:0,a:0,av:0,tilt:0};let cos=[];
function co(gen){cos.push({g:gen,w:0});}
function runCos(dt){for(let i=cos.length-1;i>=0;i--){const c2=cos[i];if(c2.w>0){c2.w-=dt;continue}const r=c2.g.next(dt);if(r.done)cos.splice(i,1);else if(typeof r.value==='number')c2.w=r.value}}
function* tw(d,fn){let t=0;while(t<d){fn(ease(Math.min(1,t/d)));t+=yield}fn(1)}
function setGun(i){saveGunState();cos=[];if(W&&W.m)recoil.remove(W.m);const d=GUNS[i];let m=cache[d.id];if(!m){m=cache[d.id]=d.build();m.add(FX)}else m.add(FX);
  FX.position.set(...d.muzzle);FX.scale.setScalar(d.flash);
  W={i,d,m,P:m.P,mag:d.cap,ch:'live',locked:false,safe:false,mode:0,busy:false,trig:false,burst:0,cool:0,trigT:0,cyl:0,ch6:null,cocked:false,dust:false};
  if(d.type==='rev'){W.ch6=Array(6).fill('live');W.mag=0;m.P.rounds.forEach(r=>{r.visible=true;swapRound(r,false)});m.P.crane.rotation.x=0;m.P.cyl.rotation.x=0}
  if(d.type==='pump'||d.type==='bolt'||d.type==='sauto'||d.type==='lever')W.mag=d.cap;if(d.type==='garand')W.mag=d.cap-1;
  if(d.type==='break'){W.ch2=['live','live'];W.mag=0;m.P.shells.forEach(r=>{r.visible=true;swapRound(r,false)})}
  resetParts();recoil.position.set(d.pivot[0],d.pivot[1],0);m.position.set(-d.pivot[0],-d.pivot[1],0);recoil.add(m);rec.x=rec.v=rec.a=rec.av=rec.tilt=0;
  if(MODE==='bench'){mount.position.set(0,0,0);mount.rotation.set(0,0,0)}m.remove(FX);scene.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(m);m.add(FX);W.box=bb;W.len=bb.max.x-bb.min.x;W.low=bb.min.y;W.hi=bb.max.y;W.cen=bb.getCenter(new V3());
  bench.position.y=W.low-.035;surfB[0].h=W.low-.035;floorB=W.low-.9;key.target.position.set(W.cen.x,W.low,0);key.position.set(W.cen.x+.5,1.5,-1);rim.target.position.copy(W.cen);
  if(MODE==='zombie')restoreGunState();orb.fit=true;ui.sync();ui.toast(d.name+' · '+CAL[d.cal].n);if(MODE!=='zombie')S.set('gs_gun',i)}
const selAng=()=>W.d.selA?W.d.selA[W.mode+1]:(W.mode===0?1:W.mode===1?1.5:2)*PI/2,safeAng=()=>W.d.selA?W.d.selA[0]:0;
function resetParts(){const P=W.P,d=W.d;W.m.children.filter(o=>o.userData.tmp).forEach(o=>W.m.remove(o));if(P.cyl)P.cyl.children.filter(o=>o.userData.tmp).forEach(o=>P.cyl.remove(o));if(P.rounds)P.rounds.forEach(r=>r.position.x=.0082+CAL[P.cal].len/2);if(P.br){P.br.rotation.z=0;P.shells.forEach(r=>{r.position.x=P.sx;r.visible=true})}if(P.hammers)P.hammers.forEach(h=>h.rotation.z=.6);if(P.lever)P.lever.rotation.z=0;if(P.op)P.op.position.x=0;if(P.slide)P.slide.position.x=0;if(P.hammer)P.hammer.rotation.z=d.hammer||0;if(P.safety)P.safety.rotation.z=d.safety==='lever'?-.28:d.safety==='selector'?selAng():0;if(P.safety&&d.safety==='bolt')P.safety.rotation.x=0;if(P.trig){P.trig.rotation.z=0;P.trig.position.x=P.trig.userData.x0!=null?P.trig.userData.x0:(P.trig.userData.x0=P.trig.position.x)}
  if(P.mag){P.mag.position.set(0,0,0);P.mag.visible=true;if(P.mag.userData.top)P.mag.userData.top.visible=true}if(P.fore)P.fore.position.x=0;if(P.bolt){P.bolt.position.x=0;P.bolt.rotation.x=0}if(P.dust)P.dust.rotation.x=0;if(P.chandle)P.chandle.position.x=0;setCarrier(0);if(P.sred)P.sred.visible=true;if(P.safety&&d.safety==='cross')P.safety.position.z=0}
function swapRound(r,spent){const cm=r.children[0];const k=W?W.d.cal:'357';r.remove(cm);const n=caseMesh(k,spent);n.rotation.z=-PI/2;r.add(n)}
function setCarrier(v){const P=W&&W.P;if(!P)return;if(P.chandle&&W.d.recipCH)P.chandle.position.x=-v;if(P.carrier){const[x0,x1]=P.cx||[-.028,.030],L=x1-x0,vis=Math.max(.0005,L-v);P.carrier.scale.x=vis/L;P.carrier.position.x=(x0*(1-vis/L))}
  if(P.bolt&&(W.d.type==='pump'||W.d.type==='sauto')){const vis=Math.max(.0005,.065-v);P.bolt.scale.x=vis/.065;P.bolt.position.x=-.04*(1-vis/.065);if(P.bh)P.bh.position.x=-v}}
function setSlide(v){const P=W.P;if(P.slide)P.slide.position.x=-v;if(W.d.type==='ar')setCarrier(v);if(P.hammer&&W.d.hammer)P.hammer.rotation.z=Math.max(P.hammer.rotation.z,Math.min(W.d.hammer,v/W.d.travel*1.6*W.d.hammer))}

function ejectFrom(localPort,live,extraV){const d=W.d,m=W.m;m.updateMatrixWorld(true);const p=new V3(...localPort).applyMatrix4(m.matrixWorld);const q=new T.Quaternion();m.getWorldQuaternion(q);
  const ev=new V3(d.ev[0]*rnd(.8,1.2),d.ev[1]*rnd(.85,1.15),d.ev[2]*rnd(.8,1.2)).applyQuaternion(q);if(extraV)ev.add(extraV);const w=new V3(rnd(-12,12),rnd(-45,-18),rnd(-12,12)).applyQuaternion(q);
  spawnCase(d.cal,!live,p,q.clone().multiply(QYX),ev,w);if(!live&&d.cal!=='12'){for(let i=0;i<2;i++)particle(SMOKE,p,ev.clone().multiplyScalar(.15),.012,3,.8,0xcfcac2,.25)}}
function eject(live){ejectFrom(W.d.port,live)}

/* ---------- firing ---------- */
const QM=new T.Quaternion();
function muzzleWorld(){W.m.updateMatrixWorld(true);return new V3(...W.d.muzzle).applyMatrix4(W.m.matrixWorld)}
function fireFX(){const d=W.d,mp=muzzleWorld();lastMz.copy(mp);FX.visible=true;FX.rotation.x=Math.random()*PI;const s=d.flash*rnd(.8,1.25);FX.scale.set(s,s,s);flashT=.035;flashL.position.copy(mp);flashL.intensity=d.flash*90;
  W.m.getWorldQuaternion(QM);const fw=new V3(1,0,0).applyQuaternion(QM);
  for(let i=0;i<(d.cal==='12'?10:6);i++)particle(SMOKE,mp,fw.clone().multiplyScalar(rnd(.4,1.8)).add(new V3(rnd(-.15,.15),rnd(0,.2),rnd(-.15,.15))),d.flash*rnd(.25,.45),rnd(1.2,2.2),rnd(1.2,2.6),0xd9d4cc,rnd(.18,.32));
  for(let i=0;i<5;i++)particle(SPARK,mp,fw.clone().multiplyScalar(rnd(3,7)).add(new V3(rnd(-.8,.8),rnd(-.5,.8),rnd(-.8,.8))),.006,-.5,rnd(.08,.2),0xffc070,1,true,.5);
  sndShot(d.shot);rec.v+=d.kick*24;rec.av+=d.rise*(20*rnd(.85,1.15));W.trigT=1;
  if(MODE==='range')rangeShot();else if(MODE==='zombie')zShot();else tracer(mp,mp.clone().addScaledVector(fw,8))}
function ready(){return W&&!W.busy&&W.cool<=0}
function pull(){if(!ready())return;const d=W.d;
  if(W.safe){MECH.dry();ui.toast('Safety is ON · press F');W.cool=.25;W.burst=0;return}
  if(d.type==='rev'){co(revFire());return}
  if(d.type==='break'){const k=W.ch2.indexOf('live');W.trigT=1;if(k<0){MECH.dry();W.cool=.25;ui.toast('Both barrels fired · R to break open and reload');return}W.ch2[k]='spent';swapRound(W.P.shells[k],true);W.P.hammers[k].rotation.z=0;FX.position.set(d.muzzle[0],d.muzzle[1],k?-.0118:.0118);fireFX();W.cool=.2;ui.dirty=true;return}
  if(W.ch!=='live'){MECH.dry();W.trigT=1;if(W.P.hammer&&d.hammer)W.P.hammer.rotation.z=0;W.cool=.2;W.burst=0;if(W.locked||(W.mag===0&&!W.ch))ui.toast('Empty · press R to reload');else if(W.ch==='spent'||!W.ch)ui.toast('Nothing chambered · press E to rack');return}
  W.ch='spent';if(W.P.hammer&&d.hammer)W.P.hammer.rotation.z=0;fireFX();W.cool=60/d.rpm;
  if(d.type==='slide'||d.type==='ar')co(cycleSlide());else if(d.type==='pump')co(pumpCycle(.16));else if(d.type==='bolt')co(boltCycle(.35));else if(d.type==='sauto')co(sautoCycle(0));else if(d.type==='lever')co(leverCycle(.2));else if(d.type==='garand')co(garandCycle());ui.dirty=true}
function* cycleSlide(){W.busy=true;const d=W.d,tr=d.travel,P=W.P;if(P.dust&&!W.dust){W.dust=true;co(tw(.05,t=>P.dust.rotation.x=1.9*t))}
  yield* tw(.022,t=>setSlide(tr*t));eject(false);W.ch=null;MECH.slideB();
  if(W.mag>0){W.mag--;W.ch='live';yield* tw(.03,t=>setSlide(tr*(1-t)));MECH.slideF()}else{W.locked=true;yield* tw(.012,t=>setSlide(tr*(1-t*.08)));MECH.lock();ui.toast('Empty · '+(d.type==='ar'?'bolt':'slide')+' locked back · R to reload');W.burst=0}
  if(P.mag&&P.mag.userData.top)P.mag.userData.top.visible=W.mag>0;W.busy=false;ui.dirty=true}
function* rackSlide(){W.busy=true;const d=W.d,tr=d.travel,P=W.P;MECH.ch();
  if(d.type==='ar')yield* tw(.12,t=>{P.chandle.position.x=-.07*t;setSlide(tr*t)});else yield* tw(.11,t=>setSlide(tr*t));
  if(W.ch){eject(W.ch==='live');W.ch=null}yield .05;
  if(W.mag>0){W.mag--;W.ch='live';W.locked=false;if(d.type==='ar')yield* tw(.05,t=>{P.chandle.position.x=-.07*(1-t);setSlide(tr*(1-t))});else yield* tw(.04,t=>setSlide(tr*(1-t)));MECH.slideF()}
  else{W.locked=true;if(d.type==='ar')yield* tw(.05,t=>P.chandle.position.x=-.07*(1-t));MECH.lock();ui.toast('Magazine empty · R to reload')}
  W.busy=false;ui.dirty=true}
function* magReload(){W.busy=true;const d=W.d,P=W.P,old=P.mag,oldN=W.mag,dir=new V3(d.magDir[0],d.magDir[1],0).normalize();MECH.magOut();
  yield* tw(.09,t=>old.position.copy(dir).multiplyScalar(.035*t));
  old.updateMatrixWorld(true);fxRoot.attach(old);const b=boxBody(old,'mag');W.m.getWorldQuaternion(QM);b.v.copy(dir).applyQuaternion(QM).multiplyScalar(1.2);b.w.set(rnd(-2,2),rnd(-2,2),rnd(-4,4));if(old.userData.top)old.userData.top.visible=W.mag>0;
  const tmpG=d.build(),nm=tmpG.P.mag;tmpG.remove(nm);tmpG.traverse(o=>o.geometry&&o.geometry.dispose());W.m.add(nm);P.mag=nm;nm.position.copy(dir).multiplyScalar(.16);yield .28;
  yield* tw(.2,t=>nm.position.copy(dir).multiplyScalar(.16*(1-t)));MECH.magIn();giveBack(oldN);W.mag=take(d.cap);ui.dirty=true;
  if((W.locked||!W.ch)&&W.mag>0){yield .14;W.mag--;W.ch='live';W.locked=false;if(d.type==='ar')yield* tw(.03,t=>setCarrier(d.travel*(1-t)));else yield* tw(.035,t=>setSlide(d.travel*(1-t)));MECH.slideF()}
  W.busy=false;ui.dirty=true;const n=bodies.filter(x=>x.kind==='mag');if(n.length>6){const r=n[0];r.dead=true}}
function* pumpCycle(delay){W.busy=true;const P=W.P;if(delay)yield delay;MECH.pumpB();yield* tw(.11,t=>{P.fore.position.x=-.085*t;setCarrier(.065*t)});
  if(W.ch){eject(W.ch==='live');W.ch=null}yield .03;MECH.pumpF();yield* tw(.1,t=>{P.fore.position.x=-.085*(1-t);setCarrier(.065*(1-t))});if(W.mag>0){W.mag--;W.ch='live'}W.busy=false;ui.dirty=true}
const cycler=()=>W.d.type==='lever'?leverCycle:W.d.type==='sauto'?sautoCycle:pumpCycle;
function* tubeReload(){W.busy=true;const d=W.d,L=d.load||[[-.02,-.075,0],[.01,-.04,0],[.06,-.0245,0]];if(W.mag>=d.cap&&W.ch==='live'){W.busy=false;ui.toast('Already full');return}
  while(W.mag<d.cap&&hasRes()){take(1);const s=roundX(d.cal);s.userData.tmp=1;W.m.add(s);yield* tw(.16,t=>s.position.set(L[0][0]+(L[1][0]-L[0][0])*t,L[0][1]+(L[1][1]-L[0][1])*t,L[0][2]+(L[1][2]-L[0][2])*t));yield* tw(.08,t=>s.position.set(L[1][0]+(L[2][0]-L[1][0])*t,L[1][1]+(L[2][1]-L[1][1])*t,L[1][2]+(L[2][2]-L[1][2])*t));W.m.remove(s);MECH.shellIn();W.mag++;ui.dirty=true;yield .1}
  W.busy=false;if(W.ch!=='live')co(cycler()(.1))}
function* sautoCycle(delay){W.busy=true;if(delay)yield delay;yield* tw(.03,t=>setCarrier(.065*t));if(W.ch){eject(W.ch==='live');W.ch=null}MECH.slideB();yield* tw(.045,t=>setCarrier(.065*(1-t)));MECH.slideF();if(W.mag>0){W.mag--;W.ch='live'}W.busy=false;ui.dirty=true}
function* leverCycle(delay){W.busy=true;const P=W.P;if(delay)yield delay;clk(1500,2,.05,.4);yield* tw(.12,t=>{P.lever.rotation.z=.85*t;P.bolt.position.x=-.045*t;P.hammer.rotation.z=Math.max(P.hammer.rotation.z,.7*t)});
  if(W.ch){eject(W.ch==='live');W.ch=null}yield .03;clk(2200,2,.05,.45);yield* tw(.12,t=>{P.lever.rotation.z=.85*(1-t);P.bolt.position.x=-.045*(1-t)});if(W.mag>0){W.mag--;W.ch='live'}W.busy=false;ui.dirty=true}
const gmv=v=>{W.P.op.position.x=-v;W.P.bolt.position.x=-v};
function clipOut(n){ping(2700,.9,.2);ping(4150,.6,.09);ping(6800,.35,.04);const cl=clipMesh(n);W.m.add(cl);cl.position.set(0,.004,0);W.m.updateMatrixWorld(true);fxRoot.attach(cl);const b=boxBody(cl,'mag');b.kind='brass';b.f=2400;W.m.getWorldQuaternion(QM);b.v.set(rnd(-.3,.3),3.2,rnd(.2,.6)).applyQuaternion(QM);b.w.set(rnd(-9,9),rnd(-9,9),rnd(-9,9))}
function* garandCycle(){W.busy=true;yield* tw(.03,t=>gmv(W.d.travel*t));eject(false);W.ch=null;MECH.slideB();
  if(W.mag>0){W.mag--;W.ch='live';yield* tw(.035,t=>gmv(W.d.travel*(1-t)));MECH.slideF()}else{W.locked=true;clipOut(0);ui.toast('PING! Clip ejected · R to load a fresh clip');W.burst=0}W.busy=false;ui.dirty=true}
function* garandRack(){W.busy=true;MECH.ch();yield* tw(.12,t=>gmv(W.d.travel*t));if(W.ch){eject(W.ch==='live');W.ch=null}yield .05;if(W.mag>0){W.mag--;W.ch='live';yield* tw(.04,t=>gmv(W.d.travel*(1-t)));MECH.slideF()}else{if(!W.locked)clipOut(0);W.locked=true;ui.toast('Empty · R to load a clip')}W.busy=false;ui.dirty=true}
function* garandReload(){W.busy=true;const d=W.d;if(W.mag===d.cap-1&&W.ch==='live'){W.busy=false;ui.toast('Already full');return}
  if(!W.locked){yield* tw(.1,t=>gmv(d.travel*t));if(W.ch){eject(W.ch==='live');W.ch=null}giveBack(W.mag);clipOut(W.mag);W.mag=0;W.locked=true;yield .35}const got=take(8);if(!got){W.busy=false;return}
  const cl=clipMesh(got);cl.userData.tmp=1;W.m.add(cl);yield* tw(.24,t=>cl.position.set(0,.1*(1-t)+.004,0));MECH.magIn();W.m.remove(cl);yield .14;
  yield* tw(.03,t=>gmv(d.travel*(1-t)));MECH.slideF();W.mag=got-1;W.ch='live';W.locked=false;W.busy=false;ui.dirty=true}
function* breakReload(){W.busy=true;const P=W.P;clk(1300,2,.05,.4);yield* tw(.18,t=>P.br.rotation.z=-.5*t);clk(1100,2,.04,.4);
  yield* tw(.08,t=>P.shells.forEach(r=>r.position.x=P.sx-.02*t));W.m.updateMatrixWorld(true);W.m.getWorldQuaternion(QM);
  P.shells.forEach((r,k)=>{if(!r.visible)return;const wp=new V3(),wq=new T.Quaternion();r.getWorldPosition(wp);r.getWorldQuaternion(wq);spawnCase('12',W.ch2[k]!=='live',wp,wq.multiply(QYX),new V3(-2.2,1.8,rnd(-.3,.3)).applyQuaternion(QM),new V3(rnd(-8,8),rnd(-8,8),rnd(-8,8)));r.visible=false;r.position.x=P.sx});
  const got=MODE==='zombie'?(giveBack(W.ch2.filter(x=>x==='live').length),take(2)):2;yield .35;for(let k=0;k<got;k++){const r=P.shells[k];swapRound(r,false);r.visible=true;yield* tw(.16,t=>r.position.x=P.sx-.08*(1-t));MECH.shellIn();yield .06}
  yield* tw(.14,t=>P.br.rotation.z=-.5*(1-t));clk(1800,2,.05,.55);ping(2200,.06,.05);for(const h of P.hammers){yield* tw(.09,t=>h.rotation.z=.6*t);MECH.safe()}W.ch2=[got>0?'live':'empty',got>1?'live':'empty'];W.busy=false;ui.dirty=true}
function* boltCycle(delay){W.busy=true;const P=W.P;if(delay)yield delay;MECH.boltUp();yield* tw(.09,t=>P.bolt.rotation.x=-1.05*t);MECH.boltB();yield* tw(.12,t=>P.bolt.position.x=-.085*t);
  if(W.ch){eject(W.ch==='live');W.ch=null}yield .04;MECH.boltF();yield* tw(.12,t=>P.bolt.position.x=-.085*(1-t));if(W.mag>0){W.mag--;W.ch='live'}yield* tw(.08,t=>P.bolt.rotation.x=-1.05*(1-t));MECH.boltD();W.busy=false;ui.dirty=true}
function* boltReload(){W.busy=true;const d=W.d,P=W.P;if(W.mag>=d.cap&&W.ch==='live'){W.busy=false;ui.toast('Already full');return}MECH.boltUp();yield* tw(.09,t=>P.bolt.rotation.x=-1.05*t);yield* tw(.12,t=>P.bolt.position.x=-.085*t);if(W.ch){eject(W.ch==='live');W.ch=null}
  while(W.mag<d.cap&&hasRes()){take(1);const s=roundX('308');s.userData.tmp=1;W.m.add(s);yield* tw(.14,t=>s.position.set(-.035,.07-.065*t,0));W.m.remove(s);MECH.shellIn();W.mag++;ui.dirty=true;yield .06}
  MECH.boltF();yield* tw(.12,t=>P.bolt.position.x=-.085*(1-t));if(W.mag>0){W.mag--;W.ch='live'}yield* tw(.08,t=>P.bolt.rotation.x=-1.05*(1-t));MECH.boltD();W.busy=false;ui.dirty=true}
const revTop=()=>((6-(W.cyl%6))%6);
function* revFire(){W.busy=true;const P=W.P,a0=W.cyl*PI/3;const dur=W.cocked?.02:.1;
  yield* tw(dur,t=>{P.trig.rotation.z=-.42*t;if(!W.cocked){P.hammer.rotation.z=.62*t;P.cyl.rotation.x=a0+PI/3*t}});
  if(!W.cocked)W.cyl++;W.cocked=false;P.cyl.rotation.x=W.cyl*PI/3;P.hammer.rotation.z=0;const k=revTop();
  if(W.ch6[k]==='live'){W.ch6[k]='spent';swapRound(P.rounds[k],true);fireFX();W.cool=60/W.d.rpm}else{MECH.dry();if(!W.ch6.includes('live'))ui.toast('Cylinder empty · R to reload')}
  yield* tw(.06,t=>P.trig.rotation.z=-.42*(1-t));W.busy=false;ui.dirty=true}
function* revCock(){if(W.cocked)return;W.busy=true;const P=W.P,a0=W.cyl*PI/3;MECH.safe();yield* tw(.12,t=>{P.hammer.rotation.z=.62*t;P.cyl.rotation.x=a0+PI/3*t});W.cyl++;W.cocked=true;MECH.cyl();W.busy=false;ui.toast('Hammer cocked · single-action')}
function* revReload(){W.busy=true;const P=W.P;if(W.cocked){P.hammer.rotation.z=0;W.cocked=false}MECH.cyl();yield* tw(.2,t=>P.crane.rotation.x=-1.6*t);yield .1;
  yield* tw(.25,t=>rec.tilt=.72*t);yield* tw(.1,t=>P.rounds.forEach(r=>r.position.x=.0082+CAL[P.cal].len/2-.016*t));
  W.m.updateMatrixWorld(true);P.rounds.forEach((r,k)=>{const wp=new V3(),wq=new T.Quaternion();r.getWorldPosition(wp);r.getWorldQuaternion(wq);W.m.getWorldQuaternion(QM);const v=new V3(-1.2,rnd(-.1,.1),rnd(-.15,.15)).applyQuaternion(QM);spawnCase(P.cal,W.ch6[k]!=='live',wp,wq.multiply(QYX),v,new V3(rnd(-6,6),rnd(-6,6),rnd(-6,6)));r.visible=false;r.position.x=.0082+CAL[P.cal].len/2});
  clk(1500,2,.05,.35);yield .3;yield* tw(.2,t=>rec.tilt=.72-(.72-.3)*t);
  const ld=new T.Group();ld.add(cyl(.02,.02,-.012,0,0,0,MT.polySmooth,24));ld.add(cyl(.006,.006,-.03,-.012,0,0,MT.stainless,10));const fresh=[];for(let k=0;k<6;k++){const a=PI/2+k*PI/3,r=roundX(P.cal);r.position.set(CAL[P.cal].len/2+.001,Math.sin(a)*P.cr,-Math.cos(a)*P.cr);ld.add(r);fresh.push(r)}
  finish(ld);ld.userData.tmp=1;P.cyl.add(ld);yield* tw(.22,t=>ld.position.x=-.07+.0772*t);clk(1800,3,.03,.4);yield .12;
  const got=MODE==='zombie'?(giveBack(W.ch6.filter(x=>x==='live').length),take(6)):6;P.rounds.forEach((r,k)=>{r.visible=k<got;swapRound(r,false)});P.cyl.remove(ld);W.ch6=Array(6).fill(0).map((_,k)=>k<got?'live':'empty');yield* tw(.12,t=>rec.tilt=.3*(1-t));
  yield* tw(.14,t=>P.crane.rotation.x=-1.6*(1-t));MECH.slideF();W.busy=false;ui.dirty=true}
function reload(){if(!W||W.busy)return;const d=W.d;W.trig=false;if(!hasRes()){ui.toast('Out of spare ammo · buy more in the shop (Tab)');MECH.dry();return}if(d.type==='rev')co(revReload());else if(d.type==='pump'||d.type==='sauto'||d.type==='lever')co(tubeReload());else if(d.type==='bolt')co(boltReload());else if(d.type==='break')co(breakReload());else if(d.type==='garand')co(garandReload());else{if(W.mag===d.cap&&W.ch==='live'){ui.toast('Already full');return}co(magReload())}}
function rack(){if(!W||W.busy)return;const d=W.d;if(d.type==='rev')co(revCock());else if(d.type==='pump')co(pumpCycle(0));else if(d.type==='bolt')co(boltCycle(0));else if(d.type==='sauto')co(sautoCycle(0));else if(d.type==='lever')co(leverCycle(0));else if(d.type==='garand')co(garandRack());else if(d.type==='break')ui.toast('Break action · press R to open, eject and reload');else co(rackSlide())}
function toggleSafety(){if(!W||W.busy)return;const d=W.d,P=W.P;
  if(d.safety==='none'){ui.toast(d.type==='rev'?'Revolvers have no manual safety':'No manual safety · trigger-blade safety only');return}
  W.safe=!W.safe;MECH.safe();
  if(d.safety==='lever'||d.safety==='selector'){const a0=P.safety.rotation.z,a1=W.safe?(d.safety==='lever'?0:safeAng()):d.safety==='lever'?-.28:selAng();co(tw(.08,t=>P.safety.rotation.z=a0+(a1-a0)*t))}
  if(d.safety==='cross'){P.safety.position.z=W.safe?.003:0;P.sred.visible=!W.safe}
  if(d.safety==='bolt')P.safety.rotation.x=W.safe?-.6:0;if(d.safety==='garand')P.safety.rotation.z=W.safe?.5:0;ui.dirty=true;ui.toast(W.safe?'Safety ON':'Safety OFF · ready to fire')}
function cycleMode(){if(!W)return;const d=W.d;if(!d.modes){ui.toast({slide:'Semi-auto only',rev:'Double action · E to cock for single action',pump:'Pump action',bolt:'Bolt action',sauto:'Semi-auto only',lever:'Lever action',garand:'Semi-auto only',break:'Two triggers: right barrel, then left'}[d.type]);return}
  W.mode=(W.mode+1)%d.modes.length;MECH.safe();if(!W.safe&&d.safety==='selector'){const P=W.P,a0=P.safety.rotation.z,a1=selAng();co(tw(.08,t=>P.safety.rotation.z=a0+(a1-a0)*t))}ui.dirty=true;ui.toast(d.modes[W.mode])}
function trigDown(){if(!W)return;au();W.trig=true;const d=W.d;if(d.modes&&d.modes[W.mode]==='BURST')W.burst=3;pull()}
function trigUp(){if(W)W.trig=false}

/* ---------- range shooting ---------- */
const ray=new T.Raycaster();ray.far=60;const _d=new V3(),_o=new V3();
let yaw=0,pitch=-.03,ads=0,adsOn=false,kickP=0,kickY=0,paperMsgT=0;
const drill={on:false,t:0,wait:0,hits:0,splits:[]};
function rangeShot(){if(!RG)return;const d=W.d,n=d.pellets||1;camera.updateMatrixWorld(true);camera.getWorldPosition(_o);const hip=(1-ads)*(d.pellets?.015:.022);
  let paperHit=false;
  for(let i=0;i<n;i++){const sp=(d.pellets?d.spread*.5:0)+d.acc+hip,a=Math.random()*PI*2,r=Math.sqrt(Math.random())*sp;_d.set(Math.cos(a)*r,Math.sin(a)*r,-1).normalize().applyQuaternion(camera.quaternion);ray.set(_o,_d);
    const hits=ray.intersectObjects(RG.ray,false);if(i<3){const e=hits.find(h=>!['paper','glass','melon'].includes(h.object.userData.k));tracer(lastMz,e?e.point:_o.clone().addScaledVector(_d,Math.min(ray.far,120)))}for(const h of hits){if(h.object.userData.egg)eggHit(h.object);const k=h.object.userData.k,nrm=h.face?h.face.normal.clone().transformDirection(h.object.matrixWorld):_d.clone().negate();
      if(k==='can'||k==='boom'||k==='balloon'||k==='clay'||k==='tire'||k==='pane'){rangeTargetHit(k,h,nrm);break}
      if(k==='paper'){paperHit=true;paperHole(h);continue}
      if(k==='glass'){shatter(h.object,h.point);continue}
      if(k==='melon'){burstMelon(h.object,h.point);continue}
      if(k==='steel'){steelHit(h.object.userData.P,h);break}
      if(k==='steelEnv'){for(let j=0;j<6;j++)particle(SPARK,h.point,nrm.clone().multiplyScalar(rnd(1,3)).add(new V3(rnd(-1,1),rnd(0,1.5),rnd(-1,1))),.01,-.5,rnd(.1,.3),0xffc070,1,true,.6);addDecal(h.point,nrm,.012,DEC.hole);clk(2600,3,.03,.3,h.distance/343);break}
      if(k!=='sand')addDecal(h.point,nrm,k==='berm'?.05:k==='wood'?.014:.02,DEC.hole);const col=k==='sand'?0xc8a878:k==='berm'?0x3a342c:k==='wood'?0x9a7a50:0x8a857c;for(let j=0;j<5;j++)particle(SMOKE,h.point,nrm.clone().multiplyScalar(rnd(.3,1.2)).add(new V3(rnd(-.3,.3),rnd(0,.5),rnd(-.3,.3))),rnd(.04,.09),2,rnd(.5,1.2),col,.5);
      clk(k==='berm'?350:900,.8,.05,.25,h.distance/343);break}}
  kickP+=d.rise*.22*(1-ads*.35)*(d.modes&&d.modes[W.mode]!=='SEMI'?(1-ads*.45):1);kickY+=rnd(-1,1)*d.rise*.05*(1-ads*.5);if(paperHit)RG.paper.draw()}
function paperHole(h){const P=RG.paper,u=h.uv.x,v=h.uv.y;P.hits.push({u,v,cal:CAL[W.d.cal].r*2*(W.d.pellets?.8:1)});const dx=(u-.5)*P.PW,dy=(v-.5)*P.PH-P.BCY,dd=Math.hypot(dx,dy);let sc=0;for(let i=0;i<P.RINGS.length;i++)if(dd<=P.RINGS[i]){sc=10-i;break}
  P.shots++;P.score+=sc;clk(1200,.8,.02,.12,h.distance/343);ui.score('Paper at '+P.dist+' m · last '+(sc?sc:'miss')+(sc===10?' 🎯':'')+' · '+P.shots+' shots · '+P.score+' pts');if(P.hits.length>400)P.hits.splice(0,100)}
function steelHit(P,h){P.tv+=(W.d.pow||(W.d.shot===SHOT.sg?2.2:W.d.cal==='308'?3.4:W.d.cal==='556'?1.8:1.4))*(P.sil?.6:1);ding(h.distance,P.f);
  const nrm=new V3(0,0,1);for(let j=0;j<9;j++)particle(SPARK,h.point,nrm.clone().multiplyScalar(rnd(1,4)).add(new V3(rnd(-2,2),rnd(-1,2.5),rnd(-1,1))),.012,-.5,rnd(.1,.35),0xffc070,1,true,.7);
  if(h.uv){const x=h.uv.x*128,y=(1-h.uv.y)*128;P.cx.fillStyle='rgba(90,90,95,.9)';P.cx.beginPath();for(let i=0;i<12;i++){const a=i/12*PI*2,r=(i%2?2:6)*rnd(.7,1.3);P.cx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}P.cx.fill();P.pt.needsUpdate=true}
  if(drill.on&&!P.hit&&!P.sil){P.hit=true;drill.hits++;drill.splits.push(drill.t);P.cx.fillStyle='rgba(255,122,26,.55)';P.cx.fillRect(0,0,128,128);P.pt.needsUpdate=true;if(drill.hits>=(RG.drillN||5))endDrill()}}
function shatter(b,pt){const O=RG;O.W.remove(b);O.ray.splice(O.ray.indexOf(b),1);O.bottles.splice(O.bottles.indexOf(b),1);shatterSnd(pt.distanceTo(_o));const mat=b.material;
  for(let i=0;i<18;i++){const g=ext([[0,0],[rnd(.008,.03),rnd(-.006,.006)],[rnd(0,.02),rnd(.008,.03)]],.003,mat,{bev:0});const m=g;m.position.set(b.position.x+rnd(-.03,.03),b.position.y+rnd(.02,.26),b.position.z+rnd(-.03,.03));fxRoot.add(m);
    bits.push({o:m,v:new V3(rnd(-1.5,1.5),rnd(.5,3),rnd(-3.5,-.5)),ax:new V3(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize(),rs:rnd(10,30),life:rnd(8,14),r:.002,snd:'glass'})}
  for(let i=0;i<10;i++)particle(SPARK,pt,new V3(rnd(-1,1),rnd(0,1.5),rnd(-2,0)),.008,-.5,.25,0xdff4ff,.7,true,.6)}
function burstMelon(m,pt){const O=RG;O.W.remove(m);O.ray.splice(O.ray.indexOf(m),1);O.melons.splice(O.melons.indexOf(m),1);splatSnd(pt.distanceTo(_o));
  for(let i=0;i<16;i++){const g=new T.Mesh(new T.IcosahedronGeometry(rnd(.02,.05),0),i%3?O.fleshMat:O.rindMat);g.scale.set(rnd(.6,1.4),rnd(.4,1),rnd(.6,1.4));g.position.copy(m.position).add(new V3(rnd(-.06,.06),rnd(-.05,.06),rnd(-.06,.06)));g.castShadow=true;fxRoot.add(g);
    bits.push({o:g,v:new V3(rnd(-2.2,2.2),rnd(1,4),rnd(-3.5,.5)),ax:new V3(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize(),rs:rnd(5,15),life:rnd(10,16),r:.02})}
  for(let i=0;i<40;i++){const v=new V3(rnd(-2.5,2.5),rnd(.5,4),rnd(-4,.8));particle(SMOKE,m.position,v,rnd(.03,.07),.5,rnd(.4,.9),0xc01830,.85,false,1);if(i<14){const jb=new T.Mesh(new T.SphereGeometry(.006,6,4),O.fleshMat);jb.position.copy(m.position);fxRoot.add(jb);bits.push({o:jb,v:v.clone().multiplyScalar(.9),ax:_n.clone(),rs:0,life:3,r:.004,juice:true})}}}
function bringPaper(){if(!RG||!RG.paper)return;const P=RG.paper;if(P.target<2)P.target=P.prev||7;else{P.prev=P.target;P.target=1.25}clk(160,2,.3,.08);ui.sync();ui.toast(P.target<2?'Bringing your target up close…':'Sending the target back to '+P.target+' m')}
function startDrill(){if(!RG)return;resetTargets();drill.on=false;drill.hits=0;drill.splits=[];drill.t=0;drill.wait=rnd(1.4,2.8);ui.drill('STANDBY','Hit all '+(RG.drillN||5)+' steel plates as fast as you can');}
function endDrill(){drill.on=false;const t=drill.t;const b=c.best(Math.round(t*100)/100,true);ui.drill(t.toFixed(2)+'s',(b===Math.round(t*100)/100?'New best! ':'Best '+(b!=null?b.toFixed(2)+'s':'-')+' · ')+'splits '+drill.splits.map(s=>s.toFixed(2)).join(' · '));clk(3000,4,.2,.3);setTimeout(()=>{if(!drill.on&&!drill.wait)ui.drill(null)},6000)}

/* ---------- ZOMBIE SURVIVAL MODE ---------- */
const zoneW=grp(scene);zoneW.visible=false;let ZN=null;const ARENA=25;
const PRICE={p17:0,p19c:350,m1911:450,m9:500,snub:400,rev:700,p17s:900,m44:1300,p18:1500,de50:1800,coach:900,pump:1200,tac12:1600,lever:1300,smg:2000,auto12:2800,ak:2800,ar:3000,garand:2600,bolt:2200,bmg50:6000};
const DMG={'9':30,'45':44,'357':62,'38':36,'44':82,'50ae':98,'12':19,'556':42,'762':50,'308':140,'3006':120,'3030':78,'50bmg':360};
const PEN={'50bmg':5,'308':3,'3006':3,'762':2,'556':2,'3030':2,'44':2,'50ae':2};
const Z={wave:0,state:'idle',t:0,alive:[],hit:[],cash:0,hp:100,hurt:0,regen:0,owned:new Set(['p17']),res:{p17:68},st:{},kills:0,heads:0,toSpawn:0,spawnT:0,boss:false,over:false,shake:0};
const PL={x:0,z:8,vx:0,vz:0,bob:0,sp:0,y:0,vy:0,onG:true};let joy=null;
function take(n){if(MODE!=='zombie')return n;const id=W.d.id,r=Z.res[id]||0,g=Math.min(n,r);Z.res[id]=r-g;return g}
function giveBack(n){if(MODE==='zombie'&&n>0)Z.res[W.d.id]=(Z.res[W.d.id]||0)+n}
function hasRes(){return MODE!=='zombie'||(Z.res[W.d.id]||0)>0}
const ammoCost=d=>Math.round((d.cal==='50bmg'?600:d.pellets?220:['308','3006','3030','44','50ae'].includes(d.cal)?260:180)/10)*10;
const ammoPack=d=>d.cap*(d.cap<=8?4:3);
let ZMAP=S.get('gs_zmap','city');const ZMAPS={city:'City intersection',farm:'Farm at night',highway:'Highway pile-up'};if(!ZMAPS[ZMAP])ZMAP='city';
function buildZone(){if(ZN&&ZN.env)zoneW.remove(ZN.env);const R=grp(zoneW),O={env:R,ray:[],boxes:[],surf:[],fires:[],lamps:[],xb:[],xspots:[]};
  if(ZMAP==='city'){
  const asp=ctex(512,512,(x,w,h)=>{x.fillStyle='#2b2b2d';x.fillRect(0,0,w,h);blotch(x,w,h,90,['18,18,20','58,58,60','44,38,30'],10,60,.35);speck(x,w,h,30);x.strokeStyle='rgba(0,0,0,.6)';x.lineWidth=1.5;for(let i=0;i<16;i++){x.beginPath();let px=Math.random()*w,py=Math.random()*h;x.moveTo(px,py);for(let k=0;k<6;k++){px+=rnd(-25,25);py+=rnd(-25,25);x.lineTo(px,py)}x.stroke()}},12,12,true);
  const gnd=new T.Mesh(new T.PlaneGeometry(110,110),std({map:asp,roughness:.9}));gnd.rotation.x=-PI/2;gnd.receiveShadow=true;R.add(gnd);gnd.userData.k='floor';O.ray.push(gnd);
  const lm=std({color:0xb8921f,roughness:.8});for(let i=-50;i<50;i+=4){if(Math.abs(i)<5)continue;const a=new T.Mesh(new T.PlaneGeometry(2,.14),lm);a.rotation.x=-PI/2;a.position.set(i,.004,0);a.receiveShadow=true;R.add(a);const b=new T.Mesh(new T.PlaneGeometry(.14,2),lm);b.rotation.x=-PI/2;b.position.set(0,.004,i);b.receiveShadow=true;R.add(b)}
  const walk=std({color:0x57544f,roughness:.95,map:ctex(256,256,(x,w,h)=>{x.fillStyle='#8a867e';x.fillRect(0,0,w,h);x.strokeStyle='rgba(0,0,0,.3)';x.lineWidth=2;for(let i=0;i<=w;i+=64){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke()}blotch(x,w,h,30,['40,40,40','120,118,110'],8,40,.3);speck(x,w,h,20)},6,6,true)});
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{const m=new T.Mesh(new T.BoxGeometry(19.5,.16,19.5),walk);m.position.set(sx*15.25,.08,sz*15.25);m.receiveShadow=true;R.add(m);m.userData.k='floor';O.ray.push(m);O.surf.push({x0:sx*15.25-9.75,x1:sx*15.25+9.75,z0:sz*15.25-9.75,z1:sz*15.25+9.75,h:.16,s:'concrete'})});
  const winT=lit=>ctex(256,512,(x,w,h)=>{x.fillStyle='#3d3731';x.fillRect(0,0,w,h);blotch(x,w,h,24,['20,18,16','78,70,62'],10,60,.3);for(let r=0;r<8;r++)for(let c2=0;c2<4;c2++){const on=Math.random()<lit;x.fillStyle=on?'#ffc86a':'#0b0d12';x.fillRect(18+c2*60,30+r*60,36,40);if(!on&&Math.random()<.35){x.strokeStyle='rgba(160,160,170,.45)';x.beginPath();x.moveTo(18+c2*60,30+r*60);x.lineTo(54+c2*60,70+r*60);x.stroke()}}x.fillStyle='rgba(0,0,0,.5)';x.fillRect(0,h-40,w,40);speck(x,w,h,14)},1,1,true);
  const facades=[winT(.1),winT(.04),winT(.02)].map(t=>std({map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.22,roughness:.9}));
  for(let side=0;side<4;side++)for(let k=-3;k<=3;k++){if(k===0)continue;const w=8.6,h=rnd(9,18),d=9,b=new T.Mesh(new T.BoxGeometry(w,h,d),facades[(side*7+k+9)%3]);const s=k*9,o=ARENA+d/2+.6;
    if(side===0)b.position.set(s,h/2,-o);else if(side===1)b.position.set(s,h/2,o);else if(side===2){b.position.set(-o,h/2,s);b.rotation.y=PI/2}else{b.position.set(o,h/2,s);b.rotation.y=PI/2}R.add(b);b.userData.k='wall';O.ray.push(b)}
  }else zGround(R,O);
  const conc=std({color:0x9a968c,roughness:.92,map:ctex(128,128,(x,w,h)=>{x.fillStyle='#a19c92';x.fillRect(0,0,w,h);blotch(x,w,h,20,['80,78,70','150,146,138'],6,30,.3);speck(x,w,h,24)},1,1,true)});
  const addBox=(x,z,hx,hz,h)=>O.boxes.push({x0:x-hx,x1:x+hx,z0:z-hz,z1:z+hz,h:h||9});
  function jersey(x,z,rot){const m=ext([[-.32,0],[.32,0],[.13,.26],[.1,.82],[-.1,.82],[-.13,.26]],3,conc,{bev:.02});m.geometry.rotateY(PI/2);m.position.set(x,0,z);if(rot)m.rotation.y=PI/2;m.castShadow=m.receiveShadow=true;R.add(m);m.userData.k='concrete';O.ray.push(m);if(rot)addBox(x,z,.35,1.5,.82);else addBox(x,z,1.5,.35,.82)}
  function car(x,z,rot,col){const g=grp(R,x,0,z);if(rot)g.rotation.y=PI/2;const pm=std({color:col,metalness:.45,roughness:.6,roughnessMap:RM});
    const body=ext([[-2.15,.32],[2.15,.32],[2.2,.72],[1.25,.84],[.6,1.34],[-1.2,1.38],[-1.8,.95],[-2.2,.85]],1.75,pm,{bev:.06});g.add(body);
    g.add(ext([[-1.12,.97],[.52,.97],[.5,1.3],[-1.1,1.33],[-1.62,.99]],1.8,std({color:0x0e131a,metalness:.7,roughness:.12}),{bev:.02}));
    const tire=std({color:0x151515,roughness:.95}),rim2=std({color:0x777,metalness:.9,roughness:.4});[[1.35,.8],[1.35,-.8],[-1.35,.8],[-1.35,-.8]].forEach(([a,b])=>{const t=cylZ(.37,.26,a,.37,b,tire,18);g.add(t);g.add(cylZ(.22,.27,a,.37,b,rim2,12))});
    g.add(bxm(.05,.14,1.4,std({color:0xfff2c0,emissive:0x221100}),2.21,.62,0));g.add(bxm(.05,.1,1.4,std({color:0x7a0000,emissive:0x1a0000}),-2.21,.72,0));
    g.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;o.userData.k='steelEnv';O.ray.push(o)}});if(rot)addBox(x,z,1,2.3,1.38);else addBox(x,z,2.3,1,1.38)}
  function crate(x,z,s){const m=new T.Mesh(new T.BoxGeometry(s,s,s),std({map:OAK,roughness:.85}));m.position.set(x,s/2,z);m.rotation.y=rnd(-.3,.3);m.castShadow=m.receiveShadow=true;R.add(m);m.userData.k='wood';O.ray.push(m);addBox(x,z,s*.6,s*.6,s)}
  function barrel(x,z){const b=new T.Mesh(new T.CylinderGeometry(.3,.3,.9,16,1,true),std({color:0x5a2e18,metalness:.6,roughness:.7,roughnessMap:RM,side:T.DoubleSide}));b.position.set(x,.45,z);b.castShadow=true;R.add(b);b.userData.k='steelEnv';O.ray.push(b);addBox(x,z,.32,.32,.9);
    const L=new T.PointLight(0xff8a3a,2.2,11,2);L.position.set(x,1.3,z);R.add(L);O.fires.push({x,z,L})}
  function lamp(x,z,ang){const pm=std({color:0x2a2c2e,metalness:.7,roughness:.5});const p=new T.Mesh(new T.CylinderGeometry(.07,.1,6,10),pm);p.position.set(x,3,z);p.castShadow=true;R.add(p);p.userData.k='steelEnv';O.ray.push(p);
    const ax=Math.cos(ang),az=Math.sin(ang),arm=new T.Mesh(new T.BoxGeometry(1.6,.08,.08),pm);arm.position.set(x+ax*.8,5.95,z+az*.8);arm.rotation.y=-ang;R.add(arm);
    const hd=new T.Mesh(new T.BoxGeometry(.6,.12,.3),std({color:0xfff0c8,emissive:0xffd08a,emissiveIntensity:2}));hd.position.set(x+ax*1.55,5.85,z+az*1.55);hd.rotation.y=-ang;R.add(hd);
    const L=new T.SpotLight(0xffc98a,5,26,.95,.6,1.6);L.position.set(x+ax*1.55,5.8,z+az*1.55);L.target.position.set(x+ax*3,0,z+az*3);R.add(L,L.target);O.lamps.push(L);addBox(x,z,.15,.15)}
  function xbarrel(x,z){const b=new T.Mesh(new T.CylinderGeometry(.32,.32,.95,18),std({color:0xc01e14,metalness:.4,roughness:.5}));const band=new T.Mesh(new T.CylinderGeometry(.33,.33,.12,18),std({color:0xf2c21a,roughness:.6}));band.position.y=.1;b.add(band);b.position.set(x,.475,z);b.castShadow=true;b.userData.k='xbarrel';R.add(b);O.ray.push(b);const bx={x0:x-.34,x1:x+.34,z0:z-.34,z1:z+.34,h:.95};O.boxes.push(bx);O.xb.push({m:b,bx,x,z})}
  O.respawnX=()=>{O.xspots.forEach(([x,z])=>{if(!O.xb.some(q=>q.x===x&&q.z===z))xbarrel(x,z)})};
  if(ZMAP==='city'){
  lamp(-7,-7,PI/4);lamp(7,7,-3*PI/4);lamp(7,-7,3*PI/4);lamp(-7,7,-PI/4);
  car(-6,-9,0,0x7a2a22);car(10,4,1,0x2c4a6e);car(-12,11,0,0x5b5f4a);car(15,-14,1,0x8a8578);car(-16,-3,1,0x3a3f45);
  jersey(0,-16,0);jersey(4,16,0);jersey(-16,4.5,1);jersey(16,-3,1);jersey(-3,8,0);crate(8,-10,1);crate(9.1,-10.3,.8);crate(-9,14,1.1);crate(12,12,1);crate(-14,-12,1);
  barrel(-3,-4);barrel(5,11);barrel(-11,-15);O.xspots=[[-5,-14],[14,8],[-14,6],[6,-19]];}
  else if(ZMAP==='farm'){
  const red=std({color:0x8a2a1e,roughness:.9}),wht=std({color:0xd8d0c0,roughness:.9}),hayM=std({color:0xc8a84a,roughness:1});
  const barn=new T.Mesh(new T.BoxGeometry(10,6,8),red);barn.position.set(-13,3,-12);barn.castShadow=barn.receiveShadow=true;R.add(barn);barn.userData.k='wood';O.ray.push(barn);addBox(-13,-12,5,4,6);const roof=new T.Mesh(new T.CylinderGeometry(4.6,4.6,10.4,3,1,false),std({color:0x3a2a22,roughness:.9}));roof.rotation.z=PI/2;roof.rotation.y=0;roof.position.set(-13,7.2,-12);roof.scale.set(1,1,1.35);R.add(roof);const door=new T.Mesh(new T.PlaneGeometry(3,4),wht);door.position.set(-13,2,-7.99);R.add(door);
  const silo=new T.Mesh(new T.CylinderGeometry(2,2,12,18),std({color:0x9aa0a6,metalness:.5,roughness:.5}));silo.position.set(-5,6,-18);silo.castShadow=true;R.add(silo);silo.userData.k='steelEnv';O.ray.push(silo);addBox(-5,-18,2,2,12);
  function hay(x,z,r){const m=new T.Mesh(new T.BoxGeometry(1.6,.9,1),hayM);m.position.set(x,.45,z);m.rotation.y=r||0;m.castShadow=m.receiveShadow=true;R.add(m);m.userData.k='wood';O.ray.push(m);addBox(x,z,.85,.85,.9)}
  [[4,-6],[5.6,-6],[4.8,-6,0,1],[-6,8],[-7.6,8.3],[12,10],[12,11.2],[14,-4],[-2,14]].forEach(([x,z,,up])=>{hay(x,z);if(up){const m=new T.Mesh(new T.BoxGeometry(1.6,.9,1),hayM);m.position.set(x,1.35,z);R.add(m);O.ray.push(m);m.userData.k='wood'}});
  car(9,-14,1,0x2a6a2a);car(15,4,0,0x7a6a4a);crate(-2,-3,1);crate(8,14,1.1);
  const fence=std({color:0x6a5238,roughness:.9});for(const[x0,z0,x1,z1]of[[-24,20,-6,20],[6,20,24,20],[20,-24,20,-6]]){const L=Math.hypot(x1-x0,z1-z0);const rl=new T.Mesh(new T.BoxGeometry(L,.1,.08),fence);rl.position.set((x0+x1)/2,.9,(z0+z1)/2);rl.rotation.y=-Math.atan2(z1-z0,x1-x0);R.add(rl);const r2=rl.clone();r2.position.y=.5;R.add(r2);for(let k=0;k<=L;k+=2.5){const p=new T.Mesh(new T.BoxGeometry(.12,1.1,.12),fence);p.position.set(x0+(x1-x0)*k/L,.55,z0+(z1-z0)*k/L);R.add(p)}}
  barrel(-2,6);barrel(10,-2);barrel(-15,15);lamp(0,-8,PI/2);lamp(-8,6,0);O.xspots=[[3,-9],[-9,3],[11,7],[-3,17]];}
  else{
  car(-4,-8,1,0x7a2a22);car(-1,-11,0,0xd8d8d8);car(6,-3,1,0x2c4a6e);car(-10,4,0,0x5b5f4a);car(12,10,1,0x8a8578);car(3,13,0,0x222428);car(-14,-14,1,0xc8a02a);car(16,-12,0,0x3a3f45);
  const tr=grp(R,-6,0,12);tr.rotation.y=.35;const trM=std({color:0xd8d8d8,roughness:.6,metalness:.3});const trailer=new T.Mesh(new T.BoxGeometry(2.6,3,11),trM);trailer.position.set(0,1.9,0);trailer.castShadow=true;tr.add(trailer);trailer.userData.k='steelEnv';O.ray.push(trailer);const cab=new T.Mesh(new T.BoxGeometry(2.5,2.6,2.4),std({color:0x2a4a8a,metalness:.4,roughness:.5}));cab.position.set(0,1.6,6.9);tr.add(cab);cab.userData.k='steelEnv';O.ray.push(cab);addBox(-6,12,2.2,5.6,3.4);
  jersey(0,-18,0);jersey(3,-18,0);jersey(-18,0,1);jersey(18,2,1);jersey(8,8,0);jersey(-8,-4,1);jersey(12,-6,0);
  const pm=std({color:0x8a8680,roughness:.9});for(const x of[-10,10]){const p=new T.Mesh(new T.BoxGeometry(1.4,8,1.4),pm);p.position.set(x,4,-6);p.castShadow=true;R.add(p);p.userData.k='concrete';O.ray.push(p);addBox(x,-6,.7,.7,8)}const deck=new T.Mesh(new T.BoxGeometry(60,1,8),pm);deck.position.set(0,8.5,-6);deck.castShadow=true;R.add(deck);
  lamp(-12,12,-PI/4);lamp(12,-12,3*PI/4);lamp(12,12,-3*PI/4);barrel(2,-6);barrel(-12,-8);O.xspots=[[-2,-8],[8,2],[-12,8],[4,16],[14,-16]];}
  O.respawnX();
  scene.fog=null;const moon=new T.DirectionalLight(0x9db4e8,.7);moon.position.set(-18,30,-12);moon.castShadow=true;moon.shadow.mapSize.set(2048,2048);Object.assign(moon.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:80});moon.shadow.bias=-.0008;R.add(moon);
  R.add(new T.HemisphereLight(0x46587a,0x0c0c10,.55));
  const moonD=new T.Mesh(new T.SphereGeometry(3,20,14),new T.MeshBasicMaterial({color:0xe8eeff}));moonD.position.set(-60,55,-70);R.add(moonD);
  O.surf.push({x0:-60,x1:60,z0:-60,z1:60,h:0,s:'concrete'});ZN=O}
function zGround(R,O){const farm=ZMAP==='farm';
  const tx=farm?ctex(512,512,(x,w,h)=>{x.fillStyle='#2e3a22';x.fillRect(0,0,w,h);blotch(x,w,h,120,['40,52,28','60,50,34','30,40,22'],8,50,.4);speck(x,w,h,28)},14,14,true):ctex(512,512,(x,w,h)=>{x.fillStyle='#2b2b2d';x.fillRect(0,0,w,h);blotch(x,w,h,90,['18,18,20','58,58,60'],10,60,.35);speck(x,w,h,30)},12,12,true);
  const gnd=new T.Mesh(new T.PlaneGeometry(140,140),std({map:tx,roughness:.95}));gnd.rotation.x=-PI/2;gnd.receiveShadow=true;R.add(gnd);gnd.userData.k='floor';O.ray.push(gnd);
  if(farm){const path=new T.Mesh(new T.PlaneGeometry(4,56),std({color:0x4a3c2a,roughness:1}));path.rotation.x=-PI/2;path.position.y=.005;R.add(path);
    const cg=new T.CylinderGeometry(.04,.06,2.4,5);cg.translate(0,1.2,0);const cm=std({color:0x5a6a2a,roughness:.9});const pts=[];for(let x=-45;x<=45;x+=1.1)for(let z=-45;z<=45;z+=1.1){const ax=Math.abs(x),az=Math.abs(z);if(ax<ARENA+1.5&&az<ARENA+1.5)continue;if((ax<4&&az>ARENA)||(az<4&&ax>ARENA))continue;pts.push([x+rnd(-.3,.3),z+rnd(-.3,.3)])}
    const im=new T.InstancedMesh(cg,cm,pts.length);const mm=new T.Matrix4(),q=new T.Quaternion(),sc=new V3();pts.forEach(([x,z],i)=>{q.setFromEuler(new T.Euler(rnd(-.1,.1),rnd(0,6),rnd(-.1,.1)));sc.set(1,rnd(.8,1.3),1);mm.compose(new V3(x,0,z),q,sc);im.setMatrixAt(i,mm)});R.add(im);
    const tm=std({color:0x1a2616,roughness:1,flatShading:true});for(let i=0;i<40;i++){const a=i/40*PI*2,r=rnd(55,65),t=new T.Mesh(new T.ConeGeometry(rnd(3,5),rnd(9,15),6),tm);t.position.set(Math.cos(a)*r,5,Math.sin(a)*r);R.add(t)}}
  else{const lm=std({color:0xd8d0b0,roughness:.8});for(let z=-60;z<60;z+=5){for(const x of[-6,0,6]){const a=new T.Mesh(new T.PlaneGeometry(.15,2.4),lm);a.rotation.x=-PI/2;a.position.set(x,.004,z);R.add(a)}}
    const wm=std({color:0x8a8680,roughness:.95});for(const s2 of[-1,1]){for(const[a,b]of[[-ARENA-2,-4],[4,ARENA+2]]){const L=b-a;const w1=new T.Mesh(new T.BoxGeometry(.5,4,L),wm);w1.position.set(s2*(ARENA+1),2,(a+b)/2);R.add(w1);const w2=new T.Mesh(new T.BoxGeometry(L,4,.5),wm);w2.position.set((a+b)/2,2,s2*(ARENA+1));R.add(w2)}}
    const bb=new T.Mesh(new T.PlaneGeometry(10,4),std({map:ctex(512,200,(x,w,h)=>{x.fillStyle='#1a1a2a';x.fillRect(0,0,w,h);x.fillStyle='#ffd23f';x.font='900 70px Arial Black,sans-serif';x.textAlign='center';x.fillText('EXIT 47',w/2,90);x.fillStyle='#fff';x.font='700 40px sans-serif';x.fillText('Last gas for 90 miles',w/2,150)},1,1,true),emissive:0x333333,roughness:.8}));bb.position.set(8,10,-40);R.add(bb)}}
function zBoom(m,pt){const O=ZN;const q=O.xb.find(a=>a.m===m);if(!q)return;O.env.remove(m);O.ray.splice(O.ray.indexOf(m),1);O.boxes.splice(O.boxes.indexOf(q.bx),1);O.xb.splice(O.xb.indexOf(q),1);const p=m.position.clone().setY(.6);explodeAt(p,true);Z.shake=.6;addDecal(new V3(p.x,.012,p.z),_n,2.2,DEC.hole);
  for(const z of Z.alive){if(z.dead)continue;const dx=z.g.position.x-p.x,dz=z.g.position.z-p.z,d=Math.hypot(dx,dz);if(d>6)continue;const dir=new V3(dx/(d||1),0,dz/(d||1));z.hp-=380*(1-d/6);z.stag=.8;z.g.position.x+=dir.x*1.5*(1-d/6);z.g.position.z+=dir.z*1.5*(1-d/6);if(z.hp<=0)killZombie(z,false,dir)}
  const pd=Math.hypot(PL.x-p.x,PL.z-p.z);if(pd<3.2)hurtPlayer(30*(1-pd/3.2));ui.cashPop('💥 BOOM')}
function zSetMap(m){ZMAP=m;S.set('gs_zmap',m);buildZone();zRestart();ui.sync();ui.banner(ZMAPS[m],'Zombies arrive in 10 seconds')}
function zNextMap(){const ks=Object.keys(ZMAPS);zSetMap(ks[(ks.indexOf(ZMAP)+1)%ks.length])}
const ZMAT={skin:['#7f8e6c','#8c9474','#6f7a5e','#8f866f','#6b705f'].map(c=>std({roughness:.72,map:ctex(128,128,(x,w,h)=>{x.fillStyle=c;x.fillRect(0,0,w,h);blotch(x,w,h,26,['60,70,50','120,110,90','90,20,20','40,45,60'],5,22,.45);x.strokeStyle='rgba(50,40,70,.35)';x.lineWidth=1;for(let i=0;i<14;i++){x.beginPath();let px=Math.random()*w,py=Math.random()*h;x.moveTo(px,py);for(let k=0;k<5;k++){px+=rnd(-9,9);py+=rnd(-9,9);x.lineTo(px,py)}x.stroke()}for(let i=0;i<4;i++){x.fillStyle='rgba(95,5,8,.7)';x.beginPath();x.arc(Math.random()*w,Math.random()*h,rnd(2,7),0,7);x.fill()}speck(x,w,h,16)},1,1,true)})),
  shirt:['#5b6e84','#7a3b32','#8c8a7a','#3c4a3a','#a08a5a','#2d2d33'].map(c=>std({roughness:.9,map:ctex(128,128,(x,w,h)=>{x.fillStyle=c;x.fillRect(0,0,w,h);blotch(x,w,h,14,['30,24,18','70,10,8','50,40,30'],6,26,.55);for(let i=0;i<5;i++){x.fillStyle='rgba(20,15,12,.8)';x.fillRect(Math.random()*w,Math.random()*h,rnd(4,12),rnd(2,10))}speck(x,w,h,20)},1,1,true)})),
  pants:[0x2c3140,0x3b3226,0x4a4a44,0x23252a].map(c=>std({color:c,roughness:.9})),shoe:std({color:0x1a1714,roughness:.8}),eye:std({color:0xfff0b0,emissive:0xffcf60,emissiveIntensity:1.4}),mouth:std({color:0x2a0606,roughness:1}),hair:std({color:0x1c1814,roughness:1}),
  blood:std({color:0x5a0508,roughness:.4}),bone:std({color:0xd8cdb4,roughness:.6})};
const bloodT=ctex(64,64,(x,w,h)=>{for(let i=0;i<9;i++){x.fillStyle=`rgba(${rnd(70,110)|0},4,6,.8)`;x.beginPath();x.arc(32+rnd(-16,16),32+rnd(-16,16),rnd(4,13),0,7);x.fill()}},1,1);bloodT.wrapS=bloodT.wrapT=T.ClampToEdgeWrapping;
DEC.blood=std({map:bloodT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,roughness:.35});
const ZT={walker:{hp:100,sp:[.9,1.35],dmg:12,cash:50,s:1},runner:{hp:65,sp:[3.6,4.6],dmg:9,cash:70,s:.95},brute:{hp:480,sp:[1,1.25],dmg:26,cash:220,s:1.35},boss:{hp:1900,sp:[1.5,1.7],dmg:40,cash:1000,s:1.85}};
const zpick=a=>a[Math.random()*a.length|0];
function mkZombie(type){const g=new T.Group(),t=ZT[type],skin=zpick(ZMAT.skin),shirt=zpick(ZMAT.shirt),pants=zpick(ZMAT.pants),z={g,type,dead:false,hp:0,max:0,ph:rnd(0,6),atk:0,atkT:0,stag:0,fall:0,deadT:0,inside:false,arms:[],legs:[],lost:[false,false],parts:[]};
  const M=(geo,mat,x,y,zz,par,part)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,zz);m.castShadow=true;m.userData.zb=z;m.userData.part=part;par.add(m);z.parts.push(m);return m};
  const hips=grp(g,0,.95,0),tor=grp(hips);const to=M(new T.CylinderGeometry(.2,.16,.58,12),shirt,0,.3,0,tor,'torso');to.scale.z=.66;M(new T.CylinderGeometry(.17,.18,.22,12),pants,0,.0,0,hips,'torso').scale.z=.7;
  M(new T.CylinderGeometry(.055,.06,.12,8),skin,0,.64,0,tor,'head');const head=grp(tor,0,.7,0);const hm=M(new T.SphereGeometry(.125,16,12),skin,0,.09,0,head,'head');hm.scale.set(1,1.18,1.08);
  [-1,1].forEach(s=>M(new T.SphereGeometry(.018,8,6),ZMAT.eye,s*.045,.11,.112,head,'head'));M(new T.BoxGeometry(.07,.025,.02),ZMAT.mouth,0,.035,.118,head,'head');const hr=M(new T.SphereGeometry(.13,12,8,0,PI*2,0,1.1),ZMAT.hair,0,.12,-.01,head,'head');hr.scale.set(1.02,1.1,1.1);
  [-1,1].forEach((s,i)=>{const sh=grp(tor,s*.25,.52,0);M(new T.CylinderGeometry(.058,.05,.3,8),Math.random()<.5?shirt:skin,0,-.15,0,sh,'limb');const el=grp(sh,0,-.3,0);M(new T.CylinderGeometry(.046,.036,.28,8),skin,0,-.14,0,el,'arm'+i);M(new T.SphereGeometry(.05,8,6),skin,0,-.3,.01,el,'arm'+i).scale.set(.9,1.4,.7);z.arms.push({sh,el})});
  [-1,1].forEach(s=>{const hp=grp(hips,s*.1,-.02,0);M(new T.CylinderGeometry(.085,.065,.44,8),pants,0,-.22,0,hp,'limb');const kn=grp(hp,0,-.44,0);M(new T.CylinderGeometry(.062,.05,.44,8),pants,0,-.22,0,kn,'limb');M(new T.BoxGeometry(.11,.08,.24),ZMAT.shoe,0,-.47,.05,kn,'limb');z.legs.push({hp,kn})});
  z.hips=hips;z.tor=tor;z.head=head;g.scale.setScalar(t.s);const hm2=1+(Z.wave-1)*.1;z.hp=z.max=t.hp*hm2;z.sp=rnd(t.sp[0],t.sp[1])*(type==='walker'?1+Math.min(.6,Z.wave*.035):1);z.dmg=t.dmg;z.r=.3*t.s;z.reach=.95*t.s+.25;return z}
function spawnZombie(type){const pts=[[0,-ARENA-3],[0,ARENA+3],[-ARENA-3,0],[ARENA+3,0]];let best=null,bd=-1;for(let i=0;i<3;i++){const p=zpick(pts),d=Math.hypot(p[0]-PL.x,p[1]-PL.z);if(d>bd){bd=d;best=p}}
  const z=mkZombie(type);z.g.position.set(best[0]+rnd(-3,3),0,best[1]+rnd(-3,3));zoneW.add(z.g);Z.alive.push(z);Z.hit.push(...z.parts);if(Math.random()<.5)groan(z,.6)}
function nextType(){if(Z.boss&&!Z.bossOut){Z.bossOut=true;return'boss'}const r=Math.random(),w=Z.wave;if(w>=5&&r<.1+Math.min(.1,w*.005))return'brute';if(w>=3&&r<.35)return'runner';return'walker'}
function startWave(){Z.wave++;if(ZN&&ZN.respawnX)ZN.respawnX();Z.state='wave';Z.toSpawn=6+Z.wave*4;Z.boss=Z.wave%5===0;Z.bossOut=false;if(Z.boss)Z.toSpawn++;Z.spawnT=1.5;ui.zshop(false);ui.banner('WAVE '+Z.wave,Z.boss?'A huge one is coming…':'Survive');ping(110,1.6,.25,0,'sawtooth');ping(82,1.8,.2,.15,'sawtooth')}
function waveClear(){const bonus=100*Z.wave;Z.cash+=bonus;Z.state='break';Z.t=25;ui.banner('WAVE '+Z.wave+' CLEARED','+$'+bonus+' · open the shop to gear up');ui.zshop(true)}
function hurtPlayer(n){if(Z.over)return;Z.hp=Math.max(0,Z.hp-n);Z.hurt=1;Z.regen=5;Z.shake=.25;kickP+=.03;kickY+=rnd(-.03,.03);const a=au();if(a){ping(rnd(140,180),.25,.25,0,'sawtooth');clk(400,1,.08,.4)}if(Z.hp<=0)gameOver()}
function gameOver(){Z.over=true;W.trig=false;const w=Z.wave,b=c.best(w);st3.overlay(`<h2 style="margin:0 0 6px">You got bitten.</h2><p>You survived to <b>wave ${w}</b> with <b>${Z.kills}</b> kills (${Z.heads} headshots).</p><p>Best: wave ${b}</p>`,[['Play again',zRestart,true],['Next map',zNextMap]])}
function zRestart(){Z.alive.forEach(z=>zoneW.remove(z.g));Object.assign(Z,{wave:0,state:'break',t:10,alive:[],hit:[],cash:0,hp:100,hurt:0,regen:0,owned:new Set(['p17']),res:{p17:68},st:{},kills:0,heads:0,toSpawn:0,over:false,boss:false});
  bodies.forEach(b=>b.dead=true);decals.forEach(d=>fxRoot.remove(d));decals.length=0;Object.assign(PL,{x:0,z:8,vx:0,vz:0,y:0,vy:0,onG:true});Z.meleeT=0;yaw=0;pitch=-.02;setGun(0);ui.banner('GET READY','Zombies arrive in 10 seconds · Tab opens the shop');ui.zshop(false)}
function killZombie(z,head,dir){z.dead=true;z.fall=0;z.fdir=dir;Z.kills++;const t=ZT[z.type];let cash=t.cash;if(head){Z.heads++;cash+=30;z.head.visible=false;for(let i=0;i<22;i++)particle(SMOKE,z.head.getWorldPosition(new V3()),new V3(rnd(-1.5,1.5),rnd(.5,3),rnd(-1.5,1.5)),rnd(.05,.12),.4,rnd(.4,.9),0x7a0608,.9,false,1)}
  Z.cash+=cash;ui.cashPop('+$'+cash+(head?' HEADSHOT':''));z.parts.forEach(m=>{const i=Z.hit.indexOf(m);if(i>=0)Z.hit.splice(i,1)});clk(500,.8,.2,.4);ping(70,.3,.2);
  addDecal(new V3(z.g.position.x,.01,z.g.position.z),_n,rnd(.8,1.3),DEC.blood)}
function groan(z,v){const a=au();if(!a)return;const d=Math.hypot(z.g.position.x-PL.x,z.g.position.z-PL.z),vol=v*Math.max(0,1-d/28);if(vol<.03)return;const t=a.currentTime+rnd(0,.2),dur=rnd(.7,1.5),o=a.createOscillator(),lf=a.createOscillator(),lg=a.createGain(),f=a.createBiquadFilter(),g=a.createGain(),pn=a.createStereoPanner?a.createStereoPanner():null;
  const base=z.type==='boss'?55:z.type==='brute'?70:rnd(90,140);o.type='sawtooth';o.frequency.setValueAtTime(base,t);o.frequency.linearRampToValueAtTime(base*rnd(.7,1.2),t+dur);lf.frequency.value=rnd(5,9);lg.gain.value=base*.08;lf.connect(lg);lg.connect(o.frequency);
  f.type='bandpass';f.frequency.value=rnd(450,800);f.Q.value=3;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol*.35,t+.15);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(f);f.connect(g);
  if(pn){const ang=Math.atan2(z.g.position.x-PL.x,z.g.position.z-PL.z)+yaw;pn.pan.value=Math.max(-1,Math.min(1,-Math.sin(ang)));g.connect(pn);pn.connect(OUT);pn.connect(REV)}else{g.connect(OUT)}o.start(t);lf.start(t);o.stop(t+dur+.05);lf.stop(t+dur+.05)}
function hitZombie(z,h,dmg,dir){const part=h.object.userData.part;let m=part==='head'?3:part==='torso'?1:.65;if(W.d.pellets)m*=Math.max(.35,1-h.distance/22);const amt=dmg*m;z.hp-=amt;z.stag=Math.min(.35,.08+amt/300);
  const p=h.point;for(let i=0;i<(part==='head'?10:6);i++)particle(SMOKE,p,dir.clone().multiplyScalar(rnd(.5,2.5)).add(new V3(rnd(-.6,.6),rnd(-.2,.8),rnd(-.6,.6))),rnd(.03,.07),.8,rnd(.3,.7),0x6e0507,.9,false,.7);
  if(Math.random()<.5)addDecal(new V3(p.x+dir.x*rnd(.3,1.2),.012,p.z+dir.z*rnd(.3,1.2)),_n,rnd(.25,.6),DEC.blood);clk(700,1,.05,.35);clk(180,.8,.06,.3);
  if(part&&part.startsWith('arm')&&amt>=55&&!z.dead){const i=+part[3];if(!z.lost[i]){z.lost[i]=true;z.arms[i].el.visible=false;z.arms[i].el.children.forEach(o=>{const k=Z.hit.indexOf(o);if(k>=0)Z.hit.splice(k,1)})}}
  z.g.position.x+=dir.x*Math.min(.25,amt/400);z.g.position.z+=dir.z*Math.min(.25,amt/400);ui.hitmark(part==='head');if(z.hp<=0)killZombie(z,part==='head',dir);else if(Math.random()<.3)groan(z,.9)}
function zShot(){if(!ZN)return;const d=W.d,n=d.pellets||1;camera.updateMatrixWorld(true);camera.getWorldPosition(_o);const hip=(1-ads)*(d.pellets?.015:.02),list=ZN.ray.concat(Z.hit);
  for(let i=0;i<n;i++){const sp=(d.pellets?d.spread*.5:0)+d.acc+hip,a=Math.random()*PI*2,r=Math.sqrt(Math.random())*sp;_d.set(Math.cos(a)*r,Math.sin(a)*r,-1).normalize().applyQuaternion(camera.quaternion);ray.set(_o,_d);let pen=PEN[d.cal]||1;const seen=new Set(),hl=ray.intersectObjects(list,false);if(i<3){const e=hl.find(h=>!h.object.userData.zb);tracer(lastMz,e?e.point:_o.clone().addScaledVector(_d,60))}
    for(const h of hl){const z=h.object.userData.zb;if(z){if(z.dead||seen.has(z))continue;seen.add(z);hitZombie(z,h,DMG[d.cal]||30,_d.clone().setY(0).normalize());if(--pen<=0)break;continue}
      if(h.object.userData.egg)eggHit(h.object);const k=h.object.userData.k,nrm=h.face?h.face.normal.clone().transformDirection(h.object.matrixWorld):_d.clone().negate();
      if(k==='xbarrel'){zBoom(h.object,h.point);break}
      if(k==='steelEnv'){for(let j=0;j<5;j++)particle(SPARK,h.point,nrm.clone().multiplyScalar(rnd(1,3)).add(new V3(rnd(-1,1),rnd(0,1.5),rnd(-1,1))),.01,-.5,rnd(.1,.3),0xffc070,1,true,.6);clk(2600,3,.03,.25,h.distance/343)}
      else{for(let j=0;j<4;j++)particle(SMOKE,h.point,nrm.clone().multiplyScalar(rnd(.3,1.1)).add(new V3(rnd(-.3,.3),rnd(0,.5),rnd(-.3,.3))),rnd(.05,.1),2,rnd(.5,1.1),k==='wood'?0x9a7a50:0x77726a,.5);clk(800,.8,.04,.2,h.distance/343)}
      addDecal(h.point,nrm,k==='wood'?.02:.03,DEC.hole);break}}
  kickP+=d.rise*.22*(1-ads*.35)*(d.modes&&d.modes[W.mode]!=='SEMI'?(1-ads*.45):1);kickY+=rnd(-1,1)*d.rise*.05*(1-ads*.5)}
function pushOut(o,r,y){for(const b of ZN.boxes){if(y!=null&&y>=b.h-.05)continue;const cx=Math.max(b.x0,Math.min(o.x,b.x1)),cz=Math.max(b.z0,Math.min(o.z,b.z1)),dx=o.x-cx,dz=o.z-cz,d=Math.hypot(dx,dz);if(d<r){if(d>1e-4){o.x=cx+dx/d*r;o.z=cz+dz/d*r}else{o.x+=r}}}}
const _pz={x:0,z:0};
function stepZombies(dt){if(!ZN)return;const k=input.keys;
  // player movement
  let mx=(k.d||k.arrowright?1:0)-(k.a||k.arrowleft?1:0),mz=(k.s||k.arrowdown?1:0)-(k.w||k.arrowup?1:0);if(joy){mx+=joy.x;mz+=joy.y}const ml=Math.hypot(mx,mz);if(ml>1){mx/=ml;mz/=ml}
  const run=k.shift&&!adsOn&&mz<0,spd=Z.over?0:(adsOn?2.3:run?6.6:4.3),fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);
  const tvx=(rx*mx-fx*mz)*spd,tvz=(rz*mx-fz*mz)*spd,ac=Math.min(1,dt*10);PL.vx+=(tvx-PL.vx)*ac;PL.vz+=(tvz-PL.vz)*ac;PL.x+=PL.vx*dt;PL.z+=PL.vz*dt;
  _pz.x=PL.x;_pz.z=PL.z;pushOut(_pz,.35,PL.y);PL.x=Math.max(-ARENA+.8,Math.min(ARENA-.8,_pz.x));PL.z=Math.max(-ARENA+.8,Math.min(ARENA-.8,_pz.z));
  let gy=0;for(const b of ZN.boxes)if(PL.x>b.x0&&PL.x<b.x1&&PL.z>b.z0&&PL.z<b.z1&&PL.y>=b.h-.3&&b.h<3)gy=Math.max(gy,b.h);
  PL.vy-=17*dt;PL.y+=PL.vy*dt;if(PL.y<=gy){if(!PL.onG&&PL.vy<-3){clk(300,.8,.08,.35);Z.shake=.08}PL.y=gy;PL.vy=0;PL.onG=true}else if(PL.y>gy+.05)PL.onG=false;
  if(Z.meleeT>0){Z.meleeT-=dt;if(!Z.meleeHit&&Z.meleeT<.45){Z.meleeHit=true;meleeStrike()}}
  PL.sp=PL.onG?Math.hypot(PL.vx,PL.vz):0;PL.bob+=dt*PL.sp*2.1;
  for(const f of ZN.fires){f.L.intensity=1.8+Math.random()*1.1;if(Math.random()<dt*14)particle(SPARK,new V3(f.x+rnd(-.2,.2),.95,f.z+rnd(-.2,.2)),new V3(rnd(-.2,.2),rnd(1,2.2),rnd(-.2,.2)),rnd(.12,.25),-.8,rnd(.3,.6),0xff8a3a,.9,true,-.05);if(Math.random()<dt*3)particle(SMOKE,new V3(f.x,1.2,f.z),new V3(rnd(-.1,.1),rnd(.6,1),rnd(-.1,.1)),.3,1.2,rnd(2,3),0x2a2624,.35)}
  if(Z.over)return;
  if(Z.hurt>0)Z.hurt=Math.max(0,Z.hurt-dt*1.4);if(Z.regen>0)Z.regen-=dt;else if(Z.hp<100)Z.hp=Math.min(100,Z.hp+dt*4);
  if(Z.state==='break'){Z.t-=dt;if(Z.t<=0)startWave()}
  else if(Z.state==='wave'){Z.spawnT-=dt;const cap=Math.min(26,8+Z.wave*2);if(Z.toSpawn>0&&Z.spawnT<=0&&Z.alive.filter(z=>!z.dead).length<cap){spawnZombie(nextType());Z.toSpawn--;Z.spawnT=Math.max(.3,1.5-Z.wave*.08)}
    if(Z.toSpawn===0&&!Z.alive.some(z=>!z.dead))waveClear()}
  const live=Z.alive.filter(z=>!z.dead);
  for(const z of Z.alive){const g=z.g,p=g.position;
    if(z.dead){z.fall=Math.min(1,z.fall+dt*2.2);g.rotation.x=-PI/2*ease(z.fall)*.97;z.deadT+=dt;if(z.deadT>7){p.y-=dt*.25;if(p.y<-.8){zoneW.remove(g);z.gone=true}}continue}
    const dx=PL.x-p.x,dz=PL.z-p.z,d=Math.hypot(dx,dz),ty=Math.atan2(dx,dz);let dy=ty-g.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));g.rotation.y+=dy*Math.min(1,dt*(z.type==='runner'?8:4));
    if(z.stag>0)z.stag-=dt;
    let moving=false;if(d>z.reach&&z.stag<=0&&z.atk<=0){const s=z.sp*dt;p.x+=dx/d*s;p.z+=dz/d*s;moving=true}
    for(const o of live){if(o===z)continue;const ex=p.x-o.g.position.x,ez=p.z-o.g.position.z,e=Math.hypot(ex,ez),m=z.r+o.r;if(e<m&&e>1e-4){p.x+=ex/e*(m-e)*.5;p.z+=ez/e*(m-e)*.5}}
    _pz.x=p.x;_pz.z=p.z;pushOut(_pz,z.r);p.x=_pz.x;p.z=_pz.z;if(Math.abs(p.x)<ARENA-1.5&&Math.abs(p.z)<ARENA-1.5)z.inside=true;if(z.inside){p.x=Math.max(-ARENA+.5,Math.min(ARENA-.5,p.x));p.z=Math.max(-ARENA+.5,Math.min(ARENA-.5,p.z))}
    const pe=Math.hypot(p.x-PL.x,p.z-PL.z),mn=z.r+.35;if(pe<mn&&pe>1e-4){p.x=PL.x+(p.x-PL.x)/pe*mn;p.z=PL.z+(p.z-PL.z)/pe*mn}
    if(d<=z.reach+.1&&z.atk<=0&&z.atkT<=0){z.atk=.55;z.atkT=z.type==='runner'?.9:1.2;z.hitDone=false}
    if(z.atkT>0)z.atkT-=dt;
    // animation
    const run2=z.type==='runner',fr=run2?9:z.type==='boss'||z.type==='brute'?3.2:4.2;if(moving)z.ph+=dt*fr*(run2?1:Math.max(.7,z.sp));const sn=Math.sin(z.ph);
    z.legs[0].hp.rotation.x=moving?-sn*(run2?.8:.45):0;z.legs[1].hp.rotation.x=moving?sn*(run2?.8:.45):0;z.legs[0].kn.rotation.x=moving?Math.max(0,Math.sin(z.ph-1.2))*(run2?1.3:.7):0;z.legs[1].kn.rotation.x=moving?Math.max(0,-Math.sin(z.ph-1.2))*(run2?1.3:.7):0;
    z.hips.position.y=.95-(moving?Math.abs(sn)*.03:0);z.tor.rotation.x=run2?.45:.22+Math.sin(z.ph*.5)*.05;z.tor.rotation.z=Math.sin(z.ph)*.09;z.head.rotation.z=Math.sin(z.ph*.37)*.25;z.head.rotation.x=-.15;
    z.arms.forEach((a,i)=>{const s2=i?1:-1;if(z.atk>0){const t=1-z.atk/.55;a.sh.rotation.x=-1.3-Math.sin(t*PI)*1.1;a.el.rotation.x=-.3}else if(run2){a.sh.rotation.x=Math.sin(z.ph+(i?PI:0))*.9-.3;a.el.rotation.x=-.9}else{a.sh.rotation.x=-1.35+Math.sin(z.ph*.5+i)*.14;a.el.rotation.x=-.2;a.sh.rotation.z=s2*-.08}});
    if(z.atk>0){z.atk-=dt;if(!z.hitDone&&z.atk<.28){z.hitDone=true;if(Math.hypot(PL.x-p.x,PL.z-p.z)<=z.reach+.35&&PL.y<1.25*ZT[z.type].s)hurtPlayer(z.dmg*(z.lost[0]&&z.lost[1]?.5:1))}}
    if(Math.random()<dt*.12)groan(z,.7)}
  for(let i=Z.alive.length-1;i>=0;i--)if(Z.alive[i].gone)Z.alive.splice(i,1)}
function zJump(){if(MODE!=='zombie'||Z.over||!PL.onG)return;PL.vy=6.2;PL.onG=false;clk(500,.7,.06,.25)}
function zMelee(){if(MODE!=='zombie'||Z.over||Z.meleeT>0||(W&&W.busy&&W.d.type==='rev'))return;Z.meleeT=.62;Z.meleeHit=false;clk(900,.6,.18,.25,0,'lowpass')}
function meleeStrike(){const fx=-Math.sin(yaw),fz=-Math.cos(yaw);let hit=0;for(const z of Z.alive){if(z.dead)continue;const dx=z.g.position.x-PL.x,dz=z.g.position.z-PL.z,d=Math.hypot(dx,dz);if(d>1.9+z.r||d<1e-3)continue;if((dx*fx+dz*fz)/d<.55)continue;
    const dir=new V3(dx/d,0,dz/d);z.hp-=z.type==='boss'?35:z.type==='brute'?45:60;z.stag=.7;z.atk=0;z.g.position.x+=dir.x*(z.type==='boss'?.2:1.1);z.g.position.z+=dir.z*(z.type==='boss'?.2:1.1);hit++;
    const hp=z.g.position.clone().setY(1.4*ZT[z.type].s);for(let i=0;i<10;i++)particle(SMOKE,hp,dir.clone().multiplyScalar(rnd(.5,2)).add(new V3(rnd(-.6,.6),rnd(0,1),rnd(-.6,.6))),rnd(.04,.08),.8,rnd(.3,.6),0x6e0507,.9,false,.7);
    if(z.hp<=0)killZombie(z,false,dir);else groan(z,.9)}
  if(hit){clk(180,.8,.12,.7);clk(1400,1,.04,.4);ping(90,.18,.3);Z.shake=.12;ui.hitmark(false)}}
function buy(id){const d=GUNS.find(g=>g.id===id);if(Z.owned.has(id))return;const pr=PRICE[id];if(Z.cash<pr){ui.toast('Not enough cash');return}Z.cash-=pr;Z.owned.add(id);Z.res[id]=ammoPack(d)+d.cap;MECH.magIn();setGun(GUNS.indexOf(d));ui.zshop(true)}
function buyAmmo(id){const d=GUNS.find(g=>g.id===id),pr=ammoCost(d);if(Z.cash<pr){ui.toast('Not enough cash');return}Z.cash-=pr;Z.res[id]=(Z.res[id]||0)+ammoPack(d);MECH.shellIn();ui.zshop(true)}
function buyHealth(){if(Z.hp>=100){ui.toast('Already at full health');return}if(Z.cash<250){ui.toast('Not enough cash');return}Z.cash-=250;Z.hp=100;ping(880,.2,.1);ui.zshop(true)}
function saveGunState(){if(MODE==='zombie'&&W)Z.st[W.d.id]={mag:W.mag,ch:W.ch,ch6:W.ch6&&W.ch6.slice(),ch2:W.ch2&&W.ch2.slice(),locked:W.locked}}
function restoreGunState(){const s=Z.st[W.d.id];if(!s)return;W.mag=s.mag;W.ch=s.ch;W.locked=s.locked;const P=W.P;if(s.ch6){W.ch6=s.ch6;P.rounds.forEach((r,k)=>{r.visible=s.ch6[k]!=='empty';swapRound(r,s.ch6[k]==='spent')})}if(s.ch2){W.ch2=s.ch2;P.shells.forEach((r,k)=>{r.visible=s.ch2[k]!=='empty';swapRound(r,s.ch2[k]==='spent')})}
  if(W.locked){if(P.slide)P.slide.position.x=-W.d.travel*.92;if(P.carrier)setCarrier(W.d.travel);if(P.op)gmv(W.d.travel)}if(P.mag&&P.mag.userData.top)P.mag.userData.top.visible=W.mag>0;ui.dirty=true}
function ownedStep(dir){if(MODE!=='zombie')return setGun((W.i+dir+GUNS.length)%GUNS.length);let i=W.i;for(let k=0;k<GUNS.length;k++){i=(i+dir+GUNS.length)%GUNS.length;if(Z.owned.has(GUNS[i].id))return setGun(i)}}
function selectGun(i){if(MODE==='zombie'&&!Z.owned.has(GUNS[i].id)){ui.toast('Buy the '+GUNS[i].name+' in the shop first');return}if(!W||W.i!==i)setGun(i)}

/* ---------- UI ---------- */
const ui=(()=>{const idB=el('b'),idS=el('small'),id=el('div',{class:'gs-id'},idB,idS);
  const seg=el('div',{class:'gs-seg'});const mB=[['bench','Workbench'],['range','Range']].map(([k,t])=>{const b=el('button',{type:'button'},t);b.addEventListener('click',e=>{e.stopPropagation();setMode(k)});seg.append(b);return[k,b]});
  const top=el('div',{class:'gs-top'},id,seg);
  const aB=el('b'),aS=el('span'),aI=el('i'),rd=el('div',{class:'gs-rd'}),ammo=el('div',{class:'gs-ammo'},el('div',null,aB,aS),aI,rd);
  const cur=el('button',{type:'button',class:'gs-cur'});const nav=(t,fn)=>{const b=el('button',{type:'button'},t);b.addEventListener('pointerdown',e=>e.stopPropagation());b.addEventListener('click',e=>{e.stopPropagation();fn()});return b};
  const guns=el('div',{class:'gs-gunbar'},nav('◀',()=>ownedStep(-1)),cur,nav('▶',()=>ownedStep(1)));cur.addEventListener('pointerdown',e=>e.stopPropagation());cur.addEventListener('click',e=>{e.stopPropagation();openPick(true)});
  const pick=el('div',{class:'gs-pick'});const hd=el('div',{class:'hd'},'Choose a weapon',nav('✕ Close',()=>openPick(false)));hd.lastChild.textContent='✕ Close';pick.append(hd);pick.addEventListener('pointerdown',e=>e.stopPropagation());
  const gB=[];['Pistols','Revolvers','Shotguns','Rifles','Snipers'].forEach(ct=>{const gr=el('div',{class:'gr'});GUNS.forEach((d,i)=>{if(d.cat!==ct)return;const b=el('button',{type:'button'},d.name,el('small',null,CAL[d.cal].n+' · '+d.desc));b.addEventListener('click',e=>{e.stopPropagation();if(MODE==='zombie'&&!Z.owned.has(d.id)){selectGun(i);return}openPick(false);selectGun(i)});gr.append(b);gB[i]=b});pick.append(el('h4',null,ct),gr)});
  function openPick(on){if(on)refreshPick();pick.classList.toggle('on',on);if(on&&document.pointerLockElement)document.exitPointerLock();if(on)W&&W.trig&&trigUp()}
  function refreshPick(){GUNS.forEach((d,i)=>{const b=gB[i];if(!b)return;const lock=MODE==='zombie'&&!Z.owned.has(d.id);b.style.opacity=lock?.45:1;b.lastChild.textContent=CAL[d.cal].n+' · '+(lock?'🔒 buy in the shop for $'+PRICE[d.id]:d.desc)})}
  const zh=el('div',{class:'gs-zh'}),zhS=el('small'),zhB=el('i');zh.append(zhS,el('div',{class:'bar'},zhB));const zw=el('div',{class:'gs-zw'}),ban=el('div',{class:'gs-ban'}),hurt=el('div',{class:'gs-hurt'}),hm=el('div',{class:'gs-hm'}),cp=el('div',{class:'gs-cp'}),joyE=el('div',{class:'gs-joy'},el('i'));
  const shop=el('div',{class:'gs-shop'});shop.addEventListener('pointerdown',e=>e.stopPropagation());let banT=null,hmT=null,cpT=null,zlast='';
  function zshop(on){shop.classList.toggle('on',on);if(!on)return;if(document.pointerLockElement)document.exitPointerLock();if(W)W.trig=false;shop.innerHTML='';const cash=el('em',null,'$'+Z.cash.toLocaleString());const close=el('button',{type:'button'},'✕ Back to the fight');close.onclick=e=>{e.stopPropagation();zshop(false)};
    shop.append(el('div',{class:'hd'},el('span',null,'🛒 Survivor Shop '),cash,close));
    if(Z.state==='break'){const go=el('button',{type:'button',class:'go',style:'display:inline-block;margin-top:8px'},'▶ Start wave '+(Z.wave+1)+' now');go.onclick=e=>{e.stopPropagation();Z.t=.01;zshop(false)};shop.append(go)}
    const it=(t,sub,price,fn,cls)=>{const b=el('button',{type:'button',class:(cls||'')+(price>Z.cash?' no':'')},el('b',null,price?'$'+price:''),t,el('small',null,sub));b.onclick=e=>{e.stopPropagation();fn()};return b};
    const g1=el('div',{class:'gr'});g1.append(it('❤️ Med kit','Heal to full · you are at '+Math.round(Z.hp)+'%',250,buyHealth));GUNS.filter(d=>Z.owned.has(d.id)).forEach(d=>g1.append(it('Ammo · '+d.name,'+'+ammoPack(d)+' rounds · you have '+(Z.res[d.id]||0),ammoCost(d),()=>buyAmmo(d.id),'own')));shop.append(el('h4',null,'Supplies'),g1);
    ['Pistols','Revolvers','Shotguns','Rifles','Snipers'].forEach(ct=>{const gr=el('div',{class:'gr'});GUNS.filter(d=>d.cat===ct&&!Z.owned.has(d.id)).forEach(d=>gr.append(it(d.name,CAL[d.cal].n+' · '+d.desc,PRICE[d.id],()=>buy(d.id))));if(gr.children.length)shop.append(el('h4',null,ct),gr)})}
  function zdraw(){const alive=Z.alive.filter(z=>!z.dead).length,k=Math.round(Z.hp)+'|'+Z.wave+'|'+alive+'|'+Z.toSpawn+'|'+Z.cash+'|'+Z.state+'|'+Math.ceil(Z.t);hurt.style.opacity=Math.min(1,Z.hurt+(Z.hp<30?.35+Math.sin(performance.now()/200)*.1:0));if(k===zlast)return;zlast=k;
    zhS.textContent='HEALTH '+Math.round(Z.hp);zhB.style.width=Z.hp+'%';zw.innerHTML='';zw.append(Z.state==='break'?el('b',null,'NEXT WAVE IN '+Math.ceil(Z.t)+'s'):el('b',null,'WAVE '+Z.wave),Z.state==='break'?' · Tab = shop':' · '+(alive+Z.toSpawn)+' left',el('span',null,'$'+Z.cash.toLocaleString()))}
  const mouseB=el('button',{type:'button',class:'gs-mouse'});mouseB.addEventListener('pointerdown',e=>e.stopPropagation());mouseB.addEventListener('click',e=>{e.stopPropagation();toggleLock()});
  const acts=el('div',{class:'gs-acts'});const act=(t,fn,cls)=>{const b=el('button',{type:'button',class:cls||''},t);b.addEventListener('pointerdown',e=>e.stopPropagation());b.addEventListener('click',e=>{e.stopPropagation();au();fn()});acts.append(b);return b};
  const bR=act('⟳ Reload',reload),bE=act('Rack',rack),bF=act('Safety',toggleSafety),bM=act('Mode',cycleMode),bS=act('🐢 Slow-mo',()=>{SLOW=!SLOW;TS=SLOW?.1:1;sync()}),bA=act('◎ Aim',()=>{adsOn=!adsOn;sync()}),bD=act('⏱ Steel drill',startDrill),bT=act('↺ Targets',()=>{resetTargets();ui.toast('Targets reset')}),bP=act('Paper 7 m',()=>{const L=[5,7,10,15],P=RG.paper;if(!P)return;if(P.target<2)P.target=P.prev||7;P.target=L[(L.indexOf(P.target)+1)%L.length];P.hits.length=0;P.shots=P.score=0;P.draw();sync()}),bI=act('📄 Bring paper',bringPaper),bC=act('🧹 Clear brass',()=>{bodies.forEach(b=>b.dead=true);bits.forEach(b=>b.life=0)}),bZ=act('🛒 Shop',()=>zshop(!shop.classList.contains('on'))),bMap=act('🗺 Range',()=>MODE==='zombie'?zNextMap():nextRange()),bK=act('🥏 Pull!',()=>launchClay());
  const bot=el('div',{class:'gs-bot'},acts,guns);const msg=el('div',{class:'gs-msg'});const help=el('div',{class:'gs-help'});
  const tbJ=el('button',{type:'button',class:'gs-tb',style:'right:108px;bottom:196px'},'JUMP'),tbM=el('button',{type:'button',class:'gs-tb',style:'right:28px;bottom:292px'},'MELEE');[[tbJ,()=>zJump()],[tbM,()=>zMelee()]].forEach(([b,f])=>b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();f()}));
  const fire=el('button',{type:'button',class:'gs-fire'},'FIRE');fire.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();trigDown()});['pointerup','pointercancel','pointerleave'].forEach(ev=>fire.addEventListener(ev,()=>trigUp()));
  const xh=el('div',{class:'gs-x'});[[-1,0],[1,0],[0,-1],[0,1]].forEach(([a,b])=>{const i=el('i');i.dataset.a=a;i.dataset.b=b;xh.append(i)});
  const scope=el('div',{class:'gs-scope'});scope.innerHTML='<svg viewBox="-50 -50 100 100"><g stroke="#000" fill="none"><path d="M-50 0H-7M7 0H50M0 -50V-7M0 7V50" stroke-width="1.6"/><path d="M-7 0H7M0 -7V7" stroke-width=".25"/><circle r=".35" fill="#c00" stroke="none"/></g></svg>';
  const dot=el('div',{class:'gs-dot'}),drl=el('div',{class:'gs-drill'}),sc=el('div',{class:'gs-score'}),slow=el('div',{class:'gs-slow'},'SLOW MOTION');
  hud.append(el('div',{class:'gs-vig'}),hurt,xh,hm,cp,scope,dot,mouseB,top,zh,zw,ban,joyE,ammo,msg,help,sc,drl,slow,bot,fire,tbJ,tbM,pick,shop);
  function mouseSync(){const R=MODE!=='bench',lk=document.pointerLockElement===cvsEl();mouseB.style.display=R?'block':'none';mouseB.classList.toggle('free',!lk);mouseB.textContent=lk?'🖱 Mouse locked for aiming · press M (or Esc) to free it':'🎯 Mouse free · click here, on the range, or press M to aim'}
  let mt=null,last='';
  function toast(t){msg.textContent=t;msg.classList.add('on');clearTimeout(mt);mt=setTimeout(()=>msg.classList.remove('on'),1700)}
  function sync(){if(!W)return;const d=W.d;idB.textContent=d.name;idS.textContent=CAL[d.cal].n+' · '+d.desc;gB.forEach((b,i)=>b&&b.classList.toggle('on',i===W.i));cur.innerHTML='';cur.append('🔫 '+d.name,el('small',null,CAL[d.cal].n+' · '+(W.i+1)+'/'+GUNS.length+' ▾'));mouseSync();mB.forEach(([k,b])=>b.classList.toggle('on',k===MODE));
    bM.hidden=!d.modes;bE.textContent=d.type==='pump'?'Pump':d.type==='bolt'?'Cycle bolt':d.type==='rev'?'Cock hammer':d.type==='lever'?'Work lever':d.type==='garand'?'Op rod':'Rack';bE.hidden=d.type==='break';bF.hidden=d.safety==='none';bS.classList.toggle('on',SLOW);slow.style.display=SLOW?'block':'none';
    const ZM=MODE==='zombie',R=MODE==='range';wrap.classList.toggle('zm',ZM);bA.hidden=MODE==='bench';bD.hidden=!R;bT.hidden=!R;bI.hidden=!R||!(RG&&RG.paper);bP.hidden=!R||!(RG&&RG.paper);bMap.hidden=!R&&!ZM;bK.hidden=!R||RMAP!=='desert';bMap.textContent='🗺 '+(ZM?ZMAPS[ZMAP]:RMAPS[RMAP]);if(RG&&RG.paper)bI.textContent=RG.paper.target<2?'↩ Send paper back':'📄 Bring paper';bS.hidden=ZM;bC.hidden=ZM;bZ.hidden=!ZM;bA.classList.toggle('on',adsOn);if(RG&&RG.paper)bP.textContent='Paper '+(RG.paper.target<2?RG.paper.prev:RG.paper.target)+' m';sc.style.display=R?'block':'none';
    help.textContent=MODE==='zombie'?'N changes map · shoot red barrels to blow up zombies · WASD move · Space jump · V or F melee · Shift sprint · click to fire · hold Q (or right-click) aim · R reload · 1–9 or [ ] switch guns · Tab shop · M frees the mouse':R?'N changes range · K pulls a clay (desert) · Click to lock aim · M frees the mouse · click/Space fire · hold Q (or right-click) to aim · R reload · E rack · F safety · B mode · T slow-mo · [ ] or G switch guns':'Click the gun or press Space to fire · drag to turn · scroll to zoom · R reload · E rack · F safety · B mode · T slow-mo · [ ] or G switch guns';ui.dirty=true}
  function draw(){if(!W)return;const d=W.d;let n,plus='',cap=d.cap,live;
    if(d.type==='rev'){n=W.ch6.filter(x=>x==='live').length;live=n}else if(d.type==='break'){n=W.ch2.filter(x=>x==='live').length;live=n}else{n=W.mag;plus=W.ch==='live'?'+1':'';live=W.mag}
    const mode=W.safe?'SAFE':d.modes?d.modes[W.mode]:d.type==='rev'?(W.cocked?'SINGLE ACTION':'DOUBLE ACTION'):d.type==='pump'?'PUMP':d.type==='bolt'?'BOLT':d.type==='lever'?'LEVER':d.type==='break'?'DOUBLE':'SEMI';
    const k=n+plus+mode+cap+live+(MODE==='zombie'?Z.res[d.id]:'');if(k===last)return;last=k;aB.textContent=n;aS.textContent=plus+(MODE==='zombie'?' / '+(Z.res[d.id]||0):'');aI.textContent=mode;aI.className=W.safe?'safe':'';
    rd.innerHTML='';for(let i=0;i<cap;i++){const u=el('u');if(i>=live)u.className='x';rd.append(u)}}
  return{toast,sync,draw,mouseSync,openPick,pickOn:()=>pick.classList.contains('on'),zshop,zshopOn:()=>shop.classList.contains('on'),zdraw,
    banner:(a,b)=>{ban.innerHTML='';ban.append(el('b',null,a),el('small',null,b||''));ban.classList.add('on');clearTimeout(banT);banT=setTimeout(()=>ban.classList.remove('on'),3200)},
    hitmark:h=>{hm.className='gs-hm'+(h?' h':'');hm.style.opacity=1;clearTimeout(hmT);hmT=setTimeout(()=>hm.style.opacity=0,130)},
    cashPop:t=>{cp.textContent=t;cp.style.transition='none';cp.style.top='58%';cp.style.opacity=1;void cp.offsetWidth;cp.style.transition='opacity .5s .4s,top .9s';cp.style.top='52%';cp.style.opacity=0},
    joy:(x,y,jx,jy)=>{if(x===false){joyE.style.display='none';return}if(x!=null){joyE.style.display='block';joyE.style.left=x+'px';joyE.style.top=y+'px'}joyE.firstChild.style.transform=`translate(${jx*40}px,${jy*40}px)`},dirty:true,score:t=>{sc.textContent=t},drill:(a,b)=>{if(a==null){drl.style.display='none';return}drl.style.display='block';drl.innerHTML='';drl.append(a,el('small',null,b||''))},xh,scope,dot,wrapTouch:()=>{}}})();

/* ---------- modes + camera ---------- */
const orb={th:PI-.2,ph:.26,z:1,fit:true,tth:PI-.2,tph:.26};
function setMode(m){if(m===MODE)return;MODE=m;cos=[];bodies.forEach(b=>fxRoot.remove(b.o));bodies.length=0;bits.forEach(b=>fxRoot.remove(b.o));bits.length=0;decals.forEach(d=>fxRoot.remove(d));decals.length=0;
  zoneW.visible=false;scene.fog=null;
  if(m==='zombie'){if(!ZN)buildZone();zoneW.visible=true;hideRanges();benchW.visible=false;scene.environment=ENV_Z.texture;scene.background=new T.Color(0x070a12);scene.fog=new T.FogExp2(0x070a12,.03);camera.add(mount);scene.add(camera);camera.fov=72;camera.far=150;yaw=0;pitch=-.02;adsOn=false;ads=0;renderer.toneMappingExposure=1.3}
  else if(m==='range'){benchW.visible=false;camera.add(mount);scene.add(camera);camera.fov=62;yaw=0;pitch=-.03;adsOn=false;ads=0;selectRange(RMAP)}
  else{hideRanges();benchW.visible=true;scene.environment=ENV_B.texture;scene.background=new T.Color(0x0f0e0d);scene.add(mount);mount.position.set(0,0,0);mount.rotation.set(0,0,0);camera.fov=30;orb.fit=true;renderer.toneMappingExposure=1;if(document.pointerLockElement)document.exitPointerLock()}
  camera.updateProjectionMatrix();drill.on=false;drill.wait=0;ui.drill(null);setRoom(m);if(m==='zombie'){zRestart()}else setGun(W.i);ui.sync();if(m!=='bench')ui.toast(wrap.classList.contains('touch')?'Drag to aim · FIRE to shoot · Aim for sights':'Click to grab the mouse · hold Q or right-click to aim down sights')}
scene.environment=ENV_B.texture;
const hold=new V3(),adsP=new V3(),tmpE=new T.Euler();
function camBench(dt){const d=W.d,asp=camera.aspect,vf=camera.fov*PI/360,hf=Math.atan(Math.tan(vf)*asp);const need=Math.max(W.len*(asp<1?.64:.56)/Math.tan(hf),(W.hi-W.low)*.9/Math.tan(vf));
  orb.th+=(orb.tth-orb.th)*Math.min(1,dt*10);orb.ph+=(orb.tph-orb.ph)*Math.min(1,dt*10);const dist=need*orb.z;const c2=W.cen;
  camera.position.set(c2.x+Math.sin(orb.th)*Math.cos(orb.ph)*dist,c2.y+Math.sin(orb.ph)*dist,Math.cos(orb.th)*Math.cos(orb.ph)*dist);camera.lookAt(c2.x,c2.y-dist*Math.tan(vf)*.16,0);
  mount.position.set(0,0,0);mount.rotation.set(0,0,0);mount.visible=true}
let swayT=0;
function camRange(dt,gdt){const d=W.d;swayT+=dt;ads+=((adsOn?1:0)-ads)*Math.min(1,dt*(adsOn?9:11));kickP*=Math.exp(-dt*5.5);kickY*=Math.exp(-dt*5);
  const br=d.scope?.0011:.0006;if(MODE==='zombie'){const sk=Z.shake>0?(Z.shake-=dt,Z.shake*.08):0;camera.position.set(PL.x+Math.cos(PL.bob)*.025*Math.min(1,PL.sp/4)+rnd(-sk,sk),1.62+PL.y+Math.abs(Math.sin(PL.bob))*.045*Math.min(1,PL.sp/4)+rnd(-sk,sk),PL.z)}else camera.position.set(0,1.62,0);camera.rotation.order='YXZ';camera.rotation.set(pitch+kickP+Math.sin(swayT*1.3)*br*ads,yaw+kickY+Math.sin(swayT*.9)*br*ads,0);
  const sc=d.scope&&ads>.85,bf=MODE==='zombie'?72:62;const tf=sc?d.fov:bf+(d.fov-bf)*ads;if(Math.abs(camera.fov-tf)>.01){camera.fov=tf;camera.updateProjectionMatrix()}
  const sy=d.adsY||d.sightY;adsP.set(0,-sy,-d.eye+d.rearX);hold.set(.13,-d.sightY-.085,-d.eye+d.rearX+.07);if(d.pivot[0]<-.2)hold.set(.12,-d.sightY-.07,-d.eye+d.rearX+.06);
  mount.position.lerpVectors(hold,adsP,ads);mount.position.y+=Math.sin(swayT*1.8)*.002*(1-ads)+(MODE==='zombie'?Math.abs(Math.sin(PL.bob))*-.012*Math.min(1,PL.sp/4)*(1-ads*.7):0);mount.position.x+=MODE==='zombie'?Math.cos(PL.bob)*.008*Math.min(1,PL.sp/4)*(1-ads):0;if(MODE==='zombie'&&Z.meleeT>0){const k=Math.sin(Math.min(1,(.62-Z.meleeT)/.3)*PI);mount.position.z-=k*.22;mount.position.x-=k*.1;mount.position.y+=k*.04;mount.rotation.z+=k*.7;mount.rotation.x+=k*.25}mount.rotation.set(0,PI/2+(1-ads)*.05,(1-ads)*-.05);mount.visible=!sc;
  ui.scope.style.display=sc?'block':'none';ui.dot.style.display=d.id==='ar'&&ads>.9?'block':'none';ui.xh.style.display=ads<.5?'block':'none';
  if(ads<.5){const g=10+(d.pellets?20:14)*(1-ads)+kickP*400;ui.xh.querySelectorAll('i').forEach(i=>{const a=+i.dataset.a,b=+i.dataset.b;i.style.cssText=a?`left:${a*g-(a<0?8:0)}px;top:-1px;width:8px;height:2px`:`top:${b*g-(b<0?8:0)}px;left:-1px;width:2px;height:8px`})}
  if(MODE==='zombie')ui.zdraw();if(RG&&MODE==='range'){stepRangeExtras(gdt);const P=RG.paper;if(P&&Math.abs(P.dist-P.target)>.01){const s=Math.sign(P.target-P.dist);P.dist+=s*Math.min(Math.abs(P.target-P.dist),gdt*(Math.abs(P.target-P.dist)>1.5?7:3));P.g.position.z=-P.dist;if(Math.random()<.2)clk(160,2,.05,.05)}else if(P)P.dist=P.target;if(P)P.g.rotation.x=Math.sin(swayT*.7)*.02;
    RG.plates.forEach(p=>{const h2=Math.min(gdt,.02);p.tv+=(-9.81/p.L*Math.sin(p.th)-.9*p.tv)*h2;p.th+=p.tv*h2;p.piv.rotation.x=p.th});
    if(drill.wait>0){drill.wait-=dt;if(drill.wait<=0){drill.wait=0;drill.on=true;drill.t=0;ping(2900,.35,.25,0,'square');ui.drill('0.00','GO!')}}else if(drill.on){drill.t+=dt;ui.drill(drill.t.toFixed(2),drill.hits+' / '+(RG.drillN||5)+' plates')}}}

/* ---------- input ---------- */
function cvsEl(){return renderer.domElement}
function toggleLock(){const cv=renderer.domElement;if(MODE==='bench')return;if(document.pointerLockElement===cv)document.exitPointerLock();else{ui.openPick(false);try{const p=cv.requestPointerLock();p&&p.catch&&p.catch(()=>{})}catch(er){}}}
c.on(document,'pointerlockchange',()=>{ui.mouseSync();if(!document.pointerLockElement&&W){W.trig=false;if(adsOn){adsOn=false;ui.sync()}}});
const cvs=renderer.domElement;const ptrs=new Map();let pinch=0,tap=null;
function hitGun(e){const r=cvs.getBoundingClientRect(),v=new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(v,camera);const bb=W.box.clone().expandByScalar(Math.max(.02,W.len*.06));return ray.ray.intersectsBox(bb)}
c.on(cvs,'pointerdown',e=>{if(!W)return;au();if(e.pointerType==='touch')wrap.classList.add('touch');ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});try{cvs.setPointerCapture(e.pointerId)}catch(er){}
  if(MODE==='bench'){if(ptrs.size===2){pinch=0;trigUp();tap=null;return}if(e.button===0&&hitGun(e)){tap={id:e.pointerId,fire:true};trigDown()}else tap={id:e.pointerId,fire:false}}
  else{if(e.pointerType==='mouse'){if(document.pointerLockElement!==cvs){ptrs.delete(e.pointerId);toggleLock();return}if(e.button===0)trigDown();if(e.button===2){adsOn=true;ui.sync()}}
    else{const r=cvs.getBoundingClientRect();if(MODE==='zombie'&&e.clientX-r.left<r.width*.45&&!joy){joy={id:e.pointerId,cx:e.clientX,cy:e.clientY,x:0,y:0};ui.joy(e.clientX-r.left,e.clientY-r.top,0,0);return}tap={id:e.pointerId,t:performance.now(),mv:0}}}});
c.on(cvs,'pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p||!W)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(MODE==='bench'){if(ptrs.size===2){const a=[...ptrs.values()],d2=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinch)orb.z=Math.min(2.6,Math.max(.35,orb.z*pinch/d2));pinch=d2;return}if(tap&&tap.fire)return;orb.tth-=dx*.008;orb.tph=Math.max(-.6,Math.min(1.2,orb.tph+dy*.006))}
  else if(joy&&joy.id===e.pointerId){const jx=e.clientX-joy.cx,jy=e.clientY-joy.cy,l=Math.hypot(jx,jy),m=Math.min(l,55);joy.x=l?jx/l*m/55:0;joy.y=l?jy/l*m/55:0;ui.joy(null,null,joy.x,joy.y)}
  else if(e.pointerType!=='mouse'||document.pointerLockElement!==cvs){const s=(e.pointerType==='mouse'?.003:.0045)*(camera.fov/62);yaw-=dx*s;pitch=Math.max(-.6,Math.min(.45,pitch-dy*s));if(tap)tap.mv+=Math.abs(dx)+Math.abs(dy)}});
const pend=e=>{if(joy&&joy.id===e.pointerId){joy=null;ui.joy(false)}if(!ptrs.has(e.pointerId))return;ptrs.delete(e.pointerId);pinch=0;if(MODE==='bench'){if(tap&&tap.id===e.pointerId){if(tap.fire)trigUp();tap=null}}
  else{if(e.pointerType==='mouse'){if(e.button===0)trigUp();if(e.button===2){adsOn=false;ui.sync()}}else if(tap&&tap.id===e.pointerId){if(tap.mv<10&&performance.now()-tap.t<260){trigDown();setTimeout(trigUp,40)}tap=null}}};
c.on(cvs,'pointerup',pend);c.on(cvs,'pointercancel',pend);c.on(cvs,'contextmenu',e=>e.preventDefault());
c.on(document,'mousemove',e=>{if(MODE!=='bench'&&document.pointerLockElement===cvs){const s=.0022*(camera.fov/62);yaw-=e.movementX*s;pitch=Math.max(-.6,Math.min(.45,pitch-e.movementY*s))}});
c.on(document,'mouseup',e=>{if(MODE!=='bench'&&document.pointerLockElement===cvs){if(e.button===0)trigUp();if(e.button===2){adsOn=false;ui.sync()}}});
c.on(document,'mousedown',e=>{if(MODE!=='bench'&&document.pointerLockElement===cvs&&e.target!==cvs){if(e.button===0)trigDown();if(e.button===2){adsOn=true;ui.sync()}}});
c.on(cvs,'wheel',e=>{if(MODE==='bench'){orb.z=Math.min(2.6,Math.max(.35,orb.z*(e.deltaY>0?1.1:.9)));e.preventDefault()}},{passive:false});
c.on(document,'keydown',e=>{if(!W||e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;const k=e.key.toLowerCase();if(k===' '){e.preventDefault();if(MODE==='zombie'){zJump();return}if(!e.repeat)trigDown();return}if(MODE==='zombie'&&(k==='v'||k==='f')&&!e.repeat){zMelee();return}if(k==='q'&&MODE!=='bench'){if(!e.repeat&&!adsOn){adsOn=true;ui.sync()}return}if(e.repeat)return;
  if(k==='r')reload();else if(k==='e')rack();else if(k==='f')toggleSafety();else if(k==='b'||k==='v')cycleMode();else if(k==='t'&&MODE!=='zombie'){SLOW=!SLOW;TS=SLOW?.1:1;ui.sync()}else if(k==='c'&&MODE!=='bench'){adsOn=!adsOn;ui.sync()}else if(k==='m')toggleLock();else if(k==='p'&&MODE==='range')bringPaper();else if(k==='n'&&MODE==='range')nextRange();else if(k==='n'&&MODE==='zombie')zNextMap();else if(k==='k'&&MODE==='range')launchClay();else if(k==='g'||k===']'||(k==='q'&&MODE==='bench'))ownedStep(1);else if(k==='['||k==='x')ownedStep(-1);else if(k==='tab'){e.preventDefault();if(MODE==='zombie')ui.zshop(!ui.zshopOn());else ui.openPick(!ui.pickOn())}else if(k==='escape'&&(ui.pickOn()||ui.zshopOn())){ui.openPick(false);ui.zshop(false)}else if(/^[1-9]$/.test(k)){if(MODE==='zombie'){const o=GUNS.filter(g=>Z.owned.has(g.id))[+k-1];if(o)selectGun(GUNS.indexOf(o))}else setGun(+k-1)}});
c.on(document,'keyup',e=>{if(e.key===' '&&MODE!=='zombie')trigUp();if(e.key.toLowerCase()==='q'&&MODE!=='bench'&&adsOn){adsOn=false;ui.sync()}});

/* ---------- main loop ---------- */
st3.onFrame(dtr=>{if(!W||dead)return;const dt=dtr*TS;
  runCos(dt);W.cool=Math.max(0,W.cool-dt);
  if(W.trig&&W.d.modes){const md=W.d.modes[W.mode];if(md==='AUTO'&&ready())pull();else if(md==='BURST'&&W.burst>1&&ready()){W.burst--;pull()}}
  const d=W.d;{const K=620,C=24,K2=380,C2=19;rec.v+=(-K*rec.x-C*rec.v)*dt;rec.x+=rec.v*dt;rec.av+=(-K2*rec.a-C2*rec.av)*dt;rec.a+=rec.av*dt}
  const adsDamp=MODE==='bench'?0:ads;recoil.position.set(d.pivot[0]-rec.x*(1-adsDamp*.8),d.pivot[1],0);recoil.rotation.z=rec.a*(1-adsDamp*.88)*(d.pivot[0]<-.2?.5+.5*(1-adsDamp):1)+rec.tilt;
  const P=W.P;if(P.trig){W.trigT=W.trig&&(d.modes&&d.modes[W.mode]!=='SEMI')?1:Math.max(0,W.trigT-dt*9);if(d.id==='m1911')P.trig.position.x=P.trig.userData.x0-.003*W.trigT;else if(d.type!=='rev')P.trig.rotation.z=-.32*W.trigT}
  if(flashT>0){flashT-=dt;if(flashT<=0){FX.visible=false;flashL.intensity=0}else flashL.intensity*=.7}
  const sub=Math.max(1,Math.ceil(dt/.0035)),h=dt/sub;for(let s=0;s<sub;s++)for(const b of bodies)stepBody(b,h);for(let i=bodies.length-1;i>=0;i--)if(bodies[i].dead){fxRoot.remove(bodies[i].o);bodies.splice(i,1)}
  if(MODE==='zombie')stepZombies(dt);stepBits(dt);stepParts(dt);stepTracers(dt);
  if(MODE==='bench')camBench(dtr);else camRange(dtr,dt);
  ui.draw()});

setGun(cfg.zombie?0:Math.min(GUNS.length-1,Math.max(0,S.get('gs_gun',0)|0)));ui.sync();if(cfg.zombie)setMode('zombie');
if(!cfg.zombie)setTimeout(()=>ui.toast(wrap.classList.contains('touch')?'Tap the gun to fire · drag to turn it':'Click the gun or press Space to fire'),400);
if(window.__GS_TEST)window.__GS={zSetMap,get ZN(){return ZN},get Z(){return Z},selectRange,launchClay,get RMAP(){return RMAP},get W(){return W},setGun,setMode,reload,rack,trigDown,trigUp,toggleSafety,cycleMode,bodies,get RG(){return RG},camera,orb,startDrill,drill,set TS(v){TS=v},scene,aim:(y,p)=>{yaw=y;pitch=p},ads:v=>{adsOn=v;ui.sync()},Z,PL,buy,startWave,spawnZombie,zJump,zMelee};
return()=>{dead=true;if(document.pointerLockElement===cvs)document.exitPointerLock();Object.values(cache).forEach(m=>{if(!m.parent)m.traverse(o=>{o.geometry&&o.geometry.dispose()})});try{ENV_B.dispose();ENV_R.dispose();ENV_Z.dispose();pm.dispose()}catch(e){}try{CP&&CP.disconnect()}catch(e){}st3.dispose()}
})}
