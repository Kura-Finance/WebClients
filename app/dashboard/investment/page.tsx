"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
  XAxis,
  YAxis,
} from "recharts";
import { Plus, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFinanceStore, type Investment } from "@/store/useFinanceStore";
import { useAppStore } from "@/store/useAppStore";
import {
  Chip,
  DashboardPage,
  PageHeader,
  Panel,
  PanelHeader,
} from "@/components/dashboard/PageShell";
import AssetSegmentChartCard from "@/dashboard/_components/trackfi/AssetSegmentChartCard";

const ConnectAccountModal = dynamic(() => import("@/components/ConnectAccountModal"), {
  ssr: false,
});

const PIE_COLORS = [
  "#60a5fa",
  "#a78bfa",
  "#34d399",
  "#f59e0b",
  "#fb7185",
  "#22d3ee",
  "#f97316",
  "#818cf8",
];

const KNOWN_ETF_SYMBOLS = new Set([
  "SPY",
  "VOO",
  "QQQ",
  "VTI",
  "IVV",
  "DIA",
  "IWM",
  "XLK",
  "XLF",
  "ARKK",
  "EEM",
  "GLD",
  "TLT",
]);

type HoldingFilter = "all" | "etf" | "stock";

type HoldingWithMetrics = Investment & {
  marketValue: number;
  portfolioPct: number;
  isEtf: boolean;
};

