@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
 echo Install Python 3.10 or newer, then run: python serve.py
 pause
 exit /b 1
)
python -B serve.py --open
if errorlevel 1 pause
