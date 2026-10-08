# Retomada local MSA - encerramento de 07/10/2026

Atualização local de 08/10/2026: leia também [a revisão de login, textos e limites](docs/REVISAO_LOGIN_LIMITES_2026-10-08.md). Ela registra as mudanças solicitadas depois deste encerramento e as verificações realizadas. O conteúdo abaixo conserva o estado da entrega de 07/10; a revisão de 08/10 ainda é local.

Este arquivo reúne o contexto desde a primeira mensagem de retomada de hoje até a publicação final. É um novo documento local de continuidade, criado depois do commit abaixo; não foi incluído naquela publicação.

## Prompt para enviar ao próximo agente

Vamos continuar o projeto MSA Brasil da equipe amarela. Trabalhe primeiro por leitura e verificação do estado atual; não reinicie o projeto, não refaça entregas concluídas e não peça novamente aprovação da especificação NHPL ou do brainstorming já implementado.

Repositório: https://github.com/kauanoIiveira/msa
Branch: master
Último commit publicado e conferido nesta sessão:
69f674ae35f6265a3998deff90778b90e0bfcaff
Mensagem: Finaliza os fluxos NHPL e reúne os materiais da apresentação.

### 1. Localização e estado Git

- A implementação foi feita em C:\Users\Kauan\Desktop\msa-master. Essa pasta é uma cópia extraída e NÃO possui .git.
- O checkout com histórico Git está em C:\Users\Kauan\Documents\ChatGPT\Desafio de Ideias.
- Para publicar, o checkout Git foi atualizado por fast-forward até a master remota existente. Depois, os arquivos novos/alterados da cópia Desktop foram copiados sem apagar materiais anteriores.
- Foram publicados 189 arquivos novos/alterados. HEAD e master remota foram conferidos iguais; o checkout Git estava limpo, sem arquivos versionáveis pendentes.
- Este documento foi criado depois dessa conferência e existe apenas localmente na cópia Desktop.
- Antes de usar Git, confirme a pasta atual, branch, remoto, status e eventuais mudanças posteriores. Nunca presuma que a pasta Desktop virou um checkout.
- Não reescreva o histórico, não use reset destrutivo e não sobrescreva mudanças do usuário.
- O push foi autorizado e executado nesta sessão. Isso NÃO autoriza novos pushes, deploy de site/Firebase ou instalação industrial automaticamente.

### 2. Ordem de leitura

Comece pelo estado mais recente:
1. docs/ENTREGA_BRAINSTORM_FINAL_2026-10-07.md
2. docs/GUIA_FUNCOES_MSA_2026-10-07.md
3. docs/ROTEIRO_PAGINAS_MSA_2026-10-07.md
4. docs/ENTREGA_NHPL_COMPLETA_2026-10-07.md
5. RETOMADA_2026-10-07.md e PROMPT_RETOMADA.md
6. docs/superpowers/specs/2026-10-07-nhpl-entrega-completa-apresentacao-design.md
7. docs/superpowers/specs/2026-10-07-nhpl-produtividade-design.md
8. docs/BRAINSTORM_FABIANA_MSA_2026-10-07.md
9. docs/RESPOSTAS_FABIANA_MSA_2026-10-07.md e referencias-locais/contexto-historico/2026-10-07-respostas-fabiana-complemento.txt
10. docs/ACESSOS_E_AUDITORIA_MSA_2026-10-07.md, docs/MAPA_FONTES_LOCAIS.md e docs/continuidade/2026-10-06/ENUNCIADO_TRANSCRITO.md

Leia o código e os testes correspondentes antes de alterar comportamento. Documentos históricos preservam o estado de quando foram escritos: frases como "aguardar", "ainda não implementado", "sem push" ou "celular pendente" podem estar superadas pelas entregas posteriores e pelo encerramento descrito aqui. Não apague a história para resolver essa diferença.

### 3. Decisões industriais que não podem se perder

