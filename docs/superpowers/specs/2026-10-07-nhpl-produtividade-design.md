# NHPL: piloto, planejamento e produtividade de 95%

Data: 07/10/2026, America/Sao_Paulo.

Estado: **especificação aprovada pelo usuário em 07/10/2026**. O usuário informou que a implementação será retomada mais tarde, em outro computador. Nenhuma alteração de produto desta evolução foi realizada. O plano de implementação ainda não foi elaborado, revisado ou escolhido para execução.

## Objetivo e primeira entrega

O sistema deve facilitar registros rastreáveis da montagem de abafadores na NHPL e mostrar se a produção cumpre pelo menos 95% do planejamento. Cada perfil encontra suas tarefas principais e os serviços e regras continuam protegendo as operações.

Esta primeira entrega reúne a configuração do piloto, o contexto de trabalho, o planejamento por período, a meta versionada e o acompanhamento da produtividade. Inclui as correções de recorte temporal e exportação CEP já encontradas na auditoria. A coleta automática, os demais indicadores industriais e a ampliação das análises seguem os blocos B–D do brainstorming anterior, com seus próprios requisitos de integração. A primeira entrega não depende de acesso à máquina.

## Evidência e decisões

| Origem | Constatação | Consequência no projeto |
|---|---|---|
| Respostas de Fabiana fornecidas pelo usuário | NHPL, linha Montagem, montagem de abafadores VGARD HP e MARK V, variantes Low/Medium/High | NHPL passa a ser o piloto principal. Famílias e variantes têm identificação própria. |
| Resposta complementar | Takt informado: 12 segundos por peça | Referência inicial de planejamento, identificada como informação da entrevista. |
| Resposta complementar | Alerta de produtividade abaixo de 95% | Meta inicial de produtividade: 95%. Não atribuir esse percentual aos demais indicadores. |
| Foto `WhatsApp Image 2026-10-05 at 12.13.44.jpeg` | Pitch Board com setor NHPL e colunas Plano, Realizado, Acumulado e Sucata | Adotar planejamento explícito por período, com produção e sucata distintas. A foto não é importada como registros validados. |
| Fotos `12.14.06` e `12.17.22` | IHM Siemens com alarmes, estados por estação e campos de aprovadas/reprovadas | Preparar futura coleta destes dados se Manutenção/TI confirmar funcionamento e exportação. Uma tela com contadores zerados não comprova contagem automática disponível. |
| Planilha `T20A03(EN)5 - Capability study senai.xlsx`, aba `Selo ` | Estudo de parâmetros de selos; título em A1, produto em O5; tempos de vácuo/resfriamento em BB9:BD11 | Referência histórica de coleta e capacidade. Não usar esses tempos como takt ou ciclo ideal da NHPL. |
| Mesma planilha | BH10=80 e BH11=75; pressão CF10=`6,5`, CF11 vazio; vácuo CH10=-600, CH11 vazio | Preservar os valores originais. Limite invertido ou incompleto não vira referência aprovada da NHPL. |

A conferência original encontrou somente as abas `Selo ` e `Normality test ` e nenhum rótulo de takt, NHPL, produtividade, OEE, MTBF ou MTTR. As nove imagens foram examinadas. Os dez arquivos mantiveram os mesmos hashes antes e depois da leitura. Registro: `output/analise-nhpl-2026-10-07/material-conferido.json`.

**Decisão de software solicitada pelo usuário:** interpretar os 95% como cumprimento do plano de produção total. A entrevista e o Pitch Board sustentam essa escolha, mas não documentam uma fórmula industrial homologada pela MSA. A definição será visível e terá vigência e autor identificados.

## Identidade do piloto e preservação

