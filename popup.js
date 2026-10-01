/* ─────────────────────────────────────────────────────
   Color Picker Pro — popup.js
   Storage: chrome.storage.local  |  No localStorage
───────────────────────────────────────────────────── */
'use strict';

// ══════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════
let currentHex    = '#FFFFFF';
let currentFormat = 'hex';
let MAX_HISTORY   = 10;

const DEFAULT_SETTINGS = {
    defaultFormat: 'hex',
    historyLimit:  10,
    autoCopy:      false,
    confirmCopy:   true
};
let settings = { ...DEFAULT_SETTINGS };

// ══════════════════════════════════════════════════
//  DOM REFS
// ══════════════════════════════════════════════════
const colorInput        = document.getElementById('defaultColorPicker');
const colorCodeInput    = document.getElementById('colorCodeInput');
const copyColorBtn      = document.getElementById('copyColorBtn');
const colorHistoryEl    = document.getElementById('colorHistory');
const historyEmpty      = document.getElementById('historyEmpty');
const paletteNameInput  = document.getElementById('paletteName');
const createPaletteBtn  = document.getElementById('createPaletteBtn');
const customPalettesEl  = document.getElementById('customPalettes');
const colorPreview      = document.getElementById('colorPreview');
const eyedropperBtn     = document.getElementById('eyedropperBtn');
const clearHistoryBtn   = document.getElementById('clearHistoryBtn');
const floatBtn          = document.getElementById('floatBtn');
const collapseBtn       = document.getElementById('collapseBtn');
const collapseIcon      = document.getElementById('collapseIcon');
const settingsBtn       = document.getElementById('settingsBtn');
const mainView          = document.getElementById('mainView');
const settingsView      = document.getElementById('settingsView');
const backBtn           = document.getElementById('backBtn');
const historyLimitSel   = document.getElementById('historyLimitSel');
const autoCopyToggle    = document.getElementById('autoCopyToggle');
const confirmCopyToggle = document.getElementById('confirmCopyToggle');
const shortcutsList     = document.getElementById('shortcutsList');
const editShortcutsBtn  = document.getElementById('editShortcutsBtn');
const formatBtns        = document.querySelectorAll('.format-btn');

// ══════════════════════════════════════════════════
//  INLINE SVG ICONS
// ══════════════════════════════════════════════════
const SVG_COPY = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="9" y="9" width="13" height="13" rx="2"/>
  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
</svg>`;

const SVG_CHECK = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="20 6 9 17 4 12"/>
</svg>`;

const SVG_PLUS = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
</svg>`;

const SVG_TRASH = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="3 6 5 6 21 6"/>
  <path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
  <path d="M9 6V4h6v2"/>
</svg>`;

const SVG_COMPRESS = `<polyline points="4 14 10 14 10 20"/>
  <polyline points="20 10 14 10 14 4"/>
  <line x1="10" y1="14" x2="21" y2="3"/>
  <line x1="3" y1="21" x2="14" y2="10"/>`;

const SVG_EXPAND = `<polyline points="15 3 21 3 21 9"/>
  <polyline points="9 21 3 21 3 15"/>
  <line x1="21" y1="3" x2="14" y2="10"/>
  <line x1="3" y1="21" x2="10" y2="14"/>`;

// ══════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════
let _toastTimer = null;
function showToast(msg, type = 'success') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className   = `toast ${type} show`;
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => { el.className = 'toast'; }, 2300);
}

// ══════════════════════════════════════════════════
//  STORAGE
// ══════════════════════════════════════════════════
const stGet = keys => new Promise(r => chrome.storage.local.get(keys, r));
const stSet = data => new Promise(r => chrome.storage.local.set(data, r));

