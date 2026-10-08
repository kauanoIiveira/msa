import {assertRole,assertId,knownKeys,requireThat} from '../domain/errors.js';
import {loadContext} from '../domain/context.js';
import {assertInstant,assertPeriod,eventDate,validateDate} from '../domain/time.js';
import {parseReading} from '../domain/numbers.js';
import {stableStringify} from '../domain/canonical.js';
const common=['id','context','origin','occurredAt','eventDate','timePrecision','source'];
export function createOperations({repo,actor,clock=Date.now,idFactory=()=>crypto.randomUUID()}) {
  async function createOnce(path,record){
    const existing=await repo.get(path);
    if(existing){const content=({createdAt,...rest})=>rest;requireThat(stableStringify(content(existing))===stableStringify(content(record)),'RECORD_CONFLICT');return existing;}
    try{return await repo.create(path,record);}catch(error){const confirmed=await repo.get(path).catch(()=>null);if(confirmed){const {createdAt:a,...left}=confirmed,{createdAt:b,...right}=record;requireThat(stableStringify(left)===stableStringify(right),'RECORD_CONFLICT');return confirmed;}throw error;}
  }
  async function reason(id,kind) {const r=await repo.get(`reasons/${assertId(id,'reasonId')}`);requireThat(r?.active===true&&r.kind===kind,'INVALID_REFERENCE','reasonId');}
  async function envelope(payload,extra) {
    assertRole(actor,['admin','operator','engineer']);knownKeys(payload,[...common,...extra]);
    const context=await loadContext(repo,payload.context),id=assertId(payload.id??idFactory());
    const origin=payload.origin??'manual';requireThat(['manual','import','demo'].includes(origin),'INVALID_ORIGIN');
    const timePrecision=payload.timePrecision??'instant';requireThat(['date','instant'].includes(timePrecision),'INVALID_TIME');
    let occurredAt,date;
    if(timePrecision==='date') {requireThat(origin==='import'&&payload.occurredAt==null,'INVALID_TIME');date=validateDate(payload.eventDate);}
    else {occurredAt=assertInstant(payload.occurredAt??payload.startedAt??clock());date=eventDate(occurredAt);if(payload.eventDate!=null) requireThat(payload.eventDate===date,'INVALID_DATE');}
    if(payload.source) {
      knownKeys(payload.source,['file','sheet','row','cells']);
      requireThat(typeof payload.source.file==='string'&&payload.source.file.length>0&&payload.source.file.length<=240,'INVALID_SOURCE');
      if(payload.source.row!=null) requireThat(Number.isSafeInteger(payload.source.row)&&payload.source.row>=1,'INVALID_SOURCE');
      for(const [key,length] of [['sheet',100],['cells',2000]]) if(payload.source[key]!=null) requireThat(typeof payload.source[key]==='string'&&payload.source[key].length<=length,'INVALID_SOURCE');
    }
    return {id,context,origin,timePrecision,eventDate:date,...(occurredAt!=null?{occurredAt}:{}),...(payload.source?{source:structuredClone(payload.source)}:{}),createdBy:actor.uid,createdAt:repo.timestamp()};
  }
  return {
    async recordCollection(payload) {
      const record=await envelope(payload,['readings']);requireThat(Array.isArray(payload.readings)&&payload.readings.length>0&&payload.readings.length<=100,'INVALID_READINGS');
      const readings={};
      for(const r of payload.readings) {
        knownKeys(r,['parameterId','versionId','raw']);assertId(r.parameterId);assertId(r.versionId);
        requireThat(!readings[r.parameterId],'DUPLICATE_PARAMETER');
        const p=await repo.get(`parameters/${r.parameterId}`),v=await repo.get(`parameterVersions/${r.versionId}`);
        requireThat(p?.active===true&&p.processId===record.context.processId&&v?.parameterId===r.parameterId,'INVALID_REFERENCE');
        const parsed=parseReading(r.raw);requireThat(parsed.raw==null||parsed.raw.length<=100,'INVALID_READINGS');
        readings[r.parameterId]={parameterId:r.parameterId,versionId:r.versionId,...parsed};
      }
      return createOnce(`collections/${record.id}`,{...record,readings});
    },
    async recordProduction(payload) {
      requireThat(payload.context?.machineId!=='nhpl'&&!await repo.get('productionPlans/'+assertId(payload.context?.machineId)),'PLANNING_REQUIRED');
      const record=await envelope(payload,['quantity','basis','startedAt','endedAt']);requireThat(record.timePrecision==='instant','INVALID_TIME');
      assertPeriod(payload.startedAt,payload.endedAt);
      requireThat(Number.isSafeInteger(payload.quantity)&&payload.quantity>=0&&payload.quantity<=1e12,'INVALID_QUANTITY');
      requireThat(['gross','good'].includes(payload.basis),'INVALID_BASIS');
      return createOnce(`production/${record.id}`,{...record,quantity:payload.quantity,basis:payload.basis,startedAt:payload.startedAt,endedAt:payload.endedAt});
    },
    async recordLoss(payload) {
      const record=await envelope(payload,['kind','unit','amount','reasonId']);requireThat(['reject','material','rework'].includes(payload.kind),'INVALID_KIND');
      requireThat(['kg','pieces'].includes(payload.unit),'INVALID_UNIT');
      requireThat(Number.isFinite(payload.amount)&&payload.amount>0&&payload.amount<=1e12&&(payload.unit==='kg'||Number.isSafeInteger(payload.amount)),'INVALID_QUANTITY');
      await reason(payload.reasonId,payload.kind);
      return createOnce(`losses/${record.id}`,{...record,kind:payload.kind,unit:payload.unit,amount:payload.amount,reasonId:payload.reasonId});
    },
    async startStoppage(payload) {
      const record=await envelope(payload,['startedAt','planned','reasonId']);requireThat(record.timePrecision==='instant','INVALID_TIME');assertInstant(payload.startedAt);
      requireThat(typeof payload.planned==='boolean','VALIDATION','planned');await reason(payload.reasonId,'stop');
      return createOnce(`stoppages/${record.id}`,{...record,startedAt:payload.startedAt,planned:payload.planned,reasonId:payload.reasonId});
    },
    async closeStoppage(id,payload) {
      assertRole(actor,['admin','operator','engineer']);assertId(id);knownKeys(payload,['endedAt','reasonId','goodValidated']);assertInstant(payload.endedAt);await reason(payload.reasonId,'stop');
      return repo.transact(`stoppages/${id}`,current=>{
        if(!current||current.endedAt!=null) return undefined;
        if(current.context.machineId==='nhpl')requireThat(payload.goodValidated===true,'QUALITY_REQUIRED');
        assertPeriod(current.startedAt,payload.endedAt);requireThat(current.reasonId===payload.reasonId,'CORRECTION_REQUIRED','reasonId');
        return {...current,endedAt:payload.endedAt,closedBy:actor.uid,closedAt:repo.timestamp(),...(payload.goodValidated===true?{goodValidated:true}:{})};
      });
    }
  };
}
