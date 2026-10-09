import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {datasetHash} from '../../app/src/presentation/dataset-hash.js';
import {createSnapshotRepository} from '../../app/src/presentation/snapshot-repository.js';
import * as publication from '../../app/src/services/presentation-dataset.js';
import {stableStringify} from '../../app/src/domain/canonical.js';
const actor={uid:'admin',role:'admin'},stamp={'.sv':'timestamp'},hash=value=>datasetHash(stableStringify(value));
const review={id:'review',collectionId:'collection',context:{machineId:'machine'},scope:'Check',state:'waiting',history:{0:{state:'waiting',by:'admin',at:stamp}}};
function legacyValue(value){if(Array.isArray(value))return value.map(legacyValue);if(value&&typeof value==='object'){const pairs=Object.keys(value).sort().filter(k=>!['createdAt','closedAt'].includes(k)&&value[k]!=null).map(k=>[k,legacyValue(value[k])]).filter(([,v])=>v!=null&&!(typeof v==='object'&&!Object.keys(v).length));return pairs.length?Object.fromEntries(pairs):null;}return value;}
test('only review numeric history audit clocks are normalized',async()=>{
 const resolved=structuredClone(review);resolved.history[0].at=123;
 assert.equal(await datasetHash(review),await datasetHash(resolved));
 for(const [key,value] of [['state','approved'],['by','other'],['justification','changed']]){const changed=structuredClone(resolved);changed.history[0][key]=value;assert.notEqual(await datasetHash(review),await datasetHash(changed));}
 for(const value of [{at:1},{history:{0:{at:1}}},{...review,history:{event:{at:1}}}]){const changed=JSON.parse(JSON.stringify(value).replace('"at":1','"at":2'));assert.notEqual(await datasetHash(value),await datasetHash(changed));}
});
test('resolved review publication resumes, preserves every audit event and reprepares only an unpublished evaluation',async()=>{
 let tick=1000;const storage=createSnapshotRepository(),resolve=value=>{if(Array.isArray(value))return value.map(resolve);if(value&&typeof value==='object'){if(value['.sv']==='timestamp')return ++tick;return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,resolve(v)]));}return value;};
 const repo={...storage,create:(path,row)=>storage.create(path,resolve(row)),transact:(path,update)=>storage.transact(path,row=>{const next=update(row);if(path.startsWith('reviews/'))for(const [key,event]of Object.entries(row.history))assert.deepEqual(next.history[key],event);return resolve(next);})};
 const base=await publication.prepare({repo,actor,anchorDate:'2026-10-08'});await publication.publish({preview:base,expectedHash:base.previewHash,repo,actor});
 const baseline=await publication.readPresentationSnapshot(repo),id=base.manifest.packageId+'_rev_evaluation',collectionId=Object.keys(baseline.collections)[0];
 const commands=[{id:id+'_review',service:'analysis',method:'submitReview',args:[{collectionId,scope:'Check'}]},{id:id+'_start',service:'analysis',method:'startReview',args:[{$ref:id+'_review',path:['id']}]},{id:id+'_approve',service:'analysis',method:'decideReview',args:[{$ref:id+'_review',path:['id']},{decision:'approved',justification:'Checked'}]}];
 const preview=await publication.prepareRevision({repo,actor,baseManifestId:base.manifest.id,revision:'evaluation',commands}),path=preview.intents[0].path;
 let stopped=false;const partial={...repo,create:async(p,row)=>{const result=await repo.create(p,row);if(p===path&&!stopped){stopped=true;throw Error('INTERRUPTED');}return result;}};
 await assert.rejects(()=>publication.publish({preview,expectedHash:preview.previewHash,repo:partial,actor}),/INTERRUPTED/);
 const waiting=await repo.get(path);assert.equal(typeof waiting.history[0].at,'number');
 const envelope={projectId:'msayellowteam',workspaceId:'msa',preview:structuredClone(preview),fullBackup:baseline,fullBackupHash:await hash(baseline)};
 // Simulate the original pre-fix review digest while preserving its original content seal.
 envelope.preview.manifest.entries.at(-1).hash=createHash('sha256').update(JSON.stringify(legacyValue(preview.intents.at(-1).after))).digest('hex');delete envelope.preview.previewHash;envelope.preview.previewHash=await hash(envelope.preview);
 const original=stableStringify(envelope),currentFullBackup=await publication.readPresentationSnapshot(repo);
 const candidate=await publication.reprepareEvaluationPreview({envelope,repo,actor,currentFullBackup});assert.equal(stableStringify(envelope),original);assert.notEqual(candidate.preview.previewHash,envelope.preview.previewHash);assert.deepEqual(candidate.preview.commands,commands);assert.deepEqual(candidate.preview.manifest.entries.slice(0,-1),base.manifest.entries);
 await assert.rejects(()=>publication.publish({preview:candidate.preview,expectedHash:envelope.preview.previewHash,repo,actor}),{code:'PREVIEW_HASH_MISMATCH'});
 for(const change of ['actor','backup','outside','inherited','preview','state','by','justification']){
  const copy=structuredClone(envelope),current=structuredClone(currentFullBackup);let who=actor,source=repo;
  if(change==='actor')who={uid:'other',role:'admin'};
  if(change==='backup')copy.fullBackupHash='bad';
  if(change==='outside')current.members={other:{role:'admin'}};
  if(change==='preview')copy.preview.commands[0].args[0].scope='Changed';
  if(change==='inherited'){copy.preview.manifest.entries[0].hash='a'.repeat(64);delete copy.preview.previewHash;copy.preview.previewHash=await hash(copy.preview);}
  if(['state','by','justification'].includes(change)){const altered=structuredClone(waiting);altered.history[0][change]='changed';source={...repo,get:async p=>p==='reviews'?{[waiting.id]:altered}:repo.get(p)};}
  await assert.rejects(()=>publication.reprepareEvaluationPreview({envelope:copy,repo:source,actor:who,currentFullBackup:current}));
 }
 let analyzing;const stopOnStart={...repo,transact:async(p,fn)=>{const result=await repo.transact(p,fn);if(p===path&&result.state==='analyzing'){analyzing=result;throw Error('INTERRUPTED');}return result;}};
 await assert.rejects(()=>publication.publish({preview:candidate.preview,expectedHash:candidate.preview.previewHash,repo:stopOnStart,actor}),/INTERRUPTED/);
 await publication.publish({preview:candidate.preview,expectedHash:candidate.preview.previewHash,repo,actor});const done=await repo.get(path);
 assert.deepEqual(done.history[0],waiting.history[0]);assert.deepEqual(done.history[1],analyzing.history[1]);assert.equal(typeof done.history[2].at,'number');assert.ok(done.history[2].at>done.history[1].at);
 assert.equal((await publication.publish({preview:candidate.preview,expectedHash:candidate.preview.previewHash,repo,actor})).created,0);
 await assert.rejects(async()=>publication.reprepareEvaluationPreview({envelope,repo,actor,currentFullBackup:await publication.readPresentationSnapshot(repo)}),{code:'MANIFEST_EXISTS'});
});
