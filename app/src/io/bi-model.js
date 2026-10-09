import {shiftAt,normalizeShift} from '../domain/shifts.js';
import {effectiveRecords} from '../domain/indicators.js';
import {projectProductivity} from '../domain/workspace-metrics.js';
const keys=['machineId','processId','productId','variant','order','lot','recipe','shift','operationalDate'];
function scopeOf(row){const instant=row.occurredAt??row.startedAt;const time=Number.isSafeInteger(instant)?shiftAt(instant):{};return {...row.context,shift:normalizeShift(row.context?.shift)??row.context?.shift??time.shift,operationalDate:time.operationalDate??row.operationalDate??null};}
export function biScopeId(scope){return JSON.stringify(keys.map(k=>scope[k]??null));}
const same=(row,scope)=>biScopeId(scopeOf(row))===biScopeId(scope);
export function calculateScrap({production=[],losses=[],scope,coverage}){
 const rows=production.filter(r=>same(r,scope)&&r.basis==='gross'),rejects=losses.filter(r=>same(r,scope)&&r.kind==='reject'&&r.unit==='pieces');
 const grossPieces=rows.length?rows.reduce((n,r)=>n+r.quantity,0):null,rejectedPieces=coverage===true?rejects.reduce((n,r)=>n+r.amount,0):null;
 const state=coverage!==true?'incomplete-coverage':!scope.operationalDate?'time-required':rows.some(r=>r.revisionConflict)||rejects.some(r=>r.revisionConflict)?'revision-conflict':!rows.length?'production-required':rows.some(r=>r.confirmed!==true)?'confirmation-required':!(grossPieces>0)?'zero-denominator':rejectedPieces>grossPieces?'inconsistent-quantities':'complete';
 return {rejectedPieces,grossPieces,pct:state==='complete'?100*rejectedPieces/grossPieces:null,state,scopeId:biScopeId(scope)};
}
export function buildBiFacts(view){
 const period=view.period??view,registries=view.registries??{},diagnostics=[...(period.notes??[])],facts={collections:[],production:[],losses:[],stoppages:[],indicators:[],diagnostics};
 const effective={},original={};
 for(const kind of ['collections','production','losses','stoppages']){
  original[kind]=new Map((period.originalRecords?.[kind]??period[kind]??[]).map(r=>[r.id,r]));
  const rows=period[kind]??[];effective[kind]=effectiveRecords(kind,rows,period.corrections??[]).items;
  const unique=new Map();for(const row of effective[kind]){if(unique.has(row.id)){if(JSON.stringify(unique.get(row.id))!==JSON.stringify(row))throw new Error('IDs BI duplicados com conteúdo divergente.');}else unique.set(row.id,row);}effective[kind]=[...unique.values()];
 }
 const segments=period.plans?.length?projectProductivity({...view,period:{...period,effective}}).segments:[];
 const confirmed=new Set(segments.filter(s=>s.state==='final').flatMap(s=>s.recordIds));
 effective.production=effective.production.map(r=>({...r,confirmed:confirmed.has(r.id)||r.confirmed===true}));
 const scopes=new Map();for(const kind of ['collections','production','losses'])for(const row of effective[kind]){const scope=scopeOf(row);scopes.set(biScopeId(scope),scope);}
 const coverage=period.complete===true&&period.nhplComplete!==false&&['production','losses','corrections'].every(k=>period.coverage?.[k]===true);
 const summaries=new Map();for(const [id,scope] of scopes){const relevant=[...effective.production,...effective.losses].filter(r=>same(r,scope));const allocated=relevant.every(r=>!(r.queryDiagnostics??[]).length&&(!r.endedAt||(Number.isSafeInteger(r.startedAt)&&r.endedAt<=shiftAt(r.startedAt).to)));const summary=calculateScrap({production:effective.production,losses:effective.losses,scope,coverage:coverage&&allocated});summaries.set(id,summary);facts.indicators.push({...scope,...summary,scrapPercent:summary.pct,coverageComplete:coverage&&allocated});if(summary.state!=='complete')diagnostics.push(id+':'+summary.state);}
 for(const kind of ['collections','production','losses','stoppages'])for(const row of effective[kind]){
  const source=original[kind].get(row.id)??row,scope=scopeOf(row),scopeId=biScopeId(scope),recipe=registries.recipeVersions?.[scope.recipe],summary=summaries.get(scopeId);
  const out={id:row.id,originalId:row.originalId??row.id,correctionId:row.correctionId??null,revisionConflict:row.revisionConflict===true,...scope,scopeId,occurredAt:row.occurredAt??null,eventDate:row.eventDate??null,timePrecision:row.timePrecision??null,origin:row.origin??null,source:row.source??null,createdBy:row.createdBy??null,createdAt:row.createdAt??null,queryDiagnostics:row.queryDiagnostics??[],originalRecord:source,effectiveRecord:row};
  for(const key of ['quantity','basis','amount','unit','kind','reasonId','startedAt','endedAt','planned','intervalId','planRevisionId','confirmed'])if(key in row)out[key]=row[key];
  if(kind==='production')out.originalQuantity=source.quantity;
  if(kind==='losses')out.originalAmount=source.amount;
  if(kind==='collections'){
   Object.assign(out,{recipeVersionId:recipe?.id??scope.recipe??null,material:recipe?.settings?.material??null,thickness:recipe?.settings?.thickness??null,recipeSettings:recipe?.settings??null,scrapPercent:summary?.pct??null,scrapState:summary?.state??'time-required',grossPieces:summary?.grossPieces??null,rejectedPieces:summary?.rejectedPieces??null});
   for(const [id,r] of Object.entries(row.readings??{})){const version=period.parameterVersions?.[r.versionId]??registries.parameterVersions?.[r.versionId];Object.assign(out,{[id+'.value']:r.value??null,[id+'.originalValue']:source.readings?.[id]?.value??null,[id+'.raw']:r.raw??null,[id+'.unit']:version?.unit??null,[id+'.versionId']:r.versionId??null,[id+'.status']:r.status??null});}
  }
  facts[kind].push(out);
 }
 return facts;
}
