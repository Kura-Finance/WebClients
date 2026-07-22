import { x25519 } from '@noble/curves/ed25519';

/**
 * 前端金鑰推導（Passkey-DEK + Wrapped X25519 Keypair 版）
 *
 * 新架構（對齊 backendserver / react-native）：
 *   - 登入改由 Privy 驅動（見 PrivyProvider / authApi.loginWithPrivy）。
 *   - E2EE 資料層由 Passkey（WebAuthn PRF）解鎖：passkey 推導出 32-byte DEK，
 *     DEK 再派生出 wrap / cache 金鑰（見下方金鑰層次）。
 *   - X25519 keypair 仍為 wrapped 模式：privateKey 用 dekWrapKey 包成 encryptedPrivateKey
 *     後上傳 /api/auth/keys/{setup,rotate}；後端只看得到 publicKey，永遠無法解開業務資料。
 *
 * 金鑰層次：
 *   Passkey PRF + encryptedDek(XOR) → DEK            (32 bytes，見 passkey.ts)
 *   DEK + kekSalt (info=wrap)        → dekWrapKey     (AES-GCM CryptoKey，用來包/解 privateKey)
 *   DEK + kekSalt (info=cache)       → localCacheKey  (AES-GCM CryptoKey，給 financeVault)
 *
 *   X25519 keypair                   → 首次 setup 時 crypto.getRandomValues 隨機生
 *   privateKey 上傳前用 dekWrapKey AES-GCM 包成 encryptedPrivateKey (base64)
 *
 * HKDF info 字串、envelope 欄位名稱純前端 convention，後端不介入；
 * publicKey / encryptedPrivateKey 序列化是 base64（後端 zod 強制 length=44 / ≥16）。
 */

const HKDF_HASH = 'SHA-256';

const HKDF_INFO_WRAP = 'kura-finance-wrap-v1';
const HKDF_INFO_LOCAL_CACHE = 'kura-finance-local-cache-v1';
const HKDF_INFO_SESSION = 'kura-finance-session-v1';

const X25519_KEY_BYTES = 32;
const AES_GCM_IV_BYTES = 12;
const AES_GCM_TAG_BYTES = 16;
const WRAPPED_PRIVATE_KEY_BYTES = AES_GCM_IV_BYTES + X25519_KEY_BYTES + AES_GCM_TAG_BYTES; // 60
const SESSION_KEY_BYTES = 32;

// ─────────────────────────────────────────
// hex / base64 / bytes 工具
// ─────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const buffer = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function isHexString(value: string): boolean {
  return /^[a-fA-F0-9]+$/.test(value) && value.length % 2 === 0;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function assertHexLength(value: string, expectedBytes: number, fieldName: string): Uint8Array<ArrayBuffer> {
  const normalized = value.trim().toLowerCase();
  if (!isHexString(normalized) || normalized.length !== expectedBytes * 2) {
    throw new Error(`${fieldName} must be a ${expectedBytes}-byte hex string.`);
  }
  return hexToBytes(normalized);
}

function toArrayBufferBacked(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(new ArrayBuffer(bytes.length));
  copy.set(bytes);
  return copy;
}

// ─────────────────────────────────────────
// DEK / 子金鑰
// ─────────────────────────────────────────

/** 把 32-byte DEK 匯入成 HKDF master key（不可匯出）。 */
async function importDekAsHkdf(dek: Uint8Array): Promise<CryptoKey> {
  if (dek.length !== 32) {
    throw new Error(`DEK must be 32 bytes (got ${dek.length}).`);
  }
  return crypto.subtle.importKey(
    'raw',
    toArrayBufferBacked(dek),
    { name: 'HKDF' },
    false,
    ['deriveKey', 'deriveBits'],
  );
}

/** HKDF(master) → AES-GCM CryptoKey（不可匯出） */
async function hkdfAesKey(master: CryptoKey, kekSaltHex: string, info: string): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: HKDF_HASH,
      salt: hexToBytes(kekSaltHex),
      info: new TextEncoder().encode(info),
    },
    master,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

// ─────────────────────────────────────────
// 公開：Passkey DEK → 子金鑰
// ─────────────────────────────────────────

export interface DerivedKeys {
  /** AES-GCM CryptoKey，用來加/解 X25519 privateKey。 */
  dekWrapKey: CryptoKey;
  /** AES-GCM CryptoKey，給 financeVault 加密 localStorage 快取。 */
  localCacheKey: CryptoKey;
}

/**
 * 由 Passkey 解鎖出的 32-byte DEK + 帳號的 kekSalt，派生出 wrap / cache 金鑰。
 * kekSalt 在首次 setup 時隨機生成並隨 keypair 上傳，之後從 /api/auth/keys/me 取回。
 */
export async function deriveKeysFromDek(dek: Uint8Array, kekSalt: string): Promise<DerivedKeys> {
  const master = await importDekAsHkdf(dek);

  const [dekWrapKey, localCacheKey] = await Promise.all([
    hkdfAesKey(master, kekSalt, HKDF_INFO_WRAP),
    hkdfAesKey(master, kekSalt, HKDF_INFO_LOCAL_CACHE),
  ]);

  return { dekWrapKey, localCacheKey };
}

/** 產生新的隨機 salt（hex，64 chars = 32 bytes） */
export function generateSalt(): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
}

// ─────────────────────────────────────────
// X25519 keypair 產生 / wrap / unwrap
// ─────────────────────────────────────────

export interface X25519KeyPair {
  /** raw 32 bytes，僅存記憶體；包好後不要留複本。 */
  privateKey: Uint8Array<ArrayBuffer>;
  /** raw 32 bytes 公鑰。 */
  publicKey: Uint8Array<ArrayBuffer>;
  /** base64(32 bytes) 公鑰，給後端 schema 用。 */
  publicKeyBase64: string;
}

