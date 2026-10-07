import {parseReading} from '../domain/numbers.js';
import {MsaError,requireThat} from '../domain/errors.js';
import {eventDate,validateDate} from '../domain/time.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const rows=(registries,kind)=>Array.isArray(registries?.[kind])?registries[kind]:Object.values(registries?.[kind]??{});
const active=(registries,kind)=>rows(registries,kind).filter(row=>row.active===true);
const parameters=(registries,context)=>active(registries,'parameters').filter(row=>row.processId===context?.processId);
const metricUnits={producedPieces:'pieces',stopMinutes:'minutes',rejectedPieces:'pieces',lossKg:'kg'};
const kindLabels={stop:'Parada',reject:'Refugo',material:'Perda de material',rework:'Retrabalho'};
const field=(label,control,full=false)=>`<label class="field${full?' full':''}"><span>${escape(label)}</span>${control}</label>`;
const input=(name,value='',{type='text',required=true,maxLength,inputMode}={})=>`<input type="${escape(type)}" name="${escape(name)}" value="${escape(value)}"${type==='datetime-local'?' step="1"':''}${required?' required':''}${maxLength?` maxlength="${maxLength}"`:''}${inputMode?` inputmode="${escape(inputMode)}"`:''}>`;
const option=(value,label,selected)=>`<option value="${escape(value)}"${selected?' selected':''}>${escape(label)}</option>`;
const select=(name,choices,value='',{placeholder=true,required=true}={})=>`<select name="${escape(name)}"${required?' required':''}>${placeholder?option('','Selecione',value===''):''}${choices.map(([id,label])=>option(id,label,id===value)).join('')}</select>`;
const registrySelect=(name,kind,registries,value)=>select(name,active(registries,kind).map(row=>[row.id,row.name]),value);
const localDateTime=value=>{
  const instant=typeof value==='number'?value:Date.now();return new Date(instant-3*3600000).toISOString().slice(0,19);
};
const ruleLabel=rule=>rule?.kind==='range'?`${rule.lower} a ${rule.upper}`:rule?.kind==='lower'?`Mínimo ${rule.lower}`:rule?.kind==='upper'?`Máximo ${rule.upper}`:'Limite pendente';
const versionLabel=version=>`${version.status==='approved'?'Aprovado':'Rascunho'} · ${version.nature==='setpoint'?'Setpoint':'Medição'} · ${ruleLabel(version.rule)} ${version.unit??''}`;
const orderedVersions=(registries,id)=>rows(registries,'parameterVersions').filter(version=>version.parameterId===id).sort((a,b)=>(Number(b.createdAt)||0)-(Number(a.createdAt)||0)||String(b.id).localeCompare(String(a.id)));

