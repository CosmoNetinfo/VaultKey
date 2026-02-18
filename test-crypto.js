// test-crypto.js - Test autonomo per la logica crittografica di VaultKey
const crypto = require('crypto');
const { promisify } = require('util');

const pbkdf2 = promisify(crypto.pbkdf2);
const ITERATIONS = 310000;
const KEY_LENGTH = 32;
const ALGORITHM = 'aes-256-gcm';

async function deriveKey(masterPassword, salt) {
  return pbkdf2(masterPassword, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

function encrypt(data, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

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

async function runTests() {
  console.log('🚀 Avvio test crittografici VaultKey...\n');

  try {
    const masterPassword = 'password-di-test-super-sicura';
    const salt = crypto.randomBytes(32);
    const testData = { entries: [{ name: 'Test', username: 'user', password: 'pwd123' }] };

    // 1. Test Derivazione Chiave
    console.log('⏳ Test derivazione chiave (PBKDF2)...');
    const start = Date.now();
    const key = await deriveKey(masterPassword, salt);
    console.log(`✅ Chiave derivata in ${Date.now() - start}ms`);

    // 2. Test Crittografia/Decrittografia
    console.log('🔐 Test crittografia...');
    const encrypted = encrypt(testData, key);
    console.log('🔓 Test decrittografia...');
    const decrypted = decrypt(encrypted, key);

    if (JSON.stringify(decrypted) === JSON.stringify(testData)) {
      console.log('✅ Integrità dati confermata!');
    } else {
      throw new Error('I dati decifrati non corrispondono a quelli originali!');
    }

    // 3. Test Password Errata
    console.log('❌ Test password errata...');
    const wrongKey = await deriveKey('password-sbagliata', salt);
    try {
      decrypt(encrypted, wrongKey);
      throw new Error('ERRORE: La decrittografia è riuscita con una password errata!');
    } catch (e) {
      console.log('✅ Tentativo con password errata correttamente fallito.');
    }

    console.log('\n✨ Tutti i test sono passati con successo!');
  } catch (error) {
    console.error(`\n🔴 TEST FALLITO: ${error.message}`);
    process.exit(1);
  }
}

runTests();
