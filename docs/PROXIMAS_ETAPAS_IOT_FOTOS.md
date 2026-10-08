# Próximas etapas — coleta IoT e fotos

Status em 08/10/2026: **planejado, não implementado nesta etapa**. A última instrução restringiu a alteração funcional ao aumento da barra lateral. Coleta física e leitura automática de fotos ainda não estão habilitadas.

## 1. Receber sinais IoT, sem controlar a máquina

Ampliar o fluxo de eventos e o conector existentes para receber, de um dispositivo/gateway externo, máquina ligada/desligada, início e encerramento da produção, início de ciclo, parada e retomada. Registrar o horário do evento, horário de recebimento, fonte, identidade, sequência e contexto (máquina, processo, produto, OP, lote e turno).

Antes de ligar uma fonte real, definir quais sensores ou sinais estão disponíveis e como o gateway os expõe. Não acessar nem modificar o programa do CLP, não enviar comandos de partida/parada e não afirmar que existe hardware conectado sem uma conexão verificada. Ações manuais devem se chamar “Registrar máquina ligada”, “Registrar início de produção” etc., para distingui-las de comandos físicos.

Preservar a idempotência, os diagnósticos de sequência e o histórico. Perda de comunicação é ausência de observação, não prova de máquina desligada ou parada. Reconexão não cria produção retroativa. Início de ciclo não significa peça concluída ou aprovada; produção e qualidade dependem de sinais próprios ou confirmação humana. Manter motivo, classificação técnica de falha e horários de reparo para conferência, sem transformar toda parada em falha.

Usar os horários e sinais confiáveis como bases dos indicadores existentes. Máquina ligada não é equivalente a tempo produzindo; plano aprovado, ciclo ideal e qualidade de primeira passagem continuam necessários. Não reutilizar o takt como ciclo ideal e não fabricar contagens ou OEE.

## 2. Zonas e instrumentos em Indicadores

Adicionar Z1–Z21, manômetro e vacuômetro na tela de Indicadores. Reutilizar os parâmetros realmente cadastrados para a máquina/processo e os registros existentes. Mapear a identidade de cada zona, sem renumerar por posição de lista. Mostrar valor, unidade, horário e referência aprovada quando houver. Conservar valores zero e vácuo negativo.

As zonas antigas pertencem aos contextos de aquecimento/selos; não transferir suas leituras, unidades ou limites para NHPL/montagem. Quando não houver um parâmetro ou leitura vinculado, explicar a configuração necessária. Toda referência nova exige validação para a máquina correspondente.

## 3. Foto como proposta futura

Preparar uma opção de foto com seleção e prévia local, associação ao contexto e indicação explícita de que a extração automática está em desenvolvimento. Nesta primeira etapa futura, não instalar IA/OCR, não enviar imagens a serviços externos e não preencher medições a partir da foto. Uma prévia não é uma coleta validada.

Em uma etapa posterior, discutir identificação das zonas/instrumentos, revisão pelo funcionário, unidades, limites, confiança da extração e conservação da imagem como evidência antes de ativar leitura automática.

## Referências consultadas

Material local do MSE: `docs/Mapa-da-Planta.md`, `docs/Paineis-e-cenario.md` e `docs/Supervisorio-NHPL.md`, na pasta fornecida pelo usuário. Aproveitar a organização da linha do tempo, atualização por eventos, sinalização de comunicação perdida e consistência entre telas. Preservar o desenho, os dados, gráficos e cálculos próprios do MSA; não copiar código nem presumir que a simulação do concorrente é uma integração física existente.

## Prompt de continuidade

```text
Continue o MSA a partir de docs/PROXIMAS_ETAPAS_IOT_FOTOS.md e da entrega de turnos/indicadores de 08/10/2026. Preserve todas as funcionalidades, cadastros, gráficos, permissões, histórico, base unificada e 17 simulações. Não reintroduza a separação entre tempo real e registros existentes. A barra lateral já foi ampliada para 190 px no desktop e 220 px no celular.

Planeje e implemente, após validar o desenho, a recepção de eventos IoT de máquina ligada/desligada, início/fim da produção, início de ciclo, parada e retomada. Reutilize os serviços e o conector de eventos existentes. Não acesse nem altere o programa do CLP e não envie comandos físicos à máquina. Primeiro identifique os sensores/sinais e o gateway disponíveis; sem hardware confirmado, entregue somente a integração preparada e testes com eventos identificados como exemplo. Garanta identidade, sequência, timestamps, OP/lote/turno, idempotência, lacunas de comunicação, reconexão sem produção inventada e manutenção do registro manual. Início de ciclo não deve contar como peça boa. Atualize OEE/produtividade somente com bases válidas e preserve a conferência humana dos motivos, falhas, reparos e qualidade.

Adicione Z1–Z21, manômetro e vacuômetro em Indicadores, respeitando o contexto real de cada máquina, identidade dos parâmetros, unidades, zero, vácuo negativo e versões de limites. Reutilize as leituras antigas de aquecimento no seu contexto, sem transportar dados de T20/selos para NHPL. Prepare a opção de foto com prévia local e indicação de implementação futura; não ative IA/OCR, não envie imagens externamente e não invente valores extraídos.

Consulte o material local do MSE fornecido anteriormente para referências de organização, sem copiar código/ativos. Trabalhe incrementalmente, verifique eventos duplicados e fora de ordem, retorno das simulações, permissões, preservação dos registros e interface desktop/celular. Documente o que está funcional e o que depende de hardware ou desenvolvimento posterior.
```
