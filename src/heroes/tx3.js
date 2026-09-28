/* ---------------- weapons (CS2-style stats; distances in metres, 1 unit = 2.54 cm) ---------------- */
// dmg, pen = armour penetration, rpm, mag/res, rel = reload s, spd = max move speed (u/s), rng = range modifier per 500u, inacc: st(stand) cr(crouch) mv(move full) jp(jump) in radians, pat = recoil pattern key, kick = per-shot pitch kick (deg) for non-pattern
const U2M=.0254;
const WPN={
 knife:{n:'Knife',cls:'melee',slot:3,dmg:40,spd:250,kill:1500},
 glock:{n:'Glock-18',cls:'pistol',slot:2,side:'T',price:200,dmg:30,pen:.47,rpm:400,mag:20,res:120,rel:2.27,spd:240,rng:.85,st:.0056,cr:.0042,mv:.028,jp:.18,kick:1.3,kill:300,snd:'pistol'},
 usp:{n:'USP-S',cls:'pistol',slot:2,side:'CT',price:200,dmg:35,pen:.505,rpm:352,mag:12,res:24,rel:2.17,spd:240,rng:.91,st:.0035,cr:.0028,mv:.025,jp:.18,kick:1.5,kill:300,snd:'sup'},
 p250:{n:'P250',cls:'pistol',slot:2,price:300,dmg:38,pen:.64,rpm:400,mag:13,res:26,rel:2.2,spd:240,rng:.85,st:.0055,cr:.0045,mv:.03,jp:.2,kick:1.8,kill:300,snd:'pistol'},
 tec9:{n:'Tec-9',cls:'pistol',slot:2,side:'T',price:500,dmg:33,pen:.906,rpm:500,mag:18,res:90,rel:2.5,spd:240,rng:.83,st:.0065,cr:.005,mv:.03,jp:.2,kick:1.6,kill:300,snd:'pistol'},
 fiveseven:{n:'Five-SeveN',cls:'pistol',slot:2,side:'CT',price:500,dmg:32,pen:.912,rpm:400,mag:20,res:100,rel:2.2,spd:240,rng:.81,st:.005,cr:.004,mv:.028,jp:.2,kick:1.5,kill:300,snd:'pistol'},
 deagle:{n:'Desert Eagle',cls:'pistol',slot:2,price:700,dmg:53,pen:.932,rpm:267,mag:7,res:35,rel:2.2,spd:230,rng:.81,st:.0046,cr:.004,mv:.12,jp:.35,kick:4.5,kill:300,snd:'deagle'},
 mac10:{n:'MAC-10',cls:'smg',slot:1,side:'T',price:1050,dmg:29,pen:.575,rpm:800,mag:30,res:100,rel:2.6,spd:240,rng:.8,st:.012,cr:.009,mv:.03,jp:.15,pat:'smg',kill:600,auto:1,snd:'smg'},
 mp9:{n:'MP9',cls:'smg',slot:1,side:'CT',price:1250,dmg:26,pen:.6,rpm:857,mag:30,res:120,rel:2.1,spd:240,rng:.87,st:.011,cr:.008,mv:.028,jp:.15,pat:'smg',kill:600,auto:1,snd:'smg'},
 ump:{n:'UMP-45',cls:'smg',slot:1,price:1200,dmg:35,pen:.65,rpm:666,mag:25,res:100,rel:3.5,spd:230,rng:.75,st:.011,cr:.008,mv:.03,jp:.15,pat:'smg',kill:600,auto:1,snd:'smg'},
 p90:{n:'P90',cls:'smg',slot:1,price:2350,dmg:26,pen:.69,rpm:857,mag:50,res:100,rel:3.3,spd:230,rng:.84,st:.012,cr:.009,mv:.03,jp:.15,pat:'smg',kill:300,auto:1,snd:'smg'},
 nova:{n:'Nova',cls:'shotgun',slot:1,price:1050,dmg:26,pel:9,pen:.5,rpm:68,mag:8,res:32,rel:4,spd:220,rng:.7,st:.06,cr:.055,mv:.07,jp:.2,kick:5,kill:900,snd:'shotgun',maxR:28},
 xm:{n:'XM1014',cls:'shotgun',slot:1,price:2000,dmg:20,pel:6,pen:.8,rpm:171,mag:7,res:32,rel:4,spd:215,rng:.7,st:.05,cr:.045,mv:.07,jp:.2,kick:3.5,kill:900,auto:1,snd:'shotgun',maxR:26},
 galil:{n:'Galil AR',cls:'rifle',slot:1,side:'T',price:1800,dmg:30,pen:.775,rpm:666,mag:35,res:90,rel:2.45,spd:215,rng:.98,st:.0065,cr:.005,mv:.12,jp:.4,pat:'rifle',kill:300,auto:1,snd:'rifle'},
 famas:{n:'FAMAS',cls:'rifle',slot:1,side:'CT',price:2050,dmg:30,pen:.7,rpm:666,mag:25,res:90,rel:3.3,spd:220,rng:.96,st:.006,cr:.0045,mv:.11,jp:.4,pat:'rifle',kill:300,auto:1,snd:'rifle'},
 ak:{n:'AK-47',cls:'rifle',slot:1,side:'T',price:2700,dmg:36,pen:.775,rpm:600,mag:30,res:90,rel:2.43,spd:215,rng:.98,st:.0048,cr:.0036,mv:.14,jp:.45,pat:'ak',kill:300,auto:1,snd:'ak'},
 m4a4:{n:'M4A4',cls:'rifle',slot:1,side:'CT',price:3100,dmg:33,pen:.7,rpm:666,mag:30,res:90,rel:3.07,spd:225,rng:.97,st:.0042,cr:.0032,mv:.12,jp:.42,pat:'m4',kill:300,auto:1,snd:'m4'},
 m4a1s:{n:'M4A1-S',cls:'rifle',slot:1,side:'CT',price:2900,dmg:38,pen:.7,rpm:600,mag:20,res:80,rel:3.07,spd:225,rng:.99,st:.0035,cr:.0027,mv:.11,jp:.42,pat:'m4s',kill:300,auto:1,snd:'sup'},
 sg553:{n:'SG 553',cls:'rifle',slot:1,side:'T',price:3000,dmg:30,pen:1,rpm:545,mag:30,res:90,rel:2.8,spd:210,rng:.98,st:.005,cr:.004,mv:.13,jp:.45,pat:'ak',kill:300,auto:1,scope:1.6,sst:.0025,snd:'rifle'},
 aug:{n:'AUG',cls:'rifle',slot:1,side:'CT',price:3300,dmg:28,pen:.9,rpm:600,mag:30,res:90,rel:3.8,spd:220,rng:.98,st:.0045,cr:.0035,mv:.12,jp:.45,pat:'m4',kill:300,auto:1,scope:1.6,sst:.0022,snd:'rifle'},
 ssg:{n:'SSG 08',cls:'sniper',slot:1,price:1700,dmg:88,pen:.85,rpm:48,mag:10,res:90,rel:3.7,spd:230,rng:.99,st:.03,cr:.028,mv:.12,jp:.02,sst:.0012,scope:2.4,scope2:6,kick:3,kill:300,snd:'sniper'},
 awp:{n:'AWP',cls:'sniper',slot:1,price:4750,dmg:115,pen:.975,rpm:41,mag:5,res:30,rel:3.67,spd:200,rng:.99,st:.07,cr:.06,mv:.25,jp:.5,sst:.0008,scope:2.4,scope2:8,kick:6,kill:100,snd:'awp'},
 he:{n:'HE Grenade',cls:'gren',slot:4,price:300,gren:'he',spd:245},flash:{n:'Flashbang',cls:'gren',slot:4,price:200,gren:'flash',spd:245,max:2},smoke:{n:'Smoke Grenade',cls:'gren',slot:4,price:300,gren:'smoke',spd:245},
 molotov:{n:'Molotov',cls:'gren',slot:4,side:'T',price:400,gren:'molotov',spd:245},incgren:{n:'Incendiary',cls:'gren',slot:4,side:'CT',price:600,gren:'molotov',spd:245},
 bomb:{n:'C4',cls:'bomb',slot:5,spd:250}};
