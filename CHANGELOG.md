# Changelog

Tutte le modifiche rilevanti a VaultKey sono documentate in questo file.

Il formato segue [Keep a Changelog](https://keepachangelog.com/it/1.0.0/),
e il progetto adotta il [Semantic Versioning](https://semver.org/lang/it/).

---

## [1.0.0] - 2026-02-18

### Aggiunto
- 🔐 Cifratura AES-256-GCM con autenticazione integrata
- 🔑 Derivazione chiave PBKDF2-SHA512 (310.000 iterazioni)
- 💾 Salvataggio vault su chiavetta USB
- 🔍 Rilevamento automatico USB su Windows, macOS e Linux
- ✨ Generatore password crittograficamente sicuro (CSPRNG)
- 📊 Indicatore visivo della forza della password
- 🏷️ Categorie per le voci (Web, App, Banca, Altro)
- 🔍 Ricerca istantanea nel vault
- 📋 Copia password con un clic negli appunti
- 🔒 Blocco vault con pulizia della memoria
- 📁 Selezione manuale della cartella vault (alternativa a USB)
- 🖥️ Interfaccia dark mode con design brutalist

### Sicurezza
- IV casuale da 96-bit generato ad ogni salvataggio
- Auth Tag GCM da 128-bit per protezione da manomissioni
- Salt da 256-bit generato alla creazione del vault
- La master password non viene mai persistita su disco
- Context isolation abilitata nel renderer Electron
