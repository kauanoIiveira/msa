# RE, perfis de acesso e auditoria funcional

Conferência de 07/10/2026 no projeto local `msa-master` e no workspace remoto `msa`. Esta revisão atende ao pedido de organizar os acessos e verificar as funções existentes. As mudanças de produto ficaram no login por RE; as demais funções foram examinadas sem alteração.

## Entendimento organizado do pedido

1. Identificar as quatro contas de teste por RE, preservando os cinco dígitos e os zeros à esquerda.
2. Restringir as alterações às funções de cada perfil. Todos os membros autorizados continuam consultando os dados do seu workspace.
3. Conservar as proteções de negócio, inclusive a decisão de correções por outra pessoa.
4. Verificar os caminhos de cadastro, apontamentos, referências, metas, análises, correções, importação, exportação e consulta.
5. Distinguir dados ausentes, dados fictícios e amostras insuficientes. Registrar lacunas, sem preencher o banco ou modificar outras funções automaticamente.

## Login e contas

| RE | Perfil pretendido | Conta Firebase | Estado conferido |
|---|---|---|---|
| 00000 | Administração | adm@adm.com | Login e vínculo admin confirmados |
| 00001 | Engenharia | 00001@msa.test | Login, vínculo engineer e leitura dos dados confirmados |
| 00002 | Operação | 00002@msa.test | Login, vínculo operator e leitura dos dados confirmados |
| 00003 | Consulta | 00003@msa.test | Login, vínculo viewer e leitura dos dados confirmados |

