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
  escapeHtml as e,
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

const app = document.getElementById("app"),
  modal = document.getElementById("modal");
const roots = [
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
  dashboard: "Visão da produção",
  parameters: "Parâmetros",
  operations: "Apontamentos",
  engineering: "Engenharia",
  history: "Histórico",
  registry: "Cadastros",
  settings: "Configurações",
  collections: "Coletas",
  production: "Produção",
  stoppages: "Paradas",
  losses: "Perdas",
  reviews: "Análises",
  corrections: "Correções",
  machines: "Máquinas",
  processes: "Processos",
  products: "Produtos",
  reasons: "Motivos",
  targets: "Metas",
};
const navigation = [
  ["dashboard", "layout-dashboard", "Dashboard"],
  ["parameters", "sliders-horizontal", "Parâmetros"],
  ["operations", "clipboard-pen", "Apontamentos"],
  ["engineering", "shield-check", "Engenharia"],
  ["history", "history", "Histórico"],
  ["registry", "database", "Cadastros"],
];
const state = {
  route: location.hash.slice(1) || "dashboard",
  tab: {
    operations: "production",
    engineering: "reviews",
    registry: "machines",
    history: "collections",
  },
  fromDate: dayOffset(today(), 1-readConsultation().days),
  toDate: today(),
  context: {},
  registries: {},
  period: {},
  dashboard: emptyDashboard(),
  client: null,
  actor: null,
  error: null,
  loading: false,
  search: "",
  offs: [],
};
let cloud,
  authOff,
  refreshTimer,
  epoch = 0,
  toastTimer,
  cloudEntry;
let liveState, localSimulation;

async function startSimulation(caseId) {
  const local = await openSimulation(caseId);
  if (!localSimulation) liveState = {client:state.client,actor:state.actor,context:structuredClone(state.context),fromDate:state.fromDate,toDate:state.toDate};
  unsubscribe();
  localSimulation?.dispose();
  localSimulation = local;
  state.simulation = caseId;
  state.client = local;
  state.actor = local.actor;
  state.context = local.context;
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
  state.period = {};
  state.registries = {};
  state.dashboard = emptyDashboard();
  if (state.client) {watch();await refresh();} else layout();
}
const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
const button = (text, action, ico = "plus", cls = "") =>
  `<button class="btn ${cls}" data-action="${action}">${icon(ico)}<span>${e(text)}</span></button>`;
const rows = (kind) => Object.values(state.registries[kind] ?? {});
const records = (kind) =>
  state.period.effective?.[kind] ?? state.period[kind] ?? [];
const name = (kind, id) =>
  state.registries[kind]?.[id]?.name ?? id ?? "Sem vínculo";
const engineer = () => ["admin", "engineer"].includes(state.actor?.role);
const operator = () =>
  ["admin", "engineer", "operator"].includes(state.actor?.role);
