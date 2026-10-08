# NHPL: primeira entrega — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` ou `superpowers:subagent-driven-development`, conforme o método escolhido pelo usuário, para executar as tarefas. Os passos usam checkboxes. Este documento é um plano para revisão; não autoriza iniciar a implementação.

**Goal:** registrar a montagem de abafadores na NHPL com contexto e planejamento rastreáveis, acompanhar a produtividade sobre o plano aprovado e preservar o histórico e as permissões existentes.

**Architecture:** manter HTML/CSS/JavaScript modular, Firebase Auth e RTDB. Acrescentar domínio puro de planejamento/produtividade, serviços protegidos e estruturas próprias de revisões e encerramentos. A produção nova vinculada ao planejamento terá uma sequência imutável de eventos por intervalo; apontamento e encerramento disputam o mesmo próximo evento por transação de criação. Adaptadores apresentarão esses registros junto aos registros legados, sem duplicar sua persistência.

**Tech Stack:** Node >=22, verificado nesta sessão com v24.19.0; JavaScript ESM; Firebase 12.19.0; RTDB; Chart.js 4.5.1; Lucide 1.52.0; Papa Parse 5.7.0; `node:test`; emuladores Auth/RTDB; Playwright. Manter as versões do lockfile.

**Spec:** [especificação aprovada em 07/10/2026](../specs/2026-10-07-nhpl-produtividade-design.md). A aprovação permanece válida. A revisão pendente é deste plano e do método de execução.

## Global Constraints

- Piloto: **NHPL · Montagem de abafadores**; linha **Montagem**; famílias **VGARD HP** e **MARK V**. Low/Medium/High são variantes informadas, sem criação presumida de seis SKUs ou receitas.
- Produtividade = **100 × produção total realizada / produção planejada**. Numerador exclusivamente `gross`; `good`, sucata em peças e material em kg permanecem separados.
- Meta inicial **95%**, com fonte, autor e vigência definidos na configuração; revisões aceitam valores de 0 a 100. Não presumir vigência retroativa.
- Takt informado **12 s/peça**: sugere o plano pelo tempo líquido. Plano informado e aprovado prevalece. Paradas imprevistas não reduzem o denominador.
- Não usar os 12 segundos como ciclo ideal do OEE nem aplicar 95% a OEE/MTBF/MTTR.
- Novos registros do piloto exigem máquina, processo, família, OP, lote, turno e período aplicável. Preservar registros antigos incompletos como histórico consultável.
- Instantes e exibição em **America/Sao_Paulo**, com intervalos `[início, fim)` e suporte à meia-noite. Não inventar horários ou pausas da fábrica.
- Ausência é indisponibilidade; zero exige apontamento explícito. Não ratear produção observada entre horas ou recortes sem detalhamento real.
- Um resultado final exige encerramento explícito dos apontamentos, plano compatível e cobertura completa. Sessões revogadas não continuam gravando.
- Administração/Engenharia definem planos, políticas e referências; Administração/Engenharia/Operação registram e confirmam apontamentos; Consulta acompanha. Cadastros gerais continuam exclusivos da Administração.
- Ninguém aprova a própria correção, inclusive Administração. Serviços e regras continuam protegendo as ações.
- Preservar T20/selos, materiais originais, contas, REs, vínculos, login e identidade visual existentes. `origin: demo` permanece excluído da consulta operacional.
- Esta entrega não conecta CLP/IHM, SAP, Power BI ou andon, não instala coletor e não altera automaticamente a nuvem. O mínimo de 30 amostras por estudo do piloto pertence ao bloco C, sem reinterpretá-lo como 30 por turno.

## Review Focus

1. Dois usuários planejam a mesma máquina para OPs/produtos diferentes: a criação transacional do próximo evento por recurso deve rejeitar sobreposição ou revisão obsoleta; a leitura também identifica incoerência. Testes na tarefa 4.
2. Um apontamento chega enquanto outra pessoa encerra o intervalo: o registro entra antes do fechamento ou é recusado, sem confirmação baseada em uma lista antiga. Testes na tarefa 5.
3. Consulta limitada, correção conflitante ou produção que cruza intervalos: não emitir resultado final nem preencher distribuição fictícia. Testes nas tarefas 1, 5 e 6.
4. Metas mudam dentro do período consultado, ou 284/300 arredonda na tela para 95%: segmentar vigências e decidir pelo valor exato. Testes na tarefa 6.
5. Consulta/Operação abrem rota direta ou simulação: preservar o perfil efetivo e as restrições, sem promoção pelo RE ou pelo cenário. Testes na tarefa 7.

---

## Estado verificado nesta retomada

Data: 07/10/2026. Pasta: `C:/Users/Kauan/Desktop/msa-master`.

