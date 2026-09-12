# DigiNotice AI - Master Repository Splitter & Deployment Assistant
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "    DigiNotice AI: Codebase Splitter (Vercel + Railway)         " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This assistant helps you divide DigiNotice AI into two standalone GitHub repos:"
Write-Host "  1. Frontend  -> Ready for Vercel (SPA routing, Vite React, Tailwind)"
Write-Host "  2. Backend   -> Ready for Railway (Dynamic Port, MySQL/Mongo auto-config, CORS)"
Write-Host ""

# Ensure git is clean
$status = git status --porcelain
if ($status) {
    Write-Host "[INFO] Staging and committing all uncommitted changes..." -ForegroundColor Yellow
    git add .
    git commit -m "chore: prepare codebase for dual-repo split"
}

Write-Host "Please create two empty repositories on GitHub (https://github.com/new):" -ForegroundColor Green
Write-Host "  Repo 1: diginotice-frontend (or any name you choose)" -ForegroundColor White
Write-Host "  Repo 2: diginotice-backend  (or any name you choose)" -ForegroundColor White
Write-Host ""

$frontendUrl = Read-Host "Enter GitHub FRONTEND Repo URL (or press Enter to skip)"
if ($frontendUrl) {
    & "$PSScriptRoot\push_frontend_repo.ps1" -RepoUrl $frontendUrl
}

Write-Host ""
$backendUrl = Read-Host "Enter GitHub BACKEND Repo URL (or press Enter to skip)"
if ($backendUrl) {
    & "$PSScriptRoot\push_backend_repo.ps1" -RepoUrl $backendUrl
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host " All operations completed! See walkthrough.md for full details. " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
