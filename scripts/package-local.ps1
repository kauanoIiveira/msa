$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$name = 'MSA_Continuidade_Local_' + (Get-Date -Format 'yyyy-MM-dd_HHmmss') + '.zip'
$target = Join-Path (Split-Path $root -Parent) $name
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$stream = [System.IO.File]::Open($target, [System.IO.FileMode]::CreateNew)
$zip = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Create, $false)
$manifest = [System.Collections.Generic.List[string]]::new()
function Add-PackageFile($file, $entry) {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file, $entry, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    $manifest.Add($entry)
}
try {
    $excluded = '/(node_modules|[.]git|[.]runtime|[.]superpowers|coverage)/|/output/scenario/|/[.]env[^/]*$|[.]log$'
    Get-ChildItem -LiteralPath $root -File -Recurse | Where-Object { $_.FullName.Replace([char]92, [char]47) -notmatch $excluded } | ForEach-Object {
        $entry = 'msa/' + $_.FullName.Substring($root.Length + 1).Replace([char]92, [char]47)
        Add-PackageFile $_.FullName $entry
    }
    $references = @('C:\Users\Kauan\Downloads\Analise_Materiais_MSA_2026.pdf', 'C:\Users\Kauan\Downloads\Dossie_MSA_SENAI_2026.pdf')
    foreach ($file in $references) {
        if (Test-Path -LiteralPath $file -PathType Leaf) { Add-PackageFile $file ('referencias_privadas/' + (Split-Path $file -Leaf)) }
    }
    $materials = 'C:\Users\Kauan\Desktop\MSA'
    if (Test-Path -LiteralPath $materials -PathType Container) {
        Get-ChildItem -LiteralPath $materials -File -Recurse | ForEach-Object {
            Add-PackageFile $_.FullName ('referencias_privadas/MSA/' + $_.FullName.Substring($materials.Length + 1).Replace([char]92, [char]47))
        }
    }
    $entry = $zip.CreateEntry('MANIFESTO.txt')
    $writer = New-Object System.IO.StreamWriter($entry.Open())
    try { $writer.WriteLine('Pacote privado de continuidade. Nao publicar no GitHub. Dumps do banco, .env e runtimes excluidos.'); foreach ($line in $manifest) { $writer.WriteLine($line) } } finally { $writer.Dispose() }
} finally { $zip.Dispose(); $stream.Dispose() }
Write-Output $target
Write-Output ('Arquivos: ' + $manifest.Count)