- A pasta não contém `.git`. Comparação em leitura com a árvore integral da `master`: **704/704 arquivos idênticos**, nenhum divergente/ausente/adicional antes deste plano. Commit: `8bed53c67db97d57dfdcefb74ef1781ae92e0955`, publicado em 07/10/2026 às 16:42:47, America/Sao_Paulo.
- Implementado: login RE/senha e membership por perfil; cadastro relacional; produção bruta/boa; perdas e paradas; CEP I-MR; hora a hora; CSV com prévia; análise/correção rastreável; separação Operacional/Apresentação e simulação em memória.
- Não implementado: catálogo NHPL, planejamento aprovado por intervalos, política versionada de produtividade/takt, confirmação dos apontamentos, cálculo de produtividade e navegação/simulação adequada ao perfil.
- Falhas ainda presentes: `history.js` carrega carry-over corretamente, mas `main.js:380` lista os registros sem recorte por interseção; `main.js:846` baixa a Promise da exportação CEP autenticada; `registry.update()` só altera nome/código/ativo das metas; `openSimulation()` atribui `simulation-admin` ao usuário.
- `npm ci --ignore-scripts --no-audit --no-fund` concluiu. `npm test`: **112 aprovados, 0 falhas**. `npm run verify:static -- --deploy`: **56 arquivos, 0 erros**. `--deploy` aqui é somente verificação.
- Os dez arquivos originais de `MSA - Material Fornecido` mantêm os hashes da conferência documentada. A foto do Pitch Board foi reexaminada: NHPL e colunas Plano/Realizado/Acumulado/Sucata.
- Não foram revalidadas contas/dados/regras da nuvem, testes de navegador ou emuladores nesta sessão. As contagens e ativações de 07/10 dos documentos são evidência anterior, não uma leitura remota feita agora.

Antes de implementar, recompor ou usar metadados Git baseados na `master` conferida, preservando a pasta e este plano. O bundle histórico pode ter uma base anterior; não substituir os arquivos atuais por seu checkout. Conferir novamente a revisão remota e eventuais mudanças locais. Não há commit, push ou deploy autorizado por este plano.

## Fontes e respostas completas

Foram lidos [RETOMADA](../../../RETOMADA_2026-10-07.md), [PROMPT_RETOMADA](../../../PROMPT_RETOMADA.md), especificação, [brainstorming](../../BRAINSTORM_FABIANA_MSA_2026-10-07.md), [primeiro conjunto](../../RESPOSTAS_FABIANA_MSA_2026-10-07.md), [complemento integral](../../../referencias-locais/contexto-historico/2026-10-07-respostas-fabiana-complemento.txt), [auditoria de acessos](../../ACESSOS_E_AUDITORIA_MSA_2026-10-07.md), [auditoria anterior](../../AUDITORIA_REGRAS_NEGOCIO_MSA_2026-10-06.md), [entrega CEP](../../ENTREGA_CEP_E_PENDENCIAS_MSA_2026-10-06.md), [mapa de fontes](../../MAPA_FONTES_LOCAIS.md) e [enunciado](../../continuidade/2026-10-06/ENUNCIADO_TRANSCRITO.md).

O anexo enviado nesta retomada, `Texto colado.txt`, foi lido integralmente. Seu complemento contém exatamente o texto já preservado no arquivo acima. A organização antiga em dez temas não limita a quantidade de perguntas respondidas.

| Respostas fornecidas | Tratamento |
|---|---|
| NHPL, abafadores, contexto obrigatório, 95%, metas anuais, 12 s/peça | Tarefas 2–6; vigência e autoria no software, sem atribuir homologação empresarial |
| Pessoas que registram/revisam/aprovam; uso em computador/tablet/celular | Tarefas 5, 7 e 8; quatro perfis preservados, sem distribuir cargos automaticamente |
| Importação automática, estados/alarmes, início/fim e motivos de microparadas | Bloco B, posterior; fim da parada considera retorno com peças boas validadas |
| Manômetro, ausência de contadores automáticos, interfaces confirmadas por Manutenção/TI, restrições de rede e hardware parcialmente disponível | Dependências do bloco B; telas da IHM não comprovam aquisição funcional |
| Plano de controle, ensaios/performance, OEE/MTBF/MTTR/taxa de falha, pelo menos 30 amostras e coleta por turno | Bloco C; sem inventar ciclo ideal, metas ou política de inspeção |
| Histórico completo, Pareto/correlação, TV, SAP/Power BI, andon e métricas de sucesso | Bloco D e integrações posteriores; sem alegar ganhos ou conexões já obtidos |

## Contratos e persistência propostos

Estas escolhas de armazenamento são propostas deste plano, não mudanças já efetuadas. Os registros atuais permanecem nas suas estruturas.

