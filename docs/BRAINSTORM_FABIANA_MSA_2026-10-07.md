# Brainstorming — respostas da Fabiana e evolução do MVP

Estado mais recente do complemento: [Entrega completa NHPL](ENTREGA_NHPL_COMPLETA_2026-10-07.md). As cinco frentes foram implementadas localmente, incluindo planejamento/hora a hora, indicadores condicionais, captura por eventos, Engenharia/CEP e TV. Lideres/supervisores/times tecnicos vinculados a Engenharia podem registrar, revisar, corrigir, decidir e manter cadastros produtivos; Operacao tem atalhos de producao, parametros, parada, perda e ocorrencia, com proposta de correcao sem autoaprovacao. Nenhuma conta foi promovida. O login por aba foi descartado por orientacao do usuario; navegadores distintos nao compartilham a base local. OEE/limites reais e integracao industrial continuam exigindo evidencias. As notas anteriores permanecem como historico.

Data: 07/10/2026. Estado: levantamento e proposta para revisão. Este documento não é uma especificação aprovada. Nenhum código de produto ou registro operacional foi alterado nesta etapa.

Estado mais recente: em 07/10/2026, o usuário retomou na cópia Desktop, revisou o plano e autorizou a execução. A primeira entrega foi implementada e validada localmente, incluindo o complemento de quatro horários e registro manual de paradas. Leia [Entrega NHPL](ENTREGA_NHPL_MSA.md) para evidências e limites. A especificação permanece aprovada; os trechos anteriores de adiamento/revisão pendente são histórico. Sem publicação, instalação industrial ou alteração do banco real nesta execução.

Atualização após a orientação do usuário e a conferência do material fornecido: a divisão de permissões foi aceita. O Pitch Board da NHPL mostra Plano/Realizado/Acumulado/Sucata e sustenta a decisão proposta para o MVP de produtividade sobre o plano de produção total, com qualidade separada. Os 12 s/peça orientam uma sugestão de planejamento; o plano explicitamente aprovado prevalece. A fórmula deixa de ser uma escolha aberta nesta proposta, mas não é apresentada como política industrial homologada. A primeira entrega está detalhada em [Especificação NHPL](superpowers/specs/2026-10-07-nhpl-produtividade-design.md), aguardando revisão do documento antes da elaboração do plano de implementação. Os blocos abaixo preservam o levantamento original.

## Objetivo e fontes

### Complemento do usuário e autorização de execução — 07/10/2026

O usuário revisou o plano da primeira entrega e autorizou sua execução completa nesta conversa. Acrescentou as orientações abaixo. Elas complementam a especificação aprovada; não reabrem sua aprovação.

- A experiência principal passa a usar NHPL, Montagem e montagem de abafadores, com VGARD HP/MARK V e variante quando conhecida. Isso cria um contexto próprio, sem renomear as medições históricas da T20/selos como montagem.
- Registrar quatro instantes distintos: **máquina ligada**, **produção iniciada**, **produção encerrada** e **máquina desligada**. Preparação/aquecimento antes da produção e tempo após a produção permanecem identificáveis. Enquanto o ciclo estiver aberto, mostrar a janela parcial até o instante da consulta; no fechamento, conservar os quatro horários e os apontamentos associados.
- Esses horários preparam os dados do OEE. OEE continua separado da produtividade sobre o plano: sua disponibilidade precisa de programação e classificação das paradas; desempenho requer ciclo ideal próprio; qualidade usa quantidades total/boa compatíveis. O takt de 12 s não vira ciclo ideal automaticamente. A primeira entrega registra a janela, sem apresentar um OEE completo quando faltar definição/dado.
- Apontamento de parada manual deve priorizar seletores de motivo, recurso/contexto e horários. A taxonomia é mantida pela Administração; a pessoa não precisa escrever um relato livre para cada parada. Preservar justificativa nas revisões/correções, onde há decisão rastreável.
- Cadastro manual por formulário é uma solução válida para máquinas, processos e parâmetros: centraliza os registros mesmo sem automação. A marca/modelo da HMI não permite descobrir automaticamente a máquina ou suas zonas. Fotografias não substituem confirmação de protocolo, tags e sinais por Manutenção/TI.
- Materiais reconsultados em `C:/Users/Kauan/Desktop/Grupo Amarelo - MSA Brasil/MSA - Material Fornecido`: as dez fontes são idênticas por SHA-256 às cópias preservadas. A planilha contém somente `Selo ` e `Normality test `; é referência de selos, não limites da NHPL. Contramolde 80/75 continua invertido; pressão 6,5 e vácuo -600 continuam com limite incompleto. Manter essas pendências e a origem; não completar/aprovar faixas por suposição.
- Fotos da NHPL ajudam a identificar o fluxo Plano/Realizado/Acumulado/Sucata e estados/alarmes da IHM. Valores de telas isoladas são observações da foto, não prova de um mínimo/máximo homologado.

