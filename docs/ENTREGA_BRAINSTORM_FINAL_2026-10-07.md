# Entrega dos ajustes finais MSA

Atualizacao local de 07/10/2026 na copia `C:\Users\Kauan\Desktop\msa-master`. O usuario liberou a implementacao do brainstorming apos a etapa do pitch e solicitou testes em celular e dois documentos Word. Esta entrega prevalece sobre a instrucao historica de aguardar em `BRAINSTORM_AJUSTES_FINAIS_MSA_2026-10-07.md`.

## Implementado

- Dashboard com dois graficos: plano, bruta registrada e minimo da meta por intervalo; plano e bruta acumulados. Usa intervalos reais, sem rateio horario, interpolacao ou zero inventado. Uma lacuna interrompe o acumulado. Incrementos conhecidos ainda aguardando confirmacao aparecem no grafico de registros; a tabela conserva o estado de confirmacao. Totais em conflito nao aparecem como validos. Eixo de quantidade parte de zero.
- Retirada da faixa repetida Dados de apresentacao e do backup das paginas de trabalho. Backup mantido em Configuracoes. Origem hipotetica continua declarada no CEP/OEE, detalhes e exportacoes; nao foi apagada para aparentar dado industrial.
- Retirada do toolbar de Ligar maquina/Producao/Parametros/Parada/Refugo/Ocorrencia do Dashboard e dos Apontamentos. Nenhum comando controla maquina fisica. Nova coleta ficou em Parametros, nao no Dashboard; atalho Planejamento removido dos quadros de produtividade.
- Producao com resumos separados de bruta, boas, refugos em pecas e material em kg, comando Registrar producao, refugo/perda e quatro horarios manuais. Paradas com abertos e duracao encerrada no recorte. Hora a hora preserva apontar, confirmar e reconciliar nos intervalos reais.
- Seletor de intervalo exclui confirmados/retirados, aceita consulta de contexto ampla e explica quando nao ha intervalo aberto em vez de mostrar formulario vazio.
- Historico com contexto, autor, origem, correcoes e detalhes de referencia de cada leitura. Propostas de correcao de coleta sao normalizadas na leitura do historico; corrigido o erro ao abrir a comparacao na Engenharia sem alterar o armazenamento original.
- CEP preenche nova referencia com a versao do estudo selecionado; outras entradas usam a ultima aprovada do parametro. Sem referencia existente nao inventa valores. Sempre inicia como rascunho; envio explicito cria outra versao. Interface principal continua em Cp/Cpk.
- Coleta saiu do menu principal. Seu fluxo foi preservado em Configuracoes como Importacao de dados, separado da coleta manual em Parametros.
- TV saiu do menu e passou a Abrir painel TV em Indicadores. Retorno volta a Indicadores, preservando contexto e periodo.
- Configuracoes preserva RE somente leitura, nome, cargo e troca de senha; sem email visivel. Importacao e backup ficam em Gestao de dados.
- Administracao continua autorizada a todas as funcoes operacionais e tecnicas. O RE nao concede papel; membership confiavel concede. Proibicao de autoaprovar correcao permanece.
- Layout responsivo e formularios com rolagem propria; graficos se empilham em telas estreitas. Tabelas extensas rolam no seu contenedor, sem transbordar a pagina.

## Verificacao

- `npm test`: 148 testes aprovados, incluindo sete novas regressoes de navegacao, referencia, selecao de intervalos, graficos e normalizacao de correcao.
- `npm run verify:static`: 76 arquivos, nenhum erro.
- `npm run test:emulator`: 20 testes de integracao/regras, em projeto demo isolado. Reexecutado apos a correcao de Historico.
- Navegador com conta administrativa ficticia em servidor QA isolado na porta 5180. Sem credenciais reais nem escrita operacional: producao/incremento, confirmacao, refugo, parada e encerramento com peca boa, quatro horarios, ocorrencia, cadastro de maquina, referencia CEP como rascunho, coleta de parametros, previa/aprovacao de plano, inicio/decisao de analise, comparacao/aprovacao de correcao de outro autor, exportacao de backup, acesso a importacao e retorno da TV.
- Conferencia de todas as paginas principais em viewport real de 390 px e paginas principais em 320 px; `scrollWidth` igual ao `clientWidth`, sem overflow de pagina. Desktop 1440 px e graficos conferidos visualmente. Isso e emulacao de tamanho de celular, nao teste fisico em aparelho ou conexao de rede da fabrica.
- Troca de senha verificada pelos testes de servico; nao foi trocada senha de usuario pelo navegador. Conector fisico, aquisicao industrial e nuvem de producao nao foram ativados. O login QA comprova os fluxos do perfil; nao revalida a senha ou membership atual da conta real na nuvem.

## Documentos de uso

- `docs/Guia_Funcoes_MSA_2026-10-07.docx`: explica cada pagina e seus comandos sem linguagem de programacao.
- `docs/Roteiro_Paginas_MSA_2026-10-07.docx`: falas curtas e o que mostrar em cada pagina.
- Fontes editaveis Markdown homonimas em maiusculas. Construcao e imagens internas de revisao em `output/final-brainstorm-2026-10-07/`. DOCX renderizados pelo Word e conferidos visualmente; LibreOffice indisponivel neste Windows.

## Limites mantidos

NHPL/Montagem, familias VGARD HP e MARK V; 95% sobre producao bruta e plano aprovado; takt informado 12 s/peca, nao ciclo ideal. Limites NHPL reais, ciclo ideal, classificacao/inspecao industrial e metodo de aquisicao continuam dependentes de validacao. Historico T20/selos preservado. Exemplos nao foram promovidos a dados industriais.

Dados da apresentacao persistem neste navegador e nao sao automaticamente compartilhados entre navegadores. Sem alteracao de contas, senhas, memberships ou dados operacionais, sem gerador de dados real, sem push/deploy. Esta copia nao tem `.git`; nao foi presumida sincronizacao com master remota.
