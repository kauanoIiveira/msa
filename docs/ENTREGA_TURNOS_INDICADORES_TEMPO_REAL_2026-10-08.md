# Entrega final — turnos, indicadores e base unificada

Concluída em 08/10/2026 na aplicação `C:/Users/Aluno/Desktop/msa-master`. A instrução final do usuário substituiu a separação entre tempo real e registros existentes. Não houve publicação, push ou alteração de dados do Firebase de produção.

## Resultado

- Uma base persistente para consulta e cadastro, sem seletor de fonte e sem gerador contínuo iniciado no login.
- Exemplos completos para VGARD HP e MARK V nos turnos 07–15, 15–23 e 23–07. Planejamento, apontamentos, horários, perdas, inspeções, coletas, classificações, ocorrências, análises, evidências e correções têm registros consultáveis. Exemplos entram uma vez, pelos serviços, sem apagar os registros anteriores.
- Visão geral com produtividade, OEE, MTBF e MTTR, fórmulas breves, pendências abertas, bases dos cálculos e os dois gráficos preservados. Indicadores, Paradas e TV compartilham as projeções.
- Turno ao lado do período. O terceiro turno pertence à data em que começa, atravessa meia-noite e termina às 07h. Quantidades que atravessam recortes não são rateadas artificialmente; problemas de identificação permanecem diagnosticáveis.
- Barra lateral com largura de 166 px no desktop, 200 px no celular, entradas compactas e distribuição em duas colunas em telas baixas. Fechamento do menu móvel corrigido para não atingir os links do próprio menu.
- Cadastros continuam criando e editando máquinas, processos, produtos, parâmetros, motivos e metas. Apontamentos, ocorrências e referências aceitam OP, lote e turno explícitos mesmo quando a consulta está abrangente. Filas de correção respeitam o produto do registro original.
- Os 16 cenários anteriores permanecem disponíveis. Um 17º cenário, **NHPL · visão completa · três turnos e indicadores**, é a opção inicial e inclui OEE, MTBF e MTTR calculáveis. Simulações são isoladas; **Voltar aos registros** restaura a consulta e preserva os cadastros.

Os exemplos mantêm sua origem no histórico e no backup. Não representam coleta física industrial. Recortes deliberadamente sem correspondência, novos cadastros sem apontamentos e cenários de erro continuam mostrando o motivo da ausência; não se inventam valores para essas situações.

## Funções preservadas

| Função | Destino atual e verificação |
|---|---|
| Plano, prévia, aprovação, revisão, recuperação, políticas e takt | Produção / Planejamento; serviços e testes existentes preservados |
| Incrementos, confirmação e reconciliação | Produção / Apontamentos e Resumo; mesmos serviços e auditoria |
| Máquina ligada, início/fim de produção, máquina desligada | Produção / Horários; janelas e validações mantidas |
| Paradas, encerramento, motivo e reparo | Paradas / Em aberto, Histórico, Classificação |
| Refugo, retrabalho, material em kg e primeira passagem | Qualidade / Refugos e perdas, Inspeções; unidades separadas |
| Coletas, limites, rascunhos, versões e gráficos | Parâmetros / Cadastros; referências históricas preservadas |
| Análises, evidências, correções e decisões | Engenharia; quatro perfis e proibição de autoaprovação mantidos |
| CEP, capacidade, gráficos, tabelas e contextos T20/selos | CEP e cenários anteriores; sem importar suas referências para NHPL |
| CSV, eventos, pasta de coleta, backups e TV | Exportar, Configurações / Importação de dados e Indicadores; handlers anteriores mantidos |
| Login, logout, perfil, aparência e acessibilidade | Conta / Configurações; permissões existentes mantidas |
| Endereços antigos de planejamento e operações | Aliases encaminham para as páginas e abas correspondentes |

## Evidências

- Suite final: `node --test tests/unit/*.test.js` — **180 aprovados, 0 falhas**, saída 0. Inclui cadastros persistentes, seis combinações produto/turno, simulação completa, cálculos e filtragem de correções.
- Verificação estática: `node scripts/verify-static.mjs --deploy` — **91 arquivos, 0 erros**. Este comando valida os arquivos; não publica o sistema.
- Regras e integração no emulador Firebase: **20 aprovados, 0 falhas**, saída 0, com JBR 21. Emulador encerrado. A etapa final não modificou regras ou o adaptador Firebase.
- Navegador com autenticação de fixture local: páginas e abas com registros, os seis tipos de cadastro, criação/edição/recarregamento de máquina, cenários simples e completo, retorno à base, turno noturno e filas do MARK V. Nenhum erro de console observado.
- Menu sem rolagem lateral e sem transbordamento horizontal nas verificações de 1280×720, 1024×580, 390×844 e 320×568. Fechar o menu preserva a rota atual.
- Captura final: `docs/visao-geral-turnos-indicadores.jpg`.
- Logs e baseline: `.superpowers/sdd/2026-10-08-telas-turnos-indicadores-tempo-real/`.

## Decisões e limites da revisão

Esta cópia não tem Git; a aplicação foi editada diretamente e o baseline foi preservado, sem inventar commits. Custo: integração e recuperação são por arquivos/backup, não por histórico Git.

A fixture antiga de contador das 18–19h foi identificada como turno 2 para respeitar a nova validação de horários; suas demais verificações foram preservadas. Os antigos dados da fonte contínua permanecem armazenados e incluídos no backup; não são apresentados como medições novas.

A revisão independente foi interrompida pelo limite de uso da conta. Os três achados recebidos foram corrigidos com regressões verificadas: intervalo aberto após atraso de callback, disponibilidade ocultada na ausência de ciclo ideal e recuperação visual de erro de armazenamento. Não houve um parecer independente final completo; a conclusão conta com os testes e a conferência do autor registrados acima.

Os testes prolongados de aquisição em tempo real foram interrompidos conforme solicitado. O módulo anterior permanece preservado e inativo; a rotina usa a base unificada e as simulações por cenário. Os checklists históricos do plano anterior ficam como registro; a seção de encerramento do plano documenta o escopo final efetivamente entregue.

## Atualização posterior — barra lateral e continuidade

Por instrução posterior do usuário, somente a barra lateral foi ampliada nesta atualização: 190 px no desktop, 220 px no celular, textos de 13 px e entradas de 36 px. Em telas baixas as duas colunas usam textos de 11 px e entradas de 40 px. Verificada sem rolagem na barra e sem transbordamento horizontal em 1280×720, 1024×580 e 320×568; fechamento móvel preserva a rota.

IoT, zonas Z1–Z21 em Indicadores, manômetro/vacuômetro e a proposta de foto permanecem como próximas etapas em `docs/PROXIMAS_ETAPAS_IOT_FOTOS.md`, que contém o prompt de continuidade. Não foram implementados nesta atualização.

O histórico Git foi recuperado de `kauanoIiveira/msa`, a partir de `69f674a`, no workspace `C:/Users/Aluno/Documents/ChatGPT/MSA`. As alterações concluídas são reunidas na branch `codex/consolidar-msa-menu` para envio solicitado pelo usuário. A cópia de trabalho original em Desktop/msa-master permanece preservada. Esta atualização não publica o site.
