import {buildHourly} from '../domain/hourly.js';
import {escapeHtml as e,number as n,date} from './format.js';
import {drawChart} from './charts.js';
export function hourlyView(state) {
  return buildHourly({...state.period,...state.period.effective},{...state.hourly,now:Date.now()});
}
export function hourlyPage(state) {
  const r=hourlyView(state),c=state.hourly;
  return `<section class="data-section"><div class="section-heading"><div><h2>Produção hora a hora</h2><p>Peças informadas no intervalo, sem distribuir totais entre horas</p></div></div><div class="cep-controls">
    <label class="field">Dia da consulta<input id="hourly-date" data-hourly="date" type="date" min="${e(state.fromDate)}" max="${e(state.toDate)}" value="${e(c.date)}"></label>
    <label class="field">Meta/h para esta consulta<input data-hourly="target" type="text" inputmode="decimal" placeholder="Informe uma meta" value="${c.target??''}"></label>
    <label class="field">Microparada: duração máxima (s)<input data-hourly="microStopSeconds" type="number" min="1" max="3600" value="${c.microStopSeconds}"></label></div>
    <p class="source-notes">Meta informada pelo usuário para a consulta; não é um valor homologado automaticamente. Último registro: ${r.lastRecordAt?date(r.lastRecordAt,true):'Sem registros'}. A captura atual é digital/manual ou importada; não há conexão física com a máquina.</p>
    <div class="cep-indices"><div><span>Microparadas encerradas</span><strong>${r.microstops.count}</strong></div><div><span>Tempo acumulado sem duplicação</span><strong>${n(r.microstops.seconds)} s</strong></div><div><span>Paradas em aberto</span><strong>${r.openStoppages}</strong></div><div><span>Produção não alocada por hora</span><strong>${r.unallocatedRecords?n(r.unallocatedPieces)+' peças':'Sem intervalos cruzando horas'}</strong></div></div>
    <p class="source-notes">Microparadas: eventos não planejados encerrados de até ${c.microStopSeconds} s. ${r.microstops.overlap?'Há eventos sobrepostos; o tempo acumulado usa sua união. ':''}Ausência de evento não comprova ausência de paradas. O tempo parado não explica sozinho o déficit de produção.</p>
    ${r.conflictedRecords?`<p class="cep-diagnostic">${r.conflictedRecords} registro(s) têm revisões conflitantes. Quantidades dessas horas estão indisponíveis; microparadas e tempo acumulado consideram somente eventos sem conflito.</p>`:''}
    ${state.period.complete===false?'<p class="source-notes">Consulta parcial: confira o período, os limites de página e revisões antes de usar os totais.</p>':''}
    ${r.unallocatedRecords?`<p class="cep-diagnostic">${r.unallocatedRecords} apontamento(s) cruzam limites de hora/dia. Seus totais foram preservados e não alocados; registre intervalos por hora para obter um comparativo completo.</p>`:''}
    <div class="chart-frame"><canvas id="hourly-chart" role="img" aria-label="Produção por hora e meta"></canvas></div>
    <div class="table-wrap" tabindex="0"><table class="data-table"><thead><tr><th>Hora</th><th>Bruta</th><th>Boas</th><th>Meta</th><th>Diferença</th><th>Consulta</th></tr></thead><tbody>${r.hours.map(h=>`<tr><td>${h.label}–${String(h.hour+1).padStart(2,'0')}:00</td><td>${n(h.grossPieces)}</td><td>${n(h.goodPieces)}</td><td>${n(h.target)}</td><td>${n(h.difference)}</td><td>${h.unallocatedCount?'Intervalo não alocado':h.status==='future'?'Hora futura':h.status==='current'?'Em andamento':h.grossPieces==null?'Sem apontamento':'Hora encerrada'}</td></tr>`).join('')}</tbody></table></div></section>`;
}
export function drawHourlyChart(state) {
  const r=hourlyView(state);
  drawChart('hourly-chart',{labels:r.hours.map(h=>h.label),unit:'peças',datasets:[{label:'Produção bruta',data:r.hours.map(h=>h.grossPieces)},{type:'line',label:'Meta/h da consulta',data:r.hours.map(h=>h.target),pointRadius:0,borderDash:[6,4]}]});
}
