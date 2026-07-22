/**
 * Passkey / WebAuthn（瀏覽器端）
 *
 * 對齊 backendserver/src/domains/auth（passkeyController/passkeyService）與
 * react-native/src/lib/auth/passkeyService.ts。
 *
 * 用途：使用者透過 Privy 登入後，用 Passkey（WebAuthn PRF extension）解鎖 E2EE 資料層。
 *   - 註冊：標準 WebAuthn registration，前端隨機生 DEK，
 *     encryptedDek = DEK XOR PRF_output，連同 credential 上傳後端。
 *   - 驗證：標準 WebAuthn assertion，後端回傳該裝置的 encryptedDek，
 *     dek = encryptedDek XOR PRF_output（後端永遠看不到明文 DEK）。
 *
 * PRF salt 必須與 react-native 端一致（'kura-dek-v1'），讓同一把 passkey
 * 在 web / mobile 解出相同的 DEK，達到跨裝置一致。
 */

import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/browser';
import {
  getPasskeyRegisterChallenge,
  postPasskeyRegister,
  getPasskeyAuthenticateChallenge,
  postPasskeyAuthenticate,
  getPasskeyStatus as apiGetPasskeyStatus,
} from '@/lib/authApi';

// ─────────────────────────────────────────
// 編碼工具
// ─────────────────────────────────────────

function utf8ToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function xorBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  if (a.length !== b.length) {
    throw new Error(`XOR length mismatch: ${a.length} vs ${b.length}`);
  }
  const out = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i] ^ b[i];
  }
  return out;
}

// ─────────────────────────────────────────
// 常數
// ─────────────────────────────────────────

/** Fixed PRF salt bytes — must match mobile (`kura-dek-v1`). */
const PRF_SALT_BYTES = utf8ToBytes('kura-dek-v1');

/**
 * WebAuthn Level 3 PRF `eval.first` must be a BufferSource when passed to
 * `navigator.credentials.create/get`. Passing a base64url string throws a
 * browser TypeError whose message is often just "Type error".
 */
function prfEvalExtension(): { prf: { eval: { first: Uint8Array } } } {
  return { prf: { eval: { first: PRF_SALT_BYTES } } };
}

const DEK_BYTES = 32;

function mapWebAuthnError(error: unknown, action: 'register' | 'authenticate'): Error {
  if (!(error instanceof Error)) {
    return new Error(`Passkey ${action} failed. Please try again.`);
  }

  const name = error.name;
  const message = error.message || '';

  if (name === 'NotAllowedError') {
    return new Error('Passkey was cancelled or timed out. Please try again.');
  }
  if (name === 'InvalidStateError') {
    return new Error(
      'This passkey is already registered on this device. Try Unlock again, or reset E2EE from Security if you changed devices.',
    );
  }
  if (name === 'SecurityError' || /RP ID|invalid for this domain/i.test(message)) {
    return new Error(
      `Passkey domain mismatch (${typeof window !== 'undefined' ? window.location.hostname : 'unknown'}). ` +
        'Web shares RP ID api.kura-finance.com with the app — confirm /.well-known/webauthn lists this site, or try Chrome/Edge.',
    );
  }
  if (name === 'TypeError' || /^Type error$/i.test(message)) {
    return new Error(
      'Passkey request was rejected by the browser (invalid options). Please update Chrome/Safari/Edge and retry.',
    );
  }
  if (/User ID was not between/i.test(message)) {
    return new Error(message);
  }

  return error;
}

// ─────────────────────────────────────────
// 內部：從 WebAuthn 回應取出 PRF 輸出
// ─────────────────────────────────────────

interface PrfExtensionResults {
  prf?: { results?: { first?: unknown } };
}

function extractPrfOutput(clientExtensionResults: unknown): Uint8Array {
  const first = (clientExtensionResults as PrfExtensionResults | undefined)?.prf?.results?.first;
  if (!first) {
    throw new Error(
      'This browser/authenticator does not support the Passkey PRF extension. ' +
        'Use a recent Chrome/Safari/Edge and a platform passkey to enable encrypted data.',
    );
  }
  if (typeof first === 'string') {
    return base64UrlToBytes(first);
  }
  if (first instanceof ArrayBuffer) {
    return new Uint8Array(first);
  }
  if (ArrayBuffer.isView(first)) {
    return new Uint8Array(first.buffer, first.byteOffset, first.byteLength);
  }
  throw new Error('Unexpected PRF result type from authenticator.');
}

// ─────────────────────────────────────────
// 公開 API
// ─────────────────────────────────────────

export function passkeyIsSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.credentials
  );
}

export async function getPasskeyStatus(): Promise<{ registered: boolean }> {
  return apiGetPasskeyStatus();
}

/**
 * 註冊一把新的 Passkey 並回傳該裝置綁定的 32-byte DEK。
 * 後端只會存到 encryptedDek（= DEK XOR PRF），永遠看不到明文 DEK。
 */
export async function registerPasskeyAndGetDek(): Promise<Uint8Array> {
  if (!passkeyIsSupported()) {
    throw new Error('Passkeys are not supported in this browser.');
  }

  const options = (await getPasskeyRegisterChallenge()) as PublicKeyCredentialCreationOptionsJSON;
  const optionsWithPrf: PublicKeyCredentialCreationOptionsJSON = {
    ...options,
    extensions: {
      ...(options.extensions ?? {}),
      ...prfEvalExtension(),
    } as PublicKeyCredentialCreationOptionsJSON['extensions'],
  };

  let credential: Awaited<ReturnType<typeof startRegistration>>;
  try {
    credential = await startRegistration({ optionsJSON: optionsWithPrf });
  } catch (error) {
    throw mapWebAuthnError(error, 'register');
  }
  const prfOutput = extractPrfOutput(credential.clientExtensionResults);

  const dek = crypto.getRandomValues(new Uint8Array(DEK_BYTES));
  const encryptedDek = bytesToHex(xorBytes(dek, prfOutput));

  await postPasskeyRegister({ response: credential, encryptedDek });
  return dek;
}

/**
 * 用已註冊的 Passkey 解鎖並還原 32-byte DEK。
 */
export async function authenticatePasskeyForDek(): Promise<Uint8Array> {
  if (!passkeyIsSupported()) {
    throw new Error('Passkeys are not supported in this browser.');
  }

  const options = (await getPasskeyAuthenticateChallenge()) as PublicKeyCredentialRequestOptionsJSON;
  const optionsWithPrf: PublicKeyCredentialRequestOptionsJSON = {
    ...options,
    extensions: {
      ...(options.extensions ?? {}),
      ...prfEvalExtension(),
    } as PublicKeyCredentialRequestOptionsJSON['extensions'],
  };

  let assertion: Awaited<ReturnType<typeof startAuthentication>>;
  try {
    assertion = await startAuthentication({ optionsJSON: optionsWithPrf });
  } catch (error) {
    throw mapWebAuthnError(error, 'authenticate');
  }
  const prfOutput = extractPrfOutput(assertion.clientExtensionResults);

  const { encryptedDek } = await postPasskeyAuthenticate({ response: assertion });
  const encryptedDekBytes = hexToBytes(encryptedDek);
  if (encryptedDekBytes.length !== DEK_BYTES) {
    throw new Error(`Unexpected encryptedDek length: ${encryptedDekBytes.length} (expected ${DEK_BYTES}).`);
  }

  return xorBytes(encryptedDekBytes, prfOutput);
}
