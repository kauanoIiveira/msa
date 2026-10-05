# MVP MSA: funcoes, Firebase e publicacao estatica

Data: 05/10/2026. Status: especificacao aprovada pelo usuario; fase funcional implementada e testada localmente. Interface e validacao remota pendentes.

## 1. Entendimento e decisoes

O objetivo e demonstrar uma evolucao funcional do apontamento manual: cadastro, coleta, producao, paradas e perdas ligados ao contexto, persistencia compartilhada, historico e dados para analise. A entrevista de 06/10 levantara as regras ainda nao confirmadas pela empresa.

Decisoes do usuario: Firebase Realtime Database; acesso pelo navegador de outras pessoas via GitHub Pages; stack basica; implementar funcoes antes de decidir design/layout. Nao criar identidade, telas elaboradas, landing page, animacoes ou diagramas visuais nesta etapa.

Configuracao recebida: projeto `msayellowteam`, dominio de autenticacao `msayellowteam.firebaseapp.com` e banco `https://msayellowteam-default-rtdb.firebaseio.com`. A configuracao web sera centralizada em um modulo e usara os valores fornecidos, sem credencial administrativa no navegador. Analytics e Storage nao serao inicializados: nao sao necessarios para os registros estruturados desta fase.

Escopo adicional aprovado pelo usuario: Authentication por e-mail/senha; usuarios explicitamente autorizados; fluxo simples da Engenharia; alertas internos; Pareto de motivos; comparacoes filtradas e CSV. Sao escolhas para o MVP, nao requisitos ja homologados pela MSA.

## 2. Stack e mobilidade

**Escolha recomendada:** HTML, CSS e JavaScript modular (ES modules), sem framework de interface e sem servidor proprio. Firebase JS SDK modular, inicialmente pela CDN oficial com versao fixada. A documentacao oficial consultada apresenta 12.19.0; conferir disponibilidade dessa versao na implementacao e fixar a mesma em todos os imports.

Alternativas consideradas: React + Vite tambem gera arquivos para Pages, mas adiciona componentes/build antes de existir uma necessidade concreta; um servidor Node/Python com banco local nao atende ao objetivo atual de compartilhar apenas um link do Pages. Vite continua sendo uma opcao futura, nao uma dependencia inicial.

O Pages serve os arquivos estaticos; Auth e RTDB fornecem os servicos remotos. Node sera usado somente para testes e ferramentas de desenvolvimento. Caminhos relativos e navegacao por hash evitarao depender de reescrita de rotas e funcionarao sob `/<nome-do-repositorio>/`.

O artefato de publicacao sera exclusivamente `app/`, enviado por GitHub Actions ao Pages. Relatorios, PDFs, imagens industriais, evidencias e medicoes originais nao entram no site. A publicacao do repositorio inteiro exige ainda revisar o que pode ficar publicamente acessivel: excluir algo do site nao o torna privado no GitHub.

