# Guia das funções do sistema MSA

Este guia explica o que a equipe produziu e como usar cada área na apresentação. Refere-se à entrega de 07/10/2026, com NHPL como piloto, linha Montagem e Processo de montagem do abafador. As famílias são Abafadores VGARD HP e MARK V, com variantes Low, Medium e High quando informadas no contexto.

Os registros disponíveis para apresentação são exemplos identificados, não resultados medidos na fábrica. Os limites reais da NHPL e as bases industriais completas do OEE continuam pendentes. O sistema permite demonstrar os fluxos sem tratar referências hipotéticas como aprovação da MSA.

## Acesso e contexto da consulta

**Entrar com RE.** Abra o menu da conta no canto superior e escolha Entrar com RE. Use a conta administrativa da apresentação. Em Configurações, confira que Cargo / acesso mostra Administração / Supervisão. O RE identifica a conta; o acesso vem do perfil autorizado, não do número digitado.

**Administração.** Reúne as funções de consulta, operação e equipe técnica: registrar produção, parâmetros, paradas, perdas e ocorrências; cadastrar e editar; planejar; revisar, corrigir e decidir análises. A exceção é aprovar a própria proposta de correção, que exige outra pessoa autorizada. Isso preserva a conferência independente.

**Outros perfis.** Operação registra e encaminha informações, mas não decide análises nem administra cadastros. Liderança, Engenharia e times técnicos autorizados têm funções operacionais e de revisão. Consulta acompanha informações sem registrá-las. As funções seguem o perfil efetivamente concedido à conta.

**Filtros.** Máquina, processo, produto e período determinam o que aparece. O contexto adicional reúne OP, lote, receita e turno. Campos vazios ampliam a consulta; não significam que registros de grupos diferentes devam ser misturados no CEP. Ao registrar, confira o contexto mostrado no formulário.

**No celular.** O botão de menu abre a navegação. As áreas se reorganizam verticalmente e as tabelas largas podem ser percorridas lateralmente dentro da própria tabela. Os formulários rolam sem esconder os botões de salvar e cancelar.

## Dashboard

**Produtividade.** Compara produção bruta com o plano aprovado. A meta informada é 95%. Um plano de 300 peças exige pelo menos 285 para alcançar essa meta. Peças boas e refugos aparecem separadamente: não se somam novamente à produção bruta.

**Gráficos.** Plano e produção por intervalo compara o plano, a produção bruta registrada e o mínimo da meta. Produção acumulada mostra a evolução dos totais nos intervalos consultados. A situação na tabela indica se houve confirmação; um incremento registrado não confirma sozinho o intervalo. Ausências interrompem a série acumulada, em vez de virar zero.

**Outras informações.** O resumo de OEE apresenta somente os intervalos com bases disponíveis e informa a cobertura. Parâmetros mostram leitura, faixa da versão e situação. A fila técnica mostra análises pendentes e permite abrir detalhes. O Dashboard é uma visão de acompanhamento; os registros de rotina estão em suas áreas próprias. Não existe comando para ligar fisicamente a máquina.

<!-- page -->
## Parâmetros

**Buscar e consultar.** A busca filtra pelo nome. Clicar em um parâmetro abre a última leitura, a referência usada, o histórico em gráfico e o resumo do estudo disponível. Leitura ausente, inválida ou referência pendente não recebe situação saudável inventada.

**Nova coleta.** Confira a máquina, o processo, o produto, a OP, o lote e o turno. O formulário lista os parâmetros ativos do processo; digite as leituras e confira a versão de cada referência. O momento do registro é incluído automaticamente. Campos vazios permanecem ausentes; o sistema não os transforma em zero. Salvar cria uma coleta que pode ser consultada no Histórico e encaminhada à Engenharia.

**Nova versão.** A equipe técnica pode definir unidade, natureza e limites. Medição representa uma característica observada; setpoint representa um ajuste. Uma nova referência cria outra versão, sem mudar a referência que acompanhava as coletas antigas. Limites reais desconhecidos devem continuar pendentes.

## Apontamentos

### Produção

**Resumo.** Mostra produção bruta, peças boas registradas, refugos em peças e perdas de material em kg, dentro da consulta. São informações separadas, não um total a somar. Ausência de apontamento aparece como Sem dados.

**Registrar produção.** Na NHPL, escolha um intervalo aprovado ainda aberto. Informe quantidade, base Bruta ou Boas e início e fim do apontamento. Cada envio acrescenta um incremento; não substitui os anteriores. Se todos os intervalos estiverem fechados ou não houver plano compatível, o sistema explica por que não há intervalo disponível.

