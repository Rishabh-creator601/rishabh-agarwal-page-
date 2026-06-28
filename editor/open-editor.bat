@echo off
cd /d "%~dp0"
title Site Editor - keep open while editing
echo ============================================
echo   Opening the site editor in your browser...
echo   (a window will pop up in a moment)
echo.
echo   Keep THIS window open while you edit.
echo   Close it when you're done.
echo ============================================
echo.
python server.py
if errorlevel 1 py server.py
echo.
echo Editor stopped. You can close this window.
pause
