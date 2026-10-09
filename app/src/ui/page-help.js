// Points to existing controls without activating them or changing #app.
const step=(title,text,...selectors)=>({title,text,selectors});
const filters=step('Filtros da consulta','Abra aqui para escolher máquina, produto, turno e período. Depois, aplique os filtros.','.query-details > summary');
const recording=step('Escolher produção','Escolha a produção que receberá os próximos registros. Confira máquina, OP e lote antes de salvar.','[data-action="choose-production"]');
const details=step('Detalhes do registro','Clique aqui para conferir valores, autoria e histórico deste registro.','#page [data-detail]','#page [data-action^="equipment-detail:"]');
const guides={
 login:['Acesse sua conta',[
  step('Seu RE','Digite seu RE de cinco dígitos para identificar sua conta.','#login-re'),
  step('Sua senha','Digite sua senha. O ícone de olho permite conferir o que foi digitado.','#login .password-field'),
  step('Entrar','Clique aqui para acessar as funções disponíveis para seu perfil.','#login [type="submit"]')]],
 dashboard:['Visão geral',[filters,
  step('Resumo do período','Estes cartões mostram os resultados do contexto e período escolhidos.','#page .metric'),
  step('Explorar os resultados','Acompanhe neste gráfico a evolução da produção no período.','#production-chart','#nhpl-interval-chart','#page .chart-empty'),
  step('Abrir um parâmetro','Clique para ver a leitura, a referência e o histórico.','#page [data-parameter]'),
  step('Conferir pendências','Abra esta lista para consultar o que precisa de atenção.','#page .pending-band summary')]],
 production:['Produção',[recording,filters,
  step('Resumo e hora a hora','Veja o realizado e compare a produção nos intervalos consultados.','[data-page-tab="summary"]'),
  step('Planejamento','Abra esta aba para consultar e preparar os planos de produção.','[data-page-tab="planning"]'),
  step('Apontamentos','Consulte os registros e use Registrar produção para informar as quantidades.','[data-page-tab="records"]'),
  step('Horários','Acompanhe quando a máquina e a produção começaram e terminaram.','[data-page-tab="times"]'),
  step('Ocorrências','Consulte ou registre relatos de qualidade, processo e manutenção.','[data-page-tab="occurrences"]'),
  step('Registrar produção','Informe a quantidade e o intervalo da produção selecionada.','[data-action="form:production"]'),
  step('Novo plano','Prepare os intervalos e as quantidades planejadas para este contexto.','[data-action="nhpl:plan"]')]],
 equipment:['Equipamentos',[
  step('Buscar equipamento','Digite um código, nome ou produto para localizar os equipamentos.','#equipment-search'),
  step('Filtrar por situação','Encontre máquinas com produção, paradas ou pendências.','#equipment-status'),details,
  step('Limpar filtros','Volte a mostrar todos os equipamentos da consulta.','[data-action="equipment-clear"]')]],
 stoppages:['Paradas',[recording,
  step('Paradas em aberto','Consulte as paradas que ainda precisam ser encerradas.','[data-page-tab="open"]'),
  step('Registrar parada','Informe início e motivo da parada na produção selecionada.','[data-action="form:stoppage"]'),
  step('Encerrar parada','Quando a parada terminar, informe aqui o horário de encerramento.','#page [data-action^="close:"]'),
  step('Histórico de paradas','Consulte as paradas registradas e abra seus detalhes.','[data-page-tab="history"]'),
  step('Classificação técnica','A equipe técnica classifica as falhas e informa os dados de reparo nesta aba.','[data-page-tab="classification"]')]],
 quality:['Qualidade',[recording,
  step('Refugos e perdas','Consulte os apontamentos de peças refugadas e perdas de material.','[data-page-tab="losses"]'),
  step('Registrar refugo ou perda','Informe quantidade, unidade e motivo para a produção selecionada.','[data-action="form:loss"]'),
  step('Inspeções','Confira as peças boas de primeira passagem e a cobertura dos intervalos.','[data-page-tab="inspections"]'),details]],
 parameters:['Parâmetros',[recording,filters,
  step('Buscar parâmetro','Digite parte do nome para encontrar rapidamente um parâmetro na tabela.','#parameter-search'),
  step('Consultar a leitura','Clique no nome para ver a leitura, seus limites e o histórico.','#page [data-parameter]'),
  step('Nova coleta','Abra o formulário para registrar as leituras na produção selecionada.','[data-action="form:collection"]')]],
 engineering:['Engenharia',[filters,
  step('Fila de trabalho','Escolha Análises, Correções ou Ocorrências para consultar a fila correspondente.','#page .tabs'),details,
  step('Iniciar análise','Assuma a análise e confira os dados e evidências antes de decidir.','#page [data-action^="start:"]'),
  step('Decidir','Registre a decisão e sua justificativa. Correções precisam de outro responsável.','#page [data-action^="decide:"]','#page [data-action^="correction:"]'),
  step('Nova análise','Abra uma análise para uma coleta que precise de revisão técnica.','[data-action="new-review"]')]],
 cep:['CEP e capacidade',[
  step('Estudo para apresentação','Quando a fonte não atende aos requisitos, o exemplo mostra Cp/Cpk calculados com leituras ilustrativas. Escolha Somente dados originais para conferir a fonte.','[data-cep="view"]'),
  step('Fonte do estudo','Escolha os registros do sistema ou a planilha fornecida pela empresa.','#cep-source'),
  step('Parâmetro do estudo','Selecione a característica que deseja analisar.','#cep-parameter'),
  step('Versão e contexto','Escolha observações com contexto e referência compatíveis.','[data-cep="group"]','[data-cep="versionId"]'),
  step('Mínimo de leituras','Defina a quantidade mínima de observações exigida pelo estudo.','[data-cep="minSamples"]'),
  step('Cartas de controle','Confira a variação das leituras e os sinais de instabilidade.','#cep-chart','#cep-results .section-heading'),
  step('Exportar estudo','Baixe os resultados e observações. É preciso ter leituras disponíveis.','[data-action="cep-export"]')]],
 indicators:['Indicadores',[filters,
  step('Confiabilidade','Confira MTBF e MTTR e os motivos exibidos quando faltam bases para o cálculo.','#page .metric'),
  step('Bases dos indicadores','Confira os intervalos e a cobertura que sustentam os indicadores.','#page .data-table thead'),
  step('Painel TV','Abra uma visão ampliada para acompanhar a produção.','#page a[href="#tv"]')]],
 history:['Histórico',[filters,
  step('Tipo de registro','Escolha a aba de coletas, produção, paradas, perdas, análises ou correções.','#page .tabs'),details,
  step('Importar CSV','Abra a importação de coletas e confira a prévia antes de confirmar.','[data-action="csv-import"]'),
  step('Exportar consulta','Baixe os registros do contexto e período consultados.','.page-actions [data-action="export"]')]],
 reports:['Relatórios',[filters,
  step('Atualizar consulta','Atualize antes de exportar. Se a consulta estiver incompleta, reduza o período.','#page [data-action="refresh"]'),
  step('Baixar CSV','Escolha o tipo de arquivo. O botão informa a quantidade de registros.','#page [data-action^="bi-export:"]'),
  step('Conferir a prévia','Confira as primeiras coletas, leituras e rastreabilidade antes de baixar.','#page .report-preview thead')]],
 registry:['Cadastros',[
  step('Tipo de cadastro','Escolha a aba do item que deseja consultar ou cadastrar.','#page .tabs'),
  step('Novo cadastro','Crie um item na aba selecionada e confira seus vínculos.','#page [data-action^="form:"]'),
  step('Editar cadastro','Atualize o nome ou código preservando os vínculos históricos.','#page [data-action^="registry-edit:"]'),
  step('Ativar ou inativar','Altere a disponibilidade do cadastro para as próximas operações.','#page [data-action^="active:"]'),
  step('Limites do parâmetro','Consulte e revise as referências usadas para avaliar as leituras.','#page [data-action^="version:"]')]],
 settings:['Configurações',[
  step('Seu perfil','Confira seu RE, nome e acesso. Use Salvar perfil após editar o nome.','#profile-form [name="displayName"]'),
  step('Alterar senha','Informe a senha atual e confirme a nova senha pelo formulário.','[data-action="change-password"]'),
  step('Escolher tema','Selecione Claro, Escuro ou Sistema para ajustar a aparência.','#page .segmented'),
  step('VLibras','Ative ou desative a tradução em Libras por este controle.','#page .switch:has(#vlibras-toggle)'),
  step('Tabelas compactas','Reduza o espaçamento das tabelas para mostrar mais registros.','#page .switch:has(#compact-toggle)'),
  step('Período inicial','Escolha o período usado inicialmente nas suas consultas.','#default-period')]],
 capture:['Importação de dados',[filters,
  step('Importar eventos','Abra o formulário para conferir e importar eventos da fonte de dados.','[data-action="tech:events"]'),
  step('Pasta local','Com o conector preparado, acompanhe os eventos recebidos da pasta local.','[data-action="tech:connector"]','[data-action="connector-stop"]'),
  step('Estado da fonte','Confira a última atualização e os diagnósticos de recebimento.','#page .setting-row')]],
 tv:['Acompanhamento da produção',[
  step('Tela cheia','Amplie o painel para acompanhar a produção em uma tela de apresentação.','[data-action="tv-fullscreen"]'),
  step('Indicadores da produção','Acompanhe os resultados e motivos de valores indisponíveis.','#page .metric'),
  step('Voltar ao painel','Retorne à página de indicadores por este botão.','[data-action="tv-back"]')]],
};

