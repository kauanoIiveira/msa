param([string]$DestinationDirectory = '')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
if (!$DestinationDirectory) { $DestinationDirectory = Join-Path $projectRoot 'output/transferencia' }
New-Item -ItemType Directory -Path $DestinationDirectory -Force | Out-Null
$archivePath = Join-Path $DestinationDirectory ('MSA_Continuidade_Local_' + (Get-Date -Format 'yyyy-MM-dd_HHmmss') + '.zip')
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archiveStream = [System.IO.File]::Open($archivePath, [System.IO.FileMode]::CreateNew)
$archive = [System.IO.Compression.ZipArchive]::new($archiveStream, [System.IO.Compression.ZipArchiveMode]::Create, $false)
$entries = [System.Collections.Generic.List[object]]::new()
$skipped = [System.Collections.Generic.List[string]]::new()
function Write-ArchiveText([string]$entryPath, [string]$content) {
    $entry = $archive.CreateEntry($entryPath)
    $writer = [System.IO.StreamWriter]::new($entry.Open(), [System.Text.UTF8Encoding]::new($false))
    try { $writer.Write($content) } finally { $writer.Dispose() }
}
try {
    foreach ($file in Get-ChildItem -LiteralPath $projectRoot -File -Recurse -Force) {
        $relativePath = $file.FullName.Substring($projectRoot.Length + 1).Replace([char]92, [char]47)
        $excluded = $relativePath -match '(^|/)(node_modules|[.]git|[.]runtime|[.]superpowers|coverage|__pycache__|[.]pytest_cache)(/|$)'
        $excluded = $excluded -or $relativePath -match '^(tmp/|output/transferencia/|output/scenario/)'
        $excluded = $excluded -or $relativePath -match '^output/auditoria-2026-10-06/(msa-(antes|depois|pre-remocao)|regras-publicadas)[.]json$'
        $excluded = $excluded -or (($relativePath -match '(^|/)[.]env') -and $file.Name -ne '.env.example')
        $excluded = $excluded -or $file.Name -match '(^|[-])debug[.]log$|^(Thumbs[.]db|[.]DS_Store)$|[.]py[co]$'
        $excluded = $excluded -or $file.FullName -eq $archivePath
        if ($excluded) { $skipped.Add($relativePath); continue }
        $hashBefore = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, ('msa/' + $relativePath), [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        if ((Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant() -ne $hashBefore) {
            throw "Arquivo mudou durante o empacotamento: $relativePath. Gere um novo pacote depois de concluir as edicoes."
        }
        $entries.Add([pscustomobject]@{ path = $relativePath; bytes = $file.Length; sha256 = $hashBefore })
    }
    $manifest = [pscustomobject]@{
        version = 1
        created_utc = [DateTime]::UtcNow.ToString('o')
        purpose = 'Transferencia local completa; inclui fontes privadas e trabalho ainda nao commitado. Nao publicar o ZIP inteiro.'
        start_here = 'LEIA_PRIMEIRO.md'
        prompt = 'PROMPT_RETOMADA.md'
        files = $entries
        excluded_count = $skipped.Count
        excluded_policy = @('Dependencias instalaveis, runtimes e caches', 'Metadados .git: historico preservado em referencias-locais/git/msa-historico.bundle', 'Arquivos .env e logs de depuracao', 'Temporarios, pacotes anteriores e dados de seed', 'Snapshots brutos do banco remoto: preservados no computador original')
    }
    Write-ArchiveText 'msa/MANIFESTO_PACOTE.json' ($manifest | ConvertTo-Json -Depth 5)
    Write-ArchiveText 'ABRA_PRIMEIRO.txt' "Extraia o ZIP inteiro. Entre na pasta msa e leia LEIA_PRIMEIRO.md. O prompt para a IA esta em PROMPT_RETOMADA.md. Este pacote inclui documentos privados da equipe e fontes da empresa; .gitignore conserva esses materiais fora do GitHub. O codigo mais recente esta nos arquivos do pacote, incluindo alteracoes ainda nao commitadas. Nao substitua esta pasta por um clone antigo."
} finally { $archive.Dispose(); $archiveStream.Dispose() }
Write-Output $archivePath
Write-Output ('Arquivos preservados: ' + $entries.Count)
