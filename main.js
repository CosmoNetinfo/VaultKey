// main.js - Processo principale Electron
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const os = require('os');
const { promisify } = require('util');

const pbkdf2 = promisify(crypto.pbkdf2);

let mainWindow;

// ─── COSTANTI ───────────────────────────────────────────────────────────────
const DB_FILENAME = 'vaultkey.vk';
const SALT_FILENAME = 'vaultkey.salt';
const ITERATIONS = 310000;  // PBKDF2 iterations (NIST recommended)
const KEY_LENGTH = 32;      // 256 bit
const ALGORITHM = 'aes-256-gcm';

// ─── FINESTRA PRINCIPALE ─────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#0a0a0f',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,
  });

  mainWindow.loadFile('index.html');
  mainWindow.once('ready-to-show', () => mainWindow.show());
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ─── CRYPTO UTILITIES ────────────────────────────────────────────────────────

/** Deriva una chiave AES-256 dalla master password + salt usando PBKDF2 */
async function deriveKey(masterPassword, salt) {
  return pbkdf2(masterPassword, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

/** Cifra i dati con AES-256-GCM */
function encrypt(data, key) {
  const iv = crypto.randomBytes(12); // 96-bit IV per GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag(); // 128-bit authentication tag
  // Formato: IV (12) + AuthTag (16) + Ciphertext
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/** Decifra i dati con AES-256-GCM */
function decrypt(base64, key) {
  const buf = Buffer.from(base64, 'base64');
  const iv = buf.slice(0, 12);
  const authTag = buf.slice(12, 28);
  const ciphertext = buf.slice(28);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}

// ─── RILEVAMENTO USB ─────────────────────────────────────────────────────────

/** Ottieni i possibili percorsi USB in base alla piattaforma */
function getUsbCandidates() {
  const platform = process.platform;
  if (platform === 'win32') {
    // Windows: tutte le lettere di unità dalla D: alla Z:
    const drives = [];
    for (let c = 68; c <= 90; c++) {
      const drive = `${String.fromCharCode(c)}:\\`;
      if (fs.existsSync(drive)) drives.push(drive);
    }
    return drives;
  } else if (platform === 'darwin') {
    // macOS: volumi montati
    const volumes = '/Volumes';
    if (!fs.existsSync(volumes)) return [];
    return fs.readdirSync(volumes)
      .map(v => path.join(volumes, v))
      .filter(v => {
        try { fs.accessSync(v, fs.constants.W_OK); return true; } catch { return false; }
      });
  } else {
    // Linux: /media e /mnt
    const candidates = [];
    const user = os.userInfo().username;
    const mediaPaths = [`/media/${user}`, '/media', '/mnt', `/run/media/${user}`];
    for (const base of mediaPaths) {
      if (fs.existsSync(base)) {
        try {
          fs.readdirSync(base).forEach(d => candidates.push(path.join(base, d)));
        } catch {}
      }
    }
    return candidates;
  }
}

/** Cerca chiavette che contengono già un vault VaultKey */
function findExistingVaults() {
  const candidates = getUsbCandidates();
  return candidates
    .filter(p => fs.existsSync(path.join(p, DB_FILENAME)))
    .map(p => ({ path: p, hasVault: true }));
}

// ─── IPC HANDLERS ────────────────────────────────────────────────────────────

// Scansiona USB disponibili
ipcMain.handle('scan-usb', async () => {
  const candidates = getUsbCandidates();
  const results = candidates.map(p => {
    let label = path.basename(p) || p;
    let writable = false;
    try { fs.accessSync(p, fs.constants.W_OK); writable = true; } catch {}
    const hasVault = fs.existsSync(path.join(p, DB_FILENAME));
    return { path: p, label, writable, hasVault };
  }).filter(r => r.writable);
  return results;
});

// Crea nuovo vault su USB
ipcMain.handle('create-vault', async (event, { usbPath, masterPassword }) => {
  try {
    const salt = crypto.randomBytes(32);
    const key = await deriveKey(masterPassword, salt);
    const emptyVault = { entries: [], createdAt: new Date().toISOString(), version: 1 };
    const encrypted = encrypt(emptyVault, key);

    fs.writeFileSync(path.join(usbPath, SALT_FILENAME), salt.toString('base64'));
    fs.writeFileSync(path.join(usbPath, DB_FILENAME), encrypted);

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Apri vault esistente
ipcMain.handle('open-vault', async (event, { usbPath, masterPassword }) => {
  try {
    const saltBase64 = fs.readFileSync(path.join(usbPath, SALT_FILENAME), 'utf8');
    const salt = Buffer.from(saltBase64, 'base64');
    const key = await deriveKey(masterPassword, salt);
    const encrypted = fs.readFileSync(path.join(usbPath, DB_FILENAME), 'utf8');
    const vault = decrypt(encrypted, key);
    return { success: true, vault };
  } catch (err) {
    return { success: false, error: 'Password errata o file corrotto.' };
  }
});

// Salva vault (dopo modifica)
ipcMain.handle('save-vault', async (event, { usbPath, masterPassword, vault }) => {
  try {
    const saltBase64 = fs.readFileSync(path.join(usbPath, SALT_FILENAME), 'utf8');
    const salt = Buffer.from(saltBase64, 'base64');
    const key = await deriveKey(masterPassword, salt);
    vault.updatedAt = new Date().toISOString();
    const encrypted = encrypt(vault, key);
    fs.writeFileSync(path.join(usbPath, DB_FILENAME), encrypted);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Genera password sicura
ipcMain.handle('generate-password', async (event, options) => {
  const { length = 20, upper = true, lower = true, digits = true, symbols = true } = options;
  let charset = '';
  if (upper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lower) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (digits) charset += '0123456789';
  if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (!charset) charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let password = '';
  const randomBytes = crypto.randomBytes(length * 2);
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  return password;
});

// Seleziona cartella manuale
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Seleziona posizione vault',
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});
