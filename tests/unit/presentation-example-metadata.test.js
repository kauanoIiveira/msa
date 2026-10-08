import {buildIndicators} from '../../app/src/domain/indicators.js';
import {productionCaseContext} from '../../app/src/domain/production-case.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {presentationExampleIdentity} from '../../app/src/presentation/example-identity.js';
import {presentationRecipeSettings} from '../../app/src/presentation/parameter-map.js';
import {buildPresentationDataset,previewPresentationDataset} from '../../app/src/presentation/dataset-builder.js';
import {createSnapshotRepository} from '../../app/src/presentation/snapshot-repository.js';
import {prepare,publish} from '../../app/src/services/presentation-dataset.js';
const packageId='presentation_20261008_v1',actor={uid:'admin',role:'admin'};
test('readable examples use stable date, version and product codes without changing namespace IDs',()=>{
 assert.deepEqual(presentationExampleIdentity(packageId,'vgard'),{context:{order:'OP-HP-261008-V1',lot:'LT-HP-261008-V1',variant:'Medium'},productLabel:'VGARD HP',recipeLabel:'VGARD HP · Configuração v1'});
 assert.equal(presentationExampleIdentity(packageId,'mark').context.order,'OP-MV-261008-V1');
 assert.equal(presentationExampleIdentity(packageId,'selo').context.lot,'LT-SL-261008-V1');
 assert.equal(presentationExampleIdentity('presentation_20261009_v2','vgard').context.order,'OP-HP-261009-V2');
 assert.throws(()=>presentationExampleIdentity(packageId,'unknown'));
 const dataset=buildPresentationDataset({anchorOperationalDate:'2026-10-08',version:'v1'});assert.equal(dataset.commands.find(c=>c.id.endsWith('_case_d0_s1_p0')).id,packageId+'_case_d0_s1_p0');
});
test('recipe settings are nominal examples from each own map, retain zero and exclude T20 measured or unresolved fields',()=>{
 const nhpl=presentationRecipeSettings(packageId,'nhpl');assert.deepEqual(nhpl,{NHPL_ASSEMBLY_CYCLE:42,NHPL_INSPECTION_FORCE:120,NHPL_ALIGNMENT_OFFSET:0});
 const t20=presentationRecipeSettings(packageId,'t20');assert.equal(t20.MSA_BB,80);assert.equal(t20.MSA_BN,1.5);assert.equal(t20.MSA_AZ,19.5);
 for(const code of ['MSA_F','MSA_AX','MSA_CF','MSA_CH','MSA_H','MSA_BH'])assert.equal(code in t20,false);
 assert.ok(Object.values(t20).every(v=>Number.isFinite(v)&&v>0));
});
test('full package inherits readable context, variant and settings through replay with 42 projected windows',async()=>{
 const dataset=buildPresentationDataset({anchorOperationalDate:'2026-10-08',version:'v1'}),result=await previewPresentationDataset(dataset,{actor});
 assert.equal(result.ok,true,JSON.stringify(result.diagnostics));assert.equal(Object.keys(result.metricsByContext).length,42);
 const selection=result.manifest.defaultSelection;assert.equal(selection.recording.context.variant,'Medium');assert.equal(selection.recording.context.order,'OP-MV-261008-V1');
 const recipe=result.snapshot.recipeVersions[selection.recording.context.recipe];assert.equal(recipe.label,'MARK V · Configuração v1');assert.equal(recipe.settings.NHPL_ALIGNMENT_OFFSET,0);assert.equal(recipe.status,'draft');
 for(const row of Object.values(result.snapshot.productionCases).filter(r=>r.machineId==='nhpl'))assert.equal(row.variant,'Medium');
 const replay=await previewPresentationDataset({...dataset,manifest:result.manifest},{actor,existingSnapshot:result.snapshot});assert.equal(replay.ok,true,JSON.stringify(replay.diagnostics));assert.equal(replay.added,0);
});
test('progress counts only acknowledged or verified intents and completion follows the persisted manifest',async()=>{
 const repo=createSnapshotRepository(),preview=await prepare({repo,actor,anchorDate:'2026-10-08',version:'v1'}),events=[];let writes=0;
 const fail={...repo,create:async(path,row)=>{if(++writes===3)throw new Error('INTERRUPTED');return repo.create(path,row);}};
 await assert.rejects(()=>publish({preview,expectedHash:preview.previewHash,repo:fail,actor,onProgress:progress=>events.push(progress)}),/INTERRUPTED/);
 assert.equal(events.at(-1).completed,2);assert.equal(events.some(e=>e.state==='published'),false);assert.ok(events.every(e=>!('path' in e)&&!('actor' in e)&&!('record' in e)));
 const resumed=[];await publish({preview,expectedHash:preview.previewHash,repo,actor,onProgress:async progress=>{resumed.push(progress);if(progress.state==='published')assert.ok(await repo.get('presentationManifests/'+preview.manifest.id));}});
 assert.equal(resumed.at(-1).state,'published');assert.equal(resumed.at(-1).completed,preview.intents.length);assert.equal(resumed.at(-1).existing,2);
});


test('T20 scrap uses its own full case denominator for all 30 collections with 41 readings',async()=>{
 const result=await previewPresentationDataset(buildPresentationDataset({anchorOperationalDate:'2026-10-08',version:'v1'}),{actor});
 assert.equal(result.ok,true,JSON.stringify(result.diagnostics));const snapshot=result.snapshot,productionCase=snapshot.productionCases[packageId+'_case_selo_1'],context=productionCaseContext(productionCase);
 const production=Object.values(snapshot.production??{}).filter(r=>r.context.machineId===context.machineId),losses=Object.values(snapshot.losses).filter(r=>r.context.machineId===context.machineId),collections=Object.values(snapshot.collections).filter(r=>r.context.machineId===context.machineId);
 assert.equal(production.length,2);assert.equal(losses.length,1);assert.equal(collections.length,30);assert.ok(collections.every(r=>Object.keys(r.readings).length===41));
 for(const row of [...production,...losses,...collections]){assert.deepEqual(row.context,context);assert.equal(row.origin,'demo');assert.equal(row.createdBy,actor.uid);}
 const range={from:productionCase.startedAt,to:productionCase.endedAt,complete:true},indicator=buildIndicators({production,losses,collections,parameterVersions:snapshot.parameterVersions},range);
 assert.equal(indicator.totals.grossPieces,100);assert.equal(indicator.totals.goodPieces,95);assert.equal(indicator.totals.rejectedPieces,5);assert.equal(indicator.totals.rejectPercent,5);
 assert.equal(buildIndicators({production:[],losses},range).totals.rejectPercent,null);
 assert.equal(buildIndicators({production:production.map(r=>({...r,context:{...r.context,lot:'OTHER'}})),losses},range).totals.rejectPercent,null);
});
