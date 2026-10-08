# MSA — jornada coesa, operação e apresentação completa

Data: 08/10/2026. Status: aprovado pelo usuário; implementação em andamento. Pedido: comparar MSE e incorporar suas capacidades úteis, exceto Mapa e Chat, mantendo a aparência do MSA e todas as entregas existentes.

## Objetivo e sucesso esperado

Uma pessoa que nunca viu o sistema consegue identificar a produção, registrar uma coleta e entender o resultado sem uma explicação sobre filtros técnicos. A apresentação usa exemplos completos persistidos no Firebase, uma única experiência de trabalho e os mesmos serviços de consulta/cadastro/cálculo. MTBF/MTTR e demais resultados previstos no roteiro têm bases verificáveis. Nenhum número é inserido diretamente no cartão de indicador.

Decisão do usuário: preparar exemplos completos; não criar opção que alterne entre real e simulado. A origem é preservada em histórico, exportações e gestão técnica; as páginas de trabalho não recebem faixas repetidas de protótipo/demonstração. Os exemplos não passam a ser medições industriais nem prova de integração física.

## Restrições globais

- Manter a identidade visual MSA, temas, gráficos e painel TV; não copiar código, marca ou ativos do MSE.
- Não criar Mapa da Planta nem Chat.
- Uma única experiência principal, sem seletor real/simulado e sem geração contínua iniciada no login.
- Preservar dados existentes, quatro perfis, proibição de autoaprovação, versões, evidências, históricos e 17 cenários técnicos.
- Ausência não equivale a zero; exemplos têm origem rastreável no histórico, na gestão técnica e nas exportações.
- Produtividade bruta = brutas/planejadas; takt 12 s não é ciclo ideal; OEE usa primeira passagem e referências válidas.
- Turnos 07–15, 15–23 e 23–07, America/Sao_Paulo; o terceiro turno pertence à data em que começa.
- Não ratear quantidades sem detalhe; não somar taxas; não misturar kg, peças, contextos ou unidades incompatíveis.
- T20/selos mantém Z1–Z21 e instrumentos no próprio contexto; NHPL mantém VGARD HP e MARK V sem herdar seus limites.
- Não alterar contas, senhas ou memberships; cadastro de equipe não concede acesso.
- Não enviar comandos físicos, não ativar OCR e não enviar fotos a serviços externos.
- Node >=22, módulos JavaScript existentes, Firebase RTDB/Auth e HTML/CSS atuais; dependência nova somente quando necessária ao Excel e registrada com versão e licença.
- Compatibilidade GitHub Pages: publicar somente app estático, assets/imports relativos ao subcaminho /msa/, rotas por hash recarregáveis, downloads no navegador e Firebase externo; nenhum servidor Node necessário no uso.

## Alternativas consideradas

1. **Jornada de produção + fonte compartilhada + módulos incrementais — recomendada.** Reaproveita serviços existentes, torna o contexto compreensível e resolve consulta, registro e BI juntos. Exige migração conservadora e verificação entre sessões.
2. **Ajustes de nomenclatura/layout e ampliar exemplos locais.** Menor esforço inicial; dados continuam presos ao navegador, exportações e filtros seguem desconectados da jornada.
3. **Reestruturar todas as telas seguindo o menu do MSE.** Boa correspondência de capacidades; maior risco de esconder planejamento, CEP e engenharia próprios e de perder contratos aprovados.

## A. Jornada e contexto — subsistema 1

### Seleção de produção

O topo distingue dois controles:

- **Consultar:** período + turno + máquina/produto, com Aplicar filtros e Limpar filtros. Informar quando uma busca apenas reduz a tabela.
- **Registrar em:** cartão persistente da produção escolhida. Botão **Escolher produção** abre lista pesquisável de produções cadastradas, planejadas ou encerradas. Cada linha tem equipamento, produto/variante, ordem, lote, horário/turno e estado.

Exemplo de cartão: `NHPL · VGARD HP` / `Ordem OP-… · Lote LT-…` / `1º turno · 07–15 · dia …` / `Configuração de processo: …` / `Trocar produção`. Os identificadores dos exemplos definitivos vêm do manifesto de carga; não codificar este texto no produto.

Rótulos e ajuda curta:

- **Ordem de produção (OP):** identifica o que foi programado para fabricar.
- **Lote:** identifica o grupo de peças acompanhado e suas medições.
- **Configuração de processo (receita):** versão dos ajustes usados nesta produção; não é um campo arbitrário obrigatório quando não há receita cadastrada.

