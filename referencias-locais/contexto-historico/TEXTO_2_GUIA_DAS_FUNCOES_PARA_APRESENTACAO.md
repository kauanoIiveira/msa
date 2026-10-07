# Guia das funções para apresentar o sistema MSA

Este texto explica a versão local conferida em 06/10/2026. Use junto de `TEXTO_1_ENTREGAVEIS_DO_DESAFIO.md`, que relaciona as funções às duas folhas do desafio e registra a diferença encontrada no GitHub.

## Objetivo do sistema

O sistema permite registrar dados de produção com contexto, consultar o comportamento do processo e encaminhar evidências à Engenharia. A equipe pretende reduzir a transcrição repetida e facilitar a identificação de problemas. Os ganhos de produtividade ou redução de refugo ainda precisam de medição em um piloto.

Uma explicação de abertura possível: “Nossa solução reúne os registros da produção, mostra desvios e conserva o caminho entre a coleta, a análise e a decisão da Engenharia.”

## Entrada, login e conta

### Login

A primeira tela solicita e-mail e senha. O botão de visualização mostra ou oculta a senha; Entrar autentica a conta no Firebase e verifica o acesso ao workspace. A interface informa falhas de credencial ou conexão e evita reenviar a mesma tentativa enquanto ela está em andamento.

A sessão pode ser restaurada após recarga quando ainda válida. Sair encerra o acesso da conta; o código revoga os serviços associados à sessão encerrada. Não existe cadastro livre de usuários na tela inicial.

### Perfis de acesso

- **Administração:** cadastra entidades, ativa/inativa cadastros, registra operações, define referências e metas e realiza decisões da Engenharia.
- **Engenharia:** registra operações, cria versões de referência e metas e decide análises e correções autorizadas.
- **Operação:** registra coletas e apontamentos, encaminha análises e propõe correções.
- **Consulta:** acompanha os dados, sem permissões de registro ou decisão.

As permissões dependem da conta e do vínculo ao workspace. Esconder um botão não é a única proteção: serviços e regras de acesso também participam da validação.

### Menu da conta

O ícone da conta abre nome, e-mail, perfil, acesso às configurações e saída. Na simulação, Sair da simulação encerra o cenário temporário. Na conta real, Sair encerra a sessão.

## Navegação e filtros

A lateral contém Dashboard, Parâmetros, Apontamentos, Engenharia, CEP, Histórico, Cadastros e acesso a Configurações. Em telas pequenas, o botão de menu abre a navegação lateral.

### Máquina, processo e produto

Escolha a máquina; o filtro de processos oferece os processos vinculados a ela. O filtro de produtos oferece os produtos associados ao processo. Esses campos definem tanto o recorte consultado quanto o contexto dos novos registros.

### Período

O filtro oferece Hoje, últimos 7, 14 ou 30 dias e período personalizado. O sistema usa o calendário de São Paulo. Confira o recorte antes de comparar totais ou demonstrar uma meta, pois o período participa do cálculo.

### Lote, ordem, receita e turno

O bloco expansível permite registrar e consultar esses identificadores. Um campo vazio consulta os diferentes grupos daquele recorte; os estudos CEP continuam separados por contexto e versão. Ao trocar máquina, processo ou produto, a interface limpa os filtros adicionais.

### Base Operacional, Apresentação e simulação

- **Operacional:** consulta registros digitais de operação/importação, excluindo os de origem fictícia `demo`.
- **Apresentação:** consulta registros fictícios preservados no banco, identifica sua natureza e desabilita gravações.
- **Simulação local:** cria um cenário fictício em memória, no qual os formulários podem ser demonstrados sem alterar o Firebase.

Apresentação e simulação local são recursos diferentes. Uma usa consulta de registros identificados; a outra usa um ambiente temporário. Nunca apresente os números desses ambientes como resultados da fábrica.

## Dashboard: Visão da produção

### Produção bruta e peças boas

