import {getMsaParameterCatalog} from '../catalog/msa-parameters.js';
import {buildIndicators} from './indicators.js';
import {evaluateReading,validateRule} from './limits.js';
import {assertId,knownKeys,requireThat} from './errors.js';
import {eventDate} from './time.js';

export function buildDashboard(data,{context,from,to,windows,complete,sigmaMethod='population'}={}) {
  knownKeys(context,['machineId','processId','productId','recipe','lot','order','shift','variant']);
  for(const field of ['machineId','processId']) assertId(context[field],field);
  if(context.productId)assertId(context.productId,'productId');
  requireThat(Number.isSafeInteger(from)&&Number.isSafeInteger(to)&&from>=0&&to>from,'INVALID_PERIOD');
  const matches=row=>Object.entries(context).every(([key,value])=>!value||row.context?.[key]===value);
  const fromDate=eventDate(from),toDate=eventDate(to-1);
  const inPeriod=row=>row.timePrecision==='date'?row.eventDate>=fromDate&&row.eventDate<=toDate:Number.isSafeInteger(row.occurredAt)&&row.occurredAt>=from&&row.occurredAt<to;
  const scoped={...data};
  for(const kind of ['production','stoppages','targets']) scoped[kind]=(data[kind]??[]).filter(matches);
  for(const kind of ['collections','losses']) scoped[kind]=(data[kind]??[]).filter(row=>matches(row)&&inPeriod(row));
  const fullDays=from>0&&eventDate(from-1)!==fromDate&&eventDate(to)!==toDate;
  const imprecise=!fullDays&&[...scoped.collections,...scoped.losses].some(row=>row.timePrecision==='date');
  const indicators=buildIndicators(scoped,{from,to,windows,complete:complete===true&&!imprecise,sigmaMethod});
  if(imprecise) indicators.notes.push('date-only-in-partial-day-window');
  const registered=Object.values(data.parameters??{}).filter(p=>p.processId===context.processId&&p.active===true);
  const ownCatalog=getMsaParameterCatalog(),usesT20=context.machineId==='t20'||registered.some(p=>ownCatalog.some(item=>item.code===p.code));
  const references=usesT20?ownCatalog:[],codes=new Set(references.map(item=>item.code));
  for(const parameter of registered.filter(p=>!codes.has(p.code))) references.push({code:parameter.code??parameter.id,name:parameter.name,group:'custom',unit:null,source:null,issues:[],questions:[],customId:parameter.id});
  const versions=data.parameterVersions??{};
  indicators.statistics=indicators.statistics.map(group=>{
    const version=versions[group.versionId],summary={...group,unit:version?.unit??null,nature:version?.nature??null,versionStatus:version?.status??null};
    return version?.status==='approved'?summary:{...summary,cp:null,cpk:null,reason:'unapproved-limit'};
  });
  const parameters=references.map(item=>{
    const linked=registered.filter(p=>item.customId?p.id===item.customId:p.code===item.code),ids=new Set(linked.map(p=>p.id));
    const observations=[];
    for(const collection of scoped.collections) for(const reading of Object.values(collection.readings??{})) if(ids.has(reading.parameterId)) observations.push({collection,reading});
    const statistics=indicators.statistics.filter(group=>ids.has(group.parameterId));
    const registeredVersions=Object.values(versions).filter(v=>ids.has(v.parameterId));
    let state=!linked.length?'not-configured':!registeredVersions.length?'no-version':'no-data',latest=null;
    if(observations.length) {
      const day=observations.map(o=>o.collection.eventDate).sort().at(-1),sameDay=observations.filter(o=>o.collection.eventDate===day);
      // A date-only measurement cannot be ordered against another measurement on that day.
      const allTimed=sameDay.every(o=>o.collection.timePrecision==='instant'&&Number.isSafeInteger(o.collection.occurredAt));
      const lastTime=allTimed?sameDay.reduce((last,o)=>Math.max(last,o.collection.occurredAt),0):null;
      const candidates=allTimed?sameDay.filter(o=>o.collection.occurredAt===lastTime):sameDay;
      if(candidates.length!==1) state='latest-time-ambiguous';
      else {
        const {collection,reading}=candidates[0],version=versions[reading.versionId];
        state=collection.revisionConflict?'revision-conflict':evaluateReading(reading,version).state;
        latest={collectionId:collection.id,versionId:reading.versionId,parameterId:reading.parameterId,context:collection.context,eventDate:collection.eventDate,
          occurredAt:collection.occurredAt??null,timePrecision:collection.timePrecision,raw:reading.raw??null,value:reading.status==='valid'&&Number.isFinite(reading.value)?reading.value:null,
          readingStatus:reading.status,unit:version?.unit??null,nature:version?.nature??null,rule:version?.rule??null,state};
      }
    }
    if(linked.length>1) state='duplicate-parameter-code';
    const versionStates=registeredVersions.map(v=>{
      try {validateRule(v.rule);return v.status==='approved'&&v.rule.kind!=='pending'?'approved':'pending';} catch {return 'invalid';}
    });
    const configurationState=!linked.length?'not-configured':linked.length>1?'duplicate-parameter-code':!versionStates.length?'no-version':versionStates.includes('approved')?'has-approved-version':'pending';
    const {customId,...reference}=item;
    return {...reference,parameterIds:[...ids],configurationState,state,latest,observationCount:observations.length,statistics};
  });
  return {...indicators,context:structuredClone(context),parameters};
}
