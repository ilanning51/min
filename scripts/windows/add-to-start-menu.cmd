@echo off
rem Adds a "Min" shortcut to the Start menu that runs launch-min.cmd.
for %%i in ("%~dp0..\..") do set "MIN_DIR=%%~fi"

powershell -NoProfile -Command "$s = (New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Programs') + '\Min.lnk'); $s.TargetPath = '%MIN_DIR%\scripts\windows\launch-min.cmd'; $s.WorkingDirectory = '%MIN_DIR%'; $s.IconLocation = '%MIN_DIR%\icons\icon256.ico'; $s.WindowStyle = 7; $s.Save()"

if errorlevel 1 (
  echo Something went wrong while creating the shortcut.
) else (
  echo Min has been added to your Start menu.
)
pause
