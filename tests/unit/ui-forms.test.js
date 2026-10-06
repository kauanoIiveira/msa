import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createMsaServices} from '../../app/src/services/create-msa.js';
import {memoryRepository} from '../helpers/memory-repository.js';
import {seed} from '../helpers/fixtures.js';

let forms={};
try {forms=await import('../../app/src/ui/forms.js');}
catch(error) {if(error.code!=='ERR_MODULE_NOT_FOUND') throw error;}
const instant=Date.parse('2026-10-05T15:00:00-03:00');
const formData=values=>{const data=new FormData();for(const [key,value] of Object.entries(values)) for(const item of Array.isArray(value)?value:[value]) data.append(key,item);return data;};
async function workspace() {
  const repo=memoryRepository(),fixture=await seed(repo),services=createMsaServices({repo,actor:{uid:'admin',role:'admin'},clock:()=>instant});
  const registries={};for(const kind of ['machines','processes','products','parameters','parameterVersions','reasons']) registries[kind]=await repo.get(kind)??{};
  return {repo,fixture,services,context:fixture.context,registries};
}
const markup=(kind,options)=>{assert.equal(typeof forms.formMarkup,'function','Missing form markup');return forms.formMarkup(kind,options);};
const submit=(kind,data,options)=>{assert.equal(typeof forms.submitForm,'function','Missing form submission');return forms.submitForm(kind,formData(data),options);};

test('collection markup escapes record text, lists active process parameters and prefers the newest approved version',async()=>{
  const w=await workspace(),parameter=w.registries.parameters[w.fixture.parameterId];parameter.name='<img src=x onerror=alert(1)>';
  w.registries.parameters.inactive={id:'inactive',processId:w.context.processId,active:false,name:'Inactive'};
  w.registries.parameters.other={id:'other',processId:'another',active:true,name:'Other process'};
  w.registries.parameterVersions.old={...w.registries.parameterVersions[w.fixture.versionId],id:'old',createdAt:1};
  w.registries.parameterVersions.latest={...w.registries.parameterVersions[w.fixture.versionId],id:'latest',createdAt:9999999999999,status:'draft'};
  const html=markup('collection',w);
  assert.equal(html.includes('<img src=x'),false);assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(html.includes(`name="raw_${parameter.id}"`));assert.ok(html.includes(`name="version_${parameter.id}"`));
  assert.match(html,new RegExp(`value="${w.fixture.versionId}" selected`));assert.ok(html.includes('mmHg'));assert.ok(html.includes('-600'));
  assert.equal(html.includes('raw_inactive'),false);assert.equal(html.includes('raw_other'),false);assert.ok(html.includes('parameter-input-list'));
});

test('collection submission retains blank readings as missing and decimal comma as a numeric value',async()=>{
  const w=await workspace();
  const empty=await submit('collection',{[`raw_${w.fixture.parameterId}`]:'',[`version_${w.fixture.parameterId}`]:w.fixture.versionId},w);
  assert.equal(empty.readings[w.fixture.parameterId].status,'missing');assert.equal('value' in empty.readings[w.fixture.parameterId],false);
  const value=await submit('collection',{[`raw_${w.fixture.parameterId}`]:'-625,5',[`version_${w.fixture.parameterId}`]:w.fixture.versionId},w);
  assert.equal(value.readings[w.fixture.parameterId].value,-625.5);assert.deepEqual(value.context,w.context);
  await assert.rejects(()=>submit('collection',{[`raw_${w.fixture.parameterId}`]:'12'},w),{code:'INVALID_REFERENCE'});
});

test('production converts Sao Paulo local datetimes and rejects blank, fractional or reversed quantities',async()=>{
  const w=await workspace(),valid={quantity:'1234',basis:'gross',startedAt:'2026-10-05T08:00',endedAt:'2026-10-05T16:00'};
  const record=await submit('production',valid,w);
  assert.equal(record.startedAt,Date.parse('2026-10-05T08:00:00-03:00'));assert.equal(record.endedAt,Date.parse('2026-10-05T16:00:00-03:00'));assert.equal(record.quantity,1234);
  for(const quantity of ['', ' ', '1,5']) await assert.rejects(()=>submit('production',{...valid,quantity},w),{code:'INVALID_QUANTITY'});
  await assert.rejects(()=>submit('production',{...valid,endedAt:'2026-10-05T07:00'},w),{code:'INVALID_PERIOD'});
  await assert.rejects(()=>submit('production',{...valid,startedAt:'2026-02-30T08:00'},w),{code:'INVALID_TIME'});
});

test('loss uses decimal kilograms and preserves reason and unit validation',async()=>{
  const w=await workspace(),valid={kind:'material',unit:'kg',amount:'4,75',reasonId:w.fixture.reasons.material};
  const loss=await submit('loss',valid,w);assert.equal(loss.amount,4.75);assert.equal(loss.unit,'kg');
  await assert.rejects(()=>submit('loss',{...valid,amount:''},w),{code:'INVALID_QUANTITY'});
  await assert.rejects(()=>submit('loss',{...valid,unit:'minutes'},w),{code:'INVALID_UNIT'});
  await assert.rejects(()=>submit('loss',{...valid,reasonId:w.fixture.reasons.reject},w),{code:'INVALID_REFERENCE'});
  await assert.rejects(()=>submit('loss',{...valid,kind:'reject',unit:'pieces',reasonId:w.fixture.reasons.reject},w),{code:'INVALID_QUANTITY'});
});

