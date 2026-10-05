export function canonical(value) {
  if(Array.isArray(value)) return value.map(canonical);
  if(value&&typeof value==='object') return Object.fromEntries(Object.keys(value).sort().filter(k=>value[k]!=null).map(k=>[k,canonical(value[k])]));
  return value;
}
export const stableStringify=value=>JSON.stringify(canonical(value));
