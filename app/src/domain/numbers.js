export function parseReading(raw) {
  const original=raw==null?null:typeof raw==='string'?raw:typeof raw==='number'?String(raw):String(raw);
  if(raw==null || (typeof raw==='string' && !raw.trim())) return {raw:original,status:'missing'};
  if(typeof raw!=='string' && typeof raw!=='number') return {raw:original,status:'invalid'};
  const text=String(raw).trim();
  if(!/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(text)) return {raw:original,status:'invalid'};
  const value=Number(text.replace(',','.'));
  return Number.isFinite(value)?{raw:original,status:'valid',value}:{raw:original,status:'invalid'};
}
