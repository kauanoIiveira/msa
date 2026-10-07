# MSA — conhecimento consolidado em 06/10/2026

**Complemento posterior à consolidação:** o usuário forneceu uma possível transcrição parcial, sem garantia de exatidão. [ENTREVISTA_PARCIAL_ANALISE.md](ENTREVISTA_PARCIAL_ANALISE.md) registra as novas pistas e o cruzamento com o aplicativo. Hora a hora e microparadas passam a ser prioridades recomendadas com base nesse texto provisório, à frente de comparativos/relatórios mais elaborados. O áudio original não foi conferido e o piloto permanece pendente. O conteúdo anterior abaixo foi preservado como histórico da revisão inicial.

## 1. Evidência e grau de certeza

Esta revisão usa seis classes: **observado na fonte** (texto, célula, imagem ou código), **declaração confirmada da empresa** (somente com autoria e conteúdo identificáveis), **decisão anterior da equipe/usuário**, **hipótese**, **proposta/rascunho** e **pendência**. A origem empresarial de um arquivo não equivale à homologação de todo limite nele existente. Documentos produzidos pela equipe não são depoimentos da empresa.

O enunciado entregue pelos organizadores é a fonte do problema e dos requisitos. A entrevista pode acrescentar contexto, mas não foi processada nesta sessão. Nenhuma conclusão deste documento depende de uma suposta fala da gravação.

Fontes e hashes completos estão em [FONTES_E_COBERTURA.md](FONTES_E_COBERTURA.md) e `evidencias/`. O prompt original foi preservado integralmente; suas perguntas já foram feitas, segundo o usuário. Não houve mensagem enviada nesta revisão.

## 2. Problema, processo e pessoas

**Observado no enunciado:** a coleta é parcialmente manual. São fotografados parâmetros da IHM e depois transcritos para Excel. Quantidade produzida, períodos, paradas, duração, motivos, refugos e perdas precisam ser consolidados. A Engenharia verifica limites, desempenho e CEP, incluindo Cp/Cpk, para apoiar decisões e liberação da produção. O objetivo é tornar esse trabalho mais ágil, confiável e visual, reduzindo atividades manuais.

**Observado no material:** coexistem uma planilha de estudo de capacidade de selo, uma IHM KVIEW com 21 zonas, instrumentos analógicos, uma IHM Siemens de linha de abafadores com estações, Pitch Board e ficha de perdas. Isso sustenta a necessidade de contexto explícito e de não misturar kg, peças, ciclos, alarmes e episódios de parada. Não define um piloto único nem demonstra que todos esses materiais pertencem à mesma máquina ou receita.

**Ainda sem confirmação:** quem fotografa/digita e com qual frequência; tempo gasto; falhas de transcrição efetivamente medidas; objeto exato da liberação; responsabilidades, exceções e turnos; formato dos arquivos disponíveis; política de uso e rede. Não foi documentada uma linha de base de melhoria ou economia.

**Personas em rascunho:** `Rascunhos Persona` contém análises técnicas, propostas, auditoria, CSVs e preparação de entrevista, não fichas de personas formalmente validadas. Os papéis abaixo são uma organização da equipe, sustentada pelas tarefas/enunciado/roteiros, e precisam de confirmação:

| Papel considerado | Tarefa e necessidade | Grau de validação |
|---|---|---|
| Operação/produção | Selecionar contexto, registrar leituras, produção, paradas e perdas com pouco retrabalho | Tarefas propostas; pessoa, frequência e dispositivo pendentes |
| Engenharia/Qualidade | Aprovar referência, avaliar desvios, consultar histórico e registrar decisão | Engenharia aparece no enunciado; alçadas e método pendentes |
| Manutenção/Automação/TI | Confirmar equipamento, interface, tags, rede e acesso autorizado | Dependência técnica proposta; disponibilidade pendente |
| Gestão/melhoria contínua | Acompanhar perdas, produção, motivos e prioridades | Persona proposta; três resultados prioritários pendentes |
| Administrador do sistema | Manter cadastros e acesso por papel | Papel já implementado; responsável da empresa pendente |

