import {NodeIO} from '@gltf-transform/core';import {simplify,weld,dedup,prune} from '@gltf-transform/functions';import {MeshoptSimplifier} from 'meshoptimizer';import fs from 'fs';
await MeshoptSimplifier.ready;const io=new NodeIO();
const R={boulder:.06,boulder2:.08,deadtrunk:.08,hydrant:.15,barrier:.12,barstool:.2,ship:.35,horse:.3,trashcan:.3,lantern:.4,streetlamp:.4,plcrate:.3};
for(const [k,r] of Object.entries(R)){const doc=await io.read(`out/models/${k}.glb`);await doc.transform(weld({tolerance:.0001}),simplify({simplifier:MeshoptSimplifier,ratio:r,error:.01}),dedup(),prune());await io.write(`out/models/${k}.glb`,doc);console.log(k,(fs.statSync(`out/models/${k}.glb`).size/1e6).toFixed(2)+'MB')}
