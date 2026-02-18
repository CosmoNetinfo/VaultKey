# 🤝 Come contribuire a VaultKey

Grazie per il tuo interesse nel migliorare VaultKey! Ogni contributo è benvenuto.

## 📋 Indice

- [Codice di Condotta](#codice-di-condotta)
- [Come segnalare un bug](#come-segnalare-un-bug)
- [Come proporre una feature](#come-proporre-una-feature)
- [Come contribuire con codice](#come-contribuire-con-codice)
- [Standard di sviluppo](#standard-di-sviluppo)
- [Segnalazione vulnerabilità di sicurezza](#segnalazione-vulnerabilità-di-sicurezza)

---

## Codice di Condotta

Questo progetto adotta un codice di condotta basato sul rispetto reciproco. Si prega di essere rispettosi e costruttivi in ogni interazione.

---

## Come segnalare un bug

1. Verifica che il bug non sia già stato segnalato nelle [Issues](../../issues)
2. Apri una nuova Issue usando il template **Bug Report**
3. Includi:
   - Sistema operativo e versione
   - Versione di Node.js (`node --version`)
   - Passi per riprodurre il bug
   - Comportamento atteso vs. comportamento effettivo
   - Screenshot se disponibili

---

## Come proporre una feature

1. Apri una Issue usando il template **Feature Request**
2. Descrivi chiaramente il problema che vuoi risolvere
3. Proponi una soluzione o lascia aperta la discussione
4. Attendi feedback prima di iniziare a sviluppare

---

## Come contribuire con codice

### Setup locale

```bash
# Fork del repo su GitHub, poi:
git clone https://github.com/TUO_USERNAME/vaultkey.git
cd vaultkey
npm install
npm start
```

### Workflow

```bash
# Crea un branch descrittivo
git checkout -b feat/nome-feature
# oppure
git checkout -b fix/descrizione-bug

# Sviluppa e committa con messaggi chiari
git commit -m "feat: aggiungi esportazione in CSV cifrato"
git commit -m "fix: correggi rilevamento USB su Linux Mint"

# Pusha e apri una Pull Request
git push origin feat/nome-feature
```

### Convenzioni per i commit (Conventional Commits)

| Prefisso | Uso |
|----------|-----|
| `feat:` | Nuova funzionalità |
| `fix:` | Correzione di un bug |
| `docs:` | Solo documentazione |
| `style:` | Formattazione, nessuna modifica logica |
| `refactor:` | Refactoring senza nuove feature né fix |
| `security:` | Miglioramenti alla sicurezza |
| `chore:` | Aggiornamento dipendenze, build, ecc. |

---

## Standard di sviluppo

### Sicurezza (priorità assoluta)
- Non introdurre dipendenze esterne per la crittografia — usa solo il modulo `crypto` nativo di Node.js
- Non salvare mai la master password o la chiave derivata su disco
- Qualsiasi modifica al sistema di cifratura deve essere discussa in una Issue prima

### Codice
- Commenta le sezioni non ovvie, specialmente quelle crittografiche
- Mantieni la separazione tra `main.js` (processo principale / Node.js) e `renderer.js` (UI)
- Usa `contextIsolation: true` e non abilitare mai `nodeIntegration` nel renderer

### Compatibilità
- Testa su almeno **due** dei tre sistemi operativi supportati (Windows, macOS, Linux)
- Il rilevamento USB deve funzionare su tutti e tre i sistemi

---

## Segnalazione vulnerabilità di sicurezza

⚠️ **Non aprire una Issue pubblica per vulnerabilità di sicurezza.**

Invia una email privata o usa le [GitHub Security Advisories](../../security/advisories/new) descrivendo:
- La vulnerabilità e il suo impatto potenziale
- Passi per riprodurla
- Eventuale proposta di fix

Risponderemo entro 48 ore. Grazie per aiutarci a mantenere VaultKey sicuro.
