# Prompt para executar a repaginação visual do sistema MSA

Quero que você execute a repaginação visual do sistema MSA neste projeto:

`C:\Users\Kauan\Documents\ChatGPT\Desafio de Ideias`

O resultado deve ter aparência atual, identidade MSA, gráficos bonitos e interativos, formulários bem resolvidos e leitura rápida para o trabalho diário. A prioridade é o login, o dashboard e os gráficos, seguida pela consistência das demais páginas. Este briefing autoriza a execução desse escopo. Continue até entregar e verificar o resultado local.

## Escopo autorizado

Preserve as funcionalidades existentes, campos, vínculos, permissões, cálculos, validações, consultas e resultados. Repagine como as informações e ações são apresentadas e permita pequenas interações de consulta que usem os mesmos dados.

A exceção de fluxo já autorizada é mostrar o login como primeira tela para quem não estiver autenticado. Preserve a restauração de sessão: uma sessão válida pode retornar diretamente ao sistema. Após autenticar, abra o dashboard ou o destino interno válido solicitado. Ao sair da sessão, volte ao login. Essa mudança deve reutilizar a autenticação atual, sem criar contas, papéis, credenciais ou uma autenticação fictícia.

A simulação local já existente precisa continuar acessível a partir do login como ação secundária, usando o fluxo atual de escolha de cenário. Identifique a simulação e preserve sua separação dos registros operacionais. Sair da simulação restaura o estado anterior, incluindo a sessão autenticada quando houver. Não apresente simulação como autenticação nem grave seus dados no Firebase.

Mantenha a estrutura, a ordem, a largura e o comportamento da barra lateral. Pode experimentar um verde escuro na lateral e refinar a aparência da seleção. Preserve links, ícones, rótulos e abertura do menu no celular.

## Direção visual e referências

Leia `docs/PESQUISA_REPAGINACAO_VISUAL_MSA.md` e confira as telas e o código atuais antes de editar. A direção escolhida é um painel industrial contemporâneo: superfícies claras, verde MSA, texto escuro, hierarquia precisa e detalhes visuais bem acabados. O login pode ter maior presença de marca. Mantenha os temas claro, escuro e sistema e suas preferências persistidas.

Referências pesquisadas:

