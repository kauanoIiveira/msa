import {unionSeconds} from './oee.js';
import {productiveWindows,latestPlans} from './planning.js';
import {stableStringify} from './canonical.js';
import {matchesScope} from './production-policy.js';
const sum=(rows,key)=>rows.reduce((n,r)=>n+r[key],0);
const metric=(value,state,reason=null,coverage={})=>({value,state,reason,coverage});
export function aggregateOee(segments){
 const blocked=new Set(['history-incomplete','incomplete-query','plan-conflict','time-inconsistent','revision-mismatch','revision-pending','obsolete-plan','no-period-allocation']);
 const available=segments.filter(s=>!blocked.has(s.reason)&&Number.isFinite(s.plannedSeconds)&&s.plannedSeconds>0&&Number.isFinite(s.runSeconds)&&s.runSeconds>=0&&s.runSeconds<=s.plannedSeconds);
 const performanceRows=available.filter(s=>s.runSeconds>0&&Number.isFinite(s.idealSeconds)&&s.idealSeconds>0&&Number.isFinite(s.total)&&!['reference-conflict','reference-crosses-period','performance-inconsistent','correction-conflict','confirmation-outdated','confirmation-mismatch'].includes(s.reason));
 const qualityRows=segments.filter(s=>!blocked.has(s.reason)&&Number.isFinite(s.total)&&s.total>0&&Number.isFinite(s.firstPassGood)&&s.firstPassGood>=0&&s.firstPassGood<=s.total&&!['inspection-outdated','correction-conflict','confirmation-outdated','confirmation-mismatch'].includes(s.reason));
 const coverage={evaluated:segments.filter(s=>s.oee!=null).length,total:segments.length},componentCoverage=Object.fromEntries([['availability',available],['performance',performanceRows],['quality',qualityRows]].map(([key,rows])=>[key,{evaluated:rows.length,total:segments.length}]));
 const weighted=qualityRows.length>0&&qualityRows.every(s=>Number.isFinite(s.idealSeconds)&&s.idealSeconds>0&&!['reference-conflict','reference-crosses-period'].includes(s.reason)),qualityWork=qualityRows.reduce((n,s)=>n+s.idealSeconds*s.firstPassGood,0),qualityIdeal=qualityRows.reduce((n,s)=>n+s.idealSeconds*s.total,0);
 const components={availability:available.length?sum(available,'runSeconds')/sum(available,'plannedSeconds'):null,performance:performanceRows.length?performanceRows.reduce((n,s)=>n+s.idealSeconds*s.total,0)/sum(performanceRows,'runSeconds'):null,quality:qualityRows.length?(weighted?qualityWork/qualityIdeal:sum(qualityRows,'firstPassGood')/sum(qualityRows,'total')):null,countQuality:qualityRows.length?sum(qualityRows,'firstPassGood')/sum(qualityRows,'total'):null,weightedQuality:weighted&&new Set(qualityRows.map(s=>s.idealSeconds)).size>1,componentCoverage};
 const valid=segments.filter(s=>s.oee!=null),planned=sum(valid,'plannedSeconds'),work=valid.reduce((n,s)=>n+s.idealSeconds*s.firstPassGood,0);
 if(!valid.length||!planned)return {...metric(null,'unavailable','bases-required',coverage),oee:null,...components};
 const state=valid.length===segments.length&&valid.every(s=>s.state==='final')?'final':'partial';
 return {...metric(work/planned,state,null,coverage),oee:work/planned,...components,total:sum(valid,'total'),firstPassGood:sum(valid,'firstPassGood'),plannedSeconds:planned,runSeconds:sum(valid,'runSeconds')};
}
export function periodReliability({plans=[],stops=[],classifications=[],windows,now=Date.now(),coverage={complete:false}}){
 const byMachine=new Map();for(const plan of latestPlans(plans)){const key=plan.context.machineId,list=byMachine.get(key)??[];list.push(...productiveWindows(plan));byMachine.set(key,list);}
 let plannedSeconds=0,loss=0,invalid=false;const classified=new Map();
 for(const stop of stops){const c=classifications.filter(c=>c.stopId===stop.id).at(-1);if(!c||c.stopFingerprint!==stableStringify([stop.startedAt,stop.endedAt??null,stop.correctionId??null])||stop.revisionConflict){invalid=true;continue;}classified.set(stop.id,{stop,c});}
 for(const [machine,planned]of byMachine){for(const w of windows){const end=Math.min(w.to,now);if(end<=w.from)continue;plannedSeconds+=unionSeconds(planned,w.from,end);
  const lost=[];for(const {stop,c}of classified.values())if(stop.context.machineId===machine&&c.category==='availability')for(const p of planned){const from=Math.max(stop.startedAt,p.startedAt,w.from),to=Math.min(stop.endedAt??now,p.endedAt,end);if(to>from)lost.push({startedAt:from,endedAt:to});}
  loss+=unionSeconds(lost,w.from,end);
 }}
 const contains=t=>windows.some(w=>t>=w.from&&t<Math.min(w.to,now)),failures=[...classified.values()].filter(x=>x.c.failure),started=failures.filter(x=>contains(x.stop.startedAt)),finished=failures.filter(x=>Number.isSafeInteger(x.c.repairStartedAt)&&Number.isSafeInteger(x.c.repairEndedAt)&&x.c.repairEndedAt>=x.c.repairStartedAt&&x.c.repairEndedAt<=now&&contains(x.c.repairEndedAt));
 const complete=coverage.complete===true&&!invalid,operatingSeconds=plannedSeconds-loss,state=coverage.provisional?'partial':'final',ready=complete&&plannedSeconds>0,reason=!complete?'history-incomplete':!plannedSeconds?'planned-time-required':null;
 return {mtbf:metric(ready&&started.length?operatingSeconds/started.length:null,ready?state:'unavailable',reason??(!started.length?'no-failures':null),coverage),mttr:metric(ready&&finished.length?finished.reduce((n,x)=>n+(x.c.repairEndedAt-x.c.repairStartedAt)/1000,0)/finished.length:null,ready?state:'unavailable',reason??(!finished.length?'no-repairs':null),coverage),operatingSeconds,plannedSeconds,failures:started.length,completedRepairs:finished.length,openRepairs:failures.filter(x=>!Number.isSafeInteger(x.c.repairEndedAt)).length,carryInFailures:failures.filter(x=>!contains(x.stop.startedAt)&&windows.some(w=>x.stop.startedAt<w.from&&(x.stop.endedAt??now)>w.from)).length};
}
export function periodMicroStops({stops=[],references=[],windows}){
 const unique=new Map();for(const stop of stops){const ref=references.filter(r=>matchesScope(r.context,stop.context)&&r.effectiveFrom<=stop.startedAt).sort((a,b)=>a.effectiveFrom-b.effectiveFrom).at(-1);if(stop.endedAt!=null&&!stop.planned&&(stop.endedAt-stop.startedAt)/1000<=(ref?.microStopSeconds??60)&&windows.some(w=>stop.startedAt<w.to&&stop.endedAt>w.from))unique.set(stop.id,stop);}
 const machines=new Set([...unique.values()].map(s=>s.context.machineId));let seconds=0;for(const machine of machines)for(const w of windows)seconds+=unionSeconds([...unique.values()].filter(s=>s.context.machineId===machine),w.from,w.to);return {count:unique.size,seconds};
}
