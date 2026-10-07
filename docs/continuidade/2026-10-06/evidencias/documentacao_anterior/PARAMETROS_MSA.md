# Parametros MSA Para O Dashboard

05/10/2026. Conferencia da lista da equipe com a aba Selo da planilha recebida e `entrega/auditoria_41_parametros.csv`. As referencias tem 41 nomes, unidades e pares de limites coincidentes com a auditoria: 20 parametros gerais + 21 zonas de aquecimento. O documento original e as medicoes continuam locais e inalterados.

## Parecer

Incluir os 41 no dashboard e adequado ao desafio. Sao parametros de processo, nao necessariamente indicadores de desempenho ou caracteristicas de qualidade; producao, paradas, refugos/perdas e fila da Engenharia tambem permanecem na base do painel. Nao calcular uma media das 21 zonas, pois sao pontos e faixas diferentes. O conjunto fornecido e um piloto de um processo, nao prova de que toda maquina da empresa usa estes parametros.

17 faixas bilaterais gerais estao aritmeticamente coerentes e foram preservadas como rascunho. Pressao Ar possui regra unilateral proposta >=6.5 bar, tambem em rascunho. Os demais 23 casos usam regra pending:

- Tempo Contra molde: LI 80 e LS 75, preservados como origem. Nao inverter para 75/80 sem confirmacao.
- Vacuo: -600 mm/Hg permanece na origem. Confirmar <= -600 ou >= -600 e a convencao de sinal antes de configurar a desigualdade.
- Aquecimento Z1-Z21: preservar cada zona e sua faixa de origem; confirmar medido/setpoint, aplicabilidade por receita e fase do processo antes de aprovar. Z1, Z9, Z10 e Z18 possuem 0/0, que nao significa automaticamente zona desligada ou leitura conforme.

Pressao Ar permanece em bar conforme a lista/planilha; a foto do instrumento sugere outra unidade e nao justifica conversao automatica. Confirmar unidade e eventual limite superior. Todas as versoes iniciais, incluindo as faixas coerentes, sao draft ate uma nova versao explicitamente aprovada pela Engenharia.

## O Que Foi Acrescentado

- `app/src/catalog/msa-parameters.js`: catalogo independente de banco/rede, com origem, limites, pendencias e perguntas.
- `catalog.preview`: exibe o que sera cadastrado e os conflitos, sem escrever.
- `catalog.install`: admin confirma um processo existente e informa a natureza de todos os parametros; instala parametros/versoes rascunho sem criar identidades industriais ficticias.
- IDs por processo/origem evitam duplicacao na repeticao. Mudanca de natureza conflitante, parametro inativo ou codigo manual preexistente exige revisao, nao sobrescrita.
- `getDashboard` e `buildDashboard`: reunem totais, series, alertas, Pareto e linhas para todos os parametros, inclusive sem dados, mais cadastros customizados ativos.
- Leitura mais recente com unidade, limite, data e contexto reais; estatisticas por receita/contexto/versao. Sem horario suficiente, a ordem fica ambigua em vez de inventada.

Nao foi executada instalacao na nuvem. Os testes usaram registros sinteticos em memoria e emuladores. Nao ha frontend nesta alteracao: a proxima etapa e desenhar a pagina inicial de dashboard sobre esta API.

## Exemplo De Integracao

```js
const preview=await msa.catalog.preview({processId});
// A futura tela deve solicitar measurement/setpoint para cada codigo.
// Nao preencher essa classificacao a partir do nome sem confirmacao.
const result=await msa.catalog.install({processId,natureByCode,confirmed:true});
const dashboard=await msa.getDashboard({
  fromDate:'2026-10-05',toDate:'2026-10-05',
  context:{machineId,processId,productId}
},{from:Date.parse('2026-10-05T00:00:00-03:00'),to:Date.parse('2026-10-06T00:00:00-03:00')});
```

Os exemplos pressupõem sessao autorizada e campos coletados pela interface. Rascunho nao recebe cor verde de conformidade. Cp/Cpk nao aprovado, amostra insuficiente, dispersao zero ou faixa inadequada permanece indisponivel; homologated=false.

## Verificacao

41 testes unitarios e 16 de emulador, zero skips. Novos casos exercitam instalacao repetida/concorrente, permissao, confirmacao, natureza explicita, faixas decimais, limites pendentes, ausencia de leituras, unidades/receitas/versoes separadas, empate de horario, recorte intradia parcial e correcoes aprovadas. Comparacao independente dos 41 campos de origem com o CSV da auditoria: nenhuma divergencia.

Nao houve envio ao GitHub, provisionamento real ou publicacao de regras. O repositorio remoto indicado pelo usuario sera `https://github.com/kauanoIiveira/msa`; aguardar autorizacao para push.
