# Quick MongoDB Replica Set Initialization
# This script initializes MongoDB as a replica set without stopping the service

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  MongoDB Replica Set Initialization" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if mongosh is available
if (-not (Get-Command mongosh -ErrorAction SilentlyContinue)) {
    Write-Host "Error: mongosh not found in PATH" -ForegroundColor Red
    Write-Host "Please install MongoDB Shell or add it to your PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/2] Checking current replica set status..." -ForegroundColor Yellow

# Check if replica set is already initialized
$statusCheck = @'
try {
    var status = rs.status();
    print('Replica set is already initialized');
    print('Replica set name: ' + status.set);
    print('Members: ' + status.members.length);
    quit(0);
} catch (err) {
    if (err.message.includes('no replset config')) {
        print('Replica set not initialized - will initialize now');
        quit(1);
    } else {
        print('Error checking status: ' + err.message);
        quit(2);
    }
}
'@

$checkResult = $statusCheck | mongosh --quiet 2>&1

if ($checkResult -match "already initialized") {
    Write-Host "  ✓ $checkResult" -ForegroundColor Green
    Write-Host "`nReplica set is already configured!" -ForegroundColor Green
    Write-Host "You can now use the application normally.`n" -ForegroundColor Green
    exit 0
}

Write-Host "[2/2] Initializing replica set..." -ForegroundColor Yellow

# Initialize replica set
$initScript = @'
try {
    var config = {
        _id: "rs0",
        members: [
            { _id: 0, host: "localhost:27017" }
        ]
    };
    var result = rs.initiate(config);
    print('Replica set initialized successfully!');
    print('Replica set name: rs0');
    print('Member: localhost:27017');
    quit(0);
} catch (err) {
    if (err.message.includes('already initialized')) {
        print('Replica set is already initialized');
        quit(0);
    } else if (err.message.includes('replication is not enabled')) {
        print('ERROR: Replication is not enabled in MongoDB configuration');
        print('Please add the following to your mongod.cfg file:');
        print('  replication:');
        print('    replSetName: "rs0"');
        print('Then restart MongoDB service and run this script again.');
        quit(1);
    } else {
        print('Error: ' + err.message);
        quit(2);
    }
}
'@

$initResult = $initScript | mongosh --quiet 2>&1

if ($LASTEXITCODE -eq 0 -or $initResult -match "successfully" -or $initResult -match "already initialized") {
    Write-Host "  ✓ Replica set initialized successfully!" -ForegroundColor Green
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  Setup Complete!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Cyan
    Write-Host "You can now:" -ForegroundColor Green
    Write-Host "  1. Restart your application" -ForegroundColor Cyan
    Write-Host "  2. Try registration again" -ForegroundColor Cyan
    Write-Host ""
} elseif ($initResult -match "replication is not enabled") {
    Write-Host "  ✗ Replication not enabled in MongoDB config" -ForegroundColor Red
    Write-Host "`nPlease follow these steps:" -ForegroundColor Yellow
    Write-Host "  1. Stop MongoDB service: Stop-Service MongoDB" -ForegroundColor Cyan
    Write-Host "  2. Edit mongod.cfg (usually in C:\Program Files\MongoDB\Server\<version>\bin\)" -ForegroundColor Cyan
    Write-Host "  3. Add these lines:" -ForegroundColor Cyan
    Write-Host "     replication:" -ForegroundColor White
    Write-Host "       replSetName: `"rs0`"" -ForegroundColor White
    Write-Host "  4. Start MongoDB: Start-Service MongoDB" -ForegroundColor Cyan
    Write-Host "  5. Run this script again" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or run: .\setup-mongodb-replica.ps1 (as Administrator)" -ForegroundColor Yellow
} else {
    Write-Host "  ✗ Error: $initResult" -ForegroundColor Red
    Write-Host "`nPlease check MongoDB connection and try again." -ForegroundColor Yellow
}

