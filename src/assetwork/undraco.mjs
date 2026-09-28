import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import draco3d from 'draco3dgltf';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco3d.createDecoderModule()});
const d=await io.read(process.argv[2]);for(const e of d.getRoot().listExtensionsUsed())if(e.extensionName==='KHR_draco_mesh_compression')e.dispose();
for(const n of d.getRoot().listNodes()){const m=n.getMesh();console.log(n.getName(),m?m.listPrimitives().map(p=>(p.getMaterial()?.getName())+':'+(p.getIndices()?.getCount()/3|0)).join(' '):'')}
await io.write(process.argv[3],d);
