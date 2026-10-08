# NHPL: entrega completa e apresentacao funcional

Data: 07/10/2026. Estado: complemento aceito pelo usuario, com ajuste de permissoes descrito abaixo; execucao local autorizada pela continuidade.

Este documento registra o novo pedido do usuario e o desenho da ampliacao. A especificacao `2026-10-07-nhpl-produtividade-design.md` permanece aprovada e sua primeira entrega permanece implementada. Nao reabrir essa aprovacao. Este complemento acrescenta os indicadores, a captura demonstravel e a experiencia de apresentacao; nao autoriza deploy, instalacao industrial ou dados ficticios no workspace operacional.

## 1. Resultado esperado e decisoes fixas

Entregar um sistema utilizavel para demonstrar o fluxo inteiro: planejamento, apontamento, hora a hora, parada/retomada, indicadores, referencia tecnica, coleta, CEP, Engenharia, historico, importacao e painel TV. Os dados incluidos devem explicar os resultados e permitir novas gravacoes dentro dos perfis existentes, nao apenas preencher numeros de uma tela.

- Maquina principal: **NHPL**. Linha: **Montagem**.
- Processo exibido: **Processo de montagem do abafador**.
- Familias: **Abafadores VGARD HP** e **Abafadores MARK V**. Variantes: Low / Medium / High quando informadas. Nao criar codigos SAP, receitas ou associacoes industriais nao fornecidas.
- Produtividade = producao bruta / plano aprovado; meta inicial 95%, versionada.
- Takt informado: 12 segundos por peca. Plano aprovado informado prevalece. Takt nao configura o ciclo ideal do OEE.
- Preservar T20/selos, identidades, unidades, series, fontes e referencias historicas. Nao renomear seus registros como observacoes NHPL.
- Preservar Administracao, Engenharia, Operacao e Consulta, validacao dos servicos e regras, e proibicao de aprovar a propria correcao.
- Limites industriais NHPL e ciclo ideal real continuam pendentes. Referencias hipoteticas so existem no conjunto isolado de apresentacao, identificadas como exemplos.
- Os quatro horarios sao distintos: maquina ligada, producao iniciada, producao encerrada e maquina desligada.
- O fim da parada exige retorno de producao boa validada, ou confirmacao manual identificada, nao apenas maquina energizada.
- Nao inserir senhas, tokens, e-mails de contas ou dados pessoais no conjunto de apresentacao/documentacao.

## 2. Diagnostico atual verificado

### Complemento de acesso confirmado pelo usuario

A resposta de Fabiana inclui Operadores, Lideres, Supervisores, Tecnicos de Producao/Processo/Qualidade e Manutencao no fluxo colaborativo. Cargo profissional nao se confunde com papel tecnico. Lideres, supervisores e times tecnicos vinculados ao papel Engenharia podem registrar, criar novas analises, revisar, propor correcoes e decidir as propostas de outras pessoas. Operacao tem experiencia propria de turno: producao, parametros, parada, refugo/perda, ocorrencia, consulta e encaminhamento. Administracao conserva gerenciamento de cadastros/acesso. Consulta permanece somente leitura quando esse acesso for desejado. Nao criar contas ou promover memberships reais automaticamente. O operador tambem pode revisar seus apontamentos/propor correcao, sem decidir a propria proposta ou alterar planos/referencias. Dashboard de gestao e tela do operador consomem a mesma base; a demonstracao entre dispositivos exige backend compartilhado separado, nao e atendida apenas por localStorage.

Detalhamento implementado do complemento: Administracao e Engenharia mantem cadastros produtivos (inclusive nome/codigo/ativacao), alem de referencias, planos, analises e decisoes. Instalacao automatica dos catalogos e memberships continuam restritos; nenhuma conta foi promovida. Por orientacao do usuario, a autenticacao existente foi mantida, sem ajuste de login por aba. Contas distintas podem usar navegadores separados, mas a base local nao e compartilhada entre navegadores. Compartilhamento real exige backend autorizado; nenhum deploy foi realizado. Cargo nominal exige cadastro confiavel; o rotulo de acesso nao atribui cargo real a uma pessoa.

Inspecao na copia `C:/Users/Kauan/Desktop/msa-master`, sem `.git`. Nenhuma copia foi substituida. Fontes: retomada, especificacao aprovada, entrega NHPL, brainstorming, respostas completas de Fabiana e codigo atual.

