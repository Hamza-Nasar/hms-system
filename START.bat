@echo off
REM HM System Auto-Start Batch File
REM This will automatically request admin privileges and start everything

echo ========================================
echo   HM System Auto-Start
echo ========================================
echo.

REM Check for admin privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with Administrator privileges...
    echo.
    goto :start
) else (
    echo Requesting Administrator privileges...
    echo.
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:start
echo [1/3] Starting MongoDB Service...
powershell -ExecutionPolicy Bypass -File "%~dp0start-mongodb-admin.ps1"
echo.

echo [2/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)
echo.

echo [3/3] Starting Next.js development server...
echo Server will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

REM Open browser after 5 seconds
start "" "http://localhost:3000"

REM Start dev server
call npm run dev

pause