export function mountPageHelp(){
 const host=document.createElement('div');host.className='msa-page-help';
 host.innerHTML=`<button type="button" class="msa-help-trigger" aria-controls="msa-help-panel" aria-label="Como usar esta página" aria-expanded="false" title="Como usar esta página"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4"/><path d="M12 18h.01"/></svg></button><div class="msa-help-spotlight" hidden aria-hidden="true"></div><section id="msa-help-panel" class="msa-help-panel" hidden role="dialog" aria-modal="false" aria-labelledby="msa-help-title" aria-describedby="msa-help-description"><span class="msa-help-pointer" aria-hidden="true"></span><header><span class="msa-help-eyebrow"></span><button type="button" class="msa-help-close" aria-label="Fechar ajuda"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header><div aria-live="polite" aria-atomic="true"><h2 id="msa-help-title"></h2><p id="msa-help-description"></p></div><footer><button type="button" class="msa-help-previous">Anterior</button><button type="button" class="msa-help-next">Próximo <span aria-hidden="true">→</span></button></footer></section>`;
 document.body.append(host);
 const trigger=host.querySelector('.msa-help-trigger'),panel=host.querySelector('.msa-help-panel'),spotlight=host.querySelector('.msa-help-spotlight'),previous=host.querySelector('.msa-help-previous'),next=host.querySelector('.msa-help-next');
 let currentRoute='login',active=false,steps=[],index=0,frame,returnScroll;
 const findTarget=spec=>spec.selectors.flatMap(selector=>[...document.querySelectorAll(`#app ${selector}`)]).find(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
 const clamp=(value,min,max)=>Math.max(min,Math.min(value,max));
 function close({restore=true}={}){
  if(!active)return;active=false;cancelAnimationFrame(frame);observer.disconnect();panel.hidden=spotlight.hidden=true;trigger.setAttribute('aria-expanded','false');
  if(restore){window.scrollTo({left:returnScroll.x,top:returnScroll.y,behavior:'instant'});trigger.focus({preventScroll:true});}
 }
 function position(){
  if(!active)return;
  const target=findTarget(steps[index]);if(!target||document.querySelector('#modal[open]'))return close({restore:false});
  const rect=target.getBoundingClientRect(),width=innerWidth,height=innerHeight;
  const left=clamp(rect.left-5,4,width-4),top=clamp(rect.top-5,4,height-4),right=clamp(rect.right+5,left,width-4),bottom=clamp(rect.bottom+5,top,height-4);
  Object.assign(spotlight.style,{left:`${left}px`,top:`${top}px`,width:`${right-left}px`,height:`${bottom-top}px`});
  const tip=panel.getBoundingClientRect(),gap=14,margin=12;let x,y,side;
  if(width-right>=tip.width+gap+margin){x=right+gap;y=(top+bottom-tip.height)/2;side='left';}
  else if(left>=tip.width+gap+margin){x=left-tip.width-gap;y=(top+bottom-tip.height)/2;side='right';}
  else if(height-bottom>=tip.height+gap+margin){x=(left+right-tip.width)/2;y=bottom+gap;side='top';}
  else{x=(left+right-tip.width)/2;y=top-tip.height-gap;side='bottom';}
  x=clamp(x,margin,width-tip.width-margin);y=clamp(y,margin,height-tip.height-margin);
  Object.assign(panel.style,{left:`${x}px`,top:`${y}px`});panel.dataset.side=side;
  panel.style.setProperty('--pointer-offset',`${['top','bottom'].includes(side)?clamp((left+right)/2-x,22,tip.width-22):clamp((top+bottom)/2-y,22,tip.height-22)}px`);
 }
 function schedulePosition(){if(active){cancelAnimationFrame(frame);frame=requestAnimationFrame(position);}}
 const observer=new MutationObserver(schedulePosition);
 function showStep(){
  const target=findTarget(steps[index]);if(!target)return close();
  host.querySelector('.msa-help-eyebrow').textContent=`${index+1} de ${steps.length} · ${guides[currentRoute]?.[0]??'Guia rápido'}`;
  host.querySelector('#msa-help-title').textContent=steps[index].title;host.querySelector('#msa-help-description').textContent=steps[index].text;
  previous.disabled=index===0;next.innerHTML=index===steps.length-1?'Concluir <span aria-hidden="true">✓</span>':'Próximo <span aria-hidden="true">→</span>';
  target.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});position();
 }
 trigger.addEventListener('click',()=>{
  if(active)return close();steps=(guides[currentRoute]?.[1]??[]).filter(findTarget);if(!steps.length)return;
  returnScroll={x:scrollX,y:scrollY};active=true;index=0;panel.hidden=spotlight.hidden=false;trigger.setAttribute('aria-expanded','true');showStep();
  observer.observe(document.getElementById('app'),{childList:true,subtree:true});next.focus({preventScroll:true});
 });
 host.querySelector('.msa-help-close').addEventListener('click',()=>close());
 previous.addEventListener('click',()=>{if(index>0){index--;showStep();}});
 next.addEventListener('click',()=>{if(index===steps.length-1)close();else{index++;showStep();}});
 document.addEventListener('keydown',event=>{if(active&&event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}},true);
 document.addEventListener('pointerdown',event=>{if(active&&!host.contains(event.target))close({restore:false});},true);
 document.addEventListener('focusin',event=>{if(active&&!host.contains(event.target))close({restore:false});});
 window.addEventListener('resize',schedulePosition);document.addEventListener('scroll',schedulePosition,true);
 return route=>{if(route!==currentRoute){close({restore:false});currentRoute=route;}};
}