- Piloto: NHPL.
- Linha: Montagem.
- Processo: Processo de montagem do abafador.
- Produtos/famílias: Abafadores VGARD HP e MARK V, variantes Low / Medium / High conforme fontes.
- Preservar máquinas, parâmetros, registros e estudos históricos T20/selos. Não renomear essas medições para NHPL nem transferir os 41 parâmetros de selos para a NHPL.
- Produtividade = produção bruta realizada / plano aprovado x 100.
- Meta inicial: 95%, com contexto, vigência e revisão.
- Takt informado: 12 segundos por peça. Pode sugerir planejamento pelo tempo líquido; o plano aprovado prevalece.
- Uma hora líquida sugere 300 peças e mínimo de 285 para a meta, não uma medição automática.
- Paradas imprevistas não reduzem retroativamente o plano.
- Não aplicar 95% indiscriminadamente a outros indicadores.
- Takt não é automaticamente o ciclo ideal do OEE.
- Não transformar ausência de dados em zero nem distribuir produção entre horas sem evidência.
- Separar produção bruta, boas, refugo em peças e perda de material em kg.
- Limites reais de parâmetros NHPL, ciclo ideal real e classificação/inspeção industrial continuam pendentes de validação. Não inventar valores para preenchê-los.
- SIEMENS SIMATIC HMI é uma pista sobre a interface, não confirmação suficiente do modelo completo da máquina, protocolo ou disponibilidade de automação.

### 4. O que foi entregue hoje

Planejamento e produção:
- Planos por contexto/período, prévia, aprovação, revisões e intervalos hora a hora.
- Registros/incrementos, confirmação, reconciliação e encerramento rastreável.
- Quatro horários separados: máquina ligada, produção iniciada, produção encerrada e máquina desligada. São registros manuais, não comandos físicos.
- Paradas com motivo prioritariamente por seleção, abertura/encerramento e duração.
- Refugo/perda, peças boas e ocorrências.
- Correções auditadas preservam original; outra pessoa decide a proposta.
- Revisão de plano com apontamentos é bloqueada conforme o contrato desta entrega.

Indicadores e captura:
- Motor de disponibilidade, desempenho, qualidade e OEE, condicionado às bases completas e referências técnicas.
- MTBF/MTTR/taxa de falha condicionados a exposição e classificação confiáveis.
- Memória de cálculo e diagnósticos para bases ausentes, parciais, conflitantes ou impossíveis.
- Importação de eventos JSON e conector opcional de pasta local; fila idempotente, conflitos, sequência, lacunas, contador e reinício.
- Retorno do sinal de funcionamento não encerra parada sem peça boa validada.
- Nenhuma ligação física com a NHPL foi instalada ou comprovada.

Engenharia, CEP e cadastros:
- Nova análise, detalhes, evidências, revisão, correção e decisões com ações explícitas.
- Cadastros produtivos graváveis conforme papel; removido seletor operacional/apresentação que prejudicava o fluxo.
- NHPL com catálogo próprio e contexto correto.
- Cp/Cpk na interface principal; estudo NHPL exige ao menos 30 amostras e referências válidas.
- Pp/Ppk preservados no legado, fora da tela principal; não apagar contratos históricos.
- Nova referência CEP vem preenchida pela referência do estudo selecionado; em outras entradas, pela última aprovada. Sem referência não inventa valores. Cria rascunho com envio explícito, nunca aprovação automática.