// ══════════════════════════════════════════════════
//  COLOR CONVERSION
// ══════════════════════════════════════════════════
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgb(${r}, ${g}, ${b})`;
}
function hexToHsl(hex) {
    let r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h=0, s=0, l=(max+min)/2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d/(2-max-min) : d/(max+min);
        switch(max) {
            case r: h=((g-b)/d+(g<b?6:0))/6; break;
            case g: h=((b-r)/d+2)/6; break;
            case b: h=((r-g)/d+4)/6; break;
        }
    }
    return `hsl(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
}
function rgbToHex(rgb) {
    const m = rgb.match(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/i);
    if (!m) return null;
    const h = n => parseInt(n).toString(16).padStart(2,'0');
    return `#${h(m[1])}${h(m[2])}${h(m[3])}`.toUpperCase();
}
function hslToHex(hsl) {
    const m = hsl.match(/hsl\(\s*(\d+),\s*(\d+)%,\s*(\d+)%\s*\)/i);
    if (!m) return null;
    let h=parseInt(m[1])/360, s=parseInt(m[2])/100, l=parseInt(m[3])/100, r, g, b;
    if (s === 0) { r=g=b=l; }
    else {
        const q2 = (p,q,t) => { if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p; };
        const q = l<0.5?l*(1+s):l+s-l*s, p=2*l-q;
        r=q2(p,q,h+1/3); g=q2(p,q,h); b=q2(p,q,h-1/3);
    }
    const toH = n => Math.round(n*255).toString(16).padStart(2,'0');
    return `#${toH(r)}${toH(g)}${toH(b)}`.toUpperCase();
}
function formatted(hex, fmt) {
    switch(fmt) { case 'rgb': return hexToRgb(hex); case 'hsl': return hexToHsl(hex); default: return hex.toUpperCase(); }
}
function parseToHex(v) {
    v = v.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v.toUpperCase();
    if (/^#[0-9A-Fa-f]{3}$/.test(v)) { const [,a,b,c]=v; return `#${a}${a}${b}${b}${c}${c}`.toUpperCase(); }
    if (/^rgb\(/i.test(v))  return rgbToHex(v);
    if (/^hsl\(/i.test(v))  return hslToHex(v);
    return null;
}

// ══════════════════════════════════════════════════
//  SETTINGS
// ══════════════════════════════════════════════════
async function loadSettings() {
    const { userSettings } = await stGet('userSettings');
    settings = { ...DEFAULT_SETTINGS, ...(userSettings || {}) };
    applySettings();
}
function applySettings() {
    currentFormat = settings.defaultFormat;
    MAX_HISTORY   = Number(settings.historyLimit);
    formatBtns.forEach(b => b.classList.toggle('active', b.dataset.format === settings.defaultFormat));
    const radio = document.querySelector(`input[name="defFmt"][value="${settings.defaultFormat}"]`);
    if (radio) radio.checked = true;
    historyLimitSel.value       = settings.historyLimit;
    autoCopyToggle.checked      = settings.autoCopy;
    confirmCopyToggle.checked   = settings.confirmCopy;
}
async function saveSettings() { await stSet({ userSettings: settings }); }

// ══════════════════════════════════════════════════
//  DISPLAY
// ══════════════════════════════════════════════════
function updateDisplay(hex) {
    currentHex = hex.toUpperCase();
    colorInput.value = currentHex;
    colorPreview.style.backgroundColor = currentHex;
    colorCodeInput.value = formatted(currentHex, currentFormat);
}

// ══════════════════════════════════════════════════
//  FORMAT SWITCHER
// ══════════════════════════════════════════════════
formatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        formatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFormat = btn.dataset.format;
        colorCodeInput.value = formatted(currentHex, currentFormat);
        settings.defaultFormat = currentFormat;
        saveSettings();
    });
});

// ══════════════════════════════════════════════════
//  COPY BUTTON
// ══════════════════════════════════════════════════
copyColorBtn.innerHTML = SVG_COPY;
let _copyTimer = null;

function doCopy() {
    const value = colorCodeInput.value;
    navigator.clipboard.writeText(value).then(() => {
        copyColorBtn.innerHTML = SVG_CHECK;
        copyColorBtn.classList.add('copied');
        if (settings.confirmCopy) showToast(`Copied: ${value}`);
        clearTimeout(_copyTimer);
        _copyTimer = setTimeout(() => {
            copyColorBtn.innerHTML = SVG_COPY;
            copyColorBtn.classList.remove('copied');
        }, 1600);
    }).catch(() => showToast('Copy failed', 'error'));
}