Fabiana Stoicov e sua função de Coordenadora de Engenharia Industrial da MSA - The Safety Company foram informadas pelo usuário. O SOBRE permanece literal em `SOBRE_FABIANA_ORIGINAL.txt`, inclusive contatos. Ele descreve experiência ampla, inclusive automotiva; não comprova que todos esses processos fazem parte da operação atual da MSA. “Fabiana Dias”, nome de conta de teste em documentos/código, não comprova identidade com Fabiana Stoicov.

## 3. Planilha — conferência com o original

Fonte: `C:\Users\Kauan\Desktop\Grupo Amarelo - MSA Brasil\MSA - Material Fornecido\T20A03(EN)5 - Capability study senai.xlsx`, SHA-256 `6a030b82f7dc32c6bd05a43a426344c72683fad61495aab70dbc13406ea11c8e`.

O nome encontrado no disco é **MSA - Material Fornecido**; o pedido usa “Material Fornecido pela empresa”. Ambos foram registrados sem renomear a fonte. Todas as células preenchidas, fórmulas, valores salvos, formatos, comentários e mesclagens das duas abas foram extraídos em modo de leitura. Não houve salvamento da planilha nem recálculo integral em Excel.

| Verificação | Resultado observado | Localizador |
|---|---|---|
| Abas | `Selo ` e `Normality test `, ambas com espaço final | `evidencias/indice_planilha.json` |
| Estrutura | Selo: 310 × 87, 5.001 células preenchidas, 3.910 fórmulas; Normality: 1.209 × 37, 8.022 preenchidas, 6.005 fórmulas | Extrações integrais por aba |
| Parâmetros | 41: 21 zonas e 20 outros campos; destes, 15 têm unidade `seg` | Selo, linha 9 e linha 12; tabela integral em `resumo_planilha_conferido.json` |
| Coletas | 17 linhas de 25/08 a 29/09/2026; há duas linhas em algumas datas e intervalo sem registros | Selo, A17:A33 |
| Campos | 697 possíveis; 683 preenchidos: 562 números e 121 textos numéricos; 14 vazios | Selo, parâmetros nas linhas 17:33 |
| Metadados | Material, espessura, % scrap e lote vazios nas 17 linhas; não há horários de coleta suficientes para reconstruir frequência/subgrupos | Selo, B17:E33 |
| Origem das referências | Nome/limites/unidade nas linhas 9/10/11/12; identificadores de 1 a 42 sem 23 | Selo, cabeçalhos |
| Meta literal | `1,33` aparece no arquivo; não é aprovação industrial documentada | Selo, U6 |
| Fórmulas de resumo | Usam 17:67, porém só 17:33 preenchidas; resumo depende de a célula da linha 17 estar preenchida | Exemplo BF69:BF74; CF/CH |

### Limites e semântica que não podem ser corrigidos por suposição

- **BH10/BH11 = 80/75**, Tempo Contra molde: faixa invertida no original. Preservar e pedir confirmação; não trocar automaticamente.
- **H, X, Z e AP**, zonas 1, 9, 10 e 18: limites 0/0. Isso não prova que estejam desativadas.
- **CF10 = texto “6,5”, CF11 vazio**, Pressão Ar em bar. Não inventar teto nem aprovar limite unilateral só porque a planilha o exibe.
- **CH10 = -600, CH11 vazio**, Vácuo em `mm/Hg`. Direção da desigualdade e convenção do sinal precisam da Engenharia.
- As 21 zonas podem ser valores medidos ou ajustes; os tempos também podem ser setpoints. A foto com duas colunas coloridas não mostra legenda legível suficiente para decidir isso.
- Não comparar automaticamente pressão analógica com a coluna bar: a unidade do mostrador precisa ser confirmada. O vácuo observado na foto é outra observação, sem data/contexto equivalentes às linhas da planilha.

