# Brainstorming final: clareza, graficos e fluxo operacional

Data: 07/10/2026. Estado: **somente brainstorming; implementacao suspensa ate nova orientacao do usuario**.

O usuario quer fazer outra atividade antes de implementar estes ajustes. Este documento organiza integralmente o pedido e acrescenta propostas para avaliacao. Nao autoriza alterar telas, dados, contas, calculos, regras, navegacao, Firebase ou publicacao. A autorizacao anterior da entrega NHPL nao autoriza executar este novo brainstorming.

## Fontes e criterio de decisao

- Pedido atual do usuario e tres imagens anexadas: recorte da avaliacao, enunciado/entregaveis e barra de atalhos.
- Enunciado completo transcrito em `continuidade/2026-10-06/ENUNCIADO_TRANSCRITO.md`: exige dashboard com indicadores e graficos, registro digital, producao por periodo, paradas/duracao/motivo, refugos/perdas/motivos e historico. Coleta automatica e diferencial opcional, nao condicao para o fluxo manual funcionar.
- Recorte da avaliacao: entendimento do problema (25), viabilidade tecnica/pratica (25), inovacao/criatividade (20), nota final maxima 100. O recorte nao mostra os outros criterios; nao inventar os 30 pontos restantes nem atribuir nota ao projeto neste brainstorming. A observacao antiga da transcricao sobre nao haver rubrica nas duas fotos originais nao contradiz este novo anexo separado.
- Codigo atual em `app/src/ui/main.js`, `technical.js`, `nhpl.js` e `cep.js`, e estado registrado em `ENTREGA_NHPL_COMPLETA_2026-10-07.md`.
- As imagens sao referencias de conteudo e aparencia, nao ordens independentes de implementacao. O pedido escrito do usuario determina o escopo e a espera.

Minha leitura: a centralizacao manual confiavel deve ser o caminho principal; acompanhamento visual e decisao tecnica devem ficar claros. Uma funcao adicional so merece destaque se ajudar esse trabalho e puder ser demonstrada sem sugerir acesso fisico inexistente.

## 1. Dashboard

### Direcao solicitada

- Acrescentar grafico(s) de acompanhamento, como exigido nos entregaveis.
- Retirar a opcao **Ligar maquina**. Nao havera controle/acesso a maquina; o sistema centraliza dados registrados.
- Retirar a faixa **Dados de apresentacao / NHPL / armazenamento local**, incluindo os elementos de sua linha.
- Retirar toda a barra enviada no print: **Ligar maquina, Producao, Parametros, Parada, Refugo/perda e Ocorrencia**.
- Retirar o atalho **Planejamento** do Dashboard. Planejamento continua na sua pagina; os registros continuam nas respectivas areas.
- Estas retiradas tambem se aplicam a Apontamentos, conforme secao 3.

### Proposta para avaliar depois

Dois graficos principais, com os mesmos filtros e bases das tabelas:

1. **Plano x realizado por hora/intervalo**: colunas para plano aprovado e producao bruta; referencia do minimo para atingir a meta vigente. Mostra imediatamente onde houve falta ou recuperacao. Boas/refugos podem aparecer no detalhe, sem confundir produtividade bruta com qualidade.
2. **Acumulado planejado x realizado**: linhas por intervalos realmente registrados. Explica a evolucao do turno e o desvio acumulado. Nao interpolar medicao desconhecida, preencher lacuna com zero ou ratear uma quantidade agregada por horas.

Como terceiro grafico opcional, avaliar Pareto de motivos de parada/refugo. Duracao de parada e quantidade de refugo precisam de graficos separados, com unidades e denominadores explicitos; nao misturar minutos, pecas e kg. Nao transformar todos os indicadores em graficos sem uma pergunta operacional clara.

O Dashboard deve responder: quanto foi planejado/produzido, onde houve desvio, quais perdas merecem atencao e qual a ultima informacao confiavel. Cadastros, registro e configuracao ficam fora do centro dessa tela. Grafico precisa de eixos/unidades, legenda, dados no detalhe e estados sem dados/parcial, nao apenas numeros visualmente atraentes.