const PAT={// cumulative recoil (yaw, pitch) in degrees per bullet, CS-like shapes
 ak:[[0,0],[0,.35],[0,1],[.1,1.9],[-.1,2.9],[-.2,3.9],[-.1,4.9],[.3,5.7],[.9,6.3],[1.7,6.7],[2.5,6.9],[2.3,7.1],[1.4,7.3],[.3,7.4],[-.9,7.5],[-2.1,7.6],[-3.1,7.7],[-3.7,7.8],[-3.3,8],[-2.5,8.1],[-1.6,8.1],[-.6,8.2],[.6,8.2],[1.8,8.3],[2.6,8.2],[3.1,8.3],[2.5,8.4],[1.6,8.4],[.8,8.5],[0,8.5]],
 m4:[[0,0],[0,.3],[0,.8],[.05,1.5],[-.05,2.3],[-.15,3.1],[0,3.8],[.35,4.4],[.8,4.9],[1.3,5.2],[1.6,5.4],[1.3,5.6],[.6,5.8],[-.3,5.9],[-1.2,6],[-1.9,6.1],[-2.3,6.2],[-2,6.3],[-1.3,6.4],[-.5,6.4],[.4,6.5],[1.2,6.5],[1.8,6.6],[1.5,6.7],[.9,6.7],[.2,6.8],[-.5,6.8],[-1,6.9],[-.6,6.9],[0,7]]};
