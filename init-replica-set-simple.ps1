# Simple MongoDB Replica Set Initialization
# This script initializes replica set without stopping MongoDB

Write-Host "`nInitializing MongoDB Replica Set...`n" -ForegroundColor Cyan

# Try to find mongosh
$mongoshPath = $null
$possiblePaths = @(
    "mongosh",
    "C:\Program Files\MongoDB\Server\*\bin\mongosh.exe"
)

foreach ($path in $possiblePaths) {
    if ($path -like "*\*") {
        $found = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) {
            $mongoshPath = $found.FullName
            break
        }
    } else {
        $found = Get-Command $path -ErrorAction SilentlyContinue
        if ($found) {
            $mongoshPath = $found.Source
            break
        }
    }
}

if (-not $mongoshPath) {
    Write-Host "Error: mongosh not found. Please install MongoDB Shell." -ForegroundColor Red
    Write-Host "`nAlternative: Use MongoDB Compass or run this in MongoDB shell manually:" -ForegroundColor Yellow
    Write-Host '  rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "localhost:27017" }] })' -ForegroundColor Cyan
    exit 1
}

Write-Host "Found mongosh at: $mongoshPath" -ForegroundColor Green
Write-Host "`nInitializing replica set..." -ForegroundColor Yellow

# Initialize replica set
$initScript = @'
try {
    var status = rs.status();
    print('Replica set already initialized: ' + status.set);
    quit(0);
} catch (err) {
    if (err.message.includes('no replset config')) {
        print('Initializing replica set...');
        var result = rs.initiate({
            _id: 'rs0',
            members: [
                { _id: 0, host: 'localhost:27017' }
            ]
        });
        print('Replica set initialized successfully!');
        print('Waiting for replica set to become ready...');
        var waitCount = 0;
        while (waitCount < 30) {
            try {
                var status = rs.status();
                if (status.members[0].stateStr === 'PRIMARY') {
                    print('Replica set is ready!');
                    quit(0);
                }
            } catch (e) {}
            sleep(1000);
            waitCount++;
        }
        quit(0);
    } else if (err.message.includes('replication is not enabled')) {
        print('ERROR: Replication not enabled in MongoDB config');
        print('Please add to mongod.cfg:');
        print('  replication:');
        print('    replSetName: "rs0"');
        print('Then restart MongoDB and run this script again.');
        quit(1);
    } else {
        print('Error: ' + err.message);
        quit(2);
    }
}
'@

try {
    $output = $initScript | & $mongoshPath --quiet 2>&1
    
    if ($LASTEXITCODE -eq 0 -or $output -match "initialized successfully" -or $output -match "already initialized") {
        Write-Host "`n✓ Replica set initialized successfully!" -ForegroundColor Green
        Write-Host "`nYou can now restart your application and it should work!" -ForegroundColor Green
    } elseif ($output -match "replication is not enabled") {
        Write-Host "`n✗ Replication not enabled in MongoDB config" -ForegroundColor Red
        Write-Host "`nPlease follow these steps:" -ForegroundColor Yellow
        Write-Host "1. Stop MongoDB: Stop-Service MongoDB (as Administrator)" -ForegroundColor Cyan
        Write-Host "2. Edit mongod.cfg (usually in C:\Program Files\MongoDB\Server\<version>\bin\)" -ForegroundColor Cyan
        Write-Host "3. Add these lines:" -ForegroundColor Cyan
        Write-Host "   replication:" -ForegroundColor White
        Write-Host '     replSetName: "rs0"' -ForegroundColor White
        Write-Host "4. Start MongoDB: Start-Service MongoDB" -ForegroundColor Cyan
        Write-Host "5. Run this script again" -ForegroundColor Cyan
    } else {
        Write-Host "`nOutput: $output" -ForegroundColor Yellow
    }
} catch {
    Write-Host "`nError running mongosh: $_" -ForegroundColor Red
    Write-Host "`nPlease run this manually in MongoDB shell:" -ForegroundColor Yellow
    Write-Host '  rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "localhost:27017" }] })' -ForegroundColor Cyan
}

Write-Host ""
