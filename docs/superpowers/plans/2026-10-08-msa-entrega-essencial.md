# MSA — apresentação essencial

Spec: `docs/superpowers/specs/2026-10-08-msa-jornada-coesa-design.md`, alteração de escopo de 08/10 autorizada pelo usuário.

Requisitos comuns: identidade MSA; nenhum Mapa/Chat; consulta independente do contexto imutável de registro; dados compartilhados Firebase; cálculos únicos já existentes; ausência não vira zero; exemplos com origem técnica/exportável; sem novas credenciais, membros ou rollback; funcionamento estático no subcaminho /msa/ e rotas hash. Não executar os módulos adiados nos planos anteriores.

Dependência: finalizar plano1 Task7 (máquinas com dados) e revisar antes de implementar este plano. A publicação aditiva e o deploy de regras revisadas são do controlador.

## Task 1: Coleta, indicadores e paradas claros

Consolidar acabamento das telas existentes que compartilham main.js e Selection; sem novo subsistema de instrumentos, foto, zonas ou metas fictícias. Usar a projeção comum de métricas. Mostrar unidade/período, referência disponível, última leitura e horário, diagnóstico específico quando faltar tolerância. Distinguir total aprovado de primeira passagem/retrabalho na explicação de OEE. Visão geral/Indicadores/TV mantêm mesmos números. Paradas: resumo, abertas, microparadas e histórico legíveis; motivos e reparos visíveis, ações existentes vinculadas ao contexto de registro, classificação técnica por perfil. Rejeitar reparo sem falha e datas inválidas; usar classificação cronológica e união temporal existentes. Não criar produção com relógio da tela. Testes focais para regras de reparo, resumo e consistência; smoke de navegação real. Preservar ações existentes, limites, correções e CEP. Commit e relatório com arquivos/testes/limitações.

## Task 2: CSV de coletas e fatos BI com % Scrap

Implementar os contratos de `2026-10-08-msa-indicadores-bi-apresentacao.md` Task2, cujo brief já está preparado. Coletas com contexto, parâmetros/unidades, origem, IDs/correções e taxa não aditiva por escopo completo; fatos separados de produção/perdas/paradas/indicadores. Refugo peças / bruto confirmado do MESMO contexto, OP/lote/receita/dia operacional/turno e cobertura. Excluir material kg, segregação e retrabalho do numerador; preservar zero e números negativos. Exportação BOM, ponto-e-vírgula, CRLF, pt-BR e proteção contra fórmula em texto. Não truncar silenciosamente. Relatórios com filtro/prévia/contagem e download real; preservar importação/CSV atuais. Testes de denominador, correções, isolamento de escopo, turno noturno e números negativos; dicionário e comparação do download com dados Firebase. Commit e relatório.

## Task 3: Verificação e entrega

Controlador executa unitários completos, emulador e validação estática de deploy, smoke desktop/móvel e rotas sob /msa/, coleta/consulta/relatórios/TV, download CSV parseado e contraste com fontes. Provar publicação aditiva Firebase, reload em segunda sessão, repetição sem duplicação e preservação dos registros existentes. Registrar limites (mesma conta em duas sessões não são duas pessoas/computadores; compatibilidade Pages não significa site publicado). Revisão final da branch; correções necessárias em uma onda com re-revisão focal. Documentar entrega e retomada; manter pendências adiadas explícitas. Sem novo Excel/foto/coordenação. Não repetir teste já verde sem mudança/risco. Não alegar conclusão com teste falho ou etapa não comprovada.
