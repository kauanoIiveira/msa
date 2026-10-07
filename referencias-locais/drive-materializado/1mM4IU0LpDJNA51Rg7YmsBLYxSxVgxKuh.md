# Entrevista MSA | 06/10/2026

Objetivo: entender o processo e as regras que nao aparecem no desafio. Este documento e editavel para registrar as respostas. O PDF traz as mesmas prioridades com evidencias visuais. A auditoria completa e material de consulta, nao roteiro para ler inteiro durante a reuniao.

## Antes da reuniao

Separar papeis: uma pessoa conduz, uma registra, uma observa o fluxo e o tempo. Ajustar a duracao com a empresa; nao supor 45 minutos. Perguntar se anotacoes/fotos sao permitidas. Nao enviar dados ou fotos industriais a servicos externos sem autorizacao da MSA.

Levar o PDF offline e o exemplo BF. Confirmar que o arquivo recebido representa o processo real ou se foi adaptado para o desafio. Mostrar apenas a evidencia necessaria e convidar a empresa a explicar.

## Abertura sugerida | 30 segundos

"Estudamos os materiais e queremos validar como uma coleta vira uma decisao. Encontramos alguns pontos em que o contexto muda a interpretacao dos numeros. Antes de escolher as telas e a automacao, queremos entender o que mais atrapalha hoje e o que faria a solucao ser realmente utilizada pela equipe."

## Cinco perguntas que nao podem faltar

1. **Prioridade real:** "Se melhorassemos uma coisa primeiro, o que teria maior impacto? O que voces precisam e ainda nao aparece no desafio? Como perceberiam que deu certo?"
   Resposta / indicador de sucesso:

2. **Caso completo:** "Podem nos contar a ultima coleta e liberacao, desde o operador ate a Engenharia? Quem faz cada etapa, quanto demora e o que acontece quando ha divergencia?"
   Etapas / responsaveis / tempos medidos:

3. **Piloto:** "Qual maquina, processo, produto e receita devemos usar no MVP? Os materiais mostram contextos diferentes: quais pertencem ao mesmo fluxo e quais devem ficar separados?"
   Piloto / chave de contexto / volume esperado:

4. **Regra tecnica:** "Quais parametros sao ajuste e quais sao medicao real? Quem aprova unidades, limites, metodo de CEP e criterio de liberacao? Podem nos dar um caso que deve ser aceito e outro recusado?"
   Responsavel tecnico / regra / exemplos:

5. **Uso viavel:** "Onde e em qual aparelho sera usado? Ha internet no posto? Qual acesso aos dados e permitido e o que precisa estar demonstrado no prototipo final?"
   Ambiente / restricoes / aceite / prazo:

## Exemplo para abrir a parte tecnica | ate 90 segundos

"Na coluna Tempo destacar, ha sete entradas 0,8 e dez entradas 0,9. Parte esta armazenada como texto. A formula atual considera so sete numeros. Ao interpretar as 17 entradas, a media fica 0,8588 s, e nao 0,9. Como voces gostariam que o sistema validasse a coleta e mostrasse quais valores entraram no estudo?"

Origem: aba `Selo `, BF17:BF33. Os indices recalculados sao aritmeticos, nao conclusao homologada. Nao dizer "a maquina esta incapaz" ou "provamos que o Excel da empresa esta errado".

## Perguntas tecnicas, conforme o interlocutor

### Engenharia / qualidade

- A faixa 80:75 s em Tempo Contra molde e intencional? E as zonas Z1/Z9/Z10/Z18 com 0/0?
- Pressao 6,5 bar e vacuo -600 mm/Hg sao limites unilaterais? Qual desigualdade devemos testar? O instrumento de pressao usa bar ou kgf/cm2?
- O que mudou de agosto para setembro em Tempo de Resfriamento (35/20/15 s) e Retardo resfriamento (4/7/30 s)? Aquecimento e setup entram no estudo?
- O teste de normalidade e realizado onde? Na copia recebida a aba esta vazia e o OK de Selo e literal. Existe um estudo completo de referencia?
- Qual estimador de sigma, subgrupos, frequencia, critério de dados suficientes e regras de estabilidade/nao normalidade? A meta 1,33 vale para quais caracteristicas?
- Quem pode excluir/corrigir uma medicao? Guardamos original, alteracao, motivo e versao do limite?
- O objeto liberado e maquina, receita, inicio de producao, ordem ou lote? Uma mudanca relevante exige nova analise? Quem pode aprovar e quais excecoes existem?

