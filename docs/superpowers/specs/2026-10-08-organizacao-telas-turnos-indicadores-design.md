# Organização das telas, turnos e indicadores — MSA

Data: 08/10/2026. Estado: organização aprovada pelo usuário, com preservação das funcionalidades e inclusão de MTBF/MTTR. Escopo ampliado pelo usuário para simulação contínua em tempo real. Plano de implementação elaborado; código ainda não alterado.

## 1. Objetivo e limites da revisão

Facilitar o registro pelos funcionários e a tomada de decisão da liderança: identificar pendências na entrada, comparar plano e produção na mesma área e entender produtividade, OEE, MTBF e MTTR sem procurar em tabelas técnicas. Acrescentar uma fonte simulada contínua, que registra dados enquanto a produção acontece e alimenta todas as telas pelos mesmos serviços.

Pedido do usuário: filtro por turno ao lado do período; aproveitar a organização e as explicações do concorrente; preservar informação, gráficos e melhorias já entregues; reorganizar páginas redundantes quando isso simplificar o trabalho. A instrução posterior substitui a exclusão inicial da automação: simular aquisição em tempo real, sem apresentar essa fonte como integração física instalada.

Base efetivamente examinada: `C:/Users/Aluno/Desktop/msa-master`, incluindo a revisão local de login e limites de 08/10. A pasta de trabalho `C:/Users/Aluno/Documents/ChatGPT/MSA` contém apenas um repositório Git sem commits e não é a implementação. A cópia Desktop não contém `.git`.

Referência MSE: código, documentação e telas da cópia `C:/Users/Aluno/Pictures/MSE`, aberta pelo cenário local. Não foi necessário usar credenciais nem acessar o banco privado do concorrente.

Restrições obrigatórias:

- Preservar os dois gráficos do Dashboard: plano/bruta/mínimo por intervalo e plano/bruta acumulados. Preservar também gráficos de parâmetros, CEP, hora a hora legado e produção/paradas dos contextos históricos.
- Preservar NHPL/Montagem, VGARD HP e MARK V, variantes, OP, lote, receita, autor, origem, histórico e referências. Não transferir parâmetros T20/selos para NHPL.
- Produtividade permanece produção **bruta** realizada / plano aprovado × 100. Meta de 95% conforme a política vigente; takt informado de 12 s auxilia planejamento, sem virar ciclo ideal do OEE.
- Não reduzir o plano retrospectivamente por parada imprevista. Não ratear quantidade entre horas/turnos sem evidência.
- Ausência, conflito, cobertura parcial, valor confirmado igual a zero e período futuro são situações distintas.
- Boas, bruta, refugo em peças, retrabalho e material em kg mantêm bases distintas. Bruta não recebe nova soma de boas ou refugo.
- Conservar login obrigatório, retorno ao login no logout, ausência do botão de simulação no login e correção de reabertura dos limites. Não reintroduzir avisos de dados fictícios na rotina. Proveniência armazenada e exportável permanece.
- Conservar os quatro perfis, decisões auditadas, versões de referências e proibição de aprovar a própria correção, inclusive para Administração.
- Manter importação e backup em Configurações; TV acessível por Indicadores. Não recriar os atalhos repetidos que já foram retirados.
- Manter JavaScript ES modules, Chart.js e estilos atuais, sem migração de framework, nova biblioteca de gráficos ou cópia de código/ativos do concorrente.
- Esta revisão não inclui chat, funcionários, mapa/3D, integração física, limpeza de armazenamento, push ou deploy.
- Nenhuma funcionalidade existente será excluída nesta entrega; funções reorganizadas conservam destino e rotas de compatibilidade.

## 2. Diagnóstico sustentado pela revisão

| Achado | Evidência atual | Efeito para quem usa |
|---|---|---|
| Turno escondido | `main.js`, `filters()`: texto livre em Contexto de lote, ordem, receita e turno | Não comunica os horários nem convida à comparação |
| OEE já existe, mas fica abaixo de uma tabela e dois gráficos | `dashboard()` e `technicalMarkup({compact:true})` | Parece ausente na visão geral |
| MTBF/MTTR não são cartões nem resumo do período | `technicalView()` e tabela de Indicadores | A confiabilidade precisa ser procurada por intervalo |
| Planejar e conferir produção exigem trocar de página | Planejamento e Apontamentos/Hora a hora | A relação plano → registro → confirmação fica fragmentada |
| Planos não seguem a consulta inteira | `planningMarkup()` filtra planos somente pela máquina | Surgem planos de outro produto, turno e período |
| Engenharia mostra ocorrências abaixo das outras filas | `engineering()` | Tarefas diferentes competem por atenção |
| Classificações técnicas aparecem em inglês | `stopsTechnicalMarkup()` / ocorrências | Vocabulário interno chega ao funcionário |
| Contagem de microparadas é somada por intervalo | `technicalView()` | Evento que cruza intervalos pode ser contado mais de uma vez |
| Exemplos de turno não combinam com os novos horários solicitados | Seed: MARK V em turno 2 às 13h; plano VGARD HP em turno 1 às 16h | Filtro temporal não pode confiar silenciosamente nos rótulos |
| OEE agregado precisa considerar ciclos diferentes | `technicalView()` usa ciclo médio e qualidade por contagem | Misturas podem distorcer o resultado |

