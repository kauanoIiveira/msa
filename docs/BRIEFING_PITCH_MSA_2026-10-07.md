# Conteúdo para o pitch do sistema MSA

Equipe Amarela · 07 de outubro de 2026

Documento para Maria Clara e Beatriz montarem o pitch deck e organizarem a apresentação. Reúne problema, solução, desenvolvimento, alternativas, diferenciais, viabilidade técnica e econômica e equipe. As referências estão identificadas como F1 a F8 na última seção.

**Cenário solicitado:** o texto da solução considera concluídos os ajustes do brainstorming, incluindo gráficos no Dashboard, comandos nas áreas próprias, formulário CEP preenchido e acesso à TV por Indicadores. Isso é uma simulação para preparar o pitch. Esses ajustes ainda não foram implementados nem testados. O sistema atual continua preservado. [F3, F4]

**Conclusão para a equipe:** apresentar um sistema de registro e análise voltado ao piloto NHPL, com implantação gradual. Demonstrar o fluxo funcional e pedir apoio para validar um piloto real. O projeto ainda não comprova integração física, ganhos industriais, limites NHPL homologados ou retorno financeiro realizado.

## Mensagem central

Nosso sistema centraliza os registros da produção da NHPL e organiza as informações que a Engenharia precisa para avaliar o processo. Operadores registram produção, parâmetros, paradas e perdas no contexto de ordem, lote e turno. A gestão acompanha o plano e os resultados. A Engenharia consulta referências e evidências, registra suas análises e decide sobre desvios com histórico rastreável.

## Abertura sugerida

“Na linha da NHPL, uma informação pode passar pelo papel, pelo técnico de produção e depois pelo Power BI. Nesse caminho, a análise depende da consolidação manual. Nossa proposta é registrar os dados no contexto certo e deixá-los disponíveis para a produção e a Engenharia.”

Essa abertura se apoia no fluxo descrito por Fabiana. Não afirmar que toda ocorrência segue exatamente a mesma sequência nem que o processo atual causa uma quantidade já medida de erros. [F1, F2]

## O que mostrar antes de explicar detalhes técnicos

Um intervalo com plano de 300 peças e registro de 285 peças demonstra 95% de produtividade. Mostrar depois uma parada com motivo, o refugo associado e a análise da Engenharia. O exemplo é didático. Os 12 s/peça são takt informado, não ciclo ideal homologado para OEE. [F2, F3]

<!-- page -->

## 1 Problema

### Situação atual confirmada

O enunciado descreve parâmetros registrados por fotografias da IHM e transcritos para Excel. Produção, paradas, duração, motivos, refugos e perdas também precisam de registro e consolidação. Fabiana complementa que a produção registra manualmente, o técnico coleta as informações e há alimentação manual do Power BI. SAP e Power BI existem, mas os sistemas são isolados e não há supervisório na linha. [F1, F2]

O piloto definido é a **NHPL**, linha **Montagem**, **Processo de montagem do abafador**, com **Abafadores VGARD HP e MARK V**, nas variantes Low, Medium e High quando conhecidas. A planilha de selos e as 21 zonas são exemplos de coleta de outro processo. Não representam os parâmetros da NHPL. [F2]

### Onde está a dificuldade

- A consolidação depende de etapas manuais e dificulta consultar rapidamente a informação completa de um lote, turno ou ordem.
- Fotografias, papel e planilhas exigem transcrição e conferência. Existe risco de inconsistência, mas a taxa real de erro ainda não foi medida.
- Microparadas não são tratadas hoje pela dificuldade de coletar quantidade, duração acumulada e motivos.
- A análise precisa relacionar parâmetros, produção, perdas, referências de Engenharia e evidências de Qualidade.
- Dados no Power BI não chegam em tempo real, conforme a entrevista. [F1, F2]

**Nuance importante:** a empresa já possui andon e alarme sonoro. Fabiana não descreveu dificuldade em perceber uma interrupção. A dor que devemos destacar é registrar, consolidar, explicar perdas e analisar com rapidez, sobretudo as microparadas. [F2]

### Usuários e jornada

O operador registra o que ocorreu. Liderança e técnicos consolidam ou conferem. Engenharia e Qualidade verificam especificações, plano de controle, ensaios e performance do produto. Manutenção participa da análise de falhas e da confirmação das interfaces. O sistema deve apoiar essa colaboração sem substituir a decisão técnica. [F2]

