// Canonicalize domain content for an async SHA-256 digest in browser and Node.
// Only volatile audit clocks are omitted. Ledger events, decisions, authored
// content, IDs, measurements and operational timestamps remain covered.
export function canonicalDatasetValue(value){
  if(Array.isArray(value))return value.map(canonicalDatasetValue);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().filter(k=>!['createdAt','closedAt'].includes(k)&&value[k]!==undefined).map(k=>[k,canonicalDatasetValue(value[k])]));
  return value;
}
export async function datasetHash(value){
  const bytes=new TextEncoder().encode(JSON.stringify(canonicalDatasetValue(value)));
  const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
}
