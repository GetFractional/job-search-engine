$ErrorActionPreference = "Stop"

$ensureScript = Join-Path $PSScriptRoot "ensure-codex-chrome-bridge.ps1"

if (-not (Test-Path -LiteralPath $ensureScript)) {
    throw "Codex Chrome bridge preflight script was not found at $ensureScript"
}

& powershell -ExecutionPolicy Bypass -File $ensureScript -Repair -OpenTeal