**Texto para o slide:** “Registros manuais e sistemas isolados tornam a consolidação dos dados mais trabalhosa. A NHPL precisa de informações rastreáveis de produção, parâmetros, paradas e perdas para apoiar a análise da Engenharia.”

<!-- page -->

## 2 Solução

### O sistema e o que melhora

Propomos um sistema web de registro, planejamento e análise para a NHPL. Ele organiza os dados por máquina, processo, produto, variante, ordem, lote, turno e período. O primeiro caminho é o registro digital manual. A importação de arquivos e a captura de eventos permitem evoluir a entrada de dados conforme as interfaces que TI e Manutenção validarem. [F3]

No cenário deste briefing, o Dashboard apresenta gráficos de plano versus realizado por intervalo e evolução acumulada. Os comandos de registro ficam em suas áreas próprias. Apontamentos reúne produção, paradas, refugos e ocorrências. Indicadores oferece acesso ao painel TV. O CEP reaproveita os campos da referência selecionada para preparar uma nova versão, com revisão e envio consciente pela Engenharia. [F4]

### Fluxo para demonstrar

1. Selecionar NHPL, família, ordem, lote e turno. Consultar o plano aprovado e sua vigência.
2. Registrar produção por período, parâmetros e perdas. Registrar manualmente os quatro horários quando disponíveis: máquina ligada, produção iniciada, produção encerrada e máquina desligada. Nenhum botão aciona o equipamento.
3. Registrar parada, motivo e duração. O encerramento considera o retorno com peças boas validadas. Mostrar uma lacuna ou pendência sem preenchê-la com zero.
4. Acompanhar hora a hora, gráficos, produtividade e indicadores com bases suficientes. Mostrar a versão dos limites e o estudo Cp/Cpk.
5. Encaminhar um desvio à Engenharia, apresentar evidência, registrar decisão e consultar o histórico. Correções preservam o original e exigem decisão por outra pessoa. [F2, F3, F4]

### Regras que dão sentido aos números

Produtividade compara produção bruta com plano aprovado. A meta inicial documentada é 95%. O takt informado é 12 s/peça. Uma hora líquida sugere 300 peças e 285 peças correspondem a 95% desse plano. Um plano informado e aprovado prevalece sobre a sugestão por takt. Parada imprevista não reduz automaticamente o plano. [F2, F3]

OEE considera disponibilidade, desempenho e qualidade. Exige ciclo ideal validado, tempo planejado, operação e boas de primeira passagem. MTBF e MTTR exigem exposição e histórico de falhas/reparos. Para o CEP NHPL, a política exige pelo menos 30 amostras e a entrevista informa coleta por turno. Limites, ciclo ideal real e metas dos demais indicadores ainda precisam de validação. [F2, F3]

**Texto para o slide:** “O sistema registra e relaciona os dados da NHPL, mostra os desvios do plano e reúne as evidências necessárias à decisão da Engenharia. O registro digital funciona como base para a evolução da automação.”

<!-- page -->

## 3 Desenvolvimento do projeto

### Jornada que podemos comprovar

A equipe partiu do enunciado, estudou os materiais fornecidos e organizou as respostas de Fabiana. A descoberta decisiva foi separar o exemplo de selos do piloto NHPL. O escopo passou a considerar montagem de abafadores, rastreabilidade por ordem/lote/turno, hora a hora e a necessidade de captar microparadas. [F1, F2, F3]

O desenvolvimento estruturou cadastros, referências versionadas, registros, planejamento, produtividade e fluxo de Engenharia. A revisão de outro protótipo, MSE, identificou boas referências de visualização e lacunas de governança. Depois, a entrega local incluiu OEE e confiabilidade condicionados às bases, captura de eventos e painel TV. O feedback mais recente propôs simplificar a navegação e acrescentar gráficos. Neste briefing, essa última etapa é considerada concluída apenas no cenário simulado. [F3, F4, F5]

### Método e cronograma