copyColorBtn.addEventListener('click', doCopy);

// ══════════════════════════════════════════════════
//  NATIVE COLOR PICKER
// ══════════════════════════════════════════════════
colorInput.addEventListener('input', async e => {
    const hex = e.target.value.toUpperCase();
    updateDisplay(hex);
    if (settings.autoCopy) navigator.clipboard.writeText(formatted(hex, currentFormat));
    await addToHistory(hex);
});

// ══════════════════════════════════════════════════
//  TEXT INPUT
// ══════════════════════════════════════════════════
colorCodeInput.addEventListener('keydown', async e => {
    if (e.key !== 'Enter') return;
    const hex = parseToHex(colorCodeInput.value);
    if (hex) { updateDisplay(hex); await addToHistory(hex); }
    else      { showToast('Invalid color format', 'error'); }
});
colorCodeInput.addEventListener('blur', () => {
    const hex = parseToHex(colorCodeInput.value);
    if (hex) updateDisplay(hex);
    else     colorCodeInput.value = formatted(currentHex, currentFormat);
});

// ══════════════════════════════════════════════════
//  EYEDROPPER
// ══════════════════════════════════════════════════
if (window.EyeDropper) {
    eyedropperBtn.style.display = 'flex';
    eyedropperBtn.addEventListener('click', activateEyeDropper);
}
async function activateEyeDropper() {
    try {
        const result = await new EyeDropper().open();
        const hex = result.sRGBHex.toUpperCase();
        updateDisplay(hex);
        if (settings.autoCopy) navigator.clipboard.writeText(formatted(hex, currentFormat));
        await addToHistory(hex);
        showToast(`Picked: ${hex}`);
    } catch(_) { /* cancelled */ }
}

// ══════════════════════════════════════════════════
//  HISTORY
// ══════════════════════════════════════════════════
async function addToHistory(hex) {
    const { colorHistory = [] } = await stGet('colorHistory');
    const updated = [hex, ...colorHistory.filter(c => c !== hex)].slice(0, MAX_HISTORY);
    await stSet({ colorHistory: updated });
    renderHistory(updated);
}
async function loadHistory() {
    const { colorHistory = [] } = await stGet('colorHistory');
    renderHistory(colorHistory);
}
function renderHistory(history) {
    colorHistoryEl.innerHTML = '';
    historyEmpty.hidden = history.length > 0;
    history.forEach(color => {
        const wrap = document.createElement('div');
        wrap.className = 'swatch-wrapper';
        const swatch = document.createElement('div');
        swatch.className = 'swatch';
        swatch.style.backgroundColor = color;
        swatch.title = color;
        swatch.addEventListener('click', () => {
            updateDisplay(color);
            navigator.clipboard.writeText(formatted(color, currentFormat))
                .then(() => { if (settings.confirmCopy) showToast(`Picked: ${color}`); });
        });
        const del = document.createElement('button');
        del.className = 'swatch-delete';
        del.innerHTML = '×'; del.title = 'Remove';
        del.addEventListener('click', async e => {
            e.stopPropagation();
            const { colorHistory = [] } = await stGet('colorHistory');
            await stSet({ colorHistory: colorHistory.filter(c => c !== color) });
            await loadHistory();
        });
        wrap.append(swatch, del);
        colorHistoryEl.appendChild(wrap);
    });
}
clearHistoryBtn.addEventListener('click', async e => {
    e.stopPropagation();
    await stSet({ colorHistory: [] });
    renderHistory([]);
    showToast('History cleared');
});

