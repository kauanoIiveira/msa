import {requireThat} from './errors.js';
const operationalDateFormatter=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'});
export function assertInstant(value) { requireThat(Number.isSafeInteger(value)&&value>=0,'INVALID_TIME');return value; }
export function validateDate(value) {
  requireThat(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value),'INVALID_DATE');
  const date=new Date(value+'T12:00:00Z');requireThat(Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value,'INVALID_DATE');return value;
}
export function eventDate(instant) {
  assertInstant(instant);
  const parts=Object.fromEntries(operationalDateFormatter.formatToParts(instant).map(p=>[p.type,p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export function assertPeriod(startedAt,endedAt) {assertInstant(startedAt);assertInstant(endedAt);requireThat(endedAt>startedAt,'INVALID_PERIOD');}
export function unionDuration(intervals,{from,to}) {
  requireThat(Number.isFinite(from)&&Number.isFinite(to)&&to>from,'INVALID_PERIOD');
  let openCount=0,hasOverlap=false,milliseconds=0;
  const ranges=[];
  for(const interval of intervals) {
    if(interval.endedAt==null) {if(interval.startedAt<to) openCount++;continue;}
    assertPeriod(interval.startedAt,interval.endedAt);
    const start=Math.max(from,interval.startedAt),end=Math.min(to,interval.endedAt);
    if(end>start) ranges.push([start,end]);
  }
  ranges.sort((a,b)=>a[0]-b[0]);let last=null;
  for(const [start,end] of ranges) {
    if(last&&start<last[1]) {hasOverlap=true;last[1]=Math.max(last[1],end);}
    else {if(last) milliseconds+=last[1]-last[0];last=[start,end];}
  }
  if(last) milliseconds+=last[1]-last[0];
  return {milliseconds,hasOverlap,openCount};
}
