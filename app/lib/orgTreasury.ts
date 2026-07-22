/**
 * Multi-treasury org model helpers (types live with store consumers).
 */

export type TreasurySource = "created" | "bound";

export interface OrgTreasury {
  id: string;
  name: string;
  address: string;
  source: TreasurySource;
  createdAt: string;
  /** Salt for counterfactual “created” Safes (personal = 0). Stored as decimal string. */
  saltNonce?: string;
}

export function nextTreasurySaltNonce(treasuries: OrgTreasury[]): bigint {
  let max = BigInt(0);
  for (const t of treasuries) {
    if (t.source !== "created" || !t.saltNonce) continue;
    try {
      const n = BigInt(t.saltNonce);
      if (n > max) max = n;
    } catch {
      /* ignore */
    }
  }
  // Personal Smart Wallet uses 0; first treasury uses 1.
  return max >= BigInt(1) ? max + BigInt(1) : BigInt(1);
}

export function defaultTreasuryName(treasuries: OrgTreasury[]): string {
  const n = treasuries.length + 1;
  return n === 1 ? "Treasury" : `Treasury ${n}`;
}
