param(
  [Parameter(Mandatory = $true, ParameterSetName = "Text")]
  [string]$Text,

  [Parameter(Mandatory = $true, ParameterSetName = "TextFile")]
  [string]$TextFile,

  [int]$DelayMs = 150,

  [string]$WindowTitle,

  [switch]$Enter
)

$ErrorActionPreference = "Stop"

if ($PSCmdlet.ParameterSetName -eq "TextFile") {
  $resolved = Resolve-Path -LiteralPath $TextFile
  $Text = Get-Content -LiteralPath $resolved -Raw
}

Set-Clipboard -Value $Text
Start-Sleep -Milliseconds $DelayMs

Add-Type -AssemblyName System.Windows.Forms

if ($WindowTitle) {
  $shell = New-Object -ComObject WScript.Shell
  [void]$shell.AppActivate($WindowTitle)
  Start-Sleep -Milliseconds $DelayMs
}

[System.Windows.Forms.SendKeys]::SendWait("^v")

if ($Enter) {
  Start-Sleep -Milliseconds 100
  [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
}
