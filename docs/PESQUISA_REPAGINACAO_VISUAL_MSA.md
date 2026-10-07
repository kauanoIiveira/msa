# Pesquisa e direção visual para o sistema MSA

Pesquisa realizada em 06/10/2026. Esta etapa produziu um briefing e um prompt. O aplicativo não foi repaginado.

## Direção escolhida

Painel industrial contemporâneo, com superfícies claras, verde MSA, tipografia legível e informação organizada para consulta rápida. O login recebe uma composição de marca mais expressiva; o ambiente de trabalho concentra o cuidado visual em hierarquia, gráficos, tabelas e estados.

A escolha do usuário é apresentar o login como primeira tela quando não houver sessão autenticada. Esta decisão substitui a preferência anterior pela entrada direta. Preservar a restauração de sessão e a possibilidade de usar o simulador existente, identificado como simulação local.

## O que foi conferido

Foram lidos a estrutura de navegação, o login, os gráficos e os principais renderizadores em `app/src/ui/main.js`, além do adaptador Chart.js em `app/src/ui/charts.js`, do HTML e dos tokens de estilo. A captura existente `output/ui/dashboard-light.png` foi examinada como evidência visual de um cenário sintético, sem atribuir seus valores à operação real.

As sete páginas atuais são Dashboard, Parâmetros, Apontamentos, Engenharia, Histórico, Cadastros e Configurações. A barra lateral e sua navegação devem manter estrutura, ordem, largura e comportamento. Experimentar apenas a cor e o tratamento de seleção.

Os gráficos atuais apresentam rótulos de 10 px e duas séries com cores próximas. O dashboard reúne quatro indicadores, produção por dia, principais motivos de parada, 21 zonas de aquecimento, parâmetros do processo e fila da Engenharia. O histórico de um parâmetro abre em detalhe com gráfico de linha e estatísticas.

## Referências reais e o que aproveitar

