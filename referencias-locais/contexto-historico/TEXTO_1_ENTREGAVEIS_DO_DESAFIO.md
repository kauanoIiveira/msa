# Entregáveis do desafio e cobertura do sistema

Conferência da versão local em 06/10/2026, comparando o código com as folhas de entregáveis obrigatórios e opcionais fornecidas pelo usuário.

## Como interpretar este documento

**Implementado** significa que existe uma função correspondente no MVP. Isso não significa integração com a fábrica, homologação dos limites industriais ou comprovação de ganhos de produtividade. **Parcial** identifica o que existe e o que falta. **Não implementado** identifica uma função ausente.

Nesta conferência, os 100 testes unitários e a verificação estática de 53 arquivos passaram. Os testes de navegador e emulador da entrega anterior constam em `VERIFICACAO_CEP_MSA_2026-10-06.md`; não foram repetidos nesta redação.

**Situação do GitHub:** no remoto configurado nesta pasta, `kauanoIiveira/msa`, a branch `main` contém apenas o README e a `master` aponta para `a268ddc`, a entrega anterior. A versão local descrita aqui contém mudanças ainda não commitadas. Este documento não comprova publicação do sistema atualizado nem funcionamento de um site hospedado.

## Entregáveis obrigatórios

### Cadastro de máquinas, processos e/ou produtos

**Implementado. Onde: Cadastros > Máquinas, Processos e Produtos.**

O administrador cadastra nome e código, vincula cada processo a uma máquina e associa o produto a um ou mais processos. A interface permite ativar e inativar cadastros sem apagar seu histórico. O vínculo precisa existir antes de registrar a operação: máquina, processo e produto formam o contexto do registro.

### Cadastro dos parâmetros e dados de produção a serem monitorados

**Implementado. Onde: Cadastros > Parâmetros; Parâmetros; Apontamentos.**

O administrador cadastra parâmetros do processo. A unidade, a natureza e os limites pertencem às versões de referência definidas pela Engenharia. Existe um catálogo de 41 características extraídas dos materiais fornecidos, incluindo 21 zonas de aquecimento, tempos, retardos, pressão, vácuo e medida do passo. Também é possível cadastrar outros parâmetros.

Produção, paradas, refugos, perda de material e retrabalho têm formulários próprios. O catálogo não cria leituras de produção nem aprova limites por conta própria.

### Definição de limites ou metas para os indicadores aplicáveis

**Implementado. Onde: Cadastros > Parâmetros > Limites; detalhe do parâmetro > Nova versão; Cadastros > Metas.**

Engenharia ou administração cria versões com unidade, natureza de medição ou setpoint, status de rascunho ou aprovado e regra de faixa, mínimo, máximo ou pendente. Uma faixa exige mínimo menor que máximo. A coleta conserva a versão utilizada, preservando a referência aplicada naquele momento.

As metas cadastradas abrangem produção bruta em peças, tempo parado em minutos, refugo em peças e perda de material em kg. Cada meta tem contexto, período, valor e comparação mínima ou máxima. Não existe cadastro de meta de Cp/Cpk. Em Hora a hora, a meta/h digitada vale para a consulta e não constitui uma meta industrial homologada.

### Registro digital dos dados coletados

**Implementado. Onde: Dashboard ou Parâmetros > Nova coleta; Histórico > Coletas > Importar CSV.**

A pessoa autorizada informa as leituras e seleciona suas versões. O sistema conserva o valor original digitado, o valor interpretado, a situação da leitura, o autor, a data e o contexto. Campo vazio permanece ausente; texto não numérico pode permanecer como leitura inválida para análise, sem virar zero.

O CSV permite importar coletas após prévia e confirmação. Não há leitura de fotografias por OCR nem aquisição direta da IHM.

### Registro de produção, incluindo quantidade produzida e período

**Implementado. Onde: Apontamentos > Produção > Novo registro.**

