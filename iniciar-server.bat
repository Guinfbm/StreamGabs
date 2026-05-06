@echo off
setlocal enabledelayedexpansion

REM ============================================
REM   StraemGab - Soundboard App Launcher
REM ============================================

title StraemGab Server
color 0A
cls

echo.
echo ╔════════════════════════════════════════╗
echo ║    StraemGab - Soundboard Launcher     ║
echo ╚════════════════════════════════════════╝
echo.

REM Verificar se Python está instalado
where python >nul 2>nul
if errorlevel 1 (
    color 0C
    echo ❌ ERRO: Python não encontrado!
    echo.
    echo Solução:
    echo 1. Instale Python 3.8+ em https://python.org
    echo 2. Marque "Add Python to PATH" durante instalação
    echo 3. Reinicie este programa
    echo.
    pause
    exit /b 1
)

REM Obter versão do Python
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo ✓ Python %PYTHON_VERSION% encontrado
echo.

REM Iniciar servidor
echo 🚀 Iniciando servidor...
echo.
python server.py

REM Se houver erro, mostrar mensagem
if errorlevel 1 (
    color 0C
    echo.
    echo ❌ O servidor encerrou com erro!
    echo.
    pause
    exit /b 1
)

pause

