G.push({id:'hs_size',name:'Pocket',kind:'hero',levels:true,wide:true,tint:'#6EE7B7',blurb:'3D size-shifting platformer. Shrink to sneak through vents and under lasers, grow giant to smash walls.',fmt:b=>b+' pts',
art:'<rect width="120" height="72" fill="#6EE7B7"/><rect y="58" width="120" height="14" fill="#FFFDF6" stroke="#1D1A2F" stroke-width="2"/><rect x="62" y="6" width="26" height="52" rx="4" fill="#2BB673" stroke="#1D1A2F" stroke-width="3"/><rect x="66" y="12" width="18" height="6" fill="#1D1A2F"/><rect x="66" y="26" width="18" height="5" fill="#FFD23F"/><rect x="30" y="47" width="8" height="11" rx="2" fill="#2BB673" stroke="#1D1A2F" stroke-width="2"/><rect x="31" y="49" width="6" height="2" fill="#1D1A2F"/><path d="M44 50l10-6M44 54h12" stroke="#1D1A2F" stroke-width="2.5" stroke-linecap="round"/>',
run(root,c){return with3D(root,c,()=>{
  const st3=Stage3D(root,c,{lock:true,dragLook:true,fov:70,far:220,fireLabel:'GROW',altLabel:'SHRINK',jumpLabel:'JUMP'});
  const M=[{name:'Shrink Ray Test',brief:['You’re <b>Pocket</b>. A lab accident at Crumb Industries left you able to shrink to the size of a mouse or grow as tall as a house.','Dr. Crumb has locked you in his test lab. Time to find out what these powers can do.'],goal:'Reach the glowing exit portal. Free the caged hamsters and grab atoms for bonus points.'},
    {name:'Pressure Test',brief:['Dr. Crumb has turned up the difficulty: heavy doors, robot vacuums, and a pool of bright green acid.','Some things only a giant can do. Some things only someone tiny can do. Most things you can do at normal size, if you’re careful.'],goal:'Reach the exit portal.'},
    {name:'Dr. Crumb’s Office',brief:['The doctor’s personal office is at the end of this last lab, and he’s left every trap switched on.','Everything you’ve learned, all at once. The hamsters are counting on you.'],goal:'Reach the exit and escape Crumb Industries.'}];
  const K=heroKit(st3,c,{id:'hs_size',issues:3,camDist:4,camH:1.8,fogNear:70,fogFar:170,finale:'Escaped!',roamLevels:M.map((m,k)=>'Lab '+(k+1)+': '+m.name),start:mi=>start(mi)});
  const{T,scene,camera,input,TM,cam,H,F}=K;cam.boxes=[];cam.pmin=-1.2;cam.pmax=.4;
  K.sky('#FF8FB1','#FFE9F0','rgba(255,255,255,.28)');K.lights(0xffffff,0x9a90c0,.75);
  const hero=K.fig({suit:0x2BB673,trim:0xFFD23F,mask:0x1D1A2F,skin:0xf1c7a0,hair:0xF2352A});scene.add(hero);
  const hB=H.bar('HEARTS','#FF8FB1'),sB=H.bar('SIZE','#6EE7B7');
  const SZ=[.18,1,3.2],SN=['TINY','NORMAL','GIANT'],JV=[5.2,9,14.5],SP=[3.2,6.2,9];
  const P={x:0,y:0,z:0,vy:0,face:0,si:1,s:1,ground:false,onB:null,hearts:5,inv:0,ph:0,t:0};
  let mi=0,score=0,lg=null,solids=[],lasers=[],acids=[],fans=[],plates=[],bots=[],atoms=[],cages=[],checks=[],goal=null,hints=[],spawn={x:0,y:0,z:2,si:1},atomsGot=0,cagesGot=0,deaths=0,tLevel=0,fanFx=[];
  const W=()=>SZ[P.si]*.3,Hh=()=>SZ[P.si]*2.25;
  const over=(b,x,y,z,w,h)=>x+w>b.x0&&x-w<b.x1&&y+h>b.y0&&y<b.y1&&z+w>b.z0&&z-w<b.z1;
  function mat(col,kind,w,d){if(kind==='floor'){const t=tex(T,128,128,TX.tiles('#e8e1d0','#a99fc4',4),Math.max(1,w/4),Math.max(1,d/4));return new T.MeshToonMaterial({map:t,gradientMap:K.grad})}if(kind==='crack'){const t=tex(T,128,128,(x,w2,h2)=>{x.fillStyle='#c9c2da';x.fillRect(0,0,w2,h2);x.strokeStyle='#1D1A2F';x.lineWidth=4;for(let k=0;k<3;k++){x.beginPath();let px=20+k*40,py=0;x.moveTo(px,py);while(py<h2){px+=(Math.random()-.5)*30;py+=18;x.lineTo(px,py)}x.stroke()}},Math.max(1,w/3),2);return new T.MeshToonMaterial({map:t,gradientMap:K.grad})}if(kind==='door'){const t=tex(T,128,128,TX.hazard,Math.max(1,w/3),1);return new T.MeshToonMaterial({map:t,gradientMap:K.grad})}if(kind==='wall'){const cs='#'+col.toString(16).padStart(6,'0');const t=tex(T,128,128,TX.panel(cs,'rgba(29,26,47,.35)'),Math.max(1,w/4),3);return new T.MeshToonMaterial({map:t,gradientMap:K.grad})}return TM(col)}
  function signS(t){const cv=document.createElement('canvas');cv.width=256;cv.height=96;const x=cv.getContext('2d');x.fillStyle='#FFD23F';x.strokeStyle='#1D1A2F';x.lineWidth=8;x.beginPath();x.rect(6,6,244,84);x.fill();x.stroke();x.fillStyle='#1D1A2F';x.font='900 58px Figtree, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(t,128,52);const s2=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(cv)}));s2.scale.set(1.6,.6,1);return s2}
  function build(i){if(lg)scene.remove(lg);lg=new T.Group();scene.add(lg);solids=[];lasers=[];acids=[];fans=[];plates=[];bots=[];atoms=[];cages=[];checks=[];goal=null;hints=[];fanFx=[];
    const S=(x0,y0,z0,x1,y1,z1,col,kind)=>{const m=new T.Mesh(bx(T,x1-x0,y1-y0,z1-z0),mat(col,kind,kind==='wall'?Math.max(x1-x0,z1-z0):x1-x0,z1-z0));m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);lg.add(m);if(kind!=='floor')K.ink(m,.03);const b={x0,y0,z0,x1,y1,z1,m,kind:kind||'solid'};solids.push(b);return b};
    const room=(len,col)=>{S(-6,-1,-2,6,0,len,0,'floor');S(-6.6,-1,-2.6,-6,12,len,col,'wall');S(6,-1,-2.6,6.6,12,len,col,'wall');S(-6,-1,-2.6,6,12,-2,col,'wall');S(-6,-1,len,6,12,len+.6,col,'wall')};
    const vent=(z,y,col)=>{S(-6,y,z,-.5,12,z+1,col,'wall');S(.5,y,z,6,12,z+1,col,'wall');S(-.5,y+.75,z,.5,12,z+1,col,'wall');const fm=TM(0x1D1A2F);[[-.56,y+.42,.12,.95],[.56,y+.42,.12,.95]].forEach(([x,yy,w,h])=>part(T,bx(T,w,h,.08),fm,x,yy,z-.04,lg));part(T,bx(T,1.24,.12,.08),fm,0,y+.84,z-.04,lg);const sg=signS('VENT');sg.position.set(0,y+1.6,z-.2);lg.add(sg)};
    const laser=(z,y)=>{const m=part(T,bx(T,12,.12,.12),new T.MeshBasicMaterial({color:0xff2a2a}),0,y+.06,z+.06,lg);const gl=part(T,bx(T,12,.4,.4),new T.MeshBasicMaterial({color:0xff5a5a,transparent:true,opacity:.25,depthWrite:false}),0,y+.06,z+.06,lg);[-5.8,5.8].forEach(x=>K.ink(part(T,bx(T,.4,.5,.5),TM(0x3a3552),x,y+.06,z+.06,lg),.03));lasers.push({x0:-6,x1:6,y0:y,y1:y+.12,z0:z,z1:z+.12,m,gl})};
    const acid=(z0,z1)=>{const m=part(T,bx(T,12,.12,z1-z0),new T.MeshToonMaterial({color:0x7CFF4F,gradientMap:K.grad,emissive:0x2a8a10,emissiveIntensity:.5}),0,.06,(z0+z1)/2,lg);acids.push({x0:-6,x1:6,y0:0,y1:.13,z0,z1,m})};
    const fan=(x0,y0,z0,x1,y1,z1)=>{const g=new T.Group();g.position.set((x0+x1)/2,y0+.05,(z0+z1)/2);lg.add(g);const base=part(T,cy(T,(x1-x0)/2,(x1-x0)/2,.15,20),TM(0x5A5470),0,0,0,g);K.ink(base,.03);const bl=new T.Group();g.add(bl);for(let k=0;k<4;k++){const b=part(T,bx(T,(x1-x0)*.45,.05,.3),TM(0xe8e1d0),0,.12,0,bl);b.position.x=Math.cos(k*Math.PI/2)*(x1-x0)*.22;b.position.z=Math.sin(k*Math.PI/2)*(x1-x0)*.22;b.rotation.y=-k*Math.PI/2}
      const col=part(T,cy(T,(x1-x0)/2,(x1-x0)/2,y1-y0,16,true),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.12,depthWrite:false,side:T.DoubleSide}),0,(y1-y0)/2,0,g);fans.push({x0,y0,z0,x1,y1,z1,bl});for(let k=0;k<14;k++){const m=part(T,bx(T,.06,.35,.06),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6}),x0+Math.random()*(x1-x0),y0+Math.random()*(y1-y0),z0+Math.random()*(z1-z0),lg);fanFx.push({m,y0,y1,sp:3+Math.random()*3})}};
    const door=(z,y)=>S(-6,y,z,6,y+12,z+1,0,'door');
    const plate=(x,y,z,d)=>{const b=S(x-1.3,y,z-1.3,x+1.3,y+.22,z+1.3,0xFFD23F,'plate');b.door=d;plates.push(b);return b};
    const crack=(z,y)=>S(-6,y,z,6,y+12,z+1,0,'crack');
    const bot=(x,y,z,ax,a,b2)=>{const g=new T.Group();part(T,cy(T,.65,.7,.36,18),TM(0x8c86a3),0,.18,0,g);part(T,cy(T,.4,.4,.08,14),TM(0x3a3552),0,.4,0,g);part(T,sp(T,.1),new T.MeshBasicMaterial({color:0xF2352A}),0,.3,.62,g);K.ink(g,.03);g.position.set(x,y,z);lg.add(g);bots.push({g,y,ax,a,b:b2,dir:1,sp:c.pick(1.6,2.2,2.8),alive:true})};
    const atom=(x,y,z)=>{const g=new T.Group();part(T,sp(T,.18),new T.MeshBasicMaterial({color:0xFFD23F}),0,0,0,g);[0,1,2].forEach(k=>{const r=part(T,new T.TorusGeometry(.34,.025,6,24),new T.MeshBasicMaterial({color:0x2d6fd6}),0,0,0,g);r.rotation.set(k*1.1,k*.7,0)});g.position.set(x,y+.6,z);lg.add(g);atoms.push({g,got:false})};
    const cage=(x,y,z)=>{const g=new T.Group();part(T,bx(T,.9,.08,.9),TM(0x5A5470),0,.04,0,g);part(T,bx(T,.9,.08,.9),TM(0x5A5470),0,.86,0,g);for(let k=0;k<8;k++){const a=k/8*Math.PI*2;part(T,cy(T,.025,.025,.8,4),TM(0x1D1A2F),Math.cos(a)*.42,.45,Math.sin(a)*.42,g)}const h=new T.Group();part(T,sp(T,.2),TM(0xFF9F43),0,0,0,h).scale.set(1.2,.85,1);part(T,sp(T,.07),TM(0xFF8FB1),0,.05,.22,h);[-1,1].forEach(s=>part(T,sp(T,.06),TM(0xFF9F43),s*.12,.16,.08,h));h.position.y=.24;g.add(h);K.ink(h,.02);g.position.set(x,y,z);lg.add(g);cages.push({g,h,got:false,x,y,z,run:0})};
    const check=(x,y,z)=>{const g=new T.Group();part(T,cy(T,.05,.05,2,6),TM(0x1D1A2F),0,1,0,g);const fl=part(T,bx(T,.8,.5,.04),TM(0xe8e1d0),.4,1.7,0,g);K.ink(fl,.02);g.position.set(x,y,z);lg.add(g);checks.push({g,fl,x,y,z,on:false})};
    const goalAt=(x,y,z)=>{const g=new T.Group();const r=part(T,new T.TorusGeometry(1.4,.22,10,32),TM(0xFFD23F),0,1.6,0,g);K.ink(r,.04);part(T,new T.CircleGeometry(1.3,32),new T.MeshBasicMaterial({color:0x6EE7B7,transparent:true,opacity:.7,side:T.DoubleSide}),0,1.6,0,g);g.position.set(x,y,z);lg.add(g);goal={g,x,y,z}};
    const hint=(z0,z1,t,ymin)=>hints.push({z0,z1,t,ymin:ymin==null?-9:ymin});
    const WC=[0x9fd6ff,0xFFB3C8,0xc9b9ff][i];
    if(i===0){room(50,WC);spawn={x:0,y:0,z:4,si:1};
      hint(-2,8,'Use WASD to walk and the mouse to look. Space jumps.');vent(14,0,WC);hint(8,15,'That vent is tiny. Press Q to shrink!');
      laser(19,.8);laser(22.4,.8);hint(15,24,'Lasers! Stay tiny and walk under them.');check(3,0,16.5);
      crack(27,0);hint(24,28,'A cracked wall. Press E twice to go GIANT, then walk into it.');check(-3,0,29);
      S(-6,0,33,6,3,50,0xe8e1d0);hint(28,33,'Too high? Giants jump much higher.');check(4,3,35);vent(40,3,WC);hint(33,41,'Another vent. Shrink down with Q.',2.5);
      goalAt(0,3,46);hint(41,50,'The exit portal! Jump in.',2.5);
      [[-3,0,5],[3,0,10],[0,0,17.8],[0,0,20.7],[0,0,25],[-3,0,31],[2,3,37],[0,3,43]].forEach(a=>atom(...a));cage(4.6,0,6);cage(-4.6,3,37)}
    if(i===1){room(53,WC);spawn={x:0,y:0,z:4,si:1};
      const d=door(12,0);plate(3,0,7,d);hint(-2,12.5,'This door won’t budge. The yellow pressure plate needs something HEAVY. (Press E to grow)');
      fan(-1.6,0,16.6,1.6,7.5,19.8);S(-6,0,21,6,5,34,0xe8e1d0);hint(12.5,21,'That ledge is too high for anyone to jump. But tiny heroes can ride the fan’s wind…');check(-4,5,22.5);
      bot(0,5,26,'x',-4.5,4.5);bot(0,5,29.5,'x',4.5,-4.5);hint(21,31.5,'Robo-vacuums! Jump over them, or stomp them flat as a giant.',4);
      crack(32,5);hint(31.5,33.5,'Cracked wall: go GIANT and smash through.',4);check(3,0,35);
      acid(36,48);[37,38.8].forEach(z=>S(-.7,0,z-.6,.7,.6,z+.6,0x5A5470));S(-.7,0,40.4,.7,.6,45,0x5A5470);S(-.7,0,45.9,.7,.6,47.1,0x5A5470);laser(42.6,1.45);hint(34,48,'Acid! Hop across the stones. Stay TINY and don’t jump under the laser.');
      goalAt(0,0,50.5);[[-3,0,4],[4.5,0,10],[0,4,18.2],[0,6.5,19],[3,5,27.5],[-3,5,31],[0,.6,38.8],[0,.6,44.3]].forEach(a=>atom(...a));cage(-4.6,0,9);cage(4.6,5,33.2);cage(-4.6,0,49)}
    if(i===2){room(59,WC);spawn={x:0,y:0,z:4,si:1};
      vent(8,0,WC);hint(-2,9,'Dr. Crumb’s last lab. It starts with a vent…');check(0,0,10.5);
      const d=door(20,0);plate(-3.5,0,14.5,d);hint(9,20,'Pressure plate. You know what to do.');
      acid(22.5,58);[23.2,25].forEach(z=>S(-.7,0,z-.6,.7,.6,z+.6,0x5A5470));S(-1.6,0,27.4,1.6,.6,30.2,0x5A5470);fan(-1.3,.6,27.6,1.3,8.2,30);
      S(-3,6,30.2,3,6.5,38.5,0xe8e1d0);S(-6,0,38.5,6,6.5,59,0xe8e1d0);hint(20.5,30.4,'Acid below, a ledge way up high. Find the fan, stay tiny, ride it up!');check(0,6.5,39.5);
      bot(0,6.5,42.5,'x',-4.5,4.5);bot(0,6.5,45.5,'x',4.5,-4.5);hint(38.5,46.5,'More robo-vacuums.',5);
      crack(47,6.5);hint(46.5,48.5,'One more wall to smash.',5);laser(51,7.35);laser(53.4,7.35);hint(48.5,55,'Two lasers. Tiny time.',5);
      goalAt(0,6.5,57);[[-3,0,4],[3,0,12],[-4,0,18],[0,.6,25],[0,4,28.8],[0,8,28.8],[2,6.5,34],[3,6.5,44],[0,6.5,52.2]].forEach(a=>atom(...a));cage(4.6,0,18);cage(2.3,6.5,36);cage(-4.6,6.5,44)}
  }
  function fits(si){const w=SZ[si]*.3,h=SZ[si]*2.25;return!solids.some(b=>!b.gone&&over(b,P.x,P.y+.02,P.z,w,h))}
  function setSize(si){if(si===P.si)return;if(si>P.si&&!fits(si)){H.say('No room to grow here!',900);beep(200,.1,'square',.05);return}P.si=si;sweep(si>1?200:900,si>1?700:250,.3,'sine',.08);K.ring(new T.Vector3(P.x,P.y+.1,P.z),0x6EE7B7,.3,SZ[si]*2,.35);H.pow(SN[si]+'!',new T.Vector3(P.x,P.y+SZ[si]*2.6,P.z),'#6EE7B7')}
  function hurt(why){if(P.inv>0||F.state!=='play')return false;if(!free)P.hearts--;P.inv=1.2;deaths++;cam.shake=.5;H.tint('rgba(242,53,42,.4)',1);beep(140,.2,'sawtooth',.08);if(P.hearts<=0){F.lose(M,'Out of hearts','Dr. Crumb laughs over the loudspeaker. Then he coughs for a bit. Try again?');return true}H.say(why,1300);return false}
  function respawn(why,word){H.pow(word,new T.Vector3(P.x,P.y+1,P.z));if(hurt(why))return;Object.assign(P,{x:spawn.x,y:spawn.y+.05,z:spawn.z,vy:0,si:spawn.si});P.s=SZ[P.si];cam.cur=null}
  function smash(b){b.gone=true;lg.remove(b.m);K.burst(new T.Vector3(P.x,P.y+3,(b.z0+b.z1)/2),[0xc9c2da,0x8c86a3,0x1D1A2F],50,16,1,20);H.pow('KRA-KOOM!',new T.Vector3(P.x,P.y+4,b.z0));noise(.6,'lowpass',250,.45);cam.shake=1;score+=150}
  function moveAxis(ax,d){const w=W(),h=Hh();P[ax]+=d;for(const b of solids){if(b.gone||!over(b,P.x,P.y,P.z,w,h))continue;
      if(b.kind==='crack'&&ax!=='y'&&P.si===2){smash(b);continue}
      if(ax==='y'){if(d<=0){P.y=b.y1;P.vy=0;P.ground=true;P.onB=b}else{P.y=b.y0-h;P.vy=Math.min(0,P.vy)}}
      else{const step=b.y1-P.y;if(step>0&&step<=.34*SZ[P.si]+.02){const oy=P.y;P.y=b.y1+.001;if(solids.some(o=>!o.gone&&o!==b&&over(o,P.x,P.y,P.z,w,h)))P.y=oy;else continue}
        if(ax==='x')P.x=d>0?b.x0-w-.0005:b.x1+w+.0005;else P.z=d>0?b.z0-w-.0005:b.z1+w+.0005}}}
  function start(i){free=i<0;if(free)i=-1-i;mi=i;build(i);Object.assign(P,{x:spawn.x,y:0,z:spawn.z,vy:0,face:0,si:1,s:1,hearts:5,inv:1});cam.yaw=Math.PI;cam.pitch=-.25;cam.cur=null;score=0;atomsGot=0;cagesGot=0;deaths=0;tLevel=0;H.say(free?'Free roam: '+M[i].name+' (no hearts lost)':M[i].name,1800)}
  let free=false;F.revive=()=>{P.hearts=5}
  let jL=false,gL=false,sL=false;/*DBG*/
  cam.solid=(x,y,z)=>solids.some(b=>!b.gone&&b.kind!=='floor'&&x>b.x0-.12&&x<b.x1+.12&&y>b.y0-.12&&y<b.y1+.12&&z>b.z0-.12&&z<b.z1+.12);
  st3.onFrame((dt,now)=>{K.fxTick(dt);H.tick(dt);const play=F.state==='play'&&!F.paused();const I=input,Kk=I.keys;P.t+=dt;
    fans.forEach(f=>f.bl.rotation.y+=dt*14);fanFx.forEach(f=>{f.m.position.y+=f.sp*dt;if(f.m.position.y>f.y1)f.m.position.y=f.y0});atoms.forEach(a=>{a.g.rotation.y+=dt*2;a.g.rotation.x+=dt});lasers.forEach(l=>l.gl.material.opacity=.18+.12*Math.sin(now/80));if(goal)goal.g.rotation.y+=dt;acids.forEach(a=>a.m.material.emissiveIntensity=.4+.15*Math.sin(now/300));
    if(!lg)build(0);
    if(!play){K.pose(hero,'idle',P.t);hero.position.set(P.x,P.y,P.z);hero.scale.setScalar(P.s);cam.yaw+=dt*.15;cam.place(new T.Vector3(P.x,P.y,P.z),dt,5,1.6,0);return}
    cam.look();tLevel+=dt;P.inv-=dt;
    // size keys
    const gk=Kk.e||I.fire||Kk['3'],sk=Kk.q||I.alt||Kk['1'];if(gk&&!gL){gL=true;setSize(Math.min(2,P.si+1))}if(!gk)gL=false;if(sk&&!sL){sL=true;setSize(Math.max(0,P.si-1))}if(!sk)sL=false;if(Kk['2']&&P.si!==1)setSize(1);
    P.s+=(SZ[P.si]-P.s)*Math.min(1,dt*10);hero.scale.setScalar(P.s);
    // move
    const mv=K.moveIn();const sp0=SP[P.si];const vx=mv.x*sp0*mv.m,vz=mv.z*sp0*mv.m;if(mv.m>0)P.face+=wrapA(Math.atan2(mv.x,mv.z)-P.face)*Math.min(1,dt*14);
    const jmp=Kk[' ']||I.jumpBtn;if(jmp&&!jL&&P.ground){P.vy=JV[P.si];jL=true;beep(P.si===0?900:P.si===2?220:500,.08,'triangle',.05)}if(!jmp)jL=false;
    // fans
    let inFan=false;fans.forEach(f=>{const w=W();if(P.x+w>f.x0&&P.x-w<f.x1&&P.z+w>f.z0&&P.z-w<f.z1&&P.y>=f.y0-.1&&P.y<f.y1){inFan=true;const k=(f.y1-P.y)/(f.y1-f.y0);P.vy+=(P.si===0?24+46*(k-.12):P.si===1?6:0)*dt*(P.si===0?1:1);if(P.si===0)P.vy=Math.min(P.vy,6)}});
    P.vy-=24*dt;P.vy=Math.max(P.vy,-20);
    const n=2;P.ground=false;P.onB=null;for(let k=0;k<n;k++){moveAxis('x',vx*dt/n);moveAxis('z',vz*dt/n);moveAxis('y',P.vy*dt/n)}
    if(P.y<-8)respawn('You fell!','WHOOPS!');
    // hazards
    const w=W(),h=Hh();lasers.forEach(l=>{if(over(l,P.x,P.y,P.z,w,h)&&F.state==='play')respawn('Zapped by a laser! Back to the checkpoint.','ZAP!')});
    acids.forEach(a=>{if(P.y<.14&&P.x+w*.5>a.x0&&P.x-w*.5<a.x1&&P.z+w*.5>a.z0&&P.z-w*.5<a.z1)respawn('Acid! Back to the checkpoint.','SIZZLE!')});
    // plates
    plates.forEach(p=>{if(p.pressed)return;if(P.onB===p){if(P.si===2){p.pressed=true;p.m.material=TM(0x2BB673);p.m.position.y-=.12;const d=p.door;d.gone=true;H.pow('KA-CHUNK!',new T.Vector3((d.x0+d.x1)/2,4,d.z0));noise(.4,'lowpass',200,.3);sweep(100,60,1,'sawtooth',.06);cam.shake=.4;d.anim=1;H.say('The door is opening!',1400)}else if(!p.warned){p.warned=1;H.say('Not heavy enough! Go GIANT (E).',1400)}}});
    solids.forEach(b=>{if(b.anim>0){b.anim-=dt;b.m.position.y-=dt*10;if(b.anim<=0)lg.remove(b.m)}});
    // click smash as giant
    if((I.down||Kk.f)&&P.si===2){solids.forEach(b=>{if(!b.gone&&b.kind==='crack'&&P.x+2>b.x0&&P.x-2<b.x1&&P.z+2.2>b.z0&&P.z-2.2<b.z1&&P.y<b.y1)smash(b)})}
    // bots
    bots.forEach(b=>{if(!b.alive)return;const p=b.g.position;const v=b.dir*b.sp*dt;if(b.ax==='x'){p.x+=v;if((b.dir>0&&p.x>Math.max(b.a,b.b))||(b.dir<0&&p.x<Math.min(b.a,b.b)))b.dir*=-1}b.g.rotation.y=b.dir>0?Math.PI/2:-Math.PI/2;
      const dx=P.x-p.x,dz=P.z-p.z,dd=Math.hypot(dx,dz);if(dd<.7+w&&P.y<p.y+.5&&P.y+h>p.y){if(P.si===2||(P.vy<-1&&P.y>p.y+.2)){b.alive=false;lg.remove(b.g);K.burst(p.clone().setY(p.y+.3),[0x8c86a3,0x3a3552,0xF2352A],18,8,.6);H.pow(P.si===2?'CRUNCH!':'STOMP!',p.clone().setY(p.y+1));score+=100;if(P.si<2)P.vy=6;noise(.2,'lowpass',600,.2)}else if(P.inv<=0){H.pow('BONK!',p.clone().setY(p.y+1));P.vy=5;P.x+=dx/dd*1.2;P.z+=dz/dd*1.2;hurt('The robo-vacuum bumped you! Hearts: '+(P.hearts-1))}}});
    // pickups
    const cx=P.x,cyy=P.y+h*.5,cz=P.z;atoms.forEach(a=>{if(a.got)return;const q=a.g.position;if(Math.hypot(q.x-cx,q.y-cyy,q.z-cz)<Math.max(.8,w+.45+h*.3)){a.got=true;lg.remove(a.g);atomsGot++;score+=50;beep(1400,.06,'triangle',.05);c.after(()=>beep(1800,.06,'triangle',.05),60)}});
    cages.forEach(cg=>{if(cg.got){if(cg.run<2){cg.run+=dt;cg.h.position.x+=dt*4;cg.h.position.y=.24+Math.abs(Math.sin(cg.run*16))*.2}else cg.g.visible=false;return}if(Math.hypot(cg.x-P.x,cg.z-P.z)<1+w&&Math.abs(cg.y-P.y)<1.2){cg.got=true;cagesGot++;score+=250;cg.g.children.slice(0,10).forEach(o=>o.visible=false);H.pow('FREED!',new T.Vector3(cg.x,cg.y+1.4,cg.z),'#FF9F43');[700,900,1100].forEach((f,i)=>c.after(()=>beep(f,.08,'square',.04),i*70))}});
    checks.forEach(ch=>{if(!ch.on&&Math.hypot(ch.x-P.x,ch.z-P.z)<1.4+w&&Math.abs(ch.y-P.y)<1.5){checks.forEach(o=>{o.on=false;o.fl.material=TM(0xe8e1d0)});ch.on=true;ch.fl.material=TM(0x2BB673);spawn={x:ch.x,y:ch.y,z:ch.z,si:P.si};H.pow('CHECKPOINT!',new T.Vector3(ch.x,ch.y+2.4,ch.z),'#6EE7B7');beep(880,.12,'triangle',.06)}});
    if(goal&&Math.hypot(goal.x-P.x,goal.z-P.z)<1.6&&Math.abs(goal.y-P.y)<2){if(free){H.pow('LAB CLEARED!',new T.Vector3(P.x,P.y+2,P.z),'#6EE7B7');beep(880,.2,'triangle',.07);start(-1-((mi+1)%M.length));return}const tb=Math.max(0,Math.round((c.pick(260,200,160)-tLevel)*10));score+=1000+tb;K.burst(new T.Vector3(goal.x,goal.y+1.6,goal.z),[0x6EE7B7,0xFFD23F,0xffffff],50,12,1);goal.g.visible=false;const tt=Math.floor(tLevel/60)+':'+String(Math.floor(tLevel%60)).padStart(2,'0');
      F.win(M,score,[[atomsGot+'/'+atoms.length,'atoms'],[cagesGot+'/'+cages.length,'hamsters'],[tt,'time'],[deaths,'oopses']],mi===0?'The shrink ray works. The grow ray works. And now you know how to use both. Dr. Crumb is taking notes.':mi===1?'Doors, fans, acid and robo-vacuums, all beaten. Dr. Crumb is starting to sweat.':'You burst into Dr. Crumb’s office at giant size. He hands over the lab keys, the hamsters, and a sincere apology. Crumb Industries is now a hamster sanctuary.');goal=null}
    // hint
    let ht='Reach the exit portal.';hints.forEach(hn=>{if(P.z>=hn.z0&&P.z<hn.z1&&P.y>=hn.ymin)ht=hn.t});H.cap((free?'Free roam · ':'Issue #'+(mi+1)+' · ')+M[mi].name,free?ht+' · P for menu':ht);
    // pose + hud
    P.ph+=dt*(mv.m?(P.si===0?16:P.si===2?6:10):1.5);K.pose(hero,!P.ground&&!inFan?'air':inFan?'hover':mv.m?'run':'idle',P.ph,1);hero.position.set(P.x,P.y,P.z);hero.rotation.y=P.face;hero.visible=!(P.inv>0&&Math.sin(now/50)>0);
    hB(P.hearts/5,'HEARTS '+'♥'.repeat(Math.max(0,P.hearts)));sB((P.si+1)/3,'SIZE: '+SN[P.si]+'  [Q] shrink · [E] grow');H.score(score,'score');c.stat('Pocket · '+(free?'Free roam':'Issue #'+(mi+1))+' · Score '+score);
    const D=[1.5,4.4,11][P.si];cam.place(new T.Vector3(P.x,P.y,P.z),dt,D,Hh()*.72,8)});
  F.intro(M,'Pocket','A Detour original · 3D size-shifting platformer','<p>You’re <b>Pocket</b>, test subject #7 at Crumb Industries. A lab accident means you can now shrink to the size of a mouse or grow as tall as a house, whenever you like.</p><p><b>Tiny</b> fits through vents and under lasers, and fans can blow you around. <b>Giant</b> smashes cracked walls, weighs down pressure plates and jumps really high. <b>Normal</b> is somewhere in between.</p>','WASD to move, mouse to look (click to lock). <b>Q</b> shrinks, <b>E</b> grows (or 1, 2, 3). <b>Space</b> jumps. Click as a giant to smash. P pauses. On a phone: joystick, drag to look, and the SHRINK, GROW and JUMP buttons.');
  return()=>st3.dispose()})}});
