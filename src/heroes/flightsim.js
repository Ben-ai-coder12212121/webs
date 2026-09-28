/* ================= FLIGHT ENGINE: Horizon (sim + adventure) and Skyfront 1943 (air combat) ================= */
const FL_CSS=`.fl .hud{font:700 13px system-ui,-apple-system,Segoe UI,sans-serif;color:#fff}
.fl button{transform:none!important}
.fl-cv{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.fl-ov{position:absolute;inset:0;display:none;align-items:center;justify-content:center;padding:12px;pointer-events:auto;background:rgba(6,12,20,.55);overflow:auto}
.fl-ov.on{display:flex}
.fl-card{background:rgba(14,22,34,.94);border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:16px 18px;max-width:720px;width:100%;max-height:100%;overflow:auto;color:#fff;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.fl-card h2{margin:0;font:900 clamp(26px,6vw,40px)/1.05 system-ui,sans-serif;letter-spacing:.01em}.fl-card h2 span{color:var(--ac)}
.fl-card h3{margin:14px 0 6px;font:900 12px system-ui,sans-serif;letter-spacing:.14em;opacity:.65}
.fl-card p{margin:6px 0;opacity:.85;font-weight:600;line-height:1.4}
.fl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:7px}
.fl-opt{all:unset;cursor:pointer;background:rgba(255,255,255,.06);border:2px solid transparent;border-radius:11px;padding:9px 11px;font:800 14px system-ui,sans-serif}
.fl-opt small{display:block;font:600 11px system-ui,sans-serif;opacity:.7;margin-top:3px;line-height:1.3}
.fl-opt.on{border-color:var(--ac);background:rgba(255,255,255,.1)}
.fl-go{all:unset;cursor:pointer;display:inline-block;margin-top:14px;background:var(--ac);color:#111;font:900 16px system-ui,sans-serif;padding:12px 26px;border-radius:12px}
.fl-sm{all:unset;cursor:pointer;display:inline-block;margin:14px 0 0 8px;background:rgba(255,255,255,.1);font:800 14px system-ui,sans-serif;padding:12px 18px;border-radius:12px}
.fl-keys{font:600 12px/1.6 system-ui,sans-serif;opacity:.75;margin-top:10px}
.fl-keys b{display:inline-block;min-width:18px;padding:0 5px;margin:0 2px;border-radius:4px;background:rgba(255,255,255,.15);text-align:center}
.fl-msg{position:absolute;left:0;right:0;top:22%;text-align:center;font:900 clamp(22px,5vw,40px) system-ui,sans-serif;text-shadow:0 2px 12px rgba(0,0,0,.6);pointer-events:none;opacity:0;transition:opacity .3s}
.fl-msg.on{opacity:1}.fl-msg small{display:block;font:700 15px system-ui,sans-serif;opacity:.9;margin-top:6px}
.fl-pause{position:absolute;right:10px;top:10px;pointer-events:auto;all:unset;cursor:pointer;background:rgba(0,0,0,.4);border-radius:9px;padding:6px 10px;font:800 12px system-ui,sans-serif;color:#fff}
.fl .tbtn{background:rgba(10,20,30,.55)!important}`;
function flightGame(root,c,cfg){return with3D(root,c,()=>{
const COMBAT=cfg.mode==='combat';
const st3=Stage3D(root,c,{lock:COMBAT,dragLook:!COMBAT,fov:COMBAT?70:62,far:40000,fireLabel:COMBAT?'FIRE':'THR +',altLabel:COMBAT?'BOMB':'THR −',jumpLabel:COMBAT?'VIEW':'GEAR'});
const{T,scene,camera,renderer,wrap,hud,input}=st3;const V3=T.Vector3,Q=T.Quaternion;
wrap.classList.add('fl');wrap.style.setProperty('--ac',COMBAT?'#ffb02e':'#5ec8ff');wrap.append(el('style',null,FL_CSS));
renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;camera.near=.3;camera.updateProjectionMatrix();
const PI=Math.PI,rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0],clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)},lin=h=>new T.Color(h).convertSRGBToLinear();
const hash=(x,z)=>{const s=Math.sin(x*127.1+z*311.7)*43758.5453;return s-Math.floor(s)};
const vn=(x,z)=>{const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf);return lerp(lerp(hash(xi,zi),hash(xi+1,zi),u),lerp(hash(xi,zi+1),hash(xi+1,zi+1),u),v)};
const fbm=(x,z,o)=>{let a=0,f=1,m=1,t=0;for(let i=0;i<(o||5);i++){a+=vn(x*f,z*f)*m;t+=m;f*=2.03;m*=.5}return a/t};
/* ---------------- world ---------------- */
const RWY={x:0,z0:1200,z1:-1200,y:20,w:45},ISL={x:-4600,z:1500,y:12},CITY={x:-1500,z:-2200};
const canyonX=z=>2600+Math.sin(z*.0016)*450;
function tH(x,z){let h=(fbm(x*.00045,z*.00045)-.36)*900;const r=1-Math.abs(fbm(x*.0009+7,z*.0009+3,4)*2-1);h+=r*r*800*sstep(900,3800,x-z*.35);
  h=lerp(-90,h,sstep(-4300,-2500,x));const di=Math.hypot(x-ISL.x,z-ISL.z);h=Math.max(h,lerp(ISL.y,-90,sstep(420,800,di)));if(di<420)h=lerp(ISL.y,h,sstep(330,420,di)*.0);
  if(z<1400&&z>-5600){const dc=Math.abs(x-canyonX(z)),ez=sstep(1400,1000,z)*sstep(-5600,-5200,z);const wall=Math.max(h,420+fbm(x*.004,z*.004)*160);const cut=lerp(45+dc*.15,wall,sstep(70,210,dc));h=lerp(h,Math.max(dc<600?wall*sstep(600,260,dc)+h*(1-sstep(600,260,dc)):h,0)*0+(dc<210?cut:dc<600?lerp(wall,h,sstep(260,600,dc)):h),ez)}
  if(z>1500&&z<9000&&Math.abs(x)<900){const gl=RWY.y+Math.tan(3*PI/180)*(z-900)-80;h=lerp(h>8?Math.max(8,Math.min(h,gl)):h,h,sstep(300,900,Math.abs(x)))}
  const da=Math.max(Math.abs(x-RWY.x)-280,0)+Math.max(Math.abs(z)-1750,0);h=lerp(RWY.y,h,sstep(0,650,da));
  const dcy=Math.hypot(x-CITY.x,z-CITY.z);h=lerp(18,h,sstep(700,1200,dcy));return h}
function gndH(x,z){return Math.max(tH(x,z),0)}
/* sky */
const TIMES={morning:{top:0x3d78c8,hor:0xf2c8a0,sun:0xffd0a0,el:.18,az:1.2,li:1.2},noon:{top:0x2a66cc,hor:0xbcd8f2,sun:0xfff4e0,el:.9,az:.4,li:1.8},sunset:{top:0x2a3a78,hor:0xf08a4a,sun:0xff8a3a,el:.07,az:-1.8,li:1},storm:{top:0x4a5260,hor:0x8a929c,sun:0xb0b8c0,el:.6,az:.4,li:.55}};
let TOD=TIMES.noon;const skyU={top:{value:new T.Color()},hor:{value:new T.Color()},sunDir:{value:new V3()},sunCol:{value:new T.Color()}};
const sky=new T.Mesh(new T.SphereGeometry(30000,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:skyU,vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform vec3 top,hor,sunCol,sunDir;varying vec3 vD;void main(){float y=vD.y;vec3 c=y>0.?mix(hor,top,pow(y,.5)):hor*mix(1.,.75,clamp(-y*3.,0.,1.));vec3 sd=normalize(sunDir);float s=max(dot(vD,sd),0.);c+=sunCol*(pow(s,8.)*.3+pow(s,80.)*.5)+sunCol*smoothstep(.9990,.9995,s)*1.5;gl_FragColor=vec4(c,1.);}'}));
sky.renderOrder=-10;scene.add(sky);
const hemi=new T.HemisphereLight(0xffffff,0x5a5a48,.6);scene.add(hemi);const sun=new T.DirectionalLight(0xffffff,1.6);scene.add(sun,sun.target);
renderer.shadowMap.enabled=true;sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:600});sun.shadow.bias=-.0006;
scene.fog=new T.Fog(0xbcd8f2,1500,22000);
/* water */
const wU={t:{value:0},wcol:{value:new T.Color(0x1a4a6a)},skyTop:{value:new T.Color()},skyHor:{value:new T.Color()},sunDir:{value:new V3()},sunCol:{value:new T.Color()},fogCol:{value:new T.Color()},fogF:{value:22000}};
const water=new T.Mesh(new T.PlaneGeometry(80000,80000,1,1).rotateX(-PI/2),new T.ShaderMaterial({uniforms:wU,fog:false,
  vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:'uniform float t,fogF;uniform vec3 wcol,skyTop,skyHor,sunDir,sunCol,fogCol;varying vec3 vW;float H(vec2 p){return sin(p.x*.05+t*.8)*.5+sin(p.y*.043-t*.7+p.x*.02)*.5+.4*sin((p.x+p.y)*.11+t*1.3)+.25*sin(p.x*.31-p.y*.23+t*2.1);}void main(){float d=distance(cameraPosition,vW);float k=clamp(1.-d/6000.,.05,1.)*.08;vec2 e=vec2(.5,0.);float hx=(H(vW.xz+e.xy)-H(vW.xz-e.xy))*k,hz=(H(vW.xz+e.yx)-H(vW.xz-e.yx))*k;vec3 n=normalize(vec3(-hx,1.,-hz));vec3 V=normalize(cameraPosition-vW);float f=.02+.98*pow(1.-max(dot(n,V),0.),5.);vec3 R=reflect(-V,n);R.y=abs(R.y);vec3 sky=mix(skyHor,skyTop,pow(clamp(R.y,0.,1.),.5));float s=max(dot(R,normalize(sunDir)),0.);vec3 c=mix(wcol,sky,clamp(f,0.,.9))+sunCol*(pow(s,500.)*4.+pow(s,50.)*.2);c=mix(c,fogCol,smoothstep(1500.,fogF,d));gl_FragColor=vec4(c,1.);}'}));
scene.add(water);
/* terrain */
const world=new T.Group();scene.add(world);
{const S=15000,N=300,g=new T.PlaneGeometry(S,S,N,N).rotateX(-PI/2),p=g.attributes.position,cols=[],cc=new T.Color(),ta=new T.Color();
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i)-800;p.setZ(i,z);const h=tH(x,z);p.setY(i,h);const sl=(Math.abs(tH(x+25,z)-h)+Math.abs(tH(x,z+25)-h))/25,n=fbm(x*.004,z*.004,3);
    if(h<2)cc.setHex(0xc8b890).lerp(ta.setHex(0x6a7a70),clamp(-h/30,0,1));else if(h<9)cc.setHex(0xd6c498);else if(sl>.9)cc.setHex(0x6e6a62).lerp(ta.setHex(0x8e8472),n);else if(h>560)cc.setHex(0xf0f2f6);else if(h>420)cc.setHex(0x7a7a6a).lerp(ta.setHex(0xe8eaee),sstep(420,560,h));
    else cc.setHex(n>.55?0x3e6a2a:0x5a8434).lerp(ta.setHex(0x8a8a4a),sstep(200,420,h)*.7).lerp(ta.setHex(0x2e5020),sstep(.5,.75,n)*.7);cc.convertSRGBToLinear();cols.push(cc.r,cc.g,cc.b)}
  g.setAttribute('color',new T.Float32BufferAttribute(cols,3));g.computeVertexNormals();const m=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:.96}));m.receiveShadow=true;world.add(m)}
