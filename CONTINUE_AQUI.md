# Continuidade do MSA

## Ponto atual — 07/10/2026

O usuário aprovou a [especificação NHPL](docs/superpowers/specs/2026-10-07-nhpl-produtividade-design.md) e adiou a implementação para outro computador. Seguir [RETOMADA_2026-10-07.md](RETOMADA_2026-10-07.md) e o [prompt atualizado](PROMPT_RETOMADA.md). Não solicitar aprovação da especificação novamente; elaborar/revisar o plano na retomada. As instruções abaixo permanecem como histórico.

## Pacote local preparado em 06/10/2026

Entrada atual para outro computador: [LEIA_PRIMEIRO.md](LEIA_PRIMEIRO.md), [PROMPT_RETOMADA.md](PROMPT_RETOMADA.md) e [Transferência local](docs/TRANSFERENCIA_LOCAL.md). O contexto privado e as fontes foram reunidos dentro da pasta, com exclusões compartilhadas em `.gitignore`. As instruções antigas de clone abaixo são históricas: use os arquivos atuais do pacote para conservar o trabalho ainda não commitado.

## Atualização funcional em 06/10/2026 — CEP e pendências

Estado corrente e demonstração: [Entrega CEP e pendências](docs/ENTREGA_CEP_E_PENDENCIAS_MSA_2026-10-06.md). O sistema tem login/sessão restaurada, lateral preta nos dois temas com logo interna, CEP I-MR fase I, visão horária/microparadas manuais, importação CSV com prévia e propostas de correção. Consulta operacional exclui registros fictícios; consulta Apresentação conserva esses registros identificados e sem gravação. A planilha histórica foi extraída sem editar o original ou gravar suas leituras no Firebase. O texto abaixo é histórico de etapas anteriores.

## Conferência de fontes em 06/10/2026

Base local de retomada: [docs/continuidade/2026-10-06/LEIA_PRIMEIRO.md](docs/continuidade/2026-10-06/LEIA_PRIMEIRO.md). Contém o prompt original integral, revisão dos materiais locais/Drive, planilha, fotos, requisitos, perguntas já feitas, estado do código e pendências. Essa pasta contém material de análise e contatos, foi excluída localmente do Git e não acompanha um clone. A entrevista de aproximadamente 5min42s está localizada, mas ainda não foi ouvida/transcrita.

O conteúdo anterior abaixo foi preservado como histórico. A afirmação de 14 dias fictícios em `msa` descreve uma etapa anterior e conflita com a atualização posterior em `docs/ENTREGA_FUNCIONAL.md`. O código atual inicia o workspace operacional `msa` sem leituras inventadas; o simulador usa dados sintéticos em memória. O estado atual do Firebase não foi consultado nesta conferência. Não apresentar os nomes, limites, ganhos financeiros ou equipamentos propostos como validação da empresa. Nesta rodada, 83 testes unitários e a verificação estática de 45 arquivos passaram.

## Abrir em outro computador

Instale Git e Node.js 24 LTS. Clone a branch master e execute:

```powershell
git clone --branch master https://github.com/kauanoIiveira/msa.git
cd msa
npm ci --ignore-scripts
npm start
```

Abra http://127.0.0.1:5173/. Se a porta estiver ocupada, execute `$env:PORT=5174` e depois `npm start`. Use o endereco indicado pelo terminal. O index da raiz aberto pelo Windows aponta para 5173; para outra porta, use o endereco do terminal.

Nao e necessario copiar node_modules, caches ou um Java local. Os arquivos vendor do frontend ja estao versionados. Firebase e VLibras exigem internet; o simulador usa memoria, sem persistencia e sem escrever no Firebase.

## Acesso e dados

- Firebase: projeto msayellowteam, Realtime Database, workspace msa. A configuracao publica do SDK esta em app/src/config/firebase.js.
- Conta existente: adm@adm.com, Fabiana Dias. Obtenha a senha temporaria com o responsavel pelo projeto, fora do repositorio. A senha nao foi versionada.
- Os dados permanecem no Firebase entre computadores. O simulador funciona sem login; os registros operacionais exigem autenticacao e membership.
- Existem 14 dias de dados ficticios autorizados em msa. A origem permanece registrada. Nao interpretar os dados como medicoes reais da empresa.
- O gerador scripts/seed-presentation.mjs recusa um workspace preenchido. Nao executar --apply para continuar o projeto, nem apagar os dados para contornar essa protecao.
- Preferencias de tema, tabelas e periodo pertencem ao navegador. Simulacoes desaparecem ao sair ou recarregar.

## Reuniao de 20 minutos

Documento para enviar ao Drive: docs/Roteiro_Entrevista_MSA_Equipe_Amarela.docx. Tres paginas: entendimento e divisao dos cinco integrantes, sete perguntas prioritarias, duvidas tecnicas para encaminhar depois. Uma pessoa conduz, uma registra; os demais entram por assunto.

## O que continuar

Registrar respostas da empresa antes de mudar limites ou automatizar coleta. Confirmar aquecimento Z1 a Z21, contramolde 80/75, direcao do vacuo -600 e metodo de capacidade. Definir primeiro piloto, dispositivos disponiveis, rede, frequencia de coleta e prioridades opcionais.

Importacao CSV, comparacao e solicitacao de correcoes existem nos servicos, mas os fluxos visuais completos ainda estao pendentes. Nao ha OCR, QR, CLP/IoT, IA, fila offline persistente ou notificacao com navegador fechado. Cp/Cpk sao estimativas nao homologadas; aprovar no sistema nao libera fisicamente a maquina.

## Testes

```powershell
npm test
npm run verify:static -- --deploy
```

Testes de regras precisam de JDK 21 ou superior em JAVA_HOME: `npm run test:emulator`. Testes de navegador precisam de Playwright com Chromium disponivel; informe PLAYWRIGHT_MODULE quando usar um runtime externo. `node tests/browser/simulation.mjs` verifica os 11 cenarios e ausencia de escrita remota. `tests/browser/firebase-ui.mjs` exige MSA_TEST_PASSWORD no ambiente, salva o nome da conta e confere o cenario autorizado; nao coloque a senha em arquivos.

## Materiais locais preservados

analise/, entrega/ e output/ contem auditorias, materiais e capturas. Permanecem locais e fora do GitHub/Pages para evitar publicar documentos industriais e dumps do banco. Para migracao completa, transfira o arquivo local `MSA_Continuidade_Local.zip`, gerado fora deste repositorio, por um canal privado. Ele inclui estes materiais, codigo e o roteiro, mas exclui node_modules, runtime, logs, preferencias e dumps do banco. Nao publique esse ZIP.

Os PDFs originais em Downloads e materiais em Desktop/MSA nao pertencem ao checkout; o pacote privado tenta inclui-los em referencias_privadas, sem mover ou excluir os originais. Confira o manifesto do pacote para saber quais estavam disponiveis na geracao.

## GitHub e Pages

A branch de trabalho e master. Publicar commits nao publica automaticamente o site: o workflow Pages e manual e deve executar contra master. Configure Pages para GitHub Actions e autorize o dominio do site no Firebase Authentication antes do primeiro acesso. Nunca abrir as regras para acesso anonimo por conveniencia.
