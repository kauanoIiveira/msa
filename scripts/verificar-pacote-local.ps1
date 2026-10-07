param([Parameter(Mandatory = $true)][string]$PackagePath)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$resolvedPackage = (Resolve-Path -LiteralPath $PackagePath).Path
$archive = [System.IO.Compression.ZipFile]::OpenRead($resolvedPackage)
try {
    $manifestEntry = $archive.GetEntry('msa/MANIFESTO_PACOTE.json')
    if (!$manifestEntry) { throw 'Manifesto do pacote ausente.' }
    $reader = [System.IO.StreamReader]::new($manifestEntry.Open())
    try { $manifest = $reader.ReadToEnd() | ConvertFrom-Json } finally { $reader.Dispose() }
    foreach ($file in $manifest.files) {
        $entry = $archive.GetEntry('msa/' + $file.path)
        if (!$entry -or $entry.Length -ne $file.bytes) { throw ('Arquivo ausente ou tamanho incorreto: ' + $file.path) }
        $stream = $entry.Open()
        $sha = [System.Security.Cryptography.SHA256]::Create()
        try { $hash = ([BitConverter]::ToString($sha.ComputeHash($stream))).Replace('-', '').ToLowerInvariant() }
        finally { $stream.Dispose(); $sha.Dispose() }
        if ($hash -ne $file.sha256) { throw ('Hash incorreto: ' + $file.path) }
    }
    foreach ($path in @('LEIA_PRIMEIRO.md', 'PROMPT_RETOMADA.md', 'package-lock.json', 'app/index.html', 'app/vendor/chart.umd.min.js', 'referencias-locais/MANIFESTO_FONTES.json', 'referencias-locais/git/msa-historico.bundle')) {
        if (!$archive.GetEntry('msa/' + $path)) { throw ('Arquivo essencial ausente: ' + $path) }
    }
    foreach ($entry in $archive.Entries) {
        if ($entry.FullName -match '(^|/)(node_modules|[.]git|[.]runtime)(/|$)|msa-(antes|depois|pre-remocao)[.]json$|regras-publicadas[.]json$') {
            throw ('Arquivo excluido encontrado: ' + $entry.FullName)
        }
        if ($entry.FullName -match '(^|/)[.]env' -and [System.IO.Path]::GetFileName($entry.FullName) -ne '.env.example') {
            throw ('Arquivo de ambiente encontrado: ' + $entry.FullName)
        }
        if ($entry.FullName -match '(^|/)[.][.](/|$)' -or $entry.FullName.StartsWith('/') -or $entry.FullName.Contains('\')) { throw 'Caminho invalido no pacote.' }
    }
    if ($archive.Entries.Count -ne @($manifest.files).Count + 2) { throw 'Contagem de entradas diverge do manifesto.' }
    [pscustomobject]@{ package = $resolvedPackage; files = @($manifest.files).Count; bytes = (Get-Item -LiteralPath $resolvedPackage).Length; sha256_check = 'OK'; essential_files = 'OK'; excluded_files = 'OK' } | ConvertTo-Json
} finally { $archive.Dispose() }
