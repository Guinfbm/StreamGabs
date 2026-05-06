# StraemGab - Soundboard App

Uma **Progressive Web App** (PWA) para reproduzir efeitos sonoros em tempo real, perfeita para streamers e criadores de conteúdo.

## ✨ Características

- **📱 App Nativo**: Instale como app desktop ou mobile
- **🎵 12 Botões de Som**: Totalmente personalizável
- **⚡ Offline**: Funciona 100% sem internet
- **🎨 Customizável**: Cores, imagens e áudios próprios
- **⌨️ Atalhos de Teclado**: Controle rápido dos sons
- **🎯 Ações Personalizadas**: Abra links ou apps ao clicar
- **🔊 Controle de Volume**: Global e por botão
- **💾 Salva Localmente**: Nenhum dado é enviado

## 🚀 Como Usar

### Instalar como App

**Windows/Linux:**
- Chrome/Edge → Clique em "Instalar App" ou ⋮ → "Instalar"

**Android:**
- Chrome → ⋮ → "Instalar app" ou "Adicionar à Tela Inicial"

**iOS/iPad:**
- Safari → Compartilhar → "Adicionar à Tela Inicial"

### Usar Localmente (Desenvolvimento)

```bash
# Iniciar servidor (Windows)
.\iniciar-server.bat

# Ou manualmente com Python
python server.py
```

Acesse: `http://localhost:8000`

## 📁 Estrutura

```
├── index.html              # Interface do app
├── style.css               # Estilos (dark/light theme)
├── script.js               # Lógica principal
├── service-worker.js       # Suporte offline e cache
├── manifest.webmanifest    # Config de PWA
├── server.py              # Servidor local
├── iniciar-server.bat     # Script Windows
└── Biel/
    └── assets/audio/      # Áudios padrão (12 mp3s)
```

## ⚙️ Configurações

No app, acesse **Ajustes** para:

- **Volume**: Ajuste de 0-100%
- **Cores**: Personalize cor de ativação
- **Áudio**: Carregue sons customizados
- **Ações**: Configure abrir links/apps
- **Atalhos**: Defina teclas (1-9, 0, -, +)

## 🔌 Funcionalidades PWA

✅ Instale em qualquer dispositivo
✅ Funciona sem internet
✅ Sincronização de dados local
✅ Notificações de status
✅ Fullscreen imersivo

## 📊 Tecnologia

- HTML5, CSS3, JavaScript (Vanilla)
- Service Worker (Cache & Offline)
- IndexedDB (Armazenamento local)
- Web Audio API

## 🛠️ Desenvolvimento

Sem dependências externas! Tudo é vanilla JS.

Para contribuir:
1. Modifique os arquivos
2. Teste localmente
3. Commit e push

## 📝 Versão

**Versão:** 2.0.0
**Status:** Production Ready ✅

## 📝 Licença

Livre para usar e modificar

---

**Pronto para usar!** Basta abrir no navegador e instalar como app. 🚀
