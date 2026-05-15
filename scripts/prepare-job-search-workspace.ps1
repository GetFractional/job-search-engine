param(
  [switch]$SyncGitIfClean,
  [switch]$SkipHookInstall,
  [switch]$VerifyOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-GitText {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Args,
    [switch]$AllowFailure
  )

  $output = & git @Args 2>$null
  $exitCode = $LASTEXITCODE

  if ($exitCode -ne 0 -and -not $AllowFailure) {
    throw "git $($Args -join ' ') failed with exit code $exitCode."
  }

  if ($null -eq $output) {
    return ""
  }

  return ($output -join [Environment]::NewLine).Trim()
}

function Get-DirectorySignature {
  param(
    [Parameter(Mandatory = $true)]
    [string]$RootPath
  )

  $signature = @{}
  $baseUri = [System.Uri]::new(([System.IO.Path]::GetFullPath($RootPath).TrimEnd('\') + '\'))
  foreach ($file in Get-ChildItem -LiteralPath $RootPath -Recurse -File | Sort-Object FullName) {
    $fileUri = [System.Uri]::new([System.IO.Path]::GetFullPath($file.FullName))
    $relativePath = [System.Uri]::UnescapeDataString($baseUri.MakeRelativeUri($fileUri).ToString())
    $signature[$relativePath] = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
  }

  return $signature
}

function Test-DirectoryMirror {
  param(
    [Parameter(Mandatory = $true)]
    [string]$SourceRoot,
    [Parameter(Mandatory = $true)]
    [string]$DestinationRoot
  )

  if (-not (Test-Path -LiteralPath $DestinationRoot)) {
    return [pscustomobject]@{
      Ok = $false
      Reason = "Destination missing: $DestinationRoot"
    }
  }

  $sourceSignature = Get-DirectorySignature -RootPath $SourceRoot
  $destinationSignature = Get-DirectorySignature -RootPath $DestinationRoot

  $missingPaths = @()
  $changedPaths = @()

  foreach ($relativePath in $sourceSignature.Keys) {
    if (-not $destinationSignature.ContainsKey($relativePath)) {
      $missingPaths += $relativePath
      continue
    }

    if ($sourceSignature[$relativePath] -ne $destinationSignature[$relativePath]) {
      $changedPaths += $relativePath
    }
  }

  if ($missingPaths.Count -gt 0) {
    return [pscustomobject]@{
      Ok = $false
      Reason = "Missing files: $($missingPaths -join ', ')"
    }
  }

  if ($changedPaths.Count -gt 0) {
    return [pscustomobject]@{
      Ok = $false
      Reason = "Mismatched files: $($changedPaths -join ', ')"
    }
  }

  $sourceSkillNames = @(Get-ChildItem -LiteralPath $SourceRoot -Directory | ForEach-Object { $_.Name })
  $extraPaths = @()
  foreach ($skillName in $sourceSkillNames) {
    $prefix = "$skillName/"
    foreach ($relativePath in $destinationSignature.Keys) {
      if ($relativePath.StartsWith($prefix, [System.StringComparison]::Ordinal) -and -not $sourceSignature.ContainsKey($relativePath)) {
        $extraPaths += $relativePath
      }
    }
  }

  if ($extraPaths.Count -gt 0) {
    return [pscustomobject]@{
      Ok = $false
      Reason = "Extra files in managed skills: $($extraPaths -join ', ')"
    }
  }

  return [pscustomobject]@{
    Ok = $true
    Reason = "Mirrored"
  }
}

function Test-SkillMetadata {
  param(
    [Parameter(Mandatory = $true)]
    [string]$SourceRoot
  )

  foreach ($skillDir in Get-ChildItem -LiteralPath $SourceRoot -Directory | Sort-Object Name) {
    $skillFile = Join-Path $skillDir.FullName "SKILL.md"
    if (-not (Test-Path -LiteralPath $skillFile)) {
      return [pscustomobject]@{
        Ok = $false
        Reason = "Missing SKILL.md: $($skillDir.Name)"
      }
    }

    $lines = @(Get-Content -LiteralPath $skillFile)
    if ($lines.Count -lt 4 -or $lines[0] -ne "---") {
      return [pscustomobject]@{
        Ok = $false
        Reason = "Invalid skill metadata: $($skillDir.Name)"
      }
    }

    $hasName = $false
    $hasDescription = $false
    $closedFrontmatter = $false

    for ($i = 1; $i -lt $lines.Count; $i++) {
      if ($lines[$i] -eq "---") {
        $closedFrontmatter = $true
        break
      }

      if ($lines[$i] -match '^name:\s*\S') {
        $hasName = $true
      }

      if ($lines[$i] -match '^description:\s*\S') {
        $hasDescription = $true
      }
    }

    if (-not ($closedFrontmatter -and $hasName -and $hasDescription)) {
      return [pscustomobject]@{
        Ok = $false
        Reason = "Invalid skill metadata: $($skillDir.Name)"
      }
    }
  }

  return [pscustomobject]@{
    Ok = $true
    Reason = "Valid"
  }
}

$repoRoot = Invoke-GitText -Args @("rev-parse", "--show-toplevel")
$syncScript = Join-Path $repoRoot "scripts\sync-codex-skills.ps1"
$installHooksScript = Join-Path $repoRoot "scripts\install-job-search-githooks.ps1"
$sourceSkillsRoot = Join-Path $repoRoot ".agents\skills"
$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
$codexSkillsRoot = Join-Path $codexHome "skills"
$agentsSkillsRoot = Join-Path $HOME ".agents\skills"

if (-not $SkipHookInstall -and -not $VerifyOnly) {
  & $installHooksScript
}

$branch = Invoke-GitText -Args @("branch", "--show-current")
$commit = Invoke-GitText -Args @("rev-parse", "--short", "HEAD")
$upstream = Invoke-GitText -Args @("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}") -AllowFailure
$defaultBranchRef = Invoke-GitText -Args @("symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD") -AllowFailure
if ([string]::IsNullOrWhiteSpace($defaultBranchRef)) {
  $defaultBranchRef = "origin/main"
}

$trackedStatus = Invoke-GitText -Args @("status", "--porcelain", "--untracked-files=no")
$untrackedStatus = Invoke-GitText -Args @("status", "--porcelain") -AllowFailure
$trackedDirty = -not [string]::IsNullOrWhiteSpace($trackedStatus)
$untrackedCount = @($untrackedStatus -split [Environment]::NewLine | Where-Object { $_ -like "?? *" }).Count

$gitSyncMessage = "Git sync not requested."
$ahead = 0
$behind = 0

if (-not [string]::IsNullOrWhiteSpace($upstream)) {
  $counts = Invoke-GitText -Args @("rev-list", "--left-right", "--count", "$upstream...HEAD")
  if (-not [string]::IsNullOrWhiteSpace($counts)) {
    $parts = $counts -split "\s+"
    if ($parts.Count -ge 2) {
      $behind = [int]$parts[0]
      $ahead = [int]$parts[1]
    }
  }
}

if ($SyncGitIfClean) {
  if ($trackedDirty) {
    $gitSyncMessage = "Skipped git sync because tracked changes are present."
  } elseif ([string]::IsNullOrWhiteSpace($upstream)) {
    $gitSyncMessage = "Skipped git sync because the current branch has no upstream."
  } else {
    Invoke-GitText -Args @("fetch", "origin") | Out-Null
    $counts = Invoke-GitText -Args @("rev-list", "--left-right", "--count", "$upstream...HEAD")
    $parts = $counts -split "\s+"
    if ($parts.Count -ge 2) {
      $behind = [int]$parts[0]
      $ahead = [int]$parts[1]
    }

    if ($ahead -eq 0 -and $behind -gt 0) {
      Invoke-GitText -Args @("pull", "--ff-only") | Out-Null
      $commit = Invoke-GitText -Args @("rev-parse", "--short", "HEAD")
      $behind = 0
      $gitSyncMessage = "Fast-forwarded the current branch from upstream."
    } elseif ($ahead -gt 0 -and $behind -gt 0) {
      $gitSyncMessage = "Skipped git sync because the branch has diverged from upstream."
    } elseif ($ahead -gt 0) {
      $gitSyncMessage = "Skipped git sync because local commits have not been pushed yet."
    } else {
      $gitSyncMessage = "Current branch already matches upstream."
    }
  }
}

$defaultBranchReason = "Included"
$defaultBranchOk = $true
$null = & git rev-parse --verify $defaultBranchRef 2>$null
if ($LASTEXITCODE -ne 0) {
  $defaultBranchOk = $false
  $defaultBranchReason = "Default branch ref not found: $defaultBranchRef"
} else {
  & git merge-base --is-ancestor $defaultBranchRef HEAD 2>$null
  if ($LASTEXITCODE -ne 0) {
    $defaultBranchOk = $false
    $defaultBranchReason = "Current branch does not contain $defaultBranchRef"
  }
}

if (-not $VerifyOnly) {
  & $syncScript
}

$codexMirror = Test-DirectoryMirror -SourceRoot $sourceSkillsRoot -DestinationRoot $codexSkillsRoot
$agentsMirror = Test-DirectoryMirror -SourceRoot $sourceSkillsRoot -DestinationRoot $agentsSkillsRoot
$skillMetadata = Test-SkillMetadata -SourceRoot $sourceSkillsRoot
$hooksPath = Invoke-GitText -Args @("config", "--get", "core.hooksPath") -AllowFailure
$hooksOk = $hooksPath -eq ".githooks"

$workspaceReady = (-not $trackedDirty) -and $hooksOk -and $skillMetadata.Ok -and $codexMirror.Ok -and $agentsMirror.Ok -and $defaultBranchOk -and (-not [string]::IsNullOrWhiteSpace($upstream)) -and ($ahead -eq 0) -and ($behind -eq 0)

Write-Host "Workspace readiness: $(if ($workspaceReady) { 'READY' } else { 'NOT READY' })"
Write-Host "Branch: $branch"
Write-Host "Commit: $commit"
Write-Host "Default branch: $defaultBranchRef"
Write-Host "Default branch included: $defaultBranchReason"
Write-Host "Upstream: $(if ([string]::IsNullOrWhiteSpace($upstream)) { '[none]' } else { $upstream })"
Write-Host "Ahead/Behind: $ahead/$behind"
Write-Host "Tracked changes present: $trackedDirty"
Write-Host "Untracked items: $untrackedCount"
Write-Host "Hooks path: $(if ([string]::IsNullOrWhiteSpace($hooksPath)) { '[unset]' } else { $hooksPath })"
Write-Host "Codex skills mirror: $($codexMirror.Reason)"
Write-Host "Agents skills mirror: $($agentsMirror.Reason)"
Write-Host "Skill metadata: $($skillMetadata.Reason)"
Write-Host "Git sync: $gitSyncMessage"

if (-not $workspaceReady) {
  exit 1
}
