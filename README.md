# MSA Yellow Team

Base funcional para o desafio MSA/SENAI. HTML/CSS/JavaScript modular e Firebase Authentication + Realtime Database. Sem framework de interface ou servidor de producao.

## Estado Atual

Funcoes de cadastro, limites versionados, coleta, producao, paradas, perdas, analise da Engenharia, correcoes rastreaveis, historico, indicadores, alertas, comparacoes e CSV implementadas. Interface visual, dashboard renderizado, QR, OCR, IoT/CLP e IA nao foram entregues nesta fase.

A configuracao web recebida esta em `app/src/config/firebase.js`. Isso nao habilita usuarios/provedor nem publica regras. Nenhum registro industrial original foi enviado ao Firebase. Validacao de nuvem e publicacao no GitHub ainda pendentes.

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

## Integracao Da Futura Interface

Carregar `vendor/papaparse.min.js` como script classico e importar `src/browser.js` relativamente. Chamar createBrowserMsa(), entrar pelo servico auth e obter funcoes por session.onWorkspace(). A configuracao real so e usada quando essa fabrica e chamada, nunca ao importar funcoes puras.

Contratos e exemplos: [docs/CONTRATOS_FUNCIONAIS.md](docs/CONTRATOS_FUNCIONAIS.md). Provisionamento: [firebase/CONFIGURACAO.md](firebase/CONFIGURACAO.md).

Resultados, cobertura e decisoes de execucao: [docs/ENTREGA_FUNCIONAL.md](docs/ENTREGA_FUNCIONAL.md).

`npm start` serve exclusivamente `app/`. Como o frontend foi adiado por escolha do usuario, ainda nao ha index.html: a raiz retorna 404. Nao confundir os modulos testados com um MVP visual publicado.

## GitHub Pages

Workflow manual em `.github/workflows/pages.yml`, com actions fixadas por SHA verificado. Publica apenas `app/` e exige index.html revisado com `data-msa-functional="true"`. O gate bloqueia a publicacao antes da etapa de interface.

Os materiais em analise/, entrega/ e output/ permanecem locais e ignorados, nao removidos. Revise todo o repositorio antes de torna-lo publico; excluir um arquivo do Pages nao o torna privado no GitHub.

## Limites Importantes

Cp/Cpk sao demonstrativos, com metodo de sigma declarado e homologated=false. Dispersao zero, amostra insuficiente e limites inadequados nao produzem indices infinitos. Decisao humana no sistema nao libera fisicamente uma maquina.

Consultas podem ser parciais; paradas abertas nao tem duracao final; quantidades que atravessam a janela nao sao rateadas automaticamente. Kg nao e somado a pecas. Ausencia nao vira zero. Importacao CSV tem previa obrigatoria e identidade por arquivo/linha/contexto, nao detecta arquivos renomeados como a mesma origem.

Nao ha fila offline persistente, envio automatico de notificacoes nem monitoramento 24h com navegador fechado. Revisao independente por subagentes fica para uma etapa autorizada; esta fase usa implementacao e revisao diretas.