### Falhas do modelo da planilha e interpretação estatística

121 valores estão armazenados como texto; as 41 células de cada uma das duas linhas de 31/08 são texto. Nas fórmulas com referências, isso altera o conjunto usado pelas médias/dispersões. Exemplo **BF17:BF33**, Tempo destacar: existem 17 valores interpretáveis, sete 0,8 e dez 0,9. A média de todos é aproximadamente 0,8588235294 s e o desvio populacional 0,0492152957 s. A fórmula salva considera sete números nativos, todos 0,9, e o resíduo numérico da dispersão gera um Cp gigantesco sem significado de qualidade extraordinária. O recálculo desse exemplo foi repetido nesta revisão e guardado em `evidencias/recalculo_exemplo_planilha.json`.

O arquivo usa `STDEVP` nos resumos. Uma fórmula calculável não comprova estabilidade do processo, adequação de normalidade, subgrupos, resolução, natureza da variável ou método industrial adotado. Cp/Cpk aritméticos não homologam liberação. Campos constantes devem produzir indisponibilidade de capacidade, não índices infinitos.

**CF17 e CH17 vazios** deixam resumos em branco apesar de dez leituras posteriores em cada coluna. A pressão interpretada tem nove 6,6 e um 6,8; o vácuo tem valores de -600 a -300. Essa presença de dados não resolve a regra de conformidade unilateral.

Na aba **Normality test**, B10:B1009 está vazia, AE6 é zero, K5 contém valor literal, AC10:AC1009 contém constantes, e há erros salvos. O `OK` literal em Selo!G93 não demonstra uma validação de normalidade conectada à série. Não foi identificado vínculo externo de planilha ou nome definido que resolva essa falta de entrada.

Há mudanças fortes no Tempo de Resfriamento e Retardo de resfriamento em setembro e leituras 94 °C em AF28 e 101 °C em AH28. Registrar como valores existentes, sem atribuir causa: setup, erro de digitação, mudança de receita e falha física não estão confirmados.

A auditoria anterior registra 36 `NOK`, 3 `DIV/0` e 2 vazios nos 41 status salvos. Isso descreve saídas do modelo dessa cópia, não máquinas defeituosas, peças rejeitadas ou lotes reprovados. Também registra 224 resumos finitos recalculados com concordância. Esse teste de 224 é **evidência histórica**; nesta rodada foram conferidos os hashes das 12 fontes da extração, a estrutura, todas as células extraídas, os totais e o exemplo BF, sem alegar recálculo completo das 9.915 fórmulas.

As duas tabelas anteriores (`auditoria_41_parametros.csv`, 41 registros; `medicoes_697_campos.csv`, 697 registros) foram lidas por inteiro e são idênticas às cópias de `entrega/`. Preserve seus dados originais e o tipo de célula. Se houver importação futura, declarar contexto e conversão decimal em prévia, sem fabricar horários.

## 4. Fotos da empresa — o que mostram e o que não resolvem

Pasta: `MSA - Material Fornecido`. Todos os nomes abaixo são `WhatsApp Image 2026-10-05 at [horário].jpeg`; o horário é do nome do arquivo, não necessariamente da leitura industrial.

