const SECRET_SALT = 'Trio3D-ML-Secret-Vault-2026';

/**
 * Encripta una cadena (como client_secret) antes de almacenarla en la base de datos
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return '';
  try {
    let result = '';
    for (let i = 0; i < plainText.length; i++) {
      const charCode = plainText.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length);
      result += String.fromCharCode(charCode);
    }
    return 'ENC:' + btoa(result);
  } catch (e) {
    console.error('Error encrypting secret:', e);
    return plainText;
  }
}

/**
 * Desencripta una cadena obtenida de la base de datos
 */
export function decryptSecret(encryptedText: string): string {
  if (!encryptedText) return '';
  if (!encryptedText.startsWith('ENC:')) return encryptedText;
  try {
    const raw = atob(encryptedText.substring(4));
    let result = '';
    for (let i = 0; i < raw.length; i++) {
      const charCode = raw.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (e) {
    console.error('Error decrypting secret:', e);
    return encryptedText;
  }
}
