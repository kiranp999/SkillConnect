$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

if (-not (Test-Path '.venv\Scripts\python.exe')) {
    Write-Host 'Creating Python virtual environment...' -ForegroundColor Cyan
    py -3.12 -m venv .venv
}

& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt
& .\.venv\Scripts\python.exe manage.py migrate

Write-Host ''
Write-Host 'Backend setup complete.' -ForegroundColor Green
Write-Host 'Create an admin account with:' -ForegroundColor Yellow
Write-Host '  .\.venv\Scripts\python.exe manage.py createsuperuser'
Write-Host ''
Write-Host 'Then start the server with:' -ForegroundColor Yellow
Write-Host '  .\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000'
