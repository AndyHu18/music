@echo off
chcp 65001 > nul
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║       YouTube Piano Visualizer - 啟動腳本                ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM 檢查 Python
python --version > nul 2>&1
if errorlevel 1 (
    echo ❌ 錯誤: 未找到 Python，請安裝 Python 3.11+
    pause
    exit /b 1
)

REM 檢查 FFmpeg
ffmpeg -version > nul 2>&1
if errorlevel 1 (
    echo ❌ 錯誤: 未找到 FFmpeg，請安裝並加入 PATH
    echo    下載: https://ffmpeg.org/download.html
    pause
    exit /b 1
)

REM 檢查虛擬環境
if not exist "backend\venv\Scripts\activate.bat" (
    echo 📦 建立虛擬環境...
    cd backend
    python -m venv venv
    
    echo 📦 安裝依賴 (首次執行需較長時間)...
    call venv\Scripts\pip install -q --upgrade pip setuptools wheel
    call venv\Scripts\pip install -q fastapi uvicorn[standard] python-multipart yt-dlp aiofiles
    call venv\Scripts\pip install -q tensorflow librosa scipy pretty_midi crepe
    cd ..
)

echo.
echo 🚀 啟動後端伺服器...
echo    後端: http://localhost:8000
echo    前端: http://localhost:8000 (自動服務)
echo.
echo    按 Ctrl+C 停止伺服器
echo.

cd backend
call venv\Scripts\activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