O MSE organiza bem a entrada: faixa de pendências, quatro indicadores com descrição e telas por tarefa. Produção apresenta planejado/realizado e turno; Paradas apresenta motivos e confiabilidade; Qualidade distingue refugo e kg. Aproveitar esses princípios. Os cálculos e contratos existentes do MSA continuam a fonte de verdade, com os ajustes identificados nesta revisão.

## 3. Abordagens consideradas

1. **Reorganizar por tarefa, reaproveitando os fluxos atuais — recomendada.** Unir Planejamento e Apontamentos em Produção; dar espaço próprio a Paradas e Qualidade; melhorar o Dashboard. Resolve a fragmentação sem substituir serviços e histórico. Exige compatibilidade das rotas e revisão dos recortes.
2. **Manter o menu e apenas acrescentar filtro/cartões.** Menor alteração inicial, mas deixa planejamento, registro e conferência separados e mantém a dificuldade de encontrar funções.
3. **Concentrar todas as rotinas numa única tela.** Reduz trocas de página, mas cria uma tela longa, sobrecarrega o celular e mistura trabalho operacional com decisão técnica.

Selecionada para esta proposta: opção 1. Não copiar a quantidade de páginas do MSE nem remover gráficos para obter um painel visualmente mais limpo.

## 4. Navegação e destino das informações

| Área | Conteúdo principal | Origem no MSA |
|---|---|---|
| **Visão geral** | Pendências, produtividade/OEE/MTBF/MTTR, os dois gráficos, resumo de parâmetros e fila técnica | Dashboard |
| **Produção** | Resumo e hora a hora; Planejamento; Apontamentos; Horários; Ocorrências | Planejamento + abas Produção/Hora a hora/Ocorrências dos Apontamentos |
| **Paradas** | Abertas, histórico, motivos, duração, microparadas registradas, classificação e reparos | Apontamentos/Paradas + classificação em Indicadores |
| **Qualidade** | Refugos, retrabalho, material em kg, boas de primeira passagem e inspeções | Apontamentos/Perdas + inspeção técnica |
| **Parâmetros** | Últimas leituras, limites, coleta manual, detalhe e gráfico | Parâmetros, conservando seu fluxo |
| **Engenharia** | Abas Análises, Correções e Ocorrências; evidências e decisões | Engenharia, reorganizada |
| **CEP** | Estudos separados por característica/versão/contexto e todos os gráficos | CEP atual |
| **Indicadores** | Detalhamento A/P/Q/OEE e confiabilidade, cobertura, referências, memória CSV e TV | Indicadores atuais |
| **Histórico** | Consulta completa, detalhes, propostas de correção e exportação | Histórico atual |
| **Cadastros e Configurações** | Administração, preferências, conta, importação e backup | Áreas atuais, em grupo secundário do menu |

Menu agrupado: Visão geral; Operação (Produção, Paradas, Qualidade, Parâmetros); Análise (Engenharia, CEP, Indicadores, Histórico); Administração (Cadastros, Configurações), respeitando o perfil. No desktop, oferecer nomes legíveis, evitando um trilho tão estreito que esconda itens inferiores; no celular, manter menu acessível e rolável.

Planejamento sai como entrada independente do menu, mas conserva sua função em Produção/Planejamento. Apontamentos passa a ser uma aba com nome explícito em Produção. Nenhum registro, serviço ou histórico é apagado por essa mudança.

Rotas antigas continuam funcionando: `#planning` abre Produção/Planejamento; `#operations` abre Produção/Apontamentos; seus destinos anteriores de Paradas, Perdas e Hora a hora são remapeados preservando contexto e período. Importação, TV, detalhes e links de notificações preservam um retorno coerente. Trocar de aba não limpa filtros. Ao abrir um registro fora da consulta, ajustar os filtros de modo visível e restaurá-los ao voltar.

Operação entra em Produção/Apontamentos; Engenharia conserva sua entrada na fila técnica; Administração e Consulta entram na Visão geral. Consulta continua somente leitura. Operação registra e consulta Paradas/Qualidade, mas não ganha autoridade para referências ou decisões.

## 5. Filtro de turno e recorte temporal

