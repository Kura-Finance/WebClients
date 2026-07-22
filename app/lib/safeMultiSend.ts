/**
 * Safe MultiSendCallOnly encoding — same address/layout as permissionless Safe 1.4.1.
 */

import { encodeFunctionData, encodePacked, type Hex } from "viem";
import type { Call } from "@/lib/smartAccountSend";

/** Safe 1.4.1 MultiSendCallOnly (matches permissionless defaults). */
export const SAFE_MULTI_SEND_CALL_ONLY =
  "0x9641d764fc13c8B624c04430C7356C1C7C8102e2" as const;

const multiSendAbi = [
  {
    inputs: [{ internalType: "bytes", name: "transactions", type: "bytes" }],
    name: "multiSend",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

function encodeInternalTransaction(tx: {
  operation: number;
  to: `0x${string}`;
  value: bigint;
  data: Hex;
}): string {
  const data = tx.data.startsWith("0x") ? tx.data : (`0x${tx.data}` as Hex);
  const encoded = encodePacked(
    ["uint8", "address", "uint256", "uint256", "bytes"],
    [tx.operation, tx.to, tx.value, BigInt((data.length - 2) / 2), data],
  );
  return encoded.slice(2);
}

/** Encode `multiSend(bytes)` calldata for a batch of Call operations. */
export function encodeMultiSendCallData(calls: Call[]): Hex {
  if (!calls.length) throw new Error("No calls to encode.");
  const packed = `0x${calls
    .map((c) =>
      encodeInternalTransaction({
        operation: 0,
        to: c.to,
        value: c.value ?? BigInt(0),
        data: (c.data ?? "0x") as Hex,
      }),
    )
    .join("")}` as Hex;

  return encodeFunctionData({
    abi: multiSendAbi,
    functionName: "multiSend",
    args: [packed],
  });
}
