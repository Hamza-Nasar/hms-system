# MongoDB Replica Set Setup Script for Windows
# Run this script as Administrator

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  MongoDB Replica Set Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if running as Administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Administrator)) {
    Write-Host "This script requires Administrator privileges." -ForegroundColor Yellow
    Write-Host "Requesting elevation..." -ForegroundColor Yellow
    $scriptPath = $MyInvocation.PSCommandPath
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-ExecutionPolicy Bypass -File `"$scriptPath`""
    exit
}

Write-Host "[1/4] Stopping MongoDB service..." -ForegroundColor Yellow
try {
    Stop-Service MongoDB -ErrorAction Stop
    Write-Host "  ✓ MongoDB service stopped" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Could not stop MongoDB service: $_" -ForegroundColor Yellow
    Write-Host "  Continuing anyway..." -ForegroundColor Yellow
}

Write-Host "`n[2/4] Configuring MongoDB..." -ForegroundColor Yellow
$mongodbConfigPath = "C:\Program Files\MongoDB\Server\*\bin\mongod.cfg"
$configFiles = Get-ChildItem -Path $mongodbConfigPath -ErrorAction SilentlyContinue

if ($configFiles) {
    $configFile = $configFiles[0].FullName
    Write-Host "  Found config file: $configFile" -ForegroundColor Cyan
    
    # Read current config
    $configContent = Get-Content $configFile -Raw
    
    # Check if replication is already configured
    if ($configContent -match "replication:") {
        Write-Host "  ⚠ Replication already configured in config file" -ForegroundColor Yellow
    } else {
        # Add replication configuration
        if ($configContent -match "net:") {
            $configContent = $configContent -replace "(net:)", "`nreplication:`n  replSetName: `"rs0`"`n`$1"
        } else {
            $configContent += "`nreplication:`n  replSetName: `"rs0`"`n"
        }
        
        # Backup original config
        $backupPath = "$configFile.backup"
        Copy-Item $configFile $backupPath
        Write-Host "  ✓ Created backup: $backupPath" -ForegroundColor Green
        
        # Write new config
        Set-Content -Path $configFile -Value $configContent -NoNewline
        Write-Host "  ✓ Added replication configuration" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠ MongoDB config file not found at expected location" -ForegroundColor Yellow
    Write-Host "  Please manually edit mongod.cfg and add:" -ForegroundColor Yellow
    Write-Host "    replication:" -ForegroundColor Cyan
    Write-Host "      replSetName: `"rs0`"" -ForegroundColor Cyan
}

Write-Host "`n[3/4] Starting MongoDB service..." -ForegroundColor Yellow
try {
    Start-Service MongoDB -ErrorAction Stop
    Start-Sleep -Seconds 3
    Write-Host "  ✓ MongoDB service started" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed to start MongoDB: $_" -ForegroundColor Red
    Write-Host "  Please start MongoDB manually" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[4/4] Initializing replica set..." -ForegroundColor Yellow
Write-Host "  Connecting to MongoDB..." -ForegroundColor Cyan

# Try to initialize replica set using mongosh
$initScript = @"
try {
    rs.status()
    print('Replica set already initialized')
} catch (err) {
    if (err.message.includes('no replset config')) {
        print('Initializing replica set...')
        rs.initiate({
            _id: 'rs0',
            members: [
                { _id: 0, host: 'localhost:27017' }
            ]
        })
        print('Replica set initialized successfully!')
    } else {
        print('Error: ' + err.message)
    }
}
"@

try {
    $initScript | mongosh --quiet 2>&1 | ForEach-Object {
        if ($_ -match "already initialized" -or $_ -match "initialized successfully") {
            Write-Host "  ✓ $_" -ForegroundColor Green
        } elseif ($_ -match "Error") {
            Write-Host "  ⚠ $_" -ForegroundColor Yellow
        } else {
            Write-Host "  $_" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "  ⚠ Could not automatically initialize replica set" -ForegroundColor Yellow
    Write-Host "  Please run the following commands manually:" -ForegroundColor Yellow
    Write-Host "    1. Open MongoDB shell: mongosh" -ForegroundColor Cyan
    Write-Host "    2. Run: rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] })" -ForegroundColor Cyan
    Write-Host "    3. Verify: rs.status()" -ForegroundColor Cyan
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "You can now restart your application and try registration again." -ForegroundColor Green
Write-Host ""










