# Contratos Funcionais

## Atualização CEP e consulta em 06/10/2026

Estado e limitações: [Entrega CEP e pendências](ENTREGA_CEP_E_PENDENCIAS_MSA_2026-10-06.md).

- Queries de history/getIndicators/getDashboard aceitam `dataset: 'operational' | 'presentation' | 'all'`; operacional exclui operações `origin: demo`, incluindo análises/correções pelos registros originais vinculados. Sem `dataset`, mantém a consulta geral para compatibilidade.
- `history.loadPeriod()` inclui `coverage` por tipo de registro, além de `complete`, `excludedPresentationCount`, notas e registros efetivos. Cobertura de coletas e conflitos do grupo governam capacidade; indisponibilidade de produção não relacionada não decide o CEP.
- `analyzeCep(samples,{version,minSamples=25,sequenceConfirmed=true,complete=true,sourceUnit=null})` retorna I-MR fase I, dispersões dentro/global, sinais, contagens e Cp/Cpk/Pp/Ppk com requisitos explícitos. Amostras usam status/value e podem sinalizar `revisionConflict`. `complete` declara cobertura da série entregue, não aprovação industrial. `sourceUnit` impede referência em outra unidade sem conversão explícita. `normalityVerified` e `homologated` permanecem false.
- Estatísticas dos indicadores usam CEP para capacidade; a dispersão descritiva legada continua populacional ou pelo `sigmaMethod` solicitado. `capabilityReason` explica a indisponibilidade. `summarizeReadings()` permanece utilitário matemático para comparações e não decide aprovação.
- Séries efetivas preservam `originalId`, `correctionId`, `originalRaw` e `revisionConflict`; a identificação da revisão acompanha o relatório. `selectParameterStudy(dashboard,parameter)` seleciona contexto completo e versão da última leitura.
- `buildHourly(data,{date,now,target,microStopSeconds})` não rateia apontamentos entre horas, preserva ausência/zero, não fecha déficit da hora corrente e une microparadas por máquina. Conflitos são explicitados e não entram como valores resolvidos.

Os contratos anteriores abaixo permanecem aplicáveis salvo as atualizações explícitas acima. O workspace da interface corrente é `msa`; `demo` no exemplo seguinte serve para testes.

## Entrada Web

```html
<script src="./vendor/papaparse.min.js"></script>
<script type="module">
  import {createBrowserMsa} from './src/browser.js';
  const connection=createBrowserMsa();
  // A interface coleta credenciais; nao incluir senhas literais aqui.
  // await connection.auth.signIn(email, password);
  // const msa=await connection.session.onWorkspace('demo');
</script>
```

Nao usar caminhos iniciados por / na futura interface: Pages usa subdiretorio do repositorio. browser.js importa o SDK oficial pela CDN, fixado em 12.19.0. src/index.js exporta funcoes puras/fabricas sem inicializar rede.

Auth: signIn(email,password), signOut(), resetPassword(email), watchSession(callback,errorCallback). Session: onWorkspace(id), watchSession(callback), dispose(). callback da Session recebe {user,actor,workspaceId}. Actor vem do membro autenticado. Funcoes antigas sao revogadas por logout, troca de usuario/workspace, alteracao de papel ou dispose.

## Servicos

createMsaServices({repo,actor,papa,clock?,idFactory?}) integra os servicos para testes ou adaptadores. Em nuvem, usar a Session autenticada e manter as regras; fornecer actor manualmente nao concede permissao remota.

- registry.create(kind,payload), update(kind,id,patch), deactivate(kind,id), createParameterVersion(parameterId,payload).
- operations.recordCollection(payload), recordProduction(payload), recordLoss(payload), startStoppage(payload), closeStoppage(id,{endedAt,reasonId}).
- analysis.submitReview({collectionId,scope}), startReview(id), decideReview(id,{decision,justification}), requestCorrection({recordType,recordId,replacement,reason}), decideCorrection(id,{decision,justification}).
- history.list(kind,query), watch(kind,query,onNext,onError), loadPeriod(query).
- csv.previewImport(text,options), confirmImport(preview,{confirmed:true}), exportRecords(rows,columns).
- getIndicators(query,{from,to,sigmaMethod?}) retorna indicadores sobre revisoes aprovadas, mais notas de cobertura.
- catalog.preview({processId}), catalog.install({processId,natureByCode,confirmed:true}).
- getDashboard(query,{from,to,sigmaMethod?}) agrega os indicadores e todos os parametros de referencia/customizados do processo selecionado.

