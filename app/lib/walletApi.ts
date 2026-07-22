/**
 * Wallet API — /api/wallet
 *
 *   GET  /api/wallet        → { walletAddress, scaAddress }
 *   PUT  /api/wallet/sca    → { scaAddress }
 *   PUT  /api/wallet/eoa    → { walletAddress }
 */

import { ApiError } from "./errorHandler";
import { requestJson } from "./httpClient";

const apiName = "WalletApi";

export interface WalletRecord {
  /** Privy embedded EOA address */
  walletAddress: string | null;
  /** Smart Wallet (ERC-4337 Safe SCA) address on Base */
  scaAddress: string | null;
}

export async function fetchWalletRecord(): Promise<WalletRecord> {
  try {
    return await requestJson<WalletRecord>("/api/wallet", { method: "GET" }, apiName);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { walletAddress: null, scaAddress: null };
    }
    return { walletAddress: null, scaAddress: null };
  }
}

export async function saveScaAddress(scaAddress: string): Promise<void> {
  await requestJson<WalletRecord>(
    "/api/wallet/sca",
    { method: "PUT", body: JSON.stringify({ scaAddress }) },
    apiName,
  );
}

export async function saveEoaAddress(walletAddress: string): Promise<void> {
  await requestJson<WalletRecord>(
    "/api/wallet/eoa",
    { method: "PUT", body: JSON.stringify({ walletAddress }) },
    apiName,
  );
}
