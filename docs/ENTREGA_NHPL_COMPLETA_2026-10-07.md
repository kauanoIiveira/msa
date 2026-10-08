# Entrega NHPL: complemento completo para apresentacao

Data: 07/10/2026. Copia trabalhada: `C:\Users\Kauan\Desktop\msa-master`.
Implementacao e validacao locais. Nao houve push, deploy de regras, instalacao no workspace operacional, promocao de contas nem conexao com equipamento industrial.

## Estado entregue

1. Planejamento e apontamento: uma base local persistente, planos aprovados, hora a hora, producao bruta/boa, perdas, paradas, ocorrencias e quatro horarios distintos. Produtividade usa producao bruta/plano aprovado, meta inicial 95% e takt informado 12 s/peca. Paradas imprevistas nao reduzem o plano.
2. Indicadores: disponibilidade, desempenho, qualidade e OEE com memoria de calculo; MTBF, MTTR e taxa de falha com classificacao/exposicao. Resultado parcial, base ausente, inspecao desatualizada, desempenho impossivel e referencias conflitantes ficam diagnosticados. Takt nao substitui ciclo ideal.
3. Captura: eventos JSON, importacao e conector de pasta autorizado, fila idempotente, conflitos/sequencia/gaps, contador acumulado e reinicio sem falsa producao. Sinal de maquina funcionando nao encerra parada sem peca boa validada.
4. Engenharia e CEP: detalhes e acoes explicitas, nova analise, evidencias, decisoes e correcoes auditadas; Cp/Cpk com minimo de 30 amostras NHPL. Pp/Ppk preservados no legado, fora da tela principal. NHPL nao herda parametros dos selos.
5. Gestao e apresentacao: cadastro produtivo gravavel conforme perfil, backup local, painel TV/fullscreen e configuracoes sem e-mail visivel, RE imutavel, nome, acesso/cargo quando confiavel e troca de senha preservada.

Identidade: **NHPL**, linha **Montagem**, **Processo de montagem do abafador**, **Abafadores VGARD HP / MARK V**, variantes conhecidas. Identidades e registros T20/selos permanecem historicos; nao foram convertidos em medicoes NHPL.

## Dados incluidos e proveniencia

- Pacote persistente isolado `msa.nhpl.presentation.v3`, com contexto, duas familias, planos, apontamentos horarios, perdas, paradas, analises e ocorrencias.
- VGARD HP: quatro intervalos confirmados, 60 coletas e dois parametros didaticos. MARK V: dois intervalos confirmados e 30 coletas. Um intervalo adicional permite demonstrar registro manual.
- Os limites, ciclo ideal de 10 s e classificacoes usados nos exemplos sao **hipoteticos e identificados**, nao referencias aprovadas da NHPL. A meta de produtividade e o takt informado sao decisoes documentadas, nao hipoteses tecnicas do OEE.
- Chaves locais antigas preservadas. Pacote invalido/conflito de escrita nao e sobrescrito silenciosamente. Exportar backup antes de trocar computador ou limpar armazenamento.
- O periodo inicial cobre os registros do pacote. Novos apontamentos ampliam o periodo; ausencia de registro nao vira zero e nao ha rateio artificial entre horas.

## Perfis e permissoes

| Papel tecnico | Responsabilidade |
| --- | --- |
| Administracao | Gestao autorizada, cadastros produtivos, planos, referencias, registros e decisoes. |
| Engenharia | Lideres, supervisores e equipes tecnicas vinculadas a esse papel: cadastros produtivos, planejamento, referencias, registros, novas analises, revisao/correcao e decisao de propostas de outras pessoas. |
| Operacao | Experiencia de turno: producao, parametros, parada, refugo/perda, ocorrencia, consulta, encaminhamento e proposta de correcao. Nao altera referencias/planos nem decide propostas. |
| Consulta | Leitura, sem gravacoes. |

Cargo profissional nao e automaticamente um papel tecnico. Nenhum membership real foi alterado. Cargo nominal exige cadastro confiavel; mostrar acesso nao atribui um cargo real. Ninguem aprova a propria correcao. Sessao sem papel confiavel permanece Consulta.

## Como apresentar

Abrir `http://127.0.0.1:5175/`. O seletor Base de consulta foi removido; a entrada usa o pacote local. Login real existente continua por RE, sem mudanca de persistencia por aba. Use as credenciais fornecidas pelo responsavel, nunca as contas artificiais do servidor de QA.

