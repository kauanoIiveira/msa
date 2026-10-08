import {unionDuration,eventDate} from './time.js';
import {evaluateReading} from './limits.js';
import {summarizeReadings} from './statistics.js';
import {normalizeCorrection} from './review.js';
import {requireThat} from './errors.js';
import {analyzeCep} from './cep.js';
const sumKnown=(rows,key)=>rows.length?rows.reduce((n,r)=>n+r[key],0):null;
const contextKey=context=>JSON.stringify(Object.entries(context??{}).sort(([a],[b])=>a.localeCompare(b)));
function ranking(rows,key,unit) {
  const groups=new Map();for(const row of rows) groups.set(row.reasonId,(groups.get(row.reasonId)??0)+row[key]);
  const sorted=[...groups].sort((a,b)=>b[1]-a[1]),total=sorted.reduce((s,[,v])=>s+v,0);let cumulative=0;
  return sorted.map(([reasonId,value])=>{cumulative+=value;return {reasonId,value,unit,percent:total?value/total*100:0,cumulativePercent:total?cumulative/total*100:0};});
}
export function effectiveRecords(type,rows,corrections=[]) {
  const byId=new Map(),conflicts=[];
  for(const raw of corrections.filter(r=>r.state==='approved'&&r.recordType===type)) {
    const c=normalizeCorrection(raw),list=byId.get(c.recordId)??[];list.push(c);byId.set(c.recordId,list);
  }
  const items=rows.map(row=>{
    const revisions=byId.get(row.id)??[];
    if(revisions.length>1) {conflicts.push({recordId:row.id,correctionIds:revisions.map(r=>r.id)});return {...row,revisionConflict:true};}
    if(!revisions.length) return structuredClone(row);
    const correction=revisions[0],replacement=correction.replacement;
    return {...row,...replacement,...(type==='collections'?{readings:{...row.readings,...replacement.readings},originalReadings:structuredClone(row.readings)}:{}),originalId:row.id,correctionId:correction.id};
  });return {items,conflicts};
}
export function buildIndicators(data,{from,to,windows=[{from,to}],complete,sigmaMethod='population'}={}) {
  requireThat(Number.isSafeInteger(from)&&Number.isSafeInteger(to)&&from>=0&&to>from,'INVALID_PERIOD');
  const notes=[],alerts=[],series=[],groups=new Map();
  const collectionsComplete=data.coverage?.collections??complete===true;
  const production=data.production??[],losses=data.losses??[],stoppages=data.stoppages??[],collections=data.collections??[];
  const included=production.filter(p=>p.startedAt>=from&&p.endedAt<=to);
  if(production.some(p=>p.startedAt<to&&p.endedAt>from&&!included.includes(p))) {notes.push('production-crosses-period-no-proration');complete=false;}
  const gross=included.filter(p=>p.basis==='gross'),good=included.filter(p=>p.basis==='good');
  const rejected=losses.filter(l=>l.kind==='reject'&&l.unit==='pieces'),mass=losses.filter(l=>l.unit==='kg'&&l.kind!=='rework'),rework=losses.filter(l=>l.kind==='rework'&&l.unit==='pieces'),reworkMass=losses.filter(l=>l.kind==='rework'&&l.unit==='kg');
  const totals={grossPieces:sumKnown(gross,'quantity'),goodPieces:sumKnown(good,'quantity'),rejectedPieces:sumKnown(rejected,'amount'),lossKg:sumKnown(mass,'amount'),reworkPieces:sumKnown(rework,'amount'),reworkKg:sumKnown(reworkMass,'amount'),stopMinutes:null,openStoppages:0,rejectPercent:null};
  const perMachine=new Map();for(const s of stoppages) {const key=s.context.machineId,rows=perMachine.get(key)??[];rows.push(s);perMachine.set(key,rows);}
  let stopMs=0,overlap=false;
  for(const rows of perMachine.values()) {
    totals.openStoppages+=rows.filter(r=>r.endedAt==null&&windows.some(w=>r.startedAt<w.to)).length;
    for(const window of windows){const result=unionDuration(rows,window);stopMs+=result.milliseconds;overlap||=result.hasOverlap;}
  }
  if(stoppages.length) totals.stopMinutes=stopMs/60000;
  if(overlap) notes.push('overlapping-reasons');if(totals.openStoppages) notes.push('open-stoppages-not-final');
  const grossContexts=new Set(gross.map(p=>contextKey(p.context)));
  if(complete&&totals.grossPieces>0&&totals.rejectedPieces!=null&&rejected.every(r=>grossContexts.has(contextKey(r.context)))&&totals.rejectedPieces<=totals.grossPieces) totals.rejectPercent=totals.rejectedPieces/totals.grossPieces*100;
  if(!complete) notes.push('partial-dataset');
  for(const col of collections) {
    for(const reading of Object.values(col.readings??{})) {
      const version=data.parameterVersions?.[reading.versionId];const result=evaluateReading(reading,version);
      if(result.severity!=='none') alerts.push({kind:result.severity==='data'?'data':'parameter',collectionId:col.id,parameterId:reading.parameterId,...result});
      const key=`${contextKey(col.context)}|${reading.parameterId}|${reading.versionId}`;
      const group=groups.get(key)??{context:col.context,parameterId:reading.parameterId,versionId:reading.versionId,readings:[]};group.readings.push({...reading,revisionConflict:col.revisionConflict??false,occurredAt:col.occurredAt,timePrecision:col.timePrecision,eventDate:col.eventDate});groups.set(key,group);
      series.push({collectionId:col.id,eventDate:col.eventDate,occurredAt:col.occurredAt??null,timePrecision:col.timePrecision,context:col.context,parameterId:reading.parameterId,versionId:reading.versionId,raw:reading.raw??null,originalRaw:col.originalReadings?.[reading.parameterId]?.raw??reading.raw??null,originalId:col.originalId??col.id,correctionId:col.correctionId??null,revisionConflict:col.revisionConflict??false,origin:col.origin,source:col.source,value:reading.value??null,status:reading.status,state:col.revisionConflict?'revision-conflict':result.state});
    }
  }
  const statistics=[...groups.values()].map(g=>{
    const version=data.parameterVersions?.[g.versionId];
    const ordered=[...g.readings].sort((a,b)=>(a.occurredAt??0)-(b.occurredAt??0));
    const sequenceConfirmed=ordered.every((r,i)=>r.timePrecision==='instant'&&Number.isSafeInteger(r.occurredAt)&&(!i||r.occurredAt>ordered[i-1].occurredAt));
    const cep=analyzeCep(ordered,{version,sequenceConfirmed,complete:collectionsComplete,context:g.context});
    const trustedReadings=g.readings.map(r=>r.revisionConflict?{...r,status:'invalid',value:null}:r);
    return {...g,readings:undefined,...summarizeReadings(trustedReadings,{sigmaMethod,rule:version?.rule}),cp:cep.cp,cpk:cep.cpk,pp:cep.pp,ppk:cep.ppk,nConflicted:cep.nConflicted,capabilityReason:cep.reason,cep,unit:version?.unit??null,nature:version?.nature??null,versionStatus:version?.status??null};
  });
  const closed=stoppages.filter(s=>s.endedAt!=null&&windows.some(w=>s.startedAt<w.to&&s.endedAt>w.from)).map(s=>({...s,minutes:windows.reduce((n,w)=>n+Math.max(0,Math.min(s.endedAt,w.to)-Math.max(s.startedAt,w.from))/60000,0)}));
  const reasonRanking={stopMinutes:ranking(closed,'minutes','minutes'),rejectedPieces:ranking(rejected,'amount','pieces'),lossKg:ranking(mass,'amount','kg'),reworkPieces:ranking(rework,'amount','pieces'),reworkKg:ranking(reworkMass,'amount','kg')};
  for(const target of (data.targets??[]).filter(t=>t.active)) {
    if(!complete||target.fromDate!==eventDate(from)||target.toDate!==eventDate(to-1)) {notes.push(`target-window-unavailable:${target.id}`);continue;}
    const scoped={production:included.filter(r=>contextKey(r.context)===contextKey(target.context)),losses:losses.filter(r=>contextKey(r.context)===contextKey(target.context)),stoppages:stoppages.filter(r=>contextKey(r.context)===contextKey(target.context)),collections:[]};
    const t=buildIndicators(scoped,{from,to,complete:true}).totals;
    const value={producedPieces:t.grossPieces,stopMinutes:t.openStoppages?null:t.stopMinutes,rejectedPieces:t.rejectedPieces,lossKg:t.lossKg}[target.metric];
    if(value!=null&&((target.operator==='upper'&&value>target.threshold)||(target.operator==='lower'&&value<target.threshold))) alerts.push({kind:'target',targetId:target.id,metric:target.metric,unit:target.unit,value,threshold:target.threshold,operator:target.operator});
  }
  return {totals,series,statistics,alerts,reasonRanking,complete:complete===true,notes:[...new Set(notes)],from,to};
}
export function comparePeriods(datasets) {
  const comparable=datasets.length>=2&&datasets.every(d=>d.complete===true);
  const base=datasets[0]?.totals??{};
  const changes=datasets.slice(1).map(d=>Object.fromEntries(Object.keys(base).map(metric=>{
    const a=base[metric],b=d.totals[metric],valid=comparable&&Number.isFinite(a)&&Number.isFinite(b);
    return [metric,{difference:valid?b-a:null,percentChange:valid&&a!==0?(b-a)/a*100:null}];
  })));
  return {comparable,periods:datasets.map(d=>({from:d.from,to:d.to,totals:d.totals,complete:d.complete})),changes,reason:comparable?null:'incomplete-or-insufficient-periods'};
}
