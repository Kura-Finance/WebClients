"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wallet,
  Coins,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAppStore } from "@/store/useAppStore";
import { usePortfolio, type PortfolioHolding } from "@/hooks/usePortfolio";
import type { PortfolioDisplayGroup } from "@/lib/portfolioTokens";
import { cryptoLogoUrl } from "@/lib/assetLogos";
import { marketSlug } from "@/lib/tradingViewSymbols";
import { Button } from "@/components/ui/button";
import AssetIcon from "@/components/ui/AssetIcon";
import {
  Chip,
  DashboardPage,
  PageHeader,
} from "@/components/dashboard/PageShell";

type FilterTab = "all" | PortfolioDisplayGroup;
type SortKey = "value" | "change" | "name";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "cash", label: "Cash" },
  { key: "crypto", label: "Crypto" },
];

function formatUsd(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatSignedUsd(value: number): string {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${formatUsd(Math.abs(value))}`;
}

function formatSignedPct(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function formatAmount(value: number): string {
  if (value === 0) return "0";
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (value >= 1) return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return value.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

function shortAddress(address: string | null): string | null {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function HoldingRow({
  item,
  portfolioTotal,
  hidden,
}: {
  item: PortfolioHolding;
  portfolioTotal: number;
  hidden: boolean;
}) {
  const up = item.change24h >= 0;
  const weight = portfolioTotal > 0 ? (item.value / portfolioTotal) * 100 : 0;
  const href =
    item.group === "crypto"
      ? `/dashboard/markets/${marketSlug(item.token.symbol)}`
      : null;

  const body = (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <AssetIcon
          src={cryptoLogoUrl(item.token.symbol)}
          label={item.token.displayName}
          color={item.token.color}
          size={36}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--kura-text)]">
            {item.token.displayName}
          </p>
          <p className="truncate text-xs text-[var(--kura-text-secondary)]">
            {item.token.name}
            <span className="ml-1.5 rounded bg-[var(--kura-bg-lighter)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
              {item.group === "cash" ? "Stable" : "Base"}
            </span>
          </p>
        </div>
      </div>

      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium tabular-nums text-[var(--kura-text)]">
          {hidden ? "••••" : formatUsd(item.price)}
        </p>
      </div>

      <div className="hidden text-right md:block">
        <p className="text-sm font-medium tabular-nums text-[var(--kura-text)]">
          {hidden ? "••••" : formatAmount(item.holdings)}
        </p>
        <p className="text-[11px] text-[var(--kura-text-secondary)]">{item.token.symbol}</p>
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums text-[var(--kura-text)]">
          {hidden ? "••••••" : formatUsd(item.value)}
        </p>
        <p className="text-[11px] tabular-nums text-[var(--kura-text-secondary)] sm:hidden">
          {hidden ? "••••" : `${formatAmount(item.holdings)} ${item.token.symbol}`}
        </p>
      </div>

      <div className="hidden text-right lg:block">
        {!hidden && Number.isFinite(item.change24h) ? (
          <span
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
              up ? "bg-emerald-500/12 text-emerald-500" : "bg-red-500/12 text-red-500"
            }`}
          >
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {formatSignedPct(item.change24h)}
          </span>
        ) : (
          <span className="text-xs text-[var(--kura-text-secondary)]">—</span>
        )}
      </div>

      <div className="hidden text-right xl:block">
        <div className="flex items-center justify-end gap-2">
          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-[var(--kura-bg-lighter)]">
            <div
              className="h-full rounded-full bg-[var(--kura-primary)]"
              style={{ width: `${Math.min(100, Math.max(2, weight))}%` }}
            />
          </div>
          <span className="w-10 text-xs font-medium tabular-nums text-[var(--kura-text-secondary)]">
            {hidden ? "—" : `${weight.toFixed(1)}%`}
          </span>
        </div>
      </div>
    </>
  );

  const className =
    "grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--kura-bg-light)]/40 sm:grid-cols-[minmax(0,1.5fr)_0.9fr_0.9fr_1fr] md:grid-cols-[minmax(0,1.4fr)_0.85fr_0.9fr_1fr] lg:grid-cols-[minmax(0,1.4fr)_0.8fr_0.85fr_0.95fr_0.85fr] xl:grid-cols-[minmax(0,1.5fr)_0.8fr_0.85fr_0.95fr_0.8fr_0.9fr]";

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}

