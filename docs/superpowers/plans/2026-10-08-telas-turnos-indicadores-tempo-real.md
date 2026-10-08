# Telas, turnos, indicadores e simulação contínua — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Organizar o MSA por tarefa, preservar suas funções, acrescentar filtros de turno e indicadores claros e manter todas as telas atualizadas por uma fonte simulada contínua.

**Architecture:** Uma consulta compartilhada define janelas operacionais; projeções puras calculam indicadores e pendências a partir dos serviços existentes. A fonte contínua grava um snapshot persistente próprio, com cursor e eventos atômicos, sem alterar a base anterior. Renderizadores por tarefa consomem essas projeções; o gerador pertence à sessão autenticada, independente da rota.

**Tech Stack:** JavaScript ES modules, Node.js >=22, node:test, Chart.js 4.5.1, Lucide, PapaParse 5.7.0, CSS atual e Web Locks; sem novo framework ou dependência.

**Spec:** `docs/superpowers/specs/2026-10-08-organizacao-telas-turnos-indicadores-design.md`, incluindo seção 13 adicionada após a aprovação da organização.

**Local de execução:** `C:/Users/Aluno/Desktop/msa-master`. A pasta inicialmente fornecida, `C:/Users/Aluno/Documents/ChatGPT/MSA`, não contém a aplicação. Esta cópia não tem `.git`: não inventar commits ou assumir que o repositório vazio representa a entrega. Antes da execução, preservar uma cópia dos arquivos afetados em diretório exclusivo da tarefa; se houver checkout Git real identificado, usar branch `codex/` e a skill de worktrees. Não fazer push/deploy.

## Global Constraints

- Nenhuma funcionalidade existente será excluída nesta entrega; funções reorganizadas conservam destino e rotas de compatibilidade.
- Preservar os dois gráficos do Dashboard: plano/bruta/mínimo por intervalo e plano/bruta acumulados. Preservar também gráficos de parâmetros, CEP, hora a hora legado e produção/paradas dos contextos históricos.
- Preservar NHPL/Montagem, VGARD HP e MARK V, variantes, OP, lote, receita, autor, origem, histórico e referências. Não transferir parâmetros T20/selos para NHPL.
- Produtividade permanece produção **bruta** realizada / plano aprovado × 100. Meta de 95% conforme a política vigente; takt informado de 12 s auxilia planejamento, sem virar ciclo ideal do OEE.
- Não reduzir o plano retrospectivamente por parada imprevista. Não ratear quantidade entre horas/turnos sem evidência.
- Ausência, conflito, cobertura parcial, valor confirmado igual a zero e período futuro são situações distintas.
- Boas, bruta, refugo em peças, retrabalho e material em kg mantêm bases distintas. Bruta não recebe nova soma de boas ou refugo.
- Conservar login obrigatório, retorno ao login no logout, ausência do botão de simulação no login e correção de reabertura dos limites. Não reintroduzir avisos de dados fictícios na rotina. Proveniência armazenada e exportável permanece.
- Conservar os quatro perfis, decisões auditadas, versões de referências e proibição de aprovar a própria correção, inclusive para Administração.
- Manter importação e backup em Configurações; TV acessível por Indicadores. Não recriar os atalhos repetidos que já foram retirados.
- Manter JavaScript ES modules, Chart.js e estilos atuais, sem migração de framework, nova biblioteca de gráficos ou cópia de código/ativos do concorrente.
- Esta revisão não inclui chat, funcionários, mapa/3D, integração física, limpeza de armazenamento, push ou deploy.

## Review Focus

1. Consulta de vários dias/turno 3 em outro fuso: usar janelas separadas de São Paulo, sem somar o intervalo entre elas; tarefa 1.
2. Legado divergente/quantidade cruzando turno: preservar o registro e diagnosticar cobertura, sem rateio ou desaparecimento; tarefas 1 e 2.
3. Ciclos mistos, falha anterior e reparo que termina depois: OEE ponderado e conjuntos independentes de MTBF/MTTR; tarefa 3.
4. Duas abas, quota excedida ou reload durante gravação: persistir evento e cursor juntos, sem duplicação/perda nem produção offline; tarefa 6.
5. Formulário aberto, logout e perfil Consulta: fonte segue sem destruir edição, descarte interrompe escrita e permissões não são elevadas; tarefas 7 e 9.

## Mapa de arquivos e contratos compartilhados

| Unidade | Arquivo principal | Responsabilidade |
|---|---|---|
| Turnos | `app/src/domain/shifts.js` | Datas operacionais, janelas, seleção e diagnósticos |
| Consulta | `app/src/ui/operational-query.js` | Contexto de consulta separado do registro e recorte comum |
| Indicadores | `app/src/domain/period-metrics.js` | OEE ponderado, confiabilidade e microparadas |
| Pendências | `app/src/domain/pending.js` | Entidades abertas e conferências do período |
| Evolução contínua | `app/src/domain/live-scenario.js` | Ciclos, agenda, comandos e cursor puros |
| Persistência contínua | `app/src/ui/live-workspace.js` | Base, serviços, locks, lote atômico e descarte |
| Fonte na interface | `app/src/ui/live-controls.js` | Estado/controles e atualização incremental |
| Navegação | `app/src/ui/workspace-routes.js` | Aliases, permissões, tabs e retorno |
| Telas operacionais | `app/src/ui/production-page.js`, `stoppages-page.js`, `quality-page.js` | Reaproveitar ações e renderizadores |
| Entrada e indicadores | `app/src/ui/overview.js` | Quatro cartões, alertas e explicações |

