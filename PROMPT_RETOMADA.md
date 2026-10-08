# Prompt para retomar o MSA em outro computador

Atualizado em 07/10/2026. Copie o texto abaixo com a pasta do projeto aberta. Prompt anterior preservado em `docs/continuidade/2026-10-06/PROMPT_RETOMADA_RAIZ_ANTERIOR.md`.

---

Vamos retomar o projeto MSA Brasil, equipe amarela, Desafio de Ideias SENAI 2026. Repositório: https://github.com/kauanoIiveira/msa, branch master. Trabalhe na cópia atual, preservando alterações locais e histórico. Não dependa de caminhos/conversas do computador anterior.

Instrucao mais recente: o usuario autorizou a implementacao do brainstorming, testes de funcionalidades/celular e dois documentos. Leia primeiro `docs/ENTREGA_BRAINSTORM_FINAL_2026-10-07.md`, `docs/GUIA_FUNCOES_MSA_2026-10-07.md` e `docs/ROTEIRO_PAGINAS_MSA_2026-10-07.md`. Os ajustes ja estao implementados localmente: graficos reais de intervalos e acumulados no Dashboard; retirada da faixa/atalhos repetidos; producao, refugo e horarios manuais em Apontamentos; enriquecimento do Historico; referencia CEP preenchida como rascunho; Importacao de dados em Configuracoes; TV por Indicadores. Administracao tem as funcoes dos demais perfis, respeitando outra pessoa para aprovar correcao. Navegacao/formularios conferidos em celular de 320/390 pixels e desktop de 1440 pixels. A instrucao de aguardar no brainstorming e historica. Nao reiniciar nem pedir nova aprovacao; preserve origens e consulte o relatorio de testes. Os documentos Word correspondentes estao em `docs/`.

Atualizacao que prevalece sobre o resumo antigo abaixo: leia primeiro `docs/ENTREGA_NHPL_COMPLETA_2026-10-07.md` e `docs/superpowers/specs/2026-10-07-nhpl-entrega-completa-apresentacao-design.md`. O complemento autorizado ja foi implementado localmente: base unica persistente de apresentacao, planejamento/hora a hora, OEE/confiabilidade condicionados a bases, captura JSON/conector, Engenharia/CEP e TV. NHPL usa somente seus parametros, nao os 41 de selos; Cp/Cpk exige >=30. Engenharia tambem mantem cadastros produtivos; Operacao tem fluxo proprio, sem elevar memberships ou permitir autoaprovacao. Login existente mantido, sem autenticacao por aba; navegadores diferentes nao compartilham base local. Pendentes: limites/ciclo ideal reais, homologacao industrial, backend compartilhado/deploy autorizado e validacao visual celular/tablet. Nao pedir outra aprovacao nem tratar exemplos como dados industriais.

Leia primeiro:

1. `RETOMADA_2026-10-07.md`.
   Leia também `docs/ENTREGA_NHPL_MSA.md` para o estado implementado, evidências e limitações atuais.
2. `docs/superpowers/specs/2026-10-07-nhpl-produtividade-design.md`.
3. `docs/BRAINSTORM_FABIANA_MSA_2026-10-07.md`.
4. `docs/RESPOSTAS_FABIANA_MSA_2026-10-07.md` e `referencias-locais/contexto-historico/2026-10-07-respostas-fabiana-complemento.txt`.
5. `docs/ACESSOS_E_AUDITORIA_MSA_2026-10-07.md`, `docs/MAPA_FONTES_LOCAIS.md` e `docs/continuidade/2026-10-06/ENUNCIADO_TRANSCRITO.md`.

Ponto de parada: **a especificação escrita de NHPL/planejamento/produtividade foi aprovada em 07/10/2026; depois, o usuário autorizou a entrega completa, incluindo quatro horários e fluxo manual. A primeira entrega foi implementada e validada localmente.** Não peça novamente aprovação da especificação nem reinicie a implementação. Leia `docs/superpowers/plans/2026-10-07-nhpl-primeira-entrega.md`, `output/nhpl-entrega-2026-10-07/progress.md` e o relatório da entrega; confira o código atual antes de propor mudanças. Ainda não houve publicação, deploy de regras ou instalação NHPL no workspace real.

