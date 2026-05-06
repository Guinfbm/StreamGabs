#!/usr/bin/env python3
"""
Servidor local para StraemGab
Permite acesso pelo WiFi para qualquer dispositivo conectado
Funciona independentemente do VS Code
"""

import http.server
import socketserver
import socket
import os
import sys
import webbrowser
import time
from pathlib import Path
from threading import Thread

# Configuração
PORT = 8000
HOST = "0.0.0.0"

def get_local_ip():
    """Obter IP local da máquina"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception as e:
        print(f"⚠ Erro ao detectar IP: {e}")
        return "127.0.0.1"

def open_browser(url):
    """Abrir navegador após 1 segundo"""
    time.sleep(1)
    try:
        webbrowser.open(url)
        print(f"✓ Navegador aberto: {url}\n")
    except Exception as e:
        print(f"⚠ Não foi possível abrir navegador: {e}\n")

def start_server():
    """Iniciar servidor HTTP"""
    # Mudar para o diretório do projeto
    os.chdir(Path(__file__).parent)
    
    # Handler HTTP
    Handler = http.server.SimpleHTTPRequestHandler
    
    # Criar servidor que escuta em TODAS as interfaces
    try:
        with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
            local_ip = get_local_ip()
            
            print("\n" + "=" * 60)
            print("🎵 StraemGab - Soundboard App")
            print("=" * 60)
            print(f"✓ Servidor iniciado com sucesso!")
            print("=" * 60)
            print(f"📱 Acesso local:    http://localhost:{PORT}")
            print(f"🌐 Acesso WiFi:     http://{local_ip}:{PORT}")
            print("=" * 60)
            print("Pressione CTRL+C para parar o servidor")
            print("=" * 60 + "\n")
            
            # Abrir navegador em thread separada
            browser_thread = Thread(target=open_browser, args=(f"http://localhost:{PORT}",), daemon=True)
            browser_thread.start()
            
            # Servir forever
            httpd.serve_forever()
            
    except OSError as e:
        if "Address already in use" in str(e):
            print("\n❌ ERRO: Porta 8000 já está em uso!")
            print("   Tente:")
            print("   1. Fechar outra instância do StraemGab")
            print("   2. Usar outra porta (edite este arquivo)")
            print("   3. Reiniciar o computador\n")
        else:
            print(f"\n❌ ERRO: {e}\n")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n✓ Servidor encerrado com sucesso")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ ERRO inesperado: {e}\n")
        sys.exit(1)

if __name__ == "__main__":
    try:
        start_server()
    except Exception as e:
        print(f"\n❌ ERRO: {e}\n")
        sys.exit(1)

