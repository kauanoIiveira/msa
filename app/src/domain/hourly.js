import {unionDuration,validateDate} from './time.js';
import {requireThat} from './errors.js';
export function buildHourly(data,{date,now=Date.now(),target=null,microStopSeconds=60}={}) {
  validateDate(date);requireThat(target==null||Number.isFinite(target)&&target>0,'VALIDATION','target');
  requireThat(Number.isFinite(microStopSeconds)&&microStopSeconds>0&&microStopSeconds<=3600,'VALIDATION','microStopSeconds');
  const from=Date.parse(date+'T00:00:00-03:00'),to=from+86400000,hour=3600000;
  const production=(data.production??[]).filter(r=>r.startedAt<to&&r.endedAt>from);
  const crossing=production.filter(r=>r.startedAt<from||r.endedAt>to||Math.floor((r.startedAt-from)/hour)!==Math.floor((r.endedAt-1-from)/hour));
  const hours=Array.from({length:24},(_,i)=>{
    const start=from+i*hour,end=start+hour,status=start>=now?'future':end>now?'current':'closed';
    const whole=production.filter(r=>r.startedAt>=start&&r.endedAt<=end),unallocated=crossing.filter(r=>r.startedAt<end&&r.endedAt>start);
    const total=basis=>{const rows=whole.filter(r=>r.basis===basis);return rows.length&&!rows.some(r=>r.revisionConflict)?rows.reduce((s,r)=>s+r.quantity,0):null;};
    const grossKnownPieces=total('gross'),goodKnownPieces=total('good');
    const grossPieces=unallocated.some(r=>r.basis==='gross')?null:grossKnownPieces,goodPieces=unallocated.some(r=>r.basis==='good')?null:goodKnownPieces;
    return {hour:i,label:String(i).padStart(2,'0')+':00',start,end,status,grossPieces,goodPieces,grossKnownPieces,goodKnownPieces,conflicted:whole.some(r=>r.revisionConflict)||unallocated.some(r=>r.revisionConflict),unallocatedCount:unallocated.length,target:status==='future'?null:target,difference:status==='closed'&&target!=null&&grossPieces!=null?grossPieces-target:null};
  });
  const stops=(data.stoppages??[]).filter(s=>s.startedAt<to&&(s.endedAt==null||s.endedAt>from));
  const micro=stops.filter(s=>!s.revisionConflict&&s.endedAt!=null&&s.planned===false&&(s.endedAt-s.startedAt)>0&&(s.endedAt-s.startedAt)<=microStopSeconds*1000);
  let seconds=0,overlap=false;for(const machineId of new Set(micro.map(s=>s.context.machineId))){const u=unionDuration(micro.filter(s=>s.context.machineId===machineId),{from,to});seconds+=u.milliseconds/1000;overlap ||= u.hasOverlap;}
  const instants=[...(data.collections??[]).filter(r=>r.eventDate===date),...production,...stops,...(data.losses??[]).filter(r=>r.eventDate===date)].map(r=>r.createdAt??r.occurredAt).filter(Number.isFinite);
  const conflictedRecords=[...production,...stops].filter(r=>r.revisionConflict).length;
  return {date,hours,conflictedRecords,microstops:{count:micro.length,seconds,thresholdSeconds:microStopSeconds,overlap},openStoppages:stops.filter(s=>s.endedAt==null).length,
    unallocatedPieces:crossing.some(r=>r.basis==='gross'&&r.revisionConflict)?null:crossing.filter(r=>r.basis==='gross').reduce((s,r)=>s+r.quantity,0),unallocatedRecords:crossing.length,lastRecordAt:instants.length?Math.max(...instants):null};
}
