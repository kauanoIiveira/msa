import {test} from 'node:test';
import assert from 'node:assert/strict';
import {prepare,publish,prepareRevision,assertPrivateBackupPreserved} from '../../app/src/services/presentation-dataset.js';
import {createSnapshotRepository} from '../../app/src/presentation/snapshot-repository.js';
import {datasetHash,manifestEntryValue} from '../../app/src/presentation/dataset-hash.js';
const actor={uid:'admin',role:'admin'},anchorDate='2026-10-08';
let prepared;
async function fixture(){prepared??=await prepare({repo:createSnapshotRepository(),actor,anchorDate,version:'v1'});return structuredClone(prepared);}

test('publication is idempotent, immutable, and leaves external data intact',async()=>{
 const repo=createSnapshotRepository();await repo.create('members',{admin:{role:'admin'}});await repo.create('machines/legacy',{id:'legacy',active:true,name:'Existing'});
 const preview=await prepare({repo,actor,anchorDate,version:'v1'});assert.equal(preview.conflicts.length,0);
 const before=await datasetHash(await repo.get('members')),result=await publish({preview,expectedHash:preview.previewHash,repo,actor});
 assert.equal(result.created,preview.manifest.entries.length);assert.equal(result.updated,43);assert.equal((await repo.get('presentationManifests/'+result.manifestId)).state,'published');
 assert.equal((await publish({preview,expectedHash:preview.previewHash,repo,actor})).created,0);
 assert.equal(await datasetHash(await repo.get('members')),before);assert.equal((await repo.get('machines/legacy')).name,'Existing');
});

test('resumes interruptions inside plan approval and stoppage closing without duplicates',async()=>{
 for(const marker of ['productionPlans/nhpl','productionPlans/nhpl/events/','productionIntervals/','close']){
  const repo=createSnapshotRepository(),preview=await fixture();let cut=false;
  const interrupted={...repo,create:async(path,row)=>{const result=await repo.create(path,row);if(!cut&&(marker.endsWith('/')?path.startsWith(marker):path===marker)){cut=true;throw new Error('INTERRUPTED');}return result;},transact:async(path,fn)=>{const result=await repo.transact(path,fn);if(!cut&&marker==='close'&&path.startsWith('stoppages/')){cut=true;throw new Error('INTERRUPTED');}return result;}};
  await assert.rejects(()=>publish({preview,expectedHash:preview.previewHash,repo:interrupted,actor}),/INTERRUPTED/);assert.equal(cut,true);
  const result=await publish({preview,expectedHash:preview.previewHash,repo,actor});assert.ok(result.created>0);assert.ok(result.existing>0);
  assert.equal((await publish({preview,expectedHash:preview.previewHash,repo,actor})).created,0);
 }
});

test('rejects preview tampering, foreign content, concurrent changes, and a different actor before writing',async()=>{
 const preview=await fixture();
 for(const kind of ['tampered','foreign','external','actor']){
  const repo=createSnapshotRepository(),copy=structuredClone(preview);
  if(kind==='tampered')copy.commands[0].method='other';
  if(kind==='foreign')await repo.create('machines/nhpl',{id:'nhpl',name:'Collision'});
  if(kind==='external')await repo.create('machines/new',{id:'new',name:'Concurrent'});
  await assert.rejects(()=>publish({preview:copy,expectedHash:preview.previewHash,repo,actor:kind==='actor'?{uid:'other',role:'admin'}:actor}));
  assert.equal(await repo.get('presentationManifests'),null);
 }
});

test('additive immutable revision keeps base identity and event hashes',async()=>{
 const repo=createSnapshotRepository(),preview=await fixture();await publish({preview,expectedHash:preview.previewHash,repo,actor});
 const base=await repo.get('presentationManifests/'+preview.manifest.id),hash=await datasetHash(base);
 const revision=await prepareRevision({repo,actor,baseManifestId:base.id,revision:'coordination',commands:[{id:base.id+'_rev_coordination_reason',service:'registry',method:'create',args:['reasons',{name:'Reason for coordination',kind:'stop'}]}]});
 await publish({preview:revision,expectedHash:revision.previewHash,repo,actor});
 assert.equal(await datasetHash(await repo.get('presentationManifests/'+base.id)),hash);
 assert.equal(revision.manifest.packageId,base.packageId);assert.equal(revision.manifest.baseManifestId,base.id);
 assert.equal((await publish({preview:revision,expectedHash:revision.previewHash,repo,actor})).created,0);
});


test('domain digest matches RTDB omission of empty settings and null optional fields',async()=>{
 assert.equal(await datasetHash({id:'r',settings:{},optional:null,nested:{absent:null}}),await datasetHash({id:'r'}));
});

test('event content stays protected and unknown writes during publication block the marker',async()=>{
 const repo=createSnapshotRepository(),preview=await fixture();let injected=false;
 const concurrent={...repo,create:async(path,row)=>{const value=await repo.create(path,row);if(!injected){injected=true;await repo.create('machines/external',{id:'external',name:'Concurrent'});}return value;}};
 await assert.rejects(()=>publish({preview,expectedHash:preview.previewHash,repo:concurrent,actor}),{code:'STALE_PREVIEW'});
 assert.equal(await repo.get('presentationManifests'),null);
 const clean=createSnapshotRepository();await publish({preview,expectedHash:preview.previewHash,repo:clean,actor});
 const entry=preview.manifest.entries.find(e=>e.path.startsWith('productionPlans/nhpl/events/'));
 await clean.transact(entry.path,row=>({...row,plannedPieces:999}));
 await assert.rejects(()=>publish({preview,expectedHash:preview.previewHash,repo:clean,actor}),{code:'CONTENT_CONFLICT'});
});

test('permission errors never fall back and full private backup protects memberships and unknown roots',async()=>{
 const repo=createSnapshotRepository(),preview=await fixture();let attempts=0;
 const denied={...repo,create:async()=>{attempts++;const e=new Error('denied');e.code='FORBIDDEN';throw e;}};
 await assert.rejects(()=>publish({preview,expectedHash:preview.previewHash,repo:denied,actor}),{code:'FORBIDDEN'});assert.equal(attempts,1);
 const original={members:{admin:{role:'admin'}},futureModule:{row:{value:1}}};
 await assertPrivateBackupPreserved(original,structuredClone(original),preview);
 for(const changed of [{...original,members:{admin:{role:'viewer'}}},{...original,futureModule:{row:{value:2}}}])await assert.rejects(()=>assertPrivateBackupPreserved(original,changed,preview),{code:'PRIVATE_BACKUP_CHANGED'});
});

test('published marker never hides a missing owned record on repetition',async()=>{
 const repo=createSnapshotRepository(),preview=await fixture();await publish({preview,expectedHash:preview.previewHash,repo,actor});
 const path=preview.manifest.entries.find(e=>e.path.startsWith('collections/')).path;await repo.transact(path,()=>null);
 await assert.rejects(()=>publish({preview,expectedHash:preview.previewHash,repo,actor}),{code:'VERIFICATION_FAILED'});
});


test('header digest tolerates future sibling events while record digest covers event content',async()=>{
 const header={firstSlotId:'a',events:{a:{id:'a',quantity:10}}},entry={scope:'ledger-header'};
 assert.equal(await datasetHash(manifestEntryValue(header,entry)),await datasetHash(manifestEntryValue({...header,events:{...header.events,b:{id:'b',quantity:20}}},entry)));
 assert.notEqual(await datasetHash(manifestEntryValue(header.events.a,{scope:'record'})),await datasetHash(manifestEntryValue({id:'a',quantity:11},{scope:'record'})));
});
