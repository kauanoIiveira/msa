# MSA — operação e coordenação Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar os fluxos operacionais úteis do concorrente que faltam no MSA: lote em avaliação, equipe, passagem e atendimento de pendências, com paradas/ocorrências mais claras.

**Architecture:** Eventos e snapshots auditados no mesmo Firebase do plano 1, vinculados ao contexto de produção. Reutilizar paradas, perdas, inspeções e ocorrências atuais; criar ledgers apenas para fatos ainda não representados.

**Tech Stack:** JavaScript ES modules, Node >=22, Firebase RTDB/Auth, HTML/CSS e ícones atuais; sem serviços de comunicação externa.

**Spec:** `docs/superpowers/specs/2026-10-08-msa-jornada-coesa-design.md`, seção C; depende do plano `2026-10-08-msa-contexto-firebase-dados.md`.

## Global Constraints

- Manter a identidade visual MSA, temas, gráficos e painel TV; não copiar código, marca ou ativos do MSE.
- Não criar Mapa da Planta nem Chat.
- Uma única experiência principal, sem seletor real/simulado e sem geração contínua iniciada no login.
- Preservar dados existentes, quatro perfis, proibição de autoaprovação, versões, evidências, históricos e 17 cenários técnicos.
- Ausência não equivale a zero; exemplos têm origem rastreável no histórico, na gestão técnica e nas exportações.
- Produtividade bruta = brutas/planejadas; takt 12 s não é ciclo ideal; OEE usa primeira passagem e referências válidas.
- Turnos 07–15, 15–23 e 23–07, America/Sao_Paulo; o terceiro turno pertence à data em que começa.
- Não ratear quantidades sem detalhe; não somar taxas; não misturar kg, peças, contextos ou unidades incompatíveis.
- T20/selos mantém Z1–Z21 e instrumentos no próprio contexto; NHPL mantém VGARD HP e MARK V sem herdar seus limites.
- Não alterar contas, senhas ou memberships; cadastro de equipe não concede acesso.
- Não enviar comandos físicos, não ativar OCR e não enviar fotos a serviços externos.
- Node >=22, módulos JavaScript existentes, Firebase RTDB/Auth e HTML/CSS atuais; dependência nova somente quando necessária ao Excel e registrada com versão e licença.
- Compatibilidade GitHub Pages: publicar somente app estático, assets/imports relativos ao subcaminho /msa/, rotas por hash recarregáveis, downloads no navegador e Firebase externo; nenhum servidor Node necessário no uso.

## Review Focus

- Encerramento concorrente de parada, duração sobreposta e período negativo — tarefa 1: uma conclusão válida, sem contagem duplicada.
- Lote corrigido, refugo já lançado e reinspeção parcial — tarefa 2: saldo reconciliado, decisão bloqueada quando faltam bases.
- Equipe com RE nos apontamentos, mas sem presença — tarefa 4: não confirmar presença automaticamente.
- Recebedor igual ao remetente e turno noturno — tarefa 5: negar auto-recebimento e manter data operacional.
- Alerta recorrente, causa ainda ativa e conexão interrompida — tarefa 6: episódio deduplicado, conclusão coerente e nenhuma notificação externa.

## Task 1: Paradas, microparadas e reparos por tarefa

**Files:** Modify `app/src/ui/stoppages-page.js`, `app/src/ui/technical.js`, `app/src/domain/period-metrics.js`, `app/src/services/operations.js`; create `app/src/ui/stoppage-summary.js`, `tests/unit/stoppage-summary.test.js`; extend `tests/integration/stoppage-race.test.js` e `tests/unit/period-metrics.test.js` somente com casos novos.

**Interfaces:** `buildStoppageSummary({stops,classifications,references,windows,coverage}) -> {open,micro,history,byReason,seconds,reliability}` usa métricas do plano 1. Ações existentes `startStoppage`, `closeStoppage` e classificação/reparo técnica mantêm contratos. UI recebe `Selection.recording.context`.

- [ ] Testar 20 s de microparada versus limiar vigente de 60 s; parada com 70 s fica fora; limiar revisado vale só no período aplicável. Duas paradas sobrepostas acumulam união, não soma. Reparar sem falha, fim antes de início e encerrar duas vezes são rejeitados. NHPL continua exigindo validação da boa na retomada. Relógio da UI não acrescenta produção.
- [ ] Rodar `node --test tests/unit/stoppage-summary.test.js tests/unit/period-metrics.test.js`; esperar falha do resumo novo. Executar corrida no emulador para proteger fechamento concorrente.
- [ ] Implementar abas Resumo/Em andamento/Microparadas/Histórico/Classificação, motivo/duração/reparo legíveis e ação contextual. Separar preenchimento operacional de classificação técnica segundo perfil; explicar causa de confiabilidade incompleta com ação para cobertura.
- [ ] Rodar testes e percorrer registrar → encerrar → classificar → registrar reparo → ver histórico/indicadores; verificar autorização servidor e valores em todas as telas.
- [ ] Commit: `feat: organiza paradas microparadas e reparos`.

## Task 2: Avaliação, segregação e disposição de lote