O cartão mostra a soma da produção bruta no recorte e informa peças boas quando existem apontamentos dessa base. A pessoa registra as duas bases separadamente. O sistema não deduz automaticamente boas a partir de bruta e refugo.

### Tempo de parada

O cartão apresenta minutos de parada e quantidade de eventos abertos. O cálculo trata sobreposições da mesma máquina para evitar contar duas vezes o mesmo período. Paradas abertas permanecem identificadas e não representam duração final encerrada.

### Refugo

O painel mostra o percentual e o total de peças refugadas quando a produção bruta, o contexto e a cobertura permitem a comparação. Uma perda em kg não entra no numerador do percentual de peças. Sem os dados necessários, o indicador fica indisponível.

### Fila da Engenharia

Mostra análises aguardando atendimento ou em análise no contexto consultado. A lista permite abrir detalhes e seguir para a área da Engenharia. O ícone de sino no topo também leva à Engenharia; não representa um serviço de notificações externas.

### Produção por dia

O gráfico permite acompanhar apontamentos de produção bruta e boas ao longo do período. Ao passar o ponteiro, a pessoa consulta valores e identificação do ponto. A agregação precisa respeitar os intervalos informados: um total sem detalhamento não comprova produção em cada hora ou dia atravessado.

### Principais paradas

O gráfico classifica motivos pela duração registrada. Serve para escolher quais causas investigar primeiro. Motivos simultâneos podem sobrepor tempo; por isso a soma do ranking pode diferir do tempo total sem duplicação. Não apresente esse ranking como prova de causalidade do déficit de produção.

### Aquecimento e parâmetros do processo

As zonas Z1 a Z21 mostram última leitura e situação. Clicar em uma zona abre seu detalhe. Os demais parâmetros aparecem em tabela, com leitura, unidade, referência e situação.

As 41 características incluem temperatura ambiente; aquecimento; medida e velocidade do passo; tempos de vácuo, resfriamento, destaque, contramolde, prensa e esteira; retardos de etapas; pressão de ar e vácuo. São referências da fonte fornecida, não medições ao vivo por padrão.

### Metas fora do esperado

A seção compara indicadores com metas cadastradas quando o período e o contexto permitem. Mostra nome, resultado, referência mínima/máxima e situação. A avaliação exige a janela correspondente à meta e dados suficientes; não compara indiscriminadamente uma meta semanal com uma consulta diária.

## Parâmetros e leitura das situações

A página Parâmetros reúne o catálogo de referência e os parâmetros adicionais do processo. A busca filtra pelo nome. Cada linha mostra última leitura, limite da versão e situação.

### Significado dos estados

- **Dentro da faixa:** leitura válida dentro de uma regra aprovada.
- **Fora da faixa:** leitura válida inferior ao mínimo ou superior ao máximo declarado.
- **Limite pendente:** referência não aprovada, pendente ou inadequada para a avaliação.
- **Sem leitura:** ausência de valor ou de observação no recorte, conforme o caso.
- **Leitura inválida:** entrada que não pôde ser tratada como número válido.
- **Não cadastrado / Sem versão:** falta configuração para aquela referência.
- **Horário indefinido:** não há informação suficiente para escolher uma única leitura como a última.
- **Revisão conflitante:** existem correções aprovadas incompatíveis para o mesmo registro.
- **Cadastro duplicado:** há mais de um parâmetro ativo associado ao mesmo código de referência.

Zero informado é um valor. Campo vazio é ausência. O sistema mantém essa diferença para não apresentar uma condição saudável sem evidência. As situações aparecem em texto, além das cores.

### Detalhe do parâmetro

Clicar no nome abre leitura, unidade, situação, referência e data, gráfico histórico, média, dispersão descritiva e Cp/Cpk quando disponíveis. O detalhe escolhe o grupo correspondente ao contexto completo e à versão da última leitura; não mistura receitas ou turnos apenas porque o parâmetro tem o mesmo nome.

Uma média descreve as leituras utilizadas, mas não prova que cada leitura ficou dentro da faixa. O desvio do detalhe é descritivo populacional; o cálculo de capacidade utiliza o método CEP e seus requisitos. A explicação de indisponibilidade precisa acompanhar o número na apresentação.