| Foto | Informação visual observada | Interpretação e pendências |
|---|---|---|
| 12.12.45 | Painel KVIEW/Vacuum Center, opções Forno/Manual/Receita/Seletoras/Tempos/Ciclo/Retardos; contador 18; manômetro e vacuômetro | O contador é de ciclos; não converter em peças sem cavidades, regras e reset. Marca/tela não confirma acesso ao CLP |
| 12.13.44 | Pitch Board 01/10/2026, 1º turno, realizado parcial 1.152; parcelas 72, 216, 180, 144, 180, 72, 108, 180; operadores real 6/ideal 5 | Planejamento manuscrito e produto não estão legíveis o bastante para calcular desempenho confiável. Campo de refugo vazio não é zero. Setup às 10:00 e retorno aparente 10:40 permitem hipótese de 40 min, a confirmar; parada 12:40 sem término visível |
| 12.14.06 | SIMATIC, Modo Manual Estação E030; seis alarmes pendentes, incluindo emergência, falhas de avanço/recuo, portas e pressão de ar | Alarme não equivale a episódio único de parada, duração nem causa raiz. Hora PM sem confirmação de data/sincronização |
| 12.15.26 | Dispositivos amarelos junto a proteções/estações 040/050/060/070 | Função e modelo não confirmados. Não provar disponibilidade dos sensores indutivos propostos |
| 12.16.05 | Painel elétrico, módulos Siemens, cabos/conectores D-sub e identificação KSEG | Não inferir protocolo, modelo, mapa de memória, tags, credenciais ou permissão pelo fabricante/cor dos cabos |
| 12.17.22 | SIMATIC “PN10190358 - ABAF ALTO,TIPO14”; estações de 10 a 140, linha geral; aprovadas 0/rejeitadas 0 no instante | Contexto de abafadores distinto do estudo de selos. Zero na tela não prova zero no turno. Vermelhos de emergência e linha geral verde exigem entender semântica |
| 12.20.02 | Ficha “Coleta de dados Selo VGHP e MARKV”, 28/09/26 e 29/09/26, 1º turno; Selo Rompido, Selo Enrugado, Perda Laminado KG, Outros; 0,200 kg e anotação “S/espuma” | Kg não é quantidade de peças. Confirmar abreviação e taxonomia. Campos em branco significam ausência; categorias visíveis não são lista oficial completa |
| 12.20.38 | KVIEW, 21 zonas °C em duas colunas coloridas, aquecimento ON | Compatibilidade com a planilha é plausível; falta legenda de medido/ajustado, relação com máquina/receita e confirmação do piloto |
| 12.24.58 | Pressão analógica aproximadamente 6,5–6,6 na escala preta; vácuo aproximadamente -350 a -360 mmHg | Leitura visual aproximada. Unidade de pressão parcialmente obscura, aparentemente kgf/cm²: não tratar automaticamente como bar nem registro validado |

O manuscrito do produto no Pitch Board é incerto; não igualar silenciosamente ao PN10190358 de outra tela. As imagens indicam múltiplos contextos, não um cadastro validado de máquinas.

## 5. Demais fontes, perguntas e propostas

- **Dossie_MSA_SENAI_2026.pdf, 17 páginas:** proposta e preparação anterior, com nome “NexoProdução” e ideias como QR/fotos/offline. Não é identidade aprovada nem prova de implementação. A falta de material interno mencionada em uma etapa do dossiê precede os arquivos posteriormente recebidos. Perguntas e anexos foram preservados integralmente na extração.
- **Analise_Materiais_MSA_2026.pdf, 22 páginas:** análise anterior dos materiais, evidências, hipóteses e requisitos propostos, inclusive granularidade por estação. Não confirma que o piloto precise abranger selos e abafadores. O domínio atual não tem cadastro explícito de estação; essa necessidade requer escopo antes de mudança.
- **Preparacao_Entrevista_MSA_06-10-2026.pdf, 8 páginas:** cinco perguntas prioritárias e matriz de decisões a preencher. Uma matriz em branco não é resposta da empresa.
- **AUDITORIA_TECNICA_MSA.md e ROTEIRO_ENTREVISTA_MSA.md:** textos completos preservados, respectivamente auditoria rastreável e roteiro de perguntas. Não atribuir automaticamente a Fabiana os pareceres técnicos da equipe.
- **Perguntas para o Persona.docx e Google Doc nativo:** 12 questões, divisão entre integrantes e exemplos. Preservados como perguntas. Alguns exemplos, como “Sem Espuma”, desenvolvem abreviações; confirmação operacional ainda é necessária.
- **Roteiro_Entrevista_MSA_Equipe_Amarela.docx:** organização de reunião e prioridades, não respostas. **Roteiro_Apresentacao_Funcoes_MSA.docx:** descrição das sete telas e 11 cenários; deve acompanhar o código se houver mudanças futuras. As cópias locais de ambos são byte a byte idênticas às de `docs/`.
- **O que deve conter no Dashboard.docx/Google Doc:** lista da equipe com os 41 parâmetros, dúvidas sobre as zonas, contramolde “sic” e ausência de limite superior de pressão/vácuo. Corresponde à referência, não a limites homologados.
- **Matriz de Prioridade, Captura de tela 2026-10-06 102815.png:** priorização visual da equipe. Alto valor/menor complexidade: contexto, cadastros, validação de valor/unidade/ausência, limites aprovados, consolidação, dashboard e histórico/Engenharia. Alto valor/maior complexidade: CLP, contadores, detecção de paradas, alarmes, OCR, offline e CEP validado. Temas e QR que só abre site aparecem com menor valor. Não é avaliação oficial da MSA nem rubrica dos organizadores.

