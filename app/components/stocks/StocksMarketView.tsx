"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, Search, ChevronRight } from "lucide-react";
import { useStockCatalog } from "@/hooks/useStockCatalog";
import {
  formatStockPrice,
  formatVolume,
  stockSlug,
  type StockQuoteRow,
} from "@/lib/stockCatalog";
import { Button } from "@/components/ui/button";
import AssetIcon from "@/components/ui/AssetIcon";
import {
  Chip,
  DashboardPage,
  PageHeader,
} from "@/components/dashboard/PageShell";

type SortKey = "popular" | "gainers" | "losers" | "volume";

function changeBadge(change: number | null) {
  if (change == null || !Number.isFinite(change)) {
    return { text: "—", up: true, className: "text-[var(--kura-text-secondary)]" };
  }
  const up = change >= 0;
  return {
    up,
    text: `${up ? "+" : ""}${change.toFixed(2)}%`,
    className: up
      ? "bg-emerald-500/15 text-emerald-500"
      : "bg-red-500/15 text-red-500",
  };
}

const SORT_TABS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "volume", label: "Max. Volume" },
  { key: "gainers", label: "Trending Up" },
  { key: "losers", label: "Trending Down" },
];

export default function StocksMarketView() {
  const { stocks, loading, refreshing, error, source, refresh } = useStockCatalog();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = stocks.filter(
      (s) =>
        !q ||
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q),
    );

    switch (sort) {
      case "gainers":
        list = [...list].sort((a, b) => (b.change24h ?? -999) - (a.change24h ?? -999));
        break;
      case "losers":
        list = [...list].sort((a, b) => (a.change24h ?? 999) - (b.change24h ?? 999));
        break;
      case "volume":
        list = [...list].sort((a, b) => (b.volume24h ?? 0) - (a.volume24h ?? 0));
        break;
      default:
        break;
    }
    return list;
  }, [stocks, query, sort]);

  return (
    <DashboardPage>
      <PageHeader
        eyebrow="Market"
        title="Tokenized Stock"
        description="dShares · buy & sell US equities with USDC · powered by Dinari"
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void refresh()}
            disabled={loading || refreshing}
            className="gap-1.5 text-[var(--kura-text-secondary)]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {/* Product tabs — Dinari style */}
      <div className="mb-4 flex gap-2">
        <span className="rounded-full bg-[var(--kura-primary)] px-3.5 py-1.5 text-xs font-semibold text-[var(--kura-on-primary)]">
          dShares
        </span>
        <span className="rounded-full border border-[var(--kura-border)] px-3.5 py-1.5 text-xs font-semibold text-[var(--kura-text-secondary)] opacity-60">
          Alloys
        </span>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {SORT_TABS.map((tab) => (
            <Chip
              key={tab.key}
              active={sort === tab.key}
              onClick={() => setSort(tab.key)}
            >
              {tab.label}
            </Chip>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--kura-text-secondary)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stocks"
            className="h-10 w-full rounded-xl border border-[var(--kura-border)] bg-[var(--kura-surface)] pl-10 pr-4 text-sm text-[var(--kura-text)] outline-none focus:ring-2 focus:ring-[var(--kura-primary)]/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--kura-border)] bg-[var(--kura-surface)]">
        <div className="hidden items-center gap-3 border-b border-[var(--kura-border)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)] sm:flex">
          <span className="min-w-0 flex-[1.4]">Name</span>
          <span className="w-28 text-right">Market Price</span>
          <span className="w-24 text-right">Volume</span>
          <span className="w-24 text-right">Change</span>
          <span className="w-8" />
        </div>

        {error ? (
          <div className="m-4 rounded-xl border border-[var(--kura-error-border)] bg-[var(--kura-error-bg)] px-3 py-2.5 text-sm text-[var(--kura-error-fg)]">
            {error}
          </div>
        ) : null}

        {loading && stocks.length === 0 ? (
          <div>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-[var(--kura-border)] px-4 py-3.5 last:border-0"
              >
                <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--kura-bg-lighter)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-16 animate-pulse rounded bg-[var(--kura-bg-lighter)]" />
                  <div className="h-2.5 w-28 animate-pulse rounded bg-[var(--kura-bg-lighter)]" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-[var(--kura-text-secondary)]">
            {query ? "No stocks match your search" : "Loading stocks…"}
          </p>
        ) : (
          <div className="divide-y divide-[var(--kura-border)]">
            {filtered.map((item) => (
              <StockMarketRow key={item.symbol} item={item} />
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-[11px] text-[var(--kura-text-secondary)]">
        Prices via {source === "dinari" ? "Dinari + CoinGecko" : "CoinGecko"} · Charts by
        TradingView · Trading on mobile after Dinari KYC
      </p>
    </DashboardPage>
  );
}

function StockMarketRow({ item }: { item: StockQuoteRow }) {
  const badge = changeBadge(item.change24h);
  return (
    <Link
      href={`/dashboard/rwa/${stockSlug(item.symbol)}`}
      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--kura-bg-light)]/40"
    >
      <AssetIcon src={item.logoUrl} label={item.symbol} color={item.color} size={40} />
      <div className="min-w-0 flex-[1.4]">
        <p className="text-sm font-semibold text-[var(--kura-text)]">{item.symbol}</p>
        <p className="truncate text-xs text-[var(--kura-text-secondary)]">{item.name}</p>
      </div>
      <div className="hidden w-28 shrink-0 text-right sm:block">
        <p className="text-sm font-semibold tabular-nums text-[var(--kura-text)]">
          {formatStockPrice(item.price)}
        </p>
      </div>
      <div className="hidden w-24 shrink-0 text-right sm:block">
        <p className="text-xs tabular-nums text-[var(--kura-text-secondary)]">
          {formatVolume(item.volume24h)}
        </p>
      </div>
      <div className="ml-auto w-24 shrink-0 text-right sm:ml-0">
        <span
          className={`inline-block rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${badge.className}`}
        >
          {badge.text}
        </span>
        <p className="mt-0.5 text-xs tabular-nums text-[var(--kura-text)] sm:hidden">
          {formatStockPrice(item.price)}
        </p>
      </div>
      <ChevronRight className="hidden h-4 w-4 shrink-0 text-[var(--kura-text-secondary)] opacity-50 sm:block" />
    </Link>
  );
}