## Cadastros e preparação para coletar

### Máquinas

Cadastre nome e código para identificar o equipamento. Uma máquina cadastrada ainda não é uma coleta e ainda precisa de processo e produto vinculados. Ativar/inativar altera a disponibilidade de cadastro sem apagar seu histórico.

### Processos

Cadastre a operação produtiva e selecione a máquina correspondente. Os parâmetros pertencem ao processo. Esse vínculo evita registrar uma característica em um processo incompatível.

### Produtos

Cadastre o produto e marque os processos aos quais ele pertence. Isso permite consultar resultados do mesmo processo considerando o produto selecionado. Não há gestão completa de ordens de fabricação nessa tela; o campo Ordem do contexto identifica o registro.

### Parâmetros e catálogo de referência

O cadastro básico informa nome, código e processo. Em Cadastrar referências, o administrador pode instalar o catálogo de 41 características no processo escolhido, indicando medição ou setpoint para cada item. O procedimento cria referências em rascunho e não gera leituras.

### Versões de referência e limites

Limites ou Nova versão abre unidade, natureza, status e regra. Uma medição é um valor observado; um setpoint é um ajuste definido na máquina. O sistema pode comparar ajustes com suas referências, mas não calcula capacidade de processo para um setpoint.

A regra pode ser faixa bilateral, mínimo, máximo ou pendente. Pendente permanece em rascunho. Criar uma versão nova conserva as anteriores; cada coleta guarda qual versão utilizou. Marcar Aprovado no software é uma decisão da pessoa autorizada, não uma confirmação automática da empresa.

### Motivos

Cadastre motivos por tipo: parada, refugo, perda de material ou retrabalho. Os formulários exigem motivos compatíveis com o registro. Essa classificação organiza a análise das causas informadas pela operação.

### Metas

Cadastre nome, indicador, limite, comparação e datas. Os indicadores disponíveis são produção bruta em peças, tempo parado em minutos, refugo em peças e perda de material em kg. O contexto selecionado acompanha a meta.

Exemplo de uso: definir um máximo de tempo parado no período e consultar o mesmo contexto/período no Dashboard. Use valores fictícios identificados durante a apresentação; a entrevista não homologa uma meta da fábrica.

## Nova coleta

Abra Nova coleta no Dashboard ou em Parâmetros. Confira contexto e versões, informe as leituras e confirme o formulário. Os parâmetros ativos do processo precisam de versões disponíveis para compor o registro.

O sistema aceita números com vírgula decimal, conserva o texto original e diferencia entradas válidas, ausentes e inválidas. Deixar um valor vazio não informa zero. A coleta manual registra o instante do apontamento; a tela não oferece captura automática nem fotografia convertida em leitura.

Na base autenticada, a confirmação grava segundo as permissões. Na simulação, o mesmo fluxo opera em memória. Use o Histórico para localizar a coleta e abrir seus detalhes.

## Apontamentos de produção, paradas e perdas

### Produção

Em Produção > Novo registro, informe quantidade em peças, base bruta ou boas e início/fim. Quantidades fracionárias ou negativas não são válidas. Zero explícito é permitido. O intervalo deve ter fim posterior ao início.

Registre os intervalos com a granularidade necessária. Se o objetivo é acompanhar cada hora, um único total cobrindo várias horas não permite determinar quanto aconteceu em cada uma.

### Paradas

Em Paradas > Novo registro, informe início, motivo e classificação planejada. O evento fica em aberto. Encerrar solicita o fim e conserva o motivo original. Uma mudança de motivo de um registro encerrado deve seguir o fluxo de correção.

É possível informar segundos, por exemplo um evento de 30 segundos. Esse exemplo serve para demonstrar precisão do registro, não para afirmar uma duração típica da máquina. Sem integração, uma pessoa precisa apontar a ocorrência.

### Perdas