test('stoppage closure keeps the original reason and reads planned as a checkbox',async()=>{
  const w=await workspace(),record=await submit('stoppage',{startedAt:'2026-10-05T10:00',planned:'on',reasonId:w.fixture.reasons.stop},w);
  assert.equal(record.planned,true);
  const closed=await submit('closeStop',{endedAt:'2026-10-05T10:25',reasonId:'tampered'}, {...w,record});
  assert.equal(closed.reasonId,w.fixture.reasons.stop);assert.equal(closed.endedAt-closed.startedAt,25*60000);
  const unplanned=await submit('stoppage',{startedAt:'2026-10-05T11:00',reasonId:w.fixture.reasons.stop},w);assert.equal(unplanned.planned,false);
});

test('review decisions do not start a waiting review or invent justification',async()=>{
  const w=await workspace(),collection=await w.services.operations.recordCollection({context:w.context,readings:[{parameterId:w.fixture.parameterId,versionId:w.fixture.versionId,raw:'-650'}]}),review=await w.services.analysis.submitReview({collectionId:collection.id,scope:'Check vacuum'});
  await assert.rejects(()=>submit('reviewDecision',{decision:'approved',justification:'Checked'}, {...w,record:review}),{code:'INVALID_TRANSITION'});
  await w.services.analysis.startReview(review.id);
  await assert.rejects(()=>submit('reviewDecision',{decision:'approved',justification:' '}, {...w,record:review}),{code:'VALIDATION'});
  const decided=await submit('reviewDecision',{decision:'rejected',justification:'Requires adjustment'}, {...w,record:review});assert.equal(decided.state,'rejected');assert.equal(decided.history[2].justification,'Requires adjustment');
});

test('version forms require explicit nature/status and submit validated range or draft pending rules',async()=>{
  const w=await workspace(),valid={parameterId:w.fixture.parameterId,unit:'seg',nature:'measurement',status:'draft',ruleKind:'range',lower:'0,8',upper:'0,9'};
  const version=await submit('parameterVersion',valid,w);assert.deepEqual(version.rule,{kind:'range',lower:0.8,upper:0.9});assert.equal(version.status,'draft');
  await assert.rejects(()=>submit('parameterVersion',{...valid,lower:'0,9',upper:'0,8'},w),{code:'INVALID_LIMIT'});
  await assert.rejects(()=>submit('parameterVersion',{...valid,lower:''},w),{code:'INVALID_LIMIT'});
  await assert.rejects(()=>submit('parameterVersion',{...valid,ruleKind:'pending',status:'approved'},w),{code:'INVALID_LIMIT'});
  const pending=await submit('parameterVersion',{...valid,ruleKind:'pending',lower:'',upper:''},w);assert.deepEqual(pending.rule,{kind:'pending'});
  const html=markup('parameterVersion',{...w,record:w.registries.parameters[w.fixture.parameterId]});assert.match(html,/value="draft" selected/);assert.match(html,/name="nature"[^>]*required/);assert.match(html,/name="status"[^>]*required/);
});

test('registry forms submit typed relational IDs and a selected product process map',async()=>{
  const w=await workspace();
  const machine=await submit('registry-machine',{name:'T21',code:'M21'},w);assert.equal(machine.code,'M21');
  const process=await submit('registry-process',{name:'Process B',machineId:machine.id},w);assert.equal(process.machineId,machine.id);
  const product=await submit('registry-product',{name:'Product B',processIds:[w.context.processId,process.id]},w);assert.deepEqual(product.processIds,{[w.context.processId]:true,[process.id]:true});
  const parameter=await submit('registry-parameter',{name:'Pressure',code:'CUSTOM',processId:process.id},w);assert.equal(parameter.processId,process.id);
  const reason=await submit('registry-reason',{name:'Tool setup',kind:'stop'},w);assert.equal(reason.kind,'stop');
  await assert.rejects(()=>submit('registry-product',{name:'No process'},w),{code:'INVALID_REFERENCE'});
  await assert.rejects(()=>submit('registry-process',{name:'Broken',machineId:'missing'},w),{code:'INVALID_REFERENCE'});
  const html=markup('registry-product',w);assert.ok(html.includes('class="check-line"'));assert.ok(html.includes('name="processIds"'));
});

test('targets derive matching metric units and preserve dates and the selected context',async()=>{
  const w=await workspace(),valid={name:'Production goal',metric:'producedPieces',threshold:'4000',operator:'lower',fromDate:'2026-10-01',toDate:'2026-10-05'};
  const target=await submit('target',valid,w);assert.equal(target.unit,'pieces');assert.equal(target.threshold,4000);assert.deepEqual(target.context,w.context);
  const mass=await submit('target',{...valid,name:'Material goal',metric:'lossKg',threshold:'7,5',operator:'upper'},w);assert.equal(mass.unit,'kg');assert.equal(mass.threshold,7.5);
  await assert.rejects(()=>submit('target',{...valid,threshold:''},w),{code:'VALIDATION'});
  await assert.rejects(()=>submit('target',{...valid,unit:'kg'},w),{code:'INVALID_UNIT'});
  await assert.rejects(()=>submit('target',{...valid,fromDate:'2026-02-30'},w),{code:'INVALID_DATE'});
});

test('all forms use labeled controls without nested forms and reject unknown kinds',async()=>{
  const w=await workspace();
  for(const kind of ['collection','production','loss','stoppage','closeStop','reviewDecision','parameterVersion','registry-machine','registry-process','registry-product','registry-parameter','registry-reason','target']) {
    const html=markup(kind,{...w,record:{id:'review-id',reasonId:w.fixture.reasons.stop}});assert.ok(html.includes('form-grid'));assert.ok(html.includes('field'));assert.equal(html.includes('<form'),false);assert.equal(html.includes('<button'),false);
  }
  assert.throws(()=>markup('unknown',w),{code:'INVALID_KIND'});await assert.rejects(()=>submit('unknown',{},w),{code:'INVALID_KIND'});
});
