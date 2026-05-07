@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Open http://127.0.0.1:8080/app.html
python -m http.server 8080
