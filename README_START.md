# 🚀 Quick Start - HM System

## ✅ Easiest Way to Start (Double-Click)

### Windows Users:
1. **Double-click `START.bat`** 
2. Click **"Yes"** when prompted for Administrator privileges
3. Everything will start automatically!

### PowerShell Users:
```powershell
.\start-hms-system.ps1
```

## 📋 What Gets Started:

1. ✅ **MongoDB Service** (with admin privileges)
2. ✅ **Next.js Dev Server** (on port 3000)
3. ✅ **Browser** (opens automatically)

## 🌐 Access Your Application:

- **Landing Page**: http://localhost:3000
- **Login Page**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard (after login)

## 🔧 Manual Start (If Needed)

### Step 1: Start MongoDB
```powershell
# As Administrator
.\start-mongodb-admin.ps1
```

### Step 2: Start Next.js
```powershell
npm run dev
```

## ⚠️ Troubleshooting

### MongoDB Won't Start
- Make sure you're running as **Administrator**
- Check if MongoDB is installed: `Get-Service | Where-Object { $_.Name -like "*Mongo*" }`
- Start manually from Services: `Win + R` → `services.msc` → Find MongoDB → Start

### Port 3000 Already in Use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000
# Kill the process (replace <PID> with actual PID)
taskkill /PID <PID> /F
```

### Build Errors
```powershell
# Clear cache and restart
Remove-Item -Recurse -Force .next
npm run dev
```

## 📝 Scripts Available

- `START.bat` - Windows batch file (easiest)
- `start-hms-system.ps1` - PowerShell auto-start script
- `start-mongodb-admin.ps1` - MongoDB startup only (with admin)

## ✨ Features

- ✅ Auto-elevates to Administrator for MongoDB
- ✅ Checks and installs dependencies automatically
- ✅ Opens browser automatically
- ✅ Handles errors gracefully
- ✅ Works on Windows PowerShell and CMD

---

**Need Help?** Check `QUICK_START.md` for detailed instructions.