- [Carbon Charts](https://charts.carbondesignsystem.com/bar): composição de barras, eixos, legendas e distinção de séries.
- [Carbon: tooltips](https://charts.carbondesignsystem.com/tooltips): consulta contextual dos valores.
- [Grafana: dashboards](https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/best-practices/): sequência do geral ao detalhe e cores com significado.
- [Geckoboard: operação](https://www.geckoboard.com/dashboard-examples/operations/warehouse-dashboard/): indicadores legíveis e gráficos organizados por tarefa.
- [Linear: login](https://linear.app/login) e [Ramp: login](https://app.ramp.com/sign-in): foco no acesso, formulário claro e ação principal evidente.

Adapte os princípios ao MSA. Preserve a identidade e o vocabulário do projeto. Não copie cores, marcas, métricas ou métodos de autenticação dessas referências.

Use as skills e os plugins que ajudarem, especialmente brainstorming, frontend-design, anti-ui-slop, stop-slop e webapp-testing quando aplicáveis. Use-os como apoio e mantenha liberdade criativa para produzir uma solução bonita, intuitiva, dinâmica e moderna. Este briefing e a preservação das funções orientam as decisões. Não transforme uma regra de estilo de skill em impedimento para uma solução melhor.

## Identidade MSA

As logos estão em `C:\Users\Kauan\Pictures\msalogos`. Examine-as e copie somente os assets necessários para uma pasta local do aplicativo, preservando os originais. A interface final deve funcionar sem depender desse caminho absoluto do Windows.

`msalogo.png` tem 540 × 178 e é adequado para aplicação horizontal. `MSA.png` tem 199 × 95 e inclui assinatura em branco sobre preto. `msanobg.png` tem 600 × 600, assinatura preta e fundo branco opaco. Seu nome não significa que seja transparente. Preserve proporções, assinatura incorporada, qualidade e respiro. Não redesenhe, distorça ou recolora a marca.

O [guia visual da MSA](https://assetlibrary.msasafety.com/m/59efd570f6a74543/original/Co-Branded-Graphic-Guide-for-CPs.pdf) informa `#009534` como verde corporativo. Os arquivos locais têm tons ligeiramente diferentes; mantenha-os intactos. Use tokens de interface inspirados nesta base:

- Marca: `#009534`.
- Ação primária e links no tema claro: `#007A35`.
- Painel de marca e possível lateral: `#173D2A`.
- Fundo: `#F4F6F4`; superfícies: `#FFFFFF`.
- Texto principal: `#172A20`; texto secundário: `#607068`.
- Separadores: `#DDE5DF`.

Somente o primeiro tom vem do guia; os demais são propostas de interface. Ajuste-os se necessário, medindo contraste. Branco sobre o verde corporativo resulta em aproximadamente 3,93:1; sobre o verde de ação proposto, 5,48:1. Use combinações legíveis para texto pequeno. Crie equivalentes próprios para o tema escuro. Diferencie verde de marca de verde de sucesso; alertas precisam de texto e sinais além da cor.

Refine a tipografia Manrope existente com tamanhos, pesos e espaçamentos consistentes. Use números tabulares em tabelas e indicadores. Busque uma composição elegante com bordas, profundidade e movimento dosados conforme sua utilidade. Evite o aspecto de template genérico.

## Login

Crie uma tela completa, com personalidade e formulário bem acabado. No desktop, use uma composição dividida: área de marca em verde profundo e área clara para o formulário. Trabalhe proporções e alinhamentos; o formulário deve ter largura confortável, aproximadamente 400 a 440 px. No celular, reorganize em uma coluna e priorize os campos e o botão de entrada.

Use a logo real. Como base de texto, “Produção e engenharia”, “Acesse sua conta” e “Use seu e-mail e senha para entrar”. O layout pode incluir um detalhe gráfico abstrato ligado à precisão industrial, sem imitar uma máquina ou tela de produção que não conhecemos. Não coloque KPIs inventados no login.

Inclua rótulos persistentes, e-mail, senha, ação de entrar, envio por Enter, preenchimento automático adequado e estados de foco, validação, carregamento e erro. Evite perda dos valores digitados após erro e envio duplicado. Reaproveite o mecanismo existente de mostrar/ocultar senha; se a apresentação exigir adaptar seu seletor, limite a mudança à UI. Recuperação de senha só deve aparecer se estiver conectada ao serviço existente e puder ser verificada. Não acrescente login social, cadastro público ou controles sem ação real. Não exponha credenciais de exemplo em campos preenchidos por padrão.

Mantenha a linguagem visível voltada à operação. Use “Entrar” no acesso; detalhes técnicos da conexão podem permanecer onde forem relevantes nas configurações. Não use “Desafio de Ideias” ou “protótipo” como identidade do produto. Preserve a identificação dos dados simulados.

## Dashboard e gráficos

Preserve os quatro indicadores atuais: produção bruta, tempo de parada, refugo e fila da Engenharia. Melhore contexto, hierarquia, unidade e leitura de suas notas. Mantenha máquina, processo, produto e período fáceis de reconhecer e selecionar, com os vínculos e filtros atuais.

Dê mais espaço útil aos gráficos e remova ruído de grades, margens e elementos decorativos. Rótulos de eixo e legenda devem ficar legíveis, normalmente entre 12 e 14 px. Títulos e unidades devem explicar o gráfico sem depender do tooltip.

- Produção por dia: manter barras agrupadas para produção bruta e peças boas, com cores distinguíveis, legenda clara e eixo iniciado em zero. Preservar a associação de cada série aos seus valores originais.
- Principais paradas: manter barras horizontais por motivo e duração em minutos, respeitando ranking e recorte atuais. Nomes longos devem continuar consultáveis.
- Histórico do parâmetro: manter gráfico de linha com data/hora e unidade, amostras e separação por versão. Preservar valores negativos, lacunas e ausência de amostras.
- Aquecimento: reorganizar as 21 zonas em um conjunto compacto e responsivo. Cada zona mantém identificação, valor, unidade, estado e acesso ao detalhe existente. Cor reflete o estado já calculado, sem inventar faixas térmicas ou disposição física da máquina.

Configure tooltips com data, nome da série, valor e unidade em português brasileiro. Reforce foco e realce do dado consultado. Permita mostrar/ocultar séries temporariamente com uma legenda acessível. A interação pode usar mouse e toque; ofereça consulta equivalente por teclado e uma alternativa textual ou tabular dos mesmos valores. O canvas sozinho não deve ser a única forma de acessar informação importante.

Expansão de um gráfico pode ser usada se ajudar e mostrar exatamente os mesmos dados. Evite controles de zoom ou filtros novos que alterem a consulta sem necessidade. Use transições curtas, sem contagem artificial de indicadores ou animação contínua. Respeite redução de movimento. Não suavize linhas de forma que sugira medições inexistentes.

Exiba limites ou metas apenas quando já estiverem disponíveis, aplicáveis e associados à mesma versão ou indicador. Não invente metas nem recalcule Cp/Cpk por causa do design. Mantenha as indicações de estimativa, não homologação, dados insuficientes, cobertura parcial e limites pendentes.

## Consistência das demais páginas

Parâmetros: refinar busca, tabela, valores, limites e badges. Melhorar o detalhe com gráfico e estatísticas, mantendo ações e versionamento.

Apontamentos: melhorar abas, tabelas e formulários de produção, parada, perda e coleta. Manter todos os campos, motivos, períodos e ações atuais.

Engenharia: dar clareza à fila, aos estados e às decisões existentes. Preservar permissões, justificativas e histórico. Manter a tabela e as abas atuais; não criar um novo processo de trabalho.

Histórico: priorizar datas, entidade, resultado e acesso ao detalhe. Preservar registros originais, revisões, correções e filtros.

Cadastros: harmonizar tabelas e formulários e tornar visíveis os vínculos já existentes entre máquina, processo e produto. Manter naturezas de parâmetro, versões, motivos e metas sem simplificar suas regras.

Configurações: aplicar o mesmo cuidado ao perfil, tema, acessibilidade e preferências, preservando seus controles e efeitos.

Padronize botões, campos, abas, badges, diálogos e feedback. Melhore a leitura sem esconder ações ou informações essenciais. Teste textos longos, foco, erro, vazio, carregamento, seleção, sucesso e desabilitado. Use texto direto em português brasileiro, sem numeração decorativa de seções, travessões em textos visíveis ou slogans genéricos de tecnologia.

## Preservação técnica e dos dados

Mantenha a stack atual de HTML, CSS e JavaScript modular, Chart.js e Lucide. A repaginação não justifica migrar para React ou substituir a biblioteca de gráficos. Priorize `app/styles.css`, marcação e eventos de apresentação em `app/src/ui/main.js`, opções em `app/src/ui/charts.js`, assets e o ponto de entrada necessário ao login. Preserve os contratos dos formulários e os seletores funcionais; adapte e verifique apenas o que a nova apresentação exigir.

Não altere regras Firebase, serviços, modelo de dados, cálculos estatísticos, metas, catálogo técnico ou esquema de versionamento. Não escreva dados no ambiente operacional para validar aparência. Preserve o workspace `msa` e o isolamento do simulador.

Dados ausentes devem continuar ausentes: “Sem dados”, “Sem leitura” ou o estado correspondente, sem zeros saudáveis inventados. Preserve distinções entre leitura válida, setpoint, fora de limite, limite pendente e dado inválido. Não some peças e kg nem troque a unidade para caber no layout.

A reunião indica interesse em acompanhamento mais rápido e microparadas, mas sua transcrição foi fornecida como parcial e incerta. Não cadastrar NHPL, tratar 290 peças/h como meta aprovada, implementar um painel horário ou anunciar coleta automática por causa da repaginação. OCR, IoT, CLP/IHM, IA e novas integrações ficam fora deste escopo. A aparência não deve prometer conexão industrial que ainda não foi realizada.

## Validação e entrega

Antes de editar, registre o estado atual e preserve mudanças anteriores do usuário. Faça uma execução local com mudanças pequenas e revisáveis. Não publique nem faça commit ou push sem pedido.

Valide login, sessão restaurada, saída, erros e acesso ao simulador, sem usar credenciais inventadas como autenticação real. Confira as sete páginas, filtros, formulários, detalhes, exportação, temas e permissões que estiverem disponíveis no ambiente local. Reutilize os testes existentes e acrescente testes específicos somente quando necessários para a mudança de entrada ou uma regressão observada. Execute os checks estáticos e funcionais pertinentes ao projeto.

Confira visualmente notebook, desktop, tablet e celular, por exemplo 1366, 1440, 768 e 390 px, nos temas claro e escuro. Verifique cortes, rolagem horizontal indevida, nomes longos, alvos de toque, teclado e contraste. Use cenários sintéticos identificados para os estados de dados preenchidos e também valide o estado vazio real. Registre capturas do resultado e confira o console.

Entregue o resultado local implementado, com um relato curto do que mudou, arquivos principais, evidências visuais, verificações realizadas e limitações de verificação. Confirme a preservação das funções com evidência; não declare “100% funcional” apenas pela aparência ou pelo código. Se surgir um problema de regra ou dados fora do escopo, relate-o separadamente e continue a repaginação sem corrigi-lo por conta própria.
