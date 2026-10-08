import {mkdir,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
const directory=resolve(process.argv[2]??'output/nhpl-capture');await mkdir(directory,{recursive:true});
const sourceId='demo-'+Date.now().toString(36),context={machineId:'nhpl',processId:'nhpl-montagem',productId:'nhpl-vgard-hp',order:'OP-AP-001',lot:'LOTE-AP-001',shift:'1',variant:'Medium'};
const states=[['state',{state:'running'}],['state',{state:'stopped',reasonId:'nhpl-stop'}],['state',{state:'running'}],['good-validated',{validated:true}],['state',{state:'disconnected'}]];
for(let i=0;i<states.length;i++){
 const[type,extra]=states[i],event={schemaVersion:1,sourceId,eventId:'event-'+(i+1),sequence:i+1,occurredAt:Date.now(),context,type,...extra};
 const file=resolve(directory,sourceId+'-'+i+'.json');await writeFile(file+'.partial',JSON.stringify([event],null,2));await rename(file+'.partial',file);console.log('Evento '+event.sequence+' '+type+' · '+file);
 if(i<states.length-1)await new Promise(ok=>setTimeout(ok,3000));
}
