import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as cep from '../../app/src/ui/cep.js';
import {number} from '../../app/src/ui/format.js';
import {getCapabilityStudy} from '../../app/src/catalog/capability-study.js';

const state=source=>({context:{machineId:'nhpl',processId:'nhpl-montagem'},actor:{uid:'test'},fromDate:'2026-10-01',toDate:'2026-10-07',period:{},registries:{parameters:{p:{id:'p',code:'MSA_BF',name:'Tempo destacar',active:true,processId:'nhpl-montagem'}},parameterVersions:{}},dashboard:{statistics:[],series:[]},cep:{source,parameterId:source==='workbook'?'MSA_BF':'p',minSamples:25}});

test('both unavailable sources offer a complete, identified presentation study without changing source data',()=>{
 for(const source of ['system','workbook']){
  const input=state(source),before=structuredClone(input),original=cep.getCepStudy(input);
  const html=cep.cepPage(input);
  assert.match(html,/Exemplo de apresentação/);
  assert.doesNotMatch(html,/<strong data-cep-index="cp(?:k)?">(?:—|Sem dados)<\/strong>/);
  assert.equal(typeof cep.getDisplayedCepStudy,'function');
  const displayed=cep.getDisplayedCepStudy(input);
  assert.equal(displayed.presentationExample,true);
  assert.ok(displayed.analysis.nValid>=30);
  assert.ok(Number.isFinite(displayed.analysis.cp)&&Number.isFinite(displayed.analysis.cpk));
  assert.equal(displayed.analysis.reason,null);
  assert.equal(displayed.analysis.homologated,false);
  assert.ok(displayed.samples.every(s=>s.origin==='demo'&&!s.cell));
  assert.deepEqual(cep.getCepStudy(input),original);
  assert.deepEqual(input,before);
  input.cep.view='source';
  assert.equal(cep.getDisplayedCepStudy(input).analysis.cp,original.analysis.cp);
 }
});

test('presentation exports identify synthetic observations and preserve the original workbook export',()=>{
 const input=state('workbook');
 assert.equal(typeof cep.cepDisplayReportRows,'function');
 const rows=cep.cepDisplayReportRows(input);
 assert.equal(rows[0].origin,'demo');
 assert.equal(rows[0].versionStatus,'illustrative');
 assert.equal(rows[0].sourceSha256,null);
 assert.ok(rows.slice(1).every(row=>row.origin==='demo'&&!row.sourceCell));
 assert.equal(cep.cepReportRows(input)[0].n,17);
 assert.equal(cep.cepReportRows(input)[0].cp,null);
});

test('numeric absence is explained instead of a bare dash, while zero remains zero',()=>{
 assert.equal(number(null),'Sem dados');
 assert.equal(number(undefined),'Sem dados');
 assert.equal(number(NaN),'Sem dados');
 assert.equal(number(0),'0');
});

test('every workbook characteristic has finite demonstration indices, including pending or zero-width references',()=>{
 for(const parameter of getCapabilityStudy().parameters){
  const input=state('workbook');input.cep.parameterId=parameter.code;input.cep.minSamples=40;
  const study=cep.getDisplayedCepStudy(input);
  assert.ok(Number.isFinite(study.analysis.cp)&&Number.isFinite(study.analysis.cpk),parameter.code);
  assert.equal(study.analysis.nValid,40);
  assert.equal(study.version.unit,study.unit);
 }
});

test('an eligible source remains the displayed study and never silently receives example observations',()=>{
 const input=state('system'),context=input.context;
 input.registries.parameterVersions.v={id:'v',parameterId:'p',unit:'mm',status:'approved',nature:'measurement',rule:{kind:'range',lower:9.5,upper:10.5}};
 input.dashboard.statistics=[{parameterId:'p',versionId:'v',context}];
 input.dashboard.series=Array.from({length:30},(_,i)=>({parameterId:'p',versionId:'v',context,status:'valid',value:10+(i%2?-.01:.01),raw:'10',timePrecision:'instant',occurredAt:Date.parse('2026-10-01T08:00:00-03:00')+i*60000,origin:'manual'}));
 const study=cep.getDisplayedCepStudy(input);
 assert.equal(study.presentationExample,undefined);
 assert.equal(study.analysis.reason,null);
 assert.ok(Number.isFinite(study.analysis.cp));
 assert.ok(study.samples.every(s=>s.origin==='manual'));
});
