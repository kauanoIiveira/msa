import {validateMachineExpansion} from '../presentation/machine-expansion.js';
import {validateEvaluationExamples} from '../presentation/evaluation-examples.js';
import {assertRole,assertId,requireThat} from '../domain/errors.js';
import {stableStringify} from '../domain/canonical.js';
import {shiftAt} from '../domain/shifts.js';
import {buildPresentationDataset,previewPresentationDataset,presentationRoots} from '../presentation/dataset-builder.js';
import {createSnapshotRepository} from '../presentation/snapshot-repository.js';
import {datasetHash,manifestEntryScope,manifestEntryValue} from '../presentation/dataset-hash.js';
import {runPresentationCommands} from '../presentation/dataset-commands.js';
import {validatePresentationDataset,validatePresentationProjection} from '../presentation/dataset-validation.js';
import {createMsaServices} from './create-msa.js';

const clone=value=>structuredClone(value),same=(a,b)=>stableStringify(a)===stableStringify(b);
const at=(tree,path)=>path.split('/').reduce((node,key)=>node?.[key],tree)??null;
const contentHash=value=>datasetHash(stableStringify(value));
function assign(tree,path,value){const parts=path.split('/');let node=tree;for(const part of parts.slice(0,-1))node=node[part]??={};if(value==null)delete node[parts.at(-1)];else node[parts.at(-1)]=clone(value);}
function prune(value){if(value&&typeof value==='object'&&!Array.isArray(value)){for(const key of Object.keys(value)){prune(value[key]);if(value[key]&&typeof value[key]==='object'&&!Object.keys(value[key]).length)delete value[key];}}return value;}
export async function readPresentationSnapshot(repo){const snapshot={};for(const root of [...presentationRoots,'presentationManifests']){const value=await repo.get(root);if(value!=null)snapshot[root]=value;}return snapshot;}
async function isolated(snapshot,timestamp){const repo=createSnapshotRepository({timestamp});for(const [root,value]of Object.entries(snapshot))await repo.create(root,value);return repo;}
const publicationClock=manifest=>()=>Date.parse(manifest.toOperationalDate+'T07:00:00-03:00')+86400000;
async function seal(result,baselineSnapshot,actor){
 const preview={format:1,actor:clone(actor),manifest:result.manifest,commands:result.commands,baselineSnapshot,intents:result.intents??[],conflicts:result.diagnostics??[],backupHash:await contentHash(baselineSnapshot)};
 preview.previewHash=await contentHash(preview);return preview;
}
export async function prepare({repo,actor,anchorDate=shiftAt(Date.now()).operationalDate,version='v1'}){
 assertRole(actor,['admin']);const baseline=await readPresentationSnapshot(repo),dataset=buildPresentationDataset({anchorOperationalDate:anchorDate,version});
 requireThat(!baseline.presentationManifests?.[dataset.manifest.id],'MANIFEST_EXISTS');
 const result=await previewPresentationDataset(dataset,{repo,actor,existingSnapshot:baseline});
 return seal(result,baseline,actor);
}
export async function prepareRevision({repo,actor,baseManifestId,revision,commands}){
 assertRole(actor,['admin']);assertId(baseManifestId);assertId(revision);
 const baseline=await readPresentationSnapshot(repo),base=baseline.presentationManifests?.[baseManifestId];requireThat(base?.state==='published','BASE_MANIFEST_REQUIRED');
 const id=assertId(base.packageId+'_rev_'+revision);requireThat(!baseline.presentationManifests?.[id],'MANIFEST_EXISTS');
 requireThat(Array.isArray(commands)&&commands.length>0&&commands.every(c=>c.id.startsWith(id+'_')),'REVISION_COMMAND_ID');
 const local=await isolated(baseline,()=>repo.timestamp()),intents=[],createdPaths=new Set();
 const tracked={...local,updateRegistry:async()=>{throw new Error('REVISION_NOT_ADDITIVE');},create:async(path,row)=>{requireThat(at(baseline,path)==null,'REVISION_NOT_ADDITIVE');const result=await local.create(path,row);createdPaths.add(path);intents.push({kind:'create',path,before:null,after:result});return result;},transact:async(path,update)=>{requireThat(createdPaths.has(path)&&at(baseline,path)==null,'REVISION_NOT_ADDITIVE');const before=await local.get(path),result=await local.transact(path,update);intents.push({kind:'transact',path,before,after:result});return result;}};
 await runPresentationCommands(commands,{repo:tracked,actor,clock:publicationClock(base),onCommand:command=>{tracked.commandId=command.id;}});
 // Command identity is descriptive; deterministic path/content is verified during replay.
 const additions=[];for(const path of new Set(intents.map(i=>i.path)))additions.push({index:base.entries.length+additions.length,path,scope:manifestEntryScope(path),hash:await datasetHash(manifestEntryValue(await local.get(path),{scope:manifestEntryScope(path)}))});
 requireThat(additions.length>0,'REVISION_EMPTY');
 const manifest={...base,id,packageId:base.packageId??base.id,baseManifestId,version:revision,state:'prepared',createdBy:actor.uid,createdAt:repo.timestamp(),entries:[...base.entries,...additions]};
 for(const key of ['entryCount','entriesHash','previewHash','backupHash'])delete manifest[key];
 const snapshot=await readPresentationSnapshot(local),validation=await validatePresentationDataset(snapshot,manifest);
 validation.diagnostics.push(...await validatePresentationProjection(createMsaServices({repo:local,actor}),manifest,validation.metricsByContext));
 validation.diagnostics.push(...(await validateMachineExpansion(createMsaServices({repo:local,actor}),manifest)).diagnostics);
  validation.diagnostics.push(...(await validateEvaluationExamples(createMsaServices({repo:local,actor}),manifest)).diagnostics);
 return seal({manifest,commands,intents,diagnostics:validation.diagnostics},baseline,actor);
}
function outsidePackage(snapshot,preview){
 const rest=clone(snapshot),baseline=preview.baselineSnapshot;
 // Restore only paths touched by this revision. Unknown siblings/events remain visible.
 for(const {path} of preview.intents){
  if(manifestEntryScope(path)==='ledger-header'){
   const current=at(rest,path);if(!current)continue;const original=at(baseline,path)??{};
   for(const key of Object.keys(current))if(key!=='events'){if(Object.hasOwn(original,key))current[key]=clone(original[key]);else delete current[key];}
   for(const [key,value]of Object.entries(original))if(key!=='events')current[key]=clone(value);
  }else assign(rest,path,at(baseline,path));
 }
 assign(rest,'presentationManifests/'+preview.manifest.id,at(baseline,'presentationManifests/'+preview.manifest.id));
 return prune(rest);
}
async function preflight(preview,repo){
 const current=await readPresentationSnapshot(repo);
 requireThat(await contentHash(outsidePackage(current,preview))===await contentHash(prune(clone(preview.baselineSnapshot))),'STALE_PREVIEW');
 const states=new Map();for(const intent of preview.intents){const list=states.get(intent.path)??[intent.before];list.push(intent.after);states.set(intent.path,list);}
 for(const [path,allowed]of states){const entry={scope:manifestEntryScope(path)},value=manifestEntryValue(at(current,path),entry),hash=await datasetHash(value);requireThat((await Promise.all(allowed.map(row=>datasetHash(manifestEntryValue(row,entry))))).includes(hash),'CONTENT_CONFLICT',path);}
 for(const entry of preview.manifest.entries){if(states.has(entry.path))continue;requireThat(await datasetHash(manifestEntryValue(at(current,entry.path),entry))===entry.hash,'CONTENT_CONFLICT');}
 return current;
}
async function verifyPersisted(snapshot,manifest,repo,actor){
 const validation=await validatePresentationDataset(snapshot,manifest);requireThat(validation.ok,'VERIFICATION_FAILED');
 // The caller just reloaded every business root and checked all entry digests.
 const fresh=await isolated(snapshot,()=>repo.timestamp()),services=createMsaServices({repo:fresh,actor});
 const diagnostics=await validatePresentationProjection(services,manifest,validation.metricsByContext);diagnostics.push(...(await validateMachineExpansion(services,manifest)).diagnostics,...(await validateEvaluationExamples(services,manifest)).diagnostics);requireThat(!diagnostics.length,'VERIFICATION_FAILED');
}
export async function publish({preview,expectedHash,repo,actor,onProgress}){
 assertRole(actor,['admin']);requireThat(same(actor,preview.actor),'ACTOR_CHANGED');
 const {previewHash,...body}=preview;requireThat(expectedHash===previewHash&&await contentHash(body)===previewHash,'PREVIEW_HASH_MISMATCH');
 requireThat(preview.format===1&&!preview.conflicts.length&&preview.manifest.entries.length>0,'INVALID_PREVIEW');
 requireThat(await contentHash(preview.baselineSnapshot)===preview.backupHash,'BACKUP_HASH_MISMATCH');
 const current=await preflight(preview,repo),existingManifest=current.presentationManifests?.[preview.manifest.id];
 const manifest={...preview.manifest,state:'published',createdAt:repo.timestamp(),entryCount:preview.manifest.entries.length,entriesHash:await datasetHash(preview.manifest.entries),previewHash,backupHash:preview.backupHash};
 if(existingManifest){requireThat(await datasetHash(existingManifest)===await datasetHash(manifest),'MANIFEST_CONFLICT');await verifyPersisted(current,manifest,repo,actor);await onProgress?.({state:'published',manifestId:manifest.id,completed:preview.intents.length,total:preview.intents.length,created:0,updated:0,existing:preview.intents.length});return {created:0,updated:0,existing:preview.intents.length,conflicts:[],manifestId:manifest.id};}
 const stage=await isolated(preview.baselineSnapshot,()=>repo.timestamp());let cursor=0,created=0,updated=0,existing=0;
 const notify=state=>onProgress?.({state,manifestId:manifest.id,completed:created+updated+existing,total:preview.intents.length,created,updated,existing});
 async function write(kind,path,next){
  const intent=preview.intents[cursor++];requireThat(intent&&intent.kind===kind&&intent.path===path&&await datasetHash(intent.after)===await datasetHash(next),'INTENT_MISMATCH');
  const scope={scope:manifestEntryScope(path)},live=await repo.get(path),liveHash=await datasetHash(manifestEntryValue(live,scope));
  const later=preview.intents.slice(cursor-1).filter(i=>i.path===path);
  if((await Promise.all(later.map(i=>datasetHash(manifestEntryValue(i.after,scope))))).includes(liveHash)){existing++;await notify('writing');return next;}
  requireThat(liveHash===await datasetHash(manifestEntryValue(intent.before,scope)),'CONTENT_CONFLICT');
  if(kind==='create')await repo.create(path,next);
  else await repo.transact(path,row=>{
   requireThat(same(row,live),'CONCURRENT_CHANGE');
   // Domain transition is replayed with the actual server timestamp. Existing audits stay intact.
   const output={...row,...next};if(row?.createdAt!=null)output.createdAt=row.createdAt;
   if(row?.closedAt!=null)output.closedAt=row.closedAt;
   if(path.startsWith('reviews/')&&row?.history)output.history={...next.history,...clone(row.history)};
   return output;
  });
  if(kind==='create')created++;else updated++;await notify('writing');return next;
 }
 const forwarded={...stage,updateRegistry:async()=>{throw new Error('UNSUPPORTED_PUBLICATION_MUTATION');},create:async(path,row)=>{await write('create',path,row);return stage.create(path,row);},transact:async(path,update)=>{const next=update(await stage.get(path));requireThat(next!==undefined,'CONFLICT');await write('transact',path,next);return stage.transact(path,()=>next);}};
 await runPresentationCommands(preview.commands,{repo:forwarded,actor,clock:publicationClock(preview.manifest)});
 requireThat(cursor===preview.intents.length,'INTENT_COUNT_MISMATCH');
 const persisted=await preflight(preview,repo);await verifyPersisted(persisted,manifest,repo,actor);
 // This final publication marker is immutable; it contains no private snapshot or commands.
 await repo.create('presentationManifests/'+manifest.id,manifest);
 await notify('published');
 return {created,updated,existing,conflicts:[],manifestId:manifest.id};
}
export function createPresentationService({repo,actor}){return {prepare:options=>prepare({...options,repo,actor}),prepareRevision:options=>prepareRevision({...options,repo,actor}),publish:(preview,expectedHash,onProgress)=>publish({preview,expectedHash,repo,actor,onProgress}),async latest(){const rows=Object.values(await repo.get('presentationManifests')??{}).filter(row=>row.state==='published');return rows.sort((a,b)=>b.createdAt-a.createdAt||b.id.localeCompare(a.id))[0]??null;}};}


