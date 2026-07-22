/**
 * Transaction list display helpers — mirrors mobile walletTxDisplay UX.
 */

import type { WalletActivity } from "@/hooks/useWalletActivity";

const USD_PEGGED = new Set(["USDC", "USDT", "DAI", "USD", "USDE", "USDY", "SUSDS", "USR"]);

export function formatTxRelativeTime(isoTimestamp: string): string {
  try {
    const d = new Date(isoTimestamp);
    const diffMs = Date.now() - d.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

export function formatTxFullDate(isoTimestamp: string): string {
  try {
    return new Date(isoTimestamp).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function getTxTypeLabel(tx: WalletActivity): string {
  switch (tx.source) {
    case "fiat_deposit":
      return "Fiat deposit";
    case "fiat_withdraw":
      return "Fiat withdrawal";
    case "crypto_deposit":
      return "Crypto deposit";
    default:
      if (tx.direction === "self") return "Converted";
      if (tx.direction === "in") return "Received";
      return "Sent";
  }
}

export function getTxAccentColor(tx: WalletActivity): string {
  const bridge =
    tx.source === "fiat_deposit" ||
    tx.source === "crypto_deposit" ||
    tx.source === "fiat_withdraw";
  if (bridge) {
    if (tx.pending) return "#60A5FA";
    if (tx.statusLabel && /fail|refund|return|cancel|undeliver/i.test(tx.statusLabel)) {
      return "#EF4444";
    }
    return "#10B981";
  }
  if (tx.direction === "self") return "#9CA3AF";
  if (tx.direction === "in") return "#10B981";
  return "#F59E0B";
}

export function getTxAmountPrefix(tx: WalletActivity): string {
  if (tx.direction === "self") return "";
  if (tx.direction === "in") return "+";
  return "−";
}

export function formatTxListAmount(tx: WalletActivity): string {
  const prefix = getTxAmountPrefix(tx);
  const abs = Math.abs(tx.amount);
  const symbol = (tx.tokenSymbol || "TOKEN").toUpperCase();

  if (USD_PEGGED.has(symbol) || tx.source === "fiat_deposit" || tx.source === "fiat_withdraw") {
    const body = abs.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${prefix}$${body}`;
  }

  let body: string;
  if (abs === 0) body = "0.00";
  else if (abs < 0.000001) body = abs.toExponential(2);
  else if (abs < 0.01) body = abs.toFixed(6);
  else if (abs < 1) body = abs.toFixed(4);
  else if (abs < 1000) body = abs.toFixed(2);
  else body = abs.toLocaleString("en-US", { maximumFractionDigits: 2 });

  return `${prefix}${body} ${symbol}`;
}

export type TxIconName = "down" | "up" | "swap" | "bank" | "crypto";

export function getTxIconName(tx: WalletActivity): TxIconName {
  if (tx.source === "fiat_deposit" || tx.source === "fiat_withdraw") return "bank";
  if (tx.source === "crypto_deposit") return "crypto";
  if (tx.direction === "self") return "swap";
  if (tx.direction === "in") return "down";
  return "up";
}

export function getTxSubtitle(tx: WalletActivity): { primary: string; secondary?: string } {
  if (tx.pending && tx.statusLabel) {
    return {
      primary: tx.subtitle || "In progress",
      secondary: tx.statusLabel,
    };
  }
  if (tx.statusLabel && tx.source !== "chain") {
    return {
      primary: tx.subtitle || getTxTypeLabel(tx),
      secondary: tx.statusLabel,
    };
  }
  return { primary: tx.subtitle || "On-chain" };
}

/** Home preview row count — matches mobile HOME_PREVIEW_LIMIT. */
export const HOME_TX_PREVIEW_LIMIT = 5;
