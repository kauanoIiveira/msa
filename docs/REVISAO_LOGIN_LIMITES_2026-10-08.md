# Revisão de entrada, textos e limites — 08/10/2026

Alterações locais solicitadas pelo usuário, feitas em `C:\Users\Aluno\Desktop\msa-master` após a leitura integral de `RETOMADA_ENCERRAMENTO_2026-10-07.md`, dos documentos indicados e do código vigente. Base publicada: `69f674ae35f6265a3998deff90778b90e0bfcaff`.

## Resultado

- O `index.html` encaminha para `#login`. A aplicação exige uma sessão para mostrar suas telas; após sair, volta ao login. A sessão válida continua sendo restaurada ao recarregar.
- O botão “Abrir simulação local” foi retirado do login.
- Foram retirados os avisos que classificavam os registros como fictícios, didáticos ou hipotéticos. Os nomes também foram ajustados na exibição, inclusive nos detalhes, na correção, na prévia CSV e no encaminhamento de estudos. Os textos originais armazenados e a proveniência dos registros permanecem preservados.
- Ao reabrir “Limites”, o formulário mostra os últimos valores salvos, incluindo rascunhos. O cadastro e os detalhes distinguem o limite aprovado atual da referência usada pela leitura anterior.
- A tela de limites mostra as versões salvas e explica o efeito de cada status. “Rascunho” guarda a revisão; “Aprovado” disponibiliza os novos limites para as próximas coletas. As leituras históricas continuam usando sua versão original.

## Diagnóstico do limite

O problema foi reproduzido antes da correção: salvar `9,4` / `10,6` criava uma versão em rascunho, mas reabrir o formulário mostrava novamente `9,5` / `10,5`, da versão aprovada anterior. A gravação ocorria; a interface ignorava a versão recém-salva na reabertura. A escolha da última versão agora é compartilhada pelo formulário e pelas referências exibidas.

## Verificação realizada

- 148 testes unitários passaram, sem falhas ou testes ignorados.
- A suíte de integração e regras passou com Firebase Auth e Realtime Database emulados, cobrindo 20 testes, incluindo os quatro perfis, gravação, concorrência e decisões.
- `node scripts/verify-static.mjs --deploy`: 76 arquivos verificados, zero erros. Esse comando somente verifica o artefato; não publica.
- `tests/browser/session-limits.mjs`: redirecionamento do index, entrada, restauração da sessão, logout, bloqueio de acesso sem sessão, persistência de rascunhos após recarregar, rejeição de limites inválidos, aprovação explícita, coleta com a nova versão e preservação das referências históricas.
- `tests/browser/functional-audit.mjs`: telas e permissões dos quatro perfis; cadastro/edição/inativação/ativação; coleta; refugo; parada e encerramento com peça boa validada; importação CSV; início e decisão de análise; exportações CEP e indicadores; backup; plano aprovado e confirmação de produção; retorno da TV; consulta em 390 px. Zero erros de execução no navegador.
- As capturas do login, do formulário de limites e da consulta em 390 px foram inspecionadas visualmente.

Os testes de navegador usam autenticação isolada e os testes de integração usam emuladores. As evidências desta revisão estão em `output/revisao-2026-10-08/`.

## Reexecução nesta máquina

```powershell
node --test --test-reporter=spec tests/unit/*.test.js
node scripts/verify-static.mjs --deploy
$env:JAVA_HOME = 'C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2025.2.6\jbr'
node scripts/run-emulator-tests.mjs
$env:PLAYWRIGHT_MODULE = 'file:///C:/Users/Aluno/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
node tests/browser/session-limits.mjs
node tests/browser/functional-audit.mjs
```

As dependências do lockfile foram instaladas localmente para executar a suíte. A comparação com a árvore publicada confirmou que os arquivos originais alterados se restringem a `index.html` e sete módulos da interface. Esta revisão acrescenta dois testes de navegador, esta nota e as evidências datadas. A publicação remota continua na base indicada acima.
