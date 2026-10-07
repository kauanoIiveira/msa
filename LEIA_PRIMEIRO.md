# Retomada local do MSA

**Atualização prioritária — 07/10/2026:** leia [RETOMADA_2026-10-07.md](RETOMADA_2026-10-07.md) e [PROMPT_RETOMADA.md](PROMPT_RETOMADA.md). Especificação NHPL aprovada, implementação adiada; quatro perfis ativos no Firebase. Fontes/evidências acompanham GitHub conforme autorização. Afirmações provisórias e de exclusão do Git abaixo descrevem a preparação anterior.

> Atualização de 06/10/2026: o usuário autorizou publicar na master também as fontes, os documentos e os artefatos locais do projeto. As menções anteriores a materiais fora do Git e a mudanças ainda não publicadas descrevem a preparação anterior. O .gitignore atual exclui ambientes instalados, caches e cópias temporárias de teste.

Pasta preparada em 06/10/2026 para a equipe continuar em outro computador em 07/10/2026. O pacote conserva o código atual, inclusive alterações ainda não commitadas, documentação, fontes originais, logos e evidências locais. Nenhum conteúdo foi publicado nesta preparação.

## Comece aqui

Abra esta pasta no editor. Para a IA, envie o conteúdo de [PROMPT_RETOMADA.md](PROMPT_RETOMADA.md). Para instalar e executar, siga [Transferência local](docs/TRANSFERENCIA_LOCAL.md).

A conferência desta preparação está em [Verificação da transferência](docs/VERIFICACAO_TRANSFERENCIA_LOCAL.md), incluindo instalação limpa, integridade das cópias e recuperação do Git.

Leia nesta ordem:

1. [Entrega CEP e pendências](docs/ENTREGA_CEP_E_PENDENCIAS_MSA_2026-10-06.md): estado funcional mais recente, limitações e roteiro de demonstração.
2. [Verificação da entrega CEP](docs/VERIFICACAO_CEP_MSA_2026-10-06.md): verificações daquela entrega. Não tratar resultados antigos como testes executados hoje.
3. [Mapa das fontes locais](docs/MAPA_FONTES_LOCAIS.md): localização portátil dos materiais originais, documentos e evidências.
4. [Enunciado transcrito](docs/continuidade/2026-10-06/ENUNCIADO_TRANSCRITO.md), [Consolidação](docs/continuidade/2026-10-06/CONSOLIDACAO.md) e [Perguntas e pendências](docs/continuidade/2026-10-06/PERGUNTAS_E_PENDENCIAS.md): requisitos e contexto das etapas anteriores.
5. [Análise da entrevista parcial](docs/continuidade/2026-10-06/ENTREVISTA_PARCIAL_ANALISE.md) e [Texto fornecido pelo usuário](docs/continuidade/2026-10-06/TRANSCRICAO_PARCIAL_FORNECIDA.txt): necessidades relatadas, com exatidão ainda não confirmada.
6. [Contratos funcionais](docs/CONTRATOS_FUNCIONAIS.md) e [Parâmetros](docs/PARAMETROS_MSA.md): detalhes a conferir contra o código e a entrega mais recente.

## O que está atual

O sistema já recebeu a repaginação visual, login como primeira tela, lateral preta nos dois temas com logo interna, CEP I-MR fase I, visão por hora, microparadas manuais em segundos, importação CSV com prévia e propostas de correção rastreáveis. O simulador tem 13 cenários em memória. As consultas Operacional e Apresentação separam os registros fictícios; a segunda desabilita gravações.

A pesquisa e o prompt de repaginação em `docs/` registram o planejamento visual anterior. Leia [Entrega da repaginação](docs/ENTREGA_REPAGINACAO_VISUAL_MSA.md) antes de usá-los. Não executar novamente o prompt antigo como se a repaginação ainda estivesse pendente.

Há textos históricos no README, CONTINUE_AQUI, relatórios e notas de contexto. Contagens antigas de telas, testes e cenários descrevem aquela época. Em caso de divergência, confira a entrega mais recente e o comportamento do código; preserve a fonte antiga como histórico.

## Como interpretar as informações

Separe o que veio do enunciado ou dos materiais da empresa, o que foi relatado na entrevista, o que foi proposto pela equipe e o que foi implementado com evidência de teste. Um teste do software não homologa uma referência industrial nem prova desempenho da fábrica.

A transcrição foi fornecida pelo usuário, que não garante exatidão e começou a gravar depois da metade da reunião. O áudio está incluído, mas não foi ouvido ou conferido na análise registrada. NHPL e 290 peças por hora são indicações provisórias, sem confirmação de grafia, identidade ou meta aprovada.

A planilha histórica é uma fonte de estudo; não constitui referência homologada. OCR, QR, coleta de máquina/CLP/IHM, integração IoT e IA não foram entregues. A aprovação humana registrada no sistema não libera fisicamente uma máquina.

## Onde ficam as coisas

| Pasta | Conteúdo |
| --- | --- |
| `app/` | Sistema executável e bibliotecas locais de interface |
| `firebase/` | Regras e configuração do projeto; publicação é uma etapa separada |
| `scripts/` e `tests/` | Servidor local, verificações, empacotamento e testes |
| `docs/` | Entregas, contratos, roteiros, pesquisa visual e instruções de retomada |
| `docs/continuidade/2026-10-06/` | Índice anterior, consolidação, perguntas, entrevista e evidências históricas |
| `referencias-locais/` | Originais da empresa/equipe, fotos, áudio, planilha, logos, PDFs, notas históricas e histórico Git |
| `analise/`, `entrega/` e `output/` | Extrações, auditorias, relatórios e capturas produzidos anteriormente |

Os caminhos absolutos antigos mencionam o computador do Kauan. Use o mapa de fontes para encontrar as cópias dentro desta pasta. A execução normal do aplicativo não depende desses caminhos antigos.

## Transferência e GitHub

O ZIP é uma cópia privada de trabalho. Fontes originais, contatos e evidências locais acompanham a transferência, mas estão excluídos do Git por regras compartilhadas em `.gitignore`. Não publicar o ZIP inteiro nem forçar a inclusão dessas pastas sem revisar os materiais.

O histórico versionado acompanha um bundle local, sem exigir um clone remoto. A restauração opcional está documentada no guia de transferência e preserva os arquivos atuais. Não substituir este pacote por um clone antigo: as alterações mais recentes podem estar apenas nos arquivos locais.

Subir ao GitHub, criar commits e publicar o site ficam para a etapa final solicitada pela equipe.
