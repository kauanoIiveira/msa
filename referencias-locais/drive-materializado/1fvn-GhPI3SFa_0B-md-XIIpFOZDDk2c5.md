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

| Linha | Data | Numeros nativos | Textos decimais | Ausentes |
| --- | --- | --- | --- | --- |
| 17 | 2026-08-25 | 34 | 5 | 2 |
| 18 | 2026-08-25 | 34 | 5 | 2 |
| 19 | 2026-08-26 | 34 | 5 | 2 |
| 20 | 2026-08-26 | 34 | 5 | 2 |
| 21 | 2026-08-27 | 34 | 5 | 2 |
| 22 | 2026-08-27 | 34 | 5 | 2 |
| 23 | 2026-08-28 | 35 | 4 | 2 |
| 24 | 2026-08-28 | 36 | 5 | 0 |
| 25 | 2026-08-31 | 0 | 41 | 0 |
| 26 | 2026-08-31 | 0 | 41 | 0 |
| 27 | 2026-09-17 | 41 | 0 | 0 |
| 28 | 2026-09-21 | 41 | 0 | 0 |
| 29 | 2026-09-22 | 41 | 0 | 0 |
| 30 | 2026-09-23 | 41 | 0 | 0 |
| 31 | 2026-09-24 | 41 | 0 | 0 |
| 32 | 2026-09-25 | 41 | 0 | 0 |
| 33 | 2026-09-29 | 41 | 0 | 0 |

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

