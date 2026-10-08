# Entrega NHPL — 07/10/2026

Estado: primeira entrega implementada e validada **localmente**, na cópia `C:/Users/Kauan/Desktop/msa-master`. Não houve commit, push, deploy de regras/site, recriação de contas ou instalação do piloto no workspace real. A especificação já estava aprovada; o usuário autorizou a execução do plano nesta conversa.

## Funcionalidade entregue

- Catálogo adicional NHPL · Montagem de abafadores, famílias VGARD HP/MARK V; variantes opcionais Low/Medium/High. Administração confere uma prévia antes de instalar. T20/selos, vínculos e medições históricas não são renomeados nem migrados para NHPL.
- Planos aprovados por máquina, período, família, OP, lote e turno; intervalos de 15/30/60 minutos e restante do período. Quantidade informada prevalece. Sugestão por takt usa 12 s/peça quando essa política está cadastrada e vigente; pausas planejadas são descontadas pela união dos tempos. Paradas imprevistas não alteram o plano aprovado.
- Políticas de produtividade e takt com valor, contexto, fonte, vigência, autor e revisões imutáveis. Meta inicial de referência: 95%. Uma hora líquida/12 s sugere 300 peças; mínimo de 285. 284/300 permanece abaixo da meta, independentemente do arredondamento exibido.
- Incrementos de produção bruta e peças boas separados, zero explícito permitido, refugo/perda com unidade preservada. Apontamentos NHPL exigem plano aprovado; não são duplicados na raiz legada de produção.
- Confirmação explícita de intervalo concluído e do total bruto efetivo. Depois dela, novos incrementos são bloqueados; correções passam por proposta e decisão de outra pessoa. Confirmação desatualizada por decisão concorrente suspende a avaliação e oferece reconciliação, sem sobrescrever a confirmação original.
- Produtividade ponderada sobre o plano aprovado, mínimo, saldo, excedente, cobertura, fonte/revisões e estados Programado/Parcial/Confirmado/Indisponível/Sem programação/Inconsistente. Boas e sucata não são somadas ao bruto. Metas diferentes permanecem segmentadas; recortes parciais não rateiam produção observada.
- Quatro horários auditados: máquina ligada, produção iniciada, produção encerrada e máquina desligada. A janela permite consultar peças brutas inteiramente contidas entre início/fim da produção; registro cruzando a janela ou dados incompletos deixam o total indisponível, sem rateio.
- Paradas manuais com seleção de motivo e indicador de planejamento, sem relato obrigatório. Cadastro de motivos pela Administração. OP/lote/turno aparecem nos formulários NHPL; justificativa é conservada nas correções e decisões.
- Navegação por perfil; Engenharia inicia em Engenharia e Operação em Apontamentos. Consulta não recebe áreas de gestão. Simulações preservam o papel efetivo da sessão; sem sessão, usam Consulta. Ator interno prepara fixtures, mas não concede Administração ao usuário.
- Três cenários NHPL isolados em memória, além dos 13 cenários anteriores. Sem escrita Firebase. CSV de produtividade com contexto, base gross, referências, cobertura, confirmação e correções. CSV CEP aguardado; tabelas/CSV de produção e paradas usam interseção com o período, sem alterar a quantidade original.

## Preservação e evidência

Antes das edições, os 704 arquivos originais desta cópia foram conferidos contra a master `8bed53c67db97d57dfdcefb74ef1781ae92e0955`. Esta pasta não tem `.git`; não foi restaurado outro checkout por cima das mudanças. Os dez materiais externos permanecem idênticos por SHA-256 às cópias em `referencias-locais/materiais/`.

A planilha `T20A03(EN)5 - Capability study senai.xlsx` foi lida sem edição: abas `Selo ` e `Normality test `. As fotos consultadas incluem Pitch Board NHPL e tela SIEMENS SIMATIC HMI. A HMI não identifica, por si só, modelo do CLP, protocolo, tags, ciclo ideal ou limites homologados.

