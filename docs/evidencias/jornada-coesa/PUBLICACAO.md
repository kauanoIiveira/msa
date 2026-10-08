# Publicação dos exemplos MSA

O resumo `carga-preview.json` desta entrega foi preparado **localmente a partir do backup privado**. Não comprova autenticação atual, deploy de regras nem carga na nuvem. `carga-verificacao.json` deve ser produzido somente depois da carga verificada pelo CLI. Não há esse arquivo nesta etapa.

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
