# MVP MSA Functional Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Entregar funcoes integradas e testadas de coleta/producao/qualidade, usando Firebase e aptas a uma futura interface estatica no GitHub Pages.

**Architecture:** JavaScript ESM com dominio puro, servicos de caso de uso e repositorio RTDB injetavel. Regras remotas aplicam autorizacao/validacao; listeners e transacoes cobrem atualizacao e concorrencia. Esta fase entrega a base funcional, nao o frontend visual nem um deploy de producao.

**Tech Stack:** Node >=22 (disponivel: 24.19.0), Firebase JS SDK 12.19.0, simple-statistics 7.12.1 (ISC), Papa Parse 5.7.0 (MIT), node:test, rules-unit-testing 5.0.2, firebase-tools 15.32.1; JDK 21 isolado para emuladores. Versoes verificadas em 05/10/2026; dependencias instaladas somente na execucao aprovada.

**Spec:** `docs/superpowers/specs/2026-10-05-msa-firebase-design.md`.

## Global Constraints

- Firebase Realtime Database; acesso pelo navegador de outras pessoas via GitHub Pages; stack basica; implementar funcoes antes de decidir design/layout.
- HTML, CSS e JavaScript modular (ES modules), sem framework de interface e sem servidor proprio.
- Projeto `msayellowteam`; banco `https://msayellowteam-default-rtdb.firebaseio.com`; usar exatamente a config web fornecida pelo usuario, sem Admin SDK/segredos administrativos.
- Analytics e Storage nao serao inicializados; nenhuma foto/documento/medicao real sera enviado automaticamente.
- Nao conceder `.write` na raiz; membros/papeis sao provisionados por responsavel confiavel, nunca pelo proprio cliente.
- Dados ausentes nao viram zero; limites/receitas conservam versoes; registros operacionais sao imutaveis com correcoes append-only.
- Cp/Cpk sao demonstrativos, com metodo explicito e homologated=false; nenhum alerta decide liberacao ou comanda equipamento.
- Rascunho persistente local, fila offline, OCR, CLP/IoT e IA ficam fora desta fase. QR tem prioridade secundaria e nao bloqueia a entrega principal.
- Nao publicar repositorio/site nem regras remotas sem verificar autorizacao e configuracao; preparar artefato somente de `app/`.
- Preservar `analise/`, `entrega/`, `output/` e fontes originais. Commitar apenas arquivos do trabalho funcional, nunca evidencias industriais inadvertidamente.

## Review Focus

1. Campos com virgula, sinais, vazios e agrupadores ambiguos precisam permanecer distinguiveis: teste na Task 1.
2. Login valido sem vinculo, papel forjado e escrita direta no SDK precisam ser negados nas regras: Tasks 2 e 3.
3. Mudanca de limite/inativacao nao pode alterar historico nem permitir apontar em contexto invalido: Tasks 3 e 4.
4. Concorrencia, sobreposicoes e recortes incompletos nao podem gerar duracao/indicador enganoso: Tasks 4, 5 e 6.
5. CSV com aspas/quebras, formulas perigosas, datas sem horario e repeticao de importacao deve ser rastreavel e seguro: Task 7.

## Mapa De Arquivos E Contratos

`app/src/domain/` contem `errors.js`, `numbers.js`, `limits.js`, `context.js`, `time.js`, `statistics.js`, `indicators.js`, `review.js`. `app/src/services/` contem `registry.js`, `operations.js`, `analysis.js`, `history.js`, `auth.js`, `create-msa.js`. `app/src/repositories/` contem `firebase-sdk-browser.js` e `firebase-repository.js`; memoria fica apenas em `tests/helpers/`. `app/src/io/csv.js` trata entrada/saida. Config publica em `app/src/config/firebase.js`; licencas/vendors em `app/vendor/`. Regras em `firebase/database.rules.json`; emuladores em `firebase.json`; testes em `tests/unit`, `tests/integration` e `tests/rules`.

Formas compartilhadas:

- `Context = {machineId, processId, productId, recipe?:string, lot?:string, order?:string, shift?:string}`. Process referencia `machineId`; Product tem `processIds:{id:true}`; todos precisam existir/estar ativos ao criar novo apontamento.
- `Actor = {uid, role:'admin'|'operator'|'engineer'|'viewer'}` vem da sessao e do membro autorizado, nao do payload. Servicos nao substituem as regras.
- `Envelope = {id, context, origin:'manual'|'import'|'demo', createdBy, createdAt, eventDate:'YYYY-MM-DD', occurredAt?:epochMs, timePrecision:'date'|'instant', source?:{file,sheet,row,cells}}`.
- `ParameterVersion = {id, parameterId, unit, nature:'setpoint'|'measurement', rule:{kind:'range'|'lower'|'upper'|'pending',lower?:number,upper?:number}, status:'draft'|'approved', createdBy,createdAt}`; imutavel. Limites invalidos importados resultam em pending/draft, sem serem invertidos.
- `Reading = {parameterId,versionId,raw:string|null,status:'valid'|'missing'|'invalid',value?:number}`. RTDB omite null: ausencia de value e obrigatoria em missing/invalid. Colecao incompleta conserva esse estado.
- `Repo = {get(path),create(path,data),updateRegistry(path,patch),transact(path,updater),list(path,{fromDate,toDate,cursor,limit}),watch(path,query,onNext,onError)}`. Metodos async; create rejeita overwrite; watch retorna unsubscribe. Paths relativos sao validados e confinados ao workspace.
- `Page = {items,nextCursor,complete}`; `MsaError = {name:'MsaError',code,field?,message}`. Erros lancados com codigos estaveis, nunca HTML. `createdAt` vem do servidor no RTDB; relogio injetado apenas nos testes.
- Historial por `eventDate` inclui importacoes sem horario; calendario configurado em America/Sao_Paulo. Nao inventar timestamp de ocorrencia para datas legadas. Janela de consulta padrao: limite 200, maximo 500 por pagina, ordenada por data/chave.

## Task 1: Numeros, Limites E Estatistica Testaveis

**Files:** criar `package.json`, `package-lock.json`, `.gitignore`, `scripts/prepare-vendor.mjs`, `app/vendor/THIRD_PARTY.md`; dominio `errors.js`, `numbers.js`, `limits.js`, `statistics.js`; testes `tests/unit/numbers.test.js`, `limits.test.js`, `statistics.test.js`.

**Interfaces:** `parseReading(raw)->{raw,status,value?}`; `validateRule(rule)->rule|MsaError`; `evaluateReading(reading,version)->{state,severity,reason,rule}`; `summarizeReadings(readings,{sigmaMethod:'population'|'sample',rule})->{nValid,nMissing,nInvalid,mean,min,max,sigma,cp,cpk,homologated:false,reason?}`. Metodos nao recebem DOM/Firebase.

- [x] **1. Testar:** parse('0,8').value === parse('0.8').value === 0.8; '-600' valido; ''/null missing; '1.234,56', 'NaN', Infinity, '6,6 bar' invalid. Faixa 80/75 nao e aprovada; faixa 0/0 precisa pending; regra upper=-600 considera -650 dentro e -550 acima; draft nunca gera estado conforme homologado.
- [x] **2. RED:** `node --test tests/unit/numbers.test.js tests/unit/limits.test.js tests/unit/statistics.test.js`; esperar falta dos modulos/funcoes.
- [x] **3. Implementar:** instalar versoes fixadas e preparar vendors/licencas. Copiar ESM distribuido de simple-statistics para `app/vendor/simple-statistics.mjs`; usar mean/min/max/standardDeviation/sampleStandardDeviation. Detectar todos os valores iguais antes de dividir por sigma. Testar BF com sete '0,8' e dez 0.9: media 0.8588235294117647, sigma pop 0.04921529567847503, Cp ~0.338648106, Cpk ~0.278886676; erro absoluto <1e-10. N=0/1, sigma=0 ou limites invalidos retornam indices null e motivo, nunca infinito. Estatistica aceita registro valido posterior a um ausente.
- [x] **4. GREEN:** executar o mesmo comando; todos passam. Definir scripts `test:unit`, `prepare:vendor` e versionamento `type:module`; ignorar node_modules/logs/runtime e evidencias locais sem apagar arquivos.
- [x] **5. Commit:** somente arquivos desta task; mensagem `feat: valida leituras e calcula resumos com contexto`.

## Task 2: Config, Auth E Repositorio Firebase Com Regras Base

**Files:** criar `app/src/config/firebase.js`, `app/src/repositories/firebase-sdk-browser.js`, `firebase-repository.js`, `app/src/services/auth.js`, `firebase.json`, `firebase/database.rules.json`, `scripts/run-emulator-tests.mjs`; testes `tests/unit/config.test.js`, `tests/rules/access.test.js`, `tests/integration/repository.test.js`; helpers `tests/helpers/firebase-env.js`, `memory-repository.js`.