| Ponto relatado | Evidencia atual | Correcao necessaria |
|---|---|---|
| Cadastro indisponivel em Apresentacao | `ui/main.js`: `writable()` retorna falso em `dataset === 'presentation'`, salvo simulacao. `ui/nhpl.js` repete a restricao. | Remover o seletor e a consulta ficticia somente leitura da experiencia de apresentacao; usar repositorio isolado gravavel pelos mesmos servicos. Nao remover autorizacao por perfil. |
| T20 em vez de NHPL | `catalog/nhpl.js` ja cria NHPL de forma adicional. `reconcileContext()` prefere NHPL se existir, mas nao instala o piloto real. `demo-workspace.js` e os cenarios antigos ainda usam selos/T20. | Novo conjunto proprio de NHPL; selecionar seu contexto inicial. Historico de selos continua separado. |
| Planejamento vazio | Os exemplos legados nao possuem os novos planos/politicas. Os tres cenarios NHPL possuem um intervalo, mas nao um turno completo. | Incluir planos, intervalos, politicas, janelas e apontamentos consistentes, com os mesmos vinculos usados na operacao. |
| Hora a hora sem dados | Selos possuem totais de varias horas sem distribuicao observada; `buildHourly()` nao os rateia. A NHPL usa `productivityMarkup()`. O dia inicial tambem pode nao ser o dia com registros. | Producoes do novo conjunto por intervalo real do exemplo; selecionar periodo/dia com dados e indicar cobertura. Nao distribuir retroativamente totais dos selos. |
| Acao vazia na Engenharia | `engineering()` so mostra Iniciar/Decidir em estados e perfis autorizados. Apresentacao somente leitura bloqueia essas acoes. Registros concluidos e propostas proprias tambem nao tem transicao. | Sempre oferecer detalhes/historico. Exibir a transicao permitida ou o motivo especifico da indisponibilidade. Nunca criar um botao de aprovacao sem permissao. |
| Cp/Cpk indisponiveis | `analyzeCep()` exige medicao, limites bilaterais aprovados, unidade/contexto/versao compativeis, sequencia, cobertura, dispersao e estabilidade. A planilha tem 17 observacoes e referencia historica nao aprovada. Os cenarios NHPL atuais nao tem parametros. | Acrescentar estudo didatico NHPL com pelo menos 30 observacoes validas e referencia hipotetica aprovada apenas no cenario. Manter os bloqueios corretos no dado real. |
| Minimo CEP ainda 25 | Default no dominio e na UI e 25. | Minimo efetivo >= 30 por estudo NHPL, aplicado no servico e UI; manter compatibilidade das series legadas. Frequencia 1x/turno nao significa 30 leituras obrigatorias em cada turno. |
| Pp/Ppk expostos | `ui/cep.js` exibe ambos junto de Cp/Cpk. | Remover Pp/Ppk da experiencia principal. Preservar contratos/calculos historicos onde sua retirada quebraria compatibilidade; nao colocar indices ocultos no destaque ou nas explicacoes principais. |
| E-mail nas configuracoes | `settings()` e `accountMarkup()` exibem o e-mail. A entrada real usa RE e aliases de `config/login-accounts.js`. | Mostrar RE inalteravel, nome e cargo; nao expor o e-mail no perfil/menu. Manter trocar senha e autorizacao existente. Cargo nao e uma autoatribuicao editavel. |

O navegador existente em 5175 estava na tela de login nesta inspecao; nao foi usada conta nem feita escrita Firebase. Quatorze testes focados existentes passaram: NHPL, simulacao, evidencias CEP e preferencias. Isso nao prova que os novos requisitos foram implementados.

## 3. Abordagens e escolha recomendada

1. **Base local persistente de apresentacao, com os mesmos servicos e calculos: recomendada.** Uma unica base ativa na interface, dados incluidos, gravacoes funcionais e isolamento da nuvem. Corrige a falsa expectativa de que a antiga consulta de apresentacao permitia editar. Exige evoluir o armazenamento local e o bootstrap.
2. **Workspace Firebase separado para apresentacao.** Permite demonstracao compartilhada entre dispositivos, mas exige provisionamento, regras publicadas, conectividade e autorizacao de nuvem separada. Nao deve ser criado silenciosamente.
3. **Preencher a base operacional com exemplos.** Rejeitada: mistura origem ficticia e producao, pode afetar historico/indicadores e contradiz as decisoes de preservacao.

