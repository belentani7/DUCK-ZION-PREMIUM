@echo off
setlocal
cd /d "%~dp0"
set "DATABASE_URL=file:%~dp0db/custom.db"
set "NODE_ENV=production"
set "HOSTNAME=127.0.0.1"
set "PORT=3000"
set "CHAT_ORIGINS=http://127.0.0.1:3000,http://localhost:3000"
start "ClientPortal Chat" /min "%~dp0node.exe" "%~dp0chat-server.cjs"
start "ClientPortal Web" /min "%~dp0node.exe" "%~dp0app\server.js"
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:3000"
endlocal