/**
 * 隨機產生一組 X25519 keypair。
 * 私鑰用 Web Crypto 的 CSPRNG (crypto.getRandomValues)，noble 內部會做 RFC 7748 clamping。
 */
export function generateX25519KeyPair(): X25519KeyPair {
  const privateKey = toArrayBufferBacked(crypto.getRandomValues(new Uint8Array(X25519_KEY_BYTES)));
  const publicKey = toArrayBufferBacked(x25519.getPublicKey(privateKey));
  return {
    privateKey,
    publicKey,
    publicKeyBase64: bytesToBase64(publicKey),
  };
}

/**
 * AES-GCM 加密 X25519 privateKey，輸出 base64(iv || ciphertext || tag)
 * 輸出長度固定 60 bytes → 80 base64 chars（落在後端 zod 的 16–2048 區間）。
 */
export async function wrapPrivateKey(
  privateKey: Uint8Array,
  dekWrapKey: CryptoKey,
): Promise<string> {
  if (privateKey.length !== X25519_KEY_BYTES) {
    throw new Error(`privateKey must be ${X25519_KEY_BYTES} bytes (got ${privateKey.length}).`);
  }
  const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_BYTES));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    dekWrapKey,
    toArrayBufferBacked(privateKey),
  );

  const combined = new Uint8Array(iv.length + ct.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ct), iv.length);
  return bytesToBase64(combined);
}

/**
 * 解開後端送來的 encryptedPrivateKey；任何錯誤都會 throw（呼叫端可用來偵測「換過密碼導致舊 wrap 失效」）。
 */
export async function unwrapPrivateKey(
  encryptedPrivateKeyBase64: string,
  dekWrapKey: CryptoKey,
): Promise<Uint8Array<ArrayBuffer>> {
  const combined = base64ToBytes(encryptedPrivateKeyBase64);
  if (combined.length !== WRAPPED_PRIVATE_KEY_BYTES) {
    throw new Error(
      `encryptedPrivateKey must decode to ${WRAPPED_PRIVATE_KEY_BYTES} bytes (got ${combined.length}).`,
    );
  }
  const iv = combined.slice(0, AES_GCM_IV_BYTES);
  const ciphertext = combined.slice(AES_GCM_IV_BYTES);

  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    dekWrapKey,
    toArrayBufferBacked(ciphertext),
  );
  const bytes = new Uint8Array(plain);
  if (bytes.length !== X25519_KEY_BYTES) {
    throw new Error(`Unwrapped privateKey must be ${X25519_KEY_BYTES} bytes (got ${bytes.length}).`);
  }
  return toArrayBufferBacked(bytes);
}

// ─────────────────────────────────────────
// 後端 → 前端 加密封包（ECIES / hybrid encryption）
// ─────────────────────────────────────────

/**
 * 由後端送來的 hybrid encryption envelope。
 *
 * 後端產生流程（必須對齊）：
 *   1. 隨機生 ephemeral X25519 keypair (eph_priv, eph_pub)
 *   2. sharedSecret = X25519(eph_priv, user_pub)
 *   3. sessionKey = HKDF-SHA256(
 *        ikm  = sharedSecret,
 *        salt = eph_pub,                      // 32 bytes，把 sessionKey 綁到此 envelope
 *        info = "kura-finance-session-v1",
 *        length = 32,
 *      )
 *   4. ciphertext = AES-256-GCM(sessionKey, iv, plaintext)   // ct 已包含 16-byte auth tag
 *   5. 回傳 { ephemeralPublicKey, iv, ciphertext }（皆為 hex）
 */
export interface EncryptedEnvelope {
  ephemeralPublicKey: string; // hex, 32 bytes
  iv: string;                 // hex, 12 bytes
  ciphertext: string;         // hex, AES-GCM 輸出（ct + 16-byte tag）
}

async function deriveSessionKey(
  sharedSecret: Uint8Array,
  ephemeralPublicKey: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
  const ikm = await crypto.subtle.importKey(
    'raw',
    toArrayBufferBacked(sharedSecret),
    { name: 'HKDF' },
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: HKDF_HASH,
      salt: ephemeralPublicKey,
      info: new TextEncoder().encode(HKDF_INFO_SESSION),
    },
    ikm,
    { name: 'AES-GCM', length: SESSION_KEY_BYTES * 8 },
    false,
    ['decrypt'],
  );
}

/**
 * 解開後端送來的 envelope，回傳明文 bytes。
 * 若上層需要文字，呼叫端再用 TextDecoder 轉碼。
 */
export async function decryptServerEnvelope(
  envelope: EncryptedEnvelope,
  recipientPrivateKey: Uint8Array,
): Promise<Uint8Array> {
  const ephPub = assertHexLength(envelope.ephemeralPublicKey, X25519_KEY_BYTES, 'ephemeralPublicKey');
  const iv = assertHexLength(envelope.iv, AES_GCM_IV_BYTES, 'iv');
  const ctNormalized = envelope.ciphertext.trim().toLowerCase();
  if (!isHexString(ctNormalized) || ctNormalized.length === 0) {
    throw new Error('ciphertext must be a non-empty hex string.');
  }
  const ciphertext = hexToBytes(ctNormalized);

  const sharedSecret = x25519.getSharedSecret(recipientPrivateKey, ephPub);
  const sessionKey = await deriveSessionKey(sharedSecret, ephPub);

  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    sessionKey,
    ciphertext,
  );
  return new Uint8Array(plain);
}