Escolha proposta: primeira abordagem. O aplicativo da apresentacao nao tem seletor Operacional/Apresentacao nem mistura de consultas. O backend real continua suportado por configuracao de execucao, fora desse seletor, para nao abandonar a operacao futura. Identificar discretamente a origem como **Dados de apresentacao**; nao dizer que limites ficticios foram aprovados pela MSA.

## 4. Base unica, identidade e persistencia

- Reaproveitar o contrato de repositorio local e `createMsaServices`; nao usar uma implementacao de calculo mais permissiva para apresentacao.
- Criar uma versao propria do pacote NHPL e armazenamento proprio, sem sobrescrever `msa.demo.workspace.v1`, historico T20 ou dados da nuvem. Validacao inclui as novas estruturas de indicadores e eventos.
- Carregar o pacote somente quando nao existir essa base; reload preserva cadastros/apontamentos locais. Nao recriar ou reancorar os dados editados a cada abertura.
- Data/periodo inicial e hora a hora apontam para a janela do pacote; o cenario tem ancora temporal explicita. A passagem dos dias nao deve tornar a apresentacao vazia por um filtro padrao inadequado.
- Manter o login RE/Firebase existente e o papel da sessao validada para alteracoes na base local. O ator interno prepara exemplos, mas nao vira o ator do usuario. Sem sessao valida, consulta dos exemplos e permitida; escrita administrativa nao e liberada automaticamente.
- A base local nao e compartilhada entre dispositivos; a TV no mesmo navegador pode acompanhar atualizacoes entre abas. Compartilhamento real requer o workspace separado da segunda abordagem.
- RE resolvido pela identidade autenticada e exibido readonly. Nome pode ser alterado no escopo permitido; cargo vem do papel, nao de campo livre. Trocar senha continua exigindo reautenticacao. Nunca testar troca real de senha automaticamente.
- Oferecer exportacao/backup local. Restaurar cenario exige confirmacao e preservacao recuperavel das alteracoes locais; nao apagar historico operacional.
- Um sinal de rede Firebase nao e apresentado como conexao fisica NHPL. Separar sessao, armazenamento e frescor da fonte.

## 5. Conteudo incluido para apresentar

Um pacote coerente, nao fragmentos independentes por tela:

- NHPL, linha Montagem, processo com o nome solicitado, as duas familias e variantes informadas como contexto, sem seis SKUs inventados.
- Planos de exemplo por familia/OP/lote/turno, intervalos horarios aprovados, meta 95% e takt informado 12 s com origem; ao menos um plano informado que prevalece sobre a sugestao.
- Producoes brutas/boas e refugos compativeis com os intervalos; hora a hora, acumulados e cobertura derivados do mesmo dado. Nao duplicar producao nas raizes legada e planejada.
- Quatro horarios, parada nao planejada, setup, microparadas e uma falha com reparo completo, todos vinculados ao mesmo contexto. Exemplo incompleto existe como cenario secundario, nao e a entrada vazia inicial.
- Dois estudos de caracteristicas **demonstrativas**, com pelo menos 30 amostras validas cada, unidades, ordenacao e referencias do cenario. Ao menos um estavel com Cp/Cpk calculaveis e um desvio que encaminha para Engenharia. Nao afirmar que essas caracteristicas/faixas representam o plano de controle real.
- Fila tecnica com analise aguardando, em analise e concluida; evidencias e referencia do estudo. Proposta de correcao criada por outro ator para demonstrar decisao, e proposta propria para provar a proibicao.
- Cenario completo OEE: planejado 3.600 s, operacao 3.000 s, ciclo ideal **hipotetico** 10 s/peca, total 250, boas de primeira passagem 240. A=83,333...%, P=83,333...%, Q=96%, OEE=66,666...%. Com plano 300, produtividade=83,333...%, indicador distinto.
- Segundo exemplo de produtividade 285/300=95%; nao calcular ou inventar o OEE desse exemplo se suas bases nao estiverem preenchidas.
- Arquivos/eventos de exemplo para importacao, duplicacao, reset de contador, perda de sinal e retorno de producao boa. O dado gerado tem origem, sequencia e identificador, nunca uma conexao industrial ficticia.