PAT.m4s=PAT.m4.slice(0,20).map(([a,b])=>[a*.8,b*.85]);PAT.rifle=PAT.m4.map(([a,b])=>[a*1.05,b*1.05]);PAT.smg=PAT.m4.map(([a,b],i)=>[a*.7+Math.sin(i*1.3)*.3,b*.55]);
const BUYCATS=[['PISTOLS',['glock','usp','p250','tec9','fiveseven','deagle']],['MID-TIER',['mac10','mp9','ump','p90','nova','xm']],['RIFLES',['galil','famas','ak','m4a4','m4a1s','sg553','aug','ssg','awp']],['GEAR',['vest','vesthelm','kit']],['GRENADES',['flash','smoke','he','molotov','incgren']]];
const GEAR={vest:{n:'Kevlar Vest',price:650},vesthelm:{n:'Kevlar + Helmet',price:1000},kit:{n:'Defuse Kit',price:400,side:'CT'}};
const RARITY=[['#e8e8e8','Common'],['#6aff7a','Uncommon'],['#5ab0ff','Rare'],['#d88aff','Epic'],['#ffc03a','Legendary']];
const ROYW={glock:0,usp:0,p250:1,fiveseven:1,deagle:2,mac10:1,mp9:1,ump:1,p90:2,nova:1,xm:2,galil:2,famas:2,ak:3,m4a4:3,m4a1s:3,sg553:3,aug:3,ssg:3,awp:4};
const AMMOT=w=>{const c=WPN[w].cls;return c==='pistol'||c==='smg'?'light':c==='shotgun'?'shell':c==='sniper'?'sniper':'heavy'};
/* ---------------- gun models ---------------- */
const GMAT={};const gm=(k,col,r,mt)=>GMAT[k]||(GMAT[k]=new T.MeshStandardMaterial({color:lin(col),roughness:r,metalness:mt}));
function gunModel(id,vm){const g=new T.Group();const steel=gm('steel',0x2c2e32,.35,.8),blk=gm('blk',0x1c1d20,.55,.3),poly=gm('poly',0x26282a,.7,.1),wood=gm('wood',0x7a4222,.55,0),wood2=gm('wood2',0x5a3420,.6,0),tan=gm('tan',0x8a7a58,.65,.1),od=gm('od',0x4a5a3a,.6,.1),brass=gm('brass',0xc8a040,.3,.9),glass=gm('glass',0x1a3040,.05,.6);
  const B=(w,h,d,x,y,z,m,rx)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),m||steel);b.position.set(x,y,z);if(rx)b.rotation.x=rx;g.add(b);return b},C=(r,l,x,y,z,m,seg)=>{const b=new T.Mesh(new T.CylinderGeometry(r,r,l,seg||12),m||steel);b.rotation.x=PI/2;b.position.set(x,y,z);g.add(b);return b};
  const mag=new T.Group();g.add(mag);g.userData.mag=mag;const Mg=(w,h,d,x,y,z,m,rx)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),m||steel);b.position.set(x,y,z);if(rx)b.rotation.x=rx;mag.add(b);return b};
  const slide=new T.Group();g.add(slide);g.userData.slide=slide;
  const W=WPN[id]||{};let mz=-.3,ej=[.03,.02,-.05];
  if(id==='knife'){B(.03,.036,.13,0,0,.05,poly);B(.034,.012,.03,0,.012,-.02,steel);const bl=new T.Mesh(new T.BoxGeometry(.006,.034,.2),gm('blade',0xd8dce0,.15,1));bl.position.set(0,.006,-.13);g.add(bl);const tip=new T.Mesh(new T.ConeGeometry(.017,.05,4),gm('blade',0xd8dce0,.15,1));tip.rotation.x=-PI/2;tip.scale.set(.35,1,1);tip.position.set(0,.006,-.255);g.add(tip);mz=-.2}
  else if(W.cls==='pistol'){const L=id==='deagle'?.27:id==='tec9'?.24:.2;const sm=id==='deagle'?gm('chrome',0xb8bcc0,.2,1):id==='tec9'?blk:steel;const s=new T.Mesh(new T.BoxGeometry(.034,.036,L),sm);s.position.set(0,.024,-L/2+.04);slide.add(s);for(let i=0;i<5;i++){const r2=new T.Mesh(new T.BoxGeometry(.036,.026,.006),blk);r2.position.set(0,.024,.02-i*.012);slide.add(r2)}
    B(.03,.026,L*.85,0,-.004,-L/2+.06,poly);B(.03,.11,.048,0,-.06,.03,poly,.22);B(.006,.012,.01,0,.046,-L+.06,steel);B(.018,.01,.01,0,.046,.03,steel);const tg=new T.Mesh(new T.TorusGeometry(.018,.004,4,10,PI),poly);tg.position.set(0,-.028,-.01);tg.rotation.y=PI/2;g.add(tg);
    if(id==='usp'){C(.016,.14,0,.024,-L-.02,blk,14);mz=-L-.1}else mz=-L+.02;Mg(.026,.03,.04,0,-.12,.035,blk,.22);ej=[.02,.03,-.02]}
  else if(W.cls==='smg'){const bodyM=id==='p90'?blk:id==='ump'?poly:steel;B(.05,.075,.3,0,.01,-.08,bodyM);C(.013,.12,0,.02,-.3);B(.034,.09,.045,0,-.06,.02,poly,.3);B(.012,.02,.2,0,.056,-.08,steel);B(.018,.03,.02,0,.056,-.18,steel);if(id==='p90'){B(.05,.03,.26,0,.06,-.06,gm('p90t',0x3a4a3a,.5,.2))}else Mg(.03,.16,.045,0,-.1,-.1,blk,.12);if(id!=='mac10')B(.035,.06,.22,0,0,.18,poly);mz=-.37}
  else if(W.cls==='shotgun'){B(.046,.06,.32,0,.01,-.05,blk);C(.017,.48,0,.03,-.42,steel);C(.02,.26,0,-.012,-.32,id==='nova'?poly:blk);B(.035,.1,.05,0,-.05,.06,poly,.35);B(.042,.08,.24,0,-.02,.24,id==='nova'?poly:blk,-.1);mz=-.68}
  else if(W.cls==='rifle'){const ak=id==='ak'||id==='galil';const furn=ak?wood:id==='famas'||id==='aug'?od:id==='sg553'?tan:poly;
    B(.05,.08,.34,0,.01,-.04,steel);B(.052,.025,.3,0,.056,-.04,ak?steel:blk);C(.013,.38,0,.03,-.4,steel);B(.046,.056,.2,0,.008,-.28,furn);B(.012,.03,.012,0,.07,-.38,steel);
    const mg2=Mg(.036,.17,.06,0,-.11,-.07,ak?gm('akm',0x6a3a1a,.5,.2):blk,ak?.38:.18);if(ak){const m3=Mg(.036,.07,.06,0,-.21,-.02,gm('akm',0x6a3a1a,.5,.2),.7)}
    B(.032,.1,.042,0,-.06,.07,poly,.3);B(.042,.08,.26,0,-.012,.22,furn,-.05);B(.042,.06,.03,0,-.01,.35,blk);
    if(id==='m4a4'||id==='m4a1s'||id==='famas'){B(.022,.034,.18,0,.084,-.04,blk);B(.018,.03,.012,0,.1,.03,steel)}
    if(id==='m4a1s')C(.02,.18,0,.03,-.62,blk,14);if(id==='sg553'||id==='aug'){C(.024,.18,0,.11,-.04,blk,14);C(.03,.04,0,.11,-.14,glass,14)}mz=id==='m4a1s'?-.72:-.6}
  else if(W.cls==='sniper'){const green=id==='awp'?gm('awpg',0x3a5a3a,.55,.1):poly;B(.05,.08,.46,0,0,-.02,green);C(.014,id==='awp'?.62:.54,0,.02,-.55,steel);C(.028,.3,0,.1,-.05,blk,14);C(.034,.05,0,.1,-.21,glass,14);C(.032,.04,0,.1,.12,blk,14);B(.02,.05,.02,0,.06,-.12,blk);B(.02,.05,.02,0,.06,.05,blk);B(.03,.1,.042,0,-.06,.08,green,.3);B(.046,.1,.28,0,-.02,.3,green,-.08);Mg(.034,.07,.05,0,-.07,-.04,blk);const bolt=new T.Mesh(new T.SphereGeometry(.014,8,6),steel);bolt.position.set(.035,.03,.09);slide.add(bolt);mz=id==='awp'?-.88:-.8}
  else if(W.cls==='gren'){const col=id==='he'?0x4a5a3a:id==='flash'?0x9aa0a8:id==='smoke'?0x6a7a8a:0x6a3a1a;const s=new T.Mesh(id==='he'?new T.SphereGeometry(.04,12,10):id==='molotov'||id==='incgren'?new T.CylinderGeometry(.03,.034,.14,10):new T.CylinderGeometry(.03,.03,.11,12),gm('gr'+id,col,.5,.3));g.add(s);B(.014,.035,.014,0,.068,0,steel);const lever=B(.008,.07,.014,.03,.03,0,steel);if(id==='molotov'){const rag=new T.Mesh(new T.ConeGeometry(.018,.05,6),gm('rag',0xd8c8a0,.9,0));rag.position.y=.1;g.add(rag)}mz=0}
  else if(W.cls==='bomb'){B(.22,.09,.15,0,0,0,gm('c4',0x6a5a3a,.8,0));B(.09,.02,.07,.04,.055,0,gm('c4k',0x1a1a1a,.4,.2));const scr=new T.Mesh(new T.PlaneGeometry(.06,.02),new T.MeshBasicMaterial({color:0x40ff60}));scr.rotation.x=-PI/2;scr.position.set(.04,.066,-.018);g.add(scr);g.userData.scr=scr;for(let i=0;i<3;i++)C(.022,.2,-.06,.06,-.05+i*.05,gm('c4r',0xb8322a,.6,0)).rotation.set(0,0,PI/2);mz=0}
  g.userData.mz=mz;g.userData.ej=ej;g.traverse(o=>{if(o.isMesh){o.castShadow=!vm}});return g}
