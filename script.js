const ajustesEl = document.getElementById("ajustes");
const overlayEl = document.getElementById("overlay");
const btnAjustes = document.getElementById("btn-ajustes");
const btnFecharAjustes = document.getElementById("btn-fechar-ajustes");

const tabBtnGeral = document.getElementById("tab-btn-geral");
const tabBtnMic = document.getElementById("tab-btn-mic");
const tabBtnAtalhos = document.getElementById("tab-btn-atalhos");
const tabGeral = document.getElementById("tab-geral");
const tabMic = document.getElementById("tab-mic");
const tabAtalhos = document.getElementById("tab-atalhos");

const volumeRange = document.getElementById("volume-range");
const colorPicker = document.getElementById("color-picker");
const imageInput = document.getElementById("image-input");

// Áudio personalizado
const audioInput = document.getElementById("audio-input");
const audioClearBtn = document.getElementById("audio-clear");
const audioFilenameEl = document.getElementById("audio-filename");

// Ação do botão
const actionTypeSelect = document.getElementById("action-type");
const actionOpenFieldsEl = document.getElementById("action-open-fields");
const actionOpenUrlInput = document.getElementById("action-open-url");

const soundButtons = Array.from(document.querySelectorAll(".sound-btn"));

const audioFiles = [
    "Biel/assets/audio/audio (1).mp3",
    "Biel/assets/audio/audio (2).mp3",
    "Biel/assets/audio/audio (3).mp3",
    "Biel/assets/audio/audio (4).mp3",
    "Biel/assets/audio/audio (5).mp3",
    "Biel/assets/audio/audio (6).mp3",
    "Biel/assets/audio/audio (7).mp3",
    "Biel/assets/audio/audio (8).mp3",
    "Biel/assets/audio/audio (9).mp3",
    "Biel/assets/audio/audio (10).mp3",
    "Biel/assets/audio/audio (11).mp3",
    "Biel/assets/audio/audio (12).mp3"
];

let selectedButton = null;
let playingButton = null;
const audio = new Audio();
audio.preload = "auto";
audio.volume = Number(volumeRange?.value ?? 80) / 100;

const objectUrlByButton = new WeakMap();
const audioObjectUrlByButton = new WeakMap();

// ── Storage keys ───────────────────────────────────────────
const STORAGE_KEY_BUTTON_CONFIGS = "straemgab.buttonConfigs.v1";
const STORAGE_KEY_AUDIO_PREFIX   = "straemgab.audio.";   // + buttonId → base64 data URL
const STORAGE_KEY_IMAGE_PREFIX   = "straemgab.image.";   // + buttonId → base64 data URL

const buttonById = new Map();

// ── Helpers ────────────────────────────────────────────────
function safeJsonParse(value, fallback) {
    try { return JSON.parse(value); } catch { return fallback; }
}

function loadButtonConfigs() {
    const raw = localStorage.getItem(STORAGE_KEY_BUTTON_CONFIGS);
    const parsed = safeJsonParse(raw, null);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
}

function saveButtonConfigs(configs) {
    localStorage.setItem(STORAGE_KEY_BUTTON_CONFIGS, JSON.stringify(configs));
}

function getButtonId(btn) {
    return String(btn?.dataset?.buttonId || "");
}

function getDefaultConfig() {
    return { shortcut: null, action: { type: "sound", url: "" } };
}

function getButtonConfig(configs, buttonId) {
    const cfg = configs?.[buttonId];
    if (!cfg || typeof cfg !== "object") return getDefaultConfig();
    const shortcut = cfg.shortcut && typeof cfg.shortcut === "object" ? cfg.shortcut : null;
    const action = cfg.action && typeof cfg.action === "object" ? cfg.action : {};
    const type = action.type === "open" ? "open" : "sound";
    return { shortcut, action: { type, url: action.url || "" } };
}

function setButtonConfig(configs, buttonId, newConfig) {
    configs[buttonId] = newConfig;
    saveButtonConfigs(configs);
}