Em Perdas > Novo registro, escolha refugo, material ou retrabalho, unidade, quantidade e motivo. Peças exigem inteiro positivo; kg admite decimal positivo. O motivo precisa corresponder ao tipo.

Refugo representa quantidade informada como rejeitada; material registra perda física na unidade informada; retrabalho conserva um registro separado. O software não mede a perda nem identifica seu motivo por sensor.

### Detalhes dos registros

O botão Detalhes abre identificador, autor, contexto e campos relevantes, como horários, motivo e leituras. É também o ponto de entrada para propor uma correção quando permitida. A apresentação deve mostrar esse vínculo entre o número agregado e o registro que o originou.

## Hora a hora e microparadas

Abra Apontamentos > Hora a hora. Escolha o dia, informe a meta/h para a consulta e o limite de duração da microparada, inicialmente 60 segundos.

A tabela apresenta 24 horários, produção bruta, boas, meta, diferença e situação da hora. A diferença é produção bruta menos meta para uma hora encerrada com dados suficientes. A hora corrente aparece Em andamento e não recebe déficit fechado; horas futuras permanecem identificadas.

Um apontamento inteiramente dentro de uma hora pode compor aquela hora. Um intervalo que cruza horas ou dias permanece preservado e não alocado. O sistema não presume ritmo constante para repartir o total e informa quando isso impede interpretar a quantidade da hora.

Exemplo fictício: com meta de consulta de 290 peças e apontamento bruto de 280 peças numa hora encerrada, a diferença é -10 peças. Esse número não identifica a causa e não comprova que 290 seja meta aprovada da empresa.

Microparadas são eventos não planejados, encerrados, com duração positiva e dentro do limiar escolhido. A tela mostra quantidade, segundos acumulados sem duplicação, eventos abertos e última atualização de registro. Sobreposições são unidas por máquina. Falta de evento não prova ausência de microparadas.

## Histórico e exportação

As abas Coletas, Produção, Paradas, Perdas, Análises e Correções permitem consultar o recorte selecionado. Detalhes abre a informação específica de cada tipo. Coletas podem ser enviadas à Engenharia.

O botão Exportar gera CSV dos registros pertinentes à página/aba. Ele inclui identificadores, contexto, origem e campos daquele tipo de registro. No CEP, Exportar estudo gera um relatório próprio com resultados e observações. A exportação requer clique; não há agendamento ou envio automático.

## Importação CSV

Em Histórico > Coletas > Importar CSV, selecione o arquivo ou informe o conteúdo, mantenha uma identificação de fonte e confira o contexto.

O formato apresentado é `date;parameter;raw;unit`. A data usa `YYYY-MM-DD`; o parâmetro pode ser nome, código ou ID do processo. Se houver nomes/códigos ambíguos, use o ID. A unidade, quando informada, precisa corresponder à versão, sem conversão presumida.

Conferir importação mostra linhas, versões, valores originais, erros e avisos, sem gravar. A confirmação exige a revisão da prévia. Leituras ausentes ou inválidas continuam identificadas; datas sem hora não recebem um horário inventado.

A identificação estável de fonte, linha e contexto permite reconhecer uma reimportação igual sem duplicar os registros. Conteúdo diferente para a mesma identificação gera conflito. Mantenha a identificação da fonte ao reconciliar uma importação interrompida. Esta tela importa coletas de parâmetros, não todos os tipos de apontamento.

## Engenharia e decisões

### Análises

Em Histórico > Coletas, Enviar à Engenharia solicita o escopo da análise. O registro entra em Aguardando análise. Uma pessoa com perfil autorizado usa Iniciar, passando para Em análise, e depois Decidir, escolhendo aprovação ou rejeição com justificativa.

Os detalhes conservam o caminho entre solicitação, início e decisão. A decisão concluída é terminal nesse fluxo; um novo ciclo exige um novo encaminhamento. A tela não aciona equipamento e não substitui o procedimento de liberação física da fábrica.

### Propostas de correção

