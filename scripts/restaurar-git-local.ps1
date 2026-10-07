$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
if (Test-Path -LiteralPath (Join-Path $projectRoot '.git')) {
    Write-Output 'Este checkout ja tem Git. Nenhum metadado ou arquivo foi alterado.'
    exit 0
}
$bundlePath = Join-Path $projectRoot 'referencias-locais/git/msa-historico.bundle'
$statePath = Join-Path $projectRoot 'referencias-locais/git/ESTADO_GIT.json'
if (!(Test-Path -LiteralPath $bundlePath) -or !(Test-Path -LiteralPath $statePath)) { throw 'Historico local indisponivel: copie o ZIP completo.' }
$gitState = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
$transferBranch = [string]$gitState.branch
$transferCommit = [string]$gitState.head
if ($transferCommit -notmatch '^[a-f0-9]{40}$') { throw 'Commit de origem invalido.' }
git check-ref-format --branch $transferBranch | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Branch de origem invalida.' }
git -C $projectRoot init --initial-branch=$transferBranch | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Falha ao iniciar os metadados Git.' }
git -C $projectRoot fetch $bundlePath "refs/heads/${transferBranch}"
if ($LASTEXITCODE -ne 0) { throw 'Falha ao restaurar o historico.' }
# --mixed atualiza somente HEAD/indice; mantem os arquivos atuais e suas alteracoes.
git -C $projectRoot reset --mixed $transferCommit | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Falha ao preparar o indice Git.' }
Write-Output 'Historico da branch restaurado; arquivos atuais e mudancas locais preservados.'
Write-Output 'Nenhum remoto configurado, commit criado ou conteudo publicado.'
