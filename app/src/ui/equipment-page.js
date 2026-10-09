import {escapeHtml as e,date,number as n} from './format.js';
import {eventDate,validateDate} from '../domain/time.js';
import {shiftAt} from '../domain/shifts.js';
import {matchesSearch} from './search.js';
import {selectOperationalPeriod} from './operational-query.js';
import {matchesScope} from '../domain/production-policy.js';
import {latestOccurrenceDecision} from '../domain/occurrences.js';
import {projectWorkspaceMetrics,projectProductivity} from '../domain/workspace-metrics.js';
function latestCandidates(collections){
 const day=row=>row.eventDate??(Number.isSafeInteger(row.occurredAt)?eventDate(row.occurredAt):null);
 const dated=collections.map(row=>({row,day:day(row)})),latestDay=dated.map(x=>x.day).filter(Boolean).sort().at(-1);
 const sameDay=dated.filter(x=>!x.day||x.day===latestDay).map(x=>x.row);
 if(sameDay.some(row=>!Number.isSafeInteger(row.occurredAt)))return sameDay;
 const latestTime=Math.max(...sameDay.map(row=>row.occurredAt));
 return sameDay.filter(row=>row.occurredAt===latestTime);
}
export function equipmentHistoryQuery(record){
 const day=Number.isSafeInteger(record.occurredAt)?shiftAt(record.occurredAt).operationalDate:validateDate(record.eventDate);
 return {context:record.context,fromDate:day,toDate:day,shift:'all'};
}
export function equipmentConsultation({catalog,machineId,processId,fromDate,toDate,shift}){
 const choices=Object.values(catalog.processes??{}).filter(p=>p.machineId===machineId&&p.active!==false),process=processId?choices.find(p=>p.id===processId):choices.length===1?choices[0]:null;
 return {choices,requiresChoice:!process,query:process?{context:{machineId,processId:process.id},fromDate,toDate,shift}:null};
}
export function equipmentView({catalog={},events={},selection={},state}){
 const catalogProcesses=Object.values(catalog.processes??{}),catalogProducts=Object.values(catalog.products??{});
 const machines=Object.values(catalog.machines??{}).filter(m=>!selection.sector||m.sector===selection.sector||catalogProcesses.some(p=>p.machineId===m.id&&p.id===selection.sector));
 return selectEquipmentRows(machines.map(machine=>{
  const processes=catalogProcesses.filter(p=>p.machineId===machine.id),context={machineId:machine.id,...(processes.some(p=>p.id===selection.sector)?{processId:selection.sector}:{})},products=catalogProducts.filter(p=>processes.filter(process=>!context.processId||process.id===context.processId).some(process=>p.processIds?.[process.id]));
  let metrics=null,op=null,period=null;
  if(state?.equipmentPeriod&&state.operationalQuery){op={...state.operationalQuery,query:{...state.operationalQuery.query,context},consultation:{...state.operationalQuery.consultation,context}};period=selectOperationalPeriod(state.equipmentPeriod,op);const metricState={...state,context,operationalQuery:op,period,productivity:undefined};metricState.productivity=projectProductivity(metricState);metrics=projectWorkspaceMetrics(metricState);}
  const values=kind=>Object.values(period?.[kind]??events[kind]??{}).filter(r=>matchesScope(context,r.context??{}));
  const collections=values('collections'),openStops=values('stoppages').filter(s=>s.endedAt==null),production=values('production');
  const candidates=latestCandidates(collections),missingTime=candidates.some(c=>!Number.isSafeInteger(c.occurredAt)),ambiguous=!missingTime&&candidates.length>1,latest=missingTime?null:candidates[0]??null;
  const conflictedRecordIds=candidates.filter(c=>c.revisionConflict).map(c=>c.id),conflict=conflictedRecordIds.length>0;
  const goodSegments=metrics?.productivity.segments.filter(s=>s.state==='final'&&Number.isFinite(s.goodPieces))??[],goodPieces=goodSegments.length?goodSegments.reduce((sum,s)=>sum+s.goodPieces,0):null;
  const base=state?.equipmentPeriod??{},belongs=(kind,id)=>values(kind).some(r=>r.id===id),reviews=(base.reviews??[]).filter(r=>['waiting','analyzing'].includes(r.state)&&belongs('collections',r.collectionId)),corrections=(base.corrections??[]).filter(r=>r.state==='waiting'&&belongs(r.recordType,r.recordId)),occurrences=(state?.technical??[]).filter(r=>r.kind==='occurrence'&&matchesScope(context,r.context??{})&&(!op||op.windows.some(w=>r.occurredAt>=w.from&&r.occurredAt<w.to))&&(latestOccurrenceDecision(state.technical,r.id)?.decision!=='resolved'));
  const alerts=[...(reviews.length?[reviews.length+' análise(s) pendente(s)']:[]),...(corrections.length?[corrections.length+' correção(ões) pendente(s)']:[]),...(occurrences.length?[occurrences.length+' ocorrência(s) pendente(s)']:[]),...(conflict?['Revisão conflitante na última leitura']:[]),...(ambiguous?['Horários empatados']:[]),...(missingTime?['Horário da leitura não informado']:[]),...(metrics&&metrics.coverage.evaluated<metrics.coverage.total?['Bases de OEE incompletas']:[])];
  return {id:machine.id,code:machine.code??machine.id,name:machine.name,sector:machine.sector??null,active:machine.active,status:openStops.length?'Parada registrada em aberto':production.length?'Produção registrada':machine.active?'Ativo no cadastro':'Inativo no cadastro',openStops:openStops.length,hasProduction:production.length>0,goodPieces,alerts,metrics,products,lastReading:ambiguous||conflict?null:latest,lastReadingReason:conflict?'Revisão conflitante na última leitura':ambiguous?'Horários empatados':collections.length&&!latest?'Horário da leitura não informado':!latest?'Sem leitura no período':null,conflictedRecordIds,processes};
 }),selection);
}
function selectEquipmentRows(rows,selection){
 return rows.filter(r=>(!selection.sector||r.sector===selection.sector||r.processes.some(p=>p.id===selection.sector))&&matchesSearch([r.code,r.name,...r.products.map(p=>p.name)],selection.search)&&(!selection.status||({production:r.hasProduction,intervention:r.openStops>0,alerts:r.alerts.length>0,inactive:!r.active,active:r.active})[selection.status])).sort((a,b)=>selection.order==='alerts'?b.alerts.length-a.alerts.length||a.name.localeCompare(b.name,'pt-BR'):selection.order==='code'?a.code.localeCompare(b.code,'pt-BR',{numeric:true}):selection.order==='name'?a.name.localeCompare(b.name,'pt-BR'):0);
}
const equipmentSnapshots=new WeakMap();
export function equipmentRows(state,selection={}){
 // Refresh replaces these snapshots; changing a filter does not change the evidence.
 // Without a fixed observation time, keep calculating rather than freezing live time.
 if(state.equipmentPeriod&&state.operationalQuery&&state.asOf==null)return equipmentView({catalog:state.registries,events:state.equipmentEvents??{},state,selection});
 const inputs=[state.registries,state.equipmentEvents,state.equipmentPeriod,state.operationalQuery,state.technical,state.asOf,state.client?.mode,state.liveCoverage,state.fromDate,state.toDate];
 let snapshot=equipmentSnapshots.get(state);
 if(!snapshot||inputs.some((value,i)=>value!==snapshot.inputs[i])){snapshot={inputs,sectors:new Map()};equipmentSnapshots.set(state,snapshot);}
 const sector=selection.sector??'';
 if(!snapshot.sectors.has(sector))snapshot.sectors.set(sector,equipmentView({catalog:state.registries,events:state.equipmentEvents??{},state,selection:{sector}}));
 return selectEquipmentRows(snapshot.sectors.get(sector),selection);
}
export function equipmentPage({state}){
 const all=Object.values(state.registries.machines??{}),rows=equipmentRows(state,{order:'name',...state.equipmentFilters}),f=state.equipmentFilters??{},processes=Object.values(state.registries.processes??{});
 const select=(id,label,options)=>`<label class="field">${label}<select id="equipment-${id}">${options.map(([value,text])=>`<option value="${e(value)}" ${f[id]===value?'selected':''}>${e(text)}</option>`).join('')}</select></label>`;
 return `<section class="data-section"><div class="section-heading"><div><h2>Situação registrada dos equipamentos</h2><p>Cadastro, produção e leituras no período consultado.</p></div><button class="btn" data-action="refresh">Atualizar</button></div><div class="equipment-filters"><label class="field">Buscar equipamento ou produto<input id="equipment-search" type="search" placeholder="Código, nome ou produto" value="${e(f.search??'')}"></label>${select('sector','Setor / processo',[['','Todos os processos'],...processes.map(p=>[p.id,p.name])])}${select('status','Situação',[['','Todas'],['production','Produção registrada'],['intervention','Parada em aberto'],['alerts','Com pendências'],['active','Ativo no cadastro'],['inactive','Inativo no cadastro']])}${select('order','Ordenar por',[['name','Nome'],['code','Código'],['alerts','Pendências']])}<button class="btn" data-action="equipment-clear">Limpar filtros</button></div><div id="equipment-results">${equipmentResults(rows,all)}</div><p class="source-notes">Situação baseada nos registros consultados. Cadastro ativo não comprova operação ou conexão física. Boas somam apontamentos de peças boas em intervalos confirmados. OEE usa boas de primeira passagem e informa a cobertura das suas bases.</p></section>`;
}
export function equipmentResults(rows,all){
 return `<div class="equipment-summary" role="status"><span><strong>${rows.length}</strong> de ${all.length} equipamentos encontrados</span><span><strong>${rows.filter(r=>r.hasProduction).length}</strong> com produção registrada</span><span><strong>${rows.filter(r=>r.openStops).length}</strong> com parada em aberto</span><span><strong>${rows.filter(r=>r.alerts.length).length}</strong> com pendências</span></div><div class="table-wrap equipment-table" role="region" aria-label="Equipamentos no período" tabindex="0"><table class="data-table"><thead><tr>${['Equipamento / produto','Setor / processo','Situação / pendências','Boas no período','Plano / meta','OEE consultado','Acesso'].map(t=>`<th scope="col">${t}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>{const m=r.metrics,p=m?.productivity.aggregate;return `<tr><td><strong>${e(r.name)}</strong><div class="small muted">${e(r.code)}</div><div>${e(r.products.map(p=>p.name).join(' · ')||'Sem produto vinculado')}</div></td><td>${e(r.sector??(r.processes.map(p=>p.name).join(' · ')||'Sem processo'))}</td><td>${e(r.status)}${r.alerts.map(a=>`<div class="small equipment-alert">${e(a)}</div>`).join('')}<div class="small muted">${r.lastReading?'Leitura '+date(r.lastReading.occurredAt,true):e(r.lastReadingReason)}</div></td><td>${r.goodPieces==null?'Indisponível':n(r.goodPieces)+' peças'}</td><td>${p?n(p.plannedPieces)+' peças<br>Meta '+n(p.targetPercent)+'%':'Sem base confirmada'}</td><td><strong>${m?.aggregate.oee==null?'Indisponível':n(m.aggregate.oee*100)+'%'}</strong><div class="small muted">${m?m.coverage.evaluated+'/'+m.coverage.total+' intervalos completos':'Consulta pendente'}</div></td><td><button class="btn" data-action="equipment-detail:${e(r.id)}">Detalhes</button></td></tr>`;}).join('')||'<tr><td colspan="7">Nenhum equipamento encontrado. Altere ou limpe os filtros.</td></tr>'}</tbody></table></div>`;
}