O formulário registra quantidade em peças, base bruta ou boas, início e fim. A quantidade deve ser inteira e não negativa, e o intervalo precisa ser válido. Os indicadores usam esses registros para acompanhar a produção.

Bruta e boas são apontamentos distintos. O sistema não presume peças boas quando elas não foram informadas. A visão por hora utiliza intervalos compatíveis com cada hora, sem distribuir um total diário de forma inventada.

### Registro de paradas de máquina, duração e motivo

**Implementado. Onde: Apontamentos > Paradas > Novo registro e Encerrar.**

O usuário informa início, motivo e se a parada foi planejada. O evento permanece aberto até alguém registrar o fim. A duração decorre dos horários; os formulários preservam segundos, permitindo registrar eventos curtos.

O tempo total une intervalos sobrepostos da mesma máquina para evitar duplicação. O ranking por motivo pode conter sobreposição e deve ser interpretado com essa ressalva. A captura de parada é manual; sensores não iniciam esses eventos no MVP.

### Registro de refugos, perdas e respectivos motivos

**Implementado. Onde: Apontamentos > Perdas > Novo registro; Cadastros > Motivos.**

O usuário escolhe refugo, perda de material ou retrabalho, informa quantidade, unidade e motivo compatível. O sistema aceita peças e quilogramas, preservando essas unidades. Quantidades em peças precisam ser inteiras; quilogramas podem ter casas decimais.

O percentual de refugo utiliza refugo em peças dividido pela produção bruta em peças quando o recorte oferece dados compatíveis. Ausência de registro não comprova ausência de perdas. Peças e kg não são somados em um único total.

### Organização e armazenamento estruturado das informações

**Implementado. Onde: registros autenticados no Firebase Realtime Database; consulta no Histórico.**

O sistema organiza máquinas, processos, produtos, parâmetros, versões, motivos, metas, coletas, produção, perdas, paradas, análises e correções em estruturas próprias. Os registros conservam identificadores e vínculos; o acesso depende de autenticação, vínculo ao workspace e permissões.

O simulador usa um repositório temporário em memória. Seus dados não persistem no Firebase.

### Associação dos registros à máquina, processo ou produto

**Implementado. Onde: filtros superiores e contexto de lote, ordem, receita e turno; detalhes dos registros.**

Os registros têm máquina, processo e produto. Também podem conservar lote, ordem, receita e turno. A validação confere os vínculos entre as entidades. A consulta e o CEP usam esse contexto para evitar misturar operações diferentes, e os estudos estatísticos também separam versões de referência.

### Histórico dos dados coletados para consulta e análise

**Implementado. Onde: Histórico.**

As abas mostram coletas, produção, paradas, perdas, análises e correções. Os filtros selecionam período e contexto, e o botão Detalhes permite consultar informações do registro, autor, horários, leituras ou decisões, conforme o tipo.

O detalhe do parâmetro e o CEP acrescentam análise da série. Consultas incompletas, ambiguidades de horário e conflitos de revisão precisam ser respeitados na interpretação.

### Dashboard com indicadores e gráficos de acompanhamento

**Implementado. Onde: Dashboard, com título Visão da produção.**

O painel reúne produção bruta, peças boas, tempo parado, percentual de refugo e fila da Engenharia. Mostra produção por dia, principais motivos de parada, zonas de aquecimento, parâmetros do processo e metas fora do esperado.

Os gráficos oferecem consulta dos valores pelo ponteiro. O painel usa os filtros selecionados e mantém ausência como Sem dados. Não existe cálculo de OEE completo nesta entrega.

### Identificação visual de desvios e situações críticas

**Implementado. Onde: Dashboard, Parâmetros, CEP e capacidade e Engenharia.**

O sistema diferencia dentro ou fora da faixa, limite pendente, leitura ausente, leitura inválida, ausência de cadastro ou versão, horário indefinido e conflito de revisão. As metas podem gerar avisos visuais, e as cartas CEP indicam os sinais das regras implementadas.

Esses avisos aparecem no sistema. Não há envio de alerta por WhatsApp, Teams, e-mail ou notificação push.

