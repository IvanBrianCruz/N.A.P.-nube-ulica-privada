@echo off
:: Cambia el directorio al del script actual (ruta relativa)
cd /d "%~dp0"

:: Inicia el servidor con npm start
start cmd /k "npm start"

pause
