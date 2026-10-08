# Comparação MSA × MSE — organização, operação e BI

Data: 08/10/2026. Estado: análise verificada e proposta; implementação e preenchimento do Firebase ainda não executados nesta etapa.

## Pedido e decisão mais recente

Incorporar as capacidades úteis do concorrente, exceto Mapa da Planta e Chat, preservando a identidade visual e todas as capacidades já entregues do MSA. Dar prioridade à compreensão de ordem, lote e receita, à coerência entre telas, ao CSV para BI e à apresentação com dados completos. O usuário escolheu exemplos completos e uma única experiência, sem alternância entre dados reais e simulados. A origem dos exemplos permanece no histórico, nas exportações e na gestão técnica; não acrescentar faixas repetidas de demonstração às páginas de trabalho.

## Base efetivamente examinada

- MSA: `C:\Users\Kauan\Desktop\msa-master`. Leitura integral do `RETOMADA_ENCERRAMENTO_2026-10-07.md`, documentação de continuidade indicada, entrega de turnos/indicadores, revisão do login, próximos passos de IoT/fotos, planos e fontes atuais relevantes. A localização `C:\Users\Aluno\Desktop\msa-master` do pedido original não existe neste computador; não foi tratada como outra cópia acessível.
- Checkout Git: `C:\Users\Kauan\Documents\ChatGPT\Desafio de Ideias`, master em `69f674a`, limpa no início da inspeção. O remoto avançou para `a231c145bbe34101358e6ba83b58862ae751af7b`. Os 68 arquivos alterados por esse merge foram comparados por hash Git com a cópia Desktop e coincidem. O checkout antigo não foi usado como código mais recente nem sincronizado automaticamente.
- MSE: `C:\Users\Kauan\Pictures\MSE`, README, documentação de fluxos/painéis/verificação/exportação, UI distribuída e módulos de cenários, turnos, permissões, fluxos produtivos e exportações. A versão atual evoluiu bastante em relação ao diagnóstico de 06/10; aquela conclusão antiga não caracteriza esta cópia.
- Navegador: inspeção do cenário local do MSE nas páginas Visão geral, Produção, Máquinas, Paradas, Qualidade, Ocorrências, Funcionários, Indicadores, Passagem de turno, Relatórios, Notificações e Configurações; também entradas de Operador e Conferência de Supervisor. Não se acessaram Mapa ou Chat como escopo de projeto.
- A credencial fornecida para MSE não foi enviada: o campo RE aceita no máximo dez caracteres e as regras de autenticação documentadas exigem dígitos; o identificador informado não corresponde a esse formato. A comparação navegável usa o cenário acessível na própria aplicação. Isso comprova a jornada local observada, não o funcionamento da conta ou do Firebase do concorrente. Nenhuma senha consta deste documento.
- Navegador MSA: autenticação de fixture de QA local, separada do Firebase real. Uma base nova abriu com MTBF/MTTR indisponíveis; uma origem antiga falhou com sobreposição de planejamento. A origem antiga não foi apagada.

## Diagnóstico central

O MSE orienta a pessoa por tarefas: acompanhar, registrar, conferir e tratar. Exibe resumos, explica o denominador de cada indicador e deixa as tabelas e ações contextuais próximas do problema. O MSA já tem uma base técnica forte, mas ainda exige que o usuário reconstrua a relação entre máquina, processo, produto, OP, lote, receita, intervalo, turno e versão técnica.

O ponto mais prejudicial é `Contexto de lote, ordem e receita`, em `app/src/ui/main.js`: três campos genéricos de consulta, inicialmente recolhidos, convivem com o contexto que preenche registros. Falta distinguir claramente **o que estou consultando** de **em qual produção vou registrar**. A solução proposta é uma produção identificável com resumo visível, não apenas trocar o título do bloco.

Há também um problema de dados e seleção. O login padrão autentica no Firebase, mas abre `openUnifiedWorkspace`, persistido em localStorage. Adicionar registros à nuvem, isoladamente, não abastece essa interface. A proposta muda a abertura normal para os serviços autenticados do Firebase, mantendo um único fluxo de uso e os dados locais antigos preservados para migração verificada.

MTBF/MTTR não se resolvem preenchendo dois campos. `technicalView` agrega a cobertura do período; o exemplo mistura intervalos encerrados completos e planejamento já transcorrido sem confirmação/cobertura. O recorte observado tinha OEE parcial em 7/8 intervalos e confiabilidade indisponível. A cobertura manual também depende das inspeções. É necessário preparar bases completas, separar cobertura de paradas da inspeção de qualidade e escolher um recorte inicial encerrado e coerente. Nunca substituir ausência por zero nem liberar cobertura automaticamente.

