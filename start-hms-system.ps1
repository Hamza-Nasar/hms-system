# HM System Auto-Start Script with Administrator Privileges
# This script automatically starts MongoDB and Next.js dev server

param(
    [switch]$SkipMongoDB,
    [switch]$SkipBrowser
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  HM System Auto-Start Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Function to check if running as Administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Function to elevate script
function Start-Elevated {
    Write-Host "Requesting Administrator privileges..." -ForegroundColor Yellow
    $scriptPath = $MyInvocation.PSCommandPath
    $arguments = "-ExecutionPolicy Bypass -File `"$scriptPath`""
    if ($SkipMongoDB) { $arguments += " -SkipMongoDB" }
    if ($SkipBrowser) { $arguments += " -SkipBrowser" }
    Start-Process powershell.exe -Verb RunAs -ArgumentList $arguments -Wait
    exit
}

# Elevate if needed (for MongoDB)
if (-not $SkipMongoDB -and -not (Test-Administrator)) {
    Start-Elevated
    exit
}

# Step 1: Start MongoDB
if (-not $SkipMongoDB) {
    Write-Host "[1/3] Starting MongoDB Service..." -ForegroundColor Yellow
    
    $mongodbService = Get-Service | Where-Object { 
        ($_.Name -like "*Mongo*" -or $_.DisplayName -like "*Mongo*") -and $_.Status -eq "Running" 
    }
    
    if ($mongodbService) {
        Write-Host "  ✓ MongoDB is already running" -ForegroundColor Green
    } else {
        $mongodbService = Get-Service | Where-Object { 
            $_.Name -like "*Mongo*" -or $_.DisplayName -like "*Mongo*" 
        } | Select-Object -First 1
        
        if ($mongodbService) {
            try {
                if ($mongodbService.Status -ne "Running") {
                    Write-Host "  Starting MongoDB service..." -ForegroundColor Cyan
                    Start-Service -Name $mongodbService.Name -ErrorAction Stop
                    Start-Sleep -Seconds 3
                    $mongodbService.Refresh()
                }
                
                if ($mongodbService.Status -eq "Running") {
                    Write-Host "  ✓ MongoDB started successfully" -ForegroundColor Green
                } else {
                    Write-Host "  ✗ Failed to start MongoDB" -ForegroundColor Red
                }
            } catch {
                Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
                Write-Host "  Please start MongoDB manually from Services (services.msc)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ⚠ MongoDB service not found" -ForegroundColor Yellow
            Write-Host "  Skipping MongoDB startup..." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "[1/3] Skipping MongoDB startup..." -ForegroundColor Gray
}

# Step 2: Check Node.js and dependencies
Write-Host "`n[2/3] Checking dependencies..." -ForegroundColor Yellow

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "  ✗ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host "  ✓ Node.js found: $(node --version)" -ForegroundColor Green

if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✓ Dependencies found" -ForegroundColor Green
}

# Step 3: Start Next.js dev server
Write-Host "`n[3/3] Starting Next.js development server..." -ForegroundColor Yellow
Write-Host "  Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

# Open browser after a delay
if (-not $SkipBrowser) {
    Start-Job -ScriptBlock {
        Start-Sleep -Seconds 5
        Start-Process "http://localhost:3000"
    } | Out-Null
    Write-Host "  Browser will open automatically in 5 seconds...`n" -ForegroundColor Green
}

# Start the dev server
try {
    npm run dev
} catch {
    Write-Host "`n✗ Error starting dev server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please run manually: npm run dev" -ForegroundColor Yellow
    exit 1
}