// ── Áudio personalizado ────────────────────────────────────
/**
 * Converte File → base64 data URL e salva no localStorage.
 * Cria também um ObjectURL para uso imediato no <audio>.
 */
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function applyAudioToButton(btn, file) {
    const buttonId = getButtonId(btn);

    // Revoga ObjectURL anterior se existir
    const prev = audioObjectUrlByButton.get(btn);
    if (prev) URL.revokeObjectURL(prev);

    const objectUrl = URL.createObjectURL(file);
    audioObjectUrlByButton.set(btn, objectUrl);
    btn.dataset.audio = objectUrl;
    btn.dataset.audioCustom = "1";

    // Persiste como base64 (até ~5 MB funciona bem para áudios curtos)
    try {
        const b64 = await fileToBase64(file);
        localStorage.setItem(STORAGE_KEY_AUDIO_PREFIX + buttonId, b64);
        localStorage.setItem(STORAGE_KEY_AUDIO_PREFIX + buttonId + ".name", file.name);
    } catch (e) {
        console.warn("Não foi possível salvar o áudio no localStorage:", e);
    }
}

function removeCustomAudio(btn) {
    const buttonId = getButtonId(btn);

    const prev = audioObjectUrlByButton.get(btn);
    if (prev) URL.revokeObjectURL(prev);
    audioObjectUrlByButton.delete(btn);

    delete btn.dataset.audioCustom;

    // Restaura o áudio padrão
    const index = soundButtons.indexOf(btn);
    const defaultAudio = audioFiles[index] ?? audioFiles[index % audioFiles.length];
    btn.dataset.audio = defaultAudio;

    localStorage.removeItem(STORAGE_KEY_AUDIO_PREFIX + buttonId);
    localStorage.removeItem(STORAGE_KEY_AUDIO_PREFIX + buttonId + ".name");

    if (audioFilenameEl) audioFilenameEl.textContent = "";
    if (audioInput) audioInput.value = "";
}

/** Restaura áudios e imagens personalizados do localStorage ao iniciar. */
function loadPersistedMedia() {
    soundButtons.forEach((btn) => {
        const buttonId = getButtonId(btn);

        // Áudio
        const b64 = localStorage.getItem(STORAGE_KEY_AUDIO_PREFIX + buttonId);
        if (b64) {
            // Converte base64 de volta para Blob → ObjectURL
            try {
                const mimeMatch = b64.match(/^data:([^;]+);/);
                const mime = mimeMatch ? mimeMatch[1] : "audio/mpeg";
                const binary = atob(b64.split(",")[1]);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                const blob = new Blob([bytes], { type: mime });
                const url = URL.createObjectURL(blob);
                audioObjectUrlByButton.set(btn, url);
                btn.dataset.audio = url;
                btn.dataset.audioCustom = "1";
            } catch (e) {
                console.warn("Erro ao restaurar áudio do botão", buttonId, e);
            }
        }

        // Imagem
        const imgB64 = localStorage.getItem(STORAGE_KEY_IMAGE_PREFIX + buttonId);
        if (imgB64) {
            btn.classList.add("has-image");
            btn.style.backgroundImage = `url(${imgB64})`;
            btn.style.backgroundSize = "cover";
            btn.style.backgroundPosition = "center";
        }

        // Cor
        const color = localStorage.getItem("straemgab.color." + buttonId);
        if (color) setButtonAccent(btn, color);
    });
}

// ── Imagem ─────────────────────────────────────────────────
function applyImageToButton(btn, file) {
    const buttonId = getButtonId(btn);

    const previousUrl = objectUrlByButton.get(btn);
    if (previousUrl) URL.revokeObjectURL(previousUrl);

    const url = URL.createObjectURL(file);
    objectUrlByButton.set(btn, url);
    btn.classList.add("has-image");
    btn.style.backgroundImage = `url(${url})`;
    btn.style.backgroundSize = "cover";
    btn.style.backgroundPosition = "center";

    // Persiste imagem
    const reader = new FileReader();
    reader.onload = () => {
        try { localStorage.setItem(STORAGE_KEY_IMAGE_PREFIX + buttonId, reader.result); }
        catch (e) { console.warn("Não foi possível salvar a imagem:", e); }
    };
    reader.readAsDataURL(file);
}

// ── Cor ───────────────────────────────────────────────────
function setButtonAccent(btn, color) {
    btn.style.setProperty("--accent", color);
    btn.dataset.accent = color;
}