| Coluna / parametro | Unidade | LI | LS | N interpretado | Textos | Media | Desvio pop. | Cp arit. | Cpk arit. |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F / Temp Ambiente | °C | 13 | 30 | 17 | 2 | 20,2941 | 4,9677 | 0,5703 | 0,4894 |
| H / Aquecimento Z1 | °C | 0 | 0 | 17 | 2 | 44,7059 | 5,6752 | 0 | -2,6258 |
| J / Aquecimento Z2 | °C | 255 | 265 | 17 | 2 | 245,7647 | 9,8848 | 0,1686 | -0,3114 |
| L / Aquecimento Z3 | °C | 255 | 265 | 17 | 2 | 247,5882 | 5,6886 | 0,293 | -0,4343 |
| N / Aquecimento Z4 | °C | 252 | 262 | 17 | 2 | 246,6471 | 5,6145 | 0,2969 | -0,3178 |
| P / Aquecimento Z5 | °C | 252 | 262 | 17 | 2 | 246,1176 | 5,4867 | 0,3038 | -0,3574 |
| R / Aquecimento Z6 | °C | 252 | 262 | 17 | 2 | 246,2353 | 5,6934 | 0,2927 | -0,3375 |
| T / Aquecimento Z7 | °C | 265 | 275 | 17 | 2 | 248,6471 | 7,4907 | 0,2225 | -0,7277 |
| V / Aquecimento Z8 | °C | 265 | 275 | 17 | 2 | 248,3529 | 7,9775 | 0,2089 | -0,6956 |
| X / Aquecimento Z9 | °C | 0 | 0 | 17 | 2 | 89,8235 | 5,4258 | 0 | -5,5183 |
| Z / Aquecimento Z10 | °C | 0 | 0 | 17 | 2 | 97,4118 | 7,3649 | 0 | -4,4088 |
| AB / Aquecimento Z11 | °C | 250 | 260 | 17 | 2 | 251,5294 | 4,089 | 0,4076 | 0,1247 |
| AD / Aquecimento Z12 | °C | 260 | 270 | 17 | 2 | 258,1176 | 3,428 | 0,4862 | -0,183 |
| AF / Aquecimento Z13 | °C | 260 | 270 | 17 | 2 | 250,7059 | 39,5129 | 0,0422 | -0,0784 |
| AH / Aquecimento Z14 | °C | 255 | 265 | 17 | 2 | 250,5294 | 38,1423 | 0,0437 | -0,0391 |
| AJ / Aquecimento Z15 | °C | 270 | 280 | 17 | 2 | 269,9412 | 9,9556 | 0,1674 | -0,002 |
| AL / Aquecimento Z16 | °C | 270 | 280 | 17 | 2 | 269,7647 | 10,2126 | 0,1632 | -0,0077 |
| AN / Aquecimento Z17 | °C | 270 | 280 | 17 | 2 | 271,1176 | 9,9521 | 0,1675 | 0,0374 |
| AP / Aquecimento Z18 | °C | 0 | 0 | 17 | 2 | 75,8824 | 2,1388 | 0 | -11,8264 |
| AR / Aquecimento Z19 | °C | 285 | 295 | 17 | 2 | 273,7647 | 6,7522 | 0,2468 | -0,5547 |
| AT / Aquecimento Z20 | °C | 300 | 310 | 17 | 2 | 303,8824 | 7,3315 | 0,2273 | 0,1765 |
| AV / Aquecimento Z21 | °C | 310 | 320 | 17 | 2 | 301,8235 | 7,2293 | 0,2305 | -0,377 |
| AX / Medida do Passo | mm | 412 | 415 | 17 | 2 | 412,4118 | 1,2861 | 0,3888 | 0,1067 |
| AZ / Velocidade do Passo | % | 19 | 20 | 17 | 2 | 19 | 0 | nao avaliavel | nao avaliavel |
| BB / Tempo de Vacuo | seg | 75 | 85 | 17 | 2 | 82,9412 | 7,487 | 0,2226 | 0,0917 |
| BD / Tempo de Resfriamento | seg | 35 | 36 | 17 | 2 | 27,0588 | 9,5577 | 0,0174 | -0,277 |
| BF / Tempo destacar | seg | 0,8 | 0,9 | 17 | 10 | 0,8588 | 0,0492 | 0,3386 | 0,2789 |
| BH / Tempo Contra molde | seg | 80 | 75 | 17 | 2 | 87,9412 | 7,487 | -0,1113 | -0,5762 |
| BJ / Tempo prensa corte | seg | 10 | 15 | 17 | 2 | 10,6471 | 0,4779 | 1,7438 | 0,4513 |
| BL / Tempo de esteira saida | seg | 28 | 30 | 17 | 2 | 31,2353 | 3,2273 | 0,1033 | -0,1276 |
| BN / Retardo de Passo | seg | 1 | 2 | 17 | 2 | 1,4118 | 0,4922 | 0,3386 | 0,2789 |
| BP / Retardo de Mesa | seg | 0,1 | 1 | 17 | 10 | 0,1 | 0 | nao avaliavel | nao avaliavel |
| BR / Retardo de Vacuo | seg | 4 | 5 | 17 | 2 | 4,5882 | 0,4922 | 0,3386 | 0,2789 |
| BT / Retardo de resfriamento | seg | 4 | 5 | 17 | 2 | 13,3529 | 12,3142 | 0,0135 | -0,2261 |
| BV / Retardo destacar | seg | 2 | 5 | 17 | 2 | 2,2353 | 0,73 | 0,6849 | 0,1074 |
| BX / Retardo Contra Molde | seg | 1,5 | 5 | 17 | 10 | 1,3824 | 0,2121 | 2,7504 | -0,1849 |
| BZ / Retardo Prensa Corte | seg | 9,5 | 15 | 17 | 8 | 10,4706 | 0,7168 | 1,2788 | 0,4513 |
| CB / Retardo disco corte | seg | 7 | 9 | 17 | 2 | 7,2353 | 0,4242 | 0,7858 | 0,1849 |
| CD / Retardo esteria saida | seg | 0,5 | 1 | 17 | 10 | 0,5 | 0 | nao avaliavel | nao avaliavel |
| CF / Pressão Ar | bar | 6,5 | nao avaliavel | 10 | 3 | 6,62 | 0,06 | nao avaliavel | nao avaliavel |
| CH / Vacuo | mm/Hg | -600 | nao avaliavel | 10 | 2 | -509 | 96,4832 | nao avaliavel | nao avaliavel |

### Detalhamento por parametro

#### F | Temp Ambiente | identificador 1

- Origem: `F9:F12` e `F17:F33`; unidade: °C; limites cadastrados: 13 / 30.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=14; maximo=32; media=20,2941176471; desvio populacional=4,9677158425; desvio amostral=5,1206042842.
- Salvos no arquivo: media=20,0666666667; desvio populacional=5,2467979653; Cp=0,5400118991; Cpk=0,448951069; status='NOK'.
- Conta interpretada: Cp=0,5703493161; Cpk=0,4894347072. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 16 dentro, 0 abaixo, 1 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 15; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### H | Aquecimento Z1 | identificador 2

- Origem: `H9:H12` e `H17:H33`; unidade: °C; limites cadastrados: 0 / 0.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=33; maximo=52; media=44,7058823529; desvio populacional=5,6751751036; desvio amostral=5,849836599.
- Salvos no arquivo: media=45,0666666667; desvio populacional=5,9382002511; Cp=0; Cpk=-2,5297601271; status='NOK'.
- Conta interpretada: Cp=0; Cpk=-2,6258151532. Faixa degenerada/invertida: os indices acima sao apenas reproducao da conta, sem interpretacao de capacidade.
- Comparacao inclusiva com a faixa do arquivo: 0 dentro, 0 abaixo, 0 acima, 17 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 0; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto; limites iguais.