Tipos em documentação/JSDoc, sem introduzir TypeScript:

- `Window = {from:number,to:number}` em ms, intervalo `[from,to)`.
- `Consultation = {fromDate:string,toDate:string,shift:'all'|'1'|'2'|'3',context:Object}`; `context` nunca contém `shift:'all'`.
- `OperationalQuery = {consultation:Consultation,windows:Window[],range:Window,query:Object}`; `query` usa datas civis do envelope para o serviço atual; `windows` controla a seleção final.
- `Metric = {value:number|null,state:'final'|'partial'|'unavailable',reason:string|null,coverage:Object}`; percentuais internos são frações, duração interna em segundos.
- `LivePack = {schemaVersion:1,mode:'live',revision:number,fromDate:string,toDate:string,context:Object,data:Object,cursor:LiveCursor}`; a única gravação persistente do lote inclui `data` e `cursor`.

## Task 1: Turnos e datas operacionais

**Files:** Create `app/src/domain/shifts.js`; Test `tests/unit/shifts.test.js`.

**Interfaces:** Produz `normalizeShift(value):'1'|'2'|'3'|null`, `shiftAt(instant):{shift,operationalDate,from,to}`, `shiftWindows(fromDate,toDate,shift='all'):Window[]`, `classifyRecord(kind,row,windows):{included:boolean,allocated:boolean,diagnostics:string[]}` e `assertShiftPeriod(context,from,to):void`. Consome `eventDate`, `validateDate` de `domain/time.js`; timezone fixo `America/Sao_Paulo`.

- [ ] Escrever os testes de fronteiras, janelas disjuntas e dados antigos:

```js
assert.equal(shiftAt(Date.parse('2026-10-09T06:59:59-03:00')).operationalDate,'2026-10-08');
assert.equal(shiftAt(Date.parse('2026-10-09T07:00:00-03:00')).shift,'1');
assert.equal(shiftAt(Date.parse('2026-10-08T15:00:00-03:00')).shift,'2');
assert.equal(shiftAt(Date.parse('2026-10-08T23:00:00-03:00')).shift,'3');
assert.equal(shiftWindows('2026-10-08','2026-10-10','1').length,3);
assert.equal(shiftWindows('2026-10-08','2026-10-08','3')[0].to,
 Date.parse('2026-10-09T07:00:00-03:00'));
assert.equal(normalizeShift('2º turno'),'2');
assert.equal(normalizeShift('all'),null);
assert.equal(classifyRecord('production',crosses15,firstShift).allocated,false);
assert.ok(classifyRecord('production',label2At13,firstShift).diagnostics.includes('shift-conflict'));
assert.deepEqual(label2At13,originalLabel2At13);
```

- [ ] Rodar `node --test tests/unit/shifts.test.js`; esperado FAIL por módulo ausente. Rodar também com `TZ=UTC` e `TZ=Asia/Tokyo` pelo ambiente do processo Node, sem depender do shell para conversão.
- [ ] Implementar interfaces: datas válidas e ordem limitada pelos contratos atuais; Todos une dias operacionais 07–07; turno específico gera janelas diárias. Instantes usam ocorrência; produção/parada usam período físico; `createdAt` não supre dado ausente. Quantidade parcialmente intersectante fica no diagnóstico com original; duração será recortada na tarefa 3. Novo plano/incremento não atravessa turno; registros antigos continuam legíveis.
- [ ] Reexecutar os testes nos três fusos; esperado PASS idêntico. Acrescentar horário ausente, zero confirmado, datas inválidas e período `[14:59,15:00)` válido para turno 1.
- [ ] Registrar checkpoint e resultado no ledger da tarefa; commit apenas se a execução estiver num checkout Git real.

## Task 2: Consulta comum para todos os destinos

**Files:** Create `app/src/ui/operational-query.js`; Modify `ui/main.js` (`filters`, `refresh`, `watch`, exportações e mudanças de período), `consultation.js`, `period-records.js`, `nhpl.js`, `hourly.js`, `cep.js`, `presentation-details.js`, `services/history.js`, `services/create-msa.js`, `services/planning.js`, `services/planned-production.js`; Test `tests/unit/operational-query.test.js`, `settings-consultation.test.js`, `history.test.js`.

**Interfaces:** Consome tarefa 1. Produz `buildOperationalQuery(consultation):OperationalQuery`, `selectOperationalPeriod(period,operationalQuery):Object` e `readAccountConsultation(uid,source,storage)/writeAccountConsultation(uid,source,patch,storage):Consultation`. Produz `loadOperationalView({services,repo,consultation,now}):Promise<{period,dashboard,technical,pendingBase,operationalQuery,asOf}>`. `pendingBase` contém entidades abertas do contexto, sem recorte temporal; cobertura própria. `state.context` permanece contexto de registro; `state.consultation` passa a consulta. APIs civis `loadPeriod/getDashboard` atuais continuam válidas. Nova opção `createMsaServices({...,enforceOperationalShifts=false})` é repassada a planejamento e produção: UI normal/live a habilitam; leitores/importação de bases antigas e preparação dos cenários congelados mantêm compatibilidade. Essa opção não altera autorização.

