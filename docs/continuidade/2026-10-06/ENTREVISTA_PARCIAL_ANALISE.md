# Entrevista — transcrição parcial fornecida pelo usuário

Recebida em 06/10/2026, como texto no chat. Fonte literal: [TRANSCRICAO_PARCIAL_FORNECIDA.txt](TRANSCRICAO_PARCIAL_FORNECIDA.txt), incluindo a ressalva final do usuário. Não houve conferência com o áudio, alinhamento temporal ou identificação formal de todos os falantes. O usuário informou que começou a gravar depois da metade da reunião e não garante 100% de exatidão. Isso é material novo de evidência textual provisória, não transcrição validada ou registro completo da entrevista.

As falas abaixo parecem pertencer à pessoa entrevistada pelo contexto, com Fabiana mencionada ao final. Manter essa atribuição como provisória. A relação exata deste texto com os arquivos `.m4a` ainda não foi verificada. O áudio original continua pendente de escuta/conferência; a leitura deste texto foi concluída.

## Conteúdo que o texto acrescenta

| ID | Passagem/localizador na transcrição | Entendimento provisório e limite |
|---|---|---|
| T01 | Início: “vai um técnico de processo” e “planilha ... Power BI” | Fluxo atual inclui consolidação por técnico de processo, Excel e Power BI. A visualização é retrospectiva, do dia anterior para trás. Não medir atraso exato ou tempo de trabalho sem amostra |
| T02 | “Mas eu quero ver em tempo real” e “hora a hora” | Necessidade de gestão: consultar a máquina da mesa e decidir se precisa intervir na linha durante a operação. Não se satisfaz apenas com atualização rápida de dados inseridos tardiamente |
| T03 | “a gente chama ela de NHPL”; “duzentos e noventa ... duzentos e oitenta” | Nome NHPL e exemplo de 290 peças/h previstas versus 280 realizadas. Grafia, identidade, produto/receita e caráter do número precisam de confirmação. Não cadastrar NHPL como piloto aprovado nem 290 como meta universal/homologada |
| T04 | “semiautomática ... muitos sensores”; “não deu pra fazer ... interface” | Relato de sensores e várias IHMs, com possibilidade de integração ainda não realizada. A frase “IoT tem” é genérica; não fornece fabricante, protocolo, tags, licença, exportação ou acesso autorizado. Não comprova os cinco dispositivos da pergunta original |
| T05 | “a gestão e liderança tem ... celular corporativo e computador. O operador não tem” | Dispositivos disponíveis para liderança/gestão segundo o texto. Tablet na linha é uma ideia desejável, não estoque confirmado para o operador |
| T06 | “melhor seria uma coleta automática ... se não ... facilidade ... dados do próprio operador” | Preferência por coleta automática; registro direto/facilitado pelo operador aparece como alternativa para reduzir transporte/transcrição e erros. Não constitui aprovação formal de qualquer alternativa específica de MVP |
| T07 | “me mandam ... Teams ... uma vez por dia”; “só o primeiro turno ... dois turnos” | Há relato de envio diário via Teams e operação atual no primeiro turno, com intenção futura de dois turnos. Frequência exata de captura das fotos não confirmada. “Ano que vem” é referência relativa: não fixar ano sem data da entrevista |
| T08 | Pergunta sobre manômetro/vacuômetro: “Hoje não tem ... aquele manômetro ... sugestão de uma nova tecnologia” | Relato sugere ausência atual de aquisição digital para esses instrumentos. Distinguir os sensores existentes na máquina da instrumentação específica de pressão/vácuo; substituição é proposta, não compra/autorização |
| T09 | Final: “paradas maiores ... consegue ... coletar ... problema são as microparadas” | Microparadas acumuladas são destacadas como dificuldade que afeta produtividade. Paradas por sensores/enroscos são exemplos do texto, sem taxonomia oficial ou causa técnica comprovada. Não há definição temporal de microparada ou quantificação do impacto |
| T10 | Final: “quinta-feira ... sexta-feira” e interrupção “oito e cinquenta” | Referências relativas, sem data formal. Não afirmar prazo do desafio ou agendar retorno a partir delas. A interrupção confirma a parcialidade da conversa, mas não recupera o trecho não gravado |

O trecho “E o desperdício alonga” pode ser erro de transcrição ou intervenção de outro participante. Foi preservado sem interpretar como dado técnico. Hesitações, frases interrompidas e a grafia NHPL permanecem no original.

## Cruzamento com as perguntas anteriores

Esta análise acrescenta pistas; não substitui o bloco literal de perguntas nem transforma a matriz anterior em respostas definitivas.