| Estrutura sob `/workspaces/{ws}` | Conteúdo e responsabilidade |
|---|---|
| `pilots/nhpl` | `machineId`, `processId`, IDs das duas famílias, linha, variantes informadas, fonte e auditoria da instalação. Não contém leituras ou limites inventados |
| `productionPolicies/{policyId}` | Identidade/escopo e sequência de revisões imutáveis de `productivityPercent` ou `taktSeconds`; valor, unidade, `effectiveFrom`, `effectiveTo` opcional, fonte, justificativa e autoria. Escopo NHPL/processo pode abranger ambas as famílias |
| `targetRevisions/{targetId}` | Sequência de revisões imutáveis das metas legadas; contexto, métrica, unidade, limite e vigência. O registro original em `targets` não é sobrescrito |
| `productionPlans/{machineId}` | Sequência de eventos de plano/revisão por recurso. Cada revisão tem contexto, período, pausas, intervalos, quantidade, origem, referência de takt e justificativa. A ordem dos eventos serializa alterações da mesma máquina |
| `productionIntervals/{intervalId}` | Cabeçalho imutável com contexto, referência do plano, `eventDate` e `firstSlotId`; eventos de incrementos brutos/bons e encerramento em `events/{eventId}`. Administração/Engenharia inicializa o intervalo a partir da revisão aprovada |

`Context` reutiliza `machineId`, `processId`, `productId`, `order`, `lot`, `shift`, `recipe` opcional, acrescido de `variant` opcional. `productId` representa a família, não um SKU inventado. A classificação NHPL vem de `pilots/nhpl`, não do texto do nome da máquina.

`PlanRevision` contém `id`, `planId`, `context`, `startedAt`, `endedAt`, `breaks`, `intervals`, `plannedPieces`, `quantitySource: 'informed' | 'takt'`, `taktRevisionId` quando aplicável, `createdBy`, `createdAt`, `reason` nas revisões e `supersedes` explícito. Os intervalos possuem IDs próprios e limites, com divisões de 15/30/60 minutos e eventual trecho final menor, sem descartar tempo.

Cada sequência usa cabeçalho com `firstSlotId` e eventos com `previousEventId`, `sequence`, `nextSlotId`, autor e instante. O primeiro evento só ocupa `firstSlotId`; cada seguinte só ocupa o `nextSlotId` do anterior. `repo.create()` já disputa a criação do mesmo nó por transação. As regras permitem somente criação de eventos, exigem predecessor existente/compatível e ordem consecutiva e proíbem exclusão, alteração e ramificação. Não existe ponteiro de cabeça gravável nem permissão ampla de escrita no agregado. Políticas e planos reutilizam esse mecanismo para conservar revisões sem comparar objetos inteiros por `RuleDataSnapshot.val()`.

O evento `closure` é terminal, sem sucessor: contém autor, instante, produção total confirmada, predecessor coberto, revisão, referências do plano/política e IDs/decisões das correções usadas na confirmação. Os IDs dos apontamentos incluídos são derivados da cadeia até esse predecessor, não de uma lista arbitrária enviada pelo cliente. Correções aprovadas depois do fechamento continuam rastreáveis na visão efetiva; não reescrevem o total originalmente confirmado. Um plano revisado preserva as referências originais; um registro na revisão anterior requer conciliação explícita para participar da avaliação atual, sem relink silencioso.

As quantidades NHPL novas ficam apenas nos eventos de produção de `productionIntervals`. A leitura projeta esses eventos para o formato de produção existente, acrescentando `intervalId`, `planId` e `planRevisionId`. Não gravar cópia também em `production`: isso tornaria o somatório e o fechamento vulneráveis a duplicação e escritas parciais. Coletas/perdas/paradas continuam em suas raízes, com contexto e referências do piloto; produção histórica continua em `production`. Gravações novas NHPL na raiz legada são recusadas para não contornar o encerramento.

Correções de produção NHPL reutilizam `corrections`, com `intervalId` opcional para resolver o original no agregado. Propostas/decisões não alteram o original ou o encerramento. A visão efetiva exibe encerramento e correções aprovadas; conflitos suspendem o resultado. Campos de contexto, base e referência do plano permanecem imutáveis nas substituições.

API pública planejada, integrada em `createMsaServices()`:

```text
nhpl.preview() -> PilotPreview
nhpl.install({expectedPreview}) -> PilotContext
policies.create(payload) -> PolicyRevision
policies.revise(policyId, {expectedRevisionId, ...payload}) -> PolicyRevision
policies.reviseTarget(targetId, {expectedRevisionId, ...payload}) -> TargetRevision
planning.suggest(payload) -> PlanDraft
planning.approve(payload) -> PlanRevision
planning.revise(planId, {machineId, expectedResourceRevision, ...payload}) -> PlanRevision
plannedProduction.record(intervalId, payload) -> ProductionRecord
plannedProduction.confirm(intervalId, {expectedRevision, confirmedGrossPieces}) -> Closure
getProductivity(query, range, {now, mode}) -> ProductivityResult
```