**Registrar refugo ou perda.** Escolha tipo, unidade, quantidade e motivo cadastrado. Refugo em peças não é perda de material em kg. Retrabalho também é distinto de descarte. O registro fica disponível na aba Perdas e no Histórico.

**Horários da operação.** Registre separadamente quando a máquina foi ligada, quando a produção começou, quando a produção terminou e quando a máquina foi desligada. Registrar horários inicia a janela; Completar horários registra o próximo momento. Isso documenta acontecimentos: não envia comandos à máquina. Os horários devem seguir a ordem e não podem estar no futuro.

### Paradas

**Registrar parada.** Informe início, OP, lote, turno, motivo selecionável e se a parada foi planejada. O resumo distingue paradas abertas e duração dos registros encerrados no período consultado. Uma parada aberta não recebe duração final presumida.

**Encerrar.** Informe o horário final e confirme a retomada com peça boa validada quando exigida no piloto. O motivo permanece associado ao registro. Detalhes permite consultar contexto, autor e histórico; correções de paradas são propostas após o encerramento.

### Perdas Hora a hora e Ocorrências

**Perdas.** Lista quantidade, unidade, motivo e origem. É a área própria para consultar e registrar refugo, material perdido ou retrabalho.

**Hora a hora.** Mostra os intervalos reais do plano, que podem ser de 15, 30 ou 60 minutos. Exibe plano, produção bruta, boas, refugo, percentual, meta, peças faltantes e situação. Apontar acrescenta produção; Confirmar confere o total bruto ao final. Uma confirmação não deve ser enviada antes da conferência. Correção posterior pode exigir Reconciliar para renovar essa conferência.

**Ocorrências.** Escolha Processo, Qualidade, Manutenção ou Segurança e descreva o fato. Histórico mostra o tratamento. A equipe técnica pode iniciar análise, concluir ou solicitar nova análise, registrando justificativa.

<!-- page -->
## Planejamento

**Novo plano.** Informe OP, lote, turno, família, variante quando conhecida, início, fim e tamanho dos intervalos. A quantidade pode ser informada diretamente ou sugerida pelo takt vigente. O takt informado é 12 segundos por peça; ele auxilia o plano e não é tratado automaticamente como ciclo ideal do OEE.

**Conferir e aprovar.** O primeiro envio apresenta uma prévia da quantidade e dos intervalos, incluindo a pausa planejada informada. Confira o contexto e as quantidades, marque a confirmação e só então aprove. Aprovar disponibiliza os intervalos para os apontamentos.

**Revisar.** Cria uma revisão com motivo, sem apagar a anterior. Conferir intervalos reconcilia o plano com seus intervalos. Retomar intervalos aparece quando há intervalos retirados que podem ser recuperados conforme as regras do plano. Revisões com produção já registrada podem exigir conciliação; não se deve alterar o passado silenciosamente.

**Metas e takt.** Nova política registra indicador, valor, início da vigência e fonte. Revisar mantém a anterior e registra o motivo. A meta de 95% e o takt de 12 segundos são decisões documentadas; outras alterações só devem ser feitas com fundamento e vigência apropriados.

**Janela operacional.** O planejamento também permite consultar a janela e registrar seus horários manualmente. O ponto de rotina para esses quatro horários está na aba Produção dos Apontamentos. Nenhuma das duas áreas controla a máquina física.

## Engenharia

**Análises.** A tabela apresenta o escopo, a situação e uma ação coerente com essa situação. Iniciar passa uma solicitação de Aguardando análise para Em análise. Decidir exige decisão e justificativa. Uma análise concluída não fica com ação inexplicavelmente vazia: apresenta Concluído e mantém seus detalhes.

**Nova análise.** Escolha uma coleta do contexto, descreva o que precisa ser verificado e envie. Uma nova necessidade pode gerar outra análise; não é necessário sobrescrever a decisão anterior. O estudo CEP também pode ser encaminhado à Engenharia.

**Evidências.** Permite registrar plano de controle, inspeção, ensaio, performance do produto e justificativa vinculados à análise. Esses campos documentam a conferência humana; não são laudos automáticos nem autorização física para produção.

**Correções.** Um registro pode receber uma proposta de alteração com motivo. Antes de decidir, o responsável vê o original e o proposto. Outra pessoa autorizada aprova ou rejeita com justificativa. O autor da proposta, inclusive administrador, não pode aprová-la. O original permanece preservado, e a correção aprovada passa a ser considerada nas consultas afetadas.

**Ocorrências.** Reúne o acompanhamento dos fatos registrados pela operação e suas decisões. O tratamento não depende de texto livre para motivos de parada: paradas continuam usando o cadastro de motivos.

<!-- page -->
## CEP e capacidade