- **Prioridades:** T02/T09 destacam acompanhamento durante a operação, produção por hora e microparadas. Top três resultados e critérios medidos ainda não foram formalmente confirmados.
- **Piloto:** T03 fornece o nome NHPL como referência mencionada. Falta vinculá-lo ao material de selo/KVIEW, à linha Siemens/abafadores, a máquina/produto/receita e ao escopo aprovado.
- **Fluxo completo:** T01/T06 esclarecem o técnico de processo e a transcrição posterior, e sugerem coleta na origem. Ainda faltam alçadas, objeto da liberação e responsabilidades por etapa.
- **Coleta automática e acesso:** T04 relata possibilidade e sensores existentes. Continuam faltando interfaces, tags, frequência, responsável técnico e permissão de leitura.
- **Alternativa de coleta:** T06 indica preferência por automação e interesse em facilitar o registro do operador. Importação, OCR ou registro manual específico ainda precisam de validação.
- **Referência/CEP:** o trecho não responde natureza dos parâmetros, receitas, faixas, zonas 0/0, contramolde, direção do vácuo, método/amostras de Cp/Cpk.
- **Contadores:** T03 informa exemplo de produção horária, sem explicar ciclos/peças, cavidades, resets ou base bruta/boa.
- **Paradas/perdas:** T09 prioriza microparadas, sem definir seu limiar, início/fim, causalidade ou motivos oficiais. Não foram fornecidos valores de refugo/kg.
- **Condições de uso:** T05/T07 fornecem pistas sobre dispositivos, turno e canal de envio. Rede, instalação, segurança e tablet do operador seguem abertos.
- **Aprovação do MVP:** expectativa por uma boa solução não é critério de aceite nem aprovação técnica.
- **Andon:** não há resposta explícita no trecho.
- **Lista de dispositivos:** T04/T08 não confirmam o concentrador, transdutores, módulo térmico ou quatro sensores/acopladores propostos.

## Conferência com o aplicativo atual, sem mudanças

| Necessidade sugerida | Estado observado no código | Consequência |
|---|---|---|
| Produção hora a hora versus meta | `app/src/ui/main.js:402` agrupa o gráfico por `eventDate` (dia). `app/src/ui/forms.js:54` define metas por datas; `domain/indicators.js` avalia totais do período, sem perfil de meta por hora | Visão horária ainda não entregue. Registrar intervalos na produção é base técnica útil, mas não equivale a painel hora a hora |
| Informação da máquina no momento | `main.js` observa alterações do repositório; `operations.js` recebe registros digitais; integração CLP/IoT ausente | Tempo real dos registros do software existe; tempo real da máquina depende de captura frequente/direta e latência conhecida |
| Microparadas | Há início/encerramento manual, motivo e união de duração. Não há detecção automática, classificação por limiar, contador/gráfico específico. `forms.js` gera horários truncados ao minuto | Formulário atual não é solução demonstrada para captar interrupções muito curtas. Precisão em segundos e definição de evento precisam de atenção antes de alegar cobertura de microparadas |
| Leitura pela gestão | Interface responsiva e filtros máquina/processo/produto disponíveis | Compatível com consulta proposta; aparelhos/rede reais ainda não testados |
| Registro na origem como alternativa | Nova coleta e apontamentos já funcionam no aplicativo | Pode ser alternativa demonstrável; esforço/cadência/dispositivo precisam ser acordados |

A revisão anterior dos 13 entregáveis avaliou funções genéricas de um MVP. Ela não comprovou atendimento integral desta necessidade mais específica de controle horário e microparadas, que agora ficou mais clara. Essa distinção deve acompanhar a apresentação.

## Prioridade recomendada após este material

Recomendação provisória, sujeita à conferência do áudio e à empresa, sem implementação autorizada nesta etapa:

1. Dar prioridade a uma visão hora a hora: realizado versus meta, diferença, hora fechada ou em andamento e momento da última informação. A política da meta durante uma hora incompleta e a base bruta/boa precisam ser definidas. Não distribuir arbitrariamente um total diário entre horas.
2. Dar visibilidade às microparadas: eventos, duração, quantidade e efeito acumulado, com segundos e origem explícita. Não atribuir automaticamente todo déficit de produção a elas. Definir limiar, pausas planejadas e sinal de máquina rodando/parada antes da captura real.
3. Demonstrar a evolução do fluxo com dados sintéticos identificados quando faltarem dados/autorização: captura de eventos → painel atualizado → indicação de desvio → decisão da liderança. Isso pode demonstrar a proposta de integração, sem alegar conexão física instalada.
4. Manter análise de motivos/refugos, comparativos e relatório como complementos; hora a hora/microparadas passam à frente de QR ou relatório mais elaborado como recomendação de produto.
5. Tratar sensores já existentes como primeira opção a investigar antes de propor comprar instrumentação completa. A ausência relatada de aquisição digital de pressão/vácuo é um caso separado. Não assumir que toda a instrumentação de R$8.250 seja necessária.

Pontos a confirmar primeiro, derivados das perguntas anteriores: identidade da NHPL/piloto; 290 como meta e em quais condições; jornada/pausas/turno; definição de microparada e sinal disponível; tags/counters/exportação/permissão; confirmação das palavras incertas. Não houve envio de novas perguntas à empresa ou alteração do aplicativo.
