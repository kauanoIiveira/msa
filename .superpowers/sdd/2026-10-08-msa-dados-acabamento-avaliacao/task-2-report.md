# Task 2 — exemplos operacionais adicionais

Implementação concluída localmente. Nenhuma publicação, acesso a credenciais, alteração de Auth/regras ou concessão de papel. Cp/Cpk e suas fontes existentes permanecem intactos; nenhuma nova série, versão de limite ou mudança de capacidade foi criada.

## Resultado

- `buildEvaluationExamples` seleciona exclusivamente coletas `origin=demo` do pacote existente no snapshot fresco: última coleta do turno 3 de VGARD HP, MARK V, P02, I03 e M04. Falta de fonte bloqueia o builder. As notas de origem identificam os valores como exemplo próprio sem homologação industrial.
- Cinco análises ligadas a essas coletas: duas waiting, duas analyzing e uma approved com evidência técnica. Cinco solicitações de correção permanecem waiting, sem decisão/autoaprovação; original e contexto não mudam. Cinco ocorrências: duas waiting, duas analyzing e uma resolved.
- Três novos casos fechados P02/I03/M04, dia operacional 07/10, 03–07h de 08/10, em espaço posterior aos casos antigos 23–03h. Reutilizam máquina/processo/produto/receita/política existentes; OP/lote próprios. Cada caso tem quatro intervalos, plano de 400 peças, produção gross/good, confirmação, inspeção de primeira passagem, perdas conciliadas, execução fechada, referência própria de ciclo, falha reparada, microparada e cobertura completa por fingerprint.
- 120 comandos pelos serviços, 135 intenções de escrita, 125 novos registros/entradas. Zero novas coletas/versões/parâmetros. Nenhuma transação em caminho preexistente foi permitida: `prepareRevision` preserva sua proteção aditiva, enquanto novos planos acrescentam eventos próprios nos ledgers existentes das máquinas.
- Validador adicional usa os mesmos histórico/consulta/projetor que a UI, valida reconciliação de peças e valores finitos dos novos casos. Os validadores dos casos antigos conservam 90%/70% e seu recorte original.
- CLI `--evaluation-examples --base-manifest presentation_20261008_v1_rev_machines --revision evaluation` prepara comandos a partir de snapshot autenticado fresco, usando o mesmo envelope privado, hash, backup, replay, repetição e segunda sessão do publicador existente. Dry-run é o padrão. Combinação com `--machine-expansion` ou revisão distinta de evaluation é rejeitada.
- Reproduzido o risco da ordem lexicográfica das decisões: UUID humano posterior antes de `presentation_*` na lista mostrava decisão semeada anterior. Helper cronológico `createdAt`, com ID como desempate, corrigido nos consumidores de Ocorrências, Pendências e Equipamentos. Teste confirma que ação humana mais recente vence.

## Valores calculados pelas fontes/projector no smoke final

| Caso | Gross / good / primeira passagem | Refugo / retrabalho | Produtividade | OEE | MTBF s | MTTR s | Scrap % |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P02 | 368 / 356 / 348 | 12 / 8 | 92 | 0.725 | 13800 | 480 | 3.260869565217391 |
| I03 | 356 / 340 / 332 | 16 / 8 | 89 | 0.6916666666666667 | 13680 | 600 | 4.49438202247191 |
| M04 | 344 / 324 / 316 | 20 / 8 | 86 | 0.6583333333333333 | 13560 | 720 | 5.813953488372093 |

Esses valores são resultados de exemplos locais, não operação industrial confirmada. OEE acima está na escala 0–1. Gross/good/primeira passagem vêm dos quatro intervalos; perdas reconciliam as diferenças.

## Verificação efetivamente executada

Runtime: `C:/Users/Kauan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`; cwd: `C:/Users/Kauan/.codex/worktrees/msa-jornada-coesa/Desafio de Ideias`.

1. `node --test tests/unit/evaluation-examples.test.js`: **2 passaram, zero falhas**, 29938.9842 ms. Uma fixture base+machines é construída uma única vez. Verifica interrupção em fechamento de parada, retomada e repetição sem novos writes, todas as fontes antigas e membros preservados pelo backup, hashes de collections/parameterVersions intactos, indicadores antigos, três novos casos coerentes, análises/correções nas consultas atuais das quatro máquinas e ocorrências nas janelas do turno 3. Verifica bloqueio SELF_APPROVAL e MANIFEST_EXISTS.
2. `node --test tests/unit/pending.test.js tests/unit/equipment-view.test.js`: **8 passaram, zero falhas**, 117.2342 ms.
3. Após incluir o terceiro consumidor no teste, `node --test --test-name-pattern 'actual decision' tests/unit/evaluation-examples.test.js`: **1 passou, zero falhas**, 122.8899 ms; verifica tabela de Ocorrências, Pendências e Equipamentos.
4. `node scripts/presentation-dataset.mjs --help`: passou, exibiu o novo modo; não abre sessão nem escreve.
5. Smoke local `node --input-type=module`, stdin com readFile do backup privado `before-evaluation.json`, `createSnapshotRepository`, `buildEvaluationExamples`, `prepareRevision`, `runPresentationCommands` somente no snapshot e `validateEvaluationExamples`: executado antes e após a limpeza final dos campos de caso. Resultado final **120 comandos / 135 intenções / 125 adições / zero conflitos / zero diagnósticos**. `assertPrivateBackupPreserved` passou incluindo membros e caminhos externos. Resultados de métricas acima saíram desse último comando. Backup não copiado para Git nem impresso.
6. `node scripts/verify-static.mjs`: **118 arquivos, zero erros**, repetido após a última mudança.
7. `git diff --check`: passou.

