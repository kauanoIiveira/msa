import {assertPeriod,unionDuration} from './time.js';
import {requireThat} from './errors.js';
export function netSeconds(plan,from=plan.startedAt,to=plan.endedAt){const start=Math.max(from,plan.startedAt),end=Math.min(to,plan.endedAt);return end>start?(end-start-unionDuration(plan.breaks??[],{from:start,to:end}).milliseconds)/1000:0;}
export function productiveWindows(plan){const points=[plan.startedAt,plan.endedAt,...(plan.breaks??[]).flatMap(r=>[r.startedAt,r.endedAt])].sort((a,b)=>a-b);return points.slice(1).map((end,i)=>({startedAt:points[i],endedAt:end})).filter(r=>r.endedAt>r.startedAt&&!plan.breaks?.some(b=>b.startedAt<=r.startedAt&&b.endedAt>=r.endedAt));}
export function suggestPlan(payload){
 const {context,startedAt,endedAt}=payload;assertPeriod(startedAt,endedAt);requireThat(endedAt-startedAt<=31*86400000,'INVALID_PERIOD');
 for(const key of ['machineId','processId','productId','order','lot','shift'])requireThat(typeof context?.[key]==='string'&&context[key].trim(),'VALIDATION',key);
 const breaks=(payload.breaks??[]).map(b=>{assertPeriod(b.startedAt,b.endedAt);requireThat(b.startedAt>=startedAt&&b.endedAt<=endedAt,'INVALID_PERIOD');return {startedAt:b.startedAt,endedAt:b.endedAt};});
 const intervalMinutes=payload.intervalMinutes??60;requireThat([15,30,60].includes(intervalMinutes),'VALIDATION','intervalMinutes');
 const taktRevision=payload.taktRevision??{id:'interview-takt',value:12};requireThat(Number.isFinite(taktRevision.value)&&taktRevision.value>0,'VALIDATION');
 const plan={context:structuredClone(context),startedAt,endedAt,breaks,intervalMinutes,quantitySource:payload.quantitySource??'takt',taktRevision};const seconds=netSeconds(plan);
 requireThat(['informed','takt'].includes(plan.quantitySource),'VALIDATION','quantitySource');
 const total=plan.quantitySource==='informed'?payload.plannedPieces:Math.floor(seconds/taktRevision.value);requireThat(Number.isSafeInteger(total)&&total>=0&&total<=1e12,'INVALID_QUANTITY');
 const intervals=[];let prior=0;for(let start=startedAt;start<endedAt;start+=intervalMinutes*60000){const end=Math.min(endedAt,start+intervalMinutes*60000),cumulative=plan.quantitySource==='takt'?Math.floor(netSeconds(plan,startedAt,end)/taktRevision.value):seconds?Math.floor(total*netSeconds(plan,startedAt,end)/seconds):0;intervals.push({startedAt:start,endedAt:end,plannedPieces:cumulative-prior});prior=cumulative;}
 if(payload.intervalQuantities){requireThat(payload.intervalQuantities.length===intervals.length&&payload.intervalQuantities.every(n=>Number.isSafeInteger(n)&&n>=0)&&payload.intervalQuantities.reduce((a,b)=>a+b,0)===total,'INVALID_QUANTITY');intervals.forEach((r,i)=>r.plannedPieces=payload.intervalQuantities[i]);}
 requireThat(seconds>0||total===0,'INVALID_QUANTITY');return {...plan,plannedPieces:total,intervals};
}
export const validatePlan=suggestPlan;
export function latestPlans(events){const map=new Map();for(const e of events)map.set(e.planId,e);return [...map.values()];}
export function conflictingPlans(plans){return plans.filter((a,i)=>plans.some((b,j)=>i!==j&&a.context.machineId===b.context.machineId&&productiveWindows(a).some(x=>productiveWindows(b).some(y=>x.startedAt<y.endedAt&&x.endedAt>y.startedAt))));}
