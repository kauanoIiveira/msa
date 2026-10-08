import {assertId,requireThat} from './errors.js';
import {assertInstant} from './time.js';
export const matchesScope=(scope,context)=>Object.entries(scope??{}).every(([k,v])=>context?.[k]===v);
export function validatePolicy(payload){
 requireThat(['productivityPercent','taktSeconds'].includes(payload.metric),'INVALID_KIND');
 requireThat(Number.isFinite(payload.value)&&(payload.metric==='productivityPercent'?payload.value>=0&&payload.value<=100:payload.value>0),'VALIDATION','value');
 assertInstant(payload.effectiveFrom);if(payload.effectiveTo!=null)requireThat(payload.effectiveTo>payload.effectiveFrom,'INVALID_PERIOD');
 for(const field of ['machineId','processId'])assertId(payload.context?.[field],field);
 requireThat(Object.keys(payload.context).every(k=>['machineId','processId','productId'].includes(k)),'UNKNOWN_FIELD');
 requireThat(typeof payload.source==='string'&&payload.source.trim().length>0&&payload.source.length<=1000,'VALIDATION','source');return payload;
}
export function resolvePolicy(revisions,{context,from,to,metric='productivityPercent'}){
 const relevant=revisions.filter(r=>r.metric===metric&&matchesScope(r.context,context));const rows=[];
 for(const row of relevant){const successor=relevant.filter(r=>r.supersedes===row.id).sort((a,b)=>a.effectiveFrom-b.effectiveFrom);const end=Math.min(row.effectiveTo??Infinity,successor[0]?.effectiveFrom??Infinity);if(row.effectiveFrom<to&&end>from)rows.push({...row,from:Math.max(from,row.effectiveFrom),to:Math.min(to,end)});}
 const conflicts=rows.filter((r,i)=>rows.some((s,j)=>i!==j&&r.from<s.to&&r.to>s.from));return {segments:rows.sort((a,b)=>a.from-b.from),conflicts};
}