`ProductivityResult` retorna segmentos de vigência/contexto e agregado quando compatível. Cada segmento inclui estado (`programmed`, `partial`, `final`, `not-scheduled`, `inconsistent`, `unavailable`), plano, expectativa transcorrida, total realizado, boas, sucata, percentual, mínimo, saldo para meta, avaliação (`met`, `below`, `unavailable`), origem/versões, cobertura, último registro, IDs usados e pendências. Com metas diferentes, não emitir avaliação única artificial para todo o período.

## Tarefa 1: recorte temporal e exportação CEP

**Arquivos:** criar `app/src/ui/period-records.js` e `tests/unit/period-records.test.js`; modificar `app/src/ui/main.js`; criar `tests/browser/period-export.mjs`. Reutilizar `history.js` sem remover sua busca de carry-over.

**Interfaces:** `recordsInPeriod(kind, records, {from,to}) -> Record[]`. Produção/paradas usam interseção; os demais tipos conservam seu recorte atual. A tabela e a exportação da tabela consomem a mesma seleção.

- [ ] Escrever teste que conserva parada aberta/iniciada antes do filtro, exclui intervalo com `endedAt === from` ou `startedAt === to` e conserva produção que intersecta o filtro sem fracionar a quantidade. Executar `node --test tests/unit/period-records.test.js`; deve falhar antes da função existir.
- [ ] Implementar a seleção para listagem/CSV, mantendo todos os dados carregados para correções e cálculos. Um intervalo parcialmente contido é exibido como tal; seu total não vira produção do recorte automaticamente.
- [ ] Acrescentar teste de navegador com fixture autenticada cujo `csv.exportRecords` resolve após atraso. Conferir conteúdo CSV, ausência de `[object Promise]`, erro sem download e liberação do estado de exportação.
- [ ] Aguardar a Promise em `cep-export`, impedir clique duplicado durante a exportação e mostrar falha pelo tratamento de erro existente. Não modificar o método estatístico CEP.
- [ ] Executar os testes acima e `npm test`. Resultado: carry-over preservado, tabelas coerentes e CSV autenticado válido. Marco sugerido: `Corrige recorte dos apontamentos e exportação CEP`.

## Tarefa 2: catálogo NHPL e contexto obrigatório

**Arquivos:** criar `app/src/catalog/nhpl.js`, `app/src/services/nhpl.js`, `tests/unit/nhpl-catalog.test.js`; modificar `app/src/domain/context.js`, `app/src/services/operations.js`, `app/src/services/history.js`, `app/src/domain/dashboard.js`, `app/src/services/create-msa.js`, `app/src/index.js`, `app/src/ui/demo-workspace.js`, `tests/helpers/memory-repository.js`, `firebase/database.rules.json`; criar `tests/rules/nhpl.test.js`.

**Interfaces:** `createNhplService({repo,actor})` produz `nhpl.preview/install`; `assertPilotContext(context, pilot) -> Context` exige OP/lote/turno apenas para o piloto. IDs reservados: máquina `nhpl`, processo `nhpl-montagem`, famílias `nhpl-vgard-hp` e `nhpl-mark-v`; colisão incompatível é erro, sem sobrescrita.

- [ ] Criar regressões para instalação duas vezes com IDs iguais, colisão incompatível, negação para outros perfis e snapshot T20/selos idêntico antes/depois. Executar `node --test tests/unit/nhpl-catalog.test.js` antes da implementação.
- [ ] Implementar prévia/instalação idempotente dos vínculos e marcador do piloto. Se ocorrer interrupção, reconciliar somente itens compatíveis e ainda ausentes; o marcador final só é salvo quando os vínculos estiverem íntegros. Não criar parâmetros/limites ou apontamentos.
- [ ] Estender allowlists e filtros de contexto para `variant`. Exigir contexto do piloto nos serviços e nas regras de novos registros. Não revalidar os legados como se fossem novos. Não tornar `recipe` obrigatória.
- [ ] Testar SDK direto: Operação não instala o catálogo; registro novo do piloto sem OP/lote/turno é negado; registro antigo incompleto permanece legível. Executar `npm run test:emulator -- tests/rules/nhpl.test.js` com JDK >=21, exclusivamente em `demo-msa`.
- [ ] Conferir testes de catálogo/contexto e suite atual. Marco: `Adiciona catálogo NHPL e contexto rastreável do piloto`.

## Tarefa 3: metas e takt com revisões

**Arquivos:** criar `app/src/domain/production-policy.js`, `app/src/repositories/append-ledger.js`, `app/src/services/production-policy.js`, `tests/unit/append-ledger.test.js`, `tests/unit/production-policy.test.js`, `tests/rules/production-policy.test.js`; modificar `app/src/services/registry.js`, `app/src/services/history.js`, `app/src/domain/indicators.js`, `app/src/services/create-msa.js`, `app/src/index.js`, `app/src/ui/demo-workspace.js`, `firebase/database.rules.json`.

