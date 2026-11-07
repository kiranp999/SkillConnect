$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Test-Path '.venv\Scripts\python.exe')) {
    Write-Host 'Virtual environment not found. Run setup_backend.ps1 first.' -ForegroundColor Red
    exit 1
}
if (Test-Path 'db.sqlite3') { Remove-Item 'db.sqlite3' -Force }
if (Test-Path 'media') { Remove-Item 'media' -Recurse -Force }
New-Item -ItemType Directory -Path 'media' -Force | Out-Null
& .\.venv\Scripts\python.exe manage.py migrate --noinput
Write-Host 'Database and uploaded media have been reset.' -ForegroundColor Green
Write-Host 'Create a new admin with: .\.venv\Scripts\python.exe manage.py createsuperuser' -ForegroundColor Yellow
