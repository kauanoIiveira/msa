# MSA Yellow Team

Para retomar com o pacote local completo, comece por [LEIA_PRIMEIRO.md](LEIA_PRIMEIRO.md), use [PROMPT_RETOMADA.md](PROMPT_RETOMADA.md) e siga o [guia de transferência](docs/TRANSFERENCIA_LOCAL.md). Os originais e o contexto privado agora acompanham a cópia local; partes antigas deste documento permanecem como histórico.

Base funcional para o desafio MSA/SENAI. HTML/CSS/JavaScript modular e Firebase Authentication + Realtime Database. Sem framework de interface ou servidor de producao.

## Estado Atual

Para continuar em outro computador, leia [CONTINUE_AQUI.md](CONTINUE_AQUI.md). Roteiro de tres paginas para a entrevista de 20 minutos: [Roteiro_Entrevista_MSA_Equipe_Amarela.docx](docs/Roteiro_Entrevista_MSA_Equipe_Amarela.docx).

Entrega corrente: [CEP e pendências](docs/ENTREGA_CEP_E_PENDENCIAS_MSA_2026-10-06.md). Inclui CEP I-MR fase I e Cp/Cpk/Pp/Ppk condicionados aos requisitos do estudo, referência histórica da planilha com proveniência, visão por hora, microparadas manuais em segundos, CSV com prévia e correções rastreáveis. Consulta Operacional exclui `origin: demo`; Apresentação conserva os dados fictícios identificados e sem ações de gravação.

O dashboard inclui "Simular cenário", com 13 casos isolados em memória, incluindo CEP estável/instável. Usa os mesmos serviços de validação, indicadores e estatística; não grava no Firebase. "Voltar aos registros" restaura o contexto operacional. Os índices usam as amostras do cenário e não representam resultados da fábrica.

Interface funcional com login, dashboard, 41 parametros, graficos, apontamentos, Engenharia, historico, cadastros e configuracoes. Temas claro/escuro/sistema persistentes e VLibras opcional. Funcoes de limites versionados, correcoes rastreaveis, indicadores, comparacoes e CSV continuam nos servicos. QR, OCR, IoT/CLP e IA nao foram entregues.

A configuracao web recebida esta em `app/src/config/firebase.js`. A conta `adm@adm.com`, Fabiana Dias, tem perfil administrativo em `msa`; o membership anterior em `demo` foi preservado. Login, leitura e restauracao da sessao foram verificados na nuvem. Nenhum registro industrial original foi enviado ao Firebase. As regras foram publicadas pelo usuario; este trabalho nao altera as regras remotas. Publicacao Git e ativacao de Pages sao etapas distintas.

Os 41 parametros da lista da equipe e da planilha possuem catalogo de referencia, previa/instalacao confirmada e consulta completa para o dashboard, inclusive parametros sem leitura. Veja [docs/PARAMETROS_MSA.md](docs/PARAMETROS_MSA.md). A instalacao do catalogo cria rascunhos. As versoes aprovadas do cenario ficticio sao separadas e nao representam limites homologados. A branch de trabalho e master.

## Desenvolvimento E Testes

Node >=22. Dependencias fixadas em package-lock.json.

```powershell
npm ci --ignore-scripts
npm run prepare:vendor
npm run test:unit
npm run verify:static
```

Para os testes de regras/integracao, use um JDK >=21 em JAVA_HOME, ou o JDK portatil verificado em `.runtime/java/`. Nao e necessario modificar o Java padrao do Windows.

```powershell
npm run test:emulator
```

Os emuladores usam `demo-msa`, 127.0.0.1:9000 (RTDB) e 9099 (Auth), sem fallback para o banco real. A execucao encerra os emuladores ao terminar; portas ocupadas precisam ser liberadas pelo responsavel, nunca por encerramento indiscriminado de processos.

Smoke test de modulos no navegador: `node tests/browser/smoke.mjs`, com Playwright disponivel e Chromium instalado. O runtime Codex pode ser indicado pela variavel PLAYWRIGHT_MODULE. O harness fica fora de `app/` e nao e publicado.

## Abrir O Sistema

```powershell
npm start
```

Abra http://127.0.0.1:5173/. O `index.html` na raiz do repositório também direciona ao sistema: aberto pelo Windows, usa o servidor local em 5173; servido pela raiz do repositório, redireciona para `app/index.html`. É necessário manter `npm start` ativo para abrir pelo Windows. Login ou dashboard dependem da sessão restaurada.

Sem sessão, o sistema mostra o login; com sessão restaurada, abre o dashboard. Use as credenciais autorizadas do workspace para consultar/gravar dados privados. Nenhuma senha foi incorporada ao código; não existe acesso anônimo ao banco nem tela de cadastro. O simulador pode ser aberto pelo login.