Numeros adicionais do pacote sao exemplos documentados e testados. Limites reais NHPL permanecem em cadastro tecnico pendente. Aprovar uma referencia no repositorio local de apresentacao nao aprova uma referencia no workspace MSA.

## 6. Entrega 1: OEE e confiabilidade

Criar dominio unico de A/P/Q/OEE, MTBF/MTTR e taxa de falha, consumido por painel, detalhe, exportacao e TV. Referencias tecnicas versionadas por maquina/processo/familia/variante e vigencia; manter a referencia usada no resultado historico.

- Tempo de producao planejado vem do calendario/plano e exclusoes declaradas. Maquina ligada ate desligada e uma janela operacional, nao o denominador automatico do OEE.
- Disponibilidade = tempo de operacao / tempo planejado. Classificacao decide que paradas contam como perda; setup durante tempo em que se pretendia produzir nao e excluido so por ter sido planejado.
- Desempenho = ciclo ideal por peca x total / tempo de operacao. Referencia em segundos/peca; converter explicitamente ciclo e pecas/ciclo quando aplicavel. Nao usar takt por conveniencia.
- Qualidade = boas de primeira passagem / total. Retrabalho nao vira boa de primeira passagem; perdas kg nao viram refugos em pecas. Quantidades desconhecidas e inspecao pendente nao viram zero.
- OEE = A x P x Q; porcentagens somente na apresentacao. Diagnosticar desempenho >100%, tempos negativos e good>total; nao esconder com clamp.
- Politica versionada separa microparadas/perda de velocidade e perdas de disponibilidade, evitando descontar o mesmo evento nos dois componentes sem criterio declarado.
- Sobreposicoes usam uniao por recurso/janela. Eventos cruzando periodo exigem bases temporais adequadas; producao nao e rateada artificialmente.
- Mostrar componentes conhecidos mesmo quando OEE nao for calculavel. Zero confirmado, periodo aberto, ausencia, classificacao pendente e consulta incompleta possuem estados distintos; zero total nao recebe qualidade 100% artificial.
- MTBF e taxa de falha usam exposicao operacional comprovada e falhas classificadas; MTTR usa reparos encerrados e sua duracao, nao toda parada de producao. Zero falhas nao gera MTBF infinito nem MTTR zero inventado.
- Exibir memoria de calculo, unidades, referencias, cobertura, original/correcao e pendencias acionaveis. Nao criar meta 95% para OEE, MTBF ou MTTR.

Referencias primarias ja consultadas: https://www.oee.com/calculating-oee/ e https://www.oee.com/faq/. Nao documentam homologacao da MSA.

## 7. Entrega 2: operacao NHPL e Engenharia

- Contexto persistente com familia, variante quando conhecida, OP, lote, turno e janela. Trocar maquina/processo limpa vinculos incompatíveis; nao salvar com produto de outro processo.
- Apontamentos mostra plano/bruta/boas/refugo, saldo/meta, intervalo atual e ultimo dado. Atalhos de registro, inicio/fim de producao e parada por seletor, sem navegacao excessiva.
- Planejamento mostra planos/intervalos, fonte, vigencia e politica; permite criar/revisar de acordo com as restricoes existentes. Plano usado nao e sobrescrito para facilitar o roteiro.
- Engenharia sempre oferece Detalhes/historico. Iniciar, Decidir e Solicitar nova analise dependem do estado/perfil; autor de correcao ve Aguardando outro responsavel, nao uma celula inexplicavel.
- Evidencias de Qualidade: referencia ao plano de controle, resultado informado de inspecao/ensaio/performance, responsavel/data e justificativa. O software nao executa ensaios ou libera fisicamente a maquina.
- Pendencias apontam para sua causa: configurar referencia, completar coleta, confirmar intervalo, classificar evento ou resolver conflito, respeitando acesso.

## 8. Entrega 3: arquivos, eventos e microparadas

Contrato documentado de entrada para exemplos CSV/JSON, com versao, sourceId/eventId/sequence, origem, timestamp com fuso, contexto, tipo, unidade e valor quando aplicavel. Tipos cobrem producao incremental/contador acumulado, estados, alarme, medicao, inicio/fim de reparo e producao boa validada.

