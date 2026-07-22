"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listDeposits,
  listPayoutAddresses,
  listPayoutDrains,
  listTransfers,
  type DepositResult,
  type PayoutDrainResult,
  type TransferResult,
} from "@/lib/bridgeRampApi";
import { hasBackendUrl } from "@/config/env";

export type ActivitySource = "chain" | "fiat_deposit" | "crypto_deposit" | "fiat_withdraw";
export type ActivityDirection = "in" | "out" | "self";

export interface WalletActivity {
  id: string;
  source: ActivitySource;
  hash: string;
  timestamp: string;
  direction: ActivityDirection;
  title: string;
  subtitle: string;
  tokenSymbol: string;
  amount: number;
  pending?: boolean;
  statusLabel?: string;
}

interface BlockscoutTransfer {
  hash: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  tokenSymbol: string | null;
  tokenDecimal: string | null;
  contractAddress: string;
}

const BLOCKSCOUT_API = "https://base.blockscout.com/api";

function parseAmount(raw: string | null | undefined): number {
  if (!raw) return 0;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

function truncateAddr(address: string): string {
  if (!address || address.length < 10) return address || "—";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function statusLabel(state: string): string {
  const map: Record<string, string> = {
    funds_scheduled: "Scheduled",
    funds_received: "Converting",
    in_review: "In review",
    payment_submitted: "On its way",
    payment_processed: "Completed",
    awaiting_funds: "Awaiting funds",
    refunded: "Refunded",
    returned: "Returned",
    error: "Failed",
    canceled: "Canceled",
    undeliverable: "Undeliverable",
  };
  return map[state] ?? state.replace(/_/g, " ");
}

async function fetchChainTokenTxs(address: string): Promise<WalletActivity[]> {
  const url = new URL(BLOCKSCOUT_API);
  url.searchParams.set("module", "account");
  url.searchParams.set("action", "tokentx");
  url.searchParams.set("address", address);
  url.searchParams.set("page", "1");
  url.searchParams.set("offset", "40");
  url.searchParams.set("sort", "desc");

  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const json = (await res.json()) as {
    status?: string;
    message?: string;
    result?: BlockscoutTransfer[] | string;
  };
  if (!Array.isArray(json.result)) return [];

  const me = address.toLowerCase();
  return json.result.map((tx) => {
    const from = (tx.from ?? "").toLowerCase();
    const to = (tx.to ?? "").toLowerCase();
    let direction: ActivityDirection = "in";
    if (from === me && to === me) direction = "self";
    else if (from === me) direction = "out";

    const decimals = tx.tokenDecimal ? parseInt(tx.tokenDecimal, 10) : 18;
    const amount = parseFloat(tx.value ?? "0") / Math.pow(10, Number.isFinite(decimals) ? decimals : 18);
    const ts = parseInt(tx.timeStamp ?? "", 10);
    const timestamp = Number.isFinite(ts) ? new Date(ts * 1000).toISOString() : new Date().toISOString();
    const counterparty = direction === "out" ? tx.to : tx.from;
    const symbol = tx.tokenSymbol ?? "TOKEN";

    return {
      id: `chain-${tx.hash}-${tx.contractAddress}-${tx.value}`,
      source: "chain" as const,
      hash: tx.hash,
      timestamp,
      direction,
      title:
        direction === "in" ? "Received" : direction === "out" ? "Sent" : "Converted",
      subtitle: `${symbol} · ${truncateAddr(counterparty)}`,
      tokenSymbol: symbol,
      amount,
    };
  });
}

function depositToActivity(d: DepositResult): WalletActivity {
  const currency = (d.currency ?? "usd").toUpperCase();
  const net = parseAmount(d.netAmount);
  const gross = parseAmount(d.amount);
  const amount = net || gross;
  return {
    id: `fiat-deposit-${d.depositId ?? d.createdAt}`,
    source: "fiat_deposit",
    hash: d.destinationTxHash ?? "",
    timestamp: d.createdAt,
    direction: "in",
    title: "Fiat deposit",
    subtitle: d.senderName
      ? `${d.senderName}${d.accountLast4 ? ` ···${d.accountLast4}` : ""}`
      : `${currency}${d.paymentRail ? ` · ${d.paymentRail.replace(/_/g, " ")}` : ""}`,
    tokenSymbol: "USDC",
    amount,
    pending: !d.completed,
    statusLabel: statusLabel(d.status),
  };
}

function transferToActivity(t: TransferResult): WalletActivity | null {
  if (t.direction === "offramp") return null;
  const currency = (t.sourceCurrency ?? "usd").toUpperCase();
  const complete = t.state === "payment_processed";
  const terminal = ["returned", "refunded", "error", "canceled"].includes(t.state);
  if (t.direction === "crypto") {
    return {
      id: `crypto-deposit-${t.bridgeTransferId}`,
      source: "crypto_deposit",
      hash: "",
      timestamp: t.createdAt,
      direction: "in",
      title: "Crypto deposit",
      subtitle: `${currency} → ${(t.destinationCurrency ?? "usdc").toUpperCase()}`,
      tokenSymbol: currency,
      amount: parseAmount(t.amount),
      pending: !complete && !terminal,
      statusLabel: statusLabel(t.state),
    };
  }
  return {
    id: `onramp-transfer-${t.bridgeTransferId}`,
    source: "fiat_deposit",
    hash: "",
    timestamp: t.createdAt,
    direction: "in",
    title: "Fiat deposit",
    subtitle: currency,
    tokenSymbol: "USDC",
    amount: parseAmount(t.amount),
    pending: !complete && !terminal,
    statusLabel: statusLabel(t.state),
  };
}

function drainToActivity(drain: PayoutDrainResult, depositAddress: string): WalletActivity {
  const complete = drain.state === "payment_processed";
  const terminal = ["undeliverable", "returned", "refunded", "error", "canceled"].includes(drain.state);
  const fiat = (drain.destination?.currency ?? drain.currency ?? "usd").toUpperCase();
  return {
    id: `fiat-withdraw-${drain.bridgeDrainId ?? drain.drainId ?? drain.createdAt}`,
    source: "fiat_withdraw",
    hash: drain.depositTxHash ?? "",
    timestamp: drain.createdAt,
    direction: "out",
    title: "Fiat withdrawal",
    subtitle: `${fiat}${drain.destination?.last4 ? ` ···${drain.destination.last4}` : ""}`,
    tokenSymbol: "USDC",
    amount: parseAmount(drain.amount),
    pending: !complete && !terminal,
    statusLabel: statusLabel(drain.state),
  };
}

export function useWalletActivity(smartAddress: string | null) {
  const [activities, setActivities] = useState<WalletActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!smartAddress && !hasBackendUrl()) {
      setActivities([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const chainPromise = smartAddress
        ? fetchChainTokenTxs(smartAddress).catch(() => [] as WalletActivity[])
        : Promise.resolve([] as WalletActivity[]);

      const bridgePromise = hasBackendUrl()
        ? (async () => {
            const rows: WalletActivity[] = [];
            try {
              const deposits = await listDeposits();
              rows.push(...deposits.map(depositToActivity));
            } catch {
              /* Bridge may be unavailable for this user */
            }
            try {
              const transfers = await listTransfers();
              for (const t of transfers) {
                const row = transferToActivity(t);
                if (row) rows.push(row);
              }
            } catch {
              /* optional */
            }
            try {
              const payouts = await listPayoutAddresses();
              const drainBatches = await Promise.all(
                payouts.map(async (p) => {
                  try {
                    const drains = await listPayoutDrains(p.bridgeLiquidationAddressId);
                    return drains.map((d) => drainToActivity(d, p.depositAddress));
                  } catch {
                    return [] as WalletActivity[];
                  }
                }),
              );
              rows.push(...drainBatches.flat());
            } catch {
              /* optional */
            }
            return rows;
          })()
        : Promise.resolve([] as WalletActivity[]);

      const [chain, bridge] = await Promise.all([chainPromise, bridgePromise]);

      // Prefer Bridge rows when they share a settlement hash with chain txs.
      const bridgeHashes = new Set(
        bridge.map((b) => b.hash.toLowerCase()).filter((h) => h.length > 0),
      );
      const filteredChain = chain.filter((c) => !bridgeHashes.has(c.hash.toLowerCase()));

      const merged = [...bridge, ...filteredChain].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      setActivities(merged);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load activity");
    } finally {
      setLoading(false);
    }
  }, [smartAddress]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(() => {
      void refresh();
    }, 45_000);
    return () => clearInterval(id);
  }, [refresh]);

  return { activities, loading, error, refresh };
}
