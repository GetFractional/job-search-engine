$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $PSScriptRoot "scripts\open-teal-chrome.ps1"

if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Teal Chrome launcher was not found at $scriptPath"
}

& powershell -ExecutionPolicy Bypass -File $scriptPath
