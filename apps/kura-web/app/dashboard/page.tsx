// src/app/dashboard/page.tsx
"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import AccountCarousel from './_components/AccountCarousel';
import TransactionsModal from './_components/TransactionsModal';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAppStore } from '@/store/useAppStore';
import { updatePlaidAccountOrder } from '../lib/backendApi';

const ConnectAccountModal = dynamic(() => import('@/components/ConnectAccountModal'), {
  ssr: false,
});
const AuthModal = dynamic(() => import('@/components/AuthModal'), {
  ssr: false,
});

export default function DashboardPage() {
  const accounts = useFinanceStore(state => state.accounts);
  const setAccounts = useFinanceStore(state => state.setAccounts);
  const transactions = useFinanceStore(state => state.transactions);
  const isAiEnabled = useFinanceStore(state => state.isAiOptedIn);
  const toggleAiOptIn = useFinanceStore(state => state.toggleAiOptIn);
  const aiInsights = useAppStore(state => state.aiInsights);
  const messages = useAppStore(state => state.chatMessages);
  const addChatMessage = useAppStore(state => state.addChatMessage);
  const authStatus = useAppStore(state => state.authStatus);
  const authToken = useAppStore(state => state.authToken);

  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState('');

  const openConnectFlow = () => {
    if (authStatus === 'authenticated') {
      setIsConnectModalOpen(true);
      return;
    }

    setIsAuthModalOpen(true);
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, curr) => {
      return curr.type === 'credit' ? acc - curr.balance : acc + curr.balance;
    }, 0);
  }, [accounts]);

  const selectedAccount = selectedAccountId === 'all' 
    ? { id: 'all', type: 'all', name: 'All Accounts' } 
    : accounts.find(a => a.id === selectedAccountId);

  const transactionHeader = selectedAccount?.type === 'all'
    ? 'Recent Transactions'
    : selectedAccount?.type === 'credit'
      ? 'Transaction History'
      : selectedAccount?.type === 'saving'
        ? 'Savings Transactions'
        : 'Transfer Records';

  // 核心邏輯：根據選中的帳戶過濾交易資料
  const displayTransactions = useMemo(() => {
    if (selectedAccountId === 'all') return transactions;
    return transactions.filter(tx => tx.accountId === selectedAccountId);
  }, [transactions, selectedAccountId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isChatOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newUserMsg = { id: Date.now().toString(), role: 'user' as const, content: inputText };
    addChatMessage(newUserMsg);
    setInputText('');
  };

  const handleAccountsReorder = async (nextAccounts: typeof accounts) => {
    setAccounts(nextAccounts);

    if (authStatus !== 'authenticated' || !authToken) {
      return;
    }

    try {
      await updatePlaidAccountOrder(authToken, {
        accountIds: nextAccounts.map((account) => account.id),
      });
    } catch (error) {
      console.error('Failed to persist account order', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {isConnectModalOpen && (
        <ConnectAccountModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
        />
      )}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthenticated={() => setIsConnectModalOpen(true)}
        />
      )}

      <div className="mb-4">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Here is the summary of your fiat assets.</p>
      </div>
      
      <AccountCarousel 
        accounts={accounts}
        totalBalance={totalBalance}
        selectedId={selectedAccountId}
        onAccountSelect={(id) => setSelectedAccountId(id)}
        onConnectAccount={openConnectFlow}
        onAccountsReorder={(nextAccounts) => void handleAccountsReorder(nextAccounts)}
      />

      <div className="mt-4">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-xl font-bold text-white">Activity</h2>
          
          <div className="flex items-center gap-3 bg-[#1A1A24] px-4 py-2 rounded-full border border-white/5 shadow-sm">
            <span className={`text-sm font-medium transition-colors ${isAiEnabled ? 'text-[#A78BFA]' : 'text-gray-400'}`}>
              ✨ Kura AI Insights
            </span>
            <button
              onClick={() => {
                toggleAiOptIn();
                if (isChatOpen) setIsChatOpen(false);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                isAiEnabled ? 'bg-[#8B5CF6]' : 'bg-[#0B0B0F] border border-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300 shadow-md ${isAiEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-6 transition-all duration-500 ${isAiEnabled ? 'lg:grid-cols-3' : ''}`}>
          
          <div className={`rounded-3xl bg-[#1A1A24] border border-white/5 p-8 ${isAiEnabled ? 'lg:col-span-2' : 'col-span-1'} flex flex-col h-[400px]`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">
                {transactionHeader}
              </h3>
              <span className="text-xs font-mono text-[#A78BFA] bg-[#8B5CF6]/10 px-3 py-1 rounded-full uppercase">
                Plaid Real-time
              </span>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto overflow-x-hidden pr-2 hide-scrollbar">
              {displayTransactions.slice(0, 4).map((tx) => {
                const isExpense = tx.type === 'credit' || tx.type === 'transfer';
                return (
                  <div key={tx.id} className="flex w-full min-w-0 justify-between items-center py-3 border-b border-white/5 last:border-0 text-gray-400 group hover:bg-white/[0.02] px-3 rounded-xl transition-colors">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#0B0B0F] flex items-center justify-center border border-white/5 group-hover:border-[#8B5CF6]/30 transition-colors">
                        {tx.type === 'deposit' ? '💰' : tx.type === 'transfer' ? '🔄' : '🛍️'}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-white font-medium group-hover:text-[#A78BFA] transition-colors">{tx.merchant}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{tx.date}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-700" />
                          <span className={`rounded-full px-2 py-0.5 uppercase tracking-wider ${tx.accountType === 'saving' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/5 text-gray-400'}`}>
                            {tx.accountType === 'saving' ? 'Savings' : tx.accountType === 'checking' ? 'Checking' : tx.accountType === 'credit' ? 'Credit' : 'Crypto'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`shrink-0 pl-3 font-mono font-medium ${isExpense ? 'text-white' : 'text-green-400'}`}>
                      {isExpense ? '-' : '+'}${tx.amount}
                    </div>
                  </div>
                );
              })}
              
              {displayTransactions.length === 0 && (
                <div className="flex h-full items-center justify-center text-gray-500 italic">
                  No recent activity found.
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-6 py-3.5 rounded-xl border border-white/5 bg-[#0B0B0F]/50 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.05] hover:border-white/10 transition-all flex items-center justify-center gap-2 group cursor-pointer shrink-0"
            >
              View All Activity
              <span className="group-hover:translate-x-1 transition-transform text-[#8B5CF6]">→</span>
            </button>
          </div>

          {isAiEnabled && (
            <div className="lg:col-span-1 rounded-3xl bg-gradient-to-br from-[#1A1A24] to-[#0B0B0F] border border-[#8B5CF6]/20 shadow-[0_0_30px_rgba(139,92,246,0.1)] relative overflow-hidden h-[400px] flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/10 blur-3xl rounded-full pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {!isChatOpen ? (
                  <motion.div key="insights" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex flex-col h-full p-8">
                    <div className="flex items-center gap-3 mb-6 relative z-10 shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center shadow-lg">
                        <span className="text-sm">✨</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">AI Analysis</h3>
                    </div>
                    <div className="space-y-6 relative z-10 flex-1 overflow-y-auto pr-2 hide-scrollbar">
                      {aiInsights.length > 0 ? (
                        aiInsights.map((insight, index) => (
                          <React.Fragment key={insight.id}>
                            <div>
                              <div className="text-xs text-[#A78BFA] font-bold uppercase tracking-wider mb-2">{insight.title}</div>
                              <p className="text-sm text-gray-300 leading-relaxed">{insight.content}</p>
                            </div>
                            {index < aiInsights.length - 1 && <div className="h-px w-full bg-white/5" />}
                          </React.Fragment>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-gray-500">
                          AI insights will appear here once the backend returns personalized analysis.
                        </div>
                      )}
                    </div>
                    <button onClick={() => setIsChatOpen(true)} className="w-full mt-6 py-3.5 rounded-xl bg-[#8B5CF6]/10 text-[#A78BFA] text-sm font-medium hover:bg-[#8B5CF6]/20 transition-colors border border-[#8B5CF6]/30 relative z-10 shrink-0">
                      Ask Kura AI
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex flex-col h-full">
                    <div className="p-4 border-b border-white/5 flex items-center gap-3 shrink-0 bg-[#1A1A24]/50 backdrop-blur-md z-10">
                      <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">←</button>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.4)]"><span className="text-[10px]">✨</span></div>
                        <span className="font-bold text-white text-sm">Kura AI</span>
                      </div>
                    </div>
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar relative z-10">
                      {messages.length > 0 ? (
                        messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#8B5CF6] text-white rounded-br-sm' : 'bg-white/5 text-gray-300 border border-white/5 rounded-bl-sm'}`}>{msg.content}</div>
                          </div>
                        ))
                      ) : (
                        <div className="flex h-full items-center justify-center text-center text-gray-500 text-sm px-6">
                          No chat history yet. Messages will appear here after backend data is available.
                        </div>
                      )}
                    </div>
                    <div className="p-4 pt-2 shrink-0 bg-gradient-to-t from-[#0B0B0F] to-transparent z-10">
                      <form onSubmit={handleSendMessage} className="relative flex items-center">
                        <input type="text" name="finance-chat" autoComplete="off" placeholder="Ask about your finances..." value={inputText} onChange={(e) => setInputText(e.target.value)} className="w-full bg-[#1A1A24] border border-white/10 rounded-full py-3 pl-5 pr-12 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 transition-all shadow-inner" />
                        <button type="submit" disabled={!inputText.trim()} className="absolute right-2 w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white disabled:opacity-50 disabled:bg-gray-700 transition-colors">↑</button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <TransactionsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        transactions={displayTransactions}
        accountName={selectedAccount?.name || 'All Accounts'}
      />
    </div>
  );
}