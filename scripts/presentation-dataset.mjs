// Authenticated client publication only. Firebase CLI is used strictly for private read-only backups.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,relative,isAbsolute,join} from 'node:path';
import {spawn} from 'node:child_process';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,signInWithEmailAndPassword,signOut} from 'firebase/auth';
import * as sdk from 'firebase/database';
import {firebaseConfig} from '../app/src/config/firebase.js';
import {loginAccounts} from '../app/src/config/login-accounts.js';
import {resolveLoginEmail} from '../app/src/services/auth.js';
import {createFirebaseRepository} from '../app/src/repositories/firebase-repository.js';
import {prepare,publish,assertPrivateBackupPreserved} from '../app/src/services/presentation-dataset.js';
import {datasetHash,manifestEntryValue} from '../app/src/presentation/dataset-hash.js';
import {stableStringify} from '../app/src/domain/canonical.js';
import {shiftAt} from '../app/src/domain/shifts.js';
const args=process.argv.slice(2),flags=new Map();
for(let n=0;n<args.length;n++){const flag=args[n];if(['--apply','--dry-run','--help'].includes(flag))flags.set(flag,true);else if(['--preview','--anchor-date','--version','--backup','--evidence'].includes(flag)&&args[n+1]&&!args[n+1].startsWith('--'))flags.set(flag,args[++n]);else throw new Error('INVALID_ARGUMENT');}
if(flags.has('--help')){console.log('Default: --dry-run --preview <private file>. Apply: --apply --preview <same private file>. Optional: --backup <private JSON> --anchor-date YYYY-MM-DD --version v1 --evidence <sanitized report>. Credentials only in MSA_TEST_RE and MSA_TEST_PASSWORD. Scope fixed: msayellowteam/workspaces/msa.');process.exit(0);}
if(flags.has('--apply')&&flags.has('--dry-run'))throw new Error('AMBIGUOUS_MODE');
if(firebaseConfig.projectId!=='msayellowteam'||firebaseConfig.databaseURL!=='https://msayellowteam-default-rtdb.firebaseio.com')throw new Error('WRONG_PROJECT');
const privateRoot=resolve(process.env.USERPROFILE??process.env.HOME,'.codex/private/msa-jornada-coesa');
function privatePath(value){const path=resolve(value),rel=relative(privateRoot,path);if(!rel||rel.startsWith('..')||isAbsolute(rel))throw new Error('PRIVATE_PATH_REQUIRED');return path;}
const previewPath=privatePath(flags.get('--preview')??join(privateRoot,'publication-preview.json'));
const hash=value=>datasetHash(stableStringify(value));
async function backup(label){const file=join(privateRoot,`${label}-${Date.now()}.json`);await mkdir(privateRoot,{recursive:true});await new Promise((ok,fail)=>{const child=spawn(process.execPath,['node_modules/firebase-tools/lib/bin/firebase.js','database:get','/workspaces/msa','--project','msayellowteam','--output',file],{stdio:'ignore'});child.on('error',()=>fail(new Error('PRIVATE_BACKUP_FAILED')));child.on('exit',code=>code===0?ok():fail(new Error('PRIVATE_BACKUP_FAILED')));});return {file,snapshot:JSON.parse(await readFile(file,'utf8'))};}
async function session(name){const app=initializeApp(firebaseConfig,name),auth=getAuth(app);try{const credential=await signInWithEmailAndPassword(auth,resolveLoginEmail(process.env.MSA_TEST_RE,loginAccounts),process.env.MSA_TEST_PASSWORD??'');const repo=createFirebaseRepository({db:sdk.getDatabase(app),sdk,workspaceId:'msa'}),member=await repo.get('members/'+credential.user.uid);if(member?.role!=='admin')throw new Error('ADMIN_SESSION_REQUIRED');return {app,auth,repo,actor:{uid:credential.user.uid,role:member.role}};}catch{await deleteApp(app);throw new Error('AUTHORIZED_SESSION_REQUIRED');}}
const sessions=[];
try{
 if(!process.env.MSA_TEST_RE||!process.env.MSA_TEST_PASSWORD)throw new Error('AUTHORIZED_SESSION_REQUIRED');
 const active=await session('msa-publication-'+Date.now());sessions.push(active);
 let evidence;
 if(!flags.has('--apply')){
  const full=flags.has('--backup')?{file:privatePath(flags.get('--backup')),snapshot:JSON.parse(await readFile(privatePath(flags.get('--backup')),'utf8'))}:await backup('before');
  const preview=await prepare({repo:active.repo,actor:active.actor,anchorDate:flags.get('--anchor-date')??shiftAt(Date.now()).operationalDate,version:flags.get('--version')??'v1'});
  await assertPrivateBackupPreserved(full.snapshot,await backup('preflight').then(r=>r.snapshot),preview);
  const envelope={projectId:'msayellowteam',workspaceId:'msa',preview,fullBackup:full.snapshot,fullBackupHash:await hash(full.snapshot)};
  await mkdir(dirname(previewPath),{recursive:true});await writeFile(previewPath,JSON.stringify(envelope));
  evidence={status:'prepared-cloud-not-published',manifestId:preview.manifest.id,commands:preview.commands.length,entries:preview.manifest.entries.length,conflicts:preview.conflicts.map(c=>({code:c.code,commandId:c.commandId})),previewHash:preview.previewHash,backupHash:preview.backupHash,fullBackupHash:envelope.fullBackupHash};
 }else{
  if(!flags.has('--preview'))throw new Error('PREVIEW_REQUIRED');
  const envelope=JSON.parse(await readFile(previewPath,'utf8'));
  if(envelope.projectId!=='msayellowteam'||envelope.workspaceId!=='msa'||await hash(envelope.fullBackup)!==envelope.fullBackupHash)throw new Error('PRIVATE_BACKUP_INVALID');
  const {preview,fullBackup}=envelope,before=await backup('before-apply');await assertPrivateBackupPreserved(fullBackup,before.snapshot,preview);
  const result=await publish({preview,expectedHash:preview.previewHash,repo:active.repo,actor:active.actor});
  const after=await backup('after-apply');await assertPrivateBackupPreserved(fullBackup,after.snapshot,preview);
  const second=await session('msa-verification-'+Date.now());sessions.push(second);
  const manifest=await second.repo.get('presentationManifests/'+result.manifestId);
  if(manifest?.state!=='published')throw new Error('SECOND_SESSION_VERIFICATION_FAILED');
  for(const entry of manifest.entries)if(await datasetHash(manifestEntryValue(await second.repo.get(entry.path),entry))!==entry.hash)throw new Error('SECOND_SESSION_VERIFICATION_FAILED');
  const repeat=await publish({preview,expectedHash:preview.previewHash,repo:active.repo,actor:active.actor});
  evidence={status:'published-and-reloaded',manifestId:result.manifestId,created:result.created,updated:result.updated,existing:result.existing,repeatCreated:repeat.created,verifiedEntries:manifest.entries.length,previewHash:preview.previewHash,entriesHash:manifest.entriesHash,membersPreserved:true,outsidePackagePreserved:true,secondAuthenticatedSession:true,distinctUsers:false};
 }
 if(flags.has('--evidence')){const path=resolve(flags.get('--evidence'));await mkdir(dirname(path),{recursive:true});await writeFile(path,JSON.stringify(evidence,null,2)+'\n');}
 console.log(JSON.stringify(evidence));
}catch(error){console.error(JSON.stringify({status:'blocked',code:error.code??(/^[A-Z_]+$/.test(error.message)?error.message:'PUBLICATION_FAILED'),cloudProof:'pending-unless-published-report-exists'}));process.exitCode=1;}
finally{for(const session of sessions){await signOut(session.auth);await deleteApp(session.app);}}
