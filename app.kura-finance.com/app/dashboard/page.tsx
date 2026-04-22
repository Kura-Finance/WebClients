// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useFinanceStore } from '../store/useFinanceStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ConnectAccountModal = dynamic(() => import('@/components/ConnectAccountModal'), {
  ssr: false,
});

export default function DashboardPage() {
  const accounts = useFinanceStore(state => state.accounts);
  const transactions = useFinanceStore(state => state.transactions);
  const apiAssetHistory = useFinanceStore(state => state.apiAssetHistory);
  const assetHistorySummary = useFinanceStore(state => state.assetHistorySummary);
  const isLoadingAssetHistory = useFinanceStore(state => state.isLoadingAssetHistory);
  const hydrateAssetHistory = useFinanceStore(state => state.hydrateAssetHistory);

  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);

  const openConnectFlow = () => {
    setIsConnectModalOpen(true);
  };

  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, curr) => {
      return curr.type === 'credit' ? acc - curr.balance : acc + curr.balance;
    }, 0);
  }, [accounts]);

  // Get recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Fetch asset history from API on mount
  useEffect(() => {
    hydrateAssetHistory(30);
  }, [hydrateAssetHistory]);

  // Format API asset history for chart
  const chartData = useMemo(() => {
    return apiAssetHistory.map(point => ({
      time: new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: point.value,
    }));
  }, [apiAssetHistory]);

  const changePercent = assetHistorySummary?.changePercent ?? null;
  const changePositive = changePercent !== null && changePercent >= 0;

  return (
    <div className="w-full pb-24 px-12 sm:px-[72px] lg:px-24 pt-24 max-w-7xl mx-auto">
      {isConnectModalOpen && (
        <ConnectAccountModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
        />
      )}

      {/* Top Section - Total Assets & Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 lg:mb-6 w-full">
        
        {/* Total Assets Card */}
        <div className="rounded-2xl bg-[#1A1A24] border border-white/5 p-3 sm:p-4 lg:p-5 flex flex-col justify-between h-[30vh] min-h-[200px] max-h-[340px] w-full">
          <div>
            <p className="text-gray-400 text-[11px] sm:text-xs lg:text-sm font-medium mb-1.5 sm:mb-2">Total Assets</p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
              {changePercent !== null && (
                <span className={`text-xs sm:text-sm font-semibold px-2 py-0.5 rounded-full ${
                  changePositive
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-red-500/15 text-red-400'
                }`}>
                  {changePositive ? '+' : ''}{changePercent.toFixed(2)}% <span className="font-normal opacity-70">30d</span>
                </span>
              )}
            </div>
          </div>
          
          {/* Chart */}
          {isLoadingAssetHistory ? (
            <div className="flex-1 flex items-end mt-1.5 sm:mt-2 min-h-[80px]">
              <div className="w-full h-full rounded-xl bg-white/5 animate-pulse" />
            </div>
          ) : chartData.length > 0 ? (
            <div className="flex-1 -mx-3 sm:-mx-4 lg:-mx-5 -mb-3 sm:-mb-4 lg:-mb-5 flex items-end mt-1.5 sm:mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" style={{ fontSize: 'clamp(10px, 2vw, 12px)' }} tick={{ fontSize: 'clamp(10px, 2vw, 12px)' }} />
                  <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: 'clamp(10px, 2vw, 12px)' }} width={40} tick={{ fontSize: 'clamp(10px, 2vw, 12px)' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0B0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    formatter={(value) => [`$${(value as number).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, '總資產']}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#8B5CF6', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3 mt-auto">
              <div className="flex justify-between text-xs sm:text-sm lg:text-base">
                <span className="text-gray-500">Total Accounts</span>
                <span className="text-white font-medium">{accounts.length}</span>
              </div>
              <button
                onClick={openConnectFlow}
                className="w-full py-2 sm:py-2.5 rounded-lg bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white text-xs sm:text-sm font-medium transition-colors"
              >
                Connect Account
              </button>
            </div>
          )}
        </div>

        {/* Accounts Card */}
        <div className="rounded-2xl bg-[#1A1A24] border border-white/5 p-3 sm:p-4 lg:p-5 flex flex-col justify-between h-[30vh] min-h-[200px] max-h-[340px] overflow-y-auto w-full">
          <div>
            <p className="text-gray-400 text-[11px] sm:text-xs lg:text-sm font-medium mb-1.5 sm:mb-2">Accounts</p>
            <div className="space-y-1 sm:space-y-2">
              {accounts.map((account) => {
                const typeLabel: Record<string, string> = {
                  checking: 'Checking',
                  saving: 'Savings',
                  credit: 'Credit Card',
                  crypto: 'Crypto',
                };
                const accountTypeLabel = typeLabel[account.type] ?? account.type;
                const accountDisplayName = account.mask
                  ? `${accountTypeLabel} ••••${account.mask}`
                  : accountTypeLabel;

                return (
                  <div key={account.id} className="flex justify-between items-center py-2 sm:py-2.5 border-b border-white/5 last:border-0 gap-2">
                    {/* Account Logo or Initial */}
                    <div className="w-7 sm:w-8 h-7 sm:h-8 flex-shrink-0 rounded-full bg-white flex items-center justify-center overflow-hidden">
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
                      ) : null}
                      {!account.logo && (
                        <span className="text-gray-900 text-[10px] sm:text-xs font-bold">
                          {accountTypeLabel.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* Account Type + Mask and Balance */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-xs sm:text-sm truncate">{accountDisplayName}</p>
                    </div>
                    <p className={`font-mono font-medium text-xs sm:text-sm flex-shrink-0 ${account.type === 'credit' ? 'text-red-400' : 'text-green-400'}`}>
                      ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 border-t border-white/5">
            <button
              onClick={openConnectFlow}
              className="w-full py-1.5 sm:py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white text-[11px] sm:text-xs font-medium transition-colors"
            >
              Connect Account
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Section - Investment, Crypto, DeFi Protocol */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 w-full">
        
        {/* Investment Card */}
        <div className="relative aspect-square w-full">
          <div className="absolute inset-0 rounded-2xl bg-[#1A1A24] border border-white/5 p-3 sm:p-4 lg:p-5 flex flex-col justify-between">
            <div>
              <p className="text-gray-400 text-[11px] sm:text-xs lg:text-sm font-medium mb-1.5 sm:mb-2">Investment</p>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1.5 sm:mb-2">$0.00</h3>
              <p className="text-gray-500 text-[11px] sm:text-xs">Portfolio growth pending setup</p>
            </div>
            <button className="w-full py-1.5 sm:py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[11px] sm:text-xs font-medium transition-colors">
              View Details
            </button>
          </div>
        </div>

        {/* Crypto Card */}
        <div className="relative aspect-square w-full">
          <div className="absolute inset-0 rounded-2xl bg-[#1A1A24] border border-white/5 p-3 sm:p-4 lg:p-5 flex flex-col justify-between">
            <div>
              <p className="text-gray-400 text-[11px] sm:text-xs lg:text-sm font-medium mb-1.5 sm:mb-2">Crypto</p>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1.5 sm:mb-2">$0.00</h3>
              <p className="text-gray-500 text-[11px] sm:text-xs">Connect your Web3 wallet</p>
            </div>
            <button className="w-full py-1.5 sm:py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[11px] sm:text-xs font-medium transition-colors">
              Connect Wallet
            </button>
          </div>
        </div>

        {/* DeFi Protocol Card */}
        <div className="relative aspect-square w-full">
          <div className="absolute inset-0 rounded-2xl bg-[#1A1A24] border border-white/5 p-3 sm:p-4 lg:p-5 flex flex-col justify-between">
            <div>
              <p className="text-gray-400 text-[11px] sm:text-xs lg:text-sm font-medium mb-1.5 sm:mb-2">DeFi Protocol</p>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1.5 sm:mb-2">$0.00</h3>
              <p className="text-gray-500 text-[11px] sm:text-xs">Track your DeFi positions</p>
            </div>
            <button className="w-full py-1.5 sm:py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[11px] sm:text-xs font-medium transition-colors">
              Add Protocol
            </button>
          </div>
        </div>

      </div>

      {/* Recent Transactions Section */}
      <div className="w-full">
        <div className="rounded-2xl bg-[#1A1A24] border border-white/5 p-4 sm:p-5 lg:p-6 w-full">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4">Recent Transactions</h3>
          
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-xs sm:text-sm text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-0">
              {recentTransactions.map((transaction, index) => (
                <div key={transaction.id} className={`flex justify-between items-center py-2 sm:py-3 ${index !== recentTransactions.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <div className="flex-1">
                    <p className="text-white font-medium text-xs sm:text-sm">{transaction.merchant}</p>
                    <div className="flex gap-2 sm:gap-3 mt-1">
                      <p className="text-gray-500 text-xs">{transaction.category}</p>
                      <p className="text-gray-500 text-xs">{new Date(transaction.date).toLocaleDateString('en-US')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-medium text-xs sm:text-sm ${transaction.type === 'credit' ? 'text-red-400' : 'text-green-400'}`}>
                      {transaction.type === 'credit' ? '-' : '+'} ${transaction.amount}
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">{transaction.accountName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}