O usuário escolheu senhas de teste iguais ao RE seguido de um zero para as quatro contas. A senha do administrador foi alterada e o novo login foi verificado. A exigência mínima de seis caracteres é do [Firebase Authentication](https://firebase.google.com/docs/auth/web/password-auth).

O campo inicial agora solicita RE e senha. A configuração `app/src/config/login-accounts.js` associa RE a e-mail; o Firebase continua autenticando a conta. Essa configuração não contém senhas nem concede perfis. O papel efetivo vem de `workspaces/msa/members/UID/role`.

Os três vínculos foram ativados pelo Console Firebase em 07/10/2026, após o usuário entrar com a conta Google administradora do projeto. Foram acrescentados somente os três nós de membros, preservando o administrador existente. A verificação autenticou os quatro REs, conferiu seus perfis e leu os dados de máquinas em cada conta. A evidência está em [ativacao-verificada.json](../output/acessos-2026-10-07/ativacao-verificada.json); [ATIVAR_PERFIS.md](../output/acessos-2026-10-07/ATIVAR_PERFIS.md) conserva os caminhos e os valores como referência. Nenhuma regra remota foi alterada.

## Matriz de funções conferida

| Função | Administração | Engenharia | Operação | Consulta |
|---|:---:|:---:|:---:|:---:|
| Consultar páginas e dados do workspace | Sim | Sim | Sim | Sim |
| Criar máquinas, processos, produtos, parâmetros e motivos | Sim | Não | Não | Não |
| Ativar/inativar cadastros gerais | Sim | Não | Não | Não |
| Criar versões de referência e metas | Sim | Sim | Não | Não |
| Registrar coletas, produção, perdas e paradas | Sim | Sim | Sim | Não |
| Encerrar paradas, importar coletas e propor análises/correções | Sim | Sim | Sim | Não |
| Iniciar e decidir análises | Sim | Sim | Não | Não |
| Decidir correção proposta por outra pessoa | Sim | Sim | Não | Não |
| Aprovar a própria correção | Não | Não | Não | Não |

As consultas incluem Dashboard, Parâmetros, Apontamentos, Engenharia, CEP, Histórico, Cadastros e Configurações. Ver uma página não concede sua função de alteração. O perfil Consulta pode cuidar da própria conta e das preferências locais; não grava operações ou decisões.

Os serviços rejeitam chamadas diretas não autorizadas. Os testes com o SDK contra o emulador comprovaram os bloqueios nas regras do banco. Alterar o papel de um membro revoga os serviços da sessão anterior. A escolha de RE não atribui um papel, e nenhum cliente pode elevar seu próprio vínculo.

Apresentação é uma consulta sem gravação para todos os perfis. A simulação local é um ambiente fictício em memória, no qual a demonstração de formulários continua disponível; ela não altera o workspace remoto.

## Dados e suficiência

| Registro no banco | Quantidade | Origem das operações |
|---|---:|---|
| Máquinas / processos / produtos | 1 / 1 / 2 | Cadastros do cenário existente |
| Parâmetros / versões / motivos / metas | 41 / 59 / 9 / 4 | Referências e cenário existente |
| Coletas | 28 | Todas `demo` |
| Produção | 56 | Todos `demo` |
| Perdas | 94 | Todas `demo` |
| Paradas | 29 | Todas `demo` |
| Análises / correções | 4 / 1 | Vinculadas ao cenário fictício |

As coletas cobrem 22/09 a 05/10/2026, com 14 coletas por produto. Não foram encontrados vínculos quebrados entre máquinas, processos, produtos, parâmetros, versões, registros e solicitações. Os 13 conjuntos de dados conferidos têm os mesmos hashes do snapshot de 06/10; registros e cadastros foram preservados.

- **Operacional:** vazia para os tipos de operação conferidos, porque todos os registros disponíveis são fictícios e são excluídos corretamente. Valores ausentes permanecem indisponíveis.
- **Apresentação:** contém dados consultáveis. No recorte inicial de 01/10 a 07/10 há cinco coletas por produto; no período completo, 14. Isso fica abaixo do mínimo inicial de 25 leituras por estudo CEP. Há também referências não aprovadas, setpoints e limite unilateral, que impedem capacidade bilateral conforme o caso.
- **Hora a hora:** os apontamentos existentes atravessam intervalos de horas. Eles não contêm detalhamento suficiente para preencher produção horária; o código conserva os totais sem rateá-los.
- **Metas:** as quatro metas existentes são para Selo A03, de 29/09 a 05/10/2026. No recorte correspondente, a consulta fictícia produz dois alertas de meta. Outros produtos ou períodos não usam essas metas como se fossem equivalentes.
- **Engenharia:** a ausência de solicitações em um produto/período é possível. Selo A05 não tem análises no cenário disponível; isso não representa uma falha de carregamento.

## Caminhos de uso e lacunas

### Cadastros e apontamentos

Foram conferidos os botões de Novo cadastro para máquinas, processos, produtos, parâmetros, motivos e metas, respeitando o perfil. Nova coleta, registros de produção/perdas/paradas, importação, envio à Engenharia, criação de versão e decisões aparecem conforme a permissão e o estado do registro.

Contexto relacional, unidades, períodos, justificativas, estados de análise, preservação de originais e decisões concorrentes foram exercitados nos testes. A prévia CSV não grava, a confirmação é explícita e uma reimportação idêntica não duplica registros. Uma parada encerrada não pode ser encerrada duas vezes.

### Falha: tabelas podem exibir produção e paradas fora do período

Na conta real, selecionando Apresentação, Selo A03 e 01/10–07/10, a tabela de produção exibe 28 registros. Dezoito terminaram antes do período selecionado; nas paradas, nove registros encerrados também ficam fora dele.

A busca de intervalos anteriores em `app/src/services/history.js:45` é necessária para encontrar eventos que atravessam a janela. Porém, os registros carregados são usados diretamente pelas tabelas em `app/src/ui/main.js`, sem eliminar os intervalos completamente externos. Os cálculos do dashboard aplicam seu recorte; a listagem pode contrariar o filtro exibido. Recomenda-se filtrar a apresentação da tabela conservando eventos que realmente sobrepõem o período. Não foi feita essa alteração.

Evidências: [interface-real.json](../output/acessos-2026-10-07/interface-real.json), [auditoria-dados.json](../output/acessos-2026-10-07/auditoria-dados.json) e [captura da tabela](../output/acessos-2026-10-07/periodo-producao-real.png).

### Falha: exportação CEP na sessão autenticada

Na conta real, Exportar relatório na página CEP baixou um arquivo contendo somente `[object Promise]`. A exportação geral aguarda a resposta; a ação CEP em `app/src/ui/main.js:846` passa a promessa da sessão protegida diretamente à função de download. A simulação usa um serviço síncrono e pode esconder essa diferença. Recomenda-se aguardar a exportação antes de construir o arquivo. Não foi feita essa alteração.

Evidência: [conteúdo baixado](../output/acessos-2026-10-07/cep-export-evidence.txt).

### Lacuna: alteração de metas existentes

A tela permite criar metas e o administrador pode ativar/inativar as existentes. Não há edição do valor, indicador ou vigência de uma meta cadastrada. O serviço `registry.update()` aceita somente nome, código e estado ativo; as regras também conservam os campos de definição. Acrescentar apenas um botão não resolveria a alteração do limite.

O formulário não oferece seletores de máquina, processo ou produto: utiliza o contexto que estava selecionado na consulta anterior. A página de Cadastros esconde esses filtros, e a linha de meta não mostra seu contexto completo ou seu limite. A escolha da máquina/meta fica pouco explícita. Recomenda-se definir um fluxo de revisão de meta que conserve rastreabilidade e explicite o contexto, antes de implementar a edição.

Evidências: `app/src/ui/forms.js:52`, `app/src/services/registry.js:38`, [campos do formulário conferidos](../output/acessos-2026-10-07/interface-real.json) e [captura das metas](../output/acessos-2026-10-07/metas-conta-real.png).

### Lacunas menores de interface

- A Engenharia pode atualizar nome/código/estado ativo de metas pelo serviço e pelas regras, mas o botão de ativar/inativar metas é mostrado somente à Administração.
- A Administração pode atualizar nome/código de cadastros gerais pelo serviço; a interface oferece criação e ativação/inativação, sem formulário de edição desses campos.

Essas diferenças foram registradas para decisão posterior, preservando o limite de alteração solicitado.

## Verificações realizadas

- 112 testes unitários passaram, incluindo a matriz de quatro perfis, REs inválidos, conservação de zeros e revogação por troca de papel.
- 17 testes de regras/integração passaram em `demo-msa`, com emuladores de Authentication e Realtime Database. Incluem chamadas diretas do SDK, usuário sem vínculo, imutabilidade, concorrência, importação e fluxo completo de correção.
- A interface foi conferida nos quatro perfis com dados temporários de teste. Um RE de administrador com membership Consulta continua sem botões operacionais.
- Login, senha visível/oculta, erros, tentativa duplicada, recarga, saída e retorno da simulação passaram no navegador.
- A tela de login passou em oito combinações de tamanho e tema. A foto e a logo completa permanecem; a escolha de tema fica nas Configurações.
- Os testes existentes de interface e importação/correção passaram em memória, sem gravação operacional remota.
- A conta real administrativa abriu as oito páginas, restaurou a sessão e saiu. As duas falhas descritas acima foram reproduzidas durante essa conferência.
- Após a ativação, as três novas contas reais entraram pela interface e exibiram seus respectivos perfis. Consulta permaneceu sem a ação Nova coleta. As sessões de teste foram encerradas, sem gravações operacionais; evidência em [ativacao-interface-verificada.json](../output/acessos-2026-10-07/ativacao-interface-verificada.json).
- A conferência após a ativação confirmou que os 13 conjuntos de dados operacionais e cadastros mantêm os mesmos hashes da auditoria anterior; evidência em [ativacao-dominio-preservado.json](../output/acessos-2026-10-07/ativacao-dominio-preservado.json).
- A verificação estática aprovou os 56 arquivos de `app/`. O package-lock permaneceu intacto.

Os testes aprovados não significam que todas as funções estejam sem lacunas. O parecer é: permissões existentes coerentes, login por RE implementado e os quatro perfis ativos; falhas de listagem/exportação e limitações de metas registradas. Nenhum dado operacional foi acrescentado para fazer painéis parecerem completos.
