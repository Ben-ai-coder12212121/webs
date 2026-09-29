import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {prune,dedup,textureCompress,resample,weld,mergeDocuments,unpartition} from '@gltf-transform/functions';import sharp from 'sharp';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
const OUT='/home/user/webs/assets/chars/';const OF='/tmp/claude-0/cc0/x_outfits/Modular Character Outfits - Fantasy[Standard]/Exports/glTF (Godot-Unreal)/Outfits/';
const HR='/tmp/claude-0/cc0/x_ubc/Universal Base Characters[Standard]/Hairstyles/Origin at 0/glTF (Godot)/';
const tex=(size)=>textureCompress({encoder:sharp,targetFormat:'webp',resize:[size,size],quality:82,alphaQuality:90});
// cloth mask in the alpha channel of the outfit texture (1 = main cloth that games may recolour)
const MASK={Ranger:(r,g,b)=>g>r*1.12&&g>b*1.08&&g>18,Peasant:(r,g,b)=>{const mx=Math.max(r,g,b),mn=Math.min(r,g,b);return mx>120&&(mx-mn)/mx<.3&&r>=b}};
const L=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)};
async function maskTex(d,kind){for(const t of d.getRoot().listTextures()){if(!new RegExp('T_'+kind+'_BaseColor').test(t.getURI()))continue;
  const {data,info}=await sharp(Buffer.from(t.getImage())).resize(1024,1024).ensureAlpha().raw().toBuffer({resolveWithObject:true});let sum=0,n=0;
  const m=new Uint8Array(info.width*info.height);for(let i=0,j=0;i<data.length;i+=4,j++){const r=data[i],g=data[i+1],b=data[i+2];if(MASK[kind](r,g,b)){m[j]=255;sum+=Math.max(L(r),L(g),L(b));n++}}
  const mb=await sharp(Buffer.from(m),{raw:{width:info.width,height:info.height,channels:1}}).blur(1.2).extractChannel(0).raw().toBuffer();if(mb.length!==m.length)throw new Error('mask size '+mb.length);for(let j=0;j<mb.length;j++)data[j*4+3]=64+Math.round(mb[j]*191/255);
  console.log(kind,'mask ref',(sum/n).toFixed(3));t.setImage(await sharp(data,{raw:info}).png().toBuffer());t.setMimeType('image/png')}}
// outfits (Q_peasantf is built too but unused)
async function outfit(name,out,size=1024){const d=await io.read(OF+name+'.gltf');await maskTex(d,/Ranger/.test(name)?'Ranger':'Peasant');
  // drop normal/ORM maps' heavy variants: keep normal at lower res via same resize
  await d.transform(dedup(),prune(),tex(size),unpartition());await io.write(OUT+out,d);}
await outfit('Male_Ranger','q_ranger.glb');
await outfit('Male_Peasant','q_peasant.glb');
await outfit('Female_Peasant','q_peasantf.glb');
if(0){// hair pieces: static meshes (origin at 0 = bind position), one file
{const base=await io.read(HR+'Hair_Buns.gltf');for(const h of['Hair_Long','Hair_SimpleParted','Hair_Beard','Eyebrows_Regular','Hair_Buzzed']){const d2=await io.read(HR+h+'.gltf');mergeDocuments(base,d2)}
 // merge scenes into first
 const r=base.getRoot();const sc=r.listScenes();for(const s of sc.slice(1)){for(const n of s.listChildren())sc[0].addChild(n);s.dispose()}r.setDefaultScene(sc[0]);
 await base.transform(dedup(),prune(),tex(512),unpartition());await io.write(OUT+'q_hair.glb',base)}}
if(process.env.CLIPS){// animations: skeleton + chosen clips, no mesh
{const d=await io.read('/tmp/claude-0/cc0/x_ual/Universal Animation Library[Standard]/Unreal-Godot/UAL1_Standard.glb');const r=d.getRoot();
 const keep=new Set(process.env.CLIPS.split(','));for(const a of r.listAnimations())if(!keep.has(a.getName())){a.listChannels().forEach(c=>c.dispose());a.listSamplers().forEach(s=>{s.dispose()});a.dispose()}
 for(const n of r.listNodes())if(n.getMesh()){n.getMesh().dispose();n.setMesh(null);n.setSkin(null)}
 await d.transform(resample({tolerance:1e-4}),prune({keepLeaves:true}),unpartition());await io.write(OUT+'q_anims.glb',d)}}