Em Detalhes, Propor correção permite ajustar leituras; quantidade e intervalo de produção; quantidade/motivo de perda; ou horários/motivo de parada encerrada, conforme o tipo. O autor informa justificativa. Contexto, origem, unidade e versão permanecem preservados.

Outra pessoa da Engenharia ou administração confere original e proposta e decide com justificativa. O autor não pode aprovar a própria correção, mesmo sendo administrador. Para demonstrar esse passo com contas reais, é necessário um segundo usuário autorizado.

Uma proposta aprovada entra na visão efetiva usada pelos cálculos; o original continua armazenado. Propostas rejeitadas não substituem a informação. Se houver correções aprovadas conflitantes, o sistema diagnostica a situação e restringe a interpretação, em vez de escolher uma delas sem critério.

## CEP e capacidade

### Escolha da fonte e do estudo

Abra CEP na lateral. A página oferece Registros do sistema e Planilha fornecida pela empresa. Selecione a característica. Nos registros do sistema, escolha a versão e o contexto do estudo; na planilha, a referência inicial é não aprovada e pode ser comparada com uma versão compatível cadastrada.

O estudo usa uma característica, uma versão e um contexto por vez. Observações de receitas, lotes ou turnos distintos não são misturadas apenas por pertencerem à mesma máquina.

### Cartas I e MR

A carta I mostra as observações individuais, média, limites de controle estimados e especificações quando aplicáveis. A carta MR mostra a diferença absoluta entre observações consecutivas. Uma lacuna interrompe a amplitude móvel, evitando ligar medições através de uma leitura ausente.

O método entregue é I-MR, fase I: o próprio conjunto selecionado fornece os limites exploratórios. O cálculo usa `sigma dentro = MR médio / 1,128` e limites da carta I iguais à média mais ou menos três vezes essa estimativa. Isso corresponde à abordagem de cartas de indivíduos descrita pelo [NIST](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc322.htm).

**Limites de especificação** vêm da referência definida pela Engenharia. **Limites de controle** vêm do comportamento estimado do estudo. Uma leitura dentro da especificação pode participar de um processo com sinal de instabilidade; as duas avaliações respondem a perguntas distintas.

### Média, dispersões e índices

- **Média:** valor central das observações válidas utilizadas.
- **Sigma dentro:** estimativa de variação pelas amplitudes móveis entre pares consecutivos.
- **Sigma global:** desvio amostral do conjunto de observações válidas.
- **Cp:** compara a largura da especificação com seis vezes o sigma dentro.
- **Cpk:** também considera a posição da média em relação aos limites, usando o lado mais restritivo.
- **Pp e Ppk:** usam a dispersão global amostral nos cálculos correspondentes.

