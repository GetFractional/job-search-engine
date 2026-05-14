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

function Test-SkillName {
  param(
    [Parameter(Mandatory = $true)]
    [string]$SkillName
  )

  if ([string]::IsNullOrWhiteSpace($SkillName) -or $SkillName -in @(".", "..")) {
    return $false
  }

  if ($SkillName.IndexOfAny([System.IO.Path]::GetInvalidFileNameChars()) -ge 0) {
    return $false
  }

  return $SkillName -match '^[A-Za-z0-9._-]+$'
}

function Remove-ManagedSkillDirectory {
  param(
    [Parameter(Mandatory = $true)]
    [string]$DestinationRoot,
    [Parameter(Mandatory = $true)]
    [string]$SkillName
  )

  if (-not (Test-SkillName -SkillName $SkillName)) {
    throw "Invalid managed skill name: $SkillName"
  }

  $destinationFull = [System.IO.Path]::GetFullPath($DestinationRoot).TrimEnd([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar)
  $skillPath = Join-Path $destinationFull $SkillName

  if (Test-Path -LiteralPath $skillPath) {
    $resolvedSkillPath = (Resolve-Path -LiteralPath $skillPath).Path
    $expectedPrefix = $destinationFull + [System.IO.Path]::DirectorySeparatorChar
    if (-not $resolvedSkillPath.StartsWith($expectedPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
      throw "Refusing to remove path outside skill mirror: $resolvedSkillPath"
    }

    Remove-Item -LiteralPath $resolvedSkillPath -Recurse -Force
  }
}

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
    if (-not (Test-SkillName -SkillName $managedSkillName)) {
      throw "Invalid managed skill name in marker: $managedSkillName"
    }

    if ($currentSkillNames -contains $managedSkillName) {
      continue
    }

    Remove-ManagedSkillDirectory -DestinationRoot $DestinationRoot -SkillName $managedSkillName
  }

  foreach ($sourceSkillDir in $SourceSkillDirs) {
    if (-not (Test-SkillName -SkillName $sourceSkillDir.Name)) {
      throw "Invalid source skill directory name: $($sourceSkillDir.Name)"
    }

    $destinationSkillPath = Join-Path $DestinationRoot $sourceSkillDir.Name
    Remove-ManagedSkillDirectory -DestinationRoot $DestinationRoot -SkillName $sourceSkillDir.Name

    Copy-Item -LiteralPath $sourceSkillDir.FullName -Destination $DestinationRoot -Recurse -Force
  }

  $markerPath = Join-Path $DestinationRoot $managedMarker
  Set-Content -LiteralPath $markerPath -Value $currentSkillNames
}

$sourceSkillDirs = @(Get-ChildItem -LiteralPath $srcDir -Directory | Sort-Object Name)
Sync-SkillMirror -DestinationRoot $codexDest -SourceSkillDirs $sourceSkillDirs
Sync-SkillMirror -DestinationRoot $agentsDest -SourceSkillDirs $sourceSkillDirs

Write-Output "Synced skills from $srcDir to $codexDest and $agentsDest"
