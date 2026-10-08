import {productionCaseContext} from '../domain/production-case.js';
export function selectProduction(selection,row) {
 return {...structuredClone(selection),recording:{productionCaseId:row.id,context:productionCaseContext(row)}};
}
export function changeRecordingProduction({selection,nextCase,draft,decision}) {
 if(draft&&selection.recording?.productionCaseId!==nextCase.id&&!decision)return {selection,draft,requiresDecision:true};
 if(decision==='keep')return {selection,draft,requiresDecision:false};
 return {selection:selectProduction(selection,nextCase),draft:decision==='new'?null:draft,requiresDecision:false};
}
