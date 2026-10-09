import test from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';
import {buildBiFacts,calculateScrap} from '../../app/src/io/bi-model.js';
import {exportBi} from '../../app/src/io/bi-export.js';
const at=Date.parse('2026-10-08T00:30:00-03:00');
const context={machineId:'m',processId:'p',productId:'x',order:'OP',lot:'L',recipe:'r',shift:'3'};
const scope={...context,operationalDate:'2026-10-07'};
const production=[{id:'p',context,startedAt:at-1000,endedAt:at+1000,basis:'gross',quantity:100,confirmed:true}];
const losses=[{id:'l',context,occurredAt:at,kind:'reject',unit:'pieces',amount:10},{id:'kg',context,occurredAt:at,kind:'reject',unit:'kg',amount:2},{id:'seg',context,occurredAt:at,kind:'segregated',unit:'pieces',amount:20}];
test('scrap uses exact scope, pieces and confirmed gross; missing coverage and zero remain unavailable',()=>{
 assert.equal(calculateScrap({production,losses,scope,coverage:true}).pct,10);
 for(const field of ['order','lot','shift','machineId'])assert.equal(calculateScrap({production,losses:[...losses,{...losses[0],context:{...context,[field]:'other'},amount:90}],scope,coverage:true}).pct,10);
 assert.equal(calculateScrap({production,losses:[],scope,coverage:true}).pct,0);
 assert.equal(calculateScrap({production,losses,scope,coverage:false}).pct,null);
 assert.equal(calculateScrap({production:[{...production[0],quantity:0}],losses:[],scope,coverage:true}).pct,null);
});
function fixture(){return {period:{complete:true,nhplComplete:true,coverage:{production:true,losses:true,corrections:true},production,losses,collections:['a','b'].map(id=>({id,context,occurredAt:at,origin:'demo',readings:{vac:{parameterId:'vac',versionId:'v',value:-590,raw:'-590'},zero:{parameterId:'zero',versionId:'z',value:0,raw:'0'}}})),corrections:[]},registries:{parameterVersions:{v:{unit:'mbar'},z:{unit:'°C'}},recipeVersions:{r:{settings:{material:'=HYPERLINK("bad")',thickness:1.25}}}}};}
test('wide collections repeat nonadditive rate with one production fact and correction provenance',()=>{
 const view=fixture();view.period.corrections=[{id:'c',recordType:'losses',recordId:'l',state:'approved',replacement:{amount:12}}];
 const facts=buildBiFacts(view);assert.equal(facts.production.length,1);assert.equal(facts.collections.length,2);assert.equal(facts.collections[0].scrapPercent,12);assert.equal(facts.collections[0].scopeId,facts.collections[1].scopeId);assert.equal(facts.losses[0].originalAmount,10);assert.equal(facts.losses[0].amount,12);assert.equal(facts.losses[0].correctionId,'c');assert.equal(facts.collections[0].operationalDate,'2026-10-07');
});
test('CSV BOM CRLF semicolon, ptBR numbers, formula text and deterministic full export',()=>{
 const view=fixture(),result=exportBi({view,kind:'collections',locale:'pt-BR'}),text=result.files[0].text;
 assert.ok(text.startsWith('\ufeff'));assert.ok(text.includes('\r\n'));assert.ok(text.includes(';'));const rows=Papa.parse(text,{delimiter:';',header:true,skipEmptyLines:true}).data;
 assert.equal(rows[0]['vac.value'],'-590');assert.equal(rows[0]['zero.value'],'0');assert.equal(rows[0].thickness,'1,25');assert.ok(rows[0].material.startsWith("'="));assert.deepEqual(exportBi({view,kind:'collections'}),result);
 view.period.complete=false;assert.throws(()=>exportBi({view,kind:'collections'}),/incompleta/i);
});

import {openSimulation} from '../../app/src/ui/simulation.js';
import {buildOperationalQuery,selectOperationalPeriod} from '../../app/src/ui/operational-query.js';
test('BI consumes confirmed ledger through the operational query without multiplying gross',async()=>{
 const local=await openSimulation('nhpl-met',{papa:Papa});try{
  const op=buildOperationalQuery({context:local.context,fromDate:local.fromDate,toDate:local.toDate,shift:'all'});
  const raw=await local.services.history.loadPeriod(op.query),period=selectOperationalPeriod(raw,op);
  const facts=buildBiFacts({period,operationalQuery:op,asOf:Date.now()});
  assert.ok(facts.production.some(r=>r.confirmed));assert.ok(facts.indicators.every(r=>r.pct===null));assert.ok(facts.production.some(r=>r.queryDiagnostics.includes('shift-conflict')));
  assert.equal(facts.production.length,new Set(raw.production.map(r=>r.id)).size);
 }finally{local.dispose();}
});
test('export keeps more than 1000 collections and diagnoses missing shift allocation',()=>{
 const view=fixture();view.period.collections=Array.from({length:1001},(_,i)=>({...view.period.collections[0],id:'c'+i}));assert.equal(exportBi({view,kind:'collections'}).manifest.counts.collections,1001);
 view.period.production=[{...production[0],endedAt:at+86400000}];assert.equal(buildBiFacts(view).collections[0].scrapPercent,null);
});