1. No dashboard, selecionar NHPL/VGARD HP e conferir contexto, plano/realizado, qualidade e bases do OEE. Mostrar que produtividade e OEE sao indicadores distintos.
2. Em Planejamento, abrir intervalos e vigencias; em Apontamentos, conferir hora a hora e os quatro horarios. Com Operacao, registrar producao, parametro, perda, parada ou ocorrencia. O resultado passa pelos mesmos servicos do painel.
3. Em Engenharia, abrir detalhes, iniciar analise, anexar evidencia e propor/decidir uma correcao usando atores diferentes. Acoes nao ficam vazias; autoaprovacao e bloqueada.
4. Em CEP, mostrar 60 observacoes VGARD e Cp/Cpk; alternar para MARK V. Limites didaticos nao comprovam capacidade real da NHPL. Em Cadastros, criar uma maquina e recarregar para conferir persistencia local.
5. Em Captura, importar eventos ou acompanhar a pasta; mostrar parada, retorno sem boa, retomada validada e perda de comunicacao. Abrir Painel TV, tela cheia e retornar.

### Conector opcional para a apresentacao

Na pasta do projeto, em dois terminais:

```powershell
npm run capture -- --directory output/nhpl-capture
npm run capture:demo
```

Na pagina Captura, conectar explicitamente ao endereco local informado. O conector padrao aceita a origem `http://127.0.0.1:5175`, escuta somente loopback e le somente a pasta autorizada. O produtor usa eventos ficticios, nao le a maquina. Ambos podem ser encerrados com Ctrl+C. O conector usado no QA foi encerrado; nao ha coletor instalado permanentemente.

**Navegadores diferentes separam contas e tambem o armazenamento local.** Uma gravacao em Chrome nao aparece automaticamente em Edge. Atualizacao local entre abas requer a mesma origem e armazenamento; gestao/operador em navegadores ou computadores distintos exigem backend compartilhado autorizado. Nao houve alteracao de login por aba nem ampliacao desse escopo.

## Verificacao executada

- `npm test`: **141 testes passaram**, zero falhas.
- Emuladores Auth/RTDB locais: **20 testes passaram**, zero falhas; sem fallback para nuvem. Incluem acesso, campos imutaveis, importacao e proibicao de elevacao de papel.
- `npm run verify:static -- --deploy`: **75 arquivos**, sem erros. O comando verifica; nao publica.
- Navegador desktop: dashboard, cadastros/persistencia, Engenharia/nova analise, configuracoes, operador/producao, CEP/graficos, captura automatica de dois lotes e TV/fullscreen/retorno conferidos. O servidor de QA usa autenticacao ficticia isolada, nao o Firebase real.
- Evidencias em `output/nhpl-completa-2026-10-07/`: logs e capturas em `visual/`.
- **Celular/tablet ainda nao validados visualmente**: o controle de viewport disponivel nao aplicou o tamanho solicitado. Nao declarar esse criterio aprovado apenas por CSS responsivo.
- Troca de senha real nao executada; formulario preservado sem alterar credenciais por conveniencia.

## Criterios e limites de aceite

A01-A09 e A11-A15: implementados com testes locais e/ou exercicio desktop documentado. A10: RE/nome/acesso/ausencia de e-mail conferidos; cargo nominal real e troca de senha dependem de cadastro/validacao apropriados. A16: TV e desktop conferidos; celular/tablet pendentes. A17: exportacao e backup implementados; revisar o arquivo necessario antes de uso operacional. A18: testes unitarios/regras e principais fluxos desktop executados, nao equivalem a cobertura exaustiva de todo clique em todos os dispositivos. A19: nenhuma alteracao operacional/conta/deploy. A20: roteiro acima.

OEE completo esta implementado como calculo e fluxo, mas o **OEE real NHPL** exige ciclo ideal aprovado, inspecao de primeira passagem, cobertura de tempos e classificacao tecnica validada. Os limites reais de parametros NHPL continuam pendentes. MTBF/MTTR reais exigem historico de falhas/reparos e exposicao confiaveis. Fotos/IHM e planilha de selos nao substituem essas referencias.

Antes de liberar em nuvem: snapshot privado atualizado, revisao aditiva dos catalogos, validacao dos perfis nominais, ordem/conflitos de revisoes tecnicas simultaneas, testes do backend compartilhado e deploy autorizado das regras. Antes de integrar a NHPL: sinais/protocolo/leiaute, autorizacao TI/Manutencao e validacao em equipamento real. Nenhum ganho industrial, homologacao ou integracao SAP/Power BI e alegado.

## Continuidade obrigatoria

Leia este relatorio, `RETOMADA_2026-10-07.md`, `PROMPT_RETOMADA.md`, respostas completas de Fabiana e o complemento `superpowers/specs/2026-10-07-nhpl-entrega-completa-apresentacao-design.md`. Nao pedir nova aprovacao da especificacao original. Conferir primeiro a copia Desktop e os testes. Preservar historico, identidades, origens, unidades, contas e regras de correcao. Nao confundir dados locais de apresentacao com o estado da nuvem nem preencher pendencias industriais com exemplos.
