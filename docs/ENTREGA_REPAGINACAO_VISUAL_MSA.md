# Repaginação visual MSA

Entrega local em 06/10/2026, conforme o prompt e a pesquisa de direção visual. Nenhum commit, push ou publicação foi realizado.

## Resultado

- Login completo com a logo original, composição dividida no desktop, uma coluna no celular, campos vazios, senha visível/oculta, envio por Enter, carregamento e erro sem perder os valores. Sessão válida restaura o destino interno; saída retorna ao login.
- Simulador existente acessível pelo login, com identificação permanente. Ao sair, restaura contexto, período, página e sessão anteriores. Os cenários continuam em memória.
- Quatro indicadores preservados, filtros com rótulos, gráficos mais amplos, séries verde/azul, tooltips com valores e unidades em português, legenda acionável por teclado e tabela dos mesmos dados. Histórico conserva valores negativos, lacunas e recorte da versão atual, sem suavização.
- Zonas Z1–Z21 responsivas, com estado textual calculado e acesso ao detalhe. Tabelas, formulários, diálogos, abas e configurações compartilham os mesmos estilos. Cadastros mostram vínculos de máquina/processo/produto.
- Lateral preservada com 64 px, mesma ordem, links, ícones, rótulos e abertura no celular. Temas claro, escuro e sistema, preferências e redução de movimento preservados.

## Arquivos principais

`app/styles.css`, `app/src/ui/main.js`, `app/src/ui/charts.js`, `app/index.html`, `index.html` e `app/assets/msa/msalogo.png`.

O servidor local agora serve PNG com o tipo correto. O verificador estático permite exclusivamente o hash da logo aprovada; os demais documentos e binários continuam bloqueados. Os testes de navegador foram adaptados à nova entrada.

## Evidências e verificação

- `npm test`: 84 testes passaram.
- `npm run verify:static -- --deploy`: 46 arquivos, nenhum erro. Esse comando só verifica; não publica.
- `tests/browser/entry.mjs`: erro sem perda de campos, bloqueio de envio duplicado, Enter, destino interno, sessão restaurada, saída, perfil de leitura, retorno da simulação e abertura pelo index local. Autenticação interceptada apenas no teste, sem contas ou credenciais reais.
- `tests/browser/ui.mjs`: navegação, busca, 41 parâmetros, detalhe, produção, coleta, parada, perda em kg, decisões da Engenharia, cadastro, versionamento, metas, CSV e tema persistido. Repositório em memória.
- `tests/browser/simulation.mjs`: 11 cenários; inclui lacunas de leitura ausente/inválida, amostra insuficiente e dispersão zero. Zero gravações no Firebase, nenhum erro de JavaScript.
- `tests/browser/smoke.mjs`: módulos, serviços e catálogo em `/` e `/msa-test/`.
- `tests/browser/visual-msa.mjs`: login/dashboard em 1366, 1440, 768 e 390 px nos dois temas; sete páginas em desktop/celular; formulário, nome longo, teclado, legenda, dados tabulares, valores negativos, tema sistema, redução de movimento e estado operacional vazio. Nenhum overflow da página, erro de JavaScript ou erro no console. Zero gravações no Firebase.
- Contrastes medidos: texto, texto secundário, ação, sucesso, alerta e erro acima de 4,5:1. Menor resultado: 5,22:1 no tema claro e 6,02:1 no escuro. Esses números cobrem as combinações testadas, não uma auditoria completa de acessibilidade.
- SHA-256: 38 arquivos protegidos sem alteração, incluindo serviços, domínio, catálogo, regras Firebase e os documentos/mudanças anteriores do usuário. A logo copiada tem o mesmo hash do original.

Capturas e logs ficam em `output/repaginacao/`, incluindo `visual-checks.json`, `preservation-check.json` e `hashes-preservados.json`.

Prévia: [login](../output/repaginacao/login-light-1440.png), [dashboard claro com simulação identificada](../output/repaginacao/dashboard-light-1440.png), [dashboard escuro](../output/repaginacao/dashboard-dark-1440.png), [celular](../output/repaginacao/dashboard-light-390.png), [estado vazio](../output/repaginacao/operational-empty.png), [histórico com valores negativos](../output/repaginacao/parameter-negative-history.png).

## Limites de verificação

Login real, sessão real e permissões no Firebase remoto não foram exercitados: não foram fornecidas credenciais de teste nesta execução. O estado vazio usa o `emptyDashboard()` real da aplicação, com sessão de leitura interceptada no teste, sem afirmar o conteúdo atual do banco remoto. Testes de emuladores não foram executados; serviços e regras permaneceram intactos. A validação visual ocorreu no Chromium, com larguras representativas, sem dispositivos físicos.

Recuperação de senha não foi incluída no login, pois o serviço remoto não foi validado. A stack e os cálculos existentes permanecem. Nenhum dado operacional foi gravado para validar aparência.

Para abrir novamente: execute `npm start` na raiz e acesse [MSA local](http://127.0.0.1:5173/).