**Interfaces:** `createProductionPolicyService({repo,actor})` produz `policies.create/revise/reviseTarget`. `resolvePolicy(revisions,{context,from,to}) -> {segments,conflicts}` seleciona vigências sem desempate silencioso. `resolveTargets(originals,revisions,range)` adapta metas antigas para os indicadores existentes. `readLedger(repo,path,{maxEvents}) -> {events,last,complete}` percorre a cadeia; `appendLedgerEvent(repo,path,{expectedEventId,event}) -> Event` cria o sucessor esperado ou retorna conflito, sem reaplicar a operação automaticamente em outra revisão.

- [ ] Criar testes de 95%, takt 12, vigência inicial explícita, limite 0/100 válido, fora da faixa inválido, fonte/justificativa obrigatórias, revisão obsoleta e duas vigências conflitantes. Provar que a revisão de meta antiga conserva o original. Executar `node --test tests/unit/production-policy.test.js` e confirmar falha inicial.
- [ ] Implementar sequência append-only e controle do predecessor esperado pela criação transacional do sucessor da política/meta. Testar cadeia interrompida, limite de leitura, tentativa de ramificação e exclusão de evento antigo. Takt exige valor positivo; produtividade aceita percentual finito de 0 a 100. Campos de revisão/auditoria são imutáveis.
- [ ] Resolver metas históricas por sua vigência: um sucessor válido com `supersedes` encerra logicamente a aplicabilidade anterior a partir de `effectiveFrom`, sem editar o evento anterior. Uma revisão posterior não altera silenciosamente períodos anteriores; retroatividade exige justificativa e comparação. Alternativas incompatíveis permanecem conflito. A revisão de meta legada passa pelo mesmo fluxo, em vez de liberar alteração destrutiva de `threshold` em `registry.update()`.
- [ ] Testar SDK direto com Administração/Engenharia permitidas e Operação/Consulta negadas, autoria forjada recusada, exclusão/sobrescrita negadas. Executar `npm run test:emulator -- tests/rules/production-policy.test.js`.
- [ ] Confirmar que selos não recebem 95% nem takt NHPL. Marco: `Versiona metas e takt preservando definições anteriores`.

## Tarefa 4: planejamento por recurso e período

**Arquivos:** criar `app/src/domain/planning.js`, `app/src/services/planning.js`, `tests/unit/planning.test.js`, `tests/integration/planning-race.test.js`, `tests/rules/planning.test.js`; modificar `app/src/domain/time.js`, `app/src/services/create-msa.js`, `app/src/index.js`, `app/src/ui/demo-workspace.js`, `firebase/database.rules.json`.

**Interfaces:** `suggestPlan({context,startedAt,endedAt,breaks,intervalMinutes,taktRevision}) -> PlanDraft`; `validatePlan(draft) -> PlanDraft`; serviço `planning.suggest/approve/revise`. Reconstituir reservas da cadeia `productionPlans/{machineId}`; validar a proposta e criar somente o sucessor do último evento lido, usando `appendLedgerEvent`. Se outra sessão ocupar esse sucessor, rejeitar como revisão obsoleta e exigir nova conferência.

- [ ] Criar testes: 3600 s líquidos/12 => 300; pausa prevista de 600 s => 250; pausas sobrepostas descontadas uma vez; plano informado 292 prevalece; virada 23:30–00:30 aceita; janela de outro produto/OP na mesma máquina em sobreposição é recusada. Executar `node --test tests/unit/planning.test.js` antes do módulo.
- [ ] Implementar união de pausas dentro do período e diferenças das capacidades acumuladas arredondadas. Teste adicional: 1798 s líquidos divididos em duas partes de 899 s conservam 149 peças, distribuídas em 74 e 75; arredondar partes isoladamente produziria 148. Pausas imprevistas não entram nessa função.
- [ ] Implementar plano informado/sugestão confirmada, intervalos e revisões append-only. Revisar plano encerrado exige justificativa e comparação antes/depois. Não sobrescrever a revisão usada por registros.
- [ ] Testar duas sessões: mesmo predecessor esperado gera uma confirmação e uma rejeição obsoleta; duas reservas sobrepostas não são aceitas pelo serviço. As regras protegem papéis, referências, autoria e sequência imutável; a leitura do domínio também bloqueia conflitos temporais, inclusive uma proposta incoerente enviada diretamente por identidade autorizada, sem presumir que regras RTDB percorram intervalos arbitrários.
- [ ] Inicializar os agregados de intervalo idempotentemente a partir da revisão aprovada. Interrupção mantém a entrega pendente, sem autorizar registro em intervalo órfão. Executar `npm run test:emulator -- tests/rules/planning.test.js tests/integration/planning-race.test.js`.
- [ ] Conferir que nenhuma parada registrada recalcula o plano aprovado. Marco: `Adiciona planejamento aprovado por período na NHPL`.

