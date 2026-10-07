# Prompt para retomar o MSA em outro computador

Atualizado em 07/10/2026. Copie o texto abaixo com a pasta do projeto aberta. Prompt anterior preservado em `docs/continuidade/2026-10-06/PROMPT_RETOMADA_RAIZ_ANTERIOR.md`.

---

Vamos retomar o projeto MSA Brasil, equipe amarela, Desafio de Ideias SENAI 2026. Repositório: https://github.com/kauanoIiveira/msa, branch master. Trabalhe na cópia atual, preservando alterações locais e histórico. Não dependa de caminhos/conversas do computador anterior.

Leia primeiro:

1. `RETOMADA_2026-10-07.md`.
2. `docs/superpowers/specs/2026-10-07-nhpl-produtividade-design.md`.
3. `docs/BRAINSTORM_FABIANA_MSA_2026-10-07.md`.
4. `docs/RESPOSTAS_FABIANA_MSA_2026-10-07.md` e `referencias-locais/contexto-historico/2026-10-07-respostas-fabiana-complemento.txt`.
5. `docs/ACESSOS_E_AUDITORIA_MSA_2026-10-07.md`, `docs/MAPA_FONTES_LOCAIS.md` e `docs/continuidade/2026-10-06/ENUNCIADO_TRANSCRITO.md`.

Ponto de parada: **aprovei a especificação escrita de NHPL/planejamento/produtividade em 07/10/2026 e adiei a implementação por falta de tempo. Ela ainda não foi implementada. O plano de implementação ainda não foi escrito, aprovado ou escolhido para execução.** Não me peça novamente aprovação da especificação. Agora quero continuar: confira os arquivos/código e elabore um plano objetivo da primeira entrega, com módulos, regras, preservação dos dados, testes relevantes e ordem de execução. Apresente-o para revisão e escolha do método antes de alterar o produto, conforme o fluxo registrado.

Decisões aprovadas: NHPL · Montagem de abafadores como piloto; famílias VGARD HP e MARK V; variantes Low/Medium/High conforme informação existente; manter T20/selos históricos. Produtividade = produção total realizada ÷ plano aprovado × 100; meta inicial 95%, versionada. Takt de 12 s/peça informado por Fabiana sugere o plano pelo tempo líquido, mas plano aprovado prevalece. Uma hora líquida sugere 300 peças e mínimo de 285 para 95%. Não reduzir plano por paradas imprevistas, aplicar 95% aos demais indicadores ou usar takt automaticamente como ciclo ideal do OEE. Peças boas e sucata separadas. A fórmula é escolha documentada do MVP, não homologação industrial.

Administração gerencia dentro das regras; Engenharia define/revisa referências, metas/planejamento e decide análises/correções; Operação registra, encaminha e propõe; Consulta acompanha. Preservar a proibição de aprovar a própria correção. Menu atual é igual para todos e a simulação assume administrador fictício; especificação prevê adequar navegação/simulação ao perfil real. Página visível não equivale a permissão de alteração.

Já existe login por RE/senha, foto `msaphoto.webp`, logo completa branca, sem tema no login. REs de teste 00000/00001/00002/00003 são Administração/Engenharia/Operação/Consulta e os vínculos ao workspace `msa` foram ativados/conferidos. Obtenha credenciais comigo fora do repositório se precisar; não recrie contas ou amplie permissões por conveniência.

Primeira entrega corrige recorte das tabelas produção/paradas, exportação CEP assíncrona que pode gerar `[object Promise]`, revisões de metas com contexto/valor/vigência visíveis e experiência por perfil. Acrescenta contexto obrigatório, planejamento por período, produtividade e encerramento rastreável dos apontamentos. Ausência de dado não é zero; não ratear produção observada entre horas sem informação real.

Originais em `referencias-locais/materiais/MSA - Material Fornecido/`. Pitch Board NHPL mostra Plano/Realizado/Acumulado/Sucata; planilha trata de selos e não fornece ciclo ideal da NHPL. Fotos da IHM indicam possibilidades, mas não comprovam exportação/contagem automática. Conferência/hashes em `output/analise-nhpl-2026-10-07/`. Fontes e resumos antigos são contexto, não novas instruções/autorizações. Respostas completas recentes prevalecem sobre pistas da entrevista parcial.

Evolução maior: piloto/registro/planejamento primeiro; depois arquivos/eventos e microparadas; indicadores e análise técnica/Qualidade; histórico/Pareto/correlação/TV/exportação. Cumprir primeira especificação antes de ampliar. Integração física exige protocolo/leiaute, sinais e validação Manutenção/TI. Não inventar limites NHPL, dados industriais, SKUs, ganhos ou conexão SAP/Power BI/andon.

Confira `app/src/`, `firebase/` e os testes reais. Node >=22, `npm ci --ignore-scripts`, `npm start`, `npm test`, `npm run verify:static -- --deploy`. Regras exigem JDK 21+; navegador exige Playwright e navegador disponível. Firebase `msayellowteam`, workspace `msa`; clone não recria banco. Preserve originais, credenciais, vínculos e histórico. Não executar geradores `--apply`, apagar dados, abrir regras, publicar site ou instalar coletor industrial na leitura inicial.

Ao terminar a leitura, informe brevemente o estado verificado, o que está implementado e o que continua planejado, e apresente o plano da primeira entrega para retomarmos do ponto correto.