### Instrumentação e alegações de ganho

`Lista de Materiais e ganho de produção.docx` e o Google Doc nativo propõem oito linhas de investimento: concentrador, pressão, vácuo, leitura térmica, quatro sensores/acopladores, botoneira Andon, torre LED e instalação/calibração. A soma é R$ 8.250 por “máquina/injetora”, nome usado no documento; não define o tipo real do piloto.

O documento afirma detecção no primeiro segundo, baseline de 30–45 min por evento, redução de MTTR de 40–60%, economia mensal de R$ 2.200–3.800, payback de 2,2–3,8 meses, +5% OEE e ROI anual de +220–450%. **São cenários não validados nesta base.** Não há evidência de medição, orçamento de fornecedor, compatibilidade/interfaces, dispositivos disponíveis ou teste de latência que permita apresentá-los como ganho real. A soma/payback são aritmeticamente coerentes sob suas premissas, mas as premissas não foram confirmadas. O texto original “Ganho Real” foi preservado, com esta ressalva documental explícita.

O documento menciona “17 tempos”; a planilha tem 15 campos com unidade `seg`, além de medida/velocidade do passo e outros campos. A discrepância precisa de explicação; quatro sensores não comprovam instrumentação automática de todos os 41 parâmetros. RS-485/Modbus, ESP32 e CLP IoT são propostas de arquitetura, não interfaces confirmadas por foto.

## 6. Estado do sistema existente

Checkout: `C:\Users\Kauan\Documents\ChatGPT\Desafio de Ideias`. Aplicativo modular HTML/CSS/JavaScript, Firebase Auth/Realtime Database, bibliotecas locais e telas Dashboard, Parâmetros, Apontamentos, Engenharia, Histórico, Cadastros e Configurações. Fontes: `app/index.html`, `app/src/ui/main.js`, `forms.js`, `consultation.js`, `app/src/services/`, `app/src/domain/`, `app/src/repositories/`, `app/src/io/csv.js` e contratos em `docs/CONTRATOS_FUNCIONAIS.md`.

### Decisões anteriores recuperadas e conferidas no código

