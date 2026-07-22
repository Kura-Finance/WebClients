"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
/** History detail: keep loading month segments until at least this many rows (or exhausted). */
export const HISTORY_MIN_INITIAL = 30;
const HISTORY_MAX_MONTHS = 36;
const CHAIN_PAGE_SIZE = 100;

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

function mapChainTransfer(tx: BlockscoutTransfer, address: string): WalletActivity {
  const me = address.toLowerCase();
  const from = (tx.from ?? "").toLowerCase();
  const to = (tx.to ?? "").toLowerCase();
  let direction: ActivityDirection = "in";
  if (from === me && to === me) direction = "self";
  else if (from === me) direction = "out";

  const decimals = tx.tokenDecimal ? parseInt(tx.tokenDecimal, 10) : 18;
  const amount =
    parseFloat(tx.value ?? "0") / Math.pow(10, Number.isFinite(decimals) ? decimals : 18);
  const ts = parseInt(tx.timeStamp ?? "", 10);
  const timestamp = Number.isFinite(ts)
    ? new Date(ts * 1000).toISOString()
    : new Date().toISOString();
  const counterparty = direction === "out" ? tx.to : tx.from;
  const symbol = tx.tokenSymbol ?? "TOKEN";

  return {
    id: `chain-${tx.hash}-${tx.contractAddress}-${tx.value}`,
    source: "chain",
    hash: tx.hash,
    timestamp,
    direction,
    title: direction === "in" ? "Received" : direction === "out" ? "Sent" : "Converted",
    subtitle: `${symbol} · ${truncateAddr(counterparty)}`,
    tokenSymbol: symbol,
    amount,
  };
}

async function fetchChainTokenTxPage(
  address: string,
  page: number,
  offset: number,
): Promise<WalletActivity[]> {
  const url = new URL(BLOCKSCOUT_API);
  url.searchParams.set("module", "account");
  url.searchParams.set("action", "tokentx");
  url.searchParams.set("address", address);
  url.searchParams.set("page", String(page));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("sort", "desc");

  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const json = (await res.json()) as {
    status?: string;
    message?: string;
    result?: BlockscoutTransfer[] | string;
  };
  if (!Array.isArray(json.result)) return [];
  return json.result.map((tx) => mapChainTransfer(tx, address));
}