- Máquina/célula de referência: **NHPL**. Nome na experiência principal: **NHPL · Montagem de abafadores**.
- Linha: **Montagem**. Processo: **Montagem de abafadores**.
- Famílias: **VGARD HP** e **MARK V**.
- Variantes informadas: **Low**, **Medium**, **High**. Registrar a variante quando conhecida e mostrar ausência quando não informada. Não gerar seis SKUs, códigos SAP, receitas aprovadas ou associações família/variante sem informação correspondente.
- Criar identificadores próprios para NHPL, processo e famílias. O cadastro da T20 e suas séries permanecem vinculados ao processo de selos e acessíveis como referência histórica. O contexto inicial prefere NHPL quando seu cadastro estiver disponível.
- Instalação do catálogo é idempotente, exclusiva da Administração e não substitui cadastros existentes. Nenhum dado antigo é reclassificado como observação da NHPL.
- Apresentação e simulação usam exemplos explicitamente fictícios da montagem e do cálculo da produtividade. Nenhum registro fictício entra na visualização operacional. Os limites de selos não são replicados como parâmetros da montagem.

## Registros e contexto de trabalho

Novos registros do piloto exigem máquina, processo, família de produto, OP, lote e turno. Data e período são explícitos. Horários de turno e pausas são preenchidos pelo responsável, sem presumir uma jornada da fábrica. Períodos são instantes com fuso exibido em America/Sao_Paulo e suportam atravessar a meia-noite.

O contexto selecionado preenche os formulários e permanece visível antes de salvar. Registros antigos com contexto incompleto continuam consultáveis, identificados como incompletos. O novo requisito aplica-se aos registros do piloto, sem invalidar historicamente os exemplos existentes.

Quantidades de produção total, produção boa e sucata são separadas. Registros de quantidade representam incrementos em um intervalo, e não valores acumulados de contador. Zero registrado é uma observação válida. Ausência de registro é uma pendência. Dados acumulados de um futuro contador exigirão conversão por adaptador, com tratamento de reinício, antes de virar incrementos.

Cada novo lançamento da NHPL identifica o intervalo e a revisão do plano usados. Um intervalo só recebe resultado final depois de a pessoa responsável confirmar o encerramento dos apontamentos e a produção total, inclusive quando for zero. Essa confirmação registra autor, horário e os registros incluídos, sem permitir alterar a definição do plano. Administração/Engenharia/Operação podem confirmar os apontamentos; Consulta não pode. Consultar todos os registros do banco não comprova que todos os apontamentos do período foram feitos. Após o encerramento, ajustes passam pelo fluxo de correção rastreável existente, e um conflito de revisão suspende a avaliação final.

O lançamento hora a hora usa intervalos definidos no planejamento. Intervalos podem ter 15, 30 ou 60 minutos e dividir o turno. Cada quantidade é associada ao intervalo correspondente. Registros que atravessam vários intervalos permanecem no total do período quando integralmente contidos nele; sua distribuição horária fica indisponível até existir detalhamento. Não repartir a produção realizada por uma proporção de tempo inventada.

## Planejamento e takt

O planejamento contém contexto, início, fim, janelas previstas de pausa, quantidade planejada, origem da quantidade e responsável. Janelas produtivas não podem sobrepor outras do mesmo recurso, inclusive para produtos e OPs diferentes. Pausas previstas ficam dentro do período e sua união evita descontar o mesmo tempo duas vezes.

Há dois caminhos explícitos:

1. **Plano informado:** Administração/Engenharia registra a quantidade aprovada para cada intervalo. Esse valor é a referência do indicador e prevalece sobre qualquer sugestão baseada em takt.
2. **Sugestão pelo takt:** tempo programado líquido em segundos ÷ 12. A pessoa responsável revisa e confirma antes de o valor se tornar plano. A interface identifica a origem como cálculo com o takt informado na entrevista.

Para uma sugestão, calcular primeiro a capacidade do período e arredondar para baixo uma única vez. Ao dividir em intervalos, usar diferenças de capacidades acumuladas arredondadas, para que a soma das partes conserve o total. As pausas previstas são excluídas do tempo disponível. Paradas imprevistas registradas depois não reduzem esse tempo nem o planejamento aprovado.

