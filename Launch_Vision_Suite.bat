@echo off
@chcp 65001 >nul
title Vision OPH KMUTT 2026 - Launcher
cd /d "%~dp0"

:: 1. Launch pre-built application if available (Zero dependencies required)
if exist "%~dp0dist\win-unpacked\CV Workshop Suite.exe" (
  start "" "%~dp0dist\win-unpacked\CV Workshop Suite.exe"
  exit /b 0
)

:: 2. Fallback to Source Execution (Check Node.js)
where node >nul 2>nul
if %errorlevel% neq 0 goto :NoNode

:: 3. Check and install dependencies if running from fresh source clone
if not exist "%~dp0node_modules\" goto :InstallDeps

goto :StartFromSource

:NoNode
echo =====================================================================
echo [ERROR] Node.js is not found on your system.
echo Please install Node.js from https://nodejs.org/
echo =====================================================================
pause
exit /b 1

:InstallDeps
echo =====================================================================
echo [Vision OPH] First-time setup: Installing required dependencies...
echo Please wait, this initial setup runs only once.
echo =====================================================================
call npm install
if %errorlevel% neq 0 goto :InstallFailed
goto :StartFromSource

:InstallFailed
echo =====================================================================
echo [ERROR] Failed to install dependencies. Please check network.
echo =====================================================================
pause
exit /b 1

:StartFromSource
call npm start
exit /b 0
