"use client";

import React, { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinanceStore, type Investment } from '@/store/useFinanceStore';
import { useAppStore } from '@/store/useAppStore';

const PIE_COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#f59e0b', '#fb7185', '#22d3ee', '#f97316', '#818cf8'];

const KNOWN_ETF_SYMBOLS = new Set([
  'SPY',
  'VOO',
  'QQQ',
  'VTI',
  'IVV',
  'DIA',
  'IWM',
  'XLK',
  'XLF',
  'ARKK',
  'EEM',
  'GLD',
  'TLT',
]);

type HoldingWithMetrics = Investment & {
  marketValue: number;
  portfolioPct: number;
  isEtf: boolean;
};

function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatUnits(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 6 });
}

function isLikelyEtf(holding: Investment): boolean {
  if (holding.type === 'etf') return true;
  if (holding.type !== 'stock') return false;

  const symbol = (holding.symbol ?? '').toUpperCase();
  const name = (holding.name ?? '').toUpperCase();
  return KNOWN_ETF_SYMBOLS.has(symbol) || /\bETF\b/.test(name) || /\bINDEX\b/.test(name);
}

function maskIfHidden(hidden: boolean, value: string): string {
  return hidden ? '••••••' : value;
}

function HoldingSection({
  title,
  holdings,
  totalValue,
  isBalanceHidden,
}: {
  title: 'ETF' | 'Stock';
  holdings: HoldingWithMetrics[];
  totalValue: number;
  isBalanceHidden: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{holdings.length} Positions</CardDescription>
        </div>
        <CardDescription>Total {maskIfHidden(isBalanceHidden, formatCurrency(totalValue))}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {holdings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--kura-border)] px-4 py-8 text-sm text-[var(--kura-text-secondary)] text-center">
            No {title} positions yet.
          </div>
        ) : (
          holdings.map((holding) => {
            const isPositive = holding.change24h >= 0;
            return (
              <div
                key={holding.id}
                className="rounded-xl border border-[var(--kura-border)] bg-[var(--kura-surface)] px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-white overflow-hidden flex items-center justify-center shrink-0">
                      {holding.logo ? (
                        <Image
                          src={holding.logo}
                          alt={holding.symbol}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold">{(holding.symbol ?? '??').slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{holding.symbol}</p>
                      <p className="text-xs text-[var(--kura-text-secondary)] truncate">{holding.name}</p>
                    </div>
                  </div>
                  <Badge variant={isPositive ? 'success' : 'destructive'}>
                    {isPositive ? '+' : ''}
                    {formatPercent(holding.change24h)}
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-[11px] text-[var(--kura-text-secondary)]">Current Price</p>
                    <p className="text-sm font-medium">{maskIfHidden(isBalanceHidden, formatCurrency(holding.currentPrice))}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[var(--kura-text-secondary)]">Units</p>
                    <p className="text-sm font-medium">{maskIfHidden(isBalanceHidden, formatUnits(holding.holdings))}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[var(--kura-text-secondary)]">24h Change</p>
                    <p className={`text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}
                      {formatPercent(holding.change24h)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[var(--kura-text-secondary)]">Portfolio %</p>
                    <p className="text-sm font-medium">{maskIfHidden(isBalanceHidden, formatPercent(holding.portfolioPct))}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default function InvestmentPage() {
  const investments = useFinanceStore((state) => state.investments);
  const apiAssetHistory = useFinanceStore((state) => state.apiAssetHistory);
  const isLoadingAssetHistory = useFinanceStore((state) => state.isLoadingAssetHistory);
  const hydrateAssetHistory = useFinanceStore((state) => state.hydrateAssetHistory);
  const isBalanceHidden = useAppStore((state) => state.isBalanceHidden);

  useEffect(() => {
    hydrateAssetHistory(30);
  }, [hydrateAssetHistory]);

  const { holdings, totalValue } = useMemo(() => {
    const equityHoldings = investments.filter(
      (holding) => holding.type === 'stock' || holding.type === 'etf',
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

    return {
      holdings: normalizedHoldings,
      totalValue: rawValue,
    };
  }, [investments]);

  const etfHoldings = useMemo(() => holdings.filter((holding) => holding.isEtf), [holdings]);
  const stockHoldings = useMemo(() => holdings.filter((holding) => !holding.isEtf), [holdings]);

  const pieData = useMemo(
    () =>
      holdings.map((holding) => ({
        name: holding.symbol,
        value: holding.marketValue,
        pct: holding.portfolioPct,
      })),
    [holdings],
  );

  const etfTotal = useMemo(
    () => etfHoldings.reduce((sum, holding) => sum + holding.marketValue, 0),
    [etfHoldings],
  );
  const stockTotal = useMemo(
    () => stockHoldings.reduce((sum, holding) => sum + holding.marketValue, 0),
    [stockHoldings],
  );
  const trendData = useMemo(() => {
    const toSafeNumber = (value: unknown): number => {
      return typeof value === 'number' && Number.isFinite(value) ? value : 0;
    };

    return [...apiAssetHistory]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((point) => ({
        value:
          toSafeNumber(point.plaidInvestment) +
          toSafeNumber(point.cryptoSpot) +
          toSafeNumber(point.defiProtocol),
        label: new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }));
  }, [apiAssetHistory]);

  return (
    <div className="w-full pb-24 px-6 sm:px-10 lg:px-16 pt-0 max-w-7xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Investment Allocation</CardTitle>
          <CardDescription>Portfolio by holding weight</CardDescription>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 || totalValue <= 0 ? (
            <div className="h-72 rounded-xl border border-dashed border-[var(--kura-border)] flex items-center justify-center text-sm text-[var(--kura-text-secondary)]">
              No stock or ETF holdings available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
              <div className="relative h-72 xl:col-span-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={68}
                      outerRadius={110}
                      paddingAngle={2}
                      stroke="var(--kura-surface)"
                      strokeWidth={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--kura-bg-light)',
                        border: '1px solid var(--kura-border)',
                        borderRadius: '8px',
                      }}
                      formatter={(value, name, props) => {
                        const percentage = props?.payload?.pct as number | undefined;
                        const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                        const amount = maskIfHidden(isBalanceHidden, formatCurrency(numericValue));
                        return [percentage ? `${amount} (${formatPercent(percentage)})` : amount, name ?? 'Holding'];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs text-[var(--kura-text-secondary)]">Total Value</p>
                    <p className="text-lg font-semibold">
                      {maskIfHidden(isBalanceHidden, formatCurrency(totalValue))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-72 xl:col-span-6 rounded-xl border border-[var(--kura-border)] p-3">
                {isLoadingAssetHistory ? (
                  <div className="w-full h-full rounded-lg bg-[var(--kura-border-light)] animate-pulse" />
                ) : trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 18, left: 0, bottom: 4 }}>
                      <defs>
                        <linearGradient id="investmentTrendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--kura-primary)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="var(--kura-primary)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" stroke="var(--kura-text-secondary)" tick={{ fontSize: 12 }} />
                      <YAxis stroke="var(--kura-text-secondary)" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--kura-bg-light)',
                          border: '1px solid var(--kura-border)',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [maskIfHidden(isBalanceHidden, formatCurrency(Number(value ?? 0))), 'Assets']}
                        labelStyle={{ color: 'var(--kura-text-secondary)', fontSize: '11px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="var(--kura-primary)"
                        strokeWidth={2}
                        fill="url(#investmentTrendAreaGradient)"
                        dot={false}
                        activeDot={{ r: 3, fill: 'var(--kura-primary)', strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full rounded-lg border border-dashed border-[var(--kura-border)] flex items-center justify-center text-sm text-[var(--kura-text-secondary)]">
                    No trend data available.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <HoldingSection
          title="ETF"
          holdings={etfHoldings}
          totalValue={etfTotal}
          isBalanceHidden={isBalanceHidden}
        />
        <HoldingSection
          title="Stock"
          holdings={stockHoldings}
          totalValue={stockTotal}
          isBalanceHidden={isBalanceHidden}
        />
      </div>
    </div>
  );
}
