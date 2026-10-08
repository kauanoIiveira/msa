import {productionCaseContext} from '../domain/production-case.js';
export function selectProduction(selection,row) {
 return {...structuredClone(selection),recording:{productionCaseId:row.id,context:productionCaseContext(row)}};
}
export function initialSelection({manifest,saved={}}){
 const initial=manifest?.defaultSelection;
 const changed=initial&&saved.packageId!==manifest.packageId;
 const query=changed?structuredClone(initial.query):{context:saved.context??initial?.query.context??{},fromDate:saved.fromDate??initial?.query.fromDate,toDate:saved.toDate??initial?.query.toDate,shift:saved.shift??initial?.query.shift??'all'};
 return {query,recording:structuredClone(changed?initial.recording:saved.recording??initial?.recording??null),packageId:manifest?.packageId??saved.packageId??null,previousQuery:changed&&saved.fromDate?structuredClone(saved):saved.previousQuery??null};
}
export function changeRecordingProduction({selection,nextCase,draft,decision}) {
 if(draft&&selection.recording?.productionCaseId!==nextCase.id&&!decision)return {selection,draft,requiresDecision:true};
 if(decision==='keep')return {selection,draft,requiresDecision:false};
 return {selection:selectProduction(selection,nextCase),draft:decision==='new'?null:draft,requiresDecision:false};
}
