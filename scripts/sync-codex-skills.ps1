Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$srcDir = Join-Path $repoRoot ".agents\skills"
$managedMarker = ".job-search-managed-skills.txt"

if (-not (Test-Path -LiteralPath $srcDir)) {
  throw "Skill source directory not found: $srcDir"
}

$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
$codexDest = Join-Path $codexHome "skills"
$agentsDest = Join-Path $HOME ".agents\skills"

function Get-ManagedSkillNames {
  param(
    [Parameter(Mandatory = $true)]
    [string]$DestinationRoot
  )

  $markerPath = Join-Path $DestinationRoot $managedMarker
  if (-not (Test-Path -LiteralPath $markerPath)) {
    return @()
  }

  return Get-Content -LiteralPath $markerPath | Where-Object { $_.Trim() -ne "" }
}

function Sync-SkillMirror {
  param(
    [Parameter(Mandatory = $true)]
    [string]$DestinationRoot,
    [Parameter(Mandatory = $true)]
    [System.IO.DirectoryInfo[]]$SourceSkillDirs
  )

  New-Item -ItemType Directory -Force -Path $DestinationRoot | Out-Null

  $currentSkillNames = @($SourceSkillDirs | ForEach-Object { $_.Name })
  $managedSkillNames = Get-ManagedSkillNames -DestinationRoot $DestinationRoot

  foreach ($managedSkillName in $managedSkillNames) {
    if ($currentSkillNames -contains $managedSkillName) {
      continue
    }

    $staleSkillPath = Join-Path $DestinationRoot $managedSkillName
    if (Test-Path -LiteralPath $staleSkillPath) {
      Remove-Item -LiteralPath $staleSkillPath -Recurse -Force
    }
  }

  foreach ($sourceSkillDir in $SourceSkillDirs) {
    $destinationSkillPath = Join-Path $DestinationRoot $sourceSkillDir.Name
    if (Test-Path -LiteralPath $destinationSkillPath) {
      Remove-Item -LiteralPath $destinationSkillPath -Recurse -Force
    }

    Copy-Item -LiteralPath $sourceSkillDir.FullName -Destination $DestinationRoot -Recurse -Force
  }

  $markerPath = Join-Path $DestinationRoot $managedMarker
  Set-Content -LiteralPath $markerPath -Value $currentSkillNames
}

$sourceSkillDirs = @(Get-ChildItem -LiteralPath $srcDir -Directory | Sort-Object Name)
Sync-SkillMirror -DestinationRoot $codexDest -SourceSkillDirs $sourceSkillDirs
Sync-SkillMirror -DestinationRoot $agentsDest -SourceSkillDirs $sourceSkillDirs

Write-Output "Synced skills from $srcDir to $codexDest and $agentsDest"
