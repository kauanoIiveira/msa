import {escapeRecordText as e} from './format.js';
import {parseReading} from '../domain/numbers.js';
import {saoPauloInstant} from './forms.js';
import {requireThat} from '../domain/errors.js';
export function openCsvImport({showModal,services,registries,context}) {
  let preview=null;
  const parameterMap=Object.create(null),ambiguous=new Set();
  for(const p of Object.values(registries.parameters??{}).filter(p=>p.active&&p.processId===context.processId)) {
    const versions=Object.values(registries.parameterVersions??{}).filter(v=>v.parameterId===p.id).sort((a,b)=>b.createdAt-a.createdAt);
    const v=versions.find(v=>v.status==='approved')??versions[0];if(!v)continue;
    for(const name of [p.name,p.code,p.id].filter(Boolean)){
      if(parameterMap[name]&&parameterMap[name].parameterId!==p.id)ambiguous.add(name);
      parameterMap[name]={parameterId:p.id,versionId:v.id,unit:v.unit};
    }
  }
  for(const name of ambiguous)delete parameterMap[name];
  showModal('Importar coletas CSV',`<p class="source-notes">Formato: date;parameter;raw;unit. Data YYYY-MM-DD; parâmetro pelo nome, código ou ID deste processo. A prévia não grava. Datas sem horário permanecem sem horário.</p><div class="form-grid"><label class="field full">Arquivo CSV<input id="csv-file" type="file" accept=".csv,text/csv"></label><label class="field full">Nome da fonte<input name="sourceFile" value="coletas.csv" required maxlength="200"></label><label class="field full">Conteúdo<textarea name="csvText" rows="8" required maxlength="5000000" placeholder="date;parameter;raw;unit"></textarea></label></div><div id="csv-preview"></div>`,{wide:true,footer:'Conferir importação',submit:async data=>{
    if(preview){requireThat(data.get('confirmed')==='on','CONFIRMATION_REQUIRED');const result=await services.csv.confirmImport(preview,{confirmed:true});return {successMessage:`${result.created} coleta(s) importada(s); ${result.existing} já existente(s).`};}
    const next=await services.csv.previewImport(data.get('csvText'),{source:{file:data.get('sourceFile')},context,parameterMap});
    const box=document.querySelector('#csv-preview');
    box.innerHTML=`<h3>Prévia: ${next.records.length} linha(s)</h3><p>${next.errors.length} erro(s) · ${next.warnings.length} aviso(s)</p><p class="source-notes">Contexto: ${e(JSON.stringify(context))}. Origem: importação. A versão de cada linha fica preservada.</p><div class="table-wrap"><table class="data-table"><thead><tr><th>Linha / data</th><th>Parâmetro / versão</th><th>Original</th></tr></thead><tbody>${next.records.map(({payload})=>`<tr><td>${e(payload.source.row)} · ${e(payload.eventDate)}</td><td>${e(registries.parameters?.[payload.readings[0].parameterId]?.name)} · ${e(payload.readings[0].versionId)}</td><td>${e(payload.readings[0].raw)}</td></tr>`).join('')}</tbody></table></div><p>${[...next.errors,...next.warnings].map(x=>`Linha ${e(x.row)}: ${e(x.code)} ${e(x.field??'')}`).join('<br>')}</p>${ambiguous.size?'<p class="source-notes">Nomes/códigos repetidos exigem o ID único do parâmetro no CSV.</p>':''}`;
    if(!next.errors.length&&next.records.length){preview=next;box.innerHTML+='<label class="check-line"><input name="confirmed" type="checkbox" required>Conferi a fonte, o contexto e as linhas. Confirmar gravação.</label>';document.querySelector('#modal [type=submit]').textContent='Confirmar importação';document.querySelector('#modal [name=csvText]').readOnly=true;document.querySelector('#modal [name=sourceFile]').readOnly=true;document.querySelector('#csv-file').disabled=true;}
    return {keepOpen:true};
  }});
}
export function openCorrection({showModal,services,registries,kind,record}) {
  const input=(name,label,value,type='text',required=true)=>`<label class="field"><span>${e(label)}</span><input name="${e(name)}" type="${type}" value="${e(value)}" ${type==='datetime-local'?'step="1"':''} ${required?'required':''}></label>`;
  const local=value=>new Date(value-3*3600000).toISOString().slice(0,19);
  let fields='';
  if(kind==='production')fields=input('quantity','Quantidade corrigida (peças)',record.quantity)+input('startedAt','Início',local(record.startedAt),'datetime-local')+input('endedAt','Fim',local(record.endedAt),'datetime-local');
  if(kind==='losses')fields=input('amount',`Quantidade corrigida (${record.unit})`,record.amount);
  if(kind==='stoppages'){requireThat(record.endedAt!=null,'OPEN_STOPPAGE');fields=input('startedAt','Início',local(record.startedAt),'datetime-local')+input('endedAt','Fim',local(record.endedAt),'datetime-local');}
  if(['losses','stoppages'].includes(kind))fields+=`<label class="field">Motivo do registro<select name="reasonId" required>${Object.values(registries.reasons??{}).filter(r=>r.kind===(kind==='stoppages'?'stop':record.kind)).map(r=>`<option value="${e(r.id)}" ${r.id===record.reasonId?'selected':''}>${e(r.name)}</option>`).join('')}</select></label>`;
  if(kind==='collections')fields=Object.entries(record.readings).map(([id,r])=>input('raw_'+id,registries.parameters?.[id]?.name??id,r.raw??'','text',false)).join('');
  showModal('Propor correção',`<p class="source-notes">O original será preservado. Contexto, versão, unidade e origem permanecem. Outra pessoa da Engenharia/admin precisa decidir.</p><div class="form-grid">${fields}<label class="field full">Justificativa<textarea name="reason" rows="3" maxlength="2000" required></textarea></label></div>`,{wide:kind==='collections',footer:'Enviar proposta',submit:data=>{
    const replacement=structuredClone(record),number=key=>{const parsed=parseReading(data.get(key));requireThat(parsed.status==='valid','INVALID_QUANTITY',key);return parsed.value;};
    if(kind==='production')replacement.quantity=number('quantity');
    if(kind==='losses')replacement.amount=number('amount');
    if(['production','stoppages'].includes(kind)){replacement.startedAt=saoPauloInstant(data.get('startedAt'),'startedAt');replacement.endedAt=saoPauloInstant(data.get('endedAt'),'endedAt');}
    if(['losses','stoppages'].includes(kind))replacement.reasonId=data.get('reasonId');
    if(kind==='collections')for(const[id,r]of Object.entries(replacement.readings)){const raw=data.get('raw_'+id);replacement.readings[id]={parameterId:r.parameterId,versionId:r.versionId,...parseReading(raw)};}
    return services.analysis.requestCorrection({recordType:kind,recordId:record.id,...(record.intervalId?{intervalId:record.intervalId}:{}),replacement,reason:data.get('reason')});
  }});
}
