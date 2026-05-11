param(
    [switch]$SkipOpenChrome,
    [switch]$OpenTeal
)

$ErrorActionPreference = "Stop"

$manifestPath = Join-Path $env:LOCALAPPDATA "OpenAI\extension\com.openai.codexextension.json"
$pluginRoot = Join-Path $HOME ".codex\plugins\cache\openai-bundled\chrome\latest"
$openChromeScript = Join-Path $pluginRoot "scripts\open-chrome-window.js"
$checkChromeRunningScript = Join-Path $pluginRoot "scripts\chrome-is-running.js"
$checkExtensionScript = Join-Path $pluginRoot "scripts\check-extension-installed.js"
$checkManifestScript = Join-Path $pluginRoot "scripts\check-native-host-manifest.js"
$tealUrl = "https://app.tealhq.com/"

if (-not (Test-Path -LiteralPath $manifestPath)) {
    throw "Codex Chrome native host manifest not found at $manifestPath"
}

$requiredScripts = @(
    $openChromeScript,
    $checkChromeRunningScript,
    $checkExtensionScript,
    $checkManifestScript
)

foreach ($scriptPath in $requiredScripts) {
    if (-not (Test-Path -LiteralPath $scriptPath)) {
        throw "Required bundled Chrome script not found at $scriptPath"
    }
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$hostPath = $manifest.path

if ([string]::IsNullOrWhiteSpace($hostPath) -or -not (Test-Path -LiteralPath $hostPath)) {
    throw "Codex Chrome native host binary not found at $hostPath"
}

$hostProcesses = Get-Process -Name "extension-host" -ErrorAction SilentlyContinue |
    Where-Object { $_.Path -eq $hostPath }

if ($hostProcesses) {
    $hostProcesses | Stop-Process -Force

    foreach ($process in $hostProcesses) {
        Wait-Process -Id $process.Id -ErrorAction SilentlyContinue
    }

    Write-Host ("Stopped {0} Codex Chrome host process(es)." -f $hostProcesses.Count)
}
else {
    Write-Host "No matching Codex Chrome host processes were running."
}

Write-Host "Validating bundled Chrome bridge prerequisites..."
node $checkManifestScript --json
node $checkExtensionScript --json
node $checkChromeRunningScript --json

if (-not $SkipOpenChrome) {
    node $openChromeScript
    Write-Host "Opened a fresh Chrome window for the selected profile."
}

if ($OpenTeal) {
    $extension = node $checkExtensionScript --json | ConvertFrom-Json
    $profileDirectory = Split-Path -Leaf $extension.profilePath
    Start-Process -FilePath "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList @("--profile-directory=$profileDirectory", $tealUrl)
    Write-Host "Opened TealHQ in Google Chrome: $tealUrl"
}

Write-Host "Codex Chrome bridge repair complete. Re-run the browser task in Codex."
