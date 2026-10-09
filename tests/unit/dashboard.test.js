import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../app/src/index.js';
import {memoryRepository} from '../helpers/memory-repository.js';
import {seed} from '../helpers/fixtures.js';
const context={machineId:'m',processId:'p',productId:'q'};
const from=Date.parse('2026-10-05T00:00:00-03:00'),to=Date.parse('2026-10-06T00:00:00-03:00');
const parameters={f:{id:'f',name:'Temp Ambiente',code:'MSA_F',processId:'p',active:true}};
const parameterVersions={v:{id:'v',parameterId:'f',unit:'\u00b0C',status:'approved',nature:'measurement',rule:{kind:'range',lower:13,upper:30}}};
const collection=(id,value,offset=100,extra={})=>({id,context,eventDate:'2026-10-05',timePrecision:'instant',occurredAt:from+offset,
  readings:{f:{parameterId:'f',versionId:'v',raw:String(value),value,status:'valid'}},...extra});
const build=(data,range={})=>{assert.equal(typeof api.buildDashboard,'function','Missing complete parameter dashboard');return api.buildDashboard(data,{context,from,to,complete:true,...range});};

test('dashboard includes all 41 references with unknown values instead of zeros or healthy states',()=>{
  const view=build({}, {context:{...context,machineId:'t20'}});assert.equal(view.parameters.length,41);assert.equal(view.totals.grossPieces,null);
  assert.ok(view.parameters.every(row=>row.latest===null&&row.state==='not-configured'&&row.statistics.length===0));
  assert.equal(view.parameters.find(row=>row.code==='MSA_CH').source.limits.lower,-600);
});

test('dashboard shows actual last reading, inclusive boundaries, invalid input and unapproved limits distinctly',()=>{
  const row=data=>build({parameters,parameterVersions,...data}).parameters.find(row=>row.code==='MSA_F');
  const boundary=row({collections:[collection('a',13),collection('b',30,200)]});
  assert.equal(boundary.state,'within');assert.equal(boundary.latest.value,30);assert.equal(boundary.latest.unit,'\u00b0C');
  assert.equal(boundary.statistics[0].mean,21.5);
  const invalid=row({collections:[collection('a',20),collection('bad',null,200,{readings:{f:{parameterId:'f',versionId:'v',status:'invalid',raw:'unknown'}}})]});
  assert.equal(invalid.state,'invalid');assert.equal(invalid.latest.value,null);
  const draft=row({parameterVersions:{v:{...parameterVersions.v,status:'draft'}},collections:[collection('a',20),collection('b',21,200)]});
  assert.equal(draft.state,'pending');assert.equal(draft.statistics[0].cp,null);assert.equal(draft.statistics[0].cpk,null);
  assert.equal(draft.statistics[0].reason,'unapproved-limit');
  const draftView=build({parameters,parameterVersions:{v:{...parameterVersions.v,status:'draft'}},collections:[collection('a',20),collection('b',21,200)]});
  assert.equal(draftView.statistics[0].cp,null);assert.equal(draftView.statistics[0].cpk,null);
});

test('dashboard keeps recipes and versions separate and rejects measurements outside the selected context/window',()=>{
  const otherVersion={...parameterVersions.v,id:'v2',unit:'K'};
  const rows=[collection('a',14,100,{context:{...context,recipe:'A'}}),collection('b',28,200,{context:{...context,recipe:'B'}}),
    collection('c',290,300,{context:{...context,recipe:'A'},readings:{f:{parameterId:'f',versionId:'v2',value:290,status:'valid',raw:'290'}}}),
    collection('outside',99,to-from+1),collection('other',99,400,{context:{...context,machineId:'another'}})];
  const view=build({parameters,parameterVersions:{...parameterVersions,v2:otherVersion},collections:rows});
  const row=view.parameters.find(row=>row.code==='MSA_F');assert.equal(row.statistics.length,3);
  assert.deepEqual(row.statistics.map(s=>s.mean).sort((a,b)=>a-b),[14,28,290]);assert.equal(view.series.length,3);
  assert.equal(row.latest.unit,'K');assert.equal(row.latest.context.recipe,'A');
});

test('date-only ties do not invent a latest measurement and correction conflicts never appear healthy',()=>{
  const dated=collection('date',22,100,{timePrecision:'date',occurredAt:undefined});
  const row=build({parameters,parameterVersions,collections:[dated,collection('instant',20,200)]}).parameters.find(r=>r.code==='MSA_F');
  assert.equal(row.latest,null);assert.equal(row.state,'latest-time-ambiguous');assert.equal(row.observationCount,2);
  const conflict=build({parameters,parameterVersions,collections:[collection('conflict',20,100,{revisionConflict:true})]}, {complete:false});
  assert.equal(conflict.parameters.find(r=>r.code==='MSA_F').state,'revision-conflict');assert.equal(conflict.complete,false);
});

test('date-only records make an intraday dashboard explicitly partial',()=>{
  const dated=collection('date',22,100,{timePrecision:'date',occurredAt:undefined});
  const view=build({parameters,parameterVersions,collections:[dated]}, {from:from+3600000,to:from+7200000});
  assert.equal(view.complete,false);assert.ok(view.notes.includes('date-only-in-partial-day-window'));
});

test('dashboard service exposes registered custom parameters and uses approved corrections without changing originals',async()=>{
  const repo=memoryRepository(),f=await seed(repo),op=api.createMsaServices({repo,actor:{uid:'op',role:'operator'}}),eng=api.createMsaServices({repo,actor:{uid:'eng',role:'engineer'}});
  assert.equal(typeof op.getDashboard,'function','Missing dashboard integration');
  const col=await op.operations.recordCollection({context:f.context,occurredAt:from+100,readings:[{parameterId:f.parameterId,versionId:f.versionId,raw:'-650'}]});
  const request=await op.analysis.requestCorrection({recordType:'collections',recordId:col.id,reason:'Synthetic correction',replacement:{...col,readings:{[f.parameterId]:{...col.readings[f.parameterId],raw:'-550',value:-550}}}});
  await eng.analysis.decideCorrection(request.id,{decision:'approved',justification:'Synthetic check'});
  const query={context:f.context,fromDate:'2026-10-05',toDate:'2026-10-05'};
  const view=await op.getDashboard(query,{from,to});assert.equal(view.parameters.length,1);
  const custom=view.parameters.find(r=>r.group==='custom');assert.equal(custom.latest.value,-550);assert.equal(custom.state,'outside');
  assert.equal((await repo.get(`collections/${col.id}`)).readings[f.parameterId].value,-650);
  await assert.rejects(()=>op.getDashboard({...query,fromDate:'2026-10-04'},{from,to}),{code:'INVALID_PERIOD'});
});
test('generic equipment exposes only its own parameters, never the T20 catalog',()=>{
 const view=build({parameters:{force:{id:'force',code:'P02_FORCE',name:'Força',processId:'p',active:true}}});
 assert.deepEqual(view.parameters.map(r=>r.code),['P02_FORCE']);
});
