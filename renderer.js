// renderer.js - Logica dell'interfaccia utente

// ─── STATO GLOBALE ───────────────────────────────────────────────────────────
const state = {
  vaultPath: null,
  masterPwd: null,
  vault: null,        // { entries: [], ... }
  currentEntry: null, // entry selezionata
  currentCat: 'all',
  searchQuery: '',
  editMode: false,    // true = nuova voce o modifica
  selectedUsb: null,
  usbDrives: [],      // lista aggiornata delle unità
};

// ─── UTILITY ─────────────────────────────────────────────────────────────────
function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span> ${msg}`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Valutazione forza password
function measureStrength(pwd) {
  if (!pwd) return { score: 0, color: '#333' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 14) score++;
  if (pwd.length >= 20) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const pct = Math.min(100, (score / 7) * 100);
  const color = pct < 30 ? '#ff3f3f' : pct < 60 ? '#ffb03f' : pct < 85 ? '#3fd4ff' : '#3fffb8';
  return { score: pct, color };
}

// ─── USB SCAN ────────────────────────────────────────────────────────────────
async function scanUsb() {
  const dropdown = document.getElementById('usb-select');
  dropdown.innerHTML = '<option value="">Scansione in corso...</option>';

  const drives = await window.vaultAPI.scanUsb();
  state.usbDrives = drives || [];
  state.selectedUsb = null;

  if (!state.usbDrives || state.usbDrives.length === 0) {
    dropdown.innerHTML = '<option value="">Nessuna USB - Usa "Sfoglia"</option>';
    updateLockButtons();
    return;
  }

  dropdown.innerHTML = '';
  state.usbDrives.forEach((drive, index) => {
    const opt = document.createElement('option');
    opt.value = index;
    opt.textContent = `${drive.hasVault ? '🔒' : '✨'} ${drive.label} (${drive.path})`;
    dropdown.appendChild(opt);
  });

  // Gestione selezione
  dropdown.onchange = () => {
    const drive = state.usbDrives[dropdown.value];
    state.selectedUsb = drive;
    updateLockButtons();
  };

  // Auto-seleziona la prima se ce n'è solo una o seleziona la prima con vault
  const withVault = state.usbDrives.findIndex(d => d.hasVault);
  if (withVault !== -1) {
    dropdown.value = withVault;
  } else {
    dropdown.value = 0;
  }
  dropdown.onchange();
}

function updateLockButtons() {
  const btnOpen = document.getElementById('btn-open-vault');
  const btnCreate = document.getElementById('btn-create-vault');
  if (!state.selectedUsb) {
    btnOpen.textContent = '🔓 Apri Vault';
    btnCreate.textContent = '✨ Crea Nuovo Vault';
  } else if (state.selectedUsb.hasVault) {
    btnOpen.textContent = `🔓 Apri Vault su ${state.selectedUsb.label}`;
    btnCreate.textContent = `⚠️ Sovrascrivi vault su ${state.selectedUsb.label}`;
  } else {
    btnOpen.textContent = `🔓 Apri da ${state.selectedUsb.label}`;
    btnCreate.textContent = `✨ Crea Vault su ${state.selectedUsb.label}`;
  }
}

// ─── VAULT MANAGEMENT ────────────────────────────────────────────────────────
async function openVault() {
  const path = state.selectedUsb?.path;
  const pwd = document.getElementById('master-pwd').value;
  const errEl = document.getElementById('lock-error');
  errEl.style.display = 'none';

  if (!path) { errEl.textContent = 'Seleziona una unità USB.'; errEl.style.display = 'block'; return; }
  if (!pwd) { errEl.textContent = 'Inserisci la master password.'; errEl.style.display = 'block'; return; }

  const result = await window.vaultAPI.openVault({ usbPath: path, masterPassword: pwd });
  if (!result.success) {
    errEl.textContent = result.error;
    errEl.style.display = 'block';
    return;
  }

  state.vaultPath = path;
  state.masterPwd = pwd;
  state.vault = result.vault;
  document.getElementById('master-pwd').value = '';

  enterVault();
}

async function createVault() {
  const path = state.selectedUsb?.path;
  const pwd = document.getElementById('master-pwd').value;
  const errEl = document.getElementById('lock-error');
  errEl.style.display = 'none';

  if (!path) { errEl.textContent = 'Seleziona una unità USB.'; errEl.style.display = 'block'; return; }
  if (!pwd || pwd.length < 8) { errEl.textContent = 'Master password: minimo 8 caratteri.'; errEl.style.display = 'block'; return; }

  const result = await window.vaultAPI.createVault({ usbPath: path, masterPassword: pwd });
  if (!result.success) {
    errEl.textContent = result.error;
    errEl.style.display = 'block';
    return;
  }

  state.vaultPath = path;
  state.masterPwd = pwd;
  state.vault = { entries: [], createdAt: new Date().toISOString(), version: 1 };
  document.getElementById('master-pwd').value = '';

  toast('Vault creato con successo!', 'success');
  enterVault();
}

async function saveVault() {
  const result = await window.vaultAPI.saveVault({
    usbPath: state.vaultPath,
    masterPassword: state.masterPwd,
    vault: state.vault,
  });
  if (!result.success) {
    toast('Errore nel salvataggio: ' + result.error, 'error');
    return false;
  }
  return true;
}

function enterVault() {
  const dot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  dot.className = 'status-dot open';
  statusText.textContent = `Vault: ${state.selectedUsb?.label || state.vaultPath}`;

  document.getElementById('btn-new-entry').style.display = 'block';
  document.getElementById('btn-lock').style.display = 'block';

  renderEntries();
  showScreen('screen-vault');
  document.getElementById('btn-import').style.display = 'block';
}

function lockVault() {
  state.vaultPath = null;
  state.masterPwd = null;
  state.vault = null;
  state.currentEntry = null;
  state.selectedUsb = null;
  state.searchQuery = '';

  document.getElementById('status-dot').className = 'status-dot locked';
  document.getElementById('status-text').textContent = 'Nessun vault aperto';
  document.getElementById('btn-new-entry').style.display = 'none';
  document.getElementById('btn-lock').style.display = 'none';
  document.getElementById('btn-import').style.display = 'none';
  document.getElementById('entries-list').innerHTML = '';
  document.getElementById('search-box').value = '';

  scanUsb();
  showScreen('screen-lock');
}

// ─── ENTRIES RENDERING ────────────────────────────────────────────────────────
function getFilteredEntries() {
  if (!state.vault) return [];
  let entries = state.vault.entries;
  if (state.currentCat !== 'all') {
    entries = entries.filter(e => e.category === state.currentCat);
  }
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    entries = entries.filter(e =>
      e.name.toLowerCase().includes(q) ||
      (e.username || '').toLowerCase().includes(q) ||
      (e.url || '').toLowerCase().includes(q)
    );
  }
  return entries;
}

function renderEntries() {
  if (!state.vault) return;

  const entries = state.vault.entries;
  const filtered = getFilteredEntries();
  const list = document.getElementById('entries-list');

  // Aggiorna contatori
  document.getElementById('count-all').textContent = entries.length;
  ['web', 'app', 'bank', 'other'].forEach(cat => {
    document.getElementById(`count-${cat}`).textContent =
      entries.filter(e => e.category === cat).length;
  });

  list.innerHTML = '';

  if (filtered.length === 0) {
    list.innerHTML = `<div style="color:var(--text-dim); font-size:12px; padding:16px; text-align:center;">
      ${state.searchQuery ? 'Nessun risultato.' : 'Nessuna voce. Crea la prima!'}
    </div>`;
    return;
  }

  const catEmoji = { web: '🌐', app: '📱', bank: '🏦', other: '📁' };

  filtered.forEach(entry => {
    const el = document.createElement('div');
    el.className = 'entry-item' + (state.currentEntry?.id === entry.id ? ' active' : '');
    const initial = entry.name.charAt(0).toUpperCase();
    el.innerHTML = `
      <div class="entry-avatar">🛡️</div>
      <div class="entry-info">
        <div class="entry-name">${entry.name || 'Senza nome'}</div>
        <div class="entry-user">${entry.username || 'Nessun utente'}</div>
      </div>
      <div class="entry-cat-badge">${entry.category || 'Generale'}</div>
    `;
    el.addEventListener('click', () => selectEntry(entry));
    list.appendChild(el);
  });
}

// ─── ENTRY DETAIL ─────────────────────────────────────────────────────────────
function selectEntry(entry) {
  state.currentEntry = entry;
  state.editMode = false;
  fillDetailForm(entry);
  document.querySelectorAll('.entry-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.entry-item').forEach(el => {
    if (el.querySelector('.entry-name')?.textContent === entry.name) el.classList.add('active');
  });
  showScreen('screen-detail');
  document.getElementById('detail-title').textContent = entry.name;
  document.getElementById('btn-delete-entry').style.display = 'inline-flex';
}

function fillDetailForm(entry) {
  document.getElementById('entry-id').value = entry.id || '';
  document.getElementById('detail-form').innerHTML = `
    <div class="detail-hero">
      <div class="entry-avatar">🛡️</div>
      <h2>${entry.name || 'Senza nome'}</h2>
    </div>
    <div class="field-row">
      <div class="field">
        <label>Nome Sito / App</label>
        <input type="text" id="entry-name" value="${entry.name || ''}" placeholder="Esempio: Google">
      </div>
      <div class="field">
        <label>Categoria</label>
        <select id="entry-cat">
          <option value="web" ${entry.category === 'web' ? 'selected' : ''}>🌐 Web</option>
          <option value="app" ${entry.category === 'app' ? 'selected' : ''}>📱 App</option>
          <option value="bank" ${entry.category === 'bank' ? 'selected' : ''}>🏦 Banca</option>
          <option value="other" ${entry.category === 'other' ? 'selected' : ''}>📁 Altro</option>
        </select>
      </div>
    </div>
    
    <div class="field">
      <label>Username / Email</label>
      <div class="password-field">
        <div class="field">
          <input type="text" id="entry-username" value="${entry.username || ''}" placeholder="nome@esempio.com">
        </div>
        <button class="btn-icon" onclick="copyToClipboard('${entry.username || ''}', 'Username')" title="Copia Username">📋</button>
      </div>
    </div>

    <div class="field">
      <label>Password</label>
      <div class="password-field">
        <div class="field">
          <input type="password" id="entry-password" value="${entry.password || ''}" placeholder="••••••••">
        </div>
        <button class="btn-icon" id="btn-toggle-pwd-detail" title="Mostra/Nascondi">👁️</button>
        <button class="btn-icon" onclick="copyToClipboard('${entry.password || ''}', 'Password')" title="Copia Password">📋</button>
      </div>
    </div>

    <div class="field">
      <label>URL</label>
      <div class="password-field">
        <div class="field">
          <input type="url" id="entry-url" value="${entry.url || ''}" placeholder="https://www.esempio.com">
        </div>
        <button class="btn-icon" id="btn-open-url-detail" title="Apri Sito">🌐</button>
      </div>
    </div>

    <div class="field">
      <label>Note</label>
      <textarea id="entry-notes" placeholder="Note aggiuntive...">${entry.notes || ''}</textarea>
    </div>
  `;

  // Re-attach listeners for dynamically created buttons
  document.getElementById('btn-toggle-pwd-detail').addEventListener('click', () => {
    const inp = document.getElementById('entry-password');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  document.getElementById('btn-open-url-detail').addEventListener('click', () => {
    const url = document.getElementById('entry-url').value;
    if (url) window.vaultAPI.openExternal(url);
    else toast('Nessun URL da aprire.', 'error');
  });

  // Strength bar update on input
  document.getElementById('entry-password').addEventListener('input', e => {
    updateStrengthBar(e.target.value);
  });

  updateStrengthBar(entry.password || '');
}

function clearDetailForm() {
  ['entry-id','entry-name','entry-url','entry-username','entry-password','entry-notes'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('entry-cat').value = 'web';
  updateStrengthBar('');
}

function newEntry() {
  state.currentEntry = null;
  state.editMode = true;
  clearDetailForm();
  showScreen('screen-detail');
  document.getElementById('detail-title').textContent = 'Nuova voce';
  document.getElementById('btn-delete-entry').style.display = 'none';
  document.getElementById('entry-name').focus();
}

async function saveEntry() {
  const name = document.getElementById('entry-name').value.trim();
  if (!name) { toast('Inserisci un nome per la voce.', 'error'); return; }

  const entry = {
    id: document.getElementById('entry-id').value || generateId(),
    name,
    category: document.getElementById('entry-cat').value,
    url: document.getElementById('entry-url').value.trim(),
    username: document.getElementById('entry-username').value.trim(),
    password: document.getElementById('entry-password').value,
    notes: document.getElementById('entry-notes').value.trim(),
    updatedAt: new Date().toISOString(),
  };

  const idx = state.vault.entries.findIndex(e => e.id === entry.id);
  if (idx >= 0) {
    state.vault.entries[idx] = entry;
  } else {
    entry.createdAt = entry.updatedAt;
    state.vault.entries.unshift(entry);
  }

  const ok = await saveVault();
  if (ok) {
    state.currentEntry = entry;
    renderEntries();
    document.getElementById('detail-title').textContent = entry.name;
    document.getElementById('entry-id').value = entry.id;
    document.getElementById('btn-delete-entry').style.display = 'inline-flex';
    toast('Salvato!', 'success');
  }
}

async function deleteEntry() {
  const id = document.getElementById('entry-id').value;
  if (!id) return;
  if (!confirm('Eliminare questa voce? L\'azione non può essere annullata.')) return;

  state.vault.entries = state.vault.entries.filter(e => e.id !== id);
  const ok = await saveVault();
  if (ok) {
    state.currentEntry = null;
    renderEntries();
    showScreen('screen-vault');
    toast('Voce eliminata.', 'info');
  }
}

// ─── IMPORT ──────────────────────────────────────────────────────────────────
async function importGooglePasswords() {
  if (!state.vault) return;

  const filePath = await window.vaultAPI.selectCsvFile();
  if (!filePath) return;

  try {
    const csvData = await window.vaultAPI.readFile(filePath);
    const lines = csvData.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
      toast('Il file CSV sembra vuoto.', 'error');
      return;
    }

    // Google CSV Headers (default): name,url,username,password,note
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
    const idx = {
      name: headers.indexOf('name'),
      url: headers.indexOf('url'),
      username: headers.indexOf('username'),
      password: headers.indexOf('password'),
      note: headers.indexOf('note')
    };

    // Fallback per Chrome in italiano o altri nomi comuni
    if (idx.name === -1) idx.name = headers.indexOf('nome');
    if (idx.username === -1) idx.username = headers.indexOf('nome utente');
    if (idx.note === -1) idx.note = headers.indexOf('nota');

    let importedCount = 0;
    let duplicateCount = 0;

    for (let i = 1; i < lines.length; i++) {
      // Semplice parsing CSV
      const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
      
      const entry = {
        id: generateId(),
        name: idx.name !== -1 && cols[idx.name] ? cols[idx.name] : (idx.url !== -1 && cols[idx.url] ? new URL(cols[idx.url]).hostname : 'Importato'),
        category: 'web',
        url: idx.url !== -1 ? cols[idx.url] : '',
        username: idx.username !== -1 ? cols[idx.username] : '',
        password: idx.password !== -1 ? cols[idx.password] : '',
        notes: idx.note !== -1 ? cols[idx.note] : 'Importato da Google Chrome CSV',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      if (!entry.name || entry.name === 'undefined') entry.name = entry.url || 'Senza nome';

      // Controllo duplicati (stesso URL e stesso Username)
      const isDuplicate = state.vault.entries.some(e => 
        e.url === entry.url && e.username === entry.username && e.password === entry.password
      );

      if (!isDuplicate) {
        state.vault.entries.push(entry);
        importedCount++;
      } else {
        duplicateCount++;
      }
    }

    if (importedCount > 0) {
      await saveVault();
      renderEntries();
      toast(`Importate ${importedCount} password.${duplicateCount ? ` (${duplicateCount} duplicati saltati)` : ''}`, 'success');
    } else {
      toast('Nessuna nuova password importata.', 'info');
    }
  } catch (err) {
    console.error(err);
    toast('Errore durante l\'importazione: ' + err.message, 'error');
  }
}

// ─── PASSWORD STRENGTH ────────────────────────────────────────────────────────
function updateStrengthBar(pwd) {
  const { score, color } = measureStrength(pwd);
  const bar = document.getElementById('strength-bar');
  bar.style.width = score + '%';
  bar.style.background = color;
}

// ─── GENERATOR ────────────────────────────────────────────────────────────────
async function generatePassword() {
  const length = parseInt(document.getElementById('gen-length').value);
  const upper = document.getElementById('gen-upper').checked;
  const lower = document.getElementById('gen-lower').checked;
  const digits = document.getElementById('gen-digits').checked;
  const symbols = document.getElementById('gen-symbols').checked;

  const pwd = await window.vaultAPI.generatePassword({ length, upper, lower, digits, symbols });
  document.getElementById('gen-output').textContent = pwd;
}

// ─── COPY ─────────────────────────────────────────────────────────────────────
function copyToClipboard(text, label = 'Copiato') {
  navigator.clipboard.writeText(text).then(() => {
    const hint = document.getElementById('copy-hint');
    hint.textContent = `✓ ${label} copiato!`;
    hint.classList.add('show');
    setTimeout(() => hint.classList.remove('show'), 2000);
  });
}

// ─── EVENT LISTENERS ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // USB scan
  await scanUsb();

  document.getElementById('btn-refresh-usb').addEventListener('click', scanUsb);
  document.getElementById('btn-select-folder').addEventListener('click', async () => {
    const folder = await window.vaultAPI.selectFolder();
    if (!folder) return;
    const hasVault = true; // assumi che potrebbe esistere
    const drive = { path: folder, label: folder.split(/[\\/]/).pop() || folder, hasVault };
    
    // Aggiungi alla lista e seleziona
    state.usbDrives.push(drive);
    state.selectedUsb = drive;
    
    const dropdown = document.getElementById('usb-select');
    const opt = document.createElement('option');
    opt.value = state.usbDrives.length - 1;
    opt.textContent = `📁 ${drive.label} (${folder})`;
    dropdown.appendChild(opt);
    dropdown.value = opt.value;
    
    updateLockButtons();
  });

  document.getElementById('btn-open-vault').addEventListener('click', openVault);
  document.getElementById('btn-create-vault').addEventListener('click', createVault);
  document.getElementById('master-pwd').addEventListener('keydown', e => {
    if (e.key === 'Enter') openVault();
  });

  // Vault actions
  document.getElementById('btn-lock').addEventListener('click', lockVault);
  document.getElementById('btn-import').addEventListener('click', importGooglePasswords);
  document.getElementById('btn-new-entry').addEventListener('click', newEntry);
  document.getElementById('btn-new-entry-main').addEventListener('click', newEntry);
  document.getElementById('btn-save-entry').addEventListener('click', saveEntry);
  document.getElementById('btn-delete-entry').addEventListener('click', deleteEntry);
  document.getElementById('btn-discard').addEventListener('click', () => {
    if (state.currentEntry) {
      selectEntry(state.currentEntry);
    } else {
      showScreen('screen-vault');
    }
  });

  // Search
  document.getElementById('search-box').addEventListener('input', e => {
    state.searchQuery = e.target.value;
    renderEntries();
  });

  // Categories
  document.querySelectorAll('.cat-item').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.cat-item').forEach(i => i.classList.remove('active'));
      el.classList.add('active');
      state.currentCat = el.dataset.cat;
      renderEntries();
    });
  });

  // Password field
  document.getElementById('entry-password').addEventListener('input', e => {
    updateStrengthBar(e.target.value);
  });

  document.getElementById('btn-toggle-pwd').addEventListener('click', () => {
    const inp = document.getElementById('entry-password');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  document.getElementById('btn-copy-pwd').addEventListener('click', () => {
    const pwd = document.getElementById('entry-password').value;
    if (pwd) copyToClipboard(pwd, 'Password');
    else toast('Nessuna password da copiare.', 'error');
  });

  // Generator
  document.getElementById('btn-generate').addEventListener('click', async () => {
    document.getElementById('modal-generator').classList.add('open');
    await generatePassword();
  });

  document.getElementById('gen-length').addEventListener('input', e => {
    document.getElementById('gen-length-val').textContent = e.target.value;
    generatePassword();
  });

  ['gen-upper','gen-lower','gen-digits','gen-symbols'].forEach(id => {
    document.getElementById(id).addEventListener('change', generatePassword);
  });

  document.getElementById('btn-gen-refresh').addEventListener('click', generatePassword);

  document.getElementById('gen-output').addEventListener('click', () => {
    const pwd = document.getElementById('gen-output').textContent;
    if (pwd && pwd !== '—') {
      navigator.clipboard.writeText(pwd);
      toast('Password copiata!', 'success');
    }
  });

  document.getElementById('btn-gen-close').addEventListener('click', () => {
    document.getElementById('modal-generator').classList.remove('open');
  });

  document.getElementById('btn-gen-use').addEventListener('click', () => {
    const pwd = document.getElementById('gen-output').textContent;
    if (pwd && pwd !== '—') {
      document.getElementById('entry-password').value = pwd;
      document.getElementById('entry-password').type = 'text';
      updateStrengthBar(pwd);
      document.getElementById('modal-generator').classList.remove('open');
    }
  });

  // Branding Links
  document.getElementById('link-branding').addEventListener('click', () => {
    window.vaultAPI.openExternal('https://www.cosmonet.info');
  });
  document.getElementById('link-support').addEventListener('click', () => {
    window.vaultAPI.openExternal('https://www.cosmonet.info/community/');
  });

  // Close modal on overlay click
  document.getElementById('modal-generator').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
  });
});
