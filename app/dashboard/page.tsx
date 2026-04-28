"use client";

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '../store/useAppStore';
import { useFinanceStore } from '../store/useFinanceStore';

const ConnectAccountModal = dynamic(() => import('@/components/ConnectAccountModal'), {
  ssr: false,
});

export default function DashboardPage() {
  const isBalanceHidden = useAppStore((state) => state.isBalanceHidden);
  const accounts = useFinanceStore((state) => state.accounts);
  const transactions = useFinanceStore((state) => state.transactions);
  const apiAssetHistory = useFinanceStore((state) => state.apiAssetHistory);
  const assetHistorySummary = useFinanceStore((state) => state.assetHistorySummary);
  const isLoadingAssetHistory = useFinanceStore((state) => state.isLoadingAssetHistory);
  const hydrateAssetHistory = useFinanceStore((state) => state.hydrateAssetHistory);

  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);

  const openConnectFlow = () => {
    setIsConnectModalOpen(true);
  };

  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, curr) => {
      const normalizedBalance = Number(curr.balance) || 0;
      const contribution =
        curr.type === 'credit'
          ? -Math.abs(normalizedBalance) // 信用卡一律視為負債，避免來源正負號不一致造成誤加總
          : normalizedBalance;
      return acc + contribution;
    }, 0);
  }, [accounts]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  useEffect(() => {
    hydrateAssetHistory(7);
  }, [hydrateAssetHistory]);

  const chartData = useMemo(() => {
    const toUtcDateKey = (timestamp: string): string => {
      const date = new Date(timestamp);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formatUtcDayLabel = (date: Date): string => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      });
    };

    // 先按時間排序，確保同一天取「最後一筆」作為該日收盤值（UTC 0）。
    const sortedHistory = [...apiAssetHistory].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const dailyValueByUtcDate = new Map<string, { value: number; timestamp: string }>();
    sortedHistory.forEach((point) => {
      dailyValueByUtcDate.set(toUtcDateKey(point.timestamp), {
        value: point.value,
        timestamp: point.timestamp,
      });
    });

    const now = new Date();
    const todayUtcMidnight = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    return Array.from({ length: 7 }, (_, index) => {
      const offsetFromToday = 6 - index;
      const day = new Date(todayUtcMidnight);
      day.setUTCDate(todayUtcMidnight.getUTCDate() - offsetFromToday);

      const dayKey = toUtcDateKey(day.toISOString());
      const existingPoint = dailyValueByUtcDate.get(dayKey);

      return {
        timestamp: existingPoint?.timestamp ?? day.toISOString(),
        label: formatUtcDayLabel(day),
        value: existingPoint?.value ?? 0,
      };
    });
  }, [apiAssetHistory]);

  const changePercent = assetHistorySummary?.changePercent ?? null;
  const changePositive = changePercent !== null && changePercent >= 0;
  const placeholderWaveData = useMemo(
    () => [
      { t: '1', value: 12 },
      { t: '2', value: 16 },
      { t: '3', value: 14 },
      { t: '4', value: 18 },
      { t: '5', value: 11 },
      { t: '6', value: 9 },
      { t: '7', value: 13 },
      { t: '8', value: 10 },
    ],
    [],
  );
  const miniCards = useMemo(
    () => [
      {
        key: 'investment',
        title: 'Investment',
        value: '$0.00',
        change: '+0.00%',
        changeVariant: 'success' as const,
        description: 'Portfolio growth pending setup',
        actionLabel: 'View Details',
        gradientId: 'investmentAreaGradient',
      },
      {
        key: 'crypto',
        title: 'Crypto',
        value: '$0.00',
        change: '-0.00%',
        changeVariant: 'destructive' as const,
        description: 'Connect your Web3 wallet',
        actionLabel: 'Connect Wallet',
        gradientId: 'cryptoAreaGradient',
      },
      {
        key: 'defi',
        title: 'DeFi Protocol',
        value: '$0.00',
        change: '+0.00%',
        changeVariant: 'success' as const,
        description: 'Track your DeFi positions',
        actionLabel: 'Add Protocol',
        gradientId: 'defiAreaGradient',
      },
    ],
    [],
  );

  const maskAmount = (amountText: string): string => {
    return isBalanceHidden ? '••••••' : amountText;
  };

  return (
    <div className="w-full pb-24 px-6 sm:px-10 lg:px-16 pt-0 max-w-7xl mx-auto">
      {isConnectModalOpen && (
        <ConnectAccountModal isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)} />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4 mb-6 w-full">
        <Card className="h-[26rem]">
          <CardHeader className="pb-3">
            <CardDescription className="text-sm">Total Assets</CardDescription>
            <div className="flex items-baseline gap-3 flex-wrap">
              <CardTitle className="text-2xl md:text-3xl xl:text-4xl">
                {maskAmount(`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}
              </CardTitle>
              {changePercent !== null && (
                <Badge variant={changePositive ? 'success' : 'destructive'}>
                  {changePositive ? '+' : ''}
                  {changePercent.toFixed(2)}% <span className="ml-1 opacity-70">7d</span>
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-100px)]">
            {isLoadingAssetHistory ? (
              <div className="w-full h-full rounded-xl bg-[var(--kura-border-light)] animate-pulse" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="totalAssetsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--kura-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--kura-primary)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="var(--kura-text-secondary)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="var(--kura-text-secondary)" width={40} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--kura-bg-light)',
                      border: '1px solid var(--kura-border)',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(_, payload) => {
                      const rawTimestamp = payload?.[0]?.payload?.timestamp as string | undefined;
                      if (!rawTimestamp) return '';
                      return `${new Date(rawTimestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'UTC',
                      })} UTC`;
                    }}
                    formatter={(value) => [
                      isBalanceHidden ? '••••••' : `$${(value as number).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                      'Total Assets',
                    ]}
                    labelStyle={{ color: 'var(--kura-text-secondary)', fontSize: '11px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--kura-primary)"
                    strokeWidth={2}
                    fill="url(#totalAssetsAreaGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: 'var(--kura-primary)', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col justify-end gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--kura-text-secondary)]">Total Accounts</span>
                  <span className="font-medium">{accounts.length}</span>
                </div>
                <Button onClick={openConnectFlow} className="w-full">
                  Connect Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-[26rem] flex flex-col">
          <CardHeader className="pb-3">
            <CardDescription className="text-sm">Accounts</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto hide-scrollbar">
            <div className="space-y-2">
              {accounts.map((account) => {
                const typeLabel: Record<string, string> = {
                  checking: 'Checking',
                  saving: 'Savings',
                  credit: 'Credit Card',
                  crypto: 'Crypto',
                };
                const accountTypeLabel = typeLabel[account.type] ?? account.type;
                const accountDisplayName = account.mask ? `${accountTypeLabel} ••••${account.mask}` : accountTypeLabel;
                const normalizedBalance = Math.abs(Number(account.balance) || 0);
                const displayBalance = account.type === 'credit'
                  ? `-$${normalizedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `$${normalizedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                return (
                  <div key={account.id} className="flex justify-between items-center py-2 border-b border-[var(--kura-border-light)] last:border-0 gap-3">
                    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-white flex items-center justify-center overflow-hidden">
                      {account.logo ? (
                        <Image
                          src={account.logo}
                          alt={accountDisplayName}
                          width={32}
                          height={32}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-[var(--kura-text)] text-xs font-bold">{accountTypeLabel.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{accountDisplayName}</p>
                    </div>
                    <p className={`font-mono font-medium text-sm ${account.type === 'credit' ? 'text-red-400' : 'text-green-400'}`}>
                      {maskAmount(displayBalance)}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <Separator className="mb-3" />
            <Button onClick={openConnectFlow} className="w-full">
              Connect Account
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 w-full">
        {miniCards.map((card) => (
          <Card key={card.key} className="min-h-[13.5rem] flex flex-col">
            <CardHeader className="pb-3">
              <CardDescription>{card.title}</CardDescription>
              <div className="flex items-baseline gap-3 flex-wrap">
                <CardTitle className="text-2xl">{maskAmount(card.value)}</CardTitle>
                <Badge variant={card.changeVariant}>
                  {isBalanceHidden ? '••••' : card.change} <span className="ml-1 opacity-70">30d</span>
                </Badge>
              </div>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col">
              <div className="h-24 mb-4 rounded-lg bg-[var(--kura-border-light)] border border-[var(--kura-border)] p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={placeholderWaveData}>
                    <defs>
                      <linearGradient id={card.gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--kura-primary)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--kura-primary)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="t" hide />
                    <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--kura-bg-light)',
                        border: '1px solid var(--kura-border)',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [isBalanceHidden ? '••••••' : `$${(value as number).toFixed(2)}`, card.title]}
                      labelStyle={{ color: 'var(--kura-text-secondary)', fontSize: '11px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--kura-primary)"
                      strokeWidth={2}
                      fill={`url(#${card.gradientId})`}
                      dot={false}
                      activeDot={{ r: 3, fill: 'var(--kura-primary)', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <Button variant="secondary" className="w-full mt-auto">
                {card.actionLabel}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-0">
              {recentTransactions.map((transaction, index) => (
                <div key={transaction.id} className={`flex justify-between items-center py-3 ${index !== recentTransactions.length - 1 ? 'border-b border-[var(--kura-border-light)]' : ''}`}>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{transaction.merchant}</p>
                    <div className="flex gap-3 mt-1">
                      <p className="text-gray-500 text-xs">{transaction.category}</p>
                      <p className="text-gray-500 text-xs">{new Date(transaction.date).toLocaleDateString('en-US')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-medium text-sm ${transaction.type === 'credit' ? 'text-red-400' : 'text-green-400'}`}>
                      {maskAmount(`${transaction.type === 'credit' ? '-' : '+'} $${transaction.amount}`)}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{transaction.accountName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
