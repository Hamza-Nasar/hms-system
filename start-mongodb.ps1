# PowerShell script to start MongoDB service
# This script requires Administrator privileges

Write-Host "Starting MongoDB Service..." -ForegroundColor Cyan

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "`nAdministrator privileges required!" -ForegroundColor Yellow
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Write-Host "`nOr use one of these methods:" -ForegroundColor Cyan
    Write-Host "1. Right-click PowerShell -> Run as Administrator" -ForegroundColor White
    Write-Host "2. Press Win + X -> Select 'Windows PowerShell (Admin)'" -ForegroundColor White
    Write-Host "3. Open Services (services.msc) -> Find MongoDB -> Right-click -> Start" -ForegroundColor White
    Write-Host "`nAttempting to start MongoDB service..." -ForegroundColor Cyan
    
    try {
        $service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
        if ($service) {
            Write-Host "MongoDB service found. Status: $($service.Status)" -ForegroundColor Green
            if ($service.Status -eq "Running") {
                Write-Host "MongoDB is already running!" -ForegroundColor Green
            } else {
                Write-Host "Trying to start MongoDB without admin privileges..." -ForegroundColor Yellow
                Start-Service -Name "MongoDB" -ErrorAction Stop
                Write-Host "MongoDB started successfully!" -ForegroundColor Green
            }
        } else {
            Write-Host "MongoDB service not found. Checking alternative service names..." -ForegroundColor Yellow
            $services = Get-Service | Where-Object { $_.Name -like "*Mongo*" }
            if ($services) {
                Write-Host "Found MongoDB-related services:" -ForegroundColor Cyan
                $services | Format-Table Name, Status, DisplayName
            } else {
                Write-Host "No MongoDB service found. Please install MongoDB first." -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`nYou need Administrator privileges to start MongoDB service." -ForegroundColor Yellow
        Write-Host "`nTo start MongoDB manually:" -ForegroundColor Cyan
        Write-Host "1. Press Win + R" -ForegroundColor White
        Write-Host "2. Type: services.msc" -ForegroundColor White
        Write-Host "3. Find 'MongoDB Server (MongoDB)' or 'MongoDB'" -ForegroundColor White
        Write-Host "4. Right-click -> Start" -ForegroundColor White
    }
} else {
    Write-Host "Running with Administrator privileges..." -ForegroundColor Green
    
    try {
        $service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
        if (-not $service) {
            # Try alternative service names
            $serviceNames = @("MongoDB", "MongoDB Server", "MongoDB Server (MongoDB)")
            $service = $null
            foreach ($name in $serviceNames) {
                $service = Get-Service -Name $name -ErrorAction SilentlyContinue
                if ($service) {
                    Write-Host "Found MongoDB service: $($service.DisplayName)" -ForegroundColor Green
                    break
                }
            }
        }
        
        if ($service) {
            Write-Host "Current Status: $($service.Status)" -ForegroundColor Cyan
            
            if ($service.Status -eq "Running") {
                Write-Host "MongoDB is already running!" -ForegroundColor Green
            } else {
                Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
                Start-Service -Name $service.Name
                Start-Sleep -Seconds 2
                
                $service.Refresh()
                if ($service.Status -eq "Running") {
                    Write-Host "MongoDB started successfully!" -ForegroundColor Green
                    Write-Host "Service Status: $($service.Status)" -ForegroundColor Green
                } else {
                    Write-Host "Failed to start MongoDB. Status: $($service.Status)" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "MongoDB service not found. Checking all services..." -ForegroundColor Yellow
            $allServices = Get-Service | Where-Object { $_.Name -like "*Mongo*" -or $_.DisplayName -like "*Mongo*" }
            if ($allServices) {
                Write-Host "Found MongoDB-related services:" -ForegroundColor Cyan
                $allServices | Format-Table Name, Status, DisplayName -AutoSize
                Write-Host "`nTo start a service, use:" -ForegroundColor Yellow
                Write-Host "Start-Service -Name 'ServiceName'" -ForegroundColor White
            } else {
                Write-Host "No MongoDB service found. MongoDB may not be installed." -ForegroundColor Red
                Write-Host "`nPlease install MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Full error: $_" -ForegroundColor Red
    }
}

Write-Host "`nScript completed." -ForegroundColor Cyan



