"use client";

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    return apiAssetHistory.map((point) => ({
      time: new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: point.value,
    }));
  }, [apiAssetHistory]);

  const changePercent = assetHistorySummary?.changePercent ?? null;
  const changePositive = changePercent !== null && changePercent >= 0;

  return (
    <div className="w-full pb-24 px-6 sm:px-10 lg:px-16 pt-0 max-w-7xl mx-auto">
      {isConnectModalOpen && (
        <ConnectAccountModal isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 w-full">
        <Card className="h-[40vh] min-h-[267px] max-h-[453px]">
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
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="rgba(255,255,255,0.3)" width={40} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0B0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    formatter={(value) => [`$${(value as number).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Total Assets']}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#8B5CF6', strokeWidth: 0 }} />
                </LineChart>
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

        <Card className="h-[40vh] min-h-[267px] max-h-[453px] flex flex-col">
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
        <Card className="aspect-square">
          <CardHeader>
            <CardDescription>Investment</CardDescription>
            <CardTitle className="text-2xl">$0.00</CardTitle>
            <CardDescription>Portfolio growth pending setup</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button variant="secondary" className="w-full">
              View Details
            </Button>
          </CardContent>
        </Card>

        <Card className="aspect-square">
          <CardHeader>
            <CardDescription>Crypto</CardDescription>
            <CardTitle className="text-2xl">$0.00</CardTitle>
            <CardDescription>Connect your Web3 wallet</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button variant="secondary" className="w-full">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>

        <Card className="aspect-square">
          <CardHeader>
            <CardDescription>DeFi Protocol</CardDescription>
            <CardTitle className="text-2xl">$0.00</CardTitle>
            <CardDescription>Track your DeFi positions</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button variant="secondary" className="w-full">
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