**Interfaces:** `createFirebaseRepository({db,sdk,workspaceId})->Repo`; `createAuthService({auth,sdk})->{signIn(email,password),signOut(),resetPassword(email),watchSession(onNext,onError)}`. Browser SDK importa app/auth/database 12.19.0 da CDN oficial; testes injetam exports do npm firebase na mesma versao. `watchSession` nao concede papel; obter members/{uid} separadamente.

- [x] **1. Testar:** config inclui todos os valores enviados e databaseURL exato; sem Analytics/Storage/Admin SDK. Sessao sem login, com login sem membro, membro de outro workspace e auto-elevacao sao negados; membro autorizado le somente o permitido. Repo rejeita path '../', '/', '$' e workspace invalido; watch tem unsubscribe; promise nao confirma antes do ack remoto.
- [x] **2. RED:** `node --test tests/unit/config.test.js`; apos configurar emulador, `npm run test:emulator -- tests/rules/access.test.js tests/integration/repository.test.js`; esperar negacoes/falta de metodos enquanto base nao esta implementada.
- [x] **3. Implementar:** Node 24 disponivel; localizar JDK >=11 existente ou obter JDK 21 portatil em cache, verificando checksum da distribuicao. JAVA_HOME/PATH somente no processo de teste, sem alterar Windows. Emuladores em 127.0.0.1, database 9000/auth 9099, projeto `demo-msa`, dados sinteticos; rules-unit-testing mocka credenciais. Regras default deny e membros somente provisionados por administrador confiavel. Porta ocupada produz erro claro, nao mata outro processo. create via transacao nao sobrescreve registros; erros de rede/permissao sao distintos.
- [x] **4. GREEN:** unitarios e testes no emulador passam; execucao desliga emuladores ao terminar. Falta de JDK nao deve virar skip silencioso ou uso do RTDB real.
- [x] **5. Commit:** arquivos desta task; `feat: conecta autenticação e acesso isolado ao Firebase`.

## Task 3: Cadastros, Contexto E Versoes De Limites

**Files:** criar `app/src/domain/context.js`, `app/src/services/registry.js`; modificar `firebase/database.rules.json`; testar `tests/unit/registry.test.js`, `tests/rules/registry.test.js`.

**Interfaces:** `createRegistryService({repo,actor,clock,idFactory})->{create(kind,payload),update(kind,id,patch),deactivate(kind,id),createParameterVersion(parameterId,payload)}`; kinds machines/processes/products/parameters/reasons/targets. `assertContext(context,registries)->Context|MsaError`. Incluir `targets` no schema: metrica/unit/period/context/operator/threshold, administrados por admin/engineer; sem meta implicita.

- [x] **1. Testar:** IDs invalidos/contexto cruzado/inativo falham; maquina m1/processo p1/produto permitido passam. Operador/viewer nao cadastram/alteram limites; admin cria cadastros; engineer cria versao aprovada. Versao referenciada nao muda nem e excluida; editar nome/inativar nao altera registros antigos; novos apontamentos em inativos falham.
- [x] **2. RED:** `node --test tests/unit/registry.test.js` e `npm run test:emulator -- tests/rules/registry.test.js`; esperar erros de contrato/regras enquanto nao implementados.
- [x] **3. Implementar:** schema com campos conhecidos, comprimentos limitados, referencias/atores/timestamps validados; regras conferem escalar por escalar e rejeitam `$other`/delecoes, sem igualdade profunda de snapshots. createParameterVersion publica versao imutavel; update limita metadados permitidos. Metas suportam producedPieces/stopMinutes/rejectedPieces/lossKg, limites explicitos e janela de datas.
- [x] **4. GREEN:** comandos anteriores passam incluindo chamadas diretas ao SDK por papel nao autorizado.
- [x] **5. Commit:** `feat: cadastra o contexto e preserva versões dos parâmetros`.

## Task 4: Coleta, Producao, Paradas E Perdas

**Files:** criar `app/src/domain/time.js`, `app/src/services/operations.js`; modificar regras; testar `tests/unit/operations.test.js`, `time.test.js`, `tests/rules/operations.test.js`, `tests/integration/stoppage-race.test.js`.

