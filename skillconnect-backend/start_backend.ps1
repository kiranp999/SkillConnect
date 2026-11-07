$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Test-Path '.venv\Scripts\python.exe')) {
    Write-Host 'Virtual environment not found. Run setup_backend.ps1 first.' -ForegroundColor Red
    exit 1
}
& .\.venv\Scripts\python.exe manage.py migrate
& .\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