const admin = () => state.actor?.role === "admin";
const services = () => state.client.services;
function icons() {
  document.body.classList.toggle("compact-tables",readConsultation().compact);
  const account=app.querySelector(".avatar");if(account&&state.client){const words=state.client.displayName.split(/\s+/);account.textContent=(words[0][0]+(words.length>1?words.at(-1)[0]:'')).toUpperCase();account.title=state.client.displayName;}
  app.querySelector(".rail")?.classList.toggle("open", Boolean(state.menuOpen));
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
  return `<div class="table-wrap"><table class="data-table"><thead><tr>${headers.map((h) => `<th>${e(h)}</th>`).join("")}</tr></thead><tbody>${body || `<tr><td colspan="${headers.length}" class="empty-state">Nenhum registro neste período.</td></tr>`}</tbody></table></div>`;
}
function tabs(items, current) {
  return `<div class="tabs" role="tablist">${items.map((id) => `<button class="tab ${id === current ? "active" : ""}" role="tab" aria-selected="${id === current}" data-tab="${id}">${e(labels[id] ?? id)}</button>`).join("")}</div>`;
}
function value(v, unit = "") {
  return `<strong${v == null ? ' class="missing-value"' : ""}>${n(v)}</strong>${v != null ? `<span>${e(unit)}</span>` : ""}`;
}
function filters() {
  return `<div class="filterbar">${["machines", "processes", "products"]
    .map((kind, i) => {
      const field = ["machineId", "processId", "productId"][i];
      const available = rows(kind).filter(
        (r) =>
          r.active &&
          (kind !== "processes" || r.machineId === state.context.machineId) &&
          (kind !== "products" || r.processIds?.[state.context.processId]),
      );
      return `<select aria-label="${labels[kind]}" data-context="${field}">${available.length ? available.map((r) => `<option value="${e(r.id)}" ${r.id === state.context[field] ? "selected" : ""}>${e(r.name)}</option>`).join("") : '<option value="">Sem cadastro</option>'}</select>`;
    })
    .join(
      "",
    )}<select aria-label="Período" id="period"><option value="7">Últimos 7 dias</option><option value="14">Últimos 14 dias</option><option value="1">Hoje</option><option value="30">Últimos 30 dias</option><option value="custom">Personalizado</option></select></div>`;
}
function login(error = "") {
  if (modal.open) modal.close();
  showModal(
    "Conectar ao Firebase",
    `<div class="form-grid"><label class="field full">E-mail<input name="email" type="email" value="adm@adm.com" required autocomplete="username"></label><label class="field full">Senha<input name="password" type="password" required autocomplete="current-password"></label></div><p class="small muted">${e(error)}</p>`,
    {
      footer: "Conectar",
      submit: async (data) => {
        const result = await getCloud().auth.signIn(
          data.get("email"),
          data.get("password"),
        );
        await enterCloud(result.user);
      },
    },
  );
}
function layout() {
  clearCharts();
  const route = [...navigation.map(([id]) => id), "settings"].includes(
    state.route,
  )
    ? state.route
    : "dashboard";
  state.route = route;
  app.innerHTML = `<aside class="rail" aria-label="Menu principal"><nav>${navigation.map(([id, ico, label]) => `<a href="#${id}" title="${label}" class="rail-link ${route === id ? "active" : ""}" ${route === id ? 'aria-current="page"' : ""}>${icon(ico)}<span>${label}</span></a>`).join("")}</nav><div class="rail-bottom"><a href="#settings" class="rail-link ${route === "settings" ? "active" : ""}" title="Configurações">${icon("settings")}<span>Configurações</span></a><div class="rail-separator"></div><button class="rail-link" data-action="logout" title="Sair">${icon("log-out")}<span>Sair</span></button></div></aside><div class="shell"><header class="topbar"><div class="workspace-brand"><button class="icon-btn mobile-menu" data-action="menu" aria-label="Abrir menu">${icon("menu")}</button></div><div class="top-tools"><a href="#engineering" class="icon-btn" title="Análises" aria-label="Análises">${icon("bell")}</a><a href="#settings" class="avatar" aria-label="Conta">AD</a></div></header><main class="content" id="content"><div class="page-heading"><div><h1>${labels[route]}</h1><p>${route === "dashboard" ? "Produção, qualidade e acompanhamento do processo" : ""}</p></div><div class="page-actions">${route === "dashboard" ? button("Simular cenário", "simulate", "flask-conical") : ""}${state.client && state.context.productId && route !== "settings" && route !== "registry" ? button("Exportar", "export", "download", "export") : ""}${operator() && ["dashboard", "parameters"].includes(route) ? button("Nova coleta", "form:collection", "plus", "primary") : ""}</div></div>${!["settings", "registry"].includes(route) ? filters() : ""}${!state.client ? `<div class="context-notice">${button("Conectar ao Firebase", "connect", "log-in")}<span>Entre para consultar e registrar os dados.</span></div>` : ""}${state.error ? `<div class="error-band" role="alert">${e(errorText(state.error))}${button("Atualizar", "refresh", "refresh-cw")}</div>` : ""}${state.simulation ? `<div class="simulation-notice"><span><strong>Simulação local</strong> · ${e(simulationCases.find(c=>c.id===state.simulation)?.name)}. Alterações não vão para o Firebase.</span>${button("Voltar aos registros", "end-simulation", "arrow-left")}</div>` : ""}<div id="page">${page()}</div></main></div>${state.loading ? '<div class="loading-line" aria-label="Carregando"></div>' : ""}`;
  icons();
  const period = document.getElementById("period");
  connectionStatus();
  if(period){const days=(dateWindow(state.fromDate,state.toDate).to-dateWindow(state.fromDate,state.toDate).from)/86400000;period.value=state.toDate===today()&&[1,7,14,30].includes(days)?String(days):'custom';}
  drawPageCharts();
}
function page() {
  if (state.route === "settings") return settings();
  if (state.route === "registry") return registry();
  if (state.route === "dashboard") return dashboard();
  if (state.route === "parameters") return parameters();
  if (!state.context.productId)
    return `<div class="empty-state"><h2>Workspace sem contexto de produção</h2><p>Máquinas, processos e produtos ainda não foram cadastrados.</p><a class="btn" href="#registry">Cadastros</a></div>`;
  if (state.route === "engineering") return engineering();
  return operations();
}
function metric(title, v, unit, note, ico, highlight = false) {
  return `<article class="metric ${highlight ? "highlight" : ""}"><div class="metric-title">${title}${icon(ico)}</div><div class="metric-value">${value(v, unit)}</div><p class="metric-note">${e(note)}</p></article>`;
}
function dashboard() {
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
        `<button class="zone ${p.state === "within" ? "good" : p.state === "outside" ? "bad" : p.state === "pending" ? "warn" : "neutral"}" data-parameter="${e(p.code)}" title="${e(p.name)}"><div class="zone-top"><span>Z${i + 1}</span>${icon("thermometer")}</div><div class="zone-value">${value(p.latest?.value, p.latest?.unit ?? p.unit)}</div><span class="zone-line"></span></button>`,
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
  )}</section></div>${state.context.productId && d && !d.complete ? '<p class="source-notes">Dados parciais. Indicadores dependentes de cobertura completa estão indisponíveis.</p>' : ""}`;
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
    ["Parâmetro", "Última leitura", "Limite da versão", "Situação"],
    params
      .map(
        (p) =>
          `<tr><td><button class="link-btn" data-parameter="${e(p.code)}">${e(p.name)}</button></td><td class="mono">${n(p.latest?.value)} ${e(p.latest?.value != null ? p.latest.unit : "")}</td><td class="muted">${e(ruleText(p.latest?.rule, p.latest?.unit))}</td><td>${badge(p.state)}</td></tr>`,
      )
      .join(""),
  );
}
function parameters() {
  const params = state.dashboard?.parameters ?? [];
  return `<div class="table-tools"><label class="search-field">${icon("search")}<input id="parameter-search" type="search" placeholder="Buscar parâmetro" aria-label="Buscar parâmetro" value="${e(state.search)}"></label><span class="small muted">${params.length} parâmetros</span></div><div id="parameter-results">${parameterTable(params.filter((p) => p.name.toLocaleLowerCase("pt-BR").includes(state.search.toLocaleLowerCase("pt-BR"))))}</div>`;
}
function operations() {
  const history = state.route === "history",
    kind = history ? state.tab.history : state.tab.operations,
    list = records(kind);
  const actions = {
    production: "production",
    stoppages: "stoppage",
    losses: "loss",
  };
  return `${history ? tabs(kinds, kind) : tabs(["production", "stoppages", "losses"], kind)}<div class="table-tools"><span class="small muted">${list.length} registros · ${labels[kind]}</span><div class="toolbar-right">${!history && operator() ? button("Novo registro", `form:${actions[kind]}`, "plus", "primary") : ""}</div></div>${table(
    ["Data", "Registro", "Informação", "Ações"],
    list
      .slice()
      .sort((a, b) => b.eventDate.localeCompare(a.eventDate))
      .map(
        (r) =>
          `<tr><td>${date(r.occurredAt ?? r.startedAt ?? r.eventDate, r.occurredAt != null || r.startedAt != null)}</td><td>${e(labels[kind])}<div class="small muted">${e(r.id.slice(0, 10))}</div></td><td>${recordSummary(kind, r)}</td><td><button class="icon-btn" title="Detalhes" aria-label="Detalhes" data-detail="${kind}:${e(r.id)}">${icon("arrow-up-right")}</button>${kind === "stoppages" && r.endedAt == null && operator() ? button("Encerrar", `close:${r.id}`, "square") : ""}${kind === "collections" && operator() ? button("Enviar à Engenharia", `review:${r.id}`, "send") : ""}</td></tr>`,
      )
      .join(""),
  )}`;
}
function recordSummary(kind, r) {
  if (kind === "production")
    return `${n(r.quantity)} peças · ${r.basis === "gross" ? "Bruta" : "Boas"}`;
  if (kind === "losses")
    return `${n(r.amount)} ${r.unit === "pieces" ? "peças" : "kg"} · ${e(name("reasons", r.reasonId))}`;
  if (kind === "stoppages")
    return `${r.endedAt == null ? "Em aberto" : `${n((r.endedAt - r.startedAt) / 60000)} min`} · ${e(name("reasons", r.reasonId))}`;
  if (kind === "collections")
    return `${Object.values(r.readings ?? {}).length} leituras`;
  return badge(r.state);
}
function engineering() {
  const kind = state.tab.engineering;
  return `${tabs(["reviews", "corrections"], kind)}${table(
    ["Data", "Escopo / motivo", "Situação", "Ação"],
    records(kind)
      .map(
        (r) =>
          `<tr><td>${date(r.eventDate)}</td><td><button class="link-btn" data-detail="${kind}:${e(r.id)}">${e(r.scope ?? r.reason)}</button></td><td>${badge(r.state)}</td><td>${engineer() && kind === "reviews" && r.state === "waiting" ? button("Iniciar", `start:${r.id}`, "play") : engineer() && kind === "reviews" && r.state === "analyzing" ? button("Decidir", `decide:${r.id}`, "check") : kind === "corrections" && engineer() && r.state === "waiting" && r.createdBy !== state.actor.uid ? button("Decidir", `correction:${r.id}`, "check") : ""}</td></tr>`,
      )
      .join(""),
  )}<p class="source-notes">Decisões registradas pela Engenharia. Não representam acionamento ou liberação automática da máquina.</p>`;
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
  return `${tabs(["machines", "processes", "products", "parameters", "reasons", "targets"], kind)}<div class="table-tools"><span class="small muted">${rows(kind).length} cadastros</span><div class="toolbar-right">${admin() || (kind === "targets" && engineer()) ? button("Novo cadastro", `form:${form}`, "plus", "primary") : ""}${kind === "parameters" && admin() && state.context.processId ? button("Cadastrar referências", "catalog", "list-plus") : ""}</div></div>${table(
    ["Nome", "Código / vínculo", "Situação", "Ações"],
    rows(kind)
      .map(
        (r) =>
          `<tr><td>${e(r.name)}</td><td>${e(r.code ?? (r.machineId ? name("machines", r.machineId) : r.processId ? name("processes", r.processId) : (r.metric ?? "")))}</td><td><span class="badge ${r.active ? "good" : "neutral"}">${r.active ? "Ativo" : "Inativo"}</span></td><td>${kind === "parameters" && engineer() ? button("Limites", `version:${r.id}`, "sliders-horizontal") : ""}${admin() ? `<button class="icon-btn" title="${r.active ? "Inativar" : "Ativar"}" aria-label="${r.active ? "Inativar" : "Ativar"}" data-action="active:${kind}:${e(r.id)}">${icon(r.active ? "archive" : "archive-restore")}</button>` : ""}</td></tr>`,
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
function settings(){const prefs=readPreferences(),view=readConsultation(),connected=Boolean(state.client)&&!state.simulation;return `<section class="settings-section"><h2>Perfil</h2><form id="profile-form" class="settings-form"><div class="form-grid"><label class="field">Nome<input name="displayName" value="${e(state.client?.displayName??'Fabiana Dias')}" required maxlength="100" ${connected?'':'disabled'}></label><label class="field">E-mail<input value="${e(state.client?.email??'')}" type="email" readonly></label></div><div class="profile-footer"><span class="badge neutral">${e({admin:'Administradora',engineer:'Engenharia',operator:'Operador',viewer:'Leitura'}[state.actor?.role]??'Sem sessão')}</span>${connected?'<button class="btn" type="submit">'+icon('save')+'Salvar perfil</button>':button('Entrar','connect','log-in')}</div></form><div class="setting-row"><div><h3>Senha</h3></div>${connected?button('Alterar senha','change-password','key-round'):''}</div></section><section class="settings-section"><h2>Aparência e acessibilidade</h2><div class="setting-row"><div><h3>Tema</h3></div><div class="segmented">${[['light','sun','Claro'],['dark','moon','Escuro'],['system','monitor','Sistema']].map(([id,ico,title])=>`<button data-theme-choice="${id}" class="${prefs.theme===id?'selected':''}">${icon(ico)}${title}</button>`).join('')}</div></div><div class="setting-row"><div><h3>VLibras</h3><p>Tradução em Libras</p></div><label class="switch"><input id="vlibras-toggle" type="checkbox" aria-label="Ativar VLibras" ${prefs.vlibras?'checked':''}><span class="switch-track"></span></label></div><div class="setting-row"><div><h3>Tabelas compactas</h3></div><label class="switch"><input id="compact-toggle" type="checkbox" aria-label="Tabelas compactas" ${view.compact?'checked':''}><span class="switch-track"></span></label></div></section><section class="settings-section"><h2>Consulta</h2><div class="setting-row"><label class="field" for="default-period">Período inicial</label><select id="default-period">${[7,14,30].map(days=>`<option value="${days}" ${days===view.days?'selected':''}>Últimos ${days} dias</option>`).join('')}</select></div><div class="setting-row"><div><h3>Preferências de consulta</h3></div>${button('Restaurar','reset-consultation','rotate-ccw')}</div></section>`;}
function drawPageCharts() {
  if (state.route !== "dashboard") return;
  const production = records("production").filter(
    (r) =>
      r.startedAt >= dateWindow(state.fromDate, state.toDate).from &&
      r.endedAt <= dateWindow(state.fromDate, state.toDate).to,
  );
  const days = [...new Set(production.map((r) => r.eventDate))].sort();
  drawChart("production-chart", {
    labels: days.map((d) => date(d)),
    datasets: ["gross", "good"].map((basis) => ({
      label: basis === "gross" ? "Bruta" : "Boas",
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
    labels: stops.map((r) => name("reasons", r.reasonId)),
    datasets: [{ label: "Minutos", data: stops.map((r) => r.value) }],
  });
}

function reconcileContext() {
  const m = rows("machines").filter((r) => r.active);
  if (!m.some((r) => r.id === state.context.machineId))
    state.context.machineId = m[0]?.id;
  const p = rows("processes").filter(
    (r) => r.active && r.machineId === state.context.machineId,
  );
  if (!p.some((r) => r.id === state.context.processId))
    state.context.processId = p[0]?.id;
  const products = rows("products").filter(
    (r) => r.active && r.processIds?.[state.context.processId],
  );
  if (!products.some((r) => r.id === state.context.productId))
    state.context.productId = products[0]?.id;
}
async function refresh() {
  if (!state.client) return;
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
    if (state.context.productId) {
      const q = {
        fromDate: state.fromDate,
        toDate: state.toDate,
        context: state.context,
        limit: 500,
      };
      const period = await services().history.loadPeriod(q),
        dashboard = await services().getDashboard(
          q,
          dateWindow(state.fromDate, state.toDate),
        );
      if (ticket !== epoch) return;
      state.period = period;
      state.dashboard = dashboard;
    } else {
      state.period = {};
      state.dashboard = emptyDashboard();
    }
  } catch (error) {
    if (ticket === epoch) state.error = error;
  } finally {
    if (ticket === epoch) {
      state.loading = false;
      layout();
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
  const schedule = () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      if (modal.open) {
        schedule();
        return;
      }
      refresh();
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
}
async function enterCloud(user) {
  if (localSimulation) await endSimulation();
  if (state.client?.email === user.email) return;
  if (cloudEntry) return cloudEntry;
  cloudEntry = (async () => {
    const services = await cloud.session.onWorkspace(workspaceId);
    let actor;
    const off = cloud.session.watchSession((next) => {
      actor = next.actor;
    });
    off();
    state.actor = actor;
    state.client = {
      services,
      repo: cloud.repository(workspaceId),
      email: user.email,
      displayName:user.displayName??(user.email==='adm@adm.com'?'Fabiana Dias':user.email.split('@')[0]),
    };
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
function getCloud() {
  if (cloud) return cloud;
  cloud = createBrowserMsa();
  cloud.session.watchSession((next) => {
    if (localSimulation) {
      if (liveState?.client && !next.actor) {liveState.client=null;liveState.actor=null;}
      return;
    }
    if (state.client && !next.actor) {
      unsubscribe();
      state.client = null;
      state.actor = null;
      state.context = {};
      state.registries = {};
      state.period = {};
      state.dashboard = emptyDashboard();
      if (modal.open) modal.close();
      layout();
    }
  });
  authOff = cloud.auth.watchSession((user) => {
    if (user) enterCloud(user).catch(fail);
  }, fail);
  return cloud;
}
function showModal(
  title,
  body,
  { submit, wide = false, footer = "Salvar" } = {},
) {
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
      btn.disabled = true;
      try {
        await submit(new FormData(form));
        modal.close();
        toast("Operação confirmada.");
        await refresh();
      } catch (error) {
        form.querySelector(".form-error").textContent = errorText(error);
      } finally {
        btn.disabled = false;
      }
    });
}
function openForm(kind, record = {}) {
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
    formMarkup(kind, {
      registries: state.registries,
      context: state.context,
      record,
      catalog: getMsaParameterCatalog(),
    }),
    {
      wide: kind === "collection",
      submit: (data) =>
        submitForm(kind, data, {
          services: services(),
          context: state.context,
          registries: state.registries,
          record,
        }),
    },
  );
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
    `<div class="detail-header"><h2>${recordSummary(kind, r)}</h2></div><dl class="detail-list">${fields.map(([k, v]) => `<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join("")}</dl>${
      kind === "collections"
        ? table(
            ["Parâmetro", "Leitura original", "Situação"],
            Object.values(r.readings ?? {})
              .map(
                (reading) =>
                  `<tr><td>${e(name("parameters", reading.parameterId))}</td><td>${e(reading.raw)}</td><td>${badge(evaluateReading(reading, state.registries.parameterVersions?.[reading.versionId]).state)}</td></tr>`,
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
    }`,
  );
}
function parameterDetail(code) {
  const p = state.dashboard?.parameters.find((p) => p.code === code);
  if (!p) return;
  const stat = p.statistics.find((s) => s.versionId === p.latest?.versionId);
  showModal(
    p.name,
    `<div class="detail-header"><div class="detail-value">${value(p.latest?.value, p.latest?.unit ?? p.unit)}</div>${badge(p.state)}</div><p class="detail-meta">${e(ruleText(p.latest?.rule, p.latest?.unit))} · ${p.latest ? date(p.latest.occurredAt ?? p.latest.eventDate, !!p.latest.occurredAt) : "Sem leitura"}</p><div class="chart-frame"><canvas id="parameter-chart" role="img" aria-label="Histórico do parâmetro"></canvas></div><dl class="modal-statistics">${[
      ["Média", stat?.mean],
      ["Desvio", stat?.sigma],
      ["Cp", stat?.cp],
      ["Cpk", stat?.cpk],
    ]
      .map(([label, v]) => `<div><dt>${label}</dt><dd>${n(v)}</dd></div>`)
      .join(
        "",
      )}</dl><p class="source-notes">${stat ? `${stat.nValid} leituras válidas · Sigma populacional · Cp/Cpk estimados, não homologados.` : "Sem amostra estatística nesta versão."}</p><p class="source-notes">${e(statisticsReason(stat?.reason))}</p><p class="source-notes">${e((p.questions ?? []).join(" "))}</p>${engineer() && p.parameterIds.length === 1 ? button("Nova versão", `version:${p.parameterIds[0]}`, "sliders-horizontal") : ""}`,
  );
  const series = state.dashboard.series
    .filter(
      (s) =>
        s.parameterId === p.latest?.parameterId &&
        s.versionId === p.latest?.versionId,
    )
    .sort((a, b) => (a.occurredAt ?? 0) - (b.occurredAt ?? 0));
  drawChart("parameter-chart", {
    labels: series.map((s) =>
      date(s.occurredAt ?? s.eventDate, !!s.occurredAt),
    ),
    datasets: [
      {
        type: "line",
        label: p.name,
        data: series.map((s) => (s.status === "valid" ? s.value : null)),
      },
    ],
  });
}

async function exportCsv() {
  const kind =
    state.route === "operations"
      ? state.tab.operations
      : state.route === "history"
        ? state.tab.history
        : "collections";
  const columns = [
    "id",
    "eventDate",
    "context.machineId",
    "context.processId",
    "context.productId",
    "createdBy",
    ...{
      production: ["quantity", "basis", "startedAt", "endedAt"],
      stoppages: ["startedAt", "endedAt", "reasonId", "planned"],
      losses: ["kind", "amount", "unit", "reasonId"],
      collections: ["readings"],
      reviews: ["state", "scope", "history"],
      corrections: ["state", "reason", "replacement"],
    }[kind],
  ];
  const csv = await services().csv.exportRecords(records(kind), columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = `msa-${kind}-${state.fromDate}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function action(action) {
  const [command, id, extra] = action.split(":");
  if (command === "theme") {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    writePreferences({ theme: next });
    applyTheme(next);
    layout();
    return;
  }
  if (command === "password") {
    const input = modal.querySelector("[name=password]");
    input.type = input.type === "password" ? "text" : "password";
    return;
  }
  if (command === "close-modal") {
    modal.close();
    return;
  }
  if (command === "menu") {
    state.menuOpen = !state.menuOpen;
    document.querySelector(".rail").classList.toggle("open", state.menuOpen);
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
    showModal('Simular cenário', `<p class="source-notes">Dados fictícios em memória. Cadastros, apontamentos e decisões neste cenário não alteram os registros do Firebase.</p><label class="field">Cenário<select name="scenario">${simulationCases.map(c=>`<option value="${c.id}">${e(c.name)}</option>`).join('')}</select></label>`, {footer:'Iniciar simulação',submit:data=>startSimulation(data.get('scenario'))});
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
    if (localSimulation) return endSimulation();
    unsubscribe();
    await cloud?.auth.signOut();
    state.client = null;
    state.actor = null;
    state.context = {};
    state.registries = {};
    state.period = {};
    state.dashboard = emptyDashboard();
    sessionStorage.removeItem("msa.session.mode");
    layout();
    return;
  }
  if (command === "refresh") return refresh();

  if (command === "export") return exportCsv();
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
    return openForm("parameterVersion", { parameterId: id });
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
    showModal(
      "Decidir correção",
      '<label class="field">Decisão<select name="decision"><option value="approved">Aprovar</option><option value="rejected">Não aprovar</option></select></label><label class="field">Justificativa<textarea name="justification" required></textarea></label>',
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
document.addEventListener("click", (event) => {
  const target = event.target.closest(
    "[data-action],[data-tab],[data-parameter],[data-detail],[data-theme-choice]",
  );
  if (!target) return;
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
  if (event.target.id === "parameter-search") {
    state.search = event.target.value;
    document.getElementById("parameter-results").innerHTML = parameterTable(
      (state.dashboard?.parameters ?? []).filter((p) =>
        p.name
          .toLocaleLowerCase("pt-BR")
          .includes(state.search.toLocaleLowerCase("pt-BR")),
      ),
    );
    icons();
  }
});
document.addEventListener("change", async (event) => {
  try {
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
      reconcileContext();
      await refresh();
    } else if (event.target.id === "period") {
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
modal.addEventListener("close", () =>
  document.body.classList.remove("modal-open"),
);
window.addEventListener("hashchange", () => {
  state.menuOpen = false;
  state.route = location.hash.slice(1) || "dashboard";
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
layout();
getCloud();