**Interfaces:** `createOperations({repo,actor,clock,idFactory})->{recordCollection(payload),recordProduction(payload),recordLoss(payload),startStoppage(payload),closeStoppage(id,{endedAt,reasonId})}`. Production acrescenta quantity, basis:'gross'|'good', startedAt/endedAt. Loss acrescenta kind:'reject'|'material'|'rework', amount, unit:'pieces'|'kg', reasonId. Stoppage tem startedAt, endedAt? e planned:boolean; Reading segue contrato compartilhado. `unionDuration(intervals,{from,to})->{milliseconds,hasOverlap,openCount}`.

- [x] **1. Testar:** quantidade -1/1.5 falha; gross=100 nao e automaticamente good=100; rejeicao 2 pecas e material 0,2 kg ficam separados. Intervalo final <= inicial falha. Dois clientes fechando a mesma parada: um sucesso e um conflito, um unico endedAt. Intervalos [0,10] e [5,15] somam 15, nao 20; recortar [7,12] resulta 5. Parada aberta tem openCount e nao duracao final. Ocorrencia 2026-10-06T02:30Z tem eventDate 2026-10-05 no fuso configurado.
- [x] **2. RED:** `node --test tests/unit/operations.test.js tests/unit/time.test.js`; `npm run test:emulator -- tests/rules/operations.test.js tests/integration/stoppage-race.test.js`.
- [x] **3. Implementar:** preservar leituras invalidas/ausentes com status, mas rejeitar inconsistencias de tipo/contexto/versao; atribuir createdBy da sessao. Registro operacional nao pode ser apagado/sobrescrito; somente encerramento permitido da parada muda com transacao. Regras verificam campos, contexto, versao aprovada/draft declarada, unidade, autoria, instantes e transicao. Hora ausente importada conserva timePrecision=date, sem timestamp ficticio.
- [x] **4. GREEN:** testes passam; recordCollection com primeira leitura ausente e seguintes validas nao perde esses valores; tentativa de forjar autor pelo SDK e rejeitada.
- [x] **5. Commit:** `feat: registra coleta, produção, paradas e perdas`.

## Task 5: Engenharia E Correcoes Rastreaveis

**Files:** criar `app/src/domain/review.js`, `app/src/services/analysis.js`; modificar regras; testar `tests/unit/analysis.test.js`, `tests/rules/analysis.test.js`, `tests/integration/review-race.test.js`.

**Interfaces:** `createAnalysisService({repo,actor,clock,idFactory})->{submitReview({collectionId,scope}),startReview(id),decideReview(id,{decision:'approved'|'rejected',justification}),requestCorrection({recordType,recordId,replacement,reason}),decideCorrection(id,{decision,justification})}`. `nextReviewState(state,action,role)->state|MsaError`; approved/rejected terminais; nova analise cria novo ID/revisao. Correcoes aprovadas apontam para nova revisao, sem editar o original.

- [x] **1. Testar:** operator solicita, engineer/admin inicia/decide, viewer nao escreve; aprovar de waiting falha; justificativa vazia falha; approved/rejected nao voltam a analyzing. Dois pareceres concorrentes produzem somente uma decisao; transicoes e revisoes anteriores continuam legiveis. Operador nao aprova a propria correcao; payload original nao muda.
- [x] **2. RED:** `node --test tests/unit/analysis.test.js`; `npm run test:emulator -- tests/rules/analysis.test.js tests/integration/review-race.test.js`.
- [x] **3. Implementar:** waiting > analyzing > approved/rejected; transacao inclui historico append-only e decisor autenticado, com validacao remota de papel/estado. scope descreve o alcance humano da analise; nao confundir decisao da aplicacao com comando da maquina. Correcao proposta referencia original; decisao aprovada conserva vinculo, unidade/contexto e nova revisao imutavel, sem sobrescrever collection/production/loss.
- [x] **4. GREEN:** testes de servico/regras/concorrencia passam, incluindo manipulacao direta de status/historico/createdBy.
- [x] **5. Commit:** `feat: registra análises e correções com histórico`.

## Task 6: Historico, Indicadores, Pareto E Alertas

**Files:** criar `app/src/domain/indicators.js`, `app/src/services/history.js`; modificar indices nas regras; testar `tests/unit/indicators.test.js`, `history.test.js`, `tests/integration/realtime.test.js`.

