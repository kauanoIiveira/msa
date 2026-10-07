import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../app/src/index.js';
const version={id:'v',parameterId:'f',unit:'mm',nature:'measurement',status:'approved',rule:{kind:'range',lower:40,upper:60}};
const samples=values=>values.map((value,index)=>({status:value==null?'missing':'valid',value,collectionId:'c'+index}));
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);
test('I-MR reproduces the NIST ten-batch example and distinguishes within from overall dispersion',()=>{
  const r=api.analyzeCep(samples([49.6,47.6,49.9,51.3,47.8,51.2,52.6,52.4,53.6,52.1]),{version,minSamples:2});
  near(r.mean,50.81);near(r.mrMean,16.9/9);near(r.sigmaWithin,(16.9/9)/1.128);
  near(r.individuals.upper,50.81+3*((16.9/9)/1.128));near(r.individuals.lower,50.81-3*((16.9/9)/1.128));
  near(r.cp,20/(6*r.sigmaWithin));near(r.pp,20/(6*r.sigmaOverall));assert.notEqual(r.cp,r.pp);
  assert.equal(r.homologated,false);assert.equal(r.normalityVerified,false);
});
test('missing/invalid readings break moving ranges; constants and insufficient samples never produce infinite capability',()=>{
  const gap=api.analyzeCep([{status:'valid',value:10},{status:'missing'},{status:'invalid'},{status:'valid',value:20},{status:'valid',value:21}],{version,minSamples:2});
  assert.deepEqual(gap.movingRanges,[null,null,null,null,1]);assert.equal(gap.nMissing,1);assert.equal(gap.nInvalid,1);
  assert.equal(api.analyzeCep(samples([10,10,10]),{version,minSamples:2}).cp,null);
  assert.equal(api.analyzeCep(samples([10,10,10]),{version}).reason,'zero-dispersion');
  assert.equal(api.analyzeCep(samples([10,11]),{version}).reason,'insufficient-sample');
});
test('draft references, setpoints, unilateral bounds and unverified chronology cannot yield bilateral capability',()=>{
  const input=samples([49,50,49,50]);
  for(const [patch,reason]of [[{status:'draft'},'unapproved-limit'],[{nature:'setpoint'},'setpoint'],[{rule:{kind:'lower',lower:40}},'bilateral-limit-required']]) {
    const r=api.analyzeCep(input,{version:{...version,...patch},minSamples:2});assert.equal(r.cp,null);assert.equal(r.reason,reason);
  }
  assert.equal(api.analyzeCep(input,{version,minSamples:2,sequenceConfirmed:false}).reason,'unverified-sequence');
});
test('signals use the I and MR control limits, and unstable processes do not receive capability indices',()=>{
  const values=Array.from({length:40},(_,i)=>50+(i%2?0.1:-0.1));values.push(58);
  const r=api.analyzeCep(samples(values),{version,minSamples:25});assert.ok(r.signals.some(s=>s.index===40&&s.rule==='individual-3sigma'));
  assert.equal(r.cp,null);assert.equal(r.reason,'unstable-process');assert.ok(Number.isFinite(r.individuals.upper));
});
test('detail selection uses the latest full context, not the first group of its version',()=>{
  const context={machineId:'m',processId:'p',productId:'q'},a={...context,lot:'A'},b={...context,lot:'B'};
  const parameter={latest:{parameterId:'f',versionId:'v',context:b},statistics:[{parameterId:'f',versionId:'v',context:a,mean:10},{parameterId:'f',versionId:'v',context:b,mean:20}]};
  const result=api.selectParameterStudy({series:[{parameterId:'f',versionId:'v',context:a},{parameterId:'f',versionId:'v',context:b}]},parameter);
  assert.equal(result.group.mean,20);assert.equal(result.series.length,1);assert.equal(result.series[0].context.lot,'B');
});
test('supplied workbook keeps 17 rows, numeric text and blanks, and reproduces the corrected BF population deviation',()=>{
  const study=api.getCapabilityStudy();assert.equal(study.parameters.length,41);assert.equal(study.source.observationRows,17);
  const bf=study.parameters.find(p=>p.code==='MSA_BF'),readings=bf.samples.map(s=>api.parseReading(s.raw));
  assert.equal(bf.samples.find(s=>s.row===25).date,'2026-08-31');
  assert.equal(bf.samples.find(s=>s.row===25).rawDate,'31/08/2026');
  const summary=api.summarizeReadings(readings,{sigmaMethod:'population',rule:{kind:'range',lower:0.8,upper:0.9}});
  assert.equal(summary.nValid,17);near(summary.mean,0.8588235294117648);near(summary.sigma,0.04921529567847717);
  assert.equal(study.parameters.find(p=>p.column==='BH').limits.lower,80);
  assert.equal(study.parameters.find(p=>p.column==='BH').limits.upper,75);
  assert.ok(study.parameters.some(p=>p.samples.some(s=>s.raw===null)));
});