// Used only by the CLI with its independently authorized full backup. App callers
// never read the memberships parent. This also checks roots unknown to the app.
export async function assertPrivateBackupPreserved(original,current,preview){
 const privatePreview={...preview,baselineSnapshot:original};
 requireThat(await contentHash(outsidePackage(current,privatePreview))===await contentHash(prune(clone(original))),'PRIVATE_BACKUP_CHANGED');
}

// Read-only repair of an unpublished evaluation envelope. Replay only its original
// baseline; a partial live publication is never accepted as a replacement baseline.
export async function reprepareEvaluationPreview({envelope,repo,actor,currentFullBackup}){
 assertRole(actor,['admin']);
 requireThat(envelope.projectId==='msayellowteam'&&envelope.workspaceId==='msa'&&await contentHash(envelope.fullBackup)===envelope.fullBackupHash,'PRIVATE_BACKUP_INVALID');
 const original=envelope.preview,{previewHash,...body}=original;
 requireThat(same(actor,original.actor),'ACTOR_CHANGED');
 requireThat(await contentHash(body)===previewHash,'PREVIEW_HASH_MISMATCH');
 requireThat(await contentHash(original.baselineSnapshot)===original.backupHash,'BACKUP_HASH_MISMATCH');
 requireThat(original.format===1&&!original.conflicts.length&&original.manifest.version==='evaluation'&&original.manifest.id===original.manifest.packageId+'_rev_evaluation','INVALID_PREVIEW');
 requireThat(!await repo.get('presentationManifests/'+original.manifest.id),'MANIFEST_EXISTS');
 const originalRepo=await isolated(original.baselineSnapshot,()=>({'.sv':'timestamp'})),fullRepo=await isolated(envelope.fullBackup,()=>({'.sv':'timestamp'}));
 requireThat(await contentHash(await readPresentationSnapshot(fullRepo))===original.backupHash,'BACKUP_HASH_MISMATCH');
 const candidate=await prepareRevision({repo:originalRepo,actor,baseManifestId:original.manifest.baseManifestId,revision:'evaluation',commands:clone(original.commands)});
 requireThat(!candidate.conflicts.length&&same(candidate.intents,original.intents)&&candidate.backupHash===original.backupHash,'REPREPARE_CONTENT_CHANGED');
 const inherited=original.baselineSnapshot.presentationManifests[original.manifest.baseManifestId].entries;
 requireThat(same(original.manifest.entries.slice(0,inherited.length),inherited)&&same(candidate.manifest.entries.slice(0,inherited.length),inherited),'INHERITED_DIGEST_CHANGED');
 const withoutHashes=manifest=>({...manifest,entries:manifest.entries.map(({hash,...entry})=>entry)});
 requireThat(same(withoutHashes(candidate.manifest),withoutHashes(original.manifest)),'REPREPARE_CONTENT_CHANGED');
 for(let n=inherited.length;n<candidate.manifest.entries.length;n++)if(!candidate.manifest.entries[n].path.startsWith('reviews/'))requireThat(candidate.manifest.entries[n].hash===original.manifest.entries[n].hash,'REPREPARE_CONTENT_CHANGED');
 await assertPrivateBackupPreserved(envelope.fullBackup,currentFullBackup,candidate);
 await preflight(candidate,repo);
 return {...clone(envelope),preview:candidate};
}
