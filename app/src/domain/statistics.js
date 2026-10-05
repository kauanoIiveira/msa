import {mean,min,max,standardDeviation,sampleStandardDeviation} from '../../vendor/simple-statistics.mjs';
import {validateRule} from './limits.js';
import {requireThat} from './errors.js';
export function summarizeReadings(readings,{sigmaMethod,rule}={}) {
  requireThat(['population','sample'].includes(sigmaMethod),'SIGMA_METHOD_REQUIRED');
  const values=readings.filter(r=>r.status==='valid'&&Number.isFinite(r.value)).map(r=>r.value);
  const n=values.length;
  const r={nValid:n,nMissing:readings.filter(r=>r.status==='missing').length,nInvalid:readings.length-n-readings.filter(r=>r.status==='missing').length,
    mean:n?mean(values):null,min:n?min(values):null,max:n?max(values):null,sigma:null,cp:null,cpk:null,sigmaMethod,homologated:false};
  if(n<2) return {...r,reason:'insufficient-data'};
  r.sigma=values.every(v=>v===values[0])?0:(sigmaMethod==='population'?standardDeviation(values):sampleStandardDeviation(values));
  if(!r.sigma) return {...r,reason:'zero-dispersion'};
  try { validateRule(rule); } catch { return {...r,reason:'invalid-limit'}; }
  if(rule.kind!=='range') return {...r,reason:'bilateral-limit-required'};
  r.cp=(rule.upper-rule.lower)/(6*r.sigma);
  r.cpk=Math.min(rule.upper-r.mean,r.mean-rule.lower)/(3*r.sigma);
  if(!Number.isFinite(r.cp)||!Number.isFinite(r.cpk)) return {...r,cp:null,cpk:null,reason:'non-finite-result'};
  return r;
}
