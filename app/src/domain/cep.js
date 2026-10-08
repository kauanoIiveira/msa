import {mean,sampleStandardDeviation} from '../../vendor/simple-statistics.mjs';
import {requireThat} from './errors.js';
import {validateRule} from './limits.js';
import {contextKey} from './context.js';

// Phase-I Individuals / Moving Range, pairs of size 2: d2=1.128, D3=0, D4=3.267.
// The selected study is the baseline. No Phase-II frozen limits or industrial release is implied.
export function analyzeCep(samples,{version,minSamples=25,sequenceConfirmed=true,complete=true,sourceUnit=null,context}={}) {
  if(context?.machineId==='nhpl')minSamples=Math.max(30,minSamples);
  requireThat(Number.isInteger(minSamples)&&minSamples>=2&&minSamples<=500,'VALIDATION','minSamples');
  const points=samples.map(s=>!s.revisionConflict&&s.status==='valid'&&Number.isFinite(s.value)?s.value:null);
  const values=points.filter(v=>v!=null),n=values.length;
  const movingRanges=points.map((v,i)=>i&&v!=null&&points[i-1]!=null?Math.abs(v-points[i-1]):null);
  const ranges=movingRanges.filter(v=>v!=null),average=n?mean(values):null,mrMean=ranges.length?mean(ranges):null;
  const sigmaWithin=mrMean!=null?mrMean/1.128:null,sigmaOverall=n>1?sampleStandardDeviation(values):null;
  const nMissing=samples.filter(s=>!s.revisionConflict&&s.status==='missing').length,nConflicted=samples.filter(s=>s.revisionConflict).length;
  const r={nValid:n,nMissing,nConflicted,nInvalid:samples.length-n-nMissing-nConflicted,complete,
    mean:average,sigmaWithin,sigmaOverall,mrMean,points,movingRanges,signals:[],
    individuals:{center:average,lower:average!=null&&sigmaWithin!=null?average-3*sigmaWithin:null,upper:average!=null&&sigmaWithin!=null?average+3*sigmaWithin:null},
    movingRange:{center:mrMean,lower:mrMean!=null?0:null,upper:mrMean!=null?3.267*mrMean:null},
    cp:null,cpk:null,pp:null,ppk:null,minSamples,sequenceConfirmed,method:'I-MR / MR(2)',phase:'I',homologated:false,normalityVerified:false};
  if([average,sigmaWithin,sigmaOverall,mrMean].some(v=>v!=null&&!Number.isFinite(v))) return {...r,mean:null,sigmaWithin:null,sigmaOverall:null,mrMean:null,individuals:{center:null,lower:null,upper:null},movingRange:{center:null,lower:null,upper:null},reason:'non-finite-statistics'};
  if(sigmaWithin>0) {
    let side=0,run=0;
    points.forEach((v,index)=>{
      if(v==null){side=0;run=0;return;}
      if(v<r.individuals.lower||v>r.individuals.upper) r.signals.push({index,rule:'individual-3sigma'});
      if(movingRanges[index]>r.movingRange.upper) r.signals.push({index,rule:'moving-range-limit'});
      const next=Math.sign(v-average);run=next&&next===side?run+1:next?1:0;side=next;
      if(run>=8) r.signals.push({index,rule:'eight-same-side'});
    });
  }
  let reason;
  if(nConflicted)reason='revision-conflict';
  else if(!complete)reason='incomplete-study';
  else if(sourceUnit!=null&&sourceUnit!==version?.unit)reason='incompatible-unit';
  else if(version?.status!=='approved') reason='unapproved-limit';
  else if(version?.nature!=='measurement') reason=version?.nature==='setpoint'?'setpoint':'unclassified-nature';
  else {try{validateRule(version.rule);if(version.rule.kind!=='range')reason='bilateral-limit-required';}catch{reason='invalid-limit';}}
  if(!reason&&!sequenceConfirmed) reason='unverified-sequence';
  if(!reason&&ranges.length>=2&&sigmaWithin===0&&sigmaOverall===0)reason='zero-dispersion';
  if(!reason&&(n<minSamples||ranges.length<2)) reason='insufficient-sample';
  if(!reason&&(!sigmaWithin||!sigmaOverall)) reason='zero-dispersion';
  if(!reason&&r.signals.length) reason='unstable-process';
  if(reason) return {...r,reason};
  const {lower,upper}=version.rule;
  r.cp=(upper-lower)/(6*sigmaWithin);r.cpk=Math.min(upper-average,average-lower)/(3*sigmaWithin);
  r.pp=(upper-lower)/(6*sigmaOverall);r.ppk=Math.min(upper-average,average-lower)/(3*sigmaOverall);
  if([r.cp,r.cpk,r.pp,r.ppk].some(v=>!Number.isFinite(v))) return {...r,cp:null,cpk:null,pp:null,ppk:null,reason:'non-finite-result'};
  return {...r,reason:null};
}

export function selectParameterStudy(dashboard,parameter) {
  const latest=parameter?.latest;
  if(!latest)return {group:null,series:[]};
  const matches=s=>s.parameterId===latest.parameterId&&s.versionId===latest.versionId&&contextKey(s.context)===contextKey(latest.context);
  return {group:parameter.statistics.find(matches)??null,series:(dashboard.series??[]).filter(matches).sort((a,b)=>(a.occurredAt??Date.parse(a.eventDate+'T12:00:00Z'))-(b.occurredAt??Date.parse(b.eventDate+'T12:00:00Z')))};
}
