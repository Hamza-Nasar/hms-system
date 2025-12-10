# PowerShell script to start MongoDB with Administrator privileges
# This script will auto-elevate if needed

param(
    [switch]$AutoStart
)

# Function to check if running as Administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Function to elevate script
function Start-Elevated {
    if (-not (Test-Administrator)) {
        Write-Host "`nRequesting Administrator privileges..." -ForegroundColor Yellow
        $scriptPath = $MyInvocation.PSCommandPath
        $arguments = "-ExecutionPolicy Bypass -File `"$scriptPath`" -AutoStart"
        Start-Process powershell.exe -Verb RunAs -ArgumentList $arguments -Wait
        exit
    }
}

# Elevate if needed
if (-not (Test-Administrator)) {
    Start-Elevated
    exit
}

Write-Host "`n=== MongoDB Service Manager ===" -ForegroundColor Cyan
Write-Host "Running with Administrator privileges..." -ForegroundColor Green

# Find MongoDB service
$mongodbService = $null
$serviceNames = @("MongoDB", "MongoDB Server", "MongoDB Server (MongoDB)", "MongoDB*")

foreach ($name in $serviceNames) {
    $services = Get-Service | Where-Object { $_.Name -like $name -or $_.DisplayName -like $name }
    if ($services) {
        $mongodbService = $services[0]
        Write-Host "Found MongoDB service: $($mongodbService.DisplayName) ($($mongodbService.Name))" -ForegroundColor Green
        break
    }
}

if (-not $mongodbService) {
    Write-Host "`nMongoDB service not found!" -ForegroundColor Red
    Write-Host "Checking all services with 'Mongo' in name..." -ForegroundColor Yellow
    $allMongoServices = Get-Service | Where-Object { $_.Name -like "*Mongo*" -or $_.DisplayName -like "*Mongo*" }
    if ($allMongoServices) {
        Write-Host "`nFound MongoDB-related services:" -ForegroundColor Cyan
        $allMongoServices | Format-Table Name, Status, DisplayName, StartType -AutoSize
        Write-Host "`nPlease specify the service name manually:" -ForegroundColor Yellow
        $serviceName = Read-Host "Service Name"
        $mongodbService = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    } else {
        Write-Host "`nNo MongoDB service found. MongoDB may not be installed." -ForegroundColor Red
        Write-Host "Please install MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
        exit 1
    }
}

if (-not $mongodbService) {
    Write-Host "`nCould not find MongoDB service. Exiting." -ForegroundColor Red
    exit 1
}

# Check current status
Write-Host "`nCurrent Status: $($mongodbService.Status)" -ForegroundColor Cyan

if ($mongodbService.Status -eq "Running") {
    Write-Host "MongoDB is already running!" -ForegroundColor Green
    Write-Host "`nService Details:" -ForegroundColor Cyan
    Write-Host "  Name: $($mongodbService.Name)" -ForegroundColor White
    Write-Host "  Display Name: $($mongodbService.DisplayName)" -ForegroundColor White
    Write-Host "  Status: $($mongodbService.Status)" -ForegroundColor White
    Write-Host "  Start Type: $($mongodbService.StartType)" -ForegroundColor White
} else {
    Write-Host "`nStarting MongoDB service..." -ForegroundColor Yellow
    try {
        Start-Service -Name $mongodbService.Name -ErrorAction Stop
        Start-Sleep -Seconds 3
        
        $mongodbService.Refresh()
        if ($mongodbService.Status -eq "Running") {
            Write-Host "`n✓ MongoDB started successfully!" -ForegroundColor Green
            Write-Host "`nService Details:" -ForegroundColor Cyan
            Write-Host "  Name: $($mongodbService.Name)" -ForegroundColor White
            Write-Host "  Display Name: $($mongodbService.DisplayName)" -ForegroundColor White
            Write-Host "  Status: $($mongodbService.Status)" -ForegroundColor White
        } else {
            Write-Host "`n✗ Failed to start MongoDB. Status: $($mongodbService.Status)" -ForegroundColor Red
            Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
            Write-Host "1. Check MongoDB logs: C:\Program Files\MongoDB\Server\*\log\mongod.log" -ForegroundColor White
            Write-Host "2. Verify MongoDB data directory exists and is accessible" -ForegroundColor White
            Write-Host "3. Check Windows Event Viewer for errors" -ForegroundColor White
            exit 1
        }
    } catch {
        Write-Host "`n✗ Error starting MongoDB: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Full error: $_" -ForegroundColor Red
        exit 1
    }
}

# Verify MongoDB is accessible
Write-Host "`nVerifying MongoDB connection..." -ForegroundColor Cyan
try {
    $connection = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($connection) {
        Write-Host "✓ MongoDB is accessible on port 27017" -ForegroundColor Green
    } else {
        Write-Host "⚠ MongoDB service is running but port 27017 may not be accessible" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Could not verify MongoDB connection: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=== MongoDB Service Manager Complete ===" -ForegroundColor Cyan
Write-Host "MongoDB Status: $($mongodbService.Status)" -ForegroundColor Green