Fonte: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [Firebase via CDN](https://firebase.google.com/docs/web/alt-setup), [Vite no Pages](https://vite.dev/guide/static-deploy.html#github-pages).

## 3. Os 13 minimos e seus comportamentos

| Minimo do desafio | Comportamento da primeira versao |
| --- | --- |
| Maquinas/processos/produtos | Criar, consultar, atualizar metadados e inativar; IDs estaveis e vinculos validos |
| Parametros/dados monitorados | Nome, codigo, unidade, natureza (setpoint/medicao), processo/produto aplicavel e versao |
| Limites/metas | Faixa bilateral, regra unilateral ou pendencia explicita; metas de producao/perda/parada com unidade e periodo |
| Registro digital | Coleta contextualizada; valor original e numero interpretado, instante da ocorrencia, autor e origem |
| Quantidade/periodo | Quantidade inteira de pecas, periodo inicial/final, maquina/processo/produto; nao deduzir quantidade boa de perdas em kg |
| Paradas/duracao/motivo | Inicio, encerramento unico, categoria planejada/nao planejada e motivo; duracao derivada dos instantes |
| Refugos/perdas/motivo | Tipo, quantidade, unidade (pecas ou kg), motivo e contexto; retrabalho nao subtrai automaticamente producao |
| Armazenamento estruturado | Entidades/IDs, campos obrigatorios, tipos validados, timestamps, regras do RTDB e contexto consistente |
| Associacao ao contexto | Todo registro operacional referencia maquina, processo e produto; receita/lote/ordem opcionais com ausencia preservada |
| Historico | Consulta por periodo/contexto, paginacao e referencia ao registro original; sem exclusao fisica de registro operacional |
| Dashboard/graficos | Funcoes retornam indicadores, series temporais e distribuicao de motivos; renderizacao visual fica para depois |
| Desvios visuais | Funcoes retornam estado, severidade, regra e justificativa; cores/icone/layout ficam para depois |
| Fluxo do prototipo | Funcoes integradas e testadas: cadastrar > coletar/apontar > salvar > consultar > analisar > registrar decisao |

O cadastro pode ser inativado, mas nao removido se utilizado no historico. O contexto (maquina/processo/produto) deve existir e ser coerente. O periodo de uma producao precisa ser positivo; quantidades nao podem ser negativas. Perdas em pecas sao inteiras; massa admite decimal positivo.

Parametros preservam versoes imutaveis de unidade/limites. Uma coleta referencia a versao utilizada; alterar o cadastro nao reinterpreta silenciosamente o passado. Na importacao, os limites 80/75 e 0/0 identificados na planilha ficam pendentes, sem correcao automatica ou selo de conformidade. Para vacuo, uma regra precisa declarar a desigualdade efetiva: nao inferir pelo nome "minimo".

Uma coleta pode estar incompleta, mas isso deve ser registrado expressamente. Valores vazios nao viram zero; campo invalido nao entra na estatistica. Normalizar somente decimais inequívocos com virgula ou ponto, sem remover arbitrariamente sinais/unidades. Guardar a entrada original para rastreabilidade.

## 4. Avaliacao dos 16 opcionais

| Opcional | Decisao proposta |
| --- | --- |
| OCR de fotos da IHM | Adiar: campos, imagem, revisao humana e privacidade precisam de validacao; nao fingir OCR com dados prontos |
| Coleta direta de CLP/IHM | Adiar: depende de equipamento, rede e acesso autorizado |
| IoT | Adiar: exige hardware/protocolo e nao resolve o fluxo basico sozinho |
| QR de maquina/produto/ordem | Segunda etapa funcional, antes do design se houver tempo: URL com ID estavel e geracao por biblioteca de QR; sem prometer scanner universal |
| Alertas de parametro | Incluir: avaliar regra e retornar alerta explicavel ao salvar e receber atualizacoes; nao e e-mail/push em segundo plano |
| Alertas de Cp/Cpk/indicadores | Incluir alertas de metas operacionais configuradas; Cp/Cpk so como calculo demonstrativo identificado, sem decidir liberacao automaticamente |
| Excesso de paradas/refugo/perdas | Incluir quando existir meta explicita e denominador/unidade compativeis; ausencia de meta nao e desvio |
| Classificacao/analise de motivos | Incluir: catalogo, ranking/Pareto por duracao, pecas ou massa separadamente |
| Analise/liberacao da Engenharia | Incluir: aguardando analise > em analise > aprovado/nao aprovado; decisao humana, escopo e justificativa |
| Historico de analises/liberacoes | Incluir: autor, instante e transicoes preservados; correcao cria nova revisao |
| Tablet/smartphone | Logica independente do dispositivo; ergonomia e responsividade serao verificadas quando existir interface |
| Atualizacao em tempo real | Incluir listeners do RTDB em consultas limitadas e limpeza das assinaturas |
| Comparacoes | Incluir por maquina/produto/periodo; turno somente quando informado, nao inferido do horario |
| Exportacao | Incluir CSV dos registros/indicadores filtrados, com contexto, unidades e origem; sem PDF nesta primeira etapa |
| IA | Adiar: regra deterministica/alerta nao sera vendido como IA |
| API/integracoes futuras | Isolar repositorio e funcoes para evolucao; nao afirmar que uma API propria foi entregue no Pages |

O modulo de estatistica retornara n valido/invalido/ausente, media, minimo, maximo e dispersao. Os calculos aritmeticos de Cp/Cpk, se demonstrados, precisam declarar estimador de sigma, amostra e limites; retornar indisponibilidade para dispersao zero, faixa invalida ou dados insuficientes para a conta. Preservar a distincao entre formula computavel e estudo homologado. Nao implementar teste de normalidade manual nem estabelecer um n minimo universal de liberacao.

Utilizar uma biblioteca estatistica estabelecida para estimativas e uma biblioteca existente para QR, com versoes fixadas e licencas verificadas durante a implementacao. Nao criar um motor de CEP proprio nesta fase.

## 5. Repositorio, funcoes e dados

Estrutura planejada:

- `app/src/config/`: configuracao publica Firebase e opcoes do ambiente.
- `app/src/domain/`: validadores, contexto, limites, duracao, indicadores e transicoes puras; sem DOM/Firebase.
- `app/src/services/`: casos de uso e verificacao de papel/contexto; interface futura chama essas funcoes.
- `app/src/repositories/`: adaptador RTDB e assinaturas; adaptador em memoria somente para testes explicitamente identificados.
- `app/src/io/`: importacao/exportacao CSV e identificacao por URL/QR.
- `tests/`: testes unitarios e de regras/concorrencia no Firebase Emulator.
- `firebase/`: regras RTDB, indices, configuracao do emulador e instrucoes de provisionamento.

Grupos de funcoes: cadastros e versoes; registrar coleta/producao/perda; iniciar/encerrar parada; consultar/observar historico; avaliar parametros/metas; construir indicadores/ranking/comparacoes; solicitar/iniciar analise e registrar decisao; importar com previa e exportar CSV; entrar/sair/recuperar senha/observar sessao.

Cada operacao retorna resultado ou erro estruturado com codigo e campo, sem strings HTML. Falha de configuracao, credencial, autorizacao, referencia, validacao e rede tem codigos distintos. A logica nunca chama um resultado local de "salvo no Firebase" antes da confirmacao remota.

No RTDB, usar `workspaces/{workspaceId}` para separar demonstracao e piloto. Filhos: `members`, `machines`, `processes`, `products`, `parameters`, `parameterVersions`, `reasons`, `targets`, `collections`, `production`, `stoppages`, `losses`, `reviews` e `corrections`. `targets` armazena as metas ja previstas no escopo, com unidade e periodo explicitos. Nao e uma plataforma multiempresa completa: e separacao minima para impedir mistura de demonstracao e registros de trabalho.

Todo registro tem ID estavel, origem (`manual`, `import` ou `demo`), autor autenticado, instante da ocorrencia e `createdAt` de servidor. Fonte importada conserva arquivo/celula/linha e data sem inventar horario/operador/maquina ausentes. IDs de importacao sao determinísticos por origem/linha/contexto para evitar importar duas vezes.

Usar registros operacionais imutaveis e correcoes append-only, ligadas ao original e com motivo/autor. Encerramento de parada e transicao de analise usam transacao com estado esperado para nao fechar/decidir duas vezes. Alteracao de cadastro nao apaga vinculos historicos.

Nao somar cegamente duracoes sobrepostas. Para total de parada de uma maquina, utilizar uniao dos intervalos no periodo; a analise por motivo informa quando ha sobreposicao e nao promete reconciliacao industrial completa. Paradas abertas nao sao apresentadas como duracao final.

Consultas usam periodo, indices e paginas de tamanho limitado, nao listener na raiz do banco. Indicadores sao calculados sobre um conjunto completo do periodo ou sinalizados como parciais; nunca transformar as ultimas 200 linhas em "total do turno" sem informar o recorte.

Fonte: [Firebase leitura/escrita, transacoes e confirmacao](https://firebase.google.com/docs/database/web/read-and-write).

## 6. Autenticacao, regras e limites da nuvem

Proposta: Firebase Authentication por e-mail/senha, com entrada, saida e recuperacao. Habilitar o provedor no Console e criar os usuarios de teste; nenhum cadastro novo recebe automaticamente acesso ao workspace. Nao armazenar senha no RTDB, JavaScript ou Git.

Papeis propostos: `admin` cadastra/inativa e acompanha; `operator` aponta e solicita analise; `engineer` analisa, decide e autoriza revisao; `viewer` consulta. Admin pode acumular a funcao de Engenharia no ambiente demonstrativo, com regra explicita. Permissoes de membros sao provisionadas no Console por responsavel confiavel; clientes nao podem criar o proprio vinculo nem elevar seu papel.

As regras do RTDB, nao apenas o navegador, devem impedir acesso sem autenticacao/vinculo; leitura de outro workspace; elevacao de papel; autor forjado; alteracao/exclusao de registros imutaveis; tipos/campos desconhecidos; contexto inexistente; transicao indevida; limite aprovado alterado por operador; e contradicao entre inicio/fim. Nao conceder `.write` na raiz para depois tentar restringir filhos.

A config web e publica por desenho e pode estar no site. A protecao dos dados depende de Auth/regras e configuracao do projeto, nao de esconder a apiKey. Nao ativar regras abertas como solucao para erro de permissao. Publicar o codigo no GitHub nao publica as regras no Firebase: conferir separadamente o deploy e um teste remoto com usuario permitido e nao permitido.

Sem autorizacao administrativa nesta conversa, nao prometer que provedor, usuarios, regras ou dominios ja foram configurados. A primeira validacao usa emuladores, sem escrever sobre dados remotos existentes. Provisionamento remoto e publicacao final serao verificados separadamente.

Tempo real pressupoe conexao. O SDK web do RTDB nao garante persistencia offline apos fechar a pagina. Nesta versao, informar conectividade e exigir confirmacao remota; rascunho persistente local e fila offline/sincronizacao duravel ficam fora do escopo inicial. PWA/service worker e outbox persistente ficam para uma etapa especifica apos confirmar a necessidade.

Fontes: [Auth e-mail/senha](https://firebase.google.com/docs/auth/web/password-auth), [regras RTDB](https://firebase.google.com/docs/database/security), [chaves Firebase](https://firebase.google.com/docs/projects/api-keys), [limite offline do SDK web](https://firebase.google.com/docs/database/web/read-and-write#work_with_data_offline).

## 7. Aceite e verificacao

1. Cadastros existentes e inativos se comportam corretamente e referencias invalidas sao rejeitadas.
2. `0,8` e `0.8` produzem o mesmo numero; vazio, NaN, infinito e texto ambiguo nao entram em calculos.
3. Limite 80/75, zonas 0/0 e vacuo sem desigualdade nao geram aprovacao automatica.
4. Coleta usa dados validos posteriores mesmo quando o primeiro campo esta vazio; exemplos BF/CF/CH servem de regressao local, sem envio automatico a nuvem.
5. Quantidade/periodo validos sao persistidos; perdas em kg nao diminuem quantidade em pecas nem geram percentual sem denominador.
6. Parada fecha uma unica vez; intervalo negativo e rejeitado; sobreposicoes nao duplicam tempo parado no total da maquina.
7. Analise segue estados e papeis; aprovacao humana nao comanda ou libera fisicamente uma maquina.
8. Correcao guarda original, autor/motivo e nova revisao; historico anterior permanece consultavel.
9. Importacao repetida nao duplica registros e exige previa/confirmacao; demonstracao nunca se mistura com piloto.
10. Duas sessoes autorizadas recebem atualizacoes; sessao nao autorizada nao le/grava mesmo chamando diretamente o SDK.
11. Exportacao conserva unidade/origem e neutraliza celulas de texto perigosas para formulas em planilhas, sem destruir numeros negativos de vacuo.
12. Testes unitarios das funcoes puras e testes de regras/papeis/concorrencia no emulador passam; verificacao remota e posterior e nao sera alegada por testes locais.
13. Artefato estatico usa caminhos relativos e nao contem fotos/PDFs/credenciais administrativas ou evidencias industriais. O design e a verificacao visual ficam para a etapa solicitada posteriormente pelo usuario.

Demonstracao funcional futura: cadastrar contexto/limite > registrar coleta/producao > abrir/fechar parada > apontar perda > obter historico/indicadores > enviar analise > registrar decisao > exportar. Tudo usando dados demonstrativos identificados e usuarios autorizados.

## 8. Pendencias externas e revisao

A URL do banco ja foi recebida. Para validar nuvem: verificar provedor Auth habilitado, usuarios autorizados, regras publicadas e dominio final de Pages na configuracao aplicavel do Auth/App Check/restricoes da chave. Essas verificacoes nao autorizam deixar dados publicos.

Para publicar: definir repositorio/conta e revisar os arquivos que podem ficar publicos. Nenhuma foto/documento/medicao real sera enviado automaticamente. Dados de demonstracao sinteticos podem existir em workspace separado; importacao de material real exige escolha/confirmacao explicita.

O usuario aprovou esta especificacao em 05/10/2026 e escolheu execucao direta. A fase funcional foi implementada; evidencias, decisoes e limites estao em `docs/ENTREGA_FUNCIONAL.md`. O brainstorming de design/layout permanece como proxima etapa. Nao houve publicacao ou validacao da nuvem real.
