const valid=n=>Number.isFinite(n)&&n>=0;
export function calculateOee({plannedSeconds,runSeconds,idealSeconds,total,firstPassGood,complete=false}={}) {
 const r={availability:null,performance:null,quality:null,oee:null,state:complete?'final':'partial',reason:null,plannedSeconds,runSeconds,idealSeconds,total,firstPassGood};
 const fail=reason=>({...r,reason,state:'unavailable'});
 if(!valid(plannedSeconds)||plannedSeconds===0)return fail('planned-time-required');
 if(!valid(runSeconds))return fail('operating-time-required');
 if(runSeconds>plannedSeconds)return fail('time-inconsistent');
 r.availability=runSeconds/plannedSeconds;
 if(!valid(total)||!Number.isSafeInteger(total))return fail('production-required');
 if(!valid(firstPassGood)||!Number.isSafeInteger(firstPassGood))return fail('quality-required');
 if(firstPassGood>total)return fail('quality-inconsistent');
 if(total===0)return fail('no-production');
 r.quality=firstPassGood/total;
 if(!valid(idealSeconds)||idealSeconds===0)return fail('ideal-cycle-required');
 if(runSeconds===0)return fail('time-inconsistent');
 r.performance=idealSeconds*total/runSeconds;
 if(r.performance>1+1e-10)return fail('performance-inconsistent');
 r.oee=r.availability*r.performance*r.quality;
 return r;
}
export function unionSeconds(intervals,from,to) {
 const ranges=intervals.map(r=>[Math.max(from,r.startedAt),Math.min(to,r.endedAt??to)]).filter(([a,b])=>b>a).sort((a,b)=>a[0]-b[0]);
 let sum=0,end=-Infinity;for(const[a,b]of ranges){sum+=Math.max(0,b-Math.max(a,end));end=Math.max(end,b);}return sum/1000;
}
export function calculateReliability({operatingSeconds,repairs=[],complete=false}={}) {
 const failures=repairs.filter(r=>r.failure),closed=failures.filter(r=>Number.isSafeInteger(r.repairStartedAt)&&Number.isSafeInteger(r.repairEndedAt)&&r.repairEndedAt>=r.repairStartedAt);
 const available=complete&&valid(operatingSeconds)&&operatingSeconds>0;
 return {failures:failures.length,closedRepairs:closed.length,mtbf:available&&failures.length?operatingSeconds/failures.length:null,mttr:available&&failures.length===closed.length&&closed.length?closed.reduce((s,r)=>s+(r.repairEndedAt-r.repairStartedAt)/1000,0)/closed.length:null,failureRate:available?failures.length/(operatingSeconds/3600):null,complete:available};
}
