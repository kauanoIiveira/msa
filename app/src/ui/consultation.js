const key='msa.consultation.v1';
function normalize(value){return {days:[7,14,30].includes(value?.days)?value.days:7,compact:value?.compact===true};}
export function readConsultation(storage=globalThis.localStorage){try{return normalize(JSON.parse(storage.getItem(key)));}catch{return normalize();}}
export function writeConsultation(patch,storage=globalThis.localStorage){const next=normalize({...readConsultation(storage),...patch});storage.setItem(key,JSON.stringify(next));return next;}