- Entrada direta no dashboard; `index.html` raiz também encaminha quando aberto como arquivo. Conexão Firebase sob demanda. Operações privadas requerem autenticação, membership e papel; a entrada aberta não autoriza gravação anônima.
- `app/src/ui/operational-workspace.js` usa `workspaceId='msa'`; `emptyDashboard()` mantém 41 referências com `latest:null`, estatísticas/séries/alertas vazios, totais nulos e cobertura incompleta. Ausência não deve virar zero nem leitura saudável fictícia.
- Fixtures sintéticas separadas da inicialização operacional; `simulation.js` usa repositório em memória, `origin:'demo'` e `source.file:'simulacao-local'`, com 11 cenários descartáveis. T20 é máquina sintética de teste, não coleta nem piloto validado.
- Catálogo MSA preserva nome/unidade/origem/faixas e pendências. Instalar exige processo já cadastrado, papel administrador, confirmação e natureza `measurement`/`setpoint` explícita por parâmetro. Instala rascunhos; não cria leitura nem homologa faixas. Zonas, contramolde e direção do vácuo continuam pendentes.
- Contexto coerente: máquina → processo ligado por `machineId` → produto associado por `processIds`. Registro contém `machineId`, `processId`, `productId`; receita/lote/ordem/turno são informados quando aplicáveis, sem adivinhação.
- Coleta preserva entrada original, interpreta decimal vírgula/ponto, distingue válido/ausente/inválido e vincula versão de limite, autor e origem. Unidades e versões não são misturadas por conveniência.
- Produção declara base bruta/boa e período; perdas distinguem peças/kg e tipos; parada tem início/fim e motivo rastreável. Mudanças de motivo requerem correção, preservando o registro original.
- Engenharia tem estados waiting → analyzing → approved/rejected, justificativa e trilha de transições; correções preservam original e exigem decisão conforme papel. Uma decisão na aplicação não aciona ou libera fisicamente equipamento.
- Histórico oferece filtros, paginação, abas e exportação CSV. Consultas podem ter cobertura parcial; minutos de paradas sobrepostas usam união, paradas abertas não têm duração final e quantidades não são rateadas automaticamente por janelas parciais.
- Cp/Cpk são estimativas com método declarado e `homologated:false`; n insuficiente, dispersão zero e faixa inadequada retornam indisponibilidade. Não há homologação industrial nem teste de normalidade entregue.

### Requisitos mínimos confrontados com o código

“Implementado” abaixo significa encontrado no código/serviços e coberto pela verificação disponível, sem declarar aceitação da MSA ou nova validação da nuvem. A redação literal está em `ENUNCIADO_TRANSCRITO.md`.

| ID | Requisito mínimo | Evidência atual | Limite ou dependência |
|---|---|---|---|
| M01 | Cadastro de máquinas, processos e/ou produtos | Cadastros, `services/registry.js`, contexto relacional | Cadastrar piloto real após confirmação |
| M02 | Cadastro dos parâmetros e dados de produção | Parâmetros, catálogo de 41 referências, formulários | Referências são rascunhos; natureza e aplicação dependem de Engenharia |
| M03 | Limites ou metas | Limites versionados e metas, `domain/limits.js`, registry/catalog | Resolver faixas ambíguas; homologação pendente |
| M04 | Registro digital dos dados coletados | Nova coleta, `ui/forms.js`, `services/operations.js` | Coleta manual funcional; integração automática ausente |
| M05 | Produção: quantidade e período | Apontamento de produção e indicadores | Regras de ciclos/peças/reset ainda não definidas pela empresa |
| M06 | Paradas: duração e motivo | Iniciar/encerrar parada, operações e histórico | Confirmar início/fim, taxonomia e alarmes; aberta não tem total final |
| M07 | Refugos/perdas e motivos | Tipos de perda com unidade e motivo | Kg e peças separados; categorias da empresa pendentes |
| M08 | Organização/armazenamento estruturado | Serviços/repositório Firebase e regras locais | Estado/regras implantadas na nuvem não revalidados nesta rodada |
| M09 | Associação à máquina/processo/produto | `domain/context.js`, validação de relações | Receitas/lotes/ordens/turnos reais dependem de cadastro/definição |
| M10 | Histórico para consulta/análise | `services/history.js`, `ui/consultation.js` | Cobertura parcial e recortes indicados; não omitir limitações |
| M11 | Dashboard/indicadores/gráficos | `domain/dashboard.js`, indicators, charts, UI | Não inventar KPI em base vazia; CEP não homologado |
| M12 | Identificação visual de desvios/críticos | Avaliação de limites/metas e alertas internos | Regra aprovada necessária; não é andon físico ou push externo |
| M13 | Demonstração de fluxo funcional | Sete telas, serviços e simulador local | Preparar caso coerente; validar roteiro e critério de aprovação com empresa |

