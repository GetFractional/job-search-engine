param(
    [switch]$Repair,
    [switch]$OpenTeal
)

$ErrorActionPreference = "Stop"

$pluginRoot = Join-Path $HOME ".codex\plugins\cache\openai-bundled\chrome\latest"
$checkChromeRunningScript = Join-Path $pluginRoot "scripts\chrome-is-running.js"
$checkExtensionScript = Join-Path $pluginRoot "scripts\check-extension-installed.js"
$checkManifestScript = Join-Path $pluginRoot "scripts\check-native-host-manifest.js"
$repairScript = Join-Path $PSScriptRoot "repair-codex-chrome-bridge.ps1"
$tealUrl = "https://app.tealhq.com/"

$requiredScripts = @(
    $checkChromeRunningScript,
    $checkExtensionScript,
    $checkManifestScript,
    $repairScript
)

foreach ($scriptPath in $requiredScripts) {
    if (-not (Test-Path -LiteralPath $scriptPath)) {
        throw "Required script not found at $scriptPath"
    }
}

function Invoke-JsonScript {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ScriptPath
    )

    $output = node $ScriptPath --json
    if ($LASTEXITCODE -gt 1) {
        throw "Script failed: $ScriptPath"
    }

    return $output | ConvertFrom-Json
}

function Show-BridgeReport {
    param(
        [Parameter(Mandatory = $true)] $Manifest,
        [Parameter(Mandatory = $true)] $Extension,
        [Parameter(Mandatory = $true)] $Chrome
    )

    [pscustomobject]@{
        NativeHostCorrect = $Manifest.correct
        NativeHostManifest = $Manifest.manifestPath
        ExtensionInstalled = $Extension.installed
        ExtensionEnabled = $Extension.enabled
        ChromeRunning = $Chrome.running
        ChromeProfile = $Extension.profilePath
    } | Format-List
}

function Get-ChromeExecutablePath {
    $candidatePaths = @()
    $registryPaths = @(
        "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe",
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe",
        "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe"
    )

    foreach ($registryPath in $registryPaths) {
        try {
            $candidatePaths += Get-ItemPropertyValue -Path $registryPath -Name "(default)" -ErrorAction Stop
        }
        catch {
            continue
        }
    }

    $installRoots = @(
        $env:ProgramFiles,
        [Environment]::GetEnvironmentVariable("ProgramFiles(x86)"),
        $env:LOCALAPPDATA
    )

    foreach ($installRoot in $installRoots) {
        if (-not [string]::IsNullOrWhiteSpace($installRoot)) {
            $candidatePaths += Join-Path $installRoot "Google\Chrome\Application\chrome.exe"
        }
    }

    $chromeCommand = Get-Command "chrome.exe" -ErrorAction SilentlyContinue
    if ($chromeCommand) {
        $candidatePaths += $chromeCommand.Source
    }

    foreach ($candidatePath in ($candidatePaths | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique)) {
        if (Test-Path -LiteralPath $candidatePath) {
            return $candidatePath
        }
    }

    throw "Google Chrome executable was not found. Install Chrome or add chrome.exe to PATH."
}

$manifest = Invoke-JsonScript -ScriptPath $checkManifestScript
$extension = Invoke-JsonScript -ScriptPath $checkExtensionScript
$chrome = Invoke-JsonScript -ScriptPath $checkChromeRunningScript

Show-BridgeReport -Manifest $manifest -Extension $extension -Chrome $chrome

$needsRepair = (-not $manifest.correct) -or (-not $extension.installed) -or (-not $extension.enabled) -or (-not $chrome.running)
$didRepair = $false

if ($needsRepair -and -not $Repair) {
    Write-Host ""
    Write-Host "Bridge is not ready. Re-run with -Repair to attempt a local recovery."
    exit 1
}

if ($Repair) {
    if (-not $needsRepair) {
        Write-Host ""
        Write-Host "Bridge checks are already healthy."
        Write-Host "Running the repair path anyway because -Repair was requested. This resets a stale Codex Chrome host even when local prerequisites are green."
    }

    $repairArgs = @(
        "-ExecutionPolicy", "Bypass",
        "-File", $repairScript
    )

    if ($OpenTeal) {
        $repairArgs += "-OpenTeal"
    }

    & powershell @repairArgs
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }

    Start-Sleep -Seconds 2
    $manifest = Invoke-JsonScript -ScriptPath $checkManifestScript
    $extension = Invoke-JsonScript -ScriptPath $checkExtensionScript
    $chrome = Invoke-JsonScript -ScriptPath $checkChromeRunningScript

    Write-Host ""
    Write-Host "Post-repair status:"
    Show-BridgeReport -Manifest $manifest -Extension $extension -Chrome $chrome
    $didRepair = $true
}

if (-not $manifest.correct) {
    throw "Codex Chrome native host manifest is not healthy. Reinstall the Chrome plugin from the Codex UI."
}

if (-not $extension.installed) {
    throw "Codex Chrome Extension is not installed in the selected Chrome profile."
}

if (-not $extension.enabled) {
    throw "Codex Chrome Extension is installed but not enabled in the selected Chrome profile."
}

if (-not $chrome.running) {
    throw "Google Chrome is not running after recovery."
}

if ($OpenTeal -and -not $didRepair) {
    $profileDirectory = Split-Path -Leaf $extension.profilePath
    $chromePath = Get-ChromeExecutablePath
    Start-Process -FilePath $chromePath -ArgumentList @("--profile-directory=$profileDirectory", $tealUrl)
    Write-Host "Opened TealHQ in Google Chrome: $tealUrl"
}

Write-Host ""
Write-Host "Codex Chrome bridge local checks are healthy."
Write-Host "If a Codex thread still exposes only Playwright after this, the remaining fix is a Codex app/plugin rebind or reinstall, not a repo script issue."
