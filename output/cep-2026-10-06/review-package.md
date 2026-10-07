# Revisão final — CEP e pendências MSA

Pedido atual: resolver pendências da auditoria, implementar CEP usando a planilha fornecida, lateral preta nos dois temas e logo dentro da lateral. Plano: docs/PLANO_CEP_E_CORRECOES_MSA_2026-10-06.md. Especificação: pedido + docs/AUDITORIA_REGRAS_NEGOCIO_MSA_2026-10-06.md. O checklist será fechado após revisão.

O checkout contém mudanças anteriores autorizadas da repaginação e arquivos do usuário. Sem commits nesta tarefa; revisar o estado atual e git diff HEAD, incluindo os arquivos novos CEP/hourly/data-tools. Não editar, publicar, criar commits, apagar dados ou acessar credenciais. Não delegar.

Foco desta implementação: app/src/domain/cep.js, hourly.js, indicators.js, context.js; app/src/services/history.js; app/src/ui/cep.js, hourly.js, data-tools.js, main.js, forms.js, charts.js, format.js, simulation.js; app/styles.css; app/src/catalog/capability-study*.js; scripts/extract-msa-study.py; novos testes em tests/unit e tests/browser. Histórico da repaginação anterior em docs/ENTREGA_REPAGINACAO_VISUAL_MSA.md.

Rulings: consulta operacional exclui origin demo; consulta apresentação preserva e permite leitura, sem gravação pela UI, em vez de apagar/migrar Firebase. Sem mudança de regras/esquema/valores no Firebase nesta tarefa. CEP I-MR fase I exploratório: σ dentro MRbar/1.128, limites I ±3σ, MR UCL 3.267MRbar; σ global amostral; Cp/Cpk dentro e Pp/Ppk global. Capacidade bloqueada para rascunho/setpoint/natureza desconhecida/faixa inválida/unilateral/ordem não confirmada/n insuficiente/zero/instabilidade. Mínimo 25 configurável, não política homologada. Regra I 3σ, MR limite, 8mesmolado. Normalidade e instrumento não verificados, sem liberação industrial. Teste NIST e comparação planilha passam.

Planilha histórica: 41 séries, 17 observações cada, 121 números em texto,14 vazios, ausência de horário/lote/material; fonte preservada, SHA6a030b82f7dc32c6bd05a43a426344c72683fad61495aab70dbc13406ea11c8e. UI compara STDEVP original com dispersão global calculada, não confunde com σ dentro. Não promove referência defeituosa a aprovação.

Hora a hora: apontamentos inteiros numa hora somam; cruzamentos ficam não alocados sem rateio. Ausência null, zero real preservado, hora corrente não gera déficit fechado. Microparadas manuais em segundos com limiar usuário; duração unida por máquina para evitar contagem dupla. Sem captura física prometida. CSV prévia/confirmação e correção com original imutável, autoaprovação bloqueada.

Evidência até agora: npm test95/95; emuladores16/16; navegador entry,ui,cep,data-tools passam. Simulação e revisão visual em andamento. Logs em output/cep-2026-10-06/. Documento final corrente será produzido após revisar.

Revisar especialmente: recortes por contexto completo e versão, origens relacionadas incluindo revisões/correções, lacunas/ordem temporal no MR, portões de capacidade, método e proveniência, UI CSV/correção e papéis, horas parciais/microparadas, sem mascarar dados inexistentes, comparação que o aprovador consegue ler. Reportar achados acionáveis com arquivo:linha e severidade pelo efeito no usuário; listar comportamentos examinados e deixados fora de escopo (Declined to judge) explicitamente. Não tratar pendências industriais anunciadas como bug de algoritmo; verificar que limitação chega à UI.