### Demonstração do fluxo funcional por meio de um protótipo

**Implementado. Onde: login > Abrir simulação local; Dashboard > Simular cenário.**

Existem 13 cenários em memória para demonstrar leituras, desvios, paradas, perdas, metas, problemas de dados, Engenharia e CEP. É possível percorrer os formulários e observar os efeitos sem gravar no Firebase.

O fluxo demonstrável é cadastro e referência, registro, acompanhamento, consulta, análise humana e decisão rastreável. Os cenários são fictícios e não representam desempenho da fábrica.

## Entregáveis opcionais

### Leitura automática por OCR a partir de fotos da IHM

**Não implementado.** As fotografias são fontes de referência. O sistema recebe digitação ou CSV; não extrai números de imagens.

### Coleta automática diretamente de máquinas, CLPs ou IHMs

**Não implementado.** Não há comunicação física com equipamento industrial. A integração depende de acesso, protocolos, tags, permissões e validação com a empresa.

### Dispositivos IoT para coleta de dados de produção

**Não implementado.** A entrevista sugere sensores existentes, mas não confirma uma integração do MVP. Dispositivos ou tecnologias propostos pela equipe não constituem uma instalação entregue.

### Identificação por QR Code

**Não implementado.** A seleção de máquina, processo e produto ocorre pelos cadastros e filtros. Não há leitor ou emissão de QR Code na interface.

### Alertas automáticos para parâmetros fora dos limites

**Implementado como identificação visual no sistema. Onde: Dashboard e Parâmetros.** A avaliação compara a leitura com a versão aprovada e apresenta a situação. A atualização acompanha os registros digitais; a origem da medição continua manual ou importada. Não há canal externo de notificação.

### Alertas para Cp, Cpk ou outros indicadores abaixo das metas

**Parcial. Onde: CEP e capacidade; Dashboard; Cadastros > Metas.** O sistema calcula Cp/Cpk sob os requisitos do estudo e informa indisponibilidade ou sinais de instabilidade. Também compara outros indicadores com metas cadastradas.

Não existe uma meta configurável de Cp/Cpk nem um alerta específico por esses índices ficarem abaixo de um limiar. Mostrar o índice e bloquear um estudo inadequado não equivale a esse alerta.

### Alertas para excesso de paradas, refugos ou perdas

**Implementado para metas compatíveis com o recorte. Onde: Cadastros > Metas e Dashboard.** É possível definir máximos de tempo parado, refugo em peças e perda de material em kg. O aviso aparece quando os dados permitem comparar o contexto e o período da meta. Uma parada aberta impede tratar seu tempo como total final para essa comparação.

### Classificação e análise dos principais motivos de parada e refugo

**Parcial. Onde: Cadastros > Motivos, Apontamentos > Perdas e Dashboard > Principais paradas.** O sistema classifica motivos e apresenta o ranking visual de paradas. Os cálculos internos também agrupam refugo, material e retrabalho por motivo, mas não há um painel visual equivalente de ranking de refugos ou Pareto completo desses itens.

### Fluxo digital de análise e liberação pela Engenharia

**Implementado como fluxo de decisão humana. Onde: Histórico > Coletas > Enviar à Engenharia; Engenharia > Análises.** Os estados são Aguardando análise, Em análise, Aprovado e Não aprovado. A decisão exige justificativa e conserva o histórico. A aprovação digital não aciona a máquina nem libera fisicamente a produção.

### Histórico de análises, ocorrências e liberações

**Implementado para registros, análises e decisões digitais. Onde: Engenharia e Histórico.** As análises conservam transições e justificativas; as correções conservam proposta e decisão. As ocorrências produtivas estão nas coletas e apontamentos. Não existe um módulo separado de manutenção, incidentes ou liberação física.

### Acesso por tablet ou smartphone

**Implementado como aplicação web responsiva.** A interface adapta navegação, formulários e consulta a telas menores. A entrega anterior registra verificação de tamanhos de celular e tablet. Isso não significa aplicativo nativo instalado nem fornecimento de dispositivos à empresa.