| Etapa da metodologia | Evidência ou situação |
| --- | --- |
| Imersão e entrevista | Enunciado, fotos, planilha e mais de 20 respostas de Fabiana. |
| Organização e decisão | Documentos de fontes, especificação, plano e brainstorming com decisões e pendências separados. |
| Prototipação e revisão | Sistema funcional local, comparação com MSE e ajustes orientados pelo feedback do usuário. |
| Verificação | A entrega anterior registra 141 testes unitários, 20 de regras e 75 arquivos na verificação estática. Esses resultados não validam os ajustes ainda simulados. |
| Mentoria e apresentação | Material orienta mentoria/pré-banca em 08/10 e avaliação MSA em 09/10 às 10h. Confirmar eventuais mudanças com a organização. |

O cronograma indica abertura em 05/10, entrevista/imersão/ideação em 06/10, preparação de pitch em 07/10, mentoria e pré-apresentação em 08/10 e apresentação final em 09/10. Os 20 minutos mencionados são da entrevista por grupo, não a duração do pitch. [F6]

Persona, mapa da empatia, matriz CSD, afinidade e votação aparecem como métodos sugeridos no material. Não afirmar que todos foram executados sem mostrar os respectivos artefatos. O desenvolvimento pessoal de cada integrante deve ser relatado pela própria pessoa. [F6]

**Texto para o slide:** “O projeto evoluiu da entrevista e análise dos materiais para um piloto NHPL com regras documentadas, fluxo funcional e testes locais. As revisões aproximaram a interface do trabalho da produção e da Engenharia.”

<!-- page -->

## 4 Quem já resolve o problema

### Alternativas e referências

| Alternativa | O que oferece | Como posicionar nosso projeto |
| --- | --- | --- |
| Excel, SAP e Power BI usados na MSA | Registro, gestão empresarial e análise conforme os processos existentes. A entrevista relata etapas manuais e sistemas isolados. | Complementar o registro na linha e a rastreabilidade. Não prometer substituir SAP ou dizer que Power BI é incapaz de analisar. [F2] |
| MSE, outro protótipo analisado | Visualização de planta/3D, estados, painel TV, entrada operacional e telemetria demonstrativa. | Reconhecer sua força visual. Comparar plano histórico, referências, CEP e correções rastreáveis com evidências locais. [F5] |
| Factbird | Monitoramento de produção, OEE, paradas e entrada de dados por equipamentos/sensores ou integração. | É uma alternativa comercial mais madura em monitoramento. A adaptação, o custo e a compatibilidade com a NHPL exigem avaliação própria. [F7] |
| Tulip | Fluxos digitais para operadores, acompanhamento de produção, dashboards e coleta com entradas humanas e fontes conectadas. | A solução é configurável. Nosso foco é demonstrar um fluxo delimitado pelas necessidades da NHPL, não superioridade geral sobre a plataforma. [F7] |

As descrições comerciais acima vêm de páginas oficiais consultadas em 07/10/2026. Não obtivemos cotação ou teste de implantação dessas plataformas na MSA. Não presumir que o concorrente não possui uma função apenas porque uma página de marketing não a detalha.

### Comparação honesta com o MSE

A inspeção local do MSE encontrou recursos visuais úteis e riscos em histórico de metas, correções que substituem valores e diagnósticos baseados na referência atual. A comparação não comprovou o estado completo do banco remoto. Seu relatório também antecede parte da evolução do nosso sistema. Usá-lo para explicar escolhas e oportunidades, não para afirmar que o concorrente inteiro é inseguro ou inferior. [F5]

**Texto para o slide:** “Há ferramentas comerciais e protótipos que acompanham produção e OEE. Nosso projeto concentra a solução no fluxo definido para a NHPL, com plano aprovado, referências versionadas e análise técnica rastreável.”

<!-- page -->

## 5 Diferenciais

### Vantagens sustentáveis para este piloto