Decisão de execução: concluir o bloco A/primeira entrega, incluindo janela operacional e paradas por seleção. Conector físico/arquivos e microparadas automáticas (B), OEE e política técnica completa (C) e análises/integrações ampliadas (D) continuam identificados como evoluções posteriores. Nenhuma instalação industrial, publicação ou alteração de contas foi autorizada por essa continuidade.

Facilitar o registro e a coleta, acelerar decisões e acompanhar a produção durante a operação da NHPL, preservando rastreabilidade e permissões. Os requisitos mínimos do desafio continuam sendo a base; as respostas novas orientam o piloto e suas prioridades.

- Primeiro conjunto: dez perguntas e respostas fornecidas diretamente pelo usuário nesta conversa.
- Complemento: [respostas fornecidas no anexo](../referencias-locais/contexto-historico/2026-10-07-respostas-fabiana-complemento.txt), preservadas sem alteração. O arquivo não está numerado; abaixo ele foi agrupado em dez temas para organização.
- Código existente e [auditoria de acessos e funções](ACESSOS_E_AUDITORIA_MSA_2026-10-07.md).

As respostas são evidências de requisitos relatados pelo usuário. A menção a acesso autorizado na entrevista não fornece endereço de equipamento, credencial, protocolo nem autorização técnica para instalar ou conectar software à rede industrial por esta conversa.

## Entendimento atualizado

1. Piloto: máquina NHPL, linha Montagem, montagem de abafadores VGARD HP e MARK V, com variantes Low/Medium/High a cadastrar conforme a configuração real.
2. A máquina com 21 zonas e a planilha dos selos são exemplos de coleta. Seus parâmetros, limites e dados não devem ser transferidos automaticamente para a NHPL.
3. Coleta automática ou semiautomática e identificação de microparadas são requisitos centrais. Um formulário manual sozinho não encerra essa necessidade.
4. A resposta complementar liga o alerta de 95% à produtividade. Não se deve aplicar esse percentual automaticamente ao OEE nem a MTBF/MTTR, que possuem outras definições e unidades.
5. A organização define metas anualmente com a alta gerência. O software deve registrar vigência, fonte, responsável e revisões, sem apresentar o cadastro técnico como aprovação da empresa.
6. As decisões consideram parâmetros, plano de controle de Qualidade, ensaios e performance do produto. Um comentário livre ou um resultado de CEP isolado não representa todo esse fluxo.
7. Os cargos citados precisam participar do sistema. A resposta não especifica uma matriz de ações por cargo nem determina que todas as pessoas possam aprovar qualquer alteração.

## Rastreabilidade das vinte respostas