### Diferenciais opcionais — estado real

| ID | Diferencial da folha | Estado e limite |
|---|---|---|
| O01 | OCR de fotos | Não implementado; requer fotos/teste/aceitação e revisão humana |
| O02 | Coleta direta CLP/IHM | Não implementada; fabricante na foto não confirma acesso/protocolo |
| O03 | IoT | Não implementado; sensores e orçamento propostos não comprovam disponibilidade |
| O04 | QR Code | Planejado, não entregue |
| O05 | Alertas de parâmetros | Alertas internos por avaliação de registros/limites; sem leitura contínua de máquina |
| O06 | Alertas Cp/Cpk/metas | Avaliação de metas/estimativas existe; CEP industrial não homologado |
| O07 | Alertas paradas/refugos/perdas | Indicadores/metas internos; sem monitor permanente ou envio externo |
| O08 | Motivos de parada/refugo | Cadastros e ranking/Pareto; taxonomia oficial pendente |
| O09 | Fluxo Engenharia | Estados/justificativa/trilha implementados; sem liberação física |
| O10 | Histórico de análises/ocorrências | Implementado nas consultas e serviços; objeto de liberação a confirmar |
| O11 | Tablet/smartphone | Interface responsiva; dispositivo e condições da fábrica não validados |
| O12 | Tempo real | Observação Firebase quando conectado; não coleta automática de equipamento |
| O13 | Comparações | Serviço presente; fluxo visual completo pendente |
| O14 | Exportação automática | CSV por ação do usuário disponível; geração/envio programado não demonstrado |
| O15 | IA | Não implementada; hipótese sem prioridade confirmada |
| O16 | API/integração futura | Serviços JavaScript internos estruturados; API externa integrada/documentada não entregue |

Importação CSV tem prévia e confirmação nos serviços; não há fluxo visual completo nem importador XLSX direto. Solicitação de correção também existe no serviço, mas o fluxo visual completo de abertura está pendente; consulta/decisão são implementadas. Não há fila offline persistente, notificação com navegador fechado ou monitoramento 24h. VLibras opcional e temas são recursos de interface, sem homologação da tradução industrial.

## 7. Cópias, histórico e divergências

No início, `master` local e `origin/master` remoto tinham HEAD `a268ddcd841ed7cb71f9110752498f0902e16222`. `C:\Users\Kauan\Desktop\msa-master` é uma extração sem `.git`. Os 117 arquivos nela coincidem com o conjunto rastreado inicial: 48 idênticos em bytes e 69 apenas com CRLF/LF; nenhuma diferença de conteúdo após normalização. O checkout atual contém ainda análises/saídas locais e os arquivos não rastreados anteriores de roteiro de apresentação/script; foram preservados. A consolidação foi salva no checkout atual.

Foram inventariados 31 itens de arquivo no Drive: 27 binários, três Google Docs e `msa-master.zip`. O ZIP do MVP foi a única exclusão, como solicitado. Os 27 binários materializados coincidem por SHA-256 com fontes locais. Os três Docs foram lidos em formato textual e cruzados com seus DOCX exportados; equivalência semântica de texto não é igualdade de bytes entre formatos. Não houve escrita no Drive.

