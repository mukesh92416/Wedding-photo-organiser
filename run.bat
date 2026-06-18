@echo off
cd /d "%~dp0"

echo Starting Backend...
start "PhotoSathi Backend" cmd /k "cd /d "%~dp0PhotoSathi\backend" && pip install -r requirements.txt && python app.py"

echo Starting Frontend...
start "PhotoSathi Frontend" cmd /k "cd /d "%~dp0PhotoSathi\frontend" && npm install && npm run dev"

echo.
echo PhotoSathi AI is starting...
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
pause