A escolha preenche máquina, processo, produto, variante, OP, lote e receita nos próximos registros. Não muda registros anteriores. Consulta abrangente não produz contexto de gravação ambíguo. Sem produção escolhida, a ação orienta a escolha; cadastros iniciais podem criar uma produção com validação dos vínculos. Troca com formulário aberto conserva rascunho e pede escolha entre manter aquele contexto ou iniciar novo registro.

Contexto histórico legado continua legível mesmo sem cadastro novo. O catálogo de produções é aditivo e pode indexar combinações históricas verificadas sem reescrever seus eventos. Receitas são identificadores/versionamento de configuração, não comandos enviados ao equipamento.

### Navegação proposta

| Grupo | Entradas | Abas principais |
|---|---|---|
| Acompanhar | Visão geral, Produção, Equipamentos, Indicadores | Produção: Resumo, Por turno, Hora a hora, Apontamentos, Planejamento, Horários |
| Operar | Parâmetros, Paradas, Qualidade, Ocorrências | Parâmetros: Leituras, Nova coleta, Tendências; Paradas: Resumo, Em andamento, Microparadas, Histórico, Classificação; Qualidade: Resumo, Lotes em avaliação, Refugos e perdas, Inspeções, Histórico |
| Coordenar | Equipe, Passagem de turno, Pendências | Presença/alocação; Enviar/Receber/Histórico; Minhas pendências/Todas/Histórico |
| Analisar | CEP, Engenharia, Relatórios, Histórico | Manter estudos, evidências, correções e exportações completas |
| Gerenciar | Cadastros, Configurações | Máquinas/processos/produtos/parâmetros/motivos/metas + produções/receitas/equipe |

Renderizar grupos conforme permissões, com entradas compactas e menu acessível; não colocar dezenove itens espremidos ou escondidos sem organização. Rotas e aliases atuais continuam válidos. Ocorrências e Equipamentos novos usam detalhes próprios, sem links para mapa. Engenharia conserva análises/limites/correções; Ocorrências encaminha uma investigação técnica quando necessário.

Cada página começa com pergunta prática, resumo do contexto/período e ação principal. Resumo mostra os valores mais importantes; detalhes e tabelas vêm depois. Um botão não abre um cadastro sem informar o que será criado. Após salvar, mostrar o registro criado e **Ver no resumo** com mesmo contexto.

### Visual e acessibilidade

Conservar tokens de cor, tipografia, ícones e desenho MSA. Reutilizar componentes de cartões, filtros, tabela, diálogo e abas; reduzir texto técnico contínuo por detalhes consultáveis. Validar 1440×900, 1280×720, 1024×580, 390×844 e 320×568. Tabelas podem rolar em contêiner próprio; a página não pode ter rolagem horizontal. Abas podem usar seletor compacto no celular. Foco visível, rótulos acessíveis, ordem de tabulação, Escape e retorno de foco em diálogos. Estados de carregamento, vazio, erro e falta de permissão devem oferecer a ação possível.

## B. Fonte única, exemplos e cobertura — subsistema 1

O login normal abre os serviços autenticados de `workspaces/msa` no Firebase. Todos os novos módulos usam esse mesmo repositório; não criam uma segunda base operacional em localStorage. Cache e rascunhos são locais e identificados como pendentes até confirmação. Estado de conexão distingue autenticação, acesso à base, sincronização e comunicação do equipamento.

O preenchimento é aditivo, versionado e idempotente, com IDs prefixados por pacote e manifesto. Registros de exemplo usam `origin: demo` onde o envelope atual admite isso; entidades e ledgers sem esse campo são rastreados no manifesto e pela relação ao contexto do pacote. Não adicionar campos rejeitados pelas regras. Não modificar memberships. Não transformar referências hipotéticas em especificações homologadas.

O destino é a raiz já usada pelo MSA, evitando inventar uma namespace incompatível com as regras atuais. Antes de publicar: autenticar usuário já autorizado, ler dados e regras efetivas, fazer backup, gerar prévia dos IDs/criações/conflitos, conferir vínculos/unidades/tempo e verificar as regras no emulador. A carga usa serviços de domínio e autoria do usuário autenticado; não escreve UIDs ou aprovações fictícias como se fossem funcionários reais. Regras adicionais dos novos módulos são testadas e publicadas apenas na etapa de integração pertinente. Bloqueio de permissão não autoriza abrir a base.