const ctex=(w,h,fn)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;fn(cv.getContext('2d'),w,h);const t=new T.CanvasTexture(cv);t.encoding=T.sRGBEncoding;t.anisotropy=8;return t};
/* runway */
function runway(x,z0,z1,y,w,num){const L=Math.abs(z0-z1);const tex=ctex(128,2048,(g,W,H)=>{g.fillStyle='#3a3b3e';g.fillRect(0,0,W,H);for(let i=0;i<3000;i++){g.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:255},255,.04)`;g.fillRect(Math.random()*W,Math.random()*H,2,2)}g.fillStyle='#f2f2f2';g.fillRect(3,0,3,H);g.fillRect(W-6,0,3,H);
    for(let y=160;y<H-160;y+=60)g.fillRect(W/2-1.5,y,3,30);[[20],[H-80]].forEach(([y])=>{for(let i=0;i<8;i++)g.fillRect(12+i*(W-24)/8,y,(W-24)/8-5,60)});g.font='bold 34px sans-serif';g.textAlign='center';g.save();g.translate(W/2,110);g.rotate(PI);g.fillText(num[1],0,0);g.restore();g.save();g.translate(W/2,H-110);g.fillText(num[0],0,0);g.restore();
    [[H*.2],[H*.8]].forEach(([y])=>{g.fillRect(24,y,20,50);g.fillRect(W-44,y,20,50)})});
  const m=new T.Mesh(new T.PlaneGeometry(w,L).rotateX(-PI/2),new T.MeshStandardMaterial({map:tex,roughness:.85}));m.position.set(x,y+.06,(z0+z1)/2);m.receiveShadow=true;world.add(m);return m}
runway(RWY.x,RWY.z0,RWY.z1,RWY.y,RWY.w,['36','18']);runway(ISL.x,ISL.z+350,ISL.z-350,ISL.y,30,['36','18']);
const apron=new T.Mesh(new T.PlaneGeometry(160,500).rotateX(-PI/2),new T.MeshStandardMaterial({color:lin(0x55565a),roughness:.9}));apron.position.set(150,RWY.y+.04,0);apron.receiveShadow=true;world.add(apron);
const twy=new T.Mesh(new T.PlaneGeometry(90,20).rotateX(-PI/2),new T.MeshStandardMaterial({color:lin(0x4a4b4e),roughness:.9}));twy.position.set(68,RWY.y+.05,0);world.add(twy);
const B=(w,h,d,x,y,z,col,par)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color:lin(col),roughness:.8}));b.position.set(x,y+h/2,z);b.castShadow=b.receiveShadow=true;(par||world).add(b);return b};
for(let i=0;i<3;i++){const hg=new T.Mesh(new T.CylinderGeometry(22,22,40,20,1,false,0,PI),new T.MeshStandardMaterial({color:lin(0x9aa0a6),roughness:.5,metalness:.4}));hg.rotation.z=PI/2;hg.rotation.y=PI/2;hg.position.set(210,RWY.y,-160+i*60);hg.castShadow=true;world.add(hg)}
B(10,26,10,190,RWY.y,140,0xd8d8d0);B(16,6,16,190,RWY.y+26,140,0x445566);B(60,10,30,220,RWY.y,210,0xe6e0d4);
const PAPI=[];for(let i=0;i<4;i++){const m=new T.Mesh(new T.BoxGeometry(2,1,1),new T.MeshBasicMaterial({color:0xffffff}));m.position.set(RWY.x-RWY.w/2-12-i*4,RWY.y+.5,RWY.z0-300);world.add(m);PAPI.push(m)}
// approach lights
for(let i=1;i<12;i++){const m=new T.Mesh(new T.BoxGeometry(14,.4,.6),new T.MeshBasicMaterial({color:0xfff0c0}));m.position.set(RWY.x,Math.max(RWY.y,gndH(RWY.x,RWY.z0+i*30))+.5,RWY.z0+i*30);world.add(m)}
/* city */
{const pts=[];for(let i=0;i<420;i++){const a=rnd(0,2*PI),r=Math.sqrt(Math.random())*650,x=CITY.x+Math.cos(a)*r,z=CITY.z+Math.sin(a)*r;const gx=Math.round(x/45)*45,gz=Math.round(z/45)*45;if(pts.some(p=>p[0]===gx&&p[1]===gz))continue;pts.push([gx,gz,r])}
  const wt=ctex(64,128,(g,W,H)=>{g.fillStyle='#8a9098';g.fillRect(0,0,W,H);for(let y=4;y<H;y+=8)for(let x=4;x<W;x+=8){g.fillStyle=Math.random()<.3?'#e8e2c8':'#3a4452';g.fillRect(x,y,5,5)}});wt.wrapS=wt.wrapT=T.RepeatWrapping;wt.repeat.set(2,4);
  const im=new T.InstancedMesh(new T.BoxGeometry(1,1,1).translate(0,.5,0),new T.MeshStandardMaterial({map:wt,roughness:.6,metalness:.2}),pts.length);const mt=new T.Matrix4(),cc=new T.Color();
  pts.forEach(([x,z,r],i)=>{const h=rnd(15,50)+(650-r)*rnd(.05,.28);mt.makeScale(rnd(22,36),h,rnd(22,36));mt.setPosition(x,18,z);im.setMatrixAt(i,mt);im.setColorAt(i,cc.setHSL(rnd(.55,.62),rnd(.05,.2),rnd(.55,.85)))});im.castShadow=true;world.add(im)}
/* forest */
{const pts=[];let tries=0;while(pts.length<5500&&tries<60000){tries++;const x=rnd(-6000,6000),z=rnd(-7500,5500),h=tH(x,z);if(h<14||h>430)continue;if(fbm(x*.002+4,z*.002,3)<.5)continue;if(Math.abs(x-RWY.x)<330&&Math.abs(z)<1850)continue;if(Math.hypot(x-CITY.x,z-CITY.z)<760)continue;if(Math.hypot(x-ISL.x,z-ISL.z)<380)continue;const sl=Math.abs(tH(x+10,z)-h);if(sl>7)continue;pts.push([x,h,z])}
  const im=new T.InstancedMesh(new T.ConeGeometry(1,1,6).translate(0,.5,0),new T.MeshStandardMaterial({roughness:.9,flatShading:true}),pts.length);const mt=new T.Matrix4(),cc=new T.Color();
  pts.forEach(([x,h,z],i)=>{const s=rnd(5,9),hh=s*rnd(2.2,3.2);mt.makeScale(s,hh,s);mt.setPosition(x,h-1,z);im.setMatrixAt(i,mt);im.setColorAt(i,cc.set(lin(pick([0x2a4a24,0x335a2a,0x24401e,0x3e5e2a]))))});world.add(im)}
/* clouds */
const cloudTex=ctex(128,128,(g,W)=>{for(let i=0;i<14;i++){const x=rnd(30,98),y=rnd(40,88),r=rnd(18,36),gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,W,W)}});
const cloudMat=new T.SpriteMaterial({map:cloudTex,transparent:true,depthWrite:false,fog:true,color:0xffffff});const clouds=new T.Group();scene.add(clouds);
function makeClouds(n,lo,hi,dark){clouds.clear();cloudMat.color.set(dark?0x9aa0a8:0xffffff);for(let i=0;i<n;i++){const cx=rnd(-9000,9000),cz=rnd(-10000,8000),cy=rnd(lo,hi);for(let k=0;k<5;k++){const s=new T.Sprite(cloudMat);const sz=rnd(280,620);s.scale.set(sz*1.6,sz,1);s.position.set(cx+rnd(-300,300),cy+rnd(-50,80),cz+rnd(-300,300));clouds.add(s)}}}
/* ---------------- aircraft models ---------------- */
function buildPlane(D){const g=new T.Group(),M=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:lin(c),roughness:.45,metalness:.2},o||{}));const body=M(D.col),alt=M(D.col2),dark=M(0x222428,{roughness:.6}),glass=new T.MeshPhysicalMaterial({color:lin(0x9ab8d0),roughness:.05,metalness:.1,transparent:true,opacity:.45,clearcoat:1});
  const L=D.len,R=D.r;const pts=[];for(let i=0;i<=20;i++){const t=i/20;let r=t<.18?R*Math.pow(t/.18,.45):t<.55?R:R*lerp(1,.18,Math.pow((t-.55)/.45,1.2));if(D.jet&&t<.12)r=R*Math.pow(t/.12,.7)*.9;pts.push(new T.Vector2(Math.max(.02,r),(t-.5)*L))}
  const fg=new T.LatheGeometry(pts,18);fg.rotateX(-PI/2);const f=new T.Mesh(fg,body);f.castShadow=true;g.add(f);
  const wing=(span,chord,z,y,sweep,mat,thick)=>{const w=new T.BoxGeometry(span,thick||chord*.12,chord),p=w.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),a=Math.abs(x)/(span/2);p.setZ(i,p.getZ(i)*lerp(1,D.taper||.6,a)+a*sweep);p.setY(i,p.getY(i)+a*(D.dihedral||.03)*span/2)}w.computeVertexNormals();const m=new T.Mesh(w,mat);m.position.set(0,y,z);m.castShadow=true;g.add(m);return m};
  wing(D.span,D.chord,D.wz||-L*.05,D.wy!=null?D.wy:-R*.35,D.sweep||0,body);wing(D.span*.36,D.chord*.55,L*.43,R*.15,(D.sweep||0)*.5,body);
  const fin=new T.BoxGeometry(.12,D.fin||R*2.2,D.chord*.6),fp=fin.attributes.position;for(let i=0;i<fp.count;i++){if(fp.getY(i)>0)fp.setZ(i,fp.getZ(i)*.5+D.chord*.18)}fin.computeVertexNormals();const fm=new T.Mesh(fin,D.finCol!=null?M(D.finCol):body);fm.position.set(0,R*.4+(D.fin||R*2.2)/2,L*.42);fm.castShadow=true;g.add(fm);
  const can=new T.Mesh(new T.SphereGeometry(R*.72,14,10,0,2*PI,0,PI/2),glass);can.scale.set(.85,.9,2.4);can.position.set(0,R*.62,D.canZ!=null?D.canZ:-L*.12);g.add(can);
  if(D.stripe){const s=new T.Mesh(new T.CylinderGeometry(R*1.02,R*1.02,L*.06,18,1,true),alt);s.rotation.x=PI/2;s.position.z=L*.3;g.add(s)}
  if(D.roundel){[-1,1].forEach(sd=>{[[D.roundel[0],.9],[D.roundel[1],.55],[D.roundel[2],.25]].forEach(([c2,r],k)=>{const d=new T.Mesh(new T.CircleGeometry(D.chord*.36*r,20).rotateX(-PI/2),new T.MeshBasicMaterial({color:lin(c2)}));d.position.set(sd*D.span*.36,(D.wy!=null?D.wy:-R*.35)+D.chord*.07+.01+k*.005+Math.abs(D.span*.36)/(D.span/2)*(D.dihedral||.03)*D.span/2,(D.wz||-L*.05)+.1);g.add(d)})})}
  const prop=new T.Group();if(!D.jet){prop.position.z=-L/2-.05;g.add(prop);const sp=new T.Mesh(new T.ConeGeometry(R*.35,R*.9,12),D.spinner!=null?M(D.spinner):alt);sp.rotation.x=-PI/2;sp.position.z=-.2;prop.add(sp);for(let i=0;i<(D.blades||3);i++){const b=new T.Mesh(new T.BoxGeometry(.16,D.prop||R*2.4,.05),dark);b.position.y=(D.prop||R*2.4)/2*0;const bg=new T.Group();bg.rotation.z=i/(D.blades||3)*2*PI;b.position.y=(D.prop||R*2.4)/4;bg.add(b);prop.add(bg)}
    const disc=new T.Mesh(new T.CircleGeometry((D.prop||R*2.4)/2,24),new T.MeshBasicMaterial({color:0x222222,transparent:true,opacity:.18,depthWrite:false,side:T.DoubleSide}));prop.add(disc);prop.userData.disc=disc}
  else{[-1,1].forEach(sd=>{if(!D.twin)return;const n=new T.Mesh(new T.CylinderGeometry(R*.45,R*.4,L*.25,12),alt);n.rotation.x=PI/2;n.position.set(sd*R*1.25,R*.3,L*.28);g.add(n)});const ex=new T.Mesh(new T.CircleGeometry(R*.5,16),new T.MeshBasicMaterial({color:0xff9a4a,transparent:true,opacity:.0}));ex.position.z=L/2+.02;g.add(ex);g.userData.ex=ex}
  const gear=new T.Group();g.add(gear);const gh=D.gh||1.6;const wheel=(x,y,z,r)=>{const w=new T.Mesh(new T.CylinderGeometry(r,r,r*.6,14),dark);w.rotation.z=PI/2;w.position.set(x,y,z);gear.add(w);const s=new T.Mesh(new T.CylinderGeometry(.06,.06,Math.abs(y)-R*.3,6),M(0x999999,{metalness:.8}));s.position.set(x,(y-R*.3)/2,z);gear.add(s)};
  const wr=gh*.22;[-1,1].forEach(sd=>wheel(sd*D.span*.12,-gh+wr,D.gearZ!=null?D.gearZ:-L*.06,wr));if(D.tail)wheel(0,-gh*.55+wr*.5,L*.44,wr*.5);else wheel(0,-gh+wr*.8,-L*.35,wr*.8);
  g.userData.prop=prop;g.userData.gear=gear;g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
/* ---------------- plane definitions ---------------- */
const SIMP=[{id:'skylark',n:'Skylark 172',d:'Forgiving high-wing trainer. Slow, stable, easy to land.',m:1100,S:16.2,T:3700,vmax:86,cl0:.3,cla:5,clmax:1.55,cd0:.032,k:.05,rr:1.6,pr:1.1,yr:.7,stab:2.2,gh:1.35,fixed:true,
   mdl:{len:8.3,r:.75,span:11,chord:1.5,col:0xf4f4f2,col2:0xc8322a,wy:.9,wz:-.6,dihedral:.02,fin:1.7,canZ:-1.3,taper:.9,stripe:1,gh:1.35,gearZ:-.6,spinner:0xc8322a,prop:1.9,blades:2}},
 {id:'stunt',n:'Aero Stunt',d:'Aerobatic biplane-fast monoplane. Rolls like crazy.',m:750,S:11,T:4200,vmax:95,cl0:.1,cla:5,clmax:1.4,cd0:.03,k:.06,rr:4.2,pr:2,yr:1.2,stab:2,gh:1.3,fixed:true,
   mdl:{len:6.5,r:.6,span:7.5,chord:1.4,col:0x1a2a6a,col2:0xf2d02a,wy:-.3,dihedral:.01,fin:1.3,canZ:-.2,taper:.8,stripe:1,gh:1.3,tail:1,spinner:0xf2d02a,prop:1.9,blades:2}},
 {id:'starjet',n:'Starjet 5',d:'Twin-engine business jet. Fast and heavy: plan your descent.',m:7800,S:30,T:34000,vmax:270,cl0:.2,cla:4.6,clmax:1.35,cd0:.02,k:.045,rr:1.5,pr:.8,yr:.5,stab:2.4,gh:1.7,jet:true,flapsCL:.5,
   mdl:{len:15,r:1,span:14,chord:2.4,col:0xf2f4f6,col2:0x1a3a6a,jet:1,twin:1,sweep:1.6,wy:-.4,dihedral:.04,fin:3,finCol:0x1a3a6a,canZ:-5.5,taper:.45,gh:1.7,gearZ:.3}}];
const CBP=[{id:'kestrel',n:'Kestrel Mk.IX',d:'Nimble interceptor. 8 machine guns. Turns on a dime, fragile.',m:3400,S:22,T:15000,vmax:185,cl0:.2,cla:5.2,clmax:1.45,cd0:.022,k:.05,rr:3,pr:1.55,yr:.8,stab:2.3,gh:1.8,hp:100,guns:[['mg',8]],
   mdl:{len:9.5,r:.8,span:11.2,chord:2.1,col:0x6a7a4a,col2:0x3a4a2a,wy:-.4,dihedral:.03,canZ:-.2,taper:.55,tail:1,gh:1.8,roundel:[0x1a3a8a,0xffffff,0xc8201a],spinner:0xc8201a,prop:3.2,blades:4}},
 {id:'brute',n:'Thunder Brute',d:'Flying tank. 8 heavy guns and armour. Dives fast, turns wide.',m:5400,S:28,T:22000,vmax:195,cl0:.2,cla:5,clmax:1.35,cd0:.024,k:.05,rr:2.2,pr:1.15,yr:.7,stab:2.3,gh:1.9,hp:180,guns:[['hmg',8]],
   mdl:{len:11,r:1.1,span:12.4,chord:2.4,col:0x8a8f96,col2:0x2a2a2a,wy:-.5,dihedral:.03,canZ:-.4,taper:.6,tail:1,gh:1.9,stripe:1,roundel:[0x1a2a5a,0xffffff,0x1a2a5a],spinner:0xf2c02a,prop:3.6,blades:4}},
 {id:'zephyr',n:'Zephyr G-6',d:'Fast climber. Two cannons plus MGs: few hits needed.',m:3200,S:16,T:15500,vmax:200,cl0:.18,cla:5,clmax:1.35,cd0:.021,k:.055,rr:2.6,pr:1.35,yr:.8,stab:2.3,gh:1.7,hp:110,guns:[['cannon',2],['mg',2]],
   mdl:{len:9,r:.75,span:9.9,chord:1.8,col:0x7a8290,col2:0xe8c82a,wy:-.4,dihedral:.03,canZ:-.2,taper:.55,tail:1,gh:1.7,stripe:1,roundel:[0x222222,0xffffff,0x222222],spinner:0xe8c82a,prop:3,blades:3}},
 {id:'raven',n:'Raven FB',d:'Fighter-bomber. 4 guns and 4 bombs. Best for ground strikes.',m:4800,S:26,T:19000,vmax:180,cl0:.2,cla:5,clmax:1.4,cd0:.025,k:.05,rr:2.1,pr:1.2,yr:.7,stab:2.3,gh:1.9,hp:150,guns:[['hmg',4]],bombs:4,
   mdl:{len:10.5,r:1,span:12.6,chord:2.3,col:0x3a4a5a,col2:0xf2f2f2,wy:-.5,dihedral:.03,canZ:-.3,taper:.6,tail:1,gh:1.9,roundel:[0xffffff,0x1a2a5a,0xffffff],spinner:0xf2f2f2,prop:3.4,blades:4}}];
const ENP={viper:{n:'Viper',m:3100,S:18,T:14000,vmax:180,cl0:.2,cla:5,clmax:1.4,cd0:.022,k:.05,rr:2.6,pr:1.3,yr:.8,stab:2.3,gh:1.7,hp:55,guns:[['mg',4]],mdl:{len:9,r:.75,span:10,chord:1.9,col:0x9a8a6a,col2:0xc8201a,wy:-.4,canZ:-.2,taper:.55,tail:1,gh:1.7,roundel:[0xc8201a,0xc8201a,0xc8201a],spinner:0xc8201a,prop:3,blades:3}},
 hornet:{n:'Hornet',m:3300,S:19,T:15500,vmax:190,cl0:.2,cla:5,clmax:1.42,cd0:.022,k:.05,rr:2.9,pr:1.45,yr:.8,stab:2.3,gh:1.7,hp:80,guns:[['mg',2],['cannon',1]],mdl:{len:9.2,r:.78,span:10.4,chord:1.9,col:0x3a3a3a,col2:0xe8e8e8,wy:-.4,canZ:-.2,taper:.55,tail:1,gh:1.7,stripe:1,roundel:[0xe8e8e8,0x222222,0xe8e8e8],spinner:0xe8e8e8,prop:3,blades:3}},
 goliath:{n:'Goliath bomber',m:16000,S:90,T:40000,vmax:140,cl0:.35,cla:5,clmax:1.5,cd0:.03,k:.05,rr:.8,pr:.5,yr:.4,stab:2.5,gh:2.5,hp:320,bomber:true,guns:[['mg',2]],mdl:{len:22,r:1.5,span:32,chord:4.2,col:0x6a6a5a,col2:0xc8201a,wy:-.6,canZ:-8,taper:.5,tail:1,gh:2.5,roundel:[0xc8201a,0xc8201a,0xc8201a],spinner:0x444444,prop:4.2,blades:3}}};
const GUN={mg:{rof:12,dmg:3.2,spd:880,spr:.004,col:0xfff0a0},hmg:{rof:10,dmg:5,spd:860,spr:.0045,col:0xffd070},cannon:{rof:5,dmg:17,spd:760,spr:.005,col:0xff9a4a}};
/* ---------------- flight model ---------------- */
const RHO=1.225,G=9.81;const _q=new Q(),_v=new V3(),_e=new T.Euler();
function mkAircraft(D,team){const mdl=buildPlane(D.mdl);scene.add(mdl);const a={D,team,mdl,p:new V3(),v:new V3(),q:new Q(),ctl:{pitch:0,roll:0,yaw:0,thr:.8},thr:.8,flaps:0,gear:1,gearT:1,brake:0,onGround:false,hp:D.hp||100,dead:false,gunT:0,gunAlt:0,bombs:D.bombs||0,smoke:0,aoa:0,g:1,prop:0,crashed:false,id:Math.random()};return a}
function axes(a){return{fwd:new V3(0,0,-1).applyQuaternion(a.q),up:new V3(0,1,0).applyQuaternion(a.q),right:new V3(1,0,0).applyQuaternion(a.q)}}
function stepFlight(a,dt,turb){const D=a.D,{fwd,up,right}=axes(a);const sp=a.v.length();a.thr+=(a.ctl.thr-a.thr)*Math.min(1,dt*1.5);
  const qi=a.q.clone().invert(),vl=a.v.clone().applyQuaternion(qi);const fs=Math.max(.1,-vl.z);const aoa=Math.atan2(-vl.y,fs),beta=Math.atan2(vl.x,fs);a.aoa=aoa;
  const clmax=D.clmax+a.flaps*(D.flapsCL||.45);let CL=D.cl0+a.flaps*.35+D.cla*aoa;const stallA=(clmax-D.cl0-a.flaps*.35)/D.cla;a.stall=Math.abs(aoa)>stallA;if(a.stall)CL=Math.sign(CL)*Math.max(.2,clmax-(Math.abs(aoa)-stallA)*3.5);CL=clamp(CL,-clmax,clmax);
  const qd=.5*RHO*sp*sp,lift=qd*D.S*CL,drag=qd*D.S*(D.cd0+D.k*CL*CL+a.flaps*.03+(a.gear&&!D.fixed?.015:0)+(a.dmgDrag||0));
  const thrust=a.thr*D.T*Math.max(0,1-Math.pow(sp/D.vmax,2))*(a.engineOut?0:1);
  const F=new V3();if(sp>.5){const vd=a.v.clone().divideScalar(sp);F.addScaledVector(new V3().crossVectors(right,vd).normalize(),lift);F.addScaledVector(vd,-drag)}F.addScaledVector(fwd,thrust);F.y-=D.m*G;
  F.addScaledVector(right,-vl.x*D.m*.9);// side slip damping
  if(turb){F.x+=turb.x*D.m;F.y+=turb.y*D.m;F.z+=turb.z*D.m}
  const acc=F.divideScalar(D.m);a.g=acc.clone().add(new V3(0,G,0)).dot(up)/G;a.v.addScaledVector(acc,dt);a.p.addScaledVector(a.v,dt);
  const auth=clamp(qd/(.5*RHO*Math.pow(D.vmax*.45,2)),0,1.4),stab=D.stab*clamp(sp/(D.vmax*.35),0,1.3);
  let pr=a.ctl.pitch*D.pr*auth-aoa*stab,rr=-a.ctl.roll*D.rr*auth,yr=-a.ctl.yaw*D.yr*auth-beta*stab*.8;if(a.stall){pr+=(Math.random()-.5)*.8;rr+=(Math.random()-.5)*.6-Math.sign(aoa)*.3}
  if(a.dmgRoll)rr+=a.dmgRoll;a.q.multiply(_q.setFromEuler(_e.set(pr*dt,yr*dt,rr*dt,'XYZ'))).normalize();a.ias=sp}
function groundCheck(a,dt,onCrash){const gh=a.D.gh,h=gndH(a.p.x,a.p.z),rw=Math.abs(a.p.x-RWY.x)<RWY.w/2+30&&a.p.z<RWY.z0+60&&a.p.z>RWY.z1-60||Math.hypot(a.p.x-ISL.x,a.p.z-ISL.z)<380;
  if(a.p.y-gh>h+.05){a.onGround=false;return}
  const vs=-a.v.y;_e.setFromQuaternion(a.q,'YXZ');const pitch=_e.x,roll=_e.z;const water=tH(a.p.x,a.p.z)<.5;
  if(!a.onGround){a.touch={vs,roll,x:a.p.x,z:a.p.z}}
  if(water||!a.gear||vs>(COMBAT?6:4.2)||Math.abs(roll)>.45||pitch<-.2||pitch>.45||(a.v.length()>25&&!rw&&!COMBAT&&tH(a.p.x,a.p.z)>0&&Math.abs(tH(a.p.x+8,a.p.z)-tH(a.p.x-8,a.p.z))>1.6)){onCrash(a,water);return}
  a.onGround=true;a.p.y=h+gh;if(a.v.y<0)a.v.y=0;const hv=new V3(a.v.x,0,a.v.z),sp=hv.length();const yaw=_e.y;const fw=new V3(-Math.sin(yaw),0,-Math.cos(yaw));
  const fsp=hv.dot(fw);let nsp=fsp-Math.sign(fsp)*Math.min(Math.abs(fsp),(.25+a.brake*5)*dt);a.v.x=fw.x*nsp;a.v.z=fw.z*nsp;
  const ny=yaw-a.ctl.yaw*clamp(sp/8,0,1)*.6*dt*(sp<40?1:.3);const np=clamp(pitch+(a.ctl.pitch>0&&sp>a.D.vmax*.28?a.ctl.pitch*.5*dt:-.4*dt),a.D.mdl.tail?.14*(sp<25?1:0):-.01,.3);a.q.setFromEuler(_e.set(np,ny,roll*Math.max(0,1-dt*6),'YXZ'))}
/* ---------------- effects ---------------- */
const fx=new T.Group();scene.add(fx);let puffs=[];
const puffTex=ctex(64,64,(g)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.5,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64)});
function puff(p,col,size,life,vel,grow,op){const m=new T.Sprite(new T.SpriteMaterial({map:puffTex,color:col,transparent:true,depthWrite:false,opacity:op||.8}));m.position.copy(p);m.scale.setScalar(size);fx.add(m);puffs.push({m,life,max:life,v:vel||new V3(),grow:grow||1,op:op||.8})}
function explode(p,big){for(let i=0;i<(big?26:12);i++)puff(p.clone().add(new V3(rnd(-4,4),rnd(-4,4),rnd(-4,4)).multiplyScalar(big?2:1)),i<8?0xffc060:i<14?0xff6a2a:0x333333,rnd(8,18)*(big?2:1),rnd(.8,2.5),new V3(rnd(-8,8),rnd(0,12),rnd(-8,8)),2.5,.95);boom(big)}
function stepPuffs(dt){for(let i=puffs.length-1;i>=0;i--){const q=puffs[i];q.life-=dt;if(q.life<=0){fx.remove(q.m);q.m.material.dispose();puffs.splice(i,1);continue}q.m.position.addScaledVector(q.v,dt);q.m.scale.multiplyScalar(1+dt*q.grow*.5);q.m.material.opacity=q.op*Math.min(1,q.life/q.max*1.6)}}
// tracers
const TRN=900,trGeo=new T.BufferGeometry();trGeo.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(TRN*6),3));trGeo.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(TRN*6),3));
const tracers=new T.LineSegments(trGeo,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.95,fog:false}));tracers.frustumCulled=false;scene.add(tracers);let bullets=[];
/* ---------------- audio ---------------- */
let eng=null;function engineStart(){if(eng||muted)return;try{const a=ac();const o=a.createOscillator(),o2=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain();o.type='sawtooth';o2.type='square';f.type='lowpass';f.frequency.value=500;g.gain.value=0;o.connect(f);o2.connect(f);f.connect(g);g.connect(a.destination);o.start();o2.start();
  const len=a.sampleRate,buf=a.createBuffer(1,len,a.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const ns=a.createBufferSource();ns.buffer=buf;ns.loop=true;const nf=a.createBiquadFilter();nf.type='bandpass';nf.frequency.value=800;const ng=a.createGain();ng.gain.value=0;ns.connect(nf);nf.connect(ng);ng.connect(a.destination);ns.start();eng={o,o2,f,g,ng,nf}}catch(e){}}
function engineSet(thr,sp,jet){if(!eng)return;try{const a=ac(),t=a.currentTime;if(muted){eng.g.gain.setTargetAtTime(0,t,.05);eng.ng.gain.setTargetAtTime(0,t,.05);return}const f=jet?120+thr*260:38+thr*52+sp*.08;eng.o.frequency.setTargetAtTime(f,t,.1);eng.o2.frequency.setTargetAtTime(f*(jet?1.51:.5),t,.1);eng.f.frequency.setTargetAtTime(jet?900+thr*2000:300+thr*500,t,.1);eng.g.gain.setTargetAtTime(.022+thr*.022,t,.1);eng.ng.gain.setTargetAtTime(clamp(sp/250,0,1)*.05,t,.1);eng.nf.frequency.setTargetAtTime(500+sp*6,t,.1)}catch(e){}}
let gunBuf=null,lastGun=0;function gunSnd(k,vol){if(muted||vol<.01)return;try{const a=ac(),t=a.currentTime;if(t-lastGun<.035&&k!=='cannon')return;lastGun=t;if(!gunBuf){const n=Math.floor(a.sampleRate*.25);gunBuf=a.createBuffer(1,n,a.sampleRate);const d=gunBuf.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.2)}
  const s=a.createBufferSource();s.buffer=gunBuf;s.playbackRate.value=k==='cannon'?.55:k==='hmg'?.8:1.05;const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=k==='cannon'?1400:3200;const g=a.createGain();g.gain.value=vol*(k==='cannon'?1.3:1);s.connect(f);f.connect(g);g.connect(a.destination);s.start(t,0,k==='cannon'?.25:.12);
  const o=a.createOscillator(),og=a.createGain();o.type='square';o.frequency.setValueAtTime(k==='cannon'?90:150,t);o.frequency.exponentialRampToValueAtTime(40,t+.06);og.gain.setValueAtTime(vol*.35,t);og.gain.exponentialRampToValueAtTime(.0001,t+.07);o.connect(og);og.connect(a.destination);o.start(t);o.stop(t+.08)}catch(e){}}
function boom(big){noise(big?1.2:.6,'lowpass',big?300:600,big?.5:.3);sweep(big?90:140,30,big?1:.5,'sine',.3)}
/* ---------------- HUD ---------------- */
const cv=el('canvas',{class:'fl-cv'});const msgE=el('div',{class:'fl-msg'});const ov=el('div',{class:'fl-ov'});const pauseB=el('button',{type:'button',class:'fl-pause'},'❚❚ Menu');hud.append(cv,msgE,pauseB,ov);
[ov,pauseB].forEach(x=>{x.addEventListener('mousedown',e=>e.stopPropagation());x.addEventListener('pointerdown',e=>e.stopPropagation())});pauseB.onclick=e=>{e.stopPropagation();menu()};
const cx=cv.getContext('2d');let msgT=0;function msg(t,sub,dur){msgE.innerHTML='';msgE.append(document.createTextNode(t));if(sub)msgE.append(el('small',null,sub));msgE.classList.add('on');msgT=dur||2.5}
/* ---------------- game state ---------------- */
let state='menu',P=null,planes=[],ground=[],bombsA=[],rings=[],ringI=0,mission=null,score=0,kills=0,timeT=0,camMode=0,camYaw=0,camPitch=0,aim={yaw:0,pitch:0},turbV=new V3(),rain=null,flashT=0,wave=0,resultShown=false,landT=0;
const OPT={plane:0,mission:0,time:'noon',invert:false};try{Object.assign(OPT,JSON.parse(S.get(cfg.id+'_opt','{}')))}catch(e){}
const SIMM=[{id:'free',n:'Free flight',d:'Start on the runway. Take off, explore the valley, canyon, city and island.'},{id:'land',n:'Landing challenge',d:'On final approach 5 km out. Follow the PAPI lights (2 white, 2 red) and touch down gently.'},{id:'canyon',n:'Canyon run',d:'Thread 14 rings through the winding canyon. Against the clock.'},{id:'island',n:'Island hop',d:'Fly west over the sea and land on the tiny island strip.'},{id:'storm',n:'Storm flight',d:'Turbulence, rain and low cloud. Get home and land in one piece.'},{id:'city',n:'City tour',d:'Fly low through 10 rings between the towers. Don’t clip a building!'}];
const CBM=[{id:'dogfight',n:'Dogfight',d:'Three waves of enemy fighters. Shoot them all down.'},{id:'intercept',n:'Bomber intercept',d:'Bombers with escorts are heading for your airfield. Stop them.'},{id:'strike',n:'Ground strike',d:'Destroy AA guns, tanks and ships. Watch out for flak.'},{id:'survival',n:'Endless skies',d:'Waves keep coming. How long can you last?'}];
function saveOpt(){S.set(cfg.id+'_opt',JSON.stringify(OPT))}
/* ---------------- menu ---------------- */
function menu(){state='menu';ov.classList.add('on');ov.innerHTML='';if(document.pointerLockElement)document.exitPointerLock();const card=el('div',{class:'fl-card'});ov.append(card);
  card.append(el('h2',null,COMBAT?'SKYFRONT ':'HORIZON ',el('span',null,COMBAT?'1943':'FLIGHT')),el('p',null,COMBAT?'WWII-era air combat. Mouse-aim flying: point where you want to go and the plane follows. Lead your shots using the aim marker.':'A flight simulator with a real flight model: lift, drag, stalls, flaps and gear. Take off, fly the canyon, hop to the island and land it smoothly.'));
  const sec=(t,list,key,fmt)=>{card.append(el('h3',null,t));const g=el('div',{class:'fl-grid'});list.forEach((o,i)=>{const b=el('button',{type:'button',class:'fl-opt'+(OPT[key]===(fmt?o.id:i)?' on':'')},o.n,el('small',null,o.d));b.onclick=e=>{e.stopPropagation();OPT[key]=fmt?o.id:i;saveOpt();menu()};g.append(b)});card.append(g)};
  sec('MISSION',COMBAT?CBM:SIMM,'mission');sec('AIRCRAFT',COMBAT?CBP:SIMP,'plane');if(!COMBAT)sec('TIME OF DAY',[{id:'morning',n:'Morning',d:'Low golden sun'},{id:'noon',n:'Noon',d:'Clear and bright'},{id:'sunset',n:'Sunset',d:'Orange skies'}],'time',1);
  const best=S.get(cfg.id+'_best',0);const go=el('button',{type:'button',class:'fl-go'},P&&state!=='menu'?'Resume':'Take off →');go.onclick=e=>{e.stopPropagation();start()};card.append(go);
  if(!COMBAT){const inv=el('button',{type:'button',class:'fl-sm'},'Pitch: '+(OPT.invert?'W = nose up':'W = nose down (sim)'));inv.onclick=e=>{e.stopPropagation();OPT.invert=!OPT.invert;saveOpt();menu()};card.append(inv)}
  card.append(el('div',{class:'fl-keys'},...(COMBAT?[el('b',null,'Mouse'),' aim · ',el('b',null,'Click'),'/',el('b',null,'Space'),' fire · ',el('b',null,'B'),'/right-click bomb · ',el('b',null,'W'),el('b',null,'S'),' throttle · ',el('b',null,'A'),el('b',null,'D'),'/arrows aim with keys · ',el('b',null,'Q'),el('b',null,'E'),' roll · ',el('b',null,'C'),' camera · ',el('b',null,'Esc'),' menu',el('br'),'Best score: '+best]:
    [el('b',null,'W'),el('b',null,'S'),' pitch · ',el('b',null,'A'),el('b',null,'D'),' roll · ',el('b',null,'Q'),el('b',null,'E'),' rudder · ',el('b',null,'Shift'),'/',el('b',null,'Ctrl'),' or ',el('b',null,'+'),el('b',null,'−'),' throttle · ',el('b',null,'F'),' flaps · ',el('b',null,'G'),' gear · ',el('b',null,'B'),' brakes · ',el('b',null,'C'),' cockpit/chase · drag to look'])))}
/* ---------------- mission setup ---------------- */
function clearWorld(){planes.forEach(p=>scene.remove(p.mdl));planes=[];ground.forEach(g=>world.remove(g.m));ground=[];bombsA.forEach(b=>scene.remove(b.m));bombsA=[];rings.forEach(r=>scene.remove(r.m));rings=[];bullets=[];puffs.forEach(q=>fx.remove(q.m));puffs=[];if(rain){scene.remove(rain);rain=null}}
function setTime(k){TOD=TIMES[k];skyU.top.value.set(TOD.top);skyU.hor.value.set(TOD.hor);skyU.sunCol.value.set(TOD.sun);const sd=new V3(Math.cos(TOD.az)*Math.cos(TOD.el),Math.sin(TOD.el),Math.sin(TOD.az)*Math.cos(TOD.el));skyU.sunDir.value.copy(sd);
  wU.skyTop.value.set(TOD.top);wU.skyHor.value.set(TOD.hor);wU.sunDir.value.copy(sd);wU.sunCol.value.set(TOD.sun);wU.fogCol.value.set(TOD.hor);scene.fog.color.set(TOD.hor).convertSRGBToLinear();sun.color.set(lin(TOD.sun));sun.intensity=TOD.li;hemi.intensity=k==='storm'?.45:.6;sun.userData.dir=sd;
  scene.fog.near=k==='storm'?300:1500;scene.fog.far=k==='storm'?4500:22000;wU.fogF.value=scene.fog.far}
function place(a,x,y,z,yaw,pitch,speed){a.p.set(x,y,z);a.q.setFromEuler(_e.set(pitch||0,yaw,0,'YXZ'));a.v.set(0,0,-1).applyQuaternion(a.q).multiplyScalar(speed)}
function ring(x,y,z,yaw,r){const m=new T.Mesh(new T.TorusGeometry(r||40,3,10,40),new T.MeshBasicMaterial({color:0xffc02a,fog:false}));m.position.set(x,y,z);m.rotation.y=yaw;scene.add(m);rings.push({m,p:new V3(x,y,z),n:new V3(-Math.sin(yaw),0,-Math.cos(yaw)),r:r||40,done:false})}
function start(){engineStart();unlockAudio&&unlockAudio();if(state==='paused'){state='play';ov.classList.remove('on');return}
  clearWorld();ov.classList.remove('on');state='play';camInit=false;resultShown=false;score=0;kills=0;timeT=0;wave=0;ringI=0;landT=0;camMode=0;
  const list=COMBAT?CBP:SIMP,D=list[OPT.plane]||list[0];P=mkAircraft(D,0);planes.push(P);mission=(COMBAT?CBM:SIMM)[OPT.mission]||(COMBAT?CBM:SIMM)[0];
  setTime(COMBAT?(mission.id==='strike'?'morning':mission.id==='intercept'?'sunset':'noon'):mission.id==='storm'?'storm':OPT.time);makeClouds(mission.id==='storm'?120:COMBAT?90:60,mission.id==='storm'?350:700,mission.id==='storm'?900:1400,mission.id==='storm');
  if(COMBAT){place(P,0,1300,2500,0,0,150);P.gear=0;P.gearT=0;P.ctl.thr=P.thr=1;aim.yaw=0;aim.pitch=0;P.flaps=0;
    if(mission.id==='strike')spawnGround();nextWave()}
  else{const m=mission.id;P.flaps=0;
    if(m==='free'||m==='canyon'||m==='island'||m==='city'){place(P,RWY.x,RWY.y+D.gh,RWY.z0-60,0,0,0);P.onGround=true;P.ctl.thr=P.thr=0;P.flaps=1}
    if(m==='land'||m==='storm'){const dist=m==='storm'?7000:5000,alt=Math.tan(3*PI/180)*dist+RWY.y;place(P,RWY.x+(m==='storm'?300:0),alt,RWY.z0+dist,0,-.05,D.jet?85:38);P.ctl.thr=P.thr=D.jet?.35:.45;P.flaps=1}
    if(m==='canyon'){for(let i=0;i<14;i++){const z=900-i*400,x=canyonX(z),y=tH(x,z)+45+Math.sin(i)*15;const dz=-10,dx=canyonX(z+dz)-x;ring(x,y,z,Math.atan2(dx,-dz)*-1+0,45)}}
    if(m==='city'){for(let i=0;i<10;i++){const a=i/10*2*PI,r=380+(i%2)*160;ring(CITY.x+Math.cos(a)*r,90+(i%3)*40,CITY.z+Math.sin(a)*r,-a,38)}}
    if(m==='island')msg('Fly west to the island','Follow the orange marker',4);if(m==='free')msg('Free flight','Full throttle (Shift), then pull back (S) at 55 kt',4);if(m==='land')msg('Final approach','Runway 36 · keep 2 white, 2 red on the PAPI',4);if(m==='storm'){msg('Storm flight','Hold it steady. Runway 36 ahead',4);buildRain()}
    if(m==='canyon')msg('Canyon run','Take off and fly the rings in order',4);if(m==='city')msg('City tour','Take off and fly the rings over the city',4)}
  try{if(COMBAT&&!input.touch)renderer.domElement.requestPointerLock()}catch(e){}}
function buildRain(){const g=new T.BufferGeometry(),n=1500,p=new Float32Array(n*6);for(let i=0;i<n;i++){const x=rnd(-60,60),y=rnd(-40,40),z=rnd(-60,60);p.set([x,y,z,x+.3,y-2.5,z],i*6)}g.setAttribute('position',new T.BufferAttribute(p,3));rain=new T.LineSegments(g,new T.LineBasicMaterial({color:0xaab4c0,transparent:true,opacity:.35,fog:false}));rain.frustumCulled=false;scene.add(rain)}
function spawnEnemy(type,near){const D=Object.assign({},ENP[type]);const a=mkAircraft(D,1);const{fwd}=axes(P);const ang=Math.atan2(-fwd.x,-fwd.z)+rnd(-.9,.9),dist=near?rnd(1500,2200):rnd(2600,3600);
  const x=P.p.x-Math.sin(ang)*dist,z=P.p.z-Math.cos(ang)*dist,y=D.bomber?rnd(1500,1800):clamp(P.p.y+rnd(-300,400),500,2500);place(a,x,y,z,ang+PI,0,D.bomber?110:150);a.gear=0;a.ctl.thr=1;a.ai={mode:'attack',t:0,evT:0,off:new V3(rnd(-1,1),rnd(-.3,.3),rnd(-1,1))};planes.push(a);return a}
function nextWave(){wave++;const m=mission.id;if(m==='dogfight'){if(wave>3)return win();const n=[3,4,6][wave-1];for(let i=0;i<n;i++)spawnEnemy(wave===3&&i%2?'hornet':i<2||wave<2?'viper':'hornet');msg('Wave '+wave+' of 3',n+' bandits inbound')}
  else if(m==='intercept'){if(wave>2)return win();const lead=spawnEnemy('goliath');for(let i=1;i<(wave===1?4:5);i++){const b=spawnEnemy('goliath');b.p.copy(lead.p).add(new V3(rnd(-150,150),rnd(-40,40),rnd(80,260)));b.q.copy(lead.q);b.v.copy(lead.v)}for(let i=0;i<wave+1;i++)spawnEnemy(i%2?'hornet':'viper');msg('Bombers inbound','Wave '+wave+' of 2 · stop them before they reach the airfield')}
  else if(m==='strike'){if(wave>1)return;for(let i=0;i<2;i++)spawnEnemy('viper');msg('Destroy the ground targets',ground.length+' targets marked')}
  else{const n=Math.min(2+wave,9);for(let i=0;i<n;i++)spawnEnemy(wave>3&&Math.random()<.5?'hornet':'viper');if(wave%3===0)spawnEnemy('goliath');msg('Wave '+wave,n+' bandits')}}
function spawnGround(){const add=(kind,x,z)=>{const y=gndH(x,z);const g=new T.Group();g.position.set(x,y,z);world.add(g);const mat=c2=>new T.MeshStandardMaterial({color:lin(c2),roughness:.8});
    if(kind==='aa'){const b=new T.Mesh(new T.CylinderGeometry(3,3.5,1.5,10),mat(0x5a5a4a));b.position.y=.75;g.add(b);const t=new T.Mesh(new T.BoxGeometry(2,1.6,2.4),mat(0x6a6a52));t.position.y=2.2;g.add(t);for(const s of[-.4,.4]){const br=new T.Mesh(new T.CylinderGeometry(.15,.15,5,6),mat(0x2a2a2a));br.rotation.x=-1;br.position.set(s,3.6,-1.8);g.add(br)}const sb=new T.Mesh(new T.TorusGeometry(4.5,1,6,16),mat(0x8a7a5a));sb.rotation.x=PI/2;sb.position.y=.4;g.add(sb)}
    if(kind==='tank'){const h=new T.Mesh(new T.BoxGeometry(3.4,1.3,6.5),mat(0x4a5230));h.position.y=1;g.add(h);const t=new T.Mesh(new T.CylinderGeometry(1.3,1.5,1,10),mat(0x4a5230));t.position.y=2.1;g.add(t);const br=new T.Mesh(new T.CylinderGeometry(.14,.14,4,6),mat(0x2a2a2a));br.rotation.x=PI/2;br.position.set(0,2.2,-2.4);g.add(br)}
    if(kind==='ship'){g.position.y=0;const h=new T.Mesh(new T.BoxGeometry(12,5,70),mat(0x6a7078));h.position.y=1.5;g.add(h);const bw=new T.Mesh(new T.ConeGeometry(6,16,4),mat(0x6a7078));bw.rotation.x=-PI/2;bw.rotation.y=PI/4;bw.scale.set(1,1,.6);bw.position.set(0,1.5,-43);g.add(bw);const s=new T.Mesh(new T.BoxGeometry(8,8,14),mat(0x8a9098));s.position.set(0,8,6);g.add(s);const st=new T.Mesh(new T.CylinderGeometry(1.6,1.8,7,10),mat(0x3a3a3a));st.position.set(0,14,10);g.add(st)}
    g.traverse(o=>{if(o.isMesh)o.castShadow=true});ground.push({kind,m:g,p:new V3(x,y+(kind==='ship'?5:2),z),hp:kind==='ship'?160:kind==='aa'?60:45,dead:false,t:rnd(0,2),r:kind==='ship'?36:8})};
  for(let i=0;i<4;i++)add('aa',rnd(-900,900),rnd(-1800,-600));for(let i=0;i<4;i++)add('tank',-600+i*40,-2600+i*55);for(let i=0;i<3;i++)add('ship',-3300-i*300,-1200+i*500)}
/* ---------------- combat ---------------- */
function fireGuns(a,dt){const D=a.D;const{fwd,up,right}=axes(a);let conv=a.p.clone().addScaledVector(fwd,380);if(a===P){let bt=null,ba=.09;for(const e of planes){if(e.team!==1||e.dead)continue;const d=e.p.distanceTo(a.p);if(d>1000)continue;const lp=e.p.clone().addScaledVector(e.v.clone().sub(a.v.clone().multiplyScalar(0)),d/850);const an=fwd.angleTo(lp.clone().sub(a.p));if(an<ba){ba=an;bt=lp}}if(bt)conv=bt}(D.guns||[]).forEach(([k,n],gi)=>{const G2=GUN[k];a['gt'+gi]=(a['gt'+gi]||0)-dt;while(a['gt'+gi]<=0){a['gt'+gi]+=1/G2.rof;const side=(a.gunAlt=(a.gunAlt+1)%Math.max(1,n));const off=k==='cannon'&&n<=2?(side?1:-1)*1.2:((side%2?1:-1)*(1.5+(side>>1)*.7));
    const mz=a.p.clone().addScaledVector(right,D.bomber?0:off*(D.mdl.span/11)).addScaledVector(fwd,1).addScaledVector(up,-.3);const dir=(D.bomber?fwd.clone():conv.clone().sub(mz).normalize());const sp2=G2.spr*(a.team===1?2.6:1);dir.x+=rnd(-1,1)*sp2;dir.y+=rnd(-1,1)*sp2;dir.z+=rnd(-1,1)*sp2;dir.normalize();
    bullets.push({p:mz,v:dir.multiplyScalar(G2.spd).add(a.v),life:2.2,team:a.team,dmg:G2.dmg*n/(D.guns.length>1?n:Math.max(1,n/2))/(n>2?2:1),col:G2.col,big:k==='cannon'});if(a===P)gunSnd(k,.32);else if(P&&!P.dead){const dd=a.p.distanceTo(P.p);if(dd<1200&&Math.random()<.5)gunSnd(k,.22*(1-dd/1200))}}})}
function gunnerFire(a,dt){a.gT=(a.gT||rnd(0,1))-dt;if(a.gT>0)return;const d=P.p.distanceTo(a.p);if(d>700||P.dead)return;a.gT=.12;if(Math.random()<.4)a.gT=rnd(.6,1.4);const lead=P.p.clone().addScaledVector(P.v,d/700);const dir=lead.sub(a.p).normalize();dir.x+=rnd(-.02,.02);dir.y+=rnd(-.02,.02);dir.z+=rnd(-.02,.02);dir.normalize();bullets.push({p:a.p.clone().add(new V3(0,2,0)),v:dir.multiplyScalar(700).add(a.v),life:1.4,team:1,dmg:2.5,col:0xff7050})}
function damage(a,dmg,byP){if(a.dead)return;if(a===P&&COMBAT){dmg*=.55;P.regen=0}a.hp-=dmg;if(byP){hitMark=.15;if(Math.random()<.5)beep(1800,.02,'square',.03)}if(a===P){hurtT=.3;shakeT=.2}
  if(a.hp<a.D.hp*.5&&!a.dmgDrag){a.dmgDrag=.01;if(Math.random()<.4)a.dmgRoll=rnd(-.15,.15)}if(a.hp<=0){a.dead=true;a.engineOut=true;a.ctl.thr=0;explode(a.p,a.D.bomber);if(a!==P){kills++;score+=a.D.bomber?250:100;msgKill=1.2}a.deadT=0}}
let hitMark=0,hurtT=0,shakeT=0,msgKill=0;
function stepBullets(dt){for(let i=bullets.length-1;i>=0;i--){const b=bullets[i];b.life-=dt;b.v.y-=G*dt*.5;const np=b.p.clone().addScaledVector(b.v,dt);let hit=false;
    for(const a of planes){if(a.dead||a.team===b.team)continue;const r=a.D.bomber?13:7.5;const ab=np.clone().sub(b.p),ap=a.p.clone().sub(b.p),t=clamp(ap.dot(ab)/ab.lengthSq(),0,1);if(b.p.clone().addScaledVector(ab,t).distanceToSquared(a.p)<r*r){damage(a,b.dmg,b.team===0);hit=true;if(Math.random()<.3)puff(np,0x333333,3,.6);break}}
    if(!hit&&b.team===0)for(const g of ground){if(g.dead)continue;if(np.distanceTo(g.p)<g.r){hitGround(g,b.dmg*.6);hit=true;break}}
    if(!hit&&np.y<gndH(np.x,np.z)){hit=true;if(np.distanceTo(camera.position)<1500)puff(np.setY(gndH(np.x,np.z)+1),tH(np.x,np.z)<0?0xffffff:0x8a7a5a,4,.8,new V3(0,4,0))}
    if(!hit&&b.team===1&&P&&!P.dead&&!b.wz&&np.distanceTo(P.p)<25){b.wz=1;sweep(2400,700,.14,'sine',.05)}if(hit||b.life<=0){bullets.splice(i,1);continue}b.p.copy(np)}}
function hitGround(g,dmg){if(g.dead)return;g.hp-=dmg;hitMark=.15;if(g.hp<=0){g.dead=true;score+=150;kills++;explode(g.p,true);g.m.traverse(o=>{if(o.isMesh)o.material=new T.MeshStandardMaterial({color:0x1a1a1a,roughness:1})});msgKill=1.2;if(ground.every(q=>q.dead))win()}}
function dropBomb(){if(!P||P.dead||P.bombs<=0)return;P.bombs--;const m=new T.Mesh(new T.CapsuleGeometry?new T.CylinderGeometry(.25,.25,1.8,8):new T.CylinderGeometry(.25,.25,1.8,8),new T.MeshStandardMaterial({color:lin(0x3a3a2a)}));m.rotation.x=PI/2;m.position.copy(P.p).add(new V3(0,-1.5,0));scene.add(m);bombsA.push({m,v:P.v.clone()});sweep(400,120,.4,'sine',.06)}
function stepBombs(dt){for(let i=bombsA.length-1;i>=0;i--){const b=bombsA[i];b.v.y-=G*dt;b.m.position.addScaledVector(b.v,dt);b.m.lookAt(b.m.position.clone().add(b.v));const p=b.m.position;if(p.y<=gndH(p.x,p.z)+1){explode(p,true);for(const g of ground)if(!g.dead&&g.p.distanceTo(p)<g.r+28)hitGround(g,200);scene.remove(b.m);bombsA.splice(i,1)}}}
function aiStep(a,dt){const ai=a.ai;ai.t+=dt;const{fwd}=axes(a);let tgt;const agl=a.p.y-gndH(a.p.x,a.p.z);
  if(a.D.bomber){tgt=new V3(RWY.x,1500,0);if(a.p.distanceTo(new V3(RWY.x,a.p.y,0))<500&&!a.bombed){a.bombed=true;bombersThrough++;msg('A bomber hit the airfield!',bombersThrough+' of 3 allowed');explode(new V3(RWY.x+rnd(-100,100),RWY.y,rnd(-500,500)),true)}if(a.bombed)tgt=a.p.clone().addScaledVector(fwd,1000);gunnerFire(a,dt)}
  else if(P.dead){tgt=a.p.clone().addScaledVector(fwd,500).add(new V3(0,50,0))}
  else{const toP=P.p.clone().sub(a.p),d=toP.length();const pf=axes(P).fwd;const behind=pf.dot(toP.clone().normalize())>.7&&d<600;// player is chasing me
    if(ai.mode==='attack'&&behind&&Math.random()<dt*.8){ai.mode='evade';ai.evT=rnd(2,4);ai.ev=new V3(rnd(-1,1),rnd(-.4,.6),rnd(-1,1)).normalize()}
    if(ai.mode==='evade'){ai.evT-=dt;tgt=a.p.clone().addScaledVector(ai.ev,600);if(ai.evT<=0)ai.mode='attack'}
    else{const t2=d/850;tgt=P.p.clone().addScaledVector(P.v,t2);if(d>1800)tgt.add(ai.off.clone().multiplyScalar(300));if(d<120)tgt=a.p.clone().addScaledVector(fwd,400).add(ai.off.clone().multiplyScalar(200));
      const ang=fwd.angleTo(tgt.clone().sub(a.p));if(ang<.05&&d<650)fireGuns(a,dt)}}
  if(agl<250||a.p.y+a.v.y*4<gndH(a.p.x+a.v.x*4,a.p.z+a.v.z*4)+200){tgt=a.p.clone().addScaledVector(fwd,300).setY(a.p.y+400)}
  a.wantDir=tgt.clone().sub(a.p).normalize();a.ctl.thr=1}
function arcadeFly(a,dt,dir,turnMul){const D=a.D;const{fwd,up}=axes(a);if(a.spd==null)a.spd=a.v.length()||150;const agl=a.p.y-gndH(a.p.x,a.p.z);const want=(dir||fwd).clone();
  if(agl<160&&want.y<.25)want.y=lerp(.25,want.y,clamp((agl-50)/110,0,1));if(a.p.y>4200&&want.y>0)want.y*=.2;want.normalize();
  const rate=(D.rr*.5+D.pr*.45)*(turnMul||1)*clamp(a.spd/(D.vmax*.5),.55,1.15);const ang=fwd.angleTo(want);const k=ang>1e-4?Math.min(1,rate*dt/ang):1;
  const qs=new Q().slerp(new Q().setFromUnitVectors(fwd,want),k);const nf=fwd.clone().applyQuaternion(qs).normalize();
  const rt=new V3().crossVectors(nf,new V3(0,1,0));if(rt.lengthSq()<1e-4)rt.set(1,0,0).applyQuaternion(a.q);rt.normalize();
  const turn=want.clone().sub(nf).dot(rt);a.bank=lerp(a.bank||0,clamp(turn*5+(a.rollIn||0)*1.4,-1.35,1.35),Math.min(1,dt*3.2));
  let lu=new V3(0,1,0).addScaledVector(nf,-nf.y);if(lu.lengthSq()<.004)lu=up.clone().addScaledVector(nf,-up.dot(nf));lu.normalize().applyAxisAngle(nf,a.bank);
  a.q.setFromRotationMatrix(new T.Matrix4().lookAt(new V3(),nf,lu));a.thr+=(a.ctl.thr-a.thr)*Math.min(1,dt*1.5);
  a.spd+=((D.vmax*(.5+.42*a.thr))-a.spd)*dt*.45-G*nf.y*dt*.8;a.spd=clamp(a.spd,70,D.vmax*1.25);a.v.copy(nf).multiplyScalar(a.spd);a.p.addScaledVector(a.v,dt);a.ias=a.spd;a.stall=false;a.aoa=0;a.g=1+Math.abs(turn)*3;a.onGround=false}
function steer(a,tgt,dt,noLevel){const{right}=axes(a);const dl=tgt.clone().sub(a.p).normalize().applyQuaternion(a.q.clone().invert());const off=Math.acos(clamp(-dl.z,-1,1));let phi=Math.atan2(dl.x,dl.y);if(off<.35&&Math.abs(phi)>PI/2)phi-=Math.sign(phi)*PI;
  const lvl=clamp(right.y*2.2,-1,1);const w=sstep(.03,.25,off);a.ctl.roll=clamp(phi*2.4*w+lvl*(1-w),-1,1);a.ctl.pitch=clamp(Math.atan2(dl.y,Math.max(.05,-dl.z))*5,-1,1)*(Math.abs(phi)<1.2||off<.35?1:.3);if(-dl.z<0&&Math.abs(phi)<1.2)a.ctl.pitch=1;a.ctl.yaw=clamp(Math.atan2(dl.x,-dl.z)*3,-1,1)}
let bombersThrough=0;
function win(){if(resultShown)return;resultShown=true;const b=S.get(cfg.id+'_best',0);const fs=score+Math.max(0,Math.round(600-timeT))*(COMBAT?1:0);if(fs>b)S.set(cfg.id+'_best',fs);c.best(Math.max(fs,b));setTimeout(()=>result(true,fs),1500)}
function fail(why){if(resultShown)return;resultShown=true;setTimeout(()=>result(false,score,why),1800)}
function result(ok,fs,why){state='result';if(document.pointerLockElement)document.exitPointerLock();ov.classList.add('on');ov.innerHTML='';const card=el('div',{class:'fl-card'});ov.append(card);
  card.append(el('h2',null,ok?'MISSION ':'MISSION ',el('span',null,ok?'COMPLETE':'FAILED')),el('p',null,why||(COMBAT?kills+' kills · score '+fs:mission.n+' complete · '+(fs?'score '+fs:''))));if(ok&&!COMBAT&&landGrade)card.append(el('p',null,landGrade));
  const a=el('button',{type:'button',class:'fl-go'},'Fly again');a.onclick=e=>{e.stopPropagation();start()};const m=el('button',{type:'button',class:'fl-sm'},'Menu');m.onclick=e=>{e.stopPropagation();menu()};card.append(a,m)}
let landGrade='';
function crash(a,water){if(a.dead&&a.crashed)return;a.crashed=true;a.dead=true;a.v.set(0,0,0);explode(a.p.clone().setY(gndH(a.p.x,a.p.z)+2),true);if(water)for(let i=0;i<12;i++)puff(a.p.clone().setY(1),0xffffff,rnd(6,14),rnd(1,2),new V3(rnd(-6,6),rnd(8,20),rnd(-6,6)),1.5);a.mdl.visible=false;
  if(a===P){msg(water?'SPLASHDOWN':'CRASHED',a.touch&&a.touch.vs>4?'Sink rate '+(a.touch.vs*196.85|0)+' ft/min: too hard':'');fail(water?'You went into the water.':'You crashed.')}else if(a.team===1&&!a.deadCounted){a.deadCounted=true}}
/* ---------------- controls ---------------- */
c.on(document,'keydown',e=>{const k=e.key.toLowerCase();if(state!=='play'){if(k==='escape'&&state==='paused')start();return}if(k==='escape'){state='paused';menu();state='paused';return}if(!P)return;
  if(k==='g'&&!P.D.fixed&&!COMBAT){P.gear=P.gear?0:1;beep(300,.15,'triangle',.05)}if(k==='f'&&!COMBAT){P.flaps=(P.flaps+.5)>1?0:P.flaps+.5;beep(500,.08,'triangle',.05)}if(k==='c'||k==='v')camMode=(camMode+1)%(COMBAT?2:3);if(k==='b'&&COMBAT)dropBomb()});
c.on(renderer.domElement,'mousedown',e=>{if(e.button===2&&COMBAT&&state==='play')dropBomb()});
let prevJ=false,prevAltB=false,aimTouch=false;
/* ---------------- main loop ---------------- */
const tmpV=new V3();
st3.onFrame((dt0)=>{const now=performance.now()/1000;wU.t.value=now;sky.position.copy(camera.position);
  if(msgT>0){msgT-=dt0;if(msgT<=0)msgE.classList.remove('on')}
  const W2=wrap.clientWidth,H2=wrap.clientHeight,dpr=Math.min(2,window.devicePixelRatio||1);if(cv.width!==Math.round(W2*dpr)||cv.height!==Math.round(H2*dpr)){cv.width=Math.round(W2*dpr);cv.height=Math.round(H2*dpr)}cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,W2,H2);
  if(state==='menu'||state==='paused'||!P){if(P)updCam(dt0);else{camera.position.set(200,300,2200);camera.lookAt(0,100,0)}engineSet(0,0,false);input.mdx=input.mdy=0;return}
  const dt=Math.min(dt0,.05);timeT+=dt;const k=input.keys,D=P.D;
  if(!P.dead){// controls
    const thrUp=k.shift||k['+']||k['=']||(!COMBAT&&input.fire),thrDn=k.control||k['-']||k._||(!COMBAT&&input.alt);if(COMBAT){if(k.w)P.ctl.thr=Math.min(1.1,P.ctl.thr+dt*.6);if(k.s)P.ctl.thr=Math.max(.2,P.ctl.thr-dt*.6)}if(thrUp)P.ctl.thr=Math.min(1,P.ctl.thr+dt*.5);if(thrDn)P.ctl.thr=Math.max(0,P.ctl.thr-dt*.5);
    if(COMBAT){aim.yaw-=input.mdx*.0017;aim.pitch=clamp(aim.pitch-input.mdy*.0017,-1.45,1.45);{const ky=(k.a||k.arrowleft?1:0)-(k.d||k.arrowright?1:0),kp=(k.arrowup?1:0)-(k.arrowdown?1:0);if(ky||kp){aim.yaw+=ky*dt*1.1;aim.pitch=clamp(aim.pitch+kp*dt*.9,-1.45,1.45)}}if(input.touch&&(input.joy.x||input.joy.y)){aim.yaw-=input.joy.x*dt*1.4;aim.pitch=clamp(aim.pitch-input.joy.y*dt*1.1,-1.45,1.45)}
      const ad=new V3(0,0,-1).applyEuler(_e.set(aim.pitch,aim.yaw,0,'YXZ'));P.wantDir=ad;P.rollIn=(k.e?1:0)-(k.q?1:0);
      if(input.down||input.fire||k[' '])fireGuns(P,dt);if(input.jumpBtn&&!prevJ)camMode=(camMode+1)%2;if(input.alt&&!prevAltB)dropBomb();prevAltB=input.alt}
    else{const inv=OPT.invert?-1:1;const pk=((k.s||k.arrowdown?1:0)-(k.w||k.arrowup?1:0))*inv,rk=(k.d||k.arrowright?1:0)-(k.a||k.arrowleft?1:0),yk=(k.e?1:0)-(k.q?1:0);
      const jp=input.touch?input.joy.y*inv:0,jr=input.touch?input.joy.x:0;P.ctl.pitch+=((pk-jp)-P.ctl.pitch)*Math.min(1,dt*6);P.ctl.roll+=((rk+jr)-P.ctl.roll)*Math.min(1,dt*6);P.ctl.yaw+=(yk-P.ctl.yaw)*Math.min(1,dt*6);P.brake=k.b?1:0;
      if(input.jumpBtn&&!prevJ&&!D.fixed)P.gear=P.gear?0:1}prevJ=input.jumpBtn}
  input.mdx=input.mdy=0;
  // turbulence
  let turb=null;if(mission.id==='storm'){turbV.lerp(new V3(rnd(-4,4),rnd(-5,5),rnd(-4,4)),dt*2);turb=turbV;if(Math.random()<dt*.08){flashT=.25;setTimeout(()=>noise(2,'lowpass',200,.4),rnd(300,1500))}}
  else if(P.p.y-gndH(P.p.x,P.p.z)<300&&P.ias>20){turbV.lerp(new V3(rnd(-1,1),rnd(-1,1),rnd(-1,1)),dt*2);turb=turbV}
  // physics for all
  for(const a of planes){if(a.crashed)continue;if(a.dead&&a!==P){a.deadT+=dt;a.ctl.pitch=-.3;a.ctl.roll=.6}if(a.ai&&!a.dead)aiStep(a,dt);if(COMBAT&&!a.dead){arcadeFly(a,dt,a.wantDir,a===P?1:(a.D.bomber?.6:.82));if(a.p.y<gndH(a.p.x,a.p.z)+3)crash(a,tH(a.p.x,a.p.z)<0);if(a===P){P.regen=(P.regen||0)+dt;if(P.regen>6&&P.hp<P.D.hp)P.hp=Math.min(P.D.hp,P.hp+dt*3)}}else{const n=2;for(let s=0;s<n;s++){stepFlight(a,dt/n,a===P?turb:null);if(a===P||a.dead)groundCheck(a,dt/n,crash);else if(a.p.y<gndH(a.p.x,a.p.z)+3)crash(a,tH(a.p.x,a.p.z)<0)}}
    a.mdl.position.copy(a.p);a.mdl.quaternion.copy(a.q);a.gearT+=((a.gear?1:0)-a.gearT)*Math.min(1,dt*1.2);const gr=a.mdl.userData.gear;gr.scale.y=Math.max(.01,a.gearT);gr.visible=a.gearT>.05;
    const pr=a.mdl.userData.prop;if(pr&&pr.children.length){a.prop+=dt*(a.engineOut?a.ias*.2:10+a.thr*60);pr.rotation.z=a.prop;const fast=!a.engineOut&&a.thr>.15;pr.children.forEach(ch=>{if(ch!==pr.userData.disc&&ch.type==='Group')ch.visible=!fast});pr.userData.disc.material.opacity=fast?.22:0}
    if(a.mdl.userData.ex)a.mdl.userData.ex.material.opacity=a.thr*.9;
    if((a.dead||a.hp<a.D.hp*.5)&&!a.crashed){a.smoke-=dt;if(a.smoke<=0){a.smoke=a.dead?.03:.08;const {fwd}=axes(a);puff(a.p.clone().addScaledVector(fwd,-a.D.mdl.len*.4),a.dead||a.hp<a.D.hp*.25?(Math.random()<.4?0xff8a2a:0x2a2a2a):0x555555,a.dead?6:4,a.dead?3:2,new V3(0,2,0),2,.7)}}}
  // cleanup dead enemies
  for(let i=planes.length-1;i>=0;i--){const a=planes[i];if(a!==P&&a.dead&&(a.crashed||a.deadT>12)){scene.remove(a.mdl);planes.splice(i,1)}}
  if(COMBAT){stepBullets(dt);stepBombs(dt);
    for(const g of ground){if(g.dead){g.t-=dt;if(g.t<=0){g.t=.25;puff(g.p.clone().add(new V3(rnd(-2,2),4,rnd(-2,2))),0x222222,10,4,new V3(rnd(-1,1),8,rnd(-1,1)),1.2,.6)}continue}
      if(g.kind==='tank'){g.m.position.z-=dt*4;g.p.z=g.m.position.z;g.m.position.y=gndH(g.m.position.x,g.m.position.z);g.p.y=g.m.position.y+2}
      if((g.kind==='aa'||g.kind==='ship')&&!P.dead){g.t-=dt;const d=g.p.distanceTo(P.p);if(g.t<=0&&d<2200&&P.p.y>80){g.t=rnd(.8,1.6);const err=d*.035;const fp=P.p.clone().addScaledVector(P.v,d/600).add(new V3(rnd(-err,err),rnd(-err,err),rnd(-err,err)));setTimeout(()=>{if(state!=='play')return;puff(fp,0x2a2a2a,14,3,new V3(0,1,0),1.5,.9);puff(fp,0xff9a3a,6,.25,null,3,1);if(fp.distanceTo(P.p)<45)damage(P,8);if(fp.distanceTo(camera.position)<900)noise(.3,'lowpass',400,.15)},d/600*1000)}}}
    const alive=planes.filter(a=>a.team===1&&!a.dead).length;if(!resultShown&&!P.dead&&alive===0&&mission.id!=='strike')nextWave();if(mission.id==='intercept'&&bombersThrough>=3)fail('Too many bombers got through.');
    if(P.dead&&!resultShown){msg('SHOT DOWN','');fail('You were shot down. '+kills+' kills, score '+score+'.');const b=S.get(cfg.id+'_best',0);if(score>b)S.set(cfg.id+'_best',score);c.best(Math.max(score,b))}}
  else{// sim missions
    if(rings.length&&!P.dead){const r=rings[ringI];if(r){r.m.material.color.set(0xffc02a);const rel=P.p.clone().sub(r.p);const dn=rel.dot(r.n);if(Math.abs(dn)<25&&rel.length()<r.r){r.done=true;r.m.material.color.set(0x3aff7a);beep(880,.1,'triangle',.08);ringI++;if(ringI>=rings.length){score=Math.max(100,Math.round(3000-timeT*10));msg('Course complete!',timeT.toFixed(1)+' s');win()}}
      rings.forEach((q,i)=>{q.m.visible=i>=ringI&&i<ringI+4;q.m.material.opacity=1})}}
    if(P.onGround&&!P.dead&&P.touch&&!P.touch.graded&&(mission.id==='land'||mission.id==='storm'||mission.id==='island'||(mission.id==='free'&&timeT>30))){const t=P.touch;t.graded=true;const fpm=t.vs*196.85,cl=Math.abs(t.x-(mission.id==='island'?ISL.x:RWY.x));landGrade='Touchdown '+Math.round(fpm)+' ft/min · '+cl.toFixed(1)+' m off centreline · '+(fpm<150?'Butter! ★★★':fpm<300?'Smooth ★★':fpm<500?'Firm ★':'Hard landing');msg(fpm<150?'BUTTER!':fpm<300?'Smooth landing':'Landed',Math.round(fpm)+' ft/min',3);score=Math.max(0,Math.round(1000-fpm-cl*10))}
    if(P.onGround&&P.touch&&P.touch.graded&&P.ias<3&&!resultShown){if(mission.id==='island'&&Math.hypot(P.p.x-ISL.x,P.p.z-ISL.z)>420){}else{win()}}}
  // PAPI
  {const dz=P.p.z-(RWY.z0-300),ang=Math.atan2(P.p.y-RWY.y,Math.max(1,dz))*180/PI;PAPI.forEach((m,i)=>m.material.color.set(dz>0&&ang>[2.5,2.83,3.17,3.5][3-i]?0xffffff:0xff2a2a))}
  stepPuffs(dt);updTracers();updCam(dt);if(rain){rain.position.copy(camera.position);rain.rotation.y+=dt*.3}
  const sd=sun.userData.dir;sun.position.copy(P.p).addScaledVector(sd,200);sun.target.position.copy(P.p);
  engineSet(P.dead?0:P.thr,P.ias||0,!!D.jet);hitMark=Math.max(0,hitMark-dt);hurtT=Math.max(0,hurtT-dt);msgKill=Math.max(0,msgKill-dt);flashT=Math.max(0,flashT-dt);
  drawHUD(W2,H2)});
function updTracers(){const pos=trGeo.attributes.position,col=trGeo.attributes.color,cc=new T.Color();let n=0;for(const b of bullets){if(n>=TRN)break;const d=b.v.clone().normalize();const L=b.big?22:14;pos.setXYZ(n*2,b.p.x,b.p.y,b.p.z);pos.setXYZ(n*2+1,b.p.x-d.x*L,b.p.y-d.y*L,b.p.z-d.z*L);cc.set(b.col);col.setXYZ(n*2,cc.r,cc.g,cc.b);col.setXYZ(n*2+1,cc.r*.3,cc.g*.3,cc.b*.3);n++}
  for(let i=n;i<TRN;i++){pos.setXYZ(i*2,0,-9999,0);pos.setXYZ(i*2+1,0,-9999,0)}pos.needsUpdate=true;col.needsUpdate=true}
const camPos=new V3(0,200,0);let camInit=false;
function updCam(dt){if(!P)return;const{fwd,up}=axes(P);let tp;
  if(COMBAT){const ad=new V3(0,0,-1).applyEuler(_e.set(aim.pitch,aim.yaw,0,'YXZ'));if(camMode===1){camera.position.copy(P.p).addScaledVector(up,1.1).addScaledVector(fwd,-.5);camera.quaternion.copy(P.q);P.mdl.visible=false}else{P.mdl.visible=!P.crashed;tp=P.p.clone().addScaledVector(ad,-P.D.mdl.len*2.4-8).add(new V3(0,P.D.mdl.len*.45+2,0));camera.position.copy(tp);camera.lookAt(P.p.clone().addScaledVector(ad,200))}}
  else{if(input.mdx||input.mdy){}camYaw-=input.mdx*.004;camPitch=clamp(camPitch-input.mdy*.004,-1,1.2);if(!input.down){camYaw*=1-Math.min(1,dt*1.5);camPitch*=1-Math.min(1,dt*1.5)}
    if(camMode===1){P.mdl.visible=true;camera.position.copy(P.p).addScaledVector(up,P.D.mdl.r*.95).addScaledVector(fwd,P.D.mdl.canZ!=null?-P.D.mdl.canZ*-1+P.D.mdl.canZ*0:0).addScaledVector(fwd,-(P.D.mdl.canZ||0)*-1);camera.position.copy(P.p).addScaledVector(up,P.D.mdl.r*.8).addScaledVector(fwd,-(P.D.mdl.canZ!=null?P.D.mdl.canZ:-1)*-1);const q2=P.q.clone().multiply(new Q().setFromEuler(_e.set(camPitch-.08,camYaw,0,'YXZ')));camera.quaternion.copy(q2)}
    else{P.mdl.visible=!P.crashed;const dist=P.D.mdl.len*1.9+6,yawQ=new Q().setFromAxisAngle(new V3(0,1,0),camYaw+(camMode===2?PI*.5:0));const hf=fwd.clone().setY(0);if(hf.lengthSq()<.01)hf.set(0,0,-1);hf.normalize().applyQuaternion(yawQ);
      tp=P.p.clone().addScaledVector(hf,-dist*Math.cos(camPitch*.8)).add(new V3(0,dist*.28+Math.sin(camPitch)*dist,0));if(!camInit){camPos.copy(tp);camInit=true}camPos.lerp(tp,Math.min(1,dt*(camMode===2?2:5)));const gy=gndH(camPos.x,camPos.z)+1.5;if(camPos.y<gy)camPos.y=gy;camera.position.copy(camPos);camera.lookAt(P.p.clone().addScaledVector(fwd,8))}}
  if(shakeT>0){camera.position.x+=rnd(-.3,.3);camera.position.y+=rnd(-.3,.3);shakeT-=dt}}
/* ---------------- HUD drawing ---------------- */
const proj=(p,W,H)=>{const v=p.clone().project(camera);return{x:(v.x+1)/2*W,y:(1-v.y)/2*H,ok:v.z<1&&v.z>-1}};
function txt(t,x,y,sz,col,al){cx.font='800 '+(sz||13)+'px system-ui,sans-serif';cx.fillStyle=col||'#fff';cx.textAlign=al||'left';cx.shadowColor='rgba(0,0,0,.7)';cx.shadowBlur=4;cx.fillText(t,x,y);cx.shadowBlur=0}
function drawHUD(W,H){const D=P.D,{fwd}=axes(P);_e.setFromQuaternion(P.q,'YXZ');const pitch=_e.x,roll=_e.z,hdg=((-_e.y*180/PI)%360+360)%360;const kt=(P.ias||0)*1.944,alt=P.p.y*3.281,vs=P.v.y*196.85;const small=W<640;
  if(flashT>0){cx.fillStyle='rgba(255,255,255,'+flashT*2.5+')';cx.fillRect(0,0,W,H)}if(hurtT>0){cx.fillStyle='rgba(200,20,10,'+hurtT*.8+')';cx.fillRect(0,0,W,H)}
  if(COMBAT){// boresight
    const bp=proj(P.p.clone().addScaledVector(fwd,400),W,H);if(bp.ok){cx.strokeStyle='rgba(255,255,255,.9)';cx.lineWidth=2;cx.beginPath();cx.arc(bp.x,bp.y,9,0,7);cx.moveTo(bp.x-18,bp.y);cx.lineTo(bp.x-9,bp.y);cx.moveTo(bp.x+9,bp.y);cx.lineTo(bp.x+18,bp.y);cx.stroke()}
    const ad=new V3(0,0,-1).applyEuler(_e.set(aim.pitch,aim.yaw,0,'YXZ'));const ap=proj(camera.position.clone().addScaledVector(ad,1000),W,H);if(ap.ok){cx.strokeStyle='rgba(255,210,80,.8)';cx.lineWidth=1.5;cx.beginPath();cx.arc(ap.x,ap.y,5,0,7);cx.stroke()}
    let best=null,bd=1e9;for(const a of planes){if(a.team!==1||a.dead)continue;const d=a.p.distanceTo(P.p);const p2=proj(a.p,W,H),inF=p2.ok&&p2.x>0&&p2.x<W&&p2.y>0&&p2.y<H;
      if(inF){const s=clamp(1400/d,6,26);cx.strokeStyle=a.D.bomber?'#ff9a3a':'#ff4a3a';cx.lineWidth=2;cx.strokeRect(p2.x-s,p2.y-s,s*2,s*2);txt((d/1000).toFixed(1)+'km',p2.x,p2.y-s-4,11,'#ff8a7a','center');if(a.hp<a.D.hp){cx.fillStyle='rgba(0,0,0,.5)';cx.fillRect(p2.x-s,p2.y+s+3,s*2,3);cx.fillStyle='#ff4a3a';cx.fillRect(p2.x-s,p2.y+s+3,s*2*a.hp/a.D.hp,3)}
        const ang=fwd.angleTo(a.p.clone().sub(P.p));if(ang<.5&&d<bd){bd=d;best=a}}
      else{const rel=a.p.clone().sub(camera.position).applyQuaternion(camera.quaternion.clone().invert());const an=Math.atan2(-rel.y,rel.x);const r2=Math.min(W,H)*.42;const ex=W/2+Math.cos(an)*r2,ey=H/2+Math.sin(an)*r2;cx.save();cx.translate(ex,ey);cx.rotate(an);cx.fillStyle=a.D.bomber?'#ff9a3a':'#ff4a3a';cx.beginPath();cx.moveTo(10,0);cx.lineTo(-6,-7);cx.lineTo(-6,7);cx.fill();cx.restore()}}
    if(best){let t=bd/800;const lp=best.p.clone().addScaledVector(best.v.clone().sub(P.v.clone().multiplyScalar(0)),t);t=lp.distanceTo(P.p)/820;const lp2=best.p.clone().addScaledVector(best.v,t).addScaledVector(new V3(0,-G*.5,0),t*t*.5);const q2=proj(lp2,W,H);if(q2.ok){cx.strokeStyle='#ffffff';cx.lineWidth=2;cx.beginPath();cx.arc(q2.x,q2.y,7,0,7);cx.stroke();cx.fillStyle='#fff';cx.beginPath();cx.arc(q2.x,q2.y,2,0,7);cx.fill()}}
    for(const g of ground){if(g.dead)continue;const p2=proj(g.p,W,H);if(p2.ok&&p2.x>0&&p2.x<W&&p2.y>0&&p2.y<H){cx.strokeStyle='#ffb02e';cx.lineWidth=2;cx.beginPath();cx.moveTo(p2.x,p2.y-10);cx.lineTo(p2.x+8,p2.y);cx.lineTo(p2.x,p2.y+10);cx.lineTo(p2.x-8,p2.y);cx.closePath();cx.stroke();txt(g.kind.toUpperCase(),p2.x,p2.y-14,10,'#ffcf7a','center')}}
    if(P.bombs>0){// bomb impact prediction
      let bp2=P.p.clone(),bv=P.v.clone();for(let i=0;i<300;i++){bv.y-=G*.05;bp2.addScaledVector(bv,.05);if(bp2.y<=gndH(bp2.x,bp2.z))break}const q3=proj(bp2,W,H);if(q3.ok){cx.strokeStyle='rgba(255,176,46,.9)';cx.lineWidth=2;cx.beginPath();cx.moveTo(q3.x-10,q3.y);cx.lineTo(q3.x+10,q3.y);cx.moveTo(q3.x,q3.y-10);cx.lineTo(q3.x,q3.y+10);cx.stroke()}}
    if(hitMark>0){cx.strokeStyle='#fff';cx.lineWidth=2;const c2=W/2,c3=H/2;const b2=bp.ok?bp:{x:c2,y:c3};cx.beginPath();[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{cx.moveTo(b2.x+a*6,b2.y+b*6);cx.lineTo(b2.x+a*13,b2.y+b*13)});cx.stroke()}
    // status
    const x0=14,y0=H-(small?90:104);cx.fillStyle='rgba(0,0,0,.4)';cx.fillRect(x0-6,y0-18,small?150:190,small?82:96);txt('HP',x0,y0,12,'#ccc');cx.fillStyle='rgba(255,255,255,.2)';cx.fillRect(x0+28,y0-10,small?100:140,9);cx.fillStyle=P.hp>P.D.hp*.5?'#5fdc7a':P.hp>P.D.hp*.25?'#ffc02a':'#ff4a3a';cx.fillRect(x0+28,y0-10,(small?100:140)*Math.max(0,P.hp)/P.D.hp,9);
    txt(Math.round(kt*1.852)+' km/h',x0,y0+20,15);txt(Math.round(P.p.y)+' m',x0+(small?78:100),y0+20,15);txt('THR '+Math.round(P.thr*100)+'%'+(P.thr>1?' WEP':''),x0,y0+40,12,'#ccc');if(P.D.bombs)txt('BOMBS '+P.bombs,x0+(small?78:100),y0+40,12,'#ffcf7a');txt('SCORE '+score+' · KILLS '+kills,x0,y0+58,12,'#ffcf7a');
    if(msgKill>0)txt('+ KILL',W/2,H*.62,22,'#ffcf7a','center');
    if(mission.id==='intercept')txt('Bombers through: '+bombersThrough+'/3',W-14,24,13,'#ff9a7a','right');
    if(P.p.y-gndH(P.p.x,P.p.z)<200&&P.v.y<-15&&!P.dead)txt('PULL UP!',W/2,H*.35,26,'#ff4a3a','center')}
  else{// sim instruments
    const s=small?.72:1,R=46*s,cy=H-R-16,ax=W/2;
    // attitude indicator
    cx.save();cx.translate(ax,cy);cx.beginPath();cx.arc(0,0,R,0,7);cx.clip();cx.rotate(-roll);const po=pitch*R*1.8;cx.fillStyle='#3a86d8';cx.fillRect(-R*2,-R*3+po,R*4,R*3);cx.fillStyle='#8a5a2a';cx.fillRect(-R*2,po,R*4,R*3);cx.strokeStyle='#fff';cx.lineWidth=1.5;cx.beginPath();cx.moveTo(-R*2,po);cx.lineTo(R*2,po);cx.stroke();
    for(let d=-30;d<=30;d+=10){if(!d)continue;const y=po-d*PI/180*R*1.8;cx.beginPath();cx.moveTo(-R*.25,y);cx.lineTo(R*.25,y);cx.stroke()}cx.restore();
    cx.strokeStyle='#ffc02a';cx.lineWidth=3;cx.beginPath();cx.moveTo(ax-R*.6,cy);cx.lineTo(ax-R*.2,cy);cx.lineTo(ax-R*.1,cy+R*.1);cx.moveTo(ax+R*.6,cy);cx.lineTo(ax+R*.2,cy);cx.lineTo(ax+R*.1,cy+R*.1);cx.stroke();cx.strokeStyle='rgba(255,255,255,.7)';cx.lineWidth=2;cx.beginPath();cx.arc(ax,cy,R,0,7);cx.stroke();
    // speed & altitude boxes
    const box=(x,lbl,val,sub,col)=>{cx.fillStyle='rgba(0,0,0,.5)';cx.fillRect(x-44*s,cy-34*s,88*s,68*s);txt(lbl,x,cy-18*s,10*s+1,'#aaa','center');txt(val,x,cy+6*s,22*s,col||'#fff','center');txt(sub,x,cy+26*s,10*s+1,'#aaa','center')};
    box(ax-R-60*s,'AIRSPEED',Math.round(kt)+'','KT',P.stall&&!P.onGround?'#ff4a3a':'#fff');box(ax+R+60*s,'ALTITUDE',Math.round(alt)+'','FT');
    if(!small){box(ax-R-160*s,'VERT SPD',(vs>0?'+':'')+Math.round(vs/10)*10,'FT/MIN',vs<-900&&P.p.y-gndH(P.p.x,P.p.z)<150?'#ff4a3a':'#fff');box(ax+R+160*s,'HEADING',String(Math.round(hdg)).padStart(3,'0')+'°','THR '+Math.round(P.thr*100)+'%')}
    const sx=14;cx.fillStyle='rgba(0,0,0,.45)';cx.fillRect(8,H-96,small?118:148,88);txt('THROTTLE '+Math.round(P.thr*100)+'%',sx,H-78,12);cx.fillStyle='rgba(255,255,255,.2)';cx.fillRect(sx,H-72,small?100:130,6);cx.fillStyle='#5ec8ff';cx.fillRect(sx,H-72,(small?100:130)*P.thr,6);
    txt('FLAPS '+(P.flaps===0?'UP':P.flaps===.5?'1':'FULL'),sx,H-50,12,'#ccc');txt('GEAR '+(D.fixed?'FIXED':P.gear?'DOWN':'UP'),sx,H-32,12,P.gear||D.fixed?'#5fdc7a':'#ffc02a');txt((P.brake?'BRAKES ':'')+'G '+P.g.toFixed(1),sx,H-14,12,'#ccc');
    if(P.stall&&!P.onGround){txt('STALL',W/2,H*.3,30,'#ff4a3a','center');if(Math.random()<.1)beep(900,.08,'square',.03)}
    const agl=P.p.y-gndH(P.p.x,P.p.z)-D.gh;if(!P.onGround&&agl<60&&P.v.y<-1)txt(Math.round(agl*3.28)+' ft',W/2,H*.4,20,'#fff','center');if(!P.gear&&!D.fixed&&agl<120&&!P.onGround)txt('GEAR UP!',W/2,H*.45,20,'#ffc02a','center');
    // objective marker
    let obj=null;if(rings[ringI])obj=rings[ringI].p;else if(mission.id==='island')obj=new V3(ISL.x,ISL.y+5,ISL.z+350);else if(mission.id==='land'||mission.id==='storm')obj=new V3(RWY.x,RWY.y,RWY.z0);
    if(obj){const p2=proj(obj,W,H),d=obj.distanceTo(P.p);if(p2.ok&&p2.x>0&&p2.x<W&&p2.y>0&&p2.y<H){cx.strokeStyle='#ffc02a';cx.lineWidth=2;cx.beginPath();cx.moveTo(p2.x,p2.y-12);cx.lineTo(p2.x+10,p2.y);cx.lineTo(p2.x,p2.y+12);cx.lineTo(p2.x-10,p2.y);cx.closePath();cx.stroke();txt((d/1000).toFixed(1)+' km',p2.x,p2.y-16,11,'#ffcf7a','center')}
      else{const rel=obj.clone().sub(camera.position).applyQuaternion(camera.quaternion.clone().invert());const an=Math.atan2(-rel.y,rel.x),r2=Math.min(W,H)*.4;cx.save();cx.translate(W/2+Math.cos(an)*r2,H/2+Math.sin(an)*r2);cx.rotate(an);cx.fillStyle='#ffc02a';cx.beginPath();cx.moveTo(12,0);cx.lineTo(-6,-8);cx.lineTo(-6,8);cx.fill();cx.restore()}}
    if(rings.length)txt('RING '+Math.min(ringI+1,rings.length)+'/'+rings.length+' · '+timeT.toFixed(1)+'s',W-14,H-16,14,'#ffcf7a','right')}}
menu();
if(window.__GS_TEST)window.__FL={get P(){return P},get planes(){return planes},get state(){return state},start,OPT,get score(){return score},get kills(){return kills},aim,get bullets(){return bullets},get ground(){return ground},damage,get rings(){return rings},camera,sim(sec,ctl){Object.assign(P.ctl,ctl||{});for(let t=0;t<sec;t+=.02){P.thr=P.ctl.thr;stepFlight(P,.02);groundCheck(P,.02,crash);if(P.dead)break}_e.setFromQuaternion(P.q,"YXZ");return[+P.ias.toFixed(1),+P.p.y.toFixed(1),+P.p.z.toFixed(0),P.onGround,P.dead,+(_e.x*57.3).toFixed(1),+(P.aoa*57.3).toFixed(1),P.stall]}};
return()=>{try{if(eng){eng.o.stop();eng.o2.stop()}}catch(e){}st3.dispose()}})}
G.push({id:'flightsim',name:'Horizon Flight Sim',kind:'game',wide:true,big:true,tint:'#5ec8ff',blurb:'A real flight simulator in your browser with lift, drag, stalls, flaps, gear and PAPI approach lights. Fly a trainer, an aerobatic plane or a business jet. Adventure missions: canyon run, island hop, storm landing, city tour, plus free flight.',fmt:b=>b+' pts',
art:'<defs><linearGradient id="flg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a78d0"/><stop offset=".7" stop-color="#bcd8f2"/><stop offset=".7" stop-color="#5a8434"/><stop offset="1" stop-color="#3e6a2a"/></linearGradient></defs><rect width="120" height="72" fill="url(#flg)"/><path d="M0 50l20-14 16 8 22-18 22 20 18-10 22 14v2H0z" fill="#6a7a6a" opacity=".6"/><ellipse cx="30" cy="16" rx="14" ry="4" fill="#fff" opacity=".8"/><g transform="translate(60 30) rotate(-12)"><path d="M-22 0q2-4 10-4h22q8 0 10 4q-2 3-10 3h-22q-8 0-10-3z" fill="#f4f4f2"/><path d="M-4-2l-6-16h6l10 16zM-4 2l-6 14h6l10-14z" fill="#e8e8e6"/><path d="M14-2l6-8h3l-3 9z" fill="#c8322a"/><path d="M-10-3h8l2-3h-6z" fill="#7ab0e0"/></g>',
run(root,c){return flightGame(root,c,{mode:'sim',id:'flightsim'})}});
G.push({id:'skyfront',name:'Skyfront 1943',kind:'game',wide:true,big:true,tint:'#ffb02e',blurb:'WWII-style air combat. Mouse-aim flying: point and your fighter follows. Lead your shots with the aim marker, dodge flak, intercept bomber formations and strike ground targets. Four planes, four missions and an endless mode.',fmt:b=>b+' pts',
art:'<defs><linearGradient id="skg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3a78"/><stop offset="1" stop-color="#f08a4a"/></linearGradient></defs><rect width="120" height="72" fill="url(#skg)"/><path d="M0 60l30-8 30 6 30-10 30 6v18H0z" fill="#3a4a3a"/><g transform="translate(40 36) rotate(8)"><path d="M-16 0q2-3 8-3h16q6 0 8 3q-2 2-8 2h-16q-6 0-8-2z" fill="#6a7a4a"/><path d="M-4-2l-4-13h5l8 13zM-4 2l-4 12h5l8-12z" fill="#5a6a3a"/><circle cx="-5" cy="-8" r="2" fill="#1a3a8a"/><circle cx="-5" cy="-8" r="1" fill="#c8201a"/></g><g transform="translate(92 22) rotate(-160)"><path d="M-12 0q2-2 6-2h12q5 0 6 2q-1 2-6 2h-12q-5 0-6-2z" fill="#3a3a3a"/><path d="M-3-1l-3-10h4l6 10zM-3 1l-3 9h4l6-9z" fill="#333"/></g><path d="M50 34L86 24" stroke="#ffd070" stroke-width="1.2" stroke-dasharray="4 3"/><circle cx="92" cy="22" r="6" fill="#ff8a2a" opacity=".5"/>',
run(root,c){return flightGame(root,c,{mode:'combat',id:'skyfront'})}});