Vácuo 75/85 e resfriamento 35/36 são referências da planilha de **selos**, não da NHPL. Contramolde 80/75 está invertido; pressão 6,5 e vácuo -600 estão incompletos. Nenhum limite pendente foi completado ou aprovado por suposição. A instalação do catálogo de selos é bloqueada para `nhpl-montagem`; parâmetros NHPL podem ser cadastrados manualmente e ter versões de referência próprias.

## Verificação executada

Windows, Node 24.19.0, Java JBR 25.0.3, Playwright com Microsoft Edge. Testes de banco usam somente `demo-msa`, emuladores locais e identidades de teste; navegador usa interceptação/fixtures e simulações, não contas ou dados industriais.

| Comando | Resultado |
|---|---|
| `npm test` | 133 testes aprovados |
| `npm run test:emulator` | 19 testes aprovados, incluindo regressões legadas |
| `npm run verify:static -- --deploy` | Sem erros; artefato restrito a `app/` |
| `node tests/browser/nhpl.mjs` | Instalação, políticas, plano por takt, produção, confirmação, CSV, quatro horários e perfis aprovados |
| `node tests/browser/period-export.mjs` | Carry-over integral incluído; contato somente na fronteira excluído de tabela e CSV |
| `node tests/browser/cep.mjs` | CEP, unidade incompatível, CSV assíncrono e histórico da planilha aprovados |
| `node tests/browser/data-tools.mjs` | Prévia/importação idempotente, correção, autoaprovação negada e isolamento de origem aprovados |

Capturas NHPL em 1440×900, 768×1024 e 390×844, claro/escuro, inspecionadas visualmente; sem overflow da página. Evidências novas em `output/nhpl-entrega-2026-10-07/`; capturas antigas não foram sobrescritas. A revisão independente encontrou casos de distribuição de takt, recuperação, revisão obsoleta, cobertura de plano zero e confirmação concorrente; regressões foram reproduzidas e corrigidas.

## Limites desta entrega

- **Replanejamento retroativo com apontamentos não foi liberado.** Revisão sem apontamentos suspende os intervalos antigos antes de publicar a revisão nova; o sucessor imutável arbitra corrida com Operação. Se houver produção, a revisão é recusada: quantidade observada segue correção auditada, não alteração silenciosa do denominador. Conciliar uma programação retroativa com medições existentes exige uma evolução específica.
- Interrupção após aprovação pode deixar cabeçalhos de intervalos pendentes. `Conferir intervalos` recupera os faltantes idempotentemente; `Retomar intervalos` desfaz a suspensão de uma revisão interrompida **somente se o plano ainda for vigente**. Não permite apontar em revisão substituída.
- OEE permanece indisponível: faltam ciclo ideal, classificação técnica dos tempos e critérios de qualidade compatíveis. Takt não é ciclo ideal. Não alegar OEE homologado ou eficiência industrial medida.
- O modo operacional é manual por intervalos confirmados. O domínio tem expectativa parcial contínua testada, mas não existe coletor automático ou evidência de atualização contínua da máquina.
- Integrações físicas, arquivos/eventos automáticos e microparadas automáticas (B), OEE/MTBF/MTTR e política técnica completa (C), Pareto/correlação/TV e integrações ampliadas (D) continuam posteriores.

## Antes da operação real

Publicar as novas regras e o site são etapas separadas; as regras remotas anteriores não autorizam os novos nós. Antes de instalar NHPL no workspace `msa`, obter snapshot privado atual e conferir prévia exclusivamente aditiva. Não recriar usuários nem alterar memberships. As simulações locais permitem revisar a entrega sem essa instalação.

Fontes: [brainstorming atualizado](BRAINSTORM_FABIANA_MSA_2026-10-07.md), [especificação aprovada](superpowers/specs/2026-10-07-nhpl-produtividade-design.md), [plano](superpowers/plans/2026-10-07-nhpl-primeira-entrega.md) e [registro de execução](../output/nhpl-entrega-2026-10-07/progress.md).