Preservar cópias locais antigas integralmente antes de uma eventual importação. Importação de eventos locais é uma operação separada com prévia e deduplicação; não é condição para apagar ou substituir dados existentes. O erro de sobreposição observado precisa ser reproduzido com uma fixture mínima antes de corrigir a abertura; não atribuir definitivamente sua causa a um cadastro específico sem evidência.

### Pacote completo de apresentação

Gerar uma vez e persistir **sete dias operacionais encerrados** relativos à data de preparação. O manifesto guarda o início/fim e não se regenera ao virar o dia. NHPL tem VGARD HP e MARK V em cada um dos três turnos, em janelas sequenciais sem sobreposição da mesma máquina, com pelo menos quatro intervalos horários por produto/turno/dia. O pacote cobre planejamento, revisão vigente, incrementos, confirmações, horários manuais, primeira passagem, refugos em peças, perdas em kg, retrabalho, paradas/falhas/reparos, referências de exemplo e cobertura explícita.

Cada combinação tem pelo menos uma falha com reparo concluído e tempo produtivo conhecido, permitindo MTBF/MTTR numéricos. Somar falhas/tempos dos registros ao calcular o agregado; nunca tirar média de médias. Prever uma falha atravessando fronteira em contexto separado para validar contagens sem estragar o roteiro inicial. Planos futuros não contaminam o resumo encerrado. Paradas abertas e pendências atuais aparecem em área própria com seu período explícito.

Para estudos: pelo menos 30 coletas ordenadas por contexto homogêneo e versão aplicável; NHPL com parâmetros próprios e T20/selos com o conjunto mapeado do modelo original, incluindo todas as zonas e instrumentos realmente correspondentes. Valores são exemplos físicos coerentes, com zero e vácuo negativo preservados. Não preencher com número arbitrário uma medida que não se aplica àquela máquina. Parâmetro aplicável sem leitura ganha coleta de exemplo; campo não aplicável deixa de ocupar o resumo. Limite sem fonte industrial mantém indicação técnica de referência pendente ou de referência específica de exemplo.

Acrescentar exemplos consultáveis de ocorrência, análise, pendência, equipe operacional, passagem e avaliação de lote depois que os respectivos módulos existirem. Manter originais, correções e decisões relacionadas sem forjar segunda pessoa para aprovação. Casos que exigem recebedor/revisor distinto ficam pendentes até uma segunda sessão autorizada agir.

### Cobertura e recorte

Separar evidência de cobertura de paradas/falhas da inspeção de primeira passagem: qualidade não é atestado automático do histórico de manutenção. Introduzir confirmação explícita de cobertura com janela, contexto, fonte e fingerprint dos registros vigentes, invalidada por correção posterior. Compatibilidade com atestados históricos exige vínculo verificável; não marcar como completa uma janela sem evidência.

A abertura inicial escolhe o último período completo do manifesto. Exibe `Último período concluído · datas/turnos` para a pessoa saber o que está vendo; isso não é um seletor de fonte. A consulta livre continua funcionando e pode exibir causas reais de indisponibilidade. A garantia de números cobre os recortes preparados do roteiro, não autoriza inventar MTBF numa máquina sem falhas.

## C. Operação e coordenação — subsistema 2

**Paradas/microparadas:** registrar início/motivo, encerrar após validação aplicável, classificar disponibilidade/desempenho/fora do plano, indicar falha e duração do reparo. Cronômetro vem de timestamps; não gera peças durante parada. Microparadas usam limiar da referência vigente, com filtro, motivo e histórico. Sobreposição usa união de intervalos.

**Qualidade de lote:** criar avaliação com quantidade e contexto, segregar sem contar como refugo; reinspecionar com boas/rejeitadas e evidência; liberar ou descartar com decisão de admin/engenheiro. Quando houver refugo previamente registrado, lançar só a diferença comprovada. Bloquear descarte além do saldo e decisões sobre produção corrigida sem reconciliação. Boa de primeira passagem não muda retroativamente por liberação após retrabalho.

**Ocorrências:** tipo, prioridade, relato, responsável operacional, prazo e estado. Decisões são eventos auditáveis. Vincular parada, coleta, lote ou análise; nenhum comentário é enviado externamente.