## 2. Parametros

- Pagina aprovada pelo usuario; preservar estrutura e funcionamento.
- Retirar a faixa repetida **armazenamento local / Backup**.
- Nao aproveitar este ajuste para refazer limites, unidades, leituras, detalhes ou historico.

## 3. Apontamentos

### Direcao solicitada

- Pagina considerada boa; aprofundar algumas secoes, sobretudo **Producao** e **Paradas**.
- Incluir **Refugos** de forma mais evidente em uma dessas secoes.
- Garantir que seja possivel **registrar Producao** nesta pagina, sem depender da barra global.
- Retirar a faixa de apresentacao/armazenamento/Backup, a barra inteira de atalhos do print e o atalho Planejamento, quando presentes.

### Proposta para avaliar depois

- **Producao**: comando local **Registrar producao**, junto da tabela; contexto de maquina/processo/produto/variante, OP, lote, turno, intervalo, quantidade bruta, boas e situacao. Resumo de plano/realizado/refugo, sem criar uma segunda fonte de contagem. Mostrar quem registrou/corrigiu e qual registro e efetivo no detalhe.
- **Refugos e perdas**: minha preferencia e manter uma secao identificavel, com quantidade/unidade, motivo selecionavel, periodo e vinculo ao apontamento. Exibir seu resumo tambem em Producao; a selecao da secao pode abrir o cadastro dedicado. Nao incorporar refugo apenas em Paradas: ha refugo sem parada e parada sem refugo.
- **Paradas**: comando local **Registrar parada**, inicio, fim, duracao calculada, motivo selecionavel, planejada/imprevista, aberta/encerrada e validacao de retomada quando aplicavel. Classificacao tecnica/falha/reparo continua sob o papel autorizado. Escrita livre apenas para complemento necessario, nao substitui lista de motivos.
- **Hora a hora**: aprofundar contexto, plano, bruta, boas, refugo, produtividade, acumulado, confirmacao e pendencias, respeitando dados efetivamente disponiveis.
- **Ocorrencias**: manter cadastro e acompanhamento na sua propria secao, sem depender do atalho removido.
- **Horarios manuais**: o botao atual Ligar maquina nao comanda hardware; registra um marco temporal. A nomenclatura induz a interpretacao errada e deve sair. Preservar a necessidade documentada dos quatro horarios (maquina ligada, producao iniciada, producao encerrada, maquina desligada) em formulario de registro/edicao auditada em Producao, com linguagem como **Registrar horarios**. Isso nao equivale a acionar a maquina. Nao remover silenciosamente esses dados por retirar o botao.
- Bruta, boas e refugo precisam de reconciliacao explicita. Nao somar refugo duas vezes, calcular perdas em kg como pecas nem chamar toda diferenca entre bruta e boas de refugo sem classificacao suficiente.

O codigo atual ja tem Novo registro em Producao e uma secao de perdas; o pedido e deixa-los evidentes e mais completos, nao criar um segundo cadastro independente. A barra removida deve ser substituida por comandos locais pertinentes, respeitando cada perfil.

## 4. Planejamentos e Engenharia

- Paginas aprovadas pelo usuario; preservar o restante.
- Retirar **armazenamento local / Backup** das duas paginas.
- Manter planos/revisoes/vigencias e o fluxo de analise, evidencia, correcao e decisao nas suas areas proprias.
- Nao alterar permissoes, permitir autoaprovacao ou converter propostas em aprovacao automatica para agilizar a apresentacao.

## 5. CEP

