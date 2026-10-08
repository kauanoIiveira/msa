import {test} from 'node:test';
import assert from 'node:assert/strict';
import {memoryRepository} from '../helpers/memory-repository.js';
import {createAuthenticatedMsa} from '../../app/src/services/create-msa.js';
import {openWorkspaceClient,connectionState} from '../../app/src/ui/workspace-client.js';
import {archiveLocalWorkspace} from '../../app/src/ui/local-archive.js';
function authBoundary(uid){let listener;return {watchSession(callback){listener=callback;callback({uid});return()=>{};},logout(){listener(null);}};}
test('workspace exposes the persisted package and backs up coverage/manifests without membership',async()=>{
 const repo=memoryRepository();await repo.create('coverageWitnesses/w',{id:'w'});await repo.create('presentationManifests/m',{id:'m',packageId:'prepared',state:'published'});
 const manifest=await repo.get('presentationManifests/m'),client=await openWorkspaceClient({session:{},repository:repo,services:{},manifest});assert.equal(client.packageId,'prepared');assert.deepEqual(client.manifest,manifest);
 const backup=JSON.parse(await client.exportBackup());assert.ok(backup.values.coverageWitnesses.w);assert.ok(backup.values.presentationManifests.m);assert.equal('members' in backup.values,false);
});
test('two authenticated clients consult the same repository instead of creating a local dataset',async()=>{
 const repo=memoryRepository();await repo.create('members/admin',{role:'admin'});await repo.create('members/second',{role:'admin'});
 const a=authBoundary('admin'),b=authBoundary('second');
 const sa=createAuthenticatedMsa({authService:a,repositoryFactory:()=>repo}),sb=createAuthenticatedMsa({authService:b,repositoryFactory:()=>repo});
 const first=await openWorkspaceClient({session:sa,workspaceId:'msa',actor:{uid:'admin',role:'admin'},repository:repo});
 const second=await openWorkspaceClient({session:sb,workspaceId:'msa',actor:{uid:'second',role:'admin'},repository:repo});
 const machine=await first.services.registry.create('machines',{name:'Máquina compartilhada'});
 assert.equal((await second.repo.get('machines/'+machine.id)).name,'Máquina compartilhada');assert.equal(first.mode,'workspace');assert.equal(first.defaultSelection,null);
 a.logout();await assert.rejects(first.services.registry.create('machines',{name:'Negada'}),{code:'STALE_SESSION'});
 await assert.rejects(first.repo.get('machines'),{code:'STALE_SESSION'});sa.dispose();sb.dispose();
});
test('network failure rejects opening and never creates fallback records',async()=>{
 const repo=memoryRepository(),session={onWorkspace:async()=>{const error=new Error('offline');error.code='NETWORK';throw error;}};
 await assert.rejects(openWorkspaceClient({session,workspaceId:'msa',repository:repo}),{code:'NETWORK'});assert.equal(await repo.get('machines'),null);
 assert.equal(connectionState({authenticated:true,authorized:true,connected:false,pending:true}),'offline');
 assert.equal(connectionState({authenticated:true,authorized:true,connected:true,pending:true}),'pending');
 assert.equal(connectionState({authenticated:true,authorized:true,connected:true,pending:false}),'ready');
 assert.equal(connectionState({authenticated:true,authorized:false,connected:true}),'forbidden');
});
test('local archive preserves exact MSA values and excludes Firebase authentication tokens',async()=>{
 const values=new Map([['msa.nhpl.presentation.v3','{"overlappingPlans":true}'],['msa.live.backup','{"original":1}'],['firebase:authUser:private','secret']]);
 const storage={get length(){return values.size;},key:i=>[...values.keys()][i],getItem:k=>values.get(k)??null};
 const first=await archiveLocalWorkspace({storage,uid:'admin'}),second=await archiveLocalWorkspace({storage,uid:'admin'});
 assert.equal(first.backup.values['msa.nhpl.presentation.v3'],'{"overlappingPlans":true}');assert.deepEqual(first.keys,['msa.live.backup','msa.nhpl.presentation.v3']);
 assert.equal(first.hash,second.hash);assert.equal(first.hash.length,64);assert.equal('firebase:authUser:private' in first.backup.values,false);assert.equal(values.size,3);
});
