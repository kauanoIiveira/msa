# Verificação final — CEP e pendências MSA

Plano: `docs/PLANO_CEP_E_CORRECOES_MSA_2026-10-06.md`. Entrega: `docs/ENTREGA_CEP_E_PENDENCIAS_MSA_2026-10-06.md`. Implementação preservada no checkout atual, sem commit/publicação e sem tocar no XLSX original ou em registros industriais.

## Tarefas verificadas

| Tarefa | Resultado / evidência |
|---|---|
| 1 — Fonte XLSX | 41 características × 17 observações, 121 números em texto e 14 vazios; hash antes/depois idêntico; regressão BF média/desvio e datas em texto |
| 2 — Regras e recortes | Aprovação/natureza no cálculo comum, contexto completo, origem operacional/apresentação, aviso de sobreposição, segundos e agregação horária segura verificados |
| 3 — CEP domínio | Exemplo NIST, lacunas, MR, dispersão zero, amostra insuficiente, natureza/aprovação, sequência, sinal, revisão conflitante e cobertura verificados |
| 4 — CEP UI | Registros do sistema/planilha, cartas, diagnóstico, CSV, período histórico, unidade incompatível, Engenharia, dois temas/celular verificados |
| 5 — Hora a hora | Ausência versus zero, cruzamento sem rateio, hora corrente, microparadas por segundos/união e conflitos verificados |
| 6 — Lateral/cadastros | Logo original na lateral preta dos dois temas; validação/reenvio/persistência da máquina; orientação de vínculos e menu móvel verificados |
| 7 — CSV/correções/documentação | Prévia sem escrita, confirmação, reimportação idempotente, original preservado, ausência corrigida, autoaprovação bloqueada e comparação do aprovador verificados; documentação corrente atualizada |
| 8 — Revisão e conclusão | Revisão independente concluída com quatro achados importantes corrigidos por regressões; suites finais aprovadas |

## Suites finais

- `npm test`: **100 aprovados, zero falhas**. Inclui as quatro reproduções da revisão e proteção horária contra conflitos.
- `npm run test:emulator`: **16 aprovados, zero falhas**, Auth/RTDB emulados; nenhuma gravação no banco real.
- `node tests/browser/entry.mjs`: login, erro preservado, Enter, restauração da sessão, perfil de consulta, vazio, saída/retorno da simulação aprovados.
- `node tests/browser/ui.mjs`: 41 parâmetros, 21 zonas, gráficos, produção, Engenharia, exportação, cadastro inválido/reenvio/persistência, temas e celular aprovados; zero erros JavaScript.
- `node tests/browser/simulation.mjs`: **13 cenários aprovados, zero gravações Firebase, zero erros JavaScript**.
- `node tests/browser/data-tools.mjs`: CSV com prévia/idempotência, correção que preserva original, autoaprovação bloqueada, parada de **30 segundos**, consulta fictícia somente leitura e separação da base operacional aprovados.
- `node tests/browser/cep.mjs`: CEP estável, planilha histórica, relatório 25/08–29/09/2026, bloqueio de versão em ms para fonte em seg, cartas na unidade da fonte, temas/celular e hora a hora aprovados; zero erros JavaScript.
- `node tests/browser/visual-msa.mjs`: sete telas da navegação anterior + login em ambos temas; dashboard/login em 1366/1440/768/390 px, restantes desktop/celular, perfil sob o ícone, superfícies uniformes, persistência/sistema/redução de movimento aprovados. Contraste mínimo de texto aferido **5,22:1**; zero overflow, erros de console e gravações Firebase. CEP tem capturas complementares inspecionadas nos dois temas e celular.
- `npm run verify:static -- --deploy`: **53 arquivos, zero erros**. `--deploy` é verificação do artefato, sem publicação.
- `git diff --check`: sem erros de espaços; avisos de normalização LF/CRLF são configuração local de Git.

## Revisão independente e correções

O revisor trabalhou somente por leitura e reproduções Node em memória. Resultado: nenhum crítico, quatro importantes, nenhum menor e lista de comportamentos deixados sem julgamento vazia. Não foi realizada uma segunda revisão; as correções foram verificadas por regressões e suites completas.

| Achado | Proteção final | Regressão |
|---|---|---|
| Revisões conflitantes ignoradas no CEP | Conflito propagado; observação excluída da estimativa, capacidade bloqueada no grupo afetado e cobertura de coletas explícita | `CEP blocks only the study affected by conflicting revisions and respects collection coverage` |
| Unidade histórica incompatível | Bloqueio da capacidade; fonte permanece seg e especificações incompatíveis não são desenhadas como se fossem seg | `historical study refuses a specification with a different unit` + ensaio pela UI |
| Período histórico errado no relatório | Período das observações separado da janela de consulta | `historical report carries actual observation dates separately from the consultation window` + CSV real baixado no navegador |
| Identificação da correção ausente | Série/tabela/CSV levam original, correção e valor utilizado | `an applied correction reaches the CEP series and CSV with original and used readings` |

As quatro regressões falharam antes e passaram depois; logs `red-review.log` e `unit-final.log`. A proteção de conflitos na visão horária também teve reprodução antes/depois, registrada em `red-hourly-revision.log`. Outras fases de falha inicial ficaram em `red-domain.log`, `red-origin.log`, `red-query-day.log` e `red-diagnostic-date.log`.

## Preservação e limites

SHA-256 XLSX: `6a030b82f7dc32c6bd05a43a426344c72683fad61495aab70dbc13406ea11c8e`. Logo original: `4CE380BF6038DAD8C22C1689E173757A2BDDBED045288C3C1FCC0C643E9F1A4F`.

O estudo é fase I exploratória; mínimo de 25 configurável, normalidade/instrumento não verificados e nenhuma liberação industrial automática. Dados fictícios ficam identificados e preservados na consulta Apresentação. Integração física, política de amostragem e homologação das referências exigem validação com a empresa. A sessão de escrita real do usuário não foi exercitada; autorização e escrita foram verificadas no emulador. Nenhuma alteração remota, commit ou deploy foi feita nesta etapa.

Documentos e artefatos anteriores do usuário foram preservados, incluindo o roteiro DOCX. Evidências/capturas ficam em `output/cep-2026-10-06/`, ignoradas pelo Git e fora do site.
