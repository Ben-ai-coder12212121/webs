import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {prune,dedup,textureCompress,mergeDocuments,unpartition,weld} from '@gltf-transform/functions';import sharp from 'sharp';import fs from 'fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
const B='/tmp/claude-0/cc0/x_ubc/Universal Base Characters[Standard]/Base Characters/Godot - UE/';
const HR='/tmp/claude-0/cc0/x_ubc/Universal Base Characters[Standard]/Hairstyles/Origin at 0/glTF (Godot)/';
const d=await io.read(B+'Superhero_Male_FullBody.gltf');const r=d.getRoot();
// light skin
for(const t of r.listTextures())if(/Superhero_Male_Dark/.test(t.getURI()))t.setImage(fs.readFileSync(B+'T_Superhero_Male_Ligh.png'));
const body=r.listMeshes().find(m=>/Retopology/.test(m.getName()));const skin=r.listNodes().find(n=>n.getMesh()===body).getSkin();
const J=skin.listJoints().map(j=>j.getName());const headJ=new Set(['Head','neck_01'].map(n=>J.indexOf(n)));
for(const p of body.listPrimitives()){const jo=p.getAttribute('JOINTS_0'),we=p.getAttribute('WEIGHTS_0'),ix=p.getIndices();const n=jo.getCount();const hw=new Float32Array(n);const a=[],b=[];
 for(let i=0;i<n;i++){jo.getElement(i,a);we.getElement(i,b);let s=0;for(let k=0;k<4;k++)if(headJ.has(a[k]))s+=b[k];hw[i]=s}
 const src=ix.getArray(),out=[];for(let t=0;t<src.length;t+=3){const v=[src[t],src[t+1],src[t+2]];if(v.every(i=>hw[i]>.5))out.push(...v)}
 console.log('tris',src.length/3,'->',out.length/3);ix.setArray(new Uint32Array(out))}
body.setName('Head');
for(const h of['Hair_Buns','Hair_Long','Hair_SimpleParted','Hair_Beard','Hair_Buzzed']){const d2=await io.read(HR+h+'.gltf');for(const m of d2.getRoot().listMeshes())m.setName(h);mergeDocuments(d,d2)}
const sc=r.listScenes();for(const s of sc.slice(1)){for(const n of s.listChildren())sc[0].addChild(n);s.dispose()}r.setDefaultScene(sc[0]);
await d.transform(prune(),dedup(),textureCompress({encoder:sharp,targetFormat:'webp',resize:[1024,1024],quality:82}),unpartition());
await io.write('/home/user/webs/assets/chars/q_head.glb',d);