Metodos da Session retornam promessas, exceto history.watch, que retorna cancelamento sincronamente. Fabricas puras como createCsvService exportam CSV como string sincronamente. Erros MsaError possuem code e field opcional; sem HTML. Importacao pode parar apos gravar algumas linhas: repetir com o mesmo preview e seguro por idempotencia.

## Cadastros E Limites

kind: machines/processes/products/parameters/reasons/targets. Campos comuns: name e code opcional. Process: machineId. Product: processIds:{id:true}. Parameter: processId. Reason: kind stop/reject/material/rework. IDs sao gerados ou injetados em testes; nao contêm pontuacao proibida do RTDB.

update aceita somente name/code/active; associacoes nao mudam em uma identidade existente. A inativacao nao apaga historico. Mapa de processos por produto e limitado a 100 pelo cliente; cada referencia e validada nas regras, mas esse limite de quantidade nao e garantido pelo RTDB.

Versao: unit, nature measurement/setpoint, status draft/approved e rule. Rule: range com lower<upper; lower ou upper unilateral; pending sem valores. Pending exige draft. 80/75 e 0/0 nao sao consertados automaticamente. Vacuo usa sinal e desigualdade declarados. Toda versao e imutavel, inclusive draft; para revisao criar outra versao.

Target: name, metric producedPieces/stopMinutes/rejectedPieces/lossKg, unit pieces/minutes/kg correspondente, fromDate/toDate, context, operator lower/upper, threshold. producedPieces usa quantidade bruta explicitamente informada. Alertas de meta exigem conjunto completo e mesma janela configurada; sem base conhecida ficam indisponiveis.

## Registros

Context obrigatorio: machineId/processId/productId coerentes e ativos no novo apontamento. Opcionais: recipe, lot, order, shift. Turno nao e inferido do horario.

Envelope gerado: id, context, origin manual/import/demo, createdBy, createdAt de servidor, eventDate no fuso America/Sao_Paulo, timePrecision instant/date. Instant guarda occurredAt epoch em milissegundos; importacao date-only conserva ausencia de horario. Source opcional: file, sheet, row, cells. createdBy e quem digitou/importou, nao um operador industrial original inventado.

Collection recebe readings como array de {parameterId,versionId,raw}. Armazena mapa por parameterId com status valid/missing/invalid e value somente se valido. Aceita 0,8 e 0.8; vazio nao e zero; sinais sao conservados; agrupadores/unidades/textos ambiguos nao sao removidos.

Production: quantity inteira >=0, basis gross/good, startedAt e endedAt. Loss: kind reject/material/rework, amount positivo, unit pieces/kg e reasonId compativel. Pecas exigem inteiro; kg admite decimal. Nao subtrair kg de pecas nem deduzir pecas boas automaticamente.

Stoppage: startedAt, planned boolean e reasonId stop. close exige endedAt>startedAt e mesmo reasonId; mudar motivo exige correcao rastreavel. Fechamento unico com closedBy/closedAt. Parada aberta nao e duracao final.

## Engenharia E Revisoes

Review: waiting -> analyzing -> approved/rejected. scope explicita alcance; justificativa obrigatoria. Historico de transicoes imutavel. Decisao nao libera equipamento nem constitui homologacao de CEP.

Correcao tem proposta imutavel, motivo, autor e decisao terminal por outra pessoa da Engenharia/admin. Replacement conserva contexto, unidades, origem e identidade; quantidades/valores/periodos podem ser revisados com validacao. Original nunca e sobrescrito. No RTDB, leituras de replacement usam slots 0..99; normalizeCorrection() devolve mapa por parametro. Consultas de registros originais continuam retornando originais; history.loadPeriod().effective aplica uma unica revisao aprovada. Alternativas aprovadas conflitantes marcam resultado parcial, sem last-wins. Colecoes preservam leituras originais ao aplicar um overlay, mesmo que uma proposta legada seja parcial.

## Historico E Indicadores

query: fromDate/toDate ISO, context parcial opcional, limit (padrao 200, max 500), cursor {date,key}; loadPeriod aceita maxPages (padrao 20, max 100). Paginacao utiliza data/chave, preservando empates. complete sinaliza cobertura, nao qualidade industrial.

Production/stoppages precisam de inicios anteriores para encontrar intervalos que atravessam o recorte. loadPeriod faz essa busca em paginas limitadas; conjuntos truncados sao parciais. Nao ratear pecas de uma producao que cruza a janela. Tempo parado usa uniao por maquina; Pareto por motivo conserva aviso de sobreposicao. Ausencia de apontamento nao comprova perda zero.