O ambiente operacional usa `/workspaces/msa`, separado de `/workspaces/demo`. Em 05/10, o usuario autorizou preencher `msa` com um cenario ficticio de 14 dias: T20, dois produtos, 41 parametros, 28 coletas, 56 apontamentos de producao, 29 paradas, 94 registros de perdas, quatro analises, quatro metas e uma correcao pendente. A origem ficticia permanece nos registros (`origin: demo`, `source.file: cenario-ficticio-c26`). Os nomes e as quantidades desse cenario nao comprovam a operacao real da empresa. Aquecimento, contramolde e vacuo continuam pendentes de esclarecimento; as 18 versoes aprovadas do cenario nao equivalem a homologacao industrial.

O gerador `scripts/seed-presentation.mjs` valida os registros pelos servicos de dominio. Sem `--apply`, apenas exporta o JSON para `output/scenario/`. Com `--apply`, exige banco vazio, preserva membership e confere as contagens apos a gravacao. Recusa sobrescrever dados existentes. O frontend nao gera leituras automaticamente e continua gravando apontamentos manuais no Firebase. Ausencias aparecem como "Sem dados".

Em Cadastros, crie maquinas, processos e produtos reais. Em Parametros, "Cadastrar referencias" instala os 41 nomes/unidades/limites em rascunho, com natureza explicitamente selecionada para cada parametro, sem inventar leituras nem homologar limites. Leituras inseridas manualmente e demais registros sao gravados no Firebase; integracao automatica de sensores continua pendente.

Configuracoes inclui perfil, troca de senha com reautenticacao, temas, VLibras, tabelas compactas e periodo inicial persistente. O cabecalho nao exibe marca, status do banco, seletor de tema ou intervalo de datas; o filtro de periodo continua disponivel.

Testes: `node tests/browser/entry.mjs` verifica entrada direta; `node tests/browser/ui.mjs` injeta uma fixture exclusivamente no navegador de teste. O teste remoto `node tests/browser/firebase-ui.mjs` exige `MSA_TEST_PASSWORD` no ambiente, verifica o cenario autorizado e salva o nome Fabiana Dias no perfil. Nunca configure a senha no Pages ou em arquivos publicados.

## Integracao Da Interface

Carregar `vendor/papaparse.min.js` como script classico e importar `src/browser.js` relativamente. Chamar createBrowserMsa(), entrar pelo servico auth e obter funcoes por session.onWorkspace(). A configuracao real so e usada quando essa fabrica e chamada, nunca ao importar funcoes puras.

Contratos e exemplos: [docs/CONTRATOS_FUNCIONAIS.md](docs/CONTRATOS_FUNCIONAIS.md). Provisionamento: [firebase/CONFIGURACAO.md](firebase/CONFIGURACAO.md).

Resultados, cobertura e decisoes de execucao: [docs/ENTREGA_FUNCIONAL.md](docs/ENTREGA_FUNCIONAL.md).

`npm start` serve exclusivamente `app/`, agora com index funcional. Chart.js e Lucide sao distribuidos localmente; Firebase e VLibras dependem da internet. Desativar VLibras recarrega a pagina para descarregar o widget, preservando tema, rota e sessao.

## GitHub Pages

Workflow manual em `.github/workflows/pages.yml`, com actions fixadas por SHA verificado. Publica apenas `app/` e exige index.html revisado com `data-msa-functional="true"`. Imports e recursos relativos foram testados tambem em subdiretorio. Execute o workflow na master quando for ativar Pages; um push de codigo nao executa esse workflow.

Os materiais em analise/, entrega/ e output/ permanecem locais e ignorados, nao removidos. Revise todo o repositorio antes de torna-lo publico; excluir um arquivo do Pages nao o torna privado no GitHub.

## Limites Importantes

Cp/Cpk sao demonstrativos, com metodo de sigma declarado e homologated=false. Dispersao zero, amostra insuficiente e limites inadequados nao produzem indices infinitos. Decisao humana no sistema nao libera fisicamente uma maquina.

Consultas podem ser parciais; paradas abertas nao tem duracao final; quantidades que atravessam a janela nao sao rateadas automaticamente. Kg nao e somado a pecas. Ausencia nao vira zero. Importacao CSV tem previa obrigatoria e identidade por arquivo/linha/contexto, nao detecta arquivos renomeados como a mesma origem.

Nao ha fila offline persistente, envio automatico de notificacoes nem monitoramento 24h com navegador fechado. Importacao CSV, comparacoes e solicitacao de correcoes existem nos servicos, mas ainda nao possuem fluxo visual completo. O widget VLibras foi carregado e seu desligamento verificado; a qualidade da traducao/avatar nao foi homologada. Nomes de parametros e faixas de referencia nao equivalem a medicoes reais ou limites homologados.
