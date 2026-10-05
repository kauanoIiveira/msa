import {assertRole,requireThat,knownKeys} from './errors.js';
import {assertPeriod} from './time.js';
import {parseReading} from './numbers.js';
import {stableStringify} from './canonical.js';
export function normalizeCorrection(record) {
  if(record?.recordType!=='collections') return record;
  const readings=record.replacement?.readings;
  if(!Array.isArray(readings)&&!Object.keys(readings??{}).every(key=>/^\d+$/.test(key))) return record;
  const mapped={};
  for(const r of Object.values(readings)) {requireThat(!mapped[r.parameterId],'DUPLICATE_PARAMETER');mapped[r.parameterId]=r;}
  return {...record,replacement:{...record.replacement,readings:mapped}};
}
export function nextReviewState(state,action,role) {
  assertRole({uid:'checked',role},['admin','engineer']);
  const next=action==='start'&&state==='waiting'?'analyzing':(['approved','rejected'].includes(action)&&state==='analyzing'?action:null);
  requireThat(next,'INVALID_TRANSITION');return next;
}
export function validateReplacement(type,original,replacement) {
  requireThat(['collections','production','losses','stoppages'].includes(type),'INVALID_KIND');
  knownKeys(replacement,Object.keys(original));
  for(const key of ['id','context','origin','createdBy','createdAt','timePrecision','eventDate','occurredAt','source','kind','unit','basis','planned']) {
    requireThat(stableStringify(replacement[key])===stableStringify(original[key]),'CORRECTION_CONTEXT',key);
  }
  if(type==='production') {
    requireThat(Number.isSafeInteger(replacement.quantity)&&replacement.quantity>=0&&replacement.quantity<=1e12,'INVALID_QUANTITY');assertPeriod(replacement.startedAt,replacement.endedAt);
  }
  if(type==='losses') requireThat(Number.isFinite(replacement.amount)&&replacement.amount>0&&replacement.amount<=1e12&&(replacement.unit==='kg'||Number.isSafeInteger(replacement.amount)),'INVALID_QUANTITY');
  if(type==='stoppages') {requireThat(replacement.endedAt!=null,'OPEN_STOPPAGE');assertPeriod(replacement.startedAt,replacement.endedAt);}
  if(type==='collections') {
    requireThat(Object.keys(original.readings).sort().join('|')===Object.keys(replacement.readings??{}).sort().join('|'),'CORRECTION_CONTEXT');
    for(const [id,r] of Object.entries(replacement.readings)) {
      const old=original.readings[id];requireThat(r.parameterId===old.parameterId&&r.versionId===old.versionId,'CORRECTION_CONTEXT');
      knownKeys(r,['parameterId','versionId','raw','status','value']);
      if(r.raw===old.raw&&r.status===old.status&&r.value===old.value) continue;
      const parsed=parseReading(r.raw);requireThat(r.status===parsed.status&&r.value===parsed.value,'INVALID_READINGS');
    }
  }
  return structuredClone(replacement);
}
