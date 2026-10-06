import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {memoryRepository} from '../tests/helpers/memory-repository.js';
import {populatePresentationScenario,scenarioRoots} from './lib/presentation-scenario.mjs';
import Papa from 'papaparse';
const project='msayellowteam',uid='y7tzXaM7jCaGjheMR7EMmSzPseB3',path='/workspaces/msa';
function cli(args){const result=spawnSync(process.execPath,['node_modules/firebase-tools/lib/bin/firebase.js',...args,'--project',project,'--json'],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr||result.stdout);return result.stdout;}
async function snapshot(label){const file=`output/scenario/${label}.json`;cli(['database:get',path,'--output',file]);return JSON.parse(await readFile(file,'utf8'));}
const repo=memoryRepository();repo.timestamp=()=>Date.now();
await populatePresentationScenario({repo,actor:{uid,role:'admin'},papa:Papa});
const patch={},counts={};
for(const root of scenarioRoots){const records=await repo.get(root)??{};counts[root]=Object.keys(records).length;for(const [id,record] of Object.entries(records))patch[`${root}/${id}`]=record;}
await mkdir('output/scenario',{recursive:true});
await writeFile('output/scenario/msa-c26.json',JSON.stringify(patch,null,2));
console.log(JSON.stringify({counts,file:'output/scenario/msa-c26.json'}));
if(process.argv.includes('--apply')){
 const current=await snapshot('before');for(const root of scenarioRoots)if(Object.keys(current?.[root]??{}).length)throw Error(`Workspace contains ${root}; refusing to overwrite.`);
 if(current?.members?.[uid]?.role!=='admin')throw Error('Trusted membership missing');
 console.log(cli(['database:update',path,'output/scenario/msa-c26.json','--force']));
 const after=await snapshot('after');for(const root of scenarioRoots)if(Object.keys(after?.[root]??{}).length!==counts[root])throw Error(`Verification failed: ${root}`);
 console.log('Firebase scenario counts verified. Existing membership preserved.');
}
