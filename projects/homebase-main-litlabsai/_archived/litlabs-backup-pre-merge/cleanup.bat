@echo off
echo Cleaning up and resetting project...

REM Delete build folders
rmdir /s /q .next
rmdir /s /q node_modules

REM Clear package manager caches
pnpm cache clean
npm cache clean --force

REM Reinstall dependencies
pnpm install --force

echo Cleanup complete!
pause
