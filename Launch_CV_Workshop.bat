@echo off
title Vision OPH KMUTT 2026 - CV Workshop Launcher
cd /d "%~dp0"

if exist "%~dp0dist\win-unpacked\CV Workshop Suite.exe" (
  start "" "%~dp0dist\win-unpacked\CV Workshop Suite.exe" --app=cv-workshop
  exit /b 0
)

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo =====================================================================
  echo [ERROR] ไม่พบ Node.js ในระบบ กรุณาติดตั้ง Node.js ก่อนเริ่มใช้งาน
  echo ดาวน์โหลดได้ที่: https://nodejs.org/ (แนะนำรุ่น LTS)
  echo =====================================================================
  pause
  exit /b 1
)

if not exist "%~dp0node_modules\" (
  echo =====================================================================
  echo [Vision OPH] ตรวจพบการเปิดใช้งานครั้งแรก กำลังติดตั้ง Dependencies...
  echo กรุณารอสักครู่ (กระบวนการนี้ทำเพียงครั้งเดียว)
  echo =====================================================================
  call npm install
  if %errorlevel% neq 0 (
    echo [ERROR] เกิดข้อผิดพลาดในการติดตั้ง Dependencies กรุณาลองใหม่อีกครั้ง
    pause
    exit /b 1
  )
)

call npm run start:workshop
