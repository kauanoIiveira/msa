import {validateDate,eventDate} from '../domain/time.js';
import {requireThat} from '../domain/errors.js';
export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Display aliases for the original included records; stored text and exports stay intact.
const recordLabels=new Map([
 ['Dimensão de encaixe · exemplo didático','Dimensão de encaixe'],
 ['Resultado de ensaio · exemplo didático','Resultado de ensaio'],
 ['Dados fictícios de apresentação','Registros do sistema'],
 ['Exemplo hipotético de apresentação · não é ciclo ideal aprovado da NHPL','Referência de OEE · NHPL'],
 ['Exemplo hipotético MARK V · sem homologação industrial','Referência de OEE · MARK V'],
 ['Inspeção e histórico de falhas completos somente neste exemplo didático','Inspeção e histórico de falhas completos'],
 ['Exemplo: falha classificada com reparo de cinco minutos','Falha classificada com reparo de cinco minutos'],
 ['Microparada demonstrativa tratada como perda de desempenho','Microparada tratada como perda de desempenho'],
 ['Nova análise · conferir montagem, inspeção e estudo Cp/Cpk didático','Nova análise · conferir montagem, inspeção e estudo Cp/Cpk'],
 ['Plano de controle fictício AP-01','Plano de controle AP-01'],
 ['Inspeção didática registrada','Inspeção registrada'],
 ['Resultado demonstrativo','Resultado registrado'],
 ['Não é laudo industrial',''],
 ['Conferência didática da digitação','Conferência da digitação'],
 ['Verificar causa da interrupção e retorno de peças boas · exemplo','Verificar causa da interrupção e retorno de peças boas'],
 ['Inspeção didática MARK V','Inspeção MARK V'],
 ['Microparada capturada por eventos de exemplo; fim com boa validada','Microparada capturada por eventos; fim com boa validada'],
]);
export const recordLabel=value=>recordLabels.get(String(value??''))??String(value??'');
export const escapeRecordText=value=>escapeHtml(recordLabel(value));
export function number(value,digits=2) {return Number.isFinite(value)?new Intl.NumberFormat('pt-BR',{maximumFractionDigits:digits}).format(value):'—';}
export function dateWindow(fromDate,toDate) {
  validateDate(fromDate);validateDate(toDate);requireThat(toDate>=fromDate,'INVALID_PERIOD');
  return {from:Date.parse(fromDate+'T00:00:00-03:00'),to:Date.parse(toDate+'T00:00:00-03:00')+86400000};
}
export function dayOffset(date,offset) {validateDate(date);return new Date(Date.parse(date+'T12:00:00Z')+offset*86400000).toISOString().slice(0,10);}
export const today=()=>eventDate(Date.now());
export function date(value,withTime=false) {
  if(value==null) return 'Sem data';
  const parsed=typeof value==='number'?new Date(value):new Date(value+'T12:00:00Z');
  if(!Number.isFinite(parsed.getTime())) return 'Data inválida';
  return new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',...(withTime?{hour:'2-digit',minute:'2-digit',second:'2-digit'}:{})}).format(parsed);
}
export const states={within:'Dentro da faixa',outside:'Fora da faixa',pending:'Limite pendente',missing:'Sem leitura',invalid:'Leitura inválida','not-configured':'Não cadastrado','no-version':'Sem versão','no-data':'Sem leitura','latest-time-ambiguous':'Horário indefinido','revision-conflict':'Revisão conflitante','duplicate-parameter-code':'Cadastro duplicado',waiting:'Aguardando análise',analyzing:'Em análise',approved:'Aprovado',rejected:'Não aprovado',draft:'Rascunho'};
export function badge(state) {const tone=['outside','invalid','rejected','revision-conflict'].includes(state)?'bad':['within','approved'].includes(state)?'good':['pending','waiting','analyzing','draft'].includes(state)?'warn':'neutral';return `<span class="badge ${tone}">${escapeHtml(states[state]??state)}</span>`;}
export function ruleText(rule,unit='') {if(!rule||rule.kind==='pending') return 'A confirmar';if(rule.kind==='range') return `${number(rule.lower)} a ${number(rule.upper)} ${unit}`;return `${rule.kind==='lower'?'≥':'≤'} ${number(rule.lower??rule.upper)} ${unit}`;}
export function errorText(error) {
  const capture={EVENT_FORMAT:'Formato de evento inválido. Confira o contrato JSON.',EVENT_ORDER:'Evento fora de ordem. Confira sequência e horário da fonte.',EVENT_CONFLICT:'O mesmo evento já existe com conteúdo diferente.',EVENT_CONTEXT:'Contexto da fonte não corresponde ao intervalo ou mudou sem iniciar nova fonte.',COUNTER_RESET:'Contador retrocedeu. Identifique a nova época do contador.',QUALITY_REQUIRED:'A retomada exige produção boa validada.'};
  if(capture[error?.code])return capture[error.code];
  const productionErrors={PLAN_OVERLAP:'Já existe um plano para esse recurso no período.',CONFLICT:'Os dados mudaram. Atualize e confira novamente.',PLANNING_REQUIRED:'A produção NHPL exige um intervalo aprovado.',POLICY_REQUIRED:'Cadastre a vigência do takt antes de usar a sugestão.',PERIOD_OPEN:'O intervalo ainda está em andamento.',MISSING_PRODUCTION:'Registre o total bruto, inclusive zero quando confirmado.',CORRECTION_REQUIRED:'O registro está confirmado. Use uma correção auditada.',INCOMPLETE_DATA:'Dados incompletos. Atualize antes de confirmar.',INVALID_TIME:'Confira a ordem e os horários informados.',REVISION_CONFLICT:'Revisões conflitantes. A avaliação está suspensa.'};
  if(productionErrors[error?.code])return productionErrors[error.code];
  if(error?.code==='STALE_PLAN')return 'Este intervalo foi substituído ou está suspenso para revisão. Atualize o planejamento.';
  if(error?.code==='PASSWORD_MISMATCH')return 'As senhas não coincidem.';
  if(error?.field==='password')return 'Informe a senha atual e uma nova senha com pelo menos 6 caracteres.';
  const codes={FORBIDDEN:'Seu perfil não tem permissão para esta ação.',AUTH_REQUIRED:'Entre para continuar.',STALE_SESSION:'Sua sessão terminou. Entre novamente.',DEMO_LOGIN:'E-mail ou senha de demonstração incorretos.',INVALID_PERIOD:'Confira as datas e a duração do período.',INVALID_QUANTITY:'Informe uma quantidade válida.',INVALID_LIMIT:'Confira os limites. O mínimo deve ser menor que o máximo.',INVALID_REFERENCE:'Selecione um cadastro válido.',CSV_TOO_LARGE:'O arquivo deve ter até 5 MB e 10 mil linhas.',IMPORT_CONFLICT:'Esta fonte já foi importada com outro conteúdo. Revise o arquivo e sua identificação.',PREVIEW_CHANGED:'A prévia mudou. Reabra a importação e confira novamente.',OPEN_STOPPAGE:'Encerre a parada antes de propor uma correção.',SELF_APPROVAL:'A correção precisa ser decidida por outra pessoa.',INVALID_TRANSITION:'Este registro já mudou de estado. Atualize a página.',EMPTY_WORKSPACE_REQUIRED:'O cenário de teste só pode ser criado em um workspace vazio.',CATALOG_CONFLICT:'Já existe um cadastro conflitante. Revise os parâmetros.',NETWORK:'Sem conexão. A gravação não foi confirmada.'};
  if(error?.code==='VLIBRAS_UNAVAILABLE')return 'VLibras indisponível. Verifique sua conexão e tente novamente.';
  const message=String(error?.message??'');if(error?.code==='INVALID_LOGIN'||message.includes('invalid-credential')||message.includes('wrong-password')) return 'RE ou senha incorretos.';
  if(message.includes('network-request-failed')) return 'Não foi possível conectar ao Firebase.';
  return codes[error?.code]??(error?.field?`Confira o campo ${error.field}.`:'Não foi possível concluir. Confira os dados e tente novamente.');
}