- Conector local acompanha **uma pasta configurada** e recebe somente arquivos completamente escritos; estabilidade/rename atomico evita ingerir metade do arquivo. Nunca pesquisar ou importar toda a maquina do usuario.
- Canal local entrega eventos ao aplicativo; navegador nao ganha acesso arbitrario ao filesystem. Listener restrito a loopback, limites de tamanho e caminho, sem credenciais Firebase embutidas nem endpoint publico.
- A ingestao grava atraves dos servicos com o ator permitido, nao altera memberships nem aprova limites vindos do arquivo. Sem sessao/perfil habilitado, deixa fila pendente; nao faz bypass.
- Idempotencia por fonte/evento e conteudo; mesmo ID com conteudo diferente e conflito. Reinicio/reprocessamento nao duplica producao ou parada.
- Eventos fora de ordem, contador resetado, lacunas e desconexao sao explicitos. Incrementos e acumulados sao formatos distintos; reset exige epoca/identificacao adequada.
- Transicoes de parada geram ocorrencias; retorno energizado nao encerra sozinho. Retomada por producao boa validada ou confirmacao manual auditada. Alarme pode sugerir motivo se houver mapeamento; nao inventa causa.
- Limiar de microparada e classificacao sao configuraveis/versionados. Registrar eventos curtos na origem, nao depender apenas de polling de estado a cada 15 s.
- Status da fonte: ultimo recebido, ultimo valido, conexao perdida, atrasado, fila/rejeicoes. Nao preencher continuidade durante gaps.
- Demonstracao end-to-end com produtor de arquivos/eventos local. Uma adaptacao real exige amostra de leiaute, tags, protocolo e validacao de Manutencao/TI; nao declarar leitura Siemens, SAP, Power BI ou andon pronta.

## 9. Entrega 4: referencias e CEP NHPL

- Cadastro manual de maquina/processo/produto/parametro completo, com vinculos, ativacao e validacao. Nome/estacao, unidade, medicao/setpoint, contexto/variante, origem, limites, revisao, vigencia e responsavel.
- Referencias reais nao fornecidas continuam pendentes/rascunho. Limite invertido/incompleto ou unidade incompatível nao e aprovado por auto-preenchimento.
- Minimo efetivo NHPL >=30 por estudo; UI nao pode baixa-lo para burlar o servico. Coleta 1x/turno gera acompanhamento de agenda, nao suposicao de tamanho de subgrupo industrial.
- Cp/Cpk em destaque, cartas I-MR e diagnosticos. Pp/Ppk removidos da tela principal conforme pedido, sem apagar evidencias/calculos historicos.
- Amostra suficiente nao dispensa estabilidade, sequencia, cobertura, natureza e especificacao valida. Estudo demonstrativo e identificado; estudo historico de 17 leituras nao vira 30 por duplicacao.
- Revisao tecnica preserva especificacao original associada ao dado; mudar a referencia atual nao reescreve a avaliacao historica.

## 10. Entrega 5: TV

Painel operacional full-width, sem pagina de marketing e sem cena 3D obrigatoria: identidade NHPL, familia/OP/turno, estado/frescor, plano x realizado, produtividade/meta, A/P/Q/OEE, perdas principais e pendencias. Nenhum indicador decorativo recebe dado diferente do painel principal.

- Tela cheia e retorno acessiveis; escala de texto fixa por layout, sem sobreposicao, rolagem lateral ou animacao indispensavel para entender o estado.
- Atualizacao reativa e timestamps; perda de comunicacao preserva ultima leitura com aviso de obsolescencia, nao uma maquina aparentemente saudavel.
- Consulta acompanha, sem botoes de gravacao. Compartilhamento entre dispositivos nao e prometido para a base local.
- Validar desktop, tablet, celular e TV; uso em TV real depende de navegador/rede autorizados. Diagramas futuros precisam de layout validado, nao de 32 maquinas ficticias.

## 11. Criterios de aceite e protecao contra esquecimentos

