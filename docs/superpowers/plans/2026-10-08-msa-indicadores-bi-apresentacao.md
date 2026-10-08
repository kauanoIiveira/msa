# MSA — indicadores, BI e apresentação Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expor os dados completos com clareza, exportar coletas com % Scrap e fatos próprios para BI, fornecer Excel de capacidade e provar a jornada de apresentação.

**Architecture:** Projeção única das bases do plano 1 e dos fluxos do plano 2, exportadores puros sem gerar medições e UI MSA consistente. Excel parte do modelo original do projeto, mantendo dados e fórmulas rastreáveis.

**Tech Stack:** JavaScript ES modules, Firebase, PapaParse, Chart.js e ferramentas atuais; ZIP `fflate` 0.8.2 com versão fixa/MIT para editar OOXML, sem copiar o exportador MSE.

**Spec:** `docs/superpowers/specs/2026-10-08-msa-jornada-coesa-design.md`, seção D e critérios de aceitação; depende dos planos 1/2 do índice.

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

- Identidade dos instrumentos e unidade alterada — tarefa 1: não renumerar zonas nem misturar séries.
- Correção, mais de uma coleta no mesmo período e filtro de lote/OP — tarefa 2: sem contagens duplicadas, % Scrap com chave e denominador corretos.
- Vácuo negativo, texto de fórmula, zero, vazio e turno3 — tarefa 2: tipos/números e data operacional preservados.
- 1001 leituras, template com fórmula/referência problemática e insuficiência de amostra — tarefa 3: sem truncar, reparar só o comprovável e explicar diagnóstico.
- Consolidação desatualizada, segundo navegador e tela320px — tarefas 4/5: revisão indicada, estado persistente e jornada acessível.

## Task 1: Indicadores compartilhados e instrumentos por contexto

**Files:** Create `app/src/ui/indicators-page.js`, `app/src/domain/instrument-view.js`, `app/src/ui/photo-preview.js`, `tests/unit/instrument-view.test.js`, `tests/unit/indicator-consistency.test.js`; modify `app/src/ui/main.js`, `app/src/ui/overview.js`, `app/src/ui/technical.js`, `app/src/ui/charts.js` e `app/styles.css`. Indicadores hoje renderizados em main são extraídos com responsabilidade restrita; TV permanece na mesma projeção.

**Interfaces:** `buildInstrumentView({context,parameters,versions,collections,asOf}) -> {zones,utilities,other,diagnostics}`; identidade por código/ID do catálogo próprio. `indicatorSummary({metrics,comparison,targets}) -> model` consome `projectWorkspaceMetrics`. `createPhotoPreview({file,context}) -> {previewUrl,context,validated:false}` apenas local e descartável, sem enviar nem preencher readings.

- [ ] Testar Z2 permanece Z2 com Z1 ausente; zero e vácuo negativo válidos; NHPL não recebe zonas T20; mudança de unidade/versionId separa série; última leitura mostra timestamp e base. Comparação de turnos soma bases/pondera OEE, não médias. Visão geral/Indicadores/TV têm mesmos valores/estado. Foto não grava coleta, não chama rede/OCR e revoga URL ao fechar/trocar.
- [ ] Rodar `node --test tests/unit/instrument-view.test.js tests/unit/indicator-consistency.test.js`; esperar módulos ausentes. Testes de foto verificam ausência de efeito de gravação, não estrutura HTML.
- [ ] Implementar resumos/detalhes com unidade, fórmula breve, período/cobertura e comparativo anterior; metas só quando aplicáveis. Instrumentos agrupados por função com tendências e referência técnica acessível. Não esconder um desvio legítimo só para colorir cartão. Prévia de foto fica identificada como rascunho não validado, sem sugerir extração automática funcional.
- [ ] Rodar regressões de métricas/limites/CEP e inspecionar ambos contextos e TV no navegador. Eventos conhecidos do conector atual atualizam situação sem comando físico; perda/seq lacuna mantém diagnóstico, não cria produção. Hardware/gateway continuam dependência explícita.
- [ ] Commit: `feat: organiza indicadores e instrumentos por contexto`.

## Task 2: Exportações BI e % Scrap sem multiplicação de fatos

**Files:** Create `app/src/io/bi-model.js`, `app/src/io/bi-export.js`, `app/src/ui/reports-page.js`, `tests/unit/bi-export.test.js`, `docs/BI_DICIONARIO_MSA.md`; modify `app/src/io/csv.js`, `app/src/ui/csv-download.js`, main/access/rotas. Preserve importação e CSV genérico existentes como formatos compatíveis.

