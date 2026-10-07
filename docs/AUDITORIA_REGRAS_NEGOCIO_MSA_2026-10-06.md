# MSA — auditoria funcional e proposta de CEP

Revisão de 06/10/2026, após os ajustes de tema e perfil solicitados. O enunciado transcrito, a consolidação dos materiais, a entrevista parcial, os contratos, o código, o banco remoto e os testes foram cruzados. A entrevista parcial continua provisória; não foi conferida com o áudio. Os documentos fornecem requisitos e evidências, não autorização para implantar todas as propostas neles contidas.

## Parecer

A base funcional do MVP é coerente: cadastro relacional, apontamentos digitais, histórico, estados de limites, decisões humanas e preservação de originais. Os vínculos do banco conferidos nesta revisão são válidos. Entretanto, **não é correto afirmar que tudo está logicamente pronto para uso industrial**. Há inconsistências reproduzíveis na consulta estatística, informação insuficiente sobre a origem dos dados no dashboard operacional e lacunas frente à necessidade de produção hora a hora e microparadas.

Nesta etapa foram executados somente os ajustes solicitados de interface e a remoção da T22. As correções de negócio e o módulo de CEP abaixo são recomendações, sem implementação.

## Ajustes concluídos

- Tema escuro: fundo `#121416`, superfícies cinza e lateral quase preta. Verde permanece nas ações, marca e estados apropriados.
- Produção bruta: mesma superfície dos outros indicadores; branca no tema claro, cinza no escuro.
- Logout removido da lateral. O ícone da conta abre um card abaixo dele, com nome, e-mail, papel, configurações e saída. Fecha ao clicar fora ou pressionar Escape. No simulador, “Sair da simulação” restaura a sessão anterior.
- T22 removida do Firebase real junto com seu único processo dependente, chamado **Teste**, código T22. Não havia produto, parâmetro, meta, coleta ou apontamento vinculado a eles. A exclusão dos dois registros ocorreu em uma atualização atômica, após backup e nova conferência dos vínculos. A comparação posterior confirmou que todos os outros dados permaneceram iguais.

Arquivos de produto alterados nesta etapa: `app/styles.css` e `app/src/ui/main.js`. Não houve publicação, alteração de regras Firebase, alteração de serviços/cálculos ou implantação de CEP.

## O cadastro de máquinas estava falhando?

Não foi encontrado um defeito de persistência. A T22 estava efetivamente gravada e tinha o processo Teste associado. O membro que a criou possui papel administrador; as regras publicadas são iguais às regras locais aprovadas nos testes.

No navegador, o formulário rejeitou nome formado apenas por espaços, permitiu corrigir e reenviar, salvou uma máquina com código e manteve exatamente um registro após recarregar a página. Esse ensaio utilizou repositório de teste local. No emulador, criação de cadastros, vínculos, permissões e leitura por outra sessão passaram com o SDK e as regras reais do projeto local.

O fluxo exigido é **máquina → processo da máquina → produto vinculado ao processo → parâmetros e versões → coleta**. Cadastrar apenas a máquina não habilita uma coleta; a T22 ainda não tinha produto. Isso explica uma possível percepção de falha, mas não permite afirmar exatamente o que ocorreu no teste do usuário. A seleção corrente também permanece no contexto anterior após criar uma nova máquina; ela não troca automaticamente para o cadastro recém-criado.

Melhoria recomendada: confirmação com o nome salvo e orientação explícita para cadastrar/vincular o processo e o produto. Não foi adicionada nesta auditoria.

## Cobertura do enunciado mínimo

