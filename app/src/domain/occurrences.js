// RTDB key order is unrelated to the time of an engineer's decision.
export function latestOccurrenceDecision(records,occurrenceId){
 return records.filter(r=>r.kind==='occurrence-decision'&&r.occurrenceId===occurrenceId).sort((a,b)=>(Number.isFinite(a.createdAt)?a.createdAt:0)-(Number.isFinite(b.createdAt)?b.createdAt:0)||String(a.id??'').localeCompare(String(b.id??''))).at(-1);
}
