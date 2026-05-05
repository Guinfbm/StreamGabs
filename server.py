#!/usr/bin/env python3
"""
Servidor local para StraemGab
Permite acesso pelo WiFi para qualquer dispositivo conectado
"""

import http.server
import socketserver
import socket
import os
from pathlib import Path

# Porta
PORT = 8000

# Obter IP da máquina
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

# Mudar para o diretório do projeto
os.chdir(Path(__file__).parent)

# Handler HTTP
Handler = http.server.SimpleHTTPRequestHandler

# Criar servidor que escuta em TODAS as interfaces (0.0.0.0)
with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    local_ip = get_local_ip()
    print("=" * 60)
    print("🚀 StraemGab Server iniciado!")
    print("=" * 60)
    print(f"📱 Acesso local:    http://localhost:{PORT}")
    print(f"🌐 Acesso WiFi:     http://{local_ip}:{PORT}")
    print(f"📡 Todas interfaces: http://0.0.0.0:{PORT}")
    print("=" * 60)
    print("Pressione CTRL+C para parar o servidor")
    print("=" * 60)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n✓ Servidor encerrado")
