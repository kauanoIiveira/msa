# MSA — contexto, Firebase e dados completos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar a produção identificável e registrar/consultar uma base compartilhada de exemplos completos, com MTBF/MTTR calculados a partir de evidências.

**Architecture:** Catálogo aditivo de produção/receita, seleção de consulta separada da gravação, abertura autenticada do Firebase e pacote de exemplos idempotente. Reutilizar repositório, serviços e ledgers existentes, separando cobertura de manutenção de inspeção de qualidade.

**Tech Stack:** JavaScript ES modules, Node >=22, Firebase RTDB/Auth, HTML/CSS e dependências atuais.

**Spec:** `docs/superpowers/specs/2026-10-08-msa-jornada-coesa-design.md`, seções A/B e contratos comuns.

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

- Consulta ampla com gravação única — tarefa 1: contexto de gravação não fica incompleto.
- Sessão expirada ou papel revogado no meio de gravação — tarefa 2: nenhuma escrita usa serviço stale.
- Cobertura alterada por correção ou falha cruzando janela — tarefa 3: bases invalidam e contagens seguem o contrato.
- Pacote repetido, plano legado conflitante, interrupção da carga — tarefas 4/5: sem exclusão nem duplicação.
- Abertura depois das 17h, meia-noite ou uma semana depois — tarefas 4/6: período persistido não depende do relógio do login.

## Task 1: Catálogo de produção/receita e contexto separado

**Files:** Create `app/src/domain/production-case.js`, `app/src/services/production-case.js`, `app/src/ui/production-selection.js`; modify `app/src/services/create-msa.js`, `app/src/ui/main.js`, `firebase/rules-source.mjs` e geradores relacionados; regenerate `firebase/database.rules.json` pelo comando do projeto; test `tests/unit/production-case.test.js`, `tests/unit/production-selection.test.js`, `tests/rules/production-case.test.js`.

**Interfaces:** `createProductionCaseService({repo,actor,clock,idFactory}) -> {list(query),create(input),context(id),recipes}`. `list({context?,fromDate?,toDate?,status?}) -> {items,complete}`. `context(id) -> Context` validado por `loadContext`, incluindo `recipe` como ID de versão quando aplicável. `selectProduction(selection,caseRecord) -> Selection`; `query` fica inalterada, `recording` ganha snapshot. IDs/formatos exatos seguem os contratos da spec. Cadastros `productionCases` e `recipeVersions` são novos, append-only com revisão; contexto antigo não é reescrito.

- [ ] Escrever testes: consultar ambos produtos e selecionar VGARD não altera consulta MARK; contexto resulta na mesma máquina/processo/produto/OP/lote/turno da produção; receita de outro produto falha; receita inexistente opcional não produz string fictícia; legado é indexável sem alteração; operador não cadastra receita; visualizador não cria produção; revisão usada não altera eventos anteriores.
- [ ] Rodar `node --test tests/unit/production-case.test.js tests/unit/production-selection.test.js`; esperar falha pelo módulo novo ausente. Adicionar casos de regras à execução do emulador e verificar falha por raiz ainda inexistente.
- [ ] Implementar validação/catálogo e seleção; integrar fábrica de serviços. Regras espelham vínculos/imutabilidade e metadados `createdBy == auth.uid`, timestamp servidor. Nenhuma permissão é obtida por parâmetros de UI. Histórico legado pode virar opção derivada somente quando vínculos são válidos.
- [ ] Rodar testes focalizados e emulador. Provar que escrever receita incompatível direto no RTDB é negado e que events antigos permanecem byte-equivalentes no snapshot.
- [ ] Registrar mudança/testes e commit no checkout Git conferido: `feat: cadastra producoes e separa consulta de registro`.

## Task 2: Abertura normal no Firebase e preservação local

**Files:** Create `app/src/ui/workspace-client.js`, `app/src/ui/local-archive.js`; modify `app/src/browser.js`, `app/src/services/create-msa.js`, `app/src/repositories/firebase-repository.js`, `app/src/ui/main.js`; test `tests/unit/workspace-client.test.js`, ampliar `tests/unit/session.test.js` e `tests/rules/access.test.js`.

**Interfaces:** `openWorkspaceClient({session,workspaceId,actor,repository,manifest}) -> {services,repo,defaultSelection,dispose}`; não cria membro/ator. `archiveLocalWorkspace({storage,uid}) -> {backup,hash,keys}` é leitura/serialização; a exportação não remove keys. `connectionState({authenticated,authorized,connected,pending}) -> 'ready'|'offline'|'pending'|'forbidden'`. Consume `ProductionCase`/`Selection` da tarefa 1.

