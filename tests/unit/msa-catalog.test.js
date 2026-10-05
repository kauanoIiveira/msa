import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../../app/src/index.js';
import {memoryRepository} from '../helpers/memory-repository.js';
import {seed} from '../helpers/fixtures.js';
const options=repo=>({repo,actor:{uid:'admin',role:'admin'}});
const catalog=()=>{assert.equal(typeof api.getMsaParameterCatalog,'function','Missing MSA reference catalog');return api.getMsaParameterCatalog();};
const natures=()=>Object.fromEntries(catalog().map(item=>[item.code,'setpoint']));

test('catalog preserves all 41 source parameters and usable decimal tolerances',()=>{
  const entries=catalog();assert.equal(entries.length,41);assert.equal(new Set(entries.map(e=>e.code)).size,41);
  const byColumn=Object.fromEntries(entries.map(e=>[e.source.column,e]));
  assert.deepEqual(byColumn.F.draftRule,{kind:'range',lower:13,upper:30});
  assert.deepEqual(byColumn.AX.draftRule,{kind:'range',lower:412,upper:415});
  assert.deepEqual(byColumn.BF.draftRule,{kind:'range',lower:0.8,upper:0.9});
  assert.deepEqual(byColumn.BX.draftRule,{kind:'range',lower:1.5,upper:5});
  assert.deepEqual(byColumn.CF.draftRule,{kind:'lower',lower:6.5});
  assert.equal(byColumn.CF.unit,'bar');assert.equal(byColumn.CH.unit,'mm/Hg');
  entries[0].draftRule.lower=-1;assert.equal(catalog()[0].draftRule.lower,13);
});

test('ambiguous vacuum, inverted contramold and all heating zones remain unresolved',()=>{
  const entries=catalog(),byColumn=Object.fromEntries(entries.map(e=>[e.source.column,e]));
  assert.deepEqual(byColumn.BH.source.limits,{lower:80,upper:75});
  assert.deepEqual(byColumn.BH.draftRule,{kind:'pending'});assert.ok(byColumn.BH.issues.includes('inverted-source-limits'));
  assert.deepEqual(byColumn.CH.source.limits,{lower:-600,upper:null});
  assert.deepEqual(byColumn.CH.draftRule,{kind:'pending'});assert.ok(byColumn.CH.issues.includes('vacuum-direction-unconfirmed'));
  const zones=entries.filter(e=>e.group==='heating');assert.equal(zones.length,21);
  assert.ok(zones.every(e=>e.draftRule.kind==='pending'&&e.questions.length>0));
  assert.deepEqual(byColumn.J.source.limits,{lower:255,upper:265});
  assert.equal(zones.filter(e=>e.issues.includes('zero-zero-source-limits')).length,4);
});

test('catalog preview performs no writes and installation requires confirmation and explicit nature',async()=>{
  const repo=memoryRepository(),f=await seed(repo),msa=api.createMsaServices(options(repo));
  assert.equal(typeof msa.catalog?.preview,'function','Missing catalog service');
  const before=await repo.get('parameters'),preview=await msa.catalog.preview({processId:f.context.processId});
  assert.equal(preview.items.length,41);assert.deepEqual(await repo.get('parameters'),before);
  await assert.rejects(()=>msa.catalog.install({processId:f.context.processId,natureByCode:natures(),confirmed:false}),{code:'CONFIRMATION_REQUIRED'});
  await assert.rejects(()=>msa.catalog.install({processId:f.context.processId,natureByCode:{},confirmed:true}),{code:'NATURE_REQUIRED'});
  assert.deepEqual(await repo.get('parameters'),before);
});

test('confirmed installation preserves drafts and repeated or concurrent installation creates no duplicates',async()=>{
  const repo=memoryRepository(),f=await seed(repo),msa=api.createMsaServices(options(repo));
  assert.equal(typeof msa.catalog?.install,'function','Missing catalog installation');
  const payload={processId:f.context.processId,natureByCode:natures(),confirmed:true};
  const [first,second]=await Promise.all([msa.catalog.install(payload),msa.catalog.install(payload)]);
  assert.equal(first.items.length,41);assert.equal(second.items.length,41);
  assert.equal(Object.keys(await repo.get('parameters')).length,42);
  assert.equal(Object.keys(await repo.get('parameterVersions')).length,42);
  const again=await msa.catalog.install(payload);assert.ok(again.items.every(e=>!e.parameterCreated&&!e.versionCreated));
  const versions=Object.values(await repo.get('parameterVersions')).filter(v=>v.id!==f.versionId);
  assert.ok(versions.every(v=>v.status==='draft'&&v.nature==='setpoint'));
  const vacuum=again.items.find(e=>e.code==='MSA_CH');assert.equal((await repo.get(`parameterVersions/${vacuum.versionId}`)).rule.kind,'pending');
  await assert.rejects(()=>msa.catalog.install({...payload,natureByCode:Object.fromEntries(catalog().map(e=>[e.code,'measurement']))}),{code:'CATALOG_CONFLICT'});
});

test('catalog rejects unauthorized installation, missing process and existing ambiguous source codes',async()=>{
  const repo=memoryRepository(),f=await seed(repo);
  const op=api.createMsaServices({repo,actor:{uid:'op',role:'operator'}});
  assert.equal(typeof op.catalog?.install,'function','Missing catalog authorization');
  await assert.rejects(()=>op.catalog.install({processId:f.context.processId,confirmed:true,natureByCode:natures()}),{code:'FORBIDDEN'});
  const msa=api.createMsaServices(options(repo));
  await assert.rejects(()=>msa.catalog.preview({processId:'missing'}),{code:'INVALID_REFERENCE'});
  await f.registry.create('parameters',{processId:f.context.processId,code:'MSA_F',name:'Already entered manually'});
  await assert.rejects(()=>msa.catalog.install({processId:f.context.processId,confirmed:true,natureByCode:natures()}),{code:'CATALOG_CONFLICT'});
  assert.equal(Object.keys(await repo.get('parameters')).length,2);
});
