/**
 * Execute Call[] from Smart Wallet, or propose to Treasury Approvals queue.
 */

import type { Hex } from "viem";
import {
  executeCallsFromSafe,
  type Call,
  type EthereumProvider,
  type SafeAccountOpts,
} from "@/lib/smartAccountSend";
import { proposeTreasuryCalls } from "@/lib/proposeTreasuryCalls";

export type TradingSubmitResult =
  | { kind: "executed"; txHash: string }
  | { kind: "proposed"; safeTxHash: Hex };

export async function submitCallsSmartOrTreasury(params: {
  isTreasury: boolean;
  eip1193Provider: EthereumProvider;
  scaAddress: `0x${string}`;
  eoaAddress: string;
  treasurySafe?: string | null;
  calls: Call[];
  accountOpts?: SafeAccountOpts;
}): Promise<TradingSubmitResult> {
  if (params.isTreasury) {
    if (!params.treasurySafe) throw new Error("Treasury Safe not linked.");
    const { safeTxHash } = await proposeTreasuryCalls({
      eip1193Provider: params.eip1193Provider,
      treasurySafe: params.treasurySafe as `0x${string}`,
      eoaAddress: params.eoaAddress,
      calls: params.calls,
    });
    return { kind: "proposed", safeTxHash };
  }

  const txHash = await executeCallsFromSafe({
    eip1193Provider: params.eip1193Provider,
    expectedScaAddress: params.scaAddress,
    calls: params.calls,
    ...(params.accountOpts ?? {}),
  });
  return { kind: "executed", txHash };
}
