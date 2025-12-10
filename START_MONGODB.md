# How to Start MongoDB Service

## Quick Method (Recommended)

### Option 1: Using Services Manager (Easiest)
1. Press `Win + R`
2. Type: `services.msc`
3. Press Enter
4. Find **"MongoDB Server (MongoDB)"** or **"MongoDB"**
5. Right-click → **Start**

### Option 2: Using PowerShell Script (As Administrator)
1. Right-click **PowerShell** icon
2. Select **"Run as Administrator"**
3. Navigate to project directory:
   ```powershell
   cd C:\Users\AA\OneDrive\Desktop\Hms-system\hms-system
   ```
4. Run the script:
   ```powershell
   .\start-mongodb-admin.ps1
   ```

### Option 3: Using Command Prompt (As Administrator)
1. Right-click **Command Prompt** → **Run as Administrator**
2. Run:
   ```cmd
   net start MongoDB
   ```

## Verify MongoDB is Running

After starting MongoDB, verify it's running:

```powershell
Get-Service -Name "MongoDB"
```

Or check in Services Manager - status should show **"Running"**

## Troubleshooting

### Error: "Access is denied"
- **Solution**: Run PowerShell/CMD as Administrator

### Error: "Service not found"
- **Solution**: MongoDB may not be installed or service name is different
- Check Services Manager for MongoDB-related services
- Reinstall MongoDB if needed

### MongoDB won't start
1. Check MongoDB logs: `C:\Program Files\MongoDB\Server\*\log\mongod.log`
2. Make sure port 27017 is not in use
3. Try restarting your computer
4. Reinstall MongoDB if necessary

## Alternative: Start MongoDB Manually

If service won't start, you can run MongoDB manually:

```powershell
# Navigate to MongoDB bin directory (adjust path if different)
cd "C:\Program Files\MongoDB\Server\*\bin"

# Start MongoDB
.\mongod.exe --dbpath "C:\data\db"
```

**Note**: Make sure `C:\data\db` directory exists or specify a different path.
