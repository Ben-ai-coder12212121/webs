/* Animated glTF characters (Quaternius Universal Base Characters, Modular Outfits and Universal Animation Library, CC0).
   An outfit, a head and a hairstyle share one skeleton and play real motion-captured-style clips through an AnimationMixer.
   Needs bk.js (ARTX loader). Load the assets listed in QC.ASSETS (plus 'chr:q_<outfit>' for each outfit used) with withArt().
   const q=QC.make({outfit:'ranger',recolor:0x16161a,hair:'Hair_Buzzed',beard:true,hat:'kasa'});scene.add(q.g);
   q.loop('Walk_Loop');q.once('Sword_Attack',{ts:1.2});q.update(dt) each frame. */
const QC=(()=>{let T=window.THREE;const got=k=>ARTX.got['chr:q_'+k];
  const ASSETS=['chr:q_anims','chr:q_head'];
  const ok=outfit=>(T=window.THREE)&&!!(got('anims')&&got('head')&&got(outfit||'peasant'));
  const lin=h=>new T.Color(h).convertSRGBToLinear();
  const clipOf=n=>{const a=got('anims').animations;return a.find(c=>c.name===n)||a.find(c=>c.name==='Idle_Loop')};
  /* cloth recolour: the outfit texture's alpha channel marks the main cloth (baked by the asset build); it is repainted in the new
     colour keeping the shading. REF = the cloth's average brightness, so the new colour comes out at its own brightness. */
  const REF={ranger:.053,peasant:.288,peasantf:.288};
  const MC={};
  function recolorMat(m,mode,to){const key=m.uuid+'|'+mode+'|'+to;if(MC[key])return MC[key];const x=m.clone();const has=to!=null;
    x.onBeforeCompile=sh=>{sh.uniforms.qTo={value:has?lin(to):new T.Color(1,1,1)};sh.uniforms.qRef={value:has?REF[mode]||.2:0};
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 qTo;uniform float qRef;')
        .replace('#include <map_fragment>',`#include <map_fragment>
if(qRef>0.){vec3 c=diffuseColor.rgb;float mx=max(c.r,max(c.g,c.b));diffuseColor.rgb=mix(c,qTo*clamp(mx/qRef,.2,2.2),clamp((diffuseColor.a-.25)/.75,0.,1.));}
diffuseColor.a=1.;`)};
    x.customProgramCacheKey=()=>'qrc';return MC[key]=x}
  function tintMat(m,col,key){const k=m.uuid+'|t'+key+col;if(MC[k])return MC[k];const x=m.clone();x.color=lin(col);return MC[k]=x}
  /* headwear and small props, built in the head's upright frame (origin = top of the skull, +z = face) */
  const HG={};const hg=(k,f)=>HG[k]||(HG[k]=f());const HM={};const hm=(k,f)=>HM[k]||(HM[k]=f());
  function strawTex(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#b89a5a';g.fillRect(0,0,128,128);for(let i=0;i<260;i++){const a=Math.random()*Math.PI*2;g.strokeStyle=`rgba(${60+Math.random()*80|0},${45+Math.random()*50|0},20,.5)`;g.lineWidth=1;g.beginPath();g.moveTo(64,64);g.lineTo(64+Math.cos(a)*90,64+Math.sin(a)*90);g.stroke()}for(let r=6;r<64;r+=5){g.strokeStyle='rgba(70,50,20,.45)';g.beginPath();g.arc(64,64,r,0,7);g.stroke()}const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}
  function hat(kind,o){const g=new T.Group();
    if(kind==='kasa'){const m=hm('kasa',()=>new T.MeshStandardMaterial({map:strawTex(),roughness:.95,side:T.DoubleSide}));const c=new T.Mesh(hg('kasa',()=>{const q=new T.ConeGeometry(.36,.2,28,1,true);q.translate(0,.06,0);return q}),m);g.add(c);const tie=new T.Mesh(hg('kasat',()=>new T.TorusGeometry(.095,.008,5,16)),hm('tie',()=>new T.MeshStandardMaterial({color:lin(0x2a2018)})));tie.rotation.x=PI2;tie.position.y=-.05;g.add(tie)}
    else if(kind==='jingasa'){const m=hm('jin'+(o.hatCol||0),()=>new T.MeshStandardMaterial({color:lin(o.hatCol||0x141414),roughness:.35,metalness:.3,side:T.DoubleSide}));const c=new T.Mesh(hg('jin',()=>{const q=new T.ConeGeometry(.27,.1,24,1,true);q.translate(0,.02,0);return q}),m);g.add(c);const mon=new T.Mesh(hg('mon',()=>new T.CircleGeometry(.035,12)),hm('mon',()=>new T.MeshStandardMaterial({color:lin(0xc8a040),metalness:.8,roughness:.3})));mon.position.set(0,.03,.12);mon.rotation.x=-1.2;g.add(mon)}
    else if(kind==='kabuto'){const m=hm('kab'+(o.hatCol||0),()=>new T.MeshStandardMaterial({color:lin(o.hatCol||0x1a1a1e),roughness:.3,metalness:.5}));const dome=new T.Mesh(hg('kabd',()=>{const q=new T.SphereGeometry(.14,20,10,0,Math.PI*2,0,1.5);q.scale(1,.95,1.08);q.translate(0,-.1,0);return q}),m);g.add(dome);
      const sk=new T.Mesh(hg('kabs',()=>{const q=new T.CylinderGeometry(.16,.25,.1,20,1,true,Math.PI*.35,Math.PI*1.3);q.translate(0,-.14,0);return q}),m);sk.rotation.y=Math.PI;g.add(sk);const gold=hm('gold',()=>new T.MeshStandardMaterial({color:lin(0xd8a840),metalness:.9,roughness:.25,side:T.DoubleSide}));
      for(const s of[-1,1]){const h=new T.Mesh(hg('kuw',()=>{const sh=new T.Shape();sh.moveTo(0,0);sh.quadraticCurveTo(.05,.12,.02,.26);sh.lineTo(-.005,.26);sh.quadraticCurveTo(.02,.12,-.02,0);return new T.ShapeGeometry(sh)}),gold);h.position.set(s*.03,-.02,.13);h.rotation.set(-.25,0,-s*.35);h.scale.x=s;g.add(h)}}
    else if(kind==='horns'){const m=hm('horn',()=>new T.MeshStandardMaterial({color:lin(0xe8dcc0),roughness:.5}));for(const s of[-1,1]){const h=new T.Mesh(hg('horn',()=>{const q=new T.ConeGeometry(.035,.2,10);q.translate(0,.1,0);return q}),m);h.position.set(s*.06,-.04,.03);h.rotation.set(-.2,0,-s*.45);g.add(h)}}
    else if(kind==='topknot'){const hmat=hm('hk'+(o.hairCol||0),()=>new T.MeshStandardMaterial({color:lin(o.hairCol||0x14100c),roughness:.7}));const k=new T.Mesh(hg('tk',()=>{const q=new T.CylinderGeometry(.018,.022,.1,8);q.rotateX(Math.PI/2);q.translate(0,0,.03);return q}),hmat);k.position.set(0,-.005,-.02);k.rotation.x=-.25;g.add(k)}
    else if(kind==='band'){const b=new T.Mesh(hg('band',()=>new T.CylinderGeometry(.106,.108,.03,20,1,true)),hm('band'+(o.bandCol||0),()=>new T.MeshStandardMaterial({color:lin(o.bandCol||0xb81a1a),roughness:.8,side:T.DoubleSide})));b.position.y=-.06;b.scale.z=1.12;g.add(b)}
    else if(kind==='mask'){const b=new T.Mesh(hg('mask',()=>{const q=new T.CylinderGeometry(.1,.085,.11,20,1,true,-1.9,3.8);q.scale(1,1,1.15);return q}),hm('mask'+(o.maskCol||0),()=>new T.MeshStandardMaterial({color:lin(o.maskCol||0x141418),roughness:.85,side:T.DoubleSide})));b.position.set(0,-.2,.012);g.add(b)}
    g.traverse(m=>{if(m.isMesh){m.castShadow=true}});return g}
  const PI2=Math.PI/2;
  /* one character */
  function make(o){o=o||{};const outfit=o.outfit||'peasant';const src=got(outfit),hd=got('head');const SU=T.SkeletonUtils;
    const root=SU.clone(src.scene);const bones={};root.traverse(b=>{if(b.isBone&&!bones[b.name])bones[b.name]=b});
    const g=new T.Group();g.add(root);
    // head, eyes and brows from the base character, bound to this skeleton
    const H=SU.clone(hd.scene);const hs=[];H.traverse(c=>{if(c.isMesh)hs.push(c)});let headInv=null;
    for(const c of hs)if(c.isSkinnedMesh){const sk=c.skeleton,i=sk.bones.findIndex(b=>b.name==='Head');if(!headInv)headInv=sk.boneInverses[i];c.bind(new T.Skeleton(sk.bones.map(b=>bones[b.name]||b),sk.boneInverses),c.bindMatrix);root.add(c)}
    H.updateMatrixWorld(true);const hairs=[].concat(o.hair||[],o.beard?['Hair_Beard']:[]);
    for(const c of hs){if(c.isSkinnedMesh||!hairs.includes(c.name))continue;const M=headInv.clone().multiply(c.matrixWorld);c.parent.remove(c);M.decompose(c.position,c.quaternion,c.scale);c.material=tintMat(c.material,o.hairCol||0x14100c,'h');bones.Head.add(c)}
    // materials: cloth recolour, skin tint, brow colour
    root.traverse(m=>{if(!m.isMesh)return;m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;const n=m.name,mn=m.material.name||'';
      if(/Hood/.test(n)&&o.hood===false){m.visible=false;return}
      if(/Pauldron/.test(n)&&o.pauldron===false){m.visible=false;return}
      if(/Eyebrows/.test(n))m.material=tintMat(m.material,o.hairCol||0x14100c,'b');
      else if(/Regular|Superhero/i.test(mn)){if(o.skin!=null)m.material=tintMat(m.material,o.skin,'s')}
      else if(/Ranger|Peasant/.test(mn))m.material=recolorMat(m.material,outfit,o.recolor)});
    // upright sockets on the head and right hand (bind pose)
    root.updateMatrixWorld(true);const q=new T.Quaternion(),v=new T.Vector3();
    const sock=(B,wp)=>{const s=new T.Group();B.add(s);B.getWorldQuaternion(q);s.quaternion.copy(q.invert());if(wp){B.worldToLocal(v.copy(wp));s.position.copy(v)}return s};
    const headTop=sock(bones.Head,new T.Vector3(0,1.81,.01));
    for(const k of[].concat(o.hat||[],o.topknot?['topknot']:[],o.band?['band']:[],o.mask?['mask']:[],o.horns?['horns']:[]))headTop.add(hat(k,o));
    // right hand socket: its +z runs along a gripped blade (measured from the sword-idle clip)
    const hand=new T.Group();bones.hand_r.add(hand);hand.position.set(.085,-.01,.02);hand.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(.42,.52,-.74).normalize());
    const leftHand=new T.Group();bones.hand_l.add(leftHand);leftHand.position.set(-.085,.01,.02);
    g.scale.setScalar(o.scale||1);
    // animation
    const mx=new T.AnimationMixer(root);const acts={};const act=n=>acts[n]||(acts[n]=mx.clipAction(clipOf(n)));
    const ch={g,root,bones,hand,leftHand,headTop,mixer:mx,base:null,shot:null,shotT:0,dead:false};
    ch.loop=(n,ts,fade)=>{ts=ts==null?1:ts;if(ch.base===n){act(n).timeScale=ts;return}const a=act(n);const prev=ch.base&&act(ch.base);a.enabled=true;a.setLoop(T.LoopRepeat);a.timeScale=ts;
      if(!ch.shot){a.reset().setEffectiveWeight(1).play();if(prev){a.crossFadeFrom(prev,fade==null?.25:fade,false)}}ch.base=n};
    ch.once=(n,op)=>{op=op||{};const a=act(n);const prev=ch.shot?act(ch.shot):ch.base?act(ch.base):null;a.reset();a.enabled=true;a.setLoop(T.LoopOnce,1);a.clampWhenFinished=true;a.timeScale=op.ts||1;a.setEffectiveWeight(1).play();
      if(op.from)a.time=op.from*a.getClip().duration;if(prev&&prev!==a)a.crossFadeFrom(prev,op.fade==null?.12:op.fade,false);ch.shot=n;ch.hold=!!op.hold;ch.shotEnd=(op.to||1)*a.getClip().duration;return a};
    ch.playing=n=>ch.shot===n;
    ch.update=dt=>{mx.update(dt);if(ch.shot&&!ch.hold){const a=act(ch.shot);if(a.time>=ch.shotEnd-.001||!a.isRunning()){const b=ch.base&&act(ch.base);ch.shot=null;if(b){b.reset().setEffectiveWeight(1).play();b.crossFadeFrom(a,.25,false)}}}};
    ch.loop(o.idle||'Idle_Loop');ch.update(Math.random()*2);return ch}
  const clipLen=n=>clipOf(n).duration;
  return{ASSETS,ok,make,clipLen,hat}})();
