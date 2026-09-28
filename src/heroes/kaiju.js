  /* ================= KAIJU RAMPAGE: giant atomic dinosaur mode (cfg.kaiju) ================= */
  const V3=T.Vector3,SHORE=HALF+14,seaD=z=>z<=SHORE?0:Math.min(34,(z-SHORE)*.28),KHP=1000;
  const GK={cop:1,tank:1,mlrs:1,boat:1},MILK={tank:1,heli:1,mlrs:1,fjet:1,boat:1,mecha:1},kMoney=n=>'$'+(n/100).toFixed(1)+'B';
  const KZ={t:0,yaw:Math.PI,ph:0,en:60,maxHP:KHP,swT:0,swCd:0,swSide:1,combo:0,lastSw:-9,swBig:false,swSet:null,swHitFx:false,swDone:true,swPrev:null,tailCd:0,tailT:0,spin:1,stompCd:0,stompT:0,stompDone:true,roarCd:0,roarT:0,roarDone:true,brCh:0,brOn:false,brAcc:0,brBoom:0,brN:0,brWarn:0,pulseT:0,pulseDone:1,held:null,grabCd:0,flinch:0,deadT:0,fell:false,fallDir:1,crunch:0,debHit:0,spT:2,bossT:240,roamT:0,landed:false,bossDown:false,won:false,flashT:0,fx:0,fz:-1,jL:false,sL:false,rL:false,gL:false,pL:false,lastBest:0,lowWarn:false,init:false,sw:0};
  let milN=0,milT=0,subT=0,subN=0,kSubs=[];
  let KG=null,hipG,tor,neck,headG,jaw,legA,legB,armA,armB,eyeM,mouthGlow,kbO,kbM,kbC,kImp,mbO,mbC,bossBar=null,wTex=null,foam=null;const PM=[],tailM=[],KB=[];
  const TN=12,TL=2.9,tP=[],tV=[],tVel=[],tR=[],tPrev=[],MOUTH=new V3(0,-.7,5.2);
  for(let i=0;i<TN;i++){tP.push(new V3());tV.push(new V3());tVel.push(new V3());tPrev.push(new V3());tR.push(3.3*Math.pow(1-i/TN,.9)+.35)}
  if(KM){
    /* --- coastline: beach, sloping sea floor, water --- */
    gnd.geometry.dispose();gnd.geometry=new T.PlaneGeometry(1400,700+SHORE);gnd.position.z=(SHORE-700)/2;
    const sfG=new T.PlaneGeometry(1400,700-SHORE,1,40);sfG.rotateX(-Math.PI/2);{const pa=sfG.attributes.position;for(let i=0;i<pa.count;i++)pa.setY(i,-seaD(pa.getZ(i)+(SHORE+700)/2)-.4);sfG.computeVertexNormals()}
    const sfl=new T.Mesh(sfG,new T.MeshLambertMaterial({color:0x4f6a5c}));sfl.position.z=(SHORE+700)/2;scene.add(sfl);
    const sand=new T.Mesh(new T.BoxGeometry(1400,.34,SHORE-HALF+6),new T.MeshLambertMaterial({color:0xe3cf98}));sand.position.set(0,.14,(HALF+SHORE)/2+2);sand.receiveShadow=true;scene.add(sand);
    wTex=tex(T,128,128,(x,w,h)=>{x.fillStyle='#ffffff';x.fillRect(0,0,w,h);x.strokeStyle='rgba(20,60,110,.2)';x.lineWidth=2;for(let i=0;i<22;i++){const y=Math.random()*h,x0=Math.random()*w;x.beginPath();x.moveTo(x0,y);x.quadraticCurveTo(x0+12,y-4,x0+26,y);x.stroke()}x.strokeStyle='rgba(255,255,255,.55)';for(let i=0;i<10;i++){const y=Math.random()*h,x0=Math.random()*w;x.beginPath();x.moveTo(x0,y);x.lineTo(x0+14,y-2);x.stroke()}},40,14);
    const wat=new T.Mesh(new T.PlaneGeometry(1400,700-SHORE+4),new T.MeshPhongMaterial({color:0x2f7fb4,map:wTex,transparent:true,opacity:.84,shininess:80,specular:0x6f90b0,depthWrite:false}));wat.rotation.x=-Math.PI/2;wat.position.set(0,.3,(SHORE+700)/2-2);wat.renderOrder=2;scene.add(wat);
    foam=new T.Mesh(new T.PlaneGeometry(1400,3.5),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.55,depthWrite:false}));foam.rotation.x=-Math.PI/2;foam.position.set(0,.36,SHORE+1);scene.add(foam);
    /* --- the monster --- */
    const skinTex=tex(T,128,128,(x,w,h)=>{x.fillStyle='#ffffff';x.fillRect(0,0,w,h);for(let i=0;i<260;i++){x.fillStyle='rgba(40,50,40,'+(.08+Math.random()*.16)+')';x.beginPath();x.arc(Math.random()*w,Math.random()*h,2+Math.random()*5,0,7);x.fill()}for(let i=0;i<120;i++){x.fillStyle='rgba(255,255,255,.14)';x.fillRect(Math.random()*w,Math.random()*h,2,2)}},2,2);
    const skin=TM(0x56685a,{map:skinTex}),skinD=TM(0x3c4a40,{map:skinTex}),bellyM=TM(0x9a9c78,{map:skinTex}),clawM=TM(0xeee6cc),toothM=TM(0xfbf6e6),mouthM=TM(0x4a1418);
    for(let b=0;b<8;b++)PM.push(TM(0xdcd4bb,{emissive:0x3FB8FF,emissiveIntensity:0}));
    const plG=new T.ConeGeometry(1,1,4);plG.translate(0,.5,0);
    const plate=(par,x,y,z,s,ord,tilt,rz)=>{const m=new T.Mesh(plG,PM[clamp(Math.floor(ord*8),0,7)]);m.scale.set(.3*s,2.4*s,1.35*s);m.position.set(x,y,z);m.rotation.set(tilt,0,rz||0);par.add(m);return m};
    const ball=(par,mat,x,y,z,sx,sy,sz)=>{const m=part(T,sp(T,1),mat,x,y,z,par);m.scale.set(sx,sy,sz);return m};
    KG=new T.Group();KG.rotation.order='YXZ';KG.visible=false;scene.add(KG);
    hipG=new T.Group();hipG.position.y=11;KG.add(hipG);ball(hipG,skin,0,0,-.6,4.6,3.6,4.4);
    const mkLeg=s=>{const th=new T.Group();th.position.set(s*3.7,-.4,0);hipG.add(th);ball(th,skin,0,-2.4,.3,2.8,4.4,3.3);const kn=new T.Group();kn.position.set(0,-4.9,1.1);th.add(kn);const sh=part(T,cy(T,1.9,1.45,4.6,10),skin,0,-2.1,-.7,kn);sh.rotation.x=-.3;const an=new T.Group();an.position.set(0,-4.3,-1.3);kn.add(an);ball(an,skinD,0,-.55,1.1,1.9,.85,3);[-1.1,0,1.1].forEach(x0=>{const cl=part(T,new T.ConeGeometry(.42,1.5,6),clawM,x0,-.8,3.9,an);cl.rotation.x=Math.PI/2+.2});return{th,kn,an}};
    legA=mkLeg(1);legB=mkLeg(-1);
    tor=new T.Group();tor.position.set(0,.8,0);tor.rotation.x=.28;hipG.add(tor);
    ball(tor,skin,0,5.4,-.6,5.3,8,5.1);ball(tor,bellyM,0,4.8,1.9,4,6.6,3.3);ball(tor,skin,0,10.2,.7,4.7,4.3,4.5);
    for(let k=0;k<6;k++){const y=1.6+k*1.45,dy=(y-4.8)/6.6,f=Math.sqrt(Math.max(0,1-dy*dy));part(T,bx(T,7*f*.8,.26,.6),skinD,0,y,1.9+3.3*f-.15,tor).rotation.x=-.1}
    const mkArm=s=>{const g=new T.Group();g.position.set(s*4.7,10.3,1.7);g.rotation.order='YXZ';tor.add(g);ball(g,skin,0,-1.4,0,1.5,2.4,1.5);const el=new T.Group();el.position.set(0,-3.6,0);el.rotation.x=-1;g.add(el);part(T,cy(T,1,.8,3.4,8),skin,0,-1.7,0,el);const hd=new T.Group();hd.position.set(0,-3.5,0);el.add(hd);ball(hd,skinD,0,-.3,0,1.1,.8,1.2);[-.55,0,.55].forEach(x0=>{const cl=part(T,new T.ConeGeometry(.28,1.3,6),clawM,x0,-1.1,.35,hd);cl.rotation.x=Math.PI-.4});return{g,el,hd}};
    armA=mkArm(1);armB=mkArm(-1);
    neck=new T.Group();neck.position.set(0,12.3,1.4);neck.rotation.x=-.3;tor.add(neck);part(T,cy(T,2.5,3.3,4.4,12),skin,0,1.6,.3,neck);
    headG=new T.Group();headG.position.set(0,4,1.1);neck.add(headG);
    ball(headG,skin,0,.5,.6,2.5,2.2,3.1);ball(headG,skin,0,-.1,3.1,1.9,1.35,2.5);
    [-1,1].forEach(s=>{const br=part(T,bx(T,1.2,.5,2.4),skinD,s*1.45,1.5,1.6,headG);br.rotation.set(-.2,s*.25,-s*.2)});
    eyeM=new T.MeshBasicMaterial({color:0xFFC23F});[-1,1].forEach(s=>{part(T,sp(T,.34),eyeM,s*1.6,1,2.3,headG).userData.noInk=1});
    [-1,1].forEach(s=>{for(let i=0;i<6;i++){const t0=part(T,new T.ConeGeometry(.2,.8,5),toothM,s*1.45*(1-i*.07),-1.35,1.5+i*.62,headG);t0.rotation.x=Math.PI;t0.userData.noInk=1}});
    jaw=new T.Group();jaw.position.set(0,-.9,1.1);headG.add(jaw);ball(jaw,skinD,0,-.4,1.9,1.7,.65,2.6);ball(jaw,mouthM,0,.1,1.9,1.45,.35,2.3).userData.noInk=1;
    [-1,1].forEach(s=>{for(let i=0;i<5;i++){part(T,new T.ConeGeometry(.18,.7,5),toothM,s*1.25*(1-i*.08),.35,.9+i*.6,jaw).userData.noInk=1}});
    mouthGlow=new T.Mesh(new T.SphereGeometry(1,12,10),glowM(0x7FE8FF));mouthGlow.position.copy(MOUTH);mouthGlow.visible=false;mouthGlow.userData.noInk=1;headG.add(mouthGlow);
    const backZ=y=>-.6-5.1*Math.sqrt(Math.max(0,1-((y-5.4)/8)**2));
    for(let k=0;k<7;k++){const y=.5+k*1.85,z=backZ(y)+.35,s=1.1+Math.sin(k/6*Math.PI)*.9,ord=.55+k*.06;plate(tor,0,y,z,s,ord,-.45);plate(tor,1.3,y-.5,z+.25,s*.6,ord,-.45,-.35);plate(tor,-1.3,y-.5,z+.25,s*.6,ord,-.45,.35)}
    plate(neck,0,1.2,-2.2,1.1,.97,-.5);plate(neck,0,3,-1.8,.8,.99,-.5);
    for(let i=0;i<TN-1;i++){const g=new T.CylinderGeometry(tR[i+1],tR[i],TL+.3,12);g.rotateX(Math.PI/2);g.translate(0,0,TL/2);const m=new T.Mesh(g,skin);m.visible=false;scene.add(m);const s=1.25*(1-i/TN)+.25,ord=.5*(1-i/TN);if(i<TN-2){plate(m,0,tR[i]*.8,TL*.5,s,ord,.45);plate(m,tR[i]*.55,tR[i]*.55,TL*.5,s*.55,ord,.45,-.5);plate(m,-tR[i]*.55,tR[i]*.55,TL*.5,s*.55,ord,.45,.5)}K.ink(m,.1);m.traverse(o=>{if(o.isMesh)o.castShadow=true});tailM.push(m)}
    K.ink(KG,.1);KG.traverse(o=>{if(o.isMesh)o.castShadow=true});
    KB.push([hipG,new V3(0,0,-.6),5],[tor,new V3(0,4.6,.3),5.4],[tor,new V3(0,10.2,.8),4.8],[neck,new V3(0,2,.5),3.2],[headG,new V3(0,0,2.2),3.3],[legA.kn,new V3(0,-1.5,-.4),2.6],[legB.kn,new V3(0,-1.5,-.4),2.6],[legA.an,new V3(0,-.5,1),2.4],[legB.an,new V3(0,-.5,1),2.4],[armA.hd,new V3(),1.8],[armB.hd,new V3(),1.8]);
    const mkB=(col,op,ro)=>{const m=new T.Mesh(lzG,glowM(col));m.material.opacity=op;m.visible=false;m.frustumCulled=false;m.renderOrder=ro;scene.add(m);return m};
    kbO=mkB(0x2F8CFF,.5,4);kbM=mkB(0x7FE8FF,.8,5);kbC=mkB(0xffffff,.95,6);mbO=mkB(0xFF2A2A,.6,4);mbC=mkB(0xFFF0E0,.95,5);
    kImp=new T.Mesh(new T.SphereGeometry(1,16,12),glowM(0x9FE8FF));kImp.visible=false;scene.add(kImp);
    bossBar=el('div',{style:'position:absolute;left:50%;bottom:74px;transform:translateX(-50%);width:min(420px,52vw);display:none;pointer-events:none;text-align:center;font:900 13px Figtree,sans-serif;color:#fff;text-shadow:0 2px 0 #1D1A2F,0 0 4px #1D1A2F;letter-spacing:.5px'});bossBar.innerHTML='<div class="bn">MECHA-KAIJU</div><div style="height:14px;border:3px solid #1D1A2F;border-radius:8px;background:rgba(29,26,47,.55);overflow:hidden;margin-top:3px"><div class="bf" style="height:100%;width:100%;background:linear-gradient(90deg,#F2352A,#FF9F43)"></div></div>';K.hud.append(bossBar);
    wbar.style.display='none';HR.visible=false}
  /* --- body geometry helpers --- */
  const kFwd=()=>new V3(KZ.fx,0,KZ.fz),kChest=()=>new V3(P.p.x+KZ.fx*3,P.p.y+17,P.p.z+KZ.fz*3);
  const KDv=[0,0,0];
  function kD(x,y,z){const ax=P.p.x,ay=P.p.y+4,az=P.p.z,ux=KZ.fx*5,uy=23,uz=KZ.fz*5;let t=((x-ax)*ux+(y-ay)*uy+(z-az)*uz)/(ux*ux+uy*uy+uz*uz);t=t<0?0:t>1?1:t;const dx=x-(ax+ux*t),dy=y-(ay+uy*t),dz=z-(az+uz*t);const d=Math.hypot(dx,dy,dz)||1e-4;const r=t<.82?6.2:6.2-(t-.82)*15;KDv[0]=dx/d;KDv[1]=dy/d;KDv[2]=dz/d;return d-r}
  function eNear(e,pt,rad){if(e.kind==='mecha')return Math.hypot(e.p.x-pt.x,e.p.z-pt.z)<8+rad&&pt.y>e.fy-2&&pt.y<e.fy+32;return e.p.distanceTo(pt)<e.r+rad}
  function carve(c,R,v,rad,budget){let n=0;const g0=Math.floor((c.x-R)/BS),g1=Math.floor((c.x+R)/BS),h0=Math.max(0,Math.floor((c.y-R)/BS)),h1=Math.floor((c.y+R)/BS),k0=Math.floor((c.z-R)/BS),k1=Math.floor((c.z+R)/BS);if(h1<0)return 0;
    for(let gx=g0;gx<=g1;gx++)for(let gz=k0;gz<=k1;gz++){const B=bAtG(gx,gz);if(!B)continue;for(let gy=h0;gy<=Math.min(h1,B.fh-1);gy++){const k=vI(B,gx-B.gx0,gy,gz-B.gz0);if(!B.hp[k])continue;const dx=(gx+.5)*BS-c.x,dy=(gy+.5)*BS-c.y,dz=(gz+.5)*BS-c.z;const d=Math.hypot(dx,dy,dz);if(d>R+BS*.45)continue;const s=rad/Math.max(1.5,d);
      killBlock(B,k,v.x+dx*s+(Math.random()-.5)*5,v.y+Math.max(0,dy)*s*.4+2+Math.random()*5,v.z+dz*s+(Math.random()-.5)*5,Math.random()<.6?'fall':null);if(++n>=budget)return n}}return n}
  function setBeam(m,o,d,L,r){m.visible=true;m.position.copy(o);m.quaternion.setFromUnitVectors(UP,d);m.scale.set(r,L,r)}
  function kbHide(){[kbO,kbM,kbC,kImp,mbO,mbC].forEach(m=>{if(m)m.visible=false})}
  /* --- animation --- */
  function kAnim(dt,live){const hs=Math.hypot(P.v.x,P.v.z);const amp=clamp(hs/12,0,1.3);const c0=Math.cos(KZ.ph);KZ.ph+=dt*(KZ.sw>.5?4+hs*.12:hs*.3);const s=Math.sin(KZ.ph),co=Math.cos(KZ.ph);
    if(live&&hs>.8&&KZ.sw<.5){if(c0<0&&co>=0)kFoot(legA,hs);else if(c0>0&&co<=0)kFoot(legB,hs)}
    legA.th.rotation.x=s*.5*amp;legA.kn.rotation.x=Math.max(0,-co)*amp*.95;legB.th.rotation.x=-s*.5*amp;legB.kn.rotation.x=Math.max(0,co)*amp*.95;
    let st=0;if(KZ.stompT>0){const el0=.5-KZ.stompT;st=el0<.32?el0/.32:Math.max(0,1-(el0-.32)/.12);legB.th.rotation.x=-1*st;legB.kn.rotation.x=1.25*st}
    legA.an.rotation.x=-(legA.th.rotation.x+legA.kn.rotation.x);legB.an.rotation.x=-(legB.th.rotation.x+legB.kn.rotation.x);
    const t=KZ.t;hipG.position.y=11-.35*amp+Math.abs(co)*.5*amp+st*.8;
    const rE=KZ.roarT>0?Math.sin(clamp((2.2-KZ.roarT)/2.2,0,1)*Math.PI):0,pE=KZ.pulseT>0?Math.sin(clamp((1.4-KZ.pulseT)/1.4,0,1)*Math.PI):0;
    tor.rotation.x=.28+amp*.05-rE*.22-st*.12-pE*.15+KZ.flinch*.25+Math.sin(t*1.3)*.012;tor.rotation.z=s*.05*amp;tor.rotation.y=s*.05*amp;KZ.flinch=Math.max(0,KZ.flinch-dt*2);
    [armA,armB].forEach((a,i)=>{a.g.rotation.set(-.35+Math.sin(KZ.ph+i*Math.PI)*.18*amp+Math.sin(t*1.3)*.03,0,(i?-1:1)*.18);a.el.rotation.x=-1});
    if(rE>0||pE>0){const e2=Math.max(rE,pE);[armA,armB].forEach((a,i)=>{a.g.rotation.set(-.35-.9*e2,0,(i?-1:1)*.75*e2);a.el.rotation.x=-1+e2*.4})}
    if(KZ.held){armA.g.rotation.set(-2.3,-.3,0);armA.el.rotation.x=-.5}
    if(KZ.swT>0){if(KZ.swBig){const el0=.62-KZ.swT;const up=el0<.22?el0/.22:Math.max(0,1-(el0-.22)/.1);[armA,armB].forEach((a,i)=>{a.g.rotation.set(-1.2-up*1.6,(i?-1:1)*.2,0);a.el.rotation.x=-.3})}
      else{const a=KZ.swSide>0?armA:armB;const el0=.46-KZ.swT;const u=el0<.1?-el0/.1*.25:el0<.3?(el0-.1)/.2:1;a.g.rotation.set(-1.45-clamp(cam.pitch,-.8,.8)*.5,KZ.swSide*(1.1-1.9*clamp(u,-.3,1)),0);a.el.rotation.x=-.25}}
    const pit=clamp(cam.pitch,-.9,.7);let yo=cam.yaw+Math.PI-KZ.yaw;yo=clamp(Math.atan2(Math.sin(yo),Math.cos(yo)),-.75,.75);
    neck.rotation.x=-.3-pit*.35-rE*.5;neck.rotation.y=yo*.55;headG.rotation.x=-pit*.45-rE*.35;headG.rotation.y=yo*.4;
    jaw.rotation.x=Math.max(rE*.9,KZ.brOn?.55+Math.random()*.08:KZ.brCh*.35,KZ.swT>0?.2:0,pE*.6,.03+Math.sin(t*1.1)*.03);
    const W=KZ.sw;if(W>.02){const kk=Math.sin(KZ.ph*1.6);tor.rotation.x+=(1.25-tor.rotation.x)*W;neck.rotation.x+=(-1.05-pit*.4-neck.rotation.x)*W;legA.th.rotation.x+=(1.3+kk*.35-legA.th.rotation.x)*W;legB.th.rotation.x+=(1.3-kk*.35-legB.th.rotation.x)*W;legA.kn.rotation.x*=1-W;legB.kn.rotation.x*=1-W;[armA,armB].forEach((a,i)=>{a.g.rotation.x+=(.9-a.g.rotation.x)*W;a.g.rotation.z+=((i?-1:1)*.5-a.g.rotation.z)*W});hipG.position.y+=(7-hipG.position.y)*W}
    kPlates()}
  function kPlates(){const g=KZ.pulseT>0?1.6:KZ.brOn?1:KZ.brCh;const idle=.08+KZ.en/100*.18*(.5+.5*Math.sin(KZ.t*2.2));const fl=Math.max(0,KZ.flashT);
    for(let b=0;b<8;b++){const lit=g>0?clamp((g*1.3-(1-b/7))*3,0,1):0;PM[b].emissiveIntensity=Math.max(idle,lit*(KZ.brOn?1.1+Math.random()*.5:1.2),fl)}
    mouthGlow.visible=KZ.brCh>.15||KZ.brOn;mouthGlow.scale.setScalar(.6+KZ.brCh*.8+(KZ.brOn?Math.random()*.4:0));eyeM.color.setHex(KZ.brCh>.3||KZ.pulseT>0?0x9FF0FF:0xFFC23F)}
  /* --- tail: spring chain with length constraints; fast segments smash what they touch --- */
  function tailRoot(){return tor.localToWorld(new V3(0,.8,-4.6))}
  function tailReset(){KG.position.copy(P.p);KG.rotation.set(0,KZ.yaw,0);KG.updateMatrixWorld(true);const r=tailRoot();const bk=new V3(-Math.sin(KZ.yaw),0,-Math.cos(KZ.yaw));for(let i=0;i<TN;i++){tP[i].copy(r).addScaledVector(bk,TL*i);tP[i].y=r.y+(P.p.y+tR[i]*.8+.4-r.y)*Math.pow(i/(TN-1),.75);tV[i].set(0,0,0);tVel[i].set(0,0,0)}}
  function tailTick(dt){if(dt<=0)return;const r=tailRoot();const bk=new V3(-Math.sin(KZ.yaw),0,-Math.cos(KZ.yaw)),sd=new V3(bk.z,0,-bk.x);const hs=Math.hypot(P.v.x,P.v.z);const fl=P.p.y;
    for(let i=0;i<TN;i++)tPrev[i].copy(tP[i]);tP[0].copy(r);
    for(let i=1;i<TN;i++){const f=i/(TN-1);const rest=r.clone().addScaledVector(bk,TL*i);rest.y=r.y+(fl+tR[i]*.8+.4-r.y)*Math.pow(f,.75)*(1-KZ.sw);rest.addScaledVector(sd,Math.sin(KZ.t*(1.7+KZ.sw*3.5)-i*.5)*i*(.16+KZ.sw*.3)*(.35+Math.min(1,hs/12)));
      tV[i].addScaledVector(rest.sub(tP[i]),((1-f)*7+1.5)*dt*4);tV[i].multiplyScalar(Math.pow(.02,dt));tP[i].addScaledVector(tV[i],dt);
      const d=tP[i].clone().sub(tP[i-1]);const L=d.length()||1;tP[i].copy(tP[i-1]).addScaledVector(d,TL/L);const mn=fl+tR[i]*.75-KZ.sw*30;if(tP[i].y<mn)tP[i].y=mn}
    for(let i=0;i<TN;i++)tVel[i].copy(tP[i]).sub(tPrev[i]).multiplyScalar(1/dt);
    for(let i=0;i<TN-1;i++){const m=tailM[i];m.visible=KG.visible;m.position.copy(tP[i]);m.lookAt(tP[i+1])}}
  function kTailHits(){const whip=KZ.tailT>0;let n=0;for(let i=2;i<TN;i++){const spd=tVel[i].length();if(spd<6)continue;const r=tR[i]+(whip?1.4:.4);const v=tVel[i].clone().multiplyScalar(whip?1.1:.8);v.y+=5;n+=carve(tP[i],r,v,6,whip?24:14);
      if(spd>9){enemies.forEach(e=>{if(e.dead||(e.tailCd||0)>0||!eNear(e,tP[i],r+2))return;e.tailCd=.5;hurtEnemy(e,whip?260:90,tP[i]);if(e.kind==='mecha'){e.kv.addScaledVector(tVel[i].clone().setY(0).normalize(),whip?14:6);if(whip){e.stag=Math.max(e.stag,1.8);H.pow('TAIL SLAM!',e.p.clone().setY(e.fy+34),'#FFD23F')}}});
        cars.forEach(q=>{if(q.alive&&q.m.position.distanceTo(tP[i])<r+3)hurtCar(q,99,tP[i])});people.forEach(q=>{if(q.st!=='gone'&&q.g.position.distanceTo(tP[i])<r+3)flingP(q,tP[i],24)});if(crowd)crowd.blast(tP[i],r+1.5,1.3);props.forEach(q=>{if(!q.down&&Math.hypot(q.x-tP[i].x,q.z-tP[i].z)<r+(q.r||1))q.kind==='fuel'?hurtFuel(q,99):knock(q,tP[i])})}}
    if(n>8&&Math.random()<.5)noise(.3,'lowpass',220,.35);if(n)cam.shake=Math.max(cam.shake,Math.min(1,n*.03))}
  /* --- body pushing through buildings: blocks inside the body break loose, and each one costs momentum --- */
  function kBody(){if(KZ.sw>.3)enemies.forEach(e=>{if(!e.dead&&e.kind==='boat'&&Math.hypot(e.p.x-P.p.x-KZ.fx*8,e.p.z-P.p.z-KZ.fz*8)<14){hurtEnemy(e,999,P.p);H.pow('CAPSIZED!',e.p.clone().setY(10),'#7FE8FF')}});const hs=Math.hypot(P.v.x,P.v.z);const v=P.v.clone().multiplyScalar(1.25);let n=0;const bud=110;
    for(const[o,l,r]of KB){if(n>=bud)break;n+=carve(o.localToWorld(l.clone()),r,v,4+hs*.6,bud-n)}
    if(n){P.v.multiplyScalar(Math.max(.86,1-n*.0016));KZ.crunch+=n;cam.shake=Math.max(cam.shake,Math.min(.7,.12+n*.015));if(Math.random()<.35)noise(.3,'lowpass',160+Math.random()*80,.3);if(crowd)crowd.blast(P.p,8,1)}
    if(KZ.crunch>70){KZ.crunch=0;H.pow(pick(['KRRRUNCH!','CRASH!','SMASH!','KA-RUNCH!']),P.p.clone().setY(P.p.y+30),'#FFD23F');addScore(10)}
    props.forEach(q=>{if(!q.down&&Math.hypot(q.x-P.p.x,q.z-P.p.z)<(q.sub?9:6)){if(q.kind==='fuel')hurtFuel(q,99);else knock(q,P.p)}})}
  function kFoot(L,hs){const fp=L.an.localToWorld(new V3(0,-.8,1.2));fp.y=P.p.y;const pw=hs>10?1.35:1;cam.shake=Math.max(cam.shake,.32*pw);noise(.35,'lowpass',55+Math.random()*25,.45*pw);
    if(seaD(fp.z)>1.2){for(let q=0;q<7;q++)K.puff(new V3(fp.x+(Math.random()-.5)*8,.8,fp.z+(Math.random()-.5)*8),0xeef8ff,3+Math.random()*3,1.3,new V3((Math.random()-.5)*6,7+Math.random()*5,(Math.random()-.5)*6));K.ring(new V3(fp.x,.5,fp.z),0xffffff,2,12,.8);return}
    K.ring(fp.clone().setY(.35),0xcfc6b8,2,10*pw,.6);for(let q=0;q<4;q++)K.puff(fp.clone().add(new V3((Math.random()-.5)*6,1,(Math.random()-.5)*6)),0xcfc6b8,3+Math.random()*2.5,1.6,new V3((Math.random()-.5)*6,2,(Math.random()-.5)*6));
    kCrush(fp,4.6*pw,true);carve(fp.clone().setY(2),3.6,new V3(P.v.x,-3,P.v.z),6,30);groundDmg(fp,7*pw,.35)}
  function kCrush(pt,R,byK){if(crowd)crowd.blast(pt,R+1.5,1.2);cars.forEach(q=>{if(q.alive&&Math.hypot(q.m.position.x-pt.x,q.m.position.z-pt.z)<R+1){hurtCar(q,99,pt.clone().setY(8));if(byK&&Math.random()<.3)H.pow('CRUNCH!',q.m.position.clone().setY(8),'#fff')}});people.forEach(q=>{if(q.st!=='gone'&&q.st!=='fly'&&Math.hypot(q.g.position.x-pt.x,q.g.position.z-pt.z)<R+2)flingP(q,pt,16)});
    if(byK)enemies.forEach(e=>{if(!e.dead&&GK[e.kind]&&Math.hypot(e.p.x-pt.x,e.p.z-pt.z)<R+e.r*.6){hurtEnemy(e,999,pt);H.pow('SQUASHED!',e.p.clone().setY(9),'#FFD23F')}});props.forEach(q=>{if(!q.down&&Math.hypot(q.x-pt.x,q.z-pt.z)<R+(q.r||1))knock(q,pt)})}
  function groundDmg(pt,R,ch){const g0=Math.floor((pt.x-R)/BS),g1=Math.floor((pt.x+R)/BS),k0=Math.floor((pt.z-R)/BS),k1=Math.floor((pt.z+R)/BS);for(let gx=g0;gx<=g1;gx++)for(let gz=k0;gz<=k1;gz++){const B=bAtG(gx,gz);if(!B)continue;const dx=(gx+.5)*BS-pt.x,dz=(gz+.5)*BS-pt.z;const d=Math.hypot(dx,dz)||1;if(d>R)continue;for(let gy=0;gy<Math.min(3,B.fh);gy++){if(Math.random()>ch)continue;const dm=((d<R*.4?4:d<R*.7?2:1)-gy*.5)|0||1;dmgBlock(B,vI(B,gx-B.gx0,gy,gz-B.gz0),dm,dx/d*10,7,dz/d*10)}}}
  function kScatter(pt,R){if(crowd)crowd.blast(pt,R*1.4,1.6);cars.forEach(q=>{if(q.alive&&Math.hypot(q.m.position.x-pt.x,q.m.position.z-pt.z)<R*1.1)hurtCar(q,60,pt)});people.forEach(q=>{if(q.st!=='gone'&&Math.hypot(q.g.position.x-pt.x,q.g.position.z-pt.z)<R*1.4)flingP(q,pt,26)});props.forEach(q=>{if(!q.down&&Math.hypot(q.x-pt.x,q.z-pt.z)<R)knock(q,pt)})}
  function kShockFx(pt,R){const y=Math.max(pt.y,0)+.5;K.ring(pt.clone().setY(y),0xffffff,2,R*2.2,.9);K.ring(pt.clone().setY(y),0xcfc6b8,1,R*1.4,1.3);for(let q=0;q<12;q++){const a=q/12*6.283;K.puff(pt.clone().add(new V3(Math.cos(a)*R*.35,1.5,Math.sin(a)*R*.35)),seaD(pt.z)>1?0xe8f4ff:0xcfc6b8,5+Math.random()*3,2,new V3(Math.cos(a)*12,2,Math.sin(a)*12))}cam.shake=Math.max(cam.shake,1.6);noise(1.1,'lowpass',55,.7);sweep(120,40,.6,'sine',.12)}
  function kShock(pt,R){kShockFx(pt,R);carve(pt.clone().setY(Math.max(pt.y,0)+2),7,new V3(0,8,0),14,120);groundDmg(pt,R,.85);kScatter(pt,R);
    enemies.forEach(e=>{if(e.dead)return;const d=Math.hypot(e.p.x-pt.x,e.p.z-pt.z);if(e.kind==='mecha'){if(d<R){hurtEnemy(e,160,pt);e.stag=Math.max(e.stag,1.2)}return}if(GK[e.kind]&&d<R)hurtEnemy(e,360*(1-d/R)+90,pt);else if(d<R*2&&e.p.y<60)e.stun=Math.max(e.stun||0,2)});H.pow(pick(['KA-THOOM!','STOMP!','QUAKE!']),pt.clone().setY(14),'#FFD23F')}
  function kHitArea(pt,R,dmg,dir,set){enemies.forEach(e=>{if(e.dead||(set&&set.has(e))||!eNear(e,pt,R))return;if(set)set.add(e);hurtEnemy(e,dmg,pt);hitMark();if(e.kind==='mecha'&&dir)e.kv.addScaledVector(dir.clone().setY(0).normalize(),dmg>300?16:7)});
    cars.forEach(q=>{if(q.alive&&q.m.position.distanceTo(pt)<R+3)hurtCar(q,99,pt)});people.forEach(q=>{if(q.st!=='gone'&&q.g.position.distanceTo(pt)<R+3)flingP(q,pt,30)});if(crowd)crowd.blast(pt,R+2,1.4);
    props.forEach(q=>{if(!q.down&&Math.hypot(q.x-pt.x,q.z-pt.z)<R+(q.r||1)&&pt.y<16){if(q.kind==='fuel')hurtFuel(q,q.sub?40:99);else knock(q,pt)}})}
  /* --- attacks --- */
  function startSwipe(){KZ.swCd=.5;KZ.swT=.46;KZ.swSide=KZ.swSide>0?-1:1;KZ.combo=KZ.t-KZ.lastSw<1.1?KZ.combo+1:1;KZ.lastSw=KZ.t;KZ.swSet=new Set();KZ.swBig=KZ.combo>=3;KZ.swPrev=null;KZ.swHitFx=false;KZ.swDone=false;if(KZ.swBig){KZ.combo=0;KZ.swT=.62;KZ.swCd=.8}sweep(500,140,.3,'sawtooth',.05)}
  function kSwipeTick(dt){if(KZ.swT<=0)return;const dur=KZ.swBig?.62:.46;const el0=dur-KZ.swT;KZ.swT-=dt;const pit=clamp(cam.pitch,-1.1,.8);const hy=clamp(17+pit*22,2.5,32);const fw=kFwd();
    if(KZ.swBig){if(!KZ.swDone&&el0>=.3){KZ.swDone=true;const pt=P.p.clone().addScaledVector(fw,13);pt.y=Math.max(2,Math.max(P.p.y,0)+hy*.8);explode(pt,8,1.6,true,true);carve(pt,6,fw.clone().multiplyScalar(22).setY(-8),10,90);kHitArea(pt,10,420,fw);if(pt.y<8)kScatter(pt,16);enemies.forEach(e=>{if(e.kind==='mecha'&&!e.dead&&eNear(e,pt,10))e.stag=Math.max(e.stag,2)});cam.shake=Math.max(cam.shake,1.5);slowT=Math.max(slowT,.1);H.pow('DOUBLE SMASH!',pt.clone().setY(pt.y+10),'#FFD23F');noise(.9,'lowpass',90,.6)}return}
    const w0=.1,w1=.3;if(el0<w0||el0>w1+dt)return;const u0=clamp((el0-dt-w0)/(w1-w0),0,1),u1=clamp((el0-w0)/(w1-w0),0,1);const s=KZ.swSide;let n=0;
    for(let q=1;q<=3;q++){const u=u0+(u1-u0)*q/3;const a=KZ.yaw+s*(1.1-1.9*u);const dir=new V3(Math.sin(a),0,Math.cos(a));const tan=new V3(-dir.z,0,dir.x).multiplyScalar(s);
      [6.5,10,13.5].forEach((R,ri)=>{const pt=P.p.clone().addScaledVector(dir,R);pt.y=Math.max(1.5,Math.max(P.p.y,0)+hy+(R-10)*pit*.5);n+=carve(pt,3.3,tan.clone().multiplyScalar(26).addScaledVector(dir,9).setY(4),9,24);kHitArea(pt,4,170,tan,KZ.swSet);
        if(ri===2){if(KZ.swPrev)[-1.2,0,1.2].forEach(o=>tracer(KZ.swPrev.clone().setY(KZ.swPrev.y+o),pt.clone().setY(pt.y+o),0xffffff,9,.16));KZ.swPrev=pt.clone()}})}
    if(n&&!KZ.swHitFx){KZ.swHitFx=true;cam.shake=Math.max(cam.shake,.6);noise(.35,'lowpass',240,.45);slowT=Math.max(slowT,.05)}}
  function startTail(){if(KZ.tailT>0)return;if(KZ.tailCd>0){H.say('Tail whip ready in '+Math.ceil(KZ.tailCd)+'s',700);return}KZ.tailCd=3;KZ.tailT=.95;KZ.spin=Math.random()<.5?1:-1;sweep(260,60,.9,'sawtooth',.08);noise(.9,'bandpass',260,.25)}
  function startStomp(){if(KZ.stompCd>0||KZ.stompT>0)return;KZ.stompCd=1.3;KZ.stompT=.5;KZ.stompDone=false}
  function kStompTick(dt){if(KZ.stompT<=0)return;const el0=.5-KZ.stompT;KZ.stompT-=dt;if(!KZ.stompDone&&el0>=.32){KZ.stompDone=true;const fp=legB.an.localToWorld(new V3(0,-.8,1.2));fp.y=P.p.y;kShock(fp,20)}}
  function startRoar(){if(KZ.roarT>0)return;if(KZ.roarCd>0){H.say('Roar ready in '+Math.ceil(KZ.roarCd)+'s',800);return}KZ.roarCd=14;KZ.roarT=2.2;KZ.roarDone=false;sweep(260,70,1.9,'sawtooth',.12);sweep(180,50,2,'square',.05);noise(2,'bandpass',420,.35);noise(1.8,'lowpass',120,.5)}
  function kRoarTick(dt){if(KZ.roarT<=0)return;const el0=2.2-KZ.roarT;KZ.roarT-=dt;const hd=headG.localToWorld(new V3(0,0,3));if(el0>.35&&el0<1.9){cam.shake=Math.max(cam.shake,.5);if(Math.random()<dt*6)K.ring(hd.clone(),0xffffff,1,22,.5)}
    if(!KZ.roarDone&&el0>=.4){KZ.roarDone=true;H.pow('ROOOAAARRR!',hd.clone().setY(hd.y+6),'#7FE8FF');KZ.en=Math.min(100,KZ.en+15);let n=0;enemies.forEach(e=>{if(e.dead||e.p.distanceTo(P.p)>160)return;e.stun=Math.max(e.stun||0,e.kind==='mecha'?1.2:3.2);n++});if(crowd)crowd.scare(P.p,260);people.forEach(scare);
      blds.forEach(B=>{const cx=(B.gx0+B.fx/2)*BS,cz=(B.gz0+B.fz/2)*BS;const d=Math.hypot(cx-P.p.x,cz-P.p.z)||1;if(d>80)return;const cnt=B.glass?30:8;for(let q=0;q<cnt;q++){const k=rand(B.hp.length);if(B.hp[k])dmgBlock(B,k,B.glass?3:1,(cx-P.p.x)/d*8,2,(cz-P.p.z)/d*8)}});if(n)H.say('😱 '+n+' military units stunned by the roar!',1400)}}
  function startPulse(){if(KZ.pulseT>0)return;if(KZ.en<70){H.say('Atomic Pulse needs 70% energy. Smash things to charge up.',1200);return}KZ.en-=70;KZ.pulseT=1.4;KZ.pulseDone=0;KZ.brOn=false;sweep(80,900,1,'sawtooth',.08)}
  function kPulseTick(dt){if(KZ.pulseT<=0)return;const el0=1.4-KZ.pulseT;KZ.pulseT-=dt;if(el0<.8&&Math.random()<dt*20)K.puff(P.p.clone().add(new V3((Math.random()-.5)*14,8+Math.random()*16,(Math.random()-.5)*14)),0x7FE8FF,1.5,.5,new V3(0,4,0));
    if(el0>=.8&&!KZ.pulseDone){KZ.pulseDone=1;const c0=P.p.clone().setY(Math.max(P.p.y,0)+12);flash(c0,6);H.pow('ATOMIC PULSE!',c0.clone().setY(c0.y+24),'#7FE8FF');noise(2,'lowpass',80,.8);cam.shake=2.2;slowT=Math.max(slowT,.3);
      [0,1,2].forEach(k=>strikes.push({t:k*.12,fn:()=>{const R=12+k*9;K.ring(c0.clone().setY(Math.max(1,P.p.y+1)),0x7FE8FF,R*.5,R*2.4,.8);for(let q=0;q<10;q++){const a=q/10*6.283+k;explode(c0.clone().add(new V3(Math.cos(a)*R,(Math.random()-.3)*14,Math.sin(a)*R)),6.5,1.5,true,true)}carve(c0,R*.8,new V3(0,10,0),22,220);kScatter(c0.clone().setY(0),R+8)}}));
      enemies.forEach(e=>{if(!e.dead&&e.p.distanceTo(c0)<55)hurtEnemy(e,e.kind==='mecha'?600:900,c0)})}}
  function kBreath(dt,held){
    if(held&&!KZ.brOn){if(KZ.en<12&&KZ.brCh<=0){if(!KZ.brWarn){KZ.brWarn=1;H.say('Not enough atomic energy. Smash things to charge up!',1300)}}else{KZ.brCh=Math.min(1,KZ.brCh+dt/.85);if(Math.random()<dt*10)beep(200+KZ.brCh*700,.05,'sine',.03);if(KZ.brCh>=1){KZ.brOn=true;noise(.6,'lowpass',300,.4);sweep(90,600,.5,'sawtooth',.07)}}}
    if(!held){KZ.brOn=false;KZ.brWarn=0;KZ.brCh=Math.max(0,KZ.brCh-dt*2.2)}
    if(KZ.brOn){KZ.en-=dt*19;if(KZ.en<=0){KZ.en=0;KZ.brOn=false;KZ.brCh=0;H.say('Out of atomic energy!',900)}}
    if(!KZ.brOn)return;
    const mouth=headG.localToWorld(MOUTH.clone());const o=camera.position.clone(),cd=new V3();camera.getWorldDirection(cd);const dir=aim(o,cd,520).pt.sub(mouth).normalize();
    const hit=rayV(mouth,dir,520,false);let L=hit?hit.t:520,hitE=null;enemies.forEach(e=>{if(e.dead)return;const t=raySphere(mouth,dir,e.kind==='mecha'?e.p.clone().setY(e.fy+17):e.p,e.r+1);if(t!=null&&t<L){L=t;hitE=e}});
    let hitF=null;props.forEach(q=>{if(q.kind!=='fuel'||q.down)return;const t=raySphere(mouth,dir,new V3(q.x,q.big?3.5:.8,q.z),q.r+1);if(t!=null&&t<L){L=t;hitF=q;hitE=null}});
    const end=mouth.clone().addScaledVector(dir,L);const fl=Math.random();setBeam(kbO,mouth,dir,L,2.2+fl*.6);setBeam(kbM,mouth,dir,L,1.2+fl*.3);setBeam(kbC,mouth,dir,L,.5);kImp.visible=true;kImp.position.copy(end);kImp.scale.setScalar(4+Math.random()*2);cam.shake=Math.max(cam.shake,.3);
    KZ.brAcc+=dt;KZ.brBoom+=dt;while(KZ.brAcc>1/30){KZ.brAcc-=1/30;KZ.brN++;
      if(hitE){hurtEnemy(hitE,6,end);hitMark()}else if(hitF)hurtFuel(hitF,3);else if(hit&&!hit.ground){carve(end,3,dir.clone().multiplyScalar(26).setY(5),10,10);if(KZ.brN%10===0)ignite(end.clone())}else if(hit&&hit.ground&&KZ.brN%8===0)ignite(end.clone().setY(.3));
      if(KZ.brN%3===0)enemies.forEach(e=>{if(e.dead||e===hitE)return;const t=raySphere(mouth,dir,e.p,e.r+2);if(t!=null&&t<L)hurtEnemy(e,6,e.p)});
      if(crowd&&KZ.brN%2===0)crowd.blast(end,5,1);people.forEach(q=>{if(q.st!=='gone'&&q.g.position.distanceTo(end)<6)flingP(q,end.clone().sub(dir),20)});cars.forEach(q=>{if(q.alive&&q.m.position.distanceTo(end)<6)hurtCar(q,40,end)});
      if(KZ.brN%2===0)K.burst(end.clone(),[0x7FE8FF,0xffffff,0x2F8CFF],5,14,.5);if(KZ.brN%3===0){flash(end,3.5);noise(.12,'bandpass',700+Math.random()*400,.1)}}
    if(KZ.brBoom>.32){KZ.brBoom=0;explode(end.clone().addScaledVector(dir,-1),6,1.3,true,true)}
    if(Math.random()<dt*30)K.puff(mouth.clone(),0x9FE8FF,1.5,.4,dir.clone().multiplyScalar(30))}
  /* --- grab & throw: cars, tanks, or a chunk ripped out of a building --- */
  function ripChunk(c0){const list=[];const R=5.5;for(let gx=Math.floor((c0.x-R)/BS);gx<=Math.floor((c0.x+R)/BS);gx++)for(let gz=Math.floor((c0.z-R)/BS);gz<=Math.floor((c0.z+R)/BS);gz++){const B=bAtG(gx,gz);if(!B)continue;for(let gy=Math.max(0,Math.floor((c0.y-R)/BS));gy<=Math.min(B.fh-1,Math.floor((c0.y+R)/BS));gy++){const k=vI(B,gx-B.gx0,gy,gz-B.gz0);if(!B.hp[k])continue;const x=(gx+.5)*BS,y=(gy+.5)*BS,z=(gz+.5)*BS;const d=Math.hypot(x-c0.x,y-c0.y,z-c0.z);if(d<R+2)list.push({B,k,x,y,z,d})}}
    if(list.length<3)return null;list.sort((a,b)=>a.d-b.d);const use=list.slice(0,9);const cx=use.reduce((a,o)=>a+o.x,0)/use.length,cy2=use.reduce((a,o)=>a+o.y,0)/use.length,cz=use.reduce((a,o)=>a+o.z,0)/use.length;const g=new T.Group();
    use.forEach(o=>{const B=o.B;B.hp[o.k]=0;B.alive--;deadBlocks++;stats.blocks++;addScore(1);hideBlock(B,o.k);B.dirty=true;const m=new T.Mesh(boxG,new T.MeshLambertMaterial({map:winTex,color:B.col}));m.position.set(o.x-cx,o.y-cy2,o.z-cz);m.castShadow=true;g.add(m)});g.position.set(cx,cy2,cz);scene.add(g);K.burst(g.position.clone(),[0xd8d0c4,0x8c86a3],14,10,.8);noise(.5,'lowpass',200,.45);return g}
  function grab(){if(KZ.grabCd>0)return;KZ.grabCd=.4;const fw=kFwd();const hp=P.p.clone().addScaledVector(fw,10);let best=null,bd=20,bk='';
    cars.forEach(q=>{if(!q.alive||q.fly)return;const d=Math.hypot(q.m.position.x-hp.x,q.m.position.z-hp.z);if(d<bd){bd=d;best=q;bk='car'}});
    enemies.forEach(e=>{if(e.dead||!GK[e.kind]||e.kind==='boat')return;const d=Math.hypot(e.p.x-hp.x,e.p.z-hp.z);if(d<bd){bd=d;best=e;bk='enemy'}});
    if(!best){const hy=clamp(16+cam.pitch*20,3,30);let g=null;for(const h2 of [hy,hy-6,hy+6,6,24])for(const d2 of [10,14,7]){if(!g&&h2>1)g=ripChunk(P.p.clone().addScaledVector(fw,d2).setY(Math.max(2,P.p.y+h2)))}if(g){KZ.held={m:g,k:'chunk'};H.pow('RIIIP!',g.position.clone().setY(g.position.y+8),'#FFD23F')}else H.say('Nothing to grab. Get close to a car, a tank or a building.',1400);return}
    if(bk==='car'){cars=cars.filter(q=>q!==best);stats.cars++;addScore(8);if(best.fire)scene.remove(best.fire);KZ.held={m:best.m,k:'car'};strikes.push({t:2,fn:()=>cars.push(mkCar())})}
    else{enemies=enemies.filter(x=>x!==best);if(best.mk)scene.remove(best.mk);best.dead=true;stats.enemies++;addScore(40);if(MILK[best.kind])milN++;KZ.held={m:best.m,k:'car'}}
    beep(160,.2,'sawtooth',.06);H.pow('GRABBED!',best.m.position.clone().setY(10),'#FFD23F')}
  function throwHeld(){const h=KZ.held;if(!h)return;KZ.held=null;KZ.grabCd=.4;KZ.swCd=.5;const o=camera.position.clone(),d=new V3();camera.getWorldDirection(d);const tp=aim(o,d,420).pt;const from=h.m.position.clone();const v=tp.sub(from);const L=v.length();v.normalize().multiplyScalar(80);v.y+=Math.min(18,L*.05);projs.push({k:h.k,m:h.m,v,l:6,big:true});sweep(400,120,.35,'sawtooth',.06);noise(.3,'bandpass',500,.2)}
  function kHeldTick(dt){const h=KZ.held;if(!h)return;h.m.position.lerp(armA.hd.localToWorld(new V3(0,-1.5,.6)),Math.min(1,dt*14));h.m.rotation.y+=dt*.8;h.m.rotation.x=Math.sin(KZ.t*2)*.2}
  function chunkBreak(q){q.m.children.forEach(ch=>{const w=ch.getWorldPosition(new V3());spawnDeb(w.x,Math.max(2,w.y),w.z,q.v.x*.3+(Math.random()-.5)*14,6+Math.random()*8,q.v.z*.3+(Math.random()-.5)*14,ch.material.color,BS*.9,BS*.9,BS*.9,14,4)})}
  /* --- movement, camera, death --- */
  function kMove(dt,I,Kk){const mv=K.moveIn();const run=!!(Kk.shift||I.alt)&&!KZ.brOn;const dep=seaD(P.p.z),water=dep>3&&dep<=13;KZ.sw+=((dep>13?1:0)-KZ.sw)*Math.min(1,dt*2);const busy=KZ.stompT>0||KZ.pulseT>0||KZ.roarT>1;const top=((run?30:17)*(1-KZ.sw)+(run?34:22)*KZ.sw)*(water?.8:1)*(busy?.3:1)*(KZ.brOn?.5:1);
    const k=Math.min(1,dt*2.6);P.v.x+=(mv.x*top-P.v.x)*k;P.v.z+=(mv.z*top-P.v.z)*k;P.v.y=0;
    if(KZ.tailT>0){KZ.yaw+=KZ.spin*(Math.PI*2/.95)*dt;KZ.tailT-=dt}else{let dy=cam.yaw+Math.PI-KZ.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));const rate=KZ.brOn?1.2:2;KZ.yaw+=clamp(dy,-rate*dt,rate*dt)}
    KZ.fx=Math.sin(KZ.yaw);KZ.fz=Math.cos(KZ.yaw);
    P.p.x=clamp(P.p.x+P.v.x*dt,-HALF-45,HALF+45);P.p.z=clamp(P.p.z+P.v.z*dt,-HALF-45,SHORE+150);P.p.y+=((-dep)*(1-KZ.sw)+(-12)*KZ.sw-P.p.y)*Math.min(1,dt*3);P.ground=true;
    const hs=Math.hypot(P.v.x,P.v.z);if(KZ.sw>.5&&hs>2){if(Math.random()<dt*14){const hd=P.p.clone().addScaledVector(new V3(KZ.fx,0,KZ.fz),14);K.puff(new V3(hd.x+(Math.random()-.5)*8,.6,hd.z+(Math.random()-.5)*8),0xffffff,3+Math.random()*3,1.1,new V3((Math.random()-.5)*8,4,(Math.random()-.5)*8))}if(Math.random()<dt*3)K.ring(new V3(P.p.x,.5,P.p.z),0xffffff,4,18,1)}
    if((water||KZ.sw>.5)&&hs>1&&Math.random()<dt*8)K.puff(new V3(P.p.x+(Math.random()-.5)*10,.6,P.p.z+(Math.random()-.5)*10),0xe8f4ff,3+Math.random()*3,1.2,new V3(0,3,0))}
  function kCam(rdt){const fw=new V3(-Math.sin(cam.yaw),0,-Math.cos(cam.yaw)),rt=new V3(-fw.z,0,fw.x);const hs=Math.hypot(P.v.x,P.v.z);const tgt=P.p.clone();tgt.y=Math.max(P.p.y+20,10);tgt.addScaledVector(rt,11);cam.solid=null;cam.place(tgt,rdt,44+hs*.35,9,7);
    const fv=62+clamp(hs-14,0,14)*.6;if(Math.abs(camera.fov-fv)>.2){camera.fov+=(fv-camera.fov)*Math.min(1,rdt*3);camera.updateProjectionMatrix()}}
  function kaijuDown(){KZ.deadT=0;KZ.fell=false;KZ.fallDir=Math.random()<.5?-1:1;KZ.brOn=false;KZ.brCh=0;if(KZ.held){scene.remove(KZ.held.m);KZ.held=null}sweep(300,40,2.5,'sawtooth',.1);noise(2,'lowpass',100,.5);H.pow('THE MONSTER FALLS!',P.p.clone().setY(P.p.y+36),'#F2352A')}
  function kDeadTick(dt){KZ.deadT+=dt;const u=clamp(KZ.deadT/1.7,0,1);KG.rotation.z=KZ.fallDir*u*u*1.5;
    if(u>=1&&!KZ.fell){KZ.fell=true;const side=new V3(Math.cos(KZ.yaw),0,-Math.sin(KZ.yaw)).multiplyScalar(-KZ.fallDir);for(let k=1;k<=7;k++)carve(P.p.clone().addScaledVector(side,k*4.3).setY(Math.max(P.p.y,0)+3),5.5,side.clone().multiplyScalar(8).setY(-3),10,70);const imp=P.p.clone().addScaledVector(side,18).setY(Math.max(0,P.p.y));kShockFx(imp,26);kScatter(imp,26);cam.shake=2.4;noise(2.5,'lowpass',50,.8);H.pow('KA-THOOOM!',imp.clone().setY(20),'#FFD23F')}}
  function kRespawn(){P.alive=true;P.hp=KZ.maxHP;P.dead=0;KG.rotation.z=0;KZ.fell=false;P.p.set(lineAt(3),0,SHORE+60);P.p.y=-seaD(P.p.z);P.v.set(0,0,0);KZ.yaw=Math.PI;cam.yaw=0;heat=Math.min(heat,1);enemies.forEach(e=>{scene.remove(e.m);if(e.mk)scene.remove(e.mk)});enemies=[];eShots.forEach(s2=>scene.remove(s2.m));eShots=[];KZ.bossT=200;KZ.landed=false;tailReset();H.say('The monster rises again from the bay…',2200)}
  function kIdle(rdt){if(!KG)return;if(!built){props=[];genCity();buildLamps();built=true}if(!KZ.init){KZ.init=true;P.p.set(lineAt(3),0,SHORE+70);P.p.y=-seaD(P.p.z);KZ.yaw=Math.PI;tailReset()}
    KG.visible=true;HR.visible=false;KG.position.copy(P.p);KG.rotation.y=KZ.yaw;KZ.t+=rdt;P.v.set(0,0,0);kbHide();kAnim(rdt,false);KG.updateMatrixWorld(true);tailTick(rdt);cam.place(P.p.clone().setY(Math.max(P.p.y+22,12)),rdt,95,14,2)}
  function kaijuFrame(dt,rdt,now,I,Kk){KZ.t+=dt;kbHide();if(wTex){wTex.offset.x+=dt*.01;wTex.offset.y+=dt*.004}if(foam)foam.material.opacity=.4+Math.sin(KZ.t*1.3)*.15;
    if(tap.g){setQ(!hiQ);H.say('Graphics: '+(hiQ?'HIGH (shadows on)':'FAST (shadows off)'),1200)}
    KZ.flashT-=dt;
    if(!P.alive){P.dead-=rdt;kDeadTick(dt);P.v.set(0,0,0);kAnim(dt,false);KG.position.copy(P.p);KG.updateMatrixWorld(true);tailTick(dt);kCam(rdt);if(P.dead<=0&&F.free)respawn();return}
    const fire=!!(I.down||I.fire||Kk.j),brK=!!(Kk.r||I.right||I.det);const eg=(b,key)=>{const v=!!b,r=v&&!KZ[key];KZ[key]=v;return r};
    const stompK=!!tap[' ']||eg(I.jumpBtn,'jL'),tailK=!!tap.q||eg(I.strike,'sL'),roarK=!!tap.f||eg(I.slamb,'rL'),grabK=!!tap.e||eg(I.wnext,'gL'),pulseK=!!tap.x||eg(I.dn,'pL');
    KZ.swCd-=dt;KZ.tailCd-=dt;KZ.stompCd-=dt;KZ.roarCd-=dt;KZ.grabCd-=dt;
    kMove(dt,I,Kk);KG.visible=true;KG.position.copy(P.p);KG.rotation.y=KZ.yaw;kAnim(dt,true);KG.updateMatrixWorld(true);tailTick(dt);kBody();kTailHits();
    if(fire&&KZ.swCd<=0){if(KZ.held)throwHeld();else if(KZ.stompT<=0&&KZ.pulseT<=0)startSwipe()}
    if(tailK)startTail();if(stompK)startStomp();if(roarK)startRoar();if(grabK){if(KZ.held)throwHeld();else grab()}if(pulseK)startPulse();
    kSwipeTick(dt);kStompTick(dt);kRoarTick(dt);kPulseTick(dt);kBreath(dt,brK&&KZ.pulseT<=0);kHeldTick(dt);
    if(KZ.debHit>=3){hurt(Math.min(12,KZ.debHit*.4),null);KZ.debHit=0;KZ.flinch=Math.max(KZ.flinch,.2)}
    if(P.hp<KZ.maxHP*.25&&!KZ.lowWarn){KZ.lowWarn=true;H.say('⚠️ The monster is badly hurt. Stay out of the fight for 6 seconds to regenerate.',2400)}if(P.hp>KZ.maxHP*.5)KZ.lowWarn=false;
    kCam(rdt)}
  function kHud(){const pct=totalBlocks?deadBlocks/totalBlocks*100:0;hpB(P.hp/KZ.maxHP,'HEALTH '+Math.ceil(P.hp)+' / '+KZ.maxHP);jtB(KZ.en/100,'ATOMIC ENERGY '+Math.round(KZ.en)+'%'+(KZ.brOn?' · FIRING':KZ.brCh>0?' · CHARGING…':' · hold [R] or right-click')+(KZ.en>=70?' · [X] PULSE READY':''));
    const cd=v=>v>0?Math.ceil(v)+'s':'ready';wpB(KZ.roarCd>0?1-KZ.roarCd/14:1,'[Q] TAIL '+cd(KZ.tailCd)+' · [F] ROAR '+cd(KZ.roarCd)+' · [E] '+(KZ.held?'THROW':'GRAB'));
    stars.textContent='★'.repeat(Math.floor(heat))+'☆'.repeat(5-Math.floor(heat));H.score(Math.floor(score),'damage');c.stat('Kaiju Rampage · '+kMoney(score)+' damage · '+Math.floor(pct)+'% leveled');
    if(F.free&&Math.floor(score/100)>KZ.lastBest){KZ.lastBest=Math.floor(score/100);c.best(Math.floor(score))}
    const dots=[];enemies.forEach(e=>{if(!e.dead)dots.push({x:e.p.x,z:e.p.z,col:e.kind==='mecha'?'#FFD23F':'#F2352A',r:e.kind==='mecha'?9:e.kind==='tank'?6:4})});kSubs.forEach(q=>{if(!q.down)dots.push({x:q.x,z:q.z,col:'#7FE8FF',r:6})});
    rad(P.p.x,P.p.z,cam.yaw,dots,blds.filter(B=>B.alive>B.total*.25).map(B=>({x0:B.gx0*BS,x1:(B.gx0+B.fx)*BS,z0:B.gz0*BS,z1:(B.gz0+B.fz)*BS,cx:(B.gx0+B.fx/2)*BS,cz:(B.gz0+B.fz/2)*BS})));
    const IC={cop:'🚓',heli:'🚁',tank:'🛡️',fjet:'✈️',mlrs:'🚀',boat:'🚢'};let nt=null,nd=1e9;enemies.forEach(e=>{if(e.dead||!IC[e.kind])return;const d=e.p.distanceTo(P.p);if(d<nd){nd=d;nt=e}});threatPtr(nt?nt.p.clone().add(new V3(0,4,0)):null,nt?IC[nt.kind]+' '+Math.round(nd)+'m':'');
    const bm=enemies.find(e=>e.kind==='mecha'&&!e.dead&&e.st!=='drop');bossBar.style.display=bm?'block':'none';if(bm){bossBar.querySelector('.bf').style.width=(bm.hp/bm.max*100)+'%';bossBar.querySelector('.bn').textContent='MECHA-KAIJU'+(bm.phase>1?' · OVERDRIVE':'')+(bm.stag>0?' · STAGGERED!':'')}}
  /* --- military --- */
  function kSpawn(dt){const st=Math.floor(heat);KZ.spT-=dt;if(KZ.spT>0)return;KZ.spT=2.2;const want={cop:st<2?2:1,tank:st>=1?Math.min(6,st+1):0,heli:st>=1?Math.min(4,st):0,mlrs:st>=2?Math.min(3,st-1):0,fjet:st>=3?Math.min(3,st-2):0};
    if(vmi===3){want.tank=Math.min(want.tank,2);want.heli=Math.min(want.heli,2);want.mlrs=0;want.fjet=0}const cnt=k=>enemies.filter(e=>e.kind===k&&!e.dead).length;
    for(const k of ['cop','tank','heli','mlrs','fjet']){if(cnt(k)<want[k]){enemies.push(k==='cop'?mkCop():k==='tank'?mkTank():k==='heli'?mkHeli(0x56643a):k==='mlrs'?mkMLRS():mkFJet());const msg={tank:'🛡️ Tanks rolling in!',heli:'🚁 Attack helicopters inbound!',mlrs:'🚀 Missile trucks deployed!',fjet:'✈️ Fighter jets scrambled!'}[k];if(msg&&Math.random()<.6)H.say(msg,1400);break}}}
  function mkMLRS(){const g=new T.Group();const Gm=TM(0x6b7a3a),Dk=TM(0x2b2b33);part(T,bx(T,3,1.6,7.5),Gm,0,1.3,0,g);part(T,bx(T,2.8,1.6,2.2),Gm,0,2.8,2.6,g);part(T,bx(T,2.6,.5,1),TM(0x9fd6ff),0,2.9,3.72,g);[-1.6,1.6].forEach(x0=>[-2.4,0,2.4].forEach(z0=>part(T,cy(T,.6,.6,.5,10),Dk,x0,.6,z0,g).rotation.z=Math.PI/2));
    const pod=new T.Group();pod.position.set(0,2.4,-1.6);g.add(pod);part(T,bx(T,2.6,1.6,3.6),Gm,0,.8,0,pod);for(let i=0;i<6;i++)part(T,cy(T,.25,.25,.1,8),Dk,-.8+(i%3)*.8,.4+Math.floor(i/3)*.8,1.82,pod).rotation.x=Math.PI/2;
    K.ink(g,.05);g.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(g);const s=streetPt(150,230);const kx=Math.round((s.x+HALF)/CELL),kz=Math.round((s.z+HALF)/CELL);g.position.set(s.ax==='z'?lineAt(kx)+3:s.x,0,s.ax==='z'?s.z:lineAt(kz)-3);const e={kind:'mlrs',m:g,p:g.position,r:4,hp:260,cd:5,ax:s.ax,dir:1,sp:11,pod};addMarker(e,'🚀');return e}
  function mkFJet(){const g=new T.Group();const Gm=TM(0x7a8494);part(T,bx(T,1.4,1.1,8),Gm,0,0,0,g);part(T,new T.ConeGeometry(.7,2.4,8),Gm,0,0,5.1,g).rotation.x=Math.PI/2;part(T,bx(T,10,.2,3),Gm,0,0,-1,g);part(T,bx(T,4,.18,1.6),Gm,0,0,-3.6,g);[-.7,.7].forEach(x0=>part(T,bx(T,.18,1.8,1.6),Gm,x0,1,-3.4,g).rotation.z=x0*.5);part(T,sp(T,.5),TM(0x2a3a4a),0,.6,2,g).scale.set(1,.7,2);const fl=part(T,sp(T,.55),glowM(0xFFB02A),0,0,-4.3,g);fl.userData.noInk=1;K.ink(g,.05);scene.add(g);
    const a=Math.random()*6.283;g.position.set(P.p.x+Math.cos(a)*420,70+Math.random()*30,P.p.z+Math.sin(a)*420);const e={kind:'fjet',m:g,p:g.position,r:5,hp:90,v:new V3(-Math.cos(a),0,-Math.sin(a)).multiplyScalar(110),st:'in',t:0,fired:0,fT:0};addMarker(e,'✈️');sweep(300,1200,1.5,'sawtooth',.04);return e}
  function mkBoat(a){const g=new T.Group();const Gy=TM(0x6a7280),Dk=TM(0x3a3f4d);part(T,bx(T,4.2,2,16),Gy,0,.6,0,g);const bow=part(T,new T.ConeGeometry(2.1,4,4),Gy,0,.6,9.8,g);bow.rotation.set(Math.PI/2,Math.PI/4,0);part(T,bx(T,3,2.6,5),Gy,0,2.8,-2,g);part(T,bx(T,1.2,4,1.2),Dk,0,5,-2.6,g);
    const tur=new T.Group();tur.position.set(0,2,4.5);g.add(tur);part(T,bx(T,2,1,2),Dk,0,.4,0,tur);part(T,cy(T,.15,.15,3,6),Dk,0,.5,1.6,tur).rotation.x=Math.PI/2;K.ink(g,.05);scene.add(g);
    g.position.set(P.p.x+Math.cos(a)*90,.2,Math.max(SHORE+25,P.p.z+Math.sin(a)*90));const e={kind:'boat',m:g,p:g.position,r:6,hp:300,cd:2+Math.random()*2,ang:a,tur};addMarker(e,'🚢');return e}
  function kTickEnemy(e,dt,now,d){e.tailCd=(e.tailCd||0)-dt;const p=e.p;
    if(e.kind==='mecha'){tickMecha(e,dt,now);e.m.visible=true;return true}
    if(e.stun>0&&e.kind!=='fjet'){e.stun-=dt;if(Math.random()<dt*5)K.burst(p.clone().setY(p.y+(e.mkH||4)),[0xFFD23F,0xffffff],3,3,.4);if(e.kind==='heli'){p.y=Math.max(20,p.y-dt*4);e.m.rotation.y+=dt*4;e.rot.rotation.y+=dt*10}return true}
    if(e.kind==='heli'){e.ang+=dt*.25;const R=62+Math.sin(now/3000+e.ang)*18;const goal=new V3(P.p.x+Math.cos(e.ang)*R,Math.max(34,P.p.y+40)+Math.sin(now/1700)*5,P.p.z+Math.sin(e.ang)*R);const dv=goal.sub(p);const L=dv.length();e.v.lerp(dv.multiplyScalar(L>1?Math.min(40,L)/L:0),Math.min(1,dt*1.2));p.addScaledVector(e.v,dt);e.m.rotation.y=Math.atan2(P.p.x-p.x,P.p.z-p.z);e.rot.rotation.y+=dt*28;e.cd-=dt;
      if(e.cd<=0&&P.alive&&d<220){e.cd=c.pick(2.4,1.8,1.3);eShoot(p.clone().add(new V3(0,-1.5,0)),Math.random()<.5?'missile':'rocket')}if(Math.random()<dt*4&&d<160)eShoot(p.clone().add(new V3(0,-1.5,0)),'bullet');if(solidW(p.x,p.y,p.z))hurtEnemy(e,999,p);return true}
    if(e.kind==='fjet'){const tg=kChest();const to=tg.clone().sub(p);const L=to.length();e.fT-=dt;
      if(e.st==='in'){e.v.lerp(to.normalize().multiplyScalar(115),Math.min(1,dt*.9));if(L<230&&L>90&&e.fired<2&&e.fT<=0){e.fT=.35;e.fired++;eShoot(p.clone(),'missile')}if(L<75){e.st='out';e.t=4.5;e.fired=0;e.v.copy(p.clone().sub(tg).setY(0).normalize().multiplyScalar(115)).setY(45);sweep(900,300,1,'sawtooth',.04)}}
      else{e.t-=dt;e.v.y*=Math.pow(.5,dt);e.v.addScaledVector(new V3(-e.v.z,0,e.v.x).normalize(),dt*40);e.v.setLength(115);if(p.y<55)e.v.y+=dt*40;if(e.t<=0)e.st='in'}
      p.addScaledVector(e.v,dt);if(p.y<14)p.y=14;e.m.lookAt(p.clone().add(e.v));if(solidW(p.x,p.y,p.z))hurtEnemy(e,999,p);return true}
    if(e.kind==='mlrs'){driveTo(e,dt,150);const a=Math.atan2(P.p.x-p.x,P.p.z-p.z)-e.m.rotation.y;e.pod.rotation.y+=(Math.atan2(Math.sin(a),Math.cos(a))-e.pod.rotation.y)*Math.min(1,dt*2);e.pod.rotation.x=-.5;e.cd-=dt;
      if(e.cd<=0&&d<340&&P.alive){e.cd=c.pick(10,8,6);for(let i=0;i<6;i++)strikes.push({t:i*.2,fn:()=>{if(e.dead)return;const tp=e.pod.localToWorld(new V3((i%3-1)*.8,1.2,2));eShoot(tp,'missile');K.puff(tp.clone(),0xd8d0c4,2,1.2)}});if(Math.random()<.5)H.say('🚀 Missile barrage incoming!',1000)}return true}
    if(e.kind==='boat'){e.ang+=dt*.1;const goal=new V3(P.p.x+Math.cos(e.ang)*80,0,Math.max(SHORE+24,P.p.z+Math.sin(e.ang)*80));const dv=goal.sub(p).setY(0);const L=dv.length();if(L>2){let dy=Math.atan2(dv.x,dv.z)-e.m.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));e.m.rotation.y+=clamp(dy,-.6*dt,.6*dt);const s2=Math.min(10,L);p.x+=Math.sin(e.m.rotation.y)*s2*dt;p.z+=Math.cos(e.m.rotation.y)*s2*dt}
      p.z=Math.max(SHORE+18,p.z);p.y=.2+Math.sin(now/600+e.ang*3)*.25;e.m.rotation.z=Math.sin(now/700+e.ang)*.05;e.tur.rotation.y=Math.atan2(P.p.x-p.x,P.p.z-p.z)-e.m.rotation.y;e.cd-=dt;
      if(e.cd<=0&&d<260&&P.alive){e.cd=c.pick(4,3,2.3);const tp=e.tur.localToWorld(new V3(0,.5,3.2));eShoot(tp,'shell');K.burst(tp.clone(),[0xFFE27A,0x3a3552],8,6,.5)}if(Math.random()<dt*3)K.puff(p.clone().add(new V3(-Math.sin(e.m.rotation.y)*8,.4,-Math.cos(e.m.rotation.y)*8)),0xffffff,1.5,1);return true}
    return undefined}
  /* --- substations (Power Hungry + free roam energy) --- */
  function mkSub(x,z){const g=new T.Group();part(T,bx(T,14,.6,14),TM(0x9a948a),0,.3,0,g);const coil=glowM(0x7FE8FF);[[-3.5,-3.5],[3.5,-3.5],[-3.5,3.5],[3.5,3.5]].forEach(([a,b])=>{part(T,bx(T,3.4,4.4,3),TM(0x6f7d8c),a,2.8,b,g);for(let k=0;k<3;k++)part(T,cy(T,.35,.35,2.2,8),coil,a-1+k,6,b,g).userData.noInk=1});
    [-6,6].forEach(a=>{part(T,bx(T,.5,12,.5),TM(0x3a3f4d),a,6,0,g);part(T,bx(T,5,.4,.4),TM(0x3a3f4d),a,11,0,g)});const glow=part(T,sp(T,2.2),glowM(0x7FE8FF),0,3,0,g);glow.userData.noInk=1;K.ink(g,.06);g.position.set(x,.3,z);scene.add(g);
    const q={g,x,z,down:false,kind:'fuel',big:true,sub:true,hp:80,r:7,glow};props.push(q);kSubs.push(q);return q}
  function placeSubs(n){const used=[];let guard=0;while(used.length<n&&guard++<300){const i=1+rand(N-1),j=1+rand(N-1);if(used.some(([a,b])=>Math.abs(a-i)+Math.abs(b-j)<2))continue;used.push([i,j])}used.forEach(([i,j])=>mkSub(lineAt(i),lineAt(j)))}
  function onSub(q){subN++;const pt=new V3(q.x,6,q.z);for(let k=0;k<4;k++)strikes.push({t:k*.12,fn:()=>bolt(pt.clone().add(new V3((Math.random()-.5)*6,Math.random()*4,(Math.random()-.5)*6)),kChest())});KZ.en=100;KZ.maxHP+=100;P.hp=Math.min(KZ.maxHP,P.hp+250);KZ.flashT=1.4;H.pow('POWER ABSORBED!',pt.clone().setY(30),'#7FE8FF');sweep(300,1600,.8,'sine',.07);if(q.glow)q.glow.visible=false}
  /* --- boss: Mecha-Kaiju --- */
  function mkMecha(){const g=new T.Group();g.rotation.order='YXZ';const St=TM(0x9aa3b5),Dk=TM(0x3a3f4d),Rd=TM(0xC8202E),Yl=TM(0xFFD23F),coreM=glowM(0x7FE8FF),visM=glowM(0xFF2A2A);
    const hip=new T.Group();hip.position.y=12;g.add(hip);part(T,bx(T,7.5,3,5),Dk,0,0,0,hip);
    const legs=[1,-1].map(s=>{const th=new T.Group();th.position.set(s*3,-1,0);hip.add(th);part(T,bx(T,2.8,5.6,3.2),St,0,-2.8,0,th);part(T,bx(T,3.3,1.2,3.7),Rd,0,-.6,0,th);const kn=new T.Group();kn.position.y=-5.6;th.add(kn);part(T,sp(T,1.6),Dk,0,0,0,kn);part(T,bx(T,2.6,4.2,2.8),St,0,-2.3,0,kn);part(T,bx(T,3.8,1.3,6),Dk,0,-4.75,.9,kn);return{th,kn}});
    const tr=new T.Group();tr.position.y=1.5;hip.add(tr);part(T,bx(T,9,8,6),St,0,4.6,0,tr);part(T,bx(T,9.3,2.2,6.3),Rd,0,7.6,0,tr);part(T,bx(T,6,3,1),Dk,0,2.2,3.1,tr);const core=part(T,cy(T,1.7,1.7,.5,20),coreM,0,4.8,3.2,tr);core.rotation.x=Math.PI/2;core.userData.noInk=1;
    [-2.4,2.4].forEach(x0=>part(T,bx(T,3,4,2.2),Dk,x0,5,-3.9,tr));const fl=[-2.4,2.4].map(x0=>{const f=part(T,new T.ConeGeometry(1.2,5,10),glowM(0xFFB02A),x0,.4,-3.9,tr);f.rotation.x=Math.PI;f.userData.noInk=1;f.visible=false;return f});
    const arms=[1,-1].map(s=>{part(T,bx(T,3.6,3,4.2),Rd,s*6.1,8.3,0,tr);[-1,1].forEach(z0=>part(T,cy(T,.45,.45,1.4,8),Dk,s*6.1,10.3,z0*1.1,tr));const sh=new T.Group();sh.position.set(s*6.1,7.2,0);sh.rotation.order='YXZ';tr.add(sh);part(T,bx(T,2.2,4.6,2.2),St,0,-2.3,0,sh);const el2=new T.Group();el2.position.y=-4.6;sh.add(el2);part(T,sp(T,1.3),Dk,0,0,0,el2);part(T,cy(T,1.4,1.6,4.4,10),Dk,0,-2.2,0,el2);part(T,bx(T,2.8,2.8,2.8),St,0,-5.1,0,el2);return{sh,el:el2}});
    const head=new T.Group();head.position.set(0,9.4,.4);tr.add(head);part(T,bx(T,3.6,2.8,3.4),St,0,1.3,0,head);const vis=part(T,bx(T,3,.7,.3),visM,0,1.5,1.75,head);vis.userData.noInk=1;[-1.9,1.9].forEach(x0=>part(T,bx(T,.4,2.2,1.6),Yl,x0,2.4,-.2,head));
    K.ink(g,.1);g.scale.setScalar(1.12);g.traverse(o=>{if(o.isMesh)o.castShadow=hiQ});scene.add(g);
    const dir=new V3(-P.p.x,0,-P.p.z);if(dir.length()<30)dir.set(Math.random()-.5,0,Math.random()-.5);dir.normalize();const x=clamp(P.p.x+dir.x*105,-HALF+20,HALF-20),z=clamp(P.p.z+dir.z*105,-HALF+20,HALF-20);
    const hp0=c.pick(3600,5000,6600);const e={kind:'mecha',m:g,p:new V3(x,207,z),fy:190,r:9,hp:hp0,max:hp0,st:'drop',t:0,kv:new V3(),yaw:Math.atan2(P.p.x-x,P.p.z-z),ph:0,pc:1,cd:3,stag:0,legs,arms,tor:tr,hip,core,vis,fl,phase:1,n:0,bd:new V3(0,0,1),dying:null,lv:new V3(),vy:0};g.position.set(x,190,z);addMarker(e,'🤖');e.mkH=20;H.say('⚠️ Something huge is falling from the sky…',2200);sweep(1400,200,2.5,'sawtooth',.05);return e}
  function mechaSync(e){e.m.position.set(e.p.x,e.fy,e.p.z);e.p.y=e.fy+17;e.m.rotation.y=e.yaw}
  function mCarve(e,v){e.m.updateMatrixWorld(true);let n=0;for(const[o,l,r]of [[e.hip,[0,0,0],5],[e.tor,[0,4.6,0],5.5],[e.tor,[0,8,0],5],[e.legs[0].kn,[0,-2,0],2.8],[e.legs[1].kn,[0,-2,0],2.8]])n+=carve(o.localToWorld(new V3(l[0],l[1],l[2])),r*1.12,v,5,50);return n}
  function mShock(pt,R){kShockFx(pt,R);carve(pt.clone().setY(2),8,new V3(0,9,0),14,140);groundDmg(pt,R,.85);kScatter(pt,R);const aw=P.p.clone().sub(pt).setY(0);if(aw.length()<R+6){hurt(40,'The shockwave knocks you back!');P.v.addScaledVector(aw.normalize(),14);KZ.flinch=.8}}
  function mDone(e){e.st='walk';e.cd=c.pick(3.4,2.6,1.9)/(e.phase>1?1.35:1)}
  function mChoose(e,hd){if(hd<30){e.st='punch';e.t=.75;e.arm=Math.random()<.5?0:1;noise(.4,'highpass',900,.1)}
    else if(hd<120){if(Math.random()<.45){e.st='laserT';e.t=1.1;e.bd.copy(kChest().sub(e.core.getWorldPosition(new V3())).normalize());sweep(200,1400,1.1,'sine',.05);H.say('⚠️ Chest laser charging! Get out of the line!',1100)}else{e.st='rockets';e.t=0;e.n=e.phase>1?14:10}}
    else{e.st='leap';const tg=P.p.clone().addScaledVector(new V3(P.p.x-e.p.x,0,P.p.z-e.p.z).normalize(),-22);e.lv.set((tg.x-e.p.x)/1.7,0,(tg.z-e.p.z)/1.7);e.vy=25.5;H.say('⚠️ The Mecha is rocket-jumping at you!',1100)}}
  function mechaHit(e,d,from){if(e.dying!=null||e.dead)return;if(e.st==='drop')d*=.25;if(e.stag>0)d*=1.5;const q0=Math.ceil(e.hp/e.max*4);e.hp-=d;e.flash=.1;KZ.en=Math.min(100,KZ.en+d*.004);if(Math.random()<.3)K.burst((from||e.p).clone(),[0xFFD23F,0xffffff,0x7FE8FF],6,10,.4);
    if(e.hp<=0){e.hp=0;e.dying=0;e.st='dying';H.pow('IT’S GOING DOWN!',e.p.clone().setY(e.fy+38),'#FFD23F');return}
    if(Math.ceil(e.hp/e.max*4)<q0){e.stag=2.2;H.pow('STAGGERED!',e.p.clone().setY(e.fy+36),'#FFD23F');noise(.8,'lowpass',160,.5)}
    if(e.phase===1&&e.hp<e.max*.5){e.phase=2;H.pow('OVERDRIVE!',e.p.clone().setY(e.fy+38),'#F2352A');H.say('⚠️ The Mecha-Kaiju is in overdrive: faster attacks, bigger salvos!',1800)}}
  function mechaAnim(e,dt,mv){e.ph+=dt*mv*.45;const s=Math.sin(e.ph),co=Math.cos(e.ph),a=Math.min(1,mv/6);e.legs[0].th.rotation.x=s*.45*a;e.legs[1].th.rotation.x=-s*.45*a;e.legs[0].kn.rotation.x=Math.max(0,-co)*.7*a;e.legs[1].kn.rotation.x=Math.max(0,co)*.7*a;e.hip.position.y=12+Math.abs(co)*.4*a;
    if(mv>0&&Math.sign(co)!==Math.sign(e.pc)){cam.shake=Math.max(cam.shake,clamp(.8-Math.hypot(P.p.x-e.p.x,P.p.z-e.p.z)/200,0,.8));noise(.3,'lowpass',70,.35);K.ring(new V3(e.p.x,.3,e.p.z),0xcfc6b8,2,8,.5);kCrush(new V3(e.p.x,0,e.p.z),6,false)}e.pc=co;
    e.arms.forEach((A,i)=>{let rx=-s*.3*a*(i?-1:1)-.1;if(e.st==='punch'&&e.arm===i)rx=.9*clamp(1-e.t/.75,0,1);else if(e.st==='recover'&&e.arm===i)rx=-1.65;else if(e.st==='rockets')rx=-.5;A.sh.rotation.set(rx,0,(i?-1:1)*.12);A.el.rotation.x=e.st==='punch'&&e.arm===i?-.9:e.st==='recover'&&e.arm===i?0:-.35});
    e.core.material.color.setHex(e.st==='laserT'||e.st==='laser'?0xFF3A22:e.phase>1?0xFF7A2A:0x7FE8FF)}
  function tickMecha(e,dt,now){const p=e.p;const dx=P.p.x-p.x,dz=P.p.z-p.z;const hd=Math.hypot(dx,dz)||1;const fw=new V3(dx/hd,0,dz/hd);e.t-=dt;e.stag-=dt;e.fl.forEach(f=>f.visible=false);
    if(e.dying!=null){e.dying+=dt;if(e.dying<2.2){if(Math.random()<dt*9){e.m.updateMatrixWorld(true);const q=e.tor.localToWorld(new V3((Math.random()-.5)*9,Math.random()*10,(Math.random()-.5)*6));explode(q,4,.6,true,true);K.burst(q,[0xFFD23F,0x7FE8FF,0xffffff],10,10,.5)}e.m.rotation.z=Math.sin(e.dying*25)*.02}
      else{const u=clamp((e.dying-2.2)/1.1,0,1);e.m.rotation.x=-u*u*1.45;if(u>=1&&!e.crashed){e.crashed=true;const bk=new V3(-Math.sin(e.yaw),0,-Math.cos(e.yaw));for(let k=1;k<=7;k++){const q=new V3(p.x,3,p.z).addScaledVector(bk,k*4.2);carve(q,6,bk.clone().multiplyScalar(10).setY(-4),12,90);if(k%2)explode(q.clone().setY(4),7,1.4,true,true)}
        kShockFx(new V3(p.x,0,p.z).addScaledVector(bk,14),26);H.pow('MECHA-KAIJU DESTROYED!',p.clone().setY(40),'#FFD23F');e.dead=true;e.t=1e9;stats.enemies++;milN++;addScore(600);KZ.en=100;KZ.bossDown=true;e.vis.material.color.setHex(0x333333);e.core.material.color.setHex(0x333333);slowT=Math.max(slowT,1.2);noise(3,'lowpass',60,.8)}}mechaSync(e);return}
    if(e.st==='drop'){e.fy-=dt*(e.fy>30?60:26);e.fl.forEach(f=>{f.visible=true;f.scale.set(1,1+Math.random()*.6,1)});if(Math.random()<dt*25)K.puff(new V3(p.x,e.fy+10,p.z),0xFFB02A,3,.6,new V3(0,-20,0));const gy=-seaD(p.z);if(e.fy<=gy){e.fy=gy;e.st='walk';e.cd=2.5;mechaSync(e);mShock(new V3(p.x,gy,p.z),24);H.pow('MECHA-KAIJU HAS LANDED!',p.clone().setY(36),'#F2352A')}mechaSync(e);return}
    if(e.kv.lengthSq()>.25){p.x+=e.kv.x*dt;p.z+=e.kv.z*dt;e.kv.multiplyScalar(Math.pow(.12,dt));mechaSync(e);mCarve(e,e.kv.clone().multiplyScalar(1.2).setY(3))}
    if(e.st!=='leap'){const gy=-seaD(p.z);e.fy+=(gy-e.fy)*Math.min(1,dt*3)}
    if(e.stag>0){e.m.rotation.x=-.28*Math.sin(Math.min(1,e.stag/1.8)*Math.PI);e.vis.visible=Math.sin(now/60)>0;if(Math.random()<dt*8)K.burst(p.clone().setY(e.fy+36),[0xFFD23F,0xffffff],3,4,.5);if(e.st!=='leap'){mechaAnim(e,dt,0);mechaSync(e);return}}
    e.m.rotation.x*=Math.pow(.02,dt);e.vis.visible=true;
    if(e.stun>0&&e.st!=='leap'){e.stun-=dt;mechaAnim(e,dt,0);mechaSync(e);return}
    const sp2=e.phase>1?1.3:1;let dy=Math.atan2(dx,dz)-e.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));const tr=e.st==='laser'?.45:1.5*sp2;e.yaw+=clamp(dy,-tr*dt,tr*dt);let mv=0;e.cd-=dt;
    if(e.st==='walk'){if(hd>18){mv=6.5*sp2;p.x+=fw.x*mv*dt;p.z+=fw.z*mv*dt}if(e.cd<=0)mChoose(e,hd)}
    else if(e.st==='punch'){if(hd>18){mv=9;p.x+=fw.x*mv*dt;p.z+=fw.z*mv*dt}if(e.t<=0){e.st='recover';e.t=.55;e.m.updateMatrixWorld(true);const fist=e.arms[e.arm].el.localToWorld(new V3(0,-5,0));
        if(hd<31){hurt(e.phase>1?70:55,'CRUNCH! The Mecha lands a punch!');P.v.addScaledVector(fw,24);KZ.flinch=1;cam.shake=Math.max(cam.shake,1.5);H.pow('CRUNCH!',kChest().setY(P.p.y+30),'#F2352A');noise(.6,'lowpass',180,.6)}else{carve(fist,5,fw.clone().multiplyScalar(20),10,40);noise(.4,'lowpass',200,.4)}}}
    else if(e.st==='recover'){if(e.t<=0)mDone(e)}
    else if(e.st==='rockets'){if(e.t<=0&&e.n>0){e.t=.11;e.n--;const s=e.n%2?1:-1;e.m.updateMatrixWorld(true);const from=e.tor.localToWorld(new V3(s*6.1,10.8,0));eShoot(from,'missile');K.puff(from.clone(),0xd8d0c4,2,1)}if(e.n<=0&&e.t<=0)mDone(e)}
    else if(e.st==='laserT'||e.st==='laser'){e.m.updateMatrixWorld(true);const o=e.core.getWorldPosition(new V3());e.bd.lerp(kChest().sub(o).normalize(),Math.min(1,dt*(e.st==='laser'?.9*sp2:3))).normalize();const h=rayV(o,e.bd,300,true);const Lb=h?h.t:300;const end=o.clone().addScaledVector(e.bd,Lb);
      if(e.st==='laserT'){tracer(o,end,0xFF2A2A,.8+Math.random()*.5,.05);e.core.scale.setScalar(1+Math.random()*.4+(1.1-e.t)*.6);if(e.t<=0){e.st='laser';e.t=2.6;noise(2.6,'bandpass',500,.2);sweep(300,120,2.6,'sawtooth',.05)}}
      else{let hitK=null;for(let s2=0;s2<Lb;s2+=2.5){const q=o.clone().addScaledVector(e.bd,s2);if(kD(q.x,q.y,q.z)<0){hitK=q;break}}const bEnd=hitK||end;const d0=bEnd.clone().sub(o);const L0=d0.length()||1;d0.multiplyScalar(1/L0);setBeam(mbO,o,d0,L0,1.6+Math.random()*.4);setBeam(mbC,o,d0,L0,.6);K.burst(bEnd.clone(),[0xFF2A2A,0xFFD23F,0xffffff],3,10,.4);
        if(hitK){hurt(dt*(e.phase>1?62:48),null);KZ.flinch=Math.max(KZ.flinch,.3);if(Math.random()<dt*2)H.say('🔥 The laser is burning you! Move!',700)}else{e.lAcc=(e.lAcc||0)+dt;while(e.lAcc>1/20){e.lAcc-=1/20;carve(end,2.6,e.bd.clone().multiplyScalar(18).setY(4),8,8);if(Math.random()<.08)ignite(end.clone())}}
        if(e.t<=0){mDone(e);e.core.scale.setScalar(1)}}}
    else if(e.st==='leap'){e.fy+=e.vy*dt;e.vy-=30*dt;p.x+=e.lv.x*dt;p.z+=e.lv.z*dt;e.fl.forEach(f=>{f.visible=true;f.scale.set(1,1+Math.random()*.8,1)});if(Math.random()<dt*20)K.puff(new V3(p.x,e.fy+8,p.z),0xFFB02A,2.5,.5,new V3(0,-12,0));mechaSync(e);mCarve(e,e.lv.clone().setY(e.vy));const gy=-seaD(p.z);if(e.fy<=gy&&e.vy<0){e.fy=gy;mechaSync(e);mShock(new V3(p.x,gy,p.z),22);mDone(e)}}
    if(hd<15&&e.st!=='leap'){const push=(15-hd)*.5;p.x-=fw.x*push;p.z-=fw.z*push;P.p.x+=fw.x*push;P.p.z+=fw.z*push}
    p.x=clamp(p.x,-HALF-30,HALF+30);p.z=clamp(p.z,-HALF-30,SHORE+30);mechaAnim(e,dt,mv);mechaSync(e);if(mv>0)mCarve(e,fw.clone().multiplyScalar(mv*1.4).setY(2))}
  /* --- missions --- */
  function kStart(){HR.visible=false;KG.visible=true;cam.pmin=-1.2;cam.pmax=.8;camera.fov=62;camera.updateProjectionMatrix();fires.forEach(f=>scene.remove(f.m));fires=[];kSubs.forEach(q=>scene.remove(q.g));kSubs=[];if(KZ.held){scene.remove(KZ.held.m);KZ.held=null}bossBar.style.display='none';
    Object.assign(KZ,{yaw:Math.PI,ph:0,en:60,maxHP:KHP,swT:0,swCd:0,combo:0,tailCd:0,tailT:0,stompCd:0,stompT:0,roarCd:0,roarT:0,brCh:0,brOn:false,pulseT:0,grabCd:0,flinch:0,deadT:0,fell:false,crunch:0,debHit:0,spT:4,bossT:240,roamT:0,landed:false,bossDown:false,won:false,lastBest:0,init:true,fx:0,fz:-1});
    KG.rotation.set(0,Math.PI,0);P.p.set(lineAt(3)+(Math.random()-.5)*30,0,SHORE+(vmi===0||vmi<0?95:22));P.p.y=-seaD(P.p.z);P.v.set(0,0,0);P.hp=KHP;P.ground=true;cam.yaw=0;cam.pitch=-.12;milN=0;subN=0;
    if(vmi===0){timeLeft=c.pick(270,240,210);target=c.pick(4,6,8);for(let k=0;k<3;k++)enemies.push(mkBoat(k*2.1+.5))}
    if(vmi===1){milT=c.pick(12,18,24);heat=2.6}
    if(vmi===2){timeLeft=c.pick(320,280,240);subT=c.pick(4,5,6);placeSubs(subT);heat=1.6}
    if(vmi===3){KZ.en=100;heat=.5;strikes.push({t:3.5,fn:()=>enemies.push(mkMecha())})}
    if(vmi<0){placeSubs(3);for(let k=0;k<2;k++)enemies.push(mkBoat(k*3))}
    tailReset();H.say(vmi===0||vmi<0?'Something enormous is rising out of the bay…':'The monster is back.',2400)}
  function kMission(dt){const LV=LVN[c.level]||'Normal';let tg=null,tl='';const pct=totalBlocks?deadBlocks/totalBlocks*100:0;const bm=enemies.find(e=>e.kind==='mecha'&&!e.dead);
    if(!KZ.landed&&P.p.z<SHORE-2){KZ.landed=true;H.pow('LANDFALL!',P.p.clone().setY(40),'#7FE8FF');heat=Math.max(heat,1.2);noise(1.5,'lowpass',70,.6)}
    if(P.p.z>SHORE+10&&!bm){tg=new V3(P.p.x*.5,10,HALF-40);tl='🏙️ CITY '+Math.round(P.p.z-HALF)+'m'}
    if(bm){tg=bm.p.clone();tl='🤖 MECHA '+Math.round(Math.hypot(bm.p.x-P.p.x,bm.p.z-P.p.z))+'m'}
    const nearSub=()=>{let b=null,bd=1e9;kSubs.forEach(q=>{if(q.down)return;const d=Math.hypot(q.x-P.p.x,q.z-P.p.z);if(d<bd){bd=d;b=q}});if(b&&!bm){tg=new V3(b.x,8,b.z);tl='⚡ SUBSTATION '+Math.round(bd)+'m'}};
    if(vmi<0){KZ.roamT+=dt;KZ.bossT-=dt;if(!bm&&KZ.bossT<=0){KZ.bossT=300;enemies.push(mkMecha())}if(!tl)nearSub();H.cap('Kaiju Rampage · free roam',kMoney(score)+' damage · '+Math.floor(pct)+'% leveled · '+stats.towers+' towers · '+stats.enemies+' units · Mecha '+(bm?'HERE!':'in '+Math.ceil(Math.max(0,KZ.bossT))+'s'))}
    else if(vmi===0){timeLeft-=dt;heat=Math.min(heat,3.2);H.cap('Issue #1 · Landfall','Towers toppled '+Math.min(stats.towers,target)+'/'+target+' · '+Math.max(0,Math.ceil(timeLeft))+'s left');
      if(!tg){let b=null,bd=1e9;blds.forEach(B=>{if(B.fh<12||B.alive<B.total*.6)return;const cx=(B.gx0+B.fx/2)*BS,cz=(B.gz0+B.fz/2)*BS;const d=Math.hypot(cx-P.p.x,cz-P.p.z);if(d<bd){bd=d;b=[cx,B.fh*BS,cz]}});if(b){tg=new V3(b[0],Math.min(60,b[1]),b[2]);tl='🏢 TOWER '+Math.round(bd)+'m'}}
      if(stats.towers>=target)F.win(M,Math.round(score)+Math.round(timeLeft)*5,[[stats.towers,'towers'],[kMoney(score),'damage'],[Math.floor(pct)+'%','leveled'],[LV,'mode']],'The skyline has a new shape. Every news channel in the world is showing the same shaky footage, and all of them are using the word “unstoppable”.');else if(timeLeft<=0)F.lose(M,'Not scary enough','The city put up a few “road closed” signs and called it a day. Come back bigger?')}
    else if(vmi===1){heat=Math.max(heat,2.6);H.cap('Issue #2 · Line in the Sand','Military units destroyed '+Math.min(milN,milT)+'/'+milT+' · '+kMoney(score)+' damage');if(milN>=milT)F.win(M,Math.round(score)+Math.round(P.hp)*2,[[milN,'units'],[stats.towers,'towers'],[Math.round(P.hp),'health'],[LV,'mode']],'The generals have agreed to “reassess the situation from a much greater distance”. The tanks are still smoking.')}
    else if(vmi===2){timeLeft-=dt;heat=Math.max(heat,1.6);nearSub();H.cap('Issue #3 · Power Hungry','Substations '+subN+'/'+subT+' · max health '+KZ.maxHP+' · '+Math.max(0,Math.ceil(timeLeft))+'s left');if(subN>=subT)F.win(M,Math.round(score)+Math.round(timeLeft)*5,[[subN,'substations'],[KZ.maxHP,'max health'],[kMoney(score),'damage'],[LV,'mode']],'The whole city is dark, apart from one very large, very happy, glowing monster.');else if(timeLeft<=0)F.lose(M,'Still hungry','The power company fixed the grid faster than you could eat it. Try again?')}
    else if(vmi===3){heat=Math.min(heat,2.2);H.cap('Issue #4 · Mecha-Kaiju',bm?('Mecha '+Math.max(0,Math.ceil(bm.hp/bm.max*100))+'%'+(bm.stag>0?' · STAGGERED: hit it now!':bm.st==='laserT'||bm.st==='laser'?' · LASER! Get out of the line!':'')):KZ.bossDown?'Destroyed!':'Something is coming…');
      if(KZ.bossDown&&!KZ.won){KZ.won=true;c.after(()=>F.win(M,Math.round(score)+Math.round(P.hp)*5,[['KO','Mecha'],[kMoney(score),'damage'],[Math.round(P.hp),'health'],[LV,'mode']],'Forty billion dollars of robot is now a very expensive pile of scrap in the middle of downtown. The monster wades back into the bay, victorious.'),2200)}}
    missionPtr(tg?tg.add(new V3(0,3,0)):null,tl)}
