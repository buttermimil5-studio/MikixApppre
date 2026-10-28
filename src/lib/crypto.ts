import crypto from 'crypto';

// AES-256-GCM requires a 32-byte key (256 bits)
const DEFAULT_SECRET = 'miki_super_secure_vault_key_2026_32b'; // 32 chars
const KEY = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_KEY || DEFAULT_SECRET)
  .digest();

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

/**
 * Encrypt a plaintext string using AES-256-GCM
 */
export function encryptCredentials(plainText: string): EncryptedData {
  const iv = crypto.randomBytes(12); // standard 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag,
  };
}

/**
 * Decrypt a ciphertext string using AES-256-GCM
 */
export function decryptCredentials(encryptedHex: string, ivHex: string, tagHex: string): string {
  try {
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[เข้ารหัสไม่ถูกต้อง / ไม่สามารถถอดรหัสได้]';
  }
}

/**
 * Encrypt both email and password with dedicated IVs and Tags
 */
export function encryptStockCredentials(email: string, password: string) {
  const emailEnc = encryptCredentials(email);
  const passEnc = encryptCredentials(password);

  return {
    encryptedEmail: emailEnc.encrypted,
    iv: emailEnc.iv,
    tag: emailEnc.tag,
    encryptedPassword: passEnc.encrypted,
    passwordIv: passEnc.iv,
    passwordTag: passEnc.tag,
  };
}

/**
 * Decrypt both email and password safely
 */
export function decryptStockCredentials(stock: {
  encryptedEmail: string;
  encryptedPassword: string;
  iv: string;
  tag: string;
  passwordIv?: string | null;
  passwordTag?: string | null;
}) {
  const email = decryptCredentials(stock.encryptedEmail, stock.iv, stock.tag);
  
  // Use dedicated password IV & Tag if available, otherwise fallback to email's IV & Tag
  const passIv = stock.passwordIv || stock.iv;
  const passTag = stock.passwordTag || stock.tag;
  const password = decryptCredentials(stock.encryptedPassword, passIv, passTag);

  return { email, password };
}

