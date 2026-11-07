@echo off
setlocal
title SkillConnect - Frontend + Backend

REM ============================================================
REM SkillConnect one-click launcher
REM Project locations:
REM Frontend: C:\Users\Kiran P\OneDrive\Desktop\Project\skillconnect-app
REM Backend:  C:\Users\Kiran P\OneDrive\Desktop\Project\skillconnect-backend
REM ============================================================

set "PROJECT_ROOT=C:\Users\Kiran P\OneDrive\Desktop\Project"
set "BACKEND=%PROJECT_ROOT%\skillconnect-backend"
set "FRONTEND=%PROJECT_ROOT%\skillconnect-app"

echo.
echo ============================================================
echo              SKILLCONNECT LAUNCHER
echo ============================================================
echo.

if not exist "%BACKEND%\manage.py" (
    echo ERROR: Django backend not found:
    echo %BACKEND%
    echo.
    pause
    exit /b 1
)

if not exist "%FRONTEND%\package.json" (
    echo ERROR: React frontend not found:
    echo %FRONTEND%
    echo.
    pause
    exit /b 1
)

if not exist "%BACKEND%\.venv\Scripts\python.exe" (
    echo ERROR: Python virtual environment not found:
    echo %BACKEND%\.venv
    echo.
    echo Create it from the backend folder with:
    echo py -3.12 -m venv .venv
    echo.
    pause
    exit /b 1
)

echo Starting Django backend...
start "SkillConnect - Django Backend" cmd /k "cd /d ""%BACKEND%"" && .\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000"

echo.
echo Starting React frontend...
start "SkillConnect - React Frontend" cmd /k "cd /d ""%FRONTEND%"" && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo.
echo Backend:  http://127.0.0.1:8000/
echo Admin:    http://127.0.0.1:8000/admin/
echo Frontend: http://localhost:5173/
echo.
echo Keep both server windows open while using SkillConnect.
echo.

timeout /t 5 /nobreak >nul
start "" "http://localhost:5173/"

endlocal
