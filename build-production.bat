@echo off
echo ========================================
echo   My Medicine - Production Build (AAB)
echo ========================================
echo.

cd /d "%~dp0"
cd mobile

echo [1/3] Checking EAS CLI installation...
where eas >nul 2>&1
if %errorlevel% neq 0 (
    echo EAS CLI not found. Installing...
    call npm install -g eas-cli
) else (
    echo EAS CLI is already installed.
)

echo.
echo [2/3] Preparing Expo...
echo Please ensure you are logged into Expo (run 'eas login' manually if needed).

echo.
echo [3/3] Building Android App Bundle (Production)...
echo This will build using the 'production' profile (AAB format).
echo The build will be processed on Expo's cloud servers.
echo.
call eas build -p android --profile production

echo.
echo ========================================
echo   Build process initiated!
echo   Check the Expo dashboard for build status.
echo ========================================
pause
