@echo off
rem Starts Min from this folder, getting the latest changes from GitHub first.
rem The Start menu shortcut made by add-to-start-menu.cmd runs this minimized.
title Min - checking for updates
cd /d "%~dp0..\.."

for /f %%i in ('git rev-parse HEAD 2^>nul') do set "BEFORE=%%i"
git pull --ff-only >nul 2>&1
for /f %%i in ('git rev-parse HEAD 2^>nul') do set "AFTER=%%i"

if not "%BEFORE%"=="%AFTER%" (
  rem only reinstall dependencies when the list of them changed
  git diff --quiet %BEFORE% %AFTER% -- package.json || (
    title Min - installing updates
    call npm install
  )
)
if not exist "node_modules\electron\dist\electron.exe" (
  title Min - installing
  call npm install
)

if not "%BEFORE%"=="%AFTER%" goto build
if not exist "main.build.js" goto build
if not exist "dist\bundle.js" goto build
goto start

:build
title Min - building
call npm run build

:start
start "" "node_modules\electron\dist\electron.exe" . --development-mode