| Requisito | Estado observado e limite |
|---|---|
| Máquinas, processos/produtos | Cadastros e vínculos ativos validados; somente administrador mantém cadastros gerais |
| Parâmetros e dados monitorados | Cadastro por processo, 41 referências e parâmetros customizados; natureza e unidade explícitas |
| Limites/metas | Versões imutáveis, rascunho/aprovado, metas por contexto e período; referência empresarial ainda precisa ser homologada |
| Registro digital | Coleta com autor, contexto, data e leitura válida/ausente/inválida |
| Produção e período | Quantidade inteira, intervalo válido e base bruta/boa explícita; não converte ciclos em peças |
| Paradas, duração e motivo | Abertura/fechamento único, motivo e união dos intervalos por máquina; não detecta microparadas automaticamente |
| Refugos/perdas e motivos | Motivo compatível e unidade preservada; peças, kg e retrabalho separados |
| Armazenamento estruturado | Firebase, identidade, origem, autoria e regras por workspace/papel |
| Associação dos registros | Máquina/processo/produto coerentes; nenhum vínculo ausente nos registros remotos conferidos |
| Histórico | Recorte, paginação e revisões sem sobrescrever originais |
| Dashboard/gráficos | Produção diária, paradas por motivo, parâmetros, metas e fila da Engenharia; painel horário ainda ausente |
| Desvios/situações críticas | Estados explícitos para desvio, rascunho, ausência, leitura inválida e ambiguidade; há avisos que não chegam à interface, descritos abaixo |
| Fluxo funcional demonstrável | Login, cadastros, coleta, apontamentos, Engenharia, consulta/exportação e simulador disponíveis |

### Regras que passaram nas verificações

- Login não concede acesso ao workspace sem vínculo autorizado; usuário não cria nem eleva sua própria associação.
- Novo apontamento exige referências ativas e coerentes. Autor e data de criação não podem ser forjados por uma escrita direta.
- Vazio não vira zero; zero e valores negativos válidos são preservados. Faixas invertidas, 0/0 e referências pendentes não são corrigidas ou aprovadas automaticamente.
- Produção bruta e boa são bases independentes. Kg não é subtraído de peças. Refugo percentual depende de denominador compatível e cobertura da consulta.
- Tempo parado usa união por máquina, sem duplicar tempo simultâneo; parada aberta não é duração final.
- Engenharia segue aguardando → em análise → aprovado/rejeitado, com justificativa e histórico. A decisão é um registro humano, não um comando de liberação física.
- Correção preserva o original, exige outra pessoa para aprovar e sinaliza alternativas aprovadas conflitantes.
- Importação confirmada possui deduplicação; sessões antigas são revogadas ao sair ou mudar de papel. Sincronização entre duas sessões e concorrência nas decisões/encerramentos foram testadas.

## Pendências encontradas, por prioridade

| Prioridade | Evidência | Consequência e próxima correção recomendada |
|---|---|---|
| Alta: origem dos dados na apresentação | O workspace `msa` contém 28 coletas, 56 produções, 94 perdas e 29 paradas com `origin: demo`, fonte `cenario-ficticio-c26`. O dashboard fora do simulador não apresenta o aviso permanente de simulação | Números fictícios podem parecer resultados da fábrica. Preservar/migrar esses registros de forma acordada e identificar sua origem antes da apresentação. Eles não foram apagados nesta revisão |
| Alta: detalhe mistura contexto estatístico | `parameterDetail()` escolhe o primeiro grupo pela versão, sem comparar lote/receita/ordem/turno; o gráfico filtra apenas parâmetro e versão | Reprodução: lotes A e B, mesma versão, última leitura de B; detalhe escolhe média 100,5 de A quando B tem 200,5. Histórico mostra quatro pontos dos dois lotes. Filtrar o contexto completo ou apresentar grupos identificados. Não ocorreu nos registros atuais, que não possuem esses contextos opcionais distintos |
| Alta: regra de aprovação desigual entre APIs | `getIndicators()` usa `buildIndicators()`, que calcula capacidade sem conferir `version.status`; `getDashboard()` bloqueia versões não aprovadas | Reprodução com rascunho: API genérica devolve Cp 40; dashboard devolve null. Aplicar a mesma política de aprovação na camada comum antes de usar a API em relatórios/integrações. O dashboard atual já bloqueia rascunhos |
| Média: aviso de sobreposição oculto | O domínio retorna `overlapping-reasons`, mas a tela mostra apenas aviso genérico quando `complete` é falso; sobreposição não torna a consulta incompleta | Dois episódios de 10 min, sobrepostos em 5 min: indicador soma 15 min e motivos somam 20 min. Ambos têm uma interpretação válida, mas a diferença precisa ser explicada visivelmente. Não atribuir o tempo compartilhado a uma causa exclusiva |
| Alta para CEP: natureza e método | Uma versão aprovada de setpoint também pode produzir Cp/Cpk. O cálculo usa sigma populacional das leituras, sem carta de controle, plano de subgrupos ou diagnóstico de estabilidade | O cálculo existente é exploratório. Não demonstra capacidade do produto nem substitui o CEP validado. Definir característica realmente medida, método e interpretação antes de ampliá-lo |
| Alta frente à entrevista parcial: hora a hora/microparadas | Gráfico agrupa por dia; metas usam datas; formulários de horário trabalham por minuto; não há captura automática/limiar de microparada | Atualização rápida do Firebase não equivale a coleta da máquina em tempo real. Confirmar piloto, cadência, intervalos e precisão; não anunciar cobertura dessas necessidades como entregue |