### 5.1 Controle visível e contexto do registro

Ao lado do Período e das datas: **Turno** com Todos os turnos, 1º turno · 07h–15h, 2º turno · 15h–23h e 3º turno · 23h–07h do dia seguinte. Padrão da nova preferência: Todos os turnos. Manter seleção ao navegar e recarregar, sem reaproveitar preferência de outra conta.

Retirar o campo de turno de consulta do bloco avançado, que passa a mostrar OP, lote e receita. Separar **turno filtrado** de **turno informado no registro**: Todos é uma opção de consulta, nunca um valor gravado num apontamento. Quando existir intervalo aprovado, o formulário recebe seu contexto. Fora desse fluxo, exigir um dos três turnos no registro manual. Não alterar OP/lote/turno do registro por mera troca de filtro.

### 5.2 Data operacional

Convenção proposta, apresentada ao usuário para confirmação: a data é a data de início do turno. O dia operacional vai de 07h a 07h do dia seguinte. Na consulta de 08/10:

- 1º: `[08/10 07h, 08/10 15h)`;
- 2º: `[08/10 15h, 08/10 23h)`;
- 3º: `[08/10 23h, 09/10 07h)`;
- Todos: união dos três, `[08/10 07h, 09/10 07h)`.

Usar `America/Sao_Paulo`, independentemente do fuso do computador. 07h pertence ao primeiro, 15h ao segundo e 23h ao terceiro. 00h–06h59 pertence ao terceiro do dia anterior. Exibir ajuda curta: “O 3º turno termina às 7h do dia seguinte.” Detalhes e Histórico conservam o horário e a data civil originais.

Intervalo de várias datas com turno específico produz **janelas diárias separadas**. Ex.: turno 1 de 08 a 10/10 inclui apenas 07h–15h de cada dia, nunca todas as horas entre o primeiro e o último limite. A busca pode carregar um envelope maior; a seleção final e o cálculo usam a união exata dessas janelas. Carregar também registros anteriores que ainda intersectem o período e referências/revisões necessárias. Campo `eventDate` original não é migrado para obter isso.

Todos os resumos, planos, tabelas, gráficos, detalhes de contexto, CEP por grupo, indicadores e exportações operacionais usam o mesmo recorte. Preferências, catálogo de cadastros e versões técnicas não são apagados nem restringidos por data de criação; são usados conforme vínculos e vigência. Estudos de planilha sem horário não recebem turno inferido e informam que esse filtro não pode ser aplicado à fonte.

### 5.3 Dados antigos e intervalos que atravessam fronteiras

Turno deve ser normalizado somente na leitura: reconhecer 1/2/3 e seus rótulos comuns; não sobrescrever o original. Instante de ocorrência ou período físico é a base temporal; `createdAt` não substitui um horário de ocorrência ausente, pois o funcionário pode registrar depois.

Para registros cujo turno informado diverge do horário, mostrar **Turno divergente — conferir registro**, com original, horário e destino de correção. Não mudar o turno nem transformar essa quantidade em produção confirmada de outro turno. Turno desconhecido ou horário ausente aparece em uma lista explícita de registros não classificados; os dados continuam consultáveis, e a cobertura informa a limitação.

Intervalo com quantidade que atravessa turno/data não é rateado. Mostrar a quantidade original e a condição **Sem detalhamento por turno**; excluir de totais definitivos dos turnos individuais. Em Todos, um intervalo completamente contido pode conservar a quantidade conhecida, com cobertura de comparação por turno separada. A soma dos três turnos precisa coincidir com o total **alocado**; mostrar separadamente quantidades não alocadas ou divergentes.

Novos planos e incrementos devem caber no turno escolhido; se atravessarem a fronteira, o formulário orienta criar intervalos separados e informar suas quantidades. Pausas dentro do mesmo turno continuam permitidas. Ajustar apenas a geração de novos exemplos para horários coerentes; bases locais já existentes não são recriadas, limpas ou reescritas.

Paradas atravessando janelas têm duração recortada e unida sem duplicação por equipamento. Ocorrência da parada e falha/reparo conservam identidade única. Parada aberta mostra tempo decorrido até a consulta, claramente provisório; não recebe fim gravado ou indicador final presumido.

## 6. Visão geral

Ordem visual: filtros → faixa de pendências → quatro cartões principais → resumo de volumes/tempo e A/P/Q → os dois gráficos → parâmetros e fila técnica resumidos, com acesso ao detalhe.

Cartões sempre presentes, mesmo sem base de cálculo:

| Cartão | Descrição curta abaixo do valor |
|---|---|
| Produtividade | Produção bruta ÷ plano aprovado |
| OEE | Disponibilidade × desempenho × qualidade |
| MTBF | Tempo em operação ÷ número de falhas |
| MTTR | Tempo de reparo ÷ reparos concluídos |

