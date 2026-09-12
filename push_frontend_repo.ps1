param (
    [string]$RepoUrl
)

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  DigiNotice AI - Push Frontend to GitHub Repo   " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

if (-not $RepoUrl) {
    Write-Host "Please enter your GitHub Frontend repository URL" -ForegroundColor Yellow
    Write-Host "Example: https://github.com/majjibhanuprasad/diginotice-frontend.git" -ForegroundColor DarkGray
    $RepoUrl = Read-Host "Frontend Repo URL"
}

if (-not $RepoUrl) {
    Write-Host "❌ Error: Repository URL is required." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[1/2] Splitting 'frontend' folder into a dedicated branch..." -ForegroundColor Yellow
$branchName = "split-frontend"

# Remove existing branch if already present
git branch -D $branchName 2>$null

# Split subtree
git subtree split --prefix=frontend -b $branchName

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to split frontend subtree." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend branch '$branchName' prepared successfully." -ForegroundColor Green
Write-Host ""
Write-Host "[2/2] Pushing frontend branch to $RepoUrl..." -ForegroundColor Yellow

git push $RepoUrl "$($branchName):main" --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host "🎉 SUCCESS: Frontend deployed to GitHub repository!" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host "Repository: $RepoUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next step - Deploy on Vercel:" -ForegroundColor Yellow
    Write-Host "1. Go to https://vercel.com/new"
    Write-Host "2. Import your '$RepoUrl' repository"
    Write-Host "3. In Environment Variables, set: VITE_API_URL=<your-railway-url>/api"
    Write-Host "4. Click Deploy!"
} else {
    Write-Host "❌ Push failed. Please verify your repository URL and GitHub permissions." -ForegroundColor Red
}

# Clean up local temporary split branch
git branch -D $branchName 2>$null
