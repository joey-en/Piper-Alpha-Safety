@echo off

REM Go to the folder where this .bat lives
cd /d "%~dp0"

REM --- BACKEND TERMINAL ---
start "Piper Backend" cmd /k "cd /d backend && call venv\Scripts\activate.bat && uvicorn src.api:app --reload --port 4000"

REM --- FRONTEND TERMINAL ---
start "Piper Frontend" cmd /k "cd /d frontend\apps\web && npm run dev"
