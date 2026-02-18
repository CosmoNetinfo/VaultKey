# 📖 Guida all'uso di VaultKey

Benvenuto in **VaultKey**, il tuo password manager personale e sicuro progettato per vivere sulla tua chiavetta USB. Questa guida ti accompagnerà nei primi passi per mettere in sicurezza i tuoi dati.

---

## 🚀 Primi Passi

### 1. Installazione

1.  **Scarica l'App**: Vai alla sezione [Releases](https://github.com/CosmoNetinfo/VaultKey/releases) del progetto su GitHub.
2.  **Scarica l'Installer**: Scarica il file più recente, solitamente denominato `VaultKey Setup 1.0.0.exe`.
3.  **Avvia l'Installazione**: Doppio clic sul file scaricato per avviare l'installer.
4.  **Completamento**: Una volta terminata la procedura, troverai l'icona "scudo" di VaultKey sul tuo Desktop o nel menu Start di Windows.

### 2. Preparazione USB
Inserisci una chiavetta USB nel computer. VaultKey è progettato per salvare i tuoi dati crittografati direttamente sull'unità rimovibile, così potrai portarli sempre con te.

---

## 🔐 Configurazione Iniziale

### Creazione del tuo primo Vault
Se è la prima volta che usi la chiavetta con VaultKey:
1. Avvia l'applicazione.
2. Nella schermata di blocco, seleziona la tua **chiavetta USB** dalla lista (se non appare, clicca su 🔄 Aggiorna).
3. Scegli una **Master Password** forte (minimo 8 caratteri).
    - *⚠️ Attenzione: Se dimentichi questa password, i tuoi dati saranno irrecuperabili. Non viene salvata da nessuna parte.*
4. Clicca su **✨ Crea Nuovo Vault**.

---

## 📂 Uso Quotidiano

### Importare Password da Google Chrome
Se hai le tue password salvate in Chrome, puoi importarle facilmente:
1. In Google Chrome: Gestione Password → Impostazioni → **Esporta password...**
2. Salva il file `.csv` sul tuo computer.
3. In **VaultKey**: Apri il tuo vault.
4. Clicca sul pulsante **📥 Importa** in basso a sinistra.
5. Seleziona il file CSV appena salvato.
6. VaultKey analizzerà il file e aggiungerà le password mancanti al tuo vault.

> [!TIP]
> VaultKey rileva automaticamente i duplicati (stesso sito e stesso nome utente) e li salta per evitare caos nel tuo database.

### Gestire le Password
- **Aggiunta**: Clicca su **+ Nuova** in basso a sinistra o nel centro della schermata per aggiungere una nuova credenziale.
- **Ricerca**: Usa la barra di ricerca in alto a sinistra per trovare istantaneamente un sito o un utente.
- **Copia**: Nella vista dettaglio, clicca sull'icona della cartella 📋 accanto alla password per copiarla negli appunti.
- **Generatore**: Clicca sull'icona del fulmine ⚡ per generare una password sicura in modo casuale.

### Bloccare il Vault
Quando hai finito, clicca su **🔒 Blocca** in basso a sinistra per chiudere il vault e pulire la memoria del computer.

---

## 🛡️ Consigli per la Sicurezza

1. **Master Password**: Usa una frase complessa che ricordi facilmente ma difficile da indovinare (es: *IlMioGattoBeveCaffèInCucina!*).
2. **Backup**: Anche se i dati sono sulla USB, è buona norma avere una copia della chiavetta in un luogo sicuro. Basta copiare i file `vaultkey.vk` e `vaultkey.salt` su un'altra unità.
3. **Esci sempre**: Ricordati di bloccare il vault prima di estrarre la chiavetta USB.

---

## 🛠️ Risoluzione Problemi

- **USB non rilevata**: Assicurati che la chiavetta sia montata correttamente dal sistema operativo. Prova a cliccare su 🔄 Aggiorna nella schermata di blocco.
- **Errore password**: VaultKey usa crittografia militare (AES-256-GCM). Anche una singola lettera sbagliata impedirà la decrittazione del file.
