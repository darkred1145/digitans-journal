@echo off
setlocal enabledelayedexpansion

set REG_KEY=HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\com.agnesdigital.rpc
set MANIFEST=%~dp0com.agnesdigital.rpc.json

echo === Agnes Digital - Native Host Installer ===
echo.
echo Enter your Chrome extension ID:
echo (Load the extension unpacked in chrome://extensions,
echo  enable Developer Mode, and copy the ID shown)
echo.
set /p EXT_ID="Extension ID: "

if "!EXT_ID!"=="" (
  echo No ID entered. Aborting.
  pause
  exit /b 1
)

echo.
echo Updating manifest...

set HOST_DIR=%~dp0
set HOST_DIR=%HOST_DIR:\=\\%
set HOST_DIR=%HOST_DIR:~0,-2%

powershell -Command "(Get-Content '!MANIFEST!') -replace 'REPLACE_WITH_PATH', '!HOST_DIR!' -replace 'REPLACE_WITH_YOUR_EXTENSION_ID', '!EXT_ID!' | Set-Content '!MANIFEST!'"

echo.
echo Registering native host in Windows Registry...
reg add "!REG_KEY!" /ve /t REG_SZ /d "!MANIFEST!" /f >nul 2>&1

if %errorlevel% equ 0 (
  echo.
  echo Success! Native host registered.
  echo You may need to restart Chrome for changes to take effect.
) else (
  echo.
  echo Failed to register. Try running as Administrator.
)

echo.
pause