/* ---------------- characters ---------------- */
const CM={};const cmat=(col,r,mt)=>{const k=col+'_'+r;return CM[k]||(CM[k]=new T.MeshStandardMaterial({color:lin(col),roughness:r==null?.8:r,metalness:mt||0}))};
function limb(len,r1,r2,m){const g=new T.Group();const c=new T.Mesh(new T.CylinderGeometry(r2,r1,len,10),m);c.position.y=-len/2;g.add(c);const j=new T.Mesh(new T.SphereGeometry(r1*1.02,10,8),m);g.add(j);c.castShadow=j.castShadow=true;return g}
function mkChar(team,seedN){const g=new T.Group();const R2=mulberry((seedN||1)*9301+49297);const rp=a=>a[Math.floor(R2()*a.length)];
  const pal=team==='T'?{shirt:rp([0x8a7a58,0x7a6a4a,0x6a5a3a]),pants:rp([0x5a4a38,0x4a3e30]),vest:0x3a3226,skin:rp([0xc89878,0xb8845e,0xa87050]),head:'bala',hc:0x2a2622,acc:0xa8321e,glove:0x2a241e,boot:0x3a2c20}
    :team==='CT'?{shirt:rp([0x2e3a4a,0x34404e]),pants:rp([0x2a323e,0x262c36]),vest:0x1e2630,skin:rp([0xe0b090,0xc89878,0x8a5a3a]),head:'helm',hc:0x232a34,acc:0x3a4450,glove:0x1a1c20,boot:0x16181c}
    :{shirt:rp([0x5a6a3a,0x6a5a4a,0x3a3a4a,0x8a6a4a,0x4a5a6a,0x7a3a2a,0x3a5a5a]),pants:rp([0x3a3a3a,0x2a3a5a,0x5a4a3a,0x4a4a3a]),vest:0x3a3a30,skin:rp([0xe0b090,0xc89878,0x8a5a3a,0xf0c8a0,0x6a4028]),head:rp(['cap','hair','beanie','hair']),hc:rp([0x1a1a1a,0x5a3a1a,0xc8a060,0x3a2a1a,0x8a2a1a,0x2a4a2a]),acc:0x6a6a6a,glove:0x2a2a2a,boot:rp([0x2a2018,0x1a1a1a,0x5a4028])};
  const shirt=cmat(pal.shirt),pants=cmat(pal.pants),vestM=cmat(pal.vest,.7),skin=cmat(pal.skin,.6),hc=cmat(pal.hc,.6),glove=cmat(pal.glove),boot=cmat(pal.boot,.7);
  const hips=new T.Group();hips.position.y=.94;g.add(hips);const pelvis=new T.Mesh(new T.CylinderGeometry(.16,.15,.18,10),pants);pelvis.scale.z=.7;hips.add(pelvis);pelvis.castShadow=true;
  const legs=[-1,1].map(s=>{const hp=new T.Group();hp.position.set(s*.1,-.02,0);hips.add(hp);const th=limb(.44,.085,.07,pants);hp.add(th);const kn=new T.Group();kn.position.y=-.44;hp.add(kn);const sh=limb(.42,.065,.05,pants);kn.add(sh);const bt=new T.Mesh(new T.BoxGeometry(.11,.1,.24),boot);bt.position.set(0,-.44,-.04);bt.castShadow=true;kn.add(bt);return{hp,kn}});
  const torso=new T.Group();torso.position.y=.06;hips.add(torso);const chest=new T.Mesh(new T.CylinderGeometry(.19,.16,.52,10),shirt);chest.scale.z=.66;chest.position.y=.28;chest.castShadow=true;torso.add(chest);
  const vest=new T.Mesh(new T.BoxGeometry(.38,.4,.27),vestM);vest.position.y=.32;vest.castShadow=true;torso.add(vest);vest.visible=team!=='R';g.userData.vest=vest;for(let i=0;i<3;i++){const pch=new T.Mesh(new T.BoxGeometry(.08,.1,.05),cmat(pal.vest,.8));pch.position.set(-.1+i*.1,.24,-.15);vest.add(pch)}
  if(team==='T'){const sc=new T.Mesh(new T.CylinderGeometry(.1,.13,.08,10),cmat(pal.acc));sc.position.y=.56;torso.add(sc)}
  const bpack=new T.Mesh(new T.BoxGeometry(.3,.38,.14),cmat(team==='R'?rp([0x4a5a3a,0x5a4a3a,0x3a3a4a]):pal.vest));bpack.position.set(0,.3,.2);torso.add(bpack);bpack.visible=team!=='CT';
  const neck=new T.Mesh(new T.CylinderGeometry(.05,.06,.08,8),skin);neck.position.y=.58;torso.add(neck);
  const head=new T.Group();head.position.y=.72;torso.add(head);const hm=new T.Mesh(new T.SphereGeometry(.11,14,12),skin);hm.scale.set(.92,1.08,1);hm.castShadow=true;head.add(hm);
  const eyeM=cmat(0x111111,.3);[-1,1].forEach(s=>{const e=new T.Mesh(new T.SphereGeometry(.013,6,6),eyeM);e.position.set(s*.038,.015,-.095);head.add(e)});
  if(pal.head==='bala'){const b=new T.Mesh(new T.SphereGeometry(.116,14,12),hc);b.scale.set(.93,1.1,1.02);head.add(b);const slit=new T.Mesh(new T.BoxGeometry(.12,.035,.02),skin);slit.position.set(0,.015,-.105);head.add(slit);[-1,1].forEach(s=>{const e=new T.Mesh(new T.SphereGeometry(.013,6,6),eyeM);e.position.set(s*.038,.015,-.112);head.add(e)})}
  if(pal.head==='helm'){const hl=new T.Mesh(new T.SphereGeometry(.135,14,10,0,2*PI,0,PI*.55),hc);hl.position.y=.03;head.add(hl);const gg=new T.Mesh(new T.BoxGeometry(.15,.045,.03),cmat(0x223344,.1,.5));gg.position.set(0,.06,-.11);head.add(gg)}
  if(pal.head==='cap'){const c2=new T.Mesh(new T.SphereGeometry(.118,14,10,0,2*PI,0,PI*.5),hc);c2.position.y=.02;head.add(c2);const brim=new T.Mesh(new T.BoxGeometry(.14,.015,.09),hc);brim.position.set(0,.03,-.12);head.add(brim)}
  if(pal.head==='hair'){const hr=new T.Mesh(new T.SphereGeometry(.118,14,10,0,2*PI,0,PI*.45),hc);hr.position.y=.015;head.add(hr)}
  if(pal.head==='beanie'){const c2=new T.Mesh(new T.SphereGeometry(.12,14,10,0,2*PI,0,PI*.55),hc);c2.position.y=.02;head.add(c2)}
  const helmet=new T.Mesh(new T.SphereGeometry(.14,12,8,0,2*PI,0,PI*.55),cmat(0x3a4a3a,.6));helmet.position.y=.03;head.add(helmet);helmet.visible=false;g.userData.helmet=helmet;
  const arms=[-1,1].map(s=>{const sh=new T.Group();sh.position.set(s*.22,.5,0);torso.add(sh);const ua=limb(.29,.06,.052,shirt);sh.add(ua);const el2=new T.Group();el2.position.y=-.29;sh.add(el2);const fa=limb(.27,.05,.042,shirt);el2.add(fa);const hd=new T.Mesh(new T.SphereGeometry(.045,8,6),glove);hd.position.y=-.29;hd.scale.set(1,1.2,.8);el2.add(hd);return{sh,el:el2}});
  const gunHold=new T.Group();gunHold.position.set(.09,.4,-.3);torso.add(gunHold);
  g.userData=Object.assign(g.userData,{hips,torso,head,legs,arms,gunHold,gunId:null,ph:0,chest});g.traverse(o=>{if(o.isMesh)o.receiveShadow=true});return g}
