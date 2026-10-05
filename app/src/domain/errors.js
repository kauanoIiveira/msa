export class MsaError extends Error {
  constructor(code,message=code,field) { super(message); this.name='MsaError'; this.code=code; if(field) this.field=field; }
}
export function requireThat(condition,code='VALIDATION',field) {
  if(!condition) throw new MsaError(code,code,field);
}
export function assertRole(actor,roles) { requireThat(actor?.uid && roles.includes(actor.role),'FORBIDDEN'); }
export function validId(id) { return typeof id==='string' && /^[A-Za-z0-9_-]{1,100}$/.test(id); }
export function assertId(id,field='id') { requireThat(validId(id),'INVALID_REFERENCE',field); return id; }
export function knownKeys(value,keys) {
  requireThat(value && typeof value==='object' && !Array.isArray(value),'VALIDATION');
  for(const key of Object.keys(value)) requireThat(keys.includes(key),'UNKNOWN_FIELD',key);
}
