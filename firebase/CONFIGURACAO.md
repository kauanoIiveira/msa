# Configuracao Firebase

## Testes Locais

Os comandos de emulador so usam demo-msa. JAVA_HOME e PATH sao ajustados no processo de testes, nao no Windows inteiro. Usar JDK >=21; obter distribuicao oficial e conferir checksum antes de extrair.

Fonte das regras: rules-source.mjs. Gerar com `node firebase/rules-source.mjs`; database.rules.json e o artefato que sera publicado. Modificar a fonte e executar testes antes de qualquer deploy. O uso de slots 0..99 nas revisoes de leituras permite impedir exclusao de entradas durante uma decisao sem comparar objetos por RuleDataSnapshot.val().

## Antes De Conectar Usuarios Reais

1. No Console do projeto msayellowteam, habilitar Authentication > Sign-in method > Email/Password.
2. Criar usuarios autorizados no Authentication e guardar seus UIDs. Nao colocar senhas em codigo, RTDB, Git ou exemplos.
3. Provisionar pelo Console o caminho `workspaces/demo/members/UID/role`, com admin, operator, engineer ou viewer. Cliente nao cadastra nem eleva membros. Criar workspace de piloto separado quando autorizado.
4. Revisar e publicar database.rules.json no Realtime Database. Nao usar regras abertas para contornar permission_denied.
5. Verificar dominio final do Pages nas configuracoes aplicaveis de Auth, App Check e restricoes da chave. A chave web nao e credencial administrativa.
6. Testar remotamente um membro permitido e um usuario sem vinculo, incluindo acesso direto pelo SDK. Confirmar que viewer nao grava e operator nao decide analises.
7. Somente depois realizar uma demonstracao com dados sinteticos explicitamente identificados. Importar dados reais exige selecao e confirmacao explicitas.

Nao executar deploy remoto automaticamente. Publicar codigo no GitHub nao aplica regras no Firebase. A validacao local nao comprova configuracao da nuvem.

## Papeis

- admin: cadastros/metas, apontamentos, analise e decisao. Nao aprova a propria solicitacao de correcao.
- operator: apontamentos, solicitoes de analise/correcao e consultas.
- engineer: versoes de parametros/metas, apontamentos e decisoes da Engenharia. Nao aprova a propria solicitacao de correcao.
- viewer: consulta. Sem escrita.

Todos leem somente seu workspace; members permite leitura do proprio vinculo. Nenhum cliente, inclusive admin, provisiona membros pelas regras web.

## Operacao

Firestore/Storage/Analytics nao sao usados. O banco e Realtime Database, URL centralizada no config. Auth autentica; regras autorizam cada escrita.

Conectividade pode ser observada por watchConnection no repositorio. Promessas de escrita so retornam apos confirmacao e releitura do servidor. Sem conexao, podem permanecer pendentes; nao chamar um resultado local de salvo. Logout invalida funcoes/listeners da sessao anterior. Nao ha garantia de fila offline depois de fechar a pagina.