/** Home / treasury preview — recent chain page. */
async function fetchChainTokenTxs(address: string): Promise<WalletActivity[]> {
  return fetchChainTokenTxPage(address, 1, 40);
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

function drainToActivity(drain: PayoutDrainResult): WalletActivity {
  const complete = drain.state === "payment_processed";
  const terminal = ["undeliverable", "returned", "refunded", "error", "canceled"].includes(
    drain.state,
  );
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

async function fetchBridgeActivities(): Promise<WalletActivity[]> {
  if (!hasBackendUrl()) return [];
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
          return drains.map((d) => drainToActivity(d));
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
}

function mergeActivities(bridge: WalletActivity[], chain: WalletActivity[]): WalletActivity[] {
  const bridgeHashes = new Set(
    bridge.map((b) => b.hash.toLowerCase()).filter((h) => h.length > 0),
  );
  const filteredChain = chain.filter((c) => !bridgeHashes.has(c.hash.toLowerCase()));
  return [...bridge, ...filteredChain].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

function dedupeById(rows: WalletActivity[]): WalletActivity[] {
  const seen = new Set<string>();
  const out: WalletActivity[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

/** Calendar month window. monthsAgo=0 is current month through now. */
export function monthWindow(monthsAgo: number): { startMs: number; endMs: number; label: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const endExclusive =
    monthsAgo === 0
      ? new Date(now.getTime() + 1)
      : new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 1);
  return {
    startMs: start.getTime(),
    endMs: endExclusive.getTime(),
    label: start.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  };
}

function inMonth(iso: string, startMs: number, endMs: number): boolean {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t >= startMs && t < endMs;
}

/**
 * Cursor that pages Blockscout newest→oldest so month windows can filter locally.
 */
class ChainTxCursor {
  private address: string;
  private buffer: WalletActivity[] = [];
  private nextPage = 1;
  exhausted = false;

  constructor(address: string) {
    this.address = address;
  }

  async ensureThrough(oldestNeededMs: number): Promise<void> {
    while (!this.exhausted) {
      if (this.buffer.length > 0) {
        const oldest = Math.min(...this.buffer.map((r) => new Date(r.timestamp).getTime()));
        if (oldest < oldestNeededMs) return;
      }
      const page = await fetchChainTokenTxPage(this.address, this.nextPage, CHAIN_PAGE_SIZE);
      this.nextPage += 1;
      if (page.length === 0) {
        this.exhausted = true;
        return;
      }
      this.buffer = dedupeById([...this.buffer, ...page]);
      if (page.length < CHAIN_PAGE_SIZE) {
        this.exhausted = true;
        return;
      }
    }
  }

  inRange(startMs: number, endMs: number): WalletActivity[] {
    return this.buffer.filter((r) => inMonth(r.timestamp, startMs, endMs));
  }
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
      const bridgePromise = fetchBridgeActivities().catch(() => [] as WalletActivity[]);
      const [chain, bridge] = await Promise.all([chainPromise, bridgePromise]);
      setActivities(mergeActivities(bridge, chain));
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

/**
 * All-history loader: one calendar month per segment.
 * Initial load keeps fetching months until ≥ HISTORY_MIN_INITIAL rows (or exhausted = load all).
 */
export function useWalletActivityHistory(smartAddress: string | null) {
  const [activities, setActivities] = useState<WalletActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [monthsLoaded, setMonthsLoaded] = useState(0);

  const bridgeRef = useRef<WalletActivity[] | null>(null);
  const chainRef = useRef<ChainTxCursor | null>(null);
  const nextMonthRef = useRef(0);
  const emptyStreakRef = useRef(0);

  const loadMonthSegment = useCallback(
    async (monthsAgo: number): Promise<WalletActivity[]> => {
      const { startMs, endMs } = monthWindow(monthsAgo);
      const bridge = bridgeRef.current ?? [];
      const bridgeMonth = bridge.filter((r) => inMonth(r.timestamp, startMs, endMs));

      let chainMonth: WalletActivity[] = [];
      if (smartAddress) {
        if (!chainRef.current) chainRef.current = new ChainTxCursor(smartAddress);
        await chainRef.current.ensureThrough(startMs);
        chainMonth = chainRef.current.inRange(startMs, endMs);
      }

      return mergeActivities(bridgeMonth, chainMonth);
    },
    [smartAddress],
  );

  const refresh = useCallback(async () => {
    if (!smartAddress && !hasBackendUrl()) {
      setActivities([]);
      setHasMore(false);
      setMonthsLoaded(0);
      return;
    }

    setLoading(true);
    setError(null);
    nextMonthRef.current = 0;
    emptyStreakRef.current = 0;
    chainRef.current = smartAddress ? new ChainTxCursor(smartAddress) : null;

    try {
      bridgeRef.current = await fetchBridgeActivities().catch(() => [] as WalletActivity[]);

      let local: WalletActivity[] = [];
      let monthsAgo = 0;
      let emptyStreak = 0;
      let more = true;

      while (monthsAgo < HISTORY_MAX_MONTHS && local.length < HISTORY_MIN_INITIAL) {
        const batch = await loadMonthSegment(monthsAgo);
        monthsAgo += 1;

        if (batch.length === 0) {
          emptyStreak += 1;
          const chainDone = !smartAddress || chainRef.current?.exhausted === true;
          if ((emptyStreak >= 3 && chainDone) || emptyStreak >= 6) {
            more = false;
            break;
          }
          continue;
        }

        emptyStreak = 0;
        local = dedupeById(
          [...local, ...batch].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          ),
        );
      }

      if (monthsAgo >= HISTORY_MAX_MONTHS) more = false;

      nextMonthRef.current = monthsAgo;
      emptyStreakRef.current = emptyStreak;
      setActivities(local);
      setMonthsLoaded(monthsAgo);
      setHasMore(more && monthsAgo < HISTORY_MAX_MONTHS);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load activity");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loadMonthSegment, smartAddress]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    setError(null);
    try {
      if (!bridgeRef.current) {
        bridgeRef.current = await fetchBridgeActivities().catch(() => [] as WalletActivity[]);
      }

      let local = [...activities];
      let monthsAgo = nextMonthRef.current;
      let emptyStreak = emptyStreakRef.current;
      let more = true;
      let loadedOneNonEmpty = false;

      while (monthsAgo < HISTORY_MAX_MONTHS && !loadedOneNonEmpty) {
        const batch = await loadMonthSegment(monthsAgo);
        monthsAgo += 1;

        if (batch.length === 0) {
          emptyStreak += 1;
          const chainDone = !smartAddress || chainRef.current?.exhausted === true;
          if ((emptyStreak >= 3 && chainDone) || emptyStreak >= 6) {
            more = false;
            break;
          }
          continue;
        }

        emptyStreak = 0;
        loadedOneNonEmpty = true;
        local = dedupeById(
          [...local, ...batch].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          ),
        );
      }

      if (monthsAgo >= HISTORY_MAX_MONTHS) more = false;

      nextMonthRef.current = monthsAgo;
      emptyStreakRef.current = emptyStreak;
      setActivities(local);
      setMonthsLoaded(monthsAgo);
      setHasMore(more && monthsAgo < HISTORY_MAX_MONTHS);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }, [activities, hasMore, loadMonthSegment, loading, loadingMore, smartAddress]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    activities,
    loading,
    loadingMore,
    error,
    hasMore,
    monthsLoaded,
    refresh,
    loadMore,
  };
}
