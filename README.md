# 🔐 VaultKey


<img width="1132" height="784" alt="Screenshot 2026-02-19 013738" src="https://github.com/user-attachments/assets/933cd883-6e52-4a84-a360-21c1455a4c66" />

[![CI](https://github.com/TUO_USERNAME/vaultkey/actions/workflows/ci.yml/badge.svg)](https://github.com/TUO_USERNAME/vaultkey/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-28-47848F?logo=electron)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)](https://github.com/TUO_USERNAME/vaultkey/releases)
[![Security: AES-256-GCM](https://img.shields.io/badge/Security-AES--256--GCM-green)](#-sicurezza)

> Password manager **cross-platform** che salva le tue password crittografate direttamente su una **chiavetta USB**. Nessun cloud. Nessun server. Solo tu e il tuo USB.

---

## ✨ Funzionalità

- 🔐 **Cifratura AES-256-GCM** — standard militare con autenticazione integrata
- 🔑 **PBKDF2-SHA512** — 310.000 iterazioni per resistere al brute-force
- 💾 **Dati sul tuo USB** — nessun cloud, nessun server, controllo totale
- ⚡ **Generatore password sicuro** — usa il CSPRNG del sistema operativo
- 🔍 **Rilevamento automatico USB** — su Windows, macOS e Linux
- 📊 **Indicatore forza password** — feedback visivo in tempo reale
- 🏷️ **Categorie** — Web, App, Banca, Altro
- 🔍 **Ricerca istantanea** — filtra il vault mentre digiti
- 📋 **Copia con un clic** — password negli appunti in un secondo
- 🔒 **Blocco vault** — chiude e pulisce la memoria in un clic

---

## 🖥️ Piattaforme supportate

| Sistema Operativo | Versione minima | Stato |
|-------------------|-----------------|-------|
| Windows | 10 / 11 | ✅ Supportato |
| macOS | 11 Big Sur+ | ✅ Supportato |
| Linux | Ubuntu 20.04+ (e derivate) | ✅ Supportato |

---

## 🚀 Installazione

### Prerequisiti
- [Node.js](https://nodejs.org) 18 o superiore

### Avvio in modalità sviluppo
```bash
git clone https://github.com/CosmoNetinfo/VaultKey.git
cd vaultkey
npm install
npm start
```

### Build per distribuzione
```bash
# Windows (.exe installer)
npm run build-win

# macOS (.dmg)
npm run build-mac

# Linux (.AppImage)
npm run build-linux
```
I file di installazione saranno nella cartella `dist/`.

---

## 🎯 Come si usa

1. **Inserisci la chiavetta USB** nel computer
2. **Avvia VaultKey** — le unità disponibili vengono rilevate automaticamente
3. **Prima volta**: seleziona l'USB → scegli una master password forte → "Crea Nuovo Vault"
4. **Volte successive**: seleziona il vault → inserisci la master password → "Apri Vault"
5. **Aggiungi, modifica, cerca** le tue password — ogni modifica viene salvata cifrata sull'USB

> 💡 Puoi anche usare "Sfoglia" per salvare il vault in qualsiasi cartella, non solo su USB.

---

## 🔒 Sicurezza

### Architettura crittografica

| Componente | Dettaglio |
|------------|-----------|
| **Algoritmo** | AES-256-GCM (authenticated encryption) |
| **Derivazione chiave** | PBKDF2-SHA512 |
| **Iterazioni PBKDF2** | 310.000 (consigliato NIST 2024) |
| **Salt** | 256-bit casuale, generato alla creazione |
| **IV** | 96-bit casuale, rigenerato ad ogni salvataggio |
| **Auth Tag** | 128-bit GCM — rileva qualsiasi manomissione |
| **Libreria crypto** | Modulo `crypto` nativo Node.js (nessuna dipendenza esterna) |

### File salvati sul USB

```
chiavetta/
├── vaultkey.vk     ← Database cifrato (AES-256-GCM)
└── vaultkey.salt   ← Salt PBKDF2 (non è segreto, per design)
```

### Garanzie di sicurezza
- ✅ La **master password non viene mai salvata** su disco
- ✅ La **chiave AES non viene mai scritta** in nessun file
- ✅ **IV univoco** ad ogni salvataggio — stesso contenuto, output sempre diverso
- ✅ **Auth Tag GCM** — qualsiasi manomissione del file viene rilevata e rifiutata

Per maggiori dettagli, vedi [SECURITY.md](SECURITY.md).

---

## 📁 Struttura del progetto

```
vaultkey/
├── main.js                  ← Processo principale Electron (crypto, IPC, USB)
├── preload.js               ← Bridge sicuro renderer ↔ main (context isolation)
├── index.html               ← Interfaccia utente (HTML + CSS)
├── renderer.js              ← Logica UI (vanilla JS)
├── package.json             ← Dipendenze e script di build
├── .gitignore
├── LICENSE
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
└── .github/
    ├── workflows/
    │   └── ci.yml           ← CI: audit sicurezza + build check multi-OS
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md
    │   └── feature_request.md
    └── pull_request_template.md
```

---

## 🤝 Contribuire

Le contribuzioni sono benvenute! Leggi [CONTRIBUTING.md](CONTRIBUTING.md) per le linee guida.

**Vulnerabilità di sicurezza?** Non aprire una Issue pubblica — consulta [SECURITY.md](SECURITY.md).

---

## 📄 Licenza

Distribuito sotto licenza **MIT**. Vedi [LICENSE](LICENSE) per i dettagli.

---

## ⚠️ Disclaimer

VaultKey è software open-source fornito "così com'è". Gli autori non sono responsabili per perdita di dati. **Tieni sempre un backup della tua chiavetta USB.**
