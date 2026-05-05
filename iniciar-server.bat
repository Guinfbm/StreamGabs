@echo off
chcp 65001 > nul
title StraemGab Server
cls

echo ================================
echo    StraemGab Localhost Server
echo ================================
echo.

python server.py

pause
