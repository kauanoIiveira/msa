export function projectIntervalProduction(headers) {
 const rows=[];for(const [intervalId,header] of Object.entries(headers??{}))for(const event of Object.values(header.events??{}))if(event.kind==='production')rows.push({id:event.id,intervalId,planId:header.planId,planRevisionId:header.planRevisionId,context:header.context,quantity:event.quantity,basis:event.basis,startedAt:event.startedAt,endedAt:event.endedAt,origin:event.origin??'manual',eventDate:header.eventDate,timePrecision:'instant',occurredAt:event.startedAt,createdBy:event.createdBy,createdAt:event.createdAt});return rows;
}
export async function getOperationRecord(repo,{recordType,recordId,intervalId}) {
 if(recordType==='production'&&intervalId){const header=await repo.get('productionIntervals/'+intervalId);return projectIntervalProduction({[intervalId]:header??{}}).find(r=>r.id===recordId)??null;}
 return repo.get(recordType+'/'+recordId);
}
