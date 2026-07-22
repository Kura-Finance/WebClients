/**
 * Shared display / error helpers for dashboard surfaces.
 */

import { ApiError } from "@/lib/errorHandler";

export function formatUsd(value: number, hidden = false): string {
  if (hidden) return "••••••";
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function truncateAddress(address: string, left = 6, right = 4): string {
  if (address.length < left + right + 1) return address;
  return `${address.slice(0, left)}…${address.slice(-right)}`;
}

export function errMessage(e: unknown, fallback = "Something went wrong."): string {
  if (e instanceof ApiError) return e.userMessage || e.message || fallback;
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}

export function isHexAddress(value: string | null | undefined): value is `0x${string}` {
  return typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value);
}