export default function PortfolioView() {
  const isBalanceHidden = useAppStore((s) => s.isBalanceHidden);
  const toggleBalanceVisibility = useAppStore((s) => s.toggleBalanceVisibility);
  const [hideSmall, setHideSmall] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [sort, setSort] = useState<SortKey>("value");

  const {
    scaAddress,
    totalValue,
    pnl,
    allocation,
    visibleByGroup,
    loading,
    refreshing,
    error,
    refresh,
  } = usePortfolio();

  const cashItems = visibleByGroup("cash", hideSmall);
  const cryptoItems = visibleByGroup("crypto", hideSmall);
  const allItems = useMemo(
    () => [...cashItems, ...cryptoItems],
    [cashItems, cryptoItems],
  );

  const filtered = useMemo(() => {
    const base =
      filter === "all" ? allItems : filter === "cash" ? cashItems : cryptoItems;
    const list = [...base];
    switch (sort) {
      case "name":
        list.sort((a, b) => a.token.displayName.localeCompare(b.token.displayName));
        break;
      case "change":
        list.sort((a, b) => b.change24h - a.change24h);
        break;
      case "value":
      default:
        list.sort((a, b) => b.value - a.value);
        break;
    }
    return list;
  }, [allItems, cashItems, cryptoItems, filter, sort]);

  const cashValue = allocation.find((s) => s.key === "cash")?.value ?? 0;
  const cryptoValue = allocation.find((s) => s.key === "crypto")?.value ?? 0;
  const up = pnl.todayChangeUsd >= 0;
  const pieData = allocation
    .filter((s) => s.value > 0)
    .map((s) => ({ name: s.label, value: s.value, color: s.color, pct: s.pct }));
  const short = shortAddress(scaAddress);

  return (
    <DashboardPage>
      <PageHeader
        eyebrow="Wallet"
        title="Portfolio"
        description={
          <>
            Smart Wallet on Base
            {short ? (
              <>
                {" · "}
                <span className="font-mono text-[12px]">{short}</span>
              </>
            ) : null}
          </>
        }
        actions={
          <>
            <button
              type="button"
              onClick={toggleBalanceVisibility}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-[var(--kura-text-secondary)] transition-colors hover:bg-[var(--kura-bg-lighter)] hover:text-[var(--kura-text)]"
              aria-label={isBalanceHidden ? "Show balances" : "Hide balances"}
            >
              {isBalanceHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="hidden sm:inline">{isBalanceHidden ? "Show" : "Hide"}</span>
            </button>
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
          </>
        }
      />

      {/* KPI strip */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total value"
          loading={loading}
          value={isBalanceHidden ? "••••••" : formatUsd(totalValue)}
          hint="All holdings"
          icon={<Wallet className="h-4 w-4" />}
        />
        <KpiCard
          label="24h change"
          loading={loading}
          value={
            isBalanceHidden
              ? "••••"
              : totalValue > 0
                ? formatSignedUsd(pnl.todayChangeUsd)
                : "—"
          }
          hint={
            isBalanceHidden || totalValue <= 0
              ? "Today"
              : formatSignedPct(pnl.todayChangePct)
          }
          tone={totalValue > 0 ? (up ? "up" : "down") : "neutral"}
          icon={
            up ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )
          }
        />
        <KpiCard
          label="Cash"
          loading={loading}
          value={isBalanceHidden ? "••••••" : formatUsd(cashValue)}
          hint={`${allocation.find((s) => s.key === "cash")?.pct.toFixed(0) ?? 0}% of portfolio`}
          icon={<Wallet className="h-4 w-4" />}
        />
        <KpiCard
          label="Crypto"
          loading={loading}
          value={isBalanceHidden ? "••••••" : formatUsd(cryptoValue)}
          hint={`${allocation.find((s) => s.key === "crypto")?.pct.toFixed(0) ?? 0}% of portfolio`}
          icon={<Coins className="h-4 w-4" />}
        />
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-[var(--kura-error-border)] bg-[var(--kura-error-bg)] px-4 py-3 text-sm text-[var(--kura-error-fg)]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Holdings */}
        <section className="min-w-0">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {FILTER_TABS.map((tab) => (
                <Chip
                  key={tab.key}
                  active={filter === tab.key}
                  onClick={() => setFilter(tab.key)}
                >
                  {tab.label}
                  <span className="ml-1 opacity-60">
                    {tab.key === "all"
                      ? allItems.length
                      : tab.key === "cash"
                        ? cashItems.length
                        : cryptoItems.length}
                  </span>
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--kura-text-secondary)]">
                <input
                  type="checkbox"
                  checked={hideSmall}
                  onChange={(e) => setHideSmall(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-[var(--kura-border)] accent-[var(--kura-primary)]"
                />
                Hide small
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-8 rounded-lg border border-[var(--kura-border)] bg-[var(--kura-surface)] px-2 text-xs font-medium text-[var(--kura-text)] outline-none focus:ring-2 focus:ring-[var(--kura-primary)]/30"
              >
                <option value="value">Sort: Value</option>
                <option value="change">Sort: 24h</option>
                <option value="name">Sort: Name</option>
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--kura-border)] bg-[var(--kura-surface)]">
            <div className="hidden grid-cols-[minmax(0,1.5fr)_0.8fr_0.85fr_0.95fr_0.8fr_0.9fr] items-center gap-3 border-b border-[var(--kura-border)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)] xl:grid">
              <span>Asset</span>
              <span className="text-right">Price</span>
              <span className="text-right">Holdings</span>
              <span className="text-right">Value</span>
              <span className="text-right">24h</span>
              <span className="text-right">Weight</span>
            </div>
            <div className="hidden items-center gap-3 border-b border-[var(--kura-border)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)] sm:grid sm:grid-cols-[minmax(0,1.5fr)_0.9fr_0.9fr_1fr] md:grid-cols-[minmax(0,1.4fr)_0.85fr_0.9fr_1fr] lg:grid-cols-[minmax(0,1.4fr)_0.8fr_0.85fr_0.95fr_0.85fr] xl:hidden">
              <span>Asset</span>
              <span className="text-right">Price</span>
              <span className="hidden text-right md:block">Holdings</span>
              <span className="text-right">Value</span>
              <span className="hidden text-right lg:block">24h</span>
            </div>

            {loading ? (
              <div>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 border-b border-[var(--kura-border)] px-4 py-3.5 last:border-0"
                  >
                    <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--kura-bg-lighter)]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-20 animate-pulse rounded bg-[var(--kura-bg-lighter)]" />
                      <div className="h-2.5 w-32 animate-pulse rounded bg-[var(--kura-bg-lighter)]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="px-6 py-16 text-center text-sm text-[var(--kura-text-secondary)]">
                {allItems.length === 0
                  ? "No holdings yet. Fund your Smart Wallet to get started."
                  : "No assets match this filter."}
              </p>
            ) : (
              <div className="divide-y divide-[var(--kura-border)]">
                {filtered.map((item) => (
                  <HoldingRow
                    key={item.token.symbol}
                    item={item}
                    portfolioTotal={totalValue}
                    hidden={isBalanceHidden}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Allocation sidebar */}
        <aside className="h-fit space-y-4 lg:sticky lg:top-20">
          <div className="rounded-2xl border border-[var(--kura-border)] bg-[var(--kura-surface)] p-5">
            <p className="text-sm font-semibold text-[var(--kura-text)]">Allocation</p>
            <p className="mt-0.5 text-xs text-[var(--kura-text-secondary)]">
              Cash vs crypto weight
            </p>

            {loading ? (
              <div className="mx-auto mt-6 h-44 w-44 animate-pulse rounded-full bg-[var(--kura-bg-lighter)]" />
            ) : pieData.length === 0 ? (
              <div className="mt-6 flex h-44 items-center justify-center rounded-xl border border-dashed border-[var(--kura-border)] text-xs text-[var(--kura-text-secondary)]">
                No allocation yet
              </div>
            ) : (
              <div className="relative mx-auto mt-4 h-48 w-full max-w-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={82}
                      paddingAngle={3}
                      stroke="var(--kura-surface)"
                      strokeWidth={2}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--kura-bg)",
                        border: "1px solid var(--kura-border)",
                        borderRadius: "8px",
                        fontSize: 12,
                      }}
                      formatter={(value) => {
                        const n = typeof value === "number" ? value : Number(value ?? 0);
                        return [isBalanceHidden ? "••••" : formatUsd(n), "Value"];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--kura-text-secondary)]">
                      Total
                    </p>
                    <p className="text-sm font-semibold tabular-nums text-[var(--kura-text)]">
                      {isBalanceHidden ? "••••" : formatUsd(totalValue)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 space-y-3">
              {allocation.map((slice) => (
                <div key={slice.key} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-sm font-medium text-[var(--kura-text)]">
                      {slice.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-[var(--kura-text)]">
                      {isBalanceHidden ? "••••" : formatUsd(slice.value)}
                    </p>
                    <p className="text-[11px] tabular-nums text-[var(--kura-text-secondary)]">
                      {slice.pct.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--kura-border)] bg-[var(--kura-surface)] p-4">
            <p className="text-xs leading-relaxed text-[var(--kura-text-secondary)]">
              Prices via CoinGecko · Self-custody Safe on Base. Crypto rows open the
              market chart.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" asChild>
                <Link href="/dashboard/add-money">Add Money</Link>
              </Button>
              <Button type="button" variant="outline" size="sm" asChild>
                <Link href="/dashboard/markets">Markets</Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </DashboardPage>
  );
}

function KpiCard({
  label,
  value,
  hint,
  loading,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint: string;
  loading?: boolean;
  icon: React.ReactNode;
  tone?: "neutral" | "up" | "down";
}) {
  const valueClass =
    tone === "up"
      ? "text-emerald-500"
      : tone === "down"
        ? "text-red-500"
        : "text-[var(--kura-text)]";

  return (
    <div className="rounded-2xl border border-[var(--kura-border)] bg-[var(--kura-surface)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)]">
          {label}
        </p>
        <span className="text-[var(--kura-text-secondary)] opacity-70">{icon}</span>
      </div>
      {loading ? (
        <div className="h-7 w-28 animate-pulse rounded-md bg-[var(--kura-bg-lighter)]" />
      ) : (
        <p className={`text-xl font-semibold tracking-tight tabular-nums ${valueClass}`}>
          {value}
        </p>
      )}
      <p className="mt-1 text-xs text-[var(--kura-text-secondary)]">{hint}</p>
    </div>
  );
}