- [ ] Testar consulta turno 1 em três dias excluindo registros de turno 2 e mantendo plano corretamente filtrado por produto/OP/lote/receita; teste de fonte planilha sem horário deve retornar aviso `shift-not-applicable` e não inventar turno. Fixar:

```js
assert.equal(buildOperationalQuery(thirdShift).query.toDate,'2026-10-09');
assert.equal(selected.effective.production.length,3);
assert.equal(selected.unallocated.production[0].quantity,crossing.quantity);
assert.equal(selected.coverage.production,false); // total definitivo limitado
assert.deepEqual(state.context,recordContext); // trocar consulta preserva registro
assert.equal(readAccountConsultation('other','live',storage).shift,'all');
assert.equal(existingCivilDashboard.totalGross,baselineCivilGross);
```

- [ ] Rodar `node --test tests/unit/operational-query.test.js tests/unit/history.test.js tests/unit/settings-consultation.test.js`; esperado FAIL nas novas APIs, sem alterar assertions civis antigas.
- [ ] Implementar carregamento do envelope civil uma vez; selecionar janelas exatas depois de aplicar correções. Levar junto revisões técnicas, políticas vigentes, cabeçalhos, fechamentos e registros anteriores intersectantes. Não usar dado bruto anterior à correção para decidir turno. Resumo Dashboard recebe o período já selecionado, com união de durações por janela; evitar recarregar/somar envelope. Preferências separadas por conta/fonte, migração de leitura das antigas sem apagá-las.
- [ ] Implementar filtros visíveis Todos / 1º · 07–15 / 2º · 15–23 / 3º · 23–07 e ajuda “O 3º turno termina às 7h do dia seguinte.” Formulários têm turno explícito separado; remover apenas o campo redundante de consulta. `assertShiftPeriod` valida novos planos e incrementos em formulário e nos serviços com `enforceOperationalShifts:true`; não reinterpretar importações legadas silenciosamente. Testar separadamente escrita normal atravessando 15h rejeitada e leitura/preparação de fixture antiga preservada, com diagnóstico da tarefa 1. Ativar a opção nos serviços humanos de `openPresentation` e no workspace operacional, sem invalidar seus dados salvos.
- [ ] Integrar consulta a planos, tabelas, gráficos, CEP, detalhes e todos os CSV. Exportar também originais não alocados e motivo, em coluna/relatório distinto; não falsificar totais. Rota Histórico oferece caminho explícito para divergentes.
- [ ] Reexecutar testes listados e `tests/unit/period-records.test.js tests/unit/productivity-edge.test.js`; esperado PASS. Checkpoint no ledger.

## Task 3: OEE e confiabilidade do período

**Files:** Create `app/src/domain/period-metrics.js`; Modify `domain/oee.js`, `ui/technical.js`, `ui/nhpl.js`; Test `tests/unit/period-metrics.test.js`, `tests/unit/nhpl-complete.test.js`.

**Interfaces:** Consome `OperationalQuery.windows` e período selecionado. Produz `aggregateOee(segments):Metric & {availability,performance,quality,countQuality,weightedQuality,total,firstPassGood,plannedSeconds,runSeconds}`, `periodReliability({plans,stops,classifications,windows,now,coverage}):{mtbf:Metric,mttr:Metric,operatingSeconds,failures,completedRepairs,openRepairs,carryInFailures}` e `periodMicroStops({stops,references,windows}):{count,seconds}`. `technicalView(state,{now=state.asOf??Date.now()}={})` passa a devolver `{segments,aggregate,reliability,coverage,microCount,microSeconds}`; assinaturas antigas continuam aceitas.

- [ ] Escrever testes com dados reais do seed, duas referências, falhas cruzando janelas e cobertura independente:

```js
assert.equal(aggregateOee(mixedSegments).value,0.625);
assert.equal(aggregateOee(mixedSegments).weightedQuality,true);
assert.equal(seedMetrics.reliability.mtbf.value,230*60);
assert.equal(seedMetrics.reliability.mttr.value,5*60);
assert.equal(withoutIdeal.reliability.mtbf.value,230*60);
assert.equal(carryIn.reliability.failures,0);
assert.equal(completedCrossingRepair.reliability.mttr.value,wholeRepairSeconds);
assert.equal(uniqueMicro.count,1);
assert.equal(uniqueMicro.seconds,20);
assert.equal(noFailures.reliability.mtbf.value,null);
assert.equal(noRepairs.reliability.mttr.value,null);
```

