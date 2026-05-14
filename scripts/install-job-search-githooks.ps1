Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = (& git rev-parse --show-toplevel 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($repoRoot)) {
  throw "This script must be run from inside the Job Search git repository."
}

$repoRoot = $repoRoot.Trim()
$hooksDir = Join-Path $repoRoot ".githooks"

if (-not (Test-Path -LiteralPath $hooksDir)) {
  throw "Git hooks directory not found: $hooksDir"
}

& git config core.hooksPath ".githooks"

if ($LASTEXITCODE -ne 0) {
  throw "Failed to configure core.hooksPath."
}

Write-Output "Configured git hooks path to .githooks"
