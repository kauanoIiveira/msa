import {reportsPage} from './reports-page.js';
import {exportBi} from '../io/bi-export.js';
import {patchSnapshot} from './snapshot-dom.js';
import {productionContextCard} from './production-context-card.js';
import {initialSelection} from './production-selection.js';
import {parametersPage,visibleParameters} from './parameters-page.js';
import {equipmentPage,equipmentView,equipmentHistoryQuery,equipmentResults,equipmentConsultation} from './equipment-page.js';
import {createProductionJourney} from './production-journey.js';
import {requireThat} from '../domain/errors.js';
import {saoPauloInstant} from './forms.js';
import {ledgerView} from '../repositories/append-ledger.js';
import {eventDate} from '../domain/time.js';
import {openWorkspaceClient} from './workspace-client.js';
import {archiveLocalWorkspace} from './local-archive.js';
import {liveObservedBases,mountLiveControls} from './live-controls.js';
import {loadOperationalView,selectOperationalPeriod,readAccountConsultation,writeAccountConsultation} from './operational-query.js';
import {buildPending} from '../domain/pending.js';
import {shiftAt} from '../domain/shifts.js';
import {resolveWorkspaceRoute,groupedNavigation,pagePurposes} from './workspace-routes.js';
import {productionPage} from './production-page.js';
import {stoppagesPage} from './stoppages-page.js';
import {qualityPage} from './quality-page.js';
import {overviewMarkup,reliabilityMarkup} from './overview.js';
import { createBrowserMsa } from "../browser.js";
import { emptyDashboard, workspaceId } from "./operational-workspace.js";
import {
  readPreferences,
  writePreferences,
  applyTheme,
} from "./preferences.js";
import { enableVlibras, disableVlibras } from "./vlibras.js";
import { formMarkup, submitForm } from "./forms.js";
import {
  escapeRecordText as e,
  recordLabel,
  number as n,
  date,
  badge,
  ruleText,
  errorText,
  today,
  dayOffset,
  dateWindow,
} from "./format.js";
import { clearCharts, drawChart } from "./charts.js";
import { evaluateReading } from "../domain/limits.js";
import { getMsaParameterCatalog } from "../catalog/msa-parameters.js";
import {readConsultation,writeConsultation} from './consultation.js';
import {openSimulation,simulationCases} from './simulation.js';

import {selectParameterStudy} from '../domain/cep.js';
import {cepPage,drawCepCharts,getCepStudy,cepReportRows,cepReasons} from './cep.js';
import {hourlyPage,drawHourlyChart} from './hourly.js';
import {parseReading} from '../domain/numbers.js';
import {openCsvImport,openCorrection} from './data-tools.js';
import {recordsInPeriod} from './period-records.js';
import {downloadExport} from './csv-download.js';
import {planningMarkup,productivityMarkup,productivityView,nhplAction} from './nhpl.js';
import {productionChartData,referenceDraft,recordContextMarkup,availableProductionIntervals,parameterReferences} from './presentation-details.js';
import {visibleNavigation,initialRoute,resolveRoute} from './access.js';
import {openPresentation} from './presentation.js';
import {inspectionsMarkup,technicalMarkup,technicalView,captureMarkup,occurrencesMarkup,stopsTechnicalMarkup,stopClassificationMarkup,technicalAction} from './technical.js';
import {loginAccounts} from '../config/login-accounts.js';
const app = document.getElementById("app"),
  modal = document.getElementById("modal");
const roots = [
  "recipeVersions",
  "machines",
  "processes",
  "products",
  "parameters",
  "parameterVersions",
  "reasons",
  "targets",
];
const kinds = [
  "collections",
  "production",
  "stoppages",
  "losses",
  "reviews",
  "corrections",
];
const labels = {
  equipment: "Equipamentos",
  dashboard: "Visão geral",
  planning: "Planejamento NHPL",
  parameters: "Parâmetros",
  operations: "Apontamentos",
  engineering: "Engenharia",
  history: "Histórico",
  reports: "Relatórios",
  registry: "Cadastros",
  settings: "Configurações",
  cep: "CEP e capacidade",
  hourly: "Hora a hora",
  collections: "Coletas",
  production: "Produção",
  stoppages: "Paradas",
  quality: "Qualidade",
  losses: "Refugos e perdas",
  reviews: "Análises",
  corrections: "Correções",
  occurrences: "Ocorrências",
  indicators: "Indicadores",
  capture: "Importação de dados",
  tv: "Acompanhamento da produção",
  machines: "Máquinas",
  processes: "Processos",
  products: "Produtos",
  reasons: "Motivos",
  targets: "Metas",
};
const allNavigation = [
 ['dashboard','layout-dashboard','Visão geral'],['production','factory','Produção'],['equipment','boxes','Equipamentos'],['stoppages','timer','Paradas'],['quality','badge-check','Qualidade'],['parameters','sliders-horizontal','Parâmetros'],['engineering','shield-check','Engenharia'],['cep','chart-line','CEP'],['indicators','gauge','Indicadores'],['history','history','Histórico'],['reports','file-down','Relatórios'],['registry','database','Cadastros']
];
const state = {
  accountOpen: false,
  source: 'existing',
  consultationShift: 'all',
  pageTabs: {production:'summary',stoppages:'open',quality:'losses'},
  dataset: 'operational',
  cep: {source:'system',parameterId:'',group:'',versionId:'',minSamples:25,sequenceConfirmed:false},
  hourly: {date:today(),target:null,microStopSeconds:60},
  route: location.hash.slice(1) || "dashboard",
  returnRoute: location.hash.slice(1) || null,
  tab: {
    operations: "production",
    engineering: "reviews",
    registry: "machines",
    history: "collections",
  },
  fromDate: dayOffset(today(), 1-readConsultation().days),
  toDate: today(),
  context: {},
  selection: {query:{},recording:null},
  productionCases: [],
  draft: null,
  registries: {},
  period: {},
  technical: [],
  dashboard: emptyDashboard(),
  client: null,
  actor: null,
  error: null,
  loading: false,
  search: "",
  offs: [],
  signingIn: false,
  loginError: '',
  modalReturn: null,
};
let cloud,
  authOff,
  refreshTimer,
  epoch = 0,
  toastTimer,
  cloudEntry;
let liveState, localSimulation,sessionGeneration=0;
let connectorTimer,connectorBusy=false;
function stopConnector(){clearInterval(connectorTimer);connectorTimer=null;state.connectorActive=false;}
function startConnector(){
 stopConnector();state.connectorActive=true;
 connectorTimer=setInterval(async()=>{
  if(connectorBusy)return;if(!operator()){stopConnector();return;}connectorBusy=true;
  const client=state.client;
  try{const response=await fetch('http://127.0.0.1:5188/events',{cache:'no-store',signal:AbortSignal.timeout(4000)});if(!response.ok)throw new Error('Conector indisponível');const queue=await response.json();if(!Array.isArray(queue.events)||queue.events.length>500)throw new Error('Fila inválida');
   for(const event of queue.events){if(state.client!==client)break;await client.services.technical.ingest(event);}
   state.connectorMessage=queue.errors?.length?queue.errors.map(r=>r.file+': '+r.message).join(' · '):'Pasta acompanhada · '+queue.events.length+' eventos conferidos';
  }catch(error){state.connectorMessage='Recepção interrompida: '+(error.code?errorText(error):'conferir conector, pasta e conexão local');stopConnector();}
  finally{connectorBusy=false;if(!modal.open)layout();}
 },2000);
}

async function startSimulation(caseId) {
  stopConnector();
  const local = await openSimulation(caseId,{effectiveActor:state.actor??{uid:'simulation-viewer',role:'viewer'}});
  if (!localSimulation) liveState = {selection:structuredClone(state.selection),draft:state.draft,productionCases:state.productionCases,source:state.source,consultationShift:state.consultationShift,pageTabs:structuredClone(state.pageTabs),client:state.client,actor:state.actor,context:structuredClone(state.context),fromDate:state.fromDate,toDate:state.toDate,route:state.route,search:state.search,connected:state.connected,dataset:state.dataset,followLatest:state.followLatest};
  if(!localSimulation&&state.client?.live)await state.client.live.suspend();
  unsubscribe();
  localSimulation?.dispose();
  localSimulation = local;
  state.simulation = caseId;state.source='case';state.consultationShift='all';
  state.client = local;
  state.actor = local.actor;
  state.context = local.context;
  state.selection={query:{context:structuredClone(local.context),fromDate:local.fromDate,toDate:local.toDate,shift:'all'},recording:{productionCaseId:null,context:structuredClone(local.context)}};state.draft=null;
  state.fromDate = local.fromDate;
  state.toDate = local.toDate;
  state.route = 'dashboard';
  location.hash = 'dashboard';
  watch();
  await refresh();
}
async function endSimulation() {
  if (!localSimulation) return;
  unsubscribe();
  localSimulation.dispose();
  localSimulation = null;
  state.simulation = null;
  Object.assign(state,liveState);
  liveState = null;
  location.hash = state.route;
  state.period = {};
  state.registries = {};
  state.dashboard = emptyDashboard();
  if (state.client) {if(state.client.live)await state.client.live.start();watch();await refresh();} else layout();
}
const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
const button = (text, action, ico = "plus", cls = "") =>
  `<button class="btn ${cls}" data-action="${action}">${icon(ico)}<span>${e(text)}</span></button>`;
const rows = (kind) => Object.values(state.registries[kind] ?? {});
const records = (kind) =>
  state.route==='history'?(state.period[kind]??[]):state.period.effective?.[kind] ?? state.period[kind] ?? [];
const name = (kind, id) =>
  recordLabel(state.registries[kind]?.[id]?.name ?? id ?? "Sem vínculo");
const writable = () => state.dataset!=='presentation'||Boolean(state.simulation);
const engineer = () => writable() && ["admin", "engineer"].includes(state.actor?.role);
const operator = () =>
  writable() && ["admin", "engineer", "operator"].includes(state.actor?.role);
