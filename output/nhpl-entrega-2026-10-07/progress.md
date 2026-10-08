# SDD ledger — plan: docs/superpowers/plans/2026-10-07-nhpl-primeira-entrega.md

Execução autorizada pelo usuário em 07/10/2026, nesta conversa.

Pre-flight: tarefas 2–6 compartilham contexto/ledger; 5–6 compartilham correções; 7–8 compartilham perfil e renderização. Assinaturas do plano serão preservadas.

Ruling: executar na pasta explicitamente indicada pelo usuário, sem substituir a cópia ou restaurar um bundle antigo. Revisão usará arquivos e testes, sem commit/publicação automática. Custo: não haverá SHAs locais de cada tarefa.

Ruling: quatro horários serão armazenados como janela operacional na primeira entrega; OEE completo permanece no bloco C, pois ciclo ideal e classificação de tempos não foram fornecidos. Custo: OEE fica indisponível, com motivo, em vez de um valor presumido.

Fontes externas conferidas: dez arquivos idênticos às cópias locais. Limites incompletos/invertidos de selos permanecem pendentes.

Baseline anterior nesta sessão: 112 testes, verificador estático 56 arquivos.

Tarefa 1: serviços de recorte e download assíncrono testados RED/GREEN (2 testes); regressões CEP e período/exportação aprovadas no navegador.
Tarefas 2–6: catálogo aditivo, políticas, plano, incrementos, fechamento, correções e produtividade implementados; testes de domínio RED/GREEN e teste SDK NHPL completo passam. Suite completa de emulador: 19/19, incluindo regressões legadas e concorrência NHPL.
Tarefa 7: navegação por papel e simulação NHPL com ator de preparação separado do efetivo implementadas; testes de unidade passam.
Tarefa 8: telas e CSV conectados; cenários NHPL, quatro horários, quantidade na janela, perfis, simulação, claro/escuro e 1440/768/390 px aprovados no navegador. CEP, data-tools e período/exportação também aprovados; evidências novas nesta pasta.
Tarefa 9: revisão independente concluída, regressões corrigidas e documentos de retomada atualizados. Relatório em docs/ENTREGA_NHPL_MSA.md. Verificação final: 133 testes de unidade, 19 testes de emulador e verificador estático sem erros. O antigo script access-profiles não foi executado contra a navegação nova; os quatro papéis foram conferidos pelo cenário NHPL atualizado.

Ruling: agrupar casos de serviço/domínio em nhpl-delivery.test.js e controles SDK em nhpl.test.js, sem criar arquivos redundantes para cada assinatura; riscos serão verificados por cenários e não pela contagem de arquivos.
Ruling: correções NHPL usam plannedCorrections, com o mesmo fluxo de análise e revisão, para preservar integralmente o contrato das correções legadas.
Ruling: revisão de plano com apontamentos é bloqueada nesta entrega; o original não é substituído silenciosamente. Ajustes de quantidade seguem correção auditada; outra programação exige novo período. Custo: replanejamento retroativo com conciliação precisa de evolução específica.
Ruling: agregado usa cadeia append-only sem cabeça mutável. Primeira posição reservada no cabeçalho, próximo slot escolhido pelo predecessor imutável; transação de criação no slot arbitra concorrência. Nenhuma escrita no agregado é concedida à Operação.
Verificador estático atual: 71 arquivos, sem erros. Nenhum deploy, publicação ou escrita no workspace real.

Revisão independente: distribuição do takt em restante de período agora usa piso acumulado; recuperação mantém intervalIndex como string. Cobertura de intervalo sem programação e IDs duplicados de confirmação têm regressões próprias. Revisões concorrentes suspendem os intervalos antigos por evento retire antes da revisão nova; restore só permite retomada se o plano original ainda for vigente. Testes SDK negam incrementos em revisão suspensa/substituída e arbitram concorrência.

Ruling: confirmação encerra incrementos, mas preserva próximo slot reservado para uma nova confirmação auditada. Uma correção decidida antes da confirmação e ausente da lista confirmada suspende a avaliação (confirmation-outdated); reconciliar acrescenta confirmação nova sem modificar o original. Testes de domínio e SDK cobrem a corrida e a recuperação.

Materiais: leitura sem edição; limites de selos não foram transpostos para NHPL. Nenhum SKU, protocolo, ciclo ideal ou limite industrial foi inventado. Quatro horários não são apresentados como OEE homologado. A operação remota continua dependente de publicação autorizada das regras/site e instalação aditiva conferida.

Verificação visual final: o teste móvel reproduziu bloqueio do botão de fechar pelo menu aberto. Adicionado fechamento por scrim acessível e Escape; teste de navegador agora cobre ambos e espera o fim da transição antes da captura. Novo GREEN: NHPL, período/exportação, CEP e data-tools; 133 testes de unidade e static 71 sem erros novamente. Emulador final: 19/19. Exportar no Planejamento NHPL utiliza o mesmo relatório de produtividade do dashboard.