- **Aderência ao trabalho da NHPL.** Identidade produtiva, ordem, lote, turno e hora a hora seguem as informações de Fabiana. O operador registra nas áreas próprias e a gestão consulta o mesmo modelo de dados.
- **Histórico técnico reconstruível.** Leituras mantêm sua referência e contexto. Correções preservam o original, a justificativa e a decisão. Isso ajuda a explicar por que um dado mudou.
- **Plano aprovado preservado.** Produtividade usa o plano e a meta vigentes no período. Uma revisão posterior não deve reescrever silenciosamente o resultado histórico.
- **Indicadores com bases visíveis.** OEE, confiabilidade e Cp/Cpk exibem condições de cálculo e pendências. Ausência de informação não gera desempenho saudável fictício.
- **Engenharia e Qualidade no fluxo.** Referências, desvios, plano de controle e evidências de ensaio apoiam a análise. O sistema não trata estar dentro de uma faixa como liberação automática do produto.
- **Evolução gradual da captura.** Registro manual centralizado funciona antes de uma integração industrial. Arquivos/eventos podem acrescentar automação após validação de origem, formato e segurança. [F2, F3]

No cenário pós-brainstorming, os gráficos tornam a comparação do plano mais direta. A retirada de barras repetidas e os comandos locais reduzem a disputa entre ações de registro e consulta. O painel TV deriva de Indicadores e utiliza os mesmos resultados. São melhorias previstas na experiência, ainda sem teste de usabilidade concluído. [F4]

### Benefícios esperados e como comprovar

| Benefício esperado | Medição no piloto |
| --- | --- |
| Menor esforço de transcrição/consolidação | Minutos totais por turno para registrar, conferir e consolidar, antes e depois. |
| Dados mais completos | Percentual de registros com contexto e campos obrigatórios preenchidos. |
| Menos inconsistências | Correções necessárias por 100 registros, com critérios iguais nas duas etapas. |
| Análise mais rápida | Tempo entre o registro do desvio e o início/decisão da análise. |
| Microparadas analisáveis | Cobertura dos eventos comparada à referência independente e duração/motivos disponíveis. |

**Texto para o slide:** “A vantagem do projeto está na aderência à NHPL e na confiança dos dados usados pela Engenharia. Os ganhos de tempo, completude e análise serão medidos no piloto.”

<!-- page -->

## 6 Viabilidade técnica

### O que existe e o que ainda falta

O sistema usa HTML, CSS e JavaScript modular, Firebase Auth e Realtime Database, além de bibliotecas de gráficos, CSV e estatística. Há serviços de registro, validações por perfil, planejamento, CEP, análises, histórico e captura local de eventos. A arquitetura permite separar entrada de dados, regras e visualização. O cenário do pitch acrescenta os ajustes de interface definidos no brainstorming. [F3, F4]

O primeiro piloto pode priorizar registro manual digital e importação autorizada. Não exige comprar sensores para cadastrar produção e paradas. Reutilizar computadores ou tablets depende de confirmar disponibilidade e autorização. A automação de microparadas precisa de transições/eventos confiáveis na origem, relógios coerentes, validação de retomada, sequência e tratamento de duplicatas. [F2, F3]

**Disponibilidade relatada não é integração testada:** Fabiana informou possibilidade de acesso/exportação, mas TI e Manutenção devem confirmar interfaces. Também relatou ausência de contadores automáticos. A IHM, a foto ou a marca SIEMENS não confirmam tags, protocolo ou ciclo ideal. Há rede, com restrições rígidas de segurança. [F2]

### Implantação proposta

1. Revisar parâmetros/limites, ciclo ideal, calendário e plano de controle com Engenharia e Qualidade. Definir os responsáveis e os critérios de aceite.
2. Validar a base compartilhada, os perfis nominais e as regras de segurança com TI. Conferir dispositivos, rede, backup e retenção. A apresentação local atual não compartilha dados entre navegadores diferentes.
3. Executar piloto assistido na NHPL com registro digital e comparação com a referência operacional. Medir esforço, completude, erros e tempo de análise.
4. Mapear arquivos/sinais e integrar gradualmente com apoio de Samuel, TI e Manutenção. Conferir microparadas contra observação independente antes de confiar nos indicadores.
5. Ampliar somente após aceite técnico e econômico. SAP/Power BI, OCR, aquisição física e uso em todos os dispositivos permanecem dependentes de validação específica. [F2, F3]

O sistema registra os horários da máquina e da produção. Não comanda ligar/desligar o equipamento. Retirar o rótulo Ligar máquina evita uma promessa de controle físico inexistente. Liberação técnica continua humana e autorizada. [F4]

**Texto para o slide:** “A implantação pode começar pelo registro digital na NHPL e evoluir para arquivos e eventos autorizados. TI, Manutenção, Engenharia e Qualidade validam segurança, referências e aquisição antes do uso industrial.”

