/**
 * SRP 客戶端（Secure Remote Password）
 *
 * 正確的 tssrp6a client API：
 *   step1(userId, password) → SRPClientSessionStep1  （有 IH，無 A）
 *   step1.step2(salt, B)    → SRPClientSessionStep2  （有 A, M1）
 *   step2.step3(M2)         → void（驗證伺服器 proof）
 *
 * 登入流程（後端先 commit B，client 再送 A+M1 一起驗證）：
 *   1. POST /srp/challenge { email }          → { sessionId, srpSalt, serverB, ... }
 *   2. step1(email, authKeyHex) → step1
 *   3. step1.step2(srpSalt, serverB)          → { A, M1 }
 *   4. POST /srp/verify { sessionId, A, M1 } → { serverM2, token }
 *   5. step2.step3(serverM2)                  → void
 *
 * 安裝指令：npm install tssrp6a
 */

import {
  SRPClientSession,
  SRPParameters,
  SRPRoutines,
} from 'tssrp6a';
import { getBackendBaseUrl } from '@/lib/httpClient';
import type { BackendUserProfile } from '@/lib/authApi';

const SRP_PARAMS = new SRPParameters();
const SRP_ROUTINES = new SRPRoutines(SRP_PARAMS);

function toEvenLengthHex(value: bigint): string {
  const hex = value.toString(16).toLowerCase();
  return hex.length % 2 === 0 ? hex : `0${hex}`;
}

// ─────────────────────────────────────────
// 型別
// ─────────────────────────────────────────

export interface SRPChallengeResponse {
  sessionId: string;
  srpSalt: string;
  serverB: string;
  kekSalt: string;
  encryptedDataKey: string;
}

// ─────────────────────────────────────────
// API 請求工具
// ─────────────────────────────────────────

async function srpPost<T>(path: string, body: Record<string, string>): Promise<T> {
  const res = await fetch(`${getBackendBaseUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Client-Type': 'web' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data as T;
}

async function srpGet<T>(path: string): Promise<T> {
  const res = await fetch(`${getBackendBaseUrl()}${path}`, {
    headers: { 'X-Client-Type': 'web' },
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data as T;
}

// ─────────────────────────────────────────
// 計算 SRP verifier（設定密碼時使用）
// ─────────────────────────────────────────

export async function computeVerifier(
  email: string,
  authKeyHex: string,
  srpSalt: string,
): Promise<{ srpVerifier: string }> {
  const salt = BigInt(`0x${srpSalt}`);
  const x = await SRP_ROUTINES.computeX(email, salt, authKeyHex);
  const verifier = SRP_ROUTINES.computeVerifier(x);
  // 後端通常要求 SRP verifier 為合法位元組 hex，需補齊奇數長度的前導 0。
  return { srpVerifier: toEvenLengthHex(verifier) };
}

// ─────────────────────────────────────────
// 完整 SRP 登入（一個函式完成）
// ─────────────────────────────────────────

export interface SRPLoginResult {
  serverM2: string;
  token: string;
  user: BackendUserProfile;
  encryptedDataKey: string;
  kekSalt: string;
}

/**
 * 完整 SRP 登入流程（修正版）：
 * 1. /srp/challenge（只傳 email）→ 後端返回 sessionId, srpSalt, serverB
 * 2. step1(email, authKeyHex) + step2(srpSalt, serverB) → 取得 A 和 M1
 * 3. /srp/verify（傳 sessionId, clientA, clientM1）→ 後端驗證 + 返回 M2
 * 4. step2.step3(M2) 驗證後端 proof
 *
 * 關鍵修正：只呼叫一次 step1，用真實 B 直接計算，A 與 M1 來自同一次 step2。
 */
export async function srpFullLogin(
  email: string,
  authKeyHex: string,
): Promise<SRPLoginResult> {
  // 步驟 1：取得後端 challenge（不需先傳 clientA）
  const challenge = await srpPost<SRPChallengeResponse>('/api/auth/srp/challenge', { email });

  // 步驟 2：使用真實 B 一次計算出正確 A 與 M1
  const clientSession = new SRPClientSession(SRP_ROUTINES);
  const step1 = await clientSession.step1(email, authKeyHex);
  const step2 = await step1.step2(
    BigInt(`0x${challenge.srpSalt}`),
    BigInt(`0x${challenge.serverB}`),
  );

  // 步驟 3：同時傳送 clientA 與 M1（後端在此才需要 A）
  const result = await srpPost<{ serverM2: string; token: string; user: BackendUserProfile }>(
    '/api/auth/srp/verify',
    {
      sessionId: challenge.sessionId,
      clientA: step2.A.toString(16),
      clientM1: step2.M1.toString(16),
    },
  );

  // 步驟 4：驗證後端 M2（防止伺服器偽造）
  await step2.step3(BigInt(`0x${result.serverM2}`));

  return {
    ...result,
    encryptedDataKey: challenge.encryptedDataKey,
    kekSalt: challenge.kekSalt,
  };
}

/** 取得 email 對應的 salt（外部使用） */
export async function getSRPSalts(email: string): Promise<{
  srpSalt: string;
  kekSalt: string;
  srpEnabled: boolean;
}> {
  return srpPost('/api/auth/srp/salt', { email });
}

/** 設定 SRP（上傳 verifier + encryptedDataKey） */
export async function setupSRP(payload: {
  srpSalt: string;
  srpVerifier: string;
  encryptedDataKey: string;
  kekSalt: string;
}): Promise<void> {
  await srpPost('/api/auth/srp/setup', payload);
}

/** 取得後端產生的新 Data Key（明文，單次使用） */
export async function generateDataKey(): Promise<{ plainDataKey: string }> {
  return srpPost('/api/auth/srp/generate-data-key', {});
}

/** 取得已登入用戶的 encryptedDataKey */
export async function getEncryptedDataKey(): Promise<{ encryptedDataKey: string; kekSalt: string }> {
  return srpGet('/api/auth/srp/data-key');
}