### Operacao / lideranca

- Qual etapa exige mais tempo ou retrabalho? O operador teria tempo para registrar durante uma parada?
- Ha contagem por ciclo, peca, caixa ou cavidade? O contador acumula desde quando, e como reseta?
- O produzido do Pitch Board e bruto ou bom? Sucata em branco significa nao medida, nao informada ou zero confirmado?
- Uma parada de estacao para a linha inteira? Como registrar inicio/fim, pausas planejadas, setup, pequenas paradas e motivo desconhecido?
- Varios alarmes proximos representam uma unica parada? Quem confirma a causa final?
- Perda em kg, refugo em pecas e retrabalho sao apontados separados? Como evitar dupla contagem?
- E melhor tablet compartilhado, celular ou computador? Identificacao por usuario/PIN/cracha? O que precisa funcionar sem rede?

### Manutencao / TI

- Modelos exatos de CLP/IHM, protocolos e exportacoes ja disponiveis? Ha lista de tags e historico de eventos autorizados?
- Ha acesso somente leitura em rede segregada ou preferem arquivo exportado? Quem libera teste e acompanha?
- A MSA permite armazenar fotos e usar OCR em nuvem? Quais dados podem sair da rede? Qual retencao?
- Qual sistema precisa integrar, com qual identificador oficial de maquina, produto, ordem e lote?
- Para offline: como resolver duplicidade, aparelhos compartilhados e conflitos ao sincronizar? Quais requisitos de backup, acesso e suporte?

### Empresa / SENAI / avaliacao

- Ha requisitos adicionais que nao estao nos materiais? Qual diferencial mais importa, e por que?
- Qual o prazo final e o tempo de demonstracao? Quais criterios e pesos distinguem as tres equipes?
- A demonstracao precisa ler uma maquina real ou pode usar dados reais importados e simulacao claramente identificada?
- O que e indispensavel para um piloto ser aceito? Quem valida e quando podemos mostrar a primeira versao?
- Podem disponibilizar um exemplo anonimizado completo: coleta, receita/limites, parada encerrada, perda, analise e decisao?

## Roteiro por tempo disponivel

**15 minutos:** prioridade, um caso real, piloto, cinco perguntas essenciais, um exemplo BF e recapitulacao das decisoes. Nao abrir todas as questoes tecnicas.

**30 minutos:** 3 min contexto; 7 min fluxo; 8 min dados/regras; 7 min producao/paradas/uso; 5 min aceite e fechamento.

**45 minutos:** roteiro de 30 min, mais 10 min de excecoes e 5 min de validacao de acesso/dados com TI ou manutencao. Adaptar aos interlocutores disponiveis.

## Como responder sem prometer demais

"Ja existe uma API?" -> "Precisamos validar os modelos e o acesso permitido. Podemos demonstrar o fluxo com entrada validada/importacao e evoluir para leitura autorizada."

"Voces farao OCR?" -> "Pode ser um diferencial. Primeiro precisamos confirmar campos, imagens, privacidade e uma revisao humana para leituras ambiguas."

"Dara para calcular Cp/Cpk automaticamente?" -> "Sim, depois de validarmos com a Engenharia quais dados e qual metodo sao aplicaveis. O sistema precisa explicar quando o indice nao e avaliavel."

"E OEE ou IA?" -> "Podemos avaliar, mas precisamos dos dados e das definicoes antes. Para o MVP, queremos priorizar o problema com maior impacto comprovado."

## Fechamento: oito decisoes para sair com clareza

| Decisao | Resposta | Quem valida | Prazo |
| --- | --- | --- | --- |
| Dor prioritaria e sucesso mensuravel | | | |
| Maquina/processo/produto/receita-piloto | | | |
| Campos, unidades e limites aplicaveis | | | |
| Metodo de analise e liberacao | | | |
| Quantidade, paradas, perdas e excecoes | | | |
| Usuarios, dispositivos, offline e acesso | | | |
| Escopo minimo, diferencial e aceite | | | |
| Exemplo de dados e primeira validacao | | | |

"Para confirmar: o piloto sera ____, o fluxo prioritario sera ____, a Engenharia validara ____, e vamos demonstrar ____ ate ____. O que entendemos errado ou deixamos de fora?"

Nao preencher silenciosamente respostas ausentes com suposicoes. Marcar pendencia, responsavel e prazo. Um fluxo menor, validado e rastreavel e uma promessa mais defensavel do que uma integracao industrial nao confirmada.
