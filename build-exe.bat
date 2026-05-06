@echo off
REM Script para compilar StraemGab em executável standalone (.exe)
REM Requer: pip install pyinstaller

echo.
echo ╔════════════════════════════════════════╗
echo ║ StraemGab - Build Executable (PyInstaller) ║
echo ╚════════════════════════════════════════╝
echo.

REM Verificar PyInstaller
echo Verificando PyInstaller...
pip show pyinstaller >nul 2>nul
if errorlevel 1 (
    echo.
    echo ❌ PyInstaller não instalado!
    echo.
    echo Instale com:
    echo   pip install pyinstaller
    echo.
    pause
    exit /b 1
)

echo ✓ PyInstaller encontrado
echo.

REM Limpar builds antigos
echo Limpando builds antigos...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist server.spec del server.spec
echo ✓ Limpeza concluída
echo.

REM Build
echo 🔨 Compilando executável...
echo.

pyinstaller ^
    --onefile ^
    --windowed ^
    --name StraemGab ^
    --icon=icons\icon.svg ^
    --add-data "index.html;." ^
    --add-data "style.css;." ^
    --add-data "script.js;." ^
    --add-data "service-worker.js;." ^
    --add-data "manifest.webmanifest;." ^
    --add-data "Biel;Biel" ^
    --add-data "icons;icons" ^
    --console ^
    server.py

if errorlevel 1 (
    color 0C
    echo.
    echo ❌ ERRO durante compilação!
    echo.
    pause
    exit /b 1
)

echo.
echo ✓ Compilação concluída!
echo.
echo ╔════════════════════════════════════════╗
echo ║ Executável criado com sucesso!         ║
echo ╚════════════════════════════════════════╝
echo.
echo 📁 Localização: dist\StraemGab.exe
echo.
echo Próximos passos:
echo 1. Copie dist\StraemGab.exe para a pasta do projeto
echo 2. Clique duplo para usar
echo 3. Pronto! Funciona sem Python instalado
echo.
echo Tamanho: ~50-100 MB (incluindo runtime Python)
echo.
pause
