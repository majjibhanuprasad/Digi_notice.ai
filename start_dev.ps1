# DigiNotice AI - One-Click Local Development Launcher
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "     DigiNotice AI - Local Fullstack Runner      " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check node
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host "[ERROR] Node.js is not found in PATH." -ForegroundColor Red
    exit 1
}

Write-Host "[1/2] Launching DigiNotice AI Backend on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host '--- DigiNotice AI Backend API (Port 5000) ---' -ForegroundColor Cyan; npm run dev"

Start-Sleep -Seconds 2

Write-Host "[2/2] Launching DigiNotice AI Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '--- DigiNotice AI Frontend Web App (Port 5173) ---' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "=================================================" -ForegroundColor Green
Write-Host "  Both services launched in separate windows!    " -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host "Frontend App:    http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API:     http://localhost:5000" -ForegroundColor Cyan
Write-Host "Health Check:    http://localhost:5000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Close the terminal windows when you want to stop the servers." -ForegroundColor DarkGray
