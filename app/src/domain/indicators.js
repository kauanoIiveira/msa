import {unionDuration,eventDate} from './time.js';
import {evaluateReading} from './limits.js';
import {summarizeReadings} from './statistics.js';
import {normalizeCorrection} from './review.js';
import {requireThat} from './errors.js';
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
    return {...row,...replacement,...(type==='collections'?{readings:{...row.readings,...replacement.readings}}:{}),originalId:row.id,correctionId:correction.id};
  });return {items,conflicts};
}
export function buildIndicators(data,{from,to,complete,sigmaMethod='population'}={}) {
  requireThat(Number.isSafeInteger(from)&&Number.isSafeInteger(to)&&from>=0&&to>from,'INVALID_PERIOD');
  const notes=[],alerts=[],series=[],groups=new Map();
  const production=data.production??[],losses=data.losses??[],stoppages=data.stoppages??[],collections=data.collections??[];
  const included=production.filter(p=>p.startedAt>=from&&p.endedAt<=to);
  if(production.some(p=>p.startedAt<to&&p.endedAt>from&&!included.includes(p))) {notes.push('production-crosses-period-no-proration');complete=false;}
  const gross=included.filter(p=>p.basis==='gross'),good=included.filter(p=>p.basis==='good');
  const rejected=losses.filter(l=>l.kind==='reject'&&l.unit==='pieces'),mass=losses.filter(l=>l.unit==='kg'&&l.kind!=='rework'),rework=losses.filter(l=>l.kind==='rework'&&l.unit==='pieces'),reworkMass=losses.filter(l=>l.kind==='rework'&&l.unit==='kg');
  const totals={grossPieces:sumKnown(gross,'quantity'),goodPieces:sumKnown(good,'quantity'),rejectedPieces:sumKnown(rejected,'amount'),lossKg:sumKnown(mass,'amount'),reworkPieces:sumKnown(rework,'amount'),reworkKg:sumKnown(reworkMass,'amount'),stopMinutes:null,openStoppages:0,rejectPercent:null};
  const perMachine=new Map();for(const s of stoppages) {const key=s.context.machineId,rows=perMachine.get(key)??[];rows.push(s);perMachine.set(key,rows);}
  let stopMs=0,overlap=false;
  for(const rows of perMachine.values()) {const result=unionDuration(rows,{from,to});stopMs+=result.milliseconds;totals.openStoppages+=result.openCount;overlap||=result.hasOverlap;}
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
      const group=groups.get(key)??{context:col.context,parameterId:reading.parameterId,versionId:reading.versionId,readings:[]};group.readings.push(reading);groups.set(key,group);
      series.push({collectionId:col.id,eventDate:col.eventDate,occurredAt:col.occurredAt??null,timePrecision:col.timePrecision,context:col.context,parameterId:reading.parameterId,versionId:reading.versionId,value:reading.value??null,status:reading.status,state:result.state});
    }
  }
  const statistics=[...groups.values()].map(g=>({...g,readings:undefined,...summarizeReadings(g.readings,{sigmaMethod,rule:data.parameterVersions?.[g.versionId]?.rule})}));
  const closed=stoppages.filter(s=>s.endedAt!=null&&s.startedAt<to&&s.endedAt>from).map(s=>({...s,minutes:(Math.min(s.endedAt,to)-Math.max(s.startedAt,from))/60000}));
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
