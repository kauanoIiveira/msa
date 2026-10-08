import {test} from 'node:test';
import assert from 'node:assert/strict';
import {projectWorkspaceMetrics} from '../../app/src/domain/workspace-metrics.js';
import {coverageFingerprint} from '../../app/src/domain/coverage.js';
import {stableStringify} from '../../app/src/domain/canonical.js';
const context={machineId:'m',processId:'p',productId:'q',order:'OP',lot:'LT',shift:'1'},from=1000000,to=4600000;
const stop={id:'stop',context,startedAt:1200000,endedAt:1800000};
const classification={id:'c',kind:'classification',context,stopId:'stop',category:'availability',failure:true,repairStartedAt:1300000,repairEndedAt:1600000,stopFingerprint:stableStringify([1200000,1800000,null])};
const witness={id:'w',context,startedAt:from,endedAt:to,complete:true,evidence:'Exemplo conferido',recordsFingerprint:coverageFingerprint({context,startedAt:from,endedAt:to,stops:[stop],classifications:[classification]})};
const state={client:{mode:'workspace'},context,asOf:to+10000,operationalQuery:{windows:[{from,to}],query:{context}},period:{plans:[{id:'plan',context,startedAt:from,endedAt:to}],coverage:{stoppages:true,production:true,corrections:true},nhplComplete:true,effective:{stoppages:[stop],production:[]},coverageWitnesses:[witness]},technical:[classification,{id:'r',kind:'reference',context,effectiveFrom:from,idealSeconds:10,microStopSeconds:60}],productivity:{segments:[{intervalId:'interval',planRevisionId:'plan',context,from,to,grossPieces:100,state:'final'}]}};
test('MTBF and MTTR use classified failures and covered time independently of quality inspection',()=>{
 const view=projectWorkspaceMetrics(state);assert.equal(view.reliability.mtbf.value,3000);assert.equal(view.reliability.mttr.value,300);assert.equal(view.aggregate.oee,null);
 const noCoverage=projectWorkspaceMetrics({...state,period:{...state.period,coverageWitnesses:[]}});assert.equal(noCoverage.reliability.mtbf.value,null);assert.equal(noCoverage.reliability.mttr.value,null);
});
test('legacy inspection coverage requires its current production fingerprint',()=>{
 const production=[{id:'gross',intervalId:'interval',basis:'gross',quantity:100}],inspection={id:'inspection',kind:'inspection',context,intervalId:'interval',firstPassGood:90,historyComplete:true,productionFingerprint:stableStringify([['gross',100,null]])};
 const legacy={...state,client:{mode:'scenario'},period:{...state.period,coverageWitnesses:[],effective:{...state.period.effective,production}},technical:[...state.technical,inspection]};
 assert.equal(projectWorkspaceMetrics(legacy).reliability.mtbf.value,3000);
 assert.equal(projectWorkspaceMetrics({...legacy,period:{...legacy.period,effective:{...legacy.period.effective,production:[{...production[0],quantity:101}]}}}).reliability.mtbf.value,null);
});
