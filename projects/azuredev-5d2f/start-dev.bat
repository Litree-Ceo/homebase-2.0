@echo off
REM Set Node 20 path and start SWA
set PATH=C:\nvm4w\nodejs;%PATH%
npx -y swa@0.1.1 start dist --api-location api