Nenhuma suite global/emulador foi repetida; o controlador informou a suite global anterior verde. Publicação por SDK, nova sessão autenticada, prova da nuvem e inspeção GUI após os novos dados ficam com o controlador após revisão.

## Comandos para o controlador (não executados por esta implementação)

Com sessão já autorizada em `MSA_TEST_RE`/`MSA_TEST_PASSWORD`, sem armazenar credenciais:

```powershell
node scripts/presentation-dataset.mjs --evaluation-examples --base-manifest presentation_20261008_v1_rev_machines --revision evaluation --preview C:/Users/Kauan/.codex/private/msa-jornada-coesa/evaluation-preview.json --evidence .superpowers/sdd/2026-10-08-msa-dados-acabamento-avaliacao/evaluation-prepared.json
node scripts/presentation-dataset.mjs --apply --preview C:/Users/Kauan/.codex/private/msa-jornada-coesa/evaluation-preview.json --evidence .superpowers/sdd/2026-10-08-msa-dados-acabamento-avaliacao/evaluation-published.json
```

O primeiro comando obtém novos backups automaticamente e só prepara. Aplicação depende da revisão do controlador. Nenhuma alteração de regra é necessária pela implementação; uma rejeição real do SDK deverá ser diagnosticada pelo controlador, sem fallback de escrita.

## Arquivos

`app/src/presentation/evaluation-examples.js`, `app/src/domain/occurrences.js`, `app/src/domain/pending.js`, `app/src/ui/technical.js`, `app/src/ui/equipment-page.js`, `app/src/services/presentation-dataset.js`, `scripts/presentation-dataset.mjs`, `tests/unit/evaluation-examples.test.js` e este relatório.

## Fix final — contrato de variante de análise (base 23a2f6b)

O controlador reproduziu FORBIDDEN no primeiro `reviews.create`, antes de qualquer registro novo ou marker. Causa confirmada: `reviewContext` do gerador não aceitava `variant`, embora o serviço copie integralmente o contexto original, incluindo Medium no exemplo VGARD HP.

Corrigido somente `reviews.context` em `firebase/rules-source.mjs`, regenerando `firebase/database.rules.json` pelo pipeline existente. A variante aceita deve ser exatamente a da coleta, sua presença deve coincidir com a fonte, e `scalar`/`object` mantêm imutabilidade e impedem remoção nas transições. Fluxos de papel, membros, aprovação, autoaprovação de correção e todas as outras regras permanecem idênticos. Nenhuma mudança em comandos, payloads, builder, valores ou envelope privado; o controlador pode repetir o mesmo apply depois da revisão/publicação das regras.

Verificação real, com o runtime acima e `JAVA_HOME=C:/Users/Kauan/Documents/ChatGPT/Desafio de Ideias/.runtime/java/jdk-21.0.12.1+1`:

- RED: `node scripts/run-emulator-tests.mjs tests/rules/review-variant.test.js`, **0 passou / 1 falhou**, exit 1, 1316.2666 ms; o primeiro submitReview legítimo com variante retornou FORBIDDEN no emulador.
- Geração: `node scripts/build-rules.mjs`, passou.
- GREEN: mesmo comando do emulador, **1 passou / zero falhas**, exit 0, 1430.3641 ms. Criação/admin start/analyzing/approved legítimos com variante e legado sem variante passam. Variante forjada ou ausente na criação, alterada/removida em ambas as transições e variante adicionada a fonte legado são rejeitadas.
- Consistência: repetido `node scripts/build-rules.mjs`; SHA-256 do JSON antes/depois idêntico. `node --input-type=module` com asserts do contrato gerado e comparação com `git show HEAD:firebase/database.rules.json` após restaurar apenas `reviews.context`: igualdade completa, confirmando que nenhum outro contrato/permissão mudou.
- `git diff --check`: passou. Nenhuma suite global repetida; nenhuma publicação, credencial ou escrita em nuvem nesta implementação.

Arquivos desta correção: `firebase/rules-source.mjs`, `firebase/database.rules.json`, `tests/rules/review-variant.test.js` e atualização deste relatório. Evidência de cloud preview produzida pelo controlador não foi incluída no commit.