function formatCurrency(value: number | undefined | null): string {
  return `$${(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercent(value: number | undefined | null): string {
  return `${(value ?? 0).toFixed(2)}%`;
}

function formatUnits(value: number | undefined | null): string {
  return (value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

function isLikelyEtf(holding: Investment): boolean {
  if (holding.type === "etf") return true;
  if (holding.type !== "stock") return false;
  const symbol = (holding.symbol ?? "").toUpperCase();
  const name = (holding.name ?? "").toUpperCase();
  return KNOWN_ETF_SYMBOLS.has(symbol) || /\bETF\b/.test(name) || /\bINDEX\b/.test(name);
}

function maskIfHidden(hidden: boolean, value: string): string {
  return hidden ? "••••••" : value;
}

export default function InvestmentPage() {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [filter, setFilter] = useState<HoldingFilter>("all");

  const investments = useFinanceStore((state) => state.investments);
  const apiAssetHistory = useFinanceStore((state) => state.apiAssetHistory);
  const isLoadingAssetHistory = useFinanceStore((state) => state.isLoadingAssetHistory);
  const hydrateAssetHistory = useFinanceStore((state) => state.hydrateAssetHistory);
  const hydratePlaidFinanceData = useFinanceStore((state) => state.hydratePlaidFinanceData);
  const isLoadingPlaidData = useFinanceStore((state) => state.isLoadingPlaidData);
  const isBalanceHidden = useAppStore((state) => state.isBalanceHidden);
  const isDecryptionReady = useAppStore((state) => state.isDecryptionReady);

  useEffect(() => {
    if (!isDecryptionReady) return;
    hydrateAssetHistory(30);
  }, [hydrateAssetHistory, isDecryptionReady]);

  const { holdings, totalValue } = useMemo(() => {
    const equityHoldings = investments.filter(
      (holding) => holding.type === "stock" || holding.type === "etf",
    );

    const rawValue = equityHoldings.reduce(
      (sum, holding) => sum + Math.max(0, holding.holdings * holding.currentPrice),
      0,
    );

    const normalizedHoldings: HoldingWithMetrics[] = equityHoldings
      .map((holding) => {
        const marketValue = Math.max(0, holding.holdings * holding.currentPrice);
        const portfolioPct = rawValue > 0 ? (marketValue / rawValue) * 100 : 0;
        return {
          ...holding,
          marketValue,
          portfolioPct,
          isEtf: isLikelyEtf(holding),
        };
      })
      .sort((a, b) => b.marketValue - a.marketValue);

    return { holdings: normalizedHoldings, totalValue: rawValue };
  }, [investments]);

  const etfHoldings = useMemo(() => holdings.filter((h) => h.isEtf), [holdings]);
  const stockHoldings = useMemo(() => holdings.filter((h) => !h.isEtf), [holdings]);
  const etfTotal = useMemo(
    () => etfHoldings.reduce((sum, h) => sum + h.marketValue, 0),
    [etfHoldings],
  );
  const stockTotal = useMemo(
    () => stockHoldings.reduce((sum, h) => sum + h.marketValue, 0),
    [stockHoldings],
  );

  const visibleHoldings = useMemo(() => {
    if (filter === "etf") return etfHoldings;
    if (filter === "stock") return stockHoldings;
    return holdings;
  }, [filter, etfHoldings, stockHoldings, holdings]);

  const pieData = useMemo(
    () =>
      holdings.slice(0, 8).map((holding) => ({
        name: holding.symbol,
        value: holding.marketValue,
        pct: holding.portfolioPct,
      })),
    [holdings],
  );

  const trendData = useMemo(() => {
    return [...apiAssetHistory]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((point) => ({
        value:
          typeof point.plaidInvestment === "number" && Number.isFinite(point.plaidInvestment)
            ? point.plaidInvestment
            : 0,
        label: new Date(point.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }));
  }, [apiAssetHistory]);

  const refresh = () => {
    void hydratePlaidFinanceData();
    if (isDecryptionReady) hydrateAssetHistory(30);
  };

  return (
    <DashboardPage>
      {isConnectModalOpen ? (
        <ConnectAccountModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
        />
      ) : null}

      <PageHeader
        eyebrow="Broker"
        title="Investment portfolio"
        description="Stocks and ETFs from connected brokerage accounts."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={refresh}
              disabled={isLoadingPlaidData || isLoadingAssetHistory}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  isLoadingPlaidData || isLoadingAssetHistory ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => setIsConnectModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Connect
            </Button>
          </>
        }
      />

      <AssetSegmentChartCard
        segment="plaidInvestment"
        title="Portfolio value"
        description="Tracked from connected investment accounts"
      />

      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <Panel padding="sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)]">
            Total
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--kura-text)]">
            {maskIfHidden(isBalanceHidden, formatCurrency(totalValue))}
          </p>
        </Panel>
        <Panel padding="sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)]">
            ETFs
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--kura-text)]">
            {maskIfHidden(isBalanceHidden, formatCurrency(etfTotal))}
          </p>
          <p className="mt-1 text-xs text-[var(--kura-text-secondary)]">
            {etfHoldings.length} position{etfHoldings.length === 1 ? "" : "s"}
          </p>
        </Panel>
        <Panel padding="sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)]">
            Stocks
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--kura-text)]">
            {maskIfHidden(isBalanceHidden, formatCurrency(stockTotal))}
          </p>
          <p className="mt-1 text-xs text-[var(--kura-text-secondary)]">
            {stockHoldings.length} position{stockHoldings.length === 1 ? "" : "s"}
          </p>
        </Panel>
      </section>

      <Panel padding="md" className="mb-6">
        <PanelHeader
          title="Allocation"
          description="Weight by holding and 30-day trend"
        />
        {pieData.length === 0 || totalValue <= 0 ? (
          <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-[var(--kura-border)] text-sm text-[var(--kura-text-secondary)]">
            No stock or ETF holdings yet.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-10">
            <div className="relative h-56 lg:col-span-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={96}
                    paddingAngle={2}
                    stroke="var(--kura-surface)"
                    strokeWidth={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--kura-surface)",
                      border: "1px solid var(--kura-border)",
                      borderRadius: "10px",
                    }}
                    formatter={(value, name, props) => {
                      const percentage = props?.payload?.pct as number | undefined;
                      const numericValue = typeof value === "number" ? value : Number(value ?? 0);
                      const amount = maskIfHidden(isBalanceHidden, formatCurrency(numericValue));
                      return [
                        percentage ? `${amount} (${formatPercent(percentage)})` : amount,
                        name ?? "Holding",
                      ];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-[11px] text-[var(--kura-text-secondary)]">Total</p>
                  <p className="text-sm font-semibold tabular-nums text-[var(--kura-text)]">
                    {maskIfHidden(isBalanceHidden, formatCurrency(totalValue))}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-56 lg:col-span-6">
              {isLoadingAssetHistory ? (
                <div className="h-full w-full animate-pulse rounded-xl bg-[var(--kura-bg-lighter)]" />
              ) : trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="investmentTrendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--kura-primary)" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="var(--kura-primary)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke="var(--kura-text-secondary)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="var(--kura-text-secondary)" tick={{ fontSize: 11 }} width={40} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--kura-surface)",
                        border: "1px solid var(--kura-border)",
                        borderRadius: "10px",
                      }}
                      formatter={(value) => [
                        maskIfHidden(isBalanceHidden, formatCurrency(Number(value ?? 0))),
                        "Portfolio",
                      ]}
                      labelStyle={{ color: "var(--kura-text-secondary)", fontSize: "11px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--kura-primary)"
                      strokeWidth={2}
                      fill="url(#investmentTrendAreaGradient)"
                      dot={false}
                      activeDot={{ r: 3, fill: "var(--kura-primary)", strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[var(--kura-border)] text-sm text-[var(--kura-text-secondary)]">
                  No trend data available.
                </div>
              )}
            </div>
          </div>
        )}
      </Panel>

      <Panel padding="none">
        <div className="flex flex-col gap-3 border-b border-[var(--kura-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <PanelHeader
            className="mb-0"
            title="Holdings"
            description={`${visibleHoldings.length} position${visibleHoldings.length === 1 ? "" : "s"}`}
          />
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "all", label: "All" },
                { id: "etf", label: "ETF" },
                { id: "stock", label: "Stock" },
              ] as const
            ).map((item) => (
              <Chip
                key={item.id}
                active={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </Chip>
            ))}
          </div>
        </div>

        {visibleHoldings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
            <p className="text-sm text-[var(--kura-text-secondary)]">
              No holdings in this filter. Connect a brokerage to sync positions.
            </p>
            <Button size="sm" className="rounded-full" onClick={() => setIsConnectModalOpen(true)}>
              Connect account
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--kura-border)]">
            {visibleHoldings.map((holding) => {
              const isPositive = holding.change24h >= 0;
              return (
                <li key={holding.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                        {holding.logo ? (
                          <Image
                            src={holding.logo}
                            alt={holding.symbol}
                            width={36}
                            height={36}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold">
                            {(holding.symbol ?? "??").slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-[var(--kura-text)]">
                            {holding.symbol}
                          </p>
                          <Badge variant="outline">{holding.isEtf ? "ETF" : "Stock"}</Badge>
                        </div>
                        <p className="truncate text-[11px] text-[var(--kura-text-secondary)]">
                          {holding.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold tabular-nums text-[var(--kura-text)]">
                        {maskIfHidden(isBalanceHidden, formatCurrency(holding.marketValue))}
                      </p>
                      <p
                        className={`mt-0.5 text-[11px] font-medium tabular-nums ${
                          isPositive ? "text-[var(--kura-success)]" : "text-[var(--kura-error)]"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {formatPercent(holding.change24h)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <p className="text-[11px] text-[var(--kura-text-secondary)]">Price</p>
                      <p className="text-sm font-medium tabular-nums text-[var(--kura-text)]">
                        {maskIfHidden(isBalanceHidden, formatCurrency(holding.currentPrice))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[var(--kura-text-secondary)]">Units</p>
                      <p className="text-sm font-medium tabular-nums text-[var(--kura-text)]">
                        {maskIfHidden(isBalanceHidden, formatUnits(holding.holdings))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[var(--kura-text-secondary)]">Weight</p>
                      <p className="text-sm font-medium tabular-nums text-[var(--kura-text)]">
                        {maskIfHidden(isBalanceHidden, formatPercent(holding.portfolioPct))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[var(--kura-text-secondary)]">24h</p>
                      <p
                        className={`text-sm font-medium tabular-nums ${
                          isPositive ? "text-[var(--kura-success)]" : "text-[var(--kura-error)]"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {formatPercent(holding.change24h)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </DashboardPage>
  );
}