Percentuais com símbolo %, confiabilidade em minutos, exibidos sem falsa precisão. Valor, situação e cobertura são informações diferentes. Um resultado parcial deve dizer de quantos intervalos/quanto tempo foi obtido. Sem ciclo ideal, mostrar OEE indisponível e ação Conferir referência; disponibilidade calculável permanece visível. Sem falhas em histórico completo, MTBF diz **Sem falhas registradas no período** e mostra a exposição, sem 0 min nem infinito. Sem reparos concluídos, MTTR diz **Sem reparos concluídos**.

Descrever também Disponibilidade (operação ÷ tempo planejado), Desempenho (ciclo ideal × bruta ÷ operação) e Qualidade (boas de primeira passagem ÷ bruta). OEE e MTBF/MTTR não recebem a meta de 95% da produtividade. Sem política própria, não inventar cores de aprovação ou faixas de “bom”.

Manter bruta, boas, refugo em peças, perda de material em kg e paradas consultáveis em resumo compacto. A tabela completa de intervalos passa a ter seu destino principal em Produção/Resumo e hora a hora, preservando os dados também acessíveis na Visão geral por expansão. Os dois gráficos permanecem na Visão geral, com legenda, tabela acessível e tratamento atual das lacunas.

Fila técnica e parâmetros na entrada priorizam pendências e desvios, com limite inicial de cinco linhas e opção Ver todos/expandir. Não remover parâmetros normais do sistema nem escondê-los sem um caminho explícito. O Dashboard acompanha; ações de registro permanecem em suas telas.

## 7. Pendências acionáveis

Usar uma projeção dos registros existentes, sem duplicar pendências em uma nova tabela persistente. Identidade estável por entidade e tipo; uma mesma parada aberta e ainda sem classificação vira uma linha com duas condições, não dois problemas contados como independentes.

- **Faixa Em aberto neste equipamento/contexto:** paradas abertas, análises aguardando/em análise, correções aguardando decisão e ocorrências não concluídas, dentro das permissões e do contexto. Independe das datas e do turno da consulta, para não sumir com um problema antigo ainda aberto. Texto visível: “Pendências abertas; podem ter começado antes do período selecionado”. Cada linha informa data e turno de origem.
- **Conferências no período consultado:** intervalos passados com confirmação/reconciliação pendente, inspeção/registro faltante e divergência de turno. A referência técnica ausente é agrupada por contexto, evitando uma pendência igual por hora.
- **Desvios e resultados do período:** produtividade abaixo da meta e leituras fora da referência da própria coleta. São achados, não tarefas resolvidas automaticamente. Não criar alertas de baixa produção para horas futuras ou sem dados.

O total destacado na faixa é o número de entidades abertas da primeira seção. Conferências e desvios têm contadores próprios; nunca somar os três sem explicar a composição. Se a leitura não estiver completa, mostrar **Lista parcial — atualizar consulta**, nunca “Sem pendências”.

Prioridade: interrupções abertas e conflitos; decisões/conferências pendentes; desvios. Dentro da categoria, ordenar pela data mais antiga. Sem SLA informado, não usar “atrasado”. Indicar ação e equipe a partir do fluxo existente, sem inventar pessoa responsável.

Abrir pendência leva à aba e ao registro corretos. Se o item está fora dos filtros, mostrar o contexto do item e restaurar a consulta ao voltar. Consulta vê detalhe; Operação vê as ações permitidas; autor de correção vê Aguardando outro responsável, sem botão de autoaprovação.

Parâmetro fora de faixa representa a última leitura confiável do contexto, preservando sua referência histórica. Nova leitura normal substitui o alerta atual, mas não apaga o desvio do histórico. Horário ambíguo, referência pendente e leitura inválida são diagnósticos de dados, sem aparência de normalidade.

## 8. Responsabilidade de cada tela de trabalho

**Produção.** Resumo/hora a hora relaciona plano aprovado, bruta, boas, refugo, produtividade, mínimo, faltantes, cobertura e situação. Planejamento mantém prévia, aprovação explícita, revisão, recuperação de intervalos e metas/takt com vigência, seguindo máquina/processo/produto/OP/lote/turno e interseção temporal. Apontamentos mantém os incrementos e a confirmação; Horários mantém os quatro acontecimentos separados. Ocorrências permite registro/consulta com destino à Engenharia para tratamento. Preferir abas e um botão principal por tarefa, sem repetir todos os formulários no topo.