#### J | Aquecimento Z2 | identificador 3

- Origem: `J9:J12` e `J17:J33`; unidade: °C; limites cadastrados: 255 / 265.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=215; maximo=257; media=245,7647058824; desvio populacional=9,8848036177; desvio amostral=10,1890223511.
- Salvos no arquivo: media=245,6; desvio populacional=10,4868171212; Cp=0,1589296969; Cpk=-0,2987878302; status='NOK'.
- Conta interpretada: Cp=0,1686089811; Cpk=-0,3114307063. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 3 dentro, 14 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 5; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### L | Aquecimento Z3 | identificador 4

- Origem: `L9:L12` e `L17:L33`; unidade: °C; limites cadastrados: 255 / 265.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=235; maximo=256; media=247,5882352941; desvio populacional=5,6885728959; desvio amostral=5,8636467272.
- Salvos no arquivo: media=247,2666666667; desvio populacional=5,9717855137; Cp=0,2790901754; Cpk=-0,4316594713; status='NOK'.
- Conta interpretada: Cp=0,292985024; Cpk=-0,4343072121. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 2 dentro, 15 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 2; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### N | Aquecimento Z4 | identificador 5

- Origem: `N9:N12` e `N17:N33`; unidade: °C; limites cadastrados: 252 / 262.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=235; maximo=256; media=246,6470588235; desvio populacional=5,6144894113; desvio amostral=5,7872832192.
- Salvos no arquivo: media=246,2666666667; desvio populacional=5,8476966026; Cp=0,2850125066; Cpk=-0,3268143409; status='NOK'.
- Conta interpretada: Cp=0,2968509769; Cpk=-0,3178051635. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 1 dentro, 16 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 6; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### P | Aquecimento Z5 | identificador 6

- Origem: `P9:P12` e `P17:P33`; unidade: °C; limites cadastrados: 252 / 262.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=235; maximo=255; media=246,1176470588; desvio populacional=5,4866935606; desvio amostral=5,6555542715.
- Salvos no arquivo: media=246,9333333333; desvio populacional=5,0128723192; Cp=0,3324773823; Cpk=-0,3369104141; status='NOK'.
- Conta interpretada: Cp=0,3037652182; Cpk=-0,3573708449. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 2 dentro, 15 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 8; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### R | Aquecimento Z6 | identificador 7

- Origem: `R9:R12` e `R17:R33`; unidade: °C; limites cadastrados: 252 / 262.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=235; maximo=255; media=246,2352941176; desvio populacional=5,6934370036; desvio amostral=5,8686605346.
- Salvos no arquivo: media=247,0666666667; desvio populacional=5,3599336646; Cp=0,3109491219; Cpk=-0,3068031336; status='NOK'.
- Conta interpretada: Cp=0,2927347164; Cpk=-0,3375059083. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 1 dentro, 16 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 5; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### T | Aquecimento Z7 | identificador 8

- Origem: `T9:T12` e `T17:T33`; unidade: °C; limites cadastrados: 265 / 275.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=234; maximo=265; media=248,6470588235; desvio populacional=7,4907093552; desvio amostral=7,7212464705.
- Salvos no arquivo: media=250,2; desvio populacional=6,4725059547; Cp=0,2574994412; Cpk=-0,762198346; status='NOK'.
- Conta interpretada: Cp=0,222497842; Cpk=-0,7276988245. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 1 dentro, 16 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 1; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### V | Aquecimento Z8 | identificador 9

- Origem: `V9:V12` e `V17:V33`; unidade: °C; limites cadastrados: 265 / 275.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=234; maximo=266; media=248,3529411765; desvio populacional=7,977476945; desvio amostral=8,2229950176.
- Salvos no arquivo: media=249,8666666667; desvio populacional=7,1727880834; Cp=0,2323596693; Cpk=-0,7032752656; status='NOK'.
- Conta interpretada: Cp=0,2089215272; Cpk=-0,6955857906. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 1 dentro, 16 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 1; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### X | Aquecimento Z9 | identificador 10

