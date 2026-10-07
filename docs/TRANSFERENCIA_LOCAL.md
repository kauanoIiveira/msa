# Trabalhar em outro computador

> Atualização de 06/10/2026: o usuário autorizou publicar na master também as fontes, os documentos e os artefatos locais do projeto. As menções anteriores a materiais fora do Git e a mudanças ainda não publicadas descrevem a preparação anterior. O .gitignore atual exclui ambientes instalados, caches e cópias temporárias de teste.

## Abrir o pacote

Extraia o ZIP inteiro e abra a pasta `msa` no editor. Comece por [LEIA_PRIMEIRO](../LEIA_PRIMEIRO.md) e envie [PROMPT_RETOMADA](../PROMPT_RETOMADA.md) à IA. O pacote inclui os arquivos locais mais recentes, mesmo os ainda não commitados.

Instale Node.js >= 22. Em um terminal dentro da pasta:

```powershell
node --version
npm ci --ignore-scripts
npm run prepare:vendor
npm start
```

Abra `http://127.0.0.1:5173` e mantenha o terminal aberto. A instalação usa o lockfile incluído. O comando `prepare:vendor` prepara as bibliotecas da interface a partir dessas dependências.

Se a porta estiver ocupada, use outro número sem encerrar processos desconhecidos:

```powershell
$env:PORT = '5174'
npm start
```

Nesse caso, abra `http://127.0.0.1:5174`. O atalho `index.html` da raiz pressupõe a porta 5173.

## Acesso e dados

O aplicativo começa pelo login. Credenciais devem ser obtidas com a equipe; o pacote não contém senha de conta ou chave privada. A configuração pública do aplicativo Firebase está no código, como necessária para o cliente web, e não concede autorização administrativa.

Use o botão de simulação disponível na entrada do sistema para explorar os 13 cenários sem autenticação e sem gravação no Firebase. Os cenários são temporários, em memória. Dados reais e sessão dependem de conexão e permissões do projeto.

O servidor local entrega apenas `app/`. Os documentos privados do pacote não são servidos pelo aplicativo. O SDK remoto do Firebase e recursos externos, como VLibras, ainda podem depender de internet; não foi validada uma operação totalmente offline.

## Verificar a instalação

```powershell
npm test
npm run verify:static -- --deploy
```

O argumento `--deploy` do verificador confere a estrutura estática; esse comando não publica o site.

Veja os resultados da cópia extraída em [Verificação da transferência](VERIFICACAO_TRANSFERENCIA_LOCAL.md). Para conferir um ZIP recebido sem alterá-lo:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verificar-pacote-local.ps1 -PackagePath 'caminho-do-pacote.zip'
```

Testes com emulador exigem o ambiente Java indicado pelos scripts, atualmente JDK 21, e usam um projeto de teste `demo-msa`. Os runtimes instalados na máquina original não acompanham o pacote.

Os testes de navegador precisam de Playwright e Chromium instalados à parte. Não são pré-requisito para abrir o sistema. Se a equipe usar uma instalação externa de Playwright, configure `PLAYWRIGHT_MODULE` para o módulo local disponível. Não reutilize um caminho absoluto da máquina do Kauan.

`tests/browser/firebase-ui.mjs` acessa o Firebase real e grava informações de perfil. Não executá-lo como teste automático de transferência. Scripts históricos de auditoria, carga e extração também devem ser lidos antes de executar; alguns registram caminhos antigos ou operações de dados.

## Recuperar o histórico Git, se necessário

O ZIP não contém a pasta `.git`. O histórico das branches locais acompanha `referencias-locais/git/msa-historico.bundle`, junto do estado de origem em `ESTADO_GIT.json`. Os arquivos do ZIP representam o trabalho atual; o bundle representa o histórico commitado.

Com Git instalado, na pasta extraída:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/restaurar-git-local.ps1
git status
```

O script recupera a branch de origem e prepara o índice com `reset --mixed`, preservando os arquivos e as alterações locais. Se a pasta já tiver Git, ele não modifica nada. Não cria commit, configura remoto ou publica conteúdo.

Combinem quem editará cada parte e como compartilharão as mudanças antes de trabalhar simultaneamente em cópias distintas. O bundle também conserva as demais branches locais; o script restaura inicialmente apenas a branch de trabalho registrada.

## O que acompanha e o que fica de fora

Entram código, lockfile, testes, documentação, fontes locais, imagens, áudio, planilha, logos, relatórios e evidências úteis. O manifesto interno `MANIFESTO_PACOTE.json` registra os hashes dos arquivos incluídos.

Ficam de fora dependências instaláveis, `.git`, caches, runtimes, arquivos `.env`, logs de depuração, temporários, pacotes anteriores e snapshots brutos do banco remoto. Esses snapshots permanecem no computador original e não são necessários para executar a aplicação. Os diretórios de fontes privadas estão excluídos do Git, mas acompanham o ZIP.

O script `preparar-fontes-locais.ps1` foi usado uma vez para reunir materiais dispersos do computador original. Não é necessário executá-lo na outra máquina: as cópias já estão incluídas. Para gerar um novo ZIP após trabalhar:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/package-local.ps1
```

O ZIP será criado em `output/transferencia/`. Não publicar esse ZIP inteiro. Ao preparar o GitHub no fim do trabalho, revisar os arquivos, respeitar `.gitignore` e decidir separadamente sobre qualquer material da empresa ou contato pessoal. Nenhuma publicação foi feita nesta preparação.