const admin = () => writable() && state.actor?.role === "admin";
const services = () => state.client.services;
const journey=createProductionJourney({state,services,showModal,modal,refresh,layout,openForm});
async function recordingContext(){const selected=state.selection.recording;requireThat(selected,'CONTEXT_REQUIRED');return structuredClone(selected.productionCaseId?await services().productions.context(selected.productionCaseId):selected.context);}
function icons() {
  document.body.classList.toggle("compact-tables",readConsultation().compact);
  const account=app.querySelector(".avatar");if(account&&state.client){const words=(state.client.displayName || "Usuário").trim().split(/\s+/);account.textContent=(words[0][0]+(words.length>1?words.at(-1)[0]:'')).toUpperCase();account.title=state.client.displayName;}
  app.querySelector(".rail")?.classList.toggle("open", Boolean(state.menuOpen));
  const scrim=app.querySelector('.rail-scrim');if(scrim)scrim.hidden=!state.menuOpen;
  app
    .querySelector("[data-action=menu]")
    ?.setAttribute("aria-expanded", String(Boolean(state.menuOpen)));
  const exit = app.querySelector("[data-action=logout]");
  if (exit && !state.client) {
    exit.dataset.action = "connect";
    exit.title = "Conectar";
    exit.innerHTML = icon("log-in") + "<span>Conectar</span>";
  }
  const avatar = app.querySelector(".avatar");
  if (avatar && !state.client) {
    avatar.textContent = "?";
    avatar.dataset.action = "connect";
    avatar.removeAttribute("href");
  }
  globalThis.lucide?.createIcons();
}
function connectionStatus() {
  const el = document.querySelector(".connection");
  if (el)
    el.innerHTML = `<span class="dot ${!state.client ? "neutral" : !state.connected ? "offline" : ""}"></span>${!state.client ? "Não conectado" : state.connected ? "Firebase conectado" : "Firebase desconectado"}`;
}
function toast(text) {
  const el = document.getElementById("toast");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 4000);
}
function fail(error) {
  console.error(error);
  toast(errorText(error));
}
function vlibrasFailure(error) {
  sessionStorage.setItem("msa.vlibras.error", errorText(error));
  disableVlibras();
}
function table(headers, body) {
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="Tabela de registros"><table class="data-table"><thead><tr>${headers.map((h) => `<th>${e(h)}</th>`).join("")}</tr></thead><tbody>${body || `<tr><td colspan="${headers.length}" class="empty-state">Nenhum registro neste período.</td></tr>`}</tbody></table></div>`;
}
function tabs(items, current) {
  return `<div class="tabs" role="tablist" aria-label="Tipo de registro">${items.map((id) => `<button class="tab ${id === current ? "active" : ""}" role="tab" aria-selected="${id === current}" data-tab="${id}">${e(labels[id] ?? id)}</button>`).join("")}</div>`;
}
function value(v, unit = "") {
  return `<strong${v == null ? ' class="missing-value"' : ""}>${n(v)}</strong>${v != null ? `<span>${e(unit)}</span>` : ""}`;
}
function applyQuery(query){
 state.context=structuredClone(query.context??{});if(query.fromDate)state.fromDate=query.fromDate;if(query.toDate)state.toDate=query.toDate;state.consultationShift=query.shift??'all';state.followLatest=false;state.selection.query=structuredClone(query);
}
function filters(){
 if(state.route==='tv')return '';
 if(state.route==='equipment')return `<section class="consultation-context compact-query"><details class="query-details"><summary>Período: ${date(state.fromDate)} a ${date(state.toDate)} · ${state.consultationShift==='all'?'Todos os turnos':state.consultationShift+'º turno'}</summary><form id="equipment-period-form"><div class="filterbar"><label class="field">De<input type="date" name="fromDate" value="${state.fromDate}" required></label><label class="field">Até<input type="date" name="toDate" value="${state.toDate}" required></label><label class="field">Turno<select name="shift">${[['all','Todos'],['1','1º turno'],['2','2º turno'],['3','3º turno']].map(([v,l])=>`<option value="${v}" ${state.consultationShift===v?'selected':''}>${l}</option>`).join('')}</select></label><button class="btn primary" type="submit">Aplicar período</button></div></form></details></section>`;

 const options=(kind,selected,filter=()=>true,all=false)=>`${all?'<option value="">Todos os produtos</option>':''}${rows(kind).filter(r=>r.active&&filter(r)).map(r=>`<option value="${e(r.id)}" ${r.id===selected?'selected':''}>${e(r.name)}</option>`).join('')}`;
 return `${productionContextCard({recording:state.selection.recording,catalog:state.registries,cases:state.productionCases,editable:Boolean(state.client),route:state.route})}${state.draft?'<div class="context-notice"><span>Rascunho de '+e({collection:'coleta',loss:'perda',production:'produção',stoppage:'parada'}[state.draft.kind]??'registro')+' preservado no contexto original.</span><button class="btn" data-action="resume-draft">Continuar rascunho</button></div>':''}${state.lastSaved?'<div class="context-notice" role="status"><span>Registro confirmado: '+e(state.lastSaved.record.id)+' · '+date(state.lastSaved.record.occurredAt??state.lastSaved.record.startedAt,true)+'</span><button class="btn" data-action="saved-summary">Ver no resumo</button><button class="btn" data-action="saved-history">Ver no histórico</button></div>':''}<section class="consultation-context compact-query"><div class="section-heading"><div><span class="context-eyebrow">Consultar</span><p>${e(name('machines',state.context.machineId))} · ${state.context.productId?e(name('products',state.context.productId)):'Todos os produtos'} · ${date(state.fromDate)} a ${date(state.toDate)} · ${state.consultationShift==='all'?'Todos os turnos':state.consultationShift+'º turno'}</p></div>${state.client?.defaultSelection?button('Último período concluído','latest-period','calendar'):''}</div><details class="query-details"><summary>Filtros da consulta</summary><p class="source-notes">Estes filtros alteram os resultados consultados. Registrar em conserva a produção escolhida. O dia operacional vai das 7h às 7h do dia seguinte.</p><form id="query-form"><div class="filterbar"><label class="context-field">Máquina<select name="machineId" data-query-catalog="machine">${options('machines',state.context.machineId)}</select></label><label class="context-field">Processo<select name="processId" data-query-catalog="process">${options('processes',state.context.processId,r=>r.machineId===state.context.machineId)}</select></label><label class="context-field">Produto<select name="productId">${options('products',state.context.productId,r=>r.processIds?.[state.context.processId],true)}</select></label><label class="context-field">Turno<select name="shift">${[['all','Todos'],['1','1º · 07–15'],['2','2º · 15–23'],['3','3º · 23–07']].map(([v,l])=>`<option value="${v}" ${state.consultationShift===v?'selected':''}>${l}</option>`).join('')}</select></label><label class="context-field">De<input type="date" name="fromDate" value="${state.fromDate}" required></label><label class="context-field">Até<input type="date" name="toDate" value="${state.toDate}" required></label></div><div class="context-extra form-grid">${[['order','OP'],['lot','Lote'],['recipe','Configuração (ID)']].map(([key,label])=>`<label class="field">${label}<input name="${key}" value="${e(state.context[key]??'')}" placeholder="Todos" maxlength="100"></label>`).join('')}</div><div class="operation-toolbar"><button class="btn primary" type="submit">Aplicar filtros</button><button class="btn" type="button" data-action="clear-query">Limpar filtros</button></div></form></details></section>`;
}
function login(error = state.loginError) {
  if(location.hash!=='#login'){
    state.returnRoute=location.hash.slice(1)||state.returnRoute;
    history.replaceState(null,'',location.pathname+location.search+'#login');
  }
  document.body.classList.remove('tv-active','nhpl-active','modal-open');
  const previous = app.querySelector('#login');
  const fields = previous ? new FormData(previous) : null;
  clearCharts();
  app.innerHTML = `<main class="login-view" id="content" tabindex="-1">
    <section class="login-brand" aria-label="MSA do Brasil">
      <img class="login-photo" src="./assets/msa/msaphoto.webp" width="1360" height="907" alt="" fetchpriority="high">
      <img class="login-logo" src="./assets/msa/msa-logo-full.png" width="199" height="95" alt="MSA The Safety Company">
    </section>
    <section class="login-main">
      <form id="login" class="login-form" aria-busy="${state.signingIn}">
        <h1>Acesse sua conta</h1>
        <p class="login-caption">Use seu RE e senha para entrar.</p>
        <label class="field" for="login-re">RE<input id="login-re" name="re" type="text" value="${e(fields?.get('re')??'')}" placeholder="Seu RE" required pattern="[0-9]{5}" maxlength="5" inputmode="numeric" autocomplete="username" autocapitalize="none" spellcheck="false" aria-describedby="login-error" ${state.signingIn?'readonly':''}></label>
        <label class="field" for="login-password">Senha<div class="password-field"><input id="login-password" name="password" type="password" value="${e(fields?.get('password')??'')}" placeholder="Sua senha" required autocomplete="current-password" aria-describedby="login-error" ${state.signingIn?'readonly':''}><button class="icon-btn" type="button" data-action="password" aria-label="Mostrar senha" aria-pressed="false">${icon('eye')}</button></div></label>
        <p class="login-error" id="login-error" role="alert">${e(error)}</p>
        <button class="btn primary wide" type="submit" ${state.signingIn?'disabled':''}><span>${state.signingIn?'Entrando…':'Entrar'}</span>${icon('arrow-right')}</button>
      </form>
    </section>
  </main>`;
  icons();
  app.querySelector('#login').addEventListener('submit', async event => {
    event.preventDefault();
    if (state.signingIn) return;
    const form = event.currentTarget, data = new FormData(form), submit = form.querySelector('[type=submit]');
    state.signingIn = true;
    state.loginError = '';
    form.setAttribute('aria-busy', 'true');
    form.querySelector('.login-error').textContent = '';
    submit.disabled = true;
    submit.querySelector('span').textContent = 'Entrando…';
    form.querySelectorAll('input').forEach(input=>input.readOnly=true);
    app.querySelectorAll('[data-action=simulate]').forEach(button=>button.disabled=true);
    try {
      const result = await getCloud().auth.signIn(data.get('re').trim(), data.get('password'));
      await enterCloud(result.user);
    } catch (error) {
      state.loginError = errorText(error);
      form.querySelector('.login-error').textContent = state.loginError;
      form.querySelector('[name=password]').setAttribute('aria-invalid','true');
    } finally {
      state.signingIn = false;
      form.setAttribute('aria-busy','false');
      submit.disabled = false;
      submit.querySelector('span').textContent = 'Entrar';
      form.querySelectorAll('input').forEach(input=>input.readOnly=false);
      app.querySelectorAll('[data-action=simulate]').forEach(button=>button.disabled=false);
    }
  });
}
function accountMarkup() {
  const displayName=state.client?.displayName || 'Usuário';
  const role={admin:'Administrador',engineer:'Engenharia',operator:'Operação',viewer:'Consulta'}[state.actor?.role] || '';
  return `<div class="account"><button type="button" class="avatar" data-action="profile" aria-label="Abrir menu da conta" aria-expanded="${state.accountOpen}" aria-controls="account-popover">AD</button><div id="account-popover" class="account-popover" ${state.accountOpen?'':'hidden'} aria-label="Conta do usuário"><strong>${e(displayName)}</strong><p>${state.client?.re?'RE '+e(state.client.re):'Consulta NHPL'}</p><p>${e(role)}</p><div class="account-actions"><a class="btn" href="#settings">${icon('settings')}<span>Configurações da conta</span></a>${button(state.simulation?'Sair da simulação':state.client?.email?'Sair':'Entrar com RE',state.client?.email||state.simulation?'logout':'connect','log-in')}</div></div></div>`;
}
function closeAccount({restoreFocus=false}={}) {
  state.accountOpen=false;
  const popover=app.querySelector('#account-popover'),trigger=app.querySelector('[data-action=profile]');
  if(!popover || popover.hidden) return;
  popover.hidden=true;trigger?.setAttribute('aria-expanded','false');
  if(restoreFocus) trigger?.focus();
}
function layout({background=false}={}) {
  document.body.dataset.access=state.actor?.role??'viewer';
  document.body.classList.toggle('nhpl-active',state.context.machineId==='nhpl');
  document.body.classList.toggle('tv-active',state.route==='tv');
  const destination=resolveWorkspaceRoute({route:state.route,tab:state.route==='operations'?state.tab.operations:undefined,role:state.actor?.role});state.route=destination.route;if(destination.tab)state.pageTabs[state.route]=destination.tab;
  const navigation=allNavigation.filter(([id])=>visibleNavigation(state.actor?.role).includes(id)||['production','stoppages','quality'].includes(id));
  if (!state.client && state.signingIn && app.querySelector('#login')) return;
  if (!state.client) return login();
  if(!background)clearCharts();
  const route = [...navigation.map(([id]) => id), "settings", "capture", "tv"].includes(
    state.route,
  )
    ? state.route
    : "dashboard";
  state.route = route;
  const markup = `<aside class="rail" aria-label="Menu principal"><a class="rail-logo" href="#dashboard" aria-label="MSA · Página inicial"><img class="workspace-logo" src="./assets/msa/msalogo.png" width="540" height="178" alt="MSA"></a><nav>${groupedNavigation(navigation,([id,ico,label])=>`<a href="#${id}" title="${label}" class="rail-link ${route===id?"active":""}" ${route===id?'aria-current="page"':""}>${icon(ico)}<span>${label}</span></a>`)}</nav><div class="rail-bottom"><a href="#settings" class="rail-link ${route === "settings" ? "active" : ""}" title="Configurações">${icon("settings")}<span>Configurações</span></a></div></aside><button class="rail-scrim" data-action="menu-close" aria-label="Fechar menu" hidden></button><div class="shell"><header class="topbar"><div class="workspace-brand"><button class="icon-btn mobile-menu" data-action="menu" aria-label="Abrir menu">${icon("menu")}</button><span class="workspace-title">Produção e engenharia</span></div><div class="top-tools"><a href="#engineering" class="icon-btn" title="Análises" aria-label="Análises">${icon("bell")}</a>${accountMarkup()}</div></header><main class="content" id="content" tabindex="-1"><div class="page-heading"><div><h1>${labels[route]}</h1><p>${e(pagePurposes[route]??"")}</p></div><div class="page-actions">${state.client && state.context.productId && !['settings','registry','cep','reports','equipment'].includes(route) && !(route==='operations'&&state.tab.operations==='hourly') ? button("Exportar", "export", "download", "export") : ""}${operator() && route === "parameters" ? button("Nova coleta", "form:collection", "plus", "primary") : ""}</div></div>${!["settings", "registry"].includes(route) ? filters() : ""}${!state.client ? `<div class="context-notice">${button("Conectar ao Firebase", "connect", "log-in")}<span>Entre para consultar e registrar os dados.</span></div>` : ""}${state.error ? `<div class="error-band" role="alert">${e(errorText(state.error))}${button("Atualizar", "refresh", "refresh-cw")}</div>` : ""}${state.simulation ? `<div class="simulation-notice"><span><strong>Simulação local</strong> · ${e(simulationCases.find(c=>c.id===state.simulation)?.name)}. Alterações não vão para o Firebase.</span>${button("Voltar aos registros", "end-simulation", "arrow-left")}</div>` : ""}${state.pendingReturn?button("Voltar à consulta anterior","pending-back","arrow-left"):""}<div id="page">${page()}</div></main></div>${state.loading ? '<div class="loading-line" aria-label="Carregando"></div>' : ""}`;
  if(background)patchSnapshot(app,markup);else app.innerHTML=markup;
  icons();
  const period = document.getElementById("period");
  connectionStatus();
  if(period){const days=(dateWindow(state.fromDate,state.toDate).to-dateWindow(state.fromDate,state.toDate).from)/86400000;period.value=state.toDate===today()&&[1,7,14,30].includes(days)?String(days):'custom';}
  drawPageCharts();
}
function page() {
  if(state.route==='reports')return reportsPage(state);
  if(state.route==='equipment')return equipmentPage({state});
  if(state.route==='production')return productionPage({state,renderers:{summary:()=>state.period.plans?.some(p=>p.context.machineId===state.context.machineId)?productivityMarkup(state):hourlyPage(state),planning:()=>planningMarkup(state),records:kind=>operations({kind,showTabs:false}),times:manualTimes,occurrences:()=>occurrencesMarkup(state)}});
  if(state.route==='stoppages')return stoppagesPage({state,renderers:{reliability:()=>reliabilityMarkup(technicalView(state)),classification:()=>stopsTechnicalMarkup(state),records:(kind,open)=>operations({kind,showTabs:false,openOnly:open})}});
  if(state.route==='quality')return qualityPage({state,renderers:{records:kind=>operations({kind,showTabs:false}),inspections:()=>inspectionsMarkup(state)}});
  if(state.route==='indicators')return reliabilityMarkup(technicalView(state))+ `<div class="table-tools"><h2>Acompanhamento do processo</h2><a class="btn" href="#tv">${icon('monitor')}Abrir painel TV</a></div>`+technicalMarkup(state)+stopsTechnicalMarkup(state);
  if(state.route==='capture')return captureMarkup(state);
  if(state.route==='tv')return `<section class="tv-heading"><img src="./assets/msa/msalogo.png" width="108" alt="MSA"><h2>${e(name('machines',state.context.machineId))} · ${e(name('processes',state.context.processId))}</h2><p>${e(name('products',state.context.productId))} · OP ${e(state.context.order??'')} · turno ${e(state.consultationShift==='all'?'Todos':state.consultationShift)}</p><p>Período ${date(state.fromDate)} a ${date(state.toDate)} · consulta ${date(state.asOf??Date.now(),true)}</p><div>${button(document.fullscreenElement?'Sair da tela cheia':'Tela cheia','tv-fullscreen',document.fullscreenElement?'minimize':'maximize')}${button('Voltar ao painel','tv-back','arrow-left')}</div></section>${reliabilityMarkup(technicalView(state))}${captureMarkup(state,{compact:true})}${productivityMarkup(state,{compact:true})}${technicalMarkup(state,{compact:true})}`;
  if(state.route==='planning')return planningMarkup(state);
  if (state.route === "settings") return settings()+dataManagement();
  if (state.route === "registry") return registry();
  if (state.route === "dashboard") return dashboard();
  if (state.route === "cep") return cepPage(state);
  if (state.route === "parameters") return parameters();
  if (!state.context.processId)
    return `<div class="empty-state"><h2>Workspace sem contexto de produção</h2><p>Máquinas, processos e produtos ainda não foram cadastrados.</p><a class="btn" href="#registry">Cadastros</a></div>`;
  if (state.route === "engineering") return engineering();
  return operations();
}
function metric(title, v, unit, note, ico, highlight = false) {
  return `<article class="metric ${highlight ? "highlight" : ""}"><div class="metric-title">${title}${icon(ico)}</div><div class="metric-value">${value(v, unit)}</div><p class="metric-note">${e(note)}</p></article>`;
}
function dashboard() {
  if(state.context.machineId==='nhpl'||state.period.plans?.some(p=>p.context.machineId===state.context.machineId)){
    const queue=records('reviews').filter(r=>['waiting','analyzing'].includes(r.state));
    return overviewMarkup({state,metrics:technicalView(state),productivity:productivityView(state),pending:state.pending??{open:[],checks:[],complete:false},renderers:{charts:dashboardCharts,detail:()=>productivityMarkup(state,{actions:false})+technicalMarkup(state,{compact:true}),parameters:()=>`<section class="data-section"><div class="section-heading"><h2>Parâmetros do processo</h2><a href="#parameters" class="btn">Ver todos</a></div>${parameterTable((state.dashboard.parameters??[]).slice(0,5))}</section>`,queue:()=>`<section class="data-section"><div class="section-heading"><h2>Fila técnica · ${queue.length} análises</h2><a href="#engineering" class="btn">Ver todos</a></div>${table(['Escopo','Situação','Ação'],queue.slice(0,5).map(r=>`<tr><td>${e(r.scope)}</td><td>${badge(r.state)}</td><td><button class="btn" data-detail="reviews:${e(r.id)}">Detalhes</button></td></tr>`).join(''))}</section>`}});
  }
  const d = state.dashboard,
    t = d?.totals ?? {},
    params = d?.parameters ?? [],
    queue = records("reviews").filter((r) =>
      ["waiting", "analyzing"].includes(r.state),
    );
  return `<div class="metrics">${metric("Produção bruta", t.grossPieces, "peças", `Peças boas: ${n(t.goodPieces)}`, "package-check", true)}${metric("Tempo de parada", t.stopMinutes, "min", t.openStoppages == null ? "Sem registros de parada" : `${t.openStoppages} parada(s) em aberto`, "timer")}${metric("Refugo", t.rejectPercent, "%", `${n(t.rejectedPieces)} peças refugadas`, "circle-alert")}${metric("Fila da Engenharia", state.context.productId ? queue.length : null, "análises", "Aguardando análise ou em análise", "shield-check")}</div>${targetAlerts(d)}<div class="dashboard-charts"><section class="data-section"><div class="section-heading"><div><h2>Produção por dia</h2><p>Peças brutas e peças boas</p></div></div>${records("production").length ? '<div class="chart-frame"><canvas id="production-chart" aria-label="Produção por dia" role="img"></canvas></div>' : '<div class="chart-empty">Sem apontamentos de produção</div>'}</section><section class="data-section"><div class="section-heading"><div><h2>Principais paradas</h2><p>Duração por motivo · minutos</p></div></div>${d?.reasonRanking.stopMinutes.length ? '<div class="chart-frame"><canvas id="stop-chart" aria-label="Duração por motivo" role="img"></canvas></div>' : '<div class="chart-empty">Sem paradas encerradas</div>'}</section></div><section class="data-section"><div class="section-heading"><div><h2>Aquecimento</h2><p>Zonas Z1 a Z21</p></div><a href="#parameters" class="link-btn">Todos os parâmetros ${icon("arrow-up-right")}</a></div><div class="zones">${params
    .filter((p) => p.group === "heating")
    .map(
      (p, i) =>
        `<button class="zone ${p.state === "within" ? "good" : p.state === "outside" ? "bad" : p.state === "pending" ? "warn" : "neutral"}" data-parameter="${e(p.code)}" title="${e(p.name)}"><div class="zone-top"><span>Z${i + 1}</span>${icon("thermometer")}</div><div class="zone-value">${value(p.latest?.value, p.latest?.unit ?? p.unit)}</div><div class="zone-footer">${badge(p.state)}</div><span class="zone-line"></span></button>`,
    )
    .join(
      "",
    )}</div></section><div class="dashboard-bottom section-divider"><section class="data-section"><div class="section-heading"><h2>Parâmetros do processo</h2><a href="#parameters" class="link-btn">Ver todos ${icon("arrow-up-right")}</a></div><div class="process-parameters">${parameterTable(params.filter((p) => p.group !== "heating").sort((a, b) => (a.state === "within") - (b.state === "within")))}</div></section><section class="data-section"><div class="section-heading"><h2>Engenharia</h2><a href="#engineering" class="link-btn">Abrir fila ${icon("arrow-up-right")}</a></div>${table(
    ["Coleta", "Situação"],
    queue
      .slice(0, 6)
      .map(
        (r) =>
          `<tr><td><button class="link-btn" data-detail="reviews:${e(r.id)}">${date(r.eventDate)} ${icon("arrow-up-right")}</button><div class="small muted">${e(r.scope)}</div></td><td>${badge(r.state)}</td></tr>`,
      )
      .join(""),
  )}</section></div>${d?.notes?.includes('overlapping-reasons')?'<p class="source-notes" role="status">Há paradas sobrepostas. O total usa união por máquina; o gráfico por motivo pode somar mais minutos porque preserva cada ocorrência.</p>':''}${state.context.productId && d && !d.complete ? '<p class="source-notes">Dados parciais. Indicadores dependentes de cobertura completa estão indisponíveis.</p>' : ""}`;
}
function targetAlerts(dashboard) {
  const alerts=(dashboard?.alerts??[]).filter(a=>a.kind==='target');
  if(!alerts.length)return '';
  const units={pieces:'peças',minutes:'min',kg:'kg'};
  return `<section class="data-section"><div class="section-heading"><h2>Metas fora do esperado</h2></div>${table(['Meta','Valor no período','Referência','Situação'],alerts.map(a=>`<tr><td>${e(name('targets',a.targetId))}</td><td>${n(a.value)} ${e(units[a.unit]??a.unit)}</td><td>${a.operator==='upper'?'Máximo':'Mínimo'} ${n(a.threshold)} ${e(units[a.unit]??a.unit)}</td><td>${badge('outside')}</td></tr>`).join(''))}</section>`;
}
function statisticsReason(reason) {
  return {'zero-dispersion':'Leituras sem variação. Cp/Cpk indisponíveis; isso não comprova capacidade.','insufficient-data':'Amostra insuficiente para estimar dispersão e capacidade.','unapproved-limit':'Limite ainda não aprovado. Cp/Cpk indisponíveis.','bilateral-limit-required':'Cp/Cpk exigem limites bilaterais válidos.','invalid-limit':'Limite inválido para calcular capacidade.'}[reason]??'';
}
function parameterTable(params) {
  return table(
    ["Parâmetro", "Última leitura / horário", "Referência / tolerância", "Situação"],
    params
      .map(
        (p) =>
          `<tr><td><button class="link-btn" data-parameter="${e(p.code)}">${e(p.name)}</button></td><td class="mono">${n(p.latest?.value)} ${e(p.latest?.value != null ? p.latest.unit : "")}<div class="small muted">${p.latest?date(p.latest.occurredAt??p.latest.eventDate,p.latest.occurredAt!=null):'Sem leitura no período'}</div></td><td class="muted">${e(ruleText(p.latest?.rule, p.latest?.unit))}${p.latest&&state.registries.recipeVersions?.[p.latest.context?.recipe]?.settings?.[p.code]!=null?'<div class="small">Nominal da configuração: '+n(state.registries.recipeVersions[p.latest.context.recipe].settings[p.code])+' '+e(p.latest.unit??p.unit)+'</div>':''}${p.state==='pending'?'<div class="small">Tolerância pendente de aprovação; leitura sem avaliação de conformidade.</div>':''}</td><td>${badge(p.state)}</td></tr>`,
      )
      .join(""),
  );
}
function parameters() {
  return parametersPage({state,parameterTable,icon});
}
function operations({kind:requestedKind,showTabs=true,openOnly=false}={}) {
  const history = state.route === "history",
    kind = requestedKind??(history ? state.tab.history : state.tab.operations),
    list = recordsInPeriod(kind,records(kind),state.operationalQuery?.range??dateWindow(state.fromDate,state.toDate)).filter(r=>!openOnly||r.endedAt==null);
  if(kind==='occurrences')return tabs(['production','stoppages','losses','hourly','occurrences'],kind)+occurrencesMarkup(state);
  if(kind==='hourly')return `${tabs(["production","stoppages","losses","hourly","occurrences"],kind)}${state.period.plans?.some(p=>p.context.machineId===state.context.machineId)?productivityMarkup(state):hourlyPage(state)}`;
  const actions = {
    production: "production",
    stoppages: "stoppage",
    losses: "loss",
  };
  return `${showTabs?(history ? tabs(kinds, kind) : tabs(["production", "stoppages", "losses", "hourly","occurrences"], kind)):""}${!history?operationSummary(kind):''}<div class="table-tools"><span class="small muted">${list.length} registros · ${labels[kind]}</span><div class="toolbar-right">${history && kind==='collections' && operator() ? button('Importar CSV','csv-import','upload') : ''}${!history && operator() ? button({production:'Registrar produção',stoppages:'Registrar parada',losses:'Registrar refugo / perda'}[kind], `form:${actions[kind]}`, "plus", "primary") : ""}</div></div>${table(
    ["Data", "Registro", "Informação", "Ações"],
    list
      .slice()
      .sort((a, b) => b.eventDate.localeCompare(a.eventDate)||(b.occurredAt??b.startedAt??0)-(a.occurredAt??a.startedAt??0))
      .map(
        (r) =>
          `<tr><td>${date(r.occurredAt ?? r.startedAt ?? r.eventDate, r.occurredAt != null || r.startedAt != null)}</td><td>${e(labels[kind])}<div class="small muted">${e(r.id.slice(0, 10))}</div>${recordContextMarkup(r,state.registries)}</td><td>${recordSummary(kind, r)}<div class="small muted">${e(r.createdBy??'Autor não informado')}${r.origin&&r.origin!=='demo'?' · '+e(r.origin):''}${r.correctionId?' · Corrigido':r.revisionConflict?' · Revisão conflitante':''}</div></td><td><button class="icon-btn" title="Detalhes" aria-label="Detalhes" data-detail="${kind}:${e(r.id)}">${icon("arrow-up-right")}</button>${kind === "stoppages" && r.endedAt == null && operator() ? button("Encerrar", `close:${r.id}`, "square") : ""}${kind === "collections" && operator() ? button("Enviar à Engenharia", `review:${r.id}`, "send") : ""}</td></tr>`,
      )
      .join(""),
  )}`;
}
function dashboardCharts(){return `<div class="production-charts"><section class="data-section"><h2>Plano e produção por intervalo</h2><div class="chart-frame"><canvas id="nhpl-interval-chart" role="img" aria-label="Plano, mínimo da meta e produção por intervalo"></canvas></div></section><section class="data-section"><h2>Produção acumulada</h2><div class="chart-frame"><canvas id="nhpl-accumulated-chart" role="img" aria-label="Plano e produção acumulada nos intervalos consultados"></canvas></div></section></div>`;}
function operationSummary(kind){
 const range=state.operationalQuery?.range??dateWindow(state.fromDate,state.toDate),losses=state.period.effective?.losses??recordsInPeriod('losses',records('losses'),range),production=state.period.effective?.production??recordsInPeriod('production',records('production'),range);
 const sum=(list,key)=>list.length?n(list.reduce((total,r)=>total+r[key],0)):'Nenhum apontamento';
 const rejects=losses.filter(r=>r.kind==='reject'&&r.unit==='pieces'),waste=losses.filter(r=>r.unit==='kg');
 if(kind==='production')return `<section class="data-section"><div class="metrics">${[['Produção bruta',sum(production.filter(r=>r.basis==='gross'),'quantity'),'peças'],['Peças boas registradas',sum(production.filter(r=>r.basis==='good'),'quantity'),'peças'],['Refugos registrados',sum(rejects,'amount'),'peças'],['Perdas de material',sum(waste,'amount'),'kg']].map(([label,total,unit])=>`<div class="metric"><div class="metric-title">${label}</div><div class="metric-value">${total}</div><p>${unit}</p></div>`).join('')}</div>${operator()?button('Registrar refugo / perda','form:loss','circle-minus'):''}</section>`;
 if(kind==='stoppages'){
  const stops=recordsInPeriod('stoppages',records('stoppages'),range),closed=stops.filter(r=>r.endedAt!=null),metrics=technicalView(state);
  return `<section class="data-section"><div class="metrics"><div class="metric"><div class="metric-title">Paradas abertas</div><div class="metric-value">${stops.filter(r=>r.endedAt==null).length}</div></div><div class="metric"><div class="metric-title">Duração encerrada no recorte</div><div class="metric-value">${n(state.dashboard?.totals?.stopMinutes)}</div><p>minutos em união por máquina · ${closed.length} registros encerrados</p></div><div class="metric"><div class="metric-title">Microparadas</div><div class="metric-value">${n(metrics.microCount)}</div><p>${n(metrics.microSeconds)} s em união temporal · limiar da referência técnica</p></div></div></section>`;
 }
 return '';
}
function manualTimes(){
 const runs=new Map(),range=state.operationalQuery?.range??dateWindow(state.fromDate,state.toDate);
 for(const r of state.period.runs??[])if(Object.entries(state.context).every(([k,v])=>!v||r.context?.[k]===v)&&r.machineStartedAt<range.to&&(r.machineEndedAt==null||r.machineEndedAt>range.from))runs.set(r.runId,r);
 return `<section class="data-section"><div class="section-heading"><h2>Horários da operação</h2>${operator()?button('Registrar horários','nhpl:run','clock'):''}</div>${table(['OP / lote / turno','Horários registrados','Ação'],[...runs.values()].map(r=>`<tr><td>${e(r.context.order)} / ${e(r.context.lot)} / ${e(r.context.shift)}</td><td>${[['machineStartedAt','Máquina ligada'],['productionStartedAt','Produção iniciada'],['productionEndedAt','Produção encerrada'],['machineEndedAt','Máquina desligada']].map(([k,label])=>`<div>${label}: ${r[k]==null?'Pendente':date(r[k],true)}</div>`).join('')}</td><td>${operator()&&r.machineEndedAt==null?button('Completar horários','nhpl:advance-run:'+r.runId,'clock'):''}</td></tr>`).join(''))}</section>`;
}
function recordSummary(kind, r) {
  if (kind === "production")
    return `${n(r.quantity)} peças · ${r.basis === "gross" ? "Bruta" : "Boas"}`;
  if (kind === "losses")
    return `${n(r.amount)} ${r.unit === "pieces" ? "peças" : "kg"} · ${e(name("reasons", r.reasonId))}`;
  if (kind === "stoppages")
    return `${r.endedAt == null ? "Em aberto" : `${n((r.endedAt - r.startedAt) / 60000)} min`} · ${e(name("reasons", r.reasonId))}${stopClassificationMarkup(state,r)}`;
  if (kind === "collections")
    return `${Object.values(r.readings ?? {}).length} leituras`;
  return badge(r.state);
}
function engineering() {
  const kind = state.tab.engineering;
  if(kind==='occurrences')return tabs(["reviews","corrections","occurrences"],kind)+occurrencesMarkup(state);
  return `${tabs(["reviews", "corrections", "occurrences"], kind)}${table(
    ["Data", "Escopo / motivo", "Situação", "Ação"],
    records(kind)
      .map(
        (r) =>
          `<tr><td>${date(r.eventDate)}</td><td><button class="link-btn" data-detail="${kind}:${e(r.id)}">${e(r.scope ?? r.reason)}</button></td><td>${badge(r.state)}</td><td><button class="icon-btn" title="Detalhes e histórico" aria-label="Detalhes e histórico" data-detail="${kind}:${e(r.id)}">${icon('history')}</button>${engineer() && kind === "reviews" && r.state === "waiting" ? button("Iniciar", `start:${r.id}`, "play") : engineer() && kind === "reviews" && r.state === "analyzing" ? button("Decidir", `decide:${r.id}`, "check") : kind === "corrections" && engineer() && r.state === "waiting" && r.createdBy !== state.actor.uid ? button("Decidir", `correction:${r.id}`, "check") : `<span class="small muted">${r.state==='waiting'&&r.createdBy===state.actor?.uid?'Aguardando outro responsável':r.state==='approved'||r.state==='rejected'?'Concluído':'Aguardando equipe técnica'}</span>`}${kind==='reviews'&&engineer()?button('Evidências',`tech:evidence:${r.id}`,'clipboard-check')+button('Nova análise',`review:${r.collectionId}`,'plus'):''}</td></tr>`,
      )
      .join(""),
  )}<div class="operation-toolbar">${operator()?button('Nova análise','new-review','plus'):''}</div><p class="source-notes">Liderança, Supervisão e times técnicos autorizados revisam os dados. Não há liberação física automática. Correções exigem outro responsável.</p>${kind==='corrections'&&records(kind).some(r=>r.state==='waiting'&&r.createdBy===state.actor?.uid)?'<p class="source-notes">Suas propostas aguardam outra pessoa da Engenharia ou da administração. O autor não pode aprovar a própria correção.</p>':''}`;
}
function registryReference(record) {
  const links = record.machineId ? `Máquina: ${name('machines',record.machineId)}` : record.processId ? `Processo: ${name('processes',record.processId)}` : record.processIds ? `Processos: ${Object.keys(record.processIds).filter(id=>record.processIds[id]).map(id=>name('processes',id)).join(', ')}` : '';
  return `${e(record.code ?? record.metric ?? '')}${links ? `<div class="registry-binding">${e(links)}</div>` : ''}${state.tab.registry==='parameters'?parameterReferenceSummary(record.id):''}`;
}
function parameterReferenceSummary(parameterId){
 const refs=parameterReferences(state.registries,parameterId);
 return `<div class="small muted">Limite atual aprovado: ${e(refs.approved?ruleText(refs.approved.rule,refs.approved.unit):'Não definido')}</div>${refs.latest?.status==='draft'?`<div class="small">Rascunho salvo: ${e(ruleText(refs.latest.rule,refs.latest.unit))}</div>`:''}`;
}
function registry() {
  const kind = state.tab.registry,
    form = {
      machines: "registry-machine",
      processes: "registry-process",
      products: "registry-product",
      parameters: "registry-parameter",
      reasons: "registry-reason",
      targets: "target",
    }[kind];
  return `<div class="section-heading"><h2>Cadastros de produção</h2>${admin()?button('Cadastrar piloto NHPL','nhpl:install','factory'):''}</div>${tabs(["machines", "processes", "products", "parameters", "reasons", "targets"], kind)}<div class="table-tools"><span class="small muted">${rows(kind).length} cadastros</span><div class="toolbar-right">${engineer() ? button("Novo cadastro", `form:${form}`, "plus", "primary") : ""}${kind === "parameters" && admin() && state.context.processId && state.context.machineId!=='nhpl' ? button("Cadastrar referências", "catalog", "list-plus") : ""}</div></div>${table(
    ["Nome", "Código / vínculo", "Situação", "Ações"],
    rows(kind)
      .map(
        (r) =>
          `<tr><td>${e(r.name)}</td><td>${registryReference(r)}</td><td><span class="badge ${r.active ? "good" : "neutral"}">${r.active ? "Ativo" : "Inativo"}</span></td><td>${kind === "parameters" && engineer() ? button("Limites", `version:${r.id}`, "sliders-horizontal") : ""}${kind==="targets"&&engineer()?button("Revisar",`nhpl:revise-target:${r.id}`,"pencil"):""}${engineer()?button('Editar',`registry-edit:${kind}:${r.id}`,'pencil'):''}${engineer() ? `<button class="icon-btn" title="${r.active ? "Inativar" : "Ativar"}" aria-label="${r.active ? "Inativar" : "Ativar"}" data-action="active:${kind}:${e(r.id)}">${icon(r.active ? "archive" : "archive-restore")}</button>` : ""}</td></tr>`,
      )
      .join(""),
  )}`;
}
function installCatalog() {
  if (!state.context.processId) {
    toast("Cadastre e selecione um processo primeiro.");
    return;
  }
  const catalog = getMsaParameterCatalog();
  showModal(
    "Cadastrar parâmetros de referência",
    `<p class="source-notes">${e(name("processes", state.context.processId))} · Limites serão salvos como rascunhos. Nenhuma leitura será criada.</p><div class="form-grid">${catalog.map((p) => `<label class="field">${e(p.name)}<select name="nature_${e(p.code)}" required><option value="">Natureza</option><option value="measurement">Medição</option><option value="setpoint">Setpoint</option></select></label>`).join("")}</div>`,
    {
      wide: true,
      footer: "Cadastrar referências",
      submit: (data) =>
        services().catalog.install({
          processId: state.context.processId,
          natureByCode: Object.fromEntries(
            catalog.map((p) => [p.code, data.get(`nature_${p.code}`)]),
          ),
          confirmed: true,
        }),
    },
  );
}
function settings(){const prefs=readPreferences(),view=readConsultation(),connected=Boolean(state.client?.email)&&!state.simulation;return `<section class="settings-section"><h2>Perfil</h2><form id="profile-form" class="settings-form"><div class="form-grid"><label class="field">RE<input name="re" value="${e(state.client?.re??'')}" readonly></label><label class="field">Nome<input name="displayName" value="${e(state.client?.displayName??'')}" required maxlength="100" ${connected?'':'disabled'}></label><label class="field">Cargo / acesso<input value="${e({admin:'Administração / Supervisão',engineer:'Liderança / Engenharia / times técnicos',operator:'Operação',viewer:'Consulta'}[state.actor?.role]??'Sem sessão')}" readonly></label></div><div class="profile-footer">${connected?'<button class="btn" type="submit">'+icon('save')+'Salvar perfil</button>':button('Entrar com RE','connect','log-in')}</div></form><div class="setting-row"><div><h3>Senha</h3></div>${connected?button('Alterar senha','change-password','key-round'):''}</div></section><section class="settings-section"><h2>Aparência e acessibilidade</h2><div class="setting-row"><div><h3>Tema</h3></div><div class="segmented">${[['light','sun','Claro'],['dark','moon','Escuro'],['system','monitor','Sistema']].map(([id,ico,title])=>`<button data-theme-choice="${id}" class="${prefs.theme===id?'selected':''}">${icon(ico)}${title}</button>`).join('')}</div></div><div class="setting-row"><div><h3>VLibras</h3><p>Tradução em Libras</p></div><label class="switch"><input id="vlibras-toggle" type="checkbox" aria-label="Ativar VLibras" ${prefs.vlibras?'checked':''}><span class="switch-track"></span></label></div><div class="setting-row"><div><h3>Tabelas compactas</h3></div><label class="switch"><input id="compact-toggle" type="checkbox" aria-label="Tabelas compactas" ${view.compact?'checked':''}><span class="switch-track"></span></label></div></section><section class="settings-section"><h2>Verificação técnica</h2><p>17 cenários isolados para conferir comportamentos e limites.</p>${button('Simular cenário','simulate','flask-conical')}</section><section class="settings-section"><h2>Consulta</h2><div class="setting-row"><label class="field" for="default-period">Período inicial</label><select id="default-period">${[7,14,30].map(days=>`<option value="${days}" ${days===view.days?'selected':''}>Últimos ${days} dias</option>`).join('')}</select></div><div class="setting-row"><div><h3>Preferências de consulta</h3></div>${button('Restaurar','reset-consultation','rotate-ccw')}</div></section>`;}
function drawPageCharts() {
  if(state.route==='dashboard'&&(state.context.machineId==='nhpl'||state.period.plans?.some(p=>p.context.machineId===state.context.machineId))){
    const data=productionChartData(productivityView(state)),base={labels:data.labels,fullLabels:data.fullLabels,unit:'peças',beginAtZero:true};
    drawChart('nhpl-interval-chart',{...base,datasets:[{label:'Plano aprovado',data:data.planned,backgroundColor:'#8397a1',borderColor:'#8397a1'},{label:'Produção bruta registrada',data:data.gross,backgroundColor:'#238166',borderColor:'#238166'},{label:'Mínimo da meta',type:'line',data:data.minimum,borderColor:'#ba7b15',borderDash:[4,4],pointRadius:2}]});
    drawChart('nhpl-accumulated-chart',{...base,type:'line',datasets:[{label:'Plano acumulado',type:'line',data:data.accumulatedPlanned,borderColor:'#8397a1',pointRadius:2},{label:'Bruta acumulada',type:'line',data:data.accumulatedGross,borderColor:'#238166',pointRadius:2,spanGaps:false}]});return;
  }
  if(state.route==='cep'){drawCepCharts(state);return;}
  if(state.route==='production'&&state.pageTabs.production==='summary'&&state.context.machineId!=='nhpl'){drawHourlyChart(state);return;}
  if (state.route !== "dashboard") return;
  const production = records("production").filter(
    (r) =>
      r.startedAt >= dateWindow(state.fromDate, state.toDate).from &&
      r.endedAt <= dateWindow(state.fromDate, state.toDate).to,
  );
  const days = [...new Set(production.map((r) => r.eventDate))].sort();
  drawChart("production-chart", {
    labels: days.map((d) => date(d)),
    fullLabels: days.map(d=>new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(d+'T12:00:00Z'))),
    unit: 'peças',
    datasets: ["gross", "good"].map((basis) => ({
      label: basis === "gross" ? "Produção bruta" : "Peças boas",
      data: days.map((day) => {
        const list = production.filter(
          (r) => r.eventDate === day && r.basis === basis,
        );
        return list.length
          ? list.reduce((sum, r) => sum + r.quantity, 0)
          : null;
      }),
    })),
  });
  const stops = state.dashboard?.reasonRanking.stopMinutes.slice(0, 6) ?? [];
  drawChart("stop-chart", {
    horizontal: true,
    unit: 'min',
    labels: stops.map((r) => name("reasons", r.reasonId)),
    datasets: [{ label: "Minutos", data: stops.map((r) => r.value) }],
  });
}
function dataManagement(){
 const backup=['presentation','live','workspace'].includes(state.client?.mode)&&!state.simulation;
 return `<section class="settings-section"><h2>Gestão de dados</h2><div class="setting-row"><div><h3>Importação de dados</h3><p>Arquivos de eventos e conexão com pasta de coleta</p></div><a class="btn" href="#capture">${icon('upload')}Importação de dados</a></div>${backup?`<div class="setting-row"><div><h3>Cópia dos registros</h3><p>Exporta os registros, suas referências e o histórico.</p></div>${button('Exportar backup','presentation-backup','download')}</div><div class="setting-row"><div><h3>Registros locais anteriores</h3><p>Preserva uma cópia dos dados que já estavam neste navegador.</p></div>${button('Exportar arquivo local','local-archive','archive')}</div>`:''}</section>`;
}

function reconcileContext() {
  const m = rows("machines").filter((r) => r.active);
  if (!m.some((r) => r.id === state.context.machineId))
    state.context.machineId = m.find(r=>r.id==='nhpl')?.id??m[0]?.id;
  const p = rows("processes").filter(
    (r) => r.active && r.machineId === state.context.machineId,
  );
  if (!p.some((r) => r.id === state.context.processId))
    state.context.processId = p[0]?.id;
  const products = rows("products").filter(
    (r) => r.active && r.processIds?.[state.context.processId],
  );
  if (state.context.productId&&!products.some((r) => r.id === state.context.productId))
    delete state.context.productId;
}
async function refresh({background=false}={}) {
  if (!state.client) return;
  if(['presentation','live'].includes(state.client.mode)&&state.followLatest!==false)state.toDate=state.client.toDate;
  if(state.client.mode==='live'&&state.context.order===state.client.context.order)state.context.shift=state.client.context.shift;
  const ticket = ++epoch;
  state.loading = true;
  state.error = null;
  try {
    const registries = {};
    for (const root of roots)
      registries[root] = (await state.client.repo.get(root)) ?? {};
    if (ticket !== epoch) return;
    state.registries = registries;
    reconcileContext();
    if(state.hourly.date<state.fromDate||state.hourly.date>state.toDate)state.hourly.date=state.toDate;
    if (state.context.processId) {
      const asOf=state.client.live?.status().asOf??Date.now();
      const consultation={context:state.context,fromDate:state.fromDate,toDate:state.toDate,shift:state.consultationShift,dataset:state.simulation||['presentation','live'].includes(state.client.mode)?'all':state.dataset};
      state.selection.query=structuredClone(consultation);
      const view=await loadOperationalView({services:services(),repo:state.client.repo,consultation,now:asOf});
      if(ticket!==epoch)return;
      Object.assign(state,view);
      state.liveCoverage=state.client.mode==='live'?liveObservedBases(JSON.parse(state.client.exportBackup()),view.operationalQuery,asOf):null;
      state.pending=buildPending({...view,productivity:productivityView(state),consultation:view.operationalQuery.consultation,actor:state.actor});
      if(!state.simulation){const listed=await services().productions.list();if(ticket!==epoch)return;state.productionCases=listed.items;}
      if(state.route==='equipment'){const equipmentPeriod=await services().history.loadPeriod({...view.operationalQuery.query,context:{}});if(ticket!==epoch)return;state.equipmentPeriod=equipmentPeriod;const op={...view.operationalQuery,consultation:{...view.operationalQuery.consultation,context:{}},query:{...view.operationalQuery.query,context:{}}};const selected=selectOperationalPeriod(equipmentPeriod,op);state.equipmentEvents=Object.fromEntries(['collections','production','stoppages','losses'].map(kind=>[kind,selected[kind]]));}
      writeAccountConsultation(state.actor.uid,state.source,{shift:state.consultationShift,fromDate:state.fromDate,toDate:state.toDate,context:state.context,followLatest:state.followLatest,recording:state.selection.recording,packageId:state.selection.packageId,previousQuery:state.selection.previousQuery});
    } else {
      state.period = {};
      state.dashboard = emptyDashboard();
    }
  } catch (error) {
    if (ticket === epoch) state.error = error;
  } finally {
    if (ticket === epoch) {
      state.loading = false;
      layout({background});
    }
  }
}
function unsubscribe() {
  for (const off of state.offs) off();
  state.offs = [];
  clearTimeout(refreshTimer);
  epoch++;
}
function watch() {
  unsubscribe();
  if(state.client.live)state.offs.push(mountLiveControls({root:app,workspace:state.client,refresh:()=>schedule(),isEditing:()=>modal.open||document.activeElement?.matches('input,textarea,select')}));
  const schedule = () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      if (modal.open || document.activeElement?.matches('input,textarea,select')) {
        schedule();
        return;
      }
      refresh({background:state.client?.mode==='live'});
    }, 400);
  };
  state.offs.push(
    state.client.repo.watchConnection((connected) => {
      state.connected = connected;
      connectionStatus();
    }),
  );
  for (const root of [...roots, ...kinds])
    state.offs.push(state.client.repo.watch(root, null, schedule, fail));
  for(const root of ['productionPolicies','productionPlans','productionIntervals','plannedCorrections','machineRuns','targetRevisions'])state.offs.push(state.client.repo.watch(root,null,schedule,error=>{if(error.code!=='FORBIDDEN')fail(error);}));
  state.offs.push(state.client.repo.watch('technicalRecords',null,schedule,error=>{if(!['FORBIDDEN','INVALID_PATH'].includes(error.code))fail(error);}));
}
async function enterCloud(user) {
  if (localSimulation) await endSimulation();
  if (state.client?.email === user.email) return;
  if (cloudEntry) return cloudEntry;
  const sessionTicket=sessionGeneration;
  cloudEntry = (async () => {
    const services = await cloud.session.onWorkspace(workspaceId);
    let actor;
    const off = cloud.session.watchSession((next) => {
      actor = next.actor;
    });
    off();
    if(sessionTicket!==sessionGeneration||!actor)return;
    state.actor = actor;
    state.dataset='all';
    state.route=resolveRoute(location.hash==='#login'?(state.returnRoute??initialRoute(actor.role)):(location.hash.slice(1)||initialRoute(actor.role)),actor.role);
    await state.client?.dispose?.();
    const nextClient = await openWorkspaceClient({session:cloud.session,workspaceId,services,repository:cloud.repository(workspaceId)});
    nextClient.displayName=user.displayName??(user.email==='adm@adm.com'?'Fabiana Dias':user.email.split('@')[0]);
    if(sessionTicket!==sessionGeneration){await nextClient.dispose?.();return;}state.client=nextClient;
    state.source='workspace';state.consultationShift=readAccountConsultation(actor.uid,state.source).shift;
    state.client.email=user.email;
    state.client.re=Object.keys(loginAccounts).find(re=>loginAccounts[re]===user.email)??'';
    history.replaceState(null,'',location.pathname+location.search+'#'+state.route);
    state.returnRoute=null;
    restoreConsultation();
    state.selection=initialSelection({manifest:state.client.manifest,saved:readAccountConsultation(actor.uid,state.source)});
    applyQuery(state.selection.query);
    sessionStorage.setItem("msa.session.mode", "firebase");
    watch();
    await refresh();
  })();
  try {
    return await cloudEntry;
  } finally {
    cloudEntry = null;
  }
}
async function leaveWorkspace(){
  sessionGeneration++;
  stopConnector();unsubscribe();closeAccount();
  await liveState?.client?.dispose?.();liveState=null;localSimulation=null;state.simulation=null;state.menuOpen=false;
  await state.client?.dispose?.();state.client=null;state.actor=null;
  state.context={};state.selection={query:{},recording:null};state.draft=null;state.lastSaved=null;state.productionCases=[];state.registries={};state.period={};state.technical=[];
  state.dashboard=emptyDashboard();state.error=null;state.loading=false;
  state.loginError='';state.returnRoute=null;state.route='login';
  sessionStorage.removeItem('msa.session.mode');
  if(modal.open)modal.close();
  history.replaceState(null,'',location.pathname+location.search+'#login');
  layout();
}
function getCloud() {
  if (cloud) return cloud;
  cloud = createBrowserMsa();
  cloud.session.watchSession((next) => {
    if (localSimulation) {
      if (liveState?.client && !next.actor) leaveWorkspace();
      return;
    }
    if (state.client && !next.actor) {
      leaveWorkspace();
    }
  });
  authOff = cloud.auth.watchSession((user) => {
    if (user) enterCloud(user).catch(error => {state.loginError = errorText(error); if(!state.client && !state.signingIn) login();});
  }, fail);
  return cloud;
}
function showModal(
  title,
  body,
  { submit, wide = false, footer = "Salvar" } = {},
) {
  const trigger = document.activeElement;
  const modalClient=state.client;
  state.modalReturn = ['data-action','data-parameter','data-detail'].flatMap(attribute=>trigger?.hasAttribute(attribute)?[`[${attribute}="${CSS.escape(trigger.getAttribute(attribute))}"]`]:[])[0] ?? null;
  modal.className = wide ? "modal-wide" : "";
  modal.innerHTML = `<form id="modal-form"><header class="modal-head"><h2 id="modal-title">${e(title)}</h2><button class="icon-btn" type="button" data-action="close-modal" aria-label="Fechar">${icon("x")}</button></header><div class="modal-body">${body}<p class="form-error" role="alert"></p></div><footer class="modal-footer"><button class="btn" type="button" data-action="close-modal">${submit ? "Cancelar" : "Fechar"}</button>${submit ? `<button class="btn primary" type="submit">${e(footer)}</button>` : ""}</footer></form>`;
  document.body.classList.add("modal-open");
  modal.showModal();
  icons();
  if (submit)
    modal.querySelector("form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget,
        btn = form.querySelector("[type=submit]");
      if(form.dataset.submitting)return;
      form.dataset.submitting='true';
      btn.disabled = true;
      try {
        requireThat(state.client===modalClient,'STALE_SESSION');
        const saved=await submit(new FormData(form));
        if(saved?.keepOpen)return;
        if(saved?.context&&saved?.id&&saved?.eventDate)state.lastSaved={record:saved,kind:saved.readings?'collections':saved.quantity!=null?'production':saved.amount!=null?'losses':'stoppages'};
        modal.close();
        toast(saved?.successMessage??(saved?.name?`${recordLabel(saved.name)} salvo.${saved.active===true&&!saved.machineId&&!saved.processIds&&!saved.processId&&!saved.kind&&!saved.metric?' Vincule um processo e um produto para registrar coletas.':''}`:'Operação confirmada.'));
        await refresh();
      } catch (error) {
        form.querySelector(".form-error").textContent = errorText(error);
      } finally {
        delete form.dataset.submitting;
        btn.disabled = false;
      }
    });
}
async function openForm(kind, record = {},resume=false) {
  if(kind==='plannedProduction')return openPlannedForm(state.draft.header,true);
  const operational=['collection','production','loss','stoppage'].includes(kind);
  if(operational){requireThat(operator(),'FORBIDDEN');if(!state.selection.recording)return journey.choose();if(state.draft&&!resume){showModal('Continuar registro',`<p>Há um rascunho preservado. Continue a edição ou escolha outra produção para iniciar um novo registro.</p><button type="button" class="btn" data-action="resume-draft">Continuar rascunho</button><button type="button" class="btn" data-action="choose-production">Escolher produção</button>`);return;}}
  const client=state.client,selected=state.selection.recording;
  const context=structuredClone(resume?state.draft.context:operational?(selected.productionCaseId?await services().productions.context(selected.productionCaseId):selected.context):record.context??state.context);
  requireThat(state.client===client,'STALE_SESSION');
  const recordingState={...state,context,operationalQuery:null};
  if(kind==='production'){
    const row=state.productionCases.find(r=>r.id===selected.productionCaseId),period=await services().history.loadPeriod({context,fromDate:row?.operationalDate??state.fromDate,toDate:row?.endedAt?eventDate(row.endedAt-1):state.toDate,dataset:'all'});
    requireThat(state.client===client,'STALE_SESSION');recordingState.period=period;
    const available=availableProductionIntervals(recordingState);
    if(!available.length&&(context.machineId==='nhpl'||period.plans?.some(p=>p.context.machineId===context.machineId))){showModal('Registrar produção','<p>Não há intervalo aprovado aberto neste contexto. Confira o produto e o período selecionados ou prepare um plano em Planejamento.</p>');return;}
    if(available.length){showModal('Selecionar intervalo aprovado',`<label class="field">Intervalo<select name="intervalId" required>${available.map(([id,h])=>`<option value="${e(id)}">${date(h.startedAt,true)} · OP ${e(h.context.order)} · ${n(h.plannedPieces)} peças</option>`).join('')}</select></label>`,{footer:'Abrir apontamento',submit:async data=>{requireThat(state.client===client,'STALE_SESSION');modal.close();openPlannedForm({...period.intervalHeaders[data.get('intervalId')],id:data.get('intervalId')});return {keepOpen:true};}});return;}
  }
  const draft=operational?(resume?state.draft:{kind,record,context,selection:structuredClone(selected),intent:{id:crypto.randomUUID()},values:null}):null;
  if(draft)state.draft=draft;
  showModal(
    {
      collection: "Nova coleta",
      production: "Registrar produção",
      loss: "Registrar perda",
      stoppage: "Iniciar parada",
      closeStop: "Encerrar parada",
      reviewDecision: "Decisão da Engenharia",
      parameterVersion: "Nova versão de limites",
    }[kind] ?? "Novo cadastro",
    (operational?productionContextCard({recording:{...selected,context},catalog:state.registries,cases:state.productionCases})+'<p class="source-notes">Informe o horário real do registro. Uma produção encerrada não altera automaticamente o horário para o passado.</p>':'')+formMarkup(kind, {
      registries: state.registries,
      context,
      record,
      catalog: getMsaParameterCatalog().filter(item=>Object.values(state.registries.parameters??{}).some(p=>p.processId===context.processId&&p.code===item.code)),
    }),
    {
      wide: kind === "collection",
      footer:kind==='parameterVersion'?'Salvar limites':'Salvar',
      submit: async (data) => {
        requireThat(state.client===client,'STALE_SESSION');
        if(draft){if(!draft.intent.occurredAt)draft.intent.occurredAt=data.get('occurredAt')?saoPauloInstant(data.get('occurredAt'),'occurredAt'):data.get('startedAt')?saoPauloInstant(data.get('startedAt'),'startedAt'):Date.now();}
        const saved=await submitForm(kind, data, {
          services: services(),
          context,
          intent:draft?.intent,
          registries: state.registries,
          record,
        });
        if(operational){state.lastSaved={kind:{collection:'collections',production:'production',loss:'losses',stoppage:'stoppages'}[kind],record:saved};state.draft=null;}
        if(kind==='parameterVersion')return {...saved,successMessage:saved.status==='approved'?'Limites aprovados e disponíveis para novas coletas.':'Limites salvos como rascunho. Selecione Aprovado para usar nas próximas coletas.'};
        return saved;
      },
    },
  );
  if(draft){const form=modal.querySelector('form');if(!draft.values)draft.values=[...new FormData(form)];if(draft.values)for(const [key,value]of draft.values){const input=form.elements.namedItem(key);if(input){if(input.type==='checkbox')input.checked=true;else input.value=value;}}form.addEventListener('input',()=>{draft.values=[...new FormData(form)];});form.addEventListener('change',()=>{draft.values=[...new FormData(form)];});}
}
function openPlannedForm(header,resume=false){
 requireThat(operator(),'FORBIDDEN');requireThat(header?.context,'NOT_FOUND');
 if(state.draft&&!resume){showModal('Rascunho preservado','<p>Continue o registro anterior antes de abrir outro apontamento.</p><button type="button" class="btn" data-action="resume-draft">Continuar rascunho</button>');return;}
 requireThat(Object.entries(state.selection.recording?.context??{}).every(([k,v])=>header.context[k]===v)&&state.selection.recording,'CONTEXT_MISMATCH');
 const draft=resume?state.draft:{kind:'plannedProduction',record:{},header:structuredClone(header),context:structuredClone(header.context),intent:{id:crypto.randomUUID()},values:null};state.draft=draft;
 showModal('Registrar produção no intervalo',productionContextCard({recording:{context:draft.context},catalog:state.registries})+formMarkup('production',{context:draft.context,record:{startedAt:header.startedAt,endedAt:header.endedAt}}),{submit:async data=>{
  const saved=await services().plannedProduction.record(header.id,{id:draft.intent.id,quantity:Number(String(data.get('quantity')).replace(',','.')),basis:data.get('basis'),startedAt:saoPauloInstant(data.get('startedAt'),'startedAt'),endedAt:saoPauloInstant(data.get('endedAt'),'endedAt'),expectedRevision:ledgerView(draft.header).last?.id??null,origin:state.simulation?'demo':'manual'});state.draft=null;state.lastSaved={kind:'production',record:saved};return saved;
 }});
 const form=modal.querySelector('form');if(!draft.values)draft.values=[...new FormData(form)];if(draft.values)for(const[k,v]of draft.values){const field=form.elements.namedItem(k);if(field)field.value=v;}const capture=()=>{draft.values=[...new FormData(form)];};form.addEventListener('input',capture);form.addEventListener('change',capture);
}
function correctionComparison(request) {
  const original=state.period[request?.recordType]?.find(r=>r.id===request.recordId),replacement=request?.replacement;
  if(!original||!replacement)return '<p class="source-notes">Original fora do recorte. Consulte o período e o contexto do registro antes de decidir.</p>';
  const changes=[];
  for(const key of ['quantity','amount','startedAt','endedAt','reasonId'])if(original[key]!==replacement[key]){
    const format=v=>key.endsWith('At')?date(v,true):key==='reasonId'?name('reasons',v):n(v);
    changes.push([({quantity:'Quantidade',amount:'Quantidade',startedAt:'Início',endedAt:'Fim',reasonId:'Motivo'})[key],format(original[key]),format(replacement[key])]);
  }
  for(const[id,reading]of Object.entries(original.readings??{}))if(reading.raw!==replacement.readings?.[id]?.raw)changes.push([name('parameters',id),reading.raw??'',replacement.readings[id].raw??'']);
  return `<p class="source-notes">Registro original: ${e(request.recordId)} · ${e(request.reason)}</p>${table(['Campo','Original','Proposto'],changes.map(row=>`<tr>${row.map(cell=>`<td>${e(cell)}</td>`).join('')}</tr>`).join(''))}`;
}
function detail(kind, id) {
  const r = records(kind).find((row) => row.id === id);
  if (!r) return;
  const fields = [
    ["Data", date(r.occurredAt ?? r.eventDate, !!r.occurredAt)],
    ["Máquina", name("machines", r.context?.machineId)],
    ["Processo", name("processes", r.context?.processId)],
    ["Produto", name("products", r.context?.productId)],
    ["Autor", r.createdBy],
    ["Registro", r.id],
    ["OP / lote / turno", [r.context?.order,r.context?.lot,r.context?.shift].filter(Boolean).join(' / ')||'Não informado'],
    ["Variante", r.context?.variant??'Não informada'],
    ...(r.origin?[["Origem",r.origin==='demo'?'Exemplo rastreável (demo)':r.origin]]:[]),
    ["Correção aplicada", r.correctionId??'Nenhuma'],
    ["Intervalo aprovado", r.intervalId??'Não vinculado'],
  ];
  if (r.startedAt != null)
    fields.push(
      ["Início", date(r.startedAt, true)],
      ["Fim", r.endedAt == null ? "Em aberto" : date(r.endedAt, true)],
    );
  if (r.reasonId) fields.push(["Motivo", name("reasons", r.reasonId)]);
  if (r.planned != null) fields.push(["Planejada", r.planned ? "Sim" : "Não"]);
  showModal(
    labels[kind],
    `<div class="detail-header"><h2>${recordSummary(kind, r)}</h2></div>${kind==='corrections'?correctionComparison(r):''}<dl class="detail-list">${fields.map(([k, v]) => `<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join("")}</dl>${
      kind === "collections"
        ? table(
            ["Parâmetro / referência", "Leitura original", "Situação"],
            Object.values(r.readings ?? {})
              .map(
                (reading) =>
                  `<tr><td>${e(name("parameters", reading.parameterId))}<div class="small muted">Versão ${e(reading.versionId)} · ${e(ruleText(state.registries.parameterVersions?.[reading.versionId]?.rule,state.registries.parameterVersions?.[reading.versionId]?.unit))}</div></td><td>${e(reading.raw)} ${e(state.registries.parameterVersions?.[reading.versionId]?.unit??'')}</td><td>${badge(evaluateReading(reading, state.registries.parameterVersions?.[reading.versionId]).state)}</td></tr>`,
              )
              .join(""),
          )
        : ""
    }${
      r.history
        ? table(
            ["Data", "Situação", "Justificativa"],
            Object.values(r.history)
              .map(
                (h) =>
                  `<tr><td>${date(h.at, true)}</td><td>${badge(h.state)}</td><td>${e(h.justification ?? "")}</td></tr>`,
              )
              .join(""),
          )
        : ""
    }${kind==='reviews'?(state.technical??[]).filter(x=>x.kind==='evidence'&&x.reviewId===r.id).map(x=>`<section class="review-evidence"><h3>Evidências de Qualidade</h3><dl class="detail-list">${['controlPlan','inspection','testResult','performance','note'].map(k=>`<div><dt>${e({controlPlan:'Plano de controle',inspection:'Inspeção',testResult:'Ensaio',performance:'Performance',note:'Justificativa'}[k])}</dt><dd>${e(x[k])}</dd></div>`).join('')}</dl><p>${date(x.createdAt,true)} · ${e(x.createdBy)}</p></section>`).join(''):''}${operator()&&['collections','production','losses','stoppages'].includes(kind)&&!(kind==='stoppages'&&r.endedAt==null)&&!r.correctionId&&!r.revisionConflict?button('Propor correção',`request-correction:${kind}:${r.id}`,'pencil'):''}${r.correctionId?'<p class="source-notes">Correção aplicada. Consulte a proposta em Engenharia; o original permanece no histórico.</p>':''}`,
  );
}
function parameterDetail(code) {
  const p = state.dashboard?.parameters.find((p) => p.code === code);
  if (!p) return;
  const selectedStudy=selectParameterStudy(state.dashboard,p);
  const stat=selectedStudy.group;
  showModal(
    p.name,
    `<div class="detail-header"><div class="detail-value">${value(p.latest?.value, p.latest?.unit ?? p.unit)}</div>${badge(p.state)}</div><p class="detail-meta">Referência da leitura: ${e(ruleText(p.latest?.rule, p.latest?.unit))} · ${p.latest ? date(p.latest.occurredAt ?? p.latest.eventDate, !!p.latest.occurredAt) : "Sem leitura"}</p>${p.parameterIds.length===1?parameterReferenceSummary(p.parameterIds[0]):''}<div class="parameter-chart-heading"><h3>Histórico do parâmetro</h3><p>${e(p.latest?.unit ?? p.unit)} · ${p.latest?.versionId ? 'Versão '+e(p.latest.versionId) : 'Sem versão com leitura'}</p></div><div class="chart-frame"><canvas id="parameter-chart" role="img" aria-label="Histórico do parâmetro"></canvas></div><dl class="modal-statistics">${[
      ["Média", stat?.mean],
      ["Desvio", stat?.sigma],
      ["Cp", stat?.cp],
      ["Cpk", stat?.cpk],
    ]
      .map(([label, v]) => `<div><dt>${label}</dt><dd>${n(v)}</dd></div>`)
      .join(
        "",
      )}</dl><p class="source-notes">${stat ? `${stat.nValid} leituras válidas · Dispersão descritiva populacional · capacidade via I-MR, estimada e não homologada.` : "Sem amostra estatística nesta versão."}</p><p class="source-notes">${e(cepReasons[stat?.capabilityReason] ?? statisticsReason(stat?.reason))}</p><p class="source-notes">${e((p.questions ?? []).join(" "))}</p>${engineer() && p.parameterIds.length === 1 ? button("Nova versão", `version:${p.parameterIds[0]}`, "sliders-horizontal") : ""}`,
  );
  const series = selectedStudy.series;
  drawChart("parameter-chart", {
    unit: p.latest?.unit ?? p.unit,
    fullLabels: series.map(s=>new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric',...(s.occurredAt!=null?{hour:'2-digit',minute:'2-digit'}:{})}).format(new Date(s.occurredAt ?? s.eventDate+'T12:00:00Z'))),
    labels: series.map((s) =>
      date(s.occurredAt ?? s.eventDate, !!s.occurredAt),
    ),
    datasets: [
      {
        type: "line",
        label: recordLabel(p.name),
        data: series.map((s) => (s.status === "valid" && !s.revisionConflict ? s.value : null)),
      },
    ],
  });
}

function downloadCsv(csv,filename) {
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');
  a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function exportCsv() {
  const kind =
    state.route === "operations"
      ? state.tab.operations
      : state.route === "history"
        ? state.tab.history
        : state.route === "production" ? "production" : state.route === "stoppages" ? "stoppages" : state.route === "quality" ? "losses" : "collections";
  const columns = [
    "id",
    "eventDate",
    "context.machineId",
    "context.processId",
    "context.productId",
    "createdBy",
    "origin",
    "source",
    "context.shift",
    "queryDiagnostics",
    ...{
      production: ["quantity", "basis", "startedAt", "endedAt"],
      stoppages: ["startedAt", "endedAt", "reasonId", "planned"],
      losses: ["kind", "amount", "unit", "reasonId"],
      collections: ["readings"],
      reviews: ["state", "scope", "history"],
      corrections: ["state", "reason", "replacement"],
    }[kind],
  ];
  const csv = await services().csv.exportRecords(recordsInPeriod(kind,records(kind),state.operationalQuery?.range??dateWindow(state.fromDate,state.toDate)), columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = `msa-${kind}-${state.fromDate}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function renderEquipmentResults(){const args={catalog:state.registries,events:state.equipmentEvents??{},state};document.getElementById('equipment-results').innerHTML=equipmentResults(equipmentView({...args,selection:{order:'name',...state.equipmentFilters}}),equipmentView(args));}
async function action(action) {
  if(action==='equipment-clear'){state.equipmentFilters={};layout();return;}
  if(action.startsWith('equipment-consult:')||action.startsWith('equipment-records:')){
    const [command,id,explicitProcess]=action.split(':'),selectedProcess=state.equipmentFilters?.sector,processId=explicitProcess??(state.registries.processes?.[selectedProcess]?.machineId===id?selectedProcess:undefined),target=equipmentConsultation({catalog:state.registries,machineId:id,processId,fromDate:state.fromDate,toDate:state.toDate,shift:state.consultationShift});
    if(!target.query){showModal('Escolher processo',target.choices.length?'<p>Escolha o processo para esta consulta.</p><div class="operation-toolbar">'+target.choices.map(p=>`<button class="btn" type="button" data-action="${command}:${e(id)}:${e(p.id)}">${e(p.name)}</button>`).join('')+'</div>':'<p>Nenhum processo ativo disponível para consulta.</p>');return;}
    applyQuery({...state.selection.query,...target.query});state.route=command==='equipment-records'?'history':'production';state.tab.history='collections';modal.close();history.replaceState(null,'','#'+state.route);await refresh();return;
  }

  if(action.startsWith('bi-export:')){if(state.loading||state.error)throw new Error('Aguarde a consulta terminar.');const result=exportBi({view:state,kind:action.slice(10)});for(const file of result.files)downloadCsv(file.text,file.name);return;}
  if(action==='consult-production'){const row=state.productionCases.find(r=>r.id===state.selection.recording?.productionCaseId);if(row){applyQuery({context:structuredClone(state.selection.recording.context),fromDate:row.operationalDate,toDate:row.operationalDate,shift:row.shift});modal.close();return refresh();}return;}
  if(action==='choose-production')return journey.choose();
  if(action.startsWith('select-production:'))return journey.select(action.slice(18));
  if(action.startsWith('production-new:'))return journey.select(action.slice(15),'new');
  if(action==='production-keep')return journey.keep();
  if(action==='create-production')return journey.create();
  if(action==='resume-draft'&&state.draft){modal.close();return openForm(state.draft.kind,state.draft.record,true);}
  if(action==='latest-period'){applyQuery(state.client.defaultSelection.query);return refresh();}
  if(action==='clear-query'){applyQuery({...state.selection.query,context:{machineId:state.context.machineId,processId:state.context.processId},shift:'all'});return refresh();}
  if(action==='saved-summary'||action==='saved-history'){
    const saved=state.lastSaved;if(!saved)return;const r=saved.record,day=shiftAt(r.occurredAt??r.startedAt).operationalDate;
    applyQuery({context:r.context,fromDate:day,toDate:day,shift:'all'});state.route=action==='saved-history'?'history':saved.kind==='collections'?'parameters':'production';state.tab.history=saved.kind;state.pageTabs.production='summary';history.replaceState(null,'','#'+state.route);await refresh();if(action==='saved-history')detail(saved.kind,r.id);return;
  }
  if(action.startsWith('equipment-history:')){
    const id=action.slice(18),row=equipmentView({catalog:state.registries,events:state.equipmentEvents,state,selection:{sector:state.equipmentFilters?.sector}}).find(r=>r.id===id),record=Object.values(state.equipmentEvents?.collections??{}).find(r=>row?.conflictedRecordIds.includes(r.id));
    if(!record)return;applyQuery(equipmentHistoryQuery(record));state.route='history';state.tab.history='collections';modal.close();history.replaceState(null,'','#history');await refresh();return;
  }
  if(action.startsWith('equipment-case-consult:')){const row=state.productionCases.find(r=>r.id===action.slice(23));if(!row)return;applyQuery({context:{machineId:row.machineId,processId:row.processId,productId:row.productId,order:row.order,lot:row.lot},fromDate:row.operationalDate,toDate:row.operationalDate,shift:row.shift});state.route='production';modal.close();history.replaceState(null,'','#production');await refresh();return;}
  if(action.startsWith('equipment-register:'))return journey.choose(action.slice(19));
  if(action.startsWith('equipment-detail:')){
    const id=action.slice(17),row=equipmentView({catalog:state.registries,events:state.equipmentEvents,state,selection:{sector:state.equipmentFilters?.sector}}).find(r=>r.id===id);
    if(row){
      const conflict=row.conflictedRecordIds.length?`<p>Os valores permanecem indisponíveis até resolver a revisão.</p><button class="btn" data-action="equipment-history:${e(row.id)}">Ver conflito no histórico</button>`:'';
      const readings=row.lastReading?recordContextMarkup(row.lastReading,state.registries)+`<dl>${Object.values(row.lastReading.readings??{}).map(r=>`<dt>${e(name('parameters',r.parameterId))}</dt><dd>${e(r.raw??'Sem leitura')} ${e(state.registries.parameterVersions?.[r.versionId]?.unit??'')} · versão ${e(r.versionId)}</dd>`).join('')}</dl>`:'';
      const productions=state.productionCases.filter(r=>r.machineId===id&&(!state.equipmentFilters?.sector||!state.registries.processes?.[state.equipmentFilters.sector]||r.processId===state.equipmentFilters.sector)&&state.operationalQuery.windows.some(w=>r.startedAt<w.to&&r.endedAt>w.from));
      const productionList=productions.map(r=>`<article class="production-choice"><div><strong>${e(name('products',r.productId))}</strong><p>OP ${e(r.order)} · Lote ${e(r.lot)} · ${r.shift}º turno</p><p>${date(r.startedAt,true)} a ${date(r.endedAt,true)}</p></div><div><button class="btn" data-action="equipment-case-consult:${e(r.id)}">Consultar</button>${operator()?`<button class="btn" data-action="select-production:${e(r.id)}">Selecionar para registrar</button>`:''}</div></article>`).join('');
      showModal(row.name,`<p>${e(row.status)}</p><p>Última leitura: ${row.lastReading?date(row.lastReading.occurredAt,true):e(row.lastReadingReason)}</p><p>${e(row.processes.map(p=>p.name).join(' · '))}</p><p class="source-notes">Situação baseada nos registros consultados, sem comprovação de conexão física.</p>${row.alerts.map(a=>`<p class="equipment-alert">${e(a)}</p>`).join('')}${conflict}${readings}<h3>Produções no período</h3>${productionList||'<p>Sem produção cadastrada neste período.</p>'}<div class="operation-toolbar"><button class="btn" data-action="equipment-consult:${e(row.id)}">Consultar produção</button><button class="btn" data-action="equipment-records:${e(row.id)}">Ver histórico</button>${operator()?'<button class="btn" data-action="equipment-register:'+e(row.id)+'">Escolher produção para registrar</button>':''}</div>`);
    }return;
  }
  if(action.startsWith("live:")){const type=action.slice(5);if(type==='retry')await state.client.live.retry();else await state.client.live.command(type);return refresh();}
  if(action==='pending-back'){if(state.pendingReturn){Object.assign(state,state.pendingReturn);state.pendingReturn=null;await refresh();}return;}
  if(action.startsWith('registry-edit:')){const[,kind,id]=action.split(':'),r=state.registries[kind]?.[id];if(!r||!engineer())return;showModal('Editar cadastro',`<div class="form-grid"><label class="field">Nome<input name="name" value="${e(r.name)}" required maxlength="160"></label><label class="field">Código<input name="code" value="${e(r.code??'')}" maxlength="100"></label></div><p class="source-notes">Identificador e vínculos históricos são preservados.</p>`,{submit:data=>services().registry.update(kind,id,{name:data.get('name'),...(data.get('code')?{code:data.get('code')}:{})})});return;}
  if(action==='connector-stop'){stopConnector();layout();return;}
  if(action.startsWith('tech:'))return technicalAction(action,{state,services:services(),showModal,downloadCsv,refresh,toast,startConnector});
  if(action==='tv-back'){if(document.fullscreenElement)await document.exitFullscreen();location.hash='indicators';return;}
  if(action==='tv-fullscreen'){document.fullscreenElement?await document.exitFullscreen():await document.documentElement.requestFullscreen();layout();return;}
  if(action==='presentation-backup'){const url=URL.createObjectURL(new Blob([await state.client.exportBackup()],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='msa-registros-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
  if(action==='local-archive'){const archive=await archiveLocalWorkspace({uid:state.actor.uid}),url=URL.createObjectURL(new Blob([JSON.stringify(archive,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='msa-registros-locais-anteriores.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
  if(action==='new-review'){const col=records('collections').at(-1);if(!col){toast('Registre uma coleta neste contexto primeiro.');return;}return actionReview(col.id);}
  if(action.startsWith('nhpl:')){
    const command=action.split(':')[1],needsRecording=['run','production','plan'].includes(command);
    if(needsRecording&&!state.selection.recording)return journey.choose();
    if(command==='production')return openPlannedForm({...state.period.intervalHeaders?.[action.split(':')[2]],id:action.split(':')[2]});
    const context=needsRecording?await recordingContext():state.context;
    return nhplAction(action,{state:needsRecording?{...state,context}:state,services:state.client?services():null,showModal,modal,refresh,downloadCsv});
  }
  const [command, id, extra] = action.split(":");
  if(!writable()&&['form','active','start','decide','correction','catalog','version','close','review','csv-import','request-correction','cep-review'].includes(command))throw Object.assign(new Error('Seu perfil não permite gravação.'),{code:'FORBIDDEN'});
  if(command==='csv-import'){if(operator()&&state.context.productId)openCsvImport({showModal,services:services(),registries:state.registries,context:structuredClone(state.context)});return;}
  if(command==='request-correction'){
    const record=state.period[id]?.find(r=>r.id===extra);
    if(operator()&&record){modal.close();openCorrection({showModal,services:services(),registries:state.registries,kind:id,record});}return;
  }
  if(command==='cep-export') {
    if(state.exporting)return;
    state.exporting=true;
    const report=cepReportRows(state),columns=[...new Set(report.flatMap(r=>Object.keys(r)))];
    try {await downloadExport((...args)=>services().csv.exportRecords(...args),report,columns,downloadCsv,'msa-cep-'+state.toDate+'.csv');}
    finally {state.exporting=false;}return;
  }
  if(command==='cep-review') {
    const study=getCepStudy(state),last=study.samples.at(-1);
    if(!operator()||!last?.collectionId||study.fromWorkbook)return;
    const a=study.analysis,scope=`Estudo ${recordLabel(study.parameter.name)}; ${recordLabel(study.source)}; ${a.method}; versão ${study.version.id}; n=${a.nValid}; Cp=${n(a.cp)}; Cpk=${n(a.cpk)}; ${cepReasons[a.reason]??'Índices estimados sob hipótese normal, sem homologação.'}`;
    showModal('Encaminhar estudo à Engenharia',`<label class="field">Escopo do estudo<textarea name="scope" rows="5" required maxlength="2000">${e(scope)}</textarea></label>`,{footer:'Encaminhar',submit:data=>services().analysis.submitReview({collectionId:last.collectionId,scope:data.get('scope')})});return;
  }
  if (command === "theme") {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    writePreferences({ theme: next });
    applyTheme(next);
    layout();
    return;
  }
  if (command === "password") {
    const input = app.querySelector('#login [name=password]') ?? modal.querySelector("[name=password]");
    input.type = input.type === "password" ? "text" : "password";
    const toggle = input.parentElement.querySelector('[data-action=password]');
    if(toggle){toggle.setAttribute('aria-label',input.type==='password'?'Mostrar senha':'Ocultar senha');toggle.setAttribute('aria-pressed',String(input.type==='text'));toggle.innerHTML=icon(input.type==='password'?'eye':'eye-off');icons();}
    return;
  }
  if (command === 'profile') {
    const popover=app.querySelector('#account-popover'),trigger=app.querySelector('[data-action=profile]');
    if(!popover) return;
    state.accountOpen=!state.accountOpen;
    popover.hidden=!state.accountOpen;trigger.setAttribute('aria-expanded',String(state.accountOpen));
    if(!popover.hidden) popover.querySelector('a,button')?.focus();
    return;
  }
  if (command === "close-modal") {
    modal.close();
    return;
  }
  if (command === "menu" || command === "menu-close") {
    state.menuOpen = command === 'menu-close' ? false : !state.menuOpen;
    document.querySelector(".rail").classList.toggle("open", state.menuOpen);
    document.querySelector('.rail-scrim').hidden=!state.menuOpen;
    document
      .querySelector("[data-action=menu]")
      .setAttribute("aria-expanded", String(state.menuOpen));
    return;
  }
  if (command === "reset-password") {
    const email = modal.querySelector("[name=email]").value;
    await getCloud().auth.resetPassword(email);
    toast("Solicitação de recuperação enviada.");
    return;
  }
  if(command==='reset-consultation'){writeConsultation({days:7,compact:false});state.fromDate=dayOffset(today(),-6);state.toDate=today();state.client?await refresh():layout();toast('Preferências de consulta restauradas.');return;}
  if(command==='change-password'){showModal('Alterar senha','<div class="form-grid"><label class="field full">Senha atual<input type="password" name="current" required autocomplete="current-password"></label><label class="field">Nova senha<input type="password" name="next" required minlength="6" autocomplete="new-password"></label><label class="field">Confirmar nova senha<input type="password" name="confirm" required minlength="6" autocomplete="new-password"></label></div>',{footer:'Alterar senha',submit:async data=>{if(data.get('next')!==data.get('confirm'))throw Object.assign(new Error('As senhas não coincidem.'),{code:'PASSWORD_MISMATCH'});await getCloud().auth.changePassword({currentPassword:data.get('current'),newPassword:data.get('next')});}});return;}
  if (command === 'simulate') {
    showModal('Simular cenário', `<label class="field">Cenário<select name="scenario">${simulationCases.map(c=>`<option value="${c.id}">${e(c.name)}</option>`).join('')}</select></label>`, {footer:'Iniciar simulação',submit:data=>startSimulation(data.get('scenario'))});
    return;
  }
  if (command === 'end-simulation') return endSimulation();
  if (command === "connect") {
    if (localSimulation) await endSimulation();
    login();
    return;
  }
  if (command === "catalog") {
    installCatalog();
    return;
  }
  if (command === "logout") {
    stopConnector();
    closeAccount();
    if (localSimulation) return endSimulation();
    unsubscribe();
    await cloud?.auth.signOut();
    await leaveWorkspace();
    return;
  }
  if (command === "refresh") return refresh();

  if (command === "export") return state.context.machineId==='nhpl'&&(['dashboard','planning'].includes(state.route)||state.route==='production'&&state.pageTabs.production==='summary')?nhplAction('nhpl:export',{state,services:services(),showModal,modal,refresh,downloadCsv}):exportCsv();
  if (command === "form") return openForm(id);
  if (command === "close")
    return openForm(
      "closeStop",
      records("stoppages").find((r) => r.id === id),
    );
  if (command === "decide")
    return openForm(
      "reviewDecision",
      records("reviews").find((r) => r.id === id),
    );
  if (command === "start") {
    await services().analysis.startReview(id);
    toast("Análise iniciada.");
    return refresh();
  }
  if (command === "review") {
    showModal(
      "Enviar à Engenharia",
      '<label class="field">Escopo da análise<textarea name="scope" required maxlength="2000"></textarea></label>',
      {
        submit: (data) =>
          services().analysis.submitReview({
            collectionId: id,
            scope: data.get("scope"),
          }),
      },
    );
    return;
  }
  if (command === "version") {
    if (modal.open) modal.close();
    const selected=state.route==='cep'?getCepStudy(state).version:null;
    const version=selected?.parameterId===id?selected:parameterReferences(state.registries,id).latest;
    return openForm("parameterVersion", referenceDraft(id,version));
  }
  if (command === "active") {
    const r = state.registries[id][extra];
    showModal(
      r.active ? "Inativar cadastro" : "Ativar cadastro",
      `<p>${e(r.name)}</p>`,
      {
        submit: () =>
          services().registry.update(id, extra, { active: !r.active }),
        footer: "Confirmar",
      },
    );
    return;
  }

  if (command === "correction") {
    const request=records('corrections').find(r=>r.id===id);
    if(!request||request.createdBy===state.actor?.uid)return;
    showModal(
      "Decidir correção",
      correctionComparison(request)+'<label class="field">Decisão<select name="decision"><option value="approved">Aprovar</option><option value="rejected">Não aprovar</option></select></label><label class="field">Justificativa<textarea name="justification" required></textarea></label>',
      {
        submit: (data) =>
          services().analysis.decideCorrection(id, {
            decision: data.get("decision"),
            justification: data.get("justification"),
          }),
      },
    );
  }
}
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&state.menuOpen){state.menuOpen=false;icons();app.querySelector('[data-action=menu]')?.focus();}
  if(event.key==='Escape' && !app.querySelector('#account-popover')?.hidden) closeAccount({restoreFocus:true});
});
document.addEventListener('submit',async event=>{
 if(event.target.id==='equipment-period-form'){event.preventDefault();try{const data=new FormData(event.target);dateWindow(data.get('fromDate'),data.get('toDate'));applyQuery({...state.selection.query,context:state.context,fromDate:data.get('fromDate'),toDate:data.get('toDate'),shift:data.get('shift')});await refresh();}catch(error){fail(error);}return;}
 if(event.target.id!=='query-form')return;event.preventDefault();
 try{const data=new FormData(event.target),context=Object.fromEntries(['machineId','processId','productId','order','lot','recipe'].filter(k=>data.get(k)).map(k=>[k,data.get(k)]));dateWindow(data.get('fromDate'),data.get('toDate'));applyQuery({context,fromDate:data.get('fromDate'),toDate:data.get('toDate'),shift:data.get('shift')});await refresh();}catch(error){fail(error);}
});
document.addEventListener('change',event=>{
 const form=event.target.closest('#query-form');if(form&&event.target.dataset.queryCatalog){const controls=form.elements,options=values=>values.map(r=>`<option value="${e(r.id)}">${e(r.name)}</option>`).join('');if(event.target.dataset.queryCatalog==='machine')controls.processId.innerHTML=options(rows('processes').filter(p=>p.active&&p.machineId===controls.machineId.value));controls.productId.innerHTML='<option value="">Todos os produtos</option>'+options(rows('products').filter(p=>p.active&&p.processIds?.[controls.processId.value]));}
 if(['equipment-sector','equipment-status','equipment-order'].includes(event.target.id)){state.equipmentFilters={...state.equipmentFilters,[event.target.id.slice(10)]:event.target.value};renderEquipmentResults();}
});
document.addEventListener("click", (event) => {
  if(!event.target.closest('.account')) closeAccount();
  const target = event.target.closest(
    "[data-action],[data-tab],[data-page-tab],[data-pending],[data-parameter],[data-detail],[data-theme-choice]",
  );
  if (!target) return;
  if(target.dataset.pageTab){state.pageTabs[target.dataset.pageRoute]=target.dataset.pageTab;layout();return;}
  if(target.dataset.pending){const item=[...(state.pending?.open??[]),...(state.pending?.checks??[]),...(state.pending?.deviations??[])].find(x=>x.id===target.dataset.pending);if(!item)return;state.pendingReturn={context:structuredClone(state.context),fromDate:state.fromDate,toDate:state.toDate,route:state.route,pageTabs:structuredClone(state.pageTabs),consultationShift:state.consultationShift,followLatest:state.followLatest};if(item.context)state.context=structuredClone(item.context);state.route=item.route;state.pageTabs[item.route]=item.tab;if(item.route==='engineering')state.tab.engineering=item.tab;state.fromDate=item.occurredAt!=null?shiftAt(item.occurredAt).operationalDate:dayOffset(today(),-30);state.toDate=today();state.consultationShift='all';state.followLatest=false;refresh().then(()=>{if(['reviews','corrections','stoppages','collections','production','losses'].includes(item.recordType))detail(item.recordType,item.recordId);}).catch(fail);return;}
  if (target.dataset.action) {
    event.preventDefault();
    action(target.dataset.action).catch(fail);
  } else if (target.dataset.tab) {
    state.tab[state.route] = target.dataset.tab;
    layout();
  } else if (target.dataset.parameter)
    parameterDetail(target.dataset.parameter);
  else if (target.dataset.detail) {
    const [kind, id] = target.dataset.detail.split(":");
    detail(kind, id);
  } else if (target.dataset.themeChoice) {
    writePreferences({ theme: target.dataset.themeChoice });
    applyTheme(target.dataset.themeChoice);
    layout();
  }
});

document.addEventListener('submit',async event=>{if(event.target.id!=='profile-form')return;event.preventDefault();const btn=event.target.querySelector('[type=submit]');btn.disabled=true;try{const displayName=new FormData(event.target).get('displayName').trim();await getCloud().auth.updateDisplayName(displayName);state.client.displayName=displayName;layout();toast('Perfil salvo.');}catch(error){fail(error);btn.disabled=false;}});
document.addEventListener("input", (event) => {
  if(event.target.id==='equipment-search'){state.equipmentFilters={...state.equipmentFilters,search:event.target.value};renderEquipmentResults();}
  if (event.target.id === "parameter-search") {
    state.search = event.target.value;
    document.getElementById("parameter-results").innerHTML = parameterTable(
      visibleParameters(state),
    );
    icons();
  }
});
document.addEventListener("change", async (event) => {
  try {
    if(event.target.id==='shift-filter'){state.consultationShift=event.target.value;state.cep.sequenceConfirmed=false;await refresh();return;}
    if(event.target.id==='event-file'){const file=event.target.files?.[0];if(!file)return;if(file.size>1_000_000)throw Object.assign(new Error(),{code:'CSV_TOO_LARGE'});modal.querySelector('[name=events]').value=await file.text();return;}
    if(event.target.id==='csv-file'){
      const file=event.target.files?.[0];if(!file)return;
      if(file.size>5_000_000)throw Object.assign(new Error('Arquivo muito grande'),{code:'CSV_TOO_LARGE'});
      modal.querySelector('[name=csvText]').value=await file.text();modal.querySelector('[name=sourceFile]').value=file.name;return;
    }
    if(event.target.id==='dataset-choice'){state.dataset=event.target.value;state.cep.sequenceConfirmed=false;await refresh();return;}
    if(event.target.dataset.cep){
      const key=event.target.dataset.cep,value=key==='sequenceConfirmed'?event.target.checked:key==='minSamples'?Number(event.target.value):event.target.value;
      if(key==='minSamples'&&(!Number.isInteger(value)||value<(state.context.machineId==='nhpl'?30:2)||value>500))throw Object.assign(new Error('Mínimo inválido'),{code:'VALIDATION',field:'minSamples'});
      state.cep[key]=value;
      if(key==='source'||key==='parameterId'){state.cep.parameterId=key==='parameterId'?value:'';state.cep.group='';state.cep.versionId='';state.cep.sequenceConfirmed=false;}
      if(key==='group'||key==='versionId')state.cep.sequenceConfirmed=false;
      layout();return;
    }
    if(event.target.dataset.hourly){
      const key=event.target.dataset.hourly,raw=event.target.value;
      if(key==='date'){dateWindow(raw,raw);if(raw<state.fromDate||raw>state.toDate)throw Object.assign(new Error('Data fora da consulta'),{code:'INVALID_PERIOD'});state.hourly.date=raw;}
      else{const parsed=raw===''&&key==='target'?null:parseReading(raw);if(parsed&& (parsed.status!=='valid'||parsed.value<=0||(key==='microStopSeconds'&&parsed.value>3600)))throw Object.assign(new Error('Valor inválido'),{code:'VALIDATION',field:key});state.hourly[key]=parsed?.value??null;}
      layout();return;
    }
    if(event.target.id==='compact-toggle'){writeConsultation({compact:event.target.checked});document.body.classList.toggle('compact-tables',event.target.checked);return;}
    if(event.target.id==='default-period'){writeConsultation({days:Number(event.target.value)});state.fromDate=dayOffset(today(),1-Number(event.target.value));state.toDate=today();state.client?await refresh():layout();return;}
    if (
      event.target.name === "kind" &&
      modal.open &&
      modal.querySelector("[name=amount]")
    ) {
      const kind = event.target.value,
        reasons = rows("reasons").filter((r) => r.active && r.kind === kind);
      modal.querySelector("[name=reasonId]").innerHTML = reasons.length
        ? reasons
            .map((r) => `<option value="${e(r.id)}">${e(r.name)}</option>`)
            .join("")
        : '<option value="">Sem motivo cadastrado</option>';
      modal.querySelector("[name=unit]").value =
        kind === "material" ? "kg" : "pieces";
    } else if (event.target.dataset.context) {
      state.context[event.target.dataset.context] = event.target.value;
      for(const field of ['lot','order','recipe','shift','variant'])delete state.context[field];
      state.cep.sequenceConfirmed=false;
      reconcileContext();
      await refresh();
    } else if(event.target.dataset.contextExtra) {
      const key=event.target.dataset.contextExtra,raw=event.target.value.trim();
      if(raw)state.context[key]=raw;else delete state.context[key];
      state.cep.sequenceConfirmed=false;await refresh();
    } else if (event.target.id === "period") {
      state.followLatest=false;
      if (event.target.value === "custom")
        showModal(
          "Período",
          '<div class="form-grid"><label class="field">De<input type="date" name="from" required value="' +
            state.fromDate +
            '"></label><label class="field">Até<input type="date" name="to" required value="' +
            state.toDate +
            '"></label></div>',
          {
            submit: async (data) => {
              dateWindow(data.get("from"), data.get("to"));
              state.fromDate = data.get("from");
              state.toDate = data.get("to");
            },
          },
        );
      else {
        state.fromDate = dayOffset(today(), 1 - Number(event.target.value));
        state.toDate = today();
        await refresh();
      }
    } else if (event.target.id === "vlibras-toggle") {
      if (event.target.checked) {
        writePreferences({ vlibras: true });
        await enableVlibras();
        toast("VLibras ativado.");
      } else disableVlibras();
    }
  } catch (error) {
    fail(error);
    if (event.target.id === "vlibras-toggle") {
      vlibrasFailure(error);
    }
  }
});
modal.addEventListener("close", () => {
  if(!modal.open&&state.draft)layout();
  document.body.classList.remove("modal-open");
  requestAnimationFrame(()=>{
    const target = (state.modalReturn && app.querySelector(state.modalReturn)) || app.querySelector('#content');
    target?.focus({preventScroll:true});
  });
});
window.addEventListener("hashchange", () => {
  closeAccount();
  state.menuOpen = false;
  state.route = location.hash.slice(1) || "dashboard";
  if(state.route==='equipment'&&state.client){refresh();return;}
  layout();
});
const prefs = readPreferences();
applyTheme(prefs.theme);
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (readPreferences().theme === "system") {
    applyTheme("system");
    layout();
  }
});
if (prefs.vlibras) enableVlibras().catch(vlibrasFailure);
const vlibrasError = sessionStorage.getItem("msa.vlibras.error");
if (vlibrasError) {
  sessionStorage.removeItem("msa.vlibras.error");
  toast(vlibrasError);
}
function actionReview(id){return action('review:'+id);}
layout();getCloud();
setInterval(()=>{if(state.route==='tv'&&!modal.open&&state.client)refresh({background:state.client.mode==='live'});},5000);


function restoreConsultation(){
 const saved=readAccountConsultation(state.actor.uid,state.source);state.consultationShift=saved.shift;
 if(saved.context)state.context={...saved.context};
 if(saved.fromDate&&saved.toDate){try{dateWindow(saved.fromDate,saved.toDate);state.fromDate=saved.fromDate;state.toDate=saved.followLatest===false?saved.toDate:state.client.toDate??saved.toDate;state.followLatest=saved.followLatest!==false;}catch{}}
}
