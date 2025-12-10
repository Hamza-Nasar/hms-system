# PowerShell script to add Git remote
# Usage: .\add-git-remote.ps1

Write-Host "`n=== Git Remote Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if remote already exists
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "Remote 'origin' already exists: $existingRemote" -ForegroundColor Yellow
    $response = Read-Host "Do you want to update it? (y/n)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "Cancelled." -ForegroundColor Red
        exit
    }
    git remote remove origin
}

Write-Host "Enter your Git repository URL:" -ForegroundColor Green
Write-Host "Examples:" -ForegroundColor Gray
Write-Host "  - https://github.com/username/repository.git" -ForegroundColor Gray
Write-Host "  - git@github.com:username/repository.git" -ForegroundColor Gray
Write-Host "  - https://gitlab.com/username/repository.git" -ForegroundColor Gray
Write-Host ""

$repoUrl = Read-Host "Repository URL"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "No URL provided. Exiting." -ForegroundColor Red
    exit 1
}

# Add the remote
git remote add origin $repoUrl

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] Remote 'origin' added successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Remote URL: $repoUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now use:" -ForegroundColor Yellow
    Write-Host "  git pull origin master" -ForegroundColor White
    Write-Host "  git push origin master" -ForegroundColor White
    Write-Host ""
    
    # Verify the remote
    Write-Host "Verifying remote..." -ForegroundColor Cyan
    git remote -v
} else {
    Write-Host ""
    Write-Host "[ERROR] Failed to add remote. Please check the URL and try again." -ForegroundColor Red
    exit 1
}

