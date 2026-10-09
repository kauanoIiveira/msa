# MSA — dados e acabamento para avaliação

Extensão solicitada diretamente pelo usuário após testar a entrega essencial. Preservar commits/dados/identidade MSA/Pages. Sem Mapa/Chat, hardware ou aprovações falsas. Exemplos rastreáveis no Firebase. A autorização anterior dos exemplos persiste.

## Task 1: Busca, Relatórios e Equipamentos

Corrigir busca produto/OP/lote/turno no seletor: input e filtro de máquina devem atualizar lista imediatamente, com normalização ptBR/acento/trim e rótulos de turno. Preservar consulta versus gravação/drafts. Conferir os controles tocados no browser.

Relatórios: manter modelo BI/exportação já verificados; substituir tabela crua de IDs internos longos por prévia com data/hora, produto, OP/lote, leituras/unidades e Scrap/base, ID e rastreabilidade em detalhes acessíveis; tabela MSA com cabeçalhos e scroll próprio, contagem/estado vazio/reload sem escopo alterado.

Equipamentos: informações/acesso do print rival, aparência própria. Busca por código/nome/produto; setor/processo derivado de cadastro verdadeiro; situação e ordenação; limpar filtros; totais encontrados, produção registrada/intervenção/alertas conforme evidência, sem fingir sinal físico. Tabela com equipamento/código/produto, setor/processo, situação/pendências, boas, plano/meta existente, OEE do período consultado e detalhes. Métricas por máquina/processo/consulta vindas do projector comum, cobertura diagnóstica quando faltar; não somar médias/taxas nem chamar dados históricos de hoje. Detalhes com leituras/unidades/tempo/contexto, produções e ações explícitas consultar/registrar/ver histórico. Nenhum mapa. Ativo cadastrado não vira operação automática. Preservar revisão conflitante/horário ambíguo. Cp/Cpk da versão aprovada com dados suficientes deve ser a série escolhida para apresentação, sem hardcode/fallback fictício.

Testes focais para filtrose/consulta/rollup/fonte, browserdesktopmobile. Commit+relatório.

## Task 2: Exemplos adicionais e capacidade calculada

Revisão aditiva após presentation_20261008_v1_rev_machines: dados próprios de parada/análise/correção/ocorrência visíveis na consulta atual de três máquinas. Preferir novos casos fechados no espaço de turno3 ainda não programado, preservando planos e coletas antigas e sua cobertura; quantidades/refugo/retrabalho/primeirapassagem reconciliados, planos/inspeções/referências/cobertura novas pelos serviços. Versões de exemplo com limites bilaterais aprovados criadas pelo serviço já autorizado; >=30 leituras homogêneas com dispersão e limites coerentes, Cp/Cpk finitos calculados por funções existentes. Receita/referência técnica registra origem de exemplo sem homologação. Não inventar approver, não autoaprovar correção: requests pendentes com motivo, análises waiting/analyzing, ocorrências open/analyzing/resolved quando serviço permite mesmo ator.

Publicação authenticatedSDK por publicador atual, CLI dryrun/revisão/apply mesmoenvelope/backup/hash/retry/secondsession; nenhum Admin/rawcloudwrite/credencial em arquivos. Validação antiga restrita aos casos antigos; novos casos validados separadamente, não forçar antiga função 90/70. Exemplos técnicos ligados aos eventos do próprio incremento. Testes focais/hash/rules existentes; controladordeploy se necessário e aplicação após revisão. Completar testes globais/revisão e docs/evidência, noPagespushsem autorização. Não chamar versão em rascunho apta Cp/Cpk.

## Ajuste posterior explícito do usuário

Cp/Cpk já funciona; remover qualquer alteração/teste/seed dedicado à capacidade estatística desta extensão. Task2 passa a ser apenas exemplos de paradas/análises/correções/ocorrências com publicação aditiva segura; não criar versões ou medições novas só para Cp/Cpk.

Task1 também revisa visibilidade do cabeçalho: bloco Registrar em somente páginas operacionais de apontamento (Parâmetros, Produção quando apropriado, Paradas, Qualidade e Captura) e sempre no formulário de gravação. Visão geral/Indicadores/CEP/Engenharia/Histórico/Relatórios ficam com contexto de consulta; Equipamentos usa filtro de período/setor/situação do catálogo, não uma máquina de gravação fixa; Cadastros/Configurações não precisam dos dois blocos. Painel TV mostra seu título/período compacto, sem cartão de registro. Ações de gravação em páginas de consulta abrem formulário com contexto explícito e acesso Escolher produção quando necessário; esconder cartão nunca perde seleção ou rascunho. Enxugar consultas por rota sem esconder o período que governa indicadores/exportação.

## Precisão de escopo — última orientação

Cp e Cpk permanecem no sistema e na entrega; já estão funcionando. Nenhuma função, tela, exportação ou capacidade existente será excluída. Somente não haverá revisão ou alteração adicional dedicada a Cp/Cpk nesta extensão.

## Task 3: Retomada com relógios de auditoria reais

Bug descoberto na aplicação real, depois da correção das regras: review.history[índice].at é timestamp do servidor, enquanto preview carrega placeholder. Não tratar esse relógio como conteúdo operacional. Normalizar somente at dos eventos numéricos do histórico de análise, mantendo state/by/justification, IDs e todos os instantes operacionais no digest. Preservar os eventos de histórico já gravados e seus timestamps ao avançar a análise; somente o novo evento recebe relógio do servidor. Nenhuma mudança de papéis, dados antigos ou payload de exemplo.

A revisão evaluation ainda não tem manifesto publicado; quatro caminhos novos existem. Preparar novo envelope somente da mesma revisão e mesmos comandos/baseline protegidos do envelope original, recalculando seus novos digests após a correção. Verificar hash original do envelope/backup, ator autenticado idêntico, manifesto não publicado, preservação dos dados externos e hashes herdados; não trocar revisão nem excluir registros parciais. Salvar envelope novo privado, mantendo o original. Aplicar novo envelope deve reconciliar os quatro caminhos e completar sem duplicação. Se manifesto já estiver publicado, não remapear digests históricos.

TDD: simular/usar emulador com timestamps efetivos diferentes entre preview, criação e transições; persistir/reler/history imutável, retomar/repetir, estado/autoria/justificativa adulterados continuam rejeitados; at operacional continua protegido. CLI modo de reprepare apenas leitura antes do apply, sem credenciais em arquivos. Conferir por teste real review variant no SDK. Commit/relatório Task3, revisão focal e publicação pelo controlador.
