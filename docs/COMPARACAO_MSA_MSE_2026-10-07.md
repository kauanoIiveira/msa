# Comparação MSA × MSE — 07/10/2026

## Veredito

Para a **operação e análise de Engenharia solicitadas pela Fabiana**, recomendo continuar sobre o MSA do usuário. Ele está mais alinhado ao plano aprovado, aos 95% de produtividade, ao contexto produtivo e à preservação dos históricos. Para **apresentar o conceito de supervisório, estados da máquina e integração**, o MSE é superior hoje: mapa, cena 3D, modo TV e adaptador de telemetria são vantagens concretas.

Nenhum dos dois atende integralmente à demanda atual. O MSA ainda não tem o módulo completo de OEE/MTBF/MTTR nem coleta automática de microparadas. O MSE calcula OEE quando recebe bases completas, mas sua demonstração não é uma implantação industrial; a operação manual não fornece essas bases, e faltam planejamento histórico equivalente, CEP e aprovação técnica rastreável. Não recomendo substituir o MSA inteiro pelo MSE.

## Método e limites da análise

- Fonte MSE: `C:/Users/Kauan/Pictures/MSE`. Os **125 arquivos originais** permanecem iguais por SHA-256 antes/depois. Testes que geram arquivos rodaram numa cópia isolada em `output/analise-mse-2026-10-07/MSE-copia/`.
- Fonte MSA: `C:/Users/Kauan/Desktop/msa-master`, entrega NHPL atual. Nenhum código de produto de qualquer sistema foi editado durante esta comparação. Foram criados somente relatório, ferramentas e evidências de análise.
- Inspeção de código, documentação, regras, módulos, demonstração pública, cena 3D e telas operacionais com fixtures dos testes do próprio concorrente. As telas com fixtures têm aviso explícito e não usam Firebase.
- Não houve cadastro adicional, alteração de perfis, preparação de catálogo, apontamento produtivo, deploy ou leitura de dados privados do concorrente. Não foram gravados senhas, tokens ou credenciais nas evidências.
- O acesso real com o identificador exato informado não foi concluído. Isso limita conclusões sobre o estado atual do banco remoto, não a análise dos contratos locais. Não houve tentativa de variantes de credenciais via API.

## 1. Login: diagnóstico confirmado

Não encontrei dependência npm faltante para o login. O aplicativo é estático e carrega o SDK Firebase 12.19.0 pela CDN; os quatro módulos consultados responderam HTTP 200 e a inicialização funcionou no Edge de teste. `drizzle-kit` e `drizzle-orm` não são dependências do fluxo de autenticação da interface.

A política pública do projeto, consultada pelo SDK **sem criar conta**, exige:

- Mínimo de **8 caracteres**.
- Pelo menos uma letra **maiúscula**, uma **minúscula** e um **número**.
- Símbolo não é obrigatório.

