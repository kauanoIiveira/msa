import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evaluateCoverage,coverageFingerprint} from '../../app/src/domain/coverage.js';
import {createCoverageService} from '../../app/src/services/coverage.js';
import {memoryRepository} from '../helpers/memory-repository.js';
import {stableStringify} from '../../app/src/domain/canonical.js';
const context={machineId:'m',processId:'p',productId:'q',order:'OP',lot:'LT',shift:'1'};
const stop={id:'stop',context,startedAt:1200000,endedAt:1800000};
const classification={id:'class1',kind:'classification',stopId:'stop',category:'availability',failure:true,repairStartedAt:1300000,repairEndedAt:1600000,stopFingerprint:stableStringify([1200000,1800000,null])};
const input={context,startedAt:1000000,endedAt:4600000};
function witness(){return {...input,id:'w',complete:true,evidence:'Conferência do período',recordsFingerprint:coverageFingerprint({...input,stops:[stop],classifications:[classification]})};}
test('explicit coverage requires evidence across every planned window and invalidates after correction',()=>{
 const data={witnesses:[witness()],stops:[stop],classifications:[classification],windows:[{from:1000000,to:4600000,context}]};
 assert.equal(evaluateCoverage(data).complete,true);
 assert.equal(evaluateCoverage({...data,witnesses:[]}).complete,false);
 assert.equal(evaluateCoverage({...data,stops:[{...stop,endedAt:1900000,correctionId:'correction'}]}).complete,false);
 assert.equal(evaluateCoverage({...data,windows:[...data.windows,{from:4600000,to:5600000,context}]}).complete,false);
 assert.equal(evaluateCoverage({...data,classifications:[]}).complete,false);
});
test('coverage never hides a conflicting revision, unclassified stop or incomplete query',()=>{
 const data={witnesses:[witness()],stops:[stop],classifications:[classification],windows:[{from:1000000,to:4600000,context}]};
 assert.equal(evaluateCoverage({...data,completeQuery:false}).complete,false);
 assert.equal(evaluateCoverage({...data,witnesses:[...data.witnesses,{...witness(),id:'fork'}]}).complete,false);
 assert.equal(evaluateCoverage({...data,witnesses:[witness(),{...witness(),id:'v2',supersedes:'w'},{...witness(),id:'v3',supersedes:'v2'},{...witness(),id:'fork2',supersedes:'w'}]}).complete,false);
 assert.equal(evaluateCoverage({...data,stops:[{...stop,revisionConflict:true}]}).complete,false);
});
test('coverage confirmation verifies the current source fingerprint and preserves earlier witnesses',async()=>{
 const repo=memoryRepository();await repo.create('machines/m',{active:true});await repo.create('processes/p',{active:true,machineId:'m'});await repo.create('products/q',{active:true,processIds:{p:true}});
 await repo.create('stoppages/stop',stop);await repo.create('technicalRecords/class1',classification);
 let id=0;const service=createCoverageService({repo,actor:{uid:'admin',role:'admin'},idFactory:()=>`coverage_${++id}`});
 const row=await service.confirm({...input,complete:true,evidence:'Conferência de exemplo',recordsFingerprint:witness().recordsFingerprint});
 assert.equal(row.createdBy,'admin');await assert.rejects(service.confirm({...input,complete:true,evidence:'Outra conferência',recordsFingerprint:'stale'}),{code:'COVERAGE_CHANGED'});
 const next=await service.confirm({...input,complete:true,evidence:'Nova evidência',recordsFingerprint:witness().recordsFingerprint,supersedes:row.id});
 assert.deepEqual(await repo.get('coverageWitnesses/'+row.id),row);assert.equal(next.supersedes,row.id);
});
