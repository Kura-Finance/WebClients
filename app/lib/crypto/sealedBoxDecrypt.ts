/**
 * 瀏覽器端 X25519 Sealed Box 解密。
 *
 * 對應後端 sealedBox.ts（`sealForPublicKey` / `crypto_box_seal`）。
 *
 * 演算法：libsodium crypto_box_seal_open
 *   ciphertext = ephPk(32) || MAC(16) || encrypted(plaintext)
 *   nonce      = blake2b(ephPk || recipientPk)[0:24]
 *   key        = X25519-DH(recipientSk, ephPk) → HSalsa20 → 32 bytes
 *   decrypt    = XSalsa20-Poly1305(key, nonce[16:24], ciphertext)
 *
 * 注意：此模組僅在 client-side 執行（uses libsodium-wrappers WASM）。
 */

import sodium from 'libsodium-wrappers';

let initPromise: Promise<void> | null = null;

async function ensureReady(): Promise<void> {
  if (!initPromise) {
    initPromise = sodium.ready;
  }
  return initPromise;
}

/**
 * 解開後端用 `sealForPublicKey(sek, userPublicKey)` 包裝的 SEK。
 *
 * @param wrappedSekB64       base64(crypto_box_seal output)
 * @param recipientPublicKey  X25519 公鑰（32 bytes）
 * @param recipientPrivateKey X25519 私鑰（32 bytes）
 * @returns 32-byte SEK（呼叫端用完後需要 zeroize）
 */
export async function unsealSEK(
  wrappedSekB64: string,
  recipientPublicKey: Uint8Array,
  recipientPrivateKey: Uint8Array,
): Promise<Uint8Array> {
  await ensureReady();

  // Minimum sealed-box size: 32 (ephPk) + 16 (MAC) = 48 bytes overhead + plaintext
  const sealed = Uint8Array.from(atob(wrappedSekB64), (c) => c.charCodeAt(0));
  console.debug('[SealedBox] unsealSEK', {
    sealedBytes: sealed.length,          // expected: 48 + sekSize (80 for 32-byte SEK)
    pubKeyBytes: recipientPublicKey.length,  // expected: 32
    privKeyBytes: recipientPrivateKey.length, // expected: 32
  });

  if (recipientPublicKey.length !== 32 || recipientPrivateKey.length !== 32) {
    throw new Error(
      `unsealSEK: invalid key length (pub=${recipientPublicKey.length}, priv=${recipientPrivateKey.length}), expected 32 bytes each`,
    );
  }

  const sek = sodium.crypto_box_seal_open(sealed, recipientPublicKey, recipientPrivateKey);

  if (!sek) {
    console.warn('[SealedBox] crypto_box_seal_open returned null — wrong key pair or corrupted sealed box', {
      sealedBytes: sealed.length,
      pubKeyPrefix: Array.from(recipientPublicKey.slice(0, 4)).map((b) => b.toString(16).padStart(2, '0')).join(''),
    });
    throw new Error('Failed to unseal SEK: authentication failed or wrong key');
  }

  console.debug('[SealedBox] unsealSEK success', { sekBytes: sek.length });
  return sek;
}

/**
 * 用 SEK 解密後端的 payloadCiphertext。
 *
 * 格式（後端 sessionKey.ts encryptWithSEK）：
 *   base64( iv[12] | authTag[16] | ciphertext[?] )
 *
 * @returns 解密後的 JSON 字串
 */
export async function decryptPayloadCiphertext(
  sek: Uint8Array,
  ciphertextB64: string,
): Promise<string> {
  const raw = Uint8Array.from(atob(ciphertextB64), (c) => c.charCodeAt(0));

  const IV_BYTES = 12;
  const TAG_BYTES = 16;

  console.debug('[SealedBox] decryptPayloadCiphertext', {
    rawBytes: raw.length,
    sekBytes: sek.length,
    expectedMinBytes: IV_BYTES + TAG_BYTES,
  });

  if (raw.length < IV_BYTES + TAG_BYTES) {
    throw new Error(`payloadCiphertext too short: ${raw.length} bytes (min ${IV_BYTES + TAG_BYTES})`);
  }

  // Copy into a plain ArrayBuffer so WebCrypto is satisfied (no SharedArrayBuffer ambiguity)
  const buf = new ArrayBuffer(raw.length);
  new Uint8Array(buf).set(raw);
  const packed = new Uint8Array(buf);

  const iv = packed.subarray(0, IV_BYTES);
  const tag = packed.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = packed.subarray(IV_BYTES + TAG_BYTES);

  // WebCrypto AES-GCM expects ciphertext to be (encrypted bytes || auth tag)
  const ctWithTag = new Uint8Array(ciphertext.length + TAG_BYTES);
  ctWithTag.set(ciphertext);
  ctWithTag.set(tag, ciphertext.length);

  const sekBuf = new ArrayBuffer(sek.length);
  new Uint8Array(sekBuf).set(sek);

  const key = await crypto.subtle.importKey(
    'raw',
    sekBuf,
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  );

  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ctWithTag,
  );

  return new TextDecoder().decode(plain);
}
