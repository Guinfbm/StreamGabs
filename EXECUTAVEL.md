# Guia para criar Executável Standalone do StraemGab

## Opção 1: Usar Batch File (Recomendado - Simples)

Basta clicar 2x em `iniciar-server.bat` para iniciar o app!

**Vantagens:**
- Nenhuma instalação extra necessária
- Simples e rápido
- Funciona em qualquer PC com Python

**Como usar:**
1. Clique em `criar-atalho.vbs` para criar atalho no Desktop
2. Ou clique direto em `iniciar-server.bat`

---

## Opção 2: Criar Executável com PyInstaller

Se quiser um executável `.exe` de verdade (sem precisar de Python instalado):

### Passo 1: Instalar PyInstaller
```powershell
pip install pyinstaller
```

### Passo 2: Executar o Script de Build
```powershell
pyinstaller --onefile --windowed --icon=icons\icon.svg --add-data ".:." server.py
```

Ou use o comando automático:
```powershell
.\build-exe.bat
```

### Passo 3: Executável criado
- Localização: `dist\server.exe`
- Copie para a pasta raiz do projeto
- Clique 2x para usar!

---

## Opção 3: NSIS Installer (Profissional)

Para criar um instalador Windows completo, use NSIS:

1. Baixe NSIS: https://nsis.sourceforge.io/
2. Crie arquivo `installer.nsi` com script de instalação
3. Compile com NSIS

---

## Status Atual

✅ **Funcionando:** `iniciar-server.bat` - Recomendado para começar
⏳ **Opcional:** Executável com PyInstaller
⏳ **Futuro:** Instalador NSIS

---

## Resumo de Acesso

| Método | Como Usar | Requisito |
|--------|-----------|-----------|
| Batch File | Clique duplo em `iniciar-server.bat` | Python instalado |
| Atalho Desktop | Clique em `criar-atalho.vbs` (uma vez) | Python instalado |
| Executável | `dist\server.exe` (após build) | Nenhum |

**Recomendação:** Use o Batch File por enquanto, é o mais simples!
