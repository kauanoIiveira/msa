import {requireThat} from './errors.js';
export function validateRule(rule) {
  requireThat(rule && ['range','lower','upper','pending'].includes(rule.kind),'INVALID_LIMIT');
  const keys={range:['kind','lower','upper'],lower:['kind','lower'],upper:['kind','upper'],pending:['kind']}[rule.kind];
  requireThat(Object.keys(rule).every(key=>keys.includes(key)),'INVALID_LIMIT');
  for(const key of keys.filter(key=>key!=='kind')) requireThat(Number.isFinite(rule[key]),'INVALID_LIMIT',key);
  if(rule.kind==='range') requireThat(rule.lower<rule.upper,'INVALID_LIMIT');
  return structuredClone(rule);
}
export function evaluateReading(reading,version) {
  const result=(state,severity,reason)=>({state,severity,reason,rule:version?.rule??null});
  if(reading.status!=='valid') return result(reading.status,'data',reading.status);
  if(!Number.isFinite(reading.value)) return result('invalid','data','invalid-numeric-value');
  try {validateRule(version?.rule);} catch { return result('pending','data','invalid-limit'); }
  const rule=version.rule;
  if(version.status!=='approved'||rule.kind==='pending') return result('pending','data','unapproved-limit');
  const outside=(rule.lower!=null&&reading.value<rule.lower)||(rule.upper!=null&&reading.value>rule.upper);
  return result(outside?'outside':'within',outside?'warning':'none',outside?'outside-declared-limit':'within-declared-limit');
}
