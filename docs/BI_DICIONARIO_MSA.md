# Dicionário BI MSA

Acesse **Relatórios**, aplique os filtros da consulta e use o botão do arquivo desejado. A prévia mostra até cinco coletas; a contagem informa o arquivo inteiro. Cada exportação usa o snapshot consultado, sem gravar eventos.

| Arquivo | Uma linha representa | Chave |
| --- | --- | --- |
| collections | Uma coleta larga, com todas as leituras registradas | id |
| production | Um evento de produção bruto ou bom, sem repetição por coleta | id |
| losses | Um evento de refugo, material ou retrabalho, com unidade preservada | id |
| stoppages | Uma parada e seus instantes registrados | id |
| indicators | Um escopo de Scrap no dia operacional e turno | scopeId |

`scopeId` é o array JSON ordenado de machineId, processId, productId, variant, order, lot, recipe, shift e operationalDate. OP, lote, receita, variante e unidade ausentes ficam vazios; não são preenchidos por suposição. O turno 3 de 00:30 pertence ao dia em que o turno começou, em America/Sao_Paulo.

`Scrap = 100 × rejectedPieces / grossPieces`. Apenas perdas `kind=reject` e `unit=pieces` entram no numerador. Material em kg, segregação, retrabalho e peças boas não entram. O bruto deve estar confirmado nos segmentos da projeção de produtividade, com fechamento do ledger e referências consistentes. Eventos de produção permanecem no CSV mesmo sem confirmação; `confirmed` informa essa condição.

A taxa é **não aditiva**: repete-se nas coletas do mesmo scopeId. Para consolidar, use uma linha por scopeId em indicators e recalcule a partir das bases; nunca some ou tire a média simples das taxas de collections. Production não multiplica o bruto pelo número de coletas.

Estados: `complete` permite a taxa; `incomplete-coverage`, `time-required`, `revision-conflict`, `production-required`, `confirmation-required`, `zero-denominator` e `inconsistent-quantities` mantêm a taxa vazia. Zero de refugo só aparece com consulta completa. Cobertura representa leitura completa das fontes e alocação temporal válida, não comprovação de integração física. Uma quantidade atravessando turnos sem alocação não é rateada.

`originalRecord` preserva o registro fonte e `effectiveRecord` explicita a revisão usada. `originalId`, `correctionId`, `revisionConflict`, `originalQuantity` e `originalAmount` permitem conciliar revisões. Nas coletas, cada ID de parâmetro abre colunas `.value`, `.originalValue`, `.raw`, `.unit`, `.versionId` e `.status`. Unidades vêm da versão do parâmetro; material e espessura só vêm de `recipeVersions[recipe].settings.material/thickness`, e todas as configurações da receita também ficam em `recipeSettings`. `origin`, `source`, autor e instantes mantêm a proveniência dos exemplos e importações.

UTF-8 com BOM, ponto e vírgula, CRLF e vírgula decimal. Valores numéricos negativos e zero permanecem numéricos; proteção de fórmula aplica-se apenas a textos. Instantes são milissegundos Unix, preservados sem inventar horários para registros de precisão somente data. Objetos de auditoria usam JSON em célula entre aspas quando necessário.

O carregador atual esgota páginas até seu limite explícito; consultas incompletas são recusadas sem exportar subconjunto silencioso. O exportador também recusa arquivo acima de 50 milhões de caracteres. Reduza o período quando necessário. CSV legado e importação permanecem disponíveis; o BI é um formato separado. A API `exportBi` também aceita `kind=all` e retorna cinco arquivos, manifesto de contagens e diagnósticos.
