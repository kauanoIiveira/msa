import {createRegistryService} from '../../app/src/services/registry.js';
export async function seed(repo) {
  let id=0;const registry=createRegistryService({repo,actor:{uid:'admin',role:'admin'},idFactory:()=>`seed${++id}`});
  const m=await registry.create('machines',{name:'Synthetic machine'});
  const p=await registry.create('processes',{name:'Synthetic process',machineId:m.id});
  const q=await registry.create('products',{name:'Synthetic product',processIds:{[p.id]:true}});
  const parameter=await registry.create('parameters',{name:'Vacuum',processId:p.id});
  const version=await registry.createParameterVersion(parameter.id,{unit:'mmHg',nature:'measurement',status:'approved',rule:{kind:'upper',upper:-600}});
  const reasons={};
  for(const kind of ['stop','reject','material','rework']) reasons[kind]=(await registry.create('reasons',{name:`Synthetic ${kind}`,kind})).id;
  return {registry,context:{machineId:m.id,processId:p.id,productId:q.id},parameterId:parameter.id,versionId:version.id,reasons};
}
