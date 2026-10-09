# CEP na apresentação

O seletor **Estudo** oferece três opções:

- **Fonte; exemplo se faltarem requisitos**: usa os dados originais quando o estudo atende aos requisitos. Caso contrário, apresenta um exemplo calculado e identificado.
- **Somente dados originais**: mantém as leituras e os bloqueios de capacidade da fonte selecionada.
- **Exemplo de apresentação**: apresenta observações sintéticas para explicar média, dispersão, Cp, Cpk e cartas I-MR.

O exemplo funciona com as duas fontes. Gera no mínimo 30 observações locais em sequência, respeitando o mínimo escolhido. Usa uma faixa bilateral existente quando compatível; se não houver uma faixa válida, informa a faixa ilustrativa criada. Nenhuma leitura é acrescentada à planilha ou ao Firebase, e nenhuma aprovação da Engenharia é concedida.

A página identifica os dados ilustrativos e explica o impedimento da fonte original. O CSV corresponde ao estudo exibido e identifica as observações com `origin=demo`, `source=cep-presentation` e a referência com `versionStatus=illustrative`. O exemplo não recebe o hash da planilha original.

A planilha original continua com 17 observações históricas. A primeira amplitude móvel é identificada como **Primeira leitura**; lacunas são identificadas como **Sem par consecutivo**. Valores numéricos ausentes nas demais páginas recebem **Sem dados**, mantendo zero como zero e os diagnósticos existentes sobre as bases necessárias.

O botão de interrogação apresenta instruções e destaca as funções de cada página, incluindo a seleção do estudo CEP.