- Ao clicar em **Definir nova referencia da Engenharia**, abrir o formulario **preenchido e pronto para revisao/envio**, facilitando a apresentacao.
- Hoje o comando passa apenas o identificador do parametro ao formulario; avaliar preenchimento a partir da referencia selecionada no estudo.
- Proposta: reaproveitar parametro, contexto, unidade, natureza, regra/limites e fonte/revisao existentes quando validos. Vigencia nova precisa ser coerente; manter os campos editaveis e validacoes.
- Se faltar referencia real aprovada, nao preencher limites inventados. Na apresentacao, os valores didaticos ja existentes podem preencher o exemplo com sua origem preservada.
- Preenchimento nao e envio automatico, aprovacao silenciosa ou homologacao. A acao continua dependente do papel autorizado e confirmacao consciente.
- Criar nova versao sem modificar a referencia historica ou reinterpretar leituras antigas retroativamente. Manter Cp/Cpk, minimo NHPL >=30 e diagnosticos de incompatibilidade/conflito.

## 6. Historico

- Pagina aprovada; retirar **armazenamento local / Backup**.
- Avaliar informacoes mais uteis em cada secao, sem tornar toda tabela excessivamente larga.
- **Coletas/parametros**: parametro, leitura/unidade, versao/limites aplicados, desvio, horario e origem.
- **Producao**: inicio/fim, intervalo/OP/lote/turno, base bruta/boas, quantidade, plano vinculado e confirmacao.
- **Paradas**: inicio/fim, duracao, motivo, situacao, tipo/classificacao, validacao de retomada e reparo quando existente.
- **Refugos/perdas**: quantidade/unidade, motivo, contexto e registro de producao relacionado quando informado.
- **Analises/correcoes/ocorrencias**, quando disponiveis: responsavel, estado, justificativa, evidencia e trilha original -> proposta -> decisao -> registro efetivo.
- Campos comuns: quem registrou, ultima revisao, fonte, contexto e pendencias. Priorizar poucas colunas operacionais e detalhes expansivos para auditoria. Nao inventar informacao que nao foi armazenada; sua ausencia deve continuar clara.
- Manter filtros por periodo/contexto/tipo/situacao e exportacoes rastreaveis. Novos filtros ou secoes sao propostas, nao autorizacao de implementacao.

## 7. Cadastros

- Pagina aprovada pelo usuario; retirar **armazenamento local / Backup**.
- Preservar o restante: cadastro/edicao permitida, identidade e vinculos produtivos, validacoes e historico.

## 8. Coleta: esclarecer antes de decidir

O usuario nao entendeu a pagina. Isso e um problema de clareza e lugar na navegacao, nao prova de que o registro digital seja dispensavel.

**O que ela faz hoje:** e uma pagina tecnica de importacao de eventos JSON e acompanhamento de uma pasta por conector local. Mostra origem, sequencia, eventos, lacunas e falta de atualizacao. Ela nao liga a maquina, nao le a IHM/CLP diretamente, nao extrai fotos por OCR e nao equivale ao formulario manual de parametros. Esse formulario permanece em Parametros/registro de coleta, e producao/paradas/perdas ficam em Apontamentos.

**Por que existe:** demonstrar uma possibilidade futura de entrada automatizada e validar eventos sem duplicacao. Esse diferencial e opcional no desafio; para a necessidade atual de Fabiana, o registro manual centralizado deve continuar completo sem conector.

**Minha recomendacao para avaliar:** tirar Coleta do menu principal na experiencia manual, manter os registros manuais em Parametros/Apontamentos e realocar importacao/conector para uma area tecnica secundaria, como Integracoes ou Importacao de dados. Alternativa: manter uma pagina chamada Importacao de dados se ela for usada no roteiro. Nao apagar servicos, eventos/historico ou a capacidade de importar apenas porque a pagina atual nao e intuitiva.

Nao alegar integracao industrial. OCR, PLC/IHM e conectividade real continuam fora do que esta comprovado. A escolha entre realocar, renomear ou ocultar esta pagina ainda e proposta para revisao posterior.

## 9. TV e Indicadores