Outros pontos operacionais: existe apenas um membro autorizado no workspace consultado. Uma correção criada por ele exigirá um segundo membro com alçada de Engenharia/admin para aprovação; esse bloqueio é intencional. A interface não expõe toda a API existente, como importação CSV com prévia e criação de propostas de correção. Nomes/códigos de máquinas comuns não têm unicidade obrigatória; se a empresa exigir código único, será necessária uma regra explícita. README e documentos antigos conservam etapas anteriores e não devem servir sozinhos como roteiro do produto atual.

## CEP, Cp e Cpk: compensa implementar depois?

**Sim, como análise integrada à decisão da Engenharia, começando por um caso piloto bem definido.** O enunciado menciona expressamente CEP/Cp/Cpk. O valor para a banca está em demonstrar como um dado rastreável chega a uma decisão mais rápida e verificável. Pela entrevista parcial, produção hora a hora e microparadas também merecem prioridade; o módulo estatístico deve complementar essa necessidade operacional.

O sistema já possui leituras, versões, contexto, cálculo exploratório e decisão humana. Falta estabelecer o método estatístico e mostrar adequadamente seus pré-requisitos. Capacidade relaciona um processo estável às especificações; estabilidade, adequação da distribuição e tamanho da amostra precisam ser considerados. [NIST — capacidade de processo](https://www.itl.nist.gov/div898/handbook/pmc/section1/pmc16.htm).

### Proposta de primeira entrega futura, sem execução

1. Selecionar **uma característica crítica medida**, uma máquina/processo/produto/receita e limites aprovados pela Engenharia. Confirmar instrumento, resolução, unidade, frequência e significado dos valores. Não escolher temperatura de ajuste como prova de qualidade do selo.
2. Definir amostragem: leituras individuais podem usar I-MR quando apropriado; subgrupos racionais exigem método como X̄-R/X̄-S. Limites de controle são calculados do processo; limites de especificação vêm da Engenharia e têm função diferente. [NIST — cartas individuais](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc322.htm).
3. Calcular por contexto completo e versão. Informar n válido/ausente/inválido, período, média, estimador de dispersão e método. Cp/Cpk com dispersão dentro dos subgrupos e Pp/Ppk com dispersão global precisam ser distinguidos; simplesmente trocar o nome da fórmula atual não resolve a estimativa. [Minitab — capacidade dentro dos subgrupos](https://support.minitab.com/en-us/minitab/help-and-how-to/quality-and-process-improvement/capability-analysis/how-to/capability-sixpack/normal-capability-sixpack/interpret-the-results/all-statistics-and-graphs/within-capability/).
4. Mostrar carta, especificações, amostra e diagnóstico legível: amostra insuficiente, instabilidade, referência pendente ou análise disponível. Meta 1,33 e mínimo de amostras dependem da política aprovada; não adotar valor universal por aparência. Índice positivo não deve gerar aprovação automática. Para dispersão zero, manter indisponibilidade; não exibir infinito.
5. Registrar a decisão da Engenharia com justificativa e ação; coletar novamente e comparar períodos/contextos equivalentes. Exportar relatório com origem, referência, versão, método, período e responsável. Nenhum comando físico será inferido da decisão registrada.

Ficam para etapa posterior, se necessários ao piloto: múltiplos tipos de cartas, métodos não normais, índices unilaterais, intervalos de confiança, estudos de instrumento, regras adicionais de tendência e integrações com máquina. Não é necessário implementar toda essa biblioteca para demonstrar o primeiro caso com rigor.

### Como apresentar de forma vendível

Proposta de fala: **“O dado entra uma vez, chega à Engenharia com contexto e referência, e a decisão fica registrada com evidência.”** Demonstrar coleta → desvio/tendência → análise → ação humana → nova coleta → comparação. Explicar o efeito operacional em termos de tempo para registrar, consolidar e localizar desvios.

Para a empresa, mostrar rastreabilidade, consistência, menos transcrição e acompanhamento que permite intervenção. Para a banca, usar um caso compreensível e verificar os números em uma referência calculada independentemente. Se o caso for sintético, identificá-lo durante toda a demonstração. Não prometer economia, redução de refugo ou aumento de OEE como resultado obtido sem medição antes/depois.

Ordem recomendada: resolver as inconsistências e a origem dos dados; confirmar piloto e referências; escolher com a empresa a prioridade entre visão horária/microparadas e o primeiro CEP; então implementar e validar o caso escolhido. Esta é uma proposta de próximo passo, não uma mudança já realizada.

## Evidências e limites da verificação

- 84 testes unitários aprovados; 16 testes de regras/integração aprovados com Auth e RTDB emulados; zero falhas.
- Navegador: login/sessão/logout/menu (incluindo permanência aberto durante atualização dos dados), cadastro inválido e persistência após recarga, apontamentos, Engenharia, versões, metas e CSV. Esses fluxos usam autenticação/repositório de teste e não criam dados fictícios no Firebase real.
- 11 cenários do simulador aprovados, zero gravações no Firebase e zero erros de JavaScript.
- Verificação visual: sete telas, dois temas, desktop/celular; dashboard/login em 1366, 1440, 768 e 390 px. Card de perfil sob o ícone e dentro da tela; indicadores com superfície uniforme. Contrastes de texto testados acima de 4,5:1; sem erros de console ou overflow da página. Capturas claro/escuro e celular foram inspecionadas.
- Verificador estático: 46 arquivos, zero erros. O parâmetro `--deploy` apenas verifica o artefato; não houve deploy.
- Conferência SHA-256: os 38 arquivos protegidos na etapa anterior continuam iguais, incluindo serviços, domínio, regras, catálogo e materiais anteriores do usuário.
- Firebase real: leitura administrativa, conferência das regras publicadas, vínculos e remoção exclusiva dos dois cadastros T22/Teste. Após remoção: uma máquina, um processo, dois produtos, 41 parâmetros, 59 versões; nenhuma referência ausente ou regra de limite inválida nas conferências executadas. Isso não homologa os limites nem prova qualidade industrial.
- Não foi exercitado login/salvamento pelo SDK na sessão real do usuário, nem hardware, rede da fábrica ou amostragem industrial. A evidência de cadastro remoto é o registro T22 existente; a validação adicional de escrita/permissões ocorreu no emulador com as mesmas regras publicadas.

Backups privados e reproduções ficam em `output/auditoria-2026-10-06/`, fora do artefato público: `msa-pre-remocao.json`, `msa-depois.json`, `regras-publicadas.json`, `verificacao-logica.json` e `coerencia-banco.json`. Capturas e relatório visual ficam em `visual/`. Não publicar esses backups com o site.
