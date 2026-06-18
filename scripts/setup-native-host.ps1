# Digitan's Journal - Native Host Auto-Setup
$heliumPrefs = "$env:LOCALAPPDATA\imput\Helium\User Data\Default\Preferences"
$chromePrefs = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Preferences"
$manifestPath = "$PSScriptRoot\..\native-host\com.digitansjournal.rpc.json"
$hostDir = Resolve-Path "$PSScriptRoot\..\native-host"
$regKey = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.digitansjournal.rpc"

# Try Helium first, then Chrome
$prefsPath = $null
if (Test-Path $heliumPrefs) { $prefsPath = $heliumPrefs }
elseif (Test-Path $chromePrefs) { $prefsPath = $chromePrefs }

if (-not $prefsPath) { Write-Error "No browser preferences found"; exit 1 }

$prefs = Get-Content $prefsPath -Raw | ConvertFrom-Json
$extId = $null
$targetPath = (Resolve-Path "$PSScriptRoot\..").Path.Replace('\', '\\')

foreach ($prop in $prefs.extensions.settings.PSObject.Properties) {
    $extPath = $prop.Value.path
    if ($extPath -and $extPath -like "*digitans-journal*") {
        $extId = $prop.Name
        break
    }
}

if (-not $extId) {
    Write-Error "Digitan's Journal extension not found in browser.`nLoad it first at helium://extensions (or chrome://extensions)."
    exit 1
}

$escapedHostDir = $hostDir.Path.Replace('\', '\\')
$json = Get-Content $manifestPath -Raw
$json = $json -replace 'REPLACE_WITH_PATH', $escapedHostDir
$json = $json -replace 'REPLACE_WITH_YOUR_EXTENSION_ID', $extId
Set-Content $manifestPath -Value $json -NoNewline

if (-not (Test-Path $regKey)) { New-Item -Path $regKey -Force | Out-Null }
Set-ItemProperty -Path $regKey -Name "(default)" -Value $manifestPath

Write-Output "Native host configured for extension ID: $extId"
Write-Output "Manifest: $manifestPath"
Write-Output "Restart Helium/Chrome for changes to take effect."