// ══════════════════════════════════════════════════
//  PALETTES
// ══════════════════════════════════════════════════
createPaletteBtn.addEventListener('click', async () => {
    const name = paletteNameInput.value.trim();
    if (!name) { showToast('Enter a palette name', 'error'); return; }
    const { customPalettes = {}, colorHistory = [] } = await stGet(['customPalettes','colorHistory']);
    if (customPalettes[name]) { showToast(`"${name}" already exists`, 'error'); return; }
    customPalettes[name] = [...colorHistory];
    await stSet({ customPalettes });
    paletteNameInput.value = '';
    renderPalettes(customPalettes);
    showToast(`Palette "${name}" created`);
});
paletteNameInput.addEventListener('keydown', e => { if (e.key === 'Enter') createPaletteBtn.click(); });

async function loadPalettes() {
    const { customPalettes = {} } = await stGet('customPalettes');
    renderPalettes(customPalettes);
}
function renderPalettes(palettes) {
    customPalettesEl.innerHTML = '';
    const entries = Object.entries(palettes);
    if (entries.length === 0) {
        const p = document.createElement('p');
        p.className = 'empty-state';
        p.textContent = 'No palettes yet — create one above.';
        customPalettesEl.appendChild(p);
        return;
    }
    entries.forEach(([name, colors]) => customPalettesEl.appendChild(buildPaletteCard(name, colors)));
}
function buildPaletteCard(name, colors) {
    const card = document.createElement('div');
    card.className = 'palette';
    const header = document.createElement('div');
    header.className = 'palette-header';
    const title = document.createElement('span');
    title.className = 'palette-name'; title.textContent = name;
    const actions = document.createElement('div');
    actions.className = 'palette-actions';
    const addBtn = document.createElement('button');
    addBtn.className = 'palette-action-btn add-btn';
    addBtn.title = 'Add current color'; addBtn.innerHTML = SVG_PLUS;
    addBtn.addEventListener('click', async () => {
        const { customPalettes = {} } = await stGet('customPalettes');
        const list = customPalettes[name] || [];
        if (list.includes(currentHex)) { showToast('Already in palette','info'); return; }
        customPalettes[name] = [currentHex, ...list];
        await stSet({ customPalettes });
        renderPalettes(customPalettes);
        showToast(`Added ${currentHex} → "${name}"`);
    });
    const delBtn = document.createElement('button');
    delBtn.className = 'palette-action-btn delete-btn';
    delBtn.title = 'Delete palette'; delBtn.innerHTML = SVG_TRASH;
    delBtn.addEventListener('click', async () => {
        const { customPalettes = {} } = await stGet('customPalettes');
        delete customPalettes[name];
        await stSet({ customPalettes });
        renderPalettes(customPalettes);
        showToast(`Deleted "${name}"`);
    });
    actions.append(addBtn, delBtn);
    header.append(title, actions);
    const colorsDiv = document.createElement('div');
    colorsDiv.className = 'palette-colors';
    if (colors.length === 0) {
        const hint = document.createElement('span');
        hint.className = 'palette-empty'; hint.textContent = 'No colors yet';
        colorsDiv.appendChild(hint);
    } else {
        colors.forEach(color => {
            const sw = document.createElement('div');
            sw.className = 'palette-swatch';
            sw.style.backgroundColor = color; sw.title = color;
            sw.addEventListener('click', () => {
                updateDisplay(color);
                navigator.clipboard.writeText(formatted(color, currentFormat))
                    .then(() => { if (settings.confirmCopy) showToast(`Picked: ${color}`); });
            });
            colorsDiv.appendChild(sw);
        });
    }
    card.append(header, colorsDiv);
    return card;
}

// ══════════════════════════════════════════════════
//  COLLAPSIBLE SECTIONS
// ══════════════════════════════════════════════════
document.querySelectorAll('.cp-section-header').forEach(header => {
    const activate = e => {
        if (e.target.closest('#clearHistoryBtn')) return;
        const section = header.closest('.cp-section');
        const isExpanded = section.classList.toggle('expanded');
        header.setAttribute('aria-expanded', isExpanded);
        const body = document.getElementById(header.getAttribute('aria-controls'));
        if (body) body.setAttribute('aria-hidden', !isExpanded);
    };
    header.addEventListener('click', activate);
    header.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(e); } });
});