Decisões aprovadas: NHPL · Montagem de abafadores como piloto; famílias VGARD HP e MARK V; variantes Low/Medium/High conforme informação existente; manter T20/selos históricos. Produtividade = produção total realizada ÷ plano aprovado × 100; meta inicial 95%, versionada. Takt de 12 s/peça informado por Fabiana sugere o plano pelo tempo líquido, mas plano aprovado prevalece. Uma hora líquida sugere 300 peças e mínimo de 285 para 95%. Não reduzir plano por paradas imprevistas, aplicar 95% aos demais indicadores ou usar takt automaticamente como ciclo ideal do OEE. Peças boas e sucata separadas. A fórmula é escolha documentada do MVP, não homologação industrial.

Administração gerencia dentro das regras; Engenharia define/revisa referências, metas/planejamento e decide análises/correções; Operação registra, encaminha e propõe; Consulta acompanha. Preservar a proibição de aprovar a própria correção. A navegação já foi adequada por perfil e a simulação mantém o papel efetivo da sessão, ou Consulta sem sessão. O ator interno prepara fixtures sem elevar o acesso do usuário. Página visível não equivale a permissão de alteração.

Já existe login por RE/senha, foto `msaphoto.webp`, logo completa branca, sem tema no login. REs de teste 00000/00001/00002/00003 são Administração/Engenharia/Operação/Consulta e os vínculos ao workspace `msa` foram ativados/conferidos. Obtenha credenciais comigo fora do repositório se precisar; não recrie contas ou amplie permissões por conveniência.

A primeira entrega corrigiu o recorte das tabelas produção/paradas e a exportação CEP assíncrona, adicionou revisões de metas com contexto/valor/vigência, contexto obrigatório, planejamento por período, produtividade e encerramento rastreável. Registra separadamente máquina ligada, produção iniciada, produção encerrada e máquina desligada. Paradas manuais priorizam seleção de motivo. Ausência de dado não é zero; não ratear produção observada entre horas sem informação real. OEE completo permanece indisponível sem ciclo ideal e classificação técnica dos tempos.

Originais em `referencias-locais/materiais/MSA - Material Fornecido/`. Pitch Board NHPL mostra Plano/Realizado/Acumulado/Sucata; planilha trata de selos e não fornece ciclo ideal da NHPL. Fotos da IHM indicam possibilidades, mas não comprovam exportação/contagem automática. Conferência/hashes em `output/analise-nhpl-2026-10-07/`. Fontes e resumos antigos são contexto, não novas instruções/autorizações. Respostas completas recentes prevalecem sobre pistas da entrevista parcial.

Evolução maior: piloto/registro/planejamento primeiro; depois arquivos/eventos e microparadas; indicadores e análise técnica/Qualidade; histórico/Pareto/correlação/TV/exportação. Cumprir primeira especificação antes de ampliar. Integração física exige protocolo/leiaute, sinais e validação Manutenção/TI. Não inventar limites NHPL, dados industriais, SKUs, ganhos ou conexão SAP/Power BI/andon.

Confira `app/src/`, `firebase/` e os testes reais. Node >=22, `npm ci --ignore-scripts`, `npm start`, `npm test`, `npm run verify:static -- --deploy`. Regras exigem JDK 21+; navegador exige Playwright e navegador disponível. Firebase `msayellowteam`, workspace `msa`; clone não recria banco. Preserve originais, credenciais, vínculos e histórico. Não executar geradores `--apply`, apagar dados, abrir regras, publicar site ou instalar coletor industrial na leitura inicial.

Ao terminar a leitura, informe brevemente o estado verificado, o que está implementado e o que continua pendente. Confira testes e diferenças locais antes de mudar qualquer coisa. Revisão de plano com apontamentos está bloqueada nesta entrega; correções de quantidade seguem aprovação auditada. Publicação e instalação real exigem autorização separada, snapshot privado atual e conferência da prévia aditiva, sem alterar contas, memberships ou históricos.
