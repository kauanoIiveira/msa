import {requireThat,knownKeys,assertId} from '../domain/errors.js';
import {validateDate} from '../domain/time.js';
import {effectiveRecords} from '../domain/indicators.js';
const kinds=['collections','production','stoppages','losses','reviews','corrections'];
const matches=(row,context)=>!context||Object.entries(context).every(([key,value])=>row.context?.[key]===value);
export function createHistoryService({repo}) {
  function validate(kind,q={}) {
    requireThat(kinds.includes(kind),'INVALID_KIND');knownKeys(q,['fromDate','toDate','limit','cursor','context','maxPages']);
    if(q.fromDate) validateDate(q.fromDate);if(q.toDate) validateDate(q.toDate);
    requireThat(!q.fromDate||!q.toDate||q.fromDate<=q.toDate,'INVALID_PERIOD');
    if(q.limit!=null) requireThat(Number.isInteger(q.limit)&&q.limit>0&&q.limit<=500,'INVALID_QUERY');
    if(q.cursor) {validateDate(q.cursor.date);assertId(q.cursor.key);}
    if(q.context) {knownKeys(q.context,['machineId','processId','productId','recipe','lot','order','shift']);for(const key of ['machineId','processId','productId']) if(q.context[key]) assertId(q.context[key]);}
    return q;
  }
  const filtered=(page,q)=>({...page,items:page.items.filter(row=>matches(row,q.context))});
  return {
    async list(kind,q={}) {validate(kind,q);return filtered(await repo.list(kind,q),q);},
    watch(kind,q,onNext,onError) {validate(kind,q);return repo.watch(kind,q,page=>onNext(filtered(page,q)),onError);},
    async loadPeriod(q) {
      validate('collections',q);const maxPages=q.maxPages??20;requireThat(Number.isInteger(maxPages)&&maxPages>=1&&maxPages<=100,'INVALID_QUERY');
      const result={complete:true,notes:[]};
      for(const kind of kinds) {
        let cursor=null,done=false;const rows=[];
        // Scan earlier interval starts and correction requests, otherwise a date filter hides carry-over records.
        const allEarlier=['stoppages','production','corrections'].includes(kind);
        for(let page=0;page<maxPages&&!done;page++) {
          const current=await this.list(kind,{...q,...(allEarlier?{fromDate:undefined}:{}),context:kind==='corrections'?undefined:q.context,cursor});
          rows.push(...current.items);done=current.complete;cursor=current.nextCursor;
          if(!done&&!cursor) break;
        }
        result[kind]=rows;if(!done) {result.complete=false;result.notes.push(`page-cap:${kind}`);}
      }
      result.parameterVersions=await repo.get('parameterVersions')??{};result.targets=Object.values(await repo.get('targets')??{});
      result.effective={};
      for(const kind of ['collections','production','losses','stoppages']) {
        const effective=effectiveRecords(kind,result[kind],result.corrections);result.effective[kind]=effective.items;
        if(effective.conflicts.length) {result.complete=false;result.notes.push(`revision-conflict:${kind}`);}
      }
      return result;
    }
  };
}
