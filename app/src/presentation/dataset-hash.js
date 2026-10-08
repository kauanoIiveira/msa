// Canonicalize domain content for an async SHA-256 digest in browser and Node.
// RTDB erases null/empty objects; normalize that storage representation.
// Only volatile audit clocks are otherwise omitted. Ledger events, decisions, authored
// content, IDs, measurements and operational timestamps remain covered.
export function canonicalDatasetValue(value){
  if(Array.isArray(value))return value.map(canonicalDatasetValue);
  if(value&&typeof value==='object'){
    const pairs=Object.keys(value).sort().filter(k=>!['createdAt','closedAt'].includes(k)&&value[k]!=null).map(k=>[k,canonicalDatasetValue(value[k])]).filter(([,v])=>v!=null&&!(typeof v==='object'&&!Object.keys(v).length));
    return pairs.length?Object.fromEntries(pairs):null;
  }
  return value;
}
export async function datasetHash(value){
  const bytes=new TextEncoder().encode(JSON.stringify(canonicalDatasetValue(value)));
  const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
}

// Headers cover their own metadata; every immutable ledger event has its own entry.
export const manifestEntryScope=path=>/^(productionPlans|productionIntervals|machineRuns|productionPolicies|targetRevisions)\/[^/]+$/.test(path)?'ledger-header':'record';
export function manifestEntryValue(value,entry){
 if(entry.scope!=='ledger-header'||value==null)return value;
 const {events,...header}=value;return header;
}