<!-- page -->

## 7 Investimentos e custos

### Cenário de referência para discutir o piloto

Os valores abaixo são **premissas de planejamento**, não preços de mercado cotados, despesas realizadas ou orçamento aprovado pela MSA. Consideram um piloto limitado, aproveitamento de infraestrutura existente e trabalho adicional de preparação/implantação. Não incluem aquisição industrial, integração SAP/Power BI, viagens, tributos sobre contratação, licenças corporativas adicionais nem remuneração já investida no desenvolvimento do MVP.

| Item | Premissa | Estimativa |
| --- | --- | --- |
| Ajustes e validação do software | 64 horas a R$ 80/h | R$ 5.120 |
| Revisão de referências e teste do processo | 16 horas a R$ 80/h | R$ 1.280 |
| Treinamento assistido | 8 horas a R$ 60/h | R$ 480 |
| Preparação e revisão de TI | 8 horas a R$ 100/h | R$ 800 |
| Subtotal de implantação | 96 horas propostas | R$ 7.680 |
| Contingência | 20% do subtotal | R$ 1.536 |
| Total de implantação | Cenário de referência | **R$ 9.216** |

Mão de obra interna também tem custo econômico, mesmo sem desembolso de contratação. A empresa deve substituir as taxas pelas suas horas/custos reais. Os 96 h são esforço proposto, não prazo calendário ou horas comprovadamente já trabalhadas.

### Custo recorrente de referência

Manutenção/suporte de 4 h/mês a R$ 80/h: R$ 320/mês. Reserva de infraestrutura: R$ 100/mês. Total de planejamento: **R$ 420/mês**, equivalente a R$ 5.040/ano. O custo total do primeiro ano seria **R$ 14.256**, somando implantação e 12 meses de recorrência.

A reserva de R$ 100 não é uma tarifa Firebase nem inclui todo o ambiente corporativo. Firebase oferece cotas gratuitas e cobrança por uso. A página oficial informa para RTDB no Spark 1 GB armazenado, 10 GB/mês baixados e 100 conexões simultâneas. No Blaze, há cotas e cobrança de armazenamento/download. O custo real exige volume, configuração e aprovação de TI. Não prometer operação sempre gratuita. [F8]

### O orçamento antigo não é o orçamento NHPL

A lista de R$ 8.250 trata de injetora/21 zonas/41 parâmetros. Andon já existe e a entrevista relata quatro sensores indutivos disponíveis, mas não confirma adequação/disponibilidade para este piloto. Módulos IoT e transdutores citados não estão disponíveis. Evitar compras redundantes. Orçar a automação da NHPL depois do levantamento técnico, sem reutilizar a cesta antiga ou somá-la automaticamente a este cenário. [F2, F3]

<!-- page -->

## 8 Viabilidade econômica e retorno

### Memória de cálculo da simulação

Não há economia, redução de refugo ou aumento de OEE medidos em piloto real. Para testar a hipótese econômica, considerar 22 dias de operação por mês e custo interno de R$ 60 por hora. O tempo economizado abaixo representa o total do processo analisado por dia, sem multiplicar novamente por pessoas ou turnos.

Benefício mensal de capacidade = minutos poupados por dia / 60 × 22 dias × R$ 60/h. Benefício líquido = benefício mensal menos R$ 420 de recorrência. Payback simples = R$ 9.216 de implantação dividido pelo benefício líquido mensal, quando positivo.

| Cenário hipotético | Capacidade liberada por mês | Benefício líquido por mês | Payback simples |
| --- | --- | --- | --- |
| 20 minutos poupados/dia | R$ 440 | R$ 20 | 460,8 meses |
| 40 minutos poupados/dia | R$ 880 | R$ 460 | 20,0 meses |
| 60 minutos poupados/dia | R$ 1.320 | R$ 900 | 10,2 meses |

As três linhas são análises de sensibilidade, não resultados da NHPL. A primeira mostra que pequena economia de tempo quase não cobre a recorrência e não justifica o investimento por esse benefício isolado. Na segunda, o investimento ainda não retorna em 12 meses. Na terceira, o benefício bruto anual seria R$ 15.840 frente ao custo de primeiro ano de R$ 14.256, saldo simples de R$ 1.584, sem considerar tributos ou desconto financeiro.