O cliente valida apenas mínimo 6 e traduz `auth/password-does-not-meet-requirements` e `auth/weak-password` para a mesma mensagem genérica de 6 caracteres. Essa divergência explica o erro relatado; o usuário confirmou que conseguiu criar o cadastro após ajustar a senha. A correção adequada é validar a política com `validatePassword` e mostrar os requisitos ausentes, não enfraquecer o Firebase. [Documentação Firebase](https://firebase.google.com/docs/auth/web/password-auth).

Segundo ponto: o RE enviado nesta conversa tem 11 dígitos; HTML, validador e regras locais aceitam até 10. O formulário recusa 11 quando preenchido integralmente e pode cortar a digitação no limite. Uma consulta de autenticação com o identificador exato retornou `INVALID_LOGIN_CREDENTIALS`. Não deduzi nem tentei contas alternativas. No navegador embutido houve também erro genérico de conexão após digitação normal; ele não prova falha global do serviço. Para inspecionar a sessão real, é necessário usar o identificador efetivamente salvo ou a sessão já aberta do usuário.

A documentação do MSE diz que suas regras remotas não foram publicadas. Não confirmei o conteúdo das regras remotas; uma conta Auth criada, isoladamente, não prova que o perfil operacional está acessível. A configuração pública não dá autorização para publicar regras.

## 2. Comparação por necessidade

| Necessidade | MSA atual | MSE atual | Avaliação |
|---|---|---|---|
| Plano × realizado, 95%, takt informado 12 s | Plano aprovado por OP/lote/turno, fonte e revisões; bruto separado | Gestão principal usa peças aprovadas/meta diária atual; NHPL demo usa metas fictícias 1.200/150 | MSA mais aderente à decisão aprovada |
| NHPL, VGARD HP/MARK V | Catálogo adicional sem renomear T20 histórico | NHPL cadastrada e cena 3D específica, variantes visuais e layout conceitual identificados | Ambos reconhecem o piloto; MSE apresenta melhor |
| Quatro horários distintos | Janela operacional auditada | Registra início/fim do apontamento e cronologia simulada; não achei contrato manual equivalente dos quatro horários | MSA mais próximo das anotações do usuário |
| Coleta rápida | Contexto obrigatório e motivos por seleção; ainda tem várias telas/etapas | Máquina em uso por operador, setor derivado, turno por seleção; produto e lote/OP livres, observações | MSE tem boa ergonomia de contexto; MSA estrutura melhor o dado |
| OEE | Ainda indisponível, sem motor completo conectado à NHPL | Motor A×P×Q existe; dados completos podem entrar por adaptador; demo calcula com referências fictícias | MSE mais avançado no software, nenhum validado na fábrica |
| MTBF/MTTR | Não entregues | Funções exigem histórico completo, falha identificada e reparo concluído; demo mostra indisponível | MSE tem vantagem inicial; falta fluxo operacional completo |
| Microparadas/importação automática | Não implementadas fisicamente | Receptor de telemetria e simulador; sem gateway da NHPL ou coleta industrial comprovada | Nenhum resolveu a necessidade automática |
| Parâmetros, Cp/Cpk, controle da Qualidade | Versões de referência, CEP I-MR, Cp/Cpk/Pp/Ppk e bloqueios de evidência | Cadastro simples min/max e alertas pelo limite atual; não encontrei CEP equivalente | MSA mais adequado à Engenharia |
| Histórico e correção | Original imutável, proposta e decisão por outra pessoa | Autor substitui o registro atual, preserva origem e volta a conferir; não conserva a quantidade anterior como revisão | MSA superior em rastreabilidade |
| Permissões | Quatro papéis, membership confiável, Consulta somente leitura | Três cargos, escopo por máquina/setor bem aplicado; novo cadastro pode escolher Chefe ativo | MSE tem escopo operacional granular; MSA evita autoatribuição de gestão e inclui Consulta |
| Planta, TV e compreensão visual | Sem supervisório equivalente | Mapa, câmera/estações, estados, atualização, comunicação perdida, TV e tela cheia | MSE superior nesta experiência |
| Comunicação | Sem chat equivalente | Chat por setor, passagem de turno e conversas privadas | MSE mais completo; prioridade abaixo de coleta/indicadores para este piloto |
| Relatórios e proveniência | CSV com plano, políticas, cobertura, confirmação/correções; ausência diferente de zero | Relatórios pelos registros atuais, resumos por setor; métricas principais não exigem cobertura explícita | MSA mais robusto para explicar resultados |

Quantidade de menus ou de testes não foi usada como nota de qualidade. O MSE resolve problemas reais de visualização; isso não elimina suas lacunas de dado e governança. O MSA protege melhor os resultados, mas precisa transformar essas proteções numa experiência operacional mais rápida.

## 3. Riscos reproduzidos no MSE

1. **Histórico muda com a meta atual:** com os mesmos 200 registros/peças e a mesma janela, mudar `metaDiaria` de 200 para 400 mudou atendimento de 100% para 50%. A tela principal não usa o histórico de metas da cena NHPL. `metrics.js:28` e `operations-service.js:184`.
2. **Correção substitui o valor anterior:** `save` grava com `set` sobre o mesmo ID e limpa conferência. O teste real de regras permite substituir 80 por 90; preserva autor/origem, mas não a quantidade anterior. Isso não equivale à trilha de proposta/aprovação do MSA. `operations-service.js:126` e `tests/database-rules.test.mjs:45`.
3. **Recorte atribui ao fim:** um apontamento de 24 horas/200 peças foi integralmente contado na última hora e não nas primeiras 23. O popup manual também agrupa pela hora de conclusão. Não prova produção física naquela hora. `metrics.js:6` e `nhpl-data.js:35`.
4. **Ausência vira zero:** coleção vazia com meta configurada produz zero peças/0% sem confirmação de completude. A interface mostra “sem parada aberta”, que não significa equipamento operando — o MSE corretamente informa em nota que esse estado depende de registros manuais. `metrics.js:2` e `operations-ui.js:97`.
5. **Referência técnica atual, sem versão vinculada à leitura:** alterar o limite vigente muda o diagnóstico da mesma leitura. Pode ser útil para comparação contra o limite atual, mas não há referência original imutável para reconstruir o diagnóstico histórico. `metrics.js:44` e `operations-service.js:155`.
6. **Cadastro escolhe acesso elevado:** a UI permite selecionar Chefe e as regras locais aceitam criar esse perfil ativo. É uma simplificação documentada de demonstração, não uma autorização segura para uso industrial aberto. A proibição de promoção depois do cadastro não corrige essa escolha inicial. `database.rules.json:12`.

Provas numéricas em `output/analise-mse-2026-10-07/probes.json`. Não extrapolar estes riscos locais para afirmar que houve exploração ou vazamento no Firebase remoto.

## 4. O que o MSE realmente acrescenta ao OEE/NHPL

É aproveitável como **referência de arquitetura**: separar aquisição de dados da visualização, publicar uma amostra comum, congelar a leitura ao perder comunicação, rejeitar leituras antigas, calcular A/P/Q a partir das mesmas bases e representar estados/eventos. Sua fórmula de OEE é coerente quando as entradas são válidas.

Não é fonte de limites industriais: `telemetry-service.js:10` define montagem simulada com **ciclo ideal 11 s**, ciclo observado 12 s e **força 350–450 N**. `nhpl-config.js:21` usa meta demonstrativa 1.200 por turno/150 por hora. O catálogo operacional NHPL tem `parametros: {}`. Portanto, ele **também não possui os limites aprovados da NHPL**. Esses números não devem entrar no MSA como referências reais.

As estações Entrada/Montagem A/Montagem B/Verificação/Saída, transporte e posição no mapa são conceituais. Uma cena animada não identifica CLP, protocolo, tags, contador, frequência de aquisição ou autorização de TI. Reaproveitar ideias não significa copiar código/ativos sem conferir direitos e licença.

## 5. O que precisa existir para OEE completo

OEE deve ser entregue como módulo configurável, mesmo enquanto alguns dados reais aguardam validação. **Dado pendente não é justificativa para deixar o software inteiro ausente.** Pode haver cálculo manual com dados reais completos; automatização é uma etapa adicional.

Bases necessárias, no mesmo equipamento/produto/OP/lote/turno e janela:

1. **Tempo de produção planejado:** calendário e exclusões declaradas, com vigência. Os quatro horários ajudam, mas “ligada até desligada” não substitui automaticamente o período em que se pretendia produzir.
2. **Tempo de operação:** janela planejada menos a união das paradas que contam como perda de disponibilidade. Setup/troca não deve ser excluído automaticamente só porque foi planejado; pausas fora da intenção de produzir e perdas produtivas são categorias diferentes.
3. **Ciclo ideal validado por produto/variante**, unidade de contagem e peças por ciclo. Takt informado de 12 s/peça não confirma ciclo ideal de 12 s, nem autoriza usar os 11 s da demonstração concorrente.
4. **Total produzido e peças boas de primeira passagem**, com inspeção, refugo, retrabalho/suspeitas e correções sem dupla contagem. Quilogramas continuam separados de peças.
5. **Cobertura e encerramento:** paradas abertas, dados ausentes, resets e cortes de período não podem receber resultado final silenciosamente. Indicadores parciais e bases conhecidas devem ficar visíveis.

Fórmulas: disponibilidade = operação/planejado; desempenho = ciclo ideal por peça × total/operação; qualidade = boas de primeira passagem/total; OEE = A×P×Q. São razões; multiplicar por 100 para exibir porcentagem. A referência explica também a diferença entre perdas de disponibilidade e pequenas paradas/perda de velocidade. [Vorne/OEE](https://www.oee.com/calculating-oee/), [decisões sobre exclusões e setup](https://www.oee.com/faq/).

Não aplicar meta de 95% automaticamente ao OEE/MTBF/MTTR. Ela permanece a meta aprovada de produtividade. Resultados impossíveis, especialmente desempenho acima de 100%, devem diagnosticar a base, não ser escondidos por limitação visual a 100%.

Para limites NHPL, é necessário cadastro por parâmetro com nome/estação, unidade, natureza medida/setpoint, limites aplicáveis, produto/variante/receita, fonte, responsável, revisão e vigência. Buscar plano de controle e receita revisada da Qualidade/Engenharia, não uma faixa do simulador. A foto SIEMENS SIMATIC HMI não fornece esses valores. Manutenção/TI devem confirmar interfaces; o ciclo ideal e os limites pertencem à validação técnica.

## 6. Como superar o concorrente

Ordem recomendada, sem abandonar as decisões aprovadas:

1. **Fechar OEE manual completo + confiabilidade:** editor técnico versionado, A/P/Q/OEE com memória de cálculo, disponibilidade enquanto ciclo ideal está pendente, confirmação de boas, falha/reparo para MTBF/MTTR, políticas de cobertura. Testar zero confirmado, bases ausentes, produto misto, parada sobreposta/aberta e correções. Resultado final somente com base válida.
2. **Tela operacional NHPL única:** contexto atual persistente, plano/bruto/boas/refugo, iniciar/encerrar produção, iniciar/encerrar parada e selecionar motivo. Reduzir redigitação sem ocultar OP/lote/turno. Alertas devem levar diretamente à pendência e ao responsável.
3. **Importação automática autorizada:** primeiro definir formato disponível e gateway/diretório autorizado por TI; depois ingestão idempotente, contadores/resets, timestamps, lacunas e eventos. Para microparadas, registrar transições/eventos na origem; simples consulta do estado a cada 15 segundos pode perder eventos curtos. Não instalar sensor/ESP32 inexistente por suposição.
4. **Engenharia e Qualidade NHPL:** editor de referências, aprovação de desvios e agenda de coleta por turno. Aplicar política específica de **pelo menos 30 amostras**, conforme Fabiana, preservando estudos legados. O CEP atual ainda tem default 25; isso é uma lacuna real do MSA para o piloto, não deve ser escondida.
5. **Painel TV útil:** estado e frescor da leitura, última produção, plano × realizado, A/P/Q, principais perdas e pendências; depois diagrama/3D validado. Para uma máquina piloto, visibilidade e ação são mais valiosas que inventar 32 equipamentos.
6. **Pareto e correlação rastreáveis:** motivos padronizados, classificação de falha/setup, comparação por produto/turno, filtros por versão de parâmetro e cobertura; exportação com todas as bases. O MSA já calcula rankings básicos, mas não entrega toda essa experiência final.

Preservar correções imutáveis, referências históricas, papéis existentes e fonte do dado. Não trocar essa base por aparência. A vantagem desejável é: **coletar rápido, mostrar o estado com clareza e permitir que a Engenharia confie no resultado**. Esta comparação não autoriza alterações de produto nem publicação.

## 7. Verificações e evidências

| Verificação | Resultado observado |
|---|---|
| MSE, `npm test` com emulador local | 62 testes: **57 passaram, 5 falharam**, nenhum ignorado; teste de regras real executado |
| Cinco falhas de unidade MSE | Testes antigos de apresentação esperam cargo `gestor`/integração local que não corresponde mais à configuração atual; não provam cinco falhas operacionais equivalentes |
| MSE, `npm run build` na cópia | Falhou por ausência de `.openai/hosting.json`; metadado de hospedagem, não dependência do login estático |
| MSE, navegador planta | Avançou por vários fluxos e capturas; falhou em contagem esperada 5 versus catálogo atual 6 após inclusão NHPL |
| MSE, navegador NHPL | Validou abertura desktop/WebGL/câmera/estados/perda de comunicação/foco; parou esperando reabertura do diálogo no cenário móvel. Não foi declarado aprovado |
| Inspeção manual no navegador embutido | Mapa, NHPL móvel, OEE demonstrativo, painel, máquinas e formulário do operador consultados; valores industriais não confirmados |
| Probes de domínio MSE | Casos históricos/recorte/ausência/fórmula e defaults fictícios reproduzidos |
| MSA, `npm test` reexecutado | **133 passaram**, nenhum falhou |
| Regras/navegador MSA | Evidências da entrega anterior: 19 de emulador e cenários NHPL/CEP/período/data-tools; não reexecutados integralmente nesta comparação |
| Preservação MSE | **125 arquivos, zero diferenças SHA-256** |

Runtime: Windows, Node 24.19.0, JBR 25.0.3, Playwright instalado existente, Chrome para testes do MSE e Edge para inspeção de SDK. Não foi necessária instalação npm para executar estes diagnósticos.

Evidências: `output/analise-mse-2026-10-07/inspection.json`, `probes.json`, `mse-tests.log`, `msa-tests.log`, `original-before.json`, `original-after.json`, `visual/`, `plant-qa/` e `MSE-copia/docs/qa-nhpl/desktop.png`. Capturas são de simulações/fixtures, não da produção MSA.