**Selecionar o estudo.** Escolha a fonte, o parâmetro e a versão com seu contexto. Registros do sistema e planilha histórica são fontes diferentes. Uma versão ou um lote diferente não deve ser misturado para aumentar artificialmente a amostra.

**Cp e Cpk.** Cp compara a dispersão do processo com a faixa de especificação; Cpk também considera o deslocamento da média em relação aos limites. A página apresenta esses dois índices, sem Pp e Ppk na interface principal. Os resultados são estimativas para análise, não aprovação industrial automática.

**Condições.** O estudo NHPL exige ao menos 30 observações válidas. É preciso uma característica medida, referência aprovada com limites bilaterais válidos e uma sequência adequada. Setpoint, ausência de limites, unidade incompatível, amostra insuficiente, dispersão zero, conflitos ou sinais de instabilidade podem impedir os índices. A página explica o motivo em vez de inventar um resultado.

**Cartas e observações.** A carta de Individuais mostra os valores e os limites calculados do estudo. A carta de Amplitude móvel mostra a variação entre observações consecutivas. A tabela conserva os valores originais, as correções e os sinais encontrados. Leituras ausentes interrompem pares consecutivos.

**Coleta por turno.** Mostra se existe coleta nos turnos planejados. Uma coleta por turno é a frequência informada; isso não significa exigir 30 peças medidas em cada turno. O método real de amostragem ainda deve ser conferido com a equipe técnica.

**Definir nova referência da Engenharia.** O formulário abre com parâmetro, unidade, natureza e faixa da referência do estudo selecionado, quando ela existe. Na apresentação, essas faixas são hipotéticas. O formulário começa como Rascunho, aguarda conferência e envio explícito, e cria uma versão nova. Se não houver referência, o sistema não inventa os limites faltantes.

**Exportar estudo.** Gera um arquivo com o resumo e as observações do estudo, incluindo contexto, origem, referência e eventuais impedimentos. A planilha fornecida possui observações históricas sem horário; confirmar a ordem é uma responsabilidade humana e não transforma essas linhas em coleta ao vivo.

## Indicadores

**OEE.** Reúne Disponibilidade, Desempenho e Qualidade. Disponibilidade trata o tempo produtivo disponível; Desempenho depende do ciclo ideal validado e da quantidade; Qualidade depende das boas de primeira passagem. O OEE combina essas três parcelas. Registrar apenas os quatro horários da operação não fornece, sozinho, todas essas bases.

**Referência de OEE.** A equipe técnica informa ciclo ideal, critério de microparada, vigência e fonte. Takt de 12 segundos não preenche automaticamente o ciclo ideal. Para a NHPL real, o que não foi validado permanece pendente. Os exemplos existentes permitem mostrar o cálculo, sem representar desempenho da fábrica.

**Inspeção e cobertura.** Registra boas de primeira passagem e evidência, além da confirmação da cobertura do histórico de falhas e paradas. O quadro mostra quantos intervalos podem ser avaliados; um resultado parcial não representa todos os intervalos.

**Classificar parada.** Define perda de disponibilidade, pequena parada de desempenho ou tempo fora do plano. Quando houver falha, registra início e fim do reparo. MTBF e MTTR dependem desse histórico completo e classificado; falta de registro não significa ausência de falha.

**Memória CSV.** Exporta as bases dos cálculos para conferência. Microparadas e sua duração ficam separadas dos percentuais. Nenhuma alteração nessa área aciona a máquina.

<!-- page -->
## Histórico

**Consultar por tipo.** As abas separam Coletas, Produção, Paradas, Perdas, Análises e Correções. Os filtros mantêm o contexto e o período. As linhas mostram informações do registro, vínculos, autor e origem; Detalhes amplia o que não cabe na tabela.

**Detalhes.** Permite conferir máquina, processo, produto, OP, lote, turno, variante, autor, origem, horários, motivo e correção aplicada, conforme o tipo. Nas coletas, mostra leitura original e referência da versão. Nas análises, mantém as decisões e suas justificativas.

**Propor correção.** Abra um registro elegível, altere os campos permitidos e justifique. Isso cria uma proposta, não apaga o original. Registros em conflito ou já corrigidos precisam da análise apropriada; não ficam liberados para reescrita indiscriminada.

**Enviar à Engenharia.** A coleta pode ser encaminhada com o escopo do que deve ser verificado. Importar CSV permite conferir linhas, fonte, unidade e contexto antes de confirmar a gravação. Dados repetidos não devem gerar outra cópia da mesma importação.

**Exportar.** Baixa os registros consultados em arquivo para análise e apresentação. Não transforma exemplos em dados operacionais e não substitui o histórico de decisões.

## Cadastros

