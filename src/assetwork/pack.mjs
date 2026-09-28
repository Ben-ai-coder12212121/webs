import {NodeIO} from '@gltf-transform/core';import {dedup,prune,weld} from '@gltf-transform/functions';import fs from 'fs';
const io=new NodeIO();fs.mkdirSync('out/models',{recursive:true});
for(const k of fs.readdirSync('raw')){try{const doc=await io.read(`raw/${k}/model.gltf`);await doc.transform(dedup(),prune());await io.write(`out/models/${k}.glb`,doc);console.log(k,(fs.statSync(`out/models/${k}.glb`).size/1e6).toFixed(2)+'MB')}catch(e){console.log('ERR',k,e.message)}}
