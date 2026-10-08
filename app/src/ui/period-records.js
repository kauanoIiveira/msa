export function recordsInPeriod(kind,records,{from,to}) {
  if(!['production','stoppages'].includes(kind))return records;
  return records.filter(r=>r.startedAt<to&&(r.endedAt==null||r.endedAt>from));
}