**Paradas.** Abas Em aberto, Histórico e Classificação. Registrar e encerrar continuam usando motivo cadastrado e validação de peça boa quando exigida. A equipe técnica classifica disponibilidade/desempenho/fora do tempo planejado e, se falha, informa o reparo. Traduzir rótulos internos. Resumo de duração, motivos, MTBF/MTTR e microparadas registradas usa a mesma base de Indicadores. A fonte simulada pode gerar microparadas; bases manuais não recebem eventos inferidos.

**Qualidade.** Resumo com boas de primeira passagem, refugos em peças, retrabalho e material em kg. Abas Refugos e perdas e Inspeções. Boa registrada na produção não é automaticamente boa de primeira passagem; reutilizar a confirmação de inspeção existente. Se o dado não existe, mostrar o motivo. Manter evidências/decisões de Engenharia acessíveis por vínculo. Não criar módulo de segregação/liberação de lotes nesta revisão.

**Engenharia.** Abas Análises, Correções, Ocorrências. Cada uma mostra contagem e ações do seu fluxo. Evidências continuam ligadas à análise. Pendências atuais podem ser vistas sem data, mas busca histórica explicita período; esse alcance não deve ser confundido com indicadores do período.

**Parâmetros, CEP, Histórico, Cadastros e Configurações.** Preservar seus contratos; aplicar filtros pertinentes e melhorar nomes/links. CEP não mistura turnos, versões ou lotes para aumentar amostra; regra NHPL de ao menos 30 observações permanece. Histórico é o lugar do registro completo e da correção auditada. Cadastros preserva a distinção limite aprovado atual/rascunho/referência da leitura.

**Indicadores.** Oferecer leitura detalhada de A/P/Q/OEE, confiabilidade e cobertura por período e intervalo, referência técnica versionada, dados faltantes e memória CSV. TV usa os mesmos resumos/turnos e retorna à área. Classificação e inspeção têm telas operacionais próprias com links a partir do diagnóstico, sem duplicar regras de gravação.

## 9. Cálculos e consolidação

### 9.1 Produtividade e OEE

Conservar a fórmula de produtividade e as vigências atuais. Agregar por soma de bruta / soma de plano elegível, nunca média simples de percentuais. Se metas variam, mostrar as metas por intervalo e a soma dos mínimos definidos por intervalo; não usar uma única meta inventada. Em registro manual, intervalo em andamento mostra produção registrada e situação parcial, sem projetar produção física futura.

OEE por segmento continua A × P × Q, com bases completas, referência válida, parada classificada, inspeção vinculada à revisão e produção confirmada. Classificação inválida, parada aberta, conflito ou inspeção anterior à correção não vira resultado final. Setup em tempo em que se pretendia produzir é perda; pausa fora da intenção de produzir é exclusão do planejamento.

Para consolidar segmentos com ciclos diferentes, calcular `OEE = Σ(cicloIdeal_i × boasPrimeiraPassagem_i) / Σ(tempoPlanejado_i)`. Somente segmentos elegíveis entram; cobertura e exclusões ficam explícitas. A/P/Q do conjunto usa bases compatíveis com esse resultado: A = Σoperação/Σplanejado; P = Σ(cicloIdeal × bruta)/Σoperação; Q ponderada por tempo ideal = Σ(cicloIdeal × boas)/Σ(cicloIdeal × bruta). Se há ciclos diferentes, rotular **Qualidade ponderada para OEE** e mostrar separadamente a qualidade por contagem e os resultados por produto/referência. Ciclo único mantém o comportamento habitual. Não usar ciclo médio com qualidade simples por contagem.

Reprodução numérica de 08/10: segmento 1, 100 brutas/100 boas a 10 s; segmento 2, 50 brutas/25 boas a 20 s; ambos com 1.200 s planejados e em operação. Consolidação atual resulta em 69,4444%; tempo produtivo ideal das boas resulta em **62,5%**. O teste futuro precisa fixar essa diferença.

### 9.2 MTBF e MTTR

Calcular confiabilidade no período da consulta, independente da completude de ciclo ideal e de qualidade do OEE. Exigir cobertura conhecida de operação/falhas/classificações. Não calcular média dos MTBF/MTTR horários.

- MTBF: soma do tempo em operação elegível / falhas únicas que começam nas janelas selecionadas. Falha iniciada antes da janela não entra de novo no denominador, mas sua parada intersectante reduz a operação. Mostrar falhas carregadas de período anterior separadamente.
- MTTR: soma do tempo completo dos reparos encerrados nas janelas / número desses reparos concluídos. Não recortar um reparo só para diminuir sua duração média. Reparos em andamento aparecem separados e não entram no MTTR; isso não bloqueia automaticamente os reparos concluídos com cobertura completa.
- Denominadores pertencem a conjuntos distintos: falhas iniciadas e reparos concluídos. Mostrar ambos. Zero falhas/reparos não produz divisão por zero.
- Uma falha que cruza dois intervalos é contada uma vez no período. Horários de reparo inválidos e classificações desatualizadas impedem um resultado final correspondente.
- Exposição e contadores são agregados por equipamento. Não chamar uma soma de exposições de várias máquinas de tempo físico de uma única máquina.

