# CEP e correções MSA — plano de implementação

**Objetivo:** concluir as pendências da auditoria, implementar um estudo CEP utilizável na apresentação e ajustar lateral/logo conforme autorizado.

**Especificação:** pedido atual e `AUDITORIA_REGRAS_NEGOCIO_MSA_2026-10-06.md`, especialmente a primeira entrega futura aprovada pelo usuário. Execução direta neste checkout, preservando todas as alterações existentes; sem commit, publicação, edição do XLSX original ou exclusão de dados industriais.

**Arquitetura:** funções puras para CEP I-MR, recorte por contexto e acompanhamento horário; serviços existentes para leitura/decisões; tela CEP separada do arquivo principal de UI. A planilha será uma fonte histórica identificada, sem transformar limites de referência em aprovação industrial. Dados de apresentação ficam em consulta identificada, separados dos indicadores operacionais, sem apagar registros.

## Tarefas

- [x] Conferir XLSX por leitura, registrar hash, extrair 41 séries e referências com proveniência e preparar uma regressão contra os números/textos da planilha.
- [x] Fixar em testes aprovação/natureza comuns, contexto completo, separação de origem, sobreposição, precisão de segundos e agregação horária sem rateio inventado; implementar.
- [x] Implementar e testar I-MR (MR consecutivo, sigma MR/d2), Cp/Cpk dentro, Pp/Ppk global, indisponibilidade para referências pendentes/setpoints/ordem não validada, lacunas, dispersão zero e sinais de instabilidade. Índices sempre estimados; não liberam máquina. Método inicial de fase I, não baseline congelada de fase II.
- [x] Implementar tela CEP com escolha de parâmetro/grupo/fonte, requisitos visíveis, cartas, tabela, relatório CSV e ligação com a Engenharia. A fonte XLSX conserva falta de horário/subgrupo e erros da referência; nenhuma linha é gravada como produção corrente.
- [x] Implementar visão por hora e microparadas manuais com limiar explícito, sem presumir integração física. Metas horárias informadas para a consulta não são homologadas automaticamente.
- [x] Mover logo original para a lateral de 64 px, preta também no tema claro; manter acesso à marca no celular. Mostrar etapas de cadastro e feedback específico.
- [x] Concluir acesso na UI às importações CSV e propostas de correção já existentes, sem enfraquecer papéis ou autoaprovação. Atualizar documentação corrente e evidências.
- [x] Verificar unidade, emuladores, navegador e layouts nos dois temas; revisão independente das fórmulas, recortes e permissões antes da entrega.

## Casos críticos

1. Mesma versão em lotes/receitas diferentes nunca compartilha estudo silenciosamente.
2. Vazio/invalidade interrompe MR: não comparar leituras atravessando uma lacuna.
3. Amostra constante não gera capacidade infinita; capacidade não se aplica a setpoint.
4. Produção que cruza horas permanece não alocada; ausência não vira zero; hora corrente não vira déficit fechado.
5. Dados sintéticos e estudo histórico não aparecem como dados reais ao vivo. Original XLSX e registros existentes permanecem preservados.
