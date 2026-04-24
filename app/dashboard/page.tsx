"use client";

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Area, AreaChart, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useFinanceStore } from '../store/useFinanceStore';

const ConnectAccountModal = dynamic(() => import('@/components/ConnectAccountModal'), {
  ssr: false,
});

export default function DashboardPage() {
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
      return curr.type === 'credit' ? acc - curr.balance : acc + curr.balance;
    }, 0);
  }, [accounts]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  useEffect(() => {
    hydrateAssetHistory(30);
  }, [hydrateAssetHistory]);

  const chartData = useMemo(() => {
    const sortedHistory = [...apiAssetHistory].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    if (sortedHistory.length === 0) return [];

    const firstTimestamp = new Date(sortedHistory[0].timestamp);
    const lastTimestamp = new Date(sortedHistory[sortedHistory.length - 1].timestamp);
    const isSameDay = firstTimestamp.toDateString() === lastTimestamp.toDateString();

    const formatLabel = (timestamp: string): string =>
      new Date(timestamp).toLocaleString(
        'en-US',
        isSameDay
          ? { hour: '2-digit', minute: '2-digit', hour12: false }
          : { month: 'short', day: 'numeric' },
      );

    const points = sortedHistory.map((point) => ({
      timestamp: point.timestamp,
      label: formatLabel(point.timestamp),
      value: point.value,
    }));

    const latestHistory = sortedHistory[sortedHistory.length - 1];
    const latestTimestampMs = new Date(latestHistory.timestamp).getTime();
    const hasSignificantDiff = Math.abs(latestHistory.value - totalBalance) > 0.01;

    // 若最新歷史點與當前總資產差距大，補一個「當前值」點避免圖表誤導。
    if (hasSignificantDiff) {
      const nextTimestampMs = latestTimestampMs + 60 * 1000;
      const nowIso = new Date(nextTimestampMs).toISOString();
      points.push({
        timestamp: nowIso,
        label: formatLabel(nowIso),
        value: totalBalance,
      });
    }

    return points;
  }, [apiAssetHistory, totalBalance]);

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
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
              {changePercent !== null && (
                <Badge variant={changePositive ? 'success' : 'destructive'}>
                  {changePositive ? '+' : ''}
                  {changePercent.toFixed(2)}% <span className="ml-1 opacity-70">30d</span>
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-100px)]">
            {isLoadingAssetHistory ? (
              <div className="w-full h-full rounded-xl bg-white/5 animate-pulse" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="totalAssetsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="rgba(255,255,255,0.3)" width={40} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0B0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelFormatter={(_, payload) => {
                      const rawTimestamp = payload?.[0]?.payload?.timestamp as string | undefined;
                      if (!rawTimestamp) return '';
                      return new Date(rawTimestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      });
                    }}
                    formatter={(value) => [`$${(value as number).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Total Assets']}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fill="url(#totalAssetsAreaGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#8B5CF6', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col justify-end gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Accounts</span>
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

                return (
                  <div key={account.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 gap-3">
                    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-white flex items-center justify-center overflow-hidden">
                      {account.logo ? (
                        <Image
                          src={account.logo}
                          alt={accountDisplayName}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-gray-900 text-xs font-bold">{accountTypeLabel.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{accountDisplayName}</p>
                    </div>
                    <p className={`font-mono font-medium text-sm ${account.type === 'credit' ? 'text-red-400' : 'text-green-400'}`}>
                      ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
        <Card className="min-h-[13.5rem] flex flex-col">
          <CardHeader>
            <CardDescription>Investment</CardDescription>
            <CardTitle className="text-2xl">$0.00</CardTitle>
            <CardDescription>Portfolio growth pending setup</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex-1 flex flex-col">
            <div className="h-24 mb-4 rounded-lg bg-white/[0.02] border border-white/5 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={placeholderWaveData}>
                  <XAxis dataKey="t" hide />
                  <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0B0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    formatter={(value) => [`$${(value as number).toFixed(2)}`, 'Assets']}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: '#8B5CF6', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <Button variant="secondary" className="w-full mt-auto">
              View Details
            </Button>
          </CardContent>
        </Card>

        <Card className="min-h-[13.5rem] flex flex-col">
          <CardHeader>
            <CardDescription>Crypto</CardDescription>
            <CardTitle className="text-2xl">$0.00</CardTitle>
            <CardDescription>Connect your Web3 wallet</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex-1 flex flex-col">
            <div className="h-24 mb-4 rounded-lg bg-white/[0.02] border border-white/5 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={placeholderWaveData}>
                  <XAxis dataKey="t" hide />
                  <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0B0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    formatter={(value) => [`$${(value as number).toFixed(2)}`, 'Assets']}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: '#8B5CF6', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <Button variant="secondary" className="w-full mt-auto">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>

        <Card className="min-h-[13.5rem] flex flex-col">
          <CardHeader>
            <CardDescription>DeFi Protocol</CardDescription>
            <CardTitle className="text-2xl">$0.00</CardTitle>
            <CardDescription>Track your DeFi positions</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex-1 flex flex-col">
            <div className="h-24 mb-4 rounded-lg bg-white/[0.02] border border-white/5 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={placeholderWaveData}>
                  <XAxis dataKey="t" hide />
                  <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0B0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    formatter={(value) => [`$${(value as number).toFixed(2)}`, 'Assets']}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: '#8B5CF6', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <Button variant="secondary" className="w-full mt-auto">
              Add Protocol
            </Button>
          </CardContent>
        </Card>
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
                <div key={transaction.id} className={`flex justify-between items-center py-3 ${index !== recentTransactions.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{transaction.merchant}</p>
                    <div className="flex gap-3 mt-1">
                      <p className="text-gray-500 text-xs">{transaction.category}</p>
                      <p className="text-gray-500 text-xs">{new Date(transaction.date).toLocaleDateString('en-US')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-medium text-sm ${transaction.type === 'credit' ? 'text-red-400' : 'text-green-400'}`}>
                      {transaction.type === 'credit' ? '-' : '+'} ${transaction.amount}
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