Tempo liberado pode virar capacidade para outras tarefas. Só vira economia de caixa se reduzir um gasto efetivo, como horas extras ou contratação, ou gerar margem adicional comprovada. Não chamar capacidade liberada de dinheiro já economizado.

### Condição para recomendar investimento

Nesse cenário, cerca de 19,1 minutos/dia cobrem apenas a recorrência. Para recuperar a implantação em até 24 meses, seriam necessários aproximadamente 36,5 minutos/dia de benefício equivalente, mantidas todas as premissas. Engenharia e TI devem medir a linha de base e verificar se essa oportunidade existe.

O piloto também pode comprovar redução de refugo e perdas. Qualquer benefício adicional deve usar quantidade efetivamente evitada e custo/margem real, sem contar duas vezes o mesmo tempo recuperado. MTBF, MTTR e OEE não são valores financeiros por si só.

O documento antigo apresenta reduções de MTTR, economia e ROI sem evidência da NHPL. Não usar como resultado ganho de 40% a 60%, economia de R$ 2.200 a R$ 3.800/mês, aumento de OEE ou payback de poucos meses.

**Texto para o slide:** “Estimamos R$ 9.216 para preparar um piloto limitado e R$ 420/mês para suporte e infraestrutura. Com 40 minutos/dia de capacidade liberada a R$ 60/h, o retorno simples seria de aproximadamente 20 meses. Todas as premissas precisam de validação no piloto.”

<!-- page -->

## 9 Equipe

### Responsabilidades confirmadas pelo usuário

| Integrante | Contribuição informada |
| --- | --- |
| Kauan | Sistema. |
| Riquelme | Sistema. |
| Samuel | Automação. |
| Maria Clara | Apresentação. |
| Beatriz | Apresentação. |

Kauan e Riquelme respondem pela frente do sistema. Samuel contribui na frente de automação. Maria Clara e Beatriz organizam a comunicação e a apresentação. Não foi informada uma divisão detalhada de módulos, formação, experiência profissional ou certificações. Não atribuir essas qualificações sem confirmação.

### Complementaridade e aprendizados

A divisão reúne desenvolvimento do sistema, entrada de dados/automação e comunicação da proposta. Para o slide, cada pessoa pode apresentar um aprendizado concreto em uma frase. Sugestões a validar com os integrantes: traduzir necessidade industrial em campos/regras, distinguir takt e ciclo ideal, tratar rastreabilidade, validar possibilidades de captura e comunicar custos sem prometer ganhos não medidos.

Fabiana é a referência consultada sobre a necessidade da empresa. TI, Manutenção, Engenharia e Qualidade são interlocutores necessários ao piloto, não integrantes automaticamente confirmados da equipe ou apoiadores formalmente contratados.

**Texto para o slide:** “Kauan e Riquelme desenvolvem o sistema, Samuel atua na automação, e Maria Clara e Beatriz organizam a apresentação. O time combina as frentes necessárias para transformar os requisitos da NHPL em uma proposta funcional e demonstrável.”

### Organização do deck conforme a metodologia

1. Momento inicial: jornada de um registro, sem estatística de mercado inventada.
2. Problema: registros manuais, consolidação e microparadas.
3. Solução: registro centralizado e decisão de Engenharia.
4. Desenvolvimento: entrevista, materiais, decisões, protótipo e revisão.
5. Protótipo: demonstração curta de plano, produção, parada e análise.
6. Quem resolve: processo atual, MSE, Factbird e Tulip.
7. Diferenciais: aderência NHPL, histórico e referências rastreáveis.
8. Investimentos: custos, premissas, sensibilidade e piloto.
9. Equipe: nomes e contribuições acima.
10. Encerramento: solicitar apoio para validar a NHPL com referências e infraestrutura autorizadas. [F6]

<!-- page -->

## 10 Orientações para a apresentação

### Demonstração e chamada para ação

O roteiro deve acompanhar um único contexto produtivo. Mostrar plano/realizado, registrar produção ou parada, consultar o gráfico, abrir CEP e encaminhar uma análise. Usar outro ator para decidir uma correção quando necessário. Os exemplos são didáticos e não medições da fábrica.

