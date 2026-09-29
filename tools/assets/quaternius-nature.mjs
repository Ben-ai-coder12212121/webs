import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {prune,dedup,textureCompress,mergeDocuments,unpartition,flatten,join,quantize,weld} from '@gltf-transform/functions';import sharp from 'sharp';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);const N='/tmp/claude-0/cc0/x_nature/glTF/';
const list=(process.env.LIST||'TwistedTree_1,TwistedTree_3,TwistedTree_5,CommonTree_1,CommonTree_3,Pine_2,Rock_Medium_1,Rock_Medium_2,Grass_Wispy_Tall,Flower_3_Group,Bush_Common').split(',');
const d=await io.read(N+list[0]+'.gltf');for(const n of list.slice(1))mergeDocuments(d,await io.read(N+n+'.gltf'));
const r=d.getRoot();const sc=r.listScenes();for(const s of sc.slice(1)){for(const n of s.listChildren())sc[0].addChild(n);s.dispose()}r.setDefaultScene(sc[0]);
// name each top node after its file
sc[0].listChildren().forEach((n,i)=>n.setName(list[i]));
await d.transform(dedup());
// leaves and grass: grey versions so games can tint them any colour (autumn red, gold, green)
for(const m of r.listMaterials()){if(!/Leaves|Grass/.test(m.getName()))continue;const t=m.getBaseColorTexture();if(!t||t.getExtras().grey)continue;
  const {data,info}=await sharp(Buffer.from(t.getImage())).ensureAlpha().raw().toBuffer({resolveWithObject:true});let mx=0;for(let i=0;i<data.length;i+=4){const l=.3*data[i]+.59*data[i+1]+.11*data[i+2];data[i]=data[i+1]=data[i+2]=l;if(data[i+3]>128&&l>mx)mx=l}
  const k=235/Math.max(1,mx);for(let i=0;i<data.length;i+=4){const v=Math.min(255,data[i]*k);data[i]=data[i+1]=data[i+2]=v}
  t.setImage(await sharp(data,{raw:info}).png().toBuffer());t.setMimeType('image/png');t.setExtras({grey:1});console.log('grey',m.getName(),mx|0)}
await d.transform(dedup(),prune(),textureCompress({encoder:sharp,targetFormat:'webp',resize:[512,512],quality:80,alphaQuality:90}),weld(),quantize({pattern:/^(NORMAL|TEXCOORD_0|TANGENT)$/}),unpartition());
await io.write('/home/user/webs/assets/models/n_nature.glb',d);
for(const n of sc[0].listChildren()){let v=0;n.traverse(x=>{if(x.getMesh())v+=x.getMesh().listPrimitives().reduce((a,p)=>a+p.getAttribute('POSITION').getCount(),0)});console.log(n.getName(),v)}