- Origem: `X9:X12` e `X17:X33`; unidade: °C; limites cadastrados: 0 / 0.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=76; maximo=97; media=89,8235294118; desvio populacional=5,4258129683; desvio amostral=5,5927999933.
- Salvos no arquivo: media=90; desvio populacional=5,7503623074; Cp=0; Cpk=-5,2170625773; status='NOK'.
- Conta interpretada: Cp=0; Cpk=-5,5182839227. Faixa degenerada/invertida: os indices acima sao apenas reproducao da conta, sem interpretacao de capacidade.
- Comparacao inclusiva com a faixa do arquivo: 0 dentro, 0 abaixo, 0 acima, 17 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 0; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto; limites iguais.

#### Z | Aquecimento Z10 | identificador 11

- Origem: `Z9:Z12` e `Z17:Z33`; unidade: °C; limites cadastrados: 0 / 0.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=87; maximo=116; media=97,4117647059; desvio populacional=7,3649314004; desvio amostral=7,5915975223.
- Salvos no arquivo: media=97,6666666667; desvio populacional=7,751702322; Cp=0; Cpk=-4,1997943424; status='NOK'.
- Conta interpretada: Cp=0; Cpk=-4,4088106827. Faixa degenerada/invertida: os indices acima sao apenas reproducao da conta, sem interpretacao de capacidade.
- Comparacao inclusiva com a faixa do arquivo: 0 dentro, 0 abaixo, 0 acima, 17 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 0; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto; limites iguais.

#### AB | Aquecimento Z11 | identificador 12

- Origem: `AB9:AB12` e `AB17:AB33`; unidade: °C; limites cadastrados: 250 / 260.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=239; maximo=255; media=251,5294117647; desvio populacional=4,0889758111; desvio amostral=4,2148197924.
- Salvos no arquivo: media=251,4666666667; desvio populacional=4,208985098; Cp=0,3959782769; Cpk=0,1161536279; status='NOK'.
- Conta interpretada: Cp=0,4076000308; Cpk=0,1246776565. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 13 dentro, 4 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 14; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### AD | Aquecimento Z12 | identificador 13

- Origem: `AD9:AD12` e `AD17:AD33`; unidade: °C; limites cadastrados: 260 / 270.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=248; maximo=262; media=258,1176470588; desvio populacional=3,4279534787; desvio amostral=3,5334535681.
- Salvos no arquivo: media=258,2666666667; desvio populacional=3,5490217745; Cp=0,469612973; Cpk=-0,162799164; status='NOK'.
- Conta interpretada: Cp=0,4861987413; Cpk=-0,1830395261. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 9 dentro, 8 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 10; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### AF | Aquecimento Z13 | identificador 14

- Origem: `AF9:AF12` e `AF17:AF33`; unidade: °C; limites cadastrados: 260 / 270.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=94; maximo=270; media=250,7058823529; desvio populacional=39,5128641835; desvio amostral=40,7289281498.
- Salvos no arquivo: media=248,6; desvio populacional=41,604166458; Cp=0,0400600903; Cpk=-0,091337006; status='NOK'.
- Conta interpretada: Cp=0,0421803557; Cpk=-0,0784058377. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 11 dentro, 6 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 10; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### AH | Aquecimento Z14 | identificador 15

- Origem: `AH9:AH12` e `AH17:AH33`; unidade: °C; limites cadastrados: 255 / 265.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=101; maximo=271; media=250,5294117647; desvio populacional=38,1423304249; desvio amostral=39,3162142873.
- Salvos no arquivo: media=248,2; desvio populacional=40,0186623131; Cp=0,0416472358; Cpk=-0,0566402407; status='NOK'.
- Conta interpretada: Cp=0,0436959842; Cpk=-0,0390693506. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 7 dentro, 6 abaixo, 4 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 10; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### AJ | Aquecimento Z15 | identificador 16

- Origem: `AJ9:AJ12` e `AJ17:AJ33`; unidade: °C; limites cadastrados: 270 / 280.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=251; maximo=285; media=269,9411764706; desvio populacional=9,9556108226; desvio amostral=10,2620087473.
- Salvos no arquivo: media=270; desvio populacional=10,5955965696; Cp=0,1572980488; Cpk=0; status='NOK'.
- Conta interpretada: Cp=0,1674097849; Cpk=-0,0019695269. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 9 dentro, 7 abaixo, 1 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 9; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### AL | Aquecimento Z16 | identificador 17

- Origem: `AL9:AL12` e `AL17:AL33`; unidade: °C; limites cadastrados: 270 / 280.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=248; maximo=285; media=269,7647058824; desvio populacional=10,2126185601; desvio amostral=10,5269262594.
- Salvos no arquivo: media=269,9333333333; desvio populacional=10,8595068437; Cp=0,1534753549; Cpk=-0,0020463381; status='NOK'.
- Conta interpretada: Cp=0,1631967998; Cpk=-0,0076798494. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 7 dentro, 9 abaixo, 1 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 9; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### AN | Aquecimento Z17 | identificador 18