Reprodução na base atual: quatro intervalos, 13.800 s = 230 min de operação, uma falha e um reparo de 5 min. O período precisa mostrar **MTBF 230 min, MTTR 5 min**, com cobertura adequada. Os 50 min atuais pertencem apenas ao intervalo de 10h–11h e continuam válidos nesse detalhe.

### 9.3 Microparadas e duração

Contagem do período por identidade única de evento; duração por união dos recortes temporais por equipamento. Um evento de 20 s entre 08h59min50s e 09h00min10s tem duas parcelas de duração nos intervalos, mas uma ocorrência no resumo. Distinguir critério de duração registrado de classificação técnica. Não inferir eventos ausentes nem retirar duas vezes o mesmo tempo do OEE.

## 10. Organização técnica proposta

Reutilizar serviços de planejamento, produção, operações, histórico, técnica e decisões. Separar seleção temporal, projeções de métricas e renderização; filtros não devem viver como regras diferentes dentro de cada página.

Unidades previstas para a etapa de plano:

- Domínio de turnos/janelas operacionais, com normalização de rótulos, data operacional e diagnósticos de fronteira.
- Consulta compartilhada, distinta do contexto de registro, com persistência por conta e composição com máquina/processo/produto/OP/lote/receita.
- Resumo de indicadores e confiabilidade do período, reutilizável no Dashboard, Paradas, Indicadores, TV e exportações.
- Projeção de pendências existentes, com alcance atual/período explícito, deduplicação e destino permitido por perfil.
- Renderizadores de Produção, Paradas e Qualidade; navegação e aliases; módulos menores extraídos de `main.js` e `technical.js` somente onde esta mudança exige.

Arquivos atuais envolvidos: `app/src/ui/main.js`, `access.js`, `consultation.js`, `nhpl.js`, `technical.js`, `hourly.js`, `period-records.js`, `presentation-details.js`, `presentation.js`, `cep.js`, `app/src/domain/oee.js`, `productivity.js`, `hourly.js`, `planning.js`, `time.js`, `app/src/services/history.js` e `app/styles.css`. O plano detalhado definirá os novos arquivos e as interfaces antes de editar código.

A escolha de turno não é permissão de acesso. Serviços continuam validando ações. A mudança não exige migração destrutiva de banco ou reescrita de referências; se o plano identificar mudança necessária em regras, deve ser apresentada como alteração explícita e testada em emulador.

## 11. Critérios de aceitação e evidências

1. Turno ao lado de período/data em desktop e celular; sem campo duplicado de consulta; mudar o filtro não muda contexto gravado nem invalida um formulário aberto.
2. Limites 07h/15h/23h, meia-noite, último dia até 07h seguinte e consulta de vários dias funcionam no fuso de São Paulo, inclusive com computador em outro fuso.
3. Planos e resultados seguem os mesmos filtros. Registros divergentes, sem horário e cruzando turno permanecem acessíveis, sem rateio ou confirmação inventados.
4. Visão geral apresenta os quatro indicadores e as explicações. OEE indisponível mostra o motivo e preserva parcelas válidas. Resultado parcial não parece total confirmado.
5. MTBF 230 min/MTTR 5 min na reprodução; reparo atravessando janela/falha aberta/histórico incompleto têm conjuntos e estados explicados. Confiabilidade funciona com ciclo ideal ausente quando a sua própria base está completa.
6. OEE misto da reprodução é 62,5%, com parcelas ponderadas identificadas e memória das referências. Ciclo único conserva 75,625% no exemplo VGARD HP completo.
7. Microparada entre intervalos conta uma vez no período; duração sobreposta não soma em duplicidade.
8. Pendências abertas antigas continuam visíveis, com alcance declarado; decisões concluídas saem da fila; nenhuma hora futura vira alerta de baixa produtividade; Consulta e autor da correção não recebem ações indevidas.
9. Produção reúne plano, registro e confirmação; Paradas e Qualidade conservam todas as ações pertinentes. Rotas antigas, retorno, filtros e perfil continuam funcionando.
10. Todos os gráficos existentes, fontes/valores exportáveis, CEP, detalhes, históricos, limites e correções permanecem. Não regredir as mudanças locais de 08/10.
11. Testar 320/390 px e desktop, claro/escuro, teclado, títulos e rótulos, abas, leitura dos gráficos e tabelas com rolagem local. Não depender só de cor ou de hover.
12. Executar suíte unitária, verificação estática, regressões de navegador e testes de regras/emulador se os contratos de acesso/gravação forem afetados. Comandos atuais: `npm test`, `node scripts/verify-static.mjs --deploy`, `npm run test:emulator`. Testes de navegador usam fixtures locais, sem alterar contas reais.