**Files:** Create `app/src/domain/lot-quality.js`, `app/src/services/lot-quality.js`, `app/src/ui/lot-quality.js`, `tests/unit/lot-quality.test.js`, `tests/rules/lot-quality.test.js`; modify `app/src/ui/quality-page.js`, `app/src/services/create-msa.js`, geradores de regras e `app/src/presentation/dataset-builder.js`.

**Interfaces:** `createLotQualityService({repo,actor,operations,clock,idFactory}) -> {assess(input),reinspect(id,input),decide(id,input),list(query)}`. `assess({context,productionCaseId,quantity,evidence})`; `reinspect(id,{inspected,approved,rejected,evidence,expectedFingerprint})`; `decide(id,{decision:'release'|'discard',quantity,reason,expectedFingerprint})`. Novo ledger `lotQualityEvents`; snapshot efetivo é projeção, não sobrescrita. Disposição admin/engenheiro; operador relata e reinspeciona conforme permissão explicitamente testada.

- [ ] Testar lote bruto100 com refugo10 já registrado: segregar20 não aumenta refugo; reinspecionar20 (boas15/rejeitadas5) e descartar5 acrescenta só 5 vinculados à decisão, uma vez. Repetir comando não duplica; total descartado não ultrapassa saldo; primeira passagem não melhora com liberação. Corrigir a produção depois da avaliação invalida fingerprint. Decisão com reinspeção insuficiente ou viewer/operator sem permissão é negada também nas regras.
- [ ] Rodar `node --test tests/unit/lot-quality.test.js` e emulador de regras; esperar falha por serviço/ledger ainda inexistentes.
- [ ] Implementar máquina de estados e prévia da decisão; criar perda correspondente via operações apenas para a diferença validada, com ID idempotente vinculado. Como são duas escritas, registrar estado pendente e reconciliar por ID após interrupção; não marcar concluído antes de reler a perda. Não contornar schema com campos extras.
- [ ] Rodar testes incluindo interrupção entre decisão/perda; percorrer avaliação → segregação → reinspeção → disposição → histórico → % Scrap. Completar exemplos do pacote com caso resolvido e outro pendente sem fabricar aprovador.
- [ ] Commit: `feat: acompanha avaliacao e disposicao de lotes`.

## Task 3: Ocorrências, responsabilidade e investigação

**Files:** Create `app/src/services/occurrence-workflow.js`, `app/src/ui/occurrences-page.js`, `tests/unit/occurrence-workflow.test.js`, `tests/rules/occurrence-workflow.test.js`; modify `app/src/ui/technical.js`, `app/src/domain/pending.js`, `app/src/ui/access.js`, `app/src/ui/workspace-routes.js`, `app/src/services/create-msa.js`, geradores de regras.

**Interfaces:** `createOccurrenceWorkflow({repo,actor,technical,clock,idFactory}) -> {create(input),assign(id,input),advance(id,input),view(id)}`. A ocorrência base continua criada por `technical.occurrence`; novo `occurrenceWorkflowEvents` referencia seu ID. Metadados prioridade/responsável/prazo/link não reescrevem relato original. `advance(id,{state,reason,evidenceIds?})` produz evento auditado.

- [ ] Testar lista de operação mostrando apenas contexto consultado; vínculo de coleta/lote/parada validado; responsável/prazo presentes; ocorrência da variante MARK não some na fila global nem aparece indevidamente no recorte VGARD. Estado resolvido exige ação documentada. Abrir investigação gera relação com análise existente, sem criar correção autoaprovada.
- [ ] Rodar `node --test tests/unit/occurrence-workflow.test.js`; esperar ausência do wrapper/eventos. Acrescentar regra negando evento com occurrenceId inexistente e alteração do relato base.
- [ ] Implementar entrada própria e filtros prioridade/responsável/estado, histórico, ação recomendada e link à Engenharia. Reutilizar serviço técnico e filas atuais; conservar aliases antigos de ocorrência.
- [ ] Rodar testes e conferir criação/atribuição/investigação/resolução por perfis. Todo histórico mostra autor/data e as pendências acompanham revisão efetiva.
- [ ] Commit: `feat: torna ocorrencias acionaveis e rastreaveis`.

## Task 4: Equipe, presença e alocação por turno

**Files:** Create `app/src/domain/crew.js`, `app/src/services/crew.js`, `app/src/ui/crew-page.js`, `tests/unit/crew.test.js`, `tests/rules/crew.test.js`; modify fábrica de serviços, acesso/rotas/regras e builder de exemplos.

**Interfaces:** `createCrewService({repo,actor,clock,idFactory}) -> {register(input),confirmPresence(input),allocate(input),view(query)}`. `CrewMember={id,label,operationalIdentifier,sectorId?,active}`; `CrewEvent={id,memberId,operationalDate,shift,kind,presence?,machineId?,startedAt?,endedAt?,supersedes?,createdBy,createdAt}`. Raízes `crewMembers`, `crewEvents`. Nome/identificador dos exemplos são explicitamente de exemplo no histórico/cadastro técnico, sem RE de pessoa real inventada.