- Origem: `AN9:AN12` e `AN17:AN33`; unidade: °C; limites cadastrados: 270 / 280.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=244; maximo=280; media=271,1176470588; desvio populacional=9,95213458; desvio amostral=10,2584255185.
- Salvos no arquivo: media=271,1333333333; desvio populacional=10,5379736614; Cp=0,1581581735; Cpk=0,035849186; status='NOK'.
- Conta interpretada: Cp=0,1674682605; Cpk=0,0374340818. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 11 dentro, 6 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 11; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### AP | Aquecimento Z18 | identificador 19

- Origem: `AP9:AP12` e `AP17:AP33`; unidade: °C; limites cadastrados: 0 / 0.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=72; maximo=79; media=75,8823529412; desvio populacional=2,1387834074; desvio amostral=2,2046074747.
- Salvos no arquivo: media=75,6666666667; desvio populacional=2,1186998109; Cp=0; Cpk=-11,9045756704; status='NOK'.
- Conta interpretada: Cp=0; Cpk=-11,8264044689. Faixa degenerada/invertida: os indices acima sao apenas reproducao da conta, sem interpretacao de capacidade.
- Comparacao inclusiva com a faixa do arquivo: 0 dentro, 0 abaixo, 0 acima, 17 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 0; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto; limites iguais.

#### AR | Aquecimento Z19 | identificador 20

- Origem: `AR9:AR12` e `AR17:AR33`; unidade: °C; limites cadastrados: 285 / 295.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=262; maximo=285; media=273,7647058824; desvio populacional=6,7521622834; desvio amostral=6,959969574.
- Salvos no arquivo: media=274,1333333333; desvio populacional=7,0980435489; Cp=0,2348064865; Cpk=-0,510312764; status='NOK'.
- Conta interpretada: Cp=0,2468345097; Cpk=-0,554651663. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 1 dentro, 16 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 3; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### AT | Aquecimento Z20 | identificador 21

- Origem: `AT9:AT12` e `AT17:AT33`; unidade: °C; limites cadastrados: 300 / 310.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=278; maximo=310; media=303,8823529412; desvio populacional=7,3314981451; desvio amostral=7,5571353116.
- Salvos no arquivo: media=303,4666666667; desvio populacional=7,6756469145; Cp=0,2171369639; Cpk=0,1505482949; status='NOK'.
- Conta interpretada: Cp=0,2273296172; Cpk=0,1765147616. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 15 dentro, 2 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 13; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### AV | Aquecimento Z21 | identificador 22

- Origem: `AV9:AV12` e `AV17:AV33`; unidade: °C; limites cadastrados: 310 / 320.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=278; maximo=310; media=301,8235294118; desvio populacional=7,2293136451; desvio amostral=7,4518059398.
- Salvos no arquivo: media=301,9333333333; desvio populacional=7,6547733837; Cp=0,217729067; Cpk=-0,3512695614; status='NOK'.
- Conta interpretada: Cp=0,2305428632; Cpk=-0,377005388. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 1 dentro, 16 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 3; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### AX | Medida do Passo | identificador 24

- Origem: `AX9:AX12` e `AX17:AX33`; unidade: mm; limites cadastrados: 412 / 415.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=410; maximo=415; media=412,4117647059; desvio populacional=1,2860712417; desvio amostral=1,3256518929.
- Salvos no arquivo: media=412,0666666667; desvio populacional=0,9285592185; Cp=0,538468619; Cpk=0,0239319386; status='NOK'.
- Conta interpretada: Cp=0,3887809507; Cpk=0,1067241825. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 16 dentro, 1 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 14; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### AZ | Velocidade do Passo | identificador 25

- Origem: `AZ9:AZ12` e `AZ17:AZ33`; unidade: %; limites cadastrados: 19 / 20.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=19; maximo=19; media=19; desvio populacional=0; desvio amostral=0.
- Salvos no arquivo: media=19; desvio populacional=0; Cp=#DIV/0!; Cpk=#DIV/0!; status='#DIV/0!'.
- Conta interpretada: Cp=nao avaliavel; Cpk=nao avaliavel. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 17 dentro, 0 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 15; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto; dispersao matematica nula no subconjunto numerico; dispersao matematica nula em todos os registros interpretados; erro de formula salvo.

#### BB | Tempo de Vacuo | identificador 26