**Equipe:** cadastro operacional mínimo nome/identificador/setor/posto; exemplos não contêm dados de pessoas reais inventadas. Presença registrada para dia operacional/turno, com alocação e histórico; RE em coleta significa autoria/participação, não prova de presença. Ausência libera posto; impedir dupla alocação simultânea não permitida. Edição por admin/engenheiro, consulta conforme perfil. Sem senhas e sem criação automática de usuário Auth.

**Passagem:** snapshot imutável do turno, resultados, planos, paradas, pendências e referências. Recebimento por outro UID com permissão; reenvio não duplica. Pendências atravessam turnos sem copiar o evento como nova falha ou novo refugo. Concluir pendência exige solução, autoria e timestamp.

**Pendências/notificações:** episódios ligados à causa, contexto e revisão; estados novo/reconhecido/em atendimento/concluído, responsável e histórico. Causa normalizada encerra o episódio técnico, mas não apaga atendimento; conclusão manual depende de normalização e registro da ação. Agrupar repetição do mesmo episódio. Não enviar e-mail, mensagem ou push externo neste escopo. Som opcional local, desligado inicialmente, sem repetição enquanto o mesmo episódio permanece aberto.

**Conferência/consolidação:** reutilizar confirmações de produção, inspeções, análise e aprovação existentes. Snapshot de consolidação explicita revisão e cobertura, fica desatualizado quando a base muda e permite nova revisão; não vira selo fixo de dados aprovados.

## D. Indicadores, BI e Excel — subsistema 3

Indicadores compartilham uma projeção com Visão geral, Produção, Paradas, Qualidade, Relatórios e TV. Cada valor informa unidade, período, bases e situação. Incluir comparativo de dia anterior, três turnos, máquina/produto e setor quando cadastrado. Agregação ponderada e denominadores corretos; meta ausente não vira 100%.

Instrumentos: valor/unidade/horário/versão, identidade Z1–Z21 estável, pressão/vácuo e tendências somente no contexto correspondente. Resumo não transfere dados de selagem para NHPL. Foto apenas seleção/prévia local associada a rascunho; não é leitura validada.

Relatórios com filtros e prévia do número de registros:

1. **Coletas para BI:** uma linha por coleta, colunas planas, parâmetros com unidade, valores históricos originais e efetivos identificados, contexto completo, horário/dia operacional/turno, origem e IDs.
2. **Produção e metas:** uma linha por intervalo/revisão produtiva, brutas, boas, primeira passagem e planejadas; sem repetir pela quantidade de coletas.
3. **Refugos e perdas:** uma linha por evento efetivo, tipo, motivo, quantidade e unidade.
4. **Paradas e reparos:** uma linha por parada/classificação efetiva, início/fim, reparo, contagem de falha e cobertura.
5. **Indicadores:** numeradores/denominadores, situação, memória e referência. Uma taxa nunca é aditiva.
6. **Geral:** arquivos separados com chaves de relacionamento e dicionário; não uma tabela que multiplica fatos incompatíveis.
7. **Excel de capacidade:** usar o modelo próprio fornecido, com amostras persistidas e fórmulas preservadas; separar estudos por contexto, parâmetro, unidade e versão.

Contrato % Scrap: `100 × refugadasEmPeças / brutasConfirmadas` no mesmo escopo de máquina/processo/produto/variante/OP/lote/receita/dia operacional/turno. Excluir kg, retrabalho e apenas segregadas. Se produção estiver em base boa, converter para total somente com reconciliação explícita. Sem denominador/cobertura: valor vazio e motivo, não 0. Exportar `refugadas_pecas`, `brutas_pecas`, `scrap_pct`, `scrap_scope_id`, `scrap_state`; documentar repetição de taxa nas coletas e fornecer fato próprio para BI. Se não houver detalhe suficiente para associar o evento à chave, diagnosticar em vez de repartir.

CSV: BOM UTF-8, `;`, CRLF, decimal brasileiro na versão para Excel/BI PT-BR, versão de esquema no dicionário, aspas/acentos corretos, prevenção de fórmula em texto e números negativos sem conversão em texto. Exportação não gera nem altera amostras. Material/espessura só quando vinculados por versão da receita/produto; não adivinhar pelo nome.

Excel: fórmulas locais da planilha, Cp/Cpk e normalidade são identificados por método e condições; não colocar OK fixo nem tratar desvio global e sigma I-MR como equivalentes. Amostras insuficientes continuam explicadas. O roteiro preparado deve ter estudos com quantidade suficiente e referências de exemplo rastreáveis. Preservar modelo de origem e permitir exportar grande número de leituras sem truncamento.