## Matriz de capacidades e destino proposto

| Capacidade observada no MSE | Situação do MSA atual | Decisão para o MSA |
|---|---|---|
| Visão geral com quatro KPI e explicações | Existe; recorte pode ficar parcial e leitura é técnica | Resumo executivo, denominadores visíveis, período completo inicial, detalhes dos cálculos |
| Máquina principal com OP/lote e acesso à produção | Seleções e informações dispersas | Cartão da produção selecionada, com máquina/produto/ordem/lote/turno e próxima ação |
| Preparação da reunião com dia anterior | Consulta por período existente | Atalho Último dia concluído, comparativo anterior e prioridades fundamentadas |
| Resumo/Por turno/Hora a hora/Apontamentos/Parâmetros | Turnos, hora a hora, gráficos e registros já entregues | Preservar; padronizar abas e contexto, comparar os três turnos e mostrar detalhes |
| Registro de produção e parâmetros para operador | Existe com mais campos técnicos | Formulário curto, contexto herdado e conferência antes de salvar |
| Conferência de registros e consolidação | Confirmação, inspeção e revisão já existem | Fila legível reutilizando os serviços; não criar aprovação paralela |
| Máquinas por setor/situação e detalhe | Cadastros e filtros existem | Área Equipamentos consultável, vínculos, situação, leituras e atalhos; sem mapa |
| Paradas: resumo/em andamento/microparadas/histórico | Em aberto/histórico/classificação | Acrescentar resumo e microparadas como abas; simplificar encerrar/classificar/reparo |
| Motivos, manutenção e confiabilidade | Contratos técnicos mais rigorosos | Preservar duração sem sobreposição, falhas, reparos e cobertura; explicar as bases |
| Qualidade: resumo/refugos/material/histórico | Refugos, perdas, retrabalho e inspeção | Resumo com peças e kg separados, Pareto, histórico e ações contextuais |
| Lotes suspeitos, segregação e reinspeção | Sem fluxo completo de disposição de lote | Novo fluxo auditável: avaliar, segregar, reinspecionar, liberar/descartar |
| Ocorrências com tratamento e responsáveis | Existe dentro de Engenharia | Entrada própria, prioridade, responsável, prazo, histórico; manter análise técnica vinculada |
| Equipe/presença/alocação por turno | Ausente como módulo operacional | Novo cadastro operacional de equipe e alocação; sem criar contas ou conceder acesso |
| Passagem de turno e recebimento | Ausente | Resumo congelado, pendências transportadas, remetente e recebedor distintos |
| Atendimento de alertas | Filas e diagnósticos sem ciclo completo | Central de pendências: novo/reconhecido/em atendimento/concluído; causa e histórico |
| Som de alerta opcional | Não é capacidade central atual | Opção por usuário com consentimento por gesto, silêncio inicial e deduplicação |
| Indicadores por máquina/setor/meta | Métricas, metas e TV já existem | Comparações, agregado ponderado, detalhes e mesmos filtros; sem inventar setores |
| Relatórios em área própria | Exportar disperso e genérico | Relatórios: coleta para BI, produção, perdas, paradas, indicadores, Excel e consolidação |
| CSV coleta amplo com % Scrap | Exportação genérica, objetos aninhados | CSV largo de coletas + fatos separados de produção/perdas/paradas; dicionário e vínculos |
| Modelo de capacidade em Excel | Modelo original existe como referência, sem exportador equivalente verificado | Exportador a partir do modelo próprio fornecido ao MSA, preservando fórmulas e amostras |
| Leitura completa dos 41 parâmetros de selagem | Contextos históricos e parâmetros próprios | Completar exemplos de T20/selos no contexto correto; não transportar zonas para NHPL |
| Estado atual das máquinas e leituras | Eventos/conector e capturas existentes | Situação/horário/comunicação por eventos; nenhuma alegação de CLP físico conectado |
| Histórico, busca e paginação | Existem em formatos diferentes | Padronizar busca local versus filtro do período, paginação e retorno ao contexto |
| Perfis e tarefas por cargo | Admin/engenheiro/operador/visualizador | Preservar quatro perfis, adaptar capacidades; não copiar permissões do concorrente |
| Configuração, tema e perfil | Entregues | Preservar visual e aparência; mostrar gestão/importação/backups onde fazem sentido |
| Mapa da Planta | Fora do objetivo | Excluído; links de equipamento abrem detalhe, nunca mapa |
| Chat | Fora do objetivo | Excluído |

