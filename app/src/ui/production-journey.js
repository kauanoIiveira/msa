import {productionChoices,compatibleRecipes,productionHelp} from './production-context-card.js';
import {selectProduction,changeRecordingProduction} from './production-selection.js';
import {escapeHtml as e} from './format.js';
import {saoPauloInstant} from './forms.js';
import {requireThat} from '../domain/errors.js';
import {shiftAt} from '../domain/shifts.js';
const options=(rows,value)=>rows.map(r=>`<option value="${e(r.id)}" ${r.id===value?'selected':''}>${e(r.name??r.label)}</option>`).join('');
export function createProductionJourney({state,services,showModal,modal,refresh,layout,openForm}){
 const canWrite=()=>['admin','engineer','operator'].includes(state.actor?.role);
 async function choose(){
  const client=state.client,result=await services().productions.list();requireThat(state.client===client,'STALE_SESSION');state.productionCases=result.items;
  showModal('Escolher produção',`<div class="form-grid"><label class="field">Máquina<select id="production-machine"><option value="">Todas as máquinas</option>${options(Object.values(state.registries.machines??{}))}</select></label><label class="field">Buscar produto, OP, lote ou turno<input id="production-search" type="search" placeholder="Buscar produção"></label></div><p class="small muted">A busca reduz somente esta lista. A consulta e os registros anteriores são preservados.</p><div id="production-choices">${productionChoices({cases:result.items,catalog:state.registries})}</div>${canWrite()?'<button type="button" class="btn" data-action="create-production">Cadastrar produção</button>':''}`,{wide:true});
  const update=()=>{modal.querySelector('#production-choices').innerHTML=productionChoices({cases:result.items,catalog:state.registries,search:modal.querySelector('#production-search').value,machineId:modal.querySelector('#production-machine').value});};
  modal.querySelector('#production-search').addEventListener('input',update);modal.querySelector('#production-machine').addEventListener('change',update);
 }
 async function select(id,decision){
  const row=state.productionCases.find(r=>r.id===id);requireThat(row,'NOT_FOUND');
  const result=changeRecordingProduction({selection:state.selection,nextCase:row,draft:state.draft,decision});
  if(result.requiresDecision){showModal('Rascunho em outra produção',`<p>O rascunho pertence à OP ${e(state.draft.context.order??'sem ordem')}. Escolha como continuar antes de trocar.</p><button type="button" class="btn" data-action="production-keep">Manter rascunho e contexto</button><button type="button" class="btn" data-action="production-new:${e(id)}">Iniciar novo registro nesta produção</button>`);return;}
  const client=state.client,context=await services().productions.context(id);requireThat(state.client===client,'STALE_SESSION');
  state.selection={...result.selection,recording:{productionCaseId:id,context:structuredClone(context)}};state.draft=result.draft;modal.close();await refresh();
 }
 function create(){
  if(state.draft){showModal('Rascunho preservado','<p>Conclua o rascunho antes de cadastrar outra produção.</p><button class="btn" type="button" data-action="resume-draft">Continuar rascunho</button>');return;}
  requireThat(canWrite(),'FORBIDDEN');const catalog=state.registries,active=kind=>Object.values(catalog[kind]??{}).filter(r=>r.active),c=state.selection.recording?.context??state.context;
  showModal('Cadastrar produção',`<p>Vincule os cadastros existentes para registrar uma nova produção.</p>${productionHelp}<div class="form-grid"><label class="field">Máquina<select name="machineId" required>${options(active('machines'),c.machineId)}</select></label><label class="field">Processo<select name="processId" required></select></label><label class="field">Produto<select name="productId" required></select></label><label class="field">Configuração de processo<select name="recipeVersionId"><option value="">Sem receita vinculada</option></select></label><label class="field">OP<input name="order" required maxlength="100"></label><label class="field">Lote<input name="lot" required maxlength="100"></label><label class="field">Variante<input name="variant" maxlength="100"></label><label class="field">Situação<select name="status"><option value="planned">Planejada</option><option value="running">Em produção</option><option value="closed">Encerrada</option></select></label><label class="field">Início · São Paulo<input name="startedAt" type="datetime-local" required></label><label class="field">Fim · São Paulo<input name="endedAt" type="datetime-local" required></label></div><p class="source-notes">Dia operacional e turno vêm do início. A janela deve caber no mesmo turno.</p>`,{wide:true,footer:'Cadastrar e selecionar',submit:async data=>{
   const startedAt=saoPauloInstant(data.get('startedAt'),'startedAt'),endedAt=saoPauloInstant(data.get('endedAt'),'endedAt'),shift=shiftAt(startedAt),payload=Object.fromEntries(['machineId','processId','productId','order','lot','status'].map(k=>[k,data.get(k)]));
   for(const k of ['variant','recipeVersionId'])if(data.get(k))payload[k]=data.get(k);
   const row=await services().productions.create({...payload,startedAt,endedAt,shift:shift.shift,operationalDate:shift.operationalDate});state.selection=selectProduction(state.selection,row);return row;
  }});
  const form=modal.querySelector('form'),control=key=>form.elements.namedItem(key);
  const recipes=()=>{control('recipeVersionId').innerHTML='<option value="">Sem receita vinculada</option>'+options(compatibleRecipes(catalog,{processId:control('processId').value,productId:control('productId').value}),c.recipe);};
  const products=()=>{control('productId').innerHTML=options(active('products').filter(p=>p.processIds?.[control('processId').value]),c.productId);recipes();};
  const processes=()=>{control('processId').innerHTML=options(active('processes').filter(p=>p.machineId===control('machineId').value),c.processId);products();};
  control('machineId').addEventListener('change',processes);control('processId').addEventListener('change',products);control('productId').addEventListener('change',recipes);processes();
 }
 return {choose,select,create,keep(){modal.close();openForm(state.draft.kind,state.draft.record,true);}};
}