- Origem: `BB9:BB12` e `BB17:BB33`; unidade: seg; limites cadastrados: 75 / 85.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=70; maximo=95; media=82,9411764706; desvio populacional=7,4870129773; desvio amostral=7,7174363314.
- Salvos no arquivo: media=82; desvio populacional=7,2571803524; Cp=0,2296576061; Cpk=0,1377945637; status='NOK'.
- Conta interpretada: Cp=0,2226076904; Cpk=0,0916619902. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 9 dentro, 2 abaixo, 6 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 8; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### BD | Tempo de Resfriamento | identificador 27

- Origem: `BD9:BD12` e `BD17:BD33`; unidade: seg; limites cadastrados: 35 / 36.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=15; maximo=35; media=27,0588235294; desvio populacional=9,5576922407; desvio amostral=9,8518436614.
- Salvos no arquivo: media=26; desvio populacional=9,6953597148; Cp=0,0171903541; Cpk=-0,3094263739; status='NOK'.
- Conta interpretada: Cp=0,0174379612; Cpk=-0,2769558547. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 10 dentro, 7 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 8; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### BF | Tempo destacar | identificador 28

- Origem: `BF9:BF12` e `BF17:BF33`; unidade: seg; limites cadastrados: 0,8 / 0,9.
- Tipos: 7 numeros nativos, 10 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=0,8; maximo=0,9; media=0,8588235294; desvio populacional=0,0492152957; desvio amostral=0,0507299656.
- Salvos no arquivo: media=0,9; desvio populacional=1,11022e-16; Cp=1,50120e+14; Cpk=-0,3333333333; status='NOK'.
- Conta interpretada: Cp=0,338648106; Cpk=0,2788866755. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 17 dentro, 0 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 7; numeros nativos disponiveis: 7. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 10 valores como texto; dispersao matematica nula no subconjunto numerico.

#### BH | Tempo Contra molde | identificador 29

- Origem: `BH9:BH12` e `BH17:BH33`; unidade: seg; limites cadastrados: 80 / 75.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=75; maximo=100; media=87,9411764706; desvio populacional=7,4870129773; desvio amostral=7,7174363314.
- Salvos no arquivo: media=87; desvio populacional=7,2571803524; Cp=-0,114828803; Cpk=-0,5511782546; status='NOK'.
- Conta interpretada: Cp=-0,1113038452; Cpk=-0,576161081. Faixa degenerada/invertida: os indices acima sao apenas reproducao da conta, sem interpretacao de capacidade.
- Comparacao inclusiva com a faixa do arquivo: 0 dentro, 0 abaixo, 0 acima, 17 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: -5; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto; minimo maior que maximo.

#### BJ | Tempo prensa corte | identificador 30

- Origem: `BJ9:BJ12` e `BJ17:BJ33`; unidade: seg; limites cadastrados: 10 / 15.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=10; maximo=11; media=10,6470588235; desvio populacional=0,477884612; desvio amostral=0,4925921831.
- Salvos no arquivo: media=10,6; desvio populacional=0,4898979486; Cp=1,7010345436; Cpk=0,4082482905; status='NOK'.
- Conta interpretada: Cp=1,7437961222; Cpk=0,4513354669. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 17 dentro, 0 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 15; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### BL | Tempo de esteira saida | identificador 31

- Origem: `BL9:BL12` e `BL17:BL33`; unidade: seg; limites cadastrados: 28 / 30.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=28; maximo=35; media=31,2352941176; desvio populacional=3,2272627587; desvio amostral=3,3265863089.
- Salvos no arquivo: media=31,4; desvio populacional=3,4019602192; Cp=0,0979827252; Cpk=-0,1371758153; status='NOK'.
- Conta interpretada: Cp=0,103286704; Cpk=-0,1275894579. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 10 dentro, 0 abaixo, 7 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 8; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### BN | Retardo de Passo | identificador 32

- Origem: `BN9:BN12` e `BN17:BN33`; unidade: seg; limites cadastrados: 1 / 2.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=1; maximo=2; media=1,4117647059; desvio populacional=0,4921529568; desvio amostral=0,5072996562.
- Salvos no arquivo: media=1,4666666667; desvio populacional=0,4988876516; Cp=0,3340765524; Cpk=0,3118047822; status='NOK'.
- Conta interpretada: Cp=0,338648106; Cpk=0,2788866755. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 17 dentro, 0 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 15; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### BP | Retardo de Mesa | identificador 33

