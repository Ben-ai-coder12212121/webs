import {NodeIO} from '@gltf-transform/core';import {simplify,weld,dedup,prune,join,flatten} from '@gltf-transform/functions';import {MeshoptSimplifier} from 'meshoptimizer';import fs from 'fs';
await MeshoptSimplifier.ready;const io=new NodeIO();const doc=await io.read('chars/car.glb');
const drop=new Set(['interior_light','interior_dark','leather','carpet','trim','carbon_fibre_trim','carbon fibre','brakes','wipers','leds','blue','yellow_trim','brake','nuts','centre','steering_wheel','steering_carbon','steering_centre','steering_column','steering_leather','steering_metal','steering_red_lights','steering_trim']);
for(const n of doc.getRoot().listNodes())if(drop.has(n.getName())){n.dispose()}
await doc.transform(weld({tolerance:.002,toleranceNormal:.5}),simplify({simplifier:MeshoptSimplifier,ratio:.08,error:.25,lockBorder:false}),dedup(),prune());
let tris=0;for(const m of doc.getRoot().listMeshes())for(const p of m.listPrimitives())tris+=p.getIndices()?p.getIndices().getCount()/3:0;
for(const n of doc.getRoot().listNodes())console.log(n.getName(),n.getMesh()?n.getMesh().listPrimitives().map(p=>p.getMaterial().getName()+':'+(p.getIndices().getCount()/3)).join(' '):'', n.getTranslation().map(v=>v.toFixed(2)).join(','));
await io.write('out/models/car.glb',doc);console.log('tris',tris,(fs.statSync('out/models/car.glb').size/1e6).toFixed(2)+'MB')
