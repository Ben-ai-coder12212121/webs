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
