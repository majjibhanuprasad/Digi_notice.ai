param (
    [string]$RepoUrl
)

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   DigiNotice AI - Push Backend to GitHub Repo   " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

if (-not $RepoUrl) {
    Write-Host "Please enter your GitHub Backend repository URL" -ForegroundColor Yellow
    Write-Host "Example: https://github.com/majjibhanuprasad/diginotice-backend.git" -ForegroundColor DarkGray
    $RepoUrl = Read-Host "Backend Repo URL"
}

if (-not $RepoUrl) {
    Write-Host "❌ Error: Repository URL is required." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[1/2] Splitting 'backend' folder into a dedicated branch..." -ForegroundColor Yellow
$branchName = "split-backend"

# Remove existing branch if already present
git branch -D $branchName 2>$null

# Split subtree
git subtree split --prefix=backend -b $branchName

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to split backend subtree." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend branch '$branchName' prepared successfully." -ForegroundColor Green
Write-Host ""
Write-Host "[2/2] Pushing backend branch to $RepoUrl..." -ForegroundColor Yellow

git push $RepoUrl "$($branchName):main" --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host "🎉 SUCCESS: Backend deployed to GitHub repository!" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host "Repository: $RepoUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next step - Deploy on Railway:" -ForegroundColor Yellow
    Write-Host "1. Go to https://railway.com/new"
    Write-Host "2. Choose 'Deploy from GitHub repo' -> Select '$RepoUrl'"
    Write-Host "3. (Optional) Add a MySQL database service"
    Write-Host "4. Generate Domain in Networking settings and copy URL"
    Write-Host "5. Set the generated domain in your Vercel frontend environment variables!"
} else {
    Write-Host "❌ Push failed. Please verify your repository URL and GitHub permissions." -ForegroundColor Red
}

# Clean up local temporary split branch
git branch -D $branchName 2>$null