Essa matriz cobre também as áreas por perfil do concorrente, não apenas o menu de chefe.

## CSV e cálculos: o que aproveitar e o que preservar

O CSV do MSE tem Data, Material, Espessura, % Scrap, Lote, 41 parâmetros do modelo com unidades e dimensões como Hora, Máquina, Produto, Turno, RE, ID e Origem. Usa BOM UTF-8, ponto e vírgula e formato numérico brasileiro. O teste confirma zero legítimo, vácuo negativo, proteção contra fórmulas em textos e associação do turno noturno à data em que começou.

Seu % Scrap usa refugo em peças dividido por aprovadas + refugadas; exclui kg e material suspeito. No MSA, quando a base é bruta, a divisão correspondente é refugadas/brutas. A chave proposta inclui ainda processo, produto, OP, lote, receita, turno e dia operacional. A taxa repetida em linhas de coleta não pode ser somada; exportar numerador, denominador, escopo e estado de cobertura, com fatos produtivos em arquivo próprio. Não repetir contagens horárias em cada leitura como se fossem fatos novos.

Diferenças a manter: produtividade MSA = brutas/planejadas; produtividade MSE = aprovadas/meta. No MSA, exibir produtividade bruta e rendimento de qualidade com nomes explícitos. Não trocar silenciosamente a fórmula já aprovada. OEE preserva primeira passagem, ciclo ideal válido e ponderação por tempo; takt de 12 s continua separado. MTBF do MSA usa inícios de falha no recorte; MTTR usa reparos concluídos no recorte, conforme contrato. As duas bases de contagem devem aparecer separadamente, inclusive quando a falha atravessa uma janela.

Excel: usar o arquivo próprio `referencias-locais/materiais/MSA - Material Fornecido/T20A03(EN)5 - Capability study senai.xlsx`. Preservar fórmulas, não copiar o pacote do concorrente. O cálculo da planilha e o CEP I-MR do MSA têm métodos distintos; apresentar o método sem declarar equivalência. Não reduzir a exigência de evidência do CEP para conseguir um resultado colorido.

## O que o MSA tem e deve conservar

Planejamento e revisão; intervalos e confirmação/reconciliação; quatro horários manuais da operação; políticas e takt; produtividade de 95% quando aplicável; OEE e confiabilidade fundamentados; primeira passagem e retrabalho; parâmetros e limites versionados; importação com prévia; CEP/I-MR e capacidade; análises, evidências e correções sem autoaprovação; histórico imutável; permissões; backups; gráficos intervalar/acumulado; painel TV; conector/eventos e 17 cenários existentes. Os cenários ficam como ferramentas técnicas já entregues, sem criar alternância real/simulado na jornada principal.

IoT físico, sinais/gateway, limites industriais NHPL e OCR continuam dependências externas documentadas. O escopo atual inclui instrumentos no contexto correto, prévia local de foto e integração preparada; não inclui comandar CLP nem afirmar homologação.

## Verificação desta análise

- MSA: 180 testes unitários aprovados e verificação estática com 91 arquivos/zero erros reexecutados durante a retomada. Os resultados não provam operação entre computadores.
- MSE: 27 testes direcionados reexecutados, todos aprovados: CSV/Excel de capacidade, fluxos produtivos e análise de turnos. Não foi reexecutada toda a suíte nem o Firebase real.
- Inspeção de navegador em ambos. Download do CSV por navegador não foi confirmado: a tentativa não retornou arquivo. A conclusão sobre seu formato vem da implementação e dos testes direcionados, não de um download alegado.
- O cenário MSE observado também acumulou muitas pendências e links de equipamentos direcionados ao mapa. Aproveitar seu ciclo de atendimento com deduplicação própria e detalhe de equipamento; não transportar esse ruído para o MSA.

## Recomendação

Construir uma jornada única, com produção selecionável e contexto herdado, Firebase como fonte compartilhada e exemplos persistentes completos, seguida dos módulos operacionais faltantes e de relatórios prontos para BI. Só melhorar espaçamento e títulos seria mais rápido, mas deixaria o problema de dados, contexto e persistência. Uma reorganização total poderia aproximar a navegação do concorrente, porém exigiria reaprender funções fortes já entregues. A proposta mantém a identidade e os contratos do MSA e reorganiza a entrada nas tarefas.

O desenho e os três planos de execução estão em `docs/superpowers/specs/2026-10-08-msa-jornada-coesa-design.md` e `docs/superpowers/plans/2026-10-08-msa-jornada-coesa.md`. São propostas para revisão, não entregas implementadas.
