import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits

// Derive a fixed 32-byte key from the secret using SHA-256
const getKey = () => {
  const secret = process.env.MESSAGE_ENCRYPTION_KEY;
  if (!secret) throw new Error('MESSAGE_ENCRYPTION_KEY is not set in .env');
  return crypto.createHash('sha256').update(secret).digest(); // 32 bytes
};

/**
 * Encrypt a plain text string.
 * Returns: "iv:encryptedHex"
 */
export const encrypt = (plainText) => {
  if (!plainText) return plainText;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

/**
 * Decrypt an encrypted string produced by encrypt().
 * Returns the original plain text.
 */
export const decrypt = (encryptedText) => {
  if (!encryptedText) return encryptedText;
  // If it doesn't look encrypted (no colon separator), return as-is (legacy messages)
  if (!encryptedText.includes(':')) return encryptedText;
  try {
    const key = getKey();
    const [ivHex, encryptedHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    // If decryption fails (e.g. legacy plain text), return as-is
    return encryptedText;
  }
};