## Tarefa 5: incrementos, encerramento e correções

**Arquivos:** criar `app/src/services/planned-production.js`, `app/src/repositories/operation-records.js`, `tests/unit/planned-production.test.js`, `tests/integration/production-close-race.test.js`, `tests/rules/planned-production.test.js`; modificar `app/src/domain/review.js`, `app/src/services/operations.js`, `app/src/services/analysis.js`, `app/src/services/history.js`, `app/src/services/create-msa.js`, `app/src/index.js`, `app/src/ui/demo-workspace.js`, `tests/helpers/memory-repository.js`, `firebase/database.rules.json`.

**Interfaces:** `createPlannedProductionService({repo,actor,clock,idFactory})` produz `plannedProduction.record/confirm`. `getOperationRecord(repo,{recordType,recordId,intervalId}) -> Record|null` e `projectIntervalProduction(intervals) -> ProductionRecord[]` centralizam a leitura legada/NHPL para histórico e correção.

- [ ] Criar regressões para total 285, boas 270, zero bruto explícito, ausência sem zero, incremento negativo/fracionário, intervalo/revisão incompatíveis e id duplicado. `confirm` exige período concluído, revisão esperada, bruto registrado e total confirmado igual à soma efetiva válida. Executar `node --test tests/unit/planned-production.test.js` antes do serviço.
- [ ] Implementar inserção e encerramento como eventos imutáveis em `productionIntervals/{intervalId}/events/{eventId}`. A confirmação percorre a cadeia íntegra e disputa o sucessor do último evento usado para conferir o total; grava o fechamento terminal, sem alterar o plano. Tentativa posterior orienta para correção. As regras negam sucessor de fechamento, ramificação, alteração e remoção de evento antigo.
- [ ] Integrar a projeção no histórico, indicadores existentes e busca do original nas correções. Preservar `intervalId/planId/planRevisionId` em substituições, atualizar regras e detalhes da proposta. Coletas/perdas/paradas do piloto carregam as referências e continuam usando os serviços existentes.
- [ ] Acrescentar teste de corrida: gravação versus fechamento, duas confirmações e correção versus avaliação. Um novo incremento depois do fechamento é negado também pelo SDK, incluindo tentativa de usar a raiz legada `production`. Uma correção aprovada por outra pessoa altera apenas a visão efetiva; duas alternativas conflitantes suspendem a avaliação. Correção concorrente ao fechamento conserva os eventos e exige reconciliação se o total confirmado não corresponder à visão efetiva usada naquele encerramento.
- [ ] Confirmar Administração/Engenharia/Operação podem encerrar, Consulta não; Operação não pode alterar o plano por meio do agregado. Executar `npm run test:emulator -- tests/rules/planned-production.test.js tests/integration/production-close-race.test.js` e os testes existentes de correção/sessão.
- [ ] Conferir totais históricos e nenhuma quantidade duplicada entre raiz legada e projeção. Marco: `Registra e encerra apontamentos com revisão e auditoria`.

## Tarefa 6: cálculo único da produtividade

**Arquivos:** criar `app/src/domain/productivity.js`, `tests/unit/productivity.test.js`; modificar `app/src/services/create-msa.js`, `app/src/services/history.js`, `app/src/domain/dashboard.js`, `app/src/domain/hourly.js`, `app/src/domain/indicators.js`, `app/src/index.js`.

**Interfaces:** `buildProductivity(data,{context,from,to,now,coverage,mode}) -> ProductivityResult`, com `mode: 'manual' | 'continuous'`. `getProductivity(query,range,options)` carrega planos, políticas, intervalos e correções com cobertura explícita. Domínio, painel, hora a hora, alertas e CSV compartilham esse resultado.

- [ ] Criar os testes numéricos abaixo com períodos encerrados/confirmados. Executar `node --test tests/unit/productivity.test.js`; primeiro resultado deve falhar por módulo ausente.

| Plano | Bruto | Esperado |
|---:|---:|---|
| 300 | 285 | 95%, meta atingida, mínimo 285 |
| 300 | 284 | 94,666…%, abaixo, sem aprovação por arredondamento |
| 250 | 237 | 94,8%, abaixo; mínimo 238 |
| 300 | 250 | 83,333…%, mesmo com parada imprevista de 10 min |
| 292 | 278 | 95,205…%, mínimo 278 |
| 100 + 300 | 100 + 270 | 92,5%; não média simples dos percentuais |
| 300 | 285, boas 270, sucata 15 | 95%; não somar boas ao bruto nem aprovar qualidade |

