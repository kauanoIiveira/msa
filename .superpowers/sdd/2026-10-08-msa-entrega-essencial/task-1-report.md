# Task 1 — apresentação essencial

Arquivos: `app/src/ui/main.js`, `app/src/ui/overview.js`, `app/src/ui/technical.js`, `app/src/services/technical.js`, `tests/unit/essential-stops.test.js`.

Leituras exibem unidade e horário/data da última coleta; nominal da configuração da própria leitura quando registrado e diagnóstico de tolerância pendente. Visão geral separa total aprovado, primeira passagem usada no OEE e retrabalho apontado. Paradas exibem resumo de microparadas do projetor comum, motivo, classificação, justificativa e reparo no histórico. Classificação usa `latestClassification` cronológico; formulário conserva os valores existentes, permite fim de reparo vazio e não sugere horários pelo relógio da tela. Serviço rejeita reparo sem falha; preserva validações temporais existentes. Removidos exemplos numéricos fixos da explicação de produtividade/takt.

Verificação: runtime Node `C:/Users/Kauan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`.

- `--test tests/unit/essential-stops.test.js` antes do ajuste: 1 passou, 2 falharam pelos comportamentos ausentes (reparo sem falha aceito; classificação por ordem do array).
- `--test tests/unit/essential-stops.test.js tests/unit/workspace-metrics.test.js tests/unit/period-metrics.test.js`: 14 passaram, 0 falharam.
- `--check app/src/ui/main.js` e `--check app/src/ui/technical.js`: saída 0.
- `git diff --check`: saída 0.

Limitações: smoke visual em navegador real e suíte completa ficam com o controlador na QA final, conforme divisão aprovada. Nenhum dado, fórmula de indicador, publicador, seed, regras Firebase, permissões ou integração foi alterado. Os testes focais não comprovam publicação nem operação industrial. Em consulta com OEE parcial, primeira passagem representa a base avaliada do projetor, com cobertura já exposta na memória dos indicadores. Sem nova extração ampla ou arquitetura; helper de renderização de classificação compartilhado entre tabela e histórico.
