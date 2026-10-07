param(
    [string]$MaterialsPath = 'C:\Users\Kauan\Desktop\Grupo Amarelo - MSA Brasil',
    [string]$LogosPath = 'C:\Users\Kauan\Pictures\msalogos'
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$localRoot = Join-Path $projectRoot 'referencias-locais'
New-Item -ItemType Directory -Path $localRoot -Force | Out-Null
$copiedSources = [System.Collections.Generic.List[object]]::new()
$missingSources = [System.Collections.Generic.List[string]]::new()

function Copy-VerifiedSource([string]$sourcePath, [string]$relativeDestination, [string]$group) {
    if (!(Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
        $missingSources.Add($sourcePath)
        return
    }
    $destinationPath = Join-Path $localRoot $relativeDestination
    New-Item -ItemType Directory -Path (Split-Path $destinationPath -Parent) -Force | Out-Null
    $originalHash = (Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash.ToLowerInvariant()
    if (Test-Path -LiteralPath $destinationPath) {
        if ((Get-FileHash -LiteralPath $destinationPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $originalHash) {
            throw "A copia local ja existe com conteudo diferente; preservada: $relativeDestination"
        }
    } else {
        Copy-Item -LiteralPath $sourcePath -Destination $destinationPath
    }
    if ((Get-FileHash -LiteralPath $destinationPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $originalHash) {
        throw "Falha de integridade: $relativeDestination"
    }
    $copiedSources.Add([pscustomobject]@{
        grupo = $group
        origem = $sourcePath
        destino = ('referencias-locais/' + $relativeDestination.Replace([char]92, [char]47))
        bytes = (Get-Item -LiteralPath $destinationPath).Length
        sha256 = $originalHash
    })
}

function Copy-VerifiedTree([string]$sourceDirectory, [string]$relativeDirectory, [string]$group) {
    if (!(Test-Path -LiteralPath $sourceDirectory -PathType Container)) {
        $missingSources.Add($sourceDirectory)
        return
    }
    Get-ChildItem -LiteralPath $sourceDirectory -File -Recurse | ForEach-Object {
        Copy-VerifiedSource $_.FullName (Join-Path $relativeDirectory $_.FullName.Substring($sourceDirectory.Length + 1)) $group
    }
}

Copy-VerifiedTree $MaterialsPath 'materiais' 'Materiais fornecidos e documentos da equipe'
Copy-VerifiedTree $LogosPath 'logos' 'Identidade MSA'
Copy-VerifiedTree (Join-Path $projectRoot 'tmp/continuidade-drive') 'drive-materializado' 'Copias do Drive preservadas por ID'
Copy-VerifiedSource 'C:\Users\Kauan\Downloads\Analise_Materiais_MSA_2026.pdf' 'pdfs-adicionais/Analise_Materiais_MSA_2026.pdf' 'PDF local'
Copy-VerifiedSource 'C:\Users\Kauan\Downloads\Dossie_MSA_SENAI_2026.pdf' 'pdfs-adicionais/Dossie_MSA_SENAI_2026.pdf' 'PDF local'
Copy-VerifiedSource 'C:\Users\Kauan\.codex\attachments\989777ab-36cb-43d2-9933-7404448bbfb0\Texto colado.txt' 'contexto-historico/PEDIDO_ORIGINAL_ANEXADO.txt' 'Pedido original do usuario'
Copy-VerifiedSource 'C:\Users\Kauan\.codex\memories\extensions\ad_hoc\notes\2026-10-06T18-10-00-msa-conferencia-fontes.md' 'contexto-historico/2026-10-06-fontes-e-continuidade.md' 'Nota historica de contexto'
Copy-VerifiedSource 'C:\Users\Kauan\.codex\memories\extensions\ad_hoc\notes\2026-10-06T18-41-25-msa-entrevista-parcial.md' 'contexto-historico/2026-10-06-entrevista-parcial.md' 'Nota historica de contexto'

$sourceManifest = [pscustomobject]@{
    preparado_para = 'Retomada local em 07/10/2026'
    gerado_utc = [DateTime]::UtcNow.ToString('o')
    aviso = 'Arquivos originais copiados sem edicao. Notas e contagens antigas descrevem sua epoca; ler LEIA_PRIMEIRO.md da raiz para o estado corrente.'
    arquivos = $copiedSources
    fontes_nao_encontradas = $missingSources
}
$manifestPath = Join-Path $localRoot 'MANIFESTO_FONTES.json'
$sourceManifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
Write-Output ("Fontes copiadas e conferidas: {0}; indisponiveis: {1}" -f $copiedSources.Count, $missingSources.Count)
Write-Output $manifestPath
