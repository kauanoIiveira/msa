# Auditoria tecnica e preparacao da entrevista | MSA / SENAI

**Data da analise:** 05/10/2026. **Entrevista:** 06/10/2026. **Natureza:** levantamento de requisitos, nao apresentacao final de prototipo.

## 1. Conclusao executiva

O diferencial mais defensavel para a entrevista e demonstrar que a equipe entendeu o trabalho real: transformar registros em decisoes confiaveis, com contexto e rastreabilidade. Uma tela bonita nao resolve, sozinha, uma medicao ignorada por estar como texto, um limite ambiguo ou uma parada contada duas vezes.

Na copia recebida, existem 41 parametros e 17 linhas de coleta, de 25/08 a 29/09/2026. Dos 697 campos possiveis, 683 estao preenchidos: 562 numeros nativos e 121 textos numericos. Os outros 14 campos estao vazios. A maior parte dos resumos concorda com a aritmetica das formulas, mas isso nao garante que todos os registros pretendidos entraram no calculo nem que o indicador tem interpretacao estatistica valida.

**Para amanha:** mostrar um exemplo verificavel, ouvir como a empresa trabalha, validar as regras e sair com um piloto e criterios de aceite. Nao anunciar que o processo da MSA e incapaz ou que a planilha utilizada na fabrica esta errada. O arquivo pode ser uma copia didatica, anonimizada ou incompleta; essa e a primeira confirmacao a pedir.

## 2. Escopo e limites da verificacao

Foram lidos os textos fornecidos, as duas imagens do desafio, os dois PDFs anteriores, todas as nove fotografias em `C:/Users/Kauan/Desktop/MSA` e as duas abas do XLSX. A auditoria preservou os arquivos de origem e produziu evidencias separadas.

- Inventario de todas as celulas preenchidas, tipos, formulas, valores calculados salvos, formatos e comentarios.
- Inventario de 9.915 formulas existentes, com inspecao das regras de calculo e da estrutura. **Nao** houve execucao de todas as formulas em um motor Excel.
- Recalculo independente de 224 resumos numericos finitos comparaveis; os 224 coincidiram com os valores salvos, com tolerancia absoluta/relativa de 1e-9. Casos indefinidos nao foram forçados a um numero.
- Leitura individual dos 697 campos de parametros das 17 coletas, com rastreabilidade de endereco, data, valor original e tipo.
- Conversao analitica estrita de textos decimais para uma segunda visao; o XLSX original nao foi convertido nem corrigido.
- Os resultados chamados de Cp/Cpk na planilha foram reproduzidos **aritmeticamente**, nao certificados como estudo de capacidade. Nao foram demonstradas estabilidade, independencia, normalidade ou adequacao do sistema de medicao.
- Fotografias mostram instantes de possiveis maquinas, produtos e fases diferentes. Nao autorizam inferir duracao de parada, produtividade diaria, causa raiz ou liberacao de produto.

Arquivos auxiliares completos: `analise/evidencias/auditoria_calculos.json`, `celulas_Selo.json`, `celulas_Normality_test.json`, `estrutura_planilha.json` e `fontes_sha256.json`. O ultimo registra os hashes das fontes para comprovar preservacao.

## 3. Anatomia da planilha

Arquivo: `T20A03(EN)5 - Capability study senai.xlsx`. Os nomes das abas tem um espaco final: `Selo ` e `Normality test `.

| Elemento | Localizacao / achado |
| --- | --- |
| Parametro, minimo, maximo, unidade | Linhas 9, 10, 11 e 12 da aba Selo |
| Janela prevista nas formulas | Linhas 17:67, ate 51 registros por parametro |
| Linhas realmente preenchidas | 17:33, total de 17 coletas |
| Resumos | 69 minimo; 70 maximo; 71 media; 72 STDEVP; 73 Cp; 74 Cpk; 75 status |
| Meta salva | U6 = 1,33 |
| Identificadores de parametros | 41 colunas, numeracao 1 a 42 sem o numero 23; perguntar se houve exclusao intencional |
| Metadados das coletas | Material, espessura, % Scrap e lote, nas colunas B:E, vazios em todas as 17 linhas |
| Rastreabilidade ausente na linha | Horario, operador, maquina, receita/versao e ID unico da coleta |
| Validacao de entrada | Uma lista em U6 e G93 com referencia #REF!; sem validacao numerica da matriz de medicoes |
| Estrutura | Sem tabelas Excel, sem graficos nativos, sem abas/linhas/colunas ocultas identificadas; barras construidas por formulas REPT |
| Erros salvos | 9 DIV/0 em Selo; 2 DIV/0 e 2.000 VALUE na aba de normalidade |