| ID | Verificacao obrigatoria antes de declarar concluido |
|---|---|
| A01 | Entrada com contexto NHPL/Montagem/Processo de montagem do abafador; familias/variantes corretas; T20 historica intacta. |
| A02 | Nenhum seletor Base de consulta; uma base ativa consistente; origem de apresentacao identificada. |
| A03 | Administracao cadastra maquina/processo/produto/parametro e preserva cadastro apos reload; vinculos invalidos bloqueados. |
| A04 | Operacao e Consulta nao ganham gestao; Engenharia decide somente o permitido; sessao revogada impede novas gravacoes. |
| A05 | Planejamento preenchido, novo plano informado/takt, revisao, intervalos e contexto coerentes. |
| A06 | Hora a hora com dados do pacote, mesmos totais do painel/CSV, ausencia != zero, sem rateio de selos. |
| A07 | Engenharia sempre tem detalhe/historico e explicacao de acao; fluxo Iniciar/Decidir/Nova analise; autoaprovacao negada. |
| A08 | CEP NHPL com Cp/Cpk calculaveis no exemplo estavel; minimo 30; 29 bloqueado; desvios/unidade/conflitos mantem bloqueios. |
| A09 | Pp/Ppk nao aparecem na experiencia principal; legado preservado. |
| A10 | Configuracoes/menu nao mostram e-mail; RE readonly, nome e cargo corretos; trocar senha permanece sem teste destrutivo. |
| A11 | Quatro horarios registrados e usados corretamente; producao boa/total/refugo sem duplicacao ou mistura kg. |
| A12 | OEE numerico conferido contra bases, ciclos versionados; desempenho impossivel, falta de base e resultado parcial diagnosticados. |
| A13 | MTBF/MTTR/taxa de falha com unidades/exposicao e classificacao; ausencia/zero falhas nao geram valores ficticios. |
| A14 | Arquivo novo percorre conector -> fila -> servico -> painel; duplicado/reinicio nao duplicam registros; invalido/conflito fica pendente. |
| A15 | Microparada curta, alarme, retorno sem boa, retomada validada e gap demonstrados; fonte claramente local. |
| A16 | TV usa os mesmos resultados; fullscreen/retorno e obsolescencia funcionam; desktop/mobile sem overflow. |
| A17 | Exportacoes incluem origem, contexto, unidade, versoes, cobertura e correcoes, sem senhas ou e-mails. |
| A18 | Testes de dominio, servicos, emulador e navegador para os quatro perfis; capturas novas revisadas e regressao legada. |
| A19 | Nenhum registro ficticio, conta, papel, regra ou catalogo real foi escrito por conveniencia da apresentacao. |
| A20 | Roteiro curto exercita as cinco entregas, incluindo cadastro real no repositorio local e um erro/pendencia bem explicado. |

Na implementacao, manter uma tabela de progresso por ID com teste/evidencia, arquivos alterados e pendencias reais. Atualizar entrega/retomada/roteiro com o estado executado, sem marcar itens so planejados como concluidos. Nao publicar resultados antigos como verificacao nova.

## 12. Prompt de continuidade desta ampliacao

> Trabalhe somente na copia atual do MSA. Leia este complemento, a especificacao NHPL ja aprovada, a entrega atual e as respostas completas de Fabiana. Nao repetir a aprovacao antiga nem usar contexto T20/selos como piloto. Piloto: NHPL; linha Montagem; Processo de montagem do abafador; Abafadores VGARD HP/MARK V; variantes quando conhecidas. Produtividade bruta/plano aprovado, meta95%, takt informado12s separado do ciclo ideal. Implemente as cinco entregas e todos os criterios A01-A20 somente apos revisao deste complemento e do plano novo. A apresentacao usa uma base local propria persistente, gravavel pelos mesmos servicos e perfis, sem seletor de consulta e sem dados ficticios na nuvem. Exemplos tecnicos sao hipoteticos e identificados. Preserve RE/contas/papeis, referencias e historico. Configuracoes sem e-mail, RE readonly, nome/cargo e troca de senha. Engenharia nunca fica sem detalhe/explicacao; Cp/Cpk com politica NHPL >=30 e sem Pp/Ppk na tela principal. Demonstre arquivos/eventos/microparadas e TV, mas nao alegue conexao industrial. Registre progresso por criterio, verifique regressao e deixe o servidor local acessivel. Sem deploy, push, alteracao de contas ou escrita operacional por suposicao.

## 13. Proxima etapa

Revisar apenas este complemento novo, principalmente a base local gravavel com login/perfil existente e origem explicitamente identificada. Depois detalhar o plano de implementacao incremental e sua execucao. A aprovacao NHPL/planejamento/produtividade de 07/10/2026 nao e solicitada novamente. Nao ha commit desta proposta porque a copia atual nao possui repositorio Git.
