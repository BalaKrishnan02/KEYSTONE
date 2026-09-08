# Script to start local PostgreSQL database for Keystone platform
$pgBin = "C:\Program Files\PostgreSQL\14\bin"
$pgData = "$PSScriptRoot\.pgdata"
$port = 5434

if (-not (Test-Path $pgData)) {
    Write-Host "Initializing PostgreSQL cluster..." -ForegroundColor Cyan
    & "$pgBin\initdb.exe" -D $pgData -U keystone -A trust
}

$pidFile = Join-Path $pgData "postmaster.pid"
if (Test-Path $pidFile) {
    $pidContent = Get-Content $pidFile -TotalCount 1
    $proc = Get-Process -Id $pidContent -ErrorAction SilentlyContinue
    if (-not $proc) {
        Write-Host "Cleaning up stale postmaster.pid..." -ForegroundColor Yellow
        Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Starting PostgreSQL on port $port..." -ForegroundColor Green
& "$pgBin\postgres.exe" -D $pgData -p $port