- Direcao solicitada: **TV passa a ser um botao clicavel em Indicadores**.
- Interpretacao proposta: remover TV como item independente do menu e oferecer **Abrir painel TV**, com icone de monitor, dentro de Indicadores.
- Preservar painel, filtros/contexto herdados, fonte/atualizacao, tela cheia, saida e retorno a Indicadores. Nao recriar calculos nem desconectar a TV dos mesmos resultados do sistema.
- Abrir na mesma tela ou em aba separada continua detalhe de implementacao futura; nao retomar autenticacao por aba. Navegadores diferentes continuam sem compartilhar a base local atual.

## 10. Faixas repetidas, Backup e honestidade dos dados

- Retirar a faixa repetida de apresentacao/armazenamento e seu Backup no **Dashboard, Parametros, Apontamentos, Planejamentos, Engenharia, Historico e Cadastros**. Sao todas as paginas citadas; a duplicacao vem de um componente compartilhado.
- No Dashboard/Apontamentos, retirar tambem a barra completa do print e Planejamento, mesmo quando aparecem em outro componente. Sao tres elementos distintos; nao tratar a retirada de um como se removesse todos.
- A faixa atual tambem pode conter **Entrar com RE**: a faixa sai, mas o acesso/login precisa permanecer pelo menu da conta, sem criar barreira extra nem remover autenticacao.
- **Proposta, nao decisao de exclusao:** realocar backup para Configuracoes/gestao de dados, conforme perfil, em vez de apagar a capacidade de preservar registros. Remover o botao repetido nao significa apagar armazenamento, reinicializar fixtures ou perder historico.
- Retirar a mensagem tecnica permanente pode deixar a interface mais limpa. Ainda assim, referencia hipotetica nao pode parecer limite real aprovado. Manter origem/rastreabilidade no detalhe/relatorio e uma identificacao discreta suficiente no contexto de exemplos tecnicos, sem repetir a faixa em toda pagina. Formato final sera avaliado depois.
- Nao transformar a retirada visual em migracao de backend, unificacao entre navegadores ou escrita operacional. A arquitetura e a proveniencia permanecem preservadas.

## 11. O que permanece fixo

NHPL como piloto, Montagem, Processo de montagem do abafador, VGARD HP/MARK V, Low/Medium/High quando conhecidos; T20/selos preservados. Produtividade bruta/plano aprovado, meta inicial 95%, takt informado 12 s/peca separado do ciclo ideal. OEE/MTBF/MTTR precisam de bases e referencias confiaveis. Limites reais NHPL continuam pendentes. Sem dados nao e zero; fontes/unidades/contextos nao se misturam. Lideres/supervisores/times tecnicos com papel adequado podem registrar/revisar/corrigir/decidir; operador tem fluxo proprio e nao se autoaprova. RE imutavel e configuracoes sem e-mail visivel.

## 12. Checklist para a futura revisao

- Dashboard com graficos vinculados aos mesmos resultados e filtros, com unidades/lacunas legiveis.
- Nenhum comando visual sugere ligar/desligar/controlar equipamento. Quatro horarios manuais continuam registraveis na area apropriada.
- Faixas/Backup repetidos removidos de todas as sete paginas citadas; acesso e preservacao de dados continuam acessiveis.
- Dashboard e Apontamentos sem barra global do print nem atalho Planejamento; cada registro tem comando local em sua propria area.
- Producao, Paradas, Refugos/perdas, Hora a hora e Ocorrencias com campos e detalhes pertinentes, sem dupla contagem.
- Parametros, Planejamentos, Engenharia e Cadastros preservados fora das retiradas solicitadas.
- CEP preenche a nova referencia a partir do contexto/versao certos, sem inventar, aprovar ou enviar automaticamente.
- Historico mais informativo, original/correcao distinguiveis e fontes preservadas.
- Destino/rotulo de Coleta revistos antes de mudar sua navegacao; registro manual completo sem conector.
- TV acessivel por botao em Indicadores, com retorno e mesmos resultados.
- Verificacao futura de perfis, regressao, desktop/mobile e exportacoes apos autorizacao de implementacao.

**Proximo passo agora: aguardar a outra atividade solicitada pelo usuario. Nenhum item deste brainstorming deve ser implementado neste momento.**
