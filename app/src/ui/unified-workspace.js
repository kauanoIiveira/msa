import {openPresentation} from './presentation.js';
export async function openUnifiedWorkspace(options={}){
 const w=await openPresentation({...options,completeSections:true}),storage=options.storage??globalThis.localStorage;
 const backup=w.exportBackup;
 return {...w,get fromDate(){return w.fromDate;},get toDate(){return w.toDate;},get range(){return w.range;},exportBackup(){const current=JSON.parse(backup());const previous=storage.getItem('msa.nhpl.live.v1');if(previous){try{current.previousLiveWorkspace=JSON.parse(previous);}catch{current.previousLiveWorkspaceRaw=previous;}}return JSON.stringify(current,null,2);}};
}
