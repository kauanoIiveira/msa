# Publicação dos exemplos MSA

O pacote base foi publicado no Firebase `msayellowteam/workspaces/msa` pelo cliente autenticado. `carga-preview.json` registra a prévia autenticada sem conflitos; `carga-verificacao.json` comprova a publicação e a releitura de 1.744 entradas em uma segunda sessão. Foram criados 1.744 registros e realizadas 43 transições de estado; a repetição criou zero registros. Memberships e dados externos ao pacote foram preservados. As duas sessões usam a mesma conta autorizada; não se afirma aprovação por outra pessoa nem teste em dois computadores.

Manifesto base: `presentation_20261008_v1`. SHA-256 das entradas: `dc278bc4ef7684a32bfc901787f8324d6b2ac48613fea1636f6ef706145b001d`. Prévia: `cea76ccf0f27b70e82ea02d9903e6f37a8ed6294f53d65f2ec0c4342cced9545`. `regras-verificacao.json` comprova as regras efetivamente publicadas nesta carga; versões locais posteriores ainda exigem verificação/publicação própria.

A orientação posterior do usuário prioriza várias máquinas e a coleta/apresentação dos dados. A próxima carga será uma revisão aditiva do manifesto base, preservando o pacote e sem novos refinamentos exclusivos de T20/zonas.

## Procedimento do controlador

1. Concluir a revisão dos exemplos antes da primeira carga, gerar/testar as regras e publicar as regras pelo procedimento já autorizado. O script de carga não publica regras.
2. Disponibilizar a sessão administradora existente por `MSA_TEST_RE` e `MSA_TEST_PASSWORD` no ambiente. Nunca passar senha em argumento, arquivo versionado ou log. O CLI verifica o membro autenticado; não cria contas nem concede acesso.
3. Executar `node scripts/presentation-dataset.mjs --dry-run --preview C:/Users/Kauan/.codex/private/msa-jornada-coesa/publication-preview.json --evidence docs/evidencias/jornada-coesa/carga-preview.json`. Sem `--anchor-date`, a âncora usa a data operacional de São Paulo, com corte às 07h. A versão padrão é `v1`. A cópia completa, incluindo memberships, é lida pelo Firebase CLI já autorizado e permanece privada.
4. Conferir os IDs, contagens, conflitos e hashes sanitizados. Aplicar somente essa prévia com `node scripts/presentation-dataset.mjs --apply --preview C:/Users/Kauan/.codex/private/msa-jornada-coesa/publication-preview.json --evidence docs/evidencias/jornada-coesa/carga-verificacao.json`.
5. Em interrupção, repetir o mesmo comando e o mesmo arquivo privado. Não gerar outra versão para escapar de conflito e não remover registros parciais. Mudança externa à carga invalida a prévia e exige investigar a diferença preservando os backups.

A aplicação usa o SDK cliente autenticado e os serviços de domínio existentes. A comparação atômica protege cada gravação; nenhuma operação `database:set/update`, Admin SDK ou restauração bruta do backup faz parte do publicador. O manifesto é o último registro, após releitura e validação das entradas e métricas. O CLI repete a publicação, abre outra sessão autenticada da mesma conta, relê todas as entradas e compara o backup completo antes/depois. Isso não equivale a uma aprovação por pessoa distinta nem substitui o ensaio da interface em dois computadores.

## Contrato de revisão aditiva

`packageId` é o prefixo permanente dos IDs e referências do pacote base. `id` identifica um manifesto imutável. Uma extensão chama `presentation.prepareRevision({baseManifestId,revision,commands})`, usa IDs de comando `${packageId}_rev_${revision}_...`, herda todas as entradas e adiciona apenas novos registros/eventos criados pelos serviços. Não reexecuta o gerador de planos NHPL. Os próximos módulos devem incluir suas raízes no snapshot e na lista permitida das regras quando forem implementados.

Cada entrada tem `index`, `path`, `scope` e SHA-256. `ledger-header` cobre só metadados do cabeçalho; eventos são entradas próprias com conteúdo completo. `record` cobre o registro. Campos de auditoria `createdAt`/`closedAt` são excluídos do digest de domínio porque o servidor os determina; a representação vazia/nula é normalizada como no RTDB. O hash privado da prévia e do backup também protege seus timestamps originais.

As regras verificam perfil, autoria, relógio, imutabilidade, sequência de índices sem lacunas, formato dos digests, existência das referências e seleção compatível com o caso de produção. Elas **não calculam SHA-256**. A comparação criptográfica de cada entrada, a integridade do backup e as métricas são verificadas pelo publicador após releitura.

## Dados do roteiro e progresso

Os códigos humanos usam o helper único de identidade: por exemplo, `OP-HP-261008-V1` e `LT-MV-261008-V1`. Os IDs internos continuam no namespace do pacote. NHPL usa a variante `Medium` do catálogo existente, e as receitas em rascunho têm configurações nominais explicitamente de exemplo. T20 registra somente tempos/retardos com referências coerentes na configuração; parâmetros medidos e interpretações pendentes permanecem fora dos settings.

No contexto T20 do próprio pacote, as 30 coletas com 41 parâmetros compartilham caso, ordem, lote, receita, dia e turno com produção bruta de 100 peças, 95 boas e refugo de 5 peças. O indicador do período integral resulta em 5%; dados de outra ordem/lote não servem como denominador. Isso não atribui MTBF ou planejamento NHPL à T20.

O callback opcional `publish({...,onProgress})` informa apenas manifesto/contagens/estado, após ACK de escrita ou conferência de conteúdo existente. O CLI imprime a cada 100 intenções e ao persistir o manifesto. `state: published` indica que o marcador foi confirmado após verificação; a prova completa da segunda sessão e do backup posterior só aparece no relatório final. Em erro, não há sinal antecipado de publicação concluída.

## Extensão de máquinas publicada

Manifesto `presentation_20261008_v1_rev_machines`: 609 registros criados, nove transições de estado, 2.353 entradas conferidas após releitura em outra sessão autenticada; repetição criou zero. Memberships e dados externos preservados. Três máquinas novas, nove produções e 270 coletas persistidos. Evidências: `maquinas-cloud-preview.json`, `maquinas-cloud-publicada.json`, `regras-maquinas-verificacao.json`. Hash das regras combinadas publicadas: `30194620d2b9249b042a3b4df07add6cc4d97c1a1921b16ed8da56bb26fa512c`. Hash das entradas: `a54e8345fc220b193881953d020937dc9f3ae539a4c94e9f9c9742d4aea68ea0`. Duas sessões usam a mesma conta, sem alegação de segunda pessoa ou computador.