Brainstorming final implementado:
- Dashboard com dois gráficos: plano/bruta registrada/mínimo por intervalo e plano/bruta acumulados.
- Sem rateio, interpolação ou zero inventado; lacunas interrompem acumulado e conflitos não viram resultado válido.
- Removida a faixa repetida de apresentação/armazenamento e os atalhos repetidos do Dashboard e dos Apontamentos, inclusive "Ligar máquina" e Planejamento.
- Coleta manual de parâmetros permanece em Parâmetros.
- Apontamentos com produção, refugo/perda, quatro horários, resumos separados e paradas enriquecidas.
- Intervalos confirmados/retirados não aparecem como disponíveis para novo registro; ausência de intervalo tem mensagem apropriada.
- Histórico enriquecido com contexto, autor, origem, correções e referências.
- Corrigido erro ao abrir comparação de correção na Engenharia, normalizando na leitura sem reescrever armazenamento original.
- Backup removido das páginas de trabalho e mantido em Configurações.
- Página Coleta saiu do menu principal; fluxo preservado como Importação de dados em Configurações.
- TV saiu do menu principal; botão em Indicadores, com retorno a Indicadores.
- Configurações sem e-mail visível: RE imutável, nome, cargo/acesso confiável e troca de senha.
- Layout responsivo: gráficos empilham, textos cabem e tabelas/formulários rolam nos próprios contenedores.

### 5. Perfis e conta da apresentação

- A apresentação usa Administração, com todas as funções operacionais e técnicas dos demais papéis.
- Engenharia agrupa responsabilidades de líderes, supervisores e técnicos de Produção, Processo, Qualidade e Manutenção conforme o papel autorizado.
- Operação tem experiência própria: registrar produção/parâmetros/paradas/refugo/perdas/ocorrências, consultar, encaminhar e propor correção. Não decide referências/planos ou aprova propostas.
- Consulta é somente leitura.
- Ninguém, nem Administração, aprova a própria correção.
- RE/cargo exibido não concede acesso; membership confiável concede o papel.
- REs documentados: 00000 Administração, 00001 Engenharia, 00002 Operação, 00003 Consulta. Isso não substitui conferir o papel atual da conta real.
- Não elevar permissões, criar contas ou alterar senhas por conveniência.
- Credenciais devem ser obtidas com o responsável, fora dos arquivos e do Git.
- QA usou autenticação fictícia isolada: não prova a senha ou membership atual da conta real na nuvem.
- O usuário dispensou trabalho adicional de login por aba e pode usar dois navegadores. Não implementar autenticação por aba sem nova necessidade.

### 6. Dados e apresentação

- Uma base local persistente de apresentação: msa.nhpl.presentation.v3.
- Inclui duas famílias, planos, hora a hora, perdas, paradas, análises e ocorrências.
- VGARD HP: quatro intervalos confirmados e 60 coletas; MARK V: dois intervalos confirmados e 30 coletas; intervalo adicional para registro manual.
- Parâmetros didáticos, limites e ciclo ideal de 10 segundos dos exemplos são hipotéticos identificados, NÃO limites/ciclo reais aprovados da fábrica.
- Retirar textos repetidos não significa ocultar a origem: manter proveniência em detalhes, CEP/OEE e exportações.
- Browsers/origens/computadores diferentes não compartilham automaticamente essa base. Registro do operador em Edge não aparece automaticamente no Chrome do administrador.
- Backend compartilhado real continua fora dessa implantação local.
- Antes de limpar armazenamento ou trocar computador, exportar backup. Não publicar backups de usuários.
- Clone/pull transfere arquivos, não banco Firebase nem dados locais do navegador.

### 7. Concorrente e fontes