| Referência | Parte aproveitada | Aplicação ao MSA |
| --- | --- | --- |
| [Carbon Charts: barras](https://charts.carbondesignsystem.com/bar) | Composição de gráficos, séries identificáveis, títulos, eixos e legenda | Produção bruta/boa em barras agrupadas; paradas em barras horizontais |
| [Carbon Charts: tooltips](https://charts.carbondesignsystem.com/tooltips) | Consulta de valores junto ao gráfico | Data, série, valor e unidade na interação, mantendo a mesma fonte de dados |
| [Grafana: boas práticas de dashboards](https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/best-practices/) | Progressão do geral ao detalhe e significado das cores | Contexto de máquina/processo/produto, indicadores, gráficos e detalhes operacionais |
| [Geckoboard: painel de operação](https://www.geckoboard.com/dashboard-examples/operations/warehouse-dashboard/) | Indicadores de leitura rápida e gráficos organizados por pergunta | Hierarquia para enxergar produção e interrupções, sem copiar métricas de estoque ou comércio |
| [Linear: login](https://linear.app/login) | Uma tarefa principal, poucos elementos e hierarquia clara | Formulário de acesso direto; não copiar seus métodos de autenticação |
| [Ramp: login](https://app.ramp.com/sign-in) | Marca, campos espaçosos e ação principal destacada | Clareza do formulário com cores e composição próprias da MSA |

As telas de Linear, Ramp, Carbon e Geckoboard foram abertas e examinadas no navegador. O catálogo público [UIZZE](https://uizze.com/?platform=Web) também foi consultado, mas a busca por dashboard não retornou uma referência adequada nesta sessão. Não foi usado acesso pago nem uma integração MCP do UIZZE. As fontes diretas sustentam a seleção acima.

Essas referências orientam a composição. A combinação final e sua adequação ao MSA são decisões de design deste briefing, não um layout prescrito pelas fontes.

## Brainstorming filtrado

| Caminho | Decisão | Motivo |
| --- | --- | --- |
| Painel claro de operação, com verde MSA e lateral escura | Adotar | Favorece gráficos e tabelas e mantém familiaridade com a navegação atual |
| Login dividido entre marca e formulário | Adotar no desktop | Dá identidade à entrada sem colocar decoração entre o usuário e o acesso |
| Sala de controle inteiramente escura e muito densa | Manter somente como alternativa de tema | Útil para preferência pessoal, mas não é a direção padrão da repaginação |
| Interface com muitos efeitos de vidro, cartões flutuantes e cores sem função | Descartar como direção geral | Compete com indicadores e estados operacionais |
| Heatmap de temperatura baseado em faixas inventadas | Descartar | Cor poderia sugerir uma condição técnica não validada; usar o estado já calculado de cada zona |
| Novo Kanban da Engenharia, novos indicadores horários ou comparação entre máquinas | Adiar | Exigiria escolhas de fluxo ou dados além da apresentação autorizada |

Gradientes discretos, ilustração abstrata e movimento podem ser usados onde melhorarem o resultado, sobretudo no login. O filtro é identidade, legibilidade e desempenho, sem impor uma estética rígida por causa de uma skill.

## Paleta e assets

O [guia de aplicação visual da MSA](https://assetlibrary.msasafety.com/m/59efd570f6a74543/original/Co-Branded-Graphic-Guide-for-CPs.pdf) informa verde corporativo RGB 0,149,52, hexadecimal `#009534`. Também orienta preservar proporções e reservar espaço ao redor da marca. O guia é para banners e peças de parceiros; as cores de superfície e de componentes abaixo são propostas para a interface, não uma paleta digital completa oficialmente homologada pela MSA.

| Uso | Cor proposta | Natureza |
| --- | --- | --- |
| Verde da marca | `#009534` | Informado no guia MSA |
| Botão primário e links no tema claro | `#007A35` | Derivação para contraste |
| Lateral e painel de marca | `#173D2A` | Proposta; comparar com a lateral atual |
| Fundo | `#F4F6F4` | Proposta |
| Superfície | `#FFFFFF` | Proposta |
| Texto principal | `#172A20` | Proposta |
| Texto secundário | `#607068` | Proposta |
| Separadores | `#DDE5DF` | Proposta |

No cálculo de contraste, branco sobre `#009534` resulta em aproximadamente 3,93:1; branco sobre `#007A35`, em 5,48:1. Por isso, reservar o tom corporativo para identidade e gráficos e usar o tom derivado para botões com texto branco pequeno. A [referência W3C de contraste](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) exige pelo menos 4,5:1 para texto normal. Validar também as combinações de foco, estados e tema escuro.

Assets locais visualmente conferidos:

| Arquivo | Dimensões | Observação |
| --- | --- | --- |
| `C:\Users\Kauan\Pictures\msalogos\msalogo.png` | 540 × 178 | Marca branca em retângulo verde; adequada para aplicação horizontal |
| `C:\Users\Kauan\Pictures\msalogos\MSA.png` | 199 × 95 | Inclui assinatura em branco sobre preto; resolução pequena |
| `C:\Users\Kauan\Pictures\msalogos\msanobg.png` | 600 × 600 | Inclui assinatura preta e margens brancas; fundo opaco, sem transparência |

O verde dominante de `msalogo.png` e `msanobg.png` é `#00A950`; em `MSA.png`, é `#00953B`. Manter os arquivos originais, sem recoloração ou distorção. A diferença entre arquivos locais e guia oficial está registrada para não apresentá-los como cores equivalentes. Usar dimensões moderadas e uma superfície compatível com o fundo da imagem.

## Decisões de apresentação

- Login: composição dividida no desktop, marca à esquerda e formulário branco à direita; versão de uma coluna no celular. E-mail, senha, entrada e erros reais. Acesso ao simulador existente como ação secundária identificada.
- Dashboard: preservar os quatro indicadores, mas explicitar contexto, unidades e estados. Dar mais área ao gráfico de produção e uma área proporcional ao ranking de paradas.
- Gráficos: eixos e legenda legíveis, cores distinguíveis, tooltip contextual, seleção temporária de séries e consulta equivalente por teclado e toque. Preferir ajustes no Chart.js existente.
- Aquecimento: conjunto compacto e organizado de 21 zonas, com valor, unidade e estado textual; cores refletindo exclusivamente o estado já calculado.
- Demais páginas: mesmos tokens, espaçamentos, formulários, tabelas, badges, foco e mensagens. Conservar campos, ações, vínculos, permissões e resultados.
- Movimento: transições curtas de estado, sem atrasar consulta nem alterar a percepção de dados; respeitar redução de movimento.

## Limites e conclusão da etapa

Não há autorização nesta etapa para implementar a repaginação. O prompt separado autoriza essa implementação quando o usuário o enviar novamente.

Na futura execução, preservar serviços, regras Firebase, cálculos, unidades, natureza de parâmetros, versionamento, estados vazios e separação entre registros operacionais e simulador. A transcrição da reunião foi fornecida como parcial e incerta. Não transformar NHPL ou 290 peças/h em cadastro ou meta aprovada por causa de uma mudança visual. Não prometer coleta automática ou atualização industrial em tempo real sem integração.

O prompt pronto para execução está em `docs/PROMPT_REPAGINACAO_VISUAL_MSA.md`.