A interpretação de capacidade exige avaliar estabilidade, especificações e hipóteses estatísticas; os índices desta implementação assumem distribuição normal. Um valor alto isolado não homologa processo ou instrumento. [Referência de capacidade do NIST](https://www.itl.nist.gov/div898/handbook/pmc/section1/pmc16.htm).

### Sinais e motivos de indisponibilidade

As regras implementadas identificam ponto além de três sigmas na carta I, amplitude móvel acima do limite e oito observações consecutivas do mesmo lado da média. Havendo sinal, a capacidade fica indisponível e exige investigação. Ausência de sinal nessas regras não prova estabilidade.

Os índices também ficam indisponíveis diante de referência não aprovada, natureza de setpoint/desconhecida, faixa inválida ou unilateral, unidade histórica incompatível, ordem não confirmada, amostra/pares insuficientes, dispersão zero, cobertura incompleta ou revisão conflitante. A tela explica o motivo.

O mínimo inicial de 25 leituras pode ser configurado para o estudo. Esse parâmetro não é homologação da empresa nem garantia de suficiência estatística. Não reduza o mínimo ou confirme a ordem apenas para obter um índice na apresentação.

### Planilha histórica e conferência da fonte

A fonte contém 41 características com 17 observações cada, 121 números armazenados como texto e 14 vazios. O sistema conserva essa informação e apresenta a conferência das fórmulas/resultados salvos, sem editar o original ou enviar suas observações ao Firebase.

Em Tempo destacar, incluindo os números em texto, a média recalculada é aproximadamente 0,858824 segundo e o desvio populacional é 0,049215 segundo. Esse desvio serve para comparar a estatística da planilha; ele não é o sigma dentro das cartas nem o sigma global amostral do estudo CEP.

Há referências pendentes de esclarecimento, como faixa invertida do contramolde, zonas com 0/0, pressão/vácuo com interpretação unilateral e natureza de ajuste ou medição. A fonte histórica não vira referência industrial aprovada por estar carregada no sistema.

### Exportação e encaminhamento

Exportar estudo gera CSV com fonte, período, contexto, versão, método, contagens, dispersões, índices, diagnóstico e observações. O histórico inclui origem/célula e o relatório diferencia período real das observações e janela de consulta.

Um estudo dos registros do sistema pode ser encaminhado à Engenharia. O encaminhamento vincula a análise a uma coleta do estudo e registra seu escopo; não cria uma baseline congelada de fase II nem libera automaticamente a máquina.

## Configurações

- **Perfil:** consultar e-mail e papel e atualizar o nome da conta autenticada.
- **Senha:** informar a senha atual, nova senha e confirmação; a alteração exige reautenticação.
- **Tema:** claro, escuro ou preferência do sistema, com persistência da escolha.
- **VLibras:** ativar o recurso externo de tradução em Libras; depende de disponibilidade/conexão.
- **Tabelas compactas:** alterar a densidade de apresentação.
- **Período inicial:** escolher 7, 14 ou 30 dias para a consulta inicial.
- **Restaurar preferências:** voltar às preferências de consulta previstas, sem apagar registros.

## Simulador e sequência de apresentação

Na entrada, Abrir simulação local permite demonstrar sem autenticar uma conta real. No Dashboard, Simular cenário permite trocar o cenário. Os 13 casos são:

- Processo dentro dos limites.
- Parâmetro fora da faixa.
- Parada e retomada.
- Refugos e perda de material.
- Meta não atingida.
- Leitura ausente.
- Leitura inválida.
- Limite pendente.
- Dispersão zero.
- Amostra insuficiente.
- Análise pela Engenharia.
- CEP com estudo estável de 60 medições.
- CEP com sinal de instabilidade.

Os cenários exercitam os serviços do sistema com dados fictícios em memória. Cadastros, apontamentos e decisões feitos ali não alteram o Firebase. Voltar aos registros/Sair da simulação encerra esse contexto temporário e retorna ao acesso anterior quando aplicável.

Uma sequência de apresentação possível:

1. Explicar contexto e separar registros reais de cenários fictícios.
2. Mostrar Dashboard e uma leitura, abrindo o registro que a originou.
3. Demonstrar coleta, produção, parada curta e perda.
4. Mostrar Hora a hora, ausência de dados e tratamento de intervalos que cruzam horários.
5. Mostrar prévia CSV e proposta de correção, explicando a decisão por segunda pessoa.
6. Mostrar CEP estável e depois instável, distinguindo especificação, controle e capacidade.
7. Encaminhar uma análise e mostrar a justificativa/histórico da Engenharia.
8. Encerrar com o piloto necessário para integrar equipamentos e validar referências, frequência e resultados.

## Limites que precisam acompanhar a fala

Não há OCR, QR, IA, coleta automática por sensores/CLPs/IHMs, OEE completo, API REST pública, notificação externa ou exportação agendada. O acompanhamento em tempo real reage a registros no banco, não à produção física sem integração.

NHPL e 290 peças/hora vieram de uma transcrição parcial não garantida pelo usuário. Grafia, máquina, produto e aprovação da meta ainda precisam de confirmação. Sensores mencionados na entrevista não comprovam integração pronta.

O sistema pode ajudar a registrar, organizar e investigar; ganhos financeiros ou industriais precisam de comparação medida pela empresa. Os testes do software validam comportamentos e cálculos, não homologam o processo fabril.