**Máquinas.** Novo cadastro informa nome e código. Editar corrige os metadados. Inativar retira do uso corrente sem apagar o histórico; Ativar permite retomar o cadastro.

**Processos e produtos.** Um processo é vinculado à máquina; um produto é vinculado ao processo. Esses vínculos são necessários para registrar no contexto correto. Cadastrar uma máquina isolada não cria automaticamente processos, produtos, zonas ou leituras.

**Parâmetros.** Cadastra a característica monitorada e seu processo. Limites abre a criação de uma referência versionada. Nome, unidade, natureza e faixa precisam ser coerentes; referência hipotética não equivale a limite real homologado.

**Motivos.** Organiza as opções de parada, refugo, perda de material e retrabalho. A seleção padronizada reduz descrições diferentes para o mesmo fato e facilita a análise.

**Metas.** Registra limites de indicadores com unidade, comparação, contexto e período. Revisar mantém o histórico de vigências. As metas contextuais não substituem o plano aprovado nem a referência do OEE.

**Cadastrar piloto NHPL.** Disponível para Administração, confere a inclusão do piloto e seus vínculos. É um cadastro adicional que preserva históricos anteriores, incluindo T20 e o processo de selos. Não cria limites reais ou medições automaticamente.

<!-- page -->
## Configurações

**Perfil.** Exibe RE inalterável, nome e cargo de acesso. O email não aparece nessa página. Salvar perfil atualiza o nome da própria conta autenticada; não muda o cargo nem concede permissões. Alterar senha mantém a confirmação necessária da identidade e deve ser concluído pelo titular.

**Aparência e acessibilidade.** Claro, Escuro e Sistema escolhem o tema. VLibras permite ativar a tradução em Libras quando o serviço estiver disponível. Tabelas compactas altera a densidade da consulta. Essas escolhas não modificam os dados.

**Consulta.** Define o período inicial e permite restaurar as preferências. A seleção do período não preenche produção inexistente.

**Gestão de dados.** Reúne o acesso à Importação de dados e a exportação de backup do conjunto de apresentação. O backup inclui registros e sua origem. Ele não foi removido do sistema: saiu da faixa repetida nas páginas de trabalho. O conjunto de apresentação permanece separado da base operacional.

## Importação de dados

Esta é a antiga área Coleta, agora acessada por Configurações. Não é o formulário manual dos parâmetros, que fica em Parâmetros. Ela recebe arquivos de eventos e acompanha uma fonte preparada pelo responsável pela integração.

**Importar eventos.** Permite conferir um arquivo ou conteúdo JSON de eventos e confirmar origem, contexto e horários antes de enviar. Eventos repetidos não duplicam registros. Um conflito interrompe o lote; os eventos já aceitos ficam registrados. Os diagnósticos de sequência ajudam a identificar lacunas.

**Conectar pasta local.** Consome uma fila produzida pelo conector local previamente configurado e mantém acompanhamento enquanto ativo. Pausar conector interrompe esse acompanhamento. Essa opção depende do conector em execução e da origem configurada; não descobre a máquina ou suas zonas por conta própria.

**Estado da fonte.** Informa origem, horário mais recente, sequência, perda de comunicação e eventuais lacunas. Fonte conectada ou Firebase disponível não comprova integração física com a NHPL. O método real de aquisição ainda precisa ser validado na empresa.

## Painel TV

Abra Indicadores e clique em Abrir painel TV. A tela reúne contexto, período, estado da fonte, produtividade e resumo dos indicadores, sem o menu habitual. Tela cheia amplia o acompanhamento; Voltar ao painel retorna a Indicadores. A TV usa o mesmo contexto consultado, não uma base de dados diferente.

## Cuidados para a apresentação

1. Entre na conta administrativa e confira o cargo em Configurações antes de começar. A consulta inicial sem login não disponibiliza as funções de edição.
2. Use NHPL, Processo de montagem do abafador e o produto desejado. Preserve OP, lote, turno e período do roteiro.
3. Diferencie exemplo de apresentação, parâmetro real pendente e decisão humana. Não anuncie os valores de OEE ou Cp/Cpk didáticos como resultados da fábrica.
4. Ao testar registros, confirme o contexto e a origem. Dados de apresentação ficam neste navegador; outro navegador não recebe automaticamente o mesmo conjunto local. Compartilhamento operacional depende da base conectada e autorizada.
5. Prepare um intervalo aprovado aberto caso queira registrar produção ao vivo. Intervalo já confirmado não fica disponível para novos incrementos. Propostas de correção próprias aguardam outra pessoa autorizada.

Kauan e Riquelme cuidam do sistema; Samuel, da automação; Maria Clara e Beatriz, da apresentação. Este guia ajuda todos a explicar o produto, sem exigir vocabulário de programação.