- [ ] Testar: abertura usa repositório Firebase fornecido e não `openUnifiedWorkspace`; não há gerador no login; dois clientes no mesmo repo leem o mesmo ID; erro de rede não abre uma base substituta nem mostra sincronizado; logout/revogação interrompe listeners/escritas. Arquivo local legado preserva todos os keys e seu hash, inclusive base sobreposta.
- [ ] Rodar `node --test tests/unit/workspace-client.test.js tests/unit/session.test.js`; falha esperada no cliente novo/comportamento atual local.
- [ ] Implementar cliente normal autenticado e estado de conexão. Reutilizar `onWorkspace`/checagem de geração, evitando criar wrapper que burle a revogação. Aliases de URLs antigas continuam operacionais sem mostrar seletor de fonte; 17 cenários permanecem isolados e retornam ao cliente normal. Oferecer migração local somente com prévia própria, nunca apagamento automático.
- [ ] Rodar testes focalizados e `tests/unit/unified-workspace.test.js` para preservar cenários/arquivo local. Verificar segundo cliente, revogação e falha de rede em emulador; depois comprovar Firebase real na tarefa 5.
- [ ] Commit: `feat: usa base Firebase compartilhada na jornada principal`.

## Task 3: Cobertura independente e projeção única de métricas

**Files:** Create `app/src/services/coverage.js`, `app/src/domain/coverage.js`, `app/src/domain/workspace-metrics.js`; modify `app/src/ui/technical.js`, `app/src/domain/period-metrics.js`, `app/src/services/create-msa.js`, `app/src/services/history.js`, `firebase/rules-source.mjs`, `scripts/nhpl-rules.mjs`, `scripts/technical-rules.mjs` e resultado gerado `firebase/database.rules.json`; create `tests/unit/coverage.test.js`, `tests/unit/workspace-metrics.test.js`, `tests/rules/coverage.test.js`; extend `tests/unit/period-metrics.test.js`.

**Interfaces:** `coverage.confirm({context,startedAt,endedAt,complete,evidence,recordsFingerprint,supersedes?}) -> CoverageWitness`; `coverage.evaluate({witnesses,stops,classifications,corrections,windows}) -> {complete,diagnostics}`. `projectWorkspaceMetrics(view) -> {productivity,oee,reliability,quality,microStops,coverage}` reutiliza funções existentes, sem mudar fórmulas aprovadas. `coverageWitnesses` é ledger novo com autor/timestamp e vínculo ao fingerprint vigente.

- [ ] Testar base de 3600 s planejados com parada de disponibilidade de 600 s, uma falha iniciada no recorte e reparo concluído de 300 s: operação 3000 s, MTBF 3000 s e MTTR 300 s, após cobertura explícita. Remover inspeção invalida Q/OEE, mas não confiabilidade coberta. Remover atestado invalida confiabilidade. Corrigir parada invalida fingerprint. Testar início antes da janela e reparo dentro, reparo aberto, consultas paginadas incompletas, turnos noturnos e paradas sobrepostas sem duração duplicada.
- [ ] Rodar os testes novos; esperar falha por módulo ausente/acoplamento atual à inspeção. Registrar valores esperados por contrato, não médias de médias.
- [ ] Implementar atestado explícito, avaliação e projeção comum. Compatibilidade com inspeções antigas só produz cobertura derivada quando janela/fingerprint são verificáveis. Não marcar todo histórico automaticamente. Invalidar somente os contextos atingidos por revisão/conflito.
- [ ] Rodar regressões OEE/produtividade/horários/CEP e regras do atestado. Comparar números de Visão geral/TV/Paradas consumindo a mesma projeção; não repetir cálculo por renderizador.
- [ ] Commit: `fix: fundamenta confiabilidade em cobertura independente`.

## Task 4: Construção determinística dos exemplos completos

**Files:** Create `app/src/presentation/dataset-builder.js`, `app/src/presentation/parameter-map.js`, `app/src/presentation/dataset-validation.js`, `tests/unit/presentation-dataset.test.js`, `tests/fixtures/presentation-existing-conflict.json`; reuse `app/src/catalog/msa-parameters.js`; preserve `app/src/ui/presentation.js`, `app/src/ui/complete-presentation.js`, `app/src/ui/unified-workspace.js`, `scripts/seed-presentation.mjs` e `scripts/lib/presentation-scenario.mjs`. Read own original workbook and `analise/evidencias/celulas_Selo.json` plus continuity extracts; do not edit originals.

