# 🔒 Security Policy

## Versioni supportate

| Versione | Supportata |
|----------|------------|
| 1.x.x    | ✅ Sì      |

---

## Modello di sicurezza

VaultKey è progettato attorno a questi principi:

### Cifratura
- **Algoritmo**: AES-256-GCM (authenticated encryption)
- **Derivazione chiave**: PBKDF2-SHA512 con 310.000 iterazioni e salt casuale da 256-bit
- **IV**: 96-bit casuale, generato ex-novo ad ogni salvataggio
- **Autenticazione**: GCM Auth Tag da 128-bit — qualsiasi manomissione del file viene rilevata
- **Libreria**: modulo `crypto` nativo di Node.js (no dipendenze di terze parti per la cripto)

### Cosa viene salvato sul USB
| File | Contenuto | Segreto? |
|------|-----------|----------|
| `vaultkey.vk` | Vault cifrato AES-256-GCM | Sì (ma illeggibile senza la master password) |
| `vaultkey.salt` | Salt PBKDF2 | No (il salt è pubblico per design) |

### Cosa NON viene mai salvato
- La master password (in chiaro o cifrata)
- La chiave AES derivata
- Qualsiasi dato in chiaro del vault su disco

### Modello di minaccia
VaultKey protegge da:
- ✅ Furto fisico della chiavetta USB senza conoscere la master password
- ✅ Accesso non autorizzato al file del vault
- ✅ Manomissione dei dati nel vault (rilevata dal GCM auth tag)

VaultKey **non** protegge da:
- ❌ Keylogger attivi sul sistema operativo (possono catturare la master password)
- ❌ Accesso fisico al computer mentre il vault è aperto (dati in memoria)
- ❌ Master password debole o condivisa con altri
- ❌ Backup non cifrati del vault

---

## Segnalazione di vulnerabilità

⚠️ **Non aprire una Issue pubblica per vulnerabilità di sicurezza.**

Per segnalare una vulnerabilità:

1. Usa le **[GitHub Security Advisories](../../security/advisories/new)** (raccomandato)
2. Oppure apri una **Issue privata** se le Advisories non sono disponibili

Includi nella segnalazione:
- Descrizione della vulnerabilità
- Impatto potenziale
- Passi per riprodurla
- Eventuale proposta di fix o patch

### Tempi di risposta
| Fase | Tempo target |
|------|-------------|
| Conferma ricezione | 48 ore |
| Valutazione impatto | 7 giorni |
| Rilascio fix (se critica) | 14 giorni |

Grazie per contribuire alla sicurezza di VaultKey. 🙏