- [ ] Rodar `node --test tests/unit/period-metrics.test.js`; esperado FAIL no módulo/interface atual. Não usar médias horárias para fazer o teste passar.
- [ ] Implementar OEE como soma de trabalho ideal bom / soma planejada; A e P pela mesma base, Q ponderada por trabalho ideal. Qualidade por contagem permanece separada. Referências que atravessam segmento, inspeção desatualizada e classificação conflitante mantêm indisponibilidade explícita.
- [ ] Implementar exposição planejada até `now`, união das perdas de disponibilidade por equipamento/janela e conjuntos únicos de falhas iniciadas/reparos concluídos. MTTR usa duração integral; falha carregada só reduz operação. Cobertura de confiabilidade é própria, sem depender de ciclo ideal/qualidade. Para o legado manual, obter confirmação de cobertura existente; não converter silêncio em histórico completo. Bases da fonte contínua podem fornecer cobertura observada explícita.
- [ ] Deduplicar microparadas por ID no período, somar união de duração por equipamento/janela; não retirar perdas de desempenho da disponibilidade. Todas as projeções recebem o mesmo `asOf`.
- [ ] Rodar testes novos, `tests/unit/nhpl-complete.test.js tests/unit/nhpl-delivery.test.js tests/unit/presentation-scenario.test.js`; esperado PASS, preservando OEE de ciclo único `0.75625` na fixture histórica. Checkpoint no ledger.

## Task 4: Pendências com ação e alcance explícitos

**Files:** Create `app/src/domain/pending.js`; Test `tests/unit/pending.test.js`; Modify `ui/operational-query.js` para carregar pendências anteriores e classificações/decisões necessárias.

**Interfaces:** Consome `pendingBase`, `period`, `technical`, `consultation`, `actor` e `asOf`. Produz `buildPending({pendingBase,period,technical,consultation,actor,asOf}):{open:Object[],checks:Object[],deviations:Object[],complete:boolean}`. Item `{id,kind,conditions:string[],occurredAt,context,route,tab,recordType,recordId,action:string|null}`; `action` é ação já existente permitida, não nova permissão. IDs estáveis por entidade, sem tabela persistente adicional.

- [ ] Testar pendência antiga sob filtro atual; parada aberta + classificação pendente conta uma entidade; ocorrência resolvida sai; leitura normal remove alerta atual conservando desvio histórico; período futuro não tem alerta de produção abaixo da meta. Fixar:

```js
assert.equal(pending.open.filter(x=>x.recordId===stop.id).length,1);
assert.ok(pending.open.some(x=>x.recordId===oldStop.id));
assert.equal(pending.checks.some(x=>x.recordId===futureInterval.id),false);
assert.equal(authorCorrection.action,null);
assert.equal(viewerStop.action,null);
assert.equal(incompletePending.complete,false);
assert.equal(incompletePending.open.length,knownOpenCount);
```

- [ ] Rodar `node --test tests/unit/pending.test.js`; esperado FAIL por API ausente.
- [ ] Implementar projeções e ordenação: interrupção/conflito, decisão/conferência, desvio; data mais antiga primeiro. Separar abertos atuais de conferências/desvios da consulta. Atualizar decisões e referências por revisão, sem SLA inventado ou autoaprovação.
- [ ] Rodar os testes; esperado PASS. Checkpoint no ledger.

## Task 5: Linha do tempo da simulação

**Files:** Create `app/src/domain/live-scenario.js`; Test `tests/unit/live-scenario.test.js`.

**Interfaces:** Consome `shiftAt`; não acessa DOM, storage ou Firebase. Produz `createLiveCursor({startedAt,sessionId,context,automaticEvents=true}):LiveCursor` e `advanceLive(cursor,{through,command=null}):{cursor:LiveCursor,intents:Object[],gap:Window|null}`. Cursor tem `through`, `activeMilliseconds`, `cycleMilliseconds`, `pieceCount`, `sequence`, `sourceId`, `context`, `paused`, `disconnected`, `stop`, `rejectNext`, `deviationUntil`, `automaticEvents`, agenda e último heartbeat/coleta. Intent `{id,occurredAt,kind,context,payload}`; ID determinístico por sessão/ordem, máximo 90 caracteres no adaptador. Fonte nova por contexto/turno; `through` e sequência são monotônicos. Desabilitar agenda automática apenas na fixture que verifica 25 ciclos sem parada; o padrão de uso a mantém ativa.

- [ ] Testar evolução determinística sem agenda no início, repetição idempotente, pausa, comunicação, ciclo fracionado e fronteira 07h:

```js
assert.equal(step24.intents.filter(x=>x.kind==='piece').length,2);
assert.deepEqual(advanceLive(step24.cursor,{through:start+24000}).intents,[]);
assert.equal(twentyFive.pieceCount,25);
assert.equal(twentyFive.rejectCount,1);
assert.equal(duringStop.intents.some(x=>x.kind==='piece'),false);
assert.equal(paused30.cursor.pieceCount,beforePause.pieceCount);
assert.equal(longGap.gap.to-longGap.gap.from,120000);
assert.equal(longGap.intents.some(x=>x.kind==='piece'),false);
assert.equal(nextShift.cursor.context.shift,'1');
assert.notEqual(nextShift.cursor.sourceId,previousSource);
```

