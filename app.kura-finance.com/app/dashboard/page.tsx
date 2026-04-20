// src/app/dashboard/page.tsx
"use client";

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useFinanceStore } from '../store/useFinanceStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ConnectAccountModal = dynamic(() => import('@/components/ConnectAccountModal'), {
  ssr: false,
});

export default function DashboardPage() {
  const accounts = useFinanceStore(state => state.accounts);
  const transactions = useFinanceStore(state => state.transactions);
  const assetHistory = useFinanceStore(state => state.assetHistory);

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

  // Format asset history for chart
  const chartData = useMemo(() => {
    return assetHistory.map(snapshot => ({
      time: new Date(snapshot.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: snapshot.totalAssets,
    }));
  }, [assetHistory]);

  return (
    <div className="w-full pb-8 px-8 pt-8 max-w-6xl mx-auto">
      {isConnectModalOpen && (
        <ConnectAccountModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
        />
      )}

      {/* Top Section - Total Assets & Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 w-full mx-2">
        
        {/* Total Assets Card */}
        <div className="rounded-2xl bg-[#1A1A24] border border-white/5 p-4 flex flex-col justify-between h-48 w-full">
          <div>
            <p className="text-gray-400 text-xs font-medium mb-1">Total Assets</p>
            <h2 className="text-2xl font-bold text-white">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </div>
          
          {/* Chart */}
          {chartData.length > 0 ? (
            <div className="h-20 -mx-8 -mb-8 flex items-end">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
                  <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} width={40} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0B0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    formatter={(value) => `$${(value as number).toFixed(2)}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="space-y-1 mt-auto">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Accounts</span>
                <span className="text-white font-medium">{accounts.length}</span>
              </div>
              <button
                onClick={openConnectFlow}
                className="w-full mt-2 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white text-sm font-medium transition-colors"
              >
                Connect Account
              </button>
            </div>
          )}
        </div>

        {/* Accounts Card */}
        <div className="rounded-2xl bg-[#1A1A24] border border-white/5 p-4 flex flex-col justify-between h-48 overflow-y-auto w-full">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-2">Accounts</p>
            <div className="space-y-1">
              {accounts.map((account) => (
                <div key={account.id} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-white font-medium text-sm">{account.name}</p>
                    <p className="text-gray-500 text-xs">{account.type}</p>
                  </div>
                  <p className={`font-mono font-medium ${account.type === 'credit' ? 'text-red-400' : 'text-green-400'}`}>
                    ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/5">
            <button
              onClick={openConnectFlow}
              className="w-full py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white text-sm font-medium transition-colors"
            >
              Connect Account
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Section - Investment, Crypto, DeFi Protocol */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 w-full mx-2">
        
        {/* Investment Card */}
        <div className="rounded-2xl bg-[#1A1A24] border border-white/5 p-4 flex flex-col justify-between h-40 w-full">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Investment</p>
            <h3 className="text-2xl font-bold text-white mb-2">$0.00</h3>
            <p className="text-gray-500 text-xs">Portfolio growth pending setup</p>
          </div>
          <button className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-medium transition-colors">
            View Details
          </button>
        </div>

        {/* Crypto Card */}
        <div className="rounded-2xl bg-[#1A1A24] border border-white/5 p-4 flex flex-col justify-between h-40 w-full">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Crypto</p>
            <h3 className="text-2xl font-bold text-white mb-2">$0.00</h3>
            <p className="text-gray-500 text-xs">Connect your Web3 wallet</p>
          </div>
          <button className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-medium transition-colors">
            Connect Wallet
          </button>
        </div>

        {/* DeFi Protocol Card */}
        <div className="rounded-2xl bg-[#1A1A24] border border-white/5 p-4 flex flex-col justify-between h-40 w-full">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">DeFi Protocol</p>
            <h3 className="text-2xl font-bold text-white mb-2">$0.00</h3>
            <p className="text-gray-500 text-xs">Track your DeFi positions</p>
          </div>
          <button className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-medium transition-colors">
            Add Protocol
          </button>
        </div>

      </div>

      {/* Recent Transactions Section */}
      <div className="w-full">
        <div className="rounded-2xl bg-[#1A1A24] border border-white/5 p-4 w-full mx-2">
          <h3 className="text-lg font-bold text-white mb-3">Recent Transactions</h3>
          
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-0">
              {recentTransactions.map((transaction, index) => (
                <div key={transaction.id} className={`flex justify-between items-center py-2 ${index !== recentTransactions.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{transaction.merchant}</p>
                    <div className="flex gap-3 mt-0.5">
                      <p className="text-gray-500 text-xs">{transaction.category}</p>
                      <p className="text-gray-500 text-xs">{new Date(transaction.date).toLocaleDateString('en-US')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-medium text-sm ${transaction.type === 'credit' ? 'text-red-400' : 'text-green-400'}`}>
                      {transaction.type === 'credit' ? '-' : '+'} ${transaction.amount}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">{transaction.accountName}</p>
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