export function formMarkup(kind,{registries={},context={},record={},catalog=[]}={}) {
  let content='';
  if(kind==='collection') {
    content=`<div class="parameter-input-list full">${parameters(registries,context).map(parameter=>{
      const versions=orderedVersions(registries,parameter.id),current=versions.find(version=>version.status==='approved')??versions.find(version=>version.status==='draft');
      return `<div class="parameter-input-row"><div><strong>${escape(parameter.name)}</strong><span>${escape(current?.unit??'')}</span></div>${field('Leitura',input(`raw_${parameter.id}`,record.readings?.[parameter.id]?.raw??'',{required:false,inputMode:'decimal'}))}${field('Versão',select(`version_${parameter.id}`,versions.map(version=>[version.id,versionLabel(version)]),current?.id??''))}</div>`;
    }).join('')}</div>`;
  } else if(kind==='production') {
    content=field('Quantidade (peças)',input('quantity',record.quantity??'',{inputMode:'numeric'}))+field('Base',select('basis',[['gross','Produção bruta'],['good','Peças boas']],record.basis??'gross',{placeholder:false}))+field('Início',input('startedAt',localDateTime(record.startedAt),{type:'datetime-local'}))+field('Fim',input('endedAt',localDateTime(record.endedAt),{type:'datetime-local'}));
  } else if(kind==='loss') {
    const lossKind=record.kind??'reject',reason=active(registries,'reasons').find(row=>row.id===record.reasonId&&row.kind===lossKind)??active(registries,'reasons').find(row=>row.kind===lossKind);
    content=field('Tipo',select('kind',['reject','material','rework'].map(value=>[value,kindLabels[value]]),lossKind,{placeholder:false}))+field('Unidade',select('unit',[['pieces','Peças'],['kg','Quilogramas']],record.unit??(lossKind==='material'?'kg':'pieces'),{placeholder:false}))+field('Quantidade',input('amount',record.amount??'',{inputMode:'decimal'}))+field('Motivo',select('reasonId',active(registries,'reasons').filter(row=>row.kind!=='stop').map(row=>[row.id,`${row.name} (${kindLabels[row.kind]??row.kind})`]),reason?.id??''));
  } else if(kind==='stoppage') {
    content=field('Início da parada',input('startedAt',localDateTime(record.startedAt),{type:'datetime-local'}))+field('Motivo',select('reasonId',active(registries,'reasons').filter(row=>row.kind==='stop').map(row=>[row.id,row.name]),record.reasonId??''))+`<label class="check-line full"><input type="checkbox" name="planned"${record.planned===true?' checked':''}><span>Parada planejada</span></label>`;
  } else if(kind==='closeStop') {
    content=field('Fim da parada',input('endedAt',localDateTime(record.endedAt),{type:'datetime-local'}),true);
  } else if(kind==='reviewDecision') {
    content=field('Decisão',select('decision',[['approved','Aprovar'],['rejected','Rejeitar']],'',{}),true)+field('Justificativa',`<textarea name="justification" required maxlength="2000" rows="4">${escape(record.justification??'')}</textarea>`,true);
  } else if(kind==='parameterVersion') {
    const parameterId=record.parameterId??record.parameterIds?.[0]??record.id??'',parameter=active(registries,'parameters').find(row=>row.id===parameterId),references=Array.isArray(catalog)?catalog:catalog.items??[],reference=references.find(item=>item.code===parameter?.code);
    const rule=record.rule??reference?.draftRule??{kind:'pending'};
    content=field('Parâmetro',registrySelect('parameterId','parameters',registries,parameterId),true)+field('Unidade',input('unit',record.unit??reference?.unit??'',{maxLength:30}))+field('Natureza',select('nature',[['measurement','Medição'],['setpoint','Setpoint']],record.nature??''))+field('Status',select('status',[['draft','Rascunho'],['approved','Aprovado']],'draft',{placeholder:false}))+field('Tipo de limite',select('ruleKind',[['pending','Pendente'],['range','Faixa'],['lower','Mínimo'],['upper','Máximo']],rule.kind,{placeholder:false}))+field('Limite mínimo',input('lower',rule.lower??'',{required:false,inputMode:'decimal'}))+field('Limite máximo',input('upper',rule.upper??'',{required:false,inputMode:'decimal'}));
  } else if(kind.startsWith('registry-')) {
    requireThat(['registry-machine','registry-process','registry-product','registry-parameter','registry-reason'].includes(kind),'INVALID_KIND');
    content=field('Nome',input('name',record.name??'',{maxLength:160}),true)+field('Código',input('code',record.code??'',{required:false,maxLength:100}),true);
    if(kind==='registry-process') content+=field('Máquina',registrySelect('machineId','machines',registries,record.machineId??context.machineId??''),true);
    if(kind==='registry-product') content+=`<fieldset class="field full"><legend>Processos</legend>${active(registries,'processes').map(process=>`<label class="check-line"><input type="checkbox" name="processIds" value="${escape(process.id)}"${(record.processIds?.[process.id]??process.id===context.processId)?' checked':''}><span>${escape(process.name)}</span></label>`).join('')}</fieldset>`;
    if(kind==='registry-parameter') content+=field('Processo',registrySelect('processId','processes',registries,record.processId??context.processId??''),true);
    if(kind==='registry-reason') content+=field('Tipo',select('kind',Object.entries(kindLabels),record.kind??'stop',{placeholder:false}),true);
  } else if(kind==='target') {
    const today=eventDate(Date.now());
    content=field('Nome da meta',input('name',record.name??'',{maxLength:160}),true)+field('Indicador',select('metric',[['producedPieces','Produção bruta (peças)'],['stopMinutes','Tempo parado (minutos)'],['rejectedPieces','Refugo (peças)'],['lossKg','Perda de material (kg)']],record.metric??''))+field('Limite',input('threshold',record.threshold??'',{inputMode:'decimal'}))+field('Comparação',select('operator',[['lower','Pelo menos'],['upper','No máximo']],record.operator??'upper',{placeholder:false}))+field('Data inicial',input('fromDate',record.fromDate??today,{type:'date'}))+field('Data final',input('toDate',record.toDate??today,{type:'date'}));
  } else throw new MsaError('INVALID_KIND');
  return `<div class="form-grid">${content}</div>`;
}