// ── Reprodução ────────────────────────────────────────────
function clearPlayingState() {
    if (playingButton) playingButton.classList.remove("is-playing");
    playingButton = null;
}

async function togglePlayForButton(btn) {
    const src = btn.dataset.audio;
    if (!src) return;

    if (playingButton === btn && !audio.paused) {
        audio.pause();
        clearPlayingState();
        return;
    }

    clearPlayingState();
    playingButton = btn;
    btn.classList.add("is-playing");

    if (audio.src !== new URL(src, window.location.href).href) {
        audio.src = src;
    }

    try { await audio.play(); } catch { /* Autoplay bloqueado — clique novamente */ }
}

// ── Atalhos ───────────────────────────────────────────────
function isModifierCode(code) {
    return ["ShiftLeft","ShiftRight","ControlLeft","ControlRight",
            "AltLeft","AltRight","MetaLeft","MetaRight"].includes(code);
}

function shortcutFromKeyboardEvent(e) {
    const code = e.code;
    if (!code || isModifierCode(code)) return null;
    return { ctrl: !!e.ctrlKey, alt: !!e.altKey, shift: !!e.shiftKey, meta: !!e.metaKey, code };
}

function shortcutToId(shortcut) {
    if (!shortcut) return "";
    return [shortcut.ctrl?"1":"0", shortcut.alt?"1":"0",
            shortcut.shift?"1":"0", shortcut.meta?"1":"0", shortcut.code].join("|");
}

function codeToHuman(code) {
    if (!code) return "";
    if (code.startsWith("Key"))    return code.slice(3);
    if (code.startsWith("Digit"))  return code.slice(5);
    if (code.startsWith("Numpad")) return `Num${code.slice(6)}`;
    const map = { Space:"Espaço", Escape:"Esc", Backquote:"`", Minus:"-", Equal:"=",
                  BracketLeft:"[", BracketRight:"]", Backslash:"\\", Semicolon:";",
                  Quote:"'", Comma:",", Period:".", Slash:"/" };
    if (map[code]) return map[code];
    if (code.startsWith("Arrow")) return code.replace("Arrow","");
    return code;
}

function shortcutToHuman(shortcut) {
    if (!shortcut) return "Nenhum";
    const parts = [];
    if (shortcut.ctrl)  parts.push("Ctrl");
    if (shortcut.alt)   parts.push("Alt");
    if (shortcut.shift) parts.push("Shift");
    if (shortcut.meta)  parts.push("Win");
    parts.push(codeToHuman(shortcut.code));
    return parts.join(" + ");
}

function updateButtonShortcutBadge(btn, shortcut) {
    const badge = btn.querySelector(".btn-shortcut");
    if (!badge) return;
    const text = shortcut ? shortcutToHuman(shortcut) : "";
    badge.textContent = text;
    badge.hidden = !text;
}

// ── Modal ─────────────────────────────────────────────────
function setModalOpen(isOpen) {
    ajustesEl.hidden = !isOpen;
    overlayEl.hidden = !isOpen;
}

function setActiveTab(which) {
    const tabs = { geral: [tabBtnGeral, tabGeral], mic: [tabBtnMic, tabMic], atalhos: [tabBtnAtalhos, tabAtalhos] };
    Object.entries(tabs).forEach(([key, [btn, panel]]) => {
        const active = key === which;
        btn?.classList.toggle("is-active", active);
        btn?.setAttribute("aria-selected", String(active));
        if (panel) panel.hidden = !active;
    });
}

function selectButton(btn) {
    if (selectedButton) selectedButton.classList.remove("is-selected");
    selectedButton = btn;
    if (selectedButton) selectedButton.classList.add("is-selected");
}

function syncAjustesFromSelected() {
    if (!selectedButton) return;

    // Cor
    const accent = selectedButton.dataset.accent;
    if (accent && colorPicker) colorPicker.value = accent;

    // Nome do áudio personalizado
    if (audioFilenameEl) {
        const buttonId = getButtonId(selectedButton);
        const name = localStorage.getItem(STORAGE_KEY_AUDIO_PREFIX + buttonId + ".name");
        audioFilenameEl.textContent = name ? `Áudio: ${name}` : "";
    }
    if (audioInput) audioInput.value = "";

    // Ação
    const configs = loadButtonConfigs();
    const cfg = getButtonConfig(configs, getButtonId(selectedButton));

    if (actionTypeSelect) actionTypeSelect.value = cfg.action.type;
    if (actionOpenFieldsEl) actionOpenFieldsEl.hidden = cfg.action.type !== "open";
    if (actionOpenUrlInput) actionOpenUrlInput.value = cfg.action.url || "";
}

