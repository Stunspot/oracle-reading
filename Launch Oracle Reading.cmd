@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
 echo Install Python 3.10 or newer, then run: python serve.py
 pause
 exit /b 1
)
start "" http://127.0.0.1:8765
python -B serve.py
if errorlevel 1 pause