export function saoPauloInstant(value,field) {
  const match=typeof value==='string'&&value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/);
  requireThat(match&&Number(match[2])<24&&Number(match[3])<60&&Number(match[4]??0)<60,'INVALID_TIME',field);
  try {validateDate(match[1]);} catch {throw new MsaError('INVALID_TIME','INVALID_TIME',field);}
  const result=Date.parse(`${match[1]}T${match[2]}:${match[3]}:${match[4]??'00'}.${(match[5]??'0').padEnd(3,'0')}-03:00`);
  requireThat(Number.isSafeInteger(result)&&result>=0,'INVALID_TIME',field);return result;
}

export async function submitForm(kind,data,{services,context,record={},registries={}}={}) {
  const value=field=>{const raw=data.get(field);requireThat(raw==null||typeof raw==='string','VALIDATION',field);return raw??'';};
  const number=(field,code='INVALID_QUANTITY')=>{const parsed=parseReading(value(field));requireThat(parsed.status==='valid'&&Number.isFinite(parsed.value),code,field);return parsed.value;};
  const local=field=>saoPauloInstant(value(field),field);
  if(kind==='collection') return services.operations.recordCollection({context,readings:parameters(registries,context).map(parameter=>({parameterId:parameter.id,versionId:value(`version_${parameter.id}`),raw:value(`raw_${parameter.id}`)}))});
  if(kind==='production') return services.operations.recordProduction({context,quantity:number('quantity'),basis:value('basis'),startedAt:local('startedAt'),endedAt:local('endedAt')});
  if(kind==='loss') return services.operations.recordLoss({context,kind:value('kind'),unit:value('unit'),amount:number('amount'),reasonId:value('reasonId')});
  if(kind==='stoppage') return services.operations.startStoppage({context,startedAt:local('startedAt'),planned:data.has('planned'),reasonId:value('reasonId')});
  if(kind==='closeStop') return services.operations.closeStoppage(record.id,{endedAt:local('endedAt'),reasonId:record.reasonId});
  if(kind==='reviewDecision') return services.analysis.decideReview(record.id,{decision:value('decision'),justification:value('justification')});
  if(kind==='parameterVersion') {
    const ruleKind=value('ruleKind'),rule={kind:ruleKind};
    if(['range','lower'].includes(ruleKind)) rule.lower=number('lower','INVALID_LIMIT');
    if(['range','upper'].includes(ruleKind)) rule.upper=number('upper','INVALID_LIMIT');
    return services.registry.createParameterVersion(value('parameterId'),{unit:value('unit'),nature:value('nature'),status:value('status'),rule});
  }
  if(kind.startsWith('registry-')) {
    const registryKind={'registry-machine':'machines','registry-process':'processes','registry-product':'products','registry-parameter':'parameters','registry-reason':'reasons'}[kind];
    requireThat(registryKind,'INVALID_KIND');const payload={name:value('name')};if(value('code')) payload.code=value('code');
    if(registryKind==='processes') payload.machineId=value('machineId');
    if(registryKind==='products') payload.processIds=Object.fromEntries(data.getAll('processIds').map(id=>[id,true]));
    if(registryKind==='parameters') payload.processId=value('processId');
    if(registryKind==='reasons') payload.kind=value('kind');
    return services.registry.create(registryKind,payload);
  }
  if(kind==='target') {
    const metric=value('metric'),unit=metricUnits[metric];requireThat(unit&&(!value('unit')||value('unit')===unit),'INVALID_UNIT');
    return services.registry.create('targets',{name:value('name'),metric,unit,context,threshold:number('threshold','VALIDATION'),operator:value('operator'),fromDate:value('fromDate'),toDate:value('toDate')});
  }
  throw new MsaError('INVALID_KIND');
}