// ══════════════════════════════════════════════════
//  MINIMIZE
// ══════════════════════════════════════════════════
let isMinimized = false;
collapseBtn.addEventListener('click', () => {
    isMinimized = !isMinimized;
    document.body.classList.toggle('minimized', isMinimized);
    collapseIcon.innerHTML  = isMinimized ? SVG_EXPAND : SVG_COMPRESS;
    collapseBtn.title       = isMinimized ? 'Expand popup' : 'Minimize popup';
});

// ══════════════════════════════════════════════════
//  SETTINGS VIEW  (replaces main view)
// ══════════════════════════════════════════════════
settingsBtn.addEventListener('click', () => {
    mainView.hidden    = true;
    settingsView.hidden = false;
});
backBtn.addEventListener('click', () => {
    settingsView.hidden = true;
    mainView.hidden    = false;
});

// ── Preference handlers ─────────────────────────
document.querySelectorAll('input[name="defFmt"]').forEach(radio => {
    radio.addEventListener('change', () => {
        settings.defaultFormat = radio.value;
        currentFormat          = radio.value;
        formatBtns.forEach(b => b.classList.toggle('active', b.dataset.format === radio.value));
        colorCodeInput.value   = formatted(currentHex, currentFormat);
        saveSettings();
    });
});
historyLimitSel.addEventListener('change', () => {
    settings.historyLimit = parseInt(historyLimitSel.value);
    MAX_HISTORY           = settings.historyLimit;
    saveSettings();
});
autoCopyToggle.addEventListener('change',    () => { settings.autoCopy    = autoCopyToggle.checked;    saveSettings(); });
confirmCopyToggle.addEventListener('change', () => { settings.confirmCopy = confirmCopyToggle.checked; saveSettings(); });

// ── Keyboard shortcuts display ──────────────────
async function loadShortcuts() {
    try {
        const commands = await chrome.commands.getAll();
        shortcutsList.innerHTML = '';

        const friendlyNames = {
            '_execute_action': 'Open Color Picker',
            'copy-last-color': 'Copy last color',
            'activate-eyedropper': 'Activate eyedropper'
        };

        commands.forEach(cmd => {
            const row = document.createElement('div');
            row.className = 'shortcut-row';

            const desc = document.createElement('span');
            desc.className   = 'shortcut-desc';
            desc.textContent = friendlyNames[cmd.name] || cmd.description || cmd.name;

            const keyWrap = document.createElement('span');
            keyWrap.className = 'shortcut-key';

            if (cmd.shortcut) {
                // Split "Ctrl+Shift+P" into individual key badges
                cmd.shortcut.split('+').forEach(key => {
                    const badge = document.createElement('span');
                    badge.className   = 'key-badge';
                    badge.textContent = key;
                    keyWrap.appendChild(badge);
                });
            } else {
                const none = document.createElement('span');
                none.className   = 'key-badge';
                none.textContent = 'Not set';
                none.style.opacity = '.5';
                keyWrap.appendChild(none);
            }

            row.append(desc, keyWrap);
            shortcutsList.appendChild(row);
        });
    } catch(_) { /* commands API unavailable */ }
}

editShortcutsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});

// ── External links ──────────────────────────────
document.querySelectorAll('.ext-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        chrome.tabs.create({ url: link.href });
    });
});

// ══════════════════════════════════════════════════
//  FLOAT WIDGET ON PAGE
// ══════════════════════════════════════════════════
floatBtn.addEventListener('click', async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        // Guard: tab may be undefined, or url may be restricted
        const tabUrl = tab?.url ?? '';
        if (!tab || !tabUrl ||
            tabUrl.startsWith('chrome://') ||
            tabUrl.startsWith('chrome-extension://') ||
            tabUrl.startsWith('about:') ||
            tabUrl.startsWith('edge://') ||
            tabUrl.startsWith('brave://')) {
            showToast("Can't inject on this page type", 'error');
            return;
        }
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func:   _floatWidgetFn,
            args:   [currentHex, formatted(currentHex, currentFormat)]
        });
        showToast('Swatch pinned to page ✓');
    } catch (err) {
        console.error('Float widget error:', err);
        showToast('Could not inject — try a normal web page', 'error');
    }
});

