import {assertInstant,validateDate} from './time.js';
import {requireThat} from './errors.js';
const dayMs=86400000,zone='America/Sao_Paulo';
const dayOffset=(day,offset)=>new Date(Date.parse(day+'T12:00:00Z')+offset*dayMs).toISOString().slice(0,10);
export function normalizeShift(value){const s=String(value??'').trim().toLowerCase();return /^[123](?:\s*$|\s*[º°ª]|\s*turno)/.test(s)?s[0]:null;}
function instant(day,hour){return Date.parse(`${day}T${String(hour).padStart(2,'0')}:00:00-03:00`);}
export function shiftAt(value){
 assertInstant(value);const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(value).map(p=>[p.type,p.value]));
 const day=`${p.year}-${p.month}-${p.day}`,hour=Number(p.hour),shift=hour<7||hour>=23?'3':hour<15?'1':'2',operationalDate=hour<7?dayOffset(day,-1):day;
 return {shift,operationalDate,from:instant(operationalDate,shift==='1'?7:shift==='2'?15:23),to:shift==='3'?instant(dayOffset(operationalDate,1),7):instant(operationalDate,shift==='1'?15:23)};
}
export function shiftWindows(fromDate,toDate,shift='all'){
 validateDate(fromDate);validateDate(toDate);requireThat(fromDate<=toDate&&Date.parse(toDate)-Date.parse(fromDate)<=366*dayMs,'INVALID_PERIOD');requireThat(['all','1','2','3'].includes(shift),'INVALID_QUERY');
 const windows=[];for(let day=fromDate;day<=toDate;day=dayOffset(day,1)){const from=instant(day,shift==='all'||shift==='1'?7:shift==='2'?15:23),to=shift==='all'||shift==='3'?instant(dayOffset(day,1),7):instant(day,shift==='1'?15:23);windows.push({from,to});}return windows;
}
export function assertShiftPeriod(context,from,to){assertInstant(from);assertInstant(to);const s=shiftAt(from);requireThat(to>from&&to<=s.to&&normalizeShift(context?.shift)===s.shift,'SHIFT_PERIOD','shift');}
export function classifyRecord(kind,row,windows){
 const diagnostics=[],interval=['production','stoppages','plans','runs'].includes(kind),from=interval?row.startedAt??row.machineStartedAt:row.occurredAt,to=interval?row.endedAt??row.machineEndedAt??Infinity:from;
 if(!Number.isSafeInteger(from)){return {included:false,allocated:false,diagnostics:['time-required']};}
 const included=windows.some(w=>interval?from<w.to&&to>w.from:from>=w.from&&from<w.to),physical=shiftAt(from),label=normalizeShift(row.context?.shift);
 if(!label)diagnostics.push('shift-required');else if(label!==physical.shift)diagnostics.push('shift-conflict');
 const whole=interval?windows.some(w=>from>=w.from&&to<=w.to):included;
 if(interval&&kind!=='stoppages'&&(!whole||to>physical.to))diagnostics.push('no-shift-allocation');
 const allocated=included&&!diagnostics.length;return {included,allocated,diagnostics};
}