**Interfaces:** `buildBiFacts(view) -> {collections,production,losses,stoppages,indicators,diagnostics}`; `calculateScrap({production,losses,scope,coverage}) -> {rejectedPieces,grossPieces,pct,state,scopeId}`; `exportBi({view,kind:'collections'|'production'|'losses'|'stoppages'|'indicators'|'all',locale:'pt-BR'}) -> {files:[{name,mime,text}],manifest,diagnostics}`. Sem escrita. Coleta larga preserva parâmetros/valores com unidades, IDs, original/efetivo/correção, produto/variante/OP/lote/receita, instante/dia operacional/turno/origem; dados de material/espessura vêm da versão da receita.

- [ ] Fixture: bruto100, primeira passagem90, reject10 peças, material2kg e segregadas20 → Scrap10%; material/segregação/retrabalho não contam. Duas coletas no mesmo escopo repetem a taxa com mesmo scopeId, mas production.csv contém um fato bruto100. Outro lote/OP/turno/máquina não altera taxa. Produção sem cobertura/zero denominador → vazio+motivo; bruto confirmado100 e nenhuma perda com cobertura completa → zero verdadeiro. Correção reject10→12 atualiza efetivo mantendo original/ID/correctionId. Turno3 às00:30 usa dia inicial; evento sem alocação é diagnosticado, não rateado.
- [ ] Testar BOM/semicolon/CRLF, acentos/aspas, decimal brasileiro, vácuo -590 numérico e zero; texto `=HYPERLINK(...)` protegido. O escape atual do CSV genérico pode transformar número negativo em texto: verificar o resultado parseado e adequar distinção texto/número no novo exportador, sem quebrar importação. Rodar `node --test tests/unit/bi-export.test.js tests/unit/csv.test.js tests/unit/productivity-csv.test.js`; esperar falha antes da implementação.
- [ ] Implementar modelo/fatos completos com paginação esgotada, limite de tamanho explícito sem truncamento silencioso e erro legível. Dicionário define grain/chaves, numeradores/denominadores, taxa não aditiva, estados de cobertura e versões. Área Relatórios mostra filtros/quantidade/prévia antes do download e mantém contexto consultado.
- [ ] Rodar testes e baixar CSV pela interface via CUA; abrir/parsear arquivo baixado e comparar com eventos do Firebase efetivo, incluindo % Scrap. Guardar evidência sanitizada. Exportar duas vezes produz mesmas amostras/IDs; nenhuma leitura criada ao baixar.
- [ ] Commit: `feat: exporta coletas e fatos BI com scrap reconciliado`.

## Task 3: Excel de capacidade com modelo próprio e fórmulas preservadas

**Files:** Create `app/src/io/capability-excel.js`, `app/src/io/capability-template-map.js`, `app/assets/templates/msa-capability.xlsx` como cópia verificada do original; modify `package.json`, lockfile, `scripts/prepare-vendor.mjs`, Relatórios; create `tests/unit/capability-excel.test.js`, `tests/fixtures/capability-template-map.json`, `docs/EXCEL_CAPACIDADE_MSA.md`. Original intocado: `referencias-locais/materiais/MSA - Material Fornecido/T20A03(EN)5 - Capability study senai.xlsx`.