- [ ] Testar presença não derivada do RE histórico; ausência libera posto; tentativa de duas alocações sobrepostas para a mesma pessoa é negada e transação concorrente mantém uma; turno3 às00:30 pertence ao dia anterior; viewer não escreve; operador não gerencia equipe; admin/engenheiro não ganham direitos Auth ao cadastrar membro.
- [ ] Rodar `node --test tests/unit/crew.test.js` e regra focalizada; esperar módulo ausente.
- [ ] Implementar registro mínimo, revisão/desativação preservando histórico, presença e realocação com prévia. Não acrescentar informações pessoais desnecessárias nem chamar Auth/admin SDK. IDs de setor vêm de cadastro existente/novo autorizado, não inferência do nome.
- [ ] Rodar testes, abrir comparação por turno e confirmar mesmo estado em duas sessões. Acrescentar exemplos de posto coberto/pendente/ausente ao pacote; nenhuma conta criada.
- [ ] Commit: `feat: registra equipe e alocacao operacional por turno`.

## Task 5: Passagem de turno e recebimento distinto

**Files:** Create `app/src/services/handover.js`, `app/src/domain/handover.js`, `app/src/ui/handover-page.js`, `tests/unit/handover.test.js`, `tests/rules/handover.test.js`; modify fábrica/rotas/acesso/regras e builder de exemplos.

**Interfaces:** `createHandoverService({repo,actor,projection,pending,clock,idFactory}) -> {send(input),receive(id,input),closePending(id,input),list(query)}`. `send({selection,shift,operationalDate,note}) -> {id,snapshot,sourceFingerprint}`; `receive(id,{note})` exige UID diferente de `sentBy`; pendência usa ID de origem, não cópia de evento. Raízes `handovers`, `handoverEvents`; snapshot inclui produção/qualidade/paradas/cobertura/pendências e referências.

- [ ] Testar snapshot de280 boas/5 refugadas não muda após novos apontamentos; reenvio idempotente; operador remetente não recebe a própria passagem; segundo UID autorizado recebe; turno3 correto; pendência carregada ao próximo turno mantém o ID, sem aumentar falhas/refugos. Correção posterior mostra aviso de revisão do snapshot e permite nova passagem sem apagar a antiga.
- [ ] Rodar `node --test tests/unit/handover.test.js`; esperar módulo ausente. Emulador confirma UID remetente negado também na regra.
- [ ] Implementar revisão do resumo antes de envio, recebimento com observação, pendências e histórico. O snapshot explicita cobertura parcial; não inventar atestado. Testar permissão de enviar/receber por operator/engineer/admin e leitura viewer.
- [ ] Rodar testes e exercício com duas sessões já autorizadas. Seed cria passagem pendente; não registra recebimento com UID fictício ou a mesma pessoa para enriquecer tela.
- [ ] Commit: `feat: implementa passagem de turno com recebimento auditado`.

## Task 6: Pendências, atendimento e som opcional

**Files:** Create `app/src/domain/alert-episodes.js`, `app/src/services/alert-actions.js`, `app/src/ui/pending-page.js`, `app/src/ui/alert-sound.js`, `tests/unit/alert-episodes.test.js`, `tests/unit/alert-actions.test.js`, `tests/rules/alert-actions.test.js`; modify `app/src/domain/pending.js`, `app/src/ui/overview.js`, `app/src/ui/preferences.js`, fábrica/acesso/rotas/regras e builder.

**Interfaces:** `deriveEpisodes({pending,sourceRevision,previous}) -> episodes` usa chave estável causa+contexto+registro+episódio. `createAlertActionsService({repo,actor,clock,idFactory}) -> {acknowledge(id,input),attend(id,input),complete(id,input),history(id)}`. `complete` valida causa normalizada contra projeção atual e ação. `alertSound({enabled,userGesture,episodeId})` toca uma vez por episódio; não altera preferências globalmente nem envia mensagens.

- [ ] Testar atualização do mesmo desvio20vezes resultando em um episódio; normalização preserva ações/histórico; reincidência após normalização abre episódio novo; causa ativa bloqueia conclusão; perda de conexão não confirma causa resolvida; diagnóstico incompleto permanece pendente. Viewer lê, operador atende o permitido, admin/engenheiro decide técnico; preferências de som por usuário, desligado inicialmente, sem auto-play sem gesto.
- [ ] Rodar `node --test tests/unit/alert-episodes.test.js tests/unit/alert-actions.test.js`; esperar módulos ausentes e comportamento sem ciclo de atendimento.
- [ ] Implementar central agrupada por urgência/responsável/contexto, ações e links para causa. Verificar regras de ação com fonte/revisão e estados válidos. Não apagar eventos de atendimento quando causa desaparece. Som é opcional local, sem push/email/chat. Evitar repetição por recalcular render.
- [ ] Rodar testes/emulador e jornada reconhecer → atender → normalizar causa → concluir → histórico. Completar manifesto dos módulos e verificar idempotência da carga ampliada. Navegar todos os módulos sem mapa/chat, com leitura e escrita reais.
- [ ] Commit: `feat: acompanha atendimento de pendencias sem duplicar alertas`; entregar subprojeto funcional antes do plano 3.
