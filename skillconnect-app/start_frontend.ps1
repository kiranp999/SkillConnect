$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host 'Node.js/npm was not found. Install Node.js LTS first.' -ForegroundColor Red
    exit 1
}
if (-not (Test-Path 'node_modules')) {
    npm install
}
npm run dev