- Origem: `BP9:BP12` e `BP17:BP33`; unidade: seg; limites cadastrados: 0,1 / 1.
- Tipos: 7 numeros nativos, 10 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=0,1; maximo=0,1; media=0,1; desvio populacional=0; desvio amostral=0.
- Salvos no arquivo: media=0,1; desvio populacional=1,38778e-17; Cp=1,08086e+16; Cpk=-0,3333333333; status='NOK'.
- Conta interpretada: Cp=nao avaliavel; Cpk=nao avaliavel. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 17 dentro, 0 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 7; numeros nativos disponiveis: 7. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 10 valores como texto; dispersao matematica nula no subconjunto numerico; dispersao matematica nula em todos os registros interpretados.

#### BR | Retardo de Vacuo | identificador 34

- Origem: `BR9:BR12` e `BR17:BR33`; unidade: seg; limites cadastrados: 4 / 5.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=4; maximo=5; media=4,5882352941; desvio populacional=0,4921529568; desvio amostral=0,5072996562.
- Salvos no arquivo: media=4,5333333333; desvio populacional=0,4988876516; Cp=0,3340765524; Cpk=0,3118047822; status='NOK'.
- Conta interpretada: Cp=0,338648106; Cpk=0,2788866755. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 17 dentro, 0 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 15; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### BT | Retardo de resfriamento | identificador 35

- Origem: `BT9:BT12` e `BT17:BT33`; unidade: seg; limites cadastrados: 4 / 5.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=4; maximo=30; media=13,3529411765; desvio populacional=12,3142250429; desvio amostral=12,6932126374.
- Salvos no arquivo: media=14,6; desvio populacional=12,5952371951; Cp=0,0132325151; Cpk=-0,2540642904; status='NOK'.
- Conta interpretada: Cp=0,0135344828; Cpk=-0,2261054769. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 10 dentro, 0 abaixo, 7 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 8; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### BV | Retardo destacar | identificador 36

- Origem: `BV9:BV12` e `BV17:BV33`; unidade: seg; limites cadastrados: 2 / 5.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=1; maximo=3; media=2,2352941176; desvio populacional=0,7299808027; desvio amostral=0,7524469886.
- Salvos no arquivo: media=2,4; desvio populacional=0,6110100927; Cp=0,8183170884; Cpk=0,2182178902; status='NOK'.
- Conta interpretada: Cp=0,6849495194; Cpk=0,1074430619. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 14 dentro, 3 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 14; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### BX | Retardo Contra Molde | identificador 37

- Origem: `BX9:BX12` e `BX17:BX33`; unidade: seg; limites cadastrados: 1,5 / 5.
- Tipos: 7 numeros nativos, 10 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=1; maximo=1,5; media=1,3823529412; desvio populacional=0,2120912515; desvio amostral=0,218618658.
- Salvos no arquivo: media=1,2142857143; desvio populacional=0,2474358297; Cp=2,3575135992; Cpk=-0,3849001795; status='NOK'.
- Conta interpretada: Cp=2,750388473; Cpk=-0,1849000654. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 13 dentro, 4 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 7; numeros nativos disponiveis: 7. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 10 valores como texto.

#### BZ | Retardo Prensa Corte | identificador 38

- Origem: `BZ9:BZ12` e `BZ17:BZ33`; unidade: seg; limites cadastrados: 9,5 / 15.
- Tipos: 9 numeros nativos, 8 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=9,5; maximo=11; media=10,4705882353; desvio populacional=0,7168269181; desvio amostral=0,7388882746.
- Salvos no arquivo: media=11; desvio populacional=0; Cp=#DIV/0!; Cpk=#DIV/0!; status='#DIV/0!'.
- Conta interpretada: Cp=1,278783823; Cpk=0,4513354669. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 17 dentro, 0 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 9; numeros nativos disponiveis: 9. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 8 valores como texto; dispersao matematica nula no subconjunto numerico; erro de formula salvo.

#### CB | Retardo disco corte | identificador 39

- Origem: `CB9:CB12` e `CB17:CB33`; unidade: seg; limites cadastrados: 7 / 9.
- Tipos: 15 numeros nativos, 2 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=7; maximo=8; media=7,2352941176; desvio populacional=0,424182503; desvio amostral=0,4372373161.
- Salvos no arquivo: media=7,1333333333; desvio populacional=0,3399346342; Cp=0,9805806757; Cpk=0,1307440901; status='NOK'.
- Conta interpretada: Cp=0,785825278; Cpk=0,1849000654. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 17 dentro, 0 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 15; numeros nativos disponiveis: 15. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto.

