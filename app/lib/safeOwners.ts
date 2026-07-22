/**
 * Safe 1.4.x owner management helpers (add / remove / threshold).
 * Owner changes are executed as calls to the Safe itself via UserOps.
 */

import { encodeFunctionData, parseAbi } from "viem";
import type { Call } from "@/lib/smartAccountSend";

export const SENTINEL_OWNERS =
  "0x0000000000000000000000000000000000000001" as const;

export const SAFE_OWNER_WRITE_ABI = parseAbi([
  "function addOwnerWithThreshold(address owner, uint256 _threshold)",
  "function removeOwner(address prevOwner, address owner, uint256 _threshold)",
  "function changeThreshold(uint256 _threshold)",
  "function isOwner(address owner) view returns (bool)",
]);

export function isEthAddress(value: string): value is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function normalizeAddress(value: string): `0x${string}` {
  return value.trim().toLowerCase() as `0x${string}`;
}

/** prevOwner in Safe's linked list for `ownerToRemove`. */
export function getPrevOwner(
  owners: readonly `0x${string}`[],
  ownerToRemove: `0x${string}`,
): `0x${string}` {
  const target = ownerToRemove.toLowerCase();
  const idx = owners.findIndex((o) => o.toLowerCase() === target);
  if (idx < 0) throw new Error("Address is not a Safe owner.");
  if (idx === 0) return SENTINEL_OWNERS;
  return owners[idx - 1]!;
}

export function isSafeOwner(
  owners: readonly `0x${string}`[],
  address: string | null | undefined,
): boolean {
  if (!address || !isEthAddress(address)) return false;
  const target = address.toLowerCase();
  return owners.some((o) => o.toLowerCase() === target);
}

/** Clamp threshold after an owner count change. */
export function clampThreshold(threshold: number, ownerCount: number): number {
  if (ownerCount < 1) return 1;
  return Math.max(1, Math.min(threshold, ownerCount));
}

export function buildAddOwnerCall(params: {
  safeAddress: `0x${string}`;
  newOwner: `0x${string}`;
  /** Threshold after the add (defaults to current). */
  threshold: number;
}): Call {
  return {
    to: params.safeAddress,
    data: encodeFunctionData({
      abi: SAFE_OWNER_WRITE_ABI,
      functionName: "addOwnerWithThreshold",
      args: [params.newOwner, BigInt(params.threshold)],
    }),
  };
}

export function buildRemoveOwnerCall(params: {
  safeAddress: `0x${string}`;
  owners: readonly `0x${string}`[];
  ownerToRemove: `0x${string}`;
  /** Threshold after the remove. */
  threshold: number;
}): Call {
  const prevOwner = getPrevOwner(params.owners, params.ownerToRemove);
  return {
    to: params.safeAddress,
    data: encodeFunctionData({
      abi: SAFE_OWNER_WRITE_ABI,
      functionName: "removeOwner",
      args: [prevOwner, params.ownerToRemove, BigInt(params.threshold)],
    }),
  };
}

export function buildChangeThresholdCall(params: {
  safeAddress: `0x${string}`;
  threshold: number;
}): Call {
  return {
    to: params.safeAddress,
    data: encodeFunctionData({
      abi: SAFE_OWNER_WRITE_ABI,
      functionName: "changeThreshold",
      args: [BigInt(params.threshold)],
    }),
  };
}