| Fonte | Informação fornecida | Consequência para o desenho |
|---|---|---|
| Primeiro conjunto 1 | Produtividade, OEE, MTBF e MTTR; metas anuais com alta gerência; 95% | Indicadores distintos, configuração de metas com vigência e revisão; confirmar definição de produtividade |
| Primeiro conjunto 2 | Parada começa quando a máquina para e termina ao produzir peças boas validadas; microparadas devem ser capturadas automaticamente | Eventos de parada/retomada, confirmação de produção boa, contagem e tempo acumulado; integração real depende dos sinais disponíveis |
| Primeiro conjunto 3 | Facilidade de coleta e rapidez na decisão | Reduzir redigitação, conservar contexto selecionado e destacar tarefas do usuário |
| Primeiro conjunto 4 | Especificação do processo, plano de controle, laboratório e performance do produto | Evidências de Qualidade e processo na decisão, além de justificativa e histórico |
| Primeiro conjunto 5 | Hora a hora, downtime/motivos, parâmetros, scraps, lote, data/período, turno, OP e produção do turno | Contexto obrigatório no piloto e registros por período com quantidade e unidade explícitas |
| Primeiro conjunto 6 | Operadores, líderes, supervisores, técnicos e Manutenção participam de registro, revisão, correção, aprovação e consulta | Perfis de permissão atribuídos às pessoas; matriz detalhada por ação a validar, sem promoção automática de cargos |
| Primeiro conjunto 7 | NHPL, Montagem, montagem de abafadores, VGARD HP e MARK V | Configuração própria do piloto; manter T20/selos como referência histórica |
| Primeiro conjunto 8 | Histórico completo, Pareto e correlação entre parâmetros | Paginação, exportação rastreável, Pareto por motivo e correlação de observações pareadas |
| Primeiro conjunto 9 | Tempo de coleta, erros, completude, tempo de análise e análise durante a operação | Medir eventos disponíveis no software e comparar com uma linha de base real fornecida pela empresa |
| Primeiro conjunto 10 | SAP e Power BI isolados; sem supervisório na linha | Exportação estruturada e preparação de adaptadores; integração efetiva exige interfaces e acessos |
| Complemento: prioridades | Reforça indicadores, coleta, completude, análise e acompanhamento durante a operação | Priorizar o ciclo de coleta, ocorrência, análise e decisão |
| Complemento: piloto | NHPL é o escopo; 21 zonas são exemplo | Evitar construir a experiência principal em torno dos selos |
| Complemento: fluxo | Produção registra, técnico consolida; parâmetros fora da especificação exigem Engenharia | Visões por tarefa e encaminhamento de desvios com contexto e rastreabilidade |
| Complemento: dados automáticos | Temperaturas, pressão, vácuo, estados/alarmes; pressão também em manômetro | Mapear fontes reais antes de conectar; não tratar instrumento analógico como sensor digital existente |
| Complemento: demonstração/coleta | Automática ou semiautomática; alternativa aceita é importação automática de arquivos; Manutenção/TI confirmam interfaces | Conector de arquivos e contrato de eventos demonstráveis; conexão física permanece dependência externa |
| Complemento: referências e indicadores | Referências existem, precisam revisão; Cp/Cpk com pelo menos 30 amostras, frequência por turno; takt 12 s/peça; sem contadores automáticos | Política de amostragem no piloto; revisão de referências; ciclo ideal de OEE e fonte das quantidades ainda precisam confirmação |
| Complemento: ocorrências/perdas | Tempo de parada deve entrar nos indicadores; Qualidade informa refugos/kg manualmente | Eventos temporais, motivos, classificação de falhas e perdas com unidades; não inferir contagem de peças pelo sensor |
| Complemento: dispositivos/rede | TV, computador, celular e tablet; rede tem restrições de TI | Interface responsiva, visualização para TV e coleta compatível com política de rede, sem instalação industrial automática |
| Complemento: alertas/andon | Parada, parâmetro fora da faixa e produtividade abaixo de 95%; andon já existe | Alertas visuais e fila de tratamento no sistema; integração com andon depende da interface, sem duplicação automática de alarmes físicos |
| Complemento: hardware | Não possuem os módulos/transdutores listados; possuem sensores indutivos/acopladores | Software não deve pressupor ESP32, novos transdutores ou leitor térmico instalados |

## O que o sistema já oferece e precisa evoluir

- Existem contexto máquina/processo/produto e campos de lote, OP, receita e turno, mas esses campos complementares são opcionais. Precisam de um fluxo visível e de validação para novos registros do piloto.
- Existem registros de produção, perdas e paradas com autor e data; há correções sem apagar o original e decisões rastreáveis por outro usuário.
- Existem consulta hora a hora e contagem de paradas curtas já registradas. Não há captura física automática. A duração de 60 segundos exibida inicialmente é uma configuração do software, não uma definição fornecida pela Fabiana.
- Há importação de coletas CSV com conferência humana e proteção contra duplicação. Não há conector que acompanhe uma pasta e importe automaticamente arquivos novos.
- Existem produção, refugo, paradas, limites e CEP. OEE, MTBF, MTTR e taxa de falha precisam de funções e dados próprios; não podem ser obtidos corretamente somente dos totais atuais.
- O mínimo atual usado no CEP é 25. A política relatada para o piloto é pelo menos 30; frequência por turno e quantidade por coleta precisam ser distinguidas.
- Existem classificações por motivo nos cálculos, mas falta uma experiência completa de Pareto e de correlação entre parâmetros.
- A análise atual permite aprovar/rejeitar com justificativa. Faltam campos próprios para as evidências de Qualidade e uma solicitação explícita de nova análise.
- Foram identificadas falhas no recorte temporal das tabelas e na exportação CEP autenticada, além de lacunas no cadastro e na revisão de metas. São correções necessárias para as novas funções.

