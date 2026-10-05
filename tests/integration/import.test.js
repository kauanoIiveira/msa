import {test} from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';
import {setup,sdk} from '../helpers/firebase-env.js';
import {seed} from '../helpers/fixtures.js';
import {createFirebaseRepository} from '../../app/src/repositories/firebase-repository.js';
import {createOperations} from '../../app/src/services/operations.js';
import {createCsvService} from '../../app/src/io/csv.js';
test('concurrent confirmed imports deduplicate atomically and preserve source/date',async t=>{
  const env=await setup(t),repo=uid=>createFirebaseRepository({db:env.authenticatedContext(uid).database(),sdk,workspaceId:'demo'}),f=await seed(repo('admin'));
  const csv=uid=>{const r=repo(uid);return createCsvService({papa:Papa,repo:r,operations:createOperations({repo:r,actor:{uid,role:uid==='op'?'operator':'engineer'}})});};
  const a=csv('op'),b=csv('eng'),opts={source:{file:'synthetic.csv'},context:f.context,parameterMap:{Vacuum:{parameterId:f.parameterId,versionId:f.versionId}}};
  const preview=await a.previewImport('date;parameter;raw\n2026-08-31;Vacuum;-600',opts);
  const results=await Promise.all([a.confirmImport(preview,{confirmed:true}),b.confirmImport(preview,{confirmed:true})]);
  assert.equal(results.reduce((n,r)=>n+r.created,0),1);
  const records=Object.values(await repo('view').get('collections'));assert.equal(records.length,1);assert.equal(records[0].eventDate,'2026-08-31');assert.equal(records[0].occurredAt,undefined);assert.equal(records[0].source.row,2);
});