function setCharGun(p){const u=p.mdl.userData,id=p.cur||'knife';if(u.gunId===id)return;u.gunHold.clear();const gmm=gunModel(id);gmm.scale.setScalar(1.25);u.gunHold.add(gmm);u.gunId=id;const cls=(WPN[id]||{}).cls;u.armPose=cls==='rifle'||cls==='sniper'||cls==='shotgun'||cls==='smg'?'long':cls==='pistol'?'pistol':'low'}
function poseChar(p,dt){const u=p.mdl.userData;const sp=Math.hypot(p.vx,p.vz);const run=Math.min(1,sp/4.5)*(p.onGround?1:.2);u.ph+=dt*sp*2.3;const s=Math.sin(u.ph),cr=p.crouchT||0;
  if(u.helmet)u.helmet.visible=!!p.helmet&&p.team==='R';if(u.vest)u.vest.visible=p.team!=='R'||p.armor>0;
  if(!p.alive){if(!u.dead){u.dead={t:0,dir:Math.random()<.5?1:-1,fwd:Math.random()<.6?-1:1}}const d=u.dead;d.t+=dt;const k=Math.min(1,d.t*2.4),e=1-Math.pow(1-k,3);
    p.mdl.rotation.x=d.fwd*e*PI/2*.96;p.mdl.rotation.z=d.dir*e*.25;p.mdl.position.y=p.y+e*.12;u.legs[0].kn.rotation.x=e*.9;u.legs[1].kn.rotation.x=e*.4;u.arms[0].sh.rotation.set(-e*2.6,0,-e*.5);u.arms[1].sh.rotation.set(-e*1.8,0,e*.9);u.arms[0].el.rotation.x=0;u.arms[1].el.rotation.x=-e*.4;u.head.rotation.x=e*.5*d.fwd;return}
  u.dead=null;p.mdl.rotation.x=0;p.mdl.rotation.z=0;
  u.legs[0].hp.rotation.x=s*.75*run-cr*1.15;u.legs[1].hp.rotation.x=-s*.75*run-cr*1.15;u.legs[0].kn.rotation.x=Math.max(0,-Math.cos(u.ph))*1.1*run+cr*2;u.legs[1].kn.rotation.x=Math.max(0,Math.cos(u.ph))*1.1*run+cr*2;
  if(!p.onGround){u.legs[0].kn.rotation.x=.9;u.legs[1].kn.rotation.x=.4;u.legs[0].hp.rotation.x=-.4}
  u.hips.position.y=.94-cr*.44+Math.abs(Math.cos(u.ph))*.03*run;const pit=clamp(p.pitch,-1,1);u.torso.rotation.x=-pit*.45+cr*.2+run*.08;u.torso.rotation.y=Math.sin(u.ph)*.06*run;u.head.rotation.x=-pit*.4;
  const ap=u.armPose;const ra=u.arms[1],la=u.arms[0];if(ap==='long'){ra.sh.rotation.set(-1.25-pit*.5,0,.1);ra.el.rotation.x=-.55;la.sh.rotation.set(-1.45-pit*.5,0,-.55);la.el.rotation.x=-.3;u.gunHold.position.set(.08,.44,-.3);u.gunHold.rotation.x=-pit*.55}
  else if(ap==='pistol'){ra.sh.rotation.set(-1.45-pit*.6,0,.25);ra.el.rotation.x=-.1;la.sh.rotation.set(-1.4-pit*.6,0,-.35);la.el.rotation.x=-.25;u.gunHold.position.set(.02,.5,-.52);u.gunHold.rotation.x=-pit*.6}
  else{ra.sh.rotation.set(Math.sin(u.ph+PI)*.5*run-.3,0,.15);ra.el.rotation.x=-.6;la.sh.rotation.set(Math.sin(u.ph)*.5*run,0,-.1);la.el.rotation.x=-.3;u.gunHold.position.set(.22,.02,-.12);u.gunHold.rotation.x=-.8}
  if(p.plantT>0||p.defT>0){u.hips.position.y=.5;u.legs.forEach(l=>{l.hp.rotation.x=-1.5;l.kn.rotation.x=2.3});u.torso.rotation.x=.5;ra.sh.rotation.set(-.6,0,.1);la.sh.rotation.set(-.6,0,-.1)}}
