import {analyzeCep} from '../domain/cep.js';
import {contextKey} from '../domain/context.js';
import {getCapabilityStudy} from '../catalog/capability-study.js';
import {getMsaParameterCatalog} from '../catalog/msa-parameters.js';
import {parseReading} from '../domain/numbers.js';
import {summarizeReadings} from '../domain/statistics.js';
import {escapeHtml as e,number as n,date,ruleText} from './format.js';
import {drawChart} from './charts.js';
import {latestPlans} from '../domain/planning.js';
import {matchesScope} from '../domain/production-policy.js';
const workbook=getCapabilityStudy(),catalog=getMsaParameterCatalog();
export const cepReasons={setpoint:'Capacidade não se aplica a ajustes/setpoints. Selecione uma característica medida.',
  'revision-conflict':'Há correções aprovadas conflitantes neste estudo. Resolva a revisão antes de interpretar capacidade.',
  'incomplete-study':'A consulta de coletas está incompleta. Reduza o recorte ou consulte todas as páginas antes de interpretar capacidade.',
  'incompatible-unit':'A unidade da referência difere da fonte. Selecione uma versão na mesma unidade; nenhuma conversão foi presumida.',
  'unclassified-nature':'Confirme com a Engenharia se o parâmetro é uma medição ou um ajuste da máquina.',
  'unapproved-limit':'Referência não aprovada. A Engenharia precisa definir uma versão de medição aprovada.',
  'invalid-limit':'Faixa inválida. Confira a referência com a Engenharia.',
  'bilateral-limit-required':'Cp/Cpk bilaterais exigem limites inferior e superior válidos.',
  'unverified-sequence':'A ordem das observações não foi confirmada. A carta é exploratória.',
  'insufficient-sample':'Amostra abaixo do mínimo definido para este estudo ou sem pares consecutivos suficientes.',
  'zero-dispersion':'Dispersão zero. Os índices estão indisponíveis; confira resolução e aquisição.',
  'unstable-process':'Há sinais de instabilidade. Investigue as causas antes de interpretar capacidade.',
  'non-finite-statistics':'Dispersão não calculável com estes valores.', 'non-finite-result':'Índice não calculável.'};