**Interfaces:** `buildPresentationDataset({anchorOperationalDate,version,existingSnapshot}) -> {manifest,commands,diagnostics}`; `validatePresentationDataset(snapshot,manifest) -> {ok,metricsByContext,diagnostics}`. Commands reference current service methods, with stable IDs/idFactory for ledgers. No hardcoded `createdAt` substituted for server timestamp. Domain hashes exclude only volatile audit timestamps by documented canonicalization; content mismatch at same ID is a conflict.

- [ ] Testar sete dias encerrados, dois produtos×três turnos por dia, planos sequenciais sem sobreposição, pelo menos quatro intervalos horários por combinação, confirmações/inspeções/cobertura completos, uma falha e reparo por combinação. Cada KPI do roteiro é finito e sua memória confere. Testar T20/selos com 41 parâmetros mapeados do modelo original, NHPL com seus próprios parâmetros, >=30 coletas por estudo homogêneo, zero/vácuo negativo, unidades e referência de exemplo. Metas não aplicáveis/limites industriais desconhecidos não são inventados.
- [ ] Rodar `node --test tests/unit/presentation-dataset.test.js`; esperar falha por módulo ausente. Acrescentar fixture de histórico/plano legado sobreposto e verificar que a preparação não remove dados nem desloca fatos existentes.
- [ ] Implementar pacote sem RNG variável, sem produtor contínuo e sem reaproveitar cadastros incompatíveis. Datas ancoradas uma vez no manifesto; plano futuro fica fora do padrão inicial. Consumir `getMsaParameterCatalog()` do catálogo já entregue; o novo mapa só relaciona esse catálogo às versões/receitas do pacote, sem duplicar sua definição. Usar serviços de domínio em repositório isolado para simular todos os comandos e produzir prévia. O seeder antigo `scripts/seed-presentation.mjs` usa UID fixo e exige raízes vazias; não executá-lo sobre a base atual nem refazer sua entrega.
- [ ] Testar relógios 14:30, 17:44, 00:30 e sete dias depois com o mesmo manifesto persistido: números do recorte inicial idênticos. Seed repetido não acrescenta IDs. Erro de contexto/refugo/reparo deve reprovar pacote inteiro na prévia, não gerar cartão com fallback.
- [ ] Commit: `feat: prepara pacote rastreavel completo para apresentacao`.

## Task 5: Prévia, backup e publicação idempotente no Firebase

**Files:** Create `app/src/services/presentation-dataset.js`, `scripts/presentation-dataset.mjs`, `tests/unit/presentation-publish.test.js`, `tests/integration/presentation-publish.test.js`, `tests/rules/presentation-manifest.test.js`; modify regras geradas e fábrica de serviços. Output evidence `docs/evidencias/jornada-coesa/carga-preview.json`, `carga-verificacao.json`; backup íntegro em caminho privado, nunca com credenciais no Git.

**Interfaces:** `prepare({repo,actor,anchorDate,version}) -> {manifest,commands,backupHash,conflicts,previewHash}`; `publish({preview,expectedHash,repo,actor}) -> {created,existing,conflicts,manifestId}`. CLI default `--dry-run`; modo de carga requer `--apply --preview <arquivo>` e sessão autorizada já existente, sem credenciais em argumentos/logs. Usar serviços para criar registros e timestamps; manifesto somente publicado após reler/verificar cada entrada.

- [ ] Testar segunda publicação criando zero registros; ID existente diferente bloqueia; interrupção após parte dos comandos retoma sem duplicar; autor/role/timestamp respeitam regras; permissões negadas não causam fallback/adminSDK; leitura concorrente alterada reprova a prévia. `members` e registros não pertencentes ao pacote têm hash igual antes/depois. Manifesto publicado não aceita hash incompleto.
- [ ] Rodar testes unitários, integração e emulador com regras efetivamente geradas; confirmar falhas antes de implementar publicação. Verificar projeto/workspace esperado sem imprimir segredos.
- [ ] Implementar backup/preflight/publicador; separar logs versionáveis de backup privado. Atualizar regras novas somente após testes; conferir regras/publicação efetivas. Preparar prévia real do Firebase autorizado com resumo de IDs/criações/conflitos, usando a autorização já concedida para exemplos. Sem sessão válida, registrar bloqueio e preservar resultado local, sem pedir novamente escolha de dados.
- [ ] Aplicar somente prévia válida; reler IDs e recalcular métricas com dados retornados pelo Firebase. Abrir duas sessões autorizadas, registrar item no primeiro e verificar segundo/recarregamento, autoria e cobertura. Registrar prova atual; não confundir com emulador. Não inventar segundo usuário para testes de aprovação.
- [ ] Commit apenas código, manifesto sanitizado e evidências permitidas: `feat: publica exemplos com backup e verificacao de integridade`.

## Task 6: Seleção guiada, resumos e equipamento sem mapa