O takt continua identificado como cadência de demanda/planejamento. O valor não configura automaticamente o ciclo ideal de desempenho do OEE. A [definição do Lean Enterprise Institute](https://www.lean.org/lexicon-terms/takt-time/) relaciona takt ao tempo disponível e à demanda.

Um planejamento usado por registros não é sobrescrito. Alterações criam uma revisão, com justificativa, autor e data. O histórico mostra a revisão aplicável e o plano originalmente aprovado. Alterar planos de períodos já encerrados exige justificativa e uma comparação visível antes/depois. Revisões conflitantes deixam o indicador indisponível até resolução, em vez de selecionar uma delas silenciosamente.

## Meta e cálculo da produtividade

Meta inicial: **95%**, de escopo NHPL. Vigência informada na instalação a partir da data de configuração; nenhum início retroativo de 2026 é presumido. Fonte: respostas de Fabiana fornecidas ao projeto. Definição do indicador: decisão documentada deste MVP. Metas e takt possuem revisões imutáveis, vigência e referência de origem. A mesma meta aplica-se às famílias do piloto, respeitando o planejamento de cada produto/OP.

```text
produtividade (%) = 100 × produção total realizada / produção planejada
quantidade mínima para atingir a meta = teto(produção planejada × meta vigente / 100)
```

Com a meta inicial de 95%, o fator é 0,95. Revisões de meta aceitam percentuais entre 0 e 100, mantendo a fórmula parametrizada. Comparar numerador, denominador, período, contexto e versão compatíveis. O numerador usa exclusivamente registros `gross` (produção total). Não somar registros `good` à produção total, nem substituir uma base pela outra. A escolha de contar a produção total segue o indicador de volume; atingir 95% não significa aprovação da qualidade. Peças boas e sucata continuam em seus próprios resultados.

O período atende à meta quando o valor exato é maior ou igual a 95%. Arredondamento de tela não decide o status. Valores superiores a 100% são preservados, com destaque para conferir o planejamento. Não calcular a média simples dos percentuais horários: somar produção realizada e planejada e depois dividir. Se houver metas diferentes no intervalo consultado, mostrar separadamente os segmentos de vigência e sua avaliação, sem escolher um único limite artificial.

### Situações de resultado

| Situação | Resultado e orientação |
|---|---|
| Período encerrado, plano positivo e registros completos | Percentual final e estado “Meta atingida” ou “Abaixo da meta” |
| Período em andamento | Produção acumulada conhecida e plano proporcional ao tempo programado transcorrido; percentual marcado “Parcial” |
| Lançamento manual com intervalos já concluídos | Avaliar somente intervalos concluídos e registrados; apresentar cobertura. O intervalo aberto informa que aguarda atualização. |
| Período futuro | “Programado”, sem alerta de produtividade |
| Falta planejamento, lançamento, cobertura de consulta ou há conflito | Resultado indisponível com a pendência específica; não apresentar zero nem alerta de baixa produtividade |
| Plano zero confirmado para intervalo sem produção programada | “Sem produção programada”; não dividir por zero |
| Plano zero com produção realizada | Inconsistência a conferir; não apresentar produtividade infinita |
| Zero realizado explicitamente registrado com plano positivo | 0%, sujeito ao estado parcial/final do período |

Para um plano informado com execução em andamento, a parcela esperada distribui a quantidade linearmente pelo tempo programado líquido do próprio intervalo. Essa distribuição é uma expectativa do plano, nunca uma estimativa de peças realizadas. A janela em andamento utiliza registros reais e mostra último registro/cobertura; ausência de registro atualizado não prova que a máquina esteja parada.

### Exemplos de aceitação

| Caso didático, sem dados industriais | Plano | Realizado | Resultado |
|---|---:|---:|---|
| 60 minutos líquidos, sugestão por 12 s/peça confirmada | 300 | 285 | 95%, meta atingida |
| Mesmo período | 300 | 284 | 94,666…%, abaixo da meta mesmo que uma exibição arredonde para 95% |
| 60 minutos com 10 minutos de pausa prevista | 250 | 237 | 94,8%, abaixo da meta; mínimo 238 |
| 60 minutos sem pausa, com 10 minutos de parada imprevista | 300 | 250 | 83,333…%; plano continua 300 |
| Plano informado diferente da sugestão, exemplo 292 | 292 | 278 | 95,205…%; mínimo 278. O número é exemplo, não uma transcrição homologada da foto. |
| 30 minutos produtivos transcorridos de um plano 300/h e registros atualizados | 150 até o momento | 143 | 95,333…%, parcial |
| Dois intervalos encerrados, planos 100 e 300, realizados 100 e 270 | 400 | 370 | 92,5% agregado, sem média dos percentuais |
| Produção total 285, boas 270, sucata 15 em plano 300 | 300 | 285 | Produtividade 95%; qualidade e sucata não são consideradas aprovadas por esse resultado |

## Permissões e experiência

Manter a divisão de quatro perfis aceita pelo usuário. Os REs existentes continuam contas de teste. Cargos reais citados por Fabiana não recebem automaticamente um perfil; o vínculo de cada pessoa deve refletir suas responsabilidades.

| Função | Administração | Engenharia | Operação | Consulta |
|---|---|---|---|---|
| Acompanhar dados e exportar consultas permitidas | Sim | Sim | Sim | Sim |
| Registrar produção, coletas, perdas e paradas | Sim | Sim | Sim | Não |
| Encaminhar análise e propor correção | Sim | Sim | Sim | Não |
| Definir/revisar planejamento, takt, metas e referências | Sim | Sim | Não | Não |
| Decidir análises e correções autorizadas | Sim | Sim | Não | Não |
| Cadastrar e ativar/inativar máquinas, processos e famílias | Sim | Não | Não | Não |

Preservar a regra que impede aprovar a própria correção, inclusive na Administração. Todas as autorizações são verificadas por serviços e regras do banco. Alteração do menu não concede nem revoga acesso por si só.

Entrada e navegação destacam tarefas: Operação abre o acompanhamento/registro da NHPL; Engenharia abre a fila técnica e encontra planejamento, metas e referências; Consulta abre o painel e histórico; Administração tem a navegação completa. Remover da navegação de Consulta e Operação as áreas dedicadas exclusivamente a decisões/gestão, mantendo os detalhes de contexto necessários à consulta. Uma rota digitada manualmente continua submetida às permissões e oferece retorno para uma página acessível.

A simulação local deve preservar o perfil efetivo da sessão: Consulta continua sem botões de alteração e Operação continua sem decisões/metas. Preparar cenários usa um ator de teste interno, sem tornar o usuário administrador. O cenário fica identificado como fictício e pode ser encerrado para retornar à sessão.

## Componentes e fluxo

Reaproveitar Firebase Auth, RTDB, repositórios, serviços e interface existentes. Introduzir módulos pequenos de catálogo NHPL, planejamento e produtividade. Persistir planejamento, políticas/versionamento e confirmação de apontamentos em estruturas próprias do workspace. A permissão de confirmar apontamentos é independente da permissão de definir planos. Estender de forma explícita os repositórios local, simulado e Firebase, os índices e as regras necessários a essas estruturas.

Fluxo: autenticação e perfil → seleção do contexto NHPL → plano confirmado → registros por período → consulta de registros/revisões e cobertura → cálculo único de produtividade → painel/hora a hora/alerta/exportação. A interface e a exportação consomem o mesmo resultado do domínio.

Validação da gravação impede contexto incompatível, período invertido, quantidade negativa/fracionária, pausa fora do período, duplicação de identificador, revisão sem justificativa e gravação por perfil não autorizado. A finalização exige período encerrado, produção total informada e registros sem conflito vinculados à revisão aplicável. Finalizações concorrentes não somam a produção novamente. Novos incrementos após a finalização são recusados e orientados para correção. Concorrência entre revisões deve produzir um conflito explícito ou rejeição, sem perda de um dos históricos. Sessão encerrada ou revogada cancela os serviços associados.

O painel mostra plano, realizado, percentual, mínimo para 95%, saldo para a meta, vigência, origem do plano e cobertura dos dados. Alertas de produtividade usam somente um resultado avaliável. Pendências de captura são indicadas como pendências, separadas da situação produtiva.

## Correções associadas

1. As tabelas de produção e paradas mostram somente intervalos que intersectam o período selecionado. Manter a consulta de registros anteriores necessária a paradas que começaram antes do filtro.
2. A exportação CEP aguarda a conclusão do serviço assíncrono, informa falha quando necessário e entrega CSV com conteúdo válido. Não gerar um arquivo contendo `[object Promise]`.
3. Planejamento/metas têm seleção de contexto visível, consulta do valor e vigência, e ação de revisão para Administração/Engenharia. O histórico anterior permanece consultável.

## Verificação necessária antes de concluir a implementação

- Domínio: exemplos numéricos acima, limites exatos de 95%, dados ausentes versus zero, boa/total sem duplicação, agregação ponderada, plano zero e valores acima de 100%.
- Períodos: pausa sobreposta, virada de dia, intervalo parcialmente consultado, produção sem distribuição horária, período futuro e consulta paginada incompleta.
- Segurança no emulador: escrita válida por Administração/Engenharia; negação de planejamento/metas para Operação/Consulta; confirmação de apontamentos permitida à Operação sem alterar o plano; negação de operações para Consulta; históricos imutáveis; conflito de revisão/finalização; negação de incremento após finalização; revogação de sessão; cadastros antigos ainda consultáveis.
- Interface: contexto NHPL principal, formulários obrigatórios, plano informado e sugestão por takt, revisão com histórico, parcial versus final, quatro perfis e simulação com as mesmas restrições. Verificar em computador e tela móvel.
- Exportação: CSV da produtividade com período, contexto, base, origem, versão e cobertura; CSV CEP autenticado com serviço assíncrono.
- Preservação: comparar dados antigos e materiais fornecidos antes/depois da instalação. Nenhuma série de selos passa a ser atribuída à montagem.

## Continuação dos demais requisitos

Depois desta entrega, o conector de arquivos/eventos do bloco B permitirá demonstrar captura e microparadas com uma fonte fictícia isolada. O fluxo real dependerá do leiaute/protocolo confirmado por Manutenção/TI. A foto da IHM não fornece tags, credenciais, endereços nem autorização para instalar um coletor na fábrica.

O bloco C continua com OEE, MTBF/MTTR, taxa de falha, tratamento técnico/Qualidade e mínimo de 30 amostras por estudo CEP. Metas numéricas destes indicadores, ciclo ideal, evidências da Qualidade e referências da NHPL não foram fornecidos. A [documentação SAP de OEE](https://help.sap.com/doc/6863c71dfbc64c9680df490247309a46/15.2/en-US/sap_me_oee_how_to_guide_en.pdf) distingue disponibilidade, desempenho e qualidade e configura taxas de referência por recurso/operação; não sustenta usar 95% como meta comum para todos os indicadores.

O bloco D amplia histórico, Pareto, correlação, acompanhamento em TV, exportação Power BI e métricas do uso. A ordem preserva o objetivo original de implementar o que for viável e faz cada evolução depender de registros e definições compatíveis.

## Revisão da especificação

Revisão interna: fórmula, origem dos 12 segundos, base total/boa, períodos, arredondamento, ausência de dados, escopo da meta, preservação dos selos e permissões estão definidos. A definição de produtividade é uma escolha explícita do MVP, sujeita à futura validação industrial. Não há limite físico, horário da fábrica ou integração substituído por valor inventado.

O usuário aprovou esta especificação e adiou expressamente a implementação. Na retomada, a próxima etapa é elaborar o plano com base neste documento, revisar o plano e escolher o método de execução. A aprovação da especificação não deve ser solicitada novamente. O documento foi originalmente salvo quando a cópia transferida não continha `.git`; a sincronização posterior com o GitHub foi solicitada separadamente pelo usuário.
