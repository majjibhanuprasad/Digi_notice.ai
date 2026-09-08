# DigiNotice AI - Professional Git Initialization Script
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   DigiNotice AI Repository Initializer   " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is in the environment path
$gitCmd = Get-Command git -ErrorAction SilentlyContinue

# Fallback check for standard Git installation paths if not in PATH
if (-not $gitCmd) {
    $standardPaths = @(
        "C:\Program Files\Git\cmd\git.exe",
        "C:\Program Files\Git\bin\git.exe",
        "C:\Program Files (x86)\Git\cmd\git.exe",
        "$env:USERPROFILE\AppData\Local\Programs\Git\cmd\git.exe"
    )
    foreach ($p in $standardPaths) {
        if (Test-Path $p) {
            $env:PATH = (Split-Path $p) + ";" + $env:PATH
            $gitCmd = Get-Command git -ErrorAction SilentlyContinue
            break
        }
    }
}

if (-not $gitCmd) {
    Write-Host "[WARNING] Git is not installed or could not be found on your system." -ForegroundColor Yellow
    Write-Host "To initialize this project as a professional Git repository, please:" -ForegroundColor Yellow
    Write-Host "1. Download and install Git from: https://git-scm.com/downloads" -ForegroundColor Yellow
    Write-Host "2. Once installed, re-run this script in PowerShell: .\init_git.ps1" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "We have already pre-configured the professional '.gitignore' file at the root." -ForegroundColor Green
    Exit
}

Write-Host "[INFO] Git detected: $(git --version)" -ForegroundColor Green

# Check if repository is already initialized
if (Test-Path ".git") {
    Write-Host "[INFO] Git repository is already initialized." -ForegroundColor Green
} else {
    Write-Host "[INFO] Initializing new Git repository..." -ForegroundColor Yellow
    git init
}

# Stage files
Write-Host "[INFO] Staging project files..." -ForegroundColor Yellow
git add .

# Create initial commit
Write-Host "[INFO] Creating initial commit..." -ForegroundColor Yellow
git commit -m "feat: initial commit for DigiNotice AI full-stack prototype"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host " SUCCESS: Git repository setup successfully! " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To push this project to GitHub:"
Write-Host "1. Create a new repository on GitHub (https://github.com/new)"
Write-Host "2. Run the following commands in your terminal:"
Write-Host "   git remote add origin <your-github-repo-url>"
Write-Host "   git branch -M main"
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