| Divergência | Origem e tratamento |
|---|---|
| Cenário fictício de 14 dias em `msa` versus operacional sem leituras | README/CONTINUE_AQUI e início de ENTREGA_FUNCIONAL conservam etapa anterior; atualização posterior de ENTREGA, memória e `operational-workspace.js` registram nova inicialização. Estado remoto não consultado agora. Acrescentada nota de retomada sem apagar histórico |
| Documentação de frontend ainda futuro versus sete telas | PARAMETROS/plano registram etapa de serviços; código e atualização posterior demonstram interface construída |
| Ideias QR/OCR/offline/“NexoProdução” versus implementação | Dossiês/design são propostas datadas; conferir tabela de opcionais e código antes de anunciar |
| Fontes antigas em Downloads/Desktop\MSA versus Grupo Amarelo atual | Conferência de 12 hashes das fontes anteriores encontrou identidade; caminhos antigos foram mantidos no histórico e novo localizador registrado |
| “Fabiana Dias” versus Fabiana Stoicov | Primeiro é perfil de conta citado no projeto; segundo é a pessoa informada pelo usuário. Identidade não confirmada |
| Ganhos “reais” e disponibilidade de hardware | Documento da equipe afirma cenários, mas não apresenta baseline/orçamento/acesso; preservado e marcado como proposta |
| “17 tempos” versus 15 campos `seg` | Documento de materiais versus Selo!linha12; não alterar silenciosamente nenhuma fonte |
| Estações/linha de abafadores versus selo/21 zonas | Ambos fotografados; confirmação de piloto e granularidade ainda aberta |

A inclusão da nota em `CONTINUE_AQUI.md` é documental. O corpo anterior permanece integral. As cópias da documentação anterior e do histórico de perguntas estão em `evidencias/documentacao_anterior/`. Não houve alteração de regra, aplicativo, material original, commit, push ou deploy.

## 8. Verificação e próximos passos

Nesta sessão: `npm test` passou com **83 testes, 83 aprovados, zero falhas e zero skips**; `npm run verify:static -- --deploy` retornou **ok, 45 arquivos, nenhum erro**. A comparação de hashes verifica a preservação dos originais, do prompt e do aplicativo. Não alegar nova execução de navegador/emulador, teste físico, disponibilidade da nuvem ou regras implantadas.

As prioridades abaixo são recomendações desta análise, fundamentadas no enunciado e no que já existe, não decisões atribuídas à empresa:

1. **Fechar evidência antes de ampliar escopo:** ouvir/transcrever entrevista; cruzar respostas; confirmar top três resultados, piloto e critério de aprovação. Não reenviar perguntas automaticamente.
2. **Validar referência:** natureza medido/ajuste, limites/receita/meta, zonas 0/0, contramolde, pressão/vácuo, frequência e método Cp/Cpk. Não homologar a planilha por aparência ou fórmula.
3. **Demonstrar o fluxo mínimo:** um contexto coerente, registro de coleta/produção/parada/perda, indicadores, histórico e decisão da Engenharia. Usar cenário sintético identificado quando não houver exemplo autorizado; preservar entrada operacional vazia e isolamento do simulador.
4. **Escolher coleta com dependência explícita:** registro manual digital já é demonstrável; CSV é alternativa técnica com serviço pronto e UI pendente. OCR exigiria confirmação/fotos/teste de extração; CLP/IoT exige acesso autorizado, tags, interface e hardware confirmados. Não iniciar integração por inferência de foto.
5. **Medir valor defensável:** tarefa equivalente antes/depois, tempo de registro/consolidação, número de campos transcritos corretamente, recuperação de contexto e rapidez de localizar desvio. OEE/MTTR/ROI só com linha de base, período e aprovação dos critérios.
6. **Concluir somente lacunas autorizadas após fechar o piloto:** considerar UI de CSV/comparações/correções, granularidade por estação e melhorias necessárias ao caso escolhido. Não tratar todos os opcionais como obrigação ou iniciar mudanças nesta revisão.

Dependências imediatas: entrevista processável; interlocutor para validar piloto/referência/fluxo; exemplos autorizados; critérios e agenda oficial do desafio. A expressão do usuário “faltam poucos dias” orienta foco, mas não é uma data oficial conhecida.