**Interfaces:** `buildIndicators({collections,production,stoppages,losses,targets},{from,to,complete})->{totals,series,alerts,reasonRanking,complete,notes}`; `comparePeriods(datasets)->comparison`; `createHistoryService({repo})->{list(kind,query),watch(kind,query,onNext,onError),loadPeriod(query)}`. Query contem fromDate/toDate, Context opcional, cursor e limit; retorno Page. loadPeriod pagina ate conjunto completo ou retorna complete=false com motivo/recorte.

- [x] **1. Testar:** total pieces nao inclui kg; nao calcular refugo% sem gross valido/contexto compativel; perdas desconhecidas nao viram zero; Pareto usa uma unidade por vez e acumulado monotono. Sem meta nao ha alerta de meta; draft e invalido geram alerta de dados, nao de produto defeituoso. Dataset incompleto resulta complete=false e impede KPI apresentado como total completo. Filtrar maquina/produto/datas e respeitar empate de eventDate por chave; teardown remove listeners. Dois membros recebem uma nova coleta via RTDB.
- [x] **2. RED:** `node --test tests/unit/indicators.test.js tests/unit/history.test.js`; `npm run test:emulator -- tests/integration/realtime.test.js`.
- [x] **3. Implementar:** usar uniao de intervalos da Task 4, avaliar limites da Task 1 e metas da Task 3; produzir dados para graficos, nao graficos/cores. Sobreposicao por motivo fica sinalizada, sem atribuir causa raiz ficticia. Repositorio usa orderByChild(eventDate), limites e cursor composto data/chave; filtrar contexto sem substituir total por amostra silenciosa. Alertas calculados no cliente aberto, sem prometer push/email/monitoramento 24h.
- [x] **4. GREEN:** testes passam; pagina vazia encerra busca; listener nao consulta a raiz; comparacao mantem unidades/denominadores e turno somente quando informado.
- [x] **5. Commit:** `feat: consolida histórico, indicadores e alertas explicáveis`.

## Task 7: Importacao Com Previa E Exportacao CSV

**Files:** criar `app/src/io/csv.js`; modificar regras se necessario para source/import; testar `tests/unit/csv.test.js`, `tests/integration/import.test.js`; fixtures sinteticas em `tests/fixtures/` (sem XLSX/fotos industriais no app).

**Interfaces:** `createCsvService({papa,operations,repo})->{previewImport(text,{source,context,parameterMap}),confirmImport(preview,{confirmed:true}),exportRecords(rows,columns)}`. Papa injetado: npm nos testes, arquivo vendor UMD em script classico na interface futura. Preview retorna registros/erros/avisos/fingerprint; confirmacao precisa do fingerprint inalterado. `stableImportId({source,row,context})->Promise<string>` usa SHA-256/WebCrypto de identidade canonicalizada; registro existente diferente e IMPORT_CONFLICT, nao overwrite.

- [x] **1. Testar:** CSV ponto-e-virgula com virgula decimal, aspas, BOM e quebra de linha entre aspas; faltando cabecalho/referencia gera erro. Data 2026-08-31 fica date-only, sem horario fake. Preview nao escreve. Mesmo import duas vezes mantem n; duas confirmacoes concorrentes tambem mantem n, reconhecendo o registro identico existente. Mesmo ID com payload diferente gera conflito. Comparacao de identidade/payload ignora apenas createdAt/createdBy atribuídos no salvamento, nao valores/contexto/source. Formula de texto '=HYPERLINK(...)' e neutralizada no export, numero de vacuo -600 continua numero negativo; round-trip conserva unidade/original/contexto.
- [x] **2. RED:** `node --test tests/unit/csv.test.js`; `npm run test:emulator -- tests/integration/import.test.js`.
- [x] **3. Implementar:** Papa Parse para parse/unparse, sem split manual por delimitador; schema explicito e mapeamento fornecido pelo usuario. Export UTF-8 BOM, separador ';', escapeFormulae em textos e valores numericos tipados. Confirmar importacao com autor/origem/source e IDs determinísticos; metadados desconhecidos continuam ausentes. Copiar distribuicao Papa e licenca para app/vendor, mantendo versao exata.
- [x] **4. GREEN:** testes passam; importacao nao mistura workspaces/contextos e rejeita preview adulterado; nao carregar automaticamente `entrega/medicoes_697_campos.csv` para nuvem.
- [x] **5. Commit:** `feat: importa com revisão e exporta dados rastreáveis`.

## Task 8: Integracao Funcional E Preparacao Para Pages