- MSE analisado em C:\Users\Kauan\Pictures\MSE por código, testes e telas com fixtures.
- Relatório: docs/COMPARACAO_MSA_MSE_2026-10-07.md.
- Diagnóstico: mensagem de senha mínima de 6 era incompatível com política pública de 8, maiúscula, minúscula e número; não foi identificado npm faltante no login.
- Usuário confirmou cadastro após ajuste. A conta real com RE exato de 11 dígitos não teve acesso concluído na análise; cliente local limita a 10. Não afirmar acesso ao Firebase privado.
- Comparação inicial favoreceu MSA em planejamento, CEP e rastreabilidade; MSE em supervisório visual/3D, TV e telemetria. É diagnóstico anterior às melhorias finais, não prova de superioridade industrial absoluta.
- Originais do concorrente preservados; cópia temporária de testes não publicada.
- Material industrial: C:\Users\Kauan\Desktop\Grupo Amarelo - MSA Brasil\MSA - Material Fornecido e fontes preservadas em referencias-locais/.
- Complemento de perguntas: C:\Users\Kauan\Downloads\+20 Perguntas Respondidas.txt.
- Metodologia pitch: C:\Users\Kauan\Downloads\Cronograma-Metodologia-Pitch.pptx.
- Priorizar respostas completas recentes de Fabiana sobre entrevista parcial. Fotos e planilha de selos não homologam parâmetros/OEE NHPL.

### 8. Documentos e equipe

Documentos entregues em docs/:
- Briefing_Pitch_MSA_2026-10-07.docx: problema, solução, desenvolvimento, concorrência, diferenciais, viabilidade técnica/econômica e equipe.
- Guia_Funcoes_MSA_2026-10-07.docx: funções por página, linguagem não técnica.
- Roteiro_Paginas_MSA_2026-10-07.docx: falas breves e o que mostrar por página.
- Fontes Markdown e scripts/evidências de renderização também preservados.
- Kauan e Riquelme: sistema. Samuel: automação. Maria Clara e Beatriz: apresentação.
- Não apresentar estimativas de investimento/ROI ou melhorias previstas como resultados financeiros medidos.

### 9. Verificação concluída

Na publicação final, comandos executados no checkout Git:
- npm test: 148 aprovados, zero falhas.
- npm run test:emulator: 20 aprovados, zero falhas, Auth/RTDB em projeto demo isolado.
- npm run verify:static: 76 arquivos, zero erros.
- Código/documentos sem erros de whitespace no diff; logs de evidências preservam formatação original.
- Sem credenciais detectadas na varredura do conteúdo novo/alterado; dependências, runtimes, caches e logs debug ficaram fora.
- Navegador QA administrativo: principais fluxos de registro, confirmação, parada, horários, cadastro, referências, análise/correção, backup, importação e TV exercitados.
- Layout conferido em 320/390 px e desktop 1440 px, sem overflow de página; não equivale a teste físico em celular.
- DOCX renderizados via Word e páginas revisadas visualmente.
- Troca de senha coberta em testes de serviço; senha real não alterada.
- Não houve deploy de regras, implantação em fábrica nem validação de integração física.

### 10. Como iniciar e continuar

Na pasta escolhida, confira o estado antes de instalar dependências. Node >=22.

PowerShell:
    npm ci --ignore-scripts
    npm run prepare:vendor
    $env:PORT = '5175'
    npm start

Se já houver servidor na porta, confirme qual pasta ele serve antes de reutilizá-lo. Acesse http://127.0.0.1:5175/. O servidor atual usa loopback: celular físico não consegue acessar esse endereço do computador. Acesso por rede exige uma configuração separada e segura, não foi ativado.

Verificações:
    npm test
    npm run verify:static
    npm run test:emulator

Emuladores exigem Java compatível; nesta máquina funcionou:
    $env:JAVA_HOME = 'C:\Program Files\JetBrains\PyCharm 2026.1.4\jbr'
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"

Conector de apresentação é opcional, usa exemplos, não máquina real:
    npm run capture -- --directory output/nhpl-capture
    npm run capture:demo

Não execute capture:demo, importações ou geradores apenas para ler o projeto; eles produzem eventos. A conexão é explícita em Importação de dados e depende da origem permitida.

Ao retomar, relate brevemente pasta/commit verificados, o que está pronto e pendências reais. Depois aguarde o próximo pedido ou implemente somente a mudança solicitada. Preserve histórico, permissões, unidades, contexto e proveniência. Não repita aprovação já concedida e não assuma que tudo está homologado na fábrica.

