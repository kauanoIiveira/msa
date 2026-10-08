# MSA — jornada coesa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Preferir executing-plans, na conversa atual, sem delegação automática. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar a experiência completa aprovada para o MSA, incorporando as capacidades úteis do MSE, com contexto intuitivo, exemplos persistidos no Firebase e relatórios coerentes.

**Architecture:** Três subprojetos incrementais usam os serviços e a auditoria existentes. O primeiro estabelece contratos de contexto, fonte e cobertura; o segundo acrescenta operação/coordenação; o terceiro completa indicadores, BI e Excel. Não construir bases ou fórmulas paralelas por tela.

**Tech Stack:** Node >=22, JavaScript ES modules, HTML/CSS, Firebase RTDB/Auth, PapaParse, Chart.js, Lucide, estatística atual do MSA; biblioteca XLSX/ZIP apenas na tarefa de Excel, com versão/licença fixadas.

**Spec:** `docs/superpowers/specs/2026-10-08-msa-jornada-coesa-design.md`.

## Global Constraints

- Manter a identidade visual MSA, temas, gráficos e painel TV; não copiar código, marca ou ativos do MSE.
- Não criar Mapa da Planta nem Chat.
- Uma única experiência principal, sem seletor real/simulado e sem geração contínua iniciada no login.
- Preservar dados existentes, quatro perfis, proibição de autoaprovação, versões, evidências, históricos e 17 cenários técnicos.
- Ausência não equivale a zero; exemplos têm origem rastreável no histórico, na gestão técnica e nas exportações.
- Produtividade bruta = brutas/planejadas; takt 12 s não é ciclo ideal; OEE usa primeira passagem e referências válidas.
- Turnos 07–15, 15–23 e 23–07, America/Sao_Paulo; o terceiro turno pertence à data em que começa.
- Não ratear quantidades sem detalhe; não somar taxas; não misturar kg, peças, contextos ou unidades incompatíveis.
- T20/selos mantém Z1–Z21 e instrumentos no próprio contexto; NHPL mantém VGARD HP e MARK V sem herdar seus limites.
- Não alterar contas, senhas ou memberships; cadastro de equipe não concede acesso.
- Não enviar comandos físicos, não ativar OCR e não enviar fotos a serviços externos.
- Node >=22, módulos JavaScript existentes, Firebase RTDB/Auth e HTML/CSS atuais; dependência nova somente quando necessária ao Excel e registrada com versão e licença.
- Compatibilidade GitHub Pages: publicar somente app estático, assets/imports relativos ao subcaminho /msa/, rotas por hash recarregáveis, downloads no navegador e Firebase externo; nenhum servidor Node necessário no uso.

## Review Focus

1. Período inicial depois das 17h/meia-noite/dia seguinte: números do pacote persistido continuam verificáveis; plano futuro não contamina o período concluído — plano 1, tarefas 3–6.
2. Navegador antigo, plano sobreposto ou rede interrompida: preservar armazenamento/rascunho, diagnosticar conflito e retomar sem duplicar — plano 1, tarefas 2, 4 e 5.
3. Troca de contexto com formulário aberto, produto diferente ou histórico sem novo cadastro: não alterar evento anterior nem registrar no contexto errado — plano 1, tarefas 1 e 6.
4. Correção/segregação/retrabalho e falha atravessando turno: invalidar bases afetadas, evitar refugo duplo e conservar contagens dos contratos — plano 2, tarefa 2; plano 1, tarefa 3; plano 3, tarefa 2.
5. Exportação grande, números negativos e taxas repetidas: preservar todos os registros, tipos e denominadores; não multiplicar fatos ao associar coletas — plano 3, tarefas 2–4.

## Estado e execução

Este índice e os planos derivados são propostas escritas, preparadas por solicitação expressa das duas skills. Não significam implementação iniciada ou autorização presumida sobre artefatos novos. A escolha de exemplos completos já foi feita pelo usuário; não refazer essa pergunta.

Base de leitura: `C:\Users\Kauan\Desktop\msa-master`, sem `.git`. Antes de executar, usar checkout Git conferido em `a231c145bbe34101358e6ba83b58862ae751af7b` ou sucessor explicitamente verificado, incluindo os materiais locais preservados. O checkout do cwd em `69f674a` está antigo. Não executar pull/reset sobre alterações do usuário, não inventar commits da cópia Desktop e não publicar sem registrar o resultado. Se houver branch nova, usar prefixo `codex/`.

Os caminhos de código nos planos são relativos à raiz MSA conferida. Comandos pressupõem Node no PATH do terminal de execução. Neste computador o runtime verificado está em `C:\Users\Kauan\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`. Não instalar dependências ou sincronizar checkouts durante a revisão do plano.