/** Runs inside the target page (no closure over popup scope). */
function _floatWidgetFn(hex, displayValue) {
    const WIDGET_ID = 'cp-float-root-v2';
    const existing = document.getElementById(WIDGET_ID);
    if (existing) {
        const s = existing.shadowRoot;
        if (s) {
            const strip = s.getElementById('cp-strip');
            const code  = s.getElementById('cp-code');
            if (strip) strip.style.background = hex;
            if (code)  code.textContent        = displayValue;
        }
        return;
    }
    const host = document.createElement('div');
    host.id = WIDGET_ID;
    Object.assign(host.style, { position:'fixed', top:'20px', right:'20px', zIndex:'2147483647' });
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode:'open' });
    shadow.innerHTML = `
      <style>
        *{box-sizing:border-box;margin:0;padding:0;}
        .w{background:#14142a;border:1px solid #2a2a48;border-radius:12px;width:190px;box-shadow:0 8px 32px rgba(0,0,0,.65);overflow:hidden;user-select:none;}
        .drag{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:#1e1e38;cursor:grab;border-bottom:1px solid #2a2a48;}
        .drag:active{cursor:grabbing;}
        .dtitle{color:#6c63ff;font-size:10.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;font-family:system-ui,sans-serif;}
        .close{width:20px;height:20px;background:transparent;border:1px solid #2a2a48;border-radius:4px;color:#4e5a70;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
        .close:hover{background:#ef4444;color:#fff;border-color:#ef4444;}
        .strip{width:100%;height:50px;background:${hex};transition:background .3s;}
        .bottom{display:flex;align-items:center;gap:7px;padding:9px 10px;}
        .code{flex:1;font-family:monospace;font-weight:700;font-size:13px;color:#f1f5f9;background:none;border:none;outline:none;cursor:default;letter-spacing:.5px;}
        .copy{width:28px;height:28px;background:#6c63ff;border:none;border-radius:6px;color:#fff;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s;}
        .copy:hover{background:#5b53e8;}
        .copy.ok{background:#22c55e;}
      </style>
      <div class="w">
        <div class="drag" id="drag">
          <span class="dtitle">Color Picker</span>
          <button class="close" id="cls">×</button>
        </div>
        <div class="strip" id="cp-strip"></div>
        <div class="bottom">
          <div class="code" id="cp-code">${displayValue}</div>
          <button class="copy" id="cpy" title="Copy">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
      </div>`;

    shadow.getElementById('cls').addEventListener('click', () => host.remove());
    shadow.getElementById('cpy').addEventListener('click', function() {
        navigator.clipboard.writeText(shadow.getElementById('cp-code').textContent).then(() => {
            this.classList.add('ok'); this.textContent = '✓';
            setTimeout(() => { this.classList.remove('ok'); this.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`; }, 1500);
        });
    });

    // Drag
    const dragEl = shadow.getElementById('drag');
    let dragging=false, sx, sy, ol, ot;
    dragEl.addEventListener('pointerdown', e => {
        if (e.target.id==='cls') return;
        dragging=true; const r=host.getBoundingClientRect();
        sx=e.clientX; sy=e.clientY; ol=r.left; ot=r.top;
        host.style.right='auto'; host.style.left=ol+'px'; host.style.top=ot+'px';
        dragEl.setPointerCapture(e.pointerId); e.preventDefault();
    });
    dragEl.addEventListener('pointermove', e => { if(!dragging) return; host.style.left=(ol+e.clientX-sx)+'px'; host.style.top=(ot+e.clientY-sy)+'px'; });
    dragEl.addEventListener('pointerup', () => { dragging=false; });
}

// ══════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
    copyColorBtn.innerHTML = SVG_COPY;
    collapseIcon.innerHTML = SVG_COMPRESS;

    await loadSettings();
    updateDisplay(currentHex);
    await Promise.all([loadHistory(), loadPalettes(), loadShortcuts()]);
});