## Contratos comuns entre os planos

Tipos documentais a implementar em JavaScript:

- `ProductionCase = {id,machineId,processId,productId,variant?,order,lot,recipeVersionId?,shift,operationalDate,startedAt,endedAt,status}`; auditoria segue padrões existentes. `RecipeVersion = {id,recipeId,productId,processId,label,material?,thicknessMm?,settings,source,status,supersedes?}`. Projeção acrescenta códigos/nomes sem mudar IDs históricos.
- `Selection = {query:{context,fromDate,toDate,shift},recording:{productionCaseId,context}|null}`. Contexto da gravação é snapshot validado, separado da consulta.
- `WorkspaceView = {selection,period,technical,catalog,asOf}`; base adaptada ao estado existente, sem recalcular por tela.
- `DatasetManifest = {id,packageId,baseManifestId?,version,origin:'demo',fromOperationalDate,toOperationalDate,defaultSelection,entries:[{index,path,scope:'record'|'ledger-header',hash}],entryCount?,entriesHash?,previewHash?,backupHash?,state:'prepared'|'published',createdBy,createdAt}`. Referências reais não são substituídas.
- `CoverageWitness = {id,context,startedAt,endedAt,complete,evidence,recordsFingerprint,supersedes?,createdBy,createdAt}`. A cobertura é consultável e invalidada quando registros relevantes mudam.
- Serviços comuns: `productions.list(query)`, `productions.create(input)`, `productions.context(id)`, `projection.load(selection)`, `metrics.project(view)`, `coverage.confirm(input)` e `presentation.prepare({anchorDate,actor,repo})`/`presentation.publish(preview)`.
- Módulos operacionais retornam registros auditados e snapshots; usam `ProductionCase` e `Selection`. Exports consomem `WorkspaceView` completo e retornam `{files,manifest,diagnostics}` sem efeitos de escrita.

Interfaces completas, testes e nomes de arquivo estão nos três planos derivados. Mudança de contrato exige atualizar todos os consumidores antes de declarar fase concluída.

## Critérios de aceitação da apresentação

- Pessoa nova identifica máquina/produto/ordem/lote/turno e registra coleta sem digitar contexto repetido; receita tem explicação e vínculo visível.
- Todos os percursos e abas da matriz do comparativo têm destino, com Mapa e Chat excluídos.
- NHPL VGARD HP/MARK V, todos os turnos e os sete dias preparados têm KPI do roteiro calculáveis, falhas/reparos e cobertura demonstráveis. Abrir depois das 17h, após meia-noite e no dia seguinte não estraga esse recorte.
- Dois navegadores/computadores autorizados consultam os mesmos IDs e resultados no Firebase; cadastro no primeiro aparece no segundo e permanece após recarregar. Não basta teste local ou fixture de autenticação.
- Nova coleta e novos apontamentos atualizam resumo, histórico, indicadores e exportação sem duplicação. Erro de rede conserva rascunho e não mostra sincronizado sem confirmação.
- CSV/Excel baixados pela interface são abertos e confrontados com eventos-fonte, incluindo % Scrap, zero, negativos, correções e turno noturno.
- Lote, equipe, passagem e alertas exercitados com permissões e pessoas distintas quando exigido; decisões não são ficticiamente autoaprovadas.
- 17 cenários, CEP, planejamento, gráficos, TV, limites, engenharia, backups e arquivos históricos preservados; nenhum cadastro antigo apagado.
- Interface responde nas cinco dimensões definidas e por teclado; ausência fora do roteiro continua com causa útil.

## Ordem de execução e revisão

Três entregas independentes e integráveis: (1) contexto/fonte/dados/cobertura; (2) operação e coordenação; (3) indicadores/BI/Excel/acabamento integrado. O plano índice registra a cobertura total e o gate final. Recomenda-se executar na conversa atual, sequencialmente, por causa dos contratos e da publicação Firebase compartilhados.

O usuário aprovou a proposta e os três planos, incluindo as reformulações visuais básicas e a compatibilidade com GitHub Pages. Autorização para preencher com exemplos já foi concedida; não solicitar novamente a escolha real/simulado. A implementação está em andamento. A sessão administradora e o backup privado da base e das regras foram verificados na retomada; a preparação local não deve ser apresentada como publicação.