## Entregas derivadas

1. [Contexto, Firebase e dados completos](2026-10-08-msa-contexto-firebase-dados.md): seis tarefas; entrega jornada utilizável com fonte compartilhada e confiabilidade calculável.
2. [Operação e coordenação](2026-10-08-msa-operacao-coordenacao.md): seis tarefas; entrega qualidade de lote, equipe, passagem, ocorrências e atendimento de pendências.
3. [Indicadores, BI e apresentação](2026-10-08-msa-indicadores-bi-apresentacao.md): cinco tarefas; entrega instrumentos, CSVs normalizados, Excel, consolidação e QA integrado.

Dependências: plano 2 depende dos contratos/contexto do plano 1; plano 3 depende dos dados do plano 1 e integra os eventos do plano 2. Cada plano deve terminar com software funcional e validação própria; não preparar telas sem serviço e chamá-las de entregues.

## Matriz de cobertura do pedido

| Pedido/capacidade | Tarefa responsável |
|---|---|
| Ordem/lote/receita intuitivos; consulta separada de registro | 1.1, 1.6 |
| Uma experiência, exemplos completos no Firebase | 1.2, 1.4, 1.5 |
| MTBF/MTTR, OEE, produtividade e recorte completos | 1.3, 1.4, 3.1 |
| Equipamentos por setor, situação e detalhe | 1.6, 3.1 |
| Produção/resumo/turnos/hora a hora/apontamentos/planejamento/horários | 1.6, 3.4 |
| Paradas/em andamento/microparadas/classificação/reparo | 2.1 |
| Qualidade/refugos/material/lotes/inspeções | 2.2 |
| Ocorrências e investigação | 2.3 |
| Funcionários/presença/alocação | 2.4 |
| Passagem e recebimento de turno | 2.5 |
| Notificações/atendimento/som opcional | 2.6 |
| Indicadores/metas/comparação/TV | 3.1, 3.5 |
| Parâmetros completos, Z1–Z21, pressão, vácuo e tendências | 1.4, 3.1 |
| CSV coleta com % Scrap e BI sem duplicação | 3.2 |
| Excel de capacidade, modelo e normalidade | 3.3 |
| Conferência e consolidação | 3.4 |
| Histórico/pesquisa/paginação/configuração/perfil/tema | 1.6, 3.4, 3.5 |
| Preservar CEP, engenharia, limites, correções, importação, backups | Todos; regressão final 3.5 |
| Conector/IoT e foto como etapas já documentadas | 3.1; sinais físicos/OCR permanecem dependências explícitas |
| Mapa e Chat | Excluídos; navegação testada em 1.6 e 3.5 |

## Gate final de entrega

- [ ] Completar todas as tarefas aplicáveis dos três planos, sem declarar preenchimento Firebase quando houver apenas fixture local.
- [ ] Reexecutar `node --test tests/unit/*.test.js`, `node scripts/run-emulator-tests.mjs`, `node scripts/verify-static.mjs --deploy`; registrar contagem/exit code reais, incluindo novos testes.
- [ ] Executar pelo navegador a jornada e os downloads descritos no plano 3; comparar arquivos com as fontes e capturar telas desktop/celular.
- [ ] Verificar em duas sessões autorizadas a publicação no Firebase: mesmos IDs, atualização, reconexão e persistência. Se o segundo computador não estiver disponível, declarar a parte não comprovada; duas fixtures não valem como essa prova.
- [ ] Produzir `docs/ENTREGA_JORNADA_COESA_2026-10-08.md` com matriz implementado/verificado/dependência e manifesto de carga sem credenciais.
- [ ] Atualizar handoff de continuidade com caminhos, versão, testes, publicação real e pendências, preservando documentos anteriores.
- [ ] Integrar pelo fluxo Git já autorizado para a execução; enviar/publicar apenas quando houver autorização pertinente. Criação de PR exige anexar o PR à conversa; não criar PR apenas para cumprir o plano.

## Auto-revisão dos planos

Cobertura: a matriz inclui todas as páginas/cargos observados do MSE fora das duas exclusões e conserva diferenciais do MSA. Interfaces comuns estão na spec; cada tarefa acrescenta assinaturas e consumidores. Casos de borda do Review Focus possuem testes designados. Não há tarefa de redesenho cosmético isolado nem teste que apenas conte classes CSS. Os testes verificam vínculos, cálculo, eventos e jornada; QA visual verifica layout. O preenchimento só acontece após backup/prévia e testes das permissões existentes. O maior risco continua sendo a validação do Firebase real; está como gate de entrega, não como resultado presumido.
