# PowerShell script to start MongoDB and Next.js dev server automatically
# This script will auto-elevate for MongoDB if needed

Write-Host "`n=== HM System Startup Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running
Write-Host "Checking MongoDB status..." -ForegroundColor Yellow
$mongodbService = Get-Service | Where-Object { ($_.Name -like "*Mongo*" -or $_.DisplayName -like "*Mongo*") -and $_.Status -eq "Running" }

if (-not $mongodbService) {
    Write-Host "MongoDB is not running. Starting MongoDB..." -ForegroundColor Yellow
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if (-not $isAdmin) {
        Write-Host "`nAdministrator privileges required to start MongoDB." -ForegroundColor Yellow
        Write-Host "Running MongoDB startup script with elevation..." -ForegroundColor Cyan
        $mongodbScript = Join-Path $PSScriptRoot "start-mongodb-admin.ps1"
        Start-Process powershell.exe -Verb RunAs -ArgumentList "-ExecutionPolicy Bypass -File `"$mongodbScript`"" -Wait
    } else {
        & "$PSScriptRoot\start-mongodb-admin.ps1"
    }
    
    Start-Sleep -Seconds 2
} else {
    Write-Host "✓ MongoDB is already running" -ForegroundColor Green
}

# Check if Next.js dev server is running
Write-Host "`nChecking Next.js dev server..." -ForegroundColor Yellow
$nextProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*next*" -or $_.CommandLine -like "*next*" }

if ($nextProcess) {
    Write-Host "Next.js dev server may already be running (PID: $($nextProcess.Id))" -ForegroundColor Yellow
    $response = Read-Host "Do you want to start a new instance? (y/n)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "Keeping existing server. Opening browser..." -ForegroundColor Cyan
        Start-Process "http://localhost:3000"
        exit
    }
}

# Start Next.js dev server
Write-Host "`nStarting Next.js development server..." -ForegroundColor Cyan
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the dev server
try {
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:3000"
    npm run dev
} catch {
    Write-Host "`nError starting dev server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please run manually: npm run dev" -ForegroundColor Yellow
}


