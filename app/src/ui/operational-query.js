import {shiftWindows,classifyRecord,normalizeShift} from '../domain/shifts.js';
import {eventDate} from '../domain/time.js';
import {matchesScope} from '../domain/production-policy.js';
import {buildDashboard} from '../domain/dashboard.js';
export function buildOperationalQuery(consultation){
 const shift=consultation.shift??'all',context=Object.fromEntries(Object.entries(consultation.context??{}).filter(([k,v])=>k!=='shift'&&v!==''&&v!=null)),windows=shiftWindows(consultation.fromDate,consultation.toDate,shift),range={from:windows[0].from,to:windows.at(-1).to};
 return {consultation:{...consultation,shift,context},windows,range,query:{fromDate:eventDate(range.from),toDate:eventDate(range.to-1),context,limit:500,dataset:consultation.dataset??'all'}};
}
export function selectOperationalPeriod(period,op){
 const selected={...period,effective:{},unallocated:{},coverage:{...period.coverage},operationalQuery:op};
 for(const kind of ['production','stoppages','collections','losses']){
  const source=period.effective?.[kind]??period[kind]??[],included=[],allocated=[],unallocated=[];
  for(const row of source){
   if(!matchesScope(op.consultation.context,row.context??{}))continue;
   const d=classifyRecord(kind,row,op.windows),dateOnly=row.timePrecision==='date'&&row.eventDate>=op.consultation.fromDate&&row.eventDate<=op.consultation.toDate;
   if(!d.included&&!dateOnly&&!d.diagnostics.includes('time-required'))continue;
   const copy={...row,queryDiagnostics:d.diagnostics};included.push(copy);
   const whole=op.windows.some(w=>row.startedAt>=w.from&&row.endedAt<=w.to),all=op.consultation.shift==='all';
   if((all&&(d.included||dateOnly)&&(kind!=='production'||whole))||d.allocated||(kind==='stoppages'&&d.included))allocated.push(copy);
   else unallocated.push(copy);
  }
  selected[kind]=included;selected.effective[kind]=allocated;selected.unallocated[kind]=unallocated;
  if(unallocated.length)selected.coverage[kind]=false;
 }
 selected.plans=(period.plans??[]).filter(p=>matchesScope(op.consultation.context,p.context??{})&&op.windows.some(w=>p.startedAt<w.to&&p.endedAt>w.from)&&(op.consultation.shift==='all'||normalizeShift(p.context?.shift)===op.consultation.shift));
 selected.corrections=(period.corrections??[]).filter(c=>(selected[c.recordType]??[]).some(r=>r.id===c.recordId));
 return selected;
}
const preferenceKey=(uid,source)=>'msa.consultation.v2.'+encodeURIComponent(uid)+'.'+source;
export function readAccountConsultation(uid,source,storage=globalThis.localStorage){try{const value=JSON.parse(storage.getItem(preferenceKey(uid,source)));return {...value,shift:['all','1','2','3'].includes(value?.shift)?value.shift:'all'};}catch{return {shift:'all'};}}
export function writeAccountConsultation(uid,source,patch,storage=globalThis.localStorage){const next={...readAccountConsultation(uid,source,storage),...patch};storage.setItem(preferenceKey(uid,source),JSON.stringify(next));return next;}
export async function loadOperationalView({services,repo,consultation,now=Date.now()}){
 const op=buildOperationalQuery(consultation);
 const [raw,technical,pendingBase,parameters]=await Promise.all([services.history.loadPeriod(op.query),services.technical.records().catch(error=>{if(['FORBIDDEN','INVALID_PATH'].includes(error.code))return [];throw error;}),services.history.loadPeriod({...op.query,fromDate:'1970-01-01',toDate:eventDate(now),maxPages:100}),repo.get('parameters')]);
 pendingBase.corrections=(pendingBase.corrections??[]).filter(c=>(pendingBase[c.recordType]??[]).some(r=>r.id===c.recordId));
 const period=selectOperationalPeriod(raw,op),dashboard=buildDashboard({...period,...period.effective,parameters},{context:op.query.context,...op.range,windows:op.windows,complete:period.complete});
 return {period,dashboard,technical,pendingBase,operationalQuery:op,asOf:now};
}