function abrirAjustes() {
    if (!selectedButton && soundButtons.length > 0) selectButton(soundButtons[0]);
    syncAjustesFromSelected();
    setModalOpen(true);
    setActiveTab("geral");
}

function fecharAjustes() {
    setModalOpen(false);
}

// ── Abrir link / protocolo ────────────────────────────────
function isLikelyUrlOrProtocol(value) {
    return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(String(value || "").trim());
}

function openUrlOrProtocol(value) {
    const url = String(value || "").trim();
    if (!isLikelyUrlOrProtocol(url)) return;
    try {
        // Sempre abre em nova janela/aba
        const w = window.open(url, "_blank", "noopener,noreferrer");
        if (!w) {
            // Fallback se o popup foi bloqueado
            window.location.href = url;
        }
    } catch (error) {
        console.error("Erro ao abrir URL:", error);
    }
}

function shouldIgnoreHotkeysBecauseTyping() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if (el.isContentEditable) return true;
    return false;
}

// ── Inicialização dos botões ──────────────────────────────
soundButtons.forEach((btn, index) => {
    const buttonId = String(index + 1);
    btn.dataset.buttonId = buttonId;
    buttonById.set(buttonId, btn);

    btn.innerHTML = `<span class="btn-label">${buttonId}</span><span class="btn-shortcut" hidden></span>`;

    const audioFile = audioFiles[index] ?? audioFiles[index % audioFiles.length];
    btn.dataset.audio = audioFile;

    setButtonAccent(btn, btn.dataset.accent || "#22c55e");

    btn.addEventListener("click", (e) => {
        selectButton(btn);
        syncAjustesFromSelected();

        const configs = loadButtonConfigs();
        const cfg = getButtonConfig(configs, buttonId);

        if (cfg.action.type === "open" && cfg.action.url) {
            e.preventDefault();
            e.stopPropagation();
            openUrlOrProtocol(cfg.action.url);
            return;
        }

        if (btn.dataset.audio) void togglePlayForButton(btn);
    });
});

// Restaura mídia persistida
loadPersistedMedia();

// Aplica badges de atalho
{
    const configs = loadButtonConfigs();
    soundButtons.forEach((btn) => {
        const cfg = getButtonConfig(configs, getButtonId(btn));
        updateButtonShortcutBadge(btn, cfg.shortcut);
    });
}

// ── Listeners do modal ────────────────────────────────────
btnAjustes?.addEventListener("click", abrirAjustes);
btnFecharAjustes?.addEventListener("click", fecharAjustes);
overlayEl?.addEventListener("click", fecharAjustes);

tabBtnGeral?.addEventListener("click",   () => setActiveTab("geral"));
tabBtnMic?.addEventListener("click",     () => setActiveTab("mic"));
tabBtnAtalhos?.addEventListener("click", () => setActiveTab("atalhos"));

volumeRange?.addEventListener("input", () => {
    audio.volume = Number(volumeRange.value) / 100;
});

colorPicker?.addEventListener("input", () => {
    if (!selectedButton) return;
    setButtonAccent(selectedButton, colorPicker.value);
    if (!selectedButton.classList.contains("has-image")) {
        selectedButton.style.backgroundColor = colorPicker.value;
    }
    const buttonId = getButtonId(selectedButton);
    localStorage.setItem("straemgab.color." + buttonId, colorPicker.value);
});

imageInput?.addEventListener("change", () => {
    if (!selectedButton) return;
    const file = imageInput.files?.[0];
    if (!file) return;
    applyImageToButton(selectedButton, file);
});

// Áudio personalizado
audioInput?.addEventListener("change", async () => {
    if (!selectedButton) return;
    const file = audioInput.files?.[0];
    if (!file) return;
    await applyAudioToButton(selectedButton, file);
    if (audioFilenameEl) audioFilenameEl.textContent = `Áudio: ${file.name}`;
});