Encerramento sugerido: “Queremos validar um piloto na NHPL com Engenharia, Qualidade, Manutenção e TI. Precisamos confirmar as referências do processo, a infraestrutura permitida e medir os ganhos de coleta e análise antes de ampliar a solução.”

O material não determina a duração do pitch. Confirmar esse limite com a organização e ensaiar no tempo disponível. Conforme o cronograma fornecido, a avaliação MSA está prevista para 09/10 às 10h, sujeita a atualização da organização. [F6]

### Respostas curtas para a banca

- **Já está instalado na fábrica?** Há um MVP funcional local. O cenário de interface deste briefing antecipa ajustes ainda pendentes. Não houve implantação industrial ou teste de captura física na NHPL.
- **O sistema controla a máquina?** Registra dados e horários. Não aciona a máquina.
- **As microparadas já são captadas na NHPL?** Demonstramos eventos e um conector de arquivos. A captura real depende de sinais/exportação e validação de TI/Manutenção.
- **Os limites e o OEE são reais?** Os limites técnicos do exemplo são hipotéticos. OEE real exige referência aprovada e bases completas. A meta de 95% pertence à produtividade.
- **Por que não usar só Power BI?** Power BI continua útil para análise. A proposta organiza o registro e a governança do dado na origem. Integração futura ainda precisa ser validada.
- **Quanto economiza?** Ainda não há resultado medido. Há cenário econômico explícito e plano de medição antes/depois.

<!-- page -->

## Fontes do briefing

**F1 Enunciado:** `Desafio Frente.jpg` e `Desafio verso.jpg`, pasta `Grupo Amarelo - MSA Brasil/Desafio`. Transcrição conferida em `docs/continuidade/2026-10-06/ENUNCIADO_TRANSCRITO.md`. Exige 13 entregáveis mínimos, incluindo gráficos e demonstração funcional.

**F2 Entrevista:** `Downloads/+20 Perguntas Respondidas.txt`, lido integralmente. Escopo, fluxo atual, perfis, indicadores, microparadas, referências, dispositivos e restrições de TI. Respostas completas prevalecem sobre resumos antigos.

**F3 Projeto atual:** `docs/ENTREGA_NHPL_COMPLETA_2026-10-07.md`, código em `app/src/` e relatórios locais. Contagens de testes são evidência da entrega anterior, sem reexecução neste briefing. Lista de materiais antiga foi lida e tratada como hipótese de outro processo.

**F4 Cenário futuro:** `docs/BRAINSTORM_AJUSTES_FINAIS_MSA_2026-10-07.md`. Gráficos, comandos locais, enriquecimento de registros, CEP preenchido, revisão de Coleta e TV por Indicadores permanecem simulados nesta etapa. Realocar Coleta é recomendação, não fato implementado.

**F5 Comparação local:** `docs/COMPARACAO_MSA_MSE_2026-10-07.md`. Inspeção do código MSE, com limitações de autenticação e de confirmação do banco remoto. Não usar seus dados fictícios como limites NHPL.

**F6 Metodologia:** `Downloads/Cronograma-Metodologia-Pitch.pptx`, slides 1 e 3 a 19. O deck foi lido, não editado. Os percentuais genéricos de atenção/memória dos slides não têm fonte identificada e não entram como evidência deste pitch.

**F7 Alternativas comerciais:** páginas oficiais [Factbird Production Monitoring](https://www.factbird.com/solutions/production-monitoring-software) e [Tulip Production Management](https://tulip.co/production-management/), consultadas em 07/10/2026. Descrições funcionais, sem cotação ou comparação de implantação na MSA.

**F8 Infraestrutura:** [Firebase Pricing](https://firebase.google.com/pricing) e [Realtime Database Billing](https://firebase.google.com/docs/database/usage/billing), consultadas em 07/10/2026. Tarifas/cotas podem mudar. Valores em reais e horas deste briefing são premissas próprias, sem conversão cambial de tarifas oficiais.

**Estado final deste documento:** conteúdo preparado para o pitch, com simulação explícita dos ajustes. Nenhuma implementação do brainstorming, alteração operacional, publicação ou implantação ocorreu nesta etapa. A implementação pode ser o próximo trabalho, conforme orientação do usuário.
