import {assertRole,assertId,knownKeys,requireThat} from '../domain/errors.js';
import {validateRule} from '../domain/limits.js';
import {loadContext} from '../domain/context.js';
import {validateDate} from '../domain/time.js';
export const registryKinds=['machines','processes','products','parameters','reasons','targets'];
const extras={machines:[],processes:['machineId'],products:['processIds'],parameters:['processId'],reasons:['kind'],targets:['metric','unit','fromDate','toDate','context','operator','threshold']};
export function createRegistryService({repo,actor,idFactory=()=>crypto.randomUUID()}) {
  const timestamp=()=>repo.timestamp();
  async function validate(kind,payload) {
    requireThat(registryKinds.includes(kind),'INVALID_KIND');
    knownKeys(payload,['name','code',...extras[kind]]);
    requireThat(typeof payload.name==='string'&&payload.name.trim().length>0&&payload.name.length<=160,'VALIDATION','name');
    if(payload.code!=null) requireThat(typeof payload.code==='string'&&payload.code.length<=100,'VALIDATION','code');
    if(['processes','parameters'].includes(kind)) {
      const field=kind==='processes'?'machineId':'processId',collection=kind==='processes'?'machines':'processes';
      requireThat((await repo.get(`${collection}/${assertId(payload[field],field)}`))?.active===true,'INVALID_REFERENCE',field);
    }
    if(kind==='products') {
      requireThat(payload.processIds&&Object.keys(payload.processIds).length>0&&Object.keys(payload.processIds).length<=100,'INVALID_REFERENCE','processIds');
      for(const [id,value] of Object.entries(payload.processIds)) requireThat(value===true&&(await repo.get(`processes/${assertId(id)}`))?.active===true,'INVALID_REFERENCE');
    }
    if(kind==='reasons') requireThat(['stop','reject','material','rework'].includes(payload.kind),'VALIDATION','kind');
    if(kind==='targets') {
      requireThat(({producedPieces:'pieces',stopMinutes:'minutes',rejectedPieces:'pieces',lossKg:'kg'})[payload.metric]===payload.unit,'INVALID_UNIT');
      requireThat(['lower','upper'].includes(payload.operator)&&Number.isFinite(payload.threshold)&&payload.threshold>=0,'VALIDATION','threshold');
      validateDate(payload.fromDate);validateDate(payload.toDate);requireThat(payload.fromDate<=payload.toDate,'INVALID_PERIOD');
      await loadContext(repo,payload.context);
    }
  }
  return {
    async create(kind,payload) {
      assertRole(actor,kind==='targets'?['admin','engineer']:['admin']);await validate(kind,payload);
      const id=assertId(idFactory());
      return repo.create(`${kind}/${id}`,{...payload,id,active:true,createdBy:actor.uid,createdAt:timestamp()});
    },
    async update(kind,id,patch) {
      assertRole(actor,kind==='targets'?['admin','engineer']:['admin']);requireThat(registryKinds.includes(kind),'INVALID_KIND');
      knownKeys(patch,['name','code','active']);
      if(patch.name!=null) requireThat(typeof patch.name==='string'&&patch.name.trim().length>0&&patch.name.length<=160,'VALIDATION','name');
      if(patch.code!=null) requireThat(typeof patch.code==='string'&&patch.code.length<=100,'VALIDATION','code');
      if('active'in patch) requireThat(typeof patch.active==='boolean','VALIDATION','active');
      const path=`${kind}/${assertId(id)}`;requireThat(await repo.get(path),'NOT_FOUND');return repo.updateRegistry(path,patch);
    },
    deactivate(kind,id) {return this.update(kind,id,{active:false});},
    async createParameterVersion(parameterId,payload) {
      assertRole(actor,['admin','engineer']);
      requireThat((await repo.get(`parameters/${assertId(parameterId)}`))?.active===true,'INVALID_REFERENCE');
      knownKeys(payload,['unit','nature','status','rule']);
      requireThat(typeof payload.unit==='string'&&payload.unit.trim().length>0&&payload.unit.length<=30,'INVALID_UNIT');
      requireThat(['measurement','setpoint'].includes(payload.nature)&&['draft','approved'].includes(payload.status),'VALIDATION');
      const rule=validateRule(payload.rule);requireThat(rule.kind!=='pending'||payload.status==='draft','INVALID_LIMIT');
      const id=assertId(idFactory());return repo.create(`parameterVersions/${id}`,{...payload,rule,id,parameterId,createdBy:actor.uid,createdAt:timestamp()});
    }
  };
}