- [ ] Rodar `node --test tests/unit/live-scenario.test.js`; esperado FAIL por módulo ausente.
- [ ] Implementar processamento cronológico das próximas fronteiras: ciclo de 12 s, heartbeat 5 s, coletas 30 s, microparada no 60º segundo por 12 s, falha no 180º por 45 s (reparo do 5º ao 35º segundo), repetição a cada 300 s ativos. Refugo na 25ª peça e múltiplos, sem somar rejeito novamente à bruta. Desvio a cada 120 s por 30 s. Agenda progride por tempo ativo observado; instantes registrados são do relógio real, incluindo pausas e paradas.
- [ ] Implementar comandos `pause`, `resume`, `reject-next`, `micro-stop`, `failure`, `deviation`, `disconnect`, `reconnect`; impedir parada simultânea, manter fração de ciclo e sequência. Suspensão >60 s gera gap e avança o ponto de observação sem peças inventadas; não descartar histórico. Eventos de quantidade representam a peça concluída no intervalo correspondente, não um rateio do ciclo; em uma conclusão exata na fronteira, fechar a janela física anterior antes de abrir a seguinte, sem duplicação.
- [ ] Testar passos de 1 s versus um passo de 24 s, agenda em passos variáveis, clock regressivo inválido, pausa durante reparo e comandos repetidos pelo mesmo ID. Rodar suite do módulo; esperado PASS. Checkpoint no ledger.

## Task 6: Persistência, aquisição e concorrência da fonte

**Files:** Create `app/src/ui/live-workspace.js`; Modify `ui/presentation.js` (`seedPresentation` com opções opcionais), `ui/demo-workspace.js` somente se necessário para notify/atomicidade; Test `tests/unit/live-workspace.test.js`, `presentation-scenario.test.js`.

**Interfaces:** Consome tarefas 1 e 5 e serviços atuais. Produz `openLiveWorkspace({storage,papa,now=Date.now,actor,displayName,re,locks,timers,autoStart=true}):Promise<LiveWorkspace>`. Retorno compatível com cliente atual `{mode:'live',repo,services,actor,context,fromDate,toDate,range,displayName,re,exportBackup,dispose}` e `live:{status(),subscribe(fn),command(command),start(),pause(),retry()}`. `dispose():Promise<void>` é idempotente e aguarda o lote em andamento. `status()` contém fase `running|paused|follower|disconnected|error|stopped`, `asOf`, `lastEventAt`, `lastPersistedAt`, `gap`, `error`, totais somente do snapshot persistido e cobertura por intervalo. Timers/locks injetáveis para teste.

- [ ] Testar lote salvo uma vez com dados e cursor, serviço de ingestão realmente criando incrementos, perdas, stop/repair e coletas, recuperação e concorrência:

```js
assert.equal(snapshotGross(after24),2);
assert.equal(snapshotGood(after24),2);
assert.equal(JSON.parse(storage.getItem('msa.nhpl.live.v1')).cursor.pieceCount,2);
assert.equal(storage.getItem('msa.nhpl.presentation.v3'),originalPack);
assert.equal(twoTabs.totalGross,oneWriter.totalGross);
assert.ok(afterManual.data.productionIntervals[intervalId]);
assert.equal(snapshotGross(afterFailedPersist),snapshotGross(beforeFailedPersist));
assert.equal(workspace.live.status().phase,'error');
assert.equal(afterReload.cursor.pieceCount,beforeReload.cursor.pieceCount);
assert.equal(afterDisposeWrites,0);
assert.equal(repairedMetrics.mttr.value,30);
```

- [ ] Rodar `node --test tests/unit/live-workspace.test.js`; esperado FAIL por módulo ausente.
- [ ] Implementar base `msa.nhpl.live.v1` com validação de schema, catálogo/vínculos/regras/ledgers equivalente à apresentação; seed opcional `{includeFuturePlan:false,coherentShifts:true}`. Defaults de `seedPresentation` permanecem compatíveis; fonte original nunca é hidratada com dados do live. Serviços do novo workspace recebem `enforceOperationalShifts:true`. `sessionId` é persistido, não recriado no reload. Novo trecho observado começa em `now`, sem produção offline.
- [ ] Implementar locks `msa.nhpl.live.writer.v1` (eleição, liberado no descarte) e `msa.nhpl.live.commit.v1` (cada lote/escrita manual). Sob commit lock, ler pack mais recente, criar repositório temporário, aplicar todos os serviços ao snapshot, validar cursor/revisão e gravar pack completo uma vez. Só depois notificar watchers. Wrapper das escritas manuais hidrata a última base sob o mesmo lock e mantém CAS/expectedRevision dos serviços. Storage event atualiza leitores; exceção/quota/CAS mantém snapshot anterior e pausa com erro. Sem Web Locks, observar base e informar que a fonte não pode iniciar nesse ambiente.
- [ ] Implementar adaptador de intents para `technical.ingest`, `plannedProduction`, `operations.recordLoss`, `technical.classify/inspect` e `runs`. Origem da ingestão permanece contratualmente `import`; autoria da fonte e provenance do pack distinguem cenário. Não alterar o contrato para falsificar origem industrial. IDs determinísticos e recibos são deduplicados; o lote integral é atômico, incluindo losses/classification que não entram em ingest.
- [ ] Criar planos exclusivos da fonte, sem sobreposição, no máximo 60 min e sempre cortados por turno. Plano informado deriva de 12 s/peça; referências OEE 10 s/peça são próprias do cenário. Inspecionar e confirmar apenas intervalos da fonte, com fingerprint atual; fechamento final somente após `endedAt<=now`. Se o intervalo contiver incremento/correção humana, deixar inspeção e fechamento para o responsável e mostrar conferência pendente; a origem do plano não autoriza confirmar registro humano. Testar essa combinação. Parada fecha com boa validada; falha persiste classificação e reparo. Coletas usam versões 9,5–10,5 mm / 90–110 N, variação determinística e leitura fora de faixa solicitada. Não truncar histórico para esconder quota.
- [ ] Testar worker com usuário Consulta: `actor.role` continua viewer e serviços de escrita humana negam acesso, mas fonte interna grava somente em repo local. Verificar nenhuma factory/credencial Firebase recebida. Rodar testes do módulo e `tests/unit/presentation-scenario.test.js tests/unit/demo-workspace.test.js tests/unit/nhpl-connector.test.js`; esperado PASS. Checkpoint no ledger.