audioClearBtn?.addEventListener("click", () => {
    if (!selectedButton) return;
    removeCustomAudio(selectedButton);
});

// Ação do botão
actionTypeSelect?.addEventListener("change", () => {
    if (!selectedButton) return;
    const buttonId = getButtonId(selectedButton);
    const configs = loadButtonConfigs();
    const cfg = getButtonConfig(configs, buttonId);
    cfg.action.type = actionTypeSelect.value;
    setButtonConfig(configs, buttonId, cfg);
    if (actionOpenFieldsEl) actionOpenFieldsEl.hidden = cfg.action.type !== "open";
});

actionOpenUrlInput?.addEventListener("input", () => {
    if (!selectedButton) return;
    const buttonId = getButtonId(selectedButton);
    const configs = loadButtonConfigs();
    const cfg = getButtonConfig(configs, buttonId);
    cfg.action.url = actionOpenUrlInput.value;
    setButtonConfig(configs, buttonId, cfg);
});

// ── Hotkeys ───────────────────────────────────────────────
window.addEventListener("keydown", (e) => {
    if (shouldIgnoreHotkeysBecauseTyping()) return;

    const shortcut = shortcutFromKeyboardEvent(e);
    if (!shortcut) return;

    const configs = loadButtonConfigs();
    const wanted = shortcutToId(shortcut);
    const match = Object.entries(configs).find(([, c]) => shortcutToId((c && c.shortcut) || null) === wanted);
    if (!match) return;

    const buttonId = match[0];
    const cfg = getButtonConfig(configs, buttonId);

    e.preventDefault();
    e.stopPropagation();

    if (cfg.action.type === "open") {
        openUrlOrProtocol(cfg.action.url);
        return;
    }

    const btn = buttonById.get(buttonId);
    if (!btn) return;
    selectButton(btn);
    syncAjustesFromSelected();
    void togglePlayForButton(btn);
}, true);

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !ajustesEl.hidden) fecharAjustes();
});

audio.addEventListener("ended", clearPlayingState);

// ── Ctrl + número (atalho legado) ─────────────────────────
// Dispara a ação do botão (som OU link) ao pressionar Ctrl+1…0,-,=
window.addEventListener("keydown", (e) => {
    if (!e.ctrlKey) return;
    if (shouldIgnoreHotkeysBecauseTyping()) return;

    let idx;
    if (/^[1-9]$/.test(e.key)) idx = parseInt(e.key, 10) - 1;
    else if (e.key === "0") idx = 9;
    else if (e.key === "-") idx = 10;
    else if (e.key === "=") idx = 11;
    else return;

    e.preventDefault();

    const btn = soundButtons[idx];
    if (!btn) return;

    const buttonId = getButtonId(btn);
    const configs = loadButtonConfigs();
    const cfg = getButtonConfig(configs, buttonId);

    if (cfg.action.type === "open" && cfg.action.url) {
        openUrlOrProtocol(cfg.action.url);
        return;
    }

    btn.click();
});

// ── Atalhos do modal (inputs de texto) ───────────────────
document.querySelectorAll(".shortcut-row input").forEach((input, index) => {
    input.addEventListener("change", () => {
        // Registra atalho simples de tecla única via sistema legado
        // (compatibilidade com o campo de texto da aba Atalhos)
    });
});

// ── Tema claro/escuro ─────────────────────────────────────
const themeBtn = document.createElement("button");
themeBtn.className = "settings-btn";
themeBtn.style.marginRight = "8px";

const savedTheme = localStorage.getItem("theme") || "dark";
if (savedTheme === "light") {
    document.body.classList.add("theme-light");
    themeBtn.textContent = "☀️ Claro";
} else {
    themeBtn.textContent = "🌙 Escuro";
}

themeBtn.onclick = () => {
    const isLight = document.body.classList.toggle("theme-light");
    themeBtn.textContent = isLight ? "☀️ Claro" : "🌙 Escuro";
    localStorage.setItem("theme", isLight ? "light" : "dark");
};

document.querySelector(".topbar").prepend(themeBtn);

// ── PWA ───────────────────────────────────────────────────
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    });
}