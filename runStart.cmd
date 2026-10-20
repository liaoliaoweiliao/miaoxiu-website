@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 goto missing_node
where npm >nul 2>nul
if errorlevel 1 goto missing_node

if not exist "node_modules\vite\bin\vite.js" (
  echo Installing project dependencies...
  call npm install
  if errorlevel 1 goto install_failed
)

call npm run dev
set "MIAOXIU_EXIT_CODE=%errorlevel%"
if not "%MIAOXIU_EXIT_CODE%"=="0" pause
exit /b %MIAOXIU_EXIT_CODE%

:missing_node
echo Please install Node.js 22.12+ or 24 LTS with npm, then reopen this script.
pause
exit /b 1

:install_failed
echo Dependency installation failed. Check the error above and try again.
pause
exit /b 1
