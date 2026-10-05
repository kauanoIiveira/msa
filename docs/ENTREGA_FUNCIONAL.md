# Entrega Funcional MSA

05/10/2026. Execucao direta, sem subagentes. Funcoes implementadas e verificadas; interface visual e configuracao remota pendentes. Branch: codex/msa-funcoes.

## Escopo Entregue

- Cadastro/inativacao de maquinas, processos, produtos, parametros, motivos e metas, com referencias validadas.
- Versoes imutaveis de unidade/limites; regras bilaterais, unilaterais e pendentes.
- Coleta preservando valor original, ausencias e entradas invalidas; contexto, autoria e origem.
- Producao bruta/boa declarada, periodos; perdas/refugos/retrabalho com unidade e motivo.
- Abertura/encerramento unico de parada; uniao de intervalos por maquina sem duplicar duracao.
- Fluxo humano da Engenharia e correcoes com original preservado, autor, motivo e decisao.
- Historico paginado, listeners com cancelamento, indicadores, series para graficos, Pareto, alertas internos e comparacoes.
- CSV com previa/confirmacao, identidade deterministica e protecao de formulas na exportacao.
- Auth e-mail/senha, membros/papeis explicitamente provisionados e regras RTDB default deny.
- Adaptadores/fabricas para a futura interface estatica; workflow Pages manual, bloqueado ate existir interface aprovada.

## Evidencia De Verificacao

| Verificacao | Resultado |
| --- | --- |
| npm run test:unit | 30 testes passaram, zero skips |
| npm run test:emulator | 15 testes passaram, zero skips |
| Navegador headless | Funcoes e imports Firebase carregaram na raiz e em /msa-test/ |
| verify:static | 26 arquivos, nenhum import local ausente ou artefato industrial |
| verify:static --deploy | Bloqueio esperado: index-not-yet-implemented |

Os testes incluem BF (17 valores, Cp 0.33864810597807815 e Cpk 0.2788866755113583), dispersao zero, leitura invalida/ausente, autor forjado, papel indevido, auto-elevacao, isolamento de workspace, concorrencia em parada/parecer/importacao, revisao imutavel, login real no Auth Emulator, logout com cancelamento de listeners, datas impossiveis, recortes parciais e kg separado de pecas/retrabalho.

A revisao direta identificou e corrigiu falhas de overflow estatistico, parsing de numeros nativos pequenos, avaliacao de valor invalido como conforme, contagem de retrabalho em kg como descarte, igualdade de contexto dependente da ordem das chaves, calendario de metas, cursor fora do recorte e janela de indicador ausente. As regressoes falharam antes das respectivas correcoes e passaram depois. Validacao de datas vinculadas e integracao de revisao de coleta tambem foram exercitadas no emulador.

## Decisoes Tomadas E Custos

Registro completo das decisoes tomadas durante a execucao, na ordem em que ocorreram:

| Decisao | Motivo | Custo/limite |
| --- | --- | --- |
| Trabalhar no checkout existente, em branch propria | Execucao direta e preservacao das auditorias locais | Sem isolamento de filesystem por worktree |
| Usar PowerShell/Node no lugar dos helpers Bash | Ambiente Windows | Registro de progresso manual |
| Revisao propria nesta fase, sem subagente | Preferencia explicita do usuario | Sem revisao independente de contexto fresco |
| Limite de 100 processos por produto no cliente | RTDB nao oferece numChildren nas regras utilizadas; referencias verificadas uma a uma | Admin confiavel pode exceder a quantidade via SDK |
| Associacoes de processo/produto imutaveis | Evitar reinterpretacao do historico | Reassociacao exige identidade nova |
| Motivo de parada nao muda no fechamento | Preservar motivo original | Escolher motivo ao abrir; alteracao por correcao |
| Revisoes de leituras usam slots 0..99 no RTDB | Bloquear exclusao de entradas durante aprovacao | Leitura bruta precisa normalizeCorrection |
| Alternativas aprovadas conflitantes ficam sinalizadas | Evitar ultima revisao silenciosamente prevalecer | Resolucao de alternativas fica para outro fluxo |
| Paginas limitadas para buscar intervalos anteriores | Evitar raiz do banco e totais incompletos ocultos | Historicos grandes podem precisar ampliar cap/projecao; cruzamento de periodo nao rateia pecas |
| Meta producedPieces usa bruto explicitamente registrado | Nao inventar producao boa ou somar bases distintas | Meta indisponivel sem base bruta |
| CSV com date/parameter/raw e mapa explicito, uma coleta por linha | Nao adivinhar contexto industrial do Excel | Nao e importador XLSX direto; arquivo renomeado e outra origem |
| Acorn fixado para inspecionar imports JS | Evitar parser ad hoc na verificacao estatica | Dependencia somente de desenvolvimento |

Nenhum achado menor foi catalogado para adiamento. Revisao independente, testes remotos, design/layout e publicacao sao pendencias de escopo, nao alegacoes de conclusao.

## Nao Entregue / Nao Alegado

Nao ha index/interface visual, dashboard renderizado, cores de desvios, QR, OCR, coleta de equipamento, IA, fila offline duravel ou monitoramento com navegador fechado. Cp/Cpk permanecem demonstrativos e nao homologados. Uma decisao no sistema nao libera uma maquina.

Nenhum documento/foto/medicao original foi enviado ao RTDB. Nao houve push, PR, publicacao do site, provisionamento de usuario real ou deploy de regras remotas. Firebase web config esta integrada; a nuvem depende dos passos em [CONFIGURACAO.md](../firebase/CONFIGURACAO.md).

Contratos de uso: [CONTRATOS_FUNCIONAIS.md](CONTRATOS_FUNCIONAIS.md). Layout/design podem ser discutidos usando estes contratos sem reimplementar a logica.
