# Entrega — CEP e pendências MSA

Atualização de 06/10/2026. O pedido autorizou concluir as pendências da auditoria, implementar CEP com apoio da planilha e colocar a logo dentro da lateral, preta nos dois temas. A auditoria anterior permanece como registro do estado antes desta implementação.

## O que mudou

| Ponto da auditoria/pedido | Comportamento entregue |
|---|---|
| Capacidade na API comum sem exigir referência aprovada | Cp/Cpk agora usam o mesmo cálculo CEP do sistema, com referência aprovada e natureza de medição; setpoints, pendências e condições insuficientes deixam índices indisponíveis |
| Detalhe misturava grupos da mesma versão | Gráfico e estatísticas do detalhe correspondem ao contexto completo da última leitura, incluindo lote, ordem, receita e turno |
| Dados fictícios no workspace operacional | Consulta padrão Operacional exclui `origin: demo`; Apresentação permite consultar esses registros com identificação permanente e sem ações de gravação. Registros e vínculos não foram apagados nem migrados |
| Motivos de paradas sobrepostos | Aviso no dashboard explica que o ranking por motivo pode ter sobreposição; duração total utiliza união dos intervalos |
| Hora a hora/microparadas | Nova aba Hora a hora em Apontamentos, com data, meta para a consulta, bruta/boa, estado da hora e microparadas manuais em segundos |
| Importação/correção só nas APIs | Histórico → Coletas → Importar CSV, com prévia e confirmação; Detalhes → Propor correção, com original preservado e decisão por outra pessoa; aprovador consulta original e proposta |
| Percepção de falha ao cadastrar máquina | Confirmação com o nome salvo e orientação máquina → processo → produto; testes verificam validação, reenvio e persistência após recarga |
| Lateral e logo | Lateral de 64 px preta nos dois temas, distinta do fundo; logo original dentro da lateral, acessível também no menu móvel |

O filtro expansível de lote/ordem/receita/turno serve para registrar e consultar o contexto exato. Vazio significa consulta a todos os grupos; o CEP mantém estudos separados por contexto e versão. Ao trocar máquina/processo/produto, os filtros adicionais são limpos.

## Fonte empresarial preservada

Arquivo original: `C:/Users/Kauan/Desktop/Grupo Amarelo - MSA Brasil/MSA - Material Fornecido/T20A03(EN)5 - Capability study senai.xlsx`.

SHA-256 antes/depois: `6a030b82f7dc32c6bd05a43a426344c72683fad61495aab70dbc13406ea11c8e`. A leitura foi feita com openpyxl em modo somente leitura. O XLSX não foi editado e suas observações não foram enviadas ao Firebase.

Foram extraídas 41 características e 17 observações por característica, preservando célula, valor original, data original, limites, fórmulas e resultados salvos. Há 121 valores numéricos armazenados como texto e 14 vazios. Datas em texto nas linhas 25/26 foram normalizadas de `31/08/2026` para ISO, mantendo o original. A planilha não informa horário/subgrupo nem contexto suficiente para atribuir lotes, materiais ou ordem produtiva.

Para **Tempo destacar (BF)**, incluindo números em texto, a média é **0,8588235294 s** e o desvio populacional global é **0,0492152957 s**. Algumas fórmulas originais consideravam apenas células numéricas, omitindo números em texto. O sistema exibe a comparação com as fórmulas/resultados salvos; esse desvio populacional serve para conferir STDEVP e não é o estimador dentro do processo.

Referências que exigem esclarecimento continuam explícitas: faixa do contramolde 80/75 invertida; zonas com limites 0/0; pressão/vácuo com apenas um limite e interpretação a confirmar; temperaturas cuja natureza de ajuste ou medição precisa ser definida pela Engenharia. O sistema não transforma essas referências em aprovação industrial.

## Método CEP disponível

**CEP e capacidade** na lateral permite escolher registros do sistema ou a planilha histórica. Cada estudo do sistema agrupa uma característica, versão e contexto completo; apresenta contagens válidas/ausentes/inválidas, média, σ dentro, σ global, cartas I e MR, especificações, sinais, tabela e relatório CSV. Leituras sem valor interrompem a amplitude móvel, sem ligar pontos através da lacuna.

Método inicial: **I-MR, fase I**, observações individuais e amplitude móvel entre pares consecutivos. `σ dentro = MR médio / 1,128`; limites I `média ± 3σ dentro`; limite superior MR `3,267 × MR médio`. Limites de controle são estimados no período selecionado, enquanto especificações vêm da versão da Engenharia. A comparação numérica reproduz o exemplo de dez observações do [NIST](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc322.htm).

Cp/Cpk utilizam σ dentro; Pp/Ppk utilizam o desvio global **amostral**. As regras testadas são ponto fora de 3σ na carta I, MR acima do limite e oito observações consecutivas do mesmo lado da média. Havendo esses sinais, o sistema pede investigação e mantém capacidade indisponível. Ausência de sinal nessas regras não prova estabilidade.

Capacidade também fica indisponível para referência não aprovada, natureza de setpoint/desconhecida, faixa inválida ou unilateral, ordem não confirmada, amostra abaixo do mínimo do estudo, pares insuficientes e dispersão zero. Ordem temporal estritamente crescente é reconhecida para coletas com instante; séries somente com data exigem confirmação da sequência. O mínimo padrão de 25 é configurável para estudo exploratório, não é uma política homologada nem uma garantia de precisão. A planilha tem 17 observações e sua referência começa não aprovada.

