import {getMsaParameterCatalog} from '../catalog/msa-parameters.js';
import {assertId,assertRole,knownKeys,requireThat} from '../domain/errors.js';
import {stableStringify} from '../domain/canonical.js';
import {createRegistryService} from './registry.js';

export function createCatalogService(options) {
  const {repo,actor}=options;
  async function plan(processId) {
    assertId(processId,'processId');requireThat((await repo.get(`processes/${processId}`))?.active===true,'INVALID_REFERENCE','processId');
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`msa-catalog-v1:${processId}`));
    const prefix='msa_'+[...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,'0')).join('');
    const registered=Object.values(await repo.get('parameters')??{});
    return getMsaParameterCatalog().map(item=>{
      const parameterId=`${prefix}_${item.source.column}`,versionId=`${parameterId}_v1`;
      const existing=registered.filter(p=>p.processId===processId&&p.code===item.code);
      return {...item,parameterId,versionId,conflict:existing.some(p=>p.id!==parameterId)||existing.length>1};
    });
  }
  const matchesParameter=(record,item,processId)=>record.id===item.parameterId&&record.code===item.code&&record.processId===processId&&record.active===true;
  const matchesVersion=(record,item,nature)=>record.id===item.versionId&&record.parameterId===item.parameterId&&record.unit===item.unit&&record.nature===nature&&record.status==='draft'&&stableStringify(record.rule)===stableStringify(item.draftRule);
  async function ensure(path,create,matches) {
    let record=await repo.get(path);if(record) {requireThat(matches(record),'CATALOG_CONFLICT');return false;}
    try {record=await create();requireThat(matches(record),'CATALOG_CONFLICT');return true;}
    catch(error) {
      if(error.code!=='CONFLICT') throw error;
      record=await repo.get(path);requireThat(record&&matches(record),'CATALOG_CONFLICT');return false;
    }
  }
  return {
    async preview(payload) {
      assertRole(actor,['admin','operator','engineer','viewer']);knownKeys(payload,['processId']);
      return {items:await plan(payload.processId),writes:false};
    },
    async install(payload) {
      assertRole(actor,['admin']);knownKeys(payload,['processId','natureByCode','confirmed']);
      requireThat(payload.confirmed===true,'CONFIRMATION_REQUIRED');
      const items=await plan(payload.processId);knownKeys(payload.natureByCode,items.map(item=>item.code));
      // Validate the entire request before any write; network interruption can still leave a resumable partial install.
      for(const item of items) {
        const nature=payload.natureByCode[item.code];requireThat(['measurement','setpoint'].includes(nature),'NATURE_REQUIRED',item.code);
        requireThat(!item.conflict,'CATALOG_CONFLICT',item.code);
        const p=await repo.get(`parameters/${item.parameterId}`),v=await repo.get(`parameterVersions/${item.versionId}`);
        if(p) requireThat(matchesParameter(p,item,payload.processId),'CATALOG_CONFLICT',item.code);
        if(v) requireThat(matchesVersion(v,item,nature),'CATALOG_CONFLICT',item.code);
      }
      const result=[];
      for(const item of items) {
        const nature=payload.natureByCode[item.code];
        const parameterCreated=await ensure(`parameters/${item.parameterId}`,
          ()=>createRegistryService({...options,idFactory:()=>item.parameterId}).create('parameters',{name:item.name,code:item.code,processId:payload.processId}),
          record=>matchesParameter(record,item,payload.processId));
        const versionCreated=await ensure(`parameterVersions/${item.versionId}`,
          ()=>createRegistryService({...options,idFactory:()=>item.versionId}).createParameterVersion(item.parameterId,{unit:item.unit,nature,status:'draft',rule:item.draftRule}),
          record=>matchesVersion(record,item,nature));
        result.push({code:item.code,parameterId:item.parameterId,versionId:item.versionId,parameterCreated,versionCreated});
      }
      return {items:result};
    }
  };
}