## Abordagens consideradas

1. **Evoluir o MVP por blocos utilizáveis — recomendado.** Aproveitar os serviços e o Firebase existentes, firmar o registro do piloto, incluir o conector de arquivos/eventos e depois ampliar indicadores e análise. Cada bloco deve funcionar e ter validação própria.
2. **Integrar diretamente à NHPL primeiro.** Dá prioridade à coleta real, mas a implementação fica dependente de protocolos, sinais, infraestrutura e TI ainda não fornecidos. Não é possível concluir essa conexão só com as respostas.
3. **Construir apenas uma demonstração visual.** É útil para explicar a proposta, porém não atende sozinha à importação automática, à rastreabilidade ou à coleta de microparadas. Não é a abordagem recomendada para encerrar o pedido.

## Escopo de software proposto

### Bloco A — piloto e registro confiável

- Configurar a experiência para NHPL/Montagem/abafadores, preservando os dados e materiais dos selos. Variantes devem ser identificadas explicitamente, sem inventar códigos de produto ou receitas aprovadas.
- Abrir o contexto de produção com OP, lote, turno e período. Registrar planejamento e tempo programado quando necessários aos indicadores. Não inventar horários fixos dos turnos.
- Simplificar coletas, hora a hora, produção do turno, refugos/kg e paradas. Campos compartilhados vêm do contexto selecionado; novos registros exigem as informações aplicáveis ao piloto.
- Adaptar início e tarefas principais por perfil: Operação registra, Engenharia/usuários técnicos autorizados tratam análises e referências, Consulta acompanha, Administração gerencia.
- Manter contas individuais e permissões nos serviços/regras. Os quatro REs existentes continuam contas de teste; um cargo não recebe poderes automaticamente.
- Corrigir o recorte temporal das tabelas e a exportação CEP autenticada. Permitir selecionar e conferir o contexto das metas.

### Bloco B — importação automática e microparadas

- Criar um conector local que acompanhe uma pasta de arquivos no formato acordado, valide o conteúdo e registre importações sem duplicar o mesmo evento/arquivo.
- Manter registros de sucesso e de falha; arquivos inválidos ou conflitantes ficam pendentes para revisão. Não interpretar qualquer formato industrial sem conhecer o leiaute.
- Receber eventos de estado e horário por uma interface definida para leitura da fonte. O processamento cria o início da parada e registra a retomada quando houver produção boa validada ou confirmação humana identificada.
- Contar paradas curtas, somar sua duração e permitir classificar/confirmar motivos. Alarmes podem sugerir motivos quando houver mapeamento; não há inferência automática de causa sem essa referência.
- Tornar o limiar de microparada configurável e identificado como referência a validar. Não elevar os 60 segundos legados a requisito da empresa.
- Mostrar último dado recebido, origem e situação da coleta. O painel acompanha dados recebidos; conexão do Firebase não comprova aquisição física da máquina.
- Demonstrar o caminho automático com arquivos/eventos fictícios isolados, sem criar resultados industriais no banco operacional.

### Bloco C — indicadores, metas e tratamento técnico

- Produtividade: produção realizada sobre planejamento conforme definição confirmada. A meta de 95% está associada a esse indicador no complemento; fórmula e base de peças ainda devem ser confirmadas.
- OEE: disponibilidade, desempenho e qualidade, usando programação, tempo de operação, referência de ciclo e quantidades compatíveis. Dados incompletos deixam o resultado indisponível com motivo explícito.
- MTBF, MTTR e taxa de falha: diferenciar falha de setup, pausa e outras paradas. Registrar períodos relevantes de operação e reparo; não converter toda parada em falha nem toda duração de parada em tempo de reparo.
- Metas anuais: responsável/fonte da gestão, vigência e revisões. Uma revisão mantém o valor anterior para consulta histórica. Metas de OEE, MTBF e MTTR não foram numericamente fornecidas.
- Cp/Cpk: exigir pelo menos 30 amostras válidas por estudo, além de contexto, versão, natureza e demais requisitos estatísticos. Os 30 valores não representam aprovação industrial automática; a resposta não prova que são 30 peças por turno.
- Análises: registrar critério do processo, referência ao plano de controle, resultados de inspeção/ensaios/performance informados por pessoa autorizada, justificativa e responsável. Incluir solicitação de nova análise; o sistema não executa ensaios nem libera fisicamente a máquina.
- Alertas visuais: parada em aberto, parâmetro fora da especificação e produtividade abaixo da meta, com contexto e horário. Não inventar um destinatário externo nem enviar mensagens automaticamente.