As formulas de resumo usam a primeira celula como condicao: se a linha 17 estiver vazia, o resultado fica vazio, mesmo que outras linhas tenham numeros. E o que acontece com pressao e vacuo. Isso nao e equivalente a testar se existem observacoes validas na janela.

Na linha 75, os 41 status salvos se distribuem em 36 NOK, 3 DIV/0 e 2 vazios. Sao saidas do modelo de calculo desta copia, **nao** contagem de maquinas defeituosas, pecas rejeitadas ou lotes reprovados.

### Cronologia das 17 coletas

{{COLETAS}}

Ha duas coletas por dia em parte de agosto, uma por dia nas datas de setembro e um intervalo entre 31/08 e 17/09. Sem horarios e contexto, nao se pode definir subgrupos racionais nem presumir uma serie continua com frequencia constante.

## 4. Achados prioritarios, com evidencia e pergunta

### A. Textos numericos excluidos silenciosamente dos resumos

121 dos 683 valores preenchidos, ou 17,7%, sao textos decimais. Todas as 41 medicoes da linha 25 e todas as 41 da linha 26 sao texto: duas coletas de 31/08 que nao entram nas medias e dispersoes de referencia. Os outros 39 textos se distribuem em linhas anteriores.

No Excel, STDEVP ignora textos contidos em referencias; as formulas de media, minimo e maximo dessa copia tambem nao tratam esses textos como observacoes numericas. A solucao nao e apenas mudar a funcao de desvio: a entrada precisa tratar virgula/ponto, unidade, validade e procedencia antes do calculo. [Microsoft STDEVP](https://support.microsoft.com/en-au/excel/functions/stdevp-function).

**Exemplo BF, Tempo destacar, faixa cadastrada 0,8 a 0,9 s:**

| Grandeza | Salvo / somente numeros nativos | Textos decimais interpretados + numeros |
| --- | --- | --- |
| Observacoes utilizadas | 7 numeros, todos 0,9 | 17: sete 0,8 e dez 0,9 |
| Media | 0,9 s | 0,8588235294 s |
| Desvio populacional | Residuo de aproximadamente 1,11e-16 | 0,0492152957 s |
| Cp aritmetico | Aproximadamente 1,50 x 10^14 | 0,3386481060 |
| Cpk aritmetico | Aproximadamente -0,3333333333 | 0,2788866755 |

O subconjunto nativo e matematicamente constante. O numero gigantesco e um efeito de divisao por residuo de ponto flutuante, nao evidencia de qualidade extraordinaria. Todos os 17 valores interpretados ficam dentro da faixa inclusiva do arquivo; isso tambem nao comprova capacidade futura. Os tempos podem ser ajustes programados e discretizados, e nao uma caracteristica de qualidade com distribuicao apropriada.

**Pergunta:** "Esses tempos sao setpoints ou valores efetivamente medidos? Como voces confirmam que todas as coletas entraram na analise? A copia recebida conserva o mesmo metodo usado pela Engenharia?"

Outro exemplo: BJ, Tempo prensa corte, passa de media 10,6 para 10,6470588235 s e de Cpk aritmetico 0,4082482905 para 0,4513354669 quando duas entradas de texto passam a ser interpretadas. Nao confundir mudanca aritmetica com liberacao estatistica.

### B. Limites sem significado inequívoco

- BH10:BH11: Tempo Contra molde, minimo 80 e maximo 75 s. Gera faixa invertida, Cp negativo e soma de frequencias do histograma igual a -5. Nao inverter automaticamente: confirmar se os valores foram trocados, se sao de receitas distintas ou se significam outra coisa.
- H, X, Z e AP: Z1, Z9, Z10 e Z18 com limites 0/0 e medicoes positivas. Podem ser zonas desativadas, limites nao cadastrados ou condicao especial; nenhuma dessas hipoteses esta comprovada.
- CF, pressao: limite 6,5 bar e o outro vazio. CH, vacuo: -600 mm/Hg e o outro vazio. Confirmar especificacao unilateral, direcao aceita e referencia da pressao. No vacuo, "minimo -600" e semanticamente ambiguo sem saber se a regra descreve magnitude ou valor assinado.
- U6 salva 1,33, mas e necessario confirmar a politica: a meta vale para quais caracteristicas, receitas, etapas e tipo de indice?

**Pergunta:** "Quem aprova limites e unidades? Eles mudam por produto ou receita? Quando ha somente um limite, qual desigualdade exata deve ser atendida?"

### C. Dispersao nula e pequena resolucao

AZ, velocidade, e constante em 19%; BP, Retardo de Mesa, em 0,1 s; CD, retardo esteira, em 0,5 s, quando todos os textos sao interpretados. Em BZ, os nove numeros nativos sao 10 s, mas ha oito textos com informacao adicional; portanto o DIV/0 desse subconjunto nao descreve os 17 registros.

Nao devolver infinito, zero ou selo verde para dispersao nula. Exibir a condicao e o motivo da indisponibilidade do indice. Confirmar resolucao da IHM/instrumento, natureza de setpoint, arredondamento e quantidade de valores distintos. BP salva um Cp perto de 1,08 x 10^16 por residuo numerico, com Cpk negativo.

### D. Pressao e vacuo existem, apesar de resumo vazio

CF17 e CH17 vazios suprimem as linhas de resumo. Existem 10 registros posteriores em cada coluna, de 28/08 a 29/09:

- Pressao interpretada: nove valores 6,6 e um 6,8 bar; media 6,62, desvio populacional 0,06.
- Vacuo interpretado: -600, -300, -340, -540, -560, -540, -540, -550, -570 e -550 mm/Hg; media -509, desvio populacional aproximadamente 96,4832.

Nao concluir conformidade de vacuo antes de esclarecer a desigualdade. Nao criar limite superior artificial para conseguir calcular Cp.

### E. Mudanca de condicao misturada no mesmo historico

BD, Tempo de Resfriamento: dez coletas de agosto em 35 s, 17/09 em 20 s e seis seguintes em 15 s. BT, Retardo resfriamento: dez em 4 s, 17/09 em 7 s e seis seguintes em 30 s. As faixas cadastradas permanecem 35:36 s e 4:5 s.

Isso e evidencia de mudanca nos registros, nao prova de causa especial, erro ou receita nova. Falta a chave que explique a condicao. Em 21/09, AF28, Z13, registra 94 graus C; AH28, Z14, registra 101 graus C, muito abaixo dos demais registros dessas colunas. Preservar e contextualizar: aquecimento, troca de receita, leitura real, transcricao ou outro evento?

**Pergunta:** "O que mudou entre agosto e setembro? Durante aquecimento e setup esses dados sao registrados, mas excluidos de qual estudo? Como uma nova receita inicia uma nova versao do historico?"

### F. Normalidade nao demonstrada nesta copia

- B10:B1009 completamente vazio; AE6 = 0.
- K5 e numero literal 6,812509397175538, nao formula derivada das observacoes atuais.
- AC10:AC1009 contem 1.000 celulas com constantes numericas entre 0 e 1, nao formulas atualizaveis da CDF reversa. Por exemplo, AC10 = 0,9999930591 e AC1009 = 0,0418638758. Sao 1.000 celulas, nao o valor 1000.
- H5 e H7 dependem de n e exibem DIV/0; a comparacao em H7 usa 0,752.
- G93 em Selo e texto literal "OK"; nao e resultado calculado do teste e nao ha formula de Selo referenciando a aba Normality test.
- AE6 conta nao vazios (`1000-COUNTBLANK`), o que inclui possiveis textos futuros que outras funcoes podem ignorar.
- Nao foi encontrada formula SORT, SMALL ou LARGE para ordenar entradas. Pode existir uma etapa manual; perguntar como a ordem e preparada.

Essa copia nao permite aceitar o "OK" como comprovacao automatica de normalidade. O teste Anderson-Darling depende de dados ordenados e de termos da distribuicao ajustada, inclusive em ordem reversa; verificar a implementacao completa com um conjunto de referencia aprovado. [NIST Anderson-Darling](https://www.itl.nist.gov/div898/handbook/eda/section3/eda35e.htm).

**Pergunta:** "O teste e realizado nesta aba, em outro arquivo ou em outro software? Podem fornecer um exemplo completo com dados, resultado e decisao da Engenharia?"

### G. Histograma pode ocultar parte da amostra

As frequencias salvas nas linhas 98:109 usam classes baseadas na faixa de especificacao, com extensao limitada das caudas. Em Z13, a soma dessas frequencias e 10, embora existam 15 numeros nativos. O grafico nao cobre todos os valores numericos da amostra. Em faixas 0/0 ha classes degeneradas; em BH, a faixa invertida causa contagem negativa por diferenca de contagens cumulativas.

Mostrar no futuro n valido, n representado e contagens fora das classes, ou usar classes que cubram todos os valores. Histograma nao substitui uma serie temporal. A estrutura REPT e uma visualizacao de texto, nao um grafico Excel nativo.

## 5. Metodo estatistico: nao automatizar uma ambiguidade

A planilha usa `STDEVP`, com denominador n, e calcula `Cp=(LS-LI)/(6*sigma)` e `Cpk=min(LS-media,media-LI)/(3*sigma)`. Isso explica os numeros salvos, mas nao define o protocolo cientifico completo.

Uma conclusao de capacidade exige processo sob condicoes adequadas e pressupostos avaliados. Medicoes de aquecimento, produtos distintos ou receitas diferentes nao devem ser agrupadas sem justificativa. O NIST descreve indices bilaterais e unilaterais e seus pressupostos; nao usar um unico numero minimo de observacoes como regra universal de liberacao. [NIST capacidade](https://www.itl.nist.gov/div898/handbook/pmc/section1/pmc16.htm).

O desvio global de todos os registros e a estimativa dentro de subgrupos nao sao intercambiaveis. A terminologia Cp/Cpk versus Pp/Ppk precisa seguir o metodo aprovado pela Engenharia; nao trocar silenciosamente a funcao para STDEV e anunciar que o estudo foi corrigido. [Minitab, variacao dentro e global](https://blog.minitab.com/en/blog/process-capability-statistics-cpk-vs-ppk).

Perguntas necessarias: qual caracteristica e de qualidade e qual e parametro de ajuste; quais subgrupos e frequencias; qual estimador de sigma; como avaliar estabilidade; o que fazer com nao normalidade; quais criterios de suficiência de dados; como tratar instrumentos e arredondamento; quem autoriza exclusoes; quais limites de especificacao e quais limites estatisticos de controle. Estes dois ultimos nao sao a mesma coisa.

**Estados distintos no produto futuro:** dado ausente; dado invalido; limite nao aprovado; zona nao aplicavel; estudo insuficiente/nao avaliavel; desvio de parametro; analise pendente; decisao de liberacao. Um "NOK" de uma conta nao e automaticamente refugo, produto defeituoso ou lote rejeitado.

## 6. Leitura individual das nove fotografias

### Foto 1 | 12.12.45 | Vacuum Center / KVIEW

Menus de forno, manual, receita, seletoras, tempos, ciclo e retardos. Contador mostra 18 ciclos no instante da foto. Paineis e manometros demonstram a mistura de dados digitais e analogicos. Nao sabemos quantas pecas saem por ciclo, quando ha reset nem se aquele contador indica turno/lote.

Perguntar: identidade da maquina, receita, cavidades, unidade do contador, janela temporal, mecanismos de reset e quais campos sao leitura real versus ajuste. Presenca de IHM nao comprova API, protocolo ou acesso autorizado.

### Foto 2 | 12.13.44 | Pitch Board de 01/10/2026, primeiro turno

As quantidades realizadas legiveis sao 72, 216, 180, 144, 180, 72, 108 e 180. Soma independente: **1.152 pecas**; acumulados 72, 288, 468, 612, 792, 864, 972 e 1.152. Planejado contem escrita parcialmente ambigua; nao calcular atingimento de meta a partir de leitura incerta.

Operadores: anotacoes de 6 real e 5 ideal. Sucata em branco, nao zero. Comentarios incluem problemas de estacoes, colocacao manual de componente, troca de produto/setup iniciada as 10:00 com retorno anotado 10:40, almoco 11:30 e parada 12:40 sem encerramento legivel. Os 40 minutos sao diferenca entre anotacoes do episodio de setup, nao duracao total de todas as paradas do turno.

O produto manuscrito parece 10190357; confirmar. Nao equiparar automaticamente ao 10190358 visto na foto 6.

Perguntar: produzido bruto ou bom, meta por faixa horaria, perdas de setup, pausas previstas, paradas pequenas, cadastro de motivos, sobreposicoes, apontamento por estacao ou por linha e responsabilidade pela correcao do quadro.

### Foto 3 | 12.14.06 | IHM Siemens, modo manual E030

Seis alarmes pendentes visiveis: 279 Geral (emergencia estacao 20), 53 E040 (avanco C1 elevador), 40 E030 (recuo C2 Stop), 332 E030 (porta 30), 333 E040 (porta 40), 356 Geral (pressao de ar fora). Horarios aparecem em formato AM/PM; data e sincronizacao nao estao demonstradas. Texto exato deve ser confirmado pela lista oficial de alarmes.

Varias ocorrencias proximas podem pertencer a um unico episodio. Alarme, reconhecimento e parada nao sao sinonimos. A foto nao mostra fim, retorno da linha ou causa raiz. Nao somar tempos inferidos de alarmes.

Perguntar: qual sinal confirma linha parada, inicio/fim, motivo primario, alarmes associados, diferenca entre recorrencia e duplicidade e quem classifica causa apos manutencao.

### Foto 4 | 12.15.26 | Estacoes 040, 050, 060 e 070

Mostra estrutura fisica de postos e elementos amarelos junto a protecoes. A funcao e o modelo dos dispositivos nao podem ser certificados pela foto. E suficiente para levantar a hierarquia linha > estacao e as dependencias do estado da linha.

Perguntar: quais postos bloqueiam a linha inteira, quais permitem operacao parcial e quais sinais podem ser lidos sem intervir na seguranca. Nao propor alterar circuitos ou comandos da maquina.

### Foto 5 | 12.16.05 | Painel eletrico

Equipamentos Siemens, modulos/identificacoes como KSEG3 a KSEG7, bornes, fusíveis e cabeamento. Cores e conectores nao comprovam protocolo, versao de CLP, acesso de rede ou viabilidade imediata de integracao.

Pedir a manutencao/TI modelos exatos, lista autorizada de tags, interfaces/exportacoes existentes, arquitetura de rede e condicoes para acesso somente leitura. Integracao de producao nao deve interferir com controle ou seguranca funcional.

### Foto 6 | 12.17.22 | IHM da linha

PN 10190358, descricao ABAFALTO, tipo 14; postos 10 a 140, total de 14. Estacoes 20, 30 e 40 aparecem vermelhas por emergencia; as outras verdes. A tela tambem exibe Linha Geral/Posto Pronto em verde. Essa combinacao requer legenda oficial: verde global nao pode ser tratado como producao em curso por suposicao.

Contadores de aprovadas e reprovadas exibem zero naquele instante. Nao concluir que nao houve producao ou refugo no dia e nao equiparar "aprovadas" da IHM a liberacao da Engenharia.

Perguntar: estados reais, reset, periodo dos contadores, nomenclatura do produto, eventos de ordem e significado de cada aprovacao.

### Foto 7 | 12.20.02 | Formularios Selo VGHP / MARK V

Datas 28/09 e 29/09/2026 e indicacao de primeiro turno. Em 28/09, perda de 0,200 kg; existem campos de defeitos/quantidades sem preenchimento e anotacao que parece "S/espuma" em outro formulario. Leitura manuscrita ambigua deve permanecer pendente.

Nao converter kg para pecas sem massa/criterio aprovado; nao calcular percentual de refugo com denominador ausente. Separar perda de material, peca rejeitada, retrabalho e quantidade boa, evitando descontar duas vezes o mesmo item.

Perguntar: tipos de perda, unidade, processo/produto associado, origem da anotacao, destino do retrabalho e reconciliacao com quantidade produzida.

### Foto 8 | 12.20.38 | Aquecimento de 21 zonas

IHM KVIEW mostra aquecimento ligado e colunas verdes/amarelas. No detalhe, varios numeros verdes estao aproximadamente em 30 a 48 graus C; varios amarelos em 250 a 310, com zeros em algumas zonas. A interpretacao de verde como valor atual e amarelo como setpoint e **hipotese** ate confirmacao da legenda.

Isso pode ser fase de aquecimento, mas nao prova desvio de producao. Campos de receita visiveis nao devem ser comparados com o XLSX sem a mesma chave de maquina, produto, receita e instante.

Perguntar: legenda das cores, fase, condicao para inicio de producao, tempo de estabilizacao e regras das zonas desativadas.

### Foto 9 | 12.24.58 | Pressao e vacuo analogicos

Pressao: escala preta aproximadamente 0:14, vermelha 0:200; ponteiro perto de 6,5:6,6 na preta. A unidade preta parece kgf/cm2, mas esta parcialmente encoberta. Vacuo: escala preta 0:-760 mmHg, vermelha em inHg; ponteiro perto de -350:-360 mmHg. Sao estimativas visuais, nao medicoes substitutas de leitura/calibracao.

Se a unidade for kgf/cm2, 1 kgf/cm2 = 0,980665 bar. Assim, 6,6 kgf/cm2 equivale a 6,472389 bar, exemplo condicional que mostra por que o software precisa guardar unidade e converter explicitamente. Isso **nao** comprova descumprimento do limite 6,5 bar desta planilha; fotos e coletas podem ser de momentos/receitas distintos. [NIST conversoes](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8).

Perguntar: unidade, referencia (manometrica/absoluta), sentido do vacuo, resolucao, instrumento, certificado/calibracao, erro permitido e modo de registrar a leitura analogica. Classe/inscricao no mostrador nao substitui essas informacoes.

## 7. O que os PDFs anteriores resolvem e o que mudou

`Dossie_MSA_SENAI_2026.pdf` (17 paginas) e `Analise_Materiais_MSA_2026.pdf` (22 paginas) foram lidos integralmente. Servem de historico e apoio, nao de nova exigencia da empresa. A proposta de faseamento, perguntas e piloto deve ser validada na entrevista.

A auditoria atual acrescenta rastreabilidade dos 697 campos, quantificacao dos 121 textos numericos, duas linhas inteiras excluidas, 224 comparacoes de resumos, detalhamento da normalidade (K5 literal e CDF reversa constante), validacao #REF!, limites/contagens dos histogramas e analise individual das nove fotos. Agora a meta 1,33 esta comprovada na copia recebida; onde o material anterior a tratava como hipotese, usar a evidencia atual, ainda sem generalizar a politica para todos os produtos.

Nao apresentar os valores interpretados como uma "planilha corrigida" homologada. O trabalho mostra diferencas e perguntas; a empresa precisa confirmar origem, semantica, metodo e aplicabilidade das faixas.

## 8. Requisitos do desafio: obrigatorio versus opcional

**Os 13 itens minimos identificados nas imagens:**

1. Cadastro de maquinas, processos e/ou produtos.
2. Cadastro de parametros e dados de producao monitorados.
3. Definicao de limites ou metas.
4. Registro digital dos dados coletados.
5. Registro de quantidade produzida e periodo.
6. Registro de paradas, duracao e motivo.
7. Registro de refugos, perdas e motivos.
8. Armazenamento organizado/estruturado.
9. Associacao a maquina, processo ou produto.
10. Historico para consulta e analise.
11. Dashboard com indicadores e graficos.
12. Identificacao visual de desvios e situacoes criticas.
13. Demonstracao funcional do fluxo por prototipo.

**Os 16 diferenciais opcionais:** OCR; coleta direta de CLP/IHM; IoT; QR; alertas de parametro; alertas de Cp/Cpk; alertas de excesso de paradas/refugos/perdas; classificacao/analise de motivos; fluxo de analise/liberacao da Engenharia; historico de analises/ocorrencias/liberacoes; tablet/smartphone; tempo real; comparacoes; exportacao; IA; API/integracoes futuras.

O texto exige um MVP funcional ao final, mas nao torna todos os opcionais obrigatorios. Prazo final, duracao da apresentacao, rubrica/pesos, dados permitidos e restricoes de demonstracao nao estao claros nas imagens. Confirmar com MSA/SENAI. A entrevista de 06/10 nao foi tratada como entrega do prototipo, conforme esclarecimento do usuario.

## 9. Recomendacao para a entrevista e para o piloto

Abrir com: "Mapeamos os materiais e encontramos pontos em que o contexto muda a leitura dos indicadores. Queremos validar o fluxo com voces antes de automatizar as regras. O que uma solucao realmente util precisa mudar no dia a dia?"

Mostrar BF por ate 90 segundos, com endereco e dados; em seguida perguntar como e feito hoje. Nao levar a entrevista inteira como uma apresentacao de falhas. Fazer o entrevistado contar um caso recente, da coleta ate a decisao; isso tende a revelar excecoes nao descritas no desafio.

Prioridade recomendada, sujeita ao que ouvirem: um processo/produto-piloto; cadastro versionado de parametros e unidades; entrada validada com origem/autor; quantidade, paradas e perdas; visao temporal e fila de analise; registro da decisao. Integracao/OCR fica em fase posterior se nao houver acesso e validacao para um MVP seguro e verificavel. Se houver acesso simples autorizado, pode ser escolhida como diferencial, sem prometer comandos da maquina.

**O que pode estar faltando no texto, a confirmar:** perfil e permissao, offline e sincronizacao, aparelho compartilhado, correcoes auditadas, regras de retencao/acesso, receita e ordem/lote, tolerancias versionadas, reuniao de alarmes em episodios, limites unilaterais, dados insuficientes, unidade de perda, rastreio da liberacao e integracao com sistemas atuais.

Exemplos de aceite a negociar: virgula/ponto geram o mesmo valor valido; ausencia nao vira zero; primeira coleta vazia nao esconde as seguintes; limite invertido nao gera aprovacao; zero desvio mostra indisponibilidade; receita nova nao reinterpreta historico antigo; contador zerado nao produz quantidade negativa; varios alarmes de uma parada nao multiplicam a duracao; correcao preserva valor anterior/autor/motivo; perda em kg nao e subtraida de pecas; foto OCR exige revisao quando ambigua; uma coleta salva offline nao duplica ao sincronizar.

Nao calcular OEE apenas porque e um indicador conhecido. Antes, definir tempo planejado, tempo operando, ciclo ideal ou taxa ideal por produto, produzido bruto e produzido bom. Nao confundir aprovado na IHM com liberado pela Engenharia. Nao estimar economia ou ROI sem baseline medido e custo fornecido.

## 10. Apendice: todos os 41 parametros

Todas as estatisticas abaixo sao descritivas ou reproducoes aritmeticas do arquivo, nao certificacao de capacidade. "Interpretado" inclui conversao estrita dos textos decimais; "nativo" representa os numeros que as formulas de referencia utilizam. Faixas sao as cadastradas no arquivo, nao limites homologados. Campos fora da faixa nao provam defeito de produto.

{{TABELA_PARAMETROS}}

### Detalhamento por parametro

{{DETALHE_PARAMETROS}}

## 11. Como consultar as evidencias

`entrega/auditoria_41_parametros.csv`: resumo completo por parametro, com media/desvio populacional/desvio amostral, indices aritmeticos salvos e interpretados, n, ausencias, observacoes e soma do histograma.

`entrega/medicoes_697_campos.csv`: uma linha por campo, incluindo vazios. Contem celula, data, parametro, unidade, original, tipo Excel, formato, numero interpretado, tratamento e relacao condicional com a faixa cadastrada. CSV UTF-8 com BOM e separador ponto e virgula; importar explicitamente se o Excel local interpretar decimais de modo diferente.

`analise/evidencias/auditoria_calculos.json`: parametros, formulas de resumo, registros, comparacoes e todos os enderecos com erros salvos. Os dois inventarios de celulas registram a estrutura completa das abas. Para reproduzir, usar Python com openpyxl e executar `analise/auditar_materiais.py` e `analise/recalcular_planilha.py`; nenhum salva o XLSX original.

**Limites remanescentes:** nao houve entrevista, acesso aos CLPs, leitura de registros operacionais completos, validacao com Engenharia, motor Excel nativo, metrologia ou teste industrial. O proximo passo e validar as perguntas e o metodo com a empresa, nao afirmar uma implementacao pronta.