Verificações da análise de 08/10, antes de qualquer implementação: suíte atual com 148 testes passou; verificação estática confirmou 76 arquivos e zero erros. Foram visitadas as telas atuais de Dashboard, Planejamento, Apontamentos/Produção/Paradas/Perdas, Indicadores, Engenharia, CEP, Histórico, Cadastros, Configurações e Parâmetros. No MSE, Visão geral, Produção, Paradas e Qualidade foram inspecionadas no cenário local; as demais responsabilidades foram conferidas por documentação/código. Esses resultados validam o estado de partida, não as mudanças propostas.

## 12. Sequência de decisão

Organização aprovada. A ampliação para simulação contínua está detalhada na seção 13 e no plano correspondente. Revisar o plano escrito e escolher a execução; preservar a aprovação das funcionalidades e da organização já recebida.

Fontes técnicas consultadas em 08/10/2026: [Vorne — cálculo de OEE](https://www.oee.com/calculating-oee/), [IBM — MTBF](https://www.ibm.com/think/topics/mtbf), [IBM — MTTR](https://www.ibm.com/think/topics/mttr). Fórmulas básicas vêm dessas referências; convenções de recorte, cobertura, apresentação e governança acima são decisões propostas para este MSA.

## 13. Simulação contínua solicitada após a aprovação

### 13.1 Entrada e preservação

Início automático após o login é o padrão proposto, com Pausar e Retomar na fonte de dados. Foi oferecida ao usuário a alternativa de início por botão; uma resposta posterior prevalece sobre esse padrão. Não acrescentar acesso sem login nem restaurar o botão de simulação retirado dessa tela.

Criar uma base persistente separada em `msa.nhpl.live.v1`. A base `msa.nhpl.presentation.v3` permanece intacta e acessível pelo seletor **Fonte de dados: Em tempo real / Registros existentes**. Os 16 cenários estáticos continuam acessíveis. Cada fonte tem seus próprios filtros e retorno; não misturar registros das bases nem somar duas fontes como uma produção. Não copiar ou alterar retrospectivamente registros existentes para preparar o cenário ao vivo.

A base contínua começa com catálogo NHPL, exemplos históricos coerentes com os turnos e programação específica da fonte. Preservar os defaults das APIs antigas; novos exemplos podem pedir geração sem plano futuro conflitante e com turnos coerentes. As demais máquinas e dados históricos continuam acessíveis na fonte original. Não substituir ou aprovar automaticamente planos humanos para abrir espaço para a simulação.

### 13.2 Fonte única e ciclo de vida

Gerador independente da página, usando relógio real em velocidade 1×, passo de até 1 s e ciclo físico demonstrativo de 12 s; ciclo ideal de referência de 10 s, explicitamente registrado como referência de cenário. Esses valores não homologam a máquina real. Somente a conclusão de um ciclo gera peça, respeitando parada, pausa e fronteira de turno. Não incrementar contadores separados no Dashboard.

Planos, incrementos de bruta/boas, perdas, inspeções, paradas, reparos e coletas entram pelos serviços atuais. Origem de cenário, autoria da fonte, instante e identificador estável são preservados e exportáveis. Fonte interna é restrita à base local: nunca promove o perfil do usuário nem recebe acesso ao Firebase. Consulta pode observar a fonte; controles e registros manuais respeitam as permissões atuais.

Programação em intervalos de até 60 min, cortados também em 07h/15h/23h. Na virada, fechar exclusivamente intervalos da fonte, inspecionar suas peças e iniciar o próximo contexto/turno. A data operacional do terceiro turno acompanha a seção 5. Fonte/identidade de sequência muda quando muda o contexto, conforme o contrato de ingestão. Não confirmar, inspecionar nem reconciliar automaticamente registros humanos.

Persistir dados e cursor do gerador juntos. Eventos repetidos ou retomadas após falha não duplicam produção, perdas ou paradas. Uma aba por origem gera os dados; as demais acompanham. Usar Web Locks para eleição da fonte e serialização das alterações da base local, incluindo escritas manuais. Sem essa capacidade, bloquear geração simultânea de forma explícita. Não alegar coordenação entre computadores ou navegadores distintos.

Navegar não interrompe a produção. Formulário aberto conserva foco e valores, enquanto a fonte segue registrando; atualização visual completa aguarda sua conclusão. Logout, troca de fonte e descarte da sessão param e liberam a fonte, aguardando a escrita em andamento antes de descartar o repositório. Reload retoma o cursor sem duplicar eventos; não fabricar peças do tempo em que o aplicativo esteve fechado. Lacunas superiores a 60 s de suspensão são registradas e deixam cobertura parcial. Falha de armazenamento interrompe o gerador, preserva a última gravação válida e oferece exportação/retentativa; a interface não continua contando sem persistir.

### 13.3 Eventos demonstrativos e controles

Sequência determinística e reproduzível, por sessão ativa: microparada após 60 s por 12 s; falha após 180 s por 45 s, com reparo do 5º ao 35º segundo da falha; repetição de ambas em ciclos de 300 s. Refugo a cada 25ª peça; bruta sempre inclui essa peça e boas não a inclui. Leituras a cada 30 s, com desvio de um parâmetro por 30 s a cada 120 s. Heartbeat a cada 5 s. Respeitar fronteiras e impedir eventos simultâneos contraditórios.

Controles autorizados: Pausar/Retomar fonte, Refugo na próxima peça, Microparada, Falha, Desvio de parâmetro, Perda de comunicação/Reconectar. Comandos são registrados, usam a mesma sequência e não alteram contadores diretamente. Perda de comunicação suspende registros e torna o trecho desconhecido; reconexão não repõe peças fictícias. Boa validada encerra a parada conforme os serviços atuais; simples estado running não faz isso.

Leituras usam referências do cenário NHPL: dimensão de encaixe 9,5–10,5 mm e ensaio 90–110 N, sem transportar limites pneumáticos ou de força do concorrente. Variar valores deterministicamente em torno do centro; desvio provocado ultrapassa a referência da própria leitura. Preservar versões, todas as coletas e separação por característica/contexto no CEP.

### 13.4 Indicadores em andamento

Na fonte contínua, comparar produção com plano decorrido; mostrar também o plano inteiro, faltante e situação **Em andamento**. Não reduzir o plano por falha nem usar 95% como meta de OEE. OEE em andamento usa tempo observado, bruta e boas de primeira passagem da fonte, classificação e referência; permanece **Parcial**, com horário da última atualização e cobertura, até o fechamento. Bases manuais conservam confirmação/inspeção explícitas.

MTBF usa exposição observada e falhas únicas iniciadas; MTTR usa apenas reparos concluídos e sua duração inteira. Falha aberta aparece na faixa de pendências, com tempo decorrido e reparo em andamento. Sem falha ou reparo concluído, explicar a base ausente em vez de fabricar zero. Todos os cartões, gráficos, tabelas, memória CSV e TV reutilizam o mesmo snapshot e o mesmo relógio de cálculo.

### 13.5 Aceitação adicional

- Após 24 s ativos sem perda, registrar exatamente 2 brutas e 2 boas; repetir o mesmo passo não altera o total. Após 25 ciclos sem parada, registrar 25 brutas, 24 boas e 1 refugo em peças.
- Na microparada e falha, nenhuma peça é gerada; fração de ciclo é preservada. Reparo demonstrativo concluído fornece MTTR 0,5 min, com uma falha e identidade única.
- Pausar por 30 s não aumenta as peças; navegar permite continuidade; logout bloqueia gravações posteriores. Reload não produz o intervalo offline.
- Duas abas e gravação manual concorrente não duplicam nem perdem registros. Quota/CAS inválido interrompe com erro visível e backup disponível.
- Turno 3 atravessa meia-noite corretamente; 07h troca contexto e intervalo sem peça duplicada nem plano sobreposto.
- Visão geral, Produção, Paradas, Qualidade, Parâmetros, CEP, Indicadores, Histórico e TV concordam sobre os mesmos eventos, filtros e estados parciais.
- Selecionar Registros existentes recupera os dados e funções anteriores; entrar/sair dos 16 cenários mantém o retorno para a fonte anterior. Nenhuma chave antiga é apagada ou recriada.


## 14. Direção final solicitada pelo usuário

Entrega inclui também um 17º cenário completo como opção inicial; os 16 cenários anteriores são preservados, inclusive aqueles destinados a demonstrar ausência ou erro de registro.

A etapa final substitui a separação de fontes e a aquisição contínua da seção 13: uma base de consulta e cadastro, sem seletor de tempo real/registros existentes, e os 16 cenários acessíveis pelo botão de simulação. A fonte contínua não inicia no login. Exemplos coerentes completam os três turnos e ambas as famílias sem substituir registros existentes. O histórico da fonte descontinuada permanece no armazenamento e no backup. A barra lateral é compacta, com todas as entradas visíveis; em alturas pequenas distribui o menu em duas colunas. Cadastro, edição, limites, apontamentos, planejamento e permissões permanecem nos mesmos serviços. Filtros deliberadamente sem correspondência podem indicar ausência; não fabricar medições para um novo cadastro ou situação sem ocorrência.
