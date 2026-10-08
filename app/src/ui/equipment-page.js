import {escapeHtml as e,date} from './format.js';
import {eventDate,validateDate} from '../domain/time.js';
import {shiftAt} from '../domain/shifts.js';
function latestCandidates(collections){
 const day=row=>row.eventDate??(Number.isSafeInteger(row.occurredAt)?eventDate(row.occurredAt):null);
 const latestDay=collections.map(day).filter(Boolean).sort().at(-1);
 const sameDay=collections.filter(row=>!day(row)||day(row)===latestDay);
 if(sameDay.some(row=>!Number.isSafeInteger(row.occurredAt)))return sameDay;
 const latestTime=Math.max(...sameDay.map(row=>row.occurredAt));
 return sameDay.filter(row=>row.occurredAt===latestTime);
}
export function equipmentHistoryQuery(record){
 const day=Number.isSafeInteger(record.occurredAt)?shiftAt(record.occurredAt).operationalDate:validateDate(record.eventDate);
 return {context:record.context,fromDate:day,toDate:day,shift:'all'};
}
export function equipmentView({catalog={},events={},selection={}}){
 const values=kind=>Object.values(events[kind]??{}),sector=selection.sector;
 return Object.values(catalog.machines??{}).filter(m=>!sector||m.sector===sector).map(machine=>{
  const collections=values('collections').filter(c=>c.context?.machineId===machine.id),openStops=values('stoppages').filter(s=>s.context?.machineId===machine.id&&s.endedAt==null);
  const candidates=latestCandidates(collections),missingTime=candidates.some(c=>!Number.isSafeInteger(c.occurredAt)),ambiguous=!missingTime&&candidates.length>1,latest=missingTime?null:candidates[0]??null;
  const conflictedRecordIds=candidates.filter(c=>c.revisionConflict).map(c=>c.id),conflict=conflictedRecordIds.length>0;
  return {id:machine.id,name:machine.name,sector:machine.sector??null,active:machine.active,status:openStops.length?'Parada registrada em aberto':machine.active?'Ativo no cadastro':'Inativo no cadastro',lastReading:ambiguous||conflict?null:latest,lastReadingReason:conflict?'Revisão conflitante na última leitura':ambiguous?'Horários empatados':collections.length&&!latest?'Horário da leitura não informado':!latest?'Sem leitura no período':null,conflictedRecordIds,processes:Object.values(catalog.processes??{}).filter(p=>p.machineId===machine.id)};
 });
}
export function equipmentPage({state}){
 const rows=equipmentView({catalog:state.registries,events:state.equipmentEvents??{},selection:{sector:state.equipmentSector}}),sectors=[...new Set(Object.values(state.registries.machines??{}).map(m=>m.sector).filter(Boolean))];
 return `<section class="data-section"><div class="section-heading"><div><h2>Situação registrada dos equipamentos</h2><p>Cadastro e leituras no período consultado. O acesso ao Firebase não informa conexão física com a máquina.</p></div>${sectors.length?`<label class="field">Setor<select id="equipment-sector"><option value="">Todos</option>${sectors.map(s=>`<option ${s===state.equipmentSector?'selected':''}>${e(s)}</option>`).join('')}</select></label>`:''}</div><div class="equipment-grid">${rows.map(r=>`<article class="equipment-card"><h3>${e(r.name)}</h3><p>${e(r.status)}${r.sector?' · '+e(r.sector):''}</p><p>Última leitura: ${r.lastReading?date(r.lastReading.occurredAt,true):e(r.lastReadingReason)}</p><p>${e(r.processes.map(p=>p.name).join(' · ')||'Sem processo cadastrado')}</p><button class="btn" data-action="equipment-detail:${e(r.id)}">Ver equipamento</button></article>`).join('')||'<p class="empty-state">Nenhum equipamento cadastrado neste setor.</p>'}</div></section>`;
}