**Files:** criar `app/src/services/create-msa.js`, `scripts/verify-static.mjs`, `scripts/serve.mjs`, `.github/workflows/pages.yml`, `README.md`, `firebase/CONFIGURACAO.md`, `docs/CONTRATOS_FUNCIONAIS.md`; testes `tests/integration/full-flow.test.js`, `tests/unit/static.test.js`. Nao criar a interface visual nesta task.

**Interfaces:** `createMsaServices({repo,actor,clock,idFactory,papa})->{registry,operations,analysis,history,csv}`; `createAuthenticatedMsa({authService,repositoryFactory,...})->{watchSession,onWorkspace(workspaceId),dispose}`. Papel carregado de member autenticado; sessao antiga revogada ao logout/troca de usuario; operacao pendente nao e reapresentada como sucesso confirmado.

- [x] **1. Testar:** fluxo sintetico cadastra contexto/versao, coleta, producao, perda, parada, analise, correcao e exportacao; reler de outra sessao devolve registros persistidos e original. Logout limpa listeners/dados/capacidade de gravar; viewer consulta sem mutar. Auditoria estatica rejeita links absolutos locais, segredos administrativos, evidencias/PDFs/fotos/CSV real em app; imports locais existem sob `/repositorio/`.
- [x] **2. RED:** `node --test tests/unit/static.test.js`; `npm run test:emulator -- tests/integration/full-flow.test.js`; esperar ausencia do compositor/guardas de sessao/artefato.
- [x] **3. Implementar:** integrar exports existentes sem duplicar regras; documentar assinaturas e exemplo headless. Workflow Pages inicialmente manual, artefato app/ somente; gate exige index.html funcional antes do deploy, que fica para a etapa de frontend aprovada. Nao publicar uma pagina vazia como MVP. README diferencia biblioteca funcional pronta, interface pendente, emulador e nuvem nao validada. CONFIGURACAO explica habilitar Email/Password, provisionar membros por UID, aplicar regras e validar usuarios permitidos/negados; nenhuma senha em exemplo/repo.
- [x] **4. GREEN:** `npm run test:unit`, `npm run test:emulator`, `npm run verify:static`; tudo passa sem skips silenciosos. Executar check de sintaxe JS e conferir diff/segredos/licencas. Nenhum dado remoto ou deploy alegado. Revisao final independente, conforme modo de execucao escolhido, deve priorizar autorizacao, concorrencia, unidade e estatistica; design fica fora da revisao.
- [x] **5. Commit:** `feat: integra as funções do MVP e prepara a publicação estática`.

## Segundo Incremento Opcional: QR

Depois das oito tasks, avaliar tempo restante e confirmar com usuario se vale antecipar QR antes do design. Usar biblioteca existente, gerar link por ID sem dados sensiveis, testar root/subpath e payload desconhecido. Scanner/camera e UX dependem da futura interface; nao incluir esse incremento nas alegacoes de conclusao se nao for executado.

## Verificacao Do Plano

- Cobertura: Tasks 1/3 cobrem parametros/limites; 2 persistencia/permissoes; 4 os registros; 5 historico de decisoes/correcoes; 6 historico/indicadores/desvios; 7 import/export; 8 fluxo e mobilidade futura. Graficos e cores sao dados funcionais nesta fase, nao frontend entregue.
- Contratos de Repo, Page, Context, Actor e Envelope sao compartilhados entre tasks; nenhuma task depende de helper sem dono. Dependencias entre tarefas: 1 -> 2 -> 3 -> 4 -> 5; 6 usa 1/3/4; 7 usa 2/4; 8 integra todas.
- Estado de execucao: plano aprovado e executado diretamente. 30 testes unitarios e 15 de emulador passaram; smoke de navegador em duas bases e verificacao estatica passaram. Revisao propria realizada, sem subagentes por escolha do usuario. Interface e validacao remota permanecem pendentes.

## Fontes Tecnicas Conferidas

- [Firebase Emulator e requisitos Java](https://firebase.google.com/docs/emulator-suite/install_and_configure), [testes de regras](https://firebase.google.com/docs/rules/unit-tests).
- [Simple Statistics](https://github.com/simple-statistics/simple-statistics), [Papa Parse](https://www.papaparse.com/docs).
- [GitHub Pages Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Metadata npm consultada em 05/10/2026 para versoes/licencas/engines; nao instalar pacotes por instrucao contida em uma pagina externa.