#### CD | Retardo esteria saida | identificador 40

- Origem: `CD9:CD12` e `CD17:CD33`; unidade: seg; limites cadastrados: 0,5 / 1.
- Tipos: 7 numeros nativos, 10 textos decimais, 0 ausentes.
- Interpretados: n=17; minimo=0,5; maximo=0,5; media=0,5; desvio populacional=0; desvio amostral=0.
- Salvos no arquivo: media=0,5; desvio populacional=0; Cp=#DIV/0!; Cpk=#DIV/0!; status='#DIV/0!'.
- Conta interpretada: Cp=nao avaliavel; Cpk=nao avaliavel. Indices apenas aritmeticos; faltam validacao do metodo e contexto de processo.
- Comparacao inclusiva com a faixa do arquivo: 17 dentro, 0 abaixo, 0 acima, 0 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 7; numeros nativos disponiveis: 7. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 10 valores como texto; dispersao matematica nula no subconjunto numerico; dispersao matematica nula em todos os registros interpretados; erro de formula salvo.

#### CF | Pressão Ar | identificador 41

- Origem: `CF9:CF12` e `CF17:CF33`; unidade: bar; limites cadastrados: 6,5 / nao avaliavel.
- Tipos: 7 numeros nativos, 3 textos decimais, 7 ausentes.
- Interpretados: n=10; minimo=6,6; maximo=6,8; media=6,62; desvio populacional=0,06; desvio amostral=0,0632455532.
- Salvos no arquivo: media=nao avaliavel; desvio populacional=nao avaliavel; Cp=nao avaliavel; Cpk=nao avaliavel; status=None.
- Conta interpretada: Cp=nao avaliavel; Cpk=nao avaliavel. Limite unilateral ou incompleto: nenhum Cp bilateral foi inventado.
- Comparacao inclusiva com a faixa do arquivo: 0 dentro, 0 abaixo, 0 acima, 17 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 0; numeros nativos disponiveis: 7. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 3 valores como texto; especificacao unilateral ou incompleta; primeira linha vazia suprime resumo.

#### CH | Vacuo | identificador 42

- Origem: `CH9:CH12` e `CH17:CH33`; unidade: mm/Hg; limites cadastrados: -600 / nao avaliavel.
- Tipos: 8 numeros nativos, 2 textos decimais, 7 ausentes.
- Interpretados: n=10; minimo=-600; maximo=-300; media=-509; desvio populacional=96,4831591523; desvio amostral=101,7021795899.
- Salvos no arquivo: media=nao avaliavel; desvio populacional=nao avaliavel; Cp=nao avaliavel; Cpk=nao avaliavel; status=None.
- Conta interpretada: Cp=nao avaliavel; Cpk=nao avaliavel. Limite unilateral ou incompleto: nenhum Cp bilateral foi inventado.
- Comparacao inclusiva com a faixa do arquivo: 0 dentro, 0 abaixo, 0 acima, 17 nao avaliados (inclui ausentes e faixas sem interpretacao). Nao e contagem de produtos defeituosos.
- Soma de frequencias salvas do histograma: 0; numeros nativos disponiveis: 8. Revisar caudas/limites antes de interpretar a figura.
- Observacoes: 2 valores como texto; especificacao unilateral ou incompleta; primeira linha vazia suprime resumo.


## 11. Como consultar as evidencias

`entrega/auditoria_41_parametros.csv`: resumo completo por parametro, com media/desvio populacional/desvio amostral, indices aritmeticos salvos e interpretados, n, ausencias, observacoes e soma do histograma.

`entrega/medicoes_697_campos.csv`: uma linha por campo, incluindo vazios. Contem celula, data, parametro, unidade, original, tipo Excel, formato, numero interpretado, tratamento e relacao condicional com a faixa cadastrada. CSV UTF-8 com BOM e separador ponto e virgula; importar explicitamente se o Excel local interpretar decimais de modo diferente.

`analise/evidencias/auditoria_calculos.json`: parametros, formulas de resumo, registros, comparacoes e todos os enderecos com erros salvos. Os dois inventarios de celulas registram a estrutura completa das abas. Para reproduzir, usar Python com openpyxl e executar `analise/auditar_materiais.py` e `analise/recalcular_planilha.py`; nenhum salva o XLSX original.

**Limites remanescentes:** nao houve entrevista, acesso aos CLPs, leitura de registros operacionais completos, validacao com Engenharia, motor Excel nativo, metrologia ou teste industrial. O proximo passo e validar as perguntas e o metodo com a empresa, nao afirmar uma implementacao pronta.