Índices são estimados sob hipótese de distribuição normal. Normalidade, independência/adequação amostral e instrumento não foram homologados. Capacidade pressupõe processo estável e especificações adequadas; estudos industriais exigem avaliação desses requisitos pela empresa. [NIST — capacidade de processo](https://www.itl.nist.gov/div898/handbook/pmc/section1/pmc16.htm).

O CSV inclui fonte/hash, responsável, período da consulta, contexto, versão/natureza/status, método, mínimo, contagens, dispersões, índices, motivo de indisponibilidade e observações originais com origem/célula. Estudos do sistema podem ser encaminhados à Engenharia, com justificativa e decisão humana registradas. Não há liberação automática da máquina, baseline congelada de fase II, cartas por subgrupos, método não normal, intervalos de confiança ou integração física nesta entrega.

Conflitos entre correções aprovadas bloqueiam somente o estudo afetado e retiram sua observação das estimativas, com diagnóstico explícito. Cobertura incompleta de coletas também bloqueia capacidade; incompletude de produção não relacionada não bloqueia indiscriminadamente um grupo de medições íntegro. Referências com unidade diferente da fonte histórica são recusadas, sem conversão presumida ou mudança do rótulo da medição. O relatório histórico usa o período real 25/08–29/09/2026, separando a janela da consulta; valores efetivos corrigidos conservam o ID da correção e o valor original.

## Hora a hora e registros

Apontamentos inteiramente dentro de uma hora são somados nessa hora. Totais de intervalos que cruzam horas/dias permanecem preservados e não alocados; o sistema não inventa um rateio uniforme. Ausência permanece “Sem dados”, quantidade zero informada permanece zero e a hora em andamento não recebe déficit fechado. Meta/h informada é referência para a consulta.

Microparadas são eventos não planejados, encerrados, positivos e até o limiar informado (60 s inicialmente). O tempo acumulado une sobreposições por máquina; paradas abertas ficam separadas. Formulários e exibição conservam segundos. Ausência de apontamento não comprova ausência de parada; duração parada não explica sozinha déficit de produção. Captura atual é manual/digital ou importada, sem comunicação com CLP/sensor.

Revisões conflitantes também deixam a quantidade da hora afetada indisponível e retiram eventos conflitantes do tempo de microparada, com aviso de consulta incompleta.

CSV aceita `date;parameter;raw;unit`, data ISO e parâmetro por ID/nome/código do processo escolhido. Nomes/códigos ambíguos exigem ID único. A prévia mostra fonte, contexto, versão, valores, erros e avisos sem gravar. A confirmação usa identificação estável para reimportar a mesma fonte sem duplicar; conteúdo diferente para a mesma fonte/linha/contexto gera conflito. Em interrupção de importação, reexecutar a mesma fonte reconcilia linhas já gravadas. Ausentes/invalidade não viram números.

Propostas de correção conservam contexto, origem, versão, unidade e auditoria. O original continua armazenado; somente propostas aprovadas entram na visão efetiva. Autoaprovação permanece bloqueada. O workspace consultado na auditoria tinha somente um administrador: decidir sua própria proposta continua exigindo uma segunda pessoa autorizada, conforme a regra de negócio.

## Demonstração para empresa e banca

1. Mostrar a conferência de **Tempo destacar** da planilha: valores originais e em texto, resultado recalculado e referência pendente. Explicar a consistência e rastreabilidade conquistadas.
2. Abrir **Simular cenário → CEP · estudo estável com 60 medições**. Mostrar a diferença entre controle, especificação, Cp/Cpk e Pp/Ppk, preservando a identificação de dados fictícios.
3. Abrir **CEP · sinal de instabilidade**. Mostrar o sinal na carta e a capacidade indisponível, encaminhar à Engenharia e registrar a análise/justificativa.
4. Demonstrar prévia CSV, correção que preserva o original e acompanhamento por hora com ausência explícita e parada em segundos.
5. Encerrar com a proposta de piloto: uma característica crítica medida, referência e método aprovados, instrumento/frequência/contexto definidos e resultados antes/depois medidos pela empresa.

Mensagem central: **“O dado entra com contexto, chega à Engenharia com evidência e a decisão fica rastreável.”** A demonstração evidencia registro, consolidação e localização de desvios; não afirma redução de refugo, ganho de produtividade ou economia financeira sem medir esses resultados.

## Verificação

Evidência corrente fica em `output/cep-2026-10-06/`, fora do artefato publicado. Testes unitários e emuladores verificam fórmulas, contexto, origem, integridade, permissões e correções; navegador verifica cadastro, CSV idempotente, correção de ausência, autoaprovação, paradas de 30 segundos, bases separadas, CEP, relatório histórico e bloqueio de unidade incompatível, além de 13 cenários. Revisão visual verifica desktop/celular, os dois temas, contraste e ausência de erros de console.

A revisão independente encontrou quatro pontos de rastreabilidade (conflito, unidade, período e identificação da correção). Todos tiveram regressões que falharam antes e passaram após a correção. A conferência adicional aplicou a mesma proteção de conflito à visão horária. Nenhum achado crítico, nenhum menor adiado e nenhuma decisão de escopo deixada sem julgamento pelo revisor. Parecer e registros: `output/cep-2026-10-06/review-package.md` e `docs/VERIFICACAO_CEP_MSA_2026-10-06.md`.

Resultado final: **100 testes unitários e 16 testes com emuladores aprovados**, além dos fluxos de navegador, 13 cenários de simulação, verificação visual e estática de 53 arquivos. Zero falhas nas suites finais.

Não houve commit, push ou deploy nesta etapa, alteração de regras remotas, gravação de estudo histórico no Firebase ou modificação do XLSX. O teste de login/gravação com a sessão real do usuário não foi executado; fluxos de escrita foram verificados com repositório de teste e Auth/RTDB emulados. A remoção exclusiva da T22 e do processo Teste já foi concluída e documentada na auditoria anterior.