**Files:** Modify `app/src/ui/main.js`, `app/src/ui/overview.js`, `app/src/ui/production-page.js`, `app/src/ui/workspace-routes.js`, `app/src/ui/access.js`, `app/styles.css`; create `app/src/ui/parameters-page.js` extraindo o renderer atual de main, `app/src/ui/equipment-page.js`, `app/src/ui/production-context-card.js`, `tests/unit/equipment-view.test.js`, `tests/browser/production-context.mjs`.

**Interfaces:** `productionContextCard({recording,catalog}) -> HTML`, `equipmentView({catalog,metrics,events,selection}) -> rows`, `chooseProduction(id)` uses task 1; consult filters alter only query. Actions `collection/production/loss/stoppage` consume recording context. Default selection comes from persisted published manifest, not `Date.now()`.

- [ ] Testar: consulta ambos produtos, selecionar VGARD e abrir Nova coleta preserva contexto específico; trocar para MARK com rascunho não muda registros nem perde texto; receita incompatível não aparece. Recorte inicial de sete dias encerrados não inclui planos futuros. Detalhe de máquina tem situação/leituras e nenhuma rota de mapa/chat. Permissões não mostram ações proibidas e serviço também nega.
- [ ] Rodar teste de projeção e roteiro navegador existente conforme API de QA aprovada; verificar falha do comportamento atual para gravação ambígua. Evitar teste que apenas conte elementos ou classes de estilo.
- [ ] Implementar cartões/lista pesquisável e ajuda OP/lote/configuração; manter filtros avançados de consulta com rótulo explícito. Padronizar abas/resumo e retorno pós-gravação. Equipamentos filtra catálogo real por setor quando cadastrado; não inventa departamentos. Manter aliases e cenários antigos. Estado de rede não equivale a conexão física.
- [ ] Validar manualmente via CUA nas cinco dimensões e teclado: escolher produção → coletar → ver resumo/histórico → trocar produto/turno; conferir Firebase atualizado e persistência. Capturar desktop e celular; registrar estados erro/vazio/sem permissão.
- [ ] Commit: `feat: orienta operacao pela producao selecionada`; entregar subprojeto funcional antes de iniciar plano 2.

## Task 7: Várias máquinas com produção e coletas úteis

**Origem:** requisito explícito posterior do usuário em 08/10/2026; priorizar antes dos novos módulos de coordenação. T20/zonas não são foco; preservar o que já existe sem reverter commits.

**Files:** Create `app/src/presentation/machine-expansion.js`, `tests/unit/machine-expansion.test.js`; modify apenas serviços/regras/UI necessários para produção planejada em equipamentos cadastrados, CLI de revisão aditiva e publicador, com testes focais de permissões/planning. Evidence `docs/evidencias/jornada-coesa/maquinas-verificacao.json`.

**Interfaces:** `buildMachineExpansion({baseManifestId,packageId,operationalDate,revision}) -> commands` consumidos por `presentation.prepareRevision`. Pelo menos três máquinas adicionais, cada uma com processo, produto, receita, produção selecionável e >=30 coletas coerentes com poucos parâmetros relevantes, unidades e referências de exemplo rastreáveis. Dados do último dia concluído já persistido no manifesto; sem produtores contínuos.

- [ ] Testar seleção/troca entre equipamentos com catálogo e parâmetros diferentes; consultas não misturam suas leituras nem contexto de registro. Não herdar zonas T20. Não basta adicionar máquinas sem dados.
- [ ] Reutilizar serviços/planner/projetor existentes para incluir produção bruta, boa/primeira passagem, refugo, falha/reparo e cobertura encerrada em cada novo contexto. Se o planner estiver limitado ao ID nhpl, generalizar somente para máquinas/processos/produtos ativos e compatíveis, mantendo perfis, auditoria, controle de concorrência e schemas. Testar negativa para equipamento/vínculo inválido também nas regras. Não criar fórmulas paralelas ou KPI fixo.
- [ ] Preparar revisão aditiva sem regenerar planos/pacote base. Permitir transições de ledgers novos durante uma revisão somente no namespace/path criado por essa revisão; proibido alterar registros existentes. Testar retomada, zero duplicações e preservação de memberships/base. CLI mantém senha exclusivamente no ambiente transitório.
- [ ] Implementar seleção significativa de máquina na jornada de coleta/produção, últimos valores e dados legíveis. Preparar/testar publicação com backup e hashes; controlador aplica a revisão autorizada e relê os dados. Confirmar máquinas/produções/coletas e métricas numéricas em serviço e navegador.
- [ ] Commit: `feat: amplia maquinas e coleta com dados coerentes`; depois priorizar indicadores/BI e completar os módulos operacionais aprovados.