### Dashboards e indicadores atualizados em tempo real

**Implementado para atualizações do banco, sem aquisição automática industrial.** A interface acompanha mudanças nos registros do Firebase e recalcula a consulta. Atualizações podem aguardar o fechamento de um formulário aberto. Rede, permissões e chegada dos apontamentos condicionam a informação disponível.

A máquina produzir uma peça não atualiza o painel por si só. Primeiro precisa chegar um registro digital ao sistema.

### Comparação entre máquinas, produtos, turnos ou períodos

**Parcial. Onde: filtros de máquina, produto, período e contexto; CEP.** A pessoa consulta recortes distintos, acompanha a evolução por dia e mantém grupos separados. Existe uma função interna de comparação de períodos, mas não uma tela dedicada com dois recortes lado a lado e diferenças calculadas para todos esses casos.

### Exportação automática de relatórios e indicadores

**Parcial. Onde: botão Exportar; CEP > Exportar estudo.** O sistema gera CSV dos registros consultados e do estudo CEP, incluindo resultados e informações de origem. O usuário inicia a exportação por clique. Não há agendamento, envio automático nem geração de relatório PDF pela interface.

### Inteligência Artificial para padrões, tendências ou anomalias

**Não implementado.** As regras de CEP e os cálculos estatísticos não constituem IA. Não existe modelo de aprendizado de máquina ou análise por IA integrado ao produto.

### API ou possibilidade de integração futura

**Preparação interna existente; integração externa pendente.** O código separa serviços, cálculos e acesso ao repositório, permitindo evoluir com adaptadores e integrações. Não existe API REST pública documentada, conexão pronta com ERP/Power BI ou protocolo industrial implementado. Essa arquitetura deve ser apresentada como possibilidade de evolução.

## Recursos adicionais que merecem apresentação

- **CEP I-MR fase I e Pp/Ppk:** além dos índices citados no desafio, há cartas de indivíduos e amplitude móvel, dispersões, sinais e diagnóstico do estudo.
- **Hora a hora:** compara apontamentos com a meta da consulta sem inventar distribuição de totais entre horários.
- **Microparadas manuais:** permite registrar segundos e consolidar eventos curtos com tratamento de sobreposição.
- **Importação CSV com prévia:** apresenta erros e avisos antes da confirmação e reconhece reimportação da mesma fonte.
- **Correções com segunda pessoa:** preserva o original e impede o autor de aprovar a própria proposta.
- **Conferência da planilha histórica:** conserva observações, números em texto, lacunas, origem e resultados da fonte, sem enviar esse estudo ao Firebase.
- **Separação de dados operacionais e fictícios:** Operacional exclui registros de apresentação; Apresentação identifica esses dados e desabilita gravações.
- **Login e perfis:** administração, Engenharia, operação e consulta têm capacidades distintas.
- **Preferências e acessibilidade:** temas claro/escuro/sistema, tabelas compactas e VLibras opcional.

## O que a equipe pode afirmar

O MVP oferece funções correspondentes aos 13 itens obrigatórios, com registro digital, vínculos, acompanhamento e decisão humana rastreável. Entre os opcionais, há funções prontas, atendimento parcial e integrações ainda ausentes, conforme os itens acima.

A demonstração prova o comportamento do software nos cenários disponíveis. Para afirmar ganhos industriais, aprovar metas, homologar referências ou obter acompanhamento direto das máquinas, a equipe precisa executar um piloto com a empresa.

## Base da conferência

Interface e formulários: `app/src/ui/main.js`, `forms.js`, `cep.js`, `hourly.js`, `data-tools.js` e `simulation.js`. Regras e cálculos: `app/src/domain/limits.js`, `indicators.js`, `cep.js`, `hourly.js` e `dashboard.js`. Serviços: `app/src/services/registry.js`, `operations.js`, `analysis.js`, `history.js`; importação/exportação: `app/src/io/csv.js`.