**Interfaces:** `exportCapabilityExcel({templateBytes,view,studyKey}) -> {bytes,fileName,diagnostics,method}`. `studyKey={machineId,processId,productId,order,lot,recipe,parameterId,versionId,unit}`; coletar série ordenada homogênea, sem inventar timestamp em registro de precisão só data. Novo ZIP usa `fflate` 0.8.2, licença MIT verificada no [repositório oficial](https://github.com/101arrowz/fflate/blob/v0.8.2/LICENSE); instalar somente nesta tarefa após aprovação, fixar versão e preparar vendor local.

- [ ] Testar hash do original inalterado; nomes/estilos/mesclas/comentários preservados; células de valores/zero/negativo numéricas; fórmulas de média/desvio/Cp/Cpk/normalidade preservadas e referências expandem para31,52 e1001 leituras. Valores sem limite/amostra suficiente não produzem OK fixo. Exportação usa registros persistidos ordenados e separados por versão/unidade; material/espessura não vêm de suposição. Escopo incompatível com template retorna diagnóstico e formato próprio adequado, não preenche zonas de NHPL.
- [ ] Rodar `node --test tests/unit/capability-excel.test.js`; esperar ausência do exportador. Conferir mapa de células com os extratos próprios antes de definir endereços; registrar endereços exatos no fixture, não copiar o mapa/código MSE.
- [ ] Implementar edição OOXML mínima da cópia, relações/planilhas/formulas expandidas, tipos numéricos e recálculo ao abrir. Diferenciar método da planilha e CEP I-MR atual. Não criar sigma/Cpk para referência inexistente; usar referências de exemplo qualificadas no pacote, sem homologação inventada. Erro de carregar template permite tentar de novo. XML não relacionado permanece íntegro.
- [ ] Rodar testes; baixar Excel pela UI e abrir com Excel/LibreOffice disponível, comprovar ausência de reparo inesperado, recálculo e comparação independente com série-fonte. Quando app de planilha não estiver disponível, inspeção OOXML não substitui prova de recálculo; registrar lacuna, sem declarar Excel verificado visualmente.
- [ ] Commit: `feat: exporta estudo de capacidade no modelo MSA`.

## Task 4: Conferência, consolidação e registros navegáveis

**Files:** Create `app/src/services/consolidation.js`, `app/src/ui/conference-page.js`, `app/src/ui/table-state.js`, `tests/unit/consolidation.test.js`, `tests/unit/table-state.test.js`, `tests/rules/consolidation.test.js`; modify produção/histórico/relatórios/main/acesso/rotas/regras e builder.

**Interfaces:** `createConsolidationService({repo,actor,projection,clock,idFactory}) -> {preview(selection),create({selection,expectedFingerprint,note}),list(query)}`; snapshot `consolidations`/`consolidationRevisions` explicita referências e cobertura. `tableState({rows,search,page,pageSize,sort}) -> {items,total,page,pages}`; busca local não modifica projeção de KPI. Conferência chama confirmações/inspeções/decisões existentes, não um novo campo universal aprovado.

- [ ] Testar busca local reduz tabela, mas não KPI do período; filtro aplicado altera ambos; mudança de filtro volta à página1; ordenação estável; duas consolidações concorrentes/revisão de fonte detectam conflito. Correção após consolidação deixa snapshot preservado e indica desatualização; visualizador não consolida; autoaprovação de correção segue negada. Contexto MARK aparece no detalhe/histórico correto.
- [ ] Rodar testes focalizados e emulador; esperar módulos ausentes.
- [ ] Implementar fila prática de conferência, links para serviço apropriado, prévia de consolidação e histórico. Padronizar busca/paginação/empty/error nas páginas sem refatorar código não relacionado. Preservar importação/backups/perfil/configuração e aliases.
- [ ] Rodar testes e percurso apontamento → conferência → inspeção → consolidação → correção → revisão; atualizar exemplos consultáveis sem apagar snapshots anteriores.
- [ ] Commit: `feat: consolida registros com revisao e contexto claros`.

## Task 5: QA da jornada completa e acabamento MSA

**Files:** Create `tests/browser/coherent-presentation.mjs`, `docs/ROTEIRO_APRESENTACAO_MSA.md`, `docs/ENTREGA_JORNADA_COESA_2026-10-08.md`; modify apenas componentes afetados após achado comprovado, `app/styles.css` quando necessário e handoff de continuidade. Evidências em `docs/evidencias/jornada-coesa/`, sem segredos/backup privado.

**Interfaces:** Roteiro consome cliente Firebase publicado, seleção/manifesto e exportadores dos planos. QA em fixture fica explicitamente separado da prova em sessões reais. A automação de navegador usa a ferramenta aprovada no ambiente; aqui, CUA. Não substituir por controle via shell/Playwright fora da API permitida.

- [ ] Definir checks antes dos ajustes: identificar produção sem digitar OP/lote repetidos; coleta válida → gráficos/CSV; produção → primeira passagem/perdas → KPI; falha/reparo → MTBF/MTTR; lotes → disposição; equipe → passagem → recebimento distinto; pendência → atendimento → normalização → conclusão; CEP/Engenharia/TV → retorno. Nenhum destino leva a mapa/chat. Relógios, rascunho e reconexão do Review Focus incluídos.
- [ ] Executar roteiro para registrar falhas concretas; não introduzir teste cosmético espelhando HTML. Rodar unidade/emulador/estático e preservar a baseline dos cenários existentes.
- [ ] Corrigir apenas achados; padronizar títulos/unidades/ajuda/ações primárias, densidade de menu, foco/teclado e estados. Confirmar as cinco dimensões da spec; KPI do roteiro preparados são numéricos com memória verificável, e estados fora do roteiro continuam honestos.
- [ ] Reexecutar checks afetados e gate final do índice: baixar/abrir arquivos, comparar dados de duas sessões Firebase, preservar quatro perfis/17cenários/CEP/correções sem autoaprovação/históricos. Registrar contagem atual de testes, hashes do manifesto, publicação/regras efetivas, screenshots desktop/celular e limitações físicas. Não declarar conclusão se parte necessária só tem layout ou fixture.
- [ ] Commit de acabamento/evidências e entrega conforme fluxo autorizado: `test: comprova jornada MSA e exportacoes de apresentacao`. Relatar separadamente dados de exemplo, funções comprovadas, integração física pendente e publicação realmente executada.