- [ ] Implementar fórmula, mínimo `ceil(plano × meta/100)`, saldo não negativo para atingir meta, excedente separado, comparação exata e preservação de resultados >100%. Quantidades e contextos incompatíveis não participam silenciosamente.
- [ ] Acrescentar estados: futuro => Programado; sem plano/registro/fechamento/cobertura => pendência específica; plano zero sem produção => Sem produção programada; plano zero com bruto positivo => inconsistência; bruto zero explícito/plano positivo => 0%.
- [ ] Testar parcial contínuo: 30 minutos líquidos de plano 300/h => expectativa 150; bruto 143 => 95,333…% parcial. Durante pausa prevista, expectativa não avança. Último registro/cobertura são visíveis; ausência de atualização não prova parada.
- [ ] Testar modo manual: avaliar apenas intervalos concluídos com apontamentos disponíveis, mostrar cobertura e pendências e aguardar atualização do intervalo aberto. Agregado com intervalo pendente não recebe estado final.
- [ ] Testar recorte parcial sem rateio do bruto, registros que cruzam intervalos, mudança de meta na janela, paginação incompleta e revisões conflitantes. Produção integralmente contida no período pode compor o total, mas não sua distribuição horária sem detalhamento. Evolução de revisão precisa de conciliação rastreada antes da avaliação final.
- [ ] Executar os testes novos e os de `hourly`, `indicators`, `dashboard` e `history`. Marco: `Calcula produtividade sobre o plano aprovado com cobertura explícita`.

## Tarefa 7: navegação e simulação por perfil

**Arquivos:** criar `app/src/ui/access.js`, `tests/unit/ui-access.test.js`; modificar `app/src/ui/main.js`, `app/src/ui/simulation.js`, `tests/unit/simulation.test.js`, `tests/browser/access-profiles.mjs`, `tests/browser/fixtures/auth.mjs`; criar `tests/browser/simulation-profiles.mjs`.

**Interfaces:** `visibleNavigation(role) -> Route[]`, `initialRoute(role) -> Route`, `resolveRoute(route,role) -> Route`. Estender `openSimulation(caseId,{actor,papa,now})` mantendo ator de preparação separado do ator efetivo dos serviços entregues à interface.

- [ ] Criar testes para as quatro funções por perfil, hash digitado, RE sem promoção, apresentação sem gravação e preservação de papel ao simular. Executar `node --test tests/unit/ui-access.test.js tests/unit/simulation.test.js` antes da mudança.
- [ ] Administração mantém navegação completa; Engenharia inicia em `engineering` e acessa planejamento/metas/referências; Operação inicia em `operations` no contexto NHPL e acompanha parâmetros/histórico; Consulta inicia no dashboard e acompanha parâmetros/CEP/histórico. Configurações da própria conta permanecem acessíveis a todos.
- [ ] Retirar áreas exclusivas de gestão/decisão dos menus de Operação/Consulta. Rotas não autorizadas exibem retorno acessível; serviços/regras permanecem a autoridade de gravação. Sem sessão, preservar o login existente.
- [ ] Preparar cenários NHPL por ator interno; expor serviços com o perfil da sessão. Abrir simulação sem sessão usa Consulta, sem atribuir Administração fictícia ao usuário. Casos antigos CEP/selos continuam acessíveis como históricos fictícios, sem renomear suas medições.
- [ ] Testar retorno da simulação para sessão/contexto anteriores, saída/revogação enquanto modal está aberto e ausência de escrita Firebase. Executar `node tests/browser/access-profiles.mjs` e `node tests/browser/simulation-profiles.mjs` com Playwright configurado.
- [ ] Marco: `Adequa navegação e simulação às permissões da sessão`.

## Tarefa 8: experiência operacional e CSV

**Arquivos:** criar `app/src/ui/planning.js`, `app/src/ui/productivity.js`, `app/src/io/productivity-csv.js`, `tests/unit/productivity-csv.test.js`, `tests/browser/nhpl.mjs`; modificar `app/src/ui/main.js`, `app/src/ui/forms.js`, `app/src/ui/hourly.js`, `app/src/ui/format.js`, `app/src/ui/charts.js`, `app/src/io/csv.js`, `app/styles.css`, `tests/browser/fixtures/auth.mjs`.

**Interfaces:** `planningPage(state)`, `productivityMarkup(result)`, `productivityReportRows(result) -> Object[]`. O CSV passa por `services.csv.exportRecords` aguardado e com neutralização de fórmulas existente. Não recalcular o indicador no renderizador ou exportador.

