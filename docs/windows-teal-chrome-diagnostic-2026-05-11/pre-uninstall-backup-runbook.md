# Windows Codex Pre-Uninstall Backup Runbook

## Purpose
Use this before uninstalling or reinstalling Codex Desktop on the Windows job-search laptop.

The goal is to preserve all repo work, local diffs, untracked files, and useful Codex troubleshooting context before any app reset.

## Safety Rules
- Do not delete `C:\Users\matth\Documents\Jobs\Job Search`.
- Do not delete `C:\Users\matth\.codex` unless Matt explicitly approves it after backup.
- Do not delete Chrome profile data.
- Do not run destructive cleanup commands.
- Do not touch TealHQ, submit applications, edit resumes, or export PDFs during this backup task.
- Do not print secrets, cookies, OAuth tokens, browser profile files, or credential values.

## Windows Codex Task
Run these steps from PowerShell. If any step fails, stop and report the failure before uninstalling Codex.

### 1. Define Paths

```powershell
$ErrorActionPreference = "Stop"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$repo = "C:\Users\matth\Documents\Jobs\Job Search"
$backupDir = "$HOME\Desktop\codex-pre-uninstall-backup-$stamp"
$repoZip = "$backupDir\job-search-repo-backup-$stamp.zip"
$codexZip = "$backupDir\codex-config-backup-$stamp.zip"
$codexMissingNote = "$backupDir\codex-home-missing.txt"

New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
```

### 2. Confirm Repo Exists

```powershell
if (-not (Test-Path -LiteralPath $repo)) {
  throw "Job Search repo not found at $repo"
}

Set-Location -LiteralPath $repo
```

### 3. Save Git State Evidence

```powershell
git status --short --branch | Out-File "$backupDir\git-status-before-codex-uninstall.txt" -Encoding utf8
git branch --show-current | Out-File "$backupDir\git-current-branch-before-codex-uninstall.txt" -Encoding utf8
git log --oneline -20 | Out-File "$backupDir\git-log-before-codex-uninstall.txt" -Encoding utf8
git remote -v | Out-File "$backupDir\git-remotes-before-codex-uninstall.txt" -Encoding utf8

git diff | Out-File "$backupDir\unstaged-diff-before-codex-uninstall.patch" -Encoding utf8
git diff --staged | Out-File "$backupDir\staged-diff-before-codex-uninstall.patch" -Encoding utf8
git ls-files --others --exclude-standard | Out-File "$backupDir\untracked-files-before-codex-uninstall.txt" -Encoding utf8
```

### 4. Save A Full Repo Zip

```powershell
Compress-Archive -Path $repo -DestinationPath $repoZip -Force
```

### 5. Save Codex Config And Logs, But Not Browser Profiles

This preserves Codex-side context without touching Chrome profile data.

Important: do not zip `C:\Users\matth\.codex` directly. Codex can leave SQLite runtime log files locked even after the app appears closed. Instead, copy `.codex` into a staging folder with lock-prone runtime databases excluded, then zip the staging folder.

```powershell
$codexHome = "$HOME\.codex"
$codexCopy = "$backupDir\codex-home-copy"

if (Test-Path -LiteralPath $codexHome) {
  New-Item -ItemType Directory -Path $codexCopy -Force | Out-Null

  robocopy $codexHome $codexCopy /E /R:1 /W:1 /XF `
    "*.sqlite" `
    "*.sqlite-shm" `
    "*.sqlite-wal" `
    "logs_*.sqlite" `
    "logs_*.sqlite-shm" `
    "logs_*.sqlite-wal" `
    | Out-File "$backupDir\codex-robocopy-output.txt" -Encoding utf8

  $robocopyExitCode = $LASTEXITCODE
  if ($robocopyExitCode -gt 7) {
    throw "Codex .codex staging copy failed. Robocopy exit code: $robocopyExitCode. See $backupDir\codex-robocopy-output.txt"
  }

  @"
Codex home backup used a staging copy because live SQLite runtime files can remain locked.
Excluded patterns:
- *.sqlite
- *.sqlite-shm
- *.sqlite-wal
- logs_*.sqlite
- logs_*.sqlite-shm
- logs_*.sqlite-wal

This is expected and safer than forcing locked runtime files.
Staging copy: $codexCopy
Robocopy exit code: $robocopyExitCode
"@ | Out-File "$backupDir\codex-backup-notes.txt" -Encoding utf8

  Compress-Archive -Path $codexCopy -DestinationPath $codexZip -Force
} else {
  "No .codex folder found at $codexHome" | Out-File $codexMissingNote -Encoding utf8
}
```

### 6. List Backup Contents

```powershell
Get-ChildItem -LiteralPath $backupDir |
  Select-Object Name,Length,LastWriteTime |
  Format-Table -AutoSize |
  Out-File "$backupDir\backup-manifest.txt" -Encoding utf8
```

### 7. Verify Required Backup Files Exist

```powershell
$required = @(
  "$backupDir\git-status-before-codex-uninstall.txt",
  "$backupDir\git-current-branch-before-codex-uninstall.txt",
  "$backupDir\git-log-before-codex-uninstall.txt",
  "$backupDir\git-remotes-before-codex-uninstall.txt",
  "$backupDir\unstaged-diff-before-codex-uninstall.patch",
  "$backupDir\staged-diff-before-codex-uninstall.patch",
  "$backupDir\untracked-files-before-codex-uninstall.txt",
  "$backupDir\backup-manifest.txt",
  $repoZip
)

foreach ($path in $required) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Missing required backup artifact: $path"
  }
}

if (-not (Test-Path -LiteralPath $codexZip) -and -not (Test-Path -LiteralPath $codexMissingNote)) {
  throw "Missing Codex backup artifact. Expected either $codexZip or $codexMissingNote"
}

Write-Host "Backup complete: $backupDir"
```

## Pass Condition
Codex may tell Matt it is safe to uninstall/reinstall Codex Desktop only after:

- The backup directory exists on the Desktop.
- The repo zip exists.
- Git status, branch, log, remotes, unstaged diff, staged diff, and untracked file list are saved.
- `.codex` was staged and zipped, or a `codex-home-missing.txt` note was created.
- If `.codex` exists, `codex-backup-notes.txt` exists and explains excluded locked runtime files.
- No destructive commands were run.

## Final Message To Matt
Use this exact structure:

```text
Backup complete.

Backup folder:
<path>

Repo zip:
<path>

Codex config zip:
<path or codex-home-missing note>

Git state saved:
- status
- branch
- log
- remotes
- unstaged diff
- staged diff
- untracked file list

Safe to proceed with Codex Desktop uninstall/reinstall.
Do not delete the Job Search repo, .codex folder, or Chrome profile data unless separately approved.
```
