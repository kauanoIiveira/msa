import {test} from 'node:test';import assert from 'node:assert/strict';
import {buildIndicators,effectiveRecords,analyzeCep} from '../../app/src/index.js';
import {getCepStudy,cepReportRows} from '../../app/src/ui/cep.js';
const context={machineId:'m',processId:'process',productId:'q'},parameter={id:'parameter',code:'MSA_BF',name:'Tempo destacar',active:true,processId:'process'},version={id:'v',parameterId:parameter.id,unit:'seg',status:'approved',nature:'measurement',rule:{kind:'range',lower:.8,upper:.9}};
const start=Date.parse('2026-10-05T08:00:00-03:00');
const originals=()=>Array.from({length:30},(_,i)=>({id:'c'+i,context,eventDate:'2026-10-05',timePrecision:'instant',occurredAt:start+i*60000,origin:'manual',readings:{parameter:{parameterId:parameter.id,versionId:'v',raw:String(.85+(i%2)*.001),value:.85+(i%2)*.001,status:'valid'}}}));
const stateFor=data=>({context,dataset:'operational',actor:{uid:'test'},fromDate:'2026-10-01',toDate:'2026-10-06',period:{},registries:{parameters:{parameter:structuredClone(parameter)},parameterVersions:{v:structuredClone(version)}},cep:{source:'system',parameterId:parameter.id,minSamples:25,sequenceConfirmed:false},dashboard:buildIndicators({...data,parameterVersions:{v:version}},{from:start,to:start+86400000,complete:data.complete??true})});
test('CEP blocks only the study affected by conflicting revisions and respects collection coverage',()=>{
 const rows=originals(),patch={...rows[0],readings:{parameter:{...rows[0].readings.parameter,value:.851,raw:'.851'}}};
 const revisions=['fix1','fix2'].map(id=>({id,recordType:'collections',recordId:'c0',state:'approved',replacement:patch}));
 const effective=effectiveRecords('collections',rows,revisions).items,state=stateFor({collections:effective,coverage:{collections:true},complete:false});
 assert.equal(getCepStudy(state).analysis.reason,'revision-conflict');assert.equal(getCepStudy(state).analysis.cp,null);
 assert.equal(getCepStudy(state).analysis.nConflicted,1);assert.equal(getCepStudy(state).analysis.points[0],null);assert.equal(state.dashboard.statistics[0].nValid,29);
 const unaffected=stateFor({collections:rows,coverage:{collections:true},complete:false});assert.equal(getCepStudy(unaffected).analysis.reason,null,'Conflito/produção de outro contexto não bloqueia grupo íntegro');
 const partial=stateFor({collections:rows,coverage:{collections:false},complete:false});assert.equal(getCepStudy(partial).analysis.reason,'incomplete-study');
});
test('historical study refuses a specification with a different unit',()=>{
 const state=stateFor({collections:[]});state.cep={source:'workbook',parameterId:'MSA_BB',versionId:'v',minSamples:2,sequenceConfirmed:true};state.registries.parameters.parameter.code='MSA_BB';state.registries.parameterVersions.v={...version,unit:'ms'};
 const study=getCepStudy(state);assert.equal(study.analysis.cp,null);assert.equal(study.analysis.reason,'incompatible-unit');
 assert.equal(study.unit,'seg');assert.equal(cepReportRows(state)[0].specificationUnit,'ms');
});
test('historical report carries actual observation dates separately from the consultation window',()=>{
 const state=stateFor({collections:[]});state.cep.source='workbook';state.cep.parameterId='MSA_BF';
 const summary=cepReportRows(state)[0];assert.equal(summary.fromDate,'2026-08-25');assert.equal(summary.toDate,'2026-09-29');assert.equal(summary.consultationFromDate,'2026-10-01');
});
test('an applied correction reaches the CEP series and CSV with original and used readings',()=>{
 const rows=originals(),replacement=structuredClone(rows[0]);replacement.readings.parameter={...replacement.readings.parameter,raw:'0.8505',value:.8505};
 const effective=effectiveRecords('collections',rows,[{id:'fix1',recordType:'collections',recordId:'c0',state:'approved',replacement}]).items,state=stateFor({collections:effective});
 const used=cepReportRows(state).find(r=>r.collectionId==='c0');assert.equal(used.correctionId,'fix1');assert.equal(used.originalRaw,'0.85');assert.equal(used.raw,'0.8505');
});