- [ ] Criar teste CSV que exige contexto/OP/lote/turno, período, base `gross`, fonte, plano/revisão, meta/vigência, takt/origem quando aplicável, cobertura, estado, confirmação e correções usadas. Conferir que `null` permanece vazio e zero permanece zero.
- [ ] Implementar instalação por prévia para Administração e seleção inicial NHPL quando disponível. Contexto permanece visível nos formulários. Dashboard NHPL mostra Plano/Realizado/Produtividade/Mínimo/Saldo, boas e sucata separadas; não mostra 21 zonas de selos como montagem.
- [ ] Oferecer planejamento/meta pela área técnica de Engenharia/Administração; contexto, valor e vigência visíveis também na consulta. Criar revisão com justificativa e comparação, preservando histórico e sem reaproveitar o contexto oculto de Cadastros.
- [ ] Integrar intervalos de 15/30/60 minutos, sugestão por 12 s e plano informado; responsável confirma o plano. Operação registra incrementos e confirma total/encerramento sem controles para mudar o plano.
- [ ] Exibir Parcial/Final/Programado/Pendente e último apontamento/cobertura. Alerta de produtividade somente para segmento avaliável; pendência de dados tem indicação própria. Respeitar segmentação de metas e produção horária indisponível.
- [ ] Testar fluxo completo por perfil em 1440×900, 768×1024 e 390×844, temas claro/escuro, sem overflow ou sobreposição; inspecionar capturas. Verificar CSV CEP assíncrono junto ao CSV novo.
- [ ] Executar `node --test tests/unit/productivity-csv.test.js`, `node tests/browser/nhpl.mjs` e `node tests/browser/period-export.mjs`. Marco: `Entrega acompanhamento NHPL com planejamento e produtividade rastreáveis`.

## Tarefa 9: regressão, preservação e documentação de entrega

**Arquivos:** criar `tests/integration/nhpl-flow.test.js` e `docs/ENTREGA_NHPL_MSA.md`; atualizar `README.md`, `RETOMADA_2026-10-07.md`, `PROMPT_RETOMADA.md` apenas para registrar o estado efetivamente entregue. Preservar a especificação e auditorias como histórico.

- [ ] Testar fluxo em duas identidades autorizadas: instalar piloto, definir políticas/plano, registrar/confirmar, propor correção, recusar autoaprovação, decidir por outra pessoa, consultar/exportar. Conferir que outra OP não herda plano/produção e Consulta só lê.
- [ ] Rodar `npm test`, `npm run test:emulator` com JDK >=21 e `npm run verify:static -- --deploy`. Não encerrar processos alheios para liberar portas; não usar nuvem como fallback do emulador.
- [ ] Rodar os navegadores das tarefas 1, 7 e 8, mais `node tests/browser/cep.mjs` e `node tests/browser/data-tools.mjs` como regressão dos fluxos compartilhados. Registrar runtime, versões, resultados e capturas, distinguindo fixture/simulação da nuvem.
- [ ] Comparar snapshots legados em ambiente de teste e SHA-256 dos materiais originais antes/depois. Conferir login/REs/configuração/membership e que os testes não usam contas reais ou senhas do repositório.
- [ ] Documentar métodos, pendências B–D e limitações reais. Não substituir resultados anteriores por alegação de testes novos quando uma suite não tiver sido executada.
- [ ] A instalação operacional e eventual publicação de regras/site são ações separadas da implementação local. Antes da instalação real, obter snapshot privado atual e demonstrar prévia/diff exclusivamente aditivos, preservando dados e vínculos. Não executar geradores `--apply` nem recriar contas.
- [ ] Entrega aceita quando tarefas 1–8 e regressões passam, histórico permanece íntegro e nenhum resultado final depende de dado inventado, permissão ampliada ou confirmação ausente. Marco: `Documenta e verifica a primeira entrega NHPL`.

## Ordem e revisão

Executar 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9. Cada tarefa termina com uma verificação própria; os marcos de commit são sugestões para quando o checkout tiver Git e houver autorização de versionamento. Não executar simultaneamente tarefas que alteram `history.js`, `main.js` ou as regras.

Recomendo execução **nesta conversa**, por tarefas, porque planejamento, encerramento, correções e regras compartilham contratos e precisam de conferência conjunta. Execução **por subagentes** também é possível após escolha explícita do usuário, com revisão por tarefa; exige mais coordenação dos arquivos compartilhados.

Revisão interna original deste plano: cobertura das seções da especificação conferida; correções associadas incluídas; casos numéricos preservados; armazenamento dos novos incrementos e busca das correções definidos; segurança e concorrência têm testes próprios; fases B–D continuam posteriores. Os principais pontos técnicos para revisão eram o agregado por intervalo e a conciliação explícita das revisões do plano.

Estado após execução autorizada em 07/10/2026: primeira entrega implementada e validada localmente. Este plano conserva o roteiro original; os checkboxes não são o relatório da execução. Consolidações de arquivos/testes, decisões e limitações efetivas estão em `output/nhpl-entrega-2026-10-07/progress.md` e `docs/ENTREGA_NHPL_MSA.md`. Replanejamento com apontamentos permanece bloqueado; correções auditadas e recuperação de aprovação interrompida foram verificadas. Não houve publicação ou instalação no workspace real.
