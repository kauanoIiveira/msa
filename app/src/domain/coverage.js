import {stableStringify} from './canonical.js';
import {matchesScope} from './production-policy.js';
import {unionSeconds} from './oee.js';
export function latestClassification(classifications,stop) {
 return classifications.filter(c=>c.stopId===stop.id).sort((a,b)=>(a.createdAt??0)-(b.createdAt??0)||String(a.id??'').localeCompare(String(b.id??''))).at(-1);
}
function relevant({context,startedAt,endedAt,stops}){return stops.filter(s=>matchesScope(context??{},s.context)&&s.startedAt<endedAt&&(s.endedAt??Infinity)>startedAt).sort((a,b)=>a.id.localeCompare(b.id));}
export function coverageFingerprint({context,startedAt,endedAt,stops=[],classifications=[]}) {
 return stableStringify(relevant({context,startedAt,endedAt,stops}).map(s=>{
  const c=latestClassification(classifications,s);
  return [s.id,s.startedAt,s.endedAt??null,s.correctionId??null,s.revisionConflict===true,c?.id??null,c?.category??null,c?.failure??null,c?.repairStartedAt??null,c?.repairEndedAt??null,c?.stopFingerprint??null];
 }));
}
export function classificationsComplete({context,startedAt,endedAt,stops=[],classifications=[]}) {
 return relevant({context,startedAt,endedAt,stops}).every(s=>{const c=latestClassification(classifications,s);return !s.revisionConflict&&c&&c.stopFingerprint===stableStringify([s.startedAt,s.endedAt??null,s.correctionId??null]);});
}
export function evaluateCoverage({witnesses=[],stops=[],classifications=[],windows=[],completeQuery=true}) {
 const diagnostics=[];if(!completeQuery)diagnostics.push('incomplete-query');if(!windows.length)diagnostics.push('no-planned-window');
 for(const window of windows){
  const matching=witnesses.filter(w=>matchesScope(w.context,window.context??{})&&w.startedAt<window.to&&w.endedAt>window.from);
  const superseded=new Set(matching.map(w=>w.supersedes).filter(Boolean)),current=matching.filter(w=>!superseded.has(w.id)),covered=[];
  const seen=new Set();
  for(const w of current){
   const key=stableStringify([w.context,w.startedAt,w.endedAt]);
   if(seen.has(key)){diagnostics.push('coverage-conflict');continue;}seen.add(key);
   if(!w.complete||!w.evidence){diagnostics.push('coverage-incomplete');continue;}
   const input={...w,stops,classifications};
   if(w.recordsFingerprint!==coverageFingerprint(input)||!classificationsComplete(input)){diagnostics.push('coverage-changed');continue;}
   covered.push({startedAt:Math.max(w.startedAt,window.from),endedAt:Math.min(w.endedAt,window.to)});
  }
  if(unionSeconds(covered,window.from,window.to)<(window.to-window.from)/1000)diagnostics.push('coverage-required');
 }
 return {complete:diagnostics.length===0,diagnostics:[...new Set(diagnostics)]};
}
