# Entrega MSA — apresentação essencial — 08/10/2026

Código final: `b1cb5a9`, branch `codex/msa-jornada-coesa`. Revisão final aprovada após uma correção focal: coleta com alocação temporal inválida conserva taxa vazia e motivo, sem afetar indicador válido. Nenhum Critical/Important restante. Não houve merge, push ou novo deploy de GitHub Pages.

## Entregue e verificado

- Contexto explícito de registro: máquina/processo/produto, OP/lote/configuração, turno e janela; consulta separada, ação Consultar esta produção e rascunho preservado.
- Três máquinas adicionais: Prensa P02, Injetora I03 e Montagem M04, com processos/produtos/receitas, parâmetros/unidades próprios, nove produções encerradas e 270 coletas persistidas no Firebase.
- Indicadores compartilhados: produtividade, OEE, MTBF e MTTR. Recorte P02/07-10/turno3: 90%,70%,230min,8min; 360 brutas,344 boas totais,336 primeira passagem,16 refugadas,8 retrabalhadas. OEE explica diferença entre total aprovado e primeira passagem.
- Leituras mostram unidade e horário; referência/tolerância pendente é diagnosticada sem transformar ausência em zero nem inventar aprovação. Máquina genérica não herda catálogo T20.
- Paradas: confiabilidade/microparadas/resumo; histórico com motivo, classificação cronológica, justificativa e reparo. Reparo sem falha é rejeitado; formulário preserva valores e admite reparo aberto.
- Relatórios: CSVs separados de coletas/produção/perdas/paradas/indicadores de Scrap; contexto, origem, correções e unidades; taxa não aditiva por máquina/processo/produto/variante/OP/lote/receita/dia operacional/turno. Números negativos e zero preservados, texto protegido contra fórmulas, BOM/ponto-e-vírgula/CRLF/pt-BR. Consulta incompleta bloqueia exportação em vez de truncar.
- Importação simultânea: recuperação de conflito apenas após igualdade do conteúdo completo, excluindo autoria/horário de auditoria; mudança de conteúdo continua rejeitada.

## Evidência

Firebase real: base `presentation_20261008_v1`, revisão aditiva `presentation_20261008_v1_rev_machines`. Revisão:609 registros criados,nove transições,2.353 entradas conferidas em segunda sessão,repetição0; contas/memberships/dados externos preservados. Hashes/regras/contagens em `evidencias/jornada-coesa/`. Duas sessões usam a mesma conta; não se afirma segunda pessoa/computador.

CSV baixado pela interface:30 coletas P02/turno3,três parâmetros,16/360=4,444444444444445%; zero erros de parsing. Denominador confrontado com quatro fechamentos90 no snapshot Firebase, perdas16 e coleta30. Evidência `bi-download-verificacao.json`; captura `relatorios-desktop.jpg`.

Suítes completas em68189e7; após ajuste focal em b1cb5a9, nova execução dos13testesafetados e estático--deploy115verdes. O CSVválido baixado novamente é idêntico. Não se afirma nova execução integral após a correção focal:

| Check | Resultado |
|---|---|
| `node --test tests/unit/*.test.js` | 254/254, saída0 |
| `node scripts/run-emulator-tests.mjs` | 25/25, saída0 |
| `node scripts/verify-static.mjs --deploy` | 115 arquivos, zero erros, saída0 |
| `git diff --check` | saída0 |
| Browser real Firebase | escolha P02/consulta, três parâmetros próprios, formulário Nova coleta contextual, paradas/reparos, Indicadores/TV, Relatórios/download/reload |
| Responsivo | 1440×900,1280×720,1024×580,390×844,320×568; telas inspecionadas sem overflow horizontal da página, tabelas com próprio scroll; Escape fecha seletor |

O teste anterior do emulador encontrou falha da importação concorrente24/25; correção em68189e7 foi seguida de nova suíte completa25/25. Logs privados de trabalho na pasta ignoradaSDD. Warnings permission_denied correspondem aos casos negativos esperados de autorização.

## Limites e continuidade

Compatibilidade GitHub Pages conferida com app estático/imports relativos e rota `/msa/#reports` recarregada; Firebase externo. Este resultado não significa que novo código está no site público; nenhum novo push/workflow Pages executado.

Coletas e indicadores persistidos são exemplos próprios rastreáveis; não há integração física/homologação. Painel TV informa fonte não configurada; tolerâncias em rascunho continuam pendentes. Smoke do formulário não é prova de nova coleta manual gravada; persistência dos exemplos foi comprovada pelo publicador autenticado. CEP/engenharia/perfis/histórico/importação preservados e cobertos pelas regressões; não se afirma execução manual completa dos17cenários em todos os tamanhos/perfis.

Adiados por aprovação expressa: novos workflows de lote, investigação, equipe/presença/alocação, passagem de turno, alertas/som, novo Excel, nova conferência/consolidação e foto. Mapa/Chat excluídos. T20/Z1–Z21 sem refinamentos novos, dados anteriores preservados.

Checkout: `C:\Users\Kauan\.codex\worktrees\msa-jornada-coesa\Desafio de Ideias`. Retomada: `RETOMADA_ENTREGA_ESSENCIAL_2026-10-08.md`. Decisões e custos: `DECISOES_ENTREGA_ESSENCIAL_2026-10-08.md`. Não incluir credenciais/backups completos nos commits. Checkout original e Desktop intactos.