## Task 7: Fonte contínua na sessão e métricas parciais

**Files:** Create `app/src/ui/live-controls.js`; Modify `ui/main.js` (`enterCloud`, fonte selecionada, `refresh`, `watch`, `startSimulation`, `endSimulation`, `leaveWorkspace`), `ui/nhpl.js`, `ui/technical.js`, `domain/productivity.js` se necessário; Test `tests/unit/live-session.test.js`, `ui-access.test.js`, `simulation.test.js`.

**Interfaces:** Consome `LiveWorkspace`, `loadOperationalView` e `technicalView`. Produz `liveControlsMarkup({status,actor,source}):string`, `mountLiveControls({root,workspace,refresh,isEditing}):()=>void` e `liveObservedBases(pack,operationalQuery,asOf):Object`. `state.source` = `live|existing|case|operational`; `state.asOf` é snapshot único. Não mudar `state.dataset` para contornar permissões; origem/consulta continuam conceitos distintos.

- [ ] Testar entrada automática autenticada, troca de fonte e retorno de cada um dos 16 cenários para fonte/contexto/filtros anteriores; descarte após lote em curso; formulários não rerenderizados pelo tick. Fixar:

```js
assert.equal(loggedIn.source,'live');
assert.equal(loggedOut.client,null);
assert.equal(loggedOut.activeTimers,0);
assert.deepEqual(returned.consultation,beforeCase.consultation);
assert.equal(form.value,'valor em edição');
assert.equal(form.focused,true);
assert.ok(snapshotAfterNavigation.gross>snapshotBeforeNavigation.gross);
assert.equal(viewerControls.includes('data-action="live:failure"'),false);
assert.equal(liveOee.state,'partial');
assert.equal(manualWithoutInspection.oee,null);
```

- [ ] Rodar `node --test tests/unit/live-session.test.js`; esperado FAIL por integração ausente.
- [ ] Implementar seletor Fonte de dados: Em tempo real / Registros existentes, com retorno para cenários existentes; guardar consulta por conta/fonte. Em modo `workspace=operational`, permanecer no backend existente, sem simulação automática sobre Firebase. Não reintroduzir bypass no login. AutoStart conforme padrão da seção 13.1 ou resposta explícita posterior.
- [ ] Implementar atualização do estado visual a cada 1 s e refresh após snapshot persistido; atualizar nós de status/tempo e gráficos existentes, sem recriar todo DOM por heartbeat. Enquanto modal/form ativo, deferir rerender completo e mostrar estado externo à edição; ao fechar, aplicar último snapshot. Navegação conserva fonte ativa. Descarte/troca interrompe agenda antes de aguardar lote e invalidar callbacks por geração de sessão.
- [ ] Usar `mode:'continuous'` de produtividade somente para fonte live, com plano decorrido e plano inteiro visíveis. Calcular OEE parcial com bases observadas, inspeção corrente e cobertura do gerador, sem relaxar validação de registros manuais. Gap/referência inválida conserva motivo e cobertura. Confirmado somente após fechamento válido. Estágio atual e última atualização são explícitos em todas as telas/TV.
- [ ] Rodar testes novos, `tests/unit/productivity-edge.test.js tests/unit/nhpl-simulation.test.js tests/unit/ui-access.test.js tests/unit/simulation.test.js`; esperado PASS. Checkpoint no ledger.

## Task 8: Navegação, telas de tarefa e Visão geral

**Files:** Create `ui/workspace-routes.js`, `production-page.js`, `stoppages-page.js`, `quality-page.js`, `overview.js`; Modify `ui/main.js`, `access.js`, `nhpl.js`, `technical.js`, `app/styles.css`; Test `tests/unit/workspace-routes.test.js`, `overview.test.js`, `ui-access.test.js`.

**Interfaces:** Consome projeções das tarefas 2–4 e 7. Produz `resolveWorkspaceRoute({route,tab,role}):{route,tab}`, `productionPage({state,renderers}):string`, `stoppagesPage({state,renderers}):string`, `qualityPage({state,renderers}):string` e `overviewMarkup({state,metrics,pending,renderers}):string`. `renderers` recebe funções atuais nomeadas, sem nova gravação. `openPending(item,{state,navigate}):void` guarda/restaura consulta e seleciona aba/registro por ID; detalhes continuam validados pelos serviços.

- [ ] Testar aliases e permissões, os quatro textos exigidos e destinos das ações:

```js
assert.deepEqual(resolveWorkspaceRoute({route:'planning',role:'admin'}),
 {route:'production',tab:'planning'});
assert.deepEqual(resolveWorkspaceRoute({route:'operations',tab:'losses',role:'operator'}),
 {route:'quality',tab:'losses'});
assert.ok(overview.includes('Disponibilidade × desempenho × qualidade'));
assert.ok(overview.includes('Tempo em operação ÷ número de falhas'));
assert.ok(overview.includes('Tempo de reparo ÷ reparos concluídos'));
assert.ok(overview.includes('nhpl-interval-chart'));
assert.ok(overview.includes('nhpl-accumulated-chart'));
assert.ok(noFailuresMarkup.includes('Sem falhas registradas no período'));
assert.ok(incompleteMarkup.includes('Lista parcial'));
```

- [ ] Rodar `node --test tests/unit/workspace-routes.test.js tests/unit/overview.test.js`; esperado FAIL por APIs ausentes.
- [ ] Extrair renderizadores operacionais existentes de `main.js` somente quando necessários; manter handlers `form:*`, `nhpl:*`, `tech:*` atuais. Produção: Resumo e hora a hora / Planejamento / Apontamentos / Horários / Ocorrências. Paradas: Em aberto / Histórico / Classificação. Qualidade: Refugos e perdas / Inspeções. Engenharia: Análises / Correções / Ocorrências. Preservar funções de quatro tempos em Horários e edição das políticas em Planejamento, com links entre abas.
- [ ] Implementar menu com grupos Operação, Análise e Administração, rótulos legíveis, permissões equivalentes por ação. `#planning`, `#operations` e tabs antigas têm aliases; Consulta pode ver Paradas/Qualidade sem escrita. Inicial engineer Engenharia, operator Produção/Apontamentos, demais Visão geral. Preservar hash de TV/capture/settings e retorno.
- [ ] Implementar ordem Visão geral: filtros → faixa abertos → Produtividade/OEE/MTBF/MTTR → volumes e A/P/Q → dois gráficos → parâmetros/fila técnica (cinco linhas + Ver todos) e intervalos expansíveis. Cartões sempre presentes; ausência usa motivo, sem 0/infinito. MTBF/MTTR em minutos; descrições exatas da spec. Traduzir categorias técnicas. TV/Paradas/Indicadores reutilizam o mesmo resumo e instante, sem fórmulas próprias.
- [ ] CSS: 320/390 px e desktop, abas acessíveis por teclado, `aria-selected`, foco visível, região de status sem anunciar cada peça, gráficos com tabela acessível, overflow apenas nas tabelas. Claro/escuro; não usar meta 95% para cor de OEE/confiabilidade. Preservar estilos e ativos próprios.
- [ ] Rodar testes novos e existentes de acesso/formulários/estático; esperado PASS. Checkpoint no ledger.

## Task 9: Verificação integrada e entrega local

**Files:** Create `docs/ENTREGA_TURNOS_INDICADORES_TEMPO_REAL_2026-10-08.md`; Modify fixtures existentes em `tests/browser/` apenas se a nova integração exigir; testes de serviço nos arquivos das tarefas anteriores. Não usar contas reais para teste.

**Interfaces:** Consome todas as tarefas. Produz registro de evidências, limitações observadas e matriz de preservação concluída. Não criar publicação implicitamente.

- [ ] Executar `node --test --test-reporter=dot tests/unit/*.test.js`; esperado exit 0 com todos os testes. Executar `node scripts/verify-static.mjs --deploy`; esperado zero erros. Como validação de gravação é tocada, executar `npm run test:emulator`; esperado regras sem regressão. Se runtime do emulador indisponível, registrar erro concreto e não declarar essa verificação concluída.
- [ ] Abrir a app com fixture local pelo navegador controlado via CUA, conforme skill computer-use. Verificar produção aumentando após 24 s, horário de atualização, pausa 30 s, navegação, modal editado, logout e retorno. Injetar relógio apenas em testes/fixture para acelerar virada de turno; produção normal permanece 1×. Não usar automação de navegador pelo shell quando a ferramenta CUA governa interações.
- [ ] Abrir uma segunda aba: confirmar único gerador e mesmos totais; incluir registro manual concorrente e preservar ambos. Forçar erro de storage em fixture; contador congela no último snapshot e retentativa não duplica. Reload e offline de 2 min não criam peças. Confirmar microparada/falha/MTTR de 0,5 min/alerta resolvido no mesmo conjunto de dados.
- [ ] Verificar desktop e 320/390 px, claro/escuro e teclado. Abrir todas as telas em admin/engineer/operator/viewer. Gráficos mantêm legendas, lacunas e dados consultáveis. Links de pendência mostram contexto e voltam à consulta anterior. TV e CSV correspondem ao snapshot/turno selecionado.
- [ ] Preencher e verificar esta matriz sem nenhuma linha suprimida:

| Função existente | Destino | Evidência exigida |
|---|---|---|
| Plano, prévia, aprovação, revisão, recuperação/retomada, políticas/takt | Produção/Planejamento | Operar em fixture; mesmos serviços e vigências |
| Incrementos, confirmação, reconciliação, quatro tempos | Produção/Apontamentos e Horários | Fechamento/correção e validações preservadas |
| Parada manual, fim validado, motivo e reparo | Paradas | Manual e fonte continuam distintos |
| Refugo, retrabalho e kg; inspeção primeira passagem | Qualidade | Bases separadas; versões/fingerprint válidos |
| Coleta, detalhe, limites aprovados/rascunhos e gráfico | Parâmetros/Cadastros | Reabrir rascunho e conservar referência histórica |
| Análises, evidências, correções e decisões | Engenharia | Proibição de autoaprovação nos quatro perfis |
| CEP e planilha, mínimo NHPL 30, versões e gráficos | CEP | Sem mistura de contextos; aviso para horário ausente |
| Dois gráficos e intervalos, produções/paradas legadas | Visão geral e Produção | Ambos canvases, tabelas e valores acessíveis |
| A/P/Q/OEE, MTBF/MTTR, referências e memória CSV | Indicadores/Paradas/TV | Mesmos conjuntos, cobertura e asOf |
| Histórico completo, detalhe/correção/exportação | Histórico | Divergentes/não alocados e origem exportados |
| Catálogos, backup/importação, conta e preferências | Cadastros/Configurações | Sem migração destrutiva; preferência por conta |
| 16 cenários locais e base anterior | Seletor de fonte/Simular cenário | Retorno conserva consulta; storage antigo inalterado |
| Login, perfis, logout e workspace operacional | Entrada/Conta | Sem bypass, fonte local sem escrita Firebase |
| Histórico T20/selos e dados anteriores | Registros existentes/Histórico | Acesso conservado; sem parâmetros NHPL misturados |

- [ ] Revisar mudança completa contra a spec, não apenas os novos testes. Usar verification-before-completion e revisão de código prevista pelo método escolhido; correções importantes exigem teste que falha antes. Registrar diferenças justificadas no ledger e resultado da revisão.
- [ ] Atualizar documento de entrega com instruções Fonte/Pausar/Turnos, comandos executados, número efetivo de testes, caminhos, verificações de navegador/emulador e limitações reais. Declarar conclusão apenas após os critérios; nenhuma promessa de “sem pontas soltas” substitui evidência.

## Auto-revisão do plano — 08/10/2026

- Seções 1/4/8 da spec: tarefas 8/9 e matriz de preservação; não há exclusão de funcionalidades.
- Seção 5: tarefas 1/2, fuso, rótulos antigos, janelas disjuntas, turno de consulta separado do registro, validação de novos períodos e exportação de diagnósticos.
- Seções 6/9: tarefas 3/7/8, OEE 62,5% misto, MTBF 230 min, MTTR 5 min, cobertura e sem denominador.
- Seção 7: tarefa 4 e integração 8, pendências antigas, escopos distintos, deduplicação e retorno contextual.
- Seções 10/11: módulos focados, tarefas 2/9, compatibilidade de contratos civis, perfis, estático/emulador/navegador.
- Seção 13: tarefas 5/6/7/9, tempo real 1×, base separada, todos os cenários anteriores, aquisição por serviços, parcial/final, eleição e escrita serializada, quotas, reload e descarte.
- Interfaces compartilhadas: tarefas 2→3/4 usam os mesmos `windows` e `asOf`; 5→6 cursor/intents; 6→7 cliente compatível e `dispose` assíncrono; 7→8 source/estado; testes 9 cobrem integração. Nenhuma tarefa pode substituir a projeção compartilhada por contadores de página.
- Execução recomendada: **nativa neste chat**, pois as tarefas dependem da mesma consulta, relógio e interfaces de aquisição; revisão final independente conforme a skill de execução. Alternativa: subagentes por tarefa com revisão em cada etapa.
- Estado: plano escrito e auto-revisado; implementação ainda não iniciada. A revisão deste plano é a etapa restante do processo Writing Plans solicitado pelo usuário.

## Encerramento no escopo final — 08/10/2026

Os checklists acima registram o plano aprovado antes da última orientação. A seção 14 da spec e as instruções finais do usuário substituem a separação de fontes e os testes prolongados de aquisição contínua. Os itens abaixo representam o escopo entregue; os itens anteriores de tempo real não são trabalho pendente.

- [x] Filtros de turno compartilhados, cálculos de OEE/MTBF/MTTR e alertas de pendência.
- [x] Páginas reorganizadas, aliases e funcionalidades anteriores preservados.
- [x] Uma base persistente, sem seletor de fonte nem produtor automático no login.
- [x] Exemplos nos três turnos e duas famílias, com análises/correções do MARK V; histórico preservado.
- [x] Cadastro e edição persistentes, campos de OP/lote/turno e quatro perfis conservados.
- [x] 16 cenários preservados mais uma simulação completa inicial; retorno à consulta anterior.
- [x] Barra lateral compacta e fechamento móvel corrigido; 320/390 px e desktop conferidos.
- [x] Suite final 180/180, verificação estática 91 arquivos sem erros; emulador anterior 20/20.
- [x] Três achados recebidos da revisão independente corrigidos; interrupção por quota registrada, sem alegar parecer independente completo.
- [x] Documento de entrega, captura de tela e baseline preservados. Sem push/deploy.

Evidências, matriz de preservação e limites: `docs/ENTREGA_TURNOS_INDICADORES_TEMPO_REAL_2026-10-08.md`.