const groupLabel=g=>[g.versionId,...['recipe','lot','order','shift'].filter(k=>g.context[k]!=null).map(k=>`${{recipe:'Receita',lot:'Lote',order:'Ordem',shift:'Turno'}[k]}: ${g.context[k]}`)].join(' · ');
const opt=(value,label,selected)=>`<option value="${e(value)}" ${selected?'selected':''}>${e(label)}</option>`;
export function getCepStudy(state) {
  const config=state.cep,fromWorkbook=config.source==='workbook';
  const choices=fromWorkbook?workbook.parameters:Object.values(state.registries.parameters??{}).filter(p=>p.active&&p.processId===state.context.processId);
  const parameter=choices.find(p=>(fromWorkbook?p.code:p.id)===config.parameterId)??choices.find(p=>p.code==='MSA_BF')??choices[0];
  const id=parameter?(fromWorkbook?parameter.code:parameter.id):'';
  const groups=(state.dashboard.statistics??[]).filter(g=>g.parameterId===id);
  const group=groups.find(g=>groupLabel(g)===config.group)??groups[0];
  let samples=[],version=null,comparison=null;
  if(fromWorkbook&&parameter) {
    samples=parameter.samples.map(s=>({...s,...parseReading(s.raw),label:`${date(s.date)} · linha ${s.row}`,timePrecision:'date'}));
    const reference=catalog.find(p=>p.code===parameter.code);
    version={id:'workbook-reference',nature:'unknown',status:'draft',unit:parameter.unit,rule:reference?.draftRule??{kind:'pending'}};
    const registered=Object.values(state.registries.parameters??{}).filter(p=>p.code===parameter.code&&p.processId===state.context.processId);
    const selected=state.registries.parameterVersions?.[config.versionId];
    if(selected&&registered.some(p=>p.id===selected.parameterId))version=selected;
    comparison=summarizeReadings(samples,{sigmaMethod:'population',rule:reference?.draftRule});
  } else if(group) {
    version=state.registries.parameterVersions?.[group.versionId];
    samples=(state.dashboard.series??[]).filter(s=>s.parameterId===group.parameterId&&s.versionId===group.versionId&&contextKey(s.context)===contextKey(group.context))
      .sort((a,b)=>(a.occurredAt??Date.parse(a.eventDate+'T12:00:00Z'))-(b.occurredAt??Date.parse(b.eventDate+'T12:00:00Z')))
      .map(s=>({...s,label:date(s.occurredAt??s.eventDate,!!s.occurredAt)}));
  }
  const timed=samples.length>0&&samples.every((s,i)=>s.timePrecision==='instant'&&Number.isSafeInteger(s.occurredAt)&&(!i||s.occurredAt>samples[i-1].occurredAt));
  const sequenceConfirmed=timed||config.sequenceConfirmed;
  const analysis=analyzeCep(samples,{version,minSamples:config.minSamples,context:state.context,sequenceConfirmed,complete:fromWorkbook?true:group?.cep?.complete??state.period?.coverage?.collections??true,sourceUnit:fromWorkbook?parameter?.unit:null});
  return {parameter,choices,id,groups,group,samples,version,unit:fromWorkbook?parameter?.unit:version?.unit,analysis,comparison,fromWorkbook,
    source:fromWorkbook?`${workbook.source.name} · ${workbook.source.sheet} · ${parameter?.column??''}17:${parameter?.column??''}33`:state.simulation?'Simulação local':state.client?.mode==='presentation'||state.dataset==='presentation'?'Dados fictícios de apresentação':'Registros operacionais',
    timed,sequenceConfirmed};
}
export function cepPage(state) {
  const s=getCepStudy(state),a=s.analysis,c=state.cep;
  const versions=s.fromWorkbook?Object.values(state.registries.parameterVersions??{}).filter(v=>Object.values(state.registries.parameters??{}).some(p=>p.id===v.parameterId&&p.code===s.id&&p.processId===state.context.processId)):[];
  const indices=[['Média',a.mean],['σ dentro (MR/d₂)',a.sigmaWithin],['Cp',a.cp],['Cpk',a.cpk]];
  return `<section class="data-section cep-intro"><div class="section-heading"><div><h2>Estudo de processo</h2><p>Uma característica, uma versão e um contexto por estudo</p></div><button class="btn" data-action="cep-export" ${s.samples.length?'':'disabled'}>Exportar estudo</button></div><div class="cep-controls">
    <label class="field">Fonte<select id="cep-source" data-cep="source">${opt('system','Registros do sistema',!s.fromWorkbook)}${opt('workbook','Planilha fornecida pela empresa',s.fromWorkbook)}</select></label>
    <label class="field">Parâmetro<select id="cep-parameter" data-cep="parameterId">${s.choices.map(p=>opt(s.fromWorkbook?p.code:p.id,p.name,(s.fromWorkbook?p.code:p.id)===s.id)).join('')}</select></label>
    ${s.fromWorkbook?`<label class="field">Referência de especificação<select data-cep="versionId">${opt('','Planilha · referência não aprovada',!c.versionId)}${versions.map(v=>opt(v.id,`${v.status==='approved'?'Aprovada':'Rascunho'} · ${v.nature==='measurement'?'Medição':'Setpoint'} · ${ruleText(v.rule,v.unit)} · ${v.id}`,v.id===c.versionId)).join('')}</select></label>`:`<label class="field">Versão e contexto<select data-cep="group">${s.groups.map(g=>opt(groupLabel(g),groupLabel(g),g===s.group)).join('')}</select></label>`}
    <label class="field">Mínimo de leituras do estudo<input data-cep="minSamples" type="number" min="${state.context.machineId==='nhpl'?30:2}" max="500" value="${a.minSamples}"></label>
    ${!s.timed?`<label class="check-line"><input data-cep="sequenceConfirmed" type="checkbox" ${c.sequenceConfirmed?'checked':''}>Confirmei a ordem e a natureza das observações</label>`:''}</div>
    <p class="source-notes">${e(s.source)}${s.fromWorkbook?' · 17 linhas históricas de 25/08 a 29/09/2026, sem horário/subgrupo. Não são produção ao vivo.':''}</p>
    ${s.parameter&&!s.fromWorkbook&&['admin','engineer'].includes(state.actor?.role)&&!(state.dataset==='presentation'&&!state.simulation)?`<button class="btn" data-action="version:${e(s.parameter.id)}">Definir nova referência da Engenharia</button>`:''}</section>
    ${state.context.machineId==='nhpl'&&!s.fromWorkbook?samplingMarkup(state):''}
    <section class="data-section" id="cep-results"><div class="section-heading"><div><h2>${e(s.parameter?.name??'Selecione um parâmetro')}</h2><p>${a.nValid} leituras válidas · ${a.nMissing} ausentes · ${a.nInvalid} inválidas · ${a.nConflicted} conflitantes · ${e(s.unit??'')}</p></div><span class="badge ${a.signals.length?'bad':'neutral'}">${a.signals.length?'Sinais de instabilidade':'Estudo exploratório'}</span></div>
    ${a.reason?`<p class="cep-diagnostic" role="status">${e(cepReasons[a.reason]??a.reason)}</p>`:`<p class="cep-diagnostic">Nenhum sinal nas regras testadas. Índices estimados sob hipótese de distribuição normal; isso não comprova estabilidade nem libera produção.</p>`}
    <div class="cep-indices">${indices.map(([label,value])=>`<div><span>${e(label)}</span><strong data-cep-index="${label.toLowerCase()}">${n(value,3)}</strong></div>`).join('')}</div>
    <p class="source-notes">I-MR, fase I · Cp/Cpk usam σ dentro. Normalidade e adequação do instrumento não verificadas. Mínimo do estudo: ${a.minSamples}; não é aprovação industrial. ${state.client?.mode==='presentation'?'Leituras e faixas hipotéticas do conjunto de apresentação.':''}</p>
    ${s.group&&s.samples.length&&['admin','engineer','operator'].includes(state.actor?.role)&&!(state.dataset==='presentation'&&!state.simulation)?`<button class="btn" data-action="cep-review">Encaminhar estudo à Engenharia</button>`:''}</section>
    ${s.samples.length?`<div class="cep-charts"><section class="data-section"><h2>Individuais (I)</h2><p class="source-notes">Limites de controle do estudo e especificações da referência</p><div class="chart-frame"><canvas id="cep-chart" role="img" aria-label="Carta de indivíduos"></canvas></div></section><section class="data-section"><h2>Amplitude móvel (MR)</h2><p class="source-notes">Pares consecutivos; lacunas interrompem a amplitude</p><div class="chart-frame"><canvas id="cep-mr-chart" role="img" aria-label="Carta de amplitude móvel"></canvas></div></section></div>`:'<div class="empty-state"><h2>Sem leituras neste contexto</h2><p>Registre uma coleta ou consulte a planilha histórica.</p></div>'}
    ${s.fromWorkbook&&s.comparison?`<section class="data-section" id="cep-comparison"><h2>Conferência da planilha</h2><p>Recalculado com números e números em texto: média ${n(s.comparison.mean,6)} ${e(s.parameter.unit)} · desvio populacional ${n(s.comparison.sigma,6)}.</p><p class="source-notes">Este é o cálculo de dispersão global usado como comparação com STDEVP, não o σ dentro da carta I-MR. Cp/Cpk do estudo acima dependem dos requisitos indicados.</p><details><summary>Fórmulas e resultados salvos na fonte</summary><div class="table-wrap"><table class="data-table"><thead><tr><th>Célula</th><th>Fórmula original</th><th>Valor salvo</th></tr></thead><tbody>${s.parameter.excelSummary.map(x=>`<tr><td>${e(x.cell)}</td><td>${e(x.formula)}</td><td>${e(x.cached)}</td></tr>`).join('')}</tbody></table></div></details></section>`:''}
    <section class="data-section" id="cep-source-rows"><h2>Observações e sinais</h2><div class="table-wrap" tabindex="0"><table class="data-table"><thead><tr><th>Observação</th><th>Original</th><th>Valor (${e(s.unit??'')})</th><th>MR</th><th>Situação</th></tr></thead><tbody>${s.samples.map((sample,i)=>`<tr><td>${e(sample.label)}${sample.cell?` · ${e(sample.cell)}`:''}</td><td>${sample.correctionId?`${e(sample.originalRaw??'')} → ${e(sample.raw??'')}<div class="small muted">Correção: ${e(sample.correctionId)}</div>`:e(sample.raw??'')}</td><td>${n(a.points[i],4)}</td><td>${n(a.movingRanges[i],4)}</td><td>${e(a.signals.filter(signal=>signal.index===i).map(signal=>({'individual-3sigma':'Fora dos limites I','moving-range-limit':'MR acima do limite','eight-same-side':'8 leituras no mesmo lado'})[signal.rule]).join(' · ')||(sample.revisionConflict?'Revisão conflitante':sample.status==='valid'?'Sem sinal':sample.status))}</td></tr>`).join('')}</tbody></table></div></section>`;
}
export function drawCepCharts(state) {
  const s=getCepStudy(state),a=s.analysis,labels=s.samples.map((sample,i)=>s.fromWorkbook?`L${sample.row}`:String(i+1)),fullLabels=s.samples.map(sample=>sample.label),line=(label,value,color,dash)=>({type:'line',label,data:labels.map(()=>value),borderColor:color,borderDash:dash,pointRadius:0,borderWidth:1.5});
  const style=getComputedStyle(document.documentElement),control=style.getPropertyValue('--amber').trim(),muted=style.getPropertyValue('--muted').trim(),red=style.getPropertyValue('--red').trim();
  const datasets=[{type:'line',label:'Medição',data:a.points},line('Média',a.mean,muted,[4,4]),line('LCI',a.individuals.lower,control,[3,3]),line('LCS',a.individuals.upper,control,[3,3])];
  if(s.version?.rule?.kind==='range'&&a.reason!=='incompatible-unit'){datasets.push(line('LIE · especificação',s.version.rule.lower,red,[8,4]),line('LSE · especificação',s.version.rule.upper,red,[8,4]));}
  drawChart('cep-chart',{labels,fullLabels,unit:s.unit??'',datasets});
  drawChart('cep-mr-chart',{labels,fullLabels,unit:s.unit??'',datasets:[{type:'line',label:'Amplitude móvel',data:a.movingRanges},line('MR média',a.mrMean,muted,[4,4]),line('LCS MR',a.movingRange.upper,control,[3,3])]});
}
function samplingMarkup(state){
 const plans=latestPlans(state.period.plans??[]).filter(p=>matchesScope(state.context,p.context)),collections=state.period.effective?.collections??[];
 return `<section class="data-section"><h2>Coleta por turno</h2><div class="table-wrap"><table class="data-table"><thead><tr><th>Período / turno</th><th>OP / lote</th><th>Coleta</th></tr></thead><tbody>${plans.map(p=>{const rows=collections.filter(c=>matchesScope(p.context,c.context)&&c.occurredAt>=p.startedAt&&c.occurredAt<p.endedAt);return `<tr><td>${date(p.startedAt,true)} · turno ${e(p.context.shift)}</td><td>${e(p.context.order)} / ${e(p.context.lot)}</td><td>${rows.length?'Coleta registrada':p.startedAt>Date.now()?'Programado':'Coleta pendente'}</td></tr>`;}).join('')}</tbody></table></div><p class="source-notes">Frequência informada: uma coleta por turno. O estudo NHPL exige ao menos 30 observações válidas; isso não exige 30 peças em cada turno. Conferir o método de amostragem com a equipe técnica.</p></section>`;
}
export function cepReportRows(state) {
  const s=getCepStudy(state),a=s.analysis;
  const dates=s.samples.map(sample=>sample.eventDate??sample.date).filter(Boolean).sort(),observationFromDate=dates[0]??null,observationToDate=dates.at(-1)??null;
  return [{type:'summary',generatedAt:new Date().toISOString(),responsible:state.actor?.uid,fromDate:s.fromWorkbook?observationFromDate:state.fromDate,toDate:s.fromWorkbook?observationToDate:state.toDate,observationFromDate,observationToDate,consultationFromDate:state.fromDate,consultationToDate:state.toDate,source:s.source,parameter:s.parameter?.name,version:s.version?.id,versionStatus:s.version?.status,nature:s.version?.nature,context:s.group?.context,unit:s.unit,specificationUnit:s.version?.unit,method:a.method,phase:a.phase,
    n:a.nValid,nMissing:a.nMissing,nInvalid:a.nInvalid,nConflicted:a.nConflicted,complete:a.complete,mean:a.mean,sigmaWithin:a.sigmaWithin,sigmaOverall:a.sigmaOverall,cp:a.cp,cpk:a.cpk,pp:a.pp,ppk:a.ppk,
    reason:a.reason,normalityVerified:false,homologated:false,minSamples:a.minSamples,sequenceConfirmed:a.sequenceConfirmed,reference:s.version?.rule,
    sourceSha256:s.fromWorkbook?workbook.source.sha256:null},...s.samples.map((sample,i)=>({type:'sample',label:sample.label,eventDate:sample.eventDate??sample.date,rawDate:sample.rawDate,occurredAt:sample.occurredAt,timePrecision:sample.timePrecision,collectionId:sample.collectionId,originalId:sample.originalId,correctionId:sample.correctionId,revisionConflict:sample.revisionConflict,origin:sample.origin,source:sample.source,sourceCell:sample.cell,raw:sample.raw,originalRaw:sample.originalRaw??sample.raw,status:sample.status,value:a.points[i],movingRange:a.movingRanges[i],signals:a.signals.filter(signal=>signal.index===i).map(signal=>signal.rule).join('|')}))];
}