buildIndicators retorna totals, series, statistics, reasonRanking, alerts, complete, notes. Exige janela positiva explicita em milissegundos. Separar unidades/denominadores; refugo% exige producao bruta compativel e cobertura completa. Retrabalho em kg fica em reworkKg, nao em lossKg. comparePeriods retorna periods e changes com difference/percentChange; base zero ou ausente nao produz percentual.

summarizeReadings exige sigmaMethod population/sample; nValid/nMissing/nInvalid, media, minimo/maximo, sigma e Cp/Cpk demonstrativos com homologated=false. N insuficiente, dispersao zero e faixa inadequada retornam null/motivo. Nao mistura versoes/contextos; nao implementa normalidade ou um n minimo universal de liberacao.

## Catalogo MSA E Dados Do Dashboard

getMsaParameterCatalog() devolve uma copia independente das 41 referencias, com code MSA_<coluna>, name, unit, group, source.column/name/unit/limits, draftRule, issues e questions. source conserva os limites originais: 80/75 e 0/0 nunca sao invertidos ou aprovados. As 21 zonas e o vacuo assinado usam draftRule pending; Pressao Ar usa lower 6.5 em bar como rascunho, com questao de unidade exposta.

catalog.preview nao grava. install e restrito a admin, requer confirmed=true e natureByCode com todos os 41 codigos classificados explicitamente como measurement/setpoint. IDs deterministas por processo tornam repeticao e concorrencia identica idempotentes. Instala parametros e versoes draft; nao cria maquinas/produtos, leituras nem aprovacao da Engenharia. Conflitos com cadastro manual/codigo duplicado ou natureza divergente retornam CATALOG_CONFLICT. Validacoes ocorrem antes da primeira escrita; queda de rede pode deixar instalacao parcial, retomavel com o mesmo pedido. Nao altera versoes novas ja aprovadas.

getDashboard exige query.context com machineId/processId/productId e query.fromDate/toDate correspondentes as datas de range.from/to (fim exclusivo, America/Sao_Paulo). Opcionais recipe/lot/order/shift continuam filtros explicitos. A funcao pura buildDashboard(data,{context,from,to,complete,sigmaMethod?}) aplica o recorte e devolve os campos de buildIndicators mais context e parameters. As 41 referencias continuam visiveis mesmo sem cadastro/leituras; parametros customizados ativos tambem aparecem.

Cada linha de parameters tem parameterIds, configurationState, state, latest ou null, observationCount e statistics. Estados incluem not-configured, no-version, no-data, within, outside, missing, invalid, pending, latest-time-ambiguous, revision-conflict e duplicate-parameter-code. latest conserva valor/raw, unidade/natureza/regra da versao realmente coletada, data/precisao e contexto. Data-only com empate no mesmo dia nao produz uma ultima leitura ficticia; recorte intradia com data-only fica explicitamente parcial. statistics continua separado por contexto completo e versao, com unidade explicita; Cp/Cpk de versao nao aprovada ficam null nas linhas e no resumo geral. Os totais podem ser parciais conforme complete/notes; uma ultima leitura conforme nao certifica todo o periodo.

Esta API entrega dados e estados, nao uma pagina ou layout. O dashboard visual como pagina inicial sera a proxima etapa.

## CSV

Formato inicial de importacao: delimitador ;, cabecalhos date;parameter;raw e unit opcional. date e YYYY-MM-DD. parameterMap associa nome do CSV a {parameterId,versionId,unit?}; context deve ser fornecido explicitamente, sem adivinhacao do XLSX.

previewImport retorna records/errors/warnings/fingerprint, sem escrita. Confirmar somente sem erros, com confirmed=true e fingerprint inalterado. Nomes de arquivos, linha e contexto determinam IDs SHA-256; repeticao identica nao duplica; payload diferente para a mesma identidade gera IMPORT_CONFLICT. Arquivos renomeados nao sao reconhecidos automaticamente como mesma origem. Fingerprint e integridade do preview, nao uma fronteira de autorizacao.

exportRecords aceita columns como nomes/caminhos (ex.: context.machineId) ou {key,label}. UTF-8 BOM, ;, aspas/quebras pelo Papa Parse e neutralizacao de formulas em texto. Numeros negativos tipados permanecem numericos; raw textual -600 pode ganhar prefixo de seguranca, preservando a coluna value numerica.
