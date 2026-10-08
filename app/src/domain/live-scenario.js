import {shiftAt} from './shifts.js';
import {requireThat} from './errors.js';
const source=(sessionId,at)=>'live-'+sessionId.slice(0,16)+'-'+at;
export function createLiveCursor({startedAt,sessionId,context,automaticEvents=true}){return {sessionId,through:startedAt,activeMilliseconds:0,cycleMilliseconds:0,pieceCount:0,rejectCount:0,sequence:0,sourceId:source(sessionId,startedAt),context:{...context,shift:shiftAt(startedAt).shift},paused:false,disconnected:false,stop:null,rejectNext:false,deviationUntil:0,automaticEvents,lastSample:0,lastHeartbeat:0,commands:[],gaps:[]};}
export function advanceLive(original,{through,command=null}){
 requireThat(Number.isSafeInteger(through)&&through>=original.through,'INVALID_TIME');const c=structuredClone(original),intents=[];
 const emit=(kind,at,payload={})=>{const sequence=++c.sequence;const event={id:'e'+sequence,sourceId:c.sourceId,sequence,occurredAt:at,kind,context:structuredClone(c.context),payload};intents.push(event);return event;};
 const startStop=(at,failure)=>{if(c.stop)return;const ev=emit('stop',at,{failure});c.stop={id:ev.sourceId+'_'+ev.id,startedAt:at,activeStart:c.activeMilliseconds,until:c.activeMilliseconds+(failure?45000:12000),failure,repairStartedAt:null,repairEndedAt:null};};
 let gap=null;
 if(through-c.through>60000){gap={from:c.through,to:through};c.gaps.push(gap);const previous=shiftAt(c.through),next=shiftAt(through);c.through=through;
  if(previous.from!==next.from){c.context.shift=next.shift;c.sourceId=source(c.sessionId,through);c.sequence=0;emit('rotate',through,{operationalDate:next.operationalDate});}emit('gap',through,gap);
 }
 else while(c.through<through){
  const before=c.through,oldShift=shiftAt(before);
  // Step on event boundaries, rather than hoping a browser timer lands on them.
  const nextMultiple=period=>period-c.activeMilliseconds%period;
  const boundaries=[1000,through-before,oldShift.to-before];
  if(!c.paused&&!c.disconnected){
   boundaries.push(nextMultiple(5000),nextMultiple(30000));
   if(c.automaticEvents){const pos=c.activeMilliseconds%300000;boundaries.push(pos<60000?60000-pos:pos<180000?180000-pos:360000-pos,nextMultiple(120000));}
   if(c.stop){boundaries.push(c.stop.until-c.activeMilliseconds);if(c.stop.failure&&!c.stop.repairStartedAt)boundaries.push(c.stop.activeStart+5000-c.activeMilliseconds);if(c.stop.failure&&!c.stop.repairEndedAt)boundaries.push(c.stop.activeStart+35000-c.activeMilliseconds);}
   else boundaries.push(12000-c.cycleMilliseconds);
  }
  const dt=Math.min(...boundaries.filter(n=>n>0)),at=before+dt;c.through=at;
  if(!c.paused&&!c.disconnected){c.activeMilliseconds+=dt;
   if(c.stop){
    if(c.stop.failure&&!c.stop.repairStartedAt&&c.activeMilliseconds>=c.stop.activeStart+5000){c.stop.repairStartedAt=at;emit('repair-start',at,{...c.stop});}
    if(c.stop.failure&&!c.stop.repairEndedAt&&c.activeMilliseconds>=c.stop.activeStart+35000){c.stop.repairEndedAt=at;emit('repair-end',at,{...c.stop});}
    if(c.activeMilliseconds>=c.stop.until){emit('stop-end',at,{...c.stop});c.stop=null;}
   }else{c.cycleMilliseconds+=dt;while(c.cycleMilliseconds>=12000){c.cycleMilliseconds-=12000;c.pieceCount++;const rejected=c.rejectNext||c.pieceCount%25===0;c.rejectNext=false;if(rejected)c.rejectCount++;emit('piece',at,{rejected,pieceNumber:c.pieceCount});}}
   const pos=c.activeMilliseconds%300000;if(c.automaticEvents&&(pos===60000||pos===180000))startStop(at,pos===180000);
   if(c.automaticEvents&&c.activeMilliseconds%120000===0)c.deviationUntil=c.activeMilliseconds+30000;
   if(c.activeMilliseconds-c.lastSample>=30000){c.lastSample=c.activeMilliseconds;emit('measurement',at,{deviation:c.activeMilliseconds<c.deviationUntil,index:Math.floor(c.activeMilliseconds/30000)});}
   if(c.activeMilliseconds-c.lastHeartbeat>=5000){c.lastHeartbeat=c.activeMilliseconds;emit('heartbeat',at,{state:c.stop?'stopped':'running'});}
  }
  if(at===oldShift.to){const next=shiftAt(at);c.context.shift=next.shift;c.sourceId=source(c.sessionId,at);c.sequence=0;emit('rotate',at,{operationalDate:next.operationalDate});}
 }
 if(command&&!c.commands.includes(command.id)){c.commands.push(command.id);const type=command.type,at=c.through;requireThat(['pause','resume','reject-next','micro-stop','failure','deviation','disconnect','reconnect'].includes(type),'INVALID_TRANSITION');
  if(type==='pause'&&!c.paused){c.paused=true;c.pauseStartedAt=at;}if(type==='resume'){if(c.pauseStartedAt!=null&&at>c.pauseStartedAt)c.gaps.push({from:c.pauseStartedAt,to:at});c.paused=false;c.pauseStartedAt=null;}if(type==='reject-next')c.rejectNext=true;
  if(type==='micro-stop'||type==='failure')startStop(at,type==='failure');if(type==='deviation')c.deviationUntil=c.activeMilliseconds+30000;
  if(type==='disconnect'){c.disconnected=true;c.disconnectStartedAt=at;}if(type==='reconnect'){if(c.disconnectStartedAt!=null)c.gaps.push({from:c.disconnectStartedAt,to:at});c.disconnected=false;c.disconnectStartedAt=null;}
  emit('command',at,{type});
 }
 return {cursor:c,intents,gap};
}