### Bloco D — histórico, análise e acompanhamento

- Histórico com paginação, recortes consistentes, consulta de originais/revisões e exportação rastreável. Informar quando a consulta estiver incompleta.
- Pareto de motivos de parada por duração/quantidade e de refugos/perdas por unidade. Não somar peças e kg nem esconder sobreposições ou conflitos.
- Correlação descritiva entre parâmetros com observações válidas pareadas do mesmo contexto e estudo. Mostrar tamanho da amostra e ausência de dados; correlação não comprova causa.
- Exportação estruturada para consumo no Power BI e futura integração com SAP. Isso não significa que os sistemas externos já estejam conectados.
- Visualização responsiva e modo de acompanhamento para TV, com informações essenciais e sem tornar o banco público.
- Indicadores do uso do MVP: completude dos registros, tempo do registro digital, tempo até iniciar/decidir análise e correções registradas. Erro real de transcrição e ganhos de produtividade exigem conferência e linha de base; validação rejeitada não equivale a erro de transcrição comprovado.

## Dependências que não podem ser substituídas por suposição

| Dependência | Como prosseguir no software |
|---|---|
| Protocolo, endereços, tags e sinal de produção boa da NHPL | Preparar contrato de eventos e demonstrar em fonte isolada; conectar depois com Manutenção/TI |
| Leiaute dos arquivos disponíveis e origem autorizada | Fornecer um formato de entrada documentado e adaptador; validar uma amostra real antes de ativar a coleta industrial |
| Definição de produtividade: peças brutas/boas e planejamento | Campo/configuração explícitos; confirmação solicitada ao usuário |
| Takt de 12 segundos versus ciclo ideal do OEE | Conservar os 12 segundos como informação relatada; referência de desempenho do OEE permanece própria e configurável |
| Limites/receitas aprovados da NHPL | Cadastro de referências com origem e status; pendência não vira limite inventado |
| Horários de turno, pausas e critério de falha/microparada | Configuração identificada e validada, sem presumir horários ou classificação oficial |
| Matriz de aprovação por pessoa/cargo | Manter as restrições atuais até a distribuição das novas responsabilidades ser definida |
| SAP, Power BI, andon e política de TI | Exportar/preparar adaptadores; conexão real depende das interfaces e autorizações aplicáveis |

## Validação da evolução

- Testar limites de período, turnos que atravessam a meia-noite, quantidades e tempos incompatíveis e contexto incompleto.
- Testar importação repetida, eventos fora de ordem, perda de sinal, duplicação de paradas, retomada sem validação e classificação pendente.
- Testar restrições por perfil tanto nos serviços quanto nas regras do banco, conservando a proteção contra aprovar a própria correção.
- Testar indicadores com dados completos e incompletos, sobreposições, falhas classificadas e amostras abaixo/acima do mínimo de 30.
- Testar exportação autenticada, filtros, paginação e conservação de originais e revisões.
- Conferir os fluxos em computador, celular/tablet e visualização de TV. Não publicar, instalar software na fábrica ou alegar conexão industrial a partir de testes locais.

## Referências técnicas consultadas

- [SAP — guia de OEE](https://help.sap.com/doc/6863c71dfbc64c9680df490247309a46/15.2/en-US/sap_me_oee_how_to_guide_en.pdf): disponibilidade, desempenho e qualidade dependem dos dados e das referências de produção.
- [Lean Enterprise Institute — takt time](https://www.lean.org/lexicon-terms/takt-time/): takt liga tempo disponível à demanda; não deve ser tratado automaticamente como ciclo ideal de desempenho.

Estas referências apoiam a revisão técnica. Não documentam aprovação da MSA nem uma integração já implementada.

## Próximo passo

Revisar os blocos e as definições pendentes com o usuário. Depois, detalhar a especificação do primeiro bloco e seu plano de implementação. A proposta evita refazer o aplicativo inteiro, preserva as contas e dados atuais e mantém as integrações reais como requisitos explícitos, com dependências identificadas.
