Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$srcDir = Join-Path $repoRoot ".agents\skills"

if (-not (Test-Path -LiteralPath $srcDir)) {
  throw "Skill source directory not found: $srcDir"
}

$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
$codexDest = Join-Path $codexHome "skills"
$agentsDest = Join-Path $HOME ".agents\skills"

New-Item -ItemType Directory -Force -Path $codexDest | Out-Null
New-Item -ItemType Directory -Force -Path $agentsDest | Out-Null

Get-ChildItem -LiteralPath $srcDir -Directory | ForEach-Object {
  $skillName = $_.Name
  $codexSkillDest = Join-Path $codexDest $skillName
  $agentsSkillDest = Join-Path $agentsDest $skillName

  New-Item -ItemType Directory -Force -Path $codexSkillDest | Out-Null
  Copy-Item -Path (Join-Path $_.FullName "*") -Destination $codexSkillDest -Recurse -Force

  New-Item -ItemType Directory -Force -Path $agentsSkillDest | Out-Null
  Copy-Item -Path (Join-Path $_.FullName "*") -Destination $agentsSkillDest -Recurse -Force
}

Write-Output "Synced skills from $srcDir to $codexDest and $agentsDest